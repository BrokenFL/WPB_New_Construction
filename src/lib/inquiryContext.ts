import { parseShortlist, shortlistProjects } from './shortlist.ts';
import { floorplanForPath } from './floorplanEntities.ts';
import { commercialLabels, parseCommercialContext } from './commercialContent.ts';
import { corridorActionLabels, parseCorridorContext } from './corridorGrowthContent.ts';
import { getLeadAttribution } from './leadCapture.ts';
import { normalizeRequestIntent } from './requestIntents.ts';

/** A single allowlisted owner for commercial, floor-plan and corridor requests. */
export function resolveInquiryContext(value: unknown) {
  const shortlist = parseShortlist(value);
  if (shortlist) return {
    context: String(value), label: 'Compare my shortlist', interest: 'Compare buildings',
    location: `comparison-${shortlist.key}`, project: shortlist.ids[0], projectName: shortlistProjects[shortlist.ids[0]].name, corridor: shortlist.corridor,
  };
  const corridor = parseCorridorContext(value);
  if (corridor) return {
    context: String(value), label: corridorActionLabels[corridor.intent],
    interest: corridor.intent === 'availability' ? 'Request current availability' : 'Request private floor-plan packet',
    location: `corridor-${corridor.key}-intro`, project: '', projectName: '', corridor: corridor.key,
  };
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
  const dispatchSynchronizedChange = (form: HTMLFormElement, field: HTMLSelectElement, editedKey: 'projectEdited' | 'interestEdited') => {
    field.dispatchEvent(new Event('change', { bubbles: true }));
    const state = applied.get(form);
    if (state) state[editedKey] = false;
  };
  const setProjectSelection = (field: HTMLSelectElement, value: string) => {
    if (field.value === value) return false;
    field.value = value;
    return true;
  };
  const setInterestSelection = (field: HTMLSelectElement, value: string) => {
    const definition = normalizeRequestIntent(value);
    if (!definition) return false;
    const option = Array.from(field.options).find((candidate) =>
      normalizeRequestIntent(candidate.value || candidate.textContent || '')?.id === definition.id,
    );
    if (!option || field.value === option.value) return false;
    field.value = option.value;
    return true;
  };
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
    const shortlist = parseShortlist(saved.cta_context);
    let review = form.querySelector<HTMLElement>('[data-shortlist-review]');
    if (!shortlist) review?.remove();
    else if (review?.dataset.context !== saved.cta_context) {
      if (!review) { review = document.createElement('section'); review.className = 'bc-shortlist-review'; review.dataset.shortlistReview = ''; form.prepend(review); }
      review.replaceChildren(); review.dataset.context = saved.cta_context;
      const heading = document.createElement('h3'); heading.textContent = 'Your comparison shortlist';
      const names = document.createElement('p'); names.textContent = shortlist.names.join(' · ');
      const note = document.createElement('p'); note.textContent = 'All of these buildings accompany your request. The building field below selects a primary focus; it does not replace the shortlist.';
      const edit = document.createElement('a'); edit.href = shortlist.path + '#shortlist'; edit.textContent = 'Edit my shortlist';
      review.append(heading, names, note, edit);
    }
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
    const isNewContext = !previous || previous.context !== origin.context;
    if (isNewContext) {
      // A new explicit request must not inherit the previous request's selections.
      applied.set(form, { context: origin.context, projectEdited: false, interestEdited: false });
    }
    const state = applied.get(form)!;
    const projectSynchronized = !state.projectEdited && (isNewContext || origin.project)
      ? setProjectSelection(project, origin.project)
      : false;
    const interestSynchronized = !state.interestEdited ? setInterestSelection(interest, origin.interest) : false;
    hidden.value = origin.context;
    form.dataset.leadCtaLabel = origin.label;
    form.dataset.leadCtaLocation = origin.project && saved.cta_location === 'floorplan-entity-intro' ? 'floorplan-entity-intro' : origin.location;
    // Never let a prior plan's display metadata override the chosen building.
    delete form.dataset.leadProjectSlug;
    delete form.dataset.leadProjectName;
    delete form.dataset.leadCorridor;
    const name = form.querySelector<HTMLInputElement>('[name="project_name"]');
    if (name) name.value = '';
    if (origin.context.startsWith('corridor:')) form.dataset.leadCorridor = origin.corridor;
    if (origin.project && project.value === origin.project) {
      form.dataset.leadProjectName = origin.projectName;
      form.dataset.leadCorridor = origin.corridor;
      if (name) name.value = origin.projectName;
    }
    if (isNewContext || projectSynchronized) dispatchSynchronizedChange(form, project, 'projectEdited');
    if (isNewContext || interestSynchronized) dispatchSynchronizedChange(form, interest, 'interestEdited');
  };
  window.addEventListener('submit', (event) => {
    if (event.target instanceof HTMLFormElement && event.target.matches('.inquiry-form')) sync();
  }, true);
  // Apply before any optional dynamic enhancement can delay form initialization.
  sync();
  return sync;
}
