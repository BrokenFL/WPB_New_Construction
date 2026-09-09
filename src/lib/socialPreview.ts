import { absoluteSocialImageUrl } from "../../shared/public-social-url.js";

const selectors = ['meta[property="og:image"]', 'meta[name="twitter:image"]'];

function canonicalHref() {
  return document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || window.location.href;
}

function normalizeCurrentImages(preferred: { canonical: string; image: string | null }) {
  const currentCanonical = canonicalHref();
  const tags = selectors.map((selector) => document.querySelector<HTMLMetaElement>(selector)).filter(Boolean) as HTMLMetaElement[];
  const currentCandidate = tags.map((tag) => absoluteSocialImageUrl(tag.content)).find(Boolean) ?? null;
  if (currentCanonical !== preferred.canonical) {
    preferred.canonical = currentCanonical;
    preferred.image = currentCandidate;
  }
  const safe = preferred.image ?? currentCandidate;
  if (!safe) return;
  preferred.image = safe;
  for (const tag of tags) {
    if (tag.content !== safe) tag.content = safe;
  }
}

export function installSocialPreviewNormalization() {
  const initial = selectors.map((selector) => document.querySelector<HTMLMetaElement>(selector)?.content).find(Boolean) ?? "";
  const preferred = { canonical: canonicalHref(), image: absoluteSocialImageUrl(initial) };
  normalizeCurrentImages(preferred);
  const observer = new MutationObserver(() => normalizeCurrentImages(preferred));
  observer.observe(document.head, { subtree: true, childList: true, attributes: true, attributeFilter: ["content", "href"] });
  window.addEventListener("popstate", () => queueMicrotask(() => normalizeCurrentImages(preferred)));
}
