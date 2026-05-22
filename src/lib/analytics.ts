export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

type AnalyticsEvent = {
  eventName: string;
  payload: AnalyticsPayload;
  timestamp: string;
};

declare global {
  interface Window {
    wpbAnalyticsQueue?: AnalyticsEvent[];
  }
}

export function track(eventName: string, payload: AnalyticsPayload = {}) {
  const cleanEventName = eventName.trim();
  if (typeof window === "undefined" || !cleanEventName) {
    return;
  }

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ""),
  ) as AnalyticsPayload;
  const event: AnalyticsEvent = {
    eventName: cleanEventName,
    payload: cleanPayload,
    timestamp: new Date().toISOString(),
  };

  window.wpbAnalyticsQueue = window.wpbAnalyticsQueue ?? [];
  window.wpbAnalyticsQueue.push(event);
  window.dispatchEvent(new CustomEvent("wpb:analytics", { detail: event }));

  if (import.meta.env.DEV) {
    console.info("[analytics]", cleanEventName, cleanPayload);
  }
}
