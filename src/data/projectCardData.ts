export type ProjectCardData = [string, string, string, string, string];

export const projectCardDataById = Object.fromEntries([
  ["alba-palm-beach", ["Alba", "Under Construction", "Yes", "2026", "Boutique North Flagler waterfront living with just 55 residences, oversized terraces, private elevators, and a quieter luxury profile for buyers who want new construction without mega-tower scale."]],
  ["olara", ["Olara", "Under Construction", "Yes", "2027", "A full-service North Flagler waterfront tower with 275 residences, deep amenities, guest suites, dockage, wellness, dining, valet, and the scale buyers expect from a true luxury address."]],
  ["shorecrest", ["Shorecrest", "Under Construction", "Yes", "2027", "Modern North Flagler waterfront living with 98 residences, rooftop amenities, strong service, private terraces, and a sleek tower profile for buyers who want new construction with edge."]],
  ["ritz-carlton-wpb", ["Ritz-Carlton Residences", "Under Construction", "Yes", "2028", "Ritz-Carlton branded waterfront living on North Flagler with 138 residences, concierge service, beach club access, wellness amenities, and the confidence of a globally recognized luxury name."]],
  ["berkeley", ["The Berkeley", "Under Construction", "Yes", "2027", "Clear Lake luxury with 193 residences, large terraces, family-friendly amenities, downtown access, and practical elegance for buyers who want space without needing direct Intracoastal frontage."]],
  ["nora-house", ["Nora House", "Approved", "Yes", "2029", "A sales-launched Nora District condominium with 117 residences, guest suites, rooftop amenities, walkable energy, and front-row access to one of West Palm Beach's most watched neighborhoods."]],
  ["south-flagler-house", ["South Flagler House", "Under Construction", "Yes", "2027", "Trophy South Flagler waterfront living with 108 residences, two towers, estate-scale layouts, private-club amenities, marina access, and one of the most prestigious addresses in West Palm Beach."]],
  ["mr-c", ["Mr. C Residences", "Under Construction", "Yes", "2027", "Downtown branded living with 146 residences, Cipriani-backed hospitality, dining, valet, butler-style service, rooftop energy, and the urban luxury buyers want near the center of West Palm Beach."]],
  ["maison-dor", ["Maison d'Or", "Approved", "Yes", "2028", "Boutique South Flagler luxury with 39 residences, pricing from $5.7M, and a rare smaller-scale profile for buyers watching the next wave of waterfront new construction."]],
  ["edgeworth", ["Edgeworth", "Approved", "No", "2029", "A major Related Ross South Flagler pipeline project with 168 planned residences, two towers, waterfront positioning, and the potential to become one of WPB's next trophy luxury addresses."]],
  ["mandarin-oriental", ["Mandarin Oriental Residences", "Approved", "Yes", "2031", "Mandarin Oriental branded waterfront living planned for North Flagler with 87 residences, private elevators, wraparound terraces, and a long-horizon luxury play for brand-focused buyers."]],
  ["banyan-tree", ["Banyan Tree Residences", "Approved", "Yes", "2028", "Banyan Tree's planned downtown WPB residence brings 88 homes, branded hospitality, wellness-driven amenities, and major design credentials to the city's growing luxury pipeline."]],
  ["alba-reserve", ["Alba Reserve", "Planning", "No", "2029", "A reported North Flagler waterfront proposal with 87 residences and 31 floors, worth tracking for buyers who want early access to the next wave of luxury condo inventory."]],
  ["fern-and-gardenia-related-ross-fern-street", ["Fern & Gardenia", "Planning", "No", "2029", "A downtown Fern Street pipeline project that could bring 100-130 condos near CityPlace, adding future luxury inventory to one of WPB's most walkable urban corridors."]],
  ["rybovich-marina-redevelopment", ["Rybovich Marina", "Approved", "No", "2030", "A major North Flagler marina redevelopment with up to 660 residential units contemplated, phased waterfront towers, and the potential to reshape WPB's northern waterfront."]],
  ["rosewood-residences-west-palm-beach", ["Rosewood Residences", "Planning", "No", "2029", "Rosewood-branded North Flagler pipeline living with 90 planned residences, 27 floors, filed-plan momentum, and a hospitality name that serious luxury buyers will watch closely."]],
  ["forte-on-flagler", ["Forte on Flagler", "Completed", "Resales", "2024", "A completed South Flagler luxury benchmark with waterfront residences, deep amenities, guest suites, valet, house cars, and real delivered product buyers can compare today."]],
  ["la-clara", ["La Clara", "Completed", "Resales", "2023", "A completed South Flagler luxury comp with 83 residences, strong resale relevance, and the delivered-building context buyers need when comparing WPB's newest towers."]],
] as Array<[string, ProjectCardData]>) as Record<string, ProjectCardData>;

const corridorLabels: Record<string, string> = {
  downtown: "DOWNTOWN",
  "north-flagler": "NORTH FLAGLER",
  "south-flagler": "SOUTH FLAGLER",
};

export function hydrateProjectCards() {
  document.querySelectorAll<HTMLElement>("[data-project-card]").forEach((card) => {
    const data = projectCardDataById[card.dataset.projectCard || ""];
    if (!data) return;
    card.querySelector<HTMLElement>("[data-pc-title]")?.replaceChildren(document.createTextNode(data[0]));
    card.querySelector<HTMLElement>("[data-pc-corridor]")?.replaceChildren(document.createTextNode(corridorLabels[card.dataset.c || card.dataset.corridor || ""] || ""));
    card.querySelector<HTMLElement>("[data-pc-status]")?.replaceChildren(document.createTextNode(data[1]));
    card.querySelector<HTMLElement>("[data-pc-sales]")?.replaceChildren(document.createTextNode(data[2]));
    card.querySelector<HTMLElement>("[data-pc-year]")?.replaceChildren(document.createTextNode(data[3]));
    card.querySelector<HTMLElement>("[data-pc-copy]")?.replaceChildren(document.createTextNode(data[4]));
  });
}
