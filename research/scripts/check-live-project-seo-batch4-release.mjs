import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const origin = "https://www.wpbnewconstruction.com";
const records = JSON.parse(await fs.readFile(new URL("../../public/data/project-seo-batch4.json", import.meta.url), "utf8"));
const byId = new Map(records.map((record) => [record.projectId, record]));
const artifactDir = path.join(process.cwd(), ".runtime/live-batch4-release");
await fs.mkdir(artifactDir, { recursive: true });

const interests = {
  availability: "Request current availability",
  "pricing-packet": "Pricing + floor-plan packet",
};
const hrefKey = { availability: "availabilityHref", "pricing-packet": "packetHref" };
const actionSelector = (action) => `#wpb-project-seo-batch4 [data-project-growth-action="${action}"]`;

function schemaNodes(value) {
  if (!value) return [];
  return Array.isArray(value?.["@graph"]) ? value["@graph"] : [value];
}

async function assertLiveDocument(page, record, width) {
  const response = await page.goto(`${origin}${record.path}`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, `${record.projectId}: HTTP status`);
  await page.locator("#wpb-project-seo-batch4").waitFor({ state: "visible" });
  assert.equal(await page.title(), record.title, `${record.projectId}: title`);
  assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), record.description, `${record.projectId}: description`);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), record.canonical, `${record.projectId}: canonical`);
  assert.equal(await page.getByRole("heading", { level: 1, name: record.h1, exact: true }).count(), 1, `${record.projectId}: H1 identity`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${record.projectId}: horizontal overflow`);

  const schemaTexts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodes = schemaTexts.flatMap((text) => { try { return schemaNodes(JSON.parse(text)); } catch { return []; } });
  const buyerPage = nodes.find((node) => node?.name === record.h1 && node?.dateModified === record.reviewedOn);
  assert.ok(buyerPage, `${record.projectId}: buyer-guide structured data`);

  const guideText = await page.locator("#wpb-project-seo-batch4").innerText();
  assert.match(guideText, /Buyer summary/i, `${record.projectId}: buyer summary`);
  assert.match(guideText, /Marketing status/i, `${record.projectId}: marketing status`);
  assert.match(guideText, /Construction status/i, `${record.projectId}: construction status`);
  assert.match(guideText, /Residence availability/i, `${record.projectId}: availability status`);
  assert.match(guideText, /Sources and review date/i, `${record.projectId}: sources`);
  for (const value of [record.status.marketing, record.status.construction, record.status.availability]) {
    assert.ok(guideText.includes(value), `${record.projectId}: qualified status copy retained`);
  }

  const visibleImages = page.locator('main img:visible');
  assert.ok(await visibleImages.count() > 0, `${record.projectId}: project images present`);
  assert.equal(await visibleImages.first().evaluate((image) => image.complete && image.naturalWidth > 0), true, `${record.projectId}: project image loaded`);

  const links = await page.locator('#wpb-project-seo-batch4 a[href^="/"]').evaluateAll((anchors) => [...new Set(anchors.map((anchor) => anchor.getAttribute("href")).filter(Boolean))]);
  assert.ok(links.length >= 4, `${record.projectId}: internal research links`);
  for (const href of links.filter((href) => !href.startsWith("/inquire/"))) {
    const linkResponse = await page.request.get(new URL(href, origin).href);
    assert.ok(linkResponse.status() < 400, `${record.projectId}: internal link ${href}`);
  }

  for (const action of ["availability", "pricing-packet"]) {
    const link = page.locator(actionSelector(action));
    const href = await link.getAttribute("href");
    assert.equal(href, record[hrefKey[action]], `${record.projectId}:${action}: CTA href`);
    const url = new URL(href, origin);
    assert.equal(url.searchParams.get("project"), record.projectId, `${record.projectId}:${action}: alias`);
    assert.equal(url.searchParams.get("interest"), interests[action], `${record.projectId}:${action}: interest`);
  }

  await page.screenshot({ path: path.join(artifactDir, `${record.projectId}-${width}.png`), fullPage: true });
}

async function runSequence(browser, width, sequence, sequenceName) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 } });
  const submissions = [];
  let externalAnalytics = 0;
  const errors = [];
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === "www.wpbnewconstruction.com" && url.pathname === "/api/leads" && request.method() === "POST") {
      submissions.push(request.postDataJSON());
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, leadId: "live-batch4-intercepted" }) });
    }
    if (/googletagmanager|google-analytics/.test(url.hostname)) {
      externalAnalytics += 1;
      return route.fulfill({ status: 204, body: "" });
    }
    if (/challenges\.cloudflare\.com/.test(url.hostname)) return route.fulfill({ status: 204, body: "" });
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  let firstTouch;
  try {
    for (let index = 0; index < sequence.length; index += 1) {
      const { projectId, action } = sequence[index];
      const record = byId.get(projectId);
      assert.ok(record, `${sequenceName}: record ${projectId}`);
      await page.goto(`${origin}${record.path}`, { waitUntil: "networkidle" });
      await page.locator("#wpb-project-seo-batch4").waitFor({ state: "visible" });
      if (!firstTouch) firstTouch = `${origin}${record.path}`;
      const link = page.locator(actionSelector(action));
      const href = await link.getAttribute("href");
      const expectedUrl = new URL(href, origin);
      assert.equal(expectedUrl.searchParams.get("project"), record.projectId, `${sequenceName}:${index}: CTA alias`);
      assert.equal(expectedUrl.searchParams.get("interest"), interests[action], `${sequenceName}:${index}: CTA interest`);
      await link.click();
      await page.waitForURL((url) => url.origin === origin && url.pathname === "/inquire/");
      const requestUrl = new URL(page.url());
      assert.equal(requestUrl.searchParams.get("project"), record.projectId, `${sequenceName}:${index}: request alias`);
      assert.equal(requestUrl.searchParams.get("interest"), interests[action], `${sequenceName}:${index}: request interest`);
      const form = page.locator(".inquiry-form");
      await form.waitFor({ state: "visible" });
      assert.equal(await form.locator('[name="project"]').inputValue(), record.slug, `${sequenceName}:${index}: canonical form project`);
      assert.equal(await form.locator('[name="interest"]').inputValue(), interests[action], `${sequenceName}:${index}: exact form interest`);
      await form.locator('[name="name"]').fill("PR80 Live QA Example");
      await form.locator('[name="email"]').fill("pr80-live-qa@example.invalid");
      await form.locator('[name="phone"]').fill("202-555-0180");
      await form.locator('[name="message"]').fill("PR80_LIVE_QA_DO_NOT_SEND");
      await form.locator('[name="consent"]').check();
      await form.locator('[name="turnstile_token"]').evaluate((input) => { input.value = "PR80_INTERCEPTED_TOKEN"; });
      const before = submissions.length;
      const intercepted = page.waitForResponse((response) => response.url() === `${origin}/api/leads` && response.request().method() === "POST", { timeout: 15000 });
      await form.locator('button[type="submit"]').click();
      await intercepted;
      assert.equal(submissions.length, before + 1, `${sequenceName}:${index}: one intercepted submission`);
      const payload = submissions.at(-1);
      assert.equal(payload.project, record.slug, `${sequenceName}:${index}: canonical payload project`);
      assert.equal(payload.interest, interests[action], `${sequenceName}:${index}: exact payload interest`);
      const source = new URL(payload.source_page);
      assert.equal(source.pathname, "/inquire/", `${sequenceName}:${index}: source path`);
      assert.equal(source.searchParams.get("project"), record.projectId, `${sequenceName}:${index}: source alias`);
      assert.equal(source.searchParams.get("interest"), interests[action], `${sequenceName}:${index}: source interest`);
      assert.equal(payload.landing_page, firstTouch, `${sequenceName}:${index}: first touch preserved`);
      const analytics = await page.evaluate(() => JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]));
      assert.doesNotMatch(analytics, /PR80 Live QA Example|pr80-live-qa@|202-555-0180|PR80_LIVE_QA_DO_NOT_SEND|PR80_INTERCEPTED_TOKEN/);
    }
    assert.deepEqual(errors, [], `${sequenceName}: browser errors`);
    assert.equal(externalAnalytics, 0, `${sequenceName}: analytics must not transmit without consent`);
    return { sequenceName, width, submissions: submissions.length, firstTouch, status: "pass" };
  } finally {
    await context.close();
  }
}

async function verifyMap(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
  const page = await context.newPage();
  const errors = [];
  let loaderResponses = 0;
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/") || /googletagmanager|google-analytics/.test(url.hostname)) return route.abort();
    return route.continue();
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.hostname === "maps.googleapis.com" && url.pathname === "/maps/api/js" && response.ok()) loaderResponses += 1;
  });
  page.on("console", (message) => {
    const code = message.text().match(/Google Maps JavaScript API (?:error|warning):\s*([A-Za-z0-9]+)/)?.[1];
    if (code) errors.push(code);
  });
  page.on("pageerror", () => errors.push("UncaughtBrowserError"));
  try {
    assert.equal((await page.goto(`${origin}/map/`, { waitUntil: "domcontentloaded" }))?.status(), 200, `map:${width}: status`);
    const deny = page.getByRole("button", { name: "No thanks", exact: true });
    if (await deny.isVisible()) await deny.click();
    const card = page.locator(".home-hero-map-card:visible").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const card = [...document.querySelectorAll(".home-hero-map-card")].find((element) => !element.closest("[data-route-view]")?.hidden);
      if (card?.getAttribute("data-map-state") !== "ready" || card.querySelector(".gm-err-container")) return false;
      return [...card.querySelectorAll(".gm-style img")].some((image) => image.complete && image.naturalWidth >= 128 && image.naturalHeight >= 128);
    }, null, { timeout: 30000 });
    assert.ok(loaderResponses > 0, `map:${width}: real Maps loader`);
    assert.deepEqual(errors, [], `map:${width}: Google/browser errors`);
    const previous = await card.locator(".gm-style img").evaluateAll((images) => images.filter((image) => image.complete && image.naturalWidth >= 128).map((image) => image.currentSrc || image.src));
    await card.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForFunction((old) => [...document.querySelectorAll(".home-hero-map-card")].filter((element) => !element.closest("[data-route-view]")?.hidden).flatMap((element) => [...element.querySelectorAll(".gm-style img")]).some((image) => image.complete && image.naturalWidth >= 128 && !old.includes(image.currentSrc || image.src)), previous, { timeout: 15000 });
    await card.screenshot({ path: path.join(artifactDir, `map-${width}.png`) });
    return { width, realLoader: true, tiles: true, zoom: true, status: "pass" };
  } finally {
    await context.close();
  }
}

async function verifyExistingJourneys(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
  const page = await context.newPage();
  const routes = [
    { family: "commercial", path: "/buildings/", selector: "main" },
    { family: "corridor", path: "/corridors/south-flagler/", selector: "main" },
    { family: "comparison", path: "/answers/north-flagler-vs-south-flagler-new-condos/", selector: "main" },
    { family: "olara", path: "/floorplans/olara/residence-d/", selector: "[data-floorplan-id]" },
  ];
  const results = [];
  try {
    for (const route of routes) {
      const response = await page.goto(`${origin}${route.path}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${route.family}: status`);
      await page.locator(route.selector).waitFor({ state: "visible" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${route.family}: overflow`);
      assert.ok((await page.locator("h1").first().innerText()).trim().length > 3, `${route.family}: H1`);
      results.push({ ...route, width, status: "pass" });
    }
    return results;
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });
const results = { documents: [], sequences: [], maps: [], existingJourneys: [] };
try {
  const sitemapResponse = await (await browser.newPage()).request.get(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.ok(), true, "sitemap response");
  const sitemap = await sitemapResponse.text();
  for (const record of records) {
    const start = sitemap.indexOf(`<loc>${record.canonical}</loc>`);
    assert.ok(start >= 0, `${record.projectId}: sitemap entry`);
    const block = sitemap.slice(start, sitemap.indexOf("</url>", start));
    assert.ok(block.includes(`<lastmod>${record.reviewedOn}</lastmod>`), `${record.projectId}: sitemap lastmod`);
  }

  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 } });
    const page = await context.newPage();
    for (const record of records) {
      await assertLiveDocument(page, record, width);
      results.documents.push({ project: record.projectId, width, status: "pass" });
    }
    await context.close();

    const sequences = [
      ["rosewood-availability-to-packet", [{ projectId: "rosewood", action: "availability" }, { projectId: "rosewood", action: "pricing-packet" }]],
      ["rosewood-packet-to-availability", [{ projectId: "rosewood", action: "pricing-packet" }, { projectId: "rosewood", action: "availability" }]],
      ["maison-availability-to-packet", [{ projectId: "maison-dor", action: "availability" }, { projectId: "maison-dor", action: "pricing-packet" }]],
      ["maison-packet-to-availability", [{ projectId: "maison-dor", action: "pricing-packet" }, { projectId: "maison-dor", action: "availability" }]],
      ["rosewood-to-maison", [{ projectId: "rosewood", action: "pricing-packet" }, { projectId: "maison-dor", action: "availability" }]],
      ["maison-to-rosewood", [{ projectId: "maison-dor", action: "availability" }, { projectId: "rosewood", action: "pricing-packet" }]],
    ];
    for (const [name, sequence] of sequences) results.sequences.push(await runSequence(browser, width, sequence, name));
    results.maps.push(await verifyMap(browser, width));
    results.existingJourneys.push(...await verifyExistingJourneys(browser, width));
  }
} finally {
  await browser.close();
}

const output = {
  verifiedAt: new Date().toISOString(),
  productionOrigin: origin,
  deployedMergeSha: "9041493a48c573658872d79445c4f1e796643c8c",
  results,
  limitations: [
    "All automated inquiry POSTs were intercepted in-browser; no real lead was sent.",
    "Turnstile production verification, database/email/CRM delivery and duplicate prevention were not exercised by this automated release audit.",
    "Third-party analytics transport was blocked; this audit does not certify GA4 delivery or measured growth.",
  ],
};
await fs.writeFile(path.join(artifactDir, "results.json"), JSON.stringify(output, null, 2));
console.log(JSON.stringify({ liveBatch4Release: "pass", documents: results.documents.length, sequences: results.sequences.length, maps: results.maps.length, existingJourneys: results.existingJourneys.length }, null, 2));
