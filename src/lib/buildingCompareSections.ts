import type { BuildingDatabaseField } from "./buildingDatabase";

export type CompareSection = {
  title: string;
  rows: Array<[string, BuildingDatabaseField]>;
};

export const compareSections: CompareSection[] = [
  {
    title: "Snapshot",
    rows: [
      ["Corridor", "corridor"],
      ["Status", "development_stage"],
      ["Construction", "construction_status"],
      ["Delivery", "completion_or_delivery"],
      ["Price Range", "price_display"],
      ["Est. Maintenance", "maintenance_per_sqft"],
      ["Deposit Structure", "deposit_structure"],
      ["Buyer Cost Notes", "buyer_cost_notes"],
    ],
  },
  {
    title: "Residences",
    rows: [
      ["Residences", "residence_count"],
      ["Building Type", "building_type"],
      ["Bedrooms", "bedroom_range_display"],
      ["Sizes", "size_range_display"],
      ["Floorplans", "floorplan_status"],
      ["Residence Features", "residence_features"],
      ["Outdoor Space", "outdoor_space_summary"],
      ["Views / Exposure", "view_exposure_notes"],
      ["Elevator Entry", "elevator_entry"],
      ["Furnished Options", "furnished_options"],
    ],
  },
  {
    title: "Lifestyle & Services",
    rows: [
      ["Amenities", "amenity_summary"],
      ["Amenity Highlights", "amenity_highlights"],
      ["Wellness", "wellness_summary"],
      ["Dining", "dining_summary"],
      ["Private Lounge / Club", "private_club_or_resident_lounge"],
      ["Guest Suites", "guest_suite_summary"],
      ["Service", "service_summary"],
      ["Concierge / Valet", "concierge_valet_summary"],
      ["Parking", "parking_summary"],
      ["Storage", "storage_summary"],
      ["Pets", "pet_summary"],
      ["Rental Policy", "rental_policy_summary"],
    ],
  },
  {
    title: "Location",
    rows: [
      ["Neighborhood", "neighborhood"],
      ["Walkability", "walkability_summary"],
      ["Waterfront", "waterfront_status"],
      ["Palm Beach Access", "palm_beach_access_summary"],
      ["Boating / Marina", "boating_or_marina_summary"],
      ["Nearby Districts", "nearby_districts"],
      ["Landmarks", "distance_landmarks"],
    ],
  },
  {
    title: "Project Team",
    rows: [
      ["Developer", "developer"],
      ["Architect", "architect"],
      ["Interior Designer", "interior_designer"],
      ["Landscape Architect", "landscape_architect"],
      ["Brand / Hospitality Partner", "brand_or_hospitality_partner"],
      ["Sales Team", "sales_team"],
      ["Construction Team", "construction_team"],
    ],
  },
  {
    title: "Buyer Fit",
    rows: [
      ["Best For", "best_for"],
      ["Trade-offs", "tradeoffs"],
      ["Compare Against", "compare_against"],
      ["Strongest Compare Points", "strongest_compare_points"],
      ["Apples-to-Apples Notes", "apples_to_apples_notes"],
      ["Verify Next", "buyer_questions_to_verify"],
    ],
  },
];
