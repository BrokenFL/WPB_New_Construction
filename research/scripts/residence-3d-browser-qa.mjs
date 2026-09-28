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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "dist");
const shots = path.join(root, "output/playwright/residence-3d");
const reportFile = path.join(root, ".runtime/residence-3d-browser-qa.json");
const models = residence3DModels.filter((model) => model.status === "approved");
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
const routeFor = (model) => `/floorplans/${model.projectId}/${model.residenceSlug}/`;
let viewerChunk = "";

async function serveDist() {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
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

async function waitForFullscreen(page, expected, label) {
  try {
    await page.waitForFunction((state) => Boolean(document.fullscreenElement) === state, expected, { timeout: 5000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      enabled: document.fullscreenEnabled,
      active: Boolean(document.fullscreenElement),
      target: document.fullscreenElement?.className ?? null,
      status: document.querySelector("[data-r3d-status]")?.textContent ?? null,
      events: window.__r3dFullscreenEvents ?? [],
    }));
    throw new Error(`${label}: fullscreen transition did not settle ${JSON.stringify(diagnostics)} (${error.message})`);
  }
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), expected, label);
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
  const entityLink = page.locator(`a[data-floorplan-entity-link][href="${entityRoute}"]:visible`);
  assert.equal(await entityLink.count(), 1, `${label}: visible project-to-entity link missing or duplicated`);
  await entityLink.click();
  await page.waitForURL(`${origin}${entityRoute}`);
  await page.locator("[data-floorplan-id]").waitFor();
  await page.locator(`[data-r3d-model-id="${model.modelId}"]`).waitFor();
  assert.equal(new URL(page.url()).pathname, entityRoute, `${label}: entity destination path`);
}

async function main() {
  assert.equal(models.length, 6, "Expected six QA-approved residence models");
  await fs.access(path.join(dist, "index.html"));
  viewerChunk = (await fs.readdir(path.join(dist, "assets"))).find((name) => /^model-viewer[-.].*\.js$/.test(name)) ?? "";
  assert.ok(viewerChunk, "Could not identify the lazy model-viewer build chunk");
  await fs.mkdir(shots, { recursive: true });
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  const { server, origin } = await serveDist();
  const report = { origin, modelIds: models.map((model) => model.modelId), screenshots: [], checks: [], errors: [] };
  const browsers = [];
  try {
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

    // Discovery and project paths at the three review sizes, plus selected
    // activated residences in both browser engines.
    const selected = [models[0], models[Math.floor(models.length / 2)], models[models.length - 1]];
    for (const [browserName, browser] of [["chromium", chrome], ["webkit", webkitBrowser]]) {
      for (const [sizeName, viewport] of Object.entries(viewports)) {
        const { context, page, errors } = await newPage(browser, origin, viewport);
        try {
          const initialRequests = [];
          page.on("request", (request) => initialRequests.push(request.url()));
          await page.goto(`${origin}/3d-floorplans/`, { waitUntil: "networkidle" });
          report.screenshots.push(await screenshot(page, `${browserName}-discovery-${sizeName}`, true, {
            selector: ".fp-3d-discovery .fp-3d-cards img", count: 6,
          }));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${browserName} discovery ${sizeName}: overflow`);
          assertNoHeavyRequests(initialRequests, `${browserName} discovery ${sizeName}`);
          for (const model of selected) {
            initialRequests.length = 0;
            await page.goto(`${origin}/projects/${model.projectId}/`, { waitUntil: "networkidle" });
            report.screenshots.push(await screenshot(page, `${browserName}-${model.projectId}-${sizeName}`, true));
            assertNoHeavyRequests(initialRequests, `${browserName} ${model.projectId} ${sizeName}`);
          }
          for (const model of selected) {
            const label = `${browserName}-${model.modelId}-${sizeName}`;
            await assertProjectNavigation(page, model, origin, label);
            const section = await assertPoster(page, model, origin, label, report.screenshots);
            await activate(section, model, label, report.screenshots);
            if (browserName === "chromium" && sizeName === "mobile" && model === selected[selected.length - 1]) {
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

    const model = models[0];
    // A slow GLB keeps the poster visible and reports progress before the model appears.
    {
      const { context, page } = await newPage(chrome, origin, viewports.mobile);
      try {
        await context.route(`**${model.modelUrl}`, async (route) => { await new Promise((resolve) => setTimeout(resolve, 1800)); await route.continue(); });
        const section = await assertPoster(page, model, origin, `slow-${model.modelId}`, report.screenshots);
        await section.locator("[data-r3d-start]").click();
        assert.equal(await section.locator("[data-r3d-poster]").isVisible(), true, "Slow network must keep poster");
        assert.equal(await section.getAttribute("data-r3d-state"), "loading", "Slow network must show loading state");
        await page.waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "ready", model.modelId, { timeout: 90000 });
        report.checks.push("slow network preserves poster until load");
      } finally { await context.close(); }
    }

    // A failed GLB must leave the released plan and inquiry route available.
    {
      const { context, page } = await newPage(chrome, origin, viewports.mobile);
      try {
        const abortGlb = (route) => route.abort("failed");
        await context.route(`**${model.modelUrl}`, abortGlb);
        const section = await assertPoster(page, model, origin, `failed-${model.modelId}`, report.screenshots);
        await section.locator("[data-r3d-start]").click();
        await page.waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "error", model.modelId, { timeout: 15000 });
        assert.equal(await section.locator("[data-r3d-poster]").isVisible(), true);
        assert.equal(await section.locator("[data-r3d-start]").isVisible(), true);
        assert.equal(await page.locator(".fp-drawing a").isVisible(), true);
        report.screenshots.push(await screenshot(page, `failed-${model.modelId}-fallback`));
        await context.unroute(`**${model.modelUrl}`, abortGlb);
        await activate(section, model, `retry-${model.modelId}`, report.screenshots);
        report.checks.push("failed GLB retains poster and released plan; retry loads model");
      } finally { await context.close(); }
    }

    // An unavailable library leaves the static image, plan, CTA and retry
    // affordance on screen without ever requesting the GLB.
    {
      const { context, page } = await newPage(chrome, origin, viewports.mobile);
      try {
        const requests = [];
        page.on("request", (request) => requests.push(request.url()));
        await context.route(`**/assets/${viewerChunk}`, (route) => route.abort("failed"));
        const section = await assertPoster(page, model, origin, `library-fail-${model.modelId}`, report.screenshots);
        await section.locator("[data-r3d-start]").click();
        await page.waitForFunction((id) => document.querySelector(`[data-r3d-model-id="${id}"]`)?.getAttribute("data-r3d-state") === "error", model.modelId, { timeout: 15000 });
        assert.equal(await section.locator("[data-r3d-poster]").isVisible(), true);
        assert.equal(await section.locator('[data-r3d-action="availability"]').isVisible(), true);
        assert.equal(requests.filter((url) => /\.glb(?:\?|$)/.test(url)).length, 0, "GLB requested after library failure");
        report.screenshots.push(await screenshot(page, `library-fail-${model.modelId}-fallback`));
        report.checks.push("failed library retains poster, plan and inquiry CTA");
      } finally { await context.close(); }
    }

    // No JavaScript and no WebGL still expose poster, facts and inquiry link.
    for (const kind of ["no-js", "no-webgl"]) {
      for (const [sizeName, viewport] of Object.entries(viewports)) {
        const { context, page } = await newPage(chrome, origin, viewport, { javaScriptEnabled: kind !== "no-js" });
        try {
          if (kind === "no-webgl") await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
          await page.goto(`${origin}${routeFor(model)}`, { waitUntil: "networkidle" });
          const section = page.locator('[data-r3d-model-id="' + model.modelId + '"]');
          assert.equal(await section.locator("[data-r3d-poster] img").isVisible(), true);
          assert.equal(await section.locator("[data-r3d-start]").isHidden(), true);
          assert.equal(await page.locator(".fp-facts").isVisible(), true);
          assert.equal(await section.locator('[data-r3d-action="availability"]').getAttribute("href"), "/inquire/");
          report.screenshots.push(await screenshot(page, `${kind}-${model.modelId}-${sizeName}-fallback`));
          report.checks.push(`${kind} ${sizeName} fallback`);
        } finally { await context.close(); }
      }
    }

    // Reset, fullscreen where available, and residence-specific lead attribution.
    {
      const { context, page } = await newPage(chrome, origin, viewports.desktop);
      try {
        const section = await assertPoster(page, model, origin, `controls-${model.modelId}`, report.screenshots);
        await activate(section, model, `controls-${model.modelId}`, report.screenshots);
        const viewer = section.locator("model-viewer");
        await checkCameraInteraction(section, page, "chromium camera controls");
        const initialOrbit = await viewer.getAttribute("camera-orbit");
        await viewer.evaluate((element) => element.setAttribute("camera-orbit", "85deg 70deg 4m"));
        await section.locator("[data-r3d-reset]").click();
        assert.equal(await viewer.getAttribute("camera-orbit"), initialOrbit, "Reset camera orbit");
        await assertKeyboardInteractionFocus(viewer, "Reset camera");
        const fullscreen = section.locator("[data-r3d-fullscreen]");
        if (await fullscreen.isVisible()) {
          await page.evaluate(() => {
            window.__r3dFullscreenEvents = [];
            document.addEventListener("fullscreenchange", () => window.__r3dFullscreenEvents.push("fullscreenchange"));
            document.addEventListener("fullscreenerror", () => window.__r3dFullscreenEvents.push("fullscreenerror"));
          });
          await fullscreen.click();
          await waitForFullscreen(page, true, "Fullscreen entry");
          assert.equal((await fullscreen.innerText()).trim(), "Exit full screen", "Fullscreen toggle label after entry");
          await fullscreen.click();
          await waitForFullscreen(page, false, "Fullscreen exit");
          assert.equal((await fullscreen.innerText()).trim(), "Full screen", "Fullscreen toggle label after exit");
        }
        const href = await section.locator('[data-r3d-action="availability"]').getAttribute("href");
        assert.ok(href);
        await page.evaluate(() => window.addEventListener("wpb:analytics", (event) => {
          if (event.detail?.eventName === "residence_3d_cta") sessionStorage.setItem("__qa_3d_cta", JSON.stringify(event.detail));
        }));
        await section.locator('[data-r3d-action="availability"]').click();
        await page.waitForURL(/\/inquire\//);
        assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(), model.projectId, "Inquiry project attribution");
        assert.equal(await page.locator('.inquiry-form input[name="lead_capture_context"]').inputValue(), `floorplan:${model.projectId}:${model.residenceSlug}`, "Inquiry residence attribution");
        const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("wpbLeadAttribution") ?? "{}"));
        assert.equal(stored.cta_context, `floorplan:${model.projectId}:${model.residenceSlug}`, "Stored residence attribution");
        const ctaEvent = await page.evaluate(() => JSON.parse(sessionStorage.getItem("__qa_3d_cta") ?? "null"));
        assert.equal(ctaEvent?.payload?.modelId, model.modelId, "3D CTA model attribution");
        assert.equal(ctaEvent?.payload?.residenceId, model.residenceSlug, "3D CTA residence attribution");
        assert.equal(ctaEvent?.payload?.source, "3d-loaded", "3D CTA loaded-state attribution");
        report.checks.push("camera reset, fullscreen and inquiry attribution");
      } finally { await context.close(); }
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
