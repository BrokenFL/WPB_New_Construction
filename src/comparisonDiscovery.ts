import './comparisonPage.css';
import { comparisonForPath } from './lib/shortlist.ts';
import { renderComparisonLinks } from './lib/comparisonContent.ts';
let installed = false;
export function installComparisonDiscovery(app: HTMLElement) {
  if (installed) return; installed = true;
  const paths = new Set(['/answers/', '/compare/', '/projects/olara/', '/projects/ritz-carlton-wpb/', '/projects/shorecrest/']);
  const refresh = () => {
    if (!paths.has(location.pathname)) return;
    const view = app.querySelector<HTMLElement>('[data-route-view]:not([hidden])');
    if (view && !view.querySelector('[data-comparison-discovery]')) view.insertAdjacentHTML('beforeend', renderComparisonLinks());
  };
  new MutationObserver(refresh).observe(app, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden'] });
  window.addEventListener('popstate', refresh);
  window.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && comparisonForPath(url.pathname)) event.stopImmediatePropagation();
  }, true);
  refresh();
}
