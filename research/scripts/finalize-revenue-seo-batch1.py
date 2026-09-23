#!/usr/bin/env python3
"""Source-only fixes found by the real browser/prerender review."""
from pathlib import Path
import csv, io, json
root=Path(__file__).resolve().parents[2]
# A gallery is a physical sales location, not a document.
p=root/'research/scripts/prerender-static-routes.mjs'
s=p.read_text();s=s.replace('    .replace(/\\bsales gallery\\b/gi, "buyer packet")\n','');p.write_text(s)
# Construction status and active-sales classification are separate.
p=root/'content/wpb_new_construction_building_database_cleaned.csv'
rows=list(csv.DictReader(io.StringIO(p.read_text())));fields=list(rows[0])
identity=json.loads((root/'content/project-identity-decisions.json').read_text())['projects']
allowed={p['compareDatabaseId'] for p in identity if p['publicSlug'] in ['olara','ritz-carlton-wpb']}
for row in rows:
 if row['project_id'] in allowed:row['status_badge']='Under Construction'
buf=io.StringIO(newline='');writer=csv.DictWriter(buf,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(rows);p.write_text(buf.getvalue())
# Mobile Compare intentionally hides its desktop table. Check the visible matrix.
p=root/'research/scripts/check-revenue-seo-batch1-browser.mjs';s=p.read_text()
old="    await page.locator('[data-compare-results]').getByText('Request current pricing',{exact:false}).first().waitFor();\n    const comparison=await page.locator('[data-compare-results]').innerText();"
new="    const visibleMatrix=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');\n    await visibleMatrix.getByText('Request current pricing',{exact:false}).first().waitFor();\n    const comparison=await visibleMatrix.innerText();"
if new not in s:
 if old not in s:raise ValueError('Unexpected browser test source')
 s=s.replace(old,new,1)
p.write_text(s)
# Correct the derived publication projection, not the approved plan source.
p=root/'research/scripts/build-site-intelligence.mjs';s=p.read_text()
helper = r'''function approvedRevenueFloorplanProjects(projects) {
  const scope = new Set(["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb"]);
  const source = fsSync.readFileSync(path.join(workspace, "src/data/floorplanApprovedLibrary.ts"), "utf8");
  const approved = readTsArray(source, "approvedFloorplanLibrary");
  const byId = new Map(approved.map((project) => [project.projectId, project]));
  for (const id of scope) {
    const project = byId.get(id);
    if (!project || project.count !== project.plans.length || !project.count) {
      throw new Error(`Approved floor-plan source review required: ${id}`);
    }
  }
  return projects.map((project) => {
    if (!scope.has(project.projectId)) return project;
    const review = byId.get(project.projectId);
    const plans = canonicalizePublicPlans(project.projectId, review.plans);
    if (plans.length !== review.count) throw new Error(`Approved plan identity collision: ${project.projectId}`);
    return { ...project, count: plans.length, plans,
      missingNote: "Released layout references; confirm the current drawing and residence availability before relying on a plan." };
  });
}

'''
if 'function approvedRevenueFloorplanProjects(' not in s:
 anchor='async function main() {'
 if s.count(anchor)!=1:raise ValueError('Unexpected generator main boundary')
 s=s.replace(anchor,helper+anchor,1)
old='    currentPlans.projects = currentPlans.projects.map((p) => ({ ...p, projectType: modelBySlug.get(p.projectId)?.projectType ?? p.projectType }));'
new=old+'\n    currentPlans.projects = approvedRevenueFloorplanProjects(currentPlans.projects);'
if new not in s:
 if s.count(old)!=1:raise ValueError('Unexpected buyer-content floor-plan boundary')
 s=s.replace(old,new,1)
old='  let publicFloorplans = stripInternalFloorplanPaths(floorplans);'
new=old+'\n  publicFloorplans.projects = approvedRevenueFloorplanProjects(publicFloorplans.projects);'
if new not in s:
 if s.count(old)!=1:raise ValueError('Unexpected full-generation floor-plan boundary')
 s=s.replace(old,new,1)
p.write_text(s)
print('Source consistency finalized; run normal generators. Approved plan assets and 3D code untouched.')
