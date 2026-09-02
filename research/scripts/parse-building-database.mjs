import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const workspace = process.cwd();
const inputPath = path.join(workspace, "content/wpb_new_construction_building_database_cleaned.csv");
const outputPath = path.join(workspace, "src/generated/buildingDatabase.ts");
const publicOutputPath = path.join(workspace, "src/generated/buildingDatabasePublic.ts");

const requiredFields = ["project_id", "display_name", "slug"];
const publicFields = [
  "project_id",
  "display_name",
  "slug",
  "public_address",
  "neighborhood",
  "corridor",
  "development_stage",
  "status_badge",
  "residence_count",
  "tower_count",
  "floor_count",
  "building_type",
  "completion_or_delivery",
  "construction_status",
  "price_display",
  "price_range_min",
  "price_range_max",
  "maintenance_per_sqft",
  "deposit_structure",
  "parking_summary",
  "storage_summary",
  "pet_summary",
  "rental_policy_summary",
  "buyer_cost_notes",
  "bedroom_range_display",
  "size_range_display",
  "floorplan_count",
  "floorplan_status",
  "residence_features",
  "outdoor_space_summary",
  "view_exposure_notes",
  "elevator_entry",
  "furnished_options",
  "walkability_summary",
  "waterfront_status",
  "palm_beach_access_summary",
  "boating_or_marina_summary",
  "nearby_districts",
  "distance_landmarks",
  "amenity_summary",
  "amenity_highlights",
  "service_summary",
  "brand_or_hospitality_partner",
  "wellness_summary",
  "dining_summary",
  "guest_suite_summary",
  "private_club_or_resident_lounge",
  "concierge_valet_summary",
  "developer",
  "architect",
  "interior_designer",
  "landscape_architect",
  "sales_team",
  "construction_team",
  "brand_partner",
  "capital_partner",
  "district_master_developers",
  "best_for",
  "tradeoffs",
  "compare_against",
  "buyer_questions_to_verify",
  "strongest_compare_points",
  "apples_to_apples_notes",
];

function normalizeCell(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function formatRecord(record, headers) {
  const lines = headers.map((header) => `    ${JSON.stringify(header)}: ${JSON.stringify(record[header] ?? "")},`);
  return `  {\n${lines.join("\n")}\n  }`;
}

function sanitizePublicCell(value) {
  return normalizeCell(value)
    .replace(/\bsource conflicts?\b/gi, "public details differ")
    .replace(/\bsource records?\b/gi, "public materials")
    .replace(/\bcurrent record uses\b/gi, "current public note uses")
    .replace(/\brecord\b/gi, "detail")
    .replace(/\bsales\s+office\s+open\b/gi, "sales active")
    .replace(/\bsales\s+office\b/gi, "sales active")
    .replace(/\bsales\s+gallery\b/gi, "sales center")
    .replace(/\bdeveloper\s+(?:site|website|materials?|documents?|disclaimers?|legal notices?|disclosure package)\b/gi, "project materials")
    .replace(/\bdata model\b/gi, "comparison notes")
    .replace(/\bpublic-source record\b/gi, "public reference")
    .replace(/\bpipeline watch item\b/gi, "pipeline project")
    .replace(/\bwatch item\b/gi, "pipeline project")
    .replace(/\bunknown fields\b/gi, "details not yet published")
    .replace(/\bneeds[_ -]review\b/gi, "requires confirmation")
    .replace(/\bneeds[_ -]sourcing\b/gi, "requires confirmation");
}

function main() {
  const csv = fs.readFileSync(inputPath, "utf8");
  const records = parse(csv, {
    bom: true,
    columns: true,
    relax_column_count: false,
    skip_empty_lines: true,
    trim: false,
    record_delimiter: ["\r\n", "\n"],
  }).map((record) => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, normalizeCell(value)])));

  const headers = Object.keys(records[0] ?? {});
  for (const field of requiredFields) {
    if (!headers.includes(field)) {
      throw new Error(`Missing required CSV column: ${field}`);
    }
  }

  const seenProjectIds = new Set();
  const seenSlugs = new Set();
  const duplicateSlugs = new Set();
  const missingReviewDates = [];

  for (const [index, record] of records.entries()) {
    const rowNumber = index + 2;
    for (const field of requiredFields) {
      if (!record[field]) {
        throw new Error(`Missing required value "${field}" on CSV row ${rowNumber}`);
      }
    }
    if (seenProjectIds.has(record.project_id)) {
      throw new Error(`Duplicate project_id in building database CSV: ${record.project_id}`);
    }
    seenProjectIds.add(record.project_id);

    if (seenSlugs.has(record.slug)) {
      duplicateSlugs.add(record.slug);
    }
    seenSlugs.add(record.slug);

    if (!record.last_reviewed_at) {
      missingReviewDates.push(record.project_id);
    }
  }

  for (const slug of duplicateSlugs) {
    console.warn(`[building-database] Duplicate slug found: ${slug}`);
  }
  for (const projectId of missingReviewDates) {
    console.warn(`[building-database] Missing last_reviewed_at for ${projectId}`);
  }

  const fieldType = headers.map((header) => `  ${JSON.stringify(header)}: string;`).join("\n");
  const recordsSource = records.map((record) => formatRecord(record, headers)).join(",\n");
  const typeHelpers = headers.map((header) => `  | ${JSON.stringify(header)}`).join("\n");

  const output = `// AUTO-GENERATED FILE. DO NOT EDIT.\n// Generated by research/scripts/parse-building-database.mjs from content/wpb_new_construction_building_database_cleaned.csv.\n\nexport type BuildingDatabaseField =\n${typeHelpers};\n\nexport type BuildingDatabaseRecord = {\n${fieldType}\n};\n\nexport const buildingDatabaseRecords: BuildingDatabaseRecord[] = [\n${recordsSource}\n];\n\nexport const buildingDatabaseByProjectId = Object.fromEntries(\n  buildingDatabaseRecords.map((record) => [record.project_id, record]),\n) as Record<string, BuildingDatabaseRecord>;\n\nexport const buildingDatabaseBySlug = Object.fromEntries(\n  buildingDatabaseRecords.map((record) => [record.slug, record]),\n) as Record<string, BuildingDatabaseRecord>;\n`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);

  const safePublicFields = publicFields.filter((field) => headers.includes(field));
  const publicFieldType = safePublicFields.map((header) => `  ${JSON.stringify(header)}: string;`).join("\n");
  const publicTypeHelpers = safePublicFields.map((header) => `  | ${JSON.stringify(header)}`).join("\n");
  const publicRecordsSource = records
    .map((record) => Object.fromEntries(safePublicFields.map((field) => [field, sanitizePublicCell(record[field] ?? "")])))
    .map((record) => formatRecord(record, safePublicFields))
    .join(",\n");
  const publicOutput = `// AUTO-GENERATED FILE. DO NOT EDIT.\n// Generated by research/scripts/parse-building-database.mjs from content/wpb_new_construction_building_database_cleaned.csv.\n// Public runtime projection: excludes internal/source QA fields from the browser bundle.\n\nexport type PublicBuildingDatabaseField =\n${publicTypeHelpers};\n\nexport type PublicBuildingDatabaseItem = {\n${publicFieldType}\n};\n\nexport const publicBuildingDatabaseItems: PublicBuildingDatabaseItem[] = [\n${publicRecordsSource}\n];\n\nexport const publicBuildingDatabaseByProjectId = Object.fromEntries(\n  publicBuildingDatabaseItems.map((item) => [item.project_id, item]),\n) as Record<string, PublicBuildingDatabaseItem>;\n\nexport const publicBuildingDatabaseBySlug = Object.fromEntries(\n  publicBuildingDatabaseItems.map((item) => [item.slug, item]),\n) as Record<string, PublicBuildingDatabaseItem>;\n`;

  fs.writeFileSync(publicOutputPath, publicOutput);
  console.log(`[building-database] Generated ${path.relative(workspace, outputPath)} with ${records.length} records.`);
  console.log(`[building-database] Generated ${path.relative(workspace, publicOutputPath)} with ${records.length} public records.`);
}

main();
