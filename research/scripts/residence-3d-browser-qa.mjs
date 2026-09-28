#!/usr/bin/env node

// Run after `npm run build`. This serves the built pages and assets locally,
// exercises the actual browser viewer, and writes screenshots and a JSON report.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
import sharp from "sharp";
import { residence3DModels } from "../../src/data/residence3DModels.ts";
import { perPlanPageForEntity, publishedFloorplanEntities } from "../../src/lib/floorplanEntities.ts";
import { publicProjectRecords } from "../../src/generated/projectModelPublic.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "dist");
const shots = path.join(root, "output/playwright/residence-3d-2026-09-27");
const reportFile = path.join(root, ".runtime/residence-3d-continuation/browser-qa.json");
const models = residence3DModels.filter((model) => model.status === "approved");
const publishedEntities = publishedFloorplanEntities();
const entityByModelId = new Map();
for (const model of models) {
  const entities = publishedEntities.filter((entity) => entity.projectId === model.projectId && entity.slug === model.residenceSlug);
  assert.equal(entities.length, 1, `${model.modelId}: expected exactly one published floorplan entity`);
  const attachedModels = entities[0].models3D.filter((attached) => attached.modelId === model.modelId);
  assert.equal(attachedModels.length, 1, `${model.modelId}: expected exactly one model attachment on its entity`);
  entityByModelId.set(model.modelId, entities[0]);
}
const modelIds = new Set(models.map((model) => model.modelId));
assert.equal(modelIds.size, models.length, "Approved residence model IDs must be unique");
const routeFor = (model) => entityByModelId.get(model.modelId).path;
const projectRepresentatives = [...new Map(models.map((model) => [model.projectId, model])).values()];
const fallbackRepresentatives = [...projectRepresentatives];
for (const family of ["entity", "per-plan"]) {
  const hasFamily = fallbackRepresentatives.some((model) => (perPlanPageForEntity(entityByModelId.get(model.modelId)) ? "per-plan" : "entity") === family);
  if (!hasFamily) {
    const familyModel = [...models].reverse().find((model) => (perPlanPageForEntity(entityByModelId.get(model.modelId)) ? "per-plan" : "entity") === family);
    if (familyModel && !fallbackRepresentatives.some((model) => model.modelId === familyModel.modelId)) fallbackRepresentatives.push(familyModel);
  }
}
const viewports = {
  desktop: { width: 1440, height: 960 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};
const mime = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".glb": "model/gltf-binary",
  ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".pdf": "application/pdf", ".json": "application/json", ".woff2": "font/woff2", ".xml": "application/xml",
};
let viewerChunk = "";

async function serveDist() {
  const redirectText = await fs.readFile(path.join(dist, "_redirects"), "utf8");
  const exactRedirects = new Map(redirectText.split(/\r?\n/).flatMap((line) => {
    const [source, target, status] = line.trim().split(/\s+/);
    return source && target && status && !/[:*]/.test(source) ? [[source, { target, status: Number(status) }]] : [];
  }));
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const redirect = exactRedirects.get(pathname);
      if (redirect) {
        res.writeHead(redirect.status, { Location: redirect.target });
        res.end();
        return;
      }
      let file = path.resolve(dist, `.${pathname}`);
      if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error("Invalid path");
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
      res.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end("Not found"); }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function newPage(browser, origin, viewport, options = {}) {
  const context = await browser.newContext({
    viewport, javaScriptEnabled: options.javaScriptEnabled !== false,
    reducedMotion: "reduce", hasTouch: viewport.width <= 390, isMobile: viewport.width <= 390,
  });
  await context.addInitScript(() => {
    try { localStorage.setItem("wpbAnalyticsConsentV1", "denied"); } catch {}
  });
  await context.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return { context, page, errors };
}

async function screenshot(page, label, fullPage = false, imageRequirement = null) {
  if (fullPage) {
    await warmLazyImages(page);
    if (imageRequirement) {
      await assertImagesReady(page, imageRequirement.selector, imageRequirement.count, label);
    }
  }
  const file = path.join(shots, `${label}.png`);
  await page.screenshot({ path: file, fullPage, animations: "disabled" });
  return path.relative(root, file);
}

async function warmLazyImages(page) {
  await page.evaluate(async () => {
    const original = { x: window.scrollX, y: window.scrollY };
    const images = Array.from(document.querySelectorAll('img[loading="lazy"]')).filter((image) => {
      const style = getComputedStyle(image);
      return image.getClientRects().length > 0 && !image.closest("[hidden]")
        && style.display !== "none" && style.visibility !== "hidden";
    });
    try {
      for (const image of images) {
        image.scrollIntoView({ block: "center", inline: "nearest" });
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      await Promise.all(images.map((image) => Promise.race([
        image.decode().then(() => undefined).catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ])));
    } finally {
      window.scrollTo(original.x, original.y);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });
}

async function assertImagesReady(page, selector, expectedCount, label) {
  const images = page.locator(selector);
  assert.equal(await images.count(), expectedCount, `${label}: expected ${expectedCount} visible image elements`);
  const states = await images.evaluateAll((nodes) => nodes.map((image) => {
    const style = getComputedStyle(image);
    const bounds = image.getBoundingClientRect();
    return {
      alt: image.alt,
      visible: image.getClientRects().length > 0 && !image.closest("[hidden]")
        && style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
    };
  }));
  assert.ok(states.every((image) => image.visible && image.complete && image.naturalWidth > 0), `${label}: visible images did not finish loading ${JSON.stringify(states)}`);
}

async function screenshotSection(section, label) {
  const file = path.join(shots, `${label}.png`);
  await section.screenshot({ path: file, animations: "disabled" });
  return path.relative(root, file);
}

function assertNoHeavyRequests(requests, label) {
  const heavy = requests.filter((url) => {
    const pathname = new URL(url).pathname;
    return /\.glb(?:\?|$)|meshopt_decoder/i.test(url)
      || pathname.split("/").pop() === viewerChunk
      || /\/assets\/residence-three-(?:core|webgl)-[^/]+\.js$/i.test(pathname);
  });
  assert.deepEqual(heavy, [], `${label}: unexpected initial 3D requests`);
}

async function checkCameraInteraction(section, page, label) {
  const viewer = section.locator("model-viewer");
  const orbit = () => viewer.evaluate((element) => {
    const { theta, radius } = element.getCameraOrbit();
    return { theta, radius };
  });
  await assertKeyboardInteractionFocus(viewer, label);
  const before = await orbit();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(350);
  const afterKey = await orbit();
  assert.ok(Math.abs(afterKey.theta - before.theta) > 0.005, `${label}: arrow key did not orbit`);
  await viewer.hover();
  await page.mouse.wheel(0, -450);
  await page.waitForTimeout(400);
  const afterZoom = await orbit();
  assert.ok(Math.abs(afterZoom.radius - afterKey.radius) > 0.001, `${label}: wheel did not zoom`);
}

async function assertKeyboardInteractionFocus(viewer, label) {
  const focus = await viewer.evaluate((element) => ({
    hostActive: document.activeElement === element,
    interactionSurfaceActive: element.shadowRoot?.activeElement?.matches('[role="img"][tabindex="0"]') === true,
  }));
  assert.ok(focus.hostActive && focus.interactionSurfaceActive, `${label}: keyboard focus must be on model-viewer's interaction surface ${JSON.stringify(focus)}`);
}

async function waitForFullscreen(page, expected, label, modelId) {
  try {
    await page.waitForFunction(({ state, id }) => {
      const control = document.querySelector(`[data-r3d-model-id="${id}"] [data-r3d-fullscreen]`);
      return Boolean(document.fullscreenElement) === state
        && control?.textContent?.trim() === (state ? "Exit full screen" : "Full screen");
    }, { state: expected, id: modelId }, { timeout: 5000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      enabled: document.fullscreenEnabled,
      active: Boolean(document.fullscreenElement),
      target: document.fullscreenElement?.className ?? null,
      label: document.querySelector("[data-r3d-fullscreen]")?.textContent?.trim() ?? null,
      status: document.querySelector("[data-r3d-status]")?.textContent ?? null,
      events: window.__r3dFullscreenEvents ?? [],
    }));
    throw new Error(`${label}: fullscreen transition did not settle ${JSON.stringify(diagnostics)} (${error.message})`);
  }
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), expected, label);
}

async function assertResetAndFullscreen(section, page, label) {
  const viewer = section.locator("model-viewer");
  const initialOrbit = await viewer.getAttribute("camera-orbit");
  await viewer.evaluate((element) => element.setAttribute("camera-orbit", "85deg 70deg 4m"));
  await section.locator("[data-r3d-reset]").click();
  assert.equal(await viewer.getAttribute("camera-orbit"), initialOrbit, `${label}: reset camera orbit`);
  await assertKeyboardInteractionFocus(viewer, `${label}: reset camera`);
  const fullscreen = section.locator("[data-r3d-fullscreen]");
  const modelId = await section.getAttribute("data-r3d-model-id");
  assert.ok(modelId, `${label}: model identity`);
  const fullscreenAvailable = await page.evaluate(() => document.fullscreenEnabled === true);
  if (await fullscreen.isVisible() && fullscreenAvailable) {
    await page.evaluate(() => {
      window.__r3dFullscreenEvents = [];
      document.addEventListener("fullscreenchange", () => window.__r3dFullscreenEvents.push("fullscreenchange"));
      document.addEventListener("fullscreenerror", () => window.__r3dFullscreenEvents.push("fullscreenerror"));
    });
    await fullscreen.click();
    await waitForFullscreen(page, true, `${label}: fullscreen entry`, modelId);
    assert.equal((await fullscreen.innerText()).trim(), "Exit full screen", `${label}: fullscreen entry label`);
    await fullscreen.click();
    await waitForFullscreen(page, false, `${label}: fullscreen exit`, modelId);
    assert.equal((await fullscreen.innerText()).trim(), "Full screen", `${label}: fullscreen exit label`);
  }
}

async function assertInquiryAttribution(section, page, model, label) {
  if (model.projectId === "shorecrest" && model.residenceSlug === "residence-0704") {
    assert.equal(model.modelId, "shorecrest-residence-0704-3d-v01", `${label}: Shorecrest 0704 stable model ID`);
    assert.equal(routeFor(model), "/floorplans/shorecrest/shorecrest-1153-0704/", `${label}: Shorecrest 0704 canonical route`);
  }
  assert.equal(await section.locator('[data-r3d-action="availability"]').getAttribute("href"), "/inquire/", `${label}: inquiry CTA destination`);
  await page.evaluate(() => window.addEventListener("wpb:analytics", (event) => {
    if (event.detail?.eventName === "residence_3d_cta") sessionStorage.setItem("__qa_3d_cta", JSON.stringify(event.detail));
  }));
  await section.locator('[data-r3d-action="availability"]').click();
  await page.waitForURL(/\/inquire\//);
  const stableContext = `floorplan:${model.projectId}:${model.residenceSlug}`;
  await waitForSynchronizedInquiry(page, model, stableContext);
  assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(), model.projectId, `${label}: inquiry project attribution`);
  assert.equal(await page.locator('.inquiry-form input[name="lead_capture_context"]').inputValue(), stableContext, `${label}: inquiry residence attribution`);
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("wpbLeadAttribution") ?? "{}"));
  assert.equal(stored.cta_context, stableContext, `${label}: stored residence attribution`);
  const ctaEvent = await page.evaluate(() => JSON.parse(sessionStorage.getItem("__qa_3d_cta") ?? "null"));
  assert.equal(ctaEvent?.payload?.modelId, model.modelId, `${label}: 3D CTA model attribution`);
  assert.equal(ctaEvent?.payload?.residenceId, model.residenceSlug, `${label}: 3D CTA stable residence attribution`);
  assert.equal(ctaEvent?.payload?.source, "3d-loaded", `${label}: 3D CTA loaded-state attribution`);
}

async function waitForSynchronizedInquiry(page, model, stableContext) {
  // URL navigation and form insertion can finish before bootstrap applies the
  // remembered residence to the new form.
  await page.waitForFunction(({ projectId, context }) => {
    const form = document.querySelector('.inquiry-form');
    return form?.querySelector('select[name="project"]')?.value === projectId
      && form.querySelector('input[name="lead_capture_context"]')?.value === context;
  }, { projectId: model.projectId, context: stableContext }, { timeout: 15000 });
}

async function assertEntityIntroAttribution(page, model, origin, label) {
  const entity = entityByModelId.get(model.modelId);
  if (perPlanPageForEntity(entity)) return;
  const project = publicProjectRecords.find((record) => record.publicSlug === model.projectId);
  assert.ok(project?.corridorKey, `${label}: reviewed project corridor missing`);
  await page.goto(`${origin}${entity.path}`, { waitUntil: "networkidle" });
  await page.locator('.fp-intro-action [data-fp-action="availability"]').click();
  await page.waitForURL(/\/inquire\//);
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("wpbLeadAttribution") ?? "{}"));
  const stableContext = `floorplan:${model.projectId}:${model.residenceSlug}`;
  await waitForSynchronizedInquiry(page, model, stableContext);
  assert.equal(stored.cta_context, stableContext, `${label}: entity intro stored residence`);
  assert.equal(stored.cta_location, "floorplan-entity-intro", `${label}: entity intro stored placement`);
  assert.equal(stored.corridor, project.corridorKey, `${label}: entity intro stored corridor`);
  assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(), model.projectId, `${label}: entity intro inquiry project`);
  assert.equal(await page.locator('.inquiry-form input[name="lead_capture_context"]').inputValue(), stableContext, `${label}: entity intro inquiry residence`);
}

async function touchDrag(page, start, end) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start.x, y: start.y }] });
    for (let index = 1; index <= 6; index++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x + (end.x - start.x) * index / 6, y: start.y + (end.y - start.y) * index / 6 }] });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } finally { await session.detach(); }
}

async function assertPoster(page, model, origin, label, screenshots) {
  const requests = [];
  const listener = (request) => requests.push(request.url());
  page.on("request", listener);
  await page.goto(`${origin}${routeFor(model)}`, { waitUntil: "networkidle" });
  await page.locator('[data-r3d-model-id="' + model.modelId + '"]').waitFor();
  const section = page.locator('[data-r3d-model-id="' + model.modelId + '"]');
  assert.equal(await section.getAttribute("data-r3d-state"), "poster", `${label}: initial state`);
  assert.equal(await section.locator("model-viewer").count(), 0, `${label}: no initial model-viewer`);
  assert.equal(await section.locator("[data-r3d-poster] img").evaluate((image) => image.complete && image.naturalWidth > 0), true, `${label}: poster failed`);
  assertNoHeavyRequests(requests, label);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${label}: horizontal overflow`);
  page.off("request", listener);
  screenshots.push(await screenshotSection(section, `${label}-poster`));
  return section;
}

async function assertModelPageOwner(page, model, label) {
  const entity = entityByModelId.get(model.modelId);
  const h1s = page.locator("h1:visible");
  assert.equal(await h1s.count(), 1, `${label}: destination must have one visible H1`);
  const owner = perPlanPageForEntity(entity)
    ? page.locator('[data-route-view="floorplan-plan-detail"]:not([hidden])')
    : page.locator(`.fp-page[data-floorplan-id="${entity.planId}"]:visible`);
  assert.equal(await owner.count(), 1, `${label}: expected one visible ${perPlanPageForEntity(entity) ? "per-plan" : "entity"} owner`);
  const ownedModel = owner.locator(`[data-r3d-model-id="${model.modelId}"]`);
  assert.equal(await ownedModel.count(), 1, `${label}: destination owner must contain exactly one matching data-r3d model`);
  assert.equal(await ownedModel.getAttribute("data-r3d-model-id"), model.modelId, `${label}: model identity`);
  return owner;
}

async function assertShorecrest0704Alias(origin, report) {
  const model = models.find((candidate) => candidate.projectId === "shorecrest" && candidate.residenceSlug === "residence-0704");
  assert.ok(model, "Shorecrest Residence 0704 must remain in the approved model manifest");
  assert.equal(model.modelId, "shorecrest-residence-0704-3d-v01", "Shorecrest Residence 0704 stable model ID");
  const alias = "/floorplans/shorecrest/residence-0704/";
  const canonical = routeFor(model);
  assert.equal(canonical, "/floorplans/shorecrest/shorecrest-1153-0704/", "Shorecrest Residence 0704 canonical route");
  const response = await fetch(`${origin}${alias}`, { redirect: "manual" });
  try {
    assert.equal(response.status, 301, "Shorecrest Residence 0704 alias HTTP status");
    assert.equal(response.headers.get("location"), canonical, "Shorecrest Residence 0704 alias destination");
  } finally { await response.arrayBuffer(); }
  report.checks.push("Shorecrest 0704 alias returns exact 301 to canonical route with stable model ID");
}

async function activate(section, model, label, screenshots) {
  await section.locator("[data-r3d-start]").click();
  await section.page().waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "ready", model.modelId, { timeout: 90000 }).catch(async () => {
    const state = await section.getAttribute("data-r3d-state");
    const message = await section.locator("[data-r3d-status]").innerText();
    throw new Error(`${label}: model ${model.modelId} did not load (state=${state}; ${message})`);
  });
  assert.equal(await section.locator("[data-r3d-poster]").isHidden(), true, `${label}: poster remains over model`);
  assert.equal(await section.locator("[data-r3d-controls]").isVisible(), true, `${label}: controls absent`);
  const viewer = section.locator("model-viewer");
  await section.page().waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"] model-viewer`)?.modelIsVisible === true, model.modelId, { timeout: 10000 });
  assert.equal(await viewer.evaluate((element) => element.modelIsVisible), true, `${label}: model not visible`);
  await assertKeyboardInteractionFocus(viewer, label);
  const imageStats = await sharp(await viewer.screenshot()).stats();
  assert.ok(Math.max(...imageStats.channels.slice(0, 3).map((channel) => channel.stdev)) > 4, `${label}: canvas appears blank`);
  screenshots.push(await screenshotSection(section, `${label}-active`));
  assert.match(
    await section.locator("[data-r3d-status]").innerText(),
    /^3D model ready\./,
    `${label}: ready state must retain its ready status after the model screenshot`,
  );
  const events = await section.page().evaluate(() => window.wpbAnalyticsQueue?.filter((event) => event.payload?.modelId === document.querySelector("[data-residence-3d]")?.dataset.r3dModelId).map((event) => event.eventName) ?? []);
  assert.ok(events.includes("residence_3d_open") && events.includes("residence_3d_loaded"), `${label}: analytics open/loaded`);
  return events;
}

async function assertProjectNavigation(page, model, origin, label) {
  const projectRoute = `/projects/${model.projectId}/`;
  const entityRoute = routeFor(model);
  await page.goto(`${origin}${projectRoute}`, { waitUntil: "networkidle" });

  const hubLink = page.locator('a[href="/3d-floorplans/"]:visible');
  assert.ok(await hubLink.count() > 0, `${label}: visible project-to-hub link missing`);
  await hubLink.first().click();
  await page.waitForURL(`${origin}/3d-floorplans/`);
  await page.getByRole("heading", { level: 1, name: /West Palm Beach residences in/ }).waitFor();
  assert.equal(await page.locator(".fp-3d-discovery").count(), 1, `${label}: hub content did not replace the project page`);
  assert.ok(await page.locator(`.fp-3d-discovery a[href="${entityRoute}"]`).count() > 0, `${label}: hub entity link missing`);

  await page.goto(`${origin}${projectRoute}`, { waitUntil: "networkidle" });
  const entityLink = page.locator(`a[href="${entityRoute}"]:visible`);
  assert.ok(await entityLink.count() >= 1, `${label}: visible project-to-canonical-floorplan link missing`);
  await entityLink.first().click();
  await page.waitForURL(`${origin}${entityRoute}`);
  await assertModelPageOwner(page, model, label);
  assert.equal(new URL(page.url()).pathname, entityRoute, `${label}: entity destination path`);
}

async function main() {
  assert.ok(models.length > 0, "Expected approved residence models in the manifest");
  await fs.access(path.join(dist, "index.html"));
  viewerChunk = (await fs.readdir(path.join(dist, "assets"))).find((name) => /^model-viewer[-.].*\.js$/.test(name)) ?? "";
  assert.ok(viewerChunk, "Could not identify the lazy model-viewer build chunk");
  await fs.mkdir(shots, { recursive: true });
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  const { server, origin } = await serveDist();
  const report = {
    origin,
    modelIds: models.map((model) => model.modelId),
    modelRoutes: Object.fromEntries(models.map((model) => [model.modelId, routeFor(model)])),
    projectRepresentatives: projectRepresentatives.map((model) => model.modelId),
    screenshots: [], checks: [], errors: [],
  };
  const browsers = [];
  try {
    await assertShorecrest0704Alias(origin, report);
    const chrome = await chromium.launch({ headless: true });
    browsers.push(chrome);
    const webkitBrowser = await webkit.launch({ headless: true });
    browsers.push(webkitBrowser);

    // Every published route must render a usable poster before any model data.
    for (const model of models) {
      const { context, page, errors } = await newPage(chrome, origin, viewports.desktop);
      try {
        const section = await assertPoster(page, model, origin, `chromium-${model.modelId}-desktop`, report.screenshots);
        await activate(section, model, `chromium-${model.modelId}-desktop`, report.screenshots);
        report.checks.push(`${model.modelId}: desktop poster and activation`);
        assert.deepEqual(errors, [], `${model.modelId}: page errors`);
      } finally { await context.close(); }
    }

    for (const model of models) {
      const { context, page, errors } = await newPage(webkitBrowser, origin, viewports.desktop);
      try {
        const section = await assertPoster(page, model, origin, `webkit-${model.modelId}-desktop`, report.screenshots);
        await activate(section, model, `webkit-${model.modelId}-desktop`, report.screenshots);
        assert.deepEqual(errors, [], `${model.modelId}: WebKit page errors`);
        report.checks.push(`${model.modelId}: WebKit desktop poster and activation`);
      } finally { await context.close(); }
    }

    // Discovery and project paths at the three review sizes, plus one
    // representative per project in both browser engines.
    for (const [browserName, browser] of [["chromium", chrome], ["webkit", webkitBrowser]]) {
      for (const [sizeName, viewport] of Object.entries(viewports)) {
        const { context, page, errors } = await newPage(browser, origin, viewport);
        try {
          const initialRequests = [];
          page.on("request", (request) => initialRequests.push(request.url()));
          await page.goto(`${origin}/3d-floorplans/`, { waitUntil: "networkidle" });
          report.screenshots.push(await screenshot(page, `${browserName}-discovery-${sizeName}`, true, {
            selector: ".fp-3d-discovery .fp-3d-cards img", count: models.length,
          }));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${browserName} discovery ${sizeName}: overflow`);
          assertNoHeavyRequests(initialRequests, `${browserName} discovery ${sizeName}`);
          for (const model of projectRepresentatives) {
            initialRequests.length = 0;
            await page.goto(`${origin}/projects/${model.projectId}/`, { waitUntil: "networkidle" });
            report.screenshots.push(await screenshot(page, `${browserName}-${model.projectId}-${sizeName}`, true));
            assertNoHeavyRequests(initialRequests, `${browserName} ${model.projectId} ${sizeName}`);
          }
          for (const model of projectRepresentatives) {
            const label = `${browserName}-${model.modelId}-${sizeName}`;
            await assertProjectNavigation(page, model, origin, label);
            const section = await assertPoster(page, model, origin, label, report.screenshots);
            report.screenshots.push(await screenshot(page, `${label}-full-page-before-activation`, true));
            await activate(section, model, label, report.screenshots);
            if (browserName === "chromium" && sizeName === "mobile" && model === projectRepresentatives[projectRepresentatives.length - 1]) {
              const viewer = section.locator("model-viewer");
              await viewer.scrollIntoViewIfNeeded();
              const before = await viewer.evaluate((element) => element.getCameraOrbit().theta);
              const bounds = await viewer.boundingBox();
              assert.ok(bounds);
              await touchDrag(page, { x: bounds.x + bounds.width * .3, y: bounds.y + bounds.height * .5 }, { x: bounds.x + bounds.width * .7, y: bounds.y + bounds.height * .5 });
              await page.waitForTimeout(350);
              const after = await viewer.evaluate((element) => element.getCameraOrbit().theta);
              assert.ok(Math.abs(after - before) > .005, "Mobile touch drag did not orbit");
              const scrollBefore = await page.evaluate(() => scrollY);
              await touchDrag(page, { x: bounds.x + bounds.width * .5, y: bounds.y + bounds.height * .75 }, { x: bounds.x + bounds.width * .5, y: bounds.y + bounds.height * .25 });
              await page.waitForTimeout(350);
              assert.ok(await page.evaluate(() => scrollY) > scrollBefore + 5, "Vertical touch gesture on model did not scroll page");
            }
            assert.deepEqual(errors, [], `${label}: page errors`);
            report.checks.push(`${label}: project navigation, poster and activation`);
          }
        } finally { await context.close(); }
      }
    }

    // Exercise latency and failure recovery on each project's representative,
    // adding a route-family example if the project set does not cover both.
    for (const model of fallbackRepresentatives) {
      const { context, page } = await newPage(chrome, origin, viewports.mobile);
      try {
        await context.route(`**${model.modelUrl}`, async (route) => { await new Promise((resolve) => setTimeout(resolve, 1800)); await route.continue(); });
        const section = await assertPoster(page, model, origin, `slow-${model.modelId}`, report.screenshots);
        await section.locator("[data-r3d-start]").click();
        assert.equal(await section.locator("[data-r3d-poster]").isVisible(), true, `${model.modelId}: slow network must keep poster`);
        assert.equal(await section.getAttribute("data-r3d-state"), "loading", `${model.modelId}: slow network must show loading state`);
        await page.waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "ready", model.modelId, { timeout: 90000 });
        report.checks.push(`${model.modelId}: slow network preserves poster until load`);
      } finally { await context.close(); }
    }

    // A failed GLB must leave the released plan and inquiry route available,
    // then allow a retry to load the same stable model.
    for (const model of fallbackRepresentatives) {
      const { context, page } = await newPage(chrome, origin, viewports.mobile);
      try {
        const abortGlb = (route) => route.abort("failed");
        await context.route(`**${model.modelUrl}`, abortGlb);
        const section = await assertPoster(page, model, origin, `failed-${model.modelId}`, report.screenshots);
        await section.locator("[data-r3d-start]").click();
        await page.waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "error", model.modelId, { timeout: 15000 });
        assert.equal(await section.locator("[data-r3d-poster]").isVisible(), true, `${model.modelId}: failed GLB poster`);
        assert.equal(await section.locator("[data-r3d-start]").isVisible(), true, `${model.modelId}: failed GLB retry control`);
        const drawing = page.locator('.fp-drawing a[href$=".pdf"]:visible, .fp-per-plan-review a[href$=".pdf"]:visible, a[href$=".pdf"]:visible').first();
        assert.ok(await drawing.count() > 0 && await drawing.isVisible(), `${model.modelId}: released drawing remains available after GLB failure`);
        assert.equal(await section.locator('[data-r3d-action="availability"]').getAttribute("href"), "/inquire/", `${model.modelId}: inquiry route after GLB failure`);
        report.screenshots.push(await screenshot(page, `failed-${model.modelId}-fallback`));
        await context.unroute(`**${model.modelUrl}`, abortGlb);
        await activate(section, model, `retry-${model.modelId}`, report.screenshots);
        report.checks.push(`${model.modelId}: failed GLB preserves poster, drawing and inquiry; retry loads model`);
      } finally { await context.close(); }
    }

    // An unavailable library leaves the static image, plan, CTA and retry
    // affordance on screen without ever requesting the GLB.
    for (const model of fallbackRepresentatives) {
      const { context, page } = await newPage(chrome, origin, viewports.mobile);
      try {
        const requests = [];
        page.on("request", (request) => requests.push(request.url()));
        await context.route(`**/assets/${viewerChunk}`, (route) => route.abort("failed"));
        const section = await assertPoster(page, model, origin, `library-fail-${model.modelId}`, report.screenshots);
        await section.locator("[data-r3d-start]").click();
        await page.waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "error", model.modelId, { timeout: 15000 });
        assert.equal(await section.locator("[data-r3d-poster]").isVisible(), true, `${model.modelId}: library failure poster`);
        assert.equal(await section.locator('[data-r3d-action="availability"]').isVisible(), true, `${model.modelId}: library failure CTA`);
        assert.equal(requests.filter((url) => /\.glb(?:\?|$)/.test(url)).length, 0, `${model.modelId}: GLB requested after library failure`);
        report.screenshots.push(await screenshot(page, `library-fail-${model.modelId}-fallback`));
        report.checks.push(`${model.modelId}: failed library retains poster, plan and inquiry CTA`);
      } finally { await context.close(); }
    }

    // No JavaScript and no WebGL still expose poster, plan facts and inquiry
    // across each project and both page-owner families.
    for (const model of fallbackRepresentatives) {
      for (const kind of ["no-js", "no-webgl"]) {
        for (const [sizeName, viewport] of Object.entries(viewports)) {
          const { context, page } = await newPage(chrome, origin, viewport, { javaScriptEnabled: kind !== "no-js" });
          try {
            if (kind === "no-webgl") await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
            await page.goto(`${origin}${routeFor(model)}`, { waitUntil: "networkidle" });
            const section = page.locator(`[data-r3d-model-id="${model.modelId}"]`);
            assert.equal(await section.locator("[data-r3d-poster] img").isVisible(), true, `${model.modelId}: ${kind} poster`);
            assert.equal(await section.locator("[data-r3d-start]").isHidden(), true, `${model.modelId}: ${kind} start control should be hidden`);
            const planFacts = page.locator(".fp-facts:visible, .fp-per-plan-review:visible");
            assert.ok(await planFacts.count() > 0, `${model.modelId}: ${kind} route facts remain visible`);
            assert.equal(await section.locator('[data-r3d-action="availability"]').getAttribute("href"), "/inquire/", `${model.modelId}: ${kind} inquiry link`);
            report.screenshots.push(await screenshot(page, `${kind}-${model.modelId}-${sizeName}-fallback`));
            report.checks.push(`${model.modelId}: ${kind} ${sizeName} fallback`);
          } finally { await context.close(); }
        }
      }
    }

    // Exercise actual viewer controls in both browser engines. Attribution
    // covers each project's last model plus Shorecrest 0704 so the established
    // canonical alias and stable residence ID remain coupled.
    const attributionModels = [...projectRepresentatives];
    const shorecrest0704 = models.find((model) => model.projectId === "shorecrest" && model.residenceSlug === "residence-0704");
    if (shorecrest0704 && !attributionModels.some((model) => model.modelId === shorecrest0704.modelId)) attributionModels.push(shorecrest0704);
    for (const [browserName, browser] of [["chromium", chrome], ["webkit", webkitBrowser]]) {
      for (const model of attributionModels) {
        const { context, page } = await newPage(browser, origin, viewports.desktop);
        try {
          const label = `${browserName}-controls-${model.modelId}`;
          const section = await assertPoster(page, model, origin, label, report.screenshots);
          await activate(section, model, label, report.screenshots);
          await checkCameraInteraction(section, page, `${label}: camera controls`);
          await assertResetAndFullscreen(section, page, label);
          if (browserName === "chromium") {
            await assertInquiryAttribution(section, page, model, label);
            await assertEntityIntroAttribution(page, model, origin, label);
          }
          report.checks.push(`${label}: camera, reset, fullscreen where available${browserName === "chromium" ? ", and inquiry attribution" : ""}`);
        } finally { await context.close(); }
      }
    }
  } catch (error) {
    report.errors.push(error.stack ?? String(error));
  } finally {
    await Promise.allSettled(browsers.map((browser) => browser.close()));
    await new Promise((resolve) => server.close(resolve));
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  }
  if (report.errors.length) throw new Error(report.errors.join("\n"));
  console.log(JSON.stringify({ status: "pass", models: models.length, checks: report.checks.length, screenshots: report.screenshots.length, report: path.relative(root, reportFile) }));
}

await main();
