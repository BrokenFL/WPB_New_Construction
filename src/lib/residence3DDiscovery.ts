import { escapeFloorplanHtml, floorplanSiteUrl, publishedFloorplanEntities } from "./floorplanEntities.ts";
import { teamProfile } from "./contact.ts";

export const residence3DDiscoveryPath = "/3d-floorplans/";
export const residence3DDiscoveryTitle = "Interactive 3D Floor Plans | West Palm Beach Residences";
export const residence3DDiscoveryDescription = "Explore reviewed 3D residence layouts alongside released developer drawings for selected West Palm Beach developments.";

export function approved3DPlanEntities() {
  return publishedFloorplanEntities().filter((plan) => plan.models3D.some((model) => model.status === "approved"));
}

export function residence3DDiscoverySchema() {
  const canonical = `${floorplanSiteUrl}${residence3DDiscoveryPath}`;
  const plans = approved3DPlanEntities();
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": canonical, url: canonical, name: residence3DDiscoveryTitle,
      description: residence3DDiscoveryDescription,
      isPartOf: { "@id": `${floorplanSiteUrl}/#website` },
      breadcrumb: { "@id": `${canonical}#breadcrumb` },
      mainEntity: { "@id": `${canonical}#residences` } },
    { "@type": "ItemList", "@id": `${canonical}#residences`, name: "Interactive 3D residence floor plans",
      numberOfItems: plans.length,
      itemListElement: plans.map((plan, index) => ({ "@type": "ListItem", position: index + 1,
        name: `${plan.projectName} ${plan.planName}`, url: plan.canonical })) },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${floorplanSiteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Floor plans", item: `${floorplanSiteUrl}/floorplans/` },
      { "@type": "ListItem", position: 3, name: "3D floor plans", item: canonical },
    ] },
  ] };
}

export function renderResidence3DDiscoveryPage(): string {
  const e = escapeFloorplanHtml;
  const plans = approved3DPlanEntities();
  const groups = [...new Set(plans.map((plan) => plan.projectId))];
  return `<div class="fp-page fp-3d-discovery">
    <a class="fp-skip" href="#floorplan-main">Skip to 3D floor plans</a>
    <header class="fp-header"><a href="/" class="fp-brand">WPB <span>New Construction</span></a><nav aria-label="Main navigation"><a href="/buildings/">Buildings</a><a href="/floorplans/">Floor plans</a><a href="/compare/">Compare</a><a href="/inquire/">Inquire</a></nav></header>
    <main id="floorplan-main" class="fp-main">
      <nav class="fp-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/floorplans/">Floor plans</a><span>/</span><span aria-current="page">3D floor plans</span></nav>
      <p class="fp-kicker">Residence layouts · Interactive 3D</p>
      <h1>West Palm Beach residences in <span>three dimensions</span></h1>
      <p class="fp-intro">Walk through the shape and flow of selected West Palm Beach residences, then compare each model with its released developer drawing. Models are visual guides; the source plan and current offering documents control the residence facts.</p>
      ${groups.map((projectId) => {
        const projectPlans = plans.filter((plan) => plan.projectId === projectId);
        const project = projectPlans[0];
        return `<section class="fp-discovery" aria-labelledby="fp-3d-${e(projectId)}"><h2 id="fp-3d-${e(projectId)}">${e(project.projectName)}</h2><p><a href="/projects/${e(projectId)}/">Read the building guide</a></p><ul class="fp-3d-cards">${projectPlans.map((plan) => {
          const model = plan.models3D.find((item) => item.status === "approved")!;
          return `<li><article><a href="${e(plan.path)}"><img src="${e(model.posterUrl)}" alt="${e(model.accessibilityLabel)}" loading="lazy" decoding="async"><h3>${e(project.projectName)} · ${e(plan.planName)}</h3></a><p>${e(plan.bedrooms.replace(/^(\d+)/, "$1 bedrooms"))} · ${e(plan.interiorSqFt.toLocaleString("en-US"))} sq ft interior · ${e(plan.terraceSqFt.toLocaleString("en-US"))} sq ft exterior</p><p><a href="${e(plan.path)}">Explore in 3D</a> · <a href="${e(plan.pdf)}">Source drawing</a></p></article></li>`;
        }).join("")}</ul></section>`;
      }).join("")}
      <section class="fp-reading"><h2>Compare the model with the drawing</h2><p>A 3D view helps explain circulation, room relationships and terrace placement. Check measurements and disclosures in each archived developer drawing, then ask for the current residence-specific packet before relying on availability, views or purchase terms.</p><div class="fp-actions"><a href="/floorplans/">Browse the full floor-plan library</a><a href="/inquire/">Request current availability</a></div></section>
    </main><footer class="fp-footer"><strong>${e(teamProfile.presentedBy)}</strong><p>${e(teamProfile.legalBrokerage)} · Brokerage license ${e(teamProfile.brokerageLicense)}</p><p>Independent buyer research. This page is not the developer’s sales website. Equal Housing Opportunity.</p><nav aria-label="Legal"><a href="/about/">About</a><a href="/methodology/">Methodology</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/fair-housing/">Fair housing</a></nav></footer></div>`;
}
