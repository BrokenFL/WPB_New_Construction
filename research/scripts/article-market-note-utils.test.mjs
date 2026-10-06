import assert from "node:assert/strict";
import { marketNotePath, marketNoteForPath, validateBuyerRouteBase } from "../../src/lib/marketNoteRouting.ts";
import { renderMarketNoteBody } from "../../src/lib/marketNoteBody.ts";
import test from "node:test";
import { readBuyerIntentAnswerPages, readTsArray, removeBuyerIntentAnswerPage, upsertTsArrayObject } from "./article-market-note-utils.mjs";

const answerSource = `const untouched = "https://example.com/project";
const buyerIntentAnswerPages: BuyerIntentAnswerPage[] = [
  { slug: "preserve", title: "Keep this answer", links: ["/answers/update/"], faqs: [] },
  { slug: "update", title: "Replace old copy", faqs: [{ answer: "A stale delivery claim" }] },
];
const trailingCode = "keep";
`;

test("refreshing a legacy Answers guide removes only its old record and FAQ", () => {
  const next = removeBuyerIntentAnswerPage(answerSource, "update");
  assert.deepEqual(readBuyerIntentAnswerPages(next), readBuyerIntentAnswerPages(answerSource).filter(a => a.slug !== "update"));
  assert.ok(next.includes('const untouched = "https://example.com/project";'));
  assert.ok(next.includes('links: ["/answers/update/"]'));
  assert.ok(next.includes('const trailingCode = "keep";'));
  assert.ok(!next.includes("A stale delivery claim"));
});

test("legacy Answers replacement refuses missing or ambiguous records", () => {
  assert.throws(() => removeBuyerIntentAnswerPage(answerSource, "missing"), /Expected one/);
  const duplicate = answerSource.replace('slug: "preserve"', 'slug: "update"');
  assert.throws(() => removeBuyerIntentAnswerPage(duplicate, "update"), /Expected one/);
});

test("legacy Answers parsing preserves URLs, strings and nested objects", () => {
  const source = answerSource.replace('title: "Replace old copy"', 'title: "A brace } and a bracket ]", nested: { url: "https://example.com/a//b" }');
  const answer = readBuyerIntentAnswerPages(source).find(a => a.slug === "update");
  assert.equal(answer.nested.url, "https://example.com/a//b");
  assert.equal(readBuyerIntentAnswerPages(removeBuyerIntentAnswerPage(source, "update")).length, 1);
});

test("an Answers article keeps one canonical route through an editorial update", () => {
  const article = { id: "comparison", slug: "alba-vs-olara", status: "published", routeBase: "/answers/", category: "Building Comparisons" };
  const source = `export const marketNotes = [${JSON.stringify(article)}];`;
  const notes = readTsArray(upsertTsArrayObject(source, "marketNotes", { ...article, title: "Updated comparison" }, article.slug), "marketNotes");
  assert.equal(notes.length, 1);
  assert.equal(marketNotePath(notes[0]), "/answers/alba-vs-olara/");
  assert.equal(marketNoteForPath(notes, "/answers/alba-vs-olara"), notes[0]);
  assert.equal(marketNoteForPath(notes, "/market-notes/alba-vs-olara/"), undefined);
  assert.equal(marketNotePath({ slug: "existing-guide" }), "/market-notes/existing-guide/");
  assert.equal(marketNotePath({ slug: "existing-spotlight", category: "Downtown Spotlight" }), "/downtown-spotlight/existing-spotlight/");
  assert.throws(() => validateBuyerRouteBase("/answers/", "news"));
  assert.throws(() => validateBuyerRouteBase("/projects/", "buyer"));
});

test("article paragraphs preserve local Word links and escape untrusted markup", () => {
  const html = renderMarketNoteBody("Read [Olara](https://www.wpbnewconstruction.com/projects/olara/).\n\n<script>alert(1)</script> [unsafe](javascript:alert) [off-site](https://example.com/)");
  assert.match(html, /<a href="\/projects\/olara\/">Olara<\/a>/);
  assert.equal((html.match(/<p>/g) || []).length, 2);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("href=\"javascript:"));
  assert.ok(!html.includes("href=\"https://example.com"));
});

const source = `const articleCta = "Ask for current availability.";

export const marketNotes = [
  {
    id: "nora-hotel-countdown",
    slug: "nora-hotel-countdown",
    category: "Downtown Spotlight",
    relatedBuildings: [],
    relatedNeighborhoods: [],
    relatedCorridor: "",
    relatedArticleIds: [],
    ctaText: articleCta,
  },
  {
    id: "urban-roast-opens-on-datura-street",
    slug: "urban-roast-opens-on-datura-street",
    category: "Downtown Spotlight",
    relatedBuildings: [],
    relatedNeighborhoods: [],
    relatedCorridor: "",
    relatedArticleIds: [],
  },
];
`;

test("new market notes do not replace unrelated articles with empty relationship metadata", () => {
  const next = upsertTsArrayObject(source, "marketNotes", {
    id: "therealreal-cityplace-move",
    slug: "therealreal-cityplace-move",
    category: "Downtown Spotlight",
    relatedBuildings: [],
    relatedNeighborhoods: [],
    relatedCorridor: "",
    relatedArticleIds: [],
  }, "therealreal-cityplace-move");
  const notes = readTsArray(next, "marketNotes");

  assert.equal(notes.length, 3);
  assert.ok(notes.some((note) => note.slug === "nora-hotel-countdown"));
  assert.ok(notes.some((note) => note.slug === "urban-roast-opens-on-datura-street"));
  assert.ok(notes.some((note) => note.slug === "therealreal-cityplace-move"));
});

test("market note edits replace only the matching slug", () => {
  const next = upsertTsArrayObject(source, "marketNotes", {
    id: "nora-hotel-countdown",
    slug: "nora-hotel-countdown",
    category: "Downtown Spotlight",
    title: "Updated title",
  }, "nora-hotel-countdown");
  const notes = readTsArray(next, "marketNotes");

  assert.equal(notes.length, 2);
  assert.equal(notes.find((note) => note.slug === "nora-hotel-countdown")?.title, "Updated title");
  assert.ok(notes.some((note) => note.slug === "urban-roast-opens-on-datura-street"));
});
