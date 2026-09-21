const form = document.querySelector("#quickPublishForm");
const statusPanel = document.querySelector("#statusPanel");
const statusTitle = document.querySelector("#statusTitle");
const statusMessage = document.querySelector("#statusMessage");
const statusOutput = document.querySelector("#statusOutput");

const imageSlots = {
  hero: { key: "hero", fileInput: "#heroFile", preview: "#heroPreview", alt: "#heroAlt", caption: "#heroCaption", credit: "#heroCredit" },
  "body-1": { key: "body-1", fileInput: "#body1File", preview: "#body1Preview", alt: "#body1Alt", caption: "#body1Caption", credit: "#body1Credit" },
  "body-2": { key: "body-2", fileInput: "#body2File", preview: "#body2Preview", alt: "#body2Alt", caption: "#body2Caption", credit: "#body2Credit" },
};
const images = Object.fromEntries(Object.keys(imageSlots).map((key) => [key, { file: null, dataUrl: "" }]));
const placements = { "body-1": null, "body-2": null };
let lastPreviewPayload = null;

function byId(id) {
  return document.querySelector(`#${id}`);
}

function value(id) {
  return byId(id)?.value?.trim() || "";
}

function setBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.originalLabel = button.textContent;
    button.textContent = label;
  } else if (button.dataset.originalLabel) {
    button.textContent = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
  }
}

function showStatus(title, message, output = null, kind = "") {
  statusPanel.hidden = false;
  statusPanel.className = `status-panel ${kind ? `status-${kind}` : ""}`.trim();
  statusTitle.textContent = title;
  statusMessage.textContent = message || "";
  statusOutput.textContent = output ? JSON.stringify(output, null, 2) : "";
  statusOutput.hidden = !output;
  statusPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function acceptImage(slotKey, file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showStatus("Image not added", "Choose a PNG, JPG, WebP, or another browser-supported image file.", null, "error");
    return;
  }
  try {
    images[slotKey] = { file, dataUrl: await fileAsDataUrl(file) };
    renderImagePreview(slotKey);
    invalidatePreview();
  } catch (error) {
    showStatus("Image not added", error.message || "The image could not be read.", null, "error");
  }
}

function renderImagePreview(slotKey) {
  const slot = imageSlots[slotKey];
  const preview = document.querySelector(slot.preview);
  const image = images[slotKey];
  if (!preview || !image.file || !image.dataUrl) {
    if (preview) preview.hidden = true;
    return;
  }
  preview.hidden = false;
  preview.innerHTML = `<img src="${image.dataUrl}" alt="" /><p>${escapeHtml(image.file.name)} · ${formatSize(image.file.size)} · ready for optimization</p>`;
}

function setupDropzones() {
  for (const [slotKey, slot] of Object.entries(imageSlots)) {
    const zone = document.querySelector(`[data-drop-zone="${slotKey}"]`);
    const input = document.querySelector(slot.fileInput);
    if (!zone || !input) continue;
    zone.addEventListener("click", () => input.click());
    zone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }
    });
    input.addEventListener("change", () => acceptImage(slotKey, input.files?.[0]));
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("dragover");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("dragover");
      acceptImage(slotKey, event.dataTransfer?.files?.[0]);
    });
  }
}

function parseBodySections() {
  const raw = value("body");
  if (!raw) return [];
  const sections = [];
  let current = { heading: "Introduction", lines: [] };
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      if (current.lines.join("\n").trim()) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });
      current = { heading: heading[1].trim(), lines: [] };
    } else {
      current.lines.push(rawLine);
    }
  }
  if (current.lines.join("\n").trim()) sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });
  return sections;
}

function defaultPlacement(slotKey, sections) {
  if (!sections.length) return 0;
  if (sections.length === 1) return 0;
  if (slotKey === "body-1") return sections.length === 2 ? 0 : 1;
  if (sections.length > 2) return 2;
  return 1;
}

function renderSectionMap() {
  const container = document.querySelector("#sectionMap");
  if (!container) return;
  const sections = parseBodySections();
  if (!sections.length) {
    container.innerHTML = `<p class="field-help">Add article body text to choose where the supporting images appear.</p>`;
    return;
  }
  const previousHeadings = {};
  for (const slotKey of Object.keys(placements)) {
    const oldIndex = placements[slotKey];
    previousHeadings[slotKey] = oldIndex !== null && sections[oldIndex] ? sections[oldIndex].heading : "";
    if (placements[slotKey] === null || !sections[placements[slotKey]]) placements[slotKey] = defaultPlacement(slotKey, sections);
  }
  const heading = `<p class="section-map-heading">Supporting image placement</p>`;
  const rows = Object.keys(placements).map((slotKey) => {
    const priorHeading = previousHeadings[slotKey];
    const preservedIndex = priorHeading ? sections.findIndex((section) => section.heading === priorHeading) : -1;
    if (preservedIndex >= 0) placements[slotKey] = preservedIndex;
    return `<label class="placement-row"><strong>${slotKey === "body-1" ? "Article image 1" : "Article image 2"}</strong><select data-placement="${slotKey}" aria-label="${slotKey === "body-1" ? "Article image 1" : "Article image 2"} section">${sections.map((section, index) => `<option value="${index}"${placements[slotKey] === index ? " selected" : ""}>After: ${escapeHtml(section.heading || `Section ${index + 1}`)}</option>`).join("")}</select></label>`;
  }).join("");
  container.innerHTML = heading + rows;
  container.querySelectorAll("[data-placement]").forEach((select) => {
    select.addEventListener("change", () => {
      placements[select.dataset.placement] = Number(select.value);
      invalidatePreview();
    });
  });
}

function buildSections() {
  const sections = parseBodySections();
  return sections.map((section, index) => {
    const result = { heading: section.heading, body: section.body };
    for (const [slotKey, placement] of Object.entries(placements)) {
      if (placement === index && images[slotKey].dataUrl) result.imageKey = slotKey;
    }
    return result;
  });
}

function validateForm() {
  const errors = [];
  const sections = parseBodySections();
  if (!value("title")) errors.push("Add a headline.");
  if (!value("deck")) errors.push("Add a deck.");
  if (!sections.length) errors.push("Add the full article body.");
  else if (sections.length < 2) errors.push("Add at least two article sections so each supporting image has a clear placement.");
  if (!value("sourceName")) errors.push("Add the source name.");
  if (!value("sourceUrl")) errors.push("Add the source URL.");
  else {
    try { new URL(value("sourceUrl")); } catch { errors.push("Source URL must be a complete URL."); }
  }
  for (const [slotKey, slot] of Object.entries(imageSlots)) {
    if (!images[slotKey].dataUrl) errors.push(`${slotKey === "hero" ? "Hero" : slotKey === "body-1" ? "Article image 1" : "Article image 2"} file is required.`);
    for (const field of ["alt", "caption", "credit"]) if (!valueFrom(slot[field])) errors.push(`${slotKey === "hero" ? "Hero" : slotKey === "body-1" ? "Article image 1" : "Article image 2"} ${field} is required.`);
  }
  if (sections.length > 1 && placements["body-1"] === placements["body-2"]) errors.push("Place the two supporting images in different article sections.");
  if (images["body-1"].file && images["body-2"].file && sameFile(images["body-1"].file, images["body-2"].file)) errors.push("The two supporting images must be distinct files.");
  return errors;
}

function valueFrom(selector) {
  return document.querySelector(selector)?.value?.trim() || "";
}

function sameFile(first, second) {
  return first.name === second.name && first.size === second.size && first.lastModified === second.lastModified;
}

async function buildPayload() {
  const errors = validateForm();
  if (errors.length) {
    showStatus("Finish the article first", errors.join(" "), { errors }, "error");
    return null;
  }
  const payload = {
    destination: value("destination") || "news",
    category: value("category") || "development",
    title: value("title"),
    deck: value("deck"),
    bodySections: buildSections(),
    sourceName: value("sourceName"),
    sourceUrl: value("sourceUrl"),
    sourcePublishedDate: value("sourcePublishedDate"),
    whyItMatters: value("buyerContext"),
    buyerContext: value("buyerContext"),
    relatedBuildings: value("relatedBuildings"),
    relatedCorridorIds: value("relatedCorridorIds"),
    newsletterHeadline: value("title"),
    commitMessage: `Publish article: ${value("title")}`,
    heroImage: imagePayload("hero"),
    bodyImages: [imagePayload("body-1"), imagePayload("body-2")],
  };
  return payload;
}

function imagePayload(slotKey) {
  const slot = imageSlots[slotKey];
  const image = images[slotKey];
  return {
    key: slot.key,
    fileName: image.file?.name || "",
    dataUrl: image.dataUrl,
    alt: valueFrom(slot.alt),
    caption: valueFrom(slot.caption),
    credit: valueFrom(slot.credit),
  };
}

function invalidatePreview() {
  lastPreviewPayload = null;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data;
  try { data = await response.json(); } catch { data = { ok: false, error: `Request failed with HTTP ${response.status}.` }; }
  return data;
}

async function runCheck() {
  const button = byId("checkButton");
  const payload = await buildPayload();
  if (!payload) return;
  setBusy(button, true, "Checking…");
  try {
    const result = await postJson("/api/article/preview", { ...payload, mode: "preview" });
    if (result.ok) {
      lastPreviewPayload = payload;
      showStatus("Editorial check passed", "The existing article publisher accepted the story and its image package. You can now preview the page or save a draft.", result.result || result, "success");
    } else showStatus("Editorial check found a problem", result.error || "Review the publisher output below.", result, "error");
  } catch (error) {
    showStatus("Editorial check failed", error.message || "Could not reach the local publisher.", null, "error");
  } finally { setBusy(button, false); }
}

async function previewInSite() {
  const button = byId("previewButton");
  const payload = await buildPayload();
  if (!payload) return;
  setBusy(button, true, "Preparing preview…");
  try {
    const result = await postJson("/api/article/site-preview", payload);
    if (result.ok && result.previewUrl) {
      lastPreviewPayload = payload;
      window.open(result.previewUrl, "_blank", "noopener");
      showStatus("Site preview ready", "The real local article renderer opened in a new tab. Review the headline, image order, captions, and mobile layout before publishing.", result, "success");
    } else showStatus("Preview failed", result.error || "The site preview could not be created.", result, "error");
  } catch (error) {
    showStatus("Preview failed", error.message || "Could not reach the local preview service.", null, "error");
  } finally { setBusy(button, false); }
}

async function saveDraft() {
  const button = byId("saveButton");
  const payload = await buildPayload();
  if (!payload) return;
  setBusy(button, true, "Saving…");
  try {
    const result = await postJson("/api/article/save-draft", payload);
    if (result.ok) showStatus("Draft saved", `Saved locally as ${result.draftId}. The draft remains in the Content Studio runtime area until you publish it.`, result, "success");
    else showStatus("Draft was not saved", result.error || "The local draft could not be saved.", result, "error");
  } catch (error) {
    showStatus("Draft was not saved", error.message || "Could not reach the local draft service.", null, "error");
  } finally { setBusy(button, false); }
}

async function publishLive() {
  if (!byId("confirmPublish").checked || !byId("confirmDeploy").checked) {
    showStatus("Confirm the release", "Check both confirmation boxes after reviewing the article and its site preview.", null, "error");
    return;
  }
  const payload = await buildPayload();
  if (!payload) return;
  const button = byId("publishButton");
  setBusy(button, true, "Publishing…");
  try {
    const result = await postJson("/api/article/publish", { ...payload, mode: "publish", triggerDeploy: true, confirmPublish: true, confirmDeploy: true });
    if (result.ok) showStatus("Publish workflow started", "The article workflow completed and the live deploy trigger was sent. Confirm the resulting live URL and image responses before sharing it.", result, "success");
    else showStatus("Publish was stopped", result.error || "The existing publisher refused this article.", result, "error");
  } catch (error) {
    showStatus("Publish was stopped", error.message || "Could not reach the local publisher.", null, "error");
  } finally { setBusy(button, false); }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

for (const id of ["title", "deck", "body", "sourceName", "sourceUrl", "sourcePublishedDate", "relatedBuildings", "relatedCorridorIds", "buyerContext", "heroAlt", "heroCaption", "heroCredit", "body1Alt", "body1Caption", "body1Credit", "body2Alt", "body2Caption", "body2Credit"]) {
  byId(id)?.addEventListener("input", () => {
    if (id === "body") renderSectionMap();
    invalidatePreview();
  });
}
byId("checkButton")?.addEventListener("click", runCheck);
byId("previewButton")?.addEventListener("click", previewInSite);
byId("saveButton")?.addEventListener("click", saveDraft);
byId("publishButton")?.addEventListener("click", publishLive);
byId("clearStatus")?.addEventListener("click", () => { statusPanel.hidden = true; });
setupDropzones();
renderSectionMap();
