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

const approved = JSON.parse(read("src/data/approvedImportedProjectImages.json"));

for (const image of approved) {
  if (image.status !== "placed") continue;
  if (!existsSync(path.join(root, image.localPath))) {
    fail(`Renamed approved image file is missing: ${image.localPath}`);
  }
  const filename = path.basename(image.localPath);
  if (/\b(?:unknown|interior|amenity|exterior)-2026-05-22-\d{3}\b/.test(filename)) {
    fail(`Placed approved image still has importer-generated filename: ${image.localPath}`);
  }
  if (!filename.startsWith(`${image.projectId}-`) && !filename.startsWith("berkeley-") && !filename.startsWith("shorecrest-")) {
    fail(`Renamed approved image filename does not start with a project identifier: ${image.localPath}`);
  }
}

const sourcesToCheck = [
  "src/data/approvedImportedProjectImages.json",
  "src/main.ts",
  "research/source-material-review/project-asset-placement-matrix.md",
  "research/source-material-review/imported-project-images-review.md",
  "research/source-material-review/developer-image-placement-analysis.md",
  "research/imported-project-images/importedProjectImages.json",
];

for (const relative of sourcesToCheck) {
  const text = read(relative);
  const matches = [...text.matchAll(/public\/projects\/[^"')\s|]+\/media\/imported\/(?:unknown|interior|amenity|exterior)-2026-05-22-\d{3}\.(?:jpg|png|webp)/g)]
    .map((match) => match[0]);
  for (const match of new Set(matches)) {
    if (!existsSync(path.join(root, match))) {
      fail(`${relative} references missing importer-generated image path: ${match}`);
    }
  }
}

if (errors.length) {
  console.error(JSON.stringify({ renamedImages: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ renamedImages: "pass", approvedPlacedImages: approved.filter((image) => image.status === "placed").length }, null, 2));
