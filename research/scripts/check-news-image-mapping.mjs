import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const newsPath = path.join(workspace, "src/data/approvedExternalNews.ts");
const mainPath = path.join(workspace, "src/main.ts");
const source = fs.readFileSync(newsPath, "utf8");
const main = fs.readFileSync(mainPath, "utf8");
const findings = [];

const projectImageRules = {
  rosewood: "/projects/rosewood/media/",
  olara: "/projects/olara/media/",
  shorecrest: "/projects/shorecrest/media/",
  "south-flagler-house": "/projects/south-flagler-house/media/",
  "nora-house": "/projects/nora-house/media/",
  "mandarin-oriental": "/projects/mandarin-oriental/media/",
};

for (const [projectId, expectedPath] of Object.entries(projectImageRules)) {
  if (source.includes(`"${projectId}"`) && !main.includes(`id: "${projectId}"`)) {
    findings.push(`${projectId}: published news references a project that is not in featuredProjects.`);
  }
  if (source.includes(`"${projectId}"`) && !main.includes(expectedPath)) {
    findings.push(`${projectId}: no local project media path found for exact project image resolution.`);
  }
}

if (!main.includes("project.heroImage ?? project.image")) {
  findings.push("projectImageForContent must prefer exact project hero/card media before corridor imagery.");
}

if (!main.includes("publishedExternalNews.map(renderExternalNewsItem)")) {
  findings.push("Updates route is not rendering the approved external news feed.");
}

if (/status:\s*"published"[\s\S]{0,260}paywallStatus:\s*"likely-paywalled"/.test(source)) {
  findings.push("Published news includes likely-paywalled items; mark clearly and deprioritize or exclude.");
}

const urlMatches = [...source.matchAll(/"?canonicalUrl"?:\s*"([^"]+)"/g)];
for (const [, url] of urlMatches) {
  if (url.includes("news.google.com")) findings.push(`${url}: published item should link to original article, not Google News.`);
}

if (findings.length) {
  console.error("News image/source QA findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`News image/source QA passed for ${urlMatches.length} published external link${urlMatches.length === 1 ? "" : "s"}.`);
