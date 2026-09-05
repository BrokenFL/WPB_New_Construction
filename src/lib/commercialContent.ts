/** Shared copy for the two commercial entry pages. No inventory or research fields. */
export const commercialOrigin = 'https://www.wpbnewconstruction.com';
export type CommercialPage = 'home' | 'buildings';
export type CommercialIntent = 'availability' | 'pricing-packet';
export const commercialPages = {
  home: {
    path: '/',
    title: 'West Palm Beach New Construction Condos | Buildings & Plans',
    heading: 'West Palm Beach New Construction Condos',
    description: 'Explore West Palm Beach new construction condos by waterfront or downtown location. Compare buildings and floor plans, then request current availability.',
    intro: 'Explore West Palm Beach new construction condos, from Flagler Drive waterfront towers to downtown residences. Compare locations, project stages and released floor plans, then request current availability for your shortlist.',
  },
  buildings: {
    path: '/buildings/',
    title: 'West Palm Beach Condo Buildings | New Development Directory',
    heading: 'West Palm Beach Condo Building Directory',
    description: 'Browse West Palm Beach condo developments by corridor and project stage. Review building guides, compare layouts and request a current pricing and floor-plan packet.',
    intro: 'Browse condo developments by corridor and project stage. Separate active-sales projects from announced plans, completed comparables and rental developments before comparing layouts or requesting a current pricing packet.',
  },
} as const;
export const commercialLabels: Record<CommercialIntent, string> = {
  availability: 'Request current availability',
  'pricing-packet': 'Get pricing + floor-plan packet',
};
export function commercialPageForPath(path: string): CommercialPage | undefined {
  if (path === '/' || path === '/index.html') return 'home';
  if (/^\/buildings(?:\/|\/index\.html)?$/.test(path)) return 'buildings';
  return undefined;
}
export function parseCommercialContext(value: unknown): { page: CommercialPage; intent: CommercialIntent } | undefined {
  const match = typeof value === 'string' ? value.match(/^commercial:(home|buildings):(availability|pricing-packet)$/) : null;
  return match ? { page: match[1] as CommercialPage, intent: match[2] as CommercialIntent } : undefined;
}
export function commercialEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
export function commercialJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
export function renderCommercialActions(page: CommercialPage): string {
  return `<div class="cg-actions" data-commercial-actions="${page}"><a class="cg-button" href="/inquire/" data-commercial-intent="availability" data-commercial-origin="${page}">${commercialLabels.availability}</a><a class="cg-button cg-secondary" href="/inquire/" data-commercial-intent="pricing-packet" data-commercial-origin="${page}">${commercialLabels['pricing-packet']}</a></div>`;
}
const corridorLinks = '<nav class="cg-corridors" aria-label="Explore condo locations"><a href="/corridors/north-flagler/">North Flagler</a><a href="/corridors/south-flagler/">South Flagler</a><a href="/corridors/downtown-west-palm-beach/">Downtown West Palm Beach</a><a href="/corridors/palm-beach/">Palm Beach island</a></nav>';
export function renderCommercialGuide(page: CommercialPage): string {
  const home = page === 'home';
  return `<section class="cg-guide" data-commercial-guide="${page}" aria-labelledby="cg-heading-${page}">
    <div class="cg-heading"><p class="eyebrow">${home ? 'Build a better shortlist' : 'Read the directory with confidence'}</p><h2 id="cg-heading-${page}">${home ? 'Start with location. Then compare the residence.' : 'Project stage is not the same as availability.'}</h2><p>${home ? 'A waterfront address and a downtown address answer different priorities. Use the building guides to compare the residence, not just the rendering.' : 'The filters describe projects, not live unit inventory. A building can be under construction and actively marketed at the same time.'}</p></div>
    ${corridorLinks}
    ${home ? '' : '<details class="cg-stage-details"><summary>Understand project stages and buyer fit</summary>'}
    <div class="cg-grid">${home ? `
      <article><h3>Waterfront or downtown?</h3><p>Compare Flagler Drive waterfront settings with downtown locations. Check the actual residence’s view, nearby construction and the routes you will use day to day.</p><a href="/answers/downtown-vs-waterfront-new-construction-condos/">Compare downtown and waterfront living</a></article>
      <article><h3>New launch or completed building?</h3><p>Decide how much timing certainty matters. Read the project stage, then confirm the current sales offering and occupancy expectations separately.</p><a href="/answers/preconstruction-vs-completed-new-construction-condos-west-palm-beach/">Understand the timing trade-off</a></article>
      <article><h3>Compare the actual layout</h3><p>Separate interior area from terraces. Review bedroom configuration, storage, elevator access and the specific floor before treating two plans as comparable.</p><a href="/floorplans/">Explore released floor plans</a></article>` : `
      <article><h3>Active sales / under construction</h3><p>Use these filters to explore marketed projects and construction progress. Neither label confirms that a specific residence is available or that a delivery date is guaranteed.</p><a href="/compare/">Compare a building shortlist</a></article>
      <article><h3>Announced / planned</h3><p>Keep future proposals separate from homes you can buy now. Verify approvals, sales launch and offering documents before treating a proposal as an available condo.</p><a href="/methodology/">How project information is checked</a></article>
      <article><h3>Completed / rental / mixed-use</h3><p>Completed buildings can provide useful comparisons. Rental and mixed-use projects add neighborhood context; they are not automatically new condos for sale.</p><a href="/answers/preconstruction-vs-completed-new-construction-condos-west-palm-beach/">Compare completed and pre-construction options</a></article>`}</div>
    <div class="cg-next"><p>${home ? 'Start with the existing guides for <a href="/projects/olara/">Olara</a> and <a href="/projects/south-flagler-house/">South Flagler House</a>, or browse the full directory.' : 'For buyer fit, compare location, layout, building scale, service expectations and timing. Confirm fees, parking and the latest plan before requesting a residence-specific comparison.'}</p><a class="cg-text-link" href="${home ? '/buildings/' : '/compare/'}">${home ? 'Browse the building directory' : 'Compare buildings side by side'}</a> · <a href="${home ? '/compare/' : '/floorplans/'}">${home ? 'Compare buildings' : 'Browse released floor plans'}</a></div>
    ${home ? '' : '</details>'}
    <p class="cg-note">Independent buyer research from The Scott Gordon Group. Pricing, availability and offering terms require current confirmation; the research and released plans remain open to browse.</p>
  </section>`;
}
/** Preserve existing graph identities and change only the matching page description. */
export function commercialSchema(value: unknown, page: CommercialPage): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const graph = value as Record<string, unknown>;
  if (Array.isArray(graph['@graph'])) return { ...graph, '@graph': graph['@graph'].map((node) => commercialSchema(node, page)) };
  const copy = commercialPages[page];
  const canonical = commercialOrigin + copy.path;
  if ((graph.url === canonical || graph['@id'] === canonical + '#webpage') && ['WebPage', 'CollectionPage'].includes(String(graph['@type']))) {
    return { ...graph, name: copy.heading, description: copy.description };
  }
  return value;
}
