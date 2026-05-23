import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const failures = [];

async function main() {
  const app = await read("tools/content-studio/app.js");
  const html = await read("tools/content-studio/index.html");
  const css = await read("tools/content-studio/style.css");
  const pkg = JSON.parse(await read("package.json"));

  assert(html.includes("Visual Editor"), "Visual Editor must be the primary Builder navigation item.");
  assert(html.includes("Advanced Editor"), "Existing card-level editor must remain available as Advanced Editor.");
  assert(html.includes('id="visualPageSelect"'), "Visual Editor needs the page selector.");
  assert(html.includes('id="editModeButton"') && html.includes('id="previewModeButton"'), "Edit/Preview mode controls are missing.");
  assert(html.includes('id="pagePreview"') && html.includes("visual-page-preview"), "Homepage visual preview container is missing.");
  assert(html.includes('id="selectedDropZone"') && html.includes('id="visualDropFile"'), "Side-panel image drop zone is missing.");

  assert(app.includes("function sitePreviewMarkup()"), "Visual Editor must render a site-like homepage preview.");
  assert(app.includes("visualHeroSection") && app.includes("visualMapSection") && app.includes("visualCardSection"), "Visual preview must include hero, map, and card sections.");
  assert(app.includes('visualCardSection("corridors"') && app.includes('visualCardSection("updates"') && app.includes('visualCardSection("guidance"') && app.includes('visualCardSection("featuredBuildings"'), "Homepage preview must render corridors, updates, guidance, and featured buildings.");
  assert(app.includes("visualCtaSection"), "Homepage preview must render CTA.");
  assert(app.includes("hotspot-label") && app.includes("data-preview-section") && app.includes("is-selected"), "Editable overlay hotspot behavior is missing.");
  assert(app.includes("activeVisualMode") && css.includes(".mode-preview .hotspot-label"), "Clean preview mode must hide edit overlays.");
  assert(app.includes("handleVisualImageDrop") && app.includes("/api/upload-image") && app.includes("/api/homepage-card-overrides"), "Drag/drop image replacement must upload and assign an override.");
  assert(app.includes("sourceRightsNote") && app.includes("verify rights before approval"), "Image replacement needs a rights/source note path.");
  assert(app.includes("resolveBuilderAssetUrl") && app.includes("state?.assetBaseUrl"), "Visual Editor must reuse canonical remote image resolution.");
  assert(!/\/(?:Users|Volumes)\//.test(html), "Builder HTML must not contain filesystem image paths.");

  assert(css.includes(".visual-editor-shell") && css.includes(".site-preview-frame"), "Visual Editor layout styles are missing.");
  assert(css.includes(".mode-preview .hotspot-label") && css.includes(".visual-hotspot.is-selected"), "Overlay visibility styles are missing.");
  assert(css.includes(".visual-drop-box") && css.includes(".is-drop-target"), "Drag/drop styles are missing.");

  assert(pkg.scripts?.["qa:builder-visual"] === "node research/scripts/check-builder-visual-editor.mjs", "qa:builder-visual script is missing.");
  assert(pkg.scripts?.["qa:launch"]?.includes("qa:builder-visual"), "qa:launch must include qa:builder-visual.");

  if (failures.length) {
    console.error(["Builder visual editor QA failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ builderVisualEditor: "pass" }, null, 2));
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
