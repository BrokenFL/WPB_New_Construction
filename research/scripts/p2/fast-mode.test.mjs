import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
  FAST_MODE_PROCESSOR_VERSION,
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
  storySeedFields,
  validateStoryRow,
} from "./story-queue.mjs";
import { applyAutomatedFacts, automatedEntryForMutation, emptyAutomatedFacts } from "./fast-facts.mjs";
import { intelRowHashes, intakeSnapshotRow, runFastCycle, validateSheetHeaders } from "./fast-cycle.mjs";
import {
  dryRunFactApplier,
  fetchSources,
  isAllowedFactOutputPath,
  sourceHintsFromRow,
  summarizeCycleActivity,
  summarizeSheetState,
} from "./fast-cycle-cli.mjs";
import {
  articleInputFromStory,
  enrichStoryWithApprovedImages,
  publishStory,
  validatePublishableStory,
} from "./story-publisher.mjs";
import { buildFastDigest, fastDigestMarkdown } from "./fast-digest.mjs";
import { createGoogleSheetsIo, exactHeaderMatch } from "./google-sheets-io.mjs";

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
    discovery_sources_json: "",
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

function indexesForProject(projectId, fields = {}, events = []) {
  return {
    events,
    public_corpus: "",
    reviewed_facts: {
      projects: {
        [projectId]: Object.fromEntries(Object.entries(fields).map(([field, value]) => [field, { value, source: "canonical_model" }])),
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

function prepareFast(r, { sources = [fetchedSource()], indexes = indexesFor(), verdicts = {}, sourcePicker } = {}) {
  const preliminary = processRow({ row: r, verificationSources: sources, indexes });
  const handoff = handoffFor(r, preliminary, { verdicts, sourcePicker });
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
  "primary_source_url", "discovery_sources_json", "fact_check_handoff_json", "p2_packet_json", "p2_row_sha256",
  "p2_event_key", "p2_content_hash", "p2_evidence_hash", "processed_at",
  "processor_version", "output_decision", "site_update_id", "canonical_update_url", "published_at",
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
  const seed = storySeedFields({ row: r, result: rerun.result, boundReview: rerun.boundReview, decision });
  assert.equal(rerun.result.candidate, null);
  assert.equal(seed.project_ids, "alba-palm-beach");
  assert.equal(seed.corridor_ids, "north-flagler");
  assert.equal(JSON.parse(seed.story_package_json).sourceUrl, "https://www.wpb.org/government/development-services");
});

test("fast policy: a reputable source must support the semantic occurrence, not only metadata", () => {
  const r = row("fast-core-source");
  const sources = [
    fetchedSource("https://example.com/unclassified", "lower-tier core evidence"),
    fetchedSource("https://therealdeal.com/miami/secondary", "reputable secondary evidence"),
  ];
  const { result, boundReview } = prepareFast(r, {
    sources,
    sourcePicker: (claim, sourceIds) => claim.field === "corridor_identity" ? [sourceIds[1]] : [sourceIds[0]],
  });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.HOLD);
  assert.deepEqual(decision.reasons.article, ["no_credible_source_supports_core_occurrence"]);
});

test("fast policy: legacy requires_human_review=TRUE does not control Fast Mode", () => {
  const r = row("fast-flag", { requires_human_review: "TRUE", summary: "Pricing starts at $3.5M according to the report." });
  const { result, boundReview } = prepareFast(r);
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
});

test("fast policy: only the explicit Fast Mode flag routes a row to Brooke", () => {
  const r = row("fast-explicit-flag", { flags_json: JSON.stringify({ brooke_decision_required: true }) });
  const { result, boundReview } = prepareFast(r);
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.NEEDS_DECISION);
  assert.deepEqual(decision.reasons.article, ["brooke_decision_required_flag"]);
});

test("fast policy: pricing/delivery flags alone do not block", () => {
  const r = row("fast-flags", { material_updates: "Sales launch announced; delivery expected 2029; prices from $2M." });
  const { result, boundReview } = prepareFast(r);
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
});

test("fast policy: a conflicted editorial headline does not override a supported occurrence", () => {
  const r = row("fast-contra");
  const first = prepareFast(r);
  const headlineClaim = first.preliminary.claims.find((claim) => claim.field === "headline");
  const { result, boundReview } = prepareFast(r, { verdicts: { [headlineClaim.claim_id]: "conflicting" } });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.ok(decision.qualified_claims.some((claim) => claim.field === "headline"));
});

test("fast policy: no supported occurrence remains a genuine article hold", () => {
  const r = row("fast-core-contra");
  const first = prepareFast(r);
  const verdicts = Object.fromEntries(first.preliminary.claims
    .filter((claim) => ["headline", "summary", "material_updates"].includes(claim.field))
    .map((claim) => [claim.claim_id, "conflicting"]));
  const { result, boundReview } = prepareFast(r, { verdicts });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.HOLD);
  assert.deepEqual(decision.reasons.article, ["no_credible_source_supports_core_occurrence"]);
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

test("fast policy: duplicate event classifies as DUPLICATE when no fact changed", () => {
  const r = row("fast-dup");
  const indexes = indexesFor();
  const preliminary = processRow({ row: r, verificationSources: [fetchedSource()], indexes });
  const dupIndexes = { ...indexes, events: [{ event_key: preliminary.report.derived_event_key }] };
  const { result, boundReview } = prepareFast(r, { indexes: dupIndexes });
  const decision = decideFast({ row: r, result, boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.DUPLICATE);
  assert.equal(decision.fact_change_decision, FACT_DECISION.NONE);
});

test("Fast Mode V2: 534 Datura publishes while an uncertain secondary count is omitted", () => {
  const r = row("fast-534-datura", {
    project_name: "534 Datura",
    headline: "534 Datura proposal includes exactly 124 workforce units",
    summary: "A developer submitted a new mixed-use proposal for 534 Datura Street.",
    material_updates: "The proposal was submitted to the city.; The exact workforce-unit count remains uncertain.",
    requires_human_review: "TRUE",
  });
  const first = prepareFast(r);
  const uncertain = first.preliminary.claims.filter((claim) => /workforce|124/.test(String(claim.claim_value)));
  const verdicts = Object.fromEntries(uncertain.map((claim) => [claim.claim_id, "conflicting"]));
  const prepared = prepareFast(r, { verdicts });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.ok(decision.qualified_claims.some((claim) => /workforce|124/.test(String(claim.value))));
});

test("Fast Mode V2: supported lease publishes without unsupported buyer-demand inference", () => {
  const r = row("fast-a16z", {
    project_name: "CityPlace Tower",
    headline: "a16z signs CityPlace Tower office lease",
    summary: "Andreessen Horowitz signed an office lease at CityPlace Tower.",
    material_updates: "The company signed an office lease.",
    buyer_angle: "The lease will cause new condominium demand.",
  });
  const first = prepareFast(r);
  const inference = first.preliminary.claims.find((claim) => claim.field === "buyer_context");
  const prepared = prepareFast(r, { verdicts: { [inference.claim_id]: "unsupported" } });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.ok(decision.qualified_claims.some((claim) => claim.field === "buyer_context" && claim.disposition === "omit"));
  const seed = storySeedFields({ row: r, result: prepared.result, boundReview: prepared.boundReview, decision });
  assert.equal(JSON.parse(seed.story_package_json).buyerContext, "");
});

test("Fast Mode V2: Shorecrest core milestone publishes with conflicting delivery detail qualified", () => {
  const r = row("fast-shorecrest", {
    project_name: "Shorecrest",
    headline: "Shorecrest breaks ground with construction financing",
    summary: "Shorecrest broke ground after closing construction financing.",
    material_updates: "Groundbreaking and financing are supported.; Delivery is expected in late 2028.",
  });
  const first = prepareFast(r);
  const delivery = first.preliminary.claims.find((claim) => /Delivery is expected/.test(String(claim.claim_value)));
  const prepared = prepareFast(r, { verdicts: { [delivery.claim_id]: "conflicting" } });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.ok(decision.qualified_claims.some((claim) => /Delivery is expected/.test(String(claim.value))));
});

test("Fast Mode V2: Olara 2028 delivery publishes without an unsupported $6.9M headline detail", () => {
  const r = row("fast-olara", {
    project_name: "Olara",
    headline: "Olara contracts reach $6.9M as 2028 delivery is confirmed",
    summary: "Olara is now expected to deliver in 2028.",
    material_updates: "Delivery is expected in 2028.",
  });
  const first = prepareFast(r);
  const headline = first.preliminary.claims.find((claim) => claim.field === "headline");
  const prepared = prepareFast(r, { verdicts: { [headline.claim_id]: "unsupported" } });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  const seed = storySeedFields({ row: r, result: prepared.result, boundReview: prepared.boundReview, decision });
  assert.equal(seed.headline.includes("$6.9M"), false);
  assert.match(seed.headline, /Delivery is expected in 2028|Olara is now expected to deliver in 2028/);
});

test("Fast Mode V2: unsupported corridor and incorrect event-key date are removable metadata", () => {
  const r = row("fast-removable-metadata", {
    event_key: "project|alba-palm-beach|development|development-update|2025-01-01",
    material_updates: "The project broke ground in September 2026.",
  });
  const first = prepareFast(r);
  const corridor = first.preliminary.claims.find((claim) => claim.field === "corridor_identity");
  const eventIdentity = first.preliminary.claims.find((claim) => claim.field === "event_identity");
  const prepared = prepareFast(r, { verdicts: {
    [corridor.claim_id]: "unsupported",
    [eventIdentity.claim_id]: "unsupported",
  } });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  const seed = storySeedFields({ row: r, result: prepared.result, boundReview: prepared.boundReview, decision });
  assert.equal(seed.corridor_ids, "");
});

test("Fast Mode V2: Banyan article flows and a supported 88-residence claim synthesizes a canonical proposal", () => {
  const projectId = "banyan-tree";
  const r = row("fast-banyan", {
    project_name: "Banyan Tree Residences",
    related_project_ids: projectId,
    headline: "Banyan Tree proposal receives DAC approval",
    summary: "The Downtown Action Committee approved the Banyan Tree proposal.",
    material_updates: "The DAC approved the proposal.; The project will include 88 residences.",
  });
  const indexes = indexesForProject(projectId, { status: "Planning", residenceCount: 86 });
  const prepared = prepareFast(r, { indexes });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview, indexes });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.equal(decision.fact_change_decision, FACT_DECISION.AUTO_APPLY);
  assert.equal(decision.fact_mutations.find((mutation) => mutation.field === "residenceCount")?.value, "88");
  assert.equal(decision.synthesized_fact_proposals.some((proposal) => proposal.field === "residenceCount"), true);
});

test("Fast Mode V2: synthesized status never regresses a later canonical milestone", () => {
  const projectId = "alba-palm-beach";
  const r = row("fast-status-regression", {
    related_project_ids: projectId,
    summary: "The developer filed plans for the project.",
    material_updates: "The plans were filed with the city.",
  });
  const indexes = indexesForProject(projectId, { status: "Completed" });
  const prepared = prepareFast(r, { indexes });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview, indexes });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.equal(decision.synthesized_fact_proposals.some((proposal) => proposal.field === "status"), false);
});

test("Fast Mode V2: completed construction milestone does not mark the whole project Completed", () => {
  const projectId = "south-flagler-house";
  const r = row("fast-milestone-not-project-completion", {
    project_name: "South Flagler House",
    related_project_ids: projectId,
    headline: "South Flagler House construction milestone",
    summary: "South Flagler House reached a documented structural milestone.",
    material_updates: "Structural topping out completed.",
  });
  const indexes = indexesForProject(projectId, { status: "Under Construction" });
  const prepared = prepareFast(r, { indexes });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview, indexes });
  assert.equal(decision.article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  assert.equal(decision.synthesized_fact_proposals.some((proposal) => proposal.field === "status"), false);
  assert.equal(decision.fact_mutations.some((mutation) => mutation.field === "status"), false);
});

test("Fast Mode V2: duplicate 464 Fern article does not suppress supported canonical reconciliation", () => {
  const intakeProjectId = "464-fern-street";
  const projectId = "fern-and-gardenia-related-ross-fern-street";
  const r = row("fast-464-fern", {
    project_name: "464 Fern",
    related_project_ids: intakeProjectId,
    headline: "Updated plans filed for 464 Fern",
    summary: "The developer filed updated plans for 464 Fern Street.",
    material_updates: "The updated plans call for 194 residences.",
  });
  const base = indexesForProject(projectId, { status: "Planning", residenceCount: 130 });
  base.project_aliases = { [intakeProjectId]: projectId };
  const preliminary = processRow({ row: r, verificationSources: [fetchedSource()], indexes: base });
  const indexes = { ...base, events: [{ event_key: preliminary.report.derived_event_key }] };
  const prepared = prepareFast(r, { indexes });
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview, indexes });
  assert.equal(decision.article_decision, ARTICLE_DECISION.DUPLICATE);
  assert.equal(decision.fact_change_decision, FACT_DECISION.AUTO_APPLY);
  const residenceMutation = decision.fact_mutations.find((mutation) => mutation.field === "residenceCount");
  assert.equal(residenceMutation?.project_id, projectId);
  assert.equal(residenceMutation?.value, "194");
});

test("Fast Mode V2: a genuine article contradiction can coexist with a safe fact auto-apply", () => {
  const r = factRow("fast-independent-hold-fact", { current: "Planning", proposed: "Under Construction" });
  const indexes = indexesFor("status", "Planning");
  const prepared = prepareFast(r, { indexes });
  prepared.result.report.dedupe_classification = "conflicting_event";
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview, indexes });
  assert.equal(decision.article_decision, ARTICLE_DECISION.HOLD);
  assert.equal(decision.fact_change_decision, FACT_DECISION.AUTO_APPLY);
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

test("fast policy: fact auto-apply remains bound to its exact supported claim", () => {
  const r = factRow("fast-fact-claim");
  const prepared = prepareFast(r);
  const proposal = prepared.result.projectFactProposals[0];
  const claim = prepared.result.claims.find((item) => proposal.supporting_claim_ids.includes(item.claim_id));
  claim.support = "unsupported";
  const decision = decideFast({ row: r, result: prepared.result, boundReview: prepared.boundReview });
  assert.equal(decision.fact_change_decision, FACT_DECISION.HOLD);
  assert.ok(decision.reasons.fact_change.includes("status:proposal_claim_not_supported"));
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

test("discovery_sources_json changes the intake hash and preserves every valid source hint", async () => {
  const primary = "https://www.wpb.org/government/development-services";
  const discovery = JSON.stringify([
    { name: "City of West Palm Beach", url: primary, published_date: "2026-09-11", source_type: "government" },
    { name: "The Real Deal", url: "https://therealdeal.com/miami/story", published_date: "2026-09-12", source_type: "trade_news" },
    { url: "https://www.wptv.com/no-metadata", source_type: "local_news" },
    { name: "Unsafe", url: "file:///etc/passwd", published_date: "2026-09-12", source_type: "other" },
  ]);
  const base = row("sources-1", {
    source_name: "Primary City Source",
    source_url: primary,
    lead_source_url: "https://wpbf.com/article/example",
    primary_source_url: "https://floridayimby.com/example",
  });
  assert.notEqual(
    intelRowHashes(base).content_hash,
    intelRowHashes({ ...base, discovery_sources_json: discovery }).content_hash,
  );
  const hints = sourceHintsFromRow({ ...base, discovery_sources_json: discovery });
  assert.equal(hints.length, 5);
  assert.equal(hints[0].source_name, "City of West Palm Beach");
  assert.equal(hints[0].published_date, "2026-09-11");
  assert.equal(hints[0].source_type_hint, "government");
  const noMetadata = hints.find((hint) => hint.url === "https://www.wptv.com/no-metadata");
  assert.equal(noMetadata.source_name, "");
  assert.equal(noMetadata.published_date, undefined);
  assert.ok(hints.every((hint) => /^https?:/.test(hint.url)));

  const called = [];
  const verified = await fetchSources({ ...base, discovery_sources_json: discovery }, {
    verify: async (hint) => {
      called.push(hint.url);
      if (hint.url.includes("wpbf.com")) throw new Error("isolated source failure");
      return {
        ...fetchedSource(hint.url),
        source_name: hint.source_name,
        published_date: hint.published_date,
        hint_source_type: hint.source_type_hint,
      };
    },
  });
  assert.equal(called.length, 5);
  assert.equal(verified.length, 4);
  const preliminary = processRow({ row: { ...base, discovery_sources_json: discovery }, verificationSources: verified, indexes: indexesFor() });
  const packet = buildFastFactCheckPacket({ result: preliminary, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion: REVIEWER });
  const city = packet.available_sources.find((source) => source.source_name === "City of West Palm Beach");
  assert.equal(city.published_date, "2026-09-11");
  assert.equal(city.source_type_hint, "government");
});

test("malformed discovery source JSON is ignored while legacy sources remain compatible", () => {
  const hints = sourceHintsFromRow(row("sources-bad", {
    discovery_sources_json: "{not-json",
    lead_source_url: "https://therealdeal.com/miami/legacy",
  }));
  assert.deepEqual(hints.map((hint) => hint.url), [
    "https://www.wpb.org/government/development-services",
    "https://therealdeal.com/miami/legacy",
  ]);
});

test("source retry falls back to reviewed canonical project URLs only after every intake URL fails", async () => {
  const blocked = "https://therealdeal.com/miami/blocked-story";
  const alternate = "https://www.wptv.com/news/accessible-corroboration";
  const called = [];
  const sources = await fetchSources(row("sources-fallback", {
    source_url: blocked,
    related_project_ids: "alba-palm-beach",
  }), {
    indexes: { project_sources: { "alba-palm-beach": [{ url: alternate, source_name: "WPTV" }] } },
    verify: async (hint) => {
      called.push(hint.url);
      if (hint.url === blocked) return { ...fetchedSource(hint.url), reachable: false, retrieval_status: "unavailable", retrieval_attested: false };
      return fetchedSource(hint.url);
    },
  });
  assert.deepEqual(called, [blocked, alternate]);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].url, alternate);
});

test("fact commits allow only the automated layer and exact fact-dependent generated outputs", () => {
  assert.equal(isAllowedFactOutputPath("content/overrides/project-fact-automated.json"), true);
  assert.equal(isAllowedFactOutputPath("src/generated/projectModelPublic.json"), true);
  assert.equal(isAllowedFactOutputPath("src/generated/siteData.ts"), true);
  assert.equal(isAllowedFactOutputPath("public/data/site-meta.json"), false);
  assert.equal(isAllowedFactOutputPath("research/source-material-review/image-candidate-catalog.json"), false);
  assert.equal(isAllowedFactOutputPath("src/main.ts"), false);
  assert.equal(isAllowedFactOutputPath("research/news-review/approved-development-news.json"), false);
});

test("narrow fact projection preserves dollar-prefixed price text literally", async (t) => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "p2-fact-projection-"));
  t.after(() => fs.rm(fixtureRoot, { recursive: true, force: true }));
  const generated = path.join(fixtureRoot, "src/generated");
  await fs.mkdir(generated, { recursive: true });
  await fs.writeFile(path.join(generated, "projectModelPublic.json"), JSON.stringify({ projects: [{
    publicSlug: "fixture",
    displayName: "Fixture",
    corridor: "Downtown",
    projectType: "condo-active-sales",
    status: "Under Construction",
    price: "$1M to over $2M",
    presentation: { summary: "Fixture summary" },
    sourceUrls: ["https://example.com/source"],
    facts: {
      lastVerifiedDate: "2026-09-14",
      projectAddress: "1 Test Street",
      salesGalleryAddress: "",
      mailingAddress: "",
      planningParcelAddress: "",
      canonicalResidenceCount: "10",
      stories: "12",
      expectedDeliveryCurrent: "2028",
      projectTeam: ["Fixture Developer"],
      amenitySummary: [],
      residenceFeatures: [],
      neighborhoodContext: "Downtown",
      factEffectiveDate: "2026-09-14",
    },
  }] }));
  await fs.writeFile(path.join(generated, "siteData.ts"), "export const projectFacts = [] as const;\n\nexport const prerenderRoutes = [] as const;\n");
  const scriptPath = path.join(process.cwd(), "research/scripts/p2/refresh-fact-projection.mjs");
  const run = spawnSync(process.execPath, [scriptPath], { cwd: fixtureRoot, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const output = await fs.readFile(path.join(generated, "siteData.ts"), "utf8");
  assert.match(output, /"pricing": "\$1M to over \$2M"/);
  assert.match(output, /export const prerenderRoutes = \[\] as const;/);
});

test("Fast Cycle workflow uses its job-scoped write token and explicitly dispatches deploy after a content push", async () => {
  const installed = await fs.readFile(".github/workflows/intel-fast-cycle.yml", "utf8");
  const template = await fs.readFile("tools/github-workflows/intel-fast-cycle.yml", "utf8");
  assert.equal(installed, template);
  assert.match(installed, /permissions:\n\s+contents: write\n\s+actions: write/);
  assert.match(installed, /token: \$\{\{ github\.token \}\}/);
  assert.match(installed, /npx playwright install --with-deps chromium/);
  assert.match(installed, /WPB_MAP_QA_MODE: no-key/);
  assert.match(installed, /gh workflow run deploy-cloudflare-pages\.yml --ref main/);
  assert.doesNotMatch(installed, /P2_PUBLISH_PAT/);
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
    { project_id: "alba-palm-beach", field: "deliveryTiming", value: "3Q 2026", as_of: "2026-09-10", effective_date: "2026-09-10", source_url: "https://example.com/b", evidence_bundle_sha256: "c".repeat(64), policy_version: FAST_MODE_POLICY_VERSION, apply: true },
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

test("automated facts reject prototype keys and stale or same-date conflicting updates", () => {
  const baseMutation = {
    project_id: "alba-palm-beach",
    field: "status",
    value: "completed",
    previous_value: "under_construction",
    as_of: "2026-09-10",
    effective_date: "2026-09-10",
    source_url: "https://www.wpb.org/project",
    policy_version: FAST_MODE_POLICY_VERSION,
    evidence_bundle_sha256: "d".repeat(64),
    apply: true,
  };
  const polluted = applyAutomatedFacts({
    automated: emptyAutomatedFacts(FAST_MODE_POLICY_VERSION),
    manual: { projects: {} },
    mutations: [{ ...baseMutation, project_id: "__proto__" }],
    intelId: "bad-key",
    now: new Date(NOW),
  });
  assert.equal(polluted.changed, false);
  assert.equal(polluted.skipped[0].reason, "invalid_project_id");
  assert.equal(Object.prototype.status, undefined);

  const automated = emptyAutomatedFacts(FAST_MODE_POLICY_VERSION);
  automated.projects["alba-palm-beach"] = {
    status: automatedEntryForMutation({ mutation: baseMutation, intelId: "newer", now: new Date(NOW) }),
  };
  automated.projects["alba-palm-beach"].status.asOf = "2026-09-12";
  const stale = applyAutomatedFacts({ automated, manual: { projects: {} }, mutations: [{ ...baseMutation, as_of: "2026-09-11" }], intelId: "stale", now: new Date(NOW) });
  assert.equal(stale.skipped[0].reason, "stale_as_of");
  const conflict = applyAutomatedFacts({
    automated,
    manual: { projects: {} },
    mutations: [{ ...baseMutation, value: "sales_launched", previous_value: "completed", as_of: "2026-09-12", evidence_bundle_sha256: "e".repeat(64) }],
    intelId: "conflict",
    now: new Date(NOW),
  });
  assert.equal(conflict.skipped[0].reason, "same_as_of_conflict");
});

test("Sheet schemas reject duplicate headers before any tab mutation", async () => {
  assert.throws(
    () => validateSheetHeaders(["id", "status", "status"], ["id", "status"], { tab: "Incoming_Intel" }),
    /duplicate:status/,
  );
  let ensured = false;
  const sheets = {
    async readValues() { return [["id", "status", "status"]]; },
    async ensureTab() { ensured = true; },
  };
  await assert.rejects(
    runFastCycle({ root: process.cwd(), sheets, indexes: indexesFor(), now: NOW }),
    /ERR_SHEET_SCHEMA:Incoming_Intel/,
  );
  assert.equal(ensured, false);
});

test("Google Sheet schema validation never converts a header-read failure into a write", async () => {
  const calls = [];
  const io = createGoogleSheetsIo({
    expectedSheetId: "sheet-id",
    accessTokenProvider: async () => "token",
    fetchImpl: async (url, options) => {
      calls.push({ url, method: options.method });
      if (url.endsWith("?fields=sheets.properties.title")) {
        return { ok: true, status: 200, json: async () => ({ sheets: [{ properties: { title: STORY_QUEUE_SHEET } }] }) };
      }
      return { ok: false, status: 503, json: async () => ({}) };
    },
  });
  await assert.rejects(io.ensureTab(STORY_QUEUE_SHEET, [...STORY_QUEUE_COLUMNS]), /ERR_GOOGLE_SHEETS_GET:503/);
  assert.equal(calls.length, 2);
  assert.equal(calls.some((call) => ["PUT", "POST"].includes(call.method)), false);
  assert.equal(exactHeaderMatch(["a", "b"], ["a", "b"]), true);
  assert.equal(exactHeaderMatch(["b", "a"], ["a", "b"]), false);
});

test("cycle quarantines every row in a duplicate-ID group while processing unrelated rows", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-duplicates-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const sheets = memorySheets({
    Incoming_Intel: intelValues([
      row("same-id", { headline: "First duplicate" }),
      row("same-id", { headline: "Second duplicate" }),
      row("unique-id"),
    ]),
  });
  const cycle = await runFastCycle({
    root: dir,
    sheets,
    indexes: indexesFor(),
    fetchSources: async () => [fetchedSource()],
    now: NOW,
  });
  const duplicate = cycle.results.find((result) => result.quarantine_reason === "duplicate_id");
  assert.deepEqual(duplicate.row_numbers, [2, 3]);
  assert.equal(cycle.results.filter((result) => result.quarantine_reason === "duplicate_id").length, 1);
  const values = await sheets.readValues("Incoming_Intel");
  const statusColumn = INTEL_HEADERS.indexOf("status");
  assert.equal(values[1][statusColumn], "quarantined");
  assert.equal(values[2][statusColumn], "quarantined");
  assert.equal(values[3][statusColumn], "awaiting_fact_check");
  assert.ok(values[3][INTEL_HEADERS.indexOf("p2_packet_json")]);
});

test("cycle retries unavailable sources instead of emitting an unusable fact-check packet", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-source-retry-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const sheets = memorySheets({ Incoming_Intel: intelValues([row("source-retry-1")]) });
  const unavailable = { ...fetchedSource(), reachable: false, retrieval_status: "unavailable", retrieval_attested: false };
  const first = await runFastCycle({ root: dir, sheets, indexes: indexesFor(), fetchSources: async () => [unavailable], now: NOW });
  assert.equal(first.results[0].stage, "source_retry");
  let sheetRow = (await sheets.readValues("Incoming_Intel"))[1];
  assert.equal(sheetRow[INTEL_HEADERS.indexOf("status")], "source_retry");
  assert.equal(sheetRow[INTEL_HEADERS.indexOf("p2_packet_json")], "");
  const second = await runFastCycle({ root: dir, sheets, indexes: indexesFor(), fetchSources: async () => [fetchedSource()], now: NOW });
  assert.equal(second.results[0].stage, "awaiting_fact_check");
  sheetRow = (await sheets.readValues("Incoming_Intel"))[1];
  assert.ok(sheetRow[INTEL_HEADERS.indexOf("p2_packet_json")]);
});

test("cycle reprocesses previously decided rows once for the Fast Mode V2 processor revision", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-v2-reprocess-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const intake = row("v2-reprocess", { requires_human_review: "TRUE" });
  const sources = [fetchedSource()];
  const materialized = Object.fromEntries(INTEL_HEADERS.map((header) => [header, String(intake[header] ?? "")]));
  const preliminary = processRow({ row: intakeSnapshotRow(materialized), verificationSources: sources, indexes: indexesFor() });
  const handoff = handoffFor(materialized, preliminary);
  const decided = {
    ...intake,
    status: "needs_decision",
    fact_check_handoff_json: JSON.stringify(handoff),
    output_decision: "ARTICLE:NEEDS_DECISION|FACT:NONE|FACT_STATE:NONE",
    processor_version: FAST_MODE_POLICY_VERSION,
  };
  const hashes = intelRowHashes(decided);
  decided.p2_content_hash = hashes.content_hash;
  decided.p2_evidence_hash = hashes.evidence_hash;
  const sheets = memorySheets({ Incoming_Intel: intelValues([decided]) });
  const cycle = await runFastCycle({ root: dir, sheets, indexes: indexesFor(), fetchSources: async () => sources, now: NOW });
  assert.equal(cycle.results[0].article_decision, ARTICLE_DECISION.AUTO_PUBLISH);
  const stored = (await sheets.readValues("Incoming_Intel"))[1];
  assert.equal(stored[INTEL_HEADERS.indexOf("processor_version")], FAST_MODE_PROCESSOR_VERSION);
  assert.equal(storyRowsFromState(sheets).length, 1);
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
  storyRows[0].article_body = "Writer-owned final body";
  storyRows[0].writer_name = "chatgpt-story-writer";
  storyRows[0].writer_version = "story-writer-v1";
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
  assert.equal(publishedRows[0].article_body, "Writer-owned final body");
  const publishedIntelRow = (await sheets3.readValues("Incoming_Intel"))[1];
  assert.equal(publishedIntelRow[INTEL_HEADERS.indexOf("status")], "published");
  assert.equal(publishedIntelRow[INTEL_HEADERS.indexOf("canonical_update_url")], "https://www.wpbnewconstruction.com/updates/alba/");

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

test("cycle: dry-run facts remain pending and are applied by the next live cycle", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-dry-facts-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, "content/overrides"), { recursive: true });
  const empty = emptyAutomatedFacts(FAST_MODE_POLICY_VERSION);
  await fs.writeFile(path.join(dir, "content/overrides/project-fact-automated.json"), `${JSON.stringify(empty)}\n`);
  await fs.writeFile(path.join(dir, "content/overrides/project-fact-overrides.json"), JSON.stringify({ version: 1, projects: {} }));

  const intake = factRow("dry-fact-1");
  const sources = [fetchedSource()];
  const packetSheets = memorySheets({ Incoming_Intel: intelValues([intake]) });
  await runFastCycle({ root: dir, sheets: packetSheets, indexes: indexesFor(), fetchSources: async () => sources, now: NOW });
  const packetRow = (await packetSheets.readValues("Incoming_Intel"))[1];
  const packet = JSON.parse(packetRow[INTEL_HEADERS.indexOf("p2_packet_json")]);
  const materialized = Object.fromEntries(INTEL_HEADERS.map((header) => [header, String(intake[header] ?? "")]));
  const preliminary = processRow({ row: intakeSnapshotRow(materialized), verificationSources: sources, indexes: indexesFor() });
  const handoff = handoffFor(materialized, preliminary);
  const liveSheets = memorySheets({
    Incoming_Intel: intelValues([{
      ...intake,
      status: "fact_checked",
      fact_check_handoff_json: JSON.stringify(handoff),
      p2_packet_json: JSON.stringify(packet),
      p2_content_hash: packetRow[INTEL_HEADERS.indexOf("p2_content_hash")],
      p2_row_sha256: packet.intake_snapshot_sha256,
      p2_event_key: packet.event_key,
    }]),
  });

  const before = await fs.readFile(path.join(dir, "content/overrides/project-fact-automated.json"), "utf8");
  const dry = await runFastCycle({
    root: dir,
    sheets: liveSheets,
    indexes: indexesFor(),
    fetchSources: async () => sources,
    applyFacts: dryRunFactApplier,
    now: NOW,
  });
  assert.equal(dry.factsChanged, false);
  assert.equal(dry.results[0].fact_commit_state, "PENDING_COMMIT");
  assert.equal(await fs.readFile(path.join(dir, "content/overrides/project-fact-automated.json"), "utf8"), before);
  const afterDryRow = (await liveSheets.readValues("Incoming_Intel"))[1];
  assert.match(afterDryRow[INTEL_HEADERS.indexOf("output_decision")], /FACT_STATE:PENDING_COMMIT/);

  const live = await runFastCycle({
    root: dir,
    sheets: liveSheets,
    indexes: indexesFor(),
    fetchSources: async () => sources,
    now: NOW,
  });
  assert.equal(live.factsChanged, true);
  const stored = JSON.parse(await fs.readFile(path.join(dir, "content/overrides/project-fact-automated.json"), "utf8"));
  assert.equal(stored.projects["alba-palm-beach"].status.value, "completed");
});

test("cycle: a pushed automated fact with a lost Sheet ack reconciles without reapplying", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-fact-reconcile-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const pending = factRow("reconcile-fact-1", {
    fact_check_handoff_json: "{\"already\":\"bound\"}",
    output_decision: "ARTICLE:HOLD|FACT:AUTO_APPLY|FACT_STATE:PENDING_COMMIT",
  });
  const hashes = intelRowHashes(pending);
  Object.assign(pending, { p2_content_hash: hashes.content_hash, p2_evidence_hash: hashes.evidence_hash });
  const indexes = indexesFor();
  indexes.reviewed_facts.projects["alba-palm-beach"].status = {
    value: "completed",
    source: "automated_intel",
    intelId: "reconcile-fact-1",
    policyVersion: FAST_MODE_POLICY_VERSION,
  };
  const sheets = memorySheets({ Incoming_Intel: intelValues([pending]) });
  let fetchCalls = 0;
  const cycle = await runFastCycle({
    root: dir,
    sheets,
    indexes,
    fetchSources: async () => { fetchCalls += 1; return [fetchedSource()]; },
    now: NOW,
  });
  assert.equal(fetchCalls, 0);
  assert.equal(cycle.results[0].stage, "fact_commit_reconciled");
  const storedRow = (await sheets.readValues("Incoming_Intel"))[1];
  assert.match(storedRow[INTEL_HEADERS.indexOf("output_decision")], /FACT_STATE:COMMITTED/);
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

test("story publisher enforces policy/writer/source boundaries and enriches approved images", async () => {
  const sourceUrl = "https://www.wpb.org/government/development-services";
  const valid = {
    story_id: "story-live-1",
    intel_ids: "wpb-intel-2026-09-13-120000-alba-update",
    event_key: "project|alba-palm-beach|construction|development-update|2026-09-13",
    project_ids: "alba-palm-beach",
    corridor_ids: "north-flagler",
    headline: "Alba reaches a construction milestone",
    deck: "The project moved forward.",
    summary: "The project moved forward.",
    policy_version: FAST_MODE_POLICY_VERSION,
    article_decision: "AUTO_PUBLISH",
    writer_name: "chatgpt-story-writer",
    writer_version: "story-writer-v1",
    sources_json: JSON.stringify([{ source_ref_id: "source-1", url: sourceUrl, name: "City of West Palm Beach", tier: 1 }]),
    verified_facts_json: JSON.stringify([{ claim_id: "claim-1", field: "headline", value: "Alba reaches a construction milestone", source_ref_ids: ["source-1"] }]),
    story_package_json: JSON.stringify({
      destination: "news",
      title: "Alba reaches a construction milestone",
      deck: "The project moved forward.",
      sections: [{ heading: "What changed", body: "A source-backed milestone was reported." }],
      sourceName: "City of West Palm Beach",
      sourceUrl,
      sourceLinks: [{ label: "City of West Palm Beach", url: sourceUrl, type: "government" }],
      relatedProjectIds: ["alba-palm-beach"],
      relatedCorridorIds: ["north-flagler"],
    }),
  };
  assert.equal(validatePublishableStory(valid).error, undefined);
  const outside = {
    ...valid,
    story_package_json: JSON.stringify({ ...JSON.parse(valid.story_package_json), sourceUrl: "https://example.com/not-bound" }),
  };
  assert.equal(validatePublishableStory(outside).disposition, "rewrite");
  const unbound = {
    ...valid,
    sources_json: JSON.stringify([{ source_ref_id: "source-other", url: sourceUrl, name: "City of West Palm Beach", tier: 1 }]),
  };
  assert.equal(validatePublishableStory(unbound).disposition, "hold");
  const synthetic = { ...valid, story_id: "story-synthetic-fixture" };
  assert.equal(validatePublishableStory(synthetic).disposition, "hold");

  const enriched = await enrichStoryWithApprovedImages({ root: process.cwd(), story: valid });
  assert.equal(enriched.error, undefined);
  const pkg = JSON.parse(enriched.story.story_package_json);
  assert.ok(pkg.heroImage.path.startsWith("/assets/"));
  assert.equal(pkg.bodyImages.length, 1);
  assert.notEqual(pkg.heroImage.path, pkg.bodyImages[0].path);
  const mapped = articleInputFromStory(enriched.story).input;
  assert.equal(mapped.sections[0].imageKey, pkg.bodyImages[0].key);

  const failed = await publishStory({
    root: process.cwd(),
    story: valid,
    run: async () => ({
      ok: false,
      code: 1,
      result: { ok: false, error: "Article publishing requires branch main; found detached HEAD.", reason: "wrong-branch" },
      stdoutTail: "Project-specific QA detail: news image mapping failed.",
    }),
  });
  assert.equal(failed.ok, false);
  assert.match(failed.error, /Article publishing requires branch main/);
  assert.match(failed.error, /Project-specific QA detail: news image mapping failed/);
  assert.equal(failed.publisherReason, "wrong-branch");
});

test("story publisher requires reputable evidence for the semantic occurrence rather than identity metadata", () => {
  const identityUrl = "https://www.wpb.org/government/development-services";
  const occurrenceUrl = "https://example.com/project-milestone";
  const story = {
    story_id: "story-semantic-core",
    intel_ids: "wpb-intel-2026-09-14-semantic-core",
    event_key: "project|alba-palm-beach|construction|development-update|2026-09-14",
    policy_version: FAST_MODE_POLICY_VERSION,
    article_decision: "AUTO_PUBLISH",
    writer_name: "chatgpt-story-writer",
    writer_version: "story-writer-v1",
    sources_json: JSON.stringify([
      { source_ref_id: "identity-source", url: identityUrl, tier: 1 },
      { source_ref_id: "occurrence-source", url: occurrenceUrl, tier: 3 },
    ]),
    verified_facts_json: JSON.stringify([
      { claim_id: "identity", field: "project_identity", value: "alba-palm-beach", source_ref_ids: ["identity-source"] },
      { claim_id: "occurrence", field: "material_updates", value: "The project reached a construction milestone.", source_ref_ids: ["occurrence-source"] },
    ]),
    story_package_json: JSON.stringify({
      title: "Alba reaches a construction milestone",
      deck: "The project moved forward.",
      sections: [{ heading: "What changed", body: "A source-backed milestone was reported." }],
      sourceUrl: occurrenceUrl,
      sourceLinks: [{ label: "Milestone source", url: occurrenceUrl }],
    }),
  };
  assert.equal(validatePublishableStory(story).disposition, "rewrite");
  assert.match(validatePublishableStory(story).error, /reputable source bound to a verified core-event claim/);
});

test("story publisher recovers a prior commit after a crash without publishing twice", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fast-existing-story-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, "research/news-review"), { recursive: true });
  await fs.writeFile(path.join(dir, "research/news-review/approved-development-news.json"), JSON.stringify([
    { id: "intel-story-existing-1", slug: "intel-existing-1", title: "Already committed" },
  ]));
  const sourceUrl = "https://www.wpb.org/government/development-services";
  const story = {
    story_id: "story-existing-1",
    intel_ids: "wpb-intel-2026-09-13-130000-existing",
    event_key: "project|alba-palm-beach|construction|development-update|2026-09-13",
    headline: "Already committed",
    deck: "Already committed deck",
    policy_version: FAST_MODE_POLICY_VERSION,
    article_decision: "AUTO_PUBLISH",
    writer_name: "chatgpt-story-writer",
    writer_version: "story-writer-v1",
    sources_json: JSON.stringify([{ source_ref_id: "source-1", url: sourceUrl, tier: 1 }]),
    verified_facts_json: JSON.stringify([{ claim_id: "claim-1", field: "headline", value: "Already committed", source_ref_ids: ["source-1"] }]),
    story_package_json: JSON.stringify({
      title: "Already committed",
      deck: "Already committed deck",
      slug: "intel-existing-1",
      sections: [{ heading: "What changed", body: "Already committed body" }],
      sourceUrl,
    }),
  };
  let calls = 0;
  const outcome = await publishStory({ root: dir, story, run: async () => { calls += 1; return { ok: true }; } });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.alreadyPublished, true);
  assert.equal(calls, 0);
});

test("sanitized Sheet summary reports counts without row contents", () => {
  const summary = summarizeSheetState({
    intelValues: intelValues([
      row("same", { status: "awaiting_fact_check", p2_packet_json: "{}" }),
      row("same", { status: "quarantined" }),
    ]),
    storyValues: [STORY_QUEUE_COLUMNS.slice(), storyRowToCells({ story_id: "s", status: STORY_STATUS.READY_FOR_WRITER })],
  });
  assert.equal(summary.awaiting_fact_check, 1);
  assert.equal(summary.packets_present, 1);
  assert.equal(summary.duplicate_id_groups, 1);
  assert.equal(summary.story_queue_rows, 1);
  assert.equal(JSON.stringify(summary).includes("same"), false);
});

test("sanitized cycle activity distinguishes new packets, accepted handoffs, and new stories", () => {
  const summary = summarizeCycleActivity({
    results: [
      { intel_id: "a", stage: "awaiting_fact_check", packet_emitted: true },
      { intel_id: "b", stage: "awaiting_fact_check" },
      { intel_id: "c", stage: "decided", review_retry: false },
      { intel_id: "d", stage: "decided", review_retry: true },
      { intel_id: "e", stage: "source_retry" },
      { intel_id: "f", stage: "quarantined", quarantine_reason: "duplicate_id" },
    ],
    storyActions: [
      { action: "queued_for_writer" },
      { action: "reused_active" },
    ],
  });
  assert.deepEqual(summary, {
    packets_emitted: 1,
    rows_transitioned_to_awaiting_fact_check: 1,
    valid_handoffs_accepted: 1,
    story_queue_items_created: 1,
    source_retries: 1,
    duplicate_groups_quarantined: 1,
  });
  assert.equal(JSON.stringify(summary).includes("intel_id"), false);
});

test("digest reports outcomes, not review queue", () => {
  const digest = buildFastDigest({
    results: [
      { intel_id: "a", article_decision: "AUTO_PUBLISH", fact_change_decision: "AUTO_APPLY", applied_facts: [{ field: "status" }] },
      { intel_id: "b", article_decision: "DUPLICATE", fact_change_decision: "NONE" },
      { intel_id: "c", stage: "awaiting_fact_check" },
    ],
    storyActions: [{ action: "queued_for_writer" }],
    publishActions: [{ ok: true, outcome: "published", published: true }, { ok: false, outcome: "retrying", error: "x" }],
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
