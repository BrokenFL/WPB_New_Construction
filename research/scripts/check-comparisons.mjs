import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {comparisonPages,comparisonSchema} from '../../src/lib/comparisonContent.ts';
import {comparisonPaths,comparisonProjectIds,parseShortlist,encodeShortlist} from '../../src/lib/shortlist.ts';
import {normalizeLead} from '../../functions/_shared/lead-utils.js';
const dist=path.resolve('dist'),out=path.resolve('.runtime/p2-comparisons');await fs.mkdir(out,{recursive:true});
const results=[];const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://local');let file=path.join(dist,decodeURIComponent(u.pathname));if(u.pathname.endsWith('/'))file=path.join(file,'index.html');const data=await fs.readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
async function ready(page,route,js=true){await page.waitForURL(u=>u.pathname===route);if(js){const key=Object.keys(comparisonPaths).find(k=>comparisonPaths[k]===route);if(key)await page.locator(`#app[data-comparison-ready="${key}"]`).waitFor();else if(route==='/floorplans/olara/residence-d/')await page.waitForFunction(()=>window.wpbAnalyticsQueue?.some(e=>e.eventName==='page_view'));else await page.locator('#app .site-shell').waitFor();}}
try{
 const sitemap=await fs.readFile(path.join(dist,'sitemap.xml'),'utf8');const checked=new Set();
 for(const[key,c]of Object.entries(comparisonPages)){
  const html=await fs.readFile(path.join(dist,c.path,'index.html'),'utf8');assert.ok(html.includes(`rel="canonical" href="https://www.wpbnewconstruction.com${c.path}"`));
  assert.deepEqual(JSON.parse(html.match(/<script id="wpb-comparison-schema"[^>]*>([\s\S]*?)<\/script>/)[1]),comparisonSchema(key));
  const entries=[...sitemap.matchAll(/<url>[\s\S]*?<\/url>/g)].map(m=>m[0]).filter(e=>e.includes(`<loc>https://www.wpbnewconstruction.com${c.path}</loc>`));assert.equal(entries.length,1);assert.ok(entries[0].includes('<lastmod>2026-09-07</lastmod>'));
  for(const m of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)){const u=new URL(m[1],origin);assert.equal(u.search,'');if(checked.has(u.pathname))continue;checked.add(u.pathname);const response=await fetch(origin+u.pathname);assert.equal(response.status,200,u.pathname);}
  results.push({check:'static',key,status:'pass'});
 }
 assert.ok(!sitemap.includes('/floorplans/alba-palm-beach/residence-d/'));
 browser=await chromium.launch();
 for(const js of [false,true])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:960},javaScriptEnabled:js,serviceWorkers:'block'});let tags=0,posts=[];const errors=[];
  await context.addInitScript(()=>{window.turnstile={render:()=> 'qa-widget',getResponse:()=> 'qa-intercepted-token',reset:()=>{}};});
  await context.route('**/*',async r=>{const u=new URL(r.request().url());
   if(u.origin===origin&&u.pathname==='/api/leads'&&r.request().method()==='POST'){posts.push(r.request().postDataJSON());return r.fulfill({status:201,contentType:'application/json',body:'{"ok":true,"message":"Your request was received."}'});}
   if(u.origin!==origin){if(u.hostname==='www.googletagmanager.com')tags++;return r.fulfill({status:200,contentType:'text/javascript',body:''});}
   return r.continue();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.name));
  for(const[key,c]of Object.entries(comparisonPages)){
   await page.goto(origin+c.path);await ready(page,c.path,js);
   assert.equal(await page.title(),c.title);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('h1').innerText(),c.heading);
   assert.equal(await page.locator('meta[name=description]').getAttribute('content'),c.description);assert.equal(await page.locator('script[type="application/ld+json"]').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.equal(await page.locator('.bc-project').count(),comparisonProjectIds[key].length);
   await page.screenshot({path:path.join(out,`${key}-${width}-${js?'js':'nojs'}.png`),fullPage:true});
   const link=page.locator('.bc-project h3 a').first();await link.click();await ready(page,'/projects/olara/',js);await page.goBack();await ready(page,c.path,js);
   results.push({check:'browser',key,width,js,status:'pass'});
  }
  if(js){
   assert.equal(tags,0,'No tag before optional consent');
   await page.evaluate(()=>window.wpbSetAnalyticsConsent('denied'));
   await page.goto(origin+comparisonPaths.flagler);await ready(page,comparisonPaths.flagler);assert.equal(tags,0,'Rejection persists');
   await page.evaluate(()=>window.wpbSetAnalyticsConsent('granted'));
   const submit=async(expected,primary)=>{
    await ready(page,'/inquire/');const form=page.locator('.inquiry-form');await form.locator('[name=lead_capture_context]').waitFor({state:'attached'});
    await page.waitForFunction(exp=>document.querySelector('.inquiry-form [name=lead_capture_context]')?.value===exp,expected);
    const summary=page.locator('[data-shortlist-review]');if(parseShortlist(expected))assert.equal(await summary.count(),1);else assert.equal(await summary.count(),0);
    await form.locator('select[name=project]').selectOption(primary);
    if(parseShortlist(expected)) {
      const visual=await summary.locator('h3').evaluate(el=>({color:getComputedStyle(el).color,width:el.getBoundingClientRect().width}));
      assert.equal(visual.color,'rgb(23, 45, 56)');assert.ok(visual.width>200);
    }
    if(parseShortlist(expected)&&posts.length===0)await page.screenshot({path:path.join(out,`inquiry-shortlist-${width}.png`),fullPage:true});
    await form.locator('[name=name]').fill('QA Synthetic Buyer');await form.locator('[name=email]').fill('qa-shortlist@example.invalid');await form.locator('[name=message]').fill('SYNTHETIC_PRIVATE_NOTE_DO_NOT_TRACK');await form.locator('[name=consent]').check();
    await form.evaluate(el=>{let f=el.querySelector('[name=turnstile_token]');if(!f){f=document.createElement('input');f.type='hidden';f.name='turnstile_token';el.append(f);}f.value='qa-intercepted-token';});
    const before=posts.length;await form.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('.inquiry-form .form-status')?.textContent?.includes('request was received'));
    assert.equal(posts.length,before+1);const body=posts.at(-1);assert.equal(body.project,primary);assert.equal(body.cta_context,expected);assert.equal(body.lead_capture_context,expected);assert.equal(body.landing_page,origin+comparisonPaths.flagler);assert.equal(body.submission_page,origin+'/inquire/');
    if(parseShortlist(expected)){assert.deepEqual(parseShortlist(normalizeLead(body,new Request(origin+'/api/leads')).cta_context).ids,parseShortlist(expected).ids);assert.equal(body.interest,'Compare buildings');}
    const analytics=await page.evaluate(()=>window.wpbAnalyticsQueue||[]);const encoded=JSON.stringify(analytics);assert.ok(!encoded.includes('qa-shortlist@'));assert.ok(!encoded.includes('SYNTHETIC_PRIVATE'));assert.ok(!encoded.includes('QA Synthetic Buyer'));
    assert.equal(analytics.filter(e=>e.eventName==='contact_form_submit').length,1);assert.equal(analytics.filter(e=>e.eventName==='lead_form_submit_success').length,1);
    results.push({check:'intercepted-inquiry',width,context:expected,primary,status:'pass',normalizedSelectionPreserved:true});
   };
   await page.goto(origin+comparisonPaths.trio+'?email=PRIVATE_QUERY#shortlist');await ready(page,comparisonPaths.trio);
   // An actual subset, never a list inferred from previously visited buildings.
   await page.locator('input[value="ritz-carlton-wpb"]').uncheck();
   await page.locator('input[value="shorecrest"]').uncheck();assert.equal(await page.locator('[data-shortlist-submit]').getAttribute('aria-disabled'),'true');await page.locator('[data-shortlist-submit]').press('Enter');assert.equal(new URL(page.url()).pathname,comparisonPaths.trio);assert.equal(posts.length,0);
   await page.locator('input[value="shorecrest"]').check();
   assert.equal(await page.evaluate(()=>window.wpbAnalyticsQueue.filter(e=>e.eventName==='page_view').length),1);
   assert.ok(!(await page.evaluate(()=>JSON.stringify(window.wpbAnalyticsQueue))).includes('PRIVATE_QUERY'));
   await page.locator('[data-shortlist-submit]').click();await submit(encodeShortlist('trio',['olara','shorecrest']),'shorecrest');
   // Edit via a canonical path and preserve the prior explicit subset.
   await page.locator('[data-shortlist-review] a').click();await ready(page,comparisonPaths.trio);assert.equal(await page.locator('input[value="ritz-carlton-wpb"]').isChecked(),false);
   await page.locator('input[value="ritz-carlton-wpb"]').check();await page.locator('[data-shortlist-submit]').click();await submit(encodeShortlist('trio',comparisonProjectIds.trio),'olara');
   await page.goto(origin+comparisonPaths.flagler);await ready(page,comparisonPaths.flagler);await page.locator('[data-shortlist-submit]').click();await submit(encodeShortlist('flagler',['olara','south-flagler-house']),'south-flagler-house');
   await page.goto(origin+'/floorplans/olara/residence-d/');await ready(page,'/floorplans/olara/residence-d/');await page.locator('a[data-fp-action="availability"]').first().click();await submit('floorplan:olara:residence-d','olara');
   await page.goto(origin+'/corridors/south-flagler/');await ready(page,'/corridors/south-flagler/');await page.locator('.site-shell [data-corridor-intent="pricing-packet"]').click();await submit('corridor:south-flagler:pricing-packet','south-flagler-house');
   await page.goto(origin+'/buildings/');await ready(page,'/buildings/');await page.locator('.site-shell [data-commercial-origin="buildings"][data-commercial-intent="availability"]:visible').click();await submit('commercial:buildings:availability','olara');
   await page.goto(origin+'/answers/');await ready(page,'/answers/');await page.locator('.site-shell [data-comparison-discovery]').waitFor();await page.locator(`.site-shell [data-comparison-discovery] a[href="${comparisonPaths.trio}"]`).click();await ready(page,comparisonPaths.trio);
   results.push({check:'discovery-navigation',width,status:'pass'});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
}catch(error){results.push({check:'failure',status:'fail',type:error.name,message:error.message?.slice(0,240),line:error.stack?.split('\n').find(l=>l.includes('check-comparisons'))});process.exitCode=1;}
finally{await browser?.close();server.close();const summary={testedSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:process.exitCode?'fail':'pass',checkedAt:new Date().toISOString(),results};await fs.writeFile(path.join(out,'results.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));}
