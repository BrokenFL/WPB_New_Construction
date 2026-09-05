export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsPayload = Record<string, AnalyticsValue>;

const allowedFields = new Set([
  "action",
  "articleId",
  "articleSlug",
  "buildingName",
  "buildingSlug",
  "category",
  "corridor",
  "corridorKey",
  "ctaText",
  "errorCode",
  "hasMessage",
  "hasPhone",
  "interest",
  "landingPath",
  "leadCaptureContext",
  "location",
  "pageType",
  "path",
  "planName",
  "projectId",
  "projectName",
  "projectSlug",
  "referrerHost",
  "route",
  "salesStatus",
  "source",
  "sourceHost",
  "sourceName",
  "sourcePath",
  "trafficCampaign",
  "trafficMedium",
  "trafficSource",
  "viewedBuildingCount",
  "viewedBuildings",
]);

const pathFields = new Set(["landingPath", "path", "sourcePath"]);
const identifierFields = new Set(["articleId", "articleSlug", "buildingSlug", "corridorKey", "errorCode", "projectId", "projectSlug", "route"]);
const hostFields = new Set(["referrerHost", "sourceHost"]);
const emailPattern = /\b[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/i;
const phonePattern = /(?:\+?\d[\s().-]*){7,}/;

export function sanitizeAnalyticsEventName(value: string) {
  const eventName = value.trim().toLowerCase();
  return /^[a-z][a-z0-9_]{0,39}$/.test(eventName) ? eventName : "";
}

export function sanitizeAnalyticsPayload(payload: AnalyticsPayload): AnalyticsPayload {
  const clean: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!allowedFields.has(key) || value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean") {
      clean[key] = value;
      continue;
    }
    if (typeof value === "number") {
      if (Number.isFinite(value)) clean[key] = value;
      continue;
    }
    const sanitized = sanitizeStringValue(key, value);
    if (sanitized) clean[key] = sanitized;
  }
  return clean;
}

export function analyticsSnakeCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[^a-zA-Z0-9_]+/g, "_").toLowerCase();
}

function sanitizeStringValue(key: string, value: string) {
  let clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (pathFields.has(key)) {
    clean = clean.split(/[?#]/, 1)[0];
    if (!clean.startsWith("/") || !/^\/[a-zA-Z0-9/_\-.]*$/.test(clean)) return "";
  }
  if (identifierFields.has(key)) {
    return /^[a-zA-Z0-9][a-zA-Z0-9_\-/:.]{0,119}$/.test(clean) ? clean : "";
  }
  if (!clean || emailPattern.test(clean) || phonePattern.test(clean)) return "";
  if (hostFields.has(key) && !/^[a-z0-9.-]{1,253}$/i.test(clean)) return "";
  return clean.slice(0, 120);
}
