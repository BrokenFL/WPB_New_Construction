import assert from "node:assert/strict";
import test from "node:test";
import {
  STORY_CANDIDATE_CONTRACT_VERSION,
  STORY_WRITER_ERR,
  createEditorialBrief,
  createStaticStoryWriterProvider,
  runStoryWriter,
} from "./story-writer.mjs";

const evidenceBundle = {
  intel_id: "intel-1",
  event_key: "project|alba-palm-beach|construction|topping-out|2026-09-10",
  evidence_bundle_sha256: "a".repeat(64),
};
const claims = [
  { claim_id: "claim-summary", claim_type: "summary", field: "summary", claim_value: "Construction reached the reported milestone.", text: "Construction reached the reported milestone.", material: true, support: "supported" },
  { claim_id: "claim-headline", claim_type: "headline", field: "headline", claim_value: "Alba reaches a construction milestone", text: "Alba reaches a construction milestone", material: true, support: "supported" },
];
const sources = [{ url: "https://example.com/source-b" }, { url: "https://example.com/source-a" }];

function brief(overrides = {}) {
  return createEditorialBrief({ evidenceBundle, claims, sources, editorialConstraints: { maxWords: 180, ...overrides } });
}

test("brief hash is stable when supported claims and sources are reordered", () => {
  const a = brief();
  const b = createEditorialBrief({ evidenceBundle, claims: [...claims].reverse(), sources: [...sources].reverse(), editorialConstraints: { maxWords: 180 } });
  assert.equal(a.brief_sha256, b.brief_sha256);
  assert.deepEqual(a.claims.map((claim) => claim.claim_id), ["claim-headline", "claim-summary"]);
  assert.deepEqual(a.source_urls, ["https://example.com/source-a", "https://example.com/source-b"]);
});

test("static provider returns candidate bound to exact brief and evidence hashes", async () => {
  const result = await runStoryWriter({ provider: createStaticStoryWriterProvider(), brief: brief() });
  assert.equal(result.contract_version, STORY_CANDIDATE_CONTRACT_VERSION);
  assert.equal(result.brief_sha256, brief().brief_sha256);
  assert.equal(result.evidence_bundle_sha256, evidenceBundle.evidence_bundle_sha256);
  assert.match(result.article_candidate_sha256, /^[a-f0-9]{64}$/);
});

test("unknown claim references are rejected", async () => {
  const b = brief();
  await assert.rejects(
    () => runStoryWriter({
      brief: b,
      provider: { write: () => ({ contract_version: STORY_CANDIDATE_CONTRACT_VERSION, brief_sha256: b.brief_sha256, evidence_bundle_sha256: b.evidence_bundle_sha256, title: "T", deck: "D", sections: [{ heading: "H", body: "B", claim_ids: ["claim-missing"] }] }) },
    }),
    (error) => error.code === STORY_WRITER_ERR.UNKNOWN_CLAIM,
  );
});

test("altered brief or evidence hash is rejected", async () => {
  const b = brief();
  const altered = { ...b, event_key: "project|other|development|development-update|2026-09-10" };
  await assert.rejects(() => runStoryWriter({ provider: createStaticStoryWriterProvider(), brief: altered }), (error) => error.code === STORY_WRITER_ERR.BRIEF_HASH_MISMATCH);
  await assert.rejects(
    () => runStoryWriter({
      brief: b,
      provider: { write: () => ({ contract_version: STORY_CANDIDATE_CONTRACT_VERSION, brief_sha256: b.brief_sha256, evidence_bundle_sha256: "b".repeat(64), title: "T", deck: "D", sections: [{ heading: "H", body: "B", claim_ids: ["claim-headline"] }] }) },
    }),
    (error) => error.code === STORY_WRITER_ERR.CANDIDATE_BINDING,
  );
});

test("provider authority fields are rejected", async () => {
  const b = brief();
  await assert.rejects(
    () => runStoryWriter({
      brief: b,
      provider: { write: () => ({ contract_version: STORY_CANDIDATE_CONTRACT_VERSION, brief_sha256: b.brief_sha256, evidence_bundle_sha256: b.evidence_bundle_sha256, title: "T", deck: "D", decision: "AUTO_ELIGIBLE", sections: [{ heading: "H", body: "B", claim_ids: ["claim-headline"] }] }) },
    }),
    (error) => error.code === STORY_WRITER_ERR.FORBIDDEN_AUTHORITY_FIELD,
  );
});
