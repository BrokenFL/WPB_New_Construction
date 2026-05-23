import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const reportPath = path.join(workspace, "research/source-material-review/homepage-visual-flow-report.md");
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
  console.log(JSON.stringify({ homepageVisual: "pass", checks: checks.length, reportPath: path.relative(workspace, reportPath) }, null, 2));
}

async function inspectHomepage(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(750);
  const data = await page.evaluate(() => {
    const sectionTop = (selector) => document.querySelector(selector)?.getBoundingClientRect().top ?? null;
    const visibleImages = [...document.querySelectorAll("main img")]
      .filter((img) => {
        const rect = img.getBoundingClientRect();
        const src = img.getAttribute("src") || "";
        const style = window.getComputedStyle(img);
        return rect.width > 40 && rect.height > 40
          && style.visibility !== "hidden"
          && Number(style.opacity || "1") > 0.05
          && !img.closest("[hidden]")
          && !src.includes("maps.googleapis.com/maps/vt");
      })
      .map((img) => ({
        src: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
        project: (img.getAttribute("src") || "").match(/^\/projects\/([^/]+)\//)?.[1] || "",
      }));
    const text = document.body.innerText;
    return {
      order: {
        updates: sectionTop(".home-news-section"),
        guidance: sectionTop(".home-blog-section"),
        featured: sectionTop(".project-sort-shell"),
        cta: sectionTop(".home-conversion-band"),
      },
      visibleImages,
      hasCta: Boolean(document.querySelector(".home-conversion-band a[href^='/inquire']")),
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      hasBackendTerms: /\b(needs_review|source-material|data model|content studio|builder)\b/i.test(text),
    };
  });
  await page.close();

  const findings = [];
  const checks = [];
  const orderOk = data.order.updates !== null && data.order.guidance !== null && data.order.featured !== null && data.order.cta !== null
    && data.order.updates < data.order.guidance
    && data.order.guidance < data.order.featured
    && data.order.featured < data.order.cta;
  checks.push({ viewport: viewport.name, label: "homepage section order", ok: orderOk });
  if (!orderOk) findings.push(`${viewport.name}: homepage order should be Hero -> Map -> Corridors -> Updates -> Guidance -> Featured Buildings -> CTA.`);
  checks.push({ viewport: viewport.name, label: "CTA visible", ok: data.hasCta });
  if (!data.hasCta) findings.push(`${viewport.name}: homepage CTA block is not visible.`);
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
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
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
