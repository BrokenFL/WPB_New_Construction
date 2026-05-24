import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  eligibleForAutoPublish,
  readAutomationConfig,
  readDraftStore,
  workspace,
} from "./news-draft-utils.mjs";
import { ensureReportDir, qaNoWrite, qaReportPath } from "./qa-report-utils.mjs";

const repo = process.env.GITHUB_REPOSITORY || "BrokenFL/WPB_New_Construction";
const dryRun = process.argv.includes("--dry-run");
const allowDirty = process.env.NEWS_PROCESS_ALLOW_DIRTY === "1";
const reportPath = qaReportPath(workspace, "research/source-material-review/news-issue-importer-last-run.json");
const publicBaseUrl = "https://www.wpbnewconstruction.com";
const qaTasks = [
  ["typecheck", "npm", ["run", "typecheck"]],
  ["build", "npm", ["run", "build"]],
  ["lint", "npm", ["run", "lint"]],
  ["qa:news", "npm", ["run", "qa:news"]],
  ["qa:approved-news", "npm", ["run", "qa:approved-news"]],
  ["qa:homepage-visual", "npm", ["run", "qa:homepage-visual"]],
  ["qa:internal-links", "npm", ["run", "qa:internal-links"]],
  ["qa:launch", "npm", ["run", "qa:launch"]],
];
const allowedAutomationPaths = [
  "content/news-drafts.json",
  "content/newsletter-digest-drafts.json",
  "research/news-review/approved-development-news.json",
  "research/source-material-review/news-issue-importer-last-run.json",
  "research/source-material-review/news-publisher-report.md",
  "research/source-material-review/homepage-visual-flow-report.md",
  "research/source-material-review/image-repetition-audit.md",
  "research/source-material-review/launch-qa-report.md",
  "src/data/approvedExternalNews.ts",
];

const report = {
  generatedAt: new Date().toISOString(),
  repo,
  mode: dryRun ? "dry-run" : "publish",
  imported: 0,
  published: 0,
  heldForReview: 0,
  issues: [],
  publishedUrls: [],
  heldItems: [],
  qa: [],
  deploy: "not-run",
  githubAuth: "unknown",
  gitStartStatus: [],
};

async function main() {
  report.githubAuth = await githubAuthStatus();
  if (report.githubAuth !== "gh authenticated") {
    await finish(1, "GitHub auth is missing; run gh auth login before scheduled processing.");
    return;
  }

  const startStatus = await gitStatus();
  report.gitStartStatus = startStatus;
  if (startStatus.length && !allowDirty) {
    await finish(1, `Worktree is dirty before import; stopping before touching news issues. Dirty paths: ${startStatus.join(", ")}`);
    return;
  }

  const beforeStore = await readDraftStore();
  const beforeById = new Map(beforeStore.items.map((item) => [item.id, item]));
  const importReportPath = path.join(os.tmpdir(), `wpb-gpt-news-import-${Date.now()}.json`);
  const importResult = await runTask("news:import-gpt-issues", "npm", ["run", "news:import-gpt-issues", "--", ...(dryRun ? ["--dry-run"] : [])], {
    env: { ...process.env, GPT_NEWS_IMPORT_REPORT: importReportPath, ...(dryRun ? { GPT_NEWS_IMPORT_DRY_RUN: "1" } : {}) },
  });
  if (importResult.status !== 0) {
    report.qa.push({ name: "news:import-gpt-issues", status: "failed" });
    await finish(1, "Issue import failed.");
    return;
  }

  const importReport = await readJson(importReportPath, { issues: [] });
  await fs.rm(importReportPath, { force: true });
  const afterImportStore = await readDraftStore();
  const importedDrafts = afterImportStore.items.filter((item) => !beforeById.has(item.id));
  report.imported = importedDrafts.length;
  const config = await readAutomationConfig();
  const publishableBeforePublish = importedDrafts.filter((item) => eligibleForAutoPublish(item, config));
  const heldBeforePublish = importedDrafts.filter((item) => !eligibleForAutoPublish(item, config));
  const publishableQueuedDrafts = afterImportStore.items.filter((item) => eligibleForAutoPublish(item, config));

  if (dryRun) {
    report.published = publishableBeforePublish.length;
    report.heldForReview = heldBeforePublish.length + (importReport.issues || []).reduce((sum, issue) => sum + (issue.unimportedCount || 0), 0);
    report.publishedUrls = publishableBeforePublish.map(publicUrlFor);
    report.heldItems = heldBeforePublish.map((item) => itemLabel(item));
    report.deploy = "skipped: dry-run";
    await finish(0, "Dry-run completed without importing, commenting, labeling, publishing, QA, or deploy.");
    return;
  }

  if (!importedDrafts.length && !publishableQueuedDrafts.length) {
    for (const [name, command, args] of qaTasks) {
      const result = await runTask(name, command, args, { env: { ...process.env, QA_NO_WRITE: "1" } });
      report.qa.push({ name, status: result.status === 0 ? "passed" : "failed" });
      if (result.status !== 0) {
        await finish(1, `${name} failed; no publishable articles were available and deploy was skipped.`);
        return;
      }
    }
    const liveResult = await runTask("qa:live", "npm", ["run", "qa:live"]);
    report.qa.push({ name: "qa:live", status: liveResult.status === 0 ? "passed" : "failed" });
    report.deploy = "skipped: no GPT issues matched and no eligible queued drafts were available";
    await finish(liveResult.status === 0 ? 0 : 1, report.deploy);
    return;
  }

  const publishResult = await runTask("news:publish-eligible", "npm", ["run", "news:publish-eligible"]);
  if (publishResult.status !== 0) {
    report.qa.push({ name: "news:publish-eligible", status: "failed" });
    await commentAndLabel(importReport, [], heldBeforePublish, "publish failed before QA");
    await finish(1, "Publishing eligible drafts failed.");
    return;
  }

  const newsletterResult = await runTask("newsletter:draft", "npm", ["run", "newsletter:draft"]);
  if (newsletterResult.status !== 0) {
    report.qa.push({ name: "newsletter:draft", status: "failed" });
    await commentAndLabel(importReport, [], heldBeforePublish, "newsletter draft failed");
    await finish(1, "Newsletter draft generation failed.");
    return;
  }

  const afterPublishStore = await readDraftStore();
  const afterById = new Map(afterPublishStore.items.map((item) => [item.id, item]));
  const publishedDrafts = importedDrafts
    .map((item) => afterById.get(item.id) || item)
    .filter((item) => item.status === "published");
  const heldDrafts = importedDrafts
    .map((item) => afterById.get(item.id) || item)
    .filter((item) => item.status !== "published");
  report.published = publishedDrafts.length;
  report.heldForReview = heldDrafts.length;
  report.publishedUrls = publishedDrafts.map(publicUrlFor);
  report.heldItems = heldDrafts.map((item) => itemLabel(item));

  await commentAndLabel(importReport, publishedDrafts, heldDrafts, "pending QA");

  for (const [name, command, args] of qaTasks) {
    const result = await runTask(name, command, args, { env: { ...process.env, QA_NO_WRITE: "1" } });
    report.qa.push({ name, status: result.status === 0 ? "passed" : "failed" });
    if (result.status !== 0) {
      await commentAndLabel(importReport, publishedDrafts, heldDrafts, "QA failed; deploy skipped");
      await finish(1, `${name} failed; deploy skipped.`);
      return;
    }
  }

  const changed = await changedPaths();
  const unexpected = changed.filter((file) => !allowedAutomationPaths.includes(file));
  if (unexpected.length && !allowDirty) {
    await commentAndLabel(importReport, publishedDrafts, heldDrafts, "unexpected dirty files; deploy skipped");
    await finish(1, `Unexpected dirty files after news processing; deploy skipped. Dirty paths: ${unexpected.join(", ")}`);
    return;
  }

  if (!publishedDrafts.length) {
    const liveResult = await runTask("qa:live", "npm", ["run", "qa:live"]);
    report.qa.push({ name: "qa:live", status: liveResult.status === 0 ? "passed" : "failed" });
    report.deploy = "skipped: no eligible low-risk articles were published";
    await commentAndLabel(importReport, publishedDrafts, heldDrafts, report.deploy);
    await finish(liveResult.status === 0 ? 0 : 1, report.deploy);
    return;
  }

  const deployResult = await runTask("deploy:live", "npm", ["run", "deploy:live"]);
  if (deployResult.status !== 0) {
    report.deploy = "failed";
    await commentAndLabel(importReport, publishedDrafts, heldDrafts, "Cloudflare deploy failed");
    await finish(1, "Cloudflare deploy failed.");
    return;
  }
  const liveResult = await runTask("qa:live", "npm", ["run", "qa:live"]);
  report.qa.push({ name: "qa:live", status: liveResult.status === 0 ? "passed" : "failed" });
  report.deploy = liveResult.status === 0 ? "deployed and live QA passed" : "deployed but live QA failed";
  await commentAndLabel(importReport, publishedDrafts, heldDrafts, report.deploy);
  await finish(liveResult.status === 0 ? 0 : 1, report.deploy);
}

async function githubAuthStatus() {
  const result = await runCommand("gh", ["auth", "status", "-h", "github.com"], { quiet: true });
  return result.status === 0 ? "gh authenticated" : "missing";
}

async function gitStatus() {
  const result = await runCommand("git", ["status", "--porcelain"], { quiet: true });
  return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

async function changedPaths() {
  const result = await runCommand("git", ["status", "--porcelain"], { quiet: true });
  return result.stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/^.* -> /, ""));
}

async function runTask(label, command, args, options = {}) {
  console.log(`Running ${label}...`);
  return runCommand(command, args, { env: options.env });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: workspace,
      env: options.env || process.env,
      stdio: options.quiet ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => resolve({ status: 1, stdout, stderr: stderr || error.message }));
    child.on("close", (status) => resolve({ status: status ?? 1, stdout, stderr }));
  });
}

async function readJson(filePath, fallback) {
  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  return raw.trim() ? JSON.parse(raw) : fallback;
}

async function commentAndLabel(importReport, publishedDrafts, heldDrafts, deployStatus) {
  const byIssue = new Map();
  for (const issue of importReport.issues || []) {
    byIssue.set(issue.number, { issue, published: [], held: [], unimportedHeld: issue.unimportedItems || [] });
  }
  for (const item of publishedDrafts) {
    const number = item.importedFromIssue?.number;
    if (byIssue.has(number)) byIssue.get(number).published.push(item);
  }
  for (const item of heldDrafts) {
    const number = item.importedFromIssue?.number;
    if (byIssue.has(number)) byIssue.get(number).held.push(item);
  }

  report.issues = [...byIssue.values()].map(({ issue, published, held, unimportedHeld }) => ({
    number: issue.number,
    imported: issue.importedCount || 0,
    published: published.length,
    heldForReview: held.length + unimportedHeld.length,
  }));

  for (const { issue, published, held, unimportedHeld } of byIssue.values()) {
    if (!issue.candidateCount && !issue.importedCount && !published.length && !held.length && !unimportedHeld.length) continue;
    const qaLines = report.qa.length
      ? report.qa.map((item) => `${item.name}: ${item.status}`)
      : ["pending"];
    const body = [
      `Imported: ${issue.importedCount || 0}`,
      `Published: ${published.length}`,
      `Held for review: ${held.length + unimportedHeld.length}`,
      "Published URLs:",
      ...listOrDash(published.map(publicUrlFor)),
      "Held items:",
      ...listOrDash([...held.map(itemLabel), ...unimportedHeld.map((item) => `${item.title} (${item.reason})`)]),
      "QA:",
      ...qaLines.map((line) => `- ${line}`),
      "Deploy:",
      `- ${deployStatus}`,
    ].join("\n");
    await gh(["issue", "comment", String(issue.number), "--repo", repo, "--body", body]);
    await addLabel(issue.number, "codex-imported");
    if (published.length) await addLabel(issue.number, "codex-published");
    if (held.length || unimportedHeld.length) await addLabel(issue.number, "needs-review");
  }
}

function listOrDash(items) {
  return items.length ? items.map((item) => `- ${item}`) : ["- none"];
}

async function addLabel(number, label) {
  await ensureLabel(label);
  await gh(["issue", "edit", String(number), "--repo", repo, "--add-label", label]);
}

async function ensureLabel(label) {
  const color = label === "needs-review" ? "d93f0b" : label === "codex-published" ? "0e8a16" : "ededed";
  await gh(["label", "create", label, "--repo", repo, "--color", color], true);
}

async function gh(args, allowFailure = false) {
  const result = await runCommand("gh", args, { quiet: true });
  if (result.status !== 0 && !allowFailure && !/already exists/i.test(result.stderr)) {
    console.error(result.stderr || result.stdout || `gh ${args.join(" ")} failed`);
  }
  return result;
}

function publicUrlFor(item) {
  const slug = item.slug || item.id;
  return `${publicBaseUrl}/updates/${slug}/`;
}

function itemLabel(item) {
  const reason = item.riskLevel && item.riskLevel !== "low" ? `${item.riskLevel} risk` : "not eligible for automatic publishing";
  return `${item.rewrittenHeadline || item.sourceTitle || item.id} (${reason})`;
}

async function finish(status, message) {
  report.finishedAt = new Date().toISOString();
  report.status = status === 0 ? "passed" : "failed";
  report.message = message;
  await ensureReportDir(reportPath);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${message}${qaNoWrite ? ` Report written to ${path.relative(workspace, reportPath)}.` : ""}`);
  process.exit(status);
}

main().catch(async (error) => {
  await finish(1, error.message || String(error));
});
