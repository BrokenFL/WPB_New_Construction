import {
  newsletterDraftsPath,
  readDraftStore,
  readJsonFile,
  writeJsonFile,
} from "./news-draft-utils.mjs";

async function main() {
  const news = await readDraftStore();
  const digests = await readJsonFile(newsletterDraftsPath, { version: 1, updatedAt: "", items: [] });
  const published = news.items
    .filter((item) => item.status === "published")
    .sort((a, b) => String(b.publishedAt || b.updatedAt).localeCompare(String(a.publishedAt || a.updatedAt)))
    .slice(0, 5);
  const queued = news.items
    .filter((item) => item.status === "queued")
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 3);
  const id = `digest-${new Date().toISOString().slice(0, 10)}`;
  const existingIndex = digests.items.findIndex((item) => item.id === id);
  const digest = {
    id,
    status: "draft",
    subject: "West Palm Beach new-construction buyer notes",
    intro: "Here are the latest source-linked development notes and buyer checks for West Palm Beach new-construction condos.",
    storyBlurbs: [...published, ...queued].map((item) => ({
      draftId: item.id,
      headline: item.rewrittenHeadline,
      blurb: item.newsletterBlurb,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
    })),
    cta: "Reply with the projects you are watching and we will help separate firm details from early-stage signals.",
    sourceLinks: [...new Set([...published, ...queued].map((item) => item.sourceUrl).filter(Boolean))],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) digests.items[existingIndex] = digest;
  else digests.items.unshift(digest);
  digests.version = 1;
  digests.updatedAt = new Date().toISOString();
  await writeJsonFile(newsletterDraftsPath, digests);
  console.log(JSON.stringify({ digest: id, stories: digest.storyBlurbs.length, output: "content/newsletter-digest-drafts.json" }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
