import { editorialImageForId } from "../data/editorialImagery";
import { escapeHtml, safeHref } from "../renderUtils";

type EditorialImagePanelOptions = {
  className?: string;
  hero?: boolean;
  compact?: boolean;
};

export function renderEditorialImagePanel(imageId?: string, options: EditorialImagePanelOptions = {}) {
  const image = imageId ? editorialImageForId(imageId) : undefined;
  if (!image) {
    return "";
  }

  const classes = [
    "editorial-image-panel",
    `editorial-image-panel-${image.fallbackGradient ?? "geography"}`,
    image.status === "available" ? "is-available" : "is-placeholder",
    options.hero ? "is-hero" : "",
    options.compact ? "is-compact" : "",
    options.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const loading = options.hero ? "eager" : "lazy";

  return `
    <figure class="${classes}">
      ${
        image.status === "available"
          ? `<img src="${safeHref(image.assetPath)}" alt="${escapeHtml(image.alt)}" loading="${loading}" decoding="async" />`
          : `
            <div class="editorial-placeholder" role="img" aria-label="${escapeHtml(image.alt)}">
              <span class="editorial-waterline" aria-hidden="true"></span>
              <span class="editorial-land editorial-land-west" aria-hidden="true"></span>
              <span class="editorial-land editorial-land-east" aria-hidden="true"></span>
              <span class="editorial-placeholder-label">${escapeHtml(image.title)}</span>
            </div>
          `
      }
      <figcaption>
        <span>${escapeHtml(image.caption)}</span>
        ${image.credit ? `<small>${escapeHtml(image.credit)}</small>` : ""}
      </figcaption>
    </figure>
  `;
}
