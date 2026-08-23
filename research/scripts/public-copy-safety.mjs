const blockedRules = [
  { label: "needs_review", pattern: /needs[_\s-]+review/i },
  { label: "pending approval", pattern: /pending\s+approval/i },
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
];

const ignoredFieldKeys = new Set(["dataUrl", "path", "url", "href", "sourceUrl", "canonicalUrl"]);

export function scanPublicOutput(content) {
  return scanText(String(content ?? ""), "public output");
}

export function scanPublicFields(value, field = "article") {
  const findings = [];
  walk(value, field, findings);
  return findings;
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

function scanText(value, field) {
  return blockedRules.flatMap((rule) => {
    const match = value.match(rule.pattern);
    return match ? [{ field, label: rule.label, match: match[0] }] : [];
  });
}
