import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const loader = 'maps.googleapis.com/maps/api/js';
const fail = (reason) => new Error(`Production map guard failed: ${reason}`);

/** Read-only build preflight. Never runs a build, fetch, subprocess or deployment.
 * Vite's manifest is authoritative for static AND dynamic chunk dependencies.
 * Start only at the entry actually used by index.html, not every manifest entry.
 * This checks loader inclusion, not key validity or successful Google map tiles.
 */
export async function verifyProductionMapBundle(distRoot = path.resolve('dist')) {
  const root = await fs.realpath(distRoot).catch(() => { throw fail('build directory is missing.'); });
  async function readBuildFile(file) {
    if (typeof file !== 'string' || !file || file.includes('\\') || file.includes('\0') || file.startsWith('/') || /^[a-z]+:/i.test(file) || /[?#]/.test(file) || file.split('/').some((p) => p === '..' || p === '.')) {
      throw fail('unsafe build dependency path.');
    }
    const resolved = await fs.realpath(path.join(root, file)).catch(() => { throw fail('referenced build file is missing.'); });
    if (!resolved.startsWith(root + path.sep)) throw fail('build dependency escapes dist.');
    return fs.readFile(resolved, 'utf8');
  }
  const html = await readBuildFile('index.html');
  let manifest;
  // Vite's closeBundle moves its graph out of public dist into this private sidecar.
  try { manifest = JSON.parse(await fs.readFile(path.join(path.dirname(root), '.runtime/build/manifest.json'), 'utf8')); }
  catch { throw fail('Vite build manifest is missing or invalid. Rebuild with build.manifest enabled.'); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw fail('invalid Vite manifest.');
  const entry = manifest['index.html'];
  if (!entry || entry.isEntry !== true || typeof entry.file !== 'string') throw fail('manifest has no index.html entry.');
  const scripts = [...html.matchAll(/<script\b([^>]*?)>[\s\S]*?<\/script\s*>/gi)].map((match) => {
    const attributes = Object.fromEntries([...match[1].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map((m) => [m[1].toLowerCase(), m[3]]));
    return attributes.type === 'module' ? attributes.src : undefined;
  }).filter(Boolean);
  if (!scripts.some((src) => src === `/${entry.file}` || src === entry.file || src === `./${entry.file}`)) throw fail('HTML does not load the manifest entry.');
  const seen = new Set();
  const reachableFiles = [];
  const loaderFiles = [];
  async function visit(key) {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = Object.hasOwn(manifest, key) ? manifest[key] : null;
    if (!chunk || typeof chunk !== 'object' || !/\.m?js$/.test(chunk.file ?? '')) throw fail('missing or invalid JavaScript dependency in manifest.');
    const source = await readBuildFile(chunk.file);
    reachableFiles.push(chunk.file);
    if (source.includes(loader)) loaderFiles.push(chunk.file);
    for (const kind of ['imports', 'dynamicImports']) {
      const deps = chunk[kind] ?? [];
      if (!Array.isArray(deps) || deps.some((dep) => typeof dep !== 'string')) throw fail('invalid manifest dependency list.');
      for (const dep of deps) await visit(dep);
    }
  }
  await visit('index.html');
  if (!loaderFiles.length) throw fail('the reachable app chunks do not include the Google Maps loader. Set VITE_GOOGLE_MAPS_API_KEY at BUILD time and rebuild. VITE_GOOGLE_MAPS_MAP_ID is optional.');
  return { productionMapPreflight: 'pass', entry: entry.file, reachableFiles, loaderFiles, liveMapsVerified: false };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 2) {
    console.error('This read-only preflight accepts no deployment arguments. Run it from the repository root.');
    process.exitCode = 1;
  } else {
    verifyProductionMapBundle().then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}
