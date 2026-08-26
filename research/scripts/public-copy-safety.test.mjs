import assert from "node:assert/strict";
import test from "node:test";
import { scanArticlePackagePublicCopy, scanPublicFields, scanPublicOutput, sharedBlockedPhraseRules } from "./public-copy-safety.mjs";

test("source-backed public approval language is allowed", () => {
  assert.deepEqual(scanPublicFields({ deck: "The Downtown Action Committee signed off on the plan." }), []);
});

test("internal sign-off language is blocked before publish", () => {
  const findings = scanPublicFields({ deck: "The copy is awaiting final sign-off." });
  assert.equal(findings[0].label, "pending sign-off");
  assert.equal(findings[0].field, "article.deck");
});

test("broad artifact scanning keeps legacy technical files out of the article-package policy", () => {
  const findings = scanPublicOutput("Needs review before launch. Contact info@example.com. This is a placeholder.");
  assert.deepEqual(findings.map((finding) => finding.label).sort(), ["needs_review", "placeholder email", "example domain"].sort());
});

test("generic placeholder copy is blocked before article mutation", () => {
  const findings = scanPublicFields({ body: "The project is no longer a luxury placeholder." });
  assert.equal(findings[0].label, "placeholder");
  assert.equal(findings[0].field, "article.body");
});

test("every shared gatekeeper phrase is rejected from an article package before mutation", () => {
  for (const rule of sharedBlockedPhraseRules) {
    const findings = scanArticlePackagePublicCopy({
      title: `Package fixture containing ${rule.example}`,
      sections: [],
    });
    assert.ok(findings.some((finding) => finding.label === rule.label), `${rule.label} should be blocked`);
  }
});
