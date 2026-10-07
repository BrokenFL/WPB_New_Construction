import type { MarketNote } from "../data/marketNotes.ts";
import { editorialImageForId } from "../data/editorialImagery.ts";
import { escapeHtml, safeHref } from "../renderUtils.ts";
import { marketNotePath } from "./marketNoteRouting.ts";

type SpotlightImage = { src: string; alt: string };
type SpotlightDeskOptions = {
  index?: boolean;
  resolveImage?: (note: MarketNote) => SpotlightImage;
};

export function publishedDowntownSpotlights(notes: readonly MarketNote[]) {
  return notes
    .filter((note) => note.status === "published" && note.category === "Downtown Spotlight")
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

function spotlightImage(note: MarketNote): SpotlightImage {
  const editorial = editorialImageForId(note.imageId || "rosemary-square-corridor");
  return {
    src: note.image?.path || editorial?.assetPath || "",
    alt: note.image?.alt || editorial?.alt || note.title,
  };
}

function spotlightDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(parsed);
}

function renderSpotlightStory(note: MarketNote, role: "lead" | "secondary" | "archive", resolveImage: (note: MarketNote) => SpotlightImage) {
  const image = resolveImage(note);
  const href = marketNotePath(note);
  const label = note.image?.mode === "generated-editorial" ? "Editorial illustration" : "Editorial context";
  const visual = image.src ? `
    <figure class="v2-desk-visual v2-desk-visual-${role === "lead" ? "lead" : "thumbnail"}">
      <a class="v2-desk-visual-link" href="${safeHref(href)}" aria-label="Read ${escapeHtml(note.title)}">
        <picture><img src="${safeHref(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" /></picture>
      </a>
      <figcaption class="v2-desk-visual-caption">${escapeHtml(label)}</figcaption>
    </figure>` : "";
  return `
    <article class="v2-desk-story ${role === "archive" ? "v2-spotlight-archive-story" : `v2-desk-${role}`} v2-spotlight-story" data-spotlight-slug="${escapeHtml(note.slug)}">
      ${role !== "secondary" ? visual : ""}
      <div class="v2-desk-story-head">
        ${role === "secondary" ? visual : ""}
        <div class="v2-desk-copy">
          <p class="v2-desk-date">Published <time datetime="${escapeHtml(note.datePublished)}">${escapeHtml(spotlightDate(note.datePublished))}</time></p>
          <h3><a href="${safeHref(href)}">${escapeHtml(note.title)}</a></h3>
        </div>
      </div>
      <div class="v2-desk-story-detail">
        <p class="v2-desk-takeaway">${escapeHtml(role === "archive" ? note.excerpt : note.buyerTakeaway || note.excerpt)}</p>
        <div class="v2-desk-actions"><a href="${safeHref(href)}">Read Spotlight <span aria-hidden="true">↗</span></a></div>
      </div>
    </article>`;
}

export function renderDowntownSpotlightDesk(notes: readonly MarketNote[], options: SpotlightDeskOptions = {}) {
  const stories = publishedDowntownSpotlights(notes);
  if (!stories.length && !options.index) return "";
  const resolveImage = options.resolveImage || spotlightImage;
  const id = options.index ? "downtown-spotlight-title" : "home-downtown-spotlight-title";
  const tag = options.index ? "h1" : "h2";
  return `
    <section class="v2-development-desk v2-spotlight-desk${options.index ? " v2-spotlight-index" : ""}"${options.index ? "" : ' id="downtown-spotlight"'} aria-labelledby="${id}">
      <header class="v2-desk-heading">
        <div><p class="eyebrow">Downtown Spotlight${options.index ? ` · ${stories.length} stories` : ""}</p>
          <${tag} id="${id}">Downtown, in focus.</${tag}>
          <p>Restaurants, districts, and daily life, with context for your next move.</p>
        </div>
        <a href="${options.index ? "/updates/" : "/downtown-spotlight/"}">${options.index ? "Development Desk" : "All Downtown stories"} <span aria-hidden="true">↗</span></a>
      </header>
      <div class="v2-desk-grid">${stories.slice(0, 3).map((note, index) => renderSpotlightStory(note, index === 0 ? "lead" : "secondary", resolveImage)).join("")}</div>
      ${options.index && stories.length > 3 ? `
        <section class="v2-spotlight-archive" aria-labelledby="downtown-spotlight-archive-title">
          <h2 id="downtown-spotlight-archive-title">More Downtown stories</h2>
          <div class="v2-spotlight-archive-grid">${stories.slice(3).map((note) => renderSpotlightStory(note, "archive", resolveImage)).join("")}</div>
        </section>` : ""}
    </section>`;
}
