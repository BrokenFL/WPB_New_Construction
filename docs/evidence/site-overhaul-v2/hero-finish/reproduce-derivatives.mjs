import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(evidenceDir, "../../../..");
const repoRoot = path.resolve(process.env.HERO_REPO_ROOT || defaultRepoRoot);
const source = path.resolve(process.env.HERO_SOURCE || path.join(evidenceDir, "selected-b-master.png"));
const outputDir = path.join(repoRoot, "public/assets/editorial");
const manifestPath = path.resolve(process.env.HERO_DERIVED_MANIFEST || path.join(evidenceDir, "derived-manifest.json"));
const basename = "shorecrest-hero-b-warm-mineral-v01";
const crop = { left: 1120, top: 0, width: 455, height: 941 };
const outputs = [
  ...[960, 1280, 1672].map((width) => ({ kind: "desktop", width, filename: `${basename}-${width}w.webp` })),
  ...[390, 455].map((width) => ({ kind: "mobile", width, filename: `${basename}-mobile-${width}w.webp` })),
];

await fs.mkdir(outputDir, { recursive: true });
const sourceBuffer = await fs.readFile(source);
const sourceMetadata = await sharp(sourceBuffer).metadata();
if (sourceMetadata.width !== 1672 || sourceMetadata.height !== 941) {
  throw new Error(`Expected the selected ImageGen treatment to be 1672x941, received ${sourceMetadata.width}x${sourceMetadata.height}.`);
}

const records = [];
for (const output of outputs) {
  const destination = path.join(outputDir, output.filename);
  const pipeline = output.kind === "mobile"
    ? sharp(sourceBuffer).extract(crop).resize({ width: output.width, withoutEnlargement: true })
    : sharp(sourceBuffer).resize({ width: output.width, withoutEnlargement: true });
  await pipeline.webp({ quality: 84, effort: 6 }).toFile(destination);
  const metadata = await sharp(destination).metadata();
  if (metadata.width !== output.width) {
    throw new Error(`${output.filename} rendered at ${metadata.width}px instead of ${output.width}px.`);
  }
  const buffer = await fs.readFile(destination);
  records.push({
    kind: output.kind,
    width: metadata.width,
    height: metadata.height,
    filename: output.filename,
    publicPath: `/${path.relative(path.join(repoRoot, "public"), destination).replaceAll(path.sep, "/")}`,
    bytes: buffer.byteLength,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
  });
}

const manifest = {
  treatment: "B warm mineral",
  source: {
    path: source,
    sha256: crypto.createHash("sha256").update(sourceBuffer).digest("hex"),
    width: sourceMetadata.width,
    height: sourceMetadata.height,
  },
  mobileCrop: crop,
  quality: 84,
  assets: records,
};
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
