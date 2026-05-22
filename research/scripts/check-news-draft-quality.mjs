import fs from "node:fs/promises";
import path from "node:path";
import {
  containsBackendTerms,
  highRiskTerms,
  readDraftStore,
  validStatuses,
  workspace,
} from "./news-draft-utils.mjs";

const failures = [];

async function main() {
  const store = await readDraftStore();
  if (!Array.isArray(store.items)) failures.push("content/news-drafts.json must have an items array.");
  const seenUrls = new Set();
  for (const item of store.items ?? []) {
    const label = item.id || item.sourceUrl || "draft";
    required(item.sourceUrl, `${label}: sourceUrl is required.`);
    required(item.rewrittenHeadline, `${label}: rewrittenHeadline is required.`);
    required(item.riskLevel, `${label}: riskLevel is required.`);
    required(item.newsletterBlurb, `${label}: newsletterBlurb is required.`);
    if (!validStatuses.has(item.status)) failures.push(`${label}: invalid status ${item.status}.`);
    if (!Array.isArray(item.bodySections) || !item.bodySections.length) failures.push(`${label}: bodySections are required.`);
    if (item.sourceUrl && seenUrls.has(item.sourceUrl)) failures.push(`${label}: duplicate sourceUrl ${item.sourceUrl}.`);
    if (item.sourceUrl) seenUrls.add(item.sourceUrl);
    if (item.riskLevel === "high" && (item.publishMode === "auto-queue" || item.status === "queued" || item.status === "scheduled")) {
      failures.push(`${label}: high-risk items cannot be auto-queued or scheduled without review.`);
    }
    const text = JSON.stringify(item);
    if (containsBackendTerms(publicFacingText(item))) failures.push(`${label}: public-facing fields contain backend/editor terms.`);
    if (item.riskLevel !== "high" && highRiskTerms.some((term) => text.toLowerCase().includes(term)) && item.publishMode === "auto-queue") {
      failures.push(`${label}: buyer-reliant topic should not use auto-queue.`);
    }
    if ((item.status === "published" || item.status === "queued") && !item.newsletterBlurb) failures.push(`${label}: queued/published items need newsletterBlurb.`);
    if (item.suggestedImagePath && !await assetExists(item.suggestedImagePath)) failures.push(`${label}: suggestedImagePath does not exist: ${item.suggestedImagePath}`);
  }

  if (failures.length) {
    console.error(["News draft QA failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }
  console.log(JSON.stringify({ newsDraftQuality: "pass", drafts: store.items?.length ?? 0 }, null, 2));
}

function required(value, message) {
  if (!value) failures.push(message);
}

function publicFacingText(item) {
  return [
    item.rewrittenHeadline,
    item.deck,
    item.buyerTakeaway,
    item.newsletterBlurb,
    ...(item.bodySections ?? []).flatMap((section) => [section.heading, section.body]),
  ].join("\n");
}

async function assetExists(assetPath) {
  const normalized = assetPath.replace(/^\//, "").replace(/^public\//, "");
  return fs.access(path.join(workspace, "public", normalized)).then(() => true).catch(() => false);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
