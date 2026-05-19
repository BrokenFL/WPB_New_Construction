import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
export const overridesPath = path.join(workspace, "research/content-editor/site-overrides.json");
export const generatedOverridesPath = path.join(workspace, "src/generated/editorOverrides.ts");

const editableProjectFields = new Set([
  "name",
  "status",
  "delivery",
  "residences",
  "price",
  "image",
  "summary",
  "pageState",
  "address",
]);

const editableDraftFields = new Set(["title", "intro", "image", "imageAlt", "stage", "locationCopy"]);

export async function readEditorOverrides() {
  const existing = await fs.readFile(overridesPath, "utf8").catch(() => "");
  if (!existing.trim()) return defaultOverrides();
  try {
    return sanitizeOverrides(JSON.parse(existing));
  } catch {
    return defaultOverrides();
  }
}

export async function writeEditorOverrides(input) {
  const sanitized = sanitizeOverrides(input);
  sanitized.updatedAt = new Date().toISOString();
  await fs.mkdir(path.dirname(overridesPath), { recursive: true });
  await fs.writeFile(overridesPath, `${JSON.stringify(sanitized, null, 2)}\n`);
  await syncEditorOverrides(sanitized);
  return sanitized;
}

export async function syncEditorOverrides(input = null) {
  const sanitized = input ? sanitizeOverrides(input) : await readEditorOverrides();
  await fs.mkdir(path.dirname(generatedOverridesPath), { recursive: true });
  await fs.writeFile(generatedOverridesPath, renderEditorOverridesTs(sanitized.projects));
  return sanitized;
}

export function sanitizeOverrides(input) {
  const next = defaultOverrides();
  next.updatedAt = cleanText(input?.updatedAt) ?? "";

  for (const [projectId, override] of Object.entries(input?.projects ?? {})) {
    const cleanProjectId = slug(projectId);
    if (!cleanProjectId || !override || typeof override !== "object") continue;

    const project = {};
    for (const field of editableProjectFields) {
      const value = cleanText(override[field]);
      if (value) project[field] = value;
    }

    const deliveryYear = Number(override.deliveryYear);
    if (Number.isInteger(deliveryYear) && deliveryYear >= 1900 && deliveryYear <= 2200) {
      project.deliveryYear = deliveryYear;
    }

    const draft = {};
    for (const field of editableDraftFields) {
      const value = cleanText(override.draft?.[field]);
      if (value) draft[field] = value;
    }

    const needed = Array.isArray(override.draft?.needed)
      ? override.draft.needed.map(cleanText).filter(Boolean)
      : splitLines(override.draft?.needed);
    if (needed.length) draft.needed = needed;
    if (Object.keys(draft).length) project.draft = draft;

    if (Object.keys(project).length) next.projects[cleanProjectId] = project;
  }

  return next;
}

function defaultOverrides() {
  return {
    version: 1,
    updatedAt: "",
    projects: {},
  };
}

function renderEditorOverridesTs(projects) {
  return `export type EditorProjectOverride = {
  name?: string;
  status?: string;
  delivery?: string;
  deliveryYear?: number;
  residences?: string;
  price?: string;
  image?: string;
  summary?: string;
  pageState?: string;
  address?: string;
  draft?: {
    title?: string;
    intro?: string;
    image?: string;
    imageAlt?: string;
    stage?: string;
    locationCopy?: string;
    needed?: string[];
  };
};

export type EditorProjectOverrides = Record<string, EditorProjectOverride>;

export const editorProjectOverrides = ${JSON.stringify(projects, null, 2)} satisfies EditorProjectOverrides;
`;
}

function cleanText(value) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").trim();
  return text || "";
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);
}

function slug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncEditorOverrides()
    .then((overrides) => {
      console.log(
        JSON.stringify(
          {
            mode: "synced",
            projectsWithOverrides: Object.keys(overrides.projects).length,
            source: path.relative(workspace, overridesPath),
            generated: path.relative(workspace, generatedOverridesPath),
          },
          null,
          2,
        ),
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
