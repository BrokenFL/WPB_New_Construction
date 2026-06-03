export type ApprovedFloorplanPlan = {
  title: string;
  href: string;
  sourceAssetRepoPath?: string;
  detail?: string;
  bedrooms?: string;
  bathrooms?: string;
  interiorSqFt?: string;
  terraceSqFt?: string;
  totalSqFt?: string;
};

export type ApprovedFloorplanProject = {
  projectId: string;
  name: string;
  area: string;
  count: number;
  plans: readonly ApprovedFloorplanPlan[];
};

export const approvedFloorplanLibrary = [
  {
    "projectId": "alba-palm-beach",
    "name": "Alba Palm Beach",
    "area": "North Flagler",
    "plans": [
      {
        "title": "Residence A",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-residence-a-v01.pdf",
        "detail": "Floors 7 - 18",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "1778",
        "terraceSqFt": "556",
        "totalSqFt": "2334"
      },
      {
        "title": "Residence B",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-b-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-residence-b-v01.pdf",
        "detail": "Floors 7 - 18",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "1866",
        "terraceSqFt": "556",
        "totalSqFt": "2422"
      },
      {
        "title": "Residence C",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-c-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-residence-c-v01.pdf",
        "detail": "Floors 7 - 18",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1799",
        "terraceSqFt": "570",
        "totalSqFt": "2369"
      },
      {
        "title": "Residence D",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-d-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-residence-d-v01.pdf",
        "detail": "Floors 7 - 18",
        "bedrooms": "3",
        "bathrooms": "3",
        "interiorSqFt": "1786",
        "terraceSqFt": "578",
        "totalSqFt": "2374"
      },
      {
        "title": "Residence LPH A",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-lph-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-residence-lph-a-v01.pdf",
        "detail": "Floor 19",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2770",
        "terraceSqFt": "1928",
        "totalSqFt": "4698"
      },
      {
        "title": "Residence LPH B",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-residence-lph-b-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-residence-lph-b-v01.pdf",
        "detail": "Floor 19",
        "bedrooms": "3",
        "bathrooms": "4",
        "interiorSqFt": "2755",
        "terraceSqFt": "2140",
        "totalSqFt": "4895"
      },
      {
        "title": "Townhouse C",
        "href": "/assets/projects/alba-palm-beach/floorplans/alba-floorplans-townhouse-c-v01.pdf",
        "sourceAssetRepoPath": "public-projects/alba-palm-beach/approved-for-website/floorplans/alba-floorplans-townhouse-c-v01.pdf",
        "detail": "Floors 3-5",
        "bedrooms": "4",
        "bathrooms": "5 + powder",
        "interiorSqFt": "4237",
        "terraceSqFt": "2118",
        "totalSqFt": "6355"
      }
    ],
    "count": 7
  },
  {
    "projectId": "mandarin-oriental",
    "name": "Mandarin Oriental Residences, West Palm Beach",
    "area": "North Flagler",
    "plans": [
      {
        "title": "Residence 01-L",
        "href": "/assets/projects/mandarin-oriental/floorplans/mandarin-oriental-floorplans-residence-01-l-v01.png",
        "sourceAssetRepoPath": "public-projects/mandarin-oriental/approved-for-website/floorplans/mandarin-oriental-floorplans-residence-01-l-v01.png",
        "detail": "Floors 5-18",
        "bedrooms": "3 + den",
        "bathrooms": "4"
      },
      {
        "title": "Residence 01-U",
        "href": "/assets/projects/mandarin-oriental/floorplans/mandarin-oriental-floorplans-residence-01-u-v01.png",
        "sourceAssetRepoPath": "public-projects/mandarin-oriental/approved-for-website/floorplans/mandarin-oriental-floorplans-residence-01-u-v01.png",
        "detail": "Floors 19-25",
        "bedrooms": "4 + den",
        "bathrooms": "5"
      },
      {
        "title": "Residence 02",
        "href": "/assets/projects/mandarin-oriental/floorplans/mandarin-oriental-floorplans-residence-02-v01.png",
        "sourceAssetRepoPath": "public-projects/mandarin-oriental/approved-for-website/floorplans/mandarin-oriental-floorplans-residence-02-v01.png",
        "detail": "Floors 5-25",
        "bedrooms": "3 + den",
        "bathrooms": "3.5"
      },
      {
        "title": "Residence 03",
        "href": "/assets/projects/mandarin-oriental/floorplans/mandarin-oriental-floorplans-residence-03-v01.png",
        "sourceAssetRepoPath": "public-projects/mandarin-oriental/approved-for-website/floorplans/mandarin-oriental-floorplans-residence-03-v01.png",
        "detail": "Floors 6-25",
        "bedrooms": "2",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence 04-L",
        "href": "/assets/projects/mandarin-oriental/floorplans/mandarin-oriental-floorplans-residence-04-l-v01.png",
        "sourceAssetRepoPath": "public-projects/mandarin-oriental/approved-for-website/floorplans/mandarin-oriental-floorplans-residence-04-l-v01.png",
        "detail": "Floors 6-18",
        "bedrooms": "3 + den",
        "bathrooms": "3.5"
      },
      {
        "title": "Residence 04-U",
        "href": "/assets/projects/mandarin-oriental/floorplans/mandarin-oriental-floorplans-residence-04-u-v01.png",
        "sourceAssetRepoPath": "public-projects/mandarin-oriental/approved-for-website/floorplans/mandarin-oriental-floorplans-residence-04-u-v01.png",
        "detail": "Floors 19-25",
        "bedrooms": "2 + den",
        "bathrooms": "2.5"
      }
    ],
    "count": 6
  },
  {
    "projectId": "olara",
    "name": "Olara",
    "area": "North Flagler",
    "plans": [
      {
        "title": "Residence G",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-g-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-g-repo-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "4 + den",
        "bathrooms": "4 + powder",
        "interiorSqFt": "4110",
        "terraceSqFt": "599",
        "totalSqFt": "4709"
      },
      {
        "title": "Residence H",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-h-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-h-repo-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1914",
        "terraceSqFt": "362",
        "totalSqFt": "2276"
      },
      {
        "title": "Residence I",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-i-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-i-repo-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2358",
        "terraceSqFt": "922",
        "totalSqFt": "3280"
      },
      {
        "title": "Residence J",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-j-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-j-repo-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1887",
        "terraceSqFt": "576",
        "totalSqFt": "2463"
      },
      {
        "title": "Residence K",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-k-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-k-repo-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1908",
        "terraceSqFt": "376",
        "totalSqFt": "2284"
      },
      {
        "title": "Residence L",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-l-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-l-repo-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1483",
        "terraceSqFt": "354",
        "totalSqFt": "1837"
      },
      {
        "title": "Residence M",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-m-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-m-repo-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2489",
        "terraceSqFt": "750",
        "totalSqFt": "3239"
      },
      {
        "title": "Residence N",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-n-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-n-repo-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1741",
        "terraceSqFt": "381",
        "totalSqFt": "2122"
      },
      {
        "title": "Residence O",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-o-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-o-repo-v01.pdf",
        "detail": "Floors 19-26",
        "bedrooms": "3 + den",
        "bathrooms": "3 + powder",
        "interiorSqFt": "3034",
        "terraceSqFt": "565",
        "totalSqFt": "3599"
      },
      {
        "title": "Residence P",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-p-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-p-repo-v01.pdf",
        "detail": "Floors 19-26",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2656",
        "terraceSqFt": "1196",
        "totalSqFt": "3852"
      },
      {
        "title": "Residence Q",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-q-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-q-repo-v01.pdf",
        "detail": "Floors 19-26",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2378",
        "terraceSqFt": "546",
        "totalSqFt": "2924"
      },
      {
        "title": "Residence T",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-t-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-t-repo-v01.pdf",
        "detail": "Floors 19-26",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2999",
        "terraceSqFt": "723",
        "totalSqFt": "3722"
      },
      {
        "title": "Residence U",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-u-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-u-repo-v01.pdf",
        "detail": "Floors 19-26",
        "bedrooms": "3 + den",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2578",
        "terraceSqFt": "584",
        "totalSqFt": "3162"
      },
      {
        "title": "Residence V",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-v-401-501-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-v-401-501-repo-v01.pdf",
        "detail": "Floors 4-5",
        "bedrooms": "3 + den",
        "bathrooms": "3 + powder",
        "interiorSqFt": "3008",
        "terraceSqFt": "1110",
        "totalSqFt": "4118"
      },
      {
        "title": "Residence W",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-w-402-502-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-w-402-502-repo-v01.pdf",
        "detail": "Floors 4-5",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "2498",
        "terraceSqFt": "540",
        "totalSqFt": "3038"
      },
      {
        "title": "Residence 207/307/403/503",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-x-207-307-403-503-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-x-207-307-403-503-repo-v01.pdf",
        "detail": "Floors 2-5",
        "bedrooms": "4 + den",
        "bathrooms": "4 + powder",
        "interiorSqFt": "4038",
        "terraceSqFt": "1340",
        "totalSqFt": "5378"
      },
      {
        "title": "Residence 208",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-y-208-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-y-208-repo-v01.pdf",
        "detail": "Floor 2",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "3402",
        "terraceSqFt": "1809",
        "totalSqFt": "5211"
      },
      {
        "title": "Residence 308/404/504",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-y-308-404-504-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-y-308-404-504-repo-v01.pdf",
        "detail": "Floors 3-5",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "3552",
        "terraceSqFt": "440",
        "totalSqFt": "3992"
      },
      {
        "title": "Residence 209",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-z-209-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-z-209-repo-v01.pdf",
        "detail": "Floor 2",
        "bedrooms": "4 + den",
        "bathrooms": "4 + powder",
        "interiorSqFt": "4015",
        "terraceSqFt": "1674",
        "totalSqFt": "5689"
      },
      {
        "title": "Residence 309/405/505",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-residence-plan-z-309-405-505-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-residence-plan-z-309-405-505-repo-v01.pdf",
        "detail": "Floors 3-5",
        "bedrooms": "4 + den",
        "bathrooms": "4 + powder",
        "interiorSqFt": "4228",
        "terraceSqFt": "602",
        "totalSqFt": "4830"
      },
      {
        "title": "Residence A",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-a-ssd-source-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1857",
        "terraceSqFt": "466",
        "totalSqFt": "2323"
      },
      {
        "title": "Residence B",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-b-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-b-ssd-source-v01.pdf",
        "detail": "Floors 7-18",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1983",
        "terraceSqFt": "431",
        "totalSqFt": "2414"
      },
      {
        "title": "Residence C",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-c-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-c-ssd-source-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "3 + den",
        "bathrooms": "3 + powder",
        "interiorSqFt": "3286",
        "terraceSqFt": "1225",
        "totalSqFt": "4511"
      },
      {
        "title": "Residence D",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-d-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-d-ssd-source-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "2 + den",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1774",
        "terraceSqFt": "381",
        "totalSqFt": "2155"
      },
      {
        "title": "Residence E",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-e-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-e-ssd-source-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "3 + den",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2963",
        "terraceSqFt": "605",
        "totalSqFt": "3568"
      },
      {
        "title": "Residence F",
        "href": "/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-f-v01.pdf",
        "sourceAssetRepoPath": "public-projects/olara/approved-for-website/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-f-ssd-source-v01.pdf",
        "detail": "Floors 7-26",
        "bedrooms": "4 + den",
        "bathrooms": "4 + powder",
        "interiorSqFt": "3805",
        "terraceSqFt": "793",
        "totalSqFt": "4598"
      }
    ],
    "count": 26
  },
  {
    "projectId": "shorecrest",
    "name": "Shorecrest",
    "area": "North Flagler",
    "plans": [
      {
        "title": "Residence 301",
        "href": "/assets/projects/shorecrest/floorplans/shorecrest-floorplans-residence-301-floor-plan-927fc847-v01.pdf",
        "sourceAssetRepoPath": "public-projects/shorecrest/approved-for-website/floorplans/shorecrest-floorplans-residence-301-floor-plan-927fc847-repo-v01.pdf",
        "detail": "Floors 3-28",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2835",
        "terraceSqFt": "345"
      },
      {
        "title": "Residence 1602",
        "href": "/assets/projects/shorecrest/floorplans/shorecrest-floorplans-residence-1602-floor-plan-4891242d-v01.pdf",
        "sourceAssetRepoPath": "public-projects/shorecrest/approved-for-website/floorplans/shorecrest-floorplans-residence-1602-floor-plan-4891242d-repo-v01.pdf",
        "detail": "Floors 3-28",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "2015",
        "terraceSqFt": "192"
      },
      {
        "title": "Shorecrest 1153 0303",
        "href": "/assets/projects/shorecrest/floorplans/shorecrest-floorplans-shorecrest-floorplan-1153-0303-floorplan-v01.pdf",
        "sourceAssetRepoPath": "public-projects/shorecrest/approved-for-website/floorplans/shorecrest-floorplans-shorecrest-floorplan-1153-0303-floorplan-ssd-source-v01.pdf",
        "detail": "Floors 3-28",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2706",
        "terraceSqFt": "256"
      },
      {
        "title": "Shorecrest 1153 0704",
        "href": "/assets/projects/shorecrest/floorplans/shorecrest-floorplans-shorecrest-floorplan-1153-0704-floorplan-v01.pdf",
        "sourceAssetRepoPath": "public-projects/shorecrest/approved-for-website/floorplans/shorecrest-floorplans-shorecrest-floorplan-1153-0704-floorplan-ssd-source-v01.pdf",
        "detail": "Floors 7-27",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2470",
        "terraceSqFt": "497"
      }
    ],
    "count": 4
  },
  {
    "projectId": "ritz-carlton-wpb",
    "name": "The Ritz-Carlton Residences, West Palm Beach",
    "area": "North Flagler",
    "plans": [
      {
        "title": "Lake Home 07",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-lake-home-07.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 2 - 8",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "2510",
        "totalSqFt": "2750",
        "terraceSqFt": "240"
      },
      {
        "title": "Lake Home 08",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-lake-home-08.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 2 - 8",
        "bedrooms": "2",
        "bathrooms": "3",
        "interiorSqFt": "2350",
        "totalSqFt": "2543",
        "terraceSqFt": "193"
      },
      {
        "title": "Lake Home 09",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-lake-home-09.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 2 - 8",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1929",
        "totalSqFt": "2117",
        "terraceSqFt": "188"
      },
      {
        "title": "Lake Home 10",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-lake-home-10.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 2 - 8",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1929",
        "totalSqFt": "2117",
        "terraceSqFt": "188"
      },
      {
        "title": "Lake Home 11",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-lake-home-11.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 2 - 8",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1874",
        "totalSqFt": "2078",
        "terraceSqFt": "204"
      },
      {
        "title": "Lake Home 12",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-lake-home-12.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 3 - 8",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2777",
        "totalSqFt": "3170",
        "terraceSqFt": "393"
      },
      {
        "title": "Residence 01",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-01.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 11 - 27",
        "bedrooms": "4",
        "bathrooms": "4 + powder",
        "interiorSqFt": "3331",
        "totalSqFt": "4229",
        "terraceSqFt": "898"
      },
      {
        "title": "Residence 02",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-02.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 11 - 27",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1566",
        "totalSqFt": "1868",
        "terraceSqFt": "302"
      },
      {
        "title": "Residence 03",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-03.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 11 - 27",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2449",
        "totalSqFt": "2706",
        "terraceSqFt": "257"
      },
      {
        "title": "Residence 04",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-04.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 11 - 27",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "2541",
        "totalSqFt": "2798",
        "terraceSqFt": "257"
      },
      {
        "title": "Residence 05",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-05.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 11 - 27",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1532",
        "totalSqFt": "1839",
        "terraceSqFt": "307"
      },
      {
        "title": "Residence 06",
        "href": "/assets/projects/ritz-carlton-wpb/floorplans/ritz-residence-06.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Floors 11 - 27",
        "bedrooms": "3",
        "bathrooms": "3 + powder",
        "interiorSqFt": "3244",
        "totalSqFt": "4141",
        "terraceSqFt": "897"
      }
    ],
    "count": 12
  },
  {
    "projectId": "banyan-tree",
    "name": "Banyan Tree Residences West Palm Beach",
    "area": "Downtown",
    "plans": [
      {
        "title": "Residence 01",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-01-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-01-v01.png",
        "bedrooms": "3",
        "bathrooms": "3",
        "interiorSqFt": "2140",
        "terraceSqFt": "766",
        "totalSqFt": "2906"
      },
      {
        "title": "Residence 02",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-02-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-02-v01.png",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1603",
        "terraceSqFt": "496",
        "totalSqFt": "2099"
      },
      {
        "title": "Residence 03",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-03-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-03-v01.png",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1446",
        "terraceSqFt": "565",
        "totalSqFt": "2011"
      },
      {
        "title": "Residence 04",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-04-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-04-v01.png",
        "bedrooms": "2",
        "bathrooms": "2 + powder",
        "interiorSqFt": "1439",
        "terraceSqFt": "576",
        "totalSqFt": "2015"
      },
      {
        "title": "Residence 05",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-05-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-05-v01.png",
        "bedrooms": "1",
        "bathrooms": "1 + powder",
        "terraceSqFt": "577",
        "totalSqFt": "1655"
      },
      {
        "title": "Residence 06",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-06-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-06-v01.png",
        "bedrooms": "2",
        "bathrooms": "2",
        "interiorSqFt": "1563",
        "terraceSqFt": "563",
        "totalSqFt": "2125"
      },
      {
        "title": "Residence 2403",
        "href": "/assets/projects/banyan-tree/floorplans/banyan-tree-floorplans-residence-2403-v01.png",
        "sourceAssetRepoPath": "public-projects/banyan-tree/approved-for-website/floorplans/banyan-tree-floorplans-residence-2403-v01.png",
        "bedrooms": "4",
        "bathrooms": "4 + powder",
        "interiorSqFt": "2962",
        "totalSqFt": "4103"
      }
    ],
    "count": 7
  },
  {
    "projectId": "mr-c",
    "name": "Mr. C Hotel & Residences West Palm Beach",
    "area": "Downtown",
    "plans": [
      {
        "title": "Residence 01",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res01-floorplan-illustrated-1--85f9b4cc.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2195",
        "terraceSqFt": "638",
        "totalSqFt": "2833"
      },
      {
        "title": "Residence 01A",
        "href": "/assets/projects/mr-c/floorplans/residence-01a--4c4e8025.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "3",
        "bathrooms": "3",
        "interiorSqFt": "1817",
        "terraceSqFt": "562",
        "totalSqFt": "2379"
      },
      {
        "title": "Residence 02",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res02-floorplan-illustrated-1--c9a23ab0.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "1836",
        "terraceSqFt": "562",
        "totalSqFt": "2398"
      },
      {
        "title": "Residence 02A",
        "href": "/assets/projects/mr-c/floorplans/residence-02a--c0b62912.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1397",
        "terraceSqFt": "486",
        "totalSqFt": "1883"
      },
      {
        "title": "Residence 03",
        "href": "/assets/projects/mr-c/floorplans/residence-03--809edf7a.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "totalSqFt": "2010"
      },
      {
        "title": "Residence 03A",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res03a-floorplan-illustrated-1--5bd7a0a7.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1630",
        "terraceSqFt": "310",
        "totalSqFt": "1940"
      },
      {
        "title": "Residence 04",
        "href": "/assets/projects/mr-c/floorplans/residence-04--7e2f1920.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "2",
        "bathrooms": "2",
        "interiorSqFt": "1149",
        "terraceSqFt": "232",
        "totalSqFt": "1381"
      },
      {
        "title": "Residence 04A",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res04a-floorplan-illustrated-1--534379f7.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1170",
        "terraceSqFt": "230",
        "totalSqFt": "1400"
      },
      {
        "title": "Residence 05",
        "href": "/assets/projects/mr-c/floorplans/residence-05--a9880839.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "832",
        "terraceSqFt": "157",
        "totalSqFt": "989"
      },
      {
        "title": "Residence 06",
        "href": "/assets/projects/mr-c/floorplans/residence-06--5677af6f.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1178",
        "terraceSqFt": "234",
        "totalSqFt": "1412"
      },
      {
        "title": "Residence 06A",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res06a-floorplan-illustrated-1--f57905a4.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "832",
        "terraceSqFt": "156",
        "totalSqFt": "988"
      },
      {
        "title": "Residence 07",
        "href": "/assets/projects/mr-c/floorplans/residence-07--438e91d4.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "terraceSqFt": "638",
        "totalSqFt": "2827"
      },
      {
        "title": "Residence 07A",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res07a-floorplan-illustrated-1--6616d702.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "3",
        "bathrooms": "3",
        "interiorSqFt": "1803",
        "terraceSqFt": "560",
        "totalSqFt": "2363"
      },
      {
        "title": "Residence 08",
        "href": "/assets/projects/mr-c/floorplans/residence-08--0717db7d.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 16-20",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "1870",
        "terraceSqFt": "560",
        "totalSqFt": "2430"
      },
      {
        "title": "Residence 08A",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res08a-floorplan-illustrated-1--f250368d.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1221",
        "terraceSqFt": "234",
        "totalSqFt": "1455"
      },
      {
        "title": "Residence 10",
        "href": "/assets/projects/mr-c/floorplans/residence-10--c2ea2424.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 9-15",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1414",
        "terraceSqFt": "482",
        "totalSqFt": "1896"
      },
      {
        "title": "Residence 11",
        "href": "/assets/projects/mr-c/floorplans/residence-11--d43deb20.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 3-7",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1383",
        "terraceSqFt": "287",
        "totalSqFt": "1670"
      },
      {
        "title": "Residence 12",
        "href": "/assets/projects/mr-c/floorplans/residence-12--a53ea9bd.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 2-7",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "847",
        "terraceSqFt": "228",
        "totalSqFt": "1075"
      },
      {
        "title": "Residence 13",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res13-floorplan-illustrated-1--509a3e5e.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 2-7",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1201",
        "terraceSqFt": "338",
        "totalSqFt": "1539"
      },
      {
        "title": "Residence 14",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res14-floorplan-illustrated-1--9b18c4e3.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 2-7",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "830",
        "terraceSqFt": "156",
        "totalSqFt": "986"
      },
      {
        "title": "Residence 15",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res15-floorplan-illustrated-1--dbf7b2b7.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 3-7",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1166",
        "terraceSqFt": "234",
        "totalSqFt": "1400"
      },
      {
        "title": "Residence 16",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res16-floorplan-illustrated-1--7e8a2c95.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 3-7",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1510",
        "terraceSqFt": "483",
        "totalSqFt": "1993"
      },
      {
        "title": "Residence 17",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res17-floorplan-illustrated-1--a48c9cef.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 3-7",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "996",
        "terraceSqFt": "258",
        "totalSqFt": "1254"
      },
      {
        "title": "Residence 18",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res18-floorplan-illustrated-1--c9f8621b.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 2-7",
        "bedrooms": "1",
        "bathrooms": "1",
        "interiorSqFt": "824",
        "terraceSqFt": "242",
        "totalSqFt": "1066"
      },
      {
        "title": "Residence 19",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res19-floorplan-illustrated-1--ce20734e.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "detail": "Levels 2-7",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1528",
        "terraceSqFt": "669",
        "totalSqFt": "2197"
      },
      {
        "title": "Residence 211",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res211-floorplan-illustrated-1--e8de62cf.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "1088",
        "terraceSqFt": "287",
        "totalSqFt": "1375"
      },
      {
        "title": "Residence 215",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res215-floorplan-illustrated-1--3faea402.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1174",
        "terraceSqFt": "234",
        "totalSqFt": "1408"
      },
      {
        "title": "Residence 216",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res216-floorplan-illustrated-1--d98b753a.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "2",
        "bathrooms": "2",
        "interiorSqFt": "1247",
        "terraceSqFt": "483",
        "totalSqFt": "1730"
      },
      {
        "title": "Residence 217",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res217-floorplan-illustrated-1--baf065bd.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "920",
        "terraceSqFt": "258",
        "totalSqFt": "1178"
      },
      {
        "title": "Residence 813",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res813-floorplan-illustrated-1--47517f83.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1200",
        "terraceSqFt": "202",
        "totalSqFt": "1402"
      },
      {
        "title": "Residence 814",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res814-floorplan-illustrated-1--9b7e221f.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "830",
        "terraceSqFt": "137",
        "totalSqFt": "967"
      },
      {
        "title": "Residence 815",
        "href": "/assets/projects/mr-c/floorplans/mrcwpb-res815-floorplan-illustrated-1--c7f37852.pdf",
        "sourceAssetRepoPath": "website-public-floorplan-fallback",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1213",
        "terraceSqFt": "202",
        "totalSqFt": "1415"
      }
    ],
    "count": 32
  },
  {
    "projectId": "berkeley",
    "name": "The Berkeley Palm Beach",
    "area": "Downtown",
    "plans": [
      {
        "title": "Residence PH",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-penthouse-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-penthouse-v01.jpg",
        "detail": "Floors 25-26",
        "bedrooms": "5 + flex",
        "interiorSqFt": "4752",
        "terraceSqFt": "1092",
        "totalSqFt": "5844",
        "bathrooms": "7.5"
      },
      {
        "title": "Residence E",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-v01.jpg",
        "bedrooms": "4 + flex",
        "interiorSqFt": "2959",
        "terraceSqFt": "765",
        "totalSqFt": "3724",
        "detail": "Floors 8-24",
        "bathrooms": "4.5"
      },
      {
        "title": "Residence A",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-a-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-a-v01.jpg",
        "bedrooms": "2 + flex",
        "interiorSqFt": "1881",
        "terraceSqFt": "377",
        "totalSqFt": "2258",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence B",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-b-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-b-v01.jpg",
        "bedrooms": "2 + flex",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence C",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-c-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-c-v01.jpg",
        "bedrooms": "2 + flex",
        "interiorSqFt": "2590",
        "terraceSqFt": "389",
        "totalSqFt": "2979",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence D",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-d-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-d-v01.jpg",
        "bedrooms": "2 + flex",
        "interiorSqFt": "1798",
        "terraceSqFt": "370",
        "totalSqFt": "2168",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence F",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-f-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-f-v01.jpg",
        "bedrooms": "2 + flex",
        "interiorSqFt": "2673",
        "terraceSqFt": "774",
        "totalSqFt": "3447",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence G",
        "href": "/assets/projects/berkeley/floorplans/berkeley-floorplans-residence-g-v01.jpg",
        "sourceAssetRepoPath": "public-projects/berkeley/approved-for-website/floorplans/berkeley-floorplans-residence-g-v01.jpg",
        "bedrooms": "3",
        "interiorSqFt": "2581",
        "terraceSqFt": "679",
        "totalSqFt": "3260",
        "bathrooms": "3.5"
      }
    ],
    "count": 8
  },
  {
    "projectId": "nora-house",
    "name": "NORA House",
    "area": "Downtown / NORA",
    "plans": [
      {
        "title": "Residence 01",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-01-floorplan-1f9ee4f9-v01.webp",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-01-floorplan-1f9ee4f9-repo-v01.webp",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2400"
      },
      {
        "title": "Residence 02",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-02-floorplan-8eaf9a11-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-02-floorplan-8eaf9a11-repo-v01.jpg",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2400"
      },
      {
        "title": "Residence 03",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-03-floorplan-3f2cb001-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-03-floorplan-3f2cb001-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1650"
      },
      {
        "title": "Residence 04",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-04-floorplan-1a34d859-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-04-floorplan-1a34d859-repo-v01.jpg",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2435"
      },
      {
        "title": "Residence 05",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-05-floorplan-7b476826-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-05-floorplan-7b476826-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1840"
      },
      {
        "title": "Residence 06",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-06-floorplan-36e6d64f-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-06-floorplan-36e6d64f-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1655"
      },
      {
        "title": "Residence 07",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-07-floorplan-82bb861e-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-07-floorplan-82bb861e-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1695"
      },
      {
        "title": "Residence 08",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-08-floorplan-5a6dbe79-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-08-floorplan-5a6dbe79-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1465"
      },
      {
        "title": "Residence 09",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-09-floorplan-4d4f0e1c-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-09-floorplan-4d4f0e1c-repo-v01.jpg",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2645"
      },
      {
        "title": "Residence 10",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-10-floorplan-f630ef36-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-10-floorplan-f630ef36-repo-v01.jpg",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2645"
      },
      {
        "title": "Residence 11",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-11-floorplan-dc05c90e-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-11-floorplan-dc05c90e-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1465"
      },
      {
        "title": "Residence 12",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-12-floorplan-e5e100a6-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-12-floorplan-e5e100a6-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1665"
      },
      {
        "title": "Residence 13",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-13-floorplan-46f6c2f2-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-13-floorplan-46f6c2f2-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1840"
      },
      {
        "title": "Residence 14",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-14-floorplan-daae34c8-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-14-floorplan-daae34c8-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1660"
      },
      {
        "title": "Residence 15",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-15-floorplan-0717f2fa-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-15-floorplan-0717f2fa-repo-v01.jpg",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1650",
        "totalSqFt": "1928"
      },
      {
        "title": "Residence 16",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-16-floorplan-ca744524-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-16-floorplan-ca744524-repo-v01.jpg",
        "bedrooms": "4",
        "bathrooms": "3.5",
        "interiorSqFt": "2960"
      },
      {
        "title": "Residence 17",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-residence-17-floorplan-8ef533db-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-residence-17-floorplan-8ef533db-repo-v01.jpg",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2400"
      },
      {
        "title": "Terrace 401",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-401-floorplan-ac6acc9c-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-401-floorplan-ac6acc9c-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2400"
      },
      {
        "title": "Terrace 402",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-402-floorplan-770a3c13-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-402-floorplan-770a3c13-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2400",
        "totalSqFt": "3295"
      },
      {
        "title": "Terrace 403",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-403-floorplan-db1cd849-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-403-floorplan-db1cd849-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1650",
        "totalSqFt": "2190"
      },
      {
        "title": "Terrace 404",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-404-floorplan-bf2691cd-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-404-floorplan-bf2691cd-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2435"
      },
      {
        "title": "Terrace 405",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-405-floorplan-549f79c3-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-405-floorplan-549f79c3-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1840"
      },
      {
        "title": "Terrace 406",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-406-floorplan-18b8b27f-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-406-floorplan-18b8b27f-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1655",
        "totalSqFt": "1910"
      },
      {
        "title": "Terrace 407",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-407-floorplan-cd216b95-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-407-floorplan-cd216b95-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1695"
      },
      {
        "title": "Terrace 409",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-409-floorplan-dfaf5596-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-409-floorplan-dfaf5596-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "2340",
        "totalSqFt": "3325"
      },
      {
        "title": "Terrace 410",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-410-floorplan-c9a0d4e8-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-410-floorplan-c9a0d4e8-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "2340",
        "totalSqFt": "3325"
      },
      {
        "title": "Terrace 412",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-412-floorplan-0d520fbd-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-412-floorplan-0d520fbd-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1665"
      },
      {
        "title": "Terrace 413",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-413-floorplan-e8fddd07-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-413-floorplan-e8fddd07-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1840"
      },
      {
        "title": "Terrace 414",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-414-floorplan-83c5f27b-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-414-floorplan-83c5f27b-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1660",
        "totalSqFt": "4175"
      },
      {
        "title": "Terrace 415",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-415-floorplan-7b2cce5e-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-415-floorplan-7b2cce5e-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "2",
        "bathrooms": "2.5",
        "interiorSqFt": "1650",
        "totalSqFt": "2190"
      },
      {
        "title": "Terrace 416",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-416-floorplan-e8ea896d-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-416-floorplan-e8ea896d-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "4",
        "bathrooms": "3.5",
        "interiorSqFt": "2960"
      },
      {
        "title": "Terrace 417",
        "href": "/assets/projects/nora-house/floorplans/nora-house-floorplans-terrace-417-floorplan-b4dd503f-v01.jpg",
        "sourceAssetRepoPath": "public-projects/nora-house/approved-for-website/floorplans/nora-house-floorplans-terrace-417-floorplan-b4dd503f-repo-v01.jpg",
        "detail": "Terrace level",
        "bedrooms": "3",
        "bathrooms": "3.5",
        "interiorSqFt": "2400"
      }
    ],
    "count": 32
  },
  {
    "projectId": "la-clara",
    "name": "La Clara",
    "area": "South Flagler",
    "plans": [
      {
        "title": "PH",
        "href": "/assets/projects/la-clara/floorplans/la-clara-floorplans-ph-v01.pdf",
        "sourceAssetRepoPath": "public-projects/la-clara/approved-for-website/floorplans/la-clara-floorplans-ph-v01.pdf",
        "detail": "Penthouse plan",
        "bedrooms": "3",
        "bathrooms": "3.5"
      },
      {
        "title": "Residence A",
        "href": "/assets/projects/la-clara/floorplans/la-clara-floorplans-res-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/la-clara/approved-for-website/floorplans/la-clara-floorplans-res-a-v01.pdf",
        "detail": "Levels 4-5",
        "bedrooms": "1",
        "bathrooms": "1.5",
        "interiorSqFt": "1203",
        "terraceSqFt": "358"
      },
      {
        "title": "Residence C",
        "href": "/assets/projects/la-clara/floorplans/la-clara-floorplans-res-c-v01.pdf",
        "sourceAssetRepoPath": "public-projects/la-clara/approved-for-website/floorplans/la-clara-floorplans-res-c-v01.pdf",
        "detail": "Levels 4-22",
        "bedrooms": "2",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence D",
        "href": "/assets/projects/la-clara/floorplans/la-clara-floorplans-res-d-v01.pdf",
        "sourceAssetRepoPath": "public-projects/la-clara/approved-for-website/floorplans/la-clara-floorplans-res-d-v01.pdf",
        "detail": "Levels 4-22",
        "bedrooms": "2",
        "bathrooms": "2.5"
      },
      {
        "title": "Residence E",
        "href": "/assets/projects/la-clara/floorplans/la-clara-floorplans-res-e-v01.pdf",
        "sourceAssetRepoPath": "public-projects/la-clara/approved-for-website/floorplans/la-clara-floorplans-res-e-v01.pdf",
        "detail": "Levels 4-22",
        "bedrooms": "3",
        "bathrooms": "3.5"
      },
      {
        "title": "Residence F",
        "href": "/assets/projects/la-clara/floorplans/la-clara-floorplans-res-f-v01.pdf",
        "sourceAssetRepoPath": "public-projects/la-clara/approved-for-website/floorplans/la-clara-floorplans-res-f-v01.pdf",
        "detail": "Levels 6-22",
        "bedrooms": "3",
        "bathrooms": "3.5"
      }
    ],
    "count": 6
  },
  {
    "projectId": "forte-on-flagler",
    "name": "Fort\u00e9 on Flagler",
    "area": "South Flagler",
    "plans": [
      {
        "title": "North Open Kitchen Plan",
        "href": "/assets/projects/forte-on-flagler/floorplans/forte-on-flagler-floorplans-north-open-kitchen-plan-v01.pdf",
        "sourceAssetRepoPath": "public-projects/forte-on-flagler/approved-for-website/floorplans/forte-on-flagler-floorplans-north-open-kitchen-plan-v01.pdf",
        "bedrooms": "4",
        "bathrooms": "4.5"
      },
      {
        "title": "Penthouse Residence",
        "href": "/assets/projects/forte-on-flagler/floorplans/forte-on-flagler-floorplans-penthouse-v01.pdf",
        "sourceAssetRepoPath": "public-projects/forte-on-flagler/approved-for-website/floorplans/forte-on-flagler-floorplans-penthouse-v01.pdf",
        "detail": "Two-level penthouse",
        "bedrooms": "4-8 bed options",
        "interiorSqFt": "9040",
        "terraceSqFt": "1800",
        "totalSqFt": "10840"
      },
      {
        "title": "South",
        "href": "/assets/projects/forte-on-flagler/floorplans/forte-on-flagler-floorplans-south-v01.pdf",
        "sourceAssetRepoPath": "public-projects/forte-on-flagler/approved-for-website/floorplans/forte-on-flagler-floorplans-south-v01.pdf",
        "bedrooms": "4",
        "bathrooms": "4.5"
      }
    ],
    "count": 3
  },
  {
    "projectId": "maison-dor",
    "name": "Maison d'Or",
    "area": "South Flagler",
    "plans": [
      {
        "title": "Residence A",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-a-v01.pdf",
        "detail": "Levels 5-14",
        "bedrooms": "3",
        "bathrooms": "4.5",
        "interiorSqFt": "4353",
        "terraceSqFt": "693",
        "totalSqFt": "5046"
      },
      {
        "title": "Residence A1",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-a1-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-a1-v01.pdf",
        "bedrooms": "3",
        "bathrooms": "4.5",
        "interiorSqFt": "4141",
        "terraceSqFt": "693",
        "totalSqFt": "4834"
      },
      {
        "title": "Residence B",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-b-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-b-v01.pdf",
        "detail": "Levels 4-14",
        "bedrooms": "2",
        "bathrooms": "3",
        "interiorSqFt": "2991",
        "terraceSqFt": "420",
        "totalSqFt": "3411"
      },
      {
        "title": "Residence C",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-c-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-c-v01.pdf",
        "detail": "Levels 5-14",
        "bedrooms": "3",
        "bathrooms": "4.5",
        "interiorSqFt": "4430",
        "terraceSqFt": "693",
        "totalSqFt": "5123"
      },
      {
        "title": "Residence C1",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-c1-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-c1-v01.pdf",
        "bedrooms": "3",
        "bathrooms": "4.5",
        "interiorSqFt": "4230",
        "terraceSqFt": "693",
        "totalSqFt": "4923"
      },
      {
        "title": "Estate A",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-estate-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-estate-a-v01.pdf",
        "detail": "Levels 15-17",
        "bedrooms": "4",
        "bathrooms": "5.5",
        "interiorSqFt": "5922",
        "terraceSqFt": "1133",
        "totalSqFt": "7055"
      },
      {
        "title": "Estate B",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-estate-b-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-estate-b-v01.pdf",
        "detail": "Levels 15-17",
        "bedrooms": "4",
        "bathrooms": "5.5",
        "interiorSqFt": "5739",
        "terraceSqFt": "1133",
        "totalSqFt": "6872"
      },
      {
        "title": "LPH A",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-lph-a-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-lph-a-v01.pdf",
        "bedrooms": "4",
        "bathrooms": "5.5",
        "interiorSqFt": "5922",
        "terraceSqFt": "1133",
        "totalSqFt": "7055",
        "detail": "Lower penthouse"
      },
      {
        "title": "LPH B",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-lph-b-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-lph-b-v01.pdf",
        "bedrooms": "4",
        "bathrooms": "5.5",
        "interiorSqFt": "5739",
        "terraceSqFt": "1133",
        "totalSqFt": "6872",
        "detail": "Lower penthouse"
      },
      {
        "title": "Penthouse",
        "href": "/assets/projects/maison-dor/floorplans/maison-dor-floorplans-ph-v01.pdf",
        "sourceAssetRepoPath": "public-projects/maison-dor/approved-for-website/floorplans/maison-dor-floorplans-ph-v01.pdf",
        "detail": "Level 19",
        "bedrooms": "4",
        "interiorSqFt": "10190",
        "terraceSqFt": "2554",
        "totalSqFt": "12744",
        "bathrooms": "6 full bath + 3 half bath"
      }
    ],
    "count": 10
  },
  {
    "projectId": "south-flagler-house",
    "name": "South Flagler House",
    "area": "South Flagler",
    "plans": [
      {
        "title": "Tier 1 N Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-1-n-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-1-n-residence-v01.png",
        "detail": "Floors 6-9",
        "bedrooms": "4",
        "bathrooms": "5",
        "interiorSqFt": "5385"
      },
      {
        "title": "Tier 1 S Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-1-s-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-1-s-residence-v01.png",
        "detail": "Floors 6-9",
        "bedrooms": "3",
        "bathrooms": "4 + powder",
        "interiorSqFt": "5034",
        "terraceSqFt": "551"
      },
      {
        "title": "Tier 1 W Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-1-w-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-1-w-residence-v01.png",
        "bathrooms": "2 + powder",
        "detail": "Floors 7-8",
        "bedrooms": "2",
        "interiorSqFt": "2196",
        "terraceSqFt": "240"
      },
      {
        "title": "Tier 2 N Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-2-n-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-2-n-residence-v01.png",
        "detail": "Floors 12-18",
        "bedrooms": "4",
        "bathrooms": "5",
        "interiorSqFt": "5177"
      },
      {
        "title": "Tier 2 S Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-2-s-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-2-s-residence-v01.png",
        "detail": "Floors 12-18",
        "bedrooms": "5",
        "bathrooms": "6 + powder",
        "terraceSqFt": "765"
      },
      {
        "title": "Tier 2 W Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-2-w-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-2-w-residence-v01.png",
        "detail": "Floors 12-18",
        "bathrooms": "2 + powder",
        "bedrooms": "2",
        "terraceSqFt": "240"
      },
      {
        "title": "Tier 3 N Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-3-n-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-3-n-residence-v01.png",
        "detail": "Floors 21-24",
        "bedrooms": "3",
        "bathrooms": "4 + powder",
        "interiorSqFt": "4639"
      },
      {
        "title": "Tier 3 S Residence",
        "href": "/assets/projects/south-flagler-house/floorplans/south-flagler-floorplans-tier-3-s-residence-v01.png",
        "sourceAssetRepoPath": "public-projects/south-flagler-house/approved-for-website/floorplans/south-flagler-floorplans-tier-3-s-residence-v01.png",
        "detail": "Floors 21-24",
        "bedrooms": "4",
        "terraceSqFt": "786",
        "bathrooms": "5 + powder",
        "interiorSqFt": "5770"
      }
    ],
    "count": 8
  }
] as const satisfies readonly ApprovedFloorplanProject[];
