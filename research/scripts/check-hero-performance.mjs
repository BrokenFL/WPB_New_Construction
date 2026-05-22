import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainSource = readFileSync(path.join(root, "src/main.ts"), "utf8");
const styleSource = readFileSync(path.join(root, "src/style.css"), "utf8");
const heroSource = readFileSync(path.join(root, "src/data/homeHeroImages.ts"), "utf8");
const errors = [];
const rotationMatch = mainSource.match(/HERO_ROTATION_INTERVAL_MS\s*=\s*(\d+)/);
const fadeMatch = mainSource.match(/HERO_FADE_DURATION_MS\s*=\s*(\d+)/);
const rotationInterval = rotationMatch ? Number(rotationMatch[1]) : 0;
const fadeDuration = fadeMatch ? Number(fadeMatch[1]) : 0;

const heroMarkup = mainSource.slice(
  mainSource.indexOf("<section class=\"home-hero\""),
  mainSource.indexOf("<section class=\"hero-proof-strip\""),
);

const eagerCount = (heroMarkup.match(/loading="eager"/g) ?? []).length;
const highPriorityCount = (heroMarkup.match(/fetchpriority="high"/g) ?? []).length;
const lazyCount = (heroMarkup.match(/loading="lazy"/g) ?? []).length;

if (eagerCount !== 1 || highPriorityCount !== 1) {
  errors.push(`Homepage hero should load exactly one eager/high-priority image; eager=${eagerCount}, high=${highPriorityCount}.`);
}

if (lazyCount < 1 || !heroMarkup.includes('data-home-hero-layer="next"')) {
  errors.push("Homepage hero should keep the next rotating layer lazy-loaded.");
}

if (rotationInterval < 14000 || rotationInterval > 18000) {
  errors.push(`Homepage hero rotation should stay calm at 14-18 seconds; found ${rotationInterval || "missing"}ms.`);
}

if (fadeDuration < 1500 || fadeDuration > 2500) {
  errors.push(`Homepage hero fade should stay smooth at 1.5-2.5 seconds; found ${fadeDuration || "missing"}ms.`);
}

if (!mainSource.includes("HERO_ROTATION_INTERVAL_MS") || !mainSource.includes("HERO_FADE_DURATION_MS")) {
  errors.push("Homepage hero timing should use named constants.");
}

if (!mainSource.includes("decode()") || !mainSource.includes("isTransitioning")) {
  errors.push("Homepage hero should preload/decode the next layer and guard against overlapping fades.");
}

if (!mainSource.includes("mouseenter") || !mainSource.includes("focusin")) {
  errors.push("Homepage hero should pause rotation on hover and keyboard focus.");
}

if (!mainSource.includes('matchMedia("(prefers-reduced-motion: reduce)"')) {
  errors.push("Homepage hero should respect prefers-reduced-motion.");
}

if (!heroSource.includes("wpb-geography-map-hero")) {
  errors.push("Homepage hero should keep the geography image in the rotation source.");
}

if (!/\.home-hero-media[\s\S]*?position:\s*(?:absolute|relative)/.test(styleSource) || !/\.home-hero-image[\s\S]*?position:\s*absolute/.test(styleSource)) {
  errors.push("Homepage hero image layers should remain stacked without layout animation.");
}

if (!styleSource.includes("transition: opacity 1800ms ease")) {
  errors.push("Homepage hero crossfade should use the documented 1800ms opacity transition.");
}

if (errors.length) {
  console.error(JSON.stringify({ heroPerformance: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ heroPerformance: "pass", rotationInterval, fadeDuration }, null, 2));
