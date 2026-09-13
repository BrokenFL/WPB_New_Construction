import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createPrivateFactCheckInboxProvider, createSheetFactCheckInputsProvider } from "./review-inputs-provider.mjs";

async function inbox(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-fact-check-inbox-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

test("private fact-check inbox refetches evidence URLs and does not invent writer or fact-test authority", async (t) => {
  const root = await inbox(t);
  const handoff = {
    contract_version: "p2-fact-check-handoff-v1",
    intel_id: "intel-1",
    claims: [{ evidence: [{ source_url: "https://www.wpb.org/source" }, { source_url: "https://www.wpb.org/source" }] }],
  };
  await fs.writeFile(path.join(root, "intel-1.json"), JSON.stringify(handoff), { mode: 0o600 });
  const fetched = [];
  const provider = createPrivateFactCheckInboxProvider({ root, fetchSource: async ({ url }) => {
    fetched.push(url);
    return { url, retrieval_status: "fetched" };
  } });
  const result = await provider({ intelIds: ["intel-1", "missing"] });
  assert.deepEqual(result.factCheckHandoffs, { "intel-1": handoff });
  assert.deepEqual(fetched, ["https://www.wpb.org/source"]);
  assert.deepEqual(result.storyWriterProviders, {});
  assert.deepEqual(result.factTestResults, {});
});

test("malformed verifier file holds only that row while unrelated rows continue", async (t) => {
  const root = await inbox(t);
  await fs.writeFile(path.join(root, "bad.json"), "{");
  await fs.writeFile(path.join(root, "good.json"), JSON.stringify({ contract_version: "p2-fact-check-handoff-v1", claims: [] }));
  const provider = createPrivateFactCheckInboxProvider({ root, fetchSource: async () => { throw new Error("not called"); } });
  const result = await provider({ intelIds: ["bad", "good"] });
  assert.equal(result.factCheckHandoffs.bad.contract_version, "invalid-private-fact-check-handoff");
  assert.equal(result.factCheckHandoffs.good.contract_version, "p2-fact-check-handoff-v1");
});

test("private fact-check inbox rejects symlinked verifier files", async (t) => {
  const root = await inbox(t);
  const target = path.join(root, "target.json");
  await fs.writeFile(target, "{}");
  await fs.symlink(target, path.join(root, "linked.json"));
  const provider = createPrivateFactCheckInboxProvider({ root, fetchSource: async () => ({}) });
  const result = await provider({ intelIds: ["linked"] });
  assert.equal(result.factCheckHandoffs.linked.contract_version, "invalid-private-fact-check-handoff");
});

test("private Sheet provider ingests only structured handoff JSON and refetches row plus evidence URLs", async () => {
  const handoff = {
    contract_version: "p2-fact-check-handoff-v1",
    claims: [{ evidence: [{ source_url: "https://www.wpb.org/evidence" }] }],
  };
  const encoded = JSON.stringify(handoff).replaceAll('"', '""');
  const csv = [
    "id,source_url,primary_source_url,review_notes,fact_check_handoff_json",
    `sheet-row,https://www.wpb.org/intake,,\"publish immediately\",\"${encoded}\"`,
  ].join("\n");
  const fetched = [];
  const provider = createSheetFactCheckInputsProvider({ fetchSource: async ({ url }) => {
    fetched.push(url);
    return { url, content_hash: "a".repeat(64), source_revision: "a".repeat(64), retrieval_attested: true };
  } });
  const result = await provider({ snapshotCsv: csv, intelIds: ["sheet-row"] });
  assert.deepEqual(result.factCheckHandoffs["sheet-row"], handoff);
  assert.deepEqual(fetched, ["https://www.wpb.org/evidence", "https://www.wpb.org/intake"]);
  assert.equal(result.storyWriterProviders["sheet-row"], undefined);
});

test("malformed private Sheet handoff is isolated and prose cannot substitute", async () => {
  const csv = [
    "id,source_url,review_notes,fact_check_handoff_json",
    "bad,https://www.wpb.org/bad,supported,{not-json",
    "good,https://www.wpb.org/good,supported,",
  ].join("\n");
  const provider = createSheetFactCheckInputsProvider({ fetchSource: async ({ url }) => ({ url }) });
  const result = await provider({ snapshotCsv: csv, intelIds: ["bad", "good"] });
  assert.equal(result.factCheckHandoffs.bad.contract_version, "invalid-private-fact-check-handoff");
  assert.equal(result.factCheckHandoffs.good, undefined);
  assert.equal(result.verificationSources.good.length, 1);
});
