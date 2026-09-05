// Read-only retrieval of public official plan sources for P2-001 review.
// Never updates approved assets or facts. HTTP/metadata dates are NOT revisions.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const out = path.resolve('.runtime/p2-source-review');
await fs.mkdir(out, { recursive: true });
const urls = [
  ['alba-residences.html', 'https://www.albapalmbeach.com/residences/'],
  ['alba-downloads.html', 'https://www.albapalmbeach.com/downloads/'],
  ['alba-d-official.pdf', 'https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf'],
  ['olara-floorplans.html', 'https://www.olarawestpalmbeach.com/floorplans'],
  ['olara-d-official.pdf', 'https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf'],
];
const results = [];
for (const [name, url] of urls) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'WPB-New-Construction-Source-Review/1.0' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length > 20000000) throw new Error('Source exceeds review size limit');
    await fs.writeFile(path.join(out, name), data);
    const result = { url, status: response.status, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') };
    if (name.endsWith('.html')) {
      const html = data.toString('utf8').replace(/\\\//g, '/').replace(/&amp;/g, '&');
      result.pdfLinks = [...new Set([...html.matchAll(/(?:https?:\/\/[^"'<>\s]+|\/wp-content\/[^"'<>\s]+)\.pdf(?:\?[^"'<>\s]*)?/gi)].map((m) => new URL(m[0], url).href))];
      // Only text containing Residence D/floorplan resource links; no forms submitted.
      result.residenceDContext = [...html.matchAll(/.{0,150}(?:Residence\s*D|Floorplans[-_]D|1,786|2,374).{0,150}/gi)].slice(0, 20).map((m) => m[0]);
    }
    results.push(result);
  } catch (error) { results.push({ url, status: 'unavailable', reason: error.message }); }
}
await fs.writeFile(path.join(out, 'retrieval.json'), JSON.stringify({ retrievedAt: new Date().toISOString(), note: 'Retrieved date and HTTP dates do not establish drawing revision or current availability.', results }, null, 2));
console.log(JSON.stringify({ sourceRetrieval: 'complete', successful: results.filter((r) => r.status === 200).length, unavailable: results.filter((r) => r.status !== 200).length }));
