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
  bodySections?: { heading: string; body: string; image?: string; imageAlt?: string; imageCaption?: string; imageCredit?: string }[];
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
    "id": "west-palm-point-tent-site-delay-2029-2026-09-25",
    "slug": "west-palm-point-tent-site-delay-2029-2026-09-25",
    "title": "West Palm Point Faces Another Delay — But a $350M Investment Could Finally Move the ‘Tent Site’ Forward",
    "sourceName": "City of West Palm Beach CRA",
    "sourceUrl": "https://www.wpb.org/Departments/Community-Redevelopment-Agency/DowntownCity-Center/Okeechobee-Corridor",
    "canonicalUrl": "https://www.wpb.org/Departments/Community-Redevelopment-Agency/DowntownCity-Center/Okeechobee-Corridor",
    "sourceTitle": "West Palm Point Faces Another Delay — But a $350M Investment Could Finally Move the ‘Tent Site’ Forward",
    "publishedAt": "2026-09-25T20:16:53.550Z",
    "sourcePublishedAt": "2026-09-24",
    "sourcePublishedDate": "2026-09-24",
    "eventDate": "2026-09-25",
    "dateDiscovered": "2026-09-25",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-25T20:16:53.550Z",
    "deck": "The long-delayed gateway tower is seeking a new January 2029 completion deadline as West Palm Beach officials weigh frustration with the developer against a proposed $350 million investment that could finally put the project on firmer footing.",
    "description": "West Palm Point's developer is seeking until January 2029 to complete the long-delayed Tent Site tower as West Palm Beach weighs a proposed $350 million investment and new financial protections.",
    "summary": "The long-delayed gateway tower is seeking a new January 2029 completion deadline as West Palm Beach officials weigh frustration with the developer against a proposed $350 million investment that could finally put the project on firmer footing.",
    "bodySections": [
      {
        "heading": "Introduction",
        "body": "One of downtown West Palm Beach’s most prominent development sites is facing another major delay.\n\nWest Palm Point, the glass office tower rising on the long-vacant “Tent Site” at Okeechobee Boulevard and South Dixie Highway, was supposed to be completed by August 2027. Developer Cohen Brothers Realty is now asking the city for an additional 17 months, pushing the deadline to January 2029.\n\nThe request has not gone over quietly at City Hall. Mayor Keith James and members of the West Palm Beach Community Redevelopment Agency expressed considerable frustration during a September meeting after years of slow progress at the city-owned property. The city had already notified the developer that it was in default under its 49-year ground lease.\n\nBut there is now a significant reason the city may agree to give West Palm Point more time: approximately $350 million in new investment could be tied to the extension."
      },
      {
        "heading": "A $350 Million Reason to Keep Going",
        "body": "According to the CRA's attorney, Lendlease is prepared to partner on the project and commit approximately $350 million, but wants the city's lease amendment in place before making that commitment.\n\nThat changes the equation considerably.\n\nWest Palm Point has spent years caught between ambitious plans, permitting delays and financial uncertainty. A capital commitment of that scale could provide a much clearer path toward completing one of downtown's longest-running development sagas.\n\nThe proposed extension also comes with something West Palm Beach has been missing during much of the delay: financial consequences for taking longer.\n\nUnder the proposed agreement, approximately $1 million in annual ground rent would begin in September 2027 — whether or not the building is finished.\n\nBeginning in January 2028, the developer would also begin making estimated tax-equivalent payments of approximately $400,000 per month, according to the CRA's attorney.\n\nIn other words, extending the deadline would no longer mean simply extending the period before the city gets paid."
      },
      {
        "heading": "Why the ‘Tent Site’ Matters",
        "body": "The controversy surrounding West Palm Point isn't just about a late construction project.\n\nThe roughly 2.4-acre property occupies one of the most visible entrances into downtown West Palm Beach, where Okeechobee Boulevard meets South Dixie Highway.\n\nThe CRA has described the city-owned parcel as a prime entryway into downtown, and the property was appraised at approximately $25.7 million when the current redevelopment effort was established. The CRA entered into its development agreement with Cohen Brothers Realty in 2020, and the project's site plan received City Commission approval in January 2022.\n\nThe city has been attempting to redevelop the site in various forms for roughly three decades.\n\nThat history explains some of the frustration now coming from City Hall."
      },
      {
        "heading": "What Is Planned for West Palm Point?",
        "body": "West Palm Point is envisioned as a major Class A office and retail development centered around a distinctive elliptical glass tower.\n\nThe project occupies an especially important position at the western entrance to the downtown core, immediately east of the rapidly developing Okeechobee corridor.\n\nAnd unlike some West Palm Beach proposals that remain largely conceptual, West Palm Point has moved into construction. The city's own current road-and-construction updates list the project as active, although city materials have referenced a spring 2028 timeframe that now appears increasingly difficult to reconcile with the developer's requested January 2029 completion deadline.\n\nThe West Palm Beach Residents Coalition's development tracker currently lists West Palm Point as under construction with a foundation permit issued.",
        "image": "/assets/editorial/west-palm-point-tent-site-delay-2029-2026-09-25-body-1.jpg",
        "imageAlt": "Architectural rendering of the planned West Palm Point office tower and surrounding buildings.",
        "imageCaption": "Rendering of the planned West Palm Point development; it does not show current site conditions.",
        "imageCredit": "Image provided by Brooke Snader."
      },
      {
        "heading": "Years of Financial Trouble Complicated the Project",
        "body": "The delays have unfolded alongside broader financial problems involving developer Charles Cohen and his real estate holdings.\n\nIn 2024, Cohen's company defaulted on a $535 million loan from Fortress Investment Group, ultimately losing several properties.\n\nWest Palm Point encountered its own financing trouble in 2025 when a lender filed a foreclosure lawsuit alleging that the project's ownership entity had failed to repay a $10 million preconstruction loan. That case was subsequently dismissed.\n\nMeanwhile, the City of West Palm Beach eventually determined that the developer itself was in default under requirements of the Tent Site lease.\n\nCohen has maintained that the project remains firmly on track despite those setbacks. In a statement provided to the Palm Beach Post, he acknowledged the delays but said his team remains committed to delivering the development and pointed to visible construction progress at the site."
      },
      {
        "heading": "A Very Different Downtown Than the One West Palm Point Started In",
        "body": "There is some irony in how long West Palm Point has taken.\n\nWhen Cohen Brothers secured the Tent Site in 2020, West Palm Beach's transformation into a major destination for financial firms and corporate offices was still accelerating.\n\nSix years later, West Palm Point is entering a dramatically different market.\n\nNew office towers have reshaped the Okeechobee corridor, billions of dollars of residential development are underway across downtown and the waterfront, and competition for tenants at the top end of the office market has increased substantially.\n\nThat makes West Palm Point arguably more important architecturally — but also means it can no longer rely simply on being one of the newest premium office buildings downtown.\n\nIt has to arrive."
      },
      {
        "heading": "What Happens Next",
        "body": "The CRA has scheduled a special meeting for September 28 to consider the proposed amendment. As of September 25, no final extension has been approved.\n\nThe decision puts city commissioners in an unusual position.\n\nThey are dealing with a developer whose performance on the property has generated obvious frustration and whose existing agreement has already fallen into default.\n\nAt the same time, the project is under construction, the proposed agreement would begin generating substantial revenue for the city before completion, and a reported $350 million investment is contingent on getting the amendment resolved.\n\nFor a parcel West Palm Beach has spent decades trying to develop, walking away and starting over would carry its own costs and delays.\n\nThat may ultimately be the most important context surrounding the latest West Palm Point deadline.\n\nJanuary 2029 is considerably later than West Palm Beach expected. But after decades of plans for the Tent Site, the more consequential question is whether this extension finally comes with enough capital — and enough financial pressure — to make West Palm Point a reality."
      }
    ],
    "whyItMatters": "",
    "buyerContext": "",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "West Palm Point Faces Another Delay — But a $350M Investment Could Finally Move the ‘Tent Site’ Forward",
    "newsletterBlurb": "The long-delayed gateway tower is seeking a new January 2029 completion deadline as West Palm Beach officials weigh frustration with the developer against a proposed $350 million investment that could finally put the project on firmer footing.",
    "newsletterCta": "Read the article",
    "query": "West Palm Point Faces Another Delay — But a $350M Investment Could Finally Move the ‘Tent Site’ Forward",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/west-palm-point-tent-site-delay-2029-2026-09-25-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach CRA — Okeechobee Corridor",
        "url": "https://www.wpb.org/Departments/Community-Redevelopment-Agency/DowntownCity-Center/Okeechobee-Corridor",
        "type": "city planning material"
      },
      {
        "label": "West Palm Point official site",
        "url": "https://www.westpalmpoint.com/",
        "type": "official project site"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "palm-beach-county-data-center-moratorium-project-tango-2026-09-24",
    "slug": "palm-beach-county-data-center-moratorium-project-tango-2026-09-24",
    "title": "Palm Beach County Pauses Large Data Centers After Project Tango Rejection",
    "sourceName": "WPTV via WFLX",
    "sourceUrl": "https://www.wflx.com/2026/09/24/palm-beach-county-commissioners-unanimously-approve-moratorium-new-hyperscale-ai-data-centers/",
    "canonicalUrl": "https://www.wflx.com/2026/09/24/palm-beach-county-commissioners-unanimously-approve-moratorium-new-hyperscale-ai-data-centers/",
    "sourceTitle": "Palm Beach County Pauses Large Data Centers After Project Tango Rejection",
    "publishedAt": "2026-09-24T22:23:00.790Z",
    "sourcePublishedAt": "2026-09-24",
    "sourcePublishedDate": "2026-09-24",
    "eventDate": "2026-09-24",
    "dateDiscovered": "2026-09-24",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-24T22:23:00.790Z",
    "deck": "A yearlong moratorium gives the county time to develop rules for noise, utilities and neighborhood compatibility. But it does not erase development rights already approved.",
    "description": "Palm Beach County’s data center pause follows Project Tango’s rejection. Learn what it covers, what remains approved and what nearby homebuyers should watch.",
    "summary": "Palm Beach County’s data center pause follows Project Tango’s rejection. Learn what it covers, what remains approved and what nearby homebuyers should watch.",
    "bodySections": [
      {
        "heading": "Introduction",
        "body": "Palm Beach County commissioners unanimously approved a moratorium on September 24, 2026, temporarily blocking certain new large data-center applications in the unincorporated county. The measure follows the county’s July rejection of Project Tango’s requested expansion near the Arden community—but existing approvals on the property remain an important part of the story. The lead image is illustrative; it does not show Central Park Commerce Center or indicate that the site is closed."
      },
      {
        "heading": "What the county’s pause actually covers",
        "body": "The moratorium applies to new zoning requests and related comprehensive-plan amendments for data centers with anticipated peak electrical demand of 50 megawatts or more in unincorporated Palm Beach County. During the pause, the county will not accept, process or approve qualifying applications. It may end earlier if permanent regulations are adopted.\n\nThe threshold is based on power demand, rather than building size. WLRN reported during the August first reading that county staff would evaluate electrical demand across an entire property, so an operator could not avoid the threshold by dividing a large operation into smaller parcels.\n\nThis is a targeted land-use measure. It is not a general construction moratorium and does not suspend West Palm Beach’s residential condominium pipeline. Its stated scope is qualifying data-center applications in unincorporated county areas.\n\nThe process began before Tango’s rejection. Commissioners directed staff to pursue a moratorium in July, with the measure moving through subsequent hearings before September’s final adoption."
      },
      {
        "heading": "Why Project Tango became the flashpoint",
        "body": "Project Tango is associated with Central Park Commerce Center, an approximately 202.7-acre property along Southern Boulevard next to Florida Power & Light’s West County Energy Center. The developer says the site has industrial and employment-use approvals dating to 2016 and points to its existing electrical infrastructure.\n\nThe proposed expansion put a broader question before commissioners: whether a hyperscale computing operation belonged near established homes and a school. WLRN reported that Tango requested 600 megawatts of power, illustrating the scale of the proposal relative to the county’s 50-megawatt threshold.\n\nOn July 15, commissioners rejected the proposal by a 5–1 vote after a public hearing that lasted more than 12 hours. Residents and teachers raised concerns about noise, vibration, water use and the project’s proximity to Arden and Saddle View Elementary School. Commissioners concluded that the applicant had not adequately addressed concerns about nearby impacts.",
        "image": "/assets/editorial/palm-beach-county-data-center-moratorium-project-tango-2026-09-24-body-1.jpg",
        "imageAlt": "Illustration of residents attending a county commission hearing as officials review data-center plans.",
        "imageCaption": "Illustrative county-hearing scene; not a photograph of the September 24 vote or the Project Tango review.",
        "imageCredit": "Image provided by Brooke Snader."
      },
      {
        "heading": "The developer’s case—and the questions that remain",
        "body": "The development team argues that the property’s industrial history and proximity to electrical infrastructure make it suitable for a data center. Its published materials describe enclosed equipment, setbacks and landscaped buffers intended to reduce off-site sound.\n\nWater use has also been contested. The developer says the proposed design would use closed-loop cooling, recirculating water rather than continuously replacing it. It projects about 5,000 gallons of daily potable-water demand at full buildout, primarily for ordinary employee uses after the cooling system’s initial fill. Those are the developer’s projections, not measurements from an operating facility.\n\nThe central planning question is how those claims would be evaluated and enforced. The county has not yet adopted permanent rules governing the location and operation of large data centers. Noise, water and utility demands, and compatibility with nearby homes and schools remain part of that policy debate."
      },
      {
        "heading": "What can still happen at the site",
        "body": "An existing county-approved site plan includes two 100,000-square-foot data-center buildings, a 1.2-million-square-foot warehouse and a 6,000-square-foot office, for a combined 1.406 million square feet. Separately, county records describe a broader master plan of about 2.02 million square feet across multiple uses. That figure should not be mistaken for 2 million square feet of data centers.\n\nThe July denial was without prejudice, leaving the developer able to revise and reapply through the applicable approval process. A revised application would still be subject to the rules in effect when it is filed, including the temporary moratorium where applicable.\n\nThe practical takeaway is straightforward: the county stopped the requested expansion, but it did not return the property to land without development rights.",
        "image": "/assets/editorial/palm-beach-county-data-center-moratorium-project-tango-2026-09-24-body-2.jpg",
        "imageAlt": "Illustration of a data center beside a residential neighborhood at sunset.",
        "imageCaption": "Conceptual aerial-style illustration of a data center near homes; not an aerial photograph, site plan or rendering of Project Tango.",
        "imageCredit": "Image provided by Brooke Snader."
      },
      {
        "heading": "What buyers should watch next",
        "body": "The next significant decision is what replaces the temporary pause. Officials have discussed possible restrictions addressing location, proximity to homes and schools, noise, water use and other operating impacts. Those discussions are not a finished set of permanent regulations.\n\nOn September 24, commissioners chose to have staff return with a consultant contract to help develop rules. The scope and recommendations of that work will shape what standards apply to future proposals.\n\nFor buyers, Tango offers a practical due-diligence lesson: examine both what is proposed nearby and what has already been approved. Check the permitted uses on neighboring parcels, which approvals remain active, which buffers and operating conditions are enforceable, and which assurances appear only in a presentation rather than an approval document.\n\nThe moratorium creates time to write new rules. It does not make the surrounding land-use questions disappear."
      }
    ],
    "whyItMatters": "For nearby homebuyers, a rejected expansion does not necessarily erase existing development approvals. Check the approved site plan, permitted uses and enforceable operating conditions alongside any proposed changes.",
    "buyerContext": "For nearby homebuyers, a rejected expansion does not necessarily erase existing development approvals. Check the approved site plan, permitted uses and enforceable operating conditions alongside any proposed changes.",
    "buyerTakeaway": "A rejected expansion does not necessarily erase existing development approvals. Check the approved site plan, permitted uses and enforceable operating conditions alongside any proposed changes.",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "Follow the county’s permanent data-center regulations and any revised Project Tango application.",
    "buyerQuestions": "Which neighboring uses and site-plan approvals remain active? Which operating conditions are enforceable?",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Arden"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Palm Beach County Pauses Large Data Centers After Project Tango Rejection",
    "newsletterBlurb": "What Palm Beach County’s new data-center moratorium covers, what Project Tango approvals remain and what nearby buyers should watch.",
    "newsletterCta": "Read the article",
    "query": "Palm Beach County Pauses Large Data Centers After Project Tango Rejection",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/palm-beach-county-data-center-moratorium-project-tango-2026-09-24-hero.jpg",
    "sourceLinks": [
      {
        "label": "Palm Beach County commissioners approve one-year data-center moratorium",
        "url": "https://www.wflx.com/2026/09/24/palm-beach-county-commissioners-unanimously-approve-moratorium-new-hyperscale-ai-data-centers/",
        "type": "local news coverage"
      },
      {
        "label": "Palm Beach County weighs new rules for large data centers",
        "url": "https://www.wlrn.org/government-politics/2026-08-27/palm-beach-county-artificial-intelligence-data-centers",
        "type": "local news coverage"
      },
      {
        "label": "Project Tango zoning and site-plan documents",
        "url": "https://discover.pbcgov.org/pzb/zoning/Pages/Project_Tango.aspx",
        "type": "county planning records"
      },
      {
        "label": "Palm Beach County rejects Project Tango expansion; approved site plan remains",
        "url": "https://www.wflx.com/2026/07/17/palm-beach-county-commissioners-reject-project-tango-data-center-development-still-approved-site/",
        "type": "local news coverage"
      },
      {
        "label": "Palm Beach County rejects Project Tango data-center expansion",
        "url": "https://www.wlrn.org/government-politics/2026-07-16/project-tango-ai-data-center-palm-beach-rejected",
        "type": "local news coverage"
      },
      {
        "label": "Central Park Commerce Center project information",
        "url": "https://www.centralparkcommercecenter.com/",
        "type": "developer information"
      },
      {
        "label": "County commission approves moratorium and plans consultant-led rules",
        "url": "https://wjno.iheart.com/featured/florida-news/content-2026-09-24-palm-beach-county-commission-gives-final-approval-to-one-year-moratorium-on-data-centers/",
        "type": "local news coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "west-palm-downtown-plan-six-million-square-feet-growth-2026-09-23",
    "slug": "west-palm-downtown-plan-six-million-square-feet-growth-2026-09-23",
    "title": "West Palm’s Waterfront Towers Are Gone. Six Million Square Feet of Growth Is Not.",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/Departments/Development-Services/Planning-Division/Downtown-Master-Plan",
    "canonicalUrl": "https://www.wpb.org/Events-Folder/2026/091526-PB",
    "sourceTitle": "Downtown Master Plan Update and September 15 Planning Board hearing",
    "publishedAt": "2026-09-23T23:52:57.183Z",
    "sourcePublishedAt": "2026-09-15",
    "sourcePublishedDate": "2026-09-15",
    "eventDate": "2026-09-15",
    "dateDiscovered": "2026-09-23",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-23T23:52:57.183Z",
    "deck": "The Planning Board backed a revised downtown plan that keeps new 25-story incentives off most of Flagler Drive while shifting major growth capacity inland. The next fight is whether the city’s roads, services and public-benefit rules can carry it.",
    "description": "West Palm Beach’s Planning Board advanced a revised Downtown Master Plan with roughly 6 million square feet of added potential growth and a taller inland development spine.",
    "summary": "West Palm Beach removed the most controversial waterfront height proposal, then advanced a plan that could add roughly 6 million square feet of development capacity in other parts of downtown.",
    "bodySections": [
      {
        "heading": "The plan moved forward, but it is not finished",
        "body": "West Palm Beach’s Planning Board unanimously recommended approval of comprehensive-plan amendments tied to the Downtown Master Plan update on September 15. The board also separately backed bringing the Jaguar dealership property at Okeechobee Boulevard and South Dixie Highway into the downtown plan and recommended a proposed rooftop helipad at CityPlace.\n\nThose votes were milestones, not final approvals. A community meeting is scheduled for October 6, and another Planning Board discussion is listed for October 20. The anticipated schedule then calls for City Commission review on October 26, followed by state-agency review and a possible final adoption hearing in January 2027. Later dates remain subject to change until they appear on final agendas.\n\nThat procedural line matters. West Palm Beach has decided to keep the rewrite moving, but the rules that will govern the next generation of downtown development are still being shaped.",
        "image": "/assets/editorial/west-palm-downtown-plan-six-million-square-feet-growth-2026-09-23-body-1.jpg",
        "imageAlt": "Editorial illustration of a municipal planning board hearing in a wood-paneled chamber",
        "imageCaption": "The September 15 Planning Board action was a recommendation. City Commission hearings and state review still stand between the draft and final adoption.",
        "imageCredit": "Provided editorial illustration"
      },
      {
        "heading": "The waterfront fight changed the map",
        "body": "The spring version drew its sharpest opposition from a proposal that could have allowed buildings as tall as 25 stories on portions of Flagler Drive. That incentive is gone. A separate proposal for 12-story buildings on another waterfront segment was also withdrawn, leaving most of the affected waterfront under its lower existing framework.\n\nThe height did not disappear from the plan. It moved inland. The current draft allows incentive height as high as 25 stories in parts of the transit-oriented and Quadrille business districts, with other interior areas eligible for increases up to 15 stories. The likely result is a different skyline: a lower civic edge along much of Flagler and a taller spine around rail, CityPlace, Quadrille and Okeechobee Boulevard.\n\nThat shift may be the plan’s most durable idea. Surface lots and low-intensity sites near the stations become more valuable redevelopment candidates, while waterfront owners gain more certainty about the proposal immediately across Flagler.",
        "image": "/assets/editorial/west-palm-downtown-plan-six-million-square-feet-growth-2026-09-23-body-2.jpg",
        "imageAlt": "Editorial district diagram of downtown West Palm Beach showing the waterfront, business core, CityPlace and inland districts",
        "imageCaption": "Editorial district diagram for geographic context. It is not the adopted zoning map and should not be used to determine a parcel’s development rights.",
        "imageCredit": "Provided editorial illustration"
      },
      {
        "heading": "Six million square feet is the number to watch",
        "body": "Height dominates the public conversation because it is easy to picture. Development capacity is the quieter number with the larger consequence.\n\nCity staff told the Downtown Action Committee that the update could add a maximum of about 6 million square feet of potential development beyond roughly 13.2 million square feet still available under the current plan. That is an increase of about 45% in remaining potential capacity. It is theoretical capacity, not a construction forecast, and individual sites would still face design, access, market and approval constraints.\n\nThe scale is substantial beside the downtown that already exists. The city reports nearly 9,000 residential units and more than 10.4 million square feet of nonresidential development inside the approximately 767-acre planning area. The important question is therefore larger than whether one stretch of Flagler gets taller. It is where the next several million square feet can go and what West Palm Beach requires in return."
      },
      {
        "heading": "More value comes with more conditions",
        "body": "The proposed regulations treat added height and floor area as bargaining tools. Projects seeking incentives in designated districts would have to use development-rights programs or provide public benefits that can include housing, open space and improvements to the public realm. The draft also places more growth near Brightline and Tri-Rail, where the city argues transportation choices are strongest.\n\nParking is part of the economic equation. The proposal would allow required parking to fall by roughly 25% in some transit-oriented areas. A smaller garage can free space and capital for other uses, making difficult sites more feasible. It also makes the city’s transportation strategy inseparable from the zoning strategy: less parking works only if walking, transit, street operations and construction management work better than they do today.\n\nThe plan is therefore more than permission for larger buildings. It attempts to redirect private development value toward housing, open space and mobility while concentrating the largest increases away from most of the waterfront."
      },
      {
        "heading": "The Jaguar site shows what the new framework can unlock",
        "body": "The 2.5-acre Jaguar dealership property sits at one of downtown’s most visible gateways, where Okeechobee Boulevard meets South Dixie Highway. The Planning Board recommended adding it to the Downtown Master Plan, a change that could make a future mixed-use or residential redevelopment eligible for the Okeechobee district’s incentive framework and potential height of about 25 stories.\n\nNo tower was approved on September 15, and the owner has not presented a final development plan. The recommendation changes the rulebook that a later proposal could use. That distinction matters because the site is now automobile-oriented commercial property at the seam between CityPlace, the convention-center district and the route toward Palm Beach.\n\nIt also previews the next argument. Supporters see an infill site that could be held to downtown design and public-space standards. Opponents see a parcel-by-parcel expansion of capacity while the citywide infrastructure question remains open."
      },
      {
        "heading": "The infrastructure debate now crosses the bridges",
        "body": "Traffic is the hardest limit for the zoning plan to solve. City data presented during the September review showed Okeechobee Boulevard operating at roughly 98% to 99% of planning capacity between Australian and Rosemary avenues. West Palm Beach can require transportation-demand plans, improve signals and sidewalks, and make transit more useful. It cannot readily create another east-west boulevard or another bridge to Palm Beach.\n\nThat is why the debate has become regional. Palm Beach officials reviewed mapping this summer showing more than 100 West Palm Beach projects that were planned, approved, under construction or recently completed, including thousands of homes, hotels and more than 2 million square feet of commercial development. Town leaders emphasized that they cannot veto projects across the Intracoastal, but one council member described the two cities as part of a growing regional superstructure. Palm Beach’s own comprehensive plan says development in downtown West Palm Beach has affected the town’s roadways.\n\nThe revised plan answers the waterfront-height question more clearly than it did in spring. It does not yet settle how much growth the street network, utilities and emergency services can carry at once. That is the bigger development fight now beginning—and the test that will determine whether six million additional square feet becomes a well-managed urban center or simply more pressure on the same constrained routes.",
        "image": "/assets/editorial/west-palm-downtown-plan-six-million-square-feet-growth-2026-09-23-body-3.jpg",
        "imageAlt": "Editorial illustration of a crowded public meeting about downtown development and infrastructure",
        "imageCaption": "Resident groups have shifted the argument toward cumulative traffic, utilities, emergency services and the timing of public review.",
        "imageCredit": "Provided editorial illustration"
      }
    ],
    "whyItMatters": "The newest milestone shifts the debate from one waterfront height provision to the scale, location and infrastructure cost of downtown’s next growth cycle.",
    "buyerContext": "",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [
      "downtown-plan-advances-without-waterfront-height-incentive-2026-09-14"
    ],
    "newsletterHeadline": "The waterfront towers are gone. Six million square feet of growth is not.",
    "newsletterBlurb": "The Planning Board moved West Palm’s downtown rewrite forward. The new center of gravity is inland, and the unresolved question is whether the region’s infrastructure can keep pace.",
    "newsletterCta": "Read the development analysis",
    "query": "project-development: West Palm Beach Downtown Master Plan September 15 Planning Board 6 million square feet; narrow follow-ups for Jaguar site, Okeechobee capacity, and Palm Beach regional traffic",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [
      "downtown"
    ],
    "relatedProjectSlugs": [],
    "relatedCorridors": [
      "downtown"
    ],
    "corridorLabel": "Downtown",
    "imagePath": "/assets/editorial/west-palm-downtown-plan-six-million-square-feet-growth-2026-09-23-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach: Downtown Master Plan Update",
        "url": "https://www.wpb.org/Departments/Development-Services/Planning-Division/Downtown-Master-Plan",
        "type": "official primary source"
      },
      {
        "label": "City of West Palm Beach: September 15 Planning Board meeting",
        "url": "https://www.wpb.org/Events-Folder/2026/091526-PB",
        "type": "official public hearing"
      },
      {
        "label": "City planning staff report and draft regulations",
        "url": "https://www.wpb.org/files/assets/city/v/1/development-services/documents/downtown-master-plan/10.9-dmpu-staff-report.pdf",
        "type": "official planning document"
      },
      {
        "label": "WFLX: Planning Board recommendation and current plan debate",
        "url": "https://www.wflx.com/2026/09/23/west-palm-beach-advances-downtown-master-plan-residents-seek-balance-between-growth-livability/",
        "type": "independent local reporting"
      },
      {
        "label": "Stet News: added capacity, Jaguar site and September 9 hearing",
        "url": "https://stetnews.org/2026/09/10/west-palm-beach-residents-promise-the-fight-isnt-over/",
        "type": "independent local reporting"
      },
      {
        "label": "Stet News: Jaguar site background and city planning analysis",
        "url": "https://stetnews.org/2026/07/12/luxury-car-dealer-zooms-into-downtown-development-race/",
        "type": "independent local reporting"
      },
      {
        "label": "WFLX: Palm Beach regional traffic concerns",
        "url": "https://www.wflx.com/2026/08/04/palm-beach-leaders-sound-alarm-over-west-palm-beach-development-boom-traffic-concerns/?outputType=amp",
        "type": "independent regional reporting"
      },
      {
        "label": "Town of Palm Beach Comprehensive Plan",
        "url": "https://townofpalmbeach.com/DocumentCenter/View/222/Town-of-Palm-Beach-Comprehensive-Plan",
        "type": "official regional planning source"
      },
      {
        "label": "Downtown Neighborhood Association: anticipated review schedule",
        "url": "https://www.wpbdna.com/newsletter",
        "type": "community organization source"
      },
      {
        "label": "Save West Palm Beach: infrastructure concerns and October 6 meeting",
        "url": "https://www.savewestpalmbeach.org/",
        "type": "direct advocacy source"
      },
      {
        "label": "Hoodline: Jaguar, helipad and Planning Board actions",
        "url": "https://hoodline.com/2026/09/west-palm-beach-planning-board-backs-rooftop-helipad-recommends-jaguar-site-inclusion/",
        "type": "secondary local coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "related-ross-fort-partners-south-flagler-property-swap-2026-09-22",
    "slug": "related-ross-fort-partners-south-flagler-property-swap-2026-09-22",
    "title": "$40M Property Swap Redraws the South Flagler Waterfront Development Map",
    "sourceName": "The Real Deal",
    "sourceUrl": "https://therealdeal.com/miami/2026/09/21/related-ross-fort-partners-swap-west-palm-beach-properties/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/09/21/related-ross-fort-partners-swap-west-palm-beach-properties/",
    "sourceTitle": "$40M Property Swap Redraws the South Flagler Waterfront Development Map",
    "publishedAt": "2026-09-22T23:31:18.069Z",
    "sourcePublishedAt": "2026-09-21",
    "sourcePublishedDate": "2026-09-21",
    "eventDate": "2026-09-21",
    "dateDiscovered": "2026-09-22",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-22T23:31:18.069Z",
    "deck": "After more than a year of competing condo buyouts and litigation, Related Ross and Fort Partners traded neighboring West Palm Beach properties for $20 million each, dividing control of one of South Flagler Drive's most valuable remaining redevelopment zones.",
    "description": "Related Ross and Fort Partners completed two $20 million South Flagler property transactions, clarifying control around Harbor Towers and Southbridge.",
    "summary": "A matched pair of $20 million transactions gives Fort Partners near-total control of Harbor Towers and expands Related Ross' position beside Southbridge.",
    "bodySections": [
      {
        "heading": "The deal",
        "body": "A complicated battle for West Palm Beach waterfront land is finally sorting itself out. Related Ross and Fort Partners completed a pair of $20 million transactions involving neighboring properties near the southern end of South Flagler Drive, reshuffling parcels both developers had pursued since 2024.\n\nRelated Ross transferred 21 condominium units at Harbor Towers & Marina, 3901 South Flagler Drive, to an affiliate of Fort Partners. The acquisition brings Fort Partners' ownership to 60 of the 61 units in the two-building waterfront complex. At the same time, Related Ross acquired from Fort Partners the 25-unit apartment properties at 3906 Washington Road and 3907 South Flagler Drive, which Fort bought for $20 million in late 2024.\n\nOn paper, it is a pair of equal-value transactions. On the map, the exchange is more significant: each company now has a much clearer development position."
      },
      {
        "heading": "How the waterfront chessboard changed",
        "body": "Fort Partners entered this stretch in late 2024 with its purchase of the Washington Road and South Flagler apartment properties. Attention then shifted to Harbor Towers, a 61-unit condominium on roughly two waterfront acres at 3901 South Flagler Drive. Fort Partners and Related Ross both began acquiring units there, and the competition eventually moved into court over changes to the condominium's governing documents.\n\nThe developers settled their dispute outside court in October 2025 on undisclosed terms. Fort Partners continued assembling Harbor Towers. Related Ross concentrated on Southbridge, the low-rise condominium immediately south at 3915 South Flagler Drive.\n\nThe new transactions remove the biggest overlap between those strategies. Fort takes Related's Harbor Towers position. Related takes the former Fort apartment property beside Southbridge.",
        "image": "/assets/editorial/related-ross-fort-partners-south-flagler-property-swap-2026-09-22-body-1.jpg",
        "imageAlt": "Aerial location illustration identifying Harbor Towers at 3901 South Flagler Drive and Southbridge at 3915 South Flagler Drive",
        "imageCaption": "Harbor Towers and Southbridge sit within the same closely watched stretch of the South Flagler waterfront.",
        "imageCredit": "AI-generated editorial illustration"
      },
      {
        "heading": "Related Ross strengthens its Southbridge position",
        "body": "Related Ross had already assembled a substantial position at Southbridge after prevailing in a competing bid for the condominium. The developer paid $25.4 million for a 27-unit bulk purchase in January, following earlier acquisitions of 18 units, according to property reporting.\n\nAdding 3906 Washington Road and 3907 South Flagler Drive turns what looked like separate purchases into a more meaningful assemblage. The parcels now sit under the control of the same developer, although no combined redevelopment plan has been publicly announced.\n\nRelated Ross has demonstrated its appetite for luxury residential development along the corridor through South Flagler House and Edgeworth. The latest acquisition gives it another strategically placed property farther south, but architecture, unit count, height, timing and branding remain unknown.",
        "image": "/assets/editorial/related-ross-fort-partners-south-flagler-property-swap-2026-09-22-body-2.jpg",
        "imageAlt": "Editorial illustration of the existing Southbridge condominium property at 3915 South Flagler Drive",
        "imageCaption": "Related Ross has assembled a substantial position at Southbridge and now owns the neighboring former Fort Partners apartment property.",
        "imageCredit": "AI-generated editorial illustration"
      },
      {
        "heading": "Fort Partners nears total control of Harbor Towers",
        "body": "For Fort Partners, the exchange nearly completes the Harbor Towers assemblage. The company now controls 60 of the condominium's 61 units after acquiring Related Ross' remaining 21-unit position. Since April 2025, Fort has spent approximately $79.7 million on those 60 units, according to property data cited by The Real Deal. The remaining unit is reportedly owned by the condominium association itself.\n\nFort Partners plans to demolish and redevelop the two-building property, but it has not publicly unveiled detailed plans for a replacement. The developer is known for Four Seasons-branded resorts and residences, including The Surf Club in Surfside, yet no Four Seasons project has been announced for Harbor Towers.\n\nThat distinction matters. The confirmed story is near-total site control and a redevelopment intention. Any brand, building design or sales program remains speculation.",
        "image": "/assets/editorial/related-ross-fort-partners-south-flagler-property-swap-2026-09-22-body-3.jpg",
        "imageAlt": "Editorial illustration of the existing Harbor Towers waterfront condominium at 3901 South Flagler Drive",
        "imageCaption": "Fort Partners now owns 60 of Harbor Towers' 61 units after acquiring Related Ross' 21-unit position.",
        "imageCredit": "AI-generated editorial illustration"
      },
      {
        "heading": "The bigger South Flagler picture",
        "body": "Harbor Towers, the Washington Road and South Flagler apartment properties, and Southbridge form a roughly 4.3-acre collection of waterfront land that became the focus of competing acquisition campaigns by two major South Florida developers. A year ago, ownership across those properties was tangled.\n\nFort owned the apartment parcel and was assembling Harbor Towers. Related was buying Harbor Towers units while assembling Southbridge. Both companies were maneuvering around one another.\n\nThe latest exchange largely removes that overlap. Fort Partners emerges with near-total control of Harbor Towers. Related Ross emerges with the former Fort apartment property beside its Southbridge position. Instead of one contested assemblage, this stretch now contains two distinct potential redevelopment sites controlled by two developers."
      },
      {
        "heading": "What to watch next",
        "body": "Ownership is becoming clearer, but the development picture is not settled. West Palm Beach has been reconsidering planning standards as growth accelerates along its waterfront, and the city has already examined a temporary pause on new planned-development applications in part of the South Flagler corridor.\n\nThe next decisive event may be a condominium termination filing, demolition application, zoning request or full site plan rather than another acquisition. Those documents would begin to answer the questions the transactions cannot: what each developer wants to build, how much density the city will allow, and how the new projects would meet the street and waterfront.\n\nFor buyers watching West Palm Beach new construction, this is the stage that matters long before a sales gallery opens. There are no announced residences, floor plans or prices here yet. But two complicated land positions just became easier to understand, putting Fort Partners at Harbor Towers and Related Ross around Southbridge firmly on the development watchlist."
      }
    ],
    "whyItMatters": "Two competing waterfront assemblages now have much clearer ownership. Fort Partners is one unit short of complete ownership at Harbor Towers, while Related Ross has added the former Fort apartment property beside its Southbridge position.",
    "buyerContext": "Treat the recorded transactions and unit ownership as established. Treat future building form, density, branding, timing and pricing as unconfirmed until public filings or developer announcements appear.",
    "buyerTakeaway": "",
    "marketSignal": "Control of two South Flagler waterfront redevelopment positions has consolidated around Fort Partners and Related Ross.",
    "bestFor": "",
    "watchPoints": "Condominium termination filings, demolition applications, city planning submissions, zoning changes, architectural plans and formal developer announcements.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "South Flagler"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [
      "west-palm-beach-waterfront-development-freeze-2026-07-19"
    ],
    "newsletterHeadline": "$40M swap redraws South Flagler's waterfront map",
    "newsletterBlurb": "Fort Partners now owns 60 of 61 Harbor Towers units, while Related Ross has added the former Fort apartment parcel beside Southbridge.",
    "newsletterCta": "Read the article",
    "query": "Related Ross Fort Partners South Flagler property swap Harbor Towers Southbridge September 2026",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [
      "south-flagler"
    ],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/related-ross-fort-partners-south-flagler-property-swap-2026-09-22-hero.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal: Related Ross, Fort Partners swap West Palm Beach waterfront properties",
        "url": "https://therealdeal.com/miami/2026/09/21/related-ross-fort-partners-swap-west-palm-beach-properties/",
        "type": "primary transaction reporting"
      },
      {
        "label": "Realty Today: Fort Partners owns 60 of 61 Harbor Towers units",
        "url": "https://www.realtytoday.com/articles/114880/20260922/fort-partners-owns-60-61-units-this-condo-last-one-isnt-owned-person.htm",
        "type": "independent current coverage"
      },
      {
        "label": "Commercial Observer: Fort Partners' original South Flagler apartment acquisition",
        "url": "https://commercialobserver.com/2024/12/four-seasons-fort-partners-donald-trump-mar-a-lago/",
        "type": "independent historical coverage"
      },
      {
        "label": "The Real Deal: Related Ross Southbridge acquisition activity",
        "url": "https://therealdeal.com/miami/2026/01/23/related-ross-pays-premium-for-aging-west-palm-beach-condos/",
        "type": "independent property reporting"
      },
      {
        "label": "LegalClarity: Harbor Towers lawsuit and settlement history",
        "url": "https://legalclarity.org/harbor-towers-west-palm-beach-lawsuit-and-buyout-settlement/",
        "type": "legal history summary with linked records and reporting"
      },
      {
        "label": "City of West Palm Beach: Downtown Master Plan update",
        "url": "https://www.wpb.org/Departments/Development-Services/Planning-Division/Downtown-Master-Plan",
        "type": "official planning context"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "tideline-fort-partners-150m-2026-09-20",
    "slug": "fort-partners-buys-tideline-four-seasons-residences-2026-09-20",
    "title": "Fort Partners Buys Tideline for $150M. Could Four Seasons Residences Be Next?",
    "sourceName": "The Real Deal / Palm Beach Daily News",
    "sourceUrl": "https://therealdeal.com/miami/2026/09/17/jeff-greene-sells-tideline-palm-beach-ocean-resort/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/09/17/jeff-greene-sells-tideline-palm-beach-ocean-resort/",
    "sourceTitle": "Billionaire Jeff Greene sells oceanfront Tideline Palm Beach Resort to Fort Partners for $150M",
    "publishedAt": "2026-09-21T03:00:00.000Z",
    "sourcePublishedAt": "2026-09-17",
    "sourcePublishedDate": "2026-09-17",
    "eventDate": "2026-09-15",
    "dateDiscovered": "2026-09-20",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-21T03:21:21.960Z",
    "deck": "The $150 million acquisition puts the nearly three-acre Tideline Palm Beach Ocean Resort directly beside Fort Partners’ Four Seasons Resort Palm Beach. No redevelopment plan has been announced, but the buyer’s record with Four Seasons-branded residences makes the newly assembled oceanfront footprint one to watch.",
    "description": "Fort Partners has acquired the Tideline Palm Beach Ocean Resort for $150 million next to its Four Seasons Resort Palm Beach, creating a larger South Ocean Boulevard footprint with intriguing long-term possibilities.",
    "summary": "The Real Deal reported that an affiliate of Fort Partners bought the 134-room Tideline Palm Beach Ocean Resort & Spa for $150 million, giving the owner of the adjacent Four Seasons Resort Palm Beach control of another nearly three-acre oceanfront property.",
    "bodySections": [
      {
        "heading": "A major Palm Beach oceanfront deal",
        "body": "Jeff Greene has sold the Tideline Palm Beach Ocean Resort & Spa at 2842 South Ocean Boulevard for $150 million. Greene confirmed that the transaction included the oceanfront real estate as well as furnishings, fixtures, artwork, branding and other hotel assets. The resort has 134 rooms on nearly three acres and roughly 100,000 square feet. The Real Deal reported the buyer as an affiliate of Miami-based Fort Partners; the Palm Beach Daily News noted that it had not independently confirmed the buyer’s identity as of its September 18 report. The sale closed September 15, according to Greene. Tideline had also recently undergone an approximately $20 million renovation, including its private beach, 6,000-square-foot spa, event facilities, restaurant and sushi bar."
      },
      {
        "heading": "The property next door changes the story",
        "body": "Immediately north of Tideline is the Four Seasons Resort Palm Beach at 2800 South Ocean Boulevard, which is also controlled by Fort Partners. That adjacency is what turns this from a straightforward hotel sale into a development story worth watching. Fort Partners now has control of neighboring luxury oceanfront resort properties along the same stretch of Palm Beach’s South End. The timing is notable as well: in July, Fort Partners secured a $341 million refinancing of the Four Seasons Resort Palm Beach, according to The Real Deal. No plan for combining, redeveloping or repositioning the properties has been announced. Editorial image note: the accompanying image is an AI-generated editorial illustration based on reference imagery, not an official development rendering.",
        "image": "/assets/editorial/fort-partners-buys-tideline-four-seasons-residences-2026-09-20-body-1.jpg",
        "imageAlt": "Editorial aerial illustration of Palm Beach oceanfront resorts along South Ocean Boulevard.",
        "imageCaption": "Oceanfront resort context along Palm Beach’s South End. Editorial illustration.",
        "imageCredit": "AI-generated editorial illustration supplied by Brooke Snader"
      },
      {
        "heading": "Could Four Seasons Residences eventually be part of the plan?",
        "body": "There is currently no announced Four Seasons residential project for the Tideline property, and nothing in the reported transaction confirms that Fort Partners intends to redevelop the hotel. But the residential possibility is reasonable to keep on the watch list because Fort Partners has repeatedly paired Four Seasons hospitality with branded residences elsewhere in South Florida. Its portfolio includes Four Seasons-branded hotel and residential projects in Surfside and Fort Lauderdale, and the company is also partnered on Four Seasons Private Residences Coconut Grove. That track record does not tell us what will happen in Palm Beach. It does, however, make the strategic question unavoidable: did Fort Partners buy Tideline simply to operate another hotel next door, or did it acquire nearly three additional oceanfront acres that could someday support a larger Four Seasons vision? For now, that is analysis — not an announced plan."
      },
      {
        "heading": "Why the site is so interesting",
        "body": "The long-term value of the acquisition goes beyond 134 existing hotel rooms. Fort Partners now controls adjoining oceanfront properties in one of South Florida’s most supply-constrained luxury markets, adding beach frontage, hospitality inventory, amenities and land immediately beside an established Four Seasons resort. A future plan could take many forms: continued operation of Tideline as a separate hotel, shared or integrated amenities, a more substantial repositioning, or eventually some form of residential component. Any meaningful redevelopment would be subject to Palm Beach’s zoning, planning and approval process. Editorial image note: the accompanying image is an AI-generated editorial illustration based on the existing resort, not an official redevelopment rendering.",
        "image": "/assets/editorial/fort-partners-buys-tideline-four-seasons-residences-2026-09-20-body-2.jpg",
        "imageAlt": "Editorial aerial illustration of a Palm Beach oceanfront resort facing the Atlantic Ocean.",
        "imageCaption": "Palm Beach oceanfront resort context. Editorial illustration.",
        "imageCredit": "AI-generated editorial illustration supplied by Brooke Snader"
      },
      {
        "heading": "What we’re watching next",
        "body": "The next real clues should come from property records, corporate ownership filings, Town of Palm Beach planning applications, demolition or redevelopment requests, architectural submissions, or a formal announcement from Fort Partners or Four Seasons. Until then, the confirmed story is already significant: a Four Seasons owner has spent $150 million to acquire the resort immediately beside its Palm Beach property. Whether that ultimately becomes something larger could turn this from a major hotel transaction into one of the South End’s more consequential development stories."
      }
    ],
    "whyItMatters": "Fort Partners now controls the luxury oceanfront resort immediately beside its Four Seasons Resort Palm Beach, materially expanding its strategic footprint on South Ocean Boulevard.",
    "brookeTake": "There is no announced Four Seasons residential plan for Tideline. But Fort Partners’ record with Four Seasons-branded residences makes a future residential or integrated-resort concept a possibility worth watching — not a fact to price into a decision today.",
    "buyerContext": "Treat the $150 million sale, the properties’ adjacency and Fort Partners’ Four Seasons development record as established context. Treat any Four Seasons residential component as an unconfirmed possibility until public filings or an announcement confirm it.",
    "buyerTakeaway": "The acquisition matters because common control of adjoining oceanfront properties creates strategic options that did not exist when Tideline and the Four Seasons were separately owned.",
    "marketSignal": "Fort Partners is expanding its Palm Beach oceanfront footprint immediately beside an established Four Seasons resort.",
    "bestFor": "Palm Beach buyers and owners tracking South Ocean Boulevard, branded residences and long-term luxury redevelopment.",
    "watchPoints": "Town of Palm Beach filings, property records, redevelopment or demolition applications, architectural submissions, and formal Fort Partners or Four Seasons announcements.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Palm Beach South End"
    ],
    "relatedCorridor": "South Ocean Boulevard",
    "relatedArticleIds": [],
    "newsletterHeadline": "Fort Partners Buys Tideline for $150M. Could Four Seasons Residences Be Next?",
    "newsletterBlurb": "Fort Partners now controls the resort immediately beside Four Seasons Resort Palm Beach. No redevelopment has been announced, but the larger oceanfront footprint is one to watch.",
    "newsletterCta": "Read the development update",
    "query": "Fort Partners Tideline Palm Beach Four Seasons $150 million",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "Palm Beach South End",
    "imagePath": "/assets/editorial/fort-partners-buys-tideline-four-seasons-residences-2026-09-20-hero.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal",
        "url": "https://therealdeal.com/miami/2026/09/17/jeff-greene-sells-tideline-palm-beach-ocean-resort/",
        "type": "news"
      },
      {
        "label": "Palm Beach Daily News",
        "url": "https://www.palmbeachpost.com/story/business/real-estate/2026/09/18/palm-beach-resort-changes-hands-in-deal-totaling-150m-seller-says/91824542007/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-7e8443a31a1b3fbb",
    "slug": "terra-frisbie-20m-west-palm-beach-assemblage-2026-2026-09-15",
    "title": "Terra and Frisbie Add $20M Parcel to West Palm Beach Assemblage",
    "sourceName": "The Real Deal",
    "sourceUrl": "https://therealdeal.com/miami/2026/09/09/terra-frisbie-buy-more-of-former-palm-beach-kennel-club/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/09/09/terra-frisbie-buy-more-of-former-palm-beach-kennel-club/",
    "sourceTitle": "Terra and Frisbie Add $20M Parcel to West Palm Beach Assemblage",
    "publishedAt": "2026-09-15T04:50:01.037Z",
    "sourcePublishedAt": "2026-09-09",
    "sourcePublishedDate": "2026-09-09",
    "eventDate": "2026-09-15",
    "dateDiscovered": "2026-09-15",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-15T04:50:01.037Z",
    "deck": "Terra and Frisbie Group have acquired another parcel of the former Palm Beach Kennel Club site for $20 million, expanding their master-planned West Palm Beach footprint.",
    "description": "Terra and Frisbie Group have acquired another parcel of the former Palm Beach Kennel Club site for $20 million, expanding their master-planned West Palm Beach footprint.",
    "summary": "A $20 million land acquisition expands the Terra-Frisbie assemblage at the former Palm Beach Kennel Club site, where large-scale mixed-use and residential development is planned.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "David Martin’s Terra and Palm Beach-based Frisbie Group have acquired an additional parcel of the former Palm Beach Kennel Club site in West Palm Beach for $20 million. The purchase expands the partners’ existing multi-acre assemblage and follows earlier parcel acquisitions tied to the same broader site.\n\nAccording to The Real Deal, the assembled property is planned for large-scale mixed-use and residential development. The key update is therefore not a new tower design or unit count, but another piece of land moving into the same development footprint.",
        "image": "/assets/editorial/west-palm-move-downtown-mobility-hero.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "Large assemblages tend to matter differently from single-building announcements. They can support a wider mix of residential, commercial and public-facing uses, and they usually unfold over a longer planning horizon. For buyers watching West Palm Beach’s next growth areas, the continued accumulation of land is a concrete sign that this site remains an active development play.\n\nThe verified record does not establish a final acreage, detailed building program, delivery schedule or specific residential product for this latest acquisition. Those are exactly the details worth waiting for rather than filling in from broader market expectations."
      },
      {
        "heading": "What to watch",
        "body": "The next important signals will come from attributable master-plan filings, site plans, infrastructure details and a clearer breakdown of the residential and commercial components. Those documents will show how the expanded assemblage is actually intended to function.\n\nFor now, the useful takeaway is straightforward: Terra and Frisbie have added another $20 million parcel to a growing West Palm Beach site planned for substantial mixed-use and residential development."
      }
    ],
    "whyItMatters": "Another $20 million parcel expands an already significant assemblage planned for large-scale development.",
    "buyerContext": "Use the acquisition and broad mixed-use/residential intent as the current facts; wait for filings before assuming exact acreage, unit counts or timing.",
    "buyerTakeaway": "The acquisition expands a master-planned site intended for large-scale mixed-use and residential development; detailed project programming is still to come.",
    "marketSignal": "A major development partnership continues assembling land for a large West Palm Beach project.",
    "bestFor": "Buyers and owners tracking future inventory and district-scale development beyond single-building announcements.",
    "watchPoints": "Master-plan filings, site plans, infrastructure details and a clearer residential/commercial program.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Terra and Frisbie Add $20M Parcel to West Palm Beach Assemblage",
    "newsletterBlurb": "Terra and Frisbie Group have acquired another parcel of the former Palm Beach Kennel Club site for $20 million, expanding their master-planned West Palm Beach footprint.",
    "newsletterCta": "Read the article",
    "query": "Terra and Frisbie Add $20M Parcel to West Palm Beach Assemblage",
    "category": "development",
    "relatedProjectIds": [
      "terra-frisbie-wpb-assemblage"
    ],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [
      "terra-frisbie-wpb-assemblage"
    ],
    "relatedCorridors": [],
    "primaryProjectSlug": "terra-frisbie-wpb-assemblage",
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/home/downtown-corridor-bridge-daytime-v01.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal",
        "url": "https://therealdeal.com/miami/2026/09/09/terra-frisbie-buy-more-of-former-palm-beach-kennel-club/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-26c1c72f59519b2e",
    "slug": "unicorp-200m-la-fontana-buyout-north-flagler-2026-2026-09-15",
    "title": "Unicorp Under Contract for $200M La Fontana Buyout on North Flagler",
    "sourceName": "The Real Deal / Discover South Florida",
    "sourceUrl": "https://therealdeal.com/miami/2026/07/09/chuck-whittall-buying-la-fontana-co-op-in-west-palm-beach/",
    "canonicalUrl": "https://therealdeal.com/miami/2026/07/09/chuck-whittall-buying-la-fontana-co-op-in-west-palm-beach/",
    "sourceTitle": "Unicorp Under Contract for $200M La Fontana Buyout on North Flagler",
    "publishedAt": "2026-09-15T04:49:30.941Z",
    "sourcePublishedAt": "2026-07-18",
    "sourcePublishedDate": "2026-07-18",
    "eventDate": "2026-09-15",
    "dateDiscovered": "2026-09-15",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-15T04:49:30.941Z",
    "deck": "Chuck Whittall’s Unicorp is under contract to acquire the 140-unit La Fontana waterfront co-op for roughly $200 million, with closing projected for 2027.",
    "description": "Chuck Whittall’s Unicorp is under contract to acquire the 140-unit La Fontana waterfront co-op for roughly $200 million, with closing projected for 2027.",
    "summary": "Unicorp is under contract for the 140-unit La Fontana co-op on North Flagler at roughly $200 million, with a projected 2027 closing.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Chuck Whittall’s Unicorp is under contract to acquire La Fontana, a 140-unit waterfront co-op on North Flagler, for roughly $200 million. The property dates to 1961, and the reported transaction works out to about $1.4 million per residence on average.\n\nThe Real Deal reports that closing is projected for 2027. Those are the dependable elements of the update: the buyer, the approximately $200 million contract price, the 140-unit scale of the existing co-op and the projected closing horizon.",
        "image": "/assets/home/north-flagler-3-buildings-daytime-v01.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "A transaction of this size matters on North Flagler because it involves an existing waterfront residential property rather than an undeveloped parcel. For buyers comparing the corridor, it is another sign that older waterfront sites are attracting major acquisition interest while new towers continue to reshape the area.\n\nThe important limit is what comes next. The verified record here does not establish a specific future residential brand, hospitality component or redevelopment program for the site. Until Unicorp or public planning records provide attributable details, buyers should treat the transaction as an acquisition story rather than a finished development announcement."
      },
      {
        "heading": "What to watch",
        "body": "The projected 2027 closing is the next major transaction milestone. After that, the useful questions will be whether a redevelopment application is filed, what uses are proposed and how any future plan fits into the broader North Flagler pipeline.\n\nFor now, La Fontana is a significant waterfront property under contract at roughly $200 million. That alone makes it worth watching — without racing ahead of what has actually been announced."
      }
    ],
    "whyItMatters": "A roughly $200 million contract for a 140-unit waterfront co-op is a significant North Flagler land and ownership event.",
    "buyerContext": "Follow the transaction now; wait for attributable filings before assuming what will replace the existing property.",
    "buyerTakeaway": "The verified update is the roughly $200 million acquisition contract and projected 2027 closing; a future redevelopment program has not yet been established.",
    "marketSignal": "Major acquisition interest continues to focus on existing waterfront properties along North Flagler.",
    "bestFor": "Buyers tracking how older North Flagler waterfront properties may transition over time.",
    "watchPoints": "The projected 2027 closing and any later attributable redevelopment filing or public plan.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Unicorp Under Contract for $200M La Fontana Buyout on North Flagler",
    "newsletterBlurb": "Chuck Whittall’s Unicorp is under contract to acquire the 140-unit La Fontana waterfront co-op for roughly $200 million, with closing projected for 2027.",
    "newsletterCta": "Read the article",
    "query": "Unicorp Under Contract for $200M La Fontana Buyout on North Flagler",
    "category": "development",
    "relatedProjectIds": [
      "la-fontana-north-flagler-buyout"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "la-fontana-north-flagler-buyout"
    ],
    "relatedCorridors": [
      "north-flagler"
    ],
    "primaryProjectSlug": "la-fontana-north-flagler-buyout",
    "corridorLabel": "North Flagler",
    "imagePath": "/assets/editorial/wpb-corridors-aerial-hero-v01.jpg",
    "sourceLinks": [
      {
        "label": "The Real Deal / Discover South Florida",
        "url": "https://therealdeal.com/miami/2026/07/09/chuck-whittall-buying-la-fontana-co-op-in-west-palm-beach/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-544ca384b5f936f2",
    "slug": "alba-palm-beach-complete-move-in-ready-north-flagler-2026-09-14",
    "title": "Alba Palm Beach Is Complete and Move-In Ready on North Flagler",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/06/new-photos-showcase-completed-alba-palm-beach-at-4714-n-flagler-drive-in-west-palm-beach.html",
    "canonicalUrl": "https://floridayimby.com/2026/06/new-photos-showcase-completed-alba-palm-beach-at-4714-n-flagler-drive-in-west-palm-beach.html",
    "sourceTitle": "Alba Palm Beach Is Complete and Move-In Ready on North Flagler",
    "publishedAt": "2026-09-14T18:56:38.846Z",
    "sourcePublishedAt": "2026-06-22",
    "sourcePublishedDate": "2026-06-22",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T18:56:38.846Z",
    "deck": "The 22-story, 55-residence tower at 4714 N. Flagler Drive has completed construction, giving buyers a move-in-ready new-construction option on North Flagler.",
    "description": "The 22-story, 55-residence tower at 4714 N. Flagler Drive has completed construction, giving buyers a move-in-ready new-construction option on North Flagler.",
    "summary": "Alba Palm Beach is complete and move-in ready, with 55 residences across 22 stories at 4714 N. Flagler Drive on North Flagler.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Alba Palm Beach has completed construction at 4714 N. Flagler Drive and is now move-in ready. Florida YIMBY reports the project as a completed 22-story residential tower with 55 residences, designed by Spina O'Rourke.\n\nThat makes Alba materially different from many of the new-construction options buyers are comparing elsewhere in West Palm Beach: this is no longer a future-delivery story. The building has reached completion, and the current project status can be evaluated from the standpoint of occupancy rather than construction timing.",
        "image": "/assets/projects/alba-palm-beach/hero/alba-hero-aerial-waterfront-rendering-v01.webp"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "For buyers who want new construction without waiting through a multi-year build, completion changes the conversation. A move-in-ready building removes one of the biggest variables in pre-construction purchasing: when the residence will actually be available.\n\nAlba's 55-residence scale also gives buyers a relatively compact building to compare with the larger towers rising elsewhere along the waterfront. The useful facts here are straightforward — 22 stories, 55 residences and completed construction — without relying on unverified amenity or availability claims."
      },
      {
        "heading": "What to watch",
        "body": "The next meaningful updates are current inventory, pricing and any resale activity as the building moves from construction into normal occupancy. Those details can change quickly and should be checked against current listings and official sales information rather than assumed from the completion announcement.\n\nFor now, Alba has crossed the most important threshold: it is a completed, move-in-ready new-construction option on North Flagler."
      }
    ],
    "whyItMatters": "Completion removes construction-timing uncertainty and gives buyers a finished building to evaluate now.",
    "buyerContext": "Use the verified completion, 22-story scale and 55-residence count as the current anchors; verify live inventory and pricing separately.",
    "buyerTakeaway": "Alba offers buyers a completed, move-in-ready new-construction option rather than a future-delivery commitment.",
    "marketSignal": "A North Flagler new-construction project has moved from active construction into completed inventory.",
    "bestFor": "Buyers prioritizing completed new construction and near-term occupancy on North Flagler.",
    "watchPoints": "Current inventory, pricing and resale activity as the building transitions into normal occupancy.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Alba Palm Beach Is Complete and Move-In Ready on North Flagler",
    "newsletterBlurb": "The 22-story, 55-residence tower at 4714 N. Flagler Drive has completed construction, giving buyers a move-in-ready new-construction option on North Flagler.",
    "newsletterCta": "Read the article",
    "query": "Alba Palm Beach Is Complete and Move-In Ready on North Flagler",
    "category": "development",
    "relatedProjectIds": [
      "alba-palm-beach"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "alba-palm-beach"
    ],
    "relatedCorridors": [
      "north-flagler"
    ],
    "primaryProjectSlug": "alba-palm-beach",
    "corridorLabel": "North Flagler",
    "imagePath": "/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp",
    "sourceLinks": [
      {
        "label": "Florida YIMBY",
        "url": "https://floridayimby.com/2026/06/new-photos-showcase-completed-alba-palm-beach-at-4714-n-flagler-drive-in-west-palm-beach.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-021fb59946a118d4",
    "slug": "shorecrest-breaks-ground-157m-financing-2026-09-14",
    "title": "Shorecrest Breaks Ground with $157M Construction Financing",
    "sourceName": "South Florida Agent Magazine",
    "sourceUrl": "https://southfloridaagentmagazine.com/slideshows/related-ross-shorecrest-groundbreaking/",
    "canonicalUrl": "https://southfloridaagentmagazine.com/slideshows/related-ross-shorecrest-groundbreaking/",
    "sourceTitle": "Shorecrest Breaks Ground with $157M Construction Financing",
    "publishedAt": "2026-09-14T18:23:06.500Z",
    "sourcePublishedAt": "2026-05-22",
    "sourcePublishedDate": "2026-05-22",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T18:23:06.500Z",
    "deck": "Related Ross has broken ground on 28-story Shorecrest on North Flagler, with 98 residences and $157 million in construction financing.",
    "description": "Related Ross has broken ground on 28-story Shorecrest on North Flagler, with 98 residences and $157 million in construction financing.",
    "summary": "Groundbreaking is underway at Shorecrest, a 28-story North Flagler project with 98 residences and $157 million in construction financing.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Related Ross has broken ground on Shorecrest, a 28-story residential project on North Flagler with 98 residences. The current residential program includes two- and three-bedroom homes, with four residences per floor.\n\nThe project is also backed by $157 million in construction financing, giving the groundbreaking a second concrete milestone: construction is moving forward with a substantial financing package in place.",
        "image": "/assets/editorial/flagler-waterfront-corridor.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "For buyers tracking North Flagler, a groundbreaking is more meaningful than another rendering or pre-launch announcement. It marks the transition into active construction and gives shoppers a clearer way to compare Shorecrest with projects that remain earlier in the pipeline.\n\nThe 98-residence count also places Shorecrest in a relatively contained scale for a 28-story building, while four homes per floor gives buyers a useful sense of the planned density. The financing adds confidence that the project has moved beyond an early planning stage, although buyers should still evaluate future construction milestones separately."
      },
      {
        "heading": "What to watch",
        "body": "The next useful updates are physical construction progress and any revised timing guidance that can be tied to current project materials. Published completion-year references have not been perfectly consistent, so this update does not rely on a specific delivery year.\n\nAlso watch for any later changes to the residence program as construction advances. For now, the dependable facts are substantial enough on their own: Shorecrest has broken ground, it is planned at 28 stories and 98 residences, and $157 million in construction financing has been secured."
      }
    ],
    "whyItMatters": "Groundbreaking and construction financing make Shorecrest a materially more advanced project than a proposal still on paper.",
    "buyerContext": "Use the verified scale and financing as the current anchors; avoid relying on conflicting delivery-year references.",
    "buyerTakeaway": "Shorecrest has moved into active construction with a 28-story, 98-residence program and substantial financing in place.",
    "marketSignal": "Another major North Flagler residential project has transitioned from planning into construction.",
    "bestFor": "Buyers comparing active-construction options on North Flagler.",
    "watchPoints": "Construction milestones and updated delivery guidance from current project materials.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Shorecrest Breaks Ground with $157M Construction Financing",
    "newsletterBlurb": "Related Ross has broken ground on 28-story Shorecrest on North Flagler, with 98 residences and $157 million in construction financing.",
    "newsletterCta": "Read the article",
    "query": "Shorecrest Breaks Ground with $157M Construction Financing",
    "category": "development",
    "relatedProjectIds": [
      "shorecrest"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "shorecrest"
    ],
    "relatedCorridors": [
      "north-flagler"
    ],
    "primaryProjectSlug": "shorecrest",
    "corridorLabel": "North Flagler",
    "imagePath": "/assets/home/shorecrest-project-card-main-v01.jpg",
    "sourceLinks": [
      {
        "label": "South Florida Agent Magazine",
        "url": "https://southfloridaagentmagazine.com/slideshows/related-ross-shorecrest-groundbreaking/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-fad9e4204ed36dae",
    "slug": "banyan-tree-residences-unanimous-dac-approval-2026-09-14",
    "title": "Banyan Tree Residences Wins Unanimous DAC Approval",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/08/banyan-tree-residences-west-palm-beach-secures-unanimous-downtown-action-committee-approval.html",
    "canonicalUrl": "https://floridayimby.com/2026/08/banyan-tree-residences-west-palm-beach-secures-unanimous-downtown-action-committee-approval.html",
    "sourceTitle": "Banyan Tree Residences Wins Unanimous DAC Approval",
    "publishedAt": "2026-09-14T18:22:37.867Z",
    "sourcePublishedAt": "2026-08-19",
    "sourcePublishedDate": "2026-08-19",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T18:22:37.867Z",
    "deck": "Banyan Tree Residences West Palm Beach received unanimous Downtown Action Committee approval for its 25-story proposal at 400 Hibiscus.",
    "description": "Banyan Tree Residences West Palm Beach received unanimous Downtown Action Committee approval for its 25-story proposal at 400 Hibiscus.",
    "summary": "The Downtown Action Committee unanimously approved the 25-story Banyan Tree Residences West Palm Beach proposal, advancing the project’s public-review milestone.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Banyan Tree Residences West Palm Beach has received unanimous approval from the Downtown Action Committee for its 25-story proposal at 400 Hibiscus. The verified milestone is specifically the DAC vote, an important step for the project as it moves through West Palm Beach’s development process.\n\nThe project’s planned wellness program includes a full-floor offering with features such as a hammam, cryotherapy and a meditation garden. Sales are being led by Douglas Elliman Development Marketing.",
        "image": "/assets/home/downtown-corridor-bridge-daytime-v01.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "For buyers following branded new construction in central West Palm Beach, the DAC vote moves Banyan Tree Residences from concept discussion into a more concrete stage of municipal review. It does not require buyers to rely on disputed residence counts or unsupported pricing claims to understand the significance of the update.\n\nThe wellness component also gives the project a clearly defined positioning. Rather than treating the building as simply another luxury tower, buyers can evaluate whether a deep wellness program is genuinely important to the way they expect to use a residence."
      },
      {
        "heading": "What to watch",
        "body": "The next useful milestones are the project’s subsequent approvals, any updated public plans and the final residence program presented to buyers. Published unit-count figures have not been perfectly consistent, so buyers should use the project’s current official materials when comparing layouts and total inventory.\n\nFor now, the clean takeaway is straightforward: Banyan Tree Residences has secured unanimous DAC approval for a 25-story proposal at 400 Hibiscus, and its wellness-led residential concept continues to advance."
      }
    ],
    "whyItMatters": "The unanimous DAC vote is a concrete municipal milestone for the project.",
    "buyerContext": "Focus on the approved 25-story concept and wellness program; verify current residence count and pricing from official sales materials.",
    "buyerTakeaway": "The key update is unanimous DAC approval for the 25-story Banyan Tree Residences proposal at 400 Hibiscus.",
    "marketSignal": "A branded residential project with a strong wellness focus is advancing through West Palm Beach’s review process.",
    "bestFor": "Buyers tracking branded residences and wellness-focused new construction in central West Palm Beach.",
    "watchPoints": "Subsequent approvals, updated public plans and a reconciled residence count.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Banyan Tree Residences Wins Unanimous DAC Approval",
    "newsletterBlurb": "Banyan Tree Residences West Palm Beach received unanimous Downtown Action Committee approval for its 25-story proposal at 400 Hibiscus.",
    "newsletterCta": "Read the article",
    "query": "Banyan Tree Residences Wins Unanimous DAC Approval",
    "category": "development",
    "relatedProjectIds": [
      "banyan-tree"
    ],
    "relatedCorridorIds": [
      "downtown"
    ],
    "relatedProjectSlugs": [
      "banyan-tree"
    ],
    "relatedCorridors": [
      "downtown"
    ],
    "primaryProjectSlug": "banyan-tree",
    "corridorLabel": "Downtown",
    "imagePath": "/assets/home/banyan-tree-project-card-main-v01.jpg",
    "sourceLinks": [
      {
        "label": "Florida YIMBY",
        "url": "https://floridayimby.com/2026/08/banyan-tree-residences-west-palm-beach-secures-unanimous-downtown-action-committee-approval.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-6509ddad48c25f5c",
    "slug": "andreessen-horowitz-cityplace-tower-west-palm-beach-2026-09-14",
    "title": "Andreessen Horowitz Leases Office at CityPlace Tower",
    "sourceName": "Commercial Observer",
    "sourceUrl": "https://commercialobserver.com/2026/09/andreessen-horowitz-a16z-stephen-related-ross-cityplace-tower-west-palm-beach/",
    "canonicalUrl": "https://commercialobserver.com/2026/09/andreessen-horowitz-a16z-stephen-related-ross-cityplace-tower-west-palm-beach/",
    "sourceTitle": "Andreessen Horowitz Leases Office at CityPlace Tower",
    "publishedAt": "2026-09-14T18:05:40.938Z",
    "sourcePublishedAt": "2026-09-10",
    "sourcePublishedDate": "2026-09-10",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T18:05:40.938Z",
    "deck": "Andreessen Horowitz has signed a lease at CityPlace Tower, adding a major venture-capital tenant focused on technology and defense-related investing.",
    "description": "Andreessen Horowitz has signed a lease at CityPlace Tower, adding a major venture-capital tenant focused on technology and defense-related investing.",
    "summary": "Andreessen Horowitz is taking office space at CityPlace Tower at 525 Okeechobee Boulevard, expanding West Palm Beach’s roster of major corporate tenants.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Andreessen Horowitz has signed a new office lease at CityPlace Tower, 525 Okeechobee Boulevard, in West Palm Beach. The venture-capital firm’s office is tied to its technology and defense-related investment activity.\n\nThe lease adds another prominent corporate tenant to Related Ross’s West Palm Beach commercial portfolio. It also fits a broader pattern of major firms establishing or expanding a presence in the city.",
        "image": "/assets/editorial/wall-street-south-office-arrival.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "For residential buyers, the useful takeaway is not a promise about condo prices or resale demand. One office lease cannot prove either. What it can show is continued corporate activity in the central West Palm Beach market, adding another high-profile employer and business presence to the area.\n\nThat matters when comparing neighborhoods because the residential market does not exist in isolation. Office growth can influence how people think about commute patterns, walkability, weekday activity and proximity to business districts. The safest way to use this information is as a market-context signal rather than as an investment forecast."
      },
      {
        "heading": "What to watch",
        "body": "Watch for the timing and scale of the firm’s local office build-out, along with additional tenant announcements across the city’s newer commercial buildings. Those details will help show whether this is an isolated lease or part of a continuing wave of corporate expansion.\n\nFor buyers evaluating central West Palm Beach, the a16z lease is one more concrete data point: major firms continue to choose the city for operating space."
      }
    ],
    "whyItMatters": "The lease adds another high-profile corporate user to CityPlace Tower and the broader West Palm Beach office market.",
    "buyerContext": "Useful as market context; avoid turning one lease into an unsupported claim about residential values.",
    "buyerTakeaway": "Treat the lease as a corporate-growth signal, not proof of future condo appreciation or resale demand.",
    "marketSignal": "A major venture-capital firm is adding office space to West Palm Beach’s commercial core.",
    "bestFor": "Buyers who care about proximity to the city’s growing business district and weekday activity.",
    "watchPoints": "Office opening details and additional major tenant announcements in West Palm Beach.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Andreessen Horowitz Leases Office at CityPlace Tower",
    "newsletterBlurb": "Andreessen Horowitz has signed a lease at CityPlace Tower, adding a major venture-capital tenant focused on technology and defense-related investing.",
    "newsletterCta": "Read the article",
    "query": "Andreessen Horowitz Leases Office at CityPlace Tower",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/home/downtown-corridor-bridge-daytime-v01.jpg",
    "sourceLinks": [
      {
        "label": "Commercial Observer",
        "url": "https://commercialobserver.com/2026/09/andreessen-horowitz-a16z-stephen-related-ross-cityplace-tower-west-palm-beach/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-03ccad51e240cf82",
    "slug": "534-datura-25-story-tower-west-palm-beach-2026-09-14",
    "title": "25-Story 534 Datura Tower Planned in West Palm Beach",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/09/two-developers-plan-25-story-534-datura-for-534-datura-st-west-palm-beach-fl.html",
    "canonicalUrl": "https://floridayimby.com/2026/09/two-developers-plan-25-story-534-datura-for-534-datura-st-west-palm-beach-fl.html",
    "sourceTitle": "25-Story 534 Datura Tower Planned in West Palm Beach",
    "publishedAt": "2026-09-14T17:46:36.281Z",
    "sourcePublishedAt": "2026-09-11",
    "sourcePublishedDate": "2026-09-11",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T17:46:36.281Z",
    "deck": "Rybak Development and Gold Standard of Care plan a 25-story, 281,000-square-foot tower with 261 residences, retail and a large amenity deck.",
    "description": "Rybak Development and Gold Standard of Care plan a 25-story, 281,000-square-foot tower with 261 residences, retail and a large amenity deck.",
    "summary": "Plans for 534 Datura call for a 25-story tower with 261 residences, 4,600 square feet of retail and a 6,371-square-foot pool deck.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Rybak Development and Gold Standard of Care have unveiled plans for 534 Datura, a 25-story, roughly 281,000-square-foot tower with 261 residences. The proposal also includes about 4,600 square feet of retail and a 6,371-square-foot pool deck.\n\nFlorida YIMBY reports that the design is by IMC Architecture. The program includes 64 parking spaces, plus amenity space associated with the pool deck, spa, co-working and fitness uses. The project would replace an existing 200-bed nursing home on a roughly half-acre site.",
        "image": "/assets/editorial/downtown-spotlight-night-skyline-hero.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "The proposal is notable because it would add a sizable new residential building to the Datura Street area with a relatively compact parking count and a meaningful ground-floor retail component. The residential program also includes a workforce-housing component under the Live Local framework, although the exact unit breakdown should be treated cautiously until the project’s numbers are fully reconciled.\n\nFor buyers, the practical point is that 534 Datura represents another major residential proposal in the central West Palm Beach development pipeline. Its scale, retail space and amenity program make it more than a small infill project, while the replacement of an existing institutional use would materially change the site."
      },
      {
        "heading": "What to watch",
        "body": "The biggest item to watch is how the plan moves through public review and whether the current program changes. Exact workforce-housing counts deserve particular attention because published figures have not been perfectly consistent.\n\nAlso watch for revisions to the residential count, parking plan, retail square footage or amenity program. At this stage, the useful buyer takeaway is the broad proposal: 25 stories, 261 residences and a mixed residential-retail program at 534 Datura."
      }
    ],
    "whyItMatters": "The proposal would replace an existing nursing-home site with a large residential and retail development.",
    "buyerContext": "Use the broad 25-story, 261-residence program as the current anchor and treat the exact workforce-housing unit count cautiously.",
    "buyerTakeaway": "534 Datura is a substantial 25-story residential proposal with 261 residences, retail and a large amenity program.",
    "marketSignal": "Another sizable residential project is entering West Palm Beach’s central development pipeline.",
    "bestFor": "Buyers tracking future central West Palm Beach residential inventory.",
    "watchPoints": "Public-review progress and any revisions to residence count, workforce-housing breakdown, parking, retail or amenities.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "25-Story 534 Datura Tower Planned in West Palm Beach",
    "newsletterBlurb": "Rybak Development and Gold Standard of Care plan a 25-story, 281,000-square-foot tower with 261 residences, retail and a large amenity deck.",
    "newsletterCta": "Read the article",
    "query": "25-Story 534 Datura Tower Planned in West Palm Beach",
    "category": "development",
    "relatedProjectIds": [
      "534-datura"
    ],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [
      "534-datura"
    ],
    "relatedCorridors": [],
    "primaryProjectSlug": "534-datura",
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/downtown-core-corridor.jpg",
    "sourceLinks": [
      {
        "label": "Florida YIMBY",
        "url": "https://floridayimby.com/2026/09/two-developers-plan-25-story-534-datura-for-534-datura-st-west-palm-beach-fl.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-d3bca9259771220e",
    "slug": "alida-residences-tribute-portfolio-break-ground-brightline-2026-09-14",
    "title": "Alida Residences and Tribute Portfolio Hotel Break Ground by Brightline",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2026/07/construction-begins-on-alida-residences-and-tribute-portfolio-by-marriott-hotel-in-downtown-west-palm-beach.html",
    "canonicalUrl": "https://floridayimby.com/2026/07/construction-begins-on-alida-residences-and-tribute-portfolio-by-marriott-hotel-in-downtown-west-palm-beach.html",
    "sourceTitle": "Alida Residences and Tribute Portfolio Hotel Break Ground by Brightline",
    "publishedAt": "2026-09-14T17:46:09.196Z",
    "sourcePublishedAt": "2026-08-31",
    "sourcePublishedDate": "2026-08-31",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T17:46:09.196Z",
    "deck": "Groundbreaking is underway for the 21-story Alida Residences, with 181 homes and a Tribute Portfolio hotel component beside Brightline.",
    "description": "Groundbreaking is underway for the 21-story Alida Residences, with 181 homes and a Tribute Portfolio hotel component beside Brightline.",
    "summary": "Alida Residences has broken ground beside West Palm Beach’s Brightline station; the residential component is planned at 21 stories with 181 residences.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Groundbreaking is underway for Alida Residences beside the West Palm Beach Brightline station. The residential component is planned at 21 stories with 181 residences, and the broader development package includes a Tribute Portfolio hotel component.\n\nThe project’s transit relationship is central to the story. Its location is directly integrated with Brightline, putting a substantial new residential offering and hotel use next to one of downtown West Palm Beach’s key regional transportation links.",
        "image": "/assets/editorial/downtown-spotlight-night-skyline-hero.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "For buyers who value mobility, this is a meaningful addition to the downtown pipeline. Direct proximity to Brightline can change the way a residence functions for people who regularly move between West Palm Beach and other South Florida cities. It also adds new housing density beside an existing transportation hub rather than on an isolated site.\n\nThe important distinction is that the verified facts support the Alida residential program, the 181-residence count, the 21-story scale, the hotel component and the transit-oriented location. Buyers do not need to rely on broader labels about exactly how the residential and hotel pieces are physically organized to understand the practical takeaway: this is a substantial new development rising beside Brightline."
      },
      {
        "heading": "What to watch",
        "body": "Now that groundbreaking is underway, the next useful signals will be visible construction milestones and more detailed information about the residential offering as the project advances. Buyers should also watch how the hotel and residential components are ultimately presented together on the site and in public-facing project materials.\n\nFor downtown shoppers, Alida adds another option to the emerging transit-oriented cluster around Datura Street and the Brightline station."
      }
    ],
    "whyItMatters": "The project combines meaningful residential scale with direct transit access in the downtown core.",
    "buyerContext": "Focus on the 21-story, 181-residence Alida program and its Brightline connection; avoid over-reading uncertain building-configuration details.",
    "buyerTakeaway": "Alida adds a large new residential option directly tied to Brightline access in downtown West Palm Beach.",
    "marketSignal": "Transit-oriented residential and hospitality development is advancing around the Brightline station.",
    "bestFor": "Buyers who prioritize downtown living with direct regional rail access.",
    "watchPoints": "Construction progress and future residential details as the project advances.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Alida Residences and Tribute Portfolio Hotel Break Ground by Brightline",
    "newsletterBlurb": "Groundbreaking is underway for the 21-story Alida Residences, with 181 homes and a Tribute Portfolio hotel component beside Brightline.",
    "newsletterCta": "Read the article",
    "query": "Alida Residences and Tribute Portfolio Hotel Break Ground by Brightline",
    "category": "development",
    "relatedProjectIds": [
      "alida-residences-brightline"
    ],
    "relatedCorridorIds": [
      "downtown"
    ],
    "relatedProjectSlugs": [
      "alida-residences-brightline"
    ],
    "relatedCorridors": [
      "downtown"
    ],
    "primaryProjectSlug": "alida-residences-brightline",
    "corridorLabel": "Downtown",
    "imagePath": "/assets/editorial/downtown-core-corridor.jpg",
    "sourceLinks": [
      {
        "label": "Florida YIMBY",
        "url": "https://floridayimby.com/2026/07/construction-begins-on-alida-residences-and-tribute-portfolio-by-marriott-hotel-in-downtown-west-palm-beach.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "intel-story-421da79099c9ed00",
    "slug": "olaras-completion-horizon-is-set-for-2028-2026-09-14",
    "title": "Olara’s Completion Horizon Is Set for 2028",
    "sourceName": "Florida YIMBY",
    "sourceUrl": "https://floridayimby.com/2025/12/olara-commences-vertical-construction-at-1919-north-flagler-drive-in-west-palm-beach.html",
    "canonicalUrl": "https://floridayimby.com/2025/12/olara-commences-vertical-construction-at-1919-north-flagler-drive-in-west-palm-beach.html",
    "sourceTitle": "Olara’s Completion Horizon Is Set for 2028",
    "publishedAt": "2026-09-14T17:45:41.227Z",
    "sourcePublishedAt": "2026-07-07",
    "sourcePublishedDate": "2026-07-07",
    "eventDate": "2026-09-14",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T17:45:41.227Z",
    "deck": "The latest verified project timing points to 2028 completion for Olara on North Flagler, giving buyers a clearer planning horizon.",
    "description": "The latest verified project timing points to 2028 completion for Olara on North Flagler, giving buyers a clearer planning horizon.",
    "summary": "Olara’s current completion horizon is 2028, a useful timing marker for buyers evaluating when the North Flagler project may fit their plans.",
    "bodySections": [
      {
        "heading": "What happened",
        "body": "Olara’s current completion horizon is 2028. That is the clearest project update here: the timing gives buyers a firmer reference point for planning around a future West Palm Beach residence. The project is identified with the North Flagler corridor, one of the city’s most closely watched areas for new residential development.",
        "image": "/assets/editorial/wpb-corridors-aerial-hero-v01.jpg"
      },
      {
        "heading": "Why it matters for buyers",
        "body": "A 2028 completion horizon matters because timing is one of the first filters in a new-construction decision. Buyers who want near-term occupancy may approach the project differently from buyers who are comfortable planning several years ahead. The date can also shape when a buyer begins comparing alternatives, organizing financing, thinking about an existing-home sale, or deciding how much flexibility to keep in a seasonal-housing plan.\n\nThe useful takeaway is not to over-read secondary transaction chatter. For this update, the dependable point is the 2028 completion horizon. Buyers can use that as the anchor and treat future pricing, contract activity and construction-stage details as separate questions that should be checked when they become current and attributable."
      },
      {
        "heading": "What to watch",
        "body": "The next meaningful updates are the ones that make the 2028 horizon more concrete: construction milestones, any revised completion guidance and eventual occupancy or closing information. Those later details can change the practical buyer calculus even when the broad completion year stays the same.\n\nFor now, 2028 is the working timeline. That gives Olara shoppers something more useful than rumor: a clear date range around which to compare other North Flagler options."
      }
    ],
    "whyItMatters": "Timing is a core decision variable in new construction; 2028 gives buyers a clearer basis for comparison.",
    "buyerContext": "Treat the 2028 horizon as the dependable update and verify future pricing or transaction details separately.",
    "buyerTakeaway": "Use 2028 as the current planning horizon when comparing Olara with other West Palm Beach new-construction options.",
    "marketSignal": "A confirmed completion horizon gives buyers a clearer timing benchmark for North Flagler inventory.",
    "bestFor": "Buyers comfortable planning around a 2028 completion horizon.",
    "watchPoints": "Construction milestones, revised completion guidance and future occupancy or closing updates.",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Olara’s Completion Horizon Is Set for 2028",
    "newsletterBlurb": "The latest verified project timing points to 2028 completion for Olara on North Flagler, giving buyers a clearer planning horizon.",
    "newsletterCta": "Read the article",
    "query": "Olara’s Completion Horizon Is Set for 2028",
    "category": "development",
    "relatedProjectIds": [
      "olara-wpb"
    ],
    "relatedCorridorIds": [
      "north-flagler"
    ],
    "relatedProjectSlugs": [
      "olara-wpb"
    ],
    "relatedCorridors": [
      "north-flagler"
    ],
    "primaryProjectSlug": "olara-wpb",
    "corridorLabel": "North Flagler",
    "imagePath": "/assets/editorial/flagler-waterfront-corridor.jpg",
    "sourceLinks": [
      {
        "label": "Florida YIMBY",
        "url": "https://floridayimby.com/2025/12/olara-commences-vertical-construction-at-1919-north-flagler-drive-in-west-palm-beach.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "downtown-plan-advances-without-waterfront-height-incentive-2026-09-14",
    "slug": "downtown-plan-advances-without-waterfront-height-incentive-2026-09-14",
    "title": "West Palm’s downtown plan advances without the 25-story waterfront incentive",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/Departments/Development-Services/Planning-Division/Downtown-Master-Plan",
    "canonicalUrl": "https://www.wpb.org/Departments/Development-Services/Planning-Division/Downtown-Master-Plan",
    "sourceTitle": "West Palm’s downtown plan advances without the 25-story waterfront incentive",
    "publishedAt": "2026-09-14T13:21:10.840Z",
    "sourcePublishedAt": "2026-09-09",
    "sourcePublishedDate": "2026-09-09",
    "eventDate": "2026-09-09",
    "dateDiscovered": "2026-09-14",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-09-14T13:21:10.840Z",
    "deck": "The September 9 advisory vote sends a revised growth plan toward Planning Board review, with waterfront height incentives removed and wider density questions unresolved.",
    "description": "West Palm Beach’s downtown plan advances after a waterfront-height revision. The Planning Board hearing is scheduled for September 15.",
    "summary": "The September 9 advisory vote sends a revised growth plan toward Planning Board review, with waterfront height incentives removed and wider density questions unresolved.",
    "bodySections": [
      {
        "heading": "A revised plan clears an advisory vote",
        "body": "West Palm Beach’s Downtown Action Committee voted 3–1 on September 9 to recommend a revised Downtown Master Plan, after the city removed a proposed incentive that would have allowed 25-story buildings along portions of the Flagler Drive waterfront. The change narrows one of the most contested parts of the proposal while leaving a much larger debate about downtown growth alive.\n\nThis was a recommendation, not final adoption. The city lists a Planning Board public hearing for September 15 at 6 p.m. at City Hall, 401 Clematis Street. For anyone following the next generation of downtown development, the immediate story is a changed proposal moving into another public review."
      },
      {
        "heading": "The waterfront change has a specific scope",
        "body": "The withdrawn incentive had appeared in an earlier draft covering waterfront properties between Datura Street and Lakeview Avenue. Its removal does not erase existing towers, settle every parcel’s development rights or amount to a guarantee that a particular condominium view will remain unchanged.\n\nThe revised proposal directs attention back toward inland districts where greater building height remains part of the discussion. That distinction matters along Flagler: a change to one incentive is a narrower action than a citywide height cap. Buyers comparing waterfront homes should still examine the zoning and pending applications on the actual neighboring parcels."
      },
      {
        "heading": "Density brings street-level questions",
        "body": "At the committee hearing, the argument extended well beyond the skyline. Residents challenged how added development would affect traffic, parking and emergency services. City transportation staff described possible responses including adaptive signals, stronger transit service and safer walking and cycling connections. Those were discussed as ways to manage growth, not as a list of completed improvements.\n\nFirefighter representatives also raised the demands of serving taller buildings. For downtown residents, these are practical questions: how a trip across Okeechobee works, how emergency crews reach an upper floor and whether the street network can absorb the next round of construction. Removing the waterfront incentive leaves that work ahead.",
        "image": "/assets/editorial/downtown-plan-advances-without-waterfront-height-incentive-2026-09-14-body-1.jpg"
      },
      {
        "heading": "The next argument is about the process",
        "body": "Neighborhood representatives welcomed the waterfront revision but pressed for more time to analyze the wider plan. Their objections at the hearing included the amount of development the proposal could accommodate and whether residents had enough opportunity to assess its consequences.\n\nThe committee also recommended further engagement with neighborhood representatives before the City Commission considers the plan. A narrower waterfront proposal therefore should not be read as a settled political agreement. Support for removing one provision and support for the overall update are separate questions, and the hearing made that difference visible."
      },
      {
        "heading": "What to watch at the next hearing",
        "body": "The September 15 Planning Board hearing is the next scheduled opportunity to test the revised language. The city’s staff report describes an approval process involving advisory boards and two City Commission readings. The published draft remains a proposal within that process.\n\nWatch whether the next version changes district boundaries, height incentives or the requirements attached to additional development. Just as useful is a clear explanation of which provisions survive unchanged. For a buyer or property owner, the decision is to follow the applicable parcel and the adopted text, rather than treating an advisory vote as permission to build."
      }
    ],
    "whyItMatters": "The revision changes the waterfront incentive proposal while leaving broader downtown growth rules under review.",
    "buyerContext": "",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "West Palm’s downtown plan advances without the 25-story waterfront incentive",
    "newsletterBlurb": "The September 9 advisory vote sends a revised growth plan toward Planning Board review, with waterfront height incentives removed and wider density questions unresolved.",
    "newsletterCta": "Read the article",
    "query": "project-development: West Palm Beach downtown master plan September 9 2026 waterfront incentive",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [
      "downtown"
    ],
    "relatedProjectSlugs": [],
    "relatedCorridors": [
      "downtown"
    ],
    "corridorLabel": "Downtown",
    "imagePath": "/assets/editorial/downtown-plan-advances-without-waterfront-height-incentive-2026-09-14-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach: Downtown Master Plan update and hearing",
        "url": "https://www.wpb.org/Departments/Development-Services/Planning-Division/Downtown-Master-Plan",
        "type": "official primary source"
      },
      {
        "label": "City planning staff report and draft zoning regulations",
        "url": "https://www.wpb.org/files/assets/city/v/1/development-services/documents/downtown-master-plan/10.9-dmpu-staff-report.pdf",
        "type": "official draft document"
      },
      {
        "label": "Palm Beach Post via AOL: September 9 committee vote",
        "url": "https://www.aol.com/articles/west-palm-nixes-25-story-231922000.html",
        "type": "independent local reporting"
      },
      {
        "label": "WFLX: Waterfront revisions and infrastructure debate",
        "url": "https://www.wflx.com/2026/09/10/west-palm-beach-downtown-master-plan-moves-forward-after-changes-remove-25-story-waterfront-buildings/",
        "type": "independent local reporting"
      },
      {
        "label": "Stet News: Residents press for further review",
        "url": "https://stetnews.org/2026/09/10/west-palm-beach-residents-promise-the-fight-isnt-over/",
        "type": "independent local reporting"
      },
      {
        "label": "WLRN carrying Stet News: Withdrawal of proposed waterfront incentive",
        "url": "https://www.wlrn.org/light/development/2026-09-08/high-rise-waterfront-buildings-axed-from-west-palms-downtown-proposal",
        "type": "syndicated background; not an additional independent source"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "related-ross-files-25-story-464-fern-plan-2026-08-20",
    "slug": "related-ross-files-25-story-464-fern-plan-2026-08-20",
    "title": "Related Ross files a 25-story plan for 464 Fern",
    "sourceName": "Related Ross",
    "sourceUrl": "https://www.relatedross.com/news-articles",
    "canonicalUrl": "https://www.relatedross.com/news-articles",
    "sourceTitle": "Related Ross files a 25-story plan for 464 Fern",
    "publishedAt": "2026-08-29T13:24:41.173Z",
    "sourcePublishedAt": "2026-08-20",
    "sourcePublishedDate": "2026-08-20",
    "eventDate": "2026-08-20",
    "dateDiscovered": "2026-08-29",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-08-29T13:24:41.173Z",
    "deck": "The new downtown filing calls for 194 residences, retail, and 486 parking spaces on a 2.64-acre block that still sits close to Brightline and CityPlace.",
    "description": "Related Ross has filed a 25-story residential plan for 464 Fern Street, shifting one of downtown West Palm Beach's last large blocks back into review.",
    "summary": "The 464 Fern filing adds 194 residences, ground-floor retail, and a new planning test for downtown West Palm Beach.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "Related Ross has filed plans for Residences at 464 Fern Street, putting a 25-story tower back into downtown West Palm Beach's review pipeline. The current proposal calls for about 316 feet of height, 194 residences, 4,343 square feet of commercial space, and 486 parking spaces on a 2.64-acre site the developer bought for $55 million in May.\n\nThat alone is enough to make the block worth another look. The site sits near Brightline, CityPlace, and the east-west core of downtown, so a major change there is never just about one building. It changes how the district edge feels."
      },
      {
        "heading": "Why this version stands out",
        "body": "This is also a different version of the same address, not a new dot on the map. 13th Floor Investments' Fern & Gardenia portfolio page described the property as a 361-unit, 25-story multifamily rental high-rise with 42,000 square feet of retail. The new Related Ross filing is smaller, more residential, and more directly aimed at the upper end of the downtown market.\n\nThe shift matters because it shows how the block has evolved. Earlier proposals under 13th Floor, Wexford Real Estate Investors, and L&L Holding Company gave the site a mixed-use future. Related Ross is now presenting a cleaner residential case, and the market will judge whether that reads as refinement or simply another reset."
      },
      {
        "heading": "Why 464 Fern matters",
        "body": "This is one of the few remaining downtown blocks large enough to shape the district instead of just filling a gap. 13th Floor's own portfolio language made that plain, saying very few remaining sites in downtown allow for such a large-scale development. That is the real significance of 464 Fern: it is one of the pieces of land that can still change the map.\n\nFor readers tracking West Palm Beach as a place rather than a pile of projects, the block sits in the narrow band between the Brightline station, CityPlace, and the blocks that keep downtown stitched together. A site like this influences walkability, street life, and the handoff between transit and the rest of the core.",
        "image": "/assets/editorial/related-ross-files-25-story-464-fern-plan-2026-08-20-body-1.jpg"
      },
      {
        "heading": "What will get reviewed",
        "body": "The first review step came through the city's Plans and Plats Review Committee in mid-June, but the project still needs more boards and a final city commission vote before construction can begin. That leaves plenty of room for the plan to change.\n\nThe parking podium is the obvious pressure point. So is the ground floor. The current filing puts 4,343 square feet of commercial space at street level and stacks 486 parking spaces above it, which means reviewers will care about how active the base feels from Fern Street and South Dixie Highway."
      },
      {
        "heading": "What to watch next",
        "body": "The next question is whether the tower stays at 194 residences, whether the podium gets trimmed or reworked, and whether the city wants more active frontage before it signs off. If the plan keeps moving, 464 Fern becomes another major downtown addition. If it stalls, the garage and the street edge will probably be the reasons.\n\nIn downtown West Palm Beach, the real story is often not the headline height. It is whether a large block starts acting like part of the city instead of a blank stretch between larger destinations."
      }
    ],
    "whyItMatters": "464 Fern is one of the few remaining downtown blocks large enough to change how the district grows. This filing keeps that land in play instead of letting it sit as a gap between Brightline, CityPlace, and the east-west core of downtown.",
    "buyerContext": "For buyers watching downtown West Palm Beach, this is less about a single tower than about the kind of block the city still has left to shape. The site size, transit proximity, and parking ratio will matter to anyone tracking how the district absorbs more residential density.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Downtown West Palm Beach",
      "CityPlace"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Related Ross files a new 464 Fern plan",
    "newsletterBlurb": "A 25-story, 194-residence tower at 464 Fern keeps one of downtown West Palm Beach's last big blocks in active review.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach 464 Fern Street Related Ross August 2026 development plan",
    "category": "development",
    "relatedProjectIds": [
      "fern-and-gardenia-related-ross-fern-street"
    ],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [
      "fern-and-gardenia-related-ross-fern-street"
    ],
    "relatedCorridors": [
      "downtown"
    ],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/related-ross-files-25-story-464-fern-plan-2026-08-20-hero.jpg",
    "sourceLinks": [
      {
        "label": "Related Ross news articles page listing the 464 Fern story",
        "url": "https://www.relatedross.com/news-articles",
        "type": "official company source"
      },
      {
        "label": "Floridian Development: Related Ross Unveils Plans for Residences at 464 Fern Street, Featuring 194 Units",
        "url": "https://floridiandevelopment.com/related-ross-unveils-plans-for-residences-at-464-fern-street-featuring-194-units/",
        "type": "independent local development coverage"
      },
      {
        "label": "Florida YIMBY: Plans Filed For 25-Story Residences At 464 Fern Street In Downtown West Palm Beach",
        "url": "https://floridayimby.com/2026/08/plans-filed-for-25-story-residences-at-464-fern-street-in-downtown-west-palm-beach.html",
        "type": "independent development coverage"
      },
      {
        "label": "Traded: Related Ross Plans 194-Unit Tower in Downtown West Palm Beach",
        "url": "https://traded.co/blog/related-ross-plans-194-unit-tower-in-downtown-west-palm-beach/",
        "type": "independent CRE coverage"
      },
      {
        "label": "13th Floor Investments: Fern & Gardenia",
        "url": "https://13fi.com/portfolio/fern-gardenia",
        "type": "official historical project source"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium",
    "primaryProjectSlug": "fern-and-gardenia-related-ross-fern-street"
  },
  {
    "id": "banyan-tree-400-hibiscus-approval",
    "slug": "banyan-tree-400-hibiscus-approval-2026-08-23",
    "title": "Banyan Tree gets unanimous downtown approval at 400 Hibiscus",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/Events-Folder/2026/081226-DAC",
    "canonicalUrl": "https://www.wpb.org/Events-Folder/2026/081226-DAC",
    "sourceTitle": "Downtown Action Committee",
    "publishedAt": "2026-08-23T17:20:22.307Z",
    "sourcePublishedAt": "2026-08-12",
    "sourcePublishedDate": "2026-08-12",
    "eventDate": "2026-08-12",
    "dateDiscovered": "2026-08-22",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-08-23T17:20:22.307Z",
    "deck": "West Palm Beach’s Downtown Action Committee signed off on Banyan Tree Residences on August 12, moving the brand’s first U.S. residential address one step deeper into the city’s development pipeline.",
    "description": "West Palm Beach’s Downtown Action Committee unanimously approved Banyan Tree Residences at 400 Hibiscus Street, adding another branded condo project to downtown’s active pipeline.",
    "summary": "The August 12 approval gives Banyan Tree more planning certainty at 400 Hibiscus Street and sharpens downtown’s branded-residence comparison set.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "Banyan Tree Residences West Palm Beach cleared a downtown city hearing on August 12. The City of West Palm Beach’s event page confirms the Downtown Action Committee meeting date, and local coverage reports that the project won unanimous approval there. That moves the 400 Hibiscus Street plan from a launch-stage branding story into a real step in the city’s approval process."
      },
      {
        "heading": "What the project is",
        "body": "The official Banyan Tree site says the project will bring 88 corner residences to downtown, with homes ranging from one to four bedrooms and a sales gallery open by appointment at 400 Hibiscus Street. The development is being brought forward by Mast Capital and Curated JCZM Development in collaboration with Banyan Group, with OMA, Yabu Pushelberg, and Enea Landscape Architecture on the team.\n\nThe useful takeaway is simple: the headline number did not change, but the project now has a firmer downtown planning footing. That matters in West Palm Beach, where branded residences are no longer just a concept. They are part of the city’s actual pipeline."
      },
      {
        "heading": "Why downtown cares",
        "body": "Downtown West Palm Beach keeps adding projects that compete on more than square footage. Banyan Tree enters the market as a hospitality-branded residence with a wellness-first identity, which puts it in a different conversation from a plain luxury condo. Buyers will compare it against Mr. C, NORA House, The Berkeley, and the broader North and South Flagler sets, but the real question is not just brand recognition. It is whether the service promise, location, and daily convenience are strong enough to justify the premium.",
        "image": "/projects/banyan-tree/media/showcase/banyan-tree-amenities-lobby-v01-web.jpg"
      },
      {
        "heading": "What to watch next",
        "body": "The next signals that matter are permits, final offering documents, parking and storage allocations, fee structure, and delivery timing. Renderings and launch material can tell you the mood of a project. The documents tell you what ownership actually costs and what the building will really deliver.\n\nFor now, the approval itself is the story. Banyan Tree has advanced one more step in downtown West Palm Beach, and the city’s branded-residence conversation just got a little more crowded."
      }
    ],
    "whyItMatters": "The approval moves Banyan Tree from launch language toward an actual downtown entitlement record. It also adds another branded residence to the city’s luxury comparison set, which matters for buyers weighing service, walkability, and carrying costs against the waterfront alternatives.",
    "buyerContext": "Most useful for buyers comparing branded downtown residences, hospitality-led service promises, and the tradeoff between city walkability and waterfront positioning.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [
      "Banyan Tree Residences West Palm Beach"
    ],
    "relatedNeighborhoods": [
      "Downtown West Palm Beach"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [
      "are-branded-residences-worth-it-west-palm-beach"
    ],
    "newsletterHeadline": "Banyan Tree clears a downtown city gate",
    "newsletterBlurb": "The branded condo project at 400 Hibiscus Street won unanimous DAC approval on August 12.",
    "newsletterCta": "See what changed at 400 Hibiscus",
    "query": "West Palm Beach Banyan Tree Residences Downtown Action Committee approval 400 Hibiscus August 2026",
    "category": "development",
    "relatedProjectIds": [
      "banyan-tree"
    ],
    "relatedCorridorIds": [
      "downtown"
    ],
    "relatedProjectSlugs": [
      "banyan-tree"
    ],
    "relatedCorridors": [
      "Downtown West Palm Beach"
    ],
    "primaryProjectSlug": "banyan-tree",
    "corridorLabel": "Downtown",
    "imagePath": "/assets/projects/banyan-tree/residences/banyan-tree-residences-living-room-v01.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach Downtown Action Committee event page",
        "url": "https://www.wpb.org/Events-Folder/2026/081226-DAC",
        "type": "city planning material"
      },
      {
        "label": "Banyan Tree Residences official site",
        "url": "https://www.banyantreeresidenceswpb.com/",
        "type": "official project site"
      },
      {
        "label": "Florida YIMBY approval coverage",
        "url": "https://floridayimby.com/2026/08/banyan-tree-residences-west-palm-beach-secures-unanimous-downtown-action-committee-approval.html",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "cityplace-hotel-package-pushed-to-aug-31-2026-08-23",
    "slug": "cityplace-hotel-package-pushed-to-aug-31-2026-08-23",
    "title": "CityPlace hotel package gets pushed to Aug. 31",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/News-Folder/News-2026/081826-Mayor-CC-Approvals-and-Decisions",
    "canonicalUrl": "https://www.wpb.org/News-Folder/News-2026/081826-Mayor-CC-Approvals-and-Decisions",
    "sourceTitle": "CityPlace hotel package gets pushed to Aug. 31",
    "publishedAt": "2026-08-23T17:11:36.883Z",
    "sourcePublishedAt": "2026-08-18",
    "sourcePublishedDate": "2026-08-18",
    "eventDate": "2026-08-17",
    "dateDiscovered": "2026-08-23",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-08-23T17:11:36.883Z",
    "deck": "West Palm Beach kept the second convention center hotel in play on Aug. 17, but moved the final city vote to Aug. 31 and left the CityPlace/Convention Center district rewrite for another hearing.",
    "description": "West Palm Beach kept the second convention center hotel in play on Aug. 17, but moved the final city vote to Aug. 31 and left the CityPlace/Convention Center district rewrite for another hearing.",
    "summary": "West Palm Beach moved the second convention center hotel package to an Aug. 31 second reading after a new city meeting, keeping the 18-story, 400-room proposal alive while the district rewrite waits for a final vote.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "West Palm Beach did not finish the second convention center hotel package on Aug. 17. The City Commission continued second reading of Ordinance No. 5179-26 and Resolutions Nos. 156-26 and 157-26 to Aug. 31, so the 18-story, 400-room proposal remains alive but still unfinished.\n\nThat matters because this is not a small tweak. The package sits inside the CityPlace Commercial Planned Development and is meant to create the Convention Center District and Hotel II Subarea. In other words, the city is not just deciding on one building. It is deciding how this corner of downtown is supposed to function next."
      },
      {
        "heading": "What is actually new",
        "body": "The new part is the timing, not the concept. West Palm Beach had already taken the hotel package through first reading on Aug. 3. Now the item is back on the calendar for Aug. 31, after the latest meeting pushed the final hearing out two more weeks.\n\nCity documents describe the project as an 18-story, 400-room hotel with waivers in the Hotel II Subarea. CBS12 reported that the Curio-branded hotel would rise at 900 S. Rosemary Ave., on a site long used for overflow parking, and that the proposal includes a two-story meeting and event space plus a 7,300-square-foot restaurant."
      },
      {
        "heading": "Why this part of the city matters",
        "body": "This corner is one of the few places downtown where hotel rooms, convention traffic, parking, and public space all collide at once. The existing Hilton and the convention center already anchor that block. A second hotel adds more room nights and more activity, but it also raises the stakes around garage access, event traffic, and how easy it feels to move through Rosemary Avenue on foot.\n\nThat is why the hearing matters beyond the hotel itself. If the district rules land cleanly, the area gets a stronger meetings and hospitality spine. If the waivers or garage terms keep drawing concern, the hotel may still move forward, but the district will keep carrying more policy weight than a normal site plan.",
        "image": "/projects/10-cityplace/media/cityplace-shared-card-1448x1086.jpg"
      },
      {
        "heading": "What to watch next",
        "body": "The next checkpoint is Aug. 31. Watch whether the second reading moves cleanly, whether the city adjusts any of the district rules or waivers, and whether the parking arrangement around the convention center garage changes again.\n\nIf the item clears that hearing, the story shifts from whether the hotel is coming to how quickly the district can absorb it. If it slips again, that would signal the city still has unresolved questions about the edge of downtown that the project is meant to reshape."
      }
    ],
    "whyItMatters": "The change does not kill the project, but it does keep the CityPlace/Convention Center edge in motion. For downtown, the question now is not whether the hotel stays in the mix. It is how the city handles the district rules, the garage relationship, and the pedestrian load around Rosemary Avenue and Okeechobee Boulevard.",
    "buyerContext": "",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [
      "west-palm-beach-clears-tax-hurdle-second-convention-center-hotel-2026-08-10"
    ],
    "newsletterHeadline": "CityPlace hotel package gets pushed to Aug. 31",
    "newsletterBlurb": "West Palm Beach kept the second convention center hotel in play on Aug. 17, but moved the final city vote to Aug. 31 and left the CityPlace/Convention Center district rewrite for another hearing.",
    "newsletterCta": "Read the article",
    "query": "CityPlace hotel package gets pushed to Aug. 31",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/cityplace-hotel-package-pushed-to-aug-31-2026-08-23-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach approval summary",
        "url": "https://www.wpb.org/News-Folder/News-2026/081826-Mayor-CC-Approvals-and-Decisions",
        "type": "city planning material"
      },
      {
        "label": "CBS12 coverage of the hotel proposal",
        "url": "https://cbs12.com/news/local/west-palm-beach-to-consider-400-room-convention-center-hotel-and-parking-deal-related-ross-curio-hotel-hilton-county-parking-garage-revenue-growth-traffic-pedestrian-safety-waivers",
        "type": "local news coverage"
      },
      {
        "label": "Boca Post follow-up on the Aug. 17 meeting",
        "url": "https://bocapost.com/west-palm-beach-news/west-palm-beach-city-commission-august-2026-development-pause-fire-assessment/",
        "type": "local news coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "wpb-content-scout-safe-daily-publish-district-pointe-2026-08-13",
    "slug": "west-palm-beach-locks-in-district-pointe-workforce-housing-mix-2026-08-23",
    "title": "West Palm Beach locks in District Pointe's workforce housing mix",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-city-commission-agendas/07-jul-2026-final-cca/07_20_26_fnal-city-commission-agenda.pdf",
    "canonicalUrl": "https://bocapost.com/west-palm-beach-news/west-palm-beach-commission-pine-crest-land-sale-south-flagler-zoning-pause-july-2026/",
    "sourceTitle": "West Palm Beach locks in District Pointe's workforce housing mix",
    "publishedAt": "2026-08-23T17:10:17.167Z",
    "sourcePublishedAt": "2026-07-21",
    "sourcePublishedDate": "2026-07-21",
    "eventDate": "2026-07-20",
    "dateDiscovered": "2026-08-23",
    "freshnessLane": "recent_30d",
    "fetchedAt": "2026-08-23T17:10:17.167Z",
    "deck": "The city approved a restrictive covenant for the 280-unit Belvedere Road project, fixing 71 homes as affordable or workforce housing and keeping the long-running plan moving.",
    "description": "West Palm Beach approved a restrictive covenant for District Pointe at 1501 Belvedere Road, locking in 71 affordable or workforce units inside a 280-unit rental project.",
    "summary": "District Pointe's covenant adds 71 affordable/workforce units to a 280-unit Belvedere Road project and shows West Palm Beach still using inland sites to add supply.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "West Palm Beach approved a restrictive covenant with District Pointe, LLC on July 20 for a 280-unit rental project at 1501 Belvedere Road. The agreement fixes 71 units, or 25% of the project, as affordable or workforce housing. The breakdown is specific: 18 homes at or below 80% of area median income, 32 units from 81% to 100%, and 21 more from 101% to 120%.\n\nThat is the part worth focusing on. This was not a press-release ribbon cutting or a fresh groundbreaking. It was the city making the housing mix part of the record and tying the project to enforceable affordability terms."
      },
      {
        "heading": "What is actually new",
        "body": "District Pointe was already a known project before the July vote, and the development has been in motion long enough to move through multiple phases of review. The new step is narrower and more important: it turns a long-planned rental project into one with a locked-in housing covenant.\n\nThat distinction matters in West Palm Beach, where the most consequential changes often happen in the paperwork before they ever show up in the skyline. A project can look the same from the street while its obligations, unit mix, and financing path change underneath it."
      },
      {
        "heading": "Why Belvedere Road matters",
        "body": "Belvedere Road is not the city's postcard corridor. That is exactly why this approval matters. 1501 Belvedere sits in a practical part of West Palm Beach, closer to the airport and I-95 access than to the luxury waterfront. Projects there do a different job from tower developments on Flagler or downtown.\n\nThey add housing in a part of the city shaped by access, employment, and utility rather than pure address prestige. When West Palm Beach pushes workforce units into that lane, it broadens the market beyond the blocks that already get the most attention.",
        "image": "/assets/editorial/west-palm-beach-locks-in-district-pointe-workforce-housing-mix-2026-08-23-body-1.jpg"
      },
      {
        "heading": "How the numbers read",
        "body": "Seventy-one affordable or workforce units is not a token gesture on a 280-unit project. It is a real share, and the three-tier income split shows the city wanted the covenant to reach more than one affordability band. That is useful because it keeps the project from being discussed as a binary luxury-versus-affordable fight.\n\nThe better reading is that West Palm Beach is trying to thread new supply into the city without pretending every project has to be a trophy tower. District Pointe is a reminder that housing policy and private development still meet in the middle, and that the middle can be material."
      },
      {
        "heading": "What to watch next",
        "body": "The next question is whether District Pointe now moves cleanly through the remaining permitting and construction steps or stalls in the usual pre-build friction. The covenant gives the project a clearer housing identity, but it does not eliminate the hard parts: financing, sequencing, and execution.\n\nWatch Belvedere Road for that next signal. If this project keeps moving, it reinforces a pattern West Palm Beach has leaned on all year: some of the city's most consequential development is still happening away from the waterfront, in the corridors where supply, access, and affordability intersect."
      }
    ],
    "whyItMatters": "The commission vote turns District Pointe from a broad development plan into a housing obligation with real numbers behind it. That matters because West Palm Beach is still adding supply on its less glamorous inland edge, not just on the waterfront blocks that already dominate the market conversation.",
    "buyerContext": "For buyers comparing West Palm Beach corridors, District Pointe is a reminder that the city's supply story is broader than trophy towers. Inland projects with workforce components can shape long-term neighborhood balance, commute patterns, and the amount of everyday housing depth the market can absorb.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Development Watch: District Pointe's housing mix hardens",
    "newsletterBlurb": "The city approved a restrictive covenant for the 280-unit Belvedere Road project, fixing 71 homes as affordable or workforce housing and keeping the long-running plan moving.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach District Pointe 1501 Belvedere Road affordable housing July 2026 city commission",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/west-palm-beach-locks-in-district-pointe-workforce-housing-mix-2026-08-23-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach July 20 commission agenda: District Pointe restrictive covenant",
        "url": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-city-commission-agendas/07-jul-2026-final-cca/07_20_26_fnal-city-commission-agenda.pdf",
        "type": "official city source"
      },
      {
        "label": "Boca Post: District Pointe approved with 71 workforce/affordable units",
        "url": "https://bocapost.com/west-palm-beach-news/west-palm-beach-commission-pine-crest-land-sale-south-flagler-zoning-pause-july-2026/",
        "type": "independent local coverage"
      },
      {
        "label": "Verdex Construction: District Pointe office building purchase and redevelopment plan",
        "url": "https://verdex.com/verdex-construction-and-index-investment-group-buy-west-palm-beach-office-for-13-4-million/",
        "type": "official company source"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "west-palm-beach-clears-tax-hurdle-second-convention-center-hotel-2026-08-10",
    "slug": "west-palm-beach-clears-tax-hurdle-second-convention-center-hotel-2026-08-10",
    "title": "West Palm Beach clears a tax hurdle for the second convention center hotel",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/News-Folder/News-2026/080426-Mayor-CC-CRA-Approvals",
    "canonicalUrl": "https://www.wpb.org/News-Folder/News-2026/080426-Mayor-CC-CRA-Approvals",
    "sourceTitle": "West Palm Beach clears a tax hurdle for the second convention center hotel",
    "publishedAt": "2026-08-10T13:27:06.499Z",
    "sourcePublishedAt": "2026-08-04",
    "sourcePublishedDate": "2026-08-04",
    "eventDate": "2026-08-03",
    "dateDiscovered": "2026-08-10",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-08-10T13:27:06.499Z",
    "deck": "The Aug. 3 CRA vote keeps the hotel PILOT formula intact while loosening the garage-land rules around the Related Ross plan.",
    "description": "West Palm Beach approved a first amendment to the convention center hotel agreement, removing the requirement that the garage land stay taxable and allowing parking to move elsewhere.",
    "summary": "The city and CRA loosened one of the sharpest tax constraints on the second convention center hotel, but the county still has to act.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "The CRA agenda says the first amendment to the 2012 Convention Center Hotel agreement would do four specific things: remove the requirement that the garage land remain taxable, allow hotel parking to be moved elsewhere, keep parking expenses deductible even after relocation, and leave no replacement payment in place for the lost garage-land taxes. The executive summary estimates that parcel at roughly $38,631 in annual ad valorem taxes.\n\nJust as important, the amendment does not rewrite the underlying hotel PILOT math. The payment formula, schedule and valuation approach remain in place, which means the city and county are changing the land-and-parking mechanics without reopening the whole financial structure."
      },
      {
        "heading": "Why this deal needed another turn",
        "body": "The proposed hotel has been moving through a long public process. Related Ross is seeking approvals for a 400-room Curio by Hilton at 900 South Rosemary Avenue, on a site now used as overflow parking for the convention center. Stet News reported in June that the Planning Board had unanimously approved the hotel plan after the company said it had adjusted design and access details to address neighborhood concerns.\n\nThe latest city action is the tax-and-parking counterpart to that planning work. If the project is going to replace a surface lot, rely on garage spaces and still make the numbers work for both the developer and the public side, the agreement has to be flexible enough to move those pieces around."
      },
      {
        "heading": "What the city is protecting",
        "body": "The city is not writing a blank check here. The amendment keeps the hotel PILOT structure alive, which is the part that ties the project back to a long-term revenue stream for the public side. Traded reported that Related Ross is pursuing a sale-leaseback model in which the county would own the site while the developer funds construction and leases garage spaces for hotel use.\n\nThat is the balance West Palm Beach keeps trying to strike with these big downtown projects: enough flexibility to let the deal move, enough public control to make sure the district still produces revenue and access. In this case, the city seems willing to give on the garage-land rule so long as the larger payment framework survives."
      },
      {
        "heading": "Why this matters downtown",
        "body": "The convention center hotel is not just a hospitality project. It is a traffic, parking and district-shaping project. Related Ross says the hotel is meant to close a long-standing room-count gap for convention business, and the current parking arrangement assumes hundreds of spaces in the county garage will help support both the existing Hilton and the new hotel.\n\nThat means the city is effectively deciding what kind of downtown edge it wants around Rosemary Avenue and the convention center block. A hotel that depends on shared garage parking, walkability and a public-private land structure changes the daily pattern of the district far more than a conventional ground-up hotel with its own garage would."
      },
      {
        "heading": "What to watch next",
        "body": "The immediate question is whether the county signs off on the larger land-and-lease package. The city side is now farther along, but the deal still needs county approval and a final path through the remaining resolutions tied to the project.\n\nThe second checkpoint is whether the promised revenue structure survives in practice. If the garage land comes off the tax rolls and the hotel still lands on the lease-back track, the project will have cleared one of its biggest policy hurdles. If the county pushes back on ownership, parking or tax treatment, the whole downtown hotel package could still change shape."
      }
    ],
    "whyItMatters": "The amendment removes one tax and parking constraint from the second convention center hotel while keeping the hotel PILOT formula in place, which makes the deal easier to move forward without changing its basic revenue math.",
    "buyerContext": "For downtown buyers, the point is not the hotel itself so much as what it signals: the city and county are still willing to reshape the convention-center district around large, publicly negotiated projects, and that can affect traffic, parking, and the long-term usefulness of Rosemary Avenue and the surrounding blocks.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Downtown West Palm Beach",
      "Grandview Heights",
      "CityPlace"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "West Palm Beach clears a tax hurdle for the second convention center hotel",
    "newsletterBlurb": "The Aug. 3 CRA vote keeps the hotel PILOT formula intact while loosening the garage-land rules around the Related Ross plan.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach Aug. 3 2026 CRA agenda convention center hotel garage land amendment Related Ross Curio hotel",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [
      "Rosemary Avenue",
      "CityPlace"
    ],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/west-palm-beach-clears-tax-hurdle-second-convention-center-hotel-2026-08-10-hero.jpg",
    "sourceLinks": [
      {
        "label": "Mayor, City Commission, CRA Approvals and Decisions for Aug. 3, 2026",
        "url": "https://www.wpb.org/News-Folder/News-2026/080426-Mayor-CC-CRA-Approvals",
        "type": "official city release"
      },
      {
        "label": "City of West Palm Beach CRA agenda - Aug. 3, 2026",
        "url": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-cra-agendas/08_03_26_final-cra-agenda.pdf",
        "type": "official agenda"
      },
      {
        "label": "Second convention center hotel passes key test",
        "url": "https://stetnews.org/2026/06/22/second-convention-center-hotel-passes-key-test/",
        "type": "independent local coverage"
      },
      {
        "label": "Related Ross Advances $300M Curio by Hilton Near West Palm Beach Convention Center",
        "url": "https://traded.co/blog/related-ross-advances-300m-curio-by-hilton-near-west-palm-beach-convention-center/",
        "type": "independent market coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "west-palm-beach-coleman-park-habitat-lots",
    "slug": "west-palm-beach-sets-two-coleman-park-lots-on-habitats-path-2026-08-03",
    "title": "West Palm Beach sets two Coleman Park lots on Habitat's path",
    "sourceName": "City of West Palm Beach Community Redevelopment Agency",
    "sourceUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-cra-agendas/08_03_26_final-cra-agenda.pdf",
    "canonicalUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-cra-agendas/08_03_26_final-cra-agenda.pdf",
    "sourceTitle": "West Palm Beach sets two Coleman Park lots on Habitat's path",
    "publishedAt": "2026-08-03T13:23:13.004Z",
    "sourcePublishedAt": "2026-08-03",
    "sourcePublishedDate": "2026-08-03",
    "eventDate": "2026-08-03",
    "dateDiscovered": "2026-08-03",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-08-03T13:23:13.004Z",
    "deck": "The city's August 3 CRA agenda puts 631 6th Street and 639 4th Street on track for Habitat for Humanity homes, extending the Coleman Park infill push.",
    "description": "West Palm Beach CRA agenda items for August 3 would convey 631 6th Street and 639 4th Street to Habitat for Humanity for affordable housing.",
    "summary": "West Palm Beach is lining up two Coleman Park parcels for Habitat for Humanity homes, keeping the city's small-lot infill strategy moving.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "West Palm Beach is putting two small Coleman Park parcels back into the housing pipeline, and the paper trail is the point. The city's August 3 Community Redevelopment Agency agenda includes companion resolutions for 631 6th Street and 639 4th Street, both tied to Habitat for Humanity and affordable housing.\n\nOn a meeting agenda, that can look routine. On the ground, it is the kind of small land action that keeps a neighborhood redevelopment story from becoming only a skyline story. West Palm Beach still has to decide what happens to the smallest pieces of public land, and these two lots show the city is still willing to use them for ownership housing."
      },
      {
        "heading": "What is actually new",
        "body": "The important detail is that this is not a vague future concept. Habitat for Humanity's July 2026 homeownership packet lists both 631 6th Street and 639 4th Street as new-construction homes in West Palm Beach, each described as a three-bedroom, two-bath project.\n\nThat matters because it tells you the parcels are already linked to a specific end use. The city is not just talking about affordability in the abstract. It is moving two lots toward a defined type of home, with the Habitat process already far enough along to identify them by address and product type."
      },
      {
        "heading": "Why Coleman Park matters",
        "body": "Coleman Park has become one of the clearest tests of whether redevelopment can add homes without turning the neighborhood into a place only insiders can afford. Big projects grab headlines, but small infill lots are where affordable ownership actually gets built.\n\nThat is why this agenda item deserves attention. West Palm Beach has spent years adding pressure to its land market, especially in and around downtown. The city now has to keep a path open for projects that are smaller, more local, and more attainable than the high-rise deals that dominate the market conversation.\n\nHabitat is useful here because it turns a public parcel into a final address, not just a policy talking point. If these lots move forward, the city is not merely preserving a promise. It is making room for a family to buy into the neighborhood at a price that is tied to the program rather than to speculative land values."
      },
      {
        "heading": "What to watch next",
        "body": "The next checkpoint is whether the CRA approves the conveyances and how quickly the parcels move from agenda item to recorded transfer. After that, the milestones that matter are permits, start dates, and whether the homes stay on a realistic path to completion.\n\nIf the transfer clears, the signal is straightforward: West Palm Beach is still using public land for incremental affordable housing, and it is still doing it block by block. That may not be the flashiest development story in the city, but it is one of the most concrete."
      }
    ],
    "whyItMatters": "",
    "buyerContext": "",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Coleman Park"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "West Palm Beach lines up two Habitat lots in Coleman Park",
    "newsletterBlurb": "The city's August 3 CRA agenda puts 631 6th Street and 639 4th Street on track for Habitat for Humanity homes, extending the Coleman Park infill push.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach CRA agenda August 3 2026 631 6th Street 639 4th Street Habitat for Humanity Coleman Park",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [
      "Broadway"
    ],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/west-palm-beach-sets-two-coleman-park-lots-on-habitats-path-2026-08-03-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach CRA agenda, August 3 2026",
        "url": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-cra-agendas/08_03_26_final-cra-agenda.pdf",
        "type": "official agenda"
      },
      {
        "label": "Habitat for Humanity of Greater Palm Beach County homeownership packet, July 2026",
        "url": "https://habitatgreaterpbc.org/wp-content/uploads/2026/07/2026-Application_Final_English.pdf",
        "type": "official homeownership packet"
      },
      {
        "label": "WLRN: West Palm Beach to vote on land transfer that could shape future of Coleman Park",
        "url": "https://www.wlrn.org/development/2026-05-26/coleman-park-west-palm-beach-vote",
        "type": "local coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "broadway-currie-park-zoning-2026-07-06",
    "slug": "broadway-currie-park-zoning-2026-07-06",
    "title": "West Palm Beach rewrites Broadway and Currie Park rules",
    "sourceName": "City of West Palm Beach City Commission Agenda",
    "sourceUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-pass-fail-agendas-pfa/2026-07-jul-pfa/pf-07_06_26_city-commission-agenda.pdf",
    "canonicalUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-pass-fail-agendas-pfa/2026-07-jul-pfa/pf-07_06_26_city-commission-agenda.pdf",
    "sourceTitle": "West Palm Beach rewrites Broadway and Currie Park rules",
    "publishedAt": "2026-07-30T13:24:35.743Z",
    "sourcePublishedAt": "2026-07-06",
    "sourcePublishedDate": "2026-07-06",
    "eventDate": "2026-07-06",
    "dateDiscovered": "2026-07-30",
    "freshnessLane": "recent_30d",
    "fetchedAt": "2026-07-30T13:26:41.241Z",
    "deck": "The city approved a zoning text amendment that trims Broadway townhouse friction and reshapes the Currie Park height bonus while downtown planning politics stay heated.",
    "description": "West Palm Beach approved Ordinance 5173-26, clarifying townhouse rules in the Broadway Mixed-Use District and changing how Currie Park improvements can support future height bonuses.",
    "summary": "West Palm Beach is changing two small but consequential pieces of its development code: Broadway townhouse language and the Currie Park height bonus.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "West Palm Beach used its July 6 commission meeting to make two development-code adjustments that are easy to miss if you only watch the big project headlines. Ordinance 5173-26 was approved after second reading, and it does two things at once: it clears up townhouse language in the Broadway Mixed-Use District and changes how the city wants to handle height bonuses tied to Currie Park improvements.\n\nThat is not a flashy ribbon-cutting item. It is more useful than that. This is the kind of code work that tells you where the city is still smoothing friction, where it wants future projects to fit, and how it is thinking about public-realm upgrades as redevelopment tools rather than side effects."
      },
      {
        "heading": "Broadway gets a cleaner lane",
        "body": "On Broadway, the amendment clarifies that mid-block setbacks are not required for townhouse projects and allows steps or ramps in the frontage area as long as a clear pedestrian path stays open. That is a narrow change, but narrow changes matter when the city is trying to make townhouse product easier to build without turning the corridor into a free-for-all.\n\nThe practical effect is less uncertainty for designers and applicants. A project can still move a person through the frontage zone, but it does not have to treat every piece of grade change or stoop detail as a zoning problem. For a district that is still trying to balance neighborhood scale with redevelopment pressure, that sort of clarity is worth more than a broader slogan about walkability."
      },
      {
        "heading": "Currie Park's bonus changes shape",
        "body": "Currie Park is the other half of the ordinance, and here the city is making a more strategic adjustment. Under the existing rule, developers could receive additional height in exchange for approved Currie Park improvements or payments tied to the park. Staff said the park redesign is now complete and construction is underway, so the city wants more flexibility to use future contributions for operations, management and programming after the buildout.\n\nThat shifts the incentive from a pure capital-reimbursement model toward a more mature public-space model. The city is signaling that Currie Park is no longer just a construction site with a future promise. It is becoming an ongoing civic asset that may need operating support, event programming, and stewardship as much as one-time capital dollars."
      },
      {
        "heading": "Why the timing matters",
        "body": "The July 6 meeting was already tense around downtown growth. In the same session, Mayor Keith James announced a resident partnership initiative around the Downtown Master Plan Update, and the city described a pause in that broader planning process. Residents have been pushing for a larger role in how downtown changes, while developers still need clear rules if they are going to keep bringing projects forward.\n\nSeen against that backdrop, Ordinance 5173-26 reads like a city trying to separate corridor-level code fixes from the larger politics of downtown development. Broadway gets a cleaner rulebook. Currie Park gets a more flexible incentive structure. The downtown conversation stays loud, but the machinery of development keeps moving in smaller, more precise ways."
      },
      {
        "heading": "What to watch next",
        "body": "The next question is whether these changes show up in actual applications or just in cleaner code language. Broadway's townhouse language may give future applicants less to fight over at the front door. Currie Park's revised bonus may matter more if the city uses it to steer future funding, programming, or maintenance expectations around the park.\n\nFor now, the important point is simple: West Palm Beach is still editing the rules that shape development, not just the projects. That can change where a building lands, how it meets the street, and how a public space is expected to function after the ribbon cutting."
      }
    ],
    "whyItMatters": "The city is not just debating downtown in the abstract. It is still revising the rules that shape where townhomes can fit, how public-realm improvements are rewarded, and how much flexibility the next round of projects gets on Broadway and Currie Park.",
    "buyerContext": "For buyers and owners watching West Palm Beach's growth corridors, this is another reminder that the city is still tuning the code around live neighborhoods, public-space upgrades, and future redevelopment leverage. The details matter because they can change project form, timing, and the way a corridor feels on the ground.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [
      "Broadway Corridor",
      "Currie Park",
      "Downtown West Palm Beach"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [
      "currie-park-waterfront-restaurant-west-palm-beach-2026-06-10"
    ],
    "newsletterHeadline": "West Palm Beach rewrites Broadway and Currie Park rules",
    "newsletterBlurb": "The city approved a zoning text amendment that trims Broadway townhouse friction and reshapes the Currie Park height bonus while downtown planning politics stay heated.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach Broadway Mixed-Use District Currie Park zoning text amendment July 2026",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/broadway-currie-park-zoning-2026-07-06-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach City Commission Agenda, July 6 2026",
        "url": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-pass-fail-agendas-pfa/2026-07-jul-pfa/pf-07_06_26_city-commission-agenda.pdf",
        "type": "official city agenda"
      },
      {
        "label": "City of West Palm Beach: Mayor, City Commission, CRA Approvals and Decisions from July 6, 2026",
        "url": "https://www.wpb.org/News-Folder/News-2026/070726-Mayor-City-Commission-CRA-Approvals-and-Decisions",
        "type": "official city release"
      },
      {
        "label": "Boca Post: West Palm Beach Approves $18M More For Police Building Repairs",
        "url": "https://bocapost.com/west-palm-beach-news/west-palm-beach-police-building-repairs-fire-assessment/",
        "type": "independent local coverage"
      },
      {
        "label": "WFLX: West Palm Beach residents push for transparency as downtown redevelopment debate intensifies",
        "url": "https://www.wflx.com/2026/07/09/west-palm-beach-residents-push-transparency-downtown-redevelopment-debate-intensifies/",
        "type": "independent local coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "berkeley-breaks-ground-clear-lake-edge-2026-07-23",
    "slug": "berkeley-breaks-ground-clear-lake-edge-2026-07-23",
    "title": "The Berkeley breaks ground on West Palm Beach's Clear Lake edge",
    "sourceName": "The Berkeley Palm Beach",
    "sourceUrl": "https://www.theberkeleypalmbeach.com/berkeley-25-story-condo-breaks-ground-starts-sales-on-west-palms-other-waterfront/",
    "canonicalUrl": "https://www.theberkeleypalmbeach.com/berkeley-25-story-condo-breaks-ground-starts-sales-on-west-palms-other-waterfront/",
    "sourceTitle": "The Berkeley breaks ground on West Palm Beach's Clear Lake edge",
    "publishedAt": "2026-07-23T13:22:13.926Z",
    "sourcePublishedAt": "2026-07-06",
    "sourcePublishedDate": "2026-07-06",
    "eventDate": "2026-07-06",
    "dateDiscovered": "2026-07-23",
    "freshnessLane": "recent_30d",
    "fetchedAt": "2026-07-23T13:23:04.519Z",
    "deck": "The 25-story, 193-unit tower is now under construction at 550 South Australian Avenue, extending downtown's luxury map west of the Intracoastal and showing where full-time buyer demand is still landing.",
    "description": "Construction has started on The Berkeley Palm Beach at 550 South Australian Avenue, a 25-story, 193-unit tower on Clear Lake that is already more than $120 million sold.",
    "summary": "The Berkeley's breakground pushes West Palm Beach luxury west of the Intracoastal and adds another live data point for buyers comparing downtown product.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "The Berkeley Palm Beach is no longer just a sales story. Construction is now underway at 550 South Australian Avenue, and the project team says the 25-story tower has already surpassed $120 million in total sales, including more than $40 million since April. That is the shift that matters: the project has moved from marketing phase to live construction while still absorbing buyers at a meaningful pace.\n\nThe tower is planned for 193 residences and is expected to finish in 2029. In a city where the luxury stack keeps widening, that makes The Berkeley one of the more important west-side data points to watch because it is not a speculative site anymore. It is now a building with a schedule, a sales pace, and a visible footprint."
      },
      {
        "heading": "Why this site matters",
        "body": "The Berkeley sits on the Clear Lake edge, west of the Intracoastal and just outside the traditional South Flagler waterfront lane. That placement changes the story. This is not a mirror image of the city's east-side luxury towers. It is a different kind of address, one that trades pure ocean-facing prestige for a broader mix of water views, downtown access, and proximity to the city's business and healthcare growth.\n\nThe project page says homes above the 15th floor are expected to capture both west-facing Clear Lake views and east-facing views toward the Intracoastal and Atlantic. That dual-water setup is a rare selling point in West Palm Beach, and it helps explain why the project has already found buyers before the structure is far along."
      },
      {
        "heading": "What the sales pace signals",
        "body": "The early sales number matters because it shows where demand is still willing to move before delivery. A tower that is already past $120 million sold, with more than $40 million added since April, is not just filling in the margins. It is telling you that well-located for-sale product in West Palm Beach still has room to clear when the layout, view mix, and service model line up.\n\nThat does not mean every buyer should chase the headline. It does mean the market still rewards a clear point of view. The Berkeley is not trying to be the same thing as every other luxury condo in town. It is leaning into a west-of-downtown position, larger residences, and a broader urban-access pitch. Buyers either want that combination or they do not."
      },
      {
        "heading": "How it fits the city now",
        "body": "West Palm Beach has been building a more layered luxury market, and The Berkeley adds another layer on the west side of downtown. The project sits close enough to the core to benefit from CityPlace, Clematis, employment growth, and the city's expanding institutional footprint, but it does not depend on the same east-edge waterfront logic that has defined so much of the recent pipeline.\n\nThat distinction matters for the city as a whole. A market with multiple premium zones is more resilient than one that relies on a single strip. If the west side of downtown keeps absorbing high-end product, it broadens the map for future developers and gives buyers another way to stay inside West Palm Beach without paying for the same view corridor every time."
      },
      {
        "heading": "What to watch next",
        "body": "The next checkpoint is simple: whether the current sales momentum holds as construction advances. Early interest can fade if pricing, fees, or floorplan selection stop lining up with buyer expectations. It can also deepen if the project keeps proving that the Clear Lake edge is a distinct luxury address rather than a secondary option.\n\nWatch the pace of new contracts, the remaining pricing ladder, and whether the project keeps pulling buyers who want downtown convenience without the standard east-waterfront tradeoffs. If that demand stays intact, The Berkeley will be more than another tower start. It will be another sign that West Palm Beach luxury is spreading outward, not just upward."
      }
    ],
    "whyItMatters": "The Berkeley pushes West Palm Beach's luxury condo map west of the Intracoastal and onto the Clear Lake edge, where a different kind of waterfront premium is taking shape. The early sales total also shows the market is still willing to commit to well-positioned for-sale product before completion.",
    "buyerContext": "For buyers comparing West Palm Beach's luxury stack, The Berkeley shows that west-of-Intracoastal addresses can still command premium pricing when they pair views, floorplan size, and downtown convenience.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [
      "The Berkeley Palm Beach"
    ],
    "relatedNeighborhoods": [
      "Downtown West Palm Beach"
    ],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "The Berkeley breaks ground on Clear Lake edge",
    "newsletterBlurb": "The 25-story, 193-unit tower is now under construction at 550 South Australian Avenue, extending downtown's luxury map west of the Intracoastal and showing where full-time buyer demand is still landing.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach The Berkeley Palm Beach groundbreaking July 2026 Clear Lake development",
    "category": "development",
    "relatedProjectIds": [
      "berkeley"
    ],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [
      "berkeley"
    ],
    "relatedCorridors": [],
    "primaryProjectSlug": "berkeley",
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/berkeley-breaks-ground-clear-lake-edge-2026-07-23-hero.jpg",
    "sourceLinks": [
      {
        "label": "The Berkeley Palm Beach: Berkeley 25-story condo breaks ground, starts sales on West Palm's other waterfront",
        "url": "https://www.theberkeleypalmbeach.com/berkeley-25-story-condo-breaks-ground-starts-sales-on-west-palms-other-waterfront/",
        "type": "official project source"
      },
      {
        "label": "PRNewswire-PRWeb: The Berkeley Palm Beach Breaks Ground in West Palm Beach",
        "url": "https://www.prweb.com/releases/the-berkeley-palm-beach-breaks-ground-in-west-palm-beach-302817309.html",
        "type": "official press release"
      },
      {
        "label": "Florida YIMBY: The Berkeley Palm Beach Breaks Ground At 550 South Australian Avenue In West Palm Beach",
        "url": "https://floridayimby.com/2026/07/the-berkeley-palm-beach-breaks-ground-at-550-south-australian-avenue-in-west-palm-beach.html",
        "type": "independent local coverage"
      },
      {
        "label": "Markets of Tomorrow: The Berkeley officially breaks ground in West Palm Beach",
        "url": "https://www.oftmw.com/post/the-berkeley-palm-beach-breaks-ground-on-its-25-story-clear-lake-tower/",
        "type": "independent local coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "alida-breaks-ground-beside-brightline-downtown-west-palm-beach-2026-07-20",
    "slug": "alida-breaks-ground-beside-brightline-downtown-west-palm-beach-2026-07-20",
    "title": "Alida breaks ground beside Brightline in downtown West Palm Beach",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://experience.arcgis.com/experience/874aaf576de9400499141ec424802dde/page/Under-Construction",
    "canonicalUrl": "https://experience.arcgis.com/experience/874aaf576de9400499141ec424802dde/page/Under-Construction",
    "sourceTitle": "Alida breaks ground beside Brightline in downtown West Palm Beach",
    "publishedAt": "2026-07-20T14:21:06.119Z",
    "sourcePublishedAt": "2026-07-20",
    "sourcePublishedDate": "2026-07-20",
    "eventDate": "2026-07-17",
    "dateDiscovered": "2026-07-20",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-07-20T14:21:06.119Z",
    "deck": "After years of assemblage, rezoning, a pandemic pause and a redesign, the Datura Street site has moved from paper to construction on one of downtown's most watched blocks.",
    "description": "Construction has started at 506 Datura Street, where Alida Residences and a Tribute Portfolio hotel are rising beside the Brightline station in downtown West Palm Beach.",
    "summary": "A long-delayed Datura Street project has moved into construction, adding another rail-adjacent mixed-use block to downtown West Palm Beach.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "The Datura Street site is no longer just another downtown plan on a board. The city now lists Datura Hotel & Residences under construction, and local coverage says the project broke ground on July 17 beside the Brightline station. That is the real change: a long-studied transit-adjacent block has finally shifted into the building phase.\n\nFor downtown West Palm Beach, the significance is less about ceremony than momentum. Sites this close to the station tend to carry outsized importance because they sit at the overlap of rail access, office traffic, restaurant activity, and the daily habits that make a district feel full rather than merely tall."
      },
      {
        "heading": "What is actually new",
        "body": "The project at 506 Datura Street is being built as a residential building and a separate hotel rather than one wrapped hybrid tower. That split matters. It lets each use work on its own terms instead of forcing apartments and hotel operations into a single stack.\n\nThat kind of program mix usually tells you something about the site itself. The best transit-edge parcels are the ones that can do more than one job: house residents, absorb visitors, and still hold their ground on the street. This block is being asked to do all three."
      },
      {
        "heading": "Why this block matters",
        "body": "The site sits in the narrow band between the Brightline station and the rest of downtown, which makes it one of the most visible pieces of infill in the city. It is close enough to the platform to matter for people arriving by train, and close enough to CityPlace and Clematis Street to feed off the evening economy.\n\nThat is why a project like this reads as more than another luxury announcement. It adds weight to the corridor that already carries the city's strongest downtown arguments: transit, walkability, and a steady buildup of daytime and nighttime use."
      },
      {
        "heading": "Why the delay matters",
        "body": "This was not a quick-hit project. LD&D's project page dates the acquisition to early 2022, and the city filings around the site point to a longer path that included assemblage, rezoning, a pandemic pause and redesign. That slow burn matters because it shows how much friction still sits between a good piece of land and a project that can actually start.\n\nThe point is not that every delay is good. It is that a project that survives that much friction is usually tied to a corridor with real staying power. West Palm Beach did not get here by accident; it got here because the station district kept proving it could support more density."
      },
      {
        "heading": "What to watch next",
        "body": "The next question is not whether the ground has been broken. It has. The question is whether this start becomes part of a broader pattern around the station or remains a single heavy lift on a difficult parcel.\n\nIf more rail-adjacent sites keep moving, downtown's next chapter will look less like a handful of isolated towers and more like a connected urban fabric. That is the real test for West Palm Beach now, and Datura Street is one of the first places to watch."
      }
    ],
    "whyItMatters": "This is one of the clearer signs that the Brightline edge of downtown still has real development gravity. The project took years to assemble and rework, but it is now moving, which matters because every successful start along Datura Street makes the station area feel less speculative and more complete.",
    "buyerContext": "For buyers, the signal is not the brand name alone. It is the fact that downtown's rail-adjacent supply is still growing, but slowly enough that well-located blocks near transit, CityPlace, and Clematis keep their edge. That usually keeps the best-connected product in a tighter lane than the broader market around it.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Development Watch: Alida finally breaks ground",
    "newsletterBlurb": "After years of assemblage, rezoning, a pandemic pause and a redesign, the Datura Street site has moved from paper to construction on one of downtown's most watched blocks.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach Datura Street Alida groundbreaking July 2026 Brightline station development",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/alida-breaks-ground-beside-brightline-downtown-west-palm-beach-2026-07-20-hero.jpg",
    "sourceLinks": [
      {
        "label": "City of West Palm Beach: Under Construction | Citywide Planning Projects",
        "url": "https://experience.arcgis.com/experience/874aaf576de9400499141ec424802dde/page/Under-Construction",
        "type": "official city source"
      },
      {
        "label": "LD&D: Datura Hotel & Residences",
        "url": "https://ldnd.com/projects/datura-hotel-residences/",
        "type": "official project source"
      },
      {
        "label": "Florida YIMBY: Construction Begins on Alida Residences and Tribute Portfolio by Marriott Hotel in Downtown West Palm Beach",
        "url": "https://floridayimby.com/2026/07/construction-begins-on-alida-residences-and-tribute-portfolio-by-marriott-hotel-in-downtown-west-palm-beach.html",
        "type": "independent local coverage"
      },
      {
        "label": "CBS12: West Palm Beach rides next wave of growth with new luxury tower beside Brightline station",
        "url": "https://cbs12.com/news/local/west-palm-beach-rides-next-wave-of-growth-with-new-luxury-tower-alida-residences-marriott-brightline-station-west-palm-beach-development-west-palm-beach-luxury-apartments-brightline-station-brightline-west-palm-beach-ldd-igeq-frontrange-capital-partners",
        "type": "independent local coverage"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "west-palm-beach-waterfront-development-freeze-2026-07-19",
    "slug": "west-palm-beach-waterfront-development-freeze-2026-07-19",
    "title": "West Palm Beach Moves to Freeze Waterfront Development Applications for Six Months",
    "sourceName": "City of West Palm Beach",
    "sourceUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-city-commission-agendas/07-jul-2026-final-cca/07_20_26_fnal-city-commission-agenda.pdf",
    "canonicalUrl": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-city-commission-agendas/07-jul-2026-final-cca/07_20_26_fnal-city-commission-agenda.pdf",
    "sourceTitle": "City Commission Agenda, July 20, 2026",
    "publishedAt": "2026-07-19T03:42:04.222Z",
    "sourcePublishedAt": "2026-07-19",
    "sourcePublishedDate": "2026-07-19",
    "eventDate": "2026-07-19",
    "dateDiscovered": "2026-07-19",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-07-19T03:44:26.827Z",
    "deck": "The city has moved a South Flagler waterfront zoning pause into the final hearing process, creating a six-month window to study whether the corridor needs new rules before more planned development applications land.",
    "description": "West Palm Beach has moved a six-month waterfront zoning pause into the final hearing process for the South Flagler corridor, signaling a deliberate reset before more planned development applications move forward.",
    "summary": "West Palm Beach is moving toward a six-month freeze on new planned development applications in a South Flagler waterfront zone while it studies whether the corridor needs new zoning rules.",
    "bodySections": [
      {
        "heading": "The city is moving a waterfront freeze into the final hearing stage",
        "body": "West Palm Beach has pushed a six-month zoning pause for a defined stretch of its South Flagler waterfront into the final hearing process, a step that could slow new planned development applications in one of the city's most closely watched corridors.\n\nThe ordinance targets properties south of Monroe Drive, north of Southern Boulevard, west of Flagler Drive and east of Washington Road. In practical terms, it is a temporary stop on new planned development filings while the city studies whether the waterfront district needs a different zoning framework."
      },
      {
        "heading": "What the ordinance would actually do",
        "body": "The city said the measure would create a six-month zoning in progress for multifamily high-density land in the area. The goal is not to freeze every project already on the map. It is to keep additional planned development applications from entering the pipeline while the city hires Zyscovich to complete a zoning and economic analysis and recommend possible code changes.\n\nThe City of West Palm Beach's July 6 summary says commissioners approved the ordinance on first reading after a public hearing. The Real Deal reported that a second reading vote is scheduled for July 20, which means the pause is still moving through the city's process rather than sitting as a finished policy."
      },
      {
        "heading": "Why the waterfront is getting this kind of attention",
        "body": "West Palm Beach has spent years absorbing a heavy wave of downtown and waterfront development. That has brought towers, land assemblies, condo proposals, and repeated debates over scale and neighborhood character.\n\nA zoning pause is a blunt tool, but it is also a revealing one. When a city uses it, the message is usually that the existing rules are no longer seen as enough to manage the next round of growth. In this case, the waterfront edge is being asked to wait while the city studies the problem more deliberately."
      },
      {
        "heading": "What this means for developers and buyers",
        "body": "For developers, the immediate effect is simple: the filing path gets narrower in the targeted zone. For buyers watching the market, the larger signal is that West Palm Beach is not treating the South Flagler waterfront as a place where density can keep rising without another look at the rules.\n\nThat matters because waterfront supply, even when it is still only proposed, shapes expectations. If more projects are paused or slowed, existing luxury towers, branded residences, and nearby redevelopment sites can look even more scarce by comparison."
      },
      {
        "heading": "What to watch next",
        "body": "The next checkpoint is the July 20 second reading. If commissioners approve the ordinance, the pause would run for six months unless the city extends it.\n\nThe deeper question is what comes after the pause. A zoning study can lead to smaller technical edits, or it can become the opening move in a broader rewrite of how the city wants its waterfront to grow. Either way, the current vote shows West Palm Beach is no longer letting the corridor expand on autopilot."
      },
      {
        "heading": "The bottom line",
        "body": "This is not a construction story in the usual sense. It is a timing story, and timing changes the market.\n\nWest Palm Beach is telling the waterfront to wait while it redraws the rules. For a corridor that has become one of the city's most visible growth frontiers, that pause may matter as much as any new tower announcement."
      }
    ],
    "whyItMatters": "The pause would slow the next wave of waterfront filings in one of the city's most watched development corridors. For buyers and developers, it is a sign that West Palm Beach wants to test the limits of the district before more density is added.",
    "buyerContext": "",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "West Palm Beach moves to freeze waterfront applications",
    "newsletterBlurb": "The city has moved a six-month South Flagler zoning pause toward final vote while it studies whether the waterfront corridor needs new rules.",
    "newsletterCta": "Read the article",
    "query": "West Palm Beach waterfront development freeze six months South Flagler July 2026",
    "category": "development",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/west-palm-beach-waterfront-development-freeze-2026-07-19-hero.jpg",
    "sourceLinks": [
      {
        "label": "City Commission Agenda, July 20, 2026",
        "url": "https://www.wpb.org/files/assets/city/v/1/city-clerk/documents/agendas/2026-agendas/2026-final-city-commission-agendas/07-jul-2026-final-cca/07_20_26_fnal-city-commission-agenda.pdf",
        "type": "news"
      },
      {
        "label": "Moratorium on waterfront project applications in downtown West Palm heads to final vote",
        "url": "https://therealdeal.com/miami/2026/07/15/west-palm-beach-development-moratorium-heads-to-final-vote/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
  {
    "id": "project-tango-july-15-zoning-decision-2026-2026-07-13",
    "slug": "project-tango-july-15-zoning-decision-2026-2026-07-13",
    "title": "Project Tango heads to a July 15 decision as Palm Beach County weighs a larger AI campus",
    "sourceName": "Palm Beach County Zoning Division",
    "sourceUrl": "https://discover.pbc.gov/pzb/zoning/Pages/Project_Tango.aspx",
    "canonicalUrl": "https://discover.pbc.gov/pzb/zoning/Pages/Project_Tango.aspx",
    "sourceTitle": "Project Tango (Central Park Commerce Center)",
    "publishedAt": "2026-07-13T13:31:31.981Z",
    "sourcePublishedAt": "2026-07-08",
    "sourcePublishedDate": "2026-07-08",
    "eventDate": "2026-07-15",
    "dateDiscovered": "2026-07-13",
    "freshnessLane": "breaking_14d",
    "fetchedAt": "2026-07-13T13:31:31.981Z",
    "deck": "The proposed Central Park Commerce Center expansion is facing a zoning denial recommendation as the county moves toward new rules for large-scale AI data centers.",
    "description": "Project Tango heads to a July 15 Palm Beach County decision after a zoning denial recommendation and a new freeze on future large-scale AI data-center applications.",
    "summary": "Project Tango heads to a July 15 Palm Beach County decision after a zoning denial recommendation and a new freeze on future large-scale AI data-center applications.",
    "bodySections": [
      {
        "heading": "What changed",
        "body": "Project Tango is heading into a consequential July 15 hearing with the Palm Beach County Commission after the county's Planning and Zoning Commission recommended denial of the proposed AI data-center campus. The project is planned within the Central Park Commerce Center in the western county, near the Arden community and Saddle View Elementary School.\n\nThe recommendation does not end the application. County commissioners will make the final land-use decision, and the project now arrives with two competing signals: county planning staff have recommended approval with changes, while the zoning board has recommended denial after a lengthy public hearing."
      },
      {
        "heading": "The plan before the county",
        "body": "Palm Beach County records describe a 202.67-acre site on the north side of Southern Boulevard, west of the L-8 Canal and about 3.4 miles west of Seminole Pratt Whitney Road. The currently approved Central Park Commerce Center plan includes two 100,000-square-foot data-center buildings, a 1.2 million-square-foot warehouse, and a smaller office component.\n\nThe preliminary site plan tied to the larger request shows three phases totaling 3,594,564 square feet. It combines warehouse space with data-information-processing buildings, offices, and utility buildings. That scale is central to the debate: the application is an expansion and reconfiguration of an already approved commerce-center framework, but the proposed mix would materially increase the data-center component and change the character of the site."
      },
      {
        "heading": "Why the zoning board said no",
        "body": "The July 2 zoning hearing turned on more than the project's size. Board members questioned whether a hyperscale AI data center belongs within the county's light-industrial and data-information-processing categories, or whether its power, cooling, noise, and other operating impacts make it a heavy-industrial use.\n\nThe proposed campus would sit about 1,100 feet from Arden and Saddle View Elementary School, according to WFLX. The board's denial recommendation followed a public hearing that drew more than 100 attendees and more than 40 speakers, with concerns focused on the project's proximity to homes and a school as well as its infrastructure demands."
      },
      {
        "heading": "A separate county response",
        "body": "The county has also started writing a broader policy response. On July 7, commissioners directed staff to draft a moratorium ordinance for new large-scale AI data centers and imposed an immediate zoning-in-progress freeze on new applications. The freeze passed 5-2, according to Boca Post.\n\nThat action does not stop Project Tango. The existing application remains scheduled under the rules already in place, which is why the July 15 decision carries more weight than a routine zoning vote. The county is trying to decide this project while also deciding how future projects of the same type should be reviewed."
      },
      {
        "heading": "What happens next",
        "body": "The Board of County Commissioners is scheduled to hear Project Tango on Wednesday, July 15, at 9:30 a.m. at the county government center on North Olive Avenue in West Palm Beach. The county's project page lists the application as the only item scheduled for that zoning hearing and notes that interested speakers may receive limited time if turnout exceeds 20 people.\n\nThe immediate question is whether commissioners approve the requested changes, deny them, or require a different path. The larger question is whether Palm Beach County treats hyperscale AI facilities as a conventional extension of a commerce center or as a land-use category that needs a new set of standards."
      }
    ],
    "whyItMatters": "Project Tango puts a major western Palm Beach County land-use decision in front of commissioners while the county is also writing new rules for future large-scale AI data centers.",
    "buyerContext": "This is a western-county infrastructure and land-use story, not a downtown or waterfront housing project. It matters to buyers tracking major employment, utility, traffic, and development decisions around the outer West Palm Beach market.",
    "buyerTakeaway": "",
    "marketSignal": "",
    "bestFor": "",
    "watchPoints": "",
    "buyerQuestions": "",
    "relatedBuildings": [],
    "relatedNeighborhoods": [],
    "relatedCorridor": "",
    "relatedArticleIds": [],
    "newsletterHeadline": "Project Tango faces a July 15 county decision",
    "newsletterBlurb": "A zoning denial recommendation and a new AI data-center freeze set up a consequential Palm Beach County hearing.",
    "newsletterCta": "Read the Development Watch",
    "query": "West Palm Beach development permit site plan zoning; Project Tango",
    "category": "planning",
    "relatedProjectIds": [],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [],
    "relatedCorridors": [],
    "corridorLabel": "West Palm Beach",
    "imagePath": "/assets/editorial/project-tango-july-15-zoning-decision-2026-2026-07-13-hero.jpg",
    "sourceLinks": [
      {
        "label": "Palm Beach County Zoning Division project page",
        "url": "https://discover.pbc.gov/pzb/zoning/Pages/Project_Tango.aspx",
        "type": "official"
      },
      {
        "label": "WFLX: zoning commission recommends denial",
        "url": "https://www.wflx.com/2026/07/02/palm-beach-county-zoning-commission-recommends-denial-controversial-data-center-near-arden/",
        "type": "news"
      },
      {
        "label": "Boca Post: county advances AI data-center moratorium",
        "url": "https://bocapost.com/palm-beach-county-news/palm-beach-county-ai-data-center-moratorium-project-tango/",
        "type": "news"
      }
    ],
    "paywallStatus": "free",
    "status": "published",
    "riskLevel": "medium"
  },
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
    "relatedProjectIds": [
      "the-sound-west-palm-beach"
    ],
    "relatedCorridorIds": [],
    "relatedProjectSlugs": [
      "the-sound-west-palm-beach"
    ],
    "relatedCorridors": [],
    "corridorLabel": "South End / South Dixie",
    "primaryProjectSlug": "the-sound-west-palm-beach",
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
