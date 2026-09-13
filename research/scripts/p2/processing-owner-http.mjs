import http from "node:http";
import { PROCESSING_OWNER_CONTRACT_VERSION } from "./processing-owner.mjs";
import { RELEASE_DISABLED } from "./release-adapter.mjs";

const JSON_TYPE = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

function send(res, status, body) {
  res.writeHead(status, JSON_TYPE);
  res.end(`${JSON.stringify(body)}\n`);
}

async function readJson(req, maxBytes) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("ERR_SHADOW_OWNER_BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new Error("ERR_SHADOW_OWNER_JSON"); }
}

export function createProcessingOwnerHttpHandler({ owner, maxBytes = 64 * 1024 } = {}) {
  if (!owner || typeof owner.handle !== "function") throw new Error("ERR_SHADOW_OWNER_HANDLER_CONFIGURATION");
  return async function handler(req, res) {
    if (req.method === "GET" && req.url === "/healthz") {
      return send(res, 200, {
        contract_version: PROCESSING_OWNER_CONTRACT_VERSION,
        ok: true,
        mode: "shadow",
        release_disabled: RELEASE_DISABLED === true,
      });
    }
    if (req.method !== "POST" || req.url !== "/v1/intel-shadow/dispatch") {
      return send(res, 404, { ok: false, code: "ERR_SHADOW_OWNER_ROUTE" });
    }
    if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
      return send(res, 415, { ok: false, code: "ERR_SHADOW_OWNER_CONTENT_TYPE" });
    }
    let envelope;
    try { envelope = await readJson(req, maxBytes); }
    catch (error) {
      return send(res, error.message === "ERR_SHADOW_OWNER_BODY_TOO_LARGE" ? 413 : 400, {
        ok: false,
        code: error.message,
      });
    }
    try {
      const response = await owner.handle(envelope);
      return send(res, response.status, response.body);
    } catch {
      return send(res, 500, {
        contract_version: PROCESSING_OWNER_CONTRACT_VERSION,
        ok: false,
        mode: "shadow",
        production_side_effects: false,
        code: "ERR_SHADOW_OWNER_INTERNAL",
      });
    }
  };
}

export function createProcessingOwnerServer(options) {
  return http.createServer(createProcessingOwnerHttpHandler(options));
}
