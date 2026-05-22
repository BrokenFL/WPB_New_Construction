import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const templatePath = path.join(distRoot, "index.html");
const siteDataPath = path.join(workspace, "src/generated/siteData.ts");
const answerFaqPath = path.join(workspace, "public/data/answer-engine-faq.json");
const baseUrl = "https://www.wpbnewconstruction.com";

async function main() {
  const template = await fs.readFile(templatePath, "utf8");
  const siteData = await fs.readFile(siteDataPath, "utf8");
  const staticPayload = await loadStaticPayload();
  const routes = parsePrerenderRoutes(siteData);

  for (const route of routes) {
    const html = renderRouteHtml(template, route, staticPayload);
    const outDir = path.join(distRoot, route.path.replace(/^\/|\/$/g, ""));
    const outPath = route.path === "/" ? templatePath : path.join(outDir, "index.html");
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html);
  }

  console.log(JSON.stringify({ prerenderedRoutes: routes.length }, null, 2));
}

function parsePrerenderRoutes(siteData) {
  const match = siteData.match(/export const prerenderRoutes = (\[[\s\S]*?\]) as const;/);
  if (!match) {
    throw new Error("Could not find prerenderRoutes export in src/generated/siteData.ts");
  }
  return JSON.parse(match[1]);
}

async function loadStaticPayload() {
  try {
    return {
      answerFaq: JSON.parse(await fs.readFile(answerFaqPath, "utf8")),
    };
  } catch {
    return { answerFaq: [] };
  }
}

function renderRouteHtml(template, route, staticPayload) {
  const canonical = `${baseUrl}${canonicalPathForRoute(route.path)}`;
  const staticContent = renderStaticRouteContent(route, staticPayload);
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

  html = html.replace('<div id="app"></div>', `<div id="app">${staticContent}</div><script>window.__WPB_PRERENDER_PATH__=${JSON.stringify(route.path)};</script>`);
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

function renderStaticRouteContent(route, staticPayload) {
  if (route.path !== "/answers/") {
    return "";
  }

  const faq = Array.isArray(staticPayload.answerFaq) ? staticPayload.answerFaq : [];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: gatekeeperText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: gatekeeperText(item.answer),
      },
    })),
  };

  return `
    <main class="static-prerender" data-static-prerender="answers">
      <section>
        <p>Buyer Q&amp;A</p>
        <h1>West Palm Beach new-construction answers with reviewed context.</h1>
        <p>Current availability, pricing, incentives, square footage, and delivery dates require current buyer-side confirmation before reliance.</p>
      </section>
      ${faq
        .map(
          (item) => `
            <article id="${escapeHtml(item.id)}">
              <h2>${publicText(item.question)}</h2>
              <p>${publicText(item.answer)}</p>
              ${renderStaticCitations(item)}
            </article>
          `,
        )
        .join("")}
      <script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g, "\\u003c")}</script>
    </main>
  `;
}

function renderStaticCitations(item) {
  const citations = Array.isArray(item.sourceCitations) ? item.sourceCitations : [];
  const latestDate = citations.find((source) => source.dateAccessed)?.dateAccessed ?? "current review";
  if (!citations.length) {
    return `<p>Review basis: ${(item.sources ?? []).map(publicText).join("; ")}. Checked: ${escapeHtml(latestDate)}. Buyer note: verify pricing, availability, and contract details before relying on this.</p>`;
  }

  return `
    <p>Review basis: ${citations
        .map((source) => publicText(source.label))
      .join("; ")}. Checked: ${escapeHtml(latestDate)}. Buyer note: verify pricing, availability, and contract details before relying on this.</p>
    <ul>
      ${citations
        .map(
          (source) => `
            <li>
              <strong>${publicText(source.label)}</strong>
              <span>${publicText(source.supportsClaim ?? "Source context")}: ${publicText(source.claimText ?? source.note ?? "")}</span>
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
