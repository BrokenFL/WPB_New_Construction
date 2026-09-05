import { generatedProjectRegistryEntries } from "../generated/projectModel.ts";
import type { ProjectFactFieldKey } from "../data/projectFactOverrides.ts";

export type ProjectIntelligenceRegistryEntry = {
  publicSlug: string;
  publicRoute: string;
  publicDisplayName: string;
  corridor: string;
  publicStatus: string;
  publicDelivery: string;
  publicResidenceCount: string;
  publicAddress: string;
  sourceCatalogIds: string[];
  compareDatabaseId?: string;
  compareDatabaseSlug?: string;
  alternateAliases?: string[];
  collapsedSourceCatalogIds?: string[];
  notes?: string[];
  canonicalId?: string;
  corridorKey?: "north-flagler" | "downtown" | "south-flagler" | "south-end" | "palm-beach";
  publicationState?: "published" | "awaiting_imagery";
  humanReviewRequired?: boolean;
  conflicts?: string[];
  schemaBlockedFields?: ProjectFactFieldKey[];
};

const registryEntries: ProjectIntelligenceRegistryEntry[] = generatedProjectRegistryEntries.map((project) => ({
  canonicalId: project.canonicalId,
  publicSlug: project.publicSlug,
  publicRoute: project.publicRoute,
  publicDisplayName: project.displayName,
  corridor: project.corridor,
  corridorKey: project.corridorKey,
  publicationState: project.publicationState,
  publicStatus: project.status,
  publicDelivery: project.delivery,
  publicResidenceCount: project.residences,
  publicAddress: project.address,
  sourceCatalogIds: [...project.sourceCatalogIds],
  compareDatabaseId: project.compareDatabaseId || undefined,
  compareDatabaseSlug: project.compareDatabaseSlug || undefined,
  alternateAliases: [...project.aliases],
  collapsedSourceCatalogIds: [...project.collapsedSourceCatalogIds],
  humanReviewRequired: project.humanReviewRequired,
  conflicts: [...project.conflicts],
  schemaBlockedFields: [...project.schemaBlockedFields] as ProjectFactFieldKey[],
}));

export const projectIntelligenceRegistryEntries = registryEntries;

export const projectIntelligenceRegistryByPublicSlug = Object.fromEntries(
  registryEntries.map((entry) => [entry.publicSlug, entry]),
) as Record<string, ProjectIntelligenceRegistryEntry>;

export const projectIntelligenceRegistryAliasToPublicSlug = Object.fromEntries(
  registryEntries.flatMap((entry) => {
    const aliases = new Set<string>([
      entry.publicSlug,
      entry.publicRoute,
      entry.compareDatabaseId,
      entry.compareDatabaseSlug,
      ...(entry.alternateAliases ?? []),
      ...(entry.sourceCatalogIds ?? []),
      ...(entry.collapsedSourceCatalogIds ?? []),
    ].filter((value): value is string => Boolean(value && value.trim())));
    return [...aliases].map((alias) => [alias, entry.publicSlug] as const);
  }),
) as Record<string, string>;

export function resolveProjectIntelligenceRegistryEntry(identifier: string) {
  const normalized = identifier.trim();
  if (!normalized) return undefined;
  const publicSlug = projectIntelligenceRegistryAliasToPublicSlug[normalized];
  return publicSlug ? projectIntelligenceRegistryByPublicSlug[publicSlug] : undefined;
}

export function resolveSourceCatalogProjectId(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  return entry?.sourceCatalogIds[0] ?? identifier.trim();
}

export function resolveCompareDatabaseProjectId(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  return entry?.compareDatabaseId ?? identifier.trim();
}

export function resolveCompareDatabaseProjectSlug(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  return entry?.compareDatabaseSlug ?? identifier.trim();
}

export function listProjectIntelligenceAliases(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  if (!entry) return [identifier.trim()].filter(Boolean);
  return [
    entry.publicSlug,
    entry.publicRoute,
    ...(entry.sourceCatalogIds ?? []),
    ...(entry.compareDatabaseId ? [entry.compareDatabaseId] : []),
    ...(entry.compareDatabaseSlug ? [entry.compareDatabaseSlug] : []),
    ...(entry.alternateAliases ?? []),
    ...(entry.collapsedSourceCatalogIds ?? []),
  ].filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
}
