export type MarketNoteStatus =
  | "draft"
  | "ready-for-review"
  | "published"
  | "needs-refresh";

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

export type MarketNote = {
  id: string;
  status: MarketNoteStatus;
  category: string;
  title: string;
  summary: string;
  buyerAngle: string;
  projectIds: string[];
  sourceName: string;
  sourceLinks: MarketNoteSource[];
  datePublished: string;
  dateModified: string;
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
    id: "mandarin-oriental-interiors-revealed",
    status: "ready-for-review",
    category: "North Flagler",
    title:
      "Mandarin Oriental interiors move the North Flagler comparison beyond skyline renderings",
    summary:
      "Recent reporting highlighted first interior renderings for Mandarin Oriental Residences, West Palm Beach.",
    buyerAngle:
      "Treat the new imagery as finish and service-positioning context, then compare it against current packet depth, timing, and view-stack evidence for Olara, Ritz-Carlton, Shorecrest, and other North Flagler options.",
    projectIds: ["mandarin-oriental", "olara", "ritz-carlton-wpb"],
    sourceName: "Florida YIMBY",
    sourceLinks: [
      {
        label: "Florida YIMBY Mandarin Oriental interior rendering coverage",
        href: "https://floridayimby.com/2026/05/first-interior-renderings-revealed-for-mandarin-oriental-residences-west-palm-beach.html",
        sourceType: "development news coverage",
      },
      {
        label: "Mandarin Oriental Residences, West Palm Beach",
        href: "https://mandarinorientalwestpalmbeach.com/",
        sourceType: "official project site",
      },
    ],
    datePublished: "2026-05-18",
    dateModified: "2026-05-22",
    factCheckRequired: [
      "Confirm any residence count, delivery timing, pricing, or current sales-office details before publication.",
      "Use only authorized or user-provided imagery if this becomes a public article.",
    ],
    seo: {
      primaryQuery: "Mandarin Oriental West Palm Beach interiors",
      secondaryQueries: [
        "North Flagler condos",
        "West Palm Beach branded residences",
      ],
      suggestedSlug: "mandarin-oriental-interiors-north-flagler",
      titleTag: "Mandarin Oriental Interiors | WPB New Construction",
      metaDescription:
        "Buyer-focused context on Mandarin Oriental interior renderings and the North Flagler new-construction condo comparison.",
    },
  },
  {
    id: "rosewood-north-flagler-planning",
    status: "needs-refresh",
    category: "North Flagler",
    title: "Rosewood planning notes add another branded watch item to North Flagler",
    summary:
      "Planning-oriented research points to Rosewood as a North Flagler branded-residence watch item, with details still early-stage.",
    buyerAngle:
      "Keep Rosewood in the pipeline watchlist, but do not compare it as a current purchase option until public plan, pricing, timing, and sales materials are stronger.",
    projectIds: ["rosewood", "ritz-carlton-wpb", "mandarin-oriental"],
    sourceName: "West Palm Beach planning materials",
    sourceLinks: [
      {
        label: "West Palm Beach planning materials reviewed",
        href: "https://www.wpb.org/",
        sourceType: "city planning material",
      },
    ],
    datePublished: "2026-05-19",
    dateModified: "2026-05-22",
    factCheckRequired: [
      "Refresh city record links before publication because this note currently points to the general city site.",
      "Do not publish residence counts, pricing, team details, delivery timing, or amenity claims without project-specific source evidence.",
    ],
    seo: {
      primaryQuery: "Rosewood Residences West Palm Beach",
      secondaryQueries: [
        "North Flagler development pipeline",
        "West Palm Beach branded residences",
      ],
      suggestedSlug: "rosewood-north-flagler-planning-watch",
      titleTag: "Rosewood North Flagler Planning Watch | WPB",
      metaDescription:
        "Conservative buyer context on Rosewood as a North Flagler watch item, pending stronger public project details.",
    },
  },
  {
    id: "nora-house-local-coverage",
    status: "ready-for-review",
    category: "Downtown",
    title: "NORA House keeps Downtown's ownership story in the local news cycle",
    summary:
      "Local coverage continues to frame NORA House as a for-sale residential anchor inside the growing NORA district.",
    buyerAngle:
      "Use the update to explain how NORA shifts from a dining and retail district story into a downtown ownership comparison, while telling buyers to verify timing, parking, exposure, and active district conditions.",
    projectIds: ["nora-house", "mr-c", "banyan-tree"],
    sourceName: "WFLX and World Red Eye",
    sourceLinks: [
      {
        label: "WFLX NORA House local coverage",
        href: "https://www.wflx.com/2026/04/10/empty-lots-luxury-living-multimillion-dollar-condos-coming-west-palm-beachs-growing-nora-district/",
        sourceType: "local news coverage",
      },
      {
        label: "World Red Eye NORA House district coverage",
        href: "https://worldredeye.com/2026/03/wre-news-nora-house-anchors-residential-expansion-in-west-palm-beachs-nora-district/",
        sourceType: "development news coverage",
      },
      {
        label: "NORA House",
        href: "https://norahouse.com/",
        sourceType: "official project site",
      },
    ],
    datePublished: "2026-04-10",
    dateModified: "2026-05-22",
    factCheckRequired: [
      "Verify current floorplan, pricing, and delivery details directly before turning this into a live article.",
      "Keep district claims limited to sourced NORA House and district coverage.",
    ],
    seo: {
      primaryQuery: "NORA House West Palm Beach",
      secondaryQueries: [
        "NORA District condos",
        "Downtown West Palm Beach new construction",
      ],
      suggestedSlug: "nora-house-downtown-ownership-update",
      titleTag: "NORA House Downtown Ownership Update | WPB",
      metaDescription:
        "How NORA House changes the downtown West Palm Beach ownership conversation, with buyer checks before relying on details.",
    },
  },
  {
    id: "shorecrest-construction-loan",
    status: "ready-for-review",
    category: "North Flagler",
    title: "Shorecrest financing pushes the North Flagler cluster toward construction",
    summary:
      "Related Ross announced a construction loan for Shorecrest, adding momentum to the North Flagler waterfront comparison set.",
    buyerAngle:
      "Frame Shorecrest as a more active North Flagler watch item, while preserving the existing source conflict around residence count and avoiding any live availability claims.",
    projectIds: ["shorecrest", "olara", "ritz-carlton-wpb"],
    sourceName: "Related Ross press release",
    sourceLinks: [
      {
        label: "Related Ross Shorecrest financing announcement",
        href: "https://www.relatedross.com/press-releases/2026-02-18/related-ross-secures-157-million-construction-loan-shorecrest-west-palm",
        sourceType: "developer press release",
      },
      {
        label: "Related Ross Shorecrest property page",
        href: "https://www.relatedross.com/our-company/properties/shorecrest",
        sourceType: "official project site",
      },
      {
        label: "Shorecrest",
        href: "https://www.shorecrestwpb.com/",
        sourceType: "official project site",
      },
    ],
    datePublished: "2026-02-18",
    dateModified: "2026-05-18",
    factCheckRequired: [
      "Preserve the 98 versus 100 residence-count conflict unless a current source resolves it.",
      "Confirm construction status, current pricing, and availability before public use.",
    ],
    seo: {
      primaryQuery: "Shorecrest West Palm Beach construction loan",
      secondaryQueries: [
        "Shorecrest West Palm Beach",
        "North Flagler waterfront condos",
      ],
      suggestedSlug: "shorecrest-construction-loan-north-flagler",
      titleTag: "Shorecrest Construction Loan | WPB New Construction",
      metaDescription:
        "Buyer context on Shorecrest financing and what it means for the North Flagler waterfront condo comparison.",
    },
  },
  {
    id: "banyan-tree-sales-launch",
    status: "ready-for-review",
    category: "Downtown",
    title: "Banyan Tree adds another branded-residence option downtown",
    summary:
      "Banyan Group announced Banyan Tree Residences West Palm Beach, adding another branded-residence entry to the downtown buyer map.",
    buyerAngle:
      "Use the story to compare downtown brand positioning against Mr. C and NORA House, with careful verification of current pricing, residence count, and buyer-packet details before publication.",
    projectIds: ["banyan-tree", "mr-c", "nora-house"],
    sourceName: "PR Newswire and official Banyan Tree site",
    sourceLinks: [
      {
        label: "Banyan Group sales launch announcement",
        href: "https://www.prnewswire.com/news-releases/banyan-group-enters-the-united-states-with-banyan-tree-residences-west-palm-beach-302723150.html",
        sourceType: "brand/developer announcement",
      },
      {
        label: "Banyan Tree Residences West Palm Beach",
        href: "https://www.banyantreeresidenceswpb.com/",
        sourceType: "official project site",
      },
    ],
    datePublished: "2026-03-24",
    dateModified: "2026-05-16",
    factCheckRequired: [
      "Refresh current buyer-packet details before relying on residence count, pricing, or inquiry language.",
      "Avoid repeating announcement copy; recast the angle around buyer comparison.",
    ],
    seo: {
      primaryQuery: "Banyan Tree Residences West Palm Beach",
      secondaryQueries: [
        "Downtown West Palm Beach condos",
        "West Palm Beach branded residences",
      ],
      suggestedSlug: "banyan-tree-downtown-branded-residences",
      titleTag: "Banyan Tree Residences WPB | Buyer Context",
      metaDescription:
        "Buyer-focused context on Banyan Tree Residences and how it fits the downtown West Palm Beach condo comparison.",
    },
  },
] as const satisfies readonly MarketNote[];
