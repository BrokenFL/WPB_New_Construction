export type ExternalNewsItem = {
  id: string;
  title: string;
  slug?: string;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  publishedAt: string;
  sourcePublishedAt?: string;
  fetchedAt: string;
  deck?: string;
  description?: string;
  summary?: string;
  story?: string[];
  bodySections?: { heading: string; body: string }[];
  whyItMatters?: string;
  brookeTake?: string;
  buyerContext?: string;
  newsletterHeadline?: string;
  newsletterBlurb?: string;
  newsletterCta?: string;
  query?: string;
  category: "development" | "construction" | "planning" | "sales" | "financing" | "city" | "press-release" | "general";
  relatedProjectIds: string[];
  relatedCorridorIds: string[];
  corridorLabel?: string;
  imageUrl?: string;
  imagePath?: string;
  resolvedLocalImageId?: string;
  paywallStatus: "free" | "unknown" | "likely-paywalled";
  status: "needs-review" | "published" | "archived" | "duplicate";
  riskLevel?: "low" | "medium" | "high";
};

export const approvedExternalNews: readonly ExternalNewsItem[] = [
  {
    "id": "florida-yimby-mandarin-interiors-2026-05-18",
    "slug": "florida-yimby-mandarin-interiors-2026-05-18",
    "title": "First Interior Renderings Revealed For Mandarin Oriental Residences, West Palm Beach",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/05/first-interior-renderings-revealed-for-mandarin-oriental-residences-west-palm-beach.html",
    "canonicalUrl": "https://floridayimby.com/2026/05/first-interior-renderings-revealed-for-mandarin-oriental-residences-west-palm-beach.html",
    "publishedAt": "2026-05-18",
    "sourcePublishedAt": "2026-05-18",
    "fetchedAt": "2026-05-22",
    "deck": "New interior renderings move Mandarin Oriental Residences from a building-positioning story into the details buyers will compare: arrival sequence, finish tone, branded service cues, and the daily living experience at 5400 North Flagler Drive.",
    "description": "New interior renderings give buyers the first look at the design direction for Mandarin Oriental Residences at 5400 North Flagler Drive, where branded service, finishes, and lifestyle experience are central to the pitch.",
    "summary": "The latest visuals help buyers understand how Mandarin Oriental is trying to separate itself in the North Flagler luxury set, especially against other waterfront and branded-service buildings.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Florida YIMBY reported new interior renderings for Mandarin Oriental Residences, West Palm Beach. The update gives buyers a clearer read on the project's hospitality-driven design language, amenity atmosphere, and finish direction."
      },
      {
        "heading": "Where it fits",
        "body": "The project sits at 5400 North Flagler Drive, in the same broader comparison lane as Olara, Alba, Ritz-Carlton Residences, and other North Flagler waterfront or near-waterfront options."
      },
      {
        "heading": "What to verify",
        "body": "Before ranking it, verify released residence lines, view exposure, current pricing, carrying costs, finish packages, and which branded services are included versus optional."
      }
    ],
    "whyItMatters": "Interior visuals are not a substitute for a sales packet, but they help buyers judge whether Mandarin Oriental belongs on a service-led shortlist or a more view-led North Flagler shortlist.",
    "brookeTake": "Use the renderings as a design signal, then compare the actual plan, exposure, service model, and cost structure against the other active North Flagler options.",
    "buyerContext": "This is most relevant for buyers deciding whether branded hospitality and interior atmosphere should carry as much weight as waterfront position, residence size, or delivery timing.",
    "newsletterHeadline": "Mandarin Oriental releases a clearer interior design signal",
    "newsletterBlurb": "New Mandarin Oriental renderings give buyers a better read on the project's branded-service and interior-design positioning along North Flagler.",
    "newsletterCta": "Compare Mandarin Oriental with North Flagler alternatives",
    "query": "West Palm Beach condo development",
    "category": "development",
    "relatedProjectIds": [
      "mandarin-oriental"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "wflx-nora-house-2026-04-10",
    "slug": "wflx-nora-house-2026-04-10",
    "title": "Empty lots to luxury living: Multimillion-dollar condos coming to West Palm Beach's growing Nora District",
    "sourceName": "WFLX",
    "sourceUrl": "https://www.wflx.com/2026/04/10/empty-lots-luxury-living-multimillion-dollar-condos-coming-west-palm-beachs-growing-nora-district/",
    "canonicalUrl": "https://www.wflx.com/2026/04/10/empty-lots-luxury-living-multimillion-dollar-condos-coming-west-palm-beachs-growing-nora-district/",
    "publishedAt": "2026-04-10",
    "sourcePublishedAt": "2026-04-10",
    "fetchedAt": "2026-05-22",
    "deck": "NORA House is best read as a district bet, not just a single condo launch. The buyer question is whether north downtown's dining, retail, and walkable energy matter more than direct waterfront exposure.",
    "description": "NORA House anchors the broader north downtown shift from underused blocks into a walkable dining, retail, and residential district, giving buyers a non-waterfront option built around neighborhood energy.",
    "summary": "The Nora District story gives buyers a practical downtown alternative to Flagler Drive: less water-view driven, more walkability and neighborhood momentum driven.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "WFLX covered NORA House within the broader transformation of the Nora District north of downtown West Palm Beach, where underused blocks are being repositioned around restaurants, retail, residential density, and daily convenience."
      },
      {
        "heading": "Where it fits",
        "body": "NORA House sits in the downtown/NORA lane rather than the Intracoastal waterfront lane. That changes the comparison set and the lifestyle promise."
      },
      {
        "heading": "What to verify",
        "body": "Buyers should verify released floor plans, parking, noise exposure, pricing, timing, and how the district will phase around the building."
      }
    ],
    "whyItMatters": "NORA House gives buyers a different version of new construction: restaurants, walkability, and district energy instead of direct water views or estate-adjacent privacy.",
    "brookeTake": "Treat Nora as a location thesis. If walkability is the priority, compare it seriously; if quiet waterfront living is the priority, weigh it differently from Flagler Drive.",
    "buyerContext": "This update is especially useful for buyers deciding between a more urban daily routine and the traditional waterfront luxury pitch.",
    "newsletterHeadline": "NORA House sharpens the downtown/NORA buyer thesis",
    "newsletterBlurb": "NORA House gives buyers a walkability-first alternative to Flagler Drive, with the district story becoming as important as the building itself.",
    "newsletterCta": "Compare NORA House with downtown and waterfront options",
    "query": "Downtown West Palm Beach development",
    "category": "development",
    "relatedProjectIds": [
      "nora-house"
    ],
    "relatedCorridorIds": [
      "downtown"
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "florida-yimby-rosewood-proposal-2026-01",
    "slug": "florida-yimby-rosewood-proposal-2026-01",
    "title": "Related Group and BH Group Announce Rosewood Residences, a 27-Story Luxury Tower on N Flagler",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/01/developers-propose-luxury-27-story-for-2001-n-flagler-dr-west-palm-beach-fl.html",
    "canonicalUrl": "https://floridayimby.com/2026/01/developers-propose-luxury-27-story-for-2001-n-flagler-dr-west-palm-beach-fl.html",
    "publishedAt": "2026-01-01",
    "sourcePublishedAt": "2026-01-01",
    "fetchedAt": "2026-05-22",
    "deck": "Rosewood Residences is pipeline context for North Flagler, not the same kind of buyer decision as an actively selling building with released contracts, plans, and near-term inventory.",
    "description": "Related Group and BH Group's Rosewood proposal would add another branded luxury signal to North Flagler if it advances, but buyers should treat it as pipeline context rather than an immediate purchase option.",
    "summary": "The proposal reinforces North Flagler's branded-luxury trajectory, but buyers should keep it in a separate mental bucket from buildings that can be evaluated today.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Florida YIMBY reported that Related Group and BH Group announced Rosewood Residences, a proposed 27-story luxury tower for 2001 North Flagler Drive."
      },
      {
        "heading": "Where it fits",
        "body": "If it advances, Rosewood would add another hospitality-branded signal to North Flagler and influence how buyers think about future supply along the corridor."
      },
      {
        "heading": "What to verify",
        "body": "Confirm entitlement status, timing, released buyer materials, pricing, residence count, and how much of the proposal has moved from concept to buyer-ready detail."
      }
    ],
    "whyItMatters": "Future branded supply can shape a buyer's decision about whether to act now or wait, but early-stage proposals should not be compared the same way as active inventory.",
    "brookeTake": "Keep Rosewood on the radar while comparing it differently from purchasable options like Olara, Ritz-Carlton Residences, Alba, Mandarin Oriental, and other active North Flagler buildings.",
    "buyerContext": "This is most useful for buyers thinking about resale positioning, future branded supply, and whether waiting for a later project is worth the uncertainty.",
    "newsletterHeadline": "Rosewood adds another branded North Flagler signal",
    "newsletterBlurb": "Rosewood Residences points to more branded luxury supply on North Flagler, but buyers should treat it as pipeline context until buyer-ready details are confirmed.",
    "newsletterCta": "Separate future pipeline from active inventory",
    "query": "West Palm Beach development",
    "category": "planning",
    "relatedProjectIds": [
      "rosewood"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "high"
  },
  {
    "id": "florida-yimby-south-flagler-tops-out-2025-11",
    "slug": "florida-yimby-south-flagler-tops-out-2025-11",
    "title": "South Flagler House Tops Out At 1355 South Flagler Drive In West Palm Beach",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2025/11/south-flagler-house-tops-out-at-1355-south-flagler-drive-in-west-palm-beach.html",
    "canonicalUrl": "https://floridayimby.com/2025/11/south-flagler-house-tops-out-at-1355-south-flagler-drive-in-west-palm-beach.html",
    "publishedAt": "2025-11-01",
    "sourcePublishedAt": "2025-11-01",
    "fetchedAt": "2026-05-22",
    "deck": "South Flagler House topping out makes the project more tangible for buyers comparing delivery timing, privacy, scale, and the quieter South Flagler setting against the larger North Flagler cluster.",
    "description": "South Flagler House reaching its topping-out milestone makes the project more tangible in the luxury pipeline for buyers comparing near-term delivery, privacy, scale, and South Flagler positioning.",
    "summary": "A topping-out milestone shifts South Flagler House from concept to a more concrete timing conversation for buyers who want privacy and a South Flagler address.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Florida YIMBY reported that South Flagler House topped out at 1355 South Flagler Drive. Topping out means the structure has reached its intended height, which is a meaningful construction milestone."
      },
      {
        "heading": "Where it fits",
        "body": "South Flagler House sits in a more estate-adjacent, residential-feeling lane than many North Flagler projects. The comparison is as much about privacy and scale as it is about water views."
      },
      {
        "heading": "What to verify",
        "body": "Verify remaining construction timeline, available residences, view corridors, service model, closing expectations, and how the South Flagler setting compares with North Flagler and downtown options."
      }
    ],
    "whyItMatters": "Construction progress can change buyer confidence and timing, especially for buyers who prefer a more tangible project over earlier-stage pipeline concepts.",
    "brookeTake": "Use the milestone to pressure-test timing and fit. South Flagler House should be compared by privacy, residence scale, service model, and delivery confidence, not just headline luxury.",
    "buyerContext": "This update is most relevant for buyers weighing near-term delivery and a calmer South Flagler setting against North Flagler's broader selection.",
    "newsletterHeadline": "South Flagler House becomes more tangible after topping out",
    "newsletterBlurb": "South Flagler House's topping-out milestone gives buyers a more concrete timing signal for a privacy-focused South Flagler option.",
    "newsletterCta": "Compare South Flagler timing and privacy",
    "query": "West Palm Beach new construction",
    "category": "construction",
    "relatedProjectIds": [
      "south-flagler-house"
    ],
    "relatedCorridorIds": [
      "south-flagler"
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  }
] as const;

export const publishedExternalNews = approvedExternalNews.filter((item) => item.status === "published");
