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
const normalizedItems = items.map((item) => normalizeApprovedNewsItem(item));
for (const [index, item] of normalizedItems.entries()) {
  for (const field of ["id", "title", "sourceName", "sourceUrl", "canonicalUrl", "publishedAt", "fetchedAt", "category", "paywallStatus", "status"]) {
    if (!item[field]) fail(`item ${index} is missing ${field}.`);
  }
  for (const field of ["sourcePublishedDate", "dateDiscovered", "freshnessLane", "relatedProjectSlugs", "relatedCorridors"]) {
    if (!item[field]) fail(`${item.id}: missing ${field}.`);
  }
  if (!categories.has(item.category)) fail(`${item.id}: invalid category ${item.category}.`);
  if (!paywallStatuses.has(item.paywallStatus)) fail(`${item.id}: invalid paywallStatus ${item.paywallStatus}.`);
  if (!statuses.has(item.status)) fail(`${item.id}: invalid status ${item.status}.`);
  if (item.status !== "published") fail(`${item.id}: approved public news must use status "published".`);
  if (!Array.isArray(item.relatedProjectIds)) fail(`${item.id}: relatedProjectIds must be an array.`);
  if (!Array.isArray(item.relatedCorridorIds)) fail(`${item.id}: relatedCorridorIds must be an array.`);
  if (!Array.isArray(item.relatedProjectSlugs)) fail(`${item.id}: relatedProjectSlugs must be an array.`);
  if (!Array.isArray(item.relatedCorridors)) fail(`${item.id}: relatedCorridors must be an array.`);
  if (seenCanonical.has(item.canonicalUrl)) fail(`${item.id}: duplicate canonicalUrl ${item.canonicalUrl}.`);
  seenCanonical.add(item.canonicalUrl);
  if (/news\.google\.com/.test(item.canonicalUrl)) fail(`${item.id}: canonicalUrl must point to the original article, not Google News.`);
  if (item.paywallStatus === "likely-paywalled") fail(`${item.id}: likely-paywalled items should not be promoted without an explicit product exception.`);
}

const rendered = `export type ExternalNewsItem = {
  id: string;
  title: string;
  slug?: string;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourceTitle?: string;
  publishedAt: string;
  sourcePublishedAt?: string;
  sourcePublishedDate: string;
  eventDate?: string;
  dateDiscovered: string;
  freshnessLane: "breaking_14d" | "recent_30d" | "evergreen_context" | "evergreen_analysis" | "background_context" | "archive_only";
  fetchedAt: string;
  deck?: string;
  description?: string;
  summary?: string;
  story?: string[];
  bodySections?: { heading: string; body: string }[];
  whyItMatters?: string;
  brookeTake?: string;
  buyerContext?: string;
  newsletterHeadline?: string;
  newsletterBlurb?: string;
  newsletterCta?: string;
  query?: string;
  category: "development" | "construction" | "planning" | "sales" | "financing" | "city" | "press-release" | "general";
  relatedProjectIds: string[];
  relatedCorridorIds: string[];
  relatedProjectSlugs: string[];
  relatedCorridors: string[];
  primaryProjectSlug?: string;
  corridorLabel?: string;
  imageUrl?: string;
  imagePath?: string;
  resolvedLocalImageId?: string;
  sourceLinks?: { label: string; url: string; type?: string }[];
  paywallStatus: "free" | "unknown" | "likely-paywalled";
  status: "needs-review" | "published" | "archived" | "duplicate";
  riskLevel?: "low" | "medium" | "high";
};

export function newsSortTimestamp(item: ExternalNewsItem): number {
  const value = item.publishedAt || item.sourcePublishedDate || item.sourcePublishedAt || item.dateDiscovered || item.fetchedAt;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortNewsItems<T extends ExternalNewsItem>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const dateDelta = newsSortTimestamp(b) - newsSortTimestamp(a);
    if (dateDelta !== 0) return dateDelta;
    return a.id.localeCompare(b.id);
  });
}

export function isHomepageFreshnessLane(item: ExternalNewsItem): boolean {
  return item.freshnessLane === "breaking_14d" || item.freshnessLane === "recent_30d";
}

export function isHomepageContextLane(item: ExternalNewsItem): boolean {
  return item.freshnessLane === "evergreen_analysis" ||
    item.freshnessLane === "evergreen_context" ||
    item.freshnessLane === "archive_only";
}

export const approvedExternalNews: readonly ExternalNewsItem[] = ${JSON.stringify(normalizedItems, null, 2)} as const;

export const publishedExternalNews = sortNewsItems(approvedExternalNews.filter((item) => item.status === "published"));
export const homepageExternalNews = [
  ...publishedExternalNews.filter(isHomepageFreshnessLane),
  ...publishedExternalNews.filter(isHomepageContextLane),
].filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 3);
`;

fs.writeFileSync(approvedPath, `${JSON.stringify(normalizedItems, null, 2)}\n`);
fs.writeFileSync(outputPath, rendered);
console.log(`Promoted ${normalizedItems.length} approved external news item${normalizedItems.length === 1 ? "" : "s"} to ${outputPath}`);

function normalizeApprovedNewsItem(item) {
  const sourcePublishedDate = item.sourcePublishedDate || item.sourcePublishedAt || item.publishedAt;
  const dateDiscovered = item.dateDiscovered || item.fetchedAt || new Date().toISOString().slice(0, 10);
  const freshnessLane = item.freshnessLane || freshnessLaneFor(sourcePublishedDate, dateDiscovered);
  const relatedProjectSlugs = item.relatedProjectSlugs || item.relatedProjectIds || [];
  const relatedCorridors = item.relatedCorridors || item.relatedCorridorIds || [];
  return {
    ...item,
    sourcePublishedDate,
    dateDiscovered,
    freshnessLane,
    relatedProjectSlugs,
    relatedCorridors,
    primaryProjectSlug: item.primaryProjectSlug || relatedProjectSlugs[0] || undefined,
  };
}

function freshnessLaneFor(sourcePublishedDate, dateDiscovered) {
  const sourceMs = Date.parse(sourcePublishedDate);
  const discoveredMs = Date.parse(dateDiscovered) || Date.now();
  if (Number.isNaN(sourceMs)) return "archive_only";
  const ageDays = Math.floor((discoveredMs - sourceMs) / 86400000);
  if (ageDays <= 14) return "breaking_14d";
  if (ageDays <= 30) return "recent_30d";
  return "archive_only";
}
