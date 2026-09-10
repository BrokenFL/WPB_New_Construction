import {
  readStoredAttribution,
  rememberLeadAttribution,
  writeStoredAttribution,
  type LeadAttribution,
} from "./leadAttributionStore.ts";

export type { LeadAttribution } from "./leadAttributionStore.ts";
export { rememberLeadAttribution } from "./leadAttributionStore.ts";

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
