import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scanGlobs = [
  "src/main.ts",
  "src/data",
  "public/data",
  "dist",
];

const blockedPatterns = [
  /\bsource-aware\b/i,
  /\bpipeline signal\b/i,
  /\bbuyer reliance\b/i,
  /\bpublic-source research model\b/i,
  /\bneeds_review\b/i,
  /\bpending approval\b/i,
  /\bimported image\b/i,
  /\bcrawl\b/i,
  /\bfuture backend\b/i,
  /\bhandler\b/i,
  /\bauthorization(?: pending)?\b/i,
  /\bsign[-\s]?off\b/i,
  /\bapproved by Brooke\b/i,
  /\binternal review\b/i,
  /\bteam context\b/i,
  /\bnewsletter-ready note\b/i,
  /\bworkflow\/editorial scaffolding\b/i,
];

const ignoredFragments = [
  "class=\"image-placeholder",
  "image-placeholder-",
  "const importedProjectImages",
  "function importedImagePublicPath",
  "function placedImportedImageForProject",
  "const approvedImportedGallery",
  "handler: () => void",
];

async function main() {
  const files = (await Promise.all(scanGlobs.map((item) => collect(path.join(root, item))))).flat();
  const targets = files.filter((file) => /\.(?:ts|json|html|js)$/i.test(file));
  const findings = [];

  for (const file of targets) {
    const rel = path.relative(root, file);
    const text = await fs.readFile(file, "utf8");
    const lines = text.split(/\n/);
    lines.forEach((line, index) => {
      if (ignoredFragments.some((fragment) => line.includes(fragment))) return;
      for (const pattern of blockedPatterns) {
        const match = line.match(pattern);
        if (match) findings.push(`${rel}:${index + 1}: "${match[0]}"`);
      }
    });
  }

  if (findings.length) {
    console.error(["Customer-facing copy QA failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ customerCopy: "pass", checkedFiles: targets.length }, null, 2));
}

async function collect(target) {
  const stat = await fs.stat(target).catch(() => null);
  if (!stat) return [];
  if (stat.isFile()) return [target];
  const entries = await fs.readdir(target, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => collect(path.join(target, entry.name))));
  return nested.flat();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
