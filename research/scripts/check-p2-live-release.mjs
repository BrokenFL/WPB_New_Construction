// PR #74 release audit only. Fixed live origin; no deployment or real lead sends.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {publishedFloorplanEntities} from '../../src/lib/floorplanEntities.ts';
import {commercialPages} from '../../src/lib/commercialContent.ts';
const origin='https://www.wpbnewconstruction.com';
const output='.runtime/p2-live';
const plan=publishedFloorplanEntities()[0];
const routes=['/','/buildings/','/floorplans/',plan.path,'/projects/olara/','/inquire/','/map/'];
const results=[];let browser;
await fs.mkdir(output,{recursive:true});
const fail=(label,error)=>{results.push({check:label,status:'fail',errorType:error?.name??'Error'});console.error('FAIL: '+label);};
const pass=(label,details={})=>{results.push({check:label,status:'pass',...details});console.log('PASS: '+label);};
const get=async(route)=>{const r=await fetch(origin+route,{signal:AbortSignal.timeout(30000)});return {status:r.status,text:await r.text()};};
const attr=(html,name)=>{const tag=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(t=>new RegExp(`name=["']${name}["']`,'i').test(t));return tag?.match(/content=["']([^"']*)["']/i)?.[1]??'';};
const title=html=>html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]??'';
const canonical=html=>[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).find(t=>/rel=["']canonical["']/i.test(t))?.match(/href=["']([^"']*)["']/i)?.[1]??'';
try{
 for(const route of routes){try{
  const actual=await get(route), expected=await fs.readFile('dist'+(route==='/'?'/index.html':route+'index.html'),'utf8');
  assert.equal(actual.status,200);assert.equal(canonical(actual.text),origin+route);
  assert.equal(title(actual.text),title(expected));assert.equal(attr(actual.text,'description'),attr(expected,'description'));
  assert.ok(title(actual.text).length>10);assert.ok(attr(actual.text,'description').length>30);
  if(['/floorplans/','/projects/olara/'].includes(route))assert.ok(actual.text.includes(`href="${plan.path}"`));
  if(route==='/buildings/')assert.ok(actual.text.indexOf('href="/projects/olara/"')<actual.text.indexOf('data-commercial-guide="buildings"'));
  pass('HTTP metadata '+route,{httpStatus:actual.status,title:title(actual.text),description:attr(actual.text,'description'),canonical:canonical(actual.text)});
 }catch(e){fail('HTTP metadata '+route,e);}}
 try{const r=await get('/sitemap.xml');assert.equal(r.status,200);assert.equal(r.text.split(`<loc>${plan.canonical}</loc>`).length-1,1);assert.ok(!r.text.includes('/floorplans/alba-palm-beach/residence-d/'));pass('Live sitemap Olara once; Alba excluded');}catch(e){fail('Live sitemap',e);}
 try{const r=await get('/floorplans/alba-palm-beach/residence-d/');assert.ok(!/data-floorplan-entity=["']alba|Alba Palm Beach Residence D Floor Plan/.test(r.text));assert.ok([404,410].includes(r.status)||canonical(r.text)!==origin+'/floorplans/alba-palm-beach/residence-d/');pass('Alba HTML not published',{httpStatus:r.status,responseCanonical:canonical(r.text)});}catch(e){fail('Alba HTML not published',e);}
 for(const resource of [plan.pdf,plan.preview]){try{
  const r=await fetch(origin+resource,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer());
  const hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(bytes),hash(await fs.readFile('public'+resource)));
  if(resource.endsWith('.pdf'))assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
  pass('Live approved asset '+(resource.endsWith('.pdf')?'PDF':'preview'),{path:resource,sha256:hash(bytes)});
 }catch(e){fail('Live approved asset '+resource,e);}}
 browser=await chromium.launch({headless:true});
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.startsWith('/api/')||/googletagmanager\.com|google-analytics\.com/.test(u.hostname))return r.abort();return r.continue();});
  const page=await context.newPage();
  for(const route of routes){try{
   await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.wpbAnalyticsQueue?.some(e=>e.eventName==='page_view'));
   const deny=page.getByRole('button',{name:'No thanks',exact:true});if(await deny.isVisible())await deny.click();
   await page.waitForTimeout(600);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),origin+route);
   assert.equal(await page.getByRole('heading',{level:1}).count(),1);
   assert.equal(await page.locator('script[type="application/ld+json"]').count(),1);
   await page.locator('script[type="application/ld+json"]').evaluate(s=>JSON.parse(s.textContent));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(route==='/')assert.equal(await page.title(),commercialPages.home.title);
   if(route==='/buildings/'){
    assert.equal(await page.title(),commercialPages.buildings.title);
    assert.ok(await page.evaluate(()=>{const d=document.querySelector('.buildings-directory'),g=document.querySelector('[data-commercial-guide="buildings"]');return d&&g&&(d.compareDocumentPosition(g)&Node.DOCUMENT_POSITION_FOLLOWING)&&g.getBoundingClientRect().top>=d.getBoundingClientRect().bottom;}));
   }
   if(['/floorplans/','/projects/olara/'].includes(route))assert.ok(await page.locator(`a[href="${plan.path}"]`).count()>0);
   if(route===plan.path){const img=page.locator('.fp-drawing img');await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());assert.equal(await img.getAttribute('src'),plan.preview);assert.ok(await page.locator(`a[href="${plan.pdf}"]`).count()>0);}
   await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=750){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70));}window.scrollTo(0,0);});
   const label=route==='/'?'home':route.replaceAll('/','-').replace(/^-|-$/g,'');
   await page.screenshot({path:`${output}/${label}-${width}.png`,fullPage:true});
   pass('Rendered '+width+' '+route,{h1:await page.getByRole('heading',{level:1}).innerText()});
  }catch(e){fail('Rendered '+width+' '+route,e);}}
  await context.close();
 }
 // Real Google Maps loader/tile responses are allowed unchanged. No Maps mocks.
 for(const width of [1440,390])for(const route of ['/','/map/']){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.startsWith('/api/')||/googletagmanager\.com|google-analytics\.com/.test(u.hostname))return r.abort();return r.continue();});
  const page=await context.newPage();let loaders=0;const codes=[];
  page.on('response',r=>{const u=new URL(r.url());if(u.hostname==='maps.googleapis.com'&&u.pathname==='/maps/api/js'&&r.ok())loaders++;});
  page.on('console',m=>{const code=m.text().match(/Google Maps JavaScript API (?:error|warning):\s*([A-Za-z0-9]+)/)?.[1];if(code)codes.push(code);});
  try{
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   const deny=page.getByRole('button',{name:'No thanks',exact:true});if(await deny.isVisible())await deny.click();
   const card=page.locator('.home-hero-map-card:visible').first();await card.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.querySelectorAll('.home-hero-map-card')].some(c=>!c.closest('[data-route-view]')?.hidden&&c.getAttribute('data-map-state')==='ready'&&!c.querySelector('.gm-err-container')&&[...c.querySelectorAll('.gm-style img')].some(i=>{try{const u=new URL(i.currentSrc||i.src);return /(^|\.)(googleapis\.com|google\.com|gstatic\.com)$/.test(u.hostname)&&/\/vt(?:\/|$)|\/maps\/vt|\/kh\/|\/maps\/tiles/.test(u.pathname)&&i.complete&&i.naturalWidth>=128;}catch{return false;}})),null,{timeout:30000});
   assert.ok(loaders>0);assert.deepEqual(codes,[]);
   if(route==='/map/')assert.ok(await card.evaluate(c=>c.querySelector('[data-hero-google-map]').getBoundingClientRect().width>=c.getBoundingClientRect().width-4));
   await page.waitForTimeout(1000);
   const before=await card.locator('.gm-style img').evaluateAll(imgs=>imgs.filter(i=>i.complete&&i.naturalWidth>=128).map(i=>i.currentSrc||i.src));
   await card.getByRole('button',{name:'Zoom in',exact:true}).click();
   await page.waitForFunction(old=>[...document.querySelectorAll('.home-hero-map-card')].filter(c=>!c.closest('[data-route-view]')?.hidden).flatMap(c=>[...c.querySelectorAll('.gm-style img')]).some(i=>i.complete&&i.naturalWidth>=128&&!old.includes(i.currentSrc||i.src)),before,{timeout:15000});
   if(route==='/map/'){
    const filter=page.locator('[data-map-filter="corridor"][data-map-filter-value="north-flagler"]');await filter.click();assert.equal(await filter.getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('[data-map-filter-result]').innerText(),/mapped project/);
   }
   assert.deepEqual(codes,[]);await page.screenshot({path:`${output}/real-map-${route==='/'?'home':'map'}-${width}.png`});
   pass('Real Maps '+width+' '+route,{loader:true,tiles:true,zoomChangedTiles:true,corridorControl:route==='/map/'?'pass':'not-applicable',errorCodes:codes});
  }catch(e){fail('Real Maps '+width+' '+route,e);results.at(-1).errorCodes=[...new Set(codes)];}
  await context.close();
 }
 // Load the actual Google tag after consent, intercept ALL measurement uploads.
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  let tags=0;const attempts=[];
  await context.route('**/*',r=>{
   const req=r.request(),u=new URL(req.url());
   if(u.hostname==='www.googletagmanager.com'&&u.pathname==='/gtag/js'){tags++;return r.continue();}
   if(/google-analytics\.com|analytics\.google\.com|googleadservices\.com|doubleclick\.net/.test(u.hostname)||u.pathname.endsWith('/collect')){
    const lines=(req.postData()||'').split('\n');for(const line of lines){const p=new URLSearchParams(u.search);for(const [k,v]of new URLSearchParams(line))p.set(k,v);if(p.get('en'))attempts.push({event:p.get('en'),path:new URL(p.get('dl')||origin).pathname});}
    return r.fulfill({status:204,body:''});
   }
   if(req.method()!=='GET'||u.pathname.startsWith('/api/'))return r.abort();return r.continue();
  });
  const page=await context.newPage();
  try{
   await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Allow analytics',exact:true}).waitFor();await page.waitForTimeout(1000);
   assert.equal(tags,0);assert.equal(attempts.length,0);
   await page.getByRole('button',{name:'No thanks',exact:true}).click();await page.goto(origin+'/buildings/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1000);assert.equal(tags,0);assert.equal(attempts.length,0);
   await page.evaluate(()=>localStorage.removeItem('wpbAnalyticsConsentV1'));await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
   await page.getByRole('button',{name:'Allow analytics',exact:true}).click();
   await page.waitForFunction(()=>window.google_tag_manager);await page.waitForTimeout(5000);
   assert.equal(tags,1);assert.equal(await page.locator('script[data-wpb-ga4]').count(),1);
   assert.equal(await page.evaluate(()=>window.dataLayer.filter(e=>e[0]==='config').length),1);
   assert.equal(await page.evaluate(()=>window.dataLayer.filter(e=>e[0]==='event'&&e[1]==='page_view').length),1);
   assert.equal(attempts.filter(e=>e.event==='page_view'&&e.path==='/').length,1);
   await page.locator('a[href="/buildings/"]:visible').first().click();await page.waitForURL(origin+'/buildings/');await page.waitForTimeout(5000);
   assert.equal(tags,1);assert.equal(attempts.filter(e=>e.event==='page_view'&&e.path==='/buildings/').length,1);
   await page.screenshot({path:`${output}/ga4-consented-${width}.png`});
   pass('Actual GA4 consent '+width,{deniedRequests:0,tagLoads:tags,collectionIntercepted:true,pageViews:attempts.filter(e=>e.event==='page_view'),duplicatePageViews:false});
  }catch(e){fail('Actual GA4 consent '+width,e);results.at(-1).safeCounts={tags,pageViews:attempts.filter(e=>e.event==='page_view')};}
  await context.close();
 }
}finally{
 await browser?.close();
 await fs.writeFile(`${output}/results.json`,JSON.stringify({origin,checkedAt:new Date().toISOString(),releaseSha:process.env.RELEASE_SHA,results},null,2));
 if(results.some(r=>r.status!=='pass'))process.exitCode=1;
}
