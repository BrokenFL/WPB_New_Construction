import assert from 'node:assert/strict';
import test from 'node:test';
import { corridorGrowthPages as pages, corridorGrowthForPath, corridorGrowthSchema, parseCorridorContext, renderGrowthCorridor } from '../../src/lib/corridorGrowthContent.ts';
import { resolveInquiryContext } from '../../src/lib/inquiryContext.ts';
import { renderCorridorDocument } from './prerender-corridor-growth.mjs';
import { commercialOrigin as origin } from '../../src/lib/commercialContent.ts';
test('three existing corridor identities with distinct search intent; no North Flagler rewrite',()=>{
  assert.deepEqual(Object.keys(pages),['downtown','south-flagler','palm-beach']);
  for(const field of ['path','title','heading','description','intro']) assert.equal(new Set(Object.values(pages).map(c=>c[field])).size,3);
  for(const [key,c] of Object.entries(pages)){
    assert.equal(corridorGrowthForPath(c.path),key);
    assert.equal(corridorGrowthForPath(c.path+'index.html'),key);
    assert.ok(c.title.length<=80);assert.ok(c.description.length<=190);
  }
  assert.equal(corridorGrowthForPath('/corridors/downtown/'),'downtown');
  for(const path of ['/corridors/north-flagler/','/corridors/south-end/','/','/corridors/palm-beach/?email=x'])assert.equal(corridorGrowthForPath(path),undefined);
});
test('only six allowlisted corridor/product contexts and intact older request families',()=>{
  for(const key of Object.keys(pages)) for(const intent of ['availability','pricing-packet']){
    const value=`corridor:${key}:${intent}`,r=resolveInquiryContext(value);
    assert.deepEqual(parseCorridorContext(value),{key,intent});
    assert.equal(r.project,'');assert.equal(r.projectName,'');assert.equal(r.corridor,key);
    assert.equal(r.interest,intent==='availability'?'Request current availability':'Request private floor-plan packet');
  }
  for(const value of ['corridor:north-flagler:availability','corridor:downtown:email=private','corridor:home:availability',{},null])assert.equal(parseCorridorContext(value),undefined);
  assert.equal(resolveInquiryContext('floorplan:olara:residence-d').project,'olara');
  assert.equal(resolveInquiryContext('commercial:home:pricing-packet').corridor,'');
  assert.equal(resolveInquiryContext('floorplan:alba-palm-beach:residence-d'),undefined);
});
test('useful shared markup has early actions, project source citations and open research',()=>{
  for(const [key,c] of Object.entries(pages)){
    const html=renderGrowthCorridor(key);
    assert.equal((html.match(/<h1>/g)||[]).length,1);
    assert.equal((html.match(/data-corridor-intent=/g)||[]).length,2);
    assert.ok(html.indexOf('data-corridor-intent=')<html.indexOf('<figure>'));
    assert.doesNotMatch(html,/href="\/inquire\/\?|data-commercial-intent|data-fp-action|\$\d|guaranteed delivery/);
    assert.ok(html.includes('2026-09-07'));
    for(const project of c.projects){assert.ok(html.includes(`/projects/${project.slug}/`));assert.equal(new URL(project.source.href).protocol,'https:');assert.ok(project.verify.length>40);}
    assert.ok(c.resources.some(l=>l.href==='/floorplans/'));
    assert.ok(c.resources.some(l=>l.href==='/compare/'));
  }
});
test('schema matches visible project shortlist; no offers or invented authors',()=>{
  const publisher={'@type':'Organization','@id':origin+'/#advisor',name:'The Scott Gordon Group'};
  const base={'@context':'https://schema.org','@graph':[publisher,{'@type':'WebPage',url:origin+'/'},{'@type':'ItemList',itemListElement:[]},{'@type':'FAQPage'}]};
  for(const [key,c] of Object.entries(pages)){
    const out=corridorGrowthSchema(base,key),graph=out['@graph'];
    assert.deepEqual(graph[0],publisher);
    assert.equal(graph.filter(n=>n['@type']==='CollectionPage').length,1);
    assert.equal(graph.find(n=>n['@type']==='CollectionPage').url,origin+c.path);
    assert.equal(graph.find(n=>n['@type']==='ItemList').numberOfItems,c.projects.length);
    assert.deepEqual(corridorGrowthSchema(out,key),out);
    assert.doesNotMatch(JSON.stringify(out),/Offer|AggregateRating|ReviewDesk|FAQPage/);
  }
});
test('prerender replaces stale tables, preserves canonical and remains idempotent',()=>{
  for(const [key,c] of Object.entries(pages)){
    const metas=[['name','description'],['property','og:title'],['property','og:description'],['name','twitter:title'],['name','twitter:description']].map(([a,n])=>`<meta ${a}="${n}" content="old" />`).join('');
    const source=`<html><head><title>old</title>${metas}<link rel="canonical" href="${origin+c.path}"/><script id="wpb-static-structured-data" type="application/ld+json">{"@graph":[]}</script></head><body><main class="static-prerender"><section><h1>Old</h1></section><section><h2>Old table</h2></section></main></body></html>`;
    const out=renderCorridorDocument(source,key);
    assert.ok(out.includes(renderGrowthCorridor(key)));assert.ok(!out.includes('Old table'));
    assert.equal(renderCorridorDocument(out,key),out);
    assert.throws(()=>renderCorridorDocument(source.replace(origin+c.path,origin+'/wrong/'),key),/canonical/);
  }
});
test('source-conflicted timing and island approvals are not turned into inventory claims',()=>{
  assert.match(pages['palm-beach'].projects[1].stage,/offering unconfirmed/);
  assert.match(pages['palm-beach'].projects[1].detail,/dated planning record/);
  assert.match(pages['palm-beach'].projects[0].stage,/pre-construction sales/);
  assert.match(pages['south-flagler'].projects.find(p=>p.slug==='la-clara').stage,/Completed/);
  assert.ok(!Object.values(pages).some(c=>JSON.stringify(c).includes('/floorplans/alba-palm-beach/')));
});
