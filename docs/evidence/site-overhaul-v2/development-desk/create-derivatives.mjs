import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public/assets/editorial/development-desk");

const variants = [
  {
    source: "public/assets/home/downtown-corridor-bridge-daytime-v01.jpg",
    outputs: [
      { name: "terra-context-lead-1400x636.webp", width: 1400, height: 636, fit: "cover", position: "centre" },
      { name: "terra-context-lead-780x355.webp", width: 780, height: 355, fit: "cover", position: "centre" },
    ],
  },
  {
    source: "public/assets/editorial/wpb-corridors-aerial-hero-v01.jpg",
    outputs: [
      { name: "la-fontana-context-thumb-288x216.webp", width: 288, height: 216, fit: "cover", position: "centre" },
    ],
  },
  {
    source: "public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp",
    extract: { left: 720, top: 290, width: 596, height: 447 },
    outputs: [
      { name: "alba-context-thumb-288x216.webp", width: 288, height: 216, fit: "cover", position: "centre" },
    ],
  },
];

await fs.mkdir(outputDir, { recursive: true });
const manifest = [];
for (const variant of variants) {
  const inputPath = path.join(root, variant.source);
  const inputMetadata = await sharp(inputPath).metadata();
  for (const output of variant.outputs) {
    const destination = path.join(outputDir, output.name);
    let pipeline = sharp(inputPath);
    if (variant.extract) pipeline = pipeline.extract(variant.extract);
    await pipeline
      .resize({ width: output.width, height: output.height, fit: output.fit, position: output.position, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(destination);
    const outputMetadata = await sharp(destination).metadata();
    const stat = await fs.stat(destination);
    manifest.push({
      source: `/${variant.source.replace(/^public\//, "")}`,
      sourceDimensions: { width: inputMetadata.width, height: inputMetadata.height },
      extract: variant.extract || null,
      output: `/assets/editorial/development-desk/${output.name}`,
      outputDimensions: { width: outputMetadata.width, height: outputMetadata.height },
      bytes: stat.size,
    });
  }
}
await fs.writeFile(path.join(root, ".runtime/development-desk/derivative-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), variants: manifest }, null, 2));
console.log(JSON.stringify({ variants: manifest }, null, 2));
