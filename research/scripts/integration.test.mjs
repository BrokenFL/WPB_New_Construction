import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { resolveInquiryContext } from '../../src/lib/inquiryContext.ts';
import { rememberLeadAttribution } from '../../src/lib/leadCapture.ts';
import { publishedFloorplanEntities, buildFloorplanEntities } from '../../src/lib/floorplanEntities.ts';

test('one resolver admits both prepared request families but not unpublished Alba or arbitrary input', () => {
  assert.equal(resolveInquiryContext('floorplan:olara:residence-d').project, 'olara');
  for (const page of ['home','buildings']) for (const intent of ['availability','pricing-packet']) {
    const result=resolveInquiryContext(`commercial:${page}:${intent}`);
    assert.equal(result.project, '');
    assert.equal(result.interest, intent === 'availability' ? 'Request current availability' : 'Request private floor-plan packet');
  }
  for (const value of ['floorplan:alba-palm-beach:residence-d','commercial:home:other','floorplan:olara:other','contact_page','name@example.invalid',null,{}]) assert.equal(resolveInquiryContext(value), undefined);
});
test('explicit new request replaces stale CTA/corridor while preserving first touch', () => {
  const previous=globalThis.window;
  const storage=new Map();
  globalThis.window={sessionStorage:{getItem:(key)=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}};
  try {
    rememberLeadAttribution({landing_page:'https://example.invalid/',utm_source:'research',cta_context:'floorplan:olara:residence-d',corridor:'north-flagler'});
    rememberLeadAttribution({cta_context:'commercial:buildings:pricing-packet',cta_label:'Get pricing + floor-plan packet'}, {replaceRequest:true});
    const saved=JSON.parse(storage.get('wpbLeadAttribution'));
    assert.equal(saved.landing_page,'https://example.invalid/');assert.equal(saved.utm_source,'research');
    assert.equal(saved.cta_context,'commercial:buildings:pricing-packet');assert.equal(saved.corridor,undefined);
    rememberLeadAttribution({cta_context:'floorplan:olara:residence-d',corridor:'north-flagler'}, {replaceRequest:true});
    const next=JSON.parse(storage.get('wpbLeadAttribution'));
    assert.equal(next.cta_label,undefined);assert.equal(next.corridor,'north-flagler');
  } finally {if(previous===undefined) delete globalThis.window; else globalThis.window=previous;}
});
test('integrated entry starts legacy app once and installs one shared form bridge', async () => {
  const entry=await fs.readFile('src/bootstrap.ts','utf8');
  assert.equal((entry.match(/import\("\.\/main.ts"\)/g)??[]).length,1);
  assert.equal((entry.match(/wireInquiryContext\(app\)/g)??[]).length,1);
  assert.match(entry,/installCommercialGrowth\(\)/);
  const commercial=await fs.readFile('src/commercialGrowth.ts','utf8');
  assert.doesNotMatch(commercial,/addEventListener\('submit'|syncInquiry/);
  assert.match(await fs.readFile('index.html','utf8'),/src="\/src\/bootstrap.ts"/);
});
test('postbuild composes both page families and production keeps the reachable-graph guard', async () => {
  const {scripts}=JSON.parse(await fs.readFile('package.json','utf8'));
  assert.ok(scripts.postbuild.indexOf('prerender-commercial-routes') < scripts.postbuild.indexOf('prerender-floorplan-entities'));
  for(const name of ['test:floorplan-entities','test:commercial','test:deploy-preflight','test:integration']) assert.ok(scripts.test.includes(name));
  assert.match(await fs.readFile('research/scripts/deploy-cloudflare-pages-with-retry.mjs','utf8'),/production-map-preflight.mjs/);
  assert.deepEqual(publishedFloorplanEntities().map(p=>p.projectId),['olara']);
  assert.ok(buildFloorplanEntities().some(p=>p.projectId==='alba-palm-beach'));
});
