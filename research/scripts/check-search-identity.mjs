#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const read = (relativePath) => fs.readFile(path.join(root, relativePath), "utf8");
const index = await read("index.html");
const favicon = await read("public/favicon.svg");
const source = await read("public/brand/wpb-favicon-source.svg");
const manifest = JSON.parse(await read("public/site.webmanifest"));
const siteMeta = JSON.parse(await read("public/data/site-meta.json"));
const runtime = await read("src/main.ts");
const prerender = await read("research/scripts/prerender-static-routes.mjs");

assert.equal((index.match(/property="og:site_name"/g) ?? []).length, 1, "index must expose one og:site_name");
assert.match(index, /property="og:site_name" content="WPB New Construction"/);
for (const expected of ["/favicon.ico", "/favicon.svg", "/favicon-96x96.png", "/apple-touch-icon.png", "/site.webmanifest"]) {
  assert.ok(index.includes(expected), `index is missing ${expected}`);
}
assert.match(favicon, /viewBox="0 0 512 512"/);
assert.match(favicon, /#173b42/i);
assert.match(favicon, />WPB<\/text>/);
assert.doesNotMatch(index + favicon, /#863bff|#7e14ff|#47bfff/i, "old purple icon colors remain active");
assert.equal(source, favicon.replace(' aria-labelledby="title"', ' aria-labelledby="title desc"').replace('<title id="title">WPB New Construction</title>', '<title id="title">WPB New Construction icon source</title>\n  <desc id="desc">White WPB lettering on the established deep teal brand field, with a generous safe area for small and circular favicon presentation.</desc>'), "public favicon and editable source geometry diverge");

const expectedPngs = [
  ["favicon-16x16.png", 16], ["favicon-24x24.png", 24], ["favicon-32x32.png", 32], ["favicon-48x48.png", 48],
  ["favicon-96x96.png", 96], ["apple-touch-icon.png", 180], ["favicon-192x192.png", 192], ["favicon-512x512.png", 512],
];
for (const [name, size] of expectedPngs) {
  const metadata = await sharp(path.join(root, "public", name)).metadata();
  assert.equal(metadata.format, "png", `${name} must be PNG`);
  assert.equal(metadata.width, size, `${name} width`);
  assert.equal(metadata.height, size, `${name} height`);
}
const ico = await fs.readFile(path.join(root, "public/favicon.ico"));
assert.ok(ico.length > 500, "favicon.ico is unexpectedly small");
assert.deepEqual(manifest.icons.map(({ src, sizes, type }) => ({ src, sizes, type })), [
  { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
  { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
]);
assert.equal(siteMeta.siteName, "WPB New Construction");
assert.equal(siteMeta.alternateName, "West Palm Beach New Construction");
assert.match(runtime, /alternateName: siteMeta\.alternateName/);
assert.match(prerender, /alternateName: payload\.siteMeta\.alternateName/);

console.log(JSON.stringify({
  status: "passed",
  siteName: siteMeta.siteName,
  alternateName: siteMeta.alternateName,
  pngs: expectedPngs.length,
  iconReferences: 5,
  oldPurpleActive: false,
}, null, 2));
