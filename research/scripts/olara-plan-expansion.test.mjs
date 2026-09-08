import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { olaraPlanExpansion } from '../../src/data/olaraPlanExpansion.ts';
import { approvedFloorplanLibrary } from '../../src/data/floorplanApprovedLibrary.ts';
import { buildFloorplanEntities, publishedFloorplanEntities, floorplanForPath, renderFloorplanPage, floorplanSchema } from '../../src/lib/floorplanEntities.ts';
import { resolveInquiryContext } from '../../src/lib/inquiryContext.ts';
import { addSitemapEntities } from './prerender-floorplan-entities.mjs';
const additions = ['a','c','f','i','l'];
const published = publishedFloorplanEntities();
const ledger = JSON.parse(await fs.readFile('research/source-material-review/olara-plan-expansion-verified.json','utf8'));
const sha256 = b => createHash('sha256').update(b).digest('hex');

test('five distinct additional Olara layouts reuse the existing entity scope; D and Alba remain intact', () => {
  assert.deepEqual(olaraPlanExpansion.map(p=>p.slug), additions.map(l=>`residence-${l}`));
  assert.deepEqual(published.map(p=>p.slug), ['d',...additions].map(l=>`residence-${l}`));
  assert.equal(buildFloorplanEntities().length,7);
  const d=published[0];assert.equal(d.reviewedOn,'2026-09-05');assert.equal(d.updatedOn,'2026-09-05');
  assert.equal(d.interiorSqFt,1774);assert.equal(d.terraceSqFt,381);assert.equal(d.totalSqFt,2155);
  assert.equal(floorplanForPath('/floorplans/alba-palm-beach/residence-d/'),undefined);
  assert.equal(new Set(published.map(p=>p.pdf)).size,6);
  assert.equal(new Set(published.map(p=>p.canonical)).size,6);
});

test('five current official PDFs and approved previews match the visually reviewed snapshots without invented revision dates', async () => {
  assert.equal(ledger.status,'source-verified-for-draft-review');assert.equal(ledger.plans.length,5);
  for(const source of ledger.plans){
    const entry=olaraPlanExpansion.find(p=>p.slug===`residence-${source.letter.toLowerCase()}`);assert.ok(entry);
    assert.deepEqual(entry.expected,source.expected);
    assert.equal(entry.reviewedOn,source.retrievedAt.slice(0,10));
    assert.equal(source.printedRevisionDate,null);
    assert.match(entry.sourceNote,/No printed revision date/);assert.match(source.revisionNote,/not certified/);
    assert.equal(source.officialPdfSHA256,source.archivedPdfSHA256);
    for(const [field,digest]of [['pdf','archivedPdfSHA256'],['preview','previewSHA256']]){
      assert.equal(entry[field],source[field]);assert.equal(sha256(await fs.readFile('public'+source[field])),source[digest]);
    }
    const plan=published.find(p=>p.slug===entry.slug);assert.ok(plan);
    assert.equal(plan.interiorSqFt+plan.terraceSqFt,plan.totalSqFt);
    assert.equal(plan.bedrooms,source.expected.bedrooms);assert.equal(plan.bathrooms,source.expected.bathrooms);
    assert.equal(plan.floors,source.expected.detail);
    const schema=floorplanSchema(plan);assert.equal(schema['@graph'][0].mainEntity.isBasedOn,source.sourceUrl);
    assert.doesNotMatch(JSON.stringify(schema),/"dateCreated"|"availability"|"Offer"|"price"/);
  }
});

test('all added plans retain exact availability inquiry context and early CTA with no public research leakage', () => {
  for(const plan of published.slice(1)){
    const value=`floorplan:olara:${plan.slug}`,origin=resolveInquiryContext(value);
    assert.equal(origin.context,value);assert.equal(origin.project,'olara');assert.equal(origin.corridor,'north-flagler');
    assert.equal(origin.interest,'Request current availability');
    const html=renderFloorplanPage(plan);
    assert.ok(html.indexOf('data-fp-placement="intro"')<html.indexOf('class="fp-drawing"'));
    assert.match(html,/href="\/answers\/olara-vs-ritz-carlton-vs-shorecrest\/"/);
    assert.doesNotMatch(JSON.stringify(plan)+html,/SHA256|pdfCreationMetadata|visualReview|PRIVATE_SENTINEL|research\//);
  }
  for(const value of ['floorplan:olara:residence-mirror','floorplan:olara:residence-a-v01','floorplan:alba-palm-beach:residence-d','floorplan:olara:residence-a?email=private@example.invalid'])assert.equal(resolveInquiryContext(value),undefined);
});

test('publication preserves original dates/PDF URLs, rejects changed source facts and keeps Alba out of sitemap', () => {
  const xml=addSitemapEntities('<urlset><url><loc>https://www.wpbnewconstruction.com/</loc></url></urlset>',published);
  assert.equal(addSitemapEntities(xml,published),xml);assert.ok(!xml.includes('alba-palm-beach'));
  for(const p of published){
    const block=xml.split('<url>').find(b=>b.includes(`<loc>${p.canonical}</loc>`));
    assert.ok(block.includes(`<lastmod>${p.slug==='residence-d'?'2026-09-05':'2026-09-08'}</lastmod>`));
    assert.ok(p.pdf.endsWith('-v01.pdf'));assert.ok(!p.path.includes('v01'));
  }
  for(const entry of olaraPlanExpansion){
    const data=structuredClone(approvedFloorplanLibrary);const plan=data.find(p=>p.projectId==='olara').plans.find(p=>p.href===entry.pdf);
    plan.terraceSqFt='999';assert.throws(()=>buildFloorplanEntities(data),/Source review required/);
  }
});
