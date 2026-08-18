import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export class PublishSafetyError extends Error {
  constructor(message, { code = 1, reason = "publish-safety" } = {}) {
    super(message);
    this.name = "PublishSafetyError";
    this.exitCode = code;
    this.reason = reason;
  }
}

export function runBoundedCommand(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    signal,
    idleTimeoutMs = 180_000,
    absoluteTimeoutMs = 1_200_000,
    heartbeatMs = 30_000,
    killGraceMs = 5_000,
    onStdout = () => {},
    onStderr = () => {},
    onHeartbeat = () => {},
  } = options;

  return new Promise((resolve) => {
    const startedAt = Date.now();
    let lastOutputAt = startedAt;
    let stdout = "";
    let stderr = "";
    let terminationReason = "";
    let settled = false;
    let killTimer;

    const child = spawn(command, args, {
      cwd,
      env,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });

    const killTree = (killSignal) => {
      if (!child.pid) return;
      try {
        if (process.platform !== "win32") process.kill(-child.pid, killSignal);
        else child.kill(killSignal);
      } catch {
        try {
          child.kill(killSignal);
        } catch {
          // The process may have exited between the timer and the kill attempt.
        }
      }
    };

    const terminate = (reason) => {
      if (terminationReason || settled) return;
      terminationReason = reason;
      killTree("SIGTERM");
      killTimer = setTimeout(() => killTree("SIGKILL"), killGraceMs);
      killTimer.unref?.();
    };

    const idleTimer = idleTimeoutMs > 0
      ? setInterval(() => {
        if (Date.now() - lastOutputAt >= idleTimeoutMs) terminate("idle-timeout");
      }, Math.min(1_000, Math.max(25, Math.floor(idleTimeoutMs / 4))))
      : null;
    idleTimer?.unref?.();

    const absoluteTimer = absoluteTimeoutMs > 0
      ? setTimeout(() => terminate("absolute-timeout"), absoluteTimeoutMs)
      : null;
    absoluteTimer?.unref?.();

    const heartbeatTimer = heartbeatMs > 0
      ? setInterval(() => {
        onHeartbeat({
          command,
          args,
          elapsedMs: Date.now() - startedAt,
          silentMs: Date.now() - lastOutputAt,
        });
      }, heartbeatMs)
      : null;
    heartbeatTimer?.unref?.();

    const onAbort = () => terminate("aborted");
    if (signal?.aborted) onAbort();
    else signal?.addEventListener("abort", onAbort, { once: true });

    const cleanup = () => {
      if (idleTimer) clearInterval(idleTimer);
      if (absoluteTimer) clearTimeout(absoluteTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (killTimer) clearTimeout(killTimer);
      signal?.removeEventListener("abort", onAbort);
    };

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      lastOutputAt = Date.now();
      onStdout(text);
    });
    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      lastOutputAt = Date.now();
      onStderr(text);
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ code: 1, stdout, stderr: `${stderr}${error.message}`, terminationReason: terminationReason || "spawn-error" });
    });
    child.on("close", (code, childSignal) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        code: code ?? (terminationReason ? 1 : 1),
        stdout,
        stderr,
        signal: childSignal || "",
        terminationReason,
      });
    });
  });
}

export async function requireCleanWorktree({
  workspace,
  run,
  expectedBranch = "",
  expectedRemoteFragment = "",
  requireUpstreamSync = false,
}) {
  const result = await run("git", ["status", "--porcelain=v1", "--untracked-files=all"]);
  if (result.code !== 0) {
    throw new PublishSafetyError("Could not inspect the Git worktree before publishing.", { reason: "git-status" });
  }
  if (result.stdout.trim()) {
    throw new PublishSafetyError(`Article publishing requires a clean worktree. Existing changes:\n${result.stdout.trim()}`, { reason: "dirty-worktree" });
  }
  if (expectedBranch) {
    const branch = await run("git", ["branch", "--show-current"]);
    if (branch.code !== 0 || branch.stdout.trim() !== expectedBranch) {
      throw new PublishSafetyError(`Article publishing requires branch ${expectedBranch}; found ${branch.stdout.trim() || "detached HEAD"}.`, { reason: "wrong-branch" });
    }
  }
  if (expectedRemoteFragment) {
    const remote = await run("git", ["remote", "get-url", "origin"]);
    if (remote.code !== 0 || !remote.stdout.includes(expectedRemoteFragment)) {
      throw new PublishSafetyError(`Article publishing requires origin ${expectedRemoteFragment}; found ${remote.stdout.trim() || "no origin"}.`, { reason: "wrong-remote" });
    }
  }
  if (requireUpstreamSync) {
    const counts = await run("git", ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]);
    const [ahead, behind] = counts.stdout.trim().split(/\s+/).map(Number);
    if (counts.code !== 0 || ahead !== 0 || behind !== 0) {
      throw new PublishSafetyError(`Article publishing requires HEAD to match its upstream; ahead=${Number.isFinite(ahead) ? ahead : "unknown"}, behind=${Number.isFinite(behind) ? behind : "unknown"}.`, { reason: "upstream-mismatch" });
    }
  }
  return true;
}

export function createPublishTransaction({ workspace, allowedOutputPaths, run }) {
  let active = true;
  let commitReached = false;

  return {
    markCommitReached() {
      commitReached = true;
    },
    complete() {
      active = false;
    },
    async rollback() {
      if (!active || commitReached) return { rolledBack: false, reason: commitReached ? "commit-reached" : "inactive", remaining: "" };
      active = false;
      const statusResult = await run("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
      if (statusResult.code !== 0) {
        return { rolledBack: false, reason: "status-failed", remaining: statusResult.stderr || statusResult.stdout };
      }

      const entries = parsePorcelainZ(statusResult.stdout);
      const tracked = entries.filter((entry) => entry.status !== "??");
      for (const entry of tracked) {
        const inHead = await run("git", ["cat-file", "-e", `HEAD:${entry.path}`]);
        if (inHead.code === 0) {
          await run("git", ["restore", "--source=HEAD", "--staged", "--worktree", "--", entry.path]);
          continue;
        }
        await run("git", ["restore", "--staged", "--", entry.path]);
        if (isAllowedOutput(entry.path, allowedOutputPaths)) {
          await removeWorkspaceFile(workspace, entry.path);
        }
      }

      for (const entry of entries.filter((candidate) => candidate.status === "??")) {
        if (isAllowedOutput(entry.path, allowedOutputPaths)) {
          await removeWorkspaceFile(workspace, entry.path);
        }
      }

      const finalStatus = await run("git", ["status", "--porcelain=v1", "--untracked-files=all"]);
      return {
        rolledBack: finalStatus.code === 0 && !finalStatus.stdout.trim(),
        reason: finalStatus.code === 0 && !finalStatus.stdout.trim() ? "clean" : "changes-remain",
        remaining: finalStatus.stdout || finalStatus.stderr,
      };
    },
  };
}

export async function acquireAttemptJournal({ workspace, automationId, runKey, input }) {
  if (!automationId || !runKey) return null;
  const journalDir = path.join(workspace, ".runtime", "article-publish-attempts");
  await fs.mkdir(journalDir, { recursive: true });
  const digest = crypto.createHash("sha256").update(`${automationId}\n${runKey}`).digest("hex").slice(0, 20);
  const journalPath = path.join(journalDir, `${slugify(automationId)}-${digest}.json`);
  const record = {
    version: 1,
    automationId,
    runKey,
    inputHash: crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    status: "started",
    startedAt: new Date().toISOString(),
  };

  let handle;
  try {
    handle = await fs.open(journalPath, "wx");
    await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`);
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const previous = JSON.parse(await fs.readFile(journalPath, "utf8").catch(() => "{}"));
    throw new PublishSafetyError(
      `Automated publish attempt already recorded for ${automationId} run ${runKey} (${previous.status || "unknown"}). A failed automated publish is terminal for that run.`,
      { reason: "attempt-already-used" },
    );
  } finally {
    await handle?.close();
  }

  return {
    path: journalPath,
    async update(status, details = {}) {
      const next = {
        ...record,
        ...details,
        status,
        finishedAt: new Date().toISOString(),
      };
      await fs.writeFile(journalPath, `${JSON.stringify(next, null, 2)}\n`);
    },
  };
}

export function validateUniqueNewsCandidate(items, candidate) {
  const canonicalUrl = String(candidate.canonicalUrl || "").trim();
  if (!canonicalUrl) throw new PublishSafetyError("News publishing requires a canonicalUrl or sourceUrl before mutation.", { reason: "missing-canonical-url" });
  const conflict = items.find((item) =>
    item.canonicalUrl === canonicalUrl && item.id !== candidate.id && item.slug !== candidate.slug,
  );
  if (conflict) {
    throw new PublishSafetyError(
      `duplicate canonicalUrl ${canonicalUrl}; already used by ${conflict.id || conflict.slug || "another article"}.`,
      { reason: "duplicate-canonical-url" },
    );
  }
}

function parsePorcelainZ(stdout) {
  const tokens = String(stdout || "").split("\0").filter(Boolean);
  const entries = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const status = token.slice(0, 2);
    const filePath = token.slice(3);
    entries.push({ status, path: filePath });
    if (status.includes("R") || status.includes("C")) index += 1;
  }
  return entries;
}

function isAllowedOutput(filePath, allowedOutputPaths) {
  return allowedOutputPaths.some((allowedPath) => filePath === allowedPath || filePath.startsWith(`${allowedPath.replace(/\/$/, "")}/`));
}

async function removeWorkspaceFile(workspace, relativePath) {
  const absolute = path.resolve(workspace, relativePath);
  const workspaceRoot = `${path.resolve(workspace)}${path.sep}`;
  if (!absolute.startsWith(workspaceRoot)) {
    throw new PublishSafetyError(`Refusing to remove rollback path outside workspace: ${relativePath}`, { reason: "unsafe-rollback-path" });
  }
  await fs.rm(absolute, { force: true });
}

function slugify(value) {
  return String(value || "automation").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
