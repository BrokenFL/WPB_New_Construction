export type LocalIntelligenceEntry = {
  buyerProfile: string[];
  pros: string[];
  cons: string[];
  trafficNotes: string;
  palmBeachAccess: string;
  nearbyCompetitors: string[];
  brookesTake: string;
  whatToKnowNotes?: string;
};

export const localIntelligence: Record<string, LocalIntelligenceEntry> = {
  "olara": {
    buyerProfile: ["Boaters needing dockage", "Seasonal resort-lifestyle seekers", "Wellness-focused buyers"],
    pros: [
      "Massive 80,000 SF amenity suite with wellness focus",
      "Private deepwater marina with direct Intracoastal slips",
      "Expansive floor plans designed by Arquitectonica"
    ],
    cons: [
      "North Flagler location is further north and less walkable than the downtown core",
      "Large scale (275 units) may feel busy for buyers seeking high privacy"
    ],
    trafficNotes: "Flagler Drive flow is excellent, but seasonal bridge openings at 15 and 45 past the hour can cause backups. Use Dixie Highway as a local bypass.",
    palmBeachAccess: "Fast access via the North Bridge (Royal Poinciana Bridge) or Middle Bridge (Royal Park Bridge) in approximately 7-9 minutes.",
    nearbyCompetitors: ["shorecrest", "ritz-carlton-wpb", "alba-palm-beach"],
    brookesTake: "Evaluate Olara for its unmatched amenity volume and active waterfront lifestyle, but compare its price-per-square-foot carefully with the boutique profile of Shorecrest."
  },
  "ritz-carlton-wpb": {
    buyerProfile: ["Prestige brand loyalists", "High-touch service seekers", "Lock-and-leave seasonal residents"],
    pros: [
      "Legendary Ritz-Carlton branded services and 24/7 concierge",
      "Interiors designed by Rockwell Group are exceptionally premium",
      "Excellent Intracoastal views from high-floor units"
    ],
    cons: [
      "Very high estimated monthly association fees due to branded service layers",
      "Branded premiums mean higher price-per-square-foot entry points"
    ],
    trafficNotes: "Frontage on N Flagler Drive. Easy access to airport route via Southern Blvd bypass when Flagler is busy.",
    palmBeachAccess: "Direct transit to Palm Beach Island via the Middle Bridge in under 6 minutes.",
    nearbyCompetitors: ["olara", "south-flagler-house", "forte-on-flagler"],
    brookesTake: "The definitive choice for buyers who prioritize 5-star service. It commands a premium, but the resale security of a Ritz-Carlton brand is historically strong."
  },
  "shorecrest": {
    buyerProfile: ["Boutique luxury seekers", "Related Ross design enthusiasts", "Active professionals wanting close downtown proximity"],
    pros: [
      "More boutique feel (98 units) compared to Olara",
      "Sleek architectural design by Related Ross",
      "High-end residential finish package"
    ],
    cons: [
      "Located close to the roadway, which might yield traffic noise on lower floors",
      "Amenities are excellent but on a smaller footprint than Olara"
    ],
    trafficNotes: "Positioned right on the curve of N Flagler. Pulling out can require care during peak commuter hours.",
    palmBeachAccess: "6 minutes to Palm Beach Island via the Middle Bridge.",
    nearbyCompetitors: ["olara", "ritz-carlton-wpb", "alba-palm-beach"],
    brookesTake: "Shorecrest offers a more intimate, sophisticated alternative to the massive resort scale of Olara. Strongly recommended for design-conscious buyers who prefer a quieter residential base."
  },
  "alba-palm-beach": {
    buyerProfile: ["Waterfront boutique purists", "Immediate-occupancy buyers", "Boating enthusiasts"],
    pros: [
      "Extremely intimate layout (only 55 total residences)",
      "Tops out and delivers earlier (early 2026) than many pipeline towers",
      "Direct waterfront docks on the Intracoastal"
    ],
    cons: [
      "Fewer resort-scale amenity features compared to large-scale projects",
      "Located further north along N Flagler, making walking to downtown unrealistic"
    ],
    trafficNotes: "Flagler Drive traffic is very light this far north, making access quieter and faster.",
    palmBeachAccess: "Easiest access is via the North Bridge, taking roughly 8 minutes to reach the island.",
    nearbyCompetitors: ["olara", "apogee-wpb", "mandarin-oriental"],
    brookesTake: "Alba is one of the few boutique projects delivering immediately. If you want direct waterfront living without waiting until 2027 or 2028, this should be on your short list."
  },
  "south-flagler-house": {
    buyerProfile: ["Estate-minded buyers", "Traditional architecture collectors", "Families wanting top privacy"],
    pros: [
      "Robert A.M. Stern neoclassical limestone design is timeless",
      "Direct unobstructed views opposite Palm Beach Island",
      "Private-club depth of amenities with massive square footage"
    ],
    cons: [
      "Extremely high entry prices; projects as one of WPB's most expensive towers",
      "Neoclassical architecture may not appeal to buyers looking for ultra-modern glass aesthetics"
    ],
    trafficNotes: "South Flagler Drive is a quieter, tree-lined residential corridor. Bridge traffic for the Southern Blvd Bridge is highly localized.",
    palmBeachAccess: "Immediate 3-minute access to Palm Beach Island via the Southern Blvd Bridge or Middle Bridge.",
    nearbyCompetitors: ["forte-on-flagler", "maison-dor", "ritz-carlton-wpb"],
    brookesTake: "South Flagler House is designed to feel like an estate rather than a condo. It is the premier luxury address south of downtown, offering private-club privacy without resort-style tourist noise."
  },
  "nora-house": {
    buyerProfile: ["Urban trendsetters", "Investment-minded buyers", "Walkability enthusiasts"],
    pros: [
      "Located in the vibrant NORA district, WPB's next cultural hotspot",
      "100% walkable to boutique retail, dining, and fitness options",
      "Great lifestyle play for younger buyers and urban downsizers"
    ],
    cons: [
      "Not located on the waterfront; views are city/skyline oriented",
      "Higher density urban surroundings with active street traffic"
    ],
    trafficNotes: "Traffic is slow and pedestrian-heavy. Access via Dixie Highway is direct but subject to standard city signals.",
    palmBeachAccess: "8 minutes to Palm Beach Island via the Middle Bridge.",
    nearbyCompetitors: ["mr-c", "berkeley", "banyan-tree"],
    brookesTake: "NORA House represents the non-waterfront design alternative. You are buying into the neighborhood culture and walkability rather than Intracoastal views. Excellent as an urban pied-à-terre."
  },
  "mr-c": {
    buyerProfile: ["Cipriani brand loyalists", "Downtown walkable buyers", "Hotel service seekers"],
    pros: [
      "Access to Cipriani-style dining, residential services, and hotel amenities",
      "Dynamic urban walkability in the heart of Downtown West Palm Beach",
      "Strong rental-program potential for investors"
    ],
    cons: [
      "Shared facilities with hotel guests may reduce residential exclusivity",
      "Urban setting lacks quiet waterfront setbacks"
    ],
    trafficNotes: "Located at Lakeview Ave, which gets congested during afternoon rush hour near the Middle Bridge entry.",
    palmBeachAccess: "Immediate 3-minute transit to Palm Beach Island via the Middle Bridge.",
    nearbyCompetitors: ["banyan-tree", "berkeley", "nora-house"],
    brookesTake: "Mr. C is a high-energy hospitality play. Perfect for buyers who want an active, service-rich lifestyle in the city center and enjoy having high-end Italian dining just an elevator ride away."
  },
  "berkeley": {
    buyerProfile: ["Value-seeking luxury buyers", "Intracoastal-commute alternatives", "Investors"],
    pros: [
      "Lower price-per-square-foot entry point than Flagler Drive waterfront towers",
      "Nice city and Clear Lake view corridors from high-floor residences",
      "193 units offering a solid residential standard"
    ],
    cons: [
      "Located west of the rail corridor; does not feature direct Intracoastal water views",
      "Lacks the prestige brand layer found in Ritz-Carlton or Mr. C"
    ],
    trafficNotes: "Frontage on South Australian Ave. Quick access to I-95, avoiding downtown waterfront bottle-necks.",
    palmBeachAccess: "8-10 minutes to Palm Beach Island via the Middle Bridge.",
    nearbyCompetitors: ["mr-c", "banyan-tree", "nora-house"],
    brookesTake: "The Berkeley is an excellent alternative for buyers looking for modern new construction specs without paying the direct waterfront Flagler premium. Highly convenient for highway access."
  },
  "forte-on-flagler": {
    buyerProfile: ["Waterfront boutique purists", "Buyers demanding massive square footage", "Privacy seekers"],
    pros: [
      "Only 41 residences, offering incredible privacy",
      "Extremely large layouts (avg. 4,200+ SF) with sweeping views",
      "Direct eastern waterfront exposure"
    ],
    cons: [
      "Pricing is very premium; high association costs on a 41-unit base",
      "Amenity options are high-end but fewer in number compared to 200+ unit towers"
    ],
    trafficNotes: "Flagler Drive traffic is light, providing a quiet, residential driving environment.",
    palmBeachAccess: "4 minutes to Palm Beach Island via the Southern Blvd Bridge.",
    nearbyCompetitors: ["south-flagler-house", "maison-dor"],
    brookesTake: "Forte is an estate-scale condo choice. If you want a massive residence with direct, sweeping Intracoastal views and only a handful of neighbors, Forte stands out."
  },
  "maison-dor": {
    buyerProfile: ["Boutique waterfront purists", "Discreet luxury buyers", "Palm Beach downsizers"],
    pros: [
      "Ultra-exclusive boutique scale on South Flagler Drive",
      "Very high-end finishes and private entry options",
      "Stunning direct views of Palm Beach Island across the water"
    ],
    cons: [
      "Extremely limited inventory makes securing a unit difficult",
      "Premium pricing with virtually no developer discount incentives"
    ],
    trafficNotes: "South Flagler Drive location offers a quiet, estate-like driving rhythm.",
    palmBeachAccess: "Immediate 3-minute access via the Middle Bridge.",
    nearbyCompetitors: ["south-flagler-house", "forte-on-flagler"],
    brookesTake: "Maison d'Or is a jewel-box waterfront development. It is the perfect midpoint for buyers who want the residential quiet of South Flagler without the larger footprint of South Flagler House."
  }
};
