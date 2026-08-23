import { chromium } from "playwright";

const baseUrl = (process.env.WPB_LIVE_BASE_URL ?? "https://www.wpbnewconstruction.com").replace(/\/$/, "");
const routes = [
  "/",
  "/buildings/",
  "/map/",
  "/compare/",
  "/updates/",
  "/market-notes/",
  "/inquire/",
  "/projects/olara/",
];

const criticalConsolePatterns = [
  /ReferenceError/i,
  /TypeError/i,
  /SyntaxError/i,
  /Cannot access .* before initialization/i,
  /Failed to load module script/i,
  /MIME type/i,
  /hydration/i,
];

const failures = [];
const cacheBust = `healthCheck=${Date.now()}`;

async function main() {
  const htmlResponse = await fetch(`${baseUrl}/?${cacheBust}`, {
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
  });
  if (htmlResponse.status !== 200) {
    failures.push(`Homepage returned HTTP ${htmlResponse.status}.`);
  }

  const html = await htmlResponse.text();
  const jsAsset = html.match(/"((?:\/assets\/index-)[^"]+\.js)"/)?.[1];
  const cssAsset = html.match(/"((?:\/assets\/index-)[^"]+\.css)"/)?.[1];

  if (!jsAsset) failures.push("Homepage HTML does not reference an index JS asset.");
  if (!cssAsset) failures.push("Homepage HTML does not reference an index CSS asset.");

  await checkAsset("JS", jsAsset);
  await checkAsset("CSS", cssAsset);
  await checkVisibleRoutes();

  if (failures.length) {
    console.error(["Live site health check failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ liveSite: "pass", baseUrl, jsAsset, cssAsset, routesChecked: routes.length }, null, 2));
}

async function checkAsset(label, assetPath) {
  if (!assetPath) return;
  const assetResponse = await fetch(`${baseUrl}${assetPath}`, { method: "HEAD" });
  if (assetResponse.status !== 200) {
    failures.push(`${label} asset ${assetPath} returned HTTP ${assetResponse.status}.`);
  }
}

async function checkVisibleRoutes() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const route of routes) {
      await checkRoute(browser, route);
    }
  } finally {
    await browser.close();
  }
}

async function checkRoute(browser, route) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const routeFailures = [];
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (criticalConsolePatterns.some((pattern) => pattern.test(text))) {
      consoleErrors.push(text);
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.stack ?? error.message);
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.includes("wpbnewconstruction.com") || url.startsWith(baseUrl)) {
      const errorText = request.failure()?.errorText ?? "unknown error";
      if (errorText === "net::ERR_ABORTED" || errorText === "NS_BINDING_ABORTED") return;
      routeFailures.push(`${url} failed: ${errorText}`);
    }
  });

  try {
    await page.setExtraHTTPHeaders({ "cache-control": "no-cache", pragma: "no-cache" });
    const query = route.includes("?") ? `&${cacheBust}` : `?${cacheBust}`;
    const response = await page.goto(`${baseUrl}${route}${query}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    if ((response?.status() ?? 0) >= 400) {
      failures.push(`${route} returned HTTP ${response?.status() ?? "unknown"}.`);
    }

    await page.waitForTimeout(1000);

    const bodyTextLength = await page.locator("body").innerText().then((text) => text.trim().length);
    const appHtmlLength = await page.locator("#app").evaluate((element) => element.innerHTML.trim().length).catch(() => 0);
    const visibleHeading = await page.locator("h1, h2").first().innerText({ timeout: 5000 }).catch(() => "");

    if (bodyTextLength < 120) failures.push(`${route} appears blank or under-rendered; body text length ${bodyTextLength}.`);
    if (appHtmlLength < 500) failures.push(`${route} has a blank or under-rendered #app root; HTML length ${appHtmlLength}.`);
    if (!visibleHeading.trim()) failures.push(`${route} did not expose a visible heading.`);
  } catch (error) {
    failures.push(`${route} browser check failed: ${error.message}`);
  } finally {
    if (consoleErrors.length) {
      failures.push(`${route} critical console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);
    }
    if (routeFailures.length) {
      failures.push(`${route} network failures: ${routeFailures.slice(0, 3).join(" | ")}`);
    }
    await page.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
