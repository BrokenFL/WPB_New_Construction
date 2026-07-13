import { purgeExpiredLeads } from "../functions/_shared/lead-maintenance.js";

function isoNow() {
  return new Date().toISOString();
}

async function recordRetryRun(db, status, affectedCount, summary, error) {
  const id = crypto.randomUUID();
  const startedAt = isoNow();
  await db.prepare(`
    INSERT INTO lead_maintenance_runs (id, run_type, started_at, completed_at, status, affected_count, summary_json, error)
    VALUES (?, 'retry', ?, ?, ?, ?, ?, ?)
  `).bind(id, startedAt, isoNow(), status, affectedCount, summary ? JSON.stringify(summary) : null, error || null).run();
}

async function invokeRetry(env) {
  if (!env.LEAD_RETRY_TOKEN || !env.LEAD_RETRY_ORIGIN) throw new Error("Scheduled retry is not configured");
  const response = await fetch(`${env.LEAD_RETRY_ORIGIN}/api/leads/retry`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LEAD_RETRY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit: 25 }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) throw new Error(`Retry endpoint failed (${response.status})`);
  return body;
}

export async function runMaintenance(env) {
  const retry = await invokeRetry(env);
  await recordRetryRun(env.LEADS_DB, "completed", Number(retry.retried || 0), {
    retried: Number(retry.retried || 0),
    results: (retry.results || []).map((result) => ({
      notification: result.notification,
      acknowledgment: result.acknowledgment,
    })),
  }, null);
  const purge = await purgeExpiredLeads(env.LEADS_DB);
  return { retry, purge };
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runMaintenance(env).catch(async (error) => {
      const message = String(error?.message || "Scheduled maintenance failed").slice(0, 500);
      try {
        await recordRetryRun(env.LEADS_DB, "failed", 0, null, message);
      } catch {
        // The original failure is already visible in the Worker invocation log.
      }
      console.error(message);
    }));
  },
};
