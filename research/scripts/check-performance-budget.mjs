import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const roots = ["src", "public"].map((item) => path.join(workspace, item));
const distAssets = path.join(workspace, "dist/assets");
const maxEditorialBytes = 750 * 1024;
const maxPublicImageBytes = 1.5 * 1024 * 1024;
const maxJsBytes = 450 * 1024;
const maxCssBytes = 140 * 1024;
const preExistingLargeImageAllowlist = [
  /^public\/projects\//,
  /^public\/concepts\//,
  /^public\/maps\/wpb-atlas-map\.png$/,
];

async function main() {
  const files = (await Promise.all(roots.map(listFiles))).flat();
  const findings = [];

  for (const file of files.filter((item) => /\.(?:ts|tsx|js|html|css)$/i.test(item))) {
    const rel = path.relative(workspace, file);
    const content = await fs.readFile(file, "utf8");
    if (/decoding\s*=\s*["']sync["']/i.test(content)) findings.push(`${rel}: decoding="sync" is not allowed`);
    const eagerCount = [...content.matchAll(/loading\s*=\s*["']eager["']/gi)].length;
    if (eagerCount > 1) findings.push(`${rel}: too many eager images (${eagerCount})`);
    const highCount = [...content.matchAll(/fetchpriority\s*=\s*["']high["']/gi)].length;
    if (highCount > 1) findings.push(`${rel}: too many high-priority images (${highCount})`);
  }

  for (const file of files.filter((item) => /\.(?:jpe?g|png|webp)$/i.test(item))) {
    const rel = path.relative(workspace, file);
    const size = (await fs.stat(file)).size;
    if (rel.startsWith("public/assets/editorial/") && size > maxEditorialBytes) {
      findings.push(`${rel}: editorial image exceeds ${formatBytes(maxEditorialBytes)} (${formatBytes(size)})`);
    } else if (size > maxPublicImageBytes && !preExistingLargeImageAllowlist.some((pattern) => pattern.test(rel))) {
      findings.push(`${rel}: public image exceeds ${formatBytes(maxPublicImageBytes)} (${formatBytes(size)})`);
    }
  }

  for (const file of await listFiles(distAssets)) {
    const rel = path.relative(workspace, file);
    const size = (await fs.stat(file)).size;
    if (/\.js$/i.test(file) && size > maxJsBytes) findings.push(`${rel}: JS chunk exceeds ${formatBytes(maxJsBytes)} (${formatBytes(size)})`);
    if (/\.css$/i.test(file) && size > maxCssBytes) findings.push(`${rel}: CSS chunk exceeds ${formatBytes(maxCssBytes)} (${formatBytes(size)})`);
  }

  if (findings.length) {
    console.error(["Performance budget check failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ performanceBudget: "pass" }, null, 2));
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }),
  );
  return nested.flat();
}

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
