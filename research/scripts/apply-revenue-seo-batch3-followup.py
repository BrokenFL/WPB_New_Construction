#!/usr/bin/env python3
"""Revenue SEO Batch 3 follow-up corrections (same-day, 2026-09-23).

Corrects issues found in the narrow-check pass on commit c4bb769:
1. Mandarin residence ZIP: 33407 is supported by Cervera, MLS B26074726,
   full-address geocode 33407-2748, LoopNet property-record presentation
   for parcel 74-43-43-04-06-037-0010, and YIMBY. BUT the direct Palm Beach
   County PAPA record (opened 2026-09-23: situs "5440 N FLAGLER DR",
   parcel confirmed, owner 5400 N FLAGLER LIMITED PARTNERSHIP) shows NO
   situs ZIP. The ZIP is therefore not authoritatively resolved. Per the
   editorial standard, the disputed residence ZIP is OMITTED from public
   output/schema: "5400 N Flagler Drive, West Palm Beach, FL". The
   mo-residenceswestpalmbeach.com footer 33480 is sales-lounge conflation.
   The c4bb769 "ZIP corrected from 33407" claim was premature and is
   corrected here. Lounge keeps its own address (33480).
2. Mandarin pricing: Cervera publishes "Starting from $3,500,000" (checked
   2026-09-23; YIMBY Mar 2026 corroborates). Attribute and date it as
   published starting guidance, not a live availability quote.
3. Mr. C: add verified sales gallery 401 S. Olive Avenue, West Palm Beach,
   FL 33401 (official site contact page) in the correct field; project
   address stays 327 Okeechobee Boulevard.
4. Mandarin: populate sales_gallery_address (205 Worth Avenue, #321, Palm
   Beach, FL 33480) from the verified lounge fact.
5. Delivery sort: the 0 "unknown" sentinel must never sort as "earliest".
   compareProjectCards now maps 0 -> unknown-last.

Same rules as Batch 3: copy-package is editorial source of truth, canonical
JSON is facts, overlays hold fallback/card values, CSV feeds Compare, src
files are edited in place. No invented pricing/availability; primary CTAs
stay with The Scott Gordon Group via /inquire/?project=<id>.
"""
import csv
import json
import sys
from pathlib import Path

WS = Path(__file__).resolve().parents[2]
VERIFY_DATE = "2026-09-23"

COPY_PKG = WS / "content/project-copy-package.json"
CANONICAL = WS / "research/source-material-review/wpb-projects-canonical-v3-planning-update.json"
OVERLAYS = WS / "content/project-page-overlays.json"
CSV_PATH = WS / "content/wpb_new_construction_building_database_cleaned.csv"
MAIN_TS = WS / "src/main.ts"

MANDARIN_RESIDENCE_ADDRESS = "5400 N Flagler Drive, West Palm Beach, FL"
MANDARIN_LOUNGE = "205 Worth Avenue, #321, Palm Beach, FL 33480"
MANDARIN_PRICE = "From $3.5M (Cervera published starting guidance; request current pricing and availability)"
MRC_GALLERY = "401 S. Olive Avenue, West Palm Beach, FL 33401"

CHANGED = []


def note(msg):
    CHANGED.append(msg)
    print(" -", msg)


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- copy package
MANDARIN_ZIP_NOTE = (
    "2026-09-23 follow-up verification: residence address is 5400 N. Flagler Drive, "
    "West Palm Beach, FL (ZIP OMITTED - disputed, not authoritatively resolved). "
    "Evidence supporting 33407: Cervera project page, MLS B26074726, full-address "
    "geocode match (33407-2748), LoopNet property-record presentation for parcel "
    "74-43-43-04-06-037-0010, Florida YIMBY (Mar 2026). Direct Palm Beach County PAPA "
    "record opened 2026-09-23: situs '5440 N FLAGLER DR', parcel 74-43-43-04-06-037-0010 "
    "confirmed, owner 5400 N FLAGLER LIMITED PARTNERSHIP - PAPA shows NO situs ZIP, "
    "so the ZIP is not authoritatively resolved. Per editorial standard, retain the "
    "verified street/city and omit the disputed ZIP from public output/schema rather "
    "than asserting 33407. The 33480 appeared only in the mo-residenceswestpalmbeach.com "
    "footer, which also correctly uses 33480 for the Palm Beach sales lounge (footer "
    "conflation). Keep 33480 only for the lounge (205 Worth Avenue, #321, Palm Beach, "
    "FL 33480). The c4bb769 'ZIP corrected from 33407' claim was premature and is "
    "corrected here."
)

MANDARIN_PRICE_NOTE = (
    "2026-09-23 follow-up verification: Cervera project page advertises 'Starting from "
    "$3,500,000' (checked 2026-09-23); Florida YIMBY (Mar 2026) corroborates starting at "
    "$3.5M. This is published starting guidance from the official listing, not a live "
    "availability feed or guaranteed available-unit quote. Retain 'request current "
    "pricing and availability'."
)

MRC_GALLERY_NOTE = (
    "2026-09-23 follow-up verification: sales gallery at 401 S. Olive Avenue, West Palm "
    "Beach, FL 33401 per the official site contact page (mrcresidenceswpb.com/contact-us/, "
    "'Visit the Sales Gallery'), checked 2026-09-23; place data corroborates. "
    "Project/building address remains 327 Okeechobee Boulevard. Primary inquiry CTAs "
    "stay with The Scott Gordon Group via /inquire/?project=mr-c."
)


def update_copy_package():
    data = load_json(COPY_PKG)
    by_slug = {p["slug"]: p for p in data}

    # ---- mandarin: ZIP resolution
    m = by_slug["mandarin-oriental-residences-west-palm-beach"]
    mqfs = m["quickFacts"]
    for q in mqfs:
        if q["label"] == "Address":
            q["value"] = MANDARIN_RESIDENCE_ADDRESS
        if q["label"] == "Price Range":
            q["value"] = MANDARIN_PRICE
    for field in ("location", "locationNarrative"):
        m[field] = m[field].replace(
            "5400 N. Flagler Drive, West Palm Beach, FL 33480",
            "5400 N. Flagler Drive, West Palm Beach, FL",
        ).replace(
            "5400 N. Flagler Drive, West Palm Beach, FL 33407",
            "5400 N. Flagler Drive, West Palm Beach, FL",
        )
    m["signatureFeatures"] = [
        ("Price Range: " + MANDARIN_PRICE) if s.startswith("Price Range:") else s
        for s in m["signatureFeatures"]
    ]
    # Correct the premature "ZIP corrected from 33407" claim in place.
    fixed_notes = []
    for n in m.get("sourceNotes", []):
        if "ZIP corrected from 33407" in n:
            n = n.replace(
                "residence address 5400 N. Flagler Drive, West Palm Beach, FL 33480 (ZIP corrected from 33407)",
                "residence address initially recorded as 5400 N. Flagler Drive, West Palm Beach, FL 33480 "
                "(claim superseded by same-day follow-up: evidence resolves to 33407)",
            )
            n = n.replace("Pricing not currently verified.", "Pricing: see follow-up pricing note.")
        fixed_notes.append(n)
    m["sourceNotes"] = fixed_notes
    # Replace any earlier 33407-assertion note with the omit-ZIP note (the county
    # record shows no situs ZIP, so the ZIP is not authoritatively resolved).
    m["sourceNotes"] = [
        MANDARIN_ZIP_NOTE if n.startswith("2026-09-23 follow-up verification: residence address is 5400 N. Flagler Drive")
        else n
        for n in m["sourceNotes"]
    ]
    if not any(n.startswith("2026-09-23 follow-up verification: residence address is 5400 N. Flagler Drive") for n in m["sourceNotes"]):
        m["sourceNotes"].append(MANDARIN_ZIP_NOTE)
    if not any("Starting from $3,500,000" in n for n in m["sourceNotes"]):
        m["sourceNotes"].append(MANDARIN_PRICE_NOTE)
    note("copy-package: mandarin residence ZIP omitted (not authoritatively resolved), pricing attributed as published guidance")

    # ---- mr-c: sales gallery
    c = by_slug["mr-c-residences-west-palm-beach"]
    cqfs = c["quickFacts"]
    caddr_idx = next(i for i, q in enumerate(cqfs) if q["label"] == "Address")
    if not any(q["label"] == "Sales Gallery" for q in cqfs):
        cqfs.insert(caddr_idx + 1, {"label": "Sales Gallery", "value": MRC_GALLERY})
    overview = c["overview"]
    if "401 S. Olive" not in overview:
        overview = overview.replace(
            "Construction is underway;",
            "The sales gallery is separately located at 401 S. Olive Avenue in downtown West Palm Beach; construction is underway;",
        )
        c["overview"] = overview
    if not any("sales gallery at 401 S. Olive" in n for n in c.get("sourceNotes", [])):
        c["sourceNotes"] = c.get("sourceNotes", []) + [MRC_GALLERY_NOTE]
    note("copy-package: mr-c sales gallery 401 S. Olive added (overview + quick facts + source note)")

    dump_json(COPY_PKG, data)


# ---------------------------------------------------------------- canonical
def update_canonical():
    data = load_json(CANONICAL)
    projs = data["projects"] if isinstance(data, dict) else data
    by_id = {p.get("project_id"): p for p in projs}

    m = by_id["mandarin-oriental-residences-west-palm-beach"]
    m["public_address"] = MANDARIN_RESIDENCE_ADDRESS
    m["sales_gallery_address"] = MANDARIN_LOUNGE
    m["price_display"] = "From $3.5M published starting guidance (Cervera); request current pricing and availability"
    note_text = m.get("municipal_or_legal_note", "")
    zip_status = (
        "ZIP status 2026-09-23: 33407 supported by Cervera, MLS B26074726, geocode "
        "33407-2748, LoopNet property-record presentation for parcel "
        "74-43-43-04-06-037-0010; direct PAPA record opened 2026-09-23 (situs "
        "'5440 N FLAGLER DR', owner 5400 N FLAGLER LIMITED PARTNERSHIP) shows no "
        "situs ZIP - ZIP not authoritatively resolved, omitted from public address "
        "per editorial standard. mo-residenceswestpalmbeach.com footer 33480 is "
        "sales-lounge conflation."
    )
    if "ZIP resolved 2026-09-23" in note_text:
        # Replace the earlier premature resolution claim with the omit-ZIP status.
        import re
        note_text = re.sub(r"ZIP resolved 2026-09-23:[^.]*\.", zip_status, note_text)
        m["municipal_or_legal_note"] = note_text.strip()
    elif "ZIP status 2026-09-23" not in note_text:
        m["municipal_or_legal_note"] = (note_text + " " + zip_status).strip()
    note("canonical: mandarin public_address ZIP omitted, sales_gallery_address populated, price attributed")

    c = by_id["mr-c-residences-west-palm-beach"]
    c["sales_gallery_address"] = MRC_GALLERY
    note("canonical: mr-c sales_gallery_address populated")

    dump_json(CANONICAL, data)


# ---------------------------------------------------------------- overlays
def update_overlays():
    data = load_json(OVERLAYS)
    projs = data["projects"] if isinstance(data, dict) else data
    by_slug = {p["publicSlug"]: p for p in projs}

    m = by_slug["mandarin-oriental"]
    m["approvedFallback"]["address"] = MANDARIN_RESIDENCE_ADDRESS
    m["approvedFallback"]["price"] = "From $3.5M published starting guidance"
    note("overlays: mandarin fallback address ZIP omitted, price attributed")

    dump_json(OVERLAYS, data)


# ---------------------------------------------------------------- compare CSV
def update_csv():
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    fieldnames = rows[0].keys()
    for r in rows:
        if r.get("slug") == "mandarin-oriental-residences-west-palm-beach":
            r["public_address"] = MANDARIN_RESIDENCE_ADDRESS
            r["price_display"] = "From $3.5M published starting guidance (Cervera); request current pricing and availability"
            r["last_reviewed_at"] = VERIFY_DATE
            note("csv: mandarin public_address ZIP omitted, price attributed")
    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


# ---------------------------------------------------------------- main.ts delivery sort
def update_main():
    s = MAIN_TS.read_text(encoding="utf-8")

    old_branch = '''  if (sortValue === "delivery") {
    return getNumericDataset(a, "d") - getNumericDataset(b, "d");
  }
'''
    new_branch = '''  if (sortValue === "delivery") {
    return deliverySortValue(a) - deliverySortValue(b);
  }
'''
    helper = '''function deliverySortValue(el: HTMLElement): number {
  // 0 is the repo's "delivery not publicly confirmed" sentinel. Never let it
  // sort as "earliest": unknown timing always sorts last.
  const value = getNumericDataset(el, "d");
  return value === 0 ? Number.MAX_SAFE_INTEGER : value;
}

'''
    if "function deliverySortValue" in s:
        note("main.ts: delivery unknown-last helper already present (skipped)")
        return
    if old_branch not in s:
        raise RuntimeError("delivery sort branch pattern missing")
    s = s.replace(old_branch, new_branch, 1)
    anchor = "function compareProjectCards("
    if anchor not in s:
        raise RuntimeError("compareProjectCards anchor missing")
    s = s.replace(anchor, helper + anchor, 1)
    MAIN_TS.write_text(s, encoding="utf-8")
    note("main.ts: delivery sort treats unknown (0) as last, never earliest")


def main():
    update_copy_package()
    update_canonical()
    update_overlays()
    update_csv()
    update_main()
    print(f"\nBatch 3 follow-up migration complete: {len(CHANGED)} change groups.")


if __name__ == "__main__":
    sys.exit(main())
