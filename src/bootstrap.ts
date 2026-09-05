import "./style.css";
import "./floorplanEntities.css";
import { cleanFloorplanPath, discoverySchema, floorplanForPath, floorplanJson, renderFloorplanDiscovery } from "./lib/floorplanEntities.ts";

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
    const path = cleanFloorplanPath(window.location.pathname);
    const old = app.querySelector<HTMLElement>("#wpb-floorplan-guides");
    const html = renderFloorplanDiscovery(path);
    if (!html) {
      old?.remove();
      document.getElementById("wpb-floorplan-index-schema")?.remove();
      return;
    }
    if (old?.dataset.page === path) return;
    old?.remove();
    (app.querySelector("main") ?? app).insertAdjacentHTML("beforeend", html);
    let schema = document.getElementById("wpb-floorplan-index-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "wpb-floorplan-index-schema";
      schema.setAttribute("type", "application/ld+json");
      document.head.append(schema);
    }
    schema.textContent = floorplanJson(discoverySchema(path));
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
