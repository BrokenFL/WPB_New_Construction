import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const approvedJsonPath = path.join(workspace, "research/news-review/approved-development-news.json");
const publicTsPath = path.join(workspace, "src/data/approvedExternalNews.ts");
const findings = [];

const approved = JSON.parse(fs.readFileSync(approvedJsonPath, "utf8"));
const publicSource = fs.readFileSync(publicTsPath, "utf8");

if (!Array.isArray(approved)) findings.push("approved-development-news.json must contain an array.");

const seen = new Set();
for (const [index, item] of approved.entries()) {
  const label = item.id || `item ${index}`;
  for (const field of ["id", "title", "sourceName", "sourceUrl", "canonicalUrl", "publishedAt", "fetchedAt", "status"]) {
    if (!item[field]) findings.push(`${label}: missing ${field}.`);
  }
  for (const field of ["sourcePublishedDate", "dateDiscovered", "freshnessLane"]) {
    if (!item[field]) findings.push(`${label}: missing ${field}. Run npm run news:promote to normalize approved news.`);
  }
  if (item.status !== "published") findings.push(`${label}: approved JSON may only promote status published.`);
  if (item.paywallStatus === "likely-paywalled") findings.push(`${label}: likely-paywalled item should stay out of the public feed unless explicitly excepted.`);
  if (item.canonicalUrl && seen.has(item.canonicalUrl)) findings.push(`${label}: duplicate canonicalUrl ${item.canonicalUrl}.`);
  if (item.canonicalUrl) seen.add(item.canonicalUrl);
  if (/news\.google\.com/.test(item.canonicalUrl || "")) findings.push(`${label}: canonicalUrl points to Google News instead of the source article.`);
  if (!Array.isArray(item.relatedProjectIds)) findings.push(`${label}: relatedProjectIds must be an array.`);
  if (!Array.isArray(item.relatedCorridorIds)) findings.push(`${label}: relatedCorridorIds must be an array.`);
  if (!Array.isArray(item.relatedProjectSlugs)) findings.push(`${label}: relatedProjectSlugs must be an array.`);
  if (!Array.isArray(item.relatedCorridors)) findings.push(`${label}: relatedCorridors must be an array.`);
  if (item.relatedProjectSlugs?.length && !item.primaryProjectSlug) findings.push(`${label}: primaryProjectSlug should be set when relatedProjectSlugs are present.`);
  if (["breaking_14d", "recent_30d"].includes(item.freshnessLane) && !item.sourcePublishedDate) {
    findings.push(`${label}: homepage freshness lane requires sourcePublishedDate.`);
  }
}

if (/"status":\s*"(needs-review|archived|duplicate)"/.test(publicSource)) {
  findings.push("Public approvedExternalNews.ts appears to include non-published statuses.");
}

for (const item of approved) {
  if (item.id && !publicSource.includes(`"id": "${item.id}"`)) {
    findings.push(`${item.id}: approved JSON item is missing from approvedExternalNews.ts. Run npm run news:promote.`);
  }
}

if (!/function sortNewsItems/.test(publicSource) || !/export const homepageExternalNews/.test(publicSource)) {
  findings.push("Public approvedExternalNews.ts must export deterministic sorting and homepageExternalNews.");
}

if (findings.length) {
  console.error("Approved news QA findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Approved news QA passed for ${approved.length} published item${approved.length === 1 ? "" : "s"}.`);
