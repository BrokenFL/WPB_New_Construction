import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const ARTIFACT_FILENAMES = Object.freeze([
  "intake-snapshot.json",
  "claim-ledger.json",
  "candidate.json",
  "validation-report.json",
  "validation-report.md",
  "manifest.json",
]);

const ARTIFACT_FILENAME_SET = new Set(ARTIFACT_FILENAMES);
const INTEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

function containmentError(message) {
  const error = new Error(`ERR_UNSAFE_INTEL_ARTIFACT:${message}`);
  error.code = "ERR_UNSAFE_INTEL_ARTIFACT";
  return error;
}

function idError() {
  const error = new Error("ERR_UNSAFE_INTEL_ID");
  error.code = "ERR_UNSAFE_INTEL_ID";
  return error;
}

function isMissing(error) {
  return error?.code === "ENOENT";
}

function assertDirectoryStat(stat, label) {
  if (stat.isSymbolicLink()) throw containmentError(`${label} is a symlink`);
  if (!stat.isDirectory()) throw containmentError(`${label} is not a directory`);
}

function assertDirectChild(parent, child, expectedName, label) {
  if (path.relative(parent, child) !== expectedName) throw containmentError(`${label} escapes the canonical runtime root`);
}

async function canonicalExistingDirectory(directory, label) {
  let stat;
  try {
    stat = await fs.lstat(directory);
  } catch (error) {
    if (isMissing(error)) throw containmentError(`${label} does not exist`);
    throw error;
  }
  assertDirectoryStat(stat, label);
  const canonical = await fs.realpath(directory);
  const canonicalStat = await fs.lstat(canonical);
  assertDirectoryStat(canonicalStat, `${label} realpath`);
  return canonical;
}

async function ensureSafeChildDirectory(parent, name, label) {
  const lexical = path.join(parent, name);
  let stat;
  try {
    stat = await fs.lstat(lexical);
  } catch (error) {
    if (!isMissing(error)) throw error;
    try {
      await fs.mkdir(lexical);
    } catch (mkdirError) {
      if (mkdirError?.code !== "EEXIST") throw mkdirError;
    }
    stat = await fs.lstat(lexical);
  }
  assertDirectoryStat(stat, label);
  const canonical = await fs.realpath(lexical);
  assertDirectChild(parent, canonical, name, label);
  const canonicalStat = await fs.lstat(canonical);
  assertDirectoryStat(canonicalStat, `${label} realpath`);
  return canonical;
}

async function assertSafeArtifactLocation(location) {
  const workspaceRoot = await canonicalExistingDirectory(location.workspaceRoot, "workspace root");
  if (workspaceRoot !== location.workspaceRoot) throw containmentError("workspace root changed during artifact write");
  const runtimeRoot = await canonicalExistingDirectory(location.runtimeRoot, ".runtime root");
  assertDirectChild(workspaceRoot, runtimeRoot, ".runtime", ".runtime root");
  if (runtimeRoot !== location.runtimeRoot) throw containmentError(".runtime root changed during artifact write");
  const intelRoot = await canonicalExistingDirectory(location.intelRoot, "intel root");
  assertDirectChild(runtimeRoot, intelRoot, "intel", "intel root");
  if (intelRoot !== location.intelRoot) throw containmentError("intel root changed during artifact write");
  const artifactDir = await canonicalExistingDirectory(location.artifactDir, "artifact directory");
  assertDirectChild(intelRoot, artifactDir, location.intelId, "artifact directory");
  if (artifactDir !== location.artifactDir) throw containmentError("artifact directory changed during artifact write");
}

async function assertExistingArtifactFileSafe(filePath, name) {
  let stat;
  try {
    stat = await fs.lstat(filePath);
  } catch (error) {
    if (isMissing(error)) return;
    throw error;
  }
  if (stat.isSymbolicLink()) throw containmentError(`artifact file ${name} is a symlink`);
  if (!stat.isFile()) throw containmentError(`artifact file ${name} is not a regular file`);
  if (stat.nlink !== 1) throw containmentError(`artifact file ${name} is a hard link`);
}

export function validateIntelId(value) {
  if (typeof value !== "string" || !INTEL_ID_PATTERN.test(value)) throw idError();
  return value;
}

export async function prepareArtifactDirectory(root, intelId) {
  validateIntelId(intelId);
  const requestedRoot = path.resolve(root);
  const workspaceRoot = await canonicalExistingDirectory(requestedRoot, "workspace root");
  const runtimeRoot = await ensureSafeChildDirectory(workspaceRoot, ".runtime", ".runtime root");
  const intelRoot = await ensureSafeChildDirectory(runtimeRoot, "intel", "intel root");
  const artifactDir = await ensureSafeChildDirectory(intelRoot, intelId, "artifact directory");
  const location = { workspaceRoot, runtimeRoot, intelRoot, artifactDir, intelId };
  await assertSafeArtifactLocation(location);
  return Object.freeze(location);
}

export async function assertArtifactFilesSafe(location) {
  await assertSafeArtifactLocation(location);
  for (const name of ARTIFACT_FILENAMES) await assertExistingArtifactFileSafe(path.join(location.artifactDir, name), name);
}

async function writeArtifactFileAtomically(location, name, contents) {
  await assertSafeArtifactLocation(location);
  const destination = path.join(location.artifactDir, name);
  const temporary = path.join(location.artifactDir, `.${name}.${crypto.randomUUID()}.tmp`);
  let handle;
  try {
    handle = await fs.open(temporary, "wx", 0o600);
    await handle.writeFile(contents, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    const temporaryStat = await fs.lstat(temporary);
    if (temporaryStat.isSymbolicLink() || !temporaryStat.isFile() || temporaryStat.nlink !== 1) throw containmentError(`temporary artifact file ${name} is unsafe`);
    await fs.rename(temporary, destination);
  } finally {
    if (handle) await handle.close().catch(() => {});
    await fs.unlink(temporary).catch((error) => {
      if (!isMissing(error)) throw error;
    });
  }
}

export async function writeArtifactBundle(root, intelId, files) {
  validateIntelId(intelId);
  const entries = Object.entries(files || {});
  if (entries.length !== ARTIFACT_FILENAMES.length || entries.some(([name, contents]) => !ARTIFACT_FILENAME_SET.has(name) || typeof contents !== "string")) {
    throw containmentError("bundle must contain only the six fixed artifact files");
  }
  const location = await prepareArtifactDirectory(root, intelId);
  await assertArtifactFilesSafe(location);
  for (const [name, contents] of entries) await writeArtifactFileAtomically(location, name, contents);
  await assertArtifactFilesSafe(location);
  return location;
}
