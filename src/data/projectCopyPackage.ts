export type ProjectQuickFact = {
  label: string;
  value: string;
};

export type ProjectShowcaseImage = {
  src: string;
  label: string;
  alt?: string;
};

export type ProjectShowcaseResidence = {
  title: string;
  beds: string;
  size: string;
  price: string;
  thumbnail?: string;
};

export type ProjectShowcaseAmenity = {
  icon: string;
  label: string;
};

export type ProjectShowcaseFact = {
  icon: string;
  label: string;
  value: string;
};

export type ProjectShowcaseTeamFact = {
  label: string;
  value: string;
};

export type ProjectShowcaseTag = {
  label: string;
  value: string;
};

export type ProjectShowcaseConfig = {
  template: "editorial-showcase";
  heroEyebrow?: string;
  heroBlurb?: string;
  heroImage?: ProjectShowcaseImage;
  intro?: string;
  heroTags?: ProjectShowcaseTag[];
  factStrip?: ProjectShowcaseFact[];
  monogram?: string;
  titleLines?: string[];
  visualBreak?: ProjectShowcaseImage;
  neighborhoodImage?: ProjectShowcaseImage;
  neighborhoodHeadline?: string;
  residenceSectionLabel?: string;
  residenceSectionLinkText?: string;
  residenceSectionLinkHref?: string;
  galleryLayout?: "carousel" | "grid";
  gallery?: ProjectShowcaseImage[];
  residenceCollections?: ProjectShowcaseResidence[];
  amenityHighlights?: ProjectShowcaseAmenity[];
  projectTeam?: ProjectShowcaseTeamFact[];
};

export type ProjectCopyPackage = {
  slug: string;
  repoProjectId: string;
  pageTemplate?: "editorial-showcase";
  showcase?: ProjectShowcaseConfig;
  heroHeadline?: string;
  heroSubheadline?: string;
  overview?: string;
  quickFacts?: ProjectQuickFact[];
  residences?: string;
  amenities?: string;
  location?: string;
  localTake?: string;
  seoTitle?: string;
  metaDescription?: string;
  badge?: string;
  tags?: string[];
  introHeadline: string;
  introDek: string;
  brookeTake: string;
  bestFor: string[];
  signatureFeatures: string[];
  amenityNarrative: string;
  residenceNarrative: string;
  locationNarrative: string;
  projectTeamNarrative: string;
  sourceUrls: string[];
  lastCopyResearchDate: string;
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
    batch1ProjectCopyByProjectId.set(record.slug, record);
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
    batch1ProjectCopyByProjectId.set(record.slug, record);
  }
  return batch1ProjectCopyByProjectId;
}
