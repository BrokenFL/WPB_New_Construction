import assert from "node:assert/strict";
import test from "node:test";
import { projectedArticleImageOccurrences, validateArticleImages } from "./article-content-policy.mjs";

test("editing a buyer article retains its inline image without adding a fourth mapping", () => {
  const path = "/assets/projects/banyan-tree/residence.jpg";
  assert.equal(projectedArticleImageOccurrences(path, 3, { sections: [{ image: path }] }), 3);
  assert.equal(projectedArticleImageOccurrences(path, 3, { sections: [] }), 4);
  assert.equal(projectedArticleImageOccurrences(path, 3), 4);
});

test("news edits retain hero and body images while counting new image references", () => {
  const existing = { imagePath: "/hero.jpg", bodySections: [{ image: "/inline.jpg" }] };
  assert.equal(projectedArticleImageOccurrences("/hero.jpg", 3, existing), 3);
  assert.equal(projectedArticleImageOccurrences("/inline.jpg", 3, existing), 3);
  assert.equal(projectedArticleImageOccurrences("/new.jpg", 3, existing), 4);
});

test("retaining an image does not erase an existing repetition violation", () => {
  assert.equal(projectedArticleImageOccurrences("/inline.jpg", 4, { bodyImages: [{ path: "/inline.jpg" }] }), 4);
});

function image(path, key) {
  return {
    path,
    key,
    alt: `${key} alt text`,
    caption: `${key} caption`,
    credit: "AI-generated editorial illustration",
    sizeBytes: 1000,
  };
}

test("two distinct images with an inline placement satisfy the article contract", () => {
  const hero = image("/assets/editorial/story-hero.jpg", "hero");
  const body = image("/assets/editorial/story-body-1.jpg", "inline-1");
  assert.deepEqual(validateArticleImages({
    heroImage: hero,
    bodyImages: [body],
    bodySections: [{ heading: "Context", body: "Text", image: body.path }],
  }), []);
});

test("a hero-only article fails the minimum image contract", () => {
  const findings = validateArticleImages({
    heroImage: image("/assets/editorial/story-hero.jpg", "hero"),
    bodySections: [{ heading: "Context", body: "Text" }],
  });
  assert.match(findings.join("\n"), /at least 2 final images/);
  assert.match(findings.join("\n"), /at least one body image/);
});

test("reusing the hero path for the body image fails", () => {
  const hero = image("/assets/editorial/story-hero.jpg", "hero");
  const body = image(hero.path, "inline-1");
  const findings = validateArticleImages({
    heroImage: hero,
    bodyImages: [body],
    bodySections: [{ heading: "Context", body: "Text", image: body.path }],
  });
  assert.match(findings.join("\n"), /distinct assets/);
});
