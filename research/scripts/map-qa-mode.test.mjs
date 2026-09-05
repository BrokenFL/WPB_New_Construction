import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assertNoKeyBuild } from './map-qa-mode.mjs';

test('explicit no-key mode rejects configured/loader-bearing builds and missing output', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wpb-no-key-'));
  const previous = process.env.VITE_GOOGLE_MAPS_API_KEY;
  try {
    delete process.env.VITE_GOOGLE_MAPS_API_KEY;
    assert.throws(() => assertNoKeyBuild(root), /Build required/);
    fs.mkdirSync(path.join(root, 'dist/assets'), { recursive: true });
    fs.writeFileSync(path.join(root, 'dist/index.html'), '<script src="/assets/entry.js"></script>');
    assert.throws(() => assertNoKeyBuild(root), /No built JavaScript/);
    fs.writeFileSync(path.join(root, 'dist/assets/entry.js'), 'console.log("no key fallback")');
    assert.equal(assertNoKeyBuild(root).noKeyBuild, true);
    fs.writeFileSync(path.join(root, 'dist/assets/split.js'), '"https://maps.googleapis.com/maps/api/js"');
    assert.throws(() => assertNoKeyBuild(root), /containing a Maps loader/);
    fs.rmSync(path.join(root, 'dist/assets/split.js'));
    process.env.VITE_GOOGLE_MAPS_API_KEY = 'synthetic-test-only';
    assert.throws(() => assertNoKeyBuild(root), /configured key/);
  } finally {
    if (previous === undefined) delete process.env.VITE_GOOGLE_MAPS_API_KEY;
    else process.env.VITE_GOOGLE_MAPS_API_KEY = previous;
    fs.rmSync(root, { recursive: true, force: true });
  }
});
