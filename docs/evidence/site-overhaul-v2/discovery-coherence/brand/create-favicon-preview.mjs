#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "docs/evidence/site-overhaul-v2/discovery-coherence/brand");
await fs.mkdir(outputDir, { recursive: true });

const width = 1040;
const height = 430;
const labels = [16, 24, 32, 48, 96];
const xPositions = [90, 230, 390, 570, 790];
const composites = [];

for (let index = 0; index < labels.length; index += 1) {
  const size = labels[index];
  const image = await fs.readFile(path.join(root, `public/favicon-${size}x${size}.png`));
  composites.push({ input: image, left: Math.round(xPositions[index] - size / 2), top: Math.round(150 - size / 2) });
}

const circleMask = Buffer.from('<svg width="96" height="96"><circle cx="48" cy="48" r="48" fill="white"/></svg>');
const circular = await sharp(path.join(root, "public/favicon-96x96.png")).composite([{ input: circleMask, blend: "dest-in" }]).png().toBuffer();
composites.push({ input: circular, left: 745, top: 268 });

const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#fffaf1"/>
  <text x="54" y="52" font-family="Avenir Next, Helvetica Neue, Arial" font-size="28" font-weight="600" fill="#173b42">WPB icon — actual-size review</text>
  <text x="54" y="82" font-family="Avenir Next, Helvetica Neue, Arial" font-size="15" fill="#52696d">Square source on #173b42. The five icons below are placed at their native pixel dimensions.</text>
  ${labels.map((size, index) => `<rect x="${xPositions[index] - 58}" y="92" width="116" height="116" rx="8" fill="#fff" stroke="#d6d0c5"/><text x="${xPositions[index]}" y="234" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial" font-size="14" fill="#173b42">${size} × ${size}</text>`).join("")}
  <line x1="54" x2="986" y1="258" y2="258" stroke="#d6d0c5"/>
  <text x="54" y="302" font-family="Avenir Next, Helvetica Neue, Arial" font-size="20" font-weight="600" fill="#173b42">Circular search presentation</text>
  <text x="54" y="330" font-family="Avenir Next, Helvetica Neue, Arial" font-size="14" fill="#52696d">Illustrative crop only. Search engines control their final display.</text>
  <circle cx="793" cy="316" r="58" fill="#fff" stroke="#d6d0c5"/>
  <text x="862" y="312" font-family="Avenir Next, Helvetica Neue, Arial" font-size="15" font-weight="600" fill="#173b42">WPB New Construction</text>
  <text x="862" y="337" font-family="Avenir Next, Helvetica Neue, Arial" font-size="13" fill="#52696d">favicon crop preview</text>
</svg>`);

await sharp(backdrop).composite(composites).png().toFile(path.join(outputDir, "favicon-size-preview.png"));
console.log(path.join(outputDir, "favicon-size-preview.png"));
