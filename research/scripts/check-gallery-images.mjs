import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceFiles = ["src/main.ts", "src/style.css"];
const maxReferencedProjectImageBytes = 1.5 * 1024 * 1024;
const errors = [];

const source = sourceFiles.map((file) => readFileSync(path.join(root, file), "utf8")).join("\n");
const imageRefs = [...new Set(
  [...source.matchAll(/["'`]((?:\/projects|\/assets\/editorial)\/[^"'`]+?\.(?:jpe?g|png|webp))/gi)].map((match) => match[1]),
)];

for (const ref of imageRefs) {
  const filePath = path.join(root, "public", ref.replace(/^\//, ""));
  if (!existsSync(filePath)) {
    errors.push(`Missing referenced image: ${ref}`);
    continue;
  }

  const size = statSync(filePath).size;
  if (ref.startsWith("/projects/") && size > maxReferencedProjectImageBytes) {
    errors.push(`Referenced project image exceeds 1.5 MB: ${ref} (${formatBytes(size)})`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ galleryImages: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ galleryImages: "pass", referencedImages: imageRefs.length }, null, 2));

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}
