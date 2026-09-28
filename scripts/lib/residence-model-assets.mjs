import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const hashBytes = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

export function readGlb(bytes) {
  if (bytes.length < 20 || bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('Invalid GLB 2 container');
  const length = bytes.readUInt32LE(12);
  if (bytes.readUInt32LE(16) !== 0x4e4f534a || 20 + length > bytes.length) throw new Error('Missing GLB JSON');
  return { json: JSON.parse(bytes.subarray(20, 20 + length).toString('utf8')), rest: bytes.subarray(20 + length) };
}

// Names and extras are production metadata, unnecessary for the public orbit viewer.
export function publicGlb(bytes) {
  const { json, rest } = readGlb(bytes);
  const clean = (value) => {
    if (!value || typeof value !== 'object') return;
    delete value.extras;
    delete value.name;
    for (const child of Object.values(value)) clean(child);
  };
  clean(json);
  json.asset = { version: '2.0', generator: 'WPB New Construction residence visualization' };
  const encoded = Buffer.from(JSON.stringify(json));
  const padded = Buffer.alloc(Math.ceil(encoded.length / 4) * 4, 0x20);
  encoded.copy(padded);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + padded.length + rest.length, 8);
  header.writeUInt32LE(padded.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const result = Buffer.concat([header, padded, rest]);
  assertPublicGlb(result);
  return result;
}

export function assertPublicGlb(bytes) {
  const { json } = readGlb(bytes);
  if (bytes.length >= 25 * 1024 * 1024) throw new Error('GLB exceeds Cloudflare Pages per-file budget');
  const text = JSON.stringify(json);
  if (/drive\.google|googleusercontent|\/Users\/|\/Volumes\/|\.blend\b|file:\/\//i.test(text)) throw new Error('Private production metadata in GLB');
  for (const asset of [...(json.buffers ?? []), ...(json.images ?? [])]) {
    if (asset.uri && !asset.uri.startsWith('data:')) throw new Error('External GLB resource is not permitted');
  }
  if (!(json.scenes?.length && json.meshes?.length)) throw new Error('GLB contains no renderable scene');
  return json;
}

export async function publishResidenceModels({ websiteRoot, assetRepoRoot, write = false, projectIds }) {
  const { residence3DModels } = await import('../../src/data/residence3DModels.ts');
  const models = residence3DModels.filter((model) => !projectIds?.length || projectIds.includes(model.projectId));
  if (!models.length) throw new Error('No reviewed model candidates selected');
  const plans = [];
  for (const model of models) {
    const warehouseRelative = `public-projects/${model.projectId}/approved-for-website/models/${model.residenceSlug}`;
    const warehouse = path.join(assetRepoRoot, warehouseRelative);
    const modelFilename = path.posix.basename(model.modelUrl);
    const posterFilename = path.posix.basename(model.posterUrl);
    const mobilePosterFilename = model.mobilePosterUrl ? path.posix.basename(model.mobilePosterUrl) : null;
    if (!/^model(?:-[a-z0-9-]+)?\.glb$/.test(modelFilename) || !/^poster(?:-[a-z0-9-]+)?\.webp$/.test(posterFilename)
      || (mobilePosterFilename && !/^poster(?:-[a-z0-9-]+)?\.webp$/.test(mobilePosterFilename))) throw new Error('Invalid model derivative filename');
    const reviewFilename = modelFilename === 'model.glb' ? 'asset-review.json' : modelFilename.replace('.glb', '-review.json');
    const review = JSON.parse(await fs.readFile(path.join(warehouse, reviewFilename), 'utf8'));
    if (review.modelId !== model.modelId || review.status !== 'approved' || review.visualQa !== 'pass') throw new Error(`Model asset needs review: ${model.modelId}`);
    const sourceFilename = review.sourceFile ?? 'source.glb';
    if (!/^source(?:-[a-z0-9-]+)?\.glb$/.test(sourceFilename)) throw new Error('Invalid private source filename');
    const source = await fs.readFile(path.join(warehouse, sourceFilename));
    if (hashBytes(source) !== review.sourceSha256) throw new Error(`Source changed since review: ${model.modelId}`);
    for (const [filename, publicPath, expectedHash] of [
      [modelFilename, model.modelUrl, review.modelSha256], [posterFilename, model.posterUrl, review.posterSha256],
      ...(mobilePosterFilename ? [[mobilePosterFilename, model.mobilePosterUrl, review.mobilePosterSha256]] : []),
    ]) {
      if (publicPath !== `/assets/projects/${model.projectId}/3d/${model.residenceSlug}/${filename}`) throw new Error(`Unexpected model destination: ${publicPath}`);
      const bytes = await fs.readFile(path.join(warehouse, filename));
      if (!bytes.length || hashBytes(bytes) !== expectedHash) throw new Error(`Derivative changed since review: ${model.modelId}/${filename}`);
      if (filename.endsWith('.glb')) assertPublicGlb(bytes);
      else if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Invalid WebP poster');
      const destination = path.join(websiteRoot, 'public', publicPath);
      const current = await fs.readFile(destination).catch((error) => { if (error.code === 'ENOENT') return null; throw error; });
      if (current && !current.equals(bytes)) throw new Error(`Existing derivative differs; approve a versioned asset path first: ${publicPath}`);
      plans.push({ bytes, destination, entry: {
        projectSlug: model.projectId, category: '3d', modelId: model.modelId,
        sourceRelativePath: `${warehouseRelative}/${filename}`, sourceAssetRepoPath: `${warehouseRelative}/${filename}`,
        websiteAssetPath: `public${publicPath}`, publicPath,
        sourceHash: expectedHash, outputHash: expectedHash, sourceSizeBytes: bytes.length, outputSizeBytes: bytes.length,
        sourceFormat: path.extname(filename), outputFormat: path.extname(filename),
        action: current ? 'skipped-existing' : 'published', reason: 'Hash-bound reviewed residence derivative',
      } });
    }
  }
  // Preflight the entire batch before the first write.
  if (write) {
    for (const plan of plans) { await fs.mkdir(path.dirname(plan.destination), { recursive: true }); await fs.writeFile(plan.destination, plan.bytes); }
    const manifestPath = path.join(websiteRoot, 'data/generated_asset_publish_manifest.json');
    const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const paths = new Set(plans.map(({ entry }) => entry.publicPath));
    const manifest = [...previous.filter((entry) => !paths.has(entry.publicPath)), ...plans.map(({ entry }) => entry)];
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }
  return { mode: write ? 'write' : 'dry-run', models: models.length, assets: plans.map(({ entry }) => entry.publicPath) };
}
