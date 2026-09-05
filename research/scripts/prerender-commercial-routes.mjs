import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { commercialPages, commercialOrigin, commercialEscape as e, commercialJson, commercialSchema, renderCommercialActions, renderCommercialGuide } from '../../src/lib/commercialContent.ts';

export function renderCommercialDocument(source, page) {
  const copy = commercialPages[page];
  if (!copy) throw new Error('Unknown commercial page');
  let html = source;
  function replaceOne(pattern, replacement, label) {
    if ([...html.matchAll(new RegExp(pattern.source, 'g'))].length !== 1) throw new Error(`Commercial template mismatch: ${label}`);
    html = html.replace(pattern, () => replacement);
  }
  replaceOne(/<title>[\s\S]*?<\/title>/, `<title>${e(copy.title)}</title>`, 'title');
  for (const [attr, name, value] of [
    ['name', 'description', copy.description], ['property', 'og:title', copy.title],
    ['property', 'og:description', copy.description], ['name', 'twitter:title', copy.title],
    ['name', 'twitter:description', copy.description],
  ]) replaceOne(new RegExp(`<meta ${attr}="${name}" content="[^"]*"\\s*/?>`), `<meta ${attr}="${name}" content="${e(value)}" />`, name);
  const canonical = commercialOrigin + copy.path;
  if (!html.includes(`rel="canonical" href="${canonical}"`)) throw new Error('Unexpected canonical; do not change winning URLs');
  html = html.replace(/\s*<section class="cg-guide"[\s\S]*?<\/section>/g, '');
  const introPattern = /(<main class="static-prerender"[^>]*>)\s*<section(?: class="cg-static-intro")?>[\s\S]*?<\/section>/;
  if (!introPattern.test(html)) throw new Error('Missing static commercial introduction');
  html = html.replace(introPattern, (_, open) => `${open}<section class="cg-static-intro"><p>WPB New Construction</p><h1>${e(copy.heading)}</h1><p>${e(copy.intro)}</p>${renderCommercialActions(page)}</section>${renderCommercialGuide(page)}`);
  html = html.replace('Tracked building entities', 'Browse project guides')
    .replace('Each project page is the canonical entity page for that building or benchmark.', 'Open a building guide for reported project details and useful comparison points.')
    .replace('Browse released floorplan records', 'Browse released floor plans');
  const schema = /(<script id="wpb-static-structured-data"[^>]*>)([\s\S]*?)(<\/script>)/g;
  if ([...html.matchAll(schema)].length !== 1) throw new Error('Expected existing single static graph');
  html = html.replace(schema, (_, open, data, close) => open + commercialJson(commercialSchema(JSON.parse(data), page)) + close);
  return html;
}
export async function prerenderCommercialRoutes(root = process.cwd()) {
  for (const [page, copy] of Object.entries(commercialPages)) {
    const file = path.join(root, 'dist', copy.path.slice(1), 'index.html');
    await fs.writeFile(file, renderCommercialDocument(await fs.readFile(file, 'utf8'), page));
  }
  console.log(JSON.stringify({ commercialPrerender: 'pass', routes: Object.values(commercialPages).map((page) => page.path) }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  prerenderCommercialRoutes().catch((error) => { console.error(error); process.exitCode = 1; });
}
