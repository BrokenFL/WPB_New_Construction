export type MarketNoteStatus = "draft" | "ready-for-review" | "published" | "needs-refresh" | "archived";

export type MarketNoteSource = {
  label: string;
  href: string;
  sourceType:
    | "city planning material"
    | "development news coverage"
    | "local news coverage"
    | "developer press release"
    | "official project site"
    | "brand/developer announcement"
    | "official legal source"
    | "financing guideline"
    | "economic development source"
    | "market report";
};

export type MarketNoteSection = {
  heading: string;
  body: string;
  bullets?: string[];
  imageId?: string;
  image?: string;
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
  marketSignal?: string;
  bestFor?: string;
  watchPoints?: string;
  buyerQuestions?: string;
  relatedBuildings?: string[];
  relatedNeighborhoods?: string[];
  relatedCorridor?: string;
  relatedArticleIds?: string[];
  image?: {
    path: string;
    credit: string;
    alt?: string;
    caption?: string;
    mode?: "approved-local" | "generated-editorial" | "provided-editorial";
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

export const marketNotes = [
  {
    "id": "nora-house-turns-the-district-into-a-buyer-decision",
    "status": "published",
    "category": "general",
    "title": "NORA House turns the district into a buyer decision",
    "slug": "nora-house-turns-the-district-into-a-buyer-decision",
    "excerpt": "The district is open, the sales gallery is active, and the condo entry point starts in the low $2 millions. Buyers now have to decide whether walkable district living is worth the construction timeline.",
    "buyerThesis": "Useful for buyers comparing downtown-adjacent walkability against waterfront towers, and for anyone trying to decide whether district momentum is enough to justify a 2029 delivery window.",
    "buyerTakeaway": "NORA House only works if you want the neighborhood experience as much as the residence itself. If the goal is water frontage, keep looking.",
    "marketSignal": "Open district businesses, an active sales gallery, and double-digit reservations suggest NORA is selling a lived-in neighborhood story, not just a future tower.",
    "bestFor": "Buyers who want walkability, neighborhood energy, and a downtown-adjacent address more than Intracoastal views.",
    "watchPoints": "Verify current floor plans, line-by-line pricing, parking and storage, deposit timing, amenity delivery, and whether the 2029 timeline fits your use case.",
    "buyerQuestions": "Which lines make the most sense for daily use? How much of the price is district access versus the unit itself? Can you live with construction and phasing for the next few years?",
    "relatedBuildings": [
      "Nora House",
      "The Nora Hotel"
    ],
    "relatedNeighborhoods": [
      "NORA District",
      "Downtown West Palm Beach"
    ],
    "relatedCorridor": "downtown",
    "relatedArticleIds": [
      "nora-district-downtown-transformation"
    ],
    "image": {
      "path": "/projects/nora-house/media/user-provided-nora-house-hero.jpg",
      "alt": "NORA House exterior rendering in West Palm Beach.",
      "caption": "NORA House is the first for-sale condominium in the NORA District.",
      "credit": "Courtesy of NORA House",
      "mode": "approved-local"
    },
    "primaryProjectId": "",
    "projectIds": [],
    "sourceName": "NORA House",
    "sourceLinks": [
      {
        "label": "NORA House official website",
        "href": "https://norahouse.com/",
        "sourceType": "official project site"
      },
      {
        "label": "NORA West Palm official district page",
        "href": "https://norawpb.com/",
        "sourceType": "official project site"
      },
      {
        "label": "WPTV: Multimillion-dollar condos coming to NORA District",
        "href": "https://www.wptv.com/news/region-c-palm-beach-county/west-palm-beach/empty-lots-to-luxury-living-multimillion-dollar-condos-coming-to-west-palm-beachs-growing-nora-district",
        "sourceType": "local news coverage"
      },
      {
        "label": "Florida Condo Finder: Buying at Nora House preconstruction",
        "href": "https://www.floridacondofinder.com/blog/buying-nora-house-preconstruction-process-west-palm-beach-2026/",
        "sourceType": "market report"
      }
    ],
    "datePublished": "2026-08-23",
    "dateModified": "2026-08-23",
    "sections": [
      {
        "heading": "What changed",
        "body": "NORA House is no longer a concept hiding inside a district map. The district now has open tenants, the sales gallery is live, and the first for-sale condo building is being sold as a real ownership choice rather than a future idea. That changes the buyer conversation.\n\nThe question is not whether NORA exists. It does. The NORA homepage lists a long run of businesses already open, from Del Mar and Loco Taco & Oyster Bar to H&H Bagels, Van Leeuwen, Warby Parker, Le Labo, and other daily-use tenants. Nora House sits inside that environment, which means the purchase decision is about living in a functioning district, not betting on a blank block."
      },
      {
        "heading": "What buyers are actually buying",
        "body": "The official Nora House site gives the price floor and the format. Residences are listed from the low $2 millions, with two- to four-bedroom homes and a sales gallery at 955 N Railroad Avenue, Suite B. WPTV’s reporting from the district launch added the more specific buyer detail: 117 condos, two to four bedrooms, two pools, a fitness center, a spa, a bowling alley, a golf simulator, and two pickleball courts. WPTV also quoted pricing in the high $1 millions up to about $5 million or $6 million, with reservations already in double digits.\n\nThat is the real shift. NORA House is not being sold as a solitary tower on the edge of downtown. It is being sold as the residential anchor inside a district that is already trying to behave like a neighborhood. For a buyer, that can be a strong trade. It gives you restaurants, retail, wellness, and public life at street level rather than a drive away. It also gives you something harder to price: the feeling that the address belongs to a place with a rhythm."
      },
      {
        "heading": "Why the district matters",
        "body": "The district context is the point. NORA is already functioning as a destination with open dining, wellness, shopping, and service tenants. That matters because buyers are not just comparing square footage. They are comparing the daily life around the square footage.\n\nA district that already has people walking, eating, and lingering is different from a tower surrounded by future renderings. It changes how the building feels on move-in day, but it also changes how you should think about the premium. In a place like NORA, the value question is as much about neighborhood texture as it is about the residence itself.",
        "image": "/projects/nora-house/media/nora-street.webp"
      },
      {
        "heading": "The timing tradeoff",
        "body": "The tradeoff is timing. WPTV said groundbreaking is expected next year and completion is not expected until 2029. That means buyers are underwriting a district that will keep changing around them. Today’s open tenants are only part of the story. More hotel, office, and residential phases are still coming.\n\nThat can be a positive if you want to buy into momentum early. It is less attractive if you want a finished neighborhood and a finished building now. The buyer has to decide whether the upside of district formation is worth the wait."
      },
      {
        "heading": "What to watch next",
        "body": "The useful next step is practical. Ask for the current packet, the available stacks, the fee schedule, parking and storage, and the delivery assumptions. Then visit the district at different times of day.\n\n- Which lines make the most sense for daily use?\n- How much of the price is district access versus the unit itself?\n- Can you live with construction and phasing for the next few years?\n- Does this work as a full-time home, or only as an occasional stay?\n\nIf you want a neighborhood to feel alive on a Tuesday and a Saturday night, NORA House has a real argument. If your first priority is open water and a finished tower, this is the wrong comparison set."
      }
    ],
    "ctaText": "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    "factCheckRequired": [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    "seo": {
      "primaryQuery": "NORA House turns the district into a buyer decision",
      "secondaryQueries": [],
      "suggestedSlug": "nora-house-turns-the-district-into-a-buyer-decision",
      "titleTag": "NORA House turns the district into a buyer decision | Buyer Intelligence",
      "metaDescription": "NORA House gives West Palm Beach buyers a real district-to-district choice: live inside an open, walkable neighborhood now, or keep waiting for a waterfront tower later."
    }
  },

  {
    "id": "nora-house-turns-the-district-into-a-buyer-decision",
    "status": "published",
    "category": "general",
    "title": "NORA House turns the district into a buyer decision",
    "slug": "nora-house-turns-the-district-into-a-buyer-decision",
    "excerpt": "The district is open, the sales gallery is active, and the condo entry point starts in the low $2 millions. Buyers now have to decide whether walkable district living is worth the construction timeline.",
    "buyerThesis": "Useful for buyers comparing downtown-adjacent walkability against waterfront towers, and for anyone trying to decide whether district momentum is enough to justify a 2029 delivery window.",
    "buyerTakeaway": "NORA House only works if you want the neighborhood experience as much as the residence itself. If the goal is water frontage, keep looking.",
    "marketSignal": "Open district businesses, an active sales gallery, and double-digit reservations suggest NORA is selling a lived-in neighborhood story, not just a future tower.",
    "bestFor": "Buyers who want walkability, neighborhood energy, and a downtown-adjacent address more than Intracoastal views.",
    "watchPoints": "Verify current floor plans, line-by-line pricing, parking and storage, deposit timing, amenity delivery, and whether the 2029 timeline fits your use case.",
    "buyerQuestions": "Which lines make the most sense for daily use? How much of the price is district access versus the unit itself? Can you live with construction and phasing for the next few years?",
    "relatedBuildings": [
      "Nora House",
      "The Nora Hotel"
    ],
    "relatedNeighborhoods": [
      "NORA District",
      "Downtown West Palm Beach"
    ],
    "relatedCorridor": "downtown",
    "relatedArticleIds": [
      "nora-district-downtown-transformation"
    ],
    "image": {
      "path": "/projects/nora-house/media/user-provided-nora-house-hero.jpg",
      "alt": "NORA House exterior rendering in West Palm Beach.",
      "caption": "NORA House is the first for-sale condominium in the NORA District.",
      "credit": "Courtesy of NORA House",
      "mode": "approved-local"
    },
    "primaryProjectId": "",
    "projectIds": [],
    "sourceName": "NORA House",
    "sourceLinks": [
      {
        "label": "NORA House official website",
        "href": "https://norahouse.com/",
        "sourceType": "official project site"
      },
      {
        "label": "NORA West Palm official district page",
        "href": "https://norawpb.com/",
        "sourceType": "official project site"
      },
      {
        "label": "WPTV: Multimillion-dollar condos coming to NORA District",
        "href": "https://www.wptv.com/news/region-c-palm-beach-county/west-palm-beach/empty-lots-to-luxury-living-multimillion-dollar-condos-coming-to-west-palm-beachs-growing-nora-district",
        "sourceType": "local news coverage"
      },
      {
        "label": "Florida Condo Finder: Buying at Nora House preconstruction",
        "href": "https://www.floridacondofinder.com/blog/buying-nora-house-preconstruction-process-west-palm-beach-2026/",
        "sourceType": "market report"
      }
    ],
    "datePublished": "2026-08-23",
    "dateModified": "2026-08-23",
    "sections": [
      {
        "heading": "What changed",
        "body": "NORA House is no longer a concept hiding inside a district map. The district now has open tenants, the sales gallery is live, and the first for-sale condo building is being sold as a real ownership choice rather than a future idea. That changes the buyer conversation.\n\nThe question is not whether NORA exists. It does. The NORA homepage lists a long run of businesses already open, from Del Mar and Loco Taco & Oyster Bar to H&H Bagels, Van Leeuwen, Warby Parker, Le Labo, and other daily-use tenants. Nora House sits inside that environment, which means the purchase decision is about living in a functioning district, not betting on a blank block."
      },
      {
        "heading": "What buyers are actually buying",
        "body": "The official Nora House site gives the price floor and the format. Residences are listed from the low $2 millions, with two- to four-bedroom homes and a sales gallery at 955 N Railroad Avenue, Suite B. WPTV’s reporting from the district launch added the more specific buyer detail: 117 condos, two to four bedrooms, two pools, a fitness center, a spa, a bowling alley, a golf simulator, and two pickleball courts. WPTV also quoted pricing in the high $1 millions up to about $5 million or $6 million, with reservations already in double digits.\n\nThat is the real shift. NORA House is not being sold as a solitary tower on the edge of downtown. It is being sold as the residential anchor inside a district that is already trying to behave like a neighborhood. For a buyer, that can be a strong trade. It gives you restaurants, retail, wellness, and public life at street level rather than a drive away. It also gives you something harder to price: the feeling that the address belongs to a place with a rhythm."
      },
      {
        "heading": "Why the district matters",
        "body": "The district context is the point. NORA is already functioning as a destination with open dining, wellness, shopping, and service tenants. That matters because buyers are not just comparing square footage. They are comparing the daily life around the square footage.\n\nA district that already has people walking, eating, and lingering is different from a tower surrounded by future renderings. It changes how the building feels on move-in day, but it also changes how you should think about the premium. In a place like NORA, the value question is as much about neighborhood texture as it is about the residence itself.",
        "image": "/projects/nora-house/media/nora-street.webp"
      },
      {
        "heading": "The timing tradeoff",
        "body": "The tradeoff is timing. WPTV said groundbreaking is expected next year and completion is not expected until 2029. That means buyers are underwriting a district that will keep changing around them. Today’s open tenants are only part of the story. More hotel, office, and residential phases are still coming.\n\nThat can be a positive if you want to buy into momentum early. It is less attractive if you want a finished neighborhood and a finished building now. The buyer has to decide whether the upside of district formation is worth the wait."
      },
      {
        "heading": "What to watch next",
        "body": "The useful next step is practical. Ask for the current packet, the available stacks, the fee schedule, parking and storage, and the delivery assumptions. Then visit the district at different times of day.\n\n- Which lines make the most sense for daily use?\n- How much of the price is district access versus the unit itself?\n- Can you live with construction and phasing for the next few years?\n- Does this work as a full-time home, or only as an occasional stay?\n\nIf you want a neighborhood to feel alive on a Tuesday and a Saturday night, NORA House has a real argument. If your first priority is open water and a finished tower, this is the wrong comparison set."
      }
    ],
    "ctaText": "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    "factCheckRequired": [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    "seo": {
      "primaryQuery": "NORA House turns the district into a buyer decision",
      "secondaryQueries": [],
      "suggestedSlug": "nora-house-turns-the-district-into-a-buyer-decision",
      "titleTag": "NORA House turns the district into a buyer decision | Buyer Intelligence",
      "metaDescription": "NORA House gives West Palm Beach buyers a real district-to-district choice: live inside an open, walkable neighborhood now, or keep waiting for a waterfront tower later."
    }
  },

  {
    "id": "alba-s-finish-changes-the-north-flagler-buyer-test",
    "status": "published",
    "category": "general",
    "title": "Alba's finish changes the North Flagler buyer test",
    "slug": "alba-s-finish-changes-the-north-flagler-buyer-test",
    "excerpt": "The 55-unit tower is complete, 95% sold, and welcoming residents while West Palm Beach still shows 106 active new-construction listings citywide.",
    "buyerThesis": "Alba's completion turns North Flagler into a certainty-versus-optionality decision: one finished waterfront building is nearly sold out while the broader new-construction shelf still has room to compare.",
    "buyerTakeaway": "Treat Alba as a certainty trade, not a discount play. The useful comparison is not just price per foot; it is whether a finished waterfront building is more valuable to you than waiting for future inventory.",
    "marketSignal": "The official project page says Alba is complete and 95% sold, the independent coverage says move-ins are underway, and a current West Palm Beach new-construction directory still shows 106 active listings with a 270-day average DOM and a $4.5985 million median list price.",
    "bestFor": "End users and second-home buyers who want immediate occupancy, boutique scale, and North Flagler water access.",
    "watchPoints": "Confirm the remaining lines, current entry pricing, monthly dues, parking and storage, insurance, and whether the last homes still match your view and timing requirements.",
    "buyerQuestions": "Which lines remain available? What is the actual monthly carrying cost? Does the remaining inventory still include the view exposure I want? How does this finished option compare with waiting for Olara, Shorecrest, or The Berkeley?",
    "relatedBuildings": [
      "alba-palm-beach",
      "olara-condos",
      "shorecrest",
      "the-berkeley-palm-beach",
      "the-ritz-carlton-residences-west-palm-beach"
    ],
    "relatedNeighborhoods": [
      "north-flagler"
    ],
    "relatedCorridor": "north-flagler",
    "relatedArticleIds": [
      "pre-construction-condo-due-diligence",
      "olara-vs-shorecrest-waterfront-buyer-profiles"
    ],
    "image": {
      "path": "/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp",
      "alt": "Wide aerial view of Alba Palm Beach on the North Flagler waterfront",
      "caption": "Alba Palm Beach on North Flagler Drive, where the tower is now complete and welcoming residents.",
      "credit": "Approved local project image",
      "mode": "approved-local"
    },
    "primaryProjectId": "",
    "projectIds": [],
    "sourceName": "ALBA Palm Beach",
    "sourceLinks": [
      {
        "label": "ALBA Palm Beach completion announcement",
        "href": "https://www.albapalmbeach.com/press/alba-palm-beach-completed-along-west-palm-beachs-billionaires-corridor-waterfront-at-95-sold",
        "sourceType": "official project site"
      },
      {
        "label": "Florida YIMBY: New Photos Showcase Completed Alba Palm Beach",
        "href": "https://floridayimby.com/2026/06/new-photos-showcase-completed-alba-palm-beach-at-4714-n-flagler-drive-in-west-palm-beach.html",
        "sourceType": "local news coverage"
      },
      {
        "label": "West Palm Beach New Construction Condos For Sale",
        "href": "https://www.floridacondofinder.com/west-palm-beach/west-palm-beach-new-construction-condos-for-sale/",
        "sourceType": "market report"
      }
    ],
    "datePublished": "2026-08-23",
    "dateModified": "2026-08-23",
    "sections": [
      {
        "heading": "What changed",
        "body": "Alba Palm Beach is no longer just a sales story. The 22-story waterfront tower at 4714 N. Flagler Drive is complete, move-ins are underway, and the project is reporting that it is 95% sold. That shifts Alba from a future delivery question to a finished-product question.\n\nThe tower has 55 residences, more than 25,000 square feet of amenities, and a remaining entry point starting around $2.5 million. On North Flagler, that matters. Buyers are now looking at a real building, not a promise on paper.",
        "image": "/assets/projects/alba-palm-beach/residences/alba-residences-living-room-v01.webp"
      },
      {
        "heading": "What the numbers say",
        "body": "The official Alba page says the building is complete and nearly sold out. Independent coverage says the same thing and adds that residents are already moving in. That is a strong signal in a corridor where many of the biggest names are still working through construction or future-supply timing.\n\nThe broader West Palm Beach new-construction shelf is still open. One current directory shows 106 active listings citywide, a 270-day average DOM, and a $4.5985 million median list price. The market is not starved for choice. What is scarcer is completed waterfront inventory that buyers can inspect and occupy now."
      },
      {
        "heading": "Why this matters on North Flagler",
        "body": "North Flagler is becoming a split-screen market. On one side are completed or nearly completed buildings. On the other are towers still in the pipeline, with pricing, delivery timing, and line selection that can still move. Alba gives buyers a different kind of decision: certainty now versus optionality later.\n\nThat difference is not cosmetic. A finished building lets a buyer judge the actual arrival experience, the feel of the lobby, the quality of the amenities, and the real water exposure instead of relying on renderings. If a buyer wants to live here immediately, Alba now competes on lived reality rather than projected vision."
      },
      {
        "heading": "Who this fits",
        "body": "This is the cleanest fit for end users and second-home buyers who want North Flagler water access, boutique scale, and no delivery risk. It is also useful for buyers who care more about certainty than bargain hunting. The completed building is a practical answer for someone who wants to use the residence now and does not need to speculate on a future turn.\n\nIt is less useful for buyers whose main goal is leverage. If the priority is to maximize negotiating room, customize around an unfinished packet, or wait for a later release, the unfinished market remains the place to look. Alba is for the buyer who wants a finished address, not a future one."
      },
      {
        "heading": "What to ask next",
        "body": "Before treating Alba as a simple headline sale, ask which lines are still available, what the monthly carrying cost looks like, and how parking, storage, and insurance work on the remaining homes. Then compare the remaining inventory line by line against the waterfront and downtown options still in play.\n\nThe right comparison set is not just Alba. It is Alba against Olara, Shorecrest, The Berkeley, and South Flagler House, depending on whether you want immediate occupancy, larger scale, or future pipeline. The useful question is not whether North Flagler is hot. It is whether a finished building now fits your life better than waiting for a tower that is still coming."
      }
    ],
    "ctaText": "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    "factCheckRequired": [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    "seo": {
      "primaryQuery": "Alba's finish changes the North Flagler buyer test",
      "secondaryQueries": [],
      "suggestedSlug": "alba-s-finish-changes-the-north-flagler-buyer-test",
      "titleTag": "Alba's finish changes the North Flagler buyer test | Buyer Intelligence",
      "metaDescription": "Alba Palm Beach is complete, 95% sold, and welcoming residents on North Flagler, giving buyers a live example of delivered waterfront inventory while West Palm Beach still shows a broad new-construction shelf."
    }
  },

  {
    "id": "wpb-content-scout-safe-daily-publish-west-palm-move-2026-08-18",
    "status": "published",
    "category": "Downtown Spotlight",
    "title": "West Palm Move is about to change downtown's daily rhythm",
    "slug": "west-palm-move-downtown-mobility",
    "excerpt": "West Palm Beach's new mobility service will replace RideWPB with a faster fixed-route and on-demand system that reaches from the Norton Museum to Northwood Village.",
    "buyerThesis": "For downtown buyers, the signal is practical: walkability gets stronger when the city makes it easier to move between the core, Northwood Village and the Norton corridor without a car. That does not replace a good parking plan, but it does make the day-to-day livability argument harder to ignore.",
    "buyerTakeaway": "For downtown buyers, the signal is practical: walkability gets stronger when the city makes it easier to move between the core, Northwood Village and the Norton corridor without a car. That does not replace a good parking plan, but it does make the day-to-day livability argument harder to ignore.",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "image": {
      "path": "/assets/editorial/west-palm-move-downtown-mobility-hero.jpg",
      "alt": "An electric shuttle moving through a palm-lined downtown street at dusk.",
      "caption": "West Palm Move would give downtown a more frequent, lower-friction way to get around.",
      "credit": "AI-generated editorial illustration",
      "mode": "provided-editorial"
    },
    "primaryProjectId": "",
    "projectIds": [],
    "sourceName": "City of West Palm Beach",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach: West Palm Move",
        "href": "https://www.wpb.org/Departments/Parking-Mobility-Administration/West-Palm-Move",
        "sourceType": "official project site"
      },
      {
        "label": "City of West Palm Beach: West Palm Move briefing PDF",
        "href": "https://www.wpb.org/files/assets/city/v/1/parking-amp-mobility/documents/wpb-move-aug2026-briefing.pdf",
        "sourceType": "official project site"
      },
      {
        "label": "WPTV: All-electric rides to replace West Palm Beach shuttles",
        "href": "https://www.wptv.com/news/local-news/our-community/west-palm-beach/west-palm-beach-is-replacing-its-ride-wpb-vans-with-an-all-electric-on-demand-transit-system",
        "sourceType": "local news coverage"
      }
    ],
    "datePublished": "2026-08-18",
    "dateModified": "2026-08-18",
    "sections": [
      {
        "heading": "What changed",
        "body": "West Palm Beach has put West Palm Move in public view. The city's mobility page now says the service is coming soon, and the briefing materials lay out a first-year system built around a frequent fixed route plus on-demand microtransit. That is the real shift: the city is moving away from the old RideWPB van setup and toward a service that is meant to feel more like part of downtown's daily routine.\n\nThe idea is not subtle. The city wants a service that manages congestion, improves access to downtown destinations and reduces the pressure to keep building more parking. That is a transit goal, but it is also a downtown-life goal."
      },
      {
        "heading": "How it works",
        "body": "The briefing shows a north-south fixed route running every 10 minutes from the Norton Museum to Northwood Village, with service set for 6 a.m. to 9 p.m. on weekdays, 8 a.m. to 9 p.m. on Saturdays and 8 a.m. to 8 p.m. on Sundays. The microtransit layer is designed to cover about 15 square miles of the city with an average wait of roughly 15 minutes and service from 6 a.m. to 10 p.m.\n\nThe fare structure matters too. The city is presenting this as a low-friction ride option, with $1 fixed-route trips and $2 microtransit rides. That keeps the service closer to an everyday utility than a special-purpose shuttle."
      },
      {
        "heading": "Why downtown feels it first",
        "body": "This kind of service changes the way a district gets used. It makes it easier to move between CityPlace, Clematis, the museum corridor and the north end without rearranging the whole evening around parking. It also makes downtown less dependent on a single car trip at the start and end of the night.\n\nThat is important in a city where the strongest places are no longer just the ones with the biggest buildings. They are the ones that can absorb work, dinner, errands and a late stop without making every movement feel like a decision. West Palm Move is meant to grease those seams."
      },
      {
        "heading": "What this changes for residents",
        "body": "For people living downtown, the question is not whether a shuttle exists. It is whether the shuttle becomes part of the rhythm of the day. If the service is frequent, reliable and easy to use, it becomes a reason to leave the car parked more often and to treat downtown as a real walk-and-ride district instead of a place you drive into and out of.\n\nThat matters for people comparing condo buildings, rentals and neighborhoods. Parking still counts. So do commute patterns, evening habits and whether a resident can get to dinner, the museum or Northwood Village without overthinking the trip. West Palm Move strengthens that argument."
      },
      {
        "heading": "What to watch next",
        "body": "The launch timing is the next checkpoint. WPTV reported that the city expected the new service to begin in August, and the city now says West Palm Move is coming soon. Once the service is live, the practical test will be simple: does it feel faster, more reliable and easier to use than the old setup?\n\nIf it does, downtown gets a cleaner mobility story to go with its growing dining and development map. If it does not, the service still matters because it shows where the city wants the district to go: less friction, more access and a downtown that works a little more like a neighborhood."
      }
    ],
    "ctaText": "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    "factCheckRequired": [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    "seo": {
      "primaryQuery": "West Palm Move is about to change downtown's daily rhythm",
      "secondaryQueries": [],
      "suggestedSlug": "west-palm-move-downtown-mobility",
      "titleTag": "West Palm Move is about to change downtown's daily rhythm | Downtown Spotlight",
      "metaDescription": "West Palm Move is the city's new mobility layer for downtown West Palm Beach, pairing a 10-minute fixed route with on-demand rides and a wider service zone."
    }
  },

  {
    "id": "mr-c-shows-downtown-branded-condos-still-move",
    "status": "published",
    "category": "general",
    "title": "Mr. C shows downtown branded condos still move",
    "slug": "mr-c-shows-downtown-branded-condos-still-move",
    "excerpt": "Construction is advancing on the Lakeview Avenue tower, and recent coverage says the project is already more than 85% sold. For buyers weighing downtown walkability against Flagler waterfront pricing, that is the useful signal.",
    "buyerThesis": "Construction is advancing on the Lakeview Avenue tower, and recent coverage says the project is already more than 85% sold. For buyers weighing downtown walkability against Flagler waterfront pricing, that is the useful signal.",
    "buyerTakeaway": "Mr. C is a current downtown test case: branded service and walkability still clear when the product is specific, but buyers should compare it against waterfront towers on price, views, and carrying cost.",
    "marketSignal": "A tower that is still under construction and already more than 85% sold suggests downtown branded residences still have depth when the location and service package are clear.",
    "bestFor": "Buyers who want downtown walkability, hotel-style service, and a branded residence without paying for a pure waterfront address.",
    "watchPoints": "Confirm current availability, stack-specific views, monthly dues, parking terms, deposit milestones, and whether any homes are sold furnished or turnkey.",
    "buyerQuestions": "Which remaining stacks have the best light and skyline angles? What are the HOA dues and parking rules? How does the deposit schedule line up with financing and delivery timing?",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Downtown West Palm Beach"
    ],
    "relatedCorridor": "downtown",
    "relatedArticleIds": [],
    "image": {
      "path": "/assets/projects/mr-c/hero/mr-c-hero-exterior-entrance-v01.webp",
      "alt": "Mr. C Hotel & Residences West Palm Beach rendering of the exterior entrance",
      "caption": "Mr. C Hotel & Residences West Palm Beach at 320 Lakeview Avenue.",
      "credit": "Courtesy of Mr. C Residences West Palm Beach",
      "mode": "approved-local"
    },
    "primaryProjectId": "mr-c",
    "projectIds": [
      "mr-c"
    ],
    "sourceName": "Mr. C Residences West Palm Beach",
    "sourceLinks": [
      {
        "label": "Official project site",
        "href": "https://www.mrcresidenceswpb.com/",
        "sourceType": "official project site"
      },
      {
        "label": "Terra project page",
        "href": "https://terragroup.com/projects/mr-c-residences-west-palm-beach",
        "sourceType": "official project site"
      },
      {
        "label": "Florida YIMBY construction update",
        "href": "https://floridayimby.com/2026/08/construction-progresses-on-27-story-mr-c-hotel-residences-west-palm-beach.html",
        "sourceType": "local news coverage"
      },
      {
        "label": "Traded sales update",
        "href": "https://traded.co/blog/construction-progresses-on-mr-c-hotel-residences-west-palm-beach/",
        "sourceType": "local news coverage"
      }
    ],
    "datePublished": "2026-08-12",
    "dateModified": "2026-08-12",
    "sections": [
      {
        "heading": "What changed",
        "body": "Mr. C on Lakeview Avenue is the kind of project that tells you something real about downtown demand. It is still under construction, and the sales pace is not behaving like a sleepy launch. Recent project coverage says the tower is already more than 85% sold.\n\nThe building at 320 Lakeview Avenue is no longer just a sales story. The tower is visibly rising, with construction moving on the podium and upper floors at the same time. That matters because it turns a branded-residence pitch into something buyers can see from the street."
      },
      {
        "heading": "Why this matters",
        "body": "Mr. C is not trying to win on pure waterfront frontage. It wins on a different set of buyer priorities: hotel-style service, a downtown address, and everyday access to restaurants, offices, cultural stops, and the bridge to Palm Beach. In West Palm Beach, that is a distinct lane.\n\nThe official project materials still frame it as a 27-story branded tower with 146 residences and 110 hotel suites. That mix keeps it in the branded-luxury conversation, but the actual buyer question is narrower than the branding. Do you want a walkable downtown building with service and a hospitality identity, or do you want to pay more for a water-first address on Flagler? Mr. C gives buyers a current data point for the first option."
      },
      {
        "heading": "What is actually new",
        "body": "The useful part of this story is not the brand name alone. It is the combination of sales pace and visible progress. When a tower is still under construction and still moving inventory at a high clip, buyers are seeing proof that the market will absorb branded downtown product when the location feels practical and the pitch is clear.\n\nThat is a different signal from a headline about another luxury tower simply being announced. Here, the project is deep enough into the cycle that buyers are making decisions against a live building, not a concept board."
      },
      {
        "heading": "What to verify before acting",
        "body": "The headline number does not tell you whether a specific unit works. Buyers should still ask for the current availability grid, stack-by-stack view lines, monthly dues, parking terms, deposit schedule, and whether any residences are being offered with furnishings or turnkey packages.\n\nThat is the real comparison point. If you are judging Mr. C against waterfront projects north or south of downtown, the right question is not whether downtown is hot. It is whether the tradeoff between walkability, service, and price is better for your use case than a Flagler or South Flagler alternative."
      },
      {
        "heading": "Bottom line",
        "body": "Mr. C is the downtown test case for branded luxury in West Palm Beach. It suggests there is still demand for a service-led building that fits the urban core rather than the waterfront edge.\n\nFor buyers, that means downtown branded condos are still moving when the product is specific and the location answers a real daily-life question. The next step is to compare the remaining inventory, not the marketing."
      }
    ],
    "ctaText": "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    "factCheckRequired": [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    "seo": {
      "primaryQuery": "Mr. C shows downtown branded condos still move",
      "secondaryQueries": [],
      "suggestedSlug": "mr-c-shows-downtown-branded-condos-still-move",
      "titleTag": "Mr. C shows downtown branded condos still move | Buyer Intelligence",
      "metaDescription": "Mr. C Hotel & Residences is still climbing at 320 Lakeview Avenue, and the current sales pace says downtown branded residences can still clear when the product and location are tight."
    }
  },

  {
    "id": "therealreal-cityplace-move-deepens-downtown-luxury-retail-lane",
    "status": "published",
    "category": "Downtown Spotlight",
    "title": "The RealReal's CityPlace move deepens downtown's luxury retail lane",
    "slug": "therealreal-cityplace-move-deepens-downtown-luxury-retail-lane",
    "excerpt": "The resale brand opens Aug. 13 at 700 S. Rosemary Ave., leaving Palm Beach for a larger CityPlace space and adding a different kind of daytime use to downtown West Palm Beach.",
    "buyerThesis": "For buyers comparing downtown West Palm Beach, CityPlace, and nearby waterfront or north-end options, the signal is simple: the district keeps adding practical walkable uses, not just dining buzz. That improves the case for everyday convenience around Rosemary Avenue and helps the area feel more lived in on normal weekdays.",
    "buyerTakeaway": "For buyers comparing downtown West Palm Beach, CityPlace, and nearby waterfront or north-end options, the signal is simple: the district keeps adding practical walkable uses, not just dining buzz. That improves the case for everyday convenience around Rosemary Avenue and helps the area feel more lived in on normal weekdays.",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "image": {
      "path": "/assets/editorial/therealreal-cityplace-move-deepens-downtown-luxury-retail-lane-hero.jpg",
      "alt": "Editorial illustration of shoppers browsing unbranded clothing racks along a palm-lined downtown retail corridor.",
      "caption": "An editorial illustration of the kind of daytime retail activity CityPlace is adding to downtown West Palm Beach.",
      "credit": "AI-generated editorial illustration",
      "mode": "generated-editorial"
    },
    "primaryProjectId": "",
    "projectIds": [],
    "sourceName": "The RealReal",
    "sourceLinks": [
      {
        "label": "The RealReal press release: The RealReal Opens New West Palm Beach Store",
        "href": "https://investor.therealreal.com/news/news-details/2026/The-RealReal-Opens-New-West-Palm-Beach-Store/default.aspx",
        "sourceType": "official project site"
      },
      {
        "label": "CityPlace opening day page for The RealReal",
        "href": "https://www.cityplace.com/west-palm-beach-events/realreal-opening-day",
        "sourceType": "official project site"
      },
      {
        "label": "AOL: The RealReal luxury resale store moves from Palm Beach to CityPlace",
        "href": "https://www.aol.com/articles/realreal-luxury-resale-store-moves-091410000.html",
        "sourceType": "local news coverage"
      }
    ],
    "datePublished": "2026-08-11",
    "dateModified": "2026-08-11",
    "sections": [
      {
        "heading": "What changed",
        "body": "The RealReal says it will open its new West Palm Beach store on Aug. 13 at 700 S. Rosemary Ave., Suite 136, inside CityPlace. The company says the move takes the brand out of its longtime Palm Beach location and into a larger, more modern space. CityPlace has already put the opening on its events calendar, with an all-day celebration and refreshments from Maman."
      },
      {
        "heading": "Why this is a downtown story",
        "body": "This is not just a retail address change. It is another sign that Rosemary Avenue is functioning less like a mall frontage and more like a downtown street with a real daily rhythm. A luxury resale store does something different from a restaurant or a bar. It creates a reason to browse, consign, compare, and return on a weekday afternoon. That kind of use matters because it keeps the district active when the dinner crowd is gone and the event schedule is quiet."
      },
      {
        "heading": "What CityPlace is selling now",
        "body": "CityPlace keeps leaning into a mixed-use identity that blends shopping, dining, events, and service retail into one district-wide habit. The RealReal fits that direction. It is a recognizable brand with a practical customer use, and it sits alongside a longer list of tenants and activations that are trying to make the area feel useful throughout the day. The message is not about one store alone. It is about a corridor that now has enough weight to pull in brands that depend on repeat traffic, not just opening-week novelty."
      },
      {
        "heading": "Why buyers should care",
        "body": "For people comparing downtown West Palm Beach with north-end or waterfront options, the retail mix is part of the lifestyle math. A district that can support shopping, errands, dining, and leisure in the same walkable footprint feels different from one that needs a car for every small task. The RealReal does not change the skyline. It does change the routine. That matters when you are judging whether a building really sits inside a usable urban district or only near one."
      },
      {
        "heading": "What to watch next",
        "body": "The useful follow-up is simple: does The RealReal become part of the regular CityPlace circuit, or does it stay a first-week headline? If the store lands well, it strengthens the case for more specialty retail in and around downtown. If the traffic is thin, the bigger story is still intact. CityPlace is continuing to move beyond pure entertainment and toward a more complete daytime district, and that shift is what downtown West Palm Beach has been chasing for years."
      }
    ],
    "ctaText": "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    "factCheckRequired": [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    "seo": {
      "primaryQuery": "The RealReal's CityPlace move deepens downtown's luxury retail lane",
      "secondaryQueries": [],
      "suggestedSlug": "therealreal-cityplace-move-deepens-downtown-luxury-retail-lane",
      "titleTag": "The RealReal's CityPlace move deepens downtown's luxury retail lane | Downtown Spotlight",
      "metaDescription": "The RealReal is opening at CityPlace on Aug. 13, relocating from Palm Beach into a larger downtown West Palm Beach space."
    }
  },

  {
    id: "urban-roast-opens-on-datura-street",
    status: "published",
    category: "Downtown Spotlight",
    title: "Urban Roast opens on Datura Street and gives downtown another late-night stop",
    slug: "urban-roast-opens-on-datura-street",
    excerpt: "The D.C.-born café and cocktail lounge is now open downtown, adding breakfast, all-day dining and weekend hours that run past midnight.",
    buyerThesis: "The D.C.-born café and cocktail lounge is now open downtown, adding breakfast, all-day dining and weekend hours that run past midnight.",
    buyerTakeaway: "For buyers comparing downtown West Palm Beach, the important signal is not just that another restaurant opened. It is that downtown keeps adding places that make the district feel usable across the day, which helps the case for walkability, evening activity and the lived-in feel people actually notice after moving in.",
    marketSignal: "",
    bestFor: "",
    watchPoints: "",
    buyerQuestions: "",
    relatedBuildings: [],
    relatedNeighborhoods: [],
    relatedCorridor: "",
    relatedArticleIds: [
      "the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city"
    ],
    image: {
      path: "/assets/editorial/rosemary-square-corridor.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    projectIds: [],
    sourceName: "Urban Roast",
    sourceLinks: [
      {
        label: "Urban Roast",
        href: "https://www.urbanroastdc.com/west-palm-beach-menu",
        sourceType: "local news coverage"
      },
      {
        label: "Urban Roast West Palm Beach menu page",
        href: "https://www.urbanroastdc.com/west-palm-beach-menu",
        sourceType: "official project site"
      },
      {
        label: "West Palm Beach DDA: Urban Roast venue page",
        href: "https://downtownwpb.com/venue/urban-roast/",
        sourceType: "official project site"
      },
      {
        label: "Hoodline: Urban Roast to open in downtown West Palm Beach",
        href: "https://hoodline.com/2026/02/d-c-party-cafe-urban-roast-plots-splashy-landing-in-downtown-west-palm/",
        sourceType: "local news coverage"
      },
      {
        label: "WhatNow: D.C.'s Urban Roast is coming to West Palm Beach",
        href: "https://whatnow.com/miami/restaurants/d-cs-urban-roast-is-coming-to-west-palm-beach/",
        sourceType: "local news coverage"
      }
    ],
    datePublished: "2026-07-31",
    dateModified: "2026-07-31",
    sections: [
      {
        heading: "What changed",
        body: "Urban Roast is now open on Datura Street. The restaurant's West Palm Beach site says \"Now Open,\" and the West Palm Beach Downtown Development Authority listed a grand opening for July 25. That turns the concept from a promise into a place people can actually use.\n\nThe opening gives downtown another all-day operator with a schedule that stretches from morning coffee to late-night cocktails. Urban Roast is not a one-part-day concept, and that matters in a district where the strongest tenants are the ones that can carry breakfast, lunch, after-work drinks and dinner without changing addresses."
      },
      {
        heading: "What is actually new",
        body: "The real change is the operating pattern, not the brand name. Urban Roast's West Palm Beach page lists hours that start at 9 a.m. every day and run as late as 1 a.m. on Friday and Saturday. That makes it useful in a way that a dinner-only room is not. It can catch the office crowd, the brunch crowd, the early evening crowd and the people who want one more stop after dinner.\n\nThat kind of schedule makes downtown feel more complete. It adds another place where the day can move naturally into the night instead of stopping at the edge of a meal reservation."
      },
      {
        heading: "Why this block matters",
        body: "Datura Street already sits in the middle of downtown's shifting food map. Each new opening there gives the block a little more weight as part of the everyday downtown circuit, not just a cut-through between bigger names. Urban Roast helps push that idea further because it is built for repeat use. Coffee in the morning, brunch on the weekend, cocktails later on, and enough hours to be part of the routine instead of a special occasion.\n\nFor West Palm Beach, that is the point. The city does not need more one-time openings that only matter on day one. It needs places that help the downtown core work on an ordinary Tuesday as well as on a Friday night. Urban Roast is aimed squarely at that use case."
      },
      {
        heading: "How daily life changes",
        body: "A district feels different when it gains more than a single dinner anchor. Urban Roast gives downtown another flexible stop for the in-between hours that shape how a place is actually lived in: before work, after work, between meetings, after an event, or when visitors want one more easy option.\n\nThat matters for nearby residents and for people comparing downtown against other West Palm Beach corridors. Walkability is not just about being able to get to a restaurant. It is about whether there are enough reasons to stay on foot for more than one errand or one reservation. Urban Roast adds to that rhythm."
      },
      {
        heading: "What to watch next",
        body: "The question now is whether Urban Roast settles into the district as a regular stop or stays a one-week opening story. The opening itself is real, but the deeper test is whether the place keeps drawing morning, daytime and night traffic once the novelty fades.\n\nIf it does, downtown West Palm Beach gets another useful layer of street life on Datura Street. If it does not, the opening still matters, but mainly as another sign of how hard the district is working to build a fuller dining map. Either way, the signal is the same: downtown keeps adding uses that make the core feel more lived in."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    factCheckRequired: [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    seo: {
      primaryQuery: "Urban Roast opens on Datura Street and gives downtown another late-night stop",
      secondaryQueries: [],
      suggestedSlug: "urban-roast-opens-on-datura-street",
      titleTag: "Urban Roast opens on Datura Street and gives downtown another late-night stop | Downtown Spotlight",
      metaDescription: "The D.C.-born café and cocktail lounge is now open downtown, adding breakfast, all-day dining and weekend hours that run past midnight."
    }
  },
  {
    id: "olara-special-pricing-keeps-north-flagler-in-play",
    status: "published",
    category: "general",
    title: "Olara's special pricing keeps North Flagler in play",
    slug: "olara-special-pricing-keeps-north-flagler-in-play",
    excerpt: "Olara is still advertising pre-construction inventory and special pricing, and West Palm Beach's new-construction shelf remains broad enough that buyers should compare lines, fees, and timing instead of waiting for a market reset.",
    buyerThesis: "Olara is still advertising pre-construction inventory and special pricing, and West Palm Beach's new-construction shelf remains broad enough that buyers should compare lines, fees, and timing instead of waiting for a market reset.",
    buyerTakeaway: "Treat Olara's special pricing as a line-level opportunity, not proof that North Flagler has gone soft. Compare the remaining inventory, fees, and closing path before assuming there will be better leverage later.",
    marketSignal: "Olara's live sales page says pre-construction inventory and special pricing are available, while West Palm Beach new-construction directories still show more than 100 active listings and a long average time on market.",
    bestFor: "Buyers who want North Flagler water views, can compare stacks line by line, and care more about matching the ownership fit than chasing a headline discount.",
    watchPoints: "Confirm which units are included in the special pricing, whether the concession is price or incentive, how fees and parking vary by line, and how quickly the remaining inventory is moving.",
    buyerQuestions: "Which lines are actually discounted? What do the fees look like on those units? If I wait three months, what changes besides availability?",
    relatedBuildings: [
      "olara-condos",
      "shorecrest",
      "south-flagler-house"
    ],
    relatedNeighborhoods: [
      "north-flagler",
      "downtown-west-palm-beach"
    ],
    relatedCorridor: "north-flagler",
    relatedArticleIds: [
      "pre-construction-condo-due-diligence",
      "olara-vs-shorecrest-waterfront-buyer-profiles"
    ],
    image: {
      path: "/assets/editorial/wpb-geography-map-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    projectIds: [],
    sourceName: "Olara Condos in West Palm Beach",
    sourceLinks: [
      {
        label: "Olara Condos in West Palm Beach",
        href: "https://www.pearlantonacci.com/west-palm-beach-olara.php",
        sourceType: "local news coverage"
      },
      {
        label: "Olara Condos in West Palm Beach",
        href: "https://www.pearlantonacci.com/west-palm-beach-olara.php",
        sourceType: "official project site"
      },
      {
        label: "West Palm Beach New Construction Condos For Sale",
        href: "https://www.floridacondofinder.com/west-palm-beach/west-palm-beach-new-construction-condos-for-sale/",
        sourceType: "local news coverage"
      },
      {
        label: "West Palm Beach Housing Market",
        href: "https://www.redfin.com/city/19373/FL/West-Palm-Beach/housing-market",
        sourceType: "local news coverage"
      }
    ],
    datePublished: "2026-07-22",
    dateModified: "2026-07-22",
    sections: [
      {
        heading: "What changed",
        body: "Olara's current West Palm Beach sales page is still openly advertising pre-construction inventory and special pricing. That is the first thing a buyer should notice. It means the project is not behaving like a closed-out waterfront trophy; it is still in active conversation with the market.\n\nThe page also shows a real spread in the product still available. Olara currently lists 12 active residences, with prices running from about $1.8 million to $8 million and an average asking price around $4.3 million. For a buyer, that is not noise. It is a reminder that the remaining units are still being priced line by line, not treated as interchangeable."
      },
      {
        heading: "What the shelf looks like now",
        body: "The broader West Palm Beach new-construction shelf is still deep enough to matter. The local new-construction directory shows 105 active listings in the city, with an average days-on-market figure of 263 and a median list price of $4.553 million. Even if those numbers are broader than North Flagler alone, they say something useful: the market is not so tight that buyers have no room to compare.\n\nThe citywide housing market points in the same direction. Redfin shows West Palm Beach homes sold in May 2026 up 28.7 percent year over year, with a median sale price of $512,193 and an average of 85 days on market. That is not a falling market waiting for a rescue. It is a market where good product still moves, but not so fast that buyers can ignore the details."
      },
      {
        heading: "Why this matters on North Flagler",
        body: "North Flagler is now a comparison corridor, not a single bet. Buyers looking at Olara are comparing it against Shorecrest, South Flagler House, and other waterfront options where the real differences show up in stack, exposure, fees, service model, and closing path.\n\nThat is why special pricing should be read carefully. A reduction or incentive can help a buyer get into the right line, but it does not automatically make one building the better long-term fit. If the unit has the wrong view corridor, higher monthly carrying costs, or a delivery window that does not fit the buyer's timeline, the headline number is not enough."
      },
      {
        heading: "What to watch next",
        body: "The next buyer question is practical: which units are actually included in the current pricing, and what is the concession really doing? Sometimes it is a straight price move. Sometimes it is a fee credit, a closing-cost adjustment, or a way to clear a specific stack that is harder to move.\n\nBefore moving forward, ask for the current availability sheet, the exact fee schedule, parking and storage treatment, and the delivery assumptions attached to the unit you want. Then compare that package against the other North Flagler options, not just the project brochure. If the answer still works after that review, the market is giving you enough room to act now."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    factCheckRequired: [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    seo: {
      primaryQuery: "Olara's special pricing keeps North Flagler in play",
      secondaryQueries: [],
      suggestedSlug: "olara-special-pricing-keeps-north-flagler-in-play",
      titleTag: "Olara's special pricing keeps North Flagler in play | Buyer Intelligence",
      metaDescription: "Olara is still advertising pre-construction inventory and special pricing, and West Palm Beach's new-construction shelf remains broad enough that buyers should compare lines, fees, and timing instead of waiting for a market reset."
    }
  },
  {
    id: "nora-hotel-countdown",
    status: "published",
    category: "Downtown Spotlight",
    title: "The Nora Hotel gives NORA a real opening date",
    slug: "nora-hotel-countdown",
    excerpt: "NORA's homepage now shows the district's first wave of tenants as open, and Reuters Connect captions say the 201-key hotel is scheduled to welcome guests on Oct. 19. North Railroad Avenue is moving from promise to calendar.",
    buyerThesis: "NORA's homepage now shows the district's first wave of tenants as open, and Reuters Connect captions say the 201-key hotel is scheduled to welcome guests on Oct. 19. North Railroad Avenue is moving from promise to calendar.",
    buyerTakeaway: "Use this note as buyer context, then verify building-specific availability, pricing, fees, documents, and timing.",
    marketSignal: "",
    bestFor: "",
    watchPoints: "",
    buyerQuestions: "",
    relatedBuildings: [],
    relatedNeighborhoods: [
      "nora-district",
      "downtown-west-palm-beach"
    ],
    relatedCorridor: "",
    relatedArticleIds: [],
    image: {
      path: "/assets/editorial/rosemary-square-corridor.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    primaryProjectId: "nora-house",
    projectIds: [
      "nora-house"
    ],
    sourceName: "NORA West Palm",
    sourceLinks: [
      {
        label: "NORA West Palm",
        href: "https://norawpb.com/the-nora-hotel/",
        sourceType: "local news coverage"
      },
      {
        label: "The Nora Hotel official page",
        href: "https://norawpb.com/the-nora-hotel/",
        sourceType: "official project site"
      },
      {
        label: "NORA homepage",
        href: "https://norawpb.com/",
        sourceType: "official project site"
      },
      {
        label: "Reuters Connect caption for The Nora Hotel opening date",
        href: "https://www.reutersconnect.com/item/the-nora-hotel-seen-here-on-july-1-2026-in-west-palm-beach-florida-is-scheduled-to-open-to-guests-on-oct-19-it-is-the/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMVVTQVRPREFZMjkzNTgyMTg",
        sourceType: "local news coverage"
      },
      {
        label: "Markets of Tomorrow on Nami Nori at NORA",
        href: "https://www.oftmw.com/post/nami-nori-is-officially-coming-to-west-palm-beach-s-nora-district/",
        sourceType: "local news coverage"
      }
    ],
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
    sections: [
      {
        heading: "What changed",
        body: "The Nora Hotel page still describes the property as a fall 2026 arrival, but Reuters Connect captions tied to a July 1 photo set put a sharper point on it: the 201-key hotel is scheduled to open to guests on Oct. 19. That is a different kind of signal than the usual \"coming soon\" language. It gives the district a date.\n\nThe rest of NORA is already behaving like a live neighborhood rather than a master plan. The homepage now carries a \"now open\" roster that includes Del Mar, Loco Taco & Oyster Bar, H&H Bagels, Sunday Motor Co., Van Leeuwen, solidcore, Celis Juice Bar, IGK Salons, Sana Skin Studio, mint, Pompanos and Le Labo. The district has moved past the point where every update is only a promise."
      },
      {
        heading: "What is actually new",
        body: "The meaningful change is not just that another luxury hotel is on the way. It is that NORA now has a hospitality clock attached to it. That matters because hotels do more than add rooms. They change the rhythm of a district. They create check-in traffic, breakfast traffic, bar traffic, and the kind of weekend spillover that a restaurant row alone does not always produce.\n\nNami Nori is still marked opening soon on the official site, and Pastis is being built into the hotel as part of the district's next phase. Those pieces turn NORA from a tenant list into a layered place with multiple reasons to visit, linger and come back. The market reads that shift quickly."
      },
      {
        heading: "Why this part of the city matters",
        body: "NORA sits just north of downtown's traditional center of gravity, so every confirmed opening changes the practical walking map. A district like this is not only about headlines. It is about whether a resident or visitor can walk from a condo, office or parking garage into a place that feels active after dinner and still has something going on the next morning.\n\nThat is why the hotel date matters more than a generic lease announcement. It makes North Railroad Avenue feel less like an adjacent project zone and more like an extension of downtown's daily life. For people comparing addresses, that can be the difference between \"near downtown\" and \"inside the part of downtown that people actually use.\""
      },
      {
        heading: "What to watch next",
        body: "The next markers are straightforward. Watch whether Nami Nori keeps its current timeline, how quickly Pastis and the hotel interior finish, and whether the district can keep filling in without losing the walkable feel that made the first phase appealing.\n\nIf the Oct. 19 opening holds, NORA stops being framed mainly as a dining and retail story. It becomes a place where people can stay, meet, eat, and drift into the street without planning the whole night around a single reservation. That is the sort of texture downtown West Palm Beach has been building toward for years, and NORA is now close enough to make that feel real."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    factCheckRequired: [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    seo: {
      primaryQuery: "The Nora Hotel gives NORA a real opening date",
      secondaryQueries: [],
      suggestedSlug: "nora-hotel-countdown",
      titleTag: "The Nora Hotel gives NORA a real opening date | Downtown Spotlight",
      metaDescription: "NORA's homepage now shows the district's first wave of tenants as open, and Reuters Connect captions say the 201-key hotel is scheduled to welcome guests on Oct. 19. North Railroad Avenue is moving from promise to calendar."
    }
  },
  {
    id: "ritz-carlton-penthouse-resets-north-flagler-ceiling",
    status: "published",
    category: "general",
    title: "A Ritz-Carlton penthouse resets the North Flagler ceiling",
    slug: "ritz-carlton-penthouse-resets-north-flagler-ceiling",
    excerpt: "Penthouse A went under contract for $16.95 million, and the remaining Ritz-Carlton residences still start at $3 million, keeping North Flagler focused on line, view, and service.",
    buyerThesis: "Penthouse A went under contract for $16.95 million, and the remaining Ritz-Carlton residences still start at $3 million, keeping North Flagler focused on line, view, and service.",
    buyerTakeaway: "If you want North Flagler exposure, the high-end penthouse says the top end is still liquid; the better question is whether your line and fee profile justify the premium.",
    marketSignal: "A $16.95 million contract at The Ritz-Carlton Residences, plus remaining units that still start at $3 million, shows buyers are stepping up for waterfront product even as the citywide market remains active.",
    bestFor: "Full-time residents who want waterfront service living, buyers comparing North Flagler against Palm Beach Island, and purchasers who care more about views and privacy than the lowest entry price.",
    watchPoints: "Completion is expected in 2028, so buyers are underwriting future delivery. Compare line-specific views, monthly dues, deposit timing, and how similar units in Shorecrest and South Flagler House are priced.",
    buyerQuestions: "Which lines still carry the strongest water exposure? How much of the price is the brand and service model versus the view? What are the monthly dues and deposit milestones? Would this still work if the market softens before closing?",
    relatedBuildings: [
      "the-ritz-carlton-residences-west-palm-beach",
      "shorecrest",
      "south-flagler-house"
    ],
    relatedNeighborhoods: [
      "north-flagler"
    ],
    relatedCorridor: "north-flagler",
    relatedArticleIds: [
      "west-palm-beach-wall-street-south-condos",
      "olara-vs-shorecrest-waterfront-buyer-profiles"
    ],
    image: {
      path: "/assets/editorial/wpb-geography-map-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    projectIds: [],
    sourceName: "Florida YIMBY source image reference, Related Group, CondoBlackBook, and Sotheby's market update",
    sourceLinks: [
      {
        label: "Florida YIMBY source image reference, Related Group, CondoBlackBook, and Sotheby's market update",
        href: "https://floridayimby.com/wp-content/uploads/2026/06/FR_A01_04-777x437.jpg",
        sourceType: "local news coverage"
      },
      {
        label: "Florida YIMBY source image reference for Penthouse A story",
        href: "https://floridayimby.com/wp-content/uploads/2026/06/FR_A01_04-777x437.jpg",
        sourceType: "development news coverage"
      },
      {
        label: "Related Group project page for The Ritz-Carlton Residences West Palm Beach",
        href: "https://relatedgroup.com/properties/the-ritz-carlton-residences-west-palm-beach/",
        sourceType: "official project site"
      },
      {
        label: "CondoBlackBook July 2026 Broward & Palm Beach luxury preconstruction updates",
        href: "https://www.condoblackbook.com/blog/july-2026-broward-and-palm-beach-preconstruction-updates",
        sourceType: "local news coverage"
      },
      {
        label: "Sotheby's International Realty West Palm Beach Q2 2026 market update",
        href: "https://marketupdates.sothebysrealty.com/marketupdate/palmbeach/west_palm_beach",
        sourceType: "market report"
      }
    ],
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
    sections: [
      {
        heading: "What changed",
        body: "Penthouse A at The Ritz-Carlton Residences, West Palm Beach went under contract at $16.95 million, a new ceiling for North Flagler. The 27-story tower is still under construction at 1717 North Flagler Drive, but the sale is already doing market work. It tells buyers where the top of the corridor is now being marked, not where it might settle later.\n\nThe penthouse itself is not a generic luxury unit. It sits on the 27th floor, spans 6,097 square feet, and includes roughly 1,200 square feet of terraces. The building is planned for 138 east-facing homes, with delivery expected in 2028. That means buyers are pricing a future waterfront experience, not just a finished address."
      },
      {
        heading: "What the number actually says",
        body: "A high-end contract at the very top of the stack does not make every Ritz residence a trophy-priced outlier. It does, however, raise the ceiling the rest of the building is measured against. The current marketing materials still start the remaining inventory around $3 million, which puts the tower in a different lane from the penthouse headline.\n\nThat split matters. Buyers are not choosing between \"Ritz-Carlton\" and \"not Ritz-Carlton\" in the abstract. They are choosing between lines, exposures, terrace depth, privacy, and carrying costs. A penthouse top-end is useful only if you understand which parts of the project it actually reflects."
      },
      {
        heading: "The market backdrop is still firm",
        body: "West Palm Beach is not showing the kind of softness that would make a high-end contract feel disconnected from the market. Sotheby’s Q2 2026 update for the city shows 475 closed sales, up 28% year over year, while inventory fell 18% to 720. The median sales price for the broader market reached $575,000, and the city logged 13 closings above $5 million in the quarter.\n\nThat is not a perfect proxy for new-construction condos, but it does show a market that is still transacting. Buyers comparing a North Flagler tower against Palm Beach Island or South Flagler should read the Ritz contract as part of a live market, not as a one-off vanity sale."
      },
      {
        heading: "How to read the building",
        body: "The official project page and the current sales materials make the product clear: a waterfront condominium, a limited collection of homes, legendary-service branding, and a location at 1717 North Flagler Drive. The appeal is not just the name. It is the combination of east-facing water views, service, and a location that still sits inside the North Flagler decision set.\n\nThat is why the right comparison is not simply with other new towers. It is with Shorecrest, South Flagler House, and the rest of the corridor where buyers are trading off view, timing, privacy, amenity load, and monthly carrying cost. North Flagler is becoming a pricing ladder, not a single market."
      },
      {
        heading: "What buyers should ask next",
        body: "The useful questions are not glamorous ones. They are the ones that tell you whether the top-end matters for your unit.\n\n- Which lines still have the strongest water exposure and the least compromised view corridor?\n- How much of the price reflects the brand, and how much reflects the actual floor plan and exposure?\n- What are the current dues, reserve assumptions, and service inclusions?\n- How do the deposit milestones and 2028 delivery window affect your financing and liquidity?\n- If you compare this line with Shorecrest or South Flagler House, which building gives you the better day-to-day ownership experience?\n\nThe cleanest read is simple: the Ritz penthouse says the top end of North Flagler is still clearing. It does not say every buyer should chase the top end. It says you should know exactly what you are paying for before the corridor's biggest number starts sounding like the only number that matters."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    factCheckRequired: [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    seo: {
      primaryQuery: "A Ritz-Carlton penthouse resets the North Flagler ceiling",
      secondaryQueries: [],
      suggestedSlug: "ritz-carlton-penthouse-resets-north-flagler-ceiling",
      titleTag: "A Ritz-Carlton penthouse resets the North Flagler ceiling | Buyer Intelligence",
      metaDescription: "Penthouse A went under contract for $16.95 million, and the remaining Ritz-Carlton residences still start at $3 million, keeping North Flagler focused on line, view, and service."
    }
  },
  {
    id: "the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city",
    status: "published",
    category: "Downtown Spotlight",
    title: "The New Dining Map: Why West Palm Beach Is Becoming a Serious Restaurant City",
    slug: "the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city",
    excerpt: "West Palm Beach’s restaurant scene has moved from convenient dining to destination dining. New chef-driven concepts, national hospitality groups, and walkable mixed-use districts are reshaping how buyers think about downtown living.",
    buyerThesis: "West Palm Beach’s restaurant scene has moved from convenient dining to destination dining. New chef-driven concepts, national hospitality groups, and walkable mixed-use districts are reshaping how buyers think about downtown living.",
    buyerTakeaway: "For buyers comparing downtown West Palm Beach, CityPlace, Flagler Drive, Nora, and nearby new construction, restaurants now matter as much as views, finishes, and amenities. Dining helps define daily convenience, evening activity, resale perception, and the overall maturity of each neighborhood.",
    image: {
      path: "/assets/editorial/the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city-2026-06-09-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    primaryProjectId: "nora-house",
    projectIds: [
      "nora-house",
      "mr-c",
      "one-flagler",
      "south-flagler-house",
      "shorecrest",
      "la-clara",
      "olara"
    ],
    sourceName: "Nora District updates, Modern Luxury, Michelin Guide, WPBF, Verdict Foodservice, local restaurant coverage, economic reports, and market notes",
    sourceLinks: [
      {
        label: "Nora District updates, Modern Luxury, Michelin Guide, WPBF, Verdict Foodservice, local restaurant coverage, economic reports, and market notes",
        href: "https://www.wpbnewconstruction.com/market-notes/",
        sourceType: "local news coverage"
      }
    ],
    datePublished: "2026-06-09",
    dateModified: "2026-06-09",
    sections: [
      {
        heading: "What happened",
        body: "For years, downtown West Palm Beach was where Palm Beachers grabbed a quick bite on the way to the island. Today, the conversation has flipped.",
        image: "/assets/editorial/the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city-2026-06-09-body-1.jpg"
      },
      {
        heading: "Why it matters",
        body: "Michelin-recognized chef’s counters, imported New York bistros, Italian food halls, waterfront seafood rooms, and ambitious mixed-use districts are now helping define the city’s next chapter. The dining surge is not just restaurant gossip. It reflects the same forces reshaping downtown real estate: wealth migration, office growth, boutique hotels, and buyers who want an urban home with culture, energy, and a proper dinner reservation.",
        image: "/assets/editorial/the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city-2026-06-09-body-2.jpg"
      },
      {
        heading: "Buyer context",
        body: "From convenience dining to destination dining",
        image: "/assets/editorial/the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city-2026-06-09-body-3.jpg"
      },
      {
        heading: "Buyer context",
        body: "West Palm’s old reputation as Palm Beach’s “step-sister” is fading fast. Legacy spots like Avocado Grill, E.R. Bradley’s, and Pistache helped establish downtown as a reliable night-out option. But the newer wave is different."
      },
      {
        heading: "Buyer context",
        body: "Over the last few years, national hospitality groups, chef-led operators, and polished restaurant brands have entered the market with concepts designed for people who plan the evening around the restaurant — not the other way around."
      },
      {
        heading: "Buyer context",
        body: "CityPlace’s evolution"
      },
      {
        heading: "Buyer context",
        body: "CityPlace has been reworked from a retail-heavy shopping center into a more complete lifestyle district. Felice brought a New York Tuscan restaurant and wine bar to 360 Rosemary, adding Italian classics, a polished cocktail program, and a more sophisticated dining rhythm to the area."
      },
      {
        heading: "Buyer context",
        body: "Moxies followed with a large indoor-outdoor restaurant, statement bar, private dining, and a broad upscale-casual menu. Eataly’s arrival at the restored Harriet Himmel Hall is the bigger signal: a 23,000-square-foot Italian marketplace with restaurants, retail, cooking classes, and live programming. That is not a filler tenant. That is an anchor."
      },
      {
        heading: "Buyer context",
        body: "Flagler waterfront’s transformation"
      },
      {
        heading: "Buyer context",
        body: "The Flagler waterfront is also becoming a serious dining corridor. Estiatorio Milos opened at One Flagler, bringing a globally recognized Greek seafood concept to one of the most prominent office addresses in the city. Its fish-market-style dining room, whole-fish service, and large-format restaurant model speak directly to the city’s new business and luxury audience."
      },
      {
        heading: "Buyer context",
        body: "Nearby, Lamarina adds another waterfront option with Latin, Mediterranean, and coastal influences, plus a raw bar and marina-facing setting. Together, these restaurants help turn Flagler Drive into more than a scenic office corridor. They make it a place where business lunch, dinner, and lifestyle all overlap."
      },
      {
        heading: "Buyer context",
        body: "Flamingo Park and the chef-driven counter"
      },
      {
        heading: "Buyer context",
        body: "Some of the most interesting momentum is happening away from the obvious corridors. Flamingo Park has become an incubator for smaller, chef-driven dining."
      },
      {
        heading: "Buyer context",
        body: "Midorie is planned as an intimate Japanese restaurant built around omakase, carefully sourced fish, and a quieter, more focused experience. Emelina, a small Cuban chef’s counter, has already drawn major attention by bringing a more refined, story-driven approach to Cuban cuisine. This matters because not every important restaurant has to be huge. Sometimes the smallest rooms do the loudest reputation work."
      },
      {
        heading: "Buyer context",
        body: "Nora, CityPlace, Clematis, and the new restaurant geography"
      },
      {
        heading: "Buyer context",
        body: "Downtown dining is no longer one single strip. It is becoming a map of distinct districts."
      },
      {
        heading: "Buyer context",
        body: "Nora is the most ambitious example. The district is converting old warehouse blocks north of downtown into a large mixed-use destination with restaurants, retail, fitness, public space, and hotel components. Its tenant mix leans heavily into proven New York and national operators, including Pastis, Juliana’s Pizza, H&H Bagels, Nami Nori, Del Mar, Indaco, Van Leeuwen, and Loco Taqueria & Oyster Bar."
      },
      {
        heading: "Buyer context",
        body: "That roster tells you exactly who Nora is chasing: residents, office workers, visitors, and relocated buyers who recognize those brands and already understand the lifestyle they represent."
      },
      {
        heading: "Buyer context",
        body: "CityPlace is becoming the Italian-market-and-casual-glamour district. Clematis remains the nightlife artery, with rooftops, taverns, cocktail lounges, and late-night energy. Flagler is becoming the polished waterfront dining corridor. Flamingo Park is emerging as the chef-counter and neighborhood discovery zone."
      },
      {
        heading: "Buyer context",
        body: "That is how a real city eats. Not one restaurant row. Multiple personalities."
      },
      {
        heading: "Buyer context",
        body: "Why chefs and hospitality groups are paying attention"
      },
      {
        heading: "Buyer context",
        body: "The restaurant boom is not accidental. West Palm Beach has become part of the “Wall Street South” conversation, with financial firms, corporate relocations, private wealth, and new office towers reshaping the city’s daytime population."
      },
      {
        heading: "Buyer context",
        body: "That creates something restaurants need: year-round customers with money to spend."
      },
      {
        heading: "Buyer context",
        body: "Hospitality groups are looking at West Palm the way many looked at Miami’s Brickell years ago: dense new residential development, stronger office traffic, major wealth migration, and a growing audience of New York and Northeast transplants who expect serious restaurants close to home."
      },
      {
        heading: "Buyer context",
        body: "The result is a dining scene with more confidence. Not just another taco place with neon wings on the wall. Actual operators. Actual capital. Actual staying power."
      },
      {
        heading: "Buyer context",
        body: "What this means for buyers"
      },
      {
        heading: "Buyer context",
        body: "For luxury condo and townhouse buyers, restaurants are not just lifestyle extras. They are neighborhood infrastructure."
      },
      {
        heading: "Buyer context",
        body: "Walkability matters. A buyer near CityPlace, Flagler, or eventually Nora is not just buying square footage. They are buying the ability to walk to dinner, coffee, cocktails, fitness, and work. That changes daily life and can support long-term resale perception."
      },
      {
        heading: "Buyer context",
        body: "Evening activity matters. Restaurants keep streets active after office hours. That makes downtown feel less sleepy and more complete. Buyers who once saw West Palm as quiet after 6 p.m. are now looking at a city with rooftops, lounges, supper clubs, chef counters, and waterfront dining."
      },
      {
        heading: "Buyer context",
        body: "Year-round demand matters. National restaurant groups do not spend heavily in a market they believe disappears every summer. Their investment suggests confidence in West Palm as a more permanent, year-round luxury market."
      },
      {
        heading: "Buyer context",
        body: "Price matters too. Buyers should expect many of these restaurants to charge Miami or New York prices. That is not a complaint. It is a signal. The market is being priced for the audience now arriving."
      },
      {
        heading: "Buyer context",
        body: "Turnover still matters. South Florida restaurants open and close quickly. The key is knowing whether closures reflect weak demand or redevelopment pressure. In a growing downtown, some turnover is not a red flag. It can be part of the reset."
      },
      {
        heading: "Buyer context",
        body: "The difference between hype and staying power"
      },
      {
        heading: "Buyer context",
        body: "Not every opening will last. South Florida has never met a velvet rope it did not eventually trip over."
      },
      {
        heading: "Buyer context",
        body: "The strongest concepts usually share a few traits: experienced hospitality groups, unique offerings, strong locations, mixed-use foot traffic, and a reason to exist beyond Instagram."
      },
      {
        heading: "Buyer context",
        body: "Eataly is not just another Italian restaurant. Milos is not just another seafood place. Nami Nori is not just sushi. Emelina is not just a tasting counter. These concepts bring identity, operational depth, and a reason for buyers and visitors to talk about West Palm differently."
      },
      {
        heading: "Buyer context",
        body: "The restaurants most likely to last will be the ones that feel connected to the city’s next chapter rather than simply dropped into it."
      },
      {
        heading: "Buyer context",
        body: "Closing"
      },
      {
        heading: "Buyer context",
        body: "Downtown West Palm Beach is entering the kind of culinary phase that usually signals a city growing up."
      },
      {
        heading: "Buyer context",
        body: "What began as a handful of reliable local spots has become a layered dining ecosystem: Greek seafood rooms, Italian marketplaces, Cuban chef counters, Japanese hand rolls, rooftop bars, Mediterranean terraces, and New York imports all within a relatively compact urban core."
      },
      {
        heading: "Buyer context",
        body: "For buyers considering downtown West Palm, the dining map is more than a list of places to eat. It is a proxy for economic vitality, walkability, cultural ambition, and the everyday pleasure of living in a city that finally knows what it wants to be."
      },
      {
        heading: "Buyer context",
        body: "The reservation is now part of the real estate story."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options.",
    factCheckRequired: [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation."
    ],
    seo: {
      primaryQuery: "The New Dining Map: Why West Palm Beach Is Becoming a Serious Restaurant City",
      secondaryQueries: [],
      suggestedSlug: "the-new-dining-map-why-west-palm-beach-is-becoming-a-serious-restaurant-city",
      titleTag: "The New Dining Map: Why West Palm Beach Is Becoming a Serious Restaurant City | Downtown Spotlight",
      metaDescription: "West Palm Beach’s restaurant scene has moved from convenient dining to destination dining. New chef-driven concepts, national hospitality groups, and walkable mixed-use districts are reshaping how buyers think about downtown living."
    }
  },
  {
    id: "west-palm-beach-new-dining-map",
    status: "published",
    category: "Downtown Spotlight",
    title: "Downtown Dining Is Becoming a Condo-Buyer Signal",
    slug: "west-palm-beach-new-dining-map",
    excerpt: "Eataly, rooftop restaurants, Greek seafood, sushi counters, and a deeper NORA tenant mix are changing how some buyers compare Downtown West Palm Beach. The signal is useful, but it still has to be tested against the building, parking, noise, and daily routine.",
    buyerThesis: "Downtown's restaurant wave matters when it changes daily use: where buyers walk, entertain, host guests, park, and spend evenings. It is lifestyle context, not a stand-alone reason to pay a premium.",
    buyerTakeaway: "Use the dining momentum as a practical comparison tool. Verify what is open now, what is still planned, the real walking route, valet and garage friction, night noise, construction exposure, and whether the building still works if the restaurant buzz cools.",
    image: {
      path: "/assets/editorial/downtown-dining-rooftop-pool.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    imageId: "downtown-dining-rooftop-pool",
    projectIds: [
      "nora-house",
      "mr-c",
      "banyan-tree",
      "ritz-carlton-wpb",
      "10-cityplace",
      "15-cityplace"
    ],
    sourceName: "User-provided dining brief with reviewed restaurant and district sources",
    sourceLinks: [
      {
        label: "Eataly West Palm Beach official location",
        href: "https://www.eataly.com/us_en/stores/west-palm-beach",
        sourceType: "official project site"
      },
      {
        label: "NORA West Palm Beach district and tenant directory",
        href: "https://www.norawpb.com/",
        sourceType: "official project site"
      },
      {
        label: "Estiatorio Milos West Palm Beach opening announcement",
        href: "https://www.prnewswire.com/news-releases/estiatorio-milos-to-open-in-west-palm-beach-on-february-7th-bringing-world-class-greek-cuisine-to-the-citys-flagler-waterfront-district-302364983.html",
        sourceType: "brand/developer announcement"
      },
      {
        label: "DowntownWPB Top of the Rox directory listing",
        href: "https://downtownwpb.com/directory/top-of-the-rox/",
        sourceType: "local news coverage"
      },
      {
        label: "Moxies West Palm Beach official location",
        href: "https://moxies.com/restaurants/west-palm-beach",
        sourceType: "official project site"
      }
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "The restaurant wave is now part of the condo conversation",
        body: "Downtown West Palm Beach dining has moved beyond a few reliable dinner spots. CityPlace has Eataly and a growing restaurant roster. NORA is adding hospitality and food-and-beverage tenants to an adaptive-reuse district. Clematis and the waterfront keep pushing rooftop, lounge, and destination-dining activity. For buyers, the question is not whether the food scene is more interesting. The question is whether the dining map changes how a residence feels to own Monday through Sunday."
      },
      {
        heading: "CityPlace is becoming a daily-use anchor",
        body: "Eataly's West Palm Beach location gives the Rosemary and CityPlace corridor a food hall, market, restaurants, and gathering space inside the historic Harriet Himmel setting. That matters because it is not only a dinner reservation. It can become coffee, groceries, casual lunches, guests-in-town plans, and a reason to walk instead of drive. Buildings near CityPlace should be compared on the real convenience: door-to-door walking route, garage access, valet friction, and whether the surrounding street life feels useful at the times a buyer will actually be there.",
        imageId: "downtown-dining-eataly-cityplace"
      },
      {
        heading: "NORA makes tenant mix a buyer variable",
        body: "NORA is the district to watch for repeat-use restaurants, fitness, coffee, hospitality, and neighborhood services north of the core. Its official tenant roster shows the mix changing in real time, with some concepts open and others still marked as opening soon. That distinction matters. Buyers should value what they can use today, then treat announced restaurants and future phases as upside that still needs execution."
      },
      {
        heading: "Pizza, Italian, and sushi concepts show depth, not guarantees",
        body: "The broader tenant mix is the useful signal. A district with pizza, Italian, sushi, coffee, bars, and casual repeat-use concepts can support daily life better than one built only around special-occasion dining. Still, buyers should not treat a named tenant as permanent. Restaurant turnover, rent pressure, and phased development are part of South Florida. The stronger question is whether the district has enough variety and foot traffic to remain useful even if individual operators change.",
        imageId: "downtown-dining-pizza-chef"
      },
      {
        heading: "Small-room dining raises the expectation level",
        body: "Sushi counters, tasting menus, and chef-driven rooms are part of the same Downtown story: West Palm Beach is attracting diners who want a more curated night out without crossing the bridge or driving to Miami. That can lift the neighborhood's cultural feel, but buyers should separate dining prestige from ownership basics. A beautiful counter does not solve a weak floor plan, high fees, limited parking, or a building that does not match the way someone wants to live.",
        imageId: "downtown-dining-sushi-counter"
      },
      {
        heading: "Flagler and the waterfront add destination appeal",
        body: "Estiatorio Milos brought Greek seafood to the Flagler waterfront district, while other coastal and Mediterranean concepts add another reason for visitors and locals to spend an evening downtown or along North Flagler. This is good lifestyle context for buyers who entertain often. It is also where details matter: outdoor comfort, shade, valet routes, seasonal crowds, dining prices, and the gap between being near a destination and living directly inside the activity.",
        imageId: "downtown-dining-greek-seafood-terrace"
      },
      {
        heading: "Rooftops make evenings more active",
        body: "Top of the Rox and other rooftop venues give Downtown a more visible night-and-weekend rhythm. That can be a benefit for buyers who want energy, social options, and a city feel. It can be a tradeoff for buyers who want quiet, predictable parking, and a more residential evening environment. When a restaurant or rooftop is part of the buying thesis, visit the area during dinner, late night, and weekend brunch before deciding the lifestyle fits."
      },
      {
        heading: "What to verify before buying for dining access",
        body: "Dining momentum should sharpen the buyer's questions, not replace them.",
        bullets: [
          "Which restaurants are open today, which are opening soon, and which are only reported or previously announced?",
          "What is the actual walking route from the building to CityPlace, NORA, Clematis, Flagler, or the waterfront?",
          "How do valet stands, garages, rideshare zones, and peak dinner traffic affect daily access?",
          "Will night noise, music, rooftop activity, or late brunch crowds matter from the specific line or balcony?",
          "Does the buyer want restaurant energy nearby, or would a quieter Flagler waterfront or Palm Beach-adjacent setting fit better?",
          "How does the building compare on floor plan, views, fees, services, delivery timing, and current availability without relying on restaurant buzz?"
        ]
      },
      {
        heading: "The practical buyer move",
        body: "Treat Downtown dining as one more layer in the comparison. It can make a residence feel more useful, social, and year-round, especially for buyers who want a car-light routine and easy guest entertainment. But it is still only context. The best decision starts with the building and the exact residence, then asks whether the dining map makes that ownership experience better enough to matter."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers compare Downtown buildings by walkability, parking, noise, service model, restaurant access, and current availability.",
    factCheckRequired: [
      "Confirm each restaurant's current open, opening-soon, or announced status before relying on it in a buyer recommendation.",
      "Use restaurant and district sources for dining context only; do not treat them as evidence of property appreciation or resale performance.",
      "Verify building-specific pricing, availability, floor plans, fees, parking, delivery timing, and documents directly before advising a buyer.",
      "Review the area in person at dinner, late-night, weekend brunch, and ordinary weekday times before treating dining access as a lifestyle advantage."
    ],
    seo: {
      primaryQuery: "West Palm Beach dining boom condo buyers",
      secondaryQueries: [
        "Downtown West Palm Beach restaurants",
        "Eataly West Palm Beach CityPlace",
        "NORA West Palm Beach restaurants",
        "Top of the Rox West Palm Beach"
      ],
      suggestedSlug: "west-palm-beach-new-dining-map",
      titleTag: "Downtown WPB Dining and Condo Buyers | Downtown Spotlight",
      metaDescription: "Downtown West Palm Beach dining is changing how buyers compare buildings. See what Eataly, NORA, rooftops, sushi, and waterfront restaurants really mean."
    }
  },
  {
    id: "west-palm-beach-institutional-growth",
    status: "published",
    category: "Downtown Spotlight",
    title: "Downtown WPB's Institutional Wave: What Buyers Should Watch",
    slug: "west-palm-beach-institutional-growth",
    excerpt: "Vanderbilt, NYU Langone, Cleveland Clinic, and 10 and 15 CityPlace are adding a new layer to Downtown West Palm Beach. Buyers should separate near-term access from long-term institutional signals before treating proximity as a premium.",
    buyerThesis: "Institutional growth can make Downtown West Palm Beach feel more complete and year-round, but buyers should evaluate timelines, delivered access, traffic, and project-level fit before relying on the broader momentum story.",
    buyerTakeaway: "Treat Vanderbilt, NYU Langone, and Cleveland Clinic as credibility signals, not automatic value guarantees. Verify what is funded, what is open, what is still contingent, and whether the exact residence benefits from the change.",
    image: {
      path: "/assets/editorial/institutional-cleveland-clinic-campus.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    imageId: "institutional-cleveland-clinic-campus",
    projectIds: [
      "10-cityplace",
      "15-cityplace",
      "nora-house",
      "mr-c",
      "banyan-tree",
      "ritz-carlton-wpb"
    ],
    sourceName: "Reviewed institutional announcements and Downtown development sources",
    sourceLinks: [
      {
        label: "Cleveland Clinic Palm Beach County growth announcement",
        href: "https://newsroom.clevelandclinic.org/2026/02/22/cleveland-clinic-highlights-growth-and-strategic-momentum-in-palm-beach-county",
        sourceType: "brand/developer announcement"
      },
      {
        label: "Related Ross 10 and 15 CityPlace groundbreaking release",
        href: "https://www.relatedross.com/press-releases/2025-03-13/related-ross-breaks-ground-10-and-15-cityplace-west-palm-beach",
        sourceType: "developer press release"
      },
      {
        label: "NYU Langone Julia Koch Family Ambulatory Care Center announcement",
        href: "https://nyulangone.org/news/julia-koch-family-foundation-gives-transformative-75-million-gift-new-state-art-nyu-langone-health-ambulatory-care-center-west-palm-beach",
        sourceType: "brand/developer announcement"
      },
      {
        label: "Vanderbilt West Palm Beach campus overview",
        href: "https://www.vanderbilt.edu/chancellor/initiatives-and-outreach/growth/west-palm-beach/",
        sourceType: "economic development source"
      },
      {
        label: "Vanderbilt West Palm Beach campus fundraising update",
        href: "https://news.vanderbilt.edu/2026/01/12/vanderbilt-surges-forward-with-west-palm-beach-campus-launches-broader-fundraising-effort/",
        sourceType: "economic development source"
      }
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "Downtown is gaining institutional anchors",
        body: "West Palm Beach's luxury story has been led by waterfront condominium towers, Palm Beach adjacency, restaurants, and private-office migration. The next layer is more institutional. Vanderbilt is planning a graduate campus, NYU Langone is expanding ambulatory care, Cleveland Clinic is building a larger downtown healthcare presence, and 10 and 15 CityPlace are adding major office capacity around those uses. For buyers, the signal is not just prestige. It is whether Downtown becomes more useful and resilient year-round."
      },
      {
        heading: "Cleveland Clinic is the biggest healthcare signal",
        body: "Cleveland Clinic's 2026 Palm Beach County update describes a 200-bed West Palm Beach hospital plan, site preparation beginning in 2026, a new outpatient and ambulatory surgery center at 15 CityPlace opening in November 2027, and a hospital target toward the end of 2029. That timing matters. The outpatient center is the earlier downtown access point; the hospital is a later, larger catalyst that still depends on execution, permitting, construction, and philanthropy.",
        imageId: "institutional-cleveland-clinic-campus"
      },
      {
        heading: "10 and 15 CityPlace turn the office story into infrastructure",
        body: "Related Ross broke ground on 10 and 15 CityPlace in March 2025, describing the pair as nearly one million square feet of Class AA office space within its broader downtown portfolio. Cleveland Clinic's lease at 15 CityPlace gives the towers an institutional anchor rather than only a financial-office story. Buyers comparing Downtown and Flagler residences should watch how these buildings affect weekday population, retail demand, traffic patterns, and the daily usefulness of the CityPlace/Rosemary corridor.",
        imageId: "cityplace-institutional-growth-hero"
      },
      {
        heading: "NYU Langone adds a near-term care layer",
        body: "NYU Langone's Julia Koch Family Ambulatory Care Center is planned for 324 Datura Street, with the health system's 2024 announcement describing an eight-story facility, a $75 million gift, room for about 50 physicians, capacity for about 150,000 annual patient visits, and a planned 2026 opening. For residents, this is more immediate than a decade-scale campus thesis: specialty and outpatient care are moving directly into the downtown core.",
        imageId: "institutional-nyu-langone-center"
      },
      {
        heading: "Vanderbilt is the education signal to track carefully",
        body: "Vanderbilt's West Palm Beach plan is a different kind of catalyst. The university describes a planned graduate campus after local government support for seven acres of public land, with academic programming still in development and subject to regulatory approval. The opportunity is a talent pipeline for business, technology, computing, and regional employers. The caution is timing: fundraising, approvals, programming, and construction still need to convert the vision into operating classrooms.",
        imageId: "institutional-vanderbilt-campus"
      },
      {
        heading: "Why this matters to condo buyers",
        body: "Institutional growth can make a city feel less seasonal. Physicians, faculty, graduate students, executives, researchers, patients, staff, and visitors create recurring demand that is different from weekend dining or winter tourism. That can support restaurants, services, rentals, offices, and a fuller downtown schedule. It also gives high-net-worth owners more confidence that healthcare, education, and professional networks are nearby if they spend more of the year in West Palm Beach."
      },
      {
        heading: "The benefits will not arrive all at once",
        body: "The buyer mistake is treating every announcement as a delivered amenity. NYU Langone's ambulatory center is the closest-term downtown healthcare improvement. Cleveland Clinic's 15 CityPlace outpatient center comes next, with the hospital later. Vanderbilt is a major credibility marker, but it remains dependent on regulatory approval, fundraising, programming, and buildout. Meanwhile, 10 and 15 CityPlace will still need tenant absorption, streetscape execution, parking management, and traffic planning to translate into better daily life."
      },
      {
        heading: "Questions to ask before using this as a buying thesis",
        body: "Use institutional momentum as context, then bring the decision back to the building, line, timing, and lifestyle fit.",
        bullets: [
          "Which institutional facilities are open, under construction, approved, funded, or still planned?",
          "How close is the residence to Datura Street, CityPlace, the Clear Lake hospital site, and the planned Vanderbilt campus?",
          "Will weekday office and medical traffic improve the neighborhood's energy, complicate access, or both?",
          "Does the buyer value near-term healthcare access, long-term education momentum, or the broader credibility signal?",
          "Are the projected openings relevant to the buyer's expected hold period?",
          "How does the exact building compare on floor plan, views, fees, delivery risk, parking, and current availability?",
          "Would the residence still make sense if one institutional timeline moved by several years?"
        ]
      },
      {
        heading: "The practical buyer move",
        body: "Track the institutions, but do not buy the headline. A strong Downtown shortlist should compare the buildings that benefit from this momentum with the same discipline used anywhere else: current pricing, active availability, view exposure, walkability, parking, HOA budget, construction timing, and resale competition. Institutional growth is a reason to take Downtown seriously, not a substitute for project-level diligence."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers compare Downtown institutional momentum against actual buildings, floor plans, timelines, pricing, and ownership costs.",
    factCheckRequired: [
      "Verify current opening dates, permits, fundraising status, and facility scope before relying on Cleveland Clinic, NYU Langone, Vanderbilt, or CityPlace timelines.",
      "Separate outpatient healthcare access from later inpatient hospital services; they have different timing and buyer impact.",
      "Confirm project-specific pricing, availability, delivery timing, parking, HOA fees, and documents directly before making a purchase decision.",
      "Treat institutional growth as market context, not as a promise of property appreciation or future resale performance."
    ],
    seo: {
      primaryQuery: "West Palm Beach institutional growth",
      secondaryQueries: [
        "Cleveland Clinic West Palm Beach hospital",
        "NYU Langone West Palm Beach ambulatory care center",
        "Vanderbilt West Palm Beach campus",
        "10 and 15 CityPlace West Palm Beach"
      ],
      suggestedSlug: "west-palm-beach-institutional-growth",
      titleTag: "Downtown WPB Institutional Growth | Downtown Spotlight",
      metaDescription: "Vanderbilt, NYU Langone, Cleveland Clinic, and 10 and 15 CityPlace are reshaping Downtown West Palm Beach. Learn what condo buyers should track."
    }
  },
  {
    id: "nora-district-downtown-transformation",
    status: "published",
    category: "Downtown Spotlight",
    title: "Why the NORA District Could Reshape Downtown West Palm Beach",
    slug: "nora-district-downtown-transformation",
    excerpt: "NORA is more than a restaurant district. Its walkable streets, adaptive reuse, hospitality plans, and housing pipeline could extend Downtown West Palm Beach's center of gravity northward.",
    buyerThesis: "NORA matters because it adds a neighborhood layer to the condo conversation. Buyers should evaluate how the district changes daily life, walkability, nearby demand, and construction-phase tradeoffs before treating proximity as an automatic premium.",
    buyerTakeaway: "Compare NORA proximity as a lifestyle advantage, then verify the practical details: walking route, construction exposure, parking, phase timing, nearby inventory, and whether the district experience fits how you expect to use downtown.",
    image: {
      path: "/assets/editorial/nora-district-aerial-evening-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    imageId: "nora-district-aerial-evening-hero",
    primaryProjectId: "nora-house",
    projectIds: [
      "nora-house",
      "mr-c",
      "banyan-tree",
      "olara",
      "ritz-carlton-wpb"
    ],
    sourceName: "User-provided Buyer Intelligence article brief",
    sourceLinks: [
      {
        label: "NDT Development NORA district overview",
        href: "https://ndtdevelopment.com/west-palm-beach-nora/",
        sourceType: "official project site"
      },
      {
        label: "Florida YIMBY NORA House proposal coverage",
        href: "https://floridayimby.com/2025/08/developers-propose-nora-districts-first-condo-at-1105-n-dixie-highway-west-palm-beach-florida.html",
        sourceType: "development news coverage"
      },
      {
        label: "Palm Beach County Film and Television Commission NORA district overview",
        href: "https://www.pbfilm.com/nora-district",
        sourceType: "local news coverage"
      }
    ],
    datePublished: "2026-06-02",
    dateModified: "2026-06-02",
    sections: [
      {
        heading: "NORA is becoming a district, not a single destination",
        body: "Just north of the downtown core, NORA - short for North Railroad Avenue - is turning a former warehouse corridor into a mixed-use district. The plan combines restored industrial buildings with new construction, restaurants, fitness concepts, creative offices, hospitality, rental housing, and a future for-sale condominium. For buyers, the key point is not one opening or one tenant. It is the possibility that downtown's lifestyle map extends northward as the district matures."
      },
      {
        heading: "Adaptive reuse gives the neighborhood a distinct identity",
        body: "NORA's first phase uses older warehouse buildings as an organizing idea rather than clearing the district for a conventional shopping center. That creates a lower-rise street experience with restaurants, offices, landscaping, and public gathering space. Buyers comparing Downtown, North Flagler, and NORA-adjacent homes should ask whether that neighborhood texture matters more than a direct waterfront setting.",
        imageId: "nora-district-main-street-evening"
      },
      {
        heading: "Walkability is the main buyer thesis",
        body: "The strongest NORA argument is daily-life convenience. A walkable district can make restaurants, fitness, workspaces, and social activity feel like part of the neighborhood rather than a separate drive. That is a different value proposition from Flagler Drive, where water views, marina context, and Palm Beach proximity often lead the decision. Neither is automatically better. They serve different ownership priorities."
      },
      {
        heading: "Future phases could add a built-in customer base",
        body: "The broader plan adds hospitality and residential density over time, including a boutique hotel, rental housing, office space, retail, and NORA House as the district's first for-sale condominium project. More residents, visitors, and employees could strengthen the district's retail ecosystem. Buyers should still separate what is open now from what remains phased, proposed, or subject to change."
      },
      {
        heading: "NORA House makes the district relevant to condo buyers",
        body: "NORA House is the clearest bridge between the district story and the condo search. It introduces a for-sale ownership option inside the neighborhood rather than simply nearby. That makes it useful to compare with Downtown and waterfront alternatives, but buyers should verify the current sales packet, layouts, pricing, deposit structure, delivery assumptions, and the practical effect of ongoing district construction before relying on early summaries.",
        imageId: "nora-district-entry-evening"
      },
      {
        heading: "Nearby buildings may benefit in different ways",
        body: "NORA can matter even for buyers who do not purchase inside the district. Downtown residences may gain another dining and lifestyle anchor. North Flagler buildings may benefit from a stronger nearby amenity base while retaining waterfront positioning. Mr. C and Banyan Tree belong in the broader Downtown comparison, while Olara and Ritz-Carlton remain useful North Flagler contrasts. The right comparison asks how often the buyer expects to use NORA and what tradeoffs they are willing to make for proximity."
      },
      {
        heading: "What could change the outcome",
        body: "District-scale redevelopment carries execution risk. Later phases can move. Tenant mixes can change. Construction can affect traffic, noise, parking, and walkability before the finished vision arrives. Outdoor comfort, shade, seasonal use, and the durability of the retail roster also matter in South Florida. Buyers should value the district as a developing signal, not treat every future phase as guaranteed."
      },
      {
        heading: "Questions to ask before paying for proximity",
        body: "A NORA-adjacent purchase should be evaluated with the same discipline as a building purchase.",
        bullets: [
          "Which NORA phases are open, under construction, approved, or still proposed?",
          "What is the real walking route from the residence to the district?",
          "How could construction affect traffic, noise, views, parking, and daily access?",
          "Which restaurants, offices, hotel components, and residential phases are operating today?",
          "How does the residence compare with Downtown and Flagler alternatives when fees, floor plans, views, and timing are included?",
          "Is the buyer choosing NORA for daily use, future upside, or both?"
        ]
      },
      {
        heading: "The practical buyer move",
        body: "Use NORA as a corridor decision, not as a slogan. Visit at different times of day, walk the route from the buildings you are considering, separate delivered conditions from future plans, and compare the neighborhood experience against Downtown core convenience and Flagler waterfront living. The goal is to understand whether NORA improves the way you would actually live in West Palm Beach."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman can help buyers compare how NORA, Downtown, North Flagler, and South Flagler differ in lifestyle, timing, walkability, and long-term fit.",
    factCheckRequired: [
      "Verify current NORA district phase status, tenant openings, construction timing, and delivered streetscape conditions before relying on a public summary.",
      "Request the current NORA House buyer packet before relying on early residence counts, pricing, amenity, or delivery guidance.",
      "Treat value appreciation and neighborhood-impact discussion as buyer context, not as a promise of future investment performance."
    ],
    seo: {
      primaryQuery: "NORA District West Palm Beach",
      secondaryQueries: [
        "NORA House West Palm Beach",
        "Downtown West Palm Beach condos",
        "West Palm Beach walkable neighborhoods"
      ],
      suggestedSlug: "nora-district-downtown-transformation",
      titleTag: "NORA District's Downtown Impact Explained | Downtown Spotlight",
      metaDescription: "Discover how West Palm Beach's NORA District could transform downtown walkability, lifestyle, and nearby condo decisions - and what buyers should verify."
    }
  },
  {
    id: "are-branded-residences-worth-it-west-palm-beach",
    status: "published",
    category: "Buyer Intelligence",
    title: "Are Branded Residences Worth It? What Buyers Should Know Before Paying the Premium",
    slug: "are-branded-residences-worth-it-west-palm-beach",
    excerpt: "Branded residences can deliver real service value, but the name alone is not enough. Buyers should understand the operating model, fees, brand agreement, and resale logic before paying the premium.",
    buyerThesis: "A branded residence is worth the premium only when the service infrastructure, location, design, governance, and long-term ownership costs work for the buyer independently of the logo.",
    buyerTakeaway: "Ask what the brand actually controls, which services are included, how fees are structured, how long the agreement lasts, and whether the residence would still be compelling without the name.",
    image: {
      path: "/assets/editorial/branded-residences-buyer-review-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    imageId: "branded-residences-buyer-review-hero",
    primaryProjectId: "ritz-carlton-wpb",
    projectIds: [
      "ritz-carlton-wpb",
      "mr-c",
      "mandarin-oriental",
      "banyan-tree",
      "forte-on-flagler",
      "alba-palm-beach"
    ],
    sourceName: "User-provided Buyer Intelligence article brief",
    sourceLinks: [],
    datePublished: "2026-06-02",
    dateModified: "2026-06-02",
    sections: [
      {
        heading: "A sector moving into the mainstream",
        body: "Branded residences are privately owned condominiums marketed under a hotel, hospitality, designer, or other luxury name. What began as a niche category has grown into a global real-estate segment, with South Florida as one of its most active markets. That matters in West Palm Beach because buyers are no longer choosing between a branded building and a generic alternative. They are comparing different forms of branding, different service promises, and strong independent luxury buildings that may offer a similar daily experience without the same premium."
      },
      {
        heading: "What the premium is supposed to buy",
        body: "The core promise is a more consistent, service-led ownership experience. Depending on the building, that can include concierge and front-of-house staffing, valet, security, package handling, housekeeping, maintenance, dining, spa services, fitness programming, owner privileges, digital service platforms, and curated design standards. The useful question is not whether the amenity list sounds impressive. It is which services are included in monthly costs, which are a la carte, and how often the buyer will use them.",
        imageId: "branded-residences-ritz-carlton-exterior"
      },
      {
        heading: "West Palm Beach now offers several branded interpretations",
        body: "The local comparison is becoming more nuanced. Ritz-Carlton Residences brings a hospitality-service frame and owner benefits. Mr. C Residences leans into Cipriani-linked service, dining, and a members-club atmosphere. Mandarin Oriental Residences presents a standalone branded-residence model with resort-style amenities and a strong wellness component. Banyan Tree Residences emphasizes sanctuary, privacy, and restorative living. These projects should not be treated as interchangeable simply because each carries a recognizable name."
      },
      {
        heading: "Brand management, brand licensing, and brand-like luxury are different",
        body: "A buyer should identify the operating structure before comparing premiums. A hotel-managed residence may apply a hospitality operator's staffing and service culture directly to the building. A licensed brand association may provide standards, design guidance, and oversight while day-to-day operations sit elsewhere. Independent luxury buildings can still offer concierge service, thoughtful amenities, and polished ownership without paying for a global badge. Forte on Flagler and Alba Palm Beach are useful non-branded comparisons when a buyer wants to separate service value from name recognition."
      },
      {
        heading: "Pricing premiums are a starting point, not a conclusion",
        body: "Industry research commonly reports a premium for branded residences over comparable non-branded homes, with urban benchmarks often discussed around the 30 percent range. That does not mean every branded condominium deserves the same uplift. The premium should be tested against location, floor plan, terrace usability, view protection, construction quality, reserves, governance, carrying costs, and the depth of future supply. A recognizable brand can support marketing and resale visibility, but it cannot repair a weak residence line or an ownership structure that does not fit the buyer.",
        imageId: "branded-residences-ritz-carlton-arrival"
      },
      {
        heading: "HOA fees and service charges deserve close attention",
        body: "Branded residences often carry higher monthly costs because hotel-style staffing, security, valet, maintenance, and programming must be funded. Buyers should request a complete operating-cost breakdown and separate included services from optional services. Full-time residents may place a high value on daily convenience. Part-time owners may appreciate lock-and-leave ease but should still ask whether they are paying for amenities they will seldom use."
      },
      {
        heading: "The brand agreement is part of the diligence",
        body: "Brand participation is contractual. Management and licensing agreements can expire, change, or fail to renew. Buyers should ask how long the agreement lasts, who controls renewal, what standards the operator must maintain, and what happens to naming rights if the relationship ends. Resale value should be underwritten using the real estate fundamentals as well as the brand halo."
      },
      {
        heading: "Who may benefit most",
        body: "Branded residences can make sense for globally mobile buyers, time-poor professionals, families seeking service integration, part-time owners who value security and maintenance, and buyers drawn to a particular lifestyle philosophy such as wellness or hospitality. Buyers who prefer extensive customization, already have household staff, or do not value brand-driven experiences may find equal or better value in an independent building."
      },
      {
        heading: "A practical branded-residence checklist",
        body: "Before paying a premium, compare the brand promise with the documents, budget, and operating structure.",
        bullets: [
          "Verify the brand-agreement length, termination provisions, and renewal rights.",
          "Clarify whether the property is hotel-operated, licensed, or independently managed.",
          "Review the HOA budget, reserves, insurance, staffing assumptions, and brand-related fees.",
          "Confirm which amenities are residents-only and whether hotel guests or the public share access.",
          "Separate services included in monthly dues from a la carte services and ask for pricing.",
          "Evaluate construction quality and the developer, contractor, and operator histories.",
          "Review rental rules, resale restrictions, design limitations, and renovation standards.",
          "Compare competing branded and non-branded buildings by price per square foot and monthly cost.",
          "Request current buyer materials and calculate long-term ownership costs before relying on marketing."
        ]
      },
      {
        heading: "When the premium makes sense - and when to be careful",
        body: "The premium is easier to justify when the service quality is genuinely useful, the brand has residential operating experience, the site and floor plans are strong independently of the name, and the ongoing costs match the buyer's lifestyle. Be more careful when brand involvement is shallow, service charges are disproportionate, the management agreement is fragile, construction is still early, or nearby supply makes the resale story less distinctive."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman helps buyers compare branded and non-branded West Palm Beach residences with a clear view of what they are actually paying for.",
    factCheckRequired: [
      "Request the current offering documents, HOA budget, service schedule, and brand-agreement details before relying on a public summary.",
      "Verify current amenities, services, fees, availability, pricing, delivery timing, and operating structure directly for each project.",
      "Treat industry premium benchmarks as market context, not as a valuation conclusion for any individual residence."
    ],
    seo: {
      primaryQuery: "are branded residences worth it",
      secondaryQueries: [
        "West Palm Beach branded residences",
        "branded residence premium",
        "Ritz-Carlton Residences West Palm Beach"
      ],
      suggestedSlug: "are-branded-residences-worth-it-west-palm-beach",
      titleTag: "Are Branded Residences Worth It? West Palm Beach Guide",
      metaDescription: "Discover how branded residences work, what services they include, and whether the premium is justified in West Palm Beach's growing luxury market."
    }
  },
  {
    id: "pre-construction-condo-due-diligence",
    status: "published",
    category: "Buyer Intelligence",
    title: "Pre-Construction Condo Due Diligence: What to Review Before Signing",
    slug: "pre-construction-condo-due-diligence",
    excerpt: "A West Palm Beach buyer checklist for reviewing deposits, disclosures, timelines, budgets, financing, and contract flexibility before signing a pre-construction condominium agreement.",
    buyerThesis: "A pre-construction condo contract is not a brochure. Buyers should understand the reservation path, statutory review window, escrow treatment, disclosure package, assignment rights, rental rules, financing risk, and long-term carrying costs before deposit exposure increases.",
    buyerTakeaway: "Before signing, request the full document package, calendar the rescission deadline, confirm the staged deposit schedule, and review the agreement with a Florida real estate attorney and lender.",
    image: {
      path: "/assets/editorial/preconstruction-condo-deposit-schedule-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    imageId: "preconstruction-condo-deposit-schedule-hero",
    projectIds: [
      "olara",
      "ritz-carlton-wpb",
      "shorecrest",
      "south-flagler-house",
      "mr-c",
      "alba-palm-beach"
    ],
    sourceName: "User-provided Buyer Intelligence article brief, checked against Florida condominium statutes and Fannie Mae project guidance",
    sourceLinks: [
      {
        label: "Florida Statute 718.503 developer disclosure and 15-day voidability",
        href: "https://www.flsenate.gov/Laws/Statutes/2025/718.503",
        sourceType: "official legal source"
      },
      {
        label: "Florida Statute 718.202 sales or reservation deposits prior to closing",
        href: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799%2F0718%2FSections%2F0718.202.html",
        sourceType: "official legal source"
      },
      {
        label: "Fannie Mae new and newly converted condo project requirements",
        href: "https://selling-guide.fanniemae.com/sel/b4-2.2-03/full-review-additional-eligibility-requirements-units-new-and-newly-converted-condo-projects",
        sourceType: "financing guideline"
      },
      {
        label: "Fannie Mae Project Eligibility Review Service",
        href: "https://selling-guide.fanniemae.com/sel/b4-2.2-06/project-eligibility-review-service-pers",
        sourceType: "financing guideline"
      }
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "Start by separating a reservation from a purchase contract",
        body: "Pre-construction sales often begin with a reservation agreement that holds a unit or unit line for a limited period. That is different from signing the purchase agreement. The purchase contract locks in the unit, deposit schedule, and many of the rights and obligations that will govern the transaction. In Florida developer sales, buyers generally receive a 15-day voidability window after contract execution and receipt of the required disclosure documents, so the timing and completeness of the document package matter."
      },
      {
        heading: "Map the deposit schedule before liquidity is committed",
        body: "Many West Palm Beach pre-construction projects use staged deposits tied to milestones such as reservation, contract, groundbreaking, topping off, and closing. Florida law requires the first 10 percent of the purchase price to be handled through escrow protections, while additional deposits may be treated differently if the contract and statutory conditions allow it. Buyers should confirm who holds escrow, when funds become non-refundable, whether interest is credited, and under what conditions deposits can be released to the developer."
      },
      {
        heading: "The prospectus is where the binding details live",
        body: "The full disclosure package should be reviewed before the rescission period expires. It can include the declaration, bylaws, articles, rules, budget, floor plans, plot plans, management agreements, lease or ground-lease material if applicable, and reserve or structural-study information. Remote buyers should not rely only on a presentation-room summary because the documents are where rental rules, pet policies, common-area ownership, amendment thresholds, and operating assumptions usually appear.",
        imageId: "preconstruction-condo-document-review"
      },
      {
        heading: "Assignment rights deserve a separate conversation",
        body: "Assignment provisions can vary widely. Some contracts prohibit assignment, some require developer consent and a fee, and others allow transfers to trusts, family entities, or affiliates under limited conditions. Buyers using estate-planning entities or expecting exit flexibility before closing should ask whether assignment is allowed, when consent is required, whether the developer has discretion to deny it, and whether the original buyer remains liable after assignment."
      },
      {
        heading: "Rental rules can change the value of the unit",
        body: "Rental, occupancy, guest, and pet restrictions should be reviewed early. Minimum lease terms, approval requirements, subleasing limits, blackout periods, and municipal short-term-rental rules can affect both investors and personal-use buyers. A building can have strong amenities and still be a poor fit if the declaration does not support the owner's intended use."
      },
      {
        heading: "Construction timing creates contract and financing risk",
        body: "Pre-construction delivery can move because of permitting, labor, materials, financing, weather, and phasing. Buyers should identify the outside date or long-stop date, any delay remedies, the design-selection timeline, upgrade allowances, inspection process, and warranty path. Financing adds another layer because permanent loans are usually evaluated closer to substantial completion, and lender project eligibility can depend on reserves, insurance, completion status, and buyer mix.",
        imageId: "preconstruction-condo-contract-signing"
      },
      {
        heading: "Budget for the closing table and the post-turnover building",
        body: "New-construction closings may include developer fees, title charges, filing charges, documentary stamps, prepaid assessments, and prorated taxes. After closing, monthly assessments can change as the building moves from developer control to owner control. Buyers should review reserve assumptions, insurance exposure, amenity operating costs, ownership of shared facilities, and whether later phases could affect existing owners."
      },
      {
        heading: "Review the sponsor team and the turnover process",
        body: "Developer, contractor, architect, operator, and financing history all affect risk. Buyers should research prior Florida projects, review litigation or delivery history where available, and ask what documents owners receive at turnover. The turnover package can include governing documents, financial records, service contracts, plans, warranties, inspection materials, and structural reserve study information."
      },
      {
        heading: "Buyer checklist before signing",
        body: "Use this list to organize the first diligence pass before deposit exposure grows.",
        bullets: [
          "Reservation terms, refundability, escrow holder, and expiration date.",
          "Staged deposit percentages, release conditions, interest treatment, and wire verification process.",
          "15-day rescission deadline and what could trigger a new review window.",
          "Material adverse change language and buyer remedies.",
          "Assignment rights, consent requirements, transfer fees, and continuing liability.",
          "Rental, occupancy, guest, pet, and house-rule restrictions.",
          "Estimated budget, reserves, insurance, SIRS timing, and post-turnover assessment risk.",
          "Amenity ownership, maintenance responsibility, and future phase cost exposure.",
          "Construction timeline, outside date, delay remedies, design selections, and punch-list process.",
          "Mortgage contingency, project eligibility, rate risk, and lender review timing.",
          "Developer, contractor, architect, operator, and prior-project history."
        ]
      },
      {
        heading: "What to review with counsel",
        body: "A Florida real estate attorney should review the purchase agreement, riders, condominium declaration, bylaws, escrow agreement, prospectus, budget, reserve information, financing contingency, warranty language, dispute-resolution provisions, closing-cost estimate, and any verbal promise that needs to appear in writing. This article is buyer guidance, not legal advice, and the final answer should come from the signed documents and professional review."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman helps West Palm Beach pre-construction buyers organize the right questions, compare projects clearly, and coordinate with legal and financial professionals before signing.",
    factCheckRequired: [
      "Confirm the current signed purchase agreement, prospectus, disclosure package, deposit schedule, and rescission deadline with a Florida real estate attorney.",
      "Verify current Florida condominium law, reserve/SIRS requirements, and lender project-eligibility guidance before relying on this public summary.",
      "Confirm project-specific availability, pricing, fees, incentives, assignment rights, rental rules, delivery timing, and closing costs directly from current buyer materials."
    ],
    seo: {
      primaryQuery: "pre construction condo due diligence",
      secondaryQueries: [
        "West Palm Beach pre construction condo checklist",
        "Florida condo deposit escrow 10 percent",
        "pre construction condo rescission period Florida"
      ],
      suggestedSlug: "pre-construction-condo-due-diligence",
      titleTag: "Pre-Construction Condo Due Diligence | WPB",
      metaDescription: "Review deposits, disclosures, timelines, budgets, financing, assignment rights, and buyer protections before signing a West Palm Beach pre-construction condo contract."
    }
  },
  {
    id: "west-palm-beach-wall-street-south-condos",
    status: "published",
    category: "Buyer Intelligence",
    title: "The Money Is Moving South: How West Palm Beach Became a New Luxury Real Estate Power Center",
    slug: "west-palm-beach-wall-street-south-condos",
    excerpt: "West Palm Beach's Wall Street South momentum is reshaping office demand, Palm Beach adjacency, and the luxury condo pipeline. Buyers should understand what is real, what is still developing, and what to verify before betting on the boom.",
    buyerThesis: "Corporate relocation and Palm Beach wealth are real demand signals, but they do not make every new-construction condo an automatic winner. The better buyer move is to connect office leasing, bridge access, project timing, supply risk, and carrying costs before choosing a building.",
    buyerTakeaway: "Treat Wall Street South as a market tailwind, not a shortcut. Verify which companies are actually leasing nearby, how each condo project is financed and timed, and whether the residence works without assuming future appreciation.",
    image: {
      path: "/assets/editorial/wall-street-south-flagler-drive-hero.jpg",
      credit: "User-provided editorial image, optimized for site use."
    },
    imageId: "wall-street-south-flagler-drive-hero",
    projectIds: [
      "south-flagler-house",
      "ritz-carlton-wpb",
      "olara",
      "shorecrest",
      "mr-c",
      "mandarin-oriental",
      "alba-palm-beach",
      "nora-house"
    ],
    sourceName: "User-provided Buyer Intelligence article brief, checked against current economic-development, market-report, and city development sources",
    sourceLinks: [
      {
        label: "Business Development Board Wall Street South migration overview",
        href: "https://bdb.org/news/wall-street-south-migration-enters-next-wave-of-new-york-to-florida-relocations-2/",
        sourceType: "economic development source"
      },
      {
        label: "Business Development Board financial services profile",
        href: "https://bdb.org/industries/financial-services/",
        sourceType: "economic development source"
      },
      {
        label: "City of West Palm Beach developer outreach presentations",
        href: "https://www.wpb.org/Departments/Development-Services/Developer-Outreach",
        sourceType: "city planning material"
      },
      {
        label: "Cushman & Wakefield Palm Beach office MarketBeat Q4 2025",
        href: "https://assets.cushmanwakefield.com/-/media/cw/marketbeat-pdfs/2025/q4/us-reports/office/palmbeach_americas_marketbeat_office_q42025.pdf?rev=65887a3386794f93a9bd5f4ee6213d6a",
        sourceType: "market report"
      },
      {
        label: "Commercial Observer report on Wells Fargo at One Flagler",
        href: "https://commercialobserver.com/2026/01/wells-fargo-west-palm-one-flagler-stephen-ross-related/",
        sourceType: "development news coverage"
      }
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "Sunshine is no longer the whole story",
        body: "West Palm Beach is attracting spreadsheets as much as sunshine. The Business Development Board has promoted Palm Beach County's Wall Street South migration around more than 250 financial-firm relocations or expansions over the past decade, while the county's finance and wealth ecosystem continues to pull executives closer to Palm Beach clients. For condo buyers, the point is not the nickname. It is whether high-income office demand, family-office activity, and Palm Beach adjacency are changing the depth of the local luxury market."
      },
      {
        heading: "The office signal is strongest at the trophy end",
        body: "The highest-profile demand has clustered around premium downtown office space. One Flagler became the clearest symbol, with finance and wealth-management tenants drawn to a waterfront-adjacent tower near Palm Beach. Wells Fargo's reported 50,000-square-foot wealth-management lease at One Flagler added another headline signal in 2026. Buyers should still separate trophy-building leasing from the broader office market, where newer supply can push vacancy and competition higher even while the best addresses perform.",
        imageId: "wall-street-south-office-arrival"
      },
      {
        heading: "The office pipeline is a demand story and a supply test",
        body: "The city has spent several years tracking major office and mixed-use development through its developer-outreach materials, including projects around Rosemary, Banyan, One Flagler, The Square, and other downtown sites. Cushman & Wakefield's Q4 2025 Palm Beach office report showed the West Palm Beach CBD with substantial space under construction and high Class A asking rents, but also real vacancy to monitor. That combination matters for residential buyers: job growth can support demand, while too much simultaneous delivery can test assumptions."
      },
      {
        heading: "Palm Beach adjacency explains the mainland premium",
        body: "West Palm Beach is not Palm Beach Island, and that difference is exactly why the mainland has become more interesting. Palm Beach remains supply-constrained and extremely expensive. West Palm Beach can offer newer waterfront towers, larger amenity programs, office proximity, and faster access to downtown restaurants while still sitting one bridge from the island. The buyer question is whether that bridge access, water exposure, and newer-building experience justify the premium in a specific line.",
        imageId: "wall-street-south-palm-beach-bridge"
      },
      {
        heading: "The condo pipeline is not one product type",
        body: "The residential response spans several buyer profiles. South Flagler House leans formal, estate-inspired, and highly serviced on the South Flagler waterfront. The Ritz-Carlton Residences and Mr. C introduce different branded-service models. Olara emphasizes amenity depth, marina context, and a larger wellness-and-leisure program. Shorecrest adds another North Flagler waterfront option that still deserves current packet verification. Mandarin Oriental, Alba, NORA House, and other pipeline or active projects broaden the comparison beyond one corridor."
      },
      {
        heading: "Hospitality and mixed-use projects make the city feel more complete",
        body: "The Wall Street South thesis is not only about office leases. Hotels, restaurants, district retail, rooftop bars, conference activity, and mixed-use projects can make West Palm Beach feel more like a year-round live-work-play market. That matters for part-time buyers who want services and energy when they arrive, and for full-time buyers who want the city to function beyond season. The diligence question is which pieces are open now, under construction, approved, or still aspirational."
      },
      {
        heading: "The risks are real enough to underwrite",
        body: "A strong migration story does not remove market cycles. Buyers should watch office absorption, interest rates, construction financing, insurance costs, HOA budgets, climate-resiliency expenses, and the amount of luxury inventory delivering in the same window. Several towers have multi-year delivery timelines, which means deposits, rates, and personal liquidity need to be tested against a future closing environment rather than today's headline momentum."
      },
      {
        heading: "Questions buyers should ask",
        body: "Use the corporate-migration story as context, then bring the decision back to project-level diligence.",
        bullets: [
          "Which financial, technology, or corporate tenants are actually leasing near the building, and are those leases long-term?",
          "How much new office and residential supply is scheduled to deliver before or near the condo's closing date?",
          "How does the residence compare with Palm Beach and Miami alternatives by price per square foot, fees, view quality, and service model?",
          "What is the project deposit schedule, outside date, construction financing posture, and cancellation language?",
          "What are the projected HOA fees, reserve assumptions, insurance requirements, and likely post-turnover obligations?",
          "Would the exact residence still make sense if the Wall Street South story cooled for a few years?"
        ]
      },
      {
        heading: "The practical buyer move",
        body: "Wall Street South can be a useful tailwind, especially for buyers who want Palm Beach proximity with newer mainland inventory. But the final decision should still be line-specific and document-specific. Compare the project, floor plan, exposure, bridge access, service model, budget, delivery timing, and resale competition before treating the migration story as proof of future value."
      }
    ],
    ctaText: "The Scott Gordon Group at Douglas Elliman helps buyers compare West Palm Beach's Wall Street South momentum against actual project documents, pricing, floor plans, timelines, and long-term ownership costs.",
    factCheckRequired: [
      "Verify current office leasing, corporate relocation, and tenant information before relying on public migration claims.",
      "Refresh city development pipeline, office vacancy, and Class A rent data before making market-timing conclusions.",
      "Confirm project-specific pricing, availability, delivery timing, fees, financing, and contract terms directly from current buyer materials."
    ],
    seo: {
      primaryQuery: "West Palm Beach Wall Street South condos",
      secondaryQueries: [
        "West Palm Beach luxury real estate finance migration",
        "Wall Street South West Palm Beach",
        "West Palm Beach new construction condos Palm Beach"
      ],
      suggestedSlug: "west-palm-beach-wall-street-south-condos",
      titleTag: "West Palm Beach Wall Street South Condo Insight",
      metaDescription: "West Palm Beach is drawing finance, wealth, and new luxury condo development. Learn what Wall Street South means for buyers and what to verify."
    }
  },
  {
    id: "active-sales-vs-pipeline-watch",
    status: "published",
    category: "Buyer Education",
    title: "Active Sales vs Pipeline Watch: How to Read the West Palm Beach Condo Market",
    slug: "active-sales-vs-pipeline-watch",
    excerpt: "A buyer-friendly way to separate buildings you can underwrite now from pipeline projects that may matter later.",
    buyerThesis: "The cleanest West Palm Beach search starts by separating active sales from early-stage projects to monitor. They answer different buyer questions and should not be compared as if they carry the same certainty.",
    buyerTakeaway: "Use active-sales projects for current decisions, and use pipeline projects to understand future supply pressure. Do not treat early-stage concepts as current purchase options until pricing, plans, timing, and buyer packets are available.",
    imageId: "wpb-geography-map-hero",
    projectIds: [
      "olara",
      "ritz-carlton-wpb",
      "shorecrest",
      "nora-house",
      "banyan-tree",
      "rosewood"
    ],
    sourceName: "WPB New Construction source review",
    sourceLinks: [
      {
        label: "WPB New Construction updates",
        href: "/updates/",
        sourceType: "development news coverage"
      }
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "Why the distinction matters",
        body: "Active-sales buildings give a buyer something practical to verify: available lines, floor plans, deposits, delivery assumptions, parking, fees, and contract language. Pipeline projects are useful, but mostly as context. They can explain where supply may be headed, which corridors are attracting capital, and why a current building may or may not hold pricing power."
      },
      {
        heading: "What belongs in the active-sales bucket",
        body: "A building belongs in the active-sales bucket when a buyer can request current availability, review plan depth, and compare the project against real timing and contract questions. Olara, Ritz-Carlton, Shorecrest, South Flagler House, Mr. C, Alba, and similar public-sales projects should still be verified, but they offer more decision-grade material than early concepts."
      },
      {
        heading: "What belongs in the pipeline-watch bucket",
        body: "Pipeline-watch projects can include planning-stage branded residences, district redevelopment items, office or mixed-use catalysts, and sites with limited public detail. They matter because they shape the buyer map, not because they can be compared line by line today."
      },
      {
        heading: "The practical buyer move",
        body: "Built for comparison, not brochure fog. Start with what can actually be verified now, then use the pipeline to understand where the corridor may be in two to four years. That keeps you from chasing concepts when a current building may already solve the search."
      }
    ],
    ctaText: "Want help applying this to your search? Request current availability and private comparison notes.",
    factCheckRequired: [
      "Refresh current active-sales and planning status before treating a project as decision-grade.",
      "Confirm pricing, availability, and delivery timing directly before making a decision."
    ],
    seo: {
      primaryQuery: "West Palm Beach new construction condos",
      secondaryQueries: [
        "West Palm Beach pre-construction condos",
        "Downtown West Palm Beach condos"
      ],
      suggestedSlug: "active-sales-vs-pipeline-watch",
      titleTag: "Active Sales vs Pipeline Watch | WPB New Construction",
      metaDescription: "How West Palm Beach condo buyers can separate active sales from pipeline watch projects before comparing pricing, floor plans, and timing."
    }
  },
  {
    id: "olara-vs-shorecrest",
    status: "published",
    category: "Building Comparisons",
    title: "Olara vs Shorecrest: Two Different Waterfront Buyer Profiles",
    slug: "olara-vs-shorecrest-waterfront-buyer-profiles",
    excerpt: "Both sit in the North Flagler waterfront conversation, but they should not be evaluated as interchangeable tower choices.",
    buyerThesis: "Olara and Shorecrest both belong in the North Flagler comparison set, but the buyer profile is different. The better shortlist asks what kind of waterfront ownership you want before treating price or delivery as the only filter.",
    buyerTakeaway: "Ask for current availability, floor-plan depth, view-stack context, amenity details, and delivery assumptions for both. The decision is not simply which tower is newer or closer; it is which operating model fits the way you want to live.",
    imageId: "flagler-waterfront-corridor",
    primaryProjectId: "shorecrest",
    projectIds: [
      "olara",
      "shorecrest",
      "ritz-carlton-wpb"
    ],
    sourceName: "Reviewed project materials and public updates",
    sourceLinks: [
      {
        label: "Market updates",
        href: "/updates/",
        sourceType: "development news coverage"
      }
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "The shared North Flagler frame",
        body: "Both buildings sit inside the same waterfront conversation: Intracoastal exposure, Palm Beach proximity, large amenity programs, and a growing cluster of luxury condominium inventory. That shared context is useful, but it can hide the real buyer questions."
      },
      {
        heading: "Olara tends to reward amenity-depth buyers",
        body: "Olara is useful for buyers who want a deeper public packet, a large amenity story, marina context, and more material to compare before touring. That does not make it automatically better; it means the diligence path can start with more visible pieces."
      },
      {
        heading: "Shorecrest needs careful current verification",
        body: "Shorecrest is important because it adds another active North Flagler waterfront option, but buyers should preserve details to verify and verify residence counts, available lines, pricing guidance, and construction timing before relying on broad summaries."
      },
      {
        heading: "How to compare without getting lost",
        body: "Compare the same facts across both buildings: available lines, floor height, view exposure, terrace usability, fees, parking, storage, amenity access, deposit structure, and delivery risk. Anything else is brochure fog."
      }
    ],
    ctaText: "Want help applying this to your search? Request current availability and private comparison notes.",
    factCheckRequired: [
      "Confirm current Shorecrest residence count and construction status before publication updates.",
      "Confirm current Olara and Shorecrest pricing and availability before making a decision."
    ],
    seo: {
      primaryQuery: "Olara vs Shorecrest West Palm Beach",
      secondaryQueries: [
        "North Flagler waterfront condos",
        "West Palm Beach waterfront condos"
      ],
      suggestedSlug: "olara-vs-shorecrest-waterfront-buyer-profiles",
      titleTag: "Olara vs Shorecrest | WPB Guidance",
      metaDescription: "Buyer-focused comparison notes for Olara and Shorecrest on North Flagler, including floor plans, timing, amenities, and verification steps."
    }
  },
  {
    id: "why-published-floor-plans-matter",
    status: "published",
    category: "Floor Plan Notes",
    title: "Why Published Floor Plans Matter Before You Tour",
    slug: "why-published-floor-plans-matter",
    excerpt: "Floor plans are not just pretty PDFs. They tell you whether a building can solve your life before you spend time in a presentation room.",
    buyerThesis: "Published floor plans let a buyer compare function before emotion takes over. They reveal the difference between real fit and marketing momentum.",
    buyerTakeaway: "Before touring, ask for current floor plans, stack plans, dimensions, terrace depth, exposure, ceiling heights where available, and any line-specific limitations.",
    primaryProjectId: "mr-c",
    projectIds: [
      "olara",
      "ritz-carlton-wpb",
      "shorecrest",
      "south-flagler-house"
    ],
    sourceName: "WPB New Construction floor-plan library",
    sourceLinks: [
      {
        label: "Floor plan library",
        href: "/floorplans/",
        sourceType: "official project site"
      }
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "Plans expose the daily-life problem",
        body: "A residence can photograph beautifully and still fail the basic living test. Floor plans show entry sequence, kitchen relationship, bedroom separation, storage, terrace access, den usefulness, and whether the primary rooms actually face the view you care about."
      },
      {
        heading: "Released plans create a fair comparison",
        body: "When one building has dozens of released plans and another requires a private packet, that does not automatically decide the search. It does tell you where diligence is easier and where Brooke should request more current material before you tour."
      },
      {
        heading: "The missing piece is the stack plan",
        body: "A floor plan shows layout; a stack plan shows position. Buyers need both. The same plan can feel different by floor, exposure, neighboring tower position, balcony depth, and future view risk."
      },
      {
        heading: "Use plans to shorten the tour list",
        body: "The best use of a plan library is not endless browsing. It is removing bad fits early, then asking for current availability only on the lines that actually support the buyer's life."
      }
    ],
    ctaText: "Want help applying this to your search? Request current availability and private comparison notes.",
    factCheckRequired: [
      "Confirm current floor-plan packet availability for each building.",
      "Do not imply a public plan is currently available for purchase without availability confirmation."
    ],
    seo: {
      primaryQuery: "West Palm Beach condo floor plans",
      secondaryQueries: [
        "West Palm Beach new construction floor plans",
        "condo stack plans West Palm Beach"
      ],
      suggestedSlug: "why-published-floor-plans-matter",
      titleTag: "Why Published Floor Plans Matter | WPB",
      metaDescription: "Why West Palm Beach condo buyers should review floor plans and stack plans before touring new-construction condos."
    }
  },
  {
    id: "verify-new-construction-pricing",
    status: "published",
    category: "Buyer Education",
    title: "What Buyers Should Verify Before Trusting New Construction Pricing",
    slug: "what-buyers-should-verify-before-trusting-pricing",
    excerpt: "Published price ranges are only the opening frame. The useful number is line-specific, date-specific, and tied to real terms.",
    buyerThesis: "New-construction pricing changes too quickly to treat public ranges as a decision. A serious comparison verifies the actual line, floor, exposure, incentives, fees, and contract assumptions.",
    buyerTakeaway: "Use public pricing as a signal, not a promise. Ask Brooke to verify the current sheet before comparing buildings or scheduling tours around old numbers.",
    primaryProjectId: "ritz-carlton-wpb",
    projectIds: [
      "olara",
      "ritz-carlton-wpb",
      "shorecrest",
      "mr-c",
      "south-flagler-house"
    ],
    sourceName: "WPB New Construction pricing review method",
    sourceLinks: [
      {
        label: "How we verify",
        href: "/methodology/",
        sourceType: "city planning material"
      }
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "A range is not an offer",
        body: "A public 'from' price can help you understand the entry point, but it rarely tells you the residence line, floor, exposure, parking, deposit schedule, upgrade assumptions, or whether the relevant unit is still available."
      },
      {
        heading: "Incentives can change the real comparison",
        body: "Two buildings with similar public pricing can behave differently once incentives, closing credits, deposit timing, decorator allowances, parking, storage, and maintenance assumptions enter the conversation. Those details need current written confirmation."
      },
      {
        heading: "Delivery timing has economic value",
        body: "A 2027 delivery and a later pipeline project do not carry the same risk profile. Buyers should compare timing, walk-through process, financing assumptions, and what happens if construction or closing windows move."
      },
      {
        heading: "The verification checklist",
        body: "Ask for current availability, line-specific pricing, floor plan, stack plan, fees, parking, storage, incentives, deposit schedule, cancellation language, delivery assumptions, and the required condominium disclosure package."
      }
    ],
    ctaText: "Want help applying this to your search? Request current availability and private comparison notes.",
    factCheckRequired: [
      "Current pricing and incentives must be verified directly before making a decision.",
      "Avoid quoting older public pricing without date and source context."
    ],
    seo: {
      primaryQuery: "West Palm Beach condo availability",
      secondaryQueries: [
        "West Palm Beach condo pricing",
        "West Palm Beach new construction condos"
      ],
      suggestedSlug: "what-buyers-should-verify-before-trusting-pricing",
      titleTag: "Verify New Construction Pricing | WPB",
      metaDescription: "A practical buyer checklist for verifying West Palm Beach new-construction condo pricing, incentives, fees, delivery, and availability."
    }
  },
  {
    id: "downtown-condo-corridors-explained",
    status: "published",
    category: "Neighborhood Guides",
    title: "Downtown West Palm Beach Condo Corridors Explained",
    slug: "downtown-west-palm-beach-condo-corridors-explained",
    excerpt: "Downtown is not one single market. North Flagler, the core, The Square/Rosemary, and NORA each answer a different lifestyle question.",
    buyerThesis: "The downtown West Palm Beach condo search gets clearer when you pick the corridor first. Each area has a different rhythm, buyer profile, and diligence path.",
    buyerTakeaway: "Decide whether your first priority is waterfront calm, walkable restaurants, retail/dining energy, or growth-district upside. Then compare buildings inside that lane before jumping citywide.",
    imageId: "kravis-center-downtown-attraction",
    projectIds: [
      "nora-house",
      "mr-c",
      "banyan-tree",
      "10-cityplace",
      "15-cityplace",
      "olara"
    ],
    sourceName: "WPB New Construction corridor review",
    sourceLinks: [
      {
        label: "Market map",
        href: "/#atlas",
        sourceType: "development news coverage"
      }
    ],
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    sections: [
      {
        heading: "North Flagler is the waterfront decision set",
        body: "North Flagler is where buyers compare Intracoastal exposure, Palm Beach views across the water, amenity scale, marina context, and newer waterfront inventory. It is not the same lifestyle as being in the downtown restaurant core."
      },
      {
        heading: "Downtown core is the walkability decision",
        body: "The core is about restaurants, offices, Brightline access, cultural venues, hotels, and daily convenience. Buyers here should ask how often they want to use a car and whether energy matters more than a quieter waterfront arrival."
      },
      {
        heading: "The Square and Rosemary are lifestyle connectors",
        body: "The Square and Rosemary corridor connect dining, retail, hotel, office, and residential demand. They can be useful for buyers who want polished walkability but still need to understand how nearby development affects daily life."
      },
      {
        heading: "NORA is the growth corridor",
        body: "NORA is more about trajectory. It brings adaptive reuse, dining, retail, and new residential energy into a district that is still forming. Buyers should verify timing, parking, exposure, and how construction-phase friction may affect ownership."
      }
    ],
    ctaText: "Want help applying this to your search? Request current availability and private comparison notes.",
    factCheckRequired: [
      "Refresh district project status and construction impacts before relying on corridor guidance.",
      "Do not imply any specific current availability without buyer-packet confirmation."
    ],
    seo: {
      primaryQuery: "Downtown West Palm Beach condos",
      secondaryQueries: [
        "West Palm Beach condo corridors",
        "NORA District condos",
        "North Flagler condos"
      ],
      suggestedSlug: "downtown-west-palm-beach-condo-corridors-explained",
      titleTag: "Downtown WPB Condo Corridors Explained",
      metaDescription: "A buyer guide to Downtown West Palm Beach condo corridors, including North Flagler, the core, The Square/Rosemary, and NORA."
    }
  }
] as const satisfies readonly MarketNote[];
