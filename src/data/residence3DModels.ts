// Public presentation records only. Source files, Drive locations and audit
// provenance belong in the private asset review, outside this site manifest.
export type Residence3DModel = {
  modelId: string;
  projectId: string;
  residenceSlug: string;
  modelUrl: string;
  posterUrl: string;
  mobilePosterUrl?: string;
  status: "pending" | "approved";
  type: "interactive-floorplan";
  furnished: boolean;
  cutaway: boolean;
  accessibilityLabel: string;
  updatedOn: string;
  // Optional public developer drawing when a visualization uses another revision.
  sourceDrawingUrl?: string;
  camera?: {
    position?: [number, number, number];
    target?: [number, number, number];
    minDistance?: number;
    maxDistance?: number;
  };
};

const model = (projectId: string, residenceSlug: string, accessibilityLabel: string, updatedOn = "2026-09-25"): Residence3DModel => ({
  modelId: `${projectId}-${residenceSlug}-3d-v01`,
  projectId, residenceSlug,
  modelUrl: `/assets/projects/${projectId}/3d/${residenceSlug}/model.glb`,
  posterUrl: `/assets/projects/${projectId}/3d/${residenceSlug}/poster.webp`,
  mobilePosterUrl: `/assets/projects/${projectId}/3d/${residenceSlug}/poster-mobile.webp`,
  status: "approved",
  type: "interactive-floorplan",
  furnished: true,
  cutaway: true,
  accessibilityLabel,
  updatedOn,
});

// Exact reviewed rollout scope. The 1153_0704 Shorecrest source is one
// Residence 0704 entry; there is no separate Residence 1153 entity.
export const residence3DModels: readonly Residence3DModel[] = [
  model("olara", "residence-c", "Interactive 3D floor plan of Olara Residence C"),
  model("olara", "residence-d", "Interactive 3D floor plan of Olara Residence D"),
  model("shorecrest", "residence-0704", "Interactive 3D floor plan of Shorecrest Residence 0704"),
  model("shorecrest", "residence-1602", "Interactive 3D floor plan of Shorecrest Residence 1602"),
  model("ritz-carlton-wpb", "residence-02", "Interactive 3D floor plan of Ritz-Carlton Residence 02"),
  model("ritz-carlton-wpb", "residence-06", "Interactive 3D floor plan of Ritz-Carlton Residence 06"),
  { ...model("mr-c", "residence-01a", "Interactive 3D floor plan of Mr. C Residence 01A", "2026-09-27") },
  { ...model("mr-c", "residence-02a", "Interactive 3D floor plan of Mr. C Residence 02A", "2026-09-27") },
  { ...model("berkeley", "residence-d", "Interactive 3D floor plan of The Berkeley Residence D", "2026-09-27"),
    sourceDrawingUrl: "https://www.theberkeleypalmbeach.com/wp-content/uploads/2024/09/UNIT-D-Berkeley-1.pdf" },
  { ...model("berkeley", "residence-g", "Interactive 3D floor plan of The Berkeley Residence G", "2026-09-27"),
    sourceDrawingUrl: "https://www.theberkeleypalmbeach.com/wp-content/uploads/2024/09/UNIT-G-Berkeley-1.pdf" },
];

export function residence3DModelsForPlan(projectId: string, residenceSlug: string): Residence3DModel[] {
  return residence3DModels.filter((item) => item.projectId === projectId && item.residenceSlug === residenceSlug);
}
