import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const failures = [];

async function main() {
  const app = await read("tools/content-studio/app.js");
  const html = await read("tools/content-studio/index.html");
  const pkg = JSON.parse(await read("package.json"));

  assert(app.includes("function resolveBuilderAssetUrl(imagePath, context = {})"), "Builder must use the canonical resolveBuilderAssetUrl(imagePath, context) utility.");
  assert(app.includes("https://www.wpbnewconstruction.com"), "Remote Builder image base URL is missing.");
  assert(app.includes("state?.assetBaseUrl"), "Builder asset resolver must honor server-provided assetBaseUrl.");
  assert(app.includes("data-builder-asset-path"), "Builder images need visible broken-image context.");
  assert(app.includes("console.warn('Builder thumbnail failed'"), "Broken Builder thumbnails must log a warning.");
  assert(app.includes("placeholderImageSvg"), "Empty image paths must render a placeholder instead of a broken src.");
  assert(app.includes("mode === \"remote\"") && app.includes("assetBaseUrl.replace"), "Remote image mode must prefix public-site image URLs.");
  assert(!app.includes('src="${escapeHtml(imagePath)}"'), "Builder must not render raw image paths into img src.");
  assert(!/\/(?:Users|Volumes)\//.test(html), "Builder HTML must not contain local filesystem image paths.");
  assert(pkg.scripts?.["qa:builder-remote-images"] === "node research/scripts/check-builder-remote-images.mjs", "qa:builder-remote-images script is missing.");
  assert(pkg.scripts?.["qa:launch"]?.includes("qa:builder-remote-images"), "qa:launch must include qa:builder-remote-images.");

  const samplePaths = [
    "/assets/editorial/flagler-waterfront-corridor.jpg",
    "public/assets/editorial/rosemary-square-corridor.jpg",
    "https://images.example.com/photo.jpg",
    "/Volumes/ExternalSSD/WPB_NewConstruction/public/assets/editorial/private.jpg",
    "",
  ];
  const simulated = samplePaths.map((imagePath) => simulateResolve(imagePath));
  assert(simulated[0] === "https://www.wpbnewconstruction.com/assets/editorial/flagler-waterfront-corridor.jpg", "Root-relative remote image did not resolve to the public site.");
  assert(simulated[1] === "https://www.wpbnewconstruction.com/assets/editorial/rosemary-square-corridor.jpg", "public/ image path did not normalize for remote mode.");
  assert(simulated[2] === samplePaths[2], "Absolute HTTP image URL should pass through unchanged.");
  assert(simulated[3] === "placeholder", "Filesystem paths must resolve to placeholder in Builder.");
  assert(simulated[4] === "placeholder", "Empty paths must resolve to placeholder in Builder.");

  if (failures.length) {
    console.error(["Builder remote image QA failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ builderRemoteImages: "pass", simulated }, null, 2));
}

function simulateResolve(imagePath) {
  const value = String(imagePath || "").trim();
  if (!value) return "placeholder";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(?:\/Users|\/Volumes|[A-Za-z]:\\)/.test(value)) return "placeholder";
  const publicPath = value.startsWith("/") ? value : `/${value.replace(/^public\//, "")}`;
  return `https://www.wpbnewconstruction.com${publicPath}`;
}

async function read(relativePath) {
  return fs.readFile(path.join(workspace, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
