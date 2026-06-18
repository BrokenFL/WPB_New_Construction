import { projectFacts } from "../generated/siteData.ts";
import { marketNotes, type MarketNote } from "../data/marketNotes.ts";
import {
  listProjectIntelligenceAliases,
  resolveCompareDatabaseProjectId,
  resolveCompareDatabaseProjectSlug,
  resolveProjectIntelligenceRegistryEntry,
  resolveSourceCatalogProjectId,
  type ProjectIntelligenceRegistryEntry,
} from "./projectIntelligenceRegistry.ts";
import { getBuildingDatabaseRecord, loadBuildingDatabase, type BuildingDatabaseRecord } from "./buildingDatabase.ts";
import { newsSortTimestamp, publishedExternalNews } from "../data/approvedExternalNews.ts";

type SourceFactRecord = (typeof projectFacts)[number];

export type ProjectIntelligenceConflict = {
  field: "status" | "delivery" | "residenceCount";
  publicValue: string;
  sourceValue?: string;
  compareValue?: string;
  recommendation: "manual_review";
};

export type RelatedContentMatch = {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  sourceName?: string;
  publishedAt?: string;
  type: "news" | "market-note";
};

export type ProjectIntelligence = {
  publicIdentity: {
    slug: string;
    route: string;
    displayName: string;
    corridor: string;
    status: string;
    delivery: string;
    residenceCount: string;
    address: string;
    aliases: string[];
  };
  sourceCatalog: {
    primaryId: string;
    ids: string[];
    facts: SourceFactRecord["facts"] | undefined;
    pageStatus?: string;
    dataConfidence?: string;
    sourceCounts?: SourceFactRecord["sourceCounts"];
    conflicts: string[];
    gaps: string[];
    notes?: string[];
  };
  compare: {
    id?: string;
    slug?: string;
    record?: BuildingDatabaseRecord;
  };
  relatedContent: {
    news: RelatedContentMatch[];
    marketNotes: RelatedContentMatch[];
  };
  conflicts: ProjectIntelligenceConflict[];
  missingDataFlags: string[];
  schemaSafety: {
    safeFields: Record<string, string>;
    reviewFields: string[];
  };
  registryEntry?: ProjectIntelligenceRegistryEntry;
};

const sourceFactById = new Map<string, SourceFactRecord>(projectFacts.map((project) => [project.projectId, project]));

function firstNumber(value: string | undefined) {
  const match = value?.match(/\d+(?:,\d{3})*/);
  return match ? Number(match[0].replace(/,/g, "")) : undefined;
}

function toMutableStrings(values: readonly string[] | undefined) {
  return values ? [...values] : [];
}

function firstYear(value: string | undefined) {
  return value?.match(/20\d{2}/)?.[0];
}

function normalizeStatus(value: string | undefined) {
  const text = (value ?? "").toLowerCase();
  if (!text) return "";
  if (/completed|resales available|delivered|recently delivered|closings underway|completed comp|resale benchmark/.test(text)) return "completed";
  if (/under construction/.test(text)) return "under-construction";
  if (/pre-?construction|sales open|sales office open|sales launched|active sales|pipeline|watchlist|announced|planned|planning|proposed|reported/.test(text)) return "pipeline";
  return text.replace(/[^a-z0-9]+/g, " ").trim();
}

function buildAliasSet(entry: ProjectIntelligenceRegistryEntry) {
  return new Set(
    [
      entry.publicSlug,
      entry.publicRoute,
      entry.compareDatabaseId,
      entry.compareDatabaseSlug,
      ...(entry.sourceCatalogIds ?? []),
      ...(entry.alternateAliases ?? []),
      ...(entry.collapsedSourceCatalogIds ?? []),
    ].filter((value): value is string => Boolean(value && value.trim())),
  );
}

function matchNewsItems(entry: ProjectIntelligenceRegistryEntry) {
  const aliases = buildAliasSet(entry);
  return publishedExternalNews
    .filter((item) => {
      const slugs = [item.primaryProjectSlug, ...(item.relatedProjectSlugs ?? [])].filter((value): value is string => Boolean(value));
      if (item.relatedProjectIds.some((id) => aliases.has(id))) return true;
      if (slugs.some((slug) => aliases.has(slug))) return true;
      return false;
    })
    .sort((a, b) => newsSortTimestamp(b) - newsSortTimestamp(a))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.category,
      sourceName: item.sourceName,
      publishedAt: item.publishedAt,
      type: "news" as const,
    }));
}

function matchMarketNotes(entry: ProjectIntelligenceRegistryEntry) {
  const aliases = buildAliasSet(entry);
  return marketNotes
    .filter((note) => {
      const noteRecord = note as MarketNote;
      const noteIds = [noteRecord.primaryProjectId, ...noteRecord.projectIds].filter((value): value is string => Boolean(value));
      return noteIds.some((id) => aliases.has(id));
    })
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.id.localeCompare(b.id))
    .slice(0, 4)
    .map((note) => ({
      id: note.id,
      title: note.title,
      slug: note.slug,
      category: note.category,
      sourceName: note.sourceName,
      publishedAt: note.datePublished,
      type: "market-note" as const,
    }));
}

function buildConflictList(
  publicIdentity: ProjectIntelligence["publicIdentity"],
  sourceFacts: SourceFactRecord[],
  compareRecord: BuildingDatabaseRecord | undefined,
): ProjectIntelligenceConflict[] {
  const sourceFact = sourceFacts[0];
  const source = sourceFact?.facts;
  const sourceStatus = source?.status ?? sourceFact?.pageStatus;
  const sourceDelivery = source?.completion;
  const sourceResidences = source?.residences;
  const compareStatus = compareRecord?.status_badge;
  const compareDelivery = compareRecord?.completion_or_delivery;
  const compareResidences = compareRecord?.residence_count;

  const conflicts: ProjectIntelligenceConflict[] = [];

  if (sourceStatus && normalizeStatus(sourceStatus) && normalizeStatus(sourceStatus) !== normalizeStatus(publicIdentity.status)) {
    conflicts.push({
      field: "status",
      publicValue: publicIdentity.status,
      sourceValue: sourceStatus,
      compareValue: compareStatus,
      recommendation: "manual_review",
    });
  } else if (compareStatus && normalizeStatus(compareStatus) && normalizeStatus(compareStatus) !== normalizeStatus(publicIdentity.status)) {
    conflicts.push({
      field: "status",
      publicValue: publicIdentity.status,
      sourceValue: sourceStatus,
      compareValue: compareStatus,
      recommendation: "manual_review",
    });
  }

  const publicYear = firstYear(publicIdentity.delivery);
  const sourceYear = firstYear(sourceDelivery);
  const compareYear = firstYear(compareDelivery);
  if (publicYear && [sourceYear, compareYear].filter((value): value is string => Boolean(value)).some((year) => year !== publicYear)) {
    conflicts.push({
      field: "delivery",
      publicValue: publicIdentity.delivery,
      sourceValue: sourceDelivery,
      compareValue: compareDelivery,
      recommendation: "manual_review",
    });
  }

  const publicResidences = firstNumber(publicIdentity.residenceCount);
  const sourceResidencesNumber = firstNumber(sourceResidences);
  const compareResidencesNumber = firstNumber(compareResidences);
  if (
    publicResidences !== undefined &&
    ((sourceResidencesNumber !== undefined && sourceResidencesNumber !== publicResidences) ||
      (compareResidencesNumber !== undefined && compareResidencesNumber !== publicResidences))
  ) {
    conflicts.push({
      field: "residenceCount",
      publicValue: publicIdentity.residenceCount,
      sourceValue: sourceResidences,
      compareValue: compareResidences,
      recommendation: "manual_review",
    });
  }

  return conflicts;
}

function buildSchemaSafety(
  entry: ProjectIntelligenceRegistryEntry,
  sourceFacts: SourceFactRecord[],
  compareRecord: BuildingDatabaseRecord | undefined,
  conflicts: ProjectIntelligenceConflict[],
) {
  const safeFields: Record<string, string> = {
    name: entry.publicDisplayName,
    route: entry.publicRoute,
    url: `https://www.wpbnewconstruction.com${entry.publicRoute}`,
    corridor: entry.corridor,
    address: entry.publicAddress,
    pageStatus: entry.publicStatus,
  };
  const reviewFields = new Set<string>();
  const conflictFields = new Set(conflicts.map((conflict) => conflict.field));

  if (conflictFields.has("status")) reviewFields.add("status");
  else safeFields.status = entry.publicStatus;

  if (conflictFields.has("delivery")) reviewFields.add("delivery");
  else safeFields.delivery = entry.publicDelivery;

  if (conflictFields.has("residenceCount")) reviewFields.add("residenceCount");
  else safeFields.residenceCount = entry.publicResidenceCount;

  if (!sourceFacts.length) reviewFields.add("sourceCatalog");
  if (!compareRecord) reviewFields.add("compareDatabase");

  return {
    safeFields,
    reviewFields: [...reviewFields],
  };
}

function buildSourceCatalogSummary(entry: ProjectIntelligenceRegistryEntry) {
  const primaryId = entry.sourceCatalogIds[0] ?? entry.publicSlug;
  const primaryFact = sourceFactById.get(primaryId);
  return {
    primaryId,
    ids: entry.sourceCatalogIds,
    facts: primaryFact?.facts,
    pageStatus: primaryFact?.pageStatus,
    dataConfidence: primaryFact?.dataConfidence,
    sourceCounts: primaryFact?.sourceCounts,
    conflicts: toMutableStrings(primaryFact?.conflicts as readonly string[] | undefined),
    gaps: toMutableStrings(primaryFact?.gaps as readonly string[] | undefined),
    notes: primaryFact?.highValueSources ? toMutableStrings(primaryFact.highValueSources as readonly string[] | undefined) : undefined,
  };
}

export async function getProjectIntelligence(identifier: string): Promise<ProjectIntelligence> {
  const registryEntry = resolveProjectIntelligenceRegistryEntry(identifier);
  const publicIdentity = registryEntry
    ? {
        slug: registryEntry.publicSlug,
        route: registryEntry.publicRoute,
        displayName: registryEntry.publicDisplayName,
        corridor: registryEntry.corridor,
        status: registryEntry.publicStatus,
        delivery: registryEntry.publicDelivery,
        residenceCount: registryEntry.publicResidenceCount,
        address: registryEntry.publicAddress,
        aliases: listProjectIntelligenceAliases(identifier),
      }
    : {
        slug: identifier.trim(),
        route: `/projects/${identifier.trim()}/`,
        displayName: identifier.trim(),
        corridor: "Verify",
        status: "Verify",
        delivery: "Verify",
        residenceCount: "Verify",
        address: "Verify",
        aliases: [identifier.trim()].filter(Boolean),
      };

  await loadBuildingDatabase();

  const compareId = registryEntry ? resolveCompareDatabaseProjectId(identifier) : identifier.trim();
  const compareSlug = registryEntry ? resolveCompareDatabaseProjectSlug(identifier) : identifier.trim();
  const compareRecord =
    getBuildingDatabaseRecord(compareId) ??
    getBuildingDatabaseRecord(compareSlug) ??
    getBuildingDatabaseRecord(identifier.trim());

  const sourceCatalog = registryEntry ? buildSourceCatalogSummary(registryEntry) : buildSourceCatalogSummary({
    publicSlug: identifier.trim(),
    publicRoute: `/projects/${identifier.trim()}/`,
    publicDisplayName: identifier.trim(),
    corridor: "Verify",
    publicStatus: "Verify",
    publicDelivery: "Verify",
    publicResidenceCount: "Verify",
    publicAddress: "Verify",
    sourceCatalogIds: [resolveSourceCatalogProjectId(identifier)],
  });

  const sourceFacts = sourceCatalog.ids
    .map((projectId) => sourceFactById.get(projectId))
    .filter((fact): fact is SourceFactRecord => Boolean(fact));
  const primarySourceFact = sourceFacts[0];
  const conflicts = buildConflictList(publicIdentity, sourceFacts, compareRecord);
  const schemaSafety = buildSchemaSafety(registryEntry ?? {
    publicSlug: publicIdentity.slug,
    publicRoute: publicIdentity.route,
    publicDisplayName: publicIdentity.displayName,
    corridor: publicIdentity.corridor,
    publicStatus: publicIdentity.status,
    publicDelivery: publicIdentity.delivery,
    publicResidenceCount: publicIdentity.residenceCount,
    publicAddress: publicIdentity.address,
    sourceCatalogIds: sourceCatalog.ids,
  }, sourceFacts, compareRecord, conflicts);

  return {
    publicIdentity,
    sourceCatalog: {
      primaryId: sourceCatalog.primaryId,
      ids: sourceCatalog.ids,
      facts: primarySourceFact?.facts,
      pageStatus: primarySourceFact?.pageStatus,
      dataConfidence: primarySourceFact?.dataConfidence,
      sourceCounts: primarySourceFact?.sourceCounts,
      conflicts: [...(primarySourceFact?.conflicts ?? [])] as string[],
      gaps: [...(primarySourceFact?.gaps ?? [])] as string[],
      notes: primarySourceFact?.highValueSources ? ([...primarySourceFact.highValueSources] as string[]) : undefined,
    },
    compare: {
      id: compareRecord?.project_id,
      slug: compareRecord?.slug,
      record: compareRecord,
    },
    relatedContent: {
      news: registryEntry ? matchNewsItems(registryEntry) : [],
      marketNotes: registryEntry ? matchMarketNotes(registryEntry) : [],
    },
    conflicts,
    missingDataFlags: [
      !registryEntry ? "missing-public-registry-entry" : "",
      !sourceFacts.length ? "missing-source-catalog-match" : "",
      !compareRecord ? "missing-compare-row" : "",
    ].filter(Boolean),
    schemaSafety,
    registryEntry: registryEntry ? {
      ...registryEntry,
      notes: registryEntry.notes ?? [],
    } : undefined,
  };
}

export function getProjectIntelligenceSync(identifier: string) {
  return resolveProjectIntelligenceRegistryEntry(identifier);
}
