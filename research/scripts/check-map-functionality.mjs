import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const liveMode = process.argv.includes("--live");
const failures = [];
let previewProcess;
const baseUrl = liveMode ? (process.env.WPB_LIVE_BASE_URL ?? "https://www.wpbnewconstruction.com").replace(/\/$/, "") : await startPreview();
const localApiKeyPresent = hasBuildTimeApiKey();
const requireGoogleMapRender = liveMode || process.env.CI === "true" || localApiKeyPresent;
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

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const configuredPort = process.env.WPB_MAP_QA_PORT;
    if (configuredPort && (!/^\d+$/.test(configuredPort) || Number(configuredPort) < 1024 || Number(configuredPort) > 65535)) throw new Error("Invalid WPB_MAP_QA_PORT");
    const port = configuredPort || String(4173 + Math.floor(Math.random() * 1500));
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

    try {
      await waitForPreview(url, child);
      return url;
    } catch (error) {
      lastError = error;
      child.kill("SIGTERM");
      previewProcess = undefined;
    }
  }

  throw lastError;
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
  while (Date.now() - started < 60000) {
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
  const mapRequests = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text().replace(/https?:\/\/[^\s]+/g, "[URL omitted]");
    if (criticalConsolePatterns.some((pattern) => pattern.test(text))) consoleErrors.push(text);
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.name || "BrowserError");
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith(baseUrl) || url.includes("maps.googleapis.com")) {
      networkFailures.push(`${new URL(url).origin}${new URL(url).pathname} failed: ${request.failure()?.errorText ?? "unknown error"}`);
    }
  });
  page.on("request", (request) => {
    if (/maps\.googleapis\.com|maps\.gstatic\.com/i.test(request.url())) mapRequests.push(request.url());
  });

  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 25000 });
    if ((response?.status() ?? 0) >= 400) failures.push(`${route} returned HTTP ${response?.status() ?? "unknown"}.`);
    if (label === "home") {
      await page.locator(".route-view-home:not([hidden]) .home-hero-map-card").scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(label === "map" ? 3500 : 2500);

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
        mapControlsVisible: document.querySelectorAll(".map-route-controls [data-map-filter]").length >= 6,
        buildingLinks: document.querySelectorAll('a[href^="/projects/"], a[href="/buildings/"], a[href="/compare/"]').length,
      };
    });

    if (state.bodyLength < 300 || state.appLength < 700) failures.push(`${route} appears blank or under-rendered.`);
    if (!state.mapContainerAppears) failures.push(`${route} does not render a map container.`);
    if (label === "map" && !state.mapControlsVisible) failures.push("/map/ does not expose map corridor/status controls.");
    if (!state.googleMapRendered && !state.fallbackRendered) failures.push(`${route} shows neither Google map tiles nor the clean fallback.`);
    if (requireGoogleMapRender && !state.googleMapRendered) {
      const reason = mapRequests.length ? "Google Maps was requested but did not render" : "Google Maps was not requested by the bundle";
      failures.push(`${route} did not render Google Maps in ${liveMode ? "live" : "map-key"} mode: ${reason}.`);
    }
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

function hasBuildTimeApiKey() {
  if (process.env.VITE_GOOGLE_MAPS_API_KEY?.trim()) return true;
  if (!existsSync(".env.local")) return false;
  const envLocal = readFileSync(".env.local", "utf8");
  return /^VITE_GOOGLE_MAPS_API_KEY=.+/m.test(envLocal);
}

main().catch((error) => {
  if (previewProcess) previewProcess.kill("SIGTERM");
  console.error(error);
  process.exit(1);
});
