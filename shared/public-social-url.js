export const productionOrigin = "https://www.wpbnewconstruction.com";

export function absoluteSocialImageUrl(value, origin = productionOrigin) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  let resolved;
  try {
    resolved = new URL(raw, origin);
  } catch {
    return null;
  }
  if (resolved.protocol !== "https:") return null;
  if (resolved.username || resolved.password) return null;
  return resolved.href;
}
