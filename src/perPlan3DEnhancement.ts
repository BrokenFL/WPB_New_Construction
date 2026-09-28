import "./perPlan3DEnhancement.css";
import { mountResidence3DViewers } from "./residence3DViewer.ts";

export function mountPerPlan3D() {
  const view = document.querySelector<HTMLElement>('[data-route-view="floorplan-plan-detail"]:not([hidden])');
  if (view) mountResidence3DViewers(view);
}
