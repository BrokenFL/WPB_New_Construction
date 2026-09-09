type Contributor = {
  id: string;
  schemaId: string;
  name: string;
  role: string;
  license: string;
  team: string;
  brokerage: string;
  geographicFocus: string[];
  expertise: string[];
  bio: string;
  profileUrl: string;
  sameAs: string[];
};

type Assignment = { author?: string; reviewer?: string; updatedOn?: string; reviewedOn?: string };
type Registry = {
  methodologyUrl: string;
  aboutUrl: string;
  organization: { id: string; name: string; type: string; url: string };
  contributors: Contributor[];
  assignmentPolicy: Record<string, Assignment>;
  routeAssignments?: Record<string, Assignment>;
};

const schemaScriptId = "wpb-authorship-schema";
const trustId = "wpb-authorship-trust";
const profilesId = "wpb-contributor-profiles";
let registryPromise: Promise<Registry | null> | null = null;

function cleanPath(pathname: string) {
  const normalized = pathname.replace(/\/+/g, "/");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function routeFamily(pathname: string) {
  const path = cleanPath(pathname);
  if (path === "/about/") return "about";
  if (path === "/methodology/") return "methodology";
  if (path === "/compare/") return "compare";
  if (/^\/projects\/[^/]+\/$/.test(path)) return "project";
  if (/^\/corridors\/[^/]+\/$/.test(path)) return "corridor";
  if (/^\/answers\/[^/]+\/$/.test(path)) return "answer";
  if (/^\/updates\/[^/]+\/$/.test(path)) return "update";
  if (/^\/market-notes\/[^/]+\/$/.test(path)) return "market-note";
  if (/^\/downtown-spotlight\/[^/]+\/$/.test(path)) return "downtown-spotlight";
  return "";
}

function assignmentFor(registry: Registry, pathname: string, family: string): Assignment {
  const path = cleanPath(pathname);
  return registry.routeAssignments?.[path] ?? registry.assignmentPolicy[family] ?? {};
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function contributorById(registry: Registry, id?: string) {
  return id ? registry.contributors.find((item) => item.id === id) : undefined;
}

function humanDate(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function canonicalUrl() {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  return canonical || `${location.origin}${cleanPath(location.pathname)}`;
}

function isRendered(element: HTMLElement) {
  if (element.hidden || element.closest("[hidden]")) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return element.getClientRects().length > 0;
}

function activeRouteMain(app: HTMLElement) {
  return Array.from(app.querySelectorAll<HTMLElement>("main")).find(isRendered) ?? null;
}

function visibleTrustHtml(registry: Registry, assignment: Assignment, path: string) {
  const author = contributorById(registry, assignment.author);
  const reviewer = contributorById(registry, assignment.reviewer);
  if (!author && !reviewer) return "";
  const parts: string[] = [];
  if (author) parts.push(`Written by <a href="${escapeHtml(author.profileUrl)}">${escapeHtml(author.name)}</a>`);
  if (reviewer) parts.push(`Reviewed by <a href="${escapeHtml(reviewer.profileUrl)}">${escapeHtml(reviewer.name)}</a>`);
  if (assignment.reviewedOn) parts.push(`Reviewed ${escapeHtml(humanDate(assignment.reviewedOn))}`);
  else if (assignment.updatedOn) parts.push(`Updated ${escapeHtml(humanDate(assignment.updatedOn))}`);
  return `<aside id="${trustId}" data-path="${escapeHtml(path)}" class="wpb-authorship-trust" aria-label="Editorial responsibility">
    <div class="wpb-authorship-trust__people">${parts.join(" <span aria-hidden=\"true\">·</span> ")}</div>
    <div class="wpb-authorship-trust__method"><a href="/methodology/">How we verify project information</a></div>
  </aside>`;
}

function profileHtml(contributor: Contributor) {
  return `<article id="${escapeHtml(contributor.id)}" class="wpb-contributor-profile">
    <h3>${escapeHtml(contributor.name)}</h3>
    <p class="wpb-contributor-profile__role">${escapeHtml(contributor.role)} · ${escapeHtml(contributor.team)} · ${escapeHtml(contributor.brokerage)}</p>
    <p>${escapeHtml(contributor.bio)}</p>
    <p><strong>Focus:</strong> ${contributor.geographicFocus.map(escapeHtml).join(", ")} · <strong>Areas:</strong> ${contributor.expertise.map(escapeHtml).join(", ")}</p>
    <p><strong>Florida license:</strong> ${escapeHtml(contributor.license)} · <a href="${escapeHtml(contributor.sameAs[0] || contributor.profileUrl)}" rel="noopener noreferrer">Douglas Elliman profile</a></p>
  </article>`;
}

function profilesHtml(registry: Registry) {
  return `<section id="${profilesId}" class="wpb-contributor-profiles" aria-labelledby="wpb-contributor-profiles-title">
    <h2 id="wpb-contributor-profiles-title">Real-person contributor profiles</h2>
    <p>WPB New Construction names a writer or reviewer only where that responsibility is actually assigned. Project facts are assembled from official and public sources; current pricing, availability, incentives, fees and contract terms still require direct confirmation.</p>
    <div class="wpb-contributor-profiles__grid">${registry.contributors.map(profileHtml).join("")}</div>
    <p><a href="/methodology/">Read the source and review methodology</a></p>
  </section>`;
}

function schemaFor(registry: Registry, assignment: Assignment, family: string) {
  const url = canonicalUrl();
  const pageRef: Record<string, unknown> = {
    "@type": family === "about" ? "AboutPage" : "WebPage",
    "@id": `${url}#authorship-webpage`,
    url,
    isPartOf: { "@id": "https://www.wpbnewconstruction.com/#website" },
  };
  const author = contributorById(registry, assignment.author);
  const reviewer = contributorById(registry, assignment.reviewer);
  if (author) pageRef.author = { "@id": author.schemaId };
  if (reviewer) pageRef.reviewedBy = { "@id": reviewer.schemaId };
  if (assignment.reviewedOn || assignment.updatedOn) pageRef.dateModified = assignment.reviewedOn || assignment.updatedOn;

  const graph: Record<string, unknown>[] = [pageRef];
  if (family === "about") {
    for (const contributor of registry.contributors) {
      graph.push({
        "@type": "Person",
        "@id": contributor.schemaId,
        name: contributor.name,
        url: contributor.profileUrl,
        jobTitle: contributor.role,
        worksFor: { "@id": registry.organization.id },
        knowsAbout: contributor.expertise,
        areaServed: contributor.geographicFocus,
        sameAs: contributor.sameAs,
      });
    }
    graph.push({
      "@type": registry.organization.type,
      "@id": registry.organization.id,
      name: registry.organization.name,
      url: registry.organization.url,
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

async function loadRegistry(): Promise<Registry | null> {
  if (!registryPromise) {
    registryPromise = fetch("/data/contributors.json", { credentials: "same-origin" })
      .then(async (response) => response.ok ? await response.json() as Registry : null)
      .catch(() => null);
  }
  return registryPromise;
}

function mountForCurrentRoute(app: HTMLElement, registry: Registry) {
  const family = routeFamily(location.pathname);
  const path = cleanPath(location.pathname);
  const main = activeRouteMain(app);
  if (!main) return false;

  document.getElementById(trustId)?.remove();
  document.getElementById(schemaScriptId)?.remove();
  const existingProfiles = document.getElementById(profilesId);
  if (existingProfiles && !main.contains(existingProfiles)) existingProfiles.remove();
  if (!family) return true;

  const assignment = assignmentFor(registry, path, family);
  const trustHtml = visibleTrustHtml(registry, assignment, path);
  if (trustHtml) {
    const h1 = Array.from(main.querySelectorAll<HTMLElement>("h1")).find(isRendered) ?? main.querySelector("h1");
    const insertionTarget = h1?.closest("section, header, article") ?? h1;
    if (insertionTarget) insertionTarget.insertAdjacentHTML("afterend", trustHtml);
    else main.insertAdjacentHTML("afterbegin", trustHtml);
  }

  if (family === "about" && !main.querySelector(`#${profilesId}`)) {
    main.insertAdjacentHTML("beforeend", profilesHtml(registry));
  }

  if (!assignment.author && !assignment.reviewer && family !== "about") return true;
  const script = document.createElement("script");
  script.id = schemaScriptId;
  script.type = "application/ld+json";
  script.dataset.authorshipPath = path;
  script.textContent = JSON.stringify(schemaFor(registry, assignment, family));
  document.head.appendChild(script);
  return true;
}

export async function installAuthorshipTrust(app: HTMLElement) {
  const registry = await loadRegistry();
  if (!registry) return;
  let scheduled = false;
  const refresh = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      const main = activeRouteMain(app);
      if (!main) return;
      const current = document.getElementById(trustId);
      const path = cleanPath(location.pathname);
      if (current?.dataset.path === path && main.contains(current) && isRendered(current)) return;
      mountForCurrentRoute(app, registry);
    });
  };
  const observer = new MutationObserver(refresh);
  observer.observe(app, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "class", "style", "aria-hidden"],
  });
  window.addEventListener("popstate", refresh);
  refresh();
}
