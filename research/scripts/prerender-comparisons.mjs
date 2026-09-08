import fs from 'node:fs/promises';
import path from 'node:path';
import { comparisonPages, comparisonSchema, comparisonJson, comparisonReviewed, renderComparison, renderComparisonLinks } from '../../src/lib/comparisonContent.ts';
import { commercialEscape as e, commercialOrigin } from '../../src/lib/commercialContent.ts';
export function renderComparisonDocument(source, key) {
  const c=comparisonPages[key]; if(!c)throw new Error('Unknown comparison');
  let html=source;
  const one=(re,text)=>{if([...html.matchAll(new RegExp(re.source,'g'))].length!==1)throw new Error('Comparison template mismatch');html=html.replace(re,()=>text);};
  one(/<title>[\s\S]*?<\/title>/,`<title>${e(c.title)}</title>`);
  for(const[attr,name,value]of [['name','description',c.description],['property','og:title',c.title],['property','og:description',c.description],['name','twitter:title',c.title],['name','twitter:description',c.description],['property','og:url',commercialOrigin+c.path]]){
    const re=new RegExp(`<meta ${attr}="${name}" content="[^"]*"\\s*/?>`);
    if(re.test(html))one(re,`<meta ${attr}="${name}" content="${e(value)}" />`);
  }
  one(/<link rel="canonical" href="[^"]*"\s*\/?>/,`<link rel="canonical" href="${commercialOrigin+c.path}" />`);
  // Replace the entire app body, not an arbitrary first nested closing div.
  one(/<div id="app">[\s\S]*?<\/div>\s*(?=<script|<\/body>)/,`<div id="app">${renderComparison(key)}</div>`);
  one(/<script id="(?:wpb-static-structured-data|wpb-comparison-schema)"[^>]*>[\s\S]*?<\/script>/,`<script id="wpb-comparison-schema" type="application/ld+json">${comparisonJson(comparisonSchema(key))}</script>`);
  html=html.replace(/window\.__WPB_PRERENDER_PATH__\s*=\s*"[^"]*"/g,`window.__WPB_PRERENDER_PATH__ = "${c.path}"`);
  return html;
}
function stylesFor(manifest,key,seen=new Set()){
  if(seen.has(key))return [];seen.add(key);const node=manifest[key];if(!node)throw new Error('Missing comparison dependency');
  return [...(node.css??[]),...(node.imports??[]).flatMap(child=>stylesFor(manifest,child,seen))];
}
export async function prerenderComparisons(root=process.cwd()){
  const dist=path.join(root,'dist');
  const manifest=JSON.parse(await fs.readFile(path.join(root,'.runtime/build/manifest.json'),'utf8'));
  const css=[...new Set(stylesFor(manifest,'src/comparisonPage.ts'))];if(!css.length)throw new Error('Missing comparison CSS');
  for(const file of css){if(!/^assets\/[a-zA-Z0-9_-]+\.css$/.test(file))throw new Error('Unsafe stylesheet');await fs.access(path.join(dist,file));}
  const template=await fs.readFile(path.join(dist,comparisonPages.flagler.path,'index.html'),'utf8');
  for(const[key,c]of Object.entries(comparisonPages)){
    let html=renderComparisonDocument(template,key);
    html=html.replace('</head>',css.map(file=>`<link data-comparison-styles rel="stylesheet" href="/${file}" />`).join('\n')+'\n</head>');
    const file=path.join(dist,c.path,'index.html');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,html);
  }
  for(const route of ['/answers/','/compare/','/projects/olara/','/projects/ritz-carlton-wpb/','/projects/shorecrest/']){
    const file=path.join(dist,route,'index.html');let html=await fs.readFile(file,'utf8');
    if(!html.includes('data-comparison-discovery'))html=html.replace('</main>',renderComparisonLinks()+'</main>');
    html=html.replace('</head>',css.map(file=>`<link data-comparison-styles rel="stylesheet" href="/${file}" />`).join('\n')+'\n</head>');
    await fs.writeFile(file,html);
  }
  const sf=path.join(dist,'sitemap.xml');let sm=await fs.readFile(sf,'utf8');
  for(const c of Object.values(comparisonPages)){
    const url=commercialOrigin+c.path;let count=0;
    sm=sm.replace(/<url>[\s\S]*?<\/url>/g,entry=>{if(!entry.includes(`<loc>${url}</loc>`))return entry;count++;return entry.replace(/<lastmod>[^<]*<\/lastmod>/g,'').replace('</loc>',`</loc><lastmod>${comparisonReviewed}</lastmod>`);});
    if(count>1)throw new Error('Duplicate comparison sitemap entry');
    if(!count)sm=sm.replace('</urlset>',`<url><loc>${url}</loc><lastmod>${comparisonReviewed}</lastmod></url>\n</urlset>`);
  }
  await fs.writeFile(sf,sm);
  const llmsFile=path.join(dist,'llms.txt');let llms=await fs.readFile(llmsFile,'utf8');
  for(const c of Object.values(comparisonPages)){if(!llms.includes(c.path))llms+=`\n- [${c.heading}](${commercialOrigin+c.path}): source-backed buyer differences and a selected-building comparison request.\n`;}
  await fs.writeFile(llmsFile,llms);console.log(JSON.stringify({comparisonPrerender:'pass',routes:Object.values(comparisonPages).map(c=>c.path)}));
}
