import fs from "node:fs/promises";
import path from "node:path";
import { readSelectedRows } from "./sheet-adapter.mjs";
import { verifySourceHint, classifySource } from "./source-verifier.mjs";
import { processRow, stableJson, sha256 } from "./core.mjs";
import { buildRepositoryIndexes } from "./repo-index.mjs";

function parseArgs(argv) {
  const ids = [];
  let csvFile = null;
  let offline = false;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--row") ids.push(argv[++i]);
    else if (argv[i] === "--csv") csvFile = argv[++i];
    else if (argv[i] === "--offline") offline = true;
    else throw new Error(`ERR_UNKNOWN_ARGUMENT:${argv[i]}`);
  }
  if (!ids.length || ids.some((id) => !id)) throw new Error("ERR_NO_SELECTED_ROWS");
  return { ids, csvFile, offline };
}

async function verificationSourcesForRow(row, { offline }) {
  const hints = [];
  const push = (url, sourceName) => {
    if (!url || hints.some((h) => h.url === url)) return;
    hints.push({ url, source_name: sourceName || row.source_name || "", published_date: row.source_published_date || undefined });
  };
  push(row.lead_source_url || row.source_url, row.source_name);
  push(row.primary_source_url, row.source_name);
  const result = [];
  for (const hint of hints) {
    if (offline) {
      const classified = classifySource(hint.url, hint.source_name);
      if (classified.error) result.push({ ...classified, url: hint.url, source_name: hint.source_name, claims_supported: [] });
      else result.push({ ...classified, published_date: hint.published_date, accessed_at: "offline", claims_supported: [], reachable: null });
    } else {
      result.push(await verifySourceHint({ ...hint, claims_supported: [] }));
    }
  }
  return result.filter((source) => !source.error);
}

function humanReport(result) {
  const r = result.report;
  return [
    `# Intelligence Phase A validation — ${r.intel_id}`,
    "",
    `- Recommendation: **${r.recommendation}**`,
    `- Dedupe: **${r.dedupe_classification}**`,
    `- Supplied event key: \`${r.supplied_event_key || "(none)"}\``,
    `- Derived event key: \`${r.derived_event_key || "(none)"}\``,
    `- Row SHA-256: \`${r.row_sha256}\``,
    `- Claim ledger SHA-256: \`${r.claim_ledger_sha256}\``,
    `- Event identity SHA-256: \`${r.event_identity_sha256}\``,
    `- Candidate SHA-256: \`${r.candidate_sha256}\``,
    `- Mutations: **${r.mutation_count}**`,
    "",
    "## Warnings",
    ...(r.warnings.length ? r.warnings.map((w) => `- \`${w.code}\` — ${w.message}`) : ["- none"]),
    "",
    "## Errors",
    ...(r.errors.length ? r.errors.map((e) => `- \`${e.code}\` — ${e.message}`) : ["- none"]),
    "",
    "Phase A generated local candidate evidence only. It did not write to the Sheet, repository, GitHub, or production.",
    "",
  ].join("\n");
}

async function writeBundle(root, result) {
  const dir = path.join(root, ".runtime", "intel", result.report.intel_id);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "intake-snapshot.json"), `${stableJson(result.snapshot)}\n`);
  await fs.writeFile(path.join(dir, "claim-ledger.json"), `${stableJson(result.claims)}\n`);
  await fs.writeFile(path.join(dir, "candidate.json"), `${stableJson(result.candidate)}\n`);
  await fs.writeFile(path.join(dir, "validation-report.json"), `${stableJson(result.report)}\n`);
  await fs.writeFile(path.join(dir, "validation-report.md"), humanReport(result));
  const manifest = {
    processor_version: result.report.processor_version,
    intel_id: result.report.intel_id,
    artifact_hashes: {
      intake_snapshot: sha256(result.snapshot),
      claim_ledger: sha256(result.claims),
      candidate: sha256(result.candidate),
      validation_report: sha256(result.report),
    },
    mutation_count: 0,
    output_root: `.runtime/intel/${result.report.intel_id}/`,
  };
  await fs.writeFile(path.join(dir, "manifest.json"), `${stableJson(manifest)}\n`);
  return { dir, manifest };
}

export async function run(argv = process.argv.slice(2), deps = {}) {
  const { ids, csvFile, offline } = parseArgs(argv);
  const root = deps.root || process.cwd();
  const csvText = csvFile ? await fs.readFile(path.resolve(csvFile), "utf8") : deps.csvText;
  const rows = await readSelectedRows({ ids, csvText, fetchImpl: deps.fetchImpl || fetch });
  const indexes = deps.indexes || await buildRepositoryIndexes(root);
  const outputs = [];
  for (const row of rows) {
    const verificationSources = deps.verificationSources?.[row.id] || await verificationSourcesForRow(row, { offline });
    const result = processRow({ row, verificationSources, indexes });
    const written = await writeBundle(root, result);
    outputs.push({ result, ...written });
  }
  return outputs;
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  run().then((outputs) => {
    console.log(JSON.stringify(outputs.map(({ result, manifest }) => ({ intel_id: result.report.intel_id, recommendation: result.report.recommendation, dedupe: result.report.dedupe_classification, hashes: manifest.artifact_hashes, mutation_count: 0 })), null, 2));
    if (outputs.some(({ result }) => result.report.errors.length)) process.exitCode = 2;
  }).catch((error) => {
    console.error(String(error?.stack || error));
    process.exitCode = 2;
  });
}
