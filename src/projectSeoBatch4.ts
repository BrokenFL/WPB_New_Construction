import "./projectSeoBatch4.css";

type Batch4Link = { label: string; href: string };
type Batch4Source = { label: string; url: string; kind: "official" | "reporting" };
type Batch4Project = {
  projectId: string;
  slug: string;
  path: string;
  canonical: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  opening: string;
  buyerFit: string;
  location: string;
  status: { marketing: string; construction: string; availability: string };
  verifiedFacts: string[];
  amenities: string[];
  residences: string[];
  links: Batch4Link[];
  availabilityHref: string;
  packetHref: string;
  reviewedOn: string;
  sources: Batch4Source[];
};

const cleanPath = (value: string) => value === "/" ? value : `${value.replace(/\/+$/, "")}/`;
const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));

let recordsPromise: Promise<Batch4Project[]> | null = null;
async function loadRecords() {
  recordsPromise ??= fetch("/data/project-seo-batch4.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Batch 4 project SEO data failed to load: ${response.status}`);
      return response.json() as Promise<Batch4Project[]>;
    });
  return recordsPromise;
}

function meta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  const node = document.head.querySelector<HTMLMetaElement>(selector);
  if (node) node.content = content;
}

function updateHead(record: Batch4Project) {
  document.title = record.title;
  meta("description", record.description);
  meta("og:title", record.title, true);
  meta("og:description", record.description, true);
  meta("og:url", record.canonical, true);
  meta("twitter:title", record.title);
  meta("twitter:description", record.description);
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = record.canonical;

  let script = document.head.querySelector<HTMLScriptElement>('#wpb-project-seo-batch4-schema');
  if (!script) {
    script = document.createElement("script");
    script.id = "wpb-project-seo-batch4-schema";
    script.type = "application/ld+json";
    document.head.append(script);
  }
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${record.canonical}#buyer-guide`,
        url: record.canonical,
        name: record.h1,
        description: record.description,
        dateModified: record.reviewedOn,
        about: { "@type": "Residence", name: record.h1.replace(/ Buyer Guide$/, "") },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.wpbnewconstruction.com/" },
          { "@type": "ListItem", position: 2, name: "Buildings", item: "https://www.wpbnewconstruction.com/buildings/" },
          { "@type": "ListItem", position: 3, name: record.h1.replace(/ Buyer Guide$/, ""), item: record.canonical },
        ],
      },
    ],
  });
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function renderGuide(record: Batch4Project) {
  return `
    <section id="wpb-project-seo-batch4" class="p2-project-guide" data-project-id="${esc(record.projectId)}">
      <div class="p2-project-guide__inner">
        <p class="p2-project-guide__eyebrow">${esc(record.eyebrow)}</p>
        <h2>Buyer summary</h2>
        <p class="p2-project-guide__opening">${esc(record.opening)}</p>
        <div class="p2-project-guide__actions" aria-label="Current buyer requests">
          <a class="btn primary" data-project-growth-action="availability" href="${esc(record.availabilityHref)}">Request current availability</a>
          <a class="btn secondary" data-project-growth-action="pricing-packet" href="${esc(record.packetHref)}">Get pricing + floor-plan packet</a>
        </div>
        <div class="p2-project-guide__grid">
          <article><h3>Who this fits</h3><p>${esc(record.buyerFit)}</p></article>
          <article><h3>Location</h3><p>${esc(record.location)}</p></article>
        </div>
        <div class="p2-project-guide__status">
          <article><h3>Marketing status</h3><p>${esc(record.status.marketing)}</p></article>
          <article><h3>Construction status</h3><p>${esc(record.status.construction)}</p></article>
          <article><h3>Residence availability</h3><p>${esc(record.status.availability)}</p></article>
        </div>
        <div class="p2-project-guide__grid">
          <article><h3>Verified residence / layout facts</h3>${list(record.residences)}</article>
          <article><h3>Amenities and service</h3>${list(record.amenities)}</article>
        </div>
        <article><h3>Verified project facts</h3>${list(record.verifiedFacts)}</article>
        <nav class="p2-project-guide__links" aria-label="Related buyer research">
          <h3>Compare and keep researching</h3>
          <ul>${record.links.map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`).join("")}</ul>
        </nav>
        <details class="p2-project-guide__sources">
          <summary>Sources and review date</summary>
          <p>Reviewed ${esc(record.reviewedOn)}. Current pricing, residence availability, fees, incentives, contract terms and construction timing require current buyer-side confirmation.</p>
          <ul>${record.sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a> · ${esc(source.kind)}</li>`).join("")}</ul>
        </details>
      </div>
    </section>`;
}

function installForRecord(app: HTMLElement, record: Batch4Project) {
  updateHead(record);
  const h1 = app.querySelector<HTMLHeadingElement>("h1");
  if (h1 && h1.textContent !== record.h1) h1.textContent = record.h1;
  const existing = app.querySelector<HTMLElement>("#wpb-project-seo-batch4");
  if (existing?.dataset.projectId === record.projectId) return;
  existing?.remove();
  const main = app.querySelector("main") ?? app;
  const firstSection = main.querySelector(":scope > section");
  if (firstSection) firstSection.insertAdjacentHTML("afterend", renderGuide(record));
  else main.insertAdjacentHTML("afterbegin", renderGuide(record));
}

export async function installProjectSeoBatch4(app: HTMLElement) {
  const records = await loadRecords();
  let current = "";
  const refresh = () => {
    const path = cleanPath(location.pathname);
    const record = records.find((candidate) => cleanPath(candidate.path) === path);
    if (!record) {
      app.querySelector("#wpb-project-seo-batch4")?.remove();
      current = "";
      return;
    }
    if (current === `${path}:${record.reviewedOn}` && app.querySelector("#wpb-project-seo-batch4")) return;
    current = `${path}:${record.reviewedOn}`;
    installForRecord(app, record);
  };
  const observer = new MutationObserver(refresh);
  observer.observe(app, { childList: true, subtree: true });
  window.addEventListener("popstate", refresh);
  refresh();
}
