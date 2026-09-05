// Read-only equivalent of main's entry-bundle Maps requirement. This branch
// statically imports the existing app and does not adopt the pilot bootstrap.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
export async function verifyProductionMapBundle(root = process.cwd()) {
  const dist = path.join(root, 'dist');
  const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  const tags = [...html.matchAll(/<script\b[^>]*\btype="module"[^>]*>/g)].map((match) => match[0]);
  const entry = tags.map((tag) => tag.match(/\bsrc="(\/assets\/index-[a-zA-Z0-9_-]+\.js)"/)?.[1]).filter(Boolean);
  if (entry.length !== 1) throw new Error('Expected the actual single production entry');
  const code = await fs.readFile(path.join(dist, entry[0].slice(1)), 'utf8');
  if (!code.includes('maps.googleapis.com/maps/api/js')) throw new Error('Production Maps loader missing from actual entry');
  return { commercialMapPreflight:'pass', entry:entry[0], liveMapsVerified:false };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  verifyProductionMapBundle().then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
