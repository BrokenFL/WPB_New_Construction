import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { comparisonPages, renderComparison, renderComparisonLinks } from '../../src/lib/comparisonContent.ts';
import { publishedFloorplanEntities, renderFloorplanPage } from '../../src/lib/floorplanEntities.ts';
const origin='https://www.wpbnewconstruction.com';
const results=[];
const sha256=b=>createHash('sha256').update(b).digest('hex');
async function get(route){const r=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'}});assert.equal(r.status,200,route);return Buffer.from(await r.arrayBuffer());}
try {
 for(const [key,c] of Object.entries(comparisonPages)) {
  const bytes=await get(c.path);assert.ok(bytes.toString().includes(renderComparison(key)), 'Deployed comparison differs from approved source');
  results.push({check:'exact-comparison-html',route:c.path,sha256:sha256(bytes),status:'pass'});
 }
 for(const route of ['/answers/','/compare/','/projects/olara/','/projects/ritz-carlton-wpb/','/projects/shorecrest/']) {
  const html=(await get(route)).toString();assert.ok(html.includes(renderComparisonLinks()),route);
  assert.equal((html.match(/data-comparison-discovery/g)||[]).length,1,route);
  results.push({check:'static-discovery',route,status:'pass'});
 }
 for(const p of publishedFloorplanEntities()) {
  const html=(await get(p.path)).toString();assert.ok(html.includes(renderFloorplanPage(p)));
  assert.ok(html.includes(`rel="canonical" href="${p.canonical}"`));
  for(const asset of [p.pdf,p.preview]) {
   const bytes=await get(asset);assert.equal(sha256(bytes),sha256(await fs.readFile('public'+asset)),asset);
   results.push({check:'approved-plan-asset',asset,sha256:sha256(bytes),status:'pass'});
  }
  results.push({check:'preserved-floorplan',route:p.path,status:'pass'});
 }
 const llms=(await get('/llms.txt')).toString();assert.ok(llms.includes(comparisonPages.trio.path));
 assert.equal((await fetch(origin+'/floorplans/alba-palm-beach/residence-d/')).status,404);
 results.push({check:'discovery-and-hold',llms:true,albaHTML:404,status:'pass'});
} catch(e) {results.push({status:'fail',type:e.name,message:e.message.slice(0,240)});process.exitCode=1;}
await fs.mkdir('.runtime/p2-live-details',{recursive:true});
const report={deployedSha:process.env.DEPLOYED_SHA,origin,checkedAt:new Date().toISOString(),status:process.exitCode?'fail':'pass',results};
await fs.writeFile('.runtime/p2-live-details/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
