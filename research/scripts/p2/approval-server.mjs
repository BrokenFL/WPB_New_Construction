import crypto from "node:crypto";
import http from "node:http";
import { stableJson } from "../intel/core.mjs";

export const APPROVAL_TOKEN_TTL_MS = 60 * 60 * 1000;

function hmac(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function timingSafeHexEqual(left, right) {
  if (!/^[a-f0-9]{64}$/.test(String(left)) || !/^[a-f0-9]{64}$/.test(String(right))) return false;
  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function mintApprovalToken({ secret, entry, approver, now = Date.now() }) {
  if (!secret || typeof approver !== "string" || !approver.trim() || !entry?.candidate_sha256 || !entry?.policy_version || !entry?.evidence_bundle_sha256) throw new Error("ERR_APPROVAL_BINDING_REQUIRED");
  const scopes = [];
  if (entry.article_state === "pending_review") scopes.push("article");
  if (entry.fact_change_state === "pending_review") scopes.push("fact_change");
  if (!scopes.length) throw new Error("ERR_APPROVAL_SCOPE_REQUIRED");
  const unsigned = {
    token_id: `tok-${crypto.randomUUID()}`,
    idempotency_key: entry.idempotency_key,
    candidate_sha256: entry.candidate_sha256,
    evidence_bundle_sha256: entry.evidence_bundle_sha256,
    policy_version: entry.policy_version,
    approver,
    scopes,
    issued_at: new Date(now).toISOString(),
    expires_at: new Date(now + APPROVAL_TOKEN_TTL_MS).toISOString(),
  };
  return { ...unsigned, signature: hmac(secret, stableJson(unsigned)) };
}

export function verifyApprovalToken({ token, secret, now = Date.now(), allowedApprovers }) {
  if (!token || typeof token !== "object" || Array.isArray(token)) return { ok: false, code: "ERR_TOKEN_MALFORMED" };
  const keys = ["token_id", "idempotency_key", "candidate_sha256", "evidence_bundle_sha256", "policy_version", "approver", "scopes", "issued_at", "expires_at", "signature"];
  if (Object.keys(token).length !== keys.length || keys.some((key) => !Object.prototype.hasOwnProperty.call(token, key))) return { ok: false, code: "ERR_TOKEN_MALFORMED" };
  const { signature, ...unsigned } = token;
  if (!secret || !timingSafeHexEqual(signature, hmac(secret, stableJson(unsigned)))) return { ok: false, code: "ERR_TOKEN_SIGNATURE" };
  if (!Array.isArray(unsigned.scopes) || !unsigned.scopes.length || new Set(unsigned.scopes).size !== unsigned.scopes.length
    || unsigned.scopes.some((scope) => !["article", "fact_change"].includes(scope))) return { ok: false, code: "ERR_TOKEN_MALFORMED" };
  if (Array.isArray(allowedApprovers) && !allowedApprovers.includes(unsigned.approver)) return { ok: false, code: "ERR_APPROVER_UNAUTHORIZED" };
  const issued = Date.parse(unsigned.issued_at);
  const expires = Date.parse(unsigned.expires_at);
  if (!Number.isFinite(issued) || !Number.isFinite(expires) || expires <= issued || issued > now + 5 * 60 * 1000 || expires < now) return { ok: false, code: "ERR_APPROVAL_EXPIRED" };
  return { ok: true, token: unsigned };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
}

function renderReviewPage(entry, token) {
  const review = entry.review_object || {};
  const article = review.article || {};
  const facts = review.fact_changes || [];
  return `<!doctype html><html><body>
<h1>WPB Intel Review</h1>
<p><b>Article:</b> ${escapeHtml(entry.article_decision)} · <b>Fact:</b> ${escapeHtml(entry.fact_change_decision)} · <b>Policy:</b> ${escapeHtml(entry.policy_version)}</p>
<p><b>Intel ID:</b> ${escapeHtml(entry.intel_id)} · <b>Event:</b> ${escapeHtml(entry.event_key)}</p>
<h2>Exact candidate version</h2>
<p><b>Headline:</b> ${escapeHtml(article.title || "(none)")}</p>
<p><b>Deck:</b> ${escapeHtml(article.deck || "")}</p>
${(article.sections || []).map((section) => `<h3>${escapeHtml(section.heading)}</h3><p>${escapeHtml(section.body)}</p>`).join("")}
<h2>Exact canonical fact diff</h2>
<ul>${facts.length ? facts.map((fact) => `<li>${escapeHtml(fact.project_id)} · ${escapeHtml(fact.field)}: ${escapeHtml(stableJson(fact.current_value))} → ${escapeHtml(stableJson(fact.proposed_value))}</li>`).join("") : "<li>none</li>"}</ul>
<p><b>Candidate SHA:</b> <code>${escapeHtml(entry.candidate_sha256)}</code></p>
<p><b>Evidence bundle SHA:</b> <code>${escapeHtml(entry.evidence_bundle_sha256)}</code></p>
${token.scopes.map((scope) => `<h3>${scope === "article" ? "Article" : "Canonical fact change"} decision</h3>
<form method="POST" action="/approve">
  <input type="hidden" name="token_id" value="${escapeHtml(token.token_id)}">
  <input type="hidden" name="signature" value="${escapeHtml(token.signature)}">
  <input type="hidden" name="scope" value="${escapeHtml(scope)}">
  <button name="action" value="approve">Approve</button>
  <button name="action" value="hold">Hold</button>
  <button name="action" value="reject">Reject</button>
</form>`).join("")}
<p>GET requests never mutate. Any wording, fact, evidence, or policy change invalidates this approval.</p>
</body></html>`;
}

function approvalSessionValue(secret, tokenId) {
  return `${tokenId}.${hmac(secret, stableJson({ purpose: "p2-approval-session", token_id: tokenId }))}`;
}

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || "").split(";");
  for (const item of cookies) {
    const separator = item.indexOf("=");
    if (separator < 0 || item.slice(0, separator).trim() !== name) continue;
    try { return decodeURIComponent(item.slice(separator + 1).trim()); } catch { return ""; }
  }
  return "";
}

function authenticatedPost(req, token, secret) {
  if (req.headers.authorization === `Bearer ${secret}`) return true;
  const actual = cookieValue(req, "wpb_p2_approval_session");
  const expected = approvalSessionValue(secret, token.token_id);
  const actualProof = actual.slice(actual.lastIndexOf(".") + 1);
  const expectedProof = expected.slice(expected.lastIndexOf(".") + 1);
  return actual.startsWith(`${token.token_id}.`) && timingSafeHexEqual(actualProof, expectedProof);
}

async function readForm(req, maxBytes = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBytes) reject(new Error("ERR_BODY_TOO_LARGE"));
    });
    req.on("end", () => resolve(new URLSearchParams(body)));
    req.on("error", reject);
  });
}

export function createApprovalServer({ queue, secret, tokens = new Map(), allowedApprovers = ["brooke"] }) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (req.method === "GET" && url.pathname.startsWith("/review/")) {
        const tokenId = url.pathname.split("/").pop();
        const token = tokens.get(tokenId);
        const verified = token && verifyApprovalToken({ token, secret, allowedApprovers });
        const signatureMatches = token && timingSafeHexEqual(url.searchParams.get("sig"), token.signature);
        const entry = verified?.ok && signatureMatches ? queue.get(token.idempotency_key) : null;
        if (!entry) { res.writeHead(404).end("not found"); return; }
        const maxAge = Math.max(0, Math.floor((Date.parse(token.expires_at) - Date.now()) / 1000));
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-frame-options": "DENY",
          "referrer-policy": "no-referrer",
          "set-cookie": `wpb_p2_approval_session=${encodeURIComponent(approvalSessionValue(secret, token.token_id))}; HttpOnly; SameSite=Strict; Path=/approve; Max-Age=${maxAge}`,
        }).end(renderReviewPage(entry, token));
        return;
      }

      if (req.method === "POST" && url.pathname === "/approve") {
        const params = await readForm(req);
        const token = tokens.get(params.get("token_id"));
        if (!token || !timingSafeHexEqual(params.get("signature"), token.signature)) { res.writeHead(404).end("unknown token"); return; }
        if (!authenticatedPost(req, token, secret)) { res.writeHead(401).end("unauthorized"); return; }
        const verified = verifyApprovalToken({ token, secret, allowedApprovers });
        if (!verified.ok) { res.writeHead(403).end(verified.code); return; }
        const action = params.get("action");
        const scope = params.get("scope");
        const outcome = queue.act({ key: token.idempotency_key, approvalToken: token, action, scope });
        if (!outcome.ok) { res.writeHead(409).end(outcome.code); return; }
        await queue.save();
        res.writeHead(200, { "cache-control": "no-store" }).end(`ok:${action}`);
        return;
      }

      res.writeHead(404).end("not found");
    } catch (error) {
      res.writeHead(error?.message === "ERR_BODY_TOO_LARGE" ? 413 : 500).end("request failed");
    }
  });
}
