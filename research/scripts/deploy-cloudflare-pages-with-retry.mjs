import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { verifyProductionMapBundle } from "./production-map-preflight.mjs";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const wranglerVersion = process.env.WRANGLER_VERSION?.trim() || "4.93.0";
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT?.trim() || "wpbnewconstruction";
const retryDelays = [30_000, 60_000, 120_000, 240_000, 300_000];
const maxAttempts = retryDelays.length;
const args = new Set(process.argv.slice(2));
const skipChecks = args.has("--skip-checks") || process.env.SHIP_LIVE_SKIP_CHECKS === "1";

async function main() {
  console.log(`Cloudflare Pages deploy: ${projectName}`);
  console.log(`Wrangler version: pinned wrangler@${wranglerVersion}`);

  await runPreflight();
  await stripDeployJunk();
  console.log(JSON.stringify(await verifyProductionMapBundle(distRoot)));
  await printLocalBundles();
  const beforeBundles = await printLiveBundles("before deploy");
  await printCloudflareDiagnostics();
  await deployWithRetry();
  const afterBundles = await printLiveBundles("after deploy");
  compareLiveBundles(beforeBundles, afterBundles);
}

async function runPreflight() {
  if (skipChecks) {
    console.log("Skipping build and QA checks because SHIP_LIVE_SKIP_CHECKS=1 or --skip-checks was provided.");
    return;
  }
  await runCommand("npm", ["run", "build"], { retryable: false });
  await runCommand("npm", ["run", "qa:launch:no-write"], { retryable: false });
  await runCommand("npm", ["run", "qa:gatekeeper"], { retryable: false });
}

async function stripDeployJunk() {
  const junkPatterns = [/^\.DS_Store$/i, /^\._/, /^__MACOSX$/i, /^Thumbs\.db$/i, /^desktop\.ini$/i, /~$/, /\.(?:tmp|temp)$/i];
  const files = await listFiles(distRoot);
  const removed = [];
  await Promise.all(
    files.map(async (file) => {
      const name = path.basename(file);
      if (!junkPatterns.some((pattern) => pattern.test(name))) return;
      await fs.rm(file, { force: true });
      removed.push(path.relative(workspace, file));
    }),
  );
  console.log(`Deploy cleanup removed ${removed.length} junk file${removed.length === 1 ? "" : "s"}.`);
  removed.forEach((file) => console.log(`- ${file}`));
}

async function deployWithRetry() {
  let lastFailure = null;
  for (let index = 0; index < maxAttempts; index += 1) {
    console.log(`Cloudflare deploy attempt ${index + 1}/${maxAttempts}...`);
    const result = await runCommand(
      "npx",
      ["--yes", `wrangler@${wranglerVersion}`, "pages", "deploy", "dist", "--project-name", projectName],
      { retryable: true },
    );
    if (result.status === 0) return;

    lastFailure = result;
    if (!isTransientCloudflareFailure(result.output)) {
      throw new Error(`Cloudflare deploy failed with a non-retryable error.\n${result.output}`);
    }
    console.error(`Transient Cloudflare deploy failure detected on attempt ${index + 1}.`);
    if (index < maxAttempts - 1) {
      const delayMs = retryDelays[index];
      console.log(`Waiting ${Math.round(delayMs / 1000)}s before retry ${index + 2}/${maxAttempts}...`);
      await sleep(delayMs);
    }
  }

  throw new Error(`Cloudflare API remained unhealthy after ${maxAttempts} attempts.\n${lastFailure?.output ?? ""}`);
}

async function printLocalBundles() {
  const html = await fs.readFile(path.join(distRoot, "index.html"), "utf8").catch(() => "");
  console.log("Local dist bundles:");
  printBundles(html);
}

async function printLiveBundles(label = "current") {
  const response = await fetch("https://www.wpbnewconstruction.com/", { redirect: "follow" });
  const html = await response.text();
  console.log(`Live homepage status ${label}: ${response.status}`);
  console.log(`Live homepage bundles ${label}:`);
  return printBundles(html);
}

function printBundles(html) {
  const js = [...html.matchAll(/\/assets\/index-[^"]+\.js/g)].map((match) => match[0]);
  const css = [...html.matchAll(/\/assets\/index-[^"]+\.css/g)].map((match) => match[0]);
  console.log(`JS: ${js[0] ?? "not found"}`);
  console.log(`CSS: ${css[0] ?? "not found"}`);
  return { js: js[0] ?? "", css: css[0] ?? "" };
}

function compareLiveBundles(before, after) {
  if (!before || !after) return;
  const changed = before.js !== after.js || before.css !== after.css;
  if (changed) {
    console.log(`Live bundle changed: JS ${before.js || "not found"} -> ${after.js || "not found"}, CSS ${before.css || "not found"} -> ${after.css || "not found"}`);
  } else {
    console.log("Live bundle did not change after deploy. This can be acceptable if live already matched the local build; do not treat this as proof of a new live update.");
  }
}

async function printCloudflareDiagnostics() {
  console.log("Cloudflare diagnostics:");
  await runDiagnostic(["--yes", `wrangler@${wranglerVersion}`, "pages", "project", "list"]);
  await runDiagnostic(["--yes", `wrangler@${wranglerVersion}`, "pages", "deployment", "list", "--project-name", projectName]);
}

async function runDiagnostic(commandArgs) {
  const result = await runCommand("npx", commandArgs, { retryable: true, quietFailure: true });
  if (result.status !== 0) {
    console.log(`Diagnostic unavailable: npx ${commandArgs.join(" ")}`);
  }
}

async function runCommand(command, commandArgs, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: workspace,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });
    child.on("error", reject);
    child.on("close", (status) => {
      const inferredStatus = status === 0 && hasWranglerErrorOutput(output) ? 1 : (status ?? 1);
      const result = { status: inferredStatus, output };
      if (!options.retryable && result.status !== 0) reject(new Error(output || `${command} failed`));
      else resolve(result);
    });
  });
}

function isTransientCloudflareFailure(output) {
  return /\b(?:500|502|503|504)\b/i.test(output) || /assets\/upload|asset upload|internal error|service unavailable/i.test(output);
}

function hasWranglerErrorOutput(output) {
  return /\bERROR\b|Failed to upload files|could not be found|ENOENT|APIError/i.test(output);
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }),
  );
  return nested.flat();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
