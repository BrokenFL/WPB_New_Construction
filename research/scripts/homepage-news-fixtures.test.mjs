import assert from "node:assert/strict";
import test from "node:test";
import { sortNewsItems } from "../../src/data/approvedExternalNews.ts";
import { createHomepageNewsPresenter, escapeHtml, fixture } from "./homepage-news-presenter.mjs";

const presenter = createHomepageNewsPresenter();
const presenters = presenter.presenters;
const renderedDesk = (items) => presenter.render(items);

test("new publishedAt selects the lead and drops the former oldest card", () => {
  const items = sortNewsItems([
    fixture({ id: "oldest", publishedAt: "2026-08-01" }),
    fixture({ id: "middle", publishedAt: "2026-09-02" }),
    fixture({ id: "latest", publishedAt: "2026-09-10" }),
    fixture({ id: "new-lead", publishedAt: "2026-09-18" }),
  ]);
  const html = renderedDesk(items);
  assert.deepEqual([...html.matchAll(/data-home-news-id="([^"]+)"/g)].map((match) => match[1]), ["new-lead", "latest", "middle"]);
  assert.doesNotMatch(html, /data-home-news-id="oldest"/);
});

test("fewer than three future stories and an empty future set preserve the module contract", () => {
  for (const items of [
    [fixture({ id: "one" })],
    [fixture({ id: "one" }), fixture({ id: "two", publishedAt: "2026-09-09" })],
  ]) {
    const html = renderedDesk(sortNewsItems(items));
    assert.doesNotMatch(html, /Our three latest publications/);
    assert.match(html, /Our latest reporting; source reports may cover earlier events\./);
  }
  assert.equal((renderedDesk(sortNewsItems([fixture({ id: "one" }), fixture({ id: "two", publishedAt: "2026-09-09" })])).match(/data-home-news-id=/g) ?? []).length, 2);
  assert.equal(renderedDesk([]), "");
});

test("each changed source field independently invalidates a Desk display override", () => {
  const variant = presenters.homepageDeskDisplayVariants()[0];
  const exact = fixture({
    id: "variant-exact",
    title: variant.sourceTitle,
    buyerTakeaway: variant.sourceBuyerTakeaway,
    imagePath: variant.sourcePath,
  });
  assert.equal(presenters.homepageDeskDisplayVariant(exact).displayTitle, variant.displayTitle);

  const changedTitle = { ...exact, title: `${exact.title} — revised source title` };
  const changedTakeaway = { ...exact, buyerTakeaway: `${exact.buyerTakeaway} Revised independently.` };
  const changedImage = { ...exact, imagePath: "/assets/editorial/future-news.jpg" };
  for (const changed of [changedTitle, changedTakeaway, changedImage]) {
    assert.equal(presenters.homepageDeskDisplayVariant(changed), undefined);
    const copy = presenters.homepageDeskCopy(changed);
    assert.equal(copy.title, changed.title);
    assert.equal(copy.takeaway, changed.buyerTakeaway);
  }
  const changedImageVisual = presenters.homepageDeskVisual(changedImage, "lead");
  assert.equal(changedImageVisual.desktopSrc, changedImage.imagePath);
  assert.equal(changedImageVisual.width, undefined);
});

test("long headlines remain addressable and missing image records omit media", () => {
  const longTitle = "A future West Palm Beach development headline that stays available in full for buyers reviewing the next phase";
  const html = renderedDesk([fixture({ id: "long-title", slug: "long-title", title: longTitle, imagePath: undefined })]);
  assert.match(html, new RegExp(`data-home-news-display-title="${escapeHtml(longTitle)}"`));
  assert.match(html, new RegExp(`<h3><a href="/updates/long-title/">${escapeHtml(longTitle)}</a>`));
  assert.doesNotMatch(html, /v2-desk-visual/);
});

test("project, corridor, and directory destinations remain distinct", () => {
  const html = renderedDesk(sortNewsItems([
    fixture({ id: "project-target", publishedAt: "2026-09-12", relatedProjectIds: ["alba-palm-beach"] }),
    fixture({ id: "corridor-target", publishedAt: "2026-09-11", relatedCorridorIds: ["north-flagler"] }),
    fixture({ id: "directory-target", publishedAt: "2026-09-10" }),
  ]));
  const cards = [...html.matchAll(/<article class="v2-desk-story[\s\S]*?<\/article>/g)].map((match) => match[0]);
  assert.equal(cards.length, 3);
  assert.match(cards[0], /href="\/projects\/alba-palm-beach\//);
  assert.match(cards[1], /href="\/corridors\/north-flagler\//);
  assert.match(cards[2], /href="\/buildings\//);
});

test("publication, source, and event dates retain their separate source semantics", () => {
  const item = fixture({ publishedAt: "2026-09-18", sourcePublishedDate: "2026-08-01", eventDate: "2026-09-25" });
  const html = renderedDesk([item]);
  assert.match(html, /data-news-date="publication" datetime="2026-09-18"/);
  assert.match(html, /data-news-date="source" datetime="2026-08-01"/);
  assert.doesNotMatch(html, /2026-09-25/);
  assert.equal(presenters.newsDisplayDate(item), "2026-09-18");
});
