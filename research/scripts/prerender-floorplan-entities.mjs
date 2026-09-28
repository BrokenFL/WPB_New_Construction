import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildFloorplanEntities, publishedFloorplanEntities, mergeFloorplanDiscoverySchema, escapeFloorplanHtml, floorplanDescription,
  floorplanJson, floorplanSchema, floorplanSiteUrl, floorplanTitle, floorplanModifiedOn,
  renderFloorplanDiscovery, renderFloorplanPage,
} from "../../src/lib/floorplanEntities.ts";
import {
  approved3DPlanEntities, renderResidence3DDiscoveryPage, residence3DDiscoveryDescription,
  residence3DDiscoveryPath, residence3DDiscoverySchema, residence3DDiscoveryTitle,
} from "../../src/lib/residence3DDiscovery.ts";

const e = escapeFloorplanHtml;

// Paths served by the dedicated per-plan page system (src/data/floorplanPlanPages.ts).
async function siteDataPlanPagePaths(root) {
  try {
    const src = await fs.readFile(path.join(root, "src/generated/siteData.ts"), "utf8");
    return [...src.matchAll(/"path": "\/floorplans\/[^"]+\/[^"]+\/"/g)].map((m) => m[0].slice(9, -1));
  } catch {
    return [];
  }
}

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
  html = html.replace(/\s*<section id="wpb-floorplan-guides"[^>]*>[\s\S]*?<\/section>/g, "");
  html = html.replace(/\s*<script id="wpb-floorplan-index-schema"[^>]*>[\s\S]*?<\/script>/g, "");
  if ((html.match(/<\/main>/g) ?? []).length !== 1) throw new Error(`Expected one main landmark: ${route}`);
  const pattern = /(<script id="wpb-static-structured-data"[^>]*>)([\s\S]*?)(<\/script>)/g;
  if ([...html.matchAll(pattern)].length !== 1) throw new Error(`Expected one existing page graph: ${route}`);
  html = html.replace(pattern, (_match, open, json, close) =>
    `${open}${floorplanJson(mergeFloorplanDiscoverySchema(JSON.parse(json), route))}${close}`);
  if (route.startsWith("/projects/")) {
    const offering = /(<section data-project-section="offering">[\s\S]*?<\/section>)/;
    if (!offering.test(html)) throw new Error(`Expected project offering section: ${route}`);
    return html.replace(offering, `$1${block}`);
  }
  return html.replace("</main>", `${block}</main>`);
}

export function render3DDiscoveryDocument(template) {
  let html = template;
  const canonical = `${floorplanSiteUrl}${residence3DDiscoveryPath}`;
  const leadModel = approved3DPlanEntities()[0]?.models3D.find((model) => model.status === "approved");
  const socialImage = leadModel ? `${floorplanSiteUrl}${leadModel.posterUrl}` : null;
  const replaceOnce = (pattern, replacement, label) => {
    if ([...html.matchAll(new RegExp(pattern.source, "g"))].length !== 1) throw new Error(`Unexpected 3D discovery template: ${label}`);
    html = html.replace(pattern, () => replacement);
  };
  replaceOnce(/<title>[\s\S]*?<\/title>/, `<title>${e(residence3DDiscoveryTitle)}</title>`, "title");
  for (const [attribute, name, content] of [
    ["name", "description", residence3DDiscoveryDescription],
    ["property", "og:title", residence3DDiscoveryTitle],
    ["property", "og:description", residence3DDiscoveryDescription],
    ["property", "og:url", canonical],
    ["name", "twitter:title", residence3DDiscoveryTitle],
    ["name", "twitter:description", residence3DDiscoveryDescription],
  ]) replaceOnce(new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*/?>`), `<meta ${attribute}="${name}" content="${e(content)}" />`, name);
  if (socialImage) for (const [attribute, name] of [["property", "og:image"], ["name", "twitter:image"]])
    replaceOnce(new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*/?>`), `<meta ${attribute}="${name}" content="${e(socialImage)}" />`, name);
  replaceOnce(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`, "canonical");
  replaceOnce(/<div id="app">[\s\S]*?<script>window\.__WPB_PRERENDER_PATH__=[\s\S]*?<\/script>/,
    `<div id="app">${renderResidence3DDiscoveryPage()}</div><script>window.__WPB_PRERENDER_PATH__=${floorplanJson(residence3DDiscoveryPath)};</script>`, "app");
  html = html.replace(/\s*<script id="wpb-(?:static-structured-data|residence-3d-schema)"[^>]*>[\s\S]*?<\/script>/g, "");
  return html.replace(/\s*<\/head>/, `<script id="wpb-residence-3d-schema" type="application/ld+json">${floorplanJson(residence3DDiscoverySchema())}</script>\n</head>`);
}

export function addSitemapEntities(xml, plans, extraCanonicals = []) {
  const extra = new Set(extraCanonicals);
  const ownedPlans = plans.filter((plan) => !extra.has(plan.canonical));
  const selected = new Set(ownedPlans.map((plan) => plan.canonical));
  const hub = `${floorplanSiteUrl}${residence3DDiscoveryPath}`;
  // The dedicated per-plan generator owns its existing URLs. Reconcile only
  // legacy entity URLs and the 3D hub; never remove or duplicate a per-plan URL.
  const paths = new Set([...selected, ...buildFloorplanEntities().map((plan) => plan.canonical), hub].filter((canonical) => !extra.has(canonical)));
  if (selected.size !== ownedPlans.length) throw new Error("Duplicate entity canonicals");
  if (!xml.includes("</urlset>")) throw new Error("Expected sitemap urlset");
  const clean = xml.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    return paths.has(loc) ? "" : block;
  });
  const entries = ownedPlans.map((plan) => {
    const modifiedOn = floorplanModifiedOn(plan);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(modifiedOn) || modifiedOn > new Date().toISOString().slice(0, 10)) throw new Error("Invalid meaningful modification date");
    return `  <url><loc>${e(plan.canonical)}</loc><lastmod>${modifiedOn}</lastmod></url>`;
  });
  if (approved3DPlanEntities().length) entries.push(`  <url><loc>${hub}</loc><lastmod>${approved3DPlanEntities().map((plan) => plan.models3D.find((model) => model.status === "approved").updatedOn).sort().at(-1)}</lastmod></url>`);
  return clean.replace(/\s*<\/urlset>/, `\n${entries.join("\n")}\n</urlset>`);
}

export function add3DLlmsInventory(text) {
  const heading = "## Interactive 3D Floor Plans";
  const clean = text.replace(/\n## Interactive 3D Floor Plans\n[\s\S]*?(?=\n## |$)/, "");
  const plans = approved3DPlanEntities();
  if (!plans.length) return clean;
  const lines = [heading, "", `- Interactive 3D floor plan gallery: ${residence3DDiscoveryPath}`,
    ...plans.map((plan) => `- ${plan.projectName} ${plan.planName}: ${plan.path}`)];
  return `${clean.trimEnd()}\n\n${lines.join("\n")}\n`;
}

export async function prerenderFloorplanEntities(root = process.cwd()) {
  const dist = path.join(root, "dist");
  const plans = publishedFloorplanEntities();
  const reviewed = buildFloorplanEntities();
  const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
  const buildManifest = JSON.parse(await fs.readFile(path.join(root, ".runtime/build/manifest.json"), "utf8"));
  const withRouteStyles = async (html, entry) => {
    const styles = buildManifest[entry]?.css;
    if (!styles?.length) throw new Error(`Missing residence route styles: ${entry}`);
    for (const file of styles) {
      if (!/^assets\/[a-zA-Z0-9_.-]+\.css$/.test(file)) throw new Error(`Invalid route stylesheet: ${file}`);
      await fs.access(path.join(dist, file));
    }
    // CSS must be present in static HTML too: the poster page remains styled
    // when scripting or the enhancement bundle is unavailable.
    return html.replace("</head>", `${styles.map((file) => `<link rel="stylesheet" href="/${file}">`).join("")}\n</head>`);
  };
  // Validate every source asset before writing any route. Approved assets only.
  for (const plan of plans) {
    for (const asset of [plan.pdf, plan.preview]) {
      if (!asset.startsWith(`/assets/projects/${plan.projectId}/floorplans/`) || asset.includes("..")) throw new Error(`Unapproved plan asset: ${asset}`);
      const stats = await fs.stat(path.join(dist, asset.slice(1)));
      if (!stats.isFile() || !stats.size) throw new Error(`Missing plan asset: ${asset}`);
    }
    for (const model of plan.models3D.filter((item) => item.status === "approved")) {
      for (const asset of [model.modelUrl, model.posterUrl, model.mobilePosterUrl].filter(Boolean)) {
        if (!asset.startsWith(`/assets/projects/${plan.projectId}/3d/${plan.slug}/`) || asset.includes("..")) throw new Error(`Unapproved 3D asset: ${asset}`);
        const stats = await fs.stat(path.join(dist, asset.slice(1)));
        if (!stats.isFile() || !stats.size) throw new Error(`Missing 3D asset: ${asset}`);
      }
    }
  }
  // Standalone postbuild reruns must also remove a formerly emitted pending page.
  // Preserve paths now served by the per-plan floor-plan page system
  // (src/data/floorplanPlanPages.ts) so the new SEO pages are not deleted.
  const siteDataSource = await fs.readFile(path.join(root, "src/generated/siteData.ts"), "utf8").catch(() => "");
  const planPagePaths = new Set(
    [...siteDataSource.matchAll(/"path": "\/floorplans\/[^"]+\/[^"]+\/"/g)].map((m) => m[0].slice(9, -1)),
  );
  for (const plan of reviewed.filter((item) => !plans.some((live) => live.path === item.path) && !planPagePaths.has(item.path))) {
    await fs.rm(path.join(dist, plan.path.slice(1)), { recursive: true, force: true });
  }
  for (const plan of plans.filter((item) => !planPagePaths.has(item.path))) {
    const target = path.join(dist, plan.path.slice(1), "index.html");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, await withRouteStyles(renderEntityDocument(template, plan), "src/floorplanPage.ts"));
  }
  const discoveryFile = path.join(dist, residence3DDiscoveryPath.slice(1), "index.html");
  if (approved3DPlanEntities().length) {
    await fs.mkdir(path.dirname(discoveryFile), { recursive: true });
    await fs.writeFile(discoveryFile, await withRouteStyles(render3DDiscoveryDocument(template), "src/residence3DPage.ts"));
  } else await fs.rm(path.dirname(discoveryFile), { recursive: true, force: true });
  for (const route of ["/floorplans/", ...new Set(reviewed.map((plan) => `/projects/${plan.projectId}/`))]) {
    const file = path.join(dist, route.slice(1), "index.html");
    await fs.writeFile(file, addDiscovery(await fs.readFile(file, "utf8"), route));
  }
  const sitemap = path.join(dist, "sitemap.xml");
  const planPageCanonicals = [...(await siteDataPlanPagePaths(root))].map((p) => `${floorplanSiteUrl}${p}`);
  await fs.writeFile(sitemap, addSitemapEntities(await fs.readFile(sitemap, "utf8"), plans, planPageCanonicals));
  const llms = path.join(dist, "llms.txt");
  await fs.writeFile(llms, add3DLlmsInventory(await fs.readFile(llms, "utf8")));
  console.log(JSON.stringify({ floorplanEntitiesPrerendered: plans.map((plan) => plan.path) }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  prerenderFloorplanEntities().catch((error) => { console.error(error); process.exitCode = 1; });
}
