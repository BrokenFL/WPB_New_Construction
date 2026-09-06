import fs from "node:fs/promises";
import path from "node:path";
import { sharedBlockedPhraseRules } from "./public-copy-safety.mjs";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");

const textFilePattern = /\.(?:html|xml|json|txt|js)$/i;
const blockedVisiblePhrases = [
  ...sharedBlockedPhraseRules.map((rule) => rule.gatekeeperPattern || rule.pattern),
  /\bfuture CRM\b/i,
  /\bapproved by\b/i,
  /\bauthorized by\b/i,
  /\b(?:internal|editorial|Brooke(?:'s)?|source[-\s]?material)\s+(?:team\s+)?(?:has\s+)?signed\s+off\b/i,
  /\bgenerated\b/i,
  /\bsource-catalog\b/i,
  /\bproject-source-catalog\b/i,
];
const blockedHrefHosts = [
  /(?:^|\.)albapalmbeach\.com$/i,
  /(?:^|\.)banyantreeresidenceswpb\.com$/i,
  /(?:^|\.)fortewpb\.com$/i,
  /(?:^|\.)greatgulf(?:group)?\.com$/i,
  /(?:^|\.)livemaisondor\.com$/i,
  /(?:^|\.)mandarinorientalwestpalmbeach\.com$/i,
  /(?:^|\.)mrcresidenceswpb\.com$/i,
  /(?:^|\.)norahouse\.com$/i,
  /(?:^|\.)relatedross\.com$/i,
  /(?:^|\.)shorecrestwpb\.com$/i,
  /(?:^|\.)southflaglerhouse\.com$/i,
  /(?:^|\.)terragroup\.com$/i,
];

async function main() {
  const files = await listFiles(distRoot);
  const findings = [];

  await Promise.all(
    files
      .filter((file) => textFilePattern.test(file))
      .map(async (file) => {
        const rel = path.relative(workspace, file);
        const rawContent = await fs.readFile(file, "utf8");
        const content = rel.endsWith(".html") ? stripStaticPrerender(rawContent) : rawContent;
        for (const pattern of blockedVisiblePhrases) {
          const match = content.match(pattern);
          if (match && !isAllowedTechnicalOccurrence(rel, content, match[0])) findings.push(`${rel}: blocked public phrase "${match[0]}"`);
        }
        for (const href of extractHrefValues(content)) {
          if (isBlockedHref(href)) findings.push(`${rel}: blocked outbound project link ${href}`);
        }
      }),
  );

  if (findings.length) {
    console.error(["Gatekeeper QA failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ gatekeeperSurface: "pass", checkedFiles: files.length }, null, 2));
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

function extractHrefValues(content) {
  const values = [];
  for (const match of content.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) values.push(match[1]);
  return values;
}

function isBlockedHref(href) {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const host = new URL(href).hostname;
    return blockedHrefHosts.some((pattern) => pattern.test(host));
  } catch {
    return false;
  }
}

function stripStaticPrerender(content) {
  return content.replace(/<main\s+class="static-prerender"[\s\S]*?<\/main>/gi, "");
}

function isAllowedTechnicalOccurrence(rel, content, phrase) {
  if (/record/i.test(phrase) && /\brecord-setting\b/i.test(content)) return true;
  // Bootstrap emits the unchanged application as main-*.js instead of index-*.js.
  // Preserve the same technical-context test; do not exempt visible copy or hosts.
  if (/^dist\/assets\/(?:index|main)-[^/]+\.js$/i.test(rel)) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const technical = new RegExp(
      `(?:class|dataset|data|image|editorial|input|css|placeholder|generated)[^\\n]{0,80}${escaped}|${escaped}[^\\n]{0,80}(?:class|dataset|data|image|editorial|input|css|placeholder|generated)`,
      "i",
    );
    if (technical.test(content)) return true;
  }
  if (/\/(?:image-clearance-candidates|floorplans)\.json$/i.test(rel) && /record|placeholder|generated/i.test(phrase)) return true;
  return false;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
