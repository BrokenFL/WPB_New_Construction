import fs from 'node:fs';
import path from 'node:path';

/** No-key is a negative test, never a substitute for the required keyed job. */
export function assertNoKeyBuild(root = process.cwd()) {
  if (process.env.VITE_GOOGLE_MAPS_API_KEY?.trim()) throw new Error('No-key QA cannot use a configured key.');
  const dist = path.join(root, 'dist');
  if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('Build required before no-key QA.');
  let scripts = 0;
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) walk(file);
      else if (item.name.endsWith('.js')) {
        scripts++;
        if (fs.readFileSync(file, 'utf8').includes('maps.googleapis.com/maps/api/js')) {
          throw new Error('No-key QA rejected a build containing a Maps loader.');
        }
      }
    }
  }
  walk(dist);
  if (!scripts) throw new Error('No built JavaScript found.');
  return { noKeyBuild: true, scripts };
}
