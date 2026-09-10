export type LeadAttribution = {
  landing_page?: string;
  submission_page?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  cta_context?: string;
  cta_label?: string;
  cta_location?: string;
  article_id?: string;
  corridor?: string;
};

const attributionKey = "wpbLeadAttribution";
const attributionFields = new Set<keyof LeadAttribution>([
  "landing_page",
  "submission_page",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "cta_context",
  "cta_label",
  "cta_location",
  "article_id",
  "corridor",
]);

export function readStoredAttribution(): LeadAttribution {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(attributionKey) ?? "{}");
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([key, value]) => attributionFields.has(key as keyof LeadAttribution) && typeof value === "string" && value),
    ) as LeadAttribution;
  } catch {
    return {};
  }
}

export function writeStoredAttribution(value: LeadAttribution) {
  try {
    window.sessionStorage.setItem(attributionKey, JSON.stringify(value));
  } catch {
    // Attribution is useful context, not a lead destination; the request still submits without it.
  }
}

export function rememberLeadAttribution(value: LeadAttribution, options: { replaceRequest?: boolean } = {}) {
  if (typeof window === "undefined") return;
  const existing = readStoredAttribution();
  // An explicit new request replaces request-scoped metadata, never first-touch attribution.
  if (options.replaceRequest) {
    for (const key of ["cta_context", "cta_label", "cta_location", "corridor"] as const) delete existing[key];
  }
  const clean = Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => attributionFields.has(key as keyof LeadAttribution) && typeof entry === "string" && entry.trim()),
  ) as LeadAttribution;
  writeStoredAttribution({ ...existing, ...clean, landing_page: existing.landing_page ?? clean.landing_page });
}
