#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = process.cwd();
const reportPath = path.join(workspace, ".runtime/qa/worktree-status.json");

const [status, branch, head, originMain, upstreamResult] = await Promise.all([
  run("git", ["status", "--porcelain=v1", "--branch"]),
  run("git", ["branch", "--show-current"]),
  run("git", ["rev-parse", "HEAD"]),
  run("git", ["rev-parse", "--verify", "origin/main"]),
  run("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]),
]);

const porcelain = status.stdout.split("\n").filter(Boolean);
const dirty = porcelain.filter((line) => !line.startsWith("## "));
const upstream = upstreamResult.status === 0 ? upstreamResult.stdout.trim() : "";
const aheadBehind = upstream ? await run("git", ["rev-list", "--left-right", "--count", `${upstream}...HEAD`]) : { stdout: "" };
const [behind = "0", ahead = "0"] = aheadBehind.stdout.trim().split(/\s+/);

const report = {
  generatedAt: new Date().toISOString(),
  workspace,
  branch: branch.stdout.trim(),
  upstream,
  head: head.stdout.trim(),
  originMain: originMain.stdout.trim(),
  clean: dirty.length === 0,
  dirtyCount: dirty.length,
  dirty,
  ahead: Number(ahead || 0),
  behind: Number(behind || 0),
};

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, reportPath: path.relative(workspace, reportPath) }, null, 2));
if (!report.clean) process.exit(1);

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
