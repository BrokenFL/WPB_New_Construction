import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const scanRoots = ["src/main.ts", "src/data", "public/data", "dist"].map((item) => path.join(workspace, item));
const awkwardPatterns = [
  /\bbackend\b/i,
  /\bfront-end only\b/i,
  /\bfuture CRM\b/i,
  /\breview queue\b/i,
  /\bneeds[_ -]review\b/i,
  /\bneeds[_ -]sourcing\b/i,
  /\binternal review\b/i,
  /\bsource-material\b/i,
  /\bsource material\b/i,
  /\bsource records?\b/i,
  /\bcurrent record uses\b/i,
  /\bsource conflicts?\b/i,
  /\bapproved by\b/i,
  /\bauthorized by\b/i,
  /\bsign[-\s]?off\b/i,
  /\bdata model\b/i,
  /\bpublic-source record\b/i,
  /\bpipeline watch item\b/i,
  /\bwatch item\b/i,
  /\bunknown fields\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
];
const staleDatePattern = /\b(?:updated|last checked|last refreshed)\s+(?:202[0-4]|Jan\.?\s+202[0-5]|Feb\.?\s+202[0-5]|Mar\.?\s+202[0-5]|Apr\.?\s+202[0-5]|May\s+202[0-5])/i;
const repeatedGenericPhrases = [
  "buyer-relevant",
  "source-linked",
  "public updates",
  "verify before relying",
];
const ignoreFragments = [
  "check-public-copy-quality",
  "qa-gatekeeper-surface",
  "blockedPublicPhrases",
  "awkwardPatterns",
  ".replace(/\\bsource",
  ".replace(/\\bcurrent record",
  ".replace(/\\bwatch",
  "source-material-review",
  "research/source-material",
  "status: \"needs-review\"",
  "\"status\": \"needs-review\"",
  "imageStatus:",
  "imageStatus: \"needs-sourcing\"",
  "\"needs-sourcing\"",
];

async function main() {
  const files = (await Promise.all(scanRoots.map(collect))).flat();
  const targets = files.filter((file) => {
    if (file.startsWith(path.join(workspace, "dist"))) return /\.(?:html|json|txt|xml)$/i.test(file);
    return /\.(?:ts|js|html|json|txt|xml)$/i.test(file);
  });
  const findings = [];

  for (const file of targets) {
    const rel = path.relative(workspace, file);
    const text = await fs.readFile(file, "utf8");
    const lines = text.split(/\n/);
    lines.forEach((line, index) => {
      if (ignoreFragments.some((fragment) => line.includes(fragment))) return;
      for (const pattern of awkwardPatterns) {
        const match = line.match(pattern);
        if (match) findings.push(`${rel}:${index + 1}: backend-sounding phrase "${match[0]}"`);
      }
      const stale = line.match(staleDatePattern);
      if (stale) findings.push(`${rel}:${index + 1}: stale-looking public date "${stale[0]}"`);
    });

    for (const phrase of repeatedGenericPhrases) {
      const count = text.toLowerCase().split(phrase).length - 1;
      if (count > 18) findings.push(`${rel}: repeated generic phrase "${phrase}" appears ${count} times`);
    }
  }

  if (findings.length) {
    console.error(["Public copy quality check failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ publicCopyQuality: "pass", checkedFiles: targets.length }, null, 2));
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
