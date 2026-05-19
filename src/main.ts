import "./style.css";
import {
  answerEngineFaq,
  floorplanLibrary,
  projectFacts,
  researchNewsFeed,
  siteMeta,
} from "./generated/siteData";
import { editorProjectOverrides, type EditorProjectOverrides } from "./generated/editorOverrides";
import { escapeHtml, safeHref } from "./renderUtils";

type MediaAsset = {
  src: string;
  title: string;
  kicker: string;
  alt: string;
};

type TeamCredit = {
  role: string;
  name: string;
  note: string;
};

type ProjectFact = {
  label: string;
  value: string;
  note?: string;
};

type CorridorKey = "north-flagler" | "downtown" | "south-flagler";

type FeaturedProject = {
  id: string;
  name: string;
  corridor: string;
  corridorKey: CorridorKey;
  status: string;
  delivery: string;
  deliveryYear: number;
  residences: string;
  price: string;
  href: string;
  image?: string;
  summary: string;
  floorplans: boolean;
  pageState: string;
  rank: number;
  longitude: number;
  latitude: number;
  address: string;
};

type Route =
  | { type: "home"; projectId?: undefined }
  | { type: "news"; projectId?: undefined }
  | { type: "inquire"; projectId?: undefined }
  | { type: "floorplans"; projectId?: undefined }
  | { type: "answers"; projectId?: undefined }
  | { type: "methodology"; projectId?: undefined }
  | { type: "privacy"; projectId?: undefined }
  | { type: "terms"; projectId?: undefined }
  | { type: "fair-housing"; projectId?: undefined }
  | { type: "project"; projectId: string };

type ProjectFilter = {
  key: string;
  label: string;
};

type CorridorSection = {
  key: CorridorKey;
  label: string;
  detail: string;
  reviewNote: string;
};

type NewsItem = {
  kicker: string;
  title: string;
  summary: string;
  tag: string;
};

type ResearchNewsItem = {
  id: string;
  title: string;
  summary: string;
  rewrittenSummary?: string;
  category: string;
  dateModified: string;
  projectIds: readonly string[];
  sourceName: string;
  sourceUrl: string;
  image?: {
    path?: string;
    sourceUrl?: string;
    credit?: string;
  };
  status: string;
};

type ProjectDocument = {
  label: string;
  title: string;
  note: string;
  href?: string;
};

type ProjectPageDraft = {
  kicker: string;
  title: string;
  intro: string;
  image?: string;
  imageAlt: string;
  stage: string;
  locationCopy: string;
  facts: ProjectFact[];
  team: TeamCredit[];
  highlights: ProjectFact[];
  gallery: MediaAsset[];
  documents: ProjectDocument[];
  needed: string[];
};

type GoogleMapsNamespace = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => {
    fitBounds: (bounds: unknown, padding?: number) => void;
    addListener: (eventName: string, handler: () => void) => void;
  };
  LatLngBounds: new () => {
    extend: (position: { lat: number; lng: number }) => void;
  };
  Marker: new (options: Record<string, unknown>) => {
    setMap: (map: unknown | null) => void;
    addListener: (eventName: string, handler: () => void) => void;
  };
  SymbolPath: {
    CIRCLE: unknown;
  };
};

type WindowWithGoogleMaps = Window & {
  google?: {
    maps?: GoogleMapsNamespace;
  };
};

type ProjectDraftEditorOverride = NonNullable<EditorProjectOverrides[string]["draft"]>;

const mediaBase = "/projects/olara/media/";
const docsBase = "/projects/olara/docs/";
const ritzMediaBase = "/projects/ritz-carlton-wpb/media/";
const ritzDocsBase = "/projects/ritz-carlton-wpb/docs/";
const ritzBrochureUrl = "https://www.flipsnack.com/relatedgroup/ritzwpb-brochure/full-view.html";
const noraHouseUserHero = "/projects/nora-house/media/user-provided-nora-house-hero.jpg";
const noraHouseUserCard = "/projects/nora-house/media/user-provided-nora-house-card.jpg";
const southFlaglerHouseUserHero = "/projects/south-flagler-house/media/user-provided-south-flagler-house-hero.jpg";
const southFlaglerHouseUserCard = "/projects/south-flagler-house/media/user-provided-south-flagler-house-card.jpg";
const shorecrestUserHero = "/projects/shorecrest/media/user-provided-shorecrest-hero.jpg";
const shorecrestUserCard = "/projects/shorecrest/media/user-provided-shorecrest-card.jpg";
const banyanTreeUserCard = "/projects/banyan-tree/media/user-provided-banyan-tree-card.jpg";
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;
const heroMapScriptId = "wpb-google-map-script";
let googleMapsLoader: Promise<GoogleMapsNamespace> | null = null;

const advisorProfile = {
  name: "Brooke Matthew Snader",
  group: "The Scott Gordon Group",
  brokerage: "Douglas Elliman Florida, LLC d/b/a Douglas Elliman",
  brokerageLicense: "CQ1020232",
  mobile: "(561) 891-0186",
  mobileHref: "tel:+15618910186",
  license: "BK3291335",
  email: "info@wpbnewconstruction.com",
  privacyUrl: "https://www.elliman.com/privacy-policy",
  termsUrl: "https://www.elliman.com/terms-of-service",
};

const staticRoutePaths: Record<string, string> = {
  "/floorplans/": "floorplans",
  "/answers/": "answers",
  "/updates/": "news",
  "/methodology/": "methodology",
  "/fair-housing/": "fair-housing",
  "/privacy/": "privacy",
  "/terms/": "terms",
  "/inquire/": "inquire",
};

const baseFeaturedProjects: FeaturedProject[] = [
  {
    id: "olara",
    name: "Olara",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "2027 / 2028 range",
    deliveryYear: 2027,
    residences: "275",
    price: "Confirm before offer",
    href: "?project=olara",
    image: `${mediaBase}olara-hero-exterior-1536x1024.png`,
    summary: "North Flagler waterfront residences anchored by marina access, 80,000+ square feet of amenities, Jose Andres dining, and one of the deepest released floorplan packets in the market.",
    floorplans: true,
    pageState: "Complete profile",
    rank: 1,
    longitude: -80.0501,
    latitude: 26.7307,
    address: "1919 N Flagler Dr",
  },
  {
    id: "ritz-carlton-wpb",
    name: "Ritz-Carlton WPB",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "Expected 2028",
    deliveryYear: 2028,
    residences: "138",
    price: "From $2.5M reported",
    href: "?project=ritz-carlton-wpb",
    image: `${ritzMediaBase}ritz-hero-waterfront-building-2880x1800.png`,
    summary: "A Ritz-Carlton branded North Flagler address from Related Group and BH Group, pairing hospitality-level service with architecture by Arquitectonica, interiors by Rockwell Group, and landscape by Naturalficial.",
    floorplans: true,
    pageState: "Complete profile",
    rank: 2,
    longitude: -80.05057,
    latitude: 26.72848,
    address: "1717 N Flagler Dr",
  },
  {
    id: "shorecrest",
    name: "Shorecrest",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "2027",
    deliveryYear: 2027,
    residences: "98-100",
    price: "Confirm before offer",
    href: "?project=shorecrest",
    image: shorecrestUserCard,
    summary: "A Related Ross waterfront tower at 1865 N Flagler for buyers weighing boutique floor plates, Equinox-curated wellness, and a direct comparison against Olara and Ritz-Carlton.",
    floorplans: true,
    pageState: "Advisory brief",
    rank: 3,
    longitude: -80.05012,
    latitude: 26.72985,
    address: "1865 N Flagler Dr",
  },
  {
    id: "mr-c",
    name: "Mr. C",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Under Construction",
    delivery: "2027",
    deliveryYear: 2027,
    residences: "146",
    price: "Confirm before offer",
    href: "?project=mr-c",
    image: "/projects/mr-c/media/mr-c-waterfront-building-source.jpg",
    summary: "A downtown Cipriani-branded hotel-residence tower with 146 private residences, 110 hotel rooms, and a service-forward lifestyle for buyers prioritizing walkability over pure waterfront seclusion.",
    floorplans: true,
    pageState: "Advisory brief",
    rank: 7,
    longitude: -80.0578,
    latitude: 26.706,
    address: "320 Lakeview Ave",
  },
  {
    id: "alba-palm-beach",
    name: "Alba Palm Beach",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "Spring 2026 reported",
    deliveryYear: 2026,
    residences: "55",
    price: "Confirm before offer",
    href: "?project=alba-palm-beach",
    image: "/projects/alba-palm-beach/media/card.jpg",
    summary: "A boutique 55-residence North Flagler waterfront building at 4714 N Flagler, appealing to buyers who want new construction at a more intimate scale than the larger Flagler towers.",
    floorplans: true,
    pageState: "Advisory brief",
    rank: 8,
    longitude: -80.051,
    latitude: 26.7526,
    address: "4714 N Flagler Dr",
  },
  {
    id: "mandarin-oriental",
    name: "Mandarin Oriental Residences",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Concept / Priority Interest",
    delivery: "Anticipated 2031",
    deliveryYear: 2031,
    residences: "87",
    price: "From $3.5M official launch",
    href: "?project=mandarin-oriental",
    image: "/projects/mandarin-oriental/media/mandarin-oriental-exterior-hero-source.jpg",
    summary: "A long-view North Flagler branded-residence play by Great Gulf with Mandarin Oriental service, Safdie Architects, Studio Munge interiors, and an anticipated 2031 opening.",
    floorplans: false,
    pageState: "Advisory brief",
    rank: 9,
    longitude: -80.0516,
    latitude: 26.759,
    address: "5400 N Flagler Dr",
  },
  {
    id: "south-flagler-house",
    name: "South Flagler House",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Under Construction",
    delivery: "2027",
    deliveryYear: 2027,
    residences: "108",
    price: "Confirm before offer",
    href: "?project=south-flagler-house",
    image: southFlaglerHouseUserCard,
    summary: "RAMSA-designed twin waterfront towers at 1355 S Flagler Drive, positioned for buyers who want South Flagler scale, privacy, and Palm Beach proximity in a new-construction setting.",
    floorplans: false,
    pageState: "Advisory brief",
    rank: 4,
    longitude: -80.0511,
    latitude: 26.7011,
    address: "1355 S Flagler Dr",
  },
  {
    id: "nora-house",
    name: "NORA House",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Planning",
    delivery: "2028 modeled",
    deliveryYear: 2028,
    residences: "Reported 117",
    price: "Confirm before offer",
    href: "?project=nora-house",
    image: noraHouseUserCard,
    summary: "A walkable-district condominium option tied to NORA's restaurant, retail, and social energy, framed around lifestyle and future supply while final offering details are confirmed.",
    floorplans: false,
    pageState: "Market marker",
    rank: 5,
    longitude: -80.0581,
    latitude: 26.7178,
    address: "NORA district",
  },
  {
    id: "banyan-tree",
    name: "Banyan Tree Residences",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Sales launched",
    delivery: "Confirm with sales team",
    deliveryYear: 2028,
    residences: "86",
    price: "Confirm before offer",
    href: "?project=banyan-tree",
    image: banyanTreeUserCard,
    summary: "Banyan Group's first U.S. branded residence brings a hospitality-led, all-corner-residence story to 400 Hibiscus Street in the expanding CityPlace/NORA core.",
    floorplans: false,
    pageState: "Source watch",
    rank: 6,
    longitude: -80.0553,
    latitude: 26.7069,
    address: "400 Hibiscus St",
  },
  {
    id: "berkeley",
    name: "The Berkeley",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Now Selling",
    delivery: "Confirm with sales team",
    deliveryYear: 2027,
    residences: "193",
    price: "Confirm before offer",
    href: "?project=berkeley",
    image: "/projects/berkeley/media/card.jpg",
    summary: "A larger downtown offering at the convention-center edge, useful for buyers comparing newer ownership options near The Square, the office core, and transit-facing urban amenities.",
    floorplans: false,
    pageState: "Source watch",
    rank: 10,
    longitude: -80.0642,
    latitude: 26.7087,
    address: "550 S Australian Ave",
  },
  {
    id: "maison-dor",
    name: "Maison d'Or",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Pre-Construction",
    delivery: "Confirm with sales team",
    deliveryYear: 2028,
    residences: "39",
    price: "Confirm before offer",
    href: "?project=maison-dor",
    image: "/projects/maison-dor/media/card.jpg",
    summary: "A 39-residence South Flagler boutique project at 3705 S Flagler, positioned for buyers who value privacy, larger residences, and a quieter waterfront ownership experience.",
    floorplans: false,
    pageState: "Source watch",
    rank: 11,
    longitude: -80.04927,
    latitude: 26.67787,
    address: "3705 S Flagler Dr",
  },
  {
    id: "forte-on-flagler",
    name: "Forte on Flagler",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Recently Delivered",
    delivery: "Delivered / resale watch",
    deliveryYear: 2024,
    residences: "41",
    price: "Resale inventory varies",
    href: "?project=forte-on-flagler",
    image: "/projects/forte-on-flagler/media/card.jpg",
    summary: "Delivered South Flagler benchmark used to compare boutique scale, finishes, and resale alternatives against active new supply.",
    floorplans: true,
    pageState: "Resale benchmark",
    rank: 12,
    longitude: -80.0509,
    latitude: 26.7019,
    address: "1309 S Flagler Dr",
  },
  {
    id: "la-clara",
    name: "La Clara",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Recently Delivered",
    delivery: "Delivered / resale watch",
    deliveryYear: 2023,
    residences: "83",
    price: "Resale inventory varies",
    href: "?project=la-clara",
    image: "/projects/la-clara/media/card.jpg",
    summary: "Delivered South Flagler tower that helps buyers benchmark current pricing, waterfront views, and finished product quality.",
    floorplans: false,
    pageState: "Resale benchmark",
    rank: 13,
    longitude: -80.0511,
    latitude: 26.6993,
    address: "200 Arkona Ct / 1515 S Flagler Dr",
  },
  {
    id: "edgeworth-north",
    name: "Edgeworth North Tower",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Planning",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "168",
    price: "Not released",
    href: "?project=edgeworth-north",
    image: "/projects/edgeworth-north/media/card.webp",
    summary: "South Flagler pipeline tower at the former Carefree Theatre assemblage, tracked for future inventory and entitlement movement.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 14,
    longitude: -80.0514,
    latitude: 26.6996,
    address: "1155 S Flagler Dr",
  },
  {
    id: "edgeworth-south",
    name: "Edgeworth South Tower",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Planning",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "168",
    price: "Not released",
    href: "?project=edgeworth-south",
    image: "/projects/edgeworth-north/media/card.webp",
    summary: "Second Edgeworth tower marker for buyers watching how much new South Flagler inventory may follow South Flagler House.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 15,
    longitude: -80.0514,
    latitude: 26.6988,
    address: "1155 S Flagler Dr",
  },
  {
    id: "alba-reserve",
    name: "Alba Reserve",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Planning",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "87",
    price: "Not released",
    href: "?project=alba-reserve",
    image: "/projects/alba-reserve/media/card.jpg",
    summary: "North Flagler approvals-watch project near Alba Palm Beach, useful for buyers tracking future boutique waterfront supply.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 16,
    longitude: -80.051,
    latitude: 26.7535,
    address: "4720-4804 N Flagler Dr",
  },
  {
    id: "15-cityplace",
    name: "15 CityPlace",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Under Construction",
    delivery: "Office core catalyst",
    deliveryYear: 2028,
    residences: "Office tower",
    price: "Not condo inventory",
    href: "?project=15-cityplace",
    image: "/projects/15-cityplace/media/card.jpg",
    summary: "Downtown office tower tracked as a demand catalyst for nearby condo inventory, restaurants, and walkable buyer lifestyle.",
    floorplans: false,
    pageState: "Market context",
    rank: 17,
    longitude: -80.0562,
    latitude: 26.7091,
    address: "15 CityPlace",
  },
  {
    id: "related-ross-fern-street",
    name: "Related Ross Fern Street",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Planning",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "130",
    price: "Not released",
    href: "?project=related-ross-fern-street",
    image: "/projects/related-ross-fern-street/media/card.jpg",
    summary: "South Dixie/Fern Street condo pipeline marker that could add more downtown ownership supply near the office and retail core.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 18,
    longitude: -80.0555,
    latitude: 26.7112,
    address: "430-464 Fern St",
  },
  {
    id: "rybovich-marina",
    name: "Rybovich Marina Redevelopment",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Planning",
    delivery: "Pipeline watch",
    deliveryYear: 2030,
    residences: "660",
    price: "Not released",
    href: "?project=rybovich-marina",
    image: "/projects/rybovich-marina/media/card.webp",
    summary: "Large Northwood/Rybovich marina redevelopment watch item with potential to reshape the northern waterfront inventory map.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 19,
    longitude: -80.0506,
    latitude: 26.7461,
    address: "4000-4300 N Flagler Dr",
  },
  {
    id: "fort-partners-south-flagler",
    name: "Fort Partners South Flagler",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Assemblage Watch",
    delivery: "Pipeline watch",
    deliveryYear: 2030,
    residences: "Not released",
    price: "Not released",
    href: "?project=fort-partners-south-flagler",
    image: "/projects/fort-partners-south-flagler/media/card.jpg",
    summary: "South Flagler assemblage watch item for buyers monitoring whether another ultra-luxury waterfront project emerges south of downtown.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 20,
    longitude: -80.0506,
    latitude: 26.6763,
    address: "3901-3915 S Flagler Dr area",
  },
  {
    id: "portofino-flagler-yacht-club",
    name: "Portofino / Flagler Yacht Club",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Buyout Watch",
    delivery: "Pipeline watch",
    deliveryYear: 2030,
    residences: "Not released",
    price: "Not released",
    href: "?project=portofino-flagler-yacht-club",
    image: "/projects/portofino-flagler-yacht-club/media/card.jpg",
    summary: "Condo buyout and yacht-club corridor watch item that could affect future South Flagler waterfront redevelopment supply.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 21,
    longitude: -80.0509,
    latitude: 26.6794,
    address: "3701-3800 Washington Rd area",
  },
];

const projectFactById = new Map(projectFacts.map((project) => [project.projectId, project]));
const featuredProjects = applyEditorProjectOverrides(applySourceFactsToProjects(baseFeaturedProjects), editorProjectOverrides);
const rankedFeaturedProjects = [...featuredProjects].sort((a, b) => a.rank - b.rank);

function applySourceFactsToProjects(projects: FeaturedProject[]): FeaturedProject[] {
  return projects.map((project) => {
    const sourceFact = sourceFactForProject(project.id);
    if (!sourceFact) return project;
    const facts = sourceFact.facts;
    return {
      ...project,
      status: conciseStatus(facts.status) || project.status,
      delivery: conciseDelivery(facts.completion) || project.delivery,
      deliveryYear: deliveryYearFromText(facts.completion, project.deliveryYear),
      residences: conciseResidences(project.id, facts.residences) || project.residences,
      price: concisePricing(facts.pricing) || project.price,
      address: facts.address || project.address,
    };
  });
}

function conciseStatus(value: string) {
  return value?.replace(/;.*$/, "").trim();
}

function conciseDelivery(value: string) {
  if (!value) return "";
  if (/june 2026/i.test(value)) return "Closings from June 2026";
  if (/2028 per current/i.test(value)) return "Expected 2028";
  if (/expected\/delivering 2027/i.test(value)) return "Expected 2027";
  if (/construction planned 2027.*2029/i.test(value)) return "Planned 2029 finish";
  if (/planning-stage timing not publicly confirmed/i.test(value)) return "Timing not released";
  return value.split(";")[0].trim();
}

function deliveryYearFromText(value: string, fallback: number) {
  const match = value?.match(/20\d{2}/);
  return match ? Number(match[0]) : fallback;
}

function conciseResidences(projectId: string, value: string) {
  if (!value) return "";
  if (projectId === "shorecrest") return "98-100";
  if (projectId === "banyan-tree") return "86-88";
  if (projectId === "south-flagler-house") return "105-108";
  if (projectId === "mr-c") return "146 + 110 hotel keys";
  const match = value.match(/\d[\d,]*/);
  return match ? match[0] : value;
}

function concisePricing(value: string) {
  if (!value) return "";
  if (/not applicable/i.test(value)) return "Not condo inventory";
  if (/not publicly confirmed/i.test(value)) return "Not released";
  if (/request current/i.test(value)) return "Request current pricing";
  if (/just under \$3M/i.test(value)) return "From just under $3M";
  if (/roughly \$1\.7M/i.test(value)) return "From about $1.7M";
  if (/about \$3M/i.test(value)) return "From about $3M";
  if (/starting from \$3\.5M/i.test(value)) return "From $3.5M";
  if (/starting at \$5\.7M/i.test(value)) return "From $5.7M";
  if (/high \$1Ms/i.test(value)) return "From high $1Ms reported";
  if (/about \$1\.9M/i.test(value)) return "From about $1.9M reported";
  if (/under \$2M to \$10M/i.test(value)) return "From under $2M reported";
  if (/\$2\.5M to \$35\.5M/i.test(value)) return "$2.5M-$35.5M reported";
  return value.split(";")[0].trim();
}

function applyEditorProjectOverrides(projects: FeaturedProject[], overrides: EditorProjectOverrides): FeaturedProject[] {
  return projects.map((project) => {
    const override = overrides[project.id];
    if (!override) return project;
    return {
      ...project,
      name: cleanOverrideText(override.name) ?? project.name,
      status: cleanOverrideText(override.status) ?? project.status,
      delivery: cleanOverrideText(override.delivery) ?? project.delivery,
      deliveryYear: Number.isFinite(override.deliveryYear) ? Number(override.deliveryYear) : project.deliveryYear,
      residences: cleanOverrideText(override.residences) ?? project.residences,
      price: cleanOverrideText(override.price) ?? project.price,
      image: cleanOverrideText(override.image) ?? project.image,
      summary: cleanOverrideText(override.summary) ?? project.summary,
      pageState: cleanOverrideText(override.pageState) ?? project.pageState,
      address: cleanOverrideText(override.address) ?? project.address,
    };
  });
}

function cleanOverrideText(value: string | undefined) {
  const text = value?.trim();
  return text || undefined;
}

const projectFilters: ProjectFilter[] = [
  { key: "all", label: "All" },
  { key: "waterfront", label: "Waterfront" },
  { key: "under-construction", label: "Under Construction" },
  { key: "delivery-2027", label: "2027+" },
  { key: "floorplans", label: "Floor Plans" },
];

const corridorSections: CorridorSection[] = [
  {
    key: "north-flagler",
    label: "North Flagler",
    detail: "Alba, Olara, Shorecrest, Ritz-Carlton",
    reviewNote: "Waterfront comparison corridor with the deepest active plan and image inventory.",
  },
  {
    key: "downtown",
    label: "Downtown",
    detail: "NORA House, Mr. C",
    reviewNote: "Urban lifestyle corridor where hotel-branded and district projects need current availability checks.",
  },
  {
    key: "south-flagler",
    label: "South Flagler",
    detail: "South Flagler House",
    reviewNote: "Southern waterfront benchmark for buyers comparing scale, privacy, and Palm Beach proximity.",
  },
];

const newsItems: NewsItem[] = [
  {
    kicker: "Construction",
    title: "Ritz-Carlton has moved from sales story to active jobsite.",
    summary: "Groundbreaking coverage and released project materials help buyers compare the North Flagler waterfront set.",
    tag: "Ritz-Carlton",
  },
  {
    kicker: "Floorplans",
    title: "Olara currently has one of the deepest media and floorplan packages in this catalog.",
    summary: "Residence, amenity, marina, brochure, and individual floorplan materials are organized for side-by-side review.",
    tag: "Olara",
  },
  {
    kicker: "Pipeline",
    title: "North Flagler is the first comparison corridor.",
    summary: "Olara, Ritz-Carlton, Shorecrest, Alba, and nearby pipeline projects give buyers a concentrated waterfront decision set.",
    tag: "Market Context",
  },
  {
    kicker: "Buyer Watch",
    title: "Shorecrest is a key project to monitor.",
    summary: "The Related Ross tower gives the waterfront comparison another active, large-scale North Flagler option.",
    tag: "Shorecrest",
  },
];

const projectTeam: TeamCredit[] = [
  {
    role: "Developer",
    name: "Savanna",
    note: "Vertically integrated real estate investment and development firm behind Olara.",
  },
  {
    role: "Architect",
    name: "Arquitectonica",
    note: "Responsible for the sculptural waterfront tower architecture.",
  },
  {
    role: "Interior Designer",
    name: "Gabellini Sheppard",
    note: "Leads the residence and amenity interior design language.",
  },
  {
    role: "Landscape Architect",
    name: "EDSA",
    note: "Landscape and outdoor environment design partner.",
  },
  {
    role: "Construction",
    name: "SavCon + Gilbane",
    note: "Preconstruction and construction management team.",
  },
  {
    role: "Restaurant Partner",
    name: "Jose Andres Group",
    note: "Signature dining partner for the waterfront lifestyle program.",
  },
  {
    role: "Sales And Marketing",
    name: "Compass DMG",
    note: "Exclusive sales and marketing team.",
  },
];

const featuredGallery: MediaAsset[] = [
  {
    src: `${mediaBase}olara-gallery-card-pool-1600x2000.png`,
    kicker: "Gallery Card",
    title: "Poolside Arrival",
    alt: "Olara pool deck with residents seated near the water",
  },
  {
    src: `${mediaBase}olara-arrival-valet-lobby-2400x1600.png`,
    kicker: "Lobby",
    title: "Valet Arrival",
    alt: "Luxury valet arrival and lobby entrance at night",
  },
  {
    src: `${mediaBase}olara-residence-terrace-sunrise-2400x1600.png`,
    kicker: "Residence Terrace",
    title: "Sunrise Terrace",
    alt: "Residence terrace overlooking the Intracoastal at sunrise",
  },
];

const residenceGallery: MediaAsset[] = [
  {
    src: `${mediaBase}olara-residence-living-room-moonlight-2400x1600.png`,
    kicker: "Residence",
    title: "Moonlit Living Room",
    alt: "Warm living room with full-height glass and moonlit water views",
  },
  {
    src: `${mediaBase}olara-residence-kitchen-evening-2400x1600.png`,
    kicker: "Residence",
    title: "Kitchen And Entertaining",
    alt: "Open kitchen and living room with evening water views",
  },
  {
    src: `${mediaBase}olara-residence-primary-bath-2400x1600.png`,
    kicker: "Residence",
    title: "Primary Bath",
    alt: "Primary bathroom with freestanding tub and Intracoastal view",
  },
  {
    src: `${mediaBase}olara-residence-primary-bath-detail-864x1024.jpg`,
    kicker: "Residence",
    title: "Bath Detail",
    alt: "Vertical primary bathroom detail",
  },
];

const amenityGallery: MediaAsset[] = [
  {
    src: `${mediaBase}olara-amenity-gym-2400x1600.png`,
    kicker: "Wellness",
    title: "Fitness Studio",
    alt: "Light-filled fitness studio with cardio equipment and water views",
  },
  {
    src: `${mediaBase}olara-amenity-rooftop-pool-reading-2400x1600.png`,
    kicker: "Pool Deck",
    title: "Rooftop Pool",
    alt: "Rooftop pool deck with residents reading by the water",
  },
  {
    src: `${mediaBase}olara-amenity-spa-relaxation-2400x1600.png`,
    kicker: "Spa",
    title: "Regeneration Spa",
    alt: "Spa relaxation room with residents in robes",
  },
  {
    src: `${mediaBase}olara-amenity-hot-cold-plunge-2400x1600.png`,
    kicker: "Recovery",
    title: "Hot And Cold Plunge",
    alt: "Outdoor hot and cold plunge pools overlooking the Intracoastal",
  },
  {
    src: `${mediaBase}olara-amenity-pool-veranda-refreshments-2400x1600.png`,
    kicker: "Pool Deck",
    title: "Veranda Service",
    alt: "Pool veranda with refreshments and lounge seating",
  },
];

const floorplanDownloads = [
  { label: "Residence A", file: "olara-residence-plan-a.pdf" },
  { label: "Residence B", file: "olara-residence-plan-b.pdf" },
  { label: "Residence C", file: "olara-residence-plan-c.pdf" },
  { label: "Residence D", file: "olara-residence-plan-d.pdf" },
  { label: "Residence E", file: "olara-residence-plan-e.pdf" },
  { label: "Residence F", file: "olara-residence-plan-f.pdf" },
  { label: "Residence G", file: "olara-residence-plan-g.pdf" },
  { label: "Residence H", file: "olara-residence-plan-h.pdf" },
  { label: "Residence I", file: "olara-residence-plan-i.pdf" },
  { label: "Residence J", file: "olara-residence-plan-j.pdf" },
  { label: "Residence K", file: "olara-residence-plan-k.pdf" },
  { label: "Residence L", file: "olara-residence-plan-l.pdf" },
  { label: "Residence M", file: "olara-residence-plan-m.pdf" },
  { label: "Residence N", file: "olara-residence-plan-n.pdf" },
  { label: "Residence O", file: "olara-residence-plan-o.pdf" },
  { label: "Residence P", file: "olara-residence-plan-p.pdf" },
  { label: "Residence Q", file: "olara-residence-plan-q.pdf" },
  { label: "Residence T", file: "olara-residence-plan-t.pdf" },
  { label: "Residence U", file: "olara-residence-plan-u.pdf" },
  { label: "Residence V", file: "olara-residence-plan-v-401-501.pdf", note: "401 / 501" },
  { label: "Residence W", file: "olara-residence-plan-w-402-502.pdf", note: "402 / 502" },
  {
    label: "Residence X",
    file: "olara-residence-plan-x-207-307-403-503.pdf",
    note: "207 / 307 / 403 / 503",
  },
  { label: "Residence Y", file: "olara-residence-plan-y-208.pdf", note: "208" },
  { label: "Residence Y", file: "olara-residence-plan-y-308-404-504.pdf", note: "308 / 404 / 504" },
  { label: "Residence Z", file: "olara-residence-plan-z-209.pdf", note: "209" },
  { label: "Residence Z", file: "olara-residence-plan-z-309-405-505.pdf", note: "309 / 405 / 505" },
];

const ritzFacts: ProjectFact[] = [
  {
    label: "Address",
    value: "1717 N Flagler Dr",
    note: "Official footer/floorplan materials also reference 1745 N Flagler; confirm final legal address before contract use.",
  },
  { label: "Stories", value: "27" },
  { label: "Residences", value: "138" },
  { label: "Delivery", value: "Expected 2028" },
      { label: "Pricing", value: "From $2.5M reported", note: "Request the current availability sheet before touring." },
  { label: "Unit Mix", value: "2-4 bedrooms + lake homes" },
  { label: "Status", value: "Under construction", note: "Groundbreaking reported February 2026; more than 70% pre-sold." },
  { label: "Sales Gallery", value: "50 Cocoanut Row, S101", note: "561-402-8947" },
];

const ritzTeam: TeamCredit[] = [
  {
    role: "Developer",
    name: "Related Group",
    note: "Lead developer for the branded residential tower on the North Flagler waterfront.",
  },
  {
    role: "Co-Developer",
    name: "BH Group",
    note: "Co-development partner on the West Palm Beach Ritz-Carlton Residences.",
  },
  {
    role: "Architect",
    name: "Arquitectonica",
    note: "Architectural design partner for the tower and podium language.",
  },
  {
    role: "Interior Designer",
    name: "Rockwell Group",
    note: "Residence and amenity interiors, including the calm coastal material palette.",
  },
  {
    role: "Landscape Architect",
    name: "Naturalficial",
    note: "Landscape architecture and exterior green-space design.",
  },
  {
    role: "Brand",
    name: "The Ritz-Carlton",
    note: "Residential service platform and branded hospitality standard.",
  },
];

const ritzFeaturedGallery: MediaAsset[] = [
  {
    src: `${ritzMediaBase}ritz-gallery-card-waterfront-tower-1600x2000.png`,
    kicker: "Gallery Card",
    title: "Waterfront Tower",
    alt: "The Ritz-Carlton Residences tower reflected on the waterfront",
  },
  {
    src: `${ritzMediaBase}ritz-arrival-porte-cochere-evening-2400x1600.png`,
    kicker: "Arrival",
    title: "Porte Cochere",
    alt: "Evening arrival at the Ritz-Carlton Residences porte cochere",
  },
  {
    src: `${ritzMediaBase}ritz-lobby-lounge-waterfront-2400x1600.png`,
    kicker: "Lobby",
    title: "Waterfront Lounge",
    alt: "Ritz-Carlton Residences lobby lounge with water views",
  },
];

const ritzResidenceGallery: MediaAsset[] = [
  {
    src: `${ritzMediaBase}ritz-residence-living-room-sunrise-2400x1600.png`,
    kicker: "Residence",
    title: "Sunrise Living Room",
    alt: "Ritz-Carlton residence living room with sunrise water views",
  },
  {
    src: `${ritzMediaBase}ritz-residence-kitchen-entertaining-2400x1600.png`,
    kicker: "Residence",
    title: "Kitchen And Entertaining",
    alt: "Ritz-Carlton residence kitchen with marble island and sunset views",
  },
  {
    src: `${ritzMediaBase}ritz-residence-primary-bath-2400x1600.png`,
    kicker: "Residence",
    title: "Primary Bath",
    alt: "Ritz-Carlton residence primary bathroom with marble and warm lighting",
  },
];

const ritzAmenityGallery: MediaAsset[] = [
  {
    src: `${ritzMediaBase}ritz-amenity-fitness-center-2400x1600.png`,
    kicker: "Wellness",
    title: "Fitness Center",
    alt: "Ritz-Carlton Residences fitness center",
  },
  {
    src: `${ritzMediaBase}ritz-amenity-pool-cabanas-2400x1600.png`,
    kicker: "Pool Deck",
    title: "Private Cabanas",
    alt: "Ritz-Carlton Residences pool deck with cabanas",
  },
  {
    src: `${ritzMediaBase}ritz-arrival-porte-cochere-two-cars-2400x1600.png`,
    kicker: "Service",
    title: "Valet Arrival",
    alt: "Ritz-Carlton Residences valet arrival with two cars",
  },
];

const ritzFloorplanDownloads = [
  { label: "Residence 01", file: "ritz-residence-01.pdf", note: "Floorplan PDF" },
  { label: "Residence 02", file: "ritz-residence-02.pdf", note: "2 Bed / 2.5 Bath" },
  { label: "Residence 03", file: "ritz-residence-03.pdf", note: "3 Bed / 3.5 Bath" },
  { label: "Residence 04", file: "ritz-residence-04.pdf", note: "Floorplan PDF" },
  { label: "Residence 05", file: "ritz-residence-05.pdf", note: "Floorplan PDF" },
  { label: "Residence 06", file: "ritz-residence-06.pdf", note: "Floorplan PDF" },
  { label: "Lake Home 07", file: "ritz-lake-home-07.pdf", note: "Floorplan PDF" },
  { label: "Lake Home 08", file: "ritz-lake-home-08.pdf", note: "Floorplan PDF" },
  { label: "Lake Home 09", file: "ritz-lake-home-09.pdf", note: "Floorplan PDF" },
  { label: "Lake Home 10", file: "ritz-lake-home-10.pdf", note: "Floorplan PDF" },
  { label: "Lake Home 11", file: "ritz-lake-home-11.pdf", note: "Floorplan PDF" },
  { label: "Lake Home 12", file: "ritz-lake-home-12.pdf", note: "3 Bed / 3.5 Bath" },
  { label: "Lake Home 12.1", file: "ritz-lake-home-12-1.pdf", note: "Alt floorplan PDF" },
];

const projectPageDrafts: Record<string, ProjectPageDraft> = {
  shorecrest: {
    kicker: "North Flagler Waterfront",
    title: "Shorecrest",
    intro:
      "Related Ross' North Flagler tower brings a more intimate ownership scale to the same waterfront corridor as Olara and Ritz-Carlton, with boutique floor plates, Equinox-curated wellness, and released plan resources for serious comparison.",
    image: shorecrestUserHero,
    imageAlt: "Shorecrest waterfront tower rendering",
    stage: "Under construction",
    locationCopy:
      "Located at 1865 N Flagler Drive on the west side of the Intracoastal, Shorecrest belongs in the first North Flagler comparison set: close enough to compare directly with Olara and Ritz-Carlton, but differentiated by smaller floor plates and wellness-led programming.",
    facts: [
      { label: "Address", value: "1865 N Flagler Dr", note: "Some source material also references 1901 N Flagler." },
      { label: "Stories", value: "28" },
      { label: "Residences", value: "98-100", note: "Related Ross' 2026 groundbreaking release says 98 residences; some project materials have referenced 100." },
      { label: "Bedrooms", value: "2-3" },
      { label: "Delivery", value: "Expected 2027" },
      { label: "Pricing", value: "From $3M reported", note: "Request current availability before scheduling." },
      { label: "Profile", value: "North Flagler waterfront" },
    ],
    team: [
      { role: "Developer", name: "Related Ross", note: "Lead developer and financing announcement source." },
      { role: "Architect", name: "Roger Ferris + Partners", note: "Architecture partner for the waterfront tower." },
      { role: "Interior Designer", name: "Rottet Studio", note: "Interior design partner for residences and amenities." },
      { role: "Wellness Partner", name: "Equinox-curated program", note: "Wellness programming is part of the amenity positioning." },
    ],
    highlights: [
      { label: "Amenity Program", value: "18,355 SF", note: "Reported amenity depth with rooftop pool, wellness, dining, golf simulator, and meeting rooms." },
      { label: "Residences", value: "2-3 bedrooms", note: "Residence lines can be compared against the current floorplan packet." },
      { label: "Context", value: "North Flagler cluster", note: "Compare directly against Olara and Ritz-Carlton." },
    ],
    gallery: [
      {
        src: shorecrestUserHero,
        kicker: "Exterior",
        title: "Waterfront Tower",
        alt: "Shorecrest waterfront tower rendering",
      },
      {
        src: "/projects/shorecrest/media/shorecrest-residence.png",
        kicker: "Residence",
        title: "Residence View",
        alt: "Shorecrest residence rendering",
      },
      {
        src: "/projects/shorecrest/media/shorecrest-exterior-card.jpg",
        kicker: "Exterior",
        title: "Waterfront Profile",
        alt: "Shorecrest reference card image",
      },
    ],
    documents: [
      { label: "Floorplans", title: "Official Floor Plans Index", note: "External public source", href: "https://www.shorecrestwpb.com/floorplans" },
      { label: "Floorplan", title: "Residence 704", note: "Official PDF link", href: "https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0704_floorplan.pdf" },
      { label: "Floorplan", title: "Residence 303", note: "Official PDF link", href: "https://www.shorecrestwpb.com/sites/default/files/2025-07/1153_0303_floorplan.pdf" },
    ],
    needed: [
      "Final legal address confirmation",
      "Full current pricing and availability grid",
      "Hero and gallery image sequence",
      "Complete floorplan dimensions and line names",
    ],
  },
  "mr-c": {
    kicker: "Downtown / Lakeview",
    title: "Mr. C Hotel & Residences",
    intro:
      "Mr. C gives West Palm Beach buyers a different kind of luxury proposition: hotel-backed service, downtown walkability, and a Cipriani lifestyle framework rather than a purely waterfront residential tower.",
    image: "/projects/mr-c/media/mr-c-hero.jpg",
    imageAlt: "Mr. C Hotel and Residences rendering",
    stage: "Under construction / model and downloads ready",
    locationCopy:
      "At 320 Lakeview Avenue, Mr. C is the downtown counterweight to the North Flagler waterfront story. The value is access: restaurants, offices, cultural venues, Palm Beach bridges, and hotel-style service woven into daily ownership.",
    facts: [
      { label: "Address", value: "320 Lakeview Ave" },
      { label: "Stories", value: "27", note: "Some older coverage referenced 25 stories." },
      { label: "Residences", value: "146" },
      { label: "Hotel Keys", value: "110" },
      { label: "Delivery", value: "2027 target" },
      { label: "Profile", value: "Downtown hospitality residences" },
    ],
    team: [
      { role: "Developer", name: "Terra", note: "Lead developer for the downtown hotel-residences project." },
      { role: "Brand", name: "Mr. C", note: "Hospitality and service identity." },
      { role: "Sales Gallery", name: "401 S. Olive Avenue", note: "Downtown sales gallery location." },
      { role: "Design Details", name: "Residence and amenity program", note: "Review finish, furnishing, and service details in the current packet." },
    ],
    highlights: [
      { label: "Amenity Story", value: "Hospitality-led", note: "Pool, cinema, bocce, wellness, spa, library, valet, and Bellini dining concepts." },
      { label: "Buyer Fit", value: "Walkability", note: "Downtown positioning makes it different from the waterfront-only towers." },
      { label: "Documents", value: "Deep plan set", note: "The floorplan library has a broad packet ready for comparison." },
    ],
    gallery: [
      {
        src: "/projects/mr-c/media/mr-c-hero.jpg",
        kicker: "Exterior",
        title: "Downtown Tower",
        alt: "Mr. C tower rendering",
      },
      {
        src: "/projects/mr-c/media/mr-c-residence.webp",
        kicker: "Residence",
        title: "Residence Interior",
        alt: "Mr. C residence rendering",
      },
      {
        src: "/projects/mr-c/media/mr-c-street-view-source.jpg",
        kicker: "Street Level",
        title: "Downtown Arrival",
        alt: "Mr. C West Palm Beach street-level rendering",
      },
      {
        src: "/projects/mr-c/media/mr-c-wellness-amenity-source.webp",
        kicker: "Amenity",
        title: "The Well",
        alt: "Mr. C wellness amenity rendering",
      },
      {
        src: "/projects/mr-c/media/mr-c-waterfront-building-source.jpg",
        kicker: "Exterior",
        title: "Building Profile",
        alt: "Mr. C West Palm Beach building rendering",
      },
      {
        src: "/projects/mr-c/media/card.jpg",
        kicker: "Project Image",
        title: "Downtown Context",
        alt: "Mr. C reference image",
      },
    ],
    documents: [
      { label: "Downloads", title: "Official Downloads Page", note: "External public source", href: "https://www.mrcresidenceswpb.com/downloads/" },
      { label: "Fact Sheet", title: "Mr. C Fact Sheet", note: "Official PDF link", href: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC_FactSheet_Aug24_digi_1.pdf" },
      { label: "Guide", title: "West Palm Beach Guide", note: "Official PDF link", href: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC-WPB-Guide-body-R13-Digital-Web.pdf" },
    ],
    needed: [
      "Confirmed architect and interior design credits",
      "Current release/pricing sheet",
      "Preferred 6-8 renderings for the page",
      "Floorplan grouping by line, bed count, and square footage",
    ],
  },
  "alba-palm-beach": {
    kicker: "Northwood / North Flagler",
    title: "Alba Palm Beach",
    intro:
      "Alba Palm Beach is the smaller-scale North Flagler alternative: a 55-residence waterfront building for buyers who want new construction, direct water orientation, and a more private building rhythm.",
    image: "/projects/alba-palm-beach/media/alba-hero.jpg",
    imageAlt: "Alba Palm Beach aerial rendering",
    stage: "Under construction",
    locationCopy:
      "At 4714 N Flagler Drive, Alba extends the waterfront comparison north of the Olara/Shorecrest/Ritz cluster. Compare it on scale, delivery timing, view orientation, and the feel of a boutique building.",
    facts: [
      { label: "Address", value: "4714 N Flagler Dr" },
      { label: "Stories", value: "22" },
      { label: "Residences", value: "55" },
      { label: "Delivery", value: "Spring 2026 reported" },
      { label: "Pricing", value: "Request current pricing", note: "Lower penthouse reporting starts around $6.95M." },
      { label: "Profile", value: "Boutique North Flagler" },
    ],
    team: [
      { role: "Developer", name: "BGI Companies", note: "Developer for the boutique waterfront project." },
      { role: "Architect", name: "Spina O'Rourke + Partners", note: "Architecture partner for Alba Palm Beach." },
      { role: "Sales", name: "Current availability", note: "Request current pricing, inventory, and tour details." },
    ],
    highlights: [
      { label: "Scale", value: "Boutique", note: "55 residences gives it a different buyer profile from the larger Flagler towers." },
      { label: "Status", value: "Topped out reporting", note: "Request the latest construction and delivery update." },
      { label: "Floorplans", value: "Public PDF", note: "Official external floorplan packet is indexed in the floorplan library." },
    ],
    gallery: [
      {
        src: "/projects/alba-palm-beach/media/alba-hero.jpg",
        kicker: "Exterior",
        title: "Aerial Waterfront",
        alt: "Alba Palm Beach aerial rendering",
      },
      {
        src: "/projects/alba-palm-beach/media/alba-exterior-sketch.jpg",
        kicker: "Architecture",
        title: "Exterior Sketch",
        alt: "Alba Palm Beach exterior sketch",
      },
      {
        src: "/projects/alba-palm-beach/media/card.jpg",
        kicker: "Exterior",
        title: "Boutique Waterfront",
        alt: "Alba reference card image",
      },
    ],
    documents: [
      { label: "Website", title: "Official Alba Palm Beach", note: "External public source", href: "https://www.albapalmbeach.com/" },
      { label: "Floorplans", title: "Alba Floorplans", note: "Official external PDF", href: "https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf" },
      { label: "Availability", title: "Current Availability", note: "Request current release details" },
    ],
    needed: [
      "Official floorplan PDF or plan images",
      "Current delivery and inventory status",
      "Sales contact and availability protocol",
      "Residence and amenity image sequence",
    ],
  },
  "mandarin-oriental": {
    kicker: "North Flagler / Branded Residences",
    title: "Mandarin Oriental Residences, West Palm Beach",
    intro:
      "Mandarin Oriental Residences is the long-view branded play on North Flagler: an 87-residence, 31-story waterfront concept for buyers prioritizing service, architecture, and a later delivery horizon.",
    image: "/projects/mandarin-oriental/media/mandarin-oriental-exterior-hero-source.jpg",
    imageAlt: "Mandarin Oriental Residences West Palm Beach rendering",
    stage: "Concept / priority interest",
    locationCopy:
      "At 5400 N Flagler Drive, Mandarin Oriental sits north of Alba and extends the North Flagler branded-residence pipeline beyond the current construction cluster. Treat it as a future-positioning option until release details become more complete.",
    facts: [
      { label: "Address", value: "5400 N Flagler Dr" },
      { label: "Stories", value: "31" },
      { label: "Residences", value: "87" },
      { label: "Bedrooms", value: "2-4" },
      { label: "Opening", value: "Anticipated 2031" },
      { label: "Pricing", value: "From $3.5M", note: "Request current release details before scheduling." },
      { label: "Profile", value: "Branded North Flagler" },
    ],
    team: [
      { role: "Developer", name: "Great Gulf", note: "Developer identified through official launch and press materials." },
      { role: "Brand", name: "Mandarin Oriental", note: "Branded service and residence program." },
      { role: "Architect", name: "Safdie Architects", note: "Architecture partner for the waterfront residences." },
      { role: "Interior Designer", name: "Studio Munge", note: "Interior design partner for residences and amenities." },
    ],
    highlights: [
      { label: "Buyer Fit", value: "Branded service", note: "Compare with Ritz-Carlton for service-led residences and North Flagler positioning." },
      { label: "Amenity Story", value: "Spa + marina", note: "Launch material references wellness, private dining, marina access, lounges, and residential service." },
      { label: "Floorplans", value: "On request", note: "Request the current residence packet for line-level details." },
    ],
    gallery: [
      {
        src: "/projects/mandarin-oriental/media/mandarin-oriental-exterior-hero-source.jpg",
        kicker: "Exterior",
        title: "Waterfront Launch Rendering",
        alt: "Mandarin Oriental Residences waterfront rendering",
      },
      {
        src: "/projects/mandarin-oriental/media/mandarin-oriental-residence.webp",
        kicker: "Residence",
        title: "Residence Program",
        alt: "Mandarin Oriental Residences project image",
      },
      {
        src: "/projects/mandarin-oriental/media/mandarin-oriental-infinity-pool-source.jpg",
        kicker: "Pool Deck",
        title: "Infinity Pool",
        alt: "Mandarin Oriental Residences infinity pool rendering",
      },
      {
        src: "/projects/mandarin-oriental/media/mandarin-oriental-beach-area-source.jpg",
        kicker: "Waterfront",
        title: "Beach Club Setting",
        alt: "Mandarin Oriental Residences waterfront beach area rendering",
      },
      {
        src: "/projects/mandarin-oriental/media/mandarin-oriental-waterfront-podium-source.jpg",
        kicker: "Waterfront",
        title: "Podium And Marina Context",
        alt: "Mandarin Oriental Residences waterfront podium rendering",
      },
      {
        src: "/projects/mandarin-oriental/media/mandarin-oriental-podium.jpg",
        kicker: "Architecture",
        title: "Podium Detail",
        alt: "Mandarin Oriental Residences podium detail rendering",
      },
    ],
    documents: [
      { label: "Website", title: "Official Mandarin Oriental WPB", note: "External public source", href: "https://mandarinorientalwestpalmbeach.com/" },
      { label: "Brand", title: "Mandarin Oriental Residences", note: "External public source", href: "https://www.mandarinoriental.com/en/residences/upcoming/west-palm-beach" },
      { label: "Press", title: "Great Gulf Announcement", note: "External public source", href: "https://www.greatgulfgroup.com/press/release/great-gulf-announces-new-luxury-residences-by-mandarin-oriental-in-west-palm-beach-florida" },
    ],
    needed: [
      "Released floorplan packet",
      "Current sales-team contact and reservation protocol",
      "Full amenity dimensions and unit-line details",
      "Current pricing and launch phase availability",
    ],
  },
  "south-flagler-house": {
    kicker: "South Flagler Waterfront",
    title: "South Flagler House",
    intro:
      "South Flagler House is the southern waterfront benchmark: two RAMSA-designed towers with large-format residences, private-club amenities, and a quieter relationship to Palm Beach Island.",
    image: southFlaglerHouseUserHero,
    imageAlt: "South Flagler House reference image",
    stage: "Under construction",
    locationCopy:
      "At 1355 S Flagler Drive, South Flagler House anchors the southern waterfront comparison. It should be read against North Flagler projects on privacy, scale, architecture, and proximity to Palm Beach rather than only price or delivery timing.",
    facts: [
      { label: "Address", value: "1355 S Flagler Dr" },
      { label: "Stories", value: "28 + 28", note: "Two tower composition." },
      { label: "Residences", value: "108", note: "Full project count, not per tower." },
      { label: "Bedrooms", value: "2-5" },
      { label: "Delivery", value: "Expected 2027" },
      { label: "Pricing", value: "Request current pricing" },
      { label: "Profile", value: "South Flagler waterfront" },
    ],
    team: [
      { role: "Developer", name: "Related Ross", note: "Lead developer." },
      { role: "Architect", name: "Robert A.M. Stern Architects", note: "Architecture partner for the twin-tower waterfront composition." },
      { role: "Interior Designer", name: "Pembrooke & Ives", note: "Interior design partner for residences and amenities." },
      { role: "Landscape Architect", name: "Landscape design", note: "Outdoor spaces shape the private-club waterfront setting." },
    ],
    highlights: [
      { label: "Amenity Program", value: "50,000 SF", note: "Private club amenities, lakefront pool, spa, fitness, pickleball, simulator, and dining." },
      { label: "Buyer Fit", value: "High-end waterfront", note: "South Flagler benchmark across from Palm Beach Island." },
      { label: "Imagery", value: "Gallery ready", note: "Waterfront renderings support a stronger project profile." },
    ],
    gallery: [
      {
        src: southFlaglerHouseUserHero,
        kicker: "Exterior",
        title: "Waterfront Rendering",
        alt: "South Flagler House waterfront rendering",
      },
      {
        src: "/projects/south-flagler-house/media/south-flagler-house-entrance-source.jpg",
        kicker: "Arrival",
        title: "Entrance Sequence",
        alt: "South Flagler House arrival and entrance rendering",
      },
      {
        src: "/projects/south-flagler-house/media/south-flagler-house-rendering-02.jpg",
        kicker: "Architecture",
        title: "Tower Rendering",
        alt: "South Flagler House tower rendering",
      },
      {
        src: "/projects/south-flagler-house/media/south-flagler-house-rendering-03.png",
        kicker: "Detail",
        title: "Project Detail",
        alt: "South Flagler House project rendering detail",
      },
    ],
    documents: [
      { label: "Website", title: "Official South Flagler House", note: "External public source", href: "https://www.southflaglerhouse.com/" },
      { label: "Fact Sheet", title: "Public Fact Sheet", note: "External public source", href: "https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf" },
      { label: "Floorplans", title: "Current Plan Packet", note: "Request current release details" },
    ],
    needed: [
      "Project renderings and logo sequence",
      "Released floorplan packet",
      "Sales gallery contact and pricing rules",
      "Per-tower or per-line inventory details",
    ],
  },
  "nora-house": {
    kicker: "NORA District",
    title: "NORA House",
    intro:
      "NORA House is the lifestyle-counterpoint to the waterfront towers: a walkable district condominium shaped around restaurants, retail, social energy, and the daily convenience of living inside an emerging neighborhood.",
    image: noraHouseUserHero,
    imageAlt: "NORA House exterior rendering",
    stage: "Sales launched / details to verify",
    locationCopy:
      "Placed in the NORA district north of downtown, this profile should stay grounded in walkability and future-supply positioning until final legal address, release timing, and offering details are fully confirmed.",
    facts: [
      { label: "Address", value: "NORA district", note: "Exact legal address needs confirmation." },
      { label: "Residences", value: "117", note: "Newer sales-launch reporting; earlier planning references vary." },
      { label: "Bedrooms", value: "2-3" },
      { label: "Delivery", value: "2028 modeled" },
      { label: "Status", value: "Planning" },
      { label: "Pricing", value: "Request current pricing" },
      { label: "Profile", value: "NORA District lifestyle" },
    ],
    team: [
      { role: "Developer", name: "The Ronto Group", note: "Developer for the NORA District residential concept." },
      { role: "Architect", name: "Swedroe Architecture", note: "Architecture partner for the residence program." },
      { role: "Interior Designer", name: "Lillian Wu Studio", note: "Interior design partner for the residence program." },
    ],
    highlights: [
      { label: "Buyer Fit", value: "Walkable district", note: "Positioned around NORA lifestyle, dining, and downtown access." },
      { label: "Amenity Story", value: "Rooftop-led", note: "Public page references pools, wellness, yoga lawn, golf simulator, and guest suites." },
      { label: "Offering Details", value: "On request", note: "Review residence count, inventory, pricing, and address details before touring." },
    ],
    gallery: [
      {
        src: noraHouseUserHero,
        kicker: "Exterior",
        title: "NORA House",
        alt: "NORA House rendering",
      },
      {
        src: "/projects/nora-house/media/nora-street.webp",
        kicker: "Street",
        title: "Street Presence",
        alt: "NORA House street rendering",
      },
      {
        src: "/projects/nora-house/media/card.jpg",
        kicker: "Exterior",
        title: "District Profile",
        alt: "NORA reference card image",
      },
    ],
    documents: [
      { label: "Website", title: "Official NORA House", note: "External public source", href: "https://norahouse.com/" },
      { label: "Floorplan", title: "Residence 01 Page", note: "External public source", href: "https://norahouse.com/floorplan/residence-01/" },
      { label: "Floorplans", title: "Full Plan Packet", note: "Request current release details" },
    ],
    needed: [
      "Final address and legal offering name",
      "Residence count and complete plan set",
      "Approved lifestyle/neighborhood image set",
      "Current pricing and release timing",
    ],
  },
};

const editorProjectPageDrafts = applySourceFactsToDrafts(applyEditorDraftOverrides(projectPageDrafts, editorProjectOverrides));

function applySourceFactsToDrafts(drafts: Record<string, ProjectPageDraft>): Record<string, ProjectPageDraft> {
  const next: Record<string, ProjectPageDraft> = { ...drafts };
  for (const project of featuredProjects) {
    const base = next[project.id] ?? projectDraftFromFeatured(project);
    next[project.id] = applySourceFactsToDraft(base, project);
  }
  return next;
}

function applySourceFactsToDraft(base: ProjectPageDraft, project: FeaturedProject): ProjectPageDraft {
  const sourceFact = sourceFactForProject(project.id);
  if (!sourceFact) return base;
  const source = sourceFact.facts;
  const sourceFacts = [
    { label: "Address", value: source.address || project.address },
    { label: "Stories", value: source.stories || "Verify" },
    { label: "Residences", value: conciseResidences(project.id, source.residences) || project.residences, note: source.residences },
    { label: "Delivery", value: conciseDelivery(source.completion) || project.delivery, note: source.completion },
    { label: "Pricing", value: concisePricing(source.pricing) || project.price, note: source.pricing },
    { label: "Status", value: source.status || project.status },
    { label: "Views", value: projectViewSummary(project) },
  ].filter((fact) => fact.value);
  const sourceLabels = new Set(sourceFacts.map((fact) => fact.label.toLowerCase()));
  const facts = [...sourceFacts, ...base.facts.filter((fact) => !sourceLabels.has(fact.label.toLowerCase()))];
  const team = teamCreditsFromSource(source.team);
  return {
    ...base,
    stage: source.status || base.stage,
    facts,
    team: team.length ? team : base.team,
    highlights: [
      { label: "Status", value: source.status || project.status, note: source.completion || project.delivery },
      { label: "Pricing", value: concisePricing(source.pricing) || project.price, note: "Request current availability, incentives, carrying costs, and contract terms before relying on any public figure." },
      { label: "Views", value: projectViewSummary(project), note: "Confirm exact stack, floor, exposure, and future view-corridor risk." },
      ...base.highlights.filter((item) => !["status", "pricing", "views"].includes(item.label.toLowerCase())),
    ],
    documents: uniqueDocuments([...documentsFromSource(project, sourceFact), ...base.documents]),
    needed: neededFromSource(sourceFact),
  };
}

function uniqueDocuments(documents: ProjectDocument[]) {
  const seen = new Set<string>();
  return documents.filter((document) => {
    const key = document.href || `${document.label}:${document.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyEditorDraftOverrides(drafts: Record<string, ProjectPageDraft>, overrides: EditorProjectOverrides): Record<string, ProjectPageDraft> {
  const next: Record<string, ProjectPageDraft> = { ...drafts };
  for (const [projectId, override] of Object.entries(overrides)) {
    if (!override.draft) continue;
    const project = featuredProjects.find((item) => item.id === projectId);
    const base = next[projectId] ?? (project ? projectDraftFromFeatured(project) : null);
    if (!base) continue;
    next[projectId] = applyEditorDraftOverride(base, override.draft);
  }
  return next;
}

function applyEditorDraftOverride(base: ProjectPageDraft, override: ProjectDraftEditorOverride): ProjectPageDraft {
  return {
    ...base,
    title: cleanOverrideText(override.title) ?? base.title,
    intro: cleanOverrideText(override.intro) ?? base.intro,
    image: cleanOverrideText(override.image) ?? base.image,
    imageAlt: cleanOverrideText(override.imageAlt) ?? base.imageAlt,
    stage: cleanOverrideText(override.stage) ?? base.stage,
    locationCopy: cleanOverrideText(override.locationCopy) ?? base.locationCopy,
    needed: override.needed?.length ? override.needed : base.needed,
  };
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container was not found.");
}

app.innerHTML = `
  <div class="site-shell">
    <header class="site-nav">
      <a class="brand" href="./" aria-label="WPB New Construction home">
        <span class="brand-mark" aria-hidden="true">WPB</span>
        <span>
          <strong>WPB New Construction</strong>
          <small>Private Development Advisory</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="./#atlas" data-nav-item="home">Map</a>
        <a href="./#projects" data-nav-item="home">Projects</a>
        <a href="/floorplans/" data-nav-item="floorplans">Floorplans</a>
        <a href="/answers/" data-nav-item="answers">Q&A</a>
        <a href="/updates/" data-nav-item="news">Updates</a>
        <a href="/methodology/" data-nav-item="methodology">Verify</a>
      </nav>
      <a class="nav-cta" href="/inquire/" data-nav-item="inquire">Request Guidance</a>
    </header>

    <main>
      <div class="route-view route-view-home" data-route-view="home">
      <section class="home-hero" id="top">
        <img class="home-hero-image" src="/projects/ritz-carlton-wpb/media/ritz-evening-aerial-road-motion-2400x1600.png" alt="West Palm Beach waterfront towers and Intracoastal at twilight" />
        <div class="home-hero-scrim"></div>
        <div class="home-hero-layout">
          <div class="home-hero-content">
            <p class="hero-kicker">West Palm Beach New Construction</p>
            <h1>A buyer's guide to the city's next waterfront addresses.</h1>
            <p class="hero-copy">Compare North Flagler, Downtown, and South Flagler residences with source-backed facts, released floorplans, and advisory context written for buyers, not developer hype.</p>
            <div class="hero-actions" aria-label="Primary homepage actions">
              <a href="#projects">Compare Projects</a>
              <a href="/inquire/">Request Current Availability <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <section class="hero-proof-strip" aria-label="Current buyer guide coverage">
        <span>${featuredProjects.length} tracked projects</span>
        <span>${floorplanLibrary.reduce((total, project) => total + project.count, 0)} floorplan records</span>
        <span>Updated ${floorplanLibrary[0]?.updatedAt ?? "2026-05-15"}</span>
        <span>Independent buyer advisory</span>
      </section>

      <section class="home-atlas-feature" id="atlas" aria-label="West Palm Beach project atlas">
        <div class="home-atlas-copy">
          <p class="eyebrow">Buyer Atlas</p>
          <h2>See the market by water, district, and timing.</h2>
          <p>The strongest decisions start with geography. North Flagler, Downtown, and South Flagler each carry a different mix of service, walkability, privacy, and delivery risk.</p>
          <div class="home-atlas-facts" aria-label="West Palm Beach atlas summary">
            <span>North Flagler waterfront cluster</span>
            <span>Downtown branded residences</span>
            <span>South Flagler privacy corridor</span>
          </div>
        </div>
        <aside class="home-hero-map-card home-atlas-map-card" aria-label="Featured West Palm Beach project map">
          <figure class="hero-map-preview">
            <div class="hero-google-map" data-hero-google-map aria-label="Google map of West Palm Beach new-construction project locations"></div>
            <img class="hero-map-fallback" src="/maps/wpb-atlas-map-editorial.svg" alt="Fallback map of West Palm Beach new-construction corridors" />
            <button class="hero-map-expand" type="button" data-map-expand>Show all locations</button>
          </figure>
          <div class="hero-map-list">
            <div class="hero-map-list-head">
              <strong>${featuredProjects.length} projects</strong>
              <a href="#projects">View all</a>
            </div>
            ${rankedFeaturedProjects.slice(0, 7).map((project, index) => `
              <a class="hero-map-row" href="${projectPath(project)}">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${project.name}</strong>
                  <small>${project.delivery} | ${project.residences} residences</small>
                </div>
                <em aria-hidden="true">›</em>
              </a>
            `).join("")}
          </div>
          <button class="hero-map-cta" type="button" data-map-expand>Explore map <span aria-hidden="true">↗</span></button>
        </aside>
      </section>

      <section class="home-editorial-bridge" aria-label="Featured West Palm Beach waterfront edit">
        <div class="editorial-bridge-copy">
          <p class="eyebrow">Waterfront Edit</p>
          <h2>Start with the addresses setting the new-construction tone.</h2>
          <p>Before the full atlas, focus on the projects defining the current buyer conversation: branded service, North Flagler waterfront scale, walkable downtown energy, and South Flagler privacy.</p>
        </div>
        <div class="editorial-spotlight-grid">
          ${rankedFeaturedProjects.slice(0, 3).map((project, index) => `
            <a class="editorial-spotlight-card" href="${projectPath(project)}">
              ${project.image ? `<img src="${project.image}" alt="${project.name} waterfront project preview" />` : ""}
              <span>${String(index + 1).padStart(2, "0")} · ${project.corridor}</span>
              <strong>${project.name}</strong>
            </a>
          `).join("")}
        </div>
      </section>

      <section class="home-corridor-guide" aria-label="Choose a West Palm Beach new-construction corridor">
        <div class="section-heading corridor-heading">
          <p class="eyebrow">Choose Your Corridor</p>
          <h2>Each waterfront decision has a different rhythm.</h2>
        </div>
        <div class="corridor-guide-grid">
          ${corridorSections.map((section) => {
            const count = featuredProjects.filter((project) => project.corridorKey === section.key).length;
            return `
              <article class="corridor-guide-card">
                <span>${section.label}</span>
                <strong>${section.detail}</strong>
                <p>${section.reviewNote}</p>
                <small>${count} tracked project${count === 1 ? "" : "s"}</small>
                <a href="#projects">View corridor <span aria-hidden="true">→</span></a>
              </article>
            `;
          }).join("")}
        </div>
      </section>

      <section class="home-answer-section" aria-label="West Palm Beach new-construction buyer questions">
        <div class="section-heading">
          <p class="eyebrow">Buyer Q&A</p>
          <h2>Questions worth answering before you tour.</h2>
        </div>
        <div class="home-answer-grid">
          ${answerEngineFaq.slice(0, 4).map(renderHomeAnswerCard).join("")}
        </div>
        <a class="home-answer-archive-link" href="/answers/">Read the full buyer Q&A library <span aria-hidden="true">→</span></a>
      </section>

      <section class="project-sort-shell" id="projects">
          <div class="project-sort-header">
            <div>
              <p class="eyebrow">Curated Buyer Guide</p>
              <h2>Compare the projects shaping West Palm Beach's next chapter.</h2>
              <p class="selected-filter-summary" data-filter-summary>All tracked projects shown. Filter by corridor, construction status, or floorplan readiness.</p>
              <div class="filter-chips" role="list" aria-label="Project filters">
                ${projectFilters.map(renderProjectFilter).join("")}
              </div>
            </div>
            <label class="sort-control">
              <span>Sort:</span>
              <select data-project-sort aria-label="Sort projects">
                <option value="featured">Featured</option>
                <option value="az">A-Z</option>
                <option value="delivery">Delivery</option>
                <option value="residences">Residences</option>
                <option value="corridor">Corridor</option>
              </select>
            </label>
          </div>
          <div class="project-rail">
            <button class="project-rail-arrow project-rail-arrow-prev" type="button" data-project-scroll="prev" aria-label="Scroll projects left">&lsaquo;</button>
            <div class="front-project-grid" data-project-grid>
              ${featuredProjects.map(renderFeaturedProject).join("")}
            </div>
            <button class="project-rail-arrow project-rail-arrow-next" type="button" data-project-scroll="next" aria-label="Scroll projects right">&rsaquo;</button>
          </div>
      </section>

      <section class="home-news-section" aria-label="Latest West Palm Beach new-construction updates">
        <div class="section-heading">
          <p class="eyebrow">Market Updates</p>
          <h2>Signals worth watching before you tour.</h2>
        </div>
        <div class="home-news-grid">
          ${researchNewsFeed.slice(0, 3).map(renderHomeNewsItem).join("")}
        </div>
      </section>

      <section class="home-conversion-band" aria-label="Request current West Palm Beach new-construction guidance">
        <div>
          <p class="eyebrow">Private Advisory</p>
          <h2>Get the current packet before you tour.</h2>
          <p>Availability, floorplans, incentives, delivery dates, and view premiums can move faster than public pages. Ask for a buyer-side comparison before you commit a day to sales galleries.</p>
        </div>
        <div class="conversion-points">
          <span>Active inventory</span>
          <span>Released floorplans</span>
          <span>Tour strategy</span>
        </div>
        <a href="/inquire/">Request Guidance <span aria-hidden="true">↗</span></a>
      </section>
      </div>

      <div class="route-view route-view-news" data-route-view="news" hidden>
      <section class="comparison-band" aria-label="Waterfront project comparison">
        <div>
          <span>Primary Corridor</span>
          <strong>North Flagler + Downtown Waterfront</strong>
        </div>
        <div>
          <span>Core Advantage</span>
          <strong>Released plans, service models, teams, and timing in one place</strong>
        </div>
        <div>
          <span>Lead CTA</span>
          <strong>Request current availability</strong>
        </div>
      </section>

      <section class="section news-section" id="news">
        <div class="section-heading">
          <p class="eyebrow">Market Updates</p>
          <h2>Market notes that separate signal from noise.</h2>
        </div>
        <div class="answer-meta-panel">
          <span>Updated ${researchNewsFeed[0]?.dateModified ?? "2026-05-14"}</span>
          <strong>Reviewed updates for the active buyer shortlist.</strong>
          <small>Each note is framed around what a buyer should confirm before relying on it.</small>
        </div>
        <div class="news-grid">
          ${researchNewsFeed.map(renderResearchNewsItem).join("")}
          ${newsItems.map(renderNewsItem).join("")}
        </div>
      </section>
      </div>

      <div class="route-view route-view-floorplans" data-route-view="floorplans" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">Floorplan Library</p>
            <h1>Released floorplans, organized for a cleaner first comparison.</h1>
            <p>
              This library gathers public plan links and released PDFs currently captured from project sources.
              Use it to compare scale, exposure, and residence type, then request the current sales packet before making purchase decisions.
            </p>
          </div>
          <aside class="answer-meta-panel">
            <span>Updated ${floorplanLibrary[0]?.updatedAt ?? "2026-05-14"}</span>
            <strong>${floorplanLibrary.reduce((total, project) => total + project.count, 0)} floorplan records</strong>
            <small>${floorplanLibrary.filter((project) => project.count > 0).length} projects have at least one plan link or PDF.</small>
          </aside>
        </section>
        <section class="section floorplan-index-section">
          ${floorplanLibrary.map(renderFloorplanProject).join("")}
        </section>
      </div>

      <div class="route-view route-view-answers" data-route-view="answers" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">Buyer Q&A</p>
            <h1>${answerEngineFaq.length} direct answers for comparing West Palm Beach projects with discipline.</h1>
            <p>
              Start with readiness dates, pricing, water views, stories, residence counts, and construction status.
              Then move into service, floorplans, documents, and the subtle tradeoffs that shape ownership.
            </p>
          </div>
          <aside class="answer-meta-panel">
            <span>Current library</span>
            <strong>${answerEngineFaq.length} buyer questions</strong>
            <small>Source-backed answers for touring, shortlisting, and current availability review.</small>
          </aside>
        </section>
        <section class="section answer-fact-matrix-section" aria-label="Project fact matrix">
          <div class="section-heading">
            <p class="eyebrow">Quick Facts</p>
            <h2>Stories, residences, timing, pricing, and view orientation in one pass.</h2>
          </div>
          ${renderAnswerFactMatrix()}
        </section>
        <nav class="question-index" aria-label="Buyer question index">
          ${answerEngineFaq.map((item) => `<a href="#${item.id}" title="${item.question}" aria-label="${item.question}">${answerShortLabel(item)}</a>`).join("")}
        </nav>
        <section class="section answer-engine-section">
          ${answerEngineFaq.map(renderAnswerBlock).join("")}
        </section>
      </div>

      <div class="route-view route-view-methodology" data-route-view="methodology" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">How We Verify</p>
            <h1>What counts as reliable before a buyer relies on it.</h1>
          <p>
              Project pages separate official releases, reported details, and items that require
              current confirmation. The goal is simple: make the market easier to read before an offer,
              reservation, or private tour.
            </p>
          </div>
          <aside class="answer-meta-panel">
            <span>Source Hierarchy</span>
            <strong>Official first, reported second, advisor confirmation before reliance.</strong>
            <small>Last refreshed ${researchNewsFeed[0]?.dateModified ?? floorplanLibrary[0]?.updatedAt}</small>
          </aside>
        </section>
        <section class="section methodology-section">
          <div class="methodology-grid">
            <article class="profile-card">
              <span>Official</span>
              <strong>Developer, sales, brand, city, lender, or project documents.</strong>
              <p>Used for addresses, residence counts, released floorplans, construction status, and named teams whenever available.</p>
            </article>
            <article class="profile-card">
              <span>Reported</span>
              <strong>Trusted local, real-estate, and construction reporting.</strong>
              <p>Useful for momentum, financing, early plans, and context, but not treated as final sales guidance.</p>
            </article>
            <article class="profile-card">
              <span>Confirm Before Offer</span>
              <strong>Pricing, incentives, availability, delivery timing, fees, and contract terms.</strong>
              <p>These change quickly and should be verified with the developer, sales team, or buyer representative.</p>
            </article>
            <article class="profile-card">
              <span>Refresh Cadence</span>
              <strong>Source data is refreshed through the review workflow before publication updates.</strong>
              <p>Corrections should be handled by updating the source catalog, regenerating the site data, and noting material changes in the updates feed.</p>
            </article>
            <article class="profile-card">
              <span>Limits</span>
              <strong>We do not verify legal, tax, lending, engineering, zoning, or investment conclusions.</strong>
              <p>Those decisions should be reviewed with the buyer's attorney, lender, architect, accountant, or other appropriate professional.</p>
            </article>
          </div>
        </section>
      </div>

      <div class="route-view route-view-legal" data-route-view="fair-housing" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">Fair Housing</p>
            <h1>Equal housing opportunity.</h1>
            <p>
              This site supports equal access to housing information and opportunity.
              Housing guidance, property information, and advisory responses must be provided
              without discrimination based on protected characteristics under federal, state, or local law.
            </p>
          </div>
          <aside class="answer-meta-panel">
            <span>Brokerage</span>
            <strong>${advisorProfile.brokerage}</strong>
            <small>${advisorProfile.name} · License ${advisorProfile.license}</small>
          </aside>
        </section>
        <section class="section legal-section">
          <div class="methodology-grid">
            <article class="profile-card">
              <span>Policy</span>
              <strong>Equal Housing Opportunity.</strong>
              <p>All real-estate services and communications should be made available without discrimination based on race, color, national origin, religion, sex, familial status, disability, or any additional protected class recognized by applicable state or local law.</p>
            </article>
            <article class="profile-card">
              <span>Information Standard</span>
              <strong>Property information should be independently verified.</strong>
              <p>Douglas Elliman public disclosures state that property information is believed reliable but subject to errors, omissions, changes, or withdrawal without notice.</p>
            </article>
            <article class="profile-card">
              <span>Contact</span>
              <strong>${advisorProfile.name}</strong>
              <p>${advisorProfile.group}<br />${advisorProfile.brokerage}<br /><a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a></p>
            </article>
          </div>
        </section>
      </div>

      <div class="route-view route-view-legal" data-route-view="privacy" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">Privacy</p>
            <h1>How lead information is handled.</h1>
            <p>
              Inquiry forms collect the information a buyer chooses to submit so the advisor can respond
              about new-construction availability, floorplans, tours, and related real-estate services.
            </p>
          </div>
          <aside class="answer-meta-panel">
            <span>Official Policy</span>
            <strong>Douglas Elliman Privacy Policy</strong>
            <small><a href="${advisorProfile.privacyUrl}" target="_blank" rel="noreferrer">Review at elliman.com</a></small>
          </aside>
        </section>
        <section class="section legal-section">
          <div class="methodology-grid">
            <article class="profile-card">
              <span>Collection</span>
              <strong>Lead forms collect identifiers and inquiry details.</strong>
              <p>Name, email, phone, project interest, and message details are used to respond to the request and support real-estate objectives.</p>
            </article>
            <article class="profile-card">
              <span>Site Handling</span>
              <strong>Lead submissions may be stored only to respond to the inquiry.</strong>
              <p>Submissions may be stored by the form host, retained temporarily in this browser's local backup queue, and/or forwarded by email solely to respond to the inquiry. Do not submit sensitive financial records, identification documents, or confidential transaction documents through this form.</p>
            </article>
            <article class="profile-card">
              <span>Brokerage Policy</span>
              <strong>Douglas Elliman's policy governs elliman.com interactions.</strong>
              <p>Douglas Elliman states that agent interactions outside its site may also be governed by other applicable privacy terms.</p>
            </article>
            <article class="profile-card">
              <span>Opt Out</span>
              <strong>Do not submit personal information if you do not consent.</strong>
              <p>Privacy requests related to Douglas Elliman's policy can be directed to the official policy contact listed at elliman.com.</p>
            </article>
          </div>
        </section>
      </div>

      <div class="route-view route-view-legal" data-route-view="terms" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">Terms</p>
            <h1>Information-only advisory content.</h1>
            <p>
              Site content is provided for buyer guidance and project comparison. It is not legal,
              tax, lending, construction, zoning, or investment advice, and it is not a developer offering document.
            </p>
          </div>
          <aside class="answer-meta-panel">
            <span>Official Terms</span>
            <strong>Douglas Elliman Terms of Use</strong>
            <small><a href="${advisorProfile.termsUrl}" target="_blank" rel="noreferrer">Review at elliman.com</a></small>
          </aside>
        </section>
        <section class="section legal-section">
          <div class="methodology-grid">
            <article class="profile-card">
              <span>Verification</span>
              <strong>Facts can change without notice.</strong>
              <p>Pricing, availability, fees, square footage, delivery timing, and incentives must be confirmed with current developer or sales-team materials before reliance.</p>
            </article>
            <article class="profile-card">
              <span>Affiliation</span>
              <strong>Independent buyer advisory context.</strong>
              <p>This site is not affiliated with, sponsored by, or endorsed by the developers, brands, architects, or sales teams shown unless specifically stated.</p>
            </article>
            <article class="profile-card">
              <span>Advisor</span>
              <strong>${advisorProfile.name}</strong>
              <p>${advisorProfile.group}<br />${advisorProfile.brokerage}<br />License ${advisorProfile.license}</p>
            </article>
          </div>
        </section>
      </div>

      ${featuredProjects.map(renderDraftProjectPage).join("")}

      <div class="route-view route-view-project route-view-full-project" data-route-view="project-legacy" data-project-id="olara" hidden>
      <section class="hero project-hero" id="olara">
        <picture>
          <source media="(max-width: 720px)" srcset="${mediaBase}olara-mobile-hero-exterior-1080x1350.png" />
          <img src="${mediaBase}olara-hero-exterior-1536x1024.png" alt="Olara-inspired exterior on the West Palm Beach waterfront" />
        </picture>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="eyebrow">North Flagler Waterfront · West Palm Beach</p>
          <h1>Olara</h1>
          <p class="hero-copy">
            A private waterfront development page organized around architecture, wellness,
            marina access, floorplans, and the lifestyle assets needed for a high-end buyer experience.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="/floorplans/#floorplans-olara">View Floorplans</a>
            <a class="button ghost" href="${docsBase}olara-rack-brochure-digital-032026.pdf" target="_blank" rel="noreferrer">Open Brochure</a>
          </div>
        </div>
        <aside class="hero-facts" aria-label="Olara quick facts">
          <div>
            <span>Stories</span>
            <strong>26</strong>
          </div>
          <div>
            <span>Residences</span>
            <strong>275</strong>
          </div>
          <div>
            <span>Amenities</span>
            <strong>80K+ SF</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Under Construction</strong>
          </div>
        </aside>
      </section>

      ${renderProjectSnapshotPanel("olara")}

      <section class="section intro-section">
        <div class="section-heading">
          <p class="eyebrow">Buyer Summary</p>
          <h2>Waterfront lifestyle, floorplans, and buyer priorities.</h2>
        </div>
        <p class="large-copy">
          Olara is one of the most complete current project profiles in this catalog because the page can show
          waterfront context, released floorplan materials, residence imagery, amenity positioning, and source notes
          in one place. Before relying on availability, incentives, pricing, square footage, or delivery timing,
          request a current sales-team confirmation.
        </p>
      </section>

      <section class="section team-section" id="team">
        <div class="section-heading">
          <p class="eyebrow">Development Team</p>
          <h2>The people behind the asset.</h2>
        </div>
        <div class="team-grid">
          ${projectTeam.map(renderTeamCredit).join("")}
        </div>
        <p class="source-note">
          Team credits cross-checked against the official Olara team page, lifestyle page, and brochure.
          Final purchase decisions should verify current team, offering, and sales materials directly with the sales team.
        </p>
      </section>

      <section class="gallery-strip" aria-label="Featured Olara image roles">
        ${featuredGallery.map(renderGalleryCard).join("")}
      </section>

      <section class="section split-section">
        <div class="split-copy">
          <p class="eyebrow">Arrival</p>
          <h2>Valet, lobby, and private arrival moments.</h2>
          <p>
            This image anchors the arrival section: a polished lobby approach, warm lighting,
            valet service, tropical planting, and the kind of quiet threshold that makes the
            page feel more like a private presentation than a listing.
          </p>
        </div>
        <figure class="feature-image">
          <img src="${mediaBase}olara-arrival-valet-lobby-2400x1600.png" alt="Olara valet and lobby arrival" />
        </figure>
      </section>

      <section class="section" id="residences">
        <div class="section-heading">
          <p class="eyebrow">Residences</p>
          <h2>Terraces, living rooms, kitchens, and baths.</h2>
        </div>
        <div class="editorial-grid residences-grid">
          <article class="feature-card wide">
            <img src="${mediaBase}olara-residence-terrace-sunrise-2400x1600.png" alt="Olara residence terrace sunrise view" />
            <div>
              <span>Residence Terrace</span>
              <strong>Sunrise over the Intracoastal</strong>
            </div>
          </article>
          ${residenceGallery.map(renderFeatureCard).join("")}
        </div>
      </section>

      <section class="section" id="views">
        <div class="section-heading">
          <p class="eyebrow">Views</p>
          <h2>Intracoastal, Palm Beach, and ocean horizon.</h2>
        </div>
        <div class="view-pair">
          <figure>
            <img src="${mediaBase}olara-view-balcony-intracoastal-2400x1600.png" alt="Olara balcony chair with Intracoastal view" />
            <figcaption>Balcony view · Intracoastal foreground · ${imageProviderLabel(`${mediaBase}olara-view-balcony-intracoastal-2400x1600.png`)}</figcaption>
          </figure>
          <figure>
            <img src="${mediaBase}olara-view-east-intracoastal-ocean-2400x1600.png" alt="Olara east-facing Intracoastal and ocean view" />
            <figcaption>East view · Palm Beach and Atlantic horizon · ${imageProviderLabel(`${mediaBase}olara-view-east-intracoastal-ocean-2400x1600.png`)}</figcaption>
          </figure>
        </div>
      </section>

      <section class="section" id="amenities">
        <div class="section-heading">
          <p class="eyebrow">Amenities</p>
          <h2>Wellness, water, and resort-scale service.</h2>
        </div>
        <div class="editorial-grid amenities-grid">
          ${amenityGallery.map(renderFeatureCard).join("")}
        </div>
      </section>

      <section class="section split-section marina-section">
        <figure class="feature-image">
          <img src="${mediaBase}olara-marina-boat-dock-2400x1600.png" alt="Olara marina and boat dock lifestyle" />
        </figure>
        <div class="split-copy">
          <p class="eyebrow">Marina</p>
          <h2>Private waterfront rhythm.</h2>
          <p>
            The marina asset supports the lifestyle section: dock access, water toys, boats,
            and a waterfront social layer that separates this page from a standard condo directory.
          </p>
        </div>
      </section>

      <section class="section document-section" id="floorplans">
        <div class="section-heading">
          <p class="eyebrow">Document Library</p>
          <h2>Floorplans and brochure.</h2>
        </div>
        <div class="document-grid">
          <a class="document-card" href="/floorplans/#floorplans-olara">
            <span>Floorplan Library</span>
            <strong>Complete Floorplan Collection</strong>
            <small>Individual residence plans organized for direct review</small>
          </a>
          <a class="document-card" href="${docsBase}olara-rack-brochure-digital-032026.pdf" target="_blank" rel="noreferrer">
            <span>PDF · Brochure</span>
            <strong>Rack Brochure Digital 032026</strong>
            <small>User-supplied brochure, renamed for site use</small>
          </a>
        </div>
        <div class="floorplan-library">
          <div>
            <p class="eyebrow">Individual Plans</p>
            <h3>Residence plan PDFs organized for direct buyer review.</h3>
          </div>
          <div class="floorplan-grid">
            ${floorplanDownloads.map((plan) => renderFloorplanLink(plan)).join("")}
          </div>
        </div>
      </section>
      </div>

      <div class="route-view route-view-project route-view-full-project" data-route-view="project-legacy" data-project-id="ritz-carlton-wpb" hidden>
      <section class="project-break" id="ritz">
        <picture>
          <source media="(max-width: 720px)" srcset="${ritzMediaBase}ritz-mobile-hero-tower-sunset-1080x1350.png" />
          <img src="${ritzMediaBase}ritz-hero-waterfront-building-2880x1800.png" alt="The Ritz-Carlton Residences tower on the West Palm Beach waterfront" />
        </picture>
        <div class="project-break-overlay"></div>
        <div class="project-break-content">
          <p class="eyebrow">North Flagler Waterfront · Branded Residences</p>
          <h2>The Ritz-Carlton Residences, West Palm Beach</h2>
          <p>
            This profile brings together team credits, buyer-facing facts, arrival and residence
            imagery, brochure access, and released floorplans for a focused North Flagler comparison.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="${ritzBrochureUrl}" target="_blank" rel="noreferrer">Open Brochure</a>
            <a class="button ghost" href="#ritz-floorplans">View Floorplans</a>
          </div>
        </div>
      </section>

      ${renderProjectSnapshotPanel("ritz-carlton-wpb")}

      <section class="section project-profile-section" id="ritz-profile">
        <div class="section-heading">
          <p class="eyebrow">Ritz-Carlton Snapshot</p>
          <h2>Verified facts for the page.</h2>
        </div>
        <div class="profile-grid">
          ${ritzFacts.map(renderProjectFact).join("")}
        </div>
        <p class="source-note">
          Sources: official Ritz-Carlton Residences site and floorplan page, Related Group,
          the official public brochure, Rockwell Group, and February 2026 construction reporting.
        </p>
      </section>

      <section class="section team-section" id="ritz-team">
        <div class="section-heading">
          <p class="eyebrow">Ritz-Carlton Team</p>
          <h2>Development, design, and service credits.</h2>
        </div>
        <div class="team-grid">
          ${ritzTeam.map(renderTeamCredit).join("")}
        </div>
      </section>

      <section class="gallery-strip ritz-gallery" aria-label="Featured Ritz-Carlton image roles">
        ${ritzFeaturedGallery.map(renderGalleryCard).join("")}
      </section>

      <section class="section split-section">
        <div class="split-copy">
          <p class="eyebrow">Ritz Arrival</p>
          <h2>Branded service starts at the curb.</h2>
          <p>
            The arrival sequence emphasizes privacy, warm lighting, and the hotel-residential
            threshold that separates this project from a conventional condominium tower.
          </p>
        </div>
        <figure class="feature-image">
          <img src="${ritzMediaBase}ritz-arrival-porte-cochere-evening-2400x1600.png" alt="Ritz-Carlton Residences evening porte cochere arrival" />
        </figure>
      </section>

      <section class="section" id="ritz-residences">
        <div class="section-heading">
          <p class="eyebrow">Ritz Residences</p>
          <h2>Rockwell interiors and waterfront light.</h2>
        </div>
        <div class="editorial-grid residences-grid">
          <article class="feature-card wide">
            <img src="${ritzMediaBase}ritz-residence-living-room-sunrise-2400x1600.png" alt="Ritz-Carlton residence living room at sunrise" />
            <div>
              <span>Residence</span>
              <strong>Sunrise living room</strong>
            </div>
          </article>
          ${ritzResidenceGallery.slice(1).map(renderFeatureCard).join("")}
          <article class="feature-card">
            <img src="${ritzMediaBase}ritz-lobby-service-2400x1600.png" alt="Ritz-Carlton residential lobby service moment" />
            <div>
              <span>Service</span>
              <strong>Private residential rhythm</strong>
            </div>
          </article>
        </div>
      </section>

      <section class="section" id="ritz-views">
        <div class="section-heading">
          <p class="eyebrow">Ritz Views</p>
          <h2>Intracoastal by day, skyline by night.</h2>
        </div>
        <div class="view-pair">
          <figure>
            <img src="${ritzMediaBase}ritz-view-intracoastal-day-2400x1600.png" alt="Daytime Intracoastal and Palm Beach view from the Ritz-Carlton Residences" />
            <figcaption>Day view · Palm Beach Island and Atlantic horizon · ${imageProviderLabel(`${ritzMediaBase}ritz-view-intracoastal-day-2400x1600.png`)}</figcaption>
          </figure>
          <figure>
            <img src="${ritzMediaBase}ritz-view-balcony-night-2400x1600.png" alt="Night balcony view toward downtown West Palm Beach" />
            <figcaption>Night view · Downtown West Palm Beach and waterfront lights · ${imageProviderLabel(`${ritzMediaBase}ritz-view-balcony-night-2400x1600.png`)}</figcaption>
          </figure>
        </div>
      </section>

      <section class="section" id="ritz-amenities">
        <div class="section-heading">
          <p class="eyebrow">Ritz Amenities</p>
          <h2>Wellness, pool deck, and hospitality service.</h2>
        </div>
        <div class="editorial-grid amenities-grid ritz-amenities-grid">
          ${ritzAmenityGallery.map(renderFeatureCard).join("")}
        </div>
      </section>

      <section class="section split-section marina-section">
        <figure class="feature-image">
          <img src="${ritzMediaBase}ritz-evening-aerial-road-motion-2400x1600.png" alt="Night aerial view of the Ritz-Carlton Residences and West Palm Beach waterfront" />
        </figure>
        <div class="split-copy">
          <p class="eyebrow">Market Context</p>
          <h2>North Flagler is the next luxury spine.</h2>
          <p>
            The tower sits inside the broader North Flagler story, where downtown access,
            Palm Beach proximity, waterfront views, and branded service all shape buyer comparison.
          </p>
        </div>
      </section>

      <section class="section document-section" id="ritz-floorplans">
        <div class="section-heading">
          <p class="eyebrow">Ritz Document Library</p>
          <h2>Brochure and released floorplans.</h2>
        </div>
        <div class="document-grid">
          <a class="document-card" href="${ritzBrochureUrl}" target="_blank" rel="noreferrer">
            <span>External · Brochure</span>
            <strong>Ritz-Carlton WPB Brochure</strong>
            <small>Official public brochure viewer</small>
          </a>
          <a class="document-card" href="${ritzDocsBase}floorplans/ritz-residence-02.pdf" target="_blank" rel="noreferrer">
            <span>PDF · Floorplan Example</span>
            <strong>Residence 02</strong>
            <small>2 Bed / 2.5 Bath released plan</small>
          </a>
        </div>
        <div class="floorplan-library">
          <div>
            <p class="eyebrow">Released Plans</p>
            <h3>Residence and lake-home PDFs organized for direct buyer review.</h3>
          </div>
          <div class="floorplan-grid">
            ${ritzFloorplanDownloads.map((plan) => renderFloorplanLink(plan, ritzDocsBase)).join("")}
          </div>
        </div>
      </section>
      </div>

      <div class="route-view route-view-inquiry" data-route-view="inquire" hidden>
      <section class="section inquiry-section" id="inquire">
        <div>
          <p class="eyebrow">Private Advisory</p>
          <h2>Request current availability and the full floorplan packet.</h2>
          <div class="inquiry-deliverables" aria-label="What the advisory packet includes">
            <article>
              <span>1</span>
              <strong>Availability grid</strong>
              <small>Current residence availability, pricing guidance, incentives, delivery, and fees to confirm in writing.</small>
            </article>
            <article>
              <span>2</span>
              <strong>Floorplan shortlist PDF</strong>
              <small>Released plans, packet requests, and buyer-fit notes by residence line.</small>
            </article>
            <article>
              <span>3</span>
              <strong>Corridor comparison memo</strong>
              <small>North Flagler, Downtown, and South Flagler tradeoffs, source-risk notes, and tour path.</small>
            </article>
          </div>
          <p class="source-note">${advisorProfile.name}, Broker Associate (${advisorProfile.license}) · ${advisorProfile.group} · ${advisorProfile.brokerage} (Florida license ${advisorProfile.brokerageLicense})</p>
        </div>
        <form class="inquiry-form" name="wpb-lead-intake" method="POST" data-netlify="true" netlify-honeypot="company">
          <input type="hidden" name="form-name" value="wpb-lead-intake" />
          <input class="lead-honeypot" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <label>
            <span>Name</span>
            <input type="text" name="name" autocomplete="name" placeholder="Your name" required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Phone</span>
            <input type="tel" name="phone" autocomplete="tel" placeholder="Preferred phone" />
          </label>
          <label>
            <span>Project</span>
            <select name="project">
              <option value="">Not sure yet</option>
              ${featuredProjects.map((project) => `<option value="${project.id}">${project.name}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Interest</span>
            <select name="interest">
              <option>Request floorplans</option>
              <option>Request Ritz-Carlton floorplans</option>
              <option>Request Olara floorplans</option>
              <option>Schedule private tour</option>
              <option>Ask an advisor</option>
              <option>Compare with Ritz / Shorecrest / Mr. C</option>
            </select>
          </label>
          <label class="inquiry-message">
            <span>What would help most?</span>
            <textarea name="message" rows="4" placeholder="Project, timing, budget range, or questions you want answered"></textarea>
          </label>
          <label class="consent-row">
            <input type="checkbox" name="consent" required />
            <span>By submitting, I consent to be contacted by ${advisorProfile.name}, ${advisorProfile.group}, and ${advisorProfile.brokerage} at the email address or phone number I provided about this real-estate inquiry. This request is for a manual response and is not consent to autodialed, prerecorded, or automated marketing calls or texts. Pricing, availability, incentives, square footage, fees, and delivery dates require current written confirmation.</span>
          </label>
          <button class="button primary" type="submit">Request Advisory Packet</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
        <p class="source-note">
          Pricing, availability, square footage, and delivery timing change frequently and must be verified with the developer or sales team before reliance.
        </p>
      </section>
      </div>
    </main>
    <footer class="site-footer">
      <div>
        <strong>WPB New Construction</strong>
        <p>${advisorProfile.name}, Broker Associate (${advisorProfile.license})<br />${advisorProfile.group}<br />${advisorProfile.brokerage}<br />Florida license ${advisorProfile.brokerageLicense}</p>
      </div>
      <div>
        <span>Review Method</span>
        <p>Project facts are separated as official, reported, or confirm-before-offer when sources conflict. <a href="/methodology/">See how we verify.</a></p>
      </div>
      <div>
        <span>Contact</span>
        <p>${advisorProfile.brokerage} (Florida license ${advisorProfile.brokerageLicense})<br /><a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a><br /><a href="mailto:${advisorProfile.email}">${advisorProfile.email}</a></p>
        <p class="footer-links"><a href="/fair-housing/">Fair Housing</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p>
      </div>
      <small>Equal Housing Opportunity. Not affiliated with the developers or brands shown. All pricing, availability, incentives, and delivery dates require current confirmation.</small>
    </footer>
  </div>
`;

document.querySelector<HTMLFormElement>(".inquiry-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const target = event.currentTarget;
  if (!(target instanceof HTMLFormElement)) {
    return;
  }

  const form = new FormData(target);
  if (!target.reportValidity()) {
    return;
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const project = String(form.get("project") ?? "").trim();
  const interest = String(form.get("interest") ?? "Request floorplans");
  const message = String(form.get("message") ?? "").trim();
  const status = target.querySelector<HTMLElement>(".form-status");
  const submittedAt = new Date().toISOString();
  const leadRecord = {
    submittedAt,
    name,
    email,
    phone,
    project,
    interest,
    message,
    consent: "yes",
    source: window.location.href,
  };
  const subject = encodeURIComponent(`WPB New Construction inquiry: ${interest}`);
  const body = encodeURIComponent(
    `Submitted: ${submittedAt}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nProject: ${project || "Not sure yet"}\nInterest: ${interest}\nMessage: ${message || "Please send current availability, floorplans, and advisor notes."}\n\nConsent: Buyer understands pricing, availability, and delivery dates require current confirmation.`,
  );

  if (status) {
    status.textContent = "Saving inquiry...";
  }

  const sentToFormHandler = await submitLeadForm(form);
  if (sentToFormHandler) {
    if (status) {
      status.textContent = "Inquiry captured. Brooke will follow up with current availability and floorplan guidance.";
    }
    target.reset();
    return;
  }

  if (status) {
    queueLeadLocally(leadRecord);
    status.textContent = "Inquiry saved in this browser. Email did not submit automatically; ";
    const link = document.createElement("a");
    link.href = `mailto:${advisorProfile.email}?subject=${subject}&body=${body}`;
    link.textContent = "send it by email";
    status.append(link, ".");
  }
});

function queueLeadLocally(leadRecord: Record<string, string>) {
  try {
    const existing = JSON.parse(window.localStorage.getItem("wpbLeadQueue") ?? "[]");
    const queue = Array.isArray(existing) ? existing : [];
    queue.push(leadRecord);
    window.localStorage.setItem("wpbLeadQueue", JSON.stringify(queue.slice(-100)));
  } catch {
    // Lead capture still continues through the form endpoint or mailto fallback.
  }
}

async function submitLeadForm(form: FormData) {
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(form as unknown as Record<string, string>).toString(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

const projectRouteAliases: Record<string, string> = {
  "south-flagler-house-north": "south-flagler-house",
  "south-flagler-house-south": "south-flagler-house",
};

applyRoute();
initProjectBrowser();
initHeroGoogleMap();

function applyRoute() {
  const route = getCurrentRoute();
  const shell = document.querySelector<HTMLElement>(".site-shell");
  const views = Array.from(document.querySelectorAll<HTMLElement>("[data-route-view]"));
  const activeProject = route.type === "project" ? featuredProjects.find((project) => project.id === route.projectId) : undefined;

  shell?.setAttribute("data-active-route", route.type);
  shell?.setAttribute("data-active-project", route.projectId ?? "");
  const routeTitles: Record<string, string> = {
    news: "Market Updates | WPB New Construction",
    floorplans: "Floorplans | WPB New Construction",
    answers: "Buyer Q&A | WPB New Construction",
    methodology: "How We Verify | WPB New Construction",
    privacy: "Privacy | WPB New Construction",
    terms: "Terms | WPB New Construction",
    "fair-housing": "Fair Housing | WPB New Construction",
    inquire: "Inquire | WPB New Construction",
  };
  document.title = activeProject ? `${activeProject.name} | WPB New Construction` : routeTitles[route.type] ?? siteMeta.title;

  updateMetaDescription(route.type, activeProject);
  updateStructuredData(route.type, activeProject);

  views.forEach((view) => {
    const viewType = view.dataset.routeView;
    const isActive =
      route.type === "project"
        ? viewType === "project" && view.dataset.projectId === route.projectId
        : viewType === route.type;

    view.hidden = !isActive;
  });

  document.querySelectorAll<HTMLElement>("[data-nav-item]").forEach((item) => {
    const isActive = item.dataset.navItem === route.type || (route.type === "project" && item.dataset.navItem === "home");
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  syncInquiryContext();

  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0 });
  }
}

function syncInquiryContext() {
  const params = new URLSearchParams(window.location.search);
  const rawProjectId = params.get("project");
  const projectId = rawProjectId ? projectRouteAliases[rawProjectId] ?? rawProjectId : "";
  const interest = params.get("interest");
  const projectSelect = document.querySelector<HTMLSelectElement>('.inquiry-form select[name="project"]');
  const interestSelect = document.querySelector<HTMLSelectElement>('.inquiry-form select[name="interest"]');

  if (projectSelect && projectId && featuredProjects.some((project) => project.id === projectId)) {
    projectSelect.value = projectId;
  }

  if (interestSelect && interest === "floorplans") {
    interestSelect.value = "Request floorplans";
  }
}

function getCurrentRoute() {
  const params = new URLSearchParams(window.location.search);
  const rawProjectId = params.get("project");
  const view = params.get("view");
  const projectId = rawProjectId ? projectRouteAliases[rawProjectId] ?? rawProjectId : null;

  const pathView = staticRoutePaths[window.location.pathname];
  if (pathView) {
    return { type: pathView } as Route;
  }

  const projectPathMatch = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (projectPathMatch) {
    const staticProjectId = projectRouteAliases[projectPathMatch[1]] ?? projectPathMatch[1];
    if (featuredProjects.some((project) => project.id === staticProjectId)) {
      return { type: "project", projectId: staticProjectId };
    }
  }

  if (
    view === "news" ||
    view === "inquire" ||
    view === "floorplans" ||
    view === "answers" ||
    view === "methodology" ||
    view === "privacy" ||
    view === "terms" ||
    view === "fair-housing"
  ) {
    return { type: view };
  }

  if (projectId && featuredProjects.some((project) => project.id === projectId)) {
    return { type: "project", projectId };
  }

  return { type: "home" };
}

function updateMetaDescription(routeType: string, activeProject?: FeaturedProject) {
  const descriptions: Record<string, string> = {
    home: siteMeta.description,
    news: "West Palm Beach new-construction market updates translated into practical buyer context.",
    floorplans: "Released West Palm Beach new-construction condo floorplans organized by project for easier first comparison.",
    answers: "Buyer-focused West Palm Beach new-construction condo answers with cited sources and practical next steps.",
    methodology: "How WPB New Construction separates official sources, reported details, and items to confirm before relying on project information.",
    privacy: "Privacy information for WPB New Construction inquiry forms, Douglas Elliman policy references, and buyer lead handling.",
    terms: "Terms and limitations for WPB New Construction buyer guidance, project information, and advisory content.",
    "fair-housing": "Equal Housing Opportunity and fair housing disclosure for WPB New Construction buyer advisory content.",
    inquire: "Request current West Palm Beach new-construction availability, floorplans, pricing guidance, and private advisory context.",
    project: activeProject?.summary ?? "West Palm Beach new-construction project profile with facts, floorplans, sources, and buyer guidance.",
  };
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
  }
  meta.content = descriptions[routeType] ?? siteMeta.description;
}

function updateStructuredData(routeType: string, activeProject?: FeaturedProject) {
  const baseGraph = [
    {
      "@type": siteMeta.publisher.type,
      "@id": `${siteMeta.baseUrl}/#publisher`,
      name: siteMeta.publisher.name,
      areaServed: siteMeta.publisher.areaServed,
    },
    {
      "@type": "Person",
      "@id": `${siteMeta.baseUrl}/#advisor`,
      name: siteMeta.expertByline.name,
      jobTitle: siteMeta.expertByline.title,
      worksFor: { "@id": `${siteMeta.baseUrl}/#publisher` },
    },
    {
      "@type": "WebSite",
      "@id": `${siteMeta.baseUrl}/#website`,
      name: siteMeta.siteName,
      url: siteMeta.baseUrl,
      publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    },
  ];

  const routeGraph =
    routeType === "answers"
      ? [buildFaqSchema()]
      : routeType === "floorplans"
        ? [buildFloorplanItemListSchema()]
        : routeType === "news"
          ? researchNewsFeed.map(buildNewsArticleSchema)
          : routeType === "methodology" || routeType === "privacy" || routeType === "terms" || routeType === "fair-housing"
            ? [buildLegalPageSchema(routeType)]
          : activeProject
            ? [buildProjectSchema(activeProject)]
            : [buildHomeItemListSchema()];

  setJsonLd({
    "@context": "https://schema.org",
    "@graph": [...baseGraph, ...routeGraph],
  });
}

function setJsonLd(data: unknown) {
  const id = "wpb-structured-data";
  let script = document.querySelector<HTMLScriptElement>(`#${id}`);
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.append(script);
  }
  script.textContent = JSON.stringify(data);
}

function buildFaqSchema() {
  return {
    "@type": "FAQPage",
    "@id": `${siteMeta.baseUrl}/answers/#faq`,
    name: "West Palm Beach New Construction Answers",
    author: { "@id": `${siteMeta.baseUrl}/#advisor` },
    reviewedBy: { name: siteMeta.reviewedBy.name },
    dateModified: researchNewsFeed[0]?.dateModified ?? floorplanLibrary[0]?.updatedAt,
    mainEntity: answerEngineFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
        citation: item.sourceCitations.map((source) => source.href),
      },
    })),
  };
}

function buildFloorplanItemListSchema() {
  return {
    "@type": "ItemList",
    "@id": `${siteMeta.baseUrl}/floorplans/#floorplans`,
    name: "West Palm Beach New Construction Floorplans",
    numberOfItems: floorplanLibrary.reduce((total, project) => total + project.count, 0),
    itemListElement: floorplanLibrary
      .filter((project) => project.count > 0)
      .map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.name,
        url: `${siteMeta.baseUrl}/floorplans/#floorplans-${project.projectId}`,
      })),
  };
}

function buildNewsArticleSchema(item: (typeof researchNewsFeed)[number]) {
  return {
    "@type": "NewsArticle",
    "@id": `${siteMeta.baseUrl}/updates/#${item.id}`,
    headline: item.title,
    description: item.summary,
    datePublished: item.datePublished,
    dateModified: item.dateModified,
    author: { "@id": `${siteMeta.baseUrl}/#advisor` },
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    citation: item.citations,
  };
}

function buildProjectSchema(project: FeaturedProject) {
  const draft = editorProjectPageDrafts[project.id];
  const unitCount = Number(project.residences.match(/\d+/)?.[0] ?? 0) || undefined;
  return {
    "@type": "ApartmentComplex",
    "@id": `${siteMeta.baseUrl}${projectPath(project)}#project`,
    name: project.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address,
      addressLocality: "West Palm Beach",
      addressRegion: "FL",
      addressCountry: "US",
    },
    latitude: project.latitude,
    longitude: project.longitude,
    description: project.summary,
    url: `${siteMeta.baseUrl}${projectPath(project)}`,
    image: project.image ? `${siteMeta.baseUrl}${project.image}` : undefined,
    numberOfAccommodationUnits: unitCount,
    dateModified: researchNewsFeed[0]?.dateModified ?? floorplanLibrary[0]?.updatedAt,
    status: project.status,
    subjectOf: [
      ...(draft?.documents ?? []).filter((document) => document.href).map((document) => ({
        "@type": "CreativeWork",
        name: document.title,
        url: document.href,
      })),
      {
        "@type": "WebPage",
        name: "How We Verify",
        url: `${siteMeta.baseUrl}/methodology/`,
      },
    ],
    reviewedBy: { "@id": `${siteMeta.baseUrl}/#advisor` },
    amenityFeature: getFloorplanProject(project.id)?.count ? [{ "@type": "LocationFeatureSpecification", name: "Floorplans available" }] : [],
  };
}

function buildLegalPageSchema(routeType: string) {
  const labels: Record<string, string> = {
    methodology: "How We Verify",
    privacy: "Privacy",
    terms: "Terms",
    "fair-housing": "Fair Housing",
  };
  const path = routeType === "news" ? "updates" : routeType;
  return {
    "@type": routeType === "methodology" ? "AboutPage" : "WebPage",
    "@id": `${siteMeta.baseUrl}/${path}/#webpage`,
    name: `${labels[routeType] ?? routeType} | WPB New Construction`,
    url: `${siteMeta.baseUrl}/${path}/`,
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    reviewedBy: { "@id": `${siteMeta.baseUrl}/#advisor` },
    dateModified: researchNewsFeed[0]?.dateModified ?? floorplanLibrary[0]?.updatedAt,
  };
}

function buildHomeItemListSchema() {
  return {
    "@type": "ItemList",
    "@id": `${siteMeta.baseUrl}/#projects`,
    name: "West Palm Beach New Construction Projects",
    itemListElement: featuredProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.name,
      url: `${siteMeta.baseUrl}${projectPath(project)}`,
    })),
  };
}

function renderProjectFilter(filter: ProjectFilter) {
  const active = filter.key === "all" ? " is-active" : "";
  return `
    <button class="filter-chip${active}" type="button" data-project-filter="${filter.key}" aria-pressed="${filter.key === "all"}">
      ${filter.label}
    </button>
  `;
}

function renderGalleryCard(asset: MediaAsset) {
  const provider = imageProviderLabel(asset.src);
  const media = renderMediaAsset(asset, "gallery");
  return `
    <article class="gallery-card">
      ${media}
      <div>
        <span>${asset.kicker}</span>
        <strong>${asset.title}</strong>
        <small>${provider}</small>
      </div>
    </article>
  `;
}

function renderTeamCredit(credit: TeamCredit) {
  return `
    <article class="team-card">
      <span>${credit.role}</span>
      <strong>${credit.name}</strong>
      <p>${credit.note}</p>
    </article>
  `;
}

function renderFeatureCard(asset: MediaAsset) {
  const provider = imageProviderLabel(asset.src);
  const media = renderMediaAsset(asset, "feature");
  return `
    <article class="feature-card">
      ${media}
      <div>
        <span>${asset.kicker}</span>
        <strong>${asset.title}</strong>
        <small>${provider}</small>
      </div>
    </article>
  `;
}

function imageProviderLabel(src: string) {
  const sourceName = imageSourceName(src);
  return `Image: ${sourceName}`;
}

function imageCaptionShort(src: string) {
  return imageSourceName(src);
}

function canShowImage(src: string) {
  return Boolean(src);
}

function renderMediaAsset(asset: MediaAsset, variant = "standard") {
  if (canShowImage(asset.src)) {
    return `<img src="${asset.src}" alt="${asset.alt}" loading="lazy" />`;
  }

  return `
    <div class="image-placeholder image-placeholder-${variant}" role="img" aria-label="${asset.title}">
      <span>${asset.kicker}</span>
      <strong>${asset.title}</strong>
    </div>
  `;
}

function imageSourceName(src: string) {
  if (src.includes("user-provided-")) return "Project gallery";
  if (src.includes("/olara/")) return "Olara";
  if (src.includes("/ritz-carlton-wpb/")) return "The Ritz-Carlton Residences WPB";
  if (src.includes("/mandarin-oriental/")) return "Mandarin Oriental Residences WPB";
  if (src.includes("/shorecrest/")) return "Shorecrest";
  if (src.includes("/mr-c/")) return "Mr. C Residences WPB";
  if (src.includes("/alba-palm-beach/")) return "Alba Palm Beach";
  if (src.includes("/nora-house/")) return "NORA House";
  if (src.includes("/south-flagler-house/")) return "South Flagler House";
  if (src.includes("/berkeley/")) return "The Berkeley Palm Beach";
  if (src.includes("/forte-on-flagler/")) return "Forte on Flagler";
  if (src.includes("/maison-dor/")) return "Maison d'Or";
  if (src.includes("/banyan-tree/")) return "Banyan Tree Residences WPB";
  if (src.includes("/edgeworth-north/")) return "Edgeworth North";
  if (src.includes("/edgeworth-south/")) return "Edgeworth South";
  if (src.includes("/15-cityplace/")) return "Related Ross CityPlace";
  if (src.includes("/alba-reserve/")) return "Alba Reserve";
  if (src.includes("/la-clara/")) return "La Clara";
  if (src.includes("/fort-partners-south-flagler/")) return "Fort Partners South Flagler";
  if (src.includes("/portofino-flagler-yacht-club/")) return "Portofino / Flagler Yacht Club";
  if (src.includes("/related-ross-fern-street/")) return "Related Ross Fern Street";
  if (src.includes("/rybovich-marina/")) return "Rybovich Marina";
  return "WPB New Construction";
}

function imageCreditShort(src: string) {
  return imageSourceName(src);
}

function renderFeaturedProject(project: FeaturedProject) {
  const media = project.image && canShowImage(project.image)
    ? `<img src="${project.image}" alt="${project.name} project preview" loading="eager" decoding="sync" fetchpriority="${project.rank <= 6 ? "high" : "auto"}" />`
    : `<div class="project-card-placeholder image-placeholder"><span>${project.corridor}</span><strong>${project.name}</strong></div>`;
  const floorplanCount = getFloorplanProject(project.id)?.count ?? 0;
  const residenceLabel = project.residences.toLowerCase().includes("reported") || project.residences.toLowerCase().includes("residence")
    ? project.residences
    : `${project.residences} residences`;
  const pricingLabel = project.price.toLowerCase().includes("confirm")
    ? "Pricing: request current guidance"
    : `Pricing: ${project.price}`;

  return `
    <article
      class="front-project-card"
      data-project-card
      data-project-id="${project.id}"
      data-project-name="${project.name}"
      data-filter-values="${getProjectFilterValues(project)}"
      data-corridor="${project.corridorKey}"
      data-status="${toFilterValue(project.status)}"
      data-floorplans="${project.floorplans}"
      data-delivery="${project.deliveryYear}"
      data-residences="${getResidenceSortValue(project)}"
      data-rank="${project.rank}"
    >
      <figure>
        ${media}
        <figcaption>${project.image ? imageCaptionShort(project.image) : `${project.corridor} project`}</figcaption>
      </figure>
      <div class="front-project-card-body">
        <span>${project.corridor} · ${project.status}</span>
        <strong>${project.name}</strong>
        <p>${project.summary}</p>
        <div class="project-card-intel" aria-label="${project.name} buyer intelligence">
          <small>Delivery: ${project.delivery}</small>
          <small>${residenceLabel}</small>
          <small>${floorplanCount ? `${floorplanCount} plan records` : "Plan packet needed"}</small>
          <small>${pricingLabel}</small>
        </div>
        <dl>
          <div>
            <dt>Address</dt>
            <dd>${project.address}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>${project.status}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>${project.delivery}</dd>
          </div>
          <div>
            <dt>Residences</dt>
            <dd>${project.residences}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>${project.price}</dd>
          </div>
        </dl>
        <div class="project-card-actions">
          <a href="${projectPath(project)}">Open Project <span aria-hidden="true">→</span></a>
          <a href="/inquire/?project=${project.id}&interest=floorplans">Request Packet <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>
  `;
}

function projectPath(project: FeaturedProject) {
  return `/projects/${project.id}/`;
}

function loadGoogleMaps() {
  const loadedMaps = (window as WindowWithGoogleMaps).google?.maps;
  if (loadedMaps) {
    return Promise.resolve(loadedMaps);
  }

  if (!googleMapsApiKey) {
    return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
  }

  if (googleMapsLoader) {
    return googleMapsLoader;
  }

  googleMapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[data-map-loader="${heroMapScriptId}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        const maps = (window as WindowWithGoogleMaps).google?.maps;
        if (maps) {
          resolve(maps);
        } else {
          reject(new Error("Google Maps loaded without maps namespace"));
        }
      });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }

    const params = new URLSearchParams({
      key: googleMapsApiKey,
      libraries: "marker",
    });
    const script = document.createElement("script");
    script.dataset.mapLoader = heroMapScriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.addEventListener("load", () => {
      const maps = (window as WindowWithGoogleMaps).google?.maps;
      if (maps) {
        resolve(maps);
      } else {
        reject(new Error("Google Maps loaded without maps namespace"));
      }
    });
    script.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
    document.head.append(script);
  });

  return googleMapsLoader;
}

function initHeroGoogleMap() {
  if (getCurrentRoute().type !== "home") {
    return;
  }

  const card = document.querySelector<HTMLElement>(".home-hero-map-card");
  const canvas = document.querySelector<HTMLElement>("[data-hero-google-map]");
  const expandButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-map-expand]"));

  if (!card || !canvas) {
    return;
  }

  if (!googleMapsApiKey) {
    card.dataset.mapState = "fallback";
    expandButtons.forEach((button) => {
      button.textContent = "Configure Google Map";
      button.disabled = true;
    });
    return;
  }

  card.dataset.mapState = "loading";

  loadGoogleMaps()
    .then((maps) => {
      card.dataset.mapState = "ready";
      const mapOptions: Record<string, unknown> = {
        center: { lat: 26.7134, lng: -80.0564 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: "cooperative",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#ebe5da" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#3a332d" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#f7f3eb" }] },
          { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#a9c0c2" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#fffaf1" }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#d7cbb9" }] },
        ],
      };

      if (googleMapsMapId) {
        mapOptions.mapId = googleMapsMapId;
      }

      const map = new maps.Map(canvas, mapOptions);
      let expanded = false;
      let markers: InstanceType<GoogleMapsNamespace["Marker"]>[] = [];

      const renderMarkers = () => {
        markers.forEach((marker) => marker.setMap(null));
        markers = [];
        const projects = expanded ? rankedFeaturedProjects : rankedFeaturedProjects.slice(0, 7);
        const bounds = new maps.LatLngBounds();

        projects.forEach((project, index) => {
          const position = { lat: project.latitude, lng: project.longitude };
          bounds.extend(position);
          const marker = new maps.Marker({
            map,
            position,
            title: `${project.name} · ${project.address}`,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: index < 7 ? 8 : 5,
              fillColor: index < 7 ? "#0d3125" : "#50665e",
              fillOpacity: 1,
              strokeColor: "#fffaf1",
              strokeWeight: index < 7 ? 2 : 1,
            },
          });
          marker.addListener("click", () => {
            window.location.assign(projectPath(project));
          });
          markers.push(marker);
        });

        map.fitBounds(bounds, expanded ? 44 : 56);
      };

      const expandMap = () => {
        if (expanded) {
          return;
        }
        expanded = true;
        card.classList.add("is-expanded");
        expandButtons.forEach((button) => {
          button.textContent = "Showing all locations";
        });
        renderMarkers();
      };

      expandButtons.forEach((button) => {
        button.addEventListener("click", expandMap);
      });
      map.addListener("click", expandMap);
      renderMarkers();
    })
    .catch((error: Error) => {
      card.dataset.mapState = "fallback";
      console.warn(error.message);
    });
}

function renderNewsItem(item: NewsItem) {
  return `
    <article class="news-card">
      <span>${item.kicker}</span>
      <strong>${item.title}</strong>
      <p>${item.summary}</p>
      <small>${item.tag}</small>
    </article>
  `;
}

function renderResearchNewsItem(item: ResearchNewsItem) {
  const { image, credit } = newsImageForItem(item);
  return `
    <article class="news-card intelligence-news-card" id="${escapeHtml(item.id)}">
      <figure>
        <img src="${safeHref(image)}" alt="${escapeHtml(item.title)} related building image" loading="eager" decoding="sync" />
        <figcaption>${escapeHtml(credit)}</figcaption>
      </figure>
      <span>${escapeHtml(item.category)} · ${escapeHtml(item.dateModified)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.summary)}</p>
      <small>${escapeHtml(item.sourceName)} · ${escapeHtml(item.status)}</small>
    </article>
  `;
}

function renderHomeNewsItem(item: ResearchNewsItem) {
  const sourceHref = safeHref(item.sourceUrl || `/updates/#${item.id}`);
  const { image, credit, relatedProject } = newsImageForItem(item);

  return `
    <article class="home-news-card" id="home-${escapeHtml(item.id)}">
      <figure>
        <img src="${safeHref(image)}" alt="${escapeHtml(relatedProject ? `${relatedProject.name} related update image` : "West Palm Beach new-construction map")}" loading="eager" decoding="sync" />
        <figcaption>${escapeHtml(credit)}</figcaption>
      </figure>
      <div>
        <span>${escapeHtml(item.category)} · ${escapeHtml(item.dateModified)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.rewrittenSummary || item.summary)}</p>
        <small>Source: <a href="${sourceHref}" target="${sourceHref.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">${escapeHtml(item.sourceName)}</a></small>
        <a class="home-news-link" href="/updates/#${escapeHtml(item.id)}">Read update <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function newsImageForItem(item: ResearchNewsItem) {
  const relatedProject = featuredProjects.find((project) => item.projectIds.includes(project.id));
  const generatedImage = item.image?.path ?? "";
  if (generatedImage && (generatedImage.startsWith("/maps/") || canShowImage(generatedImage))) {
    return {
      image: generatedImage,
      credit: item.image?.credit ?? imageCreditShort(generatedImage),
      relatedProject,
    };
  }

  if (relatedProject?.image && canShowImage(relatedProject.image)) {
    return {
      image: relatedProject.image,
      credit: imageCreditShort(relatedProject.image),
      relatedProject,
    };
  }

  return {
    image: siteMeta.defaultImage,
    credit: "Source: WPB New Construction map",
    relatedProject,
  };
}

function renderFloorplanProject(project: (typeof floorplanLibrary)[number]) {
  const plans = project.plans.slice(0, 36);
  const extraCount = Math.max(0, project.plans.length - plans.length);
  return `
    <article class="floorplan-project-card" id="floorplans-${escapeHtml(project.projectId)}">
      <div class="floorplan-project-heading">
        <div>
          <span>${escapeHtml(project.area)} · ${escapeHtml(project.pageStatus)}</span>
          <h2>${escapeHtml(project.name)}</h2>
        </div>
        <strong>${escapeHtml(project.count || "Gap")}</strong>
      </div>
      ${
        plans.length
          ? `<div class="floorplan-grid floorplan-grid-wide">
              ${plans.map((plan) => renderGeneratedFloorplanLink(plan)).join("")}
            </div>
            ${extraCount ? `<p class="source-note">${extraCount} additional plan records are available in the buyer catalog.</p>` : ""}`
          : `<p class="floorplan-gap">${escapeHtml(project.missingNote)}</p>`
      }
    </article>
  `;
}

function renderGeneratedFloorplanLink(plan: (typeof floorplanLibrary)[number]["plans"][number]) {
  const title = plan.title;
  if (!plan.href) {
    return `
      <article class="floorplan-link floorplan-link-static">
        <span>${escapeHtml(title)}</span>
        <small>Available through current sales packet</small>
      </article>
    `;
  }

  return `
    <a class="floorplan-link" href="${safeHref(plan.href)}" target="_blank" rel="noreferrer">
      <span>${escapeHtml(title)}</span>
      <small>Open floorplan</small>
    </a>
  `;
}

function answerShortLabel(item: (typeof answerEngineFaq)[number]) {
  return item.shortLabel;
}

function renderHomeAnswerCard(item: (typeof answerEngineFaq)[number], index: number) {
  return `
    <article class="home-answer-card">
      <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(item.shortLabel)}</span>
      <h3>${escapeHtml(item.question)}</h3>
      <p>${escapeHtml(item.answer)}</p>
      <a href="/answers/#${escapeHtml(item.id)}">Read answer <span aria-hidden="true">→</span></a>
    </article>
  `;
}

function renderAnswerFactMatrix() {
  const primaryProjectIds = new Set([
    "olara",
    "ritz-carlton-wpb",
    "shorecrest",
    "mr-c",
    "alba-palm-beach",
    "mandarin-oriental",
    "south-flagler-house",
    "nora-house",
    "banyan-tree",
    "maison-dor",
  ]);
  return `
    <div class="answer-fact-matrix">
      ${rankedFeaturedProjects
        .filter((project) => primaryProjectIds.has(project.id))
        .map(renderAnswerFactRow)
        .join("")}
    </div>
    <p class="answer-fact-note">Pricing, delivery, fees, inventory, and view premiums change quickly. Use this matrix for orientation, then request the current packet before relying on any figure.</p>
  `;
}

function renderAnswerFactRow(project: FeaturedProject) {
  const draft = editorProjectPageDrafts[project.id] ?? projectDraftFromFeatured(project);
  const stories = draft.facts.find((fact) => /stor/i.test(fact.label))?.value ?? "Verify";
  return `
    <article class="answer-fact-row">
      <div>
        <span>${escapeHtml(project.corridor)}</span>
        <a href="${projectPath(project)}">${escapeHtml(project.name)}</a>
      </div>
      <dl>
        <div><dt>Stories</dt><dd>${escapeHtml(stories)}</dd></div>
        <div><dt>Residences</dt><dd>${escapeHtml(project.residences)}</dd></div>
        <div><dt>Timing</dt><dd>${escapeHtml(project.delivery)}</dd></div>
        <div><dt>Pricing</dt><dd>${escapeHtml(project.price)}</dd></div>
        <div><dt>Views</dt><dd>${escapeHtml(projectViewSummary(project))}</dd></div>
      </dl>
    </article>
  `;
}

function projectViewSummary(project: FeaturedProject) {
  if (["olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach", "mandarin-oriental"].includes(project.id)) {
    return "North Flagler waterfront / Intracoastal orientation";
  }
  if (["south-flagler-house", "maison-dor"].includes(project.id)) {
    return "South Flagler waterfront / Palm Beach-facing orientation";
  }
  if (["forte-on-flagler", "la-clara"].includes(project.id)) {
    return "Delivered South Flagler waterfront benchmark";
  }
  if (project.corridorKey === "downtown") {
    return "Downtown/city orientation; verify water views by stack";
  }
  return "Verify by stack plan and floor";
}

function sourceFactForProject(projectId: string) {
  const sourceId = projectId === "south-flagler-house" ? "south-flagler-house-north" : projectId;
  return projectFactById.get(sourceId as (typeof projectFacts)[number]["projectId"]);
}

function renderAnswerBlock(item: (typeof answerEngineFaq)[number]) {
  const sourceCitations = item.sourceCitations;
  return `
    <article class="answer-block" id="${escapeHtml(item.id)}">
      <div>
        <span>${escapeHtml(item.concept)}</span>
        <h2>${escapeHtml(item.question)}</h2>
      </div>
      <p>${escapeHtml(item.answer)}</p>
      ${
        sourceCitations.length
          ? `<div class="answer-citation-grid">
              ${sourceCitations
                .map(
                  (source) => `
                    <a class="answer-citation" href="${safeHref(source.href)}">
                      <strong>${escapeHtml(source.label)}</strong>
                      <small>${escapeHtml(source.note)}</small>
                    </a>
                  `,
                )
                .join("")}
            </div>`
          : ""
      }
      <footer>
        <small>Related: ${escapeHtml(item.relatedProjectIds.join(", "))}</small>
        <small>Sources: ${escapeHtml(item.sources.join("; "))}</small>
        <small>Accessed: ${escapeHtml(item.sourceCitations[0]?.dateAccessed ?? researchNewsFeed[0]?.dateModified ?? "current review")}</small>
      </footer>
    </article>
  `;
}

function renderProjectFact(fact: ProjectFact) {
  return `
    <article class="profile-card">
      <span>${fact.label}</span>
      <strong>${fact.value}</strong>
      ${fact.note ? `<p>${fact.note}</p>` : ""}
    </article>
  `;
}

function renderDraftProjectPage(project: FeaturedProject) {
  const draft = editorProjectPageDrafts[project.id] ?? projectDraftFromFeatured(project);
  const floorplanProject = getFloorplanProject(project.id);
  const floorplanCount = floorplanProject?.count ?? 0;
  const brochureStats = projectBrochureStats(project, draft, floorplanCount);
  const gallery = projectBrochureGallery(project, draft);
  const residenceTiles = gallery.slice(0, 3);
  const amenityTiles = projectBrochureAmenityTiles(project, draft);
  const teamTiles = projectBrochureTeamTiles(project, draft);

  return `
    <div class="route-view route-view-project route-view-draft-project route-view-brochure-project" data-route-view="project" data-project-id="${project.id}" hidden>
      <section class="brochure-hero" id="${project.id}">
        <figure>
          ${draft.image ? renderMediaAsset({ src: draft.image, alt: draft.imageAlt, kicker: "Project Image", title: draft.title }, "hero") : ""}
        </figure>
        <div class="brochure-hero-copy">
          <p class="eyebrow">${project.corridor} · West Palm Beach</p>
          <h1>${brochureHeadline(project)}</h1>
          <p>${draft.intro}</p>
          <div class="hero-actions">
            <a class="button primary" href="/inquire/?project=${project.id}&interest=floorplans">Request Guidance</a>
            <a class="button ghost" href="#project-resources-${project.id}">View Resources</a>
          </div>
        </div>
      </section>

      <nav class="brochure-section-nav" aria-label="${project.name} project sections">
        <a href="#overview-${project.id}">Overview</a>
        <a href="#residences-${project.id}">Residences</a>
        <a href="#amenities-${project.id}">Amenities</a>
        <a href="#team-${project.id}">Design Team</a>
        <a href="#location-${project.id}">Location</a>
        <a href="#project-resources-${project.id}">Buyer Resources</a>
        <a href="/inquire/?project=${project.id}&interest=floorplans">Contact</a>
      </nav>

      <section class="brochure-stat-rail" aria-label="${project.name} quick facts">
        ${brochureStats.map(renderBrochureStat).join("")}
      </section>

      ${renderProjectSnapshotPanel(project.id)}

      <section class="brochure-module brochure-residences-module" id="overview-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">Residences</p>
          <h2>${residenceSectionTitle(project)}</h2>
          <p>${project.summary}</p>
          <a href="#project-resources-${project.id}">View floor plans <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-tile-grid brochure-tile-grid-three" id="residences-${project.id}">
          ${residenceTiles.map((asset, index) => renderBrochureImageTile(asset, ["Typical floor plan", "Interior gallery", "Finishes & features"][index] ?? asset.title)).join("")}
        </div>
      </section>

      <section class="brochure-module brochure-amenities-module" id="amenities-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">Amenities</p>
          <h2>The lifestyle layer.</h2>
          <p>${draft.highlights[0]?.note ?? "Indoor and outdoor amenities define how the building lives beyond the residence itself: wellness, service, gathering, privacy, and daily convenience."}</p>
          <a href="/inquire/?project=${project.id}&interest=floorplans">Request amenity details <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-tile-grid brochure-tile-grid-six">
          ${amenityTiles.map((asset) => renderBrochureImageTile(asset, asset.title)).join("")}
        </div>
      </section>

      <section class="brochure-module brochure-team-module" id="team-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">Design & Development</p>
          <h2>The team behind the address.</h2>
          <p>${draft.team[0]?.note ?? "Development and design credits help buyers understand the architectural point of view, operational standard, and long-term ownership confidence behind each residence."}</p>
          <a href="#project-resources-${project.id}">View the team <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-team-grid">
          ${teamTiles.map(renderBrochureTeamTile).join("")}
        </div>
      </section>

      <section class="brochure-module brochure-location-module" id="location-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">The Neighborhood</p>
          <h2>${locationSectionTitle(project)}</h2>
          <p>${draft.locationCopy}</p>
          <a href="./#top">Explore the map <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-location-panel">
          <img src="/maps/wpb-atlas-map-editorial.svg" alt="West Palm Beach project location map" loading="lazy" />
          <ol>
            ${locationList(project).map((item) => `<li><span>${item.label}</span><strong>${item.time}</strong></li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="brochure-research-contact" id="project-resources-${project.id}">
        <div class="brochure-research-panel">
          <p class="eyebrow">Buyer Resources</p>
          <h2>Compare residences, floorplans, and next steps.</h2>
          <p>Access available floorplans, project details, and advisor guidance before you tour or reserve.</p>
          <div class="brochure-download-list">
            ${draft.documents.map(renderProjectDocument).join("")}
            ${floorplanProject?.plans.slice(0, 4).map((plan) => renderGeneratedFloorplanLink(plan)).join("") ?? ""}
          </div>
          <a href="/floorplans/#floorplans-${floorplanProject?.projectId ?? project.id}">View floorplan library <span aria-hidden="true">→</span></a>
        </div>
        <form class="brochure-inquiry-card" action="mailto:${advisorProfile.email}" method="post" enctype="text/plain">
          <p class="eyebrow">Inquire</p>
          <h2>Let's connect</h2>
          <p>Request the latest availability, pricing guidance, and project context for your shortlist.</p>
          <input name="name" type="text" placeholder="Full name" />
          <input name="email" type="email" placeholder="Email address" />
          <input name="phone" type="tel" placeholder="Phone number" />
          <textarea name="message" placeholder="How can we help?">${project.name} inquiry</textarea>
          <button type="submit">Submit inquiry</button>
        </form>
      </section>

      <section class="section draft-needed-section">
        <div class="section-heading">
          <p class="eyebrow">Advisor Review</p>
          <h2>Details to confirm before touring or reserving.</h2>
        </div>
        <div class="needed-grid">
          ${draft.needed.map(renderNeededItem).join("")}
        </div>
      </section>
    </div>
  `;
}

function projectDraftFromFeatured(project: FeaturedProject): ProjectPageDraft {
  const sourceFact = sourceFactForProject(project.id);
  const source = sourceFact?.facts;
  const address = source?.address || project.address;
  const status = source?.status || project.status;
  const stories = source?.stories || "Verify";
  const residences = conciseResidences(project.id, source?.residences ?? "") || project.residences;
  const delivery = conciseDelivery(source?.completion ?? "") || project.delivery;
  const pricing = concisePricing(source?.pricing ?? "") || project.price;
  const factFields = [
    { label: "Address", value: address },
    { label: "Stories", value: stories },
    { label: "Residences", value: residences, note: source?.residences },
    { label: "Delivery", value: delivery, note: source?.completion },
    { label: "Status", value: status },
    { label: "Pricing", value: pricing, note: source?.pricing },
    { label: "Views", value: projectViewSummary(project) },
    { label: "Corridor", value: project.corridor },
  ].filter((fact) => fact.value);
  const teamCredits = teamCreditsFromSource(source?.team);
  return {
    kicker: project.corridor,
    title: project.name,
    intro: `${project.summary} This profile is refreshed from current official, developer, and reporting sources where available.`,
    image: project.image,
    imageAlt: `${project.name} project image`,
    stage: status,
    locationCopy: `${project.name} is tracked at ${address} in the ${project.corridor} corridor. Compare it by delivery timing, price guidance, view exposure, floorplan depth, and the current sales packet before touring.`,
    facts: factFields,
    team: teamCredits.length ? teamCredits : [
      { role: "Development", name: "Project team", note: "Current development and design credits should be verified with the project packet." },
      { role: "Advisory", name: advisorProfile.group, note: "Buyer guidance is tailored around timing, preferred view, floorplan, and contract priorities." },
    ],
    highlights: [
      { label: "Buyer Fit", value: project.corridor, note: project.summary },
      { label: "Status", value: status, note: delivery },
      { label: "Pricing", value: pricing, note: "Request current availability, incentives, carrying costs, and contract terms before relying on any public figure." },
      { label: "Views", value: projectViewSummary(project), note: "Confirm exact stack, floor, exposure, and future view-corridor risk." },
    ],
    gallery: project.image
      ? [
          { src: project.image, kicker: "Project Image", title: project.name, alt: `${project.name} project image` },
          { src: project.image, kicker: "Residence", title: "Project preview", alt: `${project.name} project preview` },
          { src: project.image, kicker: "Design", title: "Material context", alt: `${project.name} design context` },
        ]
      : [],
    documents: documentsFromSource(project, sourceFact),
    needed: neededFromSource(sourceFact),
  };
}

function teamCreditsFromSource(team: string | undefined): TeamCredit[] {
  const names = (team ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
  const roles = ["Developer", "Development Partner", "Architect", "Interior / Design", "Landscape / Construction", "Sales / Marketing"];
  return names.map((name, index) => ({
    role: roles[index] ?? "Project Team",
    name,
    note: "Source-catalog team credit; verify final role and scope with current project materials.",
  }));
}

function documentsFromSource(_project: FeaturedProject, sourceFact: ReturnType<typeof sourceFactForProject> | undefined): ProjectDocument[] {
  const docs: ProjectDocument[] = [];
  if (sourceFact?.officialWebsite) {
    docs.push({
      label: "Official",
      title: "Official Project Site",
      note: "Primary public source for current project positioning.",
      href: sourceFact.officialWebsite,
    });
  }
  for (const href of (sourceFact?.highValueSources ?? []).slice(0, 3)) {
    if (!href || docs.some((document) => document.href === href)) continue;
    docs.push({
      label: "Source",
      title: sourceTitleForUrl(href),
      note: "Reviewed source for project facts, floorplans, pricing, or status.",
      href,
    });
  }
  docs.push({ label: "Packet", title: "Request current packet", note: "Floorplans, pricing, availability, fees, and contract guidance" });
  return docs;
}

function sourceTitleForUrl(href: string) {
  try {
    const url = new URL(href);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Source material";
  }
}

function neededFromSource(sourceFact: ReturnType<typeof sourceFactForProject> | undefined) {
  const conflicts = sourceFact?.conflicts?.map((item) => `Resolve source conflict: ${item}`) ?? [];
  const gaps = sourceFact?.gaps ?? [];
  return [
    ...conflicts,
    ...gaps,
    "Current pricing, availability, fees, and incentives",
    "Preferred residence lines, floorplans, and view stacks",
    "Tour timing, deposit schedule, and reservation process",
  ].filter(Boolean).slice(0, 8);
}

function brochureHeadline(project: FeaturedProject) {
  if (project.corridorKey === "downtown") return "Refined living in the heart of everything";
  if (project.corridorKey === "south-flagler") return "Waterfront living along South Flagler";
  return "New waterfront living on North Flagler";
}

function projectBrochureStats(project: FeaturedProject, draft: ProjectPageDraft, floorplanCount: number) {
  const stories = draft.facts.find((fact) => /stor/i.test(fact.label))?.value ?? "Verify";
  const residences = draft.facts.find((fact) => /residence/i.test(fact.label))?.value ?? project.residences;
  const delivery = draft.facts.find((fact) => /delivery/i.test(fact.label))?.value ?? project.delivery;
  const pricing = draft.facts.find((fact) => /pricing/i.test(fact.label))?.value ?? project.price;
  const bedrooms = draft.facts.find((fact) => /bed/i.test(fact.label))?.value ?? "1-4";
  const sqFt = draft.facts.find((fact) => /sq|size|foot/i.test(fact.label))?.value ?? "Request";
  return [
    { label: "Stories", value: stories },
    { label: "Residences", value: residences },
    { label: "Bedrooms", value: bedrooms },
    { label: "Sq Ft", value: sqFt },
    { label: "Pricing", value: pricing },
    { label: "Est. Completion", value: delivery },
    { label: "Floorplans", value: floorplanCount ? `${floorplanCount} plans` : "On request" },
  ];
}

function renderBrochureStat(stat: { label: string; value: string }) {
  return `
    <article>
      <span>${stat.label}</span>
      <strong>${stat.value}</strong>
    </article>
  `;
}

function projectBrochureGallery(project: FeaturedProject, draft: ProjectPageDraft) {
  const assets = [...draft.gallery];
  if (draft.image && !assets.some((asset) => asset.src === draft.image)) {
    assets.unshift({ src: draft.image, kicker: "Project Image", title: draft.title, alt: draft.imageAlt });
  }
  while (assets.length < 3 && project.image) {
    assets.push({ src: project.image, kicker: "Project Image", title: project.name, alt: `${project.name} project image` });
  }
  return assets;
}

function projectBrochureAmenityTiles(project: FeaturedProject, draft: ProjectPageDraft) {
  const gallery = projectBrochureGallery(project, draft);
  const labels = ["Rooftop pool & sun deck", "Wellness studio", "Resident lounge", "Private dining", "Landscaped courtyard", "Concierge services"];
  return labels.map((label, index) => ({
    ...(gallery[index % Math.max(gallery.length, 1)] ?? {
      src: project.image ?? siteMeta.defaultImage,
      kicker: "Amenity",
      title: label,
      alt: `${project.name} amenity placeholder`,
    }),
    title: label,
    kicker: "Amenity",
  }));
}

function projectBrochureTeamTiles(project: FeaturedProject, draft: ProjectPageDraft) {
  const gallery = projectBrochureGallery(project, draft);
  return draft.team.slice(0, 3).map((credit, index) => ({
    credit,
    asset: gallery[index % Math.max(gallery.length, 1)],
  }));
}

function renderBrochureTeamTile(item: { credit: TeamCredit; asset?: MediaAsset }) {
  return `
    <article class="brochure-team-tile">
      ${item.asset ? renderMediaAsset(item.asset, "feature") : ""}
      <div>
        <span>${item.credit.role}</span>
        <strong>${item.credit.name}</strong>
        <p>${item.credit.note}</p>
      </div>
    </article>
  `;
}

function renderBrochureImageTile(asset: MediaAsset, label: string) {
  return `
    <article class="brochure-image-tile">
      ${renderMediaAsset(asset, "feature")}
      <span>${label}</span>
    </article>
  `;
}

function residenceSectionTitle(project: FeaturedProject) {
  if (project.corridorKey === "downtown") return "Thoughtfully designed for modern city living.";
  if (project.corridorKey === "south-flagler") return "Private residences composed around waterfront calm.";
  return "Thoughtfully designed for modern waterfront living.";
}

function locationSectionTitle(project: FeaturedProject) {
  if (project.corridorKey === "downtown") return "In the center of West Palm Beach.";
  if (project.corridorKey === "south-flagler") return "A quieter waterfront address south of downtown.";
  return "On the North Flagler waterfront spine.";
}

function locationList(project: FeaturedProject) {
  const downtownList = [
    { label: "Waterfront", time: "2 min" },
    { label: "Flagler Drive", time: "3 min" },
    { label: "Brightline Station", time: "4 min" },
    { label: "CityPlace", time: "5 min" },
    { label: "Kravis Center", time: "6 min" },
    { label: "Worth Avenue", time: "8 min" },
  ];
  const flaglerList = [
    { label: "Intracoastal", time: "1 min" },
    { label: "Palm Beach Island", time: "4 min" },
    { label: "Downtown", time: "6 min" },
    { label: "Brightline Station", time: "8 min" },
    { label: "Norton Museum", time: "10 min" },
    { label: "PBI Airport", time: "12 min" },
  ];
  return project.corridorKey === "downtown" ? downtownList : flaglerList;
}

function renderProjectDocument(document: ProjectDocument) {
  const content = `
    <span>${document.label}</span>
    <strong>${document.title}</strong>
    <small>${document.note}</small>
  `;

  if (!document.href) {
    return `<article class="document-card is-placeholder">${content}</article>`;
  }

  return `
    <a class="document-card" href="${document.href}" target="_blank" rel="noreferrer">
      ${content}
    </a>
  `;
}

function renderProjectSnapshotPanel(projectId: string) {
  const floorplanProject = getFloorplanProject(projectId);
  const floorplanCount = floorplanProject?.count ?? 0;
  return `
    <section class="asset-status-strip" aria-label="Project snapshot">
      <article>
        <span>Project Media</span>
        <strong>Gallery available</strong>
        <small>Curated imagery, residence visuals, and location context for buyer review.</small>
      </article>
      <article>
        <span>Floorplans</span>
        <strong>${floorplanCount ? `${floorplanCount} plan records` : "Available on request"}</strong>
        <small>${floorplanCount ? `Released plans and packet references are organized for quick comparison.` : "Request the current project packet for available plans."}</small>
      </article>
      <article>
        <span>Advisor</span>
        <strong>${advisorProfile.name}</strong>
        <small>${advisorProfile.group} · ${advisorProfile.mobile}</small>
      </article>
    </section>
  `;
}

function getFloorplanProject(projectId: string) {
  const lookupId = projectId === "south-flagler-house" ? "south-flagler-house-north" : projectId;
  return floorplanLibrary.find((project) => project.projectId === lookupId);
}

function renderNeededItem(item: string, index: number) {
  return `
    <article>
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${item}</strong>
    </article>
  `;
}

function renderFloorplanLink(plan: { label: string; file: string; note?: string }, basePath = docsBase) {
  return `
    <a class="floorplan-link" href="${basePath}floorplans/${plan.file}" target="_blank" rel="noreferrer">
      <span>${plan.label}</span>
      <small>${plan.note ?? "Floorplan PDF"}</small>
    </a>
  `;
}

function initProjectBrowser() {
  const grid = document.querySelector<HTMLElement>("[data-project-grid]");
  const sortSelect = document.querySelector<HTMLSelectElement>("[data-project-sort]");
  const filterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-project-filter]"));
  const railButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-project-scroll]"));
  const visibleCount = document.querySelector<HTMLElement>("[data-visible-count]");
  const coordinateDrawer = document.querySelector<HTMLElement>("[data-coordinate-drawer]");
  const filterSummary = document.querySelector<HTMLElement>("[data-filter-summary]");
  const mapPanel = document.querySelector<HTMLElement>(".landing-map-panel");

  if (!grid || !sortSelect) {
    return;
  }

  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-project-card]"));
  const pins = Array.from(document.querySelectorAll<HTMLElement>("[data-map-pin]"));
  let activeFilter = "all";

  const applyProjectState = () => {
    const sortedCards = [...cards].sort((a, b) => compareProjectCards(a, b, sortSelect.value));
    sortedCards.forEach((card) => grid.append(card));

    let visibleProjects = 0;
    mapPanel?.setAttribute("data-active-filter", activeFilter);

    cards.forEach((card) => {
      const matches = projectMatchesFilter(card, activeFilter);
      card.hidden = !matches;
      if (matches) {
        visibleProjects += 1;
      }
    });

    pins.forEach((pin) => {
      const matches = projectMatchesFilter(pin, activeFilter);
      pin.hidden = !matches;
      pin.classList.toggle("is-muted", activeFilter !== "all" && !matches);
    });

    if (visibleCount) {
      visibleCount.textContent = `${visibleProjects} project${visibleProjects === 1 ? "" : "s"} visible`;
    }

    if (coordinateDrawer) {
      coordinateDrawer.innerHTML = renderCorridorSummary(activeFilter);
    }

    if (filterSummary) {
      filterSummary.textContent = filterSummaryText(activeFilter, visibleProjects);
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.projectFilter ?? "all";
      filterButtons.forEach((item) => {
        const isActive = item.dataset.projectFilter === activeFilter;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      applyProjectState();
    });
  });

  sortSelect.addEventListener("change", applyProjectState);
  railButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.projectScroll === "prev" ? -1 : 1;
      grid.scrollBy({ left: direction * grid.clientWidth * 0.82, behavior: "smooth" });
    });
  });
  applyProjectState();
}

function compareProjectCards(a: HTMLElement, b: HTMLElement, sortValue: string) {
  if (sortValue === "az") {
    return String(a.dataset.projectName ?? "").localeCompare(String(b.dataset.projectName ?? ""));
  }

  if (sortValue === "delivery") {
    return getNumericDataset(a, "delivery") - getNumericDataset(b, "delivery");
  }

  if (sortValue === "residences") {
    return getNumericDataset(b, "residences") - getNumericDataset(a, "residences");
  }

  if (sortValue === "corridor") {
    return String(a.dataset.corridor ?? "").localeCompare(String(b.dataset.corridor ?? ""));
  }

  return getNumericDataset(a, "rank") - getNumericDataset(b, "rank");
}

function projectMatchesFilter(element: HTMLElement, filter: string) {
  if (filter === "all") {
    return true;
  }

  return (element.dataset.filterValues ?? "").split(" ").includes(filter);
}

function renderCorridorSummary(activeFilter: string) {
  if (activeFilter === "all") {
    return `
      <span>Atlas Summary</span>
      <div>
        ${corridorSections.map((section) => renderCorridorDrawerRow(section)).join("")}
      </div>
    `;
  }

  const visibleProjects = featuredProjects.filter((project) => projectDataMatchesFilter(project, activeFilter));
  const section = corridorSections.find((item) => item.key === activeFilter);
  const heading = `${getFilterLabel(activeFilter)} · ${visibleProjects.length} tracked project${visibleProjects.length === 1 ? "" : "s"}`;

  return `
    <span>${heading}</span>
    ${section ? `<p>${section.reviewNote}</p>` : ""}
    <div>
      ${visibleProjects
        .map(
          (project) => `
            <p>
              <strong><a href="${projectPath(project)}">${project.name}</a></strong>
              <small>${project.address} · ${project.status} · ${project.delivery}</small>
            </p>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderCorridorDrawerRow(section: CorridorSection) {
  const count = featuredProjects.filter((project) => project.corridorKey === section.key).length;
  return `
    <p>
      <strong>${section.label}</strong>
      <small>${count} mapped project${count === 1 ? "" : "s"} · ${section.reviewNote}</small>
    </p>
  `;
}

function filterSummaryText(activeFilter: string, visibleProjects: number) {
  if (activeFilter === "all") {
    return `${visibleProjects} tracked projects shown. Select a corridor to focus the atlas and project cards.`;
  }
  const section = corridorSections.find((item) => item.key === activeFilter);
  return `${visibleProjects} ${getFilterLabel(activeFilter)} project${visibleProjects === 1 ? "" : "s"} shown${section ? ` · ${section.detail}` : ""}.`;
}

function projectDataMatchesFilter(project: FeaturedProject, filter: string) {
  if (filter === "all") {
    return true;
  }

  return getProjectFilterValues(project).split(" ").includes(filter);
}

function getFilterLabel(filter: string) {
  return (
    projectFilters.find((item) => item.key === filter)?.label ??
    corridorSections.find((item) => item.key === filter)?.label ??
    filter
  );
}

function getProjectFilterValues(project: FeaturedProject) {
  return [
    "all",
    project.corridorKey,
    project.corridorKey === "north-flagler" || project.corridorKey === "south-flagler" ? "waterfront" : "",
    project.status === "Under Construction" ? "under-construction" : "",
    project.deliveryYear >= 2027 ? "delivery-2027" : "",
    project.floorplans ? "floorplans" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getResidenceSortValue(project: FeaturedProject) {
  const numeric = Number.parseInt(project.residences.replace(/\D/g, ""), 10);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getNumericDataset(element: HTMLElement, key: string) {
  return Number.parseInt(element.dataset[key] ?? "0", 10) || 0;
}

function toFilterValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
