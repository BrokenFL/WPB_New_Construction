import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { commercialEscape as e, commercialOrigin } from '../../src/lib/commercialContent.ts';
import { corridorGrowthPages, corridorGrowthSchema, corridorJson, corridorReviewedDate, renderGrowthCorridor } from '../../src/lib/corridorGrowthContent.ts';
export function renderCorridorDocument(source, key) {
  const copy = corridorGrowthPages[key];
  if (!copy) throw new Error('Unknown corridor');
  let html = source;
  const replaceOne = (pattern, replacement, label) => {
    if ([...html.matchAll(new RegExp(pattern.source, 'g'))].length !== 1) throw new Error(`Corridor template mismatch: ${label}`);
    html = html.replace(pattern, () => replacement);
  };
  const canonical = commercialOrigin + copy.path;
  if (!html.includes(`rel="canonical" href="${canonical}"`)) throw new Error('Corridor canonical must remain unchanged');
  replaceOne(/<title>[\s\S]*?<\/title>/, `<title>${e(copy.title)}</title>`, 'title');
  for (const [attr, name, value] of [['name','description',copy.description],['property','og:title',copy.title],['property','og:description',copy.description],['name','twitter:title',copy.title],['name','twitter:description',copy.description]]) {
    replaceOne(new RegExp(`<meta ${attr}="${name}" content="[^"]*"\\s*/?>`), `<meta ${attr}="${name}" content="${e(value)}" />`, name);
  }
  const recent = html.match(/<section>\s*<h2>Latest [\s\S]*?<\/section>/)?.[0] ?? '';
  replaceOne(/<main class="static-prerender"[^>]*>[\s\S]*?<\/main>/, `<main class="static-prerender" data-static-prerender="corridor-${key}">${renderGrowthCorridor(key)}${recent}</main>`, 'main');
  const pattern = /(<script id="wpb-static-structured-data"[^>]*>)([\s\S]*?)(<\/script>)/g;
  if ([...html.matchAll(pattern)].length !== 1) throw new Error('Expected one corridor schema graph');
  html = html.replace(pattern, (_, open, text, close) => open + corridorJson(corridorGrowthSchema(JSON.parse(text), key)) + close);
  return html;
}
export async function prerenderCorridorGrowth(root = process.cwd()) {
  for (const [key, copy] of Object.entries(corridorGrowthPages)) {
    const file = path.join(root, 'dist', copy.path.slice(1), 'index.html');
    await fs.writeFile(file, renderCorridorDocument(await fs.readFile(file, 'utf8'), key));
  }
  const file = path.join(root, 'dist', 'sitemap.xml');
  let sitemap = await fs.readFile(file, 'utf8');
  for (const copy of Object.values(corridorGrowthPages)) {
    const canonical = commercialOrigin + copy.path;
    let matches = 0;
    sitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, entry => {
      if (!entry.includes(`<loc>${canonical}</loc>`)) return entry;
      matches++;
      return entry.includes('<lastmod>') ? entry.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${corridorReviewedDate}</lastmod>`) : entry.replace('</loc>', `</loc><lastmod>${corridorReviewedDate}</lastmod>`);
    });
    if (matches !== 1) throw new Error('Expected one existing clean corridor sitemap URL');
  }
  await fs.writeFile(file, sitemap);
  console.log(JSON.stringify({ corridorGrowth: 'pass', routes: Object.values(corridorGrowthPages).map(c => c.path), newRoutes: 0 }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  prerenderCorridorGrowth().catch(error => { console.error(error); process.exitCode = 1; });
}
