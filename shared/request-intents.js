const definitions = [
  {
    id: "availability",
    interest: "Request current availability",
    buttonLabel: "Request current availability",
    summary: "Current availability",
    humanResponse: "Brooke and the team will confirm the current information and respond.",
    aliases: [
      "availability",
      "Request current availability",
      "Send current availability",
      "current availability",
    ],
  },
  {
    id: "pricing_packet",
    interest: "Get pricing + floor-plan packet",
    buttonLabel: "Get pricing + floor-plan packet",
    summary: "Pricing + floor-plan packet",
    humanResponse: "Brooke and the team will prepare or confirm the current packet and respond.",
    aliases: [
      "pricing_packet",
      "pricing-packet",
      "Get pricing + floor-plan packet",
      "Pricing + floor-plan packet",
      "Request private floor-plan packet",
      "Request current packet",
      "Request Floorplans",
      "floorplans",
      "floor plans",
      "packet",
    ],
  },
  {
    id: "compare_shortlist",
    interest: "Compare my shortlist",
    buttonLabel: "Compare my shortlist",
    summary: "Shortlist comparison",
    humanResponse: "Brooke and the team will review the buildings you explicitly selected and respond.",
    aliases: [
      "compare_shortlist",
      "Compare my shortlist",
      "Compare buildings",
      "shortlist",
    ],
  },
  {
    id: "project_question",
    interest: "Ask about this project / plan",
    buttonLabel: "Ask about this project / plan",
    summary: "Project / plan question",
    humanResponse: "Brooke and the team will review your question and respond with the current information they can verify.",
    aliases: [
      "project_question",
      "Ask about this project / plan",
      "Ask the team about this building",
      "Ask What Is Currently Known",
      "Request project updates",
    ],
  },
  {
    id: "conversation_tour",
    interest: "Schedule a conversation or tour",
    buttonLabel: "Schedule a conversation or tour",
    summary: "Conversation / tour request",
    humanResponse: "Brooke and the team will respond to confirm a conversation or tour; this request does not book an appointment.",
    aliases: [
      "conversation_tour",
      "Schedule a conversation or tour",
      "Schedule private tour",
      "private tour",
    ],
  },
];

function key(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const requestIntentDefinitions = Object.freeze(
  Object.fromEntries(definitions.map((definition) => [definition.id, Object.freeze({ ...definition, aliases: Object.freeze([...definition.aliases]) })])),
);

const aliases = new Map();
for (const definition of Object.values(requestIntentDefinitions)) {
  for (const alias of [definition.id, definition.interest, definition.buttonLabel, ...definition.aliases]) {
    aliases.set(key(alias), definition);
  }
}

export function normalizeRequestIntent(value) {
  const normalized = key(value);
  return normalized ? aliases.get(normalized) ?? null : null;
}

export function normalizeRequestIntentPair(requestIntent, interest) {
  const rawIntent = String(requestIntent ?? "").trim();
  const rawInterest = String(interest ?? "").trim();
  const explicit = rawIntent ? normalizeRequestIntent(rawIntent) : null;
  const fromInterest = rawInterest ? normalizeRequestIntent(rawInterest) : null;

  if (rawIntent && !explicit) {
    return { definition: null, error: "unknown_request_intent" };
  }
  if (rawInterest && !fromInterest) {
    return { definition: null, error: "unknown_interest" };
  }
  if (explicit && fromInterest && explicit.id !== fromInterest.id) {
    return { definition: null, error: "conflicting_request_intent" };
  }
  return { definition: explicit ?? fromInterest ?? null, error: null };
}

export function requestIntentById(id) {
  return requestIntentDefinitions[String(id ?? "")] ?? null;
}
