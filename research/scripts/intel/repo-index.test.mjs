import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildRepositoryIndexes } from "./repo-index.mjs";

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-intel-index-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const [file, text] of Object.entries({
    "research/news-review/approved-development-news.json": "[]",
    "content/overrides/project-fact-overrides.json": JSON.stringify({ version: 1, projects: { olara: { residenceCount: { value: 275, source: "manual_review" } } } }),
    "content/overrides/project-fact-automated.json": JSON.stringify({ version: 1, policyVersion: "p2-fast-policy-v1", projects: {} }),
    "research/source-material-review/wpb-projects-canonical-v3-planning-update.json": JSON.stringify({ projects: [{ project_id: "olara", display_name: "Olara", status_badge: "Under Construction", public_residence_count: 274, source_urls: ["https://www.olarawestpalmbeach.com/"] }] }),
    "content/project-identity-decisions.json": JSON.stringify({ projects: [{ canonicalId: "olara", publicSlug: "olara", publicationState: "published" }] }),
    "src/data/approvedExternalNews.ts": "export const approvedExternalNews = [];",
  })) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), text);
  }
  return root;
}

test("indexes read actual reviewed overrides and record deterministic source revisions", async (t) => {
  const root = await fixture(t);
  const before = await buildRepositoryIndexes(root);
  assert.equal(before.reviewed_facts.projects.olara.name.value, "Olara");
  assert.equal(before.reviewed_facts.projects.olara.status.value, "Under Construction");
  assert.equal(before.reviewed_facts.projects.olara.residenceCount.value, 275);
  assert.equal(before.reviewed_facts.projects.olara.residenceCount.source, "manual_review");
  assert.deepEqual(before.project_sources.olara, [{ url: "https://www.olarawestpalmbeach.com/", source_name: "olara canonical source" }]);
  assert.deepEqual(before, await buildRepositoryIndexes(root));
  assert.deepEqual(before.source_revisions.find((r) => r.path.endsWith("importedUpdates.json")), { path: "src/data/importedUpdates.json", present: false });
  await fs.writeFile(path.join(root, "content/overrides/project-fact-overrides.json"), JSON.stringify({ version: 1, projects: { olara: { residenceCount: { value: 276, source: "manual_review" } } } }));
  const after = await buildRepositoryIndexes(root);
  assert.notDeepEqual(before.source_revisions, after.source_revisions);
});

test("automated fact policy-version drift fails the repository index closed", async (t) => {
  const root = await fixture(t);
  await fs.writeFile(path.join(root, "content/overrides/project-fact-automated.json"), JSON.stringify({ version: 1, policyVersion: "old-policy", projects: {} }));
  await assert.rejects(buildRepositoryIndexes(root), /policy version mismatch/);
});

test("required missing or malformed repository inputs fail closed instead of becoming empty indexes", async (t) => {
  const root = await fixture(t);
  const file = path.join(root, "research/news-review/approved-development-news.json");
  for (const content of ["broken JSON", "{}", "null"]) {
    await fs.writeFile(file, content);
    await assert.rejects(buildRepositoryIndexes(root), /ERR_REPOSITORY_INDEX/);
  }
  await fs.unlink(file);
  await assert.rejects(buildRepositoryIndexes(root), /ERR_REPOSITORY_INDEX/);
});

test("optional indexes may be absent but present corrupt indexes cannot be ignored", async (t) => {
  const root = await fixture(t);
  await fs.mkdir(path.join(root, ".runtime/intel"), { recursive: true });
  await fs.writeFile(path.join(root, ".runtime/intel/open-pr-index.json"), "not-json");
  await assert.rejects(buildRepositoryIndexes(root), /ERR_REPOSITORY_INDEX/);
});
