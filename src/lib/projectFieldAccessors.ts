import { publicProjectModel } from "../generated/projectModelPublic.ts";
import { projectFactOverrides } from "../data/projectFactOverrides.ts";
import type { ProjectFactFieldKey } from "../data/projectFactOverrides.ts";

export type ProjectModelRecord = (typeof publicProjectModel.projects)[number];
export type ProjectModelField = "displayName" | "status" | "delivery" | "residences" | "price" | "address";
export type ProjectFieldSource = "reviewed_override" | "structured_source" | "approved_fallback" | "missing";

const factFieldByModelField: Partial<Record<ProjectModelField, ProjectFactFieldKey>> = {
  status: "status",
  delivery: "deliveryTiming",
  residences: "residenceCount",
  price: "priceDisplay",
  address: "address",
};

const recordByAlias = new Map<string, ProjectModelRecord>();
for (const record of publicProjectModel.projects) {
  for (const alias of record.lookupAliases) recordByAlias.set(normalizeIdentifier(alias), record);
  recordByAlias.set(normalizeIdentifier(record.publicSlug), record);
}

export function canonicalProjectRecord(identifier: string) {
  return recordByAlias.get(normalizeIdentifier(identifier));
}

export function reviewedProjectFactOverride(identifier: string, field: ProjectModelField) {
  const factField = factFieldByModelField[field];
  if (!factField) return "";
  const record = canonicalProjectRecord(identifier);
  const slug = record?.publicSlug ?? normalizeIdentifier(identifier);
  const override = projectFactOverrides.projects[slug]?.[factField];
  if (!override || override.source !== "manual_review") return "";
  if (!clean(override.reviewedBy) || !clean(override.reviewedAt)) return "";
  return clean(override.value);
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

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value).trim();
}

function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/projects/")) return trimmed.replace(/^\/projects\//, "").replace(/\/$/, "");
  return trimmed;
}
