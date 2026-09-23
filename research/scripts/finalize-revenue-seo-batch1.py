#!/usr/bin/env python3
"""Source-only fixes found by the first real browser/prerender review."""
from pathlib import Path
import csv,io
root=Path(__file__).resolve().parents[2]
# A gallery is a physical sales location, not a document. Retain all other
# escaping and internal-copy filters; the targeted test guards this.
p=root/'research/scripts/prerender-static-routes.mjs'
s=p.read_text();s=s.replace('    .replace(/\\bsales gallery\\b/gi, "buyer packet")\n','');p.write_text(s)
# Construction status and active-sales project classification are separate.
p=root/'content/wpb_new_construction_building_database_cleaned.csv'
rows=list(csv.DictReader(io.StringIO(p.read_text())));fields=list(rows[0])
import json
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
# Component styling lives in public/assets/styles/revenue-buyer-research.css
# and loads only with the shared block. Do not grow the near-budget global CSS.
print('Gallery semantics and visible mobile comparison checks corrected; global CSS unchanged.')
