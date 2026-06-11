let state;
let selectedFile;
let activeHomepageCard = { sectionId: "hero", cardId: "hero" };
let activeReportPath = "";
let activeReportText = "";
let activeBuilderSection = "homepage";
let activePreviewDevice = "desktop";
let activeVisualMode = "edit";
let activeVisualPage = "homepage";

const projectSelect = document.querySelector("#projectSelect");
const result = document.querySelector("#result");
const preview = document.querySelector("#imagePreview");
const publicSiteBaseUrl = "https://www.wpbnewconstruction.com";
const placeholderImageSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%23eef1ef'/%3E%3Cpath d='M140 420h620L570 230 430 360l-80-90z' fill='%23c8d4d2'/%3E%3Ccircle cx='300' cy='210' r='52' fill='%23d8e0df'/%3E%3Ctext x='450' y='520' text-anchor='middle' font-family='Arial,sans-serif' font-size='28' fill='%23617073'%3EImage preview%3C/text%3E%3C/svg%3E";
const homepageSectionLabels = {
  hero: "Hero",
  map: "Map",
  corridors: "Corridors",
  updates: "Updates",
  guidance: "Guidance",
  featuredBuildings: "Featured Buildings",
  cta: "CTA",
};
const uploadTargetBySection = {
  hero: "editorial",
  map: "editorial",
  corridors: "editorial",
  updates: "update",
  guidance: "marketNote",
  featuredBuildings: "projectCard",
  cta: "editorial",
};

async function loadState() {
  state = await fetchJson("/api/state");
  projectSelect.innerHTML = state.projects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("");
  fillCopyForm();
  renderTopStatus();
  renderStatusCards();
  renderAutomation();
  renderRemoteMode();
  renderReports();
  renderNewsDesk();
  renderHomepageEditor();
  renderHomepageCardEditor();
  renderImagePicker();
  updateProjectPreview();
  renderProjectPageContext();
  updateBuilderContext();
}

function activeProjectId() {
  return projectSelect.value;
}

function goTo(tab, section) {
  const tabButton = document.querySelector(`[data-tab="${tab}"]`);
  if (tabButton) tabButton.click();
  if (section) {
    const sectionButton = document.querySelector(`[data-section="${section}"]`);
    if (sectionButton) sectionButton.click();
  }
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
  const href = previewUrlFor("project", activeProjectId());
  document.querySelector("#projectPreview").href = href;
  document.querySelector("#projectLivePreview").href = href;
}

document.querySelector("#refresh").addEventListener("click", loadState);
document.querySelector("#runQa").addEventListener("click", () => runWorkflow("qa"));
document.querySelector("#updateSite").addEventListener("click", () => runWorkflow("update"));
// Article Manager is initialized after DOM setup below
projectSelect.addEventListener("change", () => {
  fillCopyForm();
  updateProjectPreview();
  renderProjectPageContext();
});

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    activeBuilderSection = button.dataset.section || button.dataset.tab || activeBuilderSection;
    document.querySelectorAll(".tabs button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll(".builder-shell > .panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${button.dataset.tab}Panel`));
    if (button.dataset.section) {
      document.querySelectorAll(".section-tabs button").forEach((item) => item.classList.toggle("active", item.dataset.section === button.dataset.section));
      document.querySelectorAll("#sitePanel .section").forEach((section) => section.classList.toggle("active", section.id === `${button.dataset.section}Section`));
    }
    updateBuilderContext();
  });
});

document.querySelectorAll(".section-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    activeBuilderSection = button.dataset.section || activeBuilderSection;
    document.querySelectorAll(".section-tabs button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("#sitePanel .section").forEach((section) => section.classList.toggle("active", section.id === `${button.dataset.section}Section`));
    updateBuilderContext();
  });
});

document.querySelectorAll("[data-go-tab]").forEach((button) => {
  button.addEventListener("click", () => goTo(button.dataset.goTab, button.dataset.goSection));
});

if (window.location.hash === "#article") {
  window.setTimeout(() => goTo("article"), 0);
}

document.querySelector("#editModeButton")?.addEventListener("click", () => setVisualMode("edit"));
document.querySelector("#previewModeButton")?.addEventListener("click", () => setVisualMode("preview"));
document.querySelector("#visualPageSelect")?.addEventListener("change", (event) => {
  activeVisualPage = event.target.value;
  renderLivePagePreview();
});
document.querySelector("#selectedDropZone")?.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.currentTarget.classList.add("is-drop-target");
});
document.querySelector("#selectedDropZone")?.addEventListener("dragleave", (event) => {
  event.currentTarget.classList.remove("is-drop-target");
});
document.querySelector("#selectedDropZone")?.addEventListener("drop", async (event) => {
  event.preventDefault();
  event.currentTarget.classList.remove("is-drop-target");
  await handleVisualImageDrop(event.dataTransfer.files[0], activeHomepageCard.sectionId, activeHomepageCard.cardId);
});
document.querySelector("#visualDropFile")?.addEventListener("change", async (event) => {
  await handleVisualImageDrop(event.target.files[0], activeHomepageCard.sectionId, activeHomepageCard.cardId);
  event.target.value = "";
});
document.querySelectorAll("[data-page-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    activeVisualPage = button.dataset.pageChoice || "homepage";
    const select = document.querySelector("#visualPageSelect");
    if (select) select.value = activeVisualPage;
    goTo("site", "homepage");
    renderLivePagePreview();
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

function renderTopStatus() {
  const cards = state.statusCards ?? {};
  document.querySelector("#topStatus").innerHTML = `
    <span>${escapeHtml(state.remote?.isRemote ? "Remote" : "Local")}</span>
    <span>${escapeHtml(cards.gitBranch || "branch unknown")}</span>
    <span>${escapeHtml((cards.workingTreeStatus || "clean") === "clean" ? "Clean" : "Dirty")}</span>
    <span>${escapeHtml(cards.lastDeployResult || "Deploy n/a")}</span>
  `;
  document.querySelector("#builderWarning").textContent = state.warning || "";
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
      <div><dt>Latest reports</dt><dd>${(automation.reports || []).map((path) => `<button data-report-shortcut="${escapeHtml(path)}" type="button">${escapeHtml(fileName(path))}</button>`).join("")}</dd></div>
    </dl>
    <pre>${escapeHtml(JSON.stringify({ scripts: automation.scripts, changeLog: state.overrides.changeLog?.entries?.slice(0, 8) ?? [] }, null, 2))}</pre>
  `;
  document.querySelectorAll("[data-report-shortcut]").forEach((button) => {
    button.onclick = async () => {
      document.querySelector("[data-tab='reports']").click();
      await loadReport(button.dataset.reportShortcut);
    };
  });
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
  sectionSelect.innerHTML = Object.keys(sections).map((sectionId) => `<option value="${escapeHtml(sectionId)}">${escapeHtml(homepageSectionLabels[sectionId] || sectionId)}</option>`).join("");
  sectionSelect.value = activeHomepageCard.sectionId;
  sectionSelect.onchange = () => {
    const firstCard = (sections[sectionSelect.value] ?? [])[0];
    activeHomepageCard = { sectionId: sectionSelect.value, cardId: firstCard?.id || "" };
    renderHomepageCardEditor();
  };

  const cards = sections[activeHomepageCard.sectionId] ?? [];
  if (!cards.some((card) => card.id === activeHomepageCard.cardId) && cards[0]) activeHomepageCard.cardId = cards[0].id;
  renderHomepageTree(sections, overrides);
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
  document.querySelector("#editingBreadcrumb").textContent = editingBreadcrumb(activeHomepageCard.sectionId, activeCard, activeHomepageCard.cardId);
  document.querySelector("#selectedCardContext").textContent = `Homepage ${homepageSectionLabels[activeHomepageCard.sectionId] || activeHomepageCard.sectionId} card only`;
  document.querySelector("#previewHomepage").href = previewUrlFor("homepage");
  populateImageSelect(form.elements.imagePath, activeOverride.imagePath || activeCard.imagePath || "");
  for (const name of ["headline", "subhead", "deck", "caption", "alt", "ctaLabel", "status"]) {
    if (form.elements[name]) form.elements[name].value = activeOverride[name] ?? "";
  }
  form.elements.objectFit.value = activeOverride.objectFit || "cover";
  form.elements.imagePosition.value = activeOverride.imagePosition || "center center";
  form.elements.focalPointX.value = activeOverride.focalPoint?.x ?? focalFromPosition(form.elements.imagePosition.value).x;
  form.elements.focalPointY.value = activeOverride.focalPoint?.y ?? focalFromPosition(form.elements.imagePosition.value).y;
  form.elements.allowRepeatedImage.checked = Boolean(activeOverride.allowRepeatedImage);
  form.elements.repetitionApprovalReason.value = activeOverride.repetitionApprovalReason || "";
  if (!form.elements.status.value) form.elements.status.value = "draft";
  updateCardPreview();
  renderLivePagePreview();
  updateBuilderContext();
  updateRepetitionWarning();
  form.elements.imagePath.onchange = () => {
    updateCardPreview();
    renderLivePagePreview();
    updateRepetitionWarning();
  };
  ["headline", "subhead", "deck", "caption", "alt", "ctaLabel"].forEach((name) => {
    form.elements[name].oninput = () => {
      updateCardPreview();
      renderLivePagePreview();
    };
  });
  ["focalPointX", "focalPointY", "objectFit"].forEach((name) => {
    form.elements[name].oninput = () => {
      form.elements.imagePosition.value = `${form.elements.focalPointX.value}% ${form.elements.focalPointY.value}%`;
      updateCardPreview();
      renderLivePagePreview();
    };
  });
}

function renderHomepageTree(sections, overrides) {
  const ordered = ["hero", "map", "corridors", "updates", "guidance", "featuredBuildings", "cta"].filter((sectionId) => sections[sectionId]);
  document.querySelector("#homepageTree").innerHTML = `
    <button class="tree-root" data-tree-section="hero" data-tree-card="hero" type="button">Homepage</button>
    ${ordered.map((sectionId) => {
      const cards = sections[sectionId] ?? [];
      return `
        <div class="tree-section">
          <button class="${activeHomepageCard.sectionId === sectionId ? "active" : ""}" data-tree-section="${escapeHtml(sectionId)}" data-tree-card="${escapeHtml(cards[0]?.id || "")}" type="button">
            ${escapeHtml(homepageSectionLabels[sectionId] || sectionId)}
          </button>
          <div>
            ${cards.map((card, index) => {
              const hasOverride = Boolean(overrides[sectionId]?.cards?.[card.id]);
              const label = sectionId === "updates" ? `Update card ${index + 1}` : sectionId === "guidance" ? `Guidance card ${index + 1}` : card.title;
              return `
                <button class="${activeHomepageCard.sectionId === sectionId && activeHomepageCard.cardId === card.id ? "active" : ""}" data-tree-section="${escapeHtml(sectionId)}" data-tree-card="${escapeHtml(card.id)}" type="button">
                  <span>${escapeHtml(label)}</span>
                  ${hasOverride ? "<small>draft</small>" : ""}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("")}
  `;
  document.querySelectorAll("[data-tree-section]").forEach((button) => {
    button.onclick = () => {
      activeHomepageCard = { sectionId: button.dataset.treeSection, cardId: button.dataset.treeCard };
      renderHomepageCardEditor();
    };
  });
}

function editingBreadcrumb(sectionId, card, cardId) {
  const section = homepageSectionLabels[sectionId] || sectionId || "Section";
  const cardLabel = card?.title || cardId || "Card";
  const numbered = sectionId === "updates"
    ? cardNumberLabel("Update card", sectionId, cardId)
    : sectionId === "guidance"
      ? cardNumberLabel("Guidance card", sectionId, cardId)
      : cardLabel;
  return `Editing: Homepage -> ${section} -> ${numbered}`;
}

function cardNumberLabel(prefix, sectionId, cardId) {
  const cards = state.homepageCards?.[sectionId] ?? [];
  const index = cards.findIndex((card) => card.id === cardId);
  return index >= 0 ? `${prefix} ${index + 1}` : prefix;
}

function bindHomepageCardForm() {
  const form = document.querySelector("#homepageCardPanel");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formPayload(form);
    payload.allowRepeatedImage = form.elements.allowRepeatedImage.checked;
    payload.status = event.submitter?.dataset.cardAction === "approved" ? "approved" : "draft";
    if (payload.allowRepeatedImage && !payload.repetitionApprovalReason.trim()) {
      show({ ok: false, error: "Intentional repeated image approval requires a reason." });
      return;
    }
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

function setVisualMode(mode) {
  activeVisualMode = mode === "preview" ? "preview" : "edit";
  document.querySelector("#editModeButton")?.classList.toggle("active", activeVisualMode === "edit");
  document.querySelector("#previewModeButton")?.classList.toggle("active", activeVisualMode === "preview");
  renderLivePagePreview();
}

document.querySelectorAll("[data-position-preset]").forEach((button) => {
  button.addEventListener("click", () => setImagePosition(button.dataset.positionPreset));
});

document.querySelectorAll("[data-preview-mode]").forEach((button) => {
  button.addEventListener("click", () => setPreviewMode(button.dataset.previewMode));
});

document.querySelector("#resetCrop").addEventListener("click", () => setImagePosition("center center"));

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
  const markup = Object.entries(groups).map(([category, images]) => `
    <section class="image-picker-group">
      <h2>${escapeHtml(category)}</h2>
      <div class="image-picker-grid">
        ${images.slice(0, 60).map((image) => `
          <button data-picker-image="${escapeHtml(image.path)}" type="button" class="${image.reviewOnly ? "is-review" : ""}">
            ${builderImage(image.path, "", {})}
            <span>${escapeHtml(image.path)}</span>
            <small>${escapeHtml([image.association, image.dimensions, image.imageType, `used ${image.usageCount}`].filter(Boolean).join(" · "))}</small>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");
  document.querySelectorAll("[data-image-picker-grid]").forEach((target) => {
    target.innerHTML = markup;
  });
  document.querySelectorAll("[data-picker-image]").forEach((button) => {
    button.onclick = () => {
      const imagePath = button.dataset.pickerImage;
      const select = document.querySelector("#homepageCardPanel [name=imagePath]");
      select.value = imagePath;
      updateCardPreview();
      renderLivePagePreview();
      updateRepetitionWarning();
      document.querySelector("#homepageCardPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
}

function updateCardPreview() {
  const form = document.querySelector("#homepageCardPanel");
  const activeCard = (state.homepageCards?.[activeHomepageCard.sectionId] ?? []).find((card) => card.id === activeHomepageCard.cardId) ?? {};
  const activeOverride = state.overrides.homepageCards?.sections?.[activeHomepageCard.sectionId]?.cards?.[activeHomepageCard.cardId] ?? {};
  const imagePath = form.elements.imagePath.value || activeOverride.imagePath || activeCard.imagePath || "";
  const imagePosition = form.elements.imagePosition.value || "center center";
  const objectFit = form.elements.objectFit.value || "cover";
  const title = form.elements.headline.value || activeOverride.headline || activeCard.title || document.querySelector("#selectedCardTitle").textContent;
  const deck = form.elements.deck.value || form.elements.subhead.value || activeOverride.deck || activeCard.deck || "Card preview";
  const cta = form.elements.ctaLabel.value || defaultCtaLabel(activeHomepageCard.sectionId);
  const published = {
    imagePath: activeCard.imagePath || "",
    headline: activeCard.title || "Current published",
    deck: activeCard.deck || "Published fallback",
    ctaLabel: defaultCtaLabel(activeHomepageCard.sectionId),
  };
  const draft = { imagePath, headline: title, deck, ctaLabel: cta };
  const approved = activeOverride.status === "approved" ? activeOverride : null;
  document.querySelector("#currentPublishedPanel").innerHTML = editorSnapshot("Current published", published, "published");
  document.querySelector("#draftOverridePanel").innerHTML = editorSnapshot("Draft override", { ...draft, caption: form.elements.caption.value, alt: form.elements.alt.value, status: form.elements.status.value }, "draft");
  document.querySelector("#cardPreview").innerHTML = `
    ${previewVariant("Current published", published, "desktop preview-desktop", "center center", "cover")}
    ${previewVariant("Draft override", draft, "desktop preview-desktop", imagePosition, objectFit)}
    ${previewVariant("Draft mobile crop", draft, "mobile preview-mobile", imagePosition, objectFit)}
    ${previewVariant("Approved override", approved, "desktop preview-desktop", approved?.imagePosition || "center center", approved?.objectFit || "cover")}
  `;
  setPreviewMode(document.querySelector("[data-preview-mode].active")?.dataset.previewMode || "desktop");
}

function previewVariant(label, item, size, imagePosition, objectFit) {
  if (!item) return `<article class="card-preview ${size}"><span>${escapeHtml(label)}</span><div class="preview-placeholder">No approved override</div></article>`;
  const image = item.imagePath
    ? builderImage(item.imagePath, "", { style: `object-position:${imagePosition};object-fit:${objectFit}` })
    : `<div class="preview-placeholder">Default image</div>`;
  return `
    <article class="card-preview ${size}">
      <span>${escapeHtml(label)}</span>
      ${image}
      <strong>${escapeHtml(item.headline || "Card headline")}</strong>
      <p>${escapeHtml(item.deck || item.subhead || "Card deck")}</p>
      <small>${escapeHtml(item.caption || "No caption override")}</small>
      <a>${escapeHtml(item.ctaLabel || defaultCtaLabel(activeHomepageCard.sectionId))}</a>
    </article>
  `;
}

function editorSnapshot(label, item, status) {
  return `
    <article class="editor-snapshot">
      <span>${escapeHtml(label)}</span>
      ${item.imagePath ? builderImage(item.imagePath, item.alt || "", {}) : `<div class="preview-placeholder">Default image</div>`}
      <strong>${escapeHtml(item.headline || "No headline")}</strong>
      <p>${escapeHtml(item.deck || item.subhead || "No deck")}</p>
      <small>${escapeHtml(item.caption || item.ctaLabel || "")}</small>
      <em>${escapeHtml(status)}</em>
    </article>
  `;
}

function setPreviewMode(mode) {
  const normalized = mode === "mobile" ? "mobile" : "desktop";
  document.querySelectorAll("[data-preview-mode]").forEach((button) => button.classList.toggle("active", button.dataset.previewMode === normalized));
  document.querySelector("#cardPreview")?.classList.toggle("show-mobile-preview", normalized === "mobile");
}

document.querySelectorAll("[data-device-preview]").forEach((button) => {
  button.addEventListener("click", () => {
    activePreviewDevice = button.dataset.devicePreview || "desktop";
    document.querySelectorAll("[data-device-preview]").forEach((item) => item.classList.toggle("active", item === button));
    renderLivePagePreview();
  });
});

function renderLivePagePreview() {
  if (!state?.homepageCards) return;
  const previewRoot = document.querySelector("#pagePreview");
  if (!previewRoot) return;
  const notice = document.querySelector("#visualPageNotice");
  if (notice) notice.hidden = activeVisualPage === "homepage";
  previewRoot.className = `page-preview-shell visual-page-preview device-${activePreviewDevice} mode-${activeVisualMode}`;
  if (activeVisualPage !== "homepage") {
    previewRoot.innerHTML = comingNextPreview(activeVisualPage);
    return;
  }
  previewRoot.innerHTML = `<div class="site-preview-frame">${sitePreviewMarkup()}</div>`;
  previewRoot.querySelectorAll("[data-preview-section]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (activeVisualMode !== "edit") return;
      const focusField = event.target?.dataset?.inlineField || "";
      activeHomepageCard = { sectionId: button.dataset.previewSection, cardId: button.dataset.previewCard };
      renderHomepageCardEditor();
      if (focusField) document.querySelector(`#homepageCardPanel [name="${focusField}"]`)?.focus();
    });
    button.addEventListener("dragover", (event) => {
      if (activeVisualMode !== "edit") return;
      event.preventDefault();
      button.classList.add("is-drop-target");
    });
    button.addEventListener("dragleave", () => button.classList.remove("is-drop-target"));
    button.addEventListener("drop", async (event) => {
      event.preventDefault();
      button.classList.remove("is-drop-target");
      if (activeVisualMode !== "edit") return;
      await handleVisualImageDrop(event.dataTransfer.files[0], button.dataset.previewSection, button.dataset.previewCard);
    });
  });
}

function sitePreviewMarkup() {
  return `
    ${visualHeroSection()}
    ${visualMapSection()}
    ${visualCardSection("corridors", "Choose a corridor", "Compare the locations that shape the buyer experience.", "visual-corridor-grid")}
    ${visualCardSection("updates", "Latest development updates", "Source-backed movement across West Palm Beach new construction.", "visual-news-grid")}
    ${visualCardSection("guidance", "Buyer guidance", "Practical notes for comparing buildings, timelines, and tradeoffs.", "visual-guidance-grid")}
    ${visualCardSection("featuredBuildings", "Featured buildings", "A curated look at the projects buyers ask about first.", "visual-building-grid")}
    ${visualCtaSection()}
  `;
}

function comingNextPreview(pageId) {
  const label = pageId.charAt(0).toUpperCase() + pageId.slice(1);
  return `
    <div class="site-preview-frame">
      <section class="visual-coming-next-page">
        <strong>${escapeHtml(label)}</strong>
        <p>Visual editing for this page is coming next. Homepage is ready for direct visual editing now.</p>
        <button data-go-tab="site" data-go-section="advanced" type="button">Open Advanced Editor</button>
      </section>
    </div>
  `;
}

function visualHeroSection() {
  const card = (state.homepageCards?.hero ?? [])[0] || {};
  const item = previewItem("hero", card);
  const imagePosition = item.imagePosition || "center center";
  const objectFit = item.objectFit || "cover";
  return `
    <section class="site-section visual-hero-section">
      <button class="${hotspotClass("hero", card.id)}" data-preview-section="hero" data-preview-card="${escapeHtml(card.id || "hero")}" type="button">
        <span class="hotspot-label">Hero image</span>
        ${builderImage(item.imagePath || heroFallbackImage(), item.alt || item.headline || "West Palm Beach waterfront skyline", { style: `object-position:${imagePosition};object-fit:${objectFit}` })}
        <span class="visual-hero-copy">
          <small>WPB New Construction</small>
          <strong data-inline-field="headline">${escapeHtml(item.headline || card.title || "West Palm Beach new construction, compared carefully")}</strong>
          <em data-inline-field="deck">${escapeHtml(item.deck || item.subhead || card.deck || "Compare buildings, corridors, timing, and buyer-fit notes before you tour.")}</em>
        </span>
      </button>
    </section>
  `;
}

function visualMapSection() {
  const card = (state.homepageCards?.map ?? [])[0] || {};
  const item = previewItem("map", card);
  return `
    <section class="site-section visual-map-section">
      <div>
        <span class="section-kicker">Map</span>
        <h2>Where the new buildings are clustering</h2>
        <p>Use the map as the orientation point before comparing individual buildings and corridors.</p>
      </div>
      <button class="${hotspotClass("map", card.id)}" data-preview-section="map" data-preview-card="${escapeHtml(card.id || "homepage-map")}" type="button">
        <span class="hotspot-label">Map preview</span>
        ${builderImage(item.imagePath || "/assets/editorial/wpb-geography-map-hero.jpg", item.alt || "West Palm Beach new construction map preview", {})}
      </button>
    </section>
  `;
}

function visualCardSection(sectionId, heading, subhead, gridClass) {
  const cards = state.homepageCards?.[sectionId] ?? [];
  return `
    <section class="site-section visual-list-section visual-${escapeHtml(sectionId)}">
      <div class="visual-section-head">
        <span class="section-kicker">${escapeHtml(homepageSectionLabels[sectionId] || sectionId)}</span>
        <h2>${escapeHtml(heading)}</h2>
        <p>${escapeHtml(subhead)}</p>
      </div>
      <div class="${escapeHtml(gridClass)}">
        ${cards.slice(0, sectionId === "featuredBuildings" ? 6 : 4).map((card, index) => visualCard(sectionId, card, index)).join("")}
      </div>
    </section>
  `;
}

function visualCard(sectionId, card, index) {
  const item = previewItem(sectionId, card);
  const label = previewCardLabel(sectionId, card, index);
  const imagePosition = item.imagePosition || "center center";
  const objectFit = item.objectFit || "cover";
  const imagePath = item.imagePath || sectionFallbackImage(sectionId, index);
  return `
    <button class="${hotspotClass(sectionId, card.id)}" data-preview-section="${escapeHtml(sectionId)}" data-preview-card="${escapeHtml(card.id)}" type="button">
      <span class="hotspot-label">${escapeHtml(label)}</span>
      ${builderImage(imagePath, item.alt || item.headline || item.title || label, { style: `object-position:${imagePosition};object-fit:${objectFit}` })}
      <span class="visual-card-copy">
        <strong data-inline-field="headline">${escapeHtml(item.headline || item.title || label)}</strong>
        <em data-inline-field="deck">${escapeHtml(item.deck || item.subhead || card.deck || "Draft preview")}</em>
        <small>${escapeHtml(item.caption || item.ctaLabel || defaultCtaLabel(sectionId))}</small>
      </span>
    </button>
  `;
}

function visualCtaSection() {
  const card = (state.homepageCards?.cta ?? [])[0] || {};
  const item = previewItem("cta", card);
  return `
    <section class="site-section visual-cta-section">
      <button class="${hotspotClass("cta", card.id)}" data-preview-section="cta" data-preview-card="${escapeHtml(card.id || "bottom-cta")}" type="button">
        <span class="hotspot-label">CTA</span>
        <strong data-inline-field="headline">${escapeHtml(item.headline || "Want the shortlist before you tour?")}</strong>
        <span data-inline-field="deck">${escapeHtml(item.deck || item.subhead || card.deck || "Send Brooke your criteria and get a focused read on the buildings that actually fit.")}</span>
        <em>${escapeHtml(item.ctaLabel || "Compare my options")}</em>
      </button>
    </section>
  `;
}

function previewItem(sectionId, card) {
  const form = document.querySelector("#homepageCardPanel");
  const savedOverride = state.overrides.homepageCards?.sections?.[sectionId]?.cards?.[card.id] ?? {};
  const isSelected = activeHomepageCard.sectionId === sectionId && activeHomepageCard.cardId === card.id;
  const liveDraft = isSelected && form ? draftFromForm(card, savedOverride) : {};
  return { ...card, ...savedOverride, ...liveDraft };
}

function hotspotClass(sectionId, cardId) {
  const selected = activeHomepageCard.sectionId === sectionId && activeHomepageCard.cardId === cardId;
  return `visual-hotspot ${selected ? "is-selected" : ""}`;
}

function heroFallbackImage() {
  return (state.homepageCards?.featuredBuildings ?? []).find((card) => card.imagePath)?.imagePath || "/assets/editorial/flagler-waterfront-corridor.jpg";
}

function sectionFallbackImage(sectionId, index = 0) {
  const fallbacks = {
    corridors: ["/assets/editorial/flagler-waterfront-corridor.jpg", "/assets/editorial/rosemary-square-corridor.jpg", "/assets/editorial/south-flagler-corridor.jpg"],
    updates: ["/assets/editorial/nora-growth-corridor.jpg", "/assets/editorial/downtown-core-corridor.jpg", "/assets/editorial/kravis-center-downtown-attraction.jpg"],
    guidance: ["/assets/editorial/buyer-intelligence-interior.jpg", "/assets/editorial/wpb-geography-map-hero.jpg", "/assets/editorial/south-flagler-evening-corridor.jpg"],
    featuredBuildings: ["/projects/olara/media/olara-hero-exterior-1536x1024.jpg", "/projects/mandarin-oriental/media/mandarin-oriental-exterior-hero-source.jpg", "/projects/nora-house/media/user-provided-nora-house-card.jpg"],
  };
  return fallbacks[sectionId]?.[index % fallbacks[sectionId].length] || heroFallbackImage();
}

function draftFromForm(card, savedOverride) {
  const form = document.querySelector("#homepageCardPanel");
  return {
    imagePath: form.elements.imagePath.value || savedOverride.imagePath || card.imagePath || "",
    headline: form.elements.headline.value || savedOverride.headline || card.title || "",
    subhead: form.elements.subhead.value || savedOverride.subhead || "",
    deck: form.elements.deck.value || form.elements.subhead.value || savedOverride.deck || card.deck || "",
    caption: form.elements.caption.value || savedOverride.caption || "",
    alt: form.elements.alt.value || savedOverride.alt || "",
    ctaLabel: form.elements.ctaLabel.value || savedOverride.ctaLabel || defaultCtaLabel(activeHomepageCard.sectionId),
    objectFit: form.elements.objectFit.value || savedOverride.objectFit || "cover",
    imagePosition: form.elements.imagePosition.value || savedOverride.imagePosition || "center center",
  };
}

function previewCardLabel(sectionId, card, index) {
  if (sectionId === "updates") return `Update card ${index + 1}`;
  if (sectionId === "guidance") return `Guidance card ${index + 1}`;
  if (sectionId === "corridors") return `Corridor card ${index + 1}`;
  if (sectionId === "featuredBuildings") return `Featured building: ${card.title || `Card ${index + 1}`}`;
  if (sectionId === "cta") return "CTA";
  if (sectionId === "hero") return "Hero";
  return card.title || "Card";
}

function updateBuilderContext() {
  document.body.classList.toggle("is-project-editing", activeBuilderSection === "projects");
  const wrapper = document.querySelector("#projectSelectorWrap");
  if (wrapper) wrapper.hidden = activeBuilderSection !== "projects";
}

async function handleVisualImageDrop(file, sectionId, cardId) {
  if (!file) return show({ ok: false, error: "Drop an image file." });
  activeHomepageCard = { sectionId, cardId };
  renderHomepageCardEditor();
  const form = document.querySelector("#homepageCardPanel");
  const payload = {
    targetType: uploadTargetBySection[sectionId] || "editorial",
    projectId: sectionId === "featuredBuildings" ? cardId : activeProjectId(),
    fileName: file.name,
    slug: `${sectionId}-${cardId}-${Date.now()}`,
    imageType: "homepage visual editor",
    caption: form.elements.caption.value || "",
    alt: form.elements.alt.value || form.elements.headline.value || "",
    sourceRightsNote: "Uploaded through Brooke Builder visual editor; verify rights before approval.",
    status: "needs_review",
    dataUrl: await fileAsDataUrl(file),
  };
  const upload = await postJson("/api/upload-image", payload);
  if (!upload.ok) return show(upload);
  form.elements.imagePath.value = upload.entry.path;
  form.elements.status.value = "draft";
  updateCardPreview();
  renderLivePagePreview();
  const overridePayload = formPayload(form);
  overridePayload.status = "draft";
  show(await postJson("/api/homepage-card-overrides", overridePayload));
  await loadState();
}

function renderProjectPageContext() {
  if (!state?.projects?.length) return;
  const project = state.projects.find((item) => item.id === activeProjectId()) || state.projects[0];
  const projectCard = (state.homepageCards?.featuredBuildings ?? []).find((card) => card.id === project.id);
  const title = `Project Page: ${project.name}`;
  document.querySelector("#projectStructureTitle").textContent = title;
  document.querySelector("#projectPreviewTitle").textContent = title;
  document.querySelector("#projectPagePreview").innerHTML = `
    <div class="draft-page-frame project-draft">
      <section class="draft-section is-hero">
        <div class="draft-section-label">Hero</div>
        <div class="draft-hero-layout">
          <article class="draft-card is-selected is-hero-card">
            ${builderImage(projectCard?.imagePath || "", `${project.name} project preview`, {})}
            <strong>${escapeHtml(project.name)}</strong>
            <p>${escapeHtml(projectCard?.deck || "West Palm Beach project page")}</p>
          </article>
        </div>
      </section>
      ${["Gallery", "Summary", "Recent notes", "Floorplans", "CTA"].map((label) => `
        <section class="draft-section"><div class="draft-section-label">${label}</div><div class="project-preview-block">${escapeHtml(label)} section</div></section>
      `).join("")}
    </div>
  `;
}

function updateRepetitionWarning() {
  const form = document.querySelector("#homepageCardPanel");
  const imagePath = form.elements.imagePath.value;
  const warning = repetitionWarningFor(activeHomepageCard.sectionId, activeHomepageCard.cardId, imagePath);
  const target = document.querySelector("#repetitionWarning");
  target.hidden = !warning;
  const allowed = form.elements.allowRepeatedImage.checked && form.elements.repetitionApprovalReason.value.trim();
  target.textContent = warning && allowed ? `${warning} Intentional reuse is marked with a reason and will be listed in QA.` : warning;
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

function setImagePosition(position) {
  const form = document.querySelector("#homepageCardPanel");
  const focal = focalFromPosition(position);
  form.elements.imagePosition.value = position;
  form.elements.focalPointX.value = focal.x;
  form.elements.focalPointY.value = focal.y;
  updateCardPreview();
}

function focalFromPosition(position) {
  const presets = {
    "center center": { x: 50, y: 50 },
    "top center": { x: 50, y: 0 },
    "bottom center": { x: 50, y: 100 },
    "left center": { x: 0, y: 50 },
    "right center": { x: 100, y: 50 },
  };
  const percent = String(position || "").match(/(\d+)%\s+(\d+)%/);
  if (percent) return { x: Number(percent[1]), y: Number(percent[2]) };
  return presets[position] || presets["center center"];
}

function renderRemoteMode() {
  const banner = document.querySelector("#remoteBanner");
  banner.hidden = !state.remote?.isRemote;
  banner.textContent = state.remote?.message || "";
  document.body.classList.toggle("is-remote-mode", Boolean(state.remote?.isRemote));
}

async function renderReports() {
  const payload = await fetchJson("/api/reports");
  const reports = (payload.reports || []).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const latestVisual = reports.find((item) => item.category === "Visual Audits" && item.exists);
  const latestAutomation = reports.find((item) => item.category === "News / Automation" && item.exists);
  document.querySelector("#reportShortcuts").innerHTML = `
    <button data-report-path="${escapeHtml(latestVisual?.path || "")}" type="button"${latestVisual ? "" : " disabled"}>Open latest visual audit</button>
    <button data-report-path="${escapeHtml(latestAutomation?.path || "")}" type="button"${latestAutomation ? "" : " disabled"}>Open latest automation report</button>
  `;
  const groups = groupBy(reports, "category");
  document.querySelector("#reportList").innerHTML = Object.entries(groups).map(([category, items]) => `
    <section>
      <h2>${escapeHtml(category)}</h2>
      ${items.map((item) => `
        <button data-report-path="${escapeHtml(item.path)}" type="button" class="${item.path === activeReportPath ? "active" : ""}">
          <strong>${escapeHtml(fileName(item.path))}</strong>
          <span><em class="report-chip ${item.exists ? "is-ready" : "is-missing"}">${item.exists ? "ready" : "missing"}</em>${escapeHtml(item.exists ? formatDate(item.updatedAt) : " Missing")}</span>
        </button>
      `).join("")}
    </section>
  `).join("");
  document.querySelectorAll("[data-report-path]").forEach((button) => {
    button.onclick = () => loadReport(button.dataset.reportPath);
  });
  if (!activeReportPath && reports.find((item) => item.exists)) await loadReport(reports.find((item) => item.exists).path);
}

async function loadReport(reportPath) {
  const payload = await fetchJson(`/api/report?path=${encodeURIComponent(reportPath)}`);
  activeReportPath = reportPath;
  activeReportText = payload.text || "";
  document.querySelector("#reportTitle").textContent = fileName(reportPath);
  document.querySelector("#reportMeta").textContent = `${payload.category || "Report"} · ${reportPath}`;
  document.querySelector("#reportBody").innerHTML = renderMarkdown(activeReportText || "Report not found.");
  document.querySelectorAll("[data-report-path]").forEach((button) => button.classList.toggle("active", button.dataset.reportPath === reportPath));
}

document.querySelector("#copyReport").addEventListener("click", async () => {
  await navigator.clipboard.writeText(activeReportText || "");
  show({ ok: true, copied: activeReportPath });
});

document.querySelector("#openReportPath").addEventListener("click", () => {
  show({ ok: true, reportPath: activeReportPath });
});

function defaultCtaLabel(sectionId) {
  if (sectionId === "updates") return "Read Update";
  if (sectionId === "guidance") return "Read Guidance";
  if (sectionId === "corridors") return "View Corridor";
  if (sectionId === "featuredBuildings") return "View Project";
  return "Contact Brooke";
}

function resolveBuilderAssetUrl(imagePath, context = {}) {
  const value = String(imagePath || "").trim();
  const mode = context.mode || (state?.remote?.isRemote ? "remote" : "local");
  const assetBaseUrl = context.assetBaseUrl || state?.assetBaseUrl || publicSiteBaseUrl;
  if (!value) return placeholderImageSvg;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(?:\/Users|\/Volumes|[A-Za-z]:\\)/.test(value)) return placeholderImageSvg;
  const publicPath = value.startsWith("/") ? value : `/${value.replace(/^public\//, "")}`;
  if (mode === "remote") return `${assetBaseUrl.replace(/\/$/, "")}${publicPath}`;
  return publicPath;
}

function builderImage(imagePath, alt = "", options = {}) {
  const src = resolveBuilderAssetUrl(imagePath, options.context || {});
  const style = options.style ? ` style="${escapeHtml(options.style)}"` : "";
  const displayPath = escapeHtml(imagePath || "No image path");
  return `
    <figure class="builder-image-frame">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy"${style} data-builder-asset-path="${displayPath}" onerror="console.warn('Builder thumbnail failed', this.dataset.builderAssetPath, this.currentSrc); this.closest('figure').classList.add('is-broken')" />
      <figcaption><strong>Image not loading</strong><span>${displayPath}</span></figcaption>
    </figure>
  `;
}

function previewUrlFor(page, projectId = activeProjectId()) {
  if (page === "homepage") return state?.previewUrls?.homepage || "http://127.0.0.1:5173/";
  if (page === "updates") return state?.previewUrls?.updates || "http://127.0.0.1:5173/updates/";
  if (page === "guidance") return state?.previewUrls?.guidance || "http://127.0.0.1:5173/answers/";
  if (page === "market") return state?.previewUrls?.market || "http://127.0.0.1:5173/market-notes/";
  if (page === "floorplans") return state?.previewUrls?.floorplans || "http://127.0.0.1:5173/floorplans/";
  if (page === "project") return state?.previewUrls?.projectBase ? `${state.previewUrls.projectBase}${projectId}/` : `http://127.0.0.1:5173/projects/${projectId}/`;
  return state?.previewUrls?.homepage || "http://127.0.0.1:5173/";
}

function projectImageForNews(item) {
  const projectId = item.relatedProjectIds?.[0];
  return (state.homepageCards?.featuredBuildings ?? []).find((card) => card.id === projectId)?.imagePath || "";
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
  const imagePath = item.suggestedImagePath || projectImageForNews(item) || "";
  return `
    <article class="news-card" data-news-id="${escapeHtml(item.id)}">
      <div class="news-visual">
        ${imagePath ? builderImage(imagePath, item.rewrittenHeadline || "", {}) : `<div class="preview-placeholder">Assign image before publishing</div>`}
        <div>
          <span class="status-pill status-${slug(item.status || "draft")}">${escapeHtml(item.status || "draft")}</span>
          <span class="status-pill status-${slug(item.riskLevel || "normal")}">${escapeHtml(item.riskLevel || "normal")}</span>
        </div>
      </div>
      <div class="news-card-head">
        <strong>${escapeHtml(item.rewrittenHeadline)}</strong>
        <span>${escapeHtml(item.publishMode || "manual")}</span>
      </div>
      <p>${escapeHtml(item.deck)}</p>
      <div class="article-preview">
        <strong>Article preview</strong>
        <p>${escapeHtml(bodySectionsText.split("\n").filter(Boolean).slice(0, 3).join(" "))}</p>
      </div>
      <dl class="news-meta">
        <div><dt>Source</dt><dd>${escapeHtml(item.sourceName)} · <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">source</a></dd></div>
        <div><dt>Projects</dt><dd>${escapeHtml((item.relatedProjectIds ?? []).join(", ") || "none")}</dd></div>
        <div><dt>Corridors</dt><dd>${escapeHtml((item.relatedCorridorIds ?? []).join(", ") || "none")}</dd></div>
        <div><dt>Image</dt><dd>${escapeHtml(imagePath || "assign before publishing")}</dd></div>
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
  const payload = { workflow };
  if (["update", "update-deploy"].includes(workflow)) payload.confirmUpdate = document.querySelector("#confirmUpdate")?.checked === true;
  if (state.remote?.isRemote) payload.confirmRemote = document.querySelector("#confirmRemote")?.checked === true;
  show(await postJson("/api/run-workflow", payload));
  await loadState();
}

// ─── Article Manager ───────────────────────────────────────────────────────

let amArticles = [];
let amCurrentDraftId = null;
let amCurrentSourceId = null;
let amCurrentSource = null;
let amCurrentHeroImage = null;
let amCurrentImagePath = "";

function initArticleManager() {
  // Tab switching
  document.querySelectorAll(".am-tab").forEach((btn) => {
    btn.addEventListener("click", () => amSetTab(btn.dataset.amTab));
  });

  // Back button
  document.querySelector("#amBackBtn")?.addEventListener("click", () => amSetTab("list"));

  // Refresh list button
  document.querySelector("#amRefreshList")?.addEventListener("click", () => amLoadList());

  // Filter selects
  document.querySelector("#amFilterDest")?.addEventListener("change", () => amRenderFilteredList());
  document.querySelector("#amFilterStatus")?.addEventListener("change", () => amRenderFilteredList());

  // Destination → category auto-set
  document.querySelector("#amDestination")?.addEventListener("change", (event) => {
    const cat = document.querySelector("#amCategory");
    if (!cat) return;
    if (event.target.value === "buyer") cat.value = "Buyer Intelligence";
    else if (event.target.value === "downtown") cat.value = "Downtown Spotlight";
    else if (["Buyer Intelligence", "Downtown Spotlight"].includes(cat.value)) cat.value = "general";
  });

  // Hero file preview
  document.querySelector("#amHeroFile")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const thumb = document.querySelector("#amHeroThumb");
    const none = document.querySelector("#amHeroNone");
    thumb.src = await fileAsDataUrl(file);
    thumb.hidden = false;
    if (none) none.hidden = true;
  });

  // Add section button
  document.querySelector("#amAddSection")?.addEventListener("click", () => amAddSectionBlock());

  // Action buttons
  document.querySelector("#amSaveDraftBtn")?.addEventListener("click", () => amSaveDraft());
  document.querySelector("#amPreviewBtn")?.addEventListener("click", () => amPublish("preview"));
  document.querySelector("#amPreviewInSiteBtn")?.addEventListener("click", () => amPreviewInSite());
  document.querySelector("#amStageBtn")?.addEventListener("click", () => amPublish("stage"));
  document.querySelector("#amCommitStagedBtn")?.addEventListener("click", () => amCommitStaged());
  document.querySelector("#amPublishBtn")?.addEventListener("click", () => amPublish("publish"));
  document.querySelector("#amShipBtn")?.addEventListener("click", () => amPublish("ship"));

  // New Article tab: open blank editor
  document.querySelector("[data-am-tab='new']")?.addEventListener("click", () => amOpenNewEditor());

  // Import Package tab
  document.querySelector("[data-am-tab='import']")?.addEventListener("click", () => amInitImportPanel());
  document.querySelector("#amImportBackBtn")?.addEventListener("click", () => amSetTab("list"));
  document.querySelector("#amImportValidateBtn")?.addEventListener("click", () => amValidateImport());
  document.querySelector("#amImportCreateDraftBtn")?.addEventListener("click", () => amCreateImportDraft());
  document.querySelector("#amImportClearBtn")?.addEventListener("click", () => amClearImport());
  document.querySelector("#amImportAddInlineBtn")?.addEventListener("click", () => amAddInlineImageSlot());
  document.querySelector("#amImportJsonFile")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    document.querySelector("#amImportJsonText").value = text;
    amUpdateImportKeyTable();
  });
  document.querySelector("#amImportHeroFile")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    const preview = document.querySelector("#amImportHeroPreview");
    if (!file || !preview) return;
    preview.innerHTML = `<img src="${await fileAsDataUrl(file)}" alt="" />`;
    preview.hidden = false;
    amUpdateImportKeyTable();
  });
  document.querySelector("#amImportInlineImages")?.addEventListener("change", async (event) => {
    if (!event.target.classList.contains("am-import-inline-file")) return;
    const file = event.target.files?.[0];
    const preview = event.target.closest(".am-import-inline-row")?.querySelector(".am-import-inline-preview");
    if (!file || !preview) return;
    preview.innerHTML = `<img src="${await fileAsDataUrl(file)}" alt="" />`;
    preview.hidden = false;
    amUpdateImportKeyTable();
  });

  // Activate list when article tab is first opened
  document.querySelector("[data-tab='article']")?.addEventListener("click", () => {
    if (amArticles.length === 0) amLoadList();
  });
}

function amSetTab(tabName) {
  document.querySelectorAll(".am-tab").forEach((btn) => {
    btn.classList.toggle("am-tab-active", btn.dataset.amTab === tabName);
  });
  const views = { list: "#amListView", new: "#amEditorView", edit: "#amEditorView", import: "#amImportView", media: "#amMediaView" };
  document.querySelectorAll(".am-view").forEach((view) => {
    view.classList.remove("am-view-active");
  });
  const target = document.querySelector(views[tabName] || "#amListView");
  if (target) target.classList.add("am-view-active");
  if (tabName === "list") amLoadList();
}

async function amLoadList() {
  const el = document.querySelector("#amArticleList");
  if (el) el.innerHTML = "<p class='muted'>Loading…</p>";
  const data = await fetchJson("/api/articles");
  if (!data.ok) {
    if (el) el.innerHTML = `<p class='muted'>Error loading articles: ${escapeHtml(data.error || "unknown")}</p>`;
    return;
  }
  amArticles = data.articles || [];
  amRenderFilteredList();
}

function amRenderFilteredList() {
  const destFilter = document.querySelector("#amFilterDest")?.value || "";
  const statusFilter = document.querySelector("#amFilterStatus")?.value || "";
  const filtered = amArticles.filter((a) => {
    if (destFilter && a.destination !== destFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });
  const el = document.querySelector("#amArticleList");
  if (!el) return;
  if (filtered.length === 0) {
    el.innerHTML = "<p class='muted'>No articles match the current filters.</p>";
    return;
  }
  el.innerHTML = filtered.map((a) => amRenderArticleRow(a)).join("");
  // Bind actions
  el.querySelectorAll("[data-am-edit]").forEach((btn) => {
    btn.addEventListener("click", () => amOpenEditor({ id: btn.dataset.amEdit, destination: btn.dataset.dest, draftId: btn.dataset.draftId || null }));
  });
  el.querySelectorAll("[data-am-archive]").forEach((btn) => {
    btn.addEventListener("click", () => amConfirmArchive(btn));
  });
  el.querySelectorAll("[data-am-delete-draft]").forEach((btn) => {
    btn.addEventListener("click", () => amConfirmDeleteDraft(btn));
  });
}

function amRenderArticleRow(a) {
  const statusClass = { published: "status-published", draft: "status-draft", archived: "status-not-run-yet", "needs-review": "status-warning" }[a.status] || "status-not-run-yet";
  const destLabel = { news: "News", buyer: "Buyer", downtown: "Downtown" }[a.destination] || a.destination;
  const thumbHtml = a.imagePath
    ? `<img class="am-row-thumb" src="${escapeHtml(a.imagePath)}" alt="" onerror="this.style.display='none'" />`
    : `<span class="am-row-thumb-placeholder"></span>`;
  const editDataAttr = a.isDraft
    ? `data-am-edit="${escapeHtml(a.id)}" data-dest="${escapeHtml(a.destination)}" data-draft-id="${escapeHtml(a.draftId || "")}"`
    : `data-am-edit="${escapeHtml(a.id)}" data-dest="${escapeHtml(a.destination)}"`;
  const archiveBtn = (!a.isDraft && a.status === "published" && a.destination === "news")
    ? `<button class="am-row-action am-danger-action" data-am-archive="${escapeHtml(a.id)}" data-dest="${escapeHtml(a.destination)}" type="button">Archive</button>`
    : "";
  const deleteBtn = a.isDraft
    ? `<button class="am-row-action am-danger-action" data-am-delete-draft="${escapeHtml(a.draftId || a.id)}" data-dest="${escapeHtml(a.destination)}" type="button">Delete</button>`
    : "";
  const date = a.publishedAt || a.modifiedAt;
  const dateStr = date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  return `
    <div class="am-article-row" data-dest="${escapeHtml(a.destination)}" data-status="${escapeHtml(a.status)}">
      <div class="am-row-thumb-wrap">${thumbHtml}</div>
      <div class="am-row-info">
        <div class="am-row-badges">
          <span class="status-pill ${statusClass}">${escapeHtml(a.status)}</span>
          <span class="am-dest-chip">${escapeHtml(destLabel)}</span>
        </div>
        <strong class="am-row-title">${escapeHtml(a.title)}</strong>
        <span class="am-row-meta muted">${escapeHtml(a.slug || a.id)} · ${escapeHtml(a.category)} · ${escapeHtml(dateStr)}</span>
      </div>
      <div class="am-row-actions">
        <button class="am-row-action" ${editDataAttr} type="button">Edit</button>
        ${archiveBtn}
        ${deleteBtn}
      </div>
    </div>`;
}

async function amOpenEditor({ id, destination, draftId }) {
  const editTab = document.querySelector("#amEditTab");
  if (editTab) editTab.disabled = false;
  amSetTab("edit");
  document.querySelector("[data-am-tab='edit']")?.classList.add("am-tab-active");
  amSetSaveStatus("Loading…", null);

  const params = new URLSearchParams();
  params.set("destination", destination || "news");
  if (draftId) params.set("draftId", draftId);
  else params.set("id", id);

  const data = await fetchJson(`/api/article?${params}`);
  if (!data.ok) {
    amSetSaveStatus(`Error: ${data.error || "Could not load article"}`, false);
    return;
  }
  amPopulateEditor(data.article, data.source);
  document.querySelector("#amEditorLabel").textContent = "Edit Article";
  amSetSaveStatus("Loaded", true);
}

function amOpenNewEditor() {
  const editTab = document.querySelector("#amEditTab");
  if (editTab) editTab.disabled = false;
  amResetEditor();
  amCurrentDraftId = `draft-${Date.now()}`;
  amCurrentSourceId = null;
  amCurrentSource = null;
  document.querySelector("#amDraftId").value = amCurrentDraftId;
  document.querySelector("#amSourceId").value = "";
  document.querySelector("#amSourceRecord").value = "";
  document.querySelector("#amEditorLabel").textContent = "New Article";
  amSetSaveStatus("", null);
}

function amResetEditor() {
  const form = document.querySelector("#amArticleForm");
  if (!form) return;
  form.reset();
  document.querySelector("#amHeroThumb").hidden = true;
  document.querySelector("#amHeroNone").hidden = false;
  document.querySelector("#amSectionsContainer").innerHTML = "";
  amCurrentHeroImage = null;
  amCurrentImagePath = "";
  amSetSaveStatus("", null);
}

function amPopulateEditor(article, source) {
  amCurrentDraftId = article.draftId || null;
  amCurrentSourceId = article.id || null;
  amCurrentSource = source || null;

  const set = (id, val) => { const el = document.querySelector(`#${id}`); if (el) el.value = val || ""; };
  set("amDraftId", article.draftId || "");
  set("amSourceId", article.id || "");
  set("amSourceRecord", source || "");
  set("amDestination", article.destination || "news");
  set("amCategory", article.category || "general");
  set("amTitle", article.title || "");
  set("amSlug", article.slug || "");
  set("amDeck", article.deck || article.description || "");
  set("amRelatedProjects", (article.relatedProjectIds || []).join(", "));
  set("amRelatedCorridors", (article.relatedCorridorIds || []).join(", "));
  set("amSourceName", article.sourceName || "");
  set("amSourceUrl", article.sourceUrl || article.canonicalUrl || "");
  set("amSourceDate", article.sourcePublishedDate || "");
  set("amWhyItMatters", article.whyItMatters || "");
  set("amBuyerContext", article.buyerContext || "");
  set("amCommitMessage", "");
  set("amHeroAlt", article.heroAlt || "");
  set("amHeroCredit", article.heroCredit || "");
  set("amHeroCaption", article.heroCaption || "");

  // Hero image thumbnail
  const thumb = document.querySelector("#amHeroThumb");
  const none = document.querySelector("#amHeroNone");
  if (article.heroImage?.dataUrl) {
    thumb.src = article.heroImage.dataUrl;
    thumb.hidden = false;
    if (none) none.hidden = true;
    amCurrentHeroImage = article.heroImage;
  } else if (article.imagePath) {
    thumb.src = article.imagePath;
    thumb.hidden = false;
    if (none) none.hidden = true;
    amCurrentHeroImage = null;
  } else {
    thumb.hidden = true;
    if (none) none.hidden = false;
    amCurrentHeroImage = null;
  }
  amCurrentImagePath = article.imagePath || "";

  // Body sections
  const container = document.querySelector("#amSectionsContainer");
  if (container) {
    container.innerHTML = "";
    const sections = article.bodySections || [];
    sections.forEach((section) => amAddSectionBlock(section));
    if (sections.length === 0) amAddSectionBlock();
  }
}

function amAddSectionBlock(opts = {}) {
  const container = document.querySelector("#amSectionsContainer");
  if (!container) return;
  const index = container.children.length + 1;
  const block = document.createElement("div");
  block.className = "am-section-block";
  block.innerHTML = `
    <div class="am-section-block-header">
      <span class="am-section-num">${index}</span>
      <div class="am-section-block-controls">
        <button type="button" class="am-move-up" title="Move section up">↑</button>
        <button type="button" class="am-move-down" title="Move section down">↓</button>
        <button type="button" class="am-remove-block" title="Remove section">✕</button>
      </div>
    </div>
    <label>Heading <span class="am-optional">(optional)</span>
      <input class="am-section-heading" placeholder="Section heading" value="${escapeHtml(opts.heading || "")}" />
    </label>
    <label>Body text
      <textarea class="am-section-body" placeholder="Section content...">${escapeHtml(opts.body || "")}</textarea>
    </label>
    <details class="am-section-image-wrap"${opts.imageKey || opts.image ? " open" : ""}>
      <summary>Attach image to this section</summary>
      <div class="am-section-image-fields">
        <div class="am-section-img-preview-wrap">
          <img class="am-section-img" src="" alt="" hidden />
        </div>
        <label>Image file
          <input class="am-section-image-file" type="file" accept="image/*" />
        </label>
        <div class="grid">
          <label>Image key
            <input class="am-section-image-key" placeholder="image1" value="${escapeHtml(opts.imageKey || opts.image || "")}" />
          </label>
          <label>Alt text
            <input class="am-section-image-alt" placeholder="Describe this image" value="${escapeHtml(opts.imageAlt || "")}" />
          </label>
        </div>
        <label>Caption
          <textarea class="am-section-image-caption" placeholder="Optional caption">${escapeHtml(opts.imageCaption || "")}</textarea>
        </label>
        <label>Credit
          <input class="am-section-image-credit" placeholder="Photo credit" value="${escapeHtml(opts.imageCredit || "")}" />
        </label>
      </div>
    </details>`;
  container.appendChild(block);

  // Section image file preview
  block.querySelector(".am-section-image-file")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const img = block.querySelector(".am-section-img");
    img.src = await fileAsDataUrl(file);
    img.hidden = false;
  });

  // Move up
  block.querySelector(".am-move-up")?.addEventListener("click", () => {
    const prev = block.previousElementSibling;
    if (prev) container.insertBefore(block, prev);
    amRenumberSections();
  });

  // Move down
  block.querySelector(".am-move-down")?.addEventListener("click", () => {
    const next = block.nextElementSibling;
    if (next) container.insertBefore(next, block);
    amRenumberSections();
  });

  // Remove
  block.querySelector(".am-remove-block")?.addEventListener("click", () => {
    const heading = block.querySelector(".am-section-heading")?.value || "";
    const body = block.querySelector(".am-section-body")?.value || "";
    if ((heading || body) && !window.confirm("Remove this section? Its content will be lost.")) return;
    block.remove();
    amRenumberSections();
  });

  amRenumberSections();
}

function amRenumberSections() {
  document.querySelectorAll("#amSectionsContainer .am-section-block").forEach((block, i) => {
    const num = block.querySelector(".am-section-num");
    if (num) num.textContent = i + 1;
  });
}

async function amBuildPayload() {
  const form = document.querySelector("#amArticleForm");
  if (!form) return null;

  const val = (id) => document.querySelector(`#${id}`)?.value?.trim() || "";
  const checked = (id) => document.querySelector(`#${id}`)?.checked === true;

  const payload = {
    id: val("amSourceId") || null,
    draftId: val("amDraftId") || amCurrentDraftId,
    source: val("amSourceRecord") || null,
    title: val("amTitle"),
    slug: val("amSlug"),
    deck: val("amDeck"),
    destination: val("amDestination") || "news",
    category: val("amCategory") || "general",
    relatedProjectIds: val("amRelatedProjects"),
    relatedCorridorIds: val("amRelatedCorridors"),
    sourceName: val("amSourceName"),
    sourceUrl: val("amSourceUrl"),
    sourcePublishedDate: val("amSourceDate"),
    whyItMatters: val("amWhyItMatters"),
    buyerContext: val("amBuyerContext"),
    commitMessage: val("amCommitMessage"),
    heroAlt: val("amHeroAlt"),
    heroCredit: val("amHeroCredit"),
    heroCaption: val("amHeroCaption"),
    confirmPublish: checked("amConfirmPublish"),
    confirmDeploy: checked("amConfirmDeploy"),
    confirmRemote: checked("amConfirmRemote"),
  };

  // Hero image
  const heroFile = document.querySelector("#amHeroFile")?.files?.[0];
  if (heroFile) {
    payload.heroImage = await imagePayload(heroFile, { key: "hero", alt: payload.heroAlt, caption: payload.heroCaption, credit: payload.heroCredit });
    amCurrentHeroImage = payload.heroImage;
  } else if (amCurrentHeroImage) {
    payload.heroImage = amCurrentHeroImage;
  } else if (amCurrentImagePath) {
    payload.imagePath = amCurrentImagePath;
  }

  // Body sections + body images
  const sectionBlocks = document.querySelectorAll("#amSectionsContainer .am-section-block");
  const bodySections = [];
  const bodyImages = [];
  let imgIndex = 1;

  for (const block of sectionBlocks) {
    const heading = block.querySelector(".am-section-heading")?.value?.trim() || "";
    const body = block.querySelector(".am-section-body")?.value?.trim() || "";
    if (!heading && !body) continue;

    const imageFile = block.querySelector(".am-section-image-file")?.files?.[0];
    const imageKey = block.querySelector(".am-section-image-key")?.value?.trim() || (imageFile ? `image${imgIndex}` : "");
    const imageAlt = block.querySelector(".am-section-image-alt")?.value?.trim() || "";
    const imageCaption = block.querySelector(".am-section-image-caption")?.value?.trim() || "";
    const imageCredit = block.querySelector(".am-section-image-credit")?.value?.trim() || "";

    const section = { heading, body };
    if (imageKey) section.imageKey = imageKey;
    bodySections.push(section);

    if (imageFile) {
      const img = await imagePayload(imageFile, { key: imageKey, alt: imageAlt, caption: imageCaption, credit: imageCredit });
      if (img) bodyImages.push(img);
      imgIndex++;
    }
  }

  payload.bodySections = bodySections;
  payload.bodyImages = bodyImages;
  return payload;
}

async function amCommitStaged() {
  const payload = await amBuildPayload();
  if (!payload) return;
  const confirmCommit = document.querySelector("#amConfirmCommit")?.checked || false;
  const commitPayload = {
    destination: payload.destination,
    title: payload.title,
    slug: payload.slug,
    commitMessage: payload.commitMessage || `Publish article: ${payload.title}`,
    confirmCommit,
    confirmRemote: state?.remote?.isRemote === true,
  };
  amSetSaveStatus("Checking staged files…", null);
  const result = await postJson("/api/article/commit-staged", commitPayload);
  show(result);
  if (!result.ok) {
    amSetSaveStatus(`Commit failed: ${result.error || "see result panel"}`, false);
    amHideCommitPreview();
    return;
  }
  if (result.preview) {
    const previewEl = document.querySelector("#amCommitPreview");
    const filesEl = document.querySelector("#amCommitFiles");
    const confirmLabel = document.querySelector("#amConfirmCommit")?.closest("label");
    if (previewEl) previewEl.hidden = false;
    if (confirmLabel) confirmLabel.hidden = false;
    if (filesEl) {
      filesEl.innerHTML = result.files.map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join("");
    }
    amSetSaveStatus("Review files above, check the box, then click Commit Staged Article Changes again.", null);
    return;
  }
  amSetSaveStatus(`Committed ${result.commitHash?.slice(0, 7) || ""} and pushed.`, true);
  amHideCommitPreview();
  await loadState();
}

function amHideCommitPreview() {
  const previewEl = document.querySelector("#amCommitPreview");
  const confirmEl = document.querySelector("#amConfirmCommit");
  const confirmLabel = confirmEl?.closest("label");
  if (previewEl) previewEl.hidden = true;
  if (confirmLabel) confirmLabel.hidden = true;
  if (confirmEl) confirmEl.checked = false;
  const heading = previewEl?.querySelector("h3");
  if (heading) heading.textContent = "Files ready to commit";
}

async function amSaveDraft() {
  const payload = await amBuildPayload();
  if (!payload) return;
  amSetSaveStatus("Saving…", null);
  const result = await postJson("/api/article/save-draft", payload);
  if (result.ok) {
    amCurrentDraftId = result.draftId;
    document.querySelector("#amDraftId").value = result.draftId;
    amSetSaveStatus(`Draft saved at ${new Date(result.savedAt).toLocaleTimeString()}`, true);
  } else {
    amSetSaveStatus(`Save failed: ${result.error || "unknown error"}`, false);
  }
  show(result);
}

async function amPreviewInSite() {
  const payload = await amBuildPayload();
  if (!payload) return;
  if (!payload.title) { amSetSaveStatus("Title is required for Preview in Site.", false); return; }
  amSetSaveStatus("Creating site preview…", null);
  const result = await postJson("/api/article/site-preview", payload);
  if (result.ok && result.previewUrl) {
    amSetSaveStatus("Preview in Site opened. Vite dev server must be running (npm run dev).", true);
    window.open(result.previewUrl, "_blank");
  } else {
    amSetSaveStatus(`Preview in Site failed: ${result.error || "see result panel"}`, false);
    show(result);
  }
}

async function amPublish(mode) {
  const payload = await amBuildPayload();
  if (!payload) return;
  if (!payload.title) { amSetSaveStatus("Title is required.", false); return; }
  if (!payload.deck) { amSetSaveStatus("Deck is required.", false); return; }
  payload.mode = mode;
  const endpoint = mode === "preview" ? "/api/article/preview" : "/api/article/publish";
  amSetSaveStatus(`Running ${mode}…`, null);
  show({ ok: true, running: `Running ${mode} for article workflow.` });
  const result = await postJson(endpoint, payload);
  show(result);
  if (result.ok) {
    amSetSaveStatus(`${mode} complete`, true);
    if (["stage", "publish", "ship"].includes(mode)) await loadState();
  } else {
    amSetSaveStatus(`${mode} failed: ${result.error || "see result panel"}`, false);
    if (result.nextStep === "commit-staged") {
      const previewEl = document.querySelector("#amCommitPreview");
      const filesEl = document.querySelector("#amCommitFiles");
      const confirmLabel = document.querySelector("#amConfirmCommit")?.closest("label");
      if (previewEl) {
        previewEl.hidden = false;
        const heading = previewEl.querySelector("h3");
        if (heading) heading.textContent = "Staged files detected";
      }
      if (filesEl) {
        filesEl.innerHTML = (result.stagedFiles || []).map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join("");
      }
      if (confirmLabel) confirmLabel.hidden = false;
    }
  }
}

function amSetSaveStatus(message, ok) {
  const el = document.querySelector("#amSaveStatus");
  if (!el) return;
  el.textContent = message;
  el.className = "am-save-status" + (ok === true ? " am-status-ok" : ok === false ? " am-status-error" : "");
}

function amConfirmArchive(btn) {
  const id = btn.dataset.amArchive;
  const dest = btn.dataset.dest;
  const row = btn.closest(".am-article-row");
  if (!row) return;
  const existing = row.querySelector(".am-inline-confirm");
  if (existing) { existing.remove(); return; }
  const confirm = document.createElement("div");
  confirm.className = "am-inline-confirm";
  confirm.innerHTML = `<span>Archive this article? It will remain live until the next build.</span>
    <button type="button" class="am-confirm-yes">Archive</button>
    <button type="button" class="am-confirm-cancel">Cancel</button>`;
  row.querySelector(".am-row-actions")?.appendChild(confirm);
  confirm.querySelector(".am-confirm-cancel")?.addEventListener("click", () => confirm.remove());
  confirm.querySelector(".am-confirm-yes")?.addEventListener("click", async () => {
    confirm.innerHTML = "<span>Archiving…</span>";
    const result = await postJson("/api/article/archive", { id, destination: dest, confirmArchive: true, confirmRemote: state?.remote?.isRemote === true });
    show(result);
    if (result.ok) {
      amSetSaveStatus("Article archived", true);
      await amLoadList();
    } else {
      confirm.innerHTML = `<span class="am-status-error">Error: ${escapeHtml(result.error || "failed")}</span>`;
    }
  });
}

function amConfirmDeleteDraft(btn) {
  const draftId = btn.dataset.amDeleteDraft;
  const dest = btn.dataset.dest;
  const row = btn.closest(".am-article-row");
  if (!row) return;
  const existing = row.querySelector(".am-inline-confirm");
  if (existing) { existing.remove(); return; }
  const confirm = document.createElement("div");
  confirm.className = "am-inline-confirm";
  confirm.innerHTML = `<span>Delete this draft permanently?</span>
    <button type="button" class="am-confirm-yes">Delete</button>
    <button type="button" class="am-confirm-cancel">Cancel</button>`;
  row.querySelector(".am-row-actions")?.appendChild(confirm);
  confirm.querySelector(".am-confirm-cancel")?.addEventListener("click", () => confirm.remove());
  confirm.querySelector(".am-confirm-yes")?.addEventListener("click", async () => {
    confirm.innerHTML = "<span>Deleting…</span>";
    const result = await postJson("/api/article/delete-draft", { draftId, destination: dest, confirmDelete: true });
    show(result);
    if (result.ok) {
      amSetSaveStatus("Draft deleted", true);
      await amLoadList();
    } else {
      confirm.innerHTML = `<span class="am-status-error">Error: ${escapeHtml(result.error || "failed")}</span>`;
    }
  });
}

initArticleManager();

// ─── Import Article Package ────────────────────────────────────────────────

function amInitImportPanel() {
  amSetImportStatus("", null);
}

function amAddInlineImageSlot() {
  const container = document.querySelector("#amImportInlineImages");
  if (!container) return;
  const index = container.children.length + 1;
  const row = document.createElement("div");
  row.className = "am-import-inline-row";
  row.innerHTML = `
    <label>Inline image ${index}
      <input class="am-import-inline-file" type="file" accept="image/*" data-upload-key="image_${index}" />
    </label>
    <div class="am-import-inline-preview" hidden></div>
  `;
  container.appendChild(row);
}

function amGatherImageMetadata() {
  const images = {};
  const heroFile = document.querySelector("#amImportHeroFile")?.files?.[0];
  if (heroFile) {
    const heroKey = clean(document.querySelector("#amImportJsonText")?.value?.trim() ? JSON.parse(document.querySelector("#amImportJsonText").value.trim())?.heroImage?.uploadKey : "") || "hero";
    images[heroKey] = { key: heroKey, fileName: heroFile.name, type: heroFile.type, size: heroFile.size };
  }
  const inlineInputs = document.querySelectorAll(".am-import-inline-file");
  for (const input of inlineInputs) {
    const file = input.files?.[0];
    if (!file) continue;
    const uploadKey = clean(input.dataset.uploadKey) || input.dataset.uploadKey;
    images[uploadKey] = { key: uploadKey, fileName: file.name, type: file.type, size: file.size };
  }
  return images;
}

async function amBuildValidationPayload() {
  const jsonText = document.querySelector("#amImportJsonText")?.value?.trim() || "";
  let pkg = null;
  try {
    pkg = JSON.parse(jsonText);
  } catch {
    return { error: "Invalid JSON: could not parse." };
  }
  return { package: pkg, images: amGatherImageMetadata() };
}

async function amBuildImportPayload() {
  const jsonText = document.querySelector("#amImportJsonText")?.value?.trim() || "";
  let pkg = null;
  try {
    pkg = JSON.parse(jsonText);
  } catch {
    return { error: "Invalid JSON: could not parse." };
  }

  // Gather uploaded images by uploadKey with full data URLs
  const images = {};

  // Hero
  const heroFile = document.querySelector("#amImportHeroFile")?.files?.[0];
  if (heroFile) {
    const heroKey = clean(pkg?.heroImage?.uploadKey) || "hero";
    images[heroKey] = await imagePayload(heroFile, { key: heroKey });
  }

  // Inline images
  const inlineInputs = document.querySelectorAll(".am-import-inline-file");
  for (const input of inlineInputs) {
    const file = input.files?.[0];
    if (!file) continue;
    const uploadKey = clean(input.dataset.uploadKey) || input.dataset.uploadKey;
    images[uploadKey] = await imagePayload(file, { key: uploadKey });
  }

  return { package: pkg, images };
}

function amUpdateImportKeyTable() {
  const tbody = document.querySelector("#amImportKeyTable");
  if (!tbody) return;
  const heroFile = document.querySelector("#amImportHeroFile")?.files?.[0];
  const rows = [];

  // Hero
  rows.push(`
    <tr>
      <td>hero</td>
      <td>${heroFile ? escapeHtml(heroFile.name) : "—"}</td>
      <td class="${heroFile ? "am-key-ready" : "am-key-missing"}">${heroFile ? "Ready" : "Missing"}</td>
    </tr>
  `);

  // Inline
  const inlineInputs = document.querySelectorAll(".am-import-inline-file");
  for (const input of inlineInputs) {
    const file = input.files?.[0];
    const key = input.dataset.uploadKey;
    rows.push(`
      <tr>
        <td>${escapeHtml(key)}</td>
        <td>${file ? escapeHtml(file.name) : "—"}</td>
        <td class="${file ? "am-key-ready" : "am-key-missing"}">${file ? "Ready" : "Missing"}</td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.join("");
}

async function amValidateImport() {
  const validateBtn = document.querySelector("#amImportValidateBtn");
  const createBtn = document.querySelector("#amImportCreateDraftBtn");
  validateBtn.disabled = true;
  createBtn.disabled = true;
  amRenderValidation([], []);
  amSetImportStatus("Validating package…", null);

  const payload = await amBuildValidationPayload();
  if (payload.error) {
    amRenderValidation([payload.error], []);
    amSetImportStatus("Validation failed", false);
    validateBtn.disabled = false;
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let result;
  try {
    result = await fetch("/api/article/import-package/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).then((r) => r.json());
  } catch (err) {
    if (err.name === "AbortError") {
      amRenderValidation(["Validation timed out after 15 seconds. The server may be busy or the package is too large."], []);
    } else {
      amRenderValidation([`Validation request failed: ${err.message || "unknown error"}`], []);
    }
    amSetImportStatus("Validation failed", false);
    validateBtn.disabled = false;
    return;
  } finally {
    clearTimeout(timeoutId);
  }

  const clientWarnings = amImageSizeWarnings(payload.images);
  const allWarnings = [...(result.warnings || []), ...clientWarnings];
  amRenderValidation(result.errors || [], allWarnings);
  const hasErrors = (result.errors || []).length > 0;
  createBtn.disabled = hasErrors;
  validateBtn.disabled = false;
  amSetImportStatus(hasErrors ? "Validation failed — fix errors before creating draft" : "Validation passed", !hasErrors);
}

function amImageSizeWarnings(images) {
  const warnings = [];
  const LARGE_THRESHOLD = 5 * 1024 * 1024; // 5 MB
  for (const meta of Object.values(images || {})) {
    if (meta.size > LARGE_THRESHOLD) {
      warnings.push(`Image "${meta.fileName}" (${(meta.size / 1024 / 1024).toFixed(1)} MB) is large. It will work, but may slow draft creation.`);
    }
  }
  return warnings;
}

function amRenderValidation(errors, warnings) {
  const el = document.querySelector("#amImportValidation");
  if (!el) return;
  el.innerHTML = "";
  const items = [];
  for (const err of errors) items.push(`<li class="am-val-error">Error: ${escapeHtml(err)}</li>`);
  for (const warn of warnings) items.push(`<li class="am-val-warn">Warning: ${escapeHtml(warn)}</li>`);
  if (items.length === 0) items.push(`<li class="am-val-ok">No issues found.</li>`);
  el.innerHTML = `<ul>${items.join("")}</ul>`;
}

async function amCreateImportDraft() {
  amSetImportStatus("Creating draft…", null);
  const payload = await amBuildImportPayload();
  if (payload.error) {
    amSetImportStatus(`Failed: ${payload.error}`, false);
    return;
  }
  const result = await postJson("/api/article/import-package/create-draft", payload);
  show(result);
  if (!result.ok) {
    amSetImportStatus(`Draft creation failed: ${result.error || "unknown error"}`, false);
    return;
  }

  // Open the new draft in the editor
  amSetImportStatus("Draft created. Opening editor…", true);
  await amOpenEditor({ id: result.draftId, destination: result.destination, draftId: result.draftId });
}

function amClearImport() {
  document.querySelector("#amImportJsonText").value = "";
  document.querySelector("#amImportJsonFile").value = "";
  document.querySelector("#amImportHeroFile").value = "";
  document.querySelector("#amImportHeroPreview").innerHTML = "";
  document.querySelector("#amImportHeroPreview").hidden = true;
  document.querySelector("#amImportInlineImages").innerHTML = `
    <div class="am-import-inline-row">
      <label>Inline image 1
        <input class="am-import-inline-file" type="file" accept="image/*" data-upload-key="image_1" />
      </label>
      <div class="am-import-inline-preview" hidden></div>
    </div>
    <div class="am-import-inline-row">
      <label>Inline image 2
        <input class="am-import-inline-file" type="file" accept="image/*" data-upload-key="image_2" />
      </label>
      <div class="am-import-inline-preview" hidden></div>
    </div>
  `;
  document.querySelector("#amImportValidation").innerHTML = "";
  document.querySelector("#amImportCreateDraftBtn").disabled = true;
  amUpdateImportKeyTable();
  amSetImportStatus("", null);
}

function amSetImportStatus(message, ok) {
  const el = document.querySelector("#amImportStatus");
  if (!el) return;
  el.textContent = message;
  el.className = "am-save-status" + (ok === true ? " am-status-ok" : ok === false ? " am-status-error" : "");
}

async function imagePayload(file, metadata = {}) {
  if (!file) return null;
  return {
    fileName: file.name,
    dataUrl: await fileAsDataUrl(file),
    ...Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined && value !== "")),
  };
}

function parseSectionsInput(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setSelectedFile(file) {
  selectedFile = file;
  if (!selectedFile) return;
  preview.src = await fileAsDataUrl(selectedFile);
  preview.hidden = false;
}

function formPayload(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  form.querySelectorAll("input[type='checkbox'][name]").forEach((input) => {
    payload[input.name] = input.checked;
  });
  return payload;
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

function renderMarkdown(markdown) {
  return escapeHtml(markdown)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^\- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

function fileName(filePath) {
  return String(filePath || "").split("/").pop() || filePath;
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}

function slug(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

loadState().catch(show);
