import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import {
  canonicalUrlFor,
  normalizeCandidate,
  readDraftStore,
  writeDraftStore,
  workspace,
} from "./news-draft-utils.mjs";

const repo = process.env.GITHUB_REPOSITORY || "BrokenFL/WPB_New_Construction";
const fixturePath = process.env.GPT_NEWS_ISSUES_FIXTURE || "";

async function main() {
  const issues = fixturePath ? JSON.parse(await fs.readFile(fixturePath, "utf8")) : await fetchIssues();
  const matching = issues.filter(isGptNewsIssue);
  const store = await readDraftStore();
  const seenUrls = new Set(store.items.map((item) => item.sourceUrl).filter(Boolean));
  const importedIssues = [];
  let importedCount = 0;

  for (const issue of matching) {
    const candidates = parseCandidates(issue.body || "").map((candidate) => ({
      ...candidate,
      importedFromIssue: {
        repo,
        number: issue.number,
        title: issue.title,
        url: issue.url,
      },
    }));
    const newDrafts = [];
    for (const candidate of candidates) {
      const sourceUrl = canonicalUrlFor(candidate);
      if (!sourceUrl || seenUrls.has(sourceUrl)) continue;
      const draft = await normalizeCandidate(candidate, [...store.items, ...newDrafts]);
      newDrafts.push(draft);
      seenUrls.add(sourceUrl);
    }
    if (!newDrafts.length) continue;
    store.items.push(...newDrafts);
    importedCount += newDrafts.length;
    importedIssues.push(issue);
  }

  await writeDraftStore(store);

  if (!fixturePath) {
    for (const issue of importedIssues) {
      commentOnIssue(issue.number, `Imported into content/news-drafts.json on ${new Date().toISOString().slice(0, 10)}.`);
      addLabel(issue.number, "codex-imported");
    }
  }

  console.log(JSON.stringify({ importedIssues: importedIssues.length, importedDrafts: importedCount, output: "content/news-drafts.json" }, null, 2));
}

function parseCandidates(body) {
  const blocks = [...body.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((match) => match[1].trim());
  const jsonTexts = blocks.length ? blocks : [body.slice(body.indexOf("{"))].filter((text) => text.trim().startsWith("{") || text.trim().startsWith("["));
  const candidates = [];
  for (const text of jsonTexts) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) candidates.push(...parsed);
      else if (Array.isArray(parsed.items)) candidates.push(...parsed.items);
      else if (Array.isArray(parsed.candidates)) candidates.push(...parsed.candidates);
      else candidates.push(parsed);
    } catch {
      // Ignore non-machine-readable fenced blocks; the issue still has to contain a parseable JSON block to import.
    }
  }
  return candidates.filter((candidate) => typeof candidate === "object" && candidate);
}

function isGptNewsIssue(issue) {
  const body = issue.body || "";
  const labels = (issue.labels || []).map((label) => typeof label === "string" ? label : label.name).filter(Boolean);
  return issue.title?.startsWith("Daily WPB News Drafts") &&
    body.includes("news-candidate") &&
    parseCandidates(body).length > 0 &&
    ["news-candidate", "gpt-draft", "needs-codex-draft", "wpb-new-construction"].every((label) => body.includes(label) || labels.includes(label));
}

async function fetchIssues() {
  const gh = spawnSync("gh", [
    "issue",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--search",
    '"Daily WPB News Drafts"',
    "--json",
    "number,title,body,url,labels",
    "--limit",
    "50",
  ], { cwd: workspace, encoding: "utf8" });
  if (gh.status === 0) return JSON.parse(gh.stdout || "[]");

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error("GitHub issue import needs either the gh CLI authenticated for this repo or GITHUB_TOKEN/GH_TOKEN in the environment.");
  }
  const [owner, name] = repo.split("/");
  const response = await fetch(`https://api.github.com/repos/${owner}/${name}/issues?state=open&per_page=50`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "user-agent": "wpb-news-draft-importer",
    },
  });
  if (!response.ok) throw new Error(`GitHub API issue query failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function commentOnIssue(number, body) {
  spawnSync("gh", ["issue", "comment", String(number), "--repo", repo, "--body", body], { cwd: workspace, stdio: "inherit" });
}

function addLabel(number, label) {
  spawnSync("gh", ["issue", "edit", String(number), "--repo", repo, "--add-label", label], { cwd: workspace, stdio: "inherit" });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
