#!/usr/bin/env python3
"""Source-only fixes found by the first real browser/prerender review."""
from pathlib import Path
import csv,io
root=Path(__file__).resolve().parents[2]
# A gallery is a physical sales location, not a document. Retain all other
# escaping and internal-copy filters; the existing targeted test guards this.
p=root/'research/scripts/prerender-static-routes.mjs'
s=p.read_text();s=s.replace('    .replace(/\\bsales gallery\\b/gi, "buyer packet")\n','');p.write_text(s)
# Keep the current construction status consistent with the canonical records;
# active sales is separately retained in development_stage and projectType.
p=root/'content/wpb_new_construction_building_database_cleaned.csv'
rows=list(csv.DictReader(io.StringIO(p.read_text())));fields=list(rows[0])
import json
identity=json.loads((root/'content/project-identity-decisions.json').read_text())['projects']
allowed={p['compareDatabaseId'] for p in identity if p['publicSlug'] in ['olara','ritz-carlton-wpb']}
for row in rows:
 if row['project_id'] in allowed:row['status_badge']='Under Construction'
buf=io.StringIO(newline='');writer=csv.DictWriter(buf,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(rows);p.write_text(buf.getvalue())
# Mobile Compare intentionally hides its desktop table. Assert the visible
# comparison matrix rather than timing out on a legitimate hidden desktop cell.
p=root/'research/scripts/check-revenue-seo-batch1-browser.mjs';s=p.read_text()
old="    await page.locator('[data-compare-results]').getByText('Request current pricing',{exact:false}).first().waitFor();\n    const comparison=await page.locator('[data-compare-results]').innerText();"
new="    const visibleMatrix=page.locator('[data-compare-results] .compare-matrix-desktop:visible, [data-compare-results] .compare-matrix-mobile:visible');\n    await visibleMatrix.getByText('Request current pricing',{exact:false}).first().waitFor();\n    const comparison=await visibleMatrix.innerText();"
if new not in s:
 if old not in s:raise ValueError('Unexpected browser test source')
 s=s.replace(old,new,1)
p.write_text(s)
# A short related-research block should not inherit the site's oversized
# section heading. Limit these styles to the new block; no layout redesign.
p=root/'src/style.css';s=p.read_text();marker='/* Revenue buyer research: scoped typography, not a new card system. */'
if marker not in s:
 s+='\n'+marker+'''
.revenue-buyer-research.section {
  width: min(1180px, calc(100% - 32px));
  margin: 24px auto;
  padding: 24px 0;
  border-top: 1px solid #dedbd2;
}
.revenue-buyer-research h2 {
  max-width: 38ch;
  margin: 0 0 12px;
  font-size: clamp(1.45rem, 2.3vw, 1.9rem);
  line-height: 1.15;
}
.revenue-buyer-research p { max-width: 70ch; margin: 0; line-height: 1.6; }
.revenue-buyer-research nav ul { display: grid; gap: 10px 28px; margin: 18px 0 0; padding: 0; list-style: none; }
.revenue-buyer-research nav a { display: inline-flex; align-items: center; min-height: 44px; line-height: 1.4; text-underline-offset: 4px; }
@media (min-width: 760px) { .revenue-buyer-research nav ul { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
'''
p.write_text(s)
print('Address-role filter, visible mobile comparison checks and scoped typography corrected.')
