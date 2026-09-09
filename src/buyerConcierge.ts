import { rememberLeadAttribution } from "./lib/leadCapture.ts";
import { requestIntentDefinitions, type RequestIntentId } from "./lib/requestIntents.ts";

type ConciergeContext = { path: string; project?: string; corridor?: string; plan?: string };

type ConciergeLink = { label: string; href: string; intent?: RequestIntentId; context?: ConciergeContext };

function inquiryHref(intent: RequestIntentId, context: ConciergeContext) {
  const definition = requestIntentDefinitions[intent];
  const url = new URL("/inquire/", location.origin);
  const legacyInterest: Record<RequestIntentId, string> = {
    availability: "Request current availability",
    pricing_packet: "Request private floor-plan packet",
    compare_shortlist: "Compare buildings",
    project_question: "Ask the team about this building",
    conversation_tour: "Schedule private tour",
  };
  url.searchParams.set("interest", legacyInterest[intent]);
  if (context.project) url.searchParams.set("project", context.project);
  return `${url.pathname}${url.search}`;
}

function requestContext(intent: RequestIntentId, context: ConciergeContext) {
  if (context.plan && context.project) return `floorplan:${context.project}:${context.plan}`;
  if (context.project) return `concierge:project:${context.project}`;
  if (context.corridor) return `concierge:corridor:${context.corridor}`;
  return `concierge:${intent}`;
}

function link(label: string, href: string, intent?: RequestIntentId, context?: ConciergeContext) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.textContent = label;
  if (intent && context) {
    const definition = requestIntentDefinitions[intent];
    anchor.dataset.conciergeIntent = intent;
    anchor.addEventListener("click", () => {
      rememberLeadAttribution({
        cta_context: requestContext(intent, context),
        cta_label: definition.buttonLabel,
        cta_location: "ask_wpb",
        corridor: context.corridor || "",
      }, { replaceRequest: true });
    });
  }
  return anchor;
}

function section(title: string, items: ConciergeLink[]) {
  const node = document.createElement("section");
  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("ul");
  for (const item of items) {
    const li = document.createElement("li");
    li.append(link(item.label, item.href, item.intent, item.context));
    list.append(li);
  }
  node.append(heading, list);
  return node;
}

function focusable(panel: HTMLElement) {
  return [...panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
}

export function mountBuyerConcierge(root: HTMLElement, launcher: HTMLButtonElement, context: ConciergeContext) {
  const existing = root.querySelector<HTMLElement>("[data-buyer-concierge-panel]");
  if (existing) {
    existing.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    focusable(existing)[0]?.focus();
    return;
  }

  const panel = document.createElement("div");
  panel.className = "buyer-concierge-panel";
  panel.dataset.buyerConciergePanel = "";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "buyer-concierge-title");

  const header = document.createElement("header");
  const titleWrap = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.textContent = "Guided buyer help";
  const title = document.createElement("h2");
  title.id = "buyer-concierge-title";
  title.textContent = "Ask WPB";
  const intro = document.createElement("p");
  intro.textContent = "Explore our published guides, or send a question to Brooke and the team. Current availability, pricing and tour requests are confirmed by a person.";
  titleWrap.append(eyebrow, title, intro);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "buyer-concierge-close";
  close.textContent = "Close";
  close.setAttribute("aria-label", "Close Ask WPB buyer concierge");
  header.append(titleWrap, close);

  const research: ConciergeLink[] = [
    { label: "Compare buildings", href: "/compare/" },
    { label: "Find a floor plan", href: "/floorplans/" },
    { label: "Which area fits me?", href: "/corridors/" },
  ];
  if (context.project || context.plan) research.push({ label: "Ask about this project / plan", href: inquiryHref("project_question", context), intent: "project_question", context });

  const current: ConciergeLink[] = [
    { label: "Request current availability", href: inquiryHref("availability", context), intent: "availability", context },
    { label: "Get pricing + floor-plan packet", href: inquiryHref("pricing_packet", context), intent: "pricing_packet", context },
    { label: "What changed recently?", href: "/updates/" },
  ];
  const talk: ConciergeLink[] = [
    { label: "Ask Brooke / the team", href: inquiryHref("project_question", context), intent: "project_question", context },
    { label: "Schedule a conversation or tour", href: inquiryHref("conversation_tour", context), intent: "conversation_tour", context },
  ];

  panel.append(header, section("Research", research), section("Current information", current), section("Talk to the team", talk));
  root.append(panel);
  launcher.setAttribute("aria-expanded", "true");
  launcher.setAttribute("aria-controls", "buyer-concierge-title");

  const shut = () => {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  };
  close.addEventListener("click", shut);
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      shut();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable(panel);
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  close.focus();
}
