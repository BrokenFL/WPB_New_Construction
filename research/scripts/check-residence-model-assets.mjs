import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { residence3DModels } from '../../src/data/residence3DModels.ts';
import { assertPublicGlb, hashBytes } from '../../scripts/lib/residence-model-assets.mjs';

const root = process.argv.includes('--dist') ? 'dist' : 'public';
const approved = residence3DModels.filter((model) => model.status === 'approved');
assert.equal(approved.length, residence3DModels.length, 'Every release candidate must pass review');
assert.equal(new Set(approved.map((model) => model.modelId)).size, approved.length, 'Duplicate model IDs');
const publish = JSON.parse(await fs.readFile('data/generated_asset_publish_manifest.json', 'utf8'));
const report = [];
for (const model of approved) {
  const expected = new Set(approved.filter((item) => item.projectId === model.projectId && item.residenceSlug === model.residenceSlug)
    .flatMap((item) => [item.modelUrl, item.posterUrl, item.mobilePosterUrl].filter(Boolean).map((url) => path.posix.basename(url))));
  const dir = path.join(root, 'assets/projects', model.projectId, '3d', model.residenceSlug);
  assert.deepEqual(new Set(await fs.readdir(dir)), expected, `Only website derivatives: ${dir}`);
  for (const url of [model.modelUrl, model.posterUrl, model.mobilePosterUrl].filter(Boolean)) {
    assert.match(url, /^\/assets\/projects\/[a-z0-9-]+\/3d\/[a-z0-9-]+\/(model(?:-[a-z0-9-]+)?\.glb|poster(?:-[a-z0-9-]+)?\.webp)$/);
    const bytes = await fs.readFile(path.join(root, url));
    const entry = publish.find((item) => item.publicPath === url);
    assert.ok(entry, `Missing approved publisher record: ${url}`);
    assert.equal(hashBytes(bytes), entry.outputHash, `Derivative changed after asset publication: ${url}`);
    if (url.endsWith('.glb')) assertPublicGlb(bytes);
    report.push({ url, bytes: bytes.length });
  }
}
assert.doesNotMatch(JSON.stringify(residence3DModels), /drive\.google|\/Users\/|\/Volumes\/|\.blend|sourceModel|qaNotes/i);
console.log(JSON.stringify({ residenceModelAssets: 'pass', root, models: approved.length, assets: report }, null, 2));
