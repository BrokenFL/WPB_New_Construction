#!/usr/bin/env python3
"""Apply the reviewed Revenue SEO Batch 4 source edits for three projects.

This script changes source files only. Run the established generators afterward.
It intentionally keeps private research, uncertain claims, and source migrations
out of the public site.
"""
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATE = "2026-09-23"


def read(path):
    return json.loads((ROOT / path).read_text())


def write(path, value):
    (ROOT / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def one(items, key, value):
    matches = [item for item in items if item.get(key) == value]
    if len(matches) != 1:
        raise ValueError(f"Expected one {key}={value}; found {len(matches)}")
    return matches[0]


def fact(project, label, value):
    one(project["quickFacts"], "label", label)["value"] = value


def set_once(path, old, new):
    file = ROOT / path
    source = file.read_text()
    if old not in source and new in source:
        return
    count = source.count(old)
    if count != 1:
        raise ValueError(f"{path}: expected one anchor, found {count}: {old[:80]}")
    file.write_text(source.replace(old, new))


def edit_copy():
    path = "content/project-copy-package.json"
    data = read(path)
    maison = one(data, "slug", "maison-dor")
    maison.update({
        "metaDescription": "Maison d Or is a 39-residence South Flagler condominium with published pricing from $5.7M, released plans and a separate Dixie Highway sales gallery.",
        "badge": "Pre-Construction Sales",
        "localTake": "Maison d Or pairs a 39-residence South Flagler scale with released layouts and published starting guidance from $5.7M. The late-2028 target is reported, not guaranteed; compare the actual plan, view, carrying costs and current inventory with us before relying on a date or price.",
        "brookeTake": "Maison d Or pairs a 39-residence South Flagler scale with released layouts and published starting guidance from $5.7M. The late-2028 target is reported, not guaranteed; compare the actual plan, view, carrying costs and current inventory with us before relying on a date or price.",
        "confidenceNote": "Sales gallery and released plans are verified. The building street number remains unresolved between 3705 and 3773; public building address omits the number. The late-2028 target and published pricing are dated guidance.",
        "copyConfidence": "medium-high",
        "lastCopyResearchDate": DATE,
    })
    fact(maison, "Status", "Pre-Construction Sales")
    fact(maison, "Sales", "Maison d'Or Realty Sales, LLC")
    fact(maison, "Price Range", "From $5.7M (published guidance, Jan–Sep 2026); request current pricing")
    fact(maison, "Delivery", "Late 2028 (targeted; reported)")
    if not any(q["label"] == "Sales Gallery" for q in maison["quickFacts"]):
        address_index = next(i for i, q in enumerate(maison["quickFacts"]) if q["label"] == "Address")
        maison["quickFacts"].insert(address_index + 1, {
            "label": "Sales Gallery",
            "value": "3014 S Dixie Highway, West Palm Beach, FL 33405",
        })
    maison["tradeoffs"] = [
        "The building street number remains unresolved; confirm the legal address in offering documents.",
        "Late 2028 is a reported target, not a guaranteed completion date.",
        "Published starting pricing is dated guidance; request current residence-specific terms.",
    ]
    maison["signatureFeatures"] = [
        "Price Range: From $5.7M (published guidance, Jan–Sep 2026); request current pricing"
        if value.startswith("Price Range:") else
        "Delivery: Late 2028 (targeted; reported)" if value.startswith("Delivery:") else value
        for value in maison["signatureFeatures"]
    ]
    maison["sourceNotes"] = [
        "The official sales-gallery materials list 3014 S Dixie Highway, West Palm Beach, FL 33405; this is not the building address.",
        "Released official plans support the buyer layout comparison.",
        "January–September 2026 published materials advertised pricing from $5.7M. Late 2028 is a reported target. Building street numbers conflict in reviewed sources.",
    ]
    if "showcase" in maison:
        maison["showcase"]["heroTags"][0]["value"] = "Pre-Construction Sales"

    alba = one(data, "slug", "alba-palm-beach")
    alba.update({
        "metaDescription": "Alba Palm Beach is a 55-residence North Flagler condominium with developer sales active. The developer advertised immediate occupancy in September 2026; confirm specific availability.",
        "badge": "Developer Sales Active",
        "localTake": "Alba offers a smaller North Flagler waterfront format with seven released plan references. The developer advertised immediate occupancy in September 2026, but buyers should confirm the exact residence, closing readiness and dock rights. One recorded Unit 1003 sale does not establish availability across the building.",
        "brookeTake": "Alba offers a smaller North Flagler waterfront format with seven released plan references. The developer advertised immediate occupancy in September 2026, but buyers should confirm the exact residence, closing readiness and dock rights. One recorded Unit 1003 sale does not establish availability across the building.",
        "confidenceNote": "The developer advertised immediate occupancy on 2026-09-23; no occupancy certificate was inspected. A separately recorded Unit 1003 sale on 2026-06-01 does not establish other residences' availability. Developer sales remain active.",
        "lastCopyResearchDate": DATE,
    })
    fact(alba, "Status", "Completed building / developer sales active")
    fact(alba, "Price Range", "From just under $3M (developer guidance, Sep 2026); request current pricing")
    fact(alba, "Delivery", "Developer offering immediate occupancy (Sep 2026); confirm specific residence")
    if not any(q["label"] == "Sales Gallery" for q in alba["quickFacts"]):
        address_index = next(i for i, q in enumerate(alba["quickFacts"]) if q["label"] == "Address")
        alba["quickFacts"].insert(address_index + 1, {
            "label": "Sales Gallery",
            "value": "250 North Olive Avenue, West Palm Beach, FL 33401",
        })
    alba["tradeoffs"] = [
        "Confirm current developer inventory and residence-specific closing readiness.",
        "Ask how dock access applies to the selected residence.",
        "The developer's immediate-occupancy statement is dated guidance; no occupancy certificate was independently reviewed.",
        "Formal pet policy is not fully verified.",
    ]
    alba["signatureFeatures"] = [
        "Price Range: From just under $3M (developer guidance, Sep 2026)"
        if value.startswith("Price Range:") else
        "Delivery: Developer offering immediate occupancy (Sep 2026); confirm specific residence"
        if value.startswith("Delivery:") else value
        for value in alba["signatureFeatures"]
    ]
    alba["sourceNotes"] = [
        "The developer homepage advertised immediate occupancy and starting guidance just under $3M on 2026-09-23; no CO/TCO was inspected.",
        "Compass property history shows Unit 1003 sold on 2026-06-01 for $2,450,000, Beaches MLS R11070220. This individual sale does not establish broader closing or availability status.",
        "ONE Sotheby's International Realty was announced as the exclusive in-house sales and marketing brokerage. The sales gallery is at 250 North Olive Avenue, separate from the building.",
    ]
    if "showcase" in alba:
        alba["showcase"]["heroTags"][0]["value"] = "Developer Sales Active"
        for collection in alba["showcase"].get("residenceCollections", []):
            if collection.get("price") == "From $2.5M":
                collection["price"] = "Developer guidance: just under $3M (Sep 2026)"

    olin = one(data, "slug", "olin-palm-beach")
    olin.update({
        "overview": "OLIN Palm Beach is a low-rise ocean-to-lagoon condominium by OKO Group and Cain International. OKO's portfolio listed the project in pre-construction sales on 2026-09-23. Residence pricing, delivery timing, floor plans, gallery arrangements and tour availability were not publicly verified in the reviewed sources; request current project information with The Scott Gordon Group.",
        "metaDescription": "OLIN Palm Beach is a 32-residence ocean-to-lagoon condominium by OKO Group and Cain International. OKO listed pre-construction sales in September 2026.",
        "badge": "Pre-Construction Sales",
        "amenities": "The public identity centers on a landscaped low-rise campus with Atlantic Ocean and Lake Worth Lagoon frontage. The complete amenity and service program was not publicly verified in the reviewed sources.",
        "amenityNarrative": "The public identity centers on a landscaped low-rise campus with Atlantic Ocean and Lake Worth Lagoon frontage. The complete amenity and service program was not publicly verified in the reviewed sources.",
        "confidenceNote": "OKO Group listed pre-construction sales on 2026-09-23. The current developer inquiry form, gallery, tour availability, residence pricing, delivery and released plans were not publicly verified in the reviewed sources. The older 41-versus-current-32 count conflict remains schema-blocked.",
        "lastCopyResearchDate": DATE,
    })
    fact(olin, "Address", "2720 & 2730 South Ocean Boulevard, Palm Beach, FL")
    fact(olin, "Status", "Pre-Construction Sales (OKO Group, Sep 2026)")
    fact(olin, "Pricing", "Request current pricing")
    olin["location"] = olin["location"].replace("Palm Beach's South End", "Palm Beach's South End")
    olin["tradeoffs"] = [
        "Delivery timing and residence-specific pricing were not publicly verified in the reviewed sources.",
        "Floor plans, gallery arrangements, tours, deposits, parking, policies and final amenities require confirmation.",
        "OKO currently lists 32 residences; older reporting referenced 41, so the conflict remains open for schema review.",
    ]
    olin["sourceNotes"] = [
        "OKO Group portfolio listed OLIN as Pre-Construction Sales on 2026-09-23; its current project count is 32 residences.",
        "The official developer teaser and reviewed coverage did not reconfirm a current inquiry form, released floor plans, gallery or tour availability.",
        "Inquiry-form budget bands reported in July 2026 are research-only, not residence pricing.",
    ]
    if "showcase" in olin:
        olin["showcase"]["heroTags"][0]["value"] = "Pre-Construction Sales"
        olin["showcase"]["heroTags"][2]["value"] = "Pre-Construction"
    write(path, data)


def edit_canonical():
    path = "research/source-material-review/wpb-projects-canonical-v3-planning-update.json"
    data = read(path)
    maison = one(data["projects"], "project_id", "maison-dor")
    maison.update({
        "status_badge": "Pre-Construction Sales",
        "development_stage": "pre_construction_sales",
        "delivery_display": "Late 2028 (targeted; reported)",
        "price_display": "From $5.7M (published guidance, Jan–Sep 2026); request current pricing",
        "sales_gallery_address": "3014 S Dixie Highway, West Palm Beach, FL 33405",
        "sales_team": ["Maison d'Or Realty Sales, LLC"],
        "confidence_level": "medium-high",
        "import_recommendation": "Active pre-construction sales; retain human review for unresolved building street number.",
    })
    maison["key_conflicts"] = [
        "Building street number 3705 versus 3773 remains unresolved; public building address intentionally omits the number.",
        "Late 2028 is a reported target, not a confirmed delivery date.",
    ]
    maison["source_urls"] = list(dict.fromkeys(maison["source_urls"] + ["https://www.livemaisondor.com/"]))

    alba = one(data["projects"], "project_id", "alba-palm-beach")
    alba.update({
        "site_group": "active_sales",
        "fact_revision_date": DATE,
        "development_stage": "completed",
        "status_badge": "Completed / Developer Sales Active",
        "delivery_display": "Developer offering immediate occupancy (Sep 2026); confirm specific residence",
        "price_display": "From just under $3M (developer guidance, Sep 2026)",
        "sales_gallery_address": "250 North Olive Avenue, West Palm Beach, FL 33401",
        "sales_team": ["ONE Sotheby's International Realty"],
    })
    alba["key_conflicts"] = [
        "The developer advertised immediate occupancy on 2026-09-23; no occupancy certificate was independently reviewed.",
        "Unit 1003 sold on 2026-06-01, but that sale does not establish availability or readiness of other residences.",
    ]
    alba["source_urls"] = list(dict.fromkeys(alba["source_urls"] + [
        "https://www.albapalmbeach.com/",
        "https://www.compass.com/homedetails/4714-N-Flagler-Dr-Unit-1003-West-Palm-Beach-FL-33407/1CCKSL_pid/",
    ]))

    olin = one(data["projects"], "project_id", "olin-palm-beach")
    olin.update({
        "status_badge": "Pre-Construction Sales",
        "development_stage": "pre_construction_sales",
        "price_display": "Request current pricing",
        "public_address": "2720 & 2730 South Ocean Boulevard, Palm Beach, FL",
        "service_summary": "Pre-construction sales listed by OKO Group on 2026-09-23; current inquiry mechanism not publicly verified in the reviewed sources.",
    })
    olin["source_urls"] = list(dict.fromkeys(olin["source_urls"] + ["https://www.okogroup.com/portfolio/olin"]))
    write(path, data)


def edit_overlays_and_decisions():
    path = "content/project-page-overlays.json"
    data = read(path)
    maison = one(data["projects"], "publicSlug", "maison-dor")
    maison["summary"] = "A 39-residence South Flagler condominium in pre-construction sales, with released plans and published pricing guidance from $5.7M. Confirm current terms and the reported late-2028 target."
    maison["floorplans"] = True
    maison["pageState"] = "Active / Pre-Construction Sales"
    maison["approvedFallback"].update(status="Pre-Construction Sales", delivery="Late 2028 (targeted; reported)", price="From $5.7M (published guidance, Jan–Sep 2026); request current pricing")
    alba = one(data["projects"], "publicSlug", "alba-palm-beach")
    alba["summary"] = "A 55-residence North Flagler waterfront condominium with developer sales active. The developer advertised immediate occupancy in September 2026; confirm residence-specific availability."
    alba["pageState"] = "Active / Developer Sales / Completed"
    alba["approvedFallback"].update(status="Completed / Developer Sales Active", delivery="Developer offering immediate occupancy (Sep 2026); confirm specific residence", price="From just under $3M (developer guidance, Sep 2026)")
    olin = one(data["projects"], "publicSlug", "olin-palm-beach")
    olin["summary"] = "A 32-residence ocean-to-lagoon Palm Beach project listed by OKO Group in pre-construction sales in September 2026. Request current pricing and project information."
    olin["pageState"] = "Pre-Construction Sales"
    olin["approvedFallback"].update(status="Pre-Construction Sales", price="Request current pricing", address="2720 & 2730 South Ocean Boulevard, Palm Beach, FL")
    write(path, data)

    path = ROOT / "content/project-identity-decisions.json"
    source = path.read_text()
    for slug in ("maison-dor", "alba-palm-beach", "olin-palm-beach"):
        old = f'"publicSlug": "{slug}",'
        new = f'"publicSlug": "{slug}",\n      "lastVerifiedDate": "{DATE}",'
        if new not in source:
            if source.count(old) != 1:
                raise ValueError(f"Identity decision anchor changed: {slug}")
            source = source.replace(old, new)
    path.write_text(source)


def edit_overrides():
    # The 2026-06-18 manually reviewed Alba 2Q-2026 delivery projection
    # predates the developer's 2026-09-23 immediate-occupancy statement.
    # Remove that projection so the dated canonical source can take precedence.
    path = "content/overrides/project-fact-overrides.json"
    data = read(path)
    old = data["projects"]["alba-palm-beach"].get("deliveryTiming", {})
    if old.get("value") not in ("2Q 2026", None):
        raise ValueError("Alba delivery override changed; reconcile manually")
    data["projects"]["alba-palm-beach"].pop("deliveryTiming", None)
    write(path, data)
    path = "content/overrides/change-log.json"
    log = read(path)
    marker = "revenue-seo-batch4-alba-delivery"
    existing = next((x for x in log["entries"] if x.get("detail", {}).get("reason") == marker), None)
    if existing and existing.get("at") == "2026-09-23T20:00:00.000Z":
        existing["at"] = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    if not existing:
        log["entries"].insert(0, {
            "at": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "action": "project-fact-override-superseded",
            "detail": {
                "projectSlug": "alba-palm-beach",
                "field": "deliveryTiming",
                "reason": marker,
                "priorValue": "2Q 2026",
                "source": "Developer advertised immediate occupancy on 2026-09-23; confirm individual residence.",
                "schemaSafe": False,
            },
        })
    write(path, log)


def edit_csv():
    path = ROOT / "content/wpb_new_construction_building_database_cleaned.csv"
    with path.open(newline="") as file:
        rows = list(csv.DictReader(file))
    headers = list(rows[0])
    maison = one(rows, "project_id", "maison-dor-south-flagler")
    maison.update({
        "public_address": "South Flagler Drive, West Palm Beach, FL",
        "status_badge": "Pre-Construction Sales",
        "development_stage": "pre_construction_sales",
        "construction_status": "Pre-construction sales; construction milestone to confirm",
        "price_display": "From $5.7M (published guidance, Jan–Sep 2026); request current pricing",
        "price_range_max": "",
        "completion_or_delivery": "Late 2028 (targeted; reported)",
        "last_reviewed_at": DATE,
    })
    alba = one(rows, "project_id", "alba-palm-beach")
    alba.update({
        "status_badge": "Completed / Developer Sales Active",
        "development_stage": "completed",
        "construction_status": "Completed building; developer sales active; individual occupancy to confirm",
        "price_display": "From just under $3M (developer guidance, Sep 2026)",
        "price_range_min": "",
        "price_range_max": "",
        "completion_or_delivery": "Developer offering immediate occupancy (Sep 2026); confirm specific residence",
        "sales_team": "ONE Sotheby's International Realty",
        "last_reviewed_at": DATE,
    })
    olin = one(rows, "project_id", "olin-palm-beach")
    olin.update({
        "public_address": "2720 & 2730 South Ocean Boulevard, Palm Beach, FL",
        "status_badge": "Pre-Construction Sales",
        "development_stage": "pre_construction_sales",
        "construction_status": "Pre-construction sales (OKO Group, Sep 2026); construction timing to confirm",
        "price_display": "Request Current Pricing",
        "price_range_min": "",
        "price_range_max": "",
        "completion_or_delivery": "Timing not released",
        "floorplan_count": "Not publicly verified in reviewed sources",
        "floorplan_status": "Not publicly verified in reviewed sources",
        "bedroom_range_display": "Not publicly verified in reviewed sources",
        "size_range_display": "Estate-scaled and full-floor residences; exact range not publicly verified in reviewed sources",
        "last_reviewed_at": DATE,
    })
    with path.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def edit_code():
    main = "src/main.ts"
    set_once(main,
        'const buyerSeo = activeProject && ["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house", "berkeley", "mandarin-oriental", "mr-c"].includes(activeProject.id)',
        'const buyerSeo = activeProject && ["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house", "berkeley", "mandarin-oriental", "mr-c", "maison-dor", "alba-palm-beach", "olin-palm-beach"].includes(activeProject.id)')
    set_once(main, 'Compare North Flagler condos including Olara and Ritz-Carlton: released floor plans, waterfront settings, active sales and buyer guidance before a gallery visit.',
        'Compare North Flagler condos including Olara, Ritz-Carlton and Alba: released floor plans, waterfront settings, active sales and buyer guidance before a gallery visit.')
    set_once(main, 'stage: "Under construction",\n    locationCopy:\n      "At 4714 N Flagler Drive',
        'stage: "Completed building / developer sales active",\n    locationCopy:\n      "At 4714 N Flagler Drive')
    set_once(main, '{ label: "Delivery", value: "Spring 2026 reported" },',
        '{ label: "Occupancy", value: "Developer offering immediate occupancy (Sep 2026); confirm specific residence" },')
    set_once(main, '{ label: "Pricing", value: "Request current pricing", note: "Lower penthouse reporting starts around $6.95M." },',
        '{ label: "Pricing", value: "From just under $3M (developer guidance, Sep 2026)", note: "Confirm current residence-specific pricing and availability." },')
    set_once(main, '{ label: "Status", value: "Topped-out / nearing delivery", note: "Request the latest construction, closing, incentive, and inventory update." },',
        '{ label: "Status", value: "Developer sales active", note: "The developer advertised immediate occupancy in September 2026; confirm readiness and availability for the selected residence." },')
    set_once("src/data/projectCardData.ts",
        '["alba-palm-beach", ["Alba", "Under Construction", "Yes", "2026",',
        '["alba-palm-beach", ["Alba", "Completed / Developer Sales Active", "Yes", "2026",')
    set_once("src/data/projectCardData.ts",
        '["maison-dor", ["Maison d\'Or", "Approved", "Yes", "2028",',
        '["maison-dor", ["Maison d\'Or", "Pre-Construction Sales", "Yes", "Late 2028 target",')
    cards = ROOT / "src/data/projectCardData.ts"
    source = cards.read_text()
    if '["olin-palm-beach",' not in source:
        anchor = '  ["maison-dor",'
        if source.count(anchor) != 1:
            raise ValueError("OLIN card anchor changed")
        source = source.replace(anchor,
            '  ["olin-palm-beach", ["OLIN Palm Beach", "Pre-Construction Sales", "Yes", "Timing to confirm", "32-residence ocean-to-lagoon Palm Beach project by OKO Group and Cain International. Request current pricing and project information."]],\n' + anchor)
        cards.write_text(source)
    else:
        cards.write_text(source.replace('["olin-palm-beach", ["OLIN Palm Beach", "Pre-Construction Sales", "No",',
                                        '["olin-palm-beach", ["OLIN Palm Beach", "Pre-Construction Sales", "Yes",'))

    guides = ROOT / "shared/revenue-buyer-research.mjs"
    source = guides.read_text()
    anchor = " 'mr-c-shows-downtown-branded-condos-still-move':"
    if source.count(anchor) != 1:
        raise ValueError("Buyer guide anchor changed")
    entries = """ 'maison-dor':['From a Maison d\u2019Or layout to a South Flagler shortlist',[plans('maison-dor','Review released Maison d\u2019Or floor plans'),['Compare South Flagler buildings','/corridors/south-flagler/'],['Compare Maison d\u2019Or and South Flagler House','/compare/?projects=maison-dor,south-flagler-house'],['Request Maison d\u2019Or project information','/inquire/?project=maison-dor&interest=availability']]],
 'alba-palm-beach':['Check a specific Alba residence',[plans('alba-palm-beach','Review released Alba floor plans'),['Compare North Flagler settings','/corridors/north-flagler/'],['Compare Alba and Olara','/compare/?projects=alba-palm-beach,olara'],['Request Alba residence availability','/inquire/?project=alba-palm-beach&interest=availability']]],
 'olin-palm-beach':['Research OLIN before comparing',[['Compare OLIN and 3031 S. Ocean','/compare/?projects=olin-palm-beach,3031-s-ocean-palm-beach'],['Explore Palm Beach projects','/corridors/palm-beach/'],['Request OLIN project information','/inquire/?project=olin-palm-beach&interest=availability']], 'OKO Group listed pre-construction sales in September 2026. Current pricing, released plans, gallery arrangements and delivery were not publicly verified in the reviewed sources; ask us for current project information.'],
"""
    if " 'olin-palm-beach':['Research OLIN before comparing'" not in source:
        source = source.replace(anchor, entries + anchor)
    old = "const intro='Use the published plans to narrow the choices. Ask us to confirm current residence availability and arrange an introduction before your visit.';"
    new = "const intro=entry[2]||'Use the published plans to narrow the choices. Ask us to confirm current residence availability and arrange an introduction before your visit.';"
    if old not in source and new not in source:
        raise ValueError("Buyer guide introduction changed")
    source = source.replace(old, new)
    guides.write_text(source)


def edit_legacy_project_guide():
    """Keep the existing Maison runtime guide aligned with authored SEO copy."""
    path = "public/data/project-seo-batch4.json"
    set_once(path,
             '"title": "Maison d’Or West Palm Beach | South Flagler Buyer Guide"',
             '"title": "Maison d Or West Palm Beach | South Flagler Condo Watch"')
    set_once(path,
             '"description": "Buyer guide to Maison d’Or West Palm Beach: 39 South Flagler waterfront residences, released layouts, amenities, buyer fit, and current availability checks."',
             '"description": "Maison d Or is a 39-residence South Flagler condominium with published pricing from $5.7M, released plans and a separate Dixie Highway sales gallery."')
    set_once(path,
             '"marketing": "The official project site is actively marketing a limited collection of 39 residences and currently advertises starting pricing from $5.7 million."',
             '"marketing": "The official project site marketed 39 residences with published starting guidance from $5.7 million when reviewed in September 2026; request current residence-specific terms."')
    set_once(path,
             '"packetHref": "/inquire/?project=maison-dor&interest=Pricing%20%2B%20floor-plan%20packet",\n    "reviewedOn": "2026-09-08"',
             '"packetHref": "/inquire/?project=maison-dor&interest=Pricing%20%2B%20floor-plan%20packet",\n    "reviewedOn": "2026-09-23"')


def main():
    edit_copy()
    edit_canonical()
    edit_overlays_and_decisions()
    edit_overrides()
    edit_csv()
    edit_code()
    edit_legacy_project_guide()
    print("Revenue SEO Batch 4 source edits applied; run established generators.")


if __name__ == "__main__":
    main()
