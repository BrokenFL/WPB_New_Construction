#!/usr/bin/env python3
"""Scoped, idempotent source migration for the isolated revenue SEO review.
Never edits generated files, human approvals or deployment configuration.
"""
import csv, io, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
DATE='2026-09-23'
IDS=['nora-house','banyan-tree','olara','ritz-carlton-wpb']
SOURCES={'nora-house':'https://norahouse.com/','banyan-tree':'https://www.banyantreeresidenceswpb.com/','olara':'https://www.olarawestpalmbeach.com/residences/','ritz-carlton-wpb':'https://theresidenceswestpalmbeach.com/residences/'}
PRICE={'nora-house':'From the low $2Ms (developer-published; verify current availability)','banyan-tree':'Request current pricing','olara':'From $1.7M (developer-published; verify current availability)','ritz-carlton-wpb':'Request current pricing'}
DELIVERY={'nora-house':'Request current delivery guidance','banyan-tree':'Request current delivery guidance','olara':'2028','ritz-carlton-wpb':'2028 estimate; confirm current schedule'}
ADDRESS={'nora-house':'NORA District, West Palm Beach, FL 33401; confirm building address','banyan-tree':'400 Hibiscus Street, West Palm Beach, FL 33401','olara':'1919 N Flagler Drive, West Palm Beach, FL 33407','ritz-carlton-wpb':'1745 N Flagler Drive, West Palm Beach, FL 33407'}
GALLERY={'nora-house':'955 N Railroad Avenue, Suite B, West Palm Beach, FL 33401','banyan-tree':'400 Hibiscus Street, West Palm Beach, FL 33401 (by appointment)','olara':'300 Butler Street, West Palm Beach, FL 33407','ritz-carlton-wpb':'340 Royal Poinciana Way, M302, Palm Beach, FL 33480'}
TITLE={'nora-house':'NORA House West Palm Beach | Prices & Floor Plans','banyan-tree':'Banyan Tree Residences West Palm Beach | Buyer Guide','olara':'Olara West Palm Beach | Prices, Floor Plans & Condos','ritz-carlton-wpb':'Ritz-Carlton Residences West Palm Beach | Floor Plans'}
DESCRIPTION={'nora-house':'Explore NORA House condos in West Palm Beach: published starting prices, released floor plans, rooftop amenities and buyer guidance before a sales-gallery visit.','banyan-tree':'Research Banyan Tree Residences West Palm Beach: corner layouts, OMA design, wellness amenities and an appointment-only sales gallery. Request current pricing.','olara':'Compare Olara West Palm Beach floor plans, published starting pricing, marina amenities and North Flagler alternatives before requesting current availability.','ritz-carlton-wpb':'Review Ritz-Carlton Residences West Palm Beach floor plans, branded services, North Flagler location and buyer questions before a private sales appointment.'}
INTRO={'nora-house':'NORA House is a for-sale condominium offering in the NORA District, with released floor plans and a sales gallery at 955 N Railroad Avenue, Suite B. The developer advertises residences from the low $2Ms. Start with the layout and terrace area, then compare the district setting with waterfront alternatives before arranging a gallery visit.','banyan-tree':'Banyan Tree Residences West Palm Beach is a marketed downtown condominium with a sales gallery open by appointment at 400 Hibiscus Street. The developer presents 88 corner residences, OMA architecture and Yabu Pushelberg interiors. Compare the corner layouts, wellness program and city setting, then request the current price sheet and delivery guidance.','olara':'Olara combines a North Flagler waterfront setting with marina access and a broad amenity program. The developer publishes starting pricing of $1.7M and a sales gallery at 300 Butler Street. Review the released floor plans and compare interior area, terrace depth and orientation before requesting residence-specific availability.','ritz-carlton-wpb':'The Ritz-Carlton Residences, West Palm Beach pairs North Flagler living with branded services and Rockwell Group interiors. Released floor plans and private sales appointments give buyers a practical starting point. The residences are marketed at 1745 N Flagler Drive; the sales gallery is separately located at 340 Royal Poinciana Way, M302, on Palm Beach.'}
def read(rel): return json.loads((ROOT/rel).read_text())
def write(rel,data): (ROOT/rel).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def replace(rel,old,new):
 p=ROOT/rel;text=p.read_text()
 if new in text:return
 if text.count(old)!=1:raise ValueError(f'{rel}: expected one exact source match: {old[:80]}')
 p.write_text(text.replace(old,new,1))
copy=read('content/project-copy-package.json')
for p in copy:
 key=p['repoProjectId']
 if key not in IDS:continue
 p.update(seoTitle=TITLE[key],metaDescription=DESCRIPTION[key],overview=INTRO[key],introDek=INTRO[key],lastCopyResearchDate=DATE)
 p['showcase']['intro']=INTRO[key]
 p['sourceUrls']=list(dict.fromkeys([SOURCES[key],*p.get('sourceUrls',[])]))
 values={'Address':ADDRESS[key],'Price Range':PRICE[key],'Delivery':DELIVERY[key]}
 if key in ['nora-house','banyan-tree']:
  values['Status']='Sales Open / Preconstruction';p['badge']='Sales Open'
  p['tags']=[t for t in p['tags'] if t not in ['pipeline','sales-launched']]
  if 'active-sales' not in p['tags']:p['tags'].append('active-sales')
  for tag in p['showcase'].get('heroTags',[]):
   if tag['label']=='Status':tag['value']='Sales Open'
   if tag['label']=='Sales':tag['value']='By appointment' if key=='banyan-tree' else 'Active Sales'
 for fact in p.get('quickFacts',[]):
  if fact['label'] in values:fact['value']=values[fact['label']]
 p['quickFacts']=[f for f in p['quickFacts'] if f['label']!='Sales Gallery']+[{'label':'Sales Gallery','value':GALLERY[key]}]
 for index,value in enumerate(p.get('signatureFeatures',[])):
  label=value.split(':',1)[0]
  if label in values:p['signatureFeatures'][index]=f'{label}: {values[label]}'
 for residence in p['showcase'].get('residenceCollections',[]):
  if '$' in residence.get('price',''):residence['price']=PRICE[key].split(' (')[0]
 if key=='nora-house':p['localTake']='NORA House is a choice about the district as much as the residence. Compare rooftop amenities and terrace layouts with the waterfront alternatives, and inspect the walking routes and nearby construction that would shape your daily routine. A sales-gallery appointment can test the current offering; it is not evidence of a delivery date.'
 if key=='banyan-tree':p['localTake']='Banyan Tree offers a downtown alternative to Flagler Drive: corner residences, a wellness-led program and hospitality branding. Compare usable indoor and terrace space, included services and recurring costs with the waterfront buildings. The developer markets 88 residences; earlier municipal material records 86, so offering documents should settle the final program.'
 p['brookeTake']=p['localTake']
 p['confidenceNote']='Sales path and selected public facts checked against the official project website on 2026-09-23. This was a scoped agent research pass, not a blanket verification of all project details.'
write('content/project-copy-package.json',copy)
canonical=read('research/source-material-review/wpb-projects-canonical-v3-planning-update.json')
decisions=read('content/project-identity-decisions.json')
by_canonical={p['canonicalId']:p['publicSlug'] for p in decisions['projects']}
for p in canonical['projects']:
 key=by_canonical.get(p['project_id'])
 if key not in IDS:continue
 p.update(price_display=PRICE[key],delivery_display=DELIVERY[key],public_address=ADDRESS[key],human_review_required=True,sales_gallery_address=GALLERY[key])
 p['source_urls']=list(dict.fromkeys([SOURCES[key],*p.get('source_urls',[])]))
 if key in ['nora-house','banyan-tree']:p.update(status_badge='Sales Open / Preconstruction',development_stage='active_sales_preconstruction',site_group='active_sales',page_type='main_building_page')
 if key=='banyan-tree':p['key_conflicts']=['Developer markets 88 residences; earlier municipal material records 86. Offering documents should control.','Older pricing and delivery estimates are not confirmed by the current official homepage.']
 if key=='nora-house':p['key_conflicts']=['955 N Railroad Avenue, Suite B is explicitly a sales gallery, not proof of the residence address. Earlier site references differ; confirm building address.','Older 2029 delivery reporting is historical guidance; request a current construction schedule.']
write('research/source-material-review/wpb-projects-canonical-v3-planning-update.json',canonical)
overlays=read('content/project-page-overlays.json')
for p in overlays['projects']:
 key=p['publicSlug']
 if key not in IDS:continue
 p['summary']=INTRO[key];p['approvedFallback'].update(price=PRICE[key],delivery=DELIVERY[key],address=ADDRESS[key])
 if key in ['nora-house','banyan-tree']:p['approvedFallback']['status']='Sales Open / Preconstruction';p['pageState']='Active Sales / Preconstruction';p['deliveryYear']=0
 if key=='nora-house':p['floorplans']=True
 if key=='olara':p['deliveryYear']=2028
write('content/project-page-overlays.json',overlays)
# Normalize CSV line endings to LF, preserving unrelated row values and columns.
p=ROOT/'content/wpb_new_construction_building_database_cleaned.csv'
rows=list(csv.DictReader(io.StringIO(p.read_text())));fields=list(rows[0])
compare_to_key={p.get('compareDatabaseId'):p['publicSlug'] for p in decisions['projects']}
for row in rows:
 key=compare_to_key.get(row['project_id'])
 if key not in IDS:continue
 row.update(price_display=PRICE[key],price_range_min='',price_range_max='',completion_or_delivery=DELIVERY[key],public_address=ADDRESS[key])
 if key=='olara':row['price_range_min']='$1.7M'
 if key in ['nora-house','banyan-tree']:row.update(development_stage='Pre-Construction / Sales Open',status_badge='Sales Open / Preconstruction',construction_status='Preconstruction; confirm current schedule')
 row['source_urls']=SOURCES[key]
 note=f'2026-09-23 scoped official-site check: sales gallery {GALLERY[key]}. Current pricing/delivery strings supersede older comparison ranges; other policy and physical facts remain subject to their original review. No broker compensation or client-registration eligibility verified.'
 if note not in row['source_notes_public']:row['source_notes_public']+=' | '+note
 row['last_reviewed_at']=DATE;row['human_review_required']='Yes'
 if key=='banyan-tree':row['key_conflicts']='Developer markets 88 residences; earlier municipal material records 86. Historical price ranges and completion estimates are not current guidance.'
 if key=='nora-house':row['floorplan_status']='Released plans; request the current residence-specific packet'
 if key=='olara':
  row['residence_count']='275'
  if 'Older comparison row recorded 257' not in row['source_notes_public']:row['source_notes_public']+=' | Older comparison row recorded 257; retained here as historical conflict, not current inventory.'
buf=io.StringIO(newline='');writer=csv.DictWriter(buf,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(rows);p.write_bytes(buf.getvalue().encode())
replace('research/scripts/generate-project-model.mjs','salesGalleryAddress: "",','salesGalleryAddress: String(canonicalById.get(project.canonicalId)?.sales_gallery_address ?? ""),')
for rel,statement in [('src/main.ts','import { renderRevenueBuyerResearch } from "../shared/revenue-buyer-research.mjs";'),('research/scripts/prerender-static-routes.mjs','import { renderRevenueBuyerResearch } from "../../shared/revenue-buyer-research.mjs";')]:
 p=ROOT/rel;text=p.read_text()
 if statement not in text:p.write_text(statement+'\n'+text)
replace('src/main.ts','return "NORA House matters less as an immediately comparable sales option and more as a signal of where Downtown West Palm Beach is heading. Its value in the buyer map is tied to NORA\'s restaurant, retail, and walkability story, with final offering details still requiring confirmation.";','return "NORA House is a marketed condominium with released plans and an active sales gallery. Compare the district setting, residence layout and current offering before arranging a visit.";')
replace('src/main.ts','      ${renderShowcaseBuyerRead(project, copyPackage)}','      ${renderShowcaseBuyerRead(project, copyPackage)}\n      ${renderRevenueBuyerResearch(project.id)}')
replace('src/main.ts','      ${renderCorridorAuthoritySections(section, projects)}','      ${renderCorridorAuthoritySections(section, projects)}\n      ${renderRevenueBuyerResearch(section.key)}')
replace('src/main.ts','          ${note.sections\n','          ${renderRevenueBuyerResearch(note.slug)}\n          ${note.sections\n')
replace('research/scripts/prerender-static-routes.mjs','      ${renderPipelineWatchlistStaticNote(project)}','      ${renderRevenueBuyerResearch(project.projectId)}\n      ${renderPipelineWatchlistStaticNote(project)}')
replace('research/scripts/prerender-static-routes.mjs','      ${renderCorridorUpdatesForStatic(latestUpdates, corridor)}','      ${renderRevenueBuyerResearch(slug)}\n      ${renderCorridorUpdatesForStatic(latestUpdates, corridor)}')
replace('research/scripts/prerender-static-routes.mjs','<h2>How to use this guidance</h2>','${renderRevenueBuyerResearch(slug)}\n        <h2>How to use this guidance</h2>')
for rel in ['src/main.ts','research/scripts/build-site-intelligence.mjs']:
 replace(rel,'North Flagler Condos | West Palm Beach Buyer Guide','North Flagler New Construction Condos | Compare & Floor Plans')
 replace(rel,'Compare North Flagler new-construction condos by waterfront position, Palm Beach proximity, floor plans, status, and current availability questions.','Compare North Flagler condos including Olara and Ritz-Carlton: released floor plans, waterfront settings, active sales and buyer guidance before a gallery visit.')
replace('src/main.ts','  const projectSchemaFacts = activeProject ? getSchemaSafeProjectFacts(activeProject.id) : undefined;','  const buyerSeo = activeProject && ["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb"].includes(activeProject.id) ? batch1ProjectCopyByProjectId.get(activeProject.id) : undefined;\n  const projectSchemaFacts = activeProject ? getSchemaSafeProjectFacts(activeProject.id) : undefined;')
replace('src/main.ts','    title,\n    description,\n    image: image.startsWith','    title: buyerSeo?.seoTitle || title,\n    description: buyerSeo?.metaDescription || description,\n    image: image.startsWith')
replace('src/main.ts','  updateMetaDescription(route.type, activeProject, activeMarketNote, activeNewsItem, activeAnswer);','  updateMetaDescription(route.type, activeProject, activeMarketNote, activeNewsItem, activeAnswer);\n  if ((activeProject && ["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb"].includes(activeProject.id)) || activeCorridor?.key === "north-flagler") {\n    document.querySelector<HTMLMetaElement>(\'meta[name="description"]\')?.setAttribute("content", routeSeo.description);\n  }')
replace('src/data/projectCardData.ts','Banyan Tree\'s planned downtown WPB residence brings 88 homes, branded hospitality, wellness-driven amenities, and major design credentials to the city\'s growing luxury pipeline.','Banyan Tree Residences is a marketed downtown condominium with corner residences, wellness amenities, OMA design and an appointment-only sales gallery.')
replace('src/lib/corridorGrowthContent.ts','Use these guides as additional development context, not confirmation of a current condominium offering. A mixed-use proposal may include rental, office or retail space; those uses are not for-sale residences.','Banyan Tree is a marketed condominium with an appointment-only sales gallery; use its project guide for current buyer research. Review the Fern Street mixed-use proposal separately: rental, office and retail components are not automatically condos for sale.')
# Extend the established generator with a targeted mode: no asset-warehouse refresh.
replace('research/scripts/build-site-intelligence.mjs','async function main() {\n  if (siteMetaOnly) {',r'''async function main() {
  if (process.argv.includes("--buyer-content-only")) {
    const catalog = JSON.parse(await fs.readFile(reviewPath, "utf8"));
    const siteDataPath = path.join(generatedRoot, "siteData.ts");
    let text = await fs.readFile(siteDataPath, "utf8");
    const currentPlans = JSON.parse(await fs.readFile(path.join(publicDataRoot, "floorplans.json"), "utf8"));
    const modelBySlug = new Map(readPublicProjectModel().projects.map((p) => [p.publicSlug, p]));
    currentPlans.projects = currentPlans.projects.map((p) => ({ ...p, projectType: modelBySlug.get(p.projectId)?.projectType ?? p.projectType }));
    const exports = {
      siteMeta,
      floorplanLibrary: currentPlans.projects,
      projectFacts: sanitizePublicPayload(buildProjectFacts(catalog.projects)),
      prerenderRoutes: buildPrerenderRoutes(),
    };
    for (const [name, value] of Object.entries(exports)) {
      const pattern = new RegExp(`^export const ${name} = [^]*? as const;`, "m");
      if (!pattern.test(text)) throw new Error(`Missing generated export: ${name}`);
      text = text.replace(pattern, () => `export const ${name} = ${JSON.stringify(value, null, 2)} as const;`);
    }
    await fs.writeFile(siteDataPath, text);
    await fs.writeFile(path.join(publicDataRoot, "floorplans.json"), JSON.stringify(currentPlans, null, 2) + String.fromCharCode(10));
    await fs.writeFile(path.join(publicDataRoot, "site-meta.json"), JSON.stringify(siteMeta, null, 2) + String.fromCharCode(10));
    await fs.writeFile(publicProjectCopyPackagePath, JSON.stringify(buildPublicProjectCopyPackage(readProjectCopyPackage()), null, 2) + String.fromCharCode(10));
    console.log("Buyer content regenerated; floor-plan, image and news inventories preserved.");
    return;
  }
  if (siteMetaOnly) {''')
print('Batch 1 source edits applied. Run generators and verification; this script does not publish.')
