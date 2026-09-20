# Canonical public inventory reconciliation

## Independent count

The discovery count was reconciled from the public project model and the reviewed canonical projection, rather than by reusing the corridor renderer. Both contain the same 24 published building records.

| Area | Public records | Composition |
|---|---:|---|
| North Flagler | 10 | 3 condo active-sales, 1 completed comparable, 5 condo pipeline, 1 mixed-use |
| South Flagler | 6 | 2 condo active-sales, 2 completed comparables, 2 condo pipeline |
| Downtown / Rosemary | 5 | 2 condo active-sales, 3 condo pipeline |
| Palm Beach | 2 | 2 condo pipeline |
| South End / South Dixie | 1 | 1 rental community |
| **Total** | **24** | All public project types currently represented |

The South End record is deliberately labeled as rental housing. Its inclusion makes site coverage complete without implying that it is for-sale condominium inventory.

## North Flagler proof

The earlier corridor renderer showed active-sales and pipeline/mixed-use groups only. This omitted Alba Palm Beach because its canonical type is `completed-comparable`, even though the corridor heading counted it among ten records.

The repaired page groups all ten records exactly once:

- Active sales and construction: Olara, Shorecrest and The Ritz-Carlton Residences.
- Completed building: Alba Palm Beach.
- Pipeline and planning watch: Mandarin Oriental Residences, Alba Reserve, Rosewood Residences, Apogee Residences, 2085 North Flagler and the Rybovich Marina redevelopment.

No status or canonical fact was changed. The implementation only corrected discovery grouping and order.

## Directory filter correction

The Active Sales filter now uses the canonical `condo-active-sales` project type rather than depending only on variable status prose. This restores all seven eligible public records across the directory while leaving completed, pipeline, mixed-use and rental records in their existing categories.
