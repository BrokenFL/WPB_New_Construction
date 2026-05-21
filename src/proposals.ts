export type ProjectAsset = {
  label: string;
  url: string;
  type: "Floor plan" | "Brochure" | "Fact sheet" | "Gallery" | "Website" | "Download";
  note?: string;
};

export type ProposalBuilding = {
  id: string;
  name: string;
  status: "Concept" | "Planning" | "Entitled" | "Under Construction";
  description: string;
  address: string;
  longitude: number;
  latitude: number;
  widthMeters: number;
  depthMeters: number;
  heightMeters: number;
  headingDegrees: number;
  floors: number;
  year: number;
  color: string;
  confidence: "High" | "Medium" | "Low";
  sourceUrls: string[];
  assetLinks?: ProjectAsset[];
  modelingNote?: string;
  customFootprintMeters?: Array<[number, number]>;
  podiumBox?: {
    widthMeters: number;
    depthMeters: number;
    heightMeters: number;
    offsetEastMeters?: number;
    offsetNorthMeters?: number;
  };
  modelUri?: string;
  modelScale?: number;
  modelHeightOffsetMeters?: number;
};

export type CameraView = {
  id: string;
  label: string;
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll?: number;
};

export type ProposalScenario = {
  id: string;
  name: string;
  market: string;
  description: string;
  center: {
    longitude: number;
    latitude: number;
    height: number;
  };
  camera: CameraView[];
  buildings: ProposalBuilding[];
};

export const proposalScenarios: ProposalScenario[] = [
  {
    id: "north-flagler-pipeline",
    name: "North Flagler Pipeline",
    market: "West Palm Beach, Florida",
    description:
      "A researched skyline study built around major North Flagler projects now shaping West Palm Beach's next waterfront profile: Ritz-Carlton Residences, Shorecrest, Olara, Alba Palm Beach, Apogee, and Mandarin Oriental Residences.",
    center: {
      longitude: -80.0507,
      latitude: 26.7344,
      height: 1100,
    },
    camera: [
      {
        id: "intracoastal",
        label: "Intracoastal",
        longitude: -80.0455,
        latitude: 26.7358,
        height: 360,
        heading: 255,
        pitch: -10,
      },
      {
        id: "southbound",
        label: "Southbound",
        longitude: -80.0508,
        latitude: 26.7216,
        height: 240,
        heading: 8,
        pitch: -7,
      },
      {
        id: "northbound",
        label: "Northbound",
        longitude: -80.0512,
        latitude: 26.7488,
        height: 230,
        heading: 188,
        pitch: -7,
      },
      {
        id: "corridor",
        label: "Full Corridor",
        longitude: -80.0478,
        latitude: 26.7417,
        height: 760,
        heading: 228,
        pitch: -17,
      },
    ],
    buildings: [
      {
        id: "ritz-carlton-wpb",
        name: "Ritz-Carlton Residences",
        status: "Under Construction",
        description:
          "Related Group and BH Group's branded condo tower on Flagler Drive. Official project materials list 138 residences at 1717 North Flagler, and March 2026 financing coverage described it as a 27-story tower.",
        address: "1717 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.05057,
        latitude: 26.72848,
        widthMeters: 47,
        depthMeters: 40,
        heightMeters: 101,
        headingDegrees: 113,
        floors: 27,
        year: 2028,
        color: "#ff7a59",
        confidence: "Medium",
        sourceUrls: [
          "https://relatedgroup.com/properties/the-ritz-carlton-residences-west-palm-beach/",
          "https://theresidenceswestpalmbeach.com/",
        ],
        assetLinks: [
          {
            label: "Official Floor Plans Index",
            url: "https://theresidenceswestpalmbeach.com/floorplans/",
            type: "Floor plan",
            note: "Official page listing two-, three-, four-bedroom and lake-home plans.",
          },
          {
            label: "Residence 01",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res01.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 02",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res02.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 03",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res03.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 04",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res04.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 05",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res05.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 06",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/05/Residence06.pdf",
            type: "Floor plan",
          },
          {
            label: "Lake Home 07",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res07.pdf",
            type: "Floor plan",
          },
          {
            label: "Lake Home 08",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res08.pdf",
            type: "Floor plan",
          },
          {
            label: "Lake Home 09",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res09.pdf",
            type: "Floor plan",
          },
          {
            label: "Lake Home 10",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res10.pdf",
            type: "Floor plan",
          },
          {
            label: "Lake Home 11",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res11.pdf",
            type: "Floor plan",
          },
          {
            label: "Lake Home 12",
            url: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res12.pdf",
            type: "Floor plan",
          },
        ],
        modelingNote:
          "This entry now uses the supplied Ritz-Carlton .glb as the primary visualization asset. The imported scene appears to include more than just the tower, so the current placement uses a conservative first-pass scale, orientation, and elevation that will likely need one or two visual nudges in the live map.",
        modelUri: "/models/ritz-carlton.glb",
        modelScale: 0.37,
        modelHeightOffsetMeters: 10,
      },
      {
        id: "shorecrest",
        name: "Shorecrest",
        status: "Under Construction",
        description:
          "Related Ross secured construction financing on February 18, 2026 for Shorecrest at 1865 North Flagler Drive. The developer says it will rise 28 stories with 98 residences and complete in 2027.",
        address: "1865 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.05012,
        latitude: 26.72985,
        widthMeters: 54,
        depthMeters: 40,
        heightMeters: 106,
        headingDegrees: 109,
        floors: 28,
        year: 2027,
        color: "#f4b942",
        confidence: "High",
        sourceUrls: [
          "https://www.relatedross.com/press-releases/2026-02-18/related-ross-secures-157-million-construction-loan-shorecrest-west-palm",
        ],
        assetLinks: [
          {
            label: "Official Floor Plans Index",
            url: "https://www.shorecrestwpb.com/floorplans",
            type: "Floor plan",
          },
          {
            label: "Residence 704 Floor Plan",
            url: "https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0704_floorplan.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 303 Floor Plan",
            url: "https://www.shorecrestwpb.com/sites/default/files/2025-07/1153_0303_floorplan.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 301 Floor Plan",
            url: "https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0301_floorplan.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 1602 Floor Plan",
            url: "https://www.shorecrestwpb.com/sites/default/files/2026-03/1153_%201602_floorplan.pdf",
            type: "Floor plan",
          },
          {
            label: "Official Brochure",
            url: "https://www.shorecrestwpb.com/sites/g/files/ujywhv436/files/2025-06/SHC_Rack%20Brochure_0625.pdf",
            type: "Brochure",
          },
          {
            label: "Fact Sheet",
            url: "https://www.shorecrestwpb.com/sites/g/files/ujywhv436/files/2026-02/Shorecrest%20West%20Palm%20Beach%20Fact%20Sheet.pdf",
            type: "Fact sheet",
          },
        ],
        modelingNote:
          "This entry now uses the supplied Shorecrest .glb as the primary visualization asset. Placement has been shifted east toward the waterfront road so it replaces the front existing building mass rather than sitting behind it. Scale and elevation are still being tuned from the imported model's overall site envelope.",
        modelUri: "/models/shorecrest.glb",
        modelScale: 0.38,
        modelHeightOffsetMeters: 20,
      },
      {
        id: "olara",
        name: "Olara",
        status: "Under Construction",
        description:
          "Olara's official site says the project is now under construction on Flagler Drive and its architecture page describes it as a 26-story design by Arquitectonica with nearly 80,000 square feet of amenities.",
        address: "1919 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.05010,
        latitude: 26.73070,
        widthMeters: 62,
        depthMeters: 44,
        heightMeters: 98,
        headingDegrees: -89,
        floors: 26,
        year: 2026,
        color: "#4bb3fd",
        confidence: "High",
        sourceUrls: [
          "https://www.olarawestpalmbeach.com/",
          "https://www.olarawestpalmbeach.com/architecture/",
        ],
        assetLinks: [
          {
            label: "Official Floor Plans Index",
            url: "https://www.olarawestpalmbeach.com/floor-plans",
            type: "Floor plan",
          },
          {
            label: "All Floor Plans",
            url: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Floor-Plans-All-March-2026.pdf",
            type: "Floor plan",
          },
          {
            label: "Brochure",
            url: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/RackBrochure_Digital_032026.pdf",
            type: "Brochure",
          },
          {
            label: "Amenities Brochure",
            url: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara_Amenities_DigitalBrochure_032026.pdf",
            type: "Brochure",
          },
          {
            label: "Fact Sheet",
            url: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Fact-Sheet-March-2026-2.pdf",
            type: "Fact sheet",
          },
          {
            label: "Download All Files",
            url: "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Downloads-1.zip",
            type: "Download",
          },
        ],
        modelingNote:
          "This entry now uses the supplied Olara .glb as the primary visualization asset. The initial scale and elevation are a first-pass fit based on the imported model bounds and will likely need final visual tuning in the placement controls.",
        modelUri: "/models/olara.glb",
        modelScale: 0.33,
        modelHeightOffsetMeters: 20,
      },
      {
        id: "rosewood",
        name: "Rosewood Residences WPB",
        status: "Planning",
        description:
          "Related Group and BH Group are pursuing a proposed Rosewood-branded condominium tower at 2001 North Flagler Drive. Current public materials support a 27-story, 90-residence plan pending city approvals; pricing, floorplans, builder, and delivery timing have not been announced.",
        address: "2001 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.05005,
        latitude: 26.73135,
        widthMeters: 45,
        depthMeters: 38,
        heightMeters: 93,
        headingDegrees: 110,
        floors: 27,
        year: 2029,
        color: "#b76e79",
        confidence: "Medium",
        sourceUrls: [
          "https://www.wpb.org/files/assets/city/v/1/development-services/documents/planning-board/2026-pb-agendas/pb-agenda-2026.5.19.pdf",
          "https://therealdeal.com/miami/2026/04/10/related-group-bh-group-plan-rosewood-west-palm-beach/",
          "https://floridayimby.com/2026/01/developers-propose-luxury-27-story-for-2001-n-flagler-dr-west-palm-beach-fl.html",
        ],
        assetLinks: [
          {
            label: "City Planning Board Agenda",
            url: "https://www.wpb.org/files/assets/city/v/1/development-services/documents/planning-board/2026-pb-agendas/pb-agenda-2026.5.19.pdf",
            type: "Fact sheet",
            note: "Municipal agenda source for planning status and 90-unit proposal; not buyer-facing sales collateral.",
          },
          {
            label: "Rosewood Branding Report",
            url: "https://therealdeal.com/miami/2026/04/10/related-group-bh-group-plan-rosewood-west-palm-beach/",
            type: "Website",
            note: "Reporting source; editorial images are not rights-clear for public site use.",
          },
        ],
        modelingNote:
          "Planning-stage marker based on public reporting and city agenda materials. Height, delivery year, and footprint are visualization assumptions until city approval documents or official launch materials provide final dimensions.",
      },
      {
        id: "mandarin-oriental",
        name: "Mandarin Oriental Residences",
        status: "Concept",
        description:
          "Mandarin Oriental and Great Gulf launched the project in March 2026. The official site lists 87 residences across 31 stories at 5400 North Flagler Drive, with anticipated opening in 2031.",
        address: "5400 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.0516,
        latitude: 26.7590,
        widthMeters: 48,
        depthMeters: 42,
        heightMeters: 122,
        headingDegrees: 0,
        floors: 31,
        year: 2031,
        color: "#8f7cff",
        confidence: "High",
        sourceUrls: [
          "https://mandarinorientalwestpalmbeach.com/",
        ],
        modelingNote:
          "Story count and address are official. Tower height is inferred from 31 stories because a confirmed roof elevation was not publicly exposed.",
      },
      {
        id: "alba-palm-beach",
        name: "Alba Palm Beach",
        status: "Under Construction",
        description:
          "Alba is not speculative anymore, but it is part of the new skyline composition. April 2025 coverage said the 22-story, 55-unit waterfront tower was topped out and targeting early 2026 delivery.",
        address: "4714 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.0510,
        latitude: 26.7526,
        widthMeters: 58,
        depthMeters: 39,
        heightMeters: 86,
        headingDegrees: 0,
        floors: 22,
        year: 2026,
        color: "#79c9a5",
        confidence: "Medium",
        sourceUrls: [
          "https://floridayimby.com/2025/04/alba-palm-beach-tops-out-at-4714-north-flagler-drive-in-west-palm-beach.html",
        ],
        modelingNote:
          "Included because it materially changes the corridor silhouette. Data here comes from coverage rather than an official sales site.",
      },
      {
        id: "apogee-wpb",
        name: "Apogee",
        status: "Planning",
        description:
          "Related Group and BH Group's second waterfront WPB tower remains in the planning pipeline on North Flagler. Recent condo-pipeline reporting describes Apogee as a 21-story, 39-unit project at 4906 North Flagler Drive.",
        address: "4906 N Flagler Dr, West Palm Beach, FL 33407",
        longitude: -80.0512,
        latitude: 26.7511,
        widthMeters: 36,
        depthMeters: 34,
        heightMeters: 82,
        headingDegrees: 0,
        floors: 21,
        year: 2029,
        color: "#b0a7ff",
        confidence: "Low",
        sourceUrls: [
          "https://therealdeal.com/miami/2025/11/18/related-group-bh-group-plan-apogee-condo-in-west-palm-beach/",
        ],
        modelingNote:
          "This is a planning-stage placeholder based on reporting. It should be treated as directional until a project site or city filing provides stronger geometry and height confirmation.",
      },
    ],
  },
  {
    id: "south-flagler-waterfront",
    name: "South Flagler Waterfront",
    market: "South Flagler Drive, West Palm Beach",
    description:
      "A skyline study for the southern waterfront corridor where South Flagler House and Edgeworth are establishing a new ultra-luxury twin-tower profile across from Palm Beach Island.",
    center: {
      longitude: -80.0511,
      latitude: 26.7009,
      height: 900,
    },
    camera: [
      {
        id: "island-view",
        label: "Island View",
        longitude: -80.0460,
        latitude: 26.7016,
        height: 290,
        heading: 260,
        pitch: -9,
      },
      {
        id: "southbound-flagler",
        label: "Southbound Flagler",
        longitude: -80.0514,
        latitude: 26.7068,
        height: 210,
        heading: 176,
        pitch: -7,
      },
      {
        id: "northbound-flagler",
        label: "Northbound Flagler",
        longitude: -80.0510,
        latitude: 26.6956,
        height: 220,
        heading: 6,
        pitch: -7,
      },
    ],
    buildings: [
      {
        id: "south-flagler-house-north",
        name: "South Flagler House North",
        status: "Under Construction",
        description:
          "South Flagler House's April 2025 fact sheet says the project consists of two limestone-clad buildings stretching 28 stories into the sky at 1355 South Flagler Drive. This box represents the north tower of that pair.",
        address: "1355 S Flagler Dr, West Palm Beach, FL 33401",
        longitude: -80.0511,
        latitude: 26.7015,
        widthMeters: 37,
        depthMeters: 35,
        heightMeters: 108,
        headingDegrees: 0,
        floors: 28,
        year: 2027,
        color: "#e9d8a6",
        confidence: "High",
        sourceUrls: [
          "https://www.southflaglerhouse.com/",
          "https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf",
        ],
        modelingNote:
          "The twin-tower split is deliberate because the official project material describes two 28-story buildings rather than one combined mass.",
      },
      {
        id: "south-flagler-house-south",
        name: "South Flagler House South",
        status: "Under Construction",
        description:
          "The second South Flagler House tower is modeled separately so the skyline reads as the twin-building composition shown in project materials rather than as a single bulked mass.",
        address: "1355 S Flagler Dr, West Palm Beach, FL 33401",
        longitude: -80.0511,
        latitude: 26.7007,
        widthMeters: 37,
        depthMeters: 35,
        heightMeters: 108,
        headingDegrees: 0,
        floors: 28,
        year: 2027,
        color: "#d4c38c",
        confidence: "High",
        sourceUrls: [
          "https://www.southflaglerhouse.com/",
          "https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf",
        ],
        modelingNote:
          "Paired with the north tower to preserve the official two-building composition.",
      },
      {
        id: "edgeworth-north",
        name: "Edgeworth North",
        status: "Planning",
        description:
          "Edgeworth's official launch site confirms the address at 1155 South Flagler Drive. Recent March 2026 reporting and design-team materials describe it as a two-tower, 28-story waterfront project due around 2029.",
        address: "1155 S Flagler Dr, West Palm Beach, FL 33401",
        longitude: -80.0514,
        latitude: 26.6996,
        widthMeters: 35,
        depthMeters: 34,
        heightMeters: 108,
        headingDegrees: 0,
        floors: 28,
        year: 2029,
        color: "#ffb36b",
        confidence: "Medium",
        sourceUrls: [
          "https://www.edgeworthwpb.com/",
          "https://mawd.co/projects/residential/edgeworth",
        ],
        modelingNote:
          "Address is official. Story count comes from recent coverage/design-team material and should be validated against a future fact sheet or city filing.",
      },
      {
        id: "edgeworth-south",
        name: "Edgeworth South",
        status: "Planning",
        description:
          "The second Edgeworth tower is split out to visualize the paired silhouette now planned for the South Flagler corridor.",
        address: "1155 S Flagler Dr, West Palm Beach, FL 33401",
        longitude: -80.0514,
        latitude: 26.6988,
        widthMeters: 35,
        depthMeters: 34,
        heightMeters: 108,
        headingDegrees: 0,
        floors: 28,
        year: 2029,
        color: "#ff8f5a",
        confidence: "Medium",
        sourceUrls: [
          "https://www.edgeworthwpb.com/",
          "https://mawd.co/projects/residential/edgeworth",
        ],
        modelingNote:
          "Modeled as the second tower in the planned pair; geometry remains an inferred placeholder.",
      },
    ],
  },
  {
    id: "downtown-residential-wave",
    name: "Downtown Residential Wave",
    market: "Downtown West Palm Beach",
    description:
      "A broader downtown build-out study covering the next residential and mixed-use additions around Lakeview, Hibiscus, Australian Avenue, and the NORA district.",
    center: {
      longitude: -80.0580,
      latitude: 26.7098,
      height: 900,
    },
    camera: [
      {
        id: "lakeview",
        label: "Lakeview",
        longitude: -80.0588,
        latitude: 26.7057,
        height: 170,
        heading: 28,
        pitch: -7,
      },
      {
        id: "hibiscus",
        label: "Hibiscus",
        longitude: -80.0549,
        latitude: 26.7070,
        height: 160,
        heading: 238,
        pitch: -6,
      },
      {
        id: "nora",
        label: "NORA",
        longitude: -80.0590,
        latitude: 26.7168,
        height: 190,
        heading: 123,
        pitch: -7,
      },
      {
        id: "downtown-full",
        label: "Downtown Full",
        longitude: -80.0530,
        latitude: 26.7145,
        height: 760,
        heading: 228,
        pitch: -18,
      },
    ],
    buildings: [
      {
        id: "mr-c",
        name: "Mr. C Hotel & Residences",
        status: "Under Construction",
        description:
          "Public materials for Mr. C at 320 Lakeview Avenue consistently describe a mixed hotel-and-residences tower with 146 residences and 110 hotel keys. Most 2025 and 2026 reporting calls it 27 stories, though some earlier 2023 coverage said 25.",
        address: "320 Lakeview Ave, West Palm Beach, FL 33401",
        longitude: -80.0578,
        latitude: 26.7060,
        widthMeters: 50,
        depthMeters: 36,
        heightMeters: 103,
        headingDegrees: 8,
        floors: 27,
        year: 2027,
        color: "#6ec1a5",
        confidence: "Medium",
        sourceUrls: [
          "https://www.mrcwpalmbeach.com/",
          "https://floridayimby.com/2025/08/terra-secures-285-million-construction-loan-and-breaks-ground-on-mr-c-hotel-residences-in-west-palm-beach.html",
        ],
        assetLinks: [
          {
            label: "Official Downloads",
            url: "https://www.mrcresidenceswpb.com/downloads/",
            type: "Download",
          },
          {
            label: "Fact Sheet",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC_FactSheet_Aug24_digi_1.pdf",
            type: "Fact sheet",
          },
          {
            label: "West Palm Beach Guide",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC-WPB-Guide-body-R13-Digital-Web.pdf",
            type: "Brochure",
          },
          {
            label: "Residence 01",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res01_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 01A",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res01A_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 02",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res02_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 02A",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res02A_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 03",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res03_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 04",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res04_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 05",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res05_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 06",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res06_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 07",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res07_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 08",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res08_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 10",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res10_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 11",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res11_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
          {
            label: "Residence 12",
            url: "https://www.mrcresidenceswpb.com/wp-content/uploads/MrCWPB_Res12_FloorPlan_Illustrated-1.pdf",
            type: "Floor plan",
          },
        ],
        modelingNote:
          "This entry now uses the supplied Mr. C .glb as the primary visualization asset. The imported model bounds are much tighter than the earlier North Flagler models, so the initial scale and elevation are set from the known 27-story target and should need only light visual tuning.",
        modelUri: "/models/mr-c.glb",
        modelScale: 2.7,
        modelHeightOffsetMeters: 52,
      },
      {
        id: "banyan-tree",
        name: "Banyan Tree Residences",
        status: "Planning",
        description:
          "The official Banyan Tree site identifies the project at 400 Hibiscus Street and says it will contain 88 exclusive corner residences. A March 12, 2026 city pre-application agenda described 400 Hibiscus as a proposed 25-story mixed-use high-rise, which is the planning figure used here.",
        address: "400 Hibiscus St, West Palm Beach, FL 33401",
        longitude: -80.0553,
        latitude: 26.7069,
        widthMeters: 44,
        depthMeters: 39,
        heightMeters: 96,
        headingDegrees: 0,
        floors: 25,
        year: 2029,
        color: "#7ec7ff",
        confidence: "Medium",
        sourceUrls: [
          "https://www.banyantreeresidenceswpb.com/",
          "https://www.wpb.org/files/assets/city/v/1/development-services/documents/plans-amp-plats-review-committee/2026-pprc-agendas/pprc-pre-app-agenda-march-12-2026.pdf",
        ],
        modelingNote:
          "Official marketing supports address and unit count, while story count comes from city planning material rather than the sales site.",
      },
      {
        id: "berkeley",
        name: "The Berkeley Palm Beach",
        status: "Under Construction",
        description:
          "The Berkeley's official site confirms the project at 550 South Australian Avenue. September 2025 financing coverage described it as a 25-story tower with 193 residences, and that planning count is used for the skyline massing.",
        address: "550 S Australian Ave, West Palm Beach, FL 33401",
        longitude: -80.0642,
        latitude: 26.7087,
        widthMeters: 52,
        depthMeters: 40,
        heightMeters: 96,
        headingDegrees: 0,
        floors: 25,
        year: 2028,
        color: "#4f8df7",
        confidence: "Medium",
        sourceUrls: [
          "https://www.theberkeleypalmbeach.com/",
          "https://floridayimby.com/2025/09/the-berkeley-palm-beach-secures-62-5-million-pre-construction-loan-from-jvp-management-in-downtown-west-palm-beach.html",
        ],
        modelingNote:
          "Marketing site confirms the project, but the current story count is taken from financing coverage rather than directly from the official site.",
      },
      {
        id: "nora-house",
        name: "NORA House",
        status: "Planning",
        description:
          "NORA House's official site lists 955 North Railroad Avenue for inquiries, while March 2026 development coverage placed the planned 11-story condominium at 1105 North Dixie Highway. This model places it in the district core rather than treating the sales-gallery address as the tower footprint.",
        address: "Modeled at district core between 955 N Railroad Ave and 1105 N Dixie Hwy, West Palm Beach, FL 33401",
        longitude: -80.0581,
        latitude: 26.7178,
        widthMeters: 50,
        depthMeters: 34,
        heightMeters: 43,
        headingDegrees: 0,
        floors: 11,
        year: 2028,
        color: "#9f86ff",
        confidence: "Low",
        sourceUrls: [
          "https://norahouse.com/",
          "https://profilemiamire.com/miamirealestate/2026/3/26/the-ronto-group-launches-sales-for-nora-house-in-west-palm-beachs-nora-district",
        ],
        modelingNote:
          "Address and tower placement remain soft because public sources conflict. This is best treated as a district-level marker for now.",
      },
    ],
  },
  {
    id: "downtown-office-core",
    name: "Downtown Office Core",
    market: "CityPlace, West Palm Beach",
    description:
      "A companion study for the downtown office skyline. This focuses on Related Ross' CityPlace office build-out, which is reshaping the interior downtown core rather than the North Flagler waterfront.",
    center: {
      longitude: -80.0565,
      latitude: 26.7098,
      height: 820,
    },
    camera: [
      {
        id: "cityplace-west",
        label: "CityPlace West",
        longitude: -80.0608,
        latitude: 26.7096,
        height: 210,
        heading: 92,
        pitch: -8,
      },
      {
        id: "brightline",
        label: "Brightline",
        longitude: -80.0539,
        latitude: 26.7138,
        height: 180,
        heading: 218,
        pitch: -6,
      },
      {
        id: "downtown-air",
        label: "Downtown Air",
        longitude: -80.0534,
        latitude: 26.7121,
        height: 620,
        heading: 238,
        pitch: -18,
      },
    ],
    buildings: [
      {
        id: "15-cityplace",
        name: "15 CityPlace",
        status: "Under Construction",
        description:
          "Related Ross broke ground in March 2025. Its press release described 15 CityPlace as a 25-story office tower, while the official leasing page currently lists 24 floors and a 2026 completion target.",
        address: "15 CityPlace, West Palm Beach, FL 33401",
        longitude: -80.0562,
        latitude: 26.7091,
        widthMeters: 55,
        depthMeters: 52,
        heightMeters: 114,
        headingDegrees: 0,
        floors: 25,
        year: 2027,
        color: "#ff6584",
        confidence: "Medium",
        sourceUrls: [
          "https://www.relatedross.com/press-releases/2025-03-13/related-ross-breaks-ground-10-and-15-cityplace-west-palm-beach",
          "https://www.lifestyleoffice.com/15-cityplace",
        ],
        modelingNote:
          "Public sources conflict between 24 floors and 25 stories. The massing uses the taller figure from the groundbreaking release.",
      },
      {
        id: "10-cityplace",
        name: "10 CityPlace",
        status: "Under Construction",
        description:
          "Related Ross' official property page lists 10 CityPlace at 468,000 square feet and in development. CityPlace district materials have described it as a 21-story tower, so the massing here uses that public planning figure.",
        address: "10 CityPlace, West Palm Beach, FL 33401",
        longitude: -80.0571,
        latitude: 26.7092,
        widthMeters: 58,
        depthMeters: 48,
        heightMeters: 95,
        headingDegrees: 0,
        floors: 21,
        year: 2027,
        color: "#65c18c",
        confidence: "Low",
        sourceUrls: [
          "https://www.relatedross.com/our-company/properties/10-cityplace",
          "https://www.relatedross.com/press-releases/2025-03-13/related-ross-breaks-ground-10-and-15-cityplace-west-palm-beach",
        ],
        modelingNote:
          "The property page confirms the project but not a precise story count. The current figure is a planning-stage visualization assumption.",
      },
    ],
  },
];

export const defaultScenarioId = proposalScenarios[0].id;
