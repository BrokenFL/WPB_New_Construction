import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const failures = [];

async function main() {
  const serverPath = path.join(workspace, "tools/content-studio/server.mjs");
  const server = await fs.readFile(serverPath, "utf8");
  const packageJson = JSON.parse(await fs.readFile(path.join(workspace, "package.json"), "utf8"));

  assert(server.includes('server.listen(port, "127.0.0.1"'), "Content Studio server must bind to 127.0.0.1.");
  assert(!server.includes('"0.0.0.0"') && !server.includes("'0.0.0.0'"), "Content Studio must not bind to 0.0.0.0.");
  assert(packageJson.scripts?.["content:studio"] === "node tools/content-studio/server.mjs", "content:studio npm script is missing or unexpected.");
  assert(packageJson.scripts?.["brooke:builder"] === "node tools/content-studio/server.mjs", "brooke:builder npm script is missing or unexpected.");
  assert(!await pathExists(path.join(workspace, "public/content-studio")), "Content Studio must not exist under public/.");
  assert(!await pathExists(path.join(workspace, "public/brooke-builder")), "Brooke Builder must not exist under public/.");
  assert(!await pathExists(path.join(workspace, "dist/content-studio")), "Content Studio must not be copied into dist/.");
  assert(!await pathExists(path.join(workspace, "dist/brooke-builder")), "Brooke Builder must not be copied into dist/.");

  const mainSource = await fs.readFile(path.join(workspace, "src/main.ts"), "utf8");
  assert(mainSource.includes('"/brooke-builder/"') && mainSource.includes('"/content-studio/"') && mainSource.includes('return "/"'), "Production builder routes must redirect away from the local editor.");
  const redirects = await fs.readFile(path.join(workspace, "public/_redirects"), "utf8");
  assert(redirects.includes("/brooke-builder/ / 302") && redirects.includes("/content-studio/ / 302"), "Production redirects must send builder routes away from the public site.");

  await validateJson("content/overrides/project-copy-overrides.json");
  await validateJson("content/overrides/page-copy-overrides.json");
  await validateJson("content/overrides/project-image-overrides.json");
  await validateJson("content/overrides/homepage-card-overrides.json");
  await validateJson("content/overrides/image-caption-overrides.json");
  await validateJson("content/overrides/editorial-image-overrides.json");
  await validateJson("content/overrides/market-note-overrides.json");
  await validateJson("content/overrides/update-overrides.json");
  await validateJson("content/overrides/project-update-overrides.json");
  await validateJson("content/overrides/team-resource-overrides.json");
  await validateJson("content/overrides/change-log.json");
  await validateJson("content/overrides/content-studio-change-log.json");
  await validateJson("content/news-drafts.json");
  await validateJson("content/newsletter-digest-drafts.json");
  await validateJson("content/news-automation-config.json");

  const imageOverrides = JSON.parse(await fs.readFile(path.join(workspace, "content/overrides/project-image-overrides.json"), "utf8"));
  for (const image of imageOverrides.images ?? []) {
    if (!image.status) failures.push(`Image override ${image.id ?? image.path} is missing status.`);
    if (image.status !== "approved" && image.status !== "needs_review" && image.status !== "rejected") {
      failures.push(`Image override ${image.id ?? image.path} has invalid status ${image.status}.`);
    }
    if (image.path && image.path.startsWith("/")) {
      const publicPath = path.join(workspace, "public", image.path.replace(/^\//, ""));
      if (!await pathExists(publicPath)) failures.push(`Uploaded image path is broken: ${image.path}`);
    }
  }

  const publicText = await collectPublicText();
  for (const phrase of ["Content Studio", "needs_review", "backend label"]) {
    if (publicText.includes(phrase)) failures.push(`Public build/source exposes backend label: ${phrase}`);
  }

  if (failures.length) {
    console.error(["Content Studio safety QA failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ contentStudioSafety: "pass" }, null, 2));
}

async function validateJson(relativePath) {
  try {
    JSON.parse(await fs.readFile(path.join(workspace, relativePath), "utf8"));
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
  }
}

async function collectPublicText() {
  const files = [
    "src/main.ts",
    "src/generated/editorOverrides.ts",
    "public/data/answer-engine-faq.json",
    "public/data/floorplans.json",
  ];
  const texts = await Promise.all(files.map((file) => fs.readFile(path.join(workspace, file), "utf8").catch(() => "")));
  return texts.join("\n");
}

async function pathExists(filePath) {
  return fs.access(filePath).then(() => true).catch(() => false);
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
