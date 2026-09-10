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
    "content/overrides/project-fact-overrides.json": JSON.stringify({ version: 1, projects: { olara: { residences: 275 } } }),
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
  assert.deepEqual(before.reviewed_facts.projects.olara, { residences: 275 });
  assert.deepEqual(before, await buildRepositoryIndexes(root));
  assert.deepEqual(before.source_revisions.find((r) => r.path.endsWith("importedUpdates.json")), { path: "src/data/importedUpdates.json", present: false });
  await fs.writeFile(path.join(root, "content/overrides/project-fact-overrides.json"), JSON.stringify({ version: 1, projects: { olara: { residences: 276 } } }));
  const after = await buildRepositoryIndexes(root);
  assert.notDeepEqual(before.source_revisions, after.source_revisions);
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
