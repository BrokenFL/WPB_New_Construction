// PR-only, credential-free reproduction. No live cycle, dispatch or publisher.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

for (const key of ["P2_GOOGLE_SERVICE_ACCOUNT_JSON", "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID", "GH_TOKEN"]) assert.ok(!process.env[key], `Unexpected credential: ${key}`);
assert.equal(process.env.GITHUB_EVENT_NAME, "pull_request");
const cache = path.join(os.homedir(), ".cache/ms-playwright");
await assert.rejects(fs.access(cache), { code: "ENOENT" });
const root = process.cwd();
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-browser-recovery-"));
const calls = path.join(temporary, "installer-calls");
const env = { ...process.env, PATH: temporary + path.delimiter + process.env.PATH,
  WPB_INJECTED_APT_CALLS: calls };
let preview;
const run = (command, args, options = {}) => {
  console.log(`::group::${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd: root, env, stdio: "inherit", ...options });
  console.log("::endgroup::");
  assert.equal(result.status, 0, `${command} failed`);
};
try {
  const shim = '#!/bin/sh\nprintf "%s\\n" "$0 $*" >> "$WPB_INJECTED_APT_CALLS"\necho "Temporary failure resolving azure.archive.ubuntu.com" >&2\nexit 100\n';
  for (const name of ["sudo", "apt-get"]) await fs.writeFile(path.join(temporary, name), shim, { mode: 0o755 });
  const oldPath = spawnSync(process.execPath, ["node_modules/playwright/cli.js", "install-deps", "chromium"],
    { cwd: root, env, encoding: "utf8" });
  assert.notEqual(oldPath.status, 0, "The injected mirror outage must break the old installation path");
  assert.match(oldPath.stdout + oldPath.stderr, /Temporary failure resolving azure\.archive\.ubuntu\.com/);
  assert.ok((await fs.readFile(calls, "utf8")).trim());
  await fs.rm(calls);
  console.log(JSON.stringify({ injectedMirrorFailure: "reproduced", installerExit: oldPath.status }));
  run(process.execPath, ["research/scripts/check-ci-browser.mjs"]);
  const empty = path.join(temporary, "empty-browser-cache");
  await fs.mkdir(empty);
  const missing = spawnSync(process.execPath, ["research/scripts/check-ci-browser.mjs"],
    { cwd: root, env: { ...env, PLAYWRIGHT_BROWSERS_PATH: empty }, encoding: "utf8" });
  assert.notEqual(missing.status, 0, "Missing bundled browser must fail closed");
  console.log(JSON.stringify({ missingBrowserFailsClosed: true, restoredBrowserCache: false }));
  run("npm", ["run", "test:p2:fast"]);
  run("npm", ["run", "test:p2:shadow"]);
  run("npm", ["run", "typecheck"]);
  run("npm", ["run", "build"]);
  run("npm", ["test"]);
  run("npm", ["run", "test:leads"]);
  run("npm", ["run", "assets:audit"], { env: { ...env, QA_NO_WRITE: "1" } });
  preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview",
    "--host", "127.0.0.1", "--port", "4185", "--strictPort"], { cwd: root, env, stdio: "inherit" });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch("http://127.0.0.1:4185")).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Built preview must start");
  run("npm", ["run", "qa:live"], { env: { ...env, WPB_LIVE_BASE_URL: "http://127.0.0.1:4185" } });
  await assert.rejects(fs.access(calls), { code: "ENOENT" });
  run("git", ["diff", "--exit-code"]);
  console.log(JSON.stringify({ recoveryQA: "pass", runtimeAptOrSudoCalls: 0, cleanBrowserCache: true,
    liveCredentials: false, publication: false }));
} finally {
  preview?.kill("SIGTERM");
  await fs.rm(temporary, { recursive: true, force: true });
}
