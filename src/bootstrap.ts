import { comparisonForPath } from './lib/shortlist.ts';
import "./style.css";
import "./floorplanEntities.css";
import "./commercialGrowth.css";
import "./shortlistSummary.css";
import "./authorshipTrust.css";
import { wireInquiryContext } from "./lib/inquiryContext.ts";
import { cleanFloorplanPath, mergeFloorplanDiscoverySchema, floorplanForPath, floorplanJson, renderFloorplanDiscovery } from "./lib/floorplanEntities.ts";

function isRendered(element: HTMLElement) {
  if (element.hidden || element.closest("[hidden]")) return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
}

function normalizeActiveProjectHeading(app: HTMLElement) {
  const main = Array.from(app.querySelectorAll<HTMLElement>("main")).find(isRendered);
  if (!main) return;
  const identityHeading = main.querySelector<HTMLHeadingElement>(".project-identity-copy > h1");
  const heroHeading = main.querySelector<HTMLHeadingElement>('[data-project-section="hero"] h1');
  if (!identityHeading || !heroHeading || identityHeading === heroHeading) return;

  const identityTitle = document.createElement("p");
  identityTitle.className = "project-identity-title";
  identityTitle.textContent = identityHeading.textContent;
  identityHeading.replaceWith(identityTitle);
}

async function start() {
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
  // Keep the existing application/router unchanged for every existing route.
  await import("./main.ts");
  const app = document.getElementById("app");
  if (!app) return;
  normalizeActiveProjectHeading(app);
  const { track } = await import("./lib/analytics.ts");
  const syncFloorplanInquiry = wireInquiryContext(app);
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

  // Entity routes are full document navigations, outside the legacy router.
  // Preserve native middle/modified clicks and no-JavaScript crawlable anchors.
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
  // The legacy application replaces its DOM on navigation. This small,
  // idempotent enhancement also survives library filters and project rerenders.
  const observer = new MutationObserver(refresh);
  observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
  window.addEventListener("popstate", refresh);
  refresh();
}

start().catch((error: unknown) => {
  console.error("Unable to initialize the page", error);
  // Preserve the useful server-rendered page when optional enhancement fails.
});
