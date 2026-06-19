let state;
let selectedFile;
let activeHomepageCard = { sectionId: "hero", cardId: "hero" };
let activeReportPath = "";
let activeReportText = "";
let activeBuilderSection = "homepage";
let activePreviewDevice = "desktop";
let activeVisualMode = "edit";
let activeVisualPage = "homepage";
let activeProjectIntelligenceSlug = "";
let activeProjectIntelligenceField = "";
let activeProjectIntelligenceFilter = "all";
let activeProjectIntelligenceQueueId = "";
let activeFactUpdaterSlug = "";
let activeFactUpdaterField = "";

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
  populatePageSelector();
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
  activeProjectIntelligenceSlug = activeProjectIntelligenceSlug || projectSelect.value;
  renderProjectIntelligenceReview();
  renderFactUpdater();
  updateBuilderContext();
  syncEditorPanels();
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
  activeProjectIntelligenceSlug = projectSelect.value;
  renderProjectIntelligenceReview();
});
document.querySelectorAll("[data-export-format]").forEach((button) => {
  button.addEventListener("click", () => exportProjectIntelligenceReview(button.dataset.exportFormat || "json"));
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
bindProjectEditorForm();
waitForViteAndLoad();
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
  // In preview mode, expand the iframe to fill the full canvas width; in edit mode restore side panel
  document.querySelector("#visualEditorShell")?.classList.toggle("preview-only-mode", activeVisualMode === "preview");
  syncEditorPanels();
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

// ─── Real-site iframe preview ─────────────────────────────────────────────────

/** Navigate the site preview iframe to the URL matching the current visual page. */
function renderLivePagePreview() {
  const iframe = document.querySelector("#sitePreviewIframe");
  if (!iframe) return;
  const url = visualPageUrl();
  if (iframe.src !== url) iframe.src = url;
  updateOpenLivePageLink(url);
  syncEditorPanels();
}

/** Return the Vite dev server URL for the currently selected visual page. */
function visualPageUrl() {
  const base = state?.viteDevUrl || "http://localhost:5174";
  if (activeVisualPage === "homepage") return `${base}/`;
  if (activeVisualPage === "updates") return `${base}/updates/`;
  if (activeVisualPage === "guidance") return `${base}/answers/`;
  if (activeVisualPage === "floorplans") return `${base}/floorplans/`;
  if (activeVisualPage === "corridors") return `${base}/corridors/north-flagler/`;
  if (activeVisualPage.startsWith("project:")) return `${base}/projects/${activeVisualPage.slice(8)}/`;
  return `${base}/`;
}

function updateOpenLivePageLink(url) {
  const link = document.querySelector("#openLivePage, #previewHomepage");
  if (link) link.href = url;
  const cardLink = document.querySelector("#homepagePreviewLink");
  if (cardLink) cardLink.href = url;
}

/** Show the correct editor side panel for the active visual page. */
function syncEditorPanels() {
  const isHomepage = activeVisualPage === "homepage";
  const isProject = activeVisualPage.startsWith("project:");
  document.querySelector("#homepageCardPanel")?.toggleAttribute("hidden", !isHomepage);
  document.querySelector("#projectEditorPanel")?.toggleAttribute("hidden", !isProject);
  document.querySelector("#previewOnlyPanel")?.toggleAttribute("hidden", isHomepage || isProject);
  if (isProject) renderProjectEditor(activeVisualPage.slice(8));
}

/** Poll Vite readiness and hide the loading overlay once the iframe responds. */
async function waitForViteAndLoad() {
  const overlay = document.querySelector("#viteLoadingOverlay");
  const iframe = document.querySelector("#sitePreviewIframe");
  if (!overlay || !iframe) return;

  const viteStatus = await fetchJson("/api/vite-status").catch(() => ({ ready: false }));
  if (viteStatus.ready) {
    overlay.hidden = true;
    renderLivePagePreview();
    return;
  }
  // Poll until ready (max 45 s)
  let attempts = 0;
  const poll = setInterval(async () => {
    attempts++;
    if (attempts > 22) { clearInterval(poll); overlay.querySelector("span").textContent = "Site preview failed to start. Restart Content Studio."; return; }
    const s = await fetchJson("/api/vite-status").catch(() => ({ ready: false }));
    if (s.ready) {
      clearInterval(poll);
      overlay.hidden = true;
      renderLivePagePreview();
    }
  }, 2000);
}

/** Dynamically add project page options into the page selector. */
function populatePageSelector() {
  const select = document.querySelector("#visualPageSelect");
  if (!select || !state?.projects?.length) return;
  // Remove any previously added project options
  select.querySelectorAll("optgroup[data-projects]").forEach((g) => g.remove());
  const group = document.createElement("optgroup");
  group.label = "Project pages";
  group.dataset.projects = "1";
  for (const project of state.projects) {
    const opt = document.createElement("option");
    opt.value = `project:${project.id}`;
    opt.textContent = project.name;
    group.append(opt);
  }
  select.append(group);
}

// ─── Project page editor ──────────────────────────────────────────────────────

/** Fill the project editor form from the current state for a given projectId. */
function renderProjectEditor(projectId) {
  const project = (state.projects ?? []).find((p) => p.id === projectId);
  if (!project) return;
  const overrides = state.overrides?.editorProjectOverrides?.[projectId] ?? {};
  const form = document.querySelector("#projectEditorPanel");
  if (!form) return;
  form.elements.projectId.value = projectId;
  document.querySelector("#projectEditorTitle").textContent = project.name;
  // Populate image picker
  populateImageSelect(document.querySelector("#projectImageSelect"), overrides.image || project.image || "");
  // Fill text fields — blank means "use source default"
  const fields = ["name", "status", "delivery", "deliveryYear", "residences", "price", "address", "summary"];
  for (const field of fields) {
    if (form.elements[field]) form.elements[field].value = overrides[field] ?? "";
  }
  document.querySelector("#projectEditorStatus").textContent = "";
  document.querySelector("#commitVisualChanges").disabled = true;
  document.querySelector("#preCommitResults").hidden = true;
}

function bindProjectEditorForm() {
  const form = document.querySelector("#projectEditorPanel");
  if (!form) return;

  // Save override
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("#projectEditorStatus");
    status.textContent = "Saving…";
    const payload = {
      projectId: form.elements.projectId.value,
      name: form.elements.name.value,
      status: form.elements.status.value,
      delivery: form.elements.delivery.value,
      deliveryYear: form.elements.deliveryYear.value ? Number(form.elements.deliveryYear.value) : undefined,
      residences: form.elements.residences.value,
      price: form.elements.price.value,
      address: form.elements.address.value,
      summary: form.elements.summary.value,
      image: document.querySelector("#projectImageSelect")?.value || "",
    };
    const result = await postJson("/api/visual-editor/save-project-override", payload);
    if (result.ok) {
      status.textContent = "Saved. Vite will hot-reload the preview in a moment.";
      await loadState();
    } else {
      status.textContent = `Error: ${result.error}`;
    }
  });

  // Revert override
  document.querySelector("#revertProjectOverride")?.addEventListener("click", async () => {
    const projectId = form.elements.projectId.value;
    if (!projectId) return;
    const status = document.querySelector("#projectEditorStatus");
    status.textContent = "Reverting…";
    const result = await postJson("/api/visual-editor/save-project-override", { projectId, revert: true });
    if (result.ok) {
      status.textContent = "Reverted to source defaults.";
      await loadState();
      renderProjectEditor(projectId);
    } else {
      status.textContent = `Error: ${result.error}`;
    }
  });

  // Hero image drop zone
  const dropZone = document.querySelector("#projectImageDropZone");
  const dropFile = document.querySelector("#projectImageDropFile");
  if (dropZone) {
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("is-drop-target"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-drop-target"));
    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault(); dropZone.classList.remove("is-drop-target");
      const file = e.dataTransfer.files[0];
      if (file) await uploadProjectHeroImage(file, form.elements.projectId.value);
    });
  }
  if (dropFile) dropFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) await uploadProjectHeroImage(file, form.elements.projectId.value);
  });

  // Pre-commit check
  document.querySelector("#runPreCommitCheck")?.addEventListener("click", runPreCommitChecks);

  // Commit
  document.querySelector("#commitVisualChanges")?.addEventListener("click", commitVisualEditorChanges);
}

async function uploadProjectHeroImage(file, projectId) {
  if (!file) return;
  const statusEl = document.querySelector("#projectEditorStatus");
  statusEl.textContent = "Uploading and optimizing image…";
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    const result = await postJson("/api/upload-image", {
      dataUrl,
      targetType: "projectHero",
      projectId,
      slug: `${projectId}-hero-${Date.now()}`,
    });
    if (result.ok) {
      // Update form image selector to new path
      const select = document.querySelector("#projectImageSelect");
      if (select) {
        const opt = document.createElement("option");
        opt.value = result.entry.path;
        opt.textContent = result.entry.path;
        select.append(opt);
        select.value = result.entry.path;
      }
      statusEl.textContent = `Image uploaded: ${result.entry.path}`;
    } else {
      statusEl.textContent = `Upload error: ${result.error}`;
    }
  };
  reader.readAsDataURL(file);
}

// ─── Pre-commit check + commit ────────────────────────────────────────────────

async function runPreCommitChecks() {
  const resultsEl = document.querySelector("#preCommitResults");
  const commitBtn = document.querySelector("#commitVisualChanges");
  const statusEl = document.querySelector("#projectEditorStatus");
  if (!resultsEl) return;
  statusEl.textContent = "Running checks…";
  resultsEl.hidden = false;
  resultsEl.innerHTML = `<p class="muted">Running checks&hellip;</p>`;
  commitBtn.disabled = true;

  const result = await postJson("/api/visual-editor/pre-commit-check", {});
  if (!result.ok) {
    resultsEl.innerHTML = `<p class="error">Check failed: ${escapeHtml(result.error || "Unknown error")}</p>`;
    statusEl.textContent = "";
    return;
  }

  const rows = result.checks.map((c) => `
    <div class="pre-commit-check-row ${c.pass ? "pass" : "fail"}">
      <span class="check-status">${c.pass ? "✓" : "✗"}</span>
      <span class="check-name">${escapeHtml(c.name)}</span>
      <span class="check-detail">${escapeHtml(c.detail || "")}</span>
    </div>
  `).join("");
  resultsEl.innerHTML = rows;
  statusEl.textContent = result.allPass ? "All checks passed — ready to commit." : "Fix issues above before committing.";
  commitBtn.disabled = !result.allPass;
}

async function commitVisualEditorChanges() {
  const statusEl = document.querySelector("#projectEditorStatus");
  const commitBtn = document.querySelector("#commitVisualChanges");
  statusEl.textContent = "Committing and pushing…";
  commitBtn.disabled = true;
  const result = await postJson("/api/visual-editor/commit", {
    commitMessage: "Visual Editor: update site content via Content Studio",
  });
  if (result.ok) {
    statusEl.textContent = result.pushed
      ? "Committed and pushed — deploy triggered."
      : "Committed locally (push skipped — no changes staged).";
    document.querySelector("#preCommitResults").hidden = true;
  } else {
    statusEl.textContent = `Commit error: ${result.error}`;
    commitBtn.disabled = false;
  }
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
  document.body.classList.toggle("is-project-editing", activeBuilderSection === "projects" || activeBuilderSection === "project-intelligence");
  const wrapper = document.querySelector("#projectSelectorWrap");
  if (wrapper) wrapper.hidden = !(activeBuilderSection === "projects" || activeBuilderSection === "project-intelligence");
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

function renderProjectIntelligenceReview() {
  const review = state?.projectIntelligence;
  const listRoot = document.querySelector("#projectIntelligenceList");
  const summaryRoot = document.querySelector("#projectIntelligenceSummary");
  const detailRoot = document.querySelector("#projectIntelligenceDetail");
  const titleRoot = document.querySelector("#projectIntelligenceTitle");
  const metaRoot = document.querySelector("#projectIntelligenceMeta");
  const filtersRoot = document.querySelector("#projectIntelligenceFilters");
  const policyRoot = document.querySelector("#projectIntelligencePolicy");
  const copyButton = document.querySelector("#copyProjectIntelligence");
  if (!review || !listRoot || !summaryRoot || !detailRoot || !titleRoot || !metaRoot || !filtersRoot || !policyRoot) return;

  const projects = review.projects || [];
  const queue = review.queueRows || [];
  const filter = activeProjectIntelligenceFilter || "all";
  const visibleQueue = filterProjectIntelligenceRows(queue, filter);
  const selected = findSelectedQueueRow(visibleQueue, queue);
  const selectedProject = selected
    ? projects.find((item) => item.slug === selected.projectSlug) || projects.find((item) => item.slug === activeProjectIntelligenceSlug) || projects[0]
    : projects.find((item) => item.slug === activeProjectIntelligenceSlug) || projects.find((item) => item.slug === projectSelect.value) || projects[0];

  if (!selectedProject) {
    listRoot.innerHTML = `<p class="muted">No project intelligence data loaded.</p>`;
    summaryRoot.innerHTML = "";
    detailRoot.innerHTML = `<p class="muted">No project selected.</p>`;
    titleRoot.textContent = "Choose a project";
    metaRoot.textContent = "";
    filtersRoot.innerHTML = "";
    policyRoot.innerHTML = "";
    return;
  }

  const selectedProjectRows = queue.filter((item) => item.projectSlug === selectedProject.slug);
  const selectedFieldReview = selectedProject.fieldReviews?.find((field) => field.field === selected?.field)
    || selectedProject.fieldReviews?.find((field) => field.reviewStatus !== "clear")
    || selectedProject.fieldReviews?.[0];

  if (selected) {
    activeProjectIntelligenceQueueId = selected.id;
    activeProjectIntelligenceSlug = selected.projectSlug;
    activeProjectIntelligenceField = selected.field;
  } else {
    activeProjectIntelligenceSlug = selectedProject.slug;
    activeProjectIntelligenceField = selectedFieldReview?.field || "";
  }

  // activeFieldReview: the field being shown in the override panel — follows the active field
  // (which is set by queue-item click or field-selector change)
  const activeFieldKey = activeProjectIntelligenceField || selected?.field || selectedFieldReview?.field || "";
  const activeFieldReview = selectedProject.fieldReviews?.find((fr) => fr.field === activeFieldKey)
    || selectedFieldReview;

  renderProjectIntelligenceFilters(filtersRoot, review, filter);
  renderProjectIntelligencePolicy(policyRoot);

  summaryRoot.innerHTML = [
    ["Total issues", review.queueSummary?.totalIssues ?? queue.length],
    ["Priority 1", review.queueSummary?.priority1Issues ?? queue.filter((item) => item.priority === 1).length],
    ["Priority 2", review.queueSummary?.priority2Issues ?? queue.filter((item) => item.priority === 2).length],
    ["Missing compare rows", review.queueSummary?.missingCompareRows ?? queue.filter((item) => item.issueKind === "missing-compare-row").length],
    ["Missing source mappings", review.queueSummary?.missingSourceMappings ?? queue.filter((item) => item.issueKind === "missing-source-mapping").length],
  ].map(([label, value]) => `<span class="status-pill status-healthy">${escapeHtml(label)}: ${escapeHtml(String(value))}</span>`).join("");

  listRoot.innerHTML = visibleQueue.length
    ? visibleQueue.map((item) => `
        <button type="button" class="project-intelligence-card ${item.id === selected?.id ? "active" : ""}${item.hasManualOverride ? " pi-card-overridden" : ""}" data-project-intelligence-queue-id="${escapeHtml(item.id)}">
          <div class="project-intelligence-card-head">
            ${item.hasManualOverride
              ? `<span class="pi-override-badge">Override set</span>`
              : `<span class="priority-pill priority-${item.priority}">${escapeHtml(item.priorityLabel)}</span>`}
            <strong>${escapeHtml(item.projectName)}</strong>
          </div>
          <span>${escapeHtml(item.projectSlug)} · ${escapeHtml(item.fieldLabel)}</span>
          <small>${escapeHtml(item.reason)}</small>
          <div class="project-intelligence-card-values">
            <span>Public: ${escapeHtml(item.publicValue || "—")}</span>
            <span>Compare: ${escapeHtml(item.compareValue || "—")}</span>
            <span>Source: ${escapeHtml(item.sourceValue || "—")}</span>
          </div>
          <div class="project-intelligence-card-values">
            <span>Winner: ${escapeHtml(item.currentWinner)}</span>
            <span>Schema: ${escapeHtml(item.schemaBehavior)}</span>
            <span>Action: ${escapeHtml(item.recommendedAction)}</span>
          </div>
        </button>
      `).join("")
    : `<p class="muted">No queue rows match this filter.</p>`;

  listRoot.querySelectorAll("[data-project-intelligence-queue-id]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProjectIntelligenceQueueId = button.dataset.projectIntelligenceQueueId || "";
      const row = queue.find((item) => item.id === activeProjectIntelligenceQueueId);
      if (row) {
        activeProjectIntelligenceSlug = row.projectSlug;
        activeProjectIntelligenceField = row.field;
      }
      renderProjectIntelligenceReview();
    });
  });

  titleRoot.textContent = selectedProjectRows.length
    ? `${selectedProject.name} · ${selectedProjectRows.length} queue items`
    : selectedProject.name;
  metaRoot.textContent = `${selectedProject.slug} · ${selectedProject.corridor} · ${selectedProject.conflictCount} review rows`;

  if (copyButton) {
    copyButton.onclick = async () => {
      if (!selected) return show({ ok: false, error: "Choose a queue item first." });
      await navigator.clipboard.writeText(buildProjectIntelligenceClipboard(selected, selectedProject, selectedProjectRows));
      show({ ok: true, copied: selected.id });
    };
  }


  const selectedProjectRowTable = selectedProjectRows.map((item) => `
    <tr class="${item.id === selected?.id ? "is-active" : ""} is-review">
      <td><span class="priority-pill priority-${item.priority}">${escapeHtml(item.priorityLabel)}</span></td>
      <td>${escapeHtml(item.fieldLabel)}</td>
      <td>${escapeHtml(item.reason)}</td>
      <td>${escapeHtml(item.publicValue || "—")}</td>
      <td>${escapeHtml(item.compareValue || "—")}</td>
      <td>${escapeHtml(item.sourceValue || "—")}</td>
      <td>${escapeHtml(item.currentWinner)}</td>
      <td>${escapeHtml(item.schemaBehavior)}</td>
      <td>${escapeHtml(item.recommendedAction)}</td>
    </tr>
  `).join("");

  const afr = activeFieldReview; // shorthand for template use

  detailRoot.innerHTML = `
    <section class="project-intelligence-summary-grid">
      <dl class="project-intelligence-meta-grid">
        <div><dt>Project</dt><dd>${escapeHtml(selectedProject.name)}</dd></div>
        <div><dt>Slug</dt><dd>${escapeHtml(selectedProject.slug)}</dd></div>
        <div><dt>Compare row</dt><dd>${selectedProject.hasCompareRow ? "Yes" : "No"}</dd></div>
        <div><dt>Source mapping</dt><dd>${selectedProject.hasSourceMapping ? "Yes" : "No"}</dd></div>
        <div><dt>Compare ID</dt><dd>${escapeHtml(selectedProject.compareDatabaseId || "—")}</dd></div>
        <div><dt>Source catalog IDs</dt><dd>${escapeHtml((selectedProject.sourceCatalogIds || []).join(", ") || "—")}</dd></div>
      </dl>
      <div class="project-intelligence-schema-box">
        <strong>Selected queue item</strong>
        ${selected ? `
          <div class="project-intelligence-legend">
            <p><span class="priority-pill priority-${selected.priority}">${escapeHtml(selected.priorityLabel)}</span> <strong>${escapeHtml(selected.fieldLabel)}</strong></p>
            <p class="muted">${escapeHtml(selected.reason)}</p>
            <p><strong>Current winner:</strong> ${escapeHtml(selected.currentWinner)}</p>
            <p><strong>Schema:</strong> ${escapeHtml(selected.schemaBehavior)} · <strong>Recommended:</strong> ${escapeHtml(selected.recommendedAction)}</p>
            ${selected.hasManualOverride ? `<p><span class="status-pill status-healthy">Manual override set</span></p>` : ""}
          </div>
        ` : `<p class="muted">Choose a queue item to inspect its current winner and recommended action.</p>`}
      </div>
    </section>
    <section class="project-intelligence-values">
      <div class="value-grid">
        <div><dt>Public value</dt><dd>${escapeHtml(afr?.publicValue || selected?.publicValue || "—")}</dd></div>
        <div><dt>Compare DB value</dt><dd>${escapeHtml(afr?.compareValue || selected?.compareValue || "—")}</dd></div>
        <div><dt>Source-catalog value</dt><dd>${escapeHtml(afr?.sourceValue || selected?.sourceValue || "—")}</dd></div>
        <div><dt>Resolver winner</dt><dd>${escapeHtml(afr?.currentWinner || selected?.currentWinner || "—")}</dd></div>
        <div><dt>Schema state</dt><dd>${escapeHtml(afr?.schemaState || selected?.schemaBehavior || "—")}</dd></div>
        ${afr?.overrideValue ? `<div class="pi-override-cell"><dt>Current override</dt><dd>${escapeHtml(afr.overrideValue)}</dd></div>` : ""}
      </div>
    </section>
    <table class="project-intelligence-table">
      <thead>
        <tr>
          <th>Priority</th><th>Field</th><th>Reason</th><th>Public</th><th>Compare</th><th>Source</th><th>Winner</th><th>Schema</th><th>Action</th>
        </tr>
      </thead>
      <tbody>${selectedProjectRowTable}</tbody>
    </table>

    <div class="pi-review-instruction">
      <strong>Resolve this field</strong>
      <p>Choose the value Brooke wants the site to trust. Overrides beat compare, source, and public values. Compare is preferred for buyer facts by default, but schema only emits fields marked schema safe.</p>
      ${afr ? `<p>Reviewing: <strong>${escapeHtml(afr.label || activeFieldKey)}</strong> — choose a source below, then click Save Manual Override.</p>` : `<p class="muted">Select a queue item on the left to begin reviewing a field.</p>`}
    </div>

    ${afr ? `
    <div class="pi-source-chooser">
      <div class="pi-source-option${afr.publicValue ? "" : " pi-no-value"}">
        <div class="pi-source-meta">
          <span class="pi-source-badge">Public site</span>
          <span class="pi-source-data">${afr.publicValue ? escapeHtml(afr.publicValue) : `<em class="muted">No value available</em>`}</span>
        </div>
        <button type="button" class="pi-approve-btn" data-pi-approve-source="public" data-pi-approve-value="${escapeHtml(afr.publicValue || "")}"${afr.publicValue ? "" : " disabled"}>Approve Public Value</button>
      </div>
      <div class="pi-source-option${afr.compareValue ? "" : " pi-no-value"}">
        <div class="pi-source-meta">
          <span class="pi-source-badge">Compare database</span>
          <span class="pi-source-data">${afr.compareValue ? escapeHtml(afr.compareValue) : `<em class="muted">No value available</em>`}</span>
        </div>
        <button type="button" class="pi-approve-btn" data-pi-approve-source="compare" data-pi-approve-value="${escapeHtml(afr.compareValue || "")}"${afr.compareValue ? "" : " disabled"}>Approve Compare Value</button>
      </div>
      <div class="pi-source-option${afr.sourceValue ? "" : " pi-no-value"}">
        <div class="pi-source-meta">
          <span class="pi-source-badge">Source catalog</span>
          <span class="pi-source-data">${afr.sourceValue ? escapeHtml(afr.sourceValue) : `<em class="muted">No value available</em>`}</span>
        </div>
        <button type="button" class="pi-approve-btn" data-pi-approve-source="source" data-pi-approve-value="${escapeHtml(afr.sourceValue || "")}"${afr.sourceValue ? "" : " disabled"}>Approve Source Value</button>
      </div>
      <div class="pi-source-option">
        <div class="pi-source-meta">
          <span class="pi-source-badge">Custom</span>
          <span class="pi-source-data muted">Type a Brooke-confirmed value</span>
        </div>
        <button type="button" class="pi-approve-btn" data-pi-approve-source="custom">Use Custom Value</button>
      </div>
    </div>
    ` : ""}

    <form id="projectFactOverrideForm" class="tool-panel project-intelligence-override">
      <div class="pi-selected-source-banner" id="piSelectedSourceBanner" hidden>
        Source selected: <strong id="piSelectedSourceLabel">—</strong>
      </div>
      <div class="grid">
        <label>Field
          <select name="field">
            ${(selectedProject.fieldReviews || []).map((fr) => `<option value="${escapeHtml(fr.field)}"${fr.field === activeFieldKey ? " selected" : ""}>${escapeHtml(fr.label)}</option>`).join("")}
          </select>
        </label>
        <label>Reviewed value
          <input name="value" placeholder="Select a source above to populate this field" readonly />
        </label>
        <label>Mark schema safe
          <select name="schemaSafe">
            <option value="false">No — do not emit in JSON-LD</option>
            <option value="true">Yes — safe to emit in JSON-LD</option>
          </select>
        </label>
        <label>Reviewed by<input name="reviewedBy" value="Brooke" /></label>
      </div>
      <div id="piCustomValueRow" class="pi-custom-value-row" hidden>
        <label>Custom value
          <input id="piCustomValueInput" type="text" placeholder="Enter Brooke-confirmed value" />
        </label>
      </div>
      <label>Review note<textarea name="note" placeholder="Why this value wins and what Brooke confirmed."></textarea></label>
      <input type="hidden" name="preferredFrom" value="" />
      ${afr?.overrideValue ? `
        <div class="pi-existing-override-note">
          <strong>Existing override:</strong> ${escapeHtml(afr.overrideValue)}
          <span class="muted"> — saving will replace this value</span>
        </div>
      ` : ""}
      <button class="primary" type="submit" id="piSaveBtn" disabled>Save Manual Override</button>
    </form>
  `;

  // Wire field selector: changing field updates the active field and re-renders source chooser
  const form = document.querySelector("#projectFactOverrideForm");
  if (form) {
    form.elements.field.addEventListener("change", () => {
      activeProjectIntelligenceField = form.elements.field.value;
      renderProjectIntelligenceReview();
    });

    // Wire value input: enable save button when a value is present
    form.elements.value.addEventListener("input", () => {
      const saveBtn = document.querySelector("#piSaveBtn");
      if (saveBtn) saveBtn.disabled = !form.elements.value.value.trim();
    });

    // Wire form submit
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const saveBtn = document.querySelector("#piSaveBtn");
      if (saveBtn) saveBtn.disabled = true;
      const payload = formPayload(form);
      payload.projectSlug = selectedProject.slug;
      show(await postJson("/api/project-fact-override", payload));
      await loadState();
      activeProjectIntelligenceSlug = selectedProject.slug;
      activeProjectIntelligenceField = payload.field;
      renderProjectIntelligenceReview();
    }, { once: true });
  }

  // Wire approve-source buttons
  detailRoot.querySelectorAll("[data-pi-approve-source]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const source = btn.dataset.piApproveSource;
      const value = btn.dataset.piApproveValue || "";
      const approveForm = document.querySelector("#projectFactOverrideForm");
      const banner = document.querySelector("#piSelectedSourceBanner");
      const sourceLabel = document.querySelector("#piSelectedSourceLabel");
      const customRow = document.querySelector("#piCustomValueRow");
      const customInput = document.querySelector("#piCustomValueInput");
      const saveBtn = document.querySelector("#piSaveBtn");
      if (!approveForm) return;

      if (source === "custom") {
        if (customRow) customRow.hidden = false;
        approveForm.elements.value.value = "";
        approveForm.elements.value.readOnly = false;
        approveForm.elements.value.placeholder = "Enter Brooke-confirmed value";
        if (customInput) { customInput.value = ""; customInput.focus(); }
        if (banner) banner.hidden = false;
        if (sourceLabel) sourceLabel.textContent = "Custom — type value below";
        if (saveBtn) saveBtn.disabled = true; // wait for user to type
      } else {
        if (customRow) customRow.hidden = true;
        approveForm.elements.value.value = value;
        approveForm.elements.value.readOnly = true;
        if (banner) banner.hidden = false;
        if (sourceLabel) sourceLabel.textContent = source === "public" ? "Public site" : source === "compare" ? "Compare database" : "Source catalog";
        if (saveBtn) saveBtn.disabled = !value;
      }
      approveForm.elements.preferredFrom.value = source;

      // Highlight active approve button
      detailRoot.querySelectorAll("[data-pi-approve-source]").forEach((b) => b.classList.remove("pi-approve-active"));
      btn.classList.add("pi-approve-active");
    });
  });

  // Wire custom value input → sync to reviewed-value field
  const customInput = detailRoot.querySelector("#piCustomValueInput");
  if (customInput) {
    customInput.addEventListener("input", () => {
      const approveForm = document.querySelector("#projectFactOverrideForm");
      const saveBtn = document.querySelector("#piSaveBtn");
      if (approveForm) {
        approveForm.elements.value.value = customInput.value;
        if (saveBtn) saveBtn.disabled = !customInput.value.trim();
      }
    });
  }
}

function renderFactUpdater() {
  const root = document.querySelector("#factUpdaterPanel");
  if (!root) return;
  const review = state?.projectIntelligence;
  if (!review?.projects?.length) {
    root.innerHTML = `<p class="muted">Project data not loaded yet. Click Refresh.</p>`;
    return;
  }

  const projects = review.projects;
  const slug = activeFactUpdaterSlug || projectSelect.value || projects[0]?.slug || "";
  const selectedProject = projects.find((p) => p.slug === slug) || projects[0];
  const fieldOptions = selectedProject?.fieldReviews || [];
  const field = activeFactUpdaterField || fieldOptions[0]?.field || "";
  const selectedField = fieldOptions.find((fr) => fr.field === field) || fieldOptions[0];

  root.innerHTML = `
    <div class="fact-updater-controls">
      <label>Building
        <select id="factUpdaterProject">
          ${projects.map((p) => `<option value="${escapeHtml(p.slug)}"${p.slug === selectedProject?.slug ? " selected" : ""}>${escapeHtml(p.name)}</option>`).join("")}
        </select>
      </label>
      <label>Field
        <select id="factUpdaterField">
          ${fieldOptions.map((fr) => `<option value="${escapeHtml(fr.field)}"${fr.field === selectedField?.field ? " selected" : ""}>${escapeHtml(fr.label)}</option>`).join("")}
        </select>
      </label>
    </div>

    ${selectedField ? `
      <div class="fact-updater-current">
        <strong>Current values — ${escapeHtml(selectedField.label)} · ${escapeHtml(selectedProject.name)}</strong>
        <div class="value-grid">
          <div><dt>Public site</dt><dd>${escapeHtml(selectedField.publicValue || "—")}</dd></div>
          <div><dt>Compare database</dt><dd>${escapeHtml(selectedField.compareValue || "—")}</dd></div>
          <div><dt>Source catalog</dt><dd>${escapeHtml(selectedField.sourceValue || "—")}</dd></div>
          <div><dt>Current winner</dt><dd>${escapeHtml(selectedField.currentWinner || "—")}</dd></div>
          <div><dt>Schema state</dt><dd>${escapeHtml(selectedField.schemaState || "—")}</dd></div>
          ${selectedField.overrideValue ? `<div class="pi-override-cell"><dt>Existing override</dt><dd>${escapeHtml(selectedField.overrideValue)}</dd></div>` : ""}
        </div>
      </div>

      <form id="factUpdaterForm" class="tool-panel project-intelligence-override">
        <p class="pi-review-instruction"><strong>Enter new Brooke-confirmed value</strong>
          <span>Type the correct value for <strong>${escapeHtml(selectedField.label)}</strong> on <strong>${escapeHtml(selectedProject.name)}</strong>. Leave a note explaining the source (e.g. developer email, site visit, updated listing).</span>
        </p>
        <div class="grid">
          <label>New confirmed value
            <input name="value" placeholder="Enter Brooke-confirmed value for ${escapeHtml(selectedField.label)}" />
          </label>
          <label>Mark schema safe
            <select name="schemaSafe">
              <option value="false">No — do not emit in JSON-LD</option>
              <option value="true">Yes — safe to emit in JSON-LD</option>
            </select>
          </label>
          <label>Reviewed by<input name="reviewedBy" value="Brooke" /></label>
        </div>
        <label>Review note
          <textarea name="note" placeholder="Source of this value — what Brooke confirmed and when (e.g. 'Confirmed via developer email 2026-06-18, 47 units announced')."></textarea>
        </label>
        <input type="hidden" name="preferredFrom" value="custom" />
        <input type="hidden" name="field" value="${escapeHtml(selectedField.field)}" />
        <button class="primary" type="submit" id="factUpdaterSave" disabled>Save Override for ${escapeHtml(selectedField.label)}</button>
      </form>
    ` : `<p class="muted">No fields available for this project.</p>`}
  `;

  // Wire building selector
  document.querySelector("#factUpdaterProject")?.addEventListener("change", (e) => {
    activeFactUpdaterSlug = e.target.value;
    activeFactUpdaterField = ""; // reset field when project changes
    renderFactUpdater();
  });

  // Wire field selector
  document.querySelector("#factUpdaterField")?.addEventListener("change", (e) => {
    activeFactUpdaterField = e.target.value;
    renderFactUpdater();
  });

  // Wire value input → enable save button
  const form = document.querySelector("#factUpdaterForm");
  if (form) {
    form.elements.value.addEventListener("input", () => {
      const saveBtn = document.querySelector("#factUpdaterSave");
      if (saveBtn) saveBtn.disabled = !form.elements.value.value.trim();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const saveBtn = document.querySelector("#factUpdaterSave");
      if (saveBtn) saveBtn.disabled = true;
      const payload = formPayload(form);
      payload.projectSlug = selectedProject.slug;
      show(await postJson("/api/project-fact-override", payload));
      await loadState();
      activeFactUpdaterSlug = selectedProject.slug;
      activeFactUpdaterField = selectedField.field;
      renderFactUpdater();
      renderProjectIntelligenceReview(); // keep PI queue in sync
    }, { once: true });
  }
}

function renderProjectIntelligenceFilters(root, review, activeFilter) {
  const filters = [
    { key: "all", label: "All" },
    { key: "priority-1", label: "Priority 1 only" },
    { key: "schema-impacting", label: "Schema-impacting" },
    { key: "buyer-facing", label: "Buyer-facing" },
    { key: "missing-compare-row", label: "Missing compare row" },
    { key: "missing-source-mapping", label: "Missing source mapping" },
    { key: "has-manual-override", label: "Has manual override" },
    { key: "needs-brooke-review", label: "Needs Brooke review" },
  ];
  root.innerHTML = filters.map((item) => {
    const value = filterCountForQueue(review.queueRows || [], item.key);
    return `<button type="button" class="${item.key === activeFilter ? "active" : ""}" data-project-intelligence-filter="${escapeHtml(item.key)}">${escapeHtml(item.label)}${value !== undefined ? ` (${escapeHtml(String(value))})` : ""}</button>`;
  }).join("");
  root.querySelectorAll("[data-project-intelligence-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProjectIntelligenceFilter = button.dataset.projectIntelligenceFilter || "all";
      activeProjectIntelligenceQueueId = "";
      renderProjectIntelligenceReview();
    });
  });
}

function renderProjectIntelligencePolicy(root) {
  root.innerHTML = `
    <strong>Review rules</strong>
    <ul>
      <li>Overrides beat compare, source, and public values.</li>
      <li>Compare is the preferred buyer-fact source unless Brooke changes it with a manual override.</li>
      <li>JSON-LD only emits fields that are safe or manually reviewed as safe.</li>
      <li>Conflicts remain visible after overrides so Brooke can still audit the choice.</li>
    </ul>
  `;
}

function findSelectedQueueRow(visibleRows, allRows) {
  return allRows.find((item) => item.id === activeProjectIntelligenceQueueId)
    || visibleRows.find((item) => item.projectSlug === activeProjectIntelligenceSlug && item.field === activeProjectIntelligenceField)
    || visibleRows.find((item) => item.projectSlug === activeProjectIntelligenceSlug)
    || visibleRows[0]
    || allRows[0];
}

function filterProjectIntelligenceRows(rows, filter) {
  switch (filter) {
    case "priority-1":
      return rows.filter((row) => row.priority === 1);
    case "schema-impacting":
      return rows.filter((row) => row.priority === 1);
    case "buyer-facing":
      return rows.filter((row) => row.priority === 2);
    case "missing-compare-row":
      return rows.filter((row) => row.issueKind === "missing-compare-row");
    case "missing-source-mapping":
      return rows.filter((row) => row.issueKind === "missing-source-mapping");
    case "has-manual-override":
      return rows.filter((row) => row.hasManualOverride);
    case "needs-brooke-review":
      return rows.filter((row) => row.priority <= 3);
    default:
      // "all" excludes already-overridden items — those live under "Has manual override"
      return rows.filter((row) => !row.hasManualOverride);
  }
}

function filterCountForQueue(rows, filter) {
  return filterProjectIntelligenceRows(rows, filter).length;
}

async function exportProjectIntelligenceReview(format) {
  const review = state?.projectIntelligence;
  if (!review) return;
  const rows = filterProjectIntelligenceRows(review.queueRows || [], activeProjectIntelligenceFilter || "all");
  const payload = buildProjectIntelligenceExport(rows, review, format);
  await navigator.clipboard.writeText(payload);
  show({ ok: true, copied: `${format} export` });
}

function buildProjectIntelligenceClipboard(selected, project, projectRows) {
  const lines = [
    `# ${project.name}`,
    `- Slug: ${project.slug}`,
    `- Corridor: ${project.corridor}`,
    `- Selected priority: ${selected.priorityLabel}`,
    `- Selected field: ${selected.fieldLabel}`,
    `- Reason: ${selected.reason}`,
    "",
    "| Priority | Field | Public | Compare | Source | Winner | Schema | Action |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...projectRows.map((row) => `| ${[row.priorityLabel, row.fieldLabel, row.publicValue || "—", row.compareValue || "—", row.sourceValue || "—", row.currentWinner, row.schemaBehavior, row.recommendedAction].map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")} |`),
  ];
  return lines.join("\n");
}

function buildProjectIntelligenceExport(rows, review, format) {
  const headers = ["priority", "project", "slug", "field", "public value", "compare value", "source value", "schema behavior", "recommended action"];
  if (format === "json") {
    return JSON.stringify({
      updatedAt: review.updatedAt,
      summary: review.queueSummary,
      items: rows.map((row) => ({
        priority: row.priorityLabel,
        project: row.projectName,
        slug: row.projectSlug,
        field: row.fieldLabel,
        publicValue: row.publicValue,
        compareValue: row.compareValue,
        sourceValue: row.sourceValue,
        currentWinner: row.currentWinner,
        schemaBehavior: row.schemaBehavior,
        recommendedAction: row.recommendedAction,
        reason: row.reason,
      })),
    }, null, 2);
  }
  if (format === "markdown") {
    return [
      "| " + headers.map((header) => header.replace(/\|/g, "\\|")).join(" | ") + " |",
      "| " + headers.map(() => "---").join(" | ") + " |",
      ...rows.map((row) => [
        row.priorityLabel,
        row.projectName,
        row.projectSlug,
        row.fieldLabel,
        row.publicValue || "—",
        row.compareValue || "—",
        row.sourceValue || "—",
        row.schemaBehavior,
        row.recommendedAction,
      ].map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")),
    ].map((line) => line.startsWith("|") ? line : `| ${line} |`).join("\n");
  }
  return [
    headers.join(","),
    ...rows.map((row) => [
      row.priorityLabel,
      row.projectName,
      row.projectSlug,
      row.fieldLabel,
      row.publicValue || "—",
      row.compareValue || "—",
      row.sourceValue || "—",
      row.schemaBehavior,
      row.recommendedAction,
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
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
let amCurrentBodyImages = [];
let amPreviewReadyInSession = false;
let amCurrentNewsletterHeadline = "";
let amCurrentBuyerTakeaway = "";

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
  document.querySelector("#amAddSection")?.addEventListener("click", () => {
    amAddSectionBlock();
    amResetPreviewReady();
    amRenderPublishQuality();
  });

  // Recompute quality gate on form changes; reset preview on content changes
  const amForm = document.querySelector("#amArticleForm");
  if (amForm) {
    amForm.addEventListener("input", (event) => {
      const target = event.target;
      const id = target.id || "";
      const name = target.name || "";
      // Recompute gate on any input
      amRenderPublishQuality();
      // Reset preview on content field changes (skip confirmation checkboxes)
      if (amPreviewReadyInSession && !["amConfirmPublish", "amConfirmDeploy", "amConfirmRemote"].includes(id)) {
        amResetPreviewReady();
      }
    });
    amForm.addEventListener("change", (event) => {
      const target = event.target;
      const id = target.id || "";
      amRenderPublishQuality();
      if (amPreviewReadyInSession && !["amConfirmPublish", "amConfirmDeploy", "amConfirmRemote"].includes(id)) {
        amResetPreviewReady();
      }
    });
  }

  // Action buttons
  document.querySelector("#amSaveDraftBtn")?.addEventListener("click", () => amSaveDraft());
  document.querySelector("#amPreviewBtn")?.addEventListener("click", () => amPublish("preview"));
  document.querySelector("#amPreviewInSiteBtn")?.addEventListener("click", () => amPreviewInSite());
  document.querySelector("#amStageBtn")?.addEventListener("click", () => amPublish("stage"));
  document.querySelector("#amCommitStagedBtn")?.addEventListener("click", () => amCommitStaged());
  document.querySelector("#amPublishBtn")?.addEventListener("click", () => amPublish("publish"));
  document.querySelector("#amShipBtn")?.addEventListener("click", () => amPublishLive());

  // New Article tab: open blank editor
  document.querySelector("[data-am-tab='new']")?.addEventListener("click", () => amOpenNewEditor());

  // Import Package tab
  document.querySelector("[data-am-tab='import']")?.addEventListener("click", () => amInitImportPanel());
  document.querySelector("#amImportBackBtn")?.addEventListener("click", () => amSetTab("list"));
  document.querySelector("#amImportValidateBtn")?.addEventListener("click", () => amValidateImport());
  document.querySelector("#amImportCreateDraftBtn")?.addEventListener("click", () => amCreateImportDraft());
  document.querySelector("#amImportClearBtn")?.addEventListener("click", () => amClearImport());
  document.querySelector("#amImportAddInlineBtn")?.addEventListener("click", () => amAddInlineImageSlot());
  document.querySelector("#amTemplateNews")?.addEventListener("click", () => amDownloadTemplate("news"));
  document.querySelector("#amTemplateDowntown")?.addEventListener("click", () => amDownloadTemplate("downtown"));
  document.querySelector("#amTemplateDevWatch")?.addEventListener("click", () => amDownloadTemplate("devwatch"));
  document.querySelector("#amTemplateBuyer")?.addEventListener("click", () => amDownloadTemplate("buyer"));
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
  el.querySelectorAll("[data-am-delete-published]").forEach((btn) => {
    btn.addEventListener("click", () => amConfirmDeletePublished(btn));
  });
  el.querySelectorAll("[data-am-delete-draft]").forEach((btn) => {
    btn.addEventListener("click", () => amConfirmDeleteDraft(btn));
  });
}

function amRenderArticleRow(a) {
  const statusClass = {
    published: "status-published",
    draft: "status-draft",
    archived: "status-not-run-yet",
    needs_review: "status-warning",
    "needs-review": "status-warning",
    "ready-for-review": "status-warning",
    "needs-refresh": "status-warning",
  }[a.status] || "status-not-run-yet";
  const destLabel = { news: "News", buyer: "Buyer Intelligence", downtown: "Downtown Spotlight" }[a.destination] || a.destination;
  const thumbHtml = a.imagePath
    ? `<img class="am-row-thumb" src="${escapeHtml(a.imagePath)}" alt="" onerror="this.style.display='none'" />`
    : `<span class="am-row-thumb-placeholder"></span>`;
  const editDataAttr = a.isDraft
    ? `data-am-edit="${escapeHtml(a.id)}" data-dest="${escapeHtml(a.destination)}" data-draft-id="${escapeHtml(a.draftId || "")}"`
    : `data-am-edit="${escapeHtml(a.id)}" data-dest="${escapeHtml(a.destination)}"`;
  const archiveBtn = (!a.isDraft && a.status === "published")
    ? `<button class="am-row-action am-danger-action" data-am-delete-published="${escapeHtml(a.id)}" data-dest="${escapeHtml(a.destination)}" type="button">Delete</button>`
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
  document.querySelector("#amEditorLabel").textContent = {
    news: "Edit News Update",
    buyer: "Edit Buyer Intelligence",
    downtown: "Edit Downtown Spotlight",
  }[data.article.destination] || "Edit Article";
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
  amRenderPublishQuality();
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
  amCurrentBodyImages = [];
  amCurrentNewsletterHeadline = "";
  amCurrentBuyerTakeaway = "";
  amResetPreviewReady();
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
  set("amBuyerTakeaway", article.buyerTakeaway || "");
  set("amMarketSignal", article.marketSignal || "");
  set("amBestFor", article.bestFor || "");
  set("amWatchPoints", article.watchPoints || "");
  set("amBuyerQuestions", article.buyerQuestions || "");
  set("amRelatedCorridor", article.relatedCorridor || "");
  set("amRelatedNeighborhoods", (article.relatedNeighborhoods || []).join(", "));
  set("amRelatedBuildings", (article.relatedBuildings || []).join(", "));
  set("amCommitMessage", "");
  set("amHeroAlt", article.heroAlt || "");
  set("amHeroCredit", article.heroCredit || "");
  set("amHeroCaption", article.heroCaption || "");
  amCurrentNewsletterHeadline = article.newsletterHeadline || "";
  amCurrentBuyerTakeaway = article.buyerTakeaway || "";
  amResetPreviewReady();

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
  amCurrentBodyImages = article.bodyImages || [];

  // Body sections
  const container = document.querySelector("#amSectionsContainer");
  if (container) {
    container.innerHTML = "";
    const sections = article.bodySections || [];
    sections.forEach((section) => amAddSectionBlock(section));
    if (sections.length === 0) amAddSectionBlock();
  }
  amRenderPublishQuality();
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
    <label>Bullets <span class="am-optional">(one per line)</span>
      <textarea class="am-section-bullets" placeholder="Optional bullet list, one item per line.">${escapeHtml((opts.bullets || []).join("\n"))}</textarea>
    </label>
    <details class="am-section-image-wrap"${opts.imageKey || opts.image ? " open" : ""}>
      <summary>Attach image to this section</summary>
      <div class="am-section-image-fields">
        <div class="am-section-img-preview-wrap">
          <img class="am-section-img" src="${escapeHtml(opts.image || "")}" alt=""${opts.image ? "" : " hidden"} />
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
    const bullets = block.querySelector(".am-section-bullets")?.value || "";
    if ((heading || body || bullets) && !window.confirm("Remove this section? Its content will be lost.")) return;
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
    buyerTakeaway: val("amBuyerTakeaway"),
    marketSignal: val("amMarketSignal"),
    bestFor: val("amBestFor"),
    watchPoints: val("amWatchPoints"),
    buyerQuestions: val("amBuyerQuestions"),
    relatedCorridor: val("amRelatedCorridor"),
    relatedNeighborhoods: val("amRelatedNeighborhoods"),
    relatedBuildings: val("amRelatedBuildings"),
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
    const bullets = (block.querySelector(".am-section-bullets")?.value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!heading && !body && bullets.length === 0) continue;

    const imageFile = block.querySelector(".am-section-image-file")?.files?.[0];
    const imageKey = block.querySelector(".am-section-image-key")?.value?.trim() || (imageFile ? `image${imgIndex}` : "");
    const imageAlt = block.querySelector(".am-section-image-alt")?.value?.trim() || "";
    const imageCaption = block.querySelector(".am-section-image-caption")?.value?.trim() || "";
    const imageCredit = block.querySelector(".am-section-image-credit")?.value?.trim() || "";

    const section = { heading, body };
    if (imageKey) section.imageKey = imageKey;
    if (bullets.length) section.bullets = bullets;
    bodySections.push(section);

    if (imageFile) {
      const img = await imagePayload(imageFile, { key: imageKey, alt: imageAlt, caption: imageCaption, credit: imageCredit });
      if (img) bodyImages.push(img);
      imgIndex++;
    } else if (imageKey) {
      const existing = (amCurrentBodyImages || []).find((img) => img.key === imageKey);
      if (existing) bodyImages.push(existing);
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
    amMarkPreviewReady();
    amSetSaveStatus("Preview in Site opened. Vite dev server must be running (npm run dev).", true);
    window.open(result.previewUrl, "_blank");
  } else {
    amSetSaveStatus(`Preview in Site failed: ${result.error || "see result panel"}`, false);
    show(result);
  }
}

async function amPublish(mode, options = {}) {
  const payload = await amBuildPayload();
  if (!payload) return;
  if (!payload.title) { amSetSaveStatus("Title is required.", false); return; }
  if (!payload.deck) { amSetSaveStatus("Deck is required.", false); return; }
  payload.mode = mode;
  if (options.triggerDeploy) payload.triggerDeploy = true;
  const endpoint = mode === "preview" ? "/api/article/preview" : "/api/article/publish";
  amSetSaveStatus(`Running ${mode}…`, null);
  show({ ok: true, running: `Running ${mode} for article workflow.` });
  const result = await postJson(endpoint, payload);
  show(result);
  if (result.ok) {
    if (result.deployTriggered === true) {
      const runLink = result.deployRunUrl ? `<a href="${escapeHtml(result.deployRunUrl)}" target="_blank" rel="noopener">GitHub Actions run ${escapeHtml(String(result.deployRunId || ""))}</a>` : "GitHub Actions run queued";
      amSetSaveStatusHtml(`Published & deploy triggered. ${runLink}`, true);
    } else if (result.deployTriggered === false) {
      amSetSaveStatus("Published, but deploy trigger failed. See result panel.", false);
    } else {
      amSetSaveStatus(`${mode} complete`, true);
    }
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

async function amPublishLive() {
  const quality = amEvaluatePublishQuality();
  if (amHasBlockingPublishQualityIssues(quality)) {
    amRenderPublishQuality(quality);
    const blocking = quality.filter((q) => q.level === "fail");
    amSetSaveStatus(`Publish blocked: ${blocking.map((b) => b.label).join("; ")}`, false);
    return;
  }
  if (!document.querySelector("#amConfirmPublish")?.checked) {
    amSetSaveStatus("Check the Publish confirmation box before Publish Live.", false);
    return;
  }
  if (!document.querySelector("#amConfirmDeploy")?.checked) {
    amSetSaveStatus("Check the Deploy confirmation box before Publish Live.", false);
    return;
  }
  return amPublish("publish", { triggerDeploy: true });
}

function amMarkPreviewReady() {
  amPreviewReadyInSession = true;
  amRenderPublishQuality();
}

function amResetPreviewReady() {
  amPreviewReadyInSession = false;
  amRenderPublishQuality();
}

function amEvaluatePublishQuality() {
  const val = (id) => document.querySelector(`#${id}`)?.value?.trim() || "";
  const checked = (id) => document.querySelector(`#${id}`)?.checked === true;
  const hasHeroFile = Boolean(document.querySelector("#amHeroFile")?.files?.[0]);
  const hasHeroImage = hasHeroFile || Boolean(amCurrentHeroImage) || Boolean(amCurrentImagePath);

  const sectionBlocks = document.querySelectorAll("#amSectionsContainer .am-section-block");
  let hasBodyContent = false;
  let hasInlineBodyImage = false;
  for (const block of sectionBlocks) {
    const heading = block.querySelector(".am-section-heading")?.value?.trim() || "";
    const body = block.querySelector(".am-section-body")?.value?.trim() || "";
    const bullets = block.querySelector(".am-section-bullets")?.value?.trim() || "";
    if (heading || body || bullets) hasBodyContent = true;
    const imageKey = block.querySelector(".am-section-image-key")?.value?.trim() || "";
    const imageFile = block.querySelector(".am-section-image-file")?.files?.[0];
    if (imageKey || imageFile) hasInlineBodyImage = true;
  }

  const relatedProjects = val("amRelatedProjects");
  const relatedCorridors = val("amRelatedCorridors");
  const relatedNeighborhoods = val("amRelatedNeighborhoods");
  const relatedBuildings = val("amRelatedBuildings");
  const relatedCorridor = val("amRelatedCorridor");
  const hasRelated = Boolean(relatedProjects) || Boolean(relatedCorridors) || Boolean(relatedNeighborhoods) || Boolean(relatedBuildings) || Boolean(relatedCorridor);
  const hasNewsletterHeadline = Boolean(amCurrentNewsletterHeadline);
  const hasSourceDate = Boolean(val("amSourceDate"));
  const hasBuyerContext = Boolean(val("amWhyItMatters")) || Boolean(val("amBuyerContext")) || Boolean(val("amBuyerTakeaway")) || Boolean(val("amMarketSignal")) || Boolean(val("amBestFor")) || Boolean(val("amWatchPoints")) || Boolean(val("amBuyerQuestions"));

  return [
    { label: "Title", hint: "Add a headline.", level: val("amTitle") ? "pass" : "fail" },
    { label: "Deck", hint: "Add a buyer-facing deck.", level: val("amDeck") ? "pass" : "fail" },
    { label: "Slug", hint: "Add a slug or fill the title to auto-generate.", level: val("amSlug") ? "pass" : "fail" },
    { label: "Description", hint: "Deck also serves as the SEO description.", level: val("amDeck") ? "pass" : "fail" },
    { label: "Source URL", hint: "Add a source URL.", level: val("amSourceUrl") ? "pass" : "fail" },
    { label: "Hero image", hint: "Upload a hero image or the draft must have an existing image path.", level: hasHeroImage ? "pass" : "fail" },
    { label: "Body content", hint: "Add at least one section with a heading or body text.", level: hasBodyContent ? "pass" : "fail" },
    { label: "Preview in Site", hint: "Run Preview in Site during this editor session.", level: amPreviewReadyInSession ? "pass" : "fail" },
    { label: "Publish confirmation", hint: "Check the Publish confirmation box.", level: checked("amConfirmPublish") ? "pass" : "fail" },
    { label: "Deploy confirmation", hint: "Check the Deploy confirmation box.", level: checked("amConfirmDeploy") ? "pass" : "fail" },
    { label: "Inline body images", hint: "Consider adding inline images for richer articles.", level: hasInlineBodyImage ? "pass" : "warn" },
    { label: "Newsletter headline", hint: "Consider adding a newsletter headline.", level: hasNewsletterHeadline ? "pass" : "warn" },
    { label: "Related projects / corridors", hint: "Consider adding related projects, corridors, neighborhoods, or buildings.", level: hasRelated ? "pass" : "warn" },
    { label: "Source published date", hint: "Consider adding the source published date.", level: hasSourceDate ? "pass" : "warn" },
    { label: "Buyer context / why it matters", hint: "Consider adding buyer context, why it matters, or buyer takeaway.", level: hasBuyerContext ? "pass" : "warn" },
  ];
}

function amHasBlockingPublishQualityIssues(quality) {
  const requiredLabels = new Set(["Title", "Deck", "Slug", "Description", "Source URL", "Hero image", "Body content", "Preview in Site", "Publish confirmation", "Deploy confirmation"]);
  return quality.some((q) => requiredLabels.has(q.label) && q.level === "fail");
}

function amRenderPublishQuality(quality) {
  const container = document.querySelector("#amQualityGate");
  const summary = document.querySelector("#amQualitySummary");
  if (!container) return;
  const items = quality || amEvaluatePublishQuality();
  const blocking = items.filter((q) => q.level === "fail");
  const warnings = items.filter((q) => q.level === "warn");

  const icon = (level) => {
    if (level === "pass") return "✓";
    if (level === "warn") return "!";
    return "✕";
  };

  const rows = items.map((q) => `
    <div class="am-quality-row am-q-${q.level}">
      <span class="am-quality-icon">${icon(q.level)}</span>
      <div>
        <div class="am-quality-label">${escapeHtml(q.label)}</div>
        ${q.level !== "pass" ? `<div class="am-quality-hint">${escapeHtml(q.hint)}</div>` : ""}
      </div>
    </div>
  `).join("");

  container.innerHTML = rows;

  if (summary) {
    if (blocking.length > 0) {
      summary.textContent = `${blocking.length} required item(s) blocking publish: ${blocking.map((b) => b.label).join(", ")}`;
      summary.className = "am-quality-summary am-status-error";
    } else if (warnings.length > 0) {
      summary.textContent = `All required checks pass. ${warnings.length} recommendation(s).`;
      summary.className = "am-quality-summary am-status-ok";
    } else {
      summary.textContent = "All checks pass. Ready to publish.";
      summary.className = "am-quality-summary am-status-ok";
    }
  }
}

function amSetSaveStatus(message, ok) {
  const el = document.querySelector("#amSaveStatus");
  if (!el) return;
  el.textContent = message;
  el.className = "am-save-status" + (ok === true ? " am-status-ok" : ok === false ? " am-status-error" : "");
}

function amSetSaveStatusHtml(message, ok) {
  const el = document.querySelector("#amSaveStatus");
  if (!el) return;
  el.innerHTML = message;
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
      const note = result.deployNote || (result.deployed ? "Committed, pushed, deploying…" : "Archived locally");
      amSetSaveStatus(`Archived · ${note}`, true);
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

function amConfirmDeletePublished(btn) {
  const id = btn.dataset.amDeletePublished;
  const dest = btn.dataset.dest;
  const row = btn.closest(".am-article-row");
  if (!row) return;
  const existing = row.querySelector(".am-inline-confirm");
  if (existing) { existing.remove(); return; }
  const confirm = document.createElement("div");
  confirm.className = "am-inline-confirm";
  const destNote = (dest === "news")
    ? "This news article will be permanently removed."
    : "This article will be archived and hidden from the site.";
  confirm.innerHTML = `<span>${escapeHtml(destNote)}</span>
    <button type="button" class="am-confirm-yes">Delete</button>
    <button type="button" class="am-confirm-cancel">Cancel</button>`;
  row.querySelector(".am-row-actions")?.appendChild(confirm);
  confirm.querySelector(".am-confirm-cancel")?.addEventListener("click", () => confirm.remove());
  confirm.querySelector(".am-confirm-yes")?.addEventListener("click", async () => {
    confirm.innerHTML = "<span>Deleting…</span>";
    const result = await postJson("/api/article/delete", {
      id,
      destination: dest,
      confirmDelete: true,
      confirmRemote: state?.remote?.isRemote === true,
    });
    show(result);
    if (result.ok) {
      const note = result.deployNote || (result.deployed ? "Committed, pushed, deploying…" : "Deleted locally");
      amSetSaveStatus(`Deleted · ${note}`, true);
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

function amGatherImageMetadata(pkg) {
  const images = {};
  const heroFile = document.querySelector("#amImportHeroFile")?.files?.[0];
  if (heroFile) {
    const heroKey = String(pkg?.heroImage?.uploadKey || "").trim() || "hero";
    images[heroKey] = { key: heroKey, fileName: heroFile.name, type: heroFile.type, size: heroFile.size };
  }
  const inlineInputs = document.querySelectorAll(".am-import-inline-file");
  for (const input of inlineInputs) {
    const file = input.files?.[0];
    if (!file) continue;
    const uploadKey = String(input.dataset.uploadKey || "").trim() || input.dataset.uploadKey;
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
  return { package: pkg, images: amGatherImageMetadata(pkg) };
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
    const heroKey = String(pkg?.heroImage?.uploadKey || "").trim() || "hero";
    images[heroKey] = await imagePayload(heroFile, { key: heroKey });
  }

  // Inline images
  const inlineInputs = document.querySelectorAll(".am-import-inline-file");
  for (const input of inlineInputs) {
    const file = input.files?.[0];
    if (!file) continue;
    const uploadKey = String(input.dataset.uploadKey || "").trim() || input.dataset.uploadKey;
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

  let hasErrors = true;
  let validationPassed = false;

  try {
    const payload = await amBuildValidationPayload();
    if (payload.error) {
      amRenderValidation([payload.error], []);
      amSetImportStatus("Validation failed", false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let result;
    try {
      const response = await fetch("/api/article/import-package/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      result = await response.json();
    } catch (err) {
      if (err.name === "AbortError") {
        amRenderValidation(["Validation timed out after 15 seconds. The server may be busy or the package is too large."], []);
      } else {
        amRenderValidation([`Validation request failed: ${err.message || "unknown error"}`], []);
      }
      amSetImportStatus("Validation failed", false);
      return;
    } finally {
      clearTimeout(timeoutId);
    }

    const clientWarnings = amImageSizeWarnings(payload.images);
    const allWarnings = [...(result.warnings || []), ...clientWarnings];
    amRenderValidation(result.errors || [], allWarnings);
    hasErrors = (result.errors || []).length > 0;
    validationPassed = !hasErrors;
    amSetImportStatus(hasErrors ? "Validation failed — fix errors before creating draft" : "Package validation passed.", validationPassed);
  } catch (err) {
    amRenderValidation([`Unexpected error during validation: ${err.message || "unknown error"}`], []);
    amSetImportStatus("Validation failed", false);
    hasErrors = true;
    validationPassed = false;
  } finally {
    validateBtn.disabled = false;
    createBtn.disabled = !validationPassed;
  }
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
    <div class="am-import-inline-row">
      <label>Inline image 3
        <input class="am-import-inline-file" type="file" accept="image/*" data-upload-key="image_3" />
      </label>
      <div class="am-import-inline-preview" hidden></div>
    </div>
    <div class="am-import-inline-row">
      <label>Inline image 4
        <input class="am-import-inline-file" type="file" accept="image/*" data-upload-key="image_4" />
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

function amDownloadTemplate(type) {
  const today = new Date().toISOString().slice(0, 10);
  const base = {
    destination: "news",
    category: "general",
    id: `template-${type}-${Date.now()}`,
    slug: `template-${type}-${today}`,
    title: "Template Article",
    deck: "Short buyer-facing deck / subheadline.",
    description: "SEO/meta description.",
    summary: "Short summary.",
    eventDate: today,
    freshnessLane: "breaking_14d",
    neighborhoods: ["Downtown West Palm Beach", "Palm Beach"],
    projects: ["Project Name"],
    relatedProjects: [],
    relatedCorridors: [],
    relatedNeighborhoods: [],
    relatedBuildings: [],
    tags: ["development", "new construction"],
    sourceName: "Publisher Name",
    sourceUrl: "https://example.com/source",
    sourcePublishedDate: today,
    whyItMatters: "",
    buyerContext: "",
    commitMessage: "",
    heroImage: { uploadKey: "hero", alt: "Alt text for hero image", caption: "Optional hero caption", credit: "" },
    images: [
      { uploadKey: "image_1", placementId: "inline-image-1", alt: "Alt text for inline image 1", caption: "Optional inline image 1 caption", credit: "" },
      { uploadKey: "image_2", placementId: "inline-image-2", alt: "Alt text for inline image 2", caption: "Optional inline image 2 caption", credit: "" },
      { uploadKey: "image_3", placementId: "inline-image-3", alt: "Alt text for inline image 3", caption: "Optional inline image 3 caption", credit: "" },
      { uploadKey: "image_4", placementId: "inline-image-4", alt: "Alt text for inline image 4", caption: "Optional inline image 4 caption", credit: "" },
    ],
    body: {
      intro: "Opening article intro.",
      sections: [
        { heading: "Section Heading", paragraphs: ["Paragraph one.", "Paragraph two."] },
        { heading: "Section With Image 1", paragraphs: ["Paragraph before image."], imagePlacement: "inline-image-1" },
        { heading: "Section With Image 2", paragraphs: ["Paragraph before image."], imagePlacement: "inline-image-2" },
        { heading: "Section With Image 3", paragraphs: ["Paragraph before image."], imagePlacement: "inline-image-3" },
        { heading: "Section With Image 4", paragraphs: ["Paragraph before image."], imagePlacement: "inline-image-4" },
      ],
    },
    sources: [{ title: "Source title", publisher: "Publisher Name", url: "https://example.com/source", publishedDate: today }],
    buyerTakeaway: "",
    marketSignal: "",
    bestFor: "",
    watchPoints: "",
    buyerQuestions: "",
    relatedCorridor: "",
    newsletterHeadline: "Optional newsletter headline",
    query: "Optional research/query string",
    siteContext: {
      relationshipGuidance: {
        corridors: {
          downtown: "CityPlace, Clematis, Flagler waterfront, Nora, downtown office/hospitality/residential core.",
          "north-flagler": "Currie Park, Northwood, Olara, Shorecrest, Ritz-Carlton Residences West Palm Beach, waterfront redevelopment north of downtown.",
          "south-flagler": "South Flagler House, La Clara, Forte, Mr. C, luxury waterfront condo corridor south of downtown.",
        },
        projectTagRule: "Tag projects only when they are directly mentioned, physically nearby, competitively relevant, or materially affected by the story. Do not tag every luxury project just because it is nearby.",
        buyerContextRule: "Explain why the story matters to a buyer in practical terms: lifestyle, walkability, neighborhood maturity, public/private amenities, pricing power, inventory, resale demand, timing, risk, construction/development momentum.",
      },
    },
  };

  const templates = {
    news: {
      ...base,
      destination: "news",
      title: "News Update Template",
      tags: ["development", "new construction"],
      newsletterHeadline: "News Update: what changed this week",
      whyItMatters: "Explain why this story is relevant to the site's overall market narrative, not just one buyer.",
      buyerContext: "Explain practical buyer impact: lifestyle, walkability, neighborhood maturity, amenities, pricing power, inventory, resale demand, timing, risk, or construction momentum. Do not write generic hype.",
    },
    downtown: {
      ...base,
      destination: "downtown",
      category: "general",
      title: "Downtown Spotlight Template",
      tags: ["Downtown Spotlight", "city"],
      newsletterHeadline: "Downtown Spotlight: what buyers should know",
      whyItMatters: "Explain why this downtown story matters to buyers comparing buildings in the urban core.",
      buyerContext: "Explain practical buyer impact for downtown shoppers: walkability, transit, dining, entertainment, office conversion timing, or residential inventory.",
    },
    devwatch: {
      ...base,
      destination: "news",
      category: "development",
      title: "Development Watch Template",
      tags: ["development", "planning", "construction"],
      newsletterHeadline: "Development Watch: project movement",
      whyItMatters: "Explain why this development or planning update changes the buyer landscape for West Palm Beach.",
      buyerContext: "Explain what buyers should watch: permitting timelines, construction starts, delivery dates, and how those affect inventory and pricing power.",
    },
    buyer: {
      ...base,
      destination: "buyer",
      category: "general",
      title: "Buyer Intelligence Draft Template",
      tags: ["Buyer Intelligence", "sales", "financing"],
      newsletterHeadline: "Buyer Intelligence: market note for active shoppers",
      whyItMatters: "Explain why this story is relevant to the site's overall market narrative, not just one buyer. Example: This is the first confirmed waterfront dining operator on North Flagler, filling a gap that buyers have consistently raised during building comparisons.",
      buyerContext: "Explain practical buyer impact: lifestyle, walkability, neighborhood maturity, amenities, pricing power, inventory, resale demand, timing, risk, or construction momentum. Do not write generic hype.",
      buyerTakeaway: "Write one sentence that captures what a buyer should actually do or know after reading this. Example: If you are comparing Olara and Shorecrest, the new Currie Park restaurant operator changes the evening amenity balance on North Flagler.",
      marketSignal: "Describe what changed in the market, the policy, or the project pipeline, and why it matters now rather than later. Example: West Palm Beach is selecting an operator for Currie Park, which would be the first waterfront restaurant on this stretch of North Flagler.",
      bestFor: "List the buyer profiles this insight serves. Example: Full-time residents comparing North Flagler buildings; relocation buyers who want walkable dining; investors tracking neighborhood maturity.",
      watchPoints: "Add timelines, risks, or verification steps buyers should track. Example: Operator selection timeline is summer 2026; park construction is ongoing; verify opening date before using this as a timing signal in a purchase decision.",
      relatedBuildings: ["olara", "shorecrest", "ritz-carlton-residences-west-palm-beach"],
      relatedNeighborhoods: ["North Flagler", "Currie Park"],
      relatedCorridor: "north-flagler",
      buyerQuestions: "List common questions buyers ask after reading this. Example: When will the restaurant actually open? Does this change foot traffic or noise near the building I am considering? How does this affect resale demand on North Flagler?",
      buyerIntelligence: {
        buyerTakeaway: "Write one sentence that captures what a buyer should actually do or know after reading this.",
        marketSignal: "Describe what changed in the market, the policy, or the project pipeline, and why it matters now rather than later.",
        bestFor: "List the buyer profiles this insight serves.",
        watchPoints: "Add timelines, risks, or verification steps buyers should track.",
        buyerQuestions: "List common questions buyers ask after reading this.",
        relatedCorridor: "north-flagler",
        relatedNeighborhoods: ["North Flagler", "Currie Park"],
        relatedBuildings: ["olara", "shorecrest", "ritz-carlton-residences-west-palm-beach"],
      },
    },
  };

  const selected = templates[type] || templates.news;
  const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}-article-package.json`;
  a.click();
  URL.revokeObjectURL(url);
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
