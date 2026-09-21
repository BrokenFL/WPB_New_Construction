import "./buyerConcierge.css";

type ConciergeContext = {
  path: string;
  project?: string;
  corridor?: string;
  plan?: string;
};

function contextForPath(pathname: string): ConciergeContext {
  const floorplan = pathname.match(/^\/floorplans\/([^/]+)\/([^/]+)\/?$/);
  if (floorplan) return { path: pathname, project: floorplan[1], plan: floorplan[2] };
  const project = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (project) return { path: pathname, project: project[1] };
  const corridor = pathname.match(/^\/corridors\/([^/]+)\/?$/);
  if (corridor) return { path: pathname, corridor: corridor[1] };
  return { path: pathname };
}

export function installBuyerConciergeLauncher() {
  if (document.querySelector("[data-buyer-concierge-root]")) return;

  const root = document.createElement("div");
  root.className = "buyer-concierge-root";
  root.dataset.buyerConciergeRoot = "";
  const dockLabel = document.createElement("p");
  dockLabel.className = "buyer-concierge-dock-label";
  dockLabel.hidden = true;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "buyer-concierge-launcher";
  button.textContent = "Ask WPB";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "Open Ask WPB buyer concierge");
  root.append(dockLabel, button);
  document.body.append(root);
  document.documentElement.classList.add("has-buyer-concierge");

  const mobileLayout = window.matchMedia("(max-width: 720px)");
  let lastPath = location.pathname;

  const dismissStalePanel = () => {
    root.querySelector<HTMLElement>("[data-buyer-concierge-panel]")?.remove();
    button.setAttribute("aria-expanded", "false");
    button.removeAttribute("aria-controls");
  };

  const mobileDockTarget = (pathname: string) => {
    if (!mobileLayout.matches) return null;
    if (/^\/$/.test(pathname)) {
      return document.querySelector<HTMLElement>('.route-view-home [data-home-hero-layer="active"]')
        ?.closest<HTMLElement>(".home-hero") ?? null;
    }
    const match = pathname.match(/^\/projects\/([^/]+)\/?$/);
    if (!match) return null;
    const projectId = CSS.escape(match[1]);
    return document.querySelector<HTMLElement>(
      `.route-view-editorial-showcase[data-project-id="${projectId}"] .berkeley-fact-strip`,
    );
  };

  const syncPlacement = () => {
    const pathname = location.pathname;
    if (pathname !== lastPath) {
      dismissStalePanel();
      lastPath = pathname;
    }

    const legacyPanel = document.querySelector<HTMLElement>("[data-chat-panel]");
    const legacyToggle = document.querySelector<HTMLElement>("[data-chat-toggle]");
    const foundLegacyControls = Boolean(legacyPanel || legacyToggle);
    legacyPanel?.remove();
    legacyToggle?.remove();

    const isInquiry = /^\/inquire\/?$/.test(pathname);
    const dockTarget = isInquiry ? null : mobileDockTarget(pathname);
    const isHomeDock = Boolean(dockTarget?.closest(".route-view-home"));
    root.classList.toggle("is-inquiry", isInquiry);
    root.classList.toggle("is-mobile-dock", Boolean(dockTarget));
    root.classList.toggle("is-home-dock", isHomeDock);
    root.classList.toggle("is-project-dock", Boolean(dockTarget) && !isHomeDock);
    root.classList.toggle("has-project-actions", Boolean(document.querySelector('a[href^="sms:"]')));

    dockLabel.hidden = !dockTarget;
    dockLabel.textContent = isHomeDock
      ? "Questions about these buildings?"
      : dockTarget
        ? "Questions about this building?"
        : "";

    if (dockTarget) {
      if (root.previousElementSibling !== dockTarget) dockTarget.insertAdjacentElement("afterend", root);
    } else if (isInquiry) {
      const footer = document.querySelector("footer");
      if (footer?.parentNode && root.nextElementSibling !== footer) footer.parentNode.insertBefore(root, footer);
    } else if (root.parentElement !== document.body) {
      document.body.append(root);
    }
    return foundLegacyControls;
  };

  const app = document.getElementById("app");
  let routeObserver: MutationObserver | null = null;
  let observedShell: HTMLElement | null = null;
  const watchRouteChanges = () => {
    const shell = document.querySelector<HTMLElement>(".site-shell");
    if (shell === observedShell) return;
    routeObserver?.disconnect();
    routeObserver = null;
    observedShell = shell;
    if (!shell) return;
    routeObserver = new MutationObserver(syncPlacement);
    routeObserver.observe(shell, {
      attributes: true,
      attributeFilter: ["data-active-route", "data-active-project"],
    });
  };

  syncPlacement();
  watchRouteChanges();
  if (app) {
    const appObserver = new MutationObserver(() => {
      syncPlacement();
      watchRouteChanges();
    });
    // The prerendered shell is replaced once hydration imports main.ts. Observe
    // only #app's direct children so map internals and normal route DOM changes
    // cannot cause launcher churn.
    appObserver.observe(app, { childList: true });
  }

  mobileLayout.addEventListener("change", syncPlacement);

  let opening = false;
  button.addEventListener("click", async () => {
    if (opening) return;
    opening = true;
    try {
      const { mountBuyerConcierge } = await import("./buyerConcierge.ts");
      if (!root.isConnected) document.body.append(root);
      mountBuyerConcierge(root, button, contextForPath(location.pathname));
    } finally {
      opening = false;
    }
  });
}
