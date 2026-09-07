// No real lead, analytics collection or deployment. Actual Maps has its own keyed check.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { commercialOrigin, commercialEscape as e, commercialPages } from '../../src/lib/commercialContent.ts';
import { corridorGrowthPages as pages, renderGrowthCorridor } from '../../src/lib/corridorGrowthContent.ts';
const dist=path.resolve('dist'),output='.runtime/p2-corridors',results=[];
await fs.mkdir(output,{recursive:true});
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(dist+path.sep)&&file!==dist)throw Error('Path');if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
async function ready(page,route,javaScriptEnabled=true){
  // Static fallback HTML is intentionally visible before the legacy app loads.
  // JS journeys must wait for the enhanced element inside #app, not that fallback.
  const scope=javaScriptEnabled ? '#app ' : '';
  await page.waitForURL(origin+route);
  const key=Object.keys(pages).find(k=>pages[k].path===route);
  if(key)await page.locator(`${scope}[data-corridor-growth="${key}"]:visible`).waitFor();
  else if(route==='/')await page.locator(`${scope}[data-commercial-guide="home"]:visible`).waitFor();
  else if(route==='/buildings/')await page.locator(`${scope}[data-commercial-guide="buildings"]:visible`).waitFor();
  else if(route==='/inquire/')await page.locator(`${scope}.inquiry-form`).waitFor();
  else if(route==='/projects/olara/')await page.locator(`${scope}#wpb-floorplan-guides`).waitFor();
  // The legacy router sets its metadata after its DOM. Wait for the existing
  // enhancement's final title rather than accepting or racing the old title.
  const expectedTitle=key?pages[key].title:route==='/'?commercialPages.home.title:route==='/buildings/'?commercialPages.buildings.title:undefined;
  if(expectedTitle)await page.waitForFunction(title=>document.title===title,expectedTitle);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),commercialOrigin+route);
}
function graphCheck(graph,key){const c=pages[key],nodes=graph['@graph'];assert.equal(nodes.filter(n=>n['@type']==='CollectionPage').length,1);assert.equal(nodes.find(n=>n['@type']==='CollectionPage').url,commercialOrigin+c.path);assert.equal(nodes.find(n=>n['@type']==='ItemList').numberOfItems,c.projects.length);assert.equal(nodes.filter(n=>n['@type']==='BreadcrumbList').length,1);assert.ok(!nodes.some(n=>n['@type']==='FAQPage'));}
try{
  const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
  for(const [key,c]of Object.entries(pages)){
    const html=await fs.readFile(path.join(dist,c.path.slice(1),'index.html'),'utf8');
    assert.ok(html.includes(renderGrowthCorridor(key)));assert.ok(html.includes(`<title>${e(c.title)}</title>`));
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
    assert.equal(sitemap.split(`<loc>${commercialOrigin+c.path}</loc>`).length-1,1);
    const graph=JSON.parse(html.match(/id="wpb-static-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1]);graphCheck(graph,key);
    for(const [,href] of renderGrowthCorridor(key).matchAll(/(?:href|src)="(\/[^"?#]*)"/g))await fs.access(path.join(dist,href.slice(1),path.extname(href)?'':'index.html'));
    results.push({check:'static',key,canonical:commercialOrigin+c.path,status:'pass'});
  }
  assert.ok(!sitemap.includes('/floorplans/alba-palm-beach/residence-d/'));
  await assert.rejects(fs.access('dist/floorplans/alba-palm-beach/residence-d/index.html'));
  browser=await chromium.launch({headless:true});
  for(const javaScriptEnabled of [false,true])for(const width of [1440,390]){
    const context=await browser.newContext({javaScriptEnabled,viewport:{width,height:900},serviceWorkers:'block'});
    let payload,tagLoads=0;const events=[],errors=[];
    await context.exposeBinding('__corridorEvent',(_,event)=>events.push(event));
    await context.addInitScript(()=>{window.__corridorDoc=crypto.randomUUID();window.addEventListener('wpb:analytics',event=>window.__corridorEvent({doc:window.__corridorDoc,...event.detail}));window.turnstile={render:(_slot,o)=>{queueMicrotask(()=>o.callback('CORRIDOR_INTERCEPTED_TOKEN'));return 'fixture';},reset:()=>{}};});
    await context.route('**/*',r=>{
      const req=r.request(),u=new URL(req.url());
      if(u.origin===origin&&u.pathname==='/api/leads'&&req.method()==='POST'){payload=req.postDataJSON();return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"leadId":"corridor-intercepted"}'});}
      if(/google-analytics|googletagmanager/.test(u.hostname))tagLoads++;
      if(u.origin===origin&&!u.pathname.startsWith('/api/'))return r.continue();
      return r.fulfill({status:200,contentType:'text/javascript',body:''});
    });
    const page=await context.newPage();page.on('pageerror',err=>errors.push(err.name));
    for(const [key,c]of Object.entries(pages)){
      await page.goto(origin+c.path,{waitUntil:'networkidle'});await ready(page,c.path,javaScriptEnabled);
      const guide=page.locator(`[data-corridor-growth="${key}"]:visible`);
      assert.equal(await page.title(),c.title);assert.equal(await page.getByRole('heading',{level:1}).innerText(),c.heading);
      assert.equal(await page.getByRole('heading',{level:1}).count(),1);
      assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),c.description);
      assert.equal(await page.locator('script[type="application/ld+json"]').count(),1);
      graphCheck(await page.locator('script[type="application/ld+json"]').evaluate(s=>JSON.parse(s.textContent)),key);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.equal(await guide.locator('.cr-project').count(),c.projects.length);
      const img=guide.locator('.cr-hero img');await img.evaluate(i=>i.decode());assert.ok(await img.evaluate(i=>i.naturalWidth>0));
      for(const button of await guide.locator('[data-corridor-intent]').all())assert.ok((await button.boundingBox()).height>=44);
      assert.equal(tagLoads,0,'Analytics inactive before consent');
      if(javaScriptEnabled){const deny=page.getByRole('button',{name:'No thanks',exact:true});if(await deny.isVisible())await deny.click();}
      await page.screenshot({path:`${output}/${key}-${width}-${javaScriptEnabled?'js':'nojs'}.png`,fullPage:true});
      await guide.locator('summary').click();
      await page.screenshot({path:`${output}/${key}-${width}-${javaScriptEnabled?'js':'nojs'}-expanded.png`,fullPage:true});
      const contrast=await guide.locator('h1,h2,h3').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,color:getComputedStyle(n).color})));
      assert.ok(contrast.every(h=>h.color==='rgb(23, 50, 72)'),'Guide headings must retain the dark site palette');
      results.push({check:'browser',key,width,javaScriptEnabled,status:'pass',overflow:false,touchTargets:true,headingContrast:'dark-on-light'});
      // Primary project link preserves native navigation; browser back restores corridor metadata.
      await guide.locator('.cr-project h3 a').first().click();
      await page.waitForURL(origin+'/projects/'+c.projects[0].slug+'/');
      await page.goBack();await ready(page,c.path,javaScriptEnabled);assert.equal(await page.title(),c.title);
    }
    if(javaScriptEnabled){
      assert.equal(tagLoads,0,'Rejection persists across navigation');
      // Begin one session at Home; never clear attribution while switching request families.
      await context.clearCookies();
      await page.evaluate(()=>{sessionStorage.removeItem('wpbLeadAttribution');});
      await page.goto(origin+'/');await ready(page,'/');
      await page.evaluate(()=>window.wpbSetAnalyticsConsent?.('granted'));
      async function submit(expected,project,expectedCorridor=''){
        await ready(page,'/inquire/');
        await page.waitForFunction(v=>document.querySelector('.inquiry-form [name="lead_capture_context"]')?.value===v,expected);
        const form=page.locator('.inquiry-form');
        assert.equal(await form.locator('[name="project"]').inputValue(),expected.startsWith('floorplan:')?'olara':'');
        const interest=expected.endsWith('pricing-packet')?'Request private floor-plan packet':'Request current availability';
        assert.equal(await form.locator('[name="interest"]').inputValue(),interest);
        await form.locator('[name="project"]').selectOption(project);
        await form.locator('[name="name"]').fill('Corridor QA Person');await form.locator('[name="email"]').fill('corridor-qa@example.invalid');await form.locator('[name="phone"]').fill('202-555-0158');await form.locator('[name="message"]').fill('CORRIDOR_QA_DO_NOT_SEND');await form.locator('[name="consent"]').check();await form.locator('[name="turnstile_token"]').evaluate(i=>i.value='CORRIDOR_INTERCEPTED_TOKEN');
        payload=undefined;const start=events.length;
        const response=page.waitForResponse(r=>r.url()===origin+'/api/leads'&&r.request().method()==='POST');
        await form.locator('button[type="submit"]').click();await response;
        await page.waitForFunction(()=>document.querySelector('.inquiry-form .form-status')?.textContent?.includes('request was received'));
        assert.equal(payload.cta_context,expected);assert.equal(payload.lead_capture_context,expected);assert.equal(payload.project,project);assert.equal(payload.interest,interest);
        assert.equal(payload.landing_page,origin+'/');assert.equal(payload.submission_page,origin+'/inquire/');
        assert.equal(payload.corridor||'',expectedCorridor);
        if(!expected.startsWith('floorplan:'))assert.notEqual(payload.project_name,'Olara');
        assert.doesNotMatch(await page.evaluate(()=>JSON.stringify([window.wpbAnalyticsQueue,window.dataLayer])),/Corridor QA Person|corridor-qa@|202-555-0158|CORRIDOR_QA_DO_NOT_SEND|CORRIDOR_INTERCEPTED_TOKEN/);
        assert.equal(events.slice(start).filter(e=>e.eventName==='contact_form_submit').length,1);assert.equal(events.slice(start).filter(e=>e.eventName==='lead_form_submit_success').length,1);
        results.push({check:'intercepted-inquiry',width,context:expected,project,corridor:expectedCorridor,status:'pass',piiExcluded:true});
      }
      for(const [key,c]of Object.entries(pages))for(const intent of ['availability','pricing-packet']){
        await page.goto(origin+c.path);await ready(page,c.path);
        const before=events.length;
        await page.locator(`[data-corridor-origin="${key}"][data-corridor-intent="${intent}"]:visible`).click();
        await submit(`corridor:${key}:${intent}`,key==='downtown'?'mr-c':key==='palm-beach'?'olin-palm-beach':'south-flagler-house',key);
        assert.equal(events.slice(before).filter(e=>e.eventName==='cta_click'&&e.payload.leadCaptureContext===`corridor:${key}:${intent}`).length,1);
      }
      await page.goto(origin+'/floorplans/olara/residence-d/');await ready(page,'/floorplans/olara/residence-d/');
      await page.locator('[data-fp-placement="intro"][data-fp-action="availability"]').click();await submit('floorplan:olara:residence-d','olara','north-flagler');
      await page.goto(origin+pages.downtown.path);await ready(page,pages.downtown.path);await page.locator('[data-corridor-origin="downtown"][data-corridor-intent="pricing-packet"]').click();await submit('corridor:downtown:pricing-packet','mr-c','downtown');
      await page.goto(origin+'/buildings/');await ready(page,'/buildings/');assert.equal(await page.title(),commercialPages.buildings.title);await page.locator('[data-commercial-origin="buildings"][data-commercial-intent="availability"]:visible').click();await submit('commercial:buildings:availability','south-flagler-house');
      assert.ok(await page.locator('script[data-wpb-ga4]').count()<=1);
    }
    assert.deepEqual(errors,[]);await context.close();
  }
}catch(error){results.push({check:'failure',status:'fail',type:error.name,message:String(error.message).slice(0,700),line:error.stack?.match(/check-corridor-growth.mjs:(\d+)/)?.[1]});process.exitCode=1;}
finally{await browser?.close();await new Promise(r=>server.close(r));await fs.writeFile(`${output}/results.json`,JSON.stringify({testedSha:sha,status:results.some(r=>r.status==='fail')?'fail':'pass',results,limits:'All lead POSTs and third-party analytics are intercepted. No-JS validates research/navigation, not form submission. GA4 transport diagnosis is parked and not represented as passing.'},null,2));console.log(JSON.stringify(results));}
