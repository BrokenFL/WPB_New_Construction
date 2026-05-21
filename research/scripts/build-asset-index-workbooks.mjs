import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const workspace = process.cwd();
const assetRoot = path.join(workspace, "research/asset-library");
const projectsRoot = path.join(assetRoot, "projects");

const headers = [
  "Project",
  "Kind",
  "Role",
  "Entity",
  "Section",
  "Recommended Use",
  "Filename",
  "Local Path",
  "Source Page",
  "Asset URL",
  "Rights Status",
  "Rights Note",
  "Bytes",
];

const projectDirs = await fs.readdir(projectsRoot, { withFileTypes: true });
const outputs = [];
const masterRows = [];

for (const entry of projectDirs.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  const projectDir = path.join(projectsRoot, entry.name);
  const indexPath = path.join(projectDir, "asset-index.json");
  if (!(await exists(indexPath))) continue;
  const rows = JSON.parse(await fs.readFile(indexPath, "utf8"));
  const csv = toCsv([headers, ...rows.map(toSheetRow)]);
  const workbook = await Workbook.fromCSV(csv, { sheetName: "Asset Index" });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  const outPath = path.join(projectDir, "asset-index.xlsx");
  await output.save(outPath);
  outputs.push(outPath);
  masterRows.push(...rows);
}

const masterCsv = toCsv([headers, ...masterRows.map(toSheetRow)]);
const masterWorkbook = await Workbook.fromCSV(masterCsv, { sheetName: "All Assets" });
const masterOutput = await SpreadsheetFile.exportXlsx(masterWorkbook);
const masterPath = path.join(assetRoot, "wpb-asset-library-master-index.xlsx");
await masterOutput.save(masterPath);

console.log(
  JSON.stringify(
    {
      projectWorkbooks: outputs.length,
      masterWorkbook: masterPath,
      indexedAssets: masterRows.length,
    },
    null,
    2,
  ),
);

function toSheetRow(row) {
  return [
    row.projectName,
    row.kind,
    row.role,
    row.entity,
    row.section,
    row.recommendedUse,
    row.filename,
    row.localPath,
    row.sourcePage,
    row.assetUrl,
    row.rightsStatus,
    row.rightsNote,
    row.bytes,
  ];
}

function toCsv(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
