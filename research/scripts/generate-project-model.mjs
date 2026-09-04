#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const canonicalPath = path.join(workspace, "research/source-material-review/wpb-projects-canonical-v3-planning-update.json");
const decisionsPath = path.join(workspace, "content/project-identity-decisions.json");
const overlaysPath = path.join(workspace, "content/project-page-overlays.json");
const generatedTsPath = path.join(workspace, "src/generated/projectModel.ts");
const generatedJsonPath = path.join(workspace, "src/generated/projectModel.json");
const generatedPublicTsPath = path.join(workspace, "src/generated/projectModelPublic.ts");
const generatedPublicJsonPath = path.join(workspace, "src/generated/projectModelPublic.json");
const checkOnly = process.argv.includes("--check");

const canonical = readJson(canonicalPath);
const decisions = readJson(decisionsPath);
const overlays = readJson(overlaysPath);
const errors = [];

if (!Array.isArray(canonical.projects)) errors.push("Canonical project snapshot must contain a projects array.");
if (!Array.isArray(decisions.projects)) errors.push("Project identity decisions must contain a projects array.");
if (!Array.isArray(overlays.projects)) errors.push("Project page overlays must contain a projects array.");

const canonicalById = new Map((canonical.projects ?? []).map((project) => [project.project_id, project]));
const overlayBySlug = new Map((overlays.projects ?? []).map((project) => [project.publicSlug, project]));
const seenCanonicalIds = new Set();
const seenPublicSlugs = new Set();
const aliasOwners = new Map();

const projects = (decisions.projects ?? []).map((decision) => {
  if (!decision.canonicalId) errors.push("A project identity decision is missing canonicalId.");
  if (seenCanonicalIds.has(decision.canonicalId)) errors.push(`Duplicate canonicalId: ${decision.canonicalId}`);
  seenCanonicalIds.add(decision.canonicalId);

  if (decision.publicationState !== "retired_merged") {
    if (!decision.publicSlug) errors.push(`${decision.canonicalId}: missing publicSlug.`);
    if (seenPublicSlugs.has(decision.publicSlug)) errors.push(`Duplicate publicSlug: ${decision.publicSlug}`);
    seenPublicSlugs.add(decision.publicSlug);
  }

  const canonicalProject = canonicalById.get(decision.canonicalId);
  const candidate = decision.candidateFacts ?? {};
  const overlay = overlayBySlug.get(decision.publicSlug);
  const fallback = overlay?.approvedFallback ?? {};
  const fieldSources = {};
  const pick = (field, canonicalValue, candidateValue, fallbackValue) => {
    if (hasValue(canonicalValue)) {
      fieldSources[field] = "canonical";
      return String(canonicalValue);
    }
    if (hasValue(candidateValue)) {
      fieldSources[field] = "candidate";
      return String(candidateValue);
    }
    if (hasValue(fallbackValue)) {
      fieldSources[field] = "approved_fallback";
      return String(fallbackValue);
    }
    fieldSources[field] = "missing";
    return "";
  };

  const aliases = unique([
    decision.publicSlug,
    `/projects/${decision.publicSlug}/`,
    decision.canonicalId,
    decision.compareDatabaseId,
    decision.compareDatabaseSlug,
    ...(decision.aliases ?? []),
    ...(decision.sourceCatalogIds ?? []),
    ...(decision.collapsedSourceCatalogIds ?? []),
  ]);

  for (const alias of aliases) {
    if (decision.publicationState === "retired_merged") continue;
    const owner = aliasOwners.get(alias);
    if (owner && owner !== decision.publicSlug) errors.push(`Alias ${alias} belongs to both ${owner} and ${decision.publicSlug}.`);
    aliasOwners.set(alias, decision.publicSlug);
  }

  if (decision.publicationState === "published" && !canonicalProject) {
    errors.push(`${decision.canonicalId}: published project is missing from the canonical snapshot.`);
  }
  if (decision.publicationState === "published" && !overlay) {
    errors.push(`${decision.canonicalId}: published project is missing a page overlay.`);
  }
  if (decision.publicationState === "awaiting_imagery" && overlay) {
    errors.push(`${decision.canonicalId}: awaiting-imagery project must not have a page overlay yet.`);
  }

  const humanReviewRequired = canonicalProject?.human_review_required === true || candidate.humanReviewRequired === true;
  const conflicts = unique([...(canonicalProject?.key_conflicts ?? []), ...(candidate.conflicts ?? [])]);

  return {
    canonicalId: decision.canonicalId,
    publicSlug: decision.publicSlug,
    publicRoute: decision.publicationState === "published" ? `/projects/${decision.publicSlug}/` : "",
    corridorKey: decision.corridorKey,
    corridor: corridorLabel(decision.corridorKey),
    publicationState: decision.publicationState,
    displayName: pick("displayName", canonicalProject?.display_name, candidate.displayName, fallback.displayName),
    status: pick("status", canonicalProject?.status_badge, candidate.status, fallback.status),
    delivery: pick("delivery", canonicalProject?.delivery_display, candidate.delivery, fallback.delivery),
    residences: pick("residences", canonicalProject?.public_residence_count, candidate.residences, fallback.residences),
    price: pick("price", canonicalProject?.price_display, candidate.price, fallback.price),
    address: pick("address", canonicalProject?.public_address, candidate.address, fallback.address),
    developmentStage: canonicalProject?.development_stage || candidate.developmentStage || "",
    pageType: canonicalProject?.page_type || candidate.pageType || "",
    siteGroup: canonicalProject?.site_group || candidate.siteGroup || "",
    sourceCatalogIds: decision.sourceCatalogIds ?? [],
    compareDatabaseId: decision.compareDatabaseId ?? "",
    compareDatabaseSlug: decision.compareDatabaseSlug ?? "",
    lastVerifiedDate: decision.lastVerifiedDate ?? decisions.reviewedAt,
    aliases,
    collapsedSourceCatalogIds: decision.collapsedSourceCatalogIds ?? [],
    mergedInto: decision.mergedInto ?? "",
    humanReviewRequired,
    confidenceLevel: canonicalProject?.confidence_level || "",
    conflicts,
    schemaBlockedFields: decision.schemaBlockedFields ?? [],
    gaps: canonicalProject?.missing_or_unconfirmed ? [canonicalProject.missing_or_unconfirmed] : [],
    sourceUrls: canonicalProject?.source_urls ?? [],
    fieldSources,
    presentation: overlay
      ? {
          rank: overlay.rank,
          deliveryYear: overlay.deliveryYear,
          longitude: overlay.longitude,
          latitude: overlay.latitude,
          summary: overlay.summary,
          floorplans: overlay.floorplans,
          pageState: overlay.pageState,
          image: overlay.image ?? "",
          heroImage: overlay.heroImage ?? "",
          mobileImage: overlay.mobileImage ?? "",
          galleryImages: overlay.galleryImages ?? [],
        }
      : null,
  };
});

const activeProjects = projects.filter((project) => project.publicationState !== "retired_merged");
const publishedProjects = activeProjects.filter((project) => project.publicationState === "published");
const awaitingImageryProjects = activeProjects.filter((project) => project.publicationState === "awaiting_imagery");
const retiredProjects = projects.filter((project) => project.publicationState === "retired_merged");

for (const overlay of overlays.projects ?? []) {
  if (!publishedProjects.some((project) => project.publicSlug === overlay.publicSlug)) {
    errors.push(`Page overlay ${overlay.publicSlug} is not attached to a published canonical project.`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ projectModel: "fail", errors }, null, 2));
  process.exit(1);
}

const output = {
  version: 1,
  reviewedAt: decisions.reviewedAt,
  precedence: ["reviewed_override", "structured_source", "approved_fallback"],
  projects: activeProjects,
  retiredProjects,
};
const publicProjects = publishedProjects.map((project) => ({
  publicSlug: project.publicSlug,
  publicRoute: project.publicRoute,
  corridorKey: project.corridorKey,
  corridor: project.corridor,
  displayName: project.displayName,
  projectType: publicProjectType(project),
  status: project.status,
  delivery: project.delivery,
  residences: project.residences,
  price: project.price,
  facts: {
    projectAddress: project.address,
    salesGalleryAddress: "",
    mailingAddress: "",
    planningParcelAddress: "",
    canonicalResidenceCount: project.residences,
    historicalResidenceCounts: [],
    expectedDeliveryCurrent: project.delivery,
    priorDeliveryGuidance: [],
    stories: String(canonicalById.get(project.canonicalId)?.floor_count_display ?? ""),
    projectTeam: unique([
      ...(canonicalById.get(project.canonicalId)?.developer ?? []),
      ...(canonicalById.get(project.canonicalId)?.architect ?? []),
      ...(canonicalById.get(project.canonicalId)?.interior_designer ?? []),
      ...(canonicalById.get(project.canonicalId)?.construction_team ?? []),
    ]),
    amenitySummary: canonicalById.get(project.canonicalId)?.amenity_summary ?? "",
    residenceFeatures: canonicalById.get(project.canonicalId)?.residence_features ?? [],
    neighborhoodContext: canonicalById.get(project.canonicalId)?.neighborhood ?? "",
    factEffectiveDate: project.lastVerifiedDate,
    lastVerifiedDate: project.lastVerifiedDate,
    sourcePriority: project.fieldSources,
  },
  sourceUrls: project.sourceUrls.filter(isPublicHttpUrl),
  lookupAliases: unique([
    project.publicSlug,
    project.publicRoute,
    project.compareDatabaseId,
    project.compareDatabaseSlug,
  ]),
  compareDatabaseId: project.compareDatabaseId,
  compareDatabaseSlug: project.compareDatabaseSlug,
  presentation: project.presentation,
}));
const publicOutput = {
  version: 1,
  lastVerifiedDate: decisions.reviewedAt,
  projects: publicProjects,
};
const ts = `// Generated by research/scripts/generate-project-model.mjs. Do not edit directly.\n\nexport const canonicalProjectModel = ${JSON.stringify(output, null, 2)} as const;\n\nexport const generatedProjectRegistryEntries = canonicalProjectModel.projects;\n\nexport const generatedPublishedProjectRecords = canonicalProjectModel.projects.filter((project) => project.publicationState === \"published\");\n`;
const json = `${JSON.stringify(output, null, 2)}\n`;
const publicTs = `// Generated by research/scripts/generate-project-model.mjs. Do not edit directly.\n// Public runtime projection: only explicitly allowlisted buyer-facing fields are emitted.\n\nexport const publicProjectModel = ${JSON.stringify(publicOutput, null, 2)} as const;\n\nexport const publicProjectRecords = publicProjectModel.projects;\n`;
const publicJson = `${JSON.stringify(publicOutput, null, 2)}\n`;

if (checkOnly) {
  compareGenerated(generatedTsPath, ts);
  compareGenerated(generatedJsonPath, json);
  compareGenerated(generatedPublicTsPath, publicTs);
  compareGenerated(generatedPublicJsonPath, publicJson);
} else {
  fs.mkdirSync(path.dirname(generatedTsPath), { recursive: true });
  fs.mkdirSync(path.dirname(generatedJsonPath), { recursive: true });
  fs.writeFileSync(generatedTsPath, ts);
  fs.writeFileSync(generatedJsonPath, json);
  fs.writeFileSync(generatedPublicTsPath, publicTs);
  fs.writeFileSync(generatedPublicJsonPath, publicJson);
}

console.log(JSON.stringify({
  projectModel: checkOnly ? "checked" : "generated",
  published: publishedProjects.length,
  awaitingImagery: awaitingImageryProjects.map((project) => project.publicSlug),
  retiredMerged: retiredProjects.map((project) => ({ id: project.canonicalId, mergedInto: project.mergedInto })),
}, null, 2));

function compareGenerated(filePath, expected) {
  if (!fs.existsSync(filePath)) {
    errors.push(`${path.relative(workspace, filePath)} is missing. Run the generator.`);
    return;
  }
  if (fs.readFileSync(filePath, "utf8") !== expected) {
    console.error(`${path.relative(workspace, filePath)} is stale. Run npm run research:project-model.`);
    process.exit(1);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function corridorLabel(key) {
  return {
    "north-flagler": "North Flagler",
    downtown: "Downtown",
    "south-flagler": "South Flagler",
    "south-end": "South End / South Dixie",
    "palm-beach": "Palm Beach",
  }[key] ?? key;
}

function publicProjectType(project) {
  const text = [
    project.displayName,
    project.status,
    project.developmentStage,
    project.pageType,
    project.siteGroup,
  ].join(" ").toLowerCase();
  if (/office/.test(text)) return "office";
  if (/rental|apartment/.test(text)) return "rental";
  if (/hotel/.test(text)) return "hotel-residences";
  if (/completed|delivered|comp/.test(text)) return "completed-comparable";
  if (/assemblage|mixed.use|district|redevelopment/.test(text)) return "mixed-use";
  if (/planning|watch|pipeline|proposed|announced|approved/.test(text)) return "condo-pipeline";
  return "condo-active-sales";
}

function isPublicHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
