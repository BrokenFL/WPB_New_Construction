import {
  approvedNewsPath,
  newsletterDraftsPath,
  readDraftStore,
  readJsonFile,
  writeJsonFile,
} from "./news-draft-utils.mjs";
import { qaNoWrite, qaReportPath } from "./qa-report-utils.mjs";

const workspace = process.cwd();
const noWrite = qaNoWrite;
const outputPath = noWrite ? qaReportPath(workspace, "content/newsletter-digest-drafts.json") : newsletterDraftsPath;

async function main() {
  const news = await readDraftStore();
  const approvedNews = await readJsonFile(approvedNewsPath, []);
  const digests = await readJsonFile(noWrite ? outputPath : newsletterDraftsPath, { version: 1, updatedAt: "", items: [] });
  const publishedUpdates = approvedNews
    .filter((item) => item.status === "published")
    .sort((a, b) => String(b.publishedAt || b.sourcePublishedAt || b.fetchedAt).localeCompare(String(a.publishedAt || a.sourcePublishedAt || a.fetchedAt)))
    .slice(0, 6);
  const published = news.items
    .filter((item) => item.status === "published")
    .sort((a, b) => String(b.publishedAt || b.updatedAt).localeCompare(String(a.publishedAt || a.updatedAt)))
    .slice(0, 3);
  const queued = news.items
    .filter((item) => item.status === "queued")
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 2);
  const id = `digest-${new Date().toISOString().slice(0, 10)}`;
  const existingIndex = digests.items.findIndex((item) => item.id === id);
  const updateBlurbs = publishedUpdates.map((item) => ({
    updateId: item.id,
    headline: item.newsletterHeadline || item.title,
    blurb: item.newsletterBlurb || item.summary || item.description,
    relatedProjectIds: item.relatedProjectIds ?? [],
    relatedCorridorIds: item.relatedCorridorIds ?? [],
    cta: item.newsletterCta || "Read the on-site update",
    articlePath: `/updates/${item.slug || item.id}/`,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
  }));
  const digest = {
    id,
    status: "draft",
    subject: "West Palm Beach new-construction buyer notes",
    intro: "Here are the latest West Palm Beach development notes to help buyers compare timing, corridor fit, and what should be verified before touring.",
    storyBlurbs: [
      ...updateBlurbs,
      ...[...published, ...queued].map((item) => ({
      draftId: item.id,
      headline: item.rewrittenHeadline,
      blurb: item.newsletterBlurb,
      relatedProjectIds: item.relatedProjectIds ?? [],
      relatedCorridorIds: item.relatedCorridorIds ?? [],
      cta: item.cta || "Compare related West Palm Beach projects",
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
    })),
    ].slice(0, 8),
    cta: "Reply with the projects you are watching and we will help separate firm details from early-stage signals.",
    sourceLinks: [...new Set([...publishedUpdates, ...published, ...queued].map((item) => item.sourceUrl).filter(Boolean))],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) digests.items[existingIndex] = digest;
  else digests.items.unshift(digest);
  digests.version = 1;
  digests.updatedAt = new Date().toISOString();
  await writeJsonFile(outputPath, digests);
  console.log(JSON.stringify({ digest: id, stories: digest.storyBlurbs.length, output: noWrite ? ".runtime/qa/newsletter-digest-drafts.json" : "content/newsletter-digest-drafts.json", noWrite }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
