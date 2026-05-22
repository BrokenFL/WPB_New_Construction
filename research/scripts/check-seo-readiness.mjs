import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const findings = [];

const requiredRoutes = [
  "/",
  "/buildings/",
  "/map/",
  "/compare/",
  "/updates/",
  "/market-notes/",
  "/answers/",
  "/floorplans/",
  "/methodology/",
  "/inquire/",
  "/corridors/north-flagler/",
  "/corridors/downtown/",
  "/corridors/south-flagler/",
  "/projects/olara/",
  "/projects/rosewood/",
  "/projects/nora-house/",
  "/projects/south-flagler-house/",
];

function routeFile(route) {
  return route === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route, "index.html");
}

function readTag(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? "";
}

for (const route of requiredRoutes) {
  const html = await fs.readFile(routeFile(route), "utf8").catch(() => "");
  if (!html) {
    findings.push(`${route}: missing prerendered HTML`);
    continue;
  }
  const title = readTag(html, /<title>([\s\S]*?)<\/title>/);
  const description = readTag(html, /<meta name="description" content="([^"]+)"/);
  const canonical = readTag(html, /<link rel="canonical" href="([^"]+)"/);
  const ogTitle = readTag(html, /<meta property="og:title" content="([^"]+)"/);
  const ogDescription = readTag(html, /<meta property="og:description" content="([^"]+)"/);
  const ogImage = readTag(html, /<meta property="og:image" content="([^"]+)"/);
  const twitterTitle = readTag(html, /<meta name="twitter:title" content="([^"]+)"/);
  const twitterDescription = readTag(html, /<meta name="twitter:description" content="([^"]+)"/);
  const twitterImage = readTag(html, /<meta name="twitter:image" content="([^"]+)"/);

  if (!title || title.length > 75) findings.push(`${route}: missing or overlong title`);
  if (!description || description.length < 80 || description.length > 180) findings.push(`${route}: missing or weak meta description`);
  if (canonical !== `https://www.wpbnewconstruction.com${route}`) findings.push(`${route}: incorrect canonical ${canonical}`);
  if (!ogTitle || !ogDescription || !ogImage) findings.push(`${route}: missing Open Graph metadata`);
  if (!twitterTitle || !twitterDescription || !twitterImage) findings.push(`${route}: missing Twitter card metadata`);
}

if (findings.length) {
  console.error("SEO readiness findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`SEO readiness QA passed for ${requiredRoutes.length} routes.`);
