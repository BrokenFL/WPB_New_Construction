import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

const root = path.resolve(new URL(".", import.meta.url).pathname);
const outputRoot = path.join(root, "after");
const baseUrl = process.env.V2_ORIGIN || "http://127.0.0.1:5188";
const cases = [
  {
    key: "home-collection",
    path: "/",
    selector: ".home-featured-section",
    fullPage: false,
  },
  {
    key: "north-flagler-hero-directory",
    path: "/corridors/north-flagler/",
    selector: ".corridor-discovery-shell",
    fullPage: false,
    union: [".corridor-route-hero", ".corridor-discovery-shell"],
  },
  {
    key: "north-flagler-full-inventory",
    path: "/corridors/north-flagler/",
    selector: ".corridor-discovery-shell",
    fullPage: false,
  },
  {
    key: "corridor-hub",
    path: "/corridors/",
    selector: ".corridors-card-section",
    fullPage: false,
  },
  {
    key: "olara-alternatives",
    path: "/projects/olara/",
    selector: ".project-corridor-cta",
    fullPage: false,
  },
  {
    key: "article-discovery",
    path: "/updates/alba-palm-beach-complete-move-in-ready-north-flagler-2026-09-14/",
    selector: ".article-discovery-bridge",
    fullPage: false,
  },
  {
    key: "map-selected",
    path: "/map/",
    selector: ".map-route-page",
    fullPage: false,
  },
];

const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

await fs.mkdir(outputRoot, { recursive: true });
const results = [];

function safeName(value) {
  return value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function waitForStablePage(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(() => {
    document.querySelector(".v2-skip-link")?.blur();
    document.querySelectorAll("img").forEach((image) => {
      image.loading = "eager";
      image.fetchPriority = "high";
    });
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(800);
}

async function firstLaidOutLocator(page, selector) {
  const candidates = page.locator(selector);
  for (let index = 0; index < await candidates.count(); index += 1) {
    const candidate = candidates.nth(index);
    const box = await candidate.boundingBox();
    if (box && box.width > 1 && box.height > 1) return candidate;
  }
  return null;
}

async function warmTargetImages(page, locator) {
  const images = locator.locator("img");
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    await image.evaluate((element) => {
      element.loading = "eager";
      element.fetchPriority = "high";
      element.scrollIntoView({ block: "center", inline: "nearest" });
    }).catch(() => {});
  }
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function captureEngine(engineName, browserType) {
  const browser = await browserType.launch({ headless: true });
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: "light" });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`));

    for (const item of cases) {
      await page.goto(`${baseUrl}${item.path}`, { waitUntil: "domcontentloaded" });
      await waitForStablePage(page);
      const locator = await firstLaidOutLocator(page, item.selector);
      const visible = Boolean(locator);
      await page.addStyleTag({ content: ".v2-skip-link { top: -100px !important; visibility: hidden !important; }" });
      const record = {
        engine: engineName,
        viewport: viewportName,
        case: item.key,
        path: item.path,
        selector: item.selector,
        visible,
        output: null,
        dimensions: null,
        page: {
          title: await page.title(),
          url: page.url(),
          bodyScrollWidth: await page.evaluate(() => document.body.scrollWidth),
          viewportWidth: await page.evaluate(() => window.innerWidth),
        },
        errors: { console: [...consoleErrors], page: [...pageErrors], requests: [...failedRequests] },
      };
      if (visible) {
        await warmTargetImages(page, locator);
        let screenshotPath = path.join(outputRoot, `${safeName(item.key)}-${viewportName}-${engineName}.png`);
        if (item.union) {
          const unionLocators = await Promise.all(item.union.map((selector) => firstLaidOutLocator(page, selector)));
          for (const unionLocator of unionLocators) if (unionLocator) await warmTargetImages(page, unionLocator);
          const boxes = await Promise.all(unionLocators.map((candidate) => candidate?.boundingBox() ?? null));
          const valid = boxes.filter(Boolean);
          if (valid.length === item.union.length) {
            const x = Math.max(0, Math.min(...valid.map((box) => box.x)));
            const y = Math.max(0, Math.min(...valid.map((box) => box.y)));
            const right = Math.max(...valid.map((box) => box.x + box.width));
            const bottom = Math.max(...valid.map((box) => box.y + box.height));
            record.dimensions = { x, y, width: right - x, height: bottom - y };
            await page.screenshot({ path: screenshotPath, clip: record.dimensions });
          } else {
            await locator.screenshot({ path: screenshotPath });
            record.dimensions = await locator.boundingBox();
          }
        } else {
          await locator.screenshot({ path: screenshotPath });
          record.dimensions = await locator.boundingBox();
        }
        record.output = path.relative(process.cwd(), screenshotPath);
      }
      results.push(record);
    }
    await context.close();
  }
  await browser.close();
}

await captureEngine("chromium", chromium);
await captureEngine("webkit", webkit);

const summary = {
  generatedAt: new Date().toISOString(),
  origin: baseUrl,
  cases: results,
  checks: {
    screenshotCount: results.filter((result) => result.output).length,
    missingTargets: results.filter((result) => !result.visible).map((result) => `${result.engine}/${result.viewport}/${result.case}`),
    overflow: results.filter((result) => result.page.bodyScrollWidth > result.page.viewportWidth).map((result) => `${result.engine}/${result.viewport}/${result.case}`),
    errors: results.filter((result) => result.errors.console.length || result.errors.page.length || result.errors.requests.length).map((result) => ({ engine: result.engine, viewport: result.viewport, case: result.case, errors: result.errors })),
  },
};
await fs.writeFile(path.join(outputRoot, "capture-results.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary.checks, null, 2));
