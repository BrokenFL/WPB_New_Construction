import assert from "node:assert/strict";
import test from "node:test";
import { scanPublicFields, scanPublicOutput } from "./public-copy-safety.mjs";

test("source-backed public approval language is allowed", () => {
  assert.deepEqual(scanPublicFields({ deck: "The Downtown Action Committee signed off on the plan." }), []);
});

test("internal sign-off language is blocked before publish", () => {
  const findings = scanPublicFields({ deck: "The copy is awaiting final sign-off." });
  assert.equal(findings[0].label, "pending sign-off");
  assert.equal(findings[0].field, "article.deck");
});

test("public output scanning still blocks internal markers and placeholders", () => {
  const findings = scanPublicOutput("Needs review before launch. Contact info@example.com. This is a placeholder.");
  assert.deepEqual(findings.map((finding) => finding.label), ["needs_review", "placeholder email", "example domain", "placeholder"]);
});

test("generic placeholder copy is blocked before article mutation", () => {
  const findings = scanPublicFields({ body: "The project is no longer a luxury placeholder." });
  assert.equal(findings[0].label, "placeholder");
  assert.equal(findings[0].field, "article.body");
});
