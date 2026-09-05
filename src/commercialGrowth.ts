import { track } from './lib/analytics.ts';
import { getLeadAttribution, rememberLeadAttribution } from './lib/leadCapture.ts';
import { commercialJson, commercialLabels, commercialPageForPath, commercialPages, commercialSchema, parseCommercialContext, renderCommercialActions, renderCommercialGuide } from './lib/commercialContent.ts';

export function installCommercialGrowth() {
  const app = document.getElementById('app');
  if (!app) return;
  const initialized = new WeakMap<HTMLFormElement, string>();
  const syncInquiry = () => {
    if (!/^\/inquire\/?$/.test(location.pathname)) return;
    const query = new URLSearchParams(location.search);
    if (query.has('lead_capture_context') || query.has('interest')) return;
    const saved = getLeadAttribution();
    const parsed = parseCommercialContext(saved.cta_context);
    const form = app.querySelector<HTMLFormElement>('.inquiry-form');
    if (!parsed || !form) return;
    const hidden = form.querySelector<HTMLInputElement>('[name="lead_capture_context"]');
    const interest = form.querySelector<HTMLSelectElement>('[name="interest"]');
    if (!hidden || !interest) return;
    hidden.value = saved.cta_context!;
    form.dataset.leadCtaLabel = commercialLabels[parsed.intent];
    form.dataset.leadCtaLocation = `commercial-${parsed.page}-intro`;
    if (initialized.get(form) !== saved.cta_context) {
      interest.value = parsed.intent === 'availability' ? 'Request current availability' : 'Request private floor-plan packet';
      initialized.set(form, saved.cta_context!);
    }
  };
  const setText = (element: Element | null, value: string) => {
    if (element && element.textContent !== value) element.textContent = value;
  };
  const refresh = () => {
    syncInquiry();
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
      before?.insertAdjacentHTML('beforebegin', renderCommercialGuide(page));
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
    rememberLeadAttribution({ cta_context: context, cta_label: commercialLabels[parsed.intent], cta_location: `commercial-${parsed.page}-intro` });
    track('cta_click', { path: commercialPages[parsed.page].path, pageType: parsed.page, ctaText: commercialLabels[parsed.intent], location: `commercial-${parsed.page}-intro`, leadCaptureContext: context });
    // Leave the clean native href intact; avoid legacy generic-link attribution.
    event.stopImmediatePropagation();
  }, true);
  window.addEventListener('submit', (event) => {
    if (event.target instanceof HTMLFormElement && event.target.matches('.inquiry-form')) syncInquiry();
  }, true);
  const observer = new MutationObserver(refresh);
  observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  observer.observe(document.head, { childList: true, subtree: true });
  window.addEventListener('popstate', refresh);
  refresh();
}
