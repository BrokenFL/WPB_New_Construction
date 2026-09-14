// Build-time projection of Brooke-reviewed project-fact overrides into the
// sanitized public project model. This module is the ONLY place that reads the
// internal override shape; the public projection carries allowlisted values
// only — never reviewer identity, timestamps, notes, or provenance metadata.

// Internal fact-override key -> public project-model field name.
import { safeHttpUrl } from "./intel/normalizer.mjs";
import { FAST_MODE_POLICY_VERSION } from "./p2/fast-policy.mjs";

export const ACTIVE_AUTOMATED_FACT_POLICY_VERSION = FAST_MODE_POLICY_VERSION;

export const REVIEWED_FACT_FIELD_MAP = {
  name: "displayName",
  status: "status",
  deliveryTiming: "delivery",
  residenceCount: "residences",
  priceDisplay: "price",
  address: "address",
};

const DYNAMIC_AUTOMATED_FACT_KEYS = new Set([
  "priceDisplay", "deliveryTiming",
]);

// Fail-closed qualification: an override only projects publicly when it is a
// manual review with a non-empty value, reviewer, and review timestamp.
export function qualifyReviewedOverrideValue(entry) {
  if (!entry || typeof entry !== "object") return "";
  if (entry.source !== "manual_review") return "";
  const value = cleanString(entry.value);
  if (!value) return "";
  if (!cleanString(entry.reviewedBy) || !cleanString(entry.reviewedAt)) return "";
  return value;
}

// Automated Fast Mode entries project publicly when they carry a value, a
// source URL, and provenance. Provenance itself never reaches the public
// model — only the qualified value does.
export function qualifyAutomatedOverrideValue(entry, { requireAsOf = false } = {}) {
  if (!entry || typeof entry !== "object") return "";
  if (entry.source !== "automated_intel") return "";
  const value = cleanString(entry.value);
  if (!value) return "";
  if (!safeHttpUrl(entry.sourceUrl) || Number.isNaN(Date.parse(cleanString(entry.appliedAt)))) return "";
  if (!cleanString(entry.intelId) || entry.policyVersion !== ACTIVE_AUTOMATED_FACT_POLICY_VERSION) return "";
  if (!/^[a-f0-9]{64}$/i.test(cleanString(entry.evidenceBundleSha256))) return "";
  if (requireAsOf && !isRealDateOnly(entry.asOf)) return "";
  return value;
}

// Returns { [publicSlug]: { [modelField]: publicValue } } for automated
// entries. Manual reviewed values always win: callers merge manual over this.
export function buildAutomatedFieldsProjection(automated, manualOverrides) {
  const projection = {};
  if (automated?.policyVersion !== ACTIVE_AUTOMATED_FACT_POLICY_VERSION) return projection;
  const projects = automated?.projects;
  if (!projects || typeof projects !== "object") return projection;
  for (const [slug, fields] of Object.entries(projects)) {
    if (!fields || typeof fields !== "object") continue;
    const auto = {};
    for (const [factKey, modelField] of Object.entries(REVIEWED_FACT_FIELD_MAP)) {
      if (Object.prototype.hasOwnProperty.call(manualOverrides?.projects?.[slug] || {}, factKey)) continue;
      const value = qualifyAutomatedOverrideValue(fields[factKey], { requireAsOf: DYNAMIC_AUTOMATED_FACT_KEYS.has(factKey) });
      if (value) auto[modelField] = value;
    }
    if (Object.keys(auto).length) projection[slug] = auto;
  }
  return projection;
}

// Latest qualifying automated as-of date per public project. This lets the
// public factEffectiveDate describe the automatic fact revision without
// exposing reviewer identities or internal evidence metadata.
export function buildAutomatedFactAsOfProjection(automated, manualOverrides) {
  const projection = {};
  if (automated?.policyVersion !== ACTIVE_AUTOMATED_FACT_POLICY_VERSION) return projection;
  for (const [slug, fields] of Object.entries(automated?.projects || {})) {
    for (const factKey of Object.keys(REVIEWED_FACT_FIELD_MAP)) {
      if (Object.prototype.hasOwnProperty.call(manualOverrides?.projects?.[slug] || {}, factKey)) continue;
      const entry = fields?.[factKey];
      const asOf = cleanString(entry?.asOf);
      if (!isRealDateOnly(asOf) || !qualifyAutomatedOverrideValue(entry, { requireAsOf: DYNAMIC_AUTOMATED_FACT_KEYS.has(factKey) })) continue;
      if (!projection[slug] || asOf > projection[slug]) projection[slug] = asOf;
    }
  }
  return projection;
}

// Manual reviewed projection wins over automated for the same slug+field.
export function mergeFieldProjections(automated, manual) {
  const merged = {};
  for (const [slug, fields] of Object.entries(automated || {})) merged[slug] = { ...fields };
  for (const [slug, fields] of Object.entries(manual || {})) merged[slug] = { ...(merged[slug] || {}), ...fields };
  return merged;
}

// Returns { [publicSlug]: { [modelField]: publicValue } } containing only
// qualified public values. Unqualified or unmapped entries are dropped.
export function buildReviewedFieldsProjection(overrides) {
  const projection = {};
  const projects = overrides?.projects;
  if (!projects || typeof projects !== "object") return projection;
  for (const [slug, fields] of Object.entries(projects)) {
    if (!fields || typeof fields !== "object") continue;
    const reviewed = {};
    for (const [factKey, modelField] of Object.entries(REVIEWED_FACT_FIELD_MAP)) {
      const value = qualifyReviewedOverrideValue(fields[factKey]);
      if (value) reviewed[modelField] = value;
    }
    if (Object.keys(reviewed).length) projection[slug] = reviewed;
  }
  return projection;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isRealDateOnly(value) {
  const clean = cleanString(value);
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(clean)) return false;
  const parsed = new Date(`${clean}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === clean;
}
