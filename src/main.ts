import "./style.css";
import {
  answerEngineFaq,
  floorplanLibrary,
  projectFacts,
  researchNewsFeed,
  siteMeta,
} from "./generated/siteData";
import { approvedFloorplanLibrary, type ApprovedFloorplanPlan, type ApprovedFloorplanProject } from "./data/floorplanApprovedLibrary";
import { editorProjectOverrides, type EditorProjectOverrides } from "./generated/editorOverrides";
import { renderEditorialImagePanel } from "./components/EditorialImagePanel";
import { newsSortTimestamp, publishedExternalNews, type ExternalNewsItem } from "./data/approvedExternalNews";
import { editorialImageForId, type EditorialImageId } from "./data/editorialImagery";
import { homeHeroImages } from "./data/homeHeroImages";
import {
  getApprovedProjectAssets,
  getProjectAsset,
  getProjectGalleryAsset,
  getProjectHeroAsset,
  type ProjectAsset,
  type ProjectAssetPlacement,
} from "./data/projectAssets";
import { batch1ProjectCopyByProjectId, loadBatch1ProjectCopyPackageSync, type ProjectCopyPackage } from "./data/projectCopyPackage";
import homepageOverridesRaw from "../content/overrides/homepage-overrides.json";
import homepageCardOverridesRaw from "../content/overrides/homepage-card-overrides.json";
import approvedImportedProjectImagesRaw from "./data/approvedImportedProjectImages.json";
import { marketNotes, type MarketNote } from "./data/marketNotes";
import { track } from "./lib/analytics";
import { advisorProfile, teamProfile } from "./lib/contact";
import { escapeHtml, safeHref } from "./renderUtils";
import { localIntelligence } from "./data/localIntelligence";
import { homepageAssets, homepageProjectCardImage } from "./data/homepageAssets";

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
  | { type: "corridors"; projectId?: undefined }
  | { type: "compare"; projectId?: undefined }
  | { type: "corridor"; corridorKey: CorridorKey; projectId?: undefined }
  | { type: "news"; projectId?: undefined }
  | { type: "news-detail"; articleId: string; projectId?: undefined }
  | { type: "market-notes"; projectId?: undefined }
  | { type: "market-note-detail"; articleSlug: string; projectId?: undefined }
  | { type: "downtown-spotlight"; projectId?: undefined }
  | { type: "about"; projectId?: undefined }
  | { type: "inquire"; projectId?: undefined }
  | { type: "floorplans"; projectId?: undefined }
  | { type: "answers"; projectId?: undefined }
  | { type: "answer-detail"; answerSlug: string; projectId?: undefined }
  | { type: "methodology"; projectId?: undefined }
  | { type: "privacy"; projectId?: undefined }
  | { type: "terms"; projectId?: undefined }
  | { type: "fair-housing"; projectId?: undefined }
  | { type: "project"; projectId: string };

type BuyerIntentAnswerPage = {
  slug: string;
  shortLabel: string;
  title: string;
  question: string;
  description: string;
  bluf: string;
  explanation: string;
  projectIds: string[];
  corridorKeys: CorridorKey[];
  tableRows: Array<{
    label: string;
    bestUse: string;
    links: string[];
    verify: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  sourceNotes: string[];
};

type AnswerTopicCard = {
  label: string;
  heading: string;
  description: string;
  href: string;
};

type AnswerTopicSection = AnswerTopicCard & {
  faqIds: string[];
  defaultOpen?: boolean;
};

type ProjectFilter = {
  key: string;
  label: string;
};

type ProjectFilterSelection = {
  corridor: string;
  status: string;
  floorplans: string;
};

type CorridorSection = {
  key: CorridorKey;
  label: string;
  detail: string;
  reviewNote: string;
  description: string;
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
  copyPackage?: ProjectCopyPackage;
};

type GoogleMapsNamespace = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => {
    fitBounds: (bounds: unknown, padding?: number) => void;
    setCenter: (center: { lat: number; lng: number }) => void;
    setZoom: (zoom: number) => void;
    addListener: (eventName: string, handler: () => void) => void;
  };
  LatLngBounds: new () => {
    extend: (position: { lat: number; lng: number }) => void;
  };
  SymbolPath: {
    CIRCLE: unknown;
  };
  Marker: new (options: Record<string, unknown>) => {
    addListener: (eventName: string, handler: () => void) => void;
    setMap: (map: unknown | null) => void;
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
};

type GoogleMarkerHandle = {
  clear: () => void;
};

type MapStatusFilter = "all" | "active" | "pipeline" | "completed";

const cleanProjectMapStyles: Record<string, unknown>[] = [
  { elementType: "geometry", stylers: [{ color: "#f3efe6" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3b4650" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f7f2e8" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text", stylers: [{ visibility: "on" }] },
  { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#ebe4d8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#dce4d4" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d7cec0" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#7b7468" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ded4c3" }] },
  { featureType: "road.highway", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b8d5df" }] },
  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] },
];

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
const fullTeamCtaCopy =
  "For guidance on West Palm Beach new construction - including how these buildings compare, which residences stand out, and what may fit your goals best - contact The Scott Gordon Group at Douglas Elliman Palm Beach for current pricing, floor plans, private comparison notes, and next steps.";
const shortTeamCtaCopy =
  "Need help comparing West Palm Beach new construction? Contact The Scott Gordon Group at Douglas Elliman Palm Beach.";
const aboutPageDescription =
  "Meet The Scott Gordon Group at Douglas Elliman, Palm Beach waterfront specialists guiding West Palm Beach new-construction buyers with decades of local experience.";

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
const southFlaglerMediaBase = "/projects/south-flagler-house/media/";
const albaMediaBase = "/projects/alba-palm-beach/media/";
const shorecrestMediaBase = "/projects/shorecrest/media/";
const banyanTreeUserCard = "/projects/banyan-tree/media/user-provided-banyan-tree-card.jpg";
const rosewoodRenderHero = "/projects/rosewood/media/user-provided-rosewood-render-01.jpg";
const rosewoodRenderVertical = "/projects/rosewood/media/user-provided-rosewood-render-02.jpg";
const laClaraHeroWide = "/projects/la-clara/media/la-clara-hero-3x2.jpg";
const laClaraHeroStandard = "/projects/la-clara/media/la-clara-hero-4x3.jpg";
const laClaraHeroPortrait = "/projects/la-clara/media/la-clara-hero-4x5.jpg";
const relatedRossLogo = "/team-logos/related-ross-logo.webp";
const arquitectonicaLogo = "/team-logos/arquitectonica-logo.webp";
const projectLogoImages: Record<string, { src: string; alt: string }> = {
  "alba-palm-beach": { src: `${albaMediaBase}logo.svg`, alt: "Alba Palm Beach logo" },
  "banyan-tree": { src: "/projects/banyan-tree/media/logo.png", alt: "Banyan Tree Residences West Palm Beach logo" },
  "forte-on-flagler": { src: "/projects/forte-on-flagler/media/logo.png", alt: "Forte on Flagler logo" },
  "mr-c": { src: "/projects/mr-c/media/logo.svg", alt: "Mr. C Hotel and Residences West Palm Beach logo" },
  olara: { src: "/projects/olara/media/logo.svg", alt: "Olara logo" },
  "ritz-carlton-wpb": { src: "/projects/ritz-carlton-wpb/media/ritz-logo.svg", alt: "The Ritz-Carlton Residences West Palm Beach logo" },
  shorecrest: { src: `${shorecrestMediaBase}logo.svg`, alt: "Shorecrest logo" },
  "south-flagler-house": { src: `${southFlaglerMediaBase}logo.svg`, alt: "South Flagler House logo" },
};
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const heroMapScriptId = "wpb-google-map-script";
const heroMapCallbackName = "__wpbGoogleMapsReady";
const mapFallbackTitle = "Map temporarily unavailable";
const mapFallbackBody =
  "The project map could not load. You can still compare buildings by corridor below, or contact The Scott Gordon Group for current project guidance.";
const buyerFriendlyMapFallback = `${mapFallbackTitle}. ${mapFallbackBody}`;
const HERO_ROTATION_INTERVAL_MS = 16000;
const HERO_FADE_DURATION_MS = 1800;
let googleMapsLoader: Promise<GoogleMapsNamespace> | null = null;

const staticRoutePaths: Record<string, string> = {
  "/buildings": "buildings",
  "/buildings/": "buildings",
  "/map": "map",
  "/map/": "map",
  "/corridors": "corridors",
  "/corridors/": "corridors",
  "/compare": "compare",
  "/compare/": "compare",
  "/floorplans/": "floorplans",
  "/floor-plans": "floorplans",
  "/answers/": "answers",
  "/updates": "news",
  "/updates/": "news",
  "/market-notes/": "market-notes",
  "/downtown-spotlight": "downtown-spotlight",
  "/downtown-spotlight/": "downtown-spotlight",
  "/blog/": "market-notes",
  "/guidance/": "market-notes",
  "/about": "about",
  "/about/": "about",
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
  "/corridors/downtown-west-palm-beach/": "downtown",
  "/corridors/downtown/": "downtown",
  "/corridors/south-flagler/": "south-flagler",
};

const baseFeaturedProjects: FeaturedProject[] = [
  {
    id: "olara",
    name: "Olara West Palm Beach",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "2027",
    deliveryYear: 2027,
    residences: "275",
    price: "$2M-$7.5M",
    href: "?project=olara",
    image: `${mediaBase}olara-hero-exterior-1536x1024.jpg`,
    summary: "North Flagler waterfront residences at 1919 N Flagler Drive with marina access, deep amenities, Jose Andres dining, and one of the most complete released floorplan packets in the market.",
    floorplans: true,
    pageState: "Active / Sales / Under Construction",
    rank: 1,
    longitude: -80.0501,
    latitude: 26.7307,
    address: "1919 N Flagler Drive, West Palm Beach, FL 33407",
  },
  {
    id: "ritz-carlton-wpb",
    name: "The Ritz-Carlton Residences, West Palm Beach",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "2028",
    deliveryYear: 2028,
    residences: "138",
    price: "$2.5M-$8M",
    href: "?project=ritz-carlton-wpb",
    image: `${ritzMediaBase}ritz-hero-waterfront-building-2200x1375.jpg`,
    summary: "A Ritz-Carlton branded North Flagler address with public-facing address at 1745 N Flagler Drive and legal parcel references preserved for review.",
    floorplans: true,
    pageState: "Active / Sales / Under Construction",
    rank: 2,
    longitude: -80.05057,
    latitude: 26.72848,
    address: "1745 N Flagler Drive, West Palm Beach, FL 33407",
  },
  {
    id: "shorecrest",
    name: "Shorecrest",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Active Sales / Under Construction",
    delivery: "Confirm with sales team",
    deliveryYear: 2027,
    residences: "98",
    price: "$3.69M-$5.445M for reviewed available residences",
    href: "?project=shorecrest",
    image: shorecrestUserCard,
    summary: "A Related Ross waterfront tower at 1865 N Flagler Drive for buyers comparing boutique floor plates, wellness, and North Flagler construction momentum.",
    floorplans: true,
    pageState: "Active / Sales / Under Construction",
    rank: 3,
    longitude: -80.05012,
    latitude: 26.72985,
    address: "1865 N Flagler Drive, West Palm Beach, FL 33407",
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
    price: "$7.98M-$70M",
    href: "?project=south-flagler-house",
    image: southFlaglerHouseUserCard,
    summary: "RAMSA-designed waterfront residences at 1355 S Flagler Drive, positioned for buyers who want South Flagler privacy, scale, and Palm Beach-facing orientation.",
    floorplans: true,
    pageState: "Active / Sales / Under Construction",
    rank: 4,
    longitude: -80.0511,
    latitude: 26.7011,
    address: "1355 S Flagler Drive, West Palm Beach, FL 33401",
  },
  {
    id: "nora-house",
    name: "Nora House",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Sales Launched / Pipeline",
    delivery: "2029",
    deliveryYear: 2029,
    residences: "117",
    price: "From low $2Ms",
    href: "?project=nora-house",
    image: noraHouseUserCard,
    summary: "Design-driven condominium living in the walkable Nora District, with rooftop wellness, social amenities, and ground-floor retail.",
    floorplans: false,
    pageState: "Active / Sales / Under Construction",
    rank: 5,
    longitude: -80.0581,
    latitude: 26.7178,
    address: "1105 N. Dixie Highway, West Palm Beach, FL 33401",
  },
  {
    id: "banyan-tree",
    name: "Banyan Tree Residences West Palm Beach",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Sales Open",
    delivery: "Projected 2028",
    deliveryYear: 2028,
    residences: "88",
    price: "From $1.9M",
    href: "?project=banyan-tree",
    image: banyanTreeUserCard,
    summary: "Banyan Group's first U.S. residential project brings a private, wellness-led hospitality experience to Downtown West Palm Beach, one block from CityPlace.",
    floorplans: true,
    pageState: "Active Sales / Preconstruction",
    rank: 6,
    longitude: -80.0553,
    latitude: 26.7069,
    address: "400 Hibiscus Street, West Palm Beach, FL 33401",
  },
  {
    id: "mr-c",
    name: "Mr. C Residences West Palm Beach",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Under Construction",
    delivery: "Confirm with sales team",
    deliveryYear: 2027,
    residences: "146",
    price: "Request current pricing",
    href: "?project=mr-c",
    image: "/projects/mr-c/media/mr-c-waterfront-building-source.jpg",
    summary: "A downtown Cipriani-branded hotel-residence tower at 327 Okeechobee Boulevard, with municipal address caveats kept out of primary display copy.",
    floorplans: true,
    pageState: "Active / Sales / Under Construction",
    rank: 7,
    longitude: -80.0578,
    latitude: 26.706,
    address: "327 Okeechobee Boulevard, West Palm Beach, FL 33401",
  },
  {
    id: "alba-palm-beach",
    name: "Alba Palm Beach",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "Spring 2026 estimated",
    deliveryYear: 2026,
    residences: "55",
    price: "$2.5M-$7.8M",
    href: "?project=alba-palm-beach",
    image: `${albaMediaBase}card.jpg`,
    summary: "A boutique 55-residence North Flagler waterfront building at 4714 N Flagler Drive for buyers who want new construction at a more intimate scale.",
    floorplans: true,
    pageState: "Active / Sales / Under Construction",
    rank: 8,
    longitude: -80.051,
    latitude: 26.7526,
    address: "4714 N. Flagler Drive, West Palm Beach, FL 33407",
  },
  {
    id: "berkeley",
    name: "The Berkeley Palm Beach",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Under Construction",
    delivery: "Confirm with sales team",
    deliveryYear: 2027,
    residences: "193",
    price: "$2M-$10M+",
    href: "?project=berkeley",
    image: "/projects/berkeley/media/card.jpg",
    summary: "A Clear Lake/downtown luxury project at 601-621 Clearwater Park Road for buyers comparing newer ownership near The Square, the convention-center edge, and the office core.",
    floorplans: false,
    pageState: "Active / Sales / Under Construction",
    rank: 9,
    longitude: -80.0642,
    latitude: 26.7087,
    address: "601-621 Clearwater Park Road, West Palm Beach, FL 33401",
  },
  {
    id: "maison-dor",
    name: "Maison d'Or",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Preconstruction / Details Emerging",
    delivery: "2028 reported",
    deliveryYear: 2028,
    residences: "39",
    price: "$5.7M+ reported",
    href: "?project=maison-dor",
    image: "/projects/maison-dor/media/card.jpg",
    summary: "A 39-residence South Flagler boutique project with emerging details; exact street number, floor count, and service program remain review items.",
    floorplans: false,
    pageState: "Active / Sales / Under Construction",
    rank: 10,
    longitude: -80.04927,
    latitude: 26.67787,
    address: "South Flagler Drive, West Palm Beach, FL",
  },
  {
    id: "edgeworth",
    name: "Edgeworth",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Announced / Pipeline",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "168",
    price: "$2.5M-$35.5M reported",
    href: "?project=edgeworth",
    image: "/projects/edgeworth-north/media/card.webp",
    summary: "A combined South Flagler pipeline project at 1155 S Flagler Drive, tracked as one Edgeworth entry until official materials require a tower split.",
    floorplans: false,
    pageState: "Pipeline / Announced / Watchlist",
    rank: 11,
    longitude: -80.0514,
    latitude: 26.6992,
    address: "1155 S Flagler Drive, West Palm Beach, FL",
  },
  {
    id: "mandarin-oriental",
    name: "Mandarin Oriental Residences West Palm Beach",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Sales Open",
    delivery: "Anticipated 2031",
    deliveryYear: 2031,
    residences: "87",
    price: "From $3.5M",
    href: "?project=mandarin-oriental",
    image: "/projects/mandarin-oriental/media/showcase/mandarin-oriental-hero-waterfront-web.jpg",
    summary: "An 87-residence Mandarin Oriental waterfront tower on North Flagler with Safdie architecture, private terraces, and a 2031 delivery horizon.",
    floorplans: true,
    pageState: "Pipeline / Announced / Watchlist",
    rank: 12,
    longitude: -80.0516,
    latitude: 26.759,
    address: "5400 N Flagler Drive, West Palm Beach, FL 33407",
  },
  {
    id: "alba-reserve",
    name: "Alba Reserve",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Reported / Proposed",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "87",
    price: "Not released",
    href: "?project=alba-reserve",
    image: "/projects/alba-reserve/media/card.jpg",
    summary: "A reported/proposed North Flagler watchlist project at 4720 N Flagler Drive, kept separate from Mandarin Oriental unless official sources prove otherwise.",
    floorplans: false,
    pageState: "Pipeline / Announced / Watchlist",
    rank: 13,
    longitude: -80.051,
    latitude: 26.7535,
    address: "4720 N Flagler Drive, West Palm Beach, FL",
  },
  {
    id: "forte-on-flagler",
    name: "Forte on Flagler",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Completed Comp",
    delivery: "Completed comp",
    deliveryYear: 2024,
    residences: "41",
    price: "Resale inventory varies",
    href: "?project=forte-on-flagler",
    image: "/projects/forte-on-flagler/media/card.jpg",
    summary: "A completed South Flagler luxury comp at 1309 S Flagler Drive, used as a benchmark rather than active preconstruction inventory.",
    floorplans: true,
    pageState: "Completed Luxury Comp",
    rank: 14,
    longitude: -80.0509,
    latitude: 26.7019,
    address: "1309 S Flagler Drive, West Palm Beach, FL",
  },
  {
    id: "la-clara",
    name: "La Clara",
    corridor: "South Flagler",
    corridorKey: "south-flagler",
    status: "Completed",
    delivery: "Completed 2023",
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
    summary: "A completed South Flagler luxury comp at 1515 S Flagler Drive for benchmarking finished waterfront product and resale alternatives.",
    floorplans: true,
    pageState: "Completed Luxury Comp",
    rank: 15,
    longitude: -80.0511,
    latitude: 26.6993,
    address: "1515 S Flagler Drive, West Palm Beach, FL",
  },
  {
    id: "fern-and-gardenia-related-ross-fern-street",
    name: "Fern & Gardenia / Related Ross Fern Street Project",
    corridor: "Downtown",
    corridorKey: "downtown",
    status: "Pipeline / Watchlist",
    delivery: "Pipeline watch",
    deliveryYear: 2029,
    residences: "100-130 proposed",
    price: "Not released",
    href: "?project=fern-and-gardenia-related-ross-fern-street",
    image: "/projects/related-ross-fern-street/media/card.jpg",
    summary: "Fern & Gardenia / Related Ross Fern Street is a Downtown pipeline entry for the reported condo repositioning at 401 S Dixie Highway and Fern Street parcels.",
    floorplans: false,
    pageState: "Pipeline / Announced / Watchlist",
    rank: 17,
    longitude: -80.0555,
    latitude: 26.7112,
    address: "430-464 Fern St",
  },
  {
    id: "rosewood-residences-west-palm-beach",
    name: "Rosewood Residences West Palm Beach",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Pipeline / Branded Residences",
    delivery: "Timing not released",
    deliveryYear: 2029,
    residences: "90",
    price: "Not released",
    href: "?project=rosewood-residences-west-palm-beach",
    image: rosewoodRenderHero,
    heroImage: rosewoodRenderHero,
    mobileImage: rosewoodRenderVertical,
    summary: "Rosewood Residences West Palm Beach is a North Flagler branded-residence pipeline entry at 2001 N Flagler Drive with human review required until official sales materials are public.",
    floorplans: false,
    pageState: "Pipeline / Announced / Watchlist",
    rank: 18,
    longitude: -80.05005,
    latitude: 26.73135,
    address: "2001 N Flagler Drive, West Palm Beach, FL",
  },
  {
    id: "rybovich-marina-redevelopment",
    name: "Rybovich Marina Redevelopment",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Pipeline / Planning Approved",
    delivery: "Pipeline watch",
    deliveryYear: 2030,
    residences: "Up to 660 planned",
    price: "Not released",
    href: "?project=rybovich-marina-redevelopment",
    image: "/projects/rybovich-marina/media/showcase/rybovich-marina-hero-main-v01-web.jpg",
    summary: "Rybovich Marina Redevelopment is a planned 19-acre North Flagler waterfront district with residential towers, marina context, private club space, retail, restaurants, office, crew amenities, and an Intracoastal promenade.",
    floorplans: false,
    pageState: "Pipeline / Announced / Watchlist",
    rank: 19,
    longitude: -80.0506,
    latitude: 26.7461,
    address: "4000-4300 N Flagler Dr",
  },
];

const projectFactById = new Map(projectFacts.map((project) => [project.projectId, project]));
const featuredProjects = enhanceProjectIdentity(applyEditorProjectOverrides(applySourceFactsToProjects(baseFeaturedProjects), editorProjectOverrides));
const approvedFloorplanProjectIds = new Set<string>(approvedFloorplanLibrary.map((project) => project.projectId));
const floorplanHubProjects: ApprovedFloorplanProject[] = [
  ...approvedFloorplanLibrary,
  ...featuredProjects
    .filter((project) => !approvedFloorplanProjectIds.has(project.id))
    .map((project) => ({
      projectId: project.id,
      name: project.name,
      area: project.corridor,
      count: 0,
      plans: [],
    })),
];
const rankedFeaturedProjects = [...featuredProjects].sort((a, b) => a.rank - b.rank);
const homepageFeaturedProjectIds = ["alba-palm-beach", "olara", "shorecrest", "ritz-carlton-wpb", "south-flagler-house", "banyan-tree"] as const;
const homepageFeaturedProjects = homepageFeaturedProjectIds
  .map((projectId) => rankedFeaturedProjects.find((project) => project.id === projectId))
  .filter((project): project is FeaturedProject => Boolean(project));
const homepageCorridorKeys: CorridorKey[] = ["north-flagler", "south-flagler", "downtown"];
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
  if (projectId === "banyan-tree") return "88";
  if (projectId === "south-flagler-house") return "108";
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
  if (/high \$1M/i.test(value) && /low \$2M/i.test(value)) return "High $1Ms to low $2Ms";
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
  { key: "north-flagler", label: "North Flagler" },
  { key: "south-flagler", label: "South Flagler" },
  { key: "downtown", label: "Downtown" },
  { key: "active-sales", label: "Active Sales" },
  { key: "waterfront", label: "Waterfront" },
  { key: "under-construction", label: "Under Construction" },
  { key: "announced-planned", label: "Announced / Planned" },
  { key: "completed-opportunities", label: "Completed Opportunities" },
  { key: "floorplans", label: "Floor Plans" },
];

const projectCorridorFilters: ProjectFilter[] = [
  { key: "all", label: "All Corridors" },
  { key: "north-flagler", label: "North Flagler" },
  { key: "south-flagler", label: "South Flagler" },
  { key: "downtown", label: "Downtown" },
];

const projectStatusFilters: ProjectFilter[] = [
  { key: "all", label: "All Statuses" },
  { key: "active-sales", label: "Active Sales" },
  { key: "under-construction", label: "Under Construction" },
  { key: "announced-planned", label: "Announced / Planned" },
  { key: "completed-opportunities", label: "Completed Opportunities" },
];

const projectFloorplanFilters: ProjectFilter[] = [
  { key: "all", label: "Any Floorplans" },
  { key: "floorplans", label: "Floorplans Available" },
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
      "North Flagler is one of West Palm Beach's most active new-construction corridors, with waterfront sites, marina-oriented amenities, and several projects reshaping the area north of downtown. Buyers should compare building scale, view orientation, water access, walkability, and the surrounding redevelopment timeline.",
  },
  {
    key: "downtown",
    label: "Downtown",
    detail: "NORA House, Mr. C",
    reviewNote: "Urban lifestyle corridor where hotel-branded and district projects need current availability checks.",
    description:
      "Downtown is the most walkable new-construction setting in West Palm Beach, appealing to buyers who want restaurants, retail, arts venues, Brightline access, and everyday convenience close by. Buyers should compare privacy, parking, noise, views, and access to the city's cultural and commercial anchors.",
  },
  {
    key: "south-flagler",
    label: "South Flagler",
    detail: "South Flagler House",
    reviewNote: "Southern waterfront benchmark for buyers comparing scale, privacy, and Palm Beach proximity.",
    description:
      "South Flagler is an established luxury waterfront corridor known for its proximity to Palm Beach Island and broad Intracoastal views. Buyers typically compare architecture, residence size, privacy, service, and whether a completed building or new launch better fits the ownership plan.",
  },
];

const buyerIntentAnswerPages: BuyerIntentAnswerPage[] = [
  {
    slug: "best-new-construction-condos-west-palm-beach",
    shortLabel: "Best condos",
    title: "Best New Construction Condos in West Palm Beach",
    question: "What are the best new construction condos in West Palm Beach?",
    description: "A buyer-first answer for comparing West Palm Beach new-construction condo options by corridor, readiness, floorplan depth, and verification needs.",
    bluf:
      "The best West Palm Beach new-construction condo depends on the buyer's corridor, timing, floorplan needs, and risk tolerance. Start with Olara, Ritz-Carlton, Shorecrest, Alba, South Flagler House, NORA House, Mr. C, The Berkeley, Forté, and Maison d'Or, then verify live pricing, availability, fees, and contract terms.",
    explanation:
      "Use this as a shortlist framework, not a ranking. The useful question is which building fits the buyer's daily life and due-diligence profile: waterfront versus walkability, active sales versus pipeline watch, released plans versus request-only material, and whether current documents support the claim.",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach", "south-flagler-house", "nora-house", "mr-c", "berkeley", "forte-on-flagler", "maison-dor"],
    corridorKeys: ["north-flagler", "downtown", "south-flagler"],
    tableRows: [
      { label: "North Flagler waterfront shortlist", bestUse: "Buyers comparing the deepest active waterfront set.", links: ["/corridors/north-flagler/", "/projects/olara/", "/projects/ritz-carlton-wpb/", "/projects/shorecrest/"], verify: "Confirm stack, floor, exposure, current inventory, and delivery language." },
      { label: "Downtown walkability shortlist", bestUse: "Buyers prioritizing restaurants, NORA, The Square, and urban convenience.", links: ["/corridors/downtown-west-palm-beach/", "/projects/nora-house/", "/projects/mr-c/", "/projects/berkeley/"], verify: "Confirm parking, district phasing, noise, fees, and current packet availability." },
      { label: "South Flagler privacy shortlist", bestUse: "Buyers seeking quieter waterfront positioning and Palm Beach proximity.", links: ["/corridors/south-flagler/", "/projects/south-flagler-house/", "/projects/maison-dor/", "/projects/forte-on-flagler/"], verify: "Confirm current availability, association costs, delivery timing, and resale/new-construction tradeoffs." },
    ],
    faqs: [
      { question: "Is there one best new construction condo in West Palm Beach?", answer: "No. The best building changes by budget, timing, desired corridor, floorplan, service expectations, and current inventory. Use the comparison page, then request current buyer documents before making decisions." },
      { question: "Which pages should buyers compare first?", answer: "Start with the corridor pages, the comparison page, and the individual project pages for the buildings that match the buyer's lifestyle lane." },
    ],
    sourceNotes: ["Project facts and floorplan availability come from the existing WPB New Construction source catalog.", "Pricing, incentives, fees, and availability are intentionally treated as verification items."],
  },
  {
    slug: "closest-new-condos-to-palm-beach",
    shortLabel: "Palm Beach",
    title: "Which West Palm Beach New Condos Are Closest to Palm Beach?",
    question: "Which West Palm Beach new condos are closest to Palm Beach?",
    description: "A corridor-based answer for buyers comparing West Palm Beach new-construction condos by Palm Beach proximity and verification needs.",
    bluf:
      "Start with the Flagler Drive corridors when Palm Beach proximity matters. South Flagler and North Flagler projects are the primary comparison lanes, but buyers should verify exact bridge access, drive pattern, exposure, parking, and current availability before relying on a proximity claim.",
    explanation:
      "This page avoids ranking buildings by exact distance because buyer experience depends on the route, bridge, traffic, tower position, parking, and the unit itself. Use the corridor pages to narrow the lane, then confirm current packet details before touring.",
    projectIds: ["south-flagler-house", "maison-dor", "forte-on-flagler", "olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach"],
    corridorKeys: ["south-flagler", "north-flagler"],
    tableRows: [
      { label: "South Flagler", bestUse: "Quieter waterfront positioning south of downtown.", links: ["/corridors/south-flagler/", "/projects/south-flagler-house/", "/projects/maison-dor/"], verify: "Confirm Palm Beach route, current inventory, association costs, and delivery timing." },
      { label: "North Flagler", bestUse: "Waterfront comparison with more active project depth.", links: ["/corridors/north-flagler/", "/projects/olara/", "/projects/ritz-carlton-wpb/", "/projects/shorecrest/"], verify: "Confirm bridge pattern, stack exposure, construction context, and current packet details." },
    ],
    faqs: [
      { question: "Can a public page confirm the closest building to Palm Beach?", answer: "It can orient the buyer by corridor, but exact convenience should be verified with the current address, route, parking plan, bridge access, and buyer schedule." },
      { question: "Should Downtown projects be excluded?", answer: "No. Downtown projects can still fit buyers who value restaurants and walkability more than Flagler Drive waterfront positioning." },
    ],
    sourceNotes: ["Corridor assignments come from the existing project fact layer.", "Exact proximity, commute time, and route convenience should be verified for the buyer's routine."],
  },
  {
    slug: "north-flagler-vs-south-flagler-new-condos",
    shortLabel: "Flagler lanes",
    title: "North Flagler vs South Flagler New Condos",
    question: "How should buyers compare North Flagler vs South Flagler new condos?",
    description: "A buyer guide to comparing North Flagler and South Flagler new-construction condo corridors in West Palm Beach.",
    bluf:
      "North Flagler is the broader active waterfront comparison set; South Flagler is the quieter, more residential lane. Compare them by lifestyle, delivery timing, floorplan release depth, Palm Beach access, and current buyer packet details rather than by headline marketing copy.",
    explanation:
      "Both corridors can serve waterfront buyers, but they do different jobs. North Flagler usually creates more side-by-side choices; South Flagler is useful for buyers who want a calmer residential feel and are comparing new launches against delivered South Flagler benchmarks.",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach", "south-flagler-house", "maison-dor", "forte-on-flagler"],
    corridorKeys: ["north-flagler", "south-flagler"],
    tableRows: [
      { label: "North Flagler", bestUse: "Deeper active waterfront shortlist.", links: ["/corridors/north-flagler/", "/projects/olara/", "/projects/ritz-carlton-wpb/", "/projects/shorecrest/"], verify: "Confirm current project status, delivery language, released plans, view stack, and fees." },
      { label: "South Flagler", bestUse: "Quieter waterfront lane and delivered-building benchmarks.", links: ["/corridors/south-flagler/", "/projects/south-flagler-house/", "/projects/maison-dor/", "/projects/forte-on-flagler/"], verify: "Confirm availability, association costs, delivery timing, and resale/new-construction alternatives." },
    ],
    faqs: [
      { question: "Is North Flagler better than South Flagler?", answer: "Not universally. North Flagler is better for a broad active waterfront comparison, while South Flagler may fit buyers who want quieter positioning and Palm Beach proximity." },
      { question: "What should buyers verify in both corridors?", answer: "Verify current pricing, availability, fees, stack, exposure, parking, delivery timing, and whether the public floorplan is still current." },
    ],
    sourceNotes: ["Corridor framing follows the existing corridor pages and project fact layer.", "Changing buyer-sensitive details are handled as verification items."],
  },
  {
    slug: "downtown-vs-waterfront-new-construction-condos",
    shortLabel: "Downtown vs water",
    title: "Downtown West Palm Beach vs Waterfront New Construction Condos",
    question: "How should buyers compare Downtown West Palm Beach vs waterfront new construction condos?",
    description: "A buyer-facing comparison of Downtown West Palm Beach condo projects and Flagler Drive waterfront new construction.",
    bluf:
      "Downtown is the walkability and district-energy choice; Flagler Drive is the waterfront comparison. Buyers should decide which daily life matters more, then verify parking, fees, views, stack, current availability, and floorplan packet details before comparing prices.",
    explanation:
      "Downtown projects are often evaluated through restaurants, NORA, The Square, hotel-style service, and car-light convenience. Waterfront projects are usually evaluated through exposure, tower position, privacy, service, and how the building relates to Palm Beach and the Intracoastal.",
    projectIds: ["nora-house", "mr-c", "berkeley", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house"],
    corridorKeys: ["downtown", "north-flagler", "south-flagler"],
    tableRows: [
      { label: "Downtown", bestUse: "Walkability, restaurants, NORA, The Square, and district energy.", links: ["/corridors/downtown-west-palm-beach/", "/projects/nora-house/", "/projects/mr-c/", "/projects/berkeley/"], verify: "Confirm parking, noise, fees, district phasing, and current availability." },
      { label: "Waterfront corridors", bestUse: "Intracoastal/Palm Beach orientation and quieter residential positioning.", links: ["/corridors/north-flagler/", "/corridors/south-flagler/", "/compare/"], verify: "Confirm stack, floor, exposure, construction context, fees, and current packet details." },
    ],
    faqs: [
      { question: "Should a buyer choose Downtown or waterfront first?", answer: "Choose the daily-life lane first. Downtown is about walkability and district access; waterfront is about exposure, privacy, and Flagler Drive positioning." },
      { question: "Can Downtown projects still have strong lifestyle fit?", answer: "Yes. They may be the stronger fit for buyers who value restaurants, service, and walkability more than waterfront positioning." },
    ],
    sourceNotes: ["Downtown and waterfront comparisons use existing corridor assignments.", "Unit-level views and exact costs require current project documents."],
  },
  {
    slug: "compare-floor-plans-west-palm-beach-new-construction-condos",
    shortLabel: "Floorplans",
    title: "How to Compare Floor Plans in West Palm Beach New Construction Condos",
    question: "How should buyers compare floor plans in West Palm Beach new construction condos?",
    description: "A practical buyer answer for comparing West Palm Beach new-construction condo floor plans, stacks, exposure, and current packet details.",
    bluf:
      "Compare floor plans by line, stack, exposure, usable layout, terrace, parking, storage, fees, and whether the plan is still available. Public PDFs are only a starting point; the current buyer packet should control availability, pricing, and contractable details.",
    explanation:
      "A floorplan that looks similar online can live very differently by floor, exposure, view corridor, ceiling condition, terrace depth, elevator location, parking assignment, and release phase. Use the floorplan library to orient, then request current project documents.",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "nora-house", "mr-c", "berkeley", "maison-dor"],
    corridorKeys: ["north-flagler", "downtown", "south-flagler"],
    tableRows: [
      { label: "Plan availability", bestUse: "Separating released plans from request-only material.", links: ["/floorplans/", "/compare/"], verify: "Ask whether the plan is still contractable and what release phase it belongs to." },
      { label: "Stack and exposure", bestUse: "Understanding light, privacy, and future view risk.", links: ["/market-notes/why-published-floor-plans-matter/", "/inquire/"], verify: "Confirm stack plan, floor height, neighboring projects, and exposure." },
      { label: "Monthly ownership fit", bestUse: "Comparing the real cost beyond layout.", links: ["/answers/west-palm-beach-new-construction-condo-fees-verify/", "/inquire/"], verify: "Confirm association estimates, reserves, parking, storage, and service charges." },
    ],
    faqs: [
      { question: "Are public floorplan PDFs enough to choose a residence?", answer: "No. They are useful for orientation, but buyers should verify current availability, stack, exposure, fees, and contract terms." },
      { question: "Which page should buyers use first?", answer: "Start with the floorplan library, then compare the project page and request the current buyer packet." },
    ],
    sourceNotes: ["Floorplan counts and links come from the existing floorplan library.", "Availability and pricing are intentionally deferred to current project packets."],
  },
  {
    slug: "west-palm-beach-new-construction-condo-fees-verify",
    shortLabel: "Fees",
    title: "West Palm Beach New Construction Condo Fees: What Buyers Should Verify",
    question: "What fees should buyers verify in West Palm Beach new construction condos?",
    description: "A cautious buyer checklist for West Palm Beach new-construction condo fees, carrying costs, and association questions.",
    bluf:
      "Before relying on any public fee estimate, buyers should verify association dues, reserves, insurance assumptions, parking, storage, service charges, utilities, closing costs, deposits, and what is included. Fees change and should be confirmed from current offering or buyer packet materials.",
    explanation:
      "Fee comparisons are fragile because buildings differ by service model, staffing, amenities, insurance assumptions, reserves, parking, storage, and what is included in the monthly estimate. Treat public numbers as orientation only.",
    projectIds: ["olara", "ritz-carlton-wpb", "south-flagler-house", "nora-house", "mr-c", "berkeley"],
    corridorKeys: ["north-flagler", "downtown", "south-flagler"],
    tableRows: [
      { label: "Monthly association dues", bestUse: "Baseline ownership comparison.", links: ["/compare/", "/inquire/"], verify: "Confirm current estimate, included services, reserves, and insurance assumptions." },
      { label: "Parking and storage", bestUse: "Finding hidden ownership or convenience differences.", links: ["/inquire/"], verify: "Confirm included spaces, optional spaces, storage, valet, and assignment rules." },
      { label: "Service model", bestUse: "Comparing branded, hotel-style, and boutique operating costs.", links: ["/corridors/downtown-west-palm-beach/", "/corridors/north-flagler/"], verify: "Confirm staffing, hospitality services, amenity rules, and optional charges." },
    ],
    faqs: [
      { question: "Can fees be compared from public marketing pages?", answer: "Only cautiously. Public estimates can lag current documents and may not include all buyer-specific costs." },
      { question: "What should be requested before touring?", answer: "Ask for current estimated monthly costs, reserves, parking/storage details, deposit schedule, and what services are included." },
    ],
    sourceNotes: ["This page is a verification checklist, not a fee quote.", "Current costs should come from offering documents, project packets, or buyer-side confirmation."],
  },
  {
    slug: "preconstruction-vs-completed-new-construction-condos-west-palm-beach",
    shortLabel: "Pre vs done",
    title: "Preconstruction vs Completed New Construction Condos in West Palm Beach",
    question: "How should buyers compare preconstruction vs completed new construction condos in West Palm Beach?",
    description: "A buyer guide to comparing preconstruction, under-construction, pipeline, and completed/newly delivered West Palm Beach condo options.",
    bluf:
      "Preconstruction may offer selection and new-building upside, while completed or recently delivered condos offer more physical certainty. Compare timing, deposit structure, construction risk, available floorplans, fee clarity, resale alternatives, and what can be inspected before making a purchase decision.",
    explanation:
      "The right choice depends on the buyer's timeline and risk tolerance. Active projects, pipeline projects, and completed benchmarks should not be treated as the same decision until documents, availability, fees, and delivery assumptions are verified.",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house", "forte-on-flagler", "la-clara", "maison-dor"],
    corridorKeys: ["north-flagler", "south-flagler"],
    tableRows: [
      { label: "Preconstruction / under construction", bestUse: "Buyers who can wait and want current launch or construction-stage options.", links: ["/compare/", "/projects/olara/", "/projects/ritz-carlton-wpb/"], verify: "Confirm delivery timing, deposits, contract terms, construction status, and current availability." },
      { label: "Completed / recently delivered", bestUse: "Buyers who want to inspect the building or compare against existing inventory.", links: ["/projects/forte-on-flagler/", "/projects/la-clara/"], verify: "Confirm resale inventory, fees, reserves, condition, and association documents." },
      { label: "Pipeline watch", bestUse: "Buyers tracking future supply but not ready to rely on unreleased details.", links: ["/market-notes/active-sales-vs-pipeline-watch/", "/corridors/north-flagler/"], verify: "Confirm approvals, launch timing, official packets, and whether buyer-ready materials exist." },
    ],
    faqs: [
      { question: "Is preconstruction safer than resale?", answer: "Not automatically. It may offer selection and new-building appeal, but buyers should verify timing, contracts, deposits, and completion risk." },
      { question: "When should completed buildings be compared?", answer: "Use completed or recently delivered buildings as reality checks for finishes, fees, building operations, and resale alternatives." },
    ],
    sourceNotes: ["Project status comes from the existing project fact layer.", "Contract, deposit, and delivery details require current documents."],
  },
  {
    slug: "strongest-lifestyle-fit-west-palm-beach-new-condos",
    shortLabel: "Lifestyle fit",
    title: "Which West Palm Beach New Condos Have the Strongest Lifestyle Fit for Buyers?",
    question: "Which West Palm Beach new condos have the strongest lifestyle fit for buyers?",
    description: "A buyer-lifestyle answer for comparing West Palm Beach new-construction condos by corridor, daily routine, service model, and verification needs.",
    bluf:
      "The strongest lifestyle fit depends on daily routine: North Flagler for waterfront comparison depth, Downtown for walkability and district energy, and South Flagler for quieter residential positioning. Start with lifestyle lane first, then verify current pricing, availability, fees, floorplans, and service details.",
    explanation:
      "Lifestyle fit is not just amenities. It is how the building works with a buyer's commute, dining habits, Palm Beach access, waterfront preference, privacy expectations, parking needs, service model, and tolerance for construction timing.",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "nora-house", "mr-c", "berkeley", "south-flagler-house", "maison-dor", "forte-on-flagler"],
    corridorKeys: ["north-flagler", "downtown", "south-flagler"],
    tableRows: [
      { label: "Waterfront and service-led lifestyle", bestUse: "Buyers comparing Flagler Drive, Palm Beach proximity, and larger luxury project programs.", links: ["/corridors/north-flagler/", "/projects/olara/", "/projects/ritz-carlton-wpb/"], verify: "Confirm actual services, amenity access, fees, and unit exposure." },
      { label: "Walkability and district lifestyle", bestUse: "Buyers who want restaurants, NORA, The Square, and urban convenience.", links: ["/corridors/downtown-west-palm-beach/", "/projects/nora-house/", "/projects/mr-c/"], verify: "Confirm parking, noise, district phasing, and association costs." },
      { label: "Quiet waterfront lifestyle", bestUse: "Buyers who prefer a calmer residential waterfront lane.", links: ["/corridors/south-flagler/", "/projects/south-flagler-house/", "/projects/maison-dor/"], verify: "Confirm availability, fees, privacy, view exposure, and delivery timing." },
    ],
    faqs: [
      { question: "Are amenities the same as lifestyle fit?", answer: "No. Amenities matter only if the buyer will use them and the operating costs, rules, and service model fit the ownership plan." },
      { question: "How should buyers choose the first tour list?", answer: "Pick one corridor lane, compare two or three buildings in that lane, then request current packet details before touring." },
    ],
    sourceNotes: ["Lifestyle framing uses existing corridor and project positioning.", "Amenity and service claims should be verified in current project materials."],
  },
];

const answerTopicSections: AnswerTopicSection[] = [
  {
    label: "Buying Process",
    heading: "What changes when the building is not finished yet?",
    description: "Start here for timing, active sales, pipeline projects, and what to confirm before a tour.",
    href: "#qa-buying-process",
    defaultOpen: true,
    faqIds: [
      "where-should-buyers-start",
      "available-new-construction-condos",
      "active-sales-vs-future-projects",
      "when-will-projects-be-ready",
      "which-are-actually-under-construction",
      "delivery-timeline-risk",
      "pipeline-projects-watch-list",
    ],
  },
  {
    label: "Pricing + Availability",
    heading: "Which numbers need current confirmation?",
    description: "Use this lane for public pricing, availability reliability, and the numbers that need current confirmation.",
    href: "#qa-pricing-deposits",
    faqIds: [
      "what-will-it-cost",
      "pricing-availability-reliability",
    ],
  },
  {
    label: "Buildings + Services",
    heading: "How do amenities, brands, and service models compare?",
    description: "Compare branded residences, service models, amenities, wellness, private dining, and daily ownership features.",
    href: "#qa-buildings-services",
    faqIds: [
      "which-projects-feel-most-service-driven",
      "branded-residences-worth-it",
      "wellness-amenity-comparison",
      "private-dining-and-entertaining",
      "how-to-read-amenity-lists",
      "residence-features-that-matter",
      "guest-suites-family-amenities",
      "work-from-home-business-spaces",
      "pet-and-home-management",
    ],
  },
  {
    label: "Neighborhood Fit",
    heading: "North Flagler, Downtown, or South Flagler?",
    description: "Choose a lane by waterfront, walkability, Palm Beach proximity, views, boating, and downtown access.",
    href: "#qa-neighborhood-fit",
    faqIds: [
      "north-flagler-vs-downtown-vs-south-flagler",
      "north-flagler-projects",
      "north-flagler-comparison-set",
      "south-flagler-buyer-profile",
      "downtown-walkability-buyer",
      "near-square-downtown-nora",
      "closest-to-palm-beach",
      "waterfront-vs-walkable",
      "which-offer-water-views",
      "view-corridor-evaluation",
      "which-projects-have-marina-or-boating",
      "oceanfront-vs-intracoastal",
      "waterfront-vs-palm-beach-oceanfront",
    ],
  },
  {
    label: "Floorplans + Fit",
    heading: "Which residences are actually worth comparing?",
    description: "Focus on floorplan depth, stack, exposure, scale, resale benchmarks, and the final shortlist.",
    href: "#qa-floorplans-fit",
    faqIds: [
      "which-projects-have-floorplans",
      "published-floor-plan-projects",
      "stories-and-residence-counts",
      "boutique-vs-large-scale",
      "resale-benchmark-projects",
      "compare-olara-and-shorecrest",
    ],
  },
  {
    label: "Advisor Review",
    heading: "What should be requested before a serious comparison?",
    description: "Bring the shortlist back to current documents, team review, and buyer-specific next steps.",
    href: "#qa-advisor-review",
    faqIds: [
      "what-documents-to-request",
      "request-current-availability",
      "what-to-confirm-before-touring",
      "before-sales-gallery",
      "how-to-choose-final-shortlist",
    ],
  },
];

const answerTopicCards: AnswerTopicCard[] = answerTopicSections.map(({ label, heading, description, href }) => ({
  label,
  heading,
  description,
  href,
}));

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
    role: "Development Lead",
    name: "Savanna",
    note: "Developer execution, timing, and operations support the amenity promise.",
  },
  {
    role: "Architect",
    name: "Arquitectonica",
    note: "Tower orientation, arrival, balconies, and views start here.",
  },
  {
    role: "Interior Designer",
    name: "Gabellini Sheppard",
    note: "Residences and amenities need to feel warm, usable, and residential.",
  },
  {
    role: "Landscape Architect",
    name: "EDSA",
    note: "Pool, marina, garden, and arrival spaces shape daily life.",
  },
  {
    role: "Construction",
    name: "SavCon + Gilbane",
    note: "Schedule confidence and execution quality.",
  },
  {
    role: "Restaurant Partner",
    name: "Jose Andres Group",
    note: "Olara's lifestyle pitch is more social and food-driven.",
  },
  {
    role: "Sales And Marketing",
    name: "Compass DMG",
    note: "Confirm releases, fees, and appointment protocol.",
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
    role: "Development Lead",
    name: "Related Group",
    note: "Who they are: a Miami-based condominium developer with a long Florida luxury-residential track record. Why it matters for buyers: sponsor experience matters when evaluating execution, delivery, and resale confidence.",
  },
  {
    role: "Development Partner",
    name: "BH Group",
    note: "Who they are: Related Group's development partner on this project. Why it matters for buyers: the joint venture adds acquisition, capital, and execution depth behind the address.",
  },
  {
    role: "Architect",
    name: "Arquitectonica",
    note: "Who they are: the architecture firm named in official and public project materials. Why it matters for buyers: the building's waterfront orientation, tower language, and arrival sequence start with the architecture.",
  },
  {
    role: "Interior / Design",
    name: "Rockwell Group",
    note: "Who they are: the interiors studio behind the residences and amenity spaces. Why it matters for buyers: interior tone, materials, and daily usability determine whether the brand promise feels residential.",
  },
  {
    role: "Landscape Architect",
    name: "Naturalficial",
    note: "Who they are: the landscape-design credit in current project materials. Why it matters for buyers: exterior spaces, pool edges, and arrival landscaping shape how the building lives beyond the unit.",
  },
  {
    role: "Brand / Service Partner",
    name: "The Ritz-Carlton",
    note: "Who they are: the licensed hospitality brand associated with the residential service standard through Marriott International. Why it matters for buyers: confirm exactly which services, staffing, and operating costs are included.",
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

const southFlaglerTeam: TeamCredit[] = [
  {
    role: "Developer",
    name: "Related Ross",
    note: "Sponsor depth, financing, and delivery confidence are central here.",
  },
  {
    role: "Architect",
    name: "Robert A.M. Stern Architects",
    note: "Proportion, permanence, and Palm Beach-adjacent credibility drive the value.",
  },
  {
    role: "Interior Designer",
    name: "Pembrooke & Ives",
    note: "Interiors should support a composed, long-term home.",
  },
  {
    role: "Landscape Architect",
    name: "SMI Landscape Architecture",
    note: "Gardens, terraces, pool edges, and arrival carry the club feeling.",
  },
];

const albaTeam: TeamCredit[] = [
  {
    role: "Developer",
    name: "BGI Companies / Kenneth Baboun",
    note: "Boutique scale makes execution and closeout timing important.",
  },
  {
    role: "Development Partner",
    name: "Blue Road",
    note: "Partnership depth supports delivery.",
  },
  {
    role: "Architect",
    name: "Spina O'Rourke + Partners",
    note: "Alba needs a quieter, residential waterfront design read.",
  },
  {
    role: "Landscape Architect",
    name: "Schmidt Nichols",
    note: "Outdoor edges and arrival spaces matter in a small building.",
  },
  {
    role: "Construction",
    name: "Moss Construction",
    note: "Verify progress against current closing guidance.",
  },
  {
    role: "Sales",
    name: "One Sotheby's International Realty",
    note: "Current inventory, townhomes, incentives, and pricing require a packet.",
  },
];

const shorecrestTeam: TeamCredit[] = [
  {
    role: "Developer",
    name: "Related Ross",
    note: "Useful context, but pricing, lines, and timing still need verification.",
  },
  {
    role: "Architect",
    name: "Roger Ferris + Partners",
    note: "Shorecrest should read as contemporary North Flagler, not South Flagler copy.",
  },
  {
    role: "Interior Designer",
    name: "Rottet Studio",
    note: "Tone, light, and amenity atmosphere need current-material review.",
  },
  {
    role: "Landscape Designer",
    name: "DS Boca",
    note: "Outdoor amenity and arrival details still need packet review.",
  },
  {
    role: "Sales / Marketing",
    name: "Related Sales / Corcoran Sunshine",
    note: "Availability and contract terms still need direct confirmation.",
  },
];

const southFlaglerResidenceGallery: MediaAsset[] = [
  {
    src: `${southFlaglerMediaBase}imported/south-flagler-house-penthouse-living-room-rendering.jpg`,
    kicker: "Residence",
    title: "Penthouse Living",
    alt: "South Flagler House penthouse living room rendering",
  },
  {
    src: `${southFlaglerMediaBase}imported/south-flagler-house-kitchen-residence-rendering.jpg`,
    kicker: "Residence",
    title: "Kitchen And Dining",
    alt: "South Flagler House kitchen and dining residence rendering",
  },
  {
    src: `${southFlaglerMediaBase}imported/south-flagler-house-primary-bedroom-duplex-rendering.jpg`,
    kicker: "Residence",
    title: "Primary Suite",
    alt: "South Flagler House primary bedroom duplex rendering",
  },
];

const southFlaglerAmenityGallery: MediaAsset[] = [
  {
    src: `${southFlaglerMediaBase}imported/south-flagler-house-pool-amenity-rendering.jpg`,
    kicker: "Amenity",
    title: "Waterfront Pool",
    alt: "South Flagler House pool amenity rendering",
  },
  {
    src: `${southFlaglerMediaBase}imported/amenity-2026-05-22-041.jpg`,
    kicker: "Amenity",
    title: "Private Club Space",
    alt: "South Flagler House private club amenity rendering",
  },
  {
    src: `${southFlaglerMediaBase}imported/amenity-2026-05-22-042.jpg`,
    kicker: "Amenity",
    title: "Wellness Amenity",
    alt: "South Flagler House wellness amenity rendering",
  },
];

const albaResidenceGallery: MediaAsset[] = [
  {
    src: `${albaMediaBase}imported/alba-palm-beach-exterior-aerial-waterfront-rendering.jpg`,
    kicker: "Waterfront",
    title: "Direct Intracoastal Setting",
    alt: "Alba Palm Beach direct Intracoastal waterfront rendering",
  },
  {
    src: `${albaMediaBase}alba-exterior-sketch.jpg`,
    kicker: "Architecture",
    title: "Boutique Exterior",
    alt: "Alba Palm Beach exterior sketch",
  },
  {
    src: `${albaMediaBase}imported/alba-palm-beach-card-waterfront-rendering-2026-05-22-009.jpg`,
    kicker: "Residence",
    title: "Waterfront Residence Context",
    alt: "Alba Palm Beach boutique waterfront residence rendering",
  },
];

const albaAmenityGallery: MediaAsset[] = [
  {
    src: `${albaMediaBase}imported/alba-palm-beach-card-waterfront-rendering-2026-05-22-009.jpg`,
    kicker: "Amenity",
    title: "Waterfront Terrace",
    alt: "Alba Palm Beach waterfront terrace rendering",
  },
  {
    src: `${albaMediaBase}alba-hero.jpg`,
    kicker: "Amenity",
    title: "Pool And Waterfront Edge",
    alt: "Alba Palm Beach aerial waterfront and amenity deck rendering",
  },
  {
    src: `${albaMediaBase}card.jpg`,
    kicker: "Amenity",
    title: "Boutique Building Rhythm",
    alt: "Alba Palm Beach boutique waterfront building image",
  },
];

const shorecrestResidenceGallery: MediaAsset[] = [
  {
    src: `${shorecrestMediaBase}imported/shorecrest-interior-living-room-rendering.jpg`,
    kicker: "Residence",
    title: "Living Room View",
    alt: "Shorecrest residence living room rendering",
  },
  {
    src: `${shorecrestMediaBase}shorecrest-residence-900x1179.jpg`,
    kicker: "Residence",
    title: "Residence Interior",
    alt: "Shorecrest residence interior rendering",
  },
  {
    src: `${shorecrestMediaBase}shorecrest-exterior-card.jpg`,
    kicker: "Waterfront",
    title: "Waterfront Exposure",
    alt: "Shorecrest waterfront exterior rendering",
  },
];

const shorecrestAmenityGallery: MediaAsset[] = [
  {
    src: `${shorecrestMediaBase}imported/unknown-2026-05-22-038.jpg`,
    kicker: "Amenity",
    title: "Pool And Amenity Context",
    alt: "Shorecrest amenity rendering from project materials",
  },
  {
    src: `${shorecrestMediaBase}imported/shorecrest-restaurant-bar-lifestyle-reference.jpg`,
    kicker: "Amenity",
    title: "Dining / Lounge Reference",
    alt: "Shorecrest dining and lounge lifestyle reference image",
  },
  {
    src: `${shorecrestMediaBase}imported/shorecrest-hummingbird-exterior-rendering.jpg`,
    kicker: "Amenity",
    title: "Outdoor Setting",
    alt: "Shorecrest outdoor setting rendering from project materials",
  },
];

const projectPageDrafts: Record<string, ProjectPageDraft> = {
  olara: {
    kicker: "North Flagler Waterfront",
    title: "Olara",
    intro:
      "Olara is the lively North Flagler waterfront choice for buyers who want marina access, wellness, dining, and social energy built into the address. The useful read is not simply that it has resort amenities; it is how the building turns water, food, fitness, and daily service into a more active residential routine.",
    image: `${mediaBase}olara-hero-exterior-1536x1024.jpg`,
    imageAlt: "Olara waterfront tower rendering in West Palm Beach",
    stage: "Under construction",
    locationCopy:
      "At 1919 N Flagler Drive, Olara sits in the core North Flagler comparison set with Shorecrest and The Ritz-Carlton Residences. Compare it by amenity depth, marina access, current floorplan availability, and whether an active waterfront-resort rhythm fits better than a boutique or formal-estate posture.",
    facts: [
      { label: "Address", value: "1919 N Flagler Dr" },
      { label: "Stories", value: "26" },
      { label: "Residences", value: "275", note: "Confirm the latest count in the current buyer packet." },
      { label: "Delivery", value: "2027 / 2028 range", note: "Verify current timing before relying on a date." },
      { label: "Pricing", value: "Request current pricing" },
      { label: "Profile", value: "Amenity-rich North Flagler waterfront" },
    ],
    team: projectTeam,
    highlights: [
      { label: "Wellness", value: "Fitness, spa, and recovery", note: "Review the wellness spaces as daily-use infrastructure, not as a brochure checkbox." },
      { label: "Marina", value: "Water-oriented ownership", note: "Confirm exact marina access, slips, fees, and operating rules before assigning value." },
      { label: "Dining", value: "Culinary identity", note: "The Jose Andres connection gives Olara a social layer that separates it from quieter Flagler options." },
      { label: "Buyer Fit", value: "Active amenity depth", note: "Best for buyers who want the building to feel alive and service-rich." },
    ],
    gallery: [
      ...featuredGallery,
      ...residenceGallery,
      ...amenityGallery,
      {
        src: `${mediaBase}olara-marina-boat-dock-1600x1067.jpg`,
        kicker: "Waterfront",
        title: "Marina Context",
        alt: "Olara marina and boat dock lifestyle rendering",
      },
    ],
    documents: [
      { label: "Advisor Packet", title: "Request current Olara materials", note: "Pricing, availability, floorplans, fees, and contract guidance" },
      { label: "Reviewed Materials", title: "Official project, architecture, brochure, amenity, and floorplan materials reviewed", note: "Verification details are kept internal." },
    ],
    needed: [
      "Current residence count from the latest fact sheet",
      "Which amenities are included in the condominium offering and which are subject to change",
      "Current delivery timing and construction update",
      "Line-specific availability, pricing, deposits, fees, parking, and storage",
    ],
  },
  "ritz-carlton-wpb": {
    kicker: "North Flagler Branded Residences",
    title: "The Ritz-Carlton Residences, West Palm Beach",
    intro:
      "The Ritz-Carlton Residences, West Palm Beach is a 27-story condominium planned with 138 residences at 1717 N Flagler Drive. The buyer proposition is simple: private ownership, water-facing homes, and a recognized residential service platform from a team led by Related Group and BH Group.",
    image: `${ritzMediaBase}ritz-hero-waterfront-building-2200x1375.jpg`,
    imageAlt: "The Ritz-Carlton Residences West Palm Beach waterfront tower rendering",
    stage: "Under construction",
    locationCopy:
      "The address sits along the Intracoastal side of West Palm Beach, close enough to downtown, Palm Beach, and the broader Flagler Drive pipeline to make comparison shopping practical. Judge the location by bridge access, view exposure, construction context, and how the corridor will feel by delivery.",
    facts: ritzFacts,
    team: ritzTeam,
    highlights: [
      { label: "Service Model", value: "Residential hospitality", note: "Understand the staffing, included services, and monthly cost structure before assigning value to the brand." },
      { label: "Ownership Fit", value: "Private full-service condo", note: "Best for buyers who want a managed daily environment without moving into a larger estate-style residence." },
      { label: "Residence Read", value: "Light, views, balconies", note: "Compare stack, exposure, balcony depth, and elevator access by line before touring." },
      { label: "Sponsor Context", value: "Related Group + BH Group", note: "Development-team depth is useful, but final buyer decisions still need current offering documents." },
    ],
    gallery: [
      ...ritzFeaturedGallery,
      ...ritzResidenceGallery,
      ...ritzAmenityGallery,
      {
        src: `${ritzMediaBase}ritz-evening-aerial-road-motion-1600x1067.jpg`,
        kicker: "Market Context",
        title: "North Flagler Waterfront",
        alt: "Night aerial view of The Ritz-Carlton Residences and West Palm Beach waterfront",
      },
    ],
    documents: [
      { label: "Advisor Packet", title: "Request current Ritz-Carlton materials", note: "Availability, floorplans, service details, pricing, and buyer guidance" },
      { label: "Reviewed Materials", title: "Official project, Related Group, and floorplan materials reviewed", note: "Verification details are kept internal." },
    ],
    needed: [
      "Current design-team confirmation from the latest official materials",
      "Amenity and residential-service details from the current buyer packet",
      "Latest delivery timing before relying on a hard date",
      "Line-specific availability, fees, parking, storage, and contract terms",
    ],
  },
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
      "Shorecrest is a source-confirmed Related Ross waterfront project on North Flagler, but the page should stay measured: use the official materials for address, team, residence count range, and broad amenity posture, then mark current pricing, line availability, and final offering details for packet review.",
    image: shorecrestUserHero,
    imageAlt: "Shorecrest waterfront tower rendering",
    stage: "Under construction",
    locationCopy:
      "Located at 1865 N Flagler Drive on the west side of the Intracoastal, Shorecrest belongs in the first North Flagler comparison set. It should be read as a contemporary waterfront condominium with Related Ross context, not as a South Flagler House clone.",
    facts: [
      { label: "Address", value: "1865 N Flagler Dr", note: "Some public materials also reference 1901 N Flagler." },
      { label: "Stories", value: "28" },
      { label: "Residences", value: "98-100", note: "Related Ross' 2026 groundbreaking release says 98 residences; some project materials have referenced 100." },
      { label: "Bedrooms", value: "2-3" },
      { label: "Delivery", value: "Expected 2027" },
      { label: "Pricing", value: "From $3M reported", note: "Request current availability before scheduling." },
      { label: "Profile", value: "North Flagler waterfront" },
    ],
    team: shorecrestTeam,
    highlights: [
      { label: "What We Know", value: "Related Ross + North Flagler", note: "Official and sponsor sources support the broad project context and design team." },
      { label: "What Needs Confirmation", value: "Current packet", note: "Confirm pricing, releases, amenities, fees, delivery, parking, storage, and offering terms before reliance." },
      { label: "Buyer Fit", value: "Contemporary waterfront", note: "A North Flagler option to compare on scale, views, and service without borrowing South Flagler language." },
    ],
    gallery: [
      {
        src: shorecrestUserHero,
        kicker: "Exterior",
        title: "Waterfront Tower",
        alt: "Shorecrest waterfront tower rendering",
      },
      {
        src: `${shorecrestMediaBase}imported/shorecrest-interior-living-room-rendering.jpg`,
        kicker: "Residence",
        title: "Living Room View",
        alt: "Shorecrest residence living room rendering",
      },
      {
        src: `${shorecrestMediaBase}shorecrest-exterior-card.jpg`,
        kicker: "Exterior",
        title: "Waterfront Profile",
        alt: "Shorecrest reference card image",
      },
    ],
    documents: [
      { label: "Advisor Packet", title: "Request current Shorecrest materials", note: "Availability, line details, pricing, fees, and buyer guidance" },
      { label: "Reviewed Materials", title: "Official site, floorplan, fact sheet, brochure, and Related Ross materials reviewed", note: "Verification details are kept internal." },
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
      "Alba Palm Beach is the boutique North Flagler waterfront alternative: 55 residences, direct Intracoastal orientation, and a quieter residential scale for buyers who do not want the mega-tower feel.",
    image: `${albaMediaBase}alba-hero.jpg`,
    imageAlt: "Alba Palm Beach aerial rendering",
    stage: "Under construction",
    locationCopy:
      "At 4714 N Flagler Drive, Alba extends the waterfront comparison north of the Olara/Shorecrest/Ritz cluster. Compare it on scale, direct water orientation, townhome-style options, and the calmer Northwood feel.",
    facts: [
      { label: "Address", value: "4714 N Flagler Dr" },
      { label: "Stories", value: "22" },
      { label: "Residences", value: "55" },
      { label: "Delivery", value: "Spring 2026 reported" },
      { label: "Pricing", value: "Request current pricing", note: "Lower penthouse reporting starts around $6.95M." },
      { label: "Profile", value: "Boutique North Flagler" },
    ],
    team: albaTeam,
    highlights: [
      { label: "Scale", value: "55 residences", note: "The appeal is proportion and privacy, not the longest possible amenity inventory." },
      { label: "Residence Mix", value: "Condos + townhomes", note: "Townhome-style options make Alba relevant for buyers who want a more grounded residential feel." },
      { label: "Status", value: "Topped-out / nearing delivery", note: "Request the latest construction, closing, incentive, and inventory update." },
    ],
    gallery: [
      {
        src: `${albaMediaBase}alba-hero.jpg`,
        kicker: "Exterior",
        title: "Aerial Waterfront",
        alt: "Alba Palm Beach aerial rendering",
      },
      {
        src: `${albaMediaBase}alba-exterior-sketch.jpg`,
        kicker: "Architecture",
        title: "Exterior Sketch",
        alt: "Alba Palm Beach exterior sketch",
      },
      {
        src: `${albaMediaBase}card.jpg`,
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
      "South Flagler House is the composed South Flagler waterfront address for buyers who want Palm Beach-adjacent formality in a full-service condominium. The pitch is architecture, privacy, and private-club depth rather than North Flagler resort energy.",
    image: southFlaglerHouseUserHero,
    imageAlt: "South Flagler House reference image",
    stage: "Under construction",
    locationCopy:
      "At 1355 S Flagler Drive, South Flagler House anchors the southern waterfront comparison. Read it by Palm Beach access, privacy, residence scale, formal arrival, and whether the quieter South Flagler setting fits the way the buyer wants to live.",
    facts: [
      { label: "Address", value: "1355 S Flagler Dr" },
      { label: "Stories", value: "28 + 28", note: "Two tower composition." },
      { label: "Residences", value: "108", note: "Full project count, not per tower." },
      { label: "Bedrooms", value: "2-5" },
      { label: "Delivery", value: "Expected 2027" },
      { label: "Pricing", value: "Request current pricing" },
      { label: "Profile", value: "South Flagler waterfront" },
    ],
    team: southFlaglerTeam,
    highlights: [
      { label: "Architecture", value: "RAMSA design", note: "Design credibility is part of the value proposition, not just a team credit." },
      { label: "Private Club", value: "Amenity depth", note: "Review the club, wellness, dining, pool, and service program as daily-life infrastructure." },
      { label: "Buyer Fit", value: "Palm Beach-adjacent calm", note: "Best for buyers seeking scale and composure rather than a marina-resort identity." },
    ],
    gallery: [
      {
        src: southFlaglerHouseUserHero,
        kicker: "Exterior",
        title: "Waterfront Rendering",
        alt: "South Flagler House waterfront rendering",
      },
      {
        src: `${southFlaglerMediaBase}south-flagler-house-entrance-source.jpg`,
        kicker: "Arrival",
        title: "Entrance Sequence",
        alt: "South Flagler House arrival and entrance rendering",
      },
      {
        src: `${southFlaglerMediaBase}south-flagler-house-rendering-02.jpg`,
        kicker: "Architecture",
        title: "Tower Rendering",
        alt: "South Flagler House tower rendering",
      },
      {
        src: `${southFlaglerMediaBase}south-flagler-house-rendering-03.png`,
        kicker: "Detail",
        title: "Project Detail",
        alt: "South Flagler House project rendering detail",
      },
    ],
    documents: [
      { label: "Advisor Packet", title: "Request current South Flagler House materials", note: "Availability, line details, pricing, fees, and buyer guidance" },
      { label: "Reviewed Materials", title: "Official site and fact sheet materials reviewed", note: "Verification details are kept internal." },
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
  const team = project.id === "ritz-carlton-wpb" ? base.team : teamCreditsFromSource(source.team);
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

loadBatch1ProjectCopyPackageSync();

const freshUpdateItems = publishedExternalNews.filter((item) => item.freshnessLane === "breaking_14d" || item.freshnessLane === "recent_30d");
const contextUpdateItems = publishedExternalNews.filter((item) => !freshUpdateItems.some((freshItem) => freshItem.id === item.id));
const approvedNewsFeedRenderReference = "publishedExternalNews.map(renderExternalNewsItem)";
void approvedNewsFeedRenderReference;
const buyerResourceNotes = marketNotes.filter((note) => !isDowntownSpotlight(note));

app.innerHTML = `
  <div class="site-shell">
    <header class="site-nav">
      <a class="brand" href="/" aria-label="WPB New Construction home">
        <span class="brand-mark" aria-hidden="true">WPB</span>
        <span class="brand-copy">West Palm Beach New Construction</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/buildings/" data-nav-item="projects">Projects</a>
        <a href="/corridors/" data-nav-item="corridors">Corridors</a>
        <a href="/market-notes/" data-nav-item="market-notes">Buyers</a>
        <a href="/about/" data-nav-item="about">About Us</a>
        <a href="/floorplans/" data-nav-item="floorplans">Floorplans</a>
      </nav>
      <a class="nav-phone" href="${advisorProfile.mobileHref}" aria-label="Call The Scott Gordon Group">Call</a>
      <a class="nav-cta" href="/inquire/" data-nav-item="inquire">Inquire now <span aria-hidden="true">→</span></a>
    </header>

    <main>
      <div class="route-view route-view-home" data-route-view="home">
      <section class="home-hero" id="top">
        <figure class="home-hero-media" aria-label="Curated West Palm Beach new-construction editorial imagery">
          <picture>
            <source media="(max-width: 720px)" srcset="${homepageAssets.hero.mobile}" />
            <img
              class="home-hero-image is-active"
              data-home-hero-layer="active"
              src="${homepageAssets.hero.desktop}"
              alt="West Palm Beach waterfront skyline and bridge viewed across the Intracoastal Waterway."
              loading="eager"
              decoding="async"
              fetchpriority="high"
              style="object-position: center center"
            />
          </picture>
          <img
            class="home-hero-image"
            data-home-hero-layer="next"
            alt=""
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            aria-hidden="true"
          />
          <figcaption class="home-hero-caption" data-home-hero-caption>West Palm Beach waterfront.</figcaption>
          <ul class="sr-only">
            ${activeHomeHeroImages.map((image) => `<li>${escapeHtml(image.alt)}</li>`).join("")}
          </ul>
        </figure>
        <div class="home-hero-scrim"></div>
        <div class="home-hero-layout">
          <div class="home-hero-content">
            <p class="hero-kicker">West Palm Beach New Construction</p>
            <h1>
              <span class="home-hero-title-desktop">${escapeHtml(approvedHeroCardOverride?.headline || "West Palm Beach Luxury Condo Developments")}</span>
              <span class="home-hero-title-mobile">West Palm Beach Luxury Condos</span>
            </h1>
            <p class="hero-copy">${escapeHtml(approvedHeroCardOverride?.deck || approvedHeroCardOverride?.subhead || "Explore the city's most important new and upcoming condominium projects with clear details, local insight, floorplans, maps, and buyer-focused guidance before you inquire.")}</p>
            <div class="hero-actions" aria-label="Primary homepage actions">
              <a href="/buildings/" data-hero-cta="explore-buildings">Browse Projects</a>
              <a href="/corridors/" data-hero-cta="view-corridors">Explore Corridors</a>
            </div>
          </div>
        </div>
      </section>

      <nav class="home-section-jump" aria-label="Explore homepage sections">
        <a href="/corridors/">${homeJumpIcon("corridors")}<span>Corridors</span></a>
        <a href="/buildings/">${homeJumpIcon("projects")}<span>Projects</span></a>
        <a href="/compare/">${homeJumpIcon("compare")}<span>Compare</span></a>
        <a href="/answers/">${homeJumpIcon("answers")}<span>Q&A</span></a>
        <a href="/downtown-spotlight/">${homeJumpIcon("spotlight")}<span>Downtown</span></a>
        <a href="/updates/">${homeJumpIcon("updates")}<span>Updates</span></a>
        <a href="/market-notes/">${homeJumpIcon("guides")}<span>Buyer Guides</span></a>
      </nav>

      <section class="home-corridor-guide" id="corridors" aria-label="Choose a West Palm Beach new-construction corridor">
        <div class="section-heading corridor-heading">
          <p class="eyebrow">Explore by Corridor</p>
          <h2>Start by location.</h2>
          <p class="mobile-rail-hint" aria-hidden="true">Swipe to explore <span>→</span></p>
        </div>
        <div class="corridor-guide-grid">
          ${homepageCorridorKeys.map((key) => corridorSections.find((section) => section.key === key)).filter((section): section is CorridorSection => Boolean(section)).map((section) => {
            const cardOverride = approvedHomepageCardOverride("corridors", section.key);
            const directoryPath = corridorDirectoryPath(section.key);
            return `
              <article class="corridor-guide-card">
                <a class="corridor-guide-image-link" href="${directoryPath}" aria-label="View ${section.label} projects">
                  ${cardOverride?.imagePath ? renderHomepageOverrideImage(cardOverride, section.label, "corridor-guide-image") : `<figure class="corridor-guide-image"><img src="${homepageAssets.corridors[section.key]}" alt="${section.label} West Palm Beach new-construction corridor" loading="lazy" decoding="async" /></figure>`}
                </a>
                <div class="corridor-guide-card-body">
                  <span>${corridorDisplayLabel(section.key)}</span>
                  <strong>${escapeHtml(cardOverride?.headline || section.label)}</strong>
                  <p>${escapeHtml(cardOverride?.deck || cardOverride?.subhead || homepageCorridorCopy(section.key))}</p>
                </div>
                <a href="${directoryPath}">${escapeHtml(cardOverride?.ctaLabel || `Explore ${section.label}`)} <span aria-hidden="true">→</span></a>
              </article>
            `;
          }).join("")}
        </div>
      </section>

      <section class="home-status-guide" aria-label="Browse buildings by construction status">
        <div class="section-heading">
          <p class="eyebrow">Browse by Status</p>
        </div>
        <nav class="home-status-grid" aria-label="Project status filters">
          ${[
            ["Active Sales", "active-sales"],
            ["Under Construction", "under-construction"],
            ["Announced / Planned", "announced-planned"],
            ["Completed Opportunities", "completed-opportunities"],
          ].map(([title, filter]) => `
            <a href="/buildings/?filter=${filter}">
              <strong>${title}</strong>
              <span>View projects <b aria-hidden="true">→</b></span>
            </a>
          `).join("")}
        </nav>
      </section>

      <section class="home-featured-section" id="featured-projects" aria-label="Featured buyer-ready projects">
        <div class="section-heading home-featured-heading">
          <p class="eyebrow">Featured Developments</p>
          <p>A focused starting point for comparing relevant new residences.</p>
          <p class="mobile-rail-hint" aria-hidden="true">Swipe to explore <span>→</span></p>
        </div>
        <div class="home-featured-grid" role="region" aria-label="Scrollable featured developments" tabindex="0">
          ${homepageFeaturedProjects.map(renderHomepageFeaturedProject).join("")}
        </div>
        <a class="home-answer-archive-link" href="/buildings/">View all projects <span aria-hidden="true">→</span></a>
      </section>

      <section class="home-future-module home-spotlight-module" aria-label="Downtown spotlight: NORA district">
        <img src="/assets/editorial/nora-district-aerial-evening-hero.jpg" alt="Aerial evening rendering of the NORA District in Downtown West Palm Beach" loading="lazy" decoding="async" />
        <div>
          <p class="eyebrow">Downtown Spotlight</p>
          <h2>Why the NORA District could reshape Downtown.</h2>
          <p>NORA is more than a restaurant district. Its walkable streets, adaptive reuse, hospitality plans, and housing pipeline could extend Downtown West Palm Beach's center of gravity northward.</p>
          <a href="/downtown-spotlight/nora-district-downtown-transformation/">Read Downtown Spotlight <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section class="home-atlas-feature home-atlas-feature-editorial home-atlas-compact" id="atlas" aria-label="West Palm Beach project atlas">
        <div class="home-atlas-compact-heading">
          <div>
            <p class="eyebrow">Explore the Map</p>
            <p>Click the map to open a larger project view.</p>
          </div>
        </div>
        <div class="home-atlas-frame">
          <aside class="home-hero-map-card home-atlas-map-card home-atlas-map-only" aria-label="Featured West Palm Beach project map">
            <figure class="hero-map-preview">
              <div class="hero-google-map" data-hero-google-map aria-label="Google map of West Palm Beach new-construction project locations"></div>
              <button class="hero-map-expand" type="button" data-map-expand>Open larger map</button>
              <div class="hero-map-fallback">
                ${renderProjectMapFallback()}
              </div>
            </figure>
            <div class="home-map-count" aria-label="Map project count">
              <strong>${featuredProjects.length}</strong>
              <span>tracked West Palm Beach new-construction projects</span>
            </div>
          </aside>
          <div class="home-atlas-projects">
            <p>Projects shown on map</p>
            <div class="home-atlas-project-strip" role="region" aria-label="Projects shown on the homepage map" tabindex="0">
              ${validMapProjects(rankedFeaturedProjects.slice(0, 7)).map(renderHomepageAtlasProject).join("")}
            </div>
          </div>
        </div>
      </section>

      ${renderHomepageAdvisoryResources()}
      ${renderHomepageCompareLauncher()}
      </div>

      ${renderBuildingsRouteView()}

      ${renderCorridorsRouteView()}

      ${renderMapRouteView()}

      ${renderCompareRouteView()}

      ${corridorSections.map(renderCorridorRouteView).join("")}

      <div class="route-view route-view-news" data-route-view="news" hidden>
        <section class="section news-section newsroom-archive" id="news">
          <div class="newsroom-hero">
            <div>
              <p class="eyebrow">WPB Development Desk</p>
              <h1>West Palm Beach Development Desk</h1>
              <p>Construction milestones, planning movement, project announcements, and buyer-relevant signals from the new-construction pipeline. Fresh items sit first; older reporting is kept as context when it still helps buyers compare timing, corridor momentum, or project fit.</p>
            </div>
            <aside class="answer-meta-panel">
              <span>Updated ${publishedExternalNews[0]?.fetchedAt ?? floorplanLibrary[0]?.updatedAt ?? "2026-05-22"}</span>
              <strong>${publishedExternalNews.length} on-site update${publishedExternalNews.length === 1 ? "" : "s"} with original sources at the bottom of each article.</strong>
              <small>The Scott Gordon Group can help compare what is reported, what is actually available, and what belongs on your shortlist.</small>
            </aside>
          </div>
          ${freshUpdateItems[0] ? `
            <div class="newsroom-section-block">
              <div class="section-heading">
                <p class="eyebrow">Fresh Signal</p>
                <h2>Latest buyer-relevant movement.</h2>
              </div>
              ${renderFeaturedExternalNewsItem(freshUpdateItems[0])}
            </div>
          ` : ""}
          <div class="newsroom-controls" aria-label="Filter West Palm Beach updates">
            <div class="filter-chips news-filter-chips" role="list" aria-label="Update filters">
              ${newsFilters.map(renderNewsFilter).join("")}
            </div>
            <label class="news-search-control">
              <span>Search updates</span>
              <input type="search" data-news-search placeholder="Search project, corridor, or topic" />
            </label>
          </div>
          <div class="newsroom-section-block">
            <div class="section-heading">
              <p class="eyebrow">Fresh Updates</p>
              <h2>Current and recent development signals.</h2>
            </div>
            <div class="news-grid" data-news-grid>
              ${freshUpdateItems.map(renderExternalNewsItem).join("")}
            </div>
          </div>
          <div class="newsroom-section-block">
            <div class="section-heading">
              <p class="eyebrow">Context Archive</p>
              <h2>Older reporting that still clarifies the buyer map.</h2>
            </div>
            <div class="news-grid">
              ${contextUpdateItems.map(renderExternalNewsItem).join("")}
            </div>
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
            <p class="eyebrow">Buyer Resources</p>
            <h1>Buyer Resources and Market Notes</h1>
            <p>Use these guides to understand the moving pieces behind West Palm Beach new construction. Compare buildings, review floorplans, explore corridors, follow updates, and get practical answers before reaching out to a sales team.</p>
          </div>
          <aside class="answer-meta-panel">
            <span>${buyerResourceNotes.length} buyer notes</span>
            <strong>Built for comparison, not brochure fog.</strong>
            <small>Each note names the buyer angle and the items the team should verify before you make a decision.</small>
          </aside>
        </section>
        <section class="section">
          <div class="home-blog-grid market-note-grid">
            ${buyerResourceNotes.map(renderMarketNoteCard).join("")}
          </div>
        </section>
      </div>

      <div class="route-view route-view-market-note-detail" data-route-view="market-note-detail" hidden></div>

      <div class="route-view route-view-downtown-spotlight" data-route-view="downtown-spotlight" hidden>
        ${renderDowntownSpotlightIndex()}
      </div>

      ${renderAboutRouteView()}

      <div class="route-view route-view-floorplans" data-route-view="floorplans" hidden>
        <section class="section floorplan-hub-hero">
          <figure class="floorplan-hero-image">
            <img src="/assets/editorial/floorplan-library-hero.jpg" alt="Floor plans and residence materials arranged on a design review table" decoding="async" />
          </figure>
          <div>
            <p class="eyebrow">Floorplan Library</p>
            <h1>Floorplans</h1>
            <p>Explore floor plans designed to help you understand each residence before you step inside. From room flow and bedroom placement to outdoor space, views, and everyday livability, these plans offer a clear look at how each home lives—not just how it measures.</p>
            <div class="hero-actions">
              <a class="button primary" href="#floorplan-library">Browse by building <span aria-hidden="true">↓</span></a>
              <a class="button ghost" href="/inquire/?interest=floorplans&lead_capture_context=floorplans_page">Request current packet <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
        <section class="section floorplan-index-section" id="floorplan-library">
          ${floorplanHubProjects.map(renderFloorplanProject).join("")}
          <a class="home-answer-archive-link" href="/inquire/?interest=floorplans&lead_capture_context=floorplans_page">Request Floorplans <span aria-hidden="true">↗</span></a>
        </section>
      </div>

      <div class="floorplan-viewer" data-floorplan-viewer hidden aria-hidden="true">
        <div class="floorplan-viewer-backdrop" data-floorplan-close></div>
        <section class="floorplan-viewer-dialog" role="dialog" aria-modal="true" aria-labelledby="floorplan-viewer-title">
          <button class="floorplan-viewer-close" type="button" data-floorplan-close aria-label="Close floorplan viewer">×</button>
          <div class="floorplan-viewer-header">
            <h2 id="floorplan-viewer-title" data-floorplan-title>Floor plan</h2>
          </div>
          <div class="floorplan-viewer-frame" data-floorplan-frame></div>
          <div class="floorplan-viewer-actions">
            <button type="button" data-floorplan-prev>Previous</button>
            <button type="button" data-floorplan-next>Next</button>
            <a href="/inquire/?interest=floorplans&lead_capture_context=floorplan_viewer">Inquire Now</a>
          </div>
        </section>
      </div>

      <div class="route-view route-view-answers" data-route-view="answers" hidden>
        <section class="section intelligence-hero answer-library-hero">
          <div>
            <p class="eyebrow">Buyer Q&A</p>
            <h1>West Palm Beach New-Construction Condo Buyer FAQ.</h1>
            <p>
              Start with the questions buyers ask before choosing a project: process, deposits, pricing, neighborhoods,
              ownership costs, service models, floorplans, documents, and current availability.
            </p>
          </div>
          <figure class="answer-hero-media">
            <img src="/assets/editorial/preconstruction-condo-document-review.jpg" alt="West Palm Beach condo buyer documents and floor plan materials arranged for review" decoding="async" />
            <figcaption>
              <span>Current library</span>
              <strong>${answerEngineFaq.length} source-backed buyer questions</strong>
              <small>Use the page to frame the shortlist, then verify changing details through current project documents.</small>
            </figcaption>
          </figure>
        </section>
        <section class="section answer-topic-section" id="answer-topics" aria-label="West Palm Beach condo FAQ topics">
          <div class="section-heading">
            <p class="eyebrow">Choose A Lane</p>
            <h2>Start with the kind of decision you are trying to make.</h2>
            <p>Each topic opens into a focused Q&A set, so buyers can compare the market without reading every answer at once.</p>
          </div>
          <div class="answer-topic-grid">
            ${answerTopicCards.map(renderAnswerTopicCard).join("")}
          </div>
        </section>
        <section class="section answer-accordion-section" aria-label="Grouped West Palm Beach condo buyer questions">
          <div class="section-heading">
            <p class="eyebrow">Buyer Decision Library</p>
            <h2>Open only the questions you need.</h2>
            <p>The first group is open as a starting point. Everything else stays tucked away until it matters.</p>
          </div>
          <div class="answer-accordion-groups">
            ${answerTopicSections.map(renderAnswerTopicSection).join("")}
          </div>
        </section>
        <section class="section answer-research-section" aria-label="Deeper Q&A research tools">
          <details class="answer-research-drawer">
            <summary>
              <span>Project Fact Matrix</span>
              <strong>Compare stories, residences, timing, pricing, and views.</strong>
            </summary>
            ${renderAnswerFactMatrix()}
          </details>
          <details class="answer-research-drawer">
            <summary>
              <span>Deeper Comparison Guides</span>
              <strong>Open buyer-intent guides for common West Palm Beach condo comparisons.</strong>
            </summary>
            <div class="front-project-grid front-project-grid-static">
              ${buyerIntentAnswerPages.map(renderBuyerIntentAnswerCard).join("")}
            </div>
          </details>
        </section>
      </div>

      ${buyerIntentAnswerPages.map(renderBuyerIntentAnswerRouteView).join("")}

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
            <a class="button ghost" href="/inquire/?project=olara&interest=availability">Ask The Scott Gordon Group About This Building</a>
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
            ${floorplanDownloads.map((plan) => renderFloorplanLink(plan, docsBase, "Olara")).join("")}
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
            <a class="button ghost" href="/floorplans/#floorplans-ritz-carlton-wpb">View Floorplans</a>
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
            ${ritzFloorplanDownloads.map((plan) => renderFloorplanLink(plan, ritzDocsBase, "The Ritz-Carlton Residences, West Palm Beach")).join("")}
          </div>
        </div>
      </section>
      </div>

      <div class="route-view route-view-inquiry" data-route-view="inquire" hidden>
      <section class="section inquiry-section" id="inquire">
        <div class="inquiry-copy-panel">
          <p class="eyebrow">Contact The Scott Gordon Group</p>
          <h1>Request current availability and pricing</h1>
          <p>Tell us what you are considering. The Scott Gordon Group will send current availability, released floor plans, pricing guidance, fees and parking notes, and a short comparison of buildings that fit your timing, budget, and lifestyle.</p>
          <div class="inquiry-proof-strip" aria-label="What the team will review">
            <span>Availability</span>
            <span>Floor plans</span>
            <span>Pricing guidance</span>
            <span>Fees and parking</span>
          </div>
          <div class="inquiry-deliverables" aria-label="What the advisory packet includes">
            <article>
              <span>01</span>
              <strong>Current packet</strong>
              <small>Availability, pricing guidance, incentives, delivery, and fees to confirm in writing.</small>
            </article>
            <article>
              <span>02</span>
              <strong>Private comparison</strong>
              <small>Building-by-building notes based on location, views, floor plans, timing, and fit.</small>
            </article>
            <article>
              <span>03</span>
              <strong>Next step</strong>
              <small>A clean shortlist for packet requests, sales-gallery visits, or deeper negotiation review.</small>
            </article>
          </div>
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
              <option>Ask the team about this building</option>
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
            <span>By submitting, I consent to be contacted by ${teamProfile.displayName} at ${advisorProfile.brokerage} at the email address or phone number I provided about this real-estate inquiry. This request is for a manual response and is not consent to autodialed, prerecorded, or automated marketing calls or texts. Pricing, availability, incentives, square footage, fees, and delivery dates require current written confirmation.</span>
          </label>
          <button class="button primary" type="submit">Request Current Availability</button>
          <div class="brooke-identity-block">
            <img src="${teamProfile.logoMark}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <strong>${teamProfile.displayName}</strong>
            <span>${advisorProfile.brokerage}</span>
            <a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a>
            <p>Presented by The Scott Gordon Group at Douglas Elliman.</p>
          </div>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
        <p class="source-note">
          ${advisorProfile.name}, ${advisorProfile.title} (${advisorProfile.license}) · ${advisorProfile.brokerage} (Florida license ${advisorProfile.brokerageLicense}). Pricing, availability, square footage, and delivery timing change frequently and must be confirmed through current buyer-side review before reliance.
        </p>
      </section>
      </div>
      </main>
    <aside class="floating-availability-cta" data-floating-cta aria-label="Request current availability">
      <a href="/inquire/?lead_capture_context=floating_cta">Inquire Now</a>
    </aside>
    <nav class="mobile-cta-bar" aria-label="Quick contact actions">
      <a href="/inquire/?lead_capture_context=mobile_cta" data-quick-cta="request">Inquire Now</a>
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
        <p>${teamProfile.presentedBy}<br />${advisorProfile.name}, ${advisorProfile.title} (${advisorProfile.license})<br />Florida license ${advisorProfile.brokerageLicense}</p>
      </div>
      <div>
        <span>Review Method</span>
        <p>Project facts are separated as official, reported, or confirm-before-offer when sources conflict. <a href="/methodology/">See how we verify.</a></p>
        <p class="media-disclaimer">Some project images and renderings are sourced from developer or project marketing materials and are shown for buyer reference. Availability, finishes, views, amenities, and project details should be verified before reliance.</p>
      </div>
      <div>
        <span>Contact</span>
        <p>${teamProfile.displayName}<br />${advisorProfile.brokerage} (Florida license ${advisorProfile.brokerageLicense})<br /><a href="${advisorProfile.mobileHref}">${advisorProfile.mobile}</a><br /><a href="mailto:${advisorProfile.email}">${advisorProfile.email}</a></p>
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
      status.textContent = "Thanks — your request is ready to send. The Scott Gordon Group will follow up with current availability and floor plan guidance.";
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
  "olara-west-palm-beach": "olara",
  "ritz-carlton-residences-west-palm-beach": "ritz-carlton-wpb",
  "berkeley-palm-beach": "berkeley",
  "mr-c-residences-west-palm-beach": "mr-c",
  "banyan-tree-residences-west-palm-beach": "banyan-tree",
  "mandarin-oriental-residences-west-palm-beach": "mandarin-oriental",
  "edgeworth-north": "edgeworth",
  "edgeworth-south": "edgeworth",
  "related-ross-fern-street": "fern-and-gardenia-related-ross-fern-street",
  "rybovich-marina": "rybovich-marina-redevelopment",
  "rosewood": "rosewood-residences-west-palm-beach",
};

applyRoute();
initProjectBrowser();
initProjectGalleryTabs();
initHeroSlideshows();
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
  const activeAnswer = route.type === "answer-detail" ? buyerIntentAnswerForSlug(route.answerSlug) : undefined;

  shell?.setAttribute("data-active-route", route.type);
  shell?.setAttribute("data-active-project", route.projectId ?? "");
  const routeSeo = routeSeoDetails(route, activeProject, activeCorridor, activeMarketNote, activeNewsItem, activeAnswer);
  document.title = routeSeo.title;

  updateMetaDescription(route.type, activeProject, activeMarketNote, activeNewsItem, activeAnswer);
  updateCanonical(route, activeProject, activeMarketNote, activeNewsItem, activeAnswer);
  updateSocialMetadata(routeSeo);
  updateStructuredData(route.type, activeProject, activeMarketNote, activeNewsItem, activeAnswer);

  views.forEach((view) => {
    const viewType = view.dataset.routeView;
    const isActive =
      route.type === "project"
        ? viewType === "project" && view.dataset.projectId === route.projectId
        : route.type === "corridor"
          ? viewType === "corridor" && view.dataset.corridorRoute === route.corridorKey
          : route.type === "market-note-detail"
            ? viewType === "market-note-detail"
          : route.type === "answer-detail"
            ? viewType === "answer-detail" && view.dataset.answerSlug === route.answerSlug
          : route.type === "news-detail"
            ? viewType === "news-detail"
          : route.type === "buildings"
            ? viewType === "buildings"
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
  initHomeCompareLauncher();
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

  openHashTargetDetails();
  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0 });
  }
}

function openHashTargetDetails() {
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  let parent = target.parentElement;
  while (parent) {
    if (parent instanceof HTMLDetailsElement) {
      parent.open = true;
    }
    parent = parent.parentElement;
  }
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
  }
}

function routeSeoDetails(
  route: Route,
  activeProject?: FeaturedProject,
  activeCorridor?: CorridorSection,
  activeMarketNote?: MarketNote,
  activeNewsItem?: ExternalNewsItem,
  activeAnswer?: BuyerIntentAnswerPage,
) {
  const path =
    activeProject ? projectPath(activeProject) :
    activeCorridor ? corridorPath(activeCorridor.key) :
    activeMarketNote ? marketNotePath(activeMarketNote) :
    activeNewsItem ? updatePath(activeNewsItem) :
    activeAnswer ? buyerIntentAnswerPath(activeAnswer) :
    ({
      home: "/",
      buildings: "/buildings/",
      map: "/map/",
      corridors: "/corridors/",
      compare: "/compare/",
      about: "/about/",
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
    "downtown-spotlight": "Downtown Spotlight | West Palm Beach Condo District Notes",
    buildings: "West Palm Beach New Construction Buildings | Buyer Guide",
    map: "West Palm Beach Condo Map | New Construction Corridors",
    corridors: "West Palm Beach Condo Corridors | Buyer Guide",
    compare: "Compare West Palm Beach New Construction Condos",
    about: "About The Scott Gordon Group | Douglas Elliman Palm Beach",
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
    ? `${activeProject.name}${/west palm beach/i.test(activeProject.name) ? "" : " West Palm Beach"} | ${activeProject.pageState === "Complete profile" ? "New Construction Condo Guide" : "Buyer Guide"}`
    : activeCorridor
      ? corridorTitles[activeCorridor.key]
      : activeMarketNote
        ? activeMarketNote.seo.titleTag
      : activeNewsItem
        ? `${activeNewsItem.title} | WPB Updates`
      : activeAnswer
        ? `${activeAnswer.title} | WPB Answers`
      : routeTitles[route.type] ?? siteMeta.title;
  const description = activeAnswer?.description ?? (activeNewsItem ? updateArticleContent(activeNewsItem).excerpt : activeMarketNote?.seo.metaDescription ?? activeProject?.summary ?? (activeCorridor ? corridorDescriptions[activeCorridor.key] : metaDescriptionForRoute(route.type)));
  const image = route.type === "about" ? teamProfile.photo : activeProject?.image ?? (activeMarketNote ? imageForContentItem(activeMarketNote).src : activeNewsItem ? imageForContentItem(externalNewsImageContext(activeNewsItem)).src : siteMeta.defaultImage);
  return {
    title,
    description,
    image: image.startsWith("http") ? image : `${productionOrigin}${image}`,
    url: `${productionOrigin}${path}`,
  };
}

function getActiveNavItem(route: Route) {
  if (route.type === "project") {
    return "projects";
  }
  if (route.type === "corridor") {
    return "corridors";
  }
  if (route.type === "market-note-detail") {
    return "market-notes";
  }
  if (route.type === "downtown-spotlight") {
    return "market-notes";
  }
  if (route.type === "about") {
    return "about";
  }
  if (route.type === "news-detail") {
    return "news";
  }
  if (route.type === "buildings" || route.type === "map" || route.type === "corridors" || route.type === "compare") {
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
  } else if (interestSelect && interest === "compare") {
    interestSelect.value = "Compare buildings";
  } else if (interestSelect && interest === "availability") {
    interestSelect.value = "Request current availability";
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

  const selects = Array.from(document.querySelectorAll<HTMLSelectElement>("[data-compare-route-select]"));
  const output = document.querySelector<HTMLElement>("[data-compare-results]");
  const inquireLink = document.querySelector<HTMLAnchorElement>("[data-compare-inquire]");
  if (selects.length !== 3 || !output) return;

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
  if (selectedIds.length < 2) selectedIds = rankedFeaturedProjects.slice(0, 2).map((project) => project.id);
  selects.forEach((select, index) => {
    select.value = selectedIds[index] ?? "";
  });

  const render = () => {
    const selectedProjects = selectedIds
      .map((id) => featuredProjects.find((project) => project.id === id))
      .filter((project): project is FeaturedProject => Boolean(project));

    if (selectedProjects.length < 2) {
      output.innerHTML = "<p class=\"compare-route-empty\">Choose at least two different buildings to build a comparison.</p>";
      if (inquireLink) {
        inquireLink.href = "/inquire/?lead_capture_context=compare_shortlist";
      }
      return;
    }

    output.innerHTML = `
      <div class="compare-route-card-grid">${selectedProjects.map(renderCompareWorkspaceCard).join("")}</div>
      ${renderCompareMatrix(selectedProjects)}
    `;

    const names = selectedProjects.map((project) => project.name).join(", ");
    const message = encodeURIComponent(`I want The Scott Gordon Group to compare these buildings: ${names}.`);
    if (inquireLink) {
      inquireLink.href = `/inquire/?lead_capture_context=compare_shortlist&message=${message}`;
    }
  };

  selects.forEach((select) => {
    if (select.dataset.compareReady) return;
    select.dataset.compareReady = "true";
    select.addEventListener("change", () => {
      selectedIds = selects.map((item) => item.value).filter(Boolean);
      if (new Set(selectedIds).size !== selectedIds.length) {
        select.value = "";
        selectedIds = selects.map((item) => item.value).filter(Boolean);
      }
      writeSelection(selectedIds);
      render();
    });
  });

  render();
}

function initHomeCompareLauncher() {
  const form = document.querySelector<HTMLFormElement>("[data-home-compare-form]");
  if (!form || form.dataset.compareReady) return;

  const selects = Array.from(form.querySelectorAll<HTMLSelectElement>("[data-home-compare-select]"));
  const previewGrid = form.querySelector<HTMLElement>("[data-home-compare-preview-grid]");
  const error = form.querySelector<HTMLElement>("[data-home-compare-error]");
  if (selects.length !== 2 || !previewGrid) return;

  form.dataset.compareReady = "true";
  const selectedProjects = () => selects
    .map((select) => featuredProjects.find((project) => project.id === select.value))
    .filter((project): project is FeaturedProject => Boolean(project));

  const render = () => {
    const projects = selectedProjects();
    previewGrid.innerHTML = projects.map(renderHomepageComparePreview).join("");
    if (error) error.hidden = projects.length === 2 && projects[0].id !== projects[1].id;
  };

  selects.forEach((select) => select.addEventListener("change", render));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const projects = selectedProjects();
    if (projects.length !== 2 || projects[0].id === projects[1].id) {
      if (error) error.hidden = false;
      return;
    }
    sessionStorage.setItem("wpbCompareShortlist", JSON.stringify(projects.map((project) => project.id)));
    window.location.assign("/compare/");
  });
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

  const answerPathMatch = window.location.pathname.match(/^\/answers\/([^/]+)\/?$/);
  if (answerPathMatch && buyerIntentAnswerForSlug(answerPathMatch[1])) {
    return { type: "answer-detail", answerSlug: answerPathMatch[1] };
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

  const downtownSpotlightPathMatch = window.location.pathname.match(/^\/downtown-spotlight\/([^/]+)\/?$/);
  if (downtownSpotlightPathMatch) {
    return { type: "market-note-detail", articleSlug: downtownSpotlightPathMatch[1] };
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
    view === "about" ||
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
  if (pathname === "/about-us/" || pathname === "/about-us") return "/about/";
  if (pathname === "/contact/" || pathname === "/contact") return "/inquire/";
  if (pathname === "/floor-plans/" || pathname === "/floor-plans") return "/floorplans/";
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return `/market-notes/${blogMatch[1]}/`;
  const guidanceMatch = pathname.match(/^\/guidance\/([^/]+)\/?$/);
  if (guidanceMatch) return `/market-notes/${guidanceMatch[1]}/`;
  return "";
}

function updateCanonical(route: Route, activeProject?: FeaturedProject, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem, activeAnswer?: BuyerIntentAnswerPage) {
  const pathByRoute: Record<string, string> = {
    home: "/",
    buildings: "/buildings/",
    map: "/map/",
    corridors: "/corridors/",
    compare: "/compare/",
    about: "/about/",
    news: "/updates/",
    "downtown-spotlight": "/downtown-spotlight/",
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
    path = marketNotePath(activeMarketNote);
  }
  if (route.type === "news-detail" && activeNewsItem) {
    path = updatePath(activeNewsItem);
  }
  if (route.type === "answer-detail" && activeAnswer) {
    path = buyerIntentAnswerPath(activeAnswer);
  }
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = `${productionOrigin}${path}`;
}

function updateMetaDescription(routeType: string, activeProject?: FeaturedProject, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem, activeAnswer?: BuyerIntentAnswerPage) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
  }
  meta.content = activeAnswer?.description ?? (activeNewsItem ? updateArticleContent(activeNewsItem).excerpt : activeMarketNote?.seo.metaDescription ?? activeProject?.summary ?? metaDescriptionForRoute(routeType));
}

function metaDescriptionForRoute(routeType: string) {
  const descriptions: Record<string, string> = {
    home: siteMeta.description,
    buildings: "Compare West Palm Beach new-construction condos by corridor, pricing checks, floor plans, delivery timing, amenities, and waterfront position.",
    map: "Map West Palm Beach new-construction condo projects by North Flagler, Downtown, and South Flagler corridor context.",
    corridors: "Choose between South Flagler, North Flagler, and Downtown West Palm Beach new-construction condo corridors by lifestyle, waterfront position, and buyer fit.",
    compare: "Compare West Palm Beach new-construction condos by corridor, timing, floor plans, water views, amenities, and buyer-fit questions.",
    about: aboutPageDescription,
    news: "Track West Palm Beach condo construction, sales, financing, and planning updates with on-site articles, source links, and buyer next steps.",
    "downtown-spotlight": "Read Downtown West Palm Beach district spotlights, beginning with NORA, and follow the locations shaping condo buyer decisions.",
    "news-detail": "Read a West Palm Beach new-construction update with buyer context, related buildings, team context, and the original source link.",
    "market-notes": "Read evergreen guidance for West Palm Beach new-construction condos, including active sales, pipeline projects, floor plans, pricing checks, and corridors.",
    floorplans: "Browse released West Palm Beach new-construction condo floor plans and request current sales packets before comparing available residences.",
    answers: "Concise answers to West Palm Beach new-construction condo questions about availability, corridors, floor plans, pricing, and buyer verification.",
    "answer-detail": "Buyer-intent answer for comparing West Palm Beach new-construction condos with source-backed links and verification notes.",
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

function updateStructuredData(routeType: string, activeProject?: FeaturedProject, activeMarketNote?: MarketNote, activeNewsItem?: ExternalNewsItem, activeAnswer?: BuyerIntentAnswerPage) {
  const baseGraph = [
    {
      "@type": siteMeta.publisher.type,
      "@id": `${siteMeta.baseUrl}/#publisher`,
      name: advisorProfile.brokerage,
      url: siteMeta.baseUrl,
      telephone: advisorProfile.schemaTelephone,
      address: {
        "@type": "PostalAddress",
        addressLocality: "West Palm Beach",
        addressRegion: "FL",
        addressCountry: "US",
      },
      areaServed: siteMeta.publisher.areaServed,
    },
    {
      "@type": "RealEstateAgent",
      "@id": `${siteMeta.baseUrl}/#advisor`,
      name: teamProfile.displayName,
      jobTitle: "Palm Beach waterfront and new-construction advisory team",
      telephone: advisorProfile.schemaTelephone,
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
      : routeType === "answer-detail" && activeAnswer
        ? [
            buildBuyerIntentAnswerPageSchema(activeAnswer),
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Answers", path: "/answers/" },
              { name: activeAnswer.title, path: buyerIntentAnswerPath(activeAnswer) },
            ]),
            buildBuyerIntentFaqSchema(activeAnswer),
          ]
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
          : routeType === "downtown-spotlight"
            ? [
                buildWebPageSchema(routeType),
                buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Downtown Spotlight", path: "/downtown-spotlight/" }]),
                ...marketNotes.filter(isDowntownSpotlight).map(buildMarketNoteSchema),
              ]
          : routeType === "market-notes"
            ? [buildWebPageSchema(routeType), buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guidance", path: "/market-notes/" }]), ...buyerResourceNotes.map(buildMarketNoteSchema)]
            : routeType === "market-note-detail" && activeMarketNote
              ? [
                  buildBreadcrumbSchema([
                    { name: "Home", path: "/" },
                    {
                      name: isDowntownSpotlight(activeMarketNote) ? "Downtown Spotlight" : "Guidance",
                      path: isDowntownSpotlight(activeMarketNote) ? "/downtown-spotlight/" : "/market-notes/",
                    },
                    { name: activeMarketNote.title, path: marketNotePath(activeMarketNote) },
                  ]),
                  buildMarketNoteSchema(activeMarketNote),
                ]
            : routeType === "about"
              ? [
                  buildWebPageSchema(routeType),
                  buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "About Us", path: "/about/" }]),
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
    corridors: "/corridors/",
    compare: "/compare/",
    about: "/about/",
    news: "/updates/",
    "downtown-spotlight": "/downtown-spotlight/",
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
    corridors: "West Palm Beach Condo Corridors",
    compare: "Compare West Palm Beach New Construction Condos",
    about: "About The Scott Gordon Group",
    news: "West Palm Beach Condo Updates",
    "downtown-spotlight": "Downtown Spotlight",
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
  const staticScript = document.querySelector<HTMLScriptElement>("#wpb-static-structured-data");
  const staticPath = staticScript?.dataset.staticPath;
  if (staticScript && staticPath === window.location.pathname && !document.querySelector<HTMLScriptElement>(`#${id}`)) {
    return;
  }
  if (staticScript && staticPath !== window.location.pathname) {
    staticScript.remove();
  }
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

function buildBuyerIntentAnswerPageSchema(answer: BuyerIntentAnswerPage) {
  return {
    "@type": "WebPage",
    "@id": `${siteMeta.baseUrl}${buyerIntentAnswerPath(answer)}#webpage`,
    name: answer.title,
    url: `${siteMeta.baseUrl}${buyerIntentAnswerPath(answer)}`,
    description: answer.description,
    isPartOf: { "@id": `${siteMeta.baseUrl}/#website` },
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    reviewedBy: { "@id": `${siteMeta.baseUrl}/#advisor` },
  };
}

function buildBuyerIntentFaqSchema(answer: BuyerIntentAnswerPage) {
  return {
    "@type": "FAQPage",
    "@id": `${siteMeta.baseUrl}${buyerIntentAnswerPath(answer)}#faq`,
    name: `${answer.title} FAQ`,
    mainEntity: answer.faqs.map((item) => ({
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
    numberOfItems: approvedFloorplanLibrary.reduce((total, project) => total + project.count, 0),
    itemListElement: approvedFloorplanLibrary
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
    "@id": `${siteMeta.baseUrl}${marketNotePath(note)}#article`,
    headline: note.title,
    description: note.excerpt,
    datePublished: note.datePublished,
    dateModified: note.dateModified,
    articleSection: note.category,
    author: { "@id": `${siteMeta.baseUrl}/#advisor` },
    publisher: { "@id": `${siteMeta.baseUrl}/#publisher` },
    image: resolvedImage.src ? `${siteMeta.baseUrl}${resolvedImage.src}` : `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
    mainEntityOfPage: `${siteMeta.baseUrl}${marketNotePath(note)}`,
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
    "@id": `${siteMeta.baseUrl}/buildings/#projects`,
    name: "West Palm Beach New Construction Projects",
    itemListElement: featuredProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.name,
      url: `${siteMeta.baseUrl}${projectPath(project)}`,
    })),
  };
}

function renderProjectFilterSelect(group: "corridor" | "status" | "floorplans", label: string, filters: ProjectFilter[]) {
  return `
    <label class="project-filter-control">
      <span>${label}</span>
      <select data-project-filter-group="${group}" aria-label="${label}">
        ${filters.map((filter) => `<option value="${filter.key}">${filter.label}</option>`).join("")}
      </select>
    </label>
  `;
}

function homepageCorridorCopy(key: CorridorKey) {
  return {
    "north-flagler": "Waterfront redevelopment, marina access, and a residential feel close to downtown.",
    "south-flagler": "Palm Beach views, privacy, and a quieter waterfront setting.",
    downtown: "Walkability, restaurants, culture, and NORA nearby.",
  }[key];
}

function homeJumpIcon(name: "projects" | "corridors" | "map" | "compare" | "guides" | "answers" | "spotlight" | "updates") {
  const paths = {
    projects: '<path d="M4 20h16"/><path d="M6 20V7l8-3 4 2v14"/><path d="M9 10h2"/><path d="M9 14h2"/><path d="M14 10h2"/><path d="M14 14h2"/>',
    corridors: '<path d="M3 8c2 0 2-1.5 4-1.5S9 8 11 8s2-1.5 4-1.5S17 8 19 8s2-1.5 2-1.5"/><path d="M3 13c2 0 2-1.5 4-1.5S9 13 11 13s2-1.5 4-1.5S17 13 19 13s2-1.5 2-1.5"/><path d="M3 18c2 0 2-1.5 4-1.5S9 18 11 18s2-1.5 4-1.5S17 18 19 18s2-1.5 2-1.5"/>',
    map: '<path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
    compare: '<path d="M5 5v14"/><path d="M19 5v14"/><path d="M9 8h10"/><path d="M5 16h10"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="16" r="2"/>',
    guides: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 20V7a3 3 0 0 0-3-3"/><path d="M11 9h4"/><path d="M11 13h4"/>',
    answers: '<path d="M4 5h16v10H8l-4 4V5Z"/><path d="M8 9h8"/><path d="M8 12h5"/>',
    spotlight: '<path d="M12 3v3"/><path d="M5.6 5.6l2.1 2.1"/><path d="M18.4 5.6l-2.1 2.1"/><path d="M6 21h12"/><path d="M8 17h8"/><path d="M9 14a3 3 0 0 1 6 0v3H9v-3Z"/>',
    updates: '<path d="M5 5h10l4 4v10H5V5Z"/><path d="M15 5v4h4"/><path d="M8 13h8"/><path d="M8 16h6"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function renderHomepageAdvisoryResources() {
  const latestUpdate = [...publishedExternalNews].sort((a, b) => newsSortTimestamp(b) - newsSortTimestamp(a))[0];
  const featuredBuyerNote = marketNoteForSlug("are-branded-residences-worth-it-west-palm-beach");

  return `
    <section class="home-advisory-resources" id="resources" aria-label="Scott Gordon Group advisory and buyer resources">
      <article class="home-brooke-panel">
        <img class="home-brooke-logo" src="${teamProfile.logoMark}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <p class="eyebrow">Why Work With The Scott Gordon Group</p>
        <h2>Local guidance, clearly framed.</h2>
        <p>Backed by Douglas Elliman's global network, the Scott Gordon Group helps buyers compare buildings, locations, delivery timing, lifestyle fit, and tradeoffs before requesting current availability.</p>
        <ul>
          <li>Waterfront and Downtown condo expertise</li>
          <li>Project-by-project comparisons</li>
          <li>Private availability and floor-plan guidance</li>
          <li>Concierge-level buyer advocacy</li>
        </ul>
        <a href="/inquire/">Start a Conversation <span aria-hidden="true">→</span></a>
      </article>
      <div class="home-resource-panel">
        <div class="home-resource-feature">
          <div class="home-resource-heading">
            <p class="eyebrow">Market Intelligence</p>
            <a href="/market-notes/">View all guides <span aria-hidden="true">→</span></a>
          </div>
          ${featuredBuyerNote ? renderHomepageMarketNoteFeature(featuredBuyerNote) : ""}
        </div>
        <div class="home-resource-feature">
          <div class="home-resource-heading">
            <p class="eyebrow">Development Desk</p>
            <a href="/updates/">View all updates <span aria-hidden="true">→</span></a>
          </div>
          ${latestUpdate ? renderHomepageUpdateFeature(latestUpdate) : ""}
        </div>
      </div>
    </section>
  `;
}

function renderDowntownSpotlightIndex() {
  const spotlightNotes = marketNotes.filter((note) => note.category === "Downtown Spotlight");
  return `
    <section class="section intelligence-hero downtown-spotlight-hero">
      <div>
        <p class="eyebrow">Downtown Spotlight</p>
        <h1>Downtown West Palm Beach, one story at a time.</h1>
        <p>Follow the institutions, districts, buildings, restaurants, streets, and planning signals shaping the Downtown condo decision.</p>
      </div>
      <aside class="answer-meta-panel">
        <span>${spotlightNotes.length} article${spotlightNotes.length === 1 ? "" : "s"}</span>
        <strong>Start with the newest signal.</strong>
        <small>Institutional anchors, NORA, and future Downtown spotlights live here as the series grows.</small>
      </aside>
    </section>
    <section class="section">
      <div class="home-blog-grid market-note-grid">
        ${spotlightNotes.map(renderMarketNoteCard).join("")}
      </div>
    </section>
  `;
}

function renderHomepageMarketNoteFeature(note: MarketNote) {
  const resolvedImage = imageForContentItem(note);
  return `
    <a class="home-resource-card home-resource-card-featured" href="${marketNotePath(note)}">
      ${renderResolvedContentImage(resolvedImage, "home-resource-card-image")}
      <span>${escapeHtml(note.category)}</span>
      <strong>${escapeHtml(note.title)}</strong>
      <p>${escapeHtml(note.excerpt)}</p>
      <em>${isDowntownSpotlight(note) ? "Read Downtown Spotlight" : "Read buyer intelligence"} <b aria-hidden="true">→</b></em>
    </a>
  `;
}

function renderHomepageUpdateFeature(item: ExternalNewsItem) {
  const resolvedImage = imageForContentItem(externalNewsImageContext(item));
  const article = updateArticleContent(item);
  return `
    <a class="home-resource-card home-resource-card-featured" href="${updatePath(item)}">
      ${renderResolvedContentImage(resolvedImage)}
      <span>${publicText(item.category)} · ${publicText(formatNewsDate(newsDisplayDate(item)))}</span>
      <strong>${publicText(item.title)}</strong>
      <p>${publicText(article.excerpt)}</p>
      <em>Read latest update <b aria-hidden="true">→</b></em>
    </a>
  `;
}

function renderHomepageCompareLauncher() {
  const defaultProjects = rankedFeaturedProjects.slice(0, 2);
  const options = rankedFeaturedProjects
    .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`)
    .join("");

  return `
    <section class="home-compare-launcher" aria-label="Choose two buildings to compare">
      <div class="home-compare-launcher-copy">
        <p class="eyebrow">Compare Buildings</p>
        <h2>Start with two.</h2>
        <p>Pick two buildings to open a focused side-by-side shortlist. You can add one more project on the full comparison page.</p>
      </div>
      <form class="home-compare-form" data-home-compare-form>
        <div class="home-compare-picker-grid">
          ${defaultProjects.map((project, index) => `
            <label>
              <span>Building ${index + 1}</span>
              <select data-home-compare-select="${index}">
                ${options.replace(`value="${project.id}"`, `value="${project.id}" selected`)}
              </select>
            </label>
          `).join("")}
        </div>
        <div class="home-compare-preview-grid" data-home-compare-preview-grid>
          ${defaultProjects.map(renderHomepageComparePreview).join("")}
        </div>
        <p class="home-compare-error" data-home-compare-error hidden>Choose two different buildings to compare.</p>
        <div class="home-compare-actions">
          <button type="submit">Compare These Buildings <span aria-hidden="true">→</span></button>
          <a href="/inquire/">Ask The Scott Gordon Group for Guidance <span aria-hidden="true">↗</span></a>
        </div>
      </form>
    </section>
  `;
}

function renderHomepageComparePreview(project: FeaturedProject) {
  const image = homepageProjectCardImage(project.id) || (project.image && canShowImage(project.image) ? project.image : undefined);
  return `
    <article class="home-compare-preview" data-home-compare-preview="${project.id}">
      ${image
        ? `<img src="${safeHref(image)}" alt="${escapeHtml(`${project.name} project preview`)}" loading="lazy" decoding="async" />`
        : `<div class="image-placeholder">${escapeHtml(project.corridor)}</div>`}
      <div>
        <span>${escapeHtml(project.corridor)} · ${escapeHtml(project.status)}</span>
        <strong>${escapeHtml(project.name)}</strong>
      </div>
    </article>
  `;
}

function renderBuildingsRouteView() {
  return `
    <div class="route-view route-view-buildings" data-route-view="buildings" hidden>
      <section class="buildings-route-hero">
        <p class="eyebrow">Project Directory</p>
        <h1 data-directory-title>Browse West Palm Beach New Construction</h1>
        <p data-directory-deck>Explore the city’s tracked condo developments by corridor, sales status, floorplan availability, and practical buyer fit.</p>
      </section>
      <section class="project-sort-shell buildings-directory" id="projects">
        <div class="project-sort-header">
          <div>
            <p class="eyebrow" data-directory-kicker>All Projects</p>
            <h2 data-directory-subtitle>${escapeHtml(approvedHomepageOverride("featured-buildings")?.headline || "Open the complete project directory.")}</h2>
            <p class="selected-filter-summary" data-filter-summary>${escapeHtml(approvedHomepageOverride("featured-buildings")?.subhead || "All tracked projects shown. Filter by corridor, readiness, or floorplan availability.")}</p>
            <div class="project-filter-controls" aria-label="Project filters">
              ${renderProjectFilterSelect("corridor", "Corridor", projectCorridorFilters)}
              ${renderProjectFilterSelect("status", "Status", projectStatusFilters)}
              ${renderProjectFilterSelect("floorplans", "Floorplans", projectFloorplanFilters)}
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
    </div>
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
  if (key === "downtown") return "/corridors/downtown-west-palm-beach/";
  return `/corridors/${key}/`;
}

function corridorDirectoryPath(key: CorridorKey) {
  return `/buildings/?filter=${key}`;
}

function corridorImageId(key: CorridorKey) {
  if (key === "north-flagler") return "flagler-waterfront-corridor";
  if (key === "south-flagler") return "south-flagler-corridor";
  return "rosemary-square-corridor";
}

function corridorDisplayLabel(key: CorridorKey) {
  if (key === "north-flagler") return "NORTH FLAGLER";
  if (key === "south-flagler") return "SOUTH FLAGLER";
  return "DOWNTOWN / ROSEMARY";
}

function corridorBuyerQuestions(key: CorridorKey) {
  const questions: Record<CorridorKey, string[]> = {
    "north-flagler": [
      "How important is direct water access or marina proximity?",
      "Do you prefer a larger amenity-driven building or a smaller boutique setting?",
      "How do you feel about buying into an evolving corridor?",
    ],
    downtown: [
      "Do you want to walk to dining, retail, and entertainment?",
      "Is a branded or hospitality-driven residence important?",
      "How much privacy do you expect in an urban setting?",
    ],
    "south-flagler": [
      "Do you want a quieter waterfront address over urban walkability?",
      "How important are Palm Beach views and proximity?",
      "Are you comparing boutique privacy or larger amenity depth?",
    ],
  };
  return questions[key];
}

function corridorComparisonConsiderations(key: CorridorKey) {
  const considerations: Record<CorridorKey, string[]> = {
    "north-flagler": [
      "Waterfront exposure and view protection",
      "Distance to downtown, Palm Beach, and PBI",
      "Building scale, services, and amenity depth",
    ],
    downtown: [
      "Walkability and nearby daily conveniences",
      "Parking, access, and traffic patterns",
      "Brand, service model, and building energy",
    ],
    "south-flagler": [
      "View corridors toward Palm Beach and the ocean",
      "Residence size, layout, and terrace depth",
      "Service level, privacy, and long-term positioning",
    ],
  };
  return considerations[key];
}

function corridorPageHeadline(key: CorridorKey) {
  if (key === "north-flagler") return "North Flagler Waterfront Living";
  if (key === "south-flagler") return "South Flagler Waterfront Residences";
  return "Downtown West Palm Beach Living";
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

function renderMapRouteView() {
  return `
    <div class="route-view route-view-map" data-route-view="map" hidden>
      <section class="map-route-page" aria-label="Interactive West Palm Beach project map">
        <div class="map-route-intro">
          <p class="eyebrow">Project Map</p>
          <h1>West Palm Beach project map.</h1>
          <p>Use the filters to narrow the map, then click a project pin for the building summary and guide link.</p>
        </div>
        <div class="map-route-workspace">
          <aside class="map-route-sidebar" aria-label="Map filters and selected project">
            ${renderMapControls()}
          </aside>
          <aside class="home-hero-map-card map-route-map-card" aria-label="West Palm Beach project map">
            <figure class="hero-map-preview">
              <div class="hero-google-map" data-hero-google-map aria-label="Google map of West Palm Beach new-construction project locations"></div>
              <button class="hero-map-expand" type="button" data-map-expand>Showing all locations</button>
              <div class="hero-map-fallback">
                ${renderProjectMapFallback()}
              </div>
            </figure>
            <div class="home-map-count" aria-label="Map project count">
              <strong>${featuredProjects.length}</strong>
              <span>tracked West Palm Beach new-construction projects</span>
            </div>
          </aside>
        </div>
      </section>
    </div>
  `;
}

function corridorHubCards() {
  return [
    {
      key: "south-flagler" as CorridorKey,
      corridorKey: "south-flagler",
      kicker: "Palm Beach Views",
      headline: "Palm Beach Views, Quieter Waterfront Prestige",
      body:
        "South Flagler is the polished waterfront choice for buyers who want larger residences, direct views toward Palm Beach, and a more private residential setting. The appeal is proximity to the island, architectural quality, and a quieter rhythm than Downtown.",
      image: "/assets/home/south-flagler-corridor-hero-main-wide-v01.jpg",
      alt: "South Flagler waterfront corridor with Palm Beach and Intracoastal context",
    },
    {
      key: "north-flagler" as CorridorKey,
      corridorKey: "north-flagler",
      kicker: "Waterfront Growth",
      headline: "Waterfront Growth, Marina Energy, Long-Term Upside",
      body:
        "North Flagler is West Palm Beach's emerging waterfront frontier, with new towers, marina-oriented amenities, and major redevelopment reshaping the corridor. It works best for buyers who want water views, larger amenity packages, boating access, and future upside.",
      image: "/assets/home/north-flagler-corridor-skyline-ultra-wide-v01.jpg",
      alt: "North Flagler waterfront skyline and marina corridor in West Palm Beach",
    },
    {
      key: "downtown" as CorridorKey,
      corridorKey: "downtown",
      kicker: "Walkable Living",
      headline: "Walkable Living Near Dining, Culture, and Transit",
      body:
        "Downtown is for buyers who want restaurants, offices, Brightline, CityPlace, Clematis, the Kravis Center, and the NORA District close by. It is the most convenient and urban corridor, with more energy and less reliance on a car.",
      image: "/assets/home/downtown-cityplace-shared-card-v01.jpg",
      alt: "Downtown West Palm Beach CityPlace and urban retail district",
    },
  ];
}

function renderCorridorsRouteView() {
  return `
    <div class="route-view route-view-corridors" data-route-view="corridors" hidden>
      <section class="corridors-hero">
        ${renderEditorialImagePanel("wpb-corridors-aerial-hero", { hero: true, caption: "Choose by geography", credit: false, className: "corridors-hero-image" })}
        <div class="corridors-hero-copy">
          <p class="eyebrow">Corridors</p>
          <h1>Choose Your West Palm Beach Corridor</h1>
          <p>Each part of West Palm Beach offers a different version of new-construction living: waterfront privacy, downtown energy, marina access, or Palm Beach proximity.</p>
        </div>
      </section>

      <section class="section corridors-intro-section" aria-label="Choose your West Palm Beach corridor">
        <div>
          <p class="eyebrow">Choose Your West Palm Beach Corridor</p>
          <h2>West Palm Beach new construction is not one market.</h2>
        </div>
        <p>South Flagler, North Flagler, and Downtown each offer a different lifestyle, price point, and long-term value story. Start with where you want to live, then compare the buildings that fit that daily routine.</p>
      </section>

      <section class="home-atlas-feature home-atlas-feature-editorial home-atlas-compact corridors-atlas-feature" aria-label="West Palm Beach project map">
        <div class="home-atlas-compact-heading corridors-atlas-heading">
          <div>
            <p class="eyebrow">Project Map</p>
          </div>
        </div>
        <div class="home-atlas-frame">
          <aside class="home-hero-map-card home-atlas-map-card home-atlas-map-only" aria-label="West Palm Beach project map">
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
          <div class="home-atlas-projects">
            <p>Projects shown on map</p>
            <div class="home-atlas-project-strip" role="region" aria-label="Projects shown on the corridor map" tabindex="0">
              ${validMapProjects(rankedFeaturedProjects.slice(0, 7)).map(renderHomepageAtlasProject).join("")}
            </div>
          </div>
        </div>
      </section>

      <section class="section corridors-card-section" aria-label="West Palm Beach corridor choices">
        <div class="section-heading corridor-heading">
          <p class="eyebrow">Explore Corridors</p>
        </div>
        <div class="corridors-feature-grid">
          ${corridorHubCards().map(renderCorridorsFeatureCard).join("")}
        </div>
      </section>

      <section class="corridors-final-cta">
        <div>
          <h2>Ready to compare the right buildings?</h2>
          <p>Start with the corridor, then ask for current availability, floor plans, and buyer notes.</p>
        </div>
        <a class="button primary" href="/buildings/">View Projects <span aria-hidden="true">→</span></a>
        <a class="button ghost" href="/inquire/?lead_capture_context=corridors">Inquire Now</a>
      </section>
    </div>
  `;
}

function renderCorridorsFeatureCard(card: ReturnType<typeof corridorHubCards>[number]) {
  const directoryPath = corridorDirectoryPath(card.key);
  return `
    <article class="corridors-feature-card">
      <a class="corridors-feature-image" href="${directoryPath}" aria-label="Explore ${corridorDisplayLabel(card.key)} projects">
        <img src="${safeHref(card.image)}" alt="${escapeHtml(card.alt)}" loading="lazy" decoding="async" />
      </a>
      <div>
        <span>${escapeHtml(card.kicker)}</span>
        <h2>${escapeHtml(card.headline)}</h2>
        <p>${escapeHtml(card.body)}</p>
        <a href="${directoryPath}">View ${corridorDisplayLabel(card.key)} Projects <span aria-hidden="true">→</span></a>
      </div>
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

function renderCompareWorkspaceCard(project: FeaturedProject) {
  const image = homepageProjectCardImage(project.id) || (project.image && canShowImage(project.image) ? project.image : undefined);
  return `
    <article class="compare-route-card">
      ${image
        ? `<img src="${safeHref(image)}" alt="${escapeHtml(`${project.name} project preview`)}" loading="lazy" decoding="async" />`
        : `<div class="image-placeholder">${escapeHtml(project.corridor)}</div>`}
      <div>
        <span>${escapeHtml(project.corridor)} · ${escapeHtml(project.status)}</span>
        <h2><a href="${projectPath(project)}">${escapeHtml(project.name)}</a></h2>
        <p>${escapeHtml(compareBuyerFit(project))}</p>
        <a href="${projectPath(project)}">View building guide <b aria-hidden="true">→</b></a>
      </div>
    </article>
  `;
}

function renderCompareAmenities(project: FeaturedProject) {
  const copy = batch1ProjectCopyByProjectId.get(project.id);
  const highlights = copy?.showcase?.amenityHighlights ?? [];
  if (highlights.length) {
    return `<ul class="compare-amenity-list">${highlights.map((item) => `<li>${publicText(item.label)}</li>`).join("")}</ul>`;
  }
  const fallback = copy?.amenities || copy?.amenityNarrative;
  return fallback ? `<p class="compare-cell-copy">${publicText(fallback)}</p>` : "Request current amenity packet";
}

function compareAddress(project: FeaturedProject) {
  return project.address.length > 64 || /confirm|until|reference|sponsor|legal address|offering docs|fact-sheet|expose/i.test(project.address)
    ? "Confirm current project address"
    : project.address;
}

function renderCompareMatrix(projects: FeaturedProject[]) {
  const rows = [
    ["Corridor", (project: FeaturedProject) => project.corridor],
    ["Status", (project: FeaturedProject) => project.status],
    ["Delivery", (project: FeaturedProject) => project.delivery],
    ["Residences", (project: FeaturedProject) => project.residences],
    ["Pricing guidance", (project: FeaturedProject) => project.price],
    ["Address", (project: FeaturedProject) => compareAddress(project)],
    ["Floorplans", (project: FeaturedProject) => getFloorplanProject(project.id)?.count ? `${getFloorplanProject(project.id)?.count} tracked records` : project.floorplans ? "Public plans available" : "Request current packet"],
    ["Buyer fit", (project: FeaturedProject) => compareBuyerFit(project)],
    ["Verify next", (project: FeaturedProject) => compareVerificationNeed(project)],
  ] as Array<[string, (project: FeaturedProject) => string]>;

  return `
    <p class="compare-matrix-hint">Swipe to review every comparison point <span aria-hidden="true">→</span></p>
    <div class="compare-matrix-wrap">
      <table>
        <thead><tr><th>Comparison point</th>${projects.map((project) => `<th><a href="${projectPath(project)}">${escapeHtml(project.name)}</a></th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map(([label, value]) => `<tr><th>${label}</th>${projects.map((project) => `<td>${escapeHtml(value(project))}</td>`).join("")}</tr>`).join("")}
          <tr class="compare-amenity-row"><th>Amenities</th>${projects.map((project) => `<td>${renderCompareAmenities(project)}</td>`).join("")}</tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderAuthorityComparisonTable(projects: FeaturedProject[]) {
  return `
    <div class="comparison-table-wrap">
      <table>
        <thead><tr><th>Building</th><th>Status</th><th>Delivery</th><th>Floorplans</th><th>Buyer verification</th></tr></thead>
        <tbody>${projects.map((project) => {
          const source = sourceFactForProject(project.id)?.facts;
          const floorplanProject = getFloorplanProject(project.id);
          return `<tr><td><a href="${projectPath(project)}">${publicText(project.name)}</a></td><td>${publicText(source?.status || project.status || "Needs verification")}</td><td>${publicText(source?.completion || project.delivery || "Needs verification")}</td><td>${floorplanProject?.count ? `${floorplanProject.count} tracked records` : "Request current packet"}</td><td>${publicText(compareVerificationNeed(project))}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
  `;
}

function corridorBestFit(key: CorridorKey) {
  if (key === "north-flagler") return "Waterfront shortlist with the most active comparison depth.";
  if (key === "downtown") return "Walkability, restaurants, district energy, and hotel-style service.";
  return "Quieter waterfront ownership, privacy, and Palm Beach proximity.";
}

function renderCompareRouteView() {
  const options = rankedFeaturedProjects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("");

  return `
    <div class="route-view route-view-compare" data-route-view="compare" hidden>
      <figure class="compare-page-hero">
        <img src="/assets/home/north-flagler-corridor-skyline-ultra-wide-v01.jpg" alt="West Palm Beach waterfront condominium skyline" decoding="async" />
      </figure>
      <section class="section compare-page-intro">
        <div>
          <p class="eyebrow">Compare</p>
          <h1>Compare West Palm Beach New Construction</h1>
          <p>Choose two buildings, add a third if useful, and review the practical differences before requesting current availability.</p>
        </div>
      </section>
      <section class="section compare-workspace">
        <div class="compare-workspace-head">
          <div>
            <p class="eyebrow">Build Your Comparison</p>
            <h2>Build a focused shortlist.</h2>
            <p>Compare the tracked facts and amenity scheme, then verify pricing, availability, fees, and line-specific details before relying on public information.</p>
          </div>
          <a href="/inquire/?lead_capture_context=compare_shortlist" data-compare-inquire>Ask The Scott Gordon Group to compare these buildings <span aria-hidden="true">↗</span></a>
        </div>
        <div class="compare-route-selectors">
          ${["Building 1", "Building 2", "Optional third building"].map((label, index) => `
            <label>
              <span>${label}</span>
              <select data-compare-route-select="${index}">
                <option value="">${index === 2 ? "No third building" : "Choose a building"}</option>
                ${options}
              </select>
            </label>
          `).join("")}
        </div>
        <div class="compare-results" data-compare-results>
          <p class="compare-route-empty">Choose at least two different buildings to build a comparison.</p>
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
          <p class="eyebrow">Corridor Guide</p>
          <h1>${corridorPageHeadline(section.key)}</h1>
          <p>${section.description}</p>
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
          <p class="eyebrow">Comparison Considerations</p>
          <ul>
            ${corridorComparisonConsiderations(section.key).map((consideration) => `<li>${consideration}</li>`).join("")}
          </ul>
          <a href="/inquire/?lead_capture_context=corridor&message=${encodeURIComponent(`I want help comparing ${section.label} projects.`)}">Inquire Now for ${section.label} guidance <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      ${renderCorridorAuthoritySections(section, projects)}
      <section class="project-sort-shell corridor-project-shell">
        <div class="project-sort-header">
          <div>
            <p class="eyebrow">Corridor Projects</p>
            <h2>${section.label} buildings currently tracked.</h2>
            <p class="selected-filter-summary">These are the buildings assigned to ${section.label}. Return to all buildings when you want a citywide comparison.</p>
          </div>
          <a class="corridor-back-link" href="/buildings/">All projects <span aria-hidden="true">→</span></a>
        </div>
        <div class="front-project-grid front-project-grid-static">
          ${projects.map(renderFeaturedProject).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCorridorAuthoritySections(section: CorridorSection, projects: FeaturedProject[]) {
  return `
    <section class="section corridor-authority-section" aria-label="${section.label} authority summary">
      <div class="section-heading">
        <p class="eyebrow">BLUF</p>
        <h2>How to use ${publicText(section.label)} in a buyer shortlist.</h2>
        <p>Use the table below to compare sourced status, delivery language, floorplan depth, and current verification needs before treating any two buildings as interchangeable.</p>
      </div>
      ${renderAuthorityComparisonTable(projects)}
    </section>
    <section class="section corridor-faq-section" aria-label="${section.label} buyer FAQs">
      <div class="section-heading">
        <p class="eyebrow">FAQ</p>
        <h2>Buyer questions for ${publicText(section.label)}.</h2>
      </div>
      <div class="answer-list">
        ${corridorFaq(section, projects).map((item) => `
          <article class="answer-block">
            <h3>${publicText(item.question)}</h3>
            <p>${publicText(item.answer)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function corridorFaq(section: CorridorSection, projects: FeaturedProject[]) {
  const projectLinks = projects.slice(0, 4).map((project) => project.name).join(", ");
  return [
    {
      question: `What is the bottom line on ${section.label}?`,
      answer: `${section.label} is a ${corridorBestFit(section.key).toLowerCase()} The current tracked set includes ${projectLinks || "projects that need review"}. Confirm current availability, pricing, fees, delivery timing, and floorplan release status before relying on public summaries.`,
    },
    {
      question: `Which ${section.label} buildings should buyers compare first?`,
      answer: projectLinks ? `Start with ${projectLinks}, then use project pages and the comparison page to verify floorplans, timing, status, and open confirmation notes.` : "Start with the tracked project list, then confirm which buildings have current buyer packets and released floorplans.",
    },
    {
      question: `What should buyers verify in ${section.label}?`,
      answer: corridorBuyerQuestions(section.key).join(" "),
    },
  ];
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
        <a href="${marketNotePath(note)}">${escapeHtml(cardOverride?.ctaLabel || (isDowntownSpotlight(note) ? "Read Spotlight" : "Read Guidance"))} <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function isDowntownSpotlight(note: MarketNote) {
  return note.category === "Downtown Spotlight";
}

function marketNotePath(note: MarketNote) {
  return isDowntownSpotlight(note) ? `/downtown-spotlight/${note.slug}/` : `/market-notes/${note.slug}/`;
}

function publicGuidanceLabel(category: string) {
  if (/downtown spotlight/i.test(category)) return "Downtown Spotlight";
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
  const sourceStatus = note.sourceLinks.length ? "Source-linked buyer note" : "Buyer guidance note";

  return `
    <article class="market-note-article">
      <header class="section market-note-hero">
        <div>
          <a class="market-note-back" href="${isDowntownSpotlight(note) ? "/downtown-spotlight/" : "/market-notes/"}">${isDowntownSpotlight(note) ? "All Downtown Spotlights" : "Guidance"}</a>
          <p class="eyebrow">${escapeHtml(note.category)}</p>
          <h1>${escapeHtml(note.title)}</h1>
          <p class="market-note-dek">${escapeHtml(note.excerpt)}</p>
          <p class="market-note-hero-thesis">${escapeHtml(note.buyerThesis)}</p>
        </div>
        ${renderResolvedContentImage(resolvedImage, "market-note-hero-image", { caption: false })}
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
                  ${
                    section.bullets?.length
                      ? `<ul class="market-note-list">${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                      : ""
                  }
                  ${section.imageId ? renderEditorialImagePanel(section.imageId, { className: "market-note-inline-image", caption: false, credit: false }) : ""}
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
          ${renderMarketNoteSourceLinks(note)}
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
      ${renderMarketNoteWorkWithUs(note)}
    </article>
  `;
}

function renderMarketNoteWorkWithUs(note: MarketNote) {
  return `
    <section class="about-work-section market-note-work-section">
      <div>
        <p class="eyebrow">Work With Us - West Palm Beach New Construction</p>
        <h2>Your advocate from reservation to closing.</h2>
        <p>Investing in a new-construction residence is not just about floor plans and finishes - it is about securing a lifestyle in one of South Florida's most competitive markets. As Palm Beach waterfront and condo specialists, we track new developments from boutique villa enclaves to full-service high-rises.</p>
        <p>Our team's deep ties to builders and project insiders mean you get early insights, transparent comparisons and sharp negotiation. We will help you evaluate amenities, understand timelines and protect your interests from reservation to closing.</p>
        <a class="button primary" href="/inquire/?interest=compare&message=${encodeURIComponent(`I want help applying this article: ${note.title}`)}&lead_capture_context=article_work_with_us">Start a private comparison</a>
      </div>
    </section>
  `;
}

function renderMarketNoteSourceLinks(note: MarketNote) {
  if (!note.sourceLinks.length) return "";
  return `
    <aside class="market-note-source-box">
      <span>Reviewed sources</span>
      <ul>
        ${note.sourceLinks
          .map((source) => {
            const isExternal = /^https?:\/\//i.test(source.href);
            return `<li><a href="${safeHref(source.href)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(source.label)}</a><small>${escapeHtml(source.sourceType)}</small></li>`;
          })
          .join("")}
      </ul>
    </aside>
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

function projectAssetToMedia(asset: ProjectAsset, kicker?: string): MediaAsset {
  return {
    src: asset.src,
    kicker: kicker ?? asset.placement,
    title: asset.title,
    alt: asset.alt,
  };
}

function approvedMediaAssetsForProject(project: FeaturedProject, placement: ProjectAssetPlacement) {
  return getApprovedProjectAssets(project)
    .filter((asset) => asset.placement === placement)
    .map((asset) => projectAssetToMedia(asset, placement === "logos" ? "Project Team" : asset.placement));
}

function projectImageForContent(project: FeaturedProject) {
  return getProjectHeroAsset(project)?.src
    ?? curatedProjectImage(project)
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

function renderResolvedContentImage(image: ResolvedContentImage, className = "", options: { caption?: boolean } = {}) {
  const caption = image.source === "imported" ? `${image.caption} · ${image.credit}` : image.caption;
  return `
    <figure class="${["content-image-panel", className].filter(Boolean).join(" ")}" data-image-source="${image.source}">
      <img src="${safeHref(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" />
      ${options.caption === false ? "" : `<figcaption>${publicText(caption)}</figcaption>`}
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

function projectCopyFact(copyPackage: ProjectCopyPackage | undefined, labelPattern: RegExp) {
  return copyPackage?.quickFacts?.find((fact) => labelPattern.test(fact.label))?.value;
}

function isBuyerFacingValue(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return false;
  return !/^(null|undefined|unknown|n\/a|na|tbd|none)$/i.test(text)
    && !/not (yet )?publicly confirmed|needs verification|verify$|^verify\b|^request$|request current|available on request|confirm before|confirm with|not released|timing not released|on request/i.test(text);
}

function copyFactValue(copyPackage: ProjectCopyPackage | undefined, labelPattern: RegExp, fallback = "") {
  return projectCopyFact(copyPackage, labelPattern) ?? fallback;
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
  const homepageCardImage = homepageProjectCardImage(project.id);
  const media = cardOverride?.imagePath
    ? `<img src="${safeHref(cardOverride.imagePath)}" alt="${escapeHtml(cardOverride.alt || `${project.name} project preview`)}" loading="lazy" decoding="async" />`
    : homepageCardImage
    ? `<img src="${homepageCardImage}" alt="${project.name} project preview" loading="lazy" decoding="async" />`
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

function renderAboutRouteView() {
  return `
    <div class="route-view route-view-about" data-route-view="about" hidden>
      <section class="about-hero">
        <figure>
          <img src="${teamProfile.photo}" alt="${teamProfile.photoAlt}" decoding="async" />
        </figure>
        <div>
          <div class="about-brand-lockup" aria-label="${teamProfile.logoAlt}">
            <img src="${teamProfile.logoMark}" alt="" decoding="async" />
            <span>
              <strong>${teamProfile.displayName}</strong>
              <em>Douglas Elliman Real Estate</em>
            </span>
          </div>
          <p class="eyebrow">${teamProfile.presentedBy}</p>
          <h1>Decades of waterfront excellence.</h1>
          <p>Since the early 1980s, the Scott Gordon Group has specialized in luxury oceanfront and lakefront real estate on Palm Beach Island. What began as Scott and Mindy Gordon's boutique brokerage has grown into an established Palm Beach team, now operating as Scott Gordon Luxury Properties at Douglas Elliman Real Estate.</p>
          <div class="about-hero-actions">
            <a class="button primary" href="/inquire/?lead_capture_context=about_hero">Work With Us</a>
            <a class="button ghost" href="${advisorProfile.mobileHref}">Call ${advisorProfile.mobile}</a>
          </div>
        </div>
      </section>

      <section class="about-work-section">
        <div>
          <p class="eyebrow">Work With Us - West Palm Beach New Construction</p>
          <h2>Your advocate from reservation to closing.</h2>
          <p>Investing in a new-construction residence is not just about floor plans and finishes - it is about securing a lifestyle in one of South Florida's most competitive markets. As Palm Beach waterfront and condo specialists, we track new developments from boutique villa enclaves to full-service high-rises.</p>
          <p>Our team's deep ties to builders and project insiders mean you get early insights, transparent comparisons and sharp negotiation. We will help you evaluate amenities, understand timelines and protect your interests from reservation to closing.</p>
          <a class="button primary" href="/inquire/?interest=compare&message=I%20want%20a%20private%20WPB%20new-construction%20comparison.&lead_capture_context=about_work_with_us">Start a private comparison</a>
        </div>
      </section>

      <section class="section about-intro-grid">
        <article>
          <span>Availability</span>
          <strong>Current packet</strong>
          <p>Request current pricing, available lines, incentives, delivery timing, fees, parking assumptions, and direct buyer notes.</p>
        </article>
        <article>
          <span>Comparison</span>
          <strong>Floorplans</strong>
          <p>Compare released plans, stack exposure, view tradeoffs, residence size, and nearby building alternatives before touring.</p>
        </article>
        <article>
          <span>Strategy</span>
          <strong>Shortlist</strong>
          <p>Use private market context to decide which buildings deserve a visit, a packet request, or a deeper negotiation review.</p>
        </article>
      </section>

      <section class="section about-story-section">
        <div class="section-heading">
          <p class="eyebrow">About Us</p>
          <h2>We know the water, the buildings, and the buyer questions that matter.</h2>
        </div>
        <div class="about-story-columns">
          <p>Palm Beach, Manalapan, Hypoluxo Island, Delray Beach and Wellington each have their own rhythms. We live and breathe these communities. Scott Gordon has been marketing and selling luxury waterfront condos, townhouses and single-family residences here since 1984. Mindy Gordon, who joined the team in 2012 after building and selling one of the first online contact-lens companies, applies her marketing acumen to give your property focused exposure.</p>
          <p>The team brings media savvy, Wellington expertise, marketing discipline, and a no-job-is-too-small service standard, ensuring clients always have a responsive point of contact. Our size is our strength. We limit our client roster so that every buyer or seller receives our full attention, from first comparison to closing.</p>
        </div>
      </section>

      <section class="section about-results-section">
        <div>
          <p class="eyebrow">Results You Can Measure</p>
          <h2>Recognized performance with boutique attention.</h2>
        </div>
        <div class="about-results-grid">
          <article><span>RealTrends 2024</span><strong>$1.99M</strong><p>Average home price reported for the team in provided RealTrends data.</p></article>
          <article><span>RealTrends 2024</span><strong>$32.89M</strong><p>Annual volume reported in provided RealTrends data, with an 8th-place Palm Beach volume ranking.</p></article>
          <article><span>2026</span><strong>$100M+</strong><p>Team-supplied sales and pending contracts, plus four Douglas Elliman Ellie Awards distinctions.</p></article>
          <article><span>Ellie Awards</span><strong>#8 Team</strong><p>Team-supplied Gross Commission Income ranking in Florida, with Pinnacle Award recognition for the top 4% of agents.</p></article>
        </div>
      </section>

      <section class="section about-team-section">
        <div class="section-heading">
          <p class="eyebrow">The Team</p>
          <h2>Principals who stay close to the work.</h2>
        </div>
        <div class="about-team-grid">
          <article><span>Scott Gordon</span><p>Luxury waterfront condo, townhouse, and single-family residence expertise across Palm Beach and the surrounding coastal markets since 1984.</p></article>
          <article><span>Mindy Gordon</span><p>Marketing leadership shaped by entrepreneurial experience and a focus on giving listings clear, high-quality exposure.</p></article>
          <article><span>Client Service</span><p>Responsive West Palm Beach and Wellington guidance for buyers who need current new-construction pricing, floor plans, and private comparison context.</p></article>
        </div>
      </section>

      <section class="section about-service-section">
        <div>
          <p class="eyebrow">Beyond the Closing</p>
          <h2>Service that extends beyond the transaction.</h2>
        </div>
        <p>The Scott Gordon Group believes in giving back to the communities it serves and measures success by the relationships it builds, not only by the properties it sells.</p>
      </section>
    </div>
  `;
}

function renderHomepageFeaturedProject(project: FeaturedProject) {
  const cardOverride = approvedHomepageCardOverride("featuredBuildings", project.id);
  const homepageCardImage = homepageProjectCardImage(project.id);
  const image = cardOverride?.imagePath
    ? safeHref(cardOverride.imagePath)
    : homepageCardImage || (project.image && canShowImage(project.image) ? project.image : undefined);

  return `
    <article class="home-featured-card">
      <a href="${projectPath(project)}" aria-label="View ${escapeHtml(project.name)}">
        <figure>
          ${image
            ? `<img src="${image}" alt="${escapeHtml(cardOverride?.alt || `${project.name} project preview`)}" loading="lazy" decoding="async" />`
            : `<div class="project-card-placeholder image-placeholder"><span>${project.corridor}</span><strong>${project.name}</strong></div>`}
        </figure>
        <div>
          <span>${escapeHtml(project.corridor)} · ${escapeHtml(project.status)}</span>
          <strong>${escapeHtml(cardOverride?.headline || project.name)}</strong>
          <small>${escapeHtml(project.delivery)}</small>
          <em>View project <b aria-hidden="true">→</b></em>
        </div>
      </a>
    </article>
  `;
}

function renderHomepageAtlasProject(project: FeaturedProject) {
  const image = homepageProjectCardImage(project.id) || (project.image && canShowImage(project.image) ? project.image : undefined);
  return `
    <a class="home-atlas-project-card" href="${projectPath(project)}">
      ${image
        ? `<img src="${safeHref(image)}" alt="${escapeHtml(`${project.name} project preview`)}" loading="lazy" decoding="async" />`
        : `<span class="image-placeholder">${escapeHtml(project.corridor)}</span>`}
      <span>
        <small>${escapeHtml(project.corridor)}</small>
        <strong>${escapeHtml(project.name)}</strong>
        <em>${escapeHtml(project.delivery)}</em>
      </span>
    </a>
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

function skippedMapProjects(projects: FeaturedProject[]) {
  return projects.filter((project) => !Number.isFinite(project.latitude) || !Number.isFinite(project.longitude));
}

function mapStatusFilter(project: FeaturedProject): Exclude<MapStatusFilter, "all"> {
  if (/completed|delivered/i.test(project.status)) return "completed";
  if (/pipeline|planning|proposed|announced|emerging/i.test(project.status)) return "pipeline";
  return "active";
}

function mapProjectMatchesFilters(project: FeaturedProject, corridor: string, status: MapStatusFilter) {
  return (corridor === "all" || project.corridorKey === corridor) && (status === "all" || mapStatusFilter(project) === status);
}

function renderMapFilterButton(group: "corridor" | "status", value: string, label: string, active = false) {
  return `<button class="map-filter-chip${active ? " is-active" : ""}" type="button" data-map-filter="${group}" data-map-filter-value="${value}" aria-pressed="${active}">${label}</button>`;
}

function renderMapProjectDetail(project: FeaturedProject) {
  return `
    <p class="eyebrow">Selected Project</p>
    <strong>${escapeHtml(project.name)}</strong>
    <span>${escapeHtml(project.corridor)} · ${escapeHtml(project.status)}</span>
    <p>${escapeHtml(project.summary)}</p>
    <a href="${projectPath(project)}">View project guide <span aria-hidden="true">→</span></a>
  `;
}

function renderMapControls() {
  const initialProject = validMapProjects(rankedFeaturedProjects)[0];
  const skipped = skippedMapProjects(rankedFeaturedProjects);
  return `
    <div class="map-route-controls" data-map-controls>
      <div class="map-filter-group" aria-label="Filter map by corridor">
        <span>Corridor</span>
        <div>
          ${renderMapFilterButton("corridor", "all", "All corridors", true)}
          ${corridorSections.map((section) => renderMapFilterButton("corridor", section.key, corridorDisplayLabel(section.key))).join("")}
        </div>
      </div>
      <div class="map-filter-group" aria-label="Filter map by project status">
        <span>Status</span>
        <div>
          ${renderMapFilterButton("status", "all", "All stages", true)}
          ${renderMapFilterButton("status", "active", "Active")}
          ${renderMapFilterButton("status", "pipeline", "Pipeline")}
          ${renderMapFilterButton("status", "completed", "Completed")}
        </div>
      </div>
      <p class="map-filter-result" data-map-filter-result>${validMapProjects(rankedFeaturedProjects).length} mapped projects</p>
    </div>
    <article class="map-project-detail" data-map-project-detail aria-live="polite">
      ${initialProject ? renderMapProjectDetail(initialProject) : "<p>No mapped projects are currently available.</p>"}
    </article>
    ${
      skipped.length
        ? `<p class="map-coordinate-note">${skipped.length} tracked ${skipped.length === 1 ? "project is" : "projects are"} listed below but omitted from the map until coordinates are confirmed.</p>`
        : ""
    }
  `;
}

function createMapMarker(
  maps: GoogleMapsNamespace,
  map: unknown,
  position: { lat: number; lng: number },
  title: string,
  priority: "primary" | "secondary",
  onClick: () => void,
): GoogleMarkerHandle {
  const marker = new maps.Marker({
    map,
    position,
    title,
    clickable: true,
    optimized: true,
    icon: projectMapMarkerIcon(maps, priority),
  });
  marker.addListener("click", onClick);
  return {
    clear: () => {
      marker.setMap(null);
    },
  };
}

function projectMapMarkerIcon(maps: GoogleMapsNamespace, priority: "primary" | "secondary") {
  return {
    path: maps.SymbolPath.CIRCLE,
    scale: priority === "primary" ? 9 : 6,
    fillColor: priority === "primary" ? "#17202a" : "#4e5962",
    fillOpacity: 1,
    strokeColor: "#fffaf1",
    strokeOpacity: 1,
    strokeWeight: priority === "primary" ? 2.5 : 1.75,
  };
}

function googleMapBaseOptions(center: { lat: number; lng: number }, zoom: number): Record<string, unknown> {
  const mapOptions: Record<string, unknown> = {
    center,
    zoom,
    styles: cleanProjectMapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    keyboardShortcuts: false,
    gestureHandling: "cooperative",
  };

  return mapOptions;
}

function initHeroGoogleMap() {
  const routeType = getCurrentRoute().type;
  if (routeType !== "home" && routeType !== "map" && routeType !== "corridors" && routeType !== "project") {
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
      if (!canvas.isConnected) return;
      const focusProject = rankedFeaturedProjects.find((project) => project.id === card.dataset.focusProjectId);
      const focusPosition = focusProject ? { lat: focusProject.latitude, lng: focusProject.longitude } : undefined;
      const map = new maps.Map(canvas, googleMapBaseOptions(focusPosition ?? { lat: 26.7134, lng: -80.0564 }, focusPosition ? 15 : 13));
      let expanded = false;
      let markers: GoogleMarkerHandle[] = [];

      const renderMarkers = () => {
        markers.forEach((marker) => marker.clear());
        markers = [];
        const isMapRoute = Boolean(card.closest("[data-route-view='map']"));
        const corridorFilter = card.dataset.mapCorridorFilter ?? "all";
        const statusFilter = (card.dataset.mapStatusFilter ?? "all") as MapStatusFilter;
        const filteredProjects = rankedFeaturedProjects.filter((project) => mapProjectMatchesFilters(project, corridorFilter, statusFilter));
        const projects = validMapProjects(
          focusProject && !expanded ? [focusProject] : isMapRoute || expanded ? filteredProjects : rankedFeaturedProjects.slice(0, 7),
        );
        const result = card.parentElement?.querySelector<HTMLElement>("[data-map-filter-result]");
        if (result) result.textContent = `${projects.length} mapped ${projects.length === 1 ? "project" : "projects"}`;
        if (!projects.length) {
          canvas.setAttribute("aria-label", "No mapped projects match the selected filters");
          return;
        }
        const detail = card.parentElement?.querySelector<HTMLElement>("[data-map-project-detail]");
        if (detail) detail.innerHTML = renderMapProjectDetail(projects[0]);
        const bounds = new maps.LatLngBounds();

        projects.forEach((project, index) => {
          const position = { lat: project.latitude, lng: project.longitude };
          bounds.extend(position);
          const marker = createMapMarker(
            maps,
            map,
            position,
            `${project.name} · ${project.corridor} project`,
            project.id === focusProject?.id || index < 7 ? "primary" : "secondary",
            () => {
              const detail = card.parentElement?.querySelector<HTMLElement>("[data-map-project-detail]");
              if (detail) {
                detail.innerHTML = renderMapProjectDetail(project);
              } else {
                window.location.assign(projectPath(project));
              }
            },
          );
          markers.push(marker);
        });

        if (focusProject && !expanded && focusPosition) {
          map.setCenter(focusPosition);
          map.setZoom(15);
          return;
        }

        map.fitBounds(bounds, expanded ? 44 : 56);
      };

      const expandMap = () => {
        const isMapRoute = Boolean(card.closest("[data-route-view='map']"));
        if (!isMapRoute) {
          window.location.assign("/map/");
          return;
        }
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
      card.parentElement?.querySelectorAll<HTMLButtonElement>("[data-map-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          const group = button.dataset.mapFilter;
          const value = button.dataset.mapFilterValue ?? "all";
          if (group === "corridor") card.dataset.mapCorridorFilter = value;
          if (group === "status") card.dataset.mapStatusFilter = value;
          card.parentElement?.querySelectorAll<HTMLButtonElement>(`[data-map-filter="${group}"]`).forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("is-active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
          });
          renderMarkers();
        });
      });
      map.addListener("click", () => {
        if (!card.closest("[data-route-view='map']")) expandMap();
      });
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
    .then((maps) => {
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
          () => undefined,
        );
        element.dataset.mapInitialized = "true";
        element.dataset.mapState = "ready";
      });
    })
    .catch(() => {
      setGoogleMapFallback();
    });
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
  const projectLabels = relatedProjectsForArticle(item).map((project) => project.name);
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
        <span>${publicText(item.category)} · ${publicText(formatNewsDate(newsDisplayDate(item)))}</span>
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
        <span>${publicText(item.category)} · ${publicText(formatNewsDate(newsDisplayDate(item)))} · ${publicText(relatedNewsLabel(item).replace(/^Related:\s*/, ""))}</span>
        <h2>${publicText(item.title)}</h2>
        <p>${publicText(article.deck)}</p>
        <a class="button primary" href="${updatePath(item)}">Read Latest Update <span aria-hidden="true">→</span></a>
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
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-news-card]"));
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
  const relatedProjects = relatedProjectsForArticle(item);
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
        fullTeamCtaCopy,
  };
}

function renderUpdateArticle(item: ExternalNewsItem) {
  const resolvedImage = imageForContentItem(externalNewsImageContext(item));
  const content = updateArticleContent(item);
  const relatedProjects = relatedProjectsForArticle(item);
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
        <div><span>Published</span><strong>${publicText(formatNewsDate(newsDisplayDate(item)))}</strong></div>
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
            <h2>Team context</h2>
            <p>${publicText(content.brookeTake)}</p>
          </section>
          <aside class="verify-box">
            <span>Newsletter-ready note</span>
            <p>${publicText(content.newsletterBlurb)}</p>
          </aside>
          <aside class="buyer-takeaway-box">
            <span>Next step</span>
            <p>${publicText(content.cta)}</p>
            <a href="/inquire/?lead_capture_context=update_article&update=${encodeURIComponent(item.id)}">Contact the team <span aria-hidden="true">→</span></a>
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

function relatedProjectsForArticle(item: ExternalNewsItem) {
  const slugs = new Set([
    ...(item.relatedProjectIds ?? []),
    ...(item.relatedProjectSlugs ?? []),
    item.primaryProjectSlug,
  ].filter(Boolean));
  return featuredProjects.filter((project) => slugs.has(project.id) || projectCopySlugs(project.id).some((slug) => slugs.has(slug)));
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

function renderFloorplanProject(project: ApprovedFloorplanProject) {
  const allPlans = preferredFloorplans(project);
  const plans = allPlans.slice(0, 48);
  const image = floorplanProjectImage(project.projectId);
  return `
    <article class="floorplan-project-card" id="floorplans-${escapeHtml(project.projectId)}">
      <div class="floorplan-project-heading">
        <div>
          <span>${escapeHtml(project.area)} · ${plans.length ? `${plans.length} available preview${plans.length === 1 ? "" : "s"}` : "Request current packet"}</span>
          <h2>${escapeHtml(project.name)}</h2>
        </div>
        <strong>${escapeHtml(project.count || "Gap")}</strong>
      </div>
      <div class="floorplan-project-media">
        <img src="${image}" alt="${escapeHtml(project.name)} property image" decoding="async" />
      </div>
      ${
        plans.length
          ? `<div class="floorplan-gallery-grid" role="list" aria-label="${escapeHtml(project.name)} floorplan gallery">
              ${plans.map((plan, index) => renderGeneratedFloorplanLink(plan, project, index)).join("")}
            </div>`
          : `<p class="floorplan-gap">Public floorplans are not currently available for this project. Request current materials to confirm layouts, views, and availability.</p>`
      }
    </article>
  `;
}

function preferredFloorplans(project: ApprovedFloorplanProject) {
  const byTitle = new Map<string, ApprovedFloorplanPlan>();
  for (const plan of project.plans) {
    const key = cleanFloorplanTitle(plan.title).toLowerCase();
    const existing = byTitle.get(key);
    if (!existing) {
      byTitle.set(key, plan);
      continue;
    }
    const existingIsLocal = existing.href && !/^https?:\/\//i.test(existing.href);
    const planIsLocal = plan.href && !/^https?:\/\//i.test(plan.href);
    if (planIsLocal && !existingIsLocal) byTitle.set(key, plan);
  }
  return Array.from(byTitle.values());
}

function floorplanProjectImage(projectId: string) {
  const imageId = projectImageLookupId(projectId);
  return floorplanResidenceImage(imageId) || homepageProjectCardImage(imageId) || getProjectHeroAsset(imageId)?.src || homepageAssets.hero.desktop;
}

function floorplanResidenceImage(projectId: string) {
  const override = floorplanResidenceImageOverride(projectId);
  if (override) return override;
  return getApprovedProjectAssets(projectId)
    .filter((asset) => asset.placement === "residences")
    .sort((a, b) => floorplanResidenceImageScore(b) - floorplanResidenceImageScore(a))[0]?.src || getProjectAsset(projectId, "residences")?.src || getProjectGalleryAsset(projectId, "residences")?.src;
}

function floorplanResidenceImageOverride(projectId: string) {
  if (projectId === "banyan-tree") return "/assets/projects/banyan-tree/residences/banyan-tree-residences-living-room-v01.jpg";
  if (projectId === "berkeley") return "/assets/projects/berkeley/residences/berkeley-residences-bedroom-with-view-v01.jpg";
  if (projectId === "forte-on-flagler") return "/assets/projects/forte-on-flagler/residences/forte-on-flagler-residences-grand-living-room-v01.jpg";
  if (projectId === "la-clara") return "/projects/la-clara/media/showcase/la-clara-residences-living-room-patio-v01-web.jpg";
  if (projectId === "nora-house") return "/assets/projects/nora-house/residences/nora-house-residences-living-room-v01.jpg";
  if (projectId === "olara") return "/assets/projects/olara/residences/olara-residences-luxury-king-bed-balcony-v01.jpg";
  if (projectId === "ritz-carlton-wpb") return "/assets/projects/ritz-carlton-wpb/residences/ritz-carlton-residences-living-room-view-v01.jpg";
  if (projectId === "shorecrest") return "/projects/shorecrest/media/showcase/shorecrest-residences-living-room-v01-web.jpg";
  if (projectId === "south-flagler-house") return "/assets/projects/south-flagler-house/residences/south-flagler-residence-living-room-04-v01.jpg";
  return "";
}

function floorplanResidenceImageScore(asset: ProjectAsset) {
  const label = `${asset.src} ${asset.title} ${asset.alt}`.toLowerCase();
  const aspect = asset.width && asset.height ? asset.width / asset.height : 1;
  let score = (asset.width ?? 0) / 100;
  if (aspect >= 1.45) score += 40;
  if (/living|great-room|open|interior-view|view|patio|terrace|kitchen/.test(label)) score += 60;
  if (/bath|bedroom/.test(label)) score -= 80;
  return score;
}

function projectImageLookupId(projectId: string) {
  if (projectId.startsWith("south-flagler-house")) return "south-flagler-house";
  if (projectId.startsWith("edgeworth")) return "edgeworth";
  return projectId;
}

function renderGeneratedFloorplanLink(
  plan: ApprovedFloorplanPlan,
  project?: ApprovedFloorplanProject,
  index = 0,
) {
  const title = cleanFloorplanTitle(plan.title);
  const projectName = project?.name ?? "Project floorplan";
  const caption = plan.href && !/^https?:\/\//i.test(plan.href)
    ? "Preview this floorplan inside WPB New Construction, then request the current packet before relying on availability or stack details."
    : "This plan is handled through the current packet request path so buyers do not leave the site for a sales-office download.";
  const planDetail = floorplanPlanDetail(plan.detail);
  const planDetailMarkup = planDetail ? `<small>${escapeHtml(planDetail)}</small>` : "";
  const preview = renderFloorplanPreview(plan, title);
  const metrics = renderFloorplanMetrics(plan);
  if (!plan.href) {
    return `
      <article class="floorplan-link floorplan-link-static">
        ${preview}
        <span>${escapeHtml(title)}</span>
        ${planDetailMarkup}
        ${metrics}
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
      ${preview}
      <span>${escapeHtml(title)}</span>
      ${planDetailMarkup}
      ${metrics}
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
      ${preview}
      <span>${escapeHtml(title)}</span>
      ${planDetailMarkup}
      ${metrics}
    </button>
  `;
}

function floorplanLibraryPath(projectId?: string) {
  const hasProjectSection = projectId
    ? floorplanHubProjects.some((project) => project.projectId === projectId)
    : false;
  return hasProjectSection ? `/floorplans/#floorplans-${projectId}` : "/floorplans/";
}

function renderProjectFloorplanHubLink(project: FeaturedProject, floorplanProject?: ApprovedFloorplanProject | null) {
  const planCount = floorplanProject?.plans?.length ?? 0;
  const href = floorplanLibraryPath(floorplanProject?.projectId ?? project.id);
  const label = planCount
    ? `View ${planCount} floorplan${planCount === 1 ? "" : "s"}`
    : "View floorplans";
  return `
    <a class="floorplan-hub-link" href="${href}">
      <span>Floorplan Library</span>
      <strong>${label}</strong>
      <small>Open the ${escapeHtml(project.name)} section in the new floorplan hub.</small>
    </a>
  `;
}

function floorplanProjectIdFromDocsPath(basePath: string) {
  return basePath.match(/\/projects\/([^/]+)\//)?.[1];
}

function cleanFloorplanTitle(title: string) {
  return title
    .replace(/\bFloorplans?\b/gi, "")
    .replace(/\bUnbranded\b/gi, "")
    .replace(/\bDigital\b/gi, "")
    .replace(/\bIllustrated\b/gi, "")
    .replace(/\bComplete Collection\b/gi, "Complete Floorplan Collection")
    .replace(/\b(\d*)lph([a-z])\b/gi, (_, floor: string, stack: string) => `${floor ? `${floor} ` : ""}LPH ${stack.toUpperCase()}`)
    .replace(/\b(\d*)th([a-z])\b/gi, (_, floor: string, stack: string) => `${floor ? `${floor} ` : ""}TH ${stack.toUpperCase()}`)
    .replace(/\bres0*(\d+)\b/gi, "Residence $1")
    .replace(/\s+[0-9a-f]{8}$/i, "")
    .replace(/\s+/g, " ")
    .replace(/\bLph\b/gi, "LPH")
    .replace(/\bPh\b/gi, "PH")
    .replace(/\bTh\b/gi, "TH")
    .replace(/\bRes\b/gi, "Residence")
    .trim()
    .replace(/^Olara S 31126 ([A-F])$/i, "Residence $1")
    .replace(/^S 31126 ([A-F])$/i, "Residence $1")
    .replace(/^(Alba|Olara|Shorecrest|Ritz Carlton|Ritz-Carlton|Mr\. C|NORA House|Nora House|Berkeley|Forte|Forté|Maison d'Or)\s+/i, "");
}

function floorplanPlanDetail(sourceDetail?: string) {
  if (sourceDetail) return sourceDetail;
  return "";
}

function renderFloorplanPreview(plan: ApprovedFloorplanPlan, title: string) {
  if (/\.(png|jpe?g|webp)(?:$|[?#])/i.test(plan.href)) {
    return `<span class="floorplan-link-preview"><img src="${safeHref(plan.href)}" alt="${escapeHtml(title)} floorplan" decoding="async" /></span>`;
  }
  const pdfPreview = pdfPreviewImageHref(plan.href);
  if (pdfPreview) {
    return `<span class="floorplan-link-preview floorplan-link-preview-pdf-image"><img src="${safeHref(pdfPreview)}" alt="${escapeHtml(title)} floorplan" decoding="async" /></span>`;
  }
  return `<span class="floorplan-link-preview floorplan-link-preview-pdf">PDF</span>`;
}

function pdfPreviewImageHref(href?: string) {
  if (!href || !/\.pdf(?:$|[?#])/i.test(href) || /^https?:\/\//i.test(href)) return "";
  const cleanHref = href.split(/[?#]/)[0];
  return cleanHref.replace(/\/([^/]+)\.pdf$/i, "/previews/$1.jpg");
}

function renderFloorplanMetrics(plan: ApprovedFloorplanPlan) {
  const items = [
    plan.bedrooms ? formatBedroomMetric(plan.bedrooms) : "",
    plan.bathrooms ? formatBathroomMetric(plan.bathrooms) : "",
    plan.interiorSqFt ? `${formatNumber(plan.interiorSqFt)} interior sf` : "",
    plan.terraceSqFt ? `${formatNumber(plan.terraceSqFt)} terrace sf` : "",
    plan.totalSqFt ? `${formatNumber(plan.totalSqFt)} total sf` : "",
  ].filter(Boolean);
  if (!items.length) return `<em class="floorplan-metrics">Details pending current packet</em>`;
  return `<em class="floorplan-metrics">${items.map(escapeHtml).join(" · ")}</em>`;
}

function formatBedroomMetric(value: string) {
  if (/[a-z]/i.test(value)) {
    const normalized = value.replace(/\s*\+\s*/g, " + ");
    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*\+\s*(.+)$/);
    return match ? `${match[1]} bed + ${match[2]}` : normalized;
  }
  return `${value} bed`;
}

function formatBathroomMetric(value: string) {
  if (/powder/i.test(value)) return value.replace(/\s*\+\s*/g, " bath + ");
  if (/bath/i.test(value)) return value;
  return `${value} bath`;
}

function formatNumber(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : value;
}

function buyerIntentAnswerPath(answer: BuyerIntentAnswerPage) {
  return `/answers/${answer.slug}/`;
}

function buyerIntentAnswerForSlug(slug: string) {
  return buyerIntentAnswerPages.find((answer) => answer.slug === slug);
}

function renderBuyerIntentAnswerCard(answer: BuyerIntentAnswerPage) {
  return `
    <article class="front-project-card">
      <div class="front-project-card-body">
        <span>${publicText(answer.shortLabel)}</span>
        <h3><a href="${buyerIntentAnswerPath(answer)}">${publicText(answer.question)}</a></h3>
        <p>${publicText(answer.bluf)}</p>
        <a href="${buyerIntentAnswerPath(answer)}">Read answer <span aria-hidden="true">→</span></a>
      </div>
    </article>
  `;
}

function renderBuyerIntentAnswerRouteView(answer: BuyerIntentAnswerPage) {
  return `
    <div class="route-view route-view-answer-detail" data-route-view="answer-detail" data-answer-slug="${escapeHtml(answer.slug)}" hidden>
      <section class="section intelligence-hero answer-detail-hero">
        <div>
          <p class="eyebrow">Buyer Answer</p>
          <h1>${publicText(answer.question)}</h1>
          <p>${publicText(answer.bluf)}</p>
        </div>
        <aside class="answer-meta-panel">
          <span>Verification-first</span>
          <strong>Changing details require current documents.</strong>
          <small>Use this answer to frame the shortlist, then confirm pricing, availability, fees, and contract terms.</small>
        </aside>
      </section>
      <section class="section answer-detail-section">
        <div class="section-heading">
          <p class="eyebrow">Bottom Line</p>
          <h2>${publicText(answer.title)}</h2>
          <p>${publicText(answer.explanation)}</p>
        </div>
        ${renderBuyerIntentTable(answer)}
      </section>
      <section class="section answer-detail-links-section" aria-label="Related West Palm Beach condo pages">
        <div class="section-heading">
          <p class="eyebrow">Related Pages</p>
          <h2>Where to verify the answer.</h2>
        </div>
        <div class="market-note-actions">
          <a href="/compare/">Compare buildings <span aria-hidden="true">→</span></a>
          <a href="/floorplans/">Review floorplans <span aria-hidden="true">→</span></a>
          ${answer.corridorKeys.map((key) => `<a href="${corridorPath(key)}">${publicText(corridorSections.find((section) => section.key === key)?.label ?? key)} corridor <span aria-hidden="true">→</span></a>`).join("")}
          ${answer.projectIds.slice(0, 4).map((projectId) => {
            const project = featuredProjects.find((item) => item.id === projectId);
            return project ? `<a href="${projectPath(project)}">${publicText(project.name)} <span aria-hidden="true">→</span></a>` : "";
          }).join("")}
        </div>
      </section>
      <section class="section answer-detail-source-section" aria-label="Source and verification notes">
        <div class="section-heading">
          <p class="eyebrow">Source / Verification Notes</p>
          <h2>What this answer is based on.</h2>
        </div>
        <ul class="answer-source-list">
          ${answer.sourceNotes.map((note) => `<li>${publicText(note)}</li>`).join("")}
          <li>Current pricing, incentives, fees, availability, delivery timing, floorplan availability, and contract terms should be verified before making a purchase decision.</li>
        </ul>
      </section>
      <section class="section answer-detail-faq-section" aria-label="${escapeHtml(answer.title)} FAQ">
        <div class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2>Common follow-up questions.</h2>
        </div>
        <div class="answer-list">
          ${answer.faqs.map((item) => `
            <article class="answer-block">
              <h3>${publicText(item.question)}</h3>
              <p>${publicText(item.answer)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderBuyerIntentTable(answer: BuyerIntentAnswerPage) {
  return `
    <div class="comparison-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Buyer question</th>
            <th>Best use</th>
            <th>Related pages</th>
            <th>What to verify</th>
          </tr>
        </thead>
        <tbody>
          ${answer.tableRows.map((row) => `
            <tr>
              <td>${publicText(row.label)}</td>
              <td>${publicText(row.bestUse)}</td>
              <td>${row.links.map((href) => `<a href="${safeHref(href)}">${publicText(linkLabelForAnswer(href))}</a>`).join("<br>")}</td>
              <td>${publicText(row.verify)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAnswerTopicCard(topic: AnswerTopicCard) {
  return `
    <a class="answer-topic-card" href="${safeHref(topic.href)}">
      <span>${publicText(topic.label)}</span>
      <strong>${publicText(topic.heading)}</strong>
      <small>${publicText(topic.description)}</small>
    </a>
  `;
}

function renderAnswerTopicSection(section: AnswerTopicSection) {
  const answers = section.faqIds
    .map((id) => answerEngineFaq.find((item) => item.id === id))
    .filter((item): item is (typeof answerEngineFaq)[number] => Boolean(item));
  return `
    <details class="answer-topic-accordion" id="${escapeHtml(section.href.replace("#", ""))}"${section.defaultOpen ? " open" : ""}>
      <summary>
        <span>${publicText(section.label)}</span>
        <strong>${publicText(section.heading)}</strong>
        <small>${answers.length} questions</small>
      </summary>
      <div class="answer-topic-accordion-body">
        <p>${publicText(section.description)}</p>
        <div class="answer-question-list">
          ${answers.map((item, index) => renderAnswerAccordionItem(item, section.defaultOpen && index === 0)).join("")}
        </div>
      </div>
    </details>
  `;
}

function renderAnswerAccordionItem(item: (typeof answerEngineFaq)[number], defaultOpen = false) {
  const relatedProjects = item.relatedProjectIds
    .map((projectId) => featuredProjects.find((project) => project.id === projectId))
    .filter((project): project is FeaturedProject => Boolean(project))
    .slice(0, 3);
  const sourceCitations = item.sourceCitations.slice(0, 2);
  return `
    <details class="answer-question-item" id="${escapeHtml(item.id)}"${defaultOpen ? " open" : ""}>
      <summary>
        <span>${escapeHtml(item.concept)}</span>
        <strong>${publicText(item.question)}</strong>
      </summary>
      <div class="answer-question-body">
        <p>${publicText(item.answer)}</p>
        ${
          relatedProjects.length
            ? `<div class="market-note-actions answer-question-actions">
                ${relatedProjects.map((project) => `<a href="${projectPath(project)}">${escapeHtml(project.name)} <span aria-hidden="true">→</span></a>`).join("")}
                <a href="/inquire/?lead_capture_context=answer_block&message=${encodeURIComponent(`I have a question about: ${item.question}`)}">Request Current Availability <span aria-hidden="true">↗</span></a>
              </div>`
            : `<div class="market-note-actions answer-question-actions"><a href="/inquire/?lead_capture_context=answer_block">Request Current Availability <span aria-hidden="true">↗</span></a></div>`
        }
        ${
          sourceCitations.length
            ? `<div class="answer-source-mini">
                ${sourceCitations.map((source) => `<small><strong>${publicText(source.label)}</strong> ${publicText(source.note)}</small>`).join("")}
              </div>`
            : ""
        }
      </div>
    </details>
  `;
}

function linkLabelForAnswer(href: string) {
  const projectMatch = href.match(/^\/projects\/([^/]+)\//);
  if (projectMatch) {
    const projectId = projectMatch[1] === "south-flagler-house-north" ? "south-flagler-house" : projectMatch[1];
    return featuredProjects.find((project) => project.id === projectId)?.name ?? projectId.replace(/-/g, " ");
  }
  if (href === "/compare/") return "Compare";
  if (href === "/floorplans/") return "Floorplans";
  if (href === "/inquire/") return "Inquiry";
  if (href.includes("north-flagler")) return "North Flagler";
  if (href.includes("downtown-west-palm-beach")) return "Downtown West Palm Beach";
  if (href.includes("south-flagler")) return "South Flagler";
  if (href.includes("active-sales-vs-pipeline-watch")) return "Active sales vs pipeline";
  if (href.includes("why-published-floor-plans-matter")) return "Why floorplans matter";
  return href.replace(/^\/|\/$/g, "").replace(/-/g, " ");
}

function renderProjectCorridorCta(project: FeaturedProject) {
  const section = corridorSections.find((item) => item.key === project.corridorKey);
  if (!section) return "";
  const corridorProjects = featuredProjects
    .filter((item) => item.corridorKey === section.key && item.id !== project.id)
    .slice(0, 3);
  return `
    <section class="section project-corridor-cta" aria-label="${escapeHtml(project.name)} corridor comparison">
      <div class="section-heading">
        <p class="eyebrow">Corridor Context</p>
        <h2>Compare ${publicText(project.name)} within ${publicText(section.label)}.</h2>
        <p>Use the corridor guide to compare nearby West Palm Beach projects by buyer fit, current status, released floorplans, and what still needs verification before touring.</p>
      </div>
      <div class="market-note-actions">
        <a href="${corridorPath(section.key)}">Review ${publicText(section.label)} corridor <span aria-hidden="true">→</span></a>
        <a href="/compare/">Compare all buildings <span aria-hidden="true">→</span></a>
        ${corridorProjects.map((item) => `<a href="${projectPath(item)}">${publicText(item.name)} <span aria-hidden="true">→</span></a>`).join("")}
      </div>
    </section>
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
    "berkeley",
    "maison-dor",
    "edgeworth",
    "alba-reserve",
    "fern-and-gardenia-related-ross-fern-street",
    "rybovich-marina-redevelopment",
    "rosewood-residences-west-palm-beach",
    "forte-on-flagler",
    "la-clara",
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
  const sourceFactAliases: Record<string, string> = {
    "south-flagler-house": "south-flagler-house-north",
    "olara-west-palm-beach": "olara",
    "ritz-carlton-residences-west-palm-beach": "ritz-carlton-wpb",
    "berkeley-palm-beach": "berkeley",
    "mr-c-residences-west-palm-beach": "mr-c",
    "banyan-tree-residences-west-palm-beach": "banyan-tree",
    "mandarin-oriental-residences-west-palm-beach": "mandarin-oriental",
    "related-ross-fern-street": "fern-and-gardenia-related-ross-fern-street",
    "rybovich-marina": "rybovich-marina-redevelopment",
    "rosewood": "rosewood-residences-west-palm-beach",
  };
  const sourceId = sourceFactAliases[projectId] ?? projectId;
  return projectFactById.get(sourceId as (typeof projectFacts)[number]["projectId"]);
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

export function renderProjectMissingInfoPanel(project: FeaturedProject) {
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

function renderProjectBuyerLens(copy: ProjectCopyPackage) {
  return `
    <section class="section project-buyer-lens" aria-label="Scott Gordon Group buyer lens">
      <div class="section-heading">
        <p class="eyebrow">Team Buyer Lens</p>
        <h2>${publicText(copy.introHeadline)}</h2>
        <p>${publicText(copy.brookeTake)}</p>
      </div>
      <div class="project-buyer-lens-grid">
        <article>
          <span>Best for</span>
          <ul>${copy.bestFor.map((item) => `<li>${publicText(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <span>What makes it different</span>
          <ul>${copy.signatureFeatures.map((item) => `<li>${publicText(item)}</li>`).join("")}</ul>
        </article>
        <article>
          <span>Compare against</span>
          <p>${publicText(copy.buyerComparisonNotes)}</p>
        </article>
        <article>
          <span>Information status</span>
          <p>${publicText(copy.sourceNotes.join(" "))}</p>
          <small>Project details continue to be monitored.</small>
        </article>
      </div>
    </section>
  `;
}

function renderProjectRelatedNews(project: FeaturedProject) {
  const items = projectRelatedNewsItems(project);
  if (!items.length) return "";
  return `
    <section class="section project-related-news" id="project-updates-${project.id}" aria-label="${project.name} related development news">
      <div class="section-heading">
        <p class="eyebrow">Latest Coverage</p>
        <h2>Recent public signals tied to this building.</h2>
        <p>Project-specific updates appear first, followed by corridor or sponsor context only when it affects the buyer comparison.</p>
      </div>
      <div class="project-note-list">
        ${items.map((item) => renderProjectUpdateNote(item, project)).join("")}
      </div>
    </section>
  `;
}

function projectRelatedNewsItems(project: FeaturedProject) {
  const direct = publishedExternalNews
    .filter((item) => projectMatchesArticle(project, item))
    .sort((a, b) => projectArticlePriority(project, a) - projectArticlePriority(project, b) || newsSortTimestamp(b) - newsSortTimestamp(a));
  const directIds = new Set(direct.map((item) => item.id));
  const fallback = publishedExternalNews.filter((item) => {
    if (directIds.has(item.id)) return false;
    if (!projectFallbackArticleMatches(project, item)) return false;
    return true;
  });
  return [...direct, ...fallback].slice(0, 3);
}

function projectFallbackArticleMatches(project: FeaturedProject, item: ExternalNewsItem) {
  const text = `${item.title} ${item.deck ?? ""} ${item.description ?? ""} ${item.summary ?? ""} ${item.bodySections?.map((section) => section.body).join(" ") ?? ""}`.toLowerCase();
  const isNorthFlagler = item.relatedCorridorIds.includes("north-flagler") || item.relatedCorridors.includes("north-flagler");
  const isSouthFlagler = item.relatedCorridorIds.includes("south-flagler") || item.relatedCorridors.includes("south-flagler");
  if (project.id === "ritz-carlton-wpb") {
    const isBrandedLuxury = /branded|hospitality|ritz|mandarin|rosewood|luxury|waterfront/.test(text);
    return isNorthFlagler && isBrandedLuxury;
  }
  if (project.id === "olara") {
    return isNorthFlagler && /olara|marina|resort|wellness|culinary|vertical resort|luxury condo/.test(text);
  }
  if (project.id === "alba-palm-beach") {
    return isNorthFlagler && /alba|boutique|intracoastal|northwood|waterfront/.test(text);
  }
  if (project.id === "shorecrest") {
    return isNorthFlagler && /shorecrest|related ross|waterfront|construction loan|groundbreak|pipeline/.test(text);
  }
  if (project.id === "south-flagler-house") {
    return isSouthFlagler && /south flagler|related ross|tops out|construction|estate|waterfront/.test(text);
  }
  return false;
}

function projectArticlePriority(project: FeaturedProject, item: ExternalNewsItem) {
  const slugs = new Set([project.id, ...projectCopySlugs(project.id)]);
  if (item.primaryProjectSlug && slugs.has(item.primaryProjectSlug)) return 0;
  if (item.relatedProjectSlugs?.some((slug) => slugs.has(slug))) return 1;
  if (item.relatedProjectIds.includes(project.id)) return 2;
  return 3;
}

function relatedProjectComparisonIds(projectId: string) {
  const related: Record<string, string[]> = {
    olara: ["shorecrest", "ritz-carlton-wpb"],
    shorecrest: ["olara", "ritz-carlton-wpb"],
    "ritz-carlton-wpb": ["olara", "shorecrest", "mandarin-oriental"],
    "south-flagler-house": ["edgeworth", "maison-dor", "forte-on-flagler"],
    edgeworth: ["south-flagler-house", "maison-dor", "la-clara"],
  };
  return related[projectId] ?? [];
}

function renderProjectInternalComparison(project: FeaturedProject) {
  const relatedProjects = relatedProjectComparisonIds(project.id)
    .map((projectId) => featuredProjects.find((item) => item.id === projectId))
    .filter((item): item is FeaturedProject => Boolean(item));
  if (!relatedProjects.length) return "";
  return `
    <section class="section market-note-related-section project-internal-comparison" aria-label="${project.name} related project comparisons">
      <div class="section-heading">
        <p class="eyebrow">Compare Nearby</p>
        <h2>Keep the shortlist inside West Palm Beach.</h2>
        <p>Use these West Palm Beach profiles to compare scale, service model, timing, and corridor fit before relying on any outside sales material.</p>
      </div>
      <div class="front-project-grid front-project-grid-static">
        ${relatedProjects.map(renderRelatedBuildingCard).join("")}
      </div>
    </section>
  `;
}

function renderProjectUpdateNote(item: ExternalNewsItem, project: FeaturedProject) {
  const article = updateArticleContent(item);
  return `
    <article class="project-note-row" id="${escapeHtml(item.id)}">
      <div>
        <span>${publicText(projectCoverageLabel(project, item))} · ${publicText(item.category)} · ${publicText(formatNewsDate(newsDisplayDate(item)))}</span>
        <strong>${publicText(item.title)}</strong>
        <p>${publicText(article.excerpt)}</p>
        <small>Source: ${publicText(item.sourceName)}${item.paywallStatus === "likely-paywalled" ? " · May require subscription" : ""}</small>
      </div>
      <nav aria-label="${escapeHtml(item.title)} actions">
        <a href="${updatePath(item)}">Read Update</a>
      </nav>
    </article>
  `;
}

function projectCoverageLabel(project: FeaturedProject, item: ExternalNewsItem) {
  if (projectMatchesArticle(project, item)) return "Project-specific";
  if (item.relatedCorridorIds.length || item.relatedCorridors.length) return "Corridor context";
  return "Market signal";
}

function projectMatchesArticle(project: FeaturedProject, item: ExternalNewsItem) {
  const projectSlugs = new Set([
    project.id,
    ...projectCopySlugs(project.id),
  ]);
  return item.relatedProjectIds.includes(project.id) ||
    item.relatedProjectSlugs?.some((slug) => projectSlugs.has(slug)) ||
    (item.primaryProjectSlug ? projectSlugs.has(item.primaryProjectSlug) : false);
}

function projectCopySlugs(projectId: string) {
  const copy = batch1ProjectCopyByProjectId.get(projectId);
  return copy ? [copy.slug, copy.repoProjectId] : [projectId];
}

function newsDisplayDate(item: ExternalNewsItem) {
  return item.publishedAt || item.sourcePublishedDate || item.sourcePublishedAt || item.dateDiscovered || item.fetchedAt;
}

function isPriorityEntityProjectId(projectId: string) {
  return [
    "olara",
    "south-flagler-house",
    "ritz-carlton-wpb",
    "shorecrest",
    "alba-palm-beach",
    "berkeley",
    "nora-house",
    "forte-on-flagler",
    "mr-c",
    "maison-dor",
  ].includes(projectId);
}

function renderProjectEntityBrief(
  project: FeaturedProject,
  floorplanProject: ReturnType<typeof getFloorplanProject>,
  copyPackage?: ProjectCopyPackage,
) {
  if (!isPriorityEntityProjectId(project.id)) return "";
  const sourceFact = sourceFactForProject(project.id);
  const source = sourceFact?.facts;
  const sourceLinks: string[] = projectSourceNoteLinks(sourceFact).slice(0, 6);
  const relatedProjects = relatedProjectComparisonIds(project.id)
    .map((projectId) => featuredProjects.find((item) => item.id === projectId))
    .filter((item): item is FeaturedProject => Boolean(item));
  const sourceTeam = source?.team ? teamCreditsFromSource(source.team) : [];
  const hasSourcedAmenities = Boolean(copyPackage?.amenityNarrative) || sourceLinks.some((href) => /amenit/i.test(href));
  const floorplanCount = floorplanProject?.count ?? 0;

  return `
    <section class="section project-entity-brief" id="entity-brief-${project.id}" aria-label="${project.name} source-backed entity brief">
      <div class="section-heading">
        <p class="eyebrow">Source-Backed Entity Brief</p>
        <h2>Bottom line for ${publicText(project.name)}.</h2>
        <p>${publicText(entityBluf(project, sourceFact))}</p>
      </div>
      <div class="profile-grid">
        ${entityFactCard("Location", source?.address || project.address, "Confirm final legal/project address before relying on it.")}
        ${entityFactCard("Status", source?.status || project.status, "Verify current construction and sales status before touring.")}
        ${entityFactCard("Residences", source?.residences || project.residences, "Counts can vary by source date or tower definition.")}
        ${entityFactCard("Delivery", source?.completion || project.delivery, "Delivery timing should be checked against the current buyer packet.")}
        ${entityFactCard("Pricing", source?.pricing || project.price, "Public pricing can lag live inventory and incentives.")}
        ${entityFactCard("Floorplans", floorplanCount ? `${floorplanCount} tracked records` : "Request current packet", "Confirm line, stack, exposure, and whether the plan is still available.")}
      </div>
    </section>

    <section class="section project-entity-residences" aria-label="${project.name} residence and floorplan overview">
      <div class="section-heading">
        <p class="eyebrow">Residence / Floorplan Overview</p>
        <h2>What buyers can compare now.</h2>
        <p>${publicText(copyPackage?.residenceNarrative ?? `${project.name} is tracked by corridor, status, residence count, floorplan availability, and source notes. Use public plan material as a starting point, then request the current packet before relying on availability or pricing.`)}</p>
      </div>
      ${floorplanProject?.plans.length ? renderProjectFloorplanHubLink(project, floorplanProject) : `<p class="source-note">No complete public floorplan packet is confirmed in the current catalog. Request current floorplans before comparing lines or stacks.</p>`}
    </section>

    ${hasSourcedAmenities ? `<section class="section project-entity-amenities" aria-label="${project.name} sourced amenity context">
      <div class="section-heading">
        <p class="eyebrow">Amenities</p>
        <h2>Amenity claims stay source-backed.</h2>
        <p>${publicText(copyPackage?.amenityNarrative ?? "Amenity detail is referenced in reviewed project material. Confirm which amenities are included, optional, phased, or subject to association rules before relying on a public summary.")}</p>
      </div>
    </section>` : ""}

    ${sourceTeam.length ? `<section class="section project-entity-team" aria-label="${project.name} sourced project team">
      <div class="section-heading">
        <p class="eyebrow">Project Team</p>
        <h2>Team credits captured from reviewed material.</h2>
        <p>${publicText(copyPackage?.projectTeamNarrative ?? "Team credits are included for buyer orientation and should be confirmed against the latest project packet or offering material.")}</p>
      </div>
      <div class="brochure-team-grid">
        ${sourceTeam.slice(0, 6).map((credit) => renderBrochureTeamTile({ credit, asset: projectPlaceholderAsset(project, credit.role, "Project Team") })).join("")}
      </div>
    </section>` : ""}

    <section class="section project-entity-source-notes" aria-label="${project.name} source notes">
      <div class="section-heading">
        <p class="eyebrow">Source Notes</p>
        <h2>What this page is based on.</h2>
        <p>Source counts: ${sourceFact?.sourceCounts?.official ?? 0} official, ${sourceFact?.sourceCounts?.reporting ?? 0} reporting, ${sourceFact?.sourceCounts?.other ?? 0} other. Conflicts and gaps are preserved rather than smoothed away.</p>
      </div>
      <div class="brochure-download-list">
        ${sourceLinks.length ? sourceLinks.map((href) => renderProjectSourceLink(href, floorplanProject?.projectId ?? project.id)).join("") : `<article class="document-card is-placeholder"><span>Source Review</span><strong>Needs current source refresh</strong><small>No public source link is attached to this brief.</small></article>`}
      </div>
    </section>

    ${relatedProjects.length ? `<section class="section project-entity-comparisons" aria-label="${project.name} comparison links">
      <div class="section-heading">
        <p class="eyebrow">Compare Against</p>
        <h2>Nearby pages to keep the shortlist grounded.</h2>
      </div>
      <div class="front-project-grid front-project-grid-static">
        ${relatedProjects.map(renderRelatedBuildingCard).join("")}
      </div>
    </section>` : ""}

    <section class="section project-entity-faq" aria-label="${project.name} frequently asked questions">
      <div class="section-heading">
        <p class="eyebrow">FAQ</p>
        <h2>Common buyer questions about ${publicText(project.name)}.</h2>
      </div>
      <div class="answer-list">
        ${projectEntityFaq(project, sourceFact, floorplanProject).map((item) => `
          <article class="answer-block">
            <h3>${publicText(item.question)}</h3>
            <p>${publicText(item.answer)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function entityFactCard(label: string, value: string | undefined, note: string) {
  return `
    <article class="profile-card">
      <span>${publicText(label)}</span>
      <strong>${publicText(value || "Needs verification")}</strong>
      <p>${publicText(note)}</p>
    </article>
  `;
}

function entityBluf(project: FeaturedProject, sourceFact: ReturnType<typeof sourceFactForProject> | undefined) {
  const facts = sourceFact?.facts;
  const status = facts?.status || project.status;
  const delivery = facts?.completion || project.delivery;
  return `${project.name} is a ${project.corridor} project tracked for buyer comparison by status, location, residence scale, floorplan availability, and open verification notes. Current source notes show ${status}; timing is ${delivery}. Pricing, availability, incentives, fees, square footage, view exposure, delivery, and contract terms should be verified before reliance.`;
}

function projectSourceNoteLinks(sourceFact: ReturnType<typeof sourceFactForProject> | undefined) {
  const links = [
    sourceFact?.officialWebsite,
    ...(sourceFact?.highValueSources ?? []),
    ...(sourceFact?.sourceBuckets?.official ?? []),
    ...(sourceFact?.sourceBuckets?.reporting ?? []),
  ];
  return links
    .map((href) => String(href ?? "").trim())
    .filter(Boolean)
    .filter((href, index, list) => list.indexOf(href) === index);
}

function sourceLinkLabel(href: string) {
  try {
    const url = new URL(href);
    return url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/$/, "");
  } catch {
    return href;
  }
}

function isFloorplanSourceHref(href: string) {
  return /floor\s*plans?|floorplans?|floor-plan|floorplan|downloads|[/-]plans?[._/-]|plans?\.pdf(?:$|[?#])/i.test(href);
}

function renderProjectSourceLink(href: string, projectId?: string) {
  if (isFloorplanSourceHref(href)) {
    return `
      <a class="document-card" href="${floorplanLibraryPath(projectId)}">
        <span>Floorplan Library</span>
        <strong>View floorplans on WPB New Construction</strong>
        <small>Original documents stay in review; use the on-site library for buyer review.</small>
      </a>
    `;
  }

  return `
    <a class="document-card" href="${safeHref(href)}" target="_blank" rel="noopener noreferrer">
      <span>Reviewed Source</span>
      <strong>${publicText(sourceLinkLabel(href))}</strong>
      <small>Use for fact orientation; verify current buyer terms before reliance.</small>
    </a>
  `;
}

function projectEntityFaq(
  project: FeaturedProject,
  sourceFact: ReturnType<typeof sourceFactForProject> | undefined,
  floorplanProject: ReturnType<typeof getFloorplanProject>,
) {
  const facts = sourceFact?.facts;
  return [
    {
      question: `What is the bottom line on ${project.name}?`,
      answer: entityBluf(project, sourceFact),
    },
    {
      question: `Are floorplans available for ${project.name}?`,
      answer: floorplanProject?.count
        ? `${floorplanProject.count} floorplan records are tracked, but buyers should confirm current line availability, stack, exposure, fees, and pricing before relying on public material.`
        : "No complete public floorplan packet is confirmed in the current catalog. Request the current buyer packet before comparing lines, stacks, or availability.",
    },
    {
      question: `What should buyers verify before relying on ${project.name} public information?`,
      answer: `Verify current pricing, availability, incentives, fees, square footage, view exposure, delivery timing, contract terms, and any open verification notes. Current source notes include: ${[...(sourceFact?.conflicts ?? []), ...(sourceFact?.gaps ?? [])].slice(0, 2).join(" ") || facts?.pricing || "request current buyer-side confirmation."}`,
    },
  ];
}

function residenceImageForProject(project: FeaturedProject, heroImage: string | undefined): string | undefined {
  const assets = getApprovedProjectAssets(project);
  
  if (project.id === "berkeley") {
    const kitchen = assets.find((asset) => asset.placement === "residences" && asset.src.includes("kitchen-with-view"));
    if (kitchen?.src) return kitchen.src;
  }

  const resAsset = assets.find((asset) => asset.placement === "residences" && asset.src !== heroImage);
  if (resAsset?.src) return resAsset.src;
  
  const amenityAsset = assets.find((asset) => asset.placement === "amenities" && asset.src !== heroImage);
  if (amenityAsset?.src) return amenityAsset.src;

  const neighborhoodAsset = assets.find((asset) => asset.placement === "neighborhood" && asset.src !== heroImage);
  if (neighborhoodAsset?.src) return neighborhoodAsset.src;
  
  const anyOtherAsset = assets.find((asset) => asset.src !== heroImage && asset.placement !== "logos");
  if (anyOtherAsset?.src) return anyOtherAsset.src;

  const importedImages = approvedImportedImagesForProject(project.id);
  const importedRes = importedImages.find((img) => {
    const p = importedImagePublicPath(img);
    return p !== heroImage && img.imageType !== "logo";
  });
  if (importedRes) return importedImagePublicPath(importedRes);

  return undefined;
}

function renderTechnicalDisclosuresSection(project: FeaturedProject, draft: ProjectPageDraft) {
  const sourceFact = sourceFactForProject(project.id);
  const missingInfo = project.missingInfo ?? missingInfoForProject(project) ?? [];
  const conflicts = sourceFact?.conflicts ?? [];
  const gaps = sourceFact?.gaps ?? [];
  const needed = draft.needed ?? [];
  const sourceCounts = sourceFact?.sourceCounts;
  const pageStatus = sourceFact?.pageStatus || project.projectPageType || "Market watch";
  const confidence = sourceFact?.dataConfidence || "Draft";

  const hasDisclosures = missingInfo.length > 0 || conflicts.length > 0 || gaps.length > 0 || needed.length > 0 || sourceCounts;
  if (!hasDisclosures) return "";

  return `
    <section class="section brochure-disclosures-section" id="disclosures-${project.id}">
      <details class="disclosures-accordion">
        <summary class="disclosures-summary">
          <span>Sourcing Details & Technical Disclosures</span>
          <svg class="summary-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </summary>
        <div class="disclosures-content">
          <p class="disclosures-intro">This building profile uses published project information compiled from public records, developer announcements, and real estate filings. The details below are tracked for internal data verification and buyer risk assessment.</p>
          <div class="disclosures-grid">
            ${missingInfo.length > 0 ? `
              <div>
                <h4>Unconfirmed Details</h4>
                <ul>
                  ${missingInfo.map((item) => `<li>${publicText(item)}</li>`).join("")}
                </ul>
              </div>
            ` : ""}

            ${(conflicts.length > 0 || gaps.length > 0) ? `
              <div>
                <h4>Conflicts & Gaps</h4>
                <ul>
                  ${conflicts.map((item) => `<li>${publicText(item)}</li>`).join("")}
                  ${gaps.map((item) => `<li>${publicText(item)}</li>`).join("")}
                </ul>
              </div>
            ` : ""}

            ${needed.length > 0 ? `
              <div>
                <h4>Advisor Review Checklist</h4>
                <ul>
                  ${needed.map((item) => `<li>${publicText(item)}</li>`).join("")}
                </ul>
              </div>
            ` : ""}

            <div>
              <h4>Verification Logs</h4>
              <ul>
                ${sourceCounts ? `<li><strong>Source Database:</strong> ${sourceCounts.official ?? 0} official pages, ${sourceCounts.reporting ?? 0} reporting, ${sourceCounts.other ?? 0} other references.</li>` : ""}
                <li><strong>Entity Class:</strong> ${publicText(pageStatus)}</li>
                <li><strong>Confidence:</strong> ${publicText(confidence)}</li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  `;
}

function renderProjectHeroSlideshow(
  project: FeaturedProject,
  draft: ProjectPageDraft,
  heroImage: string | undefined,
  heroMobileImage: string | undefined,
  approvedHeroAsset: any
) {
  let heroAssets = getApprovedProjectAssets(project).filter((asset) => asset.placement === "hero");

  if (heroAssets.length === 0 && heroImage) {
    heroAssets = [{
      placement: "hero",
      src: heroImage,
      alt: approvedHeroAsset?.alt ?? draft.imageAlt ?? project.name,
      title: draft.title ?? project.name,
      credit: "",
      source: "",
      status: "approved"
    } as any];
  }

  heroAssets = heroAssets.slice(0, 6);
  const hasMultiple = heroAssets.length > 1;

  const slidesHtml = heroAssets.map((asset, index) => {
    const isVertical = asset.variant === "vertical-hero" || asset.variant === "vertical-exterior";
    const slideMobileSrc = isVertical ? asset.src : heroMobileImage;

    return `
      <div class="hero-slide ${index === 0 ? "active" : ""}" data-slide-index="${index}">
        ${renderMediaAsset({
          src: asset.src,
          mobileSrc: slideMobileSrc,
          alt: asset.alt || draft.imageAlt || project.name,
          kicker: "Project Rendering",
          title: asset.title || project.name
        }, "hero")}
        ${asset.title ? `<div class="hero-slide-caption"><span class="caption-kicker">${escapeHtml(asset.placement)}</span>: ${escapeHtml(asset.title)}</div>` : ""}
      </div>
    `;
  }).join("");

  const prevArrowSvg = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  const nextArrowSvg = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  const controlsHtml = hasMultiple ? `
    <button class="hero-slider-arrow prev" data-slideshow-prev aria-label="Previous image" type="button">
      ${prevArrowSvg}
    </button>
    <button class="hero-slider-arrow next" data-slideshow-next aria-label="Next image" type="button">
      ${nextArrowSvg}
    </button>
    <div class="hero-slider-dots">
      ${heroAssets.map((_, index) => `
        <button class="hero-slider-dot ${index === 0 ? "active" : ""}" data-slideshow-dot="${index}" aria-label="Go to image ${index + 1}" type="button"></button>
      `).join("")}
    </div>
  ` : "";

  return `
    <figure class="hero-slideshow" data-hero-slideshow>
      <div class="hero-slides-container">
        ${slidesHtml}
      </div>
      ${controlsHtml}
    </figure>
  `;
}

function initHeroSlideshows() {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const prevBtn = target.closest<HTMLButtonElement>("[data-slideshow-prev]");
    const nextBtn = target.closest<HTMLButtonElement>("[data-slideshow-next]");
    const dotBtn = target.closest<HTMLButtonElement>("[data-slideshow-dot]");
    
    if (!prevBtn && !nextBtn && !dotBtn) return;
    
    const slideshow = target.closest<HTMLElement>("[data-hero-slideshow]");
    if (!slideshow) return;
    
    const slides = Array.from(slideshow.querySelectorAll<HTMLElement>(".hero-slide"));
    const dots = Array.from(slideshow.querySelectorAll<HTMLElement>(".hero-slider-dot"));
    if (slides.length <= 1) return;
    
    let activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
    if (activeIndex === -1) activeIndex = 0;
    
    let newIndex = activeIndex;
    if (prevBtn) {
      newIndex = (activeIndex - 1 + slides.length) % slides.length;
    } else if (nextBtn) {
      newIndex = (activeIndex + 1) % slides.length;
    } else if (dotBtn) {
      newIndex = parseInt(dotBtn.dataset.slideshowDot || "0", 10);
    }
    
    if (newIndex === activeIndex) return;
    
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === newIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === newIndex);
    });
  });
}

function renderProjectGalleryStrip(project: FeaturedProject) {
  const categorized = getProjectGalleryCategorized(project.id);
  const images = [...(categorized.interiors || []), ...(categorized.amenities || [])].slice(0, 4);
  if (images.length === 0) return "";
  
  return `
    <div class="brochure-gallery-strip" data-gallery-strip="${project.id}">
      <div class="gallery-strip-container">
        ${images.map((img) => `
          <div class="gallery-strip-item">
            <img src="${img.publicPath}" alt="${escapeHtml(img.alt || img.caption || 'Project rendering')}" loading="lazy" />
            ${img.caption ? `<span class="gallery-strip-caption">${escapeHtml(img.caption)}</span>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProjectAmenitiesSection(project: FeaturedProject, draft: ProjectPageDraft, copyPackage?: ProjectCopyPackage) {
  const amenityImages = approvedMediaAssetsForProject(project, "amenities");
  
  let wellnessList: string[] = [];
  let socialList: string[] = [];
  let familyPetsList: string[] = [];
  let workList: string[] = [];
  let serviceList: string[] = [];

  if (project.id === "berkeley") {
    wellnessList = ["Outdoor Pool Terrace", "Rooftop Pool & Spa", "Fitness Center & Studio", "Spa & Wellness Lounge", "Sunset Pool Deck"];
    socialList = ["Private Dining with Chef's Kitchen", "Rooftop Resident Lounge", "Indoor & Outdoor Dining Areas", "Social Clubroom"];
    familyPetsList = ["Landscaped Courtyard", "Pet-Friendly Amenities & Trails"];
    workList = ["Co-working Spaces", "Private Meeting Areas"];
    serviceList = ["24/7 Concierge Services", "Valet Parking & Port-Cochère", "Resident Storage"];
  } else {
    const highlights = draft.highlights || [];
    const amenityTags = highlights.map(h => h.label);
    
    amenityTags.forEach(tag => {
      const lower = tag.toLowerCase();
      if (lower.includes("pool") || lower.includes("fitness") || lower.includes("gym") || lower.includes("spa") || lower.includes("wellness") || lower.includes("yoga") || lower.includes("athletic") || lower.includes("sauna")) {
        wellnessList.push(tag);
      } else if (lower.includes("dining") || lower.includes("club") || lower.includes("lounge") || lower.includes("bar") || lower.includes("social") || lower.includes("grill") || lower.includes("kitchen")) {
        socialList.push(tag);
      } else if (lower.includes("pet") || lower.includes("dog") || lower.includes("family") || lower.includes("play") || lower.includes("kid") || lower.includes("child") || lower.includes("court") || lower.includes("lawn")) {
        familyPetsList.push(tag);
      } else if (lower.includes("work") || lower.includes("office") || lower.includes("study") || lower.includes("meeting") || lower.includes("conference") || lower.includes("library")) {
        workList.push(tag);
      } else {
        serviceList.push(tag);
      }
    });

    if (wellnessList.length === 0 && socialList.length === 0 && serviceList.length === 0) {
      wellnessList = ["Resort-style Pool", "State-of-the-art Fitness"];
      socialList = ["Resident Lounge", "Private Dining Room"];
      serviceList = ["24/7 Concierge", "Valet Parking"];
    }
  }

  const renderGroup = (title: string, list: string[]) => {
    if (list.length === 0) return "";
    return `
      <div class="amenity-category-group">
        <h4>${title}</h4>
        <ul class="amenity-chips-list">
          ${list.map(item => `<li class="amenity-chip-item">${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  const visualPreviewImages = amenityImages.slice(0, 3);
  const visualsHtml = visualPreviewImages.length > 0 
    ? `
      <div class="amenity-visual-grid">
        ${visualPreviewImages.map(img => `
          <div class="amenity-visual-card">
            <img src="${img.src}" alt="${escapeHtml(img.alt || img.title || 'Amenity rendering')}" loading="lazy" />
            <div class="amenity-visual-meta">
              <strong>${escapeHtml(img.title || 'Resident Amenity')}</strong>
            </div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  return `
    <section class="section brochure-amenities-section" id="amenities-${project.id}">
      <div class="amenities-container">
        <div class="section-heading">
          <p class="eyebrow">Amenities</p>
          <h2>${amenitySectionTitle(project)}</h2>
          <p>${publicText(copyPackage?.amenityNarrative ?? draft.highlights[0]?.note ?? "Indoor and outdoor amenities define how the building lives beyond the residence itself: wellness, service, gathering, privacy, and daily convenience.")}</p>
        </div>

        ${visualsHtml}

        <div class="amenities-grouped-grid">
          ${renderGroup("Wellness", wellnessList)}
          ${renderGroup("Social & Dining", socialList)}
          ${renderGroup("Family / Pets", familyPetsList)}
          ${renderGroup("Work & Lifestyle", workList)}
          ${renderGroup("Service", serviceList)}
        </div>
      </div>
    </section>
  `;
}

function locationImageForProject(project: FeaturedProject): string | undefined {
  const assets = getApprovedProjectAssets(project);
  const neighborhoodAsset = assets.find((asset) => asset.placement === "neighborhood" || asset.variant === "aerial-night" || asset.variant?.includes("neighborhood"));
  if (neighborhoodAsset?.src) return neighborhoodAsset.src;
  
  const importedImages = approvedImportedImagesForProject(project.id);
  const importedNeighborhood = importedImages.find((img) => (img.imageType as string) === "neighborhood" || img.id.includes("neighborhood"));
  if (importedNeighborhood) return importedImagePublicPath(importedNeighborhood);
  
  return undefined;
}

function berkeleyIcon(name: string) {
  const paths: Record<string, string> = {
    residence: '<path d="M4 20h16"/><path d="M6 20V7l8-3 4 2v14"/><path d="M9 10h2"/><path d="M9 14h2"/><path d="M14 10h2"/><path d="M14 14h2"/>',
    stories: '<path d="M5 17h14"/><path d="M7 13h10"/><path d="M9 9h6"/><path d="M11 5h2"/>',
    sqft: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 4v16"/><path d="M16 4v16"/><path d="M4 12h16"/><path d="M4 8h4"/><path d="M16 16h4"/>',
    price: '<path d="M20 12V6a2 2 0 0 0-2-2h-6L4 12l8 8 8-8Z"/><circle cx="15" cy="8" r="1"/>',
    bed: '<path d="M4 18V7"/><path d="M20 18v-5a3 3 0 0 0-3-3H4"/><path d="M4 13h16"/><path d="M8 10V8h4v2"/>',
    status: '<path d="M4 19V5"/><path d="M4 7h12l-2 4 2 4H4"/><path d="M19 19H3"/>',
    pool: '<path d="M4 16c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M7 12V5"/><path d="M7 5h6a3 3 0 0 1 3 3v4"/>',
    waterfront: '<path d="M3 17c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/><path d="m5 14 2-5h10l2 5"/><path d="M9 9V5h6v4"/><path d="M12 5V3"/>',
    cabana: '<path d="M4 11c2.5-4 13.5-4 16 0"/><path d="M12 7v12"/><path d="M6 19h12"/><path d="M8 13h8"/>',
    fitness: '<path d="M6 8v8"/><path d="M18 8v8"/><path d="M3 10v4"/><path d="M21 10v4"/><path d="M6 12h12"/>',
    spa: '<path d="M12 19c4-3 6-6 6-10-4 0-6 2-6 6 0-4-2-6-6-6 0 4 2 7 6 10Z"/><path d="M12 19v-6"/>',
    wellness: '<path d="M12 21s7-4.5 7-11a4 4 0 0 0-7-2.7A4 4 0 0 0 5 10c0 6.5 7 11 7 11Z"/><path d="M9 13h6"/><path d="M12 10v6"/>',
    dining: '<path d="M6 3v8"/><path d="M10 3v8"/><path d="M8 11v10"/><path d="M18 3v18"/><path d="M14 8h4"/>',
    lounge: '<path d="M5 11h14a2 2 0 0 1 2 2v5H3v-5a2 2 0 0 1 2-2Z"/><path d="M5 11V8a2 2 0 0 1 2-2h2a3 3 0 0 1 3 3 3 3 0 0 1 3-3h2a2 2 0 0 1 2 2v3"/><path d="M5 18v2"/><path d="M19 18v2"/>',
    work: '<rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    golf: '<path d="M6 20h12"/><path d="M9 18c2-2 4-2 6 0"/><path d="M12 4v10"/><path d="M12 4l5 2-5 2"/>',
    racquet: '<path d="m14 4 6 6"/><path d="m13 5 6 6"/><path d="m8 16 8-8"/><path d="m5 19 3-3"/><path d="m4 20 2-2"/><ellipse cx="15.5" cy="8.5" rx="4" ry="5" transform="rotate(-45 15.5 8.5)"/><circle cx="19" cy="17" r="1.5"/>',
    terrace: '<path d="M4 19h16"/><path d="M6 19v-7h12v7"/><path d="M9 12V8h6v4"/><path d="M8 15h8"/><path d="M12 15v4"/>',
    plan: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9 4v7"/><path d="M4 11h8"/><path d="M12 11v9"/><path d="M12 15h8"/><path d="M16 15v5"/>',
    planResidence: '<path d="M4 20V7l8-4 8 4v13"/><path d="M8 20v-7h8v7"/><path d="M10 9h4"/>',
    planEstate: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M10 5v14"/><path d="M4 12h6"/><path d="M10 9h10"/><path d="M15 9v10"/>',
    planPenthouse: '<path d="M5 20h14"/><path d="M7 20V8h10v12"/><path d="M7 8l3-4 2 4 2-4 3 4"/><path d="M10 12h4"/><path d="M10 16h4"/>',
    valet: '<path d="M12 3a5 5 0 0 1 5 5c0 4-5 10-5 10S7 12 7 8a5 5 0 0 1 5-5Z"/><circle cx="12" cy="8" r="1.5"/>',
    pet: '<circle cx="6" cy="9" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="14" cy="6" r="1.5"/><circle cx="18" cy="9" r="1.5"/><path d="M8 16c1-3 7-3 8 0 1.2 3-9.2 3-8 0Z"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? paths.residence}</svg>`;
}

function renderEditorialShowcaseProjectPage(project: FeaturedProject, copyPackage?: ProjectCopyPackage) {
  const showcase = copyPackage?.showcase;
  const heroImage = showcase?.heroImage?.src ?? getProjectHeroAsset(project)?.src ?? project.heroImage ?? project.image ?? siteMeta.defaultImage;
  const showcaseFloors = copyFactValue(copyPackage, /floors/i, "25")
    .replace(/\s+public-facing.*/i, "")
    .replace(/\s*municipal.*$/i, "")
    .trim();
  const showcaseSizeRange = copyFactValue(copyPackage, /^(showcase size range|size range)$/i, "")
    .replace(/^Approx\.\s*/i, "")
    .replace(/\s*interior\s+sq\.?\s*ft\.?/i, " sq ft")
    .replace(/\s*sq\.\s*ft\.?/i, " sq ft")
    .trim();
  const defaultFacts = [
    { icon: "residence", value: copyFactValue(copyPackage, /residences/i, project.residences), label: "Residences" },
    { icon: "stories", value: showcaseFloors, label: "Stories" },
    { icon: "sqft", value: showcaseSizeRange, label: "Sq Ft" },
    { icon: "bed", value: copyFactValue(copyPackage, /bedrooms/i, ""), label: "Bedrooms" },
    { icon: "price", value: copyFactValue(copyPackage, /price/i, project.price).replace(" to over ", " to "), label: "Pricing" },
  ];
  const facts = (showcase?.factStrip?.length ? showcase.factStrip : defaultFacts).filter((fact) => isBuyerFacingValue(fact.value));
  const heroBlurb = showcase?.heroBlurb ?? copyPackage?.heroSubheadline ?? project.summary;
  const gallery = showcase?.gallery ?? [];
  const galleryClass = showcase?.galleryLayout === "grid" ? "berkeley-gallery-grid" : "berkeley-gallery-slideshow";
  const residences = showcase?.residenceCollections ?? [];
  const amenities = showcase?.amenityHighlights ?? [];
  const teamFacts = (showcase?.projectTeam ?? []).filter((fact) => isBuyerFacingValue(fact.value));
  const visualBreak = showcase?.visualBreak ?? gallery[0];
  const neighborhoodImage = showcase?.neighborhoodImage;
  const neighborhoodHeadline = showcase?.neighborhoodHeadline ?? "Connected to downtown, Palm Beach, and daily convenience.";
  const residenceSectionLabel = showcase?.residenceSectionLabel ?? "Residences";
  const residenceSectionLinkText = showcase?.residenceSectionLinkText ?? "View all floor plans";
  const residenceSectionLinkHref = showcase?.residenceSectionLinkHref ?? `/inquire/?project=${project.id}&interest=floorplans`;
  const residenceSectionHeadingHref = /floor\s*plans?|floorplans?/i.test(residenceSectionLinkText)
    ? floorplanLibraryPath(project.id)
    : residenceSectionLinkHref;
  const titleLines = showcase?.titleLines?.length ? showcase.titleLines : [project.name];
  const intro = showcase?.intro ?? heroBlurb;
  const heroTags = (
    showcase?.heroTags?.length
      ? showcase.heroTags
      : [
          { label: "Status", value: copyFactValue(copyPackage, /^status$/i, project.status) },
          { label: "Corridor", value: showcase?.heroEyebrow ?? project.corridor },
        ]
  ).filter((tag) => isBuyerFacingValue(tag.value));

  return `
    <link rel="stylesheet" href="/assets/styles/editorial-showcase.css?v=mandarin-waterfront-crop-20260602" />
    <div class="route-view route-view-project route-view-editorial-showcase route-view-berkeley-showcase" data-route-view="project" data-project-id="${project.id}" data-project-page-type="showcase" hidden>
      <nav class="berkeley-topbar" aria-label="Project navigation">
        <a class="berkeley-brand" href="/" aria-label="WPB New Construction home">
          <span class="berkeley-brand-mark" aria-hidden="true">WPB</span>
          <span class="berkeley-brand-copy"><strong>WPB</strong><em>New Construction</em></span>
        </a>
        <div>
          <a href="/buildings/">Projects</a>
          <a href="/corridors/">Corridors</a>
          <a href="/market-notes/">Buyers</a>
          <a href="/about/">About Us</a>
          <a href="${floorplanLibraryPath(project.id)}">Floorplans</a>
        </div>
        <a class="berkeley-phone" href="${advisorProfile.mobileHref}" aria-label="Call The Scott Gordon Group">${berkeleyIcon("valet")}</a>
        <a class="berkeley-inquire" href="/inquire/?project=${project.id}&interest=availability">Inquire now <span aria-hidden="true">→</span></a>
      </nav>

      <section class="berkeley-hero-clean">
        <img src="${safeHref(heroImage)}" alt="${publicText(showcase?.heroImage?.alt ?? `${project.name} hero rendering`)}" decoding="async" />
        <div class="berkeley-hero-shade"></div>
        <div class="berkeley-hero-content">
          <h1>${titleLines.map((line) => publicText(line)).join("<br />")}</h1>
          <p class="berkeley-hero-copy">${publicText(heroBlurb)}</p>
        </div>
        ${heroTags.length ? `<div class="berkeley-hero-tags" aria-label="Project tags">${heroTags.map((tag) => `<article><span>${publicText(tag.label)}</span><strong>${publicText(tag.value)}</strong></article>`).join("")}</div>` : ""}
      </section>

      <section class="berkeley-fact-strip" aria-label="Key project facts">
        ${facts.map((fact) => `<article>${berkeleyIcon(fact.icon)}<span>${publicText(fact.label)}</span><strong>${publicText(fact.value)}</strong></article>`).join("")}
      </section>

      <section class="berkeley-intro-section" aria-label="Project introduction">
        <p class="berkeley-kicker">Overview</p>
        <p>${publicText(intro)}</p>
        ${renderProjectFloorplanHubLink(project)}
      </section>

      ${visualBreak ? `<figure class="berkeley-patio-break"><img src="${safeHref(visualBreak.src)}" alt="${publicText(visualBreak.alt ?? `${project.name} ${visualBreak.label}`)}" loading="lazy" decoding="async" /></figure>` : ""}

      ${residences.length ? `<section class="berkeley-residence-section" id="berkeley-residences">
        <div class="berkeley-section-heading"><p class="berkeley-kicker">${publicText(residenceSectionLabel)}</p><a href="${safeHref(residenceSectionHeadingHref)}">${publicText(residenceSectionLinkText)} <span aria-hidden="true">→</span></a></div>
        <div class="berkeley-residence-grid">
          ${residences.map((item, index) => {
            const planIcon = ["planResidence", "planEstate", "planPenthouse"][index] ?? "residence";
            const planVisual = item.thumbnail
              ? `<figure class="berkeley-plan-thumbnail" aria-hidden="true"><img src="${safeHref(item.thumbnail)}" alt="" loading="lazy" decoding="async" /></figure>`
              : `<figure class="berkeley-plan-placeholder" aria-hidden="true">${berkeleyIcon(planIcon)}</figure>`;
            return `<article><div><h3>${publicText(item.title)}</h3><p>${publicText(item.beds)}</p><p>${publicText(item.size)}</p><span class="berkeley-residence-price">${publicText(item.price)}</span></div>${planVisual}</article>`;
          }).join("")}
        </div>
      </section>` : ""}

      ${gallery.length ? `<section class="berkeley-gallery-row ${galleryClass}" aria-label="Project image gallery"><div class="berkeley-section-heading"><p class="berkeley-kicker">Gallery</p><a href="#berkeley-gallery">View all images <span aria-hidden="true">→</span></a></div><div class="berkeley-image-row" id="berkeley-gallery">${gallery.map((item, index) => `<figure><img src="${safeHref(item.src)}" alt="${publicText(item.alt ?? `${project.name} ${item.label}`)}" loading="${showcase?.galleryLayout === "grid" || index < 4 ? "eager" : "lazy"}" decoding="async" /><figcaption>${publicText(item.label)}</figcaption></figure>`).join("")}</div></section>` : ""}

      ${amenities.length ? `<section class="berkeley-amenity-rail" aria-label="Highlighted amenities"><div class="berkeley-section-heading"><p class="berkeley-kicker">Amenities</p></div><div class="berkeley-amenity-icon-grid">${amenities.map((amenity) => `<article>${berkeleyIcon(amenity.icon)}<span>${publicText(amenity.label)}</span></article>`).join("")}</div></section>` : ""}

      ${neighborhoodImage ? `<figure class="berkeley-image-break"><img src="${safeHref(neighborhoodImage.src)}" alt="${publicText(neighborhoodImage.alt ?? `${project.name} ${neighborhoodImage.label}`)}" loading="lazy" decoding="async" /></figure>` : ""}

      <section class="berkeley-neighborhood-section" id="berkeley-neighborhood">
        <div><p class="berkeley-kicker">The Neighborhood</p><h2>${publicText(neighborhoodHeadline)}</h2><p>${publicText(copyPackage?.location ?? project.address)}</p><a class="button ghost" href="${corridorDirectoryPath(project.corridorKey)}">View nearby projects <span aria-hidden="true">→</span></a></div>
        <div class="berkeley-google-map berkeley-project-map">
          <aside class="home-hero-map-card berkeley-map-card" data-focus-project-id="${project.id}" aria-label="West Palm Beach development map centered on ${publicText(project.name)}">
            <figure class="hero-map-preview">
              <div class="hero-google-map" data-hero-google-map aria-label="Google map of West Palm Beach new-construction project locations"></div>
              <button class="hero-map-expand" type="button" data-map-expand>Show all developments</button>
              <div class="hero-map-fallback">
                ${renderProjectMapFallback()}
              </div>
            </figure>
            <div class="home-map-count" aria-label="Map project count">
              <strong>${featuredProjects.length}</strong>
              <span>tracked West Palm Beach new-construction projects</span>
            </div>
          </aside>
          <p class="berkeley-map-address">${publicText(copyFactValue(copyPackage, /^address$/i, project.address))}</p>
          <a href="${corridorDirectoryPath(project.corridorKey)}">View corridor projects <span aria-hidden="true">→</span></a>
        </div>
      </section>

      ${teamFacts.length ? `<section class="berkeley-team-section" aria-label="Project team"><p>${teamFacts.map((fact) => `<span><small>${escapeHtml(fact.label)}:</small> ${publicText(fact.value)}</span>`).join("")}</p></section>` : ""}

      <section class="berkeley-brooke-card" aria-label="Local take"><div><p class="berkeley-kicker">Local Take</p><p>${publicText(copyPackage?.localTake ?? copyPackage?.brookeTake ?? project.summary)}</p></div><div class="berkeley-brooke-profile"><div><h3>The Scott Gordon Group</h3><p>Douglas Elliman</p></div></div><ul><li>${advisorProfile.mobile}</li><li>${advisorProfile.email}</li><li>wpbnewconstruction.com</li></ul></section>

      <section class="berkeley-final-cta"><div><h2>Let's find your right residence.</h2><p>Get current pricing, floor plans, availability, and buyer notes.</p></div><a class="button primary" href="/inquire/?project=${project.id}&interest=availability">Inquire now <span aria-hidden="true">→</span></a><a class="button ghost" href="${advisorProfile.mobileHref}">Call ${advisorProfile.mobile}</a></section>
    </div>
  `;
}

function renderDraftProjectPage(project: FeaturedProject) {
  const draft = editorProjectPageDrafts[project.id] ?? projectDraftFromFeatured(project);
  const copyPackage = batch1ProjectCopyByProjectId.get(project.id);
  if (copyPackage?.pageTemplate === "editorial-showcase" || copyPackage?.showcase?.template === "editorial-showcase") {
    return renderEditorialShowcaseProjectPage(project, copyPackage);
  }
  const intel = localIntelligence[project.id];
  const floorplanProject = getFloorplanProject(project.id);
  const floorplanCount = floorplanProject?.count ?? 0;
  const brochureStats = projectBrochureStats(project, draft, floorplanCount);
  const gallery = projectBrochureGallery(project, draft);
  const approvedHeroAsset = getProjectHeroAsset(project);
  const heroImage = approvedHeroAsset?.src ?? draft.image ?? project.heroImage ?? project.image;
  const amenityTiles = projectBrochureAmenityTiles(project, draft);
  const teamTiles = projectBrochureTeamTiles(project, draft);
  const verticalHeroAsset = getApprovedProjectAssets(project).find((asset) => asset.placement === "hero" && asset.variant === "vertical-exterior");
  const heroMobileImage = verticalHeroAsset?.src ?? (heroImage === project.heroImage ? project.mobileImage : undefined);
  const pageType = project.projectPageType ?? pageTypeForProject(project);
  const isCompactWatch = pageType === "planning-watch" || pageType === "source-watch" || pageType === "market-marker";
  const hasGallery = gallery.some((asset) => canShowImage(asset.src));
  const hasAmenities = !isCompactWatch && amenityTiles.some((asset) => canShowImage(asset.src));
  const hasTeam = teamTiles.length > 0;
  const primaryCta = isCompactWatch ? "Get Updates on This Project" : "Request Current Availability";
  const residencesImage = residenceImageForProject(project, heroImage);

  const isWaterfront = project.corridor.toLowerCase().includes("waterfront") || project.address.toLowerCase().includes("flagler") || ["olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach", "south-flagler-house", "forte-on-flagler", "maison-dor"].includes(project.id);
  const isWalkable = project.corridor.toLowerCase().includes("downtown") || project.corridor.toLowerCase().includes("cityplace") || ["mr-c", "banyan-tree", "nora-house", "berkeley"].includes(project.id);

  const heroTagsHtml = `
    ${isWaterfront ? `<span class="hero-tag tag-waterfront">Waterfront</span>` : ""}
    ${isWalkable ? `<span class="hero-tag tag-walkable">Walkable Downtown</span>` : ""}
  `;

  const heroChipsHtml = brochureStats
    .filter((stat) => stat.value && !/not released|confirm|verify|request/i.test(stat.value))
    .map((stat) => `
      <div class="hero-stat-chip">
        <span class="chip-label">${escapeHtml(stat.label)}</span>
        <span class="chip-value">${escapeHtml(stat.value)}</span>
      </div>
    `).join("");

  const heroPrimaryCtaLabel = isCompactWatch ? "Get Availability Updates" : "View Floorplans";
  const heroSecondaryCtaLabel = isCompactWatch ? "Ask The Scott Gordon Group What Is Known" : "Ask The Scott Gordon Group About This Building";
  const heroPrimaryCtaUrl = isCompactWatch
    ? `/inquire/?project=${project.id}&interest=updates&lead_capture_context=project_hero`
    : floorplanLibraryPath(floorplanProject?.projectId ?? project.id);
  const heroSecondaryCtaUrl = `/inquire/?project=${project.id}&interest=availability&lead_capture_context=project_hero`;

  return `
    <div class="route-view route-view-project route-view-draft-project route-view-brochure-project project-page-${pageType}" data-route-view="project" data-project-id="${project.id}" data-project-page-type="${pageType}" hidden>
      ${renderProjectIdentityHeader(project, pageType)}
      <section class="brochure-hero" id="${project.id}">
        ${renderProjectHeroSlideshow(project, draft, heroImage, heroMobileImage, approvedHeroAsset)}
        <div class="brochure-hero-copy">
          <p class="eyebrow">${project.corridor} · West Palm Beach</p>
          <h1 class="hero-building-name">${escapeHtml(project.name)}</h1>
          <h2 class="hero-headline">${copyPackage ? publicText(copyPackage.introHeadline) : brochureHeadline(project)}</h2>
          <p class="hero-intro-text">${publicText(copyPackage?.introDek ?? project.editorialIntro ?? draft.intro)}</p>

          <div class="brochure-hero-stat-chips">
            ${heroTagsHtml}
            ${heroChipsHtml}
          </div>

          <div class="hero-actions">
            <a class="button primary" href="${heroPrimaryCtaUrl}">${heroPrimaryCtaLabel}</a>
            <a class="button ghost" href="${heroSecondaryCtaUrl}">${heroSecondaryCtaLabel}</a>
          </div>
        </div>
      </section>

      <nav class="brochure-section-nav" aria-label="${project.name} project sections">
        <a href="/buildings/">Explore Buildings</a>
        <a href="#snapshot-${project.id}">At a Glance</a>
        ${intel ? `<a href="#local-take-${project.id}">Local Take</a>` : ""}
        <a href="${floorplanLibraryPath(project.id)}">Floor Plans</a>
        <a href="#overview-${project.id}">Residences</a>
        ${hasGallery ? `<a href="#gallery-${project.id}">Gallery</a>` : ""}
        ${hasAmenities ? `<a href="#amenities-${project.id}">Amenities</a>` : ""}
        <a href="#location-${project.id}">Location</a>
        ${hasTeam ? `<a href="#team-${project.id}">Design Team</a>` : ""}
        <a href="#project-updates-${project.id}">Latest Coverage</a>
        <a href="${isCompactWatch ? `#project-updates-${project.id}` : `/inquire/?project=${project.id}&interest=floorplans`}">${primaryCta}</a>
      </nav>

      ${renderDeveloperImageDisclaimer()}

      ${renderProjectSnapshotCard(project, draft)}
      ${renderProjectGalleryStrip(project)}

      ${intel ? renderLocalTakeSection(project, intel) : ""}

      ${renderProjectEntityBrief(project, floorplanProject, copyPackage)}
      ${renderProjectCorridorCta(project)}
      ${copyPackage ? renderProjectBuyerLens(copyPackage) : ""}

      <section class="brochure-module brochure-residences-module ${!residencesImage ? 'no-feature-image' : ''}" id="overview-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">${isCompactWatch ? "Editorial Brief" : "Residences"}</p>
          <h2>${isCompactWatch ? `${project.name} buyer read` : residenceSectionTitle(project)}</h2>
          <p>${publicText(copyPackage?.residenceNarrative ?? project.summary)}</p>
          <div class="section-actions" style="margin-top: 24px;">
            <a class="button primary" href="${floorplanLibraryPath(floorplanProject?.projectId ?? project.id)}">View Floorplans</a>
          </div>
        </div>
        ${residencesImage ? `
        <figure class="feature-image">
          <img src="${residencesImage}" alt="${project.name} residence visual" style="width: 100%; height: 100%; min-height: 380px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(37,42,45,0.14);" />
        </figure>
        ` : ""}
      </section>

      ${renderProjectFloorplansSection(project, floorplanProject)}

      ${renderProjectGallerySection(project.id)}

      ${hasAmenities ? renderProjectAmenitiesSection(project, draft, copyPackage) : ""}

      <section class="brochure-module brochure-location-module" id="location-${project.id}">
        <div class="brochure-module-copy">
          <p class="eyebrow">The Neighborhood</p>
          <h2>${locationSectionTitle(project)}</h2>
          <p>${publicText(copyPackage?.locationNarrative ?? draft.locationCopy)}</p>
          <a href="/buildings/">Browse all projects <span aria-hidden="true">→</span></a>
        </div>
        <div class="brochure-location-panel-wrapper" style="width: 100%;">
          ${locationImageForProject(project) ? `
            <figure class="location-lifestyle-image">
              <img src="${locationImageForProject(project)}" alt="${project.name} neighborhood setting" style="width: 100%; height: 260px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(37,42,45,0.14); margin-bottom: 20px;" loading="lazy" />
            </figure>
          ` : ""}
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
        </div>
      </section>

      ${renderProjectTeamSection(project, draft)}

      ${renderProjectInternalComparison(project)}
      ${renderProjectRelatedNews(project)}

      <section class="brochure-research-contact" id="project-resources-${project.id}">
        <div class="brochure-research-panel">
          <p class="eyebrow">Buyer Resources</p>
          <h2>${isCompactWatch ? "Track what is known, and what is not." : "Compare residences, floorplans, and next steps."}</h2>
          <p>${isCompactWatch ? "Planning and source-watch pages are intentionally lighter. Use them for status, location, sponsor signals, and related news, not as a promise of current availability." : "Access available floorplans, project details, and advisor guidance before you tour or reserve."}</p>
          <div class="brochure-download-list">
            ${draft.documents.map((document) => renderProjectDocument(document, project.id)).join("")}
            ${!isCompactWatch && floorplanProject ? renderProjectFloorplanHubLink(project, floorplanProject) : ""}
          </div>
        </div>
        ${isCompactWatch ? renderEmailSignup(`project_${project.id}`, `Get updates on ${project.name}`, false, project) : `<form class="brochure-inquiry-card" action="mailto:${advisorProfile.email}" method="post" enctype="text/plain">
          <p class="eyebrow">Inquire</p>
          <h2>Request current availability</h2>
          <p>${shortTeamCtaCopy}</p>
          <label><span>Name</span><input name="name" type="text" autocomplete="name" placeholder="Full name" required /></label>
          <label><span>Email</span><input name="email" type="email" autocomplete="email" placeholder="Email address" required /></label>
          <label><span>Phone</span><input name="phone" type="tel" autocomplete="tel" placeholder="Phone number" /></label>
          <label><span>Message</span><textarea name="message" placeholder="How can The Scott Gordon Group help?">${project.name} inquiry</textarea></label>
          <button type="submit">Request Current Availability</button>
        </form>`}
      </section>

      ${renderTechnicalDisclosuresSection(project, draft)}

      <div class="brochure-mobile-cta-sticky">
        <a class="button primary" href="/inquire/?project=${project.id}&interest=availability&lead_capture_context=mobile_sticky">Request Price Sheet</a>
        <a class="button ghost" href="${advisorProfile.mobileHref.replace("tel:", "sms:")}" style="color: var(--ivory); border-color: rgba(244, 239, 229, 0.4); background: rgba(255,255,255,0.05);">Text The Scott Gordon Group</a>
      </div>
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
  const projectHeroAsset = getProjectHeroAsset(project);
  const projectHeroImage = projectHeroAsset?.src ?? curatedProjectImage(project) ?? placedImportedImageForProject(project.id, "card") ?? project.heroImage ?? project.image;
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
    imageAlt: projectHeroAsset?.alt ?? `${project.name} project image`,
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
  return names
    .map((name, index) => {
      const lowerName = name.toLowerCase();
      const isPlaceholder = 
        lowerName === "not publicly confirmed" ||
        lowerName === "unknown" ||
        lowerName === "n/a" ||
        lowerName === "tbd" ||
        lowerName === "verify" ||
        lowerName.includes("verify legal") ||
        lowerName.includes("not released");
      
      if (isPlaceholder) return null;
      
      return {
        role: roles[index] ?? "Project Team",
        name,
        note: "Team credit captured for buyer orientation; confirm final role and scope with current materials.",
      };
    })
    .filter((credit): credit is TeamCredit => credit !== null);
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
  if (project.id === "rosewood-residences-west-palm-beach") return "Rosewood Residences West Palm Beach";
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
    { label: "Floorplans", value: project.id === "rosewood-residences-west-palm-beach" ? "Not public" : floorplanCount ? `${floorplanCount} plans` : "On request" },
  ];
}

function projectBrochureGallery(project: FeaturedProject, draft: ProjectPageDraft) {
  if (project.id === "ritz-carlton-wpb") {
    return uniqueMediaAssets([
      { src: draft.image ?? `${ritzMediaBase}ritz-hero-waterfront-building-2200x1375.jpg`, kicker: "Project Image", title: draft.title, alt: draft.imageAlt },
      ...ritzResidenceGallery,
      ...ritzAmenityGallery,
      {
        src: `${ritzMediaBase}ritz-view-intracoastal-day-1600x1067.jpg`,
        kicker: "View",
        title: "Intracoastal View",
        alt: "Daytime Intracoastal and Palm Beach view from The Ritz-Carlton Residences",
      },
      {
        src: `${ritzMediaBase}ritz-evening-aerial-road-motion-1600x1067.jpg`,
        kicker: "Location",
        title: "Flagler Drive Context",
        alt: "Night aerial view of The Ritz-Carlton Residences and the West Palm Beach waterfront",
      },
    ]);
  }
  const approvedHero = getProjectHeroAsset(project);
  const approvedResidenceGallery = approvedMediaAssetsForProject(project, "residences");
  const approvedAmenityGallery = approvedMediaAssetsForProject(project, "amenities");
  const approvedNeighborhoodGallery = approvedMediaAssetsForProject(project, "neighborhood");
  const approvedContextGallery = [
    getProjectGalleryAsset(project, "wide-context"),
    getProjectGalleryAsset(project, "vertical-exterior"),
  ]
    .filter((asset): asset is ProjectAsset => Boolean(asset))
    .map((asset) => projectAssetToMedia(asset, "Exterior"));
  const approvedProjectGallery = [
    approvedHero ? projectAssetToMedia(approvedHero, "Exterior") : undefined,
    ...approvedAmenityGallery,
    ...approvedResidenceGallery,
    ...approvedNeighborhoodGallery,
    ...approvedContextGallery,
  ].filter((asset): asset is MediaAsset => Boolean(asset));
  const legacyGallery =
    project.id === "olara"
      ? [...featuredGallery, ...residenceGallery, ...amenityGallery]
      : project.id === "south-flagler-house"
        ? [
            { src: draft.image ?? southFlaglerHouseUserHero, kicker: "Exterior", title: "Waterfront Address", alt: draft.imageAlt },
            ...southFlaglerResidenceGallery,
            ...southFlaglerAmenityGallery,
            { src: `${southFlaglerMediaBase}south-flagler-house-entrance-source.jpg`, kicker: "Arrival", title: "Entrance Sequence", alt: "South Flagler House entrance rendering" },
          ]
        : project.id === "alba-palm-beach"
          ? [
              approvedHero ? projectAssetToMedia(approvedHero, "Exterior") : { src: draft.image ?? `${albaMediaBase}alba-hero.jpg`, kicker: "Exterior", title: "Boutique Waterfront", alt: draft.imageAlt },
              ...approvedResidenceGallery,
              ...approvedAmenityGallery,
              ...approvedNeighborhoodGallery,
              ...approvedContextGallery,
            ]
          : project.id === "shorecrest"
            ? [
                { src: draft.image ?? shorecrestUserHero, kicker: "Exterior", title: "Waterfront Tower", alt: draft.imageAlt },
                ...shorecrestResidenceGallery,
                ...shorecrestAmenityGallery,
              ]
      : [];
  const importedAssets = approvedProjectGallery.length ? [] : approvedImportedImagesForProject(project.id).map((image) => ({
    src: importedImagePublicPath(image),
    kicker: image.imageType === "interior" ? "Interior Rendering" : image.imageType === "amenity" ? "Amenity Image" : image.imageType === "exterior" ? "Project Rendering" : "Developer Image",
    title: image.caption,
    alt: image.alt,
  }));
  const assets = uniqueMediaAssets(project.id === "alba-palm-beach"
    ? [...legacyGallery, ...importedAssets]
    : approvedProjectGallery.length
      ? [...approvedProjectGallery, ...legacyGallery]
      : [...draft.gallery, ...legacyGallery, ...importedAssets]);
  if (project.id !== "alba-palm-beach" && draft.image && !assets.some((asset) => asset.src === draft.image)) {
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
  if (project.id === "ritz-carlton-wpb") {
    return [
      { ...ritzAmenityGallery[0], title: "Fitness and wellness" },
      { ...ritzAmenityGallery[1], title: "Pool deck and cabanas" },
      { ...ritzFeaturedGallery[2], title: "Waterfront lounge" },
      { ...ritzAmenityGallery[2], title: "Valet arrival" },
      {
        src: `${ritzMediaBase}ritz-lobby-service-1600x1067.jpg`,
        kicker: "Amenity",
        title: "Residential service",
        alt: "Ritz-Carlton residential lobby service moment",
      },
      {
        src: `${ritzMediaBase}ritz-view-balcony-night-1600x1067.jpg`,
        kicker: "Amenity",
        title: "Evening terrace setting",
        alt: "Night balcony view toward downtown West Palm Beach",
      },
    ];
  }
  if (project.id === "olara") {
    return [
      { ...amenityGallery[0], title: "Fitness and training" },
      { ...amenityGallery[2], title: "Spa and relaxation" },
      { ...amenityGallery[3], title: "Hot and cold recovery" },
      { ...amenityGallery[4], title: "Poolside service" },
      { src: `${mediaBase}olara-marina-boat-dock-1600x1067.jpg`, kicker: "Amenity", title: "Marina context", alt: "Olara marina and boat dock lifestyle rendering" },
      { ...featuredGallery[0], title: "Social pool deck" },
    ];
  }
  if (project.id === "south-flagler-house") {
    return [
      { ...southFlaglerAmenityGallery[0], title: "Waterfront pool" },
      { ...southFlaglerAmenityGallery[1], title: "Private club depth" },
      { ...southFlaglerAmenityGallery[2], title: "Wellness setting" },
      { src: `${southFlaglerMediaBase}south-flagler-house-entrance-source.jpg`, kicker: "Amenity", title: "Formal arrival", alt: "South Flagler House formal arrival rendering" },
      { src: `${southFlaglerMediaBase}imported/south-flagler-house-penthouse-deck-rendering.jpg`, kicker: "Amenity", title: "Outdoor terraces", alt: "South Flagler House penthouse deck rendering" },
      { src: `${southFlaglerMediaBase}south-flagler-house-rendering-03.png`, kicker: "Amenity", title: "Gardened base", alt: "South Flagler House gardened base rendering detail" },
    ];
  }
  if (project.id === "alba-palm-beach") {
    const approvedAmenityTiles = approvedMediaAssetsForProject(project, "amenities");
    const approvedResidenceTiles = approvedMediaAssetsForProject(project, "residences");
    if (approvedAmenityTiles.length || approvedResidenceTiles.length) {
      return [
        ...approvedAmenityTiles,
        ...approvedResidenceTiles.slice(0, 4).map((asset) => ({ ...asset, kicker: "Residence" })),
      ].slice(0, 6);
    }
    return [
      { ...albaAmenityGallery[0], title: "Waterfront terrace" },
      { ...albaAmenityGallery[1], title: "Pool and direct water edge" },
      { ...albaAmenityGallery[2], title: "Boutique scale" },
      { ...albaResidenceGallery[0], title: "Intracoastal setting" },
      { ...albaResidenceGallery[1], title: "Residential character" },
      projectPlaceholderAsset(project, "Current amenity packet", "Amenity"),
    ];
  }
  if (project.id === "shorecrest") {
    return [
      { ...shorecrestAmenityGallery[0], title: "Pool and amenity context" },
      { ...shorecrestAmenityGallery[1], title: "Dining / lounge reference" },
      { ...shorecrestAmenityGallery[2], title: "Outdoor setting" },
      projectPlaceholderAsset(project, "Lobby and concierge", "Source Confirmed"),
      projectPlaceholderAsset(project, "Fitness / spa details", "Source Confirmed"),
      projectPlaceholderAsset(project, "Offering terms to verify", "Needs Confirmation"),
    ];
  }
  const gallery = projectBrochureGallery(project, draft).filter((asset) => asset.src !== draft.image).slice(3);
  const labels =
    project.id === "rosewood-residences-west-palm-beach"
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
  if (["ritz-carlton-wpb", "olara", "south-flagler-house", "alba-palm-beach", "shorecrest"].includes(project.id)) {
    const approvedLogos = project.id === "alba-palm-beach" ? approvedMediaAssetsForProject(project, "logos") : [];
    return draft.team.slice(0, 6).map((credit) => ({
      credit,
      asset: approvedLogos.find((asset) => {
        const creditName = credit.name.toLowerCase();
        const assetTitle = asset.title.toLowerCase();
        return (creditName.includes("bgi") && assetTitle.includes("bgi"))
          || (creditName.includes("spina") && assetTitle.includes("spina"));
      }) ?? projectPlaceholderAsset(project, credit.role, "Project Team"),
    }));
  }
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



function renderDeveloperImageDisclaimer() {
  return `
    <p class="media-disclaimer">Some project images and renderings are sourced from developer or project marketing materials and are shown for buyer reference. Availability, finishes, views, amenities, and project details should be verified before reliance.</p>
  `;
}

function residenceSectionTitle(project: FeaturedProject) {
  if (project.id === "ritz-carlton-wpb") return "How the residences live.";
  if (project.id === "olara") return "Residences made for water, light, and gathering.";
  if (project.id === "shorecrest") return "What is known about the residences.";
  if (project.id === "alba-palm-beach") return "Boutique residences with direct Intracoastal orientation.";
  if (project.corridorKey === "downtown") return "Thoughtfully designed for modern city living.";
  if (project.corridorKey === "south-flagler") return "Private residences composed around waterfront calm.";
  return "Thoughtfully designed for modern waterfront living.";
}

function amenitySectionTitle(project: FeaturedProject) {
  if (project.id === "ritz-carlton-wpb") return "Service, wellness, and daily operations.";
  if (project.id === "olara") return "Marina, wellness, dining, and social energy.";
  if (project.id === "south-flagler-house") return "Private-club depth without resort noise.";
  if (project.id === "alba-palm-beach") return "Enough amenity support, held at a boutique scale.";
  if (project.id === "shorecrest") return "Amenity details separated from items still being confirmed.";
  return "The lifestyle layer.";
}

function teamSectionTitle(project: FeaturedProject) {
  if (project.id === "ritz-carlton-wpb") return "Why the team matters.";
  if (["olara", "south-flagler-house", "alba-palm-beach", "shorecrest"].includes(project.id)) return "Who they are, and why buyers should care.";
  return "The team behind the address.";
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

function renderProjectDocument(document: ProjectDocument, projectId?: string) {
  const isFloorplanDocument = /floor\s*plans?|floorplans?/i.test(`${document.label} ${document.title} ${document.note}`);
  const content = `
      <span>${publicText(document.label)}</span>
    <strong>${publicText(document.title)}</strong>
    <small>${publicText(isFloorplanDocument ? "Open the on-site floorplan library for current buyer review." : document.note)}</small>
  `;

  if (isFloorplanDocument) {
    return `
      <a class="document-card" href="${floorplanLibraryPath(projectId)}">
        ${content}
      </a>
    `;
  }

  if (document.href && (/^https?:\/\//i.test(document.href) || /\.pdf(?:$|[?#])/i.test(document.href))) {
    return `<article class="document-card is-placeholder">
      <span>${publicText(document.label)}</span>
      <strong>${publicText(document.title)}</strong>
      <small>Request the current buyer packet for details.</small>
    </article>`;
  }

  if (!document.href) {
    return `<article class="document-card is-placeholder">${content}</article>`;
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
  const isRosewood = projectId === "rosewood-residences-west-palm-beach";
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
  return approvedFloorplanLibrary.find((project) => project.projectId === projectId) || floorplanLibrary.find((project) => project.projectId === lookupId);
}

export function renderNeededItem(item: string, index: number) {
  return `
    <article>
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${publicText(item)}</strong>
    </article>
  `;
}

function renderFloorplanLink(plan: { label: string; file: string; note?: string }, basePath = docsBase, projectName = "Olara") {
  const libraryHref = floorplanLibraryPath(floorplanProjectIdFromDocsPath(basePath));
  return `
    <a
      class="floorplan-link floorplan-link-button"
      href="${libraryHref}"
      aria-label="View ${escapeHtml(plan.label)} for ${escapeHtml(projectName)} in the floorplan library"
    >
      <span>${plan.label}</span>
      <small>${plan.note ?? "Floorplan library"}</small>
    </a>
  `;
}

function initFloorplanViewer() {
  const viewer = document.querySelector<HTMLElement>("[data-floorplan-viewer]");
  if (!viewer || viewer.dataset.ready === "true") return;
  viewer.dataset.ready = "true";
  const title = viewer.querySelector<HTMLElement>("[data-floorplan-title]");
  const frame = viewer.querySelector<HTMLElement>("[data-floorplan-frame]");
  let activeIndex = 0;

  const openButtons = () => {
    const activeFloorplanRoute = document.querySelector<HTMLElement>(".route-view-floorplans:not([hidden])");
    if (activeFloorplanRoute) return Array.from(activeFloorplanRoute.querySelectorAll<HTMLButtonElement>("[data-floorplan-open]"));
    return Array.from(document.querySelectorAll<HTMLButtonElement>("[data-floorplan-open]"));
  };
  const openAt = (index: number) => {
    const buttons = openButtons();
    const button = buttons[index];
    if (!button || !frame) return;
    activeIndex = index;
    const src = button.dataset.floorplanSrc || "";
    title?.replaceChildren(document.createTextNode(button.dataset.floorplanTitle || "Floor plan"));
    const frameTitle = escapeHtml(button.dataset.floorplanTitle || "Floorplan preview");
    frame.innerHTML = src
      ? /\.(png|jpe?g|webp)(?:$|[?#])/i.test(src)
        ? `<img src="${safeHref(src)}" alt="${frameTitle}" />`
        : `<iframe src="${safeHref(src)}" title="${frameTitle}"></iframe>`
      : `<div class="floorplan-viewer-request"><strong>Request current packet</strong></div>`;
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
  const filterSelects = Array.from(document.querySelectorAll<HTMLSelectElement>("[data-project-filter-group]"));
  const statusShortcuts = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-status-shortcut]"));
  const railButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-project-scroll]"));
  const visibleCount = document.querySelector<HTMLElement>("[data-visible-count]");
  const coordinateDrawer = document.querySelector<HTMLElement>("[data-coordinate-drawer]");
  const filterSummary = document.querySelector<HTMLElement>("[data-filter-summary]");
  const directoryTitle = document.querySelector<HTMLElement>("[data-directory-title]");
  const directoryDeck = document.querySelector<HTMLElement>("[data-directory-deck]");
  const directoryKicker = document.querySelector<HTMLElement>("[data-directory-kicker]");
  const directorySubtitle = document.querySelector<HTMLElement>("[data-directory-subtitle]");
  const mapPanel = document.querySelector<HTMLElement>(".landing-map-panel");

  if (!grid || !sortSelect) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-project-card]"));
  const pins = Array.from(document.querySelectorAll<HTMLElement>("[data-map-pin]"));
  const filterState = filterSelectionFromUrl(new URLSearchParams(window.location.search));

  const applyProjectState = () => {
    const sortedCards = [...cards].sort((a, b) => compareProjectCards(a, b, sortSelect.value));
    sortedCards.forEach((card) => grid.append(card));

    let visibleProjects = 0;
    const primaryFilter = primaryProjectFilter(filterState);
    mapPanel?.setAttribute("data-active-filter", primaryFilter);

    cards.forEach((card) => {
      const matches = projectMatchesSelection(card, filterState);
      card.hidden = !matches;
      if (matches) {
        visibleProjects += 1;
      }
    });

    pins.forEach((pin) => {
      const matches = projectMatchesSelection(pin, filterState);
      pin.hidden = !matches;
      pin.classList.toggle("is-muted", primaryFilter !== "all" && !matches);
    });

    if (visibleCount) {
      visibleCount.textContent = `${visibleProjects} project${visibleProjects === 1 ? "" : "s"} visible`;
    }

    if (coordinateDrawer) {
      coordinateDrawer.innerHTML = renderCorridorSummary(primaryFilter);
    }

    if (filterSummary) {
      filterSummary.textContent = filterSummaryText(filterState, visibleProjects);
    }

    const heading = directoryHeadingText(filterState, visibleProjects);
    if (directoryTitle) directoryTitle.textContent = heading.title;
    if (directoryDeck) directoryDeck.textContent = heading.deck;
    if (directoryKicker) directoryKicker.textContent = heading.kicker;
    if (directorySubtitle) directorySubtitle.textContent = heading.subtitle;
  };

  filterSelects.forEach((select) => {
    select.addEventListener("change", () => {
      const group = select.dataset.projectFilterGroup as keyof ProjectFilterSelection;
      filterState[group] = select.value;
      syncProjectFilterUrl(filterState);
      applyProjectState();
    });
  });

  statusShortcuts.forEach((shortcut) => {
    shortcut.addEventListener("click", () => {
      applyLegacyProjectFilter(shortcut.dataset.statusShortcut ?? "all", filterState);
      syncProjectFilterControls(filterSelects, filterState);
      syncProjectFilterUrl(filterState);
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
  syncProjectFilterControls(filterSelects, filterState);
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

function filterSelectionFromUrl(params: URLSearchParams): ProjectFilterSelection {
  const selection: ProjectFilterSelection = {
    corridor: params.get("corridor") ?? "all",
    status: params.get("status") ?? "all",
    floorplans: params.get("floorplans") ?? "all",
  };
  applyLegacyProjectFilter(params.get("filter") ?? "all", selection);
  if (!projectCorridorFilters.some((filter) => filter.key === selection.corridor)) selection.corridor = "all";
  if (!projectStatusFilters.some((filter) => filter.key === selection.status)) selection.status = "all";
  if (!projectFloorplanFilters.some((filter) => filter.key === selection.floorplans)) selection.floorplans = "all";
  return selection;
}

function applyLegacyProjectFilter(filter: string, selection: ProjectFilterSelection) {
  if (projectCorridorFilters.some((item) => item.key === filter && filter !== "all")) {
    selection.corridor = filter;
    return;
  }
  if (projectStatusFilters.some((item) => item.key === filter && filter !== "all")) {
    selection.status = filter;
    return;
  }
  if (filter === "floorplans") {
    selection.floorplans = "floorplans";
  }
}

function syncProjectFilterControls(selects: HTMLSelectElement[], selection: ProjectFilterSelection) {
  selects.forEach((select) => {
    const group = select.dataset.projectFilterGroup as keyof ProjectFilterSelection;
    select.value = selection[group] ?? "all";
  });
}

function syncProjectFilterUrl(selection: ProjectFilterSelection) {
  const params = new URLSearchParams(window.location.search);
  params.delete("filter");
  (["corridor", "status", "floorplans"] as const).forEach((group) => {
    if (selection[group] === "all") {
      params.delete(group);
    } else {
      params.set(group, selection[group]);
    }
  });
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function primaryProjectFilter(selection: ProjectFilterSelection) {
  return selection.corridor !== "all" ? selection.corridor : selection.status !== "all" ? selection.status : selection.floorplans;
}

function projectMatchesSelection(element: HTMLElement, selection: ProjectFilterSelection) {
  const values = (element.dataset.filterValues ?? "").split(" ");
  return (["corridor", "status", "floorplans"] as const).every((group) => {
    const value = selection[group];
    return value === "all" || values.includes(value);
  });
}

function filterSummaryText(selection: ProjectFilterSelection, visibleProjects: number) {
  const activeLabels = activeProjectFilterLabels(selection);
  if (!activeLabels.length) {
    return `${visibleProjects} tracked projects shown. Select a corridor to focus the atlas and project cards.`;
  }
  const section = corridorSections.find((item) => item.key === selection.corridor);
  return `${visibleProjects} project${visibleProjects === 1 ? "" : "s"} shown for ${activeLabels.join(" + ")}${section ? ` · ${section.detail}` : ""}.`;
}

function activeProjectFilterLabels(selection: ProjectFilterSelection) {
  return (["corridor", "status", "floorplans"] as const)
    .map((group) => selection[group])
    .filter((value) => value !== "all")
    .map(getFilterLabel);
}

function directoryHeadingText(selection: ProjectFilterSelection, visibleProjects: number) {
  if (selection.corridor !== "all") {
    const label = getFilterLabel(selection.corridor);
    return {
      kicker: "Corridor Projects",
      title: `${label} New Construction Projects`,
      subtitle: `${label} buildings currently tracked.`,
      deck: corridorDirectoryDeck(selection.corridor as CorridorKey),
    };
  }
  if (selection.status !== "all") {
    const label = getFilterLabel(selection.status);
    return {
      kicker: "Project Readiness",
      title: `${label} New Construction Projects`,
      subtitle: `${label} projects currently tracked.`,
      deck: "Compare buildings by timing, information depth, current availability signals, and how close each opportunity is to occupancy.",
    };
  }
  if (selection.floorplans !== "all") {
    return {
      kicker: "Floorplan Availability",
      title: "Projects With Floorplans Available",
      subtitle: "Buildings with floorplan material currently tracked.",
      deck: "Start with projects where residence layouts are available, then compare view lines, room flow, outdoor space, and current buyer packet details.",
    };
  }
  return {
    kicker: "All Projects",
    title: "Browse West Palm Beach New Construction",
    subtitle: "Open the complete project directory.",
    deck: `${visibleProjects} tracked condo developments organized by corridor, readiness, floorplans, and buyer fit.`,
  };
}

function corridorDirectoryDeck(key: CorridorKey) {
  return {
    "north-flagler": "Waterfront and marina-area projects north of Downtown, with the deepest active pipeline and long-term redevelopment story.",
    "south-flagler": "Quieter waterfront projects with Palm Beach views, prestige positioning, and a more residential daily rhythm.",
    downtown: "Walkable projects near restaurants, offices, Brightline, CityPlace, Clematis, the Kravis Center, and NORA.",
  }[key];
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
  const status = project.status.toLowerCase();
  return [
    "all",
    project.corridorKey,
    project.corridorKey === "north-flagler" || project.corridorKey === "south-flagler" ? "waterfront" : "",
    /sales|buyer appointment/.test(status) && !/pipeline|planning|announced/.test(status) ? "active-sales" : "",
    /under construction|topped out/.test(status) ? "under-construction" : "",
    /pipeline|planning|proposed|announced|watchlist|emerging/.test(status) ? "announced-planned" : "",
    /completed|delivered|closings underway|resale/.test(status) ? "completed-opportunities" : "",
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

/* ==========================================================================
   PHASE 1 VISUAL OVERHAUL HELPER FUNCTIONS
   ========================================================================== */

function getProjectGalleryCategorized(projectId: string) {
  type GalleryCategorizedImage = {
    id: string;
    imageType: string;
    placement?: string;
    caption: string;
    alt: string;
    publicPath: string;
  };
  const approvedAssets: GalleryCategorizedImage[] = getApprovedProjectAssets(projectId)
    .filter((asset) => ["hero", "amenities", "residences", "neighborhood"].includes(asset.placement))
    .filter((asset) => /\.(?:jpe?g|png|webp)$/i.test(asset.src))
    .map((asset) => ({
      id: asset.variant ?? asset.filename ?? asset.src,
      imageType: asset.placement === "residences" ? "interior" : asset.placement === "amenities" ? "amenity" : asset.placement === "hero" ? "exterior" : "context",
      placement: asset.placement,
      caption: asset.title,
      alt: asset.alt,
      publicPath: asset.src,
    }));
  const importedAssets: GalleryCategorizedImage[] = approvedAssets.length ? [] : approvedImportedImagesForProject(projectId).map((img) => ({
    id: img.id,
    imageType: img.imageType,
    placement: img.placement,
    caption: img.caption,
    alt: img.alt,
    publicPath: importedImagePublicPath(img),
  }));
  const images = uniqueGalleryCategorizedImages([...approvedAssets, ...importedAssets]);
  const categories: Record<string, typeof images> = {
    exterior: [],
    interiors: [],
    amenities: [],
    views: [],
    floorplans: [],
    siteplan: [],
    construction: [],
    team: [],
  };

  images.forEach((img) => {
    const idLower = img.id.toLowerCase();
    const typeLower = img.imageType.toLowerCase();
    const placementLower = (img.placement || "").toLowerCase();

    if (idLower.includes("floorplan") || idLower.includes("plan") || typeLower === "floorplan") {
      categories.floorplans.push(img);
    } else if (idLower.includes("site") || idLower.includes("map")) {
      categories.siteplan.push(img);
    } else if (idLower.includes("construction") || idLower.includes("milestone") || idLower.includes("progress")) {
      categories.construction.push(img);
    } else if (idLower.includes("team") || idLower.includes("developer") || idLower.includes("logo") || idLower.includes("partner")) {
      categories.team.push(img);
    } else if (idLower.includes("view") || idLower.includes("balcony") || idLower.includes("sunrise") || idLower.includes("sunset") || idLower.includes("exposure")) {
      categories.views.push(img);
    } else if (typeLower === "amenity" || idLower.includes("amenity") || idLower.includes("pool") || idLower.includes("lobby") || idLower.includes("valet") || idLower.includes("spa") || idLower.includes("fitness")) {
      categories.amenities.push(img);
    } else if (typeLower === "interior" || placementLower === "interior" || idLower.includes("interior") || idLower.includes("kitchen") || idLower.includes("living") || idLower.includes("bath") || idLower.includes("bedroom")) {
      categories.interiors.push(img);
    } else {
      categories.exterior.push(img);
    }
  });

  return categories;
}

function renderProjectGallerySection(projectId: string) {
  const categorized = getProjectGalleryCategorized(projectId);
  const activeCategories = Object.entries(categorized).filter(([_, list]) => list.length > 0);

  if (activeCategories.length === 0) return "";

  const tabControls = activeCategories.map(([cat, list], idx) => {
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    const displayName = label === "Floorplans" ? "Floor Plans" : label === "Siteplan" ? "Site Plan / Map" : label;
    return `
      <button
        class="gallery-filter-btn${idx === 0 ? " active" : ""}"
        type="button"
        data-gallery-filter="${cat}"
        data-project-id="${projectId}"
      >
        ${displayName} (${list.length})
      </button>
    `;
  }).join("");

  const tabPanels = activeCategories.map(([cat, list], idx) => {
    return `
      <div
        class="gallery-tab-panel"
        data-gallery-panel="${cat}"
        data-project-id="${projectId}"
        ${idx === 0 ? "" : "hidden"}
      >
        <div class="gallery-grid-layout">
          ${list.map((img) => `
            <div class="gallery-item-card" data-image-id="${img.id}">
              <figure class="gallery-item-frame">
                <img src="${img.publicPath}" alt="${escapeHtml(img.alt || img.caption || "Project rendering")}" loading="lazy" />
                <figcaption class="gallery-item-caption">
                  <span class="gallery-item-tag">${escapeHtml(img.imageType)}</span>
                  <span class="gallery-item-desc">${escapeHtml(img.caption || img.alt || "Developer visualization")}</span>
                </figcaption>
              </figure>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="section brochure-gallery-section" id="gallery-${projectId}">
      <div class="section-heading">
        <p class="eyebrow">Project Media</p>
        <h2>Curated residence & amenity gallery.</h2>
        <p>Verified rendering representations and architectural photography organized by details.</p>
      </div>
      <div class="gallery-wrapper">
        <div class="gallery-filter-bar">
          ${tabControls}
        </div>
        <div class="gallery-panels-container">
          ${tabPanels}
        </div>
      </div>
    </section>
  `;
}

function uniqueGalleryCategorizedImages<T extends { publicPath: string }>(images: T[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.publicPath)) return false;
    seen.add(image.publicPath);
    return true;
  });
}

function renderProjectSnapshotCard(project: FeaturedProject, draft: ProjectPageDraft) {
  const findFactValue = (regex: RegExp, fallback = "") => {
    const fact = draft.facts.find((f) => regex.test(f.label)) || draft.highlights.find((f) => regex.test(f.label));
    return fact?.value ?? fallback;
  };

  let developer = draft.team.find((t) => /developer|sponsor|partner/i.test(t.role))?.name ?? "";
  let architect = draft.team.find((t) => /architect/i.test(t.role))?.name ?? "";
  let designer = draft.team.find((t) => /interior/i.test(t.role))?.name ?? "";

  if (project.id === "berkeley") {
    developer = "Australian Properties Group; Al Adelson; Sympatico Real Estate";
    architect = "Arquitectonica / Bernardo Fort-Brescia";
    designer = "Arquitectonica Interiors";
  }

  const sizingResidences = [
    { label: "Number of Units", value: project.residences },
    { label: "Number of Floors", value: findFactValue(/stor(y|ies)|floor/i) },
    { label: "Residence Types", value: findFactValue(/bed/i) },
    { label: "Square Footage Range", value: findFactValue(/sq|size|foot/i) }
  ];

  const designDevelopment = [
    { label: "Address", value: project.address },
    { label: "Developer", value: developer },
    { label: "Architect", value: architect },
    { label: "Interior Designer", value: designer }
  ];

  const pricingTiming = [
    { label: "Price Range", value: project.price },
    { label: "Estimated Completion", value: project.delivery },
    { label: "Maintenance Estimate", value: findFactValue(/maintenance|carrying|fee/i) },
    { label: "Deposit Structure", value: findFactValue(/deposit|structure|payment/i) },
    { label: "Parking Allocation", value: findFactValue(/parking/i) },
    { label: "Pet Policy", value: findFactValue(/pet/i) },
    { label: "Storage", value: findFactValue(/storage|locker/i) },
    { label: "Sales Status", value: project.status }
  ];

  const isImportantField = (label: string) => {
    const l = label.toLowerCase();
    return (
      l.includes("completion") ||
      l.includes("delivery") ||
      l.includes("maintenance") ||
      l.includes("deposit") ||
      l.includes("parking") ||
      l.includes("pet policy") ||
      l.includes("storage")
    );
  };

  const getCleanValue = (val: string, label: string) => {
    const v = (val || "").trim();
    const lower = v.toLowerCase();
    const isPlaceholder = !v || 
      lower === "not publicly confirmed" ||
      val === "Not publicly confirmed" ||
      lower === "unknown" ||
      lower === "n/a" ||
      lower === "tbd" ||
      lower === "verify" ||
      lower.includes("not released") ||
      lower.includes("confirm") ||
      lower.includes("request");
    
    if (isPlaceholder) {
      if (isImportantField(label)) {
        return `<span class="details-pending">Details pending</span>`;
      }
      return null;
    }
    return escapeHtml(v);
  };

  const processFields = (fields: { label: string; value: string }[]) => {
    return fields
      .map(f => ({ label: f.label, cleanValue: getCleanValue(f.value, f.label) }))
      .filter(f => f.cleanValue !== null) as { label: string; cleanValue: string }[];
  };

  const col1 = processFields(sizingResidences);
  const col2 = processFields(designDevelopment);
  const col3 = processFields(pricingTiming);

  const renderColHtml = (title: string, items: { label: string; cleanValue: string }[]) => {
    if (items.length === 0) return "";
    return `
      <div class="snapshot-column">
        <h3>${title}</h3>
        <ul class="snapshot-spec-list">
          ${items.map(item => `
            <li class="snapshot-spec-item">
              <span class="snapshot-spec-label">${escapeHtml(item.label)}</span>
              <strong class="snapshot-spec-value">${item.cleanValue}</strong>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  };

  return `
    <section class="section brochure-snapshot-section" id="snapshot-${project.id}">
      <div class="snapshot-card-container">
        <div class="snapshot-card-header">
          <p class="eyebrow">At a Glance</p>
          <h2>Building Specifications</h2>
          <p>Verified project facts compiled from municipal filings and official developer disclosures.</p>
        </div>
        <div class="snapshot-columns">
          ${renderColHtml("Sizing & Residences", col1)}
          ${renderColHtml("Design & Development", col2)}
          ${renderColHtml("Pricing & Timing", col3)}
        </div>
        <div class="snapshot-card-footer">
          <p class="source-attribution">Information last compiled May 2026. Price ranges and residence availability are subject to daily change.</p>
          <a class="button primary" href="/inquire/?project=${project.id}&interest=pricing&lead_capture_context=project_snapshot">Request Current Pricing</a>
        </div>
      </div>
    </section>
  `;
}

function initProjectGalleryTabs() {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>("[data-gallery-filter]");
    if (!btn) return;

    const category = btn.dataset.galleryFilter;
    const projectId = btn.dataset.projectId;
    if (!category || !projectId) return;

    // Find all filter buttons for this project
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(`[data-gallery-filter][data-project-id="${projectId}"]`));
    buttons.forEach((item) => {
      item.classList.toggle("active", item.dataset.galleryFilter === category);
    });

    // Find all panels for this project
    const panels = Array.from(document.querySelectorAll<HTMLElement>(`[data-gallery-panel][data-project-id="${projectId}"]`));
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.galleryPanel !== category;
    });
  });
}

function renderLocalTakeSection(project: FeaturedProject, intel: any) {
  const titleHtml = `
    <p class="eyebrow">Advisor Review</p>
    <h2>Local Take</h2>
    <p class="brookes-take-lead">${publicText(intel.brookesTake)}</p>
  `;

  return `
    <section class="section brochure-local-take-section" id="local-take-${project.id}">
      <div class="local-take-container">
        <div class="local-take-header">
          ${titleHtml}
        </div>

        <div class="local-take-grid">
          <!-- Left side: Buyer Fit & Location/Access Notes -->
          <div class="local-take-sidebar">
            <!-- Best Fit For (Buyer Fit Panel) -->
            <div class="local-take-widget buyer-fit-widget">
              <h3>Best Fit For</h3>
              <div class="buyer-fit-chips">
                ${intel.buyerProfile.map((profile: string) => `
                  <span class="buyer-fit-chip">${escapeHtml(profile)}</span>
                `).join("")}
              </div>
            </div>

            <!-- Access & Location Notes -->
            <div class="local-take-widget access-location-widget">
              <h3>Access & Navigation</h3>
              <div class="access-notes-list">
                ${intel.palmBeachAccess ? `
                  <div class="access-note-item">
                    <strong>Palm Beach Island Access</strong>
                    <p>${escapeHtml(intel.palmBeachAccess)}</p>
                  </div>
                ` : ""}
                ${intel.trafficNotes ? `
                  <div class="access-note-item">
                    <strong>Traffic & Commuting</strong>
                    <p>${escapeHtml(intel.trafficNotes)}</p>
                  </div>
                ` : ""}
                ${intel.nearbyCompetitors && intel.nearbyCompetitors.length > 0 ? `
                  <div class="access-note-item competitors-list">
                    <strong>Nearby Competing Towers</strong>
                    <p>
                      ${intel.nearbyCompetitors.map((compId: string) => {
                        const compProject = featuredProjects.find(p => p.id === compId);
                        if (compProject) {
                          return `<a href="${projectPath(compProject)}" class="competitor-link">${escapeHtml(compProject.name)}</a>`;
                        } else {
                          return `<span class="competitor-text">${escapeHtml(compId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))}</span>`;
                        }
                      }).join("")}
                    </p>
                  </div>
                ` : ""}
              </div>
            </div>
          </div>

          <!-- Right side: Pros & Tradeoffs -->
          <div class="local-take-main">
            <div class="pros-cons-grid">
              <div class="pros-column">
                <h3>Buyer Considerations</h3>
                <ul class="pros-list">
                  ${intel.pros.map((pro: string) => `
                    <li>
                      <span>${escapeHtml(pro)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
              <div class="cons-column">
                <h3>Market Factors to Watch</h3>
                <ul class="cons-list">
                  ${intel.cons.map((con: string) => `
                    <li>
                      <span>${escapeHtml(con)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProjectFloorplansSection(project: FeaturedProject, floorplanProject: any) {
  const plans = floorplanProject?.plans ?? [];
  const hasPlans = plans.length > 0;
  const libraryHref = floorplanLibraryPath(floorplanProject?.projectId ?? project.id);

  const titleHtml = `
    <p class="eyebrow">Floor Plans</p>
    <h2>Residence Layouts & Lines</h2>
    <p class="section-lead-text">Compare floorplan designs, balcony orientation, and view exposures. Always confirm current line availability and stack details before making a decision.</p>
  `;

  if (!hasPlans) {
    return `
      <section class="section brochure-floorplans-section" id="floorplans-${project.id}">
        <div class="floorplans-section-container">
          <div class="section-heading">
            ${titleHtml}
          </div>
          <div class="floorplans-inquiry-box">
            <div class="inquiry-box-content">
              <h3>View Floorplans</h3>
              <p>Open the floorplan hub for ${escapeHtml(project.name)}, then request current materials when availability, views, and pricing need confirmation.</p>
              <a class="button primary" href="${libraryHref}">View Floorplans</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  const extraCount = Math.max(0, plans.length - 8);
  const footerHtml = extraCount > 0
    ? `<p class="floorplans-extra-note">${plans.length} floorplan records are organized in the new floorplan hub.</p>`
    : "";

  return `
    <section class="section brochure-floorplans-section" id="floorplans-${project.id}">
      <div class="floorplans-section-container">
        <div class="section-heading">
          ${titleHtml}
        </div>
        <div class="floorplans-section-footer floorplans-section-footer-single">
          ${footerHtml}
          <div class="floorplans-actions">
            <a class="button primary" href="${libraryHref}">View Floorplans</a>
            <a class="button ghost" href="/inquire/?project=${project.id}&interest=floorplans&lead_capture_context=floorplans_section_footer">Request Current Packet</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProjectTeamSection(project: FeaturedProject, draft: ProjectPageDraft) {
  let developerName = "";
  let architectName = "";
  let designerName = "";
  let landscapeName = "";
  let salesName = "";

  if (project.id === "berkeley") {
    developerName = "Australian Properties Group; Al Adelson; Sympatico Real Estate";
    architectName = "Arquitectonica / Bernardo Fort-Brescia";
    designerName = "Arquitectonica Interiors";
    landscapeName = "EDSA";
    salesName = "Douglas Elliman Development Marketing";
  } else {
    const team = draft.team || [];
    const getRealName = (roleRegex: RegExp) => {
      const match = team.find(t => roleRegex.test(t.role));
      if (!match) return "";
      const val = match.name.trim();
      const lower = val.toLowerCase();
      if (
        !val ||
        lower === "not publicly confirmed" ||
        lower === "unknown" ||
        lower === "n/a" ||
        lower === "tbd" ||
        lower === "verify" ||
        lower.includes("verify legal") ||
        lower.includes("not released")
      ) {
        return "";
      }
      return val;
    };

    developerName = getRealName(/developer|sponsor|lead|partner/i);
    architectName = getRealName(/architect/i);
    designerName = getRealName(/interior|design/i);
    landscapeName = getRealName(/landscape|construction/i);
    salesName = getRealName(/marketing|sales/i);
  }

  const hasAnyTeam = Boolean(developerName || architectName || designerName || landscapeName || salesName);
  if (!hasAnyTeam) return "";

  return `
    <section class="section brochure-team-section" id="team-${project.id}">
      <div class="team-section-container">
        <div class="section-heading">
          <p class="eyebrow">Project Team</p>
          <h2>${teamSectionTitle(project)}</h2>
          <p>The design and development firms behind ${escapeHtml(project.name)}, supporting project credibility and long-term asset value.</p>
        </div>

        <div class="project-team-box">
          <ul class="project-team-list">
            ${developerName ? `
              <li class="project-team-row">
                <span class="project-team-role">Developer</span>
                <strong class="project-team-name">${escapeHtml(developerName)}</strong>
              </li>
            ` : ""}
            ${architectName ? `
              <li class="project-team-row">
                <span class="project-team-role">Architecture</span>
                <strong class="project-team-name">${escapeHtml(architectName)}</strong>
              </li>
            ` : ""}
            ${designerName ? `
              <li class="project-team-row">
                <span class="project-team-role">Interiors</span>
                <strong class="project-team-name">${escapeHtml(designerName)}</strong>
              </li>
            ` : ""}
            ${landscapeName ? `
              <li class="project-team-row">
                <span class="project-team-role">Landscape</span>
                <strong class="project-team-name">${escapeHtml(landscapeName)}</strong>
              </li>
            ` : ""}
            ${salesName ? `
              <li class="project-team-row">
                <span class="project-team-role">Sales & Marketing</span>
                <strong class="project-team-name">${escapeHtml(salesName)}</strong>
              </li>
            ` : ""}
          </ul>
        </div>
      </div>
    </section>
  `;
}
