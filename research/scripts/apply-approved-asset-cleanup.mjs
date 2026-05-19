import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const reviewRoot = path.join(workspace, "research/source-material-review");
const duplicateInventoryPath = path.join(reviewRoot, "asset-duplicate-inventory.json");
const cleanupReportPath = path.join(reviewRoot, "asset-cleanup-report.json");
const cleanupMarkdownPath = path.join(reviewRoot, "asset-cleanup-report.md");
const sharedPlaceholderPath = "research/asset-library/shared/generated-placeholders/downtown-wpb-hero-editorial.png";
const importedPlaceholderPath = "research/source-repos/WestPalmNewConstruction/public/assets/downtown-wpb-hero-editorial.png";
const projectPlaceholderPattern = /(?:research\/asset-library\/)?projects\/[^/]+\/images\/generated-placeholders\/placeholder--downtown-wpb-hero-editorial\.png/g;

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldWrite = args.has("--write");
  const report = {
    generatedAt: new Date().toISOString(),
    mode: shouldWrite ? "applied" : "dry-run",
    policy:
      "Approved cleanup removes exact duplicate stale public aliases, per-project generated placeholder copies, generated build output, and old QA CLI artifacts. Raw project research originals are preserved.",
    removed: [],
    updated: [],
    skipped: [],
  };

  await updateAuthorizationTracker(report, shouldWrite);
  await consolidateGeneratedPlaceholders(report, shouldWrite);
  await removeSafePublicAliases(report, shouldWrite);
  await removeGeneratedArtifacts(report, shouldWrite);

  report.summary = {
    removedFiles: report.removed.length,
    updatedFiles: report.updated.length,
    skippedItems: report.skipped.length,
    removedBytes: report.removed.reduce((sum, item) => sum + (item.bytes ?? 0), 0),
  };

  if (shouldWrite) {
    await fs.mkdir(reviewRoot, { recursive: true });
    await fs.writeFile(cleanupReportPath, `${JSON.stringify(report, null, 2)}\n`);
    await fs.writeFile(cleanupMarkdownPath, renderMarkdown(report));
  }

  console.log(
    JSON.stringify(
      {
        mode: report.mode,
        ...report.summary,
        json: relative(cleanupReportPath),
        markdown: relative(cleanupMarkdownPath),
      },
      null,
      2,
    ),
  );
}

async function updateAuthorizationTracker(report, shouldWrite) {
  const trackerPath = path.join(workspace, "research/source-material-review/wpb-project-asset-tracker.csv");
  const csv = await fs.readFile(trackerPath, "utf8");
  const [headerLine, ...rows] = csv.trimEnd().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const authIndex = headers.indexOf("Image Authorization");
  const noteIndex = headers.indexOf("Image Use Note");
  const generatedIndex = headers.indexOf("Generated");
  const projectIdIndex = headers.indexOf("Project ID");
  const floorplanFolderIndex = headers.indexOf("Floorplan Public Folder");
  const floorplanSampleIndex = headers.indexOf("Floorplan Sample Link");
  if (authIndex === -1 || noteIndex === -1) {
    report.skipped.push({ action: "update authorization tracker", reason: "required columns not found" });
    return;
  }

  const updatedRows = rows.map((row) => {
    const cells = parseCsvLine(row);
    const projectId = projectIdIndex === -1 ? "" : cells[projectIdIndex];
    cells[authIndex] = "authorized";
    cells[noteIndex] = "Full project image authorization confirmed by user on 2026-05-18; retain concise source credit and no developer/brand endorsement implication.";
    if (projectId === "south-flagler-house-north" || projectId === "south-flagler-house-south") {
      if (floorplanFolderIndex !== -1) {
        cells[floorplanFolderIndex] = "https://wpbnewconstruction.com/projects/south-flagler-house/docs/floorplans/shared/";
      }
      if (floorplanSampleIndex !== -1) {
        cells[floorplanSampleIndex] =
          "https://wpbnewconstruction.com/projects/south-flagler-house/docs/floorplans/shared/site-plan-floors-5-9--7e6bd746.jpg";
      }
    }
    if (generatedIndex !== -1) cells[generatedIndex] = new Date().toISOString();
    return toCsvLine(cells);
  });
  const updated = `${headerLine}\n${updatedRows.join("\n")}\n`;
  if (updated !== `${csv.trimEnd()}\n`) {
    if (shouldWrite) await fs.writeFile(trackerPath, updated);
    report.updated.push({ path: relative(trackerPath), action: "marked all project image authorization rows authorized" });
  }
}

async function consolidateGeneratedPlaceholders(report, shouldWrite) {
  const duplicateInventory = await readJsonIfExists(duplicateInventoryPath);
  const placeholderGroup = duplicateInventory?.groups?.find((group) => group.classification === "shared generated placeholder duplicate");
  const source =
    placeholderGroup?.files.find((file) => file.path.startsWith("research/asset-library/projects/"))?.path ??
    ((await exists(path.join(workspace, importedPlaceholderPath))) ? importedPlaceholderPath : "");

  const sharedAbsolute = path.join(workspace, sharedPlaceholderPath);
  if (source && shouldWrite) {
    await fs.mkdir(path.dirname(sharedAbsolute), { recursive: true });
    await fs.copyFile(path.join(workspace, source), sharedAbsolute).catch(async (error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  if (source) {
    report.updated.push({ path: sharedPlaceholderPath, action: `shared placeholder copied from ${source}` });
  } else if (!(await exists(sharedAbsolute))) {
    report.skipped.push({ action: "copy shared placeholder", reason: "no source placeholder found and shared placeholder is missing" });
  }

  const metadataFiles = await listFiles(path.join(workspace, "research/asset-library/projects"), (filePath) =>
    filePath.endsWith("metadata.json"),
  );
  metadataFiles.push(path.join(workspace, "research/asset-library/asset-manifest.json"));

  for (const filePath of metadataFiles) {
    const before = await fs.readFile(filePath, "utf8").catch(() => "");
    const after = before.replace(projectPlaceholderPattern, sharedPlaceholderPath.replace(/^research\/asset-library\//, ""));
    if (after !== before) {
      if (shouldWrite) await fs.writeFile(filePath, after);
      report.updated.push({ path: relative(filePath), action: "pointed generated placeholder reference at shared placeholder" });
    }
  }

  for (const file of placeholderGroup?.files ?? []) {
    if (!file.path.includes("/generated-placeholders/")) continue;
    if (file.path === sharedPlaceholderPath) continue;
    await removeFile(file.path, "removed duplicated per-project generated placeholder", report, shouldWrite);
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeSafePublicAliases(report, shouldWrite) {
  const duplicateInventory = await readJsonIfExists(duplicateInventoryPath);
  if (!duplicateInventory) {
    report.skipped.push({ action: "remove public aliases", reason: "duplicate inventory missing" });
    return;
  }

  const referencedPublicPaths = await collectReferencedPublicPaths();
  for (const group of duplicateInventory.groups ?? []) {
    const publicFiles = group.files.filter((file) => file.path.startsWith("public/"));
    if (publicFiles.length < 2) continue;
    const canonical = choosePublicCanonical(publicFiles, group.recommendedCanonical);
    for (const file of publicFiles) {
      if (file.path === canonical) continue;
      const publicHref = `/${file.path.replace(/^public\//, "")}`;
      if (referencedPublicPaths.has(publicHref) || referencedPublicPaths.has(file.path)) {
        report.skipped.push({ path: file.path, action: "remove public alias", reason: "still referenced by source/data" });
        continue;
      }
      await removeFile(file.path, `removed exact duplicate public alias; canonical is ${canonical}`, report, shouldWrite);
    }
  }
}

async function removeGeneratedArtifacts(report, shouldWrite) {
  for (const dir of ["dist", ".playwright-cli"]) {
    await removePath(dir, `removed disposable generated ${dir} artifacts`, report, shouldWrite);
  }
}

async function collectReferencedPublicPaths() {
  const refs = new Set();
  const textFiles = await listFiles(workspace, (filePath) => {
    const rel = relative(filePath);
    if (rel.startsWith(".git/") || rel.startsWith("node_modules/") || rel.startsWith("dist/")) return false;
    if (rel.startsWith("research/source-material-review/")) return false;
    return /\.(?:css|csv|html|json|md|mjs|ts|tsx|txt|xml)$/i.test(filePath);
  });

  const publicPathPattern = /\/projects\/[^"'`()<>\s?#,}]+/g;
  for (const filePath of textFiles) {
    const content = await fs.readFile(filePath, "utf8").catch(() => "");
    for (const match of content.matchAll(publicPathPattern)) {
      refs.add(match[0]);
      refs.add(`public${match[0]}`);
    }
  }
  return refs;
}

function choosePublicCanonical(publicFiles, recommendedCanonical) {
  if (publicFiles.some((file) => file.path === recommendedCanonical)) return recommendedCanonical;
  const ordered = [...publicFiles].sort((a, b) => publicScore(b.path) - publicScore(a.path) || a.path.localeCompare(b.path));
  return ordered[0].path;
}

function publicScore(filePath) {
  let score = 0;
  if (/\/docs\/floorplans\/(ritz-|olara-residence-plan)/i.test(filePath)) score += 20;
  if (/\/docs\/[^/]+\.pdf$/i.test(filePath)) score += 12;
  if (/--[a-f0-9]{8}\./i.test(filePath)) score -= 10;
  if (/\/media\/user-provided-/i.test(filePath)) score += 20;
  if (/\/media\/card\.(?:jpg|png|webp)$/i.test(filePath)) score -= 5;
  return score;
}

async function removeFile(relPath, action, report, shouldWrite) {
  const absolute = path.join(workspace, relPath);
  const stat = await fs.stat(absolute).catch(() => null);
  if (!stat?.isFile()) {
    report.skipped.push({ path: relPath, action, reason: "file not found" });
    return;
  }
  if (shouldWrite) await fs.rm(absolute);
  report.removed.push({ path: relPath, action, bytes: stat.size });
}

async function removePath(relPath, action, report, shouldWrite) {
  const absolute = path.join(workspace, relPath);
  const stat = await fs.stat(absolute).catch(() => null);
  if (!stat) {
    report.skipped.push({ path: relPath, action, reason: "path not found" });
    return;
  }
  const bytes = stat.isDirectory() ? await dirSize(absolute) : stat.size;
  if (shouldWrite) await fs.rm(absolute, { recursive: true, force: true });
  report.removed.push({ path: relPath, action, bytes });
}

async function dirSize(dirPath) {
  const stat = await fs.stat(dirPath).catch(() => null);
  if (!stat) return 0;
  if (stat.isFile()) return stat.size;
  let total = 0;
  const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    total += await dirSize(path.join(dirPath, entry.name));
  }
  return total;
}

async function listFiles(root, predicate) {
  const files = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".git" || entry.name === "node_modules") continue;
        await walk(full);
      } else if (entry.isFile() && predicate(full)) {
        files.push(full);
      }
    }
  }
  await walk(root);
  return files;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function toCsvLine(cells) {
  return cells
    .map((cell) => {
      const value = String(cell ?? "");
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
    })
    .join(",");
}

function renderMarkdown(report) {
  const lines = [
    "# Approved Asset Cleanup Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    report.policy,
    "",
    "## Summary",
    "",
    `- Removed files/paths: ${report.summary.removedFiles}`,
    `- Updated files: ${report.summary.updatedFiles}`,
    `- Removed bytes: ${formatBytes(report.summary.removedBytes)}`,
    `- Skipped items: ${report.summary.skippedItems}`,
    "",
    "## Removed",
    "",
    ...(report.removed.length
      ? report.removed.map((item) => `- ${item.path} (${formatBytes(item.bytes)}): ${item.action}`)
      : ["- None"]),
    "",
    "## Updated",
    "",
    ...(report.updated.length ? report.updated.map((item) => `- ${item.path}: ${item.action}`) : ["- None"]),
    "",
    "## Skipped",
    "",
    ...(report.skipped.length
      ? report.skipped.map((item) => `- ${item.path ?? item.action}: ${item.reason}`)
      : ["- None"]),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function relative(filePath) {
  return path.relative(workspace, filePath).split(path.sep).join("/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
