import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { getProjectIntelligence } from "../../src/lib/projectIntelligence.ts";
import {
  projectIntelligenceRegistryEntries,
  resolveProjectIntelligenceRegistryEntry,
} from "../../src/lib/projectIntelligenceRegistry.ts";

const workspace = process.cwd();
const compareCsvPath = path.join(workspace, "content/wpb_new_construction_building_database_cleaned.csv");
const reportPath = path.join(workspace, "docs/project-intelligence-audit.md");
const writeReport = process.argv.includes("--write");
const strict = process.argv.includes("--strict");

async function main() {
  const compareRows = parse(await fs.readFile(compareCsvPath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  const intelligenceByPublicSlug = new Map<string, Awaited<ReturnType<typeof getProjectIntelligence>>>();
  for (const entry of projectIntelligenceRegistryEntries) {
    intelligenceByPublicSlug.set(entry.publicSlug, await getProjectIntelligence(entry.publicSlug));
  }

  const publicWithoutCompare = [...intelligenceByPublicSlug.values()].filter((item) =>
    item.missingDataFlags.includes("missing-compare-row"),
  );
  const publicWithoutSource = [...intelligenceByPublicSlug.values()].filter((item) =>
    item.missingDataFlags.includes("missing-source-catalog-match"),
  );
  const compareWithoutPublic = compareRows.filter((row) => !resolveProjectIntelligenceRegistryEntry(row.project_id));

  const aliasCollisions = findAliasCollisions();
  const projectReviewRows = buildProjectReviewRows([...intelligenceByPublicSlug.values()]);

  const report = buildReport({
    compareRows,
    publicWithoutCompare,
    publicWithoutSource,
    compareWithoutPublic,
    aliasCollisions,
    projectReviewRows,
    intelligenceByPublicSlug,
  });

  if (writeReport) {
    await fs.writeFile(reportPath, report.markdown, "utf8");
  }

  console.log(report.summary);

  if (strict && report.issues.length) {
    console.error("Project intelligence QA strict mode failed.");
    for (const issue of report.issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  if (report.issues.length) {
    console.warn("Project intelligence alignment issues:");
    for (const issue of report.issues) {
      console.warn(`- ${issue}`);
    }
  }
}

function findAliasCollisions() {
  const reverse = new Map<string, string[]>();
  for (const entry of projectIntelligenceRegistryEntries) {
    const aliases = [
      entry.publicSlug,
      entry.publicRoute,
      entry.compareDatabaseId,
      entry.compareDatabaseSlug,
      ...(entry.sourceCatalogIds ?? []),
      ...(entry.alternateAliases ?? []),
      ...(entry.collapsedSourceCatalogIds ?? []),
    ].filter((value): value is string => Boolean(value && value.trim()));

    for (const alias of new Set(aliases)) {
      const bucket = reverse.get(alias) ?? [];
      bucket.push(entry.publicSlug);
      reverse.set(alias, bucket);
    }
  }

  return [...reverse.entries()]
    .filter(([, publicSlugs]) => new Set(publicSlugs).size > 1)
    .map(([alias, publicSlugs]) => ({ alias, publicSlugs: [...new Set(publicSlugs)].sort() }));
}

function buildReport({
  compareRows,
  publicWithoutCompare,
  publicWithoutSource,
  compareWithoutPublic,
  aliasCollisions,
  projectReviewRows,
  intelligenceByPublicSlug,
}: {
  compareRows: Record<string, string>[];
  publicWithoutCompare: Awaited<ReturnType<typeof getProjectIntelligence>>[];
  publicWithoutSource: Awaited<ReturnType<typeof getProjectIntelligence>>[];
  compareWithoutPublic: Record<string, string>[];
  aliasCollisions: { alias: string; publicSlugs: string[] }[];
  projectReviewRows: Array<{
    slug: string;
    project: string;
    corridor: string;
    compareRowExists: boolean;
    sourceCatalogIds: string[];
    fieldSummary: string;
    publicSummary: string;
    compareSummary: string;
    sourceSummary: string;
    currentWinnerSummary: string;
    recommendedSummary: string;
    schemaSummary: string;
    reviewStatusSummary: string;
  }>;
  intelligenceByPublicSlug: Map<string, Awaited<ReturnType<typeof getProjectIntelligence>>>;
}) {
  const lines: string[] = [];
  const issues: string[] = [];

  lines.push(`# Project Intelligence Audit`);
  lines.push("");
  lines.push(`- Registry entries: ${projectIntelligenceRegistryEntries.length}`);
  lines.push(`- Compare rows: ${compareRows.length}`);
  lines.push(`- Public projects without compare rows: ${publicWithoutCompare.length}`);
  lines.push(`- Public projects without source-catalog matches: ${publicWithoutSource.length}`);
  lines.push(`- Compare rows without public pages: ${compareWithoutPublic.length}`);
  lines.push(`- Review projects: ${projectReviewRows.length}`);
  lines.push("");

  if (aliasCollisions.length) {
    lines.push("## Alias Collisions");
    for (const collision of aliasCollisions) {
      lines.push(`- ${collision.alias}: ${collision.publicSlugs.join(", ")}`);
      issues.push(`duplicate alias ${collision.alias}`);
    }
    lines.push("");
  }

  if (projectReviewRows.length) {
    lines.push("## Brooke Review Queue");
    lines.push("");
    lines.push("| Project | Fields | Public | Compare | Source | Current winner | Schema output | Recommended winner | Review status |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const row of projectReviewRows) {
      const detail = [
        row.slug,
        row.fieldSummary || "—",
        row.publicSummary || "—",
        row.compareSummary || "—",
        row.sourceSummary || "—",
        row.currentWinnerSummary || "—",
        row.schemaSummary || "—",
        row.recommendedSummary || "—",
        row.reviewStatusSummary || "—",
      ];
      lines.push(`| ${detail.map((value) => escapeTable(String(value))).join(" | ")} |`);
      issues.push(`${row.slug} => ${row.reviewStatusSummary}`);
    }
    lines.push("");
  }

  if (publicWithoutCompare.length) {
    lines.push("## Public Projects Without Compare Rows");
    for (const item of publicWithoutCompare) {
      lines.push(`- ${item.publicIdentity.slug}: ${item.publicIdentity.displayName}`);
      issues.push(`missing compare row for ${item.publicIdentity.slug}`);
    }
    lines.push("");
  }

  if (compareWithoutPublic.length) {
    lines.push("## Compare Rows Without Public Pages");
    for (const row of compareWithoutPublic) {
      lines.push(`- ${row.project_id}: ${row.display_name}`);
      issues.push(`compare row without public page for ${row.project_id}`);
    }
    lines.push("");
  }

  if (publicWithoutSource.length) {
    lines.push("## Public Projects Without Source-Catalog Matches");
    for (const item of publicWithoutSource) {
      lines.push(`- ${item.publicIdentity.slug}: ${item.publicIdentity.displayName}`);
      issues.push(`missing source catalog for ${item.publicIdentity.slug}`);
    }
    lines.push("");
  }

  const summary = [
    "Project intelligence alignment summary:",
    `- public projects: ${intelligenceByPublicSlug.size}`,
    `- compare rows: ${compareRows.length}`,
    `- issues: ${issues.length}`,
  ].join("\n");

  const markdown = lines.join("\n");
  return { summary, markdown, issues };
}

function buildProjectReviewRows(items: Awaited<ReturnType<typeof getProjectIntelligence>>[]) {
  const rows = new Map<string, {
    slug: string;
    project: string;
    corridor: string;
    compareRowExists: boolean;
    sourceCatalogIds: string[];
    fieldSummary: string;
    publicSummary: string;
    compareSummary: string;
    sourceSummary: string;
    currentWinnerSummary: string;
    recommendedSummary: string;
    schemaSummary: string;
    reviewStatusSummary: string;
  }>();

  for (const item of items) {
    const issueFields = item.fieldReviews.filter((field) => field.reviewStatus !== "clear");
    if (!issueFields.length) continue;
    const fieldSummary = [...new Set(issueFields.map((field) => field.label))].join(", ");
    const publicSummary = [...new Set(issueFields.map((field) => field.publicValue).filter(Boolean))].join(" | ");
    const compareSummary = [...new Set(issueFields.map((field) => field.compareValue).filter(Boolean))].join(" | ");
    const sourceSummary = [...new Set(issueFields.map((field) => field.sourceValue).filter(Boolean))].join(" | ");
    const currentWinnerSummary = [...new Set(issueFields.map((field) => field.currentWinner))].join(", ");
    const recommendedSummary = [...new Set(issueFields.map((field) => field.recommendedWinner))].join(", ");
    const schemaSummary = [...new Set(issueFields.map((field) => field.schemaState))].join(", ");
    const reviewStatusSummary = [...new Set(issueFields.map((field) => field.reviewStatus))].join(", ");
    rows.set(item.publicIdentity.slug, {
      slug: item.publicIdentity.slug,
      project: item.publicIdentity.displayName,
      corridor: item.publicIdentity.corridor,
      compareRowExists: Boolean(item.compare.record),
      sourceCatalogIds: item.sourceCatalog.ids,
      fieldSummary,
      publicSummary,
      compareSummary,
      sourceSummary,
      currentWinnerSummary,
      recommendedSummary,
      schemaSummary,
      reviewStatusSummary,
    });
  }

  return [...rows.values()].sort((a, b) => a.project.localeCompare(b.project));
}

function escapeTable(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "<br />");
}

await main().catch((error) => {
  console.error(error);
  process.exit(1);
});
