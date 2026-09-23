import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium,webkit} from 'playwright';

const root=path.resolve('dist');
const output=path.resolve('.runtime/revenue-seo-batch4');
await fs.mkdir(output,{recursive:true});
const copies=JSON.parse(await fs.readFile('content/project-copy-package.json','utf8'));
const IDS=['maison-dor','alba-palm-beach','olin-palm-beach'];
const names={'maison-dor':/Maison d[’']? ?Or/i,'alba-palm-beach':/Alba Palm Beach/i,'olin-palm-beach':/OLIN Palm Beach/i};
const routes=IDS.map(id=>{
 const copy=copies.find(item=>item.repoProjectId===id);
 assert.ok(copy,`missing copy package entry for ${id}`);
 return {id,path:`/projects/${id}/`,selector:`[data-revenue-buyer-research="${id}"]`,title:copy.seoTitle,description:copy.metaDescription};
});
const staticHtml=async route=>await fs.readFile(path.join(root,route,'index.html'),'utf8');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;|&apos;|&#x27;/gi,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const metadata=page=>{
 const title=page.match(/<title>([\s\S]*?)<\/title>/i);
 const description=page.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
 const canonical=page.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
 assert.ok(title,'static HTML has a title');
 assert.ok(description,'static HTML has a description');
 assert.ok(canonical,'static HTML has a canonical');
 return {title:decode(title[1]),description:decode(description[1]),canonical:decode(canonical[1])};
};
const visibleText=s=>decode(s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 .replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const currencyBand=/\$\s*[\d,]+(?:\.\d+)?\s*(?:k|m|thousand|million)?\s*(?:-|–|—|\bto\b)\s*(?:\$\s*)?[\d,]+(?:\.\d+)?\s*(?:k|m|thousand|million)?/i;
const numericPrice=/\$\s*\d[\d,.]*(?:\s*(?:k|m|million|thousand))?/i;
const compareMeta=metadata(await staticHtml('/compare/'));
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  const data=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
  res.end(data);
 }catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(4204,'127.0.0.1',resolve));
const base='http://127.0.0.1:4204';
const results=[];
const viewports=[['desktop',{width:1440,height:1000}],['tablet',{width:834,height:1112}],['mobile',{width:390,height:844}]];
async function createReadOnlyContext(browser,viewport){
 const context=await browser.newContext({viewport});
 // Serve the build locally; block external requests and every non-read request.
 await context.route('**/*',route=>{
  const request=route.request(),url=new URL(request.url());
  return url.hostname==='127.0.0.1'&&['GET','HEAD'].includes(request.method())?route.continue():route.abort();
 });
 return context;
}
async function assertHydratedMetadata(page,expected,label){
 await page.waitForFunction(title=>document.title===title,expected.title);
 await page.waitForFunction(description=>document.querySelector('meta[name="description"]')?.getAttribute('content')===description,expected.description);
 assert.equal(await page.locator('link[rel="canonical"]').count(),1,`${label} has one canonical`);
 assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),expected.description,`${label} hydrated description`);
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),expected.canonical,`${label} hydrated canonical`);
}
async function dismissLocalModal(page){
 const button=page.locator('[data-lead-modal]:visible [data-lead-modal-dismiss]').first();
 if(await button.isVisible())await button.click();
}
async function compareCell(page,projectId,label){
 await page.locator('[data-compare-results] .compare-matrix-desktop:visible table, [data-compare-results] .compare-matrix-mobile:visible .compare-mobile-criterion').first().waitFor({state:'visible'});
 const table=page.locator('[data-compare-results] .compare-matrix-desktop:visible table');
 if(await table.count()){
  const headers=await table.locator('thead th').allInnerTexts();
  const projectColumn=headers.findIndex(header=>names[projectId].test(header));
  assert.ok(projectColumn>0,`${projectId} has a Compare column`);
  for(const row of await table.locator('tbody tr').all()){
   const heading=row.locator('th').first();
   if(await heading.count()&&(await heading.innerText()).trim().toLowerCase()===label.toLowerCase())
    return row.locator('th,td').nth(projectColumn).innerText();
  }
 }else{
  const criteria=page.locator('[data-compare-results] .compare-matrix-mobile:visible .compare-mobile-criterion');
  for(const criterion of await criteria.all()){
   if((await criterion.locator('h4').innerText()).trim().toLowerCase()!==label.toLowerCase())continue;
   for(const value of await criterion.locator('.compare-mobile-value').all()){
    if(await value.locator('a').getAttribute('href')===`/projects/${projectId}/`)
     return value.locator('p').innerText();
   }
   assert.fail(`${projectId} has one ${label} value`);
  }
 }
 assert.fail(`Compare ${label} row is rendered for ${projectId}`);
}

try{
 for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch({headless:true});
  try{
   for(const [size,viewport] of viewports){
    const context=await createReadOnlyContext(browser,viewport);
    const page=await context.newPage();
    const errors=[],onError=error=>errors.push(error.message);
    page.on('pageerror',onError);

    for(const route of routes){
     const response=await page.goto(base+route.path,{waitUntil:'domcontentloaded'});
     assert.equal(response.status(),200,`${route.id} route response`);
     const staticPage=await response.text(),staticMeta=metadata(staticPage);
     assert.equal(staticMeta.title,route.title,`${route.id} title in response HTML`);
     assert.equal(staticMeta.description,route.description,`${route.id} description in response HTML`);
     if(route.id==='olin-palm-beach')assert.doesNotMatch(route.description,numericPrice,'OLIN metadata has no numeric price value');
     assert.equal(staticMeta.canonical,`https://www.wpbnewconstruction.com${route.path}`,`${route.id} canonical in response HTML`);
     await page.locator(route.selector).waitFor({state:'visible'});
     await assertHydratedMetadata(page,{...staticMeta,title:route.title},route.id);
     const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
     assert.ok(dims.scroll<=dims.width+1,JSON.stringify({project:route.id,size,...dims}));
     if(route.id==='maison-dor')
      await page.getByText(/3014 S Dixie Highway, West Palm Beach, FL 33405/i).waitFor({state:'visible',timeout:15000});
     const body=await page.locator('main').innerText();

     if(route.id==='maison-dor'){
      assert.match(body,/3014 S Dixie Highway, West Palm Beach, FL 33405/i,'separate sales gallery remains visible after hydration');
      assert.doesNotMatch(body,/\b(?:3705|3773)\b/,'neither disputed street number is public');
     }
     if(route.id==='alba-palm-beach'){
      assert.match(body,/Sales Gallery:?\s+250 North Olive Avenue/i,'separate 250 North Olive Avenue gallery is visibly labeled');
      assert.match(body,/(?:developer|project sponsor).*immediate occupancy/i,'occupancy remains attributed to the developer or project sponsor');
      assert.match(body,/Unit 1003 sale does not establish availability across the building/i,'one recorded sale remains residence-specific');
      assert.doesNotMatch(body,/\b(?:all|every)\s+(?:55\s+)?(?:homes|units|residences)\s+(?:are\s+)?(?:ready|available|closing|closed)\b|\bbuilding[- ]wide\s+closings?\b/i);
     }
     if(route.id==='olin-palm-beach'){
      assert.doesNotMatch(body,currencyBand,'OLIN public copy has no numeric budget band');
      assert.doesNotMatch(body,numericPrice,'OLIN public copy has no numeric price value');
      assert.match(body,/Palm Beach Island/i,'public page identifies OLIN as a Palm Beach Island project');
      assert.doesNotMatch(body,/\b(?:future|planning[- ]stage)\s+(?:project\s+)?(?:in\s+)?West Palm Beach\b|\bWest Palm Beach\s+(?:future|planning[- ]stage)\b/i,
       'Palm Beach Island copy is not generalized as a future West Palm Beach project');
      assert.doesNotMatch(body,/\bpublished\s+(?:floor\s+)?plans?\b/i,'no generic promise of published plans');
      assert.match(body,/released\s+(?:floor\s+)?plans?[^.]{0,100}not publicly verified/i,'released plans are explicitly unverified');
      assert.doesNotMatch(body,/\b(?:current|official)\s+(?:developer\s+)?(?:inquiry|contact) form\s+(?:is\s+)?(?:available|active|open)|sales gallery\s+(?:is\s+)?(?:open|now open|located at)|released floor plans?\s+(?:are\s+)?(?:available|ready|now available)|tour availability\s+(?:is\s+)?confirmed/i,
       'no current developer form, gallery or plans promise');
      assert.equal(await page.locator('a[href*="floorplans"][href*="olin-palm-beach"]').count(),0,'no OLIN floorplan link');
     }
     if(engineName==='chromium'&&size!=='tablet')
      await page.screenshot({path:path.join(output,`${route.id}-${size}.png`),fullPage:true});
     results.push({engine:engineName,viewport:size,route:route.path,metadata:'static and hydrated match',responsive:'no horizontal overflow'});
    }

    // Alba's active developer-sales status also changes North Flagler buyer
    // discovery. Require that corridor's raw and hydrated copy to agree.
    const northPath='/corridors/north-flagler/';
    const northResponse=await page.goto(base+northPath,{waitUntil:'domcontentloaded'});
    assert.equal(northResponse.status(),200,'North Flagler route response');
    const northMeta=metadata(await northResponse.text());
    assert.match(northMeta.description,/Olara, Ritz-Carlton and Alba/,'North Flagler static description includes Alba');
    await page.locator('[data-route-view="corridor"][data-corridor-route="north-flagler"]:visible').waitFor({state:'visible'});
    await assertHydratedMetadata(page,northMeta,'North Flagler after Alba update');
    results.push({engine:engineName,viewport:size,route:northPath,metadata:'static and hydrated match'});

    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    const olinCards=page.locator('[data-project-card="olin-palm-beach"]:visible');
    await olinCards.first().waitFor({state:'visible'});
    const olinCardTexts=await olinCards.allInnerTexts();
    assert.ok(olinCardTexts.length>0,'OLIN homepage card is present after hydration');
    for(const [index,olinCardText] of olinCardTexts.entries()){
     assert.match(olinCardText,names['olin-palm-beach'],`OLIN card ${index+1} name`);
     assert.match(olinCardText,/request current pricing/i,`OLIN card ${index+1} directs buyers to current pricing`);
     assert.doesNotMatch(olinCardText,currencyBand,`OLIN card ${index+1} has no numeric budget band`);
     assert.doesNotMatch(olinCardText,numericPrice,`OLIN card ${index+1} has no numeric price value`);
    }
    results.push({engine:engineName,viewport:size,card:`${olinCardTexts.length} visible OLIN cards have no numeric budget band`});

    for(const route of routes){
     await page.goto(base+route.path,{waitUntil:'domcontentloaded'});
     await page.locator(route.selector).waitFor({state:'visible'});
     await dismissLocalModal(page);

     // Follow the rendered Compare link and make sure its metadata updates in the same SPA document.
     await page.evaluate(id=>{window.__revenueSeoBatch4NavMarker=id;},route.id);
     const compareLink=page.locator(`${route.selector} a[href^="/compare/"]`).first();
     await compareLink.waitFor({state:'visible'});
     await compareLink.click();
     await page.waitForURL(url=>url.pathname==='/compare/');
     await assertHydratedMetadata(page,compareMeta,`${route.id} Compare client navigation`);
     assert.equal(await page.evaluate(()=>window.__revenueSeoBatch4NavMarker),route.id,'Compare navigation stays client-side');
     const matrix=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');
     await matrix.waitFor({state:'visible'});
     const compareText=await matrix.innerText();
     assert.match(compareText,names[route.id],`${route.id} appears in Compare`);
     if(route.id==='olin-palm-beach'){
      const priceCell=await compareCell(page,route.id,'Price Range');
      assert.match(priceCell,/request current pricing/i,'OLIN Compare asks for current pricing');
      assert.doesNotMatch(priceCell,currencyBand,'OLIN Compare shows no budget range');
      assert.doesNotMatch(priceCell,numericPrice,'OLIN Compare shows no numeric price value');
      const floorplanCell=await compareCell(page,route.id,'Floorplans');
      assert.match(floorplanCell,/Not publicly verified in reviewed sources/i,'Compare qualifies OLIN floorplan status by reviewed sources');
      assert.doesNotMatch(floorplanCell,/Not publicly released|Inquiry \/ sales materials/i,'Compare avoids categorical or unverified plan-material availability claims');
     }
     results.push({engine:engineName,viewport:size,clientNavigation:`${route.id} to Compare; metadata updated`});

     await page.goBack();
     await page.waitForURL(url=>url.pathname===route.path);
     await assertHydratedMetadata(page,{title:route.title,description:route.description,canonical:`https://www.wpbnewconstruction.com${route.path}`},`${route.id} client back navigation`);

     await page.goto(base+route.path,{waitUntil:'domcontentloaded'});
     await page.locator(route.selector).waitFor({state:'visible'});
     await dismissLocalModal(page);
     await page.locator(`${route.selector} a[href^="/inquire/"]`).first().click();
     await page.waitForURL(url=>url.pathname==='/inquire/');
     await page.locator('.inquiry-form select[name="project"]').waitFor({state:'visible'});
     assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(),route.id,`${route.id} inquiry context preserved`);
     results.push({engine:engineName,viewport:size,inquiry:`${route.id} context preserved; no submission`});
    }
    assert.deepEqual(errors,[],`${engineName} ${size} page errors`);
    page.off('pageerror',onError);
    await context.close();
   }
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({result:'pass',checks:results.length,results},null,2));
}finally{
 await fs.writeFile(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));
 await new Promise(resolve=>server.close(resolve));
}
