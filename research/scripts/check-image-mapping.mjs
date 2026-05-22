import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function publicPathFromSitePath(sitePath) {
  return path.join(root, "public", sitePath.replace(/^\//, ""));
}

const editorialSource = read("src/data/editorialImagery.ts");
const mainSource = read("src/main.ts");
const marketNotesSource = read("src/data/marketNotes.ts");
const styleSource = read("src/style.css");
const approvedImportedImages = JSON.parse(read("src/data/approvedImportedProjectImages.json"));

const editorialRecords = [...editorialSource.matchAll(/\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?assetPath:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"[\s\S]*?\}/g)]
  .map((match) => ({
    id: match[1],
    assetPath: match[2],
    status: match[3],
    block: match[0],
  }));

for (const record of editorialRecords) {
  if (record.status === "available" && !existsSync(publicPathFromSitePath(record.assetPath))) {
    fail(`Available editorial image is missing asset file: ${record.id} -> ${record.assetPath}`);
  }
}

const requiredEditorialIds = [
  "rosemary-square-corridor",
  "nora-growth-corridor",
  "south-flagler-corridor",
  "south-flagler-evening-corridor",
  "kravis-center-downtown-attraction",
  "buyer-intelligence-interior",
];

for (const id of requiredEditorialIds) {
  const record = editorialRecords.find((item) => item.id === id);
  if (!record) {
    fail(`Required editorial image id is missing: ${id}`);
  } else if (record.status !== "available") {
    fail(`Required editorial image id is not available: ${id}`);
  }
}

const projectAssetRefs = [...mainSource.matchAll(/["'`]((?:\/projects\/)[^"'`]+\.(?:jpg|jpeg|png|webp))["'`]/gi)].map((match) => match[1]);
for (const asset of new Set(projectAssetRefs)) {
  if (!existsSync(publicPathFromSitePath(asset))) {
    fail(`Project image reference is missing: ${asset}`);
  }
}

const editorialAssetRefs = [...mainSource.matchAll(/["'`]((?:\/assets\/editorial\/)[^"'`]+\.(?:jpg|jpeg|png|webp))["'`]/gi)].map((match) => match[1]);
for (const asset of new Set(editorialAssetRefs)) {
  if (!existsSync(publicPathFromSitePath(asset))) {
    fail(`Editorial image reference is missing: ${asset}`);
  }
}

const rosewoodEditorialUse = editorialRecords.filter((record) => /rosewood/i.test(record.block));
if (rosewoodEditorialUse.length) {
  fail(`Rosewood image language appears inside editorial imagery records: ${rosewoodEditorialUse.map((item) => item.id).join(", ")}`);
}

if (!/if \(key === "south-flagler"\) return "south-flagler-corridor"/.test(mainSource)) {
  fail("South Flagler corridor is not explicitly mapped to south-flagler-corridor.");
}

const flaglerRecord = editorialRecords.find((record) => record.id === "flagler-waterfront-corridor");
if (flaglerRecord && /south-flagler/i.test(flaglerRecord.block)) {
  fail("North Flagler editorial image is still routed to South Flagler.");
}

if (!mainSource.includes("const rosewoodRenderHero = \"/projects/rosewood/media/user-provided-rosewood-render-01.jpg\"")) {
  fail("Rosewood hero render is not wired as a project-specific asset.");
}

if (!mainSource.includes("function imageForContentItem")) {
  fail("Reusable content image resolver is missing.");
}

if (!/primaryProjectId\?: string/.test(marketNotesSource)) {
  fail("MarketNote type does not support primaryProjectId for project-specific image resolution.");
}

if (/imageId:\s*"buyer-intelligence-interior"/.test(marketNotesSource)) {
  fail("Market Notes still point to the unsourced buyer-intelligence interior image.");
}

if (!/approvedImportedImagesForProject/.test(mainSource) || !/status === "placed"/.test(mainSource)) {
  fail("Imported project images are not gated to placed status before public rendering.");
}

for (const image of approvedImportedImages) {
  if (image.status !== "placed") {
    fail(`Public imported image bundle contains a non-placed image: ${image.id}`);
  }
  for (const key of ["projectId", "sourcePageUrl", "sourceImageUrl", "localPath", "capturedAt", "imageType", "caption", "alt", "placement", "credit"]) {
    if (!image[key]) fail(`Public imported image is missing ${key}: ${image.id ?? image.localPath}`);
  }
  if (!existsSync(path.join(root, image.localPath))) {
    fail(`Placed imported image file is missing: ${image.localPath}`);
  }
}

if (!mainSource.includes("Some project images and renderings are sourced from developer or project marketing materials")) {
  fail("Developer/project image disclaimer is missing from public rendering.");
}

function cssBlock(selector) {
  const start = styleSource.indexOf(`${selector} {`);
  if (start === -1) return "";
  const end = styleSource.indexOf("}", start);
  return end === -1 ? "" : styleSource.slice(start, end);
}

if (/position:\s*absolute/.test(cssBlock(".editorial-image-panel figcaption"))) {
  fail("Editorial image captions still render as image overlays.");
}

if (/position:\s*absolute/.test(cssBlock(".content-image-panel figcaption"))) {
  fail("Content image captions still render as image overlays.");
}

if (errors.length) {
  console.error(JSON.stringify({ imageMapping: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ imageMapping: "pass", editorialRecords: editorialRecords.length, projectAssetRefs: new Set(projectAssetRefs).size }, null, 2));
