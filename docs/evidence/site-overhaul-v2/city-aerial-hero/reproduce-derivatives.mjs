import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");
const sourcePath = path.join(here, "selected-editorial-master.png");
const outputDir = path.join(repoRoot, "public/assets/editorial");
const webpQuality = 84;
const mobileCrop = { left: 480, top: 0, width: 455, height: 941 };

const desktopWidths = [960, 1280, 1672];
const mobileWidths = [390, 455];

await fs.mkdir(outputDir, { recursive: true });

const sha256 = async (filePath) => crypto
  .createHash("sha256")
  .update(await fs.readFile(filePath))
  .digest("hex");

const outputs = [];

for (const width of desktopWidths) {
  const filename = `wpb-aerial-editorial-hero-v01-${width}w.webp`;
  const filePath = path.join(outputDir, filename);
  await sharp(sourcePath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: webpQuality })
    .toFile(filePath);
  const metadata = await sharp(filePath).metadata();
  outputs.push({
    kind: "desktop",
    width: metadata.width,
    height: metadata.height,
    filename,
    publicPath: `/assets/editorial/${filename}`,
    bytes: (await fs.stat(filePath)).size,
    sha256: await sha256(filePath),
  });
}

for (const width of mobileWidths) {
  const filename = `wpb-aerial-editorial-hero-v01-mobile-${width}w.webp`;
  const filePath = path.join(outputDir, filename);
  await sharp(sourcePath)
    .extract(mobileCrop)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: webpQuality })
    .toFile(filePath);
  const metadata = await sharp(filePath).metadata();
  outputs.push({
    kind: "mobile",
    width: metadata.width,
    height: metadata.height,
    filename,
    publicPath: `/assets/editorial/${filename}`,
    bytes: (await fs.stat(filePath)).size,
    sha256: await sha256(filePath),
  });
}

const sourceMetadata = await sharp(sourcePath).metadata();
const manifest = {
  generatedAt: new Date().toISOString(),
  selectedSource: {
    filename: path.basename(sourcePath),
    width: sourceMetadata.width,
    height: sourceMetadata.height,
    bytes: (await fs.stat(sourcePath)).size,
    sha256: await sha256(sourcePath),
  },
  webpQuality,
  mobileCrop,
  outputs,
};

await fs.writeFile(
  path.join(here, "derived-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(JSON.stringify(manifest, null, 2));
