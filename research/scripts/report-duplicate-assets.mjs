import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const workspace = process.cwd();
const reviewRoot = path.join(workspace, "research/source-material-review");
const jsonPath = path.join(reviewRoot, "asset-duplicate-inventory.json");
const mdPath = path.join(reviewRoot, "asset-duplicate-inventory.md");
const metricVersion = 2;
const skipDirs = new Set([".git", "node_modules", "dist"]);
const sourcePrefixes = ["public/", "research/"];

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldWrite = args.has("--write");
  const previous = await readJsonIfExists(jsonPath);
  const files = await listWorkspaceFiles(workspace);
  const groups = await duplicateGroups(files);
  const sourceGroups = projectedGroups(groups, (filePath) => isSourcePath(filePath) && !filePath.startsWith("research/source-repos/"));
  const publicGroups = projectedGroups(groups, (filePath) => filePath.startsWith("public/"));
  const qaGroups = projectedGroups(groups, isQaPath);
  const summary = {
    metricVersion,
    generatedAt: new Date().toISOString(),
    filesScanned: files.length,
    duplicateHashGroups: groups.length,
    duplicateExtraBytes: sumExtraBytes(groups),
    sourceDuplicateHashGroups: sourceGroups.length,
    sourceDuplicateExtraBytes: sumExtraBytes(sourceGroups),
    publicOnlyDuplicateHashGroups: publicGroups.length,
    publicOnlyDuplicateExtraBytes: sumExtraBytes(publicGroups),
    qaDuplicateHashGroups: qaGroups.length,
    qaDuplicateExtraBytes: sumExtraBytes(qaGroups),
    previousDuplicateExtraBytes: previous?.summary?.metricVersion === metricVersion ? previous.summary.duplicateExtraBytes : null,
    previousSourceDuplicateExtraBytes: previous?.summary?.metricVersion === metricVersion ? previous.summary.sourceDuplicateExtraBytes : null,
  };
  summary.duplicateExtraByteDelta =
    summary.previousDuplicateExtraBytes === null ? null : summary.duplicateExtraBytes - summary.previousDuplicateExtraBytes;
  summary.sourceDuplicateExtraByteDelta =
    summary.previousSourceDuplicateExtraBytes === null
      ? null
      : summary.sourceDuplicateExtraBytes - summary.previousSourceDuplicateExtraBytes;

  const report = {
    summary,
    policy:
      "Inventory only. Do not delete files from this report without explicit human approval; use it to choose canonical files and archive/move candidates.",
    cleanupPlan: cleanupPlan(groups),
    groups,
  };

  if (shouldWrite) {
    await fs.mkdir(reviewRoot, { recursive: true });
    await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    await fs.writeFile(mdPath, renderMarkdown(report));
  }

  console.log(
    JSON.stringify(
      {
        mode: shouldWrite ? "wrote-report" : "dry-run",
        json: relative(jsonPath),
        markdown: relative(mdPath),
        ...summary,
      },
      null,
      2,
    ),
  );
}

async function listWorkspaceFiles(root) {
  const files = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const rel = relative(fullPath);
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        await walk(fullPath);
      } else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        files.push({ path: rel, absolutePath: fullPath, size: stat.size });
      }
    }
  }
  await walk(root);
  return files;
}

async function duplicateGroups(files) {
  const bySize = groupBy(files.filter((file) => file.size > 0), (file) => file.size);
  const candidates = [...bySize.values()].filter((items) => items.length > 1).flat();
  const byHash = new Map();
  for (const file of candidates) {
    const hash = await sha256(file.absolutePath);
    const clean = { path: file.path, size: file.size };
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(clean);
  }

  return [...byHash.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([hash, items]) => ({
      hash,
      count: items.length,
      eachBytes: items[0].size,
      extraBytes: items[0].size * (items.length - 1),
      classification: classifyGroup(items),
      recommendedCanonical: recommendedCanonical(items),
      action: recommendedAction(items),
      files: items.sort((a, b) => a.path.localeCompare(b.path)),
    }))
    .sort((a, b) => b.extraBytes - a.extraBytes || a.recommendedCanonical.localeCompare(b.recommendedCanonical));
}

function cleanupPlan(groups) {
  const byAction = new Map();
  for (const group of groups) {
    if (!byAction.has(group.action)) byAction.set(group.action, { action: group.action, groups: 0, extraBytes: 0 });
    const item = byAction.get(group.action);
    item.groups += 1;
    item.extraBytes += group.extraBytes;
  }
  return [...byAction.values()].sort((a, b) => b.extraBytes - a.extraBytes);
}

function projectedGroups(groups, predicate) {
  return groups
    .map((group) => {
      const files = group.files.filter((file) => predicate(file.path));
      if (files.length < 2) return null;
      return {
        ...group,
        count: files.length,
        extraBytes: group.eachBytes * (files.length - 1),
        files,
      };
    })
    .filter(Boolean);
}


function classifyGroup(files) {
  const paths = files.map((file) => file.path);
  if (paths.every((file) => file.startsWith("dist/")) || paths.some((file) => file.startsWith("dist/"))) {
    return "build-output mirror";
  }
  if (paths.some(isQaPath)) return "QA screenshot/output duplicate";
  if (paths.some((file) => file.includes("/generated-placeholders/"))) return "shared generated placeholder duplicate";
  if (paths.some((file) => file.startsWith("public/")) && paths.some((file) => file.startsWith("research/"))) {
    return "public/research source duplicate";
  }
  if (paths.every((file) => file.startsWith("public/"))) return "public-only duplicate";
  if (paths.every((file) => file.startsWith("research/"))) return "research-only duplicate";
  return "workspace duplicate";
}

function recommendedAction(files) {
  const classification = classifyGroup(files);
  if (classification === "build-output mirror") return "Ignore generated dist; rebuild instead of curating.";
  if (classification === "QA screenshot/output duplicate") return "Archive older QA screenshots after approval.";
  if (classification === "shared generated placeholder duplicate") return "Replace per-project copies with one shared internal placeholder reference.";
  if (classification === "public-only duplicate") return "Keep one canonical public URL, update references, then remove duplicate public alias after approval.";
  if (classification === "public/research source duplicate") {
    return "Keep research as raw archive and public as publishable derivative only where authorized.";
  }
  return "Review canonical path before any move or delete.";
}

function recommendedCanonical(files) {
  const ordered = [...files].sort((a, b) => scoreCanonical(b.path) - scoreCanonical(a.path) || a.path.localeCompare(b.path));
  return ordered[0]?.path ?? "";
}

function scoreCanonical(filePath) {
  let score = 0;
  if (filePath.startsWith("research/asset-library/projects/")) score += 40;
  if (filePath.startsWith("public/projects/")) score += 30;
  if (filePath.startsWith("public/")) score += 20;
  if (filePath.startsWith("dist/")) score -= 30;
  if (isQaPath(filePath)) score -= 20;
  if (/\/docs\/floorplans\/[^/]+--[a-f0-9]{8}\./i.test(filePath)) score -= 5;
  if (/\/docs\/floorplans\/(ritz-|olara-residence-plan)/i.test(filePath)) score += 10;
  return score;
}

function isSourcePath(filePath) {
  return sourcePrefixes.some((prefix) => filePath.startsWith(prefix));
}

function isQaPath(filePath) {
  return filePath.startsWith(".playwright-cli/") || filePath.startsWith("output/playwright/");
}

function sumExtraBytes(groups) {
  return groups.reduce((sum, group) => sum + group.extraBytes, 0);
}

function groupBy(values, keyFn) {
  const map = new Map();
  for (const value of values) {
    const key = keyFn(value);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(value);
  }
  return map;
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  const handle = await fs.open(filePath, "r");
  try {
    for await (const chunk of handle.createReadStream()) {
      hash.update(chunk);
    }
  } finally {
    await handle.close();
  }
  return hash.digest("hex");
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function renderMarkdown(report) {
  const { summary } = report;
  const lines = [
    "# Asset Duplicate Inventory",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    "This is a review report only. It does not delete, move, or rewrite assets.",
    "",
    "## Summary",
    "",
    `- Files scanned: ${summary.filesScanned}`,
    `- Duplicate groups: ${summary.duplicateHashGroups}`,
    `- Duplicate extra bytes: ${formatBytes(summary.duplicateExtraBytes)}`,
    `- Source duplicate groups: ${summary.sourceDuplicateHashGroups}`,
    `- Source duplicate extra bytes: ${formatBytes(summary.sourceDuplicateExtraBytes)}`,
    `- Public-only duplicate extra bytes: ${formatBytes(summary.publicOnlyDuplicateExtraBytes)}`,
    `- QA duplicate extra bytes: ${formatBytes(summary.qaDuplicateExtraBytes)}`,
    `- Duplicate byte delta from previous report: ${formatDelta(summary.duplicateExtraByteDelta)}`,
    `- Source duplicate byte delta from previous report: ${formatDelta(summary.sourceDuplicateExtraByteDelta)}`,
    "",
    "## Cleanup Plan Buckets",
    "",
    ...report.cleanupPlan.map((item) => `- ${item.action} (${item.groups} groups, ${formatBytes(item.extraBytes)})`),
    "",
    "## Largest Duplicate Groups",
    "",
  ];

  for (const group of report.groups.slice(0, 40)) {
    lines.push(`### ${group.classification} - ${formatBytes(group.extraBytes)} extra`);
    lines.push("");
    lines.push(`- Recommended canonical: \`${group.recommendedCanonical}\``);
    lines.push(`- Action: ${group.action}`);
    for (const file of group.files) {
      lines.push(`- \`${file.path}\``);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "n/a";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDelta(bytes) {
  if (bytes === null || bytes === undefined) return "n/a";
  const prefix = bytes > 0 ? "+" : "";
  return `${prefix}${formatBytes(bytes)}`;
}

function relative(filePath) {
  return path.relative(workspace, filePath).split(path.sep).join("/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
