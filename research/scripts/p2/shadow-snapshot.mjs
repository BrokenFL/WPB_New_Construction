import fs from "node:fs/promises";
import { sha256 } from "../intel/core.mjs";
import { parseSheetCsv } from "../intel/sheet-adapter.mjs";
import { signDispatch } from "./dispatch.mjs";
import { shadowRun } from "./shadow-run.mjs";

// Shadow-run the real private intake snapshot offline. Reports actual
// eligibility rates — no target percentage is assumed and rules are never
// lowered to make the demo publish.
//
// Usage:
//   node research/scripts/p2/shadow-snapshot.mjs --csv .runtime/inputs/incoming-intel.csv [--root <dir>]

const args = process.argv.slice(2);
const csvPath = args[args.indexOf("--csv") + 1];
const root = args.includes("--root") ? args[args.indexOf("--root") + 1] : process.cwd();
if (!csvPath) throw new Error("usage: --csv <snapshot.csv> [--root <dir>]");

const snapshotCsv = await fs.readFile(csvPath, "utf8");
const rows = parseSheetCsv(snapshotCsv);

// Mirror the Apps Script scanner contract: ambiguous IDs and non-event
// records are quarantined (reported, never dispatched); unrelated valid
// records remain eligible.
const positionsById = new Map();
rows.forEach((r, i) => {
  const list = positionsById.get(r.id) || [];
  list.push(i + 2);
  positionsById.set(r.id, list);
});
const quarantined = [];
const records = [];
for (const [id, positions] of positionsById) {
  const row = rows[positions[0] - 2];
  if (positions.length > 1) {
    quarantined.push({ intel_id: id, positions, reason: "ambiguous_id" });
    continue;
  }
  if (row.record_type !== "event") {
    quarantined.push({ intel_id: id, positions, reason: "record_type!=event" });
    continue;
  }
  records.push({ intel_id: id, record_position: positions[0], content_hash: "snapshot", evidence_hash: "snapshot" });
}

const secret = process.env.P2_DISPATCH_SECRET || "shadow-only-secret";
const envelope = signDispatch({
  secret,
  sheetId: "1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8",
  sheetName: "Incoming_Intel",
  snapshotSha256: sha256(snapshotCsv),
  records,
  policyVersion: "p2-policy-v1",
});

const out = await shadowRun({ root, envelope, secret, snapshotCsv });
if (!out.ok) {
  console.error(JSON.stringify(out, null, 2));
  process.exitCode = 2;
} else {
  const summary = out.results.map((r) => ({
    intel_id: r.intel_id,
    article: r.article_decision,
    fact_change: r.fact_change_decision,
    queue_state: r.queue_state,
  }));
  const tally = {};
  for (const r of out.results) tally[r.article_decision] = (tally[r.article_decision] || 0) + 1;
  console.log(JSON.stringify({ dispatch_id: out.dispatch_id, quarantined, decisions: summary, article_decision_tally: tally, queue_stats: out.queue_stats }, null, 2));
}
