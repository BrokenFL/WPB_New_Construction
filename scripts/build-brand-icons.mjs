#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public/brand/wpb-favicon-source.svg");
const source = await fs.readFile(sourcePath);
const outputs = [
  ["favicon-16x16.png", 16],
  ["favicon-24x24.png", 24],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["favicon-96x96.png", 96],
  ["apple-touch-icon.png", 180],
  ["favicon-192x192.png", 192],
  ["favicon-512x512.png", 512],
];

for (const [name, size] of outputs) {
  await sharp(source, { density: 384 })
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9, palette: size <= 96 })
    .toFile(path.join(root, "public", name));
}

console.log(`Generated ${outputs.length} WPB icon PNGs from ${path.relative(root, sourcePath)}.`);
