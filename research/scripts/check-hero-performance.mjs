import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

const root = process.cwd();
const mainSource = readFileSync(path.join(root, "src/main.ts"), "utf8");
const styleSource = readFileSync(path.join(root, "src/style.css"), "utf8");
const assetSource = readFileSync(path.join(root, "src/data/homepageAssets.ts"), "utf8");
const errors = [];

// Keep this focused on the intentional static responsive hero. The broader
// performance gate owns the same editorial-image ceiling across the site.
const maxHeroVariantBytes = 750 * 1024;
const desktopViewportWidth = 1440;
const mobileViewportWidth = 390;
const browserPhaseEnabled = process.env.HERO_PERFORMANCE_BROWSER === "1" || process.env.V2_HERO_BROWSER === "1";
const browserOrigin = process.env.V2_ORIGIN?.trim() || "http://127.0.0.1:5188";
const browserOriginUrl = new URL(browserOrigin);
const browserReportPath = path.join(root, "output/playwright/hero-performance.json");
const readMethods = new Set(["GET", "HEAD"]);
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);

function fail(message) {
  errors.push(message);
}

function extractHeroMarkup(source) {
  const match = source.match(/<section class="home-hero"[\s\S]*?<\/section>/);
  if (!match) {
    fail("Homepage hero section is missing.");
    return "";
  }
  return match[0];
}

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function parsePathProperty(source, name) {
  return source.match(new RegExp(`\\b${name}\\s*:\\s*"([^"]+)"`))?.[1] ?? "";
}

function parseHeroIntrinsic(source, name) {
  const heroBlock = source.match(/hero:\s*\{([\s\S]*?)\n\s*\},\s*corridors:/)?.[1] ?? "";
  const value = heroBlock.match(new RegExp(`^\\s*${name}\\s*:\\s*(\\d+)`, "m"))?.[1];
  return value ? Number(value) : 0;
}

function parseSrcSet(source, name) {
  const match = source.match(new RegExp(`\\b${name}\\s*:\\s*\\[([\\s\\S]*?)\\n\\s*\\]`));
  if (!match) return [];
  return [...match[1].matchAll(/src:\s*"([^"]+)"\s*,\s*width:\s*(\d+)/g)].map((entry) => ({
    src: entry[1],
    width: Number(entry[2]),
  }));
}

function publicPath(sitePath) {
  return path.join(root, "public", sitePath.replace(/^\//, ""));
}

function isWebp(filePath) {
  const header = readFileSync(filePath).subarray(0, 12).toString("ascii");
  return header.startsWith("RIFF") && header.slice(8, 12) === "WEBP";
}

const heroMarkup = extractHeroMarkup(mainSource);
const pictures = [...heroMarkup.matchAll(/<picture\b[\s\S]*?<\/picture>/gi)];
const images = [...heroMarkup.matchAll(/<img\b[^>]*>/gi)];

if (pictures.length !== 1) {
  fail(`Homepage static hero should contain exactly one picture; found ${pictures.length}.`);
}
if (images.length !== 1) {
  fail(`Homepage static hero should contain exactly one image and no carousel layer; found ${images.length}.`);
}

const heroImage = images[0]?.[0] ?? "";
const eagerCount = (heroMarkup.match(/loading\s*=\s*["']eager["']/gi) ?? []).length;
const highPriorityCount = (heroMarkup.match(/fetchpriority\s*=\s*["']high["']/gi) ?? []).length;
const lazyCount = (heroMarkup.match(/loading\s*=\s*["']lazy["']/gi) ?? []).length;
const nextLayerCount = (heroMarkup.match(/data-home-hero-layer\s*=\s*["']next["']/gi) ?? []).length;

if (eagerCount !== 1 || highPriorityCount !== 1) {
  fail(`Homepage hero should load exactly one eager/high-priority image; eager=${eagerCount}, high=${highPriorityCount}.`);
}
if (lazyCount !== 0 || nextLayerCount !== 0) {
  fail("Homepage static hero must not add a lazy/eager secondary carousel image.");
}
if (attribute(heroImage, "loading") !== "eager" || attribute(heroImage, "decoding") !== "async" || attribute(heroImage, "fetchpriority") !== "high") {
  fail("Homepage hero image should use loading=\"eager\", decoding=\"async\" and fetchpriority=\"high\".");
}

// These interpolated templates are the source of the rendered <picture> attrs.
// Check the templates as well as the single picture/image shape above so a
// refactor cannot leave a static-looking <img> with no responsive candidates.
if (!mainSource.includes('<source media="(max-width: 720px)" type="image/webp" srcset="${homepageHeroMobileSrcSet}" sizes="100vw"')) {
  fail("Homepage hero must expose a mobile WebP source with a 100vw size hint.");
}
if (!mainSource.includes('srcset="${homepageHeroDesktopSrcSet}" sizes="100vw" width="${homepageAssets.hero.width}" height="${homepageAssets.hero.height}"')) {
  fail("Homepage hero must expose the desktop srcset, 100vw size hint and intrinsic dimensions.");
}
if (!mainSource.includes("const homepageHeroDesktopSrcSet = homepageAssets.hero.desktopSrcSet")) {
  fail("Homepage hero desktop srcset must come from homepageAssets.");
}
if (!mainSource.includes("const homepageHeroMobileSrcSet = homepageAssets.hero.mobileSrcSet")) {
  fail("Homepage hero mobile srcset must come from homepageAssets.");
}

const desktopPath = parsePathProperty(assetSource, "desktop");
const mobilePath = parsePathProperty(assetSource, "mobile");
const intrinsicWidth = parseHeroIntrinsic(assetSource, "width");
const intrinsicHeight = parseHeroIntrinsic(assetSource, "height");
const desktopSrcSet = parseSrcSet(assetSource, "desktopSrcSet");
const mobileSrcSet = parseSrcSet(assetSource, "mobileSrcSet");

if (!desktopPath || !mobilePath || intrinsicWidth < 1 || intrinsicHeight < 1) {
  fail("Homepage hero asset config must provide desktop/mobile fallbacks and positive intrinsic dimensions.");
}
if (desktopSrcSet.length < 2 || mobileSrcSet.length < 2) {
  fail(`Homepage hero should provide multiple DPR-aware candidates; desktop=${desktopSrcSet.length}, mobile=${mobileSrcSet.length}.`);
}

function checkSrcSet(name, entries, fallback, viewportWidth) {
  const widths = entries.map((entry) => entry.width);
  if (widths.some((width) => !Number.isInteger(width) || width < 1)) {
    fail(`${name} hero srcset widths must be positive integer width descriptors.`);
  }
  if (new Set(widths).size !== widths.length) {
    fail(`${name} hero srcset must not repeat a width descriptor.`);
  }
  if (widths.some((width, index) => index > 0 && width <= widths[index - 1])) {
    fail(`${name} hero srcset widths must be strictly ascending for predictable DPR selection.`);
  }
  if (!entries.some((entry) => entry.width >= viewportWidth)) {
    fail(`${name} hero srcset needs a candidate at or above its ${viewportWidth}px target viewport.`);
  }
  if (fallback !== entries.at(-1)?.src) {
    fail(`${name} hero fallback must match the largest ${name} srcset candidate.`);
  }
  for (const entry of entries) {
    if (!entry.src.endsWith(".webp")) fail(`${name} hero candidate should be a WebP file: ${entry.src}`);
    const file = publicPath(entry.src);
    if (!existsSync(file)) {
      fail(`Responsive hero image file is missing: ${entry.src}`);
      continue;
    }
    const bytes = statSync(file).size;
    if (bytes <= 0) fail(`Responsive hero image is empty: ${entry.src}`);
    if (bytes > maxHeroVariantBytes) {
      fail(`${entry.src} exceeds the ${Math.round(maxHeroVariantBytes / 1024)} KiB hero transfer budget (${bytes} bytes).`);
    }
    if (!isWebp(file)) fail(`Responsive hero image is not a valid WebP container: ${entry.src}`);
  }
}

checkSrcSet("Desktop", desktopSrcSet, desktopPath, desktopViewportWidth);
checkSrcSet("Mobile", mobileSrcSet, mobilePath, mobileViewportWidth);

if (desktopPath && !desktopSrcSet.some((entry) => entry.src === desktopPath)) {
  fail("Homepage hero desktop fallback must be one of the declared desktop srcset candidates.");
}
if (mobilePath && !mobileSrcSet.some((entry) => entry.src === mobilePath)) {
  fail("Homepage hero mobile fallback must be one of the declared mobile srcset candidates.");
}
if (intrinsicWidth && intrinsicWidth < desktopSrcSet.at(-1)?.width) {
  fail("Homepage hero intrinsic width must not be smaller than its largest desktop candidate.");
}

const homeHeroCss = styleSource.match(/\.home-hero\s*\{[\s\S]*?\}/)?.[0] ?? "";
const homeHeroImageCss = styleSource.match(/\.home-hero-image\s*\{[\s\S]*?\}/)?.[0] ?? "";
const homeHeroLayerCss = styleSource.match(/\.home-hero-media,[\s\S]*?\.home-hero-scrim\s*\{[\s\S]*?\}/)?.[0] ?? "";
if (!/min-height\s*:/.test(homeHeroCss)) {
  fail("Homepage hero should reserve a minimum layout height before the image loads.");
}
if (!/position\s*:\s*absolute/.test(homeHeroLayerCss) || !/height\s*:\s*100%/.test(homeHeroImageCss)) {
  fail("Homepage hero media must remain absolutely positioned with a reserved image box.");
}

if (styleSource.includes(".home-hero-image") && /transition\s*:\s*(?!none)/.test(homeHeroImageCss) && !/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(styleSource)) {
  fail("Homepage hero image motion must have a prefers-reduced-motion CSS fallback.");
}

function expectedHeroPath(viewportWidth, deviceScaleFactor) {
  const candidates = viewportWidth <= 720 ? mobileSrcSet : desktopSrcSet;
  const targetWidth = viewportWidth * deviceScaleFactor;
  return (candidates.find((candidate) => candidate.width >= targetWidth) ?? candidates.at(-1))?.src ?? "";
}

function isHeroUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin === new URL(browserOrigin).origin && [...desktopSrcSet, ...mobileSrcSet].some((entry) => parsed.pathname === entry.src);
  } catch {
    return false;
  }
}

function assertLocalBrowserOrigin() {
  assert.equal(browserOriginUrl.protocol, "http:", "Hero browser QA requires local HTTP");
  assert.ok(["127.0.0.1", "localhost"].includes(browserOriginUrl.hostname), "Hero browser QA requires a local origin");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function trackHeroRequests(page) {
  const requests = [];
  const responses = [];
  const responseTasks = [];
  page.on("request", (request) => {
    if (isHeroUrl(request.url())) requests.push({ url: request.url(), method: request.method() });
  });
  page.on("response", (response) => {
    if (!isHeroUrl(response.url())) return;
    const task = response.body().then((body) => {
      responses.push({ url: response.url(), status: response.status(), bytes: body.length });
    }).catch((error) => {
      responses.push({ url: response.url(), status: response.status(), bytes: null, error: String(error) });
    });
    responseTasks.push(task);
  });
  return { requests, responses, responseTasks };
}

async function installNetworkIsolation(context, { delayHero = false, onHeroRequest = () => {}, blockedExternal = [], blockedMutations = [] } = {}) {
  await context.route("**/*", async (route) => {
    const request = route.request();
    const method = request.method().toUpperCase();
    let requestUrl;
    try {
      requestUrl = new URL(request.url());
    } catch {
      blockedExternal.push({ method, host: "invalid-url", resourceType: request.resourceType() });
      await route.abort();
      return;
    }

    // The delayed hero response must remain the first policy decision for the
    // rendered hero cases. It continues through the same isolated context
    // after the intentional delay, so reserved geometry is still exercised.
    if (delayHero && readMethods.has(method) && isHeroUrl(request.url())) {
      onHeroRequest();
      await wait(900);
      await route.continue();
      return;
    }

    if (requestUrl.origin === browserOriginUrl.origin && readMethods.has(method)) {
      await route.continue();
      return;
    }

    const record = {
      method,
      host: requestUrl.hostname,
      path: requestUrl.origin === browserOriginUrl.origin ? requestUrl.pathname : undefined,
      resourceType: request.resourceType(),
    };
    if (mutationMethods.has(method)) blockedMutations.push(record);
    else blockedExternal.push(record);
    await route.abort();
  });
}

async function heroSnapshot(page) {
  return page.locator(".home-hero").evaluate((hero) => {
    const image = hero.querySelector("img");
    const imageRect = image?.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const computed = image ? getComputedStyle(image) : null;
    return {
      imageCount: hero.querySelectorAll("img").length,
      nextLayerCount: hero.querySelectorAll('[data-home-hero-layer="next"]').length,
      eagerCount: [...hero.querySelectorAll("img")].filter((item) => item.getAttribute("loading") === "eager").length,
      highPriorityCount: [...hero.querySelectorAll("img")].filter((item) => item.getAttribute("fetchpriority") === "high").length,
      currentSrc: image?.currentSrc ?? "",
      currentSrcPath: image?.currentSrc ? new URL(image.currentSrc).pathname : "",
      src: image?.getAttribute("src") ?? "",
      widthAttr: image?.getAttribute("width") ?? "",
      heightAttr: image?.getAttribute("height") ?? "",
      complete: image instanceof HTMLImageElement && image.complete,
      naturalWidth: image instanceof HTMLImageElement ? image.naturalWidth : 0,
      naturalHeight: image instanceof HTMLImageElement ? image.naturalHeight : 0,
      imageRect: imageRect ? { x: imageRect.x, y: imageRect.y, width: imageRect.width, height: imageRect.height } : null,
      heroRect: { x: heroRect.x, y: heroRect.y, width: heroRect.width, height: heroRect.height },
      heroMinHeight: getComputedStyle(hero).minHeight,
      imagePosition: computed?.position ?? "",
      imageHeight: computed?.height ?? "",
      imageTransition: computed?.transitionDuration ?? "",
      imageAnimation: computed?.animationDuration ?? "",
    };
  });
}

async function waitForHeroImage(page) {
  const image = page.locator(".home-hero img").first();
  await image.waitFor({ state: "attached", timeout: 15000 });
  const handle = await image.elementHandle();
  assert.ok(handle, "Hero image element handle is missing");
  await page.waitForFunction((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0, handle, { timeout: 15000 });
  return image;
}

async function runBrowserCase(browserName, launcher, viewportWidth, deviceScaleFactor) {
  const viewport = { width: viewportWidth, height: viewportWidth === 1440 ? 900 : 844 };
  const browser = await launcher.launch({ headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor, reducedMotion: "no-preference" });
  let delayedHeroRequests = 0;
  const blockedExternal = [];
  const blockedMutations = [];
  await installNetworkIsolation(context, {
    delayHero: true,
    onHeroRequest: () => { delayedHeroRequests += 1; },
    blockedExternal,
    blockedMutations,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const network = trackHeroRequests(page);
  const url = new URL("/", browserOrigin).href;
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    assert.ok(response, `${browserName} ${viewportWidth}@${deviceScaleFactor}: no homepage response`);
    assert.ok(response.status() < 400, `${browserName} ${viewportWidth}@${deviceScaleFactor}: homepage HTTP ${response.status()}`);
    await page.locator(".home-hero").waitFor({ state: "visible", timeout: 15000 });
    await wait(45);
    const beforeImage = await heroSnapshot(page);
    assert.ok(beforeImage.heroRect.height > 0 && beforeImage.imageRect?.width > 0, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero geometry was not reserved before image completion`);
    assert.equal(beforeImage.complete, false, `${browserName} ${viewportWidth}@${deviceScaleFactor}: delayed image completed before the pre-load geometry sample`);

    await waitForHeroImage(page);
    await Promise.allSettled(network.responseTasks);
    const afterImage = await heroSnapshot(page);
    const expectedPath = expectedHeroPath(viewportWidth, deviceScaleFactor);
    assert.equal(afterImage.currentSrcPath, expectedPath, `${browserName} ${viewportWidth}@${deviceScaleFactor}: browser selected the wrong responsive hero source`);
    assert.ok(afterImage.complete && afterImage.naturalWidth > 0 && afterImage.naturalHeight > 0, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero image did not load with natural dimensions`);
    assert.equal(afterImage.imageCount, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: unexpected secondary hero image`);
    assert.equal(afterImage.nextLayerCount, 0, `${browserName} ${viewportWidth}@${deviceScaleFactor}: unexpected next carousel layer`);
    assert.equal(afterImage.eagerCount, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: eager image count mismatch`);
    assert.equal(afterImage.highPriorityCount, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: high-priority image count mismatch`);
    assert.equal(afterImage.widthAttr, String(intrinsicWidth), `${browserName} ${viewportWidth}@${deviceScaleFactor}: intrinsic width attribute is missing or wrong`);
    assert.equal(afterImage.heightAttr, String(intrinsicHeight), `${browserName} ${viewportWidth}@${deviceScaleFactor}: intrinsic height attribute is missing or wrong`);
    assert.equal(network.requests.length, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: expected one hero image request, found ${network.requests.length}`);
    assert.equal(network.responses.length, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: expected one hero image response, found ${network.responses.length}`);
    assert.equal(network.responses[0].status, 200, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero response was not successful`);
    assert.ok(network.responses[0].bytes > 0 && network.responses[0].bytes <= maxHeroVariantBytes, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero response bytes are outside the transfer budget`);
    assert.equal(network.responses[0].bytes, statSync(publicPath(expectedPath)).size, `${browserName} ${viewportWidth}@${deviceScaleFactor}: browser bytes differ from the local selected asset`);
    assert.ok(Math.abs(beforeImage.heroRect.height - afterImage.heroRect.height) <= 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero height shifted after image load`);
    assert.ok(Math.abs(beforeImage.heroRect.width - afterImage.heroRect.width) <= 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero width shifted after image load`);
    assert.ok(Math.abs(beforeImage.imageRect.width - afterImage.imageRect.width) <= 1 && Math.abs(beforeImage.imageRect.height - afterImage.imageRect.height) <= 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: image box shifted after image load`);
    assert.notEqual(afterImage.heroMinHeight, "0px", `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero has no reserved minimum height`);
    assert.notEqual(afterImage.imagePosition, "static", `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero image is not positioned for stable layering`);

    const currentSrcBeforeWait = afterImage.currentSrc;
    const stableWaitMs = viewportWidth === 390 && deviceScaleFactor === 1 ? 17000 : 1200;
    await page.waitForTimeout(stableWaitMs);
    const stable = await heroSnapshot(page);
    await Promise.allSettled(network.responseTasks);
    assert.equal(stable.currentSrc, currentSrcBeforeWait, `${browserName} ${viewportWidth}@${deviceScaleFactor}: hero currentSrc changed after static-hero stability wait`);
    assert.equal(stable.imageCount, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: extra hero image appeared after stability wait`);
    assert.equal(network.requests.length, 1, `${browserName} ${viewportWidth}@${deviceScaleFactor}: extra hero request appeared after stability wait`);
    assert.deepEqual(pageErrors, [], `${browserName} ${viewportWidth}@${deviceScaleFactor}: page errors`);
    return {
      browser: browserName,
      viewport: { ...viewport, deviceScaleFactor },
      expectedCurrentSrc: expectedPath,
      currentSrc: stable.currentSrcPath,
      beforeImage,
      afterImage,
      stable,
      delayedHeroRequests,
      heroRequests: network.requests.length,
      heroResponses: network.responses,
      stableWaitMs,
      pageErrors,
      networkIsolation: {
        blockedExternal,
        blockedMutations,
      },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runReducedMotionCase(browserName, launcher, viewportWidth) {
  const browser = await launcher.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportWidth === 1440 ? 900 : 844 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const blockedExternal = [];
  const blockedMutations = [];
  await installNetworkIsolation(context, { blockedExternal, blockedMutations });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const url = new URL("/", browserOrigin).href;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await waitForHeroImage(page);
    const snapshot = await page.locator(".home-hero").evaluate((hero) => {
      const image = hero.querySelector("img");
      const computed = image ? getComputedStyle(image) : null;
      return {
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        transitionDuration: computed?.transitionDuration ?? "",
        animationDuration: computed?.animationDuration ?? "",
        currentSrc: image?.currentSrc ?? "",
        imageCount: hero.querySelectorAll("img").length,
      };
    });
    assert.equal(snapshot.reducedMotion, true, `${browserName} ${viewportWidth}: reduced-motion media query did not match`);
    assert.ok(["0s", "0ms"].includes(snapshot.transitionDuration), `${browserName} ${viewportWidth}: reduced-motion transition remains ${snapshot.transitionDuration}`);
    assert.ok(["0s", "0ms"].includes(snapshot.animationDuration), `${browserName} ${viewportWidth}: reduced-motion animation remains ${snapshot.animationDuration}`);
    assert.equal(snapshot.imageCount, 1, `${browserName} ${viewportWidth}: reduced-motion introduced an extra hero image`);
    assert.deepEqual(pageErrors, [], `${browserName} ${viewportWidth}: reduced-motion page errors`);
    return {
      browser: browserName,
      viewportWidth,
      snapshot,
      pageErrors,
      networkIsolation: {
        blockedExternal,
        blockedMutations,
      },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runBrowserPhase() {
  assertLocalBrowserOrigin();
  const results = [];
  const browserLaunchers = [["chromium", chromium], ["webkit", webkit]];
  for (const [browserName, launcher] of browserLaunchers) {
    for (const viewportWidth of [1440, 390]) {
      for (const deviceScaleFactor of [1, 2]) {
        const startedAt = Date.now();
        try {
          const details = await runBrowserCase(browserName, launcher, viewportWidth, deviceScaleFactor);
          results.push({ browser: browserName, width: viewportWidth, deviceScaleFactor, name: "rendered responsive hero", status: "passed", durationMs: Date.now() - startedAt, details });
        } catch (error) {
          results.push({ browser: browserName, width: viewportWidth, deviceScaleFactor, name: "rendered responsive hero", status: "failed", durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
        }
      }
      const startedAt = Date.now();
      try {
        const details = await runReducedMotionCase(browserName, launcher, viewportWidth);
        results.push({ browser: browserName, width: viewportWidth, deviceScaleFactor: 1, name: "rendered reduced-motion hero", status: "passed", durationMs: Date.now() - startedAt, details });
      } catch (error) {
        results.push({ browser: browserName, width: viewportWidth, deviceScaleFactor: 1, name: "rendered reduced-motion hero", status: "failed", durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  const failures = results.filter((result) => result.status === "failed");
  const report = { generatedAt: new Date().toISOString(), origin: browserOrigin, phase: "rendered", browsers: ["chromium", "webkit"], results, failures: failures.length };
  await mkdir(path.dirname(browserReportPath), { recursive: true });
  await writeFile(browserReportPath, `${JSON.stringify(report, null, 2)}\n`);
  return { report, failures };
}

if (errors.length) {
  console.error(JSON.stringify({ heroPerformance: "fail", errors }, null, 2));
  process.exit(1);
}

const staticSummary = {
  heroPerformance: "pass",
  contract: "static-responsive",
  eager: eagerCount,
  highPriority: highPriorityCount,
  desktopCandidates: desktopSrcSet.map(({ src, width }) => ({ src, width, bytes: existsSync(publicPath(src)) ? statSync(publicPath(src)).size : null })),
  mobileCandidates: mobileSrcSet.map(({ src, width }) => ({ src, width, bytes: existsSync(publicPath(src)) ? statSync(publicPath(src)).size : null })),
  intrinsic: { width: intrinsicWidth, height: intrinsicHeight },
};

if (!browserPhaseEnabled) {
  console.log(JSON.stringify({ ...staticSummary, browserPhase: "skipped", browserCommand: "HERO_PERFORMANCE_BROWSER=1 npm run qa:hero-performance" }, null, 2));
} else {
  const browserSummary = await runBrowserPhase();
  console.log(JSON.stringify({ ...staticSummary, browserPhase: browserSummary.failures.length ? "fail" : "pass", browserOrigin, browserReport: path.relative(root, browserReportPath), renderedChecks: browserSummary.report.results.length, renderedFailures: browserSummary.failures.length }, null, 2));
  if (browserSummary.failures.length) process.exitCode = 1;
}
