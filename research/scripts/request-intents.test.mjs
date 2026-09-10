import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRequestIntent, normalizeRequestIntentPair, requestIntentDefinitions } from "../../shared/request-intents.js";
import { normalizeLead } from "../../functions/_shared/lead-utils.js";
import { normalizeServerRequestIntent } from "../../functions/api/leads.js";

const aliases = [
  ["availability", "Request current availability"],
  ["pricing_packet", "Request private floor-plan packet"],
  ["compare_shortlist", "Compare buildings"],
  ["project_question", "Ask the team about this building"],
  ["conversation_tour", "Schedule private tour"],
];

for (const [id, legacy] of aliases) {
  test(`${id} canonical and legacy aliases normalize`, () => {
    assert.equal(normalizeRequestIntent(id)?.id, id);
    assert.equal(normalizeRequestIntent(legacy)?.id, id);
    assert.equal(normalizeRequestIntent(requestIntentDefinitions[id].interest)?.id, id);
  });
}

test("already-published packet and project aliases remain compatible", () => {
  for (const value of ["Pricing + floor-plan packet", "Request current packet", "Request Floorplans", "floorplans", "Request project updates", "Ask What Is Currently Known"]) {
    assert.ok(normalizeRequestIntent(value), value);
  }
});

test("unknown and conflicting request inputs fail closed", () => {
  assert.equal(normalizeRequestIntent("surprise me"), null);
  assert.equal(normalizeRequestIntentPair("availability", "Request private floor-plan packet").error, "conflicting_request_intent");
  assert.equal(normalizeRequestIntentPair("unknown", "").error, "unknown_request_intent");
  assert.equal(normalizeRequestIntentPair("", "unknown").error, "unknown_interest");
});

for (const id of Object.keys(requestIntentDefinitions)) {
  test(`server normalization stores canonical interest for ${id}`, () => {
    const request = new Request("https://www.wpbnewconstruction.com/api/leads", { method: "POST" });
    const body = { form_type: "inquiry", name: "QA", email: "qa@example.invalid", consent: "true", project: "olara", request_intent: id, interest: requestIntentDefinitions[id].interest };
    const lead = normalizeServerRequestIntent(body, normalizeLead(body, request));
    assert.equal(lead.request_intent, id);
    assert.equal(lead.interest, requestIntentDefinitions[id].interest);
  });
}

test("server rejects an explicit intent that conflicts with a legacy interest", () => {
  const request = new Request("https://www.wpbnewconstruction.com/api/leads", { method: "POST" });
  const body = { form_type: "inquiry", name: "QA", email: "qa@example.invalid", consent: "true", project: "olara", request_intent: "availability", interest: "Request private floor-plan packet" };
  assert.throws(() => normalizeServerRequestIntent(body, normalizeLead(body, request)), (error) => error?.code === "conflicting_request_intent");
});

test("email-update form remains outside the five-intent one-off inquiry contract", () => {
  const request = new Request("https://www.wpbnewconstruction.com/api/leads", { method: "POST" });
  const body = { form_type: "email_updates", email: "qa@example.invalid", consent: "true", interest: "Project updates" };
  const lead = normalizeServerRequestIntent(body, normalizeLead(body, request));
  assert.equal(lead.interest, "Project updates");
  assert.equal(lead.request_intent, undefined);
});
