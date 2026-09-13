import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRepositoryIndexes } from "../intel/repo-index.mjs";
import { createGoogleMetadataAccessTokenProvider, createGoogleSheetsSnapshotProvider } from "./google-sheets-snapshot.mjs";
import { createShadowProcessingOwner } from "./processing-owner.mjs";
import { createProcessingOwnerServer } from "./processing-owner-http.mjs";
import { createSheetFactCheckInputsProvider } from "./review-inputs-provider.mjs";

const REQUIRED_SHEET_ID = "1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8";
const REQUIRED_SHEET_NAME = "Incoming_Intel";

function required(env, name) {
  const value = env[name];
  if (!value) throw new Error(`ERR_SHADOW_OWNER_ENV_REQUIRED:${name}`);
  return value;
}

export function configuredOwnerFromEnv({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const runtimeInput = required(env, "P2_RUNTIME_ROOT");
  if (!path.isAbsolute(runtimeInput)) throw new Error("ERR_SHADOW_OWNER_PRIVATE_PATH");
  const runtimeRoot = path.resolve(runtimeInput);
  const repoRoot = path.resolve(env.P2_REPO_ROOT || process.cwd());
  const sheetId = env.P2_GOOGLE_SHEET_ID || REQUIRED_SHEET_ID;
  const sheetName = env.P2_GOOGLE_SHEET_NAME || REQUIRED_SHEET_NAME;
  if (sheetId !== REQUIRED_SHEET_ID || sheetName !== REQUIRED_SHEET_NAME) throw new Error("ERR_SHADOW_OWNER_SHEET_TARGET");
  const googleAuthMode = env.P2_GOOGLE_AUTH_MODE || "metadata";
  if (!["metadata", "service_account_json"].includes(googleAuthMode)) throw new Error("ERR_SHADOW_OWNER_GOOGLE_AUTH_MODE");
  const snapshotProvider = createGoogleSheetsSnapshotProvider({
    ...(googleAuthMode === "metadata"
      ? { accessTokenProvider: createGoogleMetadataAccessTokenProvider({ fetchImpl }) }
      : { serviceAccountJson: required(env, "P2_GOOGLE_SERVICE_ACCOUNT_JSON") }),
    expectedSheetId: sheetId,
    expectedSheetName: sheetName,
    fetchImpl,
  });
  const dispatchSecret = required(env, "P2_DISPATCH_SECRET");
  if (dispatchSecret.length < 32) throw new Error("ERR_SHADOW_OWNER_DISPATCH_SECRET");
  return createShadowProcessingOwner({
    root: runtimeRoot,
    secret: dispatchSecret,
    snapshotProvider,
    reviewInputsProvider: createSheetFactCheckInputsProvider(),
    indexesProvider: () => buildRepositoryIndexes(repoRoot),
  });
}

// Direct execution starts the single shadow owner. Deploy behind HTTPS and an
// authenticated/private edge; do not expose this plain HTTP listener directly.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const owner = configuredOwnerFromEnv();
  const server = createProcessingOwnerServer({ owner });
  const host = process.env.P2_OWNER_HOST || "127.0.0.1";
  const port = Number.parseInt(process.env.P2_OWNER_PORT || "8791", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("ERR_SHADOW_OWNER_PORT");
  server.listen(port, host, () => process.stdout.write(`WPB shadow owner listening on ${host}:${port}; release disabled\n`));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
}
