export type NewsSearchSource = {
  id: string;
  label: string;
  query: string;
  category: "development" | "construction" | "planning" | "sales" | "financing" | "city" | "press-release" | "general";
};

export const newsSearchSources: readonly NewsSearchSource[] = [
  { id: "wpb-development", label: "West Palm Beach development", query: "West Palm Beach development", category: "development" },
  { id: "wpb-new-construction", label: "West Palm Beach new construction", query: "West Palm Beach new construction", category: "construction" },
  { id: "wpb-condo-development", label: "West Palm Beach condo development", query: "West Palm Beach condo development", category: "sales" },
  { id: "downtown-wpb-development", label: "Downtown West Palm Beach development", query: "Downtown West Palm Beach development", category: "development" },
  { id: "wpb-real-estate-development", label: "West Palm Beach real estate development", query: "West Palm Beach real estate development", category: "development" },
];

export const preferredNewsHosts = [
  "wpb.org",
  "wpbcra.org",
  "wptv.com",
  "wpbf.com",
  "cbs12.com",
  "wflx.com",
  "floridayimby.com",
  "businesswire.com",
  "prnewswire.com",
  "greatgulfgroup.com",
  "relatedross.com",
  "norahouse.com",
] as const;

export const likelyPaywalledHosts = [
  "palmbeachpost.com",
  "bizjournals.com",
  "therealdeal.com",
] as const;
