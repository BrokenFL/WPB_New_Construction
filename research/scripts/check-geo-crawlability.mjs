import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const productionBaseUrl = "https://www.wpbnewconstruction.com";
const findings = [];

const sitemapPath = path.join(distRoot, "sitemap.xml");
const llmsPath = path.join(distRoot, "llms.txt");
const robotsPath = path.join(distRoot, "robots.txt");

const sitemap = await fs.readFile(sitemapPath, "utf8").catch(() => "");
const llms = await fs.readFile(llmsPath, "utf8").catch(() => "");
const robots = await fs.readFile(robotsPath, "utf8").catch(() => "");

if (!sitemap) findings.push("dist/sitemap.xml is missing.");
if (!llms) findings.push("dist/llms.txt is missing.");
if (!robots) findings.push("dist/robots.txt is missing.");

const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/www\.wpbnewconstruction\.com([^<]*)<\/loc>/g)]
  .map((match) => normalizeRoute(match[1]));

const requiredRoutePatterns = [
  /^\/$/,
  /^\/buildings\/$/,
  /^\/compare\/$/,
  /^\/floorplans\/$/,
  /^\/answers\/$/,
  /^\/answers\/[^/]+\/$/,
  /^\/projects\/[^/]+\/$/,
  /^\/corridors\/[^/]+\/$/,
  /^\/updates\/[^/]+\/$/,
  /^\/market-notes\/[^/]+\/$/,
];

const priorityRoutes = sitemapRoutes.filter((route) => requiredRoutePatterns.some((pattern) => pattern.test(route)));

for (const route of priorityRoutes) {
  const html = await fs.readFile(routeFile(route), "utf8").catch(() => "");
  if (!html) {
    findings.push(`${route}: missing built HTML.`);
    continue;
  }

  const text = visibleText(html);
  const minLength = route === "/answers/" ? 2000 : route.startsWith("/projects/") ? 700 : 450;
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const jsonLdCount = (html.match(/type="application\/ld\+json"/g) || []).length;
  const canonical = readTag(html, /<link rel="canonical" href="([^"]+)"/);
  const expectedCanonical = `${productionBaseUrl}${route}`;

  if (text.length < minLength) findings.push(`${route}: static text is too thin (${text.length} chars, expected at least ${minLength}).`);
  if (h1Count < 1) findings.push(`${route}: missing static H1.`);
  if (canonical !== expectedCanonical) findings.push(`${route}: canonical mismatch (${canonical || "missing"}).`);
  if (jsonLdCount < 1) findings.push(`${route}: missing static JSON-LD.`);
  if (jsonLdCount > 1) findings.push(`${route}: expected one static JSON-LD graph, found ${jsonLdCount}.`);
}

for (const route of priorityRoutes) {
  if (!llms.includes(route)) findings.push(`llms.txt missing route ${route}.`);
}

for (const route of ["/corridors/north-flagler/", "/corridors/downtown-west-palm-beach/", "/corridors/south-flagler/"]) {
  if (!sitemapRoutes.includes(route)) findings.push(`sitemap.xml missing corridor route ${route}.`);
}

for (const agent of ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "GoogleOther"]) {
  if (!robots.includes(`User-agent: ${agent}`)) findings.push(`robots.txt missing explicit ${agent} rule.`);
}

if (findings.length) {
  console.error("GEO crawlability findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`GEO crawlability QA passed for ${priorityRoutes.length} priority routes.`);

function normalizeRoute(value) {
  const route = value || "/";
  if (route === "/") return route;
  return route.endsWith("/") ? route : `${route}/`;
}

function routeFile(route) {
  return route === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route, "index.html");
}

function readTag(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? "";
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
