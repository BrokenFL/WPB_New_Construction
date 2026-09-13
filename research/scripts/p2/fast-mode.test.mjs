import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { processRow, sha256, stableJson } from "../intel/core.mjs";
import { classifySource } from "../intel/source-verifier.mjs";
import { DEFAULT_REVIEWER_VERSION, toPhaseATrustedEvidence } from "./evidence-review.mjs";
import {
  ARTICLE_DECISION,
  FACT_DECISION,
  FAST_MODE_POLICY_VERSION,
  classifyFastFactField,
  decideFast,
} from "./fast-policy.mjs";
import {
  FAST_FACT_CHECK_HANDOFF_VERSION,
  buildFastFactCheckPacket,
  ingestFastFactCheckHandoff,
} from "./fast-fact-check.mjs";
import {
  STORY_QUEUE_COLUMNS,
  STORY_QUEUE_SHEET,
  STORY_STATUS,
  enqueueStory,
  storyIdFor,
  storyRowToCells,
  validateStoryRow,
} from "./story-queue.mjs";
import { applyAutomatedFacts, automatedEntryForMutation, emptyAutomatedFacts } from "./fast-facts.mjs";
import { intakeSnapshotRow, runFastCycle } from "./fast-cycle.mjs";
import { articleInputFromStory } from "./story-publisher.mjs";
import { buildFastDigest, fastDigestMarkdown } from "./fast-digest.mjs";

const NOW_ISO = "2026-09-13T12:00:00.000Z";
const NOW = Date.parse(NOW_ISO);
const REVIEWER = DEFAULT_REVIEWER_VERSION;

function row(id, overrides = {}) {
  return {
    id,
    status: "new",
    headline: `Verified project update ${id}`,
    project_name: "Alba Palm Beach",
    record_type: "event",
    source_url: "https://www.wpb.org/government/development-services",
    category: "development",
    summary: "The project reached a verified construction milestone.",
    material_updates: "The construction status changed.",
    source_published_date: "2026-09-10",
    event_date: "2026-09-10",
    related_project_ids: "alba-palm-beach",
    related_corridor_ids: "north-flagler",
    requires_human_review: "FALSE",
    verification_status: "",
    verification_summary: "",
    review_notes: "",
    event_key: "",
    flags_json: "{}",
    fact_proposals_json: "",
    lead_source_url: "",
    primary_source_url: "",
    ...overrides,
  };
}

function fetchedSource(url = "https://www.wpb.org/government/development-services", body = "official fetched evidence body") {
  const classified = classifySource(url, "");
  const contentHash = sha256(body);
  return {
    url: classified.url,
    source_name: new URL(classified.url).hostname,
    source_tier: classified.source_tier,
    source_type: classified.source_type,
    reachable: true,
    http_status: 200,
    body_bytes: Buffer.byteLength(body),
    retrieval_status: "fetched",
    retrieval_attested: true,
    content_hash: contentHash,
    source_revision: contentHash,
  };
}

function indexesFor(field = "status", value = "under_construction", events = []) {
  return {
    events,
    public_corpus: "",
    reviewed_facts: {
      projects: {
        "alba-palm-beach": {
          [field]: { value, source: "manual_review", reviewedBy: "Brooke" },
        },
      },
    },
    source_revisions: [{ path: "fixture", present: true, sha256: "a".repeat(64) }],
  };
}

// v2 handoff: verdicts keyed by claim_id, evidence = chosen source_ref_ids.
function handoffFor(r, preliminary, { verdicts = {}, sourcePicker } = {}) {
  const sourceIds = preliminary.verificationSources.filter((s) => !s.error).map((s) => s.source_ref_id);
  return {
    contract_version: FAST_FACT_CHECK_HANDOFF_VERSION,
    intel_id: r.id,
    intake_snapshot_sha256: preliminary.report.row_sha256,
    event_key: preliminary.report.derived_event_key,
    claims: preliminary.claims.map((claim) => ({
      claim_id: claim.claim_id,
      verdict: verdicts[claim.claim_id] ?? "supported",
      evidence_source_ref_ids: sourcePicker ? sourcePicker(claim, sourceIds) : sourceIds,
      note: "",
    })),
    verification_timestamp: NOW_ISO,
    reviewer_type: "automated_fact_checker",
    reviewer_id: "wpb-fact-check-task",
    reviewer_name: "WPB independent fact checker",
    reviewer_version: REVIEWER,
    policy_version: FAST_MODE_POLICY_VERSION,
    notes: "",
  };
}

function prepareFast(r, { sources = [fetchedSource()], indexes = indexesFor(), verdicts = {} } = {}) {
  const preliminary = processRow({ row: r, verificationSources: sources, indexes });
  const handoff = handoffFor(r, preliminary, { verdicts });
  const ingest = ingestFastFactCheckHandoff({
    handoff,
    expectedClaims: preliminary.claims,
    expectedSources: preliminary.verificationSources,
    intelId: r.id,
    intakeSnapshotSha256: preliminary.report.row_sha256,
    eventKey: preliminary.report.derived_event_key,
    policyVersion: FAST_MODE_POLICY_VERSION,
    reviewerVersion: REVIEWER,
    now: NOW,
  });
  const boundReview = ingest.bound
    ? { bound: true, review_bundle_sha256: ingest.bundle.review_bundle_sha256, claims_all_supported: ingest.claims_all_supported, bundle: ingest.bundle }
    : { bound: false, code: ingest.code, claims_all_supported: false };
  const result = boundReview.bound
    ? processRow({ row: r, verificationSources: sources, indexes, trustedEvidence: toPhaseATrustedEvidence(ingest.bundle, preliminary.verificationSources) })
    : preliminary;
  return { preliminary, handoff, ingest, boundReview, result, sources, indexes };
}

function factRow(id, { field = "status", current = "under_construction", proposed = "completed", effectiveDate = "2026-09-10", ...overrides } = {}) {
  return row(id, {
    fact_proposals_json: JSON.stringify([{
      project_id: "alba-palm-beach",
      field,
      old_value: current,
      new_value: proposed,
      effective_date: effectiveDate,
      reason: "Verified fact change",
    }]),
    ...overrides,
  });
}

// In-memory Sheet provider for cycle tests.
function memorySheets(tabs = {}) {
  const state = new Map(Object.entries(tabs).map(([name, values]) => [name, values.map((rowValues) => [...rowValues])]));
  return {
    state,
    async readValues(tab) {
      return (state.get(tab) || []).map((rowValues) => [...rowValues]);
    },
    async updateCells(tab, updates) {
      const values = state.get(tab) || [];
      for (const update of updates) {
        while (values.length < update.rowNumber) values.push([]);
        const rowValues = values[update.rowNumber - 1];
        while (rowValues.length < update.columnIndex) rowValues.push("");
        rowValues[update.columnIndex - 1] = String(update.value ?? "");
      }
      state.set(tab, values);
    },
    async appendRow(tab, cells) {
      const values = state.get(tab) || [];
      values.push(cells.map(String));
      state.set(tab, values);
    },
    async ensureTab(tab, headers) {
      if (!state.has(tab)) {
        state.set(tab, [[...headers]]);
        return { created: true, headerWritten: true };
      }
      return { created: false, headerWritten: false };
    },
  };
}

const INTEL_HEADERS = [
  "id", "status", "headline", "project_name", "record_type", "source_url", "category",
  "summary", "material_updates", "source_published_date", "event_date", "related_project_ids",
  "related_corridor_ids", "requires_human_review", "verification_status", "verification_summary",
  "review_notes", "event_key", "flags_json", "fact_proposals_json", "lead_source_url",
  "primary_source_url", "fact_check_handoff_json", "p2_packet_json", "p2_row_sha256",
  "p2_event_key", "p2_content_hash", "p2_evidence_hash", "processed_at",
  "processor_version", "output_decision",
];

function intelValues(rows) {
  return [INTEL_HEADERS, ...rows.map((item) => INTEL_HEADERS.map((header) => String(item[header] ?? "")))];
}

function storyRowsFromState(sheets) {
  const values = sheets.state.get(STORY_QUEUE_SHEET) || [];
  const headers = values[0] || [];
  return values.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

test("fast policy: article auto-publishes when core event is supported and a secondary claim is conflicted", () => {
  const r = row("fast-1", { material_updates: "Residence count reported as 261 by one source and 262 by another." });
  const prepared = prepareFast(r);
  assert.equal(prepared.ingest.bound, true);
  const secondary = prepared.preliminary.claims.find((claim) => claim.field === "material_updates");
  const verdicts = { [secondary.claim_id]: "conflicting" };
  const rerun = prepareFast(r, { verdicts });
  const decision = decideFast({ row: r, result: rerun.result, boundReview: rerun.boundReview });
  assert.equal(decision.policy_version, FAST_MODE_POLICY_VERSION);
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.ok(decision.qualified_claims.some((claim) => claim.field === "material_updates"));
});

test("fast policy: requires_human_review=TRUE does not force hold", () => {
  const r = row("fast-flag", { requires_human_review: "TRUE", summary: "Pricing starts at $3.5M according to the report." });
  const { result, boundReview } = prepareFast(r);
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
});

test("fast policy: pricing/delivery flags alone do not block", () => {
  const r = row("fast-flags", { material_updates: "Sales launch announced; delivery expected 2029; prices from $2M." });
  const { result, boundReview } = prepareFast(r);
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
});

test("fast policy: core event contradiction holds (conflicting core claim)", () => {
  const r = row("fast-contra");
  const first = prepareFast(r);
  const headlineClaim = first.preliminary.claims.find((claim) => claim.field === "headline");
  const { result, boundReview } = prepareFast(r, { verdicts: { [headlineClaim.claim_id]: "conflicting" } });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.HOLD);
});

test("fast policy: chronology-conflicting event holds (topped-out tower cannot top out again)", () => {
  const r = row("fast-sfh", {
    headline: "South Flagler House rises to 15th floor",
    summary: "South Flagler House topped out in November 2025 and crews are now pouring the 15th floor.",
    material_updates: "15th floor concrete pour underway.",
    related_project_ids: "south-flagler-house",
    event_date: "",
    source_published_date: "",
  });
  const indexes = indexesFor("status", "under_construction", [{ event_key: "project|south-flagler-house|construction|topping-out|2025-11" }]);
  const preliminary = processRow({ row: r, verificationSources: [fetchedSource()], indexes });
  assert.equal(preliminary.report.dedupe_classification, "conflicting_event");
  const { result, boundReview } = prepareFast(r, { indexes });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.HOLD);
});

test("fast policy: duplicate event classifies as DUPLICATE and produces no fact change", () => {
  const r = row("fast-dup");
  const indexes = indexesFor();
  const preliminary = processRow({ row: r, verificationSources: [fetchedSource()], indexes });
  const dupIndexes = { ...indexes, events: [{ event_key: preliminary.report.derived_event_key }] };
  const { result, boundReview } = prepareFast(r, { indexes: dupIndexes });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.DUPLICATE);
  assert.equal(decision.fact_change_decision, FACT_DECISION.NONE);
});

test("fast policy: dynamic delivery timing auto-applies with provenance while the story publishes", () => {
  const r = factRow("fast-mixed", { field: "deliveryTiming", current: "2027", proposed: "2029" });
  const { result, boundReview } = prepareFast(r, { indexes: indexesFor("deliveryTiming", "2027") });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.equal(decision.fact_change_decision, FACT_DECISION.AUTO_APPLY);
  assert.equal(decision.fact_mutations[0].as_of, "2026-09-10");
});

test("fast policy: legal fact requires a human while the story still auto-publishes", () => {
  const r = factRow("fast-legal", { field: "legal", current: "none", proposed: "condo termination filed" });
  const { result, boundReview } = prepareFast(r, { indexes: indexesFor("legal", "none") });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.equal(decision.fact_change_decision, FACT_DECISION.NEEDS_DECISION);
  assert.equal(decision.fact_mutations.length, 0);
});

test("fast policy: objective fact auto-applies without an article candidate requirement", () => {
  const r = factRow("fast-fact");
  const { result, boundReview } = prepareFast(r);
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.fact_change_decision, FACT_DECISION.AUTO_APPLY);
  const mutation = decision.fact_mutations[0];
  assert.equal(mutation.field, "status");
  assert.equal(mutation.value, "completed");
  assert.equal(mutation.as_of, "2026-09-10");
  assert.ok(mutation.source_url);
  assert.equal(mutation.policy_version, FAST_MODE_POLICY_VERSION);
});

test("fast policy: dynamic fact auto-applies with as-of + source provenance", () => {
  const r = factRow("fast-price", { field: "priceDisplay", current: "from $3M", proposed: "from $3.5M" });
  const { result, boundReview } = prepareFast(r, { indexes: indexesFor("priceDisplay", "from $3M") });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.fact_change_decision, FACT_DECISION.AUTO_APPLY);
  const mutation = decision.fact_mutations[0];
  assert.equal(mutation.field, "priceDisplay");
  assert.equal(mutation.risk_classification, "auto_dynamic");
  assert.equal(mutation.as_of, "2026-09-10");
  assert.ok(mutation.source_url);
});

test("fast policy: unbound review holds the article", () => {
  const r = row("fast-unbound");
  const result = processRow({ row: r, verificationSources: [fetchedSource()], indexes: indexesFor() });
  const decision = decideFast({ row: r, result, boundReview: { bound: false, code: "ERR_REVIEW_BUNDLE_REQUIRED" } });
  assert.equal(decision.article_decision, ARTICLE_DECISION.HOLD);
});

test("v2 handoff rejects hash mismatches, unknown claims, and unfetched sources", () => {
  const r = row("handoff-guard");
  const preliminary = processRow({ row: r, verificationSources: [fetchedSource()], indexes: indexesFor() });
  const good = handoffFor(r, preliminary);
  const badSha = { ...good, intake_snapshot_sha256: "0".repeat(64) };
  assert.equal(ingestFastFactCheckHandoff({ handoff: badSha, expectedClaims: preliminary.claims, expectedSources: preliminary.verificationSources, intelId: r.id, intakeSnapshotSha256: preliminary.report.row_sha256, eventKey: preliminary.report.derived_event_key, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion: REVIEWER, now: NOW }).code, "ERR_REVIEW_SNAPSHOT_MISMATCH");
  const missingClaim = { ...good, claims: good.claims.slice(1) };
  assert.equal(ingestFastFactCheckHandoff({ handoff: missingClaim, expectedClaims: preliminary.claims, expectedSources: preliminary.verificationSources, intelId: r.id, intakeSnapshotSha256: preliminary.report.row_sha256, eventKey: preliminary.report.derived_event_key, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion: REVIEWER, now: NOW }).code, "ERR_REVIEW_CLAIMS_MISMATCH");
  const badSource = { ...good, claims: good.claims.map((claim) => ({ ...claim, evidence_source_ref_ids: ["source-nonexistent"] })) };
  assert.equal(ingestFastFactCheckHandoff({ handoff: badSource, expectedClaims: preliminary.claims, expectedSources: preliminary.verificationSources, intelId: r.id, intakeSnapshotSha256: preliminary.report.row_sha256, eventKey: preliminary.report.derived_event_key, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion: REVIEWER, now: NOW }).code, "ERR_REVIEW_SOURCE_MISMATCH");
});

test("fact-check packet carries copy-verbatim hashes and fetched source refs", () => {
  const r = row("packet-1");
  const preliminary = processRow({ row: r, verificationSources: [fetchedSource()], indexes: indexesFor() });
  const packet = buildFastFactCheckPacket({ result: preliminary, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion: REVIEWER });
  assert.equal(packet.intake_snapshot_sha256, preliminary.report.row_sha256);
  assert.equal(packet.event_key, preliminary.report.derived_event_key);
  assert.equal(packet.claims.length, preliminary.claims.length);
  assert.ok(packet.available_sources[0].retrieved);
});

test("story queue: idempotent enqueue, error retry reuses the row, event_key dedupe", () => {
  const rows = [];
  const first = enqueueStory(rows, { eventKey: "project|alba|construction|topping-out|2026-09", intelIds: ["i-1"], fields: { headline: "Alba tops out" } });
  assert.equal(first.created, true);
  const again = enqueueStory(rows, { eventKey: "project|alba|construction|topping-out|2026-09", intelIds: ["i-2"] });
  assert.equal(again.created, false);
  assert.equal(rows.length, 1);
  rows[0].status = STORY_STATUS.ERROR;
  rows[0].error = "boom";
  const retry = enqueueStory(rows, { eventKey: "project|alba|construction|topping-out|2026-09", intelIds: ["i-3"] });
  assert.equal(retry.reused, "error_retry");
  assert.equal(rows[0].status, STORY_STATUS.READY_FOR_WRITER);
  assert.equal(rows[0].error, "");
  assert.equal(validateStoryRow(rows[0]).length, 0);
  assert.equal(storyRowToCells(rows[0]).length, STORY_QUEUE_COLUMNS.length);
  assert.equal(storyIdFor({ eventKey: "e", intelIds: ["a"] }), storyIdFor({ eventKey: "e", intelIds: ["a"] }));
});

test("automated facts: apply once, manual override wins, provenance recorded", () => {
  const automated = emptyAutomatedFacts(FAST_MODE_POLICY_VERSION);
  const manual = { projects: { "alba-palm-beach": { deliveryTiming: { value: "2Q 2026", source: "manual_review", reviewedBy: "Brooke", reviewedAt: "2026-06-18" } } } };
  const mutations = [
    { project_id: "alba-palm-beach", field: "status", value: "completed", previous_value: "under_construction", as_of: "2026-09-10", effective_date: "2026-09-10", source_url: "https://example.com/a", source_name: "Example", policy_version: FAST_MODE_POLICY_VERSION, evidence_bundle_sha256: "b".repeat(64), apply: true },
    { project_id: "alba-palm-beach", field: "deliveryTiming", value: "3Q 2026", as_of: "2026-09-10", effective_date: "2026-09-10", source_url: "https://example.com/b", policy_version: FAST_MODE_POLICY_VERSION, apply: true },
  ];
  const outcome = applyAutomatedFacts({ automated, manual, mutations, intelId: "i-1", now: new Date(NOW) });
  assert.equal(outcome.changed, true);
  assert.equal(outcome.applied.length, 1);
  assert.equal(outcome.skipped[0].reason, "manual_override_wins");
  const entry = automated.projects["alba-palm-beach"].status;
  assert.equal(entry.source, "automated_intel");
  assert.equal(entry.asOf, "2026-09-10");
  assert.equal(entry.intelId, "i-1");
  const second = applyAutomatedFacts({ automated, manual, mutations, intelId: "i-1", now: new Date(NOW) });
  assert.equal(second.changed, false);
});

test("automated entry shape carries source/as-of context for dynamic facts", () => {
  const entry = automatedEntryForMutation({
    mutation: { value: "$3.5M", as_of: "2026-09-13", source_url: "https://example.com", policy_version: FAST_MODE_POLICY_VERSION, evidence_bundle_sha256: "c".repeat(64) },
    intelId: "i-9",
    now: new Date(NOW),
  });
  assert.equal(entry.value, "$3.5M");
  assert.equal(entry.asOf, "2026-09-13");
  assert.equal(entry.sourceUrl, "https://example.com");
  assert.equal(entry.source, "automated_intel");
});

test("cycle: end-to-end packet -> handoff -> story queued -> publish -> published, with idempotent retry", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, "content/overrides"), { recursive: true });
  await fs.writeFile(path.join(dir, "content/overrides/project-fact-automated.json"), JSON.stringify(emptyAutomatedFacts(FAST_MODE_POLICY_VERSION)));
  await fs.writeFile(path.join(dir, "content/overrides/project-fact-overrides.json"), JSON.stringify({ version: 1, updatedAt: "", projects: {} }));

  const r = row("cycle-1");
  const sheets = memorySheets({ Incoming_Intel: intelValues([r]) });
  const sources = [fetchedSource()];

  // Cycle 1: no handoff -> packet emitted, row waits for the verifier.
  const first = await runFastCycle({ root: dir, sheets, indexes: indexesFor(), fetchSources: async () => sources, now: NOW });
  assert.equal(first.results[0].stage, "awaiting_fact_check");
  const sheetRow1 = (await sheets.readValues("Incoming_Intel"))[1];
  const packetJson = sheetRow1[INTEL_HEADERS.indexOf("p2_packet_json")];
  assert.ok(packetJson);

  // The external verifier copies packet values into a v2 handoff. The
  // preliminary must be built from the row exactly as the sheet materializes
  // it (every header present as a string) so snapshot hashes match.
  const packet = JSON.parse(packetJson);
  const sheetRow = Object.fromEntries(INTEL_HEADERS.map((header) => [header, String(r[header] ?? "")]));
  const preliminary = processRow({ row: intakeSnapshotRow(sheetRow), verificationSources: sources, indexes: indexesFor() });
  const handoff = handoffFor(sheetRow, preliminary);
  assert.equal(handoff.intake_snapshot_sha256, packet.intake_snapshot_sha256);
  const rowWithHandoff = { ...r, fact_check_handoff_json: JSON.stringify(handoff), status: "fact_checked" };

  // Cycle 2: handoff present -> AUTO_PUBLISH -> Story_Queue ready_for_writer.
  const sheets2 = memorySheets({ Incoming_Intel: intelValues([{ ...rowWithHandoff, p2_packet_json: packetJson, p2_content_hash: sheetRow1[INTEL_HEADERS.indexOf("p2_content_hash")], p2_row_sha256: packet.intake_snapshot_sha256, p2_event_key: packet.event_key }]) });
  const second = await runFastCycle({ root: dir, sheets: sheets2, indexes: indexesFor(), fetchSources: async () => sources, now: NOW });
  assert.equal(second.results[0].article_decision, "AUTO_PUBLISH");
  const storyRows = storyRowsFromState(sheets2);
  assert.equal(storyRows.length, 1);
  assert.equal(storyRows[0].status, STORY_STATUS.READY_FOR_WRITER);
  assert.equal(storyRows[0].article_decision, "AUTO_PUBLISH");
  assert.ok(JSON.parse(storyRows[0].verified_facts_json).length > 0);

  // Writer fills the package and marks ready_to_publish; publisher succeeds.
  storyRows[0].status = STORY_STATUS.READY_TO_PUBLISH;
  storyRows[0].story_package_json = JSON.stringify({
    destination: "news",
    title: "Alba reaches construction milestone",
    deck: "The downtown project moved forward.",
    sections: [{ heading: "What happened", body: "The project reached a verified construction milestone." }],
    sourceName: "WPB",
    sourceUrl: "https://www.wpb.org/government/development-services",
  });
  const sheets3 = memorySheets({
    Incoming_Intel: intelValues([{ ...rowWithHandoff, p2_content_hash: "x", p2_evidence_hash: "y" }]),
    [STORY_QUEUE_SHEET]: [STORY_QUEUE_COLUMNS.slice(), ...storyRows.map((story) => storyRowToCells(story))],
  });
  const published = await runFastCycle({
    root: dir,
    sheets: sheets3,
    indexes: indexesFor(),
    fetchSources: async () => sources,
    now: NOW,
    publish: async () => ({ ok: true, liveUrl: "https://www.wpbnewconstruction.com/updates/alba/", commitSha: "abc123" }),
  });
  assert.equal(published.publishActions[0].ok, true);
  const publishedRows = storyRowsFromState(sheets3);
  assert.equal(publishedRows[0].status, STORY_STATUS.PUBLISHED);
  assert.equal(publishedRows[0].published_url, "https://www.wpbnewconstruction.com/updates/alba/");
  assert.equal(publishedRows[0].commit_sha, "abc123");

  // Cycle re-run: already published -> no second publish call.
  let calls = 0;
  const rerun = await runFastCycle({
    root: dir,
    sheets: sheets3,
    indexes: indexesFor(),
    fetchSources: async () => sources,
    now: NOW,
    publish: async () => { calls += 1; return { ok: true, liveUrl: "x" }; },
  });
  assert.equal(calls, 0);
  assert.equal(rerun.publishActions.length, 0);
});

test("cycle: failed publish marks error in place and retries without duplicating", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const story = {
    story_id: "story-err", status: STORY_STATUS.READY_TO_PUBLISH, created_at: NOW_ISO, updated_at: NOW_ISO,
    intel_ids: "i-1", event_key: "project|alba|development|development-update|2026-09-10",
    project_ids: "alba-palm-beach", corridor_ids: "", headline: "H", deck: "D", summary: "S",
    story_package_json: JSON.stringify({ title: "T", deck: "D", sections: [{ heading: "h", body: "b" }] }),
    publish_attempts: "0", error: "", publish_status: "", published_url: "", commit_sha: "",
  };
  const sheets = memorySheets({
    Incoming_Intel: intelValues([]),
    [STORY_QUEUE_SHEET]: [[...STORY_QUEUE_COLUMNS], storyRowToCells(story)],
  });
  let attempts = 0;
  const outcome = await runFastCycle({
    root: dir,
    sheets,
    indexes: indexesFor(),
    now: NOW,
    publish: async () => { attempts += 1; return { ok: false, error: "build failed" }; },
  });
  assert.equal(attempts, 1);
  const rowsAfter = storyRowsFromState(sheets);
  assert.equal(rowsAfter.length, 1);
  assert.equal(rowsAfter[0].status, STORY_STATUS.ERROR);
  assert.equal(rowsAfter[0].publish_attempts, "1");
  assert.match(rowsAfter[0].error, /build failed/);
  // Second cycle retries the same row rather than creating a new article.
  await runFastCycle({ root: dir, sheets, indexes: indexesFor(), now: NOW, publish: async () => { attempts += 1; return { ok: false, error: "still failing" }; } });
  assert.equal(attempts, 2);
  assert.equal(storyRowsFromState(sheets).length, 1);
});

test("article input mapping prefers package fields and requires title/deck/body", () => {
  const story = {
    story_id: "story-x", event_key: "e", project_ids: "alba-palm-beach", corridor_ids: "downtown",
    headline: "Fallback headline", deck: "Fallback deck", summary: "S",
    story_package_json: JSON.stringify({ title: "Pkg title", deck: "Pkg deck", sections: [{ heading: "h", body: "b" }], sourceUrl: "https://example.com" }),
  };
  const { input } = articleInputFromStory(story);
  assert.equal(input.title, "Pkg title");
  assert.equal(input.destination, "news");
  assert.deepEqual(input.relatedProjectIds, ["alba-palm-beach"]);
  const bad = articleInputFromStory({ story_id: "s", event_key: "e", story_package_json: "not json" });
  assert.ok(bad.error);
});

test("digest reports outcomes, not review queue", () => {
  const digest = buildFastDigest({
    results: [
      { intel_id: "a", article_decision: "AUTO_PUBLISH", fact_change_decision: "AUTO_APPLY", applied_facts: [{ field: "status" }] },
      { intel_id: "b", article_decision: "DUPLICATE", fact_change_decision: "NONE" },
      { intel_id: "c", stage: "awaiting_fact_check" },
    ],
    storyActions: [{ action: "queued_for_writer" }],
    publishActions: [{ ok: true }, { ok: false, error: "x" }],
    generatedAt: NOW_ISO,
  });
  assert.equal(digest.summary.stories_published, 1);
  assert.equal(digest.summary.publish_errors_retrying, 1);
  assert.equal(digest.summary.facts_applied, 1);
  assert.equal(digest.summary.duplicates_skipped, 1);
  assert.equal(digest.summary.needs_brooke, 0);
  assert.match(fastDigestMarkdown(digest), /1 stories published/);
});

test("field classification: dynamic fields are auto, legal stays human", () => {
  assert.equal(classifyFastFactField("status"), "auto_objective");
  assert.equal(classifyFastFactField("residenceCount"), "auto_objective");
  assert.equal(classifyFastFactField("deliveryTiming"), "auto_dynamic");
  assert.equal(classifyFastFactField("priceDisplay"), "auto_dynamic");
  assert.equal(classifyFastFactField("legal"), "human_required");
  assert.equal(classifyFastFactField("unknownField"), "human_required");
});
