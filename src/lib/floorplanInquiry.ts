import { floorplanForPath } from './floorplanEntities.ts';
import { getLeadAttribution } from './leadCapture.ts';

/** Bridge the two pilot pages into the existing form, without changing its
 * submission endpoint, validation, Turnstile, analytics or legacy router.
 * Native navigation has no tracking query. Restore the origin before the
 * legacy submit handler can replace it with its generic contact_page default.
 */
export function wireFloorplanInquiryContext(app: HTMLElement) {
  const prefilled = new WeakMap<HTMLFormElement, string>();
  const userSelected = new WeakSet<HTMLFormElement>();
  app.addEventListener('change', (event) => {
    const input = event.target;
    if (input instanceof HTMLSelectElement && input.name === 'project' && input.form?.matches('.inquiry-form')) userSelected.add(input.form);
  });
  const sync = () => {
    if (!/^\/inquire\/?$/.test(window.location.pathname)) return;
    const params = new URLSearchParams(window.location.search);
    // Explicit user/other-journey selections must never be overwritten.
    if (params.has('project') || params.has('lead_capture_context')) return;
    const saved = getLeadAttribution();
    const match = saved.cta_context?.match(/^floorplan:([a-z0-9-]+):([a-z0-9-]+)$/);
    const plan = match ? floorplanForPath(`/floorplans/${match[1]}/${match[2]}/`) : undefined;
    const form = app.querySelector<HTMLFormElement>('.inquiry-form');
    if (!plan || !form || !match) return;
    const project = form.querySelector<HTMLSelectElement>('select[name="project"]');
    const context = form.querySelector<HTMLInputElement>('input[name="lead_capture_context"]');
    if (!project || !context) return;
    if (prefilled.get(form) !== match[0] && !userSelected.has(form)) {
      if (!project.value) project.value = plan.projectId;
      prefilled.set(form, match[0]);
    }
    context.value = match[0];
    form.dataset.leadCtaLabel = 'Request current availability';
    form.dataset.leadCtaLocation = saved.cta_location === 'floorplan-entity-intro' ? 'floorplan-entity-intro' : 'floorplan-entity';
    if (project.value === plan.projectId) {
      form.dataset.leadProjectName = plan.projectName;
      form.dataset.leadCorridor = 'north-flagler';
    } else {
      // The origin plan stays in cta_context, but a manually changed project
      // must not be submitted with the origin building's display name.
      delete form.dataset.leadProjectName;
      delete form.dataset.leadCorridor;
      form.querySelector<HTMLInputElement>('input[name="project_name"]')?.setAttribute('value', '');
    }
  };
  window.addEventListener('submit', (event) => {
    if (event.target instanceof HTMLFormElement && event.target.matches('.inquiry-form')) sync();
  }, true);
  return sync;
}
