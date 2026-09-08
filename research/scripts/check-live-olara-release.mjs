import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const origin = "https://www.wpbnewconstruction.com";
const root = process.cwd();
const artifactDir = path.join(root, ".runtime/live-olara-release");
await fs.mkdir(artifactDir, { recursive: true });

const plans = [
  { slug: "residence-a", planId: "olara-residence-a" },
  { slug: "residence-c", planId: "olara-residence-c" },
  { slug: "residence-d", planId: "olara-residence-d" },
  { slug: "residence-f", planId: "olara-residence-f" },
  { slug: "residence-i", planId: "olara-residence-i" },
  { slug: "residence-l", planId: "olara-residence-l" },
].map((plan) => ({ ...plan, path: `/floorplans/olara/${plan.slug}/`, canonical: `${origin}/floorplans/olara/${plan.slug}/` }));

const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  const request = await browser.newPage();
  const sitemapResponse = await request.request.get(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.ok(), true);
  const sitemap = await sitemapResponse.text();
  for (const plan of plans) assert.equal(sitemap.split(`<loc>${plan.canonical}</loc>`).length - 1, 1, `${plan.slug}: sitemap`);
  assert.equal(sitemap.includes(`${origin}/floorplans/alba-palm-beach/residence-d/`), false, "Alba must remain excluded");
  await request.close();

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const submissions = [];
    const firstTouch = plans[0].canonical;
    let externalAnalytics = 0;
    await context.route("**/*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.hostname === "www.wpbnewconstruction.com" && url.pathname === "/api/leads" && req.method() === "POST") {
        submissions.push(req.postDataJSON());
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, leadId: "live-olara-intercepted" }) });
      }
      if (/googletagmanager|google-analytics/.test(url.hostname)) {
        externalAnalytics += 1;
        return route.fulfill({ status: 204, body: "" });
      }
      if (/challenges\.cloudflare\.com/.test(url.hostname)) return route.fulfill({ status: 204, body: "" });
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    for (const plan of plans) {
      const response = await page.goto(`${origin}${plan.path}`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200, `${plan.slug}: status`);
      await page.locator("[data-floorplan-id]").waitFor();
      await page.waitForFunction(() => window.wpbAnalyticsQueue?.some((event) => event.eventName === "page_view"));
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), plan.canonical);
      assert.ok((await page.title()).toLowerCase().includes(plan.slug.replace("residence-", "residence ")) || (await page.title()).toLowerCase().includes(plan.slug.replace("-", " ")));
      assert.ok((await page.locator('meta[name="description"]').getAttribute("content"))?.length > 40);
      const schema = JSON.parse(await page.locator('#wpb-floorplan-schema').textContent());
      assert.equal(schema["@graph"]?.[0]?.url, plan.canonical);
      assert.equal(await page.locator(".fp-drawing img").evaluate((image) => image.complete && image.naturalWidth > 0), true, `${plan.slug}: image`);
      const pdfHref = await page.locator('a[download][data-fp-action="pdf"]').getAttribute("href");
      assert.ok(pdfHref, `${plan.slug}: pdf href`);
      const pdfResponse = await page.request.get(new URL(pdfHref, origin).href);
      assert.equal(pdfResponse.ok(), true, `${plan.slug}: pdf response`);
      assert.equal((await pdfResponse.body()).subarray(0, 5).toString(), "%PDF-", `${plan.slug}: pdf bytes`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${plan.slug}: overflow`);
      await page.screenshot({ path: path.join(artifactDir, `${plan.slug}-${viewport.width}.png`), fullPage: true });

      await page.locator('a[data-fp-action="availability"][data-fp-placement="intro"]').click();
      await page.waitForURL(`${origin}/inquire/`);
      const form = page.locator(".inquiry-form");
      await form.waitFor({ state: "visible" });
      await page.waitForFunction(() => typeof window.wpbSetAnalyticsConsent === "function");
      assert.equal(await form.locator('[name="project"]').inputValue(), "olara");
      await form.locator('[name="name"]').fill("Live Olara QA Example");
      await form.locator('[name="email"]').fill("live-olara-qa@example.invalid");
      await form.locator('[name="phone"]').fill("202-555-0191");
      await form.locator('[name="message"]').fill("LIVE_OLARA_TEST_DO_NOT_SEND");
      await form.locator('[name="consent"]').check();
      await page.evaluate(() => {
        window.turnstile = {
          render: (_element, options) => { options.callback("LIVE_OLARA_INTERCEPTED_TOKEN"); return "live-olara-qa-widget"; },
          reset: () => {},
        };
      });
      const before = submissions.length;
      const intercepted = page.waitForResponse((res) => res.url() === `${origin}/api/leads` && res.request().method() === "POST", { timeout: 15000 });
      await form.locator('button[type="submit"]').click();
      await intercepted;
      assert.equal(submissions.length, before + 1);
      const payload = submissions.at(-1);
      assert.equal(payload.project, "olara");
      assert.equal(payload.interest, "Request current availability");
      assert.equal(payload.cta_context, `floorplan:olara:${plan.slug}`);
      assert.equal(payload.lead_capture_context, payload.cta_context);
      // First-touch attribution intentionally remains the first Residence viewed
      // in this browser session; exact current-plan attribution must still switch.
      assert.equal(payload.landing_page, firstTouch);
      assert.equal(payload.submission_page, `${origin}/inquire/`);
      const analytics = await page.evaluate(() => JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]));
      assert.doesNotMatch(analytics, /Live Olara QA Example|live-olara-qa@|202-555-0191|LIVE_OLARA_TEST_DO_NOT_SEND|LIVE_OLARA_INTERCEPTED_TOKEN/);
      results.push({ path: plan.path, width: viewport.width, image: "pass", pdf: "pass", canonical: "pass", schema: "pass", interceptedInquiry: "pass", planContext: payload.cta_context, firstTouchPreserved: payload.landing_page });
    }

    for (const discoveryPath of ["/floorplans/", "/projects/olara/"]) {
      await page.goto(`${origin}${discoveryPath}`, { waitUntil: "networkidle" });
      for (const plan of plans) assert.equal(await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).count() > 0, true, `${discoveryPath}: ${plan.slug}`);
    }
    assert.equal(errors.length, 0, errors.join("\n"));
    assert.equal(externalAnalytics, 0, "Fresh live verification must not transmit analytics without consent");
    await context.close();
  }

  const alba = await fetch(`${origin}/floorplans/alba-palm-beach/residence-d/`, { redirect: "manual" });
  assert.equal(alba.status, 404, "Alba HTML must remain unpublished");
} finally {
  await browser.close();
}

const output = {
  verifiedAt: new Date().toISOString(),
  productionOrigin: origin,
  plans: plans.length,
  viewResults: results.length,
  results,
  limitations: ["All inquiry POSTs were intercepted in-browser; no real lead was sent.", "Turnstile was replaced only inside the intercepted test browser; CAPTCHA server verification was not tested.", "This audit does not certify inbox, CRM, GA4 transport, or measured growth."],
};
await fs.writeFile(path.join(artifactDir, "results.json"), JSON.stringify(output, null, 2));
console.log(JSON.stringify({ liveOlaraRelease: "pass", plans: plans.length, views: results.length }, null, 2));
