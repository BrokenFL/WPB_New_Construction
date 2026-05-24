import fs from "node:fs/promises";
import path from "node:path";

export const qaNoWrite = process.env.QA_NO_WRITE === "1" || process.argv.includes("--no-write");

export function qaReportPath(workspace, trackedRelativePath) {
  if (!qaNoWrite) return path.join(workspace, trackedRelativePath);
  return path.join(workspace, ".runtime/qa", path.basename(trackedRelativePath));
}

export async function ensureReportDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export function qaReportMode() {
  return qaNoWrite ? "runtime" : "tracked";
}
