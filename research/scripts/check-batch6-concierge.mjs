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
const lifecycle = [];
const stageTimings = [];

function logStage(label, stage, state, ms = null) {
  const suffix = ms == null ? "" : ` ${ms}ms`;
  console.log(`stage ${label} ${stage}:${state}${suffix}`);
}

async function step(label, stage, fn, timeoutMs = 15000) {
  const started = Date.now();
  logStage(label, stage, "start");
  let timer;
  try {
    const value = await Promise.race([
      Promise.resolve().then(fn),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label}:${stage}:timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
    const ms = Date.now() - started;
    stageTimings.push({ label, stage, result: "pass", ms });
    logStage(label, stage, "pass", ms);
    return value;
  } catch (error) {
    const ms = Date.now() - started;
    stageTimings.push({ label, stage, result: "fail", ms, error: error instanceof Error ? error.message : String(error) });
    logStage(label, stage, "fail", ms);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function createAuditContext(options = {}, label = "context") {
  // This suite audits concierge behavior, not the separate analytics-consent UX.
  // Start each browser context with an explicit denied preference so the consent
  // dialog correctly remains absent instead of intercepting unrelated clicks.
  const storageState = {
    cookies: [],
    origins: [{ origin, localStorage: [{ name: "wpbAnalyticsConsentV1", value: "denied" }] }],
  };
  const context = await step(label, "context.create", () => browser.newContext({ serviceWorkers: "block", storageState, ...options }), 10000);
  await step(label, "context.route-install", () => context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === origin) await route.continue();
    else await route.abort();
  }), 5000);
  return context;
}

async function gotoReady(page, target, label = target) {
  logStage(label, "goto.waitUntil", "domcontentloaded");
  const response = await step(label, "page.goto", () => page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 }), 35000);
  assert.equal(response?.status(), 200, `${target}:status`);
  return response;
}

async function bounded(label, fn, timeoutMs = 5000) {
  const started = Date.now();
  let timer;
  try {
    const result = await Promise.race([
      Promise.resolve().then(fn).then(() => "closed"),
      new Promise((resolve) => { timer = setTimeout(() => resolve("timeout"), timeoutMs); }),
    ]);
    return { label, result, ms: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

async function closePageAndContext(page, context, label) {
  const pageClose = page && !page.isClosed()
    ? await bounded(`${label}:page.close`, () => page.close({ runBeforeUnload: false }), 5000)
    : { label: `${label}:page.close`, result: "already-closed", ms: 0 };
  const contextClose = await bounded(`${label}:context.close`, () => context.close(), 5000);
  lifecycle.push(pageClose, contextClose);
  console.log(`lifecycle ${label} page=${pageClose.result}/${pageClose.ms}ms context=${contextClose.result}/${contextClose.ms}ms`);
}

try {
  for (const width of [1440, 390]) {
    for (const route of routes) {
      const label = `${route}:${width}`;
      const context = await createAuditContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion: "reduce" }, label);
      let page;
      try {
        page = await step(label, "page.create", () => context.newPage(), 10000);
        const errors = [];
        const requested = [];
        page.on("pageerror", (error) => {
          errors.push(error.message);
          console.log(`pageerror ${label} ${error.message}`);
        });
        page.on("request", (request) => requested.push(new URL(request.url()).pathname));
        page.once("domcontentloaded", () => logStage(label, "event.DOMContentLoaded", "observed"));
        page.once("load", () => logStage(label, "event.load", "observed"));
        console.log(`concierge view ${route} ${width}`);
        const openStarted = Date.now();
        await gotoReady(page, `${origin}${route}`, label);
        const openMs = Date.now() - openStarted;

        await step(label, "application.shell", () => page.waitForFunction(() => {
          const app = document.querySelector("#app");
          return Boolean(app && app.childElementCount > 0);
        }, null, { timeout: 10000 }), 12000);

        const launcher = page.getByRole("button", { name: "Open Ask WPB buyer concierge" });
        await step(label, "launcher.exists", async () => {
          assert.equal(await launcher.count(), 1, `${label}: launcher attached exactly once`);
        }, 5000);
        await step(label, "launcher.visible", () => launcher.waitFor({ state: "visible", timeout: 10000 }), 12000);

        assert.equal(requested.includes(conciergePath), false, `${route}:${width}:body must be lazy`);
        if (route.includes("/answers/olara-vs-") || route === "/floorplans/olara/residence-d/") assert.equal(requested.includes(mainPath), false, `${route}:${width}:lightweight route imported legacy main`);
        if (width === 390) assert.equal(await step(label, "assert.mobile-ownership", () => page.locator(".mobile-cta-bar:visible").count(), 5000), 0, `${route}: generic mobile bar must not overlap concierge`);
        if (route === "/inquire/") assert.notEqual(await step(label, "assert.inquire-position", () => page.locator("[data-buyer-concierge-root]").evaluate((el) => getComputedStyle(el).position), 5000), "fixed");

        const launchStarted = Date.now();
        await step(label, "launcher.click", () => launcher.click({ timeout: 10000 }), 12000);
        const panel = page.getByRole("dialog", { name: "Ask WPB" });
        await step(label, "dialog.attached", () => panel.waitFor({ state: "attached", timeout: 10000 }), 12000);
        await step(label, "dialog.visible", () => panel.waitFor({ state: "visible", timeout: 10000 }), 12000);
        const launchMs = Date.now() - launchStarted;

        await step(label, "assert.dialog-content", async () => {
          assert.equal(requested.includes(conciergePath), true, `${route}:${width}:lazy body did not load`);
          for (const heading of ["Research", "Current information", "Talk to the team"]) assert.equal(await panel.getByRole("heading", { name: heading }).count(), 1);
        }, 10000);

        await step(label, "escape", () => page.keyboard.press("Escape"), 5000);
        const closeState = await step(label, "focus-return", () => page.evaluate(() => {
          const current = document.querySelector(".buyer-concierge-launcher");
          return { exists: Boolean(current), expanded: current?.getAttribute("aria-expanded") ?? null, focused: document.activeElement === current };
        }), 5000);
        assert.deepEqual(closeState, { exists: true, expanded: "false", focused: true }, `${route}:${width}: Escape closes and returns focus`);
        assert.deepEqual(errors, [], `${route}:${width}:page errors`);
        results.push({ route, width, status: "pass", openMs, launchMs, conciergeRequestedBeforeOpen: false, conciergeRequestedAfterOpen: true, mainRequested: requested.includes(mainPath) });
        console.log(`concierge pass ${route} ${width} open=${openMs}ms launch=${launchMs}ms`);
      } finally {
        await closePageAndContext(page, context, label);
      }
    }
  }

  for (const route of ["/projects/olara/", "/projects/maison-dor/"]) {
    const label = `form:${route}`;
    const context = await createAuditContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" }, label);
    let page;
    try {
      page = await step(label, "page.create", () => context.newPage(), 10000);
      await gotoReady(page, `${origin}${route}`, label);
      const form = page.locator(".brochure-inquiry-card:visible").first();
      await step(label, "form.visible", () => form.waitFor({ timeout: 15000 }), 17000);
      assert.equal(await form.locator('input[name="interest"]').inputValue(), "Request current availability");
      assert.equal(await form.locator('input[name="request_intent"]').inputValue(), "availability");
      assert.equal((await form.getByRole("heading", { level: 2 }).innerText()).trim(), "Request current availability");
      assert.equal((await form.locator('button[type="submit"]').innerText()).trim(), "Request current availability");
      assert.equal(await form.locator("[data-request-summary]").count(), 1);
    } finally { await closePageAndContext(page, context, label); }
  }

  const legacyByIntent = { availability: "Request current availability", pricing_packet: "Request private floor-plan packet", compare_shortlist: "Compare buildings", project_question: "Ask the team about this building", conversation_tour: "Schedule private tour" };
  for (const [id, definition] of Object.entries(requestIntentDefinitions)) {
    const label = `intent:${id}`;
    const context = await createAuditContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" }, label);
    let page;
    try {
      page = await step(label, "page.create", () => context.newPage(), 10000);
      const legacy = legacyByIntent[id];
      await gotoReady(page, `${origin}/inquire/?interest=${encodeURIComponent(legacy)}&project=olara`, label);
      const form = page.locator(".inquiry-form");
      await step(label, "form.visible", () => form.waitFor({ timeout: 15000 }), 17000);
      const visibleSummary = (await form.locator("[data-request-summary]").innerText()).trim();
      assert.equal(await form.locator('select[name="interest"]').inputValue(), definition.interest, `${id}: canonical browser interest`);
      assert.equal(await form.locator('input[name="request_intent"]').inputValue(), id, `${id}: browser intent id`);
      assert.ok(visibleSummary.includes(definition.buttonLabel), `${id}: visible action`);
      assert.match(visibleSummary, /Olara/i, `${id}: visible subject`);
      const body = { form_type: "inquiry", name: "QA Example", email: "qa@example.invalid", consent: "true", project: "olara", request_intent: id, interest: definition.interest };
      const normalizedLead = normalizeServerRequestIntent(body, normalizeLead(body, new Request("https://www.wpbnewconstruction.com/api/leads", { method: "POST" })));
      requestExamples.push({ id, legacyInput: legacy, visibleSummary, submitted: { request_intent: id, interest: definition.interest, project: "olara" }, normalized: { request_intent: normalizedLead.request_intent, interest: normalizedLead.interest, project_id: normalizedLead.project_id } });
    } finally { await closePageAndContext(page, context, label); }
  }

  const navContext = await createAuditContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" }, "navigation");
  let nav;
  try {
    nav = await step("navigation", "page.create", () => navContext.newPage(), 10000);
    await gotoReady(nav, `${origin}/projects/olara/`, "navigation:olara");
    await step("navigation:olara", "launcher.visible", () => nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 }), 17000);
    await gotoReady(nav, `${origin}/floorplans/`, "navigation:floorplans");
    await step("navigation", "goBack", () => nav.goBack({ waitUntil: "domcontentloaded", timeout: 15000 }), 17000);
    await step("navigation:back", "launcher.visible", () => nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 }), 17000);
    assert.equal(new URL(nav.url()).pathname, "/projects/olara/");
    await step("navigation", "goForward", () => nav.goForward({ waitUntil: "domcontentloaded", timeout: 15000 }), 17000);
    await step("navigation:forward", "launcher.visible", () => nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 }), 17000);
    assert.equal(new URL(nav.url()).pathname, "/floorplans/");
    await step("navigation", "reload", () => nav.reload({ waitUntil: "domcontentloaded", timeout: 15000 }), 17000);
    await step("navigation:reload", "launcher.visible", () => nav.getByRole("button", { name: "Open Ask WPB buyer concierge" }).waitFor({ state: "visible", timeout: 15000 }), 17000);
  } finally { await closePageAndContext(nav, navContext, "navigation"); }

  for (const route of ["/answers/olara-vs-ritz-carlton-vs-shorecrest/", "/floorplans/olara/residence-d/"]) {
    const label = `js-off:${route}`;
    const context = await createAuditContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }, label);
    let page;
    try {
      page = await step(label, "page.create", () => context.newPage(), 10000);
      await gotoReady(page, `${origin}${route}`, label);
      assert.ok((await page.locator("h1").first().innerText()).trim().length > 3, `${route}: JS-off H1`);
      assert.ok(await page.locator('a[href^="/"]').count() > 0, `${route}: JS-off native research/navigation links`);
      assert.equal(await page.locator("[data-buyer-concierge-root]").count(), 0, `${route}: optional concierge should not replace JS-off content`);
    } finally { await closePageAndContext(page, context, label); }
  }
} finally {
  const browserClose = await bounded("browser.close", () => browser.close(), 10000);
  lifecycle.push(browserClose);
  console.log(`lifecycle browser.close=${browserClose.result}/${browserClose.ms}ms`);
  server.close();
}
await fs.writeFile(path.join(out, "request-examples.json"), JSON.stringify(requestExamples, null, 2));
await fs.writeFile(path.join(out, "results.json"), JSON.stringify({ conciergeBody, mainBundle, results, lifecycle, stageTimings, requestExamples: requestExamples.map(({ id, submitted, normalized }) => ({ id, submitted, normalized })) }, null, 2));
console.log(JSON.stringify({ batch6Concierge: "pass", views: results.length, requestExamples: requestExamples.length, conciergeBody, mainBundle }, null, 2));