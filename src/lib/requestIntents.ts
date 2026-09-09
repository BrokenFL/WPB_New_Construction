import {
  normalizeRequestIntent as normalizeSharedRequestIntent,
  normalizeRequestIntentPair as normalizeSharedRequestIntentPair,
  requestIntentById as sharedRequestIntentById,
  requestIntentDefinitions as sharedRequestIntentDefinitions,
} from "../../shared/request-intents.js";

export type RequestIntentId = "availability" | "pricing_packet" | "compare_shortlist" | "project_question" | "conversation_tour";
export type RequestIntentDefinition = {
  id: RequestIntentId;
  interest: string;
  buttonLabel: string;
  summary: string;
  humanResponse: string;
  aliases: readonly string[];
};

export const requestIntentDefinitions = sharedRequestIntentDefinitions as Record<RequestIntentId, RequestIntentDefinition>;
export const requestIntentById = (id: RequestIntentId | string) => sharedRequestIntentById(id) as RequestIntentDefinition | null;
export const normalizeRequestIntent = (value: unknown) => normalizeSharedRequestIntent(value) as RequestIntentDefinition | null;
export const normalizeRequestIntentPair = (requestIntent: unknown, interest: unknown) => normalizeSharedRequestIntentPair(requestIntent, interest) as { definition: RequestIntentDefinition | null; error: string | null };
export const canonicalInterestForIntent = (id: RequestIntentId) => requestIntentDefinitions[id].interest;
