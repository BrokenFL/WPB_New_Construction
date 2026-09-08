// Read-only source QA. No publication, deployment, credentials or lead requests.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { approvedFloorplanLibrary } from '../../src/data/floorplanApprovedLibrary.ts';
const letters=['A','C','F','I','L'];
const sourcePage='https://www.olarawestpalmbeach.com/floorplans';
const out='.runtime/olara-source-review';
const hash=b=>createHash('sha256').update(b).digest('hex');
const collecting=process.argv.includes('--collect');
const manifestPath='research/source-material-review/olara-plan-expansion-verified.json';
const manifest=collecting?null:JSON.parse(await fs.readFile(manifestPath,'utf8'));
await fs.mkdir(out,{recursive:true});
const report={reviewedAt:new Date().toISOString(),sourcePage,mode:collecting?'collection-for-human-review':'verified-snapshot-check',status:'pending',plans:[]};
try {
 const pageResponse=await fetch(sourcePage,{signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache'}});
 assert.equal(pageResponse.status,200,'Official source page must be available');
 const html=await pageResponse.text();report.pageHash=hash(html);
 const project=approvedFloorplanLibrary.find(p=>p.projectId==='olara');assert.ok(project);
 for(const letter of letters){
  const matches=project.plans.filter(p=>p.title===`Residence ${letter}`);assert.equal(matches.length,1);
  const plan=matches[0],sourceUrl=`https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_${letter}.pdf`;
  assert.ok(html.includes(sourceUrl),`Official page must still link ${letter}`);
  const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache'}});assert.equal(response.status,200);
  const official=Buffer.from(await response.arrayBuffer());assert.equal(official.subarray(0,5).toString(),'%PDF-');
  const archived=await fs.readFile('public'+plan.href);
  const preview=path.posix.join(path.posix.dirname(plan.href),'previews',path.posix.basename(plan.href,'.pdf')+'.jpg');
  const previewBytes=await fs.readFile('public'+preview);
  const record={letter,sourceUrl,pdf:plan.href,preview,officialPdfSHA256:hash(official),archivedPdfSHA256:hash(archived),previewSHA256:hash(previewBytes),retrievedAt:new Date().toISOString(),httpDate:response.headers.get('date'),httpLastModified:response.headers.get('last-modified'),expected:{title:plan.title,bedrooms:plan.bedrooms,bathrooms:plan.bathrooms,interiorSqFt:plan.interiorSqFt,terraceSqFt:plan.terraceSqFt,totalSqFt:plan.totalSqFt,detail:plan.detail}};
  report.plans.push(record);
  for(const [name,bytes]of [['official.pdf',official],['approved.pdf',archived],['approved-preview.jpg',previewBytes]])await fs.writeFile(path.join(out,`${letter}-${name}`),bytes);
  assert.equal(record.officialPdfSHA256,record.archivedPdfSHA256,`${letter}: archived drawing differs from current official download; requires review, not silent replacement`);
  if(!collecting){
   const reviewed=manifest.plans.find(p=>p.letter===letter);assert.ok(reviewed,`${letter}: missing human source review`);
   for(const key of ['sourceUrl','pdf','preview','officialPdfSHA256','archivedPdfSHA256','previewSHA256'])assert.equal(record[key],reviewed[key],`${letter}: ${key} changed`);
   assert.deepEqual(record.expected,reviewed.expected,`${letter}: approved facts changed`);
   assert.equal(reviewed.printedRevisionDate,null,'Do not infer a revision from a filename or PDF metadata');
  }
 }
 report.status=collecting?'collected-awaiting-visual-review':'pass';
} catch(error){report.status='fail';report.error=String(error.message).slice(0,300);process.exitCode=1;}
await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({sourceReview:report.status,plans:report.plans.map(p=>p.letter),error:report.error}));
