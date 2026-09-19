import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const origin = process.env.V2_ORIGIN || 'http://127.0.0.1:5186';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('V2 review requires a local preview.');
const phase = process.env.V2_PHASE || 'round1';
const root = `output/playwright/${phase}`;
await fs.mkdir(root,{recursive:true});
const browser = await chromium.launch();
const results=[];
const routes = {'home':'/',buildings:'/buildings/',olara:'/projects/olara/',berkeley:'/projects/berkeley/',compare:'/compare/',floorplans:'/floorplans/',plan:'/floorplans/olara/residence-d/',inquire:'/inquire/'};
for (const [device,width] of [['desktop',1440],['mobile',390],['narrow',320]]) {
 const context = await browser.newContext({viewport:{width,height:device==='desktop'?1000:844}, reducedMotion:'reduce'});
 await context.route('**/api/leads', r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"leadId":"v2-intercepted"}'}));
 await context.route(/google-analytics|googletagmanager/, r=>r.abort());
 const page=await context.newPage();
 for (const [name,path] of Object.entries(routes)) {
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  await page.goto(origin+path,{waitUntil:'networkidle'});
  await page.locator(name==='plan'?'.fp-page':`#app .site-shell[data-active-route="${name==='olara'||name==='berkeley'?'project':name==='inquire'?'inquire':name}"]`).waitFor({state:'visible'});
  if(name==='home') await page.waitForFunction(()=>document.querySelector('.home-hero h1')?.textContent?.includes('with perspective'));
  await page.addStyleTag({content:'html,body{scroll-behavior:auto!important}'});
  const decline=page.getByRole('button',{name:'No thanks',exact:true}); if(await decline.count()) await decline.click();
  // Traverse the page to trigger real lazy-image loading; return to the cover for capture.
  await page.evaluate(async()=>{ for(let y=0;y<document.documentElement.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,30));} });
  await page.evaluate(async()=>{await Promise.race([Promise.all(Array.from(document.images).filter(i=>i.getClientRects().length).map(i=>{i.loading='eager';return i.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,4000))]);window.scrollTo(0,0);await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  await page.screenshot({path:`${root}/${name}-${device}-cover.png`});
  if(device!=='narrow') await page.screenshot({path:`${root}/${name}-${device}-full.png`,fullPage:true});
  const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:Array.from(document.querySelectorAll('h1')).filter(e=>e.getClientRects().length).map(e=>e.innerText.trim()),brokenImages:Array.from(document.images).filter(i=>i.getClientRects().length&&!i.naturalWidth&&i.getAttribute('src')).map(i=>{const u=new URL(i.getAttribute('src'),location.href);return u.origin===location.origin?u.pathname:`${u.origin}${u.pathname}`;}),overflow:Array.from(document.querySelectorAll('body *')).filter(e=>e.getClientRects().length&&e.getBoundingClientRect().right>innerWidth+2&&getComputedStyle(e).position!=='absolute').slice(0,12).map(e=>e.className)}));
  results.push({route:path,device,...state,errors});page.off('pageerror',onError);
 }
 await context.close();
}
await browser.close();await fs.writeFile(`${root}/manifest.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({route,device,scrollWidth,width,h1,brokenImages,errors})=>({route,device,overflow:scrollWidth-width,h1:h1.length,brokenImages,errors})),null,2));
