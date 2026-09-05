// Candidate-only browser tests. All lead POSTs and analytics requests are intercepted.
// Real Maps validation is a separate required job; this script never claims it.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { publishedFloorplanEntities } from '../../src/lib/floorplanEntities.ts';
import { commercialPages, commercialOrigin } from '../../src/lib/commercialContent.ts';
const plan=publishedFloorplanEntities()[0];
const output='.runtime/p2-integration';
await fs.mkdir(output,{recursive:true});
const dist=path.resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{
  try {
    let file=path.resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!file.startsWith(dist+path.sep)&&file!==dist) throw Error('Invalid path');
    if((await fs.stat(file)).isDirectory()) file=path.join(file,'index.html');
    res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.end(await fs.readFile(file));
  } catch {res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const results=[];
let browser;
async function settle(page,route){
  await page.waitForURL(origin+route);
  await page.waitForFunction(()=>Boolean(window.wpbAnalyticsQueue?.some(e=>e.eventName==='page_view')));
  await page.waitForTimeout(200);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),commercialOrigin+route);
  assert.equal(await page.locator('script[type="application/ld+json"]').count(),1);
  assert.equal(await page.getByRole('heading',{level:1}).count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
}
async function clickPath(page,route){
  await page.locator(`a[href="${route}"]:visible`).first().click();
  await settle(page,route);
}
try{
  const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
  assert.equal(sitemap.split(`<loc>${plan.canonical}</loc>`).length-1,1);
  assert.ok(!sitemap.includes('/floorplans/alba-palm-beach/residence-d/'));
  await assert.rejects(fs.access('dist/floorplans/alba-palm-beach/residence-d/index.html'));
  for(const route of ['/floorplans/','/projects/olara/']) assert.ok((await fs.readFile(path.join(dist,route.slice(1),'index.html'),'utf8')).includes(`href="${plan.path}"`));
  const staticBuildings=await fs.readFile('dist/buildings/index.html','utf8');
  assert.ok(staticBuildings.indexOf('href="/projects/olara/"')<staticBuildings.indexOf('data-commercial-guide="buildings"'));
  browser=await chromium.launch({headless:true});
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
    let payload;let analyticsRequests=0;
    const events=[];const errors=[];
    await context.exposeBinding('__qaEvent',(_,event)=>events.push(event));
    await context.addInitScript(()=>{
      const doc=crypto.randomUUID();window.__qaDoc=doc;
      window.addEventListener('wpb:analytics',event=>window.__qaEvent({doc,path:location.pathname,...event.detail}));
    });
    await context.route('**/*',route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===origin&&url.pathname==='/api/leads'&&req.method()==='POST'){
        payload=req.postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"leadId":"intercepted-integration"}'});
      }
      if(/google-analytics|googletagmanager/.test(url.hostname))analyticsRequests++;
      if(url.origin===origin&&!url.pathname.startsWith('/api/'))return route.continue();
      return route.fulfill({status:200,contentType:'text/javascript',body:''});
    });
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.name));
    async function submit(expected,project='olara'){
      const form=page.locator('.inquiry-form');await form.waitFor({state:'visible'});
      assert.equal(await form.locator('[name="lead_capture_context"]').inputValue(),expected);
      const isPlan=expected.startsWith('floorplan:');
      if(isPlan) assert.equal(await form.locator('[name="project"]').inputValue(),'olara');
      else assert.equal(await form.locator('[name="project"]').inputValue(),'','New commercial request inherited a building');
      const interest=expected.endsWith('pricing-packet')?'Request private floor-plan packet':'Request current availability';
      assert.equal(await form.locator('[name="interest"]').inputValue(),interest);
      await form.locator('[name="project"]').selectOption(project);
      await form.locator('[name="name"]').fill('Integrated QA Person');
      await form.locator('[name="email"]').fill('integration-qa@example.invalid');
      await form.locator('[name="phone"]').fill('202-555-0171');
      await form.locator('[name="message"]').fill('INTEGRATION_TEST_NEVER_SEND');
      await form.locator('[name="consent"]').check();
      await form.locator('[name="turnstile_token"]').evaluate(input=>input.value='INTEGRATION_INTERCEPTED_TOKEN');
      payload=undefined;
      const received=page.waitForResponse(r=>r.url()===origin+'/api/leads'&&r.request().method()==='POST');
      const before=events.length;
      await form.locator('button[type="submit"]').click();await received;
      await page.waitForFunction(()=>document.querySelector('.form-status')?.textContent?.includes('request was received'));
      assert.equal(payload.cta_context,expected);assert.equal(payload.lead_capture_context,expected);
      assert.equal(payload.project,project);assert.equal(payload.interest,interest);
      assert.equal(payload.landing_page,origin+'/');assert.equal(payload.submission_page,origin+'/inquire/');
      if(!isPlan){assert.notEqual(payload.project_name,'Olara');assert.ok(!payload.cta_location.startsWith('floorplan'));assert.ok(!payload.corridor);}
      const serialized=await page.evaluate(()=>JSON.stringify([window.wpbAnalyticsQueue,window.dataLayer]));
      assert.doesNotMatch(serialized,/Integrated QA Person|integration-qa@|202-555-0171|INTEGRATION_TEST_NEVER_SEND|INTEGRATION_INTERCEPTED_TOKEN/);
      assert.equal(events.slice(before).filter(e=>e.eventName==='contact_form_submit').length,1);
      assert.equal(events.slice(before).filter(e=>e.eventName==='lead_form_submit_success').length,1);
      results.push({width,journey:expected,interceptedSubmission:'pass',project,piiExcluded:true});
      payload=undefined;
    }
    await page.goto(origin+'/',{waitUntil:'networkidle'});await settle(page,'/');
    assert.equal(await page.title(),commercialPages.home.title);
    await page.screenshot({path:`${output}/home-${width}-first-visit.png`});
    assert.equal(analyticsRequests,0);assert.equal(await page.locator('script[data-wpb-ga4]').count(),0);
    await page.getByRole('button',{name:'No thanks',exact:true}).click();
    await page.screenshot({path:`${output}/home-${width}.png`,fullPage:true});
    await clickPath(page,'/buildings/');
    const order=await page.evaluate(()=>{
      const dir=document.querySelector('.buildings-directory');const guide=document.querySelector('[data-commercial-guide="buildings"]');
      return Boolean(dir&&guide&&(dir.compareDocumentPosition(guide)&Node.DOCUMENT_POSITION_FOLLOWING)&&guide.getBoundingClientRect().top>=dir.getBoundingClientRect().bottom);
    });assert.ok(order,'Buildings guide must follow filters and listings');
    await page.screenshot({path:`${output}/buildings-${width}.png`,fullPage:true});
    await page.locator('[data-project-filter-group="corridor"]').selectOption('north-flagler');
    await clickPath(page,'/projects/olara/');
    const doc=await page.evaluate(()=>window.__qaDoc);
    await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).click();await settle(page,plan.path);
    assert.notEqual(await page.evaluate(()=>window.__qaDoc),doc,'Plan link must retain native document navigation');
    assert.equal(await page.locator('.fp-drawing img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
    await page.screenshot({path:`${output}/olara-plan-${width}.png`,fullPage:true});
    await page.locator('[data-fp-action="availability"][data-fp-placement="intro"]').click();await settle(page,'/inquire/');
    await submit('floorplan:olara:residence-d');
    // Same session throughout: no clearing stored origins or creating fresh contexts.
    for(const [source,intent] of [['home','availability'],['buildings','pricing-packet']]){
      await clickPath(page,source==='home'?'/':'/buildings/');
      await page.locator(`[data-commercial-origin="${source}"][data-commercial-intent="${intent}"]:visible`).click();await settle(page,'/inquire/');
      await submit(`commercial:${source}:${intent}`,'south-flagler-house');
    }
    // Commercial packet -> floor plan -> availability must replace packet interest.
    await clickPath(page,'/buildings/');await page.locator('[data-project-filter-group="corridor"]').selectOption('north-flagler');
    await clickPath(page,'/projects/olara/');
    await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).click();await settle(page,plan.path);
    await page.locator('[data-fp-action="availability"][data-fp-placement="intro"]').click();await settle(page,'/inquire/');
    await submit('floorplan:olara:residence-d');
    for(const [source,intent] of [['home','pricing-packet'],['buildings','availability']]){
      await clickPath(page,source==='home'?'/':'/buildings/');
      await page.locator(`[data-commercial-origin="${source}"][data-commercial-intent="${intent}"]:visible`).click();await settle(page,'/inquire/');
      await submit(`commercial:${source}:${intent}`,'south-flagler-house');
    }
    assert.equal(analyticsRequests,0,'Denied consent must persist through native and SPA navigation');
    // Real consent controls, then observe one tag/config and one event per navigation.
    await context.clearCookies();
    await page.evaluate(()=>localStorage.removeItem('wpbAnalyticsConsentV1'));
    await page.goto(origin+'/',{waitUntil:'networkidle'});await settle(page,'/');
    await page.getByRole('button',{name:'Allow analytics',exact:true}).click();
    await page.waitForFunction(()=>document.querySelectorAll('script[data-wpb-ga4]').length===1);
    const configCount=()=>page.evaluate(()=>window.dataLayer.filter(e=>e[0]==='config').length);
    assert.equal(await configCount(),1);
    for(const route of ['/buildings/','/projects/olara/']){
      const before=events.length;await clickPath(page,route);
      assert.equal(events.slice(before).filter(e=>e.eventName==='page_view').length,1,'Duplicate route event');
      assert.equal(await page.locator('script[data-wpb-ga4]').count(),1);assert.equal(await configCount(),1);
    }
    // Modified native plan navigation opens a separate document without changing origin.
    const saved=await page.evaluate(()=>sessionStorage.getItem('wpbLeadAttribution'));
    const popupPromise=context.waitForEvent('page');
    await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).click({button:'middle'});
    const popup=await popupPromise;await settle(popup,plan.path);
    assert.equal(new URL(page.url()).pathname,'/projects/olara/');
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('wpbLeadAttribution')),saved);
    await popup.close();
    const before=events.length;
    await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).click();await settle(page,plan.path);
    assert.equal(events.slice(before).filter(e=>e.eventName==='page_view').length,1);
    assert.equal(await page.locator('script[data-wpb-ga4]').count(),1);assert.equal(await configCount(),1);
    await page.goBack({waitUntil:'networkidle'});await settle(page,'/projects/olara/');
    await page.goBack({waitUntil:'networkidle'});await settle(page,'/buildings/');
    assert.equal(await page.title(),commercialPages.buildings.title);
    assert.deepEqual(errors,[]);
    results.push({width,combinedJourney:'pass',nativeAndModifiedNavigation:'pass',consent:'pass',duplicateTagsOrEvents:false,buildingsListingsFirst:true});
    await context.close();
  }
  for(const width of [1440,390]){
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
    await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
    const page=await context.newPage();
    await page.goto(origin+'/');
    for(const route of ['/buildings/','/projects/olara/',plan.path]){
      await page.locator(`a[href="${route}"]`).first().click();await page.waitForURL(origin+route);
      assert.equal(await page.getByRole('heading',{level:1}).count(),1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),commercialOrigin+route);
    }
    await page.screenshot({path:`${output}/olara-plan-${width}-nojs.png`,fullPage:true});
    await page.locator('[data-fp-action="availability"]').first().click();await page.waitForURL(origin+'/inquire/');
    results.push({width,noJavaScriptNativeJourney:'pass',formSubmissionTested:false});
    await context.close();
  }
  console.log(JSON.stringify({combinedJourneys:'pass',interceptedSubmissions:results.filter(r=>r.interceptedSubmission).length,results}));
}finally{
  await fs.writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
