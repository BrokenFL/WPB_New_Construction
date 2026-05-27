import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const templatePath = path.join(distRoot, "index.html");
const siteDataPath = path.join(workspace, "src/generated/siteData.ts");
const appSourcePath = path.join(workspace, "src/main.ts");
const approvedNewsPath = path.join(workspace, "research/news-review/approved-development-news.json");
const baseUrl = "https://www.wpbnewconstruction.com";

const projectAliases = new Map([
  ["south-flagler-house", "south-flagler-house-north"],
  ["edgeworth", "edgeworth-north"],
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
  if (routeKind.type === "market-note") return renderMarketNoteRoute(route, routeKind.slug);
  if (route.path === "/") return renderHomeRoute(route, payload);
  if (route.path === "/buildings/") return renderBuildingsRoute(route, payload);
  if (route.path === "/compare/") return renderCompareRoute(route, payload);
  if (route.path === "/floorplans/") return renderFloorplansRoute(route, payload);
  if (route.path === "/answers/") return renderAnswersRoute(route, payload);
  if (route.path === "/updates/") return renderUpdatesIndex(route, payload);
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
            <ul>
              ${project.plans.slice(0, 8).map((plan) => `<li><a href="${safeHref(plan.href || plan.sourceUrl || "#")}">${publicText(plan.title)}</a> - ${publicText(plan.status || plan.sourceUse || "Floorplan record")}</li>`).join("")}
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
  const facts = project.facts || {};
  const sources = sourceLinksForProject(project).slice(0, 6);
  const comparisons = comparisonProjectsForStatic(payload, project).slice(0, 4);
  const hasSourcedAmenities = sources.some((href) => /amenit/i.test(href));
  const cleanStatus = facts.status && !facts.status.toLowerCase().includes("candidate") ? facts.status : "Tracked project page";

  return pageShell(
    `project-${slug}`,
    project.name,
    route.description,
    `
      <section>
        <h2>Bottom line</h2>
        <p>${publicText(project.name)} is tracked as a ${publicText(project.area || "West Palm Beach")} project page. Use this page for orientation, then verify current pricing, availability, incentives, fees, floor-plan release status, square footage, delivery timing, and contract terms before relying on any public summary.</p>
      </section>
      <section>
        <h2>Key facts to verify</h2>
        <dl>
          ${factRow("Address", facts.address)}
          ${factRow("Status", facts.status && !facts.status.toLowerCase().includes("candidate") ? facts.status : "Tracked project page")}
          ${factRow("Residences", facts.residences)}
          ${factRow("Stories", facts.stories)}
          ${factRow("Delivery", facts.completion)}
          ${factRow("Pricing", facts.pricing)}
          ${factRow("Project team", facts.team)}
          ${factRow("Floorplans", floorplans?.count ? `${floorplans.count} records tracked` : "Request current packet")}
        </dl>
      </section>
      <section>
        <h2>Why this page matters</h2>
        <p>This page gives AI crawlers and buyers one stable entity page for ${publicText(project.name)}. It separates sourced facts from items that need confirmation, links the building to its West Palm Beach corridor, and keeps the next step focused on current buyer-side verification.</p>
      </section>
      <section>
        <h2>Location and corridor context</h2>
        <p>${publicText(project.name)} is tracked in the ${publicText(project.area || "West Palm Beach")} lane. Compare this location by daily drive pattern, Palm Beach access, waterfront or downtown orientation, view exposure, parking, and what nearby construction may mean before touring.</p>
      </section>
      ${renderProjectCorridorCta(project, payload)}
      <section>
        <h2>Residence and floorplan overview</h2>
        <p>${floorplans?.count ? `${floorplans.count} floorplan records are currently tracked for this project.` : "No complete public floorplan packet is confirmed in the current catalog."} Public plans are not a substitute for the current buyer packet; confirm line, stack, exposure, square footage, fees, pricing, and availability.</p>
        ${floorplans?.plans?.length ? `<ul>${floorplans.plans.slice(0, 6).map((plan) => `<li>${publicText(plan.title)} - ${publicText(plan.status || plan.sourceUse || "Floorplan record")}</li>`).join("")}</ul>` : ""}
      </section>
      ${hasSourcedAmenities ? `<section>
        <h2>Amenities</h2>
        <p>Amenity information is referenced in reviewed project pages for this project. Confirm which amenities are included, optional, phased, or subject to association rules before relying on a public summary.</p>
      </section>` : ""}
      ${facts.team ? `<section>
        <h2>Project team</h2>
        <p>${publicText(facts.team)}. Team credits are included for buyer orientation and should be confirmed against the latest project packet or offering material.</p>
      </section>` : ""}
      ${comparisons.length ? `<section>
        <h2>Compare against</h2>
        <ul>${comparisons.map((item) => `<li><a href="${projectPath(item)}">${publicText(item.name)}</a> - ${publicText(item.area || "West Palm Beach")}</li>`).join("")}</ul>
      </section>` : ""}
      
      <section class="section technical-disclosures-accordion" style="margin-top: clamp(80px, 8vw, 120px); border-top: 1px solid rgba(37,42,45,0.08); padding-top: 40px;">
        <details style="cursor: pointer; outline: none;">
          <summary style="font-family: Georgia, serif; font-size: 1.15rem; font-weight: 500; color: var(--ink); margin-bottom: 20px; list-style: none; display: flex; align-items: center; gap: 8px;">
            <span>Sourcing Details & Technical Disclosures</span>
            <span style="font-size: 0.8rem; opacity: 0.6;">(Click to expand)</span>
          </summary>
          <div class="technical-disclosures-content" style="padding-top: 20px; color: var(--ink-soft); font-size: 0.95rem; line-height: 1.6;">
            <p>This building profile uses source material compiled from public records, developer announcements, and real estate filings. The details below are tracked for internal data verification and buyer risk assessment.</p>
            
            ${(project.missingInfo && project.missingInfo.length > 0) ? `
              <div style="margin-bottom: 20px;">
                <strong>Unconfirmed Details:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                  ${project.missingInfo.map(item => `<li>${publicText(item)}</li>`).join("")}
                </ul>
              </div>
            ` : ""}

            ${(project.conflicts?.length > 0 || project.gaps?.length > 0) ? `
              <div style="margin-bottom: 20px;">
                <strong>Conflicts & Gaps:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                  ${(project.conflicts || []).map(item => `<li>${publicText(item)}</li>`).join("")}
                  ${(project.gaps || []).map(item => `<li>${publicText(item)}</li>`).join("")}
                </ul>
              </div>
            ` : ""}

            <div style="margin-bottom: 20px;">
              <strong>Verification Logs:</strong>
              <ul style="margin: 10px 0 0 20px; padding: 0;">
                <li><strong>Database Records:</strong> ${project.sourceCounts?.official ?? 0} official, ${project.sourceCounts?.reporting ?? 0} reporting, ${project.sourceCounts?.other ?? 0} other references.</li>
                <li><strong>Confidence Level:</strong> ${publicText(project.dataConfidence || "Draft")}</li>
                ${sources.length ? `<li><strong>Reviewed Sources:</strong><br>${sources.map((href) => `<a href="${safeHref(href)}" style="color: var(--bronze); text-decoration: none;">${publicText(sourceLabel(href))}</a>`).join(" · ")}</li>` : ""}
              </ul>
            </div>
          </div>
        </details>
      </section>

      <section>
        <h2>FAQ</h2>
        ${projectFaqForStatic(project, floorplans).map((item) => `<article><h3>${publicText(item.question)}</h3><p>${publicText(item.answer)}</p></article>`).join("")}
      </section>
    `,
  );
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

function renderUpdateRoute(route, payload, slug) {
  const item = payload.approvedNews.find((news) => (news.slug || news.id) === slug) ||
    payload.researchNewsFeed.find((news) => news.id === slug);
  if (!item) return renderSimpleRoute(route);
  const sections = Array.isArray(item.bodySections) ? item.bodySections : [];
  return pageShell(
    `update-${slug}`,
    item.title,
    item.description || item.summary || route.description,
    `
      <article>
        <p>Published ${publicText(item.publishedAt || item.datePublished || "current review")} from ${publicText(item.sourceName || "reviewed source")}.</p>
        <p>${publicText(item.deck || item.summary || item.rewrittenSummary || route.description)}</p>
        ${sections.map((section) => `<section><h2>${publicText(section.heading)}</h2><p>${publicText(section.body)}</p></section>`).join("")}
        ${item.whyItMatters ? `<section><h2>Why it matters</h2><p>${publicText(item.whyItMatters)}</p></section>` : ""}
        ${item.buyerContext ? `<section><h2>Buyer context</h2><p>${publicText(item.buyerContext)}</p></section>` : ""}
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

function renderMarketNoteRoute(route, slug) {
  return pageShell(
    `market-note-${slug}`,
    route.title.replace(/\s+\|\s+.*$/, ""),
    route.description,
    `
      <article>
        <h2>Bottom line</h2>
        <p>${publicText(route.description)} This guide is buyer education, not a substitute for current building-specific pricing, availability, fee, or contract verification.</p>
        <h2>How to use this guidance</h2>
        <p>Use the guidance to frame questions before comparing West Palm Beach buildings. Then check project pages, current floor-plan packets, source-linked updates, and Brooke Snader / Douglas Elliman buyer-side review for the details that can change.</p>
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
          <p>${publicText(project.area || "West Palm Beach")} - ${publicText(project.facts?.status || project.pageStatus || "Status needs verification")}</p>
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

function renderConflictAndGapSection(project) {
  const items = [...(project.conflicts || []), ...(project.gaps || [])].filter(Boolean);
  if (!items.length) return "";
  return `
    <section>
      <h2>Items to confirm</h2>
      <ul>${items.map((item) => `<li>${publicText(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function priorityProjectFacts(payload) {
  return [...payload.projectFacts].sort((a, b) => {
    const aRank = a.pageStatus === "Primary condo page" ? 0 : a.pageStatus === "Candidate project page" ? 1 : 2;
    const bRank = b.pageStatus === "Primary condo page" ? 0 : b.pageStatus === "Candidate project page" ? 1 : 2;
    return aRank - bRank || a.name.localeCompare(b.name);
  });
}

function floorplanForProject(payload, projectId) {
  const aliases = new Set([projectId]);
  if (projectId === "south-flagler-house-north" || projectId === "south-flagler-house-south") aliases.add("south-flagler-house");
  return payload.floorplanLibrary.find((project) => aliases.has(project.projectId));
}

function projectForSlug(payload, slug) {
  const id = projectAliases.get(slug) || slug;
  return payload.projectFacts.find((project) => project.projectId === id || project.projectId === slug);
}

function projectPath(project) {
  const publicId = project.projectId === "south-flagler-house-north" || project.projectId === "south-flagler-house-south"
    ? "south-flagler-house"
    : project.projectId;
  return `/projects/${publicId}/`;
}

function corridorKeyForProject(project) {
  const area = normalize(project.area);
  if (area.includes("south-flagler")) return "south-flagler";
  if (area.includes("downtown")) return "downtown";
  return "north-flagler";
}

function corridorPathForKey(key) {
  return key === "downtown" ? "/corridors/downtown-west-palm-beach/" : `/corridors/${key}/`;
}

function corridorLabelForKey(key) {
  if (key === "north-flagler") return "North Flagler";
  if (key === "south-flagler") return "South Flagler";
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
  return project.conflicts?.[0] || project.gaps?.[0] || "Verify current pricing, availability, fees, incentives, square footage, delivery timing, and contract terms.";
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
      <thead><tr><th>Building</th><th>Corridor</th><th>Status</th><th>Delivery</th><th>Floorplans</th><th>Best fit</th><th>Verification note</th></tr></thead>
      <tbody>
        ${projects.map((project) => {
          const floorplans = floorplanForProject(payload, project.projectId);
          return `<tr>
            <td><a href="${projectPath(project)}">${publicText(project.name)}</a></td>
            <td>${publicText(project.area || "West Palm Beach")}</td>
            <td>${publicText(project.facts?.status || project.pageStatus || "Needs verification")}</td>
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
  if (normalize(project.area).includes("flagler")) return "Waterfront buyer";
  if (/pipeline|planning|proposed/i.test(project.pageStatus || project.facts?.status || "")) return "Early pipeline watcher";
  return "Buyer-fit review needed";
}

function floorplanSignals(project) {
  return /floorplan|floor plan/i.test(`${project.pageStatus || ""} ${project.gaps?.join(" ") || ""}`);
}

function corridorBestFit(slug) {
  const key = slug === "downtown-west-palm-beach" ? "downtown" : slug;
  if (key === "north-flagler") return "North Flagler is best for waterfront buyers who want the deepest active comparison set.";
  if (key === "south-flagler") return "South Flagler is best for buyers who want quieter waterfront positioning and Palm Beach proximity.";
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
      answer: `${project.name} is tracked as a ${project.area || "West Palm Beach"} project page with ${project.pageStatus || "buyer-guide"} status. Verify current pricing, availability, incentives, fees, square footage, delivery timing, and contract terms before relying on public summaries.`,
    },
    {
      question: `Are floorplans available for ${project.name}?`,
      answer: floorplans?.count
        ? `${floorplans.count} floorplan records are tracked, but the current buyer packet should control availability, stack, exposure, and pricing.`
        : "No complete public floorplan packet is confirmed in the current catalog. Request the current buyer packet before comparing lines or stacks.",
    },
    {
      question: `What should buyers verify before relying on ${project.name} information?`,
      answer: firstVerificationNote(project),
    },
  ];
}

function sourceLinksForProject(project) {
  return [
    project.officialWebsite,
    ...(project.highValueSources || []),
    ...(project.sourceBuckets?.official || []),
    ...(project.sourceBuckets?.reporting || []),
  ].filter(Boolean).filter((href, index, list) => list.indexOf(href) === index);
}

function sourceLabel(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function buildRouteSchema(route, payload, canonical) {
  const routeKind = routeKindForPath(route.path);
  const baseGraph = [
    {
      "@type": payload.siteMeta.publisher?.type || "RealEstateAgent",
      "@id": `${baseUrl}/#publisher`,
      name: payload.siteMeta.publisher?.name || "Douglas Elliman Florida, LLC d/b/a Douglas Elliman",
      url: baseUrl,
      telephone: "+1-561-891-0186",
      areaServed: payload.siteMeta.publisher?.areaServed || "West Palm Beach, Florida",
    },
    {
      "@type": "Person",
      "@id": `${baseUrl}/#advisor`,
      name: payload.siteMeta.expertByline?.name || "Brooke Matthew Snader",
      jobTitle: payload.siteMeta.expertByline?.title || "Licensed Real Estate Broker Associate",
      worksFor: { "@id": `${baseUrl}/#publisher` },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: payload.siteMeta.siteName || "WPB New Construction",
      url: baseUrl,
      publisher: { "@id": `${baseUrl}/#publisher` },
    },
    {
      "@type": route.path === "/" ? "CollectionPage" : "WebPage",
      "@id": `${canonical}#webpage`,
      name: route.title,
      url: canonical,
      description: route.description,
      isPartOf: { "@id": `${baseUrl}/#website` },
      reviewedBy: { "@id": `${baseUrl}/#advisor` },
    },
    breadcrumbSchema(route, canonical),
  ];

  const routeGraph = [];
  if (routeKind.type === "project") {
    const project = projectForSlug(payload, routeKind.slug);
    if (project) routeGraph.push(projectSchema(project));
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

function projectSchema(project) {
  const facts = project.facts || {};
  return {
    "@type": "Place",
    "@id": `${baseUrl}${projectPath(project)}#project`,
    name: project.name,
    url: `${baseUrl}${projectPath(project)}`,
    description: `${project.name} buyer guide for ${project.area || "West Palm Beach"} with source-backed facts and verification notes.`,
    address: facts.address ? {
      "@type": "PostalAddress",
      streetAddress: facts.address,
      addressLocality: "West Palm Beach",
      addressRegion: "FL",
      addressCountry: "US",
    } : undefined,
    containedInPlace: { "@type": "City", name: "West Palm Beach" },
    subjectOf: { "@id": `${baseUrl}${projectPath(project)}#webpage` },
    reviewedBy: { "@id": `${baseUrl}/#advisor` },
  };
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
    author: { "@id": `${baseUrl}/#advisor` },
    publisher: { "@id": `${baseUrl}/#publisher` },
    mainEntityOfPage: canonical,
  };
}

function articleSchema(route, canonical) {
  return {
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: route.title.replace(/\s+\|\s+.*$/, ""),
    description: route.description,
    author: { "@id": `${baseUrl}/#advisor` },
    publisher: { "@id": `${baseUrl}/#publisher` },
    mainEntityOfPage: canonical,
  };
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
