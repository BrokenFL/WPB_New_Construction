import { jsonResponse } from "../../_shared/lead-utils.js";
import { retryPendingDeliveries } from "../../_shared/lead-delivery.js";

function equalSecret(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") return jsonResponse({ ok: false, code: "method_not_allowed" }, { status: 405, headers: { Allow: "POST" } });
  if (!env.LEADS_DB || !env.LEAD_RETRY_TOKEN) return jsonResponse({ ok: false, code: "retry_not_configured" }, { status: 503 });
  const expected = `Bearer ${env.LEAD_RETRY_TOKEN}`;
  if (!equalSecret(request.headers.get("Authorization") ?? "", expected)) return jsonResponse({ ok: false, code: "unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const results = await retryPendingDeliveries(env, env.LEADS_DB, body.limit);
    return jsonResponse({ ok: true, retried: results.length, results });
  } catch {
    return jsonResponse({ ok: false, code: "retry_failed" }, { status: 500 });
  }
}
