import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const importedPath = path.join(workspace, "src/data/approvedImportedProjectImages.json");
const mainPath = path.join(workspace, "src/main.ts");
const findings = [];
const weakPatterns = [
  /^project image/i,
  /^developer image/i,
  /^interior image/i,
  /^amenity image/i,
  /^image$/i,
  /^rendering$/i,
];

const imported = JSON.parse(await fs.readFile(importedPath, "utf8"));
for (const image of imported) {
  if (image.status !== "placed") continue;
  const alt = String(image.alt ?? "").trim();
  if (!alt) findings.push(`${image.id}: missing alt text`);
  if (weakPatterns.some((pattern) => pattern.test(alt))) findings.push(`${image.id}: weak generic alt text "${alt}"`);
  if (!alt.toLowerCase().includes(image.projectId.split("-")[0]) && !/ritz|maison|berkeley|nora|south flagler|banyan|forte/i.test(alt)) {
    findings.push(`${image.id}: alt text does not appear project-specific`);
  }
  if (!image.credit) findings.push(`${image.id}: missing image credit`);
}

const main = await fs.readFile(mainPath, "utf8");
const inlineAlts = [...main.matchAll(/alt:\s*"([^"]+)"/g)].map((match) => match[1]);
for (const alt of inlineAlts) {
  if (weakPatterns.some((pattern) => pattern.test(alt.trim()))) {
    findings.push(`src/main.ts: weak inline alt text "${alt}"`);
  }
}

if (findings.length) {
  console.error("Image alt quality findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Image alt quality QA passed for ${imported.filter((image) => image.status === "placed").length} placed imported images.`);
