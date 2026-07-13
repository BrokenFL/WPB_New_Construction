import {
  addRequestSignals,
  errorResponse,
  isAllowedOrigin,
  jsonResponse,
  normalizeLead,
  parseRequestBody,
  validateLead,
  verifyTurnstile,
} from "../_shared/lead-utils.js";
import { deliverLead } from "../_shared/lead-delivery.js";

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

async function isRateLimited(db, ipHash) {
  const result = await db.prepare(`
    SELECT COUNT(*) AS count FROM leads
    WHERE ip_hash = ?
      AND julianday(received_at) >= julianday('now', ?)
      AND spam_status = 'clear'
  `).bind(ipHash, `-${RATE_LIMIT_WINDOW_MINUTES} minutes`).first();
  return Number(result?.count ?? 0) >= RATE_LIMIT_MAX;
}

async function insertLead(db, lead) {
  const existing = await db.prepare("SELECT * FROM leads WHERE submission_id = ? LIMIT 1").bind(lead.submission_id).first();
  if (existing) return { lead: existing, duplicate: true };

  try {
    await db.prepare(`
      INSERT INTO leads (
        id, submission_id, form_type, name, email, phone, message, project_id, project_name, interest,
        budget, residence_size, timeline, represented_by_agent, landing_page, submission_page, referrer,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, cta_context, cta_label,
        cta_location, article_id, corridor, viewed_buildings_json, consent, consent_version, consent_at,
        client_submitted_at, received_at, spam_status, spam_reason, ip_hash, user_agent_hash,
        notification_status, acknowledgment_status, notification_attempts, acknowledgment_attempts,
        notification_provider_id, acknowledgment_provider_id, notification_sent_at, acknowledgment_sent_at,
        last_error, last_error_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      lead.id, lead.submission_id, lead.form_type, lead.name, lead.email, lead.phone, lead.message, lead.project_id,
      lead.project_name, lead.interest, lead.budget, lead.residence_size, lead.timeline, lead.represented_by_agent,
      lead.landing_page, lead.submission_page, lead.referrer, lead.utm_source, lead.utm_medium, lead.utm_campaign,
      lead.utm_term, lead.utm_content, lead.gclid, lead.fbclid, lead.cta_context, lead.cta_label, lead.cta_location,
      lead.article_id, lead.corridor, lead.viewed_buildings_json, lead.consent, lead.consent_version, lead.consent_at,
      lead.client_submitted_at, lead.received_at, lead.spam_status, lead.spam_reason, lead.ip_hash, lead.user_agent_hash,
      lead.notification_status, lead.acknowledgment_status, lead.notification_attempts, lead.acknowledgment_attempts,
      lead.notification_provider_id, lead.acknowledgment_provider_id, lead.notification_sent_at, lead.acknowledgment_sent_at,
      lead.last_error, lead.last_error_at, lead.created_at, lead.updated_at,
    ).run();
  } catch (error) {
    const racedDuplicate = await db.prepare("SELECT * FROM leads WHERE submission_id = ? LIMIT 1").bind(lead.submission_id).first();
    if (racedDuplicate) return { lead: racedDuplicate, duplicate: true };
    throw error;
  }
  return { lead, duplicate: false };
}

function methodResponse(method) {
  return jsonResponse({ ok: false, code: "method_not_allowed", message: `${method} is not allowed.` }, {
    status: 405,
    headers: { Allow: "POST, OPTIONS" },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
  if (request.method !== "POST") return methodResponse(request.method);
  if (!isAllowedOrigin(request, env)) return jsonResponse({ ok: false, code: "origin_not_allowed", message: "This request origin is not allowed." }, { status: 403 });
  if (!env.LEADS_DB) return jsonResponse({ ok: false, code: "lead_database_not_configured", message: "Lead capture is temporarily unavailable." }, { status: 503 });

  try {
    const body = await parseRequestBody(request);
    const lead = normalizeLead(body, request);
    const validationError = validateLead(lead);
    if (validationError) throw Object.assign(new Error(validationError.message), { status: 400, code: validationError.code });

    const honeypot = String(body.company ?? body.website ?? "").trim();
    if (honeypot) {
      lead.spam_status = "honeypot";
      lead.spam_reason = "honeypot_filled";
    } else {
      await verifyTurnstile(body.turnstile_token ?? body.turnstileToken, request, env);
    }
    await addRequestSignals(lead, request, env);
    const db = env.LEADS_DB;
    if (await isRateLimited(db, lead.ip_hash)) throw Object.assign(new Error("Too many requests"), { status: 429, code: "rate_limited" });

    const inserted = await insertLead(db, lead);
    if (inserted.duplicate) {
      return jsonResponse({ ok: true, duplicate: true, leadId: inserted.lead.id, message: "Your request was already received." }, { status: 200 });
    }

    const delivery = await deliverLead(env, db, lead);
    return jsonResponse({
      ok: true,
      leadId: lead.id,
      message: "Your request was received.",
      delivery: {
        notification: delivery.notification,
        acknowledgment: delivery.acknowledgment,
      },
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
