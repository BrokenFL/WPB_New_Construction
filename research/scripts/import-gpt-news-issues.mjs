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
const reportPath = process.env.GPT_NEWS_IMPORT_REPORT || "";
const dryRun = process.argv.includes("--dry-run") || process.env.GPT_NEWS_IMPORT_DRY_RUN === "1";

async function main() {
  const issues = fixturePath ? JSON.parse(await fs.readFile(fixturePath, "utf8")) : await fetchIssues();
  const matching = issues.filter(isGptNewsIssue);
  const store = await readDraftStore();
  const seenUrls = new Set(store.items.map((item) => item.sourceUrl).filter(Boolean));
  const importedIssues = new Map();
  const issueSummaries = [];
  let importedCount = 0;

  for (const issue of matching) {
    const candidates = parseCandidates(issue.body || "").map((candidate) => ({
      ...normalizeIssueCandidate(candidate),
      importedFromIssue: {
        repo,
        number: issue.number,
        title: issue.title,
        url: issue.url,
        createdAt: issue.createdAt,
      },
    }));
    const newDrafts = [];
    const duplicateDrafts = [];
    const unimportedDrafts = [];
    for (const candidate of candidates) {
      const sourceUrl = canonicalUrlFor(candidate);
      if (!sourceUrl) {
        unimportedDrafts.push({ title: candidate.rewrittenHeadline || candidate.sourceTitle || candidate.title || "Untitled candidate", reason: "missing source URL" });
        continue;
      }
      if (seenUrls.has(sourceUrl)) {
        duplicateDrafts.push({ sourceUrl, title: candidate.rewrittenHeadline || candidate.sourceTitle || candidate.title || sourceUrl });
        continue;
      }
      const draft = await normalizeCandidate(candidate, [...store.items, ...newDrafts]);
      newDrafts.push(draft);
      seenUrls.add(sourceUrl);
    }
    if (newDrafts.length) {
      store.items.push(...newDrafts);
      importedCount += newDrafts.length;
      importedIssues.set(issue.number, issue);
    }
    issueSummaries.push({
      number: issue.number,
      title: issue.title,
      url: issue.url,
      candidateCount: candidates.length,
      importedCount: newDrafts.length,
      duplicateCount: duplicateDrafts.length,
      unimportedCount: unimportedDrafts.length,
      importedDraftIds: newDrafts.map((draft) => draft.id),
      duplicateItems: duplicateDrafts,
      unimportedItems: unimportedDrafts,
      labels: labelNames(issue),
    });
  }

  if (importedCount > 0 && !dryRun) await writeDraftStore(store);

  if (!fixturePath && !dryRun) {
    for (const issue of importedIssues.values()) {
      commentOnIssue(issue.number, `Imported into content/news-drafts.json on ${new Date().toISOString().slice(0, 10)}.`);
      addLabel(issue.number, "codex-imported");
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    repo,
    matchedIssues: matching.length,
    importedIssues: importedIssues.size,
    importedDrafts: importedCount,
    issues: issueSummaries,
    output: "content/news-drafts.json",
  };
  if (reportPath) await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

function parseCandidates(body) {
  const markdownCandidates = parseMarkdownCandidates(body);
  const blocks = [...body.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((match) => match[1].trim());
  const jsonTexts = blocks.length ? blocks : [body.slice(body.indexOf("{"))].filter((text) => text.trim().startsWith("{") || text.trim().startsWith("["));
  const candidates = [];
  for (const text of jsonTexts) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) candidates.push(...parsed);
      else if (Array.isArray(parsed.items)) candidates.push(...parsed.items);
      else if (Array.isArray(parsed.candidates)) candidates.push(...parsed.candidates);
      else if (Array.isArray(parsed.articleCandidates)) candidates.push(...parsed.articleCandidates);
      else candidates.push(parsed);
    } catch {
      // Ignore non-machine-readable fenced blocks; the issue still has to contain a parseable JSON block to import.
    }
  }
  return candidates
    .filter((candidate) => typeof candidate === "object" && candidate)
    .map((candidate) => mergeMarkdownCandidate(candidate, markdownCandidates));
}

function isGptNewsIssue(issue) {
  const body = issue.body || "";
  const labels = labelNames(issue);
  if (labels.includes("codex-imported") && !labels.includes("force-reimport")) return false;
  const titleMatches = /^Daily WPB News Drafts\b/.test(issue.title || "");
  const labelMatches = ["news-candidate", "gpt-draft", "needs-codex-draft"].some((label) => labels.includes(label));
  const bodyMatches = body.includes("news-candidate") || body.includes("gpt-draft") || body.includes("needs-codex-draft");
  return (titleMatches || labelMatches || bodyMatches) && parseCandidates(body).length > 0;
}

function labelNames(issue) {
  return (issue.labels || [])
    .map((label) => typeof label === "string" ? label : label.name)
    .filter(Boolean);
}

function parseMarkdownCandidates(body) {
  const chunks = body.split(/^## Candidate\s+\d+\s*$/gim).slice(1);
  return chunks.map((chunk) => {
    const text = chunk.split(/^---\s*$/m)[0] || chunk;
    return {
      sourceName: extractSourceName(text),
      sourceTitle: extractQuotedSourceTitle(text),
      sourceUrl: extractField(text, "Source URL"),
      rewrittenHeadline: extractField(text, "Rewritten headline"),
      deck: extractField(text, "Deck"),
      storyBody: extractField(text, "Story body"),
      whyItMatters: extractField(text, "Why it matters"),
      buyerTakeaway: extractField(text, "Brooke take"),
      cta: extractField(text, "CTA"),
      newsletterBlurb: extractField(text, "Newsletter blurb"),
      suggestedWebsiteCategory: extractField(text, "Category"),
      relatedProjectCorridor: extractField(text, "Related project/corridor"),
    };
  }).filter((candidate) => candidate.sourceUrl || candidate.rewrittenHeadline);
}

function mergeMarkdownCandidate(candidate, markdownCandidates) {
  const sourceUrl = nestedSourceUrl(candidate);
  const headline = clean(candidate.rewrittenHeadline || candidate.headline);
  const match = markdownCandidates.find((markdown) =>
    (sourceUrl && markdown.sourceUrl === sourceUrl) ||
    (headline && markdown.rewrittenHeadline === headline)
  );
  return match ? { ...match, ...candidate } : candidate;
}

function normalizeIssueCandidate(candidate) {
  const source = Array.isArray(candidate.sources) ? candidate.sources[0] : candidate.source;
  const imagePlan = candidate.imagePlan || {};
  const relatedText = clean(candidate.relatedProjectCorridor);
  const publishingLane = clean(candidate.publishingLane).toLowerCase();
  return {
    ...candidate,
    sourceUrl: clean(candidate.sourceUrl || candidate.url || source?.url),
    sourceName: clean(candidate.sourceName || candidate.publication || source?.publication),
    sourceTitle: clean(candidate.sourceTitle || source?.title || candidate.title),
    sourcePublishedAt: clean(candidate.sourcePublishedAt || source?.date || candidate.date),
    relatedProjectIds: asRelatedProjectIds(candidate.relatedProjectIds, relatedText),
    relatedCorridorIds: asRelatedCorridorIds(candidate.relatedCorridorIds, relatedText),
    deck: clean(candidate.deck),
    bodySections: Array.isArray(candidate.bodySections) && candidate.bodySections.length
      ? candidate.bodySections
      : bodySectionsFromIssue(candidate),
    buyerTakeaway: clean(candidate.buyerTakeaway || candidate.whyItMatters),
    cta: clean(candidate.cta),
    newsletterBlurb: clean(candidate.newsletterBlurb || candidate.deck),
    suggestedImagePath: clean(candidate.suggestedImagePath || candidate.imagePath || imagePlan.targetRepoPath),
    suggestedImagePrompt: clean(candidate.suggestedImagePrompt || imagePlan.imageGenerationPrompt),
    status: publishingLane.includes("needs-editorial-review") ? "needs_review" : candidate.status,
  };
}

function bodySectionsFromIssue(candidate) {
  const sections = [];
  if (candidate.storyBody) sections.push({ heading: "The story", body: candidate.storyBody });
  if (candidate.whyItMatters) sections.push({ heading: "Why it matters", body: candidate.whyItMatters });
  if (candidate.buyerTakeaway) sections.push({ heading: "Brooke's take", body: candidate.buyerTakeaway });
  return sections;
}

function nestedSourceUrl(candidate) {
  if (candidate.source?.url) return candidate.source.url;
  if (Array.isArray(candidate.sources) && candidate.sources[0]?.url) return candidate.sources[0].url;
  return candidate.sourceUrl || candidate.url;
}

function extractField(text, label) {
  const match = text.match(new RegExp(`\\*\\*${escapeRegExp(label)}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|\\n\\*\\*|$)`, "i"));
  return clean(match?.[1]).replace(/\s+$/g, "");
}

function extractSourceName(text) {
  const source = extractField(text, "Source");
  return clean(source.split(",")[0]);
}

function extractQuotedSourceTitle(text) {
  const source = extractField(text, "Source");
  return clean(source.match(/[“"]([^”"]+)[”"]/)?.[1]);
}

function asRelatedProjectIds(value, relatedText) {
  if (Array.isArray(value)) return value;
  const text = relatedText.toLowerCase();
  if (text.includes("nora")) return ["nora-house"];
  if (text.includes("ritz-carlton")) return ["ritz-carlton-wpb"];
  if (text.includes("mandarin")) return ["mandarin-oriental"];
  return [];
}

function asRelatedCorridorIds(value, relatedText) {
  if (Array.isArray(value)) return value;
  const text = relatedText.toLowerCase();
  const corridors = [];
  if (text.includes("south flagler")) corridors.push("south-flagler");
  if (text.includes("north flagler")) corridors.push("north-flagler");
  if (text.includes("downtown") || text.includes("nora")) corridors.push("downtown");
  return corridors;
}

function clean(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchIssues() {
  const gh = spawnSync("gh", [
    "issue",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--json",
    "number,title,body,url,labels,createdAt",
    "--limit",
    "100",
  ], { cwd: workspace, encoding: "utf8" });
  if (gh.status === 0) return JSON.parse(gh.stdout || "[]");

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const [owner, name] = repo.split("/");
  const response = await fetch(`https://api.github.com/repos/${owner}/${name}/issues?state=open&per_page=50`, {
    headers: {
      accept: "application/vnd.github+json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      "user-agent": "wpb-news-draft-importer",
    },
  });
  if (!response.ok) {
    const authHint = token ? "Token-backed" : "Unauthenticated";
    throw new Error(`${authHint} GitHub API issue query failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

function commentOnIssue(number, body) {
  const gh = spawnSync("gh", ["issue", "comment", String(number), "--repo", repo, "--body", body], { cwd: workspace, stdio: "inherit" });
  if (gh.error?.code === "ENOENT") console.warn("Skipping GitHub issue comment because gh is not installed in this shell.");
}

function addLabel(number, label) {
  const gh = spawnSync("gh", ["issue", "edit", String(number), "--repo", repo, "--add-label", label], { cwd: workspace, stdio: "inherit" });
  if (gh.error?.code === "ENOENT") console.warn(`Skipping GitHub issue label ${label} because gh is not installed in this shell.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
