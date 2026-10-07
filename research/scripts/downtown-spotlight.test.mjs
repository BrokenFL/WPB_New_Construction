import assert from "node:assert/strict";
import test from "node:test";
import { publishedDowntownSpotlights, renderDowntownSpotlightDesk } from "../../src/lib/downtownSpotlight.ts";

const note = (slug, datePublished, extra = {}) => ({
  slug, datePublished, dateModified: datePublished, title: slug, status: "published",
  category: "Downtown Spotlight", excerpt: "Story context", buyerTakeaway: "Buyer context",
  ...extra,
});
const slugs = (html) => [...html.matchAll(/data-spotlight-slug="([^"]+)"/g)].map((match) => match[1]);

test("Spotlight features use publication order and exclude private or archived articles", () => {
  const notes = [
    note("older-edited", "2026-06-01", { dateModified: "2026-10-07" }),
    note("archived", "2026-10-07", { status: "archived" }),
    note("draft", "2026-10-07", { status: "draft" }),
    note("review", "2026-10-07", { status: "ready-for-review" }),
    note("buyer-guide", "2026-10-07", { category: "Buyer Intelligence" }),
    note("newer", "2026-10-06"),
  ];
  const before = notes.map((item) => item.slug);
  assert.deepEqual(publishedDowntownSpotlights(notes).map((item) => item.slug), ["newer", "older-edited"]);
  assert.deepEqual(notes.map((item) => item.slug), before);
});

test("homepage and index share the newest three; index retains every published story once", () => {
  const notes = [1, 2, 3, 4, 5].map((day) => note(`story-${day}`, `2026-10-0${day}`));
  const homepage = renderDowntownSpotlightDesk(notes);
  const index = renderDowntownSpotlightDesk(notes, { index: true });
  assert.deepEqual(slugs(homepage), ["story-5", "story-4", "story-3"]);
  assert.deepEqual(slugs(index), ["story-5", "story-4", "story-3", "story-2", "story-1"]);
  assert.match(homepage, /<h2 id="home-downtown-spotlight-title"/);
  assert.match(index, /<h1 id="downtown-spotlight-title"/);
  for (const slug of slugs(index)) assert.ok(index.includes(`href="/downtown-spotlight/${slug}/"`));
  assert.equal(renderDowntownSpotlightDesk([]), "");
});
