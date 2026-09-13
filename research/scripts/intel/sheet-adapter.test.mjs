import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { readSelectedRows } from "./sheet-adapter.mjs";
import { run } from "./process-intel.mjs";

const HEADER = "id,status,headline,project_name,record_type,source_url,category,summary,notes";
const baseRow = (id, notes = "") => `${id},needs_review,Headline ${id},Project ${id},event,https://example.com/${id},development,Summary ${id},${notes}`;

const dupCsv = [
  HEADER,
  baseRow("wpb-intel-2026-09-10-001", "La Fontana tail"),
  baseRow("wpb-intel-2026-09-10-001", "Alba tail"),
  baseRow("wpb-intel-2026-09-10-002"),
  baseRow("wpb-intel-2026-09-10-003"),
].join("\n");

test("empty selection throws ERR_NO_SELECTED_ROWS", async () => {
  await assert.rejects(
    () => readSelectedRows({ ids: [], csvText: dupCsv }),
    /ERR_NO_SELECTED_ROWS/,
  );
});

test("unique selection returns the matching row unchanged", async () => {
  const [row] = await readSelectedRows({ ids: ["wpb-intel-2026-09-10-002"], csvText: dupCsv });
  assert.equal(row.id, "wpb-intel-2026-09-10-002");
  assert.equal(row.project_name, "Project wpb-intel-2026-09-10-002");
});

test("missing ID still throws ERR_ROW_NOT_FOUND", async () => {
  await assert.rejects(
    () => readSelectedRows({ ids: ["wpb-intel-2026-09-10-099"], csvText: dupCsv }),
    /ERR_ROW_NOT_FOUND:wpb-intel-2026-09-10-099/,
  );
});

test("duplicate ID rejects with ERR_AMBIGUOUS_INTEL_ID and record positions", async () => {
  await assert.rejects(
    () => readSelectedRows({ ids: ["wpb-intel-2026-09-10-001"], csvText: dupCsv }),
    /ERR_AMBIGUOUS_INTEL_ID:wpb-intel-2026-09-10-001 at records 2,3/,
  );
});

test("reversed duplicate order still rejects", async () => {
  const reversed = [HEADER, baseRow("wpb-intel-2026-09-10-002"), baseRow("wpb-intel-2026-09-10-001", "Alba tail"), baseRow("wpb-intel-2026-09-10-001", "La Fontana tail")].join("\n");
  await assert.rejects(
    () => readSelectedRows({ ids: ["wpb-intel-2026-09-10-001"], csvText: reversed }),
    /ERR_AMBIGUOUS_INTEL_ID:wpb-intel-2026-09-10-001 at records 3,4/,
  );
});

test("mixed valid and ambiguous selection rejects the whole batch", async () => {
  await assert.rejects(
    () => readSelectedRows({ ids: ["wpb-intel-2026-09-10-002", "wpb-intel-2026-09-10-001"], csvText: dupCsv }),
    /ERR_AMBIGUOUS_INTEL_ID/,
  );
});

test("multiple unique selections preserve order and dedupe repeated IDs", async () => {
  const rows = await readSelectedRows({ ids: ["wpb-intel-2026-09-10-002", "wpb-intel-2026-09-10-003", "wpb-intel-2026-09-10-002"], csvText: dupCsv });
  assert.deepEqual(rows.map((row) => row.id), ["wpb-intel-2026-09-10-002", "wpb-intel-2026-09-10-003"]);
});

test("quoted multiline fields do not shift record-position diagnostics", async () => {
  const multiline = [
    HEADER,
    `${baseRow("wpb-intel-2026-09-10-003").replace(/Summary [^,]+/, '"Summary line one\nline two\nline three"')}`,
    baseRow("wpb-intel-2026-09-10-001", "La Fontana tail"),
    baseRow("wpb-intel-2026-09-10-001", "Alba tail"),
  ].join("\n");
  await assert.rejects(
    () => readSelectedRows({ ids: ["wpb-intel-2026-09-10-001"], csvText: multiline }),
    /ERR_AMBIGUOUS_INTEL_ID:wpb-intel-2026-09-10-001 at records 3,4/,
  );
});

test("ambiguous selection produces no artifacts and no verification-source calls", async (t) => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-intel-ambiguous-"));
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));
  let verificationCalls = 0;
  const fetchImpl = async () => {
    verificationCalls += 1;
    throw new Error("fetch must not run after selection rejection");
  };
  await assert.rejects(
    () => run(["--row", "wpb-intel-2026-09-10-002", "--row", "wpb-intel-2026-09-10-001"], {
      root: workspace,
      csvText: dupCsv,
      indexes: { events: [], public_corpus: "" },
      fetchImpl,
    }),
    /ERR_AMBIGUOUS_INTEL_ID/,
  );
  assert.equal(verificationCalls, 0);
  const runtimeDir = path.join(workspace, ".runtime");
  await assert.rejects(() => fs.readdir(runtimeDir), /ENOENT/);
});

test("blank record_type still fails closed through the full run", async (t) => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-intel-blank-type-"));
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));
  const blankTypeCsv = [HEADER, "wpb-intel-2026-09-10-004,needs_review,Headline,Project,,https://example.com/x,development,Summary,"].join("\n");
  const [output] = await run(["--row", "wpb-intel-2026-09-10-004"], {
    root: workspace,
    csvText: blankTypeCsv,
    indexes: { events: [], public_corpus: "" },
    verificationSources: { "wpb-intel-2026-09-10-004": [] },
  });
  assert.ok(output.result.report.errors.some((e) => e.code === "ERR_INELIGIBLE_RECORD_TYPE"));
});
