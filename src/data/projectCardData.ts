export type ProjectCardData = [string, string, string, string, string];

export const projectCardDataById = Object.fromEntries([
  ["alba-palm-beach", ["Alba", "Completed / Developer Sales Active", "Yes", "2026", "Boutique North Flagler waterfront living with just 55 residences, oversized terraces, private elevators, and a quieter luxury profile for buyers who want new construction without mega-tower scale."]],
  ["olara", ["Olara", "Under Construction", "Yes", "2027", "A full-service North Flagler waterfront tower with deep amenities, guest suites, dockage, wellness, dining, valet, and the scale buyers expect from a true luxury address."]],
  ["shorecrest", ["Shorecrest", "Under Construction", "Yes", "Timing to confirm", "Shorecrest is worth comparing when the priorities are a North Flagler waterfront setting, two- or three-bedroom layouts and a rooftop wellness program rather than a hotel brand. Put its released plans beside Olara and Ritz-Carlton; living-room width, terrace use and included services are more useful distinctions than another luxury adjective."]],
  ["ritz-carlton-wpb", ["Ritz-Carlton Residences", "Under Construction", "Yes", "2028", "Ritz-Carlton branded waterfront living on North Flagler with 138 residences, concierge service, beach club access, wellness amenities, and the confidence of a globally recognized luxury name."]],
  ["berkeley", ["The Berkeley", "Under Construction", "Yes", "Timing to confirm", "Clear Lake luxury with 193 residences, large terraces, family-friendly amenities, downtown access, and practical elegance for buyers who want space without needing direct Intracoastal frontage."]],
  ["nora-house", ["Nora House", "Approved", "Yes", "2029", "A sales-launched Nora District condominium with 117 residences, guest suites, rooftop amenities, walkable energy, and front-row access to one of West Palm Beach's most watched neighborhoods."]],
  ["south-flagler-house", ["South Flagler House", "Under Construction", "Yes", "Timing to confirm", "Begin with the tower, the actual living-room proportions and how the loggia works with the interior. South Flagler House is a large-residence, private-club proposition; compare it with completed South Flagler alternatives as well as new developments. An impressive amenity list does not replace reviewing service charges, guest-suite eligibility and the current occupancy schedule."]],
  ["mr-c", ["Mr. C Residences", "Under Construction", "Yes", "Timing to confirm", "Downtown branded living with 146 residences, Cipriani-backed hospitality, dining, valet, butler-style service, rooftop energy, and the urban luxury buyers want near the center of West Palm Beach."]],
  ["olin-palm-beach", ["OLIN Palm Beach", "Pre-Construction Sales", "Yes", "Timing to confirm", "32-residence ocean-to-lagoon Palm Beach project by OKO Group and Cain International. Request current pricing and project information."]],
  ["maison-dor", ["Maison d'Or", "Pre-Construction Sales", "Yes", "Request current delivery guidance", "Boutique South Flagler luxury with 39 residences, pricing from $5.7M, and a rare smaller-scale profile for buyers watching the next wave of waterfront new construction."]],
  ["edgeworth", ["Edgeworth", "Approved", "No", "2029", "A Related Ross South Flagler waterfront project with two towers and an extensive amenity program. Review its official guidance and dated source differences before comparing residence options."]],
  ["mandarin-oriental", ["Mandarin Oriental Residences", "Sales Open", "Yes", "2031 anticipated opening", "Mandarin Oriental branded waterfront living planned for North Flagler with 87 residences, private elevators, wraparound terraces, and a long-horizon luxury play for brand-focused buyers."]],
  ["banyan-tree", ["Banyan Tree Residences", "Approved", "Yes", "2028", "Banyan Tree Residences is a marketed downtown condominium with corner residences, wellness amenities, OMA design and an appointment-only sales gallery."]],
  ["alba-reserve", ["Alba Reserve", "Planning", "No", "2029", "A reported North Flagler waterfront proposal whose unit count, branding and municipal outcome need confirmation. Track the proposal before treating it as an active sales offering."]],
  ["fern-and-gardenia-related-ross-fern-street", ["Residences at 464 Fern", "Municipal Review", "No", "TBD", "A Related Ross downtown proposal remains under municipal review. The reviewed 194-residence proposal and the city map's 197-unit program require reconciliation."]],
  ["rybovich-marina-redevelopment", ["Rybovich Marina", "Approved", "No", "2030", "A major North Flagler marina redevelopment with up to 660 residential units contemplated, phased waterfront towers, and the potential to reshape WPB's northern waterfront."]],
  ["rosewood-residences-west-palm-beach", ["Rosewood Residences", "Planning", "No", "2029", "A reported branded North Flagler pipeline project. Confirm the brand affiliation, current municipal program and construction status before comparing a future offering."]],
  ["forte-on-flagler", ["Forte on Flagler", "Completed", "Confirm", "2024", "A completed South Flagler luxury benchmark with waterfront residences, deep amenities, guest suites, valet, house cars, and real delivered product buyers can compare today."]],
  ["la-clara", ["La Clara", "Completed", "Resales", "2023", "A completed South Flagler luxury comp with 83 residences, strong resale relevance, and the delivered-building context buyers need when comparing WPB's newest towers."]],
] as Array<[string, ProjectCardData]>) as Record<string, ProjectCardData>;

const corridorLabels: Record<string, string> = {
  downtown: "DOWNTOWN",
  "north-flagler": "NORTH FLAGLER",
  "palm-beach": "PALM BEACH",
  "south-flagler": "SOUTH FLAGLER",
};

export function hydrateProjectCards() {
  document.querySelectorAll<HTMLElement>("[data-project-card]").forEach((card) => {
    const data = projectCardDataById[card.dataset.projectCard || ""];
    if (!data) return;
    card.querySelector<HTMLElement>("[data-pc-title]")?.replaceChildren(document.createTextNode(data[0]));
    card.querySelector<HTMLElement>("[data-pc-corridor]")?.replaceChildren(document.createTextNode(corridorLabels[card.dataset.c || card.dataset.corridor || ""] || ""));
    // Status and delivery are rendered through the canonical field resolver.
    // Legacy card copy must not overwrite reviewed facts after hydration.
    card.querySelector<HTMLElement>("[data-pc-sales]")?.replaceChildren(document.createTextNode(data[2]));
    card.querySelector<HTMLElement>("[data-pc-copy]")?.replaceChildren(document.createTextNode(data[4]));
  });
}
