import "./style.css";
import {
  answerEngineFaq,
  floorplanLibrary,
  projectFacts,
  researchNewsFeed,
  siteMeta,
} from "./generated/siteData";
import { editorProjectOverrides, type EditorProjectOverrides } from "./generated/editorOverrides";
import { renderEditorialImagePanel } from "./components/EditorialImagePanel";
import { publishedExternalNews, type ExternalNewsItem } from "./data/approvedExternalNews";
import { editorialImageForId, type EditorialImageId } from "./data/editorialImagery";
import { homeHeroImages } from "./data/homeHeroImages";
import homepageOverridesRaw from "../content/overrides/homepage-overrides.json";
import homepageCardOverridesRaw from "../content/overrides/homepage-card-overrides.json";
import approvedImportedProjectImagesRaw from "./data/approvedImportedProjectImages.json";
import { marketNotes, type MarketNote } from "./data/marketNotes";
import { track } from "./lib/analytics";
import { advisorProfile } from "./lib/contact";
import { escapeHtml, safeHref } from "./renderUtils";

type MediaAsset = {
  src: string;
  mobileSrc?: string;
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
  heroImage?: string;
  mobileImage?: string;
  galleryImages?: MediaAsset[];
  summary: string;
  floorplans: boolean;
  pageState: string;
  rank: number;
  longitude: number;
  latitude: number;
  address: string;
  projectPageType?: ProjectPageType;
  logoImage?: string;
  logoAlt?: string;
  editorialIntro?: string;
  missingInfo?: string[];
};

type ProjectPageType = "complete-profile" | "advisory-brief" | "planning-watch" | "source-watch" | "market-marker";

type Route =
  | { type: "home"; projectId?: undefined }
  | { type: "buildings"; projectId?: undefined }
  | { type: "map"; projectId?: undefined }
  | { type: "compare"; projectId?: undefined }
  | { type: "corridor"; corridorKey: CorridorKey; projectId?: undefined }
  | { type: "news"; projectId?: undefined }
  | { type: "news-detail"; articleId: string; projectId?: undefined }
  | { type: "market-notes"; projectId?: undefined }
  | { type: "market-note-detail"; articleSlug: string; projectId?: undefined }
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
  description: string;
};

type ResearchNewsItem = {
  id: string;
  title: string;
  summary: string;
  rewrittenSummary?: string;
  category: string;
  datePublished: string;
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

type ContentImageContext = {
  image?: {
    path?: string;
    credit?: string;
  };
  imageId?: string;
  projectIds?: readonly string[];
  primaryProjectId?: string;
  relatedProjectIds?: readonly string[];
  relatedCorridorIds?: readonly string[];
  resolvedLocalImageId?: string;
  canonicalUrl?: string;
  category?: string;
  title?: string;
};

type ResolvedContentImage = {
  src: string;
  alt: string;
  credit: string;
  caption: string;
  relatedProject?: FeaturedProject;
  source: "explicit" | "project" | "imported" | "editorial" | "generic";
};

type ImportedProjectImage = {
  id: string;
  projectId: string;
  sourcePageUrl: string;
  sourceImageUrl: string;
  localPath: string;
  capturedAt: string;
  imageType: "interior" | "amenity" | "exterior" | "rendering" | "floorplan" | "logo" | "unknown";
  status: "candidate" | "placed" | "rejected" | "archived";
  width?: number;
  height?: number;
  caption: string;
  alt: string;
  placement?: "hero" | "card" | "gallery" | "interior" | "amenity" | "update" | "article";
  credit?: string;
  notes?: string;
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
  importLibrary?: (libraryName: "marker") => Promise<{
    AdvancedMarkerElement?: new (options: Record<string, unknown>) => {
      map: unknown | null;
      addListener?: (eventName: string, handler: () => void) => void;
      addEventListener?: (eventName: string, handler: () => void) => void;
    };
  }>;
  marker?: {
    AdvancedMarkerElement?: new (options: Record<string, unknown>) => {
      map: unknown | null;
      addListener?: (eventName: string, handler: () => void) => void;
      addEventListener?: (eventName: string, handler: () => void) => void;
    };
  };
  SymbolPath: {
    CIRCLE: unknown;
  };
};

type GoogleAdvancedMarkerConstructor = NonNullable<NonNullable<GoogleMapsNamespace["marker"]>["AdvancedMarkerElement"]>;

type GoogleMarkerHandle = {
  clear: () => void;
};

type WindowWithGoogleMaps = Window & {
  google?: {
    maps?: GoogleMapsNamespace;
  };
  __wpbGoogleMapsReady?: () => void;
  gm_authFailure?: () => void;
};

type ProjectDraftEditorOverride = NonNullable<EditorProjectOverrides[string]["draft"]>;
type HomepageOverride = {
  sectionId?: string;
  imagePath?: string;
  caption?: string;
  alt?: string;
  headline?: string;
  subhead?: string;
  status?: string;
  imagePosition?: string;
  focalPoint?: {
    x?: number;
    y?: number;
  };
  objectFit?: string;
};

const homepageOverrides = homepageOverridesRaw as { sections?: Record<string, HomepageOverride> };
type HomepageCardOverride = HomepageOverride & {
  deck?: string;
  ctaLabel?: string;
};
const homepageCardOverrides = homepageCardOverridesRaw as { sections?: Record<string, { cards?: Record<string, HomepageCardOverride> }> };
const fullBrookeCtaCopy =
  "For guidance on West Palm Beach new construction - including how these buildings compare, which residences stand out, and what may fit your goals best - contact Brooke Snader with the Scott Gordon Group at Douglas Elliman Palm Beach.";
const shortBrookeCtaCopy =
  "Need help comparing West Palm Beach new construction? Contact Brooke Snader with the Scott Gordon Group at Douglas Elliman Palm Beach.";

function homepageOverride(sectionId: string) {
  return homepageOverrides.sections?.[sectionId];
}

function approvedHomepageOverride(sectionId: string) {
  const override = homepageOverride(sectionId);
  return override?.status === "approved" ? override : undefined;
}

function approvedHomepageCardOverride(sectionId: string, cardId: string) {
  const override = homepageCardOverrides.sections?.[sectionId]?.cards?.[cardId];
  return override?.status === "approved" ? override : undefined;
}

function renderHomepageOverrideImage(override: HomepageCardOverride, fallbackTitle: string, className = "") {
  const caption = override.caption ? `<figcaption>${escapeHtml(override.caption)}</figcaption>` : "";
  const style = imageStyle(override);
  return `
    <figure class="${className}">
      <img src="${safeHref(override.imagePath || "")}" alt="${escapeHtml(override.alt || fallbackTitle)}" loading="lazy" decoding="async"${style} />
      ${caption}
    </figure>
  `;
}

function imageStyle(override?: HomepageCardOverride) {
  const position = override?.imagePosition || (override?.focalPoint ? `${override.focalPoint.x ?? 50}% ${override.focalPoint.y ?? 50}%` : "");
  const fit = override?.objectFit && ["cover", "contain"].includes(override.objectFit) ? override.objectFit : "";
  const declarations = [
    position ? `object-position: ${position}` : "",
    fit ? `object-fit: ${fit}` : "",
  ].filter(Boolean);
  return declarations.length ? ` style="${escapeHtml(declarations.join("; "))}"` : "";
}

const activeHomeHeroImages = (() => {
  const cardOverride = approvedHomepageCardOverride("hero", "hero");
  const override = cardOverride ?? approvedHomepageOverride("hero");
  if (!override?.imagePath) return homeHeroImages;
  return [
    {
      src: override.imagePath,
      alt: override.alt || homeHeroImages[0].alt,
      caption: override.caption || homeHeroImages[0].caption,
      imagePosition: override.imagePosition || (override.focalPoint ? `${override.focalPoint.x ?? 50}% ${override.focalPoint.y ?? 50}%` : undefined),
    },
    ...homeHeroImages.filter((image) => image.src !== override.imagePath),
  ];
})();
const approvedHeroCardOverride = approvedHomepageCardOverride("hero", "hero");

const mediaBase = "/projects/olara/media/";
const docsBase = "/projects/olara/docs/";
const ritzMediaBase = "/projects/ritz-carlton-wpb/media/";
const ritzDocsBase = "/projects/ritz-carlton-wpb/docs/";
const noraHouseUserHero = "/projects/nora-house/media/user-provided-nora-house-hero.jpg";
const noraHouseUserCard = "/projects/nora-house/media/user-provided-nora-house-card.jpg";
const southFlaglerHouseUserHero = "/projects/south-flagler-house/media/user-provided-south-flagler-house-hero.jpg";
const southFlaglerHouseUserCard = "/projects/south-flagler-house/media/user-provided-south-flagler-house-card.jpg";
const shorecrestUserHero = "/projects/shorecrest/media/user-provided-shorecrest-hero.jpg";
const shorecrestUserCard = "/projects/shorecrest/media/user-provided-shorecrest-card.jpg";
const banyanTreeUserCard = "/projects/banyan-tree/media/user-provided-banyan-tree-card.jpg";
const rosewoodRenderHero = "/projects/rosewood/media/user-provided-rosewood-render-01.jpg";
const rosewoodRenderVertical = "/projects/rosewood/media/user-provided-rosewood-render-02.jpg";
const cityPlace10Hero = "/projects/10-cityplace/media/10-cityplace-hero-1536x1024.jpg";
const cityPlace10Card = "/projects/10-cityplace/media/10-cityplace-card-1448x1086.jpg";
const cityPlace10MobileHero = "/projects/10-cityplace/media/10-cityplace-mobile-1122x1402.jpg";
const cityPlace10Entrance = "/projects/10-cityplace/media/10-cityplace-entrance-1536x1024.jpg";
const cityPlace10SharedHero = "/projects/10-cityplace/media/cityplace-shared-hero-1536x1024.jpg";
const cityPlace10SharedCard = "/projects/10-cityplace/media/cityplace-shared-card-1448x1086.jpg";
const cityPlace10SharedMobile = "/projects/10-cityplace/media/cityplace-shared-mobile-1122x1402.jpg";
const cityPlace15Hero = "/projects/15-cityplace/media/15-cityplace-hero-1536x1024.jpg";
const cityPlace15Card = "/projects/15-cityplace/media/15-cityplace-card-1448x1086.jpg";
const cityPlace15MobileHero = "/projects/15-cityplace/media/15-cityplace-mobile-1122x1402.jpg";
const cityPlace15SharedHero = "/projects/15-cityplace/media/cityplace-shared-hero-1536x1024.jpg";
const cityPlace15SharedCard = "/projects/15-cityplace/media/cityplace-shared-card-1448x1086.jpg";
const cityPlace15SharedMobile = "/projects/15-cityplace/media/cityplace-shared-mobile-1122x1402.jpg";
const laClaraHeroWide = "/projects/la-clara/media/la-clara-hero-3x2.jpg";
const laClaraHeroStandard = "/projects/la-clara/media/la-clara-hero-4x3.jpg";
const laClaraHeroPortrait = "/projects/la-clara/media/la-clara-hero-4x5.jpg";
const relatedRossLogo = "/team-logos/related-ross-logo.webp";
const arquitectonicaLogo = "/team-logos/arquitectonica-logo.webp";
const projectLogoImages: Record<string, { src: string; alt: string }> = {
  "alba-palm-beach": { src: "/projects/alba-palm-beach/media/logo.svg", alt: "Alba Palm Beach logo" },
  "banyan-tree": { src: "/projects/banyan-tree/media/logo.png", alt: "Banyan Tree Residences West Palm Beach logo" },
  "forte-on-flagler": { src: "/projects/forte-on-flagler/media/logo.png", alt: "Forte on Flagler logo" },
  "mr-c": { src: "/projects/mr-c/media/logo.svg", alt: "Mr. C Hotel and Residences West Palm Beach logo" },
  olara: { src: "/projects/olara/media/logo.svg", alt: "Olara logo" },
  "ritz-carlton-wpb": { src: "/projects/ritz-carlton-wpb/media/ritz-logo.svg", alt: "The Ritz-Carlton Residences West Palm Beach logo" },
  shorecrest: { src: "/projects/shorecrest/media/logo.svg", alt: "Shorecrest logo" },
  "south-flagler-house": { src: "/projects/south-flagler-house/media/logo.svg", alt: "South Flagler House logo" },
};
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;
const heroMapScriptId = "wpb-google-map-script";
const heroMapCallbackName = "__wpbGoogleMapsReady";
const mapFallbackTitle = "Map temporarily unavailable";
const mapFallbackBody =
  "The project map could not load. You can still compare buildings by corridor below, or contact Brooke for current project guidance.";
const buyerFriendlyMapFallback = `${mapFallbackTitle}. ${mapFallbackBody}`;
const HERO_ROTATION_INTERVAL_MS = 16000;
const HERO_FADE_DURATION_MS = 1800;
let googleMapsLoader: Promise<GoogleMapsNamespace> | null = null;
let googleAdvancedMarkerLoader: Promise<GoogleAdvancedMarkerConstructor | undefined> | null = null;

const staticRoutePaths: Record<string, string> = {
  "/buildings": "buildings",
  "/buildings/": "buildings",
  "/map": "map",
  "/map/": "map",
  "/compare": "compare",
  "/compare/": "compare",
  "/floorplans/": "floorplans",
  "/floor-plans": "floorplans",
  "/answers/": "answers",
  "/updates": "news",
  "/updates/": "news",
  "/market-notes/": "market-notes",
  "/blog/": "market-notes",
  "/guidance/": "market-notes",
  "/contact": "inquire",
  "/contact/": "inquire",
  "/floor-plans/": "floorplans",
  "/methodology/": "methodology",
  "/fair-housing/": "fair-housing",
  "/privacy/": "privacy",
  "/terms/": "terms",
  "/inquire/": "inquire",
};

const productionOrigin = "https://www.wpbnewconstruction.com";

const corridorRoutePaths: Record<string, CorridorKey> = {
  "/corridors/north-flagler/": "north-flagler",
  "/corridors/downtown/": "downtown",
  "/corridors/south-flagler/": "south-flagler",
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
    image: `${mediaBase}olara-hero-exterior-1536x1024.jpg`,
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
    price: "From about $3M",
    href: "?project=ritz-carlton-wpb",
    image: `${ritzMediaBase}ritz-hero-waterfront-building-2200x1375.jpg`,
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
    id: "rosewood",
    name: "Rosewood Residences WPB",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Planning / Pending Approvals",
    delivery: "Timing not released",
    deliveryYear: 2029,
    residences: "90 proposed",
    price: "Not released",
    href: "?project=rosewood",
    summary:
      "A proposed Rosewood-branded waterfront tower by Related Group and BH Group at 2001 North Flagler, tracked as early intelligence while approvals, pricing, floorplans, and launch timing remain pending.",
    image: rosewoodRenderHero,
    heroImage: rosewoodRenderHero,
    mobileImage: rosewoodRenderVertical,
    galleryImages: [
      {
        src: rosewoodRenderHero,
        mobileSrc: rosewoodRenderVertical,
        kicker: "Project Rendering",
        title: "Rosewood Residences West Palm Beach",
        alt: "Rendering of Rosewood Residences in West Palm Beach.",
      },
      {
        src: rosewoodRenderVertical,
        kicker: "Project Rendering",
        title: "Rosewood Residences evening tower",
        alt: "Vertical evening rendering of Rosewood Residences in West Palm Beach.",
      },
    ],
    floorplans: false,
    pageState: "Planning watch",
    rank: 3.5,
    longitude: -80.05005,
    latitude: 26.73135,
    address: "2001 N Flagler Dr",
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
    image: laClaraHeroStandard,
    heroImage: laClaraHeroWide,
    mobileImage: laClaraHeroPortrait,
    galleryImages: [
      {
        src: laClaraHeroStandard,
        kicker: "Waterfront",
        title: "Intracoastal Arrival",
        alt: "La Clara waterfront tower rendering from the Intracoastal",
      },
      {
        src: laClaraHeroPortrait,
        kicker: "Evening",
        title: "South Flagler Tower",
        alt: "La Clara tower evening rendering with water reflection",
      },
    ],
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
    image: "/assets/editorial/south-flagler-corridor.jpg",
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
    image: cityPlace15Card,
    heroImage: cityPlace15Hero,
    mobileImage: cityPlace15MobileHero,
    galleryImages: [
      {
        src: cityPlace15SharedHero,
        mobileSrc: cityPlace15SharedMobile,
        kicker: "CityPlace Context",
        title: "10 and 15 CityPlace skyline",
        alt: "10 and 15 CityPlace in the West Palm Beach skyline",
      },
      {
        src: cityPlace15SharedCard,
        kicker: "Downtown Setting",
        title: "CityPlace office district",
        alt: "10 and 15 CityPlace downtown context",
      },
    ],
    summary: "Downtown office tower tracked as a demand catalyst for nearby condo inventory, restaurants, and walkable buyer lifestyle.",
    floorplans: false,
    pageState: "Market context",
    rank: 17,
    longitude: -80.0562,
    latitude: 26.7091,
    address: "15 CityPlace",
  },
  {
    id: "10-cityplace",
    name: "10 CityPlace",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Under Construction",
    delivery: "Expected 2027",
    deliveryYear: 2027,
    residences: "Office tower",
    price: "Not condo inventory",
    href: "?project=10-cityplace",
    image: cityPlace10Card,
    heroImage: cityPlace10Hero,
    mobileImage: cityPlace10MobileHero,
    galleryImages: [
      {
        src: cityPlace10Entrance,
        kicker: "Street Arrival",
        title: "10 CityPlace entrance view",
        alt: "10 CityPlace entrance and street-level arrival",
      },
      {
        src: cityPlace10SharedHero,
        mobileSrc: cityPlace10SharedMobile,
        kicker: "CityPlace Context",
        title: "10 and 15 CityPlace skyline",
        alt: "10 and 15 CityPlace in the West Palm Beach skyline",
      },
      {
        src: cityPlace10SharedCard,
        kicker: "Downtown Setting",
        title: "CityPlace office district",
        alt: "10 and 15 CityPlace downtown context",
      },
    ],
    summary: "Downtown Related Ross office tower tracked as a CityPlace catalyst, shaping the restaurant, retail, and walkable-lifestyle context buyers weigh around nearby condominium inventory.",
    floorplans: false,
    pageState: "Market context",
    rank: 18,
    longitude: -80.0571,
    latitude: 26.7092,
    address: "10 CityPlace",
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
    rank: 19,
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
    summary: "Large Northwood/Rybovich marina redevelopment project to monitor with potential to reshape the northern waterfront inventory map.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 20,
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
    summary: "South Flagler assemblage project to monitor for buyers monitoring whether another ultra-luxury waterfront project emerges south of downtown.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 21,
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
    summary: "Condo buyout and yacht-club corridor project to monitor that could affect future South Flagler waterfront redevelopment supply.",
    floorplans: false,
    pageState: "Pipeline watch",
    rank: 22,
    longitude: -80.0509,
    latitude: 26.6794,
    address: "3701-3800 Washington Rd area",
  },
];

const projectFactById = new Map(projectFacts.map((project) => [project.projectId, project]));
const featuredProjects = enhanceProjectIdentity(applyEditorProjectOverrides(applySourceFactsToProjects(baseFeaturedProjects), editorProjectOverrides));
const rankedFeaturedProjects = [...featuredProjects].sort((a, b) => a.rank - b.rank);
const importedProjectImages = approvedImportedProjectImagesRaw as ImportedProjectImage[];

function enhanceProjectIdentity(projects: FeaturedProject[]): FeaturedProject[] {
  return projects.map((project) => {
    const logo = projectLogoImages[project.id];
    return {
      ...project,
      projectPageType: project.projectPageType ?? pageTypeForProject(project),
      logoImage: project.logoImage ?? logo?.src,
      logoAlt: project.logoAlt ?? logo?.alt,
      editorialIntro: project.editorialIntro ?? editorialIntroForProject(project),
      missingInfo: project.missingInfo ?? missingInfoForProject(project),
    };
  });
}

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
  if (/low \$2M/i.test(value)) return "From the low $2Ms";
  if (/\$2M to over \$10M/i.test(value)) return "From $2M to $10M+";
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

const newsFilters: ProjectFilter[] = [
  { key: "all", label: "All" },
  { key: "development", label: "Development" },
  { key: "construction", label: "Construction" },
  { key: "planning", label: "Planning" },
  { key: "sales", label: "Sales" },
  { key: "north-flagler", label: "North Flagler" },
  { key: "downtown", label: "Downtown / NORA" },
  { key: "south-flagler", label: "South Flagler" },
];

const corridorSections: CorridorSection[] = [
  {
    key: "north-flagler",
    label: "North Flagler",
    detail: "Alba, Olara, Shorecrest, Ritz-Carlton",
    reviewNote: "Waterfront comparison corridor with the deepest active plan and image inventory.",
    description:
      "North Flagler is the densest new-construction comparison set in West Palm Beach. Buyers here are usually weighing direct Intracoastal exposure, large amenity programs, branded service, construction timing, and how each tower handles views toward Palm Beach.",
  },
  {
    key: "downtown",
    label: "Downtown",
    detail: "NORA House, Mr. C",
    reviewNote: "Urban lifestyle corridor where hotel-branded and district projects need current availability checks.",
    description:
      "Downtown is the walkability play. It is less about a single waterfront view and more about restaurants, rail access, hotel-style service, and the city becoming easier to live in without driving for every errand.",
  },
  {
    key: "south-flagler",
    label: "South Flagler",
    detail: "South Flagler House",
    reviewNote: "Southern waterfront benchmark for buyers comparing scale, privacy, and Palm Beach proximity.",
    description:
      "South Flagler reads quieter and more residential. Buyers tend to compare privacy, Palm Beach proximity, larger residences, calmer waterfront rhythm, and whether a delivered building or new launch better fits the ownership plan.",
  },
];

function pageTypeForProject(project: FeaturedProject): ProjectPageType {
  const state = project.pageState.toLowerCase();
  if (state.includes("complete")) return "complete-profile";
  if (state.includes("advisory") || state.includes("resale")) return "advisory-brief";
  if (state.includes("planning")) return "planning-watch";
  if (state.includes("market")) return "market-marker";
  if (state.includes("source") || state.includes("pipeline")) return "source-watch";
  return project.floorplans ? "advisory-brief" : "source-watch";
}

function editorialIntroForProject(project: FeaturedProject) {
  const type = pageTypeForProject(project);
  if (project.id === "rosewood") {
    return "Rosewood Residences WPB is an early-stage North Flagler waterfront proposal being tracked for its potential to add another branded luxury tower to the corridor. Public details remain limited, so the useful buyer read is positioning: location, proposed scale, development team, approval progress, and how it may affect the North Flagler pipeline.";
  }
  if (project.id === "nora-house") {
    return "NORA House matters less as an immediately comparable sales option and more as a signal of where Downtown West Palm Beach is heading. Its value in the buyer map is tied to NORA's restaurant, retail, and walkability story, with final offering details still requiring confirmation.";
  }
  if (type === "planning-watch" || type === "source-watch" || type === "market-marker") {
    return `${project.name} is tracked as a ${project.corridor} ${project.pageState.toLowerCase()} item. Use it to understand future supply, location, sponsor signals, and what still needs confirmation before treating it like a current purchase option.`;
  }
  return project.summary;
}

function missingInfoForProject(project: FeaturedProject) {
  const type = pageTypeForProject(project);
  if (type === "complete-profile") {
    return ["Line-specific availability", "Current incentives", "Final fees and contract language"];
  }
  if (type === "advisory-brief") {
    return ["Current pricing", "Available lines", "Contract/deposit structure", "Latest delivery timing"];
  }
  return [
    "Current pricing",
    "Available lines",
    "Final residence count",
    "Final floor count",
    "Full amenity program",
    "Floorplans",
    "Delivery timing",
    "Official sales launch",
  ];
}

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
    src: `${mediaBase}olara-gallery-card-pool-1200x1500.jpg`,
    kicker: "Gallery Card",
    title: "Poolside Arrival",
    alt: "Olara pool deck with residents seated near the water",
  },
  {
    src: `${mediaBase}olara-arrival-valet-lobby-1600x1067.jpg`,
    kicker: "Lobby",
    title: "Valet Arrival",
    alt: "Luxury valet arrival and lobby entrance at night",
  },
  {
    src: `${mediaBase}olara-residence-terrace-sunrise-1600x1067.jpg`,
    kicker: "Residence Terrace",
    title: "Sunrise Terrace",
    alt: "Residence terrace overlooking the Intracoastal at sunrise",
  },
];

const residenceGallery: MediaAsset[] = [
  {
    src: `${mediaBase}olara-residence-living-room-moonlight-1600x1067.jpg`,
    kicker: "Residence",
    title: "Moonlit Living Room",
    alt: "Warm living room with full-height glass and moonlit water views",
  },
  {
    src: `${mediaBase}olara-residence-kitchen-evening-1600x1067.jpg`,
    kicker: "Residence",
    title: "Kitchen And Entertaining",
    alt: "Open kitchen and living room with evening water views",
  },
  {
    src: `${mediaBase}olara-residence-primary-bath-1600x1067.jpg`,
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
    src: `${mediaBase}olara-amenity-gym-1600x1067.jpg`,
    kicker: "Wellness",
    title: "Fitness Studio",
    alt: "Light-filled fitness studio with cardio equipment and water views",
  },
  {
    src: `${mediaBase}olara-amenity-rooftop-pool-reading-1600x1067.jpg`,
    kicker: "Pool Deck",
    title: "Rooftop Pool",
    alt: "Rooftop pool deck with residents reading by the water",
  },
  {
    src: `${mediaBase}olara-amenity-spa-relaxation-1600x1067.jpg`,
    kicker: "Spa",
    title: "Regeneration Spa",
    alt: "Spa relaxation room with residents in robes",
  },
  {
    src: `${mediaBase}olara-amenity-hot-cold-plunge-1600x1067.jpg`,
    kicker: "Recovery",
    title: "Hot And Cold Plunge",
    alt: "Outdoor hot and cold plunge pools overlooking the Intracoastal",
  },
  {
    src: `${mediaBase}olara-amenity-pool-veranda-refreshments-1600x1067.jpg`,
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
  { label: "Pricing", value: "From about $3M", note: "Request the current availability sheet before touring." },
  { label: "Unit Mix", value: "2-4 bedrooms + lake homes" },
  { label: "Status", value: "Under construction", note: "Groundbreaking reported February 2026; more than 70% pre-sold." },
  { label: "Private Guidance", value: "Request current packet", note: "Availability, tour strategy, and packet access are handled through buyer-side review." },
];

const ritzTeam: TeamCredit[] = [
  {
    role: "Project Sponsor",
    name: "Related Group",
    note: "Project sponsor for the branded residential tower on the North Flagler waterfront.",
  },
  {
    role: "Project Partner",
    name: "BH Group",
    note: "Project partner on the West Palm Beach Ritz-Carlton Residences.",
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
    src: `${ritzMediaBase}ritz-gallery-card-waterfront-tower-1200x1500.jpg`,
    kicker: "Gallery Card",
    title: "Waterfront Tower",
    alt: "The Ritz-Carlton Residences tower reflected on the waterfront",
  },
  {
    src: `${ritzMediaBase}ritz-arrival-porte-cochere-evening-1600x1067.jpg`,
    kicker: "Arrival",
    title: "Porte Cochere",
    alt: "Evening arrival at the Ritz-Carlton Residences porte cochere",
  },
  {
    src: `${ritzMediaBase}ritz-lobby-lounge-waterfront-1600x1067.jpg`,
    kicker: "Lobby",
    title: "Waterfront Lounge",
    alt: "Ritz-Carlton Residences lobby lounge with water views",
  },
];

const ritzResidenceGallery: MediaAsset[] = [
  {
    src: `${ritzMediaBase}ritz-residence-living-room-sunrise-1600x1067.jpg`,
    kicker: "Residence",
    title: "Sunrise Living Room",
    alt: "Ritz-Carlton residence living room with sunrise water views",
  },
  {
    src: `${ritzMediaBase}ritz-residence-kitchen-entertaining-1600x1067.jpg`,
    kicker: "Residence",
    title: "Kitchen And Entertaining",
    alt: "Ritz-Carlton residence kitchen with marble island and sunset views",
  },
  {
    src: `${ritzMediaBase}ritz-residence-primary-bath-1600x1067.jpg`,
    kicker: "Residence",
    title: "Primary Bath",
    alt: "Ritz-Carlton residence primary bathroom with marble and warm lighting",
  },
];

const ritzAmenityGallery: MediaAsset[] = [
  {
    src: `${ritzMediaBase}ritz-amenity-fitness-center-1600x1067.jpg`,
    kicker: "Wellness",
    title: "Fitness Center",
    alt: "Ritz-Carlton Residences fitness center",
  },
  {
    src: `${ritzMediaBase}ritz-amenity-pool-cabanas-1600x1067.jpg`,
    kicker: "Pool Deck",
    title: "Private Cabanas",
    alt: "Ritz-Carlton Residences pool deck with cabanas",
  },
  {
    src: `${ritzMediaBase}ritz-arrival-porte-cochere-two-cars-1600x1067.jpg`,
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
  rosewood: {
    kicker: "North Flagler Planning Watch",
    title: "Rosewood Residences West Palm Beach",
    intro:
      "Rosewood is being tracked as a proposed North Flagler branded-residence tower, not a launched sales offering. Public materials point to a 27-story, 90-residence plan at 2001 North Flagler Drive, with approval status, pricing, floorplans, builder, and delivery timing still to be verified.",
    image: rosewoodRenderHero,
    imageAlt: "Rendering of Rosewood Residences in West Palm Beach.",
    stage: "Proposed / pending approvals",
    locationCopy:
      "The proposed site sits at 2001 North Flagler Drive, immediately within the active North Flagler waterfront pipeline near Olara, Shorecrest, and The Ritz-Carlton Residences. Treat this as early planning intelligence until city approvals and official sales materials are released.",
    facts: [
      { label: "Address", value: "2001 N Flagler Dr" },
      { label: "Status", value: "Proposed / pending approvals" },
      { label: "Stories", value: "27 proposed" },
      { label: "Residences", value: "90 proposed" },
      { label: "Bedrooms", value: "Not released" },
      { label: "Sq Ft", value: "Not released" },
      { label: "Pricing", value: "Not released" },
      { label: "Delivery", value: "Not released" },
      { label: "Floorplans", value: "Not public" },
    ],
    team: [
      { role: "Developer", name: "Related Group + BH Group", note: "Reported development team for the proposal." },
      { role: "Brand", name: "Rosewood Hotels & Resorts", note: "Reported branding; operating details are not yet public." },
      { role: "Architect", name: "Arquitectonica", note: "Reported architect for the planning-stage proposal." },
      { role: "Advisor", name: advisorProfile.brokerage, note: "Use buyer-side guidance before relying on early-stage public reporting." },
    ],
    highlights: [
      { label: "Planning Signal", value: "27 stories", note: "Current public materials support a proposed 27-story tower." },
      { label: "Supply Watch", value: "90 residences", note: "The current proposal would add another boutique branded option to North Flagler." },
      { label: "Unknowns", value: "Pricing / timing", note: "No official public pricing, floorplans, completion date, or sales launch was found." },
    ],
    gallery: [
      {
        src: rosewoodRenderHero,
        mobileSrc: rosewoodRenderVertical,
        kicker: "Project Rendering",
        title: "Rosewood Residences West Palm Beach",
        alt: "Rendering of Rosewood Residences in West Palm Beach.",
      },
      {
        src: rosewoodRenderVertical,
        kicker: "Project Rendering",
        title: "Rosewood Residences evening tower",
        alt: "Vertical evening rendering of Rosewood Residences in West Palm Beach.",
      },
    ],
    documents: [
      { label: "Advisor", title: "Request Rosewood planning update", note: "Latest approval status, pricing watch, and buyer guidance" },
      { label: "Status", title: "No public sales packet yet", note: "Brochure, floorplans, and confirmed official media kit were not found." },
    ],
    needed: [
      "Planning Board outcome and any approval conditions",
      "Official project site or sales-team packet",
      "Confirmed official media kit and current sales material",
      "Floorplans, pricing, reservation process, and deposit schedule",
      "Builder / general contractor and construction timing",
    ],
  },
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
      { label: "Address", value: "1865 N Flagler Dr", note: "Some public materials also reference 1901 N Flagler." },
      { label: "Stories", value: "28" },
      { label: "Residences", value: "98-100", note: "Related Ross' 2026 groundbreaking release says 98 residences; some project materials have referenced 100." },
      { label: "Bedrooms", value: "2-3" },
      { label: "Delivery", value: "Expected 2027" },
      { label: "Pricing", value: "From $3M reported", note: "Request current availability before scheduling." },
      { label: "Profile", value: "North Flagler waterfront" },
    ],
    team: [
      { role: "Project Sponsor", name: "Related Ross", note: "Lead project sponsor." },
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
        src: "/projects/shorecrest/media/imported/shorecrest-interior-living-room-rendering.jpg",
        kicker: "Residence",
        title: "Living Room View",
        alt: "Shorecrest residence living room rendering",
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
      { label: "Floorplan", title: "Residence 704", note: "PDF reference", href: "https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0704_floorplan.pdf" },
      { label: "Floorplan", title: "Residence 303", note: "PDF reference", href: "https://www.shorecrestwpb.com/sites/default/files/2025-07/1153_0303_floorplan.pdf" },
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
      { role: "Project Sponsor", name: "Terra", note: "Lead project sponsor for the downtown hotel-residences project." },
      { role: "Brand", name: "Mr. C", note: "Hospitality and service identity." },
      { role: "Buyer Packet", name: "Current availability", note: "Request packet details through buyer-side guidance." },
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
      { label: "Fact Sheet", title: "Mr. C Fact Sheet", note: "PDF reference", href: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC_FactSheet_Aug24_digi_1.pdf" },
      { label: "Guide", title: "West Palm Beach Guide", note: "PDF reference", href: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC-WPB-Guide-body-R13-Digital-Web.pdf" },
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
      "Mandarin Oriental Residences is the long-view branded play on North Flagler: an 87-residence, 31-story waterfront launch for buyers prioritizing service, architecture, and a later delivery horizon.",
    image: "/projects/mandarin-oriental/media/mandarin-oriental-exterior-hero-source.jpg",
    imageAlt: "Mandarin Oriental Residences West Palm Beach rendering",
    stage: "Sales launched / priority interest",
    locationCopy:
      "At 5400 N Flagler Drive, Mandarin Oriental sits north of Alba and extends the North Flagler branded-residence pipeline beyond the current construction cluster. Sales are now launched, but it still reads as a future-positioning option until release depth and delivery details become more complete.",
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
      { role: "Project Sponsor", name: "Related Ross", note: "Lead project sponsor." },
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
      "buyer appointment contact and pricing rules",
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
      <a class="brand" href="/" aria-label="WPB New Construction home">
        <span class="brand-mark" aria-hidden="true">WPB</span>
        <span>
          <strong>WPB New Construction</strong>
          <small>Private Development Advisory</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/#projects" data-nav-item="projects">Buildings</a>
        <a href="/map/" data-nav-item="map">Map</a>
        <a href="/compare/" data-nav-item="compare">Compare</a>
        <a href="/updates/" data-nav-item="news">Updates</a>
        <a href="/floorplans/" data-nav-item="floorplans">Floor Plans</a>
        <a href="/market-notes/" data-nav-item="market-notes">Guidance</a>
        <a href="/inquire/" data-nav-item="inquire">Contact</a>
      </nav>
      <a class="nav-cta" href="/inquire/" data-nav-item="inquire">Request Current Availability</a>
    </header>

    <main>
      <div class="route-view route-view-home" data-route-view="home">
      <section class="home-hero" id="top">
        <figure class="home-hero-media" aria-label="Curated West Palm Beach new-construction editorial imagery">
          <img
            class="home-hero-image is-active"
            data-home-hero-layer="active"
            src="${activeHomeHeroImages[0].src}"
            alt="${escapeHtml(activeHomeHeroImages[0].alt)}"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            ${heroImagePosition(activeHomeHeroImages[0]) ? `style="object-position: ${escapeHtml(heroImagePosition(activeHomeHeroImages[0]))}"` : ""}
          />
          <img
            class="home-hero-image"
            data-home-hero-layer="next"
            alt=""
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            aria-hidden="true"
          />
          <figcaption class="home-hero-caption" data-home-hero-caption>${escapeHtml(activeHomeHeroImages[0].caption)}</figcaption>
          <ul class="sr-only">
            ${activeHomeHeroImages.map((image) => `<li>${escapeHtml(image.alt)}</li>`).join("")}
          </ul>
        </figure>
        <div class="home-hero-scrim"></div>
        <div class="home-hero-layout">
          <div class="home-hero-content">
            <p class="hero-kicker">West Palm Beach New Construction</p>
            <h1>${escapeHtml(approvedHeroCardOverride?.headline || "West Palm Beach New Construction Condos, Mapped and Compared.")}</h1>
            <p class="hero-copy">${escapeHtml(approvedHeroCardOverride?.deck || approvedHeroCardOverride?.subhead || "A buyer-focused guide to active sales, future projects, floor plans, updates, and waterfront positioning across Downtown West Palm Beach.")}</p>
            <div class="hero-actions" aria-label="Primary homepage actions">
              <a href="#projects" data-hero-cta="explore-buildings">Explore Buildings</a>
              <a href="/map/" data-hero-cta="view-map">View Map</a>
              <a href="/inquire/" data-hero-cta="request-availability">Request Current Availability <span aria-hidden="true">↗</span></a>
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
          <h2>${escapeHtml(approvedHomepageOverride("map")?.headline || `${featuredProjects.length} tracked projects across three corridors.`)}</h2>
          <p>${escapeHtml(approvedHomepageOverride("map")?.subhead || "Use the map for orientation first. The next section breaks the market into North Flagler, South Flagler, and Downtown so you can open the projects that belong to each area.")}</p>
          <div class="home-atlas-facts" aria-label="West Palm Beach atlas summary">
            <span>North Flagler waterfront cluster</span>
            <span>Downtown branded residences</span>
            <span>South Flagler privacy corridor</span>
          </div>
        </div>
        <aside class="home-hero-map-card home-atlas-map-card home-atlas-map-only" aria-label="Featured West Palm Beach project map">
          <figure class="hero-map-preview">
            <div class="hero-google-map" data-hero-google-map aria-label="Google map of West Palm Beach new-construction project locations"></div>
            <button class="hero-map-expand" type="button" data-map-expand>Show all locations</button>
            <div class="hero-map-fallback">
              ${renderProjectMapFallback()}
            </div>
          </figure>
          <div class="home-map-count" aria-label="Map project count">
            <strong>${featuredProjects.length}</strong>
            <span>tracked West Palm Beach new-construction projects</span>
          </div>
        </aside>
      </section>

      <section class="home-corridor-guide" aria-label="Choose a West Palm Beach new-construction corridor">
        <div class="section-heading corridor-heading">
          <p class="eyebrow">Choose Your Corridor</p>
        </div>
        <div class="corridor-guide-grid">
          ${corridorSections.map((section) => {
            const count = featuredProjects.filter((project) => project.corridorKey === section.key).length;
            const cardOverride = approvedHomepageCardOverride("corridors", section.key);
            return `
              <article class="corridor-guide-card">
                <a class="corridor-guide-image-link" href="${corridorPath(section.key)}" aria-label="View ${section.label} projects">
                  ${cardOverride?.imagePath ? renderHomepageOverrideImage(cardOverride, section.label, "corridor-guide-image") : renderEditorialImagePanel(corridorCardImageId(section.key), { compact: true, className: "corridor-guide-image" })}
                </a>
                <div class="corridor-guide-card-body">
                  <span>${corridorDisplayLabel(section.key)}</span>
                  <strong>${escapeHtml(cardOverride?.headline || section.label)}</strong>
                  <p>${escapeHtml(cardOverride?.deck || cardOverride?.subhead || corridorBuyerThesis(section))}</p>
                </div>
                <small>${count} tracked project${count === 1 ? "" : "s"}</small>
                <a href="${corridorPath(section.key)}">${escapeHtml(cardOverride?.ctaLabel || corridorCtaLabel(section.key))} <span aria-hidden="true">→</span></a>
              </article>
            `;
          }).join("")}
        </div>
      </section>

      <section class="home-news-section" aria-label="West Palm Beach development updates">
        <div class="section-heading">
          <p class="eyebrow">Latest Updates</p>
          <h2>${escapeHtml(approvedHomepageOverride("updates")?.headline || "New-construction signals worth watching.")}</h2>
        </div>
        <div class="home-news-grid">
          ${publishedExternalNews.slice(0, 4).map(renderHomeExternalNewsItem).join("")}
        </div>
        <a class="home-answer-archive-link" href="/updates/">More West Palm Beach Development Updates <span aria-hidden="true">→</span></a>
      </section>

      <section class="home-blog-section" aria-label="WPB New Construction market notes">
        <div class="section-heading">
          <p class="eyebrow">Guidance</p>
          <h2>${escapeHtml(approvedHomepageOverride("guidance")?.headline || "How to read the market before you tour.")}</h2>
        </div>
        <div class="home-blog-grid">
          ${marketNotes.slice(0, 3).map(renderMarketNoteCard).join("")}
        </div>
        <a class="home-answer-archive-link" href="/market-notes/">Read Guidance <span aria-hidden="true">→</span></a>
      </section>

      <span class="route-anchor" id="compare"></span>
      <section class="project-sort-shell" id="projects">
          <div class="project-sort-header">
            <div>
              <p class="eyebrow">Curated Buyer Guide</p>
              <h2>${escapeHtml(approvedHomepageOverride("featured-buildings")?.headline || "Compare the projects shaping West Palm Beach's next chapter.")}</h2>
              <p class="selected-filter-summary" data-filter-summary>${escapeHtml(approvedHomepageOverride("featured-buildings")?.subhead || "All tracked projects shown. Filter by corridor, construction status, or floorplan readiness.")}</p>
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

      <section class="home-conversion-band" aria-label="Request current West Palm Beach new-construction guidance">
        <div>
          <p class="eyebrow">Private Advisory</p>
          <h2>${escapeHtml(approvedHomepageCardOverride("cta", "bottom-cta")?.headline || "Get the current packet before you tour.")}</h2>
          <p>${escapeHtml(approvedHomepageCardOverride("cta", "bottom-cta")?.deck || approvedHomepageCardOverride("cta", "bottom-cta")?.subhead || fullBrookeCtaCopy)}</p>
        </div>
        <div class="conversion-points">
          <span>Active inventory</span>
          <span>Released floorplans</span>
          <span>Tour strategy</span>
        </div>
        <a href="/inquire/">${escapeHtml(approvedHomepageCardOverride("cta", "bottom-cta")?.ctaLabel || "Contact Brooke")} <span aria-hidden="true">↗</span></a>
      </section>
      </div>

      ${renderMapRouteView()}

      ${renderCompareRouteView()}

      ${corridorSections.map(renderCorridorRouteView).join("")}

      <div class="route-view route-view-news" data-route-view="news" hidden>
        <section class="section news-section newsroom-archive" id="news">
          <div class="newsroom-hero">
            <div>
              <p class="eyebrow">Development Newsroom</p>
              <h1>West Palm Beach New Construction Updates</h1>
              <p>Current development, construction, approvals, sales, and corridor signals translated into buyer-useful context. Start with the latest story, then filter the archive by topic or location.</p>
            </div>
            <aside class="answer-meta-panel">
              <span>Updated ${publishedExternalNews[0]?.fetchedAt ?? floorplanLibrary[0]?.updatedAt ?? "2026-05-22"}</span>
              <strong>${publishedExternalNews.length} on-site update${publishedExternalNews.length === 1 ? "" : "s"} with original sources at the bottom of each article.</strong>
              <small>Brooke can help compare what is reported, what is actually available, and what belongs on your shortlist.</small>
            </aside>
          </div>
          ${publishedExternalNews[0] ? renderFeaturedExternalNewsItem(publishedExternalNews[0]) : ""}
          <div class="newsroom-controls" aria-label="Filter West Palm Beach updates">
            <div class="filter-chips news-filter-chips" role="list" aria-label="Update filters">
              ${newsFilters.map(renderNewsFilter).join("")}
            </div>
            <label class="news-search-control">
              <span>Search updates</span>
              <input type="search" data-news-search placeholder="Search project, corridor, or topic" />
            </label>
          </div>
          <div class="news-grid" data-news-grid>
            ${publishedExternalNews.map(renderExternalNewsItem).join("")}
          </div>
          <p class="news-empty-state" data-news-empty hidden>No updates match that filter yet.</p>
          <div class="newsroom-cta-row">
            ${renderEmailSignup("updates_archive", "Get the WPB new-construction update digest", true)}
            <a class="button primary" href="/inquire/?lead_capture_context=updates_page">Request Current Availability <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </div>

      <div class="route-view route-view-news-detail" data-route-view="news-detail" hidden></div>

      <div class="route-view route-view-market-notes" data-route-view="market-notes" hidden>
        <section class="section intelligence-hero">
          <div>
            <p class="eyebrow">Guidance</p>
            <h1>Evergreen buyer guidance for West Palm Beach new construction.</h1>
            <p>Short editorial notes that translate local coverage, project milestones, and details to verify into practical buyer questions. Facts stay tied to public sources; pricing and availability still require current confirmation.</p>
          </div>
          <aside class="answer-meta-panel">
            <span>${marketNotes.length} buyer notes</span>
            <strong>Built for comparison, not brochure fog.</strong>
            <small>Each note names the buyer angle and the items Brooke should verify before you make a decision.</small>
          </aside>
        </section>
        <section class="section">
          <div class="home-blog-grid market-note-grid">
            ${marketNotes.map(renderMarketNoteCard).join("")}
          </div>
        </section>
      </div>

      <div class="route-view route-view-market-note-detail" data-route-view="market-note-detail" hidden></div>

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
          <a class="home-answer-archive-link" href="/inquire/?interest=floorplans&lead_capture_context=floorplans_page">Request Current Availability <span aria-hidden="true">↗</span></a>
        </section>
      </div>

      <div class="floorplan-viewer" data-floorplan-viewer hidden aria-hidden="true">
        <div class="floorplan-viewer-backdrop" data-floorplan-close></div>
        <section class="floorplan-viewer-dialog" role="dialog" aria-modal="true" aria-labelledby="floorplan-viewer-title">
          <button class="floorplan-viewer-close" type="button" data-floorplan-close aria-label="Close floorplan viewer">×</button>
          <div class="floorplan-viewer-header">
            <span data-floorplan-project></span>
            <h2 id="floorplan-viewer-title" data-floorplan-title>Floor plan</h2>
            <p data-floorplan-caption></p>
          </div>
          <div class="floorplan-viewer-frame" data-floorplan-frame></div>
          <div class="floorplan-viewer-actions">
            <button type="button" data-floorplan-prev>Previous</button>
            <button type="button" data-floorplan-next>Next</button>
            <a href="/inquire/?interest=floorplans&lead_capture_context=floorplan_viewer">Request full floorplan packet</a>
            <a href="/inquire/?interest=floorplans&lead_capture_context=floorplan_viewer">Ask Brooke</a>
          </div>
          <p class="floorplan-viewer-request">${shortBrookeCtaCopy}</p>
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
            <small>Last refreshed ${floorplanLibrary[0]?.updatedAt ?? researchNewsFeed[0]?.dateModified}</small>
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
              <p>These change quickly and should be confirmed through current buyer-side review before relying on them.</p>
            </article>
            <article class="profile-card">
              <span>Refresh Cadence</span>
              <strong>Public facts are refreshed before buyer guidance changes.</strong>
              <p>When project facts change, the page should show what changed, where it came from, and what still needs current confirmation.</p>
            </article>
            <article class="profile-card">
              <span>Limits</span>
              <strong>We do not verify legal, tax, lending, engineering, zoning, or investment conclusions.</strong>
              <p>Those decisions should be reviewed with the buyer's attorney, lender, architect, accountant, or other appropriate professional.</p>
            </article>
          </div>
          <div class="market-note-actions methodology-actions">
            <a href="/answers/">Read buyer answers <span aria-hidden="true">→</span></a>
            <a href="/projects/olara/">View a project example <span aria-hidden="true">→</span></a>
            <a href="/inquire/?lead_capture_context=methodology_page">Request Current Availability <span aria-hidden="true">↗</span></a>
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
              <p>${advisorProfile.brokerage}<br /><a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a></p>
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
              tax, lending, construction, zoning, investment, or offering advice.
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
              <p>Pricing, availability, fees, square footage, delivery timing, and incentives must be confirmed through current buyer-side review before reliance.</p>
            </article>
            <article class="profile-card">
              <span>Affiliation</span>
              <strong>Independent buyer advisory context.</strong>
              <p>This site provides independent buyer advisory context and does not represent any project sponsor, brand, architect, or sales team unless specifically stated.</p>
            </article>
            <article class="profile-card">
              <span>Advisor</span>
              <strong>${advisorProfile.name}</strong>
              <p>${advisorProfile.brokerage}<br />License ${advisorProfile.license}</p>
            </article>
          </div>
        </section>
      </div>

      ${featuredProjects.map(renderDraftProjectPage).join("")}

      <div class="route-view route-view-project route-view-full-project" data-route-view="project-legacy" data-project-id="olara" hidden>
      <section class="hero project-hero" id="olara">
        <picture>
          <source media="(max-width: 720px)" srcset="${mediaBase}olara-mobile-hero-exterior-900x1125.jpg" />
          <img src="${mediaBase}olara-hero-exterior-1536x1024.jpg" alt="Olara-inspired exterior on the West Palm Beach waterfront" />
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
            <a class="button ghost" href="/inquire/?project=olara&interest=availability">Ask Brooke About This Building</a>
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
          <img src="${mediaBase}olara-arrival-valet-lobby-1600x1067.jpg" alt="Olara valet and lobby arrival" />
        </figure>
      </section>

      <section class="section" id="residences">
        <div class="section-heading">
          <p class="eyebrow">Residences</p>
          <h2>Terraces, living rooms, kitchens, and baths.</h2>
        </div>
        <div class="editorial-grid residences-grid">
          <article class="feature-card wide">
            <img src="${mediaBase}olara-residence-terrace-sunrise-1600x1067.jpg" alt="Olara residence terrace sunrise view" />
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
            <img src="${mediaBase}olara-view-balcony-intracoastal-1600x1067.jpg" alt="Olara balcony chair with Intracoastal view" />
            <figcaption>Balcony view · Intracoastal foreground · ${imageProviderLabel(`${mediaBase}olara-view-balcony-intracoastal-1600x1067.jpg`)}</figcaption>
          </figure>
          <figure>
            <img src="${mediaBase}olara-view-east-intracoastal-ocean-1600x1067.jpg" alt="Olara east-facing Intracoastal and ocean view" />
            <figcaption>East view · Palm Beach and Atlantic horizon · ${imageProviderLabel(`${mediaBase}olara-view-east-intracoastal-ocean-1600x1067.jpg`)}</figcaption>
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
          <img src="${mediaBase}olara-marina-boat-dock-1600x1067.jpg" alt="Olara marina and boat dock lifestyle" />
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
          <a class="document-card" href="/inquire/?project=olara&interest=availability">
            <span>Buyer Packet</span>
            <strong>Request current Olara packet</strong>
            <small>Availability, floorplans, pricing guidance, and buyer notes</small>
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
          <source media="(max-width: 720px)" srcset="${ritzMediaBase}ritz-mobile-hero-tower-sunset-900x1125.jpg" />
          <img src="${ritzMediaBase}ritz-hero-waterfront-building-2200x1375.jpg" alt="The Ritz-Carlton Residences tower on the West Palm Beach waterfront" />
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
            <a class="button primary" href="/inquire/?project=ritz-carlton-wpb&interest=availability">Request Current Availability</a>
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
          <img src="${ritzMediaBase}ritz-arrival-porte-cochere-evening-1600x1067.jpg" alt="Ritz-Carlton Residences evening porte cochere arrival" />
        </figure>
      </section>

      <section class="section" id="ritz-residences">
        <div class="section-heading">
          <p class="eyebrow">Ritz Residences</p>
          <h2>Rockwell interiors and waterfront light.</h2>
        </div>
        <div class="editorial-grid residences-grid">
          <article class="feature-card wide">
            <img src="${ritzMediaBase}ritz-residence-living-room-sunrise-1600x1067.jpg" alt="Ritz-Carlton residence living room at sunrise" />
            <div>
              <span>Residence</span>
              <strong>Sunrise living room</strong>
            </div>
          </article>
          ${ritzResidenceGallery.slice(1).map(renderFeatureCard).join("")}
          <article class="feature-card">
            <img src="${ritzMediaBase}ritz-lobby-service-1600x1067.jpg" alt="Ritz-Carlton residential lobby service moment" />
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
            <img src="${ritzMediaBase}ritz-view-intracoastal-day-1600x1067.jpg" alt="Daytime Intracoastal and Palm Beach view from the Ritz-Carlton Residences" />
            <figcaption>Day view · Palm Beach Island and Atlantic horizon · ${imageProviderLabel(`${ritzMediaBase}ritz-view-intracoastal-day-1600x1067.jpg`)}</figcaption>
          </figure>
          <figure>
            <img src="${ritzMediaBase}ritz-view-balcony-night-1600x1067.jpg" alt="Night balcony view toward downtown West Palm Beach" />
            <figcaption>Night view · Downtown West Palm Beach and waterfront lights · ${imageProviderLabel(`${ritzMediaBase}ritz-view-balcony-night-1600x1067.jpg`)}</figcaption>
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
          <img src="${ritzMediaBase}ritz-evening-aerial-road-motion-1600x1067.jpg" alt="Night aerial view of the Ritz-Carlton Residences and West Palm Beach waterfront" />
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
          <a class="document-card" href="/inquire/?project=ritz-carlton-wpb&interest=availability">
            <span>Buyer Packet</span>
            <strong>Request current Ritz-Carlton packet</strong>
            <small>Availability, floorplans, pricing guidance, and buyer notes</small>
          </a>
          <a class="document-card" href="/floorplans/#floorplans-ritz-carlton-wpb">
            <span>PDF · Floorplan Example</span>
            <strong>Residence 02</strong>
            <small>Open in the on-site floorplan viewer</small>
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
          <p class="eyebrow">Contact Brooke</p>
          <h1>Request current pricing, availability, or floor plans</h1>
          <p>${fullBrookeCtaCopy}</p>
          <div class="inquiry-context-panel">
            ${renderEditorialImagePanel("buyer-intelligence-interior", { compact: true })}
            <div>
              <span>Before you tour, verify the moving parts.</span>
              <ul>
                <li>Current pricing</li>
                <li>Available lines</li>
                <li>Floor-plan depth</li>
                <li>Delivery timing</li>
                <li>Fees and parking assumptions</li>
                <li>Nearby building alternatives</li>
              </ul>
            </div>
          </div>
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
          <div class="brooke-identity-block">
            <strong>${advisorProfile.name}</strong>
            <span>${advisorProfile.brokerage}</span>
            <a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a>
            <p>Private new-construction guidance for West Palm Beach buyers.</p>
          </div>
          ${renderEmailSignup("inquiry_page", "Get WPB new-construction updates")}
          <p class="source-note">${advisorProfile.name}, ${advisorProfile.title} (${advisorProfile.license}) · ${advisorProfile.brokerage} (Florida license ${advisorProfile.brokerageLicense})</p>
        </div>
        <form class="inquiry-form" name="wpb-lead-intake" method="POST" data-netlify="true" netlify-honeypot="company">
          <input type="hidden" name="form-name" value="wpb-lead-intake" />
          <input type="hidden" name="source_page" value="" />
          <input type="hidden" name="viewed_buildings" value="" />
          <input type="hidden" name="submitted_at" value="" />
          <input type="hidden" name="lead_capture_context" value="" />
          <input class="lead-honeypot" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <label>
            <span>Name</span>
            <input type="text" name="name" autocomplete="name" placeholder="Your name" required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="Email address" required />
          </label>
          <label>
            <span>Phone</span>
            <input type="tel" name="phone" autocomplete="tel" placeholder="Preferred phone" />
          </label>
          <label>
            <span>Interested buildings</span>
            <select name="project">
              <option value="">Not sure yet</option>
              ${featuredProjects.map((project) => `<option value="${project.id}">${project.name}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Inquiry type</span>
            <select name="interest">
              <option>Request current availability</option>
              <option>Request private floor-plan packet</option>
              <option>Compare buildings</option>
              <option>Schedule private tour</option>
              <option>Ask Brooke about this building</option>
            </select>
          </label>
          <label>
            <span>Budget range optional</span>
            <input type="text" name="budget" autocomplete="off" placeholder="Example: $2M-$4M" />
          </label>
          <label>
            <span>Residence size optional</span>
            <input type="text" name="residence_size" autocomplete="off" placeholder="Example: 2-3 bedrooms" />
          </label>
          <label>
            <span>Timeline optional</span>
            <input type="text" name="timeline" autocomplete="off" placeholder="Example: 6-18 months" />
          </label>
          <label>
            <span>Are you represented by an agent?</span>
            <select name="represented_by_agent">
              <option value="">Prefer not to say</option>
              <option>Yes</option>
              <option>No</option>
              <option>I am an agent</option>
            </select>
          </label>
          <label class="inquiry-message">
            <span>Message</span>
            <textarea name="message" rows="4" placeholder="Buildings you are considering, timing, budget range, or questions you want answered"></textarea>
          </label>
          <label class="consent-row">
            <input type="checkbox" name="consent" required />
            <span>By submitting, I consent to be contacted by ${advisorProfile.name} and ${advisorProfile.brokerage} at the email address or phone number I provided about this real-estate inquiry. This request is for a manual response and is not consent to autodialed, prerecorded, or automated marketing calls or texts. Pricing, availability, incentives, square footage, fees, and delivery dates require current written confirmation.</span>
          </label>
          <button class="button primary" type="submit">Request Current Availability</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
        <p class="source-note">
          Pricing, availability, square footage, and delivery timing change frequently and must be confirmed through current buyer-side review before reliance.
        </p>
      </section>
      </div>
      </main>
    <aside class="floating-availability-cta" data-floating-cta aria-label="Request current availability">
      <a href="/inquire/?lead_capture_context=floating_cta">Request Current Availability</a>
    </aside>
    <nav class="mobile-cta-bar" aria-label="Quick contact actions">
      <a href="${advisorProfile.mobileHref}" data-quick-cta="call">Call</a>
      <a href="mailto:${advisorProfile.email}" data-quick-cta="email">Email</a>
      <a href="/inquire/?lead_capture_context=mobile_cta" data-quick-cta="request">Request</a>
    </nav>
    <div class="lead-modal-backdrop" data-lead-modal hidden>
      <section class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" aria-describedby="lead-modal-body">
        <button class="lead-modal-close" type="button" data-lead-modal-dismiss aria-label="Keep browsing">×</button>
        <p class="eyebrow">Building Watch</p>
        <h2 id="lead-modal-title">Want updates on these buildings?</h2>
        <p id="lead-modal-body">Get new West Palm Beach development updates, pricing-watch notes, and project changes without filling out a full inquiry form.</p>
        ${renderEmailSignup("second_building_view", "Send Me Updates", true)}
        <div class="lead-modal-actions">
          <button class="button ghost" type="button" data-lead-modal-dismiss>Keep Browsing</button>
          <a class="button text-link" href="/inquire/?lead_capture_context=second_building_view" data-full-inquiry-started>Need current pricing now? Request availability.</a>
        </div>
      </section>
    </div>
    <aside class="site-chat-assistant" data-chat-assistant aria-label="WPB buyer assistant">
      <button class="chat-toggle" type="button" data-chat-toggle aria-expanded="false">Ask WPB</button>
      <div class="chat-panel" data-chat-panel hidden>
        <div class="chat-panel-head">
          <span>Buyer Assistant</span>
          <button type="button" data-chat-close aria-label="Close buyer assistant">x</button>
        </div>
        <div class="chat-thread" data-chat-thread aria-live="polite">
          <p><strong>Ask about a building, corridor, timing, floorplans, or current availability.</strong></p>
          <p>I can point you to the right guide page, then ask whether you want to be connected with an advisor.</p>
        </div>
        <form class="chat-form" data-chat-form>
          <label class="sr-only" for="chat-question">Question</label>
          <input id="chat-question" name="question" type="text" autocomplete="off" placeholder="Ask about Olara, North Flagler, floorplans..." />
          <button type="submit">Send</button>
        </form>
      </div>
    </aside>
    <footer class="site-footer">
      <div>
        <strong>WPB New Construction</strong>
        <p>${advisorProfile.name}, ${advisorProfile.title} (${advisorProfile.license})<br />${advisorProfile.brokerage}<br />Florida license ${advisorProfile.brokerageLicense}</p>
      </div>
      <div>
        <span>Review Method</span>
        <p>Project facts are separated as official, reported, or confirm-before-offer when sources conflict. <a href="/methodology/">See how we verify.</a></p>
        <p class="media-disclaimer">Some project images and renderings are sourced from developer or project marketing materials and are shown for buyer reference. Availability, finishes, views, amenities, and project details should be verified before reliance.</p>
      </div>
      <div>
        <span>Contact</span>
        <p>${advisorProfile.brokerage} (Florida license ${advisorProfile.brokerageLicense})<br /><a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a><br /><a href="mailto:${advisorProfile.email}">${advisorProfile.email}</a></p>
        <p class="footer-links"><a href="/fair-housing/">Fair Housing</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p>
      </div>
      <small>Equal Housing Opportunity. Independent buyer advisory context. All pricing, availability, incentives, and delivery dates require current confirmation.</small>
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
  const interest = String(form.get("interest") ?? "Request current availability");
  const budget = String(form.get("budget") ?? "").trim();
  const residenceSize = String(form.get("residence_size") ?? "").trim();
  const timeline = String(form.get("timeline") ?? "").trim();
  const representedByAgent = String(form.get("represented_by_agent") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const status = target.querySelector<HTMLElement>(".form-status");
  const submittedAt = new Date().toISOString();
  const viewedBuildings = getViewedBuildings();
  const context = String(form.get("lead_capture_context") ?? "").trim() || new URLSearchParams(window.location.search).get("lead_capture_context") || "contact_page";

  target.querySelector<HTMLInputElement>('input[name="source_page"]')?.setAttribute("value", window.location.href);
  target.querySelector<HTMLInputElement>('input[name="viewed_buildings"]')?.setAttribute("value", JSON.stringify(viewedBuildings));
  target.querySelector<HTMLInputElement>('input[name="submitted_at"]')?.setAttribute("value", submittedAt);
  target.querySelector<HTMLInputElement>('input[name="lead_capture_context"]')?.setAttribute("value", context);

  if (!project && !message) {
    if (status) {
      status.textContent = "Please name a building you are considering or add a short message.";
    }
    return;
  }

  const leadRecord = {
    submittedAt,
    name,
    email,
    phone,
    project,
    interest,
    budget,
    residenceSize,
    timeline,
    representedByAgent,
    message,
    viewedBuildings: JSON.stringify(viewedBuildings),
    leadCaptureContext: context,
    consent: "yes",
    source: window.location.href,
  };
  track("contact_form_submit", {
    project: project || "not-sure-yet",
    interest,
    hasPhone: Boolean(phone),
    hasMessage: Boolean(message),
    leadCaptureContext: context,
    viewedBuildingCount: viewedBuildings.length,
  });
  const subject = encodeURIComponent(`WPB New Construction inquiry: ${interest}`);
  const body = encodeURIComponent(
    `Submitted: ${submittedAt}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nProject: ${project || "Not sure yet"}\nInterest: ${interest}\nBudget: ${budget || "Not provided"}\nResidence size: ${residenceSize || "Not provided"}\nTimeline: ${timeline || "Not provided"}\nRepresented by agent: ${representedByAgent || "Not provided"}\nViewed buildings: ${viewedBuildings.map((building) => building.name).join(", ") || "None tracked"}\nMessage: ${message || "Please send current availability, floor plans, and advisor notes."}\n\nConsent: Buyer understands pricing, availability, and delivery dates require current confirmation.`,
  );

  if (status) {
    status.textContent = "Saving inquiry...";
  }

  const sentToFormEndpoint = await submitLeadForm(form);
  if (sentToFormEndpoint) {
    track("lead_modal_submitted", {
      project: project || "not-sure-yet",
      interest,
      leadCaptureContext: context,
    });
    if (status) {
      status.textContent = "Thanks — your request is ready to send. Brooke will follow up with current availability and floor plan guidance.";
    }
    target.reset();
    return;
  }

  if (status) {
    queueLeadLocally(leadRecord);
    track("lead_queue_local_save", {
      project: project || "not-sure-yet",
      interest,
    });
    track("lead_form_submit_fallback", {
      project: project || "not-sure-yet",
      interest,
      leadCaptureContext: context,
    });
    status.textContent = "Thanks — your request is ready to send. Your email client will open so you can send it directly; ";
    const link = document.createElement("a");
    link.href = `mailto:${advisorProfile.email}?subject=${subject}&body=${body}`;
    link.textContent = "send it by email";
    status.append(link, ".");
  }
});

document.querySelectorAll<HTMLFormElement>("[data-email-signup]").forEach((signupForm) => {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const target = event.currentTarget;
    if (!(target instanceof HTMLFormElement) || !target.reportValidity()) return;
    const form = new FormData(target);
    const status = target.querySelector<HTMLElement>(".form-status");
    form.set("source_page", window.location.href);
    form.set("submitted_at", new Date().toISOString());
    if (status) status.textContent = "Saving update request...";
    const submitted = await submitLeadForm(form);
    const context = String(form.get("lead_capture_context") ?? "email_signup");
    if (submitted) {
      track("email_signup_submitted", { leadCaptureContext: context });
      if (status) status.textContent = "You're on the list.";
      target.reset();
      dismissLeadModal();
      return;
    }
    track("email_signup_submitted", { leadCaptureContext: context, fallback: "mailto" });
    if (status) {
      const email = encodeURIComponent(String(form.get("email") ?? ""));
      status.innerHTML = `Open email to finish signup: <a href="mailto:${advisorProfile.email}?subject=WPB%20new-construction%20updates&body=Please%20add%20${email}%20to%20WPB%20new-construction%20updates.">send it by email</a>.`;
    }
  });
});

initBuyerAssistant();
initLeadCaptureModal();
initQuickCtas();
initHomeHero();

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

type ViewedBuilding = {
  slug: string;
  name: string;
  timestamp: string;
};

const viewedBuildingsStorageKey = "wpbViewedBuildings";
const leadModalDismissedKey = "wpbLeadModalDismissed";

function getViewedBuildings(): ViewedBuilding[] {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(viewedBuildingsStorageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((item): item is ViewedBuilding => Boolean(item?.slug && item?.name && item?.timestamp))
      .slice(-12);
  } catch {
    return [];
  }
}

function setViewedBuildings(buildings: ViewedBuilding[]) {
  try {
    window.sessionStorage.setItem(viewedBuildingsStorageKey, JSON.stringify(buildings.slice(-12)));
  } catch {
    // Session tracking is advisory only; browsing and inquiry still work without it.
  }
}

function trackBuildingDetailView(project: FeaturedProject) {
  const existing = getViewedBuildings();
  const alreadyViewed = existing.some((building) => building.slug === project.id);
  const next = [
    ...existing.filter((building) => building.slug !== project.id),
    { slug: project.id, name: project.name, timestamp: new Date().toISOString() },
  ];
  setViewedBuildings(next);
  track("building_view", {
    buildingSlug: project.id,
    buildingName: project.name,
    category: project.corridor,
    salesStatus: project.status,
  });

  if (!alreadyViewed && next.length === 2) {
    track("second_building_view", {
      buildingSlug: project.id,
      buildingName: project.name,
      viewedBuildings: next.map((building) => building.slug).join(","),
    });
    showLeadModal(next);
  }
}

function initLeadCaptureModal() {
  document.querySelectorAll<HTMLElement>("[data-lead-modal-dismiss]").forEach((element) => {
    element.addEventListener("click", () => dismissLeadModal());
  });
  document.querySelector<HTMLElement>("[data-lead-modal-submit]")?.addEventListener("click", () => {
    window.sessionStorage.setItem(leadModalDismissedKey, "submitted");
    track("full_inquiry_started", {
      viewedBuildingCount: getViewedBuildings().length,
    });
  });
  document.querySelector<HTMLElement>("[data-full-inquiry-started]")?.addEventListener("click", () => {
    window.sessionStorage.setItem(leadModalDismissedKey, "full-inquiry");
    track("full_inquiry_started", {
      viewedBuildingCount: getViewedBuildings().length,
    });
  });
}

function showLeadModal(viewedBuildings = getViewedBuildings()) {
  if (window.sessionStorage.getItem(leadModalDismissedKey)) return;
  const modal = document.querySelector<HTMLElement>("[data-lead-modal]");
  if (!modal) return;
  modal.hidden = false;
  track("email_signup_shown", {
    viewedBuildingCount: viewedBuildings.length,
    viewedBuildings: viewedBuildings.map((building) => building.slug).join(","),
  });
}

function dismissLeadModal() {
  const modal = document.querySelector<HTMLElement>("[data-lead-modal]");
  if (modal) modal.hidden = true;
  window.sessionStorage.setItem(leadModalDismissedKey, "dismissed");
  track("email_signup_dismissed", {
    viewedBuildingCount: getViewedBuildings().length,
  });
}

function initQuickCtas() {
  document.querySelectorAll<HTMLElement>("[data-quick-cta]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.quickCta ?? "request";
      track(action === "call" ? "phone_click" : action === "email" ? "email_click" : "inquiry_cta_click", {
        action,
        source: "persistent_cta",
      });
    });
  });
}

function initHomeHero() {
  const hero = document.querySelector<HTMLElement>(".home-hero");
  if (!hero || hero.dataset.heroInitialized || activeHomeHeroImages.length < 2) return;

  hero.dataset.heroInitialized = "true";
  const activeLayer = hero.querySelector<HTMLImageElement>("[data-home-hero-layer='active']");
  const nextLayer = hero.querySelector<HTMLImageElement>("[data-home-hero-layer='next']");
  const caption = hero.querySelector<HTMLElement>("[data-home-hero-caption]");
  if (!activeLayer || !nextLayer) return;

  hero.querySelectorAll<HTMLElement>("[data-hero-cta]").forEach((element) => {
    element.addEventListener("click", () => {
      track("homepage_hero_cta_click", {
        action: element.dataset.heroCta,
        href: element.getAttribute("href"),
      });
    });
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let index = 0;
  let paused = false;
  let isTransitioning = false;
  let currentLayer = activeLayer;
  let standbyLayer = nextLayer;

  const preloadNext = async () => {
    const image = activeHomeHeroImages[(index + 1) % activeHomeHeroImages.length];
    if (!standbyLayer.src.endsWith(image.src)) {
      standbyLayer.src = image.src;
    }
    if (standbyLayer.complete && standbyLayer.naturalWidth > 0) {
      await standbyLayer.decode().catch(() => undefined);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      standbyLayer.addEventListener("load", () => resolve(), { once: true });
      standbyLayer.addEventListener("error", () => reject(new Error(`Unable to load hero image: ${image.src}`)), { once: true });
    });
    await standbyLayer.decode().catch(() => undefined);
  };

  const rotate = async () => {
    if (paused || document.hidden || isTransitioning) return;
    isTransitioning = true;
    const nextIndex = (index + 1) % activeHomeHeroImages.length;
    const image = activeHomeHeroImages[nextIndex];
    try {
      await preloadNext();
    } catch {
      isTransitioning = false;
      return;
    }
    standbyLayer.alt = image.alt;
    const nextPosition = heroImagePosition(image);
    standbyLayer.style.objectPosition = nextPosition || "";
    standbyLayer.removeAttribute("aria-hidden");
    currentLayer.style.zIndex = "1";
    standbyLayer.style.zIndex = "2";
    standbyLayer.classList.add("is-active");

    window.setTimeout(() => {
      currentLayer.classList.remove("is-active");
      currentLayer.alt = "";
      currentLayer.setAttribute("aria-hidden", "true");
      currentLayer.style.zIndex = "0";
      const previousLayer = currentLayer;
      currentLayer = standbyLayer;
      standbyLayer = previousLayer;
      currentLayer.style.zIndex = "1";
      caption?.replaceChildren(document.createTextNode(image.caption));
      index = nextIndex;
      void preloadNext();
      isTransitioning = false;
    }, HERO_FADE_DURATION_MS);
  };

  hero.addEventListener("mouseenter", () => {
    paused = true;
  });
  hero.addEventListener("mouseleave", () => {
    paused = false;
  });
  hero.addEventListener("focusin", () => {
    paused = true;
  });
  hero.addEventListener("focusout", () => {
    paused = false;
  });

  void preloadNext();
  window.setInterval(() => {
    void rotate();
  }, HERO_ROTATION_INTERVAL_MS);
}

function heroImagePosition(image: object) {
  return "imagePosition" in image && typeof image.imagePosition === "string" ? image.imagePosition : "";
}

function initBuyerAssistant() {
  const panel = document.querySelector<HTMLElement>("[data-chat-panel]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-chat-toggle]");
  const close = document.querySelector<HTMLButtonElement>("[data-chat-close]");
  const form = document.querySelector<HTMLFormElement>("[data-chat-form]");
  const input = form?.querySelector<HTMLInputElement>('input[name="question"]');
  const thread = document.querySelector<HTMLElement>("[data-chat-thread]");

  if (!panel || !toggle || !form || !input || !thread) {
    return;
  }

  const setOpen = (isOpen: boolean) => {
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      input.focus();
    }
  };

  toggle.addEventListener("click", () => setOpen(Boolean(panel.hidden)));
  close?.addEventListener("click", () => setOpen(false));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) {
      return;
    }
    appendChatMessage(thread, question, "user");
    appendChatMessage(thread, answerBuyerAssistantQuestion(question), "assistant");
    input.value = "";
  });
}

function appendChatMessage(thread: HTMLElement, message: string, role: "user" | "assistant") {
  const node = document.createElement("p");
  node.className = `chat-message chat-message-${role}`;
  node.textContent = message;
  thread.append(node);
  thread.scrollTop = thread.scrollHeight;
}

function answerBuyerAssistantQuestion(question: string) {
  const normalized = question.toLowerCase();
  const project = featuredProjects.find((project) => normalized.includes(project.name.toLowerCase()) || normalized.includes(project.id.replace(/-/g, " ")));
  const corridor = corridorSections.find((section) => normalized.includes(section.label.toLowerCase()) || normalized.includes(section.key.replace(/-/g, " ")));

  if (project) {
    return `${project.name} is in ${project.corridor}. The quickest next step is its project page: ${projectPath(project)}. If you want live availability, pricing, or floorplans, I can connect you with an advisor through /inquire/.`;
  }

  if (corridor) {
    return `${corridor.label} has ${featuredProjects.filter((project) => project.corridorKey === corridor.key).length} tracked projects. Start here: ${corridorPath(corridor.key)}. From there, compare buildings and request current availability when your shortlist is ready.`;
  }

  if (normalized.includes("floor") || normalized.includes("plan")) {
    return "The floorplan library is at /floorplans/. Public plan material is only the starting point, so request the current packet before relying on availability, stack, or pricing.";
  }

  if (normalized.includes("agent") || normalized.includes("advisor") || normalized.includes("contact") || normalized.includes("connect")) {
    return "Yes. Use /inquire/ and include the buildings or corridors you are considering. That routes the request toward a manual advisor follow-up.";
  }

  return "Start with corridor, timing, floorplans, and view exposure. You can ask about a specific building, North Flagler, South Flagler, Downtown, floorplans, or whether you would like to be connected with an advisor.";
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
window.addEventListener("hashchange", applyRoute);
window.addEventListener("popstate", applyRoute);

function applyRoute() {
  const route = getCurrentRoute();
  const shell = document.querySelector<HTMLElement>(".site-shell");
  const views = Array.from(document.querySelectorAll<HTMLElement>("[data-route-view]"));
  const activeProject = route.type === "project" ? featuredProjects.find((project) => project.id === route.projectId) : undefined;
  const activeCorridor = route.type === "corridor" ? corridorSections.find((section) => section.key === route.corridorKey) : undefined;
  const activeMarketNote = route.type === "market-note-detail" ? marketNoteForSlug(route.articleSlug) : undefined;
  const activeNewsItem = route.type === "news-detail" ? updateForId(route.articleId) : undefined;

  shell?.setAttribute("data-active-route", route.type);
  shell?.setAttribute("data-active-project", route.projectId ?? "");
  const routeSeo = routeSeoDetails(route, activeProject, activeCorridor, activeMarketNote, activeNewsItem);
  document.title = routeSeo.title;

  updateMetaDescription(route.type, activeProject, activeMarketNote, activeNewsItem);
  updateCanonical(route, activeProject, activeMarketNote, activeNewsItem);
  updateSocialMetadata(routeSeo);
  updateStructuredData(route.type, activeProject, activeMarketNote, activeNewsItem);

  views.forEach((view) => {
    const viewType = view.dataset.routeView;
    const isActive =
      route.type === "project"
        ? viewType === "project" && view.dataset.projectId === route.projectId
        : route.type === "corridor"
          ? viewType === "corridor" && view.dataset.corridorRoute === route.corridorKey
          : route.type === "market-note-detail"
            ? viewType === "market-note-detail"
          : route.type === "news-detail"
            ? viewType === "news-detail"
          : route.type === "buildings"
            ? viewType === "home"
          : viewType === route.type;

    view.hidden = !isActive;
  });
  syncMarketNoteDetail(activeMarketNote);
  syncNewsDetail(activeNewsItem);
  initNewsArchive();
  initFloorplanViewer();

  initHeroGoogleMap();
  initProjectLocationMaps();

  const activeNavItem = getActiveNavItem(route);
  document.querySelectorAll<HTMLElement>("[data-nav-item]").forEach((item) => {
    const isActive = item.dataset.navItem === activeNavItem;
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  syncInquiryContext();
  initCompareShortlist();
  if (activeProject) {
    trackBuildingDetailView(activeProject);
  }
  track("page_view", {
    route: route.type,
    path: window.location.pathname,
    ...(route.type === "project" ? { projectId: route.projectId } : {}),
    ...(route.type === "corridor" ? { corridorKey: route.corridorKey } : {}),
    ...(route.type === "market-note-detail" ? { articleSlug: route.articleSlug } : {}),
    ...(route.type === "news-detail" ? { articleId: route.articleId } : {}),
  });

  const routeAnchor = route.type === "buildings" ? "projects" : "";
  if (routeAnchor) {
    window.setTimeout(() => document.getElementById(routeAnchor)?.scrollIntoView({ block: "start" }), 0);
  } else if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0 });
  }
}

function routeSeoDetails(route: Route, activeProject?: FeaturedProject, activeCorridor?: CorridorSection, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem) {
  const path =
    activeProject ? projectPath(activeProject) :
    activeCorridor ? corridorPath(activeCorridor.key) :
    activeMarketNote ? `/market-notes/${activeMarketNote.slug}/` :
    activeNewsItem ? updatePath(activeNewsItem) :
    ({
      home: "/",
      buildings: "/buildings/",
      map: "/map/",
      compare: "/compare/",
      news: "/updates/",
      "market-notes": "/market-notes/",
      floorplans: "/floorplans/",
      answers: "/answers/",
      methodology: "/methodology/",
      privacy: "/privacy/",
      terms: "/terms/",
      "fair-housing": "/fair-housing/",
      inquire: "/inquire/",
    } as Record<string, string>)[route.type] ?? "/";
  const corridorTitles: Record<CorridorKey, string> = {
    "north-flagler": "North Flagler Condos | West Palm Beach Buyer Guide",
    downtown: "Downtown West Palm Beach Condos | Buyer Guide",
    "south-flagler": "South Flagler Condos | West Palm Beach Buyer Guide",
  };
  const corridorDescriptions: Record<CorridorKey, string> = {
    "north-flagler": "Compare North Flagler new-construction condos by waterfront position, Palm Beach proximity, floor plans, status, and current availability questions.",
    downtown: "Compare Downtown West Palm Beach condo projects by walkability, NORA and The Square access, floor plans, timing, and buyer-fit tradeoffs.",
    "south-flagler": "Compare South Flagler waterfront condo projects by privacy, boutique scale, Palm Beach views, floor plans, and current availability checks.",
  };
  const routeTitles: Record<string, string> = {
    home: siteMeta.title,
    news: "West Palm Beach Condo Updates | Construction, Sales & Planning",
    buildings: "West Palm Beach New Construction Buildings | Buyer Guide",
    map: "West Palm Beach Condo Map | New Construction Corridors",
    compare: "Compare West Palm Beach New Construction Condos",
    "market-notes": "West Palm Beach Condo Guidance | Buyer Intelligence",
    floorplans: "West Palm Beach Condo Floor Plans | New Construction Guide",
    answers: "West Palm Beach New Construction Condo Answers",
    methodology: "How We Verify West Palm Beach Condo Project Facts",
    privacy: "Privacy | WPB New Construction",
    terms: "Terms | WPB New Construction",
    "fair-housing": "Fair Housing | WPB New Construction",
    inquire: "Request West Palm Beach Condo Availability",
  };
  const title = activeProject
    ? `${activeProject.name} West Palm Beach | ${activeProject.pageState === "Complete profile" ? "New Construction Condo Guide" : "Buyer Guide"}`
    : activeCorridor
      ? corridorTitles[activeCorridor.key]
      : activeMarketNote
        ? activeMarketNote.seo.titleTag
      : activeNewsItem
        ? `${activeNewsItem.title} | WPB Updates`
      : routeTitles[route.type] ?? siteMeta.title;
  const description = activeNewsItem ? updateArticleContent(activeNewsItem).excerpt : activeMarketNote?.seo.metaDescription ?? activeProject?.summary ?? (activeCorridor ? corridorDescriptions[activeCorridor.key] : metaDescriptionForRoute(route.type));
  const image = activeProject?.image ?? (activeMarketNote ? imageForContentItem(activeMarketNote).src : activeNewsItem ? imageForContentItem(externalNewsImageContext(activeNewsItem)).src : siteMeta.defaultImage);
  return {
    title,
    description,
    image: image.startsWith("http") ? image : `${productionOrigin}${image}`,
    url: `${productionOrigin}${path}`,
  };
}

function getActiveNavItem(route: Route) {
  if (route.type === "project" || route.type === "corridor") {
    return "projects";
  }
  if (route.type === "market-note-detail") {
    return "market-notes";
  }
  if (route.type === "news-detail") {
    return "news";
  }
  if (route.type === "buildings" || route.type === "map" || route.type === "compare") {
    return route.type === "buildings" ? "projects" : route.type;
  }
  if (route.type === "home") {
    return window.location.hash === "#atlas" ? "atlas" : window.location.hash === "#compare" ? "compare" : "projects";
  }
  return route.type;
}

function syncInquiryContext() {
  const params = new URLSearchParams(window.location.search);
  const rawProjectId = params.get("project");
  const projectId = rawProjectId ? projectRouteAliases[rawProjectId] ?? rawProjectId : "";
  const interest = params.get("interest");
  const message = params.get("message");
  const leadCaptureContext = params.get("lead_capture_context");
  const projectSelect = document.querySelector<HTMLSelectElement>('.inquiry-form select[name="project"]');
  const interestSelect = document.querySelector<HTMLSelectElement>('.inquiry-form select[name="interest"]');
  const messageField = document.querySelector<HTMLTextAreaElement>('.inquiry-form textarea[name="message"]');

  if (projectSelect && projectId && featuredProjects.some((project) => project.id === projectId)) {
    projectSelect.value = projectId;
  }

  if (interestSelect && interest === "floorplans") {
    interestSelect.value = "Request private floor-plan packet";
  }

  if (messageField && message) {
    messageField.value = message;
  }

  document.querySelector<HTMLInputElement>('.inquiry-form input[name="source_page"]')?.setAttribute("value", window.location.href);
  document.querySelector<HTMLInputElement>('.inquiry-form input[name="viewed_buildings"]')?.setAttribute("value", JSON.stringify(getViewedBuildings()));
  document.querySelector<HTMLInputElement>('.inquiry-form input[name="lead_capture_context"]')?.setAttribute("value", leadCaptureContext ?? "contact_page");
}

function initCompareShortlist() {
  const route = getCurrentRoute();
  if (route.type !== "compare") return;

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-compare-toggle]"));
  const output = document.querySelector<HTMLElement>("[data-compare-shortlist]");
  const inquireLink = document.querySelector<HTMLAnchorElement>("[data-compare-inquire]");
  if (!buttons.length || !output) return;

  const storageKey = "wpbCompareShortlist";
  const readSelection = () => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  };
  const writeSelection = (ids: string[]) => sessionStorage.setItem(storageKey, JSON.stringify(ids.slice(0, 3)));
  let selectedIds = readSelection().filter((id) => featuredProjects.some((project) => project.id === id)).slice(0, 3);

  const render = () => {
    buttons.forEach((button) => {
      const isSelected = selectedIds.includes(button.dataset.compareToggle ?? "");
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    const selectedProjects = selectedIds
      .map((id) => featuredProjects.find((project) => project.id === id))
      .filter((project): project is FeaturedProject => Boolean(project));

    if (!selectedProjects.length) {
      output.innerHTML = "<p>Select up to three buildings to build a compact buyer comparison.</p>";
      if (inquireLink) {
        inquireLink.href = "/inquire/?lead_capture_context=compare_shortlist";
      }
      return;
    }

    output.innerHTML = selectedProjects
      .map(
        (project) => `
          <article class="compare-shortlist-card">
            <a href="${projectPath(project)}">${escapeHtml(project.name)}</a>
            <dl>
              <div><dt>Corridor</dt><dd>${escapeHtml(project.corridor)}</dd></div>
              <div><dt>Status</dt><dd>${escapeHtml(project.status)}</dd></div>
              <div><dt>Delivery</dt><dd>${escapeHtml(project.delivery)}</dd></div>
              <div><dt>Public floor plans</dt><dd>${project.floorplans ? "Yes" : "Request packet"}</dd></div>
              <div><dt>Waterfront orientation</dt><dd>${project.corridorKey === "downtown" ? "Urban/walkability first" : "Intracoastal corridor context"}</dd></div>
              <div><dt>Residence count</dt><dd>${escapeHtml(project.residences)}</dd></div>
              <div><dt>Buyer fit</dt><dd>${escapeHtml(compareBuyerFit(project))}</dd></div>
              <div><dt>Verification needed</dt><dd>${escapeHtml(compareVerificationNeed(project))}</dd></div>
            </dl>
          </article>
        `,
      )
      .join("");

    const names = selectedProjects.map((project) => project.name).join(", ");
    const message = encodeURIComponent(`I want Brooke to compare these buildings: ${names}.`);
    if (inquireLink) {
      inquireLink.href = `/inquire/?lead_capture_context=compare_shortlist&message=${message}`;
    }
  };

  buttons.forEach((button) => {
    if (button.dataset.compareReady) return;
    button.dataset.compareReady = "true";
    button.addEventListener("click", () => {
      const projectId = button.dataset.compareToggle;
      if (!projectId) return;
      if (selectedIds.includes(projectId)) {
        selectedIds = selectedIds.filter((id) => id !== projectId);
      } else if (selectedIds.length < 3) {
        selectedIds = [...selectedIds, projectId];
      }
      writeSelection(selectedIds);
      render();
    });
  });

  render();
}

function getCurrentRoute(): Route {
  const aliasTarget = canonicalAliasTarget(window.location.pathname);
  if (aliasTarget) {
    window.history.replaceState(null, "", `${aliasTarget}${window.location.search}${window.location.hash}`);
  }
  const params = new URLSearchParams(window.location.search);
  const rawProjectId = params.get("project");
  const view = params.get("view");
  const projectId = rawProjectId ? projectRouteAliases[rawProjectId] ?? rawProjectId : null;

  const pathView = staticRoutePaths[window.location.pathname];
  if (pathView) {
    return { type: pathView } as Route;
  }

  const corridorKey = corridorRoutePaths[window.location.pathname];
  if (corridorKey) {
    return { type: "corridor", corridorKey };
  }

  const updatePathMatch = window.location.pathname.match(/^\/updates\/([^/]+)\/?$/);
  if (updatePathMatch) {
    return { type: "news-detail", articleId: updatePathMatch[1] };
  }

  const marketNotePathMatch = window.location.pathname.match(/^\/(?:market-notes|blog|guidance)\/([^/]+)\/?$/);
  if (marketNotePathMatch) {
    return { type: "market-note-detail", articleSlug: marketNotePathMatch[1] };
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
    view === "market-notes" ||
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

function canonicalAliasTarget(pathname: string) {
  if (pathname === "/brooke-builder/" || pathname === "/brooke-builder" || pathname === "/content-studio/" || pathname === "/content-studio") return "/";
  if (pathname === "/blog/" || pathname === "/blog") return "/market-notes/";
  if (pathname === "/guidance/" || pathname === "/guidance") return "/market-notes/";
  if (pathname === "/contact/" || pathname === "/contact") return "/inquire/";
  if (pathname === "/floor-plans/" || pathname === "/floor-plans") return "/floorplans/";
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return `/market-notes/${blogMatch[1]}/`;
  const guidanceMatch = pathname.match(/^\/guidance\/([^/]+)\/?$/);
  if (guidanceMatch) return `/market-notes/${guidanceMatch[1]}/`;
  return "";
}

function updateCanonical(route: Route, activeProject?: FeaturedProject, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem) {
  const pathByRoute: Record<string, string> = {
    home: "/",
    buildings: "/buildings/",
    map: "/map/",
    compare: "/compare/",
    news: "/updates/",
    "market-notes": "/market-notes/",
    floorplans: "/floorplans/",
    answers: "/answers/",
    methodology: "/methodology/",
    privacy: "/privacy/",
    terms: "/terms/",
    "fair-housing": "/fair-housing/",
    inquire: "/inquire/",
  };
  let path = pathByRoute[route.type] ?? "/";
  if (route.type === "project" && activeProject) {
    path = projectPath(activeProject);
  }
  if (route.type === "corridor") {
    path = corridorPath(route.corridorKey);
  }
  if (route.type === "market-note-detail" && activeMarketNote) {
    path = `/market-notes/${activeMarketNote.slug}/`;
  }
  if (route.type === "news-detail" && activeNewsItem) {
    path = updatePath(activeNewsItem);
  }
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = `${productionOrigin}${path}`;
}

function updateMetaDescription(routeType: string, activeProject?: FeaturedProject, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
  }
  meta.content = activeNewsItem ? updateArticleContent(activeNewsItem).excerpt : activeMarketNote?.seo.metaDescription ?? activeProject?.summary ?? metaDescriptionForRoute(routeType);
}

function metaDescriptionForRoute(routeType: string) {
  const descriptions: Record<string, string> = {
    home: siteMeta.description,
    buildings: "Compare West Palm Beach new-construction condos by corridor, pricing checks, floor plans, delivery timing, amenities, and waterfront position.",
    map: "Map West Palm Beach new-construction condo projects by North Flagler, Downtown, and South Flagler corridor context.",
    compare: "Compare West Palm Beach new-construction condos by corridor, timing, floor plans, water views, amenities, and buyer-fit questions.",
    news: "Track West Palm Beach condo construction, sales, financing, and planning updates with on-site articles, source links, and buyer next steps.",
    "news-detail": "Read a West Palm Beach new-construction update with buyer context, related buildings, Brooke's take, and the original source link.",
    "market-notes": "Read evergreen guidance for West Palm Beach new-construction condos, including active sales, pipeline projects, floor plans, pricing checks, and corridors.",
    floorplans: "Browse released West Palm Beach new-construction condo floor plans and request current sales packets before comparing available residences.",
    answers: "Concise answers to West Palm Beach new-construction condo questions about availability, corridors, floor plans, pricing, and buyer verification.",
    methodology: "How WPB New Construction separates official sources, reported details, and items buyers should verify before relying on project information.",
    privacy: "Privacy information for WPB New Construction inquiry forms, Douglas Elliman policy references, and buyer lead handling.",
    terms: "Terms and limitations for WPB New Construction buyer guidance, project information, and advisory content.",
    "fair-housing": "Equal Housing Opportunity and fair housing disclosure for WPB New Construction buyer advisory content.",
    inquire: "Request current West Palm Beach new-construction condo availability, floor plans, pricing guidance, and private buyer comparison notes.",
    project: "West Palm Beach new-construction project profile with facts, floor plans, source links, and buyer guidance.",
  };
  return descriptions[routeType] ?? siteMeta.description;
}

function updateSocialMetadata(details: { title: string; description: string; image: string; url: string }) {
  setMetaProperty("og:title", details.title);
  setMetaProperty("og:description", details.description);
  setMetaProperty("og:image", details.image);
  setMetaProperty("og:url", details.url);
  setMetaName("twitter:card", "summary_large_image");
  setMetaName("twitter:title", details.title);
  setMetaName("twitter:description", details.description);
  setMetaName("twitter:image", details.image);
}

function setMetaProperty(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.append(meta);
  }
  meta.content = content;
}

function setMetaName(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.append(meta);
  }
  meta.content = content;
}

function updateStructuredData(routeType: string, activeProject?: FeaturedProject, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem) {
  const baseGraph = [
    {
      "@type": siteMeta.publisher.type,
      "@id": `${siteMeta.baseUrl}/#publisher`,
      name: advisorProfile.brokerage,
      url: siteMeta.baseUrl,
      telephone: advisorProfile.mobile,
      address: {
        "@type": "PostalAddress",
        addressLocality: "West Palm Beach",
        addressRegion: "FL",
        addressCountry: "US",
      },
      areaServed: siteMeta.publisher.areaServed,
    },
    {
      "@type": "Person",
      "@id": `${siteMeta.baseUrl}/#advisor`,
      name: advisorProfile.name,
      jobTitle: advisorProfile.title,
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
      ? [buildWebPageSchema(routeType), buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Answers", path: "/answers/" }]), buildFaqSchema()]
      : routeType === "floorplans"
        ? [buildWebPageSchema(routeType), buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Floor Plans", path: "/floorplans/" }]), buildFloorplanItemListSchema()]
        : routeType === "news"
          ? [buildWebPageSchema(routeType), buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Updates", path: "/updates/" }]), ...publishedExternalNews.map(buildExternalNewsArticleSchema)]
          : routeType === "news-detail" && activeNewsItem
            ? [
                buildBreadcrumbSchema([
                  { name: "Home", path: "/" },
                  { name: "Updates", path: "/updates/" },
                  { name: activeNewsItem.title, path: updatePath(activeNewsItem) },
                ]),
                buildExternalNewsArticleSchema(activeNewsItem),
              ]
          : routeType === "market-notes"
            ? [buildWebPageSchema(routeType), buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guidance", path: "/market-notes/" }]), ...marketNotes.map(buildMarketNoteSchema)]
            : routeType === "market-note-detail" && activeMarketNote
              ? [
                  buildBreadcrumbSchema([
                    { name: "Home", path: "/" },
                    { name: "Guidance", path: "/market-notes/" },
                    { name: activeMarketNote.title, path: `/market-notes/${activeMarketNote.slug}/` },
                  ]),
                  buildMarketNoteSchema(activeMarketNote),
                ]
            : routeType === "methodology" || routeType === "privacy" || routeType === "terms" || routeType === "fair-housing"
            ? [buildLegalPageSchema(routeType), buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: pageSchemaName(routeType), path: `/${routeType}/` }])]
          : activeProject
            ? [buildProjectBreadcrumbSchema(activeProject), buildProjectSchema(activeProject)]
            : [buildWebPageSchema(routeType), buildHomeItemListSchema()];

  setJsonLd({
    "@context": "https://schema.org",
    "@graph": [...baseGraph, ...routeGraph],
  });
}

function buildWebPageSchema(routeType: string) {
  const pathByRoute: Record<string, string> = {
    home: "/",
    buildings: "/buildings/",
    map: "/map/",
    compare: "/compare/",
    news: "/updates/",
    "market-notes": "/market-notes/",
    floorplans: "/floorplans/",
    answers: "/answers/",
    inquire: "/inquire/",
  };
  const path = pathByRoute[routeType] ?? "/";
  return {
    "@type": routeType === "home" ? "CollectionPage" : "WebPage",
    "@id": `${siteMeta.baseUrl}${path}#webpage`,
    name: pageSchemaName(routeType),
    url: `${siteMeta.baseUrl}${path}`,
    description: metaDescriptionForRoute(routeType),
    isPartOf: { "@id": `${siteMeta.baseUrl}/#website` },
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    reviewedBy: { "@id": `${siteMeta.baseUrl}/#advisor` },
  };
}

function pageSchemaName(routeType: string) {
  const labels: Record<string, string> = {
    home: "West Palm Beach New Construction Condos",
    buildings: "West Palm Beach New Construction Buildings",
    map: "West Palm Beach Condo Map",
    compare: "Compare West Palm Beach New Construction Condos",
    news: "West Palm Beach Condo Updates",
    "market-notes": "West Palm Beach Condo Guidance",
    floorplans: "West Palm Beach Condo Floor Plans",
    answers: "West Palm Beach New Construction Condo Answers",
    methodology: "How We Verify",
    privacy: "Privacy",
    terms: "Terms",
    "fair-housing": "Fair Housing",
    inquire: "Request Current Availability",
  };
  return labels[routeType] ?? "WPB New Construction";
}

function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteMeta.baseUrl}${item.path}`,
    })),
  };
}

function buildProjectBreadcrumbSchema(project: FeaturedProject) {
  return buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Buildings", path: "/buildings/" },
    { name: project.name, path: projectPath(project) },
  ]);
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
    dateModified: floorplanLibrary[0]?.updatedAt ?? researchNewsFeed[0]?.dateModified,
    mainEntity: answerEngineFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
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

function buildExternalNewsArticleSchema(item: ExternalNewsItem) {
  const article = updateArticleContent(item);
  return {
    "@type": "NewsArticle",
    "@id": `${siteMeta.baseUrl}${updatePath(item)}#article`,
    headline: item.title,
    description: article.excerpt,
    datePublished: item.publishedAt,
    dateModified: item.fetchedAt,
    author: { "@id": `${siteMeta.baseUrl}/#advisor` },
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    mainEntityOfPage: `${siteMeta.baseUrl}${updatePath(item)}`,
  };
}

function buildMarketNoteSchema(note: MarketNote) {
  const resolvedImage = imageForContentItem(note);
  return {
    "@type": "Article",
    "@id": `${siteMeta.baseUrl}/market-notes/${note.slug}/#article`,
    headline: note.title,
    description: note.excerpt,
    datePublished: note.datePublished,
    dateModified: note.dateModified,
    articleSection: note.category,
    author: { "@id": `${siteMeta.baseUrl}/#advisor` },
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    image: resolvedImage.src ? `${siteMeta.baseUrl}${resolvedImage.src}` : `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
    mainEntityOfPage: `${siteMeta.baseUrl}/market-notes/${note.slug}/`,
  };
}

function buildProjectSchema(project: FeaturedProject) {
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
    areaServed: "West Palm Beach, Florida",
    containedInPlace: {
      "@type": "City",
      name: "West Palm Beach",
    },
    numberOfAccommodationUnits: unitCount,
    dateModified: floorplanLibrary[0]?.updatedAt ?? researchNewsFeed[0]?.dateModified,
    status: project.status,
    subjectOf: [
      {
        "@type": "WebPage",
        name: "Buyer Resources",
        url: `${siteMeta.baseUrl}${projectPath(project)}#project-resources-${project.id}`,
      },
      {
        "@type": "WebPage",
        name: "How We Verify",
        url: `${siteMeta.baseUrl}/methodology/`,
      },
    ],
    hasPart: project.image
      ? [{
          "@type": "ImageObject",
          contentUrl: `${siteMeta.baseUrl}${project.image}`,
          caption: `${project.name} project image`,
          creditText: imageSourceName(project.image),
        }]
      : [],
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
    dateModified: floorplanLibrary[0]?.updatedAt ?? researchNewsFeed[0]?.dateModified,
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

function renderNewsFilter(filter: ProjectFilter) {
  const active = filter.key === "all" ? " is-active" : "";
  return `
    <button class="filter-chip${active}" type="button" data-news-filter="${filter.key}" aria-pressed="${filter.key === "all"}">
      ${filter.label}
    </button>
  `;
}

function renderEmailSignup(context: string, title = "Get WPB new-construction updates", compact = false, project?: FeaturedProject) {
  return `
    <form class="email-signup-card${compact ? " is-compact" : ""}" name="wpb-email-updates" method="POST" data-netlify="true" netlify-honeypot="company" data-email-signup>
      <input type="hidden" name="form-name" value="wpb-email-updates" />
      <input type="hidden" name="lead_capture_context" value="${escapeHtml(context)}" />
      <input type="hidden" name="project" value="${project ? escapeHtml(project.id) : ""}" />
      <input class="lead-honeypot" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <div>
        <p class="eyebrow">Email Updates</p>
        <h3>${escapeHtml(title)}</h3>
        <p>No spam. Just new projects, pricing changes, and useful buyer notes.</p>
      </div>
      <label>
        <span>Email</span>
        <input type="email" name="email" autocomplete="email" placeholder="Email address" required />
      </label>
      <label>
        <span>Name optional</span>
        <input type="text" name="name" autocomplete="name" placeholder="Name" />
      </label>
      ${compact ? "" : `
        <label>
          <span>What are you interested in?</span>
          <select name="interest">
            <option value="">Not sure yet</option>
            <option>North Flagler waterfront</option>
            <option>Downtown / Rosemary</option>
            <option>South Flagler waterfront</option>
            <option>Planning-stage projects</option>
            <option>Pricing changes</option>
          </select>
        </label>
      `}
      <button class="button primary" type="submit">Send Me Updates</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
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

function corridorPath(key: CorridorKey) {
  return `/corridors/${key}/`;
}

function corridorImageId(key: CorridorKey) {
  if (key === "north-flagler") return "flagler-waterfront-corridor";
  if (key === "south-flagler") return "south-flagler-corridor";
  return "rosemary-square-corridor";
}

function corridorCardImageId(key: CorridorKey) {
  if (key === "north-flagler") return "flagler-waterfront-corridor";
  if (key === "south-flagler") return "south-flagler-corridor";
  return "rosemary-square-corridor";
}

function corridorDisplayLabel(key: CorridorKey) {
  if (key === "north-flagler") return "NORTH FLAGLER";
  if (key === "south-flagler") return "SOUTH FLAGLER";
  return "DOWNTOWN / ROSEMARY";
}

function corridorCtaLabel(key: CorridorKey) {
  if (key === "north-flagler") return "View North Flagler Projects";
  if (key === "south-flagler") return "View South Flagler Projects";
  return "View Downtown Projects";
}

function corridorBuyerThesis(section: CorridorSection) {
  const copy: Record<CorridorKey, string> = {
    "north-flagler":
      "Waterfront and marina-adjacent towers with Intracoastal orientation, Palm Beach proximity, large amenity programs, and the deepest luxury pipeline.",
    downtown:
      "The walkability play: restaurants, The Square, NORA, Kravis Center, Brightline access, hotel-style service, and less day-to-day dependence on a car.",
    "south-flagler":
      "Quieter waterfront positioning south of the core, with Palm Beach views, estate-adjacent context, and a more residential feel than the central corridor.",
  };
  return copy[section.key];
}

function corridorBuyerQuestions(key: CorridorKey) {
  const questions: Record<CorridorKey, string[]> = {
    "north-flagler": [
      "Do you want marina context or pure waterfront exposure?",
      "How important is Palm Beach proximity?",
      "Which buildings have deeper floor-plan packets?",
      "How much construction/delivery risk are you willing to accept?",
    ],
    downtown: [
      "Do you prioritize walkability over water views?",
      "How important is Brightline/dining/office access?",
      "Are you comparing new construction to delivered urban condos?",
    ],
    "south-flagler": [
      "Are you looking for quieter waterfront positioning?",
      "How important are views toward Palm Beach?",
      "Do you prefer residential calm over downtown energy?",
    ],
  };
  return questions[key];
}

function renderProjectMapFallback() {
  return `
    <div class="map-fallback-panel">
      <strong>${mapFallbackTitle}</strong>
      <p>${mapFallbackBody}</p>
      <div class="map-fallback-actions">
        <a href="/buildings/">View Buildings</a>
        <a href="/compare/">Compare Projects</a>
        <a href="/inquire/?lead_capture_context=map_fallback">Request Current Availability</a>
      </div>
    </div>
  `;
}

function renderMapFallbackCorridorList() {
  return `
    <div class="map-fallback-corridor-list" aria-label="Text project list by corridor">
      ${corridorSections
        .map((section) => {
          const projects = rankedFeaturedProjects.filter((project) => project.corridorKey === section.key);
          return `
            <article>
              <strong>${corridorDisplayLabel(section.key)}</strong>
              <ul>
                ${projects
                  .map(
                    (project) => `
                      <li>
                        <a href="${projectPath(project)}">${escapeHtml(project.name)}</a>
                        ${project.address ? `<span>${escapeHtml(project.address)}</span>` : ""}
                      </li>
                    `,
                  )
                  .join("")}
              </ul>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMapRouteView() {
  return `
    <div class="route-view route-view-map" data-route-view="map" hidden>
      <section class="section map-orientation-hero">
        <div class="map-orientation-copy">
          <p class="eyebrow">Buyer Map</p>
          <h1>Understand the West Palm Beach condo map before comparing buildings.</h1>
          <p>Downtown West Palm Beach sits west of the Intracoastal, with Palm Beach island and the Atlantic beyond. The best comparison starts by understanding the corridors: North Flagler waterfront, Downtown/Rosemary, and South Flagler.</p>
        </div>
        ${renderEditorialImagePanel("wpb-geography-map-hero", { hero: true, className: "map-orientation-image" })}
      </section>
      <section class="section map-corridor-section" aria-label="West Palm Beach condo corridor guide">
        <div class="section-heading">
          <p class="eyebrow">Corridor Lens</p>
          <h2>Three different buyer decisions, not one generic market.</h2>
        </div>
        <div class="map-corridor-grid">
          ${corridorSections.map(renderMapCorridorCard).join("")}
        </div>
      </section>
      <section class="section map-live-section" aria-label="Interactive West Palm Beach project map">
        <div class="section-heading">
          <p class="eyebrow">Project Map</p>
          <h2>${featuredProjects.length} tracked projects on the ground.</h2>
        </div>
        <aside class="home-hero-map-card map-route-map-card" aria-label="West Palm Beach project map">
          <figure class="hero-map-preview">
            <div class="hero-google-map" data-hero-google-map aria-label="Google map of West Palm Beach new-construction project locations"></div>
            <button class="hero-map-expand" type="button" data-map-expand>Show all locations</button>
            <div class="hero-map-fallback">
              ${renderProjectMapFallback()}
            </div>
          </figure>
          <div class="home-map-count" aria-label="Map project count">
            <strong>${featuredProjects.length}</strong>
            <span>tracked West Palm Beach new-construction projects</span>
          </div>
        </aside>
        <a class="home-answer-archive-link" href="/inquire/?lead_capture_context=map_page">Request Current Availability <span aria-hidden="true">↗</span></a>
        ${renderMapFallbackCorridorList()}
      </section>
    </div>
  `;
}

function renderMapCorridorCard(section: CorridorSection) {
  const projects = rankedFeaturedProjects.filter((project) => project.corridorKey === section.key);
  return `
    <article class="map-corridor-card">
      ${renderEditorialImagePanel(corridorImageId(section.key), { compact: true, className: "map-corridor-card-image" })}
      <a href="${corridorPath(section.key)}">${corridorDisplayLabel(section.key)}</a>
      <p>${corridorBuyerThesis(section)}</p>
      <dl>
        <div>
          <dt>Tracked projects</dt>
          <dd>${projects.length}</dd>
        </div>
      </dl>
      <a class="map-corridor-cta" href="${corridorPath(section.key)}">${corridorCtaLabel(section.key)} <span aria-hidden="true">→</span></a>
    </article>
  `;
}

function compareBuyerFit(project: FeaturedProject) {
  if (project.floorplans) return "Floor-plan-first buyer";
  if (project.corridorKey === "downtown") return "Walkability buyer";
  if (project.corridorKey === "north-flagler" || project.corridorKey === "south-flagler") return "Waterfront buyer";
  if (/pipeline|planning|proposed/i.test(project.status)) return "Early pipeline watcher";
  return "Buyer-fit review needed";
}

function compareVerificationNeed(project: FeaturedProject) {
  if (/pipeline|planning|proposed/i.test(project.status)) {
    return "Confirm planning status, launch timing, and buyer packet readiness.";
  }
  if (!project.floorplans) {
    return "Request current plan packet and available line detail before touring.";
  }
  return "Verify line-specific availability, pricing, fees, parking, and delivery assumptions.";
}

function renderCompareRouteView() {
  const categories = [
    "Corridor",
    "Status",
    "Delivery timing",
    "Public floor plans",
    "Waterfront orientation",
    "Residence count",
    "Buyer fit",
    "Verification needed",
  ];
  const filters = [
    "Waterfront buyer",
    "Walkability buyer",
    "Large residence buyer",
    "Early pipeline watcher",
    "Floor-plan-first buyer",
    "Amenity-depth buyer",
  ];

  return `
    <div class="route-view route-view-compare" data-route-view="compare" hidden>
      <section class="section compare-route-hero">
        <div>
          <p class="eyebrow">Compare</p>
          <h1>Compare buildings by the facts that actually change a buyer's decision.</h1>
          <p>${shortBrookeCtaCopy} Use this page to shortlist up to three West Palm Beach new-construction buildings, then ask Brooke to verify the current moving parts before you rely on older public numbers.</p>
        </div>
        ${renderEditorialImagePanel("buyer-intelligence-interior", { compact: true, className: "compare-route-image" })}
      </section>
      <section class="section compare-framework-section">
        <div class="compare-category-grid">
          ${categories.map((category) => `<span>${category}</span>`).join("")}
        </div>
        <div class="compare-fit-grid" aria-label="Buyer fit filters">
          ${filters.map((filter) => `<button type="button" data-compare-fit="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`).join("")}
        </div>
      </section>
      <section class="section compare-shortlist-section">
        <div class="compare-selector-panel">
          <div>
            <p class="eyebrow">Shortlist Builder</p>
            <h2>Select up to three buildings.</h2>
            <p>Side-by-side comparison is most useful when the buildings share a real buyer question: water, walkability, delivery timing, plan depth, or risk tolerance.</p>
          </div>
          <div class="compare-selector-grid">
            ${rankedFeaturedProjects
              .map(
                (project) => `
                  <button type="button" data-compare-toggle="${project.id}">
                    <strong>${project.name}</strong>
                    <span>${project.corridor} · ${project.status}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="compare-shortlist-panel">
          <div class="compare-shortlist-heading">
            <span>Selected comparison</span>
            <a href="/inquire/?lead_capture_context=compare_shortlist" data-compare-inquire>Ask Brooke to compare these buildings</a>
          </div>
          <div class="compare-shortlist-grid" data-compare-shortlist>
            <p>Select up to three buildings to build a compact buyer comparison.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderCorridorRouteView(section: CorridorSection) {
  const projects = rankedFeaturedProjects.filter((project) => project.corridorKey === section.key);
  return `
    <div class="route-view route-view-corridor" data-route-view="corridor" data-corridor-route="${section.key}" hidden>
      <section class="section intelligence-hero corridor-route-hero">
        <div>
          <p class="eyebrow">Choose Your Corridor</p>
          <h1>${section.label}</h1>
          <p>${section.description}</p>
          <p class="corridor-thesis">${corridorBuyerThesis(section)}</p>
        </div>
        ${renderEditorialImagePanel(corridorImageId(section.key), { compact: true, className: "corridor-route-image" })}
      </section>
      <section class="section corridor-questions-section">
        <aside class="answer-meta-panel">
          <span>${projects.length} tracked project${projects.length === 1 ? "" : "s"}</span>
          <strong>${section.detail}</strong>
          <small>Use this page to compare only the ${section.label} set, then request current availability before touring.</small>
        </aside>
        <div class="corridor-question-card">
          <p class="eyebrow">Buyer Questions</p>
          <ul>
            ${corridorBuyerQuestions(section.key).map((question) => `<li>${question}</li>`).join("")}
          </ul>
          <a href="/inquire/?lead_capture_context=corridor&message=${encodeURIComponent(`I want help comparing ${section.label} projects.`)}">Request current ${section.label} availability <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <section class="project-sort-shell corridor-project-shell">
        <div class="project-sort-header">
          <div>
            <p class="eyebrow">Corridor Projects</p>
            <h2>${section.label} buildings currently tracked.</h2>
            <p class="selected-filter-summary">These are the buildings assigned to ${section.label}. Return to all buildings when you want a citywide comparison.</p>
          </div>
          <a class="corridor-back-link" href="/#projects">All buildings <span aria-hidden="true">→</span></a>
        </div>
        <div class="front-project-grid front-project-grid-static">
          ${projects.map(renderFeaturedProject).join("")}
        </div>
      </section>
    </div>
  `;
}

function marketNoteForSlug(slug: string) {
  return marketNotes.find((note) => note.slug === slug || note.seo.suggestedSlug === slug);
}

function renderMarketNoteCard(note: MarketNote) {
  const resolvedImage = imageForContentItem(note);
  const cardOverride = approvedHomepageCardOverride("guidance", note.slug);
  const relatedProjects = note.projectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");
  return `
    <article class="home-blog-card market-note-card" id="${escapeHtml(note.seo.suggestedSlug)}">
      ${cardOverride?.imagePath ? renderHomepageOverrideImage(cardOverride, note.title, "market-note-card-image") : renderResolvedContentImage(resolvedImage, "market-note-card-image")}
      <span>${escapeHtml(publicGuidanceLabel(note.category))} · Updated ${escapeHtml(note.dateModified)}</span>
      <h3>${escapeHtml(cardOverride?.headline || note.title)}</h3>
      <p>${escapeHtml(cardOverride?.deck || cardOverride?.subhead || note.excerpt)}</p>
      <small>${escapeHtml(note.buyerTakeaway)}</small>
      ${relatedProjects ? `<p class="market-note-related">Related: ${escapeHtml(relatedProjects)}</p>` : ""}
      <div class="market-note-actions">
        <a href="/market-notes/${note.slug}/">${escapeHtml(cardOverride?.ctaLabel || "Read Guidance")} <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function publicGuidanceLabel(category: string) {
  if (/floor/i.test(category)) return "Floor Plan Strategy";
  if (/corridor/i.test(category)) return "Corridor Guide";
  if (/market/i.test(category)) return "Market Context";
  if (/guide|guidance/i.test(category)) return "Buyer Guide";
  return "Guidance";
}

function syncMarketNoteDetail(note?: MarketNote) {
  const detailView = document.querySelector<HTMLElement>('[data-route-view="market-note-detail"]');
  if (!detailView) return;
  detailView.innerHTML = note ? renderMarketNoteArticle(note) : renderMissingMarketNote();
  if (note) {
    track("blog_article_view", {
      articleSlug: note.slug,
      category: note.category,
    });
  }
}

function renderMarketNoteArticle(note: MarketNote) {
  const resolvedImage = imageForContentItem(note);
  const relatedProjects = note.projectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId))
    .filter((project): project is FeaturedProject => Boolean(project));
  const relatedUpdates = researchNewsFeed
    .filter((item) => item.projectIds.some((projectId) => note.projectIds.includes(projectId)))
    .slice(0, 3);
  const sourceStatus = note.sourceLinks.length ? "Source-linked buyer note" : "Buyer guidance note";

  return `
    <article class="market-note-article">
      <header class="section market-note-hero">
        <div>
          <a class="market-note-back" href="/market-notes/">Guidance</a>
          <p class="eyebrow">${escapeHtml(note.category)}</p>
          <h1>${escapeHtml(note.title)}</h1>
          <p class="market-note-dek">${escapeHtml(note.excerpt)}</p>
          <p class="market-note-hero-thesis">${escapeHtml(note.buyerThesis)}</p>
        </div>
        ${renderResolvedContentImage(resolvedImage, "market-note-hero-image")}
      </header>
      <section class="market-note-meta-strip" aria-label="Article metadata">
        <div><span>Category</span><strong>${escapeHtml(note.category)}</strong></div>
        <div><span>Published</span><strong>${escapeHtml(note.datePublished)}</strong></div>
        <div><span>Updated</span><strong>${escapeHtml(note.dateModified)}</strong></div>
        <div><span>Buildings</span><strong>${relatedProjects.length}</strong></div>
        <div><span>Verification</span><strong>${escapeHtml(sourceStatus)}</strong></div>
      </section>
      <section class="section market-note-body">
        <aside class="market-note-thesis">
          <span>Buyer thesis</span>
          <strong>${escapeHtml(note.buyerThesis)}</strong>
        </aside>
        <div class="market-note-sections">
          <aside class="buyer-takeaway-box">
            <span>Buyer Takeaway</span>
            <p>${escapeHtml(note.buyerTakeaway)}</p>
          </aside>
          ${note.sections
            .map(
              (section) => `
                <section>
                  <h2>${escapeHtml(section.heading)}</h2>
                  <p>${escapeHtml(section.body)}</p>
                </section>
              `,
            )
            .join("")}
          <aside class="verify-box">
            <span>What to verify before relying on this</span>
            <ul>
              ${note.factCheckRequired.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </aside>
        </div>
      </section>
      <section class="section market-note-related-section">
        <div class="section-heading">
          <p class="eyebrow">Related Buildings</p>
          <h2>Buildings to compare while this note is fresh.</h2>
        </div>
        <div class="front-project-grid front-project-grid-static">
          ${relatedProjects.slice(0, 4).map(renderRelatedBuildingCard).join("")}
        </div>
      </section>
      ${
        relatedUpdates.length
          ? `
            <section class="section market-note-related-section">
              <div class="section-heading">
                <p class="eyebrow">Related Updates</p>
                <h2>Recent public signals tied to this note.</h2>
              </div>
              <div class="news-grid">
                ${relatedUpdates.map(renderResearchNewsItem).join("")}
              </div>
            </section>
          `
          : ""
      }
      <section class="section conversion-section market-note-cta">
        ${renderEditorialImagePanel("buyer-intelligence-interior", { compact: true, className: "market-note-cta-image" })}
        <div>
          <p class="eyebrow">Private Comparison Notes</p>
          <h2>Want help applying this to your search?</h2>
          <p>Send the buildings you are weighing and Brooke will help verify current availability, floor plans, and timing before you build a shortlist around older public numbers.</p>
        </div>
        <a href="/inquire/?lead_capture_context=market_note_article&message=${encodeURIComponent(`I want help applying this note: ${note.title}`)}">Request Current Availability <span aria-hidden="true">↗</span></a>
      </section>
    </article>
  `;
}

function renderRelatedBuildingCard(project: FeaturedProject) {
  const image = projectImageForContent(project) ?? project.image;
  return `
    <article class="related-building-card">
      ${image ? `<img src="${safeHref(image)}" alt="${escapeHtml(project.name)} building image" loading="lazy" decoding="async" />` : ""}
      <div>
        <span>${escapeHtml(project.corridor)} · ${escapeHtml(project.status)}</span>
        <strong>${escapeHtml(project.name)}</strong>
        <p>${escapeHtml(project.summary)}</p>
        <a href="${projectPath(project)}">View building <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function renderMissingMarketNote() {
  return `
    <section class="section intelligence-hero">
      <div>
        <p class="eyebrow">Guidance</p>
        <h1>That note is not available.</h1>
        <p>Return to the Guidance index for current buyer intelligence.</p>
        <a class="button primary" href="/market-notes/">View Guidance</a>
      </div>
    </section>
  `;
}

function imageProviderLabel(src: string) {
  const sourceName = imageSourceName(src);
  return `Image: ${sourceName}`;
}

function imageCaptionShort(src: string) {
  return projectLabelForImage(src) ?? imageSourceName(src);
}

function canShowImage(src: string) {
  return Boolean(src);
}

function renderMediaAsset(asset: MediaAsset, variant = "standard") {
  if (canShowImage(asset.src)) {
    if (asset.mobileSrc && canShowImage(asset.mobileSrc)) {
      return `
        <picture>
          <source media="(max-width: 720px)" srcset="${asset.mobileSrc}" />
          <img src="${asset.src}" alt="${asset.alt}" loading="lazy" decoding="async" />
        </picture>
      `;
    }

    return `<img src="${asset.src}" alt="${asset.alt}" loading="lazy" decoding="async" />`;
  }

  return `
    <div class="image-placeholder image-placeholder-${variant}" role="img" aria-label="${asset.title}">
      <span>${asset.kicker}</span>
      <strong>${asset.title}</strong>
    </div>
  `;
}

function projectImageForContent(project: FeaturedProject) {
  return curatedProjectImage(project)
    ?? placedImportedImageForProject(project.id, "card")
    ?? project.image
    ?? project.galleryImages?.find((asset) => canShowImage(asset.src))?.src;
}

function approvedImportedImagesForProject(projectId: string) {
  return importedProjectImages
    .filter((image) => image.projectId === projectId && image.status === "placed" && canShowImage(importedImagePublicPath(image)))
    .sort((a, b) => {
      const placementPriority = { hero: 0, card: 1, gallery: 2, interior: 3, amenity: 4, update: 5, article: 6 };
      const typePriority = { exterior: 0, rendering: 1, unknown: 2, interior: 3, amenity: 4, floorplan: 5, logo: 6 };
      return (placementPriority[a.placement ?? "gallery"] - placementPriority[b.placement ?? "gallery"]) || (typePriority[a.imageType] - typePriority[b.imageType]);
    });
}

function importedImagePublicPath(image: ImportedProjectImage) {
  return image.localPath.replace(/^public/, "");
}

function curatedProjectImage(project: FeaturedProject) {
  const candidates = [project.heroImage, project.mobileImage, project.image, ...(project.galleryImages?.map((asset) => asset.src) ?? [])].filter(Boolean) as string[];
  return candidates.find((src) => src.includes("user-provided-"));
}

function placedImportedImageForProject(projectId: string, placement?: ImportedProjectImage["placement"]) {
  const records = approvedImportedImagesForProject(projectId);
  const record = placement ? records.find((image) => image.placement === placement) ?? records[0] : records[0];
  return record ? importedImagePublicPath(record) : undefined;
}

function firstNamedProjectForContent(item: ContentImageContext) {
  const projectIds = item.projectIds ?? item.relatedProjectIds ?? [];
  if (item.primaryProjectId) {
    return featuredProjects.find((project) => project.id === item.primaryProjectId);
  }

  if (projectIds.length === 1) {
    return featuredProjects.find((project) => project.id === projectIds[0]);
  }

  const title = (item.title ?? "").toLowerCase();
  return projectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId))
    .find((project): project is FeaturedProject => {
      if (!project) return false;
      const projectName = project.name.toLowerCase();
      const shortName = projectName.split(/\s+/)[0];
      return title.includes(projectName) || title.includes(shortName) || title.includes(project.id.replaceAll("-", " "));
    });
}

function editorialImageIdForContent(item: ContentImageContext, relatedProject?: FeaturedProject): EditorialImageId {
  if (item.imageId && editorialImageForId(item.imageId)?.status === "available") {
    return item.imageId as EditorialImageId;
  }
  if (item.resolvedLocalImageId && editorialImageForId(item.resolvedLocalImageId)?.status === "available") {
    return item.resolvedLocalImageId as EditorialImageId;
  }

  const category = `${item.category ?? ""} ${(item.relatedCorridorIds ?? []).join(" ")}`.toLowerCase();
  if (category.includes("nora")) return "nora-growth-corridor";
  if (category.includes("downtown")) return "rosemary-square-corridor";
  if (category.includes("south flagler")) return "south-flagler-corridor";

  if (relatedProject?.corridorKey === "north-flagler") return "flagler-waterfront-corridor";
  if (relatedProject?.corridorKey === "south-flagler") return "south-flagler-corridor";
  if (relatedProject?.corridorKey === "downtown") return "rosemary-square-corridor";

  return "wpb-geography-map-hero";
}

function imageForContentItem(item: ContentImageContext): ResolvedContentImage {
  const explicitImage = item.image?.path ?? "";
  if (explicitImage && canShowImage(explicitImage)) {
    return {
      src: explicitImage,
      alt: `${item.title ?? "West Palm Beach new-construction update"} image`,
      credit: item.image?.credit ?? imageCreditShort(explicitImage),
      caption: item.image?.credit ?? imageCreditShort(explicitImage),
      relatedProject: projectLabelForImage(explicitImage)
        ? featuredProjects.find((project) => explicitImage.includes(`/projects/${project.id}/`))
        : undefined,
      source: "explicit",
    };
  }

  const relatedProject = firstNamedProjectForContent(item);
  const projectImage = relatedProject ? projectImageForContent(relatedProject) : undefined;
  if (relatedProject && projectImage && canShowImage(projectImage)) {
    const approvedImport = approvedImportedImagesForProject(relatedProject.id).find((image) => importedImagePublicPath(image) === projectImage);
    return {
      src: projectImage,
      alt: approvedImport?.alt ?? `${relatedProject.name} related image`,
      credit: approvedImport?.credit ?? imageCreditShort(projectImage),
      caption: approvedImport?.caption ?? imageCaptionShort(projectImage),
      relatedProject,
      source: approvedImport ? "imported" : "project",
    };
  }

  const editorialId = editorialImageIdForContent(item, relatedProject);
  const editorial = editorialImageForId(editorialId) ?? editorialImageForId("wpb-geography-map-hero");
  if (editorial?.status === "available") {
    return {
      src: editorial.assetPath,
      alt: editorial.alt,
      credit: editorial.credit ?? editorial.caption,
      caption: editorial.caption,
      relatedProject,
      source: "editorial",
    };
  }

  return {
    src: siteMeta.defaultImage,
    alt: "West Palm Beach new-construction map",
    credit: "WPB New Construction map",
    caption: "WPB New Construction map",
    relatedProject,
    source: "generic",
  };
}

function renderResolvedContentImage(image: ResolvedContentImage, className = "") {
  const caption = image.source === "imported" ? `${image.caption} · ${image.credit}` : image.caption;
  return `
    <figure class="${["content-image-panel", className].filter(Boolean).join(" ")}" data-image-source="${image.source}">
      <img src="${safeHref(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" />
      <figcaption>${publicText(caption)}</figcaption>
    </figure>
  `;
}

function imageSourceName(src: string) {
  if (src.includes("user-provided-")) return "Project gallery";
  if (src.includes("/team-logos/related-ross")) return "Related Ross";
  if (src.includes("/team-logos/arquitectonica")) return "Arquitectonica";
  if (src.includes("/olara/")) return "Olara";
  if (src.includes("/ritz-carlton-wpb/")) return "The Ritz-Carlton Residences WPB";
  if (src.includes("/mandarin-oriental/")) return "Mandarin Oriental Residences WPB";
  if (src.includes("/shorecrest/")) return "Shorecrest";
  if (src.includes("/rosewood/")) return "Rosewood Residences WPB";
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
  if (src.includes("/10-cityplace/")) return "Related Ross 10 CityPlace";
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
  return projectLabelForImage(src) ?? imageSourceName(src);
}

function projectLabelForImage(src: string) {
  const project = featuredProjects.find((project) => src.includes(`/projects/${project.id}/`));
  return project ? `${project.name} | ${project.corridor}` : undefined;
}

function gatekeeperText(value: unknown) {
  return String(value ?? "")
    .replace(/\bdetailed review notes\b/gi, "detailed review notes")
    .replace(/\breview notes\b/gi, "review notes")
    .replace(/\bcurrent buyer note uses\b/gi, "current buyer note uses")
    .replace(/\bdetails to verify\b/gi, "details to verify")
    .replace(/\bnot publicly confirmed\b/gi, "Verify before relying")
    .replace(/\bearly-stage projects to monitor?\b/gi, "early-stage projects to monitor")
    .replace(/\bprojects to monitor?\b/gi, "projects to monitor")
    .replace(/\bdevelopers?\b/gi, "project sponsor")
    .replace(/\bco-developer\b/gi, "project partner")
    .replace(/\bsales team\b/gi, "buyer-side review")
    .replace(/\bbuyer appointment\b/gi, "buyer packet")
    .replace(/\bofficial project sites?\b/gi, "reviewed project materials")
    .replace(/\bofficial source\b/gi, "reviewed source")
    .replace(/\bofficial\/download material\b/gi, "reviewed material")
    .replace(/\bcurrent official\/reviewed material\b/gi, "current reviewed material")
    .replace(/\breviewed material\b/gi, "reviewed material")
    .replace(/\bproject sponsor material\b/gi, "reviewed material")
    .replace(/\bdeveloper announcements?\b/gi, "project announcements")
    .replace(/\bproject disclosures?\b/gi, "project disclosures")
    .replace(/\bproject legal notices?\b/gi, "project legal notices")
    .replace(/\brequired condominium disclosure package\b/gi, "required condominium disclosure package")
    .replace(/\bproject review file\b/gi, "project review file")
    .replace(/\breview file\b/gi, "review file")
    .replace(/\bbackend\b/gi, "operations")
    .replace(/\bSource:\s*/gi, "");
}

function publicText(value: unknown) {
  return escapeHtml(gatekeeperText(value));
}

function teamLogoForCredit(name: string): MediaAsset | undefined {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("related ross")) {
    return {
      src: relatedRossLogo,
      kicker: "Development",
      title: "Related Ross",
      alt: "Related Ross logo",
    };
  }
  if (normalizedName.includes("arquitectonica")) {
    return {
      src: arquitectonicaLogo,
      kicker: "Architecture",
      title: "Arquitectonica",
      alt: "Arquitectonica logo",
    };
  }
  return undefined;
}

function renderFeaturedProject(project: FeaturedProject) {
  const cardOverride = approvedHomepageCardOverride("featuredBuildings", project.id);
  const media = cardOverride?.imagePath
    ? `<img src="${safeHref(cardOverride.imagePath)}" alt="${escapeHtml(cardOverride.alt || `${project.name} project preview`)}" loading="lazy" decoding="async" />`
    : project.image && canShowImage(project.image)
    ? `<img src="${project.image}" alt="${project.name} project preview" loading="lazy" decoding="async" />`
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
        <figcaption>${escapeHtml(cardOverride?.caption || (project.image ? imageCaptionShort(project.image) : `${project.corridor} project`))}</figcaption>
      </figure>
      <div class="front-project-card-body">
        <span>${project.corridor} · ${project.status}</span>
        <strong>${escapeHtml(cardOverride?.headline || project.name)}</strong>
        <p>${escapeHtml(cardOverride?.deck || cardOverride?.subhead || project.summary)}</p>
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
          <a href="${projectPath(project)}">${escapeHtml(cardOverride?.ctaLabel || "View Project")} <span aria-hidden="true">→</span></a>
          <a href="/inquire/?project=${project.id}&interest=floorplans">Request Current Availability <span aria-hidden="true">→</span></a>
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
    (window as WindowWithGoogleMaps).gm_authFailure = () => {
      setGoogleMapFallback("Google Maps authentication failed");
      reject(new Error("Google Maps authentication failed"));
    };

    const resolveLoadedMaps = () => {
      const maps = (window as WindowWithGoogleMaps).google?.maps;
      if (maps?.Map) {
        resolve(maps);
      } else {
        reject(new Error("Google Maps loaded without maps constructor"));
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[data-map-loader="${heroMapScriptId}"]`);
    if (existingScript) {
      if ((window as WindowWithGoogleMaps).google?.maps?.Map) {
        resolveLoadedMaps();
        return;
      }
      (window as WindowWithGoogleMaps).__wpbGoogleMapsReady = resolveLoadedMaps;
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }

    const params = new URLSearchParams({
      key: googleMapsApiKey,
      libraries: "marker",
      loading: "async",
      v: "weekly",
      callback: heroMapCallbackName,
    });
    const script = document.createElement("script");
    script.dataset.mapLoader = heroMapScriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    (window as WindowWithGoogleMaps).__wpbGoogleMapsReady = resolveLoadedMaps;
    script.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
    document.head.append(script);
  });

  return googleMapsLoader;
}

function setGoogleMapFallback(message = buyerFriendlyMapFallback) {
  document.querySelectorAll<HTMLElement>(".home-hero-map-card").forEach((card) => {
    card.dataset.mapState = "unavailable";
    card.querySelectorAll<HTMLButtonElement>("[data-map-expand]").forEach((button) => {
      button.textContent = "Map unavailable";
      button.disabled = true;
    });
  });
  document.querySelectorAll<HTMLElement>("[data-project-google-map]").forEach((element) => {
    element.dataset.mapState = "unavailable";
    element.textContent = message;
  });
}

function validMapProjects(projects: FeaturedProject[]) {
  return projects.filter((project) => Number.isFinite(project.latitude) && Number.isFinite(project.longitude));
}

function loadAdvancedMarkerElement(maps: GoogleMapsNamespace) {
  if (!googleMapsMapId) {
    return Promise.resolve(undefined);
  }
  if (googleAdvancedMarkerLoader) {
    return googleAdvancedMarkerLoader;
  }

  googleAdvancedMarkerLoader = (async () => {
    if (maps.marker?.AdvancedMarkerElement) {
      return maps.marker.AdvancedMarkerElement;
    }
    if (!maps.importLibrary) {
      return undefined;
    }
    try {
      const markerLibrary = await maps.importLibrary("marker");
      return markerLibrary.AdvancedMarkerElement;
    } catch (error) {
      return undefined;
    }
  })();

  return googleAdvancedMarkerLoader;
}

function markerPinElement(priority: "primary" | "secondary") {
  const pin = document.createElement("span");
  pin.className = `map-advanced-marker map-advanced-marker-${priority}`;
  pin.setAttribute("aria-hidden", "true");
  return pin;
}

function createMapMarker(
  maps: GoogleMapsNamespace,
  map: unknown,
  position: { lat: number; lng: number },
  title: string,
  priority: "primary" | "secondary",
  onClick: () => void,
  AdvancedMarkerElement?: GoogleAdvancedMarkerConstructor,
): GoogleMarkerHandle {
  if (AdvancedMarkerElement) {
    const marker = new AdvancedMarkerElement({
      map,
      position,
      title,
      content: markerPinElement(priority),
      gmpClickable: true,
    });
    if (marker.addEventListener) {
      marker.addEventListener("gmp-click", onClick);
    } else {
      marker.addListener?.("click", onClick);
    }
    return {
      clear: () => {
        marker.map = null;
      },
    };
  }

  const marker = new maps.Marker({
    map,
    position,
    title,
    icon: {
      path: maps.SymbolPath.CIRCLE,
      scale: priority === "primary" ? 8 : 5,
      fillColor: priority === "primary" ? "#0d3125" : "#50665e",
      fillOpacity: 1,
      strokeColor: "#fffaf1",
      strokeWeight: priority === "primary" ? 2 : 1,
    },
  });
  marker.addListener("click", onClick);
  return {
    clear: () => marker.setMap(null),
  };
}

function googleMapBaseOptions(center: { lat: number; lng: number }, zoom: number): Record<string, unknown> {
  const mapOptions: Record<string, unknown> = {
    center,
    zoom,
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

  return mapOptions;
}

function initHeroGoogleMap() {
  const routeType = getCurrentRoute().type;
  if (routeType !== "home" && routeType !== "map") {
    return;
  }

  const activeCards = Array.from(document.querySelectorAll<HTMLElement>(".home-hero-map-card")).filter(
    (card) => !card.closest<HTMLElement>("[data-route-view]")?.hidden && !card.dataset.mapInitialized,
  );

  if (!activeCards.length) {
    return;
  }

  if (!googleMapsApiKey) {
    setGoogleMapFallback();
    return;
  }

  activeCards.forEach((card) => {
    const canvas = card.querySelector<HTMLElement>("[data-hero-google-map]");
    const expandButtons = Array.from(card.querySelectorAll<HTMLButtonElement>("[data-map-expand]"));
    if (!canvas) return;

    card.dataset.mapState = "loading";
    card.dataset.mapInitialized = "true";

    loadGoogleMaps()
      .then(async (maps) => {
      card.dataset.mapState = "ready";
      const AdvancedMarkerElement = await loadAdvancedMarkerElement(maps);
      if (!canvas.isConnected) return;
      const map = new maps.Map(canvas, googleMapBaseOptions({ lat: 26.7134, lng: -80.0564 }, 13));
      let expanded = false;
      let markers: GoogleMarkerHandle[] = [];

      const renderMarkers = () => {
        markers.forEach((marker) => marker.clear());
        markers = [];
        const projects = validMapProjects(expanded ? rankedFeaturedProjects : rankedFeaturedProjects.slice(0, 7));
        if (!projects.length) {
          setGoogleMapFallback();
          return;
        }
        const bounds = new maps.LatLngBounds();

        projects.forEach((project, index) => {
          const position = { lat: project.latitude, lng: project.longitude };
          bounds.extend(position);
          const marker = createMapMarker(
            maps,
            map,
            position,
            `${project.name} · ${project.corridor} project`,
            index < 7 ? "primary" : "secondary",
            () => {
              window.location.assign(projectPath(project));
            },
            AdvancedMarkerElement,
          );
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
    .catch(() => {
      setGoogleMapFallback();
    });
  });
}

function initProjectLocationMaps() {
  const route = getCurrentRoute();
  if (route.type !== "project") {
    return;
  }

  const mapsToInit = Array.from(document.querySelectorAll<HTMLElement>("[data-project-google-map]"))
    .filter((element) => !element.dataset.mapInitialized && !element.closest<HTMLElement>("[data-route-view]")?.hidden);

  if (!mapsToInit.length) {
    return;
  }

  if (!googleMapsApiKey) {
    setGoogleMapFallback();
    return;
  }

  mapsToInit.forEach((element) => {
    element.dataset.mapState = "loading";
    element.textContent = "";
  });

  loadGoogleMaps()
    .then(async (maps) => {
      const AdvancedMarkerElement = await loadAdvancedMarkerElement(maps);
      mapsToInit.forEach((element) => {
        const latitude = Number(element.dataset.latitude);
        const longitude = Number(element.dataset.longitude);
        const projectName = element.dataset.projectName || "Selected project";
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          element.dataset.mapState = "unavailable";
          element.textContent = "Project map unavailable";
          return;
        }

        const position = { lat: latitude, lng: longitude };
        const map = new maps.Map(element, googleMapBaseOptions(position, 15));
        createMapMarker(
          maps,
          map,
          position,
          projectName,
          "primary",
          () => {
            const projectId = element.closest<HTMLElement>("[data-route-view='project']")?.dataset.projectId;
            const project = projectId ? featuredProjects.find((item) => item.id === projectId) : undefined;
            if (project) window.location.assign(projectPath(project));
          },
          AdvancedMarkerElement,
        );
        element.dataset.mapInitialized = "true";
        element.dataset.mapState = "ready";
      });
    })
    .catch(() => {
      setGoogleMapFallback();
    });
}

function renderResearchNewsItem(item: ResearchNewsItem) {
  const resolvedImage = imageForContentItem(item);
  const isOlderPublicUpdate = isOlderThanDays(item.datePublished || item.dateModified, 90);
  const relatedProject = resolvedImage.relatedProject ?? item.projectIds.map((projectId) => featuredProjects.find((project) => project.id === projectId)).find(Boolean);
  return `
    <article class="news-card intelligence-news-card" id="${escapeHtml(item.id)}">
      ${renderResolvedContentImage(resolvedImage)}
      <span>${publicText(item.category)} · ${publicText(item.datePublished)} · Last checked ${publicText(item.dateModified)}${isOlderPublicUpdate ? " · Older public update" : ""}</span>
      <strong>${publicText(item.title)}</strong>
      <p>${publicText(item.summary)}</p>
      <small>${publicText(item.sourceName)}${relatedProject ? ` · Related: ${escapeHtml(relatedProject.name)}` : ""} · ${publicText(item.status)}</small>
      <a class="home-news-link" href="${relatedProject ? projectPath(relatedProject) : "/inquire/?lead_capture_context=update_card"}">${relatedProject ? "View related building" : "Ask about this update"} <span aria-hidden="true">→</span></a>
    </article>
  `;
}

function externalNewsImageContext(item: ExternalNewsItem): ContentImageContext {
  return {
    title: item.title,
    category: item.category,
    projectIds: item.relatedProjectIds,
    relatedProjectIds: item.relatedProjectIds,
    relatedCorridorIds: item.relatedCorridorIds,
    image: item.imagePath || item.imageUrl ? { path: item.imagePath || item.imageUrl, credit: item.sourceName } : undefined,
    imageId: item.resolvedLocalImageId,
    resolvedLocalImageId: item.resolvedLocalImageId,
    canonicalUrl: item.canonicalUrl,
  };
}

function relatedNewsLabel(item: ExternalNewsItem) {
  const projectLabels = item.relatedProjectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId)?.name)
    .filter(Boolean);
  if (projectLabels.length) return `Related: ${projectLabels.join(", ")}`;
  const corridorLabels = item.relatedCorridorIds
    .map((corridorId) => corridorSections.find((section) => section.key === corridorId)?.label)
    .filter(Boolean);
  return corridorLabels.length ? `Related: ${corridorLabels.join(", ")}` : "Related: West Palm Beach development";
}

function formatNewsDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(parsed));
}

function renderExternalNewsItem(item: ExternalNewsItem) {
  const resolvedImage = imageForContentItem(externalNewsImageContext(item));
  const article = updateArticleContent(item);
  const searchText = [
    item.title,
    article.excerpt,
    item.category,
    relatedNewsLabel(item),
    ...item.relatedProjectIds,
    ...item.relatedCorridorIds,
  ].join(" ");
  return `
    <article class="news-card intelligence-news-card external-news-card" id="${escapeHtml(item.id)}" data-news-card data-news-category="${escapeHtml(item.category)}" data-news-corridors="${escapeHtml(item.relatedCorridorIds.join(" "))}" data-news-projects="${escapeHtml(item.relatedProjectIds.join(" "))}" data-news-search="${escapeHtml(searchText.toLowerCase())}">
      ${renderResolvedContentImage(resolvedImage)}
      <div>
        <span>${publicText(item.category)} · ${publicText(formatNewsDate(item.publishedAt))}</span>
        <strong>${publicText(item.title)}</strong>
        <p>${publicText(article.excerpt)}</p>
        <small>${publicText(relatedNewsLabel(item))}</small>
        <a class="home-news-link" href="${updatePath(item)}">Read Update <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function renderFeaturedExternalNewsItem(item: ExternalNewsItem) {
  const resolvedImage = imageForContentItem(externalNewsImageContext(item));
  const article = updateArticleContent(item);
  return `
    <article class="featured-update-card">
      ${renderResolvedContentImage(resolvedImage)}
      <div>
        <span>${publicText(item.category)} · ${publicText(formatNewsDate(item.publishedAt))} · ${publicText(relatedNewsLabel(item).replace(/^Related:\s*/, ""))}</span>
        <h2>${publicText(item.title)}</h2>
        <p>${publicText(article.deck)}</p>
        <a class="button primary" href="${updatePath(item)}">Read Latest Update <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function renderHomeExternalNewsItem(item: ExternalNewsItem) {
  const resolvedImage = imageForContentItem(externalNewsImageContext(item));
  const article = updateArticleContent(item);
  const cardOverride = approvedHomepageCardOverride("updates", item.id);
  return `
    <article class="home-news-card external-news-card" id="home-${escapeHtml(item.id)}">
      ${cardOverride?.imagePath ? renderHomepageOverrideImage(cardOverride, item.title) : renderResolvedContentImage(resolvedImage)}
      <div>
        <span>Update · ${publicText(relatedNewsLabel(item).replace(/^Related:\s*/, ""))} · ${publicText(formatNewsDate(item.publishedAt))}</span>
        <strong>${publicText(cardOverride?.headline || item.title)}</strong>
        <p>${publicText(cardOverride?.deck || cardOverride?.subhead || article.excerpt)}</p>
        <small>${publicText(relatedNewsLabel(item))}</small>
        <a class="home-news-link" href="${updatePath(item)}">${publicText(cardOverride?.ctaLabel || "Read Update")} <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function updatePath(item: ExternalNewsItem) {
  return `/updates/${item.slug || item.id}/`;
}

function updateForId(articleId: string) {
  return publishedExternalNews.find((item) => item.id === articleId || item.slug === articleId);
}

function syncNewsDetail(item?: ExternalNewsItem) {
  const detailView = document.querySelector<HTMLElement>('[data-route-view="news-detail"]');
  if (!detailView) return;
  detailView.innerHTML = item ? renderUpdateArticle(item) : renderMissingUpdateArticle();
  if (item) {
    track("update_article_view", {
      articleId: item.id,
      sourceName: item.sourceName,
    });
  }
}

function initNewsArchive() {
  const grid = document.querySelector<HTMLElement>("[data-news-grid]");
  if (!grid || grid.dataset.newsArchiveReady === "true") return;
  grid.dataset.newsArchiveReady = "true";
  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-news-card]"));
  const filterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-news-filter]"));
  const searchInput = document.querySelector<HTMLInputElement>("[data-news-search]");
  const emptyState = document.querySelector<HTMLElement>("[data-news-empty]");
  let activeFilter = "all";

  const applyNewsState = () => {
    const query = searchInput?.value.trim().toLowerCase() ?? "";
    let visibleCount = 0;
    cards.forEach((card) => {
      const category = card.dataset.newsCategory ?? "";
      const corridors = card.dataset.newsCorridors ?? "";
      const searchText = card.dataset.newsSearch ?? "";
      const matchesFilter = activeFilter === "all" || category === activeFilter || corridors.split(" ").includes(activeFilter);
      const matchesSearch = !query || searchText.includes(query);
      const isVisible = matchesFilter && matchesSearch;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount > 0;
  };

  filterButtons.forEach((button) => {
    if (button.dataset.newsFilterReady === "true") return;
    button.dataset.newsFilterReady = "true";
    button.addEventListener("click", () => {
      activeFilter = button.dataset.newsFilter ?? "all";
      filterButtons.forEach((item) => {
        const isActive = item.dataset.newsFilter === activeFilter;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      applyNewsState();
    });
  });

  searchInput?.addEventListener("input", applyNewsState);
  applyNewsState();
}

function updateArticleContent(item: ExternalNewsItem) {
  const relatedProjects = item.relatedProjectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId))
    .filter((project): project is FeaturedProject => Boolean(project));
  const relatedProjectNames = relatedProjects.map((project) => project.name).join(", ");
  const relatedLabel = relatedProjectNames || relatedNewsLabel(item).replace(/^Related:\s*/i, "");
  const deck = item.deck || item.description || `${item.sourceName} reported a West Palm Beach development update tied to ${relatedLabel}.`;
  const specificContent: Record<string, { story: string[]; whyItMatters: string; brookeTake: string }> = {
    "florida-yimby-mandarin-interiors-2026-05-18": {
      story: [
        "Florida YIMBY reported new interior renderings for Mandarin Oriental Residences, West Palm Beach, the planned tower at 5400 North Flagler Drive. The update shifts the project conversation from basic massing and address into the lifestyle layer buyers will actually compare in person: arrival, finish direction, branded service cues, and amenity atmosphere.",
        "That matters because Mandarin Oriental is competing in a crowded North Flagler luxury set where the buyer decision is not only about height or waterfront proximity. The interiors help show how the project intends to separate itself through hospitality branding and daily living experience.",
      ],
      whyItMatters:
        "For a buyer comparing Mandarin Oriental with Olara, Ritz-Carlton Residences, Alba, or future North Flagler pipeline projects, the new visuals help clarify whether the building belongs on a service-driven shortlist or a purely waterfront/view-driven shortlist.",
      brookeTake:
        "Use the renderings as a design signal, then verify current residence lines, finish packages, view exposure, carrying costs, and what branded services are included versus optional before ranking the project.",
    },
    "wflx-nora-house-2026-04-10": {
      story: [
        "WFLX covered NORA House as part of the larger Nora District transformation north of downtown West Palm Beach. The buyer angle is not just another condo building; it is a district story, with underused blocks being repositioned around dining, retail, residential density, and walkable neighborhood energy.",
        "NORA House gives buyers a different version of West Palm Beach new construction. Instead of prioritizing direct waterfront or estate-adjacent quiet, it points toward restaurants, convenience, and a more urban daily routine close to the downtown core.",
      ],
      whyItMatters:
        "Buyers who care about walkability, newer restaurants, and neighborhood momentum may evaluate NORA House differently from the Flagler Drive waterfront towers, especially if lifestyle and convenience matter more than water views.",
      brookeTake:
        "Treat Nora as a location thesis. Before leaning in, compare the released floor plans, parking, noise exposure, pricing, and construction timing against the waterfront buildings and the established downtown inventory.",
    },
    "florida-yimby-rosewood-proposal-2026-01": {
      story: [
        "Florida YIMBY reported that Related Group and BH Group announced Rosewood Residences, a proposed 27-story luxury tower for 2001 North Flagler Drive. If the proposal advances, it would add another branded luxury name to the North Flagler corridor.",
        "For buyers, the important distinction is timing. Rosewood is future market context, not the same thing as a currently available residence with released pricing, contracts, and near-term delivery.",
      ],
      whyItMatters:
        "The proposal reinforces North Flagler's direction as a branded luxury corridor, which can influence how buyers think about future supply, resale positioning, and whether to act on existing projects or wait for more detail.",
      brookeTake:
        "Keep Rosewood on the radar, but compare it differently from active sales. Use it as context while verifying what is actually purchasable today at Olara, Ritz-Carlton Residences, Alba, Mandarin Oriental, and other North Flagler options.",
    },
    "florida-yimby-south-flagler-tops-out-2025-11": {
      story: [
        "Florida YIMBY reported that South Flagler House topped out at 1355 South Flagler Drive. Topping out is a practical construction milestone: the building has reached its structural height, making the project feel more tangible than an early rendering or sales announcement.",
        "That milestone matters in West Palm Beach's luxury pipeline because South Flagler House occupies a different lane from the larger North Flagler cluster: more estate-adjacent, more residential in feel, and more focused on privacy and scale.",
      ],
      whyItMatters:
        "For buyers comparing delivery timing, corridor feel, and the tradeoff between downtown energy and South Flagler privacy, the topping-out milestone can move South Flagler House from watchlist concept to serious shortlist discussion.",
      brookeTake:
        "Use the milestone to pressure-test timing and fit. The next step is to verify remaining construction timeline, available residences, view corridors, service model, and how the South Flagler setting compares with North Flagler or downtown options.",
    },
  };
  const articleContent = specificContent[item.id];
  const bodyStory = item.bodySections?.map((section) => `${section.heading}: ${section.body}`) ?? [];
  const story = [
    ...(item.story?.length ? item.story : bodyStory.length ? bodyStory : articleContent?.story ?? [deck]),
    relatedProjects.length
      ? `What to verify next: current availability, view exposure, residence lines, timing, and the latest buyer packet for ${relatedProjectNames}.`
      : "What to verify next: current project status, corridor momentum, timing, and any released buyer materials.",
  ];
  return {
    deck,
    excerpt: item.summary || deck,
    story,
    whyItMatters: item.whyItMatters || articleContent?.whyItMatters || (relatedProjects.length
        ? `A public update can change how ${relatedProjectNames} should be compared, but it does not replace current pricing, availability, floorplan, and contract verification.`
        : "A public update can change corridor context, but it does not replace current pricing, availability, floorplan, and contract verification."),
    brookeTake: item.brookeTake || articleContent?.brookeTake ||
      "Use this as a signal, not a decision by itself. The next step is to verify what is current today, then compare the buildings that actually fit the buyer's goals.",
    buyerContext: item.buyerContext || item.summary || deck,
    newsletterBlurb: item.newsletterBlurb || item.summary || deck,
    newsletterCta: item.newsletterCta || "Request current availability",
    cta:
      "For guidance on West Palm Beach new construction - including how these buildings compare, which residences stand out, and what may fit your goals best - contact Brooke Snader with the Scott Gordon Group at Douglas Elliman Palm Beach.",
  };
}

function renderUpdateArticle(item: ExternalNewsItem) {
  const resolvedImage = imageForContentItem(externalNewsImageContext(item));
  const content = updateArticleContent(item);
  const relatedProjects = item.relatedProjectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId))
    .filter((project): project is FeaturedProject => Boolean(project));
  return `
    <article class="market-note-article update-article">
      <header class="section market-note-hero">
        <div>
          <a class="market-note-back" href="/updates/">Updates</a>
          <p class="eyebrow">${publicText(item.category)} Update</p>
          <h1>${publicText(item.title)}</h1>
          <p class="market-note-dek">${publicText(content.deck)}</p>
          <p class="market-note-hero-thesis">${publicText(relatedNewsLabel(item))}</p>
        </div>
        ${renderResolvedContentImage(resolvedImage, "market-note-hero-image")}
      </header>
      <section class="market-note-meta-strip" aria-label="Update metadata">
        <div><span>Category</span><strong>${publicText(item.category)}</strong></div>
        <div><span>Published</span><strong>${publicText(formatNewsDate(item.publishedAt))}</strong></div>
        <div><span>Updated</span><strong>${publicText(item.fetchedAt)}</strong></div>
        <div><span>Related</span><strong>${relatedProjects.length || item.relatedCorridorIds.length}</strong></div>
      </section>
      <section class="section market-note-body">
        <aside class="market-note-thesis">
          <span>Deck</span>
          <strong>${publicText(content.deck)}</strong>
        </aside>
        <div class="market-note-sections">
          <section>
            <h2>The story</h2>
            ${content.story.map((paragraph) => `<p>${publicText(paragraph)}</p>`).join("")}
          </section>
          <section>
            <h2>Why it matters</h2>
            <p>${publicText(content.whyItMatters)}</p>
          </section>
          <section>
            <h2>Buyer context</h2>
            <p>${publicText(content.buyerContext)}</p>
          </section>
          <section>
            <h2>Brooke's take</h2>
            <p>${publicText(content.brookeTake)}</p>
          </section>
          <aside class="verify-box">
            <span>Newsletter-ready note</span>
            <p>${publicText(content.newsletterBlurb)}</p>
          </aside>
          <aside class="buyer-takeaway-box">
            <span>Next step</span>
            <p>${publicText(content.cta)}</p>
            <a href="/inquire/?lead_capture_context=update_article&update=${encodeURIComponent(item.id)}">Contact Brooke <span aria-hidden="true">→</span></a>
          </aside>
        </div>
      </section>
      ${
        relatedProjects.length
          ? `<section class="section market-note-related-section">
              <div class="section-heading">
                <p class="eyebrow">Related Buildings</p>
                <h2>Compare the buildings tied to this update.</h2>
              </div>
              <div class="front-project-grid front-project-grid-static">
                ${relatedProjects.slice(0, 4).map(renderRelatedBuildingCard).join("")}
              </div>
            </section>`
          : ""
      }
      <footer class="section update-source-footer">
        <span>Original source: ${publicText(item.sourceName)}${item.sourcePublishedAt ? ` · ${publicText(formatNewsDate(item.sourcePublishedAt))}` : ""}</span>
        <a href="${safeHref(item.canonicalUrl)}" target="_blank" rel="noopener noreferrer">Read the original source</a>
      </footer>
    </article>
  `;
}

function renderMissingUpdateArticle() {
  return `
    <section class="section intelligence-hero">
      <div>
        <p class="eyebrow">Updates</p>
        <h1>That update is not available.</h1>
        <p>Return to the updates index for the current published articles.</p>
      </div>
      <a class="button primary" href="/updates/">View Updates</a>
    </section>
  `;
}

function isOlderThanDays(dateValue: string, days: number) {
  const parsed = Date.parse(dateValue);
  if (Number.isNaN(parsed)) return false;
  const ageMs = Date.now() - parsed;
  return ageMs > days * 24 * 60 * 60 * 1000;
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
              ${plans.map((plan, index) => renderGeneratedFloorplanLink(plan, project, index)).join("")}
            </div>
            ${extraCount ? `<p class="source-note">${extraCount} additional plan records are available in the buyer catalog.</p>` : ""}`
          : `<p class="floorplan-gap">${escapeHtml(project.missingNote)}</p>`
      }
    </article>
  `;
}

function renderGeneratedFloorplanLink(
  plan: (typeof floorplanLibrary)[number]["plans"][number],
  project?: (typeof floorplanLibrary)[number],
  index = 0,
) {
  const title = plan.title;
  const projectName = project?.name ?? "Project floorplan";
  const caption = plan.href && !/^https?:\/\//i.test(plan.href)
    ? "Preview this floorplan inside WPB New Construction, then request the current packet before relying on availability or stack details."
    : "This plan is handled through the current packet request path so buyers do not leave the site for a sales-office download.";
  if (!plan.href) {
    return `
      <article class="floorplan-link floorplan-link-static">
        <span>${escapeHtml(title)}</span>
        <small>Available through current sales packet</small>
      </article>
    `;
  }
  if (/^https?:\/\//i.test(plan.href) || /\.html?(?:$|[?#])/i.test(plan.href)) {
    return `
    <button
      class="floorplan-link floorplan-link-button"
      type="button"
      data-floorplan-open
      data-floorplan-index="${index}"
      data-floorplan-title="${escapeHtml(title)}"
      data-floorplan-project="${escapeHtml(projectName)}"
      data-floorplan-caption="${escapeHtml(caption)}"
      data-floorplan-src=""
    >
      <span>${escapeHtml(title)}</span>
      <small>Request current packet</small>
    </button>
  `;
  }

  return `
    <button
      class="floorplan-link floorplan-link-button"
      type="button"
      data-floorplan-open
      data-floorplan-index="${index}"
      data-floorplan-title="${escapeHtml(title)}"
      data-floorplan-project="${escapeHtml(projectName)}"
      data-floorplan-caption="${escapeHtml(caption)}"
      data-floorplan-src="${safeHref(plan.href)}"
    >
      <span>${escapeHtml(title)}</span>
      <small>Preview floorplan</small>
    </button>
  `;
}

function answerShortLabel(item: (typeof answerEngineFaq)[number]) {
  return item.shortLabel;
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
  const relatedProjects = item.relatedProjectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId))
    .filter((project): project is FeaturedProject => Boolean(project))
    .slice(0, 3);
  return `
    <article class="answer-block" id="${escapeHtml(item.id)}">
      <div>
        <span>${escapeHtml(item.concept)}</span>
        <h2>${publicText(item.question)}</h2>
      </div>
      <p>${publicText(item.answer)}</p>
      ${
        sourceCitations.length
          ? `<div class="answer-citation-grid">
              ${sourceCitations
                .map(
                  (source) => `
                    <article class="answer-citation">
                      <strong>${publicText(source.label)}</strong>
                      <small>${publicText(source.note)}</small>
                    </article>
                  `,
                )
                .join("")}
            </div>`
          : ""
      }
      ${
        relatedProjects.length
          ? `<div class="market-note-actions">
              ${relatedProjects.map((project) => `<a href="${projectPath(project)}">${escapeHtml(project.name)} <span aria-hidden="true">→</span></a>`).join("")}
              <a href="/inquire/?lead_capture_context=answer_block&message=${encodeURIComponent(`I have a question about: ${item.question}`)}">Request Current Availability <span aria-hidden="true">↗</span></a>
            </div>`
          : `<div class="market-note-actions"><a href="/inquire/?lead_capture_context=answer_block">Request Current Availability <span aria-hidden="true">↗</span></a></div>`
      }
      <footer>
        <small>Related: ${escapeHtml(item.relatedProjectIds.join(", "))}</small>
        <small>Reviewed: ${publicText(item.sources.join("; "))}</small>
        <small>Accessed: ${escapeHtml(item.sourceCitations[0]?.dateAccessed ?? researchNewsFeed[0]?.dateModified ?? "current review")}</small>
      </footer>
    </article>
  `;
}

function renderProjectFact(fact: ProjectFact) {
  if (isSuppressedPublicFact(fact)) return "";
  return `
    <article class="profile-card">
      <span>${publicText(fact.label)}</span>
      <strong>${publicText(fact.value)}</strong>
      ${fact.note ? `<p>${publicText(fact.note)}</p>` : ""}
    </article>
  `;
}

function isSuppressedPublicFact(fact: ProjectFact) {
  const combined = `${fact.label} ${fact.value} ${fact.note ?? ""}`.toLowerCase();
  return /sales\s*(gallery|office)|developer\s+site|official\s+site|review file|operations layer/.test(combined);
}

function projectTypeLabel(type: ProjectPageType) {
  const labels: Record<ProjectPageType, string> = {
    "complete-profile": "Complete profile",
    "advisory-brief": "Advisory brief",
    "planning-watch": "Planning watch",
    "source-watch": "Source watch",
    "market-marker": "Market marker",
  };
  return labels[type];
}

function renderProjectIdentityHeader(project: FeaturedProject, pageType: ProjectPageType) {
  const logo = project.logoImage && canShowImage(project.logoImage)
    ? `<img src="${safeHref(project.logoImage)}" alt="${escapeHtml(project.logoAlt ?? `${project.name} logo`)}" loading="lazy" decoding="async" />`
    : `<strong>${publicText(project.name)}</strong>`;
  return `
    <header class="project-identity-header">
      <div class="project-identity-mark">${logo}</div>
      <div class="project-identity-copy">
        <p class="eyebrow">${publicText(projectTypeLabel(pageType))}</p>
        <h1>${publicText(project.name)}</h1>
        <p>${publicText(project.corridor)} · ${publicText(project.status)} · ${publicText(project.address)}</p>
      </div>
      <a class="button primary" href="${pageType === "planning-watch" || pageType === "source-watch" || pageType === "market-marker" ? `#project-updates-${project.id}` : `/inquire/?project=${project.id}&interest=availability`}">${pageType === "planning-watch" || pageType === "source-watch" || pageType === "market-marker" ? "Get Updates" : "Request Current Availability"}</a>
    </header>
  `;
}

function renderProjectKnownFactsPanel(project: FeaturedProject, draft: ProjectPageDraft, pageType: ProjectPageType) {
  const sourceFact = sourceFactForProject(project.id)?.facts;
  const factRows = [
    ["Status", project.status],
    ["Corridor", project.corridor],
    ["Address / location", project.address],
    ["Estimated residences", project.residences],
    ["Estimated floor count", draft.facts.find((fact) => /stor(y|ies)|floor/i.test(fact.label))?.value ?? sourceFact?.stories ?? "Not publicly confirmed"],
    ["Developer", draft.team.find((member) => /developer|sponsor|partner/i.test(member.role))?.name ?? sourceFact?.team?.split(";")[0] ?? "Not publicly confirmed"],
    ["Architect", draft.team.find((member) => /architect/i.test(member.role))?.name ?? "Not publicly confirmed"],
    ["Interior designer", draft.team.find((member) => /interior/i.test(member.role))?.name ?? "Not publicly confirmed"],
    ["Estimated delivery", project.delivery],
    ["Floorplans available?", project.floorplans ? "Yes - confirm current packet" : "Not publicly confirmed"],
    ["Pricing released?", /not released|confirm/i.test(project.price) ? "Confirm before reliance" : project.price],
    ["Current confidence level", pageType === "complete-profile" ? "High" : pageType === "advisory-brief" ? "Medium" : "Low / monitor"],
  ];
  return `
    <section class="project-known-facts" aria-label="${project.name} known facts">
      <div>
        <p class="eyebrow">Known Facts</p>
        <h2>What is confirmed enough to use now.</h2>
      </div>
      <dl>
        ${factRows.map(([label, value]) => `
          <div>
            <dt>${publicText(label)}</dt>
            <dd>${publicText(value || "Not publicly confirmed")}</dd>
          </div>
        `).join("")}
      </dl>
    </section>
  `;
}

function renderProjectMissingInfoPanel(project: FeaturedProject) {
  const items = project.missingInfo ?? missingInfoForProject(project);
  if (!items.length) return "";
  return `
    <section class="section project-missing-info" aria-label="${project.name} missing information">
      <div class="section-heading">
        <p class="eyebrow">What Is Not Yet Confirmed</p>
        <h2>Do not rely on these items until checked.</h2>
      </div>
      <ul>
        ${items.map((item) => `<li>${publicText(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderProjectRelatedNews(project: FeaturedProject) {
  const items = publishedExternalNews.filter((item) => item.relatedProjectIds.includes(project.id));
  if (!items.length) return "";
  return `
    <section class="section project-related-news" id="project-updates-${project.id}" aria-label="${project.name} related development news">
      <div class="section-heading">
        <p class="eyebrow">Project Updates</p>
        <h2>Recent project notes</h2>
        <p>Public updates and buyer-relevant notes to verify before relying on current pricing, availability, or timing.</p>
      </div>
      <div class="project-note-list">
        ${items.map(renderProjectUpdateNote).join("")}
      </div>
    </section>
  `;
}

function renderProjectUpdateNote(item: ExternalNewsItem) {
  return `
    <article class="project-note-row" id="${escapeHtml(item.id)}">
      <div>
        <span>${publicText(formatNewsDate(item.publishedAt))} — ${publicText(item.title)}</span>
        ${item.description ? `<p>${publicText(item.description)}</p>` : ""}
        <small>Source: ${publicText(item.sourceName)}${item.paywallStatus === "likely-paywalled" ? " · May require subscription" : ""}</small>
      </div>
      <nav aria-label="${escapeHtml(item.title)} actions">
        <a href="${updatePath(item)}">Read Update</a>
        <a href="/inquire/?lead_capture_context=project_update&update=${encodeURIComponent(item.id)}">Ask about this update</a>
      </nav>
    </article>
  `;
}

function renderDraftProjectPage(project: FeaturedProject) {
  const draft = editorProjectPageDrafts[project.id] ?? projectDraftFromFeatured(project);
  const floorplanProject = getFloorplanProject(project.id);
  const floorplanCount = floorplanProject?.count ?? 0;
  const brochureStats = projectBrochureStats(project, draft, floorplanCount);
  const gallery = projectBrochureGallery(project, draft);
  const heroImage = draft.image ?? project.heroImage ?? project.image;
  const residenceTiles = gallery.filter((asset) => asset.src !== heroImage).slice(0, 3);
  const amenityTiles = projectBrochureAmenityTiles(project, draft);
  const teamTiles = projectBrochureTeamTiles(project, draft);
  const heroMobileImage = heroImage === project.heroImage ? project.mobileImage : undefined;
  const pageType = project.projectPageType ?? pageTypeForProject(project);
  const isCompactWatch = pageType === "planning-watch" || pageType === "source-watch" || pageType === "market-marker";
  const hasGallery = gallery.some((asset) => canShowImage(asset.src));
  const hasAmenities = !isCompactWatch && amenityTiles.some((asset) => canShowImage(asset.src));
  const hasTeam = teamTiles.length > 0;
  const primaryCta = isCompactWatch ? "Get Updates on This Project" : "Request Current Availability";
  const secondaryCta = isCompactWatch ? "Ask Brooke What Is Known" : "Ask About Floor Plans";

  return `
    <div class="route-view route-view-project route-view-draft-project route-view-brochure-project project-page-${pageType}" data-route-view="project" data-project-id="${project.id}" data-project-page-type="${pageType}" hidden>
      ${renderProjectIdentityHeader(project, pageType)}
      <section class="brochure-hero" id="${project.id}">
        <figure>
          ${heroImage ? renderMediaAsset({ src: heroImage, mobileSrc: heroMobileImage, alt: draft.imageAlt, kicker: "Project Image", title: draft.title }, "hero") : ""}
        </figure>
        <div class="brochure-hero-copy">
          <p class="eyebrow">${project.corridor} · West Palm Beach</p>
          <h1>${brochureHeadline(project)}</h1>
          <p>${publicText(project.editorialIntro ?? draft.intro)}</p>
          <div class="hero-actions">
            ${isCompactWatch
              ? `<a class="button primary" href="#project-updates-${project.id}">${primaryCta}</a>`
              : `<a class="button primary" href="/inquire/?project=${project.id}&interest=floorplans">${primaryCta}</a>`}
            <a class="button ghost" href="${isCompactWatch ? `/inquire/?project=${project.id}&lead_capture_context=planning_watch` : `#project-resources-${project.id}`}">${secondaryCta}</a>
          </div>
        </div>
      </section>

      <nav class="brochure-section-nav" aria-label="${project.name} project sections">
        <a href="/#projects">Explore Buildings</a>
        <a href="#overview-${project.id}">Overview</a>
        ${hasGallery ? `<a href="#residences-${project.id}">Images</a>` : ""}
        ${hasAmenities ? `<a href="#amenities-${project.id}">Amenities</a>` : ""}
        ${hasTeam ? `<a href="#team-${project.id}">Design Team</a>` : ""}
        <a href="#location-${project.id}">Location</a>
        <a href="#project-resources-${project.id}">Buyer Resources</a>
        <a href="${isCompactWatch ? `#project-updates-${project.id}` : `/inquire/?project=${project.id}&interest=floorplans`}">${primaryCta}</a>
      </nav>

      ${renderDeveloperImageDisclaimer()}

      <section class="brochure-stat-rail" aria-label="${project.name} quick facts">
        ${brochureStats.map(renderBrochureStat).join("")}
      </section>

      ${renderProjectKnownFactsPanel(project, draft, pageType)}
      ${renderProjectSnapshotPanel(project.id)}

      <section class="brochure-module brochure-residences-module" id="overview-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">${isCompactWatch ? "Editorial Brief" : "Residences"}</p>
          <h2>${isCompactWatch ? `${project.name} buyer read` : residenceSectionTitle(project)}</h2>
          <p>${publicText(project.summary)}</p>
          <a href="#project-resources-${project.id}">${isCompactWatch ? "View what is confirmed" : "View floor plans"} <span aria-hidden="true">→</span></a>
        </div>
        ${hasGallery ? `
          <div class="brochure-tile-grid brochure-tile-grid-three" id="residences-${project.id}">
            ${residenceTiles.map((asset, index) => renderBrochureImageTile(asset, ["Project image", "Gallery image", "Context image"][index] ?? asset.title)).join("")}
          </div>
        ` : ""}
      </section>

      ${hasAmenities ? `<section class="brochure-module brochure-amenities-module" id="amenities-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">Amenities</p>
          <h2>The lifestyle layer.</h2>
          <p>${publicText(draft.highlights[0]?.note ?? "Indoor and outdoor amenities define how the building lives beyond the residence itself: wellness, service, gathering, privacy, and daily convenience.")}</p>
          <a href="/inquire/?project=${project.id}&interest=floorplans">Request amenity details <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-tile-grid brochure-tile-grid-six">
          ${amenityTiles.map((asset) => renderBrochureImageTile(asset, asset.title)).join("")}
        </div>
      </section>` : ""}

      ${hasTeam ? `<section class="brochure-module brochure-team-module" id="team-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">Design Team</p>
          <h2>The team behind the address.</h2>
          <p>${publicText(draft.team[0]?.note ?? "Project and design credits help buyers understand the architectural point of view, operational standard, and long-term ownership confidence behind each residence.")}</p>
          <a href="#project-resources-${project.id}">View the team <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-team-grid">
          ${teamTiles.map(renderBrochureTeamTile).join("")}
        </div>
      </section>` : ""}

      <section class="brochure-module brochure-location-module" id="location-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">The Neighborhood</p>
          <h2>${locationSectionTitle(project)}</h2>
          <p>${publicText(draft.locationCopy)}</p>
          <a href="/#atlas">Open full atlas <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-location-panel">
          <div
            class="project-google-map"
            data-project-google-map
            data-project-id="${project.id}"
            data-project-name="${publicText(project.name)}"
            data-latitude="${project.latitude}"
            data-longitude="${project.longitude}"
            aria-label="Google map centered on ${publicText(project.name)}"
          ></div>
          <ol>
            ${locationList(project).map((item) => `<li><span>${item.label}</span><strong>${item.time}</strong></li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="brochure-research-contact" id="project-resources-${project.id}">
        <div class="brochure-research-panel">
          <p class="eyebrow">Buyer Resources</p>
          <h2>${isCompactWatch ? "Track what is known, and what is not." : "Compare residences, floorplans, and next steps."}</h2>
          <p>${isCompactWatch ? "Planning and source-watch pages are intentionally lighter. Use them for status, location, sponsor signals, and related news, not as a promise of current availability." : "Access available floorplans, project details, and advisor guidance before you tour or reserve."}</p>
          <div class="brochure-download-list">
            ${draft.documents.map(renderProjectDocument).join("")}
            ${!isCompactWatch ? floorplanProject?.plans.slice(0, 4).map((plan, index) => renderGeneratedFloorplanLink(plan, floorplanProject, index)).join("") ?? "" : ""}
          </div>
          ${!isCompactWatch && floorplanProject ? `<a href="/floorplans/#floorplans-${floorplanProject.projectId}">View floorplan library <span aria-hidden="true">→</span></a>` : ""}
        </div>
        ${isCompactWatch ? renderEmailSignup(`project_${project.id}`, `Get updates on ${project.name}`, false, project) : `<form class="brochure-inquiry-card" action="mailto:${advisorProfile.email}" method="post" enctype="text/plain">
          <p class="eyebrow">Inquire</p>
          <h2>Request current availability</h2>
          <p>${shortBrookeCtaCopy}</p>
          <label><span>Name</span><input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>
          <label><span>Email</span><input name="email" type="email" autocomplete="email" placeholder="Email address" required /></label>
          <label><span>Phone</span><input name="phone" type="tel" autocomplete="tel" placeholder="Phone number" /></label>
          <label><span>Message</span><textarea name="message" placeholder="How can Brooke help?">${project.name} inquiry</textarea></label>
          <button type="submit">Request Current Availability</button>
        </form>`}
      </section>

      ${renderProjectMissingInfoPanel(project)}
      ${renderProjectRelatedNews(project)}

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
  const projectHeroImage = curatedProjectImage(project) ?? placedImportedImageForProject(project.id, "card") ?? project.heroImage ?? project.image;
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
  const approvedImportedGallery = approvedImportedImagesForProject(project.id).map((image) => ({
    src: importedImagePublicPath(image),
    kicker: image.imageType === "interior" ? "Interior Rendering" : image.imageType === "amenity" ? "Amenity Image" : image.imageType === "exterior" ? "Project Rendering" : "Developer Image",
    title: image.caption,
    alt: image.alt,
  }));
  return {
    kicker: project.corridor,
    title: project.name,
    intro: `${project.summary} This profile is refreshed from reviewed project materials, public records, and reputable reporting where available.`,
    image: projectHeroImage,
    imageAlt: `${project.name} project image`,
    stage: status,
    locationCopy: `${project.name} is tracked in the ${project.corridor} corridor. Compare it by delivery timing, price guidance, view exposure, floorplan depth, and the current buyer packet before touring.`,
    facts: factFields,
    team: teamCredits.length ? teamCredits : [
      { role: "Project Team", name: "Project team", note: "Current project and design credits should be confirmed with the latest buyer packet." },
      { role: "Advisory", name: advisorProfile.brokerage, note: "Buyer guidance is tailored around timing, preferred view, floorplan, and contract priorities." },
    ],
    highlights: [
      { label: "Buyer Fit", value: project.corridor, note: project.summary },
      { label: "Status", value: status, note: delivery },
      { label: "Pricing", value: pricing, note: "Request current availability, incentives, carrying costs, and contract terms before relying on any public figure." },
      { label: "Views", value: projectViewSummary(project), note: "Confirm exact stack, floor, exposure, and future view-corridor risk." },
    ],
    gallery: projectHeroImage
      ? [
          { src: projectHeroImage, mobileSrc: project.mobileImage, kicker: "Project Image", title: project.name, alt: `${project.name} project image` },
          ...approvedImportedGallery,
          { src: project.image ?? projectHeroImage, kicker: "Street Context", title: "Downtown context", alt: `${project.name} project preview` },
          { src: project.mobileImage ?? projectHeroImage, kicker: "Design", title: "Architectural detail", alt: `${project.name} design context` },
          ...(project.galleryImages ?? []),
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
  const roles = ["Project Sponsor", "Project Partner", "Architect", "Interior / Design", "Landscape / Construction", "Marketing"];
  return names.map((name, index) => ({
    role: roles[index] ?? "Project Team",
    name,
    note: "Team credit captured for buyer orientation; confirm final role and scope with current materials.",
  }));
}

function documentsFromSource(_project: FeaturedProject, sourceFact: ReturnType<typeof sourceFactForProject> | undefined): ProjectDocument[] {
  const docs: ProjectDocument[] = [];
  if (sourceFact?.officialWebsite || (sourceFact?.highValueSources ?? []).length) {
    docs.push({
      label: "Reviewed",
      title: "Project materials reviewed",
      note: "Detailed review notes are kept out of the buyer page; request the buyer packet for current details.",
    });
  }
  docs.push({ label: "Packet", title: "Request current packet", note: "Floorplans, pricing, availability, fees, and contract guidance" });
  return docs;
}

function neededFromSource(sourceFact: ReturnType<typeof sourceFactForProject> | undefined) {
  const conflicts = sourceFact?.conflicts?.map((item) => `Confirm detail: ${item}`) ?? [];
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
  if (project.id === "rosewood") return "Rosewood Residences West Palm Beach";
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
    { label: "Floorplans", value: project.id === "rosewood" ? "Not public" : floorplanCount ? `${floorplanCount} plans` : "On request" },
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
  const legacyGallery =
    project.id === "olara"
      ? [...featuredGallery, ...residenceGallery, ...amenityGallery]
      : [];
  const importedAssets = approvedImportedImagesForProject(project.id).map((image) => ({
    src: importedImagePublicPath(image),
    kicker: image.imageType === "interior" ? "Interior Rendering" : image.imageType === "amenity" ? "Amenity Image" : image.imageType === "exterior" ? "Project Rendering" : "Developer Image",
    title: image.caption,
    alt: image.alt,
  }));
  const assets = uniqueMediaAssets([...draft.gallery, ...legacyGallery, ...importedAssets]);
  if (draft.image && !assets.some((asset) => asset.src === draft.image)) {
    assets.unshift({ src: draft.image, kicker: "Project Image", title: draft.title, alt: draft.imageAlt });
  }
  return uniqueMediaAssets(assets);
}

function uniqueMediaAssets(assets: MediaAsset[]) {
  const seen = new Set<string>();
  return assets.filter((asset) => {
    if (!asset.src) return true;
    if (seen.has(asset.src)) return false;
    seen.add(asset.src);
    return true;
  });
}

function projectPlaceholderAsset(project: FeaturedProject, title: string, kicker = "Resource"): MediaAsset {
  return {
    src: "",
    kicker,
    title,
    alt: `${project.name} ${title}`,
  };
}

function projectBrochureAmenityTiles(project: FeaturedProject, draft: ProjectPageDraft) {
  const gallery = projectBrochureGallery(project, draft).filter((asset) => asset.src !== draft.image).slice(3);
  const labels =
    project.id === "rosewood"
      ? [
          "Indoor amenities reported",
          "Fifth-floor pool reported",
          "Parking count reported",
          "Rosewood branding reported",
          "Approval status pending",
          "Media rights pending",
        ]
      : ["Rooftop pool & sun deck", "Wellness studio", "Resident lounge", "Private dining", "Landscaped courtyard", "Concierge services"];
  return labels.map((label, index) => ({
    ...(gallery[index] ?? projectPlaceholderAsset(project, label, "Amenity")),
    title: label,
    kicker: "Amenity",
  }));
}

function projectBrochureTeamTiles(project: FeaturedProject, draft: ProjectPageDraft) {
  return draft.team.slice(0, 3).map((credit) => ({
    credit,
    asset: projectPlaceholderAsset(project, credit.role, "Project Team"),
  }));
}

function renderBrochureTeamTile(item: { credit: TeamCredit; asset?: MediaAsset }) {
  const logoAsset = teamLogoForCredit(item.credit.name);
  return `
    <article class="brochure-team-tile">
      ${logoAsset ? `<div class="brochure-team-logo">${renderMediaAsset(logoAsset, "feature")}</div>` : item.asset ? renderMediaAsset(item.asset, "feature") : ""}
      <div>
        <span>${publicText(item.credit.role)}</span>
        <strong>${publicText(item.credit.name)}</strong>
        <p>${publicText(item.credit.note)}</p>
      </div>
    </article>
  `;
}

function renderBrochureImageTile(asset: MediaAsset, label: string) {
  const sourceLabel = asset.src.includes("/media/imported/") ? ` · ${developerImageCredit()}` : "";
  return `
    <article class="brochure-image-tile">
      ${renderMediaAsset(asset, "feature")}
      <span>${label}${sourceLabel}</span>
    </article>
  `;
}

function developerImageCredit() {
  return "Image via project marketing materials";
}

function renderDeveloperImageDisclaimer() {
  return `
    <p class="media-disclaimer">Some project images and renderings are sourced from developer or project marketing materials and are shown for buyer reference. Availability, finishes, views, amenities, and project details should be verified before reliance.</p>
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
      <span>${publicText(document.label)}</span>
    <strong>${publicText(document.title)}</strong>
    <small>${publicText(document.note)}</small>
  `;

  if (!document.href) {
    return `<article class="document-card is-placeholder">${content}</article>`;
  }

  if (/^https?:\/\//i.test(document.href) || /\.pdf(?:$|[?#])/i.test(document.href)) {
    return `
      <a class="document-card" href="/inquire/?interest=availability">
        ${content}
      </a>
    `;
  }

  return `
    <a class="document-card" href="${document.href}">
      ${content}
    </a>
  `;
}

function renderProjectSnapshotPanel(projectId: string) {
  const floorplanProject = getFloorplanProject(projectId);
  const floorplanCount = floorplanProject?.count ?? 0;
  const isRosewood = projectId === "rosewood";
  return `
    <section class="asset-status-strip" aria-label="Project snapshot">
      <article>
        <span>Project Media</span>
        <strong>${isRosewood ? "User-provided rendering" : "Gallery available"}</strong>
        <small>${isRosewood ? "Renderings are used as project-specific visuals, not generic corridor imagery." : "Curated imagery, residence visuals, and location context for buyer review."}</small>
      </article>
      <article>
        <span>Floorplans</span>
        <strong>${isRosewood ? "Not public" : floorplanCount ? `${floorplanCount} plan records` : "Available on request"}</strong>
        <small>${isRosewood ? "No public Rosewood WPB floorplan packet has been found." : floorplanCount ? `Released plans and packet references are organized for quick comparison.` : "Request the current project packet for available plans."}</small>
      </article>
      <article>
        <span>Advisor</span>
        <strong>${advisorProfile.name}</strong>
        <small>${advisorProfile.brokerage} · ${advisorProfile.mobile}</small>
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
      <strong>${publicText(item)}</strong>
    </article>
  `;
}

function renderFloorplanLink(plan: { label: string; file: string; note?: string }, basePath = docsBase) {
  const href = `${basePath}floorplans/${plan.file}`;
  return `
    <button
      class="floorplan-link floorplan-link-button"
      type="button"
      data-floorplan-open
      data-floorplan-index="0"
      data-floorplan-title="${escapeHtml(plan.label)}"
      data-floorplan-project="Olara"
      data-floorplan-caption="${escapeHtml(plan.note ?? "Floorplan PDF preview")}"
      data-floorplan-src="${safeHref(href)}"
    >
      <span>${plan.label}</span>
      <small>${plan.note ?? "Floorplan PDF"}</small>
    </button>
  `;
}

function initFloorplanViewer() {
  const viewer = document.querySelector<HTMLElement>("[data-floorplan-viewer]");
  if (!viewer || viewer.dataset.ready === "true") return;
  viewer.dataset.ready = "true";
  const title = viewer.querySelector<HTMLElement>("[data-floorplan-title]");
  const project = viewer.querySelector<HTMLElement>("[data-floorplan-project]");
  const caption = viewer.querySelector<HTMLElement>("[data-floorplan-caption]");
  const frame = viewer.querySelector<HTMLElement>("[data-floorplan-frame]");
  let activeIndex = 0;

  const openButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>("[data-floorplan-open]"));
  const openAt = (index: number) => {
    const buttons = openButtons();
    const button = buttons[index];
    if (!button || !frame) return;
    activeIndex = index;
    const src = button.dataset.floorplanSrc || "";
    title?.replaceChildren(document.createTextNode(button.dataset.floorplanTitle || "Floor plan"));
    project?.replaceChildren(document.createTextNode(button.dataset.floorplanProject || "Floorplan preview"));
    caption?.replaceChildren(document.createTextNode(button.dataset.floorplanCaption || "Request the current packet before relying on plan availability."));
    frame.innerHTML = src
      ? `<iframe src="${safeHref(src)}" title="${escapeHtml(button.dataset.floorplanTitle || "Floorplan preview")}"></iframe>`
      : `<div class="floorplan-viewer-request"><strong>Request this plan through Brooke.</strong><p>The public source sends buyers outside the site, so the primary action here is to request the current packet and confirm the latest plan details.</p></div>`;
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-floorplan-viewer");
  };
  const close = () => {
    viewer.hidden = true;
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-floorplan-viewer");
  };

  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-floorplan-open]");
    if (button) {
      event.preventDefault();
      openAt(openButtons().indexOf(button));
      return;
    }
    if ((event.target as HTMLElement).closest("[data-floorplan-close]")) close();
    if ((event.target as HTMLElement).closest("[data-floorplan-prev]")) {
      const buttons = openButtons();
      openAt((activeIndex - 1 + buttons.length) % buttons.length);
    }
    if ((event.target as HTMLElement).closest("[data-floorplan-next]")) {
      const buttons = openButtons();
      openAt((activeIndex + 1) % buttons.length);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) close();
  });
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

  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-project-card]"));
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
