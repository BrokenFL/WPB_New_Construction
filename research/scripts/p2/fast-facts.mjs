import fs from "node:fs/promises";
import path from "node:path";
import { stableJson } from "../intel/core.mjs";

// Automated canonical fact layer. Fast Mode writes verified fact mutations
// here — a sibling of the Brooke-reviewed project-fact-overrides.json, never
// into it. Entries carry explicit provenance (intel id, evidence bundle,
// source URL, as-of date) so any automatic value can be traced and undone.
// Manual overrides always win over automated entries for the same field.
export const AUTOMATED_FACTS_PATH = "content/overrides/project-fact-automated.json";
export const AUTOMATED_FACT_SOURCE = "automated_intel";

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
    value: typeof mutation.value === "string" ? mutation.value : stableJson(mutation.value),
    source: AUTOMATED_FACT_SOURCE,
    asOf: mutation.as_of || mutation.effective_date || null,
    effectiveDate: mutation.effective_date || null,
    sourceUrl: mutation.source_url || null,
    sourceName: mutation.source_name || null,
    intelId,
    evidenceBundleSha256: mutation.evidence_bundle_sha256 || null,
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
    const manualEntry = manual?.projects?.[project]?.[field];
    if (manualEntry?.source === "manual_review" && String(manualEntry.value || "").trim()) {
      skipped.push({ project_id: project, field, reason: "manual_override_wins", manual_value: manualEntry.value });
      continue;
    }
    const entry = automatedEntryForMutation({ mutation, intelId, now });
    const existing = automated.projects?.[project]?.[field];
    if (existing && stableJson(existing.value) === stableJson(entry.value)
      && existing.evidenceBundleSha256 === entry.evidenceBundleSha256) {
      skipped.push({ project_id: project, field, reason: "already_applied" });
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
