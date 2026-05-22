import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const sourcePath = path.join(workspace, "src/main.ts");
const controlPattern = /<(input|select|textarea)\b([^>]*)>/gi;

async function main() {
  const source = await fs.readFile(sourcePath, "utf8");
  const findings = [];
  let match;

  while ((match = controlPattern.exec(source))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] ?? "";
    const start = match.index;
    const line = source.slice(0, start).split("\n").length;
    if (isExemptControl(attrs)) continue;
    if (hasAccessibleName(source, start, tag, attrs)) continue;
    findings.push(`src/main.ts:${line}: ${tag} control lacks label, aria-label, or aria-labelledby`);
  }

  if (findings.length) {
    console.error(["Form accessibility check failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ formAccessibility: "pass", checkedFile: "src/main.ts" }, null, 2));
}

function isExemptControl(attrs) {
  return /\btype\s*=\s*["']hidden["']/i.test(attrs)
    || /\blead-honeypot\b/i.test(attrs)
    || /\bhidden\b/i.test(attrs)
    || /\baria-hidden\s*=\s*["']true["']/i.test(attrs);
}

function hasAccessibleName(source, start, tag, attrs) {
  if (/\baria-label\s*=|\baria-labelledby\s*=/i.test(attrs)) return true;
  const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
  if (idMatch) {
    const labelFor = new RegExp(`<label\\b[^>]*\\bfor=["']${escapeRegExp(idMatch[1])}["']`, "i");
    if (labelFor.test(source)) return true;
  }

  const before = source.slice(Math.max(0, start - 500), start);
  const lastOpen = before.lastIndexOf("<label");
  const lastClose = before.lastIndexOf("</label>");
  if (lastOpen > lastClose) return true;

  if (tag === "textarea") {
    const end = source.indexOf("</textarea>", start);
    return end !== -1 && source.slice(end, Math.min(source.length, end + 160)).includes("</label>");
  }
  return false;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
