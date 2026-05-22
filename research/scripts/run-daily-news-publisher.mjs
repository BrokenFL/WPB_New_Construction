import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const reportPath = path.join(workspace, "research/source-material-review/news-publisher-report.md");
const taskTimeoutMs = Number(process.env.NEWS_PUBLISHER_TASK_TIMEOUT_MS ?? 180_000);
const tasks = [
  ["import GPT news issue drafts", "npm", ["run", "news:import-gpt"]],
  ["validate news drafts", "npm", ["run", "qa:news"]],
  ...dryRun ? [] : [["publish eligible queued low-risk news", "npm", ["run", "news:publish-queued"]]],
  ["generate newsletter digest draft", "npm", ["run", "newsletter:draft"]],
  ["check approved news surface", "npm", ["run", "qa:approved-news"]],
  ["check news image mapping", "npm", ["run", "qa:news-images"]],
  ["check public JSON safety", "npm", ["run", "qa:public-json"]],
  ["check content studio safety", "npm", ["run", "qa:content-studio"]],
];

const results = [];
for (const [label, command, args] of tasks) {
  results.push(await runTask(label, command, args));
}

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, renderReport(results));
console.log(`News publisher report written to ${path.relative(workspace, reportPath)}`);

const failed = results.filter((item) => item.status !== 0);
if (failed.length) process.exit(1);

function renderReport(items) {
  const timestamp = new Date().toISOString();
  const mode = dryRun ? "dry-run" : "publish";
  return `# News Publisher Report

Generated: ${timestamp}

Mode: ${mode}

## Scripts Run

${items.map((item) => `- ${item.label}: ${item.status === 0 ? "passed" : `needs attention (${item.status})`}`).join("\n")}

## Publishing Rules

- High-risk drafts are review-first and are not auto-published by \`news:publish-queued\`.
- Dry-run mode skips the publish step but still imports/validates drafts and refreshes the newsletter digest.
- Publish mode only promotes drafts that pass \`eligibleForAutoPublish\` in \`research/scripts/news-draft-utils.mjs\`.

## Review Targets

- News Desk drafts: \`content/news-drafts.json\`
- Newsletter drafts: \`content/newsletter-digest-drafts.json\`
- Approved external news: \`research/news-review/approved-development-news.json\`
`;
}

function runTask(label, command, args) {
  console.log(`Running: ${label}`);
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace, env: process.env, stdio: "inherit" });
    const timeout = setTimeout(() => {
      console.error(`${label} exceeded ${Math.round(taskTimeoutMs / 1000)}s and was stopped so the publisher report can continue.`);
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
