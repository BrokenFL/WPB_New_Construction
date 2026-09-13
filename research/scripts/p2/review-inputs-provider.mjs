import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { parseSheetCsv } from "../intel/sheet-adapter.mjs";
import { verifySourceHint } from "../intel/source-verifier.mjs";

const INTEL_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const MAX_HANDOFF_BYTES = 512 * 1024;
const MAX_SHEET_HANDOFF_BYTES = 48 * 1024;

async function readPrivateJson(file) {
  const handle = await fs.open(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.nlink !== 1 || stat.size > MAX_HANDOFF_BYTES) throw new Error("ERR_FACT_CHECK_INBOX_FILE");
    return JSON.parse(await handle.readFile("utf8"));
  } finally {
    await handle.close();
  }
}

function handoffUrls(handoff) {
  if (!Array.isArray(handoff?.claims)) return [];
  return [...new Set(handoff.claims.flatMap((claim) => Array.isArray(claim?.evidence) ? claim.evidence.map((item) => item?.source_url) : [])
    .filter((value) => typeof value === "string" && value))].sort();
}

function rowUrls(row = {}) {
  return [...new Set([
    row.lead_source_url || row.source_url,
    row.primary_source_url,
  ].filter((value) => typeof value === "string" && value))].sort();
}

async function fetchSources(urls, fetchSource) {
  const fetched = [];
  for (const url of urls) {
    try { fetched.push(await fetchSource({ url, accessed_at: new Date().toISOString() })); }
    catch { fetched.push({ url, retrieval_status: "unavailable", retrieval_attested: false, reachable: false, error: "ERR_SOURCE_FETCH" }); }
  }
  return fetched;
}

function emptyInputs() {
  return { factCheckHandoffs: {}, verificationSources: {}, storyWriterProviders: {}, factTestResults: {} };
}

// Operational v1 bridge for the existing private Sheet fact-check task. The
// verifier writes only structured JSON to `fact_check_handoff_json`; prose
// review fields remain untrusted and ignored. The scanner hashes this field,
// then the owner re-reads it from the bound private snapshot and independently
// fetches every row/handoff URL before the handoff adapter validates it.
export function createSheetFactCheckInputsProvider({ fetchSource = verifySourceHint } = {}) {
  if (typeof fetchSource !== "function") throw new Error("ERR_FACT_CHECK_SHEET_CONFIGURATION");
  return async function reviewInputsProvider({ snapshotCsv, intelIds = [] } = {}) {
    const output = emptyInputs();
    const rows = parseSheetCsv(snapshotCsv);
    const rowsById = new Map();
    for (const row of rows) {
      const matches = rowsById.get(row.id) || [];
      matches.push(row);
      rowsById.set(row.id, matches);
    }
    for (const intelId of intelIds) {
      if (!INTEL_ID.test(String(intelId))) continue;
      const matches = rowsById.get(intelId) || [];
      if (matches.length !== 1) {
        output.factCheckHandoffs[intelId] = { contract_version: "invalid-private-fact-check-handoff" };
        output.verificationSources[intelId] = [];
        continue;
      }
      const row = matches[0];
      const raw = String(row.fact_check_handoff_json || "").trim();
      let handoff = null;
      if (raw) {
        if (Buffer.byteLength(raw) > MAX_SHEET_HANDOFF_BYTES) {
          handoff = { contract_version: "invalid-private-fact-check-handoff" };
        } else {
          try { handoff = JSON.parse(raw); }
          catch { handoff = { contract_version: "invalid-private-fact-check-handoff" }; }
        }
        output.factCheckHandoffs[intelId] = handoff;
      }
      const urls = [...new Set([...rowUrls(row), ...handoffUrls(handoff)])].sort();
      output.verificationSources[intelId] = await fetchSources(urls, fetchSource);
    }
    return output;
  };
}

// The inbox contains verifier output only. Source bytes are fetched again by
// the processing owner; the verifier's hashes are compared with this separate
// retrieval before a handoff can become trusted evidence.
export function createPrivateFactCheckInboxProvider({ root, fetchSource = verifySourceHint } = {}) {
  if (!root || !path.isAbsolute(String(root)) || typeof fetchSource !== "function") throw new Error("ERR_FACT_CHECK_INBOX_CONFIGURATION");
  const inbox = path.resolve(String(root));
  return async function reviewInputsProvider({ intelIds = [] } = {}) {
    const output = emptyInputs();
    for (const intelId of intelIds) {
      if (!INTEL_ID.test(String(intelId))) continue;
      const file = path.join(inbox, `${intelId}.json`);
      let handoff;
      try { handoff = await readPrivateJson(file); }
      catch (error) {
        if (error.code === "ENOENT") continue;
        // Preserve row-level isolation: malformed private verifier output is
        // passed as an invalid object so the runner holds this row while other
        // valid rows continue.
        output.factCheckHandoffs[intelId] = { contract_version: "invalid-private-fact-check-handoff" };
        output.verificationSources[intelId] = [];
        continue;
      }
      output.factCheckHandoffs[intelId] = handoff;
      output.verificationSources[intelId] = await fetchSources(handoffUrls(handoff), fetchSource);
    }
    return output;
  };
}
