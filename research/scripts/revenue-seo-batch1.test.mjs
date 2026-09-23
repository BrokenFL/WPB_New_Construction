import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {parse} from 'csv-parse/sync';
import {readTsArray} from './article-market-note-utils.mjs';
import {renderRevenueBuyerResearch} from '../../shared/revenue-buyer-research.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ids=['nora-house','banyan-tree','olara','ritz-carlton-wpb'];
const copies=read('content/project-copy-package.json');
const model=read('src/generated/projectModelPublic.json').projects;
const decisions=read('content/project-identity-decisions.json').projects;
const csvPath='content/wpb_new_construction_building_database_cleaned.csv';
const csv=parse(fs.readFileSync(csvPath,'utf8'),{columns:true,skip_empty_lines:true});
const base='572f109282bc63f2e012185efa14abf0dae9bfc2';
const original=file=>execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8'});
const unescape=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const html=route=>fs.readFileSync(path.join('dist',route,'index.html'),'utf8');
for(const id of ids){
 test(`${id}: canonical, compare and copy agree on current commercial fields`,()=>{
  const p=model.find(p=>p.publicSlug===id),c=copies.find(p=>p.repoProjectId===id),d=decisions.find(p=>p.publicSlug===id);
  const row=csv.find(p=>p.project_id===d.compareDatabaseId);
  const fact=name=>c.quickFacts.find(f=>f.label===name)?.value;
  assert.equal(p.projectType,'condo-active-sales');
  assert.equal(row.price_display,p.price);assert.equal(fact('Price Range'),p.price);
  assert.equal(row.completion_or_delivery,p.delivery);assert.equal(fact('Delivery'),p.delivery);
  assert.equal(row.public_address,p.facts.projectAddress);assert.equal(fact('Address'),p.facts.projectAddress);
  assert.ok(p.facts.salesGalleryAddress);assert.equal(fact('Sales Gallery'),p.facts.salesGalleryAddress);
  assert.equal(row.price_range_max,'','no invented maximum price');
 });
 test(`${id}: built metadata, schema and buyer links`,()=>{
  const p=model.find(p=>p.publicSlug===id),c=copies.find(p=>p.repoProjectId===id),text=html(p.publicRoute);
  assert.equal(unescape(text.match(/<title>(.*?)<\/title>/s)[1]),c.seoTitle);
  assert.equal(unescape(text.match(/<meta name="description" content="([^"]*)"/)[1]),c.metaDescription);
  assert.ok(text.includes(`rel="canonical" href="https://www.wpbnewconstruction.com${p.publicRoute}"`));
  assert.ok(text.includes('data-project-type="condo-active-sales"'));
  assert.ok(text.includes(renderRevenueBuyerResearch(id)),'same semantic research block as SPA');
  for(const block of text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))assert.doesNotMatch(JSON.stringify(JSON.parse(block[1])),/"@type"\s*:\s*"(?:Offer|AggregateOffer)"/);
  const facts=text.match(/<section data-project-section="facts">([\s\S]*?)<\/section>/)?.[1]||'';
  assert.ok(facts.includes('Sales gallery address'));
  if(['nora-house','banyan-tree'].includes(id))assert.doesNotMatch(facts,/2028|2029|\$1\.9M|\$6M|\$7\.3M/);
 });
}
test('NORA gallery is not mislabeled as the residence address',()=>{
 const p=model.find(p=>p.publicSlug==='nora-house');assert.doesNotMatch(p.facts.projectAddress,/955/);assert.match(p.facts.salesGalleryAddress,/955 N Railroad Avenue, Suite B/);assert.match(p.facts.projectAddress,/confirm building address/);
});
test('North Flagler strengthens existing plans and comparisons without new routes',()=>{
 const h=html('/corridors/north-flagler/');assert.match(unescape(h),/<title>North Flagler New Construction Condos \| Compare & Floor Plans<\/title>/);assert.ok(h.includes(renderRevenueBuyerResearch('north-flagler')));assert.ok(fs.existsSync('dist/floorplans/olara/residence-d/index.html'));
});
test('Dated NORA article and distinct 2085 project keep their own canonical identities',()=>{
 const route='/market-notes/nora-house-turns-the-district-into-a-buyer-decision/',h=html(route);
 assert.ok(h.includes(`rel="canonical" href="https://www.wpbnewconstruction.com${route}"`));assert.ok(h.includes('href="/projects/nora-house/"'));assert.ok(h.includes(renderRevenueBuyerResearch('nora-house-turns-the-district-into-a-buyer-decision')));
 assert.ok(html('/projects/2085-north-flagler/').includes('rel="canonical" href="https://www.wpbnewconstruction.com/projects/2085-north-flagler/"'));
});
test('Unrelated compare rows, approvals, article snapshots and floor-plan code are unchanged',()=>{
 const before=parse(original(csvPath),{columns:true,skip_empty_lines:true}),allowed=new Set(decisions.filter(x=>ids.includes(x.publicSlug)).map(x=>x.compareDatabaseId));
 for(const row of before.filter(x=>!allowed.has(x.project_id)))assert.deepEqual(csv.find(x=>x.project_id===row.project_id),row);
 for(const file of ['content/overrides/project-fact-overrides.json','content/overrides/project-fact-automated.json','content/project-identity-decisions.json','src/data/marketNotes.ts','src/lib/floorplanEntities.ts'])assert.equal(fs.readFileSync(file,'utf8'),original(file),file);
 assert.equal(model.length,24);
});
test('Unsupported and prototype-like keys do not create a buyer block',()=>{
 for(const key of ['the-sound-west-palm-beach','<script>','__proto__'])assert.equal(renderRevenueBuyerResearch(key),'');
});
test('Approved plan assets are unchanged and public counts match the published UI',()=>{
 const sourceFile='src/data/floorplanApprovedLibrary.ts';
 assert.equal(fs.readFileSync(sourceFile,'utf8'),original(sourceFile),'approved asset library is unchanged');
 const approved=readTsArray(fs.readFileSync(sourceFile,'utf8'),'approvedFloorplanLibrary');
 const file='public/data/floorplans.json',before=JSON.parse(original(file)),after=read(file);
 assert.equal(after.projects.length,before.projects.length);
 for(const p of after.projects){
  const old=before.projects.find(x=>x.projectId===p.projectId);
  if(ids.includes(p.projectId)){
   const expected=approved.find(x=>x.projectId===p.projectId);
   assert.equal(p.projectType,'condo-active-sales');assert.equal(p.count,expected.count);
   assert.deepEqual(p.plans.map(x=>x.href).sort(),expected.plans.map(x=>x.href).sort());
   assert.ok(html(`/projects/${p.projectId}/`).includes(`${expected.count} canonical plans tracked`));
  }else{assert.deepEqual(p.plans,old.plans);assert.equal(p.count,old.count);}
 }
});
test('Banyan directs buyers to the seven approved layouts instead of a nonexistent-plan claim',()=>{
 const h=html('/projects/banyan-tree/');
 assert.ok(h.includes('/floorplans/#floorplans-banyan-tree'));
 assert.doesNotMatch(h,/No complete public floorplan packet is confirmed/);
 const hub=html('/floorplans/');assert.ok(hub.includes('id="floorplans-banyan-tree"'));
});
