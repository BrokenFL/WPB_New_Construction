import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  newsletterDraftsPath,
  readDraftStore,
  readJsonFile,
  workspace,
} from "./news-draft-utils.mjs";

const runtimeDir = path.join(workspace, ".runtime/qa");
const reportPath = path.join(runtimeDir, "news-review-queue-report.md");
const sourceConfigPath = path.join(workspace, "content/news-source-config.json");
const candidatesPath = path.join(workspace, "research/news-review/development-news-candidates.json");

async function main() {
  await fs.mkdir(runtimeDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const steps = [];

  const sourceConfig = await readJsonFile(sourceConfigPath, { primarySources: [], leadFamilies: [], dailyTarget: 2 });
  const restoreFiles = await snapshotFiles([candidatesPath, newsletterDraftsPath]);

  steps.push(runStep("news:fetch", ["run", "news:fetch"]));
  const candidates = await readJsonFile(candidatesPath, []);
  const store = await readDraftStore();
  steps.push(runStep("newsletter:draft", ["run", "newsletter:draft"]));
  steps.push(runStep("qa:news", ["run", "qa:news"]));
  await restoreSnapshot(restoreFiles);

  const reviewItems = (store.items ?? [])
    .filter((item) => item.status !== "published" && item.status !== "archived")
    .slice(0, 8);
  const candidateItems = Array.isArray(candidates) ? candidates.slice(0, 8) : [];

  const report = [
    "# WPB Morning News Review Queue",
    "",
    `Generated: ${startedAt}`,
    "",
    "## Mode",
    "",
    "- Review-only. No public feed promotion, commit, push, deploy, or live QA was run.",
    `- Daily target: ${sourceConfig.dailyTarget ?? 2} review-ready articles.`,
    "",
    "## Source Set",
    "",
    ...(sourceConfig.primarySources ?? []).map((source) => `- ${source.name}: ${source.url}`),
    "",
    "## Lead Families",
    "",
    ...(sourceConfig.leadFamilies ?? []).map((query) => `- ${query}`),
    "",
    "## Script Checks",
    "",
    ...steps.map((step) => `- ${step.name}: ${step.status === 0 ? "passed" : `failed (${step.status})`}`),
    "",
    "## Current Drafts Needing Review",
    "",
    ...(reviewItems.length ? reviewItems.map((item) => `- ${item.rewrittenHeadline || item.sourceTitle || item.id} | ${item.status} | ${item.riskLevel || "unknown risk"} | ${item.sourceName || "source unknown"}`) : ["- No existing draft items are waiting in content/news-drafts.json."]),
    "",
    "## Fresh Candidates From Fetch",
    "",
    ...(candidateItems.length ? candidateItems.map((item) => `- ${item.title || item.sourceTitle || item.id} | ${item.sourceName || item.publisher || "source unknown"} | ${item.canonicalUrl || item.sourceUrl || item.link || "no url"}`) : ["- No candidates were fetched by the local RSS/search script. Codex morning research should browse the source set directly."]),
    "",
    "## Brooke Review Checklist",
    "",
    "- Pick up to two article leads.",
    "- Confirm at least one supporting source for each lead.",
    "- Rewrite in WPB Development Desk voice.",
    "- Attach an approved local image candidate or generated-image prompt.",
    "- Mark publish, revise, generate image, hold, or discard.",
    "",
  ].join("\n");

  await fs.writeFile(reportPath, report);
  const failed = steps.find((step) => step.status !== 0);
  console.log(JSON.stringify({ reportPath, steps, reviewItems: reviewItems.length, candidates: candidateItems.length }, null, 2));
  if (failed) process.exit(failed.status || 1);
}

function runStep(name, args) {
  const result = spawnSync("npm", args, { cwd: workspace, stdio: "inherit", env: { ...process.env, QA_NO_WRITE: "1" } });
  return { name, status: result.status ?? 1 };
}

async function snapshotFiles(files) {
  const snapshots = [];
  for (const file of files) {
    const content = await fs.readFile(file, "utf8").catch((error) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    });
    snapshots.push({ file, content });
  }
  return snapshots;
}

async function restoreSnapshot(snapshots) {
  for (const snapshot of snapshots) {
    if (snapshot.content === undefined) {
      await fs.rm(snapshot.file, { force: true });
    } else {
      await fs.mkdir(path.dirname(snapshot.file), { recursive: true });
      await fs.writeFile(snapshot.file, snapshot.content);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
