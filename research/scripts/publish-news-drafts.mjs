import { spawnSync } from "node:child_process";
import {
  approvedNewsPath,
  eligibleForAutoPublish,
  publicNewsRecordFromDraft,
  readAutomationConfig,
  readDraftStore,
  readJsonFile,
  writeDraftStore,
  writeJsonFile,
  workspace,
} from "./news-draft-utils.mjs";

async function main() {
  const config = await readAutomationConfig();
  const store = await readDraftStore();
  const approved = await readJsonFile(approvedNewsPath, []);
  const seen = new Set(approved.map((item) => item.canonicalUrl || item.sourceUrl));
  const manualIds = new Set(valueForArg("--ids").split(",").map((item) => item.trim()).filter(Boolean));
  const today = new Date().toISOString().slice(0, 10);
  const alreadyPublishedToday = store.items.filter((item) => item.publishedAt?.startsWith(today)).length;
  const limit = Math.max(0, Number(config.maxAutoPublishedPerDay ?? 3) - alreadyPublishedToday);
  const selected = manualIds.size
    ? store.items.filter((item) => manualIds.has(item.id) && item.approvedForPublication && item.approvedBy === "Brooke" && item.approvedAt && item.status !== "published")
    : store.items.filter((item) => eligibleForAutoPublish(item, config)).slice(0, limit);

  if (!selected.length) {
    console.log(JSON.stringify({ published: 0, approvedNews: "research/news-review/approved-development-news.json" }, null, 2));
    return;
  }

  for (const item of selected) {
    if (seen.has(item.sourceUrl)) {
      item.status = "published";
      item.publishedAt = item.publishedAt || new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      continue;
    }
    approved.push(publicNewsRecordFromDraft(item));
    seen.add(item.sourceUrl);
    item.status = "published";
    item.publishedAt = new Date().toISOString();
    item.updatedAt = item.publishedAt;
  }

  await writeJsonFile(approvedNewsPath, approved);
  await writeDraftStore(store);

  const promoted = spawnSync("npm", ["run", "news:promote"], { cwd: workspace, stdio: "inherit" });
  if (promoted.status !== 0) process.exit(promoted.status ?? 1);

  console.log(JSON.stringify({ published: selected.length, approvedNews: "research/news-review/approved-development-news.json" }, null, 2));
}

function valueForArg(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
