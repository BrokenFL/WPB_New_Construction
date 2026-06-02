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

function publicPath(sitePath) {
  return path.join(root, "public", sitePath.replace(/^\//, ""));
}

const heroSource = read("src/data/homeHeroImages.ts");
const mainSource = read("src/main.ts");
const styleSource = read("src/style.css");

const imageBlocks = [...heroSource.matchAll(/\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?src:\s*"([^"]+)"[\s\S]*?alt:\s*"([^"]+)"[\s\S]*?caption:\s*"([^"]+)"[\s\S]*?\}/g)]
  .map((match) => ({ id: match[1], src: match[2], alt: match[3], caption: match[4] }));

if (imageBlocks.length < 4 || imageBlocks.length > 6) {
  fail(`Homepage hero should use 4-6 curated images; found ${imageBlocks.length}.`);
}

if (imageBlocks[0]?.id !== "wpb-waterfront-bridge") {
  fail("Homepage hero first image should be the approved WPB waterfront bridge photograph.");
}

for (const image of imageBlocks) {
  if (!existsSync(publicPath(image.src))) {
    fail(`Hero image file is missing: ${image.id} -> ${image.src}`);
  }
  if (/^(image|project image|developer image|rendering|interior image|amenity image)$/i.test(image.alt.trim())) {
    fail(`Hero image has weak alt text: ${image.id}`);
  }
  if (!image.caption.trim()) {
    fail(`Hero image is missing a caption: ${image.id}`);
  }
}

const heroMarkup = mainSource.slice(mainSource.indexOf("<section class=\"home-hero\""), mainSource.indexOf("<section class=\"hero-proof-strip\""));
const eagerCount = (heroMarkup.match(/loading="eager"/g) ?? []).length;
const highPriorityCount = (heroMarkup.match(/fetchpriority="high"/g) ?? []).length;
if (eagerCount !== 1 || highPriorityCount !== 1) {
  fail(`Homepage hero should eagerly load exactly one high-priority image; found eager=${eagerCount}, high=${highPriorityCount}.`);
}

if (!mainSource.includes("prefers-reduced-motion: reduce") && !mainSource.includes("matchMedia(\"(prefers-reduced-motion: reduce)\"")) {
  fail("Homepage hero rotation does not check prefers-reduced-motion.");
}

if (!mainSource.includes("mouseenter") || !mainSource.includes("focusin")) {
  fail("Homepage hero rotation does not pause on hover/focus.");
}

if (!mainSource.includes("homepage_hero_cta_click")) {
  fail("Homepage hero CTA analytics are missing.");
}

if (!mainSource.includes("Map temporarily unavailable") || !mainSource.includes("The project map could not load.")) {
  fail("Google Maps fallback copy is missing.");
}

if (!styleSource.includes("@media (prefers-reduced-motion: reduce)")) {
  fail("Homepage hero CSS does not include reduced-motion handling.");
}

if (errors.length) {
  console.error(JSON.stringify({ heroImages: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ heroImages: "pass", images: imageBlocks.length }, null, 2));
