import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dist = path.join(root, "dist");
const out = path.join(root, ".runtime/batch6-concierge");
await fs.mkdir(out, { recursive: true });
const builtAssets = await fs.readdir(path.join(dist, "assets"));
const conciergeBody = builtAssets.find((name) => /^buyerConcierge-.*\.js$/.test(name));
const mainBundle = builtAssets.find((name) => /^main-.*\.js$/.test(name));
assert.ok(conciergeBody, "buyer concierge must be a separate lazy chunk");
assert.ok(mainBundle, "legacy main bundle must remain identifiable");
const conciergePath = `/assets/${conciergeBody}`;
const mainPath = `/assets/${mainBundle}`;

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2", ".xml": "application/xml" };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.resolve(dist, `.${pathname}`);
    if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error("invalid");
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file, "index.html");
    res.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404); res.end("Not found"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const routes = ["/", "/buildings/", "/map/", "/floorplans/", "/projects/olara/", "/projects/rosewood-residences-west-palm-beach/", "/projects/maison-dor/", "/answers/olara-vs-ritz-carlton-vs-shorecrest/", "/corridors/south-flagler/", "/inquire/", "/floorplans/olara/residence-d/"];
const results = [];

async function gotoReady(page, target) {
  const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
  assert.equal(response?.status(), 200, `${target}:status`);
  return response;
}

try {
  for (const width of [1440, 390]) {
    for (const route of routes) {
      const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 } });
      const page = await context.newPage();
      const requested = [];
      page.on("request", (request) => requested.push(new URL(request.url()).pathname));
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await gotoReady(page, `${origin}${route}`);
      const launcher = page.getByRole("button", { name: "Open Ask WPB buyer concierge" });
      await launcher.waitFor({ state: "visible", timeout: 15000 });
      assert.equal(requested.includes(conciergePath), false, `${route}:${width}:body must be lazy`);
      if (route.includes("/answers/olara-vs-") || route === "/floorplans/olara/residence-d/") {
        assert.equal(requested.includes(mainPath), false, `${route}:${width}:lightweight route imported legacy main`);
      }
      if (width === 390) assert.equal(await page.locator(".mobile-cta-bar:visible").count(), 0, `${route}: generic mobile bar must not overlap concierge`);
      if (route === "/inquire/") assert.notEqual(await page.locator("[data-buyer-concierge-root]").evaluate((el) => getComputedStyle(el).position), "fixed");
      await launcher.click();
      const panel = page.getByRole("dialog", { name: "Ask WPB" });
      await panel.waitFor({ state: "visible", timeout: 15000 });
      assert.equal(requested.includes(conciergePath), true, `${route}:${width}:lazy body did not load`);
      for (const heading of ["Research", "Current information", "Talk to the team"]) assert.equal(await panel.getByRole("heading", { name: heading }).count(), 1);
      await page.keyboard.press("Escape");
      assert.equal(await launcher.getAttribute("aria-expanded"), "false");
      assert.equal(await launcher.evaluate((el) => document.activeElement === el), true, `${route}:${width}:focus return`);
      assert.deepEqual(errors, [], `${route}:${width}:page errors`);
      await page.screenshot({ path: path.join(out, `${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${width}.png`), fullPage: false });
      results.push({ route, width, status: "pass", conciergeRequestedBeforeOpen: false, conciergeRequestedAfterOpen: true, mainRequested: requested.includes(mainPath) });
      await context.close();
    }
  }

  for (const route of ["/projects/olara/", "/projects/maison-dor/"]) {
    const page = await browser.newPage();
    await gotoReady(page, `${origin}${route}`);
    const form = page.locator(".brochure-inquiry-card").first();
    await form.waitFor({ timeout: 15000 });
    assert.equal(await form.locator('input[name="interest"]').inputValue(), "Request current availability");
    assert.equal(await form.locator('input[name="request_intent"]').inputValue(), "availability");
    assert.equal((await form.getByRole("heading", { level: 2 }).innerText()).trim(), "Request current availability");
    assert.equal((await form.locator('button[type="submit"]').innerText()).trim(), "Request current availability");
    assert.equal(await form.locator("[data-request-summary]").count(), 1);
    await page.close();
  }

  const inquire = await browser.newPage();
  await gotoReady(inquire, `${origin}/inquire/?interest=Request%20private%20floor-plan%20packet&project=olara`);
  const form = inquire.locator(".inquiry-form");
  await form.waitFor({ timeout: 15000 });
  assert.equal(await form.locator('select[name="interest"]').inputValue(), "Get pricing + floor-plan packet");
  assert.equal(await form.locator('input[name="request_intent"]').inputValue(), "pricing_packet");
  assert.match(await form.locator("[data-request-summary]").innerText(), /pricing \+ floor-plan packet/i);
  assert.match(await form.locator("[data-request-summary]").innerText(), /Olara/i);
  await inquire.close();
} finally {
  await browser.close();
  server.close();
}
await fs.writeFile(path.join(out, "results.json"), JSON.stringify({ conciergeBody, mainBundle, results }, null, 2));
console.log(JSON.stringify({ batch6Concierge: "pass", views: results.length, conciergeBody, mainBundle }, null, 2));
