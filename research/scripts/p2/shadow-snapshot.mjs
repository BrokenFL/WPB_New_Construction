import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildRepositoryIndexes } from "../intel/repo-index.mjs";
import { parseSheetCsv, SHEET_ID, SHEET_NAME } from "../intel/sheet-adapter.mjs";
import { createAckStore, recordHashes, signDispatch } from "./dispatch.mjs";
import { POLICY_VERSION } from "./policy-engine.mjs";
import { shadowRun } from "./shadow-run.mjs";

// Offline, zero-write evaluation of a private Incoming_Intel CSV snapshot.
// The snapshot stays outside git. With no separately supplied evidence bundles
// or story provider, this command intentionally reports conservative outcomes.
//
// Usage:
//   node research/scripts/p2/shadow-snapshot.mjs --csv /private/incoming-intel.csv [--repo-root <repo>]

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const csvPath = valueFor("--csv");
const repoRoot = path.resolve(valueFor("--repo-root") || process.cwd());
if (!csvPath) throw new Error("usage: --csv <snapshot.csv> [--repo-root <repo>]");

const snapshotCsv = await fs.readFile(path.resolve(csvPath), "utf8");
const rows = parseSheetCsv(snapshotCsv);
const positionsById = new Map();
rows.forEach((row, index) => {
  const id = String(row.id || "");
  const positions = positionsById.get(id) || [];
  positions.push(index + 2);
  positionsById.set(id, positions);
});

const quarantined = [];
const records = [];
for (const [intelId, positions] of positionsById) {
  const row = rows[positions[0] - 2];
  if (!intelId) {
    quarantined.push({ intel_id: null, positions, reason: "missing_id" });
    continue;
  }
  if (positions.length > 1) {
    quarantined.push({ intel_id: intelId, positions, reason: "ambiguous_id" });
    continue;
  }
  if (row.record_type !== "event") {
    quarantined.push({ intel_id: intelId, positions, reason: "invalid_record_type" });
    continue;
  }
  records.push({ intel_id: intelId, record_position: positions[0], ...recordHashes(row) });
}

const article = { AUTO_ELIGIBLE: 0, NEEDS_DECISION: 0, HOLD: 0, DUPLICATE: 0 };
const factChange = { AUTO_ELIGIBLE: 0, NEEDS_DECISION: 0, HOLD: 0, NONE: 0 };
let dispatchId = null;
let results = [];
let queueStats = { total: 0, article, fact_change: factChange };

if (records.length) {
  const runtimeRoot = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-p2-shadow-eval-"));
  const secret = process.env.P2_DISPATCH_SECRET || "offline-shadow-evaluation-only";
  const envelope = signDispatch({
    secret,
    sheetId: SHEET_ID,
    sheetName: SHEET_NAME,
    records,
    policyVersion: POLICY_VERSION,
  });
  const indexes = await buildRepositoryIndexes(repoRoot);
  const output = await shadowRun({
    root: runtimeRoot,
    envelope,
    secret,
    snapshotCsv,
    indexes,
    ackStore: createAckStore(),
  });
  if (!output.ok) {
    console.error(JSON.stringify({ ok: false, stage: output.stage, code: output.code }, null, 2));
    process.exitCode = 2;
  } else {
    dispatchId = output.dispatch_id;
    results = output.results.map((result) => ({
      intel_id: result.intel_id,
      article: result.article_decision,
      fact_change: result.fact_change_decision,
      reasons: result.reasons,
    }));
    queueStats = output.queue_stats;
    for (const result of output.results) {
      article[result.article_decision] += 1;
      factChange[result.fact_change_decision] += 1;
    }
  }
}

console.log(JSON.stringify({
  mode: "shadow",
  production_side_effects: false,
  source_path_disclosed: false,
  rows_discovered: rows.length,
  rows_dispatched: records.length,
  invalid_or_quarantined: quarantined.reduce((count, item) => count + item.positions.length, 0),
  quarantine_records: quarantined.length,
  duplicate_id_groups: quarantined.filter((item) => item.reason === "ambiguous_id").length,
  quarantined,
  dispatch_id: dispatchId,
  article,
  fact_change: factChange,
  queue_stats: queueStats,
  results,
}, null, 2));
