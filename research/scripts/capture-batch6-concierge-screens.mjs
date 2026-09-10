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
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.resolve(dist, `.${pathname}`);
    if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error("invalid");
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file, "index.html");
    res.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const route = "/answers/olara-vs-ritz-carlton-vs-shorecrest/";
const files = [];

try {
  for (const [label, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
    // Record the existing declined-consent state so its modal does not cover
    // the feature being reviewed. All normal page resources remain enabled.
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce",
      storageState: { cookies: [], origins: [{ origin, localStorage: [{ name: "wpbAnalyticsConsentV1", value: "denied" }] }] },
    });
    const page = await context.newPage();
    const response = await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(response?.status(), 200);
    const launcher = page.getByRole("button", { name: "Open Ask WPB buyer concierge" });
    await launcher.waitFor({ state: "visible", timeout: 15000 });
    await launcher.click();
    await page.getByRole("dialog", { name: "Ask WPB" }).waitFor({ state: "visible", timeout: 15000 });
    const comparisonFile = `after-comparison-${label}.png`;
    await page.screenshot({ path: path.join(out, comparisonFile), animations: "disabled", timeout: 10000 });
    files.push(comparisonFile);
    for (const project of ["olara", "maison-dor"]) {
      await page.goto(`${origin}/projects/${project}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
      const form = page.locator(".brochure-inquiry-card:visible").first();
      await form.locator("[data-request-summary]").waitFor({ state: "visible", timeout: 15000 });
      // The existing second-building prompt is separate from this form review.
      // Dismiss it through its normal control before capturing the inquiry.
      const buildingWatch = page.locator("[data-lead-modal]:visible");
      if (await buildingWatch.count()) {
        await buildingWatch.locator("[data-lead-modal-dismiss]").first().click();
        await buildingWatch.waitFor({ state: "hidden", timeout: 10000 });
      }
      const file = `after-${project}-form-${label}.png`;
      await form.screenshot({ path: path.join(out, file), animations: "disabled", timeout: 10000 });
      files.push(file);
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(JSON.stringify({ batch6Screenshots: "pass", files }, null, 2));
