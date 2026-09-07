import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const origin='https://www.wpbnewconstruction.com';
const out='.runtime/p2-76-probe';await fs.mkdir(out,{recursive:true});
const log=[];
const browser=await chromium.launch();
try {
for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
 await context.exposeBinding('__probe',(_,x)=>log.push({width,...x}));
 await context.addInitScript(()=>{
   const snap=()=>{try{const a=JSON.parse(sessionStorage.getItem('wpbLeadAttribution')||'{}');return {cta:a.cta_context,landing:a.landing_page?new URL(a.landing_page).pathname:'',corridor:a.corridor};}catch{return {};}};
   const emit=x=>window.__probe({path:location.pathname,at:Date.now(),...x});
   const set=Storage.prototype.setItem;
   Storage.prototype.setItem=function(k,v){const result=set.call(this,k,v);if(k==='wpbLeadAttribution')emit({kind:'store',data:snap(),stack:new Error().stack.split('\n').slice(1,5).map(s=>s.replace(/https?:\/\/[^ ]+/g,'[script]'))});return result;};
   window.addEventListener('click',event=>{const a=event.target instanceof Element?event.target.closest('a'):null;if(a&&a.pathname==='/inquire/'){emit({kind:'click-before',href:a.pathname,originMatches:a.origin===location.origin,inApp:!!a.closest('#app'),corridor:a.dataset.corridorOrigin,intent:a.dataset.corridorIntent,data:snap(),trusted:event.isTrusted});queueMicrotask(()=>emit({kind:'click-after',data:snap(),defaultPrevented:event.defaultPrevented}));}},true);
   window.addEventListener('pageshow',()=>emit({kind:'pageshow',data:snap()}));
   window.addEventListener('wpb:analytics',e=>{if(e.detail.eventName==='cta_click')emit({kind:'cta-event',data:{context:e.detail.payload?.leadCaptureContext}});});
 });
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(r.request().method()==='POST'||u.origin!==origin)return r.fulfill({status:200,contentType:'text/javascript',body:''});return r.continue();});
 const page=await context.newPage();
 page.on('pageerror',e=>log.push({width,kind:'error',name:e.name,message:e.message.slice(0,150)}));
 page.on('response',async r=>{if(r.request().resourceType()==='document')log.push({width,kind:'document',path:new URL(r.url()).pathname,status:r.status(),clearSiteData:(await r.allHeaders())['clear-site-data']??null});});
 await page.goto(origin+'/');await page.locator('#app [data-commercial-guide="home"]').waitFor();
 await page.evaluate(()=>window.wpbSetAnalyticsConsent?.('granted'));
 for(let round=0;round<2;round++)for(const [key,path]of [['downtown','downtown-west-palm-beach'],['south-flagler','south-flagler'],['palm-beach','palm-beach']]){
   await page.goto(`${origin}/corridors/${path}/`);
   await page.locator(`#app [data-corridor-growth="${key}"]:visible`).waitFor();
   await page.locator(`[data-corridor-origin="${key}"][data-corridor-intent="availability"]:visible`).click();
   await page.waitForURL(origin+'/inquire/');await page.locator('#app .inquiry-form').waitFor();
   await page.waitForTimeout(1500);
   log.push({width,round,kind:'inquiry-result',expected:`corridor:${key}:availability`,...await page.evaluate(()=>({context:document.querySelector('.inquiry-form [name=lead_capture_context]')?.value,stored:JSON.parse(sessionStorage.getItem('wpbLeadAttribution')||'{}').cta_context,assets:[...document.querySelectorAll('script[src]')].filter(s=>new URL(s.src).origin===location.origin).map(s=>new URL(s.src).pathname)}))});
 }
 await context.close();
}
} finally {await browser.close();await fs.writeFile(out+'/probe.json',JSON.stringify(log,null,2));console.log(JSON.stringify(log));}
