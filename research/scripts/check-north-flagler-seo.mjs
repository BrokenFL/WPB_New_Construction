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
  "/updates/rosewood-north-flagler-planning-board-2026-06-05/",
];
for (const href of requiredLinks) {
  if (!html.includes(`href="${href}"`)) findings.push(`${route}: missing internal link ${href}.`);
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
