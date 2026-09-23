import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {parse} from 'csv-parse/sync';
import {renderRevenueBuyerResearch} from '../../shared/revenue-buyer-research.mjs';
const BASE='cd62da08be1d1f8adc1b4211341ed2b4d72ce23a';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const original=f=>execFileSync('git',['show',`${BASE}:${f}`],{encoding:'utf8',maxBuffer:50*1024*1024});
const html=route=>fs.readFileSync(path.join('dist',route,'index.html'),'utf8');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const IDS=['berkeley','mandarin-oriental','mr-c'];
const models=read('src/generated/projectModelPublic.json').projects;
const copies=read('content/project-copy-package.json');
const decisions=read('content/project-identity-decisions.json').projects;
const CSV='content/wpb_new_construction_building_database_cleaned.csv';
const rows=parse(fs.readFileSync(CSV,'utf8'),{columns:true,skip_empty_lines:true});
const catalog=read('public/data/floorplans.json').projects;
const EXPECTED={
 'berkeley':{delivery:'Not yet publicly confirmed.',price:'$2M to over $10M (reported; request current pricing)',address:'601\u2013621 Clearwater Park Road, West Palm Beach, FL 33401',floors:'25',compareDelivery:'To confirm \u2014 not publicly confirmed',comparePrice:'$2M to over $10M reported; request current pricing'},
 'mandarin-oriental':{delivery:'To confirm \u2014 completion estimates vary across reports.',price:'From $3.5M (Cervera published starting guidance; request current pricing and availability)',address:'5400 N Flagler Drive, West Palm Beach, FL',floors:'31',compareDelivery:'To confirm \u2014 reports vary',comparePrice:'From $3.5M published starting guidance (Cervera); request current pricing and availability'},
 'mr-c':{delivery:'To confirm \u2014 completion estimates vary across reports.',price:'Not yet publicly confirmed.',address:'327 Okeechobee Boulevard, West Palm Beach, FL 33401',floors:'27',compareDelivery:'To confirm \u2014 reports vary',comparePrice:'Request current pricing'},
};
for(const id of IDS){
 test(`${id}: copy, model, Compare and card agree with qualified commercial values`,()=>{
  const exp=EXPECTED[id],p=models.find(p=>p.publicSlug===id),c=copies.find(c=>c.repoProjectId===id),d=decisions.find(d=>d.publicSlug===id);
  const row=rows.find(r=>r.project_id===d.compareDatabaseId),fact=label=>c.quickFacts.find(f=>f.label===label)?.value;
  assert.equal(fact('Delivery'),exp.delivery,`${id} delivery copy`);
  assert.equal(fact('Price Range'),exp.price,`${id} price copy`);
  assert.equal(fact('Address'),exp.address,`${id} address copy`);
  assert.equal(p.presentation.deliveryYear,0,`${id} deliveryYear unknown sentinel`);
  assert.equal(row.completion_or_delivery,exp.compareDelivery,`${id} compare delivery`);
  assert.equal(row.price_display,exp.comparePrice,`${id} compare price`);
  assert.equal(row.price_range_min,'',`${id} no unverified min price`);
  assert.equal(row.price_range_max,'',`${id} no unverified max price`);
  assert.equal(row.public_address,exp.address,`${id} compare address`);
  assert.equal(row.floor_count,exp.floors,`${id} compare floors`);
  assert.doesNotMatch(row.maintenance_per_sqft,/\$\d/,`${id} no unverified $/sqft`);
  assert.doesNotMatch(row.deposit_structure,/\d+%/,`${id} no unverified deposit schedule`);
  assert.match(c.metaDescription,/request current pricing|Request current pricing/,`${id} meta carries buyer CTA qualifier`);
 });
 test(`${id}: built metadata, buyer guide, no stale commercial claims, no sales schema`,()=>{
  const c=copies.find(c=>c.repoProjectId===id),h=html(`/projects/${id}/`);
  assert.equal(decode(h.match(/<title>(.*?)<\/title>/s)[1]),c.seoTitle);
  const meta=decode(h.match(/<meta name="description" content="([^"]*)"/)[1]);
  assert.equal(meta,c.metaDescription);
  assert.ok(h.includes(`rel="canonical" href="https://www.wpbnewconstruction.com/projects/${id}/"`));
  assert.ok(h.includes(renderRevenueBuyerResearch(id)),`${id} buyer guide rendered`);
  assert.ok(h.includes(`/inquire/?project=${id}`),`${id} inquiry preserves project`);
  assert.doesNotMatch(h,/1Q 2027|2Q 2027|1Q 2031/,`${id} no stale quarter delivery`);
  assert.doesNotMatch(meta,/2031/,`${id} meta has no unresolved delivery year`);
  for(const m of h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
   const graph=JSON.stringify(JSON.parse(m[1]));assert.doesNotMatch(graph,/"@type"\s*:\s*"(?:Offer|AggregateOffer)"/);
  }
 });
}
test('berkeley: gallery distinction and no stale address/price',()=>{
 const h=html('/projects/berkeley/');
 assert.ok(h.includes('500 S. Australian Ave'), 'verified sales gallery present');
 assert.doesNotMatch(h,/550 S\. Australian Ave/, 'stale address variant gone');
 assert.doesNotMatch(h,/\$12\.75M/, 'stale price ceiling gone');
 assert.ok(h.includes('id="floorplans-berkeley"')||html('/floorplans/').includes('id="floorplans-berkeley"'));
});
test('mandarin-oriental: disputed residence ZIP omitted; lounge stays separate at 33480',()=>{
 const h=html('/projects/mandarin-oriental/');
 const c=copies.find(c=>c.repoProjectId==='mandarin-oriental');
 assert.ok(h.includes('5400 N Flagler Drive, West Palm Beach, FL'),'residence street/city present');
 assert.doesNotMatch(h,/5400 N\.? Flagler Drive[^<]{0,80}33407/,'residence address never paired with disputed 33407');
 assert.doesNotMatch(h,/5400 N\.? Flagler Drive[^<]{0,80}33480/,'residence address never paired with 33480');
 assert.ok(h.includes('205 Worth Avenue, #321, Palm Beach, FL 33480'),'sales lounge rendered separately at 33480');
 assert.ok(JSON.stringify(c.sourceNotes).includes('ZIP OMITTED'),'ZIP omission and evidence recorded in source notes');
 assert.ok(JSON.stringify(c.sourceNotes).includes('Starting from $3,500,000'),'pricing attribution recorded in source notes');
 assert.doesNotMatch(decode(h.match(/<title>(.*?)<\/title>/s)[1]),/2031/);
 assert.doesNotMatch(JSON.stringify([c.metaDescription,c.overview,c.localTake,c.tradeoffs,c.signatureFeatures,c.buyerComparisonNotes,c.showcase?.heroTags]),/2031/,'no unresolved 2031 claim in buyer copy');
});
test('mr-c: address corrected, no stale price/deposit or sellout urgency',()=>{
 const h=html('/projects/mr-c/');
 assert.ok(h.includes('327 Okeechobee Boulevard'));
 assert.doesNotMatch(h,/383 Okeechobee/,'stale address gone');
 assert.doesNotMatch(h,/\$2\.19\/sq ft/,'stale $/sqft gone');
 assert.doesNotMatch(h,/85% sold|nearing sellout|sold out/i,'no sellout urgency from dated reporting');
});
test('mr-c: verified sales gallery at 401 S. Olive rendered; building address stays 327 Okeechobee',()=>{
 const h=html('/projects/mr-c/');
 assert.ok(h.includes('401 S. Olive Avenue, West Palm Beach, FL 33401'),'verified sales gallery present');
 assert.ok(h.includes('327 Okeechobee Boulevard'),'project address intact');
 assert.doesNotMatch(h,/320 Lakeview/,'stale gallery address gone');
});
test('delivery sort: unknown (0) sentinel sorts last, never earliest or as year 0',()=>{
 const src=fs.readFileSync('src/main.ts','utf8');
 const idx=src.indexOf('sortValue === "delivery"');
 assert.ok(idx>0,'delivery sort branch exists');
 assert.ok(src.slice(idx,idx+200).includes('deliverySortValue'),'delivery branch routes through unknown-last helper');
 const helperIdx=src.indexOf('function deliverySortValue');
 assert.ok(helperIdx>0,'unknown-last helper defined');
 assert.ok(/MAX_SAFE_INTEGER/.test(src.slice(helperIdx,helperIdx+400)),'unknown delivery mapped to max sort value');
 assert.doesNotMatch(src,/getNumericDataset\(a, "d"\) - getNumericDataset\(b, "d"\)/,'raw 0-comparator gone');
 // the card template never emits data-d="0": unknown delivery renders as 9999 so the
 // public DOM never carries the internal 0 sentinel
 assert.ok(/data-d="\$\{project\.deliveryYear \|\| 9999\}"/.test(src),'card template maps unknown delivery to 9999, never 0');
 // visible delivery labels never render a bare 0 year on batch 3 project pages or the homepage cards
 const home=html('/');
 for(const id of IDS){
  const card=new RegExp(`<article[^>]*data-project-card="${id}"[\\s\\S]*?<\\/article>`).exec(home);
  if(card){
   const year=card[0].match(/data-pc-year="([^"]*)"/);
   assert.ok(year,'card carries delivery label');
   assert.ok(/confirm/i.test(year[1]),`${id} card shows timing-to-confirm label, got: ${year[1]}`);
   assert.ok(!/^0$/.test(year[1].trim()),`${id} card never shows bare 0`);
  }
 }
});
test('Buyer guides render for batch 3 keys, corridor and historical article links',()=>{
 for(const key of [...IDS,'mr-c-shows-downtown-branded-condos-still-move'])assert.ok(renderRevenueBuyerResearch(key).length>0,key);
 const nf=renderRevenueBuyerResearch('north-flagler');
 assert.ok(nf.includes('/projects/mandarin-oriental/'),'north-flagler guide links mandarin');
 const article=html('/market-notes/mr-c-shows-downtown-branded-condos-still-move/');
 assert.ok(article.includes(renderRevenueBuyerResearch('mr-c-shows-downtown-branded-condos-still-move')));
 assert.ok(article.includes('rel="canonical" href="https://www.wpbnewconstruction.com/market-notes/mr-c-shows-downtown-branded-condos-still-move/"'));
});
test('Batch 3 floorplan records untouched and document registry intact',()=>{
 const before=JSON.parse(original('public/data/floorplans.json')).projects;
 for(const id of IDS)assert.deepEqual(catalog.find(x=>x.projectId===id),before.find(x=>x.projectId===id),id);
 const registered=read('config/preserved-floorplan-document-urls.json');
 const existing=JSON.parse(original('config/preserved-floorplan-document-urls.json'));
 assert.ok(existing.every(url=>registered.includes(url)));assert.equal(registered.length,77);
 for(const url of registered)assert.ok(fs.readFileSync(path.join('public',url.slice(1))).equals(fs.readFileSync(path.join('dist',url.slice(1)))),url);
});
test('Non-target project facts, copy and Compare rows remain exactly as baseline',()=>{
 const batch4=new Set(['maison-dor','alba-palm-beach','olin-palm-beach']);
 const before=JSON.parse(original('src/generated/projectModelPublic.json')).projects;
 for(const p of before.filter(p=>!IDS.includes(p.publicSlug)&&!batch4.has(p.publicSlug)))assert.deepEqual(models.find(x=>x.publicSlug===p.publicSlug),p,p.publicSlug);
 const targetRows=new Set(decisions.filter(d=>IDS.includes(d.publicSlug)||batch4.has(d.publicSlug)).map(d=>d.compareDatabaseId));
 for(const row of parse(original(CSV),{columns:true,skip_empty_lines:true}).filter(r=>!targetRows.has(r.project_id)))assert.deepEqual(rows.find(r=>r.project_id===row.project_id),row,row.project_id);
 const oldCopy=JSON.parse(original('content/project-copy-package.json'));
 for(const c of oldCopy.filter(c=>!IDS.includes(c.repoProjectId)&&!batch4.has(c.repoProjectId)))assert.deepEqual(copies.find(x=>x.repoProjectId===c.repoProjectId),c);
 assert.equal(models.length,24);
});
test('Batch 1-2 buyer journeys and metadata unchanged',()=>{
 for(const id of ['nora-house','banyan-tree','olara','ritz-carlton-wpb','shorecrest','south-flagler-house']){
  const h=html(`/projects/${id}/`);assert.ok(h.includes(renderRevenueBuyerResearch(id)),id);
 }
 const oldCopy=JSON.parse(original('content/project-copy-package.json'));
 for(const id of ['nora-house','banyan-tree','olara','ritz-carlton-wpb','shorecrest','south-flagler-house']){
  const c=copies.find(c=>c.repoProjectId===id),o=oldCopy.find(c=>c.repoProjectId===id);
  assert.equal(c.seoTitle,o.seoTitle,`${id} title`);assert.equal(c.metaDescription,o.metaDescription,`${id} meta`);
 }
 assert.ok(html('/corridors/north-flagler/').includes('/projects/mandarin-oriental/'));
 assert.ok(html('/corridors/downtown-west-palm-beach/').includes('/projects/berkeley/'));
});
test('Unchanged approvals, articles, identity, plans and 3D files',()=>{
 const beforeOverrides=JSON.parse(original('content/overrides/project-fact-overrides.json')).projects,afterOverrides=read('content/overrides/project-fact-overrides.json').projects;
 for(const [slug,fields] of Object.entries(beforeOverrides).filter(([slug])=>slug!=='alba-palm-beach'))assert.deepEqual(afterOverrides[slug],fields,slug);
 const beforeIdentity=JSON.parse(original('content/project-identity-decisions.json')).projects;
 for(const decision of beforeIdentity.filter(d=>!['maison-dor','alba-palm-beach','olin-palm-beach'].includes(d.publicSlug)))assert.deepEqual(decisions.find(d=>d.publicSlug===decision.publicSlug),decision);
 for(const file of ['content/overrides/project-fact-automated.json','src/data/marketNotes.ts','src/data/floorplanApprovedLibrary.ts','src/lib/floorplanEntities.ts','research/news-review/approved-development-news.json'])assert.equal(fs.readFileSync(file,'utf8'),original(file),file);
 const changes=execFileSync('git',['diff','--name-only',BASE],{encoding:'utf8'}).trim().split('\n');
 assert.equal(changes.some(p=>/\.(?:blend|glb|gltf|fbx|pdf|jpe?g|png|webp)$/i.test(p)),false,'source/binary plan or model asset changed');
});
