export type HomeHeroImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  credit?: string;
  corridorKey?: "north-flagler" | "downtown" | "south-flagler";
};

export const homeHeroImages: readonly HomeHeroImage[] = [
  {
    id: "wpb-geography-map-hero",
    src: "/assets/editorial/wpb-geography-map-hero.jpg",
    alt: "Editorial geography image showing Downtown West Palm Beach west of the Intracoastal with Palm Beach island to the east.",
    caption: "Downtown West Palm Beach, the Intracoastal, and Palm Beach geography.",
    credit: "User-provided editorial image, optimized for site use.",
  },
  {
    id: "flagler-waterfront-corridor",
    src: "/assets/editorial/flagler-waterfront-corridor.jpg",
    alt: "Editorial image of the North Flagler waterfront corridor with towers, marina context, and Palm Beach across the Intracoastal.",
    caption: "North Flagler waterfront corridor.",
    credit: "User-provided North Flagler editorial image, optimized for site use.",
    corridorKey: "north-flagler",
  },
  {
    id: "south-flagler-corridor",
    src: "/assets/editorial/south-flagler-corridor.jpg",
    alt: "Editorial image of the South Flagler waterfront corridor with Intracoastal and Palm Beach context.",
    caption: "South Flagler waterfront corridor.",
    credit: "User-provided South Flagler editorial image, optimized for site use.",
    corridorKey: "south-flagler",
  },
  {
    id: "rosemary-square-corridor",
    src: "/assets/editorial/rosemary-square-corridor.jpg",
    alt: "Editorial image of CityPlace and The Square lifestyle context in Downtown West Palm Beach.",
    caption: "CityPlace and The Square downtown lifestyle context.",
    credit: "User-provided Downtown West Palm Beach editorial image, optimized for site use.",
    corridorKey: "downtown",
  },
  {
    id: "nora-growth-corridor",
    src: "/assets/editorial/nora-growth-corridor.jpg",
    alt: "Editorial image of the NORA and North Downtown West Palm Beach growth district.",
    caption: "NORA and North Downtown growth corridor.",
    credit: "User-provided NORA editorial image, optimized for site use.",
    corridorKey: "downtown",
  },
] as const;
