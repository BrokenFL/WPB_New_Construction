import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const mainPath = path.join(workspace, "src/main.ts");
const siteDataPath = path.join(workspace, "src/generated/siteData.ts");
const findings = [];
const ignoredPrefixes = ["/assets/", "/data/", "/maps/", "/projects/", "/hero/", "/team-logos/", "/favicon"];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function routePathForHref(href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean === "/") return "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function routeFile(route) {
  return route === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route, "index.html");
}

const htmlFiles = await walk(distRoot);
const checked = new Set();
for (const file of htmlFiles) {
  const html = await fs.readFile(file, "utf8");
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    if (ignoredPrefixes.some((prefix) => href.startsWith(prefix))) continue;
    if (/\.(json|xml|txt|pdf|svg|jpg|jpeg|png|webp)(?:$|[?#])/i.test(href)) {
      try {
        await fs.access(path.join(distRoot, href.split("#")[0].split("?")[0].slice(1)));
      } catch {
        findings.push(`${path.relative(workspace, file)} links to missing file ${href}`);
      }
      continue;
    }
    const route = routePathForHref(href);
    const key = `${file}:${route}`;
    if (checked.has(key)) continue;
    checked.add(key);
    try {
      await fs.access(routeFile(route));
    } catch {
      findings.push(`${path.relative(workspace, file)} links to missing route ${href}`);
    }
  }
}

const siteData = await fs.readFile(siteDataPath, "utf8");
const routeMatch = siteData.match(/export const prerenderRoutes = (\[[\s\S]*?\]) as const;/);
const prerenderedRoutes = new Set(routeMatch ? JSON.parse(routeMatch[1]).map((route) => route.path) : []);
const source = await fs.readFile(mainPath, "utf8");
for (const match of source.matchAll(/href=["`]([^"`$]+)["`]/g)) {
  const href = match[1];
  if (!href.startsWith("/") || href.startsWith("//")) continue;
  if (ignoredPrefixes.some((prefix) => href.startsWith(prefix))) continue;
  if (/\.(json|xml|txt|pdf|svg|jpg|jpeg|png|webp)(?:$|[?#])/i.test(href)) continue;
  const route = routePathForHref(href);
  checked.add(`src:${route}`);
  if (!prerenderedRoutes.has(route)) findings.push(`src/main.ts links to non-prerendered route ${href}`);
}

if (findings.length) {
  console.error("Internal link findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Internal link QA passed for ${checked.size} unique route links.`);
