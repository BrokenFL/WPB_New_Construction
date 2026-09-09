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
const batch4InquiryInterests = new Set(["Request current availability", "Pricing + floor-plan packet"]);

let recordsPromise: Promise<Batch4Project[]> | null = null;
async function loadRecords() {
  recordsPromise ??= fetch("/data/project-seo-batch4.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Batch 4 project SEO data failed to load: ${response.status}`);
      return response.json() as Promise<Batch4Project[]>;
    });
  return recordsPromise;
}

function ensureStyles() {
  if (document.head.querySelector('link[data-project-seo-batch4-style]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/project-seo-batch4.css";
  link.dataset.projectSeoBatch4Style = "true";
  document.head.append(link);
}

function meta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  const node = document.head.querySelector<HTMLMetaElement>(selector);
  if (node) node.content = content;
}

function canonicalSchemaScript() {
  const canonical = document.head.querySelector<HTMLScriptElement>('#wpb-static-structured-data[type="application/ld+json"]');
  if (canonical) return canonical;

  // The legacy SPA router replaces the prerendered static script with its
  // single #wpb-structured-data graph on a pathname change. Adopt that same
  // node instead of allowing a parallel schema script; syncCanonicalSchema()
  // then replaces its contents with the target route's fully postbuilt graph.
  const legacyRuntime = document.head.querySelector<HTMLScriptElement>('#wpb-structured-data[type="application/ld+json"]');
  if (!legacyRuntime) return null;
  legacyRuntime.id = "wpb-static-structured-data";
  delete legacyRuntime.dataset.staticPath;
  return legacyRuntime;
}

function patchCanonicalPageNode(script: HTMLScriptElement, record: Batch4Project) {
  if (!script.textContent) return;
  const schema = JSON.parse(script.textContent) as { "@graph"?: Array<Record<string, unknown>> };
  if (!Array.isArray(schema["@graph"])) throw new Error(`${record.path}: canonical schema has no @graph`);
  const page = schema["@graph"].find((node) => node["@id"] === `${record.canonical}#webpage`);
  if (!page) throw new Error(`${record.path}: canonical WebPage node missing`);
  page.name = record.h1;
  page.description = record.description;
  page.dateModified = record.reviewedOn;
  script.textContent = JSON.stringify(schema);
}

async function syncCanonicalSchema(record: Batch4Project) {
  // Remove obsolete parallel graphs if a stale hydrated DOM ever contains one.
  document.head.querySelector('#wpb-project-seo-batch4-schema')?.remove();
  document.head.querySelector('#wpb-authorship-schema')?.remove();

  const current = canonicalSchemaScript();
  if (!current) throw new Error(`${record.path}: canonical schema script missing`);
  const currentPath = cleanPath(current.dataset.staticPath || "");
  const targetPath = cleanPath(record.path);

  if (currentPath !== targetPath) {
    const response = await fetch(targetPath, {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "text/html" },
    });
    if (!response.ok) throw new Error(`${record.path}: could not load canonical schema source (${response.status})`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const target = doc.head.querySelector<HTMLScriptElement>('#wpb-static-structured-data[type="application/ld+json"]');
    if (!target?.textContent) throw new Error(`${record.path}: fetched canonical schema script missing`);
    const parsed = JSON.parse(target.textContent) as { "@graph"?: unknown[] };
    if (!Array.isArray(parsed["@graph"])) throw new Error(`${record.path}: fetched canonical schema has no @graph`);
    if (cleanPath(location.pathname) !== targetPath) return;
    current.textContent = target.textContent;
    current.dataset.staticPath = targetPath;
  }

  patchCanonicalPageNode(current, record);
}

async function updateHead(record: Batch4Project) {
  document.title = record.title;
  meta("description", record.description);
  meta("og:title", record.title, true);
  meta("og:description", record.description, true);
  meta("og:url", record.canonical, true);
  meta("twitter:title", record.title);
  meta("twitter:description", record.description);
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = record.canonical;
  await syncCanonicalSchema(record);
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

async function installForRecord(app: HTMLElement, record: Batch4Project) {
  ensureStyles();
  await updateHead(record);
  if (cleanPath(location.pathname) !== cleanPath(record.path)) return;
  const projectView = Array.from(app.querySelectorAll<HTMLElement>('[data-route-view="project"][data-project-id]'))
    .find((view) => view.dataset.projectId === record.slug);
  const h1 = projectView?.querySelector<HTMLHeadingElement>("h1");
  if (h1 && h1.textContent?.trim() !== record.h1) h1.textContent = record.h1;
  const existing = app.querySelector<HTMLElement>("#wpb-project-seo-batch4");
  if (existing?.dataset.projectId === record.projectId) return;
  existing?.remove();
  const main = app.querySelector("main") ?? app;
  const firstSection = main.querySelector(":scope > section");
  if (firstSection) firstSection.insertAdjacentHTML("afterend", renderGuide(record));
  else main.insertAdjacentHTML("afterbegin", renderGuide(record));
}

export function batch4InquiryRequest(records: Batch4Project[], pathname: string, search: string) {
  if (!/^\/inquire\/?$/.test(pathname)) return undefined;
  const params = new URLSearchParams(search);
  const projectId = params.get("project");
  const interest = params.get("interest");
  if (!projectId || !interest || !batch4InquiryInterests.has(interest)) return undefined;
  const record = records.find((candidate) => candidate.projectId === projectId);
  return record ? { record, interest, fingerprint: `${pathname}?${params.toString()}` } : undefined;
}

function ensureBatch4InterestOption(select: HTMLSelectElement, interest: string) {
  if (Array.from(select.options).some((option) => option.value === interest)) return;
  const option = document.createElement("option");
  option.value = interest;
  option.textContent = interest;
  select.append(option);
}

export async function installProjectSeoBatch4(app: HTMLElement) {
  const records = await loadRecords();
  let current = "";
  let inquiryFingerprint = "";
  let refreshSequence = 0;

  const syncInquiryRequest = () => {
    const request = batch4InquiryRequest(records, location.pathname, location.search);
    if (!request) {
      inquiryFingerprint = "";
      return;
    }
    if (request.fingerprint === inquiryFingerprint) return;

    const form = app.querySelector<HTMLFormElement>(".inquiry-form");
    const project = form?.querySelector<HTMLSelectElement>('select[name="project"]');
    const interest = form?.querySelector<HTMLSelectElement>('select[name="interest"]');
    if (!form || !project || !interest) return;

    project.value = request.record.slug;
    ensureBatch4InterestOption(interest, request.interest);
    interest.value = request.interest;
    form.querySelector<HTMLInputElement>('[name="source_page"]')?.setAttribute("value", location.href);
    form.querySelector<HTMLElement>('[data-shortlist-review]')?.remove();
    delete form.dataset.leadProjectSlug;
    delete form.dataset.leadCtaLabel;
    delete form.dataset.leadCtaLocation;
    inquiryFingerprint = request.fingerprint;
  };

  const refresh = async () => {
    const sequence = ++refreshSequence;
    syncInquiryRequest();
    const path = cleanPath(location.pathname);
    const record = records.find((candidate) => cleanPath(candidate.path) === path);
    if (!record) {
      app.querySelector("#wpb-project-seo-batch4")?.remove();
      current = "";
      return;
    }
    const fingerprint = `${path}:${record.reviewedOn}`;
    if (current === fingerprint && app.querySelector("#wpb-project-seo-batch4")) return;
    await installForRecord(app, record);
    if (sequence !== refreshSequence || cleanPath(location.pathname) !== path) return;
    current = fingerprint;
  };

  const scheduleRefresh = () => { void refresh().catch((error) => console.error("Unable to synchronize Batch 4 project guide", error)); };
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(app, { childList: true, subtree: true });
  window.addEventListener("popstate", scheduleRefresh);
  app.addEventListener("click", () => queueMicrotask(scheduleRefresh));
  await refresh();
}
