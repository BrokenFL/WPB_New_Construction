import fs from "node:fs/promises";
import path from "node:path";
import { readTsArray } from "./article-market-note-utils.mjs";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const templatePath = path.join(distRoot, "index.html");
const siteDataPath = path.join(workspace, "src/generated/siteData.ts");
const appSourcePath = path.join(workspace, "src/main.ts");
const approvedNewsPath = path.join(workspace, "research/news-review/approved-development-news.json");
const marketNotesPath = path.join(workspace, "src/data/marketNotes.ts");
const projectModelPath = path.join(workspace, "src/generated/projectModelPublic.json");
const projectSchemaSafePath = path.join(workspace, "src/generated/projectSchemaSafe.json");
const baseUrl = "https://www.wpbnewconstruction.com";

const projectAliases = new Map([
  ["south-flagler-house", "south-flagler-house-north"],
  ["edgeworth", "edgeworth-north"],
  ["rybovich-marina-redevelopment", "rybovich-marina"],
]);

const corridorDetails = {
  "north-flagler": {
    label: "North Flagler",
    summary:
      "North Flagler is the deepest West Palm Beach waterfront comparison set, with active and future projects that buyers should compare by view exposure, delivery timing, floor-plan depth, and current packet availability.",
  },
  downtown: {
    label: "Downtown",
    summary:
      "Downtown West Palm Beach is the walkability lane, where buyers weigh restaurant access, NORA and The Square proximity, hotel-style service, parking, noise, and district phasing against direct waterfront exposure.",
  },
  "downtown-west-palm-beach": {
    label: "Downtown",
    canonicalSlug: "downtown-west-palm-beach",
    summary:
      "Downtown West Palm Beach is the walkability lane, where buyers weigh restaurant access, NORA and The Square proximity, hotel-style service, parking, noise, and district phasing against direct waterfront exposure.",
  },
  "south-flagler": {
    label: "South Flagler",
    summary:
      "South Flagler is the quieter waterfront lane south of downtown, where privacy, Palm Beach proximity, boutique scale, and delivered-building benchmarks matter as much as headline amenity lists.",
  },
  "palm-beach": {
    label: "Palm Beach",
    summary:
      "Palm Beach is a separate island market shaped by scarce sites, coastal approvals, low-density formats, and direct ocean or lagoon settings. OLIN Palm Beach and 3031 S. Ocean are the two reviewed projects currently tracked on the island.",
  },
};

async function main() {
  const template = await fs.readFile(templatePath, "utf8");
  const siteData = await fs.readFile(siteDataPath, "utf8");
  const staticPayload = await loadStaticPayload(siteData);
  const routes = staticPayload.prerenderRoutes;

  for (const route of routes) {
    const html = renderRouteHtml(template, route, staticPayload);
    const outDir = path.join(distRoot, route.path.replace(/^\/|\/$/g, ""));
    const outPath = route.path === "/" ? templatePath : path.join(outDir, "index.html");
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html);
  }

  console.log(JSON.stringify({ prerenderedRoutes: routes.length }, null, 2));
}

async function loadStaticPayload(siteData) {
  const approvedNews = await readJson(approvedNewsPath, []);
  const marketNotesSource = await fs.readFile(marketNotesPath, "utf8").catch(() => "");
  const projectModel = await readJson(projectModelPath, { projects: [], retiredProjects: [] });
  const projectSchemaSafe = await readJson(projectSchemaSafePath, { projects: [] });
  const appSource = await fs.readFile(appSourcePath, "utf8").catch(() => "");
  return {
    siteMeta: parseExport(siteData, "siteMeta"),
    floorplanLibrary: parseExport(siteData, "floorplanLibrary"),
    answerFaq: parseExport(siteData, "answerEngineFaq"),
    buyerIntentAnswers: parseBuyerIntentAnswers(appSource),
    researchNewsFeed: parseExport(siteData, "researchNewsFeed"),
    projectFacts: parseExport(siteData, "projectFacts"),
    prerenderRoutes: parseExport(siteData, "prerenderRoutes"),
    approvedNews: approvedNews.filter((item) => item.status === "published"),
    marketNotes: readTsArray(marketNotesSource, "marketNotes").filter((item) => item?.status === "published"),
    projectModel: Array.isArray(projectModel.projects) ? projectModel.projects : [],
    projectSchemaSafe: Array.isArray(projectSchemaSafe.projects) ? projectSchemaSafe.projects : [],
  };
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function parseExport(siteData, name) {
  const match = siteData.match(new RegExp(`export const ${name} = ([\\s\\S]*?) as const;`));
  if (!match) {
    throw new Error(`Could not find ${name} export in src/generated/siteData.ts`);
  }
  return JSON.parse(match[1]);
}

function parseBuyerIntentAnswers(appSource) {
  const marker = "const buyerIntentAnswerPages: BuyerIntentAnswerPage[] = ";
  const markerIndex = appSource.indexOf(marker);
  if (markerIndex === -1) return [];
  const start = appSource.indexOf("[", markerIndex + marker.length);
  if (start === -1) return [];
  const end = findMatchingBracket(appSource, start);
  if (end === -1) return [];
  const arraySource = appSource.slice(start, end + 1);
  try {
    return Function(`"use strict"; return (${arraySource});`)();
  } catch {
    return [];
  }
}

function findMatchingBracket(source, start) {
  let depth = 0;
  let quote = "";
  let escaping = false;
  let templateDepth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (quote === "`" && char === "$" && source[index + 1] === "{") {
        templateDepth += 1;
        index += 1;
        continue;
      }
      if (quote === "`" && templateDepth && char === "}") {
        templateDepth -= 1;
        continue;
      }
      if (char === quote && !templateDepth) quote = "";
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function renderRouteHtml(template, route, staticPayload) {
  const canonical = `${baseUrl}${canonicalPathForRoute(route.path)}`;
  const staticContent = renderStaticRouteContent(route, staticPayload);
  const schema = buildRouteSchema(route, staticPayload, canonical);
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(route.ogImage)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${escapeHtml(route.ogImage)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

  html = html.replace(
    "</head>",
    `  <script id="wpb-static-structured-data" type="application/ld+json" data-static-path="${escapeHtml(route.path)}">${jsonForHtml(schema)}</script>\n  </head>`,
  );
  html = html.replace(
    '<div id="app"></div>',
    `<div id="app">${staticContent}</div><script>window.__WPB_PRERENDER_PATH__=${JSON.stringify(route.path)};</script>`,
  );
  return html;
}

function canonicalPathForRoute(routePath) {
  if (routePath === "/blog/" || routePath === "/blog") return "/market-notes/";
  if (routePath === "/contact/" || routePath === "/contact") return "/inquire/";
  if (routePath === "/floor-plans/" || routePath === "/floor-plans") return "/floorplans/";
  const blogMatch = routePath.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return `/market-notes/${blogMatch[1]}/`;
  return routePath;
}

function renderStaticRouteContent(route, payload) {
  const routeKind = routeKindForPath(route.path);
  if (routeKind.type === "project") return renderProjectRoute(route, payload, routeKind.slug);
  if (routeKind.type === "corridor") return renderCorridorRoute(route, payload, routeKind.slug);
  if (routeKind.type === "answer") return renderBuyerIntentAnswerRoute(route, payload, routeKind.slug);
  if (routeKind.type === "update") return renderUpdateRoute(route, payload, routeKind.slug);
  if (routeKind.type === "market-note") return renderMarketNoteRoute(route, payload, routeKind.slug);
  if (routeKind.type === "downtown-spotlight") return renderMarketNoteRoute(route, payload, routeKind.slug);
  if (route.path === "/") return renderHomeRoute(route, payload);
  if (route.path === "/buildings/") return renderBuildingsRoute(route, payload);
  if (route.path === "/corridors/") return renderCorridorsIndexRoute(route, payload);
  if (route.path === "/compare/") return renderCompareRoute(route, payload);
  if (route.path === "/about/") return renderAboutRoute(route);
  if (route.path === "/floorplans/") return renderFloorplansRoute(route, payload);
  if (route.path === "/answers/") return renderAnswersRoute(route, payload);
  if (route.path === "/updates/") return renderUpdatesIndex(route, payload);
  if (route.path === "/downtown-spotlight/") return renderDowntownSpotlightIndex(route, payload);
  if (route.path === "/market-notes/") return renderMarketNotesIndex(route, payload);
  return renderSimpleRoute(route);
}

function routeKindForPath(routePath) {
  const project = routePath.match(/^\/projects\/([^/]+)\/$/);
  if (project) return { type: "project", slug: project[1] };
  const corridor = routePath.match(/^\/corridors\/([^/]+)\/$/);
  if (corridor) return { type: "corridor", slug: corridor[1] };
  const answer = routePath.match(/^\/answers\/([^/]+)\/$/);
  if (answer) return { type: "answer", slug: answer[1] };
  const update = routePath.match(/^\/updates\/([^/]+)\/$/);
  if (update) return { type: "update", slug: update[1] };
  const note = routePath.match(/^\/market-notes\/([^/]+)\/$/);
  if (note) return { type: "market-note", slug: note[1] };
  const spotlight = routePath.match(/^\/downtown-spotlight\/([^/]+)\/$/);
  if (spotlight) return { type: "downtown-spotlight", slug: spotlight[1] };
  return { type: "page" };
}

function renderHomeRoute(route, payload) {
  const projects = priorityProjectFacts(payload).slice(0, 12);
  return pageShell(
    "home",
    "West Palm Beach New Construction Condos",
    route.description,
    `
      <section>
        <h2>Buyer-ready project directory</h2>
        <p>Use this site to compare West Palm Beach new-construction condo buildings by corridor, status, floor-plan availability, source confidence, and current buyer verification needs.</p>
        ${projectCards(projects)}
      </section>
      <section>
        <h2>Core buyer paths</h2>
        <ul>
          <li><a href="/buildings/">Compare tracked buildings</a></li>
          <li><a href="/floorplans/">Browse released floorplan records</a></li>
          <li><a href="/answers/">Read direct buyer answers</a></li>
          <li><a href="/methodology/">Review the source methodology</a></li>
        </ul>
      </section>
      ${renderLatestUpdates(payload)}
    `,
  );
}

function renderBuildingsRoute(route, payload) {
  return pageShell(
    "buildings",
    "West Palm Beach New Construction Buildings",
    route.description,
    `
      <section>
        <h2>Tracked building entities</h2>
        <p>Each project page is the canonical entity page for that building or benchmark. Public details are useful for orientation, but pricing, availability, incentives, fees, square footage, and timing require current buyer-side confirmation.</p>
        ${projectCards(payload.projectFacts)}
      </section>
    `,
  );
}

function renderCorridorsIndexRoute(route, payload) {
  const corridorRows = ["south-flagler", "north-flagler", "downtown-west-palm-beach", "palm-beach"].map((slug) => {
    const corridor = corridorDetails[slug];
    const projects = payload.projectFacts.filter((project) => normalize(project.area).includes(normalize(corridor.label)));
    return { slug, corridor, projects };
  });
  return pageShell(
    "corridors",
    "Choose Your West Palm Beach Corridor",
    route.description,
    `
      <section>
        <h2>West Palm Beach new construction is not one market.</h2>
        <p>South Flagler, North Flagler, Downtown, and Palm Beach each offer a different lifestyle, price point, and long-term value story. Start with where you want to live, then compare the buildings that fit that daily routine.</p>
      </section>
      <section>
        <h2>Corridor choices</h2>
        ${corridorRows.map(({ slug, corridor, projects }) => `
          <article>
            <h3><a href="${corridorDirectoryPathForKey(slug)}">${publicText(corridor.label)}</a></h3>
            <p>${publicText(corridor.summary)}</p>
            <p>${projects.length} tracked project${projects.length === 1 ? "" : "s"} currently assigned to this corridor.</p>
          </article>
        `).join("")}
      </section>
      <section>
        <h2>Map and project comparison</h2>
        <ul>
          <li><a href="/buildings/">Browse all projects</a></li>
          <li><a href="/compare/">Compare buildings</a></li>
        </ul>
      </section>
    `,
  );
}

function renderCompareRoute(route, payload) {
  const rows = priorityProjectFacts(payload).slice(0, 16);
  const priorityRows = comparisonAuthorityProjects(payload);
  return pageShell(
    "compare",
    "Compare West Palm Beach New Construction Condos",
    route.description,
    `
      <section>
        <h2>Bottom line</h2>
        <p>Start with corridor fit, then compare sourced status, delivery language, released floorplan depth, and open verification notes. North Flagler is the main waterfront comparison set, Downtown is the walkability lane, and South Flagler is the quieter waterfront lane. Pricing, incentives, fees, and exact availability should be confirmed from the current buyer packet.</p>
      </section>
      <section>
        <h2>Comparison snapshot</h2>
        <p>Start with corridor, project status, delivery assumptions, released floorplans, and what still needs direct verification. This table is a crawler-readable companion to the interactive comparison tool.</p>
        ${renderStaticComparisonTable(payload, rows)}
      </section>
      <section>
        <h2>Best-fit buyer lanes</h2>
        <ul>
          <li><a href="/corridors/north-flagler/">North Flagler</a>: waterfront shortlist with the deepest active comparison depth.</li>
          <li><a href="/corridors/downtown-west-palm-beach/">Downtown West Palm Beach</a>: walkability, restaurants, NORA, The Square, and district energy.</li>
          <li><a href="/corridors/south-flagler/">South Flagler</a>: quieter waterfront positioning, privacy, and Palm Beach proximity.</li>
          <li><a href="/corridors/palm-beach/">Palm Beach</a>: low-density island projects shaped by coastal approvals and ocean or lagoon setting.</li>
        </ul>
      </section>
      <section>
        <h2>Priority building comparison</h2>
        ${renderStaticComparisonTable(payload, priorityRows)}
      </section>
      <section>
        <h2>Buyer verification FAQ</h2>
        ${comparisonFaqForStatic().map((item) => `<article><h3>${publicText(item.question)}</h3><p>${publicText(item.answer)}</p></article>`).join("")}
      </section>
    `,
  );
}

function renderAboutRoute(route) {
  return pageShell(
    "about",
    "About The Scott Gordon Group",
    route.description,
    `
      <section>
        <h2>Decades of waterfront excellence</h2>
        <p>The Scott Gordon Group at Douglas Elliman combines decades of Palm Beach waterfront experience with boutique, principal-led guidance for buyers comparing West Palm Beach new-construction residences.</p>
        <p>Since the early 1980s, the team has specialized in luxury oceanfront and lakefront real estate on Palm Beach Island. Scott Gordon has been marketing and selling luxury waterfront condos, townhouses, and single-family residences since 1984, and Mindy Gordon brings marketing and entrepreneurial experience to the team's West Palm Beach new-construction guidance.</p>
      </section>
      <section>
        <h2>Recognized performance with boutique attention</h2>
        <p>Team-supplied RealTrends 2024 materials report a $1.99 million average home price and $32.89 million in annual volume for the team, including an 8th-place Palm Beach volume ranking. Team-supplied 2026 materials report more than $100 million in sales and pending contracts and four Douglas Elliman Ellie Awards distinctions.</p>
        <p>Public project summaries are starting points only. Pricing, incentives, fees, and exact availability should be confirmed from the current buyer packet before relying on any public listing or development summary.</p>
      </section>
      <section>
        <h2>Work with us</h2>
        <p>Use the inquiry route to request current availability, floor plans, pricing guidance, timeline notes, and private comparison context before relying on public project summaries.</p>
        <p><a href="/inquire/">Request current availability</a></p>
      </section>
    `,
  );
}

function renderFloorplansRoute(route, payload) {
  const projects = payload.floorplanLibrary.filter((project) => project.count > 0);
  return pageShell(
    "floorplans",
    "West Palm Beach Condo Floor Plans",
    route.description,
    `
      <section>
        <h2>Released floorplan records</h2>
        <p>Floorplan links and PDFs are starting points for buyer diligence. Before relying on a plan, confirm current availability, stack, view exposure, pricing, fees, and whether the plan is still contractable.</p>
        ${projects.map((project) => `
          <article id="floorplans-${escapeHtml(project.projectId)}">
            <h3>${publicText(project.name)}</h3>
            <p>${project.count} floorplan records currently tracked. ${publicText(project.missingNote || "Request the current buyer packet before relying on any public floorplan record.")}</p>
            <p><a href="/floorplans/#floorplans-${escapeHtml(project.projectId)}">Open ${publicText(project.name)} in the interactive floorplan library</a></p>
            <ul>
              ${project.plans.slice(0, 8).map((plan) => `<li>${publicText(plan.displayName || plan.title)} - ${publicText(String(plan.planType || "individual").replace(/-/g, " "))}</li>`).join("")}
            </ul>
          </article>
        `).join("")}
      </section>
    `,
  );
}

function renderAnswersRoute(route, payload) {
  const faq = Array.isArray(payload.answerFaq) ? payload.answerFaq : [];
  return pageShell(
    "answers",
    "West Palm Beach new-construction answers with reviewed context",
    route.description,
    `
      <section>
        <h2>Direct buyer answers</h2>
        <p>Current availability, pricing, incentives, square footage, and delivery dates require current buyer-side confirmation before reliance.</p>
      </section>
      ${faq.map((item) => `
        <article id="${escapeHtml(item.id)}">
          <h2>${publicText(item.question)}</h2>
          <p>${publicText(item.answer)}</p>
          ${renderStaticCitations(item)}
        </article>
      `).join("")}
      <section>
        <h2>Buyer-intent answer guides</h2>
        <p>Use these pages for reviewed buyer questions, then confirm current pricing, availability, fees, floorplan availability, delivery timing, and contract terms before relying on any public summary.</p>
        ${payload.buyerIntentAnswers.map((answer) => `
          <article>
            <h3><a href="/answers/${escapeHtml(answer.slug)}/">${publicText(answer.question)}</a></h3>
            <p>${publicText(answer.bluf)}</p>
          </article>
        `).join("")}
      </section>
    `,
  );
}

function renderBuyerIntentAnswerRoute(route, payload, slug) {
  const answer = payload.buyerIntentAnswers.find((item) => item.slug === slug);
  if (!answer) return renderSimpleRoute(route);
  return pageShell(
    `answer-${slug}`,
    answer.question,
    route.description,
    `
      <section>
        <h2>Bottom line</h2>
        <p>${publicText(answer.bluf)}</p>
        <p>${publicText(answer.explanation)}</p>
      </section>
      <section>
        <h2>Buyer comparison table</h2>
        ${renderBuyerIntentTable(answer)}
      </section>
      <section>
        <h2>Related pages</h2>
        <ul>
          <li><a href="/compare/">Compare buildings</a></li>
          <li><a href="/floorplans/">Review floorplans</a></li>
          ${answer.corridorKeys.map((key) => `<li><a href="${corridorPathForKey(key)}">${publicText(corridorLabelForKey(key))} corridor</a></li>`).join("")}
          ${answer.projectIds.slice(0, 6).map((projectId) => {
            const project = projectForSlug(payload, projectId);
            return project ? `<li><a href="${projectPath(project)}">${publicText(project.name)}</a></li>` : "";
          }).join("")}
        </ul>
      </section>
      <section>
        <h2>Source and verification notes</h2>
        <ul>
          ${answer.sourceNotes.map((note) => `<li>${publicText(note)}</li>`).join("")}
          <li>Current pricing, incentives, fees, availability, delivery timing, floorplan availability, and contract terms should be verified before making a purchase decision.</li>
        </ul>
      </section>
      <section>
        <h2>FAQ</h2>
        ${answer.faqs.map((item) => `<article><h3>${publicText(item.question)}</h3><p>${publicText(item.answer)}</p></article>`).join("")}
      </section>
    `,
  );
}

function renderBuyerIntentTable(answer) {
  return `
    <table>
      <thead><tr><th>Buyer question</th><th>Best use</th><th>Related pages</th><th>What to verify</th></tr></thead>
      <tbody>
        ${answer.tableRows.map((row) => `<tr>
          <td>${publicText(row.label)}</td>
          <td>${publicText(row.bestUse)}</td>
          <td>${row.links.map((href) => `<a href="${safeHref(href)}">${publicText(linkLabelForAnswer(href))}</a>`).join("<br>")}</td>
          <td>${publicText(row.verify)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function renderProjectRoute(route, payload, slug) {
  const project = projectForSlug(payload, slug);
  if (!project) return renderSimpleRoute(route);
  const floorplans = floorplanForProject(payload, project.projectId);
  const presentation = staticProjectPresentation(project, floorplans);
  const facts = project.facts || {};
  const sources = sourceLinksForProject(project).slice(0, 6);
  const comparisons = comparisonProjectsForStatic(payload, project).slice(0, 4);
  const hasSourcedAmenities = sources.some((href) => /amenit/i.test(href));
  const cleanStatus = facts.status && !facts.status.toLowerCase().includes("candidate") ? facts.status : "Tracked project page";

  return pageShell(
    `project-${slug}`,
    project.name,
    route.description,
    `<div data-project-type="${safeHref(project.projectType)}">
      <section data-project-section="hero">
        <p>${publicText(project.area || "West Palm Beach")} ${publicText(presentation.identityLabel)}</p>
        <h2>${publicText(project.name)}</h2>
        <p>${publicText(project.summary || route.description)}</p>
      </section>
      <section data-project-section="overview">
        <h2>Bottom line</h2>
        <p>${publicText(presentation.bottomLine)}</p>
      </section>
      ${renderPipelineWatchlistStaticNote(project)}
      <section data-project-section="facts">
        <h2>Key facts to verify</h2>
        <dl>
          ${factRow("Project address", facts.projectAddress)}
          ${factRow("Sales gallery address", facts.salesGalleryAddress)}
          ${factRow("Status", facts.status && !facts.status.toLowerCase().includes("candidate") ? facts.status : "Tracked project page")}
          ${factRow("Residences", facts.residences)}
          ${factRow("Stories", facts.stories)}
          ${factRow("Delivery", facts.completion)}
          ${factRow("Pricing", facts.pricing)}
          ${factRow("Project team", facts.team)}
          ${presentation.showFloorplans ? factRow("Floorplans", `${floorplans.count} canonical plans tracked`) : ""}
        </dl>
      </section>
      <section>
        <h2>How to use this guide</h2>
        <p>${publicText(presentation.guideCopy)}</p>
      </section>
      <section data-project-section="neighborhood">
        <h2>Location and corridor context</h2>
        <p>${publicText(project.name)} is tracked in the ${publicText(project.area || "West Palm Beach")} lane. Compare this location by daily drive pattern, Palm Beach access, waterfront or downtown orientation, view exposure, parking, and what nearby construction may mean before touring.</p>
      </section>
      ${renderProjectCorridorCta(project, payload)}
      <section data-project-section="offering">
        <h2>${publicText(presentation.offeringHeading)}</h2>
        <p>${publicText(presentation.offeringCopy)}</p>
        ${floorplans?.plans?.length ? `<ul>${floorplans.plans.slice(0, 6).map((plan) => `<li>${publicText(plan.displayName || plan.title)} - ${publicText(String(plan.planType || "individual").replace(/-/g, " "))}</li>`).join("")}</ul>` : ""}
      </section>
      ${hasSourcedAmenities ? `<section data-project-section="amenities">
        <h2>Amenities</h2>
        <p>Amenity information is referenced in reviewed project pages for this project. Confirm which amenities are included, optional, phased, or subject to association rules before relying on a public summary.</p>
      </section>` : ""}
      ${facts.team ? `<section data-project-section="team">
        <h2>Project team</h2>
        <p>${publicText(facts.team)}. Team credits are included for buyer orientation and should be confirmed against the latest project packet or offering material.</p>
      </section>` : ""}
      ${comparisons.length ? `<section data-project-section="local-take">
        <h2>Compare against</h2>
        <ul>${comparisons.map((item) => `<li><a href="${projectPath(item)}">${publicText(item.name)}</a> - ${publicText(item.area || "West Palm Beach")}</li>`).join("")}</ul>
      </section>` : ""}
      
      <section data-project-section="inquiry">
        <h2>${publicText(presentation.inquiryHeading)}</h2>
        <p>${publicText(presentation.inquiryCopy)}</p>
        <p><a href="/inquire/?project=${encodeURIComponent(project.projectId)}&interest=${encodeURIComponent(presentation.interest)}">${publicText(presentation.ctaLabel)}</a></p>
      </section>

      <section data-project-section="sources">
        <h2>Sources and review date</h2>
        <p>Facts on this page were last reviewed ${publicText(project.lastReviewedDate || "recently")}. Pricing, availability, incentives, fees, and contract terms can change.</p>
        ${sources.length ? `<p>${sources.map((href) => renderStaticSourceLink(href, project.projectId)).join(" · ")}</p>` : ""}
      </section>

      <section data-project-section="faq">
        <h2>FAQ</h2>
        ${projectFaqForStatic(project, floorplans).map((item) => `<article><h3>${publicText(item.question)}</h3><p>${publicText(item.answer)}</p></article>`).join("")}
      </section>
      </div>
    `,
  );
}

function staticProjectPresentation(project, floorplans) {
  const hasFloorplans = Boolean(floorplans?.count);
  const location = project.area || "West Palm Beach";
  const common = {
    showFloorplans: hasFloorplans,
    guideCopy: `Use this stable ${project.name} profile for orientation, comparison, and the current details worth confirming before acting.`,
  };
  if (project.projectType === "rental") return {
    ...common,
    identityLabel: "rental community guide",
    bottomLine: `${project.name} is a rental apartment community in ${location}, not a for-sale condominium. Confirm current rents, availability, concessions, deposits, lease terms, and move-in timing before relying on public summaries.`,
    offeringHeading: "Rental homes and leasing context",
    offeringCopy: hasFloorplans ? `${floorplans.count} canonical layouts are tracked for orientation. Current leasing availability and quoted rent should come from current leasing materials.` : "No public leasing floorplan set is confirmed in the current catalog. Confirm current layouts, rents, availability, concessions, and lease terms directly.",
    inquiryHeading: "Leasing inquiry",
    inquiryCopy: "Request current rents, availability, concessions, deposits, pet terms, and move-in timing.",
    ctaLabel: `Check current leasing information for ${project.name}`,
    interest: "leasing",
  };
  if (project.projectType === "office") return {
    ...common,
    identityLabel: "office development guide",
    bottomLine: `${project.name} is an office development in ${location}, not residential inventory. Confirm current space availability, asking terms, delivery condition, parking, and tenant-improvement details.`,
    offeringHeading: "Office space and leasing context",
    offeringCopy: "Office plans and public project facts are for orientation. Current availability and commercial terms should come from current leasing materials.",
    inquiryHeading: "Office leasing inquiry",
    inquiryCopy: "Request current space availability, asking terms, parking, delivery condition, and tenant-improvement details.",
    ctaLabel: `Request leasing information for ${project.name}`,
    interest: "office-leasing",
  };
  if (project.projectType === "completed-comparable") return {
    ...common,
    identityLabel: "completed condominium guide",
    bottomLine: `${project.name} is a completed ${location} condominium used as a resale comparable, not current developer inventory. Confirm active listings, condition, fees, assessments, and seller terms.`,
    offeringHeading: "Completed residences and resale context",
    offeringCopy: hasFloorplans ? `${floorplans.count} canonical plans are tracked for layout orientation. Confirm the specific resale residence, condition, exposure, fees, and seller terms.` : "Use this page as completed-building context, then confirm the specific resale residence, condition, exposure, fees, assessments, and seller terms.",
    inquiryHeading: "Resale inquiry",
    inquiryCopy: "Request current resale listings and building-specific due diligence.",
    ctaLabel: `Request current resale availability at ${project.name}`,
    interest: "resale-availability",
  };
  if (project.projectType === "condo-pipeline" || project.projectType === "mixed-use") return {
    ...common,
    identityLabel: project.projectType === "mixed-use" ? "mixed-use development guide" : "condominium pipeline guide",
    bottomLine: `${project.name} is tracked as a ${location} ${project.projectType === "mixed-use" ? "mixed-use development" : "condominium pipeline project"}. Use current public status and planning signals for context, not as a promise of a sales launch, pricing, or availability.`,
    offeringHeading: project.projectType === "mixed-use" ? "Development program and status" : "Pipeline status and future residences",
    offeringCopy: hasFloorplans ? `${floorplans.count} canonical plans are tracked, but public status, launch timing, pricing, and availability still require current confirmation.` : "No complete public floorplan packet is confirmed. Track current approvals, program, sponsor signals, launch timing, and status before treating this as available inventory.",
    inquiryHeading: "Project updates",
    inquiryCopy: "Request current status, planning, launch, and public-material updates.",
    ctaLabel: `Get updates on ${project.name}`,
    interest: "project-updates",
  };
  return {
    ...common,
    identityLabel: project.projectType === "hotel-residences" ? "hotel and residences guide" : "condominium buyer guide",
    bottomLine: `${project.name} is tracked as a ${location} ${String(project.projectType || "project").replace(/-/g, " ")} profile. Verify current pricing, availability, incentives, fees, floor-plan release status, delivery timing, and contract terms.`,
    offeringHeading: project.projectType === "hotel-residences" ? "Hotel services and private residences" : "Residences and floorplans",
    offeringCopy: hasFloorplans ? `${floorplans.count} canonical floorplans are tracked for buyer orientation. Confirm current line, stack, exposure, square footage, fees, pricing, and availability.` : "No complete public floorplan packet is confirmed in the current catalog. Request current offering materials before comparing residences.",
    inquiryHeading: "Buyer inquiry",
    inquiryCopy: "Request the current buyer packet, availability, pricing, fees, floorplans, and project-specific verification notes.",
    ctaLabel: `Ask The Scott Gordon Group about ${project.name}`,
    interest: "availability",
  };
}

function renderCorridorRoute(route, payload, slug) {
  const corridor = corridorDetails[slug] || { label: route.title, summary: route.description };
  const projects = payload.projectFacts.filter((project) => normalize(project.area).includes(normalize(corridor.label)));
  return pageShell(
    `corridor-${slug}`,
    `${corridor.label} Condos`,
    route.description,
    `
      <section>
        <h2>Bottom line</h2>
        <p>${publicText(corridor.summary)} Compare the buildings below by sourced status, delivery language, released floorplan depth, and open verification notes before treating two projects as substitutes.</p>
      </section>
      <section>
        <h2>${publicText(corridor.label)} comparison table</h2>
        ${renderStaticComparisonTable(payload, projects)}
      </section>
      <section>
        <h2>Tracked projects in this corridor</h2>
        ${projectCards(projects)}
      </section>
      <section>
        <h2>Buyer fit and verification notes</h2>
        <p>${publicText(corridorBestFit(slug))} Confirm current pricing, availability, incentives, fees, floor-plan release status, stack, exposure, delivery timing, and contract terms before making a purchase decision.</p>
      </section>
      <section>
        <h2>FAQ</h2>
        ${corridorFaqForStatic(corridor, projects).map((item) => `<article><h3>${publicText(item.question)}</h3><p>${publicText(item.answer)}</p></article>`).join("")}
      </section>
    `,
  );
}

function renderPipelineWatchlistStaticNote(project) {
  const isWatchlist = /pipeline|planning|mixed-use/.test(project.projectType || "") || /pipeline|watch|proposed/i.test(project.facts?.status || "");
  if (!isWatchlist) return "";
  if (project.projectId === "rosewood-residences-west-palm-beach") {
    return `
      <section>
        <h2>Pipeline watchlist context</h2>
        <p>Rosewood Residences West Palm Beach is tracked as a proposed North Flagler branded-residence project at 2001 North Flagler Drive, not as a launched public sales offering. The current planning record and reporting point to a 27-story, 90-residence tower with Related Group and BH Group as project sponsors, Arquitectonica as architect, Rosewood branding, 185 parking spaces, more than 13,000 square feet of reported indoor amenities, and a fifth-floor pool deck.</p>
        <p>Pricing, formal sales launch, complete floorplans, delivery timing, final approval status, construction team, and publishable official media still need current confirmation. Buyers should use this page as early corridor intelligence and compare it separately from active North Flagler projects with current packets.</p>
      </section>
    `;
  }
  if (project.projectId === "rybovich-marina") {
    return `
      <section>
        <h2>Pipeline watchlist context</h2>
        <p>Rybovich Marina Redevelopment is tracked as a North Flagler waterfront district plan for the 4000-4300 North Flagler Drive marina area. The current catalog frames it as planning or initial-approval context, with residential towers, marina uses, private club space, retail, restaurant, office, crew-amenity, and Intracoastal promenade components still needing buyer-facing confirmation before they are treated as condo inventory.</p>
        <p>The broader redevelopment has been reported with up to 660 residential units, while current buyer guidance should focus on what is actually approved, released, and available. Pricing, tower-by-tower residence mix, floorplans, sales launch, association terms, and delivery timing remain verification items.</p>
      </section>
    `;
  }
  return `
    <section>
      <h2>Pipeline watchlist context</h2>
      <p>${publicText(project.name)} is being tracked as a future or planning-stage West Palm Beach project. Treat the page as market context until current pricing, availability, floorplans, delivery timing, approvals, buyer packet details, and contract terms are confirmed.</p>
    </section>
  `;
}

function renderUpdateRoute(route, payload, slug) {
  const item = payload.approvedNews.find((news) => (news.slug || news.id) === slug) ||
    payload.researchNewsFeed.find((news) => news.id === slug);
  if (!item) return renderSimpleRoute(route);
  const sections = Array.isArray(item.bodySections) ? item.bodySections : [];
  const deckEchoes = new Set(
    [item.deck, item.summary, item.rewrittenSummary, item.description, route.description]
      .map((value) => String(value ?? "").trim().toLowerCase())
      .filter(Boolean),
  );
  const isDeckEcho = (value) => deckEchoes.has(String(value ?? "").trim().toLowerCase());
  return pageShell(
    `update-${slug}`,
    item.title,
    item.description || item.summary || route.description,
    `
      <article>
        <p>Published ${publicText(item.publishedAt || item.datePublished || "current review")} from ${publicText(item.sourceName || "reviewed source")}.</p>
        <p>${publicText(item.deck || item.summary || item.rewrittenSummary || route.description)}</p>
        ${sections.map((section) => `<section><h2>${publicText(section.heading)}</h2><p>${publicText(stripImageTokens(section.body))}</p>${section.image ? `<figure class="market-note-inline-image"><img src="${safeHref(section.image)}" alt="${publicText(`${item.title}: ${section.heading}`)}" loading="lazy" decoding="async" /></figure>` : ""}</section>`).join("")}
        ${item.whyItMatters && !isDeckEcho(item.whyItMatters) ? `<section><h2>Why it matters</h2><p>${publicText(stripImageTokens(item.whyItMatters))}</p></section>` : ""}
        ${item.buyerContext && !isDeckEcho(item.buyerContext) ? `<section><h2>Buyer context</h2><p>${publicText(stripImageTokens(item.buyerContext))}</p></section>` : ""}
        <section><h2>Source</h2><p><a href="${safeHref(item.canonicalUrl || item.sourceUrl || "#")}">${publicText(item.sourceName || "Original source")}</a>. Verify current project details before making a purchase decision.</p></section>
      </article>
    `,
  );
}

function renderUpdatesIndex(route, payload) {
  return pageShell(
    "updates",
    "West Palm Beach Condo Updates",
    route.description,
    `
      <section>
        <h2>Published updates</h2>
        <p>Updates connect buyer-facing project pages to source-linked reporting, planning, financing, construction, and sales signals.</p>
        ${payload.approvedNews.slice(0, 12).map((item) => `
          <article>
            <h3><a href="/updates/${escapeHtml(item.slug || item.id)}/">${publicText(item.title)}</a></h3>
            <p>${publicText(item.description || item.summary || item.deck || "West Palm Beach project update with source attribution.")}</p>
            <p>Source: ${publicText(item.sourceName)}. Published: ${publicText(item.publishedAt || item.sourcePublishedAt || "current review")}.</p>
          </article>
        `).join("")}
      </section>
    `,
  );
}

function renderMarketNoteRoute(route, payload, slug) {
  const note = payload.marketNotes.find((item) => item.slug === slug);
  const hero = note?.image;
  const sections = Array.isArray(note?.sections) ? note.sections : [];
  return pageShell(
    `market-note-${slug}`,
    route.title.replace(/\s+\|\s+.*$/, ""),
    route.description,
    `
      <article>
        ${hero?.path ? `<figure class="market-note-hero-image"><img src="${safeHref(hero.path)}" alt="${publicText(hero.alt || note?.title || route.title)}" loading="eager" decoding="async" />${hero.caption ? `<figcaption>${publicText(hero.caption)}</figcaption>` : ""}</figure>` : ""}
        <h2>Bottom line</h2>
        <p>${publicText(note?.excerpt || route.description)} This guide is buyer education, not a substitute for current building-specific pricing, availability, fee, or contract verification.</p>
        <h2>How to use this guidance</h2>
        <p>Use the guidance to frame questions before comparing West Palm Beach buildings. Then check project pages, current floor-plan packets, source-linked updates, and The Scott Gordon Group at Douglas Elliman for the details that can change.</p>
        ${sections.map((section) => `<section><h2>${publicText(section.heading)}</h2><p>${publicText(stripImageTokens(section.body))}</p>${section.image ? `<figure class="market-note-inline-image"><img src="${safeHref(section.image)}" alt="${publicText(`${note?.title || route.title}: ${section.heading}`)}" loading="lazy" decoding="async" /></figure>` : ""}</section>`).join("")}
        <h2>Verification note</h2>
        <p>Before touring or relying on a public summary, verify current availability, incentives, carrying costs, square footage, delivery timing, and whether a building's public packet has changed.</p>
      </article>
    `,
  );
}

function renderMarketNotesIndex(route, payload) {
  const notes = payload.prerenderRoutes.filter((item) => item.path.startsWith("/market-notes/") && item.path !== "/market-notes/");
  return pageShell(
    "market-notes",
    "West Palm Beach Condo Guidance",
    route.description,
    `
      <section>
        <h2>Buyer guidance library</h2>
        <p>These evergreen guides explain how to compare West Palm Beach new-construction condos without relying on brochure language alone.</p>
        ${notes.map((note) => `<article><h3><a href="${safeHref(note.path)}">${publicText(note.title)}</a></h3><p>${publicText(note.description)}</p></article>`).join("")}
      </section>
    `,
  );
}

function renderDowntownSpotlightIndex(route, payload) {
  const notes = payload.prerenderRoutes.filter((item) => item.path.startsWith("/downtown-spotlight/") && item.path !== "/downtown-spotlight/");
  return pageShell(
    "downtown-spotlight",
    "Downtown Spotlight",
    route.description,
    `
      <section>
        <h2>Downtown series</h2>
        <p>Follow the districts, buildings, restaurants, streets, and planning signals shaping the Downtown West Palm Beach condo decision.</p>
        ${notes.map((note) => `<article><h3><a href="${safeHref(note.path)}">${publicText(note.title)}</a></h3><p>${publicText(note.description)}</p></article>`).join("")}
      </section>
    `,
  );
}

function renderSimpleRoute(route) {
  return pageShell(
    route.path.replace(/[^a-z0-9]+/gi, "-"),
    route.title.replace(/\s+\|\s+.*$/, ""),
    route.description,
    `
      <section>
        <h2>Page summary</h2>
        <p>${publicText(route.description)} This page is part of WPB New Construction's source-backed buyer guide for West Palm Beach condo research.</p>
        <p>Use it with the project pages, floorplan library, market updates, and inquiry route when current pricing, availability, incentives, square footage, fees, or delivery timing matters.</p>
      </section>
    `,
  );
}

function pageShell(label, h1, intro, body) {
  return `
    <main class="static-prerender" data-static-prerender="${escapeHtml(label)}">
      <section>
        <p>WPB New Construction</p>
        <h1>${publicText(h1)}</h1>
        <p>${publicText(intro)}</p>
      </section>
      ${body}
    </main>
  `;
}

function projectCards(projects) {
  if (!projects.length) return "<p>No matching projects are currently published for this route.</p>";
  return `
    <div>
      ${projects.map((project) => `
        <article>
          <h3><a href="${projectPath(project)}">${publicText(project.name)}</a></h3>
          <p>${publicText(project.area || "West Palm Beach")} - ${publicText(project.facts?.status || "Status needs verification")}</p>
          <p>${publicText(firstVerificationNote(project))}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderLatestUpdates(payload) {
  const updates = payload.approvedNews.slice(0, 4);
  if (!updates.length) return "";
  return `
    <section>
      <h2>Current updates</h2>
      ${updates.map((item) => `<article><h3><a href="/updates/${escapeHtml(item.slug || item.id)}/">${publicText(item.title)}</a></h3><p>${publicText(item.summary || item.description || item.deck || "Source-linked West Palm Beach project update.")}</p></article>`).join("")}
    </section>
  `;
}

function renderStaticCitations(item) {
  const citations = Array.isArray(item.sourceCitations) ? item.sourceCitations : [];
  const latestDate = citations.find((source) => source.dateAccessed)?.dateAccessed ?? "current review";
  if (!citations.length) {
    return `<p>Review basis: ${(item.sources ?? []).map(publicText).join("; ")}. Checked: ${escapeHtml(latestDate)}. Buyer note: verify pricing, availability, and contract details before relying on this.</p>`;
  }

  return `
    <p>Review basis: ${citations.map((source) => publicText(source.label)).join("; ")}. Checked: ${escapeHtml(latestDate)}. Buyer note: verify pricing, availability, and contract details before relying on this.</p>
    <ul>
      ${citations.map((source) => `<li><strong>${publicText(source.label)}</strong> ${publicText(source.supportsClaim ?? "Source context")}: ${publicText(source.claimText ?? source.note ?? "")}</li>`).join("")}
    </ul>
  `;
}

function factRow(label, value) {
  if (!value) return "";
  const v = String(value).trim();
  const lower = v.toLowerCase();
  if (lower.includes("candidate") || lower === "not publicly confirmed" || lower === "unknown" || lower === "n/a" || lower === "tbd" || lower === "verify" || lower.includes("not released")) {
    return "";
  }
  return `<div><dt>${publicText(label)}</dt><dd>${publicText(v)}</dd></div>`;
}

function priorityProjectFacts(payload) {
  return [...payload.projectFacts].sort((a, b) => {
    const aRank = a.projectType === "condo-active-sales" ? 0 : a.projectType === "condo-pipeline" ? 1 : 2;
    const bRank = b.projectType === "condo-active-sales" ? 0 : b.projectType === "condo-pipeline" ? 1 : 2;
    return aRank - bRank || a.name.localeCompare(b.name);
  });
}

function floorplanForProject(payload, projectId) {
  const aliases = new Set([projectId]);
  if (projectId === "south-flagler-house-north" || projectId === "south-flagler-house-south") aliases.add("south-flagler-house");
  return payload.floorplanLibrary.find((project) => aliases.has(project.projectId));
}

function projectForSlug(payload, slug) {
  const canonicalProject = payload.projectFacts.find((project) => project.projectId === slug);
  if (canonicalProject) return canonicalProject;
  const id = projectAliases.get(slug) || slug;
  return payload.projectFacts.find((project) => project.projectId === id || project.projectId === slug);
}

function projectPath(project) {
  const publicId = publicProjectId(project.projectId);
  return `/projects/${publicId}/`;
}

function publicProjectId(projectId) {
  if (projectId === "south-flagler-house-north" || projectId === "south-flagler-house-south") return "south-flagler-house";
  if (projectId === "rybovich-marina") return "rybovich-marina-redevelopment";
  return projectId;
}

function corridorKeyForProject(project) {
  const area = normalize(project.area);
  if (area.includes("south-flagler")) return "south-flagler";
  if (area.includes("downtown")) return "downtown";
  if (area === "palm-beach" || area.includes("palm-beach-island")) return "palm-beach";
  return "north-flagler";
}

function corridorPathForKey(key) {
  return key === "downtown" ? "/corridors/downtown-west-palm-beach/" : `/corridors/${key}/`;
}

function corridorDirectoryPathForKey(key) {
  const filter = key === "downtown-west-palm-beach" ? "downtown" : key;
  return `/buildings/?filter=${filter}`;
}

function corridorLabelForKey(key) {
  if (key === "north-flagler") return "North Flagler";
  if (key === "south-flagler") return "South Flagler";
  if (key === "palm-beach") return "Palm Beach";
  return "Downtown West Palm Beach";
}

function renderProjectCorridorCta(project, payload) {
  const corridorKey = corridorKeyForProject(project);
  const corridorProjects = payload.projectFacts
    .filter((item) => item.projectId !== project.projectId && corridorKeyForProject(item) === corridorKey)
    .slice(0, 3);
  return `
    <section>
      <h2>Compare ${publicText(project.name)} within ${publicText(corridorLabelForKey(corridorKey))}</h2>
      <p>Use the corridor guide to compare nearby West Palm Beach projects by buyer fit, current status, released floorplans, and what still needs verification before touring.</p>
      <ul>
        <li><a href="${corridorPathForKey(corridorKey)}">Review ${publicText(corridorLabelForKey(corridorKey))} corridor</a></li>
        <li><a href="/compare/">Compare all buildings</a></li>
        ${corridorProjects.map((item) => `<li><a href="${projectPath(item)}">${publicText(item.name)}</a></li>`).join("")}
      </ul>
    </section>
  `;
}

function linkLabelForAnswer(href) {
  const projectMatch = href.match(/^\/projects\/([^/]+)\//);
  if (projectMatch) {
    return projectMatch[1].replace(/-/g, " ");
  }
  if (href === "/compare/") return "Compare";
  if (href === "/floorplans/") return "Floorplans";
  if (href === "/inquire/") return "Inquiry";
  if (href.includes("north-flagler")) return "North Flagler";
  if (href.includes("downtown-west-palm-beach")) return "Downtown West Palm Beach";
  if (href.includes("south-flagler")) return "South Flagler";
  if (href.includes("active-sales-vs-pipeline-watch")) return "Active sales vs pipeline";
  if (href.includes("why-published-floor-plans-matter")) return "Why floorplans matter";
  return href.replace(/^\/|\/$/g, "").replace(/-/g, " ");
}

function firstVerificationNote(project) {
  return project.summary || "Review the current project page, then confirm pricing, availability, fees, delivery timing, and contract terms.";
}

function comparisonAuthorityProjects(payload) {
  const priorityIds = [
    "olara",
    "south-flagler-house-north",
    "ritz-carlton-wpb",
    "shorecrest",
    "alba-palm-beach",
    "berkeley",
    "nora-house",
    "forte-on-flagler",
    "mr-c",
    "maison-dor",
  ];
  const byId = new Map(payload.projectFacts.map((project) => [project.projectId, project]));
  return priorityIds.map((projectId) => byId.get(projectId)).filter(Boolean);
}

function renderStaticComparisonTable(payload, projects) {
  return `
    <table>
      <thead><tr><th>Building</th><th>Corridor</th><th>Status</th><th>Delivery</th><th>Floorplans</th><th>Best fit</th><th>Buyer focus</th></tr></thead>
      <tbody>
        ${projects.map((project) => {
          const floorplans = floorplanForProject(payload, project.projectId);
          return `<tr>
            <td><a href="${projectPath(project)}">${publicText(project.name)}</a></td>
            <td>${publicText(project.area || "West Palm Beach")}</td>
            <td>${publicText(project.facts?.status || "Needs verification")}</td>
            <td>${publicText(project.facts?.completion || "Needs verification")}</td>
            <td>${floorplans?.count ? `${floorplans.count} records` : "Request current packet"}</td>
            <td>${publicText(staticBuyerFit(project))}</td>
            <td>${publicText(firstVerificationNote(project))}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
}

function staticBuyerFit(project) {
  if (floorplanSignals(project)) return "Floor-plan-first buyer";
  if (normalize(project.area).includes("downtown")) return "Walkability buyer";
  if (normalize(project.area) === "palm-beach") return "Palm Beach island buyer";
  if (normalize(project.area).includes("flagler")) return "Waterfront buyer";
  if (project.projectType === "rental") return "Rental resident";
  if (project.projectType === "office") return "Commercial tenant";
  if (/pipeline|planning|proposed/i.test(project.facts?.status || "")) return "Early pipeline watcher";
  return "Buyer-fit review needed";
}

function floorplanSignals(project) {
  return project.projectType === "condo-active-sales";
}

function corridorBestFit(slug) {
  const key = slug === "downtown-west-palm-beach" ? "downtown" : slug;
  if (key === "north-flagler") return "North Flagler is best for waterfront buyers who want the deepest active comparison set.";
  if (key === "south-flagler") return "South Flagler is best for buyers who want quieter waterfront positioning and Palm Beach proximity.";
  if (key === "palm-beach") return "Palm Beach is best for buyers prioritizing an island address, low-density scale, and direct ocean or lagoon setting.";
  return "Downtown West Palm Beach is best for buyers who prioritize walkability, restaurants, district energy, and hotel-style service.";
}

function comparisonFaqForStatic() {
  return [
    {
      question: "What is the fastest way to compare West Palm Beach new-construction condos?",
      answer: "Choose the corridor first, then compare sourced status, delivery language, released floorplans, residence scale, and open verification notes. Current pricing, incentives, fees, and availability should come from the current buyer packet.",
    },
    {
      question: "Can Downtown, North Flagler, and South Flagler projects be compared directly?",
      answer: "Yes, but they answer different buyer goals. North Flagler is the main waterfront comparison set, Downtown is the walkability lane, and South Flagler is quieter and more residential.",
    },
    {
      question: "What should buyers verify before relying on comparison pages?",
      answer: "Confirm current pricing, live availability, line and stack, exposure, monthly fees, parking, storage, incentives, delivery timing, contract terms, and whether a public floorplan is still available.",
    },
  ];
}

function corridorFaqForStatic(corridor, projects) {
  const names = projects.slice(0, 4).map((project) => project.name).join(", ");
  return [
    {
      question: `What is the bottom line on ${corridor.label}?`,
      answer: `${corridor.label} is a distinct buyer lane in West Palm Beach new construction. Start with ${names || "the tracked project list"}, then confirm current packets before relying on public summaries.`,
    },
    {
      question: `Which ${corridor.label} buildings should buyers compare first?`,
      answer: names ? `Start with ${names}, then compare project pages, floorplan depth, timing, and open verification notes.` : "Start with the tracked project list, then confirm which buildings have current buyer packets and released floorplans.",
    },
    {
      question: `What should buyers verify in ${corridor.label}?`,
      answer: "Confirm current pricing, availability, incentives, fees, floor-plan release status, view exposure, delivery timing, and contract terms before making a purchase decision.",
    },
  ];
}

function comparisonProjectsForStatic(payload, project) {
  const explicit = {
    olara: ["shorecrest", "ritz-carlton-wpb"],
    shorecrest: ["olara", "ritz-carlton-wpb"],
    "ritz-carlton-wpb": ["olara", "shorecrest", "mandarin-oriental"],
    "south-flagler-house-north": ["maison-dor", "forte-on-flagler"],
    "alba-palm-beach": ["olara", "shorecrest"],
    berkeley: ["nora-house", "mr-c"],
    "nora-house": ["berkeley", "mr-c", "banyan-tree"],
    "forte-on-flagler": ["maison-dor", "south-flagler-house-north"],
    "mr-c": ["nora-house", "berkeley", "banyan-tree"],
    "maison-dor": ["south-flagler-house-north", "forte-on-flagler"],
  }[project.projectId] || [];
  const byId = new Map(payload.projectFacts.map((item) => [item.projectId, item]));
  const explicitProjects = explicit.map((id) => byId.get(id)).filter(Boolean);
  if (explicitProjects.length) return explicitProjects;
  return payload.projectFacts
    .filter((item) => item.projectId !== project.projectId && normalize(item.area) === normalize(project.area))
    .slice(0, 3);
}

function projectFaqForStatic(project, floorplans) {
  return [
    {
      question: `What is the bottom line on ${project.name}?`,
      answer: `${project.name} is a ${project.area || "West Palm Beach"} ${String(project.projectType || "project").replace(/-/g, " ")} profile. Verify current pricing, availability, incentives, fees, square footage, delivery timing, and contract terms before relying on public summaries.`,
    },
    {
      question: `Are floorplans available for ${project.name}?`,
      answer: floorplans?.count
        ? `${floorplans.count} floorplan records are tracked, but the current buyer packet should control availability, stack, exposure, and pricing.`
        : "No complete public floorplan packet is confirmed in the current catalog. Request the current buyer packet before comparing lines or stacks.",
    },
    {
      question: `What should buyers verify before relying on ${project.name} information?`,
      answer: "Confirm current pricing or rent, availability, fees, floor-plan release status, delivery timing, and the terms that apply to the specific residence or space.",
    },
  ];
}

function sourceLinksForProject(project) {
  return (project.sources || []).map((source) => source.url).filter(Boolean).filter((href, index, list) => list.indexOf(href) === index);
}

function sourceLabel(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function isFloorplanSourceHref(href) {
  return /floor\s*plans?|floorplans?|floor-plan|floorplan|downloads|[/-]plans?[._/-]|plans?\.pdf(?:$|[?#])/i.test(href);
}

function renderStaticSourceLink(href, projectId) {
  if (isFloorplanSourceHref(href)) {
    return `<a href="/floorplans/#floorplans-${escapeHtml(projectId)}" style="color: var(--bronze); text-decoration: none;">WPB floorplan library</a>`;
  }
  return `<a href="${safeHref(href)}" style="color: var(--bronze); text-decoration: none;">${publicText(sourceLabel(href))}</a>`;
}

function buildRouteSchema(route, payload, canonical) {
  const routeKind = routeKindForPath(route.path);
  const schemaDescription = routeKind.type === "project"
    ? `${route.title.replace(/\s+\|\s+.*$/, "")} buyer guide with source-backed project context and verification notes.`
    : route.description;
  const baseGraph = [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#brokerage`,
      name: payload.siteMeta.publisher?.name || "Douglas Elliman Florida, LLC d/b/a Douglas Elliman",
      url: "https://www.elliman.com/",
      telephone: "+1-561-891-0186",
      areaServed: payload.siteMeta.publisher?.areaServed || "West Palm Beach, Florida",
    },
    {
      "@type": "RealEstateAgent",
      "@id": `${baseUrl}/#advisor`,
      name: payload.siteMeta.expertByline?.name || "The Scott Gordon Group",
      description: payload.siteMeta.expertByline?.title || "Palm Beach waterfront and new-construction advisory team",
      telephone: "+1-561-891-0186",
      parentOrganization: { "@id": `${baseUrl}/#brokerage` },
    },
    {
      "@type": "Person",
      "@id": `${baseUrl}/#brooke-snader`,
      name: "Brooke Matthew Snader",
      jobTitle: "Broker Associate",
      worksFor: { "@id": `${baseUrl}/#advisor` },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: payload.siteMeta.siteName || "WPB New Construction",
      url: baseUrl,
      publisher: { "@id": `${baseUrl}/#advisor` },
    },
    {
      "@type": route.path === "/" ? "CollectionPage" : "WebPage",
      "@id": `${canonical}#webpage`,
      name: route.title,
      url: canonical,
      description: schemaDescription,
      isPartOf: { "@id": `${baseUrl}/#website` },
      reviewedBy: { "@id": `${baseUrl}/#brooke-snader` },
    },
    breadcrumbSchema(route, canonical),
  ];

  const routeGraph = [];
  if (routeKind.type === "project") {
    const project = projectForSlug(payload, routeKind.slug);
    if (project) routeGraph.push(projectSchema(project, payload));
  } else if (routeKind.type === "corridor") {
    routeGraph.push(itemListSchema(canonical, "Tracked corridor projects", payload.projectFacts.filter((project) => normalize(project.area).includes(normalize(corridorDetails[routeKind.slug]?.label || ""))).map((project) => ({ name: project.name, url: `${baseUrl}${projectPath(project)}` }))));
  } else if (route.path === "/" || route.path === "/buildings/" || route.path === "/compare/") {
    routeGraph.push(itemListSchema(canonical, "West Palm Beach New Construction Projects", priorityProjectFacts(payload).map((project) => ({ name: project.name, url: `${baseUrl}${projectPath(project)}` }))));
  } else if (route.path === "/floorplans/") {
    routeGraph.push(itemListSchema(canonical, "West Palm Beach New Construction Floorplans", payload.floorplanLibrary.filter((project) => project.count > 0).map((project) => ({ name: project.name, url: `${baseUrl}/floorplans/#floorplans-${project.projectId}` }))));
  } else if (route.path === "/answers/") {
    routeGraph.push(faqSchema(payload.answerFaq));
  } else if (routeKind.type === "answer") {
    const answer = payload.buyerIntentAnswers.find((item) => item.slug === routeKind.slug);
    if (answer) routeGraph.push(buyerIntentFaqSchema(answer, canonical));
  } else if (routeKind.type === "update") {
    const item = payload.approvedNews.find((news) => (news.slug || news.id) === routeKind.slug);
    if (item) routeGraph.push(newsArticleSchema(item, canonical));
  } else if (routeKind.type === "market-note") {
    routeGraph.push(articleSchema(route, canonical));
  }

  return {
    "@context": "https://schema.org",
    "@graph": [...baseGraph, ...routeGraph],
  };
}

function breadcrumbSchema(route, canonical) {
  const parts = [{ name: "Home", item: `${baseUrl}/` }];
  if (route.path !== "/") {
    const segments = route.path.split("/").filter(Boolean);
    if (segments[0] === "projects") parts.push({ name: "Buildings", item: `${baseUrl}/buildings/` });
    if (segments[0] === "updates") parts.push({ name: "Updates", item: `${baseUrl}/updates/` });
    if (segments[0] === "market-notes") parts.push({ name: "Guidance", item: `${baseUrl}/market-notes/` });
    if (segments[0] === "corridors") parts.push({ name: "Corridors", item: `${baseUrl}/buildings/` });
    parts.push({ name: route.title.replace(/\s+\|\s+.*$/, ""), item: canonical });
  }
  return {
    "@type": "BreadcrumbList",
    itemListElement: parts.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };
}

function projectSchema(project, payload) {
  const schemaFacts = payload.projectSchemaSafe.find((item) => item.identity?.slug === project.projectId);
  const safeFields = schemaFacts?.safeFields || { name: project.name, url: `${baseUrl}${projectPath(project)}` };
  const publicProject = payload.projectModel.find((item) => item.publicSlug === project.projectId);
  const presentation = publicProject?.presentation;
  const unitCount = Number(String(safeFields.residenceCount || "").match(/\d+/)?.[0] || 0) || undefined;
  const projectLocality = normalize(project.area) === "palm-beach" ? "Palm Beach" : "West Palm Beach";
  return {
    "@type": schemaTypeForProject(project.projectType),
    "@id": `${baseUrl}${projectPath(project)}#project`,
    name: safeFields.name,
    url: safeFields.url,
    description: `${safeFields.name} buyer guide with source-backed project context and verification notes.`,
    address: safeFields.address ? {
      "@type": "PostalAddress",
      streetAddress: safeFields.address,
      addressLocality: projectLocality,
      addressRegion: "FL",
      addressCountry: "US",
    } : undefined,
    latitude: presentation?.latitude,
    longitude: presentation?.longitude,
    image: presentation?.image ? `${baseUrl}${presentation.image}` : undefined,
    areaServed: `${projectLocality}, Florida`,
    containedInPlace: { "@type": "City", name: projectLocality },
    numberOfAccommodationUnits: unitCount,
    ...(safeFields.status ? { status: safeFields.status } : {}),
    subjectOf: { "@id": `${baseUrl}${projectPath(project)}#webpage` },
    reviewedBy: { "@id": `${baseUrl}/#brooke-snader` },
  };
}

function schemaTypeForProject(projectType) {
  if (projectType === "hotel-residences") return ["Hotel", "ApartmentComplex"];
  if (projectType === "office" || projectType === "mixed-use" || projectType === "condo-pipeline") return "Place";
  return "ApartmentComplex";
}

function itemListSchema(canonical, name, items) {
  return {
    "@type": "ItemList",
    "@id": `${canonical}#itemlist`,
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

function faqSchema(faq) {
  return {
    "@type": "FAQPage",
    "@id": `${baseUrl}/answers/#faq`,
    name: "West Palm Beach New Construction Answers",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: gatekeeperText(item.question),
      acceptedAnswer: { "@type": "Answer", text: gatekeeperText(item.answer) },
    })),
  };
}

function buyerIntentFaqSchema(answer, canonical) {
  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    name: answer.title,
    mainEntity: answer.faqs.map((item) => ({
      "@type": "Question",
      name: gatekeeperText(item.question),
      acceptedAnswer: { "@type": "Answer", text: gatekeeperText(item.answer) },
    })),
  };
}

function newsArticleSchema(item, canonical) {
  return {
    "@type": "NewsArticle",
    "@id": `${canonical}#article`,
    headline: item.title,
    description: item.description || item.summary || item.deck,
    datePublished: item.publishedAt || item.sourcePublishedAt,
    dateModified: item.fetchedAt || item.publishedAt,
    author: { "@id": `${baseUrl}/#brooke-snader` },
    publisher: { "@id": `${baseUrl}/#advisor` },
    mainEntityOfPage: canonical,
  };
}

function articleSchema(route, canonical) {
  return {
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: route.title.replace(/\s+\|\s+.*$/, ""),
    description: route.description,
    author: { "@id": `${baseUrl}/#brooke-snader` },
    publisher: { "@id": `${baseUrl}/#advisor` },
    mainEntityOfPage: canonical,
  };
}

function stripImageTokens(value) {
  return String(value ?? "")
    .replace(/\[\[image:[a-zA-Z0-9_-]+\]\]/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +\n/g, "\n")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function safeHref(value) {
  const href = String(value ?? "");
  if (!href || /^(?:javascript|data):/i.test(href)) return "#";
  return escapeHtml(href);
}

function normalize(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function gatekeeperText(value) {
  return String(value ?? "")
    .replace(/\bdevelopers?\b/gi, "project sponsor")
    .replace(/\bsales team\b/gi, "buyer-side review")
    .replace(/\bsales gallery\b/gi, "buyer packet")
    .replace(/\bofficial project sites?\b/gi, "reviewed project materials")
    .replace(/\bofficial source\b/gi, "reviewed source")
    .replace(/\bdeveloper material\b/gi, "reviewed material")
    .replace(/\bproject sponsor material\b/gi, "reviewed material")
    .replace(/\bdeveloper announcements?\b/gi, "project announcements")
    .replace(/\bdeveloper disclaimers?\b/gi, "project disclosures")
    .replace(/\bdeveloper legal notices?\b/gi, "project legal notices")
    .replace(/\bdeveloper disclosure package\b/gi, "required condominium disclosure package")
    .replace(/\bproject-source-catalog\b/gi, "project review file")
    .replace(/\bsource-catalog\b/gi, "review file")
    .replace(/\bbackend\b/gi, "internal")
    .replace(/\bSource:\s*/gi, "");
}

function publicText(value) {
  return escapeHtml(gatekeeperText(value));
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
