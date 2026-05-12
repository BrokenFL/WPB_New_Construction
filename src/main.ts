import "./style.css";

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

type ProjectFilter = {
  key: string;
  label: string;
};

type CorridorSection = {
  key: CorridorKey;
  label: string;
  detail: string;
};

type NewsItem = {
  kicker: string;
  title: string;
  summary: string;
  tag: string;
};

const mediaBase = "/projects/olara/media/";
const docsBase = "/projects/olara/docs/";
const ritzMediaBase = "/projects/ritz-carlton-wpb/media/";
const ritzDocsBase = "/projects/ritz-carlton-wpb/docs/";
const ritzBrochureUrl = "https://www.flipsnack.com/relatedgroup/ritzwpb-brochure/full-view.html";

const featuredProjects: FeaturedProject[] = [
  {
    id: "olara",
    name: "Olara",
    corridor: "North Flagler",
    corridorKey: "north-flagler",
    status: "Under Construction",
    delivery: "2027 / 2028 range",
    deliveryYear: 2027,
    residences: "275",
    price: "Advisor verified",
    href: "#olara",
    image: `${mediaBase}olara-hero-exterior-1536x1024.png`,
    summary: "Waterfront residences with marina lifestyle, wellness programming, and a deep released floorplan packet.",
    floorplans: true,
    pageState: "Page ready",
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
    href: "#ritz",
    image: `${ritzMediaBase}ritz-hero-waterfront-building-2880x1800.png`,
    summary: "Branded residences by Related Group and BH Group with Arquitectonica, Rockwell Group, and Naturalficial.",
    floorplans: true,
    pageState: "Page ready",
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
    residences: "98",
    price: "Advisor verify",
    href: "#inquire",
    summary: "Related Ross waterfront tower at 1865 N Flagler with published fact sheet and floorplan assets in the research library.",
    floorplans: true,
    pageState: "Next page",
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
    price: "Advisor verify",
    href: "#inquire",
    summary: "Downtown mixed hotel-and-residences tower with 146 residences, 110 hotel keys, and a deep floorplan download set.",
    floorplans: true,
    pageState: "Model ready",
    rank: 4,
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
    price: "Advisor verify",
    href: "#inquire",
    summary: "Boutique North Flagler waterfront tower at 4714 N Flagler with 22 stories and reported spring 2026 delivery.",
    floorplans: false,
    pageState: "Research ready",
    rank: 5,
    longitude: -80.051,
    latitude: 26.7526,
    address: "4714 N Flagler Dr",
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
    price: "Advisor verify",
    href: "#inquire",
    summary: "Two 28-story waterfront towers at 1355 S Flagler Drive, positioned as the South Flagler luxury benchmark.",
    floorplans: false,
    pageState: "Research ready",
    rank: 6,
    longitude: -80.0511,
    latitude: 26.7015,
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
    residences: "To verify",
    price: "Advisor verify",
    href: "#inquire",
    summary: "District-level marker for the planned NORA condominium while public address sources are still being reconciled.",
    floorplans: false,
    pageState: "Soft marker",
    rank: 7,
    longitude: -80.0581,
    latitude: 26.7178,
    address: "NORA district",
  },
];

const projectFilters: ProjectFilter[] = [
  { key: "all", label: "All" },
  { key: "north-flagler", label: "North Flagler" },
  { key: "downtown", label: "Downtown" },
  { key: "south-flagler", label: "South Flagler" },
  { key: "under-construction", label: "Under Construction" },
  { key: "floorplans", label: "Floor Plans" },
];

const corridorSections: CorridorSection[] = [
  {
    key: "north-flagler",
    label: "North Flagler",
    detail: "Alba, Olara, Shorecrest, Ritz-Carlton",
  },
  {
    key: "downtown",
    label: "Downtown",
    detail: "NORA House, Mr. C",
  },
  {
    key: "south-flagler",
    label: "South Flagler",
    detail: "South Flagler House",
  },
];

const newsItems: NewsItem[] = [
  {
    kicker: "Construction",
    title: "Ritz-Carlton has moved from sales story to active jobsite.",
    summary: "Groundbreaking reporting and the supplied brochure give us enough verified material for a polished project page and floorplan library.",
    tag: "Ritz-Carlton",
  },
  {
    kicker: "Assets",
    title: "Olara now has the strongest media and floorplan package in the prototype.",
    summary: "Hero, mobile hero, residence, amenity, marina, brochure, and individual floorplan PDFs are organized for buyer-facing use.",
    tag: "Olara",
  },
  {
    kicker: "Pipeline",
    title: "North Flagler should become the first comparison corridor.",
    summary: "The front page should lead with a map-backed view of Olara, Ritz-Carlton, Shorecrest, and nearby pipeline projects.",
    tag: "Market Intel",
  },
  {
    kicker: "Next Intake",
    title: "Shorecrest is the logical next building to collect.",
    summary: "It gives the front page a downtown-waterfront counterpoint and prevents the experience from feeling like only North Flagler.",
    tag: "Asset Request",
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
  { label: "Pricing", value: "From $2.5M reported", note: "Availability and pricing should be advisor-verified." },
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

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container was not found.");
}

app.innerHTML = `
  <div class="site-shell">
    <header class="site-nav">
      <a class="brand" href="#top" aria-label="Olara page top">
        <span class="brand-mark">
          <img src="${mediaBase}olara-logo-monogram-2000x2000.png" alt="" />
        </span>
        <span>
          <strong>WPB New Construction</strong>
          <small>Private Development Advisory</small>
        </span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#top">Home</a>
        <a href="#map">Map</a>
        <a href="#projects">Projects</a>
        <a href="#news">News</a>
        <a href="#olara">Olara</a>
        <a href="#ritz">Ritz</a>
      </nav>
      <a class="nav-cta" href="#inquire">Inquire</a>
    </header>

    <main>
      <section class="home-hero" id="top">
        <div class="home-hero-overlay"></div>
        <div class="home-hero-grid">
          <div class="home-hero-content">
            <p class="eyebrow">Private Advisory · West Palm Beach</p>
            <h1>West Palm Beach New Construction</h1>
            <p class="hero-copy">
              A map-backed project library for North Flagler, Downtown, and South Flagler:
              live Olara and Ritz pages, accurate project cards, and buyer-ready comparison data.
            </p>
            <div class="hero-actions">
              <a class="button primary" href="#projects">Sort Projects</a>
              <a class="button ghost" href="#olara">Open Olara</a>
            </div>
            <div class="home-hero-metrics" aria-label="Homepage summary">
              <div>
                <span>Live Pages</span>
                <strong>Olara + Ritz</strong>
              </div>
              <div>
                <span>Mapped Projects</span>
                <strong>${featuredProjects.length}</strong>
              </div>
              <div>
                <span>Next Build</span>
                <strong>Shorecrest</strong>
              </div>
            </div>
          </div>

          <div class="home-map-stage" id="map">
            <div class="map-panel landing-map-panel" aria-label="Stylized West Palm Beach project map">
              <div class="map-label palm-beach">Palm Beach Island</div>
              <div class="map-label north-flagler">North Flagler</div>
              <div class="map-label downtown">Downtown WPB</div>
              <div class="map-label south-flagler">South Flagler</div>
              <div class="map-label intracoastal">Intracoastal</div>
              <div class="map-section-layer" aria-label="Select a West Palm Beach corridor">
                ${corridorSections.map(renderCorridorSection).join("")}
              </div>
              <svg class="stylized-map" viewBox="0 0 720 760" role="img" aria-label="Editorial SVG map of West Palm Beach, Palm Beach Island, and active project pins">
                <defs>
                  <linearGradient id="mapWater" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#a7c7bf" />
                    <stop offset="100%" stop-color="#6e9f9c" />
                  </linearGradient>
                  <linearGradient id="mapLand" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#f2eadb" />
                    <stop offset="100%" stop-color="#d6c5a6" />
                  </linearGradient>
                </defs>
                <rect class="map-water" width="720" height="760" rx="0" />
                <path class="map-mainland" d="M0 0H328C296 86 294 156 268 226C237 311 235 387 211 470C187 553 175 642 137 760H0Z" />
                <path class="map-island" d="M548 0C510 102 514 182 481 270C448 359 446 456 414 548C390 617 380 684 352 760H720V0Z" />
                <path class="map-waterway" d="M342 0C311 91 314 165 286 244C257 327 255 407 231 489C204 580 196 662 166 760H338C363 670 377 596 405 516C437 423 438 342 467 262C498 176 493 93 526 0Z" />
                <path class="map-shoreline" d="M328 0C296 86 294 156 268 226C237 311 235 387 211 470C187 553 175 642 137 760" />
                <path class="map-shoreline" d="M548 0C510 102 514 182 481 270C448 359 446 456 414 548C390 617 380 684 352 760" />
                <path class="map-road" d="M292 42C269 128 266 198 241 278C218 352 213 439 189 522C169 591 157 666 129 728" />
                <path class="map-road map-road-secondary" d="M218 92C203 191 192 287 171 379C150 471 130 578 103 704" />
                <path class="map-road map-road-secondary" d="M452 18C432 114 429 205 402 292C373 391 372 505 340 626" />
                <path class="map-bridge" d="M188 410H436" />
                <path class="map-bridge" d="M160 574H376" />
                <path class="map-grid-line" d="M38 184H270" />
                <path class="map-grid-line" d="M28 330H236" />
                <path class="map-grid-line" d="M18 512H190" />
              </svg>
              ${featuredProjects.map(renderMapPin).join("")}
              <div class="map-legend" aria-label="Map legend">
                <span>Accurate relative north/south placement from catalog coordinates</span>
                <strong data-visible-count>${featuredProjects.length} projects visible</strong>
              </div>
              <div class="map-coordinate-drawer" data-coordinate-drawer aria-live="polite"></div>
            </div>
          </div>
        </div>

        <div class="project-sort-shell" id="projects">
          <div class="project-sort-header">
            <div>
              <p class="eyebrow">Project Library</p>
              <h2>Sort the market from the first screen.</h2>
            </div>
            <div class="project-controls" aria-label="Project sorting controls">
              <div class="filter-chips" role="list" aria-label="Project filters">
                ${projectFilters.map(renderProjectFilter).join("")}
              </div>
              <label class="sort-control">
                <span>Sort</span>
                <select data-project-sort aria-label="Sort projects">
                  <option value="featured">Featured</option>
                  <option value="delivery">Delivery</option>
                  <option value="residences">Residences</option>
                  <option value="corridor">Corridor</option>
                </select>
              </label>
            </div>
          </div>
          <div class="front-project-grid" data-project-grid>
            ${featuredProjects.map(renderFeaturedProject).join("")}
          </div>
        </div>
      </section>

      <section class="comparison-band" aria-label="Waterfront project comparison">
        <div>
          <span>Primary Corridor</span>
          <strong>North Flagler + Downtown Waterfront</strong>
        </div>
        <div>
          <span>Core Advantage</span>
          <strong>Floorplans, teams, media, and status in one place</strong>
        </div>
        <div>
          <span>Lead CTA</span>
          <strong>Request current availability</strong>
        </div>
      </section>

      <section class="section news-section" id="news">
        <div class="section-heading">
          <p class="eyebrow">Current News</p>
          <h2>Development pulse, not blog filler.</h2>
        </div>
        <div class="news-grid">
          ${newsItems.map(renderNewsItem).join("")}
        </div>
      </section>

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
            <a class="button primary" href="${docsBase}olara-floorplans-all-march-2026.pdf" target="_blank" rel="noreferrer">View Floorplans</a>
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

      <section class="section intro-section">
        <div class="section-heading">
          <p class="eyebrow">Selected Direction</p>
          <h2>Gallery-first. Map later.</h2>
        </div>
        <p class="large-copy">
          The experience now leads with the images and materials buyers actually care about:
          arrival, residences, views, wellness, marina lifestyle, floorplans, and a direct inquiry path.
          The old 3D map can return as a supporting discovery layer after the project pages are polished.
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
          Remaining project pages will use the same data fields.
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
            <figcaption>Balcony view · Intracoastal foreground</figcaption>
          </figure>
          <figure>
            <img src="${mediaBase}olara-view-east-intracoastal-ocean-2400x1600.png" alt="Olara east-facing Intracoastal and ocean view" />
            <figcaption>East view · Palm Beach and Atlantic horizon</figcaption>
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
          <a class="document-card" href="${docsBase}olara-floorplans-all-march-2026.pdf" target="_blank" rel="noreferrer">
            <span>PDF · Floorplans</span>
            <strong>Complete Floorplan Collection</strong>
            <small>Saved as olara-floorplans-all-march-2026.pdf</small>
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
            <h3>Residence plan PDFs, renamed for direct buyer sharing.</h3>
          </div>
          <div class="floorplan-grid">
            ${floorplanDownloads.map((plan) => renderFloorplanLink(plan)).join("")}
          </div>
        </div>
      </section>

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
            The second project page now uses the same gallery-first system: verified team credits,
            buyer-facing facts, curated arrival/residence/amenity media, brochure, and a clean
            floorplan library.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="${ritzBrochureUrl}" target="_blank" rel="noreferrer">Open Brochure</a>
            <a class="button ghost" href="#ritz-floorplans">View Floorplans</a>
          </div>
        </div>
      </section>

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
          the user-supplied brochure, Rockwell Group, and February 2026 construction reporting.
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
            This asset should anchor the arrival section because it communicates service,
            privacy, warm lighting, and a distinctly hotel-residential threshold.
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
            <figcaption>Day view · Palm Beach Island and Atlantic horizon</figcaption>
          </figure>
          <figure>
            <img src="${ritzMediaBase}ritz-view-balcony-night-2400x1600.png" alt="Night balcony view toward downtown West Palm Beach" />
            <figcaption>Night view · Downtown West Palm Beach and waterfront lights</figcaption>
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
            Use this aerial image for a market-intelligence or news block. It helps connect
            the building to downtown, Palm Beach, the waterfront corridor, and the larger
            development story buyers are trying to understand.
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
            <h3>Residence and lake-home PDFs, renamed for direct buyer sharing.</h3>
          </div>
          <div class="floorplan-grid">
            ${ritzFloorplanDownloads.map((plan) => renderFloorplanLink(plan, ritzDocsBase)).join("")}
          </div>
        </div>
      </section>

      <section class="section inquiry-section" id="inquire">
        <div>
          <p class="eyebrow">Private Advisory</p>
          <h2>Request current availability and the full floorplan packet.</h2>
        </div>
        <form class="inquiry-form">
          <label>
            <span>Name</span>
            <input type="text" name="name" autocomplete="name" placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="you@example.com" />
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
          <button class="button primary" type="submit">Prepare Inquiry</button>
        </form>
      </section>
    </main>
  </div>
`;

document.querySelector<HTMLFormElement>(".inquiry-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const target = event.currentTarget;
  if (!(target instanceof HTMLFormElement)) {
    return;
  }

  const form = new FormData(target);
  const name = String(form.get("name") ?? "").trim() || "Prospect";
  const interest = String(form.get("interest") ?? "Request floorplans");
  window.alert(`${name}, this inquiry is ready for CRM wiring: ${interest}.`);
});

initProjectBrowser();

function renderProjectFilter(filter: ProjectFilter) {
  const active = filter.key === "all" ? " is-active" : "";
  return `
    <button class="filter-chip${active}" type="button" data-project-filter="${filter.key}" aria-pressed="${filter.key === "all"}">
      ${filter.label}
    </button>
  `;
}

function renderCorridorSection(section: CorridorSection) {
  const count = featuredProjects.filter((project) => project.corridorKey === section.key).length;

  return `
    <button
      class="map-zone map-zone-${section.key}"
      type="button"
      data-project-filter="${section.key}"
      aria-pressed="false"
    >
      <span>${section.label}</span>
      <strong>${count}</strong>
      <small>${section.detail}</small>
    </button>
  `;
}

function renderGalleryCard(asset: MediaAsset) {
  return `
    <article class="gallery-card">
      <img src="${asset.src}" alt="${asset.alt}" />
      <div>
        <span>${asset.kicker}</span>
        <strong>${asset.title}</strong>
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
  return `
    <article class="feature-card">
      <img src="${asset.src}" alt="${asset.alt}" />
      <div>
        <span>${asset.kicker}</span>
        <strong>${asset.title}</strong>
      </div>
    </article>
  `;
}

function renderFeaturedProject(project: FeaturedProject) {
  const media = project.image
    ? `<img src="${project.image}" alt="${project.name} project preview" />`
    : `<div class="project-card-placeholder"><span>${project.pageState}</span></div>`;
  const actionText = project.pageState === "Page ready" ? "Open Project" : "Queue Page";

  return `
    <article
      class="front-project-card"
      data-project-card
      data-project-id="${project.id}"
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
        <figcaption>${project.pageState}</figcaption>
      </figure>
      <div class="front-project-card-body">
        <span>${project.corridor} · ${project.status}</span>
        <strong>${project.name}</strong>
        <p>${project.summary}</p>
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
          <a href="${project.href}">${actionText}</a>
          <a href="#map">Map Pin</a>
        </div>
      </div>
    </article>
  `;
}

function renderMapPin(project: FeaturedProject, index: number) {
  const position = getProjectMapPosition(project);

  return `
    <a
      class="map-pin"
      href="${project.href}"
      data-map-pin
      data-project-id="${project.id}"
      data-corridor="${project.corridorKey}"
      data-filter-values="${getProjectFilterValues(project)}"
      style="--pin-x: ${position.left}%; --pin-y: ${position.top}%;"
      aria-label="${project.name} at ${project.address}"
    >
      <span class="pin-dot">${String(index + 1).padStart(2, "0")}</span>
      <span class="pin-card">
        <strong>${project.name}</strong>
        <small>${project.corridor} · ${project.delivery}</small>
      </span>
    </a>
  `;
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

function renderProjectFact(fact: ProjectFact) {
  return `
    <article class="profile-card">
      <span>${fact.label}</span>
      <strong>${fact.value}</strong>
      ${fact.note ? `<p>${fact.note}</p>` : ""}
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
  const visibleCount = document.querySelector<HTMLElement>("[data-visible-count]");
  const coordinateDrawer = document.querySelector<HTMLElement>("[data-coordinate-drawer]");
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
      coordinateDrawer.innerHTML = renderCoordinateDrawer(activeFilter);
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
  applyProjectState();
}

function compareProjectCards(a: HTMLElement, b: HTMLElement, sortValue: string) {
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

function renderCoordinateDrawer(activeFilter: string) {
  if (activeFilter === "all") {
    return `
      <span>Choose A Corridor</span>
      <div>
        <p>
          <strong>North Flagler</strong>
          <small>${featuredProjects.filter((project) => project.corridorKey === "north-flagler").length} mapped projects</small>
        </p>
        <p>
          <strong>Downtown</strong>
          <small>${featuredProjects.filter((project) => project.corridorKey === "downtown").length} mapped projects</small>
        </p>
        <p>
          <strong>South Flagler</strong>
          <small>${featuredProjects.filter((project) => project.corridorKey === "south-flagler").length} mapped projects</small>
        </p>
      </div>
    `;
  }

  const visibleProjects = featuredProjects.filter((project) => projectDataMatchesFilter(project, activeFilter));
  const heading =
    `${getFilterLabel(activeFilter)} Coordinates`;

  return `
    <span>${heading}</span>
    <div>
      ${visibleProjects
        .map(
          (project) => `
            <p>
              <strong>${project.name}</strong>
              <small>${project.latitude.toFixed(5)}, ${project.longitude.toFixed(5)}</small>
            </p>
          `,
        )
        .join("")}
    </div>
  `;
}

function projectDataMatchesFilter(project: FeaturedProject, filter: string) {
  if (filter === "all") {
    return true;
  }

  return getProjectFilterValues(project).split(" ").includes(filter);
}

function getFilterLabel(filter: string) {
  return projectFilters.find((item) => item.key === filter)?.label ?? filter;
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

function getProjectMapPosition(project: FeaturedProject) {
  const bounds = {
    north: 26.755,
    south: 26.699,
    west: -80.0645,
    east: -80.0495,
  };

  const rawX = ((project.longitude - bounds.west) / (bounds.east - bounds.west)) * 100;
  const rawY = ((bounds.north - project.latitude) / (bounds.north - bounds.south)) * 100;
  const left =
    project.corridorKey === "downtown"
      ? clamp(21 + rawX * 0.22, 18, 35)
      : clamp(39 + rawX * 0.08, 38, 47);
  const top = clamp(8 + rawY * 0.82, 8, 91);

  return {
    left: Number(left.toFixed(2)),
    top: Number(top.toFixed(2)),
  };
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
