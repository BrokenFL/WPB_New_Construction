import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = process.cwd();
const reportPath = path.join(workspace, "research/source-material-review/daily-maintenance-report.md");
const taskTimeoutMs = Number(process.env.DAILY_MAINTENANCE_TASK_TIMEOUT_MS ?? 180_000);
const tasks = [
  ["import GPT news issue drafts", "npm", ["run", "news:import-gpt"]],
  ["validate news drafts", "npm", ["run", "qa:news"]],
  ["publish eligible queued low-risk news", "npm", ["run", "news:publish-queued"]],
  ["generate newsletter digest draft", "npm", ["run", "newsletter:draft"]],
  ["import developer/project images", "npm", ["run", "import:developer-images"]],
  ["review imported developer/project images", "npm", ["run", "review:developer-images"]],
  ["check news/update sources", "npm", ["run", "news:fetch"]],
  ["check imported project updates", "npm", ["run", "check:updates"]],
  ["check stale public copy", "npm", ["run", "qa:copy"]],
  ["check image repetition and placement", "npm", ["run", "qa:image-repetition"]],
  ["check asset/performance budgets", "npm", ["run", "qa:performance"]],
  ["inventory duplicate assets", "npm", ["run", "assets:duplicates"]],
  ["run launch QA", "npm", ["run", "qa:launch"]],
];

const results = [];
for (const [label, command, args] of tasks) {
  results.push(await runTask(label, command, args));
}

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, renderReport(results));
console.log(`Daily maintenance report written to ${path.relative(workspace, reportPath)}`);

function renderReport(items) {
  const timestamp = new Date().toISOString();
  const failed = items.filter((item) => item.status !== 0);
  return `# Daily Maintenance Report

Generated: ${timestamp}

## Scripts Run

${items.map((item) => `- ${item.label}: ${item.status === 0 ? "passed" : `needs attention (${item.status})`}`).join("\n")}

## New Images Found

Review \`research/imported-project-images/importedProjectImages.json\` and \`research/source-material-review/imported-project-images-review.md\` after the image import/review steps.

## New News Found

Review \`content/news-drafts.json\` and \`research/news-review/development-news-candidates.json\`. GPT issue drafts land in the News Desk first. High-risk items remain review-first and cannot auto-publish.

## Stale Copy Flags

${resultSummary(items, "check stale public copy")}

## Missing Resources

Review team/developer/designer/architect gaps in \`docs/project-team-resource-imagery.md\` and the project image review files.

## Optimization Warnings

${resultSummary(items, "check asset/performance budgets")}

## Next Human Review Items

${failed.length ? failed.map((item) => `- Review ${item.label}; the command exited ${item.status}.`).join("\n") : "- No blocking maintenance findings from the safe daily checks."}
`;
}

function resultSummary(items, label) {
  const item = items.find((entry) => entry.label === label);
  if (!item) return "Not run.";
  if (item.status === 0) return "No blocking flags from this run.";
  return "The check needs review; see terminal output or rerun the named script.";
}

function runTask(label, command, args) {
  console.log(`Running: ${label}`);
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace, env: process.env, stdio: "inherit" });
    const timeout = setTimeout(() => {
      console.error(`${label} exceeded ${Math.round(taskTimeoutMs / 1000)}s and was stopped so the daily report can continue.`);
      child.kill("SIGTERM");
    }, taskTimeoutMs);
    child.on("error", (error) => {
      clearTimeout(timeout);
      console.error(error.message);
      resolve({ label, status: 1 });
    });
    child.on("close", (status) => {
      clearTimeout(timeout);
      resolve({ label, status: status ?? 1 });
    });
  });
}
