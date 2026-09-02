import test from "node:test";
import assert from "node:assert/strict";
import {
  compareSnapshots,
  inspectSourceUrls,
  parseCsvSnapshot,
  validateSnapshot,
} from "./reconcile-proposed-building-master.mjs";

const headers = [
  "project_id",
  "display_name",
  "slug",
  "corridor",
  "human_review_required",
  "last_reviewed_at",
  "source_urls",
];

function csv(rows) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
}

test("validates a compatible reviewed candidate", () => {
  const current = parseCsvSnapshot(csv([{
    project_id: "existing-project",
    display_name: "Existing Project",
    slug: "existing-project",
    corridor: "downtown",
    human_review_required: "FALSE",
    last_reviewed_at: "2026-08-01",
    source_urls: "https://example.com/source",
  }]));
  const proposed = parseCsvSnapshot(csv([{
    project_id: "new-project",
    display_name: "New Project",
    slug: "new-project",
    corridor: "north-flagler",
    human_review_required: "TRUE",
    last_reviewed_at: "2026-09-01",
    source_urls: "https://example.com/source",
  }]));
  const validation = validateSnapshot(proposed, current.headers);
  assert.deepEqual(validation.errors, []);
  assert.equal(validation.schema.sameHeaderOrder, true);
});

test("blocks duplicate identities and invalid dates", () => {
  const snapshot = parseCsvSnapshot(csv([
    {
      project_id: "Bad ID",
      display_name: "Duplicate",
      slug: "bad-slug",
      human_review_required: "MAYBE",
      last_reviewed_at: "2026-02-31",
    },
    {
      project_id: "Bad ID",
      display_name: "Duplicate",
      slug: "bad-slug",
      human_review_required: "TRUE",
      last_reviewed_at: "2026-09-01",
    },
  ]));
  const validation = validateSnapshot(snapshot, headers);
  assert.ok(validation.errors.some((error) => error.includes("Duplicate project_id")));
  assert.ok(validation.errors.some((error) => error.includes("Duplicate slug")));
  assert.ok(validation.errors.some((error) => error.includes("not kebab-case")));
  assert.ok(validation.errors.some((error) => error.includes("valid YYYY-MM-DD")));
});

test("blocks duplicate CSV headers before import", () => {
  const snapshot = parseCsvSnapshot([
    "project_id,display_name,slug,slug,human_review_required,last_reviewed_at",
    "project-one,Project One,project-one,duplicate-slug,TRUE,2026-09-01",
  ].join("\n"));
  const validation = validateSnapshot(snapshot);
  assert.ok(validation.errors.some((error) => error.includes("Duplicate CSV headers: slug")));
});

test("reports malformed quote syntax without aborting the reconciliation", () => {
  const malformed = [
    headers.join(","),
    "project-one,Project One,project-one,downtown,TRUE,2026-09-01,Official \"site\" https://example.com/source",
  ].join("\n");
  const snapshot = parseCsvSnapshot(malformed);
  assert.equal(snapshot.records.length, 1);
  assert.ok(snapshot.parseErrors.some((error) => error.includes("malformed quote syntax")));
  const validation = validateSnapshot(snapshot, headers);
  assert.ok(validation.errors.some((error) => error.includes("malformed quote syntax")));
});

test("reports additions, removals, and changed cells without mutating snapshots", () => {
  const current = parseCsvSnapshot(csv([
    {
      project_id: "existing-project",
      display_name: "Existing Project",
      slug: "existing-project",
      corridor: "downtown",
      human_review_required: "FALSE",
      last_reviewed_at: "2026-08-01",
    },
    {
      project_id: "removed-project",
      display_name: "Removed Project",
      slug: "removed-project",
      corridor: "downtown",
      human_review_required: "FALSE",
      last_reviewed_at: "2026-08-01",
    },
  ]));
  const proposed = parseCsvSnapshot(csv([
    {
      project_id: "existing-project",
      display_name: "Existing Project",
      slug: "existing-project",
      corridor: "north-flagler",
      human_review_required: "TRUE",
      last_reviewed_at: "2026-09-01",
    },
    {
      project_id: "new-project",
      display_name: "New Project",
      slug: "new-project",
      corridor: "downtown",
      human_review_required: "TRUE",
      last_reviewed_at: "2026-09-01",
    },
  ]));
  const delta = compareSnapshots(current, proposed);
  assert.deepEqual(delta.additions.map((row) => row.project_id), ["new-project"]);
  assert.deepEqual(delta.removals.map((row) => row.project_id), ["removed-project"]);
  assert.equal(delta.changedRows.length, 1);
  assert.equal(delta.changedCellCount, 3);
});

test("flags prose mixed into source URL cells", () => {
  assert.deepEqual(inspectSourceUrls("https://example.com/a | https://example.com/b"), {
    urls: ["https://example.com/a", "https://example.com/b"],
    nonUrlText: "",
    hasMixedContent: false,
  });
  const mixed = inspectSourceUrls("Official website: https://example.com/a; verify brochure");
  assert.equal(mixed.hasMixedContent, true);
  assert.equal(mixed.nonUrlText, "Official website: verify brochure");
});
