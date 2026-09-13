import crypto from "node:crypto";
import http from "node:http";
import { stableJson } from "../intel/core.mjs";

// Protected approval-flow prototype. Local-only HTTP server demonstrating the
// approval contract:
//   - approver authenticates (Bearer token checked server-side);
//   - review page shows the exact candidate version;
//   - approval requires an explicit protected POST;
//   - expired, repeated, or stale approvals are rejected;
//   - GET / link previews never mutate;
//   - changed wording never inherits an earlier approval.
// Not deployed; binds 127.0.0.1 only.

export const APPROVAL_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function mintApprovalToken({ secret, entry, approver, now = Date.now() }) {
  const unsigned = {
    token_id: `tok-${crypto.randomUUID()}`,
    idempotency_key: entry.idempotency_key,
    candidate_sha256: entry.candidate_sha256,
    approver,
    issued_at: new Date(now).toISOString(),
    expires_at: new Date(now + APPROVAL_TOKEN_TTL_MS).toISOString(),
  };
  const signature = crypto.createHmac("sha256", secret).update(stableJson(unsigned)).digest("hex");
  return { ...unsigned, signature };
}

export function verifyApprovalToken({ token, secret }) {
  if (!token || typeof token !== "object") return { ok: false, code: "ERR_TOKEN_MALFORMED" };
  const { signature, ...unsigned } = token;
  const expected = crypto.createHmac("sha256", secret).update(stableJson(unsigned)).digest("hex");
  if (signature !== expected) return { ok: false, code: "ERR_TOKEN_SIGNATURE" };
  return { ok: true, token: unsigned };
}

function renderReviewPage(entry, token) {
  const c = entry.candidate || {};
  return `<!doctype html><html><body>
<h1>WPB Intel Review</h1>
<p><b>Decision:</b> ${entry.decision} · <b>Policy:</b> ${entry.policy_version}</p>
<p><b>Intel ID:</b> ${entry.intel_id} · <b>Event:</b> ${entry.event_key}</p>
<h2>Exact candidate version</h2>
<p><b>Headline:</b> ${c.headline || "(none)"}</p>
<p><b>Date:</b> ${c.event_date || "(undated)"}</p>
<p><b>Summary:</b> ${c.summary || ""}</p>
<p><b>Candidate SHA:</b> <code>${entry.candidate_sha256}</code></p>
<form method="POST" action="/approve">
  <input type="hidden" name="token_id" value="${token.token_id}">
  <button name="action" value="approve">Approve</button>
  <button name="action" value="hold">Hold</button>
  <button name="action" value="reject">Reject</button>
</form>
<p>GET requests never mutate. Approval binds to the exact candidate hash above.</p>
</body></html>`;
}

export function createApprovalServer({ queue, secret, approver, tokens = new Map() }) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const auth = req.headers.authorization === `Bearer ${secret}`;

    if (req.method === "GET" && url.pathname.startsWith("/review/")) {
      // Link preview / GET: render only, never mutate.
      const tokenId = url.pathname.split("/").pop();
      const token = tokens.get(tokenId);
      const entry = token && queue.get(token.idempotency_key);
      if (!token || !entry) { res.writeHead(404).end("not found"); return; }
      res.writeHead(200, { "content-type": "text/html" }).end(renderReviewPage(entry, token));
      return;
    }

    if (req.method === "POST" && url.pathname === "/approve") {
      if (!auth) { res.writeHead(401).end("unauthorized"); return; }
      const body = await new Promise((resolve) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => resolve(b)); });
      const params = new URLSearchParams(body);
      const token = tokens.get(params.get("token_id"));
      if (!token) { res.writeHead(404).end("unknown token"); return; }
      const verified = verifyApprovalToken({ token, secret });
      if (!verified.ok) { res.writeHead(403).end(verified.code); return; }
      const action = params.get("action");
      const key = token.idempotency_key;
      let outcome;
      if (action === "approve") outcome = queue.approve({ key, approvalToken: token, candidateSha256: token.candidate_sha256 });
      else if (action === "hold") outcome = queue.hold(key, "approver_hold");
      else if (action === "reject") outcome = queue.reject(key, "approver_reject");
      else { res.writeHead(400).end("bad action"); return; }
      if (!outcome.ok) { res.writeHead(409).end(outcome.code); return; }
      await queue.save();
      res.writeHead(200).end(`ok:${action}`);
      return;
    }

    res.writeHead(404).end("not found");
  });
}
