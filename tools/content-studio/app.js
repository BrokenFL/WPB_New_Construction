let state;
let selectedFile;

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
  document.querySelector("#automationStatus").textContent = JSON.stringify({
    automation: state.automation,
    changeLog: state.overrides.changeLog?.entries?.slice(0, 8) ?? [],
  }, null, 2);
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
  document.querySelectorAll(`${selector} [data-news-action]`).forEach((button) => {
    button.addEventListener("click", async () => {
      const status = button.dataset.newsAction;
      const id = button.closest("[data-news-id]").dataset.newsId;
      show(await postJson("/api/news-draft", { id, status }));
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
  return `
    <article class="news-card" data-news-id="${escapeHtml(item.id)}">
      <div class="news-card-head">
        <strong>${escapeHtml(item.rewrittenHeadline)}</strong>
        <span>${escapeHtml(item.riskLevel)} / ${escapeHtml(item.status)}</span>
      </div>
      <p>${escapeHtml(item.deck)}</p>
      <p class="muted">${escapeHtml(item.sourceName)} · <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">source</a></p>
      <p class="muted">Project: ${(item.relatedProjectIds ?? []).join(", ") || "none"} · Corridor: ${(item.relatedCorridorIds ?? []).join(", ") || "none"}</p>
      <p class="muted">Image: ${escapeHtml(item.suggestedImagePath || "assign before publishing")}</p>
      <p class="muted">${escapeHtml(item.imageResolutionReason || "")}</p>
      <details>
        <summary>Article preview</summary>
        ${(item.bodySections ?? []).map((section) => `<h3>${escapeHtml(section.heading)}</h3><p>${escapeHtml(section.body)}</p>`).join("")}
        <p><strong>Buyer takeaway:</strong> ${escapeHtml(item.buyerTakeaway || "")}</p>
        <p><strong>Newsletter:</strong> ${escapeHtml(item.newsletterBlurb || "")}</p>
      </details>
      <div class="card-actions">
        <button data-news-action="queued" type="button">Approve</button>
        <button data-news-action="blocked" type="button">Block</button>
        <button data-news-action="published" type="button">Mark Published</button>
        <button data-news-action="draft" type="button">Edit Later</button>
      </div>
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

loadState().catch(show);
