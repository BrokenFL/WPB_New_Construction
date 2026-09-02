import { canonicalProjectModel } from "../generated/projectModel";

export type ProjectModelRecord = (typeof canonicalProjectModel.projects)[number];
export type ProjectModelField = "displayName" | "status" | "delivery" | "residences" | "price" | "address";
export type ProjectFieldSource = "reviewed_override" | "structured_source" | "approved_fallback" | "missing";

const recordByAlias = new Map<string, ProjectModelRecord>();
for (const record of canonicalProjectModel.projects) {
  for (const alias of record.aliases) recordByAlias.set(normalizeIdentifier(alias), record);
  recordByAlias.set(normalizeIdentifier(record.canonicalId), record);
  recordByAlias.set(normalizeIdentifier(record.publicSlug), record);
}

export function canonicalProjectRecord(identifier: string) {
  return recordByAlias.get(normalizeIdentifier(identifier));
}

export function resolveProjectField(options: {
  identifier: string;
  field: ProjectModelField;
  reviewedOverride?: string;
  structuredValue?: string;
  approvedFallback?: string;
}) {
  const reviewedOverride = clean(options.reviewedOverride);
  if (reviewedOverride) return { value: reviewedOverride, source: "reviewed_override" as const };

  const record = canonicalProjectRecord(options.identifier);
  const structuredValue = clean(options.structuredValue) || clean(record?.[options.field]);
  if (structuredValue) return { value: structuredValue, source: "structured_source" as const };

  const approvedFallback = clean(options.approvedFallback);
  if (approvedFallback) return { value: approvedFallback, source: "approved_fallback" as const };

  return { value: "", source: "missing" as const };
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
