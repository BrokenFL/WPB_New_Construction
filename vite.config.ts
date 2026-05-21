import { defineConfig } from "vite";
import { readdir, readFile, rm } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const generatedOnlyPublicDirs = ["models", "concepts"];
const internalPublicDataFiles = [
  "answer-engine-faq.json",
  "floorplans.json",
  "image-clearance-candidates.json",
  "news-feed.json",
  "project-asset-status.json",
  "project-team-credits.json",
  "published-floorplan-assets.json",
];
const distRoot = resolve("dist");

async function listFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFiles(fullPath);
      }
      return [fullPath];
    }),
  );

  return nested.flat();
}

function normalizeDistPath(filePath: string) {
  return `/${relative(distRoot, filePath).split(sep).join("/")}`;
}

async function collectReferencedProjectAssets() {
  const files = await listFiles(distRoot);
  const textAssetPattern = /\.(?:html|css|js|json|xml|txt)$/i;
  const projectPathPattern = /\/projects\/[^"'`()<>\s?#,}]+/g;
  const filenamePattern = /[\w.-]+\.(?:avif|gif|html|jpe?g|pdf|png|svg|webp)/gi;
  const paths = new Set<string>();
  const basenames = new Set<string>();

  await Promise.all(
    files
      .filter((file) => !normalizeDistPath(file).startsWith("/projects/") && textAssetPattern.test(file))
      .map(async (file) => {
        const content = await readFile(file, "utf8");
        for (const match of content.matchAll(projectPathPattern)) {
          try {
            paths.add(decodeURIComponent(match[0]));
          } catch {
            paths.add(match[0]);
          }
        }
        for (const match of content.matchAll(filenamePattern)) {
          basenames.add(match[0]);
        }
      }),
  );

  return { basenames, paths };
}

async function pruneUnreferencedProjectAssets() {
  const projectRoot = resolve(distRoot, "projects");
  const files = await listFiles(projectRoot);
  if (!files.length) {
    return;
  }

  const references = await collectReferencedProjectAssets();
  const unusedFiles = files.filter((file) => {
    const publicPath = normalizeDistPath(file);
    return !references.paths.has(publicPath) && !references.basenames.has(publicPath.split("/").at(-1) ?? "");
  });

  await Promise.all(unusedFiles.map((file) => rm(file, { force: true })));
  await removeEmptyDirs(projectRoot);

  if (unusedFiles.length) {
    console.log(`Pruned ${unusedFiles.length} unreferenced dist/project assets.`);
  }
}

async function removeMirroredProjectHtml() {
  const projectRoot = resolve(distRoot, "projects");
  const files = await listFiles(projectRoot);
  const htmlFiles = files.filter((file) => /\.html?$/i.test(file));
  await Promise.all(htmlFiles.map((file) => rm(file, { force: true })));
  await removeEmptyDirs(projectRoot);

  if (htmlFiles.length) {
    console.log(`Removed ${htmlFiles.length} mirrored project HTML files from dist.`);
  }
}

async function removeEmptyDirs(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries.filter((entry) => entry.isDirectory()).map((entry) => removeEmptyDirs(join(dir, entry.name))));

  if (dir === resolve(distRoot, "projects")) {
    return;
  }

  const remaining = await readdir(dir).catch(() => []);
  if (!remaining.length) {
    await rm(dir, { recursive: true, force: true });
  }
}

export default defineConfig({
  plugins: [
    {
      name: "prune-unused-public-build-assets",
      closeBundle: async () => {
        await Promise.all(
          generatedOnlyPublicDirs.map((dir) =>
            rm(resolve(distRoot, dir), { recursive: true, force: true }),
          ),
        );
        await Promise.all(internalPublicDataFiles.map((file) => rm(resolve(distRoot, "data", file), { force: true })));
        await pruneUnreferencedProjectAssets();
        await removeMirroredProjectHtml();
      },
    },
  ],
});
