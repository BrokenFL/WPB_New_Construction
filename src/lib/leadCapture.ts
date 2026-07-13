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

function readStoredAttribution(): LeadAttribution {
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

function writeStoredAttribution(value: LeadAttribution) {
  try {
    window.sessionStorage.setItem(attributionKey, JSON.stringify(value));
  } catch {
    // Attribution is useful context, not a lead destination; the request still submits without it.
  }
}

function urlAttribution(url: URL): LeadAttribution {
  const params = url.searchParams;
  return {
    landing_page: url.href,
    referrer: document.referrer,
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    utm_term: params.get("utm_term") ?? "",
    utm_content: params.get("utm_content") ?? "",
    gclid: params.get("gclid") ?? "",
    fbclid: params.get("fbclid") ?? "",
    cta_context: params.get("lead_capture_context") ?? "",
    article_id: params.get("article") ?? params.get("update") ?? "",
    corridor: params.get("corridor") ?? "",
  };
}

export function captureLeadLandingContext() {
  if (typeof window === "undefined") return;
  const existing = readStoredAttribution();
  if (!existing.landing_page) writeStoredAttribution(urlAttribution(new URL(window.location.href)));
}

export function rememberLeadAttribution(value: LeadAttribution) {
  if (typeof window === "undefined") return;
  const existing = readStoredAttribution();
  const clean = Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => attributionFields.has(key as keyof LeadAttribution) && typeof entry === "string" && entry.trim()),
  ) as LeadAttribution;
  writeStoredAttribution({ ...existing, ...clean, landing_page: existing.landing_page ?? clean.landing_page });
}

export function getLeadAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};
  const stored = readStoredAttribution();
  const current = urlAttribution(new URL(window.location.href));
  return {
    ...stored,
    submission_page: window.location.href,
    referrer: stored.referrer || current.referrer,
    landing_page: stored.landing_page || current.landing_page,
  };
}

export function applyLeadAttribution(form: FormData, overrides: LeadAttribution = {}) {
  const attribution = { ...getLeadAttribution(), ...overrides };
  for (const [key, value] of Object.entries(attribution)) {
    if (value) form.set(key, value);
  }
}

export function ensureSubmissionId(form: FormData) {
  const existing = String(form.get("submission_id") ?? "").trim();
  const id = existing || (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  form.set("submission_id", id);
  return id;
}
