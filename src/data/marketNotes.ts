export type MarketNoteStatus = "draft" | "ready-for-review" | "published" | "needs-refresh";

export type MarketNoteSource = {
  label: string;
  href: string;
  sourceType:
    | "city planning material"
    | "development news coverage"
    | "local news coverage"
    | "developer press release"
    | "official project site"
    | "brand/developer announcement";
};

export type MarketNoteSection = {
  heading: string;
  body: string;
  bullets?: string[];
  imageId?: string;
};

export type MarketNote = {
  id: string;
  status: MarketNoteStatus;
  category: string;
  title: string;
  slug: string;
  excerpt: string;
  buyerThesis: string;
  buyerTakeaway: string;
  image?: {
    path: string;
    credit: string;
  };
  imageId?: string;
  primaryProjectId?: string;
  projectIds: string[];
  sourceName: string;
  sourceLinks: MarketNoteSource[];
  datePublished: string;
  dateModified: string;
  sections: MarketNoteSection[];
  ctaText: string;
  factCheckRequired: string[];
  seo: {
    primaryQuery: string;
    secondaryQueries: string[];
    suggestedSlug: string;
    titleTag: string;
    metaDescription: string;
  };
};

const articleCta = "Want help applying this to your search? Request current availability and private comparison notes.";

export const marketNotes = [
  {
    id: "nora-district-downtown-transformation",
    status: "published",
    category: "Buyer Intelligence",
    title: "Why the NORA District Could Reshape Downtown West Palm Beach",
    slug: "nora-district-downtown-transformation",
    excerpt:
      "NORA is more than a restaurant district. Its walkable streets, adaptive reuse, hospitality plans, and housing pipeline could extend Downtown West Palm Beach's center of gravity northward.",
    buyerThesis:
      "NORA matters because it adds a neighborhood layer to the condo conversation. Buyers should evaluate how the district changes daily life, walkability, nearby demand, and construction-phase tradeoffs before treating proximity as an automatic premium.",
    buyerTakeaway:
      "Compare NORA proximity as a lifestyle advantage, then verify the practical details: walking route, construction exposure, parking, phase timing, nearby inventory, and whether the district experience fits how you expect to use downtown.",
    image: {
      path: "/assets/editorial/nora-district-aerial-evening-hero.jpg",
      credit: "User-provided editorial image, optimized for site use.",
    },
    imageId: "nora-district-aerial-evening-hero",
    primaryProjectId: "nora-house",
    projectIds: ["nora-house", "mr-c", "banyan-tree", "olara", "ritz-carlton-wpb"],
    sourceName: "User-provided Buyer Intelligence article brief",
    sourceLinks: [
      {
        label: "NDT Development NORA district overview",
        href: "https://ndtdevelopment.com/west-palm-beach-nora/",
        sourceType: "official project site",
      },
      {
        label: "Florida YIMBY NORA House proposal coverage",
        href: "https://floridayimby.com/2025/08/developers-propose-nora-districts-first-condo-at-1105-n-dixie-highway-west-palm-beach-florida.html",
        sourceType: "development news coverage",
      },
      {
        label: "Palm Beach County Film and Television Commission NORA district overview",
        href: "https://www.pbfilm.com/nora-district",
        sourceType: "local news coverage",
      },
    ],
    datePublished: "2026-06-02",
    dateModified: "2026-06-02",
    sections: [
      {
        heading: "NORA is becoming a district, not a single destination",
        body:
          "Just north of the downtown core, NORA - short for North Railroad Avenue - is turning a former warehouse corridor into a mixed-use district. The plan combines restored industrial buildings with new construction, restaurants, fitness concepts, creative offices, hospitality, rental housing, and a future for-sale condominium. For buyers, the key point is not one opening or one tenant. It is the possibility that downtown's lifestyle map extends northward as the district matures.",
      },
      {
        heading: "Adaptive reuse gives the neighborhood a distinct identity",
        body:
          "NORA's first phase uses older warehouse buildings as an organizing idea rather than clearing the district for a conventional shopping center. That creates a lower-rise street experience with restaurants, offices, landscaping, and public gathering space. Buyers comparing Downtown, North Flagler, and NORA-adjacent homes should ask whether that neighborhood texture matters more than a direct waterfront setting.",
        imageId: "nora-district-main-street-evening",
      },
      {
        heading: "Walkability is the main buyer thesis",
        body:
          "The strongest NORA argument is daily-life convenience. A walkable district can make restaurants, fitness, workspaces, and social activity feel like part of the neighborhood rather than a separate drive. That is a different value proposition from Flagler Drive, where water views, marina context, and Palm Beach proximity often lead the decision. Neither is automatically better. They serve different ownership priorities.",
      },
      {
        heading: "Future phases could add a built-in customer base",
        body:
          "The broader plan adds hospitality and residential density over time, including a boutique hotel, rental housing, office space, retail, and NORA House as the district's first for-sale condominium project. More residents, visitors, and employees could strengthen the district's retail ecosystem. Buyers should still separate what is open now from what remains phased, proposed, or subject to change.",
      },
      {
        heading: "NORA House makes the district relevant to condo buyers",
        body:
          "NORA House is the clearest bridge between the district story and the condo search. It introduces a for-sale ownership option inside the neighborhood rather than simply nearby. That makes it useful to compare with Downtown and waterfront alternatives, but buyers should verify the current sales packet, layouts, pricing, deposit structure, delivery assumptions, and the practical effect of ongoing district construction before relying on early summaries.",
        imageId: "nora-district-entry-evening",
      },
      {
        heading: "Nearby buildings may benefit in different ways",
        body:
          "NORA can matter even for buyers who do not purchase inside the district. Downtown residences may gain another dining and lifestyle anchor. North Flagler buildings may benefit from a stronger nearby amenity base while retaining waterfront positioning. Mr. C and Banyan Tree belong in the broader Downtown comparison, while Olara and Ritz-Carlton remain useful North Flagler contrasts. The right comparison asks how often the buyer expects to use NORA and what tradeoffs they are willing to make for proximity.",
      },
      {
        heading: "What could change the outcome",
        body:
          "District-scale redevelopment carries execution risk. Later phases can move. Tenant mixes can change. Construction can affect traffic, noise, parking, and walkability before the finished vision arrives. Outdoor comfort, shade, seasonal use, and the durability of the retail roster also matter in South Florida. Buyers should value the district as a developing signal, not treat every future phase as guaranteed.",
      },
      {
        heading: "Questions to ask before paying for proximity",
        body:
          "A NORA-adjacent purchase should be evaluated with the same discipline as a building purchase.",
        bullets: [
          "Which NORA phases are open, under construction, approved, or still proposed?",
          "What is the real walking route from the residence to the district?",
          "How could construction affect traffic, noise, views, parking, and daily access?",
          "Which restaurants, offices, hotel components, and residential phases are operating today?",
          "How does the residence compare with Downtown and Flagler alternatives when fees, floor plans, views, and timing are included?",
          "Is the buyer choosing NORA for daily use, future upside, or both?",
        ],
      },
      {
        heading: "The practical buyer move",
        body:
          "Use NORA as a corridor decision, not as a slogan. Visit at different times of day, walk the route from the buildings you are considering, separate delivered conditions from future plans, and compare the neighborhood experience against Downtown core convenience and Flagler waterfront living. The goal is to understand whether NORA improves the way you would actually live in West Palm Beach.",
      },
    ],
    ctaText:
      "The Scott Gordon Group at Douglas Elliman can help buyers compare how NORA, Downtown, North Flagler, and South Flagler differ in lifestyle, timing, walkability, and long-term fit.",
    factCheckRequired: [
      "Verify current NORA district phase status, tenant openings, construction timing, and delivered streetscape conditions before relying on a public summary.",
      "Request the current NORA House buyer packet before relying on early residence counts, pricing, amenity, or delivery guidance.",
      "Treat value appreciation and neighborhood-impact discussion as buyer context, not as a promise of future investment performance.",
    ],
    seo: {
      primaryQuery: "NORA District West Palm Beach",
      secondaryQueries: ["NORA House West Palm Beach", "Downtown West Palm Beach condos", "West Palm Beach walkable neighborhoods"],
      suggestedSlug: "nora-district-downtown-transformation",
      titleTag: "NORA District's Downtown Impact Explained | Buyer Intelligence",
      metaDescription:
        "Discover how West Palm Beach's NORA District could transform downtown walkability, lifestyle, and nearby condo decisions - and what buyers should verify.",
    },
  },
  {
    id: "are-branded-residences-worth-it-west-palm-beach",
    status: "published",
    category: "Buyer Intelligence",
    title: "Are Branded Residences Worth It? What Buyers Should Know Before Paying the Premium",
    slug: "are-branded-residences-worth-it-west-palm-beach",
    excerpt:
      "Branded residences can deliver real service value, but the name alone is not enough. Buyers should understand the operating model, fees, brand agreement, and resale logic before paying the premium.",
    buyerThesis:
      "A branded residence is worth the premium only when the service infrastructure, location, design, governance, and long-term ownership costs work for the buyer independently of the logo.",
    buyerTakeaway:
      "Ask what the brand actually controls, which services are included, how fees are structured, how long the agreement lasts, and whether the residence would still be compelling without the name.",
    image: {
      path: "/assets/editorial/branded-residences-buyer-review-hero.jpg",
      credit: "User-provided editorial image, optimized for site use.",
    },
    imageId: "branded-residences-buyer-review-hero",
    primaryProjectId: "ritz-carlton-wpb",
    projectIds: ["ritz-carlton-wpb", "mr-c", "mandarin-oriental", "banyan-tree", "forte-on-flagler", "alba-palm-beach"],
    sourceName: "User-provided Buyer Intelligence article brief",
    sourceLinks: [],
    datePublished: "2026-06-02",
    dateModified: "2026-06-02",
    sections: [
      {
        heading: "A sector moving into the mainstream",
        body:
          "Branded residences are privately owned condominiums marketed under a hotel, hospitality, designer, or other luxury name. What began as a niche category has grown into a global real-estate segment, with South Florida as one of its most active markets. That matters in West Palm Beach because buyers are no longer choosing between a branded building and a generic alternative. They are comparing different forms of branding, different service promises, and strong independent luxury buildings that may offer a similar daily experience without the same premium.",
      },
      {
        heading: "What the premium is supposed to buy",
        body:
          "The core promise is a more consistent, service-led ownership experience. Depending on the building, that can include concierge and front-of-house staffing, valet, security, package handling, housekeeping, maintenance, dining, spa services, fitness programming, owner privileges, digital service platforms, and curated design standards. The useful question is not whether the amenity list sounds impressive. It is which services are included in monthly costs, which are a la carte, and how often the buyer will use them.",
        imageId: "branded-residences-ritz-carlton-exterior",
      },
      {
        heading: "West Palm Beach now offers several branded interpretations",
        body:
          "The local comparison is becoming more nuanced. Ritz-Carlton Residences brings a hospitality-service frame and owner benefits. Mr. C Residences leans into Cipriani-linked service, dining, and a members-club atmosphere. Mandarin Oriental Residences presents a standalone branded-residence model with resort-style amenities and a strong wellness component. Banyan Tree Residences emphasizes sanctuary, privacy, and restorative living. These projects should not be treated as interchangeable simply because each carries a recognizable name.",
      },
      {
        heading: "Brand management, brand licensing, and brand-like luxury are different",
        body:
          "A buyer should identify the operating structure before comparing premiums. A hotel-managed residence may apply a hospitality operator's staffing and service culture directly to the building. A licensed brand association may provide standards, design guidance, and oversight while day-to-day operations sit elsewhere. Independent luxury buildings can still offer concierge service, thoughtful amenities, and polished ownership without paying for a global badge. Forte on Flagler and Alba Palm Beach are useful non-branded comparisons when a buyer wants to separate service value from name recognition.",
      },
      {
        heading: "Pricing premiums are a starting point, not a conclusion",
        body:
          "Industry research commonly reports a premium for branded residences over comparable non-branded homes, with urban benchmarks often discussed around the 30 percent range. That does not mean every branded condominium deserves the same uplift. The premium should be tested against location, floor plan, terrace usability, view protection, construction quality, reserves, governance, carrying costs, and the depth of future supply. A recognizable brand can support marketing and resale visibility, but it cannot repair a weak residence line or an ownership structure that does not fit the buyer.",
        imageId: "branded-residences-ritz-carlton-arrival",
      },
      {
        heading: "HOA fees and service charges deserve close attention",
        body:
          "Branded residences often carry higher monthly costs because hotel-style staffing, security, valet, maintenance, and programming must be funded. Buyers should request a complete operating-cost breakdown and separate included services from optional services. Full-time residents may place a high value on daily convenience. Part-time owners may appreciate lock-and-leave ease but should still ask whether they are paying for amenities they will seldom use.",
      },
      {
        heading: "The brand agreement is part of the diligence",
        body:
          "Brand participation is contractual. Management and licensing agreements can expire, change, or fail to renew. Buyers should ask how long the agreement lasts, who controls renewal, what standards the operator must maintain, and what happens to naming rights if the relationship ends. Resale value should be underwritten using the real estate fundamentals as well as the brand halo.",
      },
      {
        heading: "Who may benefit most",
        body:
          "Branded residences can make sense for globally mobile buyers, time-poor professionals, families seeking service integration, part-time owners who value security and maintenance, and buyers drawn to a particular lifestyle philosophy such as wellness or hospitality. Buyers who prefer extensive customization, already have household staff, or do not value brand-driven experiences may find equal or better value in an independent building.",
      },
      {
        heading: "A practical branded-residence checklist",
        body:
          "Before paying a premium, compare the brand promise with the documents, budget, and operating structure.",
        bullets: [
          "Verify the brand-agreement length, termination provisions, and renewal rights.",
          "Clarify whether the property is hotel-operated, licensed, or independently managed.",
          "Review the HOA budget, reserves, insurance, staffing assumptions, and brand-related fees.",
          "Confirm which amenities are residents-only and whether hotel guests or the public share access.",
          "Separate services included in monthly dues from a la carte services and ask for pricing.",
          "Evaluate construction quality and the developer, contractor, and operator track records.",
          "Review rental rules, resale restrictions, design limitations, and renovation standards.",
          "Compare competing branded and non-branded buildings by price per square foot and monthly cost.",
          "Request current buyer materials and calculate long-term ownership costs before relying on marketing.",
        ],
      },
      {
        heading: "When the premium makes sense - and when to be careful",
        body:
          "The premium is easier to justify when the service quality is genuinely useful, the brand has residential operating experience, the site and floor plans are strong independently of the name, and the ongoing costs match the buyer's lifestyle. Be more careful when brand involvement is shallow, service charges are disproportionate, the management agreement is fragile, construction is still early, or nearby supply makes the resale story less distinctive.",
      },
    ],
    ctaText:
      "The Scott Gordon Group at Douglas Elliman helps buyers compare branded and non-branded West Palm Beach residences with a clear view of what they are actually paying for.",
    factCheckRequired: [
      "Request the current offering documents, HOA budget, service schedule, and brand-agreement details before relying on a public summary.",
      "Verify current amenities, services, fees, availability, pricing, delivery timing, and operating structure directly for each project.",
      "Treat industry premium benchmarks as market context, not as a valuation conclusion for any individual residence.",
    ],
    seo: {
      primaryQuery: "are branded residences worth it",
      secondaryQueries: ["West Palm Beach branded residences", "branded residence premium", "Ritz-Carlton Residences West Palm Beach"],
      suggestedSlug: "are-branded-residences-worth-it-west-palm-beach",
      titleTag: "Are Branded Residences Worth It? West Palm Beach Guide",
      metaDescription:
        "Discover how branded residences work, what services they include, and whether the premium is justified in West Palm Beach's growing luxury market.",
    },
  },
  {
    id: "active-sales-vs-pipeline-watch",
    status: "published",
    category: "Buyer Education",
    title: "Active Sales vs Pipeline Watch: How to Read the West Palm Beach Condo Market",
    slug: "active-sales-vs-pipeline-watch",
    excerpt:
      "A buyer-friendly way to separate buildings you can underwrite now from pipeline projects that may matter later.",
    buyerThesis:
      "The cleanest West Palm Beach search starts by separating active sales from early-stage projects to monitor. They answer different buyer questions and should not be compared as if they carry the same certainty.",
    buyerTakeaway:
      "Use active-sales projects for current decisions, and use pipeline projects to understand future supply pressure. Do not treat early-stage concepts as current purchase options until pricing, plans, timing, and buyer packets are available.",
    imageId: "wpb-geography-map-hero",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "nora-house", "banyan-tree", "rosewood"],
    sourceName: "WPB New Construction source review",
    sourceLinks: [
      {
        label: "WPB New Construction updates",
        href: "/updates/",
        sourceType: "development news coverage",
      },
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "Why the distinction matters",
        body:
          "Active-sales buildings give a buyer something practical to verify: available lines, floor plans, deposits, delivery assumptions, parking, fees, and contract language. Pipeline projects are useful, but mostly as context. They can explain where supply may be headed, which corridors are attracting capital, and why a current building may or may not hold pricing power.",
      },
      {
        heading: "What belongs in the active-sales bucket",
        body:
          "A building belongs in the active-sales bucket when a buyer can request current availability, review plan depth, and compare the project against real timing and contract questions. Olara, Ritz-Carlton, Shorecrest, South Flagler House, Mr. C, Alba, and similar public-sales projects should still be verified, but they offer more decision-grade material than early concepts.",
      },
      {
        heading: "What belongs in the pipeline-watch bucket",
        body:
          "Pipeline-watch projects can include planning-stage branded residences, district redevelopment items, office or mixed-use catalysts, and sites with limited public detail. They matter because they shape the buyer map, not because they can be compared line by line today.",
      },
      {
        heading: "The practical buyer move",
        body:
          "Built for comparison, not brochure fog. Start with what can actually be verified now, then use the pipeline to understand where the corridor may be in two to four years. That keeps you from chasing concepts when a current building may already solve the search.",
      },
    ],
    ctaText: articleCta,
    factCheckRequired: [
      "Refresh current active-sales and planning status before treating a project as decision-grade.",
      "Confirm pricing, availability, and delivery timing directly before making a decision.",
    ],
    seo: {
      primaryQuery: "West Palm Beach new construction condos",
      secondaryQueries: ["West Palm Beach pre-construction condos", "Downtown West Palm Beach condos"],
      suggestedSlug: "active-sales-vs-pipeline-watch",
      titleTag: "Active Sales vs Pipeline Watch | WPB New Construction",
      metaDescription:
        "How West Palm Beach condo buyers can separate active sales from pipeline watch projects before comparing pricing, floor plans, and timing.",
    },
  },
  {
    id: "olara-vs-shorecrest",
    status: "published",
    category: "Building Comparisons",
    title: "Olara vs Shorecrest: Two Different Waterfront Buyer Profiles",
    slug: "olara-vs-shorecrest-waterfront-buyer-profiles",
    excerpt:
      "Both sit in the North Flagler waterfront conversation, but they should not be evaluated as interchangeable tower choices.",
    buyerThesis:
      "Olara and Shorecrest both belong in the North Flagler comparison set, but the buyer profile is different. The better shortlist asks what kind of waterfront ownership you want before treating price or delivery as the only filter.",
    buyerTakeaway:
      "Ask for current availability, floor-plan depth, view-stack context, amenity details, and delivery assumptions for both. The decision is not simply which tower is newer or closer; it is which operating model fits the way you want to live.",
    imageId: "flagler-waterfront-corridor",
    primaryProjectId: "shorecrest",
    projectIds: ["olara", "shorecrest", "ritz-carlton-wpb"],
    sourceName: "Reviewed project materials and public updates",
    sourceLinks: [
      {
        label: "Market updates",
        href: "/updates/",
        sourceType: "development news coverage",
      },
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "The shared North Flagler frame",
        body:
          "Both buildings sit inside the same waterfront conversation: Intracoastal exposure, Palm Beach proximity, large amenity programs, and a growing cluster of luxury condominium inventory. That shared context is useful, but it can hide the real buyer questions.",
      },
      {
        heading: "Olara tends to reward amenity-depth buyers",
        body:
          "Olara is useful for buyers who want a deeper public packet, a large amenity story, marina context, and more material to compare before touring. That does not make it automatically better; it means the diligence path can start with more visible pieces.",
      },
      {
        heading: "Shorecrest needs careful current verification",
        body:
          "Shorecrest is important because it adds another active North Flagler waterfront option, but buyers should preserve details to verify and verify residence counts, available lines, pricing guidance, and construction timing before relying on broad summaries.",
      },
      {
        heading: "How to compare without getting lost",
        body:
          "Compare the same facts across both buildings: available lines, floor height, view exposure, terrace usability, fees, parking, storage, amenity access, deposit structure, and delivery risk. Anything else is brochure fog.",
      },
    ],
    ctaText: articleCta,
    factCheckRequired: [
      "Confirm current Shorecrest residence count and construction status before publication updates.",
      "Confirm current Olara and Shorecrest pricing and availability before making a decision.",
    ],
    seo: {
      primaryQuery: "Olara vs Shorecrest West Palm Beach",
      secondaryQueries: ["North Flagler waterfront condos", "West Palm Beach waterfront condos"],
      suggestedSlug: "olara-vs-shorecrest-waterfront-buyer-profiles",
      titleTag: "Olara vs Shorecrest | WPB Guidance",
      metaDescription:
        "Buyer-focused comparison notes for Olara and Shorecrest on North Flagler, including floor plans, timing, amenities, and verification steps.",
    },
  },
  {
    id: "why-published-floor-plans-matter",
    status: "published",
    category: "Floor Plan Notes",
    title: "Why Published Floor Plans Matter Before You Tour",
    slug: "why-published-floor-plans-matter",
    excerpt:
      "Floor plans are not just pretty PDFs. They tell you whether a building can solve your life before you spend time in a presentation room.",
    buyerThesis:
      "Published floor plans let a buyer compare function before emotion takes over. They reveal the difference between real fit and marketing momentum.",
    buyerTakeaway:
      "Before touring, ask for current floor plans, stack plans, dimensions, terrace depth, exposure, ceiling heights where available, and any line-specific limitations.",
    primaryProjectId: "mr-c",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house"],
    sourceName: "WPB New Construction floor-plan library",
    sourceLinks: [
      {
        label: "Floor plan library",
        href: "/floorplans/",
        sourceType: "official project site",
      },
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "Plans expose the daily-life problem",
        body:
          "A residence can photograph beautifully and still fail the basic living test. Floor plans show entry sequence, kitchen relationship, bedroom separation, storage, terrace access, den usefulness, and whether the primary rooms actually face the view you care about.",
      },
      {
        heading: "Released plans create a fair comparison",
        body:
          "When one building has dozens of released plans and another requires a private packet, that does not automatically decide the search. It does tell you where diligence is easier and where Brooke should request more current material before you tour.",
      },
      {
        heading: "The missing piece is the stack plan",
        body:
          "A floor plan shows layout; a stack plan shows position. Buyers need both. The same plan can feel different by floor, exposure, neighboring tower position, balcony depth, and future view risk.",
      },
      {
        heading: "Use plans to shorten the tour list",
        body:
          "The best use of a plan library is not endless browsing. It is removing bad fits early, then asking for current availability only on the lines that actually support the buyer's life.",
      },
    ],
    ctaText: articleCta,
    factCheckRequired: [
      "Confirm current floor-plan packet availability for each building.",
      "Do not imply a public plan is currently available for purchase without availability confirmation.",
    ],
    seo: {
      primaryQuery: "West Palm Beach condo floor plans",
      secondaryQueries: ["West Palm Beach new construction floor plans", "condo stack plans West Palm Beach"],
      suggestedSlug: "why-published-floor-plans-matter",
      titleTag: "Why Published Floor Plans Matter | WPB",
      metaDescription:
        "Why West Palm Beach condo buyers should review floor plans and stack plans before touring new-construction condos.",
    },
  },
  {
    id: "verify-new-construction-pricing",
    status: "published",
    category: "Buyer Education",
    title: "What Buyers Should Verify Before Trusting New Construction Pricing",
    slug: "what-buyers-should-verify-before-trusting-pricing",
    excerpt:
      "Published price ranges are only the opening frame. The useful number is line-specific, date-specific, and tied to real terms.",
    buyerThesis:
      "New-construction pricing changes too quickly to treat public ranges as a decision. A serious comparison verifies the actual line, floor, exposure, incentives, fees, and contract assumptions.",
    buyerTakeaway:
      "Use public pricing as a signal, not a promise. Ask Brooke to verify the current sheet before comparing buildings or scheduling tours around old numbers.",
    primaryProjectId: "ritz-carlton-wpb",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "mr-c", "south-flagler-house"],
    sourceName: "WPB New Construction pricing review method",
    sourceLinks: [
      {
        label: "How we verify",
        href: "/methodology/",
        sourceType: "city planning material",
      },
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "A range is not an offer",
        body:
          "A public 'from' price can help you understand the entry point, but it rarely tells you the residence line, floor, exposure, parking, deposit schedule, upgrade assumptions, or whether the relevant unit is still available.",
      },
      {
        heading: "Incentives can change the real comparison",
        body:
          "Two buildings with similar public pricing can behave differently once incentives, closing credits, deposit timing, decorator allowances, parking, storage, and maintenance assumptions enter the conversation. Those details need current written confirmation.",
      },
      {
        heading: "Delivery timing has economic value",
        body:
          "A 2027 delivery and a later pipeline project do not carry the same risk profile. Buyers should compare timing, walk-through process, financing assumptions, and what happens if construction or closing windows move.",
      },
      {
        heading: "The verification checklist",
        body:
          "Ask for current availability, line-specific pricing, floor plan, stack plan, fees, parking, storage, incentives, deposit schedule, cancellation language, delivery assumptions, and the required condominium disclosure package.",
      },
    ],
    ctaText: articleCta,
    factCheckRequired: [
      "Current pricing and incentives must be verified directly before making a decision.",
      "Avoid quoting older public pricing without date and source context.",
    ],
    seo: {
      primaryQuery: "West Palm Beach condo availability",
      secondaryQueries: ["West Palm Beach condo pricing", "West Palm Beach new construction condos"],
      suggestedSlug: "what-buyers-should-verify-before-trusting-pricing",
      titleTag: "Verify New Construction Pricing | WPB",
      metaDescription:
        "A practical buyer checklist for verifying West Palm Beach new-construction condo pricing, incentives, fees, delivery, and availability.",
    },
  },
  {
    id: "downtown-condo-corridors-explained",
    status: "published",
    category: "Neighborhood Guides",
    title: "Downtown West Palm Beach Condo Corridors Explained",
    slug: "downtown-west-palm-beach-condo-corridors-explained",
    excerpt:
      "Downtown is not one single market. North Flagler, the core, The Square/Rosemary, and NORA each answer a different lifestyle question.",
    buyerThesis:
      "The downtown West Palm Beach condo search gets clearer when you pick the corridor first. Each area has a different rhythm, buyer profile, and diligence path.",
    buyerTakeaway:
      "Decide whether your first priority is waterfront calm, walkable restaurants, retail/dining energy, or growth-district upside. Then compare buildings inside that lane before jumping citywide.",
    imageId: "kravis-center-downtown-attraction",
    projectIds: ["nora-house", "mr-c", "banyan-tree", "10-cityplace", "15-cityplace", "olara"],
    sourceName: "WPB New Construction corridor review",
    sourceLinks: [
      {
        label: "Market map",
        href: "/#atlas",
        sourceType: "development news coverage",
      },
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "North Flagler is the waterfront decision set",
        body:
          "North Flagler is where buyers compare Intracoastal exposure, Palm Beach views across the water, amenity scale, marina context, and newer waterfront inventory. It is not the same lifestyle as being in the downtown restaurant core.",
      },
      {
        heading: "Downtown core is the walkability decision",
        body:
          "The core is about restaurants, offices, Brightline access, cultural venues, hotels, and daily convenience. Buyers here should ask how often they want to use a car and whether energy matters more than a quieter waterfront arrival.",
      },
      {
        heading: "The Square and Rosemary are lifestyle connectors",
        body:
          "The Square and Rosemary corridor connect dining, retail, hotel, office, and residential demand. They can be useful for buyers who want polished walkability but still need to understand how nearby development affects daily life.",
      },
      {
        heading: "NORA is the growth corridor",
        body:
          "NORA is more about trajectory. It brings adaptive reuse, dining, retail, and new residential energy into a district that is still forming. Buyers should verify timing, parking, exposure, and how construction-phase friction may affect ownership.",
      },
    ],
    ctaText: articleCta,
    factCheckRequired: [
      "Refresh district project status and construction impacts before relying on corridor guidance.",
      "Do not imply any specific current availability without buyer-packet confirmation.",
    ],
    seo: {
      primaryQuery: "Downtown West Palm Beach condos",
      secondaryQueries: ["West Palm Beach condo corridors", "NORA District condos", "North Flagler condos"],
      suggestedSlug: "downtown-west-palm-beach-condo-corridors-explained",
      titleTag: "Downtown WPB Condo Corridors Explained",
      metaDescription:
        "A buyer guide to Downtown West Palm Beach condo corridors, including North Flagler, the core, The Square/Rosemary, and NORA.",
    },
  },
] as const satisfies readonly MarketNote[];
