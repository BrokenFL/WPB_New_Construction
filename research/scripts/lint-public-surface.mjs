import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = ["src", "public/data", "public/index.html"].map((item) => path.join(root, item));
const blocked = [
  /info@example\.com/i,
  /front-end only/i,
  /future CRM/i,
  /No message is sent/i,
  /Add a backend integration before production/i,
  /form handler of choice/i,
];

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(target, entry.name);
    if (entry.isDirectory()) return walk(filePath);
    return filePath;
  });
}

const findings = [];
for (const file of targets.flatMap(walk)) {
  if (!/\.(ts|tsx|js|json|html|css)$/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of blocked) {
    if (pattern.test(text)) {
      findings.push(`${path.relative(root, file)} matches ${pattern}`);
    }
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Public-surface lint passed.");
