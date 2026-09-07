import { commercialEscape as e, commercialJson, commercialOrigin } from './commercialContent.ts';
export { commercialJson as corridorJson };
export type GrowthCorridor = 'downtown' | 'south-flagler' | 'palm-beach';
export type CorridorIntent = 'availability' | 'pricing-packet';
type Link = { label: string; href: string };
type ProjectGuide = { name: string; slug: string; stage: string; detail: string; verify: string; source: Link };
type CorridorCopy = { path: string; label: string; title: string; heading: string; description: string; intro: string; image: string; imageAlt: string; imageCaption: string; geography: string; projects: ProjectGuide[]; fit: { heading: string; text: string }[]; further: Link[]; furtherNote: string; resources: Link[] };
export const corridorReviewedDate = '2026-09-07';
export const corridorActionLabels: Record<CorridorIntent, string> = { availability: 'Request current availability', 'pricing-packet': 'Get pricing + floor-plan packet' };
export const corridorGrowthPages: Record<GrowthCorridor, CorridorCopy> = {
  downtown: {
    path: '/corridors/downtown-west-palm-beach/', label: 'Downtown West Palm Beach',
    title: 'Downtown West Palm Beach New Condos | Locations & Buyer Guide',
    heading: 'Downtown West Palm Beach New Construction Condos',
    description: 'Compare downtown West Palm Beach new condos by city-core, NORA and Clear Lake location. Review project stages, layouts and questions before requesting availability.',
    intro: 'Downtown West Palm Beach is not one interchangeable condo location. Compare the city core, the NORA District and the Clear Lake edge by the places you use, the layout you need and the project’s actual stage—not just a skyline view.',
    image: '/assets/home/downtown-corridor-bridge-night-v01.jpg', imageAlt: 'Downtown West Palm Beach skyline beside the Intracoastal at night', imageCaption: 'Downtown waterfront context; individual project settings differ.',
    geography: 'This guide includes downtown and its adjoining NORA and Clear Lake locations. Clear Lake frontage is not Intracoastal frontage, and an ocean view from West Palm Beach does not make a residence oceanfront. Check each building’s address and your actual walking route.',
    projects: [
      { name: 'Mr. C Residences', slug: 'mr-c', stage: 'Marketed residences · hospitality-led services', detail: 'The official residence offering combines private terraces and open layouts with a service-oriented building program. Compare the residential experience, not just the brand.', verify: 'Ask which services are included, which cost extra, how residential and hospitality areas are separated, and the current construction and occupancy position.', source: {label:'Official residence features',href:'https://www.mrcresidenceswpb.com/residences/'} },
      { name: 'Nora House', slug: 'nora-house', stage: 'Marketed condominium · NORA District', detail: 'The developer presents two- to four-bedroom layouts and two amenity rooftops in NORA. Its district setting is a different everyday proposition from a Flagler Drive waterfront address.', verify: 'Confirm the construction stage, usable interior versus terrace area, orientation, parking and nearby district work. A sales launch is not a move-in date.', source: {label:'Official Nora House overview',href:'https://norahouse.com/'} },
      { name: 'The Berkeley Palm Beach', slug: 'berkeley', stage: 'Sales offering · construction milestone reported', detail: 'The Berkeley overlooks Clear Lake on the western side of the downtown area. The developer reported construction underway in July 2026; the official site presents two- to five-bedroom residences.', verify: 'Compare the actual east/west layout, access to downtown and the current construction schedule. Confirm occupancy timing in current documents rather than carrying forward an older target.', source: {label:'Developer construction announcement · July 2026',href:'https://www.prweb.com/releases/the-berkeley-palm-beach-breaks-ground-in-west-palm-beach-302817309.html'} },
    ],
    fit: [
      {heading:'For a city-centered routine',text:'Map the route from the building—not the sales gallery—to dining, work and transit. Visit at the times you would use it; check traffic, train noise, parking and evening activity.'},
      {heading:'For space and a different water outlook',text:'Compare Clear Lake layouts with the city-core and Intracoastal alternatives. Separate interior area from outdoor area, then test the furniture plan, storage and work-from-home needs.'},
      {heading:'For buyers comfortable with a changing district',text:'NORA and announced downtown developments need a neighborhood timeline as well as a building timeline. Distinguish what is open, under construction and still proposed.'},
    ],
    further: [{label:'Fern & Gardenia / Fern Street',href:'/projects/fern-and-gardenia-related-ross-fern-street/'},{label:'Banyan Tree project guide',href:'/projects/banyan-tree/'},{label:'Downtown reporting',href:'/downtown-spotlight/'}],
    furtherNote: 'Use these guides as additional development context, not confirmation of a current condominium offering. A mixed-use proposal may include rental, office or retail space; those uses are not for-sale residences.',
    resources: [{label:'Downtown vs waterfront: the practical trade-offs',href:'/answers/downtown-vs-waterfront-new-construction-condos/'},{label:'Compare buildings side by side',href:'/compare/'},{label:'Browse released floor plans',href:'/floorplans/'},{label:'Compare layouts beyond square footage',href:'/answers/compare-floor-plans-west-palm-beach-new-construction-condos/'}],
  },
  'south-flagler': {
    path:'/corridors/south-flagler/', label:'South Flagler',
    title:'South Flagler New Condos | Waterfront & Completed Comparisons',
    heading:'South Flagler Waterfront Condos & New Construction',
    description:'Compare South Flagler waterfront condos, marketed new developments and completed-building alternatives. Review layouts, services, project stages and buyer checks.',
    intro:'South Flagler is the West Palm Beach side of the Intracoastal, facing Palm Beach island. Start by separating marketed new developments from completed-building alternatives, then compare residence scale, privacy, services and your preferred stretch of the waterfront.',
    image:'/assets/home/south-flagler-corridor-hero-main-wide-v01.jpg', imageAlt:'South Flagler waterfront corridor with Palm Beach across the Intracoastal', imageCaption:'South Flagler waterfront context, on the West Palm Beach side.',
    geography:'South Flagler Drive extends beyond the downtown waterfront. Compare the individual site’s surroundings and bridge approach; proximity to Palm Beach is not the same as a Palm Beach address, ocean frontage or guaranteed beach access.',
    projects:[
      {name:'South Flagler House',slug:'south-flagler-house',stage:'Marketed residences · construction milestone reported',detail:'The developer describes expansive loggias, multiple residence types and a private-club-style amenity program. RAMSA reported the project’s topping out in November 2025.',verify:'Compare the specific tower, floor and loggia, guest-suite arrangements and included services. Confirm the current schedule, fees and residence availability separately.',source:{label:'Architect’s topping-out report · November 2025',href:'https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach'}},
      {name:'Maison d’Or',slug:'maison-dor',stage:'Marketed new development · confirm construction stage',detail:'The official offering presents a smaller collection of residences, two- to four-bedroom layouts and elevator access to residential lobbies. This is a distinct South Flagler location, not the South Flagler House site.',verify:'Request the exact layout and area breakdown, elevator arrangement, waterfront rights and current construction position. Do not treat a marketing price or rendering as a currently available home.',source:{label:'Official residences and floor-plan collection',href:'https://livemaisondor.com/the-residences/'}},
      {name:'La Clara',slug:'la-clara',stage:'Completed-building comparison',detail:'La Clara provides a built South Flagler alternative to evaluating only renderings and planned amenities. The contractor lists the project as completed.',verify:'Check the actual residence condition, association budget, services, resale availability and occupancy terms. Completion does not mean a particular home is available.',source:{label:'Contractor project record',href:'https://www.jm-a.com/portfolio/la-clara/'}},
    ],
    fit:[
      {heading:'For a larger waterfront residence',text:'Compare the living-room width, loggia depth, bedroom separation and elevator arrival. Do not treat terrace area as interior space or a shared elevator as private entry.'},
      {heading:'For timing certainty',text:'Include a completed building in the shortlist. A physical tour can test light, noise and service expectations, while a new-development purchase needs current construction and contract review.'},
      {heading:'For privacy and service',text:'Ask about homes per floor, guest access, staffing and recurring fees. A larger amenity program and a smaller resident community offer different trade-offs—not an automatic ranking.'},
    ],
    further:[{label:'Forté on Flagler guide',href:'/projects/forte-on-flagler/'},{label:'Edgeworth guide',href:'/projects/edgeworth/'},{label:'201 Arkona Court guide',href:'/projects/201-arkona-court/'}],
    furtherNote:'Review additional building and planning guides separately. Confirm the latest offering and construction position for each; announced sites and planning proposals are not current inventory.',
    resources:[{label:'North Flagler vs South Flagler',href:'/answers/north-flagler-vs-south-flagler-new-condos/'},{label:'Preconstruction vs completed residences',href:'/answers/preconstruction-vs-completed-new-construction-condos-west-palm-beach/'},{label:'Compare buildings',href:'/compare/'},{label:'Browse released floor plans',href:'/floorplans/'}],
  },
  'palm-beach':{
    path:'/corridors/palm-beach/',label:'Palm Beach island',
    title:'Palm Beach Island New Condos | Ocean & Lagoon Development Guide',
    heading:'Palm Beach Island New Construction Condos',
    description:'Explore Palm Beach island condo developments and distinguish ocean-to-lagoon offerings from planning proposals. Compare location, layouts, approvals and buyer questions.',
    intro:'Palm Beach island is a different market from West Palm Beach’s towers. The projects covered here are on the island’s South End: compare an ocean-to-lagoon condominium offering with a smaller redevelopment proposal, keeping sales status and planning approvals separate.',
    image:'/assets/projects/olin-palm-beach/hero/olin-palm-beach-hero-three-building-waterfront-v01.webp',imageAlt:'Project rendering of OLIN Palm Beach’s ocean-to-lagoon residential setting',imageCaption:'OLIN Palm Beach project rendering—not a completed-condition photograph.',
    geography:'Palm Beach is east of the Intracoastal; West Palm Beach is on the mainland. The island’s South End is also distinct from the separate Town of South Palm Beach. A Palm Beach mailing address, lagoon view and deeded ocean access are different facts to verify.',
    projects:[
      {name:'OLIN Palm Beach',slug:'olin-palm-beach',stage:'Developer-listed pre-construction sales',detail:'OKO Group describes an ocean-to-lagoon development of 32 residences with architecture by OMA and interiors by GACHOT. Its portfolio identifies the stage as pre-construction sales.',verify:'Request the current plan release, exact building and exposure, legal beach or lagoon access, included services and construction schedule. No residence-specific availability is implied here.',source:{label:'Official developer portfolio',href:'https://www.okogroup.com/portfolio/olin'}},
      {name:'3031 S. Ocean',slug:'3031-s-ocean-palm-beach',stage:'Redevelopment / planning context · offering unconfirmed',detail:'The Town’s March 2026 agenda describes an application for a five-story, 12-unit residential redevelopment. This dated planning record establishes the proposal, not today’s sales inventory or all final approvals.',verify:'Obtain current approvals, conditions and offering documents. Confirm the final layout, waterfront rights and whether a sales program has actually opened before treating it as a purchase option.',source:{label:'Town planning agenda · March 25, 2026 (PDF)',href:'https://palmbeachfl.api.civicclerk.com/v1/Meetings/GetMeetingFileStream(fileId=15075,plainText=false)'}},
    ],
    fit:[
      {heading:'For an island address',text:'Begin with the municipality and exact site. Test the routes you use to Midtown Palm Beach and the mainland, rather than assuming every island location has the same daily convenience.'},
      {heading:'For water access, not just a view',text:'Ask which rights belong to the residence, the association or a separate agreement. Confirm beach access, dock eligibility and maintenance responsibilities; a waterfront rendering does not establish them.'},
      {heading:'For a smaller residential setting',text:'Compare staffing and shared costs as carefully as the number of homes. Where plans are not publicly released, request the current documents instead of inferring layouts from a building image.'},
    ],
    further:[{label:'West Palm Beach waterfront alternatives',href:'/corridors/south-flagler/'},{label:'North Flagler projects',href:'/corridors/north-flagler/'},{label:'All building guides',href:'/buildings/'}],
    furtherNote:'Completed residences, rental communities and hotel stays answer different needs from a new condominium purchase. They may provide useful context, but are not additional new-for-sale projects in this island shortlist.',
    resources:[{label:'Which new condos are closest to Palm Beach?',href:'/answers/closest-new-condos-to-palm-beach/'},{label:'Compare buildings across the water',href:'/compare/'},{label:'Browse the regional floor-plan library',href:'/floorplans/'},{label:'Questions about condo fees and ownership costs',href:'/answers/west-palm-beach-new-construction-condo-fees-verify/'}],
  },
};
export function corridorGrowthForPath(path:string): GrowthCorridor | undefined {
  const clean=path.replace(/\/index\.html$/,'/').replace(/\/?$/,'/');
  if(clean==='/corridors/downtown/')return 'downtown';
  return (Object.keys(corridorGrowthPages) as GrowthCorridor[]).find(key=>corridorGrowthPages[key].path===clean);
}
export function parseCorridorContext(value:unknown): {key:GrowthCorridor;intent:CorridorIntent} | undefined {
  const m=typeof value==='string'?value.match(/^corridor:(downtown|south-flagler|palm-beach):(availability|pricing-packet)$/):null;
  return m?{key:m[1] as GrowthCorridor,intent:m[2] as CorridorIntent}:undefined;
}
export function renderCorridorActions(key:GrowthCorridor): string {
  return `<div class="cg-actions cr-actions">${(['availability','pricing-packet'] as const).map(intent=>`<a class="cg-button${intent==='pricing-packet'?' cg-secondary':''}" href="/inquire/" data-corridor-origin="${key}" data-corridor-intent="${intent}">${e(corridorActionLabels[intent])}</a>`).join('')}</div>`;
}
const nav=(links:Link[],label:string)=>`<nav class="cr-links" aria-label="${e(label)}">${links.map(l=>`<a href="${e(l.href)}">${e(l.label)} <span aria-hidden="true">→</span></a>`).join('')}</nav>`;
export function renderGrowthCorridor(key:GrowthCorridor): string {
  const c=corridorGrowthPages[key];
  return `<div class="cr-page" data-corridor-growth="${key}"><section class="cr-hero"><div><nav class="cr-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/corridors/">Corridors</a> / <span>${e(c.label)}</span></nav><p class="eyebrow">Location first. Residence second.</p><h1>${e(c.heading)}</h1><p class="cr-intro">${e(c.intro)}</p>${renderCorridorActions(key)}<p class="cr-note">Requests go to The Scott Gordon Group. Availability and packet contents require current confirmation; no instant inventory or delivery promise.</p></div><figure><img src="${e(c.image)}" alt="${e(c.imageAlt)}" decoding="async" fetchpriority="high" width="1000" height="750"><figcaption>${e(c.imageCaption)}</figcaption></figure></section>
  <section class="cr-geography"><h2>Know the location you are comparing.</h2><p>${e(c.geography)}</p></section>
  <section class="cr-projects" aria-labelledby="cr-project-heading-${key}"><div class="cr-section-heading"><p class="eyebrow">Start your shortlist</p><h2 id="cr-project-heading-${key}">Project position, not live inventory.</h2><p>Sales and construction are separate dimensions. Sources checked <time datetime="${corridorReviewedDate}">September 7, 2026</time>; historical milestones are identified below.</p></div><div class="cr-project-grid">${c.projects.map(p=>`<article class="cr-project"><p class="cr-stage">${e(p.stage)}</p><h3><a href="/projects/${e(p.slug)}/">${e(p.name)}</a></h3><p>${e(p.detail)}</p><p><strong>Before shortlisting:</strong> ${e(p.verify)}</p><div class="cr-project-footer"><a href="/projects/${e(p.slug)}/">Explore building guide →</a><a class="cr-source" href="${e(p.source.href)}" rel="noopener noreferrer">${e(p.source.label)}</a></div></article>`).join('')}</div></section>
  <section class="cr-fit"><p class="eyebrow">Buyer fit</p><h2>Choose for the way you will use the home.</h2><div class="cr-fit-grid">${c.fit.map(f=>`<article><h3>${e(f.heading)}</h3><p>${e(f.text)}</p></article>`).join('')}</div></section>
  <section class="cr-further"><h2>Keep the wider picture in view.</h2><p>${e(c.furtherNote)}</p>${nav(c.further,`${c.label} further project research`)}<details><summary>How to read project stages</summary><p><strong>Active sales</strong> means a marketed offering, not an available unit. <strong>Construction</strong> describes building progress, not a guaranteed closing date. <strong>Planned / pipeline</strong> requires current approval and launch checks. <strong>Completed</strong> describes a built property, not resale availability. <strong>Rental and mixed-use</strong> are separate use categories; neither automatically means condos for sale.</p></details></section>
  <section class="cr-resources"><h2>Go from location to the actual residence.</h2>${nav(c.resources,`${c.label} buyer resources`)}<p>Released plans stay open to browse. A plan’s presence in the library does not establish that its residence is currently available.</p></section>
  <footer class="cr-end"><p>Independent buyer research. For source handling, see <a href="/methodology/">our methodology</a>; for the advisory team, see <a href="/about/">The Scott Gordon Group</a>.</p><a href="/buildings/">Browse all building guides →</a></footer></div>`;
}
/** Retain publisher identities; replace only this corridor's page/collection graph. */
export function corridorGrowthSchema(value:unknown,key:GrowthCorridor): unknown {
  if(!value||typeof value!=='object'||Array.isArray(value))return value;
  const source=value as Record<string,unknown>;
  if(!Array.isArray(source['@graph']))return value;
  const c=corridorGrowthPages[key],url=commercialOrigin+c.path;
  const kept=source['@graph'].filter((n:Record<string,unknown>)=>['Organization','RealEstateAgent','Person','WebSite'].includes(String(n['@type'])));
  return {'@context':'https://schema.org','@graph':[...kept,
    {'@type':'CollectionPage','@id':url+'#webpage',url,name:c.heading,description:c.description,isPartOf:{'@id':commercialOrigin+'/#website'},mainEntity:{'@id':url+'#projects'},dateModified:corridorReviewedDate,citation:c.projects.map(p=>p.source.href)},
    {'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:[{name:'Home',path:'/'},{name:'Corridors',path:'/corridors/'},{name:c.label,path:c.path}].map((l,i)=>({'@type':'ListItem',position:i+1,name:l.name,item:commercialOrigin+l.path}))},
    {'@type':'ItemList','@id':url+'#projects',name:c.label+' project research',numberOfItems:c.projects.length,itemListElement:c.projects.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:commercialOrigin+'/projects/'+p.slug+'/'}))}
  ]};
}
