import assert from "node:assert/strict";
import test from "node:test";
import { processRow } from "./core.mjs";
import { verifySourceHint } from "./source-verifier.mjs";
import { sha256 } from "./normalizer.mjs";

const row = {
  id: "trusted-intel-001",
  status: "needs_review",
  headline: "Harbor House Reaches Roofline",
  project_name: "Harbor House",
  related_project_slug: "harbor-house",
  related_project_ids: "harbor-house",
  corridor: "downtown",
  related_corridor_ids: "downtown",
  record_type: "event",
  category: "development",
  summary: "Harbor House reached the roofline after its construction milestone.",
  material_updates: "Construction reached roofline.",
  buyer_angle: "",
  source_name: "Example source",
  source_url: "https://example.com/harbor-house",
  event_date: "2026-09-09",
  source_published_date: "2026-09-10",
  flags_json: "{}",
  requires_human_review: "FALSE",
  verification_status: "unverified",
  verification_summary: "",
};

const body = Buffer.from("Harbor House reaches roofline after a construction milestone.");
const sourceFetch = await verifySourceHint({
  url: row.source_url,
  fetchImpl: async (url) => ({
    status: 200,
    url,
    headers: new Headers({ "content-type": "text/html", "content-length": String(body.byteLength) }),
    arrayBuffer: async () => body,
  }),
});

const indexes = {
  events: [],
  reviewed_facts: {
    version: 1,
    projects: {
      "harbor-house": {
        status: { value: "under-construction", source: "manual_review", reviewedBy: "Brooke" },
      },
    },
  },
  source_revisions: [{ path: "content/overrides/project-fact-overrides.json", present: true, sha256: sha256("reviewed-facts") }],
};

function makeReviewEvidence(first, source = sourceFetch) {
  const sourceRefId = first.verificationSources.find((item) => item.url === source.url).source_ref_id;
  return {
    intake_snapshot_sha256: first.report.row_sha256,
    records: first.claims.map((claim) => ({
      review_id: `review-${claim.claim_id}`,
      claim_id: claim.claim_id,
      field: claim.field,
      claim_type: claim.claim_type,
      claim_value: claim.claim_value,
      decision: "supported",
      verification_source_ref_ids: [sourceRefId],
      content_hash: source.content_hash,
      source_revision: source.source_revision,
      reviewer: "reviewer@example.test",
      reviewed_at: "2026-09-10T12:00:00Z",
    })),
  };
}

test("ordinary rows remain held even when intake status and source fields claim verification", () => {
  const result = processRow({
    row: { ...row, verification_status: "verified", confidence_score: "100", source_tier: "1", claims_supported: "claim-forged" },
    indexes,
    verificationSources: [{ ...sourceFetch, claims_supported: ["claim-forged"], source_tier: 1 }],
  });
  assert.equal(result.candidate, null);
  assert.ok(result.claims.every((claim) => claim.support !== "supported"));
  assert.equal(result.report.review.accepted_records, 0);
});

test("only a separately bound local review record can produce a factual candidate", () => {
  const first = processRow({ row, indexes, verificationSources: [sourceFetch] });
  const reviewed = processRow({ row, indexes, verificationSources: [sourceFetch], trustedEvidence: makeReviewEvidence(first) });
  assert.ok(reviewed.candidate);
  assert.equal(reviewed.candidate.headline, row.headline);
  assert.equal(reviewed.candidate.event_date, row.event_date);
  assert.deepEqual(reviewed.candidate.related_project_ids, ["harbor-house"]);
  assert.ok(reviewed.candidate.claim_evidence.every((claim) => claim.support === "supported"));
  assert.equal(reviewed.report.review.rejected_records, 0);
});

test("an independently derived event identity conflict holds even fully reviewed claims", () => {
  const conflictingRow = { ...row, event_key: "project|harbor-house|development|wrong-action|2026-09-09" };
  const first = processRow({ row: conflictingRow, indexes, verificationSources: [sourceFetch] });
  const result = processRow({ row: conflictingRow, indexes, verificationSources: [sourceFetch], trustedEvidence: makeReviewEvidence(first) });
  assert.equal(result.report.recommendation, "human_review");
  assert.equal(result.candidate, null);
  assert.ok(result.report.warnings.some((warning) => warning.code === "ERR_EVENT_KEY_CONFLICT"));
});

test("delivery, incentive, fee, and ownership ambiguity remain review-required", () => {
  for (const phrase of ["delivery promised for 2027", "buyer incentive credit", "monthly fee assessment", "ownership title dispute"]) {
    const risky = { ...row, id: `risk-${phrase}`, summary: phrase };
    const result = processRow({ row: risky, indexes, verificationSources: [sourceFetch] });
    assert.equal(result.report.recommendation, "human_review", phrase);
    assert.equal(result.candidate, null, phrase);
  }
});

test("wrong snapshot, claim identity, content hash, or unfetched metadata cannot promote claims", () => {
  const first = processRow({ row, indexes, verificationSources: [sourceFetch] });
  const base = makeReviewEvidence(first);
  const cases = [
    { name: "wrong snapshot", edit: (review) => ({ ...review, intake_snapshot_sha256: "0".repeat(64) }) },
    { name: "wrong claim id", edit: (review) => ({ ...review, records: [{ ...review.records[0], claim_id: "claim-does-not-exist" }] }) },
    { name: "wrong value", edit: (review) => ({ ...review, records: [{ ...review.records[0], claim_value: "different value" }] }) },
    { name: "wrong content", edit: (review) => ({ ...review, records: [{ ...review.records[0], content_hash: "f".repeat(64) }] }) },
  ];
  for (const { name, edit } of cases) {
    const result = processRow({ row, indexes, verificationSources: [sourceFetch], trustedEvidence: edit(base) });
    assert.equal(result.candidate, null, name);
    assert.ok(result.report.review.rejected_records > 0, name);
  }
  const fakeSource = {
    url: row.source_url,
    source_tier: 1,
    source_type: "government",
    reachable: true,
    http_status: 200,
    body_bytes: body.byteLength,
    retrieval_status: "fetched",
    content_hash: "a".repeat(64),
    source_revision: "a".repeat(64),
  };
  const fakeFirst = processRow({ row, indexes, verificationSources: [fakeSource] });
  const fakeReview = makeReviewEvidence(fakeFirst, { ...fakeSource, source_ref_id: fakeFirst.verificationSources[0].source_ref_id });
  const fakeResult = processRow({ row, indexes, verificationSources: [fakeSource], trustedEvidence: fakeReview });
  assert.equal(fakeResult.candidate, null);
  assert.ok(fakeResult.report.review.rejected_records > 0);
});

test("explicit dissent keeps a claim conflicted instead of being lost", () => {
  const first = processRow({ row, indexes, verificationSources: [sourceFetch] });
  const evidence = makeReviewEvidence(first);
  evidence.records.push({ ...evidence.records[0], review_id: "review-dissent", decision: "unsupported" });
  const result = processRow({ row, indexes, verificationSources: [sourceFetch], trustedEvidence: evidence });
  assert.equal(result.candidate, null);
  assert.equal(result.claims.find((claim) => claim.claim_id === evidence.records[0].claim_id).support_status, "conflicted");
});

test("duplicate source URLs cannot be selected through an alternate reference", () => {
  const first = processRow({ row, indexes, verificationSources: [sourceFetch] });
  const evidence = makeReviewEvidence(first);
  const result = processRow({ row, indexes, verificationSources: [sourceFetch, sourceFetch], trustedEvidence: evidence });
  assert.equal(result.candidate, null);
  assert.ok(result.report.review.rejected_records > 0);
  assert.ok(result.verificationSources.every((source) => source.error === "ERR_AMBIGUOUS_SOURCE"));
});

test("supported fact proposals remain apply=false and carry canonical rollback binding", () => {
  const proposalRow = {
    ...row,
    fact_proposals_json: JSON.stringify([{
      project_id: "harbor-house",
      field: "status",
      old_value: "under-construction",
      new_value: "roofline-complete",
      effective_date: "2026-09-09",
      reason: "Field-level construction milestone review",
    }]),
  };
  const first = processRow({ row: proposalRow, indexes, verificationSources: [sourceFetch] });
  const result = processRow({ row: proposalRow, indexes, verificationSources: [sourceFetch], trustedEvidence: makeReviewEvidence(first) });
  assert.ok(result.projectFactProposals.length === 1);
  const proposal = result.projectFactProposals[0];
  assert.equal(proposal.apply, false);
  assert.equal(proposal.review_requirement, "human_review");
  assert.equal(proposal.old_value, "under-construction");
  assert.equal(proposal.new_value, "roofline-complete");
  assert.equal(proposal.rollback.previous_value, "under-construction");
  assert.equal(proposal.rollback.source_revision, result.report.canonical_index_revision);
  assert.ok(proposal.supporting_claim_ids.length === 1);
  assert.ok(result.candidate?.project_fact_proposals.every((item) => item.apply === false));
});

test("fact proposals with absent or impossible effective dates remain diagnostic holds", () => {
  for (const [label, fact] of [
    ["absent", { project_id: "harbor-house", field: "status", old_value: "under-construction", new_value: "roofline-complete" }],
    ["impossible", { project_id: "harbor-house", field: "status", old_value: "under-construction", new_value: "roofline-complete", effective_date: "2026-02-30" }],
  ]) {
    const proposalRow = { ...row, fact_proposals_json: JSON.stringify([fact]) };
    const first = processRow({ row: proposalRow, indexes, verificationSources: [sourceFetch] });
    const result = processRow({ row: proposalRow, indexes, verificationSources: [sourceFetch], trustedEvidence: makeReviewEvidence(first) });
    assert.equal(result.projectFactProposals.length, 0, label);
    assert.equal(result.heldProjectFactProposals.length, 1, label);
    assert.equal(result.heldProjectFactProposals[0].hold_reason, "Fact proposal requires a strict valid effective_date", label);
    assert.equal("new_value" in result.heldProjectFactProposals[0], false, label);
  }
});

test("a fact without a matching canonical old value stays a diagnostic hold", () => {
  const proposalRow = {
    ...row,
    fact_proposals_json: JSON.stringify([{
      project_id: "missing-project",
      field: "status",
      old_value: "invented-current-value",
      new_value: "roofline-complete",
      effective_date: "2026-09-09",
    }]),
  };
  const first = processRow({ row: proposalRow, indexes, verificationSources: [sourceFetch] });
  const result = processRow({ row: proposalRow, indexes, verificationSources: [sourceFetch], trustedEvidence: makeReviewEvidence(first) });
  assert.equal(result.projectFactProposals.length, 0);
  assert.equal(result.heldProjectFactProposals.length, 1);
  assert.equal(result.heldProjectFactProposals[0].hold_reason, "Canonical fact revision or evidence is conflicting");
  assert.equal("new_value" in result.heldProjectFactProposals[0], false);
});
