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
    status: "needs-sourcing",
    geographyNote:
      "Downtown WPB sits west of the Intracoastal / Lake Worth Lagoon; Palm Beach island and the Atlantic sit east across the water.",
  },
  {
    id: "flagler-waterfront-corridor",
    title: "Flagler waterfront corridor",
    routeUse: ["/corridors/north-flagler/", "/corridors/south-flagler/", "/market-notes/olara-vs-shorecrest-waterfront-buyer-profiles/"],
    assetPath: "/assets/editorial/flagler-waterfront-corridor.jpg",
    fallbackGradient: "waterfront",
    alt: "Editorial image of the Flagler waterfront corridor with towers, marina context, and Palm Beach across the Intracoastal.",
    caption: "Editorial visual",
    status: "needs-sourcing",
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
    status: "needs-sourcing",
    geographyNote: "Use city and street-life cues rather than beach imagery.",
  },
  {
    id: "rosemary-square-corridor",
    title: "Rosemary and The Square corridor",
    routeUse: ["/map/", "/corridors/downtown/"],
    assetPath: "/assets/editorial/rosemary-square-corridor.jpg",
    fallbackGradient: "rosemary",
    alt: "Editorial image of open-air Rosemary and The Square dining and retail context in West Palm Beach.",
    caption: "Editorial visual",
    status: "needs-sourcing",
    geographyNote: "Keep the visual grounded in the downtown retail and dining district.",
  },
  {
    id: "nora-growth-corridor",
    title: "NORA and North Downtown growth corridor",
    routeUse: ["/map/", "/corridors/downtown/"],
    assetPath: "/assets/editorial/nora-growth-corridor.jpg",
    fallbackGradient: "nora",
    alt: "Editorial image of NORA and North Downtown growth with adaptive reuse and new development energy.",
    caption: "Editorial visual",
    status: "needs-sourcing",
    geographyNote: "Show emerging district energy north of the core without implying beach frontage.",
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
