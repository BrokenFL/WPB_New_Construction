import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {parse} from 'csv-parse/sync';
import {readTsArray} from './article-market-note-utils.mjs';
import {renderRevenueBuyerResearch} from '../../shared/revenue-buyer-research.mjs';
const BASE='1a5c9f90125580037e5b44c6e90ec8f53aeccd63';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const original=f=>execFileSync('git',['show',`${BASE}:${f}`],{encoding:'utf8',maxBuffer:50*1024*1024});
const html=route=>fs.readFileSync(path.join('dist',route,'index.html'),'utf8');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const IDS=['shorecrest','south-flagler-house'];
const models=read('src/generated/projectModelPublic.json').projects;
const copies=read('content/project-copy-package.json');
const decisions=read('content/project-identity-decisions.json').projects;
const CSV='content/wpb_new_construction_building_database_cleaned.csv';
const rows=parse(fs.readFileSync(CSV,'utf8'),{columns:true,skip_empty_lines:true});
const approved=readTsArray(fs.readFileSync('src/data/floorplanApprovedLibrary.ts','utf8'),'approvedFloorplanLibrary');
const catalog=read('public/data/floorplans.json').projects;
for(const id of IDS){
 test(`${id}: facts, Compare, copy and gallery agree without a false delivery date`,()=>{
  const p=models.find(p=>p.publicSlug===id),c=copies.find(c=>c.repoProjectId===id),d=decisions.find(d=>d.publicSlug===id);
  const row=rows.find(r=>r.project_id===d.compareDatabaseId),fact=label=>c.quickFacts.find(f=>f.label===label)?.value;
  assert.equal(p.projectType,'condo-active-sales');
  for(const [label,key,rowKey] of [['Address','address','public_address'],['Residences','residences','residence_count'],['Delivery','delivery','completion_or_delivery'],['Price Range','price','price_display'],['Status','status','status_badge']]){
   const value=key==='address'?p.facts.projectAddress:p[key];
   assert.equal(fact(label),value,`${id} ${label} copy`);assert.equal(row[rowKey],value,`${id} ${label} compare`);
  }
  assert.equal(p.presentation.deliveryYear,0);assert.equal(fact('Sales Gallery'),p.facts.salesGalleryAddress);
  assert.notEqual(p.facts.projectAddress,p.facts.salesGalleryAddress);assert.equal(row.price_range_max,'');
  assert.equal(String(p.facts.stories),row.floor_count);assert.equal(fact('Floors'),row.floor_count);
  assert.doesNotMatch(row.maintenance_per_sqft,/\$\d/);assert.doesNotMatch(row.deposit_structure,/\d+%/);
  assert.match(p.residences,/Related Ross/);assert.match(p.delivery,/Request current/);
 });
 test(`${id}: built metadata, canonical, public buyer links and schema`,()=>{
  const c=copies.find(c=>c.repoProjectId===id),h=html(`/projects/${id}/`);
  assert.equal(decode(h.match(/<title>(.*?)<\/title>/s)[1]),c.seoTitle);
  assert.equal(decode(h.match(/<meta name="description" content="([^"]*)"/)[1]),c.metaDescription);
  assert.ok(h.includes(`rel="canonical" href="https://www.wpbnewconstruction.com/projects/${id}/"`));
  assert.ok(h.includes(renderRevenueBuyerResearch(id)));
  const facts=decode(h.match(/<section data-project-section="facts">([\s\S]*?)<\/section>/)?.[1]||'');
  assert.match(facts,/Sales gallery address/);assert.match(facts,/Related Ross/);assert.doesNotMatch(facts,/1Q 2027|2Q 2027|\$3\.69M|\$3\.6M/);
  const safe=read('src/generated/projectSchemaSafe.json').projects.find(p=>p.identity.slug===id);
  assert.ok(safe.omittedFields.includes('residenceCount'),'disputed count must stay omitted');
  for(const m of h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
   const graph=JSON.stringify(JSON.parse(m[1]));assert.doesNotMatch(graph,/"@type"\s*:\s*"(?:Offer|AggregateOffer)"/);
  }
 });
 test(`${id}: approved layout records match static, public JSON and LLM discovery`,()=>{
  const p=catalog.find(x=>x.projectId===id),a=approved.find(x=>x.projectId===id);
  assert.equal(p.count,a.count);assert.deepEqual(p.plans.map(x=>x.href).sort(),a.plans.map(x=>x.href).sort());
  assert.ok(html(`/projects/${id}/`).includes(`${a.count} canonical plans tracked`));
  const llms=fs.readFileSync('dist/llms.txt','utf8');assert.ok(llms.includes(`- ${p.name}: ${p.count} floorplan records`));
  assert.ok(html('/floorplans/').includes(`id="floorplans-${id}"`));
 });
}
test('South Flagler discovery retains the distinct corridor, residence and comparison pages',()=>{
 const h=html('/corridors/south-flagler/');
 assert.match(decode(h),/<title>South Flagler New Construction Condos \| Plans & Buyer Guide<\/title>/);
 assert.ok(h.includes('/floorplans/#floorplans-south-flagler-house'));assert.ok(h.includes('/projects/south-flagler-house/'));
 assert.ok(h.includes('rel="canonical" href="https://www.wpbnewconstruction.com/corridors/south-flagler/"'));
 for(const slug of ['south-flagler-house-keeps-west-palm-beach-luxury-buyers-line-shopping','olara-vs-shorecrest-waterfront-buyer-profiles']){
  const route=`/market-notes/${slug}/`,text=html(route);assert.ok(text.includes(renderRevenueBuyerResearch(slug)));
  assert.ok(text.includes(`rel="canonical" href="https://www.wpbnewconstruction.com${route}"`));
 }
});
test('The existing SFH north/south harvest identities do not become duplicate plan inventories',()=>{
 assert.equal(catalog.filter(p=>p.projectId==='south-flagler-house').length,1);
 assert.equal(catalog.filter(p=>/^south-flagler-house-(north|south)$/.test(p.projectId)).length,0);
 assert.doesNotMatch(fs.readFileSync('dist/llms.txt','utf8'),/South Flagler House (North|South): \d+ floorplan records/);
});
test('All prior document URLs remain byte-identical, including seven target legacy documents',()=>{
 const registered=read('config/preserved-floorplan-document-urls.json');
 const existing=JSON.parse(original('config/preserved-floorplan-document-urls.json'));
 assert.ok(existing.every(url=>registered.includes(url)));assert.equal(registered.length,77);
 for(const url of registered)assert.ok(fs.readFileSync(path.join('public',url.slice(1))).equals(fs.readFileSync(path.join('dist',url.slice(1)))),url);
});
test('Non-target project facts and Compare rows remain exactly as Batch 1 left them',()=>{
 const BATCH3=['berkeley','mandarin-oriental','mr-c']; // batch 3 intentionally updated these; covered by revenue-seo-batch3.test.mjs
 const skip=p=>IDS.includes(p)||BATCH3.includes(p);
 const before=JSON.parse(original('src/generated/projectModelPublic.json')).projects;
 for(const p of before.filter(p=>!skip(p.publicSlug)))assert.deepEqual(models.find(x=>x.publicSlug===p.publicSlug),p,p.publicSlug);
 const targetRows=new Set(decisions.filter(d=>skip(d.publicSlug)).map(d=>d.compareDatabaseId));
 for(const row of parse(original(CSV),{columns:true,skip_empty_lines:true}).filter(r=>!targetRows.has(r.project_id)))assert.deepEqual(rows.find(r=>r.project_id===row.project_id),row,row.project_id);
 const oldCopy=JSON.parse(original('content/project-copy-package.json'));
 for(const c of oldCopy.filter(c=>!skip(c.repoProjectId)))assert.deepEqual(copies.find(x=>x.repoProjectId===c.repoProjectId),c);
 assert.equal(models.length,24);
});
test('Unchanged approved plans, article facts, approvals, identity and 3D files',()=>{
 for(const file of ['content/overrides/project-fact-overrides.json','content/overrides/project-fact-automated.json','content/project-identity-decisions.json','src/data/marketNotes.ts','src/data/floorplanApprovedLibrary.ts','src/lib/floorplanEntities.ts','research/news-review/approved-development-news.json'])assert.equal(fs.readFileSync(file,'utf8'),original(file),file);
 const changes=execFileSync('git',['diff','--name-only',BASE],{encoding:'utf8'}).trim().split('\n');
 assert.equal(changes.some(p=>/\.(?:blend|glb|gltf|fbx|pdf|jpe?g|png|webp)$/i.test(p)),false,'source/binary plan or model asset changed');
});
test('Batch 1 commercial paths and all unrelated plan inventories remain intact',()=>{
 const before=JSON.parse(original('public/data/floorplans.json')).projects;
 for(const p of before.filter(p=>!['shorecrest','south-flagler-house','south-flagler-house-north','south-flagler-house-south'].includes(p.projectId)))assert.deepEqual(catalog.find(x=>x.projectId===p.projectId),p,p.projectId);
 for(const id of ['nora-house','banyan-tree','olara','ritz-carlton-wpb'])assert.ok(html(`/projects/${id}/`).includes(renderRevenueBuyerResearch(id)));
 assert.ok(fs.existsSync('dist/floorplans/olara/residence-d/index.html'));
 assert.equal(renderRevenueBuyerResearch('the-sound-west-palm-beach'),'');
});
