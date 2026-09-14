import fs from "node:fs/promises";
import path from "node:path";
import { safeHttpUrl, stableJson } from "../intel/core.mjs";
import { FAST_AUTO_FACT_FIELDS, FAST_DYNAMIC_FACT_FIELDS, FAST_MODE_POLICY_VERSION } from "./fast-policy.mjs";

// Automated canonical fact layer. Fast Mode writes verified fact mutations
// here — a sibling of the Brooke-reviewed project-fact-overrides.json, never
// into it. Entries carry explicit provenance (intel id, evidence bundle,
// source URL, as-of date) so any automatic value can be traced and undone.
// Manual overrides always win over automated entries for the same field.
export const AUTOMATED_FACTS_PATH = "content/overrides/project-fact-automated.json";
export const AUTOMATED_FACT_SOURCE = "automated_intel";

function storedValue(value) {
  return typeof value === "string" ? value : stableJson(value);
}

function dateOnly(value) {
  const match = String(value || "").match(/^(20\d{2}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function isRealDateOnly(value) {
  const date = dateOnly(value);
  if (!date) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

const FORBIDDEN_OBJECT_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function validateMutation(mutation) {
  const project = String(mutation?.project_id || "");
  const field = String(mutation?.field || "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project) || FORBIDDEN_OBJECT_KEYS.has(project)) return "invalid_project_id";
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(field) || FORBIDDEN_OBJECT_KEYS.has(field)) return "invalid_field";
  if (![...FAST_AUTO_FACT_FIELDS, ...FAST_DYNAMIC_FACT_FIELDS].includes(field)) return "field_not_auto_allowlisted";
  if (mutation.apply !== true || mutation.policy_version !== FAST_MODE_POLICY_VERSION) return "invalid_policy_authority";
  if (!safeHttpUrl(mutation.source_url)) return "invalid_source_url";
  if (!/^[a-f0-9]{64}$/i.test(String(mutation.evidence_bundle_sha256 || ""))) return "invalid_evidence_binding";
  if (FAST_DYNAMIC_FACT_FIELDS.has(field) && !isRealDateOnly(mutation.as_of || mutation.effective_date)) return "invalid_dynamic_as_of";
  return "";
}

export function emptyAutomatedFacts(policyVersion) {
  return { version: 1, policyVersion, updatedAt: "", projects: {} };
}

export async function readAutomatedFacts(root, policyVersion) {
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(root, AUTOMATED_FACTS_PATH), "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)
      || !parsed.projects || typeof parsed.projects !== "object" || Array.isArray(parsed.projects)) {
      throw new Error("ERR_AUTOMATED_FACTS_SHAPE");
    }
    if (parsed.policyVersion !== policyVersion) throw new Error("ERR_AUTOMATED_FACTS_POLICY_VERSION");
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return emptyAutomatedFacts(policyVersion);
    throw error;
  }
}

export async function readManualFacts(root) {
  const parsed = JSON.parse(await fs.readFile(path.join(root, "content/overrides/project-fact-overrides.json"), "utf8"));
  return parsed?.projects && typeof parsed.projects === "object" ? parsed : { projects: {} };
}

export function automatedEntryForMutation({ mutation, intelId, now = new Date() }) {
  return {
    value: storedValue(mutation.value),
    source: AUTOMATED_FACT_SOURCE,
    asOf: mutation.as_of || mutation.effective_date || null,
    effectiveDate: mutation.effective_date || null,
    sourceUrl: mutation.source_url || null,
    sourceName: mutation.source_name || null,
    intelId,
    evidenceBundleSha256: mutation.evidence_bundle_sha256 || null,
    sources: Array.isArray(mutation.sources) ? mutation.sources.map((source) => ({ ...source })) : [],
    policyVersion: mutation.policy_version,
    appliedAt: now.toISOString(),
    appliedBy: "p2-fast-cycle",
    rollback: mutation.rollback || null,
  };
}

/**
 * Apply AUTO_APPLY mutations to the automated layer. Idempotent: an identical
 * value+evidence pair is a no-op; a field that already carries a manual_review
 * override is skipped so Brooke's reviewed value always wins.
 *
 * Returns { changed, applied[], skipped[] }.
 */
export function applyAutomatedFacts({ automated, manual, mutations, intelId, now = new Date() }) {
  const applied = [];
  const skipped = [];
  for (const mutation of mutations) {
    const project = mutation.project_id;
    const field = mutation.field;
    const invalid = validateMutation(mutation);
    if (invalid) {
      skipped.push({ project_id: project, field, reason: invalid });
      continue;
    }
    const manualEntry = manual?.projects?.[project]?.[field];
    if (manualEntry && Object.prototype.hasOwnProperty.call(manualEntry, "value") && String(manualEntry.value ?? "").trim()) {
      skipped.push({ project_id: project, field, reason: "manual_override_wins", manual_value: manualEntry.value });
      continue;
    }
    const entry = automatedEntryForMutation({ mutation, intelId, now });
    const existing = automated.projects?.[project]?.[field];
    if (existing && stableJson(existing.value) === stableJson(entry.value)
      && existing.evidenceBundleSha256 === entry.evidenceBundleSha256
      && dateOnly(existing.asOf) === dateOnly(entry.asOf)
      && existing.sourceUrl === entry.sourceUrl
      && existing.policyVersion === entry.policyVersion) {
      skipped.push({ project_id: project, field, reason: "already_applied" });
      continue;
    }
    const incomingAsOf = dateOnly(entry.asOf);
    const existingAsOf = dateOnly(existing?.asOf);
    if (existingAsOf && incomingAsOf && incomingAsOf < existingAsOf) {
      skipped.push({ project_id: project, field, reason: "stale_as_of", existing_as_of: existingAsOf, incoming_as_of: incomingAsOf });
      continue;
    }
    if (existing && existingAsOf && incomingAsOf === existingAsOf
      && stableJson(existing.value) !== stableJson(entry.value)) {
      skipped.push({ project_id: project, field, reason: "same_as_of_conflict", as_of: incomingAsOf });
      continue;
    }
    if (existing && mutation.previous_value !== undefined
      && stableJson(existing.value) !== stableJson(storedValue(mutation.previous_value))) {
      skipped.push({ project_id: project, field, reason: "previous_value_changed", existing_value: existing.value });
      continue;
    }
    automated.projects[project] = automated.projects[project] || {};
    automated.projects[project][field] = entry;
    applied.push({ project_id: project, field, value: entry.value, previous_value: mutation.previous_value ?? existing?.value ?? null });
  }
  if (applied.length) automated.updatedAt = now.toISOString();
  return { changed: applied.length > 0, applied, skipped, automated };
}

export async function writeAutomatedFacts(root, automated) {
  const file = path.join(root, AUTOMATED_FACTS_PATH);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(automated, null, 2)}\n`);
  await fs.rename(temp, file);
}
