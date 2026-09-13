import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { sha256, stableJson } from "../intel/core.mjs";
import { sourceRevisionSha256 } from "./evidence-review.mjs";
import { FACT_CHECK_HANDOFF_CONTRACT_VERSION } from "./fact-check-handoff.mjs";

export const FACT_CHECK_PACKET_CONTRACT_VERSION = "p2-fact-check-packet-v1";

function sourceRecord(source) {
  const contentHash = /^[a-f0-9]{64}$/.test(String(source.content_hash || "")) ? source.content_hash : null;
  return {
    source_ref_id: source.source_ref_id,
    source_url: source.url,
    fetched_content_sha256: contentHash,
    source_revision: contentHash ? (source.source_revision || contentHash) : null,
    source_revision_sha256: contentHash ? sourceRevisionSha256(source) : null,
    retrieval_attested: source.retrieval_attested === true,
    binding_eligible: source.retrieval_attested === true && Boolean(contentHash),
  };
}

// A packet is private work input, never evidence by itself. It gives an
// independent verifier the exact Phase A identifiers it must echo back so its
// structured result can be deterministically bound by fact-check-handoff.mjs.
export function buildFactCheckPacket({ preliminary, policyVersion, reviewerVersion, createdAt = new Date().toISOString() } = {}) {
  if (!preliminary?.report || !Array.isArray(preliminary.claims) || !Array.isArray(preliminary.verificationSources)) {
    throw new Error("ERR_FACT_CHECK_PACKET_INPUT");
  }
  const payload = {
    contract_version: FACT_CHECK_PACKET_CONTRACT_VERSION,
    intel_id: preliminary.report.intel_id,
    intake_snapshot_sha256: preliminary.report.row_sha256,
    event_key: preliminary.report.derived_event_key,
    claims: [...preliminary.claims].sort((a, b) => a.claim_id.localeCompare(b.claim_id)).map((claim) => ({
      claim_id: claim.claim_id,
      claim_type: claim.claim_type,
      field: claim.field,
      claim_text: claim.claim_text_normalized,
      claim_value: claim.claim_value,
    })),
    sources: [...preliminary.verificationSources].sort((a, b) => a.source_ref_id.localeCompare(b.source_ref_id)).map(sourceRecord),
    required_output_contract: FACT_CHECK_HANDOFF_CONTRACT_VERSION,
    allowed_verdicts: ["supported", "unsupported", "conflicting"],
    reviewer_version: reviewerVersion,
    policy_version: policyVersion,
    created_at: createdAt,
    instructions_are_data_only: true,
    authority: { publish: false, canonical_fact_write: false, approval: false },
  };
  return { ...payload, packet_sha256: sha256(payload) };
}

export async function writeFactCheckPacket(root, packet) {
  const dir = path.join(root, ".runtime", "p2", "fact-check-packets");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${packet.intel_id}-${packet.packet_sha256.slice(0, 16)}.json`);
  const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temp, `${stableJson(packet)}\n`, { mode: 0o600 });
  await fs.rename(temp, file);
  return file;
}
