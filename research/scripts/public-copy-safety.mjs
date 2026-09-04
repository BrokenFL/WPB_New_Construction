// These phrases are unsafe in article packages and rendered reader-facing output.
// The gatekeeper imports this list so the two checks cannot drift on shared policy.
export const sharedBlockedPhraseRules = [
  { label: "backend", pattern: /\bbackend\b/i, example: "backend" },
  { label: "front-end only", pattern: /\bfront-end only\b/i, example: "front-end only" },
  { label: "review queue", pattern: /\breview queue\b/i, example: "review queue" },
  { label: "needs_review", pattern: /\bneeds[_\s-]+review\b/i, gatekeeperPattern: /\bneeds review\b/i, example: "needs review" },
  { label: "needs-sourcing", pattern: /\bneeds-sourcing\b/i, example: "needs-sourcing" },
  { label: "internal", pattern: /\binternal\b/i, example: "internal" },
  { label: "source-material", pattern: /\bsource-material\b/i, example: "source-material" },
  { label: "pending sign-off", pattern: /\b(?:awaiting|pending|needs|required(?:\s+to\s+obtain)?)\s+(?:final\s+)?sign[-\s]?off\b/i, example: "awaiting final sign-off" },
  { label: "data model", pattern: /\bdata model\b/i, example: "data model" },
  { label: "placeholder", pattern: /\bplaceholder\b/i, example: "placeholder" },
  { label: "TODO", pattern: /\bTODO\b/, example: "TODO" },
  { label: "FIXME", pattern: /\bFIXME\b/, example: "FIXME" },
  { label: "unknown fields", pattern: /\bunknown fields\b/i, example: "unknown fields" },
  { label: "sales office", pattern: /\bsales\s+office\b/i, example: "sales office" },
  { label: "developer source wording", pattern: /\bdeveloper\s+(?:site|website|materials?|documents?|disclaimers?|legal notices?|disclosure package)\b/i, example: "developer website" },
  { label: "external public source", pattern: /\bexternal public source\b/i, example: "external public source" },
  { label: "official PDF link", pattern: /\bofficial pdf link\b/i, example: "official PDF link" },
];

const articlePackageBlockedRules = [
  ...sharedBlockedPhraseRules,
  { label: "pending approval", pattern: /pending\s+approval/i },
  { label: "approved by Brooke", pattern: /approved\s+by\s+Brooke/i },
  { label: "authorization pending", pattern: /authorization\s+pending/i },
  { label: "internal approval", pattern: /internal\s+approval/i },
  { label: "internal review", pattern: /internal\s+review/i },
  { label: "future backend", pattern: /future\s+backend/i },
  { label: "internal sign-off", pattern: /\b(?:internal|editorial|Brooke(?:'s)?|source[-\s]?material)\s+(?:team\s+)?(?:has\s+)?signed\s+off\b/i },
  { label: "placeholder email", pattern: /info@example\.com/i },
  { label: "example domain", pattern: /example\.com/i },
];

// Broad artifact scans also cover legacy floorplan files and technical static pages.
// Keep this narrower than article copy validation; the gatekeeper owns final visible-page checks.
const publicArtifactBlockedRules = [
  { label: "needs_review", pattern: /needs[_\s-]+review/i },
  { label: "pending approval workflow", pattern: /(?:editorial|content|publication|review|Brooke)\s+(?:is\s+)?pending\s+approval|pending\s+approval\s+(?:from|by)/i },
  { label: "approved by Brooke", pattern: /approved\s+by\s+Brooke/i },
  { label: "authorization pending", pattern: /authorization\s+pending/i },
  { label: "internal approval", pattern: /internal\s+approval/i },
  { label: "internal review", pattern: /internal\s+review/i },
  { label: "source-material review", pattern: /source-material\s+review/i },
  { label: "future backend", pattern: /future\s+backend/i },
  { label: "front-end only", pattern: /front-end\s+only/i },
  { label: "pending sign-off", pattern: /\b(?:awaiting|pending|needs|required(?:\s+to\s+obtain)?)\s+(?:final\s+)?sign[-\s]?off\b/i },
  { label: "internal sign-off", pattern: /\b(?:internal|editorial|Brooke(?:'s)?|source[-\s]?material)\s+(?:team\s+)?(?:has\s+)?signed\s+off\b/i },
  { label: "placeholder email", pattern: /info@example\.com/i },
  { label: "example domain", pattern: /example\.com/i },
  { label: "agent merge instruction", pattern: /\bAgent\s+\d+\b|\bdo not merge\b/i },
  { label: "review flag", pattern: /\breview flag\b/i },
  { label: "conflict log", pattern: /\bconflict (?:log|mechanic)/i },
  { label: "database records", pattern: /\b(?:database records|source database)\b/i },
  { label: "AI crawler instruction", pattern: /\bAI crawlers?\b/i },
  { label: "human review workflow", pattern: /\bhuman review\b/i },
  { label: "internal project metadata key", pattern: /["']?(?:sourceCounts|sourceCatalogIds|sourceAssetRepoPath|sourceBuckets|highValueSources|dataConfidence|pageStatus)["']?\s*[:=]/i },
  { label: "local filesystem path", pattern: /(?:\/Users\/|\/Volumes\/|\biCloud\/)/i },
  { label: "research path", pattern: /(?:^|["'`:(\s])research\/(?:asset-library|source-material-review|source-repos|rosewood)\//i },
  { label: "asset repository path", pattern: /\bpublic-projects\//i },
];

const ignoredFieldKeys = new Set(["dataUrl", "path", "url", "href", "sourceUrl", "canonicalUrl"]);

export function scanPublicOutput(content) {
  return scanText(String(content ?? ""), "public output", publicArtifactBlockedRules);
}

export function scanPublicFields(value, field = "article") {
  const findings = [];
  walk(value, field, findings);
  return findings;
}

export function scanArticlePackagePublicCopy(articlePackage) {
  return scanPublicFields(articlePackage, "article package");
}

function walk(value, field, findings) {
  if (typeof value === "string") {
    findings.push(...scanText(value, field));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${field}[${index}]`, findings));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (ignoredFieldKeys.has(key)) continue;
    walk(child, `${field}.${key}`, findings);
  }
}

function scanText(value, field, rules = articlePackageBlockedRules) {
  return rules.flatMap((rule) => {
    const match = value.match(rule.pattern);
    return match ? [{ field, label: rule.label, match: match[0] }] : [];
  });
}
