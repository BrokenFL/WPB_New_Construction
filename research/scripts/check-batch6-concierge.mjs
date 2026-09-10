import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { requestIntentDefinitions } from "../../shared/request-intents.js";
import { normalizeLead } from "../../functions/_shared/lead-utils.js";
import { normalizeServerRequestIntent } from "../../functions/api/leads.js";

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
const requestExamples = [];

async function createAuditContext(options = {}) {
  const context = await browser.newContext({ serviceWorkers: "block", ...options });
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === origin) await route.continue();
    else await route.abort();
  });
  return context;
}

async function gotoReady(page, target) {
  const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
  assert.equal(response?.status(), 200, `${target}:status`);
  return response;
}

try {
  for (const width of [1440, 390]) {
    const context = await createAuditContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion: "reduce" });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      const requested = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => requested.push(new URL(request.url()).pathname));
      console.log(`concierge view ${route} ${width}`);
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
      const closeState = await page.evaluate(() => {
        const current = document.querySelector(".buyer-concierge-launcher");
        return { exists: Boolean(current), expanded: current?.getAttribute("aria-expanded") ?? null, focused: document.activeElement === current };
      });
      assert.deepEqual(closeState, { exists: true, expanded: "false", focused: true }, `${route}:${width}: Escape closes and returns focus`);
      assert.deepEqual(errors, [], `${route}:${width}:page errors`);
      results.push({ route, width, status: "pass", conciergeRequestedBeforeOpen: false, conciergeRequestedAfterOpen: true, mainRequested: requested.includes(mainPath) });
      console.log(`concierge pass ${route} ${width}`);
    }
    await context.close();
  }

  const formContext = await createAuditContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  for (const route of ["/projects/olara/", "/projects/maison-dor/"]) {
    const formPage = await formContext.newPage();
    await gotoReady(formPage, `${origin}${route}`);
    const form = formPage.locator(".brochure-inquiry-card").first();
    await form.waitFor({ timeout: 15000 });
    assert.equal(await form.locator('input[name="interest"]').inputValue(), "Request current availability");
    assert.equal(await form.locator('input[name="request_intent"]').inputValue(), "availability");
    assert.equal((await form.getByRole("heading", { level: 2 }).innerText()).trim(), "Request current availability");
    assert.equal((await form.locator('button[type="submit"]').innerText()).trim(), "Request current availability");
    assert.equal(await form.locator("[data-request-summary]").count(), 1);
  }
  await formContext.close();

  const legacyByIntent = {
    availability: "Request current availability",
    pricing_packet: "Request private floor-plan packet",
    compare_shortlist: "Compare buildings",
    project_question: "Ask the team about this building",
    conversation_tour: "Schedule private tour",
  };
  const intentContext = await createAuditContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  for (const [id, definition] of Object.entries(requestIntentDefinitions)) {
    const intentPage = await intentContext.newPage();
    const legacy = legacyByIntent[id];
    await gotoReady(intentPage, `${origin}/inquire/?interest=${encodeURIComponent(legacy)}&project=olara`);
    const form = intentPage.locator(".inquiry-form");
    await form.waitFor({ timeout: 15000 });
    const visibleSummary = (await form.locator("[data-request-summary]").innerText()).trim();
    assert.equal(await form.locator('select[name="interest"]').inputValue(), definition.interest, `${id}: canonical browser interest`);
    assert.equal(await form.locator('input[name="request_intent"]').inputValue(), id, `${id}: browser intent id`);
    assert.ok(visibleSummary.includes(definition.buttonLabel), `${id}: visible action`);
    assert.match(visibleSummary, /Olara/i, `${id}: visible subject`);
    const body = { form_type: "inquiry", name: "QA Example", email: "qa@example.invalid", consent: "true", project: "olara", request_intent: id, interest: definition.interest };
    const normalizedLead = normalizeServerRequestIntent(body, normalizeLead(body, new Request("https://www.wpbnewconstruction.com/api/leads", { method: "POST" })));
    requestExamples.push({
      id,
      legacyInput: legacy,
      visibleSummary,
      submitted: { request_intent: id, interest: definition.interest, project: "olara" },
      normalized: { request_intent: normalizedLead.request_intent, interest: normalizedLead.interest, project_id: normalizedLead.project_id },
    });
  }
  await intentContext.close();

  const navContext = await createAuditContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const nav = await navContext.newPage();
  await gotoReady(nav, `${origin}/projects/olara/`);
  await nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 });
  await gotoReady(nav, `${origin}/floorplans/`);
  await nav.goBack({ waitUntil: "domcontentloaded", timeout: 15000 });
  await nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 });
  assert.equal(new URL(nav.url()).pathname, "/projects/olara/");
  await nav.goForward({ waitUntil: "domcontentloaded", timeout: 15000 });
  await nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 });
  assert.equal(new URL(nav.url()).pathname, "/floorplans/");
  await nav.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
  await nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 });
  await navContext.close();

  const jsOffContext = await createAuditContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  for (const route of ["/answers/olara-vs-ritz-carlton-vs-shorecrest/", "/floorplans/olara/residence-d/"]) {
    const jsOff = await jsOffContext.newPage();
    await gotoReady(jsOff, `${origin}${route}`);
    assert.ok((await jsOff.locator("h1").first().innerText()).trim().length > 3, `${route}: JS-off H1`);
    assert.ok(await jsOff.locator('a[href^="/"]').count() > 0, `${route}: JS-off native research/navigation links`);
    assert.equal(await jsOff.locator("[data-buyer-concierge-root]").count(), 0, `${route}: optional concierge should not replace JS-off content`);
  }
  await jsOffContext.close();
} finally {
  await browser.close();
  server.close();
}
await fs.writeFile(path.join(out, "request-examples.json"), JSON.stringify(requestExamples, null, 2));
await fs.writeFile(path.join(out, "results.json"), JSON.stringify({ conciergeBody, mainBundle, results, requestExamples: requestExamples.map(({ id, submitted, normalized }) => ({ id, submitted, normalized })) }, null, 2));
console.log(JSON.stringify({ batch6Concierge: "pass", views: results.length, requestExamples: requestExamples.length, conciergeBody, mainBundle }, null, 2));
