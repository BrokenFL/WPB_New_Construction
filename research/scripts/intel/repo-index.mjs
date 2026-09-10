import fs from "node:fs/promises";
import path from "node:path";

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return fallback; }
}
async function readText(file) { try { return await fs.readFile(file, "utf8"); } catch { return ""; } }

export async function buildRepositoryIndexes(root = process.cwd()) {
  const approved = await readJson(path.join(root, "research/news-review/approved-development-news.json"), []);
  const imported = await readJson(path.join(root, "src/data/importedUpdates.json"), []);
  const facts = await readText(path.join(root, "src/data/projectFactOverrides.ts"));
  const generatedNews = await readText(path.join(root, "src/data/approvedExternalNews.ts"));
  const publicCorpus = [JSON.stringify(approved), JSON.stringify(imported), facts, generatedNews].join("\n");
  const events = [];
  for (const item of approved) {
    const title = String(item.title || item.headline || "").toLowerCase();
    const projects = item.relatedProjectIds || item.relatedProjectSlugs || [];
    const eventDate = String(item.eventDate || item.sourcePublishedDate || item.sourcePublishedAt || "").slice(0, 10);
    if (title.includes("south flagler") && /top|topping/.test(title)) events.push({ event_key: "project|south-flagler-house|construction|topping-out|2025-11", source: "approved-development-news", id: item.id });
    if (title.includes("464 fern") && /file|plan/.test(title)) events.push({ event_key: "project|464-fern-street|municipal|site-plan-filing|2026-08-20", source: "approved-development-news", id: item.id });
    if (projects.length === 1 && eventDate && item.category) events.push({ event_key: `project|${projects[0]}|${item.category}|development-update|${eventDate}`, source: "approved-development-news", id: item.id });
  }
  const runtimeOpenPrIndex = await readJson(path.join(root, ".runtime/intel/open-pr-index.json"), []);
  return { approved, imported, facts_text: facts, generated_news_text: generatedNews, public_corpus: publicCorpus, events, open_prs: runtimeOpenPrIndex };
}
