#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "csv-parse/sync";
import {
  projectIntelligenceRegistryEntries,
  resolveProjectIntelligenceRegistryEntry,
} from "../../src/lib/projectIntelligenceRegistry.ts";

const workspace = process.cwd();
const args = process.argv.slice(2);
const sourceArg = valueAfter("--source");
const currentArg = valueAfter("--current");
const reportArg = valueAfter("--report");
const strict = args.includes("--strict");
const printJson = args.includes("--json");

const currentPath = path.resolve(
  workspace,
  currentArg || "content/wpb_new_construction_building_database_cleaned.csv",
);
const sourcePath = sourceArg ? path.resolve(workspace, sourceArg) : "";
const reportPath = path.resolve(
  workspace,
  reportArg || ".runtime/reports/proposed-building-master-reconciliation.json",
);
const canonicalPath = path.join(
  workspace,
  "research/source-material-review/wpb-projects-canonical-v3-planning-update.json",
);
const sourceCatalogPath = path.join(
  workspace,
  "research/source-material-review/project-source-catalog.json",
);
const decisionsPath = path.join(workspace, "content/project-identity-decisions.json");

const requiredFields = ["project_id", "display_name", "slug"];
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const booleanFields = ["human_review_required"];
const dateFields = ["last_reviewed_at"];
const sourceUrlField = "source_urls";
const identityStopWords = new Set([
  "a",
  "and",
  "at",
  "beach",
  "condo",
  "condominium",
  "development",
  "florida",
  "of",
  "on",
  "project",
  "residence",
  "residences",
  "the",
  "west",
  "wpb",
]);

export function parseCsvSnapshot(csvText) {
  const headers = parse(csvText, {
    bom: true,
    to_line: 1,
    record_delimiter: ["\r\n", "\n"],
  })[0] ?? [];
  const parseOptions = {
    bom: true,
    columns: true,
    relax_column_count: false,
    skip_empty_lines: true,
    trim: false,
    record_delimiter: ["\r\n", "\n"],
  };
  const parseErrors = [];
  let parsedRecords;
  try {
    parsedRecords = parse(csvText, parseOptions);
  } catch (error) {
    if (!["CSV_INVALID_CLOSING_QUOTE", "INVALID_OPENING_QUOTE"].includes(error?.code)) throw error;
    parseErrors.push(`CSV contains malformed quote syntax and required relaxed parsing: ${error.message}`);
    parsedRecords = parse(csvText, { ...parseOptions, relax_quotes: true });
  }
  const records = parsedRecords.map((record) => Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, normalizeCell(value)]),
  ));
  return { headers, records, parseErrors };
}

export function validateSnapshot(snapshot, baselineHeaders = []) {
  const errors = [...(snapshot.parseErrors ?? [])];
  const warnings = [];
  const headerCounts = new Map();
  for (const header of snapshot.headers) {
    headerCounts.set(header, (headerCounts.get(header) ?? 0) + 1);
  }
  const duplicateHeaders = [...headerCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([header]) => header);
  if (duplicateHeaders.length) {
    errors.push(`Duplicate CSV headers: ${duplicateHeaders.join(", ")}`);
  }
  for (const field of requiredFields) {
    if (!snapshot.headers.includes(field)) errors.push(`Missing required CSV column: ${field}`);
  }

  const addedHeaders = baselineHeaders.filter(Boolean).length
    ? snapshot.headers.filter((header) => !baselineHeaders.includes(header))
    : [];
  const removedHeaders = baselineHeaders.filter(Boolean).length
    ? baselineHeaders.filter((header) => !snapshot.headers.includes(header))
    : [];
  const sameHeaderOrder = baselineHeaders.length
    ? snapshot.headers.join("\u0000") === baselineHeaders.join("\u0000")
    : true;
  if (addedHeaders.length || removedHeaders.length) {
    errors.push(
      `CSV schema differs from the active database (added: ${addedHeaders.join(", ") || "none"}; removed: ${removedHeaders.join(", ") || "none"}).`,
    );
  } else if (!sameHeaderOrder) {
    warnings.push("CSV columns match the active database but appear in a different order.");
  }

  const duplicateProjectIds = duplicates(snapshot.records.map((record) => record.project_id));
  const duplicateSlugs = duplicates(snapshot.records.map((record) => record.slug));
  const duplicateDisplayNames = duplicates(snapshot.records.map((record) => normalizeIdentity(record.display_name)));
  if (duplicateProjectIds.length) errors.push(`Duplicate project_id values: ${duplicateProjectIds.join(", ")}`);
  if (duplicateSlugs.length) errors.push(`Duplicate slug values: ${duplicateSlugs.join(", ")}`);
  if (duplicateDisplayNames.length) errors.push(`Duplicate display_name values: ${duplicateDisplayNames.join(", ")}`);

  const rowIssues = [];
  const sourceUrlIssues = [];
  let blankCells = 0;
  for (const [index, record] of snapshot.records.entries()) {
    const rowNumber = index + 2;
    const projectId = record.project_id || `(row ${rowNumber})`;
    const issues = [];
    for (const field of requiredFields) {
      if (!record[field]) issues.push(`missing ${field}`);
    }
    for (const field of ["project_id", "slug"]) {
      if (record[field] && !identifierPattern.test(record[field])) issues.push(`${field} is not kebab-case`);
    }
    for (const field of booleanFields) {
      if (record[field] && !["TRUE", "FALSE"].includes(record[field].toUpperCase())) {
        issues.push(`${field} must be TRUE or FALSE`);
      }
    }
    for (const field of dateFields) {
      if (!record[field]) issues.push(`missing ${field}`);
      else if (!isIsoDate(record[field])) issues.push(`${field} must be a valid YYYY-MM-DD date`);
    }
    const sourceInspection = inspectSourceUrls(record[sourceUrlField]);
    if (sourceInspection.hasMixedContent) {
      sourceUrlIssues.push({
        projectId,
        urls: sourceInspection.urls,
        nonUrlText: sourceInspection.nonUrlText,
      });
    }
    blankCells += snapshot.headers.filter((header) => !record[header]).length;
    if (issues.length) rowIssues.push({ rowNumber, projectId, issues });
  }
  if (rowIssues.length) {
    errors.push(...rowIssues.map((row) => `${row.projectId}: ${row.issues.join("; ")}`));
  }
  if (sourceUrlIssues.length) {
    warnings.push(`${sourceUrlIssues.length} source_urls cells mix URLs with labels or prose and need normalization.`);
  }

  return {
    errors,
    warnings,
    rowIssues,
    sourceUrlIssues,
    blankCells,
    schema: {
      columnCount: snapshot.headers.length,
      addedHeaders,
      removedHeaders,
      sameHeaderOrder,
      duplicateHeaders,
    },
  };
}

export function compareSnapshots(current, proposed) {
  const currentById = new Map(current.records.map((record) => [record.project_id, record]));
  const proposedById = new Map(proposed.records.map((record) => [record.project_id, record]));
  const additions = proposed.records.filter((record) => !currentById.has(record.project_id));
  const removals = current.records.filter((record) => !proposedById.has(record.project_id));
  const shared = proposed.records.filter((record) => currentById.has(record.project_id));
  const changedRows = [];
  const changedFieldFrequency = new Map();

  for (const record of shared) {
    const currentRecord = currentById.get(record.project_id);
    const changedFields = proposed.headers.filter(
      (field) => normalizeCell(currentRecord?.[field]) !== normalizeCell(record[field]),
    );
    if (!changedFields.length) continue;
    for (const field of changedFields) {
      changedFieldFrequency.set(field, (changedFieldFrequency.get(field) ?? 0) + 1);
    }
    changedRows.push({
      projectId: record.project_id,
      displayName: record.display_name,
      changedFieldCount: changedFields.length,
      changedFields,
    });
  }

  return {
    additions,
    removals,
    shared,
    changedRows,
    changedCellCount: changedRows.reduce((total, row) => total + row.changedFieldCount, 0),
    changedFieldFrequency: [...changedFieldFrequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([field, count]) => ({ field, count })),
  };
}

export function inspectSourceUrls(value) {
  const text = normalizeCell(value);
  if (!text) return { urls: [], nonUrlText: "", hasMixedContent: false };
  const matches = text.match(/https?:\/\/[^\s|;]+/gi) ?? [];
  const urls = matches.map((url) => url.replace(/[),.]+$/, ""));
  const nonUrlText = text
    .replace(/https?:\/\/[^\s|;]+/gi, " ")
    .replace(/[|;,()[\]{}]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    urls,
    nonUrlText,
    hasMixedContent: Boolean(nonUrlText),
  };
}

function main() {
  if (!sourcePath) {
    fail("Pass --source /path/to/proposed-master.csv. The source is reviewed as intake only and is never imported by this command.");
  }
  for (const [label, filePath] of [
    ["Active building database", currentPath],
    ["Proposed building master", sourcePath],
    ["Canonical project snapshot", canonicalPath],
    ["Project source catalog", sourceCatalogPath],
    ["Project identity decisions", decisionsPath],
  ]) {
    if (!fs.existsSync(filePath)) fail(`${label} not found: ${filePath}`);
  }

  const current = parseCsvSnapshot(fs.readFileSync(currentPath, "utf8"));
  const proposed = parseCsvSnapshot(fs.readFileSync(sourcePath, "utf8"));
  const validation = validateSnapshot(proposed, current.headers);
  const delta = compareSnapshots(current, proposed);
  const canonical = readJson(canonicalPath);
  const sourceCatalog = readJson(sourceCatalogPath);
  const decisions = readJson(decisionsPath);
  const identity = buildIdentityReconciliation(proposed.records, delta, canonical, sourceCatalog, decisions);

  for (const addition of identity.additions) {
    if (addition.humanReviewRequired !== true) {
      validation.errors.push(`${addition.projectId}: new records must set human_review_required=TRUE until Brooke classifies them.`);
    }
  }

  const errors = [...new Set(validation.errors)];
  const unresolvedAdditions = identity.additions.filter((item) => item.classificationState === "needs-brooke-classification");
  const warnings = [...new Set([
    ...validation.warnings,
    ...unresolvedAdditions.map((item) => `${item.projectId}: public/compare/watch/hold classification requires Brooke review.`),
  ])];
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    dryRun: true,
    mutationPolicy: "No source CSV, tracked data, generated TypeScript, routes, pages, schema, or assets are changed.",
    inputs: {
      activeDatabase: path.relative(workspace, currentPath),
      proposedMaster: sourcePath,
      canonicalSnapshot: path.relative(workspace, canonicalPath),
      sourceCatalog: path.relative(workspace, sourceCatalogPath),
      identityDecisions: path.relative(workspace, decisionsPath),
    },
    status: errors.length ? "blocked" : delta.changedRows.length || identity.additions.some((item) => item.humanReviewRequired) ? "review-required" : "ready",
    summary: {
      activeRows: current.records.length,
      proposedRows: proposed.records.length,
      columns: proposed.headers.length,
      blankCells: validation.blankCells,
      sharedRows: delta.shared.length,
      changedRows: delta.changedRows.length,
      changedCells: delta.changedCellCount,
      additions: delta.additions.length,
      removals: delta.removals.length,
      registryMatches: identity.rows.filter((row) => row.registryPublicSlug).length,
      unresolvedClassifications: unresolvedAdditions.length,
      validationErrors: errors.length,
      warnings: warnings.length,
    },
    validation: {
      ...validation,
      errors,
      warnings,
    },
    delta: {
      additions: delta.additions.map(projectSummary),
      removals: delta.removals.map(projectSummary),
      changedRows: delta.changedRows,
      changedCellCount: delta.changedCellCount,
      changedFieldFrequency: delta.changedFieldFrequency,
    },
    identity,
    enumerations: buildEnumerationDiff(current, proposed),
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (printJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(renderSummary(report));
  }
  console.log(`Report: ${path.relative(workspace, reportPath)}`);

  if (errors.length) process.exitCode = 1;
  else if (strict && identity.additions.length) process.exitCode = 2;
}

function buildIdentityReconciliation(records, delta, canonical, sourceCatalog, decisions) {
  const canonicalRecords = [
    ...(canonical.projects ?? []).map((record) => ({ ...record, canonicalBucket: "public" })),
    ...(canonical.excluded_or_internal_only ?? []).map((record) => ({ ...record, canonicalBucket: "internal" })),
  ];
  const canonicalByPublicSlug = new Map();
  const canonicalDirect = new Map();
  for (const record of canonicalRecords) {
    const identifiers = [record.project_id, record.slug].filter(Boolean);
    for (const identifier of identifiers) canonicalDirect.set(identifier, record);
    const registryEntry = identifiers.map(resolveProjectIntelligenceRegistryEntry).find(Boolean);
    if (registryEntry) canonicalByPublicSlug.set(registryEntry.publicSlug, record);
  }

  const sourceProjects = sourceCatalog.projects ?? [];
  const decisionById = new Map((decisions.projects ?? []).map((decision) => [decision.canonicalId, decision]));
  const sourceById = new Map(sourceProjects.map((project) => [project.projectId, project]));
  const additionIds = new Set(delta.additions.map((record) => record.project_id));
  const rows = records.map((record) => {
    const decision = decisionById.get(record.project_id) ?? decisionById.get(record.slug);
    const registryEntry =
      resolveProjectIntelligenceRegistryEntry(record.project_id) ??
      resolveProjectIntelligenceRegistryEntry(record.slug);
    const canonicalRecord = registryEntry
      ? canonicalByPublicSlug.get(registryEntry.publicSlug)
      : canonicalDirect.get(record.project_id) ?? canonicalDirect.get(record.slug);
    const sourceMatches = registryEntry
      ? registryEntry.sourceCatalogIds.filter((id) => sourceById.has(id))
      : [record.project_id, record.slug].filter((id) => sourceById.has(id));
    const sourceCandidates = sourceMatches.length
      ? sourceMatches
      : findSourceCatalogCandidates(record, sourceProjects);
    const reviewSignals = [];
    if (additionIds.has(record.project_id)) reviewSignals.push("new-database-row");
    if (!registryEntry) reviewSignals.push("missing-public-registry-entry");
    if (!canonicalRecord) reviewSignals.push("missing-canonical-classification");
    if (!sourceMatches.length && sourceCandidates.length) reviewSignals.push("possible-source-alias");
    if (!sourceMatches.length && !sourceCandidates.length) reviewSignals.push("missing-source-catalog-match");
    if (record.human_review_required.toUpperCase() === "TRUE") reviewSignals.push("human-review-required");
    if (record.key_conflicts) reviewSignals.push("fact-conflicts-present");
    if (/do not publish|hold|reconciliation required/i.test(`${record.status_badge} ${record.source_notes_public}`)) {
      reviewSignals.push("explicit-hold-signal");
    }
    return {
      projectId: record.project_id,
      displayName: record.display_name,
      slug: record.slug,
      corridor: record.corridor,
      statusBadge: record.status_badge,
      humanReviewRequired: record.human_review_required.toUpperCase() === "TRUE",
      registryPublicSlug: registryEntry?.publicSlug,
      registryRoute: registryEntry?.publicRoute,
      approvedPublicSlug: decision?.publicationState === "retired_merged" ? undefined : decision?.publicSlug,
      publicationState: decision?.publicationState,
      mergedInto: decision?.mergedInto,
      canonicalProjectId: canonicalRecord?.project_id ?? canonicalRecord?.slug,
      canonicalBucket: canonicalRecord?.canonicalBucket,
      canonicalPageType: canonicalRecord?.page_type,
      sourceCatalogMatches: sourceMatches,
      sourceCatalogCandidates: sourceCandidates,
      classificationState: additionIds.has(record.project_id)
        ? decision?.publicationState === "awaiting_imagery"
          ? "approved-public-awaiting-imagery"
          : decision?.publicationState === "retired_merged"
            ? "retired-merged"
            : decision?.publicationState === "published"
              ? "approved-public-published"
              : "needs-brooke-classification"
        : canonicalRecord?.canonicalBucket === "public"
          ? "existing-public"
          : canonicalRecord?.canonicalBucket === "internal"
            ? "existing-internal"
            : "needs-reconciliation",
      reviewSignals,
    };
  });
  return {
    rows,
    additions: rows.filter((row) => additionIds.has(row.projectId)),
    existing: rows.filter((row) => !additionIds.has(row.projectId)),
  };
}

function findSourceCatalogCandidates(record, projects) {
  const targetTokens = identityTokens(`${record.project_id} ${record.slug} ${record.display_name}`);
  return projects
    .map((project) => {
      const candidateTokens = identityTokens(`${project.projectId} ${project.name}`);
      const intersection = [...targetTokens].filter((token) => candidateTokens.has(token));
      const score = intersection.length / Math.max(1, Math.min(targetTokens.size, candidateTokens.size));
      return { id: project.projectId, score };
    })
    .filter((candidate) => candidate.score >= 0.75)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map((candidate) => candidate.id);
}

function identityTokens(value) {
  return new Set(
    normalizeIdentity(value)
      .split(" ")
      .map((token) => token.replace(/s$/, ""))
      .filter((token) => token && !identityStopWords.has(token)),
  );
}

function buildEnumerationDiff(current, proposed) {
  const fields = ["corridor", "development_stage", "status_badge", "construction_status", "confidence_level"];
  return Object.fromEntries(fields.map((field) => {
    const active = uniqueSorted(current.records.map((record) => record[field]).filter(Boolean));
    const candidate = uniqueSorted(proposed.records.map((record) => record[field]).filter(Boolean));
    return [field, {
      active,
      proposed: candidate,
      added: candidate.filter((value) => !active.includes(value)),
      removed: active.filter((value) => !candidate.includes(value)),
    }];
  }));
}

function renderSummary(report) {
  const lines = [
    "Proposed building master reconciliation (dry run)",
    `- status: ${report.status}`,
    `- active/proposed: ${report.summary.activeRows}/${report.summary.proposedRows} rows, ${report.summary.columns} columns`,
    `- additions/removals: ${report.summary.additions}/${report.summary.removals}`,
    `- existing rows changed: ${report.summary.changedRows} (${report.summary.changedCells} cells)`,
    `- validation errors: ${report.summary.validationErrors}`,
    `- warnings: ${report.summary.warnings}`,
    "- tracked/public mutations: none",
  ];
  if (report.identity.additions.length) {
    lines.push("Addition classifications:");
    for (const item of report.identity.additions) {
      const candidates = item.sourceCatalogCandidates.length
        ? `; source candidates: ${item.sourceCatalogCandidates.join(", ")}`
        : "";
      const merged = item.mergedInto ? `; merged into ${item.mergedInto}` : "";
      lines.push(`- ${item.projectId}: ${item.classificationState} (${item.corridor})${merged}${candidates}`);
    }
  }
  return lines.join("\n");
}

function projectSummary(record) {
  return {
    projectId: record.project_id,
    displayName: record.display_name,
    slug: record.slug,
    corridor: record.corridor,
    statusBadge: record.status_badge,
    humanReviewRequired: record.human_review_required?.toUpperCase() === "TRUE",
  };
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function normalizeCell(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeIdentity(value) {
  return normalizeCell(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function valueAfter(flag) {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] || "" : "";
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const entryPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === entryPath) main();
