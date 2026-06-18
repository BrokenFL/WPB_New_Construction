export type ProjectFactFieldKey =
  | "status"
  | "deliveryTiming"
  | "residenceCount"
  | "address"
  | "priceDisplay"
  | "bedroomRange"
  | "sizeRange"
  | "floorCount"
  | "parking"
  | "storage"
  | "pets"
  | "rentals"
  | "fees"
  | "amenities"
  | "waterfront"
  | "dockage";

export type ProjectFactOverride = {
  value: string;
  source: "manual_review";
  reviewedBy: string;
  reviewedAt: string;
  note?: string;
  schemaSafe?: boolean;
};

export type ProjectFactOverrides = {
  version: number;
  updatedAt: string;
  projects: Partial<Record<string, Partial<Record<ProjectFactFieldKey, ProjectFactOverride>>>>;
};

import projectFactOverridesData from "../../content/overrides/project-fact-overrides.json" with { type: "json" };

export const projectFactOverrides: ProjectFactOverrides = projectFactOverridesData;
