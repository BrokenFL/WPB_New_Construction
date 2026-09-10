import "./requestPresentation.css";
import { normalizeRequestIntent } from "./lib/requestIntents.ts";

function ensureIntentField(form: HTMLFormElement, id: string) {
  let field = form.querySelector<HTMLInputElement>('input[name="request_intent"]');
  if (!field) {
    field = document.createElement("input");
    field.type = "hidden";
    field.name = "request_intent";
    form.append(field);
  }
  field.value = id;
}

function subjectFor(form: HTMLFormElement) {
  const shortlist = form.querySelector<HTMLElement>("[data-shortlist-review] p");
  if (shortlist?.textContent?.trim()) return shortlist.textContent.trim();
  const projectSelect = form.querySelector<HTMLSelectElement>('select[name="project"]');
  if (projectSelect?.value) return projectSelect.selectedOptions[0]?.textContent?.trim() || projectSelect.value;
  const projectName = form.querySelector<HTMLInputElement>('input[name="project_name"]')?.value.trim();
  const context = form.querySelector<HTMLInputElement>('input[name="lead_capture_context"]')?.value.trim() || "";
  const plan = context.match(/(?:floorplan|floorplan-request:[^:]+):([^:]+):([^:]+)$/);
  if (plan) {
    const planLabel = plan[2].split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
    return `${projectName || plan[1]} · ${planLabel}`;
  }
  if (projectName) return projectName;
  const corridor = form.dataset.leadCorridor;
  if (corridor) return corridor.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
  return "WPB New Construction inquiry";
}

function updateSummary(form: HTMLFormElement) {
  const interest = form.querySelector<HTMLSelectElement>('select[name="interest"]')?.value
    || form.querySelector<HTMLInputElement>('input[name="interest"]')?.value
    || "";
  const definition = normalizeRequestIntent(interest);
  if (!definition) return;

  ensureIntentField(form, definition.id);
  const hiddenInterest = form.querySelector<HTMLInputElement>('input[name="interest"]');
  if (hiddenInterest) hiddenInterest.value = definition.interest;
  const select = form.querySelector<HTMLSelectElement>('select[name="interest"]');
  if (select && select.value !== definition.interest) select.value = definition.interest;

  let summary = form.querySelector<HTMLElement>("[data-request-summary]");
  if (!summary) {
    summary = document.createElement("section");
    summary.className = "request-summary";
    summary.dataset.requestSummary = "";
    const firstLabel = form.querySelector("label");
    form.insertBefore(summary, firstLabel ?? form.firstChild);
  }
  summary.replaceChildren();
  const eyebrow = document.createElement("p");
  eyebrow.className = "request-summary__eyebrow";
  eyebrow.textContent = "Your request";
  const heading = document.createElement("strong");
  heading.textContent = definition.buttonLabel;
  const subject = document.createElement("p");
  subject.textContent = `For: ${subjectFor(form)}`;
  const response = document.createElement("p");
  response.textContent = definition.humanResponse;
  summary.append(eyebrow, heading, subject, response);

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button) button.textContent = definition.buttonLabel;
  if (form.matches(".brochure-inquiry-card")) {
    const headingNode = form.querySelector<HTMLHeadingElement>("h2");
    if (headingNode) headingNode.textContent = definition.buttonLabel;
    form.dataset.leadCtaLabel = definition.buttonLabel;
  }
}

function normalizeInquiryOptions(form: HTMLFormElement) {
  const select = form.querySelector<HTMLSelectElement>('select[name="interest"]');
  if (!select) return;
  const selected = normalizeRequestIntent(select.value)?.id;
  const seen = new Set<string>();
  for (const option of [...select.options]) {
    const definition = normalizeRequestIntent(option.value || option.textContent || "");
    if (!definition) continue;
    if (seen.has(definition.id)) {
      option.remove();
      continue;
    }
    seen.add(definition.id);
    option.value = definition.interest;
    option.textContent = definition.buttonLabel;
    if (definition.id === selected) option.selected = true;
  }
}

export function enhanceRequestForms(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>(".inquiry-form, .brochure-inquiry-card").forEach((form) => {
    normalizeInquiryOptions(form);
    updateSummary(form);
    if (form.dataset.batch6IntentWired === "true") return;
    form.dataset.batch6IntentWired = "true";
    form.addEventListener("change", (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && ["interest", "project"].includes(target.name)) updateSummary(form);
    });
  });
}
