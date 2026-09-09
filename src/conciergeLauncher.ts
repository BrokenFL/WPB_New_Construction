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
    document.querySelector<HTMLElement>("[data-chat-panel]")?.remove();
    document.querySelector<HTMLElement>("[data-chat-toggle]")?.remove();
    root.classList.toggle("has-project-actions", Boolean(document.querySelector('a[href^="sms:"]')));
    if (root.classList.contains("is-inquiry")) {
      const footer = document.querySelector("footer");
      if (footer?.parentNode && root.nextElementSibling !== footer) footer.parentNode.insertBefore(root, footer);
    }
  };
  syncOwnedControls();
  const observer = new MutationObserver(syncOwnedControls);
  observer.observe(document.body, { childList: true, subtree: true });

  let opening = false;
  button.addEventListener("click", async () => {
    if (opening) return;
    opening = true;
    try {
      const { mountBuyerConcierge } = await import("./buyerConcierge.ts");
      mountBuyerConcierge(root, button, contextForPath(location.pathname));
    } finally {
      opening = false;
    }
  });
}
