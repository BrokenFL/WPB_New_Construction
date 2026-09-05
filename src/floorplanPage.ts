import { track } from "./lib/analytics.ts";
import { captureLeadLandingContext, rememberLeadAttribution } from "./lib/leadCapture.ts";
import { floorplanDescription, floorplanJson, floorplanSchema, floorplanTitle, renderFloorplanPage, type FloorplanEntity } from "./lib/floorplanEntities.ts";

export function mountFloorplanPage(plan: FloorplanEntity) {
  const app = document.getElementById("app");
  if (!app) throw new Error("Missing page container");
  document.title = floorplanTitle(plan);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", plan.canonical);
  for (const [selector, content] of [
    ['meta[name="description"]', floorplanDescription(plan)],
    ['meta[property="og:title"]', floorplanTitle(plan)],
    ['meta[property="og:description"]', floorplanDescription(plan)],
    ['meta[property="og:url"]', plan.canonical],
    ['meta[property="og:image"]', `https://www.wpbnewconstruction.com${plan.preview}`],
    ['meta[name="twitter:title"]', floorplanTitle(plan)],
    ['meta[name="twitter:description"]', floorplanDescription(plan)],
    ['meta[name="twitter:image"]', `https://www.wpbnewconstruction.com${plan.preview}`],
  ]) document.querySelector(selector)?.setAttribute("content", content);
  document.getElementById("wpb-static-structured-data")?.remove();
  let schema = document.getElementById("wpb-floorplan-schema");
  if (!schema) {
    schema = document.createElement("script");
    schema.id = "wpb-floorplan-schema";
    schema.setAttribute("type", "application/ld+json");
    document.head.append(schema);
  }
  schema.textContent = floorplanJson(floorplanSchema(plan));
  if (app.querySelector<HTMLElement>("[data-floorplan-id]")?.dataset.floorplanId !== plan.planId) app.innerHTML = renderFloorplanPage(plan);
  captureLeadLandingContext();
  track("page_view", { route: "floorplan", path: plan.path, projectId: plan.projectId });
  app.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-fp-action]") : null;
    if (!link) return;
    const context = { path: plan.path, projectSlug: plan.projectId, projectName: plan.projectName, pageType: "floorplan", location: "floorplan-entity" };
    switch (link.dataset.fpAction) {
      case "pdf":
        track("floor_plan_click", { buildingSlug: plan.projectId, planName: plan.planName, path: plan.path });
        break;
      case "source":
        track("source_click", { buildingSlug: plan.projectId, sourceHost: new URL(link.href).hostname, path: plan.path });
        break;
      case "compare":
        track("compare_opened", { path: "/compare/", sourcePath: plan.path, projectSlug: plan.projectId });
        break;
      case "availability": {
        const leadContext = `floorplan:${plan.projectId}:${plan.slug}`;
        rememberLeadAttribution({ cta_context: leadContext, cta_label: "Request current availability", cta_location: "floorplan-entity", corridor: "north-flagler" });
        track("cta_click", { ...context, ctaText: "Request current availability", leadCaptureContext: leadContext });
        break;
      }
    }
  });
}
