import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distRoot = path.join(root, "dist");
const registryPath = path.join(root, "public/data/contributors.json");
const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));

const cleanPath = (pathname) => {
  const normalized = pathname.replace(/\\/g, "/").replace(/\/+/g, "/");
  if (normalized === "." || normalized === "") return "/";
  const withLeading = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const familyFor = (route) => {
  if (route === "/about/") return "about";
  if (route === "/methodology/") return "methodology";
  if (route === "/compare/") return "compare";
  if (/^\/projects\/[^/]+\/$/.test(route)) return "project";
  if (/^\/corridors\/[^/]+\/$/.test(route)) return "corridor";
  if (/^\/answers\/[^/]+\/$/.test(route)) return "answer";
  if (/^\/updates\/[^/]+\/$/.test(route)) return "update";
  if (/^\/market-notes\/[^/]+\/$/.test(route)) return "market-note";
  if (/^\/downtown-spotlight\/[^/]+\/$/.test(route)) return "downtown-spotlight";
  return "";
};

const assignmentFor = (route, family) => registry.routeAssignments?.[route] ?? registry.assignmentPolicy?.[family] ?? {};
const personFor = (id) => registry.contributors.find((person) => person.id === id);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
const jsonForHtml = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function trustHtml(route, assignment) {
  const author = personFor(assignment.author);
  const reviewer = personFor(assignment.reviewer);
  if (!author && !reviewer) return "";
  const people = [];
  if (author) people.push(`Written by <a href="${escapeHtml(author.profileUrl)}">${escapeHtml(author.name)}</a>`);
  if (reviewer) people.push(`Reviewed by <a href="${escapeHtml(reviewer.profileUrl)}">${escapeHtml(reviewer.name)}</a>`);
  return `<aside id="wpb-authorship-trust" data-path="${escapeHtml(route)}" class="wpb-authorship-trust" aria-label="Editorial responsibility"><div class="wpb-authorship-trust__people">${people.join(" <span aria-hidden=\"true\">·</span> ")}</div><div class="wpb-authorship-trust__method"><a href="/methodology/">How we verify project information</a></div></aside>`;
}

function profileHtml(person) {
  return `<article id="${escapeHtml(person.id)}" class="wpb-contributor-profile"><h3>${escapeHtml(person.name)}</h3><p class="wpb-contributor-profile__role">${escapeHtml(person.role)} · ${escapeHtml(person.team)} · ${escapeHtml(person.brokerage)}</p><p>${escapeHtml(person.bio)}</p><p><strong>Focus:</strong> ${person.geographicFocus.map(escapeHtml).join(", ")} · <strong>Areas:</strong> ${person.expertise.map(escapeHtml).join(", ")}</p><p><strong>Florida license:</strong> ${escapeHtml(person.license)} · <a href="${escapeHtml(person.sameAs?.[0] || person.profileUrl)}" rel="noopener noreferrer">Douglas Elliman profile</a></p></article>`;
}

function profilesHtml() {
  return `<section id="wpb-contributor-profiles" class="wpb-contributor-profiles" aria-labelledby="wpb-contributor-profiles-title"><h2 id="wpb-contributor-profiles-title">People responsible for this guide</h2><p>WPB New Construction uses named real people only where editorial responsibility is assigned. Project facts are assembled from official and public sources; current pricing, availability, incentives, fees and contract terms still require direct confirmation.</p><div class="wpb-contributor-profiles__grid">${registry.contributors.map(profileHtml).join("")}</div><p><a href="/methodology/">Read the source and review methodology</a></p></section>`;
}

function schemaFor(route, family, assignment) {
  const canonical = `https://www.wpbnewconstruction.com${route}`;
  const author = personFor(assignment.author);
  const reviewer = personFor(assignment.reviewer);
  const page = {
    "@type": family === "about" ? "AboutPage" : "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    isPartOf: { "@id": "https://www.wpbnewconstruction.com/#website" },
  };
  if (author) page.author = { "@id": author.schemaId };
  if (reviewer) page.reviewedBy = { "@id": reviewer.schemaId };
  const graph = [page];
  if (family === "about") {
    for (const person of registry.contributors) {
      graph.push({
        "@type": "Person",
        "@id": person.schemaId,
        name: person.name,
        url: person.profileUrl,
        jobTitle: person.role,
        worksFor: { "@id": registry.organization.id },
        knowsAbout: person.expertise,
        areaServed: person.geographicFocus,
        sameAs: person.sameAs,
      });
    }
    graph.push({
      "@type": registry.organization.type,
      "@id": registry.organization.id,
      name: registry.organization.name,
      url: registry.organization.url,
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

async function htmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(full));
    else if (entry.name === "index.html") files.push(full);
  }
  return files;
}

let attributed = 0;
let profiles = 0;
for (const file of await htmlFiles(distRoot)) {
  const relativeDir = path.relative(distRoot, path.dirname(file));
  const route = cleanPath(relativeDir);
  const family = familyFor(route);
  if (!family) continue;
  const assignment = assignmentFor(route, family);
  const trust = trustHtml(route, assignment);
  const needsSchema = Boolean(assignment.author || assignment.reviewer || family === "about");
  if (!trust && family !== "about" && !needsSchema) continue;

  let html = await fs.readFile(file, "utf8");
  html = html.replace(/<aside id="wpb-authorship-trust"[\s\S]*?<\/aside>/, "");
  html = html.replace(/<script id="wpb-authorship-schema"[\s\S]*?<\/script>/, "");
  if (family === "about") html = html.replace(/<section id="wpb-contributor-profiles"[\s\S]*?<\/section>/, "");

  if (trust) {
    const h1End = html.indexOf("</h1>");
    if (h1End < 0) throw new Error(`${route}: no H1 available for authorship trust insertion`);
    html = `${html.slice(0, h1End + 5)}${trust}${html.slice(h1End + 5)}`;
    attributed += 1;
  }
  if (family === "about") {
    const mainEnd = html.lastIndexOf("</main>");
    if (mainEnd < 0) throw new Error("/about/: no main element available for contributor profiles");
    html = `${html.slice(0, mainEnd)}${profilesHtml()}${html.slice(mainEnd)}`;
    profiles += 1;
  }
  if (needsSchema) {
    html = html.replace("</head>", `<script id="wpb-authorship-schema" type="application/ld+json" data-authorship-path="${escapeHtml(route)}">${jsonForHtml(schemaFor(route, family, assignment))}</script></head>`);
  }
  await fs.writeFile(file, html);
}

console.log(JSON.stringify({ authorshipTrust: "applied", attributedRoutes: attributed, profileSections: profiles }, null, 2));
