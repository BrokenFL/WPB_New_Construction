export type EditorialImage = {
  id: string;
  title: string;
  routeUse: string[];
  assetPath: string;
  fallbackGradient?: string;
  alt: string;
  caption: string;
  credit?: string;
  status: "available" | "placeholder" | "needs-sourcing";
  geographyNote?: string;
};

export const editorialImagery: readonly EditorialImage[] = [
  {
    id: "wpb-geography-map-hero",
    title: "West Palm Beach geography orientation",
    routeUse: ["/", "/map/", "/market-notes/downtown-west-palm-beach-condo-corridors-explained/"],
    assetPath: "/assets/editorial/wpb-geography-map-hero.jpg",
    fallbackGradient: "geography",
    alt: "Editorial geography image showing Downtown West Palm Beach west of the Intracoastal with Palm Beach island to the east.",
    caption: "Editorial visual",
    credit: "User-provided editorial image, optimized for site use.",
    status: "available",
    geographyNote:
      "Downtown WPB sits west of the Intracoastal / Lake Worth Lagoon; Palm Beach island and the Atlantic sit east across the water.",
  },
  {
    id: "flagler-waterfront-corridor",
    title: "Flagler waterfront corridor",
    routeUse: ["/corridors/north-flagler/", "/market-notes/olara-vs-shorecrest-waterfront-buyer-profiles/"],
    assetPath: "/assets/editorial/flagler-waterfront-corridor.jpg",
    fallbackGradient: "waterfront",
    alt: "Editorial image of the Flagler waterfront corridor with towers, marina context, and Palm Beach across the Intracoastal.",
    caption: "Editorial visual",
    credit: "User-provided North Flagler editorial image, optimized for site use.",
    status: "available",
    geographyNote: "Show Intracoastal waterfront context, not Atlantic surf directly against Downtown West Palm Beach.",
  },
  {
    id: "downtown-core-corridor",
    title: "Downtown core corridor",
    routeUse: ["/corridors/downtown/"],
    assetPath: "/assets/editorial/downtown-core-corridor.jpg",
    fallbackGradient: "downtown",
    alt: "Editorial image of walkable Downtown West Palm Beach with restaurants, offices, and residential towers.",
    caption: "Editorial visual",
    credit: "User-provided Downtown West Palm Beach editorial image, optimized for site use.",
    status: "available",
    geographyNote: "Use city and street-life cues rather than beach imagery.",
  },
  {
    id: "rosemary-square-corridor",
    title: "Rosemary and The Square corridor",
    routeUse: ["/map/", "/corridors/downtown/"],
    assetPath: "/assets/editorial/rosemary-square-corridor.jpg",
    fallbackGradient: "rosemary",
    alt: "Editorial image of CityPlace and The Square lifestyle context in Downtown West Palm Beach.",
    caption: "Editorial visual",
    credit: "User-provided Downtown West Palm Beach editorial image, optimized for site use.",
    status: "available",
    geographyNote: "Keep the visual grounded in the downtown retail and dining district.",
  },
  {
    id: "nora-growth-corridor",
    title: "NORA and North Downtown growth corridor",
    routeUse: ["/map/", "/corridors/downtown/"],
    assetPath: "/assets/editorial/nora-growth-corridor.jpg",
    fallbackGradient: "nora",
    alt: "Editorial image of the NORA and North Downtown West Palm Beach growth district.",
    caption: "Editorial visual",
    credit: "User-provided NORA editorial image, optimized for site use.",
    status: "available",
    geographyNote: "Show emerging district energy north of the core without implying beach frontage.",
  },
  {
    id: "south-flagler-corridor",
    title: "South Flagler corridor",
    routeUse: ["/map/", "/corridors/south-flagler/"],
    assetPath: "/assets/editorial/south-flagler-corridor.jpg",
    fallbackGradient: "waterfront",
    alt: "Editorial image of the South Flagler waterfront corridor in West Palm Beach with Intracoastal and Palm Beach context.",
    caption: "Editorial visual",
    credit: "User-provided South Flagler editorial image, optimized for site use.",
    status: "available",
    geographyNote: "South Flagler should show Intracoastal waterfront context, not North Flagler or Atlantic surf.",
  },
  {
    id: "south-flagler-evening-corridor",
    title: "South Flagler evening corridor",
    routeUse: ["/corridors/south-flagler/"],
    assetPath: "/assets/editorial/south-flagler-evening-corridor.jpg",
    fallbackGradient: "waterfront",
    alt: "Editorial evening image of the South Flagler waterfront corridor in West Palm Beach.",
    caption: "Editorial visual",
    credit: "User-provided South Flagler editorial image, optimized for site use.",
    status: "available",
    geographyNote: "Use as South Flagler context only, not as North Flagler or Downtown core imagery.",
  },
  {
    id: "kravis-center-downtown-attraction",
    title: "Kravis Center downtown attraction",
    routeUse: ["/map/", "/corridors/downtown/", "/market-notes/downtown-west-palm-beach-condo-corridors-explained/"],
    assetPath: "/assets/editorial/kravis-center-downtown-attraction.jpg",
    fallbackGradient: "downtown",
    alt: "Editorial image of the Kravis Center, a major cultural attraction in Downtown West Palm Beach.",
    caption: "Downtown attraction",
    credit: "User-provided Downtown West Palm Beach attraction image, optimized for site use.",
    status: "available",
    geographyNote: "Use as cultural and walkability context, not as a building or waterfront image.",
  },
  {
    id: "buyer-intelligence-interior",
    title: "Buyer intelligence interior",
    routeUse: ["/inquire/", "/market-notes/", "/compare/"],
    assetPath: "/assets/editorial/buyer-intelligence-interior.jpg",
    fallbackGradient: "interior",
    alt: "Editorial condo interior overlooking the Intracoastal toward Palm Beach and the Atlantic beyond.",
    caption: "Editorial visual",
    status: "needs-sourcing",
    geographyNote: "Interior view should look east across the lagoon toward Palm Beach, with the Atlantic beyond.",
  },
] as const;

export type EditorialImageId = (typeof editorialImagery)[number]["id"];

export function editorialImageForId(id: string) {
  return editorialImagery.find((image) => image.id === id);
}
