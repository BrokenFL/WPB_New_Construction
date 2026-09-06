import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { verifyProductionMapBundle } from './production-map-preflight.mjs';

const LOADER = 'const url = "https://maps.googleapis.com/maps/api/js";';
async function fixture(t, manifest, files = {}, html = '<script type="module" src="/assets/index-a.js"></script>') {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'wpb-preflight-'));
  const dir = path.join(workspace, 'dist');
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));
  for (const [file, content] of Object.entries({ 'index.html': html, '.vite/manifest.json': JSON.stringify(manifest), ...files })) {
    const output = file === '.vite/manifest.json' ? path.join(workspace, '.runtime/build/manifest.json') : path.join(dir, file);
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, content);
  }
  return dir;
}
const entry = (extra = {}) => ({ file: 'assets/index-a.js', isEntry: true, ...extra });

test('split bundle follows dynamic imports and nested static imports', async (t) => {
  const dir = await fixture(t, { 'index.html': entry({ dynamicImports: ['src/main.ts'] }), 'src/main.ts': { file: 'assets/main-b.js', imports: ['_maps'] }, _maps: { file: 'assets/maps-c.js' } }, { 'assets/index-a.js': 'import("./main-b.js")', 'assets/main-b.js': 'import "./maps-c.js"', 'assets/maps-c.js': LOADER });
  const result = await verifyProductionMapBundle(dir);
  assert.deepEqual(result.loaderFiles, ['assets/maps-c.js']);
  assert.equal(result.reachableFiles.length, 3);
  assert.equal(result.liveMapsVerified, false);
});
test('single-bundle layout remains supported with a manifest', async (t) => {
  assert.equal((await verifyProductionMapBundle(await fixture(t, { 'index.html': entry() }, { 'assets/index-a.js': LOADER }))).productionMapPreflight, 'pass');
});
test('genuinely missing loader fails even with a stray Maps file', async (t) => {
  const dir = await fixture(t, { 'index.html': entry(), unrelated: { file: 'assets/unrelated.js', isEntry: true } }, { 'assets/index-a.js': 'console.log("no map")', 'assets/unrelated.js': LOADER, 'assets/stale-maps.js': LOADER });
  await assert.rejects(verifyProductionMapBundle(dir), /reachable app chunks do not include/);
});
test('missing dynamic loader chunk fails closed', async (t) => {
  const dir = await fixture(t, { 'index.html': entry({ dynamicImports: ['missing'] }) }, { 'assets/index-a.js': LOADER });
  await assert.rejects(verifyProductionMapBundle(dir), /missing or invalid JavaScript dependency/);
});
test('manifest references must resolve to actual files', async (t) => {
  const dir = await fixture(t, { 'index.html': entry({ imports: ['_maps'] }), _maps: { file: 'assets/maps-c.js' } }, { 'assets/index-a.js': LOADER });
  await assert.rejects(verifyProductionMapBundle(dir), /referenced build file is missing/);
});
test('cycles terminate without skipping loader verification', async (t) => {
  const dir = await fixture(t, { 'index.html': entry({ imports: ['_shared'] }), _shared: { file: 'assets/shared.js', imports: ['index.html'] } }, { 'assets/index-a.js': '', 'assets/shared.js': LOADER });
  assert.equal((await verifyProductionMapBundle(dir)).reachableFiles.length, 2);
});
test('stale manifest entry not actually loaded by HTML fails', async (t) => {
  const dir = await fixture(t, { 'index.html': entry() }, { 'assets/index-a.js': LOADER }, '<link rel="modulepreload" href="/assets/index-a.js"><script type="module" src="/assets/other.js"></script>');
  await assert.rejects(verifyProductionMapBundle(dir), /HTML does not load/);
});
test('unsafe paths and malformed imports fail closed', async (t) => {
  for (const bad of ['../outside.js', '/tmp/outside.js', 'https://example.com/map.js', 'assets/../outside.js']) {
    const dir = await fixture(t, { 'index.html': entry({ dynamicImports: ['bad'] }), bad: { file: bad } }, { 'assets/index-a.js': LOADER });
    await assert.rejects(verifyProductionMapBundle(dir), /unsafe build dependency/);
  }
  const dir = await fixture(t, { 'index.html': entry({ imports: 'bad' }) }, { 'assets/index-a.js': LOADER });
  await assert.rejects(verifyProductionMapBundle(dir), /invalid manifest dependency list/);
});
test('missing/invalid manifest is not bypassed by loader in entry', async (t) => {
  const dir = await fixture(t, {}, { 'assets/index-a.js': LOADER, '.vite/manifest.json': 'INVALID' });
  await assert.rejects(verifyProductionMapBundle(dir), /manifest is missing or invalid/);
});
test('preflight module import and CLI never invoke deployment or network', async (t) => {
  const dir = await fixture(t, { 'index.html': entry() }, { 'assets/index-a.js': LOADER });
  const workspace = path.join(dir, 'workspace');
  await fs.mkdir(workspace);
  await fs.symlink(dir, path.join(workspace, 'dist'));
  const script = fileURLToPath(new URL('./production-map-preflight.mjs', import.meta.url));
  const guard = fileURLToPath(new URL('./deploy-cloudflare-pages-with-retry.mjs', import.meta.url));
  const source = await fs.readFile(script, 'utf8');
  assert.doesNotMatch(source, /from ['"]node:child_process|\bfetch\s*\(/);
  const result = spawnSync(process.execPath, [script], { cwd: workspace, encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).productionMapPreflight, 'pass');
  // The deploy script must still call this guard before any upload path.
  {
    const deploySource = await fs.readFile(guard, 'utf8');
    assert.ok(deploySource.includes('await verifyProductionMapBundle(distRoot)'));
    assert.ok(deploySource.indexOf('await verifyProductionMapBundle(distRoot)') < deploySource.indexOf('await deployWithRetry()'));
  }
});

test('Vite graph is private build metadata, not deployed public output', async () => {
  const config = await fs.readFile(fileURLToPath(new URL('../../vite.config.ts', import.meta.url)), 'utf8');
  assert.match(config, /manifest: true/);
  assert.match(config, /rename\(resolve\(distRoot, "\.vite\/manifest\.json"\), privateBuildManifest\)/);
  assert.match(config, /buildStart:[\s\S]*?rm\(privateBuildManifest/);
});
