import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseSheetCsv } from "./sheet-adapter.mjs";
import { run } from "./process-intel.mjs";
import { ARTIFACT_FILENAMES, prepareArtifactDirectory, validateIntelId, writeArtifactBundle } from "./artifact-containment.mjs";

const repositoryRoot = process.cwd();
const fixtureCsv = await fs.readFile(path.join(repositoryRoot, "research/intel-fixtures/current-intel.csv"), "utf8");
const fixtureRow = parseSheetCsv(fixtureCsv)[0];
const emptyIndexes = { events: [], public_corpus: "" };

async function makeWorkspace() {
  return fs.mkdtemp(path.join(os.tmpdir(), "wpb-intel-containment-"));
}

async function removeWorkspace(workspace) {
  await fs.rm(workspace, { recursive: true, force: true });
}

function runFixture(workspace) {
  return run(["--row", fixtureRow.id], {
    root: workspace,
    csvText: fixtureCsv,
    indexes: emptyIndexes,
    verificationSources: { [fixtureRow.id]: [] },
  });
}

function isCode(code) {
  return (error) => error?.code === code;
}

test("strict ID validation rejects path syntax before CSV or network reads", async () => {
  const workspace = await makeWorkspace();
  try {
    const invalidIds = [
      "../",
      "../../",
      "../escape",
      "../../outside",
      "/tmp/wpb",
      path.resolve(workspace),
      path.join(workspace, ".runtime", "intel"),
      "C:\\tmp\\wpb",
      "%2e%2e%2fescape",
      "%252e%252e%252fescape",
      "",
      ".",
      "..",
      "/",
      ".runtime",
      "safe/child",
      "\0",
      "a".repeat(129),
      null,
      123,
    ];
    let fetchCalled = false;
    for (const id of invalidIds) {
      await assert.rejects(
        () => run(["--row", id], { root: workspace, fetchImpl: async () => { fetchCalled = true; throw new Error("network should not be reached"); } }),
        isCode("ERR_UNSAFE_INTEL_ID"),
      );
    }
    assert.equal(fetchCalled, false);
    assert.deepEqual(await fs.readdir(workspace), []);
  } finally {
    await removeWorkspace(workspace);
  }
});

test("normal reruns atomically replace only the six deterministic bundle files", async () => {
  const workspace = await makeWorkspace();
  try {
    const first = await runFixture(workspace);
    const location = await prepareArtifactDirectory(workspace, fixtureRow.id);
    assert.equal(first[0].dir, location.artifactDir);
    const firstFiles = Object.fromEntries(await Promise.all(ARTIFACT_FILENAMES.map(async (name) => [name, await fs.readFile(path.join(location.artifactDir, name), "utf8")] )));
    await fs.writeFile(path.join(location.runtimeRoot, "sentinel.txt"), "preserve runtime root\n");
    const second = await runFixture(workspace);
    const secondFiles = Object.fromEntries(await Promise.all(ARTIFACT_FILENAMES.map(async (name) => [name, await fs.readFile(path.join(location.artifactDir, name), "utf8")] )));
    assert.deepEqual(secondFiles, firstFiles);
    assert.deepEqual(second[0].manifest, first[0].manifest);
    assert.equal(await fs.readFile(path.join(location.runtimeRoot, "sentinel.txt"), "utf8"), "preserve runtime root\n");
    assert.deepEqual((await fs.readdir(location.artifactDir)).sort(), [...ARTIFACT_FILENAMES].sort());
    assert.equal(await fs.realpath(location.artifactDir), path.join(await fs.realpath(workspace), ".runtime", "intel", fixtureRow.id));
  } finally {
    await removeWorkspace(workspace);
  }
});

test("symlinked runtime roots, intel roots, targets, and target files are rejected", async () => {
  const setups = [
    {
      name: ".runtime symlink",
      prepare: async (workspace, outside) => fs.symlink(outside, path.join(workspace, ".runtime"), "dir"),
    },
    {
      name: "intel root symlink",
      prepare: async (workspace, outside) => {
        await fs.mkdir(path.join(workspace, ".runtime"), { recursive: true });
        await fs.symlink(outside, path.join(workspace, ".runtime", "intel"), "dir");
      },
    },
    {
      name: "target directory symlink",
      prepare: async (workspace, outside) => {
        await fs.mkdir(path.join(workspace, ".runtime", "intel"), { recursive: true });
        await fs.symlink(outside, path.join(workspace, ".runtime", "intel", fixtureRow.id), "dir");
      },
    },
    {
      name: "target path is a regular file",
      prepare: async (workspace) => {
        await fs.mkdir(path.join(workspace, ".runtime", "intel"), { recursive: true });
        await fs.writeFile(path.join(workspace, ".runtime", "intel", fixtureRow.id), "not a directory\n");
      },
    },
  ];
  for (const setup of setups) {
    const workspace = await makeWorkspace();
    const outside = await makeWorkspace();
    try {
      const marker = path.join(outside, "marker.txt");
      await fs.writeFile(marker, "outside remains unchanged\n");
      await setup.prepare(workspace, outside);
      await assert.rejects(() => runFixture(workspace), isCode("ERR_UNSAFE_INTEL_ARTIFACT"), setup.name);
      assert.equal(await fs.readFile(marker, "utf8"), "outside remains unchanged\n");
    } finally {
      await removeWorkspace(workspace);
      await removeWorkspace(outside);
    }
  }
});

test("symlinked and hard-linked artifact files are rejected before partial writes", async () => {
  for (const kind of ["symlink", "hardlink"]) {
    const workspace = await makeWorkspace();
    const outside = await makeWorkspace();
    try {
      const location = await prepareArtifactDirectory(workspace, fixtureRow.id);
      const marker = path.join(outside, `${kind}-marker.txt`);
      const destination = path.join(location.artifactDir, "intake-snapshot.json");
      await fs.writeFile(marker, `${kind} target remains unchanged\n`);
      if (kind === "symlink") await fs.symlink(marker, destination);
      else await fs.link(marker, destination);
      await assert.rejects(() => runFixture(workspace), isCode("ERR_UNSAFE_INTEL_ARTIFACT"), kind);
      assert.equal(await fs.readFile(marker, "utf8"), `${kind} target remains unchanged\n`);
      assert.deepEqual(await fs.readdir(location.artifactDir), ["intake-snapshot.json"]);
    } finally {
      await removeWorkspace(workspace);
      await removeWorkspace(outside);
    }
  }
});

test("bundle writer accepts only the fixed artifact names", async () => {
  const workspace = await makeWorkspace();
  try {
    const files = Object.fromEntries(ARTIFACT_FILENAMES.map((name) => [name, `${name}\n`]));
    await assert.rejects(
      () => writeArtifactBundle(workspace, fixtureRow.id, { ...files, "../escape": "must not be written" }),
      isCode("ERR_UNSAFE_INTEL_ARTIFACT"),
    );
    assert.deepEqual(await fs.readdir(workspace), []);
    assert.equal(validateIntelId(fixtureRow.id), fixtureRow.id);
  } finally {
    await removeWorkspace(workspace);
  }
});

test("direct writer traversal cannot remove or replace disposable repository sentinels", async () => {
  const workspace = await makeWorkspace();
  try {
    const gitHead = path.join(workspace, ".git", "HEAD");
    const canonicalSentinel = path.join(workspace, "canonical-sentinel.txt");
    await fs.mkdir(path.dirname(gitHead), { recursive: true });
    await fs.writeFile(gitHead, "ref: refs/heads/disposable\n");
    await fs.writeFile(canonicalSentinel, "canonical data remains unchanged\n");
    const files = Object.fromEntries(ARTIFACT_FILENAMES.map((name) => [name, `${name}\n`]));
    await assert.rejects(() => writeArtifactBundle(workspace, "../../.git", files), isCode("ERR_UNSAFE_INTEL_ID"));
    assert.equal(await fs.readFile(gitHead, "utf8"), "ref: refs/heads/disposable\n");
    assert.equal(await fs.readFile(canonicalSentinel, "utf8"), "canonical data remains unchanged\n");
    assert.deepEqual((await fs.readdir(workspace)).sort(), [".git", "canonical-sentinel.txt"]);
  } finally {
    await removeWorkspace(workspace);
  }
});
