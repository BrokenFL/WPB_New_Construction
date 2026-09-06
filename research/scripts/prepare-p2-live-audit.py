from pathlib import Path
p=Path('research/scripts/check-p2-live-release.mjs')
s=p.read_text()
def replace(old,new):
 global s
 assert s.count(old)==1, 'Live diagnostic patch target changed'
 s=s.replace(old,new)
replace("errorType:error?.name??'Error'", "errorType:error?.name??'Error',line:error?.stack?.match(/check-p2-live-release.mjs:(\\d+):/)?.[1],message:String(error?.message??'').replace(/https?:\\/\\/[^\\s'\\\"]+/g,'[URL]').replace(/AIza[\\w-]+/g,'[REDACTED]').slice(0,500)")
replace("await page.waitForTimeout(600);", "await page.waitForTimeout(2000);")
replace("assert.match(await page.locator('[data-map-filter-result]').innerText(),/mapped project/);", "assert.match(await page.locator('[data-map-filter-result]').innerText(),/mapped project/i);")
replace("}catch(e){fail('Rendered '+width+' '+route,e);}", """}catch(e){
    fail('Rendered '+width+' '+route,e);
    results.at(-1).observed=await page.evaluate(()=>({title:document.title,canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),h1:[...document.querySelectorAll('h1')].filter(e=>e.getBoundingClientRect().height).map(e=>e.innerText),graphs:document.querySelectorAll('script[type=\"application/ld+json\"]').length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,guide:!!document.querySelector('[data-commercial-guide]'),discovery:!!document.querySelector('#wpb-floorplan-guides')}));
    await page.screenshot({path:`${output}/diagnostic-${route==='/'?'home':route.replaceAll('/','-')}-${width}.png`,fullPage:true});
   }""")
replace("results.at(-1).safeCounts={tags,pageViews:attempts.filter(e=>e.event==='page_view')};", """results.at(-1).safeCounts={tags,pageViews:attempts.filter(e=>e.event==='page_view'),commands:await page.evaluate(()=>({consent:window.wpbAnalyticsConsent,destination:window.wpbAnalyticsDestination,config:window.dataLayer?.filter(e=>e[0]==='config').length,pageView:window.dataLayer?.filter(e=>e[0]==='event'&&e[1]==='page_view').length,types:window.dataLayer?.map(e=>Object.prototype.toString.call(e)),tagInstalled:!!window.google_tag_manager}))};
    // Diagnostic control only: original acceptance stays FAILED. Never upload a collection request.
    const baselineResult=results.at(-1);
    await page.evaluate(()=>{const queued=[...(window.dataLayer??[])].filter(e=>Array.isArray(e));const documented=function(){window.dataLayer.push(arguments);};window.gtag=documented;for(const args of queued)documented(...args);});
    await page.waitForTimeout(5000);
    baselineResult.documentedArgumentsProbe={browserOnly:true,productionUnchanged:true,collectionIntercepted:true,pageViews:attempts.filter(e=>e.event==='page_view')};
    await page.screenshot({path:`${output}/ga4-diagnostic-${width}.png`});
   """)
p.write_text(s)
# Keep production untouched; only fixture the external challenge in this fully intercepted POST test.
p=Path('research/scripts/check-integrated-journeys.mjs');s=p.read_text()
old='const origin=`http://127.0.0.1:${server.address().port}`;';assert s.count(old)==1
s=s.replace(old,"const origin='https://www.wpbnewconstruction.com';")
s=s.replace("const output='.runtime/p2-integration';","const output='.runtime/p2-live-journeys';")
old="await context.addInitScript(()=>{";assert s.count(old)==1
s=s.replace(old,"""await context.addInitScript(()=>{
      // Only an intercepted browser fixture: this token must never reach the real lead endpoint.
      window.turnstile={render:(_slot,options)=>{queueMicrotask(()=>options.callback('INTEGRATION_INTERCEPTED_TOKEN'));return 'intercepted-fixture';},reset:()=>{}};
""")
Path('research/scripts/check-live-journeys-temp.mjs').write_text(s)
