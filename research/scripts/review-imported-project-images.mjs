import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const metadataPath = path.join(root, "research/imported-project-images/importedProjectImages.json");
const publicApprovedPath = path.join(root, "src/data/approvedImportedProjectImages.json");
const reportPath = path.join(root, "research/source-material-review/imported-project-images-review.md");

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8"));
}

const records = readJson(metadataPath, []);
const approvedRecords = records.filter((record) => record.status === "approved");
const groups = new Map();
for (const record of records) {
  if (!groups.has(record.projectId)) groups.set(record.projectId, []);
  groups.get(record.projectId).push(record);
}

const lines = [
  "# Imported Project Images Review",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Imported developer/project-site images default to `needs_review`. Public pages may only use records synced into `src/data/approvedImportedProjectImages.json` after their metadata status is changed to `approved`.",
  "",
];

if (!records.length) {
  lines.push("No imported project images are currently recorded.");
} else {
  for (const [projectId, projectRecords] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`## ${projectId}`, "");
    lines.push("| Preview | Type | Dimensions | Status | Source | Recommended action |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const record of projectRecords) {
      const localPath = record.localPath.replace(/^public\//, "/");
      const dimensions = record.width && record.height ? `${record.width}x${record.height}` : "Unknown";
      const recommendation = record.status === "needs_review" ? "Review rights, relevance, quality, and project match before approving." : "No action unless status changes.";
      lines.push(
        `| ![](${localPath})<br />\`${record.localPath}\` | ${record.imageType} | ${dimensions} | ${record.status} | [source](${record.sourcePageUrl}) | ${recommendation} |`,
      );
    }
    lines.push("");
  }
}

mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${lines.join("\n")}\n`);
mkdirSync(path.dirname(publicApprovedPath), { recursive: true });
writeFileSync(publicApprovedPath, `${JSON.stringify(approvedRecords, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      developerImageReview: "complete",
      records: records.length,
      approvedForPublicBundle: approvedRecords.length,
      reportPath: path.relative(root, reportPath),
    },
    null,
    2,
  ),
);
