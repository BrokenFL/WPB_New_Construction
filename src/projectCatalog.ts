import { proposalScenarios } from "./proposals";

export type ProjectCatalogEntry = {
  scenarioId: string;
  scenarioName: string;
  projectId: string;
  projectName: string;
  address: string;
  status: string;
  confidence: string;
  modeledCoordinates: {
    longitude: number;
    latitude: number;
  };
  modeledHeightMeters: number;
  modeledFootprintMeters: {
    width: number;
    depth: number;
  };
  floors: number;
  targetYear: number;
  sourceUrls: string[];
  modelingNote?: string;
};

export const projectCatalog: ProjectCatalogEntry[] = proposalScenarios.flatMap((scenario) =>
  scenario.buildings.map((building) => ({
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    projectId: building.id,
    projectName: building.name,
    address: building.address,
    status: building.status,
    confidence: building.confidence,
    modeledCoordinates: {
      longitude: building.longitude,
      latitude: building.latitude,
    },
    modeledHeightMeters: building.heightMeters,
    modeledFootprintMeters: {
      width: building.widthMeters,
      depth: building.depthMeters,
    },
    floors: building.floors,
    targetYear: building.year,
    sourceUrls: building.sourceUrls,
    modelingNote: building.modelingNote,
  })),
);
