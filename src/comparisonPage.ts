import './comparisonPage.css';
import { comparisonPages, comparisonSchema, comparisonJson, renderComparison } from './lib/comparisonContent.ts';
import { comparisonProjectIds, encodeShortlist, parseShortlist, type ComparisonKey } from './lib/shortlist.ts';
import { captureLeadLandingContext, getLeadAttribution, rememberLeadAttribution } from './lib/leadCapture.ts';
import { track } from './lib/analytics.ts';

export function mountComparison(key: ComparisonKey) {
  const app = document.getElementById('app');
  if (!app) return;
  const c = comparisonPages[key];
  if (!app.querySelector(`[data-comparison-page="${key}"]`)) app.innerHTML = renderComparison(key);
  document.title = c.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', c.description);
  for (const id of ['wpb-static-structured-data', 'wpb-structured-data']) document.getElementById(id)?.remove();
  let schema = document.getElementById('wpb-comparison-schema') as HTMLScriptElement | null;
  if (!schema) { schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.id = 'wpb-comparison-schema'; document.head.append(schema); }
  schema.textContent = comparisonJson(comparisonSchema(key));
  captureLeadLandingContext();
  const options = app.querySelector<HTMLFieldSetElement>('[data-shortlist-options]')!;
  const action = app.querySelector<HTMLAnchorElement>('[data-shortlist-submit]')!;
  const status = app.querySelector<HTMLElement>('[data-shortlist-status]')!;
  const saved = parseShortlist(getLeadAttribution().cta_context);
  const inputs = Array.from(options.querySelectorAll<HTMLInputElement>('input[type=checkbox]'));
  if (saved?.key === key) inputs.forEach(input => { input.checked = saved.ids.some(id => id === input.value); });
  const selection = () => comparisonProjectIds[key].filter(id => inputs.some(input => input.value === id && input.checked));
  const refresh = () => {
    const ids = selection(); const valid = Boolean(encodeShortlist(key, ids));
    status.textContent = valid ? `${ids.length} buildings selected. Your inquiry will include this shortlist.` : 'Choose at least two buildings to request a comparison.';
    action.setAttribute('aria-disabled', String(!valid));
  };
  options.disabled = false;
  options.addEventListener('change', refresh);
  action.addEventListener('click', event => {
    // Do not pretend session-scoped context transfers into a newly opened tab.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const context = encodeShortlist(key, selection());
    if (!context) { event.preventDefault(); status.focus(); return; }
    const chosen = parseShortlist(context)!;
    rememberLeadAttribution({ cta_context:context, cta_label:'Compare my shortlist', cta_location:`comparison-${key}`, corridor:chosen.corridor }, { replaceRequest:true });
    track('cta_click', { path:c.path, pageType:'answer_detail', location:`comparison-${key}`, ctaText:'Compare my shortlist', leadCaptureContext:context, corridor:chosen.corridor });
  });
  status.tabIndex = -1;
  refresh();
  app.dataset.comparisonReady = key;
  track('page_view', { route:'answer-detail', path:c.path, pageType:'answer_detail' });
}
