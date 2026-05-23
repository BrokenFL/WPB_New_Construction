let state;
let selectedFile;
let activeHomepageCard = { sectionId: "hero", cardId: "hero" };
let activeReportPath = "";
let activeReportText = "";
let activeBuilderSection = "homepage";
let activePreviewDevice = "desktop";

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
  document.querySelector("#draftPreviewStatus").textContent = "Draft preview visible on right";
  document.querySelector("#previewHomepage").href = previewUrlFor("homepage");
  document.querySelector("#openLivePreview").href = previewUrlFor("homepage");
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
  previewRoot.className = `page-preview-shell device-${activePreviewDevice}`;
  document.querySelector("#previewPageTitle").textContent = "Homepage draft";
  const ordered = ["hero", "corridors", "updates", "guidance", "featuredBuildings", "cta"].filter((sectionId) => state.homepageCards?.[sectionId]);
  previewRoot.innerHTML = `<div class="draft-page-frame">${ordered.map((sectionId) => draftPreviewSection(sectionId)).join("")}</div>`;
  previewRoot.querySelectorAll("[data-preview-section]").forEach((button) => {
    button.addEventListener("click", () => {
      activeHomepageCard = { sectionId: button.dataset.previewSection, cardId: button.dataset.previewCard };
      renderHomepageCardEditor();
    });
  });
}

function draftPreviewSection(sectionId) {
  const cards = state.homepageCards?.[sectionId] ?? [];
  const visibleCards = sectionId === "hero" ? cards.slice(0, 1) : cards;
  const isHero = sectionId === "hero";
  return `
    <section class="draft-section ${isHero ? "is-hero" : ""}">
      <div class="draft-section-label">${escapeHtml(homepageSectionLabels[sectionId] || sectionId)}</div>
      <div class="${isHero ? "draft-hero-layout" : "draft-card-row"}">
        ${visibleCards.map((card, index) => draftPreviewCard(sectionId, card, index)).join("")}
      </div>
    </section>
  `;
}

function draftPreviewCard(sectionId, card, index) {
  const form = document.querySelector("#homepageCardPanel");
  const savedOverride = state.overrides.homepageCards?.sections?.[sectionId]?.cards?.[card.id] ?? {};
  const isSelected = activeHomepageCard.sectionId === sectionId && activeHomepageCard.cardId === card.id;
  const liveDraft = isSelected && form ? draftFromForm(card, savedOverride) : {};
  const item = { ...card, ...savedOverride, ...liveDraft };
  const label = previewCardLabel(sectionId, card, index);
  const imagePosition = item.imagePosition || "center center";
  const objectFit = item.objectFit || "cover";
  return `
    <button class="draft-card ${isSelected ? "is-selected" : ""} ${sectionId === "hero" ? "is-hero-card" : ""}" data-preview-section="${escapeHtml(sectionId)}" data-preview-card="${escapeHtml(card.id)}" type="button">
      <span>${escapeHtml(label)}</span>
      ${builderImage(item.imagePath || "", item.alt || item.title || "", { style: `object-position:${imagePosition};object-fit:${objectFit}` })}
      <strong>${escapeHtml(item.headline || item.title || label)}</strong>
      <p>${escapeHtml(item.deck || item.subhead || card.deck || "Draft preview")}</p>
      <small>${escapeHtml(item.caption || item.ctaLabel || defaultCtaLabel(sectionId))}</small>
    </button>
  `;
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
  if (sectionId === "featuredBuildings") return `Featured Building card ${index + 1}`;
  if (sectionId === "cta") return "CTA";
  if (sectionId === "hero") return "Hero";
  return card.title || "Card";
}

function updateBuilderContext() {
  document.body.classList.toggle("is-project-editing", activeBuilderSection === "projects");
  const wrapper = document.querySelector("#projectSelectorWrap");
  if (wrapper) wrapper.hidden = activeBuilderSection !== "projects";
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
