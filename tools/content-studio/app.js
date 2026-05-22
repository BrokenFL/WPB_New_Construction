let state;
let selectedFile;
let activeHomepageCard = { sectionId: "hero", cardId: "hero" };

const projectSelect = document.querySelector("#projectSelect");
const result = document.querySelector("#result");
const preview = document.querySelector("#imagePreview");

async function loadState() {
  state = await fetchJson("/api/state");
  projectSelect.innerHTML = state.projects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("");
  fillCopyForm();
  renderStatusCards();
  renderAutomation();
  renderNewsDesk();
  renderHomepageEditor();
  renderHomepageCardEditor();
  renderImagePicker();
  updateProjectPreview();
}

function activeProjectId() {
  return projectSelect.value;
}

function fillCopyForm() {
  const form = document.querySelector("#copyPanel");
  const item = state.overrides.projectCopy.projects?.[activeProjectId()] ?? {};
  for (const element of form.elements) {
    if (!element.name) continue;
    element.value = Array.isArray(item[element.name]) ? item[element.name].join("\n") : item[element.name] ?? "";
  }
}

function updateProjectPreview() {
  document.querySelector("#projectPreview").href = `http://127.0.0.1:5173/projects/${activeProjectId()}/`;
}

document.querySelector("#refresh").addEventListener("click", loadState);
document.querySelector("#runQa").addEventListener("click", () => runWorkflow("qa"));
document.querySelector("#updateSite").addEventListener("click", () => runWorkflow("update"));
projectSelect.addEventListener("change", () => {
  fillCopyForm();
  updateProjectPreview();
});

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll(".builder-shell > .panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${button.dataset.tab}Panel`));
  });
});

document.querySelectorAll(".section-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".section-tabs button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("#sitePanel .section").forEach((section) => section.classList.toggle("active", section.id === `${button.dataset.section}Section`));
  });
});

bindForm("#copyPanel", "/api/project-copy", (payload) => ({ ...payload, projectId: activeProjectId() }));
bindForm("#pageCopyPanel", "/api/page-copy", (payload) => ({ ...payload, projectId: activeProjectId() }));
bindForm("#homepagePanel", "/api/homepage-overrides");
bindHomepageCardForm();
bindForm("#captionPanel", "/api/image-caption", (payload) => ({ ...payload, projectId: activeProjectId() }));
bindForm("#updatePanel", "/api/project-update", (payload) => ({ ...payload, projectId: activeProjectId() }));
bindForm("#teamPanel", "/api/team-resource", (payload) => ({ ...payload, projectId: activeProjectId() }));

document.querySelector("#imagePanel input[type=file]").addEventListener("change", async (event) => setSelectedFile(event.target.files[0]));
document.querySelector("#dropZone").addEventListener("drop", async (event) => {
  event.preventDefault();
  await setSelectedFile(event.dataTransfer.files[0]);
});
document.querySelector("#dropZone").addEventListener("dragover", (event) => event.preventDefault());

document.querySelector("#imagePanel").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedFile) return show({ ok: false, error: "Choose an image first." });
  const payload = formPayload(event.currentTarget);
  payload.projectId = activeProjectId();
  payload.fileName = selectedFile.name;
  payload.dataUrl = await fileAsDataUrl(selectedFile);
  show(await postJson("/api/upload-image", payload));
  await loadState();
});

document.querySelectorAll("[data-workflow]").forEach((button) => {
  button.addEventListener("click", () => runWorkflow(button.dataset.workflow));
});

function renderStatusCards() {
  const cards = state.statusCards ?? {};
  document.querySelector("#statusCards").innerHTML = Object.entries(cards).map(([label, value]) => `
    <article class="status-card">
      <span>${label.replace(/[A-Z]/g, " $&").trim()}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `).join("");
}

function renderAutomation() {
  const automation = state.automation ?? {};
  const status = (label) => `<span class="status-pill status-${slug(label)}">${escapeHtml(label)}</span>`;
  document.querySelector("#automationStatus").innerHTML = `
    <dl class="automation-grid">
      <div><dt>GPT news issue import</dt><dd>${status(automation.gptIssueImport?.label || "Not run yet")} ${escapeHtml(automation.gptIssueImport?.lastImportedIssue || "No issue imported")}</dd></div>
      <div><dt>Last import time</dt><dd>${escapeHtml(automation.gptIssueImport?.lastImportTime || "Not run yet")}</dd></div>
      <div><dt>Imported draft count</dt><dd>${escapeHtml(String(automation.gptIssueImport?.importedDraftCount ?? 0))}</dd></div>
      <div><dt>News publisher last run</dt><dd>${automation.newsPublisherLastReport?.exists ? status("Healthy") : status("Not run yet")} ${escapeHtml(automation.newsPublisherLastReport?.updatedAt || "No report found")}</dd></div>
      <div><dt>Daily maintenance last run</dt><dd>${automation.dailyMaintenanceLastReport?.exists ? status("Healthy") : status("Not run yet")} ${escapeHtml(automation.dailyMaintenanceLastReport?.updatedAt || "No report found")}</dd></div>
      <div><dt>Newsletter digest</dt><dd>${automation.newsletterLastGenerated?.exists ? status("Healthy") : status("Not run yet")} ${escapeHtml(automation.newsletterLastGenerated?.updatedAt || "No digest found")}</dd></div>
      <div><dt>Last deploy result</dt><dd>${status(automation.lastDeployResult || "Not run yet")} ${escapeHtml(automation.cloudflareDeployStatus || "")}</dd></div>
      <div><dt>Next scheduled run</dt><dd>${escapeHtml(`${automation.dailyMaintenanceNextRun || ""} ${automation.newsPublisherNextRun || ""}`)}</dd></div>
      <div><dt>Loaded LaunchAgents</dt><dd>${escapeHtml((automation.loadedLaunchAgents || []).join("\n") || "None loaded")}</dd></div>
      <div><dt>GitHub auth status</dt><dd>${status(automation.githubAuth?.status?.includes("authenticated") ? "Healthy" : automation.githubAuth?.tokenFallbackAvailable ? "Warning" : "Failed")} ${escapeHtml(`${automation.githubAuth?.mode || "unknown"} / ${automation.githubAuth?.status || "not checked"}`)}</dd></div>
      <div><dt>gh path</dt><dd><code>${escapeHtml(automation.githubPath || "Not installed")}</code></dd></div>
      <div><dt>Daily maintenance agent</dt><dd>${status(automation.dailyMaintenanceInstalled ? (automation.dailyMaintenanceLoaded ? "Healthy" : "Warning") : "Not installed")}</dd></div>
      <div><dt>News publisher agent</dt><dd>${status(automation.newsPublisherInstalled ? (automation.newsPublisherLoaded ? "Healthy" : "Warning") : "Not installed")}</dd></div>
      <div><dt>Manual daily run</dt><dd><code>${escapeHtml(automation.dailyMaintenanceManualRun || "npm run daily:maintenance")}</code></dd></div>
      <div><dt>Manual publisher run</dt><dd><code>${escapeHtml(automation.newsPublisherManualRun || "npm run news:daily-publisher")}</code></dd></div>
      <div><dt>Reports</dt><dd>${(automation.reports || []).map((path) => `<code>${escapeHtml(path)}</code>`).join("<br />")}</dd></div>
    </dl>
    <pre>${escapeHtml(JSON.stringify({ scripts: automation.scripts, changeLog: state.overrides.changeLog?.entries?.slice(0, 8) ?? [] }, null, 2))}</pre>
  `;
}

function renderHomepageEditor() {
  const imageSelect = document.querySelector("#homepagePanel select[name=imagePath]");
  const sectionSelect = document.querySelector("#homepagePanel select[name=sectionId]");
  const sections = state.overrides.homepage?.sections ?? {};
  imageSelect.innerHTML = `<option value="">Choose existing image</option>${(state.availableImages ?? []).map((imagePath) => `<option value="${escapeHtml(imagePath)}">${escapeHtml(imagePath)}</option>`).join("")}`;
  const fill = () => {
    const item = sections[sectionSelect.value] ?? {};
    for (const element of document.querySelector("#homepagePanel").elements) {
      if (!element.name || element.name === "sectionId") continue;
      element.value = item[element.name] ?? "";
    }
  };
  sectionSelect.removeEventListener("change", fill);
  sectionSelect.addEventListener("change", fill);
  fill();
}

function renderHomepageCardEditor() {
  const sections = state.homepageCards ?? {};
  const overrides = state.overrides.homepageCards?.sections ?? {};
  const sectionSelect = document.querySelector("#cardSectionSelect");
  const sectionLabels = {
    hero: "Homepage Hero",
    corridors: "Corridor cards",
    updates: "Updates cards",
    guidance: "Guidance cards",
    featuredBuildings: "Featured building cards",
    cta: "CTA block",
  };
  sectionSelect.innerHTML = Object.keys(sections).map((sectionId) => `<option value="${escapeHtml(sectionId)}">${escapeHtml(sectionLabels[sectionId] || sectionId)}</option>`).join("");
  sectionSelect.value = activeHomepageCard.sectionId;
  sectionSelect.onchange = () => {
    const firstCard = (sections[sectionSelect.value] ?? [])[0];
    activeHomepageCard = { sectionId: sectionSelect.value, cardId: firstCard?.id || "" };
    renderHomepageCardEditor();
  };

  const cards = sections[activeHomepageCard.sectionId] ?? [];
  if (!cards.some((card) => card.id === activeHomepageCard.cardId) && cards[0]) activeHomepageCard.cardId = cards[0].id;
  document.querySelector("#homepageCardList").innerHTML = cards.map((card) => {
    const override = overrides[activeHomepageCard.sectionId]?.cards?.[card.id];
    return `
      <button class="${card.id === activeHomepageCard.cardId ? "active" : ""}" data-home-card="${escapeHtml(card.id)}" type="button">
        <strong>${escapeHtml(card.title)}</strong>
        <span>${escapeHtml(override?.status ? `Override: ${override.status}` : card.deck || "No override")}</span>
      </button>
    `;
  }).join("") || `<p class="muted">No cards found for this section.</p>`;
  document.querySelectorAll("[data-home-card]").forEach((button) => {
    button.onclick = () => {
      activeHomepageCard = { sectionId: sectionSelect.value, cardId: button.dataset.homeCard };
      renderHomepageCardEditor();
    };
  });

  const activeCard = cards.find((card) => card.id === activeHomepageCard.cardId) ?? {};
  const activeOverride = overrides[activeHomepageCard.sectionId]?.cards?.[activeHomepageCard.cardId] ?? {};
  const form = document.querySelector("#homepageCardPanel");
  form.elements.sectionId.value = activeHomepageCard.sectionId;
  form.elements.cardId.value = activeHomepageCard.cardId || "";
  document.querySelector("#selectedCardTitle").textContent = activeCard.title || "Choose a card";
  populateImageSelect(form.elements.imagePath, activeOverride.imagePath || activeCard.imagePath || "");
  for (const name of ["headline", "subhead", "deck", "caption", "alt", "ctaLabel", "status"]) {
    if (form.elements[name]) form.elements[name].value = activeOverride[name] ?? "";
  }
  if (!form.elements.status.value) form.elements.status.value = "draft";
  updateCardPreview();
  updateRepetitionWarning();
  form.elements.imagePath.onchange = () => {
    updateCardPreview();
    updateRepetitionWarning();
  };
  ["headline", "subhead", "deck", "caption", "alt", "ctaLabel"].forEach((name) => {
    form.elements[name].oninput = updateCardPreview;
  });
}

function bindHomepageCardForm() {
  const form = document.querySelector("#homepageCardPanel");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formPayload(form);
    payload.status = event.submitter?.dataset.cardAction === "approved" ? "approved" : "draft";
    show(await postJson("/api/homepage-card-overrides", payload));
    await loadState();
  });
  form.querySelector("[data-card-action='revert']").addEventListener("click", async () => {
    const payload = formPayload(form);
    payload.action = "revert";
    show(await postJson("/api/homepage-card-overrides", payload));
    await loadState();
  });
}

function populateImageSelect(select, selected = "") {
  const images = state.imageCatalog ?? [];
  select.innerHTML = `<option value="">Use default image</option>${images
    .filter((image) => image.status === "approved" || image.category === "Recently uploaded")
    .map((image) => `<option value="${escapeHtml(image.path)}">${escapeHtml(`${image.path} · ${image.dimensions || "size n/a"} · used ${image.usageCount}`)}</option>`)
    .join("")}`;
  select.value = selected;
}

function renderImagePicker() {
  const groups = groupBy(state.imageCatalog ?? [], "category");
  document.querySelector("#imagePicker").innerHTML = Object.entries(groups).map(([category, images]) => `
    <section class="image-picker-group">
      <h2>${escapeHtml(category)}</h2>
      <div class="image-picker-grid">
        ${images.slice(0, 60).map((image) => `
          <button data-picker-image="${escapeHtml(image.path)}" type="button" class="${image.reviewOnly ? "is-review" : ""}">
            <img src="${escapeHtml(image.path)}" alt="" loading="lazy" />
            <span>${escapeHtml(image.path)}</span>
            <small>${escapeHtml([image.association, image.dimensions, image.imageType, `used ${image.usageCount}`].filter(Boolean).join(" · "))}</small>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");
  document.querySelectorAll("[data-picker-image]").forEach((button) => {
    button.onclick = () => {
      const imagePath = button.dataset.pickerImage;
      const select = document.querySelector("#homepageCardPanel [name=imagePath]");
      select.value = imagePath;
      updateCardPreview();
      updateRepetitionWarning();
      document.querySelector("#homepageCardPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
}

function updateCardPreview() {
  const form = document.querySelector("#homepageCardPanel");
  const imagePath = form.elements.imagePath.value;
  const title = form.elements.headline.value || document.querySelector("#selectedCardTitle").textContent;
  const deck = form.elements.deck.value || form.elements.subhead.value || "Card preview";
  const cta = form.elements.ctaLabel.value || defaultCtaLabel(activeHomepageCard.sectionId);
  document.querySelector("#cardPreview").innerHTML = `
    ${imagePath ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(form.elements.alt.value || title)}" />` : `<div class="preview-placeholder">Default image</div>`}
    <div>
      <span>${escapeHtml(activeHomepageCard.sectionId)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(deck)}</p>
      <small>${escapeHtml(form.elements.caption.value || "No caption override")}</small>
      <a>${escapeHtml(cta)}</a>
    </div>
  `;
}

function updateRepetitionWarning() {
  const form = document.querySelector("#homepageCardPanel");
  const imagePath = form.elements.imagePath.value;
  const warning = repetitionWarningFor(activeHomepageCard.sectionId, activeHomepageCard.cardId, imagePath);
  const target = document.querySelector("#repetitionWarning");
  target.hidden = !warning;
  target.textContent = warning;
}

function repetitionWarningFor(sectionId, cardId, imagePath) {
  if (!imagePath) return "";
  const sections = ["hero", "corridors", "updates", "guidance", "featuredBuildings", "cta"];
  const cards = sections.flatMap((section) => (state.homepageCards?.[section] ?? []).map((card) => ({
    section,
    cardId: card.id,
    imagePath: state.overrides.homepageCards?.sections?.[section]?.cards?.[card.id]?.imagePath || card.imagePath || "",
  })));
  const index = cards.findIndex((card) => card.section === sectionId && card.cardId === cardId);
  const nearby = [cards[index - 1], cards[index + 1]].filter(Boolean);
  const project = projectFromImage(imagePath);
  const repeatedNearby = nearby.some((card) => card.imagePath === imagePath || (project && projectFromImage(card.imagePath) === project));
  const generic = /wpb-geography-map-hero|flagler-waterfront-corridor|rosemary-square-corridor|south-flagler-corridor/.test(imagePath);
  const usage = state.imageCatalog?.find((image) => image.path === imagePath)?.usageCount ?? 0;
  const olaraNearby = project === "olara" && nearby.some((card) => projectFromImage(card.imagePath) === "olara");
  if (repeatedNearby || olaraNearby || (generic && usage >= 3)) {
    return "This image is already used nearby. Choose a different visual to keep the homepage from feeling repetitive.";
  }
  return "";
}

function defaultCtaLabel(sectionId) {
  if (sectionId === "updates") return "Read Update";
  if (sectionId === "guidance") return "Read Guidance";
  if (sectionId === "corridors") return "View Corridor";
  if (sectionId === "featuredBuildings") return "View Project";
  return "Contact Brooke";
}

function projectFromImage(imagePath = "") {
  return imagePath.match(/^\/projects\/([^/]+)\//)?.[1] || "";
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "Other";
    groups[group] = groups[group] ?? [];
    groups[group].push(item);
    return groups;
  }, {});
}

function renderNewsDesk() {
  const items = state.news?.items ?? [];
  renderLane("#laneDraft", items.filter((item) => ["draft", "scheduled"].includes(item.status)));
  renderLane("#laneQueued", items.filter((item) => item.status === "queued"));
  renderLane("#laneReview", items.filter((item) => item.status === "needs_review" || item.riskLevel === "high"));
  renderLane("#lanePublished", items.filter((item) => item.status === "published"));
  renderNewsletterDrafts();
}

function renderLane(selector, items) {
  document.querySelector(selector).innerHTML = items.length ? items.map(newsCard).join("") : `<p class="muted">No items.</p>`;
  document.querySelectorAll(`${selector} [data-news-edit]`).forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = formPayload(event.currentTarget);
      const action = event.submitter?.dataset.newsAction || "draft";
      payload.id = event.currentTarget.closest("[data-news-id]").dataset.newsId;
      payload.status = action;
      payload.sendToNewsletter = action === "newsletter";
      if (action === "newsletter") payload.status = "queued";
      show(await postJson("/api/news-draft", payload));
      await loadState();
    });
  });
}

function renderNewsletterDrafts() {
  const items = state.newsletter?.items ?? [];
  document.querySelector("#newsletterDrafts").innerHTML = items.length ? items.map((item) => `
    <article class="news-card">
      <div class="news-card-head"><strong>${escapeHtml(item.subject)}</strong><span>${escapeHtml(item.status)}</span></div>
      <p>${escapeHtml(item.intro)}</p>
      <p class="muted">${(item.storyBlurbs ?? []).length} story blurbs · ${escapeHtml(item.updatedAt || item.createdAt || "")}</p>
    </article>
  `).join("") : `<p class="muted">No items.</p>`;
}

function newsCard(item) {
  const bodySectionsText = (item.bodySections ?? []).map((section) => `${section.heading || ""}\n${section.body || ""}`.trim()).join("\n\n");
  const canQuickPublish = item.riskLevel !== "high";
  return `
    <article class="news-card" data-news-id="${escapeHtml(item.id)}">
      <div class="news-card-head">
        <strong>${escapeHtml(item.rewrittenHeadline)}</strong>
        <span>${escapeHtml(item.riskLevel)} / ${escapeHtml(item.status)} / ${escapeHtml(item.publishMode || "manual")}</span>
      </div>
      <p>${escapeHtml(item.deck)}</p>
      <dl class="news-meta">
        <div><dt>Source</dt><dd>${escapeHtml(item.sourceName)} · <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">source</a></dd></div>
        <div><dt>Projects</dt><dd>${escapeHtml((item.relatedProjectIds ?? []).join(", ") || "none")}</dd></div>
        <div><dt>Corridors</dt><dd>${escapeHtml((item.relatedCorridorIds ?? []).join(", ") || "none")}</dd></div>
        <div><dt>Image</dt><dd>${escapeHtml(item.suggestedImagePath || "assign before publishing")}</dd></div>
        <div><dt>Image note</dt><dd>${escapeHtml(item.imageResolutionReason || "")}</dd></div>
        <div><dt>CTA</dt><dd>${escapeHtml(item.cta || "Compare related projects")}</dd></div>
        <div><dt>Newsletter</dt><dd>${escapeHtml(item.newsletterStatus || "not sent")}</dd></div>
      </dl>
      <form class="news-edit-form" data-news-edit>
        <div class="grid">
          <label>Edit headline<input name="rewrittenHeadline" value="${escapeHtml(item.rewrittenHeadline)}" /></label>
          <label>Edit source name<input name="sourceName" value="${escapeHtml(item.sourceName)}" /></label>
          <label>Edit source link<input name="sourceUrl" type="url" value="${escapeHtml(item.sourceUrl)}" /></label>
          <label>Change image<input name="suggestedImagePath" value="${escapeHtml(item.suggestedImagePath || "")}" /></label>
          <label>Schedule<input name="scheduledAt" type="datetime-local" value="${escapeHtml(datetimeLocal(item.scheduledAt))}" /></label>
          <label>Edit CTA<input name="cta" value="${escapeHtml(item.cta || "")}" /></label>
        </div>
        <label>Edit deck<textarea name="deck">${escapeHtml(item.deck)}</textarea></label>
        <label>Edit story body<textarea name="bodySectionsText">${escapeHtml(bodySectionsText)}</textarea></label>
        <label>Edit Brooke take<textarea name="buyerTakeaway">${escapeHtml(item.buyerTakeaway || "")}</textarea></label>
        <label>Edit newsletter blurb<textarea name="newsletterBlurb">${escapeHtml(item.newsletterBlurb || "")}</textarea></label>
        <label>Image explanation<textarea name="imageResolutionReason">${escapeHtml(item.imageResolutionReason || "")}</textarea></label>
        <div class="card-actions">
          <button data-news-action="draft" type="submit">Save Draft</button>
          <button data-news-action="queued" type="submit"${canQuickPublish ? "" : " disabled"}>Approve</button>
          <button data-news-action="blocked" type="submit">Block</button>
          <button data-news-action="published" type="submit"${canQuickPublish ? "" : " disabled"}>Publish Now</button>
          <button data-news-action="scheduled" type="submit"${canQuickPublish ? "" : " disabled"}>Schedule</button>
          <button data-news-action="newsletter" type="submit"${canQuickPublish ? "" : " disabled"}>Send to Newsletter Draft</button>
        </div>
      </form>
      ${canQuickPublish ? "" : `<p class="risk-note">High-risk drafts cannot quick-publish. Edit, verify, and lower risk only after manual review.</p>`}
    </article>
  `;
}

function bindForm(selector, url, prepare = (payload) => payload) {
  document.querySelector(selector).addEventListener("submit", async (event) => {
    event.preventDefault();
    show(await postJson(url, prepare(formPayload(event.currentTarget))));
    await loadState();
  });
}

async function runWorkflow(workflow) {
  show({ ok: true, running: workflow });
  show(await postJson("/api/run-workflow", { workflow }));
  await loadState();
}

async function setSelectedFile(file) {
  selectedFile = file;
  if (!selectedFile) return;
  preview.src = await fileAsDataUrl(selectedFile);
  preview.hidden = false;
}

function formPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function show(payload) {
  result.textContent = JSON.stringify(payload, null, 2);
}

function datetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function slug(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

loadState().catch(show);
