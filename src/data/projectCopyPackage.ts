export type ProjectCopyConfidence = "high" | "medium" | "needs-source-confirmation";

export type ProjectCopyPackage = {
  slug: string;
  repoProjectId: string;
  introHeadline: string;
  introDek: string;
  brookeTake: string;
  bestFor: string[];
  signatureFeatures: string[];
  amenityNarrative: string;
  residenceNarrative: string;
  locationNarrative: string;
  buyerComparisonNotes: string;
  projectTeamNarrative: string;
  sourceNotes: string[];
  sourceUrls: string[];
  lastCopyResearchDate: string;
  copyConfidence: ProjectCopyConfidence;
};

export const batch1ProjectCopyByProjectId = new Map<string, ProjectCopyPackage>();

export function loadBatch1ProjectCopyPackageSync() {
  if (batch1ProjectCopyByProjectId.size) return batch1ProjectCopyByProjectId;
  const request = new XMLHttpRequest();
  request.open("GET", "/data/project-copy-package.json", false);
  request.send();
  if (request.status < 200 || request.status >= 300) {
    throw new Error(`Project copy package failed to load: ${request.status}`);
  }
  const records = JSON.parse(request.responseText) as ProjectCopyPackage[];
  for (const record of records) {
    batch1ProjectCopyByProjectId.set(record.repoProjectId, record);
  }
  return batch1ProjectCopyByProjectId;
}

export async function loadBatch1ProjectCopyPackage() {
  if (batch1ProjectCopyByProjectId.size) return batch1ProjectCopyByProjectId;
  const response = await fetch("/data/project-copy-package.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Project copy package failed to load: ${response.status}`);
  const records = await response.json() as ProjectCopyPackage[];
  for (const record of records) {
    batch1ProjectCopyByProjectId.set(record.repoProjectId, record);
  }
  return batch1ProjectCopyByProjectId;
}
