import fs from 'node:fs';
import {getProjectIntelligence,buildProjectIntelligenceReviewQueue} from '../../src/lib/projectIntelligence.ts';
import {projectIntelligenceRegistryEntries} from '../../src/lib/projectIntelligenceRegistry.ts';
const stage=process.argv[2];if(!['before','after'].includes(stage))throw new Error('Expected before/after');
const scope=new Set(['shorecrest','south-flagler-house']);
const projects=await Promise.all(projectIntelligenceRegistryEntries.filter(p=>p.publicationState==='published').map(p=>getProjectIntelligence(p.publicSlug)));
const queue=buildProjectIntelligenceReviewQueue(projects);
const norm=x=>String(x||'').toLowerCase().replace(/\bdr\.?\b/g,'drive').replace(/\bst\.?\b/g,'street').replace(/[^a-z0-9]+/g,' ').trim();
const rows=queue.rows.map(row=>{
 const equal=Boolean(norm(row.publicValue))&&norm(row.publicValue)===norm(row.compareValue);
 const severity=scope.has(row.projectSlug)?equal?'P3':['address','status','deliveryTiming','residenceCount'].includes(row.field)?'P0':'P1':equal&&row.schemaBehavior==='omitted'?'P3':'P2';
 return {...row,releaseSeverity:severity,releaseExplanation:scope.has(row.projectSlug)?equal?'Current surfaces agree; historical or schema approval review is retained.':'Target current-field disagreement requires verification.':'Outside this batch; not certified harmless.'};
});
const result={stage,scope:[...scope],summary:queue.summary,counts:Object.fromEntries(['P0','P1','P2','P3'].map(p=>[p,rows.filter(r=>r.releaseSeverity===p).length])),rows};
fs.mkdirSync('.runtime/revenue-seo-batch2',{recursive:true});fs.writeFileSync(`.runtime/revenue-seo-batch2/triage-${stage}.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,rows:undefined},null,2));
