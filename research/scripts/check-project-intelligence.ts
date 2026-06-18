import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { buildProjectIntelligenceReviewQueue, getProjectIntelligence } from "../../src/lib/projectIntelligence.ts";
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
  const queue = buildProjectIntelligenceReviewQueue([...intelligenceByPublicSlug.values()]);

  const publicWithoutCompare = [...intelligenceByPublicSlug.values()].filter((item) =>
    item.missingDataFlags.includes("missing-compare-row"),
  );
  const publicWithoutSource = [...intelligenceByPublicSlug.values()].filter((item) =>
    item.missingDataFlags.includes("missing-source-catalog-match"),
  );
  const compareWithoutPublic = compareRows.filter((row) => !resolveProjectIntelligenceRegistryEntry(row.project_id));

  const aliasCollisions = findAliasCollisions();

  const report = buildReport({
    compareRows,
    publicWithoutCompare,
    publicWithoutSource,
    compareWithoutPublic,
    aliasCollisions,
    queue,
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
  queue,
  intelligenceByPublicSlug,
}: {
  compareRows: Record<string, string>[];
  publicWithoutCompare: Awaited<ReturnType<typeof getProjectIntelligence>>[];
  publicWithoutSource: Awaited<ReturnType<typeof getProjectIntelligence>>[];
  compareWithoutPublic: Record<string, string>[];
  aliasCollisions: { alias: string; publicSlugs: string[] }[];
  queue: Awaited<ReturnType<typeof buildProjectIntelligenceReviewQueue>>;
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
  lines.push(`- Total issues: ${queue.summary.totalIssues}`);
  lines.push(`- Priority 1 issues: ${queue.summary.priority1Issues}`);
  lines.push(`- Priority 2 issues: ${queue.summary.priority2Issues}`);
  lines.push(`- Missing compare rows: ${queue.summary.missingCompareRows}`);
  lines.push(`- Missing source mappings: ${queue.summary.missingSourceMappings}`);
  lines.push("");

  if (aliasCollisions.length) {
    lines.push("## Alias Collisions");
    for (const collision of aliasCollisions) {
      lines.push(`- ${collision.alias}: ${collision.publicSlugs.join(", ")}`);
      issues.push(`duplicate alias ${collision.alias}`);
    }
    lines.push("");
  }

  if (queue.summary.projectsWithMostConflicts.length) {
    lines.push("## Projects With Most Conflicts");
    for (const item of queue.summary.projectsWithMostConflicts) {
      lines.push(`- ${item.slug}: ${item.name} (${item.issueCount})`);
    }
    lines.push("");
  }

  if (queue.rows.length) {
    lines.push("## Brooke Review Queue");
    lines.push("");
    lines.push("| Priority | Project | Slug | Field | Public | Compare | Source | Current winner | Schema behavior | Recommended action |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const row of queue.rows) {
      const detail = [
        row.priorityLabel,
        row.projectName,
        row.projectSlug,
        row.fieldLabel,
        row.publicValue || "—",
        row.compareValue || "—",
        row.sourceValue || "—",
        row.currentWinner,
        row.schemaBehavior,
        row.recommendedAction,
      ];
      lines.push(`| ${detail.map((value) => escapeTable(String(value))).join(" | ")} |`);
      issues.push(`${row.projectSlug}:${row.field} => ${row.priorityLabel} ${row.recommendedAction}`);
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
    `- total issues: ${queue.summary.totalIssues}`,
    `- priority 1 issues: ${queue.summary.priority1Issues}`,
    `- priority 2 issues: ${queue.summary.priority2Issues}`,
    `- missing compare rows: ${queue.summary.missingCompareRows}`,
    `- missing source mappings: ${queue.summary.missingSourceMappings}`,
  ].join("\n");

  const markdown = lines.join("\n");
  return { summary, markdown, issues };
}

function escapeTable(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "<br />");
}

await main().catch((error) => {
  console.error(error);
  process.exit(1);
});
