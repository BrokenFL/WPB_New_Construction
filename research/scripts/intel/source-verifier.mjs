import { safeHttpUrl } from "./core.mjs";

const hostRules = [
  [/^(www\.)?wpb\.org$/i, [1, "government"]],
  [/^(www\.)?pbcgov\.org$/i, [1, "government"]],
  [/relatedross\.com$/i, [1, "developer"]],
  [/southflaglerhouse\.com$/i, [1, "project"]],
  [/sec\.gov$/i, [1, "filing"]],
  [/therealdeal\.com$/i, [2, "trade"]],
  [/floridayimby\.com$/i, [2, "trade"]],
  [/discoversouthflorida\.com$/i, [2, "trade"]],
  [/yahoo\.com$/i, [2, "journalism"]],
];

export function classifySource(urlValue, sourceName = "") {
  const safe = safeHttpUrl(urlValue);
  if (!safe) return { error: "ERR_UNSAFE_SOURCE" };
  const url = new URL(safe);
  const matched = hostRules.find(([rule]) => rule.test(url.hostname));
  const [source_tier, source_type] = matched?.[1] || [3, "aggregator"];
  return { url: safe, source_name: sourceName || url.hostname, source_tier, source_type };
}

export async function verifySourceHint({ url, source_name, published_date, claims_supported = [], fetchImpl = fetch, accessed_at } = {}) {
  const classified = classifySource(url, source_name);
  if (classified.error) return classified;
  let status = null;
  let contentType = null;
  try {
    const response = await fetchImpl(classified.url, { method: "GET", redirect: "follow", headers: { "user-agent": "WPBNewConstruction-IntelVerifier/1.0" } });
    status = response.status;
    contentType = response.headers?.get?.("content-type") || null;
  } catch (error) {
    return { ...classified, reachable: false, verification_error: String(error?.message || error) };
  }
  return {
    ...classified,
    published_date: published_date || undefined,
    accessed_at: accessed_at || new Date().toISOString(),
    claims_supported,
    reachable: status >= 200 && status < 400,
    http_status: status,
    content_type: contentType,
  };
}
