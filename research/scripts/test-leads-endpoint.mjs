import assert from "node:assert/strict";
import { onRequest as onLeadsRequest } from "../../functions/api/leads.js";

class MockD1 {
  constructor() {
    this.rows = [];
    this.inserted = false;
    this.attempts = [];
    this.updates = [];
  }

  prepare(sql) {
    const db = this;
    return {
      bind(...args) {
        return {
          async first() {
            if (sql.includes("COUNT(*)")) return { count: 0 };
            if (sql.includes("WHERE submission_id")) return db.rows.find((row) => row.submission_id === args[0]) ?? null;
            return null;
          },
          async all() {
            return { results: db.rows };
          },
          async run() {
            if (sql.includes("INSERT INTO leads")) {
              db.inserted = true;
              db.rows.push({
                id: args[0],
                submission_id: args[1],
                notification_status: "pending",
                acknowledgment_status: "pending",
                notification_attempts: 0,
                acknowledgment_attempts: 0,
              });
            } else if (sql.includes("INSERT INTO lead_delivery_attempts")) {
              db.attempts.push({ sql, args });
            } else if (sql.includes("UPDATE leads")) {
              db.updates.push({ sql, args });
              const row = db.rows.find((item) => item.id === args.at(-1));
              if (row) {
                if (sql.includes("notification_status")) row.notification_status = args[0];
                if (sql.includes("acknowledgment_status")) row.acknowledgment_status = args[0];
              }
            }
            return { success: true };
          },
        };
      },
    };
  }
}

function request(body, headers = {}) {
  return new Request("https://www.wpbnewconstruction.com/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://www.wpbnewconstruction.com", ...headers },
    body: JSON.stringify(body),
  });
}

function context(db, overrides = {}) {
  return {
    request: null,
    env: {
      LEADS_DB: db,
      TURNSTILE_SECRET_KEY: "turnstile-test-secret",
      RESEND_API_KEY: "resend-test-key",
      ENVIRONMENT: "test",
      LEAD_NOTIFICATION_EMAIL: "brooke.snader@gmail.com",
      ...overrides,
    },
    next: async () => new Response(null, { status: 404 }),
  };
}

const originalFetch = globalThis.fetch;
let resendCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).includes("turnstile")) return Response.json({ success: true });
  if (String(url).includes("api.resend.com")) {
    resendCalls += 1;
    return Response.json({ id: `resend-${resendCalls}` });
  }
  return originalFetch(url);
};

try {
  const missingTurnstileDb = new MockD1();
  const missingTurnstileContext = context(missingTurnstileDb);
  missingTurnstileContext.request = request({ form_type: "inquiry", name: "Test Buyer", email: "buyer@example.com", project: "olara", consent: "yes" });
  const missingTurnstile = await onLeadsRequest(missingTurnstileContext);
  const missingTurnstileBody = await missingTurnstile.json();
  assert.equal(missingTurnstile.status, 400);
  assert.equal(missingTurnstileBody.code, "turnstile_required");
  assert.equal(missingTurnstileDb.inserted, false);

  const db = new MockD1();
  const payload = {
    form_type: "inquiry",
    submission_id: "submission-test-1",
    name: "Test Buyer",
    email: "buyer@example.com",
    phone: "561-555-0100",
    project: "olara",
    project_name: "Olara",
    interest: "Request current availability",
    message: "Please send current information.",
    consent: "yes",
    consent_version: "2026-07-12",
    turnstile_token: "turnstile-token",
    landing_page: "https://www.wpbnewconstruction.com/projects/olara/",
    submission_page: "https://www.wpbnewconstruction.com/inquire/",
    utm_source: "test",
    cta_context: "project_hero",
  };
  const firstContext = context(db);
  firstContext.request = request(payload, { "CF-Connecting-IP": "203.0.113.10" });
  const first = await onLeadsRequest(firstContext);
  const firstBody = await first.json();
  assert.equal(first.status, 201);
  assert.equal(firstBody.ok, true);
  assert.equal(firstBody.delivery.notification, "sent");
  assert.equal(firstBody.delivery.acknowledgment, "sent");
  assert.equal(db.inserted, true);
  assert.equal(resendCalls, 2);

  const duplicateContext = context(db);
  duplicateContext.request = request(payload);
  const duplicate = await onLeadsRequest(duplicateContext);
  const duplicateBody = await duplicate.json();
  assert.equal(duplicate.status, 200);
  assert.equal(duplicateBody.duplicate, true);
  assert.equal(resendCalls, 2);

  const failedEmailDb = new MockD1();
  const failedContext = context(failedEmailDb, { RESEND_API_KEY: "resend-test-key" });
  failedContext.request = request({ ...payload, submission_id: "submission-test-failure" });
  const successfulFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes("turnstile")) return Response.json({ success: true });
    if (String(url).includes("api.resend.com")) return Response.json({ message: "forced failure" }, { status: 500 });
    return successfulFetch(url);
  };
  const failedEmail = await onLeadsRequest(failedContext);
  const failedEmailBody = await failedEmail.json();
  assert.equal(failedEmail.status, 201);
  assert.equal(failedEmailBody.ok, true);
  assert.equal(failedEmailBody.delivery.notification, "failed");
  assert.equal(failedEmailDb.inserted, true);
  assert.ok(failedEmailDb.updates.some((item) => item.sql.includes("notification_status")));

  const noDatabaseContext = context(null);
  noDatabaseContext.request = request(payload);
  const noDatabase = await onLeadsRequest(noDatabaseContext);
  assert.equal(noDatabase.status, 503);

  console.log("lead endpoint tests passed: validation, durable insert, duplicate protection, delivery failure status, and missing D1 handling");
} finally {
  globalThis.fetch = originalFetch;
}
