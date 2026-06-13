import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { ensureReportDir, qaReportMode, qaReportPath } from "./qa-report-utils.mjs";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const reportPath = qaReportPath(workspace, "research/source-material-review/homepage-visual-flow-report.md");
const port = 4197;

async function main() {
  const server = await serveDist();
  const browser = await chromium.launch({ headless: true });
  const findings = [];
  const checks = [];
  try {
    const desktop = await inspectHomepage(browser, { width: 1440, height: 1200, name: "desktop" });
    const mobile = await inspectHomepage(browser, { width: 390, height: 1000, name: "mobile" });
    checks.push(...desktop.checks, ...mobile.checks);
    findings.push(...desktop.findings, ...mobile.findings);
    await writeReport({ desktop, mobile, findings, checks });
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  if (findings.length) {
    console.error(["Homepage visual flow QA failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }
  console.log(JSON.stringify({ homepageVisual: "pass", checks: checks.length, reportPath: path.relative(workspace, reportPath), reportMode: qaReportMode() }, null, 2));
}

async function inspectHomepage(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".route-view-home:not([hidden])", { timeout: 30000 });
  await page.waitForTimeout(750);
  const data = await page.evaluate(() => {
    const scope = document.querySelector(".route-view-home:not([hidden])");
    const sectionTop = (selector) => scope?.querySelector(selector)?.getBoundingClientRect().top ?? null;
    const visibleImages = [...(scope?.querySelectorAll("img") ?? [])]
      .filter((img) => {
        const rect = img.getBoundingClientRect();
        const src = img.getAttribute("src") || "";
        const style = window.getComputedStyle(img);
        return rect.width > 40 && rect.height > 40
          && style.visibility !== "hidden"
          && Number(style.opacity || "1") > 0.05
          && !img.closest("[hidden]")
          && !img.closest(".gm-style")
          && !src.includes("maps.googleapis.com/maps/vt")
          && !/mapsresources[^/]*\.googleapis\.com\/v1\/tiles/i.test(src);
      })
      .map((img) => ({
        src: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
        project: (img.getAttribute("src") || "").match(/^\/projects\/([^/]+)\//)?.[1] || "",
      }));
    const text = document.body.innerText;
    return {
      order: {
        corridors: sectionTop(".home-corridor-guide"),
        image: sectionTop(".home-status-image"),
        atlas: sectionTop(".home-atlas-feature"),
        featured: sectionTop(".home-featured-section"),
        spotlight: sectionTop(".home-spotlight-module"),
        resources: sectionTop(".home-advisory-resources"),
        compare: sectionTop(".home-compare-launcher"),
      },
      visibleImages,
      jumpLinks: [...(scope?.querySelectorAll(".home-section-jump a") ?? [])].map((link) => link.getAttribute("href") ?? ""),
      hasCta: Boolean(scope?.querySelector(".home-compare-launcher a[href^='/inquire']")),
      compareSelectCount: scope?.querySelectorAll("[data-home-compare-select]").length ?? 0,
      hasCompareSubmit: Boolean(scope?.querySelector("[data-home-compare-form] button[type='submit']")),
      visibleAtlasProjectCards: [...(scope?.querySelectorAll(".home-atlas-project-card") ?? [])]
        .filter((card) => window.getComputedStyle(card).display !== "none" && card.getBoundingClientRect().height > 0)
        .length,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      hasBackendTerms: /\b(needs_review|source-material|data model|content studio|builder)\b/i.test(text),
    };
  });
  await page.close();

  const findings = [];
  const checks = [];
  const orderOk = data.order.corridors !== null && data.order.image !== null && data.order.featured !== null
    && data.order.spotlight !== null && data.order.atlas !== null && data.order.resources !== null && data.order.compare !== null
    && data.order.corridors < data.order.featured
    && data.order.corridors < data.order.image
    && data.order.image < data.order.featured
    && data.order.featured < data.order.spotlight
    && data.order.spotlight < data.order.atlas
    && data.order.atlas < data.order.resources
    && data.order.resources < data.order.compare;
  checks.push({ viewport: viewport.name, label: "homepage section order", ok: orderOk });
  if (!orderOk) findings.push(`${viewport.name}: homepage order should be Hero -> Corridors -> Construction Image -> Featured Developments -> Spotlight -> Atlas -> Advisory Resources -> Compare Launcher.`);
  checks.push({ viewport: viewport.name, label: "CTA visible", ok: data.hasCta });
  if (!data.hasCta) findings.push(`${viewport.name}: homepage CTA block is not visible.`);
  checks.push({ viewport: viewport.name, label: "compare launcher available", ok: data.compareSelectCount === 2 && data.hasCompareSubmit });
  if (data.compareSelectCount !== 2 || !data.hasCompareSubmit) findings.push(`${viewport.name}: homepage compare launcher should offer two building selectors and a submit action.`);
  if (viewport.name === "mobile") {
    checks.push({ viewport: viewport.name, label: "mobile atlas card strip hidden", ok: data.visibleAtlasProjectCards === 0 });
    if (data.visibleAtlasProjectCards !== 0) findings.push("mobile: homepage atlas project cards should stay hidden.");
  }
  const jumpTargets = ["/corridors/", "/buildings/", "/compare/", "/market-notes/"];
  const jumpLinksOk = jumpTargets.every((target) => data.jumpLinks.includes(target));
  checks.push({ viewport: viewport.name, label: "section jump links", ok: jumpLinksOk });
  if (!jumpLinksOk) findings.push(`${viewport.name}: homepage section jump navigation is missing required targets.`);
  checks.push({ viewport: viewport.name, label: "no horizontal overflow", ok: !data.hasOverflow });
  if (data.hasOverflow) findings.push(`${viewport.name}: homepage has horizontal overflow.`);
  checks.push({ viewport: viewport.name, label: "no backend terms", ok: !data.hasBackendTerms });
  if (data.hasBackendTerms) findings.push(`${viewport.name}: homepage exposes backend/admin terminology.`);

  for (let index = 1; index < data.visibleImages.length; index += 1) {
    const previous = data.visibleImages[index - 1];
    const current = data.visibleImages[index];
    if (normalizeImage(previous.src) === normalizeImage(current.src)) {
      findings.push(`${viewport.name}: identical adjacent visible image ${current.src}.`);
    }
    if (previous.project && previous.project === current.project) {
      findings.push(`${viewport.name}: adjacent same-project visual repetition for ${current.project}.`);
    }
    if (previous.project === "olara" && current.project === "olara") {
      findings.push(`${viewport.name}: adjacent Olara visual blocks.`);
    }
  }
  checks.push({ viewport: viewport.name, label: "adjacent image repetition", ok: !findings.some((finding) => finding.startsWith(`${viewport.name}: adjacent`) || finding.startsWith(`${viewport.name}: identical`)) });

  return { viewport: viewport.name, data, findings, checks };
}

async function serveDist() {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const filePath = await resolveFile(url.pathname);
    const body = await fs.readFile(filePath).catch(() => null);
    if (!body) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(filePath) });
    response.end(body);
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  return server;
}

async function resolveFile(pathname) {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const direct = path.join(distRoot, cleanPath);
  const stat = await fs.stat(direct).catch(() => null);
  if (stat?.isFile()) return direct;
  const nested = path.join(distRoot, cleanPath, "index.html");
  if (await fs.access(nested).then(() => true).catch(() => false)) return nested;
  return path.join(distRoot, "index.html");
}

function normalizeImage(src) {
  return src.split("?")[0].replace(/-\d+x\d+(?=\.)/, "");
}

function contentType(filePath) {
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  return "text/html; charset=utf-8";
}

async function writeReport({ desktop, mobile, findings, checks }) {
  await ensureReportDir(reportPath);
  const lines = [
    "# Homepage Visual Flow QA",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Checks: ${checks.length}`,
    `- Blocking findings: ${findings.length}`,
    "- Validates rendered desktop and mobile homepage order, CTA visibility, backend term exposure, horizontal overflow, and adjacent image repetition.",
    "",
    "## Checks",
    "",
    ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.viewport}: ${check.label}`),
    "",
    "## Visible Image Order",
    "",
    "### Desktop",
    ...desktop.data.visibleImages.map((image, index) => `- ${index + 1}. ${image.src || "(empty)"}`),
    "",
    "### Mobile",
    ...mobile.data.visibleImages.map((image, index) => `- ${index + 1}. ${image.src || "(empty)"}`),
    "",
    "## Findings",
    "",
    ...(findings.length ? findings.map((finding) => `- ${finding}`) : ["- No blocking rendered homepage visual-flow findings."]),
    "",
  ];
  await fs.writeFile(reportPath, `${lines.join("\n")}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
