import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { processRow, sha256 } from "../intel/core.mjs";
import { classifySource } from "../intel/source-verifier.mjs";
import { createAckStore, signDispatch } from "./dispatch.mjs";
import { bindReview, reviewBinding } from "./evidence-review.mjs";
import { buildFactMutation } from "./fact-mutation.mjs";
import { POLICY_VERSION } from "./policy-engine.mjs";
import { shadowRun } from "./shadow-run.mjs";

// End-to-end local demonstration of the P2 cloud-handoff + approval proof.
// Four scenarios: one auto-eligible synthetic update, one approval-required
// candidate, one duplicate, one conflicting candidate. Everything stays local;
// release and writeback adapters remain mocked.
//
//   node research/scripts/p2/demo.mjs

const SECRET = "demo-secret";
const HEADER = "id,status,headline,project_name,record_type,source_url,category,summary,material_updates,source_published_date,event_date,related_project_ids,related_corridor_ids,requires_human_review,verification_status,event_key,flags_json";
const mkRow = (id, over = {}) => ({
  id, status: "new", headline: `Headline ${id}`, project_name: "Alba Palm Beach",
  record_type: "event", source_url: "https://example.com/src", category: "development",
  summary: "Alba Palm Beach completed construction.", material_updates: "Construction complete.",
  source_published_date: "2026-09-10", event_date: "2026-09-10", related_project_ids: "alba-palm-beach",
  related_corridor_ids: "north-flagler", requires_human_review: "FALSE",
  verification_status: "", event_key: "", flags_json: "{}", ...over,
});
const toCsv = (rows) => [HEADER, ...rows.map((r) => Object.values(r).join(","))].join("\n");

function fetchedSource(url) {
  const body = "fetched evidence body";
  const contentHash = sha256(body);
  const classified = classifySource(url, "");
  return { url, source_name: new URL(url).hostname, source_tier: classified.source_tier, source_type: classified.source_type, reachable: true, http_status: 200, body_bytes: Buffer.byteLength(body), retrieval_status: "fetched", retrieval_attested: true, content_hash: contentHash, source_revision: contentHash };
}

function trustedEvidenceFor(r, claims, src) {
  const rowHash = sha256(Object.fromEntries(Object.entries(r).sort(([a], [b]) => a.localeCompare(b))));
  return {
    intake_snapshot_sha256: rowHash,
    records: claims.map((c) => ({ claim_id: c.claim_id, claim_type: c.claim_type, field: c.field, claim_value: c.claim_value, decision: "supported", verification_source_ref_ids: [src.url], content_hash: src.content_hash, source_revision: src.source_revision, reviewer: "chatgpt-fact-check", reviewed_at: "2026-09-12T06:04:00Z" })),
  };
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-p2-demo-"));
const indexes = { events: [{ event_key: "project|alba-palm-beach|construction|topping-out|2026-09-10" }], public_corpus: "" };

// Scenario rows
const autoRow = mkRow("demo-auto");
const approvalRow = mkRow("demo-approval", { summary: "Olara now says 2028 delivery.", material_updates: "Delivery timing updated to 2028.", project_name: "Olara", related_project_ids: "olara" });
const dupRow = mkRow("demo-dup", { event_key: "project|alba-palm-beach|construction|topping-out|2026-09-10", headline: "Alba topping out (second report)" });
const conflictRow = mkRow("demo-conflict", { verification_status: "conflicting", summary: "Conflicting report." });

const csvText = toCsv([autoRow, approvalRow, dupRow, conflictRow]);
const rows = [autoRow, approvalRow, dupRow, conflictRow];

// Pre-compute trusted evidence + reviews for the auto and approval rows.
const verificationSources = {};
const trustedEvidenceMap = {};
const reviews = {};
const factMutations = {};
for (const r of [autoRow, approvalRow]) {
  const src = fetchedSource(r.source_url);
  verificationSources[r.id] = [src];
  const prelim = processRow({ row: r, verificationSources: [src], indexes });
  trustedEvidenceMap[r.id] = trustedEvidenceFor(r, prelim.claims, src);
  const result = processRow({ row: r, verificationSources: [src], indexes, trustedEvidence: trustedEvidenceMap[r.id] });
  const binding = reviewBinding({ snapshotSha256: sha256(csvText), claims: result.claims, sources: result.verificationSources, policyVersion: POLICY_VERSION });
  reviews[r.id] = { reviewer_type: "ai", reviewer_id: "chatgpt-fact-check", reviewed_at: "2026-09-12T06:04:00Z", binding, claim_verdicts: Object.fromEntries(result.claims.map((c) => [c.claim_id, "supported"])) };
}
factMutations["demo-auto"] = [buildFactMutation({ projectId: "alba-palm-beach", field: "status", current: "under_construction", proposed: "completed", eventKey: "project|alba-palm-beach|construction|topping-out|2026-09-10", eventDate: "2026-09-10" })];
factMutations["demo-approval"] = [buildFactMutation({ projectId: "olara", field: "deliveryTiming", current: "2027", proposed: "2028", eventKey: "project|olara|development|development-update|2026-09-10", eventDate: "2026-09-10" })];

const records = rows.map((r, i) => ({ intel_id: r.id, record_position: i + 2, content_hash: "demo", evidence_hash: "demo" }));
const envelope = signDispatch({ secret: SECRET, sheetId: "demo", sheetName: "Incoming_Intel", snapshotSha256: sha256(csvText), records, policyVersion: POLICY_VERSION });
const out = await shadowRun({ root, envelope, secret: SECRET, snapshotCsv: csvText, reviews, factMutations, indexes, verificationSources, trustedEvidence: trustedEvidenceMap, ackStore: createAckStore() });

console.log("=== P2 demo results ===");
for (const r of out.results) {
  console.log(`${r.intel_id}: article=${r.article_decision} fact=${r.fact_change_decision} queue=${r.queue_state} preview=${r.preview_file ? "yes" : "no"}`);
}
console.log("queue:", JSON.stringify(out.queue_stats));
console.log("demo root:", root);
