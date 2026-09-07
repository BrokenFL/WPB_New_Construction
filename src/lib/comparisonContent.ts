import { commercialEscape as e, commercialOrigin } from './commercialContent.ts';
import { comparisonPaths, comparisonProjectIds, shortlistProjects, type ComparisonKey, type ShortlistProjectId } from './shortlist.ts';
export { comparisonForPath } from './shortlist.ts';
export const comparisonReviewed = '2026-09-07';
const sources = {
  olara: { label: 'Olara: residences and layouts', url: 'https://www.olarawestpalmbeach.com/residences/' },
  olaraLife: { label: 'Olara: amenities and marina', url: 'https://www.olarawestpalmbeach.com/lifestyle/' },
  olaraBuild: { label: 'Gilbane: Olara project record', url: 'https://www.gilbaneco.com/projects/olara-residences-gilbane-building/' },
  ritz: { label: 'Ritz-Carlton WPB: residence features', url: 'https://theresidenceswestpalmbeach.com/residences/' },
  ritzLife: { label: 'Ritz-Carlton WPB: amenities', url: 'https://theresidenceswestpalmbeach.com/amenities/' },
  ritzBuild: { label: 'BH Group: sales and construction status', url: 'https://www.bhgroupmiami.com/projects/the-ritz-carlton-residences-at-west-palm-beach/' },
  shorecrest: { label: 'Shorecrest: two- and three-bedroom residences', url: 'https://www.shorecrestwpb.com/residences' },
  shorecrestLife: { label: 'Shorecrest: concierge and amenities', url: 'https://www.shorecrestwpb.com/amenities' },
  shorecrestBuild: { label: 'Related Ross: April 3, 2026 groundbreaking', url: 'https://www.relatedross.com/press-releases/2026-04-03/related-ross-breaks-ground-shorecrest-ushering-new-chapter-west-palm' },
  south: { label: 'South Flagler House: residences and services', url: 'https://www.southflaglerhouse.com/' },
  southBuild: { label: 'RAMSA: November 25, 2025 topping-out report', url: 'https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach' },
  clara: { label: 'John Moriarty & Associates: completed La Clara', url: 'https://www.jm-a.com/portfolio/la-clara/' },
};
type SourceKey = keyof typeof sources;
type ProjectComparison = { fit: string; layout: string; service: string; timing: string; verify: string; sourceIds: SourceKey[] };
const projects: Record<ShortlistProjectId, ProjectComparison> = {
  olara: {
    fit: 'Start here for a broad amenity program, boating interest and layouts with a den.',
    layout: 'Two- to four-bedroom-plus-den plans are described by Gilbane. Compare the den, bedroom separation and terrace depth, not just total area.',
    service: 'The project markets more than 80,000 square feet of wellness and leisure amenities, pools and a private marina. A marina is not a deeded slip for every owner.',
    timing: 'New-development sales; Gilbane describes construction taking shape. Confirm the current work stage and contractual timing rather than relying on an old completion year.',
    verify: 'Which amenities are shared across the development? What are slip allocation, vessel limits, access charges and actual plan availability?',
    sourceIds: ['olara', 'olaraLife', 'olaraBuild'],
  },
  'ritz-carlton-wpb': {
    fit: 'Start here when a hospitality-brand service model and dedicated elevator arrival matter most.',
    layout: 'The official residence page specifies dedicated elevator access, entry foyers, private balconies and 10- or 11-foot ceilings. Confirm those details for the selected line.',
    service: 'BH Group describes 138 condominium residences. The official amenity program includes concierge-led services; verify included staffing and separately charged services.',
    timing: 'BH Group labels the project selling and under construction, with February 2026 groundbreaking. Its 2028 guidance is a developer target, not a guaranteed closing date.',
    verify: 'Confirm service and brand-related costs. Official pages use both 1717 and 1745 North Flagler; confirm the property and appointment addresses before visiting.',
    sourceIds: ['ritz', 'ritzLife', 'ritzBuild'],
  },
  shorecrest: {
    fit: 'Start here for a smaller published residence count and two- or three-bedroom living with a rooftop pool.',
    layout: 'Two- and three-bedroom homes by Rottet Studio. The April 2026 developer release describes four residences per floor; ask for the floor plate and elevator arrangement.',
    service: 'Related Ross reported 98 residences in April 2026. The official program includes a rooftop pool, club-level spa, concierge and an on-site Lifestyle Director.',
    timing: 'Groundbreaking announced April 3, 2026. That release anticipated 2027 completion; request a dated construction and closing update before relying on it.',
    verify: 'Confirm current plans, fee inclusions, optional services and the current scope of any fitness partnership. Published project counts are not available-unit counts.',
    sourceIds: ['shorecrest', 'shorecrestLife', 'shorecrestBuild'],
  },
  'south-flagler-house': {
    fit: 'Start here for classical architecture, substantial outdoor living and a club-style service program south of downtown.',
    layout: 'The official site describes two- to five-bedroom homes, penthouses and guest suites, with expansive terraces and loggias. Verify the specific residence rather than a typical rendering.',
    service: 'RAMSA architecture and Pembrooke & Ives interiors; the official site describes 50,000 square feet of private club amenities. Different official sources give different residence counts, so no count is asserted here.',
    timing: 'New-development offering. RAMSA reported topping out in November 2025; a structural milestone is not proof that homes are ready for occupancy.',
    verify: 'Confirm tower, floor plate, current construction stage, club/guest-suite arrangements, estimated operating costs and delivery terms.',
    sourceIds: ['south', 'southBuild'],
  },
  'la-clara': {
    fit: 'Use a completed-building alternative when inspecting an actual home and operating building matters more than choosing from a new launch.',
    layout: 'Compare the actual residence, terrace, storage and view with a proposed plan. Do not assume a resale has the developer’s original finishes or configuration.',
    service: 'The contractor lists La Clara as completed. Review actual association operations and current fees rather than treating a completed building like a future amenity promise.',
    timing: 'Completed-building comparison, not a new launch or a claim of available resale inventory. The contractor records completion in 2024.',
    verify: 'Ask about resale availability, condition, association documents, reserves and any changes to the residence.',
    sourceIds: ['clara'],
  },
};
export const comparisonPages = {
  flagler: {
    path: comparisonPaths.flagler, title: 'North Flagler vs South Flagler Condos | Buyer Comparison',
    description: 'Compare North and South Flagler by location, layouts, service and construction stage. Build a shortlist of West Palm Beach condos and request current details.',
    heading: 'North Flagler vs. South Flagler condos',
    intro: 'Choose the daily routine before the building. North Flagler brings several new-development options into one waterfront shortlist; South Flagler pairs new offerings with completed-building alternatives. Both are on the West Palm Beach side of the Intracoastal—not Palm Beach island oceanfront.',
    decision: [['North Flagler', 'Compare Olara, Ritz-Carlton Residences and Shorecrest for different amenity, service and layout priorities. Visit the actual block: proximity to downtown is not the same for every address.'], ['South Flagler', 'Compare South Flagler House’s new-development offering with La Clara as a completed alternative. Test the route to the Norton, your usual bridge and your daily destinations rather than assuming the whole corridor is quieter.']],
    comparison: [
      ['Location', 'Flagler Drive north of downtown; verify the individual block, traffic and neighboring construction.', 'Flagler Drive south of downtown; compare the specific address and bridge route.'],
      ['Residence fit', 'Den-led plans, dedicated elevator arrivals and smaller floor plates are different choices—not corridor-wide standards.', 'Compare loggias, entertaining space and actual completed layouts; one South Flagler building does not represent them all.'],
      ['Service and costs', 'Olara’s amenity breadth, Ritz-Carlton’s brand model and Shorecrest’s residential program need separate fee comparisons.', 'South Flagler House’s proposed club program and La Clara’s operating association require different evidence.'],
      ['Timing', 'Separate the sales offering from the present construction stage and contractual closing terms.', 'Separate precompletion purchases from completed/resale opportunities; neither implies a unit is currently available.'],
    ],
    defaults: ['olara', 'south-flagler-house'] as ShortlistProjectId[],
  },
  trio: {
    path: comparisonPaths.trio, title: 'Olara vs Ritz-Carlton vs Shorecrest | West Palm Beach Condos',
    description: 'Compare Olara, Ritz-Carlton Residences West Palm Beach and Shorecrest by layouts, services, scale and reported construction milestones. Choose your shortlist.',
    heading: 'Olara vs. Ritz-Carlton vs. Shorecrest',
    intro: 'These North Flagler projects solve different buyer needs. Start with Olara for amenity breadth and marina interest, Ritz-Carlton Residences for branded service and dedicated elevator arrival, or Shorecrest for two- and three-bedroom homes in a smaller published residence collection. This is a fit comparison, not a ranking.',
    decision: [['A shared corridor, not identical settings', 'All three are in West Palm Beach, west of Palm Beach island. Olara’s contractor lists 1919 North Flagler; Shorecrest’s developer lists 1865. Ritz-Carlton’s official sources differ on its street number; confirm the address and actual stack exposure.'], ['Compare like-for-like documents', 'Choose a bedroom count and two or three actual lines. Compare interior area separately from terraces, circulation and den space. Service promises, marina access and residence counts are not substitutes for current offering documents.']],
    comparison: [
      ['Main distinction', 'Olara: expansive wellness, pools and a marketed private marina.', 'Ritz-Carlton: hospitality-brand positioning. Shorecrest: a smaller published residence count and rooftop/club program.'],
      ['Layout decision', 'Olara: a den may change the usefulness of a two- or three-bedroom plan.', 'Ritz-Carlton: dedicated elevator entry. Shorecrest: two/three bedrooms and a four-residences-per-floor design described in April 2026.'],
      ['Timing decision', 'Olara: request a current stage and contractual completion update.', 'Ritz-Carlton and Shorecrest have dated 2026 groundbreaking reports; their advertised years are targets, not guarantees.'],
    ],
    defaults: ['olara', 'ritz-carlton-wpb', 'shorecrest'] as ShortlistProjectId[],
  },
} as const;
export function comparisonJson(value: unknown) { return JSON.stringify(value).replaceAll('<', '\\u003c'); }
export function comparisonSchema(key: ComparisonKey) {
  const c = comparisonPages[key], url = commercialOrigin + c.path;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': commercialOrigin+'/#website', url: commercialOrigin+'/', name: 'WPB New Construction' },
    { '@type': 'WebPage', '@id': url+'#webpage', url, name:c.title, description:c.description, dateModified:comparisonReviewed, isPartOf:{'@id':commercialOrigin+'/#website'}, breadcrumb:{'@id':url+'#breadcrumbs'}, mainEntity:{'@id':url+'#projects'}, citation:[...new Set(comparisonProjectIds[key].flatMap(id=>projects[id].sourceIds))].map(id=>sources[id].url) },
    { '@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:[['Home','/'],['Buyer answers','/answers/'],[c.heading,c.path]].map(([name,p],i)=>({'@type':'ListItem',position:i+1,name,item:commercialOrigin+p})) },
    { '@type':'ItemList','@id':url+'#projects',name:'Projects in this buyer comparison',numberOfItems:comparisonProjectIds[key].length,itemListElement:comparisonProjectIds[key].map((id,i)=>({'@type':'ListItem',position:i+1,name:shortlistProjects[id].name,url:commercialOrigin+'/projects/'+id+'/'})) },
  ] };
}
export function renderComparisonLinks() {
  return `<section class="comparison-discovery" data-comparison-discovery><h2>Compare a focused shortlist</h2><p><a href="${comparisonPaths.flagler}">North Flagler vs. South Flagler</a> · <a href="${comparisonPaths.trio}">Olara vs. Ritz-Carlton vs. Shorecrest</a></p></section>`;
}
export function renderComparison(key: ComparisonKey) {
  const c=comparisonPages[key],ids=comparisonProjectIds[key];
  return `<div class="bc-page" data-comparison-page="${key}"><a class="bc-skip" href="#comparison-main">Skip to comparison</a><header class="bc-header"><a href="/">WPB NEW CONSTRUCTION</a><nav aria-label="Main navigation"><a href="/buildings/">Buildings</a><a href="/compare/">Compare</a><a href="/answers/">Buyer answers</a><a href="/inquire/">Inquire</a></nav></header><main id="comparison-main" class="bc-main"><nav class="bc-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/answers/">Buyer answers</a> / Comparison</nav><section class="bc-intro"><p class="bc-eyebrow">Buyer comparison · West Palm Beach</p><h1>${e(c.heading)}</h1><p class="bc-deck">${e(c.intro)}</p><p class="bc-date">Sources checked September 7, 2026. Confirm changing details before a purchase.</p><a class="bc-button" href="#shortlist">Build my shortlist</a></section><div class="bc-decisions">${c.decision.map(([h,b])=>`<section><h2>${e(h)}</h2><p>${e(b)}</p></section>`).join('')}</div><section class="bc-section"><h2>The practical trade-offs</h2><div class="bc-tradeoffs">${c.comparison.map(([h,a,b])=>`<article><h3>${e(h)}</h3><p>${e(a)}</p><p>${e(b)}</p></article>`).join('')}</div></section><section class="bc-section" aria-label="Project differences"><h2>Which buildings fit your priorities?</h2><div class="bc-projects">${ids.map(id=>{
    const p=projects[id];return `<article class="bc-project"><p class="bc-eyebrow">${shortlistProjects[id].corridor==='north-flagler'?'North Flagler':'South Flagler'}</p><h3><a href="/projects/${id}/">${e(shortlistProjects[id].name)}</a></h3><p class="bc-fit">${e(p.fit)}</p><dl><dt>Layouts</dt><dd>${e(p.layout)}</dd><dt>Scale and service</dt><dd>${e(p.service)}</dd><dt>Reported stage</dt><dd>${e(p.timing)}</dd><dt>Ask before deciding</dt><dd>${e(p.verify)}</dd></dl><p class="bc-sources">${p.sourceIds.map(s=>`<a href="${sources[s].url}" target="_blank" rel="noopener noreferrer">${e(sources[s].label)}</a>`).join(' · ')}</p><a href="/projects/${id}/">Open project guide →</a></article>`;}).join('')}</div></section><section class="bc-section bc-plan"><h2>Start with a real floor plan</h2><p><a href="/floorplans/olara/residence-d/">Olara Residence D</a> provides a published drawing and preserved PDF, not proof that the line is for sale. Use it to compare circulation, den space and terrace use with the same-bedroom layouts in your other buildings.</p><p><a href="/floorplans/">Open the floor-plan library</a> · <a href="/answers/compare-floor-plans-west-palm-beach-new-construction-condos/">How to compare plans</a> · <a href="/answers/west-palm-beach-new-construction-condo-fees-verify/">Which fees to verify</a></p></section><section id="shortlist" class="bc-shortlist"><p class="bc-eyebrow">Your selection, not browsing history</p><h2>Compare my shortlist</h2><p>Choose at least two buildings. Your selection will accompany the inquiry, along with a request to compare current plans, availability and ownership details.</p><fieldset disabled data-shortlist-options><legend>Buildings to include</legend>${ids.map(id=>`<label><input type="checkbox" value="${id}"${c.defaults.some(selected => selected === id)?' checked':''}>${e(shortlistProjects[id].name)}</label>`).join('')}</fieldset><p data-shortlist-status role="status">Enable JavaScript to carry your selection into the inquiry.</p><a class="bc-button" href="/inquire/" data-shortlist-submit>Compare my shortlist</a><noscript><p>The inquiry link works without JavaScript; include the building names when contacting the team.</p></noscript></section><section class="bc-section"><h2>Before you commit</h2><p>Request a dated availability and pricing packet, the exact line and floor, deposit terms, delivery provisions, estimated fees, parking/storage allocations and service inclusions. A construction milestone is not an occupancy certificate. A view rendering is not a guarantee.</p><p><a href="/corridors/north-flagler/">North Flagler guide</a> · <a href="/corridors/south-flagler/">South Flagler guide</a> · <a href="${comparisonPaths[key==='flagler'?'trio':'flagler']}">${key==='flagler'?'Compare the three North Flagler projects':'Compare North and South Flagler'}</a></p></section></main><footer class="bc-footer"><p>Buyer guidance from <a href="/about/">The Scott Gordon Group at Douglas Elliman</a>.</p><p><a href="/methodology/">Source methodology</a> · <a href="/privacy/">Privacy</a> · <a href="/fair-housing/">Fair Housing</a> · <a href="/terms/">Terms</a></p><p>Research is freely available. No current inventory, investment return or delivery date is guaranteed.</p></footer></div>`;
}
