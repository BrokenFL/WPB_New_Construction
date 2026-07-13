function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function oneLine(value, fallback = "Not provided") {
  const clean = String(value ?? "").replace(/[\r\n]+/g, " ").trim();
  return clean || fallback;
}

function leadText(lead) {
  return [
    `Lead ID: ${lead.id}`,
    `Submitted: ${lead.received_at}`,
    `Form: ${lead.form_type}`,
    `Name: ${oneLine(lead.name)}`,
    `Email: ${oneLine(lead.email)}`,
    `Phone: ${oneLine(lead.phone)}`,
    `Project: ${oneLine(lead.project_name || lead.project_id, "Not selected")}`,
    `Interest: ${oneLine(lead.interest)}`,
    `Budget: ${oneLine(lead.budget)}`,
    `Residence size: ${oneLine(lead.residence_size)}`,
    `Timeline: ${oneLine(lead.timeline)}`,
    `Represented by agent: ${oneLine(lead.represented_by_agent)}`,
    `Message: ${oneLine(lead.message)}`,
    `Landing page: ${oneLine(lead.landing_page)}`,
    `Submission page: ${oneLine(lead.submission_page)}`,
    `Referrer: ${oneLine(lead.referrer)}`,
    `Campaign: ${[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "Not provided"}`,
    `CTA: ${[lead.cta_label, lead.cta_location, lead.cta_context].filter(Boolean).join(" / ") || "Not provided"}`,
    `Article: ${oneLine(lead.article_id)}`,
    `Corridor: ${oneLine(lead.corridor)}`,
    `Viewed buildings: ${oneLine(lead.viewed_buildings_json)}`,
    `Consent: ${lead.consent ? "Yes" : "No"} (${oneLine(lead.consent_version)})`,
  ].join("\n");
}

function leadHtml(lead) {
  const rows = [
    ["Lead ID", lead.id],
    ["Submitted", lead.received_at],
    ["Form", lead.form_type],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Project", lead.project_name || lead.project_id],
    ["Interest", lead.interest],
    ["Budget", lead.budget],
    ["Residence size", lead.residence_size],
    ["Timeline", lead.timeline],
    ["Represented by agent", lead.represented_by_agent],
    ["Landing page", lead.landing_page],
    ["Submission page", lead.submission_page],
    ["Referrer", lead.referrer],
    ["Campaign", [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")],
    ["CTA", [lead.cta_label, lead.cta_location, lead.cta_context].filter(Boolean).join(" / ")],
    ["Article", lead.article_id],
    ["Corridor", lead.corridor],
    ["Viewed buildings", lead.viewed_buildings_json],
    ["Consent", `${lead.consent ? "Yes" : "No"} (${lead.consent_version || "Not provided"})`],
  ];
  const table = rows.map(([label, value]) => `<tr><th align="left" valign="top">${escapeHtml(label)}</th><td>${escapeHtml(value || "Not provided")}</td></tr>`).join("");
  return `<h2>New WPB New Construction lead</h2><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">${table}</table><h3>Message</h3><p>${escapeHtml(lead.message || "Not provided")}</p>`;
}

function deliveryConfig(env) {
  return {
    apiKey: String(env.RESEND_API_KEY ?? ""),
    from: String(env.LEAD_FROM_EMAIL ?? "WPB New Construction Concierge <concierge@wpbnewconstruction.com>"),
    notificationTo: String(env.LEAD_NOTIFICATION_EMAIL ?? "brooke.snader@gmail.com"),
    replyTo: String(env.LEAD_REPLY_TO_EMAIL ?? "brooke.snader@gmail.com"),
  };
}

async function sendResendEmail(env, payload) {
  const config = deliveryConfig(env);
  if (!config.apiKey) throw Object.assign(new Error("Resend is not configured"), { code: "resend_not_configured" });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) {
    const error = result?.message || result?.name || `Resend HTTP ${response.status}`;
    throw Object.assign(new Error(String(error).slice(0, 500)), { code: "resend_failed" });
  }
  return result.id;
}

async function recordAttempt(db, lead, type, attemptNumber, status, providerId, error) {
  await db.prepare(`
    INSERT INTO lead_delivery_attempts (id, lead_id, delivery_type, attempt_number, status, provider_id, error, attempted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), lead.id, type, attemptNumber, status, providerId || null, error || null, new Date().toISOString()).run();
}

async function updateDelivery(db, lead, type, status, attemptNumber, providerId, error) {
  const now = new Date().toISOString();
  const statusColumn = type === "notification" ? "notification_status" : "acknowledgment_status";
  const attemptsColumn = type === "notification" ? "notification_attempts" : "acknowledgment_attempts";
  const providerColumn = type === "notification" ? "notification_provider_id" : "acknowledgment_provider_id";
  const sentColumn = type === "notification" ? "notification_sent_at" : "acknowledgment_sent_at";
  await db.prepare(`UPDATE leads SET ${statusColumn} = ?, ${attemptsColumn} = ?, ${providerColumn} = ?, ${sentColumn} = ?, last_error = ?, last_error_at = ?, updated_at = ? WHERE id = ?`)
    .bind(status, attemptNumber, providerId || null, status === "sent" ? now : null, error || null, error ? now : null, now, lead.id).run();
  lead[statusColumn] = status;
  lead[attemptsColumn] = attemptNumber;
  lead[providerColumn] = providerId || null;
  if (status === "sent") lead[sentColumn] = now;
}

async function deliverOne(env, db, lead, type) {
  const statusColumn = type === "notification" ? "notification_status" : "acknowledgment_status";
  const attemptsColumn = type === "notification" ? "notification_attempts" : "acknowledgment_attempts";
  const providerColumn = type === "notification" ? "notification_provider_id" : "acknowledgment_provider_id";
  if (lead[statusColumn] === "sent" && lead[providerColumn]) return { status: "sent", skipped: true };

  const attemptNumber = Number(lead[attemptsColumn] || 0) + 1;
  await updateDelivery(db, lead, type, "sending", attemptNumber, null, null);
  const config = deliveryConfig(env);
  const subject = type === "notification"
    ? `New WPB lead · ${oneLine(lead.project_name || lead.interest, "Buyer inquiry")}`
    : "We received your WPB New Construction request";
  const payload = {
    from: config.from,
    to: type === "notification" ? [config.notificationTo] : [lead.email],
    reply_to: type === "notification" ? lead.email : config.replyTo,
    subject,
    text: type === "notification"
      ? leadText(lead)
      : `Thanks for reaching out to WPB New Construction. We received your request and Brooke will follow up with current information.\n\n${leadText(lead)}`,
    html: type === "notification"
      ? leadHtml(lead)
      : `<h2>Thanks for reaching out</h2><p>We received your request. Brooke will follow up with current information.</p>${leadHtml(lead)}`,
  };

  try {
    const providerId = await sendResendEmail(env, payload);
    await recordAttempt(db, lead, type, attemptNumber, "sent", providerId, null);
    await updateDelivery(db, lead, type, "sent", attemptNumber, providerId, null);
    return { status: "sent", providerId };
  } catch (error) {
    const message = String(error?.message || "Email delivery failed").slice(0, 500);
    await recordAttempt(db, lead, type, attemptNumber, "failed", null, message);
    await updateDelivery(db, lead, type, "failed", attemptNumber, null, message);
    return { status: "failed", error: message };
  }
}

export async function deliverLead(env, db, lead) {
  if (lead.spam_status !== "clear") {
    await updateDelivery(db, lead, "notification", "skipped", 0, null, null);
    await updateDelivery(db, lead, "acknowledgment", "skipped", 0, null, null);
    return { notification: "skipped", acknowledgment: "skipped" };
  }
  const notification = await deliverOne(env, db, lead, "notification");
  const acknowledgment = await deliverOne(env, db, lead, "acknowledgment");
  return { notification: notification.status, acknowledgment: acknowledgment.status };
}

export async function retryPendingDeliveries(env, db, limit = 25) {
  const rows = await db.prepare(`
    SELECT leads.*,
      (SELECT attempted_at FROM lead_delivery_attempts
        WHERE lead_id = leads.id AND delivery_type = 'notification'
        ORDER BY attempted_at DESC LIMIT 1) AS notification_last_attempt_at,
      (SELECT attempted_at FROM lead_delivery_attempts
        WHERE lead_id = leads.id AND delivery_type = 'acknowledgment'
        ORDER BY attempted_at DESC LIMIT 1) AS acknowledgment_last_attempt_at
    FROM leads
    WHERE (notification_status IN ('pending', 'failed') AND notification_attempts < 5)
       OR (acknowledgment_status IN ('pending', 'failed') AND acknowledgment_attempts < 5)
    ORDER BY received_at ASC
    LIMIT 100
  `).bind().all();
  const now = Date.now();
  const maxResults = Math.min(Math.max(Number(limit) || 25, 1), 50);
  const retryDelayMs = (attempts) => 15 * 60 * 1000 * (2 ** Math.max(Number(attempts || 1) - 1, 0));
  const deliveryDue = (status, attempts, lastAttemptAt) => ["pending", "failed"].includes(status)
    && Number(attempts || 0) < 5
    && (!lastAttemptAt || now - Date.parse(lastAttemptAt) >= retryDelayMs(attempts));
  const results = [];
  for (const lead of (rows.results ?? []).filter((candidate) => {
    return deliveryDue(candidate.notification_status, candidate.notification_attempts, candidate.notification_last_attempt_at)
      || deliveryDue(candidate.acknowledgment_status, candidate.acknowledgment_attempts, candidate.acknowledgment_last_attempt_at);
  }).slice(0, maxResults)) {
    const delivery = await deliverLead(env, db, lead);
    results.push({ leadId: lead.id, ...delivery });
  }
  return results;
}
