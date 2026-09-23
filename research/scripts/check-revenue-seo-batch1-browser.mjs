import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium,webkit} from 'playwright';
const root=path.resolve('dist'),output=path.resolve('.runtime/revenue-seo-review');
await fs.mkdir(output,{recursive:true});
const copies=JSON.parse(await fs.readFile('content/project-copy-package.json','utf8'));
const routes=['nora-house','banyan-tree','olara','ritz-carlton-wpb'].map(id=>({id,path:`/projects/${id}/`,title:copies.find(x=>x.repoProjectId===id).seoTitle,description:copies.find(x=>x.repoProjectId===id).metaDescription}));
routes.push({id:'north-flagler',path:'/corridors/north-flagler/',title:'North Flagler New Construction Condos | Compare & Floor Plans',description:'Compare North Flagler condos including Olara, Ritz-Carlton and Alba: released floor plans, waterfront settings, active sales and buyer guidance before a gallery visit.'});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost');let name=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(name!==root&&!name.startsWith(root+path.sep)){res.writeHead(403).end();return;}if((await fs.stat(name)).isDirectory())name=path.join(name,'index.html');const data=await fs.readFile(name);res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(4198,'127.0.0.1',resolve));
const results=[];
try{
 for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch({headless:true});
  try{
   for(const [size,viewport] of [['desktop',{width:1440,height:1000}],['tablet',{width:834,height:1112}],['mobile',{width:390,height:844}]] ){
    const context=await browser.newContext({viewport});
    // No external analytics, production Maps, or real lead submissions.
    await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    const page=await context.newPage();
    for(const row of routes){
     const errors=[],onError=error=>errors.push(error.message);page.on('pageerror',onError);
     const response=await page.goto('http://127.0.0.1:4198'+row.path,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
     await page.locator(`[data-revenue-buyer-research="${row.id}"]`).waitFor({state:'visible'});
     await page.waitForFunction(title=>document.title===title,row.title);await page.waitForTimeout(300);
     assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),row.description);
     const canonical=await page.locator('link[rel="canonical"]').all();assert.equal(canonical.length,1);assert.equal(await canonical[0].getAttribute('href'),'https://www.wpbnewconstruction.com'+row.path);
     const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dims.scroll<=dims.width+1,`${row.id} ${size} overflow ${JSON.stringify(dims)}`);
     if(engineName==='chromium'&&size!=='tablet')await page.screenshot({path:path.join(output,`${row.id}-${size}.png`),fullPage:true});
     assert.deepEqual(errors,[],`${row.id} browser errors`);page.off('pageerror',onError);results.push({engine:engineName,viewport:size,path:row.path,metadata:'pass',canonical:'pass',visibleBuyerLinks:'pass',overflow:false});
    }
    await page.goto('http://127.0.0.1:4198/projects/nora-house/',{waitUntil:'domcontentloaded'});
    await page.locator('[data-revenue-buyer-research="nora-house"] a[href^="/inquire/"]').click();await page.waitForURL(/\/inquire\//);
    assert.equal(await page.locator('.inquiry-form select[name="project"]').inputValue(),'nora-house');results.push({engine:engineName,viewport:size,inquiryContext:'nora-house preserved; no form submitted'});
    await page.goto('http://127.0.0.1:4198/projects/banyan-tree/',{waitUntil:'domcontentloaded'});
    const dismiss=page.locator('[data-lead-modal]:visible [data-lead-modal-dismiss]').first();
    if(await dismiss.isVisible())await dismiss.click();
    await page.locator('[data-revenue-buyer-research="banyan-tree"] a[href="/floorplans/#floorplans-banyan-tree"]').click();
    await page.waitForURL(/\/floorplans\/#floorplans-banyan-tree$/);
    const banyanPlans=page.locator('#floorplans-banyan-tree .floorplan-gallery-grid button');
    await banyanPlans.first().waitFor({state:'visible'});assert.equal(await banyanPlans.count(),7);
    results.push({engine:engineName,viewport:size,floorplans:'Banyan buyer link opens seven approved layouts; no assets changed'});
    await page.goto('http://127.0.0.1:4198/compare/?projects=nora-house,banyan-tree',{waitUntil:'domcontentloaded'});
    const visibleMatrix=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');
    await visibleMatrix.getByText('Request current pricing',{exact:false}).first().waitFor();
    const comparison=await visibleMatrix.innerText();assert.match(comparison,/low \$2Ms/);assert.doesNotMatch(comparison,/\$1\.9M|1Q 2029|4Q 2029/);
    results.push({engine:engineName,viewport:size,comparison:'current NORA/Banyan commercial fields'});await context.close();
   }
  }finally{await browser.close();}
 }
 console.log(JSON.stringify({revenueBrowser:'pass',checks:results.length,results},null,2));
}finally{await fs.writeFile(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));await new Promise(resolve=>server.close(resolve));}
