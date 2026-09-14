import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { FAST_MODE_POLICY_VERSION } from "../p2/fast-policy.mjs";

async function readInput(root, relativePath, { optional = false, json = false, shape } = {}) {
  let text;
  try { text = await fs.readFile(path.join(root, relativePath), "utf8"); }
  catch (error) {
    if (optional && error.code === "ENOENT") return { value: [], revision: { path: relativePath, present: false } };
    throw new Error(`ERR_REPOSITORY_INDEX: cannot read ${relativePath}`, { cause: error });
  }
  let value = text;
  if (json) {
    try { value = JSON.parse(text); }
    catch (error) { throw new Error(`ERR_REPOSITORY_INDEX: invalid JSON in ${relativePath}`, { cause: error }); }
  }
  if (shape && !shape(value)) throw new Error(`ERR_REPOSITORY_INDEX: invalid shape in ${relativePath}`);
  return { value, revision: { path: relativePath, present: true, sha256: crypto.createHash("sha256").update(text).digest("hex") } };
}

export async function buildRepositoryIndexes(root = process.cwd()) {
  const inputs = await Promise.all([
    readInput(root, "research/news-review/approved-development-news.json", { json: true, shape: Array.isArray }),
    readInput(root, "src/data/importedUpdates.json", { optional: true, json: true, shape: Array.isArray }),
    readInput(root, "content/overrides/project-fact-overrides.json", { json: true, shape: (v) => v && typeof v === "object" && !Array.isArray(v) && v.projects && typeof v.projects === "object" && !Array.isArray(v.projects) }),
    readInput(root, "content/overrides/project-fact-automated.json", { optional: true, json: true, shape: (v) => v && typeof v === "object" && !Array.isArray(v) && v.projects && typeof v.projects === "object" && !Array.isArray(v.projects) }),
    readInput(root, "src/data/approvedExternalNews.ts", { shape: (v) => v.trim().length > 0 }),
    readInput(root, ".runtime/intel/open-pr-index.json", { optional: true, json: true, shape: Array.isArray }),
    readInput(root, "research/source-material-review/wpb-projects-canonical-v3-planning-update.json", { optional: true, json: true, shape: (v) => v && Array.isArray(v.projects) }),
    readInput(root, "content/project-identity-decisions.json", { optional: true, json: true, shape: (v) => v && Array.isArray(v.projects) }),
  ]);
  const [approved, imported, manualFacts, automatedFacts, generatedNews, runtimeOpenPrIndex, canonical, decisions] = inputs.map((input) => input.value);
  if (automatedFacts?.policyVersion && automatedFacts.policyVersion !== FAST_MODE_POLICY_VERSION) {
    throw new Error("ERR_REPOSITORY_INDEX: automated fact policy version mismatch");
  }
  // Canonical fact view = automated Fast Mode entries underneath Brooke's
  // manual reviewed overrides (manual always wins per project+field). The
  // reviewed canonical snapshot supplies the baseline so safe proposals for
  // projects without an override can still prove their old value.
  const mergedProjects = canonicalFactBaseline(canonical, decisions);
  for (const [slug, fields] of Object.entries(automatedFacts?.projects || {})) {
    mergedProjects[slug] = { ...(mergedProjects[slug] || {}), ...(fields || {}) };
  }
  for (const [slug, fields] of Object.entries(manualFacts?.projects || {})) {
    mergedProjects[slug] = { ...(mergedProjects[slug] || {}), ...(fields || {}) };
  }
  const reviewedFacts = { ...(manualFacts || {}), projects: mergedProjects };
  const projectSources = canonicalProjectSources(canonical, decisions);
  const projectAliases = canonicalProjectAliases(decisions);
  const facts = JSON.stringify(reviewedFacts);
  const publicCorpus = [JSON.stringify(approved), JSON.stringify(imported), facts, generatedNews].join("\n");
  const events = [];
  for (const item of approved) {
    const title = String(item.title || item.headline || "").toLowerCase();
    const projects = item.relatedProjectIds || item.relatedProjectSlugs || [];
    const eventDate = String(item.eventDate || item.sourcePublishedDate || item.sourcePublishedAt || "").slice(0, 10);
    if (title.includes("south flagler") && /top|topping/.test(title)) events.push({ event_key: "project|south-flagler-house|construction|topping-out|2025-11", source: "approved-development-news", id: item.id });
    if (title.includes("464 fern") && /file|plan/.test(title)) events.push({ event_key: "project|464-fern-street|municipal|site-plan-filing|2026-08-20", source: "approved-development-news", id: item.id });
    if (projects.length === 1 && eventDate && item.category) events.push({ event_key: `project|${projects[0]}|${item.category}|development-update|${eventDate}`, source: "approved-development-news", id: item.id });
  }
  return { approved, imported, reviewed_facts: reviewedFacts, project_sources: projectSources, project_aliases: projectAliases, facts_text: facts, generated_news_text: generatedNews, public_corpus: publicCorpus, events, open_prs: runtimeOpenPrIndex, source_revisions: inputs.map((input) => input.revision) };
}

function canonicalProjectAliases(decisions) {
  const aliases = {};
  for (const decision of decisions?.projects || []) {
    if (!decision?.publicSlug || decision.publicationState === "retired_merged") continue;
    const identifiers = [
      decision.canonicalId,
      decision.publicSlug,
      decision.compareDatabaseId,
      decision.compareDatabaseSlug,
      ...(decision.sourceCatalogIds || []),
      ...(decision.aliases || []),
    ].map((value) => String(value || "").trim()).filter(Boolean);
    for (const identifier of new Set(identifiers)) {
      if (aliases[identifier] && aliases[identifier] !== decision.publicSlug) {
        throw new Error(`ERR_REPOSITORY_INDEX: conflicting project alias ${identifier}`);
      }
      aliases[identifier] = decision.publicSlug;
    }
  }
  return aliases;
}

function canonicalProjectSources(canonical, decisions) {
  const sources = {};
  const canonicalById = new Map((canonical?.projects || []).map((project) => [project.project_id, project]));
  for (const decision of decisions?.projects || []) {
    if (!decision?.publicSlug || decision.publicationState === "retired_merged") continue;
    const project = canonicalById.get(decision.canonicalId);
    const urls = Array.isArray(project?.source_urls) ? project.source_urls : [];
    const unique = [...new Set(urls.map((url) => String(url || "").trim()).filter(Boolean))];
    if (unique.length) sources[decision.publicSlug] = unique.map((url) => ({ url, source_name: `${decision.publicSlug} canonical source` }));
  }
  return sources;
}

function canonicalFactBaseline(canonical, decisions) {
  const projects = {};
  const canonicalById = new Map((canonical?.projects || []).map((project) => [project.project_id, project]));
  for (const decision of decisions?.projects || []) {
    if (!decision?.publicSlug || decision.publicationState === "retired_merged") continue;
    const source = canonicalById.get(decision.canonicalId) || {};
    const candidate = decision.candidateFacts || {};
    const values = {
      name: firstPresent(source.display_name, candidate.displayName),
      status: firstPresent(source.status_badge, candidate.status),
      deliveryTiming: firstPresent(source.delivery_display, candidate.delivery),
      residenceCount: firstPresent(source.public_residence_count, candidate.residences),
      priceDisplay: firstPresent(source.price_display, candidate.price),
      address: firstPresent(source.public_address, candidate.address),
    };
    const fields = {};
    for (const [field, value] of Object.entries(values)) {
      if (value !== undefined) fields[field] = { value, source: "canonical_model" };
    }
    if (Object.keys(fields).length) projects[decision.publicSlug] = fields;
  }
  return projects;
}

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
}
