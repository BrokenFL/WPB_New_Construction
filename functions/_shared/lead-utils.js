const MAX_LENGTHS = {
  name: 160,
  email: 320,
  phone: 64,
  message: 5000,
  project_id: 160,
  project_name: 240,
  interest: 240,
  budget: 120,
  residence_size: 120,
  timeline: 120,
  represented_by_agent: 80,
  landing_page: 2048,
  submission_page: 2048,
  referrer: 2048,
  cta_context: 160,
  cta_label: 240,
  cta_location: 160,
  article_id: 240,
  corridor: 160,
  consent_version: 80,
  client_submitted_at: 80,
  submission_id: 120,
};

const FORM_TYPES = new Set(["inquiry", "email_updates", "project_inquiry"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function getRequestOrigin(request) {
  return new URL(request.url).origin;
}

export function isAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  const allowed = new Set([
    "https://wpbnewconstruction.com",
    "https://www.wpbnewconstruction.com",
    getRequestOrigin(request),
    ...(String(env.LEAD_ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).filter(Boolean)),
  ]);
  return allowed.has(origin);
}

export async function parseRequestBody(request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  throw Object.assign(new Error("Unsupported content type"), { status: 415, code: "unsupported_content_type" });
}

function cleanString(value, field) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value) || typeof value === "object") return "";
  return String(value).trim().slice(0, MAX_LENGTHS[field] ?? 240);
}

function truthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
}

function parseViewedBuildings(value) {
  if (!value) return [];
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.slice(-12).map((item) => ({
    slug: cleanString(item?.slug, "project_id"),
    name: cleanString(item?.name, "project_name"),
    timestamp: cleanString(item?.timestamp, "client_submitted_at"),
  })).filter((item) => item.slug && item.name);
}

function formTypeFor(body) {
  const explicit = cleanString(body.form_type ?? body.formType, "cta_context").toLowerCase();
  if (FORM_TYPES.has(explicit)) return explicit;
  const formName = cleanString(body.form_name ?? body["form-name"], "cta_context").toLowerCase();
  if (formName === "wpb-email-updates") return "email_updates";
  if (formName === "wpb-project-inquiry") return "project_inquiry";
  return "inquiry";
}

export function normalizeLead(body, request) {
  const formType = formTypeFor(body);
  const now = new Date().toISOString();
  const email = cleanString(body.email, "email").toLowerCase();
  const projectId = cleanString(body.project_id ?? body.project, "project_id");
  const viewedBuildings = parseViewedBuildings(body.viewed_buildings ?? body.viewedBuildings);
  const consent = truthy(body.consent);
  const landingPage = cleanString(body.landing_page ?? body.original_landing_page ?? body.source_page, "landing_page");
  const submissionPage = cleanString(body.submission_page ?? body.source_page, "submission_page") || request.url;

  return {
    id: crypto.randomUUID(),
    submission_id: cleanString(body.submission_id ?? body.submissionId, "submission_id") || crypto.randomUUID(),
    form_type: formType,
    name: cleanString(body.name, "name"),
    email,
    phone: cleanString(body.phone, "phone"),
    message: cleanString(body.message, "message"),
    project_id: projectId,
    project_name: cleanString(body.project_name ?? body.projectName, "project_name"),
    interest: cleanString(body.interest, "interest"),
    budget: cleanString(body.budget, "budget"),
    residence_size: cleanString(body.residence_size ?? body.residenceSize, "residence_size"),
    timeline: cleanString(body.timeline, "timeline"),
    represented_by_agent: cleanString(body.represented_by_agent ?? body.representedByAgent, "represented_by_agent"),
    landing_page: landingPage,
    submission_page: submissionPage,
    referrer: cleanString(body.referrer, "referrer"),
    utm_source: cleanString(body.utm_source, "cta_context"),
    utm_medium: cleanString(body.utm_medium, "cta_context"),
    utm_campaign: cleanString(body.utm_campaign, "cta_context"),
    utm_term: cleanString(body.utm_term, "cta_context"),
    utm_content: cleanString(body.utm_content, "cta_context"),
    gclid: cleanString(body.gclid, "cta_context"),
    fbclid: cleanString(body.fbclid, "cta_context"),
    cta_context: cleanString(body.cta_context ?? body.lead_capture_context, "cta_context"),
    cta_label: cleanString(body.cta_label, "cta_label"),
    cta_location: cleanString(body.cta_location, "cta_location"),
    article_id: cleanString(body.article_id ?? body.article, "article_id"),
    corridor: cleanString(body.corridor, "corridor"),
    viewed_buildings_json: JSON.stringify(viewedBuildings),
    consent: consent ? 1 : 0,
    consent_version: cleanString(body.consent_version, "consent_version"),
    consent_at: consent ? (cleanString(body.consent_at, "client_submitted_at") || now) : null,
    client_submitted_at: cleanString(body.client_submitted_at ?? body.submitted_at, "client_submitted_at") || null,
    received_at: now,
    created_at: now,
    updated_at: now,
    spam_status: "clear",
    spam_reason: null,
    ip_hash: null,
    user_agent_hash: null,
    notification_status: "pending",
    acknowledgment_status: "pending",
    notification_attempts: 0,
    acknowledgment_attempts: 0,
    notification_provider_id: null,
    acknowledgment_provider_id: null,
    notification_sent_at: null,
    acknowledgment_sent_at: null,
    last_error: null,
    last_error_at: null,
  };
}

export function validateLead(lead) {
  if (!FORM_TYPES.has(lead.form_type)) return { code: "invalid_form_type", message: "This form is not configured." };
  if (!lead.email || !EMAIL_PATTERN.test(lead.email)) return { code: "invalid_email", message: "Enter a valid email address." };
  if (lead.form_type !== "email_updates" && !lead.name) return { code: "name_required", message: "Enter your name." };
  if (lead.form_type !== "email_updates" && !lead.project_id && !lead.message) {
    return { code: "inquiry_context_required", message: "Name a building or add a short message." };
  }
  if (!lead.consent) return { code: "consent_required", message: "Please confirm consent before submitting." };
  return null;
}

export async function sha256(value) {
  const data = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function addRequestSignals(lead, request, env) {
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("User-Agent") ?? "unknown";
  const salt = String(env.LEAD_HASH_SALT ?? "wpb-leads");
  lead.ip_hash = await sha256(`${salt}:ip:${ip}`);
  lead.user_agent_hash = await sha256(`${salt}:ua:${userAgent}`);
  return lead;
}

export async function verifyTurnstile(token, request, env) {
  if (String(env.TURNSTILE_BYPASS ?? "").toLowerCase() === "true" && ["development", "test"].includes(String(env.ENVIRONMENT ?? "").toLowerCase())) {
    return { success: true, bypassed: true };
  }
  const secret = String(env.TURNSTILE_SECRET_KEY ?? "");
  if (!secret) throw Object.assign(new Error("Turnstile is not configured"), { status: 503, code: "turnstile_not_configured" });
  if (!token) throw Object.assign(new Error("Turnstile verification is required"), { status: 400, code: "turnstile_required" });

  const form = new URLSearchParams({ secret, response: String(token) });
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) form.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!response.ok) throw Object.assign(new Error("Turnstile verification unavailable"), { status: 503, code: "turnstile_unavailable" });
  const result = await response.json();
  if (!result.success) throw Object.assign(new Error("Turnstile verification failed"), { status: 400, code: "turnstile_failed" });
  return result;
}

export function errorResponse(error) {
  const status = Number(error?.status) || 500;
  const code = error?.code || "lead_capture_failed";
  const message = status >= 500 ? "We could not securely save your request. Please try again." : String(error?.message || "Please review the form and try again.");
  return jsonResponse({ ok: false, code, message }, { status });
}
