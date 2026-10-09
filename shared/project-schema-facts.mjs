// Guidance remains qualified text. Only an unambiguous total residence count
// becomes a QuantitativeValue; it never describes available inventory.
export function projectSchemaFactProperties(safeFields, structuredDetails = [], schemaType = "ApartmentComplex") {
  const count = String(safeFields.residenceCount || "").trim();
  const isApartmentComplex = [schemaType].flat().includes("ApartmentComplex");
  // Authored detail must not bypass a held residence-count field. Older
  // proposal descriptions can still contain a superseded numeric total.
  const hasApprovedTotal = /^\d+$/.test(count) && Number(count) > 0;
  const details = structuredDetails.filter(({ value }) => {
    const total = String(value).match(/\b(\d[\d,]*)\s+(?:[a-z-]+\s+){0,3}(?:residences|homes|units|apartments)\b/i);
    return !total || (hasApprovedTotal && Number(total[1].replaceAll(",", "")) === Number(count));
  });
  const additionalProperty = [
    ...details,
    ...(count && !hasApprovedTotal ? [{ name: "Published residence offering guidance", value: count }] : []),
    ...(safeFields.status ? [{ name: "Development status", value: safeFields.status }] : []),
    ...(safeFields.delivery ? [{ name: "Delivery guidance", value: safeFields.delivery }] : []),
  ].map(({ name, value }) => ({ "@type": "PropertyValue", name, value }));
  return {
    ...(isApartmentComplex && hasApprovedTotal ? {
      numberOfAccommodationUnits: { "@type": "QuantitativeValue", value: Number(count), unitText: "residences" },
    } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
  };
}

export function floorplanSchemaDescription(planName, projectName) {
  return `View the ${projectName} ${planName} floor-plan guide and drawing references. Confirm the latest developer drawing and residence-specific terms.`;
}

// These exact editorial answers were inspected during the complete schema audit.
// A changed answer needs another review before it can return to JSON-LD.
const reviewedAdviceAnswers = new Set([
  "Confirm live availability, deposit structure, estimated monthly carrying costs, parking, storage, view premiums, completion timing, assignment or resale restrictions, included finishes, and whether the residence line you like is actually available. Public websites set the mood; the current sales packet tells you whether the opportunity still exists.",
  "Use the inquiry page and name the buildings, corridors, budget range, timing, and whether you need floor plans or a sales-gallery visit. The Scott Gordon Group can help request current availability, pricing, floor-plan packets, view-stack context, and items to verify before you tour.",
  "Ask for current estimated monthly costs, reserves, parking/storage details, deposit schedule, and what services are included.",
  "Use price per square foot on comparable residence types, plus monthly fees and tax context, from current verified listings in each market — not press starting prices from one side.",
  "Start with the corridor pages, the comparison page, and the individual project pages for the buildings that match the buyer's lifestyle lane.",
  "Use completed or recently delivered buildings as reality checks for finishes, fees, building operations, and resale alternatives.",
  "Start with the floorplan library, then compare the project page and request the current buyer packet."
]);
export function auditedFaqItems(items) {
  return items.filter(item => reviewedAdviceAnswers.has(String(item.answer ?? item.acceptedAnswer?.text ?? "")));
}

export function nonemptySchemaNodes(nodes) {
  return nodes.filter(n => n?.["@type"] !== "FAQPage" || n.mainEntity?.length);
}
