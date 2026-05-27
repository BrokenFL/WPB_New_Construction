import { execFileSync } from "node:child_process";
import fs from "node:fs";

const allowedReviewPattern = /^research\/imported-project-images\/review\/.+\.(?:jpe?g|png|webp|gif|avif|html|md)$/i;
const imagePattern = /\.(?:jpe?g|png|webp|gif|avif)$/i;
const ignoredPattern = /(?:^|\/)(?:\.DS_Store|Thumbs\.db)$/i;
const generatedPublishManifestPath = "data/generated_asset_publish_manifest.json";

function gitOthers() {
  try {
    return execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const untracked = gitOthers().filter((file) => !ignoredPattern.test(file));
const untrackedImages = untracked.filter((file) => imagePattern.test(file));
const generatedPublishedAssets = readGeneratedPublishedAssets();
const publicImages = untrackedImages.filter((file) => file.startsWith("public/") && !generatedPublishedAssets.has(file));
const reviewImages = untrackedImages.filter((file) => allowedReviewPattern.test(file));
const otherImages = untrackedImages.filter((file) => !file.startsWith("public/") && !allowedReviewPattern.test(file));

if (publicImages.length) {
  console.error(
    [
      "Untracked public image assets are not allowed.",
      "Move them to research/imported-project-images/review/ for review, commit approved records intentionally, or remove accidental files.",
      ...publicImages.map((file) => `- ${file}`),
    ].join("\n"),
  );
  process.exit(1);
}

if (otherImages.length) {
  console.warn(["Untracked image assets outside public review areas:", ...otherImages.map((file) => `- ${file}`)].join("\n"));
}

if (reviewImages.length) {
  console.warn(["Untracked review images present:", ...reviewImages.map((file) => `- ${file}`)].join("\n"));
}

console.log(
  JSON.stringify(
    {
      untrackedAssets: "pass",
      untrackedImages: untrackedImages.length,
      publicImages: publicImages.length,
      generatedPublishedAssets: untrackedImages.filter((file) => generatedPublishedAssets.has(file)).length,
      reviewImages: reviewImages.length,
      otherImages: otherImages.length,
    },
    null,
    2,
  ),
);

function readGeneratedPublishedAssets() {
  if (!fs.existsSync(generatedPublishManifestPath)) return new Set();
  try {
    const entries = JSON.parse(fs.readFileSync(generatedPublishManifestPath, "utf8"));
    if (!Array.isArray(entries)) return new Set();
    return new Set(entries
      .map((entry) => entry.websiteAssetPath)
      .filter((assetPath) => typeof assetPath === "string" && assetPath.startsWith("public/")));
  } catch {
    return new Set();
  }
}
