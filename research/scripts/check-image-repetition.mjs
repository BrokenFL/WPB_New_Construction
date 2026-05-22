import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const reportPath = path.join(workspace, "research/source-material-review/image-repetition-audit.md");
const sourceFiles = [
  "src/main.ts",
  "src/data/marketNotes.ts",
  "src/data/approvedExternalNews.ts",
  "src/data/editorialImagery.ts",
];

const allowedRepeatedFragments = ["/logo.", "/logo.svg", "brand-mark"];
const routeChecks = [
  {
    label: "Rosewood render stays in Rosewood context",
    imageFragment: "/projects/rosewood/media/",
    allowedFragments: ["rosewood", "Rosewood"],
  },
  {
    label: "Kravis image is cultural context, not a project building",
    imageFragment: "kravis-center-downtown-attraction",
    allowedFragments: ["kravis", "Kravis", "downtown", "Downtown", "cultural"],
  },
  {
    label: "NORA imagery stays with NORA or Downtown district context",
    imageFragment: "nora-growth-corridor",
    allowedFragments: ["nora", "NORA", "downtown", "Downtown"],
  },
  {
    label: "South Flagler imagery stays in South Flagler context",
    imageFragment: "south-flagler-corridor",
    allowedFragments: ["south-flagler", "South Flagler"],
  },
  {
    label: "North Flagler imagery is not used as South Flagler fallback",
    imageFragment: "flagler-waterfront-corridor",
    disallowedFragments: ["south-flagler", "South Flagler"],
  },
];

const projectSpecificRules = [
  ["rosewood", "/projects/rosewood/media/"],
  ["olara", "/projects/olara/media/"],
  ["shorecrest", "/projects/shorecrest/media/"],
  ["nora-house", "/projects/nora-house/media/"],
  ["south-flagler-house", "/projects/south-flagler-house/media/"],
];

async function main() {
  const sourceText = await readSources();
  const imageUsages = collectImageUsages(sourceText);
  const findings = [];
  const rows = [];
  const renderedChecks = await checkRenderedHomepage();
  findings.push(...renderedChecks.findings);

  for (const [imagePath, usages] of imageUsages) {
    const acceptable = isAcceptableRepeat(imagePath, usages);
    if (usages.length > 3 && !acceptable) {
      findings.push(`${imagePath} appears ${usages.length} times in source mappings.`);
    }
    rows.push({
      imagePath,
      routes: [...new Set(usages.map((usage) => usage.context))].join(", "),
      acceptable: acceptable ? "Yes" : usages.length <= 3 ? "Yes, low repetition" : "Needs review",
      recommendation: acceptable || usages.length <= 3 ? "No change required." : "Replace repeated use with project or corridor-specific media.",
      fixes: "Checked by static QA.",
    });
  }

  for (const check of routeChecks) {
    for (const usage of contextualUsages(sourceText, check.imageFragment)) {
      const context = usage.context.toLowerCase();
      const violatesDisallowed = check.disallowedFragments?.some((fragment) => context.includes(fragment.toLowerCase()));
      const satisfiesAllowed = check.allowedFragments?.some((fragment) => context.includes(fragment.toLowerCase())) ?? true;
      if (violatesDisallowed || !satisfiesAllowed) {
        findings.push(`${check.label}: ${usage.file}:${usage.line} has context "${usage.context}".`);
      }
    }
  }

  for (const [projectId, expectedPath] of projectSpecificRules) {
    if (sourceText.includes(`"${projectId}"`) && !sourceText.includes(expectedPath)) {
      findings.push(`${projectId} has project references but no matching project image path ${expectedPath}.`);
    }
  }

  await writeReport(rows, findings, renderedChecks);

  if (findings.length) {
    console.error(["Image repetition QA failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ imageRepetition: "pass", imagesChecked: imageUsages.size, reportPath: path.relative(workspace, reportPath) }, null, 2));
}

async function readSources() {
  const entries = await Promise.all(
    sourceFiles.map(async (relativePath) => ({
      relativePath,
      text: await fs.readFile(path.join(workspace, relativePath), "utf8"),
    })),
  );
  return entries;
}

function collectImageUsages(sources) {
  const usages = new Map();
  for (const source of sources) {
    const lines = source.text.split(/\n/);
    lines.forEach((line, index) => {
      for (const match of line.matchAll(/["'`]((?:\/assets|\/projects)[^"'`]+?\.(?:jpg|jpeg|png|webp|svg))["'`]/gi)) {
        const imagePath = match[1];
        const context = nearbyContext(lines, index);
        if (!usages.has(imagePath)) usages.set(imagePath, []);
        usages.get(imagePath).push({ file: source.relativePath, line: index + 1, context });
      }
    });
  }
  return usages;
}

function contextualUsages(sources, fragment) {
  const results = [];
  for (const source of sources) {
    const lines = source.text.split(/\n/);
    lines.forEach((line, index) => {
      if (!line.includes(fragment)) return;
      if (/\b(?:const|return|if)\b/.test(line)) return;
      results.push({ file: source.relativePath, line: index + 1, context: nearbyContext(lines, index) });
    });
  }
  return results;
}

function nearbyContext(lines, index) {
  const window = lines.slice(Math.max(0, index - 8), Math.min(lines.length, index + 9)).join(" ");
  const project = window.match(/id:\s*"([^"]+)"/)?.[1] ?? window.match(/projectId:\s*"([^"]+)"/)?.[1];
  const slug = window.match(/slug:\s*"([^"]+)"/)?.[1];
  const route = window.match(/routeUse:\s*\[([^\]]+)/)?.[1];
  return project ?? slug ?? route?.replaceAll('"', "").trim() ?? "shared source";
}

function isAcceptableRepeat(imagePath, usages) {
  if (allowedRepeatedFragments.some((fragment) => imagePath.includes(fragment))) return true;
  const contexts = new Set(usages.map((usage) => usage.context));
  if (contexts.size === 1) return true;
  if (imagePath.includes("/assets/editorial/") && usages.length <= 3) return true;
  return false;
}

async function checkRenderedHomepage() {
  const htmlPath = path.join(workspace, "dist/index.html");
  const html = await fs.readFile(htmlPath, "utf8").catch(() => "");
  const findings = [];
  const imageOrder = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)]
    .map((match) => match[1])
    .filter((src) => /\/(?:assets|projects|hero)\//.test(src));
  for (let index = 1; index < imageOrder.length; index += 1) {
    if (normalizeImage(imageOrder[index]) === normalizeImage(imageOrder[index - 1])) {
      findings.push(`Rendered homepage repeats the same image back-to-back: ${imageOrder[index]}.`);
    }
    if (isProjectImage(imageOrder[index], "olara") && isProjectImage(imageOrder[index - 1], "olara")) {
      findings.push("Rendered homepage shows Olara imagery in adjacent image positions.");
    }
  }
  const genericEditorial = imageOrder.filter((src) => /wpb-geography-map-hero|rosemary-square-corridor|flagler-waterfront-corridor/.test(src));
  if (genericEditorial.length > 4) {
    findings.push(`Rendered homepage uses generic geography/corridor imagery ${genericEditorial.length} times; replace repeated section art with more specific media.`);
  }
  return { imageOrder, findings, htmlChecked: Boolean(html) };
}

function normalizeImage(src) {
  return src.split("?")[0].replace(/-\d+x\d+(?=\.)/, "");
}

function isProjectImage(src, projectId) {
  return src.includes(`/projects/${projectId}/`) || src.toLowerCase().includes(projectId);
}

async function writeReport(rows, findings, renderedChecks) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  const lines = [
    "# Image Repetition Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    findings.length
      ? `- Blocking findings: ${findings.length}`
      : "- Blocking findings: 0",
    `- Rendered homepage checked: ${renderedChecks.htmlChecked ? "yes" : "no dist/index.html found before build"}`,
    "- Logos and same-project reuse are treated as acceptable.",
    "- Project/corridor mismatch rules are checked for Rosewood, Olara, Shorecrest, NORA House, South Flagler, Kravis, and NORA district imagery.",
    "- Rendered homepage checks block back-to-back duplicate images, adjacent Olara imagery, and overuse of generic geography/corridor imagery.",
    "",
    "## Rendered Homepage Image Order",
    "",
    ...(renderedChecks.imageOrder.length ? renderedChecks.imageOrder.map((src, index) => `- ${index + 1}. ${src}`) : ["- Not available before a local build."]),
    "",
    "## Findings",
    "",
    ...(findings.length ? findings.map((finding) => `- ${finding}`) : ["- No blocking image repetition or context mismatch findings."]),
    "",
    "## Image Inventory",
    "",
    "| Image path | Routes where it appears | Acceptable? | Replacement recommendation | Fixes applied |",
    "| --- | --- | --- | --- | --- |",
    ...rows
      .sort((a, b) => a.imagePath.localeCompare(b.imagePath))
      .map((row) => `| ${row.imagePath} | ${row.routes.replace(/\|/g, "/")} | ${row.acceptable} | ${row.recommendation} | ${row.fixes} |`),
    "",
  ];
  await fs.writeFile(reportPath, `${lines.join("\n")}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
