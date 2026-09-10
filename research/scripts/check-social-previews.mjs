import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { absoluteSocialImageUrl, productionOrigin } from "../../shared/public-social-url.js";

const root = process.cwd();
const dist = path.join(root, "dist");
const out = path.join(root, ".runtime/batch6-social-previews");
await fs.mkdir(out, { recursive: true });
const routes = ["/", "/buildings/", "/map/", "/floorplans/", "/projects/olara/", "/projects/rosewood-residences-west-palm-beach/", "/projects/maison-dor/", "/answers/olara-vs-ritz-carlton-vs-shorecrest/", "/corridors/south-flagler/", "/inquire/"];
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2", ".xml": "application/xml" };

assert.equal(absoluteSocialImageUrl("javascript:alert(1)"), null);
assert.equal(absoluteSocialImageUrl("data:image/png;base64,AAAA"), null);
assert.equal(absoluteSocialImageUrl("http://www.wpbnewconstruction.com/x.png"), null);
assert.equal(absoluteSocialImageUrl("/maps/wpb-atlas-map.png"), `${productionOrigin}/maps/wpb-atlas-map.png`);

function htmlFile(route) {
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  return clean ? path.join(dist, clean, "index.html") : path.join(dist, "index.html");
}
function socialFromHtml(html, route) {
  const og = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] ?? "";
  const twitter = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)?.[1] ?? "";
  assert.ok(og, `${route}: raw og:image missing`);
  assert.ok(twitter, `${route}: raw twitter:image missing`);
  for (const value of [og, twitter]) {
    const url = new URL(value);
    assert.equal(url.protocol, "https:", `${route}: social image must be HTTPS`);
    assert.equal(url.username, "");
    assert.equal(url.password, "");
  }
  assert.equal(og, twitter, `${route}: OG/Twitter approved image must agree`);
  return { og, twitter };
}

const raw = {};
for (const route of routes) raw[route] = socialFromHtml(await fs.readFile(htmlFile(route), "utf8"), route);

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.resolve(dist, `.${pathname}`);
    if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error("invalid path");
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file, "index.html");
    res.setHeader("Content-Type", mime[path.extname(file).toLowerCase()] ?? "application/octet-stream");
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404); res.end("Not found"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];

async function assertImageAvailable(page, absolute, route) {
  const url = new URL(absolute);
  if (url.origin !== productionOrigin) return;
  const response = await page.request.get(`${origin}${url.pathname}`);
  assert.equal(response.ok(), true, `${route}: approved image missing from candidate build: ${url.pathname}`);
  assert.match(response.headers()["content-type"] ?? "", /^image\//, `${route}: social image content type`);
}

try {
  for (const javaScriptEnabled of [false, true]) {
    for (const route of routes) {
      const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      const response = await page.goto(`${origin}${route}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" });
      assert.equal(response?.status(), 200, `${route}: status`);
      const og = await page.locator('meta[property="og:image"]').getAttribute("content");
      const twitter = await page.locator('meta[name="twitter:image"]').getAttribute("content");
      assert.equal(og, raw[route].og, `${route}: ${javaScriptEnabled ? "hydrated" : "JS-off"} OG artwork changed`);
      assert.equal(twitter, raw[route].twitter, `${route}: ${javaScriptEnabled ? "hydrated" : "JS-off"} Twitter artwork changed`);
      assert.ok(og?.startsWith("https://"));
      await assertImageAvailable(page, og, route);
      results.push({ route, javaScriptEnabled, image: og, status: "pass" });
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  for (const destination of ["/buildings/", "/floorplans/"]) {
    const target = page.locator(`a[href="${destination}"]:visible`).first();
    assert.ok(await target.count(), `SPA source link missing: ${destination}`);
    await target.click();
    await page.waitForURL((url) => url.pathname === destination);
    await page.waitForTimeout(50);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitter = await page.locator('meta[name="twitter:image"]').getAttribute("content");
    assert.equal(og, raw[destination].og, `${destination}: SPA OG must match raw canonical artwork`);
    assert.equal(twitter, raw[destination].twitter, `${destination}: SPA Twitter must match raw canonical artwork`);
  }
  await context.close();
} finally {
  await browser.close();
  server.close();
}

await fs.writeFile(path.join(out, "results.json"), JSON.stringify({ routes, results }, null, 2));
console.log(JSON.stringify({ batch6SocialPreviews: "pass", rawRoutes: routes.length, browserStates: results.length }, null, 2));
