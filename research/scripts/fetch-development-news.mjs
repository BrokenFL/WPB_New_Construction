import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const outputPath = path.join(workspace, "research/news-review/development-news-candidates.json");

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
    const description = tagValue(block, "description").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const matchText = `${title} ${description}`;
    const host = hostFor(sourceUrl || link);
    return {
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72)}-${publishedAt.slice(0, 10)}`,
      title,
      sourceName,
      sourceUrl,
      canonicalUrl: sourceUrl || link,
      googleNewsUrl: link,
      publishedAt,
      fetchedAt: new Date().toISOString(),
      description,
      query,
      category: categoryFor(query, title),
      relatedProjectIds: matchIds(matchText, projectMatchers),
      relatedCorridorIds: matchIds(matchText, corridorMatchers),
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

const candidates = [...byKey.values()].filter((item) => /west palm|wpb|flagler|nora|cityplace|rosewood|mandarin|shorecrest|olara/i.test(`${item.title} ${item.description}`));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(candidates, null, 2)}\n`);
console.log(`Wrote ${candidates.length} news candidate${candidates.length === 1 ? "" : "s"} to ${outputPath}`);
