#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

const scriptFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptFile), "../..");
const sourceNewsPath = path.join(repoRoot, "src/data/approvedExternalNews.ts");
const canonicalProjectsPath = path.join(repoRoot, "src/generated/projectModelPublic.ts");
const outputPath = path.join(repoRoot, "output/playwright/milestone2-qa.json");
const configuredModel = "gpt-5.6-luna/max";
const origin = process.env.V2_ORIGIN?.trim() || "http://127.0.0.1:5188";
const allowDevOrigin = process.env.V2_ALLOW_DEV === "1" || process.env.V2_DEV === "1";
const viewports = [1440, 390, 320];
const browserLaunchers = [
  ["chromium", chromium],
  ["webkit", webkit],
];

function currentGitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function assertLocalPreview() {
  const parsed = new URL(origin);
  const localHost = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  assert.equal(parsed.protocol, "http:", "V2 QA origin must use local HTTP");
  assert.equal(localHost, true, "V2 QA origin must be local");
  if (!allowDevOrigin) {
    assert.equal(parsed.hostname, "127.0.0.1", "Built-preview QA requires 127.0.0.1");
    assert.equal(parsed.port, "5188", "Built-preview QA requires port 5188");
  }
}

function sourcePublishedNews() {
  return fs.readFile(sourceNewsPath, "utf8").then((source) => {
    const declarationStart = source.indexOf("export const approvedExternalNews");
    const arrayStart = source.indexOf("= [", declarationStart);
    const arrayEnd = source.indexOf("] as const;", arrayStart);
    assert.ok(declarationStart >= 0 && arrayStart >= 0 && arrayEnd >= 0, "Could not locate approved news source array");
    const records = JSON.parse(source.slice(arrayStart + 2, arrayEnd + 1));
    return records
      .filter((item) => item.status === "published")
      .sort((left, right) => {
        const timestamp = (item) => Date.parse(item.publishedAt || item.sourcePublishedDate || item.sourcePublishedAt || item.dateDiscovered || item.fetchedAt) || 0;
        return timestamp(right) - timestamp(left) || left.id.localeCompare(right.id);
      });
  });
}

function sourceCanonicalProjects() {
  return fs.readFile(canonicalProjectsPath, "utf8").then((source) => {
    const declarationStart = source.indexOf("export const publicProjectModel");
    const objectStart = source.indexOf("{", declarationStart);
    const objectEnd = source.lastIndexOf("} as const;");
    assert.ok(declarationStart >= 0 && objectStart >= 0 && objectEnd > objectStart, "Could not locate public project model source object");
    const model = JSON.parse(source.slice(objectStart, objectEnd + 1));
    assert.ok(Array.isArray(model.projects), "Public project model has no projects array");
    return model.projects;
  });
}

function normalizeIdentifier(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/projects/") ? trimmed.replace(/^\/projects\//, "").replace(/\/$/, "") : trimmed;
}

function resolveCanonicalProjectField(records, identifier, field) {
  const normalized = normalizeIdentifier(identifier);
  const record = records.find((candidate) =>
    normalizeIdentifier(candidate.publicSlug) === normalized
    || (candidate.lookupAliases || []).some((alias) => normalizeIdentifier(alias) === normalized),
  );
  assert.ok(record, `Canonical project record is missing for ${identifier}`);
  const reviewedValue = String(record.reviewedFields?.[field] ?? "").trim();
  if (reviewedValue) return { value: reviewedValue, source: "reviewed_override", record };
  const structuredValue = String(field === "address" ? record.facts?.projectAddress ?? "" : record[field] ?? "").trim();
  if (structuredValue) return { value: structuredValue, source: "structured_source", record };
  return { value: "", source: "missing", record };
}

function formattedDate(value) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? Date.parse(`${value}T12:00:00`)
    : Date.parse(value);
  assert.ok(!Number.isNaN(parsed), `Unparseable source date: ${value}`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(parsed));
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function routeUrl(route) {
  return new URL(route, `${origin}/`).href;
}

async function visit(page, route) {
  const response = await page.goto(routeUrl(route), { waitUntil: "domcontentloaded" });
  assert.ok(response, `No response for ${route}`);
  assert.ok(response.status() < 400, `${route} returned HTTP ${response.status()}`);
  await page.locator(".site-shell").waitFor({ state: "attached", timeout: 12000 });
  await page.waitForTimeout(120);
  return response;
}

async function dismissBlockingOverlays(page) {
  const leadDismiss = page.locator('[data-lead-modal]:not([hidden]) [data-lead-modal-dismiss]:visible').first();
  if (await leadDismiss.count()) await leadDismiss.click();
  const analyticsDismiss = page.locator('#wpb-analytics-consent:visible').getByRole("button", { name: "No thanks" });
  if (await analyticsDismiss.count()) await analyticsDismiss.click();
}

async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert.ok(dimensions.documentWidth <= dimensions.viewport + 1, `${label}: document scrollWidth ${dimensions.documentWidth} exceeds viewport ${dimensions.viewport}`);
  assert.ok(dimensions.bodyWidth <= dimensions.viewport + 1, `${label}: body scrollWidth ${dimensions.bodyWidth} exceeds viewport ${dimensions.viewport}`);
  return dimensions;
}

async function waitForImage(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    await locator.elementHandle(),
    { timeout: 12000 },
  );
  const image = await locator.evaluate((element) => ({
    complete: element instanceof HTMLImageElement && element.complete,
    naturalWidth: element instanceof HTMLImageElement ? element.naturalWidth : 0,
    naturalHeight: element instanceof HTMLImageElement ? element.naturalHeight : 0,
    source: element.getAttribute("src"),
  }));
  assert.equal(image.complete, true, `${label}: image did not complete`);
  assert.ok(image.naturalWidth > 0 && image.naturalHeight > 0, `${label}: image has no natural dimensions`);
  return image;
}

async function runCheck(results, scope, name, callback) {
  const startedAt = Date.now();
  try {
    const details = await callback();
    results.push({ ...scope, name, status: "passed", durationMs: Date.now() - startedAt, details: details ?? {} });
    return true;
  } catch (error) {
    results.push({
      ...scope,
      name,
      status: "failed",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkHomepage(page, expected, canonicalProjects, results, scope, routeState) {
  await runCheck(results, scope, "homepage newest three published updates", async () => {
    await visit(page, "/");
    assert.equal(await page.locator('.site-shell').getAttribute("data-active-route"), "home");

    const cards = page.locator("[data-home-news-id]");
    assert.equal(await cards.count(), 3, "Homepage must render exactly three published updates");
    for (let index = 0; index < expected.length; index += 1) {
      const item = expected[index];
      const card = cards.nth(index);
      assert.equal(await card.getAttribute("data-home-news-id"), item.id, `Homepage update ${index + 1} is not in source publication order`);
      assert.equal(normalize(await card.locator("h3").innerText()), item.title, `Homepage update ${index + 1} title mismatch`);
      assert.equal(await card.locator(".v2-desk-date time").getAttribute("datetime"), item.publishedAt, `Homepage update ${index + 1} publication datetime mismatch`);
      assert.equal(normalize(await card.locator(".v2-desk-date time").innerText()), formattedDate(item.publishedAt), `Homepage update ${index + 1} publication label mismatch`);
      const sourceDate = item.sourcePublishedDate || item.sourcePublishedAt;
      assert.ok(sourceDate, `${item.id} has no source publication date`);
      assert.equal(await card.locator(".v2-desk-source time").getAttribute("datetime"), sourceDate, `${item.id} source datetime mismatch`);
      assert.equal(normalize(await card.locator(".v2-desk-source time").innerText()), formattedDate(sourceDate), `${item.id} source date label mismatch`);
      assert.equal(await card.isVisible(), true, `${item.id} is hidden or expired on the homepage`);
      assert.equal(await card.locator("h3 a").getAttribute("href"), `/updates/${item.slug || item.id}/`);
    }
    assert.match(normalize(await page.locator(".v2-desk-note").innerText()), /Our three latest publications/i, "Homepage publication-order note is missing");
    return { ids: expected.map((item) => item.id), publicationLabels: expected.map((item) => formattedDate(item.publishedAt)) };
  });

  await runCheck(results, scope, "canonical Alba news and featured cards retain reviewed facts", async () => {
    const albaNews = expected.find((item) => (item.relatedProjectIds || []).includes("alba-palm-beach"));
    assert.ok(albaNews, "Published Alba news item is missing from the homepage source set");
    assert.match(albaNews.title, /complete|move-in ready/i, "Alba news does not describe the completed project state");

    const alba = resolveCanonicalProjectField(canonicalProjects, "alba-palm-beach", "status");
    assert.equal(alba.source, "reviewed_override", "Alba status must resolve from the reviewed canonical override");
    assert.equal(alba.value, "Completed", "Canonical Alba status changed unexpectedly");
    const albaCard = page.locator('.home-featured-grid [data-project-card="alba-palm-beach"]');
    await albaCard.waitFor({ state: "visible", timeout: 12000 });
    assert.equal(normalize(await albaCard.locator("[data-pc-status]").textContent()), alba.value, "Featured Alba card does not match canonical reviewed status");

    const olara = resolveCanonicalProjectField(canonicalProjects, "olara", "delivery");
    assert.equal(olara.source, "reviewed_override", "Olara delivery must resolve from the reviewed canonical override");
    assert.equal(olara.value, "2028", "Canonical Olara delivery changed unexpectedly");
    const olaraCard = page.locator('.home-featured-grid [data-project-card="olara"]');
    await olaraCard.waitFor({ state: "visible", timeout: 12000 });
    assert.equal(normalize(await olaraCard.locator("[data-pc-year]").textContent()), `${olara.value} Delivery`, "Featured Olara card does not match canonical reviewed delivery");
    return {
      albaNewsId: albaNews.id,
      albaNewsTitle: albaNews.title,
      albaStatus: { value: alba.value, source: alba.source },
      olaraDelivery: { value: olara.value, source: olara.source },
    };
  });

  await runCheck(results, scope, "original homepage graphic is visible, loaded, and contained", async () => {
    const graphic = page.locator('.home-end-bridge img[src="/assets/home/wpb-end-cap-bridge-v01.png"]');
    assert.equal(await graphic.count(), 1, "Original bottom graphic is missing or duplicated");
    const image = await waitForImage(page, graphic, "original homepage graphic");
    assert.equal(await graphic.isVisible(), true, "Original homepage graphic is not visible");
    const box = await graphic.boundingBox();
    assert.ok(box && box.width > 0 && box.height > 0, "Original homepage graphic has no rendered box");
    assert.ok(box.x >= -1 && box.x + box.width <= scope.width + 1, `Original homepage graphic overflows ${scope.width}px viewport`);
    const dimensions = await assertNoHorizontalOverflow(page, "homepage original graphic");
    return { source: image.source, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, box, dimensions };
  });

  await runCheck(results, scope, "homepage anchor activates by keyboard", async () => {
    const anchor = page.locator('a.v2-latest-link[href="#latest-developments"]');
    assert.equal(await anchor.count(), 1, "Homepage latest-development anchor is missing");
    await anchor.focus();
    assert.equal(await anchor.evaluate((element) => document.activeElement === element), true, "Homepage latest anchor could not receive focus");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => window.location.hash), "#latest-developments");
    assert.equal(await page.locator("#latest-developments").isVisible(), true, "Keyboard anchor target is not visible");
    return { hash: "#latest-developments" };
  });

  const linkedRoutes = [
    { route: `/updates/${expected[0].slug || expected[0].id}/`, marker: '[data-route-view="news-detail"]:not([hidden])', label: "newest update" },
    { route: "/projects/alba-palm-beach/", marker: '[data-route-view="project"][data-project-id="alba-palm-beach"]:not([hidden])', label: "Alba related project" },
    { route: "/corridors/north-flagler/", marker: '[data-route-view="corridor"][data-corridor-route="north-flagler"]:not([hidden])', label: "North Flagler related corridor" },
  ];
  if (!routeState.done) {
    routeState.done = true;
    for (const target of linkedRoutes) {
      await runCheck(results, scope, `${target.label} route resolves`, async () => {
        const response = await visit(page, target.route);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator(target.marker).count(), 1, `${target.label} did not activate its expected route view`);
        return { route: target.route, status: response.status() };
      });
    }
    await visit(page, "/");
  }
  return page;
}

async function checkGallery(page, results, scope) {
  await runCheck(results, scope, "gallery opens, Escape closes, and returns focus", async () => {
    await visit(page, "/projects/berkeley/");
    await dismissBlockingOverlays(page);
    const trigger = page.locator('.route-view-project:not([hidden]) [data-v2-gallery-trigger]:visible').first();
    await trigger.waitFor({ state: "visible", timeout: 12000 });
    assert.equal(await trigger.count(), 1, "No visible V2 gallery trigger found on Berkeley project route");
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await trigger.click();
    const dialog = page.locator("dialog.v2-gallery-dialog");
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    assert.equal(await dialog.evaluate((element) => element instanceof HTMLDialogElement && element.open), true, "Gallery dialog did not open");
    assert.equal(await dialog.locator('[data-v2-gallery-action="close"]').isVisible(), true, "Gallery close control is missing");
    const viewerImage = dialog.locator(".v2-gallery-figure img");
    await waitForImage(page, viewerImage, "gallery viewer image");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(50);
    assert.equal(await dialog.evaluate((element) => element instanceof HTMLDialogElement && element.open), false, "Escape did not close gallery dialog");
    assert.equal(await trigger.evaluate((element) => document.activeElement === element), true, "Gallery close did not return focus to trigger");
    return { triggerLabel: await trigger.getAttribute("aria-label") };
  });
}

async function checkFloorplanViewer(page, results, scope) {
  await runCheck(results, scope, "floorplan viewer opens and closes on Escape", async () => {
    await visit(page, "/floorplans/");
    await dismissBlockingOverlays(page);
    const trigger = page.locator('.route-view-floorplans:not([hidden]) [data-floorplan-open]:visible').first();
    await trigger.waitFor({ state: "visible", timeout: 12000 });
    assert.equal(await trigger.count(), 1, "No visible floorplan preview trigger found");
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await trigger.click();
    const viewer = page.locator('[data-floorplan-viewer]');
    await viewer.waitFor({ state: "visible", timeout: 5000 });
    assert.equal(await viewer.evaluate((element) => element instanceof HTMLDialogElement && element.open), true, "Floorplan viewer did not open");
    assert.ok(await viewer.locator("[data-floorplan-frame] img, [data-floorplan-frame] iframe, [data-floorplan-request]").count() > 0, "Floorplan viewer did not render a plan frame");
    assert.equal(await viewer.locator('[data-floorplan-close]').first().isVisible(), true, "Floorplan close control is missing");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(50);
    assert.equal(await viewer.evaluate((element) => element instanceof HTMLDialogElement && element.open), false, "Escape did not close floorplan viewer");
    assert.equal(await trigger.evaluate((element) => document.activeElement === element), true, "Floorplan close did not return focus to trigger");
    return { title: await trigger.getAttribute("data-floorplan-title") };
  });
}

function compareFactsFromPage(page) {
  return page.evaluate(() => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const projects = Array.from(document.querySelectorAll(".compare-matrix-desktop thead th"))
      .slice(1)
      .map((cell) => clean(cell.textContent));
    const desktop = Array.from(document.querySelectorAll(".compare-matrix-desktop tbody tr"))
      .filter((row) => !row.classList.contains("compare-section-row"))
      .map((row) => ({
        label: clean(row.querySelector("th")?.textContent),
        values: Array.from(row.querySelectorAll("td")).map((cell) => clean(cell.textContent)),
      }));
    const mobile = Array.from(document.querySelectorAll(".compare-mobile-criterion"))
      .map((criterion) => ({
        label: clean(criterion.querySelector("h4")?.textContent),
        values: Array.from(criterion.querySelectorAll(".compare-mobile-value")).map((value) => ({
          project: clean(value.querySelector("a")?.textContent),
          value: clean(value.querySelector("p")?.textContent),
        })),
      }));
    return { desktop, mobile, projects };
  });
}

function parityRows(facts) {
  const desktopRows = facts.desktop.map((row) => `${row.label}::${row.values.map((value, index) => `${facts.projects[index]}=${value}`).join("||")}`).sort();
  const mobileRows = facts.mobile.map((row) => `${row.label}::${row.values.map((value) => `${value.project}=${value.value}`).join("||")}`).sort();
  return { desktopRows, mobileRows };
}

async function checkCompare(page, results, scope, width) {
  await runCheck(results, scope, "compare selections carry context into inquiry", async () => {
    await visit(page, "/compare/");
    const selects = page.locator("[data-compare-route-select]");
    assert.equal(await selects.count(), 3, "Compare route selectors are incomplete");
    await selects.nth(0).selectOption("olara");
    await selects.nth(1).selectOption("shorecrest");
    await page.locator('[data-compare-results] .compare-matrix-wrap').waitFor({ state: "visible", timeout: 12000 });
    const selected = await selects.evaluateAll((items) => items.map((item) => item.value).filter(Boolean));
    assert.deepEqual(selected.slice(0, 2), ["olara", "shorecrest"], "Compare selections did not persist");

    const facts = await compareFactsFromPage(page);
    assert.ok(facts.desktop.length > 0 && facts.mobile.length > 0, "Compare facts did not render in both semantic representations");
    const parity = parityRows(facts);
    assert.deepEqual(parity.mobileRows, parity.desktopRows, "Mobile compare facts or labels diverge from desktop matrix");

    const mobileMatrix = page.locator(".compare-matrix-mobile");
    const desktopMatrix = page.locator(".compare-matrix-desktop");
    if (width <= 390) {
      assert.equal(await mobileMatrix.isVisible(), true, `${width}px mobile compare matrix is not visible`);
      assert.equal(await desktopMatrix.isVisible(), false, `${width}px desktop matrix should be hidden from visual presentation`);
      const mobileTypography = await page.locator(".compare-mobile-value p").evaluateAll((items) => items.map((item) => Number.parseFloat(getComputedStyle(item).fontSize)));
      assert.ok(mobileTypography.length > 0 && mobileTypography.every((size) => size >= 16), "Mobile compare values must remain at least 16px");
      const mobileLabels = await page.locator(".compare-mobile-criterion h4").evaluateAll((items) => items.map((item) => item.textContent?.trim()).filter(Boolean));
      assert.ok(mobileLabels.length > 0 && mobileLabels.every((label) => label.length > 0), "Mobile compare criterion labels are missing");
      await assertNoHorizontalOverflow(page, `${width}px compare`);
    } else {
      assert.equal(await desktopMatrix.isVisible(), true, "Desktop compare matrix is not visible");
    }

    const inquire = page.locator("[data-compare-inquire]");
    const href = await inquire.getAttribute("href");
    assert.ok(href, "Compare inquiry link is missing");
    const inquiryUrl = new URL(href, origin);
    const selectedNames = await selects.nth(0).locator("option:checked").innerText().then(async (first) => [first, await selects.nth(1).locator("option:checked").innerText()]);
    const message = inquiryUrl.searchParams.get("message") || "";
    assert.equal(inquiryUrl.searchParams.get("project"), selected[0], "Compare inquiry primary project is not the first selected building");
    assert.deepEqual((inquiryUrl.searchParams.get("projects") || "").split(","), selected, "Compare inquiry project IDs do not match the selected shortlist");
    assert.equal(inquiryUrl.searchParams.get("interest"), "compare", "Compare inquiry interest context is missing");
    assert.equal(inquiryUrl.searchParams.get("lead_capture_context"), "compare_shortlist", "Compare inquiry lead context is missing");
    assert.ok(selectedNames.every((name) => decodeURIComponent(message).includes(name)), "Compare inquiry link does not include selected project names");
    await inquire.click();
    await page.locator('.route-view-inquiry:not([hidden])').waitFor({ state: "visible", timeout: 5000 });
    const contextMessage = await page.locator('.inquiry-form textarea[name="message"]').inputValue();
    assert.ok(selectedNames.every((name) => contextMessage.includes(name)), "Inquiry message did not retain compare selections");
    const primaryProject = await page.locator('.inquiry-form select[name="project"]').inputValue();
    assert.equal(primaryProject, selected[0], "Inquiry form did not retain the first selected project as primary");
    assert.equal(await page.locator('.inquiry-form input[name="lead_capture_context"]').inputValue(), "compare_shortlist", "Inquiry form lost compare shortlist context");
    const requestSummary = page.locator('.inquiry-form [data-request-summary]');
    assert.equal(await requestSummary.count(), 1, "Compare inquiry request summary is missing");
    const summaryText = normalize(await requestSummary.innerText());
    assert.ok(selectedNames.every((name) => summaryText.includes(name)), "Request summary did not retain allowlisted selected building names");
    return { selected, selectedNames, primaryProject, context: "compare_shortlist", requestSummary: summaryText, mobileFacts: facts.mobile.length, desktopFacts: facts.desktop.length };
  });
}

async function checkInquiryConsent(page, results, scope) {
  await runCheck(results, scope, "inquiry consent is readable on narrow screens", async () => {
    await visit(page, "/inquire/");
    const consent = page.locator('.inquiry-form .consent-row > span');
    assert.equal(await consent.count(), 1, "Inquiry consent copy is missing");
    const metrics = await consent.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return { fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight), width: box.width, height: box.height };
    });
    assert.ok(metrics.fontSize >= 14, `Inquiry consent copy is too small: ${metrics.fontSize}px`);
    assert.ok(metrics.lineHeight >= 20, `Inquiry consent line-height is too tight: ${metrics.lineHeight}px`);
    assert.ok(metrics.width > 0 && metrics.height > 0, "Inquiry consent copy is not laid out");
    return metrics;
  });
}

async function checkInterceptedLeads(page, results, scope, leadState) {
  await runCheck(results, scope, "inquiry lead flow handles intercepted 503 then 200", async () => {
    await visit(page, "/inquire/");
    const form = page.locator("form.inquiry-form");
    assert.equal(await form.count(), 1, "Inquiry form is missing");
    const fillForm = async (suffix) => {
      await form.locator('input[name="name"]').fill(`QA Browser ${suffix}`);
      await form.locator('input[name="email"]').fill(`qa-${suffix.toLowerCase()}@example.test`);
      await form.locator('textarea[name="message"]').fill(`QA intercepted inquiry ${suffix}`);
      const consent = form.locator('input[name="consent"]');
      if (!(await consent.isChecked())) await consent.check();
      await form.locator('input[name="turnstile_token"]').evaluate((input) => { input.value = "qa-browser-token"; });
    };
    const status = form.locator(".form-status");
    leadState.status = 503;
    await fillForm("503");
    await form.locator('button[type="submit"]').click();
    await page.waitForFunction(() => {
      const form = document.querySelector("form.inquiry-form");
      const status = form?.querySelector(".form-status")?.textContent || "";
      return form?.dataset.submitting === "false" && /could not securely save|try again/i.test(status);
    }, { timeout: 10000 });
    assert.match(normalize(await status.innerText()), /could not securely save|try again/i, "503 lead response did not produce a retry message");

    leadState.status = 200;
    await fillForm("200");
    await form.locator('button[type="submit"]').click();
    await page.waitForFunction(() => {
      const form = document.querySelector("form.inquiry-form");
      const status = form?.querySelector(".form-status")?.textContent || "";
      return form?.dataset.submitting === "false" && /request was received/i.test(status);
    }, { timeout: 10000 });
    assert.match(normalize(await status.innerText()), /request was received/i, "200 lead response did not produce a success message");
    assert.equal(await form.locator('input[name="name"]').inputValue(), "", "Successful lead did not clear personal fields");
    assert.equal(await form.locator('input[name="email"]').inputValue(), "", "Successful lead did not clear email field");
    assert.equal(await form.locator('textarea[name="message"]').inputValue(), "", "Successful lead did not clear message field");
    assert.deepEqual(leadState.statuses.slice(-2), [503, 200], "Expected exactly one intercepted 503 and one intercepted 200 submission");
    return { interceptedStatuses: leadState.statuses.slice(-2), requestCount: leadState.statuses.length };
  });
}

async function checkFloorplanInquiryContext(page, results, scope, leadState) {
  await runCheck(results, scope, "floorplan viewer inquiry preserves plan context without a second POST", async () => {
    const existingForm = page.locator("form.inquiry-form");
    assert.equal(await existingForm.count(), 1, "Floorplan context regression did not begin on the inquiry form");
    assert.match(normalize(await existingForm.locator(".form-status").innerText()), /request was received/i, "The preceding intercepted 200 receipt was not visible before starting the floorplan regression");
    const baselinePosts = leadState.statuses.length;
    const floorplansNav = page.locator('header.site-nav [data-nav-item="floorplans"]:visible').first();
    assert.equal(await floorplansNav.count(), 1, "Visible primary floorplans navigation link is missing");
    await floorplansNav.click();
    const floorplansRoute = page.locator('.route-view-floorplans:not([hidden])');
    await floorplansRoute.waitFor({ state: "visible", timeout: 5000 });

    const plan = floorplansRoute.locator('[data-floorplan-open]:visible').first();
    await plan.waitFor({ state: "visible", timeout: 12000 });
    const expectedProject = await plan.getAttribute("data-floorplan-project");
    const expectedProjectSlug = await plan.getAttribute("data-floorplan-project-slug");
    const expectedPlan = await plan.getAttribute("data-floorplan-title");
    assert.ok(expectedProject && expectedProjectSlug && expectedPlan, "Floorplan trigger is missing project or plan context");
    await plan.click();

    const viewer = page.locator("[data-floorplan-viewer]");
    await viewer.waitFor({ state: "visible", timeout: 5000 });
    assert.equal(normalize(await viewer.locator("[data-floorplan-title]").textContent()), `${expectedProject} · ${expectedPlan}`, "Floorplan viewer title lost project or plan display context");
    const inquire = viewer.locator("[data-floorplan-inquire]");
    const href = await inquire.getAttribute("href");
    assert.ok(href, "Floorplan viewer inquiry CTA is missing");
    const inquiryUrl = new URL(href, origin);
    const expectedMessage = `Please send the current ${expectedPlan} packet for ${expectedProject}.`;
    assert.equal(inquiryUrl.searchParams.get("project"), expectedProjectSlug, "Floorplan inquiry project context is missing");
    assert.equal(inquiryUrl.searchParams.get("interest"), "floorplans", "Floorplan inquiry interest context is missing");
    assert.match(inquiryUrl.searchParams.get("lead_capture_context") || "", /^floorplan-request:library:/, "Floorplan inquiry lead context is missing");
    assert.equal(inquiryUrl.searchParams.get("message"), expectedMessage, "Floorplan inquiry message context is missing");
    await inquire.click();

    await page.locator('.route-view-inquiry:not([hidden])').waitFor({ state: "visible", timeout: 5000 });
    const form = page.locator("form.inquiry-form");
    assert.equal(await form.locator('select[name="project"]').inputValue(), expectedProjectSlug, "Inquiry form did not retain the floorplan project");
    assert.equal(await form.locator('textarea[name="message"]').inputValue(), expectedMessage, "Inquiry form did not retain the floorplan message");
    const summaryText = normalize(await form.locator('[data-request-summary]').innerText());
    assert.ok(summaryText.includes(expectedProject) && summaryText.includes(expectedPlan), "Inquiry summary did not retain project and plan display names");
    assert.equal(normalize(await form.locator(".form-status").innerText()), "", "A previous receipt remained visible after opening a new floorplan inquiry");
    assert.equal(leadState.statuses.length, baselinePosts, "Opening a floorplan inquiry issued an unexpected lead POST");
    return { project: expectedProjectSlug, projectName: expectedProject, plan: expectedPlan, leadPosts: leadState.statuses.length };
  });
}

async function checkAnalyticsConsent(page, results, scope, analyticsState) {
  await runCheck(results, scope, "analytics remains blocked before consent", async () => {
    await visit(page, "/");
    const mode = await page.evaluate(() => window.wpbAnalyticsDestination || "unset");
    assert.ok(mode === "local-only" || mode === "consent-required", `Unexpected analytics destination: ${mode}`);
    const prompt = page.locator("#wpb-analytics-consent");
    let promptState = "disabled";
    if (await prompt.count() && await prompt.isVisible()) {
      promptState = "visible";
      const copy = prompt.locator("p");
      const copyMetrics = await copy.evaluate((element) => {
        const style = getComputedStyle(element);
        return { fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight), height: element.getBoundingClientRect().height };
      });
      assert.ok(copyMetrics.fontSize >= 14 && copyMetrics.lineHeight >= 20 && copyMetrics.height > 0, "Analytics consent copy is not readable");
      await prompt.getByRole("button", { name: "No thanks" }).click();
      assert.equal(await page.evaluate(() => window.wpbAnalyticsDestination), "local-only", "Declined analytics did not remain local-only");
    }
    assert.equal(analyticsState.requestUrls.length, 0, "Analytics network request escaped the browser block");
    return { destination: mode, prompt: promptState, blockedRequests: analyticsState.requestUrls.length };
  });
}

async function runBrowser(browserName, launcher, expected, canonicalProjects, results) {
  let browser;
  try {
    browser = await launcher.launch();
  } catch (error) {
    results.push({ browser: browserName, status: "failed", name: "browser launch", error: error instanceof Error ? error.message : String(error) });
    return;
  }

  const routeState = { done: false };
  for (const width of viewports) {
    const leadState = { status: 503, statuses: [] };
    const analyticsState = { requestUrls: [] };
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      try {
        localStorage.removeItem("wpbAnalyticsConsentV1");
        sessionStorage.removeItem("wpbCompareShortlist");
      } catch {
        // Storage is advisory in this isolated QA context.
      }
      window.turnstile = window.turnstile || {
        render(_slot, options) {
          options.callback("qa-browser-token");
          return "qa-browser-widget";
        },
        reset() {},
      };
    });
    await context.route("**/api/leads", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      leadState.statuses.push(leadState.status);
      const responseBody = leadState.status === 200
        ? { ok: true, leadId: "qa-intercepted" }
        : { ok: false, code: "qa_intercepted_503", message: "We could not securely save your request. Please try again." };
      await route.fulfill({
        status: leadState.status,
        contentType: "application/json",
        body: JSON.stringify(responseBody),
      });
    });
    await context.route(/google-analytics|googletagmanager|analytics\.google\.com|www\.googletagmanager\.com/i, async (route) => {
      analyticsState.requestUrls.push(route.request().url());
      await route.abort();
    });
    const page = await context.newPage();
    const scope = { browser: browserName, width };
    page.on("request", (request) => {
      if (/google-analytics|googletagmanager|analytics\.google\.com|www\.googletagmanager\.com/i.test(request.url())) {
        analyticsState.requestUrls.push(request.url());
      }
    });

    try {
      await checkHomepage(page, expected, canonicalProjects, results, scope, routeState);
      await checkGallery(page, results, scope);
      await checkFloorplanViewer(page, results, scope);
      await checkCompare(page, results, scope, width);
      await checkInquiryConsent(page, results, scope);
      await checkInterceptedLeads(page, results, scope, leadState);
      await checkFloorplanInquiryContext(page, results, scope, leadState);
      await checkAnalyticsConsent(page, results, scope, analyticsState);
    } finally {
      await context.close();
    }
  }
  await browser.close();
}

async function main() {
  assertLocalPreview();
  const expected = (await sourcePublishedNews()).slice(0, 3);
  const canonicalProjects = await sourceCanonicalProjects();
  const testedSha = currentGitSha();
  assert.equal(expected.length, 3, "Source must contain at least three published updates");
  const results = [];
  for (const [browserName, launcher] of browserLaunchers) {
    await runBrowser(browserName, launcher, expected, canonicalProjects, results);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const failed = results.filter((result) => result.status === "failed");
  const report = {
    generatedAt: new Date().toISOString(),
    configuredModel,
    origin,
    testedSha,
    devOriginAllowed: allowDevOrigin,
    browsers: browserLaunchers.map(([name]) => name),
    viewports,
    expectedHomepageNews: expected.map((item) => ({
      id: item.id,
      title: item.title,
      publishedAt: item.publishedAt,
      sourcePublishedDate: item.sourcePublishedDate || item.sourcePublishedAt,
    })),
    limits: [
      "Lead POSTs are intercepted in Playwright; no external lead is sent.",
      "Analytics collection and tag-manager requests are aborted in Playwright; this is not a production transport or conversion measurement.",
      "This script checks rendered behavior and source contracts; it does not run a build.",
    ],
    summary: {
      total: results.length,
      passed: results.filter((result) => result.status === "passed").length,
      failed: failed.length,
    },
    results,
  };
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, ...report.summary, configuredModel }, null, 2));
  if (failed.length) process.exitCode = 1;
}

main().catch(async (error) => {
  const report = {
    generatedAt: new Date().toISOString(),
    configuredModel,
    origin,
    testedSha: currentGitSha(),
    fatalError: error instanceof Error ? error.message : String(error),
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.error(error);
  process.exitCode = 1;
});
