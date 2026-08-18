import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  PublishSafetyError,
  acquireAttemptJournal,
  createPublishTransaction,
  runBoundedCommand,
  validateUniqueNewsCandidate,
} from "./article-publish-safety.mjs";

test("canonical URL collisions fail before article mutation", () => {
  assert.throws(() => validateUniqueNewsCandidate([
    { id: "existing", slug: "existing", canonicalUrl: "https://example.com/city-record" },
  ], {
    id: "candidate",
    slug: "candidate",
    canonicalUrl: "https://example.com/city-record",
  }), (error) => error instanceof PublishSafetyError && error.reason === "duplicate-canonical-url");
});

test("editing the matching article may retain its canonical URL", () => {
  assert.doesNotThrow(() => validateUniqueNewsCandidate([
    { id: "existing", slug: "existing", canonicalUrl: "https://example.com/city-record" },
  ], {
    id: "existing",
    slug: "existing",
    canonicalUrl: "https://example.com/city-record",
  }));
});

test("an automated run can consume only one publish attempt", async (t) => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-publish-attempt-"));
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));
  const first = await acquireAttemptJournal({
    workspace,
    automationId: "wpb-content-scout-safe-daily-publish",
    runKey: "2026-08-18",
    input: { title: "Candidate" },
  });
  await first.update("failed", { error: "QA failed" });

  await assert.rejects(() => acquireAttemptJournal({
    workspace,
    automationId: "wpb-content-scout-safe-daily-publish",
    runKey: "2026-08-18",
    input: { title: "Changed candidate" },
  }), (error) => error instanceof PublishSafetyError && error.reason === "attempt-already-used");
});

test("silent child commands are terminated at the idle deadline", async () => {
  const result = await runBoundedCommand(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    idleTimeoutMs: 100,
    absoluteTimeoutMs: 2_000,
    heartbeatMs: 0,
    killGraceMs: 50,
  });
  assert.equal(result.terminationReason, "idle-timeout");
  assert.notEqual(result.code, 0);
});

test("rollback restores tracked files and removes new allowlisted assets", async (t) => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-publish-rollback-"));
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));
  const run = (command, args) => runBoundedCommand(command, args, {
    cwd: workspace,
    idleTimeoutMs: 5_000,
    absoluteTimeoutMs: 10_000,
    heartbeatMs: 0,
  });

  await runChecked(run, "git", ["init", "-q"]);
  await runChecked(run, "git", ["config", "user.email", "publisher-test@example.com"]);
  await runChecked(run, "git", ["config", "user.name", "Publisher Test"]);
  await fs.writeFile(path.join(workspace, "tracked.txt"), "clean\n");
  await runChecked(run, "git", ["add", "tracked.txt"]);
  await runChecked(run, "git", ["commit", "-qm", "baseline"]);

  const transaction = createPublishTransaction({
    workspace,
    allowedOutputPaths: ["public/assets/editorial"],
    run,
  });
  await fs.writeFile(path.join(workspace, "tracked.txt"), "dirty\n");
  await fs.mkdir(path.join(workspace, "public/assets/editorial"), { recursive: true });
  await fs.writeFile(path.join(workspace, "public/assets/editorial/new-hero.jpg"), "image\n");
  await runChecked(run, "git", ["add", "-N", "public/assets/editorial/new-hero.jpg"]);

  const rollback = await transaction.rollback();
  assert.equal(rollback.rolledBack, true);
  assert.equal(await fs.readFile(path.join(workspace, "tracked.txt"), "utf8"), "clean\n");
  await assert.rejects(() => fs.stat(path.join(workspace, "public/assets/editorial/new-hero.jpg")), { code: "ENOENT" });
  const status = await runChecked(run, "git", ["status", "--porcelain=v1", "--untracked-files=all"]);
  assert.equal(status.stdout, "");
});

async function runChecked(run, command, args) {
  const result = await run(command, args);
  assert.equal(result.code, 0, `${command} ${args.join(" ")} failed: ${result.stderr}`);
  return result;
}
