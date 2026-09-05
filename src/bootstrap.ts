import "./style.css";
import "./floorplanEntities.css";
import { wireFloorplanInquiryContext } from "./lib/floorplanInquiry.ts";
import { cleanFloorplanPath, mergeFloorplanDiscoverySchema, floorplanForPath, floorplanJson, renderFloorplanDiscovery } from "./lib/floorplanEntities.ts";

async function start() {
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
  const { track } = await import("./lib/analytics.ts");
  const syncFloorplanInquiry = wireFloorplanInquiryContext(app);

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
  observer.observe(app, { childList: true, subtree: true });
  window.addEventListener("popstate", refresh);
  refresh();
}

start().catch((error: unknown) => {
  console.error("Unable to initialize the page", error);
  // Preserve the useful server-rendered page when optional enhancement fails.
});
