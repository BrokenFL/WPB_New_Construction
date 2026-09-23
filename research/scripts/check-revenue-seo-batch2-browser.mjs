import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium,webkit} from 'playwright';
const root=path.resolve('dist'),output=path.resolve('.runtime/revenue-seo-batch2');
await fs.mkdir(output,{recursive:true});
const copies=JSON.parse(await fs.readFile('content/project-copy-package.json','utf8'));
const routes=['shorecrest','south-flagler-house'].map(id=>({id,path:`/projects/${id}/`,selector:`[data-revenue-buyer-research="${id}"]`,title:copies.find(x=>x.repoProjectId===id).seoTitle,description:copies.find(x=>x.repoProjectId===id).metaDescription}));
routes.push({id:'south-flagler',path:'/corridors/south-flagler/',selector:'[data-corridor-growth="south-flagler"]',title:'South Flagler New Construction Condos | Plans & Buyer Guide',description:'Compare South Flagler new construction condos, South Flagler House floor plans and completed waterfront alternatives. Build a buyer shortlist before a sales-gallery visit.'});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost');let name=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(name!==root&&!name.startsWith(root+path.sep)){res.writeHead(403).end();return;}if((await fs.stat(name)).isDirectory())name=path.join(name,'index.html');const data=await fs.readFile(name);res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(4202,'127.0.0.1',resolve));
const results=[];
const base='http://127.0.0.1:4202';
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
     const raw=await response.text();assert.ok(raw.includes(row.title.replaceAll('&','&amp;'))||raw.includes(row.title));
     await page.locator(row.selector).waitFor({state:'visible'});await page.waitForFunction(title=>document.title===title,row.title);await page.waitForTimeout(350);
     assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),row.description);
     const canonical=page.locator('link[rel="canonical"]');assert.equal(await canonical.count(),1);assert.equal(await canonical.getAttribute('href'),'https://www.wpbnewconstruction.com'+row.path);
     const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dims.scroll<=dims.width+1,JSON.stringify({row:row.id,size,...dims}));
     if(row.id==='shorecrest')assert.doesNotMatch(await page.locator('main').innerText(),/From \$3\.69M/);
     if(engineName==='chromium'&&size!=='tablet')await page.screenshot({path:path.join(output,`${row.id}-${size}.png`),fullPage:true});
     assert.deepEqual(errors,[]);page.off('pageerror',onError);results.push({engine:engineName,viewport:size,route:row.path,metadata:'static + hydrated match',canonical:'pass',overflow:false});
    }
    for(const [id,count] of [['shorecrest',4],['south-flagler-house',8]]){
     await page.goto(base+`/projects/${id}/`,{waitUntil:'domcontentloaded'});await dismiss(page);
     await page.locator(`[data-revenue-buyer-research="${id}"] a[href^="/inquire/"]`).click();await page.waitForURL(/\/inquire\//);
     assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(),id);
     results.push({engine:engineName,viewport:size,inquiry:id+' context preserved; no submission'});
     await page.goto(base+`/projects/${id}/`,{waitUntil:'domcontentloaded'});await dismiss(page);
     await page.locator(`[data-revenue-buyer-research="${id}"] a[href="/floorplans/#floorplans-${id}"]`).click();
     await page.waitForURL(base+`/floorplans/#floorplans-${id}`);
     const plans=page.locator(`#floorplans-${id} .floorplan-gallery-grid button`);await plans.first().waitFor({state:'visible'});assert.equal(await plans.count(),count);
     results.push({engine:engineName,viewport:size,plans:id,count});
    }
    await page.goto(base+'/compare/?projects=shorecrest,south-flagler-house',{waitUntil:'domcontentloaded'});
    const matrix=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');
    await matrix.getByText('Request current pricing',{exact:false}).first().waitFor();
    const text=await matrix.innerText();assert.match(text,/7\.98M/);assert.match(text,/Request current delivery guidance/);assert.doesNotMatch(text,/1Q 2027|2Q 2027|3\.6M|9\.6M|2\.20\/sq/);
    results.push({engine:engineName,viewport:size,compare:'updated target commercial values'});await context.close();
   }
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({result:'pass',checks:results.length,results},null,2));
}finally{await fs.writeFile(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));await new Promise(resolve=>server.close(resolve));}
