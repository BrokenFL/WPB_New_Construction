import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const scanRoots = ["public", "dist"].map((item) => path.join(workspace, item));
const blockedPatterns = [
  /sign[-\s]?off/i,
  /signed\s+off/i,
  /authorization/i,
  /authorized/i,
  /endorsement/i,
  /endorsed/i,
  /approved\s+by\s+Brooke/i,
  /cleared\s+by\s+Brooke/i,
  /internal\s+approval/i,
  /source-material\s+review/i,
  /future\s+backend/i,
  /front-end\s+only/i,
  /info@example\.com/i,
  /example\.com/i,
];

const allowlistedFiles = new Set([
  "public/_redirects",
]);

async function main() {
  const files = (await Promise.all(scanRoots.map(listFiles))).flat();
  const findings = [];

  for (const file of files) {
    const rel = path.relative(workspace, file);
    if (allowlistedFiles.has(rel)) continue;
    if (!/\.(?:json|txt|xml|html)$/i.test(file)) continue;
    const content = await fs.readFile(file, "utf8");
    for (const pattern of blockedPatterns) {
      const match = content.match(pattern);
      if (match) findings.push(`${rel}: blocked public JSON/text phrase "${match[0]}"`);
    }
  }

  if (findings.length) {
    console.error(["Public JSON safety failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ publicJsonSafety: "pass", checkedFiles: files.length }, null, 2));
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
