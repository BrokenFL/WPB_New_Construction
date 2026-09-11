// Build-time projection of Brooke-reviewed project-fact overrides into the
// sanitized public project model. This module is the ONLY place that reads the
// internal override shape; the public projection carries allowlisted values
// only — never reviewer identity, timestamps, notes, or provenance metadata.

// Internal fact-override key -> public project-model field name.
export const REVIEWED_FACT_FIELD_MAP = {
  status: "status",
  deliveryTiming: "delivery",
  residenceCount: "residences",
  priceDisplay: "price",
  address: "address",
};

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
