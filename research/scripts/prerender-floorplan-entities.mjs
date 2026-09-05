import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildFloorplanEntities, mergeFloorplanDiscoverySchema, escapeFloorplanHtml, floorplanDescription,
  floorplanJson, floorplanSchema, floorplanSiteUrl, floorplanTitle,
  renderFloorplanDiscovery, renderFloorplanPage,
} from "../../src/lib/floorplanEntities.ts";

const e = escapeFloorplanHtml;

export function renderEntityDocument(template, plan) {
  let html = template;
  const replaceExactlyOnce = (pattern, replacement, label) => {
    if ([...html.matchAll(new RegExp(pattern.source, "g"))].length !== 1) throw new Error(`Unexpected template: ${label}`);
    html = html.replace(pattern, () => replacement);
  };
  replaceExactlyOnce(/<title>[\s\S]*?<\/title>/, `<title>${e(floorplanTitle(plan))}</title>`, "title");
  for (const [attribute, name, content] of [
    ["name", "description", floorplanDescription(plan)],
    ["property", "og:title", floorplanTitle(plan)],
    ["property", "og:description", floorplanDescription(plan)],
    ["property", "og:url", plan.canonical],
    ["property", "og:image", `${floorplanSiteUrl}${plan.preview}`],
    ["name", "twitter:title", floorplanTitle(plan)],
    ["name", "twitter:description", floorplanDescription(plan)],
    ["name", "twitter:image", `${floorplanSiteUrl}${plan.preview}`],
  ]) replaceExactlyOnce(new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*/?>`), `<meta ${attribute}="${name}" content="${e(content)}" />`, name);
  replaceExactlyOnce(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${e(plan.canonical)}" />`, "canonical");
  // Existing prerenderer emits this explicit end marker after the app div.
  // Match that contract, never the first nested </div> in the page.
  replaceExactlyOnce(/<div id="app">[\s\S]*?<script>window\.__WPB_PRERENDER_PATH__=[\s\S]*?<\/script>/,
    `<div id="app">${renderFloorplanPage(plan)}</div><script>window.__WPB_PRERENDER_PATH__=${floorplanJson(plan.path)};</script>`, "prerender app boundary");
  html = html.replace(/\s*<script id="wpb-(?:static-structured-data|floorplan-schema)"[^>]*>[\s\S]*?<\/script>/g, "");
  return html.replace(/\s*<\/head>/, `<script id="wpb-floorplan-schema" type="application/ld+json">${floorplanJson(floorplanSchema(plan))}</script>\n</head>`);
}

export function addDiscovery(html, route) {
  const block = renderFloorplanDiscovery(route);
  if (!block) return html;
  html = html.replace(/\s*<section id="wpb-floorplan-guides"[^>]*>[\s\S]*?<\/section>/g, "");
  html = html.replace(/\s*<script id="wpb-floorplan-index-schema"[^>]*>[\s\S]*?<\/script>/g, "");
  if ((html.match(/<\/main>/g) ?? []).length !== 1) throw new Error(`Expected one main landmark: ${route}`);
  const pattern = /(<script id="wpb-static-structured-data"[^>]*>)([\s\S]*?)(<\/script>)/g;
  if ([...html.matchAll(pattern)].length !== 1) throw new Error(`Expected one existing page graph: ${route}`);
  html = html.replace(pattern, (_match, open, json, close) =>
    `${open}${floorplanJson(mergeFloorplanDiscoverySchema(JSON.parse(json), route))}${close}`);
  return html.replace("</main>", `${block}</main>`);
}

export function addSitemapEntities(xml, plans) {
  const paths = new Set(plans.map((plan) => plan.canonical));
  if (paths.size !== plans.length) throw new Error("Duplicate entity canonicals");
  if (!xml.includes("</urlset>")) throw new Error("Expected sitemap urlset");
  const clean = xml.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    return paths.has(loc) ? "" : block;
  });
  const entries = plans.map((plan) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(plan.updatedOn) || plan.updatedOn > new Date().toISOString().slice(0, 10)) throw new Error("Invalid meaningful modification date");
    return `  <url><loc>${e(plan.canonical)}</loc><lastmod>${plan.updatedOn}</lastmod></url>`;
  }).join("\n");
  return clean.replace(/\s*<\/urlset>/, `\n${entries}\n</urlset>`);
}

export async function prerenderFloorplanEntities(root = process.cwd()) {
  const dist = path.join(root, "dist");
  const plans = buildFloorplanEntities();
  const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
  // Validate every source asset before writing any route. Approved assets only.
  for (const plan of plans) {
    for (const asset of [plan.pdf, plan.preview]) {
      if (!asset.startsWith(`/assets/projects/${plan.projectId}/floorplans/`) || asset.includes("..")) throw new Error(`Unapproved plan asset: ${asset}`);
      const stats = await fs.stat(path.join(dist, asset.slice(1)));
      if (!stats.isFile() || !stats.size) throw new Error(`Missing plan asset: ${asset}`);
    }
  }
  for (const plan of plans) {
    const target = path.join(dist, plan.path.slice(1), "index.html");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, renderEntityDocument(template, plan));
  }
  for (const route of ["/floorplans/", ...new Set(plans.map((plan) => `/projects/${plan.projectId}/`))]) {
    const file = path.join(dist, route.slice(1), "index.html");
    await fs.writeFile(file, addDiscovery(await fs.readFile(file, "utf8"), route));
  }
  const sitemap = path.join(dist, "sitemap.xml");
  await fs.writeFile(sitemap, addSitemapEntities(await fs.readFile(sitemap, "utf8"), plans));
  console.log(JSON.stringify({ floorplanEntitiesPrerendered: plans.map((plan) => plan.path) }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  prerenderFloorplanEntities().catch((error) => { console.error(error); process.exitCode = 1; });
}
