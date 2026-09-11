import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveProjectField,
  resolvePublicFactDisplay,
  reviewedProjectFactOverride,
  canonicalProjectRecord,
} from "../../src/lib/projectFieldAccessors.ts";
import { projectFactOverrides } from "../../src/data/projectFactOverrides.ts";
import { getSchemaSafeProjectFacts } from "../../src/lib/projectIntelligence.ts";
import {
  buildReviewedFieldsProjection,
  qualifyReviewedOverrideValue,
  REVIEWED_FACT_FIELD_MAP,
} from "./reviewed-field-projection.mjs";

const MARKER = "PUBLIC-REVIEWED-VALUE-7f3a9c";
const PRIVATE_NOTE = "PRIVATE-OVERRIDE-NOTE-MUST-NOT-SHIP-7f3a9c";
const PRIVATE_REVIEWER = "PRIVATE-REVIEWER-MUST-NOT-SHIP-7f3a9c";
const PRIVATE_PREFERRED = "PRIVATE-PREFERRED-FROM-MUST-NOT-SHIP-7f3a9c";
const REAL_SLUG = "olara";
const OTHER_SLUG = "alba-palm-beach";

const reviewedEntry = (value, extra = {}) => ({
  value,
  source: "manual_review",
  preferredFrom: "custom",
  reviewedBy: "fixture-reviewer",
  reviewedAt: "2026-09-10T00:00:00.000Z",
  note: "",
  schemaSafe: false,
  ...extra,
});

// Injects a sanitized reviewedFields value onto a generated public-model record
// for the duration of fn, then restores. Deterministic: does not depend on the
// committed or working-tree override file contents.
function withReviewedField(slug, field, value, fn) {
  const record = canonicalProjectRecord(slug);
  assert.ok(record, `fixture requires real project ${slug}`);
  const target = record;
  const priorFields = target.reviewedFields;
  target.reviewedFields = { ...(priorFields ?? {}), [field]: value };
  try {
    fn();
  } finally {
    if (priorFields === undefined) delete target.reviewedFields;
    else target.reviewedFields = priorFields;
  }
}

// Injects a raw internal override entry for the duration of fn, then restores.
// Used only for schema-side tests: projectIntelligence reads the internal
// override object at call time.
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

// --- Projection qualification (build-time, fail-closed) ---

test("projection: valid reviewed entry projects to the public model-field name", () => {
  const projection = buildReviewedFieldsProjection({
    projects: { "fixture-slug": { status: reviewedEntry(MARKER) } },
  });
  assert.equal(projection["fixture-slug"].status, MARKER);
  assert.deepEqual(Object.keys(projection["fixture-slug"]), ["status"]);
});

test("projection: every mapped fact key lands on its public field name", () => {
  const fields = {};
  for (const factKey of Object.keys(REVIEWED_FACT_FIELD_MAP)) {
    fields[factKey] = reviewedEntry(`${factKey}-value`);
  }
  const projection = buildReviewedFieldsProjection({ projects: { s: fields } });
  for (const [factKey, modelField] of Object.entries(REVIEWED_FACT_FIELD_MAP)) {
    assert.equal(projection.s[modelField], `${factKey}-value`);
  }
});

test("projection: fail-closed negatives drop the field entirely", () => {
  const cases = [
    reviewedEntry(MARKER, { source: "automated" }),
    reviewedEntry(MARKER, { reviewedBy: "" }),
    reviewedEntry(MARKER, { reviewedBy: "   " }),
    reviewedEntry(MARKER, { reviewedAt: "" }),
    reviewedEntry(MARKER, { reviewedAt: undefined }),
    reviewedEntry(""),
    reviewedEntry("   "),
    null,
    "not-an-object",
  ];
  for (const entry of cases) {
    assert.equal(qualifyReviewedOverrideValue(entry), "");
  }
  const projection = buildReviewedFieldsProjection({
    projects: { "fixture-slug": { status: cases[0], deliveryTiming: cases[2] } },
  });
  assert.equal(projection["fixture-slug"], undefined);
});

test("projection: private metadata never enters the public projection", () => {
  const projection = buildReviewedFieldsProjection({
    projects: {
      "fixture-slug": {
        status: reviewedEntry(MARKER, {
          note: PRIVATE_NOTE,
          reviewedBy: PRIVATE_REVIEWER,
          preferredFrom: PRIVATE_PREFERRED,
        }),
      },
    },
  });
  const serialized = JSON.stringify(projection);
  assert.ok(serialized.includes(MARKER));
  assert.ok(!serialized.includes(PRIVATE_NOTE));
  assert.ok(!serialized.includes(PRIVATE_REVIEWER));
  assert.ok(!serialized.includes(PRIVATE_PREFERRED));
  assert.ok(!serialized.includes("reviewedBy"));
  assert.ok(!serialized.includes("reviewedAt"));
  assert.ok(!serialized.includes("preferredFrom"));
  assert.ok(!serialized.includes("schemaSafe"));
  assert.ok(!serialized.includes("note"));
});

test("projection: unmapped fact keys are not projected", () => {
  const projection = buildReviewedFieldsProjection({
    projects: {
      "fixture-slug": {
        parking: reviewedEntry("PRIVATE-PARKING-VALUE"),
        pets: reviewedEntry("PRIVATE-PETS-VALUE"),
        amenities: reviewedEntry("PRIVATE-AMENITIES-VALUE"),
      },
    },
  });
  assert.equal(projection["fixture-slug"], undefined);
});

// --- Resolver precedence (single canonical contract) ---

test("precedence: explicit reviewedOverride param wins over everything", () => {
  const resolved = resolveProjectField({
    identifier: REAL_SLUG,
    field: "status",
    reviewedOverride: "  Explicit Winner  ",
    structuredValue: "Structured",
    approvedFallback: "Fallback",
  });
  assert.equal(resolved.value, "Explicit Winner");
  assert.equal(resolved.source, "reviewed_override");
});

test("precedence: structured value wins over approvedFallback; missing when nothing resolves", () => {
  const structured = resolveProjectField({ identifier: REAL_SLUG, field: "status", structuredValue: "Structured", approvedFallback: "Fallback" });
  assert.equal(structured.value, "Structured");
  assert.equal(structured.source, "structured_source");
  const fallback = resolveProjectField({ identifier: "__no-such-project__", field: "status", approvedFallback: "Fallback" });
  assert.equal(fallback.value, "Fallback");
  assert.equal(fallback.source, "approved_fallback");
  const missing = resolveProjectField({ identifier: "__no-such-project__", field: "status" });
  assert.equal(missing.value, "");
  assert.equal(missing.source, "missing");
});

test("resolver: projected reviewedFields value wins over structured and fallback", () => {
  const modelValue = canonicalProjectRecord(REAL_SLUG)?.status;
  withReviewedField(REAL_SLUG, "status", MARKER, () => {
    const resolved = resolveProjectField({
      identifier: REAL_SLUG,
      field: "status",
      structuredValue: "Structured",
      approvedFallback: "Fallback",
    });
    assert.equal(resolved.value, MARKER);
    assert.equal(resolved.source, "reviewed_override");
    assert.equal(reviewedProjectFactOverride(REAL_SLUG, "status"), MARKER);
  });
  const restored = resolveProjectField({ identifier: REAL_SLUG, field: "status" });
  assert.equal(restored.value, modelValue);
  assert.equal(restored.source, "structured_source");
});

test("resolver: alias and route identifiers resolve to the same reviewed value", () => {
  const record = canonicalProjectRecord(REAL_SLUG);
  assert.ok(record, "olara must exist in the public model");
  withReviewedField(record.publicSlug, "status", MARKER, () => {
    assert.equal(reviewedProjectFactOverride(`/projects/${record.publicSlug}/`, "status"), MARKER);
    for (const alias of record.lookupAliases) {
      assert.equal(reviewedProjectFactOverride(alias, "status"), MARKER, `alias ${alias}`);
    }
  });
});

test("resolver: unrelated project is unchanged by another project's override", () => {
  const before = resolveProjectField({ identifier: REAL_SLUG, field: "status" });
  withReviewedField(OTHER_SLUG, "status", MARKER, () => {
    const after = resolveProjectField({ identifier: REAL_SLUG, field: "status" });
    assert.deepEqual(after, before);
    assert.notEqual(after.value, MARKER);
  });
});

// --- Display helper: stale source-note suppression ---

test("display: reviewed override wins and the superseded source note is suppressed", () => {
  withReviewedField(REAL_SLUG, "residences", MARKER, () => {
    const display = resolvePublicFactDisplay({
      identifier: REAL_SLUG,
      field: "residences",
      sourceValue: "275 residences",
      sourceNote: "275 residences",
      fallbackValue: "fallback",
    });
    assert.equal(display.value, MARKER);
    assert.equal(display.source, "reviewed_override");
    assert.equal(display.note, "");
  });
});

test("display: structured source wins, note kept, formatSource applied", () => {
  const display = resolvePublicFactDisplay({
    identifier: "__no-such-project__",
    field: "residences",
    sourceValue: "275 residences",
    sourceNote: "275 residences",
    fallbackValue: "fallback",
    formatSource: (value) => `fmt:${value}`,
  });
  assert.equal(display.value, "fmt:275 residences");
  assert.equal(display.source, "structured_source");
  assert.equal(display.note, "275 residences");
});

test("display: fallback win suppresses source note; missing yields empty value", () => {
  const fallback = resolvePublicFactDisplay({
    identifier: "__no-such-project__",
    field: "delivery",
    sourceValue: "",
    sourceNote: "stale note",
    fallbackValue: "2027",
  });
  assert.equal(fallback.value, "2027");
  assert.equal(fallback.source, "approved_fallback");
  assert.equal(fallback.note, "");
  const missing = resolvePublicFactDisplay({ identifier: "__no-such-project__", field: "delivery" });
  assert.equal(missing.value, "");
  assert.equal(missing.source, "missing");
});

// --- schemaSafe gating stays independent of visible propagation ---

test("schemaSafe:true override emits the same value on visible and schema surfaces", () => {
  withOverrideEntry(OTHER_SLUG, "status", reviewedEntry(MARKER, { schemaSafe: true }), () => {
    withReviewedField(OTHER_SLUG, "status", MARKER, () => {
      const visible = resolveProjectField({ identifier: OTHER_SLUG, field: "status" });
      const schema = getSchemaSafeProjectFacts(OTHER_SLUG);
      assert.equal(visible.value, MARKER);
      assert.equal(schema.safeFields.status, MARKER);
    });
  });
});

test("schemaSafe:false override stays out of schema but still shows on the page", () => {
  withOverrideEntry(OTHER_SLUG, "status", reviewedEntry(MARKER, { schemaSafe: false }), () => {
    withReviewedField(OTHER_SLUG, "status", MARKER, () => {
      const visible = resolveProjectField({ identifier: OTHER_SLUG, field: "status" });
      const schema = getSchemaSafeProjectFacts(OTHER_SLUG);
      assert.equal(visible.value, MARKER);
      assert.notEqual(schema.safeFields.status, MARKER);
    });
  });
});
