import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const root = path.join(workspace, "public/.well-known/agent-skills");
const index = JSON.parse(await fs.readFile(path.join(root, "index.json"), "utf8"));
const findings = [];

if (index.$schema !== "https://schemas.agentskills.io/discovery/0.2.0/schema.json") {
  findings.push(`unsupported discovery schema ${index.$schema || "missing"}`);
}

for (const entry of index.skills || []) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name || "") || entry.name.length > 64) {
    findings.push(`${entry.name || "unnamed"}: invalid skill name`);
  }
  if (entry.type !== "skill-md") findings.push(`${entry.name}: single-file skill must use type skill-md`);
  const expectedUrl = `/.well-known/agent-skills/${entry.name}/SKILL.md`;
  if (entry.url !== expectedUrl) findings.push(`${entry.name}: URL must be ${expectedUrl}`);

  const skillPath = path.join(workspace, "public", entry.url.replace(/^\//, ""));
  const raw = await fs.readFile(skillPath).catch(() => null);
  if (!raw) {
    findings.push(`${entry.name}: SKILL.md is missing`);
    continue;
  }
  const text = raw.toString("utf8");
  const frontmatter = parseFrontmatter(text);
  if (frontmatter.name !== entry.name) findings.push(`${entry.name}: frontmatter name must match the directory and index`);
  if (frontmatter.description !== entry.description) findings.push(`${entry.name}: description must match the index`);
  if (!frontmatter.description || frontmatter.description.length > 1024 || !/\buse (?:for|when)\b/i.test(frontmatter.description)) {
    findings.push(`${entry.name}: description must state what the skill does and when to use it`);
  }
  const digest = `sha256:${crypto.createHash("sha256").update(raw).digest("hex")}`;
  if (entry.digest !== digest) findings.push(`${entry.name}: digest mismatch; expected ${digest}`);
  if (!text.includes("https://www.wpbnewconstruction.com/projects/") || !text.includes("https://www.wpbnewconstruction.com/methodology/")) {
    findings.push(`${entry.name}: guidance must prefer canonical on-site project and methodology pages`);
  }
  if (!/Do not infer unsourced|Do not invent/i.test(text)) findings.push(`${entry.name}: missing no-invention guardrail`);
}

if (findings.length) {
  console.error(["Agent Skills QA failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({ agentSkills: "pass", skills: index.skills.length, schema: index.$schema }, null, 2));

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  return Object.fromEntries(
    match[1].split(/\r?\n/).map((line) => {
      const separator = line.indexOf(":");
      return separator === -1 ? [line.trim(), ""] : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
  );
}
