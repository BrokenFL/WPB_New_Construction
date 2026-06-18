import { projectFacts, siteMeta } from "../generated/siteData.ts";
import { marketNotes, type MarketNote } from "../data/marketNotes.ts";
import {
  projectFactOverrides,
  type ProjectFactFieldKey,
} from "../data/projectFactOverrides.ts";
import {
  listProjectIntelligenceAliases,
  resolveProjectIntelligenceRegistryEntry,
  resolveSourceCatalogProjectId,
  type ProjectIntelligenceRegistryEntry,
} from "./projectIntelligenceRegistry.ts";
import { newsSortTimestamp, publishedExternalNews } from "../data/approvedExternalNews.ts";
import {
  publicBuildingDatabaseByProjectId,
  publicBuildingDatabaseBySlug,
  type PublicBuildingDatabaseItem,
} from "../generated/buildingDatabasePublic.ts";

type SourceFactRecord = (typeof projectFacts)[number];

export type ProjectIntelligenceConflict = {
  field:
    | "status"
    | "delivery"
    | "residenceCount"
    | "address"
    | "priceDisplay"
    | "bedroomRange"
    | "sizeRange"
    | "floorCount"
    | "parking"
    | "storage"
    | "pets"
    | "rentals"
    | "fees"
    | "amenities"
    | "waterfront"
    | "dockage";
  publicValue: string;
  sourceValue?: string;
  compareValue?: string;
  recommendation: "manual_review";
};

export type ProjectIntelligencePriority = 1 | 2 | 3 | 4;

export type ProjectIntelligenceQueueRow = {
  id: string;
  priority: ProjectIntelligencePriority;
  priorityLabel: `Priority ${ProjectIntelligencePriority}`;
  projectSlug: string;
  projectName: string;
  projectRoute: string;
  corridor: string;
  field: string;
  fieldLabel: string;
  issueKind: "schema-impacting" | "buyer-facing" | "missing-compare-row" | "missing-source-mapping" | "split-source-project" | "editorial-drift";
  reason: string;
  publicValue: string;
  compareValue: string;
  sourceValue: string;
  currentWinner: "override" | "compare" | "source" | "public" | "omitted";
  schemaBehavior: "emitted" | "omitted" | "review-only";
  recommendedAction: "review and choose winner" | "add manual override" | "add compare row" | "add source mapping" | "document split-source handling";
  reviewStatus: "clear" | "needs-review" | "manual-override" | "missing-compare" | "missing-source" | "project-level";
  hasManualOverride: boolean;
  hasCompareRow: boolean;
  hasSourceMapping: boolean;
  notes: string[];
};

export type ProjectIntelligenceQueueSummary = {
  totalIssues: number;
  priority1Issues: number;
  priority2Issues: number;
  priority3Issues: number;
  priority4Issues: number;
  missingCompareRows: number;
  missingSourceMappings: number;
  projectsWithMostConflicts: Array<{
    slug: string;
    name: string;
    issueCount: number;
  }>;
};

export type ProjectIntelligenceFieldReview = {
  field: ProjectFactFieldKey;
  label: string;
  scope: "identity" | "buyer";
  publicValue: string;
  sourceValue?: string;
  compareValue?: string;
  overrideValue?: string;
  currentValue: string;
  currentWinner: "override" | "compare" | "source" | "public" | "omitted";
  recommendedWinner: "override" | "compare" | "source" | "public";
  schemaState: "emitted" | "omitted" | "not-emitted";
  schemaSafe: boolean;
  reviewStatus: "clear" | "needs-review" | "manual-override" | "missing-compare" | "missing-source";
  notes: string[];
};

export type ProjectIntelligenceReviewSummary = {
  totalFields: number;
  reviewFields: number;
  buyerFieldReviews: number;
  identityFieldReviews: number;
  manualOverrides: number;
  schemaEmitted: number;
  schemaOmitted: number;
  schemaNotEmitted: number;
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
    record?: PublicBuildingDatabaseItem;
  };
  relatedContent: {
    news: RelatedContentMatch[];
    marketNotes: RelatedContentMatch[];
  };
  conflicts: ProjectIntelligenceConflict[];
  missingDataFlags: string[];
  fieldReviews: ProjectIntelligenceFieldReview[];
  reviewSummary: ProjectIntelligenceReviewSummary;
  schemaSafety: {
    safeFields: Record<string, string>;
    reviewFields: string[];
  };
  registryEntry?: ProjectIntelligenceRegistryEntry;
};

export type SchemaSafeProjectFacts = {
  identity: {
    slug: string;
    route: string;
    displayName: string;
    corridor: string;
    url: string;
  };
  safeFields: {
    name: string;
    route: string;
    url: string;
    corridor: string;
    address?: string;
    status?: string;
    delivery?: string;
    residenceCount?: string;
    compareDatabaseId?: string;
    compareDatabaseSlug?: string;
    sourceCatalogId?: string;
  };
  omittedFields: string[];
  conflictCount: number;
  reviewFields: string[];
};

const sourceFactById = new Map<string, SourceFactRecord>(projectFacts.map((project) => [project.projectId, project]));
const schemaImpactFields = new Set<ProjectFactFieldKey>(["status", "deliveryTiming", "residenceCount", "address"]);
const buyerFacingFields = new Set<ProjectFactFieldKey>([
  "priceDisplay",
  "bedroomRange",
  "sizeRange",
  "fees",
  "parking",
  "storage",
  "rentals",
  "pets",
  "amenities",
  "waterfront",
  "dockage",
]);

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

function normalizeValue(value: string | undefined) {
  const text = value?.trim();
  return text ? text : "";
}

function distinctValues(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => normalizeValue(value)).filter(Boolean))];
}

function firstDefined(...values: Array<string | undefined>) {
  return values.map((value) => normalizeValue(value)).find(Boolean) ?? "";
}

type FieldReviewConfig = {
  field: ProjectFactFieldKey;
  label: string;
  scope: "identity" | "buyer";
  schemaCandidate: boolean;
  publicValue: (entry: ProjectIntelligenceRegistryEntry) => string;
  sourceValue: (source: SourceFactRecord | undefined) => string;
  compareValue: (compare: PublicBuildingDatabaseItem | undefined) => string;
};

const fieldReviewConfigs: FieldReviewConfig[] = [
  {
    field: "status",
    label: "Status",
    scope: "identity",
    schemaCandidate: true,
    publicValue: (entry) => entry.publicStatus,
    sourceValue: (source) => firstDefined(source?.facts?.status, source?.pageStatus),
    compareValue: (compare) => firstDefined(compare?.status_badge, compare?.construction_status, compare?.development_stage),
  },
  {
    field: "deliveryTiming",
    label: "Delivery timing",
    scope: "identity",
    schemaCandidate: true,
    publicValue: (entry) => entry.publicDelivery,
    sourceValue: (source) => firstDefined(source?.facts?.completion),
    compareValue: (compare) => firstDefined(compare?.completion_or_delivery),
  },
  {
    field: "residenceCount",
    label: "Residence count",
    scope: "identity",
    schemaCandidate: true,
    publicValue: (entry) => entry.publicResidenceCount,
    sourceValue: (source) => firstDefined(source?.facts?.residences),
    compareValue: (compare) => firstDefined(compare?.residence_count),
  },
  {
    field: "address",
    label: "Address",
    scope: "identity",
    schemaCandidate: true,
    publicValue: (entry) => entry.publicAddress,
    sourceValue: (source) => firstDefined(source?.facts?.address),
    compareValue: (compare) => firstDefined(compare?.public_address),
  },
  {
    field: "priceDisplay",
    label: "Price display",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.price_display),
  },
  {
    field: "bedroomRange",
    label: "Bedroom range",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.bedroom_range_display),
  },
  {
    field: "sizeRange",
    label: "Square footage range",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.size_range_display),
  },
  {
    field: "floorCount",
    label: "Floor count",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: (source) => firstDefined(source?.facts?.stories),
    compareValue: (compare) => firstDefined(compare?.floor_count),
  },
  {
    field: "parking",
    label: "Parking",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.parking_summary),
  },
  {
    field: "storage",
    label: "Storage",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.storage_summary),
  },
  {
    field: "pets",
    label: "Pets",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.pet_summary),
  },
  {
    field: "rentals",
    label: "Rental policy",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.rental_policy_summary),
  },
  {
    field: "fees",
    label: "Fees / maintenance",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.maintenance_per_sqft, compare?.buyer_cost_notes),
  },
  {
    field: "amenities",
    label: "Amenities",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.amenity_summary, compare?.amenity_highlights),
  },
  {
    field: "waterfront",
    label: "Waterfront",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.waterfront_status),
  },
  {
    field: "dockage",
    label: "Dockage / marina",
    scope: "buyer",
    schemaCandidate: false,
    publicValue: () => "",
    sourceValue: () => "",
    compareValue: (compare) => firstDefined(compare?.boating_or_marina_summary),
  },
];

function getProjectFactOverride(identifier: string, field: ProjectFactFieldKey) {
  const registryEntry = resolveProjectIntelligenceRegistryEntry(identifier);
  const slug = registryEntry?.publicSlug ?? identifier.trim();
  return projectFactOverrides.projects[slug]?.[field];
}

function buildFieldReviews(
  registryEntry: ProjectIntelligenceRegistryEntry,
  sourceFacts: SourceFactRecord[],
  compareRecord: PublicBuildingDatabaseItem | undefined,
): ProjectIntelligenceFieldReview[] {
  const sourceFact = sourceFacts[0];
  return fieldReviewConfigs.map((config) => {
    const override = getProjectFactOverride(registryEntry.publicSlug, config.field);
    const publicValue = normalizeValue(config.publicValue(registryEntry));
    const sourceValue = normalizeValue(config.sourceValue(sourceFact));
    const compareValue = normalizeValue(config.compareValue(compareRecord));
    const distinct = distinctValues([override?.value, compareValue, sourceValue, publicValue]);
    const hasConflict = distinct.length > 1;
    const isIdentity = config.scope === "identity";
    const currentWinner = override?.value
      ? "override"
      : config.scope === "buyer"
        ? compareValue
          ? "compare"
          : sourceValue
            ? "source"
            : publicValue
              ? "public"
              : "omitted"
        : publicValue
          ? "public"
          : sourceValue
            ? "source"
            : compareValue
              ? "compare"
              : "omitted";
    const currentValue = normalizeValue(
      currentWinner === "override"
        ? override?.value
        : currentWinner === "compare"
          ? compareValue
          : currentWinner === "source"
            ? sourceValue
            : currentWinner === "public"
              ? publicValue
              : "",
    );
    const recommendedWinner = override?.value
      ? "override"
      : config.scope === "buyer"
        ? compareValue
          ? "compare"
          : sourceValue
            ? "source"
            : publicValue
              ? "public"
              : "public"
        : publicValue
          ? "public"
          : sourceValue
            ? "source"
            : compareValue
              ? "compare"
              : "public";
    const schemaSafe = Boolean(
      override?.schemaSafe ||
        (config.schemaCandidate &&
          currentWinner === "public" &&
          !hasConflict &&
          Boolean(publicValue)),
    );
    const schemaState: ProjectIntelligenceFieldReview["schemaState"] = config.schemaCandidate
      ? schemaSafe
        ? "emitted"
        : "omitted"
      : "not-emitted";
    const reviewStatus: ProjectIntelligenceFieldReview["reviewStatus"] = override?.value
      ? "manual-override"
      : hasConflict
        ? "needs-review"
        : "clear";

    return {
      field: config.field,
      label: config.label,
      scope: config.scope,
      publicValue,
      sourceValue: sourceValue || undefined,
      compareValue: compareValue || undefined,
      overrideValue: override?.value,
      currentValue,
      currentWinner,
      recommendedWinner,
      schemaState,
      schemaSafe,
      reviewStatus,
      notes: [
        hasConflict ? "Values differ across layers." : "",
        isIdentity && !compareValue ? "Compare row does not provide this field." : "",
        override?.note ?? "",
      ].filter(Boolean),
    };
  });
}

function buildReviewSummary(fieldReviews: ProjectIntelligenceFieldReview[]): ProjectIntelligenceReviewSummary {
  return {
    totalFields: fieldReviews.length,
    reviewFields: fieldReviews.filter((field) => field.reviewStatus !== "clear").length,
    buyerFieldReviews: fieldReviews.filter((field) => field.scope === "buyer" && field.reviewStatus !== "clear").length,
    identityFieldReviews: fieldReviews.filter((field) => field.scope === "identity" && field.reviewStatus !== "clear").length,
    manualOverrides: fieldReviews.filter((field) => field.reviewStatus === "manual-override").length,
    schemaEmitted: fieldReviews.filter((field) => field.schemaState === "emitted").length,
    schemaOmitted: fieldReviews.filter((field) => field.schemaState === "omitted").length,
    schemaNotEmitted: fieldReviews.filter((field) => field.schemaState === "not-emitted").length,
  };
}

function queuePriorityLabel(priority: ProjectIntelligencePriority) {
  return `Priority ${priority}` as const;
}

function queueSchemaBehavior(field: ProjectIntelligenceFieldReview) {
  return field.schemaState === "emitted" ? "emitted" : field.schemaState === "omitted" ? "omitted" : "review-only";
}

function queuePriorityForField(field: ProjectIntelligenceFieldReview): ProjectIntelligencePriority {
  if (schemaImpactFields.has(field.field)) return 1;
  if (buyerFacingFields.has(field.field)) return 2;
  return 4;
}

function queueIssueKindForField(field: ProjectIntelligenceFieldReview): ProjectIntelligenceQueueRow["issueKind"] {
  if (schemaImpactFields.has(field.field)) return "schema-impacting";
  if (buyerFacingFields.has(field.field)) return "buyer-facing";
  return "editorial-drift";
}

function queueRecommendedActionForField(field: ProjectIntelligenceFieldReview, priority: ProjectIntelligencePriority) {
  if (priority === 1) return field.overrideValue ? "review and choose winner" : "add manual override";
  return "review and choose winner";
}

function queueReasonForField(field: ProjectIntelligenceFieldReview) {
  const notes = [...field.notes];
  if (field.reviewStatus === "manual-override") notes.unshift("Brooke override is set.");
  else if (field.reviewStatus === "needs-review") notes.unshift("Values differ across layers.");
  if (schemaImpactFields.has(field.field) && field.schemaState !== "emitted") notes.push("Omitted from JSON-LD until Brooke marks it safe.");
  if (buyerFacingFields.has(field.field) && field.compareValue) notes.push("Compare remains the preferred buyer-fact source.");
  return [...new Set(notes)].join(" ");
}

function queueRowsForProject(project: ProjectIntelligence): ProjectIntelligenceQueueRow[] {
  const rows: ProjectIntelligenceQueueRow[] = [];
  const hasCompareRow = Boolean(project.compare.record);
  const hasSourceMapping = Boolean(project.sourceCatalog.ids.length);

  for (const field of project.fieldReviews) {
    if (field.reviewStatus === "clear") continue;
    const priority = queuePriorityForField(field);
    rows.push({
      id: `${project.publicIdentity.slug}:${field.field}`,
      priority,
      priorityLabel: queuePriorityLabel(priority),
      projectSlug: project.publicIdentity.slug,
      projectName: project.publicIdentity.displayName,
      projectRoute: project.publicIdentity.route,
      corridor: project.publicIdentity.corridor,
      field: field.field,
      fieldLabel: field.label,
      issueKind: queueIssueKindForField(field),
      reason: queueReasonForField(field),
      publicValue: field.publicValue || "—",
      compareValue: field.compareValue || "—",
      sourceValue: field.sourceValue || "—",
      currentWinner: field.currentWinner,
      schemaBehavior: queueSchemaBehavior(field),
      recommendedAction: queueRecommendedActionForField(field, priority),
      reviewStatus: field.reviewStatus,
      hasManualOverride: field.reviewStatus === "manual-override",
      hasCompareRow,
      hasSourceMapping,
      notes: field.notes,
    });
  }

  if (!hasCompareRow) {
    rows.push({
      id: `${project.publicIdentity.slug}:missing-compare-row`,
      priority: 3,
      priorityLabel: queuePriorityLabel(3),
      projectSlug: project.publicIdentity.slug,
      projectName: project.publicIdentity.displayName,
      projectRoute: project.publicIdentity.route,
      corridor: project.publicIdentity.corridor,
      field: "compare-row",
      fieldLabel: "Compare row",
      issueKind: "missing-compare-row",
      reason: "Public project has no compare row.",
      publicValue: project.publicIdentity.displayName,
      compareValue: "Missing compare row",
      sourceValue: project.sourceCatalog.ids.join(", ") || "—",
      currentWinner: "omitted",
      schemaBehavior: "review-only",
      recommendedAction: "add compare row",
      reviewStatus: "project-level",
      hasManualOverride: false,
      hasCompareRow,
      hasSourceMapping,
      notes: ["Compare database row is missing for this public project."],
    });
  }

  if (!hasSourceMapping) {
    rows.push({
      id: `${project.publicIdentity.slug}:missing-source-mapping`,
      priority: 3,
      priorityLabel: queuePriorityLabel(3),
      projectSlug: project.publicIdentity.slug,
      projectName: project.publicIdentity.displayName,
      projectRoute: project.publicIdentity.route,
      corridor: project.publicIdentity.corridor,
      field: "source-mapping",
      fieldLabel: "Source mapping",
      issueKind: "missing-source-mapping",
      reason: "Public project has no source-catalog mapping.",
      publicValue: project.publicIdentity.displayName,
      compareValue: project.compare.slug || project.compare.id || "—",
      sourceValue: "Missing source mapping",
      currentWinner: "omitted",
      schemaBehavior: "review-only",
      recommendedAction: "add source mapping",
      reviewStatus: "project-level",
      hasManualOverride: false,
      hasCompareRow,
      hasSourceMapping,
      notes: ["Source catalog mapping is missing for this public project."],
    });
  }

  if (project.registryEntry?.collapsedSourceCatalogIds?.length || project.sourceCatalog.ids.length > 1) {
    rows.push({
      id: `${project.publicIdentity.slug}:split-source-handling`,
      priority: 3,
      priorityLabel: queuePriorityLabel(3),
      projectSlug: project.publicIdentity.slug,
      projectName: project.publicIdentity.displayName,
      projectRoute: project.publicIdentity.route,
      corridor: project.publicIdentity.corridor,
      field: "split-source-handling",
      fieldLabel: "Split-source handling",
      issueKind: "split-source-project",
      reason: "Multiple source-catalog records are collapsed into one public page.",
      publicValue: project.publicIdentity.displayName,
      compareValue: project.compare.slug || project.compare.id || "—",
      sourceValue: project.sourceCatalog.ids.join(", "),
      currentWinner: "omitted",
      schemaBehavior: "review-only",
      recommendedAction: "document split-source handling",
      reviewStatus: "project-level",
      hasManualOverride: false,
      hasCompareRow,
      hasSourceMapping,
      notes: ["Collapsed source-catalog records need documented handling."],
    });
  }

  if (!project.relatedContent.news.length && !project.relatedContent.marketNotes.length) {
    rows.push({
      id: `${project.publicIdentity.slug}:related-content-gap`,
      priority: 4,
      priorityLabel: queuePriorityLabel(4),
      projectSlug: project.publicIdentity.slug,
      projectName: project.publicIdentity.displayName,
      projectRoute: project.publicIdentity.route,
      corridor: project.publicIdentity.corridor,
      field: "related-content",
      fieldLabel: "Related content",
      issueKind: "editorial-drift",
      reason: "No related news or market-note matches yet.",
      publicValue: project.publicIdentity.displayName,
      compareValue: "0 related items",
      sourceValue: [...(project.sourceCatalog.notes ?? []), ...(project.sourceCatalog.gaps ?? [])].join(", ") || "No source notes",
      currentWinner: "omitted",
      schemaBehavior: "review-only",
      recommendedAction: "review and choose winner",
      reviewStatus: "project-level",
      hasManualOverride: false,
      hasCompareRow,
      hasSourceMapping,
      notes: ["Project has no related content matches in the current resolver."],
    });
  }

  return rows;
}

export function buildProjectIntelligenceReviewQueue(items: ProjectIntelligence[]): {
  rows: ProjectIntelligenceQueueRow[];
  summary: ProjectIntelligenceQueueSummary;
} {
  const rows = items.flatMap((item) => queueRowsForProject(item));
  rows.sort((a, b) => a.priority - b.priority || a.projectName.localeCompare(b.projectName) || a.fieldLabel.localeCompare(b.fieldLabel));

  const issueCounts = new Map<string, { slug: string; name: string; issueCount: number }>();
  for (const row of rows) {
    const existing = issueCounts.get(row.projectSlug);
    if (existing) existing.issueCount += 1;
    else issueCounts.set(row.projectSlug, { slug: row.projectSlug, name: row.projectName, issueCount: 1 });
  }

  const summary: ProjectIntelligenceQueueSummary = {
    totalIssues: rows.length,
    priority1Issues: rows.filter((row) => row.priority === 1).length,
    priority2Issues: rows.filter((row) => row.priority === 2).length,
    priority3Issues: rows.filter((row) => row.priority === 3).length,
    priority4Issues: rows.filter((row) => row.priority === 4).length,
    missingCompareRows: rows.filter((row) => row.issueKind === "missing-compare-row").length,
    missingSourceMappings: rows.filter((row) => row.issueKind === "missing-source-mapping").length,
    projectsWithMostConflicts: [...issueCounts.values()]
      .sort((a, b) => b.issueCount - a.issueCount || a.name.localeCompare(b.name))
      .slice(0, 5),
  };

  return { rows, summary };
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
  registryEntry: ProjectIntelligenceRegistryEntry,
  publicIdentity: ProjectIntelligence["publicIdentity"],
  sourceFacts: SourceFactRecord[],
  compareRecord: PublicBuildingDatabaseItem | undefined,
): ProjectIntelligenceConflict[] {
  const sourceFact = sourceFacts[0];
  const source = sourceFact?.facts;
  const sourceStatus = source?.status ?? sourceFact?.pageStatus;
  const sourceDelivery = source?.completion;
  const sourceResidences = source?.residences;
  const compareStatus = compareRecord?.status_badge;
  const compareDelivery = compareRecord?.completion_or_delivery;
  const compareResidences = compareRecord?.residence_count;
  const compareAddress = compareRecord?.public_address;
  const hasOverride = (field: ProjectFactFieldKey) => Boolean(getProjectFactOverride(registryEntry.publicSlug, field)?.value);

  const conflicts: ProjectIntelligenceConflict[] = [];

  if (!hasOverride("status") && sourceStatus && normalizeStatus(sourceStatus) && normalizeStatus(sourceStatus) !== normalizeStatus(publicIdentity.status)) {
    conflicts.push({
      field: "status",
      publicValue: publicIdentity.status,
      sourceValue: sourceStatus,
      compareValue: compareStatus,
      recommendation: "manual_review",
    });
  } else if (!hasOverride("status") && compareStatus && normalizeStatus(compareStatus) && normalizeStatus(compareStatus) !== normalizeStatus(publicIdentity.status)) {
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
  if (!hasOverride("deliveryTiming") && publicYear && [sourceYear, compareYear].filter((value): value is string => Boolean(value)).some((year) => year !== publicYear)) {
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
    !hasOverride("residenceCount") &&
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

  const sourceAddress = source?.address;
  if (
    !hasOverride("address") &&
    publicIdentity.address &&
    distinctValues([publicIdentity.address, sourceAddress, compareAddress]).length > 1
  ) {
    conflicts.push({
      field: "address",
      publicValue: publicIdentity.address,
      sourceValue: sourceAddress,
      compareValue: compareAddress,
      recommendation: "manual_review",
    });
  }

  return conflicts;
}

function buildSchemaSafety(
  entry: ProjectIntelligenceRegistryEntry,
  sourceFacts: SourceFactRecord[],
  compareRecord: PublicBuildingDatabaseItem | undefined,
  fieldReviews: ProjectIntelligenceFieldReview[],
) {
  const safeFields: Record<string, string> = {
    name: entry.publicDisplayName,
    route: entry.publicRoute,
    url: `https://www.wpbnewconstruction.com${entry.publicRoute}`,
    corridor: entry.corridor,
    pageStatus: entry.publicStatus,
  };
  const schemaFields = new Map(fieldReviews.map((field) => [field.field, field] as const));
  const schemaReviewFields = ["status", "deliveryTiming", "residenceCount", "address"] as const;
  const reviewFields = new Set<string>();

  const statusReview = schemaFields.get("status");
  if (statusReview?.schemaState === "emitted") safeFields.status = statusReview.currentValue;
  else reviewFields.add("status");

  const deliveryReview = schemaFields.get("deliveryTiming");
  if (deliveryReview?.schemaState === "emitted") safeFields.delivery = deliveryReview.currentValue;
  else reviewFields.add("delivery");

  const residenceReview = schemaFields.get("residenceCount");
  if (residenceReview?.schemaState === "emitted") safeFields.residenceCount = residenceReview.currentValue;
  else reviewFields.add("residenceCount");

  const addressReview = schemaFields.get("address");
  if (addressReview?.schemaState === "emitted") safeFields.address = addressReview.currentValue;
  else reviewFields.add("address");

  for (const item of schemaReviewFields) {
    const review = schemaFields.get(item);
    if (!review || review.schemaState !== "emitted") {
      reviewFields.add(item === "deliveryTiming" ? "delivery" : item);
    }
  }
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

function resolveStaticCompareRecord(identifier: string) {
  const normalized = identifier.trim();
  if (!normalized) return undefined;
  const registryEntry = resolveProjectIntelligenceRegistryEntry(normalized);
  const compareId = registryEntry?.compareDatabaseId ?? normalized;
  const compareSlug = registryEntry?.compareDatabaseSlug ?? normalized;
  return (
    publicBuildingDatabaseByProjectId[compareId] ??
    publicBuildingDatabaseBySlug[compareSlug] ??
    publicBuildingDatabaseByProjectId[normalized] ??
    publicBuildingDatabaseBySlug[normalized] ??
    publicBuildingDatabaseByProjectId[registryEntry?.publicSlug ?? ""] ??
    publicBuildingDatabaseBySlug[registryEntry?.publicSlug ?? ""]
  );
}

function buildSchemaSafeProjectFacts(
  registryEntry: ProjectIntelligenceRegistryEntry,
  fieldReviews: ProjectIntelligenceFieldReview[],
): SchemaSafeProjectFacts {
  const safeFields: SchemaSafeProjectFacts["safeFields"] = {
    name: registryEntry.publicDisplayName,
    route: registryEntry.publicRoute,
    url: `${siteMeta.baseUrl}${registryEntry.publicRoute}`,
    corridor: registryEntry.corridor,
  };
  const omittedFields = new Set<string>();
  const schemaFields = new Map(fieldReviews.map((field) => [field.field, field] as const));
  const schemaReviewFields = new Set(["status", "deliveryTiming", "residenceCount", "address"]);
  const reviewFields = new Set<string>(
    fieldReviews
      .filter((field) => schemaReviewFields.has(field.field) && field.schemaState !== "emitted")
      .map((field) => field.field),
  );

  const emittedStatus = schemaFields.get("status");
  if (emittedStatus?.schemaState === "emitted") safeFields.status = emittedStatus.currentValue;
  else omittedFields.add("status");

  const emittedDelivery = schemaFields.get("deliveryTiming");
  if (emittedDelivery?.schemaState === "emitted") safeFields.delivery = emittedDelivery.currentValue;
  else omittedFields.add("delivery");

  const emittedResidences = schemaFields.get("residenceCount");
  if (emittedResidences?.schemaState === "emitted") safeFields.residenceCount = emittedResidences.currentValue;
  else omittedFields.add("residenceCount");

  const emittedAddress = schemaFields.get("address");
  if (emittedAddress?.schemaState === "emitted") safeFields.address = emittedAddress.currentValue;
  else omittedFields.add("address");

  if (registryEntry.compareDatabaseId) safeFields.compareDatabaseId = registryEntry.compareDatabaseId;
  if (registryEntry.compareDatabaseSlug) safeFields.compareDatabaseSlug = registryEntry.compareDatabaseSlug;
  if (registryEntry.sourceCatalogIds[0]) safeFields.sourceCatalogId = registryEntry.sourceCatalogIds[0];

  return {
    identity: {
      slug: registryEntry.publicSlug,
      route: registryEntry.publicRoute,
      displayName: registryEntry.publicDisplayName,
      corridor: registryEntry.corridor,
      url: `${siteMeta.baseUrl}${registryEntry.publicRoute}`,
    },
    safeFields,
    omittedFields: [...omittedFields],
    conflictCount: fieldReviews.filter((field) => field.reviewStatus === "needs-review").length,
    reviewFields: [...reviewFields],
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

  const compareRecord = resolveStaticCompareRecord(identifier);

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
  const fieldReviews = registryEntry ? buildFieldReviews(registryEntry, sourceFacts, compareRecord) : [];
  const conflicts = registryEntry ? buildConflictList(registryEntry, publicIdentity, sourceFacts, compareRecord) : [];
  const schemaSafety = registryEntry ? buildSchemaSafety(registryEntry, sourceFacts, compareRecord, fieldReviews) : buildSchemaSafeProjectFacts({
    publicSlug: publicIdentity.slug,
    publicRoute: publicIdentity.route,
    publicDisplayName: publicIdentity.displayName,
    corridor: publicIdentity.corridor,
    publicStatus: publicIdentity.status,
    publicDelivery: publicIdentity.delivery,
    publicResidenceCount: publicIdentity.residenceCount,
    publicAddress: publicIdentity.address,
    sourceCatalogIds: sourceCatalog.ids,
  }, fieldReviews);

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
    fieldReviews,
    reviewSummary: buildReviewSummary(fieldReviews),
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

export function getSchemaSafeProjectFacts(identifier: string): SchemaSafeProjectFacts {
  const registryEntry = resolveProjectIntelligenceRegistryEntry(identifier);
  if (!registryEntry) {
    const slug = identifier.trim();
    return {
      identity: {
        slug,
        route: `/projects/${slug}/`,
        displayName: slug,
        corridor: "Verify",
        url: `${siteMeta.baseUrl}/projects/${slug}/`,
      },
      safeFields: {
        name: slug,
        route: `/projects/${slug}/`,
        url: `${siteMeta.baseUrl}/projects/${slug}/`,
        corridor: "Verify",
      },
      omittedFields: ["registry"],
      conflictCount: 0,
      reviewFields: ["registry"],
    };
  }

  const compareRecord = resolveStaticCompareRecord(identifier);
  const sourceFacts = registryEntry.sourceCatalogIds
    .map((projectId) => sourceFactById.get(projectId))
    .filter((fact): fact is SourceFactRecord => Boolean(fact));
  const fieldReviews = buildFieldReviews(registryEntry, sourceFacts, compareRecord);
  return buildSchemaSafeProjectFacts(registryEntry, fieldReviews);
}
