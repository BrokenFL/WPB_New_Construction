import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const templatePath = path.join(distRoot, "index.html");
const siteDataPath = path.join(workspace, "src/generated/siteData.ts");
const answerFaqPath = path.join(workspace, "public/data/answer-engine-faq.json");
const baseUrl = "https://wpbnewconstruction.com";

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
  const canonical = `${baseUrl}${route.path}`;
  const staticContent = renderStaticRouteContent(route, staticPayload);
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(route.ogImage)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

  html = html.replace('<div id="app"></div>', `<div id="app">${staticContent}</div><script>window.__WPB_PRERENDER_PATH__=${JSON.stringify(route.path)};</script>`);
  return html;
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
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return `
    <main class="static-prerender" data-static-prerender="answers">
      <section>
        <p>Answer Engine Q&amp;A</p>
        <h1>West Palm Beach new-construction answers with source context.</h1>
        <p>These answers are prerendered for crawler and answer-engine review. Current availability, pricing, incentives, square footage, and delivery dates require direct confirmation before reliance.</p>
      </section>
      ${faq
        .map(
          (item) => `
            <article id="${escapeHtml(item.id)}">
              <h2>${escapeHtml(item.question)}</h2>
              <p>${escapeHtml(item.answer)}</p>
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
  const latestDate = citations.find((source) => source.dateAccessed)?.dateAccessed ?? "current source review";
  if (!citations.length) {
    return `<p>Sources reviewed: ${(item.sources ?? []).map(escapeHtml).join("; ")}. Accessed: ${escapeHtml(latestDate)}. Confidence: source-limited; not current pricing, availability, or contract guidance.</p>`;
  }

  return `
    <p>Sources reviewed: ${citations
      .map((source) => `<a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a>`)
      .join("; ")}. Accessed: ${escapeHtml(latestDate)}. Confidence: source-limited; not current pricing, availability, or contract guidance.</p>
    <ul>
      ${citations
        .map(
          (source) => `
            <li>
              <a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a>
              <span>${escapeHtml(source.supportsClaim ?? "Source context")}: ${escapeHtml(source.claimText ?? source.note ?? "")}</span>
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
