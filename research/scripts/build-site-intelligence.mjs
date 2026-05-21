import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const workspace = process.cwd();
const reviewPath = path.join(workspace, "research/source-material-review/project-source-catalog.json");
const projectsRoot = path.join(workspace, "research/asset-library/projects");
const reviewRoot = path.join(workspace, "research/source-material-review");
const publicDataRoot = path.join(workspace, "public/data");
const generatedRoot = path.join(workspace, "src/generated");
const preferredRoot = path.join(workspace, "research/asset-library/preferred-image-exports");
const productionBaseUrl = "https://wpbnewconstruction.com";
const generatedDate = new Date().toISOString().slice(0, 10);
const cloudflarePagesSingleFileLimitBytes = 25 * 1024 * 1024;

const priorityProjects = new Set([
  "olara",
  "ritz-carlton-wpb",
  "shorecrest",
  "mr-c",
  "alba-palm-beach",
  "mandarin-oriental",
  "nora-house",
  "south-flagler-house-north",
  "edgeworth-north",
  "banyan-tree",
  "forte-on-flagler",
]);

const siteMeta = {
  siteName: "WPB New Construction",
  baseUrl: productionBaseUrl,
  title: "West Palm Beach New Construction Condos | Buyer Guide",
  description:
    "Compare West Palm Beach new-construction condos across North Flagler, Downtown, and South Flagler with source-backed facts, released floorplans, and buyer advisory context.",
  publisher: {
    name: "Douglas Elliman Florida, LLC d/b/a Douglas Elliman",
    type: "RealEstateAgent",
    areaServed: "West Palm Beach, Florida",
    brokerageLicense: "CQ1020232",
  },
  expertByline: {
    name: "Brooke Matthew Snader",
    title: "Licensed Real Estate Broker Associate",
    role: "West Palm Beach new-construction advisor",
    license: "BK3291335",
    group: "The Scott Gordon Group",
    phone: "(561) 891-0186",
    brokerage: "Douglas Elliman Florida, LLC d/b/a Douglas Elliman",
  },
  reviewedBy: {
    name: "WPB New Construction Review Desk",
    role: "Project source review",
  },
  defaultImage: "/maps/wpb-atlas-map-editorial.svg",
};

const answerBlocks = [
  {
    id: "when-will-projects-be-ready",
    shortLabel: "Ready dates",
    question: "When will the main West Palm Beach new-construction condos be ready?",
    answer:
      "The nearest dated completion in the current source set is Alba Palm Beach, with official material pointing to closings beginning around June 2026. Shorecrest and South Flagler House are both positioned around 2027. Ritz-Carlton Residences West Palm Beach is expected in 2028. Olara's current official/download material points to 2028, though some third-party coverage has used earlier timing. NORA House is more of a 2027 construction-start and 2029 finish story in recent reporting. Mandarin Oriental is a long-horizon play, with anticipated opening in 2031. Treat every date as a planning window until the sales team confirms it in writing.",
    concept: "Delivery timing",
    relatedProjectIds: ["alba-palm-beach", "shorecrest", "south-flagler-house", "ritz-carlton-wpb", "olara"],
    sources: ["official project sites", "Florida YIMBY", "World Red Eye", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Alba official site",
        href: "https://www.albapalmbeach.com/",
        note: "Official/current Alba source used for near-term closing timing.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Alba near-term delivery timing",
        claimText: "Alba is the closest dated completion in the current catalog.",
        confidence: "high",
      },
      {
        label: "Ritz-Carlton WPB construction report",
        href: "https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html",
        note: "Reports groundbreaking, 27 stories, 138 residences, and expected 2028 completion.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Ritz-Carlton delivery timing",
        claimText: "Ritz-Carlton WPB is expected in 2028.",
        confidence: "medium",
      },
    ],
  },
  {
    id: "what-will-it-cost",
    shortLabel: "Cost",
    question: "What will these West Palm Beach new-construction condos cost?",
    answer:
      "Use public pricing only as a starting frame. Current source notes show Olara from roughly $1.7M in official fact material, Alba starting just under $3M, Shorecrest from about $3M, Ritz-Carlton from about $3M in current developer material, Mandarin Oriental from $3.5M, Maison d'Or from $5.7M, NORA House in the high $1Ms with reporting around $2M to $6.5M, and Banyan Tree reporting around $1.9M. South Flagler House pricing changes by dated availability, so request a current sheet. The real answer is always line, floor, view, terrace, parking, and release phase.",
    concept: "Pricing guidance",
    relatedProjectIds: ["olara", "alba-palm-beach", "shorecrest", "ritz-carlton-wpb", "maison-dor"],
    sources: ["official project sites", "The Real Deal", "Florida YIMBY", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Shorecrest loan coverage",
        href: "https://therealdeal.com/miami/2026/02/19/related-ross-lands-157-million-loan-for-shorecrest-condos/",
        note: "Reports Shorecrest pricing starting at $3M, plus stories, unit count, and expected completion.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Shorecrest pricing guidance",
        claimText: "Shorecrest reporting places pricing from about $3M.",
        confidence: "medium",
      },
      {
        label: "Maison d'Or official site",
        href: "https://livemaisondor.com/",
        note: "Official source for boutique South Flagler pricing guidance and residence count.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Maison d'Or starting pricing",
        claimText: "Maison d'Or official material lists pricing from $5.7M.",
        confidence: "high",
      },
    ],
  },
  {
    id: "which-offer-water-views",
    shortLabel: "Water views",
    question: "Which projects offer water views?",
    answer:
      "The clearest waterfront-view set is Olara, Ritz-Carlton, Shorecrest, Alba, Mandarin Oriental, South Flagler House, Maison d'Or, Forte, and La Clara. Olara, Shorecrest, Ritz-Carlton, and South Flagler House sit directly in the Flagler waterfront comparison. Mandarin Oriental and Alba extend that North Flagler water-view story farther north. Maison d'Or is the boutique South Flagler answer. Downtown projects such as Mr. C, NORA House, Banyan Tree, and The Berkeley are better evaluated as walkability and city-view plays unless a specific stack, floor, and view corridor is confirmed.",
    concept: "Water views",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach", "south-flagler-house"],
    sources: ["official project sites", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source for Intracoastal, Palm Beach Island, Atlantic, marina, and waterfront positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Olara water-view positioning",
        claimText: "Olara belongs in the direct waterfront-view set.",
        confidence: "high",
      },
      {
        label: "Mandarin Oriental WPB coverage",
        href: "https://floridayimby.com/2026/03/the-mandarin-oriental-residences-west-palm-beach-planned-for-2031-completion-at-5400-n-flagler-dr-west-palm-beach-fl.html",
        note: "Reports that Mandarin Oriental residences will feature Intracoastal views.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Mandarin Oriental water views",
        claimText: "Mandarin Oriental belongs in the future water-view set.",
        confidence: "medium",
      },
    ],
  },
  {
    id: "stories-and-residence-counts",
    shortLabel: "Stories + units",
    question: "How many stories and residences does each major project have?",
    answer:
      "Current source notes show Olara at 26 stories and 275 residences; Ritz-Carlton at 27 stories and 138 residences; Shorecrest at 28 stories with a source conflict between 98 and 100 residences; Mr. C at 27 stories with 146 residences plus 110 hotel suites; Alba at 22 stories and 55 residences; Mandarin Oriental at 31 stories and 87 residences; South Flagler House as two 28-story towers with roughly 105 to 108 residences depending on source date; NORA House at 11 stories and 117 residences; Banyan Tree at 25 stories with an 86 to 88 residence/unit source conflict; and Maison d'Or at 19 stories and 39 residences.",
    concept: "Project facts",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "mr-c", "south-flagler-house"],
    sources: ["official project sites", "Florida YIMBY", "The Real Deal", "World Red Eye", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Ritz-Carlton WPB construction report",
        href: "https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html",
        note: "Reports 27 stories and 138 condominium residences.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Ritz-Carlton stories and residence count",
        claimText: "Ritz-Carlton WPB is a 27-story, 138-residence project.",
        confidence: "medium",
      },
      {
        label: "NORA House launch coverage",
        href: "https://worldredeye.com/2026/03/wre-news-nora-house-anchors-residential-expansion-in-west-palm-beachs-nora-district/",
        note: "Reports 11 stories and 117 residences in the NORA District.",
        sourceType: "project launch reporting",
        dateAccessed: generatedDate,
        supportsClaim: "NORA stories and residence count",
        claimText: "NORA House is reported as 11 stories with 117 residences.",
        confidence: "medium",
      },
    ],
  },
  {
    id: "which-are-actually-under-construction",
    shortLabel: "Under construction",
    question: "Which projects are actually under construction now?",
    answer:
      "The most relevant under-construction set includes Olara, Ritz-Carlton Residences West Palm Beach, Shorecrest, Mr. C, Alba Palm Beach, and South Flagler House. Those are different from sales-launched or planning-stage projects such as NORA House, Banyan Tree, Mandarin Oriental, Maison d'Or, Edgeworth, and other pipeline items. Construction status can move quickly, so confirm the current jobsite milestone before treating timing as reliable.",
    concept: "Construction status",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "mr-c", "alba-palm-beach", "south-flagler-house"],
    sources: ["official project sites", "Florida YIMBY", "The Real Deal", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Olara vertical construction report",
        href: "https://floridayimby.com/2025/12/olara-commences-vertical-construction-at-1919-north-flagler-drive-in-west-palm-beach.html",
        note: "Reports that Olara commenced vertical construction at 1919 North Flagler Drive.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Olara construction status",
        claimText: "Olara is in active construction.",
        confidence: "medium",
      },
      {
        label: "South Flagler House tops out",
        href: "https://floridayimby.com/2025/11/south-flagler-house-tops-out-at-1355-south-flagler-drive-in-west-palm-beach.html",
        note: "Reports South Flagler House topping out at 28 stories.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "South Flagler House construction status",
        claimText: "South Flagler House has reached a major construction milestone.",
        confidence: "medium",
      },
    ],
  },
  {
    id: "where-should-buyers-start",
    shortLabel: "Where to start",
    question: "Where should a serious buyer start when comparing West Palm Beach new construction?",
    answer:
      "Start with corridor, service model, and delivery timing. North Flagler is the densest waterfront comparison set; Downtown is the walkability and hospitality story; South Flagler is quieter, more residential, and closer to Palm Beach Island. Once the lifestyle lane is clear, compare released floorplans, view exposure, amenity depth, parking, service fees, and the current availability sheet before touring.",
    concept: "West Palm Beach buyer strategy",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "mr-c", "south-flagler-house"],
    sources: ["project-source-catalog", "official project sites", "corridor source review"],
    sourceCitations: [
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "North Flagler waterfront positioning, amenities, dining, marina, and location source.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "North Flagler waterfront comparison",
        claimText: "Olara belongs in the first North Flagler comparison set.",
        confidence: "high",
      },
      {
        label: "NORA House official site",
        href: "https://norahouse.com/",
        note: "Downtown/NORA positioning source for walkability, rooftop amenities, and district lifestyle.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Downtown walkability and district positioning",
        claimText: "NORA House belongs in the downtown lifestyle comparison set.",
        confidence: "high",
      },
    ],
  },
  {
    id: "north-flagler-vs-downtown-vs-south-flagler",
    shortLabel: "Corridor choice",
    question: "How do North Flagler, Downtown, and South Flagler differ for luxury condo buyers?",
    answer:
      "North Flagler is the active waterfront cluster, with Olara, Ritz-Carlton, Shorecrest, Alba, and future branded supply competing on water views, service, and amenity scale. Downtown trades some waterfront quiet for restaurants, offices, hotels, and walkability. South Flagler feels more estate-like: fewer towers, a softer residential rhythm, and a stronger Palm Beach-adjacent identity.",
    concept: "WPB corridor comparison",
    relatedProjectIds: ["olara", "shorecrest", "mr-c", "nora-house", "south-flagler-house"],
    sources: ["official project sites", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Shorecrest official amenities",
        href: "https://www.shorecrestwpb.com/amenities",
        note: "North Flagler amenity and service model source.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "North Flagler waterfront service comparison",
        claimText: "Shorecrest adds another active waterfront option on North Flagler.",
        confidence: "high",
      },
      {
        label: "South Flagler House official amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "South Flagler amenity, service, and waterfront lifestyle source.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "South Flagler lifestyle positioning",
        claimText: "South Flagler House anchors the quieter South Flagler luxury comparison.",
        confidence: "high",
      },
    ],
  },
  {
    id: "which-projects-have-floorplans",
    shortLabel: "Floorplans",
    question: "Which projects have the most useful floorplan material available now?",
    answer:
      "Olara, Ritz-Carlton, Mr. C, and Shorecrest are the strongest starting points for plan comparison because public plan links or deeper plan packets are available in the current catalog. Alba, NORA House, Maison d'Or, Forte on Flagler, and The Berkeley have partial plan or plan-page material. Pipeline projects should be treated as watch-list items until official plan releases are published.",
    concept: "Floorplan readiness",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "mr-c", "shorecrest", "alba-palm-beach"],
    sources: ["public floorplan links", "official project sites", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Olara official floorplans",
        href: "https://www.olarawestpalmbeach.com/floor-plans",
        note: "Official plan page used for current plan-depth review.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Olara floorplan availability",
        claimText: "Olara has a deep official floorplan release.",
        confidence: "high",
      },
      {
        label: "Mr. C official downloads",
        href: "https://www.mrcresidenceswpb.com/downloads/",
        note: "Official download page used for downtown floorplan review.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Mr. C floorplan availability",
        claimText: "Mr. C has public download material for buyer plan review.",
        confidence: "high",
      },
    ],
  },
  {
    id: "what-to-confirm-before-touring",
    shortLabel: "Before touring",
    question: "What should I confirm before scheduling sales gallery tours?",
    answer:
      "Confirm live availability, deposit structure, estimated monthly carrying costs, parking, storage, view premiums, completion timing, assignment or resale restrictions, included finishes, and whether the residence line you like is actually available. Public websites set the mood; the current sales packet tells you whether the opportunity still exists.",
    concept: "Buyer due diligence",
    relatedProjectIds: ["olara", "shorecrest", "south-flagler-house", "mr-c", "maison-dor"],
    sources: ["official project sites", "Florida condominium disclosure context"],
    sourceCitations: [
      {
        label: "Banyan Tree legal notice",
        href: "https://www.banyantreeresidenceswpb.com/",
        note: "Developer legal notice reminds buyers to rely on required condominium documents, not oral or promotional representations.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "buyer should verify offering documents",
        claimText: "Buyer decisions should be based on formal documents and current sales materials.",
        confidence: "high",
      },
      {
        label: "NORA House legal notice",
        href: "https://norahouse.com/",
        note: "Official page includes Florida condominium-document disclaimer language.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "developer documents control",
        claimText: "Formal condominium documents should be requested before relying on project claims.",
        confidence: "high",
      },
    ],
  },
  {
    id: "which-projects-feel-most-service-driven",
    shortLabel: "Service model",
    question: "Which West Palm Beach projects are most service-driven?",
    answer:
      "Ritz-Carlton, South Flagler House, Shorecrest, Olara, Mr. C, Mandarin Oriental, Banyan Tree, and Maison d'Or all speak to service, but they do it differently. Branded residences lean on hospitality standards; Related Ross projects emphasize Related Life and staffed ownership; Olara layers resort-style amenities with dining and marina access; Maison d'Or positions itself around discreet boutique service.",
    concept: "Service and hospitality",
    relatedProjectIds: ["ritz-carlton-wpb", "south-flagler-house", "shorecrest", "olara", "maison-dor"],
    sources: ["official project sites", "developer announcements"],
    sourceCitations: [
      {
        label: "Ritz-Carlton WPB construction report",
        href: "https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html",
        note: "Reports Ritz-Carlton-staffed amenities and shared spaces for the West Palm Beach project.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Ritz-Carlton service model",
        claimText: "Ritz-Carlton WPB is positioned around a staffed branded-residence model.",
        confidence: "medium",
      },
      {
        label: "South Flagler House amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official source for Related Life, concierge, home care, and amenity programming.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Related Life service model",
        claimText: "South Flagler House offers service programming beyond standard amenities.",
        confidence: "high",
      },
    ],
  },
  {
    id: "north-flagler-comparison-set",
    shortLabel: "North Flagler",
    question: "Which North Flagler projects should be compared together?",
    answer:
      "Compare Olara, Ritz-Carlton, Shorecrest, and Alba first. They sit in the same broad waterfront decision lane but speak to different buyers: Olara for amenity depth and marina lifestyle, Ritz-Carlton for branded service, Shorecrest for boutique floor plates and wellness, and Alba for a smaller northern waterfront building closer to delivery. Mandarin Oriental and Alba Reserve belong on the future-supply watch list.",
    concept: "North Flagler new construction",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "alba-palm-beach", "mandarin-oriental"],
    sources: ["Olara official site", "Shorecrest official site", "Ritz-Carlton project reporting", "Alba official site"],
    sourceCitations: [
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source for Olara's North Flagler waterfront lifestyle positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Olara North Flagler positioning",
        claimText: "Olara belongs in the North Flagler waterfront set.",
        confidence: "high",
      },
      {
        label: "Shorecrest official amenities",
        href: "https://www.shorecrestwpb.com/amenities",
        note: "Official source for Shorecrest amenities, address, and service program.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Shorecrest North Flagler positioning",
        claimText: "Shorecrest belongs in the North Flagler waterfront set.",
        confidence: "high",
      },
    ],
  },
  {
    id: "south-flagler-buyer-profile",
    shortLabel: "South Flagler",
    question: "Who is the South Flagler buyer?",
    answer:
      "The South Flagler buyer usually wants waterfront presence without the busier feel of the North Flagler construction cluster. South Flagler House is the current benchmark for full-service, large-scale luxury; Maison d'Or is the boutique waterfront counterpoint; Forte and La Clara help benchmark delivered-product expectations. The question is less 'what is flashiest' and more 'which address feels calm enough to live in every day?'",
    concept: "South Flagler buyer profile",
    relatedProjectIds: ["south-flagler-house", "maison-dor", "forte-on-flagler", "la-clara"],
    sources: ["South Flagler House official material", "Maison d'Or official material"],
    sourceCitations: [
      {
        label: "South Flagler House official amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official source for South Flagler House's waterfront, wellness, dining, business, and recreation programming.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "South Flagler House luxury benchmark",
        claimText: "South Flagler House is a major South Flagler benchmark.",
        confidence: "high",
      },
      {
        label: "Maison d'Or official site",
        href: "https://livemaisondor.com/",
        note: "Official source for boutique South Flagler positioning, 39 residences, and waterfront amenities.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Maison d'Or boutique counterpoint",
        claimText: "Maison d'Or is a boutique South Flagler comparison option.",
        confidence: "high",
      },
    ],
  },
  {
    id: "downtown-walkability-buyer",
    shortLabel: "Downtown",
    question: "Which projects make the most sense for a buyer who wants walkability?",
    answer:
      "Start with Mr. C, NORA House, Banyan Tree, and The Berkeley. These are not simply alternatives to the waterfront towers; they are a different ownership proposition: restaurants, offices, hotels, retail, and district energy closer to the front door. For buyers who split time between Palm Beach, West Palm offices, and travel, Downtown can be more convenient than a quieter waterfront-only address.",
    concept: "Downtown walkability",
    relatedProjectIds: ["mr-c", "nora-house", "banyan-tree", "berkeley"],
    sources: ["Mr. C official site", "NORA House official site", "Banyan Tree official site"],
    sourceCitations: [
      {
        label: "NORA House official site",
        href: "https://norahouse.com/",
        note: "Official source for NORA district walkability and rooftop amenity positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "NORA walkable district positioning",
        claimText: "NORA House is a downtown/NORA walkability project.",
        confidence: "high",
      },
      {
        label: "Mr. C residences",
        href: "https://www.mrcresidenceswpb.com/residences/",
        note: "Official source for Mr. C residence and downtown hospitality-residence positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Mr. C downtown positioning",
        claimText: "Mr. C belongs in the downtown hospitality-residence comparison.",
        confidence: "high",
      },
    ],
  },
  {
    id: "waterfront-vs-walkable",
    shortLabel: "Water vs walkable",
    question: "Should I prioritize waterfront views or walkability?",
    answer:
      "Choose waterfront if your daily life is built around views, privacy, outdoor terraces, marina or pool culture, and a calmer arrival sequence. Choose walkability if restaurants, offices, hotels, cultural venues, and social energy matter more than pure water frontage. The right answer is usually revealed by a simple question: where do you want your first 15 minutes of every day to happen?",
    concept: "Lifestyle tradeoff",
    relatedProjectIds: ["olara", "south-flagler-house", "mr-c", "nora-house", "banyan-tree"],
    sources: ["official project sites", "corridor source review"],
    sourceCitations: [
      {
        label: "Olara official location",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source for Flagler Drive waterfront positioning, marina, amenities, and Palm Beach proximity.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "waterfront lifestyle positioning",
        claimText: "Olara is a waterfront lifestyle project.",
        confidence: "high",
      },
      {
        label: "NORA House official site",
        href: "https://norahouse.com/",
        note: "Official source for NORA district, walkability, and city lifestyle positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "walkable lifestyle positioning",
        claimText: "NORA House is framed around downtown district life.",
        confidence: "high",
      },
    ],
  },
  {
    id: "which-projects-have-marina-or-boating",
    shortLabel: "Boating",
    question: "Which projects should boating-oriented buyers watch?",
    answer:
      "Olara is the clearest current boating lifestyle story because its official positioning includes a private marina. Maison d'Or also references direct water access, a new private boat dock, and slips, though a buyer should confirm slip details, assignment, cost, and operating rules. For any waterfront project, ask whether boating access is deeded, licensed, reserved, waitlisted, or simply nearby.",
    concept: "Marina and boating access",
    relatedProjectIds: ["olara", "maison-dor", "rybovich-marina"],
    sources: ["Olara official site", "Maison d'Or official site"],
    sourceCitations: [
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source for Olara's private marina positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "private marina",
        claimText: "Olara markets a private marina as part of its waterfront lifestyle.",
        confidence: "high",
      },
      {
        label: "Maison d'Or official site",
        href: "https://livemaisondor.com/",
        note: "Official source references waterfront access, a private boat dock, and slips.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "boat dock and slips",
        claimText: "Maison d'Or references direct water access and boat slips.",
        confidence: "high",
      },
    ],
  },
  {
    id: "wellness-amenity-comparison",
    shortLabel: "Wellness",
    question: "Which buildings lean hardest into wellness and fitness?",
    answer:
      "Olara, Shorecrest, South Flagler House, Ritz-Carlton, NORA House, and Maison d'Or all have credible wellness stories. The difference is texture: Olara is resort-scale wellness; Shorecrest highlights rooftop, spa, and fitness programming; South Flagler House is club-like and expansive; NORA House brings the energy to the rooftop; Maison d'Or is quieter and boutique. Compare not just the amenity list, but when, where, and how often you would use each space.",
    concept: "Wellness amenities",
    relatedProjectIds: ["olara", "shorecrest", "south-flagler-house", "nora-house", "maison-dor"],
    sources: ["official project amenity pages"],
    sourceCitations: [
      {
        label: "Shorecrest official amenities",
        href: "https://www.shorecrestwpb.com/amenities",
        note: "Official source for rooftop pool, spa, fitness, golf simulator, lounges, and services.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Shorecrest wellness program",
        claimText: "Shorecrest has a robust wellness and lifestyle amenity program.",
        confidence: "high",
      },
      {
        label: "South Flagler House amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official source for swim, spa, sport, fitness, food and beverage, business, and social amenities.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "South Flagler House wellness program",
        claimText: "South Flagler House has an expansive private-club amenity program.",
        confidence: "high",
      },
    ],
  },
  {
    id: "private-dining-and-entertaining",
    shortLabel: "Entertaining",
    question: "Which projects stand out for private dining and entertaining?",
    answer:
      "South Flagler House, Shorecrest, Ritz-Carlton, Olara, Maison d'Or, and Mr. C deserve attention. South Flagler House emphasizes restaurant, private dining, lounges, wine and entertainment spaces. Shorecrest includes private dining, cocktail lounge, and rooftop programming. Olara is differentiated by Chef Jose Andres dining. Mr. C is the more urban hospitality choice.",
    concept: "Private dining and entertaining",
    relatedProjectIds: ["south-flagler-house", "shorecrest", "olara", "ritz-carlton-wpb", "mr-c"],
    sources: ["official project sites", "Ritz-Carlton project reporting"],
    sourceCitations: [
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source for Chef Jose Andres dining and resort-style amenities.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Olara dining differentiation",
        claimText: "Olara has a signature dining story tied to Chef Jose Andres.",
        confidence: "high",
      },
      {
        label: "South Flagler House amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official source for restaurant, private dining, wine tasting, lounges, and social amenities.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "South Flagler entertaining spaces",
        claimText: "South Flagler House has extensive dining and entertaining amenities.",
        confidence: "high",
      },
    ],
  },
  {
    id: "boutique-vs-large-scale",
    shortLabel: "Boutique vs scale",
    question: "Is a boutique building better than a larger luxury tower?",
    answer:
      "Boutique is not automatically better; it is more personal, often quieter, and sometimes more limited in amenity breadth. Larger towers can support deeper staffing, bigger amenity decks, guest suites, food and beverage, and more service coverage. Alba and Maison d'Or appeal to buyers who want smaller communities; Olara, South Flagler House, Ritz-Carlton, and Mr. C offer broader programs.",
    concept: "Building scale",
    relatedProjectIds: ["alba-palm-beach", "maison-dor", "olara", "south-flagler-house", "ritz-carlton-wpb"],
    sources: ["official project sites", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Maison d'Or official site",
        href: "https://livemaisondor.com/",
        note: "Official source for 39-residence boutique waterfront positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Maison d'Or boutique scale",
        claimText: "Maison d'Or is positioned as a boutique South Flagler project.",
        confidence: "high",
      },
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source for Olara's 275-residence, resort-style amenity positioning.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Olara larger amenity program",
        claimText: "Olara is a larger waterfront project with extensive amenities.",
        confidence: "high",
      },
    ],
  },
  {
    id: "branded-residences-worth-it",
    shortLabel: "Branded residences",
    question: "Are branded residences worth paying attention to in West Palm Beach?",
    answer:
      "Yes, but the brand should be evaluated as an operating model, not a logo. Ask what services are included, which are a la carte, who staffs the building, what brand standards survive after turnover, and how the association handles licensing. Ritz-Carlton, Mandarin Oriental, Mr. C, and Banyan Tree each imply a different hospitality promise; the contract documents tell you what that promise actually means.",
    concept: "Branded residences",
    relatedProjectIds: ["ritz-carlton-wpb", "mandarin-oriental", "mr-c", "banyan-tree"],
    sources: ["official project sites", "developer legal notices"],
    sourceCitations: [
      {
        label: "Banyan Tree official site",
        href: "https://www.banyantreeresidenceswpb.com/",
        note: "Official source for brand licensing and developer legal notice context.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "brand licensing should be reviewed",
        claimText: "Branded-residence buyers should review licensing and association documents.",
        confidence: "high",
      },
      {
        label: "Ritz-Carlton WPB construction report",
        href: "https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html",
        note: "Reports Ritz-Carlton branded residential development details, staffing, amenities, and team.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "Ritz-Carlton branded positioning",
        claimText: "Ritz-Carlton WPB is a branded residence project with staffed amenities.",
        confidence: "medium",
      },
    ],
  },
  {
    id: "delivery-timeline-risk",
    shortLabel: "Timing risk",
    question: "How should buyers think about construction timelines and delivery risk?",
    answer:
      "Treat delivery dates as planning guidance, not a promise, until the sales team provides current construction status and contract language. Projects under construction are easier to underwrite than early pipeline concepts, but every buyer should confirm milestone status, deposit timing, expected closing windows, walk-through process, and remedies if timing moves.",
    concept: "Construction timing",
    relatedProjectIds: ["alba-palm-beach", "shorecrest", "ritz-carlton-wpb", "south-flagler-house", "mandarin-oriental"],
    sources: ["official project sites", "project reporting", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Ritz-Carlton WPB construction report",
        href: "https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html",
        note: "Construction report with expected completion timing and development team details.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "construction status and timeline context",
        claimText: "Ritz-Carlton WPB is under construction with reported expected completion timing.",
        confidence: "medium",
      },
      {
        label: "Olara official site",
        href: "https://www.olarawestpalmbeach.com/",
        note: "Official source currently states construction is rising at full scale.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Olara construction status context",
        claimText: "Olara's official site reports active construction progress.",
        confidence: "high",
      },
    ],
  },
  {
    id: "pricing-availability-reliability",
    shortLabel: "Pricing",
    question: "How reliable are public prices and availability online?",
    answer:
      "Public prices are useful for orientation, not decision-making. They can lag real inventory, exclude premiums, omit fees, or reflect only selected release phases. Before you compare buildings, ask for the current availability sheet, any buyer incentives, full estimated monthly costs, parking/storage details, and whether the unit line is still contractable.",
    concept: "Pricing and availability",
    relatedProjectIds: ["olara", "maison-dor", "south-flagler-house", "alba-palm-beach"],
    sources: ["official project sites", "developer disclaimers"],
    sourceCitations: [
      {
        label: "Maison d'Or official pricing",
        href: "https://livemaisondor.com/",
        note: "Official source lists current starting guidance while noting pricing, terms, and availability are subject to change.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "pricing can change",
        claimText: "Public pricing should be confirmed before reliance.",
        confidence: "high",
      },
      {
        label: "Banyan Tree legal notice",
        href: "https://www.banyantreeresidenceswpb.com/",
        note: "Official legal notice underscores the importance of formal offering documents.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "formal documents matter",
        claimText: "Buyers should verify pricing and offering details through current documents.",
        confidence: "high",
      },
    ],
  },
  {
    id: "view-corridor-evaluation",
    shortLabel: "Views",
    question: "How should I compare views between West Palm Beach towers?",
    answer:
      "Do not compare views by marketing renderings alone. Ask for stack plans, floor height, exposure, neighboring tower position, balcony depth, sunrise/sunset orientation, and whether a view is protected or simply current. East-facing Intracoastal and Palm Beach views can carry a premium, but the better purchase is the one where the view, floorplan, and daily light all work together.",
    concept: "View and exposure",
    relatedProjectIds: ["ritz-carlton-wpb", "olara", "south-flagler-house", "maison-dor", "nora-house"],
    sources: ["official project sites", "Ritz-Carlton project reporting"],
    sourceCitations: [
      {
        label: "Ritz-Carlton WPB construction report",
        href: "https://floridayimby.com/2026/02/related-group-and-bh-group-break-ground-on-the-ritz-carlton-residences-west-palm-beach.html",
        note: "Reports eastward residence orientation, floor-to-ceiling glazing, and private terraces.",
        sourceType: "reputable project reporting",
        dateAccessed: generatedDate,
        supportsClaim: "view and exposure details",
        claimText: "View orientation and glazing are material comparison factors.",
        confidence: "medium",
      },
      {
        label: "Maison d'Or official residences",
        href: "https://livemaisondor.com/",
        note: "Official source references terraces, flow-through plans, and Intracoastal, ocean, Palm Beach, and skyline views.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "view and terrace comparison",
        claimText: "Maison d'Or markets large terraces and multiple view corridors.",
        confidence: "high",
      },
    ],
  },
  {
    id: "residence-features-that-matter",
    shortLabel: "Residence features",
    question: "Which residence features matter most beyond square footage?",
    answer:
      "Focus on ceiling heights, glass line, terrace depth, elevator entry, kitchen appliance package, closet/storage logic, laundry room quality, smart-home readiness, parking, and how the plan lives when guests are present. A smaller residence with cleaner proportions can feel more valuable than a larger plan with wasted circulation.",
    concept: "Residence features",
    relatedProjectIds: ["mr-c", "ritz-carlton-wpb", "maison-dor", "nora-house"],
    sources: ["official project sites", "Ritz-Carlton project reporting"],
    sourceCitations: [
      {
        label: "Mr. C residences",
        href: "https://www.mrcresidenceswpb.com/residences/",
        note: "Official source for terrace, glass, ceiling, kitchen, appliance, and residence feature details.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "residence feature comparison",
        claimText: "Interior features and plan quality matter beyond headline square footage.",
        confidence: "high",
      },
      {
        label: "Maison d'Or official residences",
        href: "https://livemaisondor.com/",
        note: "Official source for flow-through plans, ceilings, terraces, private elevator access, and appliance packages.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "residence feature comparison",
        claimText: "Maison d'Or lists detailed residence features relevant to plan comparison.",
        confidence: "high",
      },
    ],
  },
  {
    id: "guest-suites-family-amenities",
    shortLabel: "Guests/family",
    question: "Which projects are better for visiting family, guests, or children?",
    answer:
      "Look for guest suites, children's rooms, teen spaces, lounges, theater rooms, pools, and easy parking or valet. South Flagler House has a broad family and social amenity program; Ritz-Carlton reporting references children's rooms and guest suites; NORA House emphasizes guest suites and rooftop entertainment; Shorecrest includes lounges, private dining, coworking, and service support.",
    concept: "Guests and family use",
    relatedProjectIds: ["south-flagler-house", "ritz-carlton-wpb", "nora-house", "shorecrest"],
    sources: ["official project amenity pages", "Ritz-Carlton project reporting"],
    sourceCitations: [
      {
        label: "South Flagler House amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official source for children's recreation, guest suites, theater, lounges, pool, and broad amenity program.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "family and guest amenity depth",
        claimText: "South Flagler House has extensive amenities for residents and guests.",
        confidence: "high",
      },
      {
        label: "NORA House official site",
        href: "https://norahouse.com/",
        note: "Official source references rooftop pools, lounges, game spaces, guest suites, and district lifestyle.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "guest and lifestyle amenities",
        claimText: "NORA House offers rooftop and guest-oriented amenities.",
        confidence: "high",
      },
    ],
  },
  {
    id: "work-from-home-business-spaces",
    shortLabel: "Work spaces",
    question: "Which buildings support work-from-home or private business needs?",
    answer:
      "South Flagler House, Shorecrest, Ritz-Carlton, and Maison d'Or are the first places to study. Look for conference rooms, private offices, coworking lounges, boardrooms, business support, secure Wi-Fi, and the acoustic reality of taking calls outside the residence. Buyers who work from home should tour the work spaces at the same seriousness as the pool deck.",
    concept: "Business amenities",
    relatedProjectIds: ["south-flagler-house", "shorecrest", "ritz-carlton-wpb", "maison-dor"],
    sources: ["official project amenity pages", "Ritz-Carlton project reporting"],
    sourceCitations: [
      {
        label: "Shorecrest official amenities",
        href: "https://www.shorecrestwpb.com/amenities",
        note: "Official source includes coworking lounge, executive meeting space, and business support services.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Shorecrest business amenities",
        claimText: "Shorecrest includes business and coworking spaces.",
        confidence: "high",
      },
      {
        label: "Maison d'Or official amenities",
        href: "https://livemaisondor.com/",
        note: "Official source references a private boardroom and secure Wi-Fi in common areas.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "Maison d'Or business amenities",
        claimText: "Maison d'Or includes business-oriented common spaces.",
        confidence: "high",
      },
    ],
  },
  {
    id: "pet-and-home-management",
    shortLabel: "Home management",
    question: "What ownership services should seasonal buyers ask about?",
    answer:
      "Seasonal buyers should ask about home management, package handling, refrigerated storage, housekeeping, pre-arrival provisioning, dry cleaning, plant care, pet care, maintenance coordination, vendor access, and how service requests are billed. These details can matter as much as the view if the residence will sit empty for long stretches.",
    concept: "Seasonal ownership",
    relatedProjectIds: ["shorecrest", "south-flagler-house", "ritz-carlton-wpb"],
    sources: ["official service and amenity pages"],
    sourceCitations: [
      {
        label: "Shorecrest official amenities",
        href: "https://www.shorecrestwpb.com/amenities",
        note: "Official source lists concierge, resident services, home management, pet care, plant care, and provisioning-style services.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "seasonal ownership services",
        claimText: "Shorecrest markets services relevant to seasonal ownership.",
        confidence: "high",
      },
      {
        label: "South Flagler House amenities",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official source references concierge, home care, customization, and ongoing maintenance support.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "home management services",
        claimText: "South Flagler House markets ongoing home-care support.",
        confidence: "high",
      },
    ],
  },
  {
    id: "what-documents-to-request",
    shortLabel: "Documents",
    question: "What documents should I request before comparing two residences seriously?",
    answer:
      "Ask for the current availability sheet, floorplan with dimensions, site plan, stack plan, finish schedule, estimated budget, rules and restrictions, parking and storage schedule, reservation or contract form, deposit schedule, delivery assumptions, and the developer disclosure package required for Florida condominium buyers.",
    concept: "Buyer documents",
    relatedProjectIds: ["olara", "banyan-tree", "nora-house", "maison-dor"],
    sources: ["developer legal notices", "official project documents"],
    sourceCitations: [
      {
        label: "Banyan Tree legal notice",
        href: "https://www.banyantreeresidenceswpb.com/",
        note: "Official notice references required documents under Florida condominium disclosure rules.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "formal documents should be requested",
        claimText: "Buyers should request and review required condominium documents.",
        confidence: "high",
      },
      {
        label: "NORA House legal notice",
        href: "https://norahouse.com/",
        note: "Official page includes condominium representation and required-document language.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "formal documents should be requested",
        claimText: "Buyers should rely on formal documents rather than broad marketing language.",
        confidence: "high",
      },
    ],
  },
  {
    id: "resale-benchmark-projects",
    shortLabel: "Resale benchmarks",
    question: "Why should new-construction buyers look at delivered buildings too?",
    answer:
      "Delivered buildings reveal what renderings cannot: lobby scale, valet flow, noise, sunlight, maintenance culture, monthly costs, resale liquidity, and how finishes age. Forte and La Clara are useful South Flagler benchmarks, while older waterfront and downtown inventory can help separate real value from launch glamour.",
    concept: "Resale benchmarks",
    relatedProjectIds: ["forte-on-flagler", "la-clara", "south-flagler-house", "maison-dor"],
    sources: ["project-source-catalog", "market comparison review"],
    sourceCitations: [
      {
        label: "Project source catalog",
        href: "https://wpbnewconstruction.com/methodology/",
        note: "Internal methodology page explains how project information is separated from items requiring current confirmation.",
        sourceType: "site methodology",
        dateAccessed: generatedDate,
        supportsClaim: "delivered inventory supports comparison",
        claimText: "Delivered buildings help benchmark new-construction claims.",
        confidence: "medium",
      },
      {
        label: "South Flagler House official site",
        href: "https://www.southflaglerhouse.com/",
        note: "Current South Flagler new-construction benchmark used against delivered corridor inventory.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "South Flagler comparison context",
        claimText: "South Flagler House should be compared against delivered South Flagler product.",
        confidence: "high",
      },
    ],
  },
  {
    id: "pipeline-projects-watch-list",
    shortLabel: "Pipeline",
    question: "Which pipeline projects should buyers keep on the radar without over-relying on them?",
    answer:
      "Mandarin Oriental, Edgeworth, Alba Reserve, Rybovich, Related Ross Fern Street, and Fort Partners South Flagler are worth tracking, but pipeline projects should not anchor a purchase decision until official plans, pricing, timing, and offering documents are released. Use them to understand future supply pressure, not to replace current due diligence.",
    concept: "Pipeline watch list",
    relatedProjectIds: ["mandarin-oriental", "edgeworth-north", "alba-reserve", "rybovich-marina", "related-ross-fern-street"],
    sources: ["official project announcements", "project-source-catalog"],
    sourceCitations: [
      {
        label: "Mandarin Oriental Residences",
        href: "https://www.mandarinoriental.com/en/residences/upcoming/west-palm-beach",
        note: "Official brand page for the upcoming West Palm Beach residences.",
        sourceType: "official brand site",
        dateAccessed: generatedDate,
        supportsClaim: "Mandarin Oriental pipeline status",
        claimText: "Mandarin Oriental belongs on the future branded-residence watch list.",
        confidence: "high",
      },
      {
        label: "WPB methodology",
        href: "https://wpbnewconstruction.com/methodology/",
        note: "Explains why pipeline items are tracked separately from buyer-ready project pages.",
        sourceType: "site methodology",
        dateAccessed: generatedDate,
        supportsClaim: "pipeline caution",
        claimText: "Pipeline projects need current official confirmation before buyer reliance.",
        confidence: "medium",
      },
    ],
  },
  {
    id: "how-to-read-amenity-lists",
    shortLabel: "Amenity lists",
    question: "How should buyers read long amenity lists without getting distracted?",
    answer:
      "Separate amenities into daily use, weekly use, guest use, and resale optics. A 25-meter pool, private dining room, guest suite, package room, and real fitness studio can change ownership. A room you will never use is marketing weight. The best amenity package is the one that fits your actual life and is staffed well enough to remain useful after opening.",
    concept: "Amenity evaluation",
    relatedProjectIds: ["south-flagler-house", "shorecrest", "olara", "ritz-carlton-wpb", "nora-house"],
    sources: ["official amenity pages"],
    sourceCitations: [
      {
        label: "South Flagler House amenity list",
        href: "https://www.southflaglerhouse.com/amenities/",
        note: "Official page shows the breadth of swim, spa, sport, dining, business, children's, and social amenities.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "amenity categories",
        claimText: "Amenities should be categorized by real use case.",
        confidence: "high",
      },
      {
        label: "Shorecrest amenity list",
        href: "https://www.shorecrestwpb.com/amenities",
        note: "Official page shows rooftop, club-level, spa, business, dining, and resident-service amenities.",
        sourceType: "official project site",
        dateAccessed: generatedDate,
        supportsClaim: "amenity categories",
        claimText: "Amenity depth varies by project and service model.",
        confidence: "high",
      },
    ],
  },
  {
    id: "how-to-choose-final-shortlist",
    shortLabel: "Shortlist",
    question: "How do I turn the full West Palm Beach pipeline into a serious shortlist?",
    answer:
      "Pick no more than five projects for the first serious pass: one North Flagler waterfront option, one branded-service option, one Downtown walkability option, one South Flagler option, and one boutique or pipeline wildcard. Then compare the same facts across all five: live inventory, floorplan, view, timing, carrying cost, parking, service model, and exit liquidity.",
    concept: "Shortlist strategy",
    relatedProjectIds: ["olara", "ritz-carlton-wpb", "mr-c", "south-flagler-house", "maison-dor"],
    sources: ["project-source-catalog", "official project sites"],
    sourceCitations: [
      {
        label: "WPB floorplan library",
        href: "https://wpbnewconstruction.com/floorplans/",
        note: "Organized plan library used to compare released floorplan depth by project.",
        sourceType: "site floorplan library",
        dateAccessed: generatedDate,
        supportsClaim: "shortlist comparison method",
        claimText: "A disciplined shortlist should compare the same data points across projects.",
        confidence: "medium",
      },
      {
        label: "WPB methodology",
        href: "https://wpbnewconstruction.com/methodology/",
        note: "Explains source separation and confirmation discipline for buyer guidance.",
        sourceType: "site methodology",
        dateAccessed: generatedDate,
        supportsClaim: "source-limited comparison method",
        claimText: "Buyer guidance should separate official facts from items to confirm.",
        confidence: "medium",
      },
    ],
  },
];

async function main() {
  await fs.mkdir(publicDataRoot, { recursive: true });
  await fs.mkdir(generatedRoot, { recursive: true });
  await fs.mkdir(reviewRoot, { recursive: true });
  await fs.mkdir(preferredRoot, { recursive: true });

  const catalog = JSON.parse(await fs.readFile(reviewPath, "utf8"));
  const assetTracker = await readAssetTracker();
  const publishedFloorplans = await publishFloorplanAssets();
  const floorplans = await buildFloorplanLibrary(catalog.projects);
  const publicFloorplans = stripInternalFloorplanPaths(floorplans);
  const images = await buildImageCatalog(catalog.projects, assetTracker);
  const newsFeed = buildNewsFeed(catalog.projects, floorplans, images);
  const projectFacts = buildProjectFacts(catalog.projects);
  const projectAssetStatus = buildProjectAssetStatus(catalog.projects, floorplans, publishedFloorplans, assetTracker);
  const imageClearanceCandidates = buildImageClearanceCandidates(catalog.projects, images, assetTracker);
  const projectTeamCredits = buildProjectTeamCredits(catalog.projects, assetTracker);

  await fs.writeFile(path.join(publicDataRoot, "site-meta.json"), `${JSON.stringify(siteMeta, null, 2)}\n`);
  await fs.writeFile(path.join(publicDataRoot, "floorplans.json"), `${JSON.stringify(publicFloorplans, null, 2)}\n`);
  await fs.writeFile(path.join(publicDataRoot, "published-floorplan-assets.json"), `${JSON.stringify(publishedFloorplans, null, 2)}\n`);
  await fs.writeFile(path.join(publicDataRoot, "project-asset-status.json"), `${JSON.stringify(projectAssetStatus, null, 2)}\n`);
  await fs.writeFile(
    path.join(publicDataRoot, "image-clearance-candidates.json"),
    `${JSON.stringify(imageClearanceCandidates, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(publicDataRoot, "project-team-credits.json"),
    `${JSON.stringify(projectTeamCredits, null, 2)}\n`,
  );
  await fs.writeFile(path.join(publicDataRoot, "news-feed.json"), `${JSON.stringify(newsFeed, null, 2)}\n`);
  await fs.writeFile(path.join(publicDataRoot, "answer-engine-faq.json"), `${JSON.stringify(answerBlocks, null, 2)}\n`);
  await fs.writeFile(path.join(workspace, "public/feed.json"), `${JSON.stringify(toJsonFeed(newsFeed), null, 2)}\n`);
  await fs.writeFile(path.join(workspace, "public/rss.xml"), renderRss(newsFeed));
  await fs.writeFile(path.join(workspace, "public/llms.txt"), renderLlmsTxt(publicFloorplans, newsFeed));
  await fs.writeFile(path.join(workspace, "public/robots.txt"), renderRobots());
  await fs.writeFile(path.join(workspace, "public/sitemap.xml"), renderSitemap(catalog.projects));
  await fs.writeFile(path.join(reviewRoot, "floorplan-library.md"), renderFloorplanMd(floorplans));
  await fs.writeFile(path.join(reviewRoot, "image-candidate-catalog.md"), renderImageMd(images.catalog));
  await fs.writeFile(path.join(reviewRoot, "image-candidate-catalog.json"), `${JSON.stringify(images.catalog, null, 2)}\n`);
  await fs.writeFile(path.join(reviewRoot, "metadata-answer-engine-plan.md"), renderMetadataPlan(newsFeed));
  await fs.writeFile(path.join(generatedRoot, "siteData.ts"), renderSiteDataTs({ floorplans: publicFloorplans, newsFeed, projectFacts }));

  console.log(
    JSON.stringify(
      {
        floorplanProjects: floorplans.projects.length,
        floorplans: floorplans.projects.reduce((sum, project) => sum + project.plans.length, 0),
        imageProjects: images.catalog.projects.length,
        preferredExports: images.catalog.projects.reduce((sum, project) => sum + project.preferredExports.length, 0),
        newsItems: newsFeed.items.length,
      },
      null,
      2,
    ),
  );
}

function stripInternalFloorplanPaths(floorplans) {
  return {
    ...floorplans,
    projects: floorplans.projects.map((project) => ({
      ...project,
      plans: project.plans.map(({ researchPath, ...plan }) => plan),
    })),
  };
}

function buildProjectFacts(projects) {
  return projects.map((project) => ({
    projectId: project.projectId,
    name: project.name,
    area: project.area,
    pageStatus: project.pageStatus,
    dataConfidence: project.dataConfidence,
    officialWebsite: project.officialWebsite || "",
    facts: {
      address: project.normalizedFacts?.address || "",
      status: project.normalizedFacts?.status || "",
      residences: project.normalizedFacts?.residences || "",
      stories: project.normalizedFacts?.stories || "",
      completion: project.normalizedFacts?.completion || "",
      pricing: project.normalizedFacts?.pricing || "",
      team: project.normalizedFacts?.team || "",
    },
    conflicts: project.conflicts ?? [],
    gaps: project.gaps ?? [],
    highValueSources: project.highValueSources ?? [],
    sourceCounts: project.sourceCounts ?? {},
    sourceBuckets: {
      official: project.sourceBuckets?.official ?? [],
      reporting: project.sourceBuckets?.reporting ?? [],
      other: project.sourceBuckets?.other ?? [],
    },
  }));
}

async function buildFloorplanLibrary(projects) {
  const groups = await Promise.all(
    projects.map(async (project) => {
      const candidateAssets = [
        ...(project.assetBuckets.floorplans ?? []),
        ...(project.assetBuckets.otherPdfs ?? []),
        ...(await localFloorplanAssets(project.projectId)),
      ].filter(isFloorplanAsset);
      const plans = uniqueBy(candidateAssets, (asset) => asset.url || asset.path)
        .filter((asset) => asset.status !== "failed")
        .filter((asset) => asset.url || asset.path)
        .map((asset) => {
          const publicHref = asset.path ? publicHrefForResearchPath(asset.path) : "";
          const externalHref = asset.url || publicHref;
          const title = buyerPlanTitle(cleanTitle(asset.label || path.basename(asset.path || asset.url)));
          return {
            title,
            href: externalHref,
            sourceUrl: asset.url || externalHref,
            researchPath: asset.path ? `research/asset-library/${asset.path}` : "",
            status: externalHref ? "Open floorplan" : "Available by request",
            sourceUse: asset.url ? "official project source" : publicHref ? "canonical public research copy" : "current sales packet",
            note: asset.status || asset.source || "",
          };
        })
        .sort((a, b) => naturalCompare(a.title, b.title));

      return {
        projectId: project.projectId,
        name: project.name,
        area: project.area,
        pageStatus: project.pageStatus,
        updatedAt: new Date().toISOString().slice(0, 10),
        count: plans.length,
        plans,
        missingNote: plans.length
          ? ""
          : "Floorplans are available by request when the current project packet is released or supplied.",
      };
    }),
  );

  return {
    generatedAt: new Date().toISOString(),
    usageNote:
      "Floorplan inventory from project sources and current packet references. Request the latest sales packet for pricing, availability, and line-by-line guidance.",
    projects: groups.filter((project) => project.count || priorityProjects.has(project.projectId)),
  };
}

async function localFloorplanAssets(projectId) {
  const floorplanDir = path.join(projectsRoot, projectId, "floorplans");
  const files = await listFilesIfExists(floorplanDir);
  const deployableFiles = [];
  for (const filePath of files) {
    if (await isDeployablePublicAsset(filePath)) {
      deployableFiles.push(filePath);
    }
  }

  return deployableFiles.map((filePath) => {
    const relativeProjectPath = path.relative(projectsRoot, filePath);
    return {
      label: cleanTitle(path.basename(filePath)),
      path: `projects/${relativeProjectPath}`,
      url: "",
      status: "captured public floorplan/source asset",
      source: "local acquisition pass",
    };
  });
}

async function listFilesIfExists(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) return listFilesIfExists(entryPath);
        if (entry.isFile()) return [entryPath];
        return [];
      }),
    );
    return nested.flat();
  } catch {
    return [];
  }
}

async function publishFloorplanAssets() {
  const records = [];
  const copiedByPublicPath = new Set();
  const projectDirs = await fs.readdir(projectsRoot, { withFileTypes: true });
  for (const entry of projectDirs) {
    if (!entry.isDirectory()) continue;
    const sourceProjectId = entry.name;
    const sourceDir = path.join(projectsRoot, sourceProjectId, "floorplans");
    const files = await listFilesIfExists(sourceDir);
    for (const sourcePath of files) {
      if (!(await isDeployablePublicAsset(sourcePath))) continue;
      const relativeFloorplanPath = path.relative(sourceDir, sourcePath);
      const publicProjectId = publicProjectSlug(sourceProjectId);
      const publicSubdir = publicProjectId === sourceProjectId ? "" : sourceProjectId;
      const canonicalHref = publicHrefForResearchPath(`projects/${sourceProjectId}/floorplans/${relativeFloorplanPath}`);
      const publicRelativePath = canonicalHref
        ? canonicalHref.replace(/^\//, "")
        : path.join("projects", publicProjectId, "docs", "floorplans", publicSubdir, relativeFloorplanPath);
      const publicPath = path.join(workspace, "public", publicRelativePath);
      if (!copiedByPublicPath.has(publicPath)) {
        await fs.mkdir(path.dirname(publicPath), { recursive: true });
        await fs.copyFile(sourcePath, publicPath);
        copiedByPublicPath.add(publicPath);
      }
      records.push({
        sourceProjectId,
        publicProjectId,
        sourcePath: path.relative(workspace, sourcePath),
        publicPath: `/${toUrlPath(publicRelativePath)}`,
        fileName: path.basename(sourcePath),
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    usageNote:
      "Research floorplans are copied to canonical public filenames only. Duplicate source aliases are recorded but not recopied under extra public names.",
    count: records.length,
    records: records.sort((a, b) => naturalCompare(`${a.publicProjectId}/${a.fileName}`, `${b.publicProjectId}/${b.fileName}`)),
  };
}

async function isDeployablePublicAsset(filePath) {
  const stats = await fs.stat(filePath).catch(() => null);
  return Boolean(stats && stats.size < cloudflarePagesSingleFileLimitBytes);
}

async function buildImageCatalog(projects, assetTracker) {
  const catalog = {
    generatedAt: new Date().toISOString(),
    usageNote:
      "Image candidates are organized for production use. Preferred exports are resized working files with concise project-source attribution.",
    projects: [],
  };
  const publicCandidates = {
    generatedAt: catalog.generatedAt,
    usageNote: catalog.usageNote,
    projects: [],
  };

  for (const project of projects) {
    const metadataPath = path.join(projectsRoot, project.projectId, "metadata.json");
    const metadata = await readJsonIfExists(metadataPath);
    const downloadedImages = (metadata?.downloadedAssets ?? []).filter((asset) => asset.kind === "image" && asset.path);
    const candidates = [];

    for (const [index, asset] of downloadedImages.entries()) {
      const researchPath = path.join(workspace, "research/asset-library", asset.path);
      const dimensions = await imageDimensions(researchPath);
      const role = inferImageRole(asset, index);
      candidates.push({
        role,
        label: displayImageLabel(asset, role, project.name),
        projectId: project.projectId,
        projectName: project.name,
        sourceUrl: asset.url || "",
        sourcePage: asset.sourcePage || "",
        researchPath: `research/asset-library/${asset.path}`,
        width: dimensions.width,
        height: dimensions.height,
        orientation: dimensions.width >= dimensions.height ? "landscape" : "portrait",
        clearanceStatus: inferClearanceStatus(project.projectId, asset, assetTracker),
        recommendedUse: recommendedUse(role, dimensions),
      });
    }

    const preferred = candidates
      .filter((candidate) => candidate.clearanceStatus !== "reject current candidate")
      .filter((candidate) => candidate.width && candidate.height)
      .sort((a, b) => imageRoleRank(a.role) - imageRoleRank(b.role) || b.width * b.height - a.width * a.height)
      .slice(0, priorityProjects.has(project.projectId) ? 2 : 1);

    const preferredExports = [];
    for (const candidate of preferred) {
      const exports = await resizePreferred(candidate, project.projectId);
      preferredExports.push(...exports);
    }

    const projectRecord = {
      projectId: project.projectId,
      name: project.name,
      area: project.area,
      candidateCount: candidates.length,
      candidates,
      preferred: preferred.map((candidate) => ({
        role: candidate.role,
        label: candidate.label,
        researchPath: candidate.researchPath,
        sourceUrl: candidate.sourceUrl,
        recommendedUse: candidate.recommendedUse,
        clearanceStatus: candidate.clearanceStatus,
      })),
      preferredExports,
    };

    catalog.projects.push(projectRecord);
    if (preferred.length) {
      publicCandidates.projects.push({
        projectId: project.projectId,
        name: project.name,
        area: project.area,
        preferred: projectRecord.preferred,
        preferredExports,
      });
    }
  }

  return { catalog, publicCandidates };
}

function buildNewsFeed(projects, floorplans, images) {
  const now = new Date().toISOString();
  const topConflicts = projects.filter((project) => project.conflicts?.length).slice(0, 8);
  const topFloorplans = floorplans.projects
    .filter((project) => project.count)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const projectById = new Map(projects.map((project) => [project.projectId, project]));

  return {
    generatedAt: now,
    updatePolicy:
      "Buyer-facing development news feed refreshed from reviewed public material. Publish after human review of titles, facts, and source links.",
    items: [
      {
        id: "shorecrest-construction-loan",
        title: "Shorecrest financing pushes the North Flagler cluster toward construction",
        summary:
          "Related Ross announced a $157 million construction loan for Shorecrest, adding momentum to the North Flagler waterfront cluster.",
        category: "North Flagler",
        datePublished: "2026-02-18",
        dateModified: "2026-05-18",
        projectIds: ["shorecrest", "olara", "ritz-carlton-wpb"],
        sourceName: "Related Ross press release",
        sourceUrl:
          "https://www.relatedross.com/press-releases/2026-02-18/related-ross-secures-157-million-construction-loan-shorecrest-west-palm",
        sourceLinks: [
          {
            label: "Related Ross Shorecrest financing announcement",
            href:
              "https://www.relatedross.com/press-releases/2026-02-18/related-ross-secures-157-million-construction-loan-shorecrest-west-palm",
            sourceType: "developer press release",
          },
          {
            label: "Related Ross Shorecrest property page",
            href: "https://www.relatedross.com/our-company/properties/shorecrest",
            sourceType: "developer property page",
          },
          sourceLinkForProject(projectById.get("shorecrest")),
        ].filter(Boolean),
        rewrittenSummary:
          "Shorecrest is no longer just a future North Flagler comparison point. The financing announcement gives buyers another reason to watch the Olara, Ritz-Carlton, Shorecrest, and Alba cluster as one linked waterfront decision set.",
        image: newsImageForProjects(["shorecrest", "olara", "ritz-carlton-wpb"], images),
        citations: [
          "Related Ross announced a $157 million construction loan for Shorecrest on February 18, 2026.",
          "The live Related Ross Shorecrest property page currently lists 100 units, while the February 18 financing release describes 98 residences.",
        ],
        status: "Reviewed",
      },
      {
        id: "banyan-tree-sales-launch",
        title: "Banyan Tree locks in 88 branded residences at 400 Hibiscus",
        summary:
          "Banyan Group announced the launch of Banyan Tree Residences West Palm Beach, adding another branded-residence option to the downtown buyer map.",
        category: "Downtown",
        datePublished: "2026-03-24",
        dateModified: "2026-05-16",
        projectIds: ["banyan-tree", "mr-c", "nora-house"],
        sourceName: "PR Newswire and official Banyan Tree site",
        sourceUrl:
          "https://www.prnewswire.com/news-releases/banyan-group-enters-the-united-states-with-banyan-tree-residences-west-palm-beach-302723150.html",
        sourceLinks: [
          {
            label: "Banyan Group sales launch announcement",
            href:
              "https://www.prnewswire.com/news-releases/banyan-group-enters-the-united-states-with-banyan-tree-residences-west-palm-beach-302723150.html",
            sourceType: "brand/developer announcement",
          },
          sourceLinkForProject(projectById.get("banyan-tree")),
        ].filter(Boolean),
        rewrittenSummary:
          "The downtown comparison set is getting more brand-driven. Banyan Tree joins Mr. C and NORA House as buyers weigh hotel-style service, walkability, and how much of the premium is tied to the downtown lifestyle story.",
        image: newsImageForProjects(["banyan-tree", "mr-c", "nora-house"], images),
        citations: [
          "Banyan Group announced its U.S. entry through Banyan Tree Residences West Palm Beach on March 24, 2026.",
          "The official project site currently advertises 88 exclusive corner residences and a sales gallery now open at 400 Hibiscus Street.",
        ],
        status: "Reviewed",
      },
      {
        id: "nora-house-district-launch",
        title: "NORA House pairs its district launch with a deeper public plan stack",
        summary:
          "NORA House gives buyers a clearer ownership option inside the fast-changing NORA district rather than only nearby rental, hotel, retail, and restaurant activity.",
        category: "NORA District",
        datePublished: "2026-03-23",
        dateModified: "2026-04-07",
        projectIds: ["nora-house", "banyan-tree", "mr-c"],
        sourceName: "World Red Eye and official NORA House site",
        sourceUrl:
          "https://worldredeye.com/2026/03/wre-news-nora-house-anchors-residential-expansion-in-west-palm-beachs-nora-district/",
        sourceLinks: [
          {
            label: "World Red Eye NORA House district coverage",
            href:
              "https://worldredeye.com/2026/03/wre-news-nora-house-anchors-residential-expansion-in-west-palm-beachs-nora-district/",
            sourceType: "development news coverage",
          },
          {
            label: "NORA House rooftop amenities / roof plan",
            href: "https://norahouse.com/amenities/",
            sourceType: "official project site",
          },
          sourceLinkForProject(projectById.get("nora-house")),
        ].filter(Boolean),
        rewrittenSummary:
          "For buyers who want walkability more than a direct waterfront address, NORA House is the important one to watch. It turns the district conversation into a residential ownership comparison, not just a restaurant and retail story.",
        image: newsImageForProjects(["nora-house", "banyan-tree", "mr-c"], images),
        citations: [
          "World Red Eye reported on March 24, 2026 that NORA House will bring 117 residences and nearly 19,000 square feet of ground-floor commercial space to North Railroad Avenue.",
          "The official NORA House site now exposes residence and terrace plan pages, while address signals still split between a 955 N Railroad sales gallery and a 1021 N Railroad schema address.",
        ],
        status: "Reviewed",
      },
    ],
  };
}

function newsImageForProjects(projectIds, images) {
  const userProvidedNewsImages = new Map([
    [
      "nora-house",
      {
        path: "/projects/nora-house/media/user-provided-nora-house-hero.jpg",
        sourceUrl: "/projects/nora-house/media/user-provided-nora-house-hero.jpg",
        credit: "Source: user-provided NORA House project media",
      },
    ],
    [
      "south-flagler-house",
      {
        path: "/projects/south-flagler-house/media/user-provided-south-flagler-house-hero.jpg",
        sourceUrl: "/projects/south-flagler-house/media/user-provided-south-flagler-house-hero.jpg",
        credit: "Source: user-provided South Flagler House project media",
      },
    ],
    [
      "shorecrest",
      {
        path: "/projects/shorecrest/media/user-provided-shorecrest-hero.jpg",
        sourceUrl: "/projects/shorecrest/media/user-provided-shorecrest-hero.jpg",
        credit: "Source: user-provided Shorecrest project media",
      },
    ],
    [
      "banyan-tree",
      {
        path: "/projects/banyan-tree/media/user-provided-banyan-tree-hero.jpg",
        sourceUrl: "/projects/banyan-tree/media/user-provided-banyan-tree-hero.jpg",
        credit: "Source: user-provided Banyan Tree project media",
      },
    ],
  ]);

  for (const projectId of projectIds) {
    const userProvided = userProvidedNewsImages.get(projectId);
    if (userProvided) return userProvided;

    const projectImages = images.publicCandidates.projects.find((project) => project.projectId === projectId);
    const preferred = projectImages?.preferred?.[0];
    if (preferred?.researchPath) {
      return {
        path: "",
        sourceUrl: preferred.sourceUrl ?? "",
        credit: `Source: ${projectImages.name} original project materials`,
      };
    }
  }
  return {
    path: "/maps/wpb-atlas-map-editorial.svg",
    sourceUrl: "/maps/wpb-atlas-map-editorial.svg",
    credit: "Source: WPB New Construction map",
  };
}

function sourceLinkForProject(project) {
  if (!project) return null;
  return {
    label: project.name,
    href: project.officialWebsite || project.highValueSources?.[0] || "",
    sourceType: project.officialWebsite ? "official project site" : "source material",
  };
}

function buildProjectAssetStatus(projects, floorplans, publishedFloorplans, assetTracker) {
  const floorplanCounts = new Map(floorplans.projects.map((project) => [project.projectId, project.count]));
  const publishedCounts = new Map();
  for (const record of publishedFloorplans.records) {
    publishedCounts.set(record.sourceProjectId, (publishedCounts.get(record.sourceProjectId) ?? 0) + 1);
  }

  return {
    generatedAt: new Date().toISOString(),
    usageNote:
      "Project media and packet tracker for the public site. Image authorization follows the reviewed asset tracker; pending projects must not be treated as publishable without source evidence.",
    projects: projects
      .map((project) => {
        const authorization = imageAuthorizationForProject(project, assetTracker);
        const publicProjectId = publicProjectSlug(project.projectId);
        const routeProjectIds = new Set([
          "olara",
          "ritz-carlton-wpb",
          "shorecrest",
          "mr-c",
          "alba-palm-beach",
          "mandarin-oriental",
          "10-cityplace",
          "15-cityplace",
          "south-flagler-house-north",
          "south-flagler-house-south",
          "nora-house",
        ]);
        return {
          projectId: project.projectId,
          publicProjectId,
          name: project.name,
          area: project.area,
          projectPagePath: routeProjectIds.has(project.projectId) ? `/projects/${publicProjectId}/` : "",
          imageAuthorizationStatus: authorization.status,
          imageUseNote: authorization.note,
          imageSourceCredit: imageSourceCreditForProject(project, authorization),
          floorplanCount: floorplanCounts.get(project.projectId) ?? 0,
          publishedFloorplanAssetCount: publishedCounts.get(project.projectId) ?? 0,
          floorplanPublicFolder: publicFloorplanFolderForProject(project.projectId),
          complianceStatus: "brokerage disclosure present; pricing, availability, and timing require current confirmation",
        };
      })
      .sort((a, b) => naturalCompare(a.name, b.name)),
  };
}

function buildImageClearanceCandidates(projects, images, assetTracker) {
  const imageProjectById = new Map(images.catalog.projects.map((project) => [project.projectId, project]));
  return {
    generatedAt: images.catalog.generatedAt,
    usageNote:
      "Project image candidates grouped by reviewed authorization state. Pending candidates stay internal until explicit clearance is recorded.",
    projects: projects
      .map((project) => {
        const imageProject = imageProjectById.get(project.projectId);
        const authorization = imageAuthorizationForProject(project, assetTracker);
        return {
          projectId: project.projectId,
          name: project.name,
          officialWebsite: project.officialWebsite || "",
          imageAuthorizationStatus: authorization.status,
          imageUseNote: authorization.note,
          imageSourceCredit: imageSourceCreditForProject(project, authorization),
          candidateCount: imageProject?.candidateCount ?? 0,
          preferred: (imageProject?.preferred ?? []).map((candidate) => ({
            ...candidate,
            clearanceStatus: authorization.isAuthorized ? candidate.clearanceStatus : "pending authorization; keep internal",
          })),
        };
      })
      .sort((a, b) => naturalCompare(a.name, b.name)),
  };
}

function buildProjectTeamCredits(projects, assetTracker) {
  return {
    generatedAt: new Date().toISOString(),
    usageNote:
      "Public project credits are derived from reviewed project records. Use these for project/team and original-source attribution blocks.",
    projects: projects
      .map((project) => ({
        projectId: project.projectId,
        name: project.name,
        officialWebsite: project.officialWebsite || "",
        sourceCredit: imageSourceCreditForProject(project, imageAuthorizationForProject(project, assetTracker)),
        teamCredit: project.normalizedFacts?.team ?? "",
        sourceLinks: [sourceLinkForProject(project), ...(project.highValueSources ?? []).slice(0, 3).map(sourceLinkFromHref)].filter((source) => source?.href),
      }))
      .sort((a, b) => naturalCompare(a.name, b.name)),
  };
}

function imageSourceCreditForProject(project, authorization = null) {
  const source = project.officialWebsite || project.highValueSources?.[0] || project.assetBuckets?.images?.find((asset) => asset.url)?.url || "";
  const label = project.name || "project";
  return {
    label: `Source: ${label} original materials`,
    sourceUrl: source,
    note: authorization?.isAuthorized
      ? "User sign-off recorded for site use; no developer or brand endorsement implied."
      : "Rights review pending; do not treat original-source material as publishable until authorization is recorded.",
  };
}

function sourceLinkFromHref(href) {
  try {
    return {
      label: titleDomain(new URL(href).hostname),
      href,
      sourceType: "supporting source",
    };
  } catch {
    return null;
  }
}

function publicConflictNote(note) {
  return String(note)
    .replace(/placeholder text/gi, "source text")
    .replace(/placeholder/gi, "unconfirmed source field");
}

async function readAssetTracker() {
  const trackerPath = path.join(reviewRoot, "wpb-project-asset-tracker.csv");
  const tracker = new Map();
  const csv = await fs.readFile(trackerPath, "utf8").catch(() => "");
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  if (!headerLine) return tracker;

  const headers = parseCsvLine(headerLine);
  const projectIdIndex = headers.indexOf("Project ID");
  const authIndex = headers.indexOf("Image Authorization");
  const noteIndex = headers.indexOf("Image Use Note");
  if (projectIdIndex === -1 || authIndex === -1) return tracker;

  for (const row of rows) {
    const cells = parseCsvLine(row);
    const projectId = normalizeProjectId(cells[projectIdIndex]);
    if (!projectId) continue;
    tracker.set(projectId, {
      status: cells[authIndex] || "pending authorization",
      note: cells[noteIndex] || "",
    });
  }

  return tracker;
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function imageAuthorizationForProject(project, assetTracker) {
  const projectId = normalizeProjectId(project.projectId);
  const tracked = assetTracker.get(projectId);
  const status = tracked?.status || "pending authorization";
  const isAuthorized = /\bauthorized\b/i.test(status) && !/pending|not authorized|unauthorized/i.test(status);
  return {
    status: isAuthorized ? "authorized" : "pending authorization",
    isAuthorized,
    note:
      tracked?.note ||
      (isAuthorized
        ? "User confirmed project image authorization for site use."
        : "Images must stay internal or carry pending-authorization handling until explicit clearance is recorded."),
  };
}

function normalizeProjectId(projectId) {
  return String(projectId ?? "").trim().toLowerCase();
}

async function resizePreferred(candidate, projectId) {
  const source = path.join(workspace, candidate.researchPath);
  const ext = path.extname(source).toLowerCase() || ".jpg";
  const base = slugify(`${candidate.role}-${candidate.label}`) || "preferred";
  const exportDir = path.join(preferredRoot, projectId);
  await fs.mkdir(exportDir, { recursive: true });

  const sizes = [
    { label: "hero", max: 1600 },
    { label: "card", max: 900 },
    { label: "thumb", max: 480 },
  ];
  const exports = [];

  for (const size of sizes) {
    const out = path.join(exportDir, `${base}-${size.label}-${size.max}${ext}`);
    const resized = await resizeWithSips(source, out, size.max);
    exports.push({
      role: candidate.role,
      label: size.label,
      maxDimension: size.max,
      path: path.relative(workspace, resized ? out : source),
      status: resized ? "resized" : "resize skipped; use source",
      clearanceStatus: candidate.clearanceStatus,
    });
  }

  return exports;
}

async function resizeWithSips(source, out, maxDimension) {
  try {
    await execFileAsync("sips", ["-Z", String(maxDimension), source, "--out", out], { maxBuffer: 1024 * 1024 });
    return true;
  } catch {
    return false;
  }
}

async function imageDimensions(filePath) {
  try {
    const { stdout } = await execFileAsync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath]);
    const width = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
    const height = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
    return { width, height };
  } catch {
    return { width: 0, height: 0 };
  }
}

function inferImageRole(asset, index) {
  const text = `${asset.label ?? ""} ${asset.url ?? ""} ${asset.path ?? ""}`.toLowerCase();
  if (/hero|exterior|aerial|building|hummingbird|facade|tower|sunset|front/.test(text)) return "hero";
  if (/pool|amenit|spa|fitness|pickle|rooftop|terrace|club/.test(text)) return "amenity";
  if (/residence|living|kitchen|bath|bedroom|interior/.test(text)) return "residence";
  if (/lobby|arrival|porte|valet/.test(text)) return "arrival";
  if (index === 0) return "hero";
  if (index === 1) return "card";
  return "gallery";
}

function recommendedUse(role, dimensions) {
  if (role === "hero") return dimensions.width >= 1400 ? "hero or project-card lead" : "card/background only";
  if (role === "residence") return "residence gallery and project detail section";
  if (role === "amenity") return "amenity gallery and lifestyle section";
  if (role === "arrival") return "arrival/service section";
  return "gallery/supporting image";
}

function isFloorplanAsset(asset) {
  const text = `${asset.label ?? ""} ${asset.url ?? ""} ${asset.path ?? ""}`.toLowerCase();
  if (/fact.?sheet|factsheet|guide|brochure|flipbook|rack/.test(text) && !/floor.?plan|open-kitchen/.test(text)) {
    return false;
  }
  return /floor.?plan|res\d+|residence|open-kitchen|plan\.pdf/.test(text);
}

function inferClearanceStatus(projectId, asset, assetTracker) {
  const authorization = imageAuthorizationForProject({ projectId }, assetTracker);
  if (authorization.isAuthorized) return "authorized by user sign-off; credit original source materials";
  if (/reject|avoid|blocked/i.test(`${asset.status ?? ""} ${asset.source ?? ""}`)) return "reject current candidate";
  return "pending authorization; keep internal until explicit clearance is recorded";
}

function publicHrefForResearchPath(researchAssetPath) {
  if (!researchAssetPath) return "";
  const filename = path.basename(researchAssetPath).toLowerCase();
  const mappings = [
    ["projects/olara/floorplans/olara-floorplans-digital-31126-a", "/projects/olara/docs/floorplans/olara-residence-plan-a.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-b", "/projects/olara/docs/floorplans/olara-residence-plan-b.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-c", "/projects/olara/docs/floorplans/olara-residence-plan-c.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-d", "/projects/olara/docs/floorplans/olara-residence-plan-d.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-e", "/projects/olara/docs/floorplans/olara-residence-plan-e.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-f", "/projects/olara/docs/floorplans/olara-residence-plan-f.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-g", "/projects/olara/docs/floorplans/olara-residence-plan-g.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-h", "/projects/olara/docs/floorplans/olara-residence-plan-h.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-i", "/projects/olara/docs/floorplans/olara-residence-plan-i.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-j", "/projects/olara/docs/floorplans/olara-residence-plan-j.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-k", "/projects/olara/docs/floorplans/olara-residence-plan-k.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-l", "/projects/olara/docs/floorplans/olara-residence-plan-l.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-m", "/projects/olara/docs/floorplans/olara-residence-plan-m.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-31126-n", "/projects/olara/docs/floorplans/olara-residence-plan-n.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-o", "/projects/olara/docs/floorplans/olara-residence-plan-o.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-p", "/projects/olara/docs/floorplans/olara-residence-plan-p.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-q", "/projects/olara/docs/floorplans/olara-residence-plan-q.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-t", "/projects/olara/docs/floorplans/olara-residence-plan-t.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-u", "/projects/olara/docs/floorplans/olara-residence-plan-u.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-v", "/projects/olara/docs/floorplans/olara-residence-plan-v-401-501.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-w", "/projects/olara/docs/floorplans/olara-residence-plan-w-402-502.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-x", "/projects/olara/docs/floorplans/olara-residence-plan-x-207-307-403-503.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-y-208", "/projects/olara/docs/floorplans/olara-residence-plan-y-208.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-y-308", "/projects/olara/docs/floorplans/olara-residence-plan-y-308-404-504.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-z-209", "/projects/olara/docs/floorplans/olara-residence-plan-z-209.pdf"],
    ["projects/olara/floorplans/olara-floorplans-digital-031126-z-309", "/projects/olara/docs/floorplans/olara-residence-plan-z-309-405-505.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/residence-01", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-residence-01.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/res02", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-residence-02.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/res03", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-residence-03.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/residence-04", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-residence-04.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/residence-05", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-residence-05.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/residence-06", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-residence-06.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/lake-home-07", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-07.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/lake-home-08", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-08.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/lake-home-09", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-09.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/lake-home-10", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-10.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/lake-home-11", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-11.pdf"],
    ["projects/ritz-carlton-wpb/floorplans/res12", "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-12.pdf"],
  ];

  const normalized = researchAssetPath.toLowerCase();
  const match = mappings.find(([needle]) => normalized.includes(needle));
  if (match) return match[1];
  if (filename.startsWith("ritz-lake-home-12-1")) return "/projects/ritz-carlton-wpb/docs/floorplans/ritz-lake-home-12-1.pdf";
  const floorplanMatch = researchAssetPath.match(/^projects\/([^/]+)\/floorplans\/(.+)$/);
  if (floorplanMatch) {
    const [, sourceProjectId, relativeFloorplanPath] = floorplanMatch;
    if (sourceProjectId === "south-flagler-house-north" || sourceProjectId === "south-flagler-house-south") {
      return `/projects/south-flagler-house/docs/floorplans/shared/${toUrlPath(relativeFloorplanPath)}`;
    }
    const publicProjectId = publicProjectSlug(sourceProjectId);
    const publicSubdir = publicProjectId === sourceProjectId ? "" : `${sourceProjectId}/`;
    return `/projects/${publicProjectId}/docs/floorplans/${publicSubdir}${toUrlPath(relativeFloorplanPath)}`;
  }
  return "";
}

function publicProjectSlug(projectId) {
  if (projectId === "south-flagler-house-north" || projectId === "south-flagler-house-south") {
    return "south-flagler-house";
  }
  return projectId;
}

function publicFloorplanFolderForProject(projectId) {
  if (projectId === "south-flagler-house-north" || projectId === "south-flagler-house-south") {
    return "/projects/south-flagler-house/docs/floorplans/shared/";
  }
  return `/projects/${projectId}/docs/floorplans/`;
}

function toUrlPath(filePath) {
  return filePath.split(path.sep).join("/").split("/").map(encodeURIComponent).join("/");
}

function renderSiteDataTs({ floorplans, newsFeed, projectFacts }) {
  return `export const siteMeta = ${JSON.stringify(siteMeta, null, 2)} as const;\n\nexport const floorplanLibrary = ${JSON.stringify(floorplans.projects, null, 2)} as const;\n\nexport const answerEngineFaq = ${JSON.stringify(answerBlocks, null, 2)} as const;\n\nexport const researchNewsFeed = ${JSON.stringify(newsFeed.items, null, 2)} as const;\n\nexport const projectFacts = ${JSON.stringify(projectFacts, null, 2)} as const;\n\nexport const prerenderRoutes = ${JSON.stringify(buildPrerenderRoutes(), null, 2)} as const;\n`;
}

function renderFloorplanMd(floorplans) {
  const lines = [
    "# Floorplan Library",
    "",
    "All currently available floorplan links and research copies found in the harvested sources.",
    "",
  ];
  for (const project of floorplans.projects) {
    lines.push(`## ${project.name}`);
    lines.push("");
    if (!project.plans.length) {
      lines.push(`- ${project.missingNote}`);
      lines.push("");
      continue;
    }
    for (const plan of project.plans) {
      lines.push(`- ${plan.title} | ${plan.status} | ${plan.href || plan.sourceUrl || plan.researchPath}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function renderImageMd(catalog) {
  const lines = [
    "# Image Candidate Catalog",
    "",
    "Preferred candidates are resized into `research/asset-library/preferred-image-exports/` for design work. They are not rights-cleared for production until explicitly approved.",
    "",
  ];
  for (const project of catalog.projects) {
    lines.push(`## ${project.name}`);
    lines.push("");
    if (!project.candidates.length) {
      lines.push("- No downloaded image candidates.");
    } else {
      for (const candidate of project.candidates) {
        lines.push(`- ${candidate.role}: ${candidate.label} (${candidate.width}x${candidate.height}) | ${candidate.researchPath}`);
      }
    }
    if (project.preferredExports.length) {
      lines.push("- Preferred exports:");
      for (const asset of project.preferredExports) {
        lines.push(`  - ${asset.label} ${asset.maxDimension}: ${asset.path}`);
      }
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function renderMetadataPlan(newsFeed) {
  return `# Metadata And Answer Engine Plan

Implemented in this pass:

- Static site metadata in \`public/data/site-meta.json\`.
- FAQ/answer blocks in \`public/data/answer-engine-faq.json\`.
- Floorplan data in \`public/data/floorplans.json\`.
- Internal image candidate catalog in \`research/source-material-review/image-candidate-catalog.json\`.
- News/update feed in \`public/data/news-feed.json\`.
- JSON Feed and RSS exports at \`public/feed.json\` and \`public/rss.xml\`.
- \`llms.txt\`, \`robots.txt\`, and \`sitemap.xml\` for crawler orientation.
- App-ready generated data in \`src/generated/siteData.ts\`.

Recommended refresh task:

- Weekly source refresh against official project pages and trusted reporting.
- Draft new feed titles, modified dates, source links, and conflict notes.
- Require human review before publishing changed copy or new images.

Current feed item count: ${newsFeed.items.length}
`;
}

function renderLlmsTxt(floorplans, newsFeed) {
  const projectLines = floorplans.projects
    .filter((project) => project.count)
    .map((project) => `- ${project.name}: ${project.count} floorplan records`);
  const newsLines = newsFeed.items.map((item) => `- ${item.title}: ${item.summary}`);
  return `# WPB New Construction

West Palm Beach new-construction condo guide with floorplans, corridor comparisons, and advisor-reviewed answers.

## Core Pages

- Home and corridor map: /
- Floorplan library: /floorplans/
- Buyer Q&A: /answers/
- Market updates: /updates/
- Source methodology: /methodology/
- Fair housing: /fair-housing/
- Privacy: /privacy/
- Terms: /terms/

## Floorplan Coverage

${projectLines.join("\n")}

## Current Updates

${newsLines.join("\n")}

## Use Guidance

Prefer cited project pages, official source links, dated Q&A blocks, and advisor verification notes where sources conflict.
`;
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${productionBaseUrl}/sitemap.xml
`;
}

function buildPrerenderRoutes() {
  return [
    {
      path: "/",
      title: siteMeta.title,
      description: siteMeta.description,
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/floorplans/",
      title: "Floorplans | WPB New Construction",
      description: "Released West Palm Beach new-construction condo floorplans organized by project for easier first comparison.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/answers/",
      title: "Buyer Q&A | WPB New Construction",
      description: "Buyer-focused West Palm Beach new-construction condo answers with cited sources and practical next steps.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/updates/",
      title: "Market Updates | WPB New Construction",
      description: "West Palm Beach new-construction market updates translated into practical buyer context.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/methodology/",
      title: "How We Verify | WPB New Construction",
      description: "How WPB New Construction separates official sources, reported details, and items to confirm before relying on project information.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/fair-housing/",
      title: "Fair Housing | WPB New Construction",
      description: "Equal Housing Opportunity and fair housing disclosure for WPB New Construction buyer advisory content.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/privacy/",
      title: "Privacy | WPB New Construction",
      description: "Privacy information for WPB New Construction inquiry forms, Douglas Elliman policy references, and buyer lead handling.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/terms/",
      title: "Terms | WPB New Construction",
      description: "Terms and limitations for WPB New Construction buyer guidance, project information, and advisory content.",
      ogImage: siteMeta.defaultImage,
    },
    {
      path: "/inquire/",
      title: "Inquire | WPB New Construction",
      description: "Request current West Palm Beach new-construction availability, floorplans, pricing guidance, and private advisory context.",
      ogImage: siteMeta.defaultImage,
    },
    ...["olara", "ritz-carlton-wpb", "shorecrest", "mr-c", "alba-palm-beach", "mandarin-oriental", "10-cityplace", "15-cityplace", "south-flagler-house", "nora-house"].map(
      (projectId) => ({
        path: `/projects/${projectId}/`,
        title: `${projectTitle(projectId)} | WPB New Construction`,
        description: "West Palm Beach new-construction project profile with facts, floorplans, source links, and buyer guidance.",
        ogImage: siteMeta.defaultImage,
      }),
    ),
  ];
}

function projectTitle(projectId) {
  return {
    olara: "Olara",
    "ritz-carlton-wpb": "Ritz-Carlton WPB",
    shorecrest: "Shorecrest",
    "mr-c": "Mr. C",
    "alba-palm-beach": "Alba Palm Beach",
    "mandarin-oriental": "Mandarin Oriental Residences",
    "10-cityplace": "10 CityPlace",
    "15-cityplace": "15 CityPlace",
    "south-flagler-house": "South Flagler House",
    "nora-house": "NORA House",
  }[projectId] ?? projectId;
}

function renderSitemap(projects) {
  const today = new Date().toISOString().slice(0, 10);
  const routableProjects = new Set([
    "olara",
    "ritz-carlton-wpb",
    "shorecrest",
    "mr-c",
    "alba-palm-beach",
    "mandarin-oriental",
    "10-cityplace",
    "15-cityplace",
    "south-flagler-house-north",
    "nora-house",
  ]);
  const publicProjectPath = (projectId) =>
    projectId === "south-flagler-house-north" ? "south-flagler-house" : projectId;
  const urls = [
    ["", "1.0"],
    ["floorplans/", "0.9"],
    ["answers/", "0.9"],
    ["updates/", "0.8"],
    ["methodology/", "0.7"],
    ["fair-housing/", "0.6"],
    ["privacy/", "0.5"],
    ["terms/", "0.5"],
    ["inquire/", "0.5"],
    ...projects
      .filter((project) => routableProjects.has(project.projectId))
      .map((project) => [`projects/${publicProjectPath(project.projectId)}/`, "0.8"]),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ([pathPart, priority]) => `  <url>
    <loc>${productionBaseUrl}/${escapeXml(pathPart)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

function toJsonFeed(newsFeed) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: "WPB New Construction Updates",
    home_page_url: productionBaseUrl,
    feed_url: `${productionBaseUrl}/feed.json`,
    items: newsFeed.items.map((item) => ({
      id: item.id,
      url: `${productionBaseUrl}/updates/#${item.id}`,
      title: item.title,
      content_text: item.summary,
      date_published: item.datePublished,
      date_modified: item.dateModified,
      tags: [item.category, ...item.projectIds],
    })),
  };
}

function renderRss(newsFeed) {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>WPB New Construction Updates</title>
    <link>${productionBaseUrl}/</link>
    <description>Project, floorplan, and source updates.</description>
${newsFeed.items
  .map(
    (item) => `    <item>
      <guid>${productionBaseUrl}/updates/#${escapeXml(item.id)}</guid>
      <title>${escapeXml(item.title)}</title>
      <link>${productionBaseUrl}/updates/#${escapeXml(item.id)}</link>
      <description>${escapeXml(item.summary)}</description>
      <pubDate>${new Date(item.datePublished).toUTCString()}</pubDate>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;
}

function cleanTitle(value) {
  return String(value)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/--[a-f0-9]{8}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\bpdf\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayImageLabel(asset, role, projectName) {
  const title = cleanTitle(asset.label || path.basename(asset.path));
  if (/official candidate|user provided|reference image/i.test(title)) {
    return {
      hero: `${projectName} Exterior`,
      card: `${projectName} Preview`,
      residence: `${projectName} Residence`,
      amenity: `${projectName} Amenity`,
      arrival: `${projectName} Arrival`,
      gallery: `${projectName} Gallery`,
    }[role] ?? `${projectName} Gallery`;
  }
  return title;
}

function buyerPlanTitle(title) {
  const olaraMulti = title.match(/Olara Floorplans Digital 031126 ([A-Z]) (.+)$/i);
  if (olaraMulti) return `Residence ${olaraMulti[1].toUpperCase()} ${olaraMulti[2]}`;
  const olara = title.match(/Olara Floorplans Digital (?:031126|31126) ([A-Z])(?: |$)/i);
  if (olara) return `Residence ${olara[1].toUpperCase()}`;
  const mrC = title.match(/Mrcwpb Res(\d+[A-Z]?) Floorplan/i) ?? title.match(/MrCWPB Res(\d+[A-Z]?) FloorPlan/i);
  if (mrC) return `Residence ${mrC[1].toUpperCase()}`;
  if (/Full View/i.test(title)) return "Complete Floorplan Viewer";
  if (/All Floor Plans/i.test(title)) return "Complete Floorplan Collection";
  return title;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function imageRoleRank(role) {
  return { hero: 0, card: 1, residence: 2, amenity: 3, arrival: 4, gallery: 5 }[role] ?? 9;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
