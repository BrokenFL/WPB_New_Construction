#!/usr/bin/env python3
"""Idempotent source/test corrections from the Batch 2 browser review."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def replace(name,old,new,count=1):
    p=ROOT/name;s=p.read_text()
    if new in s:return
    if s.count(old)!=count:raise ValueError(f'Unexpected source boundary: {name}')
    p.write_text(s.replace(old,new,count))
replace('src/main.ts','["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb"].includes(activeProject.id)','["nora-house", "banyan-tree", "olara", "ritz-carlton-wpb", "shorecrest", "south-flagler-house"].includes(activeProject.id)',2)
replace('src/main.ts','|| activeCorridor?.key === "north-flagler") {','|| ["north-flagler", "south-flagler"].includes(activeCorridor?.key ?? "")) {')
replace('src/main.ts','"south-flagler": "South Flagler Condos | West Palm Beach Buyer Guide"','"south-flagler": "South Flagler New Construction Condos | Plans & Buyer Guide"')
replace('src/main.ts','"south-flagler": "Compare South Flagler waterfront condo projects by privacy, boutique scale, Palm Beach views, floor plans, and current availability checks."','"south-flagler": "Compare South Flagler new construction condos, South Flagler House floor plans and completed waterfront alternatives. Build a buyer shortlist before a sales-gallery visit."')
replace('research/scripts/revenue-seo-batch2.test.mjs','''   assert.equal(fact(label),p[key],`${id} ${label} copy`);assert.equal(row[rowKey],p[key],`${id} ${label} compare`);''','''   const value=key==='address'?p.facts.projectAddress:p[key];
   assert.equal(fact(label),value,`${id} ${label} copy`);assert.equal(row[rowKey],value,`${id} ${label} compare`);''')
replace('research/scripts/revenue-seo-batch2.test.mjs',"  assert.notEqual(p.address,p.facts.salesGalleryAddress);assert.equal(row.price_range_max,'');","  assert.notEqual(p.facts.projectAddress,p.facts.salesGalleryAddress);assert.equal(row.price_range_max,'');\n  assert.equal(String(p.facts.stories),row.floor_count);assert.equal(fact('Floors'),row.floor_count);")
print('Hydrated metadata and source-aware assertions finalized; no dated facts replayed.')
