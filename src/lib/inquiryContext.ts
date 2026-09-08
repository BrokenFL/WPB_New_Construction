import { parseShortlist, shortlistProjects } from './shortlist.ts';
import { floorplanForPath } from './floorplanEntities.ts';
import { commercialLabels, parseCommercialContext } from './commercialContent.ts';
import { corridorActionLabels, parseCorridorContext } from './corridorGrowthContent.ts';
import { getLeadAttribution } from './leadCapture.ts';

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

/**
 * Convert only known query-driven inquiry intents to form values.
 * Batch 4 intentionally uses its buyer-facing packet label as the submitted
 * interest; arbitrary query text must never become a form option.
 */
export function resolveQueryInquiryInterest(value: string | null) {
  if (value === 'availability' || value === 'Request current availability') return 'Request current availability';
  if (value === 'floorplans') return 'Request private floor-plan packet';
  if (value === 'compare') return 'Compare buildings';
  if (value === 'Pricing + floor-plan packet') return 'Pricing + floor-plan packet';
  return undefined;
}

function ensureInterestOption(select: HTMLSelectElement, value: string) {
  if (Array.from(select.options).some((option) => option.value === value)) return;
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  select.append(option);
}

export function wireInquiryContext(app: HTMLElement) {
  const applied = new WeakMap<HTMLFormElement, { context: string; projectEdited: boolean; interestEdited: boolean }>();
  let explicitRequestFingerprint = '';

  app.addEventListener('change', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLSelectElement) || !field.form) return;
    const state = applied.get(field.form);
    if (state && field.name === 'project') state.projectEdited = true;
    if (state && field.name === 'interest') state.interestEdited = true;
  });

  const syncExplicitQuery = (form: HTMLFormElement) => {
    if (!/^\/inquire\/?$/.test(location.pathname)) {
      explicitRequestFingerprint = '';
      return false;
    }

    const query = new URLSearchParams(location.search);
    const hasExplicitRequest = ['project', 'interest', 'lead_capture_context', 'message'].some((key) => query.has(key));
    if (!hasExplicitRequest) {
      explicitRequestFingerprint = '';
      return false;
    }

    // The URL itself is the request fingerprint. A new SPA navigation gets one
    // initialization pass; later DOM mutations or submit-time synchronization
    // cannot undo a buyer's manual selection for that request.
    const fingerprint = `${location.pathname}?${query.toString()}`;
    if (fingerprint === explicitRequestFingerprint) return true;

    const project = form.querySelector<HTMLSelectElement>('select[name="project"]');
    const interest = form.querySelector<HTMLSelectElement>('select[name="interest"]');
    const hidden = form.querySelector<HTMLInputElement>('[name="lead_capture_context"]');
    const sourcePage = form.querySelector<HTMLInputElement>('[name="source_page"]');
    const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    if (!project || !interest || !hidden) return true;

    const rawProject = query.get('project');
    // Canonical alias normalization remains owned by the existing route query
    // initializer. Direct canonical IDs are safe to apply here as a fallback;
    // aliases that are not select options are left untouched.
    if (rawProject && Array.from(project.options).some((option) => option.value === rawProject)) {
      project.value = rawProject;
    }

    const requestedInterest = resolveQueryInquiryInterest(query.get('interest'));
    if (requestedInterest) {
      ensureInterestOption(interest, requestedInterest);
      interest.value = requestedInterest;
    }

    const queryMessage = query.get('message');
    if (message && queryMessage !== null) message.value = queryMessage;
    hidden.value = query.get('lead_capture_context') ?? 'contact_page';
    if (sourcePage) sourcePage.value = location.href;

    // An explicit query-driven request supersedes remembered auto-population.
    // Remove bridge-owned metadata from the prior request family; canonical
    // project selection and first-touch attribution live in their existing owners.
    form.querySelector<HTMLElement>('[data-shortlist-review]')?.remove();
    delete form.dataset.leadProjectSlug;
    delete form.dataset.leadCtaLabel;
    delete form.dataset.leadCtaLocation;
    applied.set(form, { context: `query:${fingerprint}`, projectEdited: false, interestEdited: false });
    explicitRequestFingerprint = fingerprint;
    return true;
  };

  const sync = () => {
    if (!/^\/inquire\/?$/.test(location.pathname)) {
      explicitRequestFingerprint = '';
      return;
    }
    const form = app.querySelector<HTMLFormElement>('.inquiry-form');
    if (!form) return;

    // Explicit query requests outrank remembered origins. Unlike the legacy
    // one-shot initializer, this path fingerprints each SPA navigation so a
    // changed request is applied exactly once in the same browser session.
    if (syncExplicitQuery(form)) return;

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
    if (origin.context.startsWith('corridor:')) form.dataset.leadCorridor = origin.corridor;
    if (origin.project && project.value === origin.project) {
      form.dataset.leadProjectName = origin.projectName;
      form.dataset.leadCorridor = origin.corridor;
      if (name) name.value = origin.projectName;
    }
  };

  // The legacy router handles internal links synchronously. This listener is
  // installed after it, so a microtask observes the new URL/form state without
  // creating another router, endpoint, or mutation loop.
  app.addEventListener('click', () => queueMicrotask(sync));
  window.addEventListener('popstate', sync);
  window.addEventListener('submit', (event) => {
    if (event.target instanceof HTMLFormElement && event.target.matches('.inquiry-form')) sync();
  }, true);
  // Apply after the legacy app's initial route/query initialization.
  sync();
  return sync;
}
