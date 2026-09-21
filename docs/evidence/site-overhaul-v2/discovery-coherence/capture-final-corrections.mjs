import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

const origin = process.env.V2_ORIGIN || "http://127.0.0.1:5188";
const output = path.resolve(new URL("./after/", import.meta.url).pathname);
const cases = [
  {
    key: "newest-article-neutral-discovery",
    path: "/updates/terra-frisbie-20m-west-palm-beach-assemblage-2026-2026-09-15/",
    selector: ".article-discovery-bridge",
  },
  {
    key: "olara-cross-area-comparison",
    path: "/compare/?projects=olara,south-flagler-house",
    selector: ".compare-workspace",
  },
];
const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

await fs.mkdir(output, { recursive: true });
for (const [engine, launcher] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await launcher.launch({ headless: true });
  for (const [viewportName, viewport] of viewports) {
    const page = await browser.newPage({ viewport, colorScheme: "light" });
    for (const item of cases) {
      await page.goto(`${origin}${item.path}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
        await document.fonts?.ready;
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
      });
      await page.addStyleTag({ content: ".v2-skip-link { top: -100px !important; visibility: hidden !important; }" });
      const target = page.locator(item.selector).first();
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await target.screenshot({ path: path.join(output, `${item.key}-${viewportName}-${engine}.png`) });
    }
    await page.close();
  }
  await browser.close();
}

console.log(JSON.stringify({ status: "captured", cases: cases.map((item) => item.key), engines: ["chromium", "webkit"], viewports: viewports.map(([name]) => name) }));
