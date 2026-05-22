import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainSource = readFileSync(path.join(root, "src/main.ts"), "utf8");
const heroSource = readFileSync(path.join(root, "src/data/homeHeroImages.ts"), "utf8");
const errors = [];

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

if (!mainSource.includes("mouseenter") || !mainSource.includes("focusin")) {
  errors.push("Homepage hero should pause rotation on hover and keyboard focus.");
}

if (!mainSource.includes('matchMedia("(prefers-reduced-motion: reduce)"')) {
  errors.push("Homepage hero should respect prefers-reduced-motion.");
}

if (!heroSource.includes("wpb-geography-map-hero")) {
  errors.push("Homepage hero should keep the geography image in the rotation source.");
}

if (errors.length) {
  console.error(JSON.stringify({ heroPerformance: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ heroPerformance: "pass" }, null, 2));
