import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import crypto from "node:crypto";
import { fetchedEvidenceMark, isObviousPrivateHostname, isPrivateOrReservedAddress, safeHttpUrl } from "./normalizer.mjs";

export const SOURCE_LIMITS = Object.freeze({
  timeoutMs: 5000,
  maxBytes: 256 * 1024,
  maxRedirects: 3,
});

const hostRules = [
  ["wpb.org", [1, "government"]],
  ["pbcgov.org", [1, "government"]],
  ["relatedross.com", [1, "developer"]],
  ["southflaglerhouse.com", [1, "project"]],
  ["sec.gov", [1, "filing"]],
  ["therealdeal.com", [2, "trade"]],
  ["floridayimby.com", [2, "trade"]],
  ["discoversouthflorida.com", [2, "trade"]],
  ["yahoo.com", [2, "journalism"]],
];

function hostMatches(hostname, registeredHost) {
  const host = String(hostname || "").toLowerCase().replace(/\.$/, "");
  const root = String(registeredHost || "").toLowerCase();
  return host === root || host.endsWith(`.${root}`);
}

export function classifySource(urlValue, sourceName = "") {
  const safe = safeHttpUrl(urlValue);
  if (!safe) return { error: "ERR_UNSAFE_SOURCE" };
  const url = new URL(safe);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const matched = hostRules.find(([rule]) => hostMatches(hostname, rule));
  const [source_tier, source_type] = matched?.[1] || [3, "aggregator"];
  return { url: safe, hostname, source_name: sourceName || hostname, source_tier, source_type };
}

function makeError(code, message) {
  const error = new Error(message || code);
  error.code = code;
  return error;
}

function headerValue(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  const value = headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
  return Array.isArray(value) ? value[0] : value == null ? null : String(value);
}

function normalizeAddressRecords(records) {
  const list = Array.isArray(records) ? records : records ? [records] : [];
  return list.map((record) => typeof record === "string" ? { address: record, family: net.isIP(record) } : record).filter((record) => record?.address);
}

export async function resolvePublicAddresses(hostname, { lookupImpl = dns.lookup } = {}) {
  const host = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!host || isObviousPrivateHostname(host) || isPrivateOrReservedAddress(host)) throw makeError("ERR_UNSAFE_SOURCE", "Source host is private, loopback, link-local, or reserved");
  const family = net.isIP(host);
  if (family) return [{ address: host, family }];
  let records;
  try {
    records = normalizeAddressRecords(await lookupImpl(host, { all: true, verbatim: true }));
  } catch (error) {
    throw makeError("ERR_SOURCE_DNS", `Could not resolve source host: ${error?.message || error}`);
  }
  if (!records.length || records.some((record) => isPrivateOrReservedAddress(record.address))) {
    throw makeError("ERR_UNSAFE_SOURCE", "Source host resolved to a private, loopback, link-local, or reserved address");
  }
  return records;
}

function collectNodeHeaders(headers) {
  const result = {};
  for (const [name, value] of Object.entries(headers || {})) result[name.toLowerCase()] = Array.isArray(value) ? value.join(", ") : String(value);
  return result;
}

function digestBytes(body) {
  return crypto.createHash("sha256").update(body).digest("hex");
}

function requestPinned(urlValue, addressRecord, { timeoutMs, maxBytes, headers = {} } = {}) {
  const url = new URL(urlValue);
  const client = url.protocol === "https:" ? https : http;
  const address = addressRecord.address;
  const family = addressRecord.family || net.isIP(address);
  const hostHeader = url.host;
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };
    const request = client.request({
      protocol: url.protocol,
      hostname: address,
      port: url.port || undefined,
      path: `${url.pathname || "/"}${url.search || ""}`,
      method: "GET",
      headers: { ...headers, host: hostHeader },
      lookup: (_hostname, _options, callback) => callback(null, address, family),
      ...(url.protocol === "https:" ? { servername: url.hostname.replace(/^\[|\]$/g, "") } : {}),
    }, (response) => {
      // Attach this before any bounded-size rejection can destroy the native
      // response, otherwise the emitted error can escape the promise.
      response.on("error", (error) => finish(reject, error));
      const expectedLength = Number.parseInt(headerValue(response.headers, "content-length") || "", 10);
      if (Number.isFinite(expectedLength) && expectedLength > maxBytes) {
        const error = makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
        response.destroy(error);
        request.destroy(error);
        finish(reject, error);
        return;
      }
      const chunks = [];
      let bytes = 0;
      response.on("data", (chunk) => {
        bytes += Buffer.byteLength(chunk);
        if (bytes > maxBytes) {
          const error = makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
          response.destroy(error);
          request.destroy(error);
          return;
        }
        chunks.push(Buffer.from(chunk));
      });
      response.on("end", () => finish(resolve, {
        status: response.statusCode || 0,
        headers: collectNodeHeaders(response.headers),
        body: Buffer.concat(chunks),
        url: urlValue,
      }));
    });
    const deadline = setTimeout(() => request.destroy(makeError("ERR_SOURCE_TIMEOUT", "Source request timed out")), timeoutMs);
    request.setTimeout(timeoutMs, () => request.destroy(makeError("ERR_SOURCE_TIMEOUT", "Source request timed out")));
    request.once("close", () => clearTimeout(deadline));
    request.on("error", (error) => finish(reject, error));
    request.end();
  });
}

export async function fetchPublic(urlValue, { timeoutMs = SOURCE_LIMITS.timeoutMs, maxBytes = SOURCE_LIMITS.maxBytes, maxRedirects = SOURCE_LIMITS.maxRedirects, lookupImpl = dns.lookup, headers = {} } = {}) {
  let current = safeHttpUrl(urlValue);
  if (!current) throw makeError("ERR_UNSAFE_SOURCE", "Source URL is not a safe public HTTP(S) URL");
  const redirectChain = [];
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const parsed = new URL(current);
    const startedAt = Date.now();
    const records = await withTimeout(resolvePublicAddresses(parsed.hostname, { lookupImpl }), timeoutMs);
    redirectChain.push(current);
    const remainingMs = Math.max(1, timeoutMs - (Date.now() - startedAt));
    const response = await requestPinned(current, records[0], { timeoutMs: remainingMs, maxBytes, headers });
    const location = headerValue(response.headers, "location");
    if (response.status >= 300 && response.status < 400 && location) {
      if (redirectCount === maxRedirects) throw makeError("ERR_SOURCE_REDIRECT_LIMIT", "Source redirects exceeded the bounded limit");
      const next = safeHttpUrl(new URL(location, current).href);
      if (!next) throw makeError("ERR_UNSAFE_SOURCE", "Source redirect targets an unsafe URL");
      current = next;
      continue;
    }
    return { ...response, url: current, redirect_chain: redirectChain };
  }
  throw makeError("ERR_SOURCE_REDIRECT_LIMIT", "Source redirects exceeded the bounded limit");
}

async function readInjectedBody(response, maxBytes) {
  const contentLength = Number.parseInt(headerValue(response?.headers, "content-length") || "", 10);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
  if (response?.body && typeof response.body.getReader === "function") {
    const reader = response.body.getReader();
    const chunks = [];
    let bytes = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      const chunk = Buffer.from(part.value);
      bytes += chunk.byteLength;
      if (bytes > maxBytes) {
        try { await reader.cancel(); } catch {}
        throw makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
      }
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  if (response?.body && typeof response.body[Symbol.asyncIterator] === "function") {
    const chunks = [];
    let bytes = 0;
    for await (const part of response.body) {
      const chunk = Buffer.from(part);
      bytes += chunk.byteLength;
      if (bytes > maxBytes) throw makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  if (typeof response?.arrayBuffer === "function") {
    const body = Buffer.from(await response.arrayBuffer());
    if (body.byteLength > maxBytes) throw makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
    return body;
  }
  if (typeof response?.text === "function") {
    const body = Buffer.from(await response.text());
    if (body.byteLength > maxBytes) throw makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
    return body;
  }
  if (response?.body !== undefined && response?.body !== null) {
    const body = Buffer.from(String(response.body));
    if (body.byteLength > maxBytes) throw makeError("ERR_SOURCE_TOO_LARGE", "Source response exceeds the bounded byte limit");
    return body;
  }
  return null;
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(makeError("ERR_SOURCE_TIMEOUT", "Source request timed out")), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function fetchInjected(urlValue, fetchImpl, { timeoutMs, maxBytes, maxRedirects, headers }) {
  let current = safeHttpUrl(urlValue);
  const redirectChain = [];
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    if (!current) throw makeError("ERR_UNSAFE_SOURCE", "Source redirect targets an unsafe URL");
    redirectChain.push(current);
    const controller = new AbortController();
    const responseData = withTimeout((async () => {
      const response = await fetchImpl(current, {
        method: "GET",
        redirect: "manual",
        headers,
        signal: controller.signal,
      });
      const status = Number(response?.status || 0);
      const location = headerValue(response?.headers, "location");
      const body = await readInjectedBody(response, maxBytes);
      return { response, status, location, body };
    })(), timeoutMs).catch((error) => {
      controller.abort();
      throw error;
    });
    const { response, status, location, body } = await responseData;
    if (status >= 300 && status < 400 && location) {
      if (redirectCount === maxRedirects) throw makeError("ERR_SOURCE_REDIRECT_LIMIT", "Source redirects exceeded the bounded limit");
      current = safeHttpUrl(new URL(location, current).href);
      continue;
    }
    const reportedUrl = response?.url ? safeHttpUrl(response.url) : current;
    if (!reportedUrl) throw makeError("ERR_UNSAFE_SOURCE", "Fetched source resolved to an unsafe URL");
    return { status, headers: response?.headers, body, url: reportedUrl, redirect_chain: redirectChain };
  }
  throw makeError("ERR_SOURCE_REDIRECT_LIMIT", "Source redirects exceeded the bounded limit");
}

export async function verifySourceHint({ url, source_name, published_date, claims_supported = [], fetchImpl, accessed_at, timeoutMs = SOURCE_LIMITS.timeoutMs, maxBytes = SOURCE_LIMITS.maxBytes, maxRedirects = SOURCE_LIMITS.maxRedirects, lookupImpl = dns.lookup } = {}) {
  const classified = classifySource(url, source_name);
  if (classified.error) return classified;
  const headers = { "user-agent": "WPBNewConstruction-IntelVerifier/1.0", accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1" };
  try {
    const response = fetchImpl
      ? await fetchInjected(classified.url, fetchImpl, { timeoutMs, maxBytes, maxRedirects, headers })
      : await fetchPublic(classified.url, { timeoutMs, maxBytes, maxRedirects, lookupImpl, headers });
    const finalUrl = safeHttpUrl(response.url || classified.url);
    if (!finalUrl) throw makeError("ERR_UNSAFE_SOURCE", "Fetched source resolved to an unsafe URL");
    const body = response.body;
    const contentHash = body ? digestBytes(body) : undefined;
    const finalSource = finalUrl === classified.url ? classified : classifySource(finalUrl, "");
    if (finalSource?.error) throw makeError("ERR_UNSAFE_SOURCE", "Fetched source could not be independently classified after redirect");
    const status = Number(response.status || 0);
    const verifiedFetch = {
      ...finalSource,
      hint_url: classified.url,
      hint_source_name: classified.source_name,
      published_date: published_date || undefined,
      accessed_at: accessed_at || new Date().toISOString(),
      final_url: finalUrl,
      redirect_chain: response.redirect_chain,
      final_source: finalSource,
      reachable: status >= 200 && status < 400,
      http_status: status,
      content_type: headerValue(response.headers, "content-type"),
      body_bytes: body?.byteLength,
      content_hash: contentHash,
      source_revision: contentHash,
      retrieval_status: status >= 200 && status < 300 && body !== null ? "fetched" : "unavailable",
      retrieval_attested: status >= 200 && status < 300 && body !== null,
      verification_status: "unadjudicated",
      support_state: "unadjudicated",
      verified: false,
      claims_supported: [],
      claims_supported_ignored: Array.isArray(claims_supported) && claims_supported.length > 0,
    };
    Object.defineProperty(verifiedFetch, fetchedEvidenceMark, { value: true, enumerable: false });
    return verifiedFetch;
  } catch (error) {
    return {
      ...classified,
      hint_url: classified.url,
      hint_source_name: classified.source_name,
      published_date: published_date || undefined,
      accessed_at: accessed_at || new Date().toISOString(),
      reachable: false,
      verification_status: "unadjudicated",
      support_state: "unadjudicated",
      verified: false,
      retrieval_status: "unavailable",
      claims_supported: [],
      claims_supported_ignored: Array.isArray(claims_supported) && claims_supported.length > 0,
      verification_error: error?.code || String(error?.message || error),
    };
  }
}

export { hostRules };
