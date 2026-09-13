import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildFactCheckPacket, writeFactCheckPacket } from "./fact-check-packet.mjs";

function preliminary() {
  return {
    report: { intel_id: "intel-1", row_sha256: "a".repeat(64), derived_event_key: "project|one|status|2026-09-13" },
    claims: [{ claim_id: "claim-1", claim_type: "project_fact", field: "status", claim_text_normalized: "Status changed", claim_value: "completed" }],
    verificationSources: [{ source_ref_id: "source-1", url: "https://www.wpb.org/source", content_hash: "b".repeat(64), source_revision: "b".repeat(64), retrieval_attested: true }],
  };
}

test("fact-check packet exposes exact bound inputs but grants no authority", () => {
  const packet = buildFactCheckPacket({ preliminary: preliminary(), policyVersion: "policy-v1", reviewerVersion: "reviewer-v1", createdAt: "2026-09-13T12:00:00.000Z" });
  assert.equal(packet.claims[0].claim_text, "Status changed");
  assert.equal(packet.sources[0].binding_eligible, true);
  assert.match(packet.sources[0].source_revision_sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(packet.authority, { publish: false, canonical_fact_write: false, approval: false });
  assert.match(packet.packet_sha256, /^[a-f0-9]{64}$/);
});

test("fact-check packet is written only to a private runtime artifact", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fact-check-packet-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const packet = buildFactCheckPacket({ preliminary: preliminary(), policyVersion: "policy-v1", reviewerVersion: "reviewer-v1" });
  const file = await writeFactCheckPacket(root, packet);
  const stat = await fs.stat(file);
  assert.equal(stat.mode & 0o777, 0o600);
  assert.match(file, /\.runtime\/p2\/fact-check-packets\//);
});
