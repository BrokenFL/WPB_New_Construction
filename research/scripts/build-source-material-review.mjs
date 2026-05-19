import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const assetRoot = path.join(workspace, "research/asset-library");
const projectsRoot = path.join(assetRoot, "projects");
const reviewRoot = path.join(workspace, "research/source-material-review");

const manualFindings = {
  "olara": {
    area: "North Flagler",
    pageStatus: "Primary condo page",
    normalizedFacts: {
      address: "1919 N Flagler Dr",
      residences: "275",
      stories: "26",
      completion: "2028 per current official/download material",
      pricing: "From roughly $1.7M in official fact material; verify live availability",
      team: "Savanna; Arquitectonica; Gabellini Sheppard; EDSA; SavCon/Gilbane; Compass Development Marketing Group",
    },
    highValueSources: [
      "https://www.olarawestpalmbeach.com/",
      "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara-Fact-Sheet-March-2026-2.pdf",
      "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/RackBrochure_Digital_032026.pdf",
      "https://d3af2gfyi5943v.cloudfront.net/app/uploads/2026/03/Olara_Amenities_DigitalBrochure_032026.pdf",
    ],
    assetNotes: [
      "Strong official PDF set and waterfront rendering candidates.",
      "Use official imagery only after rights/permission review.",
    ],
    conflicts: [
      "Some third-party material says 2027 delivery; current official download material points to 2028.",
    ],
    gaps: [
      "Need official floor-plan PDF library URL(s) if detailed unit pages are being built.",
    ],
  },
  "ritz-carlton-wpb": {
    area: "North Flagler",
    pageStatus: "Primary condo page",
    normalizedFacts: {
      address: "Use 1717 N Flagler Dr as developer/legal address until offering docs confirm 1745 N Flagler footer reference",
      residences: "138 official/developer count",
      stories: "27",
      completion: "Expected 2028",
      pricing: "From about $3M on current official/developer material; verify live inventory",
      team: "Related Group; BH Group; Arquitectonica; Rockwell Group; Naturalficial",
    },
    highValueSources: [
      "https://theresidenceswestpalmbeach.com/",
      "https://relatedgroup.com/properties/the-ritz-carlton-residences-west-palm-beach/",
      "https://theresidenceswestpalmbeach.com/gallery/",
      "https://www.flipsnack.com/relatedgroup/ritzwpb-floorplans/full-view.html",
      "https://www.flipsnack.com/relatedgroup/ritzwpb-brochure/full-view.html",
    ],
    assetNotes: [
      "Official site has strong renderings and direct PDF floor plans.",
      "The Boundary page is useful design context, but not a rights-cleared publishing source.",
    ],
    conflicts: [
      "Address conflict: 1717 N Flagler, 1745 N Flagler, and Related/legal naming appear in different official contexts.",
      "Some broker/vendor pages say 144 residences; official/developer material supports 138.",
    ],
    gaps: [
      "Confirm final public street address against offering/prospectus material.",
    ],
  },
  "shorecrest": {
    area: "North Flagler",
    pageStatus: "Primary condo page",
    normalizedFacts: {
      address: "1865 N Flagler Dr is the newer official fact-sheet address; keep 1901 N Flagler as a conflict note",
      residences: "100 per newer official fact sheet; older app data currently has 98",
      stories: "28",
      completion: "Expected 2027",
      pricing: "From about $3M in Related Ross/current reporting; verify live inventory",
      team: "Related Ross; Roger Ferris + Partners; Revuelta; Rottet Studio; DS Boca; Related Sales/Corcoran Sunshine",
    },
    highValueSources: [
      "https://www.shorecrestwpb.com/",
      "https://www.shorecrestwpb.com/sites/g/files/ujywhv436/files/2026-02/Shorecrest%20West%20Palm%20Beach%20Fact%20Sheet.pdf",
      "https://www.shorecrestwpb.com/sites/g/files/ujywhv436/files/2025-06/SHC_Rack%20Brochure_0625.pdf",
      "https://www.shorecrestwpb.com/floorplans",
    ],
    assetNotes: [
      "Official floor-plan PDFs and fact sheets are high-value.",
      "There are old and newer official PDFs, so file dates matter.",
    ],
    conflicts: [
      "Address conflict: 1865 N Flagler vs 1901 N Flagler.",
      "Residence-count conflict: newer official material says 100; older/site records and app data can show 98 or 199.",
    ],
    gaps: [
      "Decide whether app data should show 100 residences from newer official material.",
      "Confirm final legal address before publishing detailed SEO copy.",
    ],
  },
  "alba-palm-beach": {
    area: "North Flagler",
    pageStatus: "Primary condo page",
    normalizedFacts: {
      address: "4714 N Flagler Dr",
      residences: "55",
      stories: "22",
      completion: "Closings commence June 2026 per official popup; press also says early/Spring 2026",
      pricing: "Starting just under $3M in official/current material; verify live inventory",
      team: "BGI/Kenneth Baboun; Blue Road; Spina O'Rourke + Partners; Schmidt Nichols; Moss Construction; One Sotheby's",
    },
    highValueSources: [
      "https://www.albapalmbeach.com/",
      "https://www.albapalmbeach.com/wp-content/uploads/Alba-Brochure_Unbranded.pdf",
      "https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf",
      "https://www.albapalmbeach.com/construction-live-cam/",
    ],
    assetNotes: [
      "Official brochure and floor-plan PDFs are present and should be promoted into the app data.",
      "Construction live cam is useful for status verification, not a marketing asset.",
    ],
    conflicts: [
      "Delivery language differs between official popup and press coverage.",
    ],
    gaps: [
      "Need live inventory and final delivery status near launch because this one is closest to completion.",
    ],
  },
  "mr-c": {
    area: "Downtown",
    pageStatus: "Primary mixed-use/hotel-residence page",
    normalizedFacts: {
      address: "Keep 320 Lakeview Ave as common project address; note 327 Okeechobee Blvd fact-sheet location and 401 S Olive sales gallery",
      residences: "146 private residences plus 110 hotel suites",
      stories: "27",
      completion: "Construction started/financed in 2025; completion needs live confirmation",
      pricing: "Request current pricing",
      team: "Terra; Sympatico; Mr. C/Cipriani; Arquitectonica; Meyer Davis; Landscape Design Workshop; Douglas Elliman Development Marketing",
    },
    highValueSources: [
      "https://www.mrcresidenceswpb.com/",
      "https://www.mrcresidenceswpb.com/gallery/",
      "https://www.mrcresidenceswpb.com/downloads/",
      "https://www.mrcresidenceswpb.com/wp-content/uploads/MrC_FactSheet_Aug24_digi_1.pdf",
    ],
    assetNotes: [
      "Official gallery has many strong renderings.",
      "Official floor-plan PDFs are available by residence number.",
    ],
    conflicts: [
      "Address conflict: 320 Lakeview Ave, 327 Okeechobee Blvd, and 401 S Olive sales gallery.",
      "Older reporting says 25 stories; official/current residence material supports 27.",
    ],
    gaps: [
      "Need a clean rule for showing both project address and sales gallery without confusing users.",
      "Need verified current delivery date.",
    ],
  },
  "nora-house": {
    area: "Downtown / NORA",
    pageStatus: "Primary condo page",
    normalizedFacts: {
      address: "1105 N Dixie Highway for project/site context; 955 N Railroad Avenue is sales office",
      residences: "117",
      stories: "11",
      completion: "Construction planned 2027 with finish around 2029 per March 2026 reporting",
      pricing: "Official high $1Ms; reporting says roughly $2M to $6.5M",
      team: "The Ronto Group; Wheelock Street Capital; Swedroe Architecture; Lillian Wu Studio; Conner & Gaskins; Design Studio Boca",
    },
    highValueSources: [
      "https://norahouse.com/",
      "https://norahouse.com/amenities/",
      "https://norahouse.com/team/",
      "https://norahouse.com/floorplan/residence-01/",
      "https://norawpb.com/wp-content/uploads/2026/03/The-Real-Deal-Ronto-partners-launch-Nora-House-condos-in-West-Palm-Beach-3.23.26.pdf",
    ],
    assetNotes: [
      "Official site images are good page candidates; separate NORA district assets from NORA House assets.",
      "Residence 01 provides at least one concrete floor-plan data point.",
    ],
    conflicts: [
      "Address conflict: project site vs sales office.",
      "117 residences in new sales material vs earlier 122-condo planning coverage.",
      "Pricing conflict between official high $1Ms language and reporting's $2M to $6.5M range.",
    ],
    gaps: [
      "Need more direct downloadable floor-plan and brochure material.",
      "Need decide whether NORA district context gets its own overview page.",
    ],
  },
  "banyan-tree": {
    area: "Downtown",
    pageStatus: "High-priority emerging condo page",
    normalizedFacts: {
      address: "400 Hibiscus St",
      residences: "88 in project/sales language; city PPRC material has 86 dwelling units",
      stories: "25",
      pricing: "From about $1.9M in reporting; verify official availability",
      team: "Mast Capital; Curated JCZM; Banyan Group; OMA; Yabu Pushelberg; Enzo Enea",
    },
    highValueSources: [
      "https://banyantreeresidenceswpb.com/",
      "https://floridayimby.com/",
    ],
    assetNotes: [
      "Official site needs a deeper second pass for PDFs and gallery extraction.",
    ],
    conflicts: [
      "Residence count conflict: 88 in sales/developer language vs 86 in city PPRC context.",
    ],
    gaps: [
      "Need official brochure, floor plans, and city record packet.",
    ],
  },
  "south-flagler-house-north": {
    area: "South Flagler",
    pageStatus: "Primary condo page; pair with south tower in copy",
    normalizedFacts: {
      address: "1355 S Flagler Dr",
      residences: "108 in official site/fact material for full project; Related Ross loan release says 105",
      stories: "Two 28-story towers",
      completion: "Expected/delivering 2027",
      pricing: "Official availability ranges change by date; show request current pricing unless using a dated table",
      team: "Related Ross; Robert A.M. Stern Architects; Pembrooke & Ives; SMI Landscape Architecture",
    },
    highValueSources: [
      "https://www.southflaglerhouse.com/",
      "https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf",
      "https://www.relatedross.com/press-releases/2025-06-23/related-ross-secures-400-million-construction-loan-south-flagler-house",
    ],
    assetNotes: [
      "Official renderings and amenity/site-plan images are strong; use as rights-review candidates.",
      "Treat north/south tower folders as one content story unless individual unit inventory exists.",
    ],
    conflicts: [
      "Residence count conflict: 108 vs 105 depending on official/developer source date.",
      "Pricing availability varies by date.",
    ],
    gaps: [
      "No complete public floor-plan PDF library found beyond site-plan/tier imagery.",
    ],
  },
  "south-flagler-house-south": {
    area: "South Flagler",
    pageStatus: "Primary condo page; merge content with north tower unless separate inventory is required",
    normalizedFacts: {
      address: "1355 S Flagler Dr",
      residences: "Part of the full South Flagler House residence count",
      stories: "28",
      completion: "Expected/delivering 2027",
      team: "Related Ross; Robert A.M. Stern Architects; Pembrooke & Ives; SMI Landscape Architecture",
    },
    highValueSources: [
      "https://www.southflaglerhouse.com/",
      "https://www.southflaglerhouse.com/sites/g/files/ujywhv446/files/2025-05/SFH_Fact%20Sheet_0425.pdf",
    ],
    assetNotes: [
      "Use shared South Flagler House materials; avoid duplicating exact same copy on both tower pages.",
    ],
    conflicts: [
      "Same full-project count and pricing conflicts as north tower.",
    ],
    gaps: [
      "Need decide whether this remains a separate card or becomes one South Flagler House page.",
    ],
  },
  "edgeworth-north": {
    area: "South Flagler",
    pageStatus: "High-priority pipeline condo page",
    normalizedFacts: {
      address: "1155 S Flagler Dr",
      residences: "168 in Related Ross launch material; MAWD page says 187",
      stories: "Two 28-story towers",
      completion: "2029 in design-team material",
      pricing: "$2.5M to $35.5M in launch/reporting material",
      team: "Related Ross; KPF; MAWD/March and White",
    },
    highValueSources: [
      "https://edgeworthwpb.com/",
      "https://www.relatedross.com/",
      "https://mawd.co/",
    ],
    assetNotes: [
      "Official hero/renderings exist but brochure/floor plans were not found.",
    ],
    conflicts: [
      "Residence count conflict: Related Ross 168 vs MAWD 187.",
    ],
    gaps: [
      "Need official brochure/fact sheet/floor plans.",
    ],
  },
  "edgeworth-south": {
    area: "South Flagler",
    pageStatus: "High-priority pipeline condo page; pair with north tower",
    normalizedFacts: {
      address: "1155 S Flagler Dr",
      residences: "Part of the full Edgeworth count",
      stories: "28",
      completion: "2029 in design-team material",
      team: "Related Ross; KPF; MAWD/March and White",
    },
    highValueSources: [
      "https://edgeworthwpb.com/",
      "https://www.relatedross.com/",
    ],
    assetNotes: [
      "Use shared Edgeworth materials; avoid duplicated SEO copy between tower records.",
    ],
    conflicts: [
      "Same residence-count conflict as north tower.",
    ],
    gaps: [
      "Need official brochure/fact sheet/floor plans.",
    ],
  },
  "forte-on-flagler": {
    area: "South Flagler",
    pageStatus: "Completed/recent-delivery condo page",
    normalizedFacts: {
      address: "1309 S Flagler Dr for project context; listings may use 1333 S Flagler unit addresses",
      residences: "41",
      stories: "25 in newer construction/reporting; older material can say 24",
      completion: "Topped off April 2024; expected completion Q1 2025 in reporting, needs current building/listing confirmation",
      team: "Two Roads; Alpha Blue; Arquitectonica; Jean-Louis Deniot",
    },
    highValueSources: [
      "https://fortewpb.com/",
      "https://fortewpb.com/wp-content/uploads/Digital-Flipbook.pdf",
      "https://fortewpb.com/wp-content/uploads/North-Open-Kitchen-Plan.pdf",
      "https://fortewpb.com/wp-content/uploads/South-Open-Kitchen.pdf",
    ],
    assetNotes: [
      "Official flipbook and plan PDFs are already high-value content.",
    ],
    conflicts: [
      "Project address vs listing/unit address differences.",
      "24 vs 25 stories across older/current material.",
    ],
    gaps: [
      "Need current completion/delivery confirmation from building records or active listings.",
    ],
  },
  "fort-partners-south-flagler": {
    area: "South Flagler",
    pageStatus: "Watch-list only",
    normalizedFacts: {
      address: "3901 S Flagler Dr / Harbor Towers assemblage, plus nearby Washington Rd and S Flagler parcels",
      status: "Assemblage/watch-list; no public branded condo project yet",
      team: "Fort Partners / Nadim Ashi",
    },
    highValueSources: [
      "https://therealdeal.com/",
      "https://traded.co/",
    ],
    assetNotes: [
      "Do not publish as an active condo page until official project material exists.",
    ],
    conflicts: [],
    gaps: [
      "No project name, unit count, height, architect, delivery, pricing, official site, brochure, or renderings.",
    ],
  },
};

const pipelineOnly = new Set([
  "10-cityplace",
  "15-cityplace",
  "related-ross-fern-street",
  "rybovich-marina",
  "fort-partners-south-flagler",
  "portofino-flagler-yacht-club",
]);

async function main() {
  await fs.mkdir(reviewRoot, { recursive: true });

  const manifest = JSON.parse(await fs.readFile(path.join(assetRoot, "asset-manifest.json"), "utf8"));
  const catalog = {
    generatedAt: new Date().toISOString(),
    basedOnAssetManifestGeneratedAt: manifest.generatedAt,
    sourceRepo: manifest.sourceRepo,
    sourceRepoCommit: manifest.sourceRepoCommit,
    usageNote:
      "This is a sorting and review layer over the raw asset library. Keep official/public facts separate from third-party reporting and clear image/document rights before publishing.",
    totals: {
      projects: manifest.projects.length,
      downloadedPdfs: 0,
      downloadedImages: 0,
      sourcePages: 0,
      officialSourceUrls: 0,
      reportingSourceUrls: 0,
    },
    areas: {},
    projects: [],
  };

  for (const project of manifest.projects) {
    const metadata = JSON.parse(
      await fs.readFile(path.join(projectsRoot, project.projectId, "metadata.json"), "utf8"),
    );
    const manual = manualFindings[project.projectId] ?? {};
    const downloads = project.downloadedAssets ?? metadata.downloadedAssets ?? [];
    const pdfs = downloads.filter((asset) => asset.kind === "pdf");
    const images = downloads.filter((asset) => asset.kind === "image");
    const sourcePages = metadata.crawlFindings?.pages?.length ?? metadata.crawlSummary?.pagesCrawled ?? 0;
    const sourceUrls = unique([
      ...((metadata.sourceUrls ?? project.sourceUrls) ?? []),
      ...(manual.highValueSources ?? []),
    ]);
    const sourceBuckets = bucketSources(sourceUrls, metadata.officialWebsite);
    const manualAssetLinks = (manual.highValueSources ?? []).map((url) => ({
      label: path.basename(safePathname(url)) || url,
      url,
      type: inferAssetType(url),
      source: "agent-findings",
    }));
    const assetBuckets = bucketAssets(
      downloads,
      [...(metadata.assetLinks ?? project.knownAssetLinks ?? []), ...manualAssetLinks],
    );
    const area = manual.area ?? inferArea(metadata);
    const pageStatus = manual.pageStatus ?? inferPageStatus(project.projectId, metadata);
    const conflicts = unique([...(manual.conflicts ?? []), ...extractNoteConflicts(metadata.notes)]);
    const gaps = unique([...(manual.gaps ?? []), ...inferGaps(assetBuckets, metadata, pageStatus)]);
    const confidence = normalizeConfidence(metadata.confidence, conflicts, gaps, sourceBuckets);
    const rightsStatus = images.length > 0 ? "Rights review required before publishing images" : "Needs publishable imagery";

    const record = {
      projectId: project.projectId,
      name: metadata.name,
      area,
      pageStatus,
      dataConfidence: confidence,
      rightsStatus,
      officialWebsite: metadata.officialWebsite || "",
      normalizedFacts: {
        address: manual.normalizedFacts?.address ?? metadata.address ?? "",
        status: manual.normalizedFacts?.status ?? metadata.status ?? "",
        residences: manual.normalizedFacts?.residences ?? metadata.residences ?? "",
        stories: manual.normalizedFacts?.stories ?? metadata.stories ?? "",
        completion: manual.normalizedFacts?.completion ?? metadata.completion ?? "",
        pricing: manual.normalizedFacts?.pricing ?? metadata.pricing ?? "",
        team:
          manual.normalizedFacts?.team ??
          compact([metadata.developer, metadata.architect, metadata.interiorDesigner, metadata.landscapeArchitect]).join("; "),
      },
      sourceCounts: {
        official: sourceBuckets.official.length,
        reporting: sourceBuckets.reporting.length,
        other: sourceBuckets.other.length,
        sourcePages,
      },
      assetCounts: {
        floorplans: assetBuckets.floorplans.length,
        brochures: assetBuckets.brochures.length,
        factsheets: assetBuckets.factsheets.length,
        otherPdfs: assetBuckets.otherPdfs.length,
        images: images.length,
        generatedPlaceholders: metadata.generatedPlaceholderCopies?.length ?? 0,
      },
      highValueSources: unique([...(manual.highValueSources ?? []), metadata.officialWebsite].filter(Boolean)),
      assetNotes: manual.assetNotes ?? [],
      conflicts,
      gaps,
      sourceBuckets,
      assetBuckets,
    };

    catalog.projects.push(record);
    catalog.totals.downloadedPdfs += pdfs.length;
    catalog.totals.downloadedImages += images.length;
    catalog.totals.sourcePages += sourcePages;
    catalog.totals.officialSourceUrls += sourceBuckets.official.length;
    catalog.totals.reportingSourceUrls += sourceBuckets.reporting.length;

    catalog.areas[area] ??= { projectCount: 0, projects: [] };
    catalog.areas[area].projectCount += 1;
    catalog.areas[area].projects.push(project.projectId);
  }

  catalog.projects.sort((a, b) => areaRank(a.area) - areaRank(b.area) || a.name.localeCompare(b.name));

  await fs.writeFile(
    path.join(reviewRoot, "project-source-catalog.json"),
    `${JSON.stringify(catalog, null, 2)}\n`,
  );
  await fs.writeFile(path.join(reviewRoot, "source-material-summary.md"), renderSummary(catalog));
  await fs.writeFile(path.join(reviewRoot, "normalization-queue.md"), renderQueue(catalog));

  console.log(
    JSON.stringify(
      {
        reviewRoot,
        projects: catalog.projects.length,
        downloadedPdfs: catalog.totals.downloadedPdfs,
        downloadedImages: catalog.totals.downloadedImages,
        conflictProjects: catalog.projects.filter((project) => project.conflicts.length).length,
        gapProjects: catalog.projects.filter((project) => project.gaps.length).length,
      },
      null,
      2,
    ),
  );
}

function bucketSources(urls, officialWebsite) {
  const officialHost = safeHost(officialWebsite);
  const official = [];
  const reporting = [];
  const other = [];

  for (const url of unique(urls.filter(Boolean))) {
    const host = safeHost(url);
    if (!host) {
      other.push(url);
    } else if (officialHost && sameDomain(host, officialHost)) {
      official.push(url);
    } else if (isDeveloperOrCityHost(host)) {
      official.push(url);
    } else if (isReportingHost(host)) {
      reporting.push(url);
    } else {
      other.push(url);
    }
  }

  return { official, reporting, other };
}

function bucketAssets(downloads, knownLinks) {
  const all = [...downloads, ...knownLinks.map((asset) => ({ ...asset, path: asset.path ?? "", kind: "known-link" }))];
  const floorplans = [];
  const brochures = [];
  const factsheets = [];
  const otherPdfs = [];
  const images = [];

  for (const asset of all) {
    const text = `${asset.label ?? ""} ${asset.type ?? ""} ${asset.url ?? ""} ${asset.path ?? ""}`.toLowerCase();
    if (asset.kind === "image" || /\.(jpe?g|png|webp|avif)(\?|$)/i.test(asset.url ?? asset.path ?? "")) {
      images.push(asset);
    } else if (/floor.?plan|res\d+|residence.*pdf|plan\.pdf/.test(text)) {
      floorplans.push(asset);
    } else if (/fact.?sheet|factsheet/.test(text)) {
      factsheets.push(asset);
    } else if (/brochure|flipbook|rack/.test(text)) {
      brochures.push(asset);
    } else if (asset.kind === "pdf" || /\.pdf(\?|$)/i.test(asset.url ?? "")) {
      otherPdfs.push(asset);
    }
  }

  return {
    floorplans: summarizeAssets(floorplans),
    brochures: summarizeAssets(brochures),
    factsheets: summarizeAssets(factsheets),
    otherPdfs: summarizeAssets(otherPdfs),
    images: summarizeAssets(images),
  };
}

function summarizeAssets(assets) {
  return uniqueBy(
    assets.map((asset) => ({
      label: asset.label ?? path.basename(asset.path ?? asset.url ?? "asset"),
      url: asset.url ?? "",
      path: asset.path ?? "",
      source: asset.source ?? "",
      status: asset.status ?? "",
    })),
    (asset) => `${asset.url}|${asset.path}`,
  );
}

function inferArea(metadata) {
  const text = `${metadata.corridor ?? ""} ${metadata.address ?? ""} ${metadata.name ?? ""}`.toLowerCase();
  if (/nora/.test(text)) return "Downtown / NORA";
  if (/downtown|cityplace|hibiscus|lakeview|okeechobee|dixie|railroad/.test(text)) return "Downtown";
  if (/south flagler|s flagler|forte|edgeworth|harbor|portofino/.test(text)) return "South Flagler";
  if (/north flagler|n flagler|alba|olara|shorecrest|ritz|rybovich/.test(text)) return "North Flagler";
  return "Other / Legacy";
}

function inferPageStatus(projectId, metadata) {
  if (pipelineOnly.has(projectId)) return "Pipeline/watch-list";
  if (/office|redevelopment|assemblage|buyout/i.test(`${metadata.name} ${metadata.status}`)) return "Pipeline/watch-list";
  if (/completed|delivered/i.test(metadata.status ?? "")) return "Completed/recent-delivery page";
  return "Candidate project page";
}

function inferGaps(assetBuckets, metadata, pageStatus) {
  const gaps = [];
  if (!metadata.officialWebsite) gaps.push("No official website captured.");
  if (!assetBuckets.floorplans.length && !/watch-list|pipeline/i.test(pageStatus)) {
    gaps.push("No verified floor-plan assets in catalog.");
  }
  if (!assetBuckets.brochures.length && !assetBuckets.factsheets.length && !/watch-list|pipeline/i.test(pageStatus)) {
    gaps.push("No brochure or fact-sheet assets in catalog.");
  }
  if (!assetBuckets.images.length) gaps.push("No downloaded image candidates.");
  return gaps;
}

function extractNoteConflicts(notes) {
  if (!notes) return [];
  return /conflict|varies|verify|different|older|newer/i.test(notes) ? [notes] : [];
}

function normalizeConfidence(raw, conflicts, gaps, sourceBuckets) {
  if (conflicts.length >= 2) return "Needs normalization";
  if (gaps.length >= 3) return "Incomplete";
  if (sourceBuckets.official.length >= 2 && conflicts.length === 0) return "Strong";
  if (/high/i.test(raw ?? "") && conflicts.length <= 1) return "Good";
  if (/low/i.test(raw ?? "")) return "Low";
  return "Working";
}

function renderSummary(catalog) {
  const lines = [
    "# Source Material Summary",
    "",
    `Generated: ${catalog.generatedAt}`,
    "",
    `Harvested and sorted ${catalog.totals.projects} projects with ${catalog.totals.downloadedPdfs} PDF/document assets, ${catalog.totals.downloadedImages} image candidates, and ${catalog.totals.sourcePages} crawled page summaries.`,
    "",
    "Publishing rule: official developer/project/city sources can support facts, but images, renderings, PDFs, logos, and brochures still need rights review before use on the live site.",
    "",
  ];

  for (const area of Object.keys(catalog.areas).sort((a, b) => areaRank(a) - areaRank(b))) {
    const projects = catalog.projects.filter((project) => project.area === area);
    lines.push(`## ${area}`);
    lines.push("");
    lines.push("| Project | Page status | Data | Docs | Images | Main issues |");
    lines.push("|---|---|---|---:|---:|---|");
    for (const project of projects) {
      const docs =
        project.assetCounts.floorplans +
        project.assetCounts.brochures +
        project.assetCounts.factsheets +
        project.assetCounts.otherPdfs;
      const issues = [...project.conflicts, ...project.gaps].slice(0, 2).join("; ") || "No major issue flagged";
      lines.push(
        `| ${escapeMd(project.name)} | ${escapeMd(project.pageStatus)} | ${escapeMd(project.dataConfidence)} | ${docs} | ${project.assetCounts.images} | ${escapeMd(issues)} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Best Ready Material");
  lines.push("");
  lines.push("- Strongest document sets: Olara, Ritz-Carlton Residences, Mr. C, Shorecrest, Forte on Flagler, Alba Palm Beach, South Flagler House.");
  lines.push("- Strongest immediate page candidates: North Flagler core projects, South Flagler House, Mr. C, NORA House, Forte on Flagler.");
  lines.push("- Best watch-list/pipeline candidates: Edgeworth, Banyan Tree, Fort Partners South Flagler, Related Ross Fern/S Dixie, CityPlace office towers.");
  lines.push("");
  lines.push("## Next Data Moves");
  lines.push("");
  lines.push("- Normalize the known conflicts in `normalization-queue.md` before writing final public copy.");
  lines.push("- Promote official floor-plan and brochure links into the app data for project pages.");
  lines.push("- Select publishable imagery only after permission/rights review, or replace with custom/generated visuals clearly marked as conceptual.");
  lines.push("- Decide which records should be full pages versus map-only pipeline cards.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function renderQueue(catalog) {
  const projects = catalog.projects.filter((project) => project.conflicts.length || project.gaps.length);
  const lines = [
    "# Normalization Queue",
    "",
    "Use this before updating public-facing project pages. Each item is either a fact conflict, a content hole, or a publishability blocker.",
    "",
  ];

  for (const project of projects) {
    lines.push(`## ${project.name}`);
    lines.push("");
    lines.push(`- Area: ${project.area}`);
    lines.push(`- Recommended page status: ${project.pageStatus}`);
    lines.push(`- Data confidence: ${project.dataConfidence}`);
    lines.push(`- Rights status: ${project.rightsStatus}`);
    if (project.conflicts.length) {
      lines.push("- Conflicts:");
      for (const conflict of project.conflicts) lines.push(`  - ${conflict}`);
    }
    if (project.gaps.length) {
      lines.push("- Gaps:");
      for (const gap of project.gaps) lines.push(`  - ${gap}`);
    }
    if (project.highValueSources.length) {
      lines.push("- Highest-value sources:");
      for (const source of project.highValueSources.slice(0, 6)) lines.push(`  - ${source}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function areaRank(area) {
  const order = ["North Flagler", "Downtown", "Downtown / NORA", "South Flagler", "Other / Legacy"];
  const rank = order.indexOf(area);
  return rank === -1 ? 99 : rank;
}

function isDeveloperOrCityHost(host) {
  return /relatedross|relatedgroup|westpalmbeach|wpb\.org|norawpb|banyantree|mawd|arquitectonica|fortewpb|edgeworth|southflaglerhouse/.test(host);
}

function isReportingHost(host) {
  return /floridayimby|therealdeal|profilemiami|traded|palmbeachpost|bizjournals|globest|multihousingnews|connectcre/.test(host);
}

function sameDomain(host, officialHost) {
  return host === officialHost || host.endsWith(`.${officialHost}`) || officialHost.endsWith(`.${host}`);
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function safePathname(url) {
  try {
    return decodeURIComponent(new URL(url).pathname);
  } catch {
    return "";
  }
}

function inferAssetType(url) {
  const text = url.toLowerCase();
  if (/floor.?plan|res\d+|residence.*pdf|plan\.pdf/.test(text)) return "Floor plan";
  if (/fact.?sheet|factsheet/.test(text)) return "Fact sheet";
  if (/brochure|flipbook|rack/.test(text)) return "Brochure";
  if (/\.pdf(\?|$)/.test(text)) return "PDF";
  if (/\.(jpe?g|png|webp|avif)(\?|$)/.test(text)) return "Image";
  return "Source";
}

function compact(values) {
  return values.filter((value) => typeof value === "string" && value.trim());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeMd(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
