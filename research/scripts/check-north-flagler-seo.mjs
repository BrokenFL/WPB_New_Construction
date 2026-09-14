import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const route = "/corridors/north-flagler/";
const html = await fs.readFile(path.join(workspace, "dist", route.replace(/^\//, ""), "index.html"), "utf8").catch(() => "");
const findings = [];

if (!html) findings.push(`${route}: built route is missing.`);

const requiredText = [
  "North Flagler Condos",
  "North Flagler comparison table",
  "Pricing guidance",
  "Floorplans",
  "Best fit",
  "Active sales and construction",
  "Pipeline and planning watch",
  "Latest North Flagler updates",
  "Compare North Flagler buildings side by side",
  "Request current pricing, availability, and buyer packets",
];
for (const phrase of requiredText) {
  if (!html.toLowerCase().includes(phrase.toLowerCase())) findings.push(`${route}: missing ${phrase}.`);
}

const requiredLinks = [
  "/projects/olara/",
  "/projects/shorecrest/",
  "/projects/ritz-carlton-wpb/",
  "/projects/rybovich-marina-redevelopment/",
  "/projects/rosewood-residences-west-palm-beach/",
  "/compare/",
  "/inquire/",
];
for (const href of requiredLinks) {
  if (!html.includes(`href="${href}"`)) findings.push(`${route}: missing internal link ${href}.`);
}

// The corridor page intentionally shows the three newest matching updates, so
// pinning this gate to one historical slug makes a successful new publish push
// that slug out and then fail the very next publish. Keep the safety check tied
// to the rendered update section and verify every current link resolves.
const latestUpdatesSection = html.match(/<section[^>]*>\s*<h2>Latest North Flagler updates<\/h2>[\s\S]*?<\/section>/i)?.[0] || "";
const latestUpdateLinks = [...latestUpdatesSection.matchAll(/href="(\/updates\/[^"]+\/)"/g)].map((match) => match[1]);
if (!latestUpdateLinks.length) {
  findings.push(`${route}: Latest North Flagler updates has no internal article link.`);
}
for (const href of latestUpdateLinks) {
  const linkedHtml = path.join(workspace, "dist", href.replace(/^\//, ""), "index.html");
  const exists = await fs.stat(linkedHtml).then((stat) => stat.isFile()).catch(() => false);
  if (!exists) findings.push(`${route}: current update link does not resolve in the build: ${href}.`);
}

const schemaMatch = html.match(/<script id="wpb-static-structured-data"[^>]*>([\s\S]*?)<\/script>/);
if (!schemaMatch) {
  findings.push(`${route}: structured-data graph is missing.`);
} else {
  try {
    const graph = JSON.parse(schemaMatch[1])["@graph"] ?? [];
    if (!graph.some((item) => item["@type"] === "BreadcrumbList")) findings.push(`${route}: BreadcrumbList schema is missing.`);
    const itemList = graph.find((item) => item["@type"] === "ItemList");
    if (!itemList) findings.push(`${route}: ItemList schema is missing.`);
    else if ((itemList.itemListElement ?? []).length < 8) findings.push(`${route}: ItemList does not cover the current North Flagler set.`);
  } catch (error) {
    findings.push(`${route}: structured-data graph is invalid JSON (${error.message}).`);
  }
}

if (findings.length) {
  console.error("North Flagler SEO findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("North Flagler SEO QA passed: answer-first copy, comparison depth, project segmentation, updates, CTAs, links, and schema verified.");
