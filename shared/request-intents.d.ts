export type SharedRequestIntentDefinition = {
  id: "availability" | "pricing_packet" | "compare_shortlist" | "project_question" | "conversation_tour";
  interest: string;
  buttonLabel: string;
  summary: string;
  humanResponse: string;
  aliases: readonly string[];
};
export const requestIntentDefinitions: Readonly<Record<string, SharedRequestIntentDefinition>>;
export function normalizeRequestIntent(value: unknown): SharedRequestIntentDefinition | null;
export function normalizeRequestIntentPair(requestIntent: unknown, interest: unknown): { definition: SharedRequestIntentDefinition | null; error: string | null };
export function requestIntentById(id: unknown): SharedRequestIntentDefinition | null;
