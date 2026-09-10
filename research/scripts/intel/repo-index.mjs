import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

async function readInput(root, relativePath, { optional = false, json = false, shape } = {}) {
  let text;
  try { text = await fs.readFile(path.join(root, relativePath), "utf8"); }
  catch (error) {
    if (optional && error.code === "ENOENT") return { value: [], revision: { path: relativePath, present: false } };
    throw new Error(`ERR_REPOSITORY_INDEX: cannot read ${relativePath}`, { cause: error });
  }
  let value = text;
  if (json) {
    try { value = JSON.parse(text); }
    catch (error) { throw new Error(`ERR_REPOSITORY_INDEX: invalid JSON in ${relativePath}`, { cause: error }); }
  }
  if (shape && !shape(value)) throw new Error(`ERR_REPOSITORY_INDEX: invalid shape in ${relativePath}`);
  return { value, revision: { path: relativePath, present: true, sha256: crypto.createHash("sha256").update(text).digest("hex") } };
}

export async function buildRepositoryIndexes(root = process.cwd()) {
  const inputs = await Promise.all([
    readInput(root, "research/news-review/approved-development-news.json", { json: true, shape: Array.isArray }),
    readInput(root, "src/data/importedUpdates.json", { optional: true, json: true, shape: Array.isArray }),
    readInput(root, "content/overrides/project-fact-overrides.json", { json: true, shape: (v) => v && typeof v === "object" && !Array.isArray(v) && v.projects && typeof v.projects === "object" && !Array.isArray(v.projects) }),
    readInput(root, "src/data/approvedExternalNews.ts", { shape: (v) => v.trim().length > 0 }),
    readInput(root, ".runtime/intel/open-pr-index.json", { optional: true, json: true, shape: Array.isArray }),
  ]);
  const [approved, imported, reviewedFacts, generatedNews, runtimeOpenPrIndex] = inputs.map((input) => input.value);
  const facts = JSON.stringify(reviewedFacts);
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
  return { approved, imported, reviewed_facts: reviewedFacts, facts_text: facts, generated_news_text: generatedNews, public_corpus: publicCorpus, events, open_prs: runtimeOpenPrIndex, source_revisions: inputs.map((input) => input.revision) };
}
