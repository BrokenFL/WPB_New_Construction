import assert from "node:assert/strict";
import test from "node:test";
import { resolveProjectField, reviewedProjectFactOverride, canonicalProjectRecord } from "../../src/lib/projectFieldAccessors.ts";
import { projectFactOverrides } from "../../src/data/projectFactOverrides.ts";
import { getSchemaSafeProjectFacts } from "../../src/lib/projectIntelligence.ts";

const TEST_SLUG = "__propagation-test-slug__";
const MARKER = "REVIEWED-PROP-TEST-7f3a9c";

function withOverrideEntry(slug, field, entry, fn) {
  const projects = projectFactOverrides.projects;
  const priorProject = projects[slug];
  const priorField = priorProject?.[field];
  projects[slug] = { ...(priorProject ?? {}), [field]: entry };
  try {
    fn();
  } finally {
    if (priorProject === undefined) delete projects[slug];
    else projects[slug] = priorField === undefined
      ? Object.fromEntries(Object.entries(priorProject).filter(([key]) => key !== field))
      : { ...priorProject, [field]: priorField };
  }
}

const reviewedEntry = (value, extra = {}) => ({
  value,
  source: "manual_review",
  preferredFrom: "custom",
  reviewedBy: "Brooke",
  reviewedAt: "2026-09-10T00:00:00.000Z",
  note: "",
  schemaSafe: false,
  ...extra,
});

test("precedence: explicit reviewedOverride param wins over everything", () => {
  const resolved = resolveProjectField({
    identifier: "olara",
    field: "status",
    reviewedOverride: "  Explicit Winner  ",
    structuredValue: "Structured",
    approvedFallback: "Fallback",
  });
  assert.equal(resolved.value, "Explicit Winner");
  assert.equal(resolved.source, "reviewed_override");
});

test("precedence: structured/model value wins over approvedFallback; missing when nothing resolves", () => {
  const structured = resolveProjectField({ identifier: "olara", field: "status", structuredValue: "Structured", approvedFallback: "Fallback" });
  assert.equal(structured.value, "Structured");
  assert.equal(structured.source, "structured_source");
  const fallback = resolveProjectField({ identifier: "__no-such-project__", field: "status", approvedFallback: "Fallback" });
  assert.equal(fallback.value, "Fallback");
  assert.equal(fallback.source, "approved_fallback");
  const missing = resolveProjectField({ identifier: "__no-such-project__", field: "status" });
  assert.equal(missing.value, "");
  assert.equal(missing.source, "missing");
});

test("reviewed override in project-fact-overrides.json propagates through resolveProjectField", () => {
  withOverrideEntry(TEST_SLUG, "status", reviewedEntry(MARKER), () => {
    const resolved = resolveProjectField({ identifier: TEST_SLUG, field: "status", structuredValue: "Structured", approvedFallback: "Fallback" });
    assert.equal(resolved.value, MARKER);
    assert.equal(resolved.source, "reviewed_override");
    assert.equal(reviewedProjectFactOverride(TEST_SLUG, "status"), MARKER);
  });
});

test("reviewed override beats structured source and approved fallback on a real project", () => {
  const slug = "olara";
  const modelValue = canonicalProjectRecord(slug)?.status;
  withOverrideEntry(slug, "status", reviewedEntry(MARKER), () => {
    const resolved = resolveProjectField({ identifier: slug, field: "status" });
    assert.equal(resolved.value, MARKER);
    assert.equal(resolved.source, "reviewed_override");
    assert.notEqual(resolved.value, modelValue);
  });
  const restored = resolveProjectField({ identifier: slug, field: "status" });
  assert.equal(restored.value, modelValue);
  assert.equal(restored.source, "structured_source");
});

test("fail-closed: non-manual_review source is rejected", () => {
  withOverrideEntry(TEST_SLUG, "status", reviewedEntry(MARKER, { source: "automated" }), () => {
    assert.equal(reviewedProjectFactOverride(TEST_SLUG, "status"), "");
    assert.equal(resolveProjectField({ identifier: TEST_SLUG, field: "status" }).source, "missing");
  });
});

test("fail-closed: missing reviewedBy or reviewedAt is rejected", () => {
  for (const patch of [{ reviewedBy: "" }, { reviewedAt: "" }, { reviewedBy: "  " }, { reviewedAt: undefined }]) {
    withOverrideEntry(TEST_SLUG, "status", reviewedEntry(MARKER, patch), () => {
      assert.equal(reviewedProjectFactOverride(TEST_SLUG, "status"), "");
    });
  }
});

test("fail-closed: empty override value is rejected", () => {
  withOverrideEntry(TEST_SLUG, "status", reviewedEntry("   "), () => {
    assert.equal(reviewedProjectFactOverride(TEST_SLUG, "status"), "");
  });
});

test("unmapped field displayName never reads fact overrides", () => {
  withOverrideEntry(TEST_SLUG, "status", reviewedEntry(MARKER), () => {
    assert.equal(reviewedProjectFactOverride(TEST_SLUG, "displayName"), "");
  });
});

test("identifier aliases resolve to the canonical slug for override lookup", () => {
  const record = canonicalProjectRecord("olara");
  assert.ok(record, "olara must exist in the public model");
  const alias = record.lookupAliases[0];
  if (!alias) return;
  withOverrideEntry(record.publicSlug, "status", reviewedEntry(MARKER), () => {
    assert.equal(reviewedProjectFactOverride(alias, "status"), MARKER);
    assert.equal(reviewedProjectFactOverride(`/projects/${record.publicSlug}/`, "status"), MARKER);
  });
});

test("visible/schema consistency: schemaSafe override emits the same value on both surfaces", () => {
  withOverrideEntry(TEST_SLUG, "status", reviewedEntry(MARKER, { schemaSafe: true }), () => {
    const visible = resolveProjectField({ identifier: TEST_SLUG, field: "status" });
    const schema = getSchemaSafeProjectFacts(TEST_SLUG);
    assert.equal(visible.value, MARKER);
    // Unknown slugs have no registry entry, so schema falls back to identity-only output.
    // Consistency is asserted on a real project below.
    assert.equal(schema.identity.slug, TEST_SLUG);
  });
  const slug = "alba-palm-beach";
  const override = projectFactOverrides.projects[slug]?.status;
  if (override?.source === "manual_review" && override.schemaSafe) {
    const visible = resolveProjectField({ identifier: slug, field: "status" });
    const schema = getSchemaSafeProjectFacts(slug);
    assert.equal(visible.value, override.value);
    assert.equal(schema.safeFields.status, override.value);
  }
});

test("schemaSafe:false override stays out of schema but still shows on the page", () => {
  withOverrideEntry(TEST_SLUG, "status", reviewedEntry(MARKER, { schemaSafe: false }), () => {
    assert.equal(resolveProjectField({ identifier: TEST_SLUG, field: "status" }).value, MARKER);
  });
  const slug = "alba-palm-beach";
  const override = projectFactOverrides.projects[slug]?.address;
  if (override?.source === "manual_review" && override.schemaSafe === false) {
    const visible = resolveProjectField({ identifier: slug, field: "address" });
    const schema = getSchemaSafeProjectFacts(slug);
    assert.equal(visible.value, override.value);
    assert.notEqual(schema.safeFields.address, override.value);
  }
});
