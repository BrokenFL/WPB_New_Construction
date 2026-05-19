import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import {
  overridesPath,
  readEditorOverrides,
  writeEditorOverrides,
} from "./sync-editor-overrides.mjs";

const workspace = process.cwd();
const port = Number(process.env.WPB_EDITOR_PORT ?? 4179);

async function main() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
      if (request.method === "GET" && url.pathname === "/") return sendHtml(response);
      if (request.method === "GET" && url.pathname === "/api/state") return sendJson(response, await editorState());
      if (request.method === "POST" && url.pathname === "/api/save") return saveOverrides(request, response);
      if (request.method === "POST" && url.pathname === "/api/build") return buildSite(response);
      return sendText(response, "Not found", 404);
    } catch (error) {
      return sendJson(response, { ok: false, error: error.message }, 500);
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`WPB local editor running at http://127.0.0.1:${port}`);
    console.log(`Saving to ${path.relative(workspace, overridesPath)}`);
  });
}

async function editorState() {
  const [overrides, baseline] = await Promise.all([readEditorOverrides(), readBaseline()]);
  return {
    ok: true,
    overrides,
    baseline,
    editableFields: {
      project: ["name", "status", "delivery", "deliveryYear", "residences", "price", "image", "summary", "pageState", "address"],
      draft: ["title", "intro", "image", "imageAlt", "stage", "locationCopy", "needed"],
    },
  };
}

async function saveOverrides(request, response) {
  const body = await readRequestJson(request);
  const saved = await writeEditorOverrides(body);
  return sendJson(response, { ok: true, overrides: saved });
}

async function buildSite(response) {
  const output = await run("npm", ["run", "build"]);
  return sendJson(response, { ok: output.code === 0, ...output }, output.code === 0 ? 200 : 500);
}

async function readBaseline() {
  const source = await fs.readFile(path.join(workspace, "src/main.ts"), "utf8");
  const ast = ts.createSourceFile("main.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const projects = findProjectList(ast);
  const drafts = findDrafts(ast);
  return projects.map((project) => ({
    ...project,
    draft: drafts[project.id] ?? {},
  }));
}

function findProjectList(ast) {
  const found = [];
  visit(ast, (node) => {
    if (!ts.isVariableDeclaration(node)) return;
    if (node.name.getText(ast) !== "baseFeaturedProjects" && node.name.getText(ast) !== "featuredProjects") return;
    if (!node.initializer || !ts.isArrayLiteralExpression(node.initializer)) return;
    for (const element of node.initializer.elements) {
      if (!ts.isObjectLiteralExpression(element)) continue;
      const item = objectLiteralToSimpleObject(element, ast);
      if (item.id) found.push(item);
    }
  });
  return found.sort((a, b) => Number(a.rank ?? 999) - Number(b.rank ?? 999) || String(a.name).localeCompare(String(b.name)));
}

function findDrafts(ast) {
  const drafts = {};
  visit(ast, (node) => {
    if (!ts.isVariableDeclaration(node) || node.name.getText(ast) !== "projectPageDrafts") return;
    if (!node.initializer || !ts.isObjectLiteralExpression(node.initializer)) return;
    for (const property of node.initializer.properties) {
      if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) continue;
      const key = propertyName(property.name, ast);
      if (!key) continue;
      const draft = objectLiteralToSimpleObject(property.initializer, ast);
      drafts[key] = {
        title: draft.title ?? "",
        intro: draft.intro ?? "",
        image: draft.image ?? "",
        imageAlt: draft.imageAlt ?? "",
        stage: draft.stage ?? "",
        locationCopy: draft.locationCopy ?? "",
        needed: Array.isArray(draft.needed) ? draft.needed : [],
      };
    }
  });
  return drafts;
}

function objectLiteralToSimpleObject(node, ast) {
  const result = {};
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = propertyName(property.name, ast);
    if (!key) continue;
    result[key] = simpleValue(property.initializer, ast);
  }
  return result;
}

function simpleValue(node, ast) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((element) => simpleValue(element, ast)).filter((value) => typeof value === "string");
  if (ts.isIdentifier(node)) return node.getText(ast);
  if (ts.isTemplateExpression(node)) return node.getText(ast);
  return "";
}

function propertyName(name, ast) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return name.getText(ast).replace(/^["']|["']$/g, "");
}

function visit(node, callback) {
  callback(node);
  ts.forEachChild(node, (child) => visit(child, callback));
}

async function readRequestJson(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace, shell: false });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendText(response, text, status = 200) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}

function sendHtml(response) {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(editorHtml());
}

function editorHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WPB Site Editor</title>
  <style>
    :root { color-scheme: light; --ink: #172126; --muted: #647177; --line: #d9e0e2; --wash: #f5f7f7; --accent: #0b6f78; --accent-2: #b84d35; }
    * { box-sizing: border-box; }
    body { margin: 0; font: 15px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: #ffffff; }
    header { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 24px; border-bottom: 1px solid var(--line); background: #fff; position: sticky; top: 0; z-index: 2; }
    header strong { font-size: 18px; }
    header span { color: var(--muted); }
    button { border: 1px solid var(--line); background: #fff; color: var(--ink); border-radius: 6px; padding: 10px 13px; font: inherit; cursor: pointer; }
    button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    button.warn { border-color: #e3baa8; color: var(--accent-2); }
    .layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); min-height: calc(100vh - 64px); }
    aside { border-right: 1px solid var(--line); background: var(--wash); padding: 16px; overflow: auto; max-height: calc(100vh - 64px); }
    main { padding: 24px; max-width: 980px; }
    input, textarea, select { width: 100%; border: 1px solid var(--line); border-radius: 6px; padding: 10px 11px; font: inherit; color: var(--ink); background: #fff; }
    textarea { min-height: 94px; resize: vertical; }
    label { display: grid; gap: 6px; font-weight: 650; }
    label small { color: var(--muted); font-weight: 400; }
    .search { margin-bottom: 12px; }
    .project-list { display: grid; gap: 8px; }
    .project-item { text-align: left; display: grid; gap: 2px; padding: 10px; border-radius: 6px; background: #fff; }
    .project-item.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    .project-item small { color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .wide { grid-column: 1 / -1; }
    .panel { border: 1px solid var(--line); border-radius: 8px; padding: 18px; margin-bottom: 18px; }
    .panel h2 { margin: 0 0 14px; font-size: 18px; }
    .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 18px; }
    .status { color: var(--muted); min-height: 22px; }
    .output { white-space: pre-wrap; background: #11191c; color: #eaf3f4; border-radius: 8px; padding: 14px; max-height: 260px; overflow: auto; display: none; }
    .empty { color: var(--muted); padding: 24px; border: 1px dashed var(--line); border-radius: 8px; }
    @media (max-width: 820px) { .layout { grid-template-columns: 1fr; } aside { max-height: none; border-right: 0; border-bottom: 1px solid var(--line); } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <div><strong>WPB Site Editor</strong><br /><span>Private local editor for project cards and project pages</span></div>
    <div class="actions"><button id="saveTop" class="primary">Save</button><button id="buildTop">Build Site</button></div>
  </header>
  <div class="layout">
    <aside>
      <input class="search" id="search" placeholder="Search projects" />
      <div class="project-list" id="projectList"></div>
    </aside>
    <main>
      <div id="editor" class="empty">Choose a project on the left.</div>
      <div class="actions">
        <button id="saveBottom" class="primary">Save</button>
        <button id="buildBottom">Build Site</button>
        <button id="clearProject" class="warn">Clear This Project's Edits</button>
        <span class="status" id="status"></span>
      </div>
      <pre class="output" id="output"></pre>
    </main>
  </div>
  <script>
    let state = null;
    let activeId = "";
    const projectFields = ["name", "status", "delivery", "deliveryYear", "residences", "price", "image", "summary", "pageState", "address"];
    const draftFields = ["title", "intro", "image", "imageAlt", "stage", "locationCopy", "needed"];
    const labels = {
      name: "Project name", status: "Status", delivery: "Delivery", deliveryYear: "Delivery year", residences: "Residences",
      price: "Price note", image: "Card image path", summary: "Card summary", pageState: "Page state", address: "Address",
      title: "Page title", intro: "Page intro", imageAlt: "Hero image alt text", stage: "Stage", locationCopy: "Location copy", needed: "Advisor review notes"
    };

    async function load() {
      const response = await fetch("/api/state");
      state = await response.json();
      activeId = state.baseline[0]?.id ?? "";
      renderList();
      renderEditor();
    }

    function overrideFor(id) {
      state.overrides.projects[id] ??= {};
      return state.overrides.projects[id];
    }

    function renderList() {
      const q = document.getElementById("search").value.toLowerCase();
      const list = document.getElementById("projectList");
      list.innerHTML = "";
      state.baseline
        .filter((project) => !q || [project.name, project.id, project.corridor].join(" ").toLowerCase().includes(q))
        .forEach((project) => {
          const button = document.createElement("button");
          button.className = "project-item" + (project.id === activeId ? " active" : "");
          button.innerHTML = "<strong>" + escapeHtml(project.name) + "</strong><small>" + escapeHtml(project.corridor || project.id) + "</small>";
          button.onclick = () => { activeId = project.id; renderList(); renderEditor(); };
          list.appendChild(button);
        });
    }

    function renderEditor() {
      const base = state.baseline.find((project) => project.id === activeId);
      const editor = document.getElementById("editor");
      if (!base) { editor.className = "empty"; editor.textContent = "Choose a project on the left."; return; }
      editor.className = "";
      const override = overrideFor(activeId);
      const draft = override.draft ?? {};
      editor.innerHTML = \`
        <section class="panel">
          <h2>Project Card</h2>
          <div class="grid">
            \${projectFields.map((field) => fieldInput(field, override[field], base[field], "project")).join("")}
          </div>
        </section>
        <section class="panel">
          <h2>Project Page</h2>
          <div class="grid">
            \${draftFields.map((field) => fieldInput(field, draft[field], base.draft?.[field], "draft")).join("")}
          </div>
        </section>\`;
      editor.querySelectorAll("[data-field]").forEach((input) => {
        input.addEventListener("input", () => updateField(input));
      });
    }

    function fieldInput(field, value, placeholder, scope) {
      const isLong = ["summary", "intro", "locationCopy", "needed"].includes(field);
      const type = field === "deliveryYear" ? "number" : "text";
      const shownValue = Array.isArray(value) ? value.join("\\n") : value ?? "";
      const shownPlaceholder = Array.isArray(placeholder) ? placeholder.join("\\n") : placeholder ?? "";
      const tag = isLong ? "textarea" : "input";
      const wide = isLong || field === "image" || field === "imageAlt" ? " wide" : "";
      const input = tag === "textarea"
        ? \`<textarea data-scope="\${scope}" data-field="\${field}" placeholder="\${escapeAttr(shownPlaceholder)}">\${escapeHtml(shownValue)}</textarea>\`
        : \`<input type="\${type}" data-scope="\${scope}" data-field="\${field}" value="\${escapeAttr(shownValue)}" placeholder="\${escapeAttr(shownPlaceholder)}" />\`;
      return \`<label class="\${wide}">\${labels[field] ?? field}<small>Leave blank to keep current site value.</small>\${input}</label>\`;
    }

    function updateField(input) {
      const override = overrideFor(activeId);
      const field = input.dataset.field;
      const scope = input.dataset.scope;
      let value = input.value.trim();
      if (scope === "draft") {
        override.draft ??= {};
        if (field === "needed") {
          const lines = value.split(/\\n/).map((line) => line.trim()).filter(Boolean);
          if (lines.length) override.draft[field] = lines; else delete override.draft[field];
        } else if (value) {
          override.draft[field] = value;
        } else {
          delete override.draft[field];
        }
        if (!Object.keys(override.draft).length) delete override.draft;
      } else if (field === "deliveryYear") {
        const year = Number(value);
        if (Number.isInteger(year)) override[field] = year; else delete override[field];
      } else if (value) {
        override[field] = value;
      } else {
        delete override[field];
      }
      if (!Object.keys(override).length) delete state.overrides.projects[activeId];
    }

    async function save() {
      setStatus("Saving...");
      const response = await fetch("/api/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(state.overrides) });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "Save failed");
      state.overrides = payload.overrides;
      setStatus("Saved.");
    }

    async function build() {
      await save();
      setStatus("Building...");
      const response = await fetch("/api/build", { method: "POST" });
      const payload = await response.json();
      document.getElementById("output").style.display = "block";
      document.getElementById("output").textContent = (payload.stdout || "") + (payload.stderr || "");
      setStatus(payload.ok ? "Build complete." : "Build failed.");
    }

    function clearProject() {
      if (!activeId) return;
      delete state.overrides.projects[activeId];
      renderEditor();
      setStatus("Edits cleared for this project. Save to apply.");
    }

    function setStatus(text) { document.getElementById("status").textContent = text; }
    function escapeHtml(text) { return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    function escapeAttr(text) { return escapeHtml(text).replace(/\\n/g, " "); }

    document.getElementById("search").addEventListener("input", renderList);
    document.getElementById("saveTop").addEventListener("click", save);
    document.getElementById("saveBottom").addEventListener("click", save);
    document.getElementById("buildTop").addEventListener("click", build);
    document.getElementById("buildBottom").addEventListener("click", build);
    document.getElementById("clearProject").addEventListener("click", clearProject);
    load().catch((error) => setStatus(error.message));
  </script>
</body>
</html>`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
