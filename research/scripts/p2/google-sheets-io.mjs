import crypto from "node:crypto";

// Read/write Google Sheets transport for the fast-mode cycle. Same service
// account JWT flow as google-sheets-snapshot.mjs but with the read/write
// spreadsheets scope, plus values.update for row writeback and an idempotent
// tab/schema ensure for Story_Queue. Sheet stays the durable workflow state.
export const GOOGLE_SHEETS_RW_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

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
  return parsed;
}

function jwtAssertion(credentials, scope, nowSeconds) {
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope,
    aud: GOOGLE_TOKEN_AUDIENCE,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), credentials.private_key).toString("base64url");
  return `${unsigned}.${signature}`;
}

function columnName(index) {
  // 1-based column index -> A, B, ... Z, AA ...
  let name = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

export function exactHeaderMatch(actual = [], expected = []) {
  return actual.length === expected.length
    && expected.every((header, index) => actual[index] === header);
}

export function createGoogleSheetsIo({
  serviceAccountJson,
  accessTokenProvider,
  expectedSheetId,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
} = {}) {
  const credentials = typeof accessTokenProvider === "function" ? null : serviceAccount(serviceAccountJson);
  if (!expectedSheetId || typeof fetchImpl !== "function") throw new Error("ERR_GOOGLE_SHEETS_CONFIGURATION");
  let cachedToken = null;

  async function accessToken() {
    if (typeof accessTokenProvider === "function") return accessTokenProvider();
    const nowMs = now();
    if (cachedToken && cachedToken.expires_at > nowMs + 60_000) return cachedToken.value;
    const assertion = jwtAssertion(credentials, GOOGLE_SHEETS_RW_SCOPE, Math.floor(nowMs / 1000));
    const response = await fetchImpl(GOOGLE_TOKEN_AUDIENCE, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    });
    if (!response?.ok) throw new Error("ERR_GOOGLE_SHEETS_AUTH");
    const body = await response.json();
    if (typeof body?.access_token !== "string" || !body.access_token) throw new Error("ERR_GOOGLE_SHEETS_AUTH");
    cachedToken = { value: body.access_token, expires_at: nowMs + Number(body.expires_in) * 1000 };
    return cachedToken.value;
  }

  async function request(method, path, body) {
    const token = await accessToken();
    const response = await fetchImpl(`${SHEETS_API}/${encodeURIComponent(expectedSheetId)}${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response?.ok) throw new Error(`ERR_GOOGLE_SHEETS_${method}:${response.status}`);
    return response.json();
  }

  function escTab(tab) {
    return `'${String(tab).replaceAll("'", "''")}'`;
  }

  return {
    /** Read a tab (or explicit "Tab!A1:B2" range) as a 2-D values array. */
    async readValues(tabOrRange) {
      const range = tabOrRange.includes("!") ? tabOrRange : escTab(tabOrRange);
      const data = await request("GET", `/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`);
      return data?.values || [];
    },

    /** Update a single row (1-based, header included in numbering). */
    async updateRow(tab, rowNumber, cells) {
      const range = `${escTab(tab)}!A${rowNumber}:${columnName(cells.length)}${rowNumber}`;
      await request("PUT", `/values/${encodeURIComponent(range)}?valueInputOption=RAW`, { range, majorDimension: "ROWS", values: [cells] });
    },

    /** Update selected cells: updates = [{rowNumber, columnIndex(1-based), value}] */
    async updateCells(tab, updates) {
      const data = updates.map((update) => ({
        range: `${escTab(tab)}!${columnName(update.columnIndex)}${update.rowNumber}`,
        values: [[update.value ?? ""]],
      }));
      await request("POST", "/values:batchUpdate", { valueInputOption: "RAW", data });
    },

    /** Append a row to the end of a tab. */
    async appendRow(tab, cells) {
      const range = `${escTab(tab)}!A1`;
      await request("POST", `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { majorDimension: "ROWS", values: [cells] });
    },

    /** Idempotent tab ensure: creates the tab if absent and writes a header
     * only for a new/empty tab. Existing non-empty schemas are validated and
     * never rewritten in place. */
    async ensureTab(tab, headers) {
      const meta = await request("GET", "?fields=sheets.properties.title");
      const titles = new Set((meta?.sheets || []).map((sheet) => sheet?.properties?.title));
      let created = false;
      if (!titles.has(tab)) {
        await request("POST", ":batchUpdate", { requests: [{ addSheet: { properties: { title: tab } } }] });
        created = true;
      }
      // Do not translate a read/auth failure into an apparently empty tab:
      // that could overwrite a live schema. Inspect the first two rows so an
      // existing tab with a blank header and data below also fails closed.
      const existing = created ? [] : await this.readValues(`${escTab(tab)}!1:2`);
      const headerRow = existing?.[0] || [];
      const hasDataBelowHeader = (existing || []).slice(1).some((row) => (row || []).some((cell) => String(cell ?? "").trim()));
      if (!created && headerRow.length === 0 && hasDataBelowHeader) {
        throw new Error(`ERR_GOOGLE_SHEETS_SCHEMA:${tab}`);
      }
      const needsHeader = created || (headerRow.length === 0 && !hasDataBelowHeader);
      if (!needsHeader && !exactHeaderMatch(headerRow, headers)) {
        throw new Error(`ERR_GOOGLE_SHEETS_SCHEMA:${tab}`);
      }
      if (needsHeader) await this.updateRow(tab, 1, headers);
      return { created, headerWritten: needsHeader };
    },
  };
}
