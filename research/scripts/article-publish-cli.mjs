import { spawn } from "node:child_process";
import path from "node:path";

const workspace = process.cwd();
const workflowScript = path.join(workspace, "research/scripts/article-publish-workflow.mjs");
const args = process.argv.slice(2);
const { code, stdout } = await runChild();
const result = parseTrailingJson(stdout);
process.exitCode = result && typeof result.ok === "boolean" ? (result.ok ? 0 : 1) : (code ?? 1);

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
      process.stderr.write(`${error.message}\n`);
      resolve({ code: 1, stdout });
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout });
    });
  });
}
