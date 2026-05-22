import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const mainSource = fs.readFileSync(path.join(workspace, "src/main.ts"), "utf8");
const findings = [];
const logoBlock = mainSource.match(/const projectLogoImages:[\s\S]*?};/)?.[0] ?? "";

if (!logoBlock) findings.push("projectLogoImages mapping was not found.");

const logoRefs = [...logoBlock.matchAll(/"?(?<id>[a-z0-9-]+)"?:\s*\{\s*src:\s*"(?<src>[^"]+)",\s*alt:\s*"(?<alt>[^"]+)"/g)];
for (const match of logoRefs) {
  const { id, src, alt } = match.groups;
  if (/^https?:\/\//.test(src)) findings.push(`${id}: logoImage must be local, not hotlinked.`);
  if (!alt || alt.length < 8 || !/logo/i.test(alt)) findings.push(`${id}: logoAlt should be meaningful and include logo.`);
  const filePath = path.join(workspace, "public", src);
  if (!fs.existsSync(filePath)) {
    findings.push(`${id}: configured logo file does not exist at ${src}.`);
    continue;
  }
  const size = fs.statSync(filePath).size;
  if (size > 300_000) findings.push(`${id}: logo file is too large (${size} bytes).`);
}

if (!mainSource.includes("project.logoImage && canShowImage(project.logoImage)")) {
  findings.push("Project identity header does not conditionally render configured logos.");
}

if (!mainSource.includes("`<strong>${publicText(project.name)}</strong>`")) {
  findings.push("Project identity header text fallback is missing.");
}

if (!mainSource.includes("<h1>${publicText(project.name)}</h1>")) {
  findings.push("Project identity header must render readable project name text even when a logo exists.");
}

if (findings.length) {
  console.error("Project logo QA findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Project logo QA passed for ${logoRefs.length} configured logo${logoRefs.length === 1 ? "" : "s"}.`);
