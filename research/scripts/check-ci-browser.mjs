// Read-only check of the immutable CI image; never installs or publishes.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { constants } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { chromium } from "playwright";

const lock = JSON.parse(await fs.readFile(new URL("../../package-lock.json", import.meta.url), "utf8"));
const installed = JSON.parse(await fs.readFile(new URL("../../node_modules/playwright/package.json", import.meta.url), "utf8"));
assert.equal(installed.version, lock.packages["node_modules/playwright"].version);
assert.equal(process.versions.node.split(".")[0], "22", "Preserve Node 22");
assert.equal(process.platform, "linux");
assert.equal(process.getuid(), 1001, "Preserve the unprivileged runner user");
const release = await fs.readFile("/etc/os-release", "utf8");
assert.match(release, /^ID=ubuntu$/m);
assert.match(release, /^VERSION_ID="24\.04"$/m);
assert.equal(process.env.PLAYWRIGHT_BROWSERS_PATH, "/ms-playwright");
const executable = chromium.executablePath();
assert.ok(executable.startsWith("/ms-playwright/"));
await fs.access(executable, constants.X_OK);
const fonts = ["fonts-liberation", "fonts-noto-color-emoji", "fonts-freefont-ttf",
  "fonts-ipafont-gothic", "fonts-tlwg-loma-otf", "fonts-unifont", "fonts-wqy-zenhei",
  "xfonts-cyrillic", "xfonts-encodings", "xfonts-scalable", "xfonts-utils"];
for (const font of fonts) {
  assert.equal(execFileSync("dpkg-query", ["-W", "-f=${db:Status-Status}", font], { encoding: "utf8" }), "installed", font);
}
const tools = Object.fromEntries(["git", "npm", "bash", "curl"].map(tool =>
  [tool, execFileSync(tool, ["--version"], { encoding: "utf8" }).split("\n")[0]]));
const gh = spawnSync("gh", ["--version"], { encoding: "utf8" });
tools.gh = gh.status === 0 ? gh.stdout.split("\n")[0] : "not installed";
execFileSync("git", ["status", "--short"], { encoding: "utf8" });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent("<title>Browser recovery</title><p>Chromium ready</p>");
  assert.equal(await page.title(), "Browser recovery");
  assert.equal(await page.locator("p").innerText(), "Chromium ready");
  console.log(JSON.stringify({ browserCompatibility: "pass", playwright: installed.version,
    chromium: browser.version(), os: "Ubuntu 24.04", uid: process.getuid(), executable, fonts, tools }));
} finally {
  await browser.close();
}
