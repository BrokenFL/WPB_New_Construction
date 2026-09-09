type Contributor = {
  id: string; schemaId: string; name: string; role: string; license: string; team: string; brokerage: string;
  geographicFocus: string[]; expertise: string[]; bio: string; profileUrl: string; sameAs: string[];
};
type Assignment = { author?: string; reviewer?: string; updatedOn?: string; reviewedOn?: string };
type Registry = {
  methodologyUrl: string; aboutUrl: string;
  organization: { id: string; name: string; type: string; url: string };
  contributors: Contributor[]; assignmentPolicy: Record<string, Assignment>; routeAssignments?: Record<string, Assignment>;
};

const staticSchemaId = "wpb-static-structured-data";
const trustId = "wpb-authorship-trust";
const profilesId = "wpb-contributor-profiles";
let registryPromise: Promise<Registry | null> | null = null;

function cleanPath(pathname: string) { const normalized = pathname.replace(/\/+/g, "/"); return normalized.endsWith("/") ? normalized : `${normalized}/`; }
function routeFamily(pathname: string) {
  const path = cleanPath(pathname);
  if (path === "/about/") return "about"; if (path === "/methodology/") return "methodology"; if (path === "/compare/") return "compare";
  if (/^\/projects\/[^/]+\/$/.test(path)) return "project"; if (/^\/corridors\/[^/]+\/$/.test(path)) return "corridor";
  if (/^\/answers\/[^/]+\/$/.test(path)) return "answer"; if (/^\/updates\/[^/]+\/$/.test(path)) return "update";
  if (/^\/market-notes\/[^/]+\/$/.test(path)) return "market-note"; if (/^\/downtown-spotlight\/[^/]+\/$/.test(path)) return "downtown-spotlight"; return "";
}
function assignmentFor(registry: Registry, pathname: string, family: string): Assignment { const path = cleanPath(pathname); return registry.routeAssignments?.[path] ?? registry.assignmentPolicy[family] ?? {}; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }
function contributorById(registry: Registry, id?: string) { return id ? registry.contributors.find((item) => item.id === id) : undefined; }
function humanDate(value?: string) { if (!value) return ""; const date = new Date(`${value}T00:00:00Z`); return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }); }
function isRendered(element: HTMLElement) { if (element.hidden || element.closest("[hidden]")) return false; const style = window.getComputedStyle(element); return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0; }
function activeRouteMain(app: HTMLElement) { return Array.from(app.querySelectorAll<HTMLElement>("main")).find(isRendered) ?? null; }
function visibleTrustHtml(registry: Registry, assignment: Assignment, path: string) {
  const author = contributorById(registry, assignment.author); const reviewer = contributorById(registry, assignment.reviewer); if (!author && !reviewer) return ""; const parts: string[] = [];
  if (author) parts.push(`Written by <a href="${escapeHtml(author.profileUrl)}">${escapeHtml(author.name)}</a>`); if (reviewer) parts.push(`Reviewed by <a href="${escapeHtml(reviewer.profileUrl)}">${escapeHtml(reviewer.name)}</a>`);
  if (assignment.reviewedOn) parts.push(`Reviewed ${escapeHtml(humanDate(assignment.reviewedOn))}`); else if (assignment.updatedOn) parts.push(`Updated ${escapeHtml(humanDate(assignment.updatedOn))}`);
  return `<aside id="${trustId}" data-path="${escapeHtml(path)}" class="wpb-authorship-trust" aria-label="Editorial responsibility"><div class="wpb-authorship-trust__people">${parts.join(" <span aria-hidden=\"true\">·</span> ")}</div><div class="wpb-authorship-trust__method"><a href="/methodology/">How we verify project information</a></div></aside>`;
}
function profileHtml(c: Contributor) { return `<article id="${escapeHtml(c.id)}" class="wpb-contributor-profile"><h3>${escapeHtml(c.name)}</h3><p class="wpb-contributor-profile__role">${escapeHtml(c.role)} · ${escapeHtml(c.team)} · ${escapeHtml(c.brokerage)}</p><p>${escapeHtml(c.bio)}</p><p><strong>Focus:</strong> ${c.geographicFocus.map(escapeHtml).join(", ")} · <strong>Areas:</strong> ${c.expertise.map(escapeHtml).join(", ")}</p><p><strong>Florida license:</strong> ${escapeHtml(c.license)} · <a href="${escapeHtml(c.sameAs[0] || c.profileUrl)}" rel="noopener noreferrer">Douglas Elliman profile</a></p></article>`; }
function profilesHtml(registry: Registry) { return `<section id="${profilesId}" class="wpb-contributor-profiles" aria-labelledby="wpb-contributor-profiles-title"><h2 id="wpb-contributor-profiles-title">Real-person contributor profiles</h2><p>WPB New Construction names a writer or reviewer only where that responsibility is actually assigned. Project facts are assembled from official and public sources; current pricing, availability, incentives, fees and contract terms still require direct confirmation.</p><div class="wpb-contributor-profiles__grid">${registry.contributors.map(profileHtml).join("")}</div><p><a href="/methodology/">Read the source and review methodology</a></p></section>`; }
function personNode(registry: Registry, c: Contributor): Record<string, unknown> { return { "@type": "Person", "@id": c.schemaId, name: c.name, url: c.profileUrl, jobTitle: c.role, worksFor: { "@id": registry.organization.id }, knowsAbout: c.expertise, areaServed: c.geographicFocus, sameAs: c.sameAs }; }
function mergeCanonicalSchema(registry: Registry, assignment: Assignment, family: string) {
  const script = document.getElementById(staticSchemaId) as HTMLScriptElement | null; if (!script?.textContent) return;
  const schema = JSON.parse(script.textContent) as { "@graph"?: Record<string, unknown>[] }; const graph = schema["@graph"]; if (!Array.isArray(graph)) return;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || `${location.origin}${cleanPath(location.pathname)}`;
  const page = graph.find((node) => node["@id"] === `${canonical}#webpage`) ?? graph.find((node) => { const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]; return types.some((type) => typeof type === "string" && (type === "WebPage" || type === "AboutPage" || type === "CollectionPage" || type.endsWith("Page"))); });
  if (!page) return; const author = contributorById(registry, assignment.author); const reviewer = contributorById(registry, assignment.reviewer);
  if (author) page.author = { "@id": author.schemaId }; else delete page.author; if (reviewer) page.reviewedBy = { "@id": reviewer.schemaId }; else delete page.reviewedBy;
  if (assignment.reviewedOn || assignment.updatedOn) page.dateModified = assignment.reviewedOn || assignment.updatedOn;
  const people = family === "about" ? registry.contributors : [author, reviewer].filter(Boolean) as Contributor[];
  for (const person of people) { const existing = graph.find((node) => node["@id"] === person.schemaId); if (existing) Object.assign(existing, personNode(registry, person)); else graph.push(personNode(registry, person)); }
  script.textContent = JSON.stringify(schema);
}
async function loadRegistry(): Promise<Registry | null> { if (!registryPromise) registryPromise = fetch("/data/contributors.json", { credentials: "same-origin" }).then(async (response) => response.ok ? await response.json() as Registry : null).catch(() => null); return registryPromise; }
function mountForCurrentRoute(app: HTMLElement, registry: Registry) {
  const family = routeFamily(location.pathname); const path = cleanPath(location.pathname); const main = activeRouteMain(app); if (!main) return false;
  document.getElementById(trustId)?.remove(); document.getElementById("wpb-authorship-schema")?.remove(); const existingProfiles = document.getElementById(profilesId); if (existingProfiles && !main.contains(existingProfiles)) existingProfiles.remove(); if (!family) return true;
  const assignment = assignmentFor(registry, path, family); const trustHtml = visibleTrustHtml(registry, assignment, path);
  if (trustHtml) { const h1 = Array.from(main.querySelectorAll<HTMLElement>("h1")).find(isRendered) ?? main.querySelector("h1"); const insertionTarget = h1?.closest("section, header, article") ?? h1; if (insertionTarget) insertionTarget.insertAdjacentHTML("afterend", trustHtml); else main.insertAdjacentHTML("afterbegin", trustHtml); }
  if (family === "about" && !main.querySelector(`#${profilesId}`)) main.insertAdjacentHTML("beforeend", profilesHtml(registry));
  if (assignment.author || assignment.reviewer || family === "about") mergeCanonicalSchema(registry, assignment, family); return true;
}
export async function installAuthorshipTrust(app: HTMLElement) {
  const registry = await loadRegistry(); if (!registry) return; let scheduled = false;
  const refresh = () => { if (scheduled) return; scheduled = true; queueMicrotask(() => { scheduled = false; const main = activeRouteMain(app); if (!main) return; const current = document.getElementById(trustId); const path = cleanPath(location.pathname); if (current?.dataset.path === path && main.contains(current) && isRendered(current)) return; mountForCurrentRoute(app, registry); }); };
  const observer = new MutationObserver(refresh); observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class", "style", "aria-hidden"] }); window.addEventListener("popstate", refresh); refresh();
}
