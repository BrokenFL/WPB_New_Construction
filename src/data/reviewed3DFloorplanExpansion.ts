// Exact-source floorplan reviews for the Shorecrest and Ritz-Carlton residences
// added to the existing Olara/Alba entity system. The approved library remains
// the plan-fact authority; these snapshots make later source drift fail closed.
export const reviewed3DFloorplanExpansion = [
  {
    projectId: "shorecrest", slug: "residence-0704", displayName: "Residence 0704", version: "v01", areaDifference: 0, areaNote: "",
    pdf: "/assets/projects/shorecrest/floorplans/shorecrest-floorplans-shorecrest-floorplan-1153-0704-floorplan-v01.pdf",
    preview: "/assets/projects/shorecrest/floorplans/previews/shorecrest-floorplans-shorecrest-floorplan-1153-0704-floorplan-v01.jpg",
    sourceUrl: "https://www.shorecrestwpb.com/sites/default/files/2025-12/1153_0704_floorplan.pdf",
    sourcePage: "https://www.shorecrestwpb.com/floorplans", reviewedOn: "2026-09-25", updatedOn: "2026-09-25",
    sourceNote: "The released drawing is titled Unit #4 for floors 7 to 27. The 1153_0704 source filename identifies this archived plan; it does not establish a separate Residence 1153. The drawing does not publish a combined total area. Request the current drawing and offering documents.",
    expected: { title: "Shorecrest 1153 0704", bedrooms: "3", bathrooms: "3 + powder", interiorSqFt: "2470", terraceSqFt: "497", detail: "Floors 7-27" },
    summary: "Shorecrest's released Unit #4 drawing lists three bedrooms, 2,470 square feet of interior area and 497 square feet of exterior area. It depicts a private elevator entry and terraces beside the living and dining areas.",
    readingNote: "Compare the interior and outdoor areas separately; the drawing does not state a combined total. Unit #4 is shown across floors 7 to 27, which is a layout reference rather than proof of current availability. The plan shows three bathrooms and a powder room. Confirm the exact residence, exposure and current offering terms with the sales team.",
  },
  {
    projectId: "shorecrest", slug: "residence-1602", displayName: "Residence 1602", version: "v01", areaDifference: 0, areaNote: "",
    pdf: "/assets/projects/shorecrest/floorplans/shorecrest-floorplans-residence-1602-floor-plan-4891242d-v01.pdf",
    preview: "/assets/projects/shorecrest/floorplans/previews/shorecrest-floorplans-residence-1602-floor-plan-4891242d-v01.jpg",
    sourceUrl: "https://www.shorecrestwpb.com/sites/default/files/2026-03/1153_%201602_floorplan.pdf",
    sourcePage: "https://www.shorecrestwpb.com/floorplans", reviewedOn: "2026-09-25", updatedOn: "2026-09-25",
    sourceNote: "The released drawing is titled Unit #2 for floors 3 to 28. The archived filename names Residence 1602, but the drawing is a line reference and does not establish current availability. It does not publish a combined total area. Request the current drawing and offering documents.",
    expected: { title: "Residence 1602", bedrooms: "2", bathrooms: "2 + powder", interiorSqFt: "2015", terraceSqFt: "192", detail: "Floors 3-28" },
    summary: "Shorecrest's released Unit #2 drawing lists two bedrooms, 2,015 square feet of interior area and 192 square feet of exterior area. It shows a private elevator entry and a terrace by the living room.",
    readingNote: "The drawing represents the Unit #2 layout on floors 3 to 28, not a promise that Residence 1602 is currently offered. Compare its 2,015 interior square feet independently from its 192 exterior square feet. The drawing shows two bathrooms and a powder room; ask for the current residence-specific packet before comparing views or pricing.",
  },
  {
    projectId: "ritz-carlton-wpb", slug: "residence-02", displayName: "Residence 02", version: "v01", areaDifference: 0, areaNote: "",
    pdf: "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-02.pdf",
    preview: "/assets/projects/ritz-carlton-wpb/floorplans/previews/ritz-residence-02.jpg",
    sourceUrl: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/01/Res02.pdf",
    sourcePage: "https://theresidenceswestpalmbeach.com/floorplans/", reviewedOn: "2026-09-25", updatedOn: "2026-09-25",
    sourceNote: "The archived developer drawing identifies Residence 02 on floors 11 to 27. Its area method may differ from the offering documents and dimensions are approximate. Furnishings shown on the drawing are illustrative and not included with a purchase. Request the current prospectus and residence packet.",
    expected: { title: "Residence 02", bedrooms: "2", bathrooms: "2 + powder", interiorSqFt: "1566", terraceSqFt: "302", totalSqFt: "1868", detail: "Floors 11 - 27" },
    summary: "The Ritz-Carlton Residences Residence 02 drawing lists two bedrooms, 1,566 interior square feet and 302 exterior square feet, for a reported total of 1,868 square feet.",
    readingNote: "Compare the 1,566 interior square feet separately from the 302 exterior square feet. The developer cautions that its measurement method may differ from the prospectus and that construction dimensions can vary. Two bathrooms and one powder room are shown. Verify the specific residence and current offering details before relying on the drawing.",
  },
  {
    projectId: "ritz-carlton-wpb", slug: "residence-06", displayName: "Residence 06", version: "v01", areaDifference: 0, areaNote: "",
    pdf: "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-06.pdf",
    preview: "/assets/projects/ritz-carlton-wpb/floorplans/previews/ritz-residence-06.jpg",
    sourceUrl: "https://theresidenceswestpalmbeach.com/wp-content/uploads/2025/05/Residence06.pdf",
    sourcePage: "https://theresidenceswestpalmbeach.com/floorplans/", reviewedOn: "2026-09-25", updatedOn: "2026-09-25",
    sourceNote: "The archived developer drawing identifies Residence 06 on floors 11 to 27. Its area method may differ from the offering documents and dimensions are approximate. Furnishings shown on the drawing are illustrative and not included with a purchase. Request the current prospectus and residence packet.",
    expected: { title: "Residence 06", bedrooms: "3", bathrooms: "3 + powder", interiorSqFt: "3244", terraceSqFt: "897", totalSqFt: "4141", detail: "Floors 11 - 27" },
    summary: "The Ritz-Carlton Residences Residence 06 drawing lists three bedrooms, 3,244 interior square feet and 897 exterior square feet, for a reported total of 4,141 square feet.",
    readingNote: "The reported 4,141 square feet combines interior and exterior areas. Evaluate the 897 exterior square feet as separate outdoor space, then verify the residence-specific plan and prospectus. Three bathrooms and one powder room are shown; the developer states that furnishings on the drawing are illustrative.",
  },
] as const;
