import type { PublicBuildingDatabaseField, PublicBuildingDatabaseItem } from "../generated/buildingDatabasePublic";

export type BuildingDatabaseField = PublicBuildingDatabaseField;
export type BuildingDatabaseRecord = PublicBuildingDatabaseItem;

type BuildingDatabaseRuntime = {
  publicBuildingDatabaseByProjectId: Record<string, BuildingDatabaseRecord>;
  publicBuildingDatabaseBySlug: Record<string, BuildingDatabaseRecord>;
  publicBuildingDatabaseItems: BuildingDatabaseRecord[];
};

let runtimeDatabase: BuildingDatabaseRuntime | undefined;
let runtimeDatabasePromise: Promise<BuildingDatabaseRuntime> | undefined;

export const buildingDatabaseProjectAliases: Record<string, string> = {
  "alba-palm-beach": "alba-palm-beach",
  "banyan-tree": "banyan-tree-residences-wpb",
  "edgeworth": "edgeworth-wpb",
  "forte-on-flagler": "forte-on-flagler",
  "maison-dor": "maison-dor-south-flagler",
  "mandarin-oriental": "mandarin-oriental-residences-wpb",
  "mr-c": "mr-c-residences-wpb",
  "nora-house": "nora-house-wpb",
  "olara": "olara-wpb",
  "rosewood-residences-west-palm-beach": "rosewood-residences-west-palm-beach",
  "shorecrest": "shorecrest-wpb",
  "berkeley": "berkeley-wpb",
  "ritz-carlton-wpb": "ritz-carlton-residences-west-palm-beach",
  "la-clara": "la-clara-wpb",
  "south-flagler-house": "south-flagler-house",
};

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
  runtimeDatabasePromise ??= import("../generated/buildingDatabasePublic").then((module) => ({
    publicBuildingDatabaseByProjectId: module.publicBuildingDatabaseByProjectId,
    publicBuildingDatabaseBySlug: module.publicBuildingDatabaseBySlug,
    publicBuildingDatabaseItems: module.publicBuildingDatabaseItems,
  }));
  runtimeDatabase = await runtimeDatabasePromise;
  return runtimeDatabase;
}

export function getBuildingDatabaseRecord(projectIdOrSlug: string) {
  const normalized = projectIdOrSlug.trim();
  if (!normalized) return undefined;
  if (!runtimeDatabase) return undefined;

  const aliasedProjectId = buildingDatabaseProjectAliases[normalized] ?? normalized;
  return (
    runtimeDatabase.publicBuildingDatabaseByProjectId[aliasedProjectId] ??
    runtimeDatabase.publicBuildingDatabaseByProjectId[normalized] ??
    runtimeDatabase.publicBuildingDatabaseBySlug[normalized] ??
    runtimeDatabase.publicBuildingDatabaseItems.find((item) => item.slug === normalized || item.project_id === normalized)
  );
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
