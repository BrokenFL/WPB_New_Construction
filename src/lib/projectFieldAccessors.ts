import { publicProjectModel } from "../generated/projectModelPublic.ts";

export type ProjectModelRecord = (typeof publicProjectModel.projects)[number];
export type ProjectModelField = "displayName" | "status" | "delivery" | "residences" | "price" | "address";
export type ProjectFieldSource = "reviewed_override" | "structured_source" | "approved_fallback" | "missing";

const recordByAlias = new Map<string, ProjectModelRecord>();
for (const record of publicProjectModel.projects) {
  for (const alias of record.lookupAliases) recordByAlias.set(normalizeIdentifier(alias), record);
  recordByAlias.set(normalizeIdentifier(record.publicSlug), record);
}

export function canonicalProjectRecord(identifier: string) {
  return recordByAlias.get(normalizeIdentifier(identifier));
}

// Reviewed overrides reach the browser only through the sanitized
// `reviewedFields` projection emitted into the generated public model at build
// time (research/scripts/reviewed-field-projection.mjs). The raw internal
// override file — reviewer identity, timestamps, notes, provenance — is
// build-time/tooling data and is never imported here.
export function reviewedProjectFactOverride(identifier: string, field: ProjectModelField) {
  const record = canonicalProjectRecord(identifier);
  const reviewedFields = (record as { reviewedFields?: Partial<Record<ProjectModelField, string>> } | undefined)
    ?.reviewedFields;
  return clean(reviewedFields?.[field]);
}

export function resolveProjectField(options: {
  identifier: string;
  field: ProjectModelField;
  reviewedOverride?: string;
  structuredValue?: string;
  approvedFallback?: string;
}) {
  const reviewedOverride = clean(options.reviewedOverride) || reviewedProjectFactOverride(options.identifier, options.field);
  if (reviewedOverride) return { value: reviewedOverride, source: "reviewed_override" as const };

  const record = canonicalProjectRecord(options.identifier);
  const modelValue = options.field === "address" ? record?.facts.projectAddress : record?.[options.field];
  const structuredValue = clean(options.structuredValue) || clean(modelValue);
  if (structuredValue) return { value: structuredValue, source: "structured_source" as const };

  const approvedFallback = clean(options.approvedFallback);
  if (approvedFallback) return { value: approvedFallback, source: "approved_fallback" as const };

  return { value: "", source: "missing" as const };
}

// Display helper for surfaces that pair a public fact with a source-catalog
// note. Runs the canonical precedence (reviewed override -> structured source
// -> approved fallback -> missing) and suppresses the source note whenever the
// source value did not win, so a superseded value can never sit beside a
// reviewed override. Generic guidance notes stay at the call site.
export function resolvePublicFactDisplay(options: {
  identifier: string;
  field: ProjectModelField;
  sourceValue?: string;
  sourceNote?: string;
  fallbackValue?: string;
  formatSource?: (value: string) => string;
}) {
  const resolved = resolveProjectField({
    identifier: options.identifier,
    field: options.field,
    structuredValue: options.sourceValue,
    approvedFallback: options.fallbackValue,
  });
  const value =
    resolved.source === "structured_source" && options.formatSource
      ? options.formatSource(resolved.value)
      : resolved.value;
  const note = resolved.source === "structured_source" ? clean(options.sourceNote) : "";
  return { value, source: resolved.source, note };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value).trim();
}

function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/projects/")) return trimmed.replace(/^\/projects\//, "").replace(/\/$/, "");
  return trimmed;
}
