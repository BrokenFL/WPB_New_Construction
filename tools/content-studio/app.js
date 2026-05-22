let state;
let selectedFile;

const projectSelect = document.querySelector("#projectSelect");
const result = document.querySelector("#result");
const preview = document.querySelector("#imagePreview");

async function loadState() {
  state = await fetchJson("/api/state");
  projectSelect.innerHTML = state.projects.map((project) => `<option value="${project.id}">${project.name}</option>`).join("");
  document.querySelector("#automationStatus").textContent = JSON.stringify(state.automation, null, 2);
  fillCopyForm();
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

document.querySelector("#refresh").addEventListener("click", loadState);
projectSelect.addEventListener("change", fillCopyForm);

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${button.dataset.tab}Panel`));
  });
});

document.querySelector("#copyPanel").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formPayload(event.currentTarget);
  payload.projectId = activeProjectId();
  show(await postJson("/api/project-copy", payload));
  await loadState();
});

document.querySelector("#updatePanel").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formPayload(event.currentTarget);
  payload.projectId = activeProjectId();
  show(await postJson("/api/project-update", payload));
});

document.querySelector("#teamPanel").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formPayload(event.currentTarget);
  payload.projectId = activeProjectId();
  show(await postJson("/api/team-resource", payload));
});

document.querySelector("#imagePanel input[type=file]").addEventListener("change", async (event) => {
  selectedFile = event.target.files[0];
  if (!selectedFile) return;
  preview.src = await fileAsDataUrl(selectedFile);
  preview.hidden = false;
});

document.querySelector("#dropZone").addEventListener("drop", async (event) => {
  event.preventDefault();
  selectedFile = event.dataTransfer.files[0];
  if (!selectedFile) return;
  preview.src = await fileAsDataUrl(selectedFile);
  preview.hidden = false;
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
});

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

loadState().catch(show);
