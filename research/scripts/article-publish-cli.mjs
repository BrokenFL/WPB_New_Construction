import { spawn } from "node:child_process";
import path from "node:path";

const workspace = process.cwd();
const workflowScript = path.join(workspace, "research/scripts/article-publish-workflow.mjs");
const args = process.argv.slice(2);
let activeChild = null;
let forwardedSignal = "";
process.once("SIGINT", () => forwardSignal("SIGINT"));
process.once("SIGTERM", () => forwardSignal("SIGTERM"));
const { code, stdout } = await runChild();
const result = parseTrailingJson(stdout);
process.exitCode = forwardedSignal === "SIGINT"
  ? 130
  : forwardedSignal === "SIGTERM"
    ? 143
    : result && typeof result.ok === "boolean"
      ? (result.ok ? 0 : 1)
      : (code ?? 1);

function parseTrailingJson(output) {
  const text = String(output || "").trimEnd();
  if (!text) return null;
  const end = text.lastIndexOf("}");
  if (end === -1) return null;
  for (let start = text.lastIndexOf("{", end); start >= 0; start = text.lastIndexOf("{", start - 1)) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }
  return null;
}

function runChild() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [workflowScript, ...args], {
      cwd: workspace,
      stdio: ["ignore", "pipe", "pipe"],
    });
    activeChild = child;

    let stdout = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      activeChild = null;
      process.stderr.write(`${error.message}\n`);
      resolve({ code: 1, stdout });
    });

    child.on("close", (code) => {
      activeChild = null;
      resolve({ code: code ?? 1, stdout });
    });
  });
}

function forwardSignal(signalName) {
  if (forwardedSignal) return;
  forwardedSignal = signalName;
  if (!activeChild) return;
  try {
    activeChild.kill(signalName);
  } catch (error) {
    process.stderr.write(`Could not forward ${signalName} to article workflow: ${error.message}\n`);
  }
}
