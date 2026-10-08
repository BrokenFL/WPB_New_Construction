// Project identity and city come from the reviewed public model. Editorial
// metadata comes from the authored copy package in both rendering paths.
export function projectPageHeading(name, corridorKey) {
  const city = corridorKey === "palm-beach" ? "Palm Beach" : "West Palm Beach";
  const label = /^nora house$/i.test(name) ? "NORA House" : name;
  if (label.toLowerCase().includes(city.toLowerCase())) return label;
  return `${label}${/Palm Beach/i.test(label) ? " in " : " "}${city}`;
}

export function projectPageSeo(project, copy) {
  if (project.id === "the-sound-west-palm-beach") {
    return {
      title: "The Sound Apartments West Palm Beach | Rental Guide",
      description: "Track The Sound Apartments at 8111 South Dixie Highway: rental status, 358 apartments, amenities, Trader Joe’s, timeline, and leasing details to verify.",
    };
  }
  return {
    title: copy?.seoTitle || `${projectPageHeading(project.name, project.corridorKey)} | Buyer Guide`,
    description: copy?.metaDescription || project.summary || `${projectPageHeading(project.name, project.corridorKey)} project guide and buyer verification notes.`,
  };
}
