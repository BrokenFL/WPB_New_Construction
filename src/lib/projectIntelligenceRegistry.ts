export type ProjectIntelligenceRegistryEntry = {
  publicSlug: string;
  publicRoute: string;
  publicDisplayName: string;
  corridor: string;
  publicStatus: string;
  publicDelivery: string;
  publicResidenceCount: string;
  publicAddress: string;
  sourceCatalogIds: string[];
  compareDatabaseId?: string;
  compareDatabaseSlug?: string;
  alternateAliases?: string[];
  collapsedSourceCatalogIds?: string[];
  notes?: string[];
};

const registryEntries = [
  {
    publicSlug: "olara",
    publicRoute: "/projects/olara/",
    publicDisplayName: "Olara West Palm Beach",
    corridor: "North Flagler",
    publicStatus: "Under Construction",
    publicDelivery: "2027",
    publicResidenceCount: "275",
    publicAddress: "1919 N Flagler Drive, West Palm Beach, FL 33407",
    sourceCatalogIds: ["olara"],
    compareDatabaseId: "olara-wpb",
    compareDatabaseSlug: "olara-west-palm-beach",
    alternateAliases: ["olara-west-palm-beach", "olara-wpb"],
  },
  {
    publicSlug: "ritz-carlton-wpb",
    publicRoute: "/projects/ritz-carlton-wpb/",
    publicDisplayName: "The Ritz-Carlton Residences, West Palm Beach",
    corridor: "North Flagler",
    publicStatus: "Under Construction",
    publicDelivery: "2028",
    publicResidenceCount: "138",
    publicAddress: "1745 N Flagler Drive, West Palm Beach, FL 33407",
    sourceCatalogIds: ["ritz-carlton-wpb"],
    compareDatabaseId: "ritz-carlton-residences-west-palm-beach",
    compareDatabaseSlug: "ritz-carlton-residences-west-palm-beach",
    alternateAliases: ["ritz-carlton-residences-west-palm-beach"],
  },
  {
    publicSlug: "shorecrest",
    publicRoute: "/projects/shorecrest/",
    publicDisplayName: "Shorecrest",
    corridor: "North Flagler",
    publicStatus: "Active Sales / Under Construction",
    publicDelivery: "Confirm with sales team",
    publicResidenceCount: "98",
    publicAddress: "1865 N Flagler Drive, West Palm Beach, FL 33407",
    sourceCatalogIds: ["shorecrest"],
    compareDatabaseId: "shorecrest-wpb",
    compareDatabaseSlug: "shorecrest-west-palm-beach",
    alternateAliases: ["shorecrest-wpb", "shorecrest-west-palm-beach"],
  },
  {
    publicSlug: "south-flagler-house",
    publicRoute: "/projects/south-flagler-house/",
    publicDisplayName: "South Flagler House",
    corridor: "South Flagler",
    publicStatus: "Under Construction",
    publicDelivery: "2027",
    publicResidenceCount: "108",
    publicAddress: "1355 S Flagler Drive, West Palm Beach, FL 33401",
    sourceCatalogIds: ["south-flagler-house-north", "south-flagler-house-south"],
    compareDatabaseId: "south-flagler-house",
    compareDatabaseSlug: "south-flagler-house",
    alternateAliases: ["south-flagler-house-north", "south-flagler-house-south"],
    collapsedSourceCatalogIds: ["south-flagler-house-north", "south-flagler-house-south"],
  },
  {
    publicSlug: "nora-house",
    publicRoute: "/projects/nora-house/",
    publicDisplayName: "Nora House",
    corridor: "Downtown",
    publicStatus: "Sales Launched / Pipeline",
    publicDelivery: "2029",
    publicResidenceCount: "117",
    publicAddress: "1105 N. Dixie Highway, West Palm Beach, FL 33401",
    sourceCatalogIds: ["nora-house"],
    compareDatabaseId: "nora-house-wpb",
    compareDatabaseSlug: "nora-house-west-palm-beach",
    alternateAliases: ["nora-house-wpb", "nora-house-west-palm-beach"],
  },
  {
    publicSlug: "banyan-tree",
    publicRoute: "/projects/banyan-tree/",
    publicDisplayName: "Banyan Tree Residences West Palm Beach",
    corridor: "Downtown",
    publicStatus: "Sales Open",
    publicDelivery: "Projected 2028",
    publicResidenceCount: "88",
    publicAddress: "400 Hibiscus Street, West Palm Beach, FL 33401",
    sourceCatalogIds: ["banyan-tree"],
    compareDatabaseId: "banyan-tree-residences-wpb",
    compareDatabaseSlug: "banyan-tree-residences-west-palm-beach",
    alternateAliases: ["banyan-tree-residences-west-palm-beach", "banyan-tree-residences-wpb"],
  },
  {
    publicSlug: "mr-c",
    publicRoute: "/projects/mr-c/",
    publicDisplayName: "Mr. C Residences West Palm Beach",
    corridor: "Downtown",
    publicStatus: "Under Construction",
    publicDelivery: "Confirm with sales team",
    publicResidenceCount: "146",
    publicAddress: "327 Okeechobee Boulevard, West Palm Beach, FL 33401",
    sourceCatalogIds: ["mr-c"],
    compareDatabaseId: "mr-c-residences-wpb",
    compareDatabaseSlug: "mr-c-residences-west-palm-beach",
    alternateAliases: ["mr-c-residences-west-palm-beach", "mr-c-residences-wpb"],
  },
  {
    publicSlug: "alba-palm-beach",
    publicRoute: "/projects/alba-palm-beach/",
    publicDisplayName: "Alba Palm Beach",
    corridor: "North Flagler",
    publicStatus: "Under Construction",
    publicDelivery: "Spring 2026 estimated",
    publicResidenceCount: "55",
    publicAddress: "4714 N. Flagler Drive, West Palm Beach, FL 33407",
    sourceCatalogIds: ["alba-palm-beach"],
    compareDatabaseId: "alba-palm-beach",
    compareDatabaseSlug: "alba-palm-beach",
  },
  {
    publicSlug: "berkeley",
    publicRoute: "/projects/berkeley/",
    publicDisplayName: "The Berkeley Palm Beach",
    corridor: "Downtown",
    publicStatus: "Under Construction",
    publicDelivery: "Confirm with sales team",
    publicResidenceCount: "193",
    publicAddress: "601-621 Clearwater Park Road, West Palm Beach, FL 33401",
    sourceCatalogIds: ["berkeley"],
    compareDatabaseId: "berkeley-wpb",
    compareDatabaseSlug: "the-berkeley-west-palm-beach",
    alternateAliases: ["berkeley-palm-beach", "berkeley-wpb", "the-berkeley-west-palm-beach"],
  },
  {
    publicSlug: "maison-dor",
    publicRoute: "/projects/maison-dor/",
    publicDisplayName: "Maison d'Or",
    corridor: "South Flagler",
    publicStatus: "Preconstruction / Details Emerging",
    publicDelivery: "2028 reported",
    publicResidenceCount: "39",
    publicAddress: "South Flagler Drive, West Palm Beach, FL",
    sourceCatalogIds: ["maison-dor"],
    compareDatabaseId: "maison-dor-south-flagler",
    compareDatabaseSlug: "maison-dor-south-flagler",
    alternateAliases: ["maison-dor-south-flagler"],
  },
  {
    publicSlug: "edgeworth",
    publicRoute: "/projects/edgeworth/",
    publicDisplayName: "Edgeworth",
    corridor: "South Flagler",
    publicStatus: "Announced / Pipeline",
    publicDelivery: "Pipeline watch",
    publicResidenceCount: "168",
    publicAddress: "1155 S Flagler Drive, West Palm Beach, FL",
    sourceCatalogIds: ["edgeworth-north", "edgeworth-south"],
    compareDatabaseId: "edgeworth-wpb",
    compareDatabaseSlug: "edgeworth-west-palm-beach",
    alternateAliases: ["edgeworth-north", "edgeworth-south", "edgeworth-wpb", "edgeworth-west-palm-beach"],
    collapsedSourceCatalogIds: ["edgeworth-north", "edgeworth-south"],
  },
  {
    publicSlug: "mandarin-oriental",
    publicRoute: "/projects/mandarin-oriental/",
    publicDisplayName: "Mandarin Oriental Residences West Palm Beach",
    corridor: "North Flagler",
    publicStatus: "Sales Open",
    publicDelivery: "Anticipated 2031",
    publicResidenceCount: "87",
    publicAddress: "5400 N Flagler Drive, West Palm Beach, FL 33407",
    sourceCatalogIds: ["mandarin-oriental"],
    compareDatabaseId: "mandarin-oriental-residences-wpb",
    compareDatabaseSlug: "mandarin-oriental-residences-west-palm-beach",
    alternateAliases: ["mandarin-oriental-residences-west-palm-beach", "mandarin-oriental-residences-wpb"],
  },
  {
    publicSlug: "alba-reserve",
    publicRoute: "/projects/alba-reserve/",
    publicDisplayName: "Alba Reserve",
    corridor: "North Flagler",
    publicStatus: "Reported / Proposed",
    publicDelivery: "Pipeline watch",
    publicResidenceCount: "87",
    publicAddress: "4720 N Flagler Drive, West Palm Beach, FL",
    sourceCatalogIds: ["alba-reserve"],
  },
  {
    publicSlug: "forte-on-flagler",
    publicRoute: "/projects/forte-on-flagler/",
    publicDisplayName: "Forte on Flagler",
    corridor: "South Flagler",
    publicStatus: "Completed Comp",
    publicDelivery: "Completed comp",
    publicResidenceCount: "41",
    publicAddress: "1309 S Flagler Drive, West Palm Beach, FL",
    sourceCatalogIds: ["forte-on-flagler"],
    compareDatabaseId: "forte-on-flagler",
    compareDatabaseSlug: "forte-on-flagler",
  },
  {
    publicSlug: "la-clara",
    publicRoute: "/projects/la-clara/",
    publicDisplayName: "La Clara",
    corridor: "South Flagler",
    publicStatus: "Completed",
    publicDelivery: "Completed 2023",
    publicResidenceCount: "83",
    publicAddress: "1515 S Flagler Drive, West Palm Beach, FL",
    sourceCatalogIds: ["la-clara"],
    compareDatabaseId: "la-clara-wpb",
    compareDatabaseSlug: "la-clara-west-palm-beach",
    alternateAliases: ["la-clara-wpb", "la-clara-west-palm-beach"],
  },
  {
    publicSlug: "fern-and-gardenia-related-ross-fern-street",
    publicRoute: "/projects/fern-and-gardenia-related-ross-fern-street/",
    publicDisplayName: "Fern & Gardenia / Related Ross Fern Street Project",
    corridor: "Downtown",
    publicStatus: "Pipeline / Watchlist",
    publicDelivery: "Pipeline watch",
    publicResidenceCount: "100-130 proposed",
    publicAddress: "430-464 Fern St",
    sourceCatalogIds: ["related-ross-fern-street"],
    alternateAliases: ["related-ross-fern-street"],
  },
  {
    publicSlug: "rosewood-residences-west-palm-beach",
    publicRoute: "/projects/rosewood-residences-west-palm-beach/",
    publicDisplayName: "Rosewood Residences West Palm Beach",
    corridor: "North Flagler",
    publicStatus: "Pipeline / Branded Residences",
    publicDelivery: "Timing not released",
    publicResidenceCount: "90",
    publicAddress: "2001 N Flagler Drive, West Palm Beach, FL",
    sourceCatalogIds: ["rosewood-residences-west-palm-beach"],
    compareDatabaseId: "rosewood-residences-west-palm-beach",
    compareDatabaseSlug: "rosewood-residences-west-palm-beach",
    alternateAliases: ["rosewood"],
  },
  {
    publicSlug: "rybovich-marina-redevelopment",
    publicRoute: "/projects/rybovich-marina-redevelopment/",
    publicDisplayName: "Rybovich Marina Redevelopment",
    corridor: "North Flagler",
    publicStatus: "Pipeline / Planning Approved",
    publicDelivery: "Pipeline watch",
    publicResidenceCount: "Up to 660 planned",
    publicAddress: "4000-4300 N Flagler Dr",
    sourceCatalogIds: ["rybovich-marina"],
    alternateAliases: ["rybovich-marina"],
    notes: ["No compare row is currently published for this project."],
  },
] satisfies ProjectIntelligenceRegistryEntry[];

export const projectIntelligenceRegistryEntries = registryEntries;

export const projectIntelligenceRegistryByPublicSlug = Object.fromEntries(
  registryEntries.map((entry) => [entry.publicSlug, entry]),
) as Record<string, ProjectIntelligenceRegistryEntry>;

export const projectIntelligenceRegistryAliasToPublicSlug = Object.fromEntries(
  registryEntries.flatMap((entry) => {
    const aliases = new Set<string>([
      entry.publicSlug,
      entry.publicRoute,
      entry.compareDatabaseId,
      entry.compareDatabaseSlug,
      ...(entry.alternateAliases ?? []),
      ...(entry.sourceCatalogIds ?? []),
      ...(entry.collapsedSourceCatalogIds ?? []),
    ].filter((value): value is string => Boolean(value && value.trim())));
    return [...aliases].map((alias) => [alias, entry.publicSlug] as const);
  }),
) as Record<string, string>;

export function resolveProjectIntelligenceRegistryEntry(identifier: string) {
  const normalized = identifier.trim();
  if (!normalized) return undefined;
  const publicSlug = projectIntelligenceRegistryAliasToPublicSlug[normalized];
  return publicSlug ? projectIntelligenceRegistryByPublicSlug[publicSlug] : undefined;
}

export function resolveSourceCatalogProjectId(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  return entry?.sourceCatalogIds[0] ?? identifier.trim();
}

export function resolveCompareDatabaseProjectId(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  return entry?.compareDatabaseId ?? identifier.trim();
}

export function resolveCompareDatabaseProjectSlug(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  return entry?.compareDatabaseSlug ?? identifier.trim();
}

export function listProjectIntelligenceAliases(identifier: string) {
  const entry = resolveProjectIntelligenceRegistryEntry(identifier);
  if (!entry) return [identifier.trim()].filter(Boolean);
  return [
    entry.publicSlug,
    entry.publicRoute,
    ...(entry.sourceCatalogIds ?? []),
    ...(entry.compareDatabaseId ? [entry.compareDatabaseId] : []),
    ...(entry.compareDatabaseSlug ? [entry.compareDatabaseSlug] : []),
    ...(entry.alternateAliases ?? []),
    ...(entry.collapsedSourceCatalogIds ?? []),
  ].filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
}
