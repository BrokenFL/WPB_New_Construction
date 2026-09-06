import { approvedFloorplanLibrary, type ApprovedFloorplanProject } from "../data/floorplanApprovedLibrary.ts";
import { teamProfile } from "./contact.ts";

export const floorplanSiteUrl = "https://www.wpbnewconstruction.com";

// Curated publication allowlist, not a second inventory feed. Facts stay in the
// approved library; snapshots below make unreviewed source changes fail closed.
const reviewedPlans = [
  {
    projectId: "olara", slug: "residence-d", version: "v01", areaDifference: 0, areaNote: "",
    pdf: "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-d-v01.pdf",
    preview: "/assets/projects/olara/floorplans/previews/olara-floorplans-olara-floorplan-s-digital-31126-d-v01.jpg",
    sourceUrl: "https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf",
    sourcePage: "https://www.olarawestpalmbeach.com/floorplans",
    reviewedOn: "2026-09-05", updatedOn: "2026-09-05",
    sourceNote: "Released developer residence plan. The document does not establish current availability or a guaranteed completion date.",
    expected: { title: "Residence D", bedrooms: "2 + den", bathrooms: "2 + powder", interiorSqFt: "1774", terraceSqFt: "381", totalSqFt: "2155", detail: "Floors 7-26" },
    summary: "Olara Residence D pairs two bedrooms with a separately labeled den. The released drawing lists 1,774 square feet of interior space and 381 square feet of exterior space, for 2,155 square feet in total.",
    readingNote: "Keep the den separate from the bedroom count when comparing layouts. The drawing identifies two bathrooms and a powder room; the exterior area is not additional indoor living area. The floor range printed on the plan describes the layout reference, not a list of residences currently for sale.",
  },
  {
    projectId: "alba-palm-beach", slug: "residence-d", version: "v01", areaDifference: 10,
    areaNote: "The source reports 2,374 total square feet, while 1,786 interior plus 578 terrace square feet adds to 2,364. Confirm the developer’s area schedule before comparing price per square foot.",
    pdf: "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-d-v01.pdf",
    preview: "/assets/projects/alba-palm-beach/floorplans/previews/alba-floorplans-residence-d-v01.jpg",
    sourceUrl: "https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf",
    sourcePage: "https://www.albapalmbeach.com/residences",
    reviewedOn: "2026-09-05", updatedOn: "2026-09-05",
    sourceNote: "The developer source PDF is marked REV. 8/2022. This is a released layout reference, not confirmation that the drawing remains unchanged. Request the current drawing and offering documents before relying on it.",
    expected: { title: "Residence D", bedrooms: "3", bathrooms: "3", interiorSqFt: "1786", terraceSqFt: "578", totalSqFt: "2374", detail: "Floors 7 - 18" },
    summary: "Alba Palm Beach Residence D is a three-bedroom, three-bathroom layout in the released developer drawing. It lists 1,786 interior square feet and 578 terrace square feet, and reports a total of 2,374 square feet. See the area clarification below.",
    readingNote: "Compare the interior and terrace areas separately: the published total includes outdoor space. The source identifies floors 7 through 18, but a floor-plan reference does not establish whether a particular residence is available. This PDF carries an August 2022 revision, so confirming the latest drawing is an important part of a current comparison.",
  },
] as const;

export type FloorplanEntity = {
  planId: string; projectId: string; projectName: string; slug: string; version: string;
  path: string; canonical: string; planName: string; pdf: string; preview: string;
  sourceUrl: string; sourcePage: string; sourceNote: string;
  reviewedOn: string; updatedOn: string; bedrooms: string; bathrooms: string;
  interiorSqFt: number; terraceSqFt: number; totalSqFt: number; floors: string;
  summary: string; readingNote: string; areaNote: string;
};

export function buildFloorplanEntities(library: readonly ApprovedFloorplanProject[] = approvedFloorplanLibrary): FloorplanEntity[] {
  return reviewedPlans.map((review) => {
    const projects = library.filter((item) => item.projectId === review.projectId);
    if (projects.length !== 1) throw new Error(`Expected one project: ${review.projectId}`);
    const project = projects[0];
    const pdf = review.pdf;
    const matches = project.plans.filter((plan) => plan.href === pdf);
    if (matches.length !== 1) throw new Error(`Expected one approved plan: ${pdf}`);
    const plan = matches[0];
    if (plan.planType && plan.planType !== "individual") throw new Error(`Not an individual plan: ${pdf}`);
    for (const [key, expected] of Object.entries(review.expected)) {
      if (String(plan[key as keyof typeof plan] ?? "") !== expected) {
        throw new Error(`Source review required: ${review.projectId}/${review.slug} ${key}`);
      }
    }
    const path = `/floorplans/${review.projectId}/${review.slug}/`;
    const interiorSqFt = Number(plan.interiorSqFt);
    const terraceSqFt = Number(plan.terraceSqFt);
    const totalSqFt = Number(plan.totalSqFt);
    if (![interiorSqFt, terraceSqFt, totalSqFt].every((value) => Number.isFinite(value) && value > 0) || totalSqFt - interiorSqFt - terraceSqFt !== review.areaDifference) {
      throw new Error(`Invalid reported areas: ${pdf}`);
    }
    // Explicit projection: never spread a research/library object into public HTML.
    return {
      planId: `${review.projectId}-individual-${review.slug}`, projectId: review.projectId,
      projectName: project.name, slug: review.slug, version: review.version,
      path, canonical: `${floorplanSiteUrl}${path}`, planName: plan.title, pdf,
      preview: review.preview,
      sourceUrl: review.sourceUrl, sourcePage: review.sourcePage, sourceNote: review.sourceNote,
      reviewedOn: review.reviewedOn, updatedOn: review.updatedOn,
      bedrooms: plan.bedrooms!, bathrooms: plan.bathrooms!, interiorSqFt, terraceSqFt, totalSqFt,
      floors: plan.detail!, summary: review.summary, readingNote: review.readingNote, areaNote: review.areaNote,
    };
  });
}

export function cleanFloorplanPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  const path = new URL(value, floorplanSiteUrl).pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  return `${path}/`;
}

// Public routes use this explicit release scope. Alba remains source-reviewed
// in buildFloorplanEntities(), but cannot be routed, discovered or submitted.
export function publishedFloorplanEntities(): FloorplanEntity[] {
  return buildFloorplanEntities().filter((plan) => plan.projectId === "olara");
}

export function floorplanForPath(value: string): FloorplanEntity | undefined {
  const path = cleanFloorplanPath(value);
  return publishedFloorplanEntities().find((plan) => plan.path === path);
}

export function floorplansForDiscovery(value: string): FloorplanEntity[] {
  const path = cleanFloorplanPath(value);
  const plans = publishedFloorplanEntities();
  if (path === "/floorplans/" || path === "/floor-plans/") return plans;
  return plans.filter((plan) => path === `/projects/${plan.projectId}/`);
}

export function escapeFloorplanHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function floorplanJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

const area = (value: number) => `${value.toLocaleString("en-US")} sq ft`;
const fullName = (plan: FloorplanEntity) => `${plan.projectName} ${plan.planName}`;
const bedroomLabel = (plan: FloorplanEntity) => plan.bedrooms.replace(/^(\d+)/, "$1 bedrooms");
export const floorplanTitle = (plan: FloorplanEntity) => `${fullName(plan)} Floor Plan | ${bedroomLabel(plan).replace("bedrooms", "Bedrooms").replace("den", "Den")}`;
export const floorplanDescription = (plan: FloorplanEntity) => `Explore ${fullName(plan)}: ${bedroomLabel(plan)}, ${area(plan.interiorSqFt)} interior. View the released PDF and request current availability.`;

export function floorplanSchema(plan: FloorplanEntity) {
  const canonical = plan.canonical;
  return {
    "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", "@id": canonical, url: canonical, name: floorplanTitle(plan), description: floorplanDescription(plan),
        dateModified: plan.updatedOn, lastReviewed: plan.reviewedOn,
        isPartOf: { "@type": "WebSite", "@id": `${floorplanSiteUrl}/#website`, url: `${floorplanSiteUrl}/`, name: "WPB New Construction" },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@type": "CreativeWork", "@id": `${canonical}#plan`, name: `${fullName(plan)} floor plan`, version: plan.version,
          description: plan.summary, image: `${floorplanSiteUrl}${plan.preview}`, isBasedOn: plan.sourceUrl,
          encoding: { "@type": "MediaObject", contentUrl: `${floorplanSiteUrl}${plan.pdf}`, encodingFormat: "application/pdf" } } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${floorplanSiteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Floor plans", item: `${floorplanSiteUrl}/floorplans/` },
        { "@type": "ListItem", position: 3, name: plan.projectName, item: `${floorplanSiteUrl}/projects/${plan.projectId}/` },
        { "@type": "ListItem", position: 4, name: plan.planName, item: canonical },
      ] },
    ],
  };
}

export function discoverySchema(path: string) {
  return { "@context": "https://schema.org", "@type": "ItemList", "@id": `${floorplanSiteUrl}${cleanFloorplanPath(path)}#wpb-floorplan-guides`, name: "Individual floor plan guides", itemListElement:
    floorplansForDiscovery(path).map((plan, index) => ({ "@type": "ListItem", position: index + 1, name: `${fullName(plan)} floor plan`, url: plan.canonical })) };
}

// Extend the existing page graph instead of installing a competing JSON-LD block.
// Remove only our named node when navigating; preserve all existing identities.
export function mergeFloorplanDiscoverySchema(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON-LD object");
  const schema = value as Record<string, unknown>;
  const graph: unknown[] = Array.isArray(schema["@graph"]) ? schema["@graph"] : [schema];
  const nodes = graph.filter((node) => {
    if (!node || typeof node !== "object") return true;
    const id = (node as Record<string, unknown>)["@id"];
    return !(typeof id === "string" && id.startsWith(floorplanSiteUrl + "/") && id.endsWith("#wpb-floorplan-guides"));
  });
  const item = discoverySchema(path);
  if (item.itemListElement.length) nodes.push(item);
  if (Array.isArray(schema["@graph"])) return { ...schema, "@graph": nodes };
  if (!item.itemListElement.length) return schema;
  return { "@context": schema["@context"] ?? "https://schema.org", "@graph": nodes };
}

export function renderFloorplanDiscovery(path: string): string {
  const plans = floorplansForDiscovery(path);
  if (!plans.length) return "";
  return `<section id="wpb-floorplan-guides" class="fp-discovery" data-page="${escapeFloorplanHtml(cleanFloorplanPath(path))}" aria-labelledby="fp-guide-heading"><h2 id="fp-guide-heading">Explore individual floor plans</h2><p>Read the plan facts, review the source drawing, and request current availability.</p><ul>${plans.map((plan) => `<li><a data-floorplan-entity-link href="${plan.path}">${escapeFloorplanHtml(fullName(plan))} floor plan</a></li>`).join("")}</ul></section>`;
}

export function renderFloorplanPage(plan: FloorplanEntity): string {
  const e = escapeFloorplanHtml;
  const facts = [ ["Bedrooms", plan.bedrooms], ["Bathrooms", plan.bathrooms.replace(" + powder", " + 1 powder room")],
    ["Interior area", area(plan.interiorSqFt)], ["Terrace / exterior area", area(plan.terraceSqFt)],
    ["Reported total including exterior", area(plan.totalSqFt)], ["Floor range on drawing", plan.floors] ];
  return `<div class="fp-page" data-floorplan-id="${e(plan.planId)}">
    <a class="fp-skip" href="#floorplan-main">Skip to floor plan</a>
    <header class="fp-header"><a href="/" class="fp-brand">WPB <span>New Construction</span></a><nav aria-label="Main navigation"><a href="/buildings/">Buildings</a><a href="/floorplans/">Floor plans</a><a href="/compare/">Compare</a><a href="/inquire/">Inquire</a></nav></header>
    <main id="floorplan-main" class="fp-main">
      <nav class="fp-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/floorplans/">Floor plans</a><span>/</span><a href="/projects/${plan.projectId}/">${e(plan.projectName)}</a><span>/</span><span aria-current="page">${e(plan.planName)}</span></nav>
      <p class="fp-kicker">Released residence plan · North Flagler</p>
      <h1>${e(fullName(plan))}<br><span>Floor plan</span></h1>
      <p class="fp-intro">${e(plan.summary)}</p>
      <div class="fp-intro-action"><a class="fp-button" href="/inquire/" data-fp-action="availability" data-fp-placement="intro">Request current availability</a><p class="fp-small">Ask about ${e(fullName(plan))} and the latest floor-plan packet.</p></div>
      <p class="fp-review">Source reviewed <time datetime="${plan.reviewedOn}">${plan.reviewedOn}</time> · Availability requires confirmation</p>
      <div class="fp-layout"><section aria-labelledby="fp-drawing-title"><h2 id="fp-drawing-title">The released drawing</h2>
        <figure class="fp-drawing"><a href="${plan.pdf}" data-fp-action="pdf" target="_blank" rel="noopener noreferrer" aria-label="Open ${e(fullName(plan))} PDF in a new tab"><img src="${plan.preview}" alt="Released ${e(fullName(plan))} floor plan; open the PDF for readable drawing details" loading="eager" decoding="async"></a><figcaption>Developer plan preview. Open the PDF for readable details and the full source notes. Drawings and dimensions are approximate and subject to change.</figcaption></figure>
        <div class="fp-actions"><a class="fp-button" href="${plan.pdf}" data-fp-action="pdf" download>Download floor plan PDF</a><a href="${plan.pdf}" data-fp-action="source" target="_blank" rel="noopener noreferrer">Open archived source PDF ↗</a></div>
      </section><aside class="fp-facts" aria-labelledby="fp-facts-title"><h2 id="fp-facts-title">Plan at a glance</h2><dl>${facts.map(([label, value]) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join("")}</dl>${plan.areaNote ? `<p class="fp-area-note"><strong>Area clarification:</strong> ${e(plan.areaNote)}</p>` : ""}<p>Reported areas include different types of space. The total is not the interior living area.</p><a class="fp-button" href="/inquire/" data-fp-action="availability" data-fp-placement="facts">Request current availability</a><p class="fp-small">Ask about ${e(fullName(plan))}, the current drawing, pricing and available floors.</p></aside></div>
      <section class="fp-reading"><h2>How to compare this plan</h2><p>${e(plan.readingNote)}</p><p>For a current comparison, confirm the specific residence, its view exposure, the measurement basis, any layout changes, and the current offering terms. A published plan does not reserve a residence or establish pricing.</p><div class="fp-actions"><a href="/projects/${plan.projectId}/">Read the ${e(plan.projectName)} building guide</a><a href="/compare/" data-fp-action="compare">Compare buildings</a><a href="/floorplans/">Browse the floor-plan library</a></div></section>
      <section class="fp-source"><h2>Source and review notes</h2><p>${e(plan.sourceNote)}</p><p>Facts on this page were checked against the developer drawing on <time datetime="${plan.reviewedOn}">${plan.reviewedOn}</time>. <a href="${plan.pdf}" data-fp-action="source" target="_blank" rel="noopener noreferrer">Read the archived developer drawing ↗</a></p></section>
    </main><footer class="fp-footer"><strong>${e(teamProfile.presentedBy)}</strong><p>${e(teamProfile.legalBrokerage)} · Brokerage license ${e(teamProfile.brokerageLicense)}</p><p>Independent buyer research. This page is not the developer’s sales website. Equal Housing Opportunity.</p><nav aria-label="Legal"><a href="/about/">About</a><a href="/methodology/">Methodology</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/fair-housing/">Fair housing</a></nav></footer></div>`;
}
