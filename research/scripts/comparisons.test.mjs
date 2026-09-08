import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { comparisonForPath, comparisonPaths, comparisonProjectIds, encodeShortlist, parseShortlist } from '../../src/lib/shortlist.ts';
import { comparisonPages, comparisonSchema, renderComparison } from '../../src/lib/comparisonContent.ts';
import { resolveInquiryContext } from '../../src/lib/inquiryContext.ts';
import { sanitizeAnalyticsPayload } from '../../src/lib/analyticsSafety.ts';
import { renderComparisonDocument } from './prerender-comparisons.mjs';
import { normalizeLead } from '../../functions/_shared/lead-utils.js';

test('one retained canonical comparison and one substantive three-project answer',()=>{
 assert.equal(comparisonForPath(comparisonPaths.flagler+'?email=private#top'),'flagler');
 assert.equal(comparisonForPath(comparisonPaths.trio+'index.html'),'trio');
 assert.equal(comparisonForPath('/answers/unrelated/'),undefined);
 assert.equal(new Set(Object.values(comparisonPaths)).size,2);
 for(const c of Object.values(comparisonPages)){assert.ok(c.title.length<=75);assert.ok(c.description.length>=80&&c.description.length<=180);}
});
test('every valid subset preserves only the selected IDs within server and analytics limits',()=>{
 for(const key of ['flagler','trio']){
  const allowed=comparisonProjectIds[key];
  for(let mask=0;mask<(1<<allowed.length);mask++){
   const ids=allowed.filter((_,i)=>mask&(1<<i)),ctx=encodeShortlist(key,ids);
   if(ids.length<2){assert.equal(ctx,undefined);continue;}
   assert.deepEqual(parseShortlist(ctx).ids,ids);assert.ok(ctx.length<=120);
   assert.equal(sanitizeAnalyticsPayload({leadCaptureContext:ctx}).leadCaptureContext,ctx);
   const normalized=normalizeLead({cta_context:ctx,project:ids[0],interest:'Compare buildings'},new Request('https://example.invalid/api/leads'));
   assert.equal(normalized.cta_context,ctx);assert.equal(normalized.project_id,ids[0]);
  }
 }
});
test('duplicate, arbitrary, cross-page and contaminated shortlist contexts are rejected',()=>{
 for(const bad of [null,{},'shortlist:trio:olara','shortlist:trio:olara,olara','shortlist:trio:olara,south-flagler-house','shortlist:trio:shorecrest,olara','shortlist:trio:olara,name@example.invalid','shortlist:trio:olara,shorecrest?email=x','shortlist:flagler:<script>'])assert.equal(parseShortlist(bad),undefined);
 assert.equal(encodeShortlist('trio',['olara','nope']),undefined);
});
test('comparison request coexists with corridor, commercial and Olara origins',()=>{
 const ctx=encodeShortlist('trio',['olara','shorecrest']);const result=resolveInquiryContext(ctx);
 assert.equal(result.interest,'Compare buildings');assert.equal(result.project,'olara');assert.equal(result.context,ctx);
 assert.equal(resolveInquiryContext('commercial:home:availability').project,'');
 assert.equal(resolveInquiryContext('corridor:south-flagler:pricing-packet').corridor,'south-flagler');
 assert.equal(resolveInquiryContext('floorplan:olara:residence-d').project,'olara');
 assert.equal(resolveInquiryContext('floorplan:alba-palm-beach:residence-d'),undefined);
});
test('sources, actual plans, timing qualifications and buyer selection are visible without invented offers/authorship',()=>{
 for(const key of ['flagler','trio']){
  const html=renderComparison(key);assert.equal((html.match(/<h1>/g)||[]).length,1);
  for(const token of ['Compare my shortlist','data-shortlist-options','/floorplans/olara/residence-d/','Sources checked September 7','not a guarantee'])assert.ok(html.includes(token));
  assert.doesNotMatch(html,/\$[0-9]|Alba Residence D|Review Desk|data-analytics-email/);
  const graph=comparisonSchema(key)['@graph'];assert.equal(graph.filter(n=>n['@type']==='WebPage').length,1);
  const items=graph.find(n=>n['@type']==='ItemList');assert.equal(items.numberOfItems,comparisonProjectIds[key].length);
  assert.ok(graph.find(n=>n['@type']==='WebPage').citation.length>=9);
  assert.doesNotMatch(JSON.stringify(graph),/"offers"|"author"|"rating"/);
 }
});
test('standalone document renderer replaces the app safely and is idempotent',()=>{
 const template='<html><head><title>Old</title><meta name="description" content="old" /><link rel="canonical" href="https://www.wpbnewconstruction.com/answers/north-flagler-vs-south-flagler-new-condos/" /><script id="wpb-static-structured-data" type="application/ld+json">{}</script></head><body><div id="app"><main><div>Old</div></main></div><script>window.__WPB_PRERENDER_PATH__="/old/";</script></body></html>';
 for(const key of ['flagler','trio']){const html=renderComparisonDocument(template,key);assert.equal(renderComparisonDocument(html,key),html);assert.ok(html.includes(comparisonPaths[key]));assert.equal((html.match(/application\/ld\+json/g)||[]).length,1);}
 assert.throws(()=>renderComparisonDocument('<html></html>','trio'));
});
test('no duplicate initializer, tracking adapter, server mutation, or contact payload access in comparison modules',async()=>{
 const app=await fs.readFile('src/comparisonPage.ts','utf8');assert.equal((app.match(/track\('page_view'/g)||[]).length,1);
 assert.doesNotMatch(app,/gtag|google-analytics|name=.?email|fetch\(/);
 const entry=await fs.readFile('src/bootstrap.ts','utf8');assert.ok(entry.indexOf('mountComparison(comparison)')<entry.indexOf('import("./main.ts")'));
});

test('restricted developer destinations retain cited provenance without forbidden outbound links',()=>{
 for(const key of ['flagler','trio']){
  const html=renderComparison(key);
  assert.doesNotMatch(html,/href="https?:\/\/(?:www\.)?(?:shorecrestwpb|relatedross|southflaglerhouse)\.com/);
  assert.match(html,/<cite>Shorecrest: two- and three-bedroom residences<\/cite>/);
  const citations=comparisonSchema(key)['@graph'].find(n=>n['@type']==='WebPage').citation;
  assert.ok(citations.includes('https://www.shorecrestwpb.com/residences'));
  assert.ok(html.includes('href="/projects/shorecrest/"'));
 }
});
