import { track } from './lib/analytics.ts';
import { rememberLeadAttribution } from './lib/leadCapture.ts';
import { commercialJson, commercialLabels, commercialPageForPath, commercialPages, commercialSchema, parseCommercialContext, renderCommercialActions, renderCommercialGuide } from './lib/commercialContent.ts';

let installed = false;
export function installCommercialGrowth() {
  if (installed) return;
  const app = document.getElementById('app');
  if (!app) return;
  installed = true;
  const setText = (element: Element | null, value: string) => {
    if (element && element.textContent !== value) element.textContent = value;
  };
  const refresh = () => {
    const page = commercialPageForPath(location.pathname);
    if (!page) return;
    const view = app.querySelector<HTMLElement>(`[data-route-view="${page}"]`);
    if (!view || view.hidden) return;
    const copy = commercialPages[page];
    const hero = view.querySelector(page === 'home' ? '.home-hero' : '.buildings-route-hero');
    if (!hero) return;
    if (page === 'home') {
      for (const title of hero.querySelectorAll('.home-hero-title-desktop, .home-hero-title-mobile')) setText(title, copy.heading);
      setText(hero.querySelector('.hero-copy'), copy.intro);
    } else {
      setText(hero.querySelector('[data-directory-title]'), copy.heading);
      setText(hero.querySelector('[data-directory-deck]'), copy.intro);
    }
    if (!hero.querySelector('[data-commercial-actions]')) {
      const after = hero.querySelector(page === 'home' ? '.hero-copy' : '[data-directory-deck]');
      after?.insertAdjacentHTML('afterend', renderCommercialActions(page));
    }
    if (!view.querySelector('[data-commercial-guide]')) {
      const before = view.querySelector(page === 'home' ? '.home-corridor-guide' : '.buildings-directory');
      before?.insertAdjacentHTML(page === 'home' ? 'beforebegin' : 'afterend', renderCommercialGuide(page));
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
        const value = commercialJson(commercialSchema(JSON.parse(schema.textContent ?? '{}'), page));
        if (value !== schema.textContent) schema.textContent = value;
      } catch { /* Do not replace a schema owned by another feature. */ }
    }
  };
  window.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-commercial-intent]') : null;
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const context = `commercial:${link.dataset.commercialOrigin}:${link.dataset.commercialIntent}`;
    const parsed = parseCommercialContext(context);
    if (!parsed || commercialPageForPath(location.pathname) !== parsed.page || link.pathname !== '/inquire/') return;
    rememberLeadAttribution({ cta_context: context, cta_label: commercialLabels[parsed.intent], cta_location: `commercial-${parsed.page}-intro` }, { replaceRequest: true });
    track('cta_click', { path: commercialPages[parsed.page].path, pageType: parsed.page, ctaText: commercialLabels[parsed.intent], location: `commercial-${parsed.page}-intro`, leadCaptureContext: context });
    // Leave the clean native href intact; avoid legacy generic-link attribution.
    event.stopImmediatePropagation();
  }, true);
  const observer = new MutationObserver(refresh);
  observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  observer.observe(document.head, { childList: true, subtree: true });
  window.addEventListener('popstate', refresh);
  refresh();
}
