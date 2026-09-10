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
  if (/^\/inquire\/?$/.test(location.pathname)) root.classList.add("is-inquiry");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "buyer-concierge-launcher";
  button.textContent = "Ask WPB";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "Open Ask WPB buyer concierge");
  root.append(button);
  document.body.append(root);
  document.documentElement.classList.add("has-buyer-concierge");

  const syncOwnedControls = () => {
    const legacyPanel = document.querySelector<HTMLElement>("[data-chat-panel]");
    const legacyToggle = document.querySelector<HTMLElement>("[data-chat-toggle]");
    const foundLegacyControls = Boolean(legacyPanel || legacyToggle);
    legacyPanel?.remove();
    legacyToggle?.remove();
    root.classList.toggle("has-project-actions", Boolean(document.querySelector('a[href^="sms:"]')));
    if (root.classList.contains("is-inquiry")) {
      const footer = document.querySelector("footer");
      if (footer?.parentNode && root.nextElementSibling !== footer) footer.parentNode.insertBefore(root, footer);
    }
    return foundLegacyControls;
  };

  const app = document.getElementById("app");
  const appRendered = () => Boolean(app?.childElementCount);
  const foundLegacyControls = syncOwnedControls();
  if (!foundLegacyControls && !appRendered()) {
    const observer = new MutationObserver((mutations) => {
      // This observer exists only to bridge the short interval before the legacy
      // route renders. Once #app is populated there is nothing left to discover,
      // so disconnect before third-party widgets can create long-lived DOM churn.
      const onlyMapInternals = mutations.length > 0 && mutations.every((mutation) =>
        mutation.target instanceof Element && Boolean(mutation.target.closest("[data-hero-google-map]")),
      );
      if (onlyMapInternals) return;
      const found = syncOwnedControls();
      if (found || appRendered()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

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
