import fs from "node:fs/promises";
import path from "node:path";
import { onRequest } from "../../functions/_middleware.js";

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
  "/corridors/downtown-west-palm-beach/",
  "/corridors/south-flagler/",
  "/projects/olara/",
  "/projects/rosewood-residences-west-palm-beach/",
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

const notFoundHtml = await fs.readFile(path.join(distRoot, "404.html"), "utf8").catch(() => "");
if (!notFoundHtml) {
  findings.push("missing top-level 404.html; Cloudflare Pages will treat unknown routes as SPA fallbacks");
} else {
  if (!/<meta name="robots" content="noindex,follow"\s*\/?>/.test(notFoundHtml)) {
    findings.push("404.html must be noindex,follow");
  }
  if (!/<h1>[^<]+<\/h1>/.test(notFoundHtml)) {
    findings.push("404.html must include a visible H1");
  }
}

const sitemap = await fs.readFile(path.join(distRoot, "sitemap.xml"), "utf8").catch(() => "");
if (!sitemap) {
  findings.push("missing sitemap.xml");
} else {
  const today = new Date().toISOString().slice(0, 10);
  if (sitemap.includes("<lastmod>2026-06-03</lastmod>")) findings.push("sitemap contains the retired hard-coded 2026-06-03 lastmod");
  for (const match of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1])) findings.push(`sitemap has invalid lastmod ${match[1]}`);
    if (match[1] > today) findings.push(`sitemap has future lastmod ${match[1]}`);
  }
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (/[?&#]/.test(match[1])) findings.push(`sitemap contains a parameterized URL ${match[1]}`);
  }
}

const builtTextFiles = await listTextFiles(distRoot);
for (const filePath of builtTextFiles) {
  const content = await fs.readFile(filePath, "utf8");
  for (const match of content.matchAll(/href=["']([^"']*lead_capture_context[^"']*)["']/g)) {
    findings.push(`${path.relative(workspace, filePath)} contains a crawlable attribution parameter: ${match[1]}`);
  }
}

let apexNextCalled = false;
const apexRedirect = await onRequest({
  request: new Request("https://wpbnewconstruction.com/projects/olara/?source=test"),
  next: async () => {
    apexNextCalled = true;
    return new Response("unexpected");
  },
  env: {},
});
if (apexNextCalled || apexRedirect.status !== 301) {
  findings.push("apex hostname must redirect before Pages routing");
}
if (apexRedirect.headers.get("location") !== "https://www.wpbnewconstruction.com/projects/olara/?source=test") {
  findings.push(`apex redirect did not preserve path and query: ${apexRedirect.headers.get("location")}`);
}

if (findings.length) {
  console.error("SEO readiness findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`SEO readiness QA passed for ${requiredRoutes.length} routes.`);

async function listTextFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listTextFiles(entryPath);
    return /\.(?:html|js)$/i.test(entry.name) ? [entryPath] : [];
  }));
  return nested.flat();
}
