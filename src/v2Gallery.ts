import "./v2Gallery.css";

const gallerySelector = ".berkeley-image-row";
const triggerSelector = "[data-v2-gallery-trigger]";

type GalleryItem = {
  trigger: HTMLButtonElement;
  image: HTMLImageElement;
  caption: string;
};

type GalleryDialog = {
  dialog: HTMLDialogElement;
  image: HTMLImageElement;
  caption: HTMLElement;
  counter: HTMLElement;
  title: HTMLElement;
  closeButton: HTMLButtonElement;
  previousButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
};

let installed = false;
let dialogParts: GalleryDialog | null = null;
let activeItems: GalleryItem[] = [];
let activeIndex = 0;
let activeTrigger: HTMLButtonElement | null = null;

function itemCaption(figure: HTMLElement, image: HTMLImageElement) {
  return figure.querySelector("figcaption")?.textContent?.trim()
    || image.getAttribute("alt")?.trim()
    || "Project image";
}

function enhanceFigure(figure: HTMLElement) {
  const image = figure.querySelector<HTMLImageElement>("img");
  if (!image || image.closest(triggerSelector)) return;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "v2-gallery-trigger";
  trigger.dataset.v2GalleryTrigger = "true";
  trigger.setAttribute("aria-label", `Open ${itemCaption(figure, image)} in the image viewer`);
  image.before(trigger);
  trigger.append(image);
}

function enhanceGalleries(scope: ParentNode) {
  const galleries: Element[] = [];
  if (scope instanceof Element && scope.matches(gallerySelector)) galleries.push(scope);
  galleries.push(...Array.from(scope.querySelectorAll(gallerySelector)));

  galleries.forEach((gallery) => {
    gallery.querySelectorAll<HTMLElement>("figure").forEach(enhanceFigure);
  });
}

function galleryItems(trigger: HTMLButtonElement): GalleryItem[] {
  const gallery = trigger.closest(gallerySelector);
  if (!gallery) return [];

  return Array.from(gallery.querySelectorAll<HTMLButtonElement>(triggerSelector)).flatMap((itemTrigger) => {
    const image = itemTrigger.querySelector<HTMLImageElement>("img");
    const figure = itemTrigger.closest<HTMLElement>("figure");
    if (!image || !figure) return [];
    return [{ trigger: itemTrigger, image, caption: itemCaption(figure, image) }];
  });
}

function createDialog(): GalleryDialog {
  const dialog = document.createElement("dialog");
  dialog.className = "v2-gallery-dialog";
  dialog.setAttribute("aria-labelledby", "v2-gallery-title");
  dialog.setAttribute("aria-describedby", "v2-gallery-caption");
  dialog.innerHTML = `
    <div class="v2-gallery-shell">
      <header class="v2-gallery-header">
        <div>
          <p class="v2-gallery-eyebrow">Project gallery</p>
          <h2 id="v2-gallery-title">Image viewer</h2>
        </div>
        <p class="v2-gallery-counter" aria-live="polite"></p>
        <button class="v2-gallery-close" type="button" data-v2-gallery-action="close" aria-label="Close image viewer">
          <span aria-hidden="true">Close</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" /></svg>
        </button>
      </header>
      <div class="v2-gallery-stage">
        <button class="v2-gallery-nav v2-gallery-previous" type="button" data-v2-gallery-action="previous" aria-label="Show previous image">
          <span aria-hidden="true">←</span>
        </button>
        <figure class="v2-gallery-figure">
          <div class="v2-gallery-image-frame"><img alt="" decoding="async" /></div>
          <figcaption id="v2-gallery-caption" aria-live="polite"></figcaption>
        </figure>
        <button class="v2-gallery-nav v2-gallery-next" type="button" data-v2-gallery-action="next" aria-label="Show next image">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  `;
  document.body.append(dialog);

  const image = dialog.querySelector<HTMLImageElement>(".v2-gallery-figure img");
  const caption = dialog.querySelector<HTMLElement>("#v2-gallery-caption");
  const counter = dialog.querySelector<HTMLElement>(".v2-gallery-counter");
  const title = dialog.querySelector<HTMLElement>("#v2-gallery-title");
  const closeButton = dialog.querySelector<HTMLButtonElement>("[data-v2-gallery-action='close']");
  const previousButton = dialog.querySelector<HTMLButtonElement>("[data-v2-gallery-action='previous']");
  const nextButton = dialog.querySelector<HTMLButtonElement>("[data-v2-gallery-action='next']");

  if (!image || !caption || !counter || !title || !closeButton || !previousButton || !nextButton) {
    dialog.remove();
    throw new Error("Unable to initialize the project gallery viewer");
  }

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("has-v2-gallery");
    const trigger = activeTrigger;
    activeItems = [];
    activeTrigger = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  });

  return { dialog, image, caption, counter, title, closeButton, previousButton, nextButton };
}

function getDialog() {
  dialogParts ??= createDialog();
  return dialogParts;
}

function updateDialog(index: number) {
  const parts = getDialog();
  const itemCount = activeItems.length;
  if (!itemCount) return;

  activeIndex = (index + itemCount) % itemCount;
  const item = activeItems[activeIndex];
  const gallery = item.trigger.closest<HTMLElement>(gallerySelector);
  const section = gallery?.closest<HTMLElement>("[aria-label]");
  const source = item.image.currentSrc || item.image.src;

  parts.image.src = source;
  parts.image.alt = item.image.alt || item.caption;
  parts.caption.textContent = item.caption;
  parts.counter.textContent = `${activeIndex + 1} / ${itemCount}`;
  parts.title.textContent = section?.getAttribute("aria-label") || "Project image gallery";
  parts.previousButton.disabled = itemCount < 2;
  parts.nextButton.disabled = itemCount < 2;

  if (itemCount > 1) {
    const previousCaption = activeItems[(activeIndex - 1 + itemCount) % itemCount].caption;
    const nextCaption = activeItems[(activeIndex + 1) % itemCount].caption;
    parts.previousButton.setAttribute("aria-label", `Show previous image: ${previousCaption}`);
    parts.nextButton.setAttribute("aria-label", `Show next image: ${nextCaption}`);
  }
}

function openGallery(trigger: HTMLButtonElement) {
  const items = galleryItems(trigger);
  const index = items.findIndex((item) => item.trigger === trigger);
  if (!items.length || index < 0) return;

  activeItems = items;
  activeTrigger = trigger;
  updateDialog(index);
  const parts = getDialog();
  if (!parts.dialog.open) parts.dialog.showModal();
  document.body.classList.add("has-v2-gallery");
  parts.closeButton.focus({ preventScroll: true });
}

function move(step: number) {
  if (activeItems.length < 2) return;
  updateDialog(activeIndex + step);
}

function handleClick(event: MouseEvent) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const trigger = target.closest<HTMLButtonElement>(triggerSelector);
  if (trigger) {
    event.preventDefault();
    openGallery(trigger);
    return;
  }

  const action = target.closest<HTMLElement>("[data-v2-gallery-action]")?.dataset.v2GalleryAction;
  if (!action || !dialogParts?.dialog.open) return;
  if (action === "close") dialogParts.dialog.close();
  if (action === "previous") move(-1);
  if (action === "next") move(1);
}

function handleKeydown(event: KeyboardEvent) {
  if (!dialogParts?.dialog.open) return;
  if (event.key === "Tab") {
    const controls = Array.from(dialogParts.dialog.querySelectorAll<HTMLElement>("button:not(:disabled)"));
    const first = controls.at(0);
    const last = controls.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!dialogParts.dialog.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    move(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    move(1);
  }
}

export function installV2Gallery(root: ParentNode = document) {
  enhanceGalleries(root);
  if (installed) return;
  installed = true;

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);

  const observerRoot = root instanceof Document ? root.documentElement : root;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element && !node.closest("[data-hero-google-map]")) enhanceGalleries(node);
      });
    });
  });
  observer.observe(observerRoot, { childList: true, subtree: true });
}
