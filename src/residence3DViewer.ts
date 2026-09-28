// Keep this structural so the approved manifest remains the sole source of
// model facts and this view can also be used by another residence surface.
import { rememberLeadAttribution } from "./lib/leadAttributionStore.ts";
export type Residence3DViewerModel = {
  modelId: string;
  projectId: string;
  residenceSlug: string;
  modelUrl: string;
  posterUrl: string;
  mobilePosterUrl?: string;
  status: "pending" | "approved";
  accessibilityLabel: string;
  camera?: {
    position?: [number, number, number];
    target?: [number, number, number];
    minDistance?: number;
    maxDistance?: number;
  };
};

export type Residence3DViewerContext = {
  path?: string;
  projectName?: string;
  residenceName?: string;
};

type ViewerElement = HTMLElement & { jumpCameraToGoal?: () => void };

function focusViewerControls(viewer: ViewerElement | undefined) {
  // model-viewer 4.x exposes keyboard controls on this accessible shadow
  // surface. Its host does not delegate focus; avoid adding a second tab stop.
  viewer?.shadowRoot?.querySelector<HTMLElement>('[role="img"][tabindex="0"]')?.focus({ preventScroll: true });
}

const e = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

function publicAsset(value: string) {
  return /^\/assets\/projects\/[a-z0-9/_\-.]+$/.test(value) && !value.includes("..") ? value : "";
}

function cameraAttributes(camera: Residence3DViewerModel["camera"]) {
  if (!camera) return 'camera-orbit="30deg 35deg auto"';
  const values = [camera.position, camera.target].flat().filter((value): value is number => typeof value === "number");
  if (values.some((value) => !Number.isFinite(value))) return "";
  const attrs: string[] = [];
  if (camera.target?.length === 3) attrs.push(`camera-target="${camera.target.map((value) => `${value}m`).join(" ")}"`);
  if (camera.position?.length === 3 && camera.target?.length === 3) {
    const [x, y, z] = camera.position.map((value, index) => value - camera.target![index]);
    const radius = Math.hypot(x, y, z);
    if (radius > 0) {
      const theta = Math.atan2(x, z) * 180 / Math.PI;
      const phi = Math.acos(Math.max(-1, Math.min(1, y / radius))) * 180 / Math.PI;
      attrs.push(`camera-orbit="${theta.toFixed(2)}deg ${phi.toFixed(2)}deg ${radius.toFixed(2)}m"`);
    }
  }
  if (camera.minDistance && Number.isFinite(camera.minDistance) && camera.minDistance > 0) attrs.push(`min-camera-orbit="auto auto ${camera.minDistance}m"`);
  if (camera.maxDistance && Number.isFinite(camera.maxDistance) && camera.maxDistance > 0) attrs.push(`max-camera-orbit="auto auto ${camera.maxDistance}m"`);
  if (!attrs.some((value) => value.startsWith("camera-orbit"))) attrs.push('camera-orbit="30deg 35deg auto"');
  return attrs.join(" ");
}

export function renderResidence3DViewer(model: Residence3DViewerModel, context: Residence3DViewerContext = {}): string {
  const poster = publicAsset(model.posterUrl);
  const mobilePoster = model.mobilePosterUrl ? publicAsset(model.mobilePosterUrl) : "";
  const source = publicAsset(model.modelUrl);
  if (!poster || !source || model.status !== "approved") return "";
  const path = context.path ?? `/floorplans/${model.projectId}/${model.residenceSlug}/`;
  const title = context.residenceName ?? `${context.projectName ?? model.projectId} ${model.residenceSlug}`;
  const id = `r3d-${model.modelId}`;
  return `<section class="r3d" data-residence-3d data-r3d-state="poster" data-r3d-model-id="${e(model.modelId)}" data-r3d-project-id="${e(model.projectId)}" data-r3d-residence-id="${e(model.residenceSlug)}" data-r3d-path="${e(path)}" data-r3d-src="${e(source)}" data-r3d-camera="${e(cameraAttributes(model.camera))}" data-r3d-alt="${e(model.accessibilityLabel)}" aria-labelledby="${e(id)}-title">
    <div class="r3d-heading"><div><p class="r3d-eyebrow">Residence perspective</p><h2 id="${e(id)}-title">Explore ${e(title)} in 3D</h2></div><span class="r3d-badge">Interactive model</span></div>
    <p class="r3d-description">Move around this conceptual model to understand the layout. Use the released drawing and current project documents for exact dimensions and details.</p>
    <div class="r3d-stage" data-r3d-stage>
      <div class="r3d-viewer-host" data-r3d-viewer-host></div>
      <div class="r3d-poster" data-r3d-poster><picture>${mobilePoster ? `<source media="(max-width: 650px)" srcset="${e(mobilePoster)}">` : ""}<img src="${e(poster)}" alt="${e(model.accessibilityLabel)}" loading="lazy" decoding="async"></picture><div class="r3d-poster-shade"></div><div class="r3d-start-wrap"><span>Walk around the residence</span><button class="r3d-start" data-r3d-start type="button" hidden>Explore in 3D <span aria-hidden="true">↗</span></button></div></div>
      <div class="r3d-stage-controls" data-r3d-controls hidden><button type="button" data-r3d-reset>Reset view</button><button type="button" data-r3d-fullscreen hidden>Full screen</button></div>
    </div>
    <div class="r3d-meta"><p class="r3d-status" data-r3d-status role="status" aria-live="polite">Model image. The released floor plan is available below.</p><p class="r3d-hint" data-r3d-hint hidden>Drag or use arrow keys to turn · Scroll or pinch to zoom · Page scroll remains available on touch.</p></div>
    <div class="r3d-footer"><span>For orientation only · Layout and finishes subject to the released plan</span><a href="/inquire/" data-r3d-action="availability">Ask about this residence <span aria-hidden="true">→</span></a></div>
  </section>`;
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function trackViewerEvent(eventName: string, payload: Record<string, string | undefined>) {
  void import("./lib/analytics.ts").then(({ track }) => track(eventName, payload)).catch(() => {});
}

function installViewer(section: HTMLElement, onTrack: (eventName: string, payload: Record<string, string | undefined>) => void) {
  const start = section.querySelector<HTMLButtonElement>("[data-r3d-start]");
  const poster = section.querySelector<HTMLElement>("[data-r3d-poster]");
  const host = section.querySelector<HTMLElement>("[data-r3d-viewer-host]");
  const stage = section.querySelector<HTMLElement>("[data-r3d-stage]");
  const controls = section.querySelector<HTMLElement>("[data-r3d-controls]");
  const status = section.querySelector<HTMLElement>("[data-r3d-status]");
  const hint = section.querySelector<HTMLElement>("[data-r3d-hint]");
  const reset = section.querySelector<HTMLButtonElement>("[data-r3d-reset]");
  const fullScreen = section.querySelector<HTMLButtonElement>("[data-r3d-fullscreen]");
  if (!start || !poster || !host || !stage || !controls || !status || !hint || !reset || !fullScreen) return;
  if (section.dataset.r3dMounted === "true") return;
  section.dataset.r3dMounted = "true";
  const payload = () => ({
    projectId: section.dataset.r3dProjectId,
    modelId: section.dataset.r3dModelId,
    residenceId: section.dataset.r3dResidenceId,
    path: section.dataset.r3dPath,
    placement: "residence-3d",
    source: section.dataset.r3dState === "ready" ? "3d-loaded" : "3d-poster",
  });
  const canFullScreen = Boolean(document.fullscreenEnabled && stage.requestFullscreen);
  section.querySelector<HTMLAnchorElement>('[data-r3d-action="availability"]')?.addEventListener("click", () => {
    const leadContext = `floorplan:${section.dataset.r3dProjectId}:${section.dataset.r3dResidenceId}`;
    rememberLeadAttribution({ cta_context: leadContext, cta_label: "Ask about this residence", cta_location: "residence-3d" }, { replaceRequest: true });
    onTrack("residence_3d_cta", { ...payload(), ctaText: "Ask about this residence", leadCaptureContext: leadContext });
  });
  if (!canUseWebGL()) {
    status.textContent = "3D is unavailable in this browser. The model image and released floor plan are still available.";
    section.dataset.r3dState = "unsupported";
    return;
  }
  start.hidden = false;
  status.textContent = "Select Explore in 3D to load the interactive model.";
  let token = 0;
  let timer: number | undefined;
  let viewer: ViewerElement | undefined;
  const fail = (message: string, reload = false) => {
    window.clearTimeout(timer);
    token++;
    viewer?.remove();
    viewer = undefined;
    controls.hidden = true;
    hint.hidden = true;
    poster.hidden = false;
    start.hidden = false;
    start.innerHTML = reload ? 'Reload to try 3D again <span aria-hidden="true">↗</span>' : 'Try 3D again <span aria-hidden="true">↗</span>';
    status.textContent = `${message} You can still use the model image and released floor plan.`;
    section.dataset.r3dState = "error";
    section.dataset.r3dRetry = reload ? "reload" : "retry";
    start.focus();
  };
  start.addEventListener("click", async () => {
    if (section.dataset.r3dRetry === "reload") { window.location.reload(); return; }
    if (section.dataset.r3dState === "loading" || section.dataset.r3dState === "ready") return;
    const attempt = ++token;
    section.dataset.r3dState = "loading";
    start.hidden = true;
    status.tabIndex = -1;
    status.focus();
    status.textContent = "Preparing the 3D viewer…";
    onTrack("residence_3d_open", payload());
    timer = window.setTimeout(() => { if (attempt === token) fail("The 3D model took too long to load."); }, 75000);
    try {
      // model-viewer reads this configuration at module evaluation. The self-hosted
      // decoder is fetched only if an activated GLB uses Meshopt compression.
      const global = window as Window & { ModelViewerElement?: { meshoptDecoderLocation?: string } };
      global.ModelViewerElement = { ...global.ModelViewerElement, meshoptDecoderLocation: "/assets/vendor/meshopt_decoder.js" };
      await import("@google/model-viewer");
      if (attempt !== token) return;
      viewer = document.createElement("model-viewer") as ViewerElement;
      viewer.className = "r3d-model";
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("touch-action", "pan-y");
      viewer.setAttribute("interaction-prompt", "none");
      viewer.setAttribute("loading", "eager");
      viewer.setAttribute("alt", section.dataset.r3dAlt ?? "Interactive residence model");
      viewer.setAttribute("shadow-intensity", "0.65");
      const camera = section.dataset.r3dCamera ?? "";
      for (const attribute of camera.matchAll(/([a-z-]+)="([^"]*)"/g)) viewer.setAttribute(attribute[1], attribute[2]);
      viewer.addEventListener("progress", (event) => {
        if (attempt !== token || section.dataset.r3dState !== "loading") return;
        const value = (event as unknown as CustomEvent<{ totalProgress?: number }>).detail?.totalProgress;
        if (typeof value === "number" && Number.isFinite(value)) status.textContent = `Loading 3D model… ${Math.min(100, Math.max(0, Math.round(value * 100)))}%`;
      });
      viewer.addEventListener("load", () => {
        if (attempt !== token) return;
        window.clearTimeout(timer);
        poster.hidden = true;
        controls.hidden = false;
        fullScreen.hidden = !canFullScreen;
        hint.hidden = false;
        status.textContent = "3D model ready. Drag or use arrow keys to explore.";
        section.dataset.r3dState = "ready";
        focusViewerControls(viewer);
        onTrack("residence_3d_loaded", payload());
      }, { once: true });
      // The load event can precede the library revealing its keyboard surface.
      // Transfer focus after that reveal as well, without timers or a tab stop
      // on the non-interactive custom-element host.
      viewer.addEventListener("poster-dismissed", () => {
        if (attempt === token) focusViewerControls(viewer);
      }, { once: true });
      viewer.addEventListener("error", () => { if (attempt === token) fail("The 3D model could not be opened."); }, { once: true });
      host.replaceChildren(viewer);
      // model-viewer retains rejected loads by URL. A new key on an explicit
      // retry recovers without depending on its private cache implementation.
      const source = new URL(section.dataset.r3dSrc ?? "", window.location.href);
      if (attempt > 1) source.searchParams.set("r3d-retry", String(attempt));
      viewer.setAttribute("src", source.href);
    } catch {
      if (attempt === token) fail("The 3D viewer could not start. Reload the page to try again.", true);
    }
  });
  reset.addEventListener("click", () => {
    if (!viewer) return;
    for (const name of ["camera-orbit", "camera-target", "field-of-view"]) {
      const initial = (section.dataset.r3dCamera ?? "").match(new RegExp(`${name}="([^"]*)"`))?.[1];
      if (initial) viewer.setAttribute(name, initial);
      else viewer.removeAttribute(name);
    }
    viewer.jumpCameraToGoal?.();
    focusViewerControls(viewer);
  });
  fullScreen.addEventListener("click", async () => {
    if (!canFullScreen) return;
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else { await stage.requestFullscreen(); onTrack("residence_3d_fullscreen", payload()); }
    } catch { status.textContent = "Full screen is unavailable here. You can continue exploring in the page."; }
  });
  document.addEventListener("fullscreenchange", () => {
    fullScreen.textContent = document.fullscreenElement === stage ? "Exit full screen" : "Full screen";
  });
}

export function mountResidence3DViewers(root: ParentNode = document, onTrack = trackViewerEvent) {
  root.querySelectorAll<HTMLElement>("[data-residence-3d]").forEach((section) => installViewer(section, onTrack));
}
