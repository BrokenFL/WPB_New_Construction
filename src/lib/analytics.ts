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

declare global {
  interface Window {
    wpbAnalyticsQueue?: AnalyticsEvent[];
    wpbAnalyticsDestination?: "ga4" | "local-only";
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = normalizeMeasurementId(import.meta.env.VITE_GA4_MEASUREMENT_ID);
const ga4Enabled = Boolean(measurementId && import.meta.env.PROD);
const trafficStorageKey = "wpbAnalyticsTrafficContext";
let ga4Initialized = false;

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

function normalizeMeasurementId(value: unknown) {
  const candidate = String(value ?? "").trim().toUpperCase();
  return /^G-[A-Z0-9]{4,20}$/.test(candidate) ? candidate : "";
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
  if (ga4Initialized) return;
  ga4Initialized = true;
  window.wpbAnalyticsDestination = "ga4";
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));
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
