import assert from "node:assert/strict";
import test from "node:test";
import { readTsArray, upsertTsArrayObject } from "./article-market-note-utils.mjs";

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
