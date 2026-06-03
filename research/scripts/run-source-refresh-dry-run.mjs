#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = process.cwd();
const reportPath = path.join(workspace, ".runtime/qa/source-refresh-dry-run.json");

const startStatus = await git(["status", "--porcelain"]);
if (startStatus.stdout.trim()) {
  await writeReport({
    generatedAt: new Date().toISOString(),
    status: "blocked",
    reason: "Worktree must be clean before source refresh dry-run.",
    dirty: startStatus.stdout.trim().split("\n"),
  });
  console.error("Source refresh dry-run blocked because the worktree is dirty.");
  process.exit(1);
}

const refresh = await run("npm", ["run", "research:site-intelligence"]);
const changed = await changedPaths();
const diffStat = changed.length ? await git(["diff", "--stat", "--", ...changed]) : { stdout: "" };
const diffNameStatus = changed.length ? await git(["diff", "--name-status", "--", ...changed]) : { stdout: "" };

await writeReport({
  generatedAt: new Date().toISOString(),
  status: refresh.status === 0 ? "completed" : "failed",
  refreshExitCode: refresh.status,
  changedCount: changed.length,
  changed,
  diffStat: diffStat.stdout.trim(),
  diffNameStatus: diffNameStatus.stdout.trim(),
});

if (changed.length) await git(["restore", "--", ...changed]);
const endStatus = await git(["status", "--porcelain"]);
if (endStatus.stdout.trim()) {
  console.error("Source refresh dry-run could not restore the worktree cleanly.");
  console.error(endStatus.stdout);
  process.exit(1);
}

console.log(JSON.stringify({
  sourceRefreshDryRun: refresh.status === 0 ? "completed" : "failed",
  changedCount: changed.length,
  reportPath: path.relative(workspace, reportPath),
}, null, 2));
process.exit(refresh.status);

async function changedPaths() {
  const status = await git(["status", "--porcelain"]);
  return status.stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/^.* -> /, ""))
    .filter(Boolean);
}

async function writeReport(report) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function git(args) {
  return run("git", args);
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => resolve({ status: 1, stdout, stderr: stderr || error.message }));
    child.on("close", (status) => resolve({ status: status ?? 1, stdout, stderr }));
  });
}
