#!/usr/bin/env python3
"""Revenue SEO Batch 3 migration: The Berkeley, Mandarin Oriental Residences WPB, Mr. C Residences WPB.

Follows the Batch 1/2 established pattern:
- content/project-copy-package.json is the source of truth for editorial copy + metadata.
- research/source-material-review/wpb-projects-canonical-v3-planning-update.json is canonical facts.
- content/project-page-overlays.json is presentation/fallback/card values.
- content/wpb_new_construction_building_database_cleaned.csv is the Compare database.
- shared/revenue-buyer-research.mjs carries buyer-pathway guides.
- src/main.ts carries the copy-hydration allowlist and corridor detail strings.
- src/data/projectCardData.ts carries card display values.

Verified 2026-09-23 (private record: ~/workspace/seo-phase3/batch3-verification.md).
Rules: no invented pricing/availability; unresolved timing is qualified or omitted,
especially in metadata; developer contact details are attributed references only;
primary CTAs stay with The Scott Gordon Group via /inquire/?project=<id>.
"""
import csv
import json
import re
import sys
from pathlib import Path

WS = Path(__file__).resolve().parents[2]
VERIFY_DATE = "2026-09-23"

COPY_PKG = WS / "content/project-copy-package.json"
CANONICAL = WS / "research/source-material-review/wpb-projects-canonical-v3-planning-update.json"
OVERLAYS = WS / "content/project-page-overlays.json"
CSV_PATH = WS / "content/wpb_new_construction_building_database_cleaned.csv"
CARD_DATA = WS / "src/data/projectCardData.ts"
GUIDES = WS / "shared/revenue-buyer-research.mjs"
MAIN_TS = WS / "src/main.ts"

CHANGED = []


def note(msg):
    CHANGED.append(msg)
    print(" -", msg)


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path, data):
    # Preserve the repo's 1-space indent style.
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- copy package
BERKELEY_COPY = {
    "seoTitle": "The Berkeley Palm Beach | Clear Lake Condos & Floor Plans",
    "metaDescription": "The Berkeley Palm Beach: 193 Clear Lake / downtown-adjacent condos with large terraces and family amenities. Compare layouts; request current pricing.",
    "heroSubheadline": "The Berkeley Palm Beach offers new-construction luxury on the west edge of downtown: 193 two- to five-bedroom residences with large terraces. Review released layouts, then request current pricing before a sales-gallery visit.",
    "introDek": "The Berkeley Palm Beach offers new-construction luxury on the west edge of downtown: 193 two- to five-bedroom residences with large terraces. Review released layouts, then request current pricing before a sales-gallery visit.",
    "overview": "The Berkeley Palm Beach is an under-construction luxury condominium on the Clear Lake edge of downtown West Palm Beach, with 193 two- to five-bedroom residences, large terraces and a family-focused amenity program. The sales gallery at 500 S. Australian Ave, Suite 910 is a separate address from the 601\u2013621 Clearwater Park Road residence site. Compare the actual layout, terrace depth and view line, then request current pricing and availability with us before a gallery visit.",
    "location": "The Berkeley\u2019s residences are planned at 601\u2013621 Clearwater Park Road near Clear Lake on the west edge of downtown West Palm Beach \u2014 not Intracoastal waterfront. The sales gallery is separately located at 500 S. Australian Ave, Suite 910; the official site invites buyers to call to book a private appointment. Evaluate the residence setting and downtown access, not the gallery address.",
    "locationNarrative": "The Berkeley\u2019s residences are planned at 601\u2013621 Clearwater Park Road near Clear Lake on the west edge of downtown West Palm Beach \u2014 not Intracoastal waterfront. The sales gallery is separately located at 500 S. Australian Ave, Suite 910; the official site invites buyers to call to book a private appointment. Evaluate the residence setting and downtown access, not the gallery address.",
    "localTake": "The Berkeley\u2019s case is everyday utility: large terraces and layouts, Clear Lake orientation, and access to downtown without a direct Intracoastal address. Compare usable interior area, outdoor space, parking, and the actual view from a specific line with other downtown options \u2014 then request current pricing and availability with us before the gallery visit.",
    "brookeTake": "The Berkeley\u2019s case is everyday utility: large terraces and layouts, Clear Lake orientation, and access to downtown without a direct Intracoastal address. Compare usable interior area, outdoor space, parking, and the actual view from a specific line with other downtown options \u2014 then request current pricing and availability with us before the gallery visit.",
    "sourceUrls": ["https://theberkeleypalmbeach.com/"],
    "lastCopyResearchDate": VERIFY_DATE,
}

MANDARIN_COPY = {
    "metaDescription": "Mandarin Oriental Residences West Palm Beach: 87 branded waterfront residences on North Flagler by Safdie Architects. Request current pricing and delivery guidance.",
    "overview": "Mandarin Oriental Residences West Palm Beach is an 87-residence branded waterfront tower on North Flagler Drive, designed by Safdie Architects with Mandarin Oriental service. The sales lounge is at 205 Worth Avenue, #321 in Palm Beach \u2014 a separate address from the 5400 N. Flagler Drive residence site. Completion estimates have varied across reports; confirm current pricing, availability and delivery guidance with us in writing before planning around a date.",
    "location": "The residences are planned at 5400 N. Flagler Drive, West Palm Beach, FL 33480 on the Intracoastal waterfront, north of downtown. The sales lounge is separately located at 205 Worth Avenue, #321, Palm Beach. Compare the waterfront setting \u2014 not the Worth Avenue lounge \u2014 with Olara, Ritz-Carlton and Shorecrest.",
    "locationNarrative": "The residences are planned at 5400 N. Flagler Drive, West Palm Beach, FL 33480 on the Intracoastal waterfront, north of downtown. The sales lounge is separately located at 205 Worth Avenue, #321, Palm Beach. Compare the waterfront setting \u2014 not the Worth Avenue lounge \u2014 with Olara, Ritz-Carlton and Shorecrest.",
    "localTake": "Mandarin Oriental is the long-game branded waterfront play on North Flagler: a global hospitality name, Safdie design, 87 residences, wraparound terraces and Intracoastal views. The tradeoff is timing \u2014 completion estimates have varied across reports, so confirm current delivery guidance, pricing, deposit structure and service fees with us before treating any date as firm.",
    "brookeTake": "Mandarin Oriental is the long-game branded waterfront play on North Flagler: a global hospitality name, Safdie design, 87 residences, wraparound terraces and Intracoastal views. The tradeoff is timing \u2014 completion estimates have varied across reports, so confirm current delivery guidance, pricing, deposit structure and service fees with us before treating any date as firm.",
    "sourceUrls": [
        "https://mo-residenceswestpalmbeach.com/",
        "https://www.mandarinoriental.com/en/residences/upcoming/west-palm-beach",
    ],
    "lastCopyResearchDate": VERIFY_DATE,
}

MRC_COPY = {
    "seoTitle": "Mr. C Residences West Palm Beach | Downtown Branded Condos & Floor Plans",
    "metaDescription": "Mr. C Residences West Palm Beach: 146 downtown branded condos with Cipriani hospitality and hotel services. Compare plans; request current pricing.",
    "overview": "Mr. C Residences West Palm Beach is a 27-story downtown tower pairing 146 branded residences with a 110-suite hotel, Bellini dining and Cipriani service from Ignazio and Maggio Cipriani. Construction is underway; completion estimates have varied across reports, so confirm current timing, pricing and availability with us in writing.",
    "location": "The tower is at 327 Okeechobee Boulevard in downtown West Palm Beach, with walkable access to CityPlace, Clematis, the Kravis Center and the Flagler waterfront. The official fact sheet lists exclusive sales by Douglas Elliman Development Marketing. Compare the downtown setting and walkability with Flagler waterfront options.",
    "locationNarrative": "The tower is at 327 Okeechobee Boulevard in downtown West Palm Beach, with walkable access to CityPlace, Clematis, the Kravis Center and the Flagler waterfront. The official fact sheet lists exclusive sales by Douglas Elliman Development Marketing. Compare the downtown setting and walkability with Flagler waterfront options.",
    "localTake": "Mr. C trades direct waterfront frontage for a downtown address organized around hospitality: Bellini dining, rooftop social spaces, hotel-caliber service and walkability. The key buyer question is the specific residence \u2014 compare stack views, dues, parking and deposit terms against North Flagler alternatives, and confirm what is actually available now with us rather than relying on dated sales-pace headlines.",
    "brookeTake": "Mr. C trades direct waterfront frontage for a downtown address organized around hospitality: Bellini dining, rooftop social spaces, hotel-caliber service and walkability. The key buyer question is the specific residence \u2014 compare stack views, dues, parking and deposit terms against North Flagler alternatives, and confirm what is actually available now with us rather than relying on dated sales-pace headlines.",
    "lastCopyResearchDate": VERIFY_DATE,
}


def update_copy_package():
    data = load_json(COPY_PKG)
    by_slug = {p["slug"]: p for p in data}

    b = by_slug["the-berkeley-palm-beach"]
    for k, v in BERKELEY_COPY.items():
        b[k] = v
    # Quick facts: add the verified sales gallery; qualify price.
    qfs = b["quickFacts"]
    addr_idx = next(i for i, q in enumerate(qfs) if q["label"] == "Address")
    if not any(q["label"] == "Sales Gallery" for q in qfs):
        qfs.insert(addr_idx + 1, {
            "label": "Sales Gallery",
            "value": "500 S. Australian Ave, Suite 910, West Palm Beach, FL 33401",
        })
    for q in qfs:
        if q["label"] == "Price Range":
            q["value"] = "$2M to over $10M (reported; request current pricing)"
    b["signatureFeatures"] = [
        "Price Range: $2M to over $10M (reported; request current pricing)" if s.startswith("Price Range:") else s
        for s in b["signatureFeatures"]
    ]
    if not any("2026-09-23 verification" in n for n in b.get("sourceNotes", [])):
        b["sourceNotes"] = b.get("sourceNotes", []) + [
        "2026-09-23 verification: official site live at theberkeleypalmbeach.com; sales gallery 500 S. Australian Ave Suite 910, West Palm Beach, FL 33401; 561.220.0000; call to book a private appointment. Delivery not publicly confirmed; pricing reported at launch \u2014 request current figures."
        ]
    note("copy-package: berkeley title/meta/overview/location/quickFacts/gallery/source refresh")

    m = by_slug["mandarin-oriental-residences-west-palm-beach"]
    for k, v in MANDARIN_COPY.items():
        m[k] = v
    mqfs = m["quickFacts"]
    maddr_idx = next(i for i, q in enumerate(mqfs) if q["label"] == "Address")
    mqfs[maddr_idx]["value"] = "5400 N Flagler Drive, West Palm Beach, FL 33480"  # no period: matches canonical/CSV/model
    if not any(q["label"] == "Sales Lounge" for q in mqfs):
        mqfs.insert(maddr_idx + 1, {
            "label": "Sales Lounge",
            "value": "205 Worth Avenue, #321, Palm Beach, FL 33480",
        })
    for q in mqfs:
        if q["label"] == "Price Range":
            q["value"] = "From $3.5M (reported; request current pricing)"
        if q["label"] == "Delivery":
            q["value"] = "To confirm \u2014 completion estimates vary across reports."
    m["tradeoffs"] = [
        "Completion timing is unresolved \u2014 reports vary; confirm current guidance in writing." if "2031" in t else t
        for t in m["tradeoffs"]
    ]
    m["signatureFeatures"] = [
        ("Price Range: From $3.5M (reported; request current pricing)" if s.startswith("Price Range:")
         else "Delivery: To confirm \u2014 estimates vary" if s.startswith("Delivery:") else s)
        for s in m["signatureFeatures"]
    ]
    if not any("2026-09-23 verification" in n for n in m.get("sourceNotes", [])):
        m["sourceNotes"] = m.get("sourceNotes", []) + [
        "2026-09-23 verification: official site live at mo-residenceswestpalmbeach.com; 87 residences, 31-story tower, Safdie Architects; residence address 5400 N. Flagler Drive, West Palm Beach, FL 33480 (ZIP corrected from 33407); sales lounge 205 Worth Avenue, #321, Palm Beach, FL 33480; 561.515.5222; live interest form. Delivery estimates conflict across reports \u2014 omitted from metadata. Pricing not currently verified."
        ]
    note("copy-package: mandarin meta/overview/location/quickFacts/ZIP/timing qualification")

    c = by_slug["mr-c-residences-west-palm-beach"]
    for k, v in MRC_COPY.items():
        c[k] = v
    cqfs = c["quickFacts"]
    for q in cqfs:
        if q["label"] == "Delivery":
            q["value"] = "To confirm \u2014 completion estimates vary across reports."
    c["tradeoffs"] = [
        "Completion timing is unresolved \u2014 reports vary; confirm current guidance in writing." if "2027" in t else t
        for t in c["tradeoffs"]
    ]
    c["signatureFeatures"] = [
        "Delivery: To confirm \u2014 estimates vary" if s.startswith("Delivery:") else s
        for s in c["signatureFeatures"]
    ]
    if not any("2026-09-23 verification" in n for n in c.get("sourceNotes", [])):
        c["sourceNotes"] = c.get("sourceNotes", []) + [
        "2026-09-23 verification: official site live at mrcresidenceswpb.com with interest form; Terra developer page confirms 146 residences, 27-story tower, 110 hotel suites, Arquitectonica / Meyer Davis / Landscape Design Workshop, developer Lakeview Hospitality Investment LLC; official fact sheet lists exclusive sales by Douglas Elliman Development Marketing. Completion estimates conflict (2026 vs 2027) \u2014 omitted from metadata. Pricing, inventory and sell-through not currently verified."
        ]
    note("copy-package: mr-c title/meta/overview/location/timing qualification")

    dump_json(COPY_PKG, data)


# ---------------------------------------------------------------- canonical
def update_canonical():
    data = load_json(CANONICAL)
    projs = data["projects"] if isinstance(data, dict) else data
    by_id = {p.get("projectId") or p.get("id") or p.get("slug"): p for p in projs}

    b = by_id["berkeley-palm-beach"]
    b["price_display"] = "$2M to over $10M (reported; request current pricing)"
    b["delivery_display"] = ""  # not publicly confirmed
    note("canonical: berkeley price qualifier, delivery stays unconfirmed")

    m = by_id["mandarin-oriental-residences-west-palm-beach"]
    m["public_address"] = "5400 N Flagler Drive, West Palm Beach, FL 33480"
    m["delivery_display"] = "Timing to confirm \u2014 reports vary"
    m["price_display"] = "From $3.5M reported; request current pricing"
    note("canonical: mandarin ZIP 33480, delivery qualified, price qualified")

    c = by_id["mr-c-residences-west-palm-beach"]
    c["delivery_display"] = "Timing to confirm \u2014 completion estimates vary (2026 vs 2027 across sources)"
    note("canonical: mr-c delivery conflict stated explicitly")

    dump_json(CANONICAL, data)


# ---------------------------------------------------------------- overlays
def update_overlays():
    data = load_json(OVERLAYS)
    projs = data["projects"] if isinstance(data, dict) else data
    by_slug = {p["publicSlug"]: p for p in projs}

    b = by_slug["berkeley"]
    b["deliveryYear"] = 0  # not publicly confirmed; 0 is the repo's unknown sentinel
    b["floorplans"] = True  # 9 released plans exist on /floorplans/
    b["approvedFallback"]["price"] = "$2M-$10M+ reported"
    note("overlays: berkeley deliveryYear->0, floorplans true, price qualified")

    m = by_slug["mandarin-oriental"]
    m["deliveryYear"] = 0
    m["summary"] = "An 87-residence Mandarin Oriental waterfront tower on North Flagler with Safdie architecture and private terraces. Confirm current pricing and delivery guidance with the sales team."
    m["floorplans"] = False  # no released plans on /floorplans/
    m["approvedFallback"]["delivery"] = "Confirm with sales team"
    m["approvedFallback"]["price"] = "From $3.5M reported"
    m["approvedFallback"]["address"] = "5400 N Flagler Drive, West Palm Beach, FL 33480"
    note("overlays: mandarin deliveryYear->0, summary/address/price/delivery corrected")

    c = by_slug["mr-c"]
    c["deliveryYear"] = 0
    note("overlays: mr-c deliveryYear->0 (fallback already qualified)")

    dump_json(OVERLAYS, data)


# ---------------------------------------------------------------- compare CSV
CSV_UPDATES = {
    "the-berkeley-west-palm-beach": {
        "public_address": "601\u2013621 Clearwater Park Road, West Palm Beach, FL 33401",
        "floor_count": "25",
        "completion_or_delivery": "To confirm \u2014 not publicly confirmed",
        "price_display": "$2M to over $10M reported; request current pricing",
        "price_range_min": "",
        "price_range_max": "",
        "maintenance_per_sqft": "Not publicly confirmed",
        "deposit_structure": "Not publicly confirmed \u2014 request current schedule",
        "last_reviewed_at": VERIFY_DATE,
    },
    "mandarin-oriental-residences-west-palm-beach": {
        "public_address": "5400 N Flagler Drive, West Palm Beach, FL 33480",
        "completion_or_delivery": "To confirm \u2014 reports vary",
        "price_display": "From $3.5M reported; request current pricing",
        "price_range_min": "",
        "price_range_max": "",
        "last_reviewed_at": VERIFY_DATE,
    },
    "mr-c-residences-west-palm-beach": {
        "public_address": "327 Okeechobee Boulevard, West Palm Beach, FL 33401",
        "completion_or_delivery": "To confirm \u2014 reports vary",
        "price_display": "Request current pricing",
        "price_range_min": "",
        "price_range_max": "",
        "maintenance_per_sqft": "Not publicly confirmed",
        "deposit_structure": "Not publicly confirmed \u2014 request current schedule",
        "last_reviewed_at": VERIFY_DATE,
    },
}


def update_csv():
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    fieldnames = rows[0].keys()
    for r in rows:
        upd = CSV_UPDATES.get(r.get("slug", ""))
        if upd:
            for k, v in upd.items():
                r[k] = v
            note(f"csv: {r['slug']} commercial values qualified")
    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


# ---------------------------------------------------------------- card data
def update_card_data():
    s = CARD_DATA.read_text(encoding="utf-8")
    repl = {
        '"berkeley", ["The Berkeley", "Under Construction", "Yes", "2027",':
            '"berkeley", ["The Berkeley", "Under Construction", "Yes", "Timing to confirm",',
        '"mandarin-oriental", ["Mandarin Oriental Residences", "Approved", "Yes", "2031",':
            '"mandarin-oriental", ["Mandarin Oriental Residences", "Approved", "Yes", "Timing to confirm",',
        '"mr-c", ["Mr. C Residences", "Under Construction", "Yes", "2027",':
            '"mr-c", ["Mr. C Residences", "Under Construction", "Yes", "Timing to confirm",',
    }
    for old, new in repl.items():
        if new in s:
            continue
        if old not in s:
            raise RuntimeError(f"card-data pattern missing: {old[:60]}")
        s = s.replace(old, new)
    CARD_DATA.write_text(s, encoding="utf-8")
    note("card-data: berkeley/mandarin/mr-c card year -> 'Timing to confirm'")


# ---------------------------------------------------------------- guides
# File uses compact single-line entries; match that style.
BERKELEY_GUIDE = " 'berkeley':['Before a Berkeley sales-gallery visit',[plans('berkeley','Review Berkeley\\u2019s released floor plans'),['Compare Berkeley and Mr. C downtown','/compare/?projects=berkeley,mr-c'],['Explore the Downtown condo corridor','/corridors/downtown-west-palm-beach/'],inquiry('berkeley')]],\n"

MANDARIN_GUIDE = " 'mandarin-oriental':['Compare the branded waterfront offering',[['Compare Mandarin Oriental and Olara','/compare/?projects=mandarin-oriental,olara'],['Compare Mandarin Oriental and Ritz-Carlton','/compare/?projects=mandarin-oriental,ritz-carlton-wpb'],['Explore North Flagler condos','/corridors/north-flagler/'],inquiry('mandarin-oriental')]],\n"

MRC_GUIDE = " 'mr-c':['Before a Mr. C sales-gallery visit',[plans('mr-c','Review Mr. C\\u2019s released floor plans'),['Compare Mr. C and Berkeley downtown','/compare/?projects=mr-c,berkeley'],['Explore the Downtown condo corridor','/corridors/downtown-west-palm-beach/'],inquiry('mr-c')]],\n"

MRC_ARTICLE_GUIDE = " 'mr-c-shows-downtown-branded-condos-still-move':['Continue with the current Mr. C guide',[['Mr. C buyer guide: plans and sales guidance','/projects/mr-c/'],plans('mr-c','Browse Mr. C layout references')]],\n"


def update_guides():
    s = GUIDES.read_text(encoding="utf-8")
    # guides object closes with "};" on its own line after the last entry
    closing = "\n};"
    idx = s.find(closing)
    if idx < 0:
        raise RuntimeError("guides closing anchor missing")
    if "'berkeley':['Before a Berkeley sales-gallery visit'" not in s:
        insertion = BERKELEY_GUIDE + MANDARIN_GUIDE + MRC_GUIDE + MRC_ARTICLE_GUIDE
        s = s[:idx] + "\n" + insertion.rstrip("\n") + s[idx:]
        note("guides: added berkeley / mandarin-oriental / mr-c buyer guides + mr-c article link")
    else:
        note("guides: batch 3 guides already present (skipped)")

    # North Flagler corridor guide: add the Mandarin Oriental buyer guide link.
    old_nf = "['Review the Ritz-Carlton buyer guide','/projects/ritz-carlton-wpb/'],"
    if old_nf not in s:
        raise RuntimeError("north-flagler guide anchor missing")
    if "'/projects/mandarin-oriental/'" not in s.split("'north-flagler'")[1].split("],")[0]:
        s = s.replace(
            old_nf,
            old_nf + "['Review the Mandarin Oriental buyer guide','/projects/mandarin-oriental/'],",
            1,
        )
        note("guides: north-flagler guide links Mandarin Oriental buyer guide")
    else:
        note("guides: north-flagler mandarin link already present (skipped)")
    GUIDES.write_text(s, encoding="utf-8")
# ---------------------------------------------------------------- main.ts
def update_main():
    s = MAIN_TS.read_text(encoding="utf-8")

    old_allow = '["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house"]'
    new_allow = '["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house", "berkeley", "mandarin-oriental", "mr-c"]'
    if new_allow in s:
        note("main.ts: hydration allowlist already extended (skipped)")
    else:
        if old_allow not in s:
            raise RuntimeError("hydration allowlist pattern missing")
        s = s.replace(old_allow, new_allow, 1)
        note("main.ts: copy-hydration allowlist extended to batch 3 ids")

    old_nf = 'detail: "Including Alba, Olara, Shorecrest and Ritz-Carlton"'
    new_nf = 'detail: "Including Alba, Olara, Shorecrest, Ritz-Carlton and Mandarin Oriental"'
    if new_nf in s:
        note("main.ts: north-flagler detail already updated (skipped)")
    else:
        if old_nf not in s:
            raise RuntimeError("north-flagler corridor detail missing")
        s = s.replace(old_nf, new_nf, 1)
        note("main.ts: north-flagler corridor detail includes Mandarin Oriental")

    old_dt = 'detail: "Including NORA House and Mr. C"'
    new_dt = 'detail: "Including NORA House, Mr. C and The Berkeley"'
    if new_dt in s:
        note("main.ts: downtown detail already updated (skipped)")
    else:
        if old_dt not in s:
            raise RuntimeError("downtown corridor detail missing")
        s = s.replace(old_dt, new_dt, 1)
        note("main.ts: downtown corridor detail includes The Berkeley")

    MAIN_TS.write_text(s, encoding="utf-8")


def main():
    update_copy_package()
    update_canonical()
    update_overlays()
    update_csv()
    update_card_data()
    update_guides()
    update_main()
    print(f"\nBatch 3 migration complete: {len(CHANGED)} change groups.")


if __name__ == "__main__":
    sys.exit(main())
