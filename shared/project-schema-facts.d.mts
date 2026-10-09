export function projectSchemaFactProperties(
  safeFields: { residenceCount?: string; status?: string; delivery?: string },
  structuredDetails?: Array<{ name: string; value: string }>,
  schemaType?: string | string[],
): {
  numberOfAccommodationUnits?: { "@type": string; value: number; unitText: string };
  additionalProperty?: Array<{ "@type": string; name: string; value: string }>;
};
export function floorplanSchemaDescription(planName: string, projectName: string): string;

export function auditedFaqItems<T extends { answer?: string; acceptedAnswer?: { text: string } }>(items: readonly T[]): T[];

export function nonemptySchemaNodes<T>(nodes: readonly T[]): T[];
