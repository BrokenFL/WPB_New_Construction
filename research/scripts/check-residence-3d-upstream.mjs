#!/usr/bin/env node

// Read-only post-build regression check. Expected route and Offer facts come
// from source files pinned to the upstream baseline, not generated output.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
const require = createRequire(import.meta.url);
const ts = require("typescript");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "dist");
const baselineCommit = "769a575395e5d78511db6863771193b70a5563fd";
const siteOrigin = "https://www.wpbnewconstruction.com";
const shorecrestAlias = "/floorplans/shorecrest/residence-0704/";
const shorecrestCanonical = "/floorplans/shorecrest/shorecrest-1153-0704/";

function upstreamSource(relativePath) {
  return execFileSync("git", ["show", `${baselineCommit}:${relativePath}`], {
    cwd: root, encoding: "utf8", maxBuffer: 24 * 1024 * 1024,
  });
}

function parseSource(relativePath) {
  return ts.createSourceFile(relativePath, upstreamSource(relativePath), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
}

function unwrapExpression(node) {
  while (node && (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) {
    node = node.expression;
  }
  return node;
}

function getVariableInitializer(sourceFile, name) {
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) initializer = node.initializer;
    if (!initializer) ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  assert.ok(initializer, `${sourceFile.fileName}: missing upstream variable ${name}`);
  return unwrapExpression(initializer);
}

function propertyName(node) {
  const name = node?.name;
  if (name && (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name) || ts.isNumericLiteral(name))) return name.text;
  return undefined;
}

function objectProperties(expression, description) {
  expression = unwrapExpression(expression);
  assert.ok(ts.isObjectLiteralExpression(expression), `${description}: expected an object literal`);
  return expression.properties.filter(ts.isPropertyAssignment).map((property) => [propertyName(property), unwrapExpression(property.initializer)]);
}

function propertyMap(expression, description) {
  return new Map(objectProperties(expression, description).filter(([name]) => name !== undefined));
}

function literalValue(expression, description) {
  expression = unwrapExpression(expression);
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  throw new Error(`${description}: expected a source literal`);
}

function readTsArray(sourceFile, name) {
  const initializer = getVariableInitializer(sourceFile, name);
  assert.ok(ts.isArrayLiteralExpression(initializer), `${name}: expected an upstream source array`);
  return initializer.elements.map((element, index) => {
    const properties = propertyMap(element, `${name}[${index}]`);
    return Object.fromEntries([...properties].map(([key, value]) => [key, value]));
  });
}

function findReturnedObject(functionNode, predicate) {
  let found;
  function visit(node) {
    if (ts.isReturnStatement(node) && node.expression) {
      const expression = unwrapExpression(node.expression);
      if (ts.isObjectLiteralExpression(expression) && predicate(propertyMap(expression, "returned source object"))) found = expression;
    }
    if (!found) ts.forEachChild(node, visit);
  }
  visit(functionNode);
  return found;
}

function getFunctionDeclaration(sourceFile, name) {
  let found;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    if (!found) ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  assert.ok(found, `${sourceFile.fileName}: missing upstream function ${name}`);
  return found;
}

function sourceExpectations() {
  const pages = readTsArray(parseSource("src/data/floorplanPlanPages.ts"), "floorplanPlanPages").map((page) => ({
    route: `/floorplans/${literalValue(page.projectId, "floorplan project")}/${literalValue(page.planSlug, "floorplan slug")}/`,
    seoTitle: literalValue(page.seoTitle, "floorplan SEO title"),
  }));
  assert.equal(pages.length, 69, "Pinned upstream must own exactly 69 per-plan routes");

  const mainSource = parseSource("src/main.ts");
  const answers = readTsArray(mainSource, "buyerIntentAnswerPages").map((answer) => `/answers/${literalValue(answer.slug, "answer slug")}/`);
  assert.equal(answers.length, 16, "Pinned upstream buyer-intent answer route count changed");

  const shortlistSource = parseSource("src/lib/shortlist.ts");
  const comparisonPaths = objectProperties(getVariableInitializer(shortlistSource, "comparisonPaths"), "comparisonPaths")
    .map(([, value]) => literalValue(value, "comparison route"));
  assert.equal(comparisonPaths.length, 2, "Pinned upstream dedicated comparison route count changed");

  const routeMaps = [];
  function findCompareHub(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const properties = propertyMap(node, "route map");
      if (properties.has("/compare/") && literalValue(properties.get("/compare/"), "comparison hub route type") === "compare") routeMaps.push("/compare/");
    }
    ts.forEachChild(node, findCompareHub);
  }
  findCompareHub(mainSource);
  assert.ok(routeMaps.length > 0, "Pinned upstream route table must retain the /compare/ hub");
  const hubPath = routeMaps[0];

  const priceObject = propertyMap(getVariableInitializer(mainSource, "projectStartingPrices"), "projectStartingPrices");
  const offerFunction = getFunctionDeclaration(mainSource, "projectStartingOffer");
  const offerTemplate = findReturnedObject(offerFunction, (properties) => properties.has("@type"));
  assert.ok(offerTemplate, "Pinned upstream projectStartingOffer must return an Offer object");
  const offerProperties = propertyMap(offerTemplate, "projectStartingOffer result");
  assert.equal(literalValue(offerProperties.get("@type"), "project Offer type"), "Offer");
  assert.equal(literalValue(offerProperties.get("priceCurrency"), "project Offer currency"), "USD");
  assert.equal(offerProperties.has("availability"), false, "Pinned upstream Offer must omit availability");
  const offers = [...priceObject].map(([projectId, expression]) => {
    const entry = propertyMap(expression, `projectStartingPrices.${projectId}`);
    return {
      projectId,
      amount: literalValue(entry.get("amount"), `${projectId} Offer amount`),
      currency: literalValue(offerProperties.get("priceCurrency"), "project Offer currency"),
      description: literalValue(entry.get("label"), `${projectId} Offer description`),
    };
  });
  assert.equal(offers.length, 8, "Pinned upstream project starting-price Offer count changed");
  return { pages, answers, comparisonPaths, hubPath, offers };
}

function browserPreviewOriginFromArgs() {
  const args = process.argv.slice(2);
  const browserValue = args.find((argument) => argument.startsWith("--browser="))?.slice("--browser=".length);
  const browserIndex = args.indexOf("--browser");
  const browserRequested = browserIndex >= 0 || browserValue !== undefined;
  const originIndex = args.indexOf("--origin");
  const originValue = args.find((argument) => argument.startsWith("--origin="))?.slice("--origin=".length)
    ?? browserValue
    ?? (originIndex >= 0 ? args[originIndex + 1] : undefined)
    ?? (browserIndex >= 0 && args[browserIndex + 1] && !args[browserIndex + 1].startsWith("-") ? args[browserIndex + 1] : undefined)
    ?? process.env.WPB_RESIDENCE_UPSTREAM_PREVIEW_ORIGIN;
  const recognized = new Set(["--browser", "--origin"]);
  for (const argument of args) {
    if (recognized.has(argument)) continue;
    if (argument.startsWith("--browser=") || argument.startsWith("--origin=")) continue;
    if (browserIndex >= 0 && argument === args[browserIndex + 1] && argument === originValue) continue;
    if (originIndex >= 0 && argument === args[originIndex + 1] && argument === originValue) continue;
    throw new Error(`Unknown checker argument: ${argument}`);
  }
  if (!browserRequested) {
    assert.equal(originIndex, -1, "--origin requires --browser");
    assert.equal(args.some((argument) => argument.startsWith("--origin=")), false, "--origin requires --browser");
    return undefined;
  }
  assert.ok(originValue, "Browser mode needs --browser=<loopback-origin>, --origin <loopback-origin>, or WPB_RESIDENCE_UPSTREAM_PREVIEW_ORIGIN");
  const preview = new URL(originValue);
  assert.equal(preview.protocol, "http:", "Browser preview origin must use HTTP");
  assert.ok(["127.0.0.1", "localhost", "::1", "[::1]"].includes(preview.hostname.toLowerCase()), "Browser preview origin must be loopback");
  assert.equal(preview.username, "", "Browser preview origin must not include credentials");
  assert.equal(preview.password, "", "Browser preview origin must not include credentials");
  assert.equal(preview.pathname, "/", "Browser preview argument must be an origin without a path");
  assert.equal(preview.search, "", "Browser preview argument must not include a query");
  assert.equal(preview.hash, "", "Browser preview argument must not include a fragment");
  return preview.origin;
}

function isHeavyResidence3DRequest(value) {
  return /\.glb(?:[?#]|$)|model-viewer|meshopt(?:_decoder|imizer)?|residence-three-(?:core|webgl)/i.test(value);
}

async function verifyHydratedProjectOffers(previewOrigin, offers) {
  const reportFile = path.join(root, ".runtime/residence-3d-continuation/upstream-browser.json");
  const report = {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    baselineCommit,
    previewOrigin,
    externalRequestPolicy: "all non-loopback requests are aborted before network access",
    engines: [],
    errors: [],
  };
  const launched = [];
  const browserEngines = [["chromium", chromium], ["webkit", webkit]];
  try {
    for (const [engineName, engine] of browserEngines) {
      const browser = await engine.launch({ headless: true });
      launched.push(browser);
      const engineReport = { name: engineName, checkedProjectOffers: [], blockedExternalRequestCount: 0, blockedExternalOrigins: [], fatalConsoleErrors: [], pageErrors: [], heavy3DRequests: [], heavy3DPreloads: [] };
      report.engines.push(engineReport);
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
      const externalAttempts = [];
      const responsesOutsidePreview = new Set();
      const externalRoute = async (route) => {
        const requestUrl = new URL(route.request().url());
        if (requestUrl.origin === previewOrigin) return route.continue();
        externalAttempts.push(requestUrl.origin);
        return route.abort("blockedbyclient");
      };
      await context.route("**/*", externalRoute);
      try {
        for (const expected of offers) {
          const projectRoute = `/projects/${expected.projectId}/`;
          const page = await context.newPage();
          const projectPageErrors = [];
          const projectConsoleErrors = [];
          const projectHeavyRequests = [];
          page.on("pageerror", (error) => projectPageErrors.push(error.message));
          page.on("console", (message) => {
            if (message.type() !== "error") return;
            const text = message.text();
            if (/failed to load resource.*(?:ERR_ABORTED|ERR_FAILED|ERR_BLOCKED_BY_CLIENT)|net::ERR_(?:ABORTED|FAILED|BLOCKED_BY_CLIENT)/i.test(text)) return;
            projectConsoleErrors.push(text);
          });
          page.on("request", (request) => {
            if (isHeavyResidence3DRequest(request.url())) projectHeavyRequests.push(request.url());
          });
          page.on("response", (response) => {
            if (new URL(response.url()).origin !== previewOrigin) responsesOutsidePreview.add(new URL(response.url()).origin);
          });

          try {
            await page.goto(`${previewOrigin}${projectRoute}`, { waitUntil: "networkidle", timeout: 30000 });
            await page.waitForFunction((projectId) => {
              const activeProjectView = document.querySelector(`[data-route-view="project"][data-project-id="${projectId}"]:not([hidden])`);
              const visibleH1s = [...document.querySelectorAll("h1")].filter((heading) => {
                const bounds = heading.getBoundingClientRect();
                const style = getComputedStyle(heading);
                return bounds.width > 0 && bounds.height > 0 && style.visibility !== "hidden" && style.display !== "none";
              });
              const canonical = document.querySelector('link[rel="canonical"]')?.href;
              return activeProjectView && visibleH1s.length === 1 && canonical === `https://www.wpbnewconstruction.com/projects/${projectId}/`;
            }, expected.projectId, { timeout: 15000 });

            const h1s = page.locator("h1:visible");
            assert.equal(await h1s.count(), 1, `${engineName} ${projectRoute}: expected one visible H1 after hydration`);
            const canonicalLinks = page.locator('link[rel="canonical"]');
            assert.equal(await canonicalLinks.count(), 1, `${engineName} ${projectRoute}: expected one canonical after hydration`);
            assert.equal(await canonicalLinks.getAttribute("href"), `${siteOrigin}${projectRoute}`, `${engineName} ${projectRoute}: hydrated canonical`);

            const liveOffers = (await page.content()).trim();
            const documents = parseJsonLd(liveOffers, `${engineName} ${projectRoute}`);
            const parsedOffers = documents.flatMap((document) => collectOffers(document));
            assert.equal(parsedOffers.length, 1, `${engineName} ${projectRoute}: expected exactly one hydrated project Offer`);
            assert.equal(parsedOffers[0].price, expected.amount, `${engineName} ${projectRoute}: hydrated Offer price`);
            assert.equal(parsedOffers[0].priceCurrency, expected.currency, `${engineName} ${projectRoute}: hydrated Offer currency`);
            assert.equal(parsedOffers[0].description, expected.description, `${engineName} ${projectRoute}: hydrated Offer description`);
            assert.equal(Object.hasOwn(parsedOffers[0], "availability"), false, `${engineName} ${projectRoute}: hydrated Offer must omit availability`);

            const preloadHrefs = await page.locator('link[rel="modulepreload"], link[rel="preload"], link[rel="prefetch"]').evaluateAll((links) => links.map((link) => link.href));
            const heavyPreloads = preloadHrefs.filter(isHeavyResidence3DRequest);
            engineReport.heavy3DPreloads.push(...heavyPreloads.map((href) => `${projectRoute}: ${href}`));
            assert.deepEqual(heavyPreloads, [], `${engineName} ${projectRoute}: viewer/decoder/GLB must not preload`);
            assert.deepEqual(projectHeavyRequests, [], `${engineName} ${projectRoute}: viewer/decoder/GLB must not request before activation`);
            assert.deepEqual(projectPageErrors, [], `${engineName} ${projectRoute}: runtime page errors`);
            assert.deepEqual(projectConsoleErrors, [], `${engineName} ${projectRoute}: fatal console errors`);
            engineReport.checkedProjectOffers.push(expected.projectId);
          } catch (error) {
            engineReport.pageErrors.push(`${expected.projectId}: ${error.stack ?? error.message ?? String(error)}`);
          } finally {
            engineReport.fatalConsoleErrors.push(...projectConsoleErrors.map((message) => `${expected.projectId}: ${message}`));
            engineReport.pageErrors.push(...projectPageErrors.map((message) => `${expected.projectId}: ${message}`));
            engineReport.heavy3DRequests.push(...projectHeavyRequests);
            await page.close();
          }
        }
      } finally {
        engineReport.blockedExternalRequestCount = externalAttempts.length;
        engineReport.blockedExternalOrigins = [...new Set(externalAttempts)].sort();
        assert.deepEqual([...responsesOutsidePreview], [], `${engineName}: external HTTP responses must be blocked`);
        await context.close();
      }
    }
  } catch (error) {
    report.errors.push(error.stack ?? String(error));
  } finally {
    await Promise.allSettled(launched.map((browser) => browser.close()));
    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  }
  const failures = [
    ...report.errors,
    ...report.engines.flatMap((engine) => [
      ...engine.pageErrors,
      ...engine.fatalConsoleErrors,
      ...(engine.heavy3DRequests.length ? [`${engine.name}: unexpected 3D requests ${engine.heavy3DRequests.join(", ")}`] : []),
      ...(engine.heavy3DPreloads.length ? [`${engine.name}: unexpected 3D preloads ${engine.heavy3DPreloads.join(", ")}`] : []),
      ...(engine.checkedProjectOffers.length !== offers.length ? [`${engine.name}: checked ${engine.checkedProjectOffers.length}/${offers.length} hydrated Offers`] : []),
    ]),
  ];
  if (failures.length) throw new Error(`Upstream browser regression failed:\n${failures.join("\n")}`);
  return { report: path.relative(root, reportFile), engines: report.engines.map((engine) => ({ name: engine.name, checkedProjectOffers: engine.checkedProjectOffers.length, blockedExternalRequestCount: engine.blockedExternalRequestCount })) };
}

async function readBuiltRoute(route) {
  const filename = path.join(dist, route.replace(/^\//, ""), "index.html");
  return fs.readFile(filename, "utf8");
}

function decodeHtml(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27|#([0-9]+)|#x([0-9a-f]+));/gi, (entity, decimal, hex) => {
    if (entity.toLowerCase() === "&amp;") return "&";
    if (entity.toLowerCase() === "&lt;") return "<";
    if (entity.toLowerCase() === "&gt;") return ">";
    if (entity.toLowerCase() === "&quot;") return '"';
    if (entity.toLowerCase() === "&apos;" || entity.toLowerCase() === "&#39;" || entity.toLowerCase() === "&#x27;") return "'";
    return String.fromCodePoint(Number.parseInt(decimal ?? hex, decimal ? 10 : 16));
  });
}

function exactRedirect(text, route) {
  return text.split(/\r?\n/).map((line) => line.trim().split(/\s+/)).find(([source]) => source === route);
}

function parseJsonLd(html, route) {
  const scripts = [...html.matchAll(/<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0, `${route}: missing JSON-LD`);
  return scripts.map(([, json]) => {
    try { return JSON.parse(json); }
    catch (error) { throw new Error(`${route}: invalid JSON-LD (${error.message})`); }
  });
}

function collectOffers(value, offers = [], visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return offers;
  visited.add(value);
  if (!Array.isArray(value)) {
    const type = value["@type"];
    if (type === "Offer" || (Array.isArray(type) && type.includes("Offer"))) offers.push(value);
  }
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectOffers(child, offers, visited);
  return offers;
}

async function pathExists(filename) {
  try { await fs.access(filename); return true; }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

const expected = sourceExpectations();
const browserPreviewOrigin = browserPreviewOriginFromArgs();
await fs.access(path.join(dist, "index.html"));

const floorplanRoutes = expected.pages.map((page) => page.route);
assert.equal(new Set(floorplanRoutes).size, floorplanRoutes.length, "Pinned upstream floor-plan routes must be unique");

for (const page of expected.pages) {
  const { route } = page;
  const html = await readBuiltRoute(route);
  const canonicalLinks = [...html.matchAll(/<link\b(?=[^>]*rel="canonical")[^>]*href="([^"]+)"[^>]*>/gi)];
  assert.equal(canonicalLinks.length, 1, `${route}: expected exactly one canonical link`);
  assert.equal(canonicalLinks[0][1], `${siteOrigin}${route}`, `${route}: canonical changed`);
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  assert.equal(titles.length, 1, `${route}: expected exactly one title`);
  assert.equal(decodeHtml(titles[0][1].trim()), page.seoTitle, `${route}: pinned upstream SEO title changed`);
}

const sitemap = await fs.readFile(path.join(dist, "sitemap.xml"), "utf8");
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => value.trim());
for (const route of floorplanRoutes) {
  assert.equal(sitemapLocations.filter((location) => location === `${siteOrigin}${route}`).length, 1, `${route}: sitemap must contain exactly one canonical entry`);
}
assert.equal(sitemapLocations.includes(`${siteOrigin}${shorecrestAlias}`), false, "Shorecrest old alias must stay out of sitemap");

const answerRoutes = [...expected.answers, ...expected.comparisonPaths, expected.hubPath];
for (const route of new Set(answerRoutes)) {
  await readBuiltRoute(route);
}

const offerEntries = expected.offers;
assert.equal(new Set(offerEntries.map((offer) => offer.projectId)).size, offerEntries.length, "Pinned upstream Offer projects must be unique");
for (const expected of offerEntries) {
  const route = `/projects/${expected.projectId}/`;
  const documents = parseJsonLd(await readBuiltRoute(route), route);
  const offers = documents.flatMap((document) => collectOffers(document));
  assert.equal(offers.length, 1, `${route}: expected exactly one project Offer object`);
  const [offer] = offers;
  assert.equal(offer.price, expected.amount, `${route}: Offer price changed`);
  assert.equal(offer.priceCurrency, expected.currency, `${route}: Offer currency changed`);
  assert.equal(offer.description, expected.description, `${route}: Offer source description changed`);
  assert.equal(Object.hasOwn(offer, "availability"), false, `${route}: Offer must not assert availability`);
}

const publicRedirects = await fs.readFile(path.join(root, "public/_redirects"), "utf8");
const publicAliasRule = exactRedirect(publicRedirects, shorecrestAlias);
assert.ok(publicAliasRule, "public/_redirects must include the exact Shorecrest 0704 alias");
assert.deepEqual(publicAliasRule, [shorecrestAlias, shorecrestCanonical, "301"], "Shorecrest alias redirect rule changed");
const builtRedirects = await fs.readFile(path.join(dist, "_redirects"), "utf8");
assert.deepEqual(exactRedirect(builtRedirects, shorecrestAlias), publicAliasRule, "Built Shorecrest alias redirect differs from source rule");
assert.equal(await pathExists(path.join(dist, shorecrestAlias.replace(/^\//, ""), "index.html")), false, "Shorecrest old alias must not emit an HTML page");
assert.equal(sitemap.includes(shorecrestAlias), false, "Shorecrest old alias must stay out of the built sitemap");
const llms = await fs.readFile(path.join(dist, "llms.txt"), "utf8");
assert.equal(llms.includes(shorecrestAlias), false, "Shorecrest old alias must stay out of llms.txt");

console.log(JSON.stringify({
  status: "pass",
  baselineCommit,
  floorplanPages: floorplanRoutes.length,
  sitemapEntriesChecked: floorplanRoutes.length,
  answerRoutes: new Set(answerRoutes).size,
  projectOffers: offerEntries.length,
  shorecrestAlias: { status: publicAliasRule[2], destination: publicAliasRule[1], builtHtml: false, sitemap: false, llms: false },
}));

if (browserPreviewOrigin) {
  const browserReport = await verifyHydratedProjectOffers(browserPreviewOrigin, offerEntries);
  console.log(JSON.stringify({ status: "pass", browser: browserReport }));
}
