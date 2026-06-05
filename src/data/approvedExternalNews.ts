export type ExternalNewsItem = {
  id: string;
  title: string;
  slug?: string;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  sourceTitle?: string;
  publishedAt: string;
  sourcePublishedAt?: string;
  sourcePublishedDate: string;
  eventDate?: string;
  dateDiscovered: string;
  freshnessLane: "breaking_14d" | "recent_30d" | "evergreen_context" | "evergreen_analysis" | "background_context" | "archive_only";
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
  relatedProjectSlugs: string[];
  relatedCorridors: string[];
  primaryProjectSlug?: string;
  corridorLabel?: string;
  imageUrl?: string;
  imagePath?: string;
  resolvedLocalImageId?: string;
  sourceLinks?: { label: string; url: string; type?: string }[];
  paywallStatus: "free" | "unknown" | "likely-paywalled";
  status: "needs-review" | "published" | "archived" | "duplicate";
  riskLevel?: "low" | "medium" | "high";
};

export function newsSortTimestamp(item: ExternalNewsItem): number {
  const value = item.publishedAt || item.sourcePublishedDate || item.sourcePublishedAt || item.dateDiscovered || item.fetchedAt;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortNewsItems<T extends ExternalNewsItem>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const dateDelta = newsSortTimestamp(b) - newsSortTimestamp(a);
    if (dateDelta !== 0) return dateDelta;
    return a.id.localeCompare(b.id);
  });
}

export function isHomepageFreshnessLane(item: ExternalNewsItem): boolean {
  return item.freshnessLane === "breaking_14d" || item.freshnessLane === "recent_30d";
}

export function isHomepageContextLane(item: ExternalNewsItem): boolean {
  return item.freshnessLane === "evergreen_analysis" ||
    item.freshnessLane === "evergreen_context" ||
    item.freshnessLane === "archive_only";
}

export const approvedExternalNews: readonly ExternalNewsItem[] = [
  {
    "id": "trd-jeff-greene-live-local-120-s-dixie-2026-06-05",
    "slug": "trd-jeff-greene-live-local-120-s-dixie-2026-06-05",
    "title": "Jeff Greene’s latest downtown West Palm proposal would bring workforce housing and mass-timber construction to Dixie and Datura",
    "sourceName": "The Real Deal",
    "sourceUrl": "https://therealdeal.com/miami/2026/05/28/jeff-greene-plans-live-local-act-project-in-west-palm-beach/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/05/28/jeff-greene-plans-live-local-act-project-in-west-palm-beach/",
    "sourceTitle": "Jeff Greene plans Live Local Act project in West Palm Beach",
    "publishedAt": "2026-06-05T07:20:00-04:00",
    "sourcePublishedAt": "2026-05-28",
    "sourcePublishedDate": "2026-05-28",
    "eventDate": "2026-05-28",
    "dateDiscovered": "2026-06-05",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-06-05",
    "deck": "A new Greene proposal at 120 South Dixie Highway would pair 366 apartments, 148 workforce units, a preserved historic facade, and prefabricated mass-timber construction in one of downtown West Palm Beach’s most visible redevelopment zones.",
    "description": "Jeff Greene is pursuing a Live Local Act apartment tower at 120 South Dixie Highway, adding a workforce-housing and mass-timber angle to downtown West Palm Beach’s development pipeline.",
    "summary": "The proposal shifts the downtown conversation beyond trophy condos, combining workforce housing, historic-preservation elements, and a faster-build construction system on a long-watched site near Datura Street.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "The Real Deal reported on May 28 that Jeff Greene is planning a 25-story apartment tower at 120 South Dixie Highway and adjacent Datura parcels under Florida’s Live Local Act. The report says the project would include 366 apartments, with 148 units reserved for workforce housing, along with retail space and parking."
      },
      {
        "heading": "Why this site stands out",
        "body": "The proposal is notable for more than its unit count. The Real Deal reported that Greene plans to preserve portions of the former fire station facade and use a prefabricated mass-timber structural system, giving the project a preservation-and-construction story that is different from the glass-heavy luxury towers shaping other parts of West Palm Beach."
      },
      {
        "heading": "What it means for downtown",
        "body": "If the plan advances, it would add a workforce-housing component to a downtown core that is increasingly defined by office, medical, and high-end residential investment. City filing history also shows the broader 120 South Dixie and Datura assemblage has carried prior formal site-plan activity, making this a meaningful reset point for a site that has been watched for years."
      }
    ],
    "whyItMatters": "This is one of the clearer signs that downtown West Palm Beach’s next wave may include more than luxury condos. A large Live Local filing here would bring affordability policy, preservation, and construction speed into the same redevelopment conversation.",
    "buyerContext": "The story is most relevant as a downtown growth signal rather than a direct luxury-condo comparison. It helps explain how the city’s core is broadening its housing mix while nearby new-construction condo corridors continue to skew luxury.",
    "newsletterHeadline": "Jeff Greene lines up a workforce-housing and timber play in downtown West Palm",
    "newsletterBlurb": "A proposed 25-story Greene tower at Dixie and Datura would mix 366 apartments, workforce units, historic facade preservation, and mass-timber construction.",
    "newsletterCta": "See how the proposal fits downtown’s next phase",
    "query": "Jeff Greene Live Local 120 South Dixie Highway West Palm Beach",
    "category": "planning",
    "relatedProjectIds": [],
    "relatedCorridorIds": [
      "downtown"
    ],
    "relatedProjectSlugs": [],
    "relatedCorridors": [
      "downtown"
    ],
    "corridorLabel": "Downtown",
    "imagePath": "/assets/editorial/jeff-greene-downtown-timber-proposal-120-s-dixie-v01.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal report on Greene's Live Local proposal",
        "url": "https://therealdeal.com/miami/2026/05/28/jeff-greene-plans-live-local-act-project-in-west-palm-beach/",
        "type": "news"
      },
      {
        "label": "City of West Palm Beach eGov file for 120 S Dixie and Datura assemblage",
        "url": "https://onestopshop.wpbgov.com/eGovPlus/zoning/zd_account_dtl.aspx?appl_no=Z22090015",
        "type": "city-link"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "rosewood-north-flagler-planning-board-2026-06-05",
    "slug": "rosewood-north-flagler-planning-board-2026-06-05",
    "title": "Rosewood adds another branded-residence signal to North Flagler as 2001 North Flagler moves through review",
    "sourceName": "City of West Palm Beach Planning Board, The Real Deal, and Florida YIMBY",
    "sourceUrl": "https://www.wpb.org/files/assets/city/v/1/development-services/documents/planning-board/2026-pb-agendas/pb-agenda-2026.5.19.pdf",
    "canonicalUrl": "https://www.wpb.org/files/assets/city/v/1/development-services/documents/planning-board/2026-pb-agendas/pb-agenda-2026.5.19.pdf",
    "sourceTitle": "West Palm Beach Planning Board agenda for May 19, 2026",
    "publishedAt": "2026-06-05T07:21:00-04:00",
    "sourcePublishedAt": "2026-05-19",
    "sourcePublishedDate": "2026-05-19",
    "eventDate": "2026-05-19",
    "dateDiscovered": "2026-06-05",
    "freshnessLane": "recent_30d",
    "fetchedAt": "2026-06-05",
    "deck": "A Rosewood-branded condominium plan at 2001 North Flagler Drive is now supported by both developer reporting and a May 19 city agenda entry, giving North Flagler another high-end name in its expanding waterfront comparison set.",
    "description": "Rosewood has been tied to the planned 2001 North Flagler tower, and a May 19 city board agenda confirms the 90-unit project is moving through formal review in West Palm Beach.",
    "summary": "The North Flagler corridor continues to deepen its branded-luxury pipeline, with Rosewood now joining the conversation around Ritz-Carlton, Mandarin Oriental, Shorecrest, and other waterfront projects buyers are already tracking.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "A May 19 West Palm Beach Planning Board agenda lists a Level III Special Review case for a 90-unit multifamily residential development at 2001 North Flagler Drive. That municipal filing aligns with earlier reporting from The Real Deal and Florida YIMBY that Related Group and BH Group are pursuing a Rosewood-branded condominium tower on the site."
      },
      {
        "heading": "What the current plan shows",
        "body": "Florida YIMBY reported that the 2001 North Flagler proposal calls for a 27-story tower with 90 condominiums, eight townhouses, more than 13,000 square feet of indoor amenities, a fifth-floor pool deck, and structured parking. The Real Deal later reported that Rosewood Hotels and Resorts had joined the project as the luxury brand attached to the building."
      },
      {
        "heading": "Why it matters on North Flagler",
        "body": "North Flagler is no longer just a collection of unrelated towers. The corridor is becoming a branded-residence cluster where service model, amenity tone, privacy, and waterfront positioning will matter as much as raw square footage. Rosewood adds another hospitality-led identity to that competition before pricing and floor plans are fully public."
      }
    ],
    "whyItMatters": "This gives the North Flagler pipeline more definition. Even before sales details are public, Rosewood helps clarify the kind of future supply and brand competition likely to shape the next round of luxury buyer decisions along the waterfront.",
    "buyerContext": "This belongs in the future-supply watch list rather than the active-sales bucket. It is useful for understanding upcoming branded competition on North Flagler, but not yet a substitute for current pricing, plan, and contract-level diligence.",
    "newsletterHeadline": "Rosewood sharpens the next-wave North Flagler watch list",
    "newsletterBlurb": "The 2001 North Flagler proposal now has a city agenda trail and a Rosewood branding story, giving the waterfront pipeline another luxury name to watch.",
    "newsletterCta": "See where Rosewood fits on North Flagler",
    "query": "2001 North Flagler Rosewood West Palm Beach planning board",
    "category": "development",
    "relatedProjectIds": [
      "rosewood-residences-west-palm-beach"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "rosewood-residences-west-palm-beach"
    ],
    "relatedCorridors": [
      "north-flagler"
    ],
    "primaryProjectSlug": "rosewood-residences-west-palm-beach",
    "imagePath": "/assets/home/rosewood-project-card-main-v01.jpg",
    "sourceLinks": [
      {
        "label": "West Palm Beach Planning Board agenda, May 19 2026",
        "url": "https://www.wpb.org/files/assets/city/v/1/development-services/documents/planning-board/2026-pb-agendas/pb-agenda-2026.5.19.pdf",
        "type": "city-link"
      },
      {
        "label": "The Real Deal report on Rosewood branding",
        "url": "https://therealdeal.com/miami/2026/04/10/related-group-bh-group-plan-rosewood-west-palm-beach/",
        "type": "news"
      },
      {
        "label": "Florida YIMBY report on the 2001 North Flagler proposal",
        "url": "https://floridayimby.com/2026/01/developers-propose-luxury-27-story-for-2001-n-flagler-dr-west-palm-beach-fl.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "florida-yimby-mandarin-interiors-2026-05-18",
    "slug": "florida-yimby-mandarin-interiors-2026-05-18",
    "title": "New renderings show inside Mandarin Oriental’s planned West Palm Beach residences",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/05/first-interior-renderings-revealed-for-mandarin-oriental-residences-west-palm-beach.html",
    "canonicalUrl": "https://floridayimby.com/2026/05/first-interior-renderings-revealed-for-mandarin-oriental-residences-west-palm-beach.html",
    "publishedAt": "2026-05-18",
    "sourcePublishedAt": "2026-05-18",
    "sourcePublishedDate": "2026-05-18",
    "eventDate": "2026-05-18",
    "dateDiscovered": "2026-06-05",
    "freshnessLane": "recent_30d",
    "fetchedAt": "2026-06-05",
    "sourceTitle": "First Interior Renderings Revealed For Mandarin Oriental Residences, West Palm Beach",
    "deck": "The first interior renderings for Mandarin Oriental Residences give a closer look at the planned 5400 North Flagler tower, including the mood of the residences, amenity spaces, and waterfront lifestyle behind the project.",
    "description": "Newly published renderings show the first interior look at Mandarin Oriental Residences, the planned branded waterfront tower at 5400 North Flagler Drive.",
    "summary": "The new images add substance to one of North Flagler’s most closely watched branded condo projects, showing how Mandarin Oriental wants the building to feel beyond the skyline renderings.",
    "bodySections": [
      {
        "heading": "The update",
        "body": "New interior renderings have been released for Mandarin Oriental Residences, the planned 31-story waterfront condominium at 5400 North Flagler Drive. The images move the project beyond exterior views and brand announcement language, giving buyers their first public look at the tone of the residences and shared spaces."
      },
      {
        "heading": "Why it matters",
        "body": "North Flagler is getting crowded with luxury projects, and each building needs a clearer reason to be on a buyer’s shortlist. Mandarin Oriental’s pitch is now easier to judge: branded service, waterfront privacy, soft contemporary interiors, and a more hotel-influenced lifestyle without being a hotel tower."
      },
      {
        "heading": "What to watch next",
        "body": "The images are helpful, but they are still renderings. The next meaningful buyer checks are released floor plans, view exposure, residence-specific pricing, carrying costs, parking, storage, service inclusions, and the latest delivery guidance."
      }
    ],
    "whyItMatters": "The renderings make Mandarin Oriental easier to evaluate as a real place to live, not just a future branded tower. That matters as North Flagler adds more luxury inventory and buyers start comparing feel, service, privacy, views, and timing.",
    "buyerContext": "Most useful for buyers comparing branded hospitality, softer interior style, waterfront privacy, and the next wave of North Flagler supply.",
    "newsletterHeadline": "Mandarin Oriental releases first interior look in West Palm Beach",
    "newsletterBlurb": "New renderings show the first interior direction for Mandarin Oriental’s planned waterfront residences at 5400 North Flagler Drive.",
    "newsletterCta": "See how it fits on North Flagler",
    "query": "Florida YIMBY West Palm Beach Mandarin Oriental interior renderings",
    "category": "development",
    "relatedProjectIds": [
      "mandarin-oriental"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "mandarin-oriental"
    ],
    "relatedCorridors": [
      "north-flagler"
    ],
    "primaryProjectSlug": "mandarin-oriental",
    "imagePath": "/projects/mandarin-oriental/media/showcase/mandarin-oriental-hero-waterfront-web.jpg",
    "sourceLinks": [
      {
        "label": "Florida YIMBY interior-rendering coverage",
        "url": "https://floridayimby.com/2026/05/first-interior-renderings-revealed-for-mandarin-oriental-residences-west-palm-beach.html",
        "type": "news"
      },
      {
        "label": "Mandarin Oriental official announcement",
        "url": "https://press.mandarinoriental.com/residences-west-palm/",
        "type": "official"
      },
      {
        "label": "Mandarin Oriental Residences official site",
        "url": "https://mandarinorientalresidenceswestpalmbeach.com/",
        "type": "official"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  }
] as const;

export const publishedExternalNews = sortNewsItems(approvedExternalNews.filter((item) => item.status === "published"));
export const homepageExternalNews = [
  ...publishedExternalNews.filter(isHomepageFreshnessLane),
  ...publishedExternalNews.filter(isHomepageContextLane),
].filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 3);
