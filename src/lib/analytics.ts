import {
  analyticsSnakeCase,
  sanitizeAnalyticsEventName,
  sanitizeAnalyticsPayload,
  type AnalyticsPayload,
} from "./analyticsSafety";

export type { AnalyticsPayload } from "./analyticsSafety";

type AnalyticsEvent = {
  eventName: string;
  payload: AnalyticsPayload;
  timestamp: string;
};

type AnalyticsConsent = "granted" | "denied" | "unset";

declare global {
  interface Window {
    wpbAnalyticsQueue?: AnalyticsEvent[];
    wpbAnalyticsDestination?: "ga4" | "local-only" | "consent-required";
    wpbAnalyticsConsent?: AnalyticsConsent;
    wpbSetAnalyticsConsent?: (consent: Exclude<AnalyticsConsent, "unset">) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = normalizeMeasurementId(import.meta.env.VITE_GA4_MEASUREMENT_ID);
const ga4Enabled = Boolean(measurementId && import.meta.env.PROD);
const trafficStorageKey = "wpbAnalyticsTrafficContext";
const analyticsConsentStorageKey = "wpbAnalyticsConsentV1";
const analyticsConsentPromptId = "wpb-analytics-consent";
let ga4Initialized = false;
let analyticsConsentState: AnalyticsConsent = "unset";

if (typeof window !== "undefined") {
  analyticsConsentState = readStoredAnalyticsConsent();
  window.wpbAnalyticsConsent = analyticsConsentState;
  window.wpbSetAnalyticsConsent = setAnalyticsConsent;
  scheduleAnalyticsConsentInitialization();
}

export function track(eventName: string, payload: AnalyticsPayload = {}) {
  const cleanEventName = sanitizeAnalyticsEventName(eventName);
  if (typeof window === "undefined" || !cleanEventName) {
    return;
  }

  const cleanPayload = sanitizeAnalyticsPayload({ ...payload, ...trafficContext() });
  const event: AnalyticsEvent = {
    eventName: cleanEventName,
    payload: cleanPayload,
    timestamp: new Date().toISOString(),
  };

  window.wpbAnalyticsQueue = window.wpbAnalyticsQueue ?? [];
  window.wpbAnalyticsQueue.push(event);
  window.dispatchEvent(new CustomEvent("wpb:analytics", { detail: event }));
  sendToGa4(cleanEventName, cleanPayload);

  if (import.meta.env.DEV) {
    console.info("[analytics]", cleanEventName, cleanPayload);
  }
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unset">) {
  if (typeof window === "undefined") return;
  analyticsConsentState = consent;
  window.wpbAnalyticsConsent = consent;
  persistAnalyticsConsent(consent);
  removeAnalyticsConsentPrompt();

  if (!ga4Enabled || !measurementId) {
    window.wpbAnalyticsDestination = "local-only";
    return;
  }

  if (consent === "granted") {
    initializeGa4(measurementId);
    sendConsentPageView(measurementId);
    return;
  }

  window.wpbAnalyticsDestination = "local-only";
  if (ga4Initialized) {
    window.gtag?.("consent", "update", deniedGoogleConsent());
  }
}

function normalizeMeasurementId(value: unknown) {
  const candidate = String(value ?? "").trim().toUpperCase();
  return /^G-[A-Z0-9]{4,20}$/.test(candidate) ? candidate : "";
}

function scheduleAnalyticsConsentInitialization() {
  if (!ga4Enabled || !measurementId) {
    window.wpbAnalyticsDestination = "local-only";
    return;
  }

  if (analyticsConsentState === "granted") {
    initializeGa4(measurementId);
    return;
  }

  if (analyticsConsentState === "denied") {
    window.wpbAnalyticsDestination = "local-only";
    return;
  }

  window.wpbAnalyticsDestination = "consent-required";
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureAnalyticsConsentPrompt, { once: true });
  } else {
    ensureAnalyticsConsentPrompt();
  }
}

function readStoredAnalyticsConsent(): AnalyticsConsent {
  try {
    const stored = window.localStorage.getItem(analyticsConsentStorageKey);
    if (stored === "granted" || stored === "denied") return stored;
  } catch {
    // Consent can remain in-memory when storage is unavailable.
  }
  return "unset";
}

function persistAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unset">) {
  try {
    window.localStorage.setItem(analyticsConsentStorageKey, consent);
  } catch {
    // Consent remains effective for the current page even if storage is unavailable.
  }
}

function ensureAnalyticsConsentPrompt() {
  if (!ga4Enabled || analyticsConsentState !== "unset" || document.getElementById(analyticsConsentPromptId)) return;

  const panel = document.createElement("aside");
  panel.id = analyticsConsentPromptId;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Optional analytics preference");
  panel.setAttribute("aria-live", "polite");
  Object.assign(panel.style, {
    position: "fixed",
    left: "16px",
    right: "16px",
    bottom: "16px",
    zIndex: "2147483000",
    maxWidth: "760px",
    margin: "0 auto",
    padding: "18px",
    border: "1px solid rgba(255,255,255,.18)",
    borderRadius: "14px",
    background: "rgba(20,24,28,.98)",
    color: "#fff",
    boxShadow: "0 16px 48px rgba(0,0,0,.28)",
    fontFamily: "inherit",
    lineHeight: "1.45",
  });

  const title = document.createElement("strong");
  title.textContent = "Optional analytics";
  title.style.display = "block";
  title.style.marginBottom = "6px";

  const copy = document.createElement("p");
  copy.textContent =
    "Allow privacy-conscious Google Analytics to help us understand which building and buyer-guide pages are useful. Analytics stays off unless you allow it, and contact-form names, emails, phone numbers, and messages are not sent to Analytics.";
  Object.assign(copy.style, { margin: "0 0 12px", fontSize: "14px" });

  const actions = document.createElement("div");
  Object.assign(actions.style, { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" });

  const reject = consentButton("No thanks", false);
  reject.addEventListener("click", () => setAnalyticsConsent("denied"));

  const allow = consentButton("Allow analytics", true);
  allow.addEventListener("click", () => setAnalyticsConsent("granted"));

  const privacy = document.createElement("a");
  privacy.href = "/privacy/";
  privacy.textContent = "Privacy";
  Object.assign(privacy.style, { color: "#fff", fontSize: "14px", padding: "8px 2px" });

  actions.append(reject, allow, privacy);
  panel.append(title, copy, actions);
  document.body.append(panel);
}

function consentButton(label: string, primary: boolean) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  Object.assign(button.style, {
    appearance: "none",
    border: primary ? "1px solid #fff" : "1px solid rgba(255,255,255,.45)",
    borderRadius: "999px",
    background: primary ? "#fff" : "transparent",
    color: primary ? "#15191d" : "#fff",
    padding: "9px 14px",
    font: "inherit",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  });
  return button;
}

function removeAnalyticsConsentPrompt() {
  document.getElementById(analyticsConsentPromptId)?.remove();
}

function trafficContext(): AnalyticsPayload {
  try {
    const stored = window.sessionStorage.getItem(trafficStorageKey);
    if (stored) return sanitizeAnalyticsPayload(JSON.parse(stored));
  } catch {
    // Acquisition context is optional; analytics still works without storage.
  }

  const params = new URLSearchParams(window.location.search);
  const context = sanitizeAnalyticsPayload({
    trafficSource: params.get("utm_source") ?? "",
    trafficMedium: params.get("utm_medium") ?? "",
    trafficCampaign: params.get("utm_campaign") ?? "",
    landingPath: window.location.pathname,
    referrerHost: referrerHost(),
  });
  try {
    window.sessionStorage.setItem(trafficStorageKey, JSON.stringify(context));
  } catch {
    // Acquisition context is optional; analytics still works without storage.
  }
  return context;
}

function referrerHost() {
  if (!document.referrer) return "direct";
  try {
    return new URL(document.referrer).hostname.replace(/^www\./, "") || "direct";
  } catch {
    return "direct";
  }
}

function sendToGa4(eventName: string, payload: AnalyticsPayload) {
  if (!ga4Enabled || !measurementId) {
    window.wpbAnalyticsDestination = "local-only";
    return;
  }
  if (analyticsConsentState !== "granted") {
    window.wpbAnalyticsDestination = analyticsConsentState === "unset" ? "consent-required" : "local-only";
    if (analyticsConsentState === "unset") ensureAnalyticsConsentPrompt();
    return;
  }

  initializeGa4(measurementId);
  const eventPayload = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [analyticsSnakeCase(key), value]),
  );
  window.gtag?.("event", eventName, {
    ...eventPayload,
    page_location: cleanPageLocation(),
    page_referrer: cleanReferrerLocation(),
    send_to: measurementId,
  });
}

function initializeGa4(id: string) {
  if (ga4Initialized || analyticsConsentState !== "granted") return;
  ga4Initialized = true;
  window.wpbAnalyticsDestination = "ga4";
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag("consent", "default", grantedGoogleConsent());
  window.gtag("js", new Date());
  window.gtag("config", id, {
    send_page_view: false,
    page_location: cleanPageLocation(),
    page_referrer: cleanReferrerLocation(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  if (!document.querySelector(`script[data-wpb-ga4="${id}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.dataset.wpbGa4 = id;
    document.head.append(script);
  }
}

function grantedGoogleConsent() {
  return {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

function deniedGoogleConsent() {
  return {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

function sendConsentPageView(id: string) {
  window.gtag?.("event", "page_view", {
    page_location: cleanPageLocation(),
    page_referrer: cleanReferrerLocation(),
    send_to: id,
  });
}

function cleanPageLocation() {
  const path = sanitizeAnalyticsPayload({ path: window.location.pathname }).path;
  return `${window.location.origin}${typeof path === "string" ? path : "/"}`;
}

function cleanReferrerLocation() {
  if (!document.referrer) return "";
  try {
    return `${new URL(document.referrer).origin}/`;
  } catch {
    return "";
  }
}
