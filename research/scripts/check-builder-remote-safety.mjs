import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const failures = [];

async function main() {
  const server = await read("tools/content-studio/server.mjs");
  const app = await read("tools/content-studio/app.js");
  const html = await read("tools/content-studio/index.html");
  const docs = await read("docs/brooke-builder-remote-access.md");
  const tunnelTemplate = await read("config/cloudflare/brooke-builder-tunnel.example.yml");
  const redirects = await read("public/_redirects");
  const main = await read("src/main.ts");
  const pkg = JSON.parse(await read("package.json"));

  assert(server.includes('server.listen(port, "127.0.0.1"'), "Builder must bind to 127.0.0.1 by default.");
  assert(!server.includes('"0.0.0.0"') && !server.includes("'0.0.0.0'"), "Builder must not bind to 0.0.0.0.");
  assert(server.includes("builder.wpbnewconstruction.com"), "Remote hostname detection is missing.");
  assert(server.includes("confirmRemote") && server.includes("confirmUpdate"), "Remote/update confirmation checks are missing.");
  assert(html.includes("Remote Builder Mode") && app.includes("remoteBanner"), "Remote mode banner is missing.");
  assert(html.includes("allowRepeatedImage") && html.includes("repetitionApprovalReason"), "Intentional repetition controls are missing.");
  assert(app.includes("focalPointX") && app.includes("object-position"), "Focal point preview controls are missing.");
  assert(server.includes("/api/reports") && html.includes("reportsPanel"), "Builder report viewer is missing.");
  assert(/Cloudflare Access/i.test(docs) && /deny everyone else/i.test(docs) && /no public access/i.test(docs), "Remote access docs must require Cloudflare Access.");
  assert(tunnelTemplate.includes("builder.wpbnewconstruction.com") && tunnelTemplate.includes("http://127.0.0.1:8787"), "Tunnel template must point only to local Builder.");
  assert(redirects.includes("/brooke-builder/ / 302") && redirects.includes("/content-studio/ / 302"), "Public Builder redirects are missing.");
  assert(main.includes('"/brooke-builder/"') && main.includes('"/content-studio/"') && main.includes('return "/"'), "App route guard for Builder paths is missing.");
  assert(pkg.scripts?.["qa:builder-remote"] === "node research/scripts/check-builder-remote-safety.mjs", "qa:builder-remote script is missing.");
  assert(pkg.scripts?.["qa:launch"]?.includes("qa:builder-remote"), "qa:launch must include qa:builder-remote.");

  if (failures.length) {
    console.error(["Builder remote safety QA failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ builderRemoteSafety: "pass" }, null, 2));
}

async function read(relativePath) {
  return fs.readFile(path.join(workspace, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
