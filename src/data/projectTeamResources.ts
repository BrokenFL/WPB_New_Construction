export type ProjectTeamResource = {
  projectId: string;
  role: "Developer" | "Builder" | "Architect" | "Interior Designer" | "Landscape Architect" | "Brand Partner" | "Sales Team";
  name: string;
  websiteUrl?: string;
  imagePath?: string;
  imageStatus: "available" | "needs-sourcing" | "placeholder";
  caption: string;
  sourceUrl?: string;
  notes: string;
};

export const projectTeamResources: readonly ProjectTeamResource[] = [
  {
    projectId: "olara",
    role: "Developer",
    name: "Savanna",
    websiteUrl: "https://www.savannafund.com/",
    imageStatus: "placeholder",
    caption: "Project team reference",
    sourceUrl: "https://www.olara.com/",
    notes: "Use a neutral team profile placeholder until a reviewed logo or official team image is available.",
  },
  {
    projectId: "rosewood",
    role: "Brand Partner",
    name: "Rosewood",
    websiteUrl: "https://www.rosewoodhotels.com/",
    imageStatus: "placeholder",
    caption: "Brand partner reference",
    sourceUrl: "https://www.rosewoodhotels.com/",
    notes: "Use logo-style or neutral placeholder material only after confirming publication rights.",
  },
  {
    projectId: "nora-house",
    role: "Developer",
    name: "NORA district team",
    websiteUrl: "https://www.noradistrict.com/",
    imageStatus: "placeholder",
    caption: "Project team reference",
    sourceUrl: "https://www.noradistrict.com/",
    notes: "Source official developer or district imagery before public display.",
  },
  {
    projectId: "south-flagler-house",
    role: "Architect",
    name: "Robert A.M. Stern Architects",
    websiteUrl: "https://www.ramsa.com/",
    imageStatus: "placeholder",
    caption: "Architecture team reference",
    sourceUrl: "https://www.southflaglerhouse.com/",
    notes: "Use a clean team profile placeholder unless an approved official image is provided.",
  },
];
