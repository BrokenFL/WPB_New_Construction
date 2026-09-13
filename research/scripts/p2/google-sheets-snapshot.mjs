import crypto from "node:crypto";

export const GOOGLE_SHEETS_READ_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const GOOGLE_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";
const GOOGLE_METADATA_TOKEN_URL = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function serviceAccount(value) {
  let parsed;
  try { parsed = typeof value === "string" ? JSON.parse(value) : value; }
  catch { throw new Error("ERR_GOOGLE_SHEETS_CREDENTIAL"); }
  if (!parsed || parsed.type !== "service_account"
    || typeof parsed.client_email !== "string" || !parsed.client_email
    || typeof parsed.private_key !== "string" || !parsed.private_key.includes("BEGIN PRIVATE KEY")) {
    throw new Error("ERR_GOOGLE_SHEETS_CREDENTIAL");
  }
  if (parsed.token_uri && parsed.token_uri !== GOOGLE_TOKEN_AUDIENCE) throw new Error("ERR_GOOGLE_SHEETS_TOKEN_AUDIENCE");
  return parsed;
}

function jwtAssertion(credentials, nowSeconds) {
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: GOOGLE_SHEETS_READ_SCOPE,
    aud: GOOGLE_TOKEN_AUDIENCE,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), credentials.private_key).toString("base64url");
  return `${unsigned}.${signature}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function valuesToCsv(values) {
  if (!Array.isArray(values) || !Array.isArray(values[0]) || values[0].length === 0) throw new Error("ERR_GOOGLE_SHEETS_VALUES");
  const width = values[0].length;
  return values.map((row) => {
    if (!Array.isArray(row) || row.length > width) throw new Error("ERR_GOOGLE_SHEETS_VALUES");
    return Array.from({ length: width }, (_, index) => csvCell(row[index] ?? "")).join(",");
  }).join("\n");
}

export function createGoogleSheetsSnapshotProvider({
  serviceAccountJson,
  accessTokenProvider,
  expectedSheetId,
  expectedSheetName = "Incoming_Intel",
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
} = {}) {
  const credentials = typeof accessTokenProvider === "function" ? null : serviceAccount(serviceAccountJson);
  if (!expectedSheetId || !expectedSheetName || typeof fetchImpl !== "function") throw new Error("ERR_GOOGLE_SHEETS_CONFIGURATION");
  let cachedToken = null;

  async function accessToken() {
    if (typeof accessTokenProvider === "function") return accessTokenProvider();
    const nowMs = now();
    if (cachedToken && cachedToken.expires_at > nowMs + 60_000) return cachedToken.value;
    const assertion = jwtAssertion(credentials, Math.floor(nowMs / 1000));
    const response = await fetchImpl(GOOGLE_TOKEN_AUDIENCE, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!response?.ok) throw new Error("ERR_GOOGLE_SHEETS_AUTH");
    const body = await response.json();
    if (typeof body?.access_token !== "string" || !body.access_token || !Number.isFinite(Number(body.expires_in))) throw new Error("ERR_GOOGLE_SHEETS_AUTH");
    cachedToken = { value: body.access_token, expires_at: nowMs + Number(body.expires_in) * 1000 };
    return cachedToken.value;
  }

  return async function snapshotProvider({ sheetId, sheetName }) {
    if (sheetId !== expectedSheetId || sheetName !== expectedSheetName) throw new Error("ERR_GOOGLE_SHEETS_TARGET");
    const token = await accessToken();
    const range = encodeURIComponent(`'${sheetName.replaceAll("'", "''")}'`);
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${range}`);
    url.searchParams.set("majorDimension", "ROWS");
    url.searchParams.set("valueRenderOption", "FORMATTED_VALUE");
    url.searchParams.set("dateTimeRenderOption", "FORMATTED_STRING");
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });
    if (!response?.ok) throw new Error("ERR_GOOGLE_SHEETS_READ");
    const body = await response.json();
    return valuesToCsv(body?.values);
  };
}

export function createGoogleMetadataAccessTokenProvider({ fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  if (typeof fetchImpl !== "function") throw new Error("ERR_GOOGLE_METADATA_CONFIGURATION");
  let cached = null;
  return async function accessTokenProvider() {
    const nowMs = now();
    if (cached && cached.expires_at > nowMs + 60_000) return cached.value;
    const response = await fetchImpl(GOOGLE_METADATA_TOKEN_URL, {
      method: "GET",
      headers: { "metadata-flavor": "Google" },
    });
    if (!response?.ok) throw new Error("ERR_GOOGLE_METADATA_AUTH");
    const body = await response.json();
    if (typeof body?.access_token !== "string" || !body.access_token || !Number.isFinite(Number(body.expires_in))) throw new Error("ERR_GOOGLE_METADATA_AUTH");
    cached = { value: body.access_token, expires_at: nowMs + Number(body.expires_in) * 1000 };
    return cached.value;
  };
}
