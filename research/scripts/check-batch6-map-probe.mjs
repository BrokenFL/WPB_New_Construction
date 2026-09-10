import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dist = path.join(root, "dist");
const out = path.join(root, ".runtime/batch6-concierge");
await fs.mkdir(out, { recursive: true });

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2", ".xml": "application/xml" };
const nonBehavioralLocalAsset = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf", ".woff2"]);
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.resolve(dist, `.${pathname}`);
    if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error("invalid path");
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file, "index.html");
    const ext = path.extname(file);
    // This probe exercises route/bootstrap/concierge behavior, not visual fidelity.
    // Avoid HTTP/1.1 same-origin connection starvation from large local media while
    // preserving real HTML/CSS/JS and normal external Maps networking. Screenshots
    // and the keyed Maps gate exercise the normal visual/resource path separately.
    if (nonBehavioralLocalAsset.has(ext)) {
      res.writeHead(204, { "Cache-Control": "no-store" });
      res.end();
      return;
    }
    res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const timings = [];
async function step(stage, fn, timeoutMs = 15000) {
  const started = Date.now();
  console.log(`map-probe ${stage}:start`);
  let timer;
  try {
    const value = await Promise.race([
      Promise.resolve().then(fn),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`map-probe:${stage}:timeout after ${timeoutMs}ms`)), timeoutMs); }),
    ]);
    const ms = Date.now() - started;
    timings.push({ stage, result: "pass", ms });
    console.log(`map-probe ${stage}:pass ${ms}ms`);
    return value;
  } catch (error) {
    const ms = Date.now() - started;
    timings.push({ stage, result: "fail", ms, error: error instanceof Error ? error.message : String(error) });
    console.log(`map-probe ${stage}:fail ${ms}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

const browser = await chromium.launch({ headless: true });
let context;
let page;
const pageErrors = [];
const network = [];
const consoleMessages = [];
let postMountState = null;
let failure = null;
try {
  context = await step("context.create", () => browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", serviceWorkers: "block" }), 10000);
  page = await step("page.create", () => context.newPage(), 10000);
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
    console.log(`map-probe pageerror ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      const entry = { type: message.type(), text: message.text() };
      consoleMessages.push(entry);
      console.log(`map-probe console.${entry.type} ${entry.text}`);
    }
  });
  const relevant = (url) => /buyerConcierge|leadAttributionStore|conciergeLauncher/.test(url);
  page.on("request", (request) => {
    if (!relevant(request.url())) return;
    network.push({ event: "request", url: request.url() });
    console.log(`map-probe network.request ${request.url()}`);
  });
  page.on("response", (response) => {
    if (!relevant(response.url())) return;
    network.push({ event: "response", url: response.url(), status: response.status() });
    console.log(`map-probe network.response ${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    if (!relevant(request.url())) return;
    network.push({ event: "requestfailed", url: request.url(), failure: request.failure()?.errorText ?? "unknown" });
    console.log(`map-probe network.requestfailed ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
  });
  page.once("domcontentloaded", () => console.log("map-probe event.DOMContentLoaded:observed"));
  page.once("load", () => console.log("map-probe event.load:observed"));

  console.log("map-probe goto.waitUntil=domcontentloaded");
  const response = await step("page.goto", () => page.goto(`${origin}/map/`, { waitUntil: "domcontentloaded", timeout: 30000 }), 35000);
  assert.equal(response?.status(), 200, "/map/: HTTP status");

  await step("application.shell", () => page.waitForFunction(() => {
    const app = document.querySelector("#app");
    return Boolean(app && app.childElementCount > 0);
  }, null, { timeout: 10000 }), 12000);

  const launcher = page.getByRole("button", { name: "Open Ask WPB buyer concierge" });
  await step("launcher.attached", () => launcher.waitFor({ state: "attached", timeout: 10000 }), 12000);
  await step("launcher.visible", () => launcher.waitFor({ state: "visible", timeout: 10000 }), 12000);
  assert.deepEqual(pageErrors, [], "/map/: application exception before concierge interaction");

  await step("launcher.click", () => launcher.click({ timeout: 10000 }), 12000);
  const dialog = page.getByRole("dialog", { name: "Ask WPB" });
  await step("dialog.attached", () => dialog.waitFor({ state: "attached", timeout: 10000 }), 12000);
  postMountState = await step("dialog.post-mount-state", () => page.evaluate(() => {
    const root = document.querySelector("[data-buyer-concierge-root]");
    const launcher = document.querySelector(".buyer-concierge-launcher");
    const panel = document.querySelector("[data-buyer-concierge-panel]");
    const describe = (el) => {
      if (!(el instanceof HTMLElement)) return null;
      const css = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return { connected: el.isConnected, hidden: el.hidden, display: css.display, visibility: css.visibility, opacity: css.opacity, position: css.position, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
    };
    return {
      root: describe(root),
      launcher: describe(launcher),
      panel: describe(panel),
      launcherExpanded: launcher?.getAttribute("aria-expanded") ?? null,
      activeTag: document.activeElement?.tagName ?? null,
      activeClass: document.activeElement?.getAttribute("class") ?? null,
    };
  }), 5000);
  console.log(`map-probe post-mount-state ${JSON.stringify(postMountState)}`);
  await step("dialog.visible", () => dialog.waitFor({ state: "visible", timeout: 10000 }), 12000);
  for (const heading of ["Research", "Current information", "Talk to the team"]) {
    assert.equal(await dialog.getByRole("heading", { name: heading }).count(), 1, `/map/: ${heading}`);
  }

  await step("escape", () => page.keyboard.press("Escape"), 5000);
  const closeState = await step("focus-return", () => page.evaluate(() => {
    const current = document.querySelector(".buyer-concierge-launcher");
    return { exists: Boolean(current), expanded: current?.getAttribute("aria-expanded") ?? null, focused: document.activeElement === current };
  }), 5000);
  assert.deepEqual(closeState, { exists: true, expanded: "false", focused: true });
  assert.deepEqual(pageErrors, [], "/map/: application exceptions");

  await fs.writeFile(path.join(out, "map-probe.json"), JSON.stringify({ status: "pass", route: "/map/", timings, postMountState, pageErrors, consoleMessages, network }, null, 2));
  console.log(JSON.stringify({ mapProbe: "pass", timings, postMountState, network }, null, 2));
} catch (error) {
  failure = error;
  const domState = page && !page.isClosed() ? await page.evaluate(() => ({
    launcherCount: document.querySelectorAll(".buyer-concierge-launcher").length,
    rootCount: document.querySelectorAll("[data-buyer-concierge-root]").length,
    panelCount: document.querySelectorAll("[data-buyer-concierge-panel]").length,
    launcherExpanded: document.querySelector(".buyer-concierge-launcher")?.getAttribute("aria-expanded") ?? null,
    bodyChildren: document.body.childElementCount,
  })).catch(() => null) : null;
  const diagnostic = { status: "fail", route: "/map/", error: error instanceof Error ? error.message : String(error), timings, postMountState, pageErrors, consoleMessages, network, domState };
  await fs.writeFile(path.join(out, "map-probe-failure.json"), JSON.stringify(diagnostic, null, 2));
  console.log(`map-probe diagnostic ${JSON.stringify(diagnostic)}`);
} finally {
  if (page && !page.isClosed()) await step("page.close", () => page.close({ runBeforeUnload: false }), 5000).catch(() => {});
  if (context) await step("context.close", () => context.close(), 5000).catch(() => {});
  await step("browser.close", () => browser.close(), 10000).catch(() => {});
  server.close();
}

if (failure) throw failure;
