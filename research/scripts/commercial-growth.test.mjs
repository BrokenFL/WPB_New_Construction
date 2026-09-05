import assert from 'node:assert/strict';
import test from 'node:test';
import { commercialPages, commercialOrigin, commercialPageForPath, parseCommercialContext, renderCommercialGuide, commercialSchema, commercialJson } from '../../src/lib/commercialContent.ts';
import { renderCommercialDocument } from './prerender-commercial-routes.mjs';
const fixture = (page) => `<html><head><title>Old</title>${[['name','description'],['property','og:title'],['property','og:description'],['name','twitter:title'],['name','twitter:description']].map(([a,n]) => `<meta ${a}="${n}" content="Old" />`).join('')}<link rel="canonical" href="${commercialOrigin}${commercialPages[page].path}" /><script id="wpb-static-structured-data" type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","url":"${commercialOrigin}${commercialPages[page].path}"},{"@type":"Organization","name":"Preserved"}]}</script></head><body><div id="app"><main class="static-prerender" data-static-prerender="${page}"><section><h1>Old</h1><p>Old intro</p></section><section><a href="/projects/olara/">Existing project</a></section></main></div><script type="module" src="/assets/index.js"></script></body></html>`;
test('two distinct intent owners and no additional routes', () => {
  assert.deepEqual(Object.values(commercialPages).map((p) => p.path), ['/', '/buildings/']);
  assert.notEqual(commercialPages.home.title, commercialPages.buildings.title);
  assert.notEqual(commercialPages.home.description, commercialPages.buildings.description);
  assert.equal(commercialPageForPath('/buildings/'), 'buildings');
  for (const path of ['/projects/olara/', '/floorplans/olara/residence-d/', '//buildings/', '/buildings/nope/']) assert.equal(commercialPageForPath(path), undefined);
});
test('render preserves canonical, single graph, assets and existing project links; idempotent', () => {
  for (const page of Object.keys(commercialPages)) {
    const result = renderCommercialDocument(fixture(page), page);
    assert.equal(renderCommercialDocument(result, page), result);
    assert.equal((result.match(/<h1>/g) ?? []).length, 1);
    assert.equal((result.match(/type="application\/ld\+json"/g) ?? []).length, 1);
    assert.ok(result.includes('"name":"Preserved"'));
    assert.ok(result.includes('/assets/index.js'));
    assert.ok(result.includes('Existing project'));
    assert.ok(result.includes(`rel="canonical" href="${commercialOrigin}${commercialPages[page].path}"`));
    assert.throws(() => renderCommercialDocument(fixture(page).replace('rel="canonical"','rel="other"'), page), /Unexpected canonical/);
  }
});
test('new actions and navigation are clean, non-gated and independent of pilot URLs', () => {
  for (const page of Object.keys(commercialPages)) {
    const html = renderCommercialDocument(fixture(page), page);
    assert.doesNotMatch(html, /href="[^"\s]*\?|floorplans\/(?:olara|alba-palm-beach)\//);
    for (const path of ['/floorplans/', '/compare/', '/corridors/north-flagler/', '/corridors/south-flagler/', '/corridors/downtown-west-palm-beach/', '/corridors/palm-beach/']) {
      if (page === 'buildings' && path === '/floorplans/') continue;
      assert.ok(html.includes(path), `${page}: ${path}`);
    }
    assert.ok(html.includes('data-commercial-intent="availability"'));
    assert.ok(html.includes('data-commercial-intent="pricing-packet"'));
    assert.doesNotMatch(renderCommercialGuide(page), /\$\d|"Offer"|"availability"\s*:/);
  }
});
test('inquiry context is a fixed allowlist, never arbitrary query text or contact data', () => {
  for (const page of ['home', 'buildings']) for (const intent of ['availability', 'pricing-packet']) assert.deepEqual(parseCommercialContext(`commercial:${page}:${intent}`), { page, intent });
  for (const value of ['commercial:home:email@example.com', 'floorplan:olara:residence-d', null, {}, 'commercial:home:availability:extra']) assert.equal(parseCommercialContext(value), undefined);
});
test('schema changes only the matching page and escapes inline script content', () => {
  const unchanged = { '@type': 'WebPage', url: commercialOrigin + '/projects/olara/', name: 'Olara' };
  assert.deepEqual(commercialSchema(unchanged, 'home'), unchanged);
  const page = { '@type': 'CollectionPage', url: commercialOrigin + '/', '@id': commercialOrigin + '/#webpage' };
  const output = commercialSchema(page, 'home');
  assert.equal(output['@id'], page['@id']);
  assert.equal(output.name, commercialPages.home.heading);
  assert.doesNotMatch(commercialJson({ text: '</script>' }), /<\/script>/);
});

test('production-layout preflight rejects missing loader even with an unrelated Maps file', async () => {
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const { verifyProductionMapBundle } = await import('./commercial-preflight.mjs');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'commercial-build-'));
  try {
    await fs.mkdir(path.join(root,'dist/assets'), {recursive:true});
    await fs.writeFile(path.join(root,'dist/index.html'), '<script type="module" src="/assets/index-test.js"></script>');
    await fs.writeFile(path.join(root,'dist/assets/index-test.js'), 'console.log("no loader")');
    await fs.writeFile(path.join(root,'dist/assets/unrelated.js'), '"maps.googleapis.com/maps/api/js"');
    await assert.rejects(verifyProductionMapBundle(root), /loader missing/);
    await fs.writeFile(path.join(root,'dist/assets/index-test.js'), '"maps.googleapis.com/maps/api/js"');
    assert.equal((await verifyProductionMapBundle(root)).commercialMapPreflight, 'pass');
  } finally { await fs.rm(root, { recursive:true, force:true }); }
});
