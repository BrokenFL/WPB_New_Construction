import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const filePath = path.join(root, "src/data/importedUpdates.json");
const allowedSourceTypes = new Set(["developer", "news", "city", "county", "brokerage", "permit", "other"]);
const allowedCategories = new Set(["sales", "construction", "planning", "financing", "delivery", "media", "general"]);
const allowedConfidence = new Set(["high", "medium", "low"]);
const allowedStatuses = new Set(["candidate", "published", "archived"]);
const required = ["id", "title", "summary", "date", "lastCheckedAt", "sourceName", "sourceUrl", "sourceType", "category", "confidence", "status"];

const updates = JSON.parse(fs.readFileSync(filePath, "utf8"));
const findings = [];

if (!Array.isArray(updates)) {
  findings.push("src/data/importedUpdates.json must be an array.");
} else {
  updates.forEach((update, index) => {
    for (const field of required) {
      if (!String(update[field] ?? "").trim()) {
        findings.push(`Update ${index + 1} is missing ${field}.`);
      }
    }
    if (!allowedSourceTypes.has(update.sourceType)) findings.push(`${update.id}: invalid sourceType.`);
    if (!allowedCategories.has(update.category)) findings.push(`${update.id}: invalid category.`);
    if (!allowedConfidence.has(update.confidence)) findings.push(`${update.id}: invalid confidence.`);
    if (!allowedStatuses.has(update.status)) findings.push(`${update.id}: invalid status.`);
    if (update.status === "published" && (!update.sourceUrl || !update.lastCheckedAt)) {
      findings.push(`${update.id}: published updates require sourceUrl and lastCheckedAt.`);
    }
    if (update.status === "published" && update.confidence === "low") {
      findings.push(`${update.id}: low-confidence updates cannot be published.`);
    }
  });
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`Imported update review passed for ${updates.length} record${updates.length === 1 ? "" : "s"}.`);
