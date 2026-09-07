import "./corridorGrowth.css";
import { track } from './lib/analytics.ts';
import { rememberLeadAttribution } from './lib/leadCapture.ts';
import { corridorActionLabels, corridorGrowthForPath, corridorGrowthPages, corridorGrowthSchema, corridorJson, parseCorridorContext, renderGrowthCorridor } from './lib/corridorGrowthContent.ts';
let installed = false;
/** Existing route identities, router and analytics adapter remain authoritative. */
export function installCorridorGrowth() {
  if (installed) return;
  const app = document.getElementById('app');
  if (!app) return;
  installed = true;
  const refresh = () => {
    const key = corridorGrowthForPath(location.pathname);
    if (!key) return;
    const view = app.querySelector<HTMLElement>(`[data-corridor-route="${key}"]`);
    if (!view || view.hidden) return;
    const copy = corridorGrowthPages[key];
    if (!view.querySelector(`[data-corridor-growth="${key}"]`)) {
      // Keep existing dated reporting, below the source-backed buyer guide.
      const updates = view.querySelector('.corridor-latest-updates')?.outerHTML ?? '';
      view.innerHTML = renderGrowthCorridor(key) + updates;
    }
    if (document.title !== copy.title) document.title = copy.title;
    for (const [selector, text] of [
      ['meta[name="description"]', copy.description], ['meta[property="og:title"]', copy.title],
      ['meta[property="og:description"]', copy.description], ['meta[name="twitter:title"]', copy.title],
      ['meta[name="twitter:description"]', copy.description],
    ]) {
      const meta = document.querySelector(selector);
      if (meta && meta.getAttribute('content') !== text) meta.setAttribute('content', text);
    }
    for (const schema of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const next = corridorJson(corridorGrowthSchema(JSON.parse(schema.textContent ?? '{}'), key));
        if (schema.textContent !== next) schema.textContent = next;
      } catch { /* Never replace another feature's invalid or pending graph. */ }
    }
  };
  window.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-corridor-intent]') : null;
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const context = `corridor:${link.dataset.corridorOrigin}:${link.dataset.corridorIntent}`;
    const parsed = parseCorridorContext(context);
    if (!parsed || corridorGrowthForPath(location.pathname) !== parsed.key || link.pathname !== '/inquire/' || link.origin !== location.origin) return;
    const label = corridorActionLabels[parsed.intent];
    rememberLeadAttribution({ cta_context: context, cta_label: label, cta_location: `corridor-${parsed.key}-intro`, corridor: parsed.key }, { replaceRequest: true });
    track('cta_click', { path: corridorGrowthPages[parsed.key].path, pageType: 'corridor', corridor: parsed.key, ctaText: label, location: `corridor-${parsed.key}-intro`, leadCaptureContext: context });
    // A native clean inquiry navigation must not be overwritten by generic CTA attribution.
    event.stopImmediatePropagation();
  }, true);
  const observer = new MutationObserver(refresh);
  observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  observer.observe(document.head, { childList: true, subtree: true });
  window.addEventListener('popstate', refresh);
  refresh();
}
