import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const records = JSON.parse(await fs.readFile(path.join(root, "public/data/project-seo-batch4.json"), "utf8"));

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const jsonForHtml = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const list = (items) => `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
const styleLink = '<link rel="stylesheet" href="/project-seo-batch4.css" data-project-seo-batch4-style="true" />';

function guide(record) {
  return `<section id="wpb-project-seo-batch4" class="p2-project-guide" data-project-id="${esc(record.projectId)}">
    <div class="p2-project-guide__inner">
      <p class="p2-project-guide__eyebrow">${esc(record.eyebrow)}</p>
      <h2>Buyer summary</h2>
      <p class="p2-project-guide__opening">${esc(record.opening)}</p>
      <div class="p2-project-guide__actions" aria-label="Current buyer requests">
        <a class="btn primary" data-project-growth-action="availability" href="${esc(record.availabilityHref)}">Request current availability</a>
        <a class="btn secondary" data-project-growth-action="pricing-packet" href="${esc(record.packetHref)}">Get pricing + floor-plan packet</a>
      </div>
      <div class="p2-project-guide__grid">
        <article><h3>Who this fits</h3><p>${esc(record.buyerFit)}</p></article>
        <article><h3>Location</h3><p>${esc(record.location)}</p></article>
      </div>
      <div class="p2-project-guide__status">
        <article><h3>Marketing status</h3><p>${esc(record.status.marketing)}</p></article>
        <article><h3>Construction status</h3><p>${esc(record.status.construction)}</p></article>
        <article><h3>Residence availability</h3><p>${esc(record.status.availability)}</p></article>
      </div>
      <div class="p2-project-guide__grid">
        <article><h3>Verified residence / layout facts</h3>${list(record.residences)}</article>
        <article><h3>Amenities and service</h3>${list(record.amenities)}</article>
      </div>
      <article><h3>Verified project facts</h3>${list(record.verifiedFacts)}</article>
      <nav class="p2-project-guide__links" aria-label="Related buyer research"><h3>Compare and keep researching</h3><ul>${record.links.map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`).join("")}</ul></nav>
      <details class="p2-project-guide__sources"><summary>Sources and review date</summary><p>Reviewed ${esc(record.reviewedOn)}. Current pricing, residence availability, fees, incentives, contract terms and construction timing require current buyer-side confirmation.</p><ul>${record.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a> · ${esc(source.kind)}</li>`).join("")}</ul></details>
    </div>
  </section>`;
}

function patchGraph(html, record) {
  const pattern = /<script id="wpb-static-structured-data" type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/;
  const match = html.match(pattern);
  if (!match) throw new Error(`${record.path}: static schema not found`);
  const schema = JSON.parse(match[1]);
  const graph = Array.isArray(schema?.["@graph"]) ? schema["@graph"] : [];
  const webPage = graph.find((node) => node?.["@type"] === "WebPage" || node?.["@type"] === "CollectionPage");
  if (webPage) {
    webPage.name = record.h1;
    webPage.description = record.description;
    webPage.dateModified = record.reviewedOn;
  }
  return html.replace(pattern, `<script id="wpb-static-structured-data" type="application/ld+json" data-static-path="${esc(record.path)}">${jsonForHtml(schema)}</script>`);
}

for (const record of records) {
  const file = path.join(dist, record.path.replace(/^\/|\/$/g, ""), "index.html");
  let html = await fs.readFile(file, "utf8");
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(record.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(record.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(record.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(record.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${esc(record.canonical)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(record.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(record.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(record.canonical)}" />`)
    .replace(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/, `<h1>${esc(record.h1)}</h1>`);
  if (!html.includes('data-project-seo-batch4-style="true"')) html = html.replace("</head>", `  ${styleLink}\n</head>`);
  html = patchGraph(html, record);
  if (!html.includes('id="wpb-project-seo-batch4"')) html = html.replace("</main>", `${guide(record)}</main>`);
  await fs.writeFile(file, html);
}

const sitemapPath = path.join(dist, "sitemap.xml");
let sitemap = await fs.readFile(sitemapPath, "utf8");
for (const record of records) {
  const loc = `<loc>${record.canonical}</loc>`;
  const start = sitemap.indexOf(loc);
  if (start === -1) throw new Error(`${record.canonical}: sitemap entry missing`);
  const end = sitemap.indexOf("</url>", start);
  const block = sitemap.slice(start, end);
  const updated = /<lastmod>[^<]+<\/lastmod>/.test(block)
    ? block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${record.reviewedOn}</lastmod>`)
    : `${block}<lastmod>${record.reviewedOn}</lastmod>`;
  sitemap = `${sitemap.slice(0, start)}${updated}${sitemap.slice(end)}`;
}
await fs.writeFile(sitemapPath, sitemap);
console.log(JSON.stringify({ projectSeoBatch4: "applied", pages: records.map((record) => record.path) }));

// Batch 5 runs after all existing static/project transformations so the same
// truthful authorship model is present in JavaScript-off HTML and hydrated SPA routes.
await import("./apply-authorship-trust.mjs");
