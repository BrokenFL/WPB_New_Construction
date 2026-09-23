import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const scope=new Set(['nora-house','banyan-tree','olara','ritz-carlton-wpb']);
const original=file=>execFileSync('git',['show',`572f109282bc63f2e012185efa14abf0dae9bfc2:${file}`],{encoding:'utf8'});
test('LLM discovery uses the same current plan counts and project titles',()=>{
 const llms=fs.readFileSync('dist/llms.txt','utf8');
 for(const project of read('public/data/floorplans.json').projects.filter(p=>scope.has(p.projectId)))
  assert.ok(llms.includes(`- ${project.name}: ${project.count} floorplan records`),project.projectId);
 for(const copy of read('content/project-copy-package.json').filter(p=>scope.has(p.repoProjectId)))
  assert.ok(llms.includes(`- ${copy.seoTitle}: /projects/${copy.repoProjectId}/`),copy.repoProjectId);
 assert.ok(llms.includes('North Flagler New Construction Condos | Compare & Floor Plans'));
});
test('The compatibility registry preserves the previously published cohort and all 77 protected documents',()=>{
 const old=JSON.parse(original('public/data/floorplans.json'));
 const expected=[...new Set(old.projects.filter(p=>scope.has(p.projectId)).flatMap(p=>p.plans.map(x=>x.href)).filter(x=>/^\/projects\/[^/]+\/docs\/floorplans\/.+\.(?:pdf|png|jpe?g|webp)$/i.test(x||'')))].sort();
 const registered=read('config/preserved-floorplan-document-urls.json');
 assert.ok(expected.every(url=>registered.includes(url)),'all original cohort documents remain registered');
 assert.equal(registered.length,77);
 for(const url of registered){
  const source=fs.readFileSync(path.join('public',url.slice(1)));
  const built=fs.readFileSync(path.join('dist',url.slice(1)));
  assert.ok(source.length>0);assert.ok(source.equals(built),url);
 }
});
