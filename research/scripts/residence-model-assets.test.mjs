import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicGlb, publicGlb, readGlb } from '../../scripts/lib/residence-model-assets.mjs';

function glb(json) {
  const text = Buffer.from(JSON.stringify(json));
  const chunk = Buffer.alloc(Math.ceil(text.length / 4) * 4, 32); text.copy(chunk);
  const bytes = Buffer.alloc(20 + chunk.length);
  bytes.writeUInt32LE(0x46546c67, 0); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(bytes.length, 8);
  bytes.writeUInt32LE(chunk.length, 12); bytes.writeUInt32LE(0x4e4f534a, 16); chunk.copy(bytes, 20);
  return bytes;
}
const scene = { asset: { version: '2.0' }, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives: [] }] };
test('reject malformed, non-self-contained and private models', () => {
  assert.throws(() => readGlb(Buffer.alloc(20)), /Invalid/);
  assert.throws(() => assertPublicGlb(glb({ ...scene, images: [{ uri: 'https://example.com/source.png' }] })), /External/);
  assert.throws(() => assertPublicGlb(glb({ ...scene, extras: { source: '/Volumes/private.blend' } })), /Private/);
});
test('public derivative removes production names and extras recursively', () => {
  const source = glb({ ...scene, asset: { version: '2.0', generator: 'Blender', extras: { source: '/Users/private' } }, nodes: [{ name: 'private production name', mesh: 0, extras: { uri: 'https://drive.google.com/private' } }] });
  const output = publicGlb(source);
  const { json } = readGlb(output);
  assert.deepEqual(json.nodes, [{ mesh: 0 }]);
  assert.equal(json.asset.generator, 'WPB New Construction residence visualization');
  assertPublicGlb(output);
  assert.match(source.toString(), /private/);
});
