// Project guide supplements consume reviewed authored copy instead of repeating
// a stale second set of core facts. Sources and unreviewed detail stay explicit.
export function projectBuyerGuide(record, copy) {
  if (!copy?.overview || !Array.isArray(copy.quickFacts)) return record;
  const fact = (...labels) => copy.quickFacts.find(item => labels.includes(item.label))?.value;
  const status = fact("Status");
  const delivery = fact("Delivery");
  const price = fact("Price Range", "Pricing");
  const address = fact("Address");
  const count = fact("Residences");
  const requestHref = (href, interest) => {
    if (!href) return href;
    const url = new URL(href, "https://www.wpbnewconstruction.com");
    url.searchParams.set("interest", interest);
    return `${url.pathname}${url.search}${url.hash}`;
  };
  const officialHosts = ["albapalmbeach.com", "livemaisondor.com", "olinpalmbeach.com", "okogroup.com", "relatedgroup.com", "services1.arcgis.com"];
  const sources = [...record.sources || []];
  for (const url of copy.sourceUrls || []) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      if (officialHosts.includes(hostname) && !sources.some(source => source.url === url)) {
        sources.push({ url, label: `Official reference: ${hostname}`, kind: "official" });
      }
    } catch { /* Ignore malformed legacy source URLs. */ }
  }
  return {
    ...record,
    eyebrow: status || record.eyebrow,
    opening: copy.overview,
    buyerFit: copy.bestFor?.join("; ") || record.buyerFit,
    location: address ? `Project address guidance: ${address}. Confirm the property, parcel and sales-gallery addresses in current project documents before arranging a visit.` : record.location,
    status: {
      marketing: [status, price].filter(Boolean).join(". "),
      construction: [status, delivery].filter(Boolean).join(". "),
      availability: "Request current residence-specific availability, pricing and contract terms. Marketing guidance and project counts do not establish available inventory.",
    },
    verifiedFacts: copy.quickFacts
      .filter(item => ["Address", "Status", "Developer", "Design", "Residences", "Price Range", "Pricing", "Delivery"].includes(item.label))
      .map(item => `${item.label}: ${item.value}`),
    residences: [
      ...(count ? [`Residence-count guidance: ${count}. Confirm the current offering and approved program.`] : []),
      ...(copy.residences ? [copy.residences] : []),
      "Confirm the individual residence plan, dimensions, fees and operating terms in current offering documents.",
    ],
    reviewedOn: copy.lastCopyResearchDate || record.reviewedOn,
    sources,
    availabilityHref: requestHref(record.availabilityHref, "Request current availability"),
    packetHref: requestHref(record.packetHref, "Pricing + floor-plan packet"),
  };
}
