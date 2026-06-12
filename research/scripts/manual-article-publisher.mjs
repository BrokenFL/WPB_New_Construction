import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const workspace = process.cwd();
const inputPath = valueForArg("--input");
const shouldShip = process.argv.includes("--ship");
const now = new Date();
const today = now.toISOString().slice(0, 10);

const destinationConfig = {
  news: {
    label: "News Update",
    routeBase: "/updates/",
    publicSource: "research/news-review/approved-development-news.json",
  },
  buyer: {
    label: "Buyer Intelligence",
    routeBase: "/market-notes/",
    publicSource: "src/data/marketNotes.ts",
  },
  downtown: {
    label: "Downtown Spotlight",
    routeBase: "/downtown-spotlight/",
    publicSource: "src/data/marketNotes.ts",
  },
};

if (!inputPath) fail("--input is required.");

const input = JSON.parse(await fs.readFile(path.resolve(workspace, inputPath), "utf8"));
const destination = clean(input.destination || "news");
if (!destinationConfig[destination]) fail(`Unsupported destination: ${destination}`);

const title = clean(input.title);
const deck = clean(input.deck || input.excerpt || input.summary);
const articleBody = clean(input.body);
if (!title) fail("Title is required.");
if (!deck) fail("Deck / summary is required.");
if (!articleBody) fail("Article body is required.");

const slugBase = slug(input.slug || title);
const slugValue = uniqueSlug(`${slugBase}-${today}`, destination);
const articleId = destination === "news" ? slugValue : slugBaseForNote(slugValue);
const imagePaths = await writeImages(input, slugValue, destination);
const bodySections = articleSections(articleBody, imagePaths.body);

if (destination === "news") {
  await publishNewsUpdate({
    id: articleId,
    slug: slugValue,
    title,
    deck,
    bodySections,
    imagePath: imagePaths.hero,
  });
  await runChecked("npm", ["run", "news:promote"]);
} else {
  await publishMarketNote({
    id: articleId,
    slug: slugBaseForNote(slugValue),
    title,
    deck,
    bodySections,
    imagePath: imagePaths.hero,
    destination,
  });
}

await updateGeneratedRoutes({
  destination,
  slug: destination === "news" ? slugValue : slugBaseForNote(slugValue),
  title,
  description: deck,
  imagePath: imagePaths.hero,
});

await runChecked("npm", ["run", "build"]);
await runChecked("npm", ["run", "qa:launch"]);

const changedBeforeCommit = await run("git", ["status", "--short"]);
if (!changedBeforeCommit.stdout.trim()) {
  const route = `${destinationConfig[destination].routeBase}${destination === "news" ? slugValue : slugBaseForNote(slugValue)}/`;
  console.log(JSON.stringify({ ok: true, route, changedFiles: [], shipped: false, message: "No changes to publish." }, null, 2));
  process.exit(0);
}

await runChecked("git", ["add", "public/assets/editorial", "public/sitemap.xml", "research/news-review/approved-development-news.json", "src/data/approvedExternalNews.ts", "src/data/marketNotes.ts", "src/generated/siteData.ts", "research/scripts/build-site-intelligence.mjs"]);
const commitMessage = clean(input.commitMessage) || `Publish ${destinationConfig[destination].label.toLowerCase()}: ${title}`;
await runChecked("git", ["commit", "-m", commitMessage]);
await runChecked("git", ["push", "origin", "main"]);

let shipped = false;
if (shouldShip) {
  await runChecked("npm", ["run", "ship:live"]);
  await runChecked("npm", ["run", "qa:live"]);
  shipped = true;
}

const route = `${destinationConfig[destination].routeBase}${destination === "news" ? slugValue : slugBaseForNote(slugValue)}/`;
console.log(JSON.stringify({
  ok: true,
  destination,
  route,
  liveUrl: `https://www.wpbnewconstruction.com${route}`,
  title,
  imagePaths,
  shipped,
  changedFiles: (await run("git", ["status", "--short"])).stdout.trim().split("\n").filter(Boolean),
}, null, 2));

async function publishNewsUpdate({ id, slug, title, deck, bodySections, imagePath }) {
  const approvedPath = path.join(workspace, "research/news-review/approved-development-news.json");
  const items = JSON.parse(await fs.readFile(approvedPath, "utf8"));
  const category = newsCategory(input.category || input.newsCategory);
  const sourceName = clean(input.sourceName || "Brooke editorial note");
  const sourceUrl = clean(input.sourceUrl || "https://www.wpbnewconstruction.com/updates/");
  const sourcePublishedDate = isoDate(input.sourcePublishedDate || input.datePublished || today);
  const relatedProjectIds = slugs(input.relatedProjectIds || input.projectIds);
  const relatedCorridorIds = slugs(input.relatedCorridorIds || input.corridorIds);
  const item = {
    id,
    slug,
    title,
    sourceName,
    sourceUrl,
    canonicalUrl: clean(input.canonicalUrl || sourceUrl),
    sourceTitle: clean(input.sourceTitle || title),
    publishedAt: now.toISOString(),
    sourcePublishedAt: sourcePublishedDate,
    sourcePublishedDate,
    eventDate: clean(input.eventDate || sourcePublishedDate),
    dateDiscovered: today,
    freshnessLane: "breaking_14d",
    fetchedAt: today,
    deck,
    description: deck,
    summary: clean(input.summary || deck),
    bodySections,
    whyItMatters: clean(input.whyItMatters || "This update can change how buyers understand timing, lifestyle fit, or corridor momentum, but it should still be verified against current building packets."),
    buyerContext: clean(input.buyerContext || "Use this as buyer context before comparing current availability, floor plans, fees, timing, and contract details."),
    buyerTakeaway: clean(input.buyerTakeaway || ""),
    marketSignal: clean(input.marketSignal || ""),
    bestFor: clean(input.bestFor || ""),
    watchPoints: clean(input.watchPoints || ""),
    buyerQuestions: clean(input.buyerQuestions || ""),
    relatedBuildings: slugs(input.relatedBuildings || []),
    relatedNeighborhoods: slugs(input.relatedNeighborhoods || []),
    relatedCorridor: clean(input.relatedCorridor || ""),
    newsletterHeadline: clean(input.newsletterHeadline || title),
    newsletterBlurb: clean(input.newsletterBlurb || deck),
    newsletterCta: clean(input.newsletterCta || "Read the update"),
    query: clean(input.query || title),
    category,
    relatedProjectIds,
    relatedCorridorIds,
    relatedProjectSlugs: relatedProjectIds,
    relatedCorridors: relatedCorridorIds,
    primaryProjectSlug: relatedProjectIds[0] || undefined,
    corridorLabel: clean(input.corridorLabel || corridorLabel(relatedCorridorIds[0])),
    imagePath,
    sourceLinks: sourceLinks(input, sourceName, sourceUrl),
    paywallStatus: clean(input.paywallStatus || "free"),
    status: "published",
    riskLevel: clean(input.riskLevel || "medium"),
  };
  const next = [item, ...items.filter((existing) => existing.id !== id && existing.slug !== slug)];
  await fs.writeFile(approvedPath, `${JSON.stringify(next, null, 2)}\n`);
}

async function publishMarketNote({ id, slug, title, deck, bodySections, imagePath, destination }) {
  const filePath = path.join(workspace, "src/data/marketNotes.ts");
  const source = await fs.readFile(filePath, "utf8");
  const relatedProjectIds = slugs(input.relatedProjectIds || input.projectIds);
  const sourceName = clean(input.sourceName || "Brooke editorial note");
  const sourceUrl = clean(input.sourceUrl || "https://www.wpbnewconstruction.com/market-notes/");
  const category = destination === "downtown" ? "Downtown Spotlight" : clean(input.category || "Buyer Intelligence");
  const note = {
    id,
    status: "published",
    category,
    title,
    slug,
    excerpt: deck,
    buyerThesis: clean(input.buyerThesis || deck),
    buyerTakeaway: clean(input.buyerTakeaway || input.buyerContext || "Use this note as buyer context, then verify building-specific availability, pricing, fees, documents, and timing."),
    marketSignal: clean(input.marketSignal || ""),
    bestFor: clean(input.bestFor || ""),
    watchPoints: clean(input.watchPoints || ""),
    buyerQuestions: clean(input.buyerQuestions || ""),
    relatedBuildings: slugs(input.relatedBuildings || []),
    relatedNeighborhoods: slugs(input.relatedNeighborhoods || []),
    relatedCorridor: clean(input.relatedCorridor || ""),
    ...(imagePath ? { image: { path: imagePath, credit: "User-provided editorial image, optimized for site use." } } : {}),
    primaryProjectId: relatedProjectIds[0] || undefined,
    projectIds: relatedProjectIds,
    sourceName,
    sourceLinks: sourceLinks(input, sourceName, sourceUrl).map((source) => ({
      label: source.label,
      href: source.url,
      sourceType: marketSourceType(source.type),
    })),
    datePublished: today,
    dateModified: today,
    sections: bodySections.map((section) => ({
      heading: section.heading,
      body: section.body,
      ...(section.image ? { image: section.image } : {}),
    })),
    ctaText: clean(input.ctaText || "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options."),
    factCheckRequired: lines(input.factCheckRequired).length ? lines(input.factCheckRequired) : [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation.",
    ],
    seo: {
      primaryQuery: clean(input.primaryQuery || title),
      secondaryQueries: lines(input.secondaryQueries),
      suggestedSlug: slug,
      titleTag: clean(input.titleTag || `${title} | ${destination === "downtown" ? "Downtown Spotlight" : "Buyer Intelligence"}`),
      metaDescription: clean(input.metaDescription || deck),
    },
  };
  const inserted = source.replace("export const marketNotes = [", `export const marketNotes = [\n  ${objectLiteral(note)},`);
  if (inserted === source) fail("Could not find marketNotes export.");
  await fs.writeFile(filePath, inserted);
}

async function updateGeneratedRoutes({ destination, slug, title, description, imagePath }) {
  const routeBase = destinationConfig[destination].routeBase;
  const routePath = `${routeBase}${slug}/`;
  await insertGeneratedRoute(routePath, routeTitle(destination, title), description, imagePath);
  await insertSitemapRoute(routePath);
  if (destination === "buyer" || destination === "downtown") {
    await insertBuildSiteIntelligenceRoute(destination, slug, routeTitle(destination, title), description);
  }
}

async function insertGeneratedRoute(routePath, title, description, imagePath) {
  const filePath = path.join(workspace, "src/generated/siteData.ts");
  const source = await fs.readFile(filePath, "utf8");
  if (source.includes(`"path": "${routePath}"`)) return;
  const route = {
    path: routePath,
    title,
    description,
    ogImage: imagePath || "/projects/ritz-carlton-wpb/media/ritz-evening-aerial-road-motion-2400x1600.png",
  };
  let anchor = '"path": "/updates/trd-jeff-greene-live-local-120-s-dixie-2026-06-05/"';
  if (routePath.startsWith("/market-notes/")) anchor = '"path": "/market-notes/nora-district-downtown-transformation/"';
  if (routePath.startsWith("/downtown-spotlight/")) anchor = '"path": "/downtown-spotlight/nora-district-downtown-transformation/"';
  const index = source.indexOf(`  {\n    ${anchor}`);
  if (index === -1) fail(`Could not find generated route anchor for ${routePath}`);
  const next = `${source.slice(0, index)}  ${JSON.stringify(route, null, 2).replace(/\n/g, "\n  ")},\n${source.slice(index)}`;
  await fs.writeFile(filePath, next);
}

async function insertSitemapRoute(routePath) {
  const filePath = path.join(workspace, "public/sitemap.xml");
  const source = await fs.readFile(filePath, "utf8");
  const loc = `https://www.wpbnewconstruction.com${routePath}`;
  if (source.includes(`<loc>${loc}</loc>`)) return;
  const block = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
  const anchor = routePath.startsWith("/market-notes/")
    ? "  <url>\n    <loc>https://www.wpbnewconstruction.com/market-notes/"
    : routePath.startsWith("/downtown-spotlight/")
      ? "  <url>\n    <loc>https://www.wpbnewconstruction.com/downtown-spotlight/"
      : "  <url>\n    <loc>https://www.wpbnewconstruction.com/updates/";
  const index = source.indexOf(anchor);
  if (index === -1) fail(`Could not find sitemap anchor for ${routePath}`);
  await fs.writeFile(filePath, `${source.slice(0, index)}${block}${source.slice(index)}`);
}

async function insertBuildSiteIntelligenceRoute(destination, slug, title, description) {
  const filePath = path.join(workspace, "research/scripts/build-site-intelligence.mjs");
  const source = await fs.readFile(filePath, "utf8");
  if (source.includes(`slug: "${slug}"`)) return;
  const item = `  {\n    slug: "${escapeJs(slug)}",\n    title: "${escapeJs(title)}",\n    description:\n      "${escapeJs(description)}",\n  },\n`;
  const arrayName = destination === "downtown" ? "downtownSpotlightRoutes" : "marketNoteRoutes";
  const marker = `const ${arrayName} = [\n`;
  if (!source.includes(marker)) fail(`Could not find ${arrayName}.`);
  await fs.writeFile(filePath, source.replace(marker, `${marker}${item}`));
}

async function writeImages(input, slugValue, destination) {
  const entries = [];
  if (input.heroImage?.dataUrl) entries.push({ ...input.heroImage, role: "hero" });
  for (const [index, image] of (input.bodyImages || []).filter((item) => item?.dataUrl).slice(0, 3).entries()) {
    entries.push({ ...image, role: `body-${index + 1}` });
  }
  const output = { hero: "", body: [] };
  for (const image of entries) {
    const relative = `public/assets/editorial/${slugValue}-${image.role}.jpg`;
    const outputPath = path.join(workspace, relative);
    const tempPath = `${outputPath}.upload`;
    const match = String(image.dataUrl).match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i);
    if (!match) continue;
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(tempPath, Buffer.from(match[1], "base64"));
    await runChecked("sips", ["-s", "format", "jpeg", "-Z", image.role === "hero" ? "2200" : "1600", tempPath, "--out", outputPath]);
    await fs.rm(tempPath, { force: true });
    const publicPath = `/${relative.replace(/^public\//, "")}`;
    if (image.role === "hero") output.hero = publicPath;
    else output.body.push(publicPath);
  }
  if (!output.hero) {
    output.hero = destination === "downtown"
      ? "/assets/editorial/rosemary-square-corridor.jpg"
      : destination === "buyer"
        ? "/assets/editorial/wpb-geography-map-hero.jpg"
        : "/assets/editorial/flagler-waterfront-corridor.jpg";
  }
  return output;
}

function articleSections(body, bodyImages) {
  const blocks = body.split(/\n{2,}/).map(clean).filter(Boolean);
  const sections = blocks.map((block, index) => {
    const lines = block.split("\n").map(clean).filter(Boolean);
    const heading = lines.length > 1 && lines[0].length < 90 ? lines[0] : index === 0 ? "What happened" : index === 1 ? "Why it matters" : "Buyer context";
    const text = lines.length > 1 && lines[0].length < 90 ? lines.slice(1).join("\n") : block;
    return {
      heading,
      body: text,
      ...(bodyImages[index] ? { image: bodyImages[index] } : {}),
    };
  });
  return sections.length ? sections : [{ heading: "What happened", body }];
}

function sourceLinks(input, sourceName, sourceUrl) {
  const extra = Array.isArray(input.sourceLinks) ? input.sourceLinks : [];
  const links = [
    ...(sourceUrl ? [{ label: sourceName || "Source", url: sourceUrl, type: "news" }] : []),
    ...extra.map((item) => ({
      label: clean(item.label || item.sourceName || item.url),
      url: clean(item.url || item.href),
      type: clean(item.type || item.sourceType || "news"),
    })),
  ].filter((item) => item.label && /^https?:\/\//i.test(item.url));
  return links.length ? links : [{ label: "WPB New Construction", url: "https://www.wpbnewconstruction.com/", type: "official" }];
}

function objectLiteral(value) {
  return JSON.stringify(value, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/\n/g, "\n  ");
}

function uniqueSlug(base, destination) {
  return base;
}

function slugBaseForNote(value) {
  return value.replace(/-\d{4}-\d{2}-\d{2}$/, "");
}

function routeTitle(destination, title) {
  if (destination === "news") return `${title} | WPB Updates`;
  if (destination === "downtown") return `${title} | Downtown Spotlight`;
  return `${title} | Buyer Intelligence`;
}

function newsCategory(value) {
  const allowed = new Set(["development", "construction", "planning", "sales", "financing", "city", "press-release", "general"]);
  const candidate = slug(value || "general");
  if (allowed.has(candidate)) return candidate;
  if (candidate.includes("downtown") || candidate.includes("education") || candidate.includes("lifestyle")) return "city";
  return "general";
}

function marketSourceType(value) {
  const normalized = clean(value).toLowerCase();
  const allowed = new Set([
    "city planning material",
    "development news coverage",
    "local news coverage",
    "developer press release",
    "official project site",
    "brand/developer announcement",
    "official legal source",
    "financing guideline",
    "economic development source",
    "market report",
  ]);
  if (allowed.has(normalized)) return normalized;
  if (normalized.includes("official")) return "official project site";
  if (normalized.includes("city")) return "city planning material";
  if (normalized.includes("press")) return "developer press release";
  return "local news coverage";
}

function corridorLabel(value) {
  return {
    downtown: "Downtown",
    "north-flagler": "North Flagler",
    "south-flagler": "South Flagler",
  }[value] || "West Palm Beach";
}

function slugs(value) {
  if (Array.isArray(value)) return value.map(slug).filter(Boolean);
  return clean(value).split(/[,|\n]/).map(slug).filter(Boolean);
}

function lines(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return clean(value).split(/\n+/).map(clean).filter(Boolean);
}

function isoDate(value) {
  const text = clean(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : today;
}

function valueForArg(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function clean(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function slug(value) {
  return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeJs(value) {
  return clean(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function runChecked(command, args) {
  const result = await run(command, args);
  if (result.code !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`${command} ${args.join(" ")} failed with code ${result.code}`);
  }
  return result;
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}
