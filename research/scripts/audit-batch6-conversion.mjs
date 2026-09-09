import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Evidence collection only. No application changes, lead submissions or deployment.
const origin = 'https://www.wpbnewconstruction.com';
const productionSha = '0713e029cc251fc9a49c5e429fdda6ac85e46202';
const width = Number(process.argv[2] || 390);
assert.ok([390, 1440].includes(width));
const out = path.resolve('.runtime/batch6-audit', String(width));
await fs.mkdir(out, { recursive: true });
const routes = ['/', '/buildings/', '/map/', '/floorplans/', '/projects/olara/', '/projects/rosewood-residences-west-palm-beach/', '/projects/maison-dor/', '/answers/olara-vs-ritz-carlton-vs-shorecrest/', '/corridors/south-flagler/', '/inquire/'];
const safeUrl = value => { const u = new URL(value, origin); return u.origin === origin ? u.pathname + u.search : u.origin + u.pathname; };
// Public browser Maps keys still do not belong in review artifacts. The independent
// workflow scan remains fail-closed; this does not weaken production/preflight QA.
async function writeJson(file, value) {
  const text=JSON.stringify(value,null,2).replace(/AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{30,}/g,'[credential-redacted]');
  await fs.writeFile(file,text);
}
const results = [];
const browser = await chromium.launch({ headless: true });

async function snapshot(page) {
  return page.evaluate(() => {
    const visible = e => {
      if (e.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    };
    const text = e => (e.getAttribute('aria-label') || e.innerText || e.value || '').replace(/\s+/g, ' ').trim();
    const attrs = e => Object.fromEntries([...e.attributes].filter(a => /^(data-|aria-|id$|type$)/.test(a.name)).map(a => [a.name, a.value]));
    return {
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      social: Object.fromEntries(['og:image', 'twitter:image'].map(key => [key, document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.getAttribute('content') ?? null])),
      headings: [...document.querySelectorAll('h1')].filter(visible).map(e => text(e)),
      schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => ({id:e.id, graphNodes:(JSON.parse(e.textContent)['@graph'] || []).map(n => ({id:n['@id'],type:n['@type']}))})),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      text: document.body.innerText,
      controls: [...document.querySelectorAll('a,button,[role="button"],input[type="submit"]')].filter(visible).map(e => {
        const r = e.getBoundingClientRect(), section = e.closest('section,aside,header,footer,nav,[role="dialog"],form');
        let fixed = false; for (let p = e; p && p !== document.body; p=p.parentElement) if (['fixed','sticky'].includes(getComputedStyle(p).position)) fixed=true;
        return {tag:e.tagName.toLowerCase(), label:text(e).slice(0,200), href:e.getAttribute('href'), attributes:attrs(e), section:section?.id || section?.className || section?.tagName || '', sectionHeading:section?.querySelector('h1,h2,h3')?.textContent?.trim(), documentY:Math.round(r.y+scrollY), x:Math.round(r.x), width:Math.round(r.width), height:Math.round(r.height), inViewport:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth, fixedOrSticky:fixed};
      }),
      forms: [...document.forms].filter(visible).map(form => ({className:form.className, action:form.getAttribute('action'), attributes:attrs(form), text:form.innerText, fields:[...form.elements].map(e => ({tag:e.tagName.toLowerCase(), name:e.name, type:e.type, required:e.required, label:e.labels?.[0]?.innerText, placeholder:e.getAttribute('placeholder'), options:e.tagName==='SELECT'?[...e.options].map(o=>({value:o.value,label:o.text})):undefined, contextValue:['project','interest','lead_capture_context','project_name'].includes(e.name)?e.value:undefined}))})),
      scripts:[...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean).map(src=>{const u=new URL(src,location.href);return u.origin===location.origin?u.pathname:u.origin+u.pathname;}),
      timings: performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/')&&/\.js(?:\?|$)/.test(r.name)).map(r=>({path:new URL(r.name).pathname,transferBytes:r.transferSize,encodedBytes:r.encodedBodySize,decodedBytes:r.decodedBodySize,initiator:r.initiatorType}))
    };
  });
}

async function firstVisible(locator) {
  for (let i=0;i<await locator.count();i++) if (await locator.nth(i).isVisible()) return locator.nth(i);
}

try {
  for (const routePath of routes) {
    const name = routePath.split('/').filter(Boolean).join('-') || 'home';
    const context = await browser.newContext({viewport:{width,height:width<600?844:1000}, serviceWorkers:'block'});
    const blocked = [], pageErrors = [], chunks = new Map(), bodyTasks=[];
    await context.route('**/*', async route => {
      const req=route.request(), u=new URL(req.url());
      if ((u.origin===origin && (u.pathname.startsWith('/api/') || !['GET','HEAD','OPTIONS'].includes(req.method()))) || /googletagmanager|google-analytics|challenges\.cloudflare/.test(u.hostname)) {
        blocked.push({path:u.origin===origin?u.pathname:u.hostname,method:req.method()});
        return route.fulfill({status:204,body:''});
      }
      return route.continue();
    });
    const page=await context.newPage(); page.setDefaultTimeout(12000);
    page.on('pageerror',e=>pageErrors.push(e.message));
    page.on('response',response=>{
      const u=new URL(response.url());
      if(u.origin===origin && u.pathname.startsWith('/assets/') && u.pathname.endsWith('.js')) {
        bodyTasks.push(response.body().then(body=>chunks.set(u.pathname,{path:u.pathname,bytes:body.length,gzipBytes:gzipSync(body).length,status:response.status()})).catch(()=>{}));
      }
    });
    const result={path:routePath,width};
    try {
      const response=await page.goto(origin+routePath,{waitUntil:'domcontentloaded',timeout:45000});
      result.httpStatus=response.status(); assert.equal(response.status(),200);
      const html=await response.text();
      result.initialDocument={entry:[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]),social:[...html.matchAll(/<meta\b[^>]*(?:og:image|twitter:image)[^>]*>/g)].map(m=>m[0])};
      await page.waitForTimeout(3500);
      await page.screenshot({path:path.join(out,`${name}-arrival.png`)});
      result.arrival=await snapshot(page);
      const decline=await firstVisible(page.getByRole('button',{name:'No thanks',exact:true}));
      if(decline) await decline.click();
      await page.waitForTimeout(300);
      await page.evaluate(()=>window.scrollTo(0,0));
      result.baseline=await snapshot(page);
      await Promise.allSettled(bodyTasks);
      result.initialApplicationJs=[...chunks.values()];
      await page.screenshot({path:path.join(out,`${name}-full.png`),fullPage:true});
      await page.screenshot({path:path.join(out,`${name}-viewport.png`)});
      const ask=await firstVisible(page.getByRole('button',{name:/^ask wpb$/i}));
      if(ask) {
        await ask.click(); await page.waitForTimeout(400);
        result.ask=await snapshot(page);
        const before=new Set(result.baseline.text.split('\n').map(s=>s.trim()));
        result.ask.newText=result.ask.text.split('\n').filter(s=>s.trim()&&!before.has(s.trim()));
        await page.screenshot({path:path.join(out,`${name}-ask.png`)});
        await page.keyboard.press('Escape'); await page.waitForTimeout(200);
        result.ask.escapeFocusRestored=await ask.evaluate(e=>document.activeElement===e);
        await page.goto(origin+routePath,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(1800);
      }
      const contact=await firstVisible(page.getByRole('button',{name:/^contact the team$/i})) || await firstVisible(page.getByRole('link',{name:/^contact the team$/i}));
      if(contact) {
        result.contactTrigger={tag:await contact.evaluate(e=>e.tagName),href:await contact.getAttribute('href')};
        if(!/^(tel:|mailto:)/.test(result.contactTrigger.href||'')) {
          await contact.click(); await page.waitForTimeout(800);
          result.contact=await snapshot(page); result.contact.url=safeUrl(page.url());
          const before=new Set(result.baseline.text.split('\n').map(s=>s.trim()));
          result.contact.newText=result.contact.text.split('\n').filter(s=>s.trim()&&!before.has(s.trim()));
          await page.screenshot({path:path.join(out,`${name}-contact.png`)});
        }
      }
      result.status='collected';
    } catch(error) {
      result.status='collection-error'; result.error=String(error.message).replace(/AIza[\w-]+/g,'[redacted]');
      await page.screenshot({path:path.join(out,`${name}-error.png`)}).catch(()=>{});
    } finally {
      result.blockedRequests=blocked; result.pageErrors=pageErrors;
      results.push(result);
      await writeJson(path.join(out,'routes.json'),{productionSha,harnessSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),collectedAt:new Date().toISOString(),results});
      console.log(JSON.stringify({path:routePath,width,status:result.status,error:result.error,controls:result.baseline?.controls.length,ask:!!result.ask,contact:!!result.contact,social:result.baseline?.social}));
      await context.close();
    }
  }
} finally {await browser.close();}

async function filesUnder(dir) {
  const files=[];
  for(const e of await fs.readdir(dir,{withFileTypes:true}).catch(()=>[])) {const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await filesUnder(p));else if(e.isFile())files.push(p);}
  return files;
}
const footprints=[];
for(const root of ['public','dist']) {
  const groups=new Map(); let count=0,totalBytes=0;
  for(const file of await filesUnder(root)) {
    if(!/\.(?:png|jpe?g|webp|gif|svg|avif|pdf|mp4|webm|glb)$/i.test(file))continue;
    const bytes=await fs.readFile(file), hash=createHash('sha256').update(bytes).digest('hex');count++;totalBytes+=bytes.length;
    const g=groups.get(hash)||{sha256:hash,size:bytes.length,paths:[]};g.paths.push(file);groups.set(hash,g);
  }
  const duplicates=[...groups.values()].filter(g=>g.paths.length>1).sort((a,b)=>b.size*(b.paths.length-1)-a.size*(a.paths.length-1));
  footprints.push({root,files:count,totalBytes,duplicateGroups:duplicates.length,redundantCopies:duplicates.reduce((s,g)=>s+g.paths.length-1,0),redundantBytes:duplicates.reduce((s,g)=>s+g.size*(g.paths.length-1),0),groups:duplicates});
}
await writeJson(path.join(out,'duplicate-assets.json'),{note:'Byte-identical media groups; not permission to delete. dist is a no-key audit build of production code; not a measurement of per-visitor transfer.',footprints});
const sourcePaths=['src/main.ts','src/index.ts','src/lib/inquiryContext.ts','src/lib/leadCapture.ts','src/lib/analyticsSafety.ts','vite.config.ts',...await filesUnder('functions'),...await filesUnder('research/scripts')].filter((p,i,a)=>a.indexOf(p)===i);
const sourceEvidence=[];
for(const file of sourcePaths) {
  if(!/\.(?:ts|js|mjs)$/.test(file))continue;
  const lines=(await fs.readFile(file,'utf8').catch(()=>'' )).split('\n');
  const indices=lines.map((line,i)=>/Ask WPB|Contact the Team|og:image|twitter:image|ensureSubmissionId|submission_id|normalizeLead|function.*[Cc]oncierge|function.*[Ii]nquiry|function.*[Aa]ssistant|function.*[Aa]sk|request_intent|inquiry-form/.test(line)?i:-1).filter(i=>i>=0);
  if(!indices.length)continue;
  const ranges=[];for(const i of indices){const from=Math.max(0,i-8),to=Math.min(lines.length,i+35);const last=ranges.at(-1);if(last&&from<=last.to)last.to=Math.max(last.to,to);else ranges.push({from,to});}
  sourceEvidence.push({file,ranges:ranges.map(r=>({start:r.from+1,end:r.to,content:lines.slice(r.from,r.to).join('\n')}))});
}
await writeJson(path.join(out,'source-evidence.json'),sourceEvidence);
assert.equal(results.filter(r=>r.status!=='collected').length,0,'One or more route collections failed; inspect evidence before drawing conclusions.');
console.log(JSON.stringify({audit:'collected',width,routes:results.length,productionSha,realLeadsSent:0}));
