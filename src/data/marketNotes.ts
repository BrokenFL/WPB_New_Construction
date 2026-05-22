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
    id: "active-sales-vs-pipeline-watch",
    status: "published",
    category: "Buyer Education",
    title: "Active Sales vs Pipeline Watch: How to Read the West Palm Beach Condo Market",
    slug: "active-sales-vs-pipeline-watch",
    excerpt:
      "A buyer-friendly way to separate buildings you can underwrite now from pipeline projects that may matter later.",
    buyerThesis:
      "The cleanest West Palm Beach search starts by separating active sales from pipeline watch items. They answer different buyer questions and should not be compared as if they carry the same certainty.",
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
      "Confirm pricing, availability, and delivery timing directly before buyer reliance.",
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
    primaryProjectId: "olara",
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
          "Shorecrest is important because it adds another active North Flagler waterfront option, but buyers should preserve source conflicts and verify residence counts, available lines, pricing guidance, and construction timing before relying on broad summaries.",
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
      "Confirm current Olara and Shorecrest pricing and availability before buyer reliance.",
    ],
    seo: {
      primaryQuery: "Olara vs Shorecrest West Palm Beach",
      secondaryQueries: ["North Flagler waterfront condos", "West Palm Beach waterfront condos"],
      suggestedSlug: "olara-vs-shorecrest-waterfront-buyer-profiles",
      titleTag: "Olara vs Shorecrest | WPB Buyer Notes",
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
    primaryProjectId: "olara",
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
      "Current pricing and incentives must be verified directly before buyer reliance.",
      "Avoid quoting stale public pricing without date and source context.",
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
