import fs from "node:fs/promises";
import path from "node:path";
import { absoluteSocialImageUrl } from "../../shared/public-social-url.js";

const root = path.resolve("dist");
const htmlFiles = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
await walk(root);

const patterns = [
  /(<meta\s+property="og:image"\s+content=")([^"]+)("\s*\/?>)/g,
  /(<meta\s+name="twitter:image"\s+content=")([^"]+)("\s*\/?>)/g,
];
let changed = 0;
for (const file of htmlFiles) {
  let html = await fs.readFile(file, "utf8");
  for (const pattern of patterns) {
    html = html.replace(pattern, (_match, before, value, after) => {
      const safe = absoluteSocialImageUrl(value);
      if (!safe) throw new Error(`${path.relative(root, file)} has unsafe social image URL: ${value}`);
      if (safe !== value) changed += 1;
      return `${before}${safe}${after}`;
    });
  }
  await fs.writeFile(file, html);
}
console.log(JSON.stringify({ socialPreviewHtml: "normalized", htmlFiles: htmlFiles.length, changed }, null, 2));
