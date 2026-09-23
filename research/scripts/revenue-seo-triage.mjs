import fs from 'node:fs';
import {getProjectIntelligence,buildProjectIntelligenceReviewQueue} from '../../src/lib/projectIntelligence.ts';
import {projectIntelligenceRegistryEntries} from '../../src/lib/projectIntelligenceRegistry.ts';
const stage=process.argv[2]||'after';if(!['before','after'].includes(stage))throw new Error('Expected before or after');
const target=new Set(['nora-house','banyan-tree','olara','ritz-carlton-wpb']);
const projects=await Promise.all(projectIntelligenceRegistryEntries.filter(p=>p.publicationState==='published').map(p=>getProjectIntelligence(p.publicSlug)));
const queue=buildProjectIntelligenceReviewQueue(projects);
const norm=x=>String(x||'').toLowerCase().replace(/\bdr\.?\b/g,'drive').replace(/\bst\.?\b/g,'street').replace(/[^a-z0-9]+/g,' ').trim();
const rows=queue.rows.map(row=>{
 const agree=norm(row.publicValue)===norm(row.compareValue)&&Boolean(norm(row.publicValue));
 let severity='P2',explanation='Unresolved non-Batch-1 review item; no independent claim that it is harmless.';
 if(target.has(row.projectSlug)){
  if(!agree&&['address','status','deliveryTiming','residenceCount'].includes(row.field)){severity='P0';explanation='Target project has differing current public and Compare values; inspect buyer-visible output.';}
  else if(!agree){severity='P1';explanation='Target project needs commercial/search consistency review.';}
  else{severity='P3';explanation='Current public and Compare values agree. Historical-source or schema-review flag intentionally retained.';}
 }else if(agree&&row.schemaBehavior==='omitted'){severity='P3';explanation='Matching current values with a preserved schema-review omission, not a detected current contradiction.';}
 return {...row,releaseSeverity:severity,releaseExplanation:explanation};
});
const counts=Object.fromEntries(['P0','P1','P2','P3'].map(key=>[key,rows.filter(r=>r.releaseSeverity===key).length]));
const output={stage,scope:[...target],originalAuditSummary:queue.summary,releaseTriageCounts:counts,rows};
fs.mkdirSync('.runtime/revenue-seo-review',{recursive:true});fs.writeFileSync(`.runtime/revenue-seo-review/triage-${stage}.json`,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({stage,originalAuditSummary:queue.summary,releaseTriageCounts:counts},null,2));
// Diagnostic classification, not silent approval of historical facts. Dedicated
// source, prerender and browser assertions provide the actual release checks.
