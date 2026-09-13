import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseSheetCsv } from "../intel/sheet-adapter.mjs";
import { recordHashes, signDispatch } from "./dispatch.mjs";
import { POLICY_VERSION } from "./policy-engine.mjs";
import { createShadowProcessingOwner } from "./processing-owner.mjs";

const SECRET = "owner-test-secret";
const NOW_ISO = "2026-09-13T15:00:00.000Z";
const NOW = Date.parse(NOW_ISO);
const CSV = [
  "id,record_type,headline,project_name,source_url,source_published_date,event_date,related_project_ids,related_corridor_ids,requires_human_review,flags_json",
  "owner-row,event,Owner shadow test,Alba Palm Beach,https://www.wpb.org/source,2026-09-13,2026-09-13,alba-palm-beach,north-flagler,FALSE,{}",
].join("\n");

function envelope(overrides = {}) {
  const row = parseSheetCsv(CSV)[0];
  return {
    ...signDispatch({
      secret: SECRET,
      sheetId: "private-sheet",
      sheetName: "Incoming_Intel",
      records: [{ intel_id: row.id, record_position: 2, ...recordHashes(row) }],
      policyVersion: POLICY_VERSION,
      issuedAt: NOW_ISO,
      nonce: "owner-test-nonce",
    }),
    ...overrides,
  };
}

async function fixture(t, snapshotProvider = async () => CSV, overrides = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-shadow-owner-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return createShadowProcessingOwner({
    root,
    secret: SECRET,
    snapshotProvider,
    indexesProvider: async () => ({ events: [], public_corpus: "", reviewed_facts: { projects: {} }, source_revisions: [] }),
    now: () => NOW,
    ...overrides,
  });
}

test("processing owner returns durable ack only after a zero-side-effect shadow run", async (t) => {
  const owner = await fixture(t);
  const response = await owner.handle(envelope());
  assert.equal(response.status, 200);
  assert.equal(response.body.durable, true);
  assert.equal(response.body.production_side_effects, false);
  assert.equal(response.body.summary.processed, 1);
  assert.equal(response.body.summary.auto_article_candidates, 0);
  assert.equal(response.body.summary.auto_fact_candidates, 0);
  assert.match(response.body.digest_sha256, /^[a-f0-9]{64}$/);
  const retry = await owner.handle(envelope());
  assert.equal(retry.status, 200);
  assert.equal(retry.body.replayed, true);
  assert.equal(retry.body.summary.processed, 0);
});

test("processing owner rejects unauthenticated dispatch before private Sheet access", async (t) => {
  let snapshotReads = 0;
  const owner = await fixture(t, async () => { snapshotReads += 1; return CSV; });
  const response = await owner.handle({ ...envelope(), signature: "0".repeat(64) });
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "ERR_DISPATCH_SIGNATURE");
  assert.equal(snapshotReads, 0);
});

test("processing owner rejects stale dispatch before private Sheet access", async (t) => {
  let snapshotReads = 0;
  const owner = await fixture(t, async () => { snapshotReads += 1; return CSV; });
  const stale = (() => {
    const row = parseSheetCsv(CSV)[0];
    return signDispatch({
      secret: SECRET,
      sheetId: "private-sheet",
      sheetName: "Incoming_Intel",
      records: [{ intel_id: row.id, record_position: 2, ...recordHashes(row) }],
      policyVersion: POLICY_VERSION,
      issuedAt: "2026-09-13T14:00:00.000Z",
      nonce: "stale-owner-nonce",
    });
  })();
  const response = await owner.handle(stale);
  assert.equal(response.status, 400);
  assert.equal(response.body.code, "ERR_DISPATCH_STALE");
  assert.equal(snapshotReads, 0);
});

test("processing owner rejects a row that changed after scanner dispatch", async (t) => {
  const changed = CSV.replace("Owner shadow test", "Changed during processing");
  let reviewReads = 0;
  const owner = await fixture(t, async () => changed, {
    reviewInputsProvider: async () => { reviewReads += 1; return {}; },
  });
  const response = await owner.handle(envelope());
  assert.equal(response.status, 409);
  assert.equal(response.body.code, "ERR_SNAPSHOT_RECORD_MISMATCH");
  assert.equal(reviewReads, 0);
});
