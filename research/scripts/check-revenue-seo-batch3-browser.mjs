import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium,webkit} from 'playwright';
const root=path.resolve('dist'),output=path.resolve('.runtime/revenue-seo-batch3');
await fs.mkdir(output,{recursive:true});
const copies=JSON.parse(await fs.readFile('content/project-copy-package.json','utf8'));
const routes=['berkeley','mandarin-oriental','mr-c'].map(id=>({id,path:`/projects/${id}/`,selector:`[data-revenue-buyer-research="${id}"]`,title:copies.find(x=>x.repoProjectId===id).seoTitle,description:copies.find(x=>x.repoProjectId===id).metaDescription}));
routes.push({id:'north-flagler',path:'/corridors/north-flagler/',selector:'[data-revenue-buyer-research="north-flagler"]',title:'North Flagler New Construction Condos | Compare & Floor Plans',description:null});
routes.push({id:'downtown',path:'/corridors/downtown-west-palm-beach/',selector:'[data-corridor-growth="downtown"]',title:'Downtown West Palm Beach New Condos | Locations & Buyer Guide',description:null});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost');let name=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(name!==root&&!name.startsWith(root+path.sep)){res.writeHead(403).end();return;}if((await fs.stat(name)).isDirectory())name=path.join(name,'index.html');const data=await fs.readFile(name);res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(4203,'127.0.0.1',resolve));
const results=[];
const base='http://127.0.0.1:4203';
async function dismiss(page){const button=page.locator('[data-lead-modal]:visible [data-lead-modal-dismiss]').first();if(await button.isVisible())await button.click();}
try{
 for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch({headless:true});
  try{
   for(const [size,viewport] of [['desktop',{width:1440,height:1000}],['tablet',{width:834,height:1112}],['mobile',{width:390,height:844}]]){
    const context=await browser.newContext({viewport});
    // Read-only preview. No production lead submission, analytics or keyed Maps.
    await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'&&['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
    const page=await context.newPage();
    for(const row of routes){
     const errors=[],onError=error=>errors.push(error.message);page.on('pageerror',onError);
     const response=await page.goto(base+row.path,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
     const raw=await response.text();assert.ok(raw.includes(row.title.replaceAll('&','&amp;'))||raw.includes(row.title),row.id+' title');
     await page.locator(row.selector).waitFor({state:'visible'});await page.waitForFunction(title=>document.title===title,row.title);await page.waitForTimeout(350);
     if(row.description)assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),row.description);
     const canonical=page.locator('link[rel="canonical"]');assert.equal(await canonical.count(),1);assert.equal(await canonical.getAttribute('href'),'https://www.wpbnewconstruction.com'+row.path);
     const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dims.scroll<=dims.width+1,JSON.stringify({row:row.id,size,...dims}));
     if(row.id==='mandarin-oriental')assert.doesNotMatch(await page.locator('main').innerText(),/2031/);
     if(row.id==='berkeley')assert.doesNotMatch(await page.locator('main').innerText(),/\$12\.75M|550 S\. Australian/);
     if(row.id==='mr-c')assert.doesNotMatch(await page.locator('main').innerText(),/383 Okeechobee|\$2\.19\/sq ft/);
     if(engineName==='chromium'&&size!=='tablet')await page.screenshot({path:path.join(output,`${row.id}-${size}.png`),fullPage:true});
     assert.deepEqual(errors,[]);page.off('pageerror',onError);results.push({engine:engineName,viewport:size,route:row.path,metadata:'static + hydrated match',canonical:'pass',overflow:false});
    }
    for(const id of ['berkeley','mandarin-oriental','mr-c']){
     await page.goto(base+`/projects/${id}/`,{waitUntil:'domcontentloaded'});await dismiss(page);
     await page.locator(`[data-revenue-buyer-research="${id}"] a[href^="/inquire/"]`).click();await page.waitForURL(/\/inquire\//);
     assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(),id);
     results.push({engine:engineName,viewport:size,inquiry:id+' context preserved; no submission'});
    }
    // Berkeley has eight approved gallery layouts; its ninth catalog record is an external Residence F page.
    for(const [id,count] of [['berkeley',8],['mr-c',32]]){
     await page.goto(base+`/projects/${id}/`,{waitUntil:'domcontentloaded'});await dismiss(page);
     await page.locator(`[data-revenue-buyer-research="${id}"] a[href="/floorplans/#floorplans-${id}"]`).click();
     await page.waitForURL(base+`/floorplans/#floorplans-${id}`);
     const plans=page.locator(`#floorplans-${id} .floorplan-gallery-grid button`);await plans.first().waitFor({state:'visible'});assert.equal(await plans.count(),count);
     results.push({engine:engineName,viewport:size,plans:id,count});
    }
    await page.goto(base+'/compare/?projects=berkeley,mr-c',{waitUntil:'domcontentloaded'});
    const matrix=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');
    await matrix.getByText('Request current pricing',{exact:false}).first().waitFor();
    const text=await matrix.innerText();assert.match(text,/Request current pricing/);assert.doesNotMatch(text,/1Q 2027|2Q 2027|\$12\.75M|\$2\.19\/sq ft/);
    results.push({engine:engineName,viewport:size,compare:'berkeley+mr-c qualified commercial values'});
    await page.goto(base+'/compare/?projects=mandarin-oriental,olara',{waitUntil:'domcontentloaded'});
    const matrix2=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');
    await matrix2.getByText('To confirm',{exact:false}).first().waitFor();
    const text2=await matrix2.innerText();assert.doesNotMatch(text2,/1Q 2031/);
    results.push({engine:engineName,viewport:size,compare:'mandarin+olara no 2031 delivery claim'});
    await context.close();
   }
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({result:'pass',checks:results.length},null,2));
}finally{await fs.writeFile(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));await new Promise(resolve=>server.close(resolve));}
