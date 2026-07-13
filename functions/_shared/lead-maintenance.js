const RETENTION_MONTHS = 24;

function isoNow() {
  return new Date().toISOString();
}

async function beginRun(db, runType) {
  const id = crypto.randomUUID();
  const startedAt = isoNow();
  await db.prepare(`
    INSERT INTO lead_maintenance_runs (id, run_type, started_at, status, affected_count)
    VALUES (?, ?, ?, 'running', 0)
  `).bind(id, runType, startedAt).run();
  return { id, startedAt };
}

async function finishRun(db, run, status, affectedCount, summary, error) {
  await db.prepare(`
    UPDATE lead_maintenance_runs
    SET completed_at = ?, status = ?, affected_count = ?, summary_json = ?, error = ?
    WHERE id = ?
  `).bind(isoNow(), status, affectedCount, summary ? JSON.stringify(summary) : null, error || null, run.id).run();
}

export async function purgeExpiredLeads(db) {
  const run = await beginRun(db, "retention_purge");
  try {
    const eligible = await db.prepare(`
      SELECT form_type, COUNT(*) AS count
      FROM leads
      WHERE julianday(received_at) < julianday('now', ?)
        AND notification_status NOT IN ('pending', 'sending')
        AND acknowledgment_status NOT IN ('pending', 'sending')
        AND NOT EXISTS (
          SELECT 1 FROM lead_delivery_attempts attempts
          WHERE attempts.lead_id = leads.id
            AND attempts.status IN ('pending', 'sending')
        )
      GROUP BY form_type
    `).bind(`-${RETENTION_MONTHS} months`).all();
    const summary = Object.fromEntries((eligible.results ?? []).map((row) => [row.form_type, Number(row.count || 0)]));
    const affectedCount = Object.values(summary).reduce((total, count) => total + count, 0);
    if (affectedCount > 0) {
      const predicate = `
        julianday(received_at) < julianday('now', ?)
        AND notification_status NOT IN ('pending', 'sending')
        AND acknowledgment_status NOT IN ('pending', 'sending')
        AND NOT EXISTS (
          SELECT 1 FROM lead_delivery_attempts attempts
          WHERE attempts.lead_id = leads.id
            AND attempts.status IN ('pending', 'sending')
        )
      `;
      await db.prepare(`DELETE FROM lead_delivery_attempts WHERE lead_id IN (SELECT id FROM leads WHERE ${predicate})`)
        .bind(`-${RETENTION_MONTHS} months`).run();
      await db.prepare(`DELETE FROM leads WHERE ${predicate}`).bind(`-${RETENTION_MONTHS} months`).run();
    }
    await finishRun(db, run, "completed", affectedCount, { retentionMonths: RETENTION_MONTHS, byFormType: summary }, null);
    return { status: "completed", affectedCount, summary };
  } catch (error) {
    const message = String(error?.message || "Retention purge failed").slice(0, 500);
    await finishRun(db, run, "failed", 0, { retentionMonths: RETENTION_MONTHS }, message);
    throw error;
  }
}

export { RETENTION_MONTHS };
