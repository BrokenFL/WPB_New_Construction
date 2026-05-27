import projectAssetsRaw from "../../data/project_assets.json";

export type ProjectAssetPlacement = "hero" | "residences" | "amenities" | "neighborhood" | "logos" | "team";
export type ProjectAssetStatus = "approved";

export type ProjectAsset = {
  placement: ProjectAssetPlacement;
  variant?: string;
  src: string;
  alt: string;
  title: string;
  credit: string;
  source: string;
  status: ProjectAssetStatus;
  notes?: string;
};

export type ProjectAssetRecord = {
  projectId: string;
  slug: string;
  aliases?: string[];
  assets: ProjectAsset[];
};

type ProjectAssetRegistry = {
  projects: Record<string, ProjectAssetRecord>;
};

type ProjectAssetLookupTarget = {
  id?: string;
  projectId?: string;
  slug?: string;
};

const projectAssetRegistry = projectAssetsRaw as ProjectAssetRegistry;

function projectLookupKeys(project: string | ProjectAssetLookupTarget) {
  if (typeof project === "string") return [project];
  return [project.projectId, project.id, project.slug].filter(Boolean) as string[];
}

function projectRecordFor(project: string | ProjectAssetLookupTarget) {
  const keys = projectLookupKeys(project);
  for (const key of keys) {
    const direct = projectAssetRegistry.projects[key];
    if (direct) return direct;
    const aliased = Object.values(projectAssetRegistry.projects).find((record) => record.aliases?.includes(key));
    if (aliased) return aliased;
  }
  return undefined;
}

export function getApprovedProjectAssets(project: string | ProjectAssetLookupTarget) {
  return projectRecordFor(project)?.assets.filter((asset) => asset.status === "approved") ?? [];
}

export function getProjectAsset(project: string | ProjectAssetLookupTarget, placement: ProjectAssetPlacement) {
  return getApprovedProjectAssets(project).find((asset) => asset.placement === placement);
}

export function getProjectHeroAsset(project: string | ProjectAssetLookupTarget) {
  return getApprovedProjectAssets(project).find((asset) => asset.placement === "hero" && asset.variant === "primary")
    ?? getProjectAsset(project, "hero");
}

export function getProjectGalleryAsset(project: string | ProjectAssetLookupTarget, variant: ProjectAssetPlacement | string) {
  return getApprovedProjectAssets(project).find((asset) => asset.placement === variant || asset.variant === variant);
}
