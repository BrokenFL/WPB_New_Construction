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
  bodySections?: { heading: string; body: string; image?: string }[];
  whyItMatters?: string;
  brookeTake?: string;
  buyerContext?: string;
  buyerTakeaway?: string;
  marketSignal?: string;
  bestFor?: string;
  watchPoints?: string;
  relatedBuildings?: string[];
  relatedNeighborhoods?: string[];
  relatedCorridor?: string;
  relatedArticleIds?: string[];
  buyerQuestions?: string;
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
    "id": "sound-apartments-right-of-way-maintenance-2026-07-12",
    "slug": "sound-apartments-right-of-way-maintenance-2026-07-12",
    "title": "West Palm Beach approves maintenance agreements for The Sound Apartments on South Dixie",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/News-Folder/News-2026/070726-Mayor-City-Commission-CRA-Approvals-and-Decisions",
    "canonicalUrl": "https://www.wpb.org/News-Folder/News-2026/070726-Mayor-City-Commission-CRA-Approvals-and-Decisions",
    "sourceTitle": "Mayor, City Commission, CRA Approvals and Decisions from July 6, 2026",
    "publishedAt": "2026-07-12T13:20:47.956Z",
    "sourcePublishedAt": "2026-07-07",
    "sourcePublishedDate": "2026-07-07",
    "eventDate": "2026-07-06",
    "dateDiscovered": "2026-07-12",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-07-12T13:21:39.008Z",
    "deck": "The city commission approved FDOT right-of-way maintenance tied to the 8111 South Dixie Highway project, where Woodfield and Flagler Realty say delivery is still targeted for later this year.",
    "description": "West Palm Beach approved right-of-way maintenance agreements for The Sound Apartments, the mixed-use South Dixie project with 358 apartments, workforce housing, and a Trader Joe’s lease.",
    "summary": "The city commission approved FDOT right-of-way maintenance tied to the 8111 South Dixie Highway project, where Woodfield and Flagler Realty say delivery is still targeted for later this year.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "West Palm Beach’s latest City Commission approvals include a resolution that authorizes maintenance responsibility for part of the South Dixie Highway right-of-way tied to The Sound Apartments at 8111 South Dixie Highway. The same summary says the city approved the maintenance memorandum with FDOT and a right-of-way maintenance agreement with Woodfield-Flagler 8111 Retail Owner, LLC.\n\nThis is not a flashy headline item, but it is a real project step. The city is formalizing the public-side maintenance responsibilities around a development that is already under construction in the South End."
      },
      {
        "heading": "What the project is",
        "body": "The Sound Apartments is an eight-story mixed-use project developed by Woodfield Development with Flagler Realty & Development and built by Verdex Construction. Verdex says the project will deliver 358 apartments, including 90 workforce housing units, plus about 19,000 square feet of retail.\n\nTrader Joe’s has already signed for 15,000 square feet of that commercial space, with the remaining retail space left divisible for one or two tenants. The project page and recent construction coverage both point to a later-2026 delivery window, with move-ins expected in the third quarter."
      },
      {
        "heading": "Why nearby buyers should care",
        "body": "For nearby buyers, the practical signal is simple: South Dixie is not just a pass-through corridor anymore. The project adds a meaningful chunk of housing, daily-use retail, and workforce units in a part of West Palm Beach that has been steadily absorbing more development pressure.\n\nThat does not make it a condo comp. It does, however, shape the neighborhood context around South End and downtown-adjacent addresses, especially for buyers who care about traffic patterns, walkable errands, and how much new supply is arriving around them."
      },
      {
        "heading": "What to watch next",
        "body": "The next meaningful check is execution: whether the project stays on its current delivery path and how the retail tenant lineup lands around Trader Joe’s. For now, the important part is that the city has cleared another formal step and the project remains in active construction rather than in limbo.\n\nFor West Palm Beach, that keeps The Sound Apartments in the same category as the city’s other working development sites: not a concept, but a project moving through the final public-side pieces."
      }
    ],
    "whyItMatters": "The approval formalizes the public-side pieces around a large South End project that adds housing, workforce units, and neighborhood retail near South Dixie Highway.",
    "buyerContext": "Most relevant for nearby South End, South Dixie, and downtown-adjacent buyers comparing daily-use retail, roadwork exposure, and the pace of nearby supply.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "newsletterHeadline": "The Sound Apartments picks up a city approval on South Dixie",
    "newsletterBlurb": "West Palm Beach approved maintenance agreements tied to the 8111 South Dixie Highway project as the mixed-use development nears delivery.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach approves maintenance agreements for The Sound Apartments on South Dixie",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/preconstruction-condo-document-review.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach approvals summary",
        "url": "https://www.wpb.org/News-Folder/News-2026/070726-Mayor-City-Commission-CRA-Approvals-and-Decisions",
        "type": "official"
      },
      {
        "label": "City of West Palm Beach July 6 commission agenda",
        "url": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-pass-fail-agendas-pfa/2026-07-jul-pfa/pf-07_06_26_city-commission-agenda.pdf",
        "type": "official"
      },
      {
        "label": "Verdex Construction project page",
        "url": "https://verdex.com/the-sound-apartments/",
        "type": "official project site"
      },
      {
        "label": "citybiz construction update",
        "url": "https://www.citybiz.co/article/813518/woodfield-development-and-flagler-realty-development-advance-construction-on-the-sound-apartments-and-trader-joes-in-west-palm-beach/",
        "type": "news"
      },
      {
        "label": "Florida YIMBY progress update",
        "url": "https://floridayimby.com/2026/03/construction-nears-completion-on-the-sound-apartments-at-8111-south-dixie-highway-in-west-palm-beach.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "west-palm-point-back-in-motion-2026-07-11",
    "slug": "west-palm-point-back-in-motion-2026-07-11",
    "title": "West Palm Point Is Back in Motion on Downtown West Palm's Okeechobee Corridor",
    "sourceName": "The Real Deal",
    "sourceUrl": "https://therealdeal.com/miami/2026/07/10/charles-cohen-restarts-downtown-west-palm-office-project/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/07/10/charles-cohen-restarts-downtown-west-palm-office-project/",
    "sourceTitle": "Charles Cohen revives West Palm office project after resolving site foreclosure",
    "publishedAt": "2026-07-11T13:20:10.169Z",
    "sourcePublishedAt": "2026-07-10",
    "sourcePublishedDate": "2026-07-10",
    "eventDate": "2026-07-10",
    "dateDiscovered": "2026-07-11",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-07-11T13:20:10.169Z",
    "deck": "After a foreclosure suit was dismissed and permitting resumed, the long-planned office tower at 801 S. Dixie Highway is moving again, with the project website listing occupancy in Q1 2028.",
    "description": "After a foreclosure suit was dismissed and permitting resumed, the long-planned office tower at 801 S. Dixie Highway is moving again, with the project website listing occupancy in Q1 2028.",
    "summary": "After a foreclosure suit was dismissed and permitting resumed, the long-planned office tower at 801 S. Dixie Highway is moving again, with the project website listing occupancy in Q1 2028.",
    "bodySections": [
      {
        "heading": "Introduction",
        "body": "West Palm Point is back in motion as a downtown office project rather than a long-stalled concept. The Real Deal reported on July 10 that Charles Cohen had set the project back on track after a foreclosure suit on a $10 million loan was resolved, and the project website now lists occupancy for Q1 2028."
      },
      {
        "heading": "What Changed",
        "body": "According to The Real Deal, Cohen Brothers Realty has started the permitting process again and is still planning a 25-story tower with roughly 400,000 square feet of office space, ground-floor retail, and an 11-story garage with a rooftop amenity deck.\n\nThe city’s CRA page places West Palm Point on the old Tent Site at 801 S. Dixie Highway and says the project secured final site plan approval years ago. That page also describes construction as underway, which makes this less a brand-new launch than a return to active execution after a financing pause."
      },
      {
        "heading": "Why It Matters For Downtown",
        "body": "This is not a condo story, but it still matters for nearby buyers. An office tower in motion adds another piece of weekday demand to the Okeechobee and Quadrille corridor, supporting lunch traffic, retail energy, and the broader case for downtown as a working district rather than only a residential one.\n\nFor buyers comparing downtown and Flagler-adjacent addresses, that matters because office activity shapes how active a neighborhood feels during the week. It also affects how much confidence the market has in the surrounding development pipeline."
      },
      {
        "heading": "Timing And Caution",
        "body": "The project website’s Q1 2028 occupancy target gives the market a current marker, but it is still a target, not a guarantee. West Palm Point first surfaced years ago, and the city page shows how much of the entitlement work was already in place before this latest restart.\n\nThe clean read for buyers is simple: the site is active again, the tower remains on the map, and downtown West Palm Beach continues to absorb new office development rather than giving the district over entirely to residential use."
      }
    ],
    "whyItMatters": "A restarted office tower keeps another downtown block in play and reinforces weekday demand around the Okeechobee and Quadrille corridor.",
    "buyerContext": "For nearby buyers, the practical effect is more office activity, stronger weekday foot traffic, and another sign that the Okeechobee corridor is still being carried forward as a working downtown district.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "newsletterHeadline": "West Palm Point Is Back in Motion on Downtown West Palm's Okeechobee Corridor",
    "newsletterBlurb": "After a foreclosure suit was dismissed and permitting resumed, the long-planned office tower at 801 S. Dixie Highway is moving again, with the project website listing occupancy in Q1 2028.",
    "newsletterCta": "Read the article",
    "query": "West Palm Point Is Back in Motion on Downtown West Palm's Okeechobee Corridor",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/wall-street-south-office-arrival.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal",
        "url": "https://therealdeal.com/miami/2026/07/10/charles-cohen-restarts-downtown-west-palm-office-project/",
        "type": "news"
      },
      {
        "label": "West Palm Point official site",
        "url": "https://www.westpalmpoint.com/",
        "type": "official project site"
      },
      {
        "label": "City of West Palm Beach CRA Okeechobee Corridor",
        "url": "https://www.wpb.org/Departments/Community-Redevelopment-Agency/DowntownCity-Center/Okeechobee-Corridor",
        "type": "city planning material"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "currie-park-waterfront-restaurant-west-palm-beach-2026-06-10",
    "slug": "currie-park-waterfront-restaurant-west-palm-beach-2026-06-10",
    "title": "Currie Park Restaurant Proposals Add Another Lifestyle Layer to North Flagler",
    "sourceName": "CBS12",
    "sourceUrl": "https://cbs12.com/news/morning-show/west-palm-beach-reviews-proposals-for-first-ever-waterfront-restaurant-at-currie-park",
    "canonicalUrl": "https://cbs12.com/news/morning-show/west-palm-beach-reviews-proposals-for-first-ever-waterfront-restaurant-at-currie-park",
    "sourceTitle": "Currie Park Restaurant Proposals Add Another Lifestyle Layer to North Flagler",
    "publishedAt": "2026-06-12T13:16:12.407Z",
    "sourcePublishedAt": "2026-06-10",
    "sourcePublishedDate": "2026-06-10",
    "eventDate": "2026-06-12",
    "dateDiscovered": "2026-06-12",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-06-12T13:17:53.404Z",
    "deck": "West Palm Beach is reviewing proposals for the first waterfront restaurant at Currie Park, a move that could turn the renovated park into a stronger lifestyle anchor for the North Flagler corridor near Olara, Shorecrest, and the planned Ritz-Carlton Residences.",
    "description": "West Palm Beach is reviewing proposals for the first waterfront restaurant at Currie Park, a move that could turn the renovated park into a stronger lifestyle anchor for the North Flagler corridor near Olara, Shorecrest, and the planned Ritz-Carlton Residences.",
    "summary": "West Palm Beach is reviewing proposals for the first waterfront restaurant at Currie Park, a move that could turn the renovated park into a stronger lifestyle anchor for the North Flagler corridor near Olara, Shorecrest, and the planned Ritz-Carlton Residences.",
    "bodySections": [
      {
        "heading": "Introduction",
        "body": "West Palm Beach is moving closer to selecting an operator for what could become the first waterfront restaurant at Currie Park, a major new public-facing amenity on the North Flagler corridor just north of several high-profile residential projects including Olara, Shorecrest, and the planned Ritz-Carlton Residences West Palm Beach.",
        "image": "/assets/editorial/currie-park-waterfront-restaurant-west-palm-beach-2026-06-10-body-1.jpg"
      },
      {
        "heading": "A New Waterfront Anchor for Currie Park",
        "body": "According to CBS12, a city evaluation and selection committee is reviewing proposals from three groups seeking to operate the restaurant, which would be part of the city's ongoing $35 million redevelopment of Currie Park along the Intracoastal Waterway.\n\nThe restaurant would mark a notable shift for the park, which has not previously included a commercial dining venue. City officials have envisioned the restaurant on the north end of the park as part of a broader renovation that includes new recreational amenities, waterfront improvements, and public gathering spaces.",
        "image": "/assets/editorial/currie-park-waterfront-restaurant-west-palm-beach-2026-06-10-body-2.jpg"
      },
      {
        "heading": "Why This Matters for North Flagler",
        "body": "For buyers watching the North Flagler corridor, the Currie Park restaurant decision is bigger than a single food-and-beverage lease. It is another signal that the waterfront north of downtown is being repositioned as a more active lifestyle district, not just a residential edge between downtown West Palm Beach and Palm Beach.\n\nThat matters for nearby new construction because parks, dining, walkability, and waterfront programming all help support the day-to-day appeal of luxury residential projects. A more activated Currie Park could become part of the lifestyle story for residents at Olara, Shorecrest, the Ritz-Carlton Residences, and future North Flagler development.",
        "image": "/assets/editorial/currie-park-waterfront-restaurant-west-palm-beach-2026-06-10-body-1.jpg"
      },
      {
        "heading": "Three Teams Are Competing",
        "body": "CBS12 reported that three teams are competing for the restaurant opportunity. One proposal includes E.R. Bradley's owner Nick Coniglio and developer Ned Grace, who is also known for his role in the Nora District redevelopment north of downtown West Palm Beach.\n\nAnother proposal comes from Breakwater Hospitality Group, a Miami-based operator with waterfront venues including Pier 5 at Bayside Marketplace. A third proposal was submitted by SMG Drones of Lantana, whose founder Hadley Doyle-Gonzalez is connected to the family that previously owned Panama Hattie's Rum Bar in Palm Beach Gardens."
      },
      {
        "heading": "Public Park, Private Operator",
        "body": "The idea has also raised questions because it would introduce a commercial restaurant component to public parkland. Supporters see the restaurant as a way to enhance the visitor experience and create a stronger Intracoastal destination, while critics are concerned about changing the character of the park.\n\nThat tension is common in waterfront redevelopment. The most successful projects usually have to balance public access, neighborhood character, long-term maintenance, and the need for amenities that keep public spaces active beyond a simple lawn-and-pathway model.",
        "image": "/assets/editorial/currie-park-waterfront-restaurant-west-palm-beach-2026-06-10-body-2.jpg"
      },
      {
        "heading": "Timing and Next Steps",
        "body": "The selection committee is expected to hear presentations, rank the proposals, and help determine which team advances in the city's process. Currie Park is expected to reopen in March 2027 following construction.\n\nIf the restaurant moves forward as planned, it could become one of the centerpiece features of the renovated park and a meaningful addition to the North Flagler lifestyle corridor."
      },
      {
        "heading": "The Bottom Line",
        "body": "Currie Park's restaurant proposal is part of a larger shift in West Palm Beach: waterfront public spaces are being asked to do more. They are no longer just passive green space, but potential anchors for dining, recreation, events, and neighborhood identity.\n\nFor buyers evaluating North Flagler, that is important. The corridor's long-term appeal will be shaped not only by the buildings rising along it, but by the public spaces, restaurants, clubs, and waterfront amenities forming around them."
      }
    ],
    "whyItMatters": "",
    "buyerContext": "",
    "newsletterHeadline": "Currie Park Restaurant Proposals Add Another Lifestyle Layer to North Flagler",
    "newsletterBlurb": "West Palm Beach is reviewing proposals for the first waterfront restaurant at Currie Park, a move that could turn the renovated park into a stronger lifestyle anchor for the North Flagler corridor near Olara, Shorecrest, and the planned Ritz-Carlton Residences.",
    "newsletterCta": "Read the article",
    "query": "Currie Park Restaurant Proposals Add Another Lifestyle Layer to North Flagler",
    "category": "general",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/currie-park-waterfront-restaurant-west-palm-beach-2026-06-10-hero.jpg",
    "sourceLinks": [
      {
        "label": "CBS12",
        "url": "https://cbs12.com/news/morning-show/west-palm-beach-reviews-proposals-for-first-ever-waterfront-restaurant-at-currie-park",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "court-club-private-racquet-club-west-palm-beach-2026-06-09",
    "slug": "court-club-private-racquet-club-west-palm-beach-2026-06-09",
    "title": "Private Racquet Club Near West Palm Beach Signals the Next Wave of Lifestyle Demand",
    "sourceName": "Palm Beach Post",
    "sourceUrl": "https://www.palmbeachpost.com/story/business/real-estate/2026/06/09/court-club-near-west-palm-beach-courts-members-as-wait-list-hits-700/90360392007/",
    "canonicalUrl": "https://www.palmbeachpost.com/story/business/real-estate/2026/06/09/court-club-near-west-palm-beach-courts-members-as-wait-list-hits-700/90360392007/",
    "sourceTitle": "Private Racquet Club Near West Palm Beach Signals the Next Wave of Lifestyle Demand",
    "publishedAt": "2026-06-12T02:27:13.323Z",
    "sourcePublishedAt": "2026-06-09",
    "sourcePublishedDate": "2026-06-09",
    "eventDate": "2026-06-12",
    "dateDiscovered": "2026-06-12",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-06-12T02:28:37.520Z",
    "deck": "The Court Club, a private members-only racquet and wellness club rising near West Palm Beach, points to a broader shift in Palm Beach County’s luxury lifestyle market: buyers are not just looking for homes, but for curated social, athletic, and family-oriented environments around them.",
    "description": "The Court Club, a private members-only racquet and wellness club rising near West Palm Beach, points to a broader shift in Palm Beach County’s luxury lifestyle market: buyers are not just looking for homes, but for curated social, athletic, and family-oriented environments around them.",
    "summary": "The Court Club, a private members-only racquet and wellness club rising near West Palm Beach, points to a broader shift in Palm Beach County’s luxury lifestyle market: buyers are not just looking for homes, but for curated social, athletic, and family-oriented environments around them.",
    "bodySections": [
      {
        "heading": "Introduction",
        "body": "A private racquet club rising just south of Trump International Golf Club is becoming one of the clearest examples of how West Palm Beach’s growth story is expanding beyond offices, restaurants, and residential towers. The Court Club, under construction at 1591 Kirk Road in Palm Springs, is being positioned as a members-only destination built around racquet sports, wellness, dining, and family programming.",
        "image": "/assets/editorial/court-club-private-racquet-club-west-palm-beach-2026-06-09-body-1.jpg"
      },
      {
        "heading": "A Club Built Around the New Social Demand",
        "body": "According to the Palm Beach Post, the Court Club is planned with six padel courts, six tennis courts, and at least two pickleball courts, along with a clubhouse, dining, fitness, spa, pool, and a schedule of athletic, cultural, and family events.\n\nThe demand appears to be arriving before the doors open. The project reportedly already has 100 founding families and a wait list of roughly 700 applicants, a notable signal in a market where private clubs, wellness, and curated social spaces are becoming part of the broader real estate conversation.",
        "image": "/assets/editorial/court-club-private-racquet-club-west-palm-beach-2026-06-09-body-2.jpg"
      },
      {
        "heading": "Why This Matters for the West Palm Beach Market",
        "body": "For buyers looking at West Palm Beach, Palm Beach, and the surrounding neighborhoods, the Court Club is not just another amenity project. It reflects a larger lifestyle shift: affluent residents want access to places that feel social, polished, active, and family-friendly without relying only on traditional country club models.\n\nThat matters because the next phase of demand in Palm Beach County is increasingly tied to how people actually live once they arrive. New restaurants, private clubs, wellness concepts, walkable districts, and youth programming all help turn population growth into a more complete lifestyle ecosystem.",
        "image": "/assets/editorial/court-club-private-racquet-club-west-palm-beach-2026-06-09-body-1.jpg"
      },
      {
        "heading": "The NDT and Hospitality Connection",
        "body": "The project also connects to several familiar names in the local development and hospitality world. NDT Development, the West Palm Beach-based firm behind Nora and the Cove Club, is one of the partners involved in the Court Club. Nick Coniglio, known locally for Cucina in Palm Beach as well as E.R. Bradley’s and Lamarina in West Palm Beach, is also part of the club’s hospitality side.\n\nThat mix is important. The most successful private clubs in today’s market are not just athletic facilities. They operate more like lifestyle platforms, combining design, food and beverage, programming, wellness, and social identity."
      },
      {
        "heading": "A Family-Friendly Alternative to the Traditional Club Model",
        "body": "The Court Club is also being framed around family use, not just adult socializing. Plans include Court Kids, with camps, clinics, supervised play, and youth activities. That gives the project a different angle than an adults-only social club or a purely athletic racquet facility.\n\nThe idea is especially relevant in a market seeing continued in-migration from families, executives, and high-net-worth households who want structured activities for children, fitness for adults, and a social environment that does not require a full residential country club commitment.",
        "image": "/assets/editorial/court-club-private-racquet-club-west-palm-beach-2026-06-09-body-2.jpg"
      },
      {
        "heading": "Membership Pricing and Timing",
        "body": "Membership is being positioned at the high end of the local private club market. The Palm Beach Post reported an initiation fee of $45,000 and annual dues of $9,500.\n\nThe full club is expected to open by March 1, 2027, with tennis courts potentially opening earlier, around December. If the wait list is any indication, the project is arriving into a market already primed for more private, highly programmed lifestyle spaces."
      },
      {
        "heading": "The Bottom Line",
        "body": "The Court Club adds another layer to the West Palm Beach lifestyle story. Alongside new residential development, private clubs, chef-driven restaurants, wellness concepts, and mixed-use districts are helping define what the next generation of Palm Beach County living looks like.\n\nFor buyers, the takeaway is simple: the area’s appeal is no longer just about proximity to Palm Beach or downtown West Palm Beach. It is increasingly about the private and semi-private lifestyle infrastructure forming around them."
      }
    ],
    "whyItMatters": "",
    "buyerContext": "",
    "newsletterHeadline": "Private Racquet Club Near West Palm Beach Signals the Next Wave of Lifestyle Demand",
    "newsletterBlurb": "The Court Club, a private members-only racquet and wellness club rising near West Palm Beach, points to a broader shift in Palm Beach County’s luxury lifestyle market: buyers are not just looking for homes, but for curated social, athletic, and family-oriented environments around them.",
    "newsletterCta": "Read the article",
    "query": "Private Racquet Club Near West Palm Beach Signals the Next Wave of Lifestyle Demand",
    "category": "general",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/court-club-private-racquet-club-west-palm-beach-2026-06-09-hero.jpg",
    "sourceLinks": [
      {
        "label": "Palm Beach Post",
        "url": "https://www.palmbeachpost.com/story/business/real-estate/2026/06/09/court-club-near-west-palm-beach-courts-members-as-wait-list-hits-700/90360392007/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "frisbie-group-palm-beach-county-setbacks-investment-fund-2026-06-08",
    "slug": "frisbie-group-palm-beach-county-setbacks-investment-fund-2026-06-08",
    "title": "Frisbie Group Hits Turbulence as Palm Beach County Ambitions Keep Growing",
    "sourceName": "The Real Deal",
    "sourceUrl": "https://therealdeal.com/miami/2026/06/08/frisbie-group-navigates-setbacks-in-palm-beach-county/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/06/08/frisbie-group-navigates-setbacks-in-palm-beach-county/",
    "sourceTitle": "Frisbie Group Hits Turbulence as Palm Beach County Ambitions Keep Growing",
    "publishedAt": "2026-06-10T04:17:20.671Z",
    "sourcePublishedAt": "2026-06-10",
    "sourcePublishedDate": "2026-06-10",
    "eventDate": "2026-06-10",
    "dateDiscovered": "2026-06-10",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-06-11T04:14:46.168Z",
    "deck": "After a rejected Boca Raton redevelopment plan and a Palm Beach assemblage sale, Frisbie Group is navigating a tougher public-development climate — even as the family firm lines up a major South Florida investment push.",
    "description": "After a rejected Boca Raton redevelopment plan and a Palm Beach assemblage sale, Frisbie Group is navigating a tougher public-development climate — even as the family firm lines up a major South Florida investment push.",
    "summary": "After a rejected Boca Raton redevelopment plan and a Palm Beach assemblage sale, Frisbie Group is navigating a tougher public-development climate — even as the family firm lines up a major South Florida investment push.",
    "bodySections": [
      {
        "heading": "A rare public stumble for a powerful Palm Beach Name",
        "body": "Frisbie Group has spent years building a reputation as one of Palm Beach County’s most influential private real estate families. But the latest reporting from The Real Deal shows a more complicated moment for the firm: ambitious projects, public pushback, and a market where even well-capitalized local players do not automatically get a green light.\n\nThe headline is not that Frisbie Group is slowing down. It is that the firm is moving into bigger, more public-facing projects — and those projects are running into the kind of civic resistance that now defines much of South Florida development."
      },
      {
        "heading": "The Palm Beach assemblage that got away",
        "body": "In Palm Beach, Frisbie Group and its partners sold an assemblage anchored by the former IberiaBank building at 180 Royal Palm Way to CS Ventures after previously paying $26 million for the site in 2021, according to The Real Deal.\n\nThe plan had called for renovating two existing buildings and adding six luxury residences, but the proposal was pulled before a March development review meeting after mounting neighborhood opposition. For Palm Beach, that is the real story: small site, big scrutiny. Even a limited luxury residential plan can become politically difficult when it sits inside the town’s hyper-sensitive development environment."
      },
      {
        "heading": "One Boca became a public referendum on private development",
        "body": "The larger setback came in Boca Raton, where voters rejected One Boca, a proposed redevelopment of city-owned land by Frisbie Group and Terra. The plan was not small: The Real Deal reported it included 847 residential units, a 180-key hotel, 120,000 square feet of office space, a grocery store and a new government campus.\n\nThe proposal became a flashpoint over public land, scale and control. Voters rejected the land sale by a wide margin, and the political fallout helped elevate the Save Boca movement. The city later approved an ordinance requiring voter approval before selling more than half an acre of public land."
      },
      {
        "heading": "Why this matters in West Palm Beach",
        "body": "For West Palm Beach buyers, the Frisbie story matters because it shows where the next phase of development risk is coming from. It is no longer just construction costs, interest rates or luxury demand. Public approval, neighborhood organization and civic trust are becoming central to whether major projects advance.\n\nThat matters for projects across the county, including West Palm Beach and the South Flagler corridor, where development has become larger, more visible and more closely watched."
      },
      {
        "heading": "Still raising the stakes",
        "body": "The setbacks do not mean Frisbie Group is retreating. The firm is reportedly partnering with 1789 Capital on a $1 billion real estate investment fund focused on South Florida opportunities, including Palm Beach and Boca Raton.\n\nThat move points in the opposite direction: more capital, larger ambitions and a broader regional footprint. The same article notes that the firm remains active in major projects, including Westgate Village, the planned redevelopment of the former Palm Beach Kennel Club site in partnership with Terra, and Forge Mountain Club in Tennessee."
      },
      {
        "heading": "A family firm in transition",
        "body": "The Real Deal frames this as part of a generational transition. Rob Frisbie Jr. and Cody Crowell are now leading a firm founded by Rob Sr., Rick and Dave Frisbie, whose early work included Boston brownstones before the family launched Frisbie Group in Palm Beach in the 1990s.\n\nThat transition is happening as the company’s project profile changes. The firm is no longer only associated with private homes, boutique Palm Beach redevelopment and luxury repositioning. It is now attached to billion-dollar capital plans, civic redevelopment fights and regional-scale proposals."
      },
      {
        "heading": "The South Flagler House footnote",
        "body": "The company’s role in South Flagler House remains part of the broader West Palm Beach story. Frisbie Group and Hines acquired the waterfront development site at 1355 South Flagler Drive, later selling the project to Related Companies for $194.6 million after litigation with Two Roads Development was settled, according to The Real Deal.\n\nThat deal underscores a recurring theme: Frisbie Group has been close to some of the most important luxury development sites in the market, even when it does not ultimately carry every project across the finish line."
      },
      {
        "heading": "Buyer context",
        "body": "For buyers watching Palm Beach and West Palm Beach new construction, this is a reminder that not every announced concept becomes a finished building. Local politics, town review boards, resident opposition, land ownership structures and capital strategy can all change the path of a project.\n\nThe positive read is that demand for prime Palm Beach County development remains strong enough to keep major players circling. The cautionary read is that the entitlement process is becoming more selective, more public and less forgiving."
      },
      {
        "heading": "The bottom line",
        "body": "Frisbie Group may be navigating a rough patch, but this is not a disappearing act. It is a pressure test. The firm still has deep Palm Beach roots, active projects, powerful partners and access to significant capital.\n\nThe bigger takeaway is about the market itself: Palm Beach County development has entered a more political era. Capital still matters. Relationships still matter. But community permission is becoming its own form of currency."
      }
    ],
    "whyItMatters": "Frisbie Group’s recent setbacks show how entitlement risk, public opposition and political scrutiny are becoming central issues for Palm Beach County development — even for established local players.",
    "buyerContext": "",
    "newsletterHeadline": "Frisbie Group Hits Turbulence as Palm Beach County Ambitions Keep Growing",
    "newsletterBlurb": "After a rejected Boca Raton redevelopment plan and a Palm Beach assemblage sale, Frisbie Group is navigating a tougher public-development climate — even as the family firm lines up a major South Florida investment push.",
    "newsletterCta": "Read the article",
    "query": "Frisbie Group Hits Turbulence as Palm Beach County Ambitions Keep Growing",
    "category": "development",
    "relatedProjectIds": [
      "south-flagler-house",
      "westgate-village"
    ],
    "relatedCorridorIds": [
      "palm-beach",
      "downtown",
      "south-flagler",
      "boca-raton"
    ],
    "relatedProjectSlugs": [
      "south-flagler-house",
      "westgate-village"
    ],
    "relatedCorridors": [
      "palm-beach",
      "downtown",
      "south-flagler",
      "boca-raton"
    ],
    "primaryProjectSlug": "south-flagler-house",
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/frisbie-group-palm-beach-county-setbacks-investment-fund-2026-06-08-hero.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal: Real estate powerhouse Frisbie Group navigates string of setbacks",
        "url": "https://therealdeal.com/miami/2026/06/08/frisbie-group-navigates-setbacks-in-palm-beach-county/",
        "type": "source"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "pine-crest-west-palm-beach-campus-2026-06-08",
    "slug": "pine-crest-west-palm-beach-campus-2026-06-08",
    "title": "Pine Crest's West Palm Beach campus adds another family-infrastructure signal",
    "sourceName": "Palm Beach Post and Pine Crest School",
    "sourceUrl": "https://www.palmbeachpost.com/story/business/real-estate/2026/06/03/south-floridas-pine-crest-private-school-will-open-a-west-palm-campus/90391865007/",
    "canonicalUrl": "https://www.palmbeachpost.com/story/business/real-estate/2026/06/03/south-floridas-pine-crest-private-school-will-open-a-west-palm-campus/90391865007/",
    "sourceTitle": "South Florida's Pine Crest private school will open a West Palm campus",
    "publishedAt": "2026-06-08T09:00:00-04:00",
    "sourcePublishedAt": "2026-06-03",
    "sourcePublishedDate": "2026-06-03",
    "eventDate": "2026-06-03",
    "dateDiscovered": "2026-06-08",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-06-08",
    "deck": "Pine Crest School's planned West Palm Beach campus strengthens the city's shift from seasonal luxury market to full-time executive family destination.",
    "description": "Pine Crest's planned West Palm Beach campus adds another family-infrastructure signal for buyers tracking the city's long-term residential demand.",
    "summary": "For West Palm Beach buyers, Pine Crest's planned campus is not just school news. It is another sign that the city is building the full-time infrastructure needed to support relocating families, executives, and long-term residential demand.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Pine Crest announced plans for a West Palm Beach campus in June 2026, supported by a philanthropic commitment from the Stephen M. Ross Foundation. The Palm Beach Post also covered the planned campus as part of the school's South Florida expansion."
      },
      {
        "heading": "Why buyers should watch it",
        "body": "Private-school access is one of the practical signals that can turn a luxury condo market from a seasonal destination into a stronger full-time relocation market. A Pine Crest presence in West Palm Beach would add another family-infrastructure point alongside the city's office, dining, medical, and waterfront residential growth."
      },
      {
        "heading": "What is still unknown",
        "body": "Public details such as exact location, grade levels, admissions timing, and opening date have not yet been finalized. Buyers should treat this as a long-term infrastructure signal rather than a near-term guarantee for any specific building or corridor."
      }
    ],
    "whyItMatters": "The announcement helps explain why West Palm Beach's luxury-condo demand is increasingly tied to full-time living infrastructure, not only waterfront views and seasonal migration.",
    "buyerContext": "This is most useful for relocating families and buyers comparing West Palm Beach with Palm Beach, Miami, or Fort Lauderdale. It does not change current building pricing, but it adds context to long-term demand around family-friendly luxury living.",
    "newsletterHeadline": "Pine Crest plans a West Palm campus",
    "newsletterBlurb": "The planned campus gives West Palm Beach another family-infrastructure signal as the city continues shifting toward full-time executive and family demand.",
    "newsletterCta": "See what it means for buyers",
    "query": "Pine Crest West Palm Beach campus Stephen M. Ross Foundation",
    "category": "city",
    "relatedProjectIds": [
      "south-flagler-house",
      "la-clara",
      "forte",
      "mr-c",
      "nora-house"
    ],
    "relatedCorridorIds": [
      "downtown",
      "south-flagler",
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "south-flagler-house",
      "la-clara",
      "forte",
      "mr-c",
      "nora-house"
    ],
    "relatedCorridors": [
      "downtown",
      "south-flagler",
      "north-flagler"
    ],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/pine-crest-west-palm-beach-campus-hero.jpg",
    "sourceLinks": [
      {
        "label": "Palm Beach Post Pine Crest West Palm Beach campus coverage",
        "url": "https://www.palmbeachpost.com/story/business/real-estate/2026/06/03/south-floridas-pine-crest-private-school-will-open-a-west-palm-campus/90391865007/",
        "type": "news"
      },
      {
        "label": "Pine Crest Growing Together announcement",
        "url": "https://www.pinecrest.edu/growing-together",
        "type": "official"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium",
    "primaryProjectSlug": "south-flagler-house"
  },
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
