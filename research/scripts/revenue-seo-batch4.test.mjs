import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {parse} from 'csv-parse/sync';
import {renderRevenueBuyerResearch} from '../../shared/revenue-buyer-research.mjs';

// The Batch 3 handoff commit is the reviewed baseline for this scoped update.
const BASE='eed5434c81a734f56f7553c2fd704b245a015709';
const BATCH4_IDS=['maison-dor','alba-palm-beach','olin-palm-beach'];
const PRIOR_IDS=['nora-house','banyan-tree','olara','ritz-carlton-wpb','shorecrest','south-flagler-house','berkeley','mandarin-oriental','mr-c'];
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const original=f=>execFileSync('git',['show',`${BASE}:${f}`],{encoding:'utf8',maxBuffer:50*1024*1024});
const html=route=>fs.readFileSync(path.join('dist',route,'index.html'),'utf8');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;|&#x27;/gi,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const getOne=(items,key,value)=>{
 const matches=items.filter(item=>item?.[key]===value);
 assert.equal(matches.length,1,`expected one ${key}=${value}`);
 return matches[0];
};
const copyById=read('content/project-copy-package.json');
const publicCopies=read('public/data/project-copy-package.json');
const models=read('src/generated/projectModelPublic.json').projects;
const decisions=read('content/project-identity-decisions.json').projects;
const modelById=id=>getOne(models,'publicSlug',id);
const copyByProjectId=id=>getOne(copyById,'repoProjectId',id);
const publicCopyByProjectId=id=>getOne(publicCopies,'repoProjectId',id);
const fact=(project,label)=>project.quickFacts.find(row=>row.label===label)?.value;
const CSV='content/wpb_new_construction_building_database_cleaned.csv';
const rows=parse(fs.readFileSync(CSV,'utf8'),{columns:true,skip_empty_lines:true});
const publicBuildingSource=fs.readFileSync('src/generated/buildingDatabasePublic.ts','utf8');
const publicBuildingRow=id=>{
 const marker=new RegExp(`"project_id"\\s*:\\s*"${id}"`).exec(publicBuildingSource);
 assert.ok(marker,`generated public Compare record exists for ${id}`);
 const start=publicBuildingSource.lastIndexOf('{',marker.index);
 let depth=0,inString=false,escaped=false;
 for(let index=start;index<publicBuildingSource.length;index++){
  const char=publicBuildingSource[index];
  if(inString){
   if(escaped)escaped=false;
   else if(char==='\\')escaped=true;
   else if(char==='"')inString=false;
   continue;
  }
  if(char==='"'){inString=true;continue;}
  if(char==='{')depth++;
  if(char==='}'&&--depth===0){
   return JSON.parse(publicBuildingSource.slice(start,index+1).replace(/,(\s*})/g,'$1'));
  }
 }
 assert.fail(`unterminated generated public Compare record for ${id}`);
};
const compareRow=id=>{
 const decision=getOne(decisions,'publicSlug',id);
 return getOne(rows,'project_id',decision.compareDatabaseId);
};
const publicCopyText=project=>JSON.stringify({
 seoTitle:project.seoTitle,
 metaDescription:project.metaDescription,
 heroHeadline:project.heroHeadline,
 heroSubheadline:project.heroSubheadline,
 overview:project.overview,
 localTake:project.localTake,
 brookeTake:project.brookeTake,
 tradeoffs:project.tradeoffs,
 signatureFeatures:project.signatureFeatures,
 quickFacts:(project.quickFacts||[]).map(({label,value,note})=>({label,value,note})),
 showcase:project.showcase,
});
const publicPageText=page=>decode(page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 .replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ');
const metadata=page=>{
 const title=page.match(/<title>([\s\S]*?)<\/title>/i);
 const description=page.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
 const canonical=page.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
 assert.ok(title,'built page has a title');
 assert.ok(description,'built page has a description');
 assert.ok(canonical,'built page has a canonical');
 return {title:decode(title[1]),description:decode(description[1]),canonical:decode(canonical[1])};
};
const currencyBand=/\$\s*[\d,]+(?:\.\d+)?\s*(?:k|m|thousand|million)?\s*(?:-|–|—|\bto\b)\s*(?:\$\s*)?[\d,]+(?:\.\d+)?\s*(?:k|m|thousand|million)?/i;

for(const id of BATCH4_IDS){
 test(`${id}: static metadata, buyer guide and public data stay aligned`,()=>{
  const source=copyByProjectId(id),published=publicCopyByProjectId(id),model=modelById(id);
  const page=html(`/projects/${id}/`),meta=metadata(page);
  assert.equal(meta.title,source.seoTitle,`${id} static title`);
  assert.equal(meta.description,source.metaDescription,`${id} static description`);
  assert.equal(meta.canonical,`https://www.wpbnewconstruction.com/projects/${id}/`,`${id} canonical`);
  assert.equal(published.seoTitle,source.seoTitle,`${id} published title`);
  assert.equal(published.metaDescription,source.metaDescription,`${id} published description`);
  assert.equal(model.publicSlug,id,`${id} public model`);
  assert.ok(page.includes(renderRevenueBuyerResearch(id)),`${id} buyer guide rendered`);
  assert.ok(page.includes(`/inquire/?project=${id}`),`${id} project inquiry link rendered`);
 });
}

test('Maison d’Or omits the unresolved building number and keeps the Dixie gallery in its separate public field',()=>{
 const source=copyByProjectId('maison-dor'),published=publicCopyByProjectId('maison-dor'),model=modelById('maison-dor');
 const h=html('/projects/maison-dor/'),publicText=publicPageText(h);
 assert.match(fact(source,'Address'),/South Flagler Drive, West Palm Beach/i);
 assert.match(fact(source,'Sales Gallery'),/3014 S Dixie Highway, West Palm Beach, FL 33405/);
 assert.match(fact(published,'Address'),/South Flagler Drive, West Palm Beach/i);
 assert.match(fact(published,'Sales Gallery'),/3014 S Dixie Highway, West Palm Beach, FL 33405/);
 assert.doesNotMatch(publicCopyText(source),/\b(?:3705|3773)\b/,'buyer-facing copy omits both disputed building numbers');
 assert.doesNotMatch(model.presentation.summary,/\b(?:3705|3773)\b/,'project card model omits the disputed building number');
 assert.doesNotMatch(publicText,/\b(?:3705|3773)\b/,'rendered public page omits both disputed building numbers');
});

test('Alba attributes immediate occupancy to the developer and keeps one sale residence-specific',()=>{
 const source=copyByProjectId('alba-palm-beach'),row=compareRow('alba-palm-beach');
 const publicText=publicCopyText(source),pageText=publicPageText(html('/projects/alba-palm-beach/'));
 assert.match(fact(source,'Delivery'),/developer.*immediate occupancy.*confirm specific residence/i);
 assert.match(source.metaDescription,/developer advertised immediate occupancy in September 2026/i);
 assert.match(publicText,/One recorded Unit 1003 sale does not establish availability across the building/i);
 assert.match(row.completion_or_delivery,/developer.*immediate occupancy.*confirm specific residence/i);
 assert.match(pageText,/(?:developer|project sponsor).*immediate occupancy/i);
 assert.match(pageText,/Unit 1003 sale does not establish availability across the building/i);
 assert.doesNotMatch(`${publicText} ${pageText}`,/\b(?:all|every)\s+(?:55\s+)?(?:homes|units|residences)\s+(?:are\s+)?(?:ready|available|closing|closed)\b|\bbuilding[- ]wide\s+closings?\b/i,
  'one sale or an immediate-occupancy offer is not generalized to all residences');
});

test('OLIN publishes no numeric budget bands or unverified gallery, form or plan availability',()=>{
 const source=copyByProjectId('olin-palm-beach'),model=modelById('olin-palm-beach'),row=compareRow('olin-palm-beach'),publicBuilding=publicBuildingRow('olin-palm-beach');
 const h=html('/projects/olin-palm-beach/'),pageText=publicPageText(h);
 const publicText=publicCopyText(source),modelText=JSON.stringify(model.presentation);
 const numericPrice=/\$\s*\d[\d,.]*(?:\s*(?:k|m|million|thousand))?/i;
 for(const [label,value] of [['copy',publicText],['published copy',publicCopyText(publicCopyByProjectId('olin-palm-beach'))],['project model',modelText],['built public page',pageText],['metadata',source.metaDescription]]){
  assert.doesNotMatch(value,currencyBand,`${label} has no budget amount band`);
  assert.doesNotMatch(value,numericPrice,`${label} has no numeric price value`);
 }
 for(const [label,record] of [['Compare source CSV',row],['generated public Compare',publicBuilding]]){
  assert.equal(record.price_display,'Request Current Pricing',`${label} uses current-pricing inquiry copy`);
  assert.equal(record.price_range_min,'',`${label} has no numeric minimum price`);
  assert.equal(record.price_range_max,'',`${label} has no numeric maximum price`);
  for(const field of ['price_display','price_range_min','price_range_max'])
   assert.doesNotMatch(record[field],numericPrice,`${label} ${field} has no numeric price value`);
  assert.equal(record.floorplan_count,'Not publicly verified in reviewed sources',`${label} qualifies the unverified plan count`);
  assert.equal(record.floorplan_status,'Not publicly verified in reviewed sources',`${label} qualifies plan status with reviewed-source scope`);
  assert.doesNotMatch(`${record.floorplan_count} ${record.floorplan_status}`,/Not publicly released|Inquiry \/ sales materials/i,`${label} makes no categorical plan-availability claim`);
 }
 assert.match(fact(source,'Pricing'),/request current pricing/i);
 assert.match(row.price_display,/request current pricing/i);
 assert.equal(model.presentation.floorplans,false,'no current public floorplan collection is promised');
 assert.equal(source.quickFacts.some(item=>/sales gallery|floor.?plans?/i.test(item.label)),false,'no sales gallery or plans fact is published');
 assert.equal(read('public/data/floorplans.json').projects.some(item=>item.projectId==='olin-palm-beach'),false,'no OLIN plan listing is published');
 assert.match(source.overview,/pricing, delivery timing, floor plans, gallery arrangements and tour availability were not publicly verified/i);
 assert.match(pageText,/Palm Beach Island/i,'public page identifies OLIN as a Palm Beach Island project');
 assert.doesNotMatch(pageText,/\b(?:future|planning[- ]stage)\s+(?:project\s+)?(?:in\s+)?West Palm Beach\b|\bWest Palm Beach\s+(?:future|planning[- ]stage)\b/i,
  'Palm Beach Island copy is not generalized as a future West Palm Beach project');
 assert.doesNotMatch(pageText,/\bpublished\s+(?:floor\s+)?plans?\b/i,'no generic promise of published plans');
 assert.match(pageText,/released\s+(?:floor\s+)?plans?[^.]{0,100}not publicly verified/i,'page states released plans were not publicly verified');
 assert.doesNotMatch(pageText,/\b(?:current|official)\s+(?:developer\s+)?(?:inquiry|contact) form\s+(?:is\s+)?(?:available|active|open)|sales gallery\s+(?:is\s+)?(?:open|now open|located at)|released floor plans?\s+(?:are\s+)?(?:available|ready|now available)|tour availability\s+(?:is\s+)?confirmed/i,
  'the rendered page makes no current developer form, sales-gallery or floor-plan promise');
 assert.doesNotMatch(h,/href="[^"]*floorplans[^\"]*olin-palm-beach/i,'no OLIN plan link is rendered');
 assert.match(model.presentation.summary,/32-residence ocean-to-lagoon/i);
 assert.match(model.presentation.summary,/request current pricing/i);
});

test('all non-target copy, compare rows and public project facts remain at the Batch 3 baseline',()=>{
 const baseCopies=JSON.parse(original('content/project-copy-package.json'));
 for(const item of baseCopies.filter(item=>!BATCH4_IDS.includes(item.repoProjectId)))
  assert.deepEqual(copyByProjectId(item.repoProjectId),item,item.repoProjectId);

 const baseRows=parse(original(CSV),{columns:true,skip_empty_lines:true});
 const targetCompareIds=new Set(decisions.filter(item=>BATCH4_IDS.includes(item.publicSlug)).map(item=>item.compareDatabaseId));
 for(const item of baseRows.filter(item=>!targetCompareIds.has(item.project_id)))
  assert.deepEqual(getOne(rows,'project_id',item.project_id),item,item.project_id);

 const baseModels=JSON.parse(original('src/generated/projectModelPublic.json')).projects;
 for(const item of baseModels.filter(item=>!BATCH4_IDS.includes(item.publicSlug)))
  assert.deepEqual(modelById(item.publicSlug),item,item.publicSlug);
});

test('Batch 1–3 buyer guides, metadata and compare inputs still render',()=>{
 const baseCopies=JSON.parse(original('content/project-copy-package.json'));
 for(const id of PRIOR_IDS){
  const current=copyByProjectId(id),before=getOne(baseCopies,'repoProjectId',id),h=html(`/projects/${id}/`);
  assert.deepEqual(current,before,`${id} copy unchanged`);
  assert.equal(metadata(h).title,current.seoTitle,`${id} title remains aligned`);
  assert.equal(metadata(h).description,current.metaDescription,`${id} description remains aligned`);
  assert.ok(h.includes(renderRevenueBuyerResearch(id)),`${id} buyer guide remains rendered`);
 }
 const article=html('/market-notes/mr-c-shows-downtown-branded-condos-still-move/');
 assert.ok(article.includes(renderRevenueBuyerResearch('mr-c-shows-downtown-branded-condos-still-move')));
 assert.ok(article.includes('rel="canonical" href="https://www.wpbnewconstruction.com/market-notes/mr-c-shows-downtown-branded-condos-still-move/"'));
 assert.ok(html('/corridors/north-flagler/').includes('/projects/mandarin-oriental/'));
 assert.ok(html('/corridors/downtown-west-palm-beach/').includes('/projects/berkeley/'));
});

test('the 77 protected floorplan documents and Batch 3 plan records remain intact',()=>{
 const file='config/preserved-floorplan-document-urls.json';
 const registered=read(file),baseline=JSON.parse(original(file));
 assert.equal(registered.length,77);
 assert.deepEqual(registered,baseline,'protected document registry unchanged');
 for(const url of registered){
  const publicFile=path.join('public',url.slice(1)),builtFile=path.join('dist',url.slice(1));
  assert.ok(fs.existsSync(publicFile),`${url} remains in public assets`);
  assert.ok(fs.existsSync(builtFile),`${url} remains in build output`);
  assert.ok(fs.readFileSync(publicFile).equals(fs.readFileSync(builtFile)),`${url} build copy matches public file`);
 }
 const current=read('public/data/floorplans.json').projects;
 const prior=JSON.parse(original('public/data/floorplans.json')).projects;
 for(const id of ['berkeley','mandarin-oriental','mr-c'])
  assert.deepEqual(getOne(current,'projectId',id),getOne(prior,'projectId',id),`${id} Batch 3 plans unchanged`);
});
