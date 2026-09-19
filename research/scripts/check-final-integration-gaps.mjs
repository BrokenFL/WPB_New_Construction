#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";
import { createHomepageNewsPresenter, fixture } from "./homepage-news-presenter.mjs";

const origin = process.env.V2_ORIGIN?.trim() || "http://127.0.0.1:5188";
const allowDevOrigin = process.env.V2_ALLOW_DEV === "1" || process.env.V2_DEV === "1";
const parsedOrigin = new URL(origin);
assert.equal(parsedOrigin.protocol, "http:", "Final integration gap check requires local HTTP");
assert.ok(["127.0.0.1", "localhost"].includes(parsedOrigin.hostname), "Final integration gap check requires a local origin");
if (!allowDevOrigin) {
  assert.equal(parsedOrigin.hostname, "127.0.0.1", "Built-preview gap check requires 127.0.0.1");
  assert.equal(parsedOrigin.port, "5188", "Built-preview gap check requires port 5188");
}

const workspace = process.cwd();
const outputPath = path.join(workspace, "output/playwright/final-integration/alba-gaps.json");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
const viewports = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 812 },
];
const browserLaunchers = [
  ["chromium", chromium],
  ["webkit", webkit],
];
const browsers = process.env.V2_BROWSER
  ? browserLaunchers.filter(([name]) => name === process.env.V2_BROWSER)
  : browserLaunchers;
const results = [];

function absolute(route) {
  return new URL(route, `${origin}/`).href;
}

async function dismissOverlays(page) {
  const consent = page.locator("#wpb-analytics-consent:visible").getByRole("button", { name: "No thanks", exact: true });
  if (await consent.count()) await consent.click();
  const dismiss = page.locator('[data-lead-modal]:not([hidden]) [data-lead-modal-dismiss]:visible').first();
  if (await dismiss.count()) await dismiss.click();
}

async function visit(page, route) {
  const response = await page.goto(absolute(route), { waitUntil: "domcontentloaded" });
  assert.ok(response, `${route}: no response`);
  assert.ok(response.status() < 400, `${route}: HTTP ${response.status()}`);
  await page.locator(".site-shell").waitFor({ state: "attached", timeout: 15000 });
  await page.waitForFunction(() => [...document.querySelectorAll("[data-route-view]")].some((element) => !element.hasAttribute("hidden")), undefined, { timeout: 15000 });
  await page.waitForTimeout(280);
  await dismissOverlays(page);
}

async function activeProjectSnapshot(page) {
  const project = page.locator('[data-route-view="project"]:not([hidden])').first();
  await project.waitFor({ state: "visible", timeout: 15000 });
  return project.evaluate((element) => {
    const text = (node) => node?.textContent?.replace(/\s+/g, " ").trim() || "";
    const statusTag = [...element.querySelectorAll(".berkeley-hero-tags article")]
      .find((article) => text(article.querySelector("span")) === "Status");
    const statusFact = [...element.querySelectorAll(".berkeley-fact-strip article, .project-entity-brief .profile-card")]
      .find((article) => text(article.querySelector("span")) === "Status");
    const schemas = [...element.ownerDocument.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => script.textContent || "");
    return {
      routeView: element.getAttribute("data-project-page-type"),
      heroStatus: text(statusTag?.querySelector("strong")),
      factStatus: text(statusFact?.querySelector("strong")),
      visibleText: text(element),
      rawJsonLdContainsStatusField: schemas.some((schema) => /"status"\s*:/.test(schema) && /Alba Palm Beach/i.test(schema)),
    };
  });
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
      .slice(0, 8)
      .map(({ element, rect }) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: typeof element.className === "string" ? element.className : "",
        text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
        left: Math.round(rect.left * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
      })),
    uncontainedOffenders: [...document.querySelectorAll("*")]
      .filter((element) => element !== document.documentElement && element !== document.body)
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ element, rect }) => {
        if (rect.width <= 0 || (rect.right <= window.innerWidth + 1 && rect.left >= -1)) return false;
        let ancestor = element.parentElement;
        while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
          const style = getComputedStyle(ancestor);
          if (["hidden", "clip", "scroll", "auto"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflow)) return false;
          ancestor = ancestor.parentElement;
        }
        return true;
      })
      .sort((a, b) => (b.rect.right - window.innerWidth) - (a.rect.right - window.innerWidth))
      .slice(0, 8)
      .map(({ element, rect }) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id,
        className: typeof element.className === "string" ? element.className : "",
        text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
        left: Math.round(rect.left * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
      })),
  }));
  const diagnostic = dimensions.offenders.length ? ` offenders=${JSON.stringify(dimensions.offenders)} uncontained=${JSON.stringify(dimensions.uncontainedOffenders)}` : "";
  assert.ok(dimensions.documentWidth <= dimensions.viewport + 1, `${label}: document overflow ${dimensions.documentWidth} > ${dimensions.viewport}${diagnostic}`);
  assert.ok(dimensions.bodyWidth <= dimensions.viewport + 1 || dimensions.uncontainedOffenders.length === 0, `${label}: body overflow ${dimensions.bodyWidth} > ${dimensions.viewport}${diagnostic}`);
  return dimensions;
}

async function applyTextStress(page, scale) {
  return page.evaluate((fontScale) => {
    const activeRoot = document.querySelector('.route-view:not([hidden])') || document;
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const measure = () => {
      const hero = document.querySelector(".home-hero h1");
      const body = document.querySelector(".home-hero .hero-copy");
      const nav = document.querySelector(".site-nav nav a");
      const ctas = [...document.querySelectorAll(".home-hero [data-hero-cta]")].map((element) => element.getBoundingClientRect().toJSON());
      const caption = document.querySelector(".home-hero-caption")?.getBoundingClientRect().toJSON() ?? null;
      const navContainer = document.querySelector(".site-nav nav");
      const navBounds = navContainer?.getBoundingClientRect().toJSON() ?? null;
      const navLinks = [...(navContainer?.querySelectorAll("a") ?? [])].map((element) => ({
        text: element.textContent?.replace(/\s+/g, " ").trim() || "",
        rect: element.getBoundingClientRect().toJSON(),
      }));
      const navOverlaps = [];
      for (let index = 0; index < navLinks.length; index += 1) {
        for (let next = index + 1; next < navLinks.length; next += 1) {
          const first = navLinks[index].rect;
          const second = navLinks[next].rect;
          const horizontal = Math.min(first.right, second.right) - Math.max(first.left, second.left);
          const vertical = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
          if (horizontal > 1 && vertical > 1) navOverlaps.push([navLinks[index].text, navLinks[next].text]);
        }
      }
      const brandContainer = document.querySelector(".site-nav .brand");
      const brandBounds = brandContainer?.getBoundingClientRect().toJSON() ?? null;
      const brandText = [...(brandContainer?.querySelectorAll(".brand-copy, .brand-copy small") ?? [])].map((element) => ({
        text: element.textContent?.replace(/\s+/g, " ").trim() || "",
        rect: element.getBoundingClientRect().toJSON(),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));
      return {
        heroFontSize: hero ? parseFloat(getComputedStyle(hero).fontSize) : 0,
        bodyFontSize: body ? parseFloat(getComputedStyle(body).fontSize) : 0,
        navFontSize: nav ? parseFloat(getComputedStyle(nav).fontSize) : 0,
        hero: hero?.getBoundingClientRect().toJSON() ?? null,
        body: body?.getBoundingClientRect().toJSON() ?? null,
        nav: nav?.getBoundingClientRect().toJSON() ?? null,
        ctas,
        caption,
        navBounds,
        navLinks,
        navOverlaps,
        navScrollWidth: navContainer?.scrollWidth ?? 0,
        navClientWidth: navContainer?.clientWidth ?? 0,
        brandBounds,
        brandText,
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      };
    };
    const before = measure();
    const selectors = "h1,h2,h3,h4,p,a,button,label,span,time";
    const nav = document.querySelector(".site-nav");
    const nodes = [...new Set([
      ...activeRoot.querySelectorAll(selectors),
      ...(nav ? nav.querySelectorAll(selectors) : []),
    ])].filter(visible);
    const snapshots = nodes.map((element, index) => {
      const computed = getComputedStyle(element);
      const fontSize = parseFloat(computed.fontSize);
      const lineHeight = parseFloat(computed.lineHeight);
      if (!Number.isFinite(fontSize) || fontSize <= 0) return null;
      return {
        element,
        index,
        fontSize,
        lineHeight: Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.2,
        originalFontSize: element.style.fontSize,
        originalLineHeight: element.style.lineHeight,
        originalFontSizePriority: element.style.getPropertyPriority("font-size"),
        originalLineHeightPriority: element.style.getPropertyPriority("line-height"),
      };
    }).filter(Boolean);
    snapshots.forEach((snapshot) => {
      const { element, index, fontSize, lineHeight, originalFontSize, originalLineHeight, originalFontSizePriority, originalLineHeightPriority } = snapshot;
      element.dataset.finalTextStress = String(index);
      element.dataset.finalTextStressOriginalFontSize = originalFontSize;
      element.dataset.finalTextStressOriginalLineHeight = originalLineHeight;
      element.dataset.finalTextStressOriginalFontSizePriority = originalFontSizePriority;
      element.dataset.finalTextStressOriginalLineHeightPriority = originalLineHeightPriority;
      element.style.setProperty("font-size", `${fontSize * fontScale}px`, "important");
      element.style.setProperty("line-height", `${lineHeight * fontScale}px`, "important");
    });
    const after = measure();
    const exactFontScale = snapshots.every((snapshot) => {
      const actual = parseFloat(getComputedStyle(snapshot.element).fontSize);
      return Math.abs(actual - snapshot.fontSize * fontScale) < 0.01;
    });
    const exactLineHeightScale = snapshots.every((snapshot) => {
      const actual = parseFloat(getComputedStyle(snapshot.element).lineHeight);
      return Math.abs(actual - snapshot.lineHeight * fontScale) < 0.01;
    });
    return {
      before,
      after,
      changedCount: snapshots.length,
      exactFontScale,
      exactLineHeightScale,
      changed: snapshots.slice(0, 12).map(({ index, fontSize, lineHeight }) => ({
        index,
        fontSize,
        lineHeight,
        enlargedFontSize: fontSize * fontScale,
        enlargedLineHeight: lineHeight * fontScale,
      })),
    };
  }, scale);
}

async function clearTextStress(page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-final-text-stress]").forEach((element) => {
      element.style.fontSize = element.dataset.finalTextStressOriginalFontSize || "";
      element.style.lineHeight = element.dataset.finalTextStressOriginalLineHeight || "";
      if (element.dataset.finalTextStressOriginalFontSize) {
        element.style.setProperty("font-size", element.dataset.finalTextStressOriginalFontSize, element.dataset.finalTextStressOriginalFontSizePriority || "");
      } else {
        element.style.removeProperty("font-size");
      }
      if (element.dataset.finalTextStressOriginalLineHeight) {
        element.style.setProperty("line-height", element.dataset.finalTextStressOriginalLineHeight, element.dataset.finalTextStressOriginalLineHeightPriority || "");
      } else {
        element.style.removeProperty("line-height");
      }
      delete element.dataset.finalTextStress;
      delete element.dataset.finalTextStressOriginalFontSize;
      delete element.dataset.finalTextStressOriginalLineHeight;
      delete element.dataset.finalTextStressOriginalFontSizePriority;
      delete element.dataset.finalTextStressOriginalLineHeightPriority;
    });
  });
}

async function record(browserName, width, name, callback) {
  const startedAt = Date.now();
  try {
    const details = await callback();
    results.push({ browser: browserName, width, name, status: "pass", durationMs: Date.now() - startedAt, details: details ?? {} });
  } catch (error) {
    results.push({ browser: browserName, width, name, status: "fail", durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
  }
}

for (const [browserName, launcher] of browsers) {
  const browser = await launcher.launch();
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const leadPayloads = [];
      let leadAttempts = 0;
      await context.route("**/*", async (route) => {
        const requestUrl = new URL(route.request().url());
        if (requestUrl.pathname === "/api/leads") {
          leadAttempts += 1;
          try { leadPayloads.push(route.request().postDataJSON()); } catch { leadPayloads.push({}); }
          if (leadAttempts === 1) {
            await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, message: "intercepted" }) });
          } else {
            await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, leadId: "intercepted-project-retry" }) });
          }
          return;
        }
        if (requestUrl.origin !== parsedOrigin.origin) {
          await route.abort();
          return;
        }
        await route.continue();
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await record(browserName, viewport.width, "Alba direct route uses canonical status", async () => {
        await visit(page, "/projects/alba-palm-beach/");
        const snapshot = await activeProjectSnapshot(page);
        assert.equal(snapshot.heroStatus, "Completed");
        assert.doesNotMatch(snapshot.visibleText, /Under Construction/);
        assert.equal(snapshot.rawJsonLdContainsStatusField, false, "JSON-LD status omission is the existing safety boundary");
        return snapshot;
      });

      await record(browserName, viewport.width, "Alba reload retains canonical hero status", async () => {
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(180);
        const snapshot = await activeProjectSnapshot(page);
        assert.equal(snapshot.heroStatus, "Completed");
        return snapshot;
      });

      await record(browserName, viewport.width, "Alba directory card and SPA/back continuity", async () => {
        await visit(page, "/buildings/");
        const albaLink = page.locator('a[href="/projects/alba-palm-beach/"]:visible').first();
        assert.ok(await albaLink.count(), "Alba directory link is missing");
        const directoryText = await albaLink.locator("xpath=ancestor::article[1]").innerText().catch(() => albaLink.innerText());
        assert.match(directoryText, /Completed/i);
        await albaLink.click();
        const spaSnapshot = await activeProjectSnapshot(page);
        assert.equal(spaSnapshot.heroStatus, "Completed");
        await page.goBack({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(180);
        const backLink = page.locator('a[href="/projects/alba-palm-beach/"]:visible').first();
        const backText = await backLink.locator("xpath=ancestor::article[1]").innerText().catch(() => backLink.innerText());
        assert.match(backText, /Completed/i);
        return { directoryText, spaStatus: spaSnapshot.heroStatus, backText };
      });

      await record(browserName, viewport.width, "Alba compare selection keeps Completed status", async () => {
        await visit(page, "/compare/");
        const selects = page.locator("[data-compare-route-select]");
        await selects.nth(0).selectOption("alba-palm-beach");
        await selects.nth(1).selectOption("olara");
        const result = page.locator("[data-compare-results]");
        await result.waitFor({ state: "visible" });
        const text = await result.innerText();
        assert.match(text, /Alba Palm Beach/);
        assert.match(text, /Completed/);
        const albaCard = result.locator(".compare-route-card").filter({ hasText: "Alba Palm Beach" }).first();
        assert.match(await albaCard.innerText(), /COMPLETED/i);
        assert.doesNotMatch(await albaCard.innerText(), /Under Construction/i);
        return { selected: await selects.nth(0).inputValue(), albaCard: (await albaCard.innerText()).slice(0, 500) };
      });

      await record(browserName, viewport.width, "project inquiry keeps truthful intent and intercepted context", async () => {
        await visit(page, "/projects/alba-palm-beach/");
        const form = page.locator('form[data-lead-form="project_inquiry"]:visible').first();
        await form.scrollIntoViewIfNeeded();
        assert.equal(await form.locator("h2").innerText(), "Request current resale availability");
        assert.match(await form.locator("button[type=submit]").innerText(), /^Send inquiry$/i);
        assert.equal(await form.getAttribute("data-lead-cta-label"), "Send inquiry");
        assert.equal(await form.locator('[name="interest"]').inputValue(), "Request current resale availability");
        await form.locator('[name="name"]').fill("V2 intercepted project QA");
        await form.locator('[name="email"]').fill("project-qa@example.invalid");
        await form.locator('[name="consent"]').check();
        await form.locator('[name="turnstile_token"]').evaluate((element) => { element.value = "INTERCEPTED_V2_TOKEN"; });
        const response = page.waitForResponse((candidate) => candidate.url().endsWith("/api/leads"));
        await form.locator("button[type=submit]").click();
        await response;
        await page.waitForTimeout(180);
        assert.match(await form.locator(".form-status").innerText(), /try again|unavailable|intercepted/i);
        assert.equal(leadAttempts, 1);
        const retryResponse = page.waitForResponse((candidate) => candidate.url().endsWith("/api/leads"));
        await form.locator("button[type=submit]").click();
        await retryResponse;
        await page.waitForTimeout(180);
        assert.match(await form.locator(".form-status").innerText(), /Thanks.*request was received/i);
        assert.equal(await form.locator('[name="interest"]').inputValue(), "Request current resale availability");
        assert.equal(await form.locator('[name="project"]').inputValue(), "alba-palm-beach");
        assert.equal(await form.getAttribute("data-lead-cta-label"), "Send inquiry");
        assert.equal(await form.locator('[name="consent"]').isChecked(), false, "Successful receipt resets consent for a future submission");
        assert.equal(await form.getAttribute("data-submitting"), "false");
        assert.equal(leadAttempts, 2);
        assert.ok(leadPayloads.every((payload) => payload.project === "alba-palm-beach" && payload.interest === "Request current resale availability"));
        return { formLabel: await form.getAttribute("data-lead-cta-label"), interest: await form.locator('[name="interest"]').inputValue(), attempts: leadAttempts, receipt: "intercepted-project-retry", realLeadsSent: 0 };
      });

      await record(browserName, viewport.width, "article direct/reload/back navigation", async () => {
        await visit(page, "/updates/");
        const articleLink = page.locator('a[href^="/updates/"]:not([href="/updates/"]):visible').first();
        assert.ok(await articleLink.count(), "No article link found on Updates");
        const articleHref = await articleLink.getAttribute("href");
        await articleLink.click();
        await page.locator('[data-route-view="news-detail"]:not([hidden])').waitFor({ state: "visible", timeout: 15000 });
        const firstTitle = await page.locator('[data-route-view="news-detail"]:not([hidden]) h1').innerText();
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(180);
        const reloadTitle = await page.locator('[data-route-view="news-detail"]:not([hidden]) h1').innerText();
        assert.equal(reloadTitle, firstTitle);
        await page.goBack({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(180);
        assert.ok(await page.locator('[data-route-view="updates"]:not([hidden]), [data-route-view="news"]:not([hidden])').count());
        return { articleHref, title: firstTitle };
      });

      await record(browserName, viewport.width, "isolated long-title/no-image Desk fixture layout", async () => {
        await visit(page, "/");
        const presenter = createHomepageNewsPresenter();
        const longTitle = "A future West Palm Beach development headline that stays available in full for buyers reviewing the next phase";
        const fixtureHtml = presenter.render([fixture({ id: "long-title", slug: "long-title", title: longTitle, imagePath: undefined })])
          .replace('id="latest-developments"', 'id="latest-developments-fixture"');
        await page.evaluate((html) => {
          const host = document.querySelector('[data-route-view="home"]:not([hidden])') || document.body;
          const wrapper = document.createElement("div");
          wrapper.dataset.finalFixtureDesk = "true";
          wrapper.innerHTML = html;
          host.append(wrapper);
        }, fixtureHtml);
        const fixtureRoot = page.locator('[data-final-fixture-desk="true"] .v2-development-desk');
        const titleLink = fixtureRoot.locator("h3 a");
        await titleLink.scrollIntoViewIfNeeded();
        assert.equal(await fixtureRoot.locator(".v2-desk-story").count(), 1);
        assert.equal(await fixtureRoot.locator(".v2-desk-visual").count(), 0);
        assert.equal(await titleLink.innerText(), longTitle);
        const box = await titleLink.boundingBox();
        assert.ok(box && box.width > 0 && box.height > 0, "Fixture title link is not rendered");
        const dimensions = await assertNoOverflow(page, `${browserName}-${viewport.width}-fixture-desk`);
        await page.screenshot({ path: path.join(workspace, `output/playwright/final-integration/fixture-desk-${browserName}-${viewport.width}.png`), fullPage: false });
        return { dimensions, titleWidth: box.width, titleHeight: box.height, mediaCount: await fixtureRoot.locator(".v2-desk-visual").count() };
      });

      await record(browserName, viewport.width, "static responsive hero has one real image and no stale slide list", async () => {
        await visit(page, "/");
        const hero = page.locator(".home-hero");
        const activeImages = hero.locator('img[data-home-hero-layer="active"]');
        assert.equal(await activeImages.count(), 1);
        assert.equal(await hero.locator('[data-home-hero-layer="next"]').count(), 0);
        assert.equal(await hero.locator(".sr-only").count(), 0);
        const image = activeImages.first();
        assert.equal(await image.getAttribute("loading"), "eager");
        assert.equal(await image.getAttribute("fetchpriority"), "high");
        await image.evaluate((element) => element.complete && element.naturalWidth > 0 || (() => { throw new Error("hero image has no natural dimensions"); })());
        const responsive = await image.evaluate((element) => ({ src: element.currentSrc || element.src, srcset: element.getAttribute("srcset"), width: element.naturalWidth, height: element.naturalHeight }));
        assert.ok(responsive.srcset || responsive.src, "Hero has no responsive source");
        return responsive;
      });

      await record(browserName, viewport.width, "reduced-motion and simulated 200 percent text reflow", async () => {
        await visit(page, "/");
        const before = await assertNoOverflow(page, `${browserName}-${viewport.width}-baseline`);
        const reflow = await applyTextStress(page, 2);
        try {
          await page.waitForTimeout(120);
          const after = await assertNoOverflow(page, `${browserName}-${viewport.width}-text-200`);
          assert.ok(reflow.changedCount > 0, "No visible text/control nodes were enlarged");
          assert.equal(reflow.exactFontScale, true, "Text stress did not apply an exact 200 percent font-size scale from the baseline snapshot");
          assert.equal(reflow.exactLineHeightScale, true, "Text stress did not apply an exact 200 percent line-height scale from the baseline snapshot");
          assert.ok(reflow.before.heroFontSize > 0 && reflow.before.bodyFontSize > 0 && reflow.before.navFontSize > 0, "Text stress baseline selectors did not resolve to visible typography");
          assert.ok(Math.abs(reflow.after.heroFontSize - reflow.before.heroFontSize * 2) < 0.01, "Hero text did not enlarge to exactly 200 percent");
          assert.ok(Math.abs(reflow.after.bodyFontSize - reflow.before.bodyFontSize * 2) < 0.01, "Body text did not enlarge to exactly 200 percent");
          assert.ok(Math.abs(reflow.after.navFontSize - reflow.before.navFontSize * 2) < 0.01, "Navigation text did not enlarge to exactly 200 percent");
          assert.ok(reflow.after.navBounds && reflow.after.navLinks.every(({ rect }) => rect.left >= reflow.after.navBounds.left - 1 && rect.right <= reflow.after.navBounds.right + 1), `A navigation label is clipped after text reflow: ${JSON.stringify(reflow.after.navLinks)}`);
          assert.ok(reflow.after.navScrollWidth <= reflow.after.navClientWidth + 1, `Navigation still has horizontal overflow after text reflow: ${reflow.after.navScrollWidth} > ${reflow.after.navClientWidth}`);
          assert.deepEqual(reflow.after.navOverlaps, [], `Navigation labels overlap after text reflow: ${JSON.stringify(reflow.after.navOverlaps)}`);
          assert.ok(reflow.after.brandBounds && reflow.after.brandText.every(({ rect, scrollWidth, clientWidth }) => rect.left >= reflow.after.brandBounds.left - 1 && rect.right <= reflow.after.brandBounds.right + 1 && rect.top >= reflow.after.brandBounds.top - 1 && rect.bottom <= reflow.after.brandBounds.bottom + 1 && scrollWidth <= clientWidth + 1), `Branding text is clipped after text reflow: ${JSON.stringify(reflow.after.brandText)}`);
          assert.ok(reflow.after.ctas.every((cta) => cta.width > 0 && cta.height > 0 && cta.right <= viewport.width + 1), `A hero CTA is clipped after text reflow: ${JSON.stringify(reflow.after.ctas)}`);
          if (reflow.after.ctas.length > 1) {
            const [first, second] = reflow.after.ctas;
            assert.ok(first.right <= second.left + 1 || second.right <= first.left + 1 || first.bottom <= second.top + 1 || second.bottom <= first.top + 1, "Hero CTAs overlap after text reflow");
          }
          if (reflow.after.caption) assert.ok(reflow.after.caption.right <= viewport.width + 1, "Hero caption is clipped after text reflow");
          const transitionDurations = await page.locator(".home-hero-image, .home-hero-caption").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transitionDuration));
          assert.ok(transitionDurations.every((duration) => duration === "0s" || duration === "0ms"), `Reduced-motion transition remains active: ${transitionDurations.join(",")}`);
          if (browserName === "chromium" && (viewport.width === 390 || viewport.width === 320)) {
            await page.screenshot({ path: path.join(workspace, `output/playwright/final-integration/text-stress-${viewport.width}.png`), fullPage: false });
          }
          return { before, after, changedCount: reflow.changedCount, exactFontScale: reflow.exactFontScale, exactLineHeightScale: reflow.exactLineHeightScale, transitionDurations };
        } finally {
          await clearTextStress(page);
        }
      });

      assert.deepEqual(pageErrors, [], `${browserName}-${viewport.width} page errors`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({ origin, generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
const failures = results.filter((result) => result.status === "fail");
console.log(JSON.stringify({ origin, checks: results.length, failures: failures.length, outputPath: path.relative(workspace, outputPath) }, null, 2));
if (failures.length) process.exit(1);
