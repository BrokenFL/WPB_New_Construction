import { comparisonForPath } from './lib/shortlist.ts';
import "./style.css";
import "./floorplanEntities.css";
import "./commercialGrowth.css";
import "./shortlistSummary.css";
import "./authorshipTrust.css";
import { wireInquiryContext } from "./lib/inquiryContext.ts";
import { installSocialPreviewNormalization } from "./lib/socialPreview.ts";
import { cleanFloorplanPath, mergeFloorplanDiscoverySchema, floorplanForPath, floorplanJson, renderFloorplanDiscovery } from "./lib/floorplanEntities.ts";

function isRendered(element: HTMLElement) {
  if (element.hidden || element.closest("[hidden]")) return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
}

function normalizeActiveProjectHeading(app: HTMLElement) {
  const main = Array.from(app.querySelectorAll<HTMLElement>("main")).find(isRendered);
  if (!main) return;
  const activeProjectView = Array.from(main.querySelectorAll<HTMLElement>('[data-route-view="project"]')).find((view) => {
    if (!isRendered(view)) return false;
    const identity = view.querySelector<HTMLElement>(".project-identity-copy");
    const hero = view.querySelector<HTMLElement>('[data-project-section="hero"]');
    return Boolean(identity && hero && isRendered(identity) && isRendered(hero));
  });
  if (!activeProjectView) return;
  const identityHeading = Array.from(activeProjectView.querySelectorAll<HTMLHeadingElement>(".project-identity-copy > h1")).find(isRendered);
  const heroHeading = Array.from(activeProjectView.querySelectorAll<HTMLHeadingElement>('[data-project-section="hero"] h1')).find(isRendered);
  if (!identityHeading || !heroHeading || identityHeading === heroHeading) return;
  const identityTitle = document.createElement("p");
  identityTitle.className = "project-identity-title";
  identityTitle.textContent = identityHeading.textContent;
  identityHeading.replaceWith(identityTitle);
}

async function installConcierge() {
  try {
    const { installBuyerConciergeLauncher } = await import("./conciergeLauncher.ts");
    installBuyerConciergeLauncher();
  } catch (error) {
    console.warn("Ask WPB concierge enhancement was not loaded", error);
  }
}

async function start() {
  installSocialPreviewNormalization();
  // The launcher is optional but should become available independently of the
  // heavier legacy enhancement chain. The panel body remains interaction-lazy.
  void installConcierge();

  const comparison = comparisonForPath(location.pathname);
  if (comparison) {
    const { mountComparison } = await import('./comparisonPage.ts');
    mountComparison(comparison);
    return;
  }
  const plan = floorplanForPath(window.location.pathname);
  if (plan) {
    const { mountFloorplanPage } = await import("./floorplanPage.ts");
    mountFloorplanPage(plan);
    return;
  }
  await import("./main.ts");
  const app = document.getElementById("app");
  if (!app) return;
  normalizeActiveProjectHeading(app);
  const { track } = await import("./lib/analytics.ts");
  const syncFloorplanInquiry = wireInquiryContext(app);
  const { enhanceRequestForms } = await import("./requestPresentation.ts");
  const { installCommercialGrowth } = await import("./commercialGrowth.ts");
  installCommercialGrowth();
  const { installCorridorGrowth } = await import("./corridorGrowth.ts");
  installCorridorGrowth();
  const { installComparisonDiscovery } = await import('./comparisonDiscovery.ts');
  installComparisonDiscovery(app);
  const { installProjectSeoBatch4 } = await import('./projectSeoBatch4.ts');
  await installProjectSeoBatch4(app);
  const { installAuthorshipTrust } = await import('./authorshipTrust.ts');
  await installAuthorshipTrust(app);

  window.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-floorplan-entity-link]") : null;
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const entity = floorplanForPath(link.pathname);
    if (!entity) return;
    event.stopImmediatePropagation();
    track("floor_plan_click", { buildingSlug: entity.projectId, planName: entity.planName, path: entity.path });
  }, true);

  const refresh = () => {
    normalizeActiveProjectHeading(app);
    syncFloorplanInquiry();
    enhanceRequestForms(app);
    const path = cleanFloorplanPath(window.location.pathname);
    const old = app.querySelector<HTMLElement>("#wpb-floorplan-guides");
    const html = renderFloorplanDiscovery(path);
    const schema = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
    if (schema?.textContent) {
      try {
        const merged = floorplanJson(mergeFloorplanDiscoverySchema(JSON.parse(schema.textContent), path));
        if (schema.textContent !== merged) schema.textContent = merged;
      } catch (error) {
        console.warn("Could not extend the existing floor-plan discovery graph", error);
      }
    }
    if (!html) {
      old?.remove();
      return;
    }
    if (old?.dataset.page === path) return;
    old?.remove();
    (app.querySelector("main") ?? app).insertAdjacentHTML("beforeend", html);
  };

  const observerOptions: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"],
  };
  const observer = new MutationObserver((mutations) => {
    // Google Maps owns and continuously mutates the DOM below its canvas. Those
    // internal mutations are not app content changes and must not retrigger the
    // site-wide enhancement pass.
    const onlyMapInternals = mutations.length > 0 && mutations.every((mutation) =>
      mutation.target instanceof Element && Boolean(mutation.target.closest("[data-hero-google-map]")),
    );
    if (onlyMapInternals) return;

    // refresh() itself can normalize or inject DOM. Disconnect while it runs so
    // those idempotent enhancement writes cannot recursively schedule refresh.
    observer.disconnect();
    try {
      refresh();
    } finally {
      observer.observe(app, observerOptions);
    }
  });

  // Complete the initial enhancement pass before subscribing to mutations. This
  // prevents initial normalization from seeding an observer-feedback loop.
  refresh();
  observer.observe(app, observerOptions);
  window.addEventListener("popstate", refresh);
}

start().catch((error: unknown) => {
  console.error("Unable to initialize the page", error);
});
