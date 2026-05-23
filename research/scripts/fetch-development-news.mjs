import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const outputPath = path.join(workspace, "research/news-review/development-news-candidates.json");
const defaultSourceWindowDays = 14;
const fallbackSourceWindowDays = 30;

const queries = [
  "West Palm Beach development",
  "West Palm Beach new construction",
  "West Palm Beach condo development",
  "Downtown West Palm Beach development",
  "West Palm Beach real estate development",
];

const likelyPaywalledHosts = ["palmbeachpost.com", "bizjournals.com", "therealdeal.com"];
const projectMatchers = [
  ["rosewood", /rosewood|2001 n flagler|2001 north flagler/i],
  ["mandarin-oriental", /mandarin oriental|5400 n flagler|5400 north flagler/i],
  ["nora-house", /nora house|nora district/i],
  ["south-flagler-house", /south flagler house|1355 s flagler|1355 south flagler/i],
  ["olara", /olara|1919 n flagler|1919 north flagler/i],
  ["shorecrest", /shorecrest|1865 n flagler|1901 north flagler/i],
  ["ritz-carlton-wpb", /ritz-carlton|ritz carlton|1717 n flagler|1745 n flagler/i],
];
const corridorMatchers = [
  ["north-flagler", /north flagler|n flagler|intracoastal|rybovich/i],
  ["downtown", /downtown|nora|cityplace|rosemary|the square|kravis/i],
  ["south-flagler", /south flagler|s flagler/i],
];

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function tagValue(item, tag) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeEntities(match?.[1]?.trim() ?? "");
}

function normalizeTitle(title) {
  return title.replace(/\s+-\s+[^-]+$/, "").replace(/\s+/g, " ").trim();
}

function sourceFromTitle(title) {
  const parts = title.split(/\s+-\s+/);
  return parts.length > 1 ? parts.at(-1).trim() : "";
}

function categoryFor(query, title) {
  const combined = `${query} ${title}`.toLowerCase();
  if (/planning|propose|approval|zoning|board|cra/.test(combined)) return "planning";
  if (/construction|groundbreaking|goes vertical|topped/.test(combined)) return "construction";
  if (/sales|launch|pricing|condo/.test(combined)) return "sales";
  if (/loan|financing|debt/.test(combined)) return "financing";
  if (/city|cra|commission/.test(combined)) return "city";
  if (/press release|pr newswire|business wire/.test(combined)) return "press-release";
  return "development";
}

function hostFor(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function matchIds(text, matchers) {
  return matchers.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
}

function freshnessLaneFor(sourcePublishedDate, dateDiscovered = new Date()) {
  const sourceMs = Date.parse(sourcePublishedDate);
  const discoveredMs = Date.parse(dateDiscovered instanceof Date ? dateDiscovered.toISOString() : dateDiscovered) || Date.now();
  if (Number.isNaN(sourceMs)) return "archive_only";
  const ageDays = Math.floor((discoveredMs - sourceMs) / 86400000);
  if (ageDays <= defaultSourceWindowDays) return "breaking_14d";
  if (ageDays <= fallbackSourceWindowDays) return "recent_30d";
  return "background_context";
}

function isCredibleCandidate(item) {
  return item.relatedProjectSlugs.length > 0 || item.relatedCorridors.length > 0 || /condo|development|construction|planning|waterfront|residence|tower/i.test(`${item.title} ${item.description}`);
}

async function fetchQuery(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(url, { headers: { "User-Agent": "WPB New Construction news review" } });
  if (!response.ok) throw new Error(`Google News RSS failed for ${query}: ${response.status}`);
  const xml = await response.text();
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  return itemBlocks.map((block) => {
    const rawTitle = tagValue(block, "title");
    const title = normalizeTitle(rawTitle);
    const link = tagValue(block, "link");
    const sourceName = tagValue(block, "source") || sourceFromTitle(rawTitle) || hostFor(link) || "Unknown source";
    const sourceUrl = block.match(/<source[^>]*url="([^"]+)"/i)?.[1] ?? link;
    const publishedAt = new Date(tagValue(block, "pubDate") || Date.now()).toISOString();
    const sourcePublishedDate = publishedAt.slice(0, 10);
    const dateDiscovered = new Date().toISOString().slice(0, 10);
    const description = tagValue(block, "description").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const matchText = `${title} ${description}`;
    const host = hostFor(sourceUrl || link);
    const relatedProjectSlugs = matchIds(matchText, projectMatchers);
    const relatedCorridors = matchIds(matchText, corridorMatchers);
    return {
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72)}-${publishedAt.slice(0, 10)}`,
      title,
      sourceName,
      sourceUrl,
      canonicalUrl: sourceUrl || link,
      googleNewsUrl: link,
      publishedAt,
      sourcePublishedAt: sourcePublishedDate,
      sourcePublishedDate,
      dateDiscovered,
      freshnessLane: freshnessLaneFor(sourcePublishedDate, dateDiscovered),
      fetchedAt: dateDiscovered,
      description,
      query,
      category: categoryFor(query, title),
      relatedProjectIds: relatedProjectSlugs,
      relatedCorridorIds: relatedCorridors,
      relatedProjectSlugs,
      relatedCorridors,
      primaryProjectSlug: relatedProjectSlugs[0] || undefined,
      imageUrl: "",
      paywallStatus: likelyPaywalledHosts.some((paywallHost) => host.includes(paywallHost)) ? "likely-paywalled" : "unknown",
      status: "needs-review",
    };
  });
}

const byKey = new Map();
for (const query of queries) {
  for (const item of await fetchQuery(query)) {
    const key = `${item.canonicalUrl}|${item.title.toLowerCase()}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }
}

const allCandidates = [...byKey.values()].filter((item) => /west palm|wpb|flagler|nora|cityplace|rosewood|mandarin|shorecrest|olara/i.test(`${item.title} ${item.description}`));
const breakingCandidates = allCandidates.filter((item) => item.freshnessLane === "breaking_14d");
const recentCandidates = allCandidates.filter((item) => item.freshnessLane === "recent_30d");
const credibleBreaking = breakingCandidates.filter(isCredibleCandidate);
const publishableWindow = credibleBreaking.length >= 2 ? new Set(["breaking_14d"]) : new Set(["breaking_14d", "recent_30d"]);
const candidates = allCandidates
  .map((item) => publishableWindow.has(item.freshnessLane) ? item : { ...item, freshnessLane: item.freshnessLane === "recent_30d" ? "background_context" : item.freshnessLane })
  .sort((a, b) => {
    const dateDelta = Date.parse(b.sourcePublishedDate) - Date.parse(a.sourcePublishedDate);
    if (dateDelta !== 0) return dateDelta;
    return a.id.localeCompare(b.id);
  });
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(candidates, null, 2)}\n`);
console.log(`Wrote ${candidates.length} news candidate${candidates.length === 1 ? "" : "s"} to ${outputPath} (${breakingCandidates.length} within 14d, ${recentCandidates.length} within 30d).`);
