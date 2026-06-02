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
    id: "wpb-waterfront-bridge",
    src: "/assets/home/wpb-waterfront-bridge-hero-v01.jpg",
    alt: "West Palm Beach waterfront skyline and bridge viewed across the Intracoastal Waterway.",
    caption: "West Palm Beach waterfront.",
    credit: "Approved homepage asset, optimized for site use.",
    corridorKey: "north-flagler",
  },
  {
    id: "south-flagler-corridor",
    src: "/assets/home/south-flagler-corridor-hero-main-wide-v01.jpg",
    alt: "Editorial image of the South Flagler waterfront corridor with Intracoastal and Palm Beach context.",
    caption: "South Flagler waterfront corridor.",
    credit: "Approved homepage asset, optimized for site use.",
    corridorKey: "south-flagler",
  },
  {
    id: "rosemary-square-corridor",
    src: "/assets/home/downtown-corridor-bridge-night-v01.jpg",
    alt: "Downtown West Palm Beach skyline illuminated along the Intracoastal at night.",
    caption: "Downtown West Palm Beach waterfront context.",
    credit: "Approved homepage asset, optimized for site use.",
    corridorKey: "downtown",
  },
  {
    id: "nora-growth-corridor",
    src: "/assets/home/downtown-nora-hero-v01.jpg",
    alt: "Editorial image of the NORA and North Downtown West Palm Beach growth district.",
    caption: "NORA and North Downtown growth corridor.",
    credit: "Approved homepage asset, optimized for site use.",
    corridorKey: "downtown",
  },
] as const;
