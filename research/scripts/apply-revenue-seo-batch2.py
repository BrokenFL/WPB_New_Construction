#!/usr/bin/env python3
"""One-time, source-only Batch 2 migration; never run by production builds.
Evidence and scoped review date: docs/REVENUE_WEIGHTED_SEO_BATCH2.md.
The durable marker prevents replaying dated facts on later CI runs.
"""
from pathlib import Path
import csv, io, json
ROOT=Path(__file__).resolve().parents[2]
MARKER=ROOT/'config/revenue-seo-batch2-applied.json'
if MARKER.exists():
    if json.loads(MARKER.read_text()).get('migration')!='revenue-seo-batch2-2026-09-23':
        raise SystemExit('Unexpected migration marker; reconcile rather than overwrite.')
    print('Batch 2 source migration already applied; dated facts are not replayed.')
    raise SystemExit(0)
def read(name):return json.loads((ROOT/name).read_text())
def save(name,value):(ROOT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def replace(name,old,new):
    p=ROOT/name;s=p.read_text()
    if s.count(old)!=1:raise ValueError(f'Expected exactly one source boundary: {name}: {old[:80]}')
    p.write_text(s.replace(old,new,1))
DATE='2026-09-23'
ids={'shorecrest','south-flagler-house'}
DATA={
 'shorecrest':{
  'address':'1901 N Flagler Drive, West Palm Beach, FL 33407',
  'gallery':'616 Hibiscus Street, West Palm Beach, FL 33401',
  'count':'98 in earlier sources; 100 on Related Ross',
  'floors':'27–28 reported; confirm current plans',
  'price':'Request current pricing',
  'delivery':'Request current delivery guidance',
  'title':'Shorecrest West Palm Beach | Condos & Floor Plans',
  'description':'Explore Shorecrest West Palm Beach condos, released floor plans, rooftop amenities and North Flagler comparisons. Request current pricing before a sales-gallery visit.',
  'overview':'Shorecrest is a Related Ross waterfront condominium on North Flagler, with two- and three-bedroom residences, private terraces and a rooftop amenity program. Roger Ferris + Partners designed the architecture and Rottet Studio the interiors. Start with the released layouts, then compare the specific outlook, terrace and service terms with Olara and Ritz-Carlton.',
  'take':'Shorecrest is worth comparing when the priorities are a North Flagler waterfront setting, two- or three-bedroom layouts and a rooftop wellness program rather than a hotel brand. Put its released plans beside Olara and Ritz-Carlton; living-room width, terrace use and included services are more useful distinctions than another luxury adjective.',
  'amenities':'The official amenity program includes a rooftop pool, fitness, yoga and Pilates spaces, spa facilities, a golf simulator, private dining and work spaces. Related Life and concierge services are described separately; confirm which services are included and which are charged individually.',
  'residences':'The developer presents two- and three-bedroom residences with private terraces and interiors by Rottet Studio. The four approved layouts in this library are research references, not a list of currently available homes. Check interior area, outdoor area and exposure on the current drawing for the residence being considered.',
  'location':'The current official site identifies the residences at 1901 N Flagler Drive. The separate sales gallery is at 616 Hibiscus Street. Compare the waterfront building location—not the gallery—with Northwood, downtown and the bridges to Palm Beach.',
  'sources':['https://www.shorecrestwpb.com/inquire','https://www.shorecrestwpb.com/residences','https://www.shorecrestwpb.com/amenities','https://www.relatedross.com/our-company/properties/shorecrest'],
  'notes':['Sales path, address, amenities and commercial guidance checked September 23, 2026 against official project and Related Ross pages; this is not a re-verification of every building policy.', 'The current official site lists 1901 N Flagler Drive; 616 Hibiscus Street is the sales gallery. Earlier 1865 N Flagler references are retained as historical context, not the current public address.', 'Related Ross lists 100 residences; earlier marketing/financing references report 98. Current offering count and conflicting 27–28-story references require confirmation. No new numeric schema approval is made.', 'No current numeric starting price or occupancy date was verified on the checked official pages. Request current written pricing and delivery guidance.', 'The former official /floorplans URL returned 404 during this review. Existing approved local layout references remain available; no new plan is approved or altered.', 'HOA budget, deposits, parking allocation, pet/rental restrictions and optional service charges require the current offering documents.'],
 },
 'south-flagler-house':{
  'address':'1355 S Flagler Drive, West Palm Beach, FL 33401',
  'gallery':'615 S Rosemary Avenue, West Palm Beach, FL 33401; by appointment',
  'count':'105 on project site; 108 on Related Ross',
  'floors':'28',
  'price':'From $7.98M advertised; request current pricing',
  'delivery':'Request current delivery guidance',
  'title':'South Flagler House West Palm Beach | Prices & Floor Plans',
  'description':'Research South Flagler House prices, released floor plans, loggias and private-club amenities. Compare the waterfront residences before a sales-gallery appointment.',
  'overview':'South Flagler House pairs RAMSA architecture with Pembrooke & Ives interiors in two waterfront towers facing Palm Beach. Its residence tiers and loggias make the individual floor plan central to the decision. The official site advertises Signature Residences from $7.98M; that is published tier guidance checked September 23, 2026, not confirmation that a particular home is available.',
  'take':'Begin with the tower, the actual living-room proportions and how the loggia works with the interior. South Flagler House is a large-residence, private-club proposition; compare it with completed South Flagler alternatives as well as new developments. An impressive amenity list does not replace reviewing service charges, guest-suite eligibility and the current occupancy schedule.',
  'amenities':'The official program includes lakefront and lap pools, wellness and fitness spaces, pickleball, a golf simulator, private dining, a residents-only indoor/outdoor restaurant and business and social rooms. Guest suites are reserved for residence owners. Confirm operating arrangements, included services and any additional charges.',
  'residences':'The official residence tiers include two- to five-bedroom homes and penthouses with expansive loggias. The separately described one-bedroom guest suites are available only to residence owners; they are not an ordinary entry-level condominium offering. The eight approved layouts in this library are research references, not current inventory.',
  'location':'The waterfront residences are at 1355 S Flagler Drive on the West Palm Beach side of the Intracoastal. Private sales-gallery tours are arranged separately at 615 S Rosemary Avenue. Evaluate the building setting, bridge route and specific residence outlook rather than using the gallery location as a proxy.',
  'sources':['https://www.southflaglerhouse.com/contact','https://www.southflaglerhouse.com/residences','https://www.southflaglerhouse.com/amenities','https://www.relatedross.com/our-company/properties/south-flagler-house','https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach'],
  'notes':['Sales path, advertised pricing tiers, address and amenities checked September 23, 2026 against official project, developer and architect pages; unchanged building policies are not newly verified.', 'The project site currently says 105 residences and Related Ross says 108. Earlier municipal and architect material reports 109. Preserve the disagreement and omit an unapproved numeric count from structured data.', 'The official residence page advertises Signature Residences from $7.98M and separate penthouse tiers. Published tier prices are not a live inventory feed, a guaranteed minimum or a quotation for a specific residence.', 'RAMSA reported topping out on November 25, 2025. That historic milestone does not confirm occupancy or closing. Older 2027/first-quarter estimates are not retained as current delivery commitments.', 'The residence address is 1355 S Flagler Drive; the appointment-only sales gallery is 615 S Rosemary Avenue. Historical 1315/1333 address references remain contextual.', 'Guest suites are restricted to residence owners. The current official amenity page includes a residents-only restaurant; a private-marina entitlement was not verified and is not promised.', 'Current HOA budget, deposits, parking, lease/pet restrictions, service charges and final residence drawings require written confirmation.'],
 }
}
canonical=read('research/source-material-review/wpb-projects-canonical-v3-planning-update.json')
for p in canonical['projects']:
    if p['project_id'] not in ids:continue
    d=DATA[p['project_id']]
    p.update(public_address=d['address'],sales_gallery_address=d['gallery'],public_residence_count=d['count'],floor_count_display=d['floors'],price_display=d['price'],delivery_display=d['delivery'],status_badge='Under Construction',amenity_summary=d['amenities'],service_summary='Concierge and resident services are marketed; verify included services and separate charges in the current offering.',maintenance_display='Request current association budget',import_recommendation='Use the September 23, 2026 scoped commercial review; preserve historical disagreements and existing schema-approval boundaries.')
    p['key_conflicts']=list(dict.fromkeys(p['key_conflicts']+d['notes'][1:4]))
    p['source_urls']=list(dict.fromkeys(d['sources']+p['source_urls']))
    p['tradeoffs']=['Current pricing, availability, schedule and recurring costs require the current offering documents.','Published residence counts differ; check the current declaration and specific plan.']
    if p['project_id']=='south-flagler-house':
        p['bedroom_range_display']='2–5-bedroom residences; guest suites restricted to owners'
        p['size_range_display']='Varies by residence tier; guest suites are separate owner-only offerings'
    p['scoped_commercial_review']={'checkedAt':DATE,'fields':['address','salesGallery','pricingGuidance','deliveryQualification','residenceCountConflict','amenities'],'notes':d['notes']}
save('research/source-material-review/wpb-projects-canonical-v3-planning-update.json',canonical)
overlays=read('content/project-page-overlays.json')
for p in overlays['projects']:
    if p['publicSlug'] not in ids:continue
    d=DATA[p['publicSlug']];p['summary']=d['overview'];p['deliveryYear']=0
    p['approvedFallback'].update(address=d['address'],residences=d['count'],price=d['price'],delivery=d['delivery'],status='Under Construction')
save('content/project-page-overlays.json',overlays)
copies=read('content/project-copy-package.json')
for p in copies:
    id=p['repoProjectId']
    if id not in ids:continue
    d=DATA[id]
    p.update(seoTitle=d['title'],metaDescription=d['description'],overview=d['overview'],localTake=d['take'],brookeTake=d['take'],heroSubheadline=d['overview'],introDek=d['take'],amenities=d['amenities'],amenityNarrative=d['amenities'],residences=d['residences'],residenceNarrative=d['residences'],location=d['location'],locationNarrative=d['location'],sourceNotes=d['notes'],sourceUrls=d['sources'],lastCopyResearchDate=DATE,copyConfidence='medium',confidenceNote='Official sales information supports buyer research; counts and mutable commercial terms remain explicitly qualified.',badge='Under Construction')
    values={'Address':d['address'],'Sales Gallery':d['gallery'],'Status':'Under Construction','Residences':d['count'],'Floors':d['floors'],'Price Range':d['price'],'Delivery':d['delivery']}
    if id=='south-flagler-house':values.update({'Bedrooms':'2–5; guest suites restricted to owners','Size Range':'Varies by tier; compare the specific residence plan'})
    for f in p['quickFacts']:
        if f['label'] in values:f['value']=values[f['label']]
    if not any(f['label']=='Sales Gallery' for f in p['quickFacts']):p['quickFacts'].insert(1,{'label':'Sales Gallery','value':d['gallery']})
    p['signatureFeatures']=(['Two- and three-bedroom layouts','Private terraces','Rooftop pool and wellness spaces','Related Ross; Roger Ferris + Partners; Rottet Studio'] if id=='shorecrest' else ['Two waterfront towers by RAMSA','Pembrooke & Ives interiors','Expansive loggias','Residents-only restaurant and private-club amenities'])
    p['tradeoffs']=['Compare the specific floor, exposure, interior area and usable terrace or loggia.','Request current written availability, delivery guidance, association budget and included-service terms.','Published residence counts differ; the current offering documents should settle the count.']
    p['buyerComparisonNotes']=d['take']
    p['showcase']['intro']=d['overview']
    for c in p['showcase'].get('residenceCollections',[]):
        if id=='shorecrest' and '$' in c.get('price',''):c['price']='Request current pricing'
    # Approved imagery, H1, original floor-plan assets and team design are unchanged.
save('content/project-copy-package.json',copies)
p=ROOT/'content/wpb_new_construction_building_database_cleaned.csv'
rows=list(csv.DictReader(io.StringIO(p.read_text())));fields=list(rows[0])
for row in rows:
    id={'shorecrest-wpb':'shorecrest','south-flagler-house':'south-flagler-house'}.get(row['project_id'])
    if not id:continue
    d=DATA[id]
    row.update(public_address=d['address'],residence_count=d['count'],floor_count=d['floors'],status_badge='Under Construction',construction_status='Under Construction; marketed sales offering',completion_or_delivery=d['delivery'],price_display=d['price'],price_range_min='$7.98M advertised' if id=='south-flagler-house' else '',price_range_max='',maintenance_per_sqft='Request current association budget',deposit_structure='Request the current written deposit schedule; no percentage schedule was verified in this review.',amenity_summary=d['amenities'],service_summary='Verify included concierge and resident services, optional charges and current operating terms.',floorplan_count='8 approved layout references' if id=='south-flagler-house' else '4 approved layout references',floorplan_status='Released reference layouts; confirm the current drawing and residence availability',source_notes_public='Scoped commercial update September 23, 2026: '+ ' '.join(d['notes']),source_urls='; '.join(d['sources']),key_conflicts=row['key_conflicts']+' '+' '.join(d['notes'][1:4]),last_reviewed_at=DATE)
    if id=='south-flagler-house':
        row.update(bedroom_range_display='2–5-bedroom residences; guest suites restricted to owners',size_range_display='Varies by residence tier; compare the specific current plan',dining_summary='The official program includes a residents-only indoor/outdoor restaurant and private dining. Confirm access, operating terms and additional charges.',guest_suite_summary='The official site restricts guest suites to residence owners; confirm purchase/use eligibility and arrangements.',boating_or_marina_summary='No private-marina entitlement was verified in the current official material; request written confirmation of any boating rights or separate arrangements.',best_for='Buyers comparing large-format waterfront residences, loggias, architectural design and a private-club amenity program.',strongest_compare_points='RAMSA and Pembrooke & Ives design; expansive loggias; residence-tier choices; two waterfront towers and resident amenities. View quality is specific to floor and exposure.',tradeoffs='Compare current pricing and ownership costs, construction/occupancy terms, loggia usability and residence-specific views against both marketed and completed alternatives.')
buf=io.StringIO(newline='');w=csv.DictWriter(buf,fieldnames=fields,lineterminator='\n');w.writeheader();w.writerows(rows);p.write_text(buf.getvalue())
p=ROOT/'src/data/projectCardData.ts';lines=p.read_text().splitlines(keepends=True)
for i,line in enumerate(lines):
    for id,d in DATA.items():
        if line.lstrip().startswith('["'+id+'",'):
            name='Shorecrest' if id=='shorecrest' else 'South Flagler House'
            lines[i]='  '+json.dumps([id,[name,'Under Construction','Yes','Timing to confirm',d['take']]],ensure_ascii=False)+',\n'
p.write_text(''.join(lines))
replace('shared/revenue-buyer-research.mjs','const guides={','''const guides={
 'shorecrest':['Before a Shorecrest sales-gallery appointment',[plans('shorecrest','Review Shorecrest’s released floor plans'),['Compare Shorecrest and Olara','/compare/?projects=shorecrest,olara'],['Read the Olara vs Shorecrest buyer comparison','/market-notes/olara-vs-shorecrest-waterfront-buyer-profiles/'],inquiry('shorecrest')]],
 'south-flagler-house':['From a South Flagler House shortlist to a residence',[plans('south-flagler-house','Review South Flagler House floor plans'),['Compare South Flagler waterfront buildings','/corridors/south-flagler/'],['Compare South Flagler House and La Clara','/compare/?projects=south-flagler-house,la-clara'],inquiry('south-flagler-house')]],
 'south-flagler-house-keeps-west-palm-beach-luxury-buyers-line-shopping':['Continue with the current South Flagler House guide',[['South Flagler House prices, plans and sales-gallery guidance','/projects/south-flagler-house/'],plans('south-flagler-house','Browse South Flagler House layout references')]],
 'olara-vs-shorecrest-waterfront-buyer-profiles':['Check the current project details before comparing',[['Current Shorecrest condo guide and released plans','/projects/shorecrest/'],['Current Olara prices and floor plans','/projects/olara/'],['Compare the two projects side by side','/compare/?projects=olara,shorecrest']]],''')
replace('src/lib/corridorGrowthContent.ts',"title:'South Flagler New Condos | Waterfront & Completed Comparisons'","title:'South Flagler New Construction Condos | Plans & Buyer Guide'")
replace('src/lib/corridorGrowthContent.ts',"description:'Compare South Flagler waterfront condos, marketed new developments and completed-building alternatives. Review layouts, services, project stages and buyer checks.'","description:'Compare South Flagler new construction condos, South Flagler House floor plans and completed waterfront alternatives. Build a buyer shortlist before a sales-gallery visit.'")
replace('src/lib/corridorGrowthContent.ts',"detail:'The developer describes expansive loggias, multiple residence types and a private-club-style amenity program. RAMSA reported the project’s topping out in November 2025.'","detail:'The developer describes expansive loggias, residence tiers and private-club amenities. Its appointment-only sales gallery at 615 S Rosemary Avenue was checked September 23, 2026; the residences are on South Flagler. RAMSA reported topping out in November 2025, not an occupancy date.'")
replace('src/lib/corridorGrowthContent.ts',"source:{label:'Architect’s topping-out report · November 2025',href:'https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach'}","source:{label:'Official sales-gallery contact',href:'https://www.southflaglerhouse.com/contact'}")
replace('src/lib/corridorGrowthContent.ts',"resources:[{label:'North Flagler vs South Flagler',href:'/answers/north-flagler-vs-south-flagler-new-condos/'}","resources:[{label:'South Flagler House released floor plans',href:'/floorplans/#floorplans-south-flagler-house'},{label:'Compare South Flagler House with La Clara',href:'/compare/?projects=south-flagler-house,la-clara'},{label:'North Flagler vs South Flagler',href:'/answers/north-flagler-vs-south-flagler-new-condos/'}")
# Same approved layout source as the interactive library. Collapse historical SFH
# north/south harvest aliases into ONE published project, not two inventories.
name='research/scripts/build-site-intelligence.mjs'
replace(name,'const scope = new Set(["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb"]);','const scope = new Set(["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house"]);')
replace(name,'''  return projects.map((project) => {
    if (!scope.has(project.projectId)) return project;
    const review = byId.get(project.projectId);
    const plans = canonicalizePublicPlans(project.projectId, review.plans);''','''  const canonicalProjects = [];
  let foundSouthFlagler = false;
  for (const project of projects) {
    if (["south-flagler-house", "south-flagler-house-north", "south-flagler-house-south"].includes(project.projectId)) {
      if (!foundSouthFlagler) canonicalProjects.push({ ...project, projectId: "south-flagler-house", name: "South Flagler House", projectType: "condo-active-sales" });
      foundSouthFlagler = true;
    } else canonicalProjects.push(project);
  }
  return canonicalProjects.map((project) => {
    if (!scope.has(project.projectId)) return project;
    const review = byId.get(project.projectId);
    const plans = canonicalizePublicPlans(project.projectId, review.plans);''')
plans=read('public/data/floorplans.json');registry=read('config/preserved-floorplan-document-urls.json')
for p in plans['projects']:
    if p['projectId'] in ids|{'south-flagler-house-north','south-flagler-house-south'}:
        for plan in p['plans']:
            url=plan.get('href','')
            if url.startswith('/projects/') and '/docs/floorplans/' in url and url.rsplit('.',1)[-1].lower() in {'pdf','png','jpg','jpeg','webp'}:
                registry.append(url)
save('config/preserved-floorplan-document-urls.json',list(dict.fromkeys(registry)))
replace('vite.config.ts',r'(?:nora-house|olara|ritz-carlton-wpb)\/docs\/floorplans\/[^/]+',r'(?:nora-house|olara|ritz-carlton-wpb|shorecrest|south-flagler-house)\/docs\/floorplans\/(?:shared\/)?[^/]+')
save('config/revenue-seo-batch2-applied.json',{'migration':'revenue-seo-batch2-2026-09-23','base':'1a5c9f90125580037e5b44c6e90ec8f53aeccd63','scope':sorted(ids),'reviewDate':DATE,'note':'One-time scoped source migration. Do not replay dated facts. Normal generation remains required.'})
print('Batch 2 source migration complete. No generated outputs, approval files, source assets or historical article facts were hand-edited.')
