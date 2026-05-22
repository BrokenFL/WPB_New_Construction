import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const approvedPath = path.join(workspace, "research/news-review/approved-development-news.json");
const outputPath = path.join(workspace, "src/data/approvedExternalNews.ts");

const categories = new Set(["development", "construction", "planning", "sales", "financing", "city", "press-release", "general"]);
const paywallStatuses = new Set(["free", "unknown", "likely-paywalled"]);
const statuses = new Set(["needs-review", "published", "archived", "duplicate"]);

function fail(message) {
  console.error(`Approved news promotion failed: ${message}`);
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(approvedPath, "utf8"));
if (!Array.isArray(items)) fail(`${approvedPath} must contain an array.`);

const seenCanonical = new Set();
for (const [index, item] of items.entries()) {
  for (const field of ["id", "title", "sourceName", "sourceUrl", "canonicalUrl", "publishedAt", "fetchedAt", "category", "paywallStatus", "status"]) {
    if (!item[field]) fail(`item ${index} is missing ${field}.`);
  }
  if (!categories.has(item.category)) fail(`${item.id}: invalid category ${item.category}.`);
  if (!paywallStatuses.has(item.paywallStatus)) fail(`${item.id}: invalid paywallStatus ${item.paywallStatus}.`);
  if (!statuses.has(item.status)) fail(`${item.id}: invalid status ${item.status}.`);
  if (item.status !== "published") fail(`${item.id}: approved public news must use status "published".`);
  if (!Array.isArray(item.relatedProjectIds)) fail(`${item.id}: relatedProjectIds must be an array.`);
  if (!Array.isArray(item.relatedCorridorIds)) fail(`${item.id}: relatedCorridorIds must be an array.`);
  if (seenCanonical.has(item.canonicalUrl)) fail(`${item.id}: duplicate canonicalUrl ${item.canonicalUrl}.`);
  seenCanonical.add(item.canonicalUrl);
  if (/news\.google\.com/.test(item.canonicalUrl)) fail(`${item.id}: canonicalUrl must point to the original article, not Google News.`);
  if (item.paywallStatus === "likely-paywalled") fail(`${item.id}: likely-paywalled items should not be promoted without an explicit product exception.`);
}

const rendered = `export type ExternalNewsItem = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  publishedAt: string;
  fetchedAt: string;
  description?: string;
  query?: string;
  category: "development" | "construction" | "planning" | "sales" | "financing" | "city" | "press-release" | "general";
  relatedProjectIds: string[];
  relatedCorridorIds: string[];
  imageUrl?: string;
  resolvedLocalImageId?: string;
  paywallStatus: "free" | "unknown" | "likely-paywalled";
  status: "needs-review" | "published" | "archived" | "duplicate";
};

export const approvedExternalNews: readonly ExternalNewsItem[] = ${JSON.stringify(items, null, 2)} as const;

export const publishedExternalNews = approvedExternalNews.filter((item) => item.status === "published");
`;

fs.writeFileSync(outputPath, rendered);
console.log(`Promoted ${items.length} approved external news item${items.length === 1 ? "" : "s"} to ${outputPath}`);
