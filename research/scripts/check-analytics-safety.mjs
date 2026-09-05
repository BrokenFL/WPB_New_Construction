import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { sanitizeAnalyticsEventName, sanitizeAnalyticsPayload } from "../../src/lib/analyticsSafety.ts";

const workspace = process.cwd();
const clean = sanitizeAnalyticsPayload({
  path: "/projects/olara/?email=buyer@example.com#private",
  projectSlug: "olara",
  ctaText: "Compare Olara",
  hasPhone: true,
  name: "Private Buyer",
  email: "buyer@example.com",
  phone: "561-555-0100",
  message: "Call me about my finances",
  sourceUrl: "https://example.com/?email=buyer@example.com",
});

assert.deepEqual(clean, {
  path: "/projects/olara/",
  projectSlug: "olara",
  ctaText: "Compare Olara",
  hasPhone: true,
});
assert.equal(sanitizeAnalyticsPayload({ ctaText: "Email buyer@example.com" }).ctaText, undefined);
assert.equal(sanitizeAnalyticsPayload({ interest: "Call 561-555-0100" }).interest, undefined);
assert.equal(
  sanitizeAnalyticsPayload({ articleId: "sound-apartments-right-of-way-maintenance-2026-07-12" }).articleId,
  "sound-apartments-right-of-way-maintenance-2026-07-12",
);
assert.equal(sanitizeAnalyticsEventName("contact_form_submit"), "contact_form_submit");
assert.equal(sanitizeAnalyticsEventName("invalid event name"), "");

const analyticsSource = await fs.readFile(path.join(workspace, "src/lib/analytics.ts"), "utf8");
const mainSource = await fs.readFile(path.join(workspace, "src/main.ts"), "utf8");
const envExample = await fs.readFile(path.join(workspace, ".env.example"), "utf8");
const deployWorkflow = await fs.readFile(path.join(workspace, ".github/workflows/deploy-cloudflare-pages.yml"), "utf8");

assert.match(analyticsSource, /VITE_GA4_MEASUREMENT_ID/);
assert.match(analyticsSource, /wpbAnalyticsConsentV1/);
assert.match(analyticsSource, /analyticsConsentState\s*!==\s*"granted"/);
assert.match(analyticsSource, /ensureAnalyticsConsentPrompt/);
assert.match(analyticsSource, /Allow analytics/);
assert.match(analyticsSource, /No thanks/);
assert.match(analyticsSource, /analytics_storage:\s*"granted"/);
assert.match(analyticsSource, /analytics_storage:\s*"denied"/);
assert.match(analyticsSource, /ad_storage:\s*"denied"/);
assert.match(analyticsSource, /ad_user_data:\s*"denied"/);
assert.match(analyticsSource, /ad_personalization:\s*"denied"/);
assert.match(analyticsSource, /send_page_view:\s*false/);
assert.match(analyticsSource, /allow_ad_personalization_signals:\s*false/);
assert.match(analyticsSource, /page_location:\s*cleanPageLocation\(\)/);
assert.match(analyticsSource, /page_referrer:\s*cleanReferrerLocation\(\)/);
assert.doesNotMatch(analyticsSource, /G-[A-Z0-9]{8,}/);
assert.match(mainSource, /function analyticsPath\(\)\s*{\s*return window\.location\.pathname;/);
assert.match(mainSource, /article_to_project_click/);
assert.match(mainSource, /floor_plan_click/);
assert.match(mainSource, /phone_click/);
assert.match(mainSource, /email_click/);
assert.match(envExample, /VITE_GA4_MEASUREMENT_ID=/);
assert.match(deployWorkflow, /VITE_GA4_MEASUREMENT_ID:\s*G-0LGBH6MDVX/);

console.log(
  "Analytics safety QA passed: production GA4 is build-configured, consent-gated, query-free, ad-personalization-disabled, and payloads are strict-allowlist sanitized.",
);
