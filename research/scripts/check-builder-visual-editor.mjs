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
  // Visual Editor now uses a real Vite dev server iframe instead of client-side HTML rendering.
  // The <iframe id="sitePreviewIframe"> replaces #pagePreview; the Vite loading overlay replaces visual-page-preview.
  assert(html.includes('id="sitePreviewIframe"') && html.includes("site-preview-iframe"), "Homepage visual preview iframe is missing.");
  assert(html.includes('id="viteLoadingOverlay"'), "Vite loading overlay is missing.");
  assert(html.includes('id="selectedDropZone"') && html.includes('id="visualDropFile"'), "Homepage card drop zone is missing.");
  assert(html.includes('id="projectEditorPanel"'), "Project page editor panel is missing.");
  assert(html.includes('id="projectImageDropZone"') && html.includes('id="projectImageDropFile"'), "Project hero image drop zone is missing.");
  assert(html.includes('id="preCommitResults"'), "Pre-commit check results panel is missing.");

  // Iframe navigation — replaces sitePreviewMarkup/visualHeroSection etc.
  assert(app.includes("function visualPageUrl()"), "Visual Editor must navigate the iframe to the correct live URL.");
  assert(app.includes("function renderLivePagePreview()") && app.includes("sitePreviewIframe"), "renderLivePagePreview must navigate the real-site iframe.");
  assert(app.includes("function syncEditorPanels()"), "Visual Editor must show the right editor panel for each page type.");
  assert(app.includes("function waitForViteAndLoad()"), "Visual Editor must wait for the Vite dev server before loading the iframe.");
  assert(app.includes("function populatePageSelector()"), "Page selector must be populated dynamically with project options.");
  assert(app.includes("function renderProjectEditor("), "Project page editor must render override fields for the selected project.");
  assert(app.includes("function runPreCommitChecks()"), "Pre-commit check gate must be wired up.");
  assert(app.includes("function commitVisualEditorChanges()"), "Commit + push flow must be present in the Visual Editor.");

  assert(app.includes("activeVisualMode") && css.includes("preview-only-mode"), "Clean preview mode must expand the iframe to fill the canvas.");
  assert(app.includes("handleVisualImageDrop") && app.includes("/api/upload-image") && app.includes("/api/homepage-card-overrides"), "Homepage card drag/drop image replacement must upload and assign an override.");
  assert(app.includes("sourceRightsNote") && app.includes("verify rights before approval"), "Image replacement needs a rights/source note path.");
  assert(app.includes("resolveBuilderAssetUrl") && app.includes("state?.assetBaseUrl"), "Visual Editor must reuse canonical remote image resolution.");
  assert(!/\/(?:Users|Volumes)\//.test(html), "Builder HTML must not contain filesystem image paths.");

  assert(css.includes(".visual-editor-shell") && css.includes(".site-preview-iframe"), "Visual Editor layout and iframe styles are missing.");
  assert(css.includes("preview-only-mode"), "Preview-only mode styles must hide the editor panel and expand the iframe.");
  assert(css.includes(".project-edit-panel") && css.includes(".pre-commit-results"), "Project editor and pre-commit result styles are missing.");
  assert(css.includes(".visual-drop-box") && css.includes(".is-drop-target"), "Drag/drop styles are missing.");

  assert(pkg.scripts?.["qa:builder-visual"] === "node research/scripts/check-builder-visual-editor.mjs", "qa:builder-visual script is missing.");
  assert(
    `${pkg.scripts?.["qa:launch"] ?? ""} ${pkg.scripts?.["qa:launch:run"] ?? ""}`.includes("qa:builder-visual"),
    "qa:launch must include qa:builder-visual.",
  );

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
