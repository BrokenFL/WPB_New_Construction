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
    "brookeTake": "This is worth watching because it gives buyers more than a logo and an address. I would still treat the images as a starting point, then compare the actual residence lines, costs, views, and services before ranking it against Olara, Alba, Ritz-Carlton Residences, or Shorecrest.",
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
      },
      {
        "label": "Florida YIMBY planning-board approval context",
        "url": "https://floridayimby.com/2025/08/5400-north-flagler-condominium-project-approved-by-west-palm-beach-planning-board.html",
        "type": "news"
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
