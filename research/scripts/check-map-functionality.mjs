import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const liveMode = process.argv.includes("--live");
const failures = [];
let previewProcess;
const baseUrl = liveMode ? (process.env.WPB_LIVE_BASE_URL ?? "https://www.wpbnewconstruction.com").replace(/\/$/, "") : await startPreview();
const criticalConsolePatterns = [
  /ReferenceError/i,
  /TypeError/i,
  /SyntaxError/i,
  /Cannot access .* before initialization/i,
  /Failed to load module script/i,
  /initMap is not a function/i,
  /google is undefined/i,
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    await checkRoute(browser, "/map/", "map");
    await checkRoute(browser, "/", "home");
  } finally {
    await browser.close();
    if (previewProcess) previewProcess.kill("SIGTERM");
  }

  if (failures.length) {
    console.error(["Map functionality check failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ mapQa: "pass", mode: liveMode ? "live" : "preview", baseUrl }, null, 2));
}

async function startPreview() {
  if (!existsSync("dist/index.html")) {
    failures.push("dist/index.html is missing. Run npm run build before qa:map.");
    return "http://127.0.0.1:4173";
  }

  const port = String(4173 + Math.floor(Math.random() * 1000));
  const child = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", port, "--strictPort"],
    {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    },
  );
  previewProcess = child;
  const url = `http://127.0.0.1:${port}`;

  await waitForPreview(url, child);
  return url;
}

async function waitForPreview(url, child) {
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  const started = Date.now();
  while (Date.now() - started < 15000) {
    if (child.exitCode !== null) {
      throw new Error(`Vite preview exited early.\n${output}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Timed out waiting for Vite preview at ${url}.\n${output}`);
}

async function checkRoute(browser, route, label) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const consoleErrors = [];
  const networkFailures = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (criticalConsolePatterns.some((pattern) => pattern.test(text))) consoleErrors.push(text);
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.stack ?? error.message);
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith(baseUrl) || url.includes("maps.googleapis.com")) {
      networkFailures.push(`${url} failed: ${request.failure()?.errorText ?? "unknown error"}`);
    }
  });

  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 25000 });
    if ((response?.status() ?? 0) >= 400) failures.push(`${route} returned HTTP ${response?.status() ?? "unknown"}.`);
    await page.waitForTimeout(label === "map" ? 3500 : 1500);

    const state = await page.evaluate(() => {
      const card = [...document.querySelectorAll(".home-hero-map-card")].find(
        (item) => !item.closest("[data-route-view]")?.hidden,
      );
      const mapCanvas = card?.querySelector("[data-hero-google-map]");
      const fallback = document.querySelector(".hero-map-fallback");
      const fallbackStyle = fallback ? getComputedStyle(fallback) : null;
      const mapRect = mapCanvas?.getBoundingClientRect();
      const text = document.body.innerText;
      return {
        bodyLength: text.trim().length,
        appLength: document.querySelector("#app")?.innerHTML.trim().length ?? 0,
        cardState: card?.getAttribute("data-map-state") ?? null,
        mapContainerAppears: Boolean(mapCanvas),
        mapContainerSize: mapRect ? { width: Math.round(mapRect.width), height: Math.round(mapRect.height) } : null,
        googleMapRendered: Boolean(document.querySelector(".gm-style")),
        fallbackRendered: Boolean(fallback && fallbackStyle?.display !== "none" && fallbackStyle?.visibility !== "hidden"),
        fallbackCopy: fallback?.textContent ?? "",
        corridorListVisible: /North Flagler/i.test(text) && /Downtown/i.test(text) && /South Flagler/i.test(text),
        buildingLinks: document.querySelectorAll('a[href^="/projects/"], a[href="/buildings/"], a[href="/compare/"]').length,
      };
    });

    if (state.bodyLength < 300 || state.appLength < 700) failures.push(`${route} appears blank or under-rendered.`);
    if (!state.mapContainerAppears) failures.push(`${route} does not render a map container.`);
    if (label === "map" && !state.corridorListVisible) failures.push("/map/ does not expose the corridor/project text fallback list.");
    if (!state.googleMapRendered && !state.fallbackRendered) failures.push(`${route} shows neither Google map tiles nor the clean fallback.`);
    if (state.fallbackRendered && !/Map temporarily unavailable/.test(state.fallbackCopy)) {
      failures.push(`${route} fallback copy is not the approved public copy.`);
    }
    if (state.buildingLinks < 3) failures.push(`${route} does not expose enough project/corridor fallback links.`);
  } catch (error) {
    failures.push(`${route} browser check failed: ${error.message}`);
  } finally {
    if (consoleErrors.length) failures.push(`${route} critical console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);
    if (networkFailures.length && !networkFailures.every((failure) => /maps\.googleapis\.com/.test(failure))) {
      failures.push(`${route} network failures: ${networkFailures.slice(0, 3).join(" | ")}`);
    }
    await page.close();
  }
}

main().catch((error) => {
  if (previewProcess) previewProcess.kill("SIGTERM");
  console.error(error);
  process.exit(1);
});
