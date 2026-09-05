import { floorplanForPath } from './floorplanEntities.ts';
import { commercialLabels, parseCommercialContext } from './commercialContent.ts';
import { getLeadAttribution } from './leadCapture.ts';

/** A single allowlisted owner for both prepared request families. */
export function resolveInquiryContext(value: unknown) {
  const commercial = parseCommercialContext(value);
  if (commercial) return {
    context: String(value), label: commercialLabels[commercial.intent],
    interest: commercial.intent === 'availability' ? 'Request current availability' : 'Request private floor-plan packet',
    location: `commercial-${commercial.page}-intro`, project: '', projectName: '', corridor: '',
  };
  const match = typeof value === 'string' ? value.match(/^floorplan:([a-z0-9-]+):([a-z0-9-]+)$/) : null;
  const plan = match ? floorplanForPath(`/floorplans/${match[1]}/${match[2]}/`) : undefined;
  return plan ? {
    context: String(value), label: 'Request current availability', interest: 'Request current availability',
    location: 'floorplan-entity', project: plan.projectId, projectName: plan.projectName, corridor: 'north-flagler',
  } : undefined;
}

export function wireInquiryContext(app: HTMLElement) {
  const applied = new WeakMap<HTMLFormElement, { context: string; projectEdited: boolean; interestEdited: boolean }>();
  app.addEventListener('change', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLSelectElement) || !field.form) return;
    const state = applied.get(field.form);
    if (state && field.name === 'project') state.projectEdited = true;
    if (state && field.name === 'interest') state.interestEdited = true;
  });
  const sync = () => {
    if (!/^\/inquire\/?$/.test(location.pathname)) return;
    const form = app.querySelector<HTMLFormElement>('.inquiry-form');
    if (!form) return;
    const query = new URLSearchParams(location.search);
    // Explicit legacy query flows outrank remembered origins.
    if (['project', 'interest', 'lead_capture_context'].some((key) => query.has(key))) return;
    const saved = getLeadAttribution();
    const origin = resolveInquiryContext(saved.cta_context);
    const previous = applied.get(form);
    const hidden = form.querySelector<HTMLInputElement>('[name="lead_capture_context"]');
    const project = form.querySelector<HTMLSelectElement>('select[name="project"]');
    const interest = form.querySelector<HTMLSelectElement>('select[name="interest"]');
    if (!hidden || !project || !interest) return;
    if (!origin) {
      if (previous) {
        hidden.value = 'contact_page';
        delete form.dataset.leadProjectName;
        delete form.dataset.leadProjectSlug;
        delete form.dataset.leadCorridor;
        delete form.dataset.leadCtaLabel;
        delete form.dataset.leadCtaLocation;
        form.querySelector<HTMLInputElement>('[name="project_name"]')?.setAttribute('value', '');
        applied.delete(form);
      }
      return;
    }
    if (!previous || previous.context !== origin.context) {
      // A new explicit request must not inherit the previous request's selections.
      project.value = origin.project;
      interest.value = origin.interest;
      applied.set(form, { context: origin.context, projectEdited: false, interestEdited: false });
    }
    const state = applied.get(form)!;
    if (!state.projectEdited && origin.project) project.value = origin.project;
    if (!state.interestEdited) interest.value = origin.interest;
    hidden.value = origin.context;
    form.dataset.leadCtaLabel = origin.label;
    form.dataset.leadCtaLocation = origin.project && saved.cta_location === 'floorplan-entity-intro' ? 'floorplan-entity-intro' : origin.location;
    // Never let a prior plan's display metadata override the chosen building.
    delete form.dataset.leadProjectSlug;
    delete form.dataset.leadProjectName;
    delete form.dataset.leadCorridor;
    const name = form.querySelector<HTMLInputElement>('[name="project_name"]');
    if (name) name.value = '';
    if (origin.project && project.value === origin.project) {
      form.dataset.leadProjectName = origin.projectName;
      form.dataset.leadCorridor = origin.corridor;
      if (name) name.value = origin.projectName;
    }
  };
  window.addEventListener('submit', (event) => {
    if (event.target instanceof HTMLFormElement && event.target.matches('.inquiry-form')) sync();
  }, true);
  return sync;
}
