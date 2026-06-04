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
    id: "west-palm-beach-institutional-growth",
    status: "published",
    category: "Downtown Spotlight",
    title: "Downtown WPB's Institutional Wave: What Buyers Should Watch",
    slug: "west-palm-beach-institutional-growth",
    excerpt:
      "Vanderbilt, NYU Langone, Cleveland Clinic, and 10 and 15 CityPlace are adding a new layer to Downtown West Palm Beach. Buyers should separate near-term access from long-term institutional signals before treating proximity as a premium.",
    buyerThesis:
      "Institutional growth can make Downtown West Palm Beach feel more complete and year-round, but buyers should evaluate timelines, delivered access, traffic, and project-level fit before relying on the broader momentum story.",
    buyerTakeaway:
      "Treat Vanderbilt, NYU Langone, and Cleveland Clinic as credibility signals, not automatic value guarantees. Verify what is funded, what is open, what is still contingent, and whether the exact residence benefits from the change.",
    image: {
      path: "/assets/editorial/institutional-cleveland-clinic-campus.jpg",
      credit: "User-provided editorial image, optimized for site use.",
    },
    imageId: "institutional-cleveland-clinic-campus",
    projectIds: ["10-cityplace", "15-cityplace", "nora-house", "mr-c", "banyan-tree", "ritz-carlton-wpb"],
    sourceName: "Reviewed institutional announcements and Downtown development sources",
    sourceLinks: [
      {
        label: "Cleveland Clinic Palm Beach County growth announcement",
        href: "https://newsroom.clevelandclinic.org/2026/02/22/cleveland-clinic-highlights-growth-and-strategic-momentum-in-palm-beach-county",
        sourceType: "brand/developer announcement",
      },
      {
        label: "Related Ross 10 and 15 CityPlace groundbreaking release",
        href: "https://www.relatedross.com/press-releases/2025-03-13/related-ross-breaks-ground-10-and-15-cityplace-west-palm-beach",
        sourceType: "developer press release",
      },
      {
        label: "NYU Langone Julia Koch Family Ambulatory Care Center announcement",
        href: "https://nyulangone.org/news/julia-koch-family-foundation-gives-transformative-75-million-gift-new-state-art-nyu-langone-health-ambulatory-care-center-west-palm-beach",
        sourceType: "brand/developer announcement",
      },
      {
        label: "Vanderbilt West Palm Beach campus overview",
        href: "https://www.vanderbilt.edu/chancellor/initiatives-and-outreach/growth/west-palm-beach/",
        sourceType: "economic development source",
      },
      {
        label: "Vanderbilt West Palm Beach campus fundraising update",
        href: "https://news.vanderbilt.edu/2026/01/12/vanderbilt-surges-forward-with-west-palm-beach-campus-launches-broader-fundraising-effort/",
        sourceType: "economic development source",
      },
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "Downtown is gaining institutional anchors",
        body:
          "West Palm Beach's luxury story has been led by waterfront condominium towers, Palm Beach adjacency, restaurants, and private-office migration. The next layer is more institutional. Vanderbilt is planning a graduate campus, NYU Langone is expanding ambulatory care, Cleveland Clinic is building a larger downtown healthcare presence, and 10 and 15 CityPlace are adding major office capacity around those uses. For buyers, the signal is not just prestige. It is whether Downtown becomes more useful and resilient year-round.",
      },
      {
        heading: "Cleveland Clinic is the biggest healthcare signal",
        body:
          "Cleveland Clinic's 2026 Palm Beach County update describes a 200-bed West Palm Beach hospital plan, site preparation beginning in 2026, a new outpatient and ambulatory surgery center at 15 CityPlace opening in November 2027, and a hospital target toward the end of 2029. That timing matters. The outpatient center is the earlier downtown access point; the hospital is a later, larger catalyst that still depends on execution, permitting, construction, and philanthropy.",
        imageId: "institutional-cleveland-clinic-campus",
      },
      {
        heading: "10 and 15 CityPlace turn the office story into infrastructure",
        body:
          "Related Ross broke ground on 10 and 15 CityPlace in March 2025, describing the pair as nearly one million square feet of Class AA office space within its broader downtown portfolio. Cleveland Clinic's lease at 15 CityPlace gives the towers an institutional anchor rather than only a financial-office story. Buyers comparing Downtown and Flagler residences should watch how these buildings affect weekday population, retail demand, traffic patterns, and the daily usefulness of the CityPlace/Rosemary corridor.",
        imageId: "cityplace-institutional-growth-hero",
      },
      {
        heading: "NYU Langone adds a near-term care layer",
        body:
          "NYU Langone's Julia Koch Family Ambulatory Care Center is planned for 324 Datura Street, with the health system's 2024 announcement describing an eight-story facility, a $75 million gift, room for about 50 physicians, capacity for about 150,000 annual patient visits, and a planned 2026 opening. For residents, this is more immediate than a decade-scale campus thesis: specialty and outpatient care are moving directly into the downtown core.",
        imageId: "institutional-nyu-langone-center",
      },
      {
        heading: "Vanderbilt is the education signal to track carefully",
        body:
          "Vanderbilt's West Palm Beach plan is a different kind of catalyst. The university describes a planned graduate campus after local government support for seven acres of public land, with academic programming still in development and subject to regulatory approval. The opportunity is a talent pipeline for business, technology, computing, and regional employers. The caution is timing: fundraising, approvals, programming, and construction still need to convert the vision into operating classrooms.",
        imageId: "institutional-vanderbilt-campus",
      },
      {
        heading: "Why this matters to condo buyers",
        body:
          "Institutional growth can make a city feel less seasonal. Physicians, faculty, graduate students, executives, researchers, patients, staff, and visitors create recurring demand that is different from weekend dining or winter tourism. That can support restaurants, services, rentals, offices, and a fuller downtown schedule. It also gives high-net-worth owners more confidence that healthcare, education, and professional networks are nearby if they spend more of the year in West Palm Beach.",
      },
      {
        heading: "The benefits will not arrive all at once",
        body:
          "The buyer mistake is treating every announcement as a delivered amenity. NYU Langone's ambulatory center is the closest-term downtown healthcare improvement. Cleveland Clinic's 15 CityPlace outpatient center comes next, with the hospital later. Vanderbilt is a major credibility marker, but it remains dependent on regulatory approval, fundraising, programming, and buildout. Meanwhile, 10 and 15 CityPlace will still need tenant absorption, streetscape execution, parking management, and traffic planning to translate into better daily life.",
      },
      {
        heading: "Questions to ask before using this as a buying thesis",
        body:
          "Use institutional momentum as context, then bring the decision back to the building, line, timing, and lifestyle fit.",
        bullets: [
          "Which institutional facilities are open, under construction, approved, funded, or still planned?",
          "How close is the residence to Datura Street, CityPlace, the Clear Lake hospital site, and the planned Vanderbilt campus?",
          "Will weekday office and medical traffic improve the neighborhood's energy, complicate access, or both?",
          "Does the buyer value near-term healthcare access, long-term education momentum, or the broader credibility signal?",
          "Are the projected openings relevant to the buyer's expected hold period?",
          "How does the exact building compare on floor plan, views, fees, delivery risk, parking, and current availability?",
          "Would the residence still make sense if one institutional timeline moved by several years?",
        ],
      },
      {
        heading: "The practical buyer move",
        body:
          "Track the institutions, but do not buy the headline. A strong Downtown shortlist should compare the buildings that benefit from this momentum with the same discipline used anywhere else: current pricing, active availability, view exposure, walkability, parking, HOA budget, construction timing, and resale competition. Institutional growth is a reason to take Downtown seriously, not a substitute for project-level diligence.",
      },
    ],
    ctaText:
      "The Scott Gordon Group at Douglas Elliman can help buyers compare Downtown institutional momentum against actual buildings, floor plans, timelines, pricing, and ownership costs.",
    factCheckRequired: [
      "Verify current opening dates, permits, fundraising status, and facility scope before relying on Cleveland Clinic, NYU Langone, Vanderbilt, or CityPlace timelines.",
      "Separate outpatient healthcare access from later inpatient hospital services; they have different timing and buyer impact.",
      "Confirm project-specific pricing, availability, delivery timing, parking, HOA fees, and documents directly before making a purchase decision.",
      "Treat institutional growth as market context, not as a promise of property appreciation or future resale performance.",
    ],
    seo: {
      primaryQuery: "West Palm Beach institutional growth",
      secondaryQueries: [
        "Cleveland Clinic West Palm Beach hospital",
        "NYU Langone West Palm Beach ambulatory care center",
        "Vanderbilt West Palm Beach campus",
        "10 and 15 CityPlace West Palm Beach",
      ],
      suggestedSlug: "west-palm-beach-institutional-growth",
      titleTag: "Downtown WPB Institutional Growth | Downtown Spotlight",
      metaDescription:
        "Vanderbilt, NYU Langone, Cleveland Clinic, and 10 and 15 CityPlace are reshaping Downtown West Palm Beach. Learn what condo buyers should track.",
    },
  },
  {
    id: "nora-district-downtown-transformation",
    status: "published",
    category: "Downtown Spotlight",
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
      titleTag: "NORA District's Downtown Impact Explained | Downtown Spotlight",
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
          "Evaluate construction quality and the developer, contractor, and operator histories.",
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
    id: "pre-construction-condo-due-diligence",
    status: "published",
    category: "Buyer Intelligence",
    title: "Pre-Construction Condo Due Diligence: What to Review Before Signing",
    slug: "pre-construction-condo-due-diligence",
    excerpt:
      "A West Palm Beach buyer checklist for reviewing deposits, disclosures, timelines, budgets, financing, and contract flexibility before signing a pre-construction condominium agreement.",
    buyerThesis:
      "A pre-construction condo contract is not a brochure. Buyers should understand the reservation path, statutory review window, escrow treatment, disclosure package, assignment rights, rental rules, financing risk, and long-term carrying costs before deposit exposure increases.",
    buyerTakeaway:
      "Before signing, request the full document package, calendar the rescission deadline, confirm the staged deposit schedule, and review the agreement with a Florida real estate attorney and lender.",
    image: {
      path: "/assets/editorial/preconstruction-condo-deposit-schedule-hero.jpg",
      credit: "User-provided editorial image, optimized for site use.",
    },
    imageId: "preconstruction-condo-deposit-schedule-hero",
    projectIds: ["olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house", "mr-c", "alba-palm-beach"],
    sourceName: "User-provided Buyer Intelligence article brief, checked against Florida condominium statutes and Fannie Mae project guidance",
    sourceLinks: [
      {
        label: "Florida Statute 718.503 developer disclosure and 15-day voidability",
        href: "https://www.flsenate.gov/Laws/Statutes/2025/718.503",
        sourceType: "official legal source",
      },
      {
        label: "Florida Statute 718.202 sales or reservation deposits prior to closing",
        href: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799%2F0718%2FSections%2F0718.202.html",
        sourceType: "official legal source",
      },
      {
        label: "Fannie Mae new and newly converted condo project requirements",
        href: "https://selling-guide.fanniemae.com/sel/b4-2.2-03/full-review-additional-eligibility-requirements-units-new-and-newly-converted-condo-projects",
        sourceType: "financing guideline",
      },
      {
        label: "Fannie Mae Project Eligibility Review Service",
        href: "https://selling-guide.fanniemae.com/sel/b4-2.2-06/project-eligibility-review-service-pers",
        sourceType: "financing guideline",
      },
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "Start by separating a reservation from a purchase contract",
        body:
          "Pre-construction sales often begin with a reservation agreement that holds a unit or unit line for a limited period. That is different from signing the purchase agreement. The purchase contract locks in the unit, deposit schedule, and many of the rights and obligations that will govern the transaction. In Florida developer sales, buyers generally receive a 15-day voidability window after contract execution and receipt of the required disclosure documents, so the timing and completeness of the document package matter.",
      },
      {
        heading: "Map the deposit schedule before liquidity is committed",
        body:
          "Many West Palm Beach pre-construction projects use staged deposits tied to milestones such as reservation, contract, groundbreaking, topping off, and closing. Florida law requires the first 10 percent of the purchase price to be handled through escrow protections, while additional deposits may be treated differently if the contract and statutory conditions allow it. Buyers should confirm who holds escrow, when funds become non-refundable, whether interest is credited, and under what conditions deposits can be released to the developer.",
      },
      {
        heading: "The prospectus is where the binding details live",
        body:
          "The full disclosure package should be reviewed before the rescission period expires. It can include the declaration, bylaws, articles, rules, budget, floor plans, plot plans, management agreements, lease or ground-lease material if applicable, and reserve or structural-study information. Remote buyers should not rely only on a presentation-room summary because the documents are where rental rules, pet policies, common-area ownership, amendment thresholds, and operating assumptions usually appear.",
        imageId: "preconstruction-condo-document-review",
      },
      {
        heading: "Assignment rights deserve a separate conversation",
        body:
          "Assignment provisions can vary widely. Some contracts prohibit assignment, some require developer consent and a fee, and others allow transfers to trusts, family entities, or affiliates under limited conditions. Buyers using estate-planning entities or expecting exit flexibility before closing should ask whether assignment is allowed, when consent is required, whether the developer has discretion to deny it, and whether the original buyer remains liable after assignment.",
      },
      {
        heading: "Rental rules can change the value of the unit",
        body:
          "Rental, occupancy, guest, and pet restrictions should be reviewed early. Minimum lease terms, approval requirements, subleasing limits, blackout periods, and municipal short-term-rental rules can affect both investors and personal-use buyers. A building can have strong amenities and still be a poor fit if the declaration does not support the owner's intended use.",
      },
      {
        heading: "Construction timing creates contract and financing risk",
        body:
          "Pre-construction delivery can move because of permitting, labor, materials, financing, weather, and phasing. Buyers should identify the outside date or long-stop date, any delay remedies, the design-selection timeline, upgrade allowances, inspection process, and warranty path. Financing adds another layer because permanent loans are usually evaluated closer to substantial completion, and lender project eligibility can depend on reserves, insurance, completion status, and buyer mix.",
        imageId: "preconstruction-condo-contract-signing",
      },
      {
        heading: "Budget for the closing table and the post-turnover building",
        body:
          "New-construction closings may include developer fees, title charges, filing charges, documentary stamps, prepaid assessments, and prorated taxes. After closing, monthly assessments can change as the building moves from developer control to owner control. Buyers should review reserve assumptions, insurance exposure, amenity operating costs, ownership of shared facilities, and whether later phases could affect existing owners.",
      },
      {
        heading: "Review the sponsor team and the turnover process",
        body:
          "Developer, contractor, architect, operator, and financing history all affect risk. Buyers should research prior Florida projects, review litigation or delivery history where available, and ask what documents owners receive at turnover. The turnover package can include governing documents, financial records, service contracts, plans, warranties, inspection materials, and structural reserve study information.",
      },
      {
        heading: "Buyer checklist before signing",
        body:
          "Use this list to organize the first diligence pass before deposit exposure grows.",
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
          "Developer, contractor, architect, operator, and prior-project history.",
        ],
      },
      {
        heading: "What to review with counsel",
        body:
          "A Florida real estate attorney should review the purchase agreement, riders, condominium declaration, bylaws, escrow agreement, prospectus, budget, reserve information, financing contingency, warranty language, dispute-resolution provisions, closing-cost estimate, and any verbal promise that needs to appear in writing. This article is buyer guidance, not legal advice, and the final answer should come from the signed documents and professional review.",
      },
    ],
    ctaText:
      "The Scott Gordon Group at Douglas Elliman helps West Palm Beach pre-construction buyers organize the right questions, compare projects clearly, and coordinate with legal and financial professionals before signing.",
    factCheckRequired: [
      "Confirm the current signed purchase agreement, prospectus, disclosure package, deposit schedule, and rescission deadline with a Florida real estate attorney.",
      "Verify current Florida condominium law, reserve/SIRS requirements, and lender project-eligibility guidance before relying on this public summary.",
      "Confirm project-specific availability, pricing, fees, incentives, assignment rights, rental rules, delivery timing, and closing costs directly from current buyer materials.",
    ],
    seo: {
      primaryQuery: "pre construction condo due diligence",
      secondaryQueries: [
        "West Palm Beach pre construction condo checklist",
        "Florida condo deposit escrow 10 percent",
        "pre construction condo rescission period Florida",
      ],
      suggestedSlug: "pre-construction-condo-due-diligence",
      titleTag: "Pre-Construction Condo Due Diligence | WPB",
      metaDescription:
        "Review deposits, disclosures, timelines, budgets, financing, assignment rights, and buyer protections before signing a West Palm Beach pre-construction condo contract.",
    },
  },
  {
    id: "west-palm-beach-wall-street-south-condos",
    status: "published",
    category: "Buyer Intelligence",
    title: "The Money Is Moving South: How West Palm Beach Became a New Luxury Real Estate Power Center",
    slug: "west-palm-beach-wall-street-south-condos",
    excerpt:
      "West Palm Beach's Wall Street South momentum is reshaping office demand, Palm Beach adjacency, and the luxury condo pipeline. Buyers should understand what is real, what is still developing, and what to verify before betting on the boom.",
    buyerThesis:
      "Corporate relocation and Palm Beach wealth are real demand signals, but they do not make every new-construction condo an automatic winner. The better buyer move is to connect office leasing, bridge access, project timing, supply risk, and carrying costs before choosing a building.",
    buyerTakeaway:
      "Treat Wall Street South as a market tailwind, not a shortcut. Verify which companies are actually leasing nearby, how each condo project is financed and timed, and whether the residence works without assuming future appreciation.",
    image: {
      path: "/assets/editorial/wall-street-south-flagler-drive-hero.jpg",
      credit: "User-provided editorial image, optimized for site use.",
    },
    imageId: "wall-street-south-flagler-drive-hero",
    projectIds: ["south-flagler-house", "ritz-carlton-wpb", "olara", "shorecrest", "mr-c", "mandarin-oriental", "alba-palm-beach", "nora-house"],
    sourceName: "User-provided Buyer Intelligence article brief, checked against current economic-development, market-report, and city development sources",
    sourceLinks: [
      {
        label: "Business Development Board Wall Street South migration overview",
        href: "https://bdb.org/news/wall-street-south-migration-enters-next-wave-of-new-york-to-florida-relocations-2/",
        sourceType: "economic development source",
      },
      {
        label: "Business Development Board financial services profile",
        href: "https://bdb.org/industries/financial-services/",
        sourceType: "economic development source",
      },
      {
        label: "City of West Palm Beach developer outreach presentations",
        href: "https://www.wpb.org/Departments/Development-Services/Developer-Outreach",
        sourceType: "city planning material",
      },
      {
        label: "Cushman & Wakefield Palm Beach office MarketBeat Q4 2025",
        href: "https://assets.cushmanwakefield.com/-/media/cw/marketbeat-pdfs/2025/q4/us-reports/office/palmbeach_americas_marketbeat_office_q42025.pdf?rev=65887a3386794f93a9bd5f4ee6213d6a",
        sourceType: "market report",
      },
      {
        label: "Commercial Observer report on Wells Fargo at One Flagler",
        href: "https://commercialobserver.com/2026/01/wells-fargo-west-palm-one-flagler-stephen-ross-related/",
        sourceType: "development news coverage",
      },
    ],
    datePublished: "2026-06-04",
    dateModified: "2026-06-04",
    sections: [
      {
        heading: "Sunshine is no longer the whole story",
        body:
          "West Palm Beach is attracting spreadsheets as much as sunshine. The Business Development Board has promoted Palm Beach County's Wall Street South migration around more than 250 financial-firm relocations or expansions over the past decade, while the county's finance and wealth ecosystem continues to pull executives closer to Palm Beach clients. For condo buyers, the point is not the nickname. It is whether high-income office demand, family-office activity, and Palm Beach adjacency are changing the depth of the local luxury market.",
      },
      {
        heading: "The office signal is strongest at the trophy end",
        body:
          "The highest-profile demand has clustered around premium downtown office space. One Flagler became the clearest symbol, with finance and wealth-management tenants drawn to a waterfront-adjacent tower near Palm Beach. Wells Fargo's reported 50,000-square-foot wealth-management lease at One Flagler added another headline signal in 2026. Buyers should still separate trophy-building leasing from the broader office market, where newer supply can push vacancy and competition higher even while the best addresses perform.",
        imageId: "wall-street-south-office-arrival",
      },
      {
        heading: "The office pipeline is a demand story and a supply test",
        body:
          "The city has spent several years tracking major office and mixed-use development through its developer-outreach materials, including projects around Rosemary, Banyan, One Flagler, The Square, and other downtown sites. Cushman & Wakefield's Q4 2025 Palm Beach office report showed the West Palm Beach CBD with substantial space under construction and high Class A asking rents, but also real vacancy to monitor. That combination matters for residential buyers: job growth can support demand, while too much simultaneous delivery can test assumptions.",
      },
      {
        heading: "Palm Beach adjacency explains the mainland premium",
        body:
          "West Palm Beach is not Palm Beach Island, and that difference is exactly why the mainland has become more interesting. Palm Beach remains supply-constrained and extremely expensive. West Palm Beach can offer newer waterfront towers, larger amenity programs, office proximity, and faster access to downtown restaurants while still sitting one bridge from the island. The buyer question is whether that bridge access, water exposure, and newer-building experience justify the premium in a specific line.",
        imageId: "wall-street-south-palm-beach-bridge",
      },
      {
        heading: "The condo pipeline is not one product type",
        body:
          "The residential response spans several buyer profiles. South Flagler House leans formal, estate-inspired, and highly serviced on the South Flagler waterfront. The Ritz-Carlton Residences and Mr. C introduce different branded-service models. Olara emphasizes amenity depth, marina context, and a larger wellness-and-leisure program. Shorecrest adds another North Flagler waterfront option that still deserves current packet verification. Mandarin Oriental, Alba, NORA House, and other pipeline or active projects broaden the comparison beyond one corridor.",
      },
      {
        heading: "Hospitality and mixed-use projects make the city feel more complete",
        body:
          "The Wall Street South thesis is not only about office leases. Hotels, restaurants, district retail, rooftop bars, conference activity, and mixed-use projects can make West Palm Beach feel more like a year-round live-work-play market. That matters for part-time buyers who want services and energy when they arrive, and for full-time buyers who want the city to function beyond season. The diligence question is which pieces are open now, under construction, approved, or still aspirational.",
      },
      {
        heading: "The risks are real enough to underwrite",
        body:
          "A strong migration story does not remove market cycles. Buyers should watch office absorption, interest rates, construction financing, insurance costs, HOA budgets, climate-resiliency expenses, and the amount of luxury inventory delivering in the same window. Several towers have multi-year delivery timelines, which means deposits, rates, and personal liquidity need to be tested against a future closing environment rather than today's headline momentum.",
      },
      {
        heading: "Questions buyers should ask",
        body:
          "Use the corporate-migration story as context, then bring the decision back to project-level diligence.",
        bullets: [
          "Which financial, technology, or corporate tenants are actually leasing near the building, and are those leases long-term?",
          "How much new office and residential supply is scheduled to deliver before or near the condo's closing date?",
          "How does the residence compare with Palm Beach and Miami alternatives by price per square foot, fees, view quality, and service model?",
          "What is the project deposit schedule, outside date, construction financing posture, and cancellation language?",
          "What are the projected HOA fees, reserve assumptions, insurance requirements, and likely post-turnover obligations?",
          "Would the exact residence still make sense if the Wall Street South story cooled for a few years?",
        ],
      },
      {
        heading: "The practical buyer move",
        body:
          "Wall Street South can be a useful tailwind, especially for buyers who want Palm Beach proximity with newer mainland inventory. But the final decision should still be line-specific and document-specific. Compare the project, floor plan, exposure, bridge access, service model, budget, delivery timing, and resale competition before treating the migration story as proof of future value.",
      },
    ],
    ctaText:
      "The Scott Gordon Group at Douglas Elliman helps buyers compare West Palm Beach's Wall Street South momentum against actual project documents, pricing, floor plans, timelines, and long-term ownership costs.",
    factCheckRequired: [
      "Verify current office leasing, corporate relocation, and tenant information before relying on public migration claims.",
      "Refresh city development pipeline, office vacancy, and Class A rent data before making market-timing conclusions.",
      "Confirm project-specific pricing, availability, delivery timing, fees, financing, and contract terms directly from current buyer materials.",
    ],
    seo: {
      primaryQuery: "West Palm Beach Wall Street South condos",
      secondaryQueries: [
        "West Palm Beach luxury real estate finance migration",
        "Wall Street South West Palm Beach",
        "West Palm Beach new construction condos Palm Beach",
      ],
      suggestedSlug: "west-palm-beach-wall-street-south-condos",
      titleTag: "West Palm Beach Wall Street South Condo Insight",
      metaDescription:
        "West Palm Beach is drawing finance, wealth, and new luxury condo development. Learn what Wall Street South means for buyers and what to verify.",
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
