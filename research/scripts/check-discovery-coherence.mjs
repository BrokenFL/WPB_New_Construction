#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

const origin = process.env.V2_ORIGIN?.trim() || "http://127.0.0.1:5188";
const parsedOrigin = new URL(origin);
const allowDevOrigin = process.env.V2_ALLOW_DEV === "1" || process.env.V2_DEV === "1";
assert.equal(parsedOrigin.protocol, "http:", "Discovery coherence QA requires local HTTP");
assert.ok(["127.0.0.1", "localhost"].includes(parsedOrigin.hostname), "Discovery coherence QA requires a local origin");
if (!allowDevOrigin) {
  assert.equal(parsedOrigin.hostname, "127.0.0.1", "Built-preview discovery QA requires 127.0.0.1");
  assert.equal(parsedOrigin.port, "5188", "Built-preview discovery QA requires port 5188");
}

const workspace = process.cwd();
const outputDirectory = path.join(workspace, "output/playwright/discovery-coherence");
const outputPath = path.join(outputDirectory, "results.json");
const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 320, height: 812 },
];
const focusedViewports = new Set([1440, 390]);
const browserLaunchers = [
  ["chromium", chromium],
  ["webkit", webkit],
];
const requestedBrowser = process.env.V2_BROWSER?.trim();
const browsers = requestedBrowser
  ? browserLaunchers.filter(([name]) => name === requestedBrowser)
  : browserLaunchers;
const captureScreenshots = process.env.V2_CAPTURE === "1";

const expectedCorridorCounts = {
  "North Flagler": 10,
  Downtown: 5,
  "South Flagler": 6,
  "Palm Beach": 2,
  "South End / South Dixie": 1,
};
function parseGeneratedArray(source, exportName) {
  const expression = new RegExp(`export const ${exportName} = ([\\s\\S]*?) as const;`);
  const match = source.match(expression);
  assert.ok(match, `Could not read ${exportName} from generated site data`);
  return JSON.parse(match[1]);
}

const generatedSource = await fs.readFile(path.join(workspace, "src/generated/siteData.ts"), "utf8");
const projectFacts = parseGeneratedArray(generatedSource, "projectFacts");
const sourceCounts = Object.fromEntries(Object.keys(expectedCorridorCounts).map((area) => [
  area,
  projectFacts.filter((project) => project.area === area).length,
]));
assert.equal(projectFacts.length, 24, "Canonical public project inventory should contain 24 projects");
assert.deepEqual(sourceCounts, expectedCorridorCounts, "Canonical corridor counts changed unexpectedly");

const expectedNorthProjectIds = projectFacts
  .filter((project) => project.area === "North Flagler")
  .map((project) => project.projectId);
const results = {
  generatedAt: new Date().toISOString(),
  origin,
  source: {
    path: "src/generated/siteData.ts",
    canonicalProjectCount: projectFacts.length,
    corridorCounts: sourceCounts,
  },
  browsers: [],
  checks: [],
  limitations: [],
};

await fs.mkdir(outputDirectory, { recursive: true });

function absolute(route) {
  return new URL(route, `${origin}/`).href;
}

function activeRoute(page) {
  return page.locator('[data-route-view]:not([hidden])').first();
}

async function dismissConsent(page) {
  const noThanks = page.getByRole("button", { name: "No thanks", exact: true });
  if (await noThanks.count()) await noThanks.first().click();
}

async function settleImages(page) {
  await page.evaluate(async () => {
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const step = Math.max(window.innerHeight, 400);
    for (let top = 0; top < height; top += step) {
      window.scrollTo(0, top);
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(120);
}

async function visit(page, route) {
  const response = await page.goto(absolute(route), { waitUntil: "domcontentloaded" });
  assert.ok(response, `${route}: no response`);
  assert.ok(response.status() < 400, `${route}: HTTP ${response.status()}`);
  await page.locator(".site-shell").waitFor({ state: "attached", timeout: 15000 });
  await page.waitForFunction(
    () => [...document.querySelectorAll("[data-route-view]")].some((element) => !element.hasAttribute("hidden")),
    undefined,
    { timeout: 15000 },
  );
  await page.waitForTimeout(140);
  await dismissConsent(page);
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    offenders: [...document.querySelectorAll("*")]
      .filter((element) => element !== document.documentElement && element !== document.body)
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && (rect.right > window.innerWidth + 1 || rect.left < -1))
      .sort((a, b) => (b.rect.right - window.innerWidth) - (a.rect.right - window.innerWidth))
      .slice(0, 6)
      .map(({ element, rect }) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: typeof element.className === "string" ? element.className : "",
        text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      })),
  }));
  assert.ok(
    dimensions.documentWidth <= dimensions.viewport + 1,
    `${label}: document overflow ${dimensions.documentWidth} > ${dimensions.viewport}; ${JSON.stringify(dimensions.offenders)}`,
  );
  assert.ok(
    dimensions.bodyWidth <= dimensions.viewport + 1,
    `${label}: body overflow ${dimensions.bodyWidth} > ${dimensions.viewport}; ${JSON.stringify(dimensions.offenders)}`,
  );
  return dimensions;
}

async function assertImagesLoaded(page, label) {
  await settleImages(page);
  const images = await activeRoute(page).locator("img").evaluateAll((elements) => elements.map((element) => ({
    src: element.getAttribute("src") || "",
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    alt: element.getAttribute("alt") || "",
  })));
  const internalImages = [...new Set(images.map((image) => image.src).filter((src) => src.startsWith("/")))];
  const internalResponses = await Promise.all(internalImages.map(async (src) => {
    const response = await fetch(absolute(src));
    return { src, status: response.status, ok: response.ok, contentType: response.headers.get("content-type") || "" };
  }));
  const failedResponses = internalResponses.filter((response) => !response.ok || !/^image\//i.test(response.contentType));
  assert.equal(failedResponses.length, 0, `${label}: image responses failed ${JSON.stringify(failedResponses.slice(0, 4))}`);
  const decodedFailures = images.filter((image) => image.src.startsWith("/") && image.complete && image.naturalWidth === 0);
  assert.equal(decodedFailures.length, 0, `${label}: decoded images failed ${JSON.stringify(decodedFailures.slice(0, 4))}`);
  return {
    imageCount: images.length,
    internalImageCount: internalImages.length,
    decodedImageCount: images.filter((image) => image.naturalWidth > 0).length,
    pendingLazyImageCount: images.filter((image) => image.src.startsWith("/") && !image.complete && image.naturalWidth === 0).length,
  };
}

async function capture(page, browserName, routeName, width) {
  if (!captureScreenshots) return undefined;
  const filename = `${browserName}-${routeName}-${width}.png`;
  const screenshotPath = path.join(outputDirectory, filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return path.relative(workspace, screenshotPath);
}

async function assertHomepage(page, articlePathRef) {
  const root = activeRoute(page);
  assert.equal(await root.getAttribute("data-route-view"), "home");
  const previewCards = root.locator(".home-featured-grid [data-project-card]");
  assert.equal(await previewCards.count(), 3, "Homepage should show three representative building cards");
  const previewCorridors = new Set(await previewCards.locator("[data-pc-corridor]").allTextContents());
  assert.deepEqual(previewCorridors, new Set(["NORTH FLAGLER", "SOUTH FLAGLER", "DOWNTOWN"]), "Homepage preview should represent three major corridors");
  const heading = await root.locator(".home-featured-section h2").innerText();
  assert.match(heading, /3 buildings, three different areas/i);
  const previewDeck = await root.locator(".home-featured-section .v2-section-deck").innerText();
  assert.match(previewDeck, /24 tracked buildings/i);
  const exploreLinks = root.getByRole("link", { name: /Explore all 24/i });
  assert.ok(await exploreLinks.count() >= 2, "Homepage should expose the complete 24-building directory near and after the preview");
  assert.ok(await root.locator('.home-section-jump a[href="/map/"]').count(), "Homepage section jump should expose the building map");
  const articleLinks = root.locator('#latest-developments [data-home-news-id] a[href^="/updates/"]');
  assert.equal(await root.locator("#latest-developments [data-home-news-id]").count(), 3, "Development Desk should retain the newest three stories");
  assert.equal(new Set(await root.locator("#latest-developments [data-home-news-id]").evaluateAll((cards) => cards.map((card) => card.getAttribute("data-home-news-id")))).size, 3);
  if (!articlePathRef.value) articlePathRef.value = await articleLinks.first().getAttribute("href");
  assert.ok(articlePathRef.value?.startsWith("/updates/"), "Development Desk should link into a full article");
  return { previewCorridors: [...previewCorridors], articlePath: articlePathRef.value };
}

async function assertNorthFlagler(page) {
  const root = page.locator('[data-route-view="corridor"][data-corridor-route="north-flagler"]:not([hidden])');
  assert.equal(await root.count(), 1, "North Flagler corridor route should be active");
  const directory = root.locator(".corridor-discovery-shell");
  const cards = directory.locator("[data-project-card]");
  const ids = await cards.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-project-card")));
  assert.equal(ids.length, 10, "North Flagler should render all ten canonical buildings");
  assert.equal(new Set(ids).size, 10, "North Flagler should render each building exactly once");
  assert.deepEqual(new Set(ids), new Set(expectedNorthProjectIds), "North Flagler cards should match the canonical ten-building set");
  assert.ok(ids.indexOf("alba-palm-beach") >= 0 && ids.indexOf("alba-palm-beach") <= 3, "Alba should appear in the early North Flagler directory sequence");
  assert.equal(await directory.locator('a[href="/compare/"]').count(), 1, "North Flagler should link to comparison");
  assert.equal(await directory.locator('a[href="/buildings/"]').count(), 1, "North Flagler should link to the complete directory");
  const ordering = await root.evaluate((element) => {
    const directorySection = element.querySelector(".corridor-discovery-shell");
    const questions = element.querySelector(".corridor-questions-section");
    return {
      directoryTop: directorySection?.getBoundingClientRect().top ?? 0,
      questionsTop: questions?.getBoundingClientRect().top ?? 0,
      heroBottom: element.querySelector(".corridor-route-hero")?.getBoundingClientRect().bottom ?? 0,
    };
  });
  assert.ok(ordering.directoryTop >= ordering.heroBottom, "North Flagler building discovery should follow the hero");
  assert.ok(ordering.directoryTop < ordering.questionsTop, "North Flagler building discovery should precede buyer questions");
  return { cardIds: ids, ordering };
}

async function assertProject(page) {
  const root = page.locator('[data-route-view="project"][data-project-id="olara"]:not([hidden])');
  assert.equal(await root.count(), 1, "Olara project route should be active");
  assert.ok(await root.locator('a[href^="/corridors/"]').count() > 0, "Building page should link back to its corridor");
  assert.ok(await root.locator('a[href^="/compare/"]').count() > 0, "Building page should link to comparison");
  assert.ok(await root.locator('a[href="/inquire/"]').count() > 0, "Building page should retain inquiry access");
  const corridorCta = root.locator(".project-corridor-cta");
  assert.equal(await corridorCta.count(), 1, "Building page should include a corridor discovery bridge");
  assert.ok(await corridorCta.locator(".project-corridor-preview [class*=related-building-card]").count() > 0, "Corridor discovery bridge should show nearby building previews");
  assert.ok(await corridorCta.locator('a[href^="/corridors/"]').count() > 0, "Corridor bridge should expose the complete corridor set");
  const crossAreaCompare = corridorCta.getByRole("link", { name: /Compare across areas/i });
  const compareHref = await crossAreaCompare.getAttribute("href");
  assert.match(compareHref ?? "", /^\/compare\/\?projects=/, "Cross-area comparison should carry an explicit two-building selection");
  const compareIds = new URL(compareHref ?? "", "http://local.test").searchParams.get("projects")?.split(",") ?? [];
  assert.equal(compareIds.length, 2, "Cross-area comparison should carry exactly two buildings");
  const compareCorridors = compareIds.map((id) => projectFacts.find((project) => project.projectId === id)?.area);
  assert.equal(new Set(compareCorridors).size, 2, "Cross-area comparison should select buildings from different corridors");
  await crossAreaCompare.click();
  await page.waitForFunction(() => document.querySelector('[data-route-view="compare"]:not([hidden])'));
  await page.waitForFunction(() => [...document.querySelectorAll("[data-compare-route-select]")].slice(0, 2).every((select) => select instanceof HTMLSelectElement && select.value));
  const selectedValues = await page.locator("[data-compare-route-select]").evaluateAll((selects) => selects.slice(0, 2).map((select) => select.value));
  assert.deepEqual(selectedValues, compareIds, "Cross-area comparison should open with the linked pair selected");
  const selectedLabels = await page.locator("[data-compare-route-select]").evaluateAll((selects) => selects.slice(0, 2).map((select) => select.selectedOptions[0]?.textContent?.trim() || ""));
  selectedLabels.forEach((label) => assert.match(label, / — /, "Selected comparison labels should include corridor context"));
  return {
    corridorPreviewCount: await corridorCta.locator(".project-corridor-preview [class*=related-building-card]").count(),
    compareHref,
    compareCorridors,
    selectedValues,
    selectedLabels,
  };
}

async function assertArticle(page) {
  const root = page.locator('[data-route-view="news-detail"]:not([hidden])');
  assert.equal(await root.count(), 1, "News article route should be active");
  const bridge = root.locator(".article-discovery-bridge");
  assert.equal(await bridge.count(), 1, "Article should include a building-research bridge");
  assert.ok(await bridge.locator('a[href="/buildings/"]').count() > 0, "Article should link to the complete building directory");
  assert.ok(await bridge.locator('a[href="/compare/"]').count() > 0, "Article should link to comparison");
  assert.ok(await root.getByText("Published", { exact: true }).count() > 0, "Article should retain publication date labeling");
  assert.ok(await root.getByText("Updated", { exact: true }).count() > 0, "Article should retain updated-date labeling");
  const title = await root.locator("h1").first().innerText();
  if (/Terra and Frisbie Add \$20M Parcel/i.test(title)) {
    assert.match(await bridge.locator("h2").innerText(), /Move from the story to the buildings/i, "Broad-market story should use a neutral continuation");
    assert.equal(await bridge.locator(".article-discovery-preview").count(), 0, "Broad-market story should not infer unrelated building cards");
    assert.ok(await bridge.locator('a[href="/corridors/"]').count() > 0, "Broad-market story should link to the area guide");
    assert.ok(await bridge.locator('a[href="/map/"]').count() > 0, "Broad-market story should link to the building map");
    assert.doesNotMatch(await bridge.innerText(), /Palm Beach island|Explore more in Palm Beach/i, "Broad-market story must not infer a Palm Beach island relationship");
  }
  return {
    bridgeLinks: await bridge.locator("a").count(),
    title,
  };
}

async function assertMap(page) {
  const root = page.locator('[data-route-view="map"]:not([hidden])');
  assert.equal(await root.count(), 1, "Map route should be active");
  assert.match(await root.locator("[data-map-filter-result]").innerText(), /24 mapped buildings/i);
  const detail = root.locator("[data-map-project-detail]");
  assert.ok(await detail.getByText("Selected Building", { exact: true }).count() > 0, "Map should expose a selected building detail");
  assert.ok(await detail.locator('a[href^="/projects/"]').count() > 0, "Map selection should link to a building guide");
  assert.ok(await detail.locator('a[href^="/corridors/"]').count() > 0, "Map selection should link to its corridor");
  assert.ok(await detail.locator('a[href="/compare/"]').count() > 0, "Map selection should link to comparison");
  return { selectedBuilding: await detail.locator("strong").first().innerText() };
}

async function assertBrandAssets(page) {
  const links = await page.evaluate(() => [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')].map((element) => ({
    rel: element.getAttribute("rel"),
    href: element.getAttribute("href"),
  })));
  assert.ok(links.some((link) => link.rel === "manifest" && link.href?.endsWith("/site.webmanifest")), "Page should reference the site manifest");
  assert.ok(links.some((link) => link.rel === "icon" && link.href?.endsWith("/favicon.svg")), "Page should reference the square SVG favicon");
  const checks = [
    ["/favicon.ico", "image/x-icon"],
    ["/favicon.svg", "image/svg+xml"],
    ["/favicon-16x16.png", "image/png"],
    ["/favicon-192x192.png", "image/png"],
    ["/apple-touch-icon.png", "image/png"],
    ["/site.webmanifest", "application/manifest+json"],
  ];
  const responses = [];
  for (const [asset, contentType] of checks) {
    const response = await fetch(absolute(asset));
    assert.ok(response.ok, `${asset}: HTTP ${response.status}`);
    const actual = response.headers.get("content-type") || "";
    assert.ok(actual.includes(contentType), `${asset}: expected ${contentType}, got ${actual}`);
    responses.push({ asset, status: response.status, contentType: actual });
  }
  const manifest = await (await fetch(absolute("/site.webmanifest"))).json();
  assert.equal(manifest.name, "WPB New Construction");
  assert.equal(manifest.short_name, "WPB New Construction");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 4, "Manifest should expose the responsive icon set");
  return { links, responses, manifestIcons: manifest.icons.length };
}

async function record(browserName, width, routeName, callback) {
  const startedAt = Date.now();
  try {
    const details = await callback();
    results.checks.push({ browser: browserName, width, route: routeName, status: "pass", durationMs: Date.now() - startedAt, details: details ?? {} });
  } catch (error) {
    results.checks.push({ browser: browserName, width, route: routeName, status: "fail", durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
  }
}

const articlePathRef = { value: "" };

try {
  for (const [browserName, launcher] of browsers) {
    let browser;
    try {
      browser = await launcher.launch();
      results.browsers.push({ name: browserName, status: "launched" });
    } catch (error) {
      results.browsers.push({ name: browserName, status: "unavailable", error: error instanceof Error ? error.message : String(error) });
      results.limitations.push(`${browserName} could not launch: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    try {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await record(browserName, viewport.width, "home", async () => {
          await visit(page, "/");
          const details = await assertHomepage(page, articlePathRef);
          assert.deepEqual(pageErrors, [], `home: browser page errors ${JSON.stringify(pageErrors)}`);
          return { ...details, overflow: await assertNoOverflow(page, `${browserName} home ${viewport.width}`), images: await assertImagesLoaded(page, "home"), screenshot: await capture(page, browserName, "home", viewport.width) };
        });
        await record(browserName, viewport.width, "north-flagler", async () => {
          await visit(page, "/corridors/north-flagler/");
          const details = await assertNorthFlagler(page);
          return { ...details, overflow: await assertNoOverflow(page, `${browserName} north-flagler ${viewport.width}`), images: await assertImagesLoaded(page, "north-flagler"), screenshot: await capture(page, browserName, "north-flagler", viewport.width) };
        });

        if (focusedViewports.has(viewport.width)) {
          await record(browserName, viewport.width, "corridors", async () => {
            await visit(page, "/corridors/");
            const root = activeRoute(page);
            assert.equal(await root.getAttribute("data-route-view"), "corridors");
            assert.equal(await root.locator(".corridors-feature-card").count(), 5, "Corridor hub should surface all five corridor choices");
            return { corridorCards: 5, overflow: await assertNoOverflow(page, `${browserName} corridors ${viewport.width}`), images: await assertImagesLoaded(page, "corridors"), screenshot: await capture(page, browserName, "corridors", viewport.width) };
          });
          await record(browserName, viewport.width, "project", async () => {
            await visit(page, "/projects/olara/");
            const details = await assertProject(page);
            return { ...details, overflow: await assertNoOverflow(page, `${browserName} project ${viewport.width}`), images: await assertImagesLoaded(page, "project"), screenshot: await capture(page, browserName, "project", viewport.width) };
          });
          if (articlePathRef.value) {
            await record(browserName, viewport.width, "article", async () => {
              await visit(page, articlePathRef.value);
              const details = await assertArticle(page);
              return { ...details, overflow: await assertNoOverflow(page, `${browserName} article ${viewport.width}`), images: await assertImagesLoaded(page, "article"), screenshot: await capture(page, browserName, "article", viewport.width) };
            });
          }
          await record(browserName, viewport.width, "map", async () => {
            await visit(page, "/map/");
            const details = await assertMap(page);
            return { ...details, overflow: await assertNoOverflow(page, `${browserName} map ${viewport.width}`), images: await assertImagesLoaded(page, "map"), screenshot: await capture(page, browserName, "map", viewport.width) };
          });
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }

  if (!requestedBrowser) {
    const launched = results.browsers.filter((browser) => browser.status === "launched").map((browser) => browser.name);
    if (!launched.includes("chromium")) results.limitations.push("Chromium did not launch; desktop/mobile browser verification is incomplete.");
    if (!launched.includes("webkit")) results.limitations.push("WebKit did not launch; WebKit verification is incomplete.");
  }

  const failed = results.checks.filter((check) => check.status === "fail");
  results.summary = {
    canonicalProjectCount: projectFacts.length,
    corridorCounts: sourceCounts,
    browsersLaunched: results.browsers.filter((browser) => browser.status === "launched").map((browser) => browser.name),
    passedChecks: results.checks.filter((check) => check.status === "pass").length,
    failedChecks: failed.length,
    screenshotsCaptured: captureScreenshots,
  };
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.summary));
  if (failed.length) {
    console.error(`${failed.length} discovery coherence checks failed. See ${path.relative(workspace, outputPath)}.`);
    process.exitCode = 1;
  }
} catch (error) {
  results.fatalError = error instanceof Error ? error.message : String(error);
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  throw error;
}
