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

const imageBlocks = [...heroSource.matchAll(/\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?src:\s*"([^"]+)"[\s\S]*?alt:\s*"([^"]+)"[\s\S]*?caption:\s*"([^"]*)"[\s\S]*?\}/g)]
  .map((match) => ({ id: match[1], src: match[2], alt: match[3], caption: match[4] }));

if (imageBlocks.length < 4 || imageBlocks.length > 6) {
  fail(`Homepage hero should use 4-6 curated images; found ${imageBlocks.length}.`);
}

const selectedHero = imageBlocks[0];
const selectedHeroPath = "/assets/editorial/wpb-aerial-editorial-hero-v01-1672w.webp";
const selectedMobileHeroPath = "/assets/editorial/wpb-aerial-editorial-hero-v01-mobile-455w.webp";
const selectedDesktopSrcSet = [
  ["/assets/editorial/wpb-aerial-editorial-hero-v01-960w.webp", 960],
  ["/assets/editorial/wpb-aerial-editorial-hero-v01-1280w.webp", 1280],
  [selectedHeroPath, 1672],
];
const selectedMobileSrcSet = [
  ["/assets/editorial/wpb-aerial-editorial-hero-v01-mobile-390w.webp", 390],
  [selectedMobileHeroPath, 455],
];
if (selectedHero?.id !== "wpb-citywide-aerial-editorial" || selectedHero?.src !== selectedHeroPath) {
  fail("Homepage hero must use the selected versioned citywide aerial treatment.");
}
if (!/illustrated aerial view/i.test(selectedHero?.alt ?? "") || /AI-assisted/i.test(selectedHero?.alt ?? "") || selectedHero?.caption !== "") {
  fail("The selected hero must use descriptive citywide alt text and no visible AI warning or caption.");
}
const homepageAssetSource = read("src/data/homepageAssets.ts");
if (!homepageAssetSource.includes(`desktop: "${selectedHeroPath}"`) || !homepageAssetSource.includes(`mobile: "${selectedMobileHeroPath}"`)) {
  fail("Desktop and mobile homepage hero assets must use the selected responsive citywide treatment.");
}
for (const [assetPath, width] of [...selectedDesktopSrcSet, ...selectedMobileSrcSet]) {
  if (!homepageAssetSource.includes(`src: "${assetPath}"`) || !homepageAssetSource.includes(`width: ${width}`)) {
    fail(`Responsive hero source is missing from homepageAssets: ${assetPath} (${width}w).`);
  }
  if (!existsSync(publicPath(assetPath))) {
    fail(`Responsive hero image file is missing: ${assetPath}`);
  }
}

for (const image of imageBlocks) {
  if (!existsSync(publicPath(image.src))) {
    fail(`Hero image file is missing: ${image.id} -> ${image.src}`);
  }
  if (/^(image|project image|developer image|rendering|interior image|amenity image)$/i.test(image.alt.trim())) {
    fail(`Hero image has weak alt text: ${image.id}`);
  }
  if (image.id !== "wpb-citywide-aerial-editorial" && !image.caption.trim()) {
    fail(`Hero image is missing a caption: ${image.id}`);
  }
}

if (!mainSource.includes("const homepageHeroCaptionMarkup = homepageHeroCaption")) {
  fail("Homepage hero caption markup must be omitted when the selected editorial hero has no public caption.");
}

const heroMarkup = mainSource.slice(mainSource.indexOf("<section class=\"home-hero\""), mainSource.indexOf("<section class=\"hero-proof-strip\""));
const eagerCount = (heroMarkup.match(/loading="eager"/g) ?? []).length;
const highPriorityCount = (heroMarkup.match(/fetchpriority="high"/g) ?? []).length;
if (eagerCount !== 1 || highPriorityCount !== 1) {
  fail(`Homepage hero should eagerly load exactly one high-priority image; found eager=${eagerCount}, high=${highPriorityCount}.`);
}
if (!mainSource.includes("homepageHeroDesktopSrcSet") || !mainSource.includes("homepageHeroMobileSrcSet") || (mainSource.match(/sizes="100vw"/g) ?? []).length < 2) {
  fail("Homepage hero should expose responsive desktop/mobile srcsets with 100vw sizing.");
}
if (!mainSource.includes('width="${homepageAssets.hero.width}"') || !mainSource.includes('height="${homepageAssets.hero.height}"')) {
  fail("Homepage hero should publish intrinsic source dimensions on the eager image.");
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

if (!mainSource.includes("Map temporarily unavailable") || !mainSource.includes("The building map could not load.")) {
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
