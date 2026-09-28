import fs from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, flatten, join, meshopt, prune, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { hashBytes, publicGlb, readGlb } from './lib/residence-model-assets.mjs';

const [sourcePath, destinationPath] = process.argv.slice(2);
if (!sourcePath || !destinationPath || sourcePath === destinationPath) throw new Error('Usage: node scripts/optimize-residence-model.mjs SOURCE.glb NEW-OUTPUT.glb');
await fs.access(destinationPath).then(() => { throw new Error('Refusing to overwrite an existing model'); }, (error) => { if (error.code !== 'ENOENT') throw error; });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const document = await io.read(sourcePath);

function inventory(doc, bytes) {
  const root = doc.getRoot();
  const { json } = readGlb(bytes);
  let triangles = 0;
  let primitives = 0;
  for (const node of root.listNodes()) for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
    const count = primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION')?.getCount() ?? 0;
    triangles += primitive.getMode() === 4 ? count / 3 : Math.max(0, count - 2);
    primitives++;
  }
  return { bytes: bytes.length, sha256: hashBytes(bytes), triangles, primitives,
    meshes: root.listMeshes().length, materials: root.listMaterials().length,
    textureObjects: json.textures?.length ?? 0, imageCount: json.images?.length ?? 0,
    textures: root.listTextures().map((texture) => ({ resolution: texture.getSize(), mimeType: texture.getMimeType(), bytes: texture.getImage()?.length ?? 0 })),
    extensions: root.listExtensionsUsed().map((extension) => extension.extensionName) };
}

const original = inventory(document, await fs.readFile(sourcePath));
// No simplification or topology reduction. Keep transparent objects separate so
// railing/window sorting remains equivalent to the source when orbiting.
await document.transform(dedup(), prune(), weld(), flatten(), join({
  filter: (node) => node.getMesh()?.listPrimitives().every((primitive) => !primitive.getMaterial() || primitive.getMaterial().getAlphaMode() === 'OPAQUE') ?? false,
}), prune());
if (document.getRoot().listTextures().length) await document.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], quality: 90 }));
await document.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 14 }));
const output = publicGlb(Buffer.from(await io.writeBinary(document)));
await fs.mkdir(path.dirname(destinationPath), { recursive: true });
await fs.writeFile(destinationPath, output);
const optimized = inventory(await io.read(destinationPath), output);
const audit = { original, optimized, operations: ['deduplicate', 'prune unused resources', 'weld identical vertices', 'flatten transforms', 'join opaque meshes by material', 'Meshopt medium, 16-bit positions, 12-bit normals, 14-bit UVs', ...(original.textures.length ? ['WebP quality 90, maximum 2048 pixels'] : ['no textures to resize or compress']), 'remove names and private extras'], simplified: false, visualQa: 'pending' };
await fs.writeFile(destinationPath + '.audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit));
