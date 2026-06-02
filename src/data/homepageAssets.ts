export const homepageAssets = {
  hero: {
    desktop: "/assets/home/wpb-waterfront-bridge-hero-v01.jpg",
    mobile: "/assets/home/wpb-waterfront-bridge-hero-v01.jpg",
  },
  corridors: {
    "north-flagler": "/assets/home/north-flagler-corridor-skyline-square-v01.jpg",
    downtown: "/assets/home/downtown-cityplace-shared-card-v01.jpg",
    "south-flagler": "/assets/home/south-flagler-corridor-hero-main-square-v01.jpg",
  },
  lifestyle: {
    downtown: "/assets/home/downtown-corridor-bridge-daytime-v01.jpg",
    nora: "/assets/home/downtown-nora-hero-v01.jpg",
    marina: "/assets/home/marina-redevelopment-hero-wide-v01.jpg",
    "south-flagler": "/assets/home/south-flagler-corridor-hero-main-wide-v01.jpg",
  },
  projects: {
    "alba-palm-beach": "/assets/home/alba-project-card-main-v01.jpg",
    "alba-reserve": "/assets/home/alba-reserve-project-card-main-v01.jpg",
    "banyan-tree": "/assets/home/banyan-tree-project-card-main-v01.jpg",
    berkeley: "/assets/home/berkeley-project-card-main-v01.jpg",
    edgeworth: "/assets/home/edgeworth-project-card-main-v01.jpg",
    "forte-on-flagler": "/assets/home/forte-project-card-main-v01.jpg",
    "la-clara": "/assets/home/la-clara-project-card-main-v01.jpg",
    "maison-dor": "/assets/home/maison-dor-project-card-main-v01.jpg",
    "mandarin-oriental": "/assets/home/mandarin-oriental-project-card-main-v01.jpg",
    "mr-c": "/assets/home/mr-c-project-card-main-v01.jpg",
    "nora-house": "/assets/home/nora-house-project-card-main-v01.jpg",
    olara: "/assets/home/olara-project-card-main-v01.jpg",
    "ritz-carlton-wpb": "/assets/home/ritz-carlton-project-card-main-v01.jpg",
    "rosewood-residences-west-palm-beach": "/assets/home/rosewood-project-card-main-v01.jpg",
    "rybovich-marina-redevelopment": "/assets/home/rybovich-marina-project-card-main-v01.jpg",
    shorecrest: "/assets/home/shorecrest-project-card-main-v01.jpg",
    "south-flagler-house": "/assets/home/south-flagler-house-project-card-main-v01.jpg",
  },
} as const;

export function homepageProjectCardImage(projectId: string) {
  return homepageAssets.projects[projectId as keyof typeof homepageAssets.projects];
}
