import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const registryPath = path.resolve("data/project_assets.json");
const publicRoot = path.resolve("public");

if (!fs.existsSync(registryPath)) {
  console.error(`Missing asset registry: ${registryPath}`);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
let failures = 0;
let warnings = 0;
let approvedCount = 0;

for (const [projectKey, project] of Object.entries(registry.projects ?? {})) {
  const approvedAssets = (project.assets ?? []).filter((asset) => asset.status === "approved");
  const hasHero = approvedAssets.some((asset) => asset.placement === "hero");

  if (!hasHero) {
    warnings += 1;
    console.warn(`WARN ${projectKey}: no approved hero asset`);
  }

  for (const asset of approvedAssets) {
    approvedCount += 1;

    if (!asset.src?.startsWith("/assets/")) {
      failures += 1;
      console.error(`FAIL ${projectKey}: approved asset must use /assets/... src: ${asset.src ?? "(missing)"}`);
      continue;
    }

    const localPath = path.join(publicRoot, asset.src.replace(/^\//, ""));
    if (!fs.existsSync(localPath)) {
      failures += 1;
      console.error(`FAIL ${projectKey}: missing approved asset file ${asset.src}`);
    }

    if (!asset.alt?.trim()) {
      warnings += 1;
      console.warn(`WARN ${projectKey}: approved asset missing alt text ${asset.src}`);
    }
  }
}

console.log(JSON.stringify({ assetRegistry: failures ? "fail" : "pass", approvedAssets: approvedCount, warnings }, null, 2));

if (failures) {
  process.exit(1);
}
