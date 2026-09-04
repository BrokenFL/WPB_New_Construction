import type { PublicBuildingDatabaseField, PublicBuildingDatabaseItem } from "../generated/buildingDatabasePublic";
import { publicProjectRecords } from "../generated/projectModelPublic";

export type BuildingDatabaseField = PublicBuildingDatabaseField;
export type BuildingDatabaseRecord = PublicBuildingDatabaseItem;

type BuildingDatabaseRuntime = {
  publicBuildingDatabaseByProjectId: Record<string, BuildingDatabaseRecord>;
  publicBuildingDatabaseBySlug: Record<string, BuildingDatabaseRecord>;
  publicBuildingDatabaseItems: BuildingDatabaseRecord[];
};

let runtimeDatabase: BuildingDatabaseRuntime | undefined;
let runtimeDatabasePromise: Promise<BuildingDatabaseRuntime> | undefined;

type PublicProjectLookupRecord = {
  publicSlug: string;
  publicRoute: string;
  compareDatabaseId: string;
  compareDatabaseSlug: string;
  lookupAliases: readonly string[];
};

const publicLookupRecords: readonly PublicProjectLookupRecord[] = publicProjectRecords;

export const buildingDatabaseProjectAliases = Object.fromEntries(
  publicLookupRecords.flatMap((entry) => {
    const compareId = entry.compareDatabaseId ?? entry.publicSlug;
    const aliases = new Set<string>([
      entry.publicSlug,
      entry.publicRoute,
      compareId,
      entry.compareDatabaseSlug,
      ...entry.lookupAliases,
    ].filter(Boolean));
    return [...aliases].map((alias) => [normalizeProjectIdentifier(alias), compareId] as const);
  }),
) as Record<string, string>;

const buildingDatabaseSlugByAlias = Object.fromEntries(
  publicLookupRecords.flatMap((entry) => {
    const compareSlug = entry.compareDatabaseSlug ?? entry.publicSlug;
    return [...new Set([entry.publicSlug, entry.publicRoute, entry.compareDatabaseId, compareSlug, ...entry.lookupAliases])]
      .filter(Boolean)
      .map((alias) => [normalizeProjectIdentifier(alias), compareSlug] as const);
  }),
) as Record<string, string>;

const policyFields = new Set<BuildingDatabaseField>([
  "deposit_structure",
  "parking_summary",
  "storage_summary",
  "pet_summary",
  "rental_policy_summary",
  "buyer_cost_notes",
  "maintenance_per_sqft",
]);

const unpublishedFields = new Set<BuildingDatabaseField>([
  "developer",
  "architect",
  "interior_designer",
  "landscape_architect",
  "sales_team",
  "construction_team",
  "brand_partner",
  "capital_partner",
  "district_master_developers",
  "brand_or_hospitality_partner",
]);

export type BuildingDatabaseProjectLike = {
  id?: string;
  projectId?: string;
  slug?: string;
};

export function hasBuildingValue(value: string | null | undefined): value is string {
  return Boolean(value && value.trim());
}

export function formatBuildingValue(value: string | null | undefined, fallback = "Verify") {
  return hasBuildingValue(value) ? value.trim() : fallback;
}

export function buildingFieldFallback(field: BuildingDatabaseField) {
  if (policyFields.has(field)) return "Ask for current terms";
  if (unpublishedFields.has(field)) return "Not published";
  return "Verify";
}

export function formatBuildingFieldValue(field: BuildingDatabaseField, value: string | null | undefined) {
  return formatBuildingValue(value, buildingFieldFallback(field));
}

export async function loadBuildingDatabase() {
  runtimeDatabasePromise ??= import("../generated/buildingDatabasePublic.ts").then((module) => ({
    publicBuildingDatabaseByProjectId: module.publicBuildingDatabaseByProjectId,
    publicBuildingDatabaseBySlug: module.publicBuildingDatabaseBySlug,
    publicBuildingDatabaseItems: module.publicBuildingDatabaseItems,
  }));
  runtimeDatabase = await runtimeDatabasePromise;
  return runtimeDatabase;
}

export function getBuildingDatabaseRecord(projectIdOrSlug: string) {
  const normalized = normalizeProjectIdentifier(projectIdOrSlug);
  if (!normalized) return undefined;
  if (!runtimeDatabase) return undefined;

  const aliasedProjectId = buildingDatabaseProjectAliases[normalized] ?? normalized;
  const aliasedProjectSlug = buildingDatabaseSlugByAlias[normalized] ?? normalized;
  return (
    runtimeDatabase.publicBuildingDatabaseByProjectId[aliasedProjectId] ??
    runtimeDatabase.publicBuildingDatabaseByProjectId[normalized] ??
    runtimeDatabase.publicBuildingDatabaseBySlug[aliasedProjectSlug] ??
    runtimeDatabase.publicBuildingDatabaseBySlug[normalized] ??
    runtimeDatabase.publicBuildingDatabaseItems.find((item) => item.slug === normalized || item.project_id === normalized)
  );
}

function normalizeProjectIdentifier(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\/[^/]+/i, "").replace(/^\/projects\//, "").replace(/^\/+|\/+$/g, "");
}

export function getBuildingEnrichmentForProject(project: BuildingDatabaseProjectLike) {
  const candidates = [project.id, project.projectId, project.slug].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    const record = getBuildingDatabaseRecord(candidate);
    if (record) return record;
  }
  return undefined;
}

export async function warnForMissingBuildingEnrichment(projects: BuildingDatabaseProjectLike[]) {
  if (!import.meta.env.DEV) return;
  await loadBuildingDatabase();
  const missing = projects
    .map((project) => project.id ?? project.projectId ?? project.slug ?? "")
    .filter((id) => id && !getBuildingDatabaseRecord(id));
  if (missing.length) {
    console.warn(`[building-database] No CSV enrichment match for: ${missing.join(", ")}`);
  }
}
