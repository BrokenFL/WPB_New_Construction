/** Public project identifiers only: no visitor-entered text or viewed-history inference. */
export const shortlistProjects = {
  olara: { name: 'Olara', corridor: 'north-flagler' },
  'ritz-carlton-wpb': { name: 'Ritz-Carlton Residences, West Palm Beach', corridor: 'north-flagler' },
  shorecrest: { name: 'Shorecrest', corridor: 'north-flagler' },
  'south-flagler-house': { name: 'South Flagler House', corridor: 'south-flagler' },
  'la-clara': { name: 'La Clara', corridor: 'south-flagler' },
} as const;
export type ShortlistProjectId = keyof typeof shortlistProjects;
export const comparisonPaths = {
  flagler: '/answers/north-flagler-vs-south-flagler-new-condos/',
  trio: '/answers/olara-vs-ritz-carlton-vs-shorecrest/',
} as const;
export type ComparisonKey = keyof typeof comparisonPaths;
export const comparisonProjectIds: Record<ComparisonKey, readonly ShortlistProjectId[]> = {
  flagler: ['olara', 'ritz-carlton-wpb', 'shorecrest', 'south-flagler-house', 'la-clara'],
  trio: ['olara', 'ritz-carlton-wpb', 'shorecrest'],
};
export function comparisonForPath(value: string): ComparisonKey | undefined {
  const clean = value.split(/[?#]/)[0].replace(/index\.html$/, '').replace(/\/?$/, '/');
  return (Object.keys(comparisonPaths) as ComparisonKey[]).find(key => comparisonPaths[key] === clean);
}
export function encodeShortlist(key: ComparisonKey, selected: readonly unknown[]): string | undefined {
  if (!comparisonProjectIds[key] || selected.length < 2 || selected.length > comparisonProjectIds[key].length) return;
  if (new Set(selected).size !== selected.length || selected.some(id => !comparisonProjectIds[key].includes(id as ShortlistProjectId))) return;
  return `shortlist:${key}:${comparisonProjectIds[key].filter(id => selected.includes(id)).join(',')}`;
}
export function parseShortlist(value: unknown) {
  if (typeof value !== 'string' || value.length > 120) return;
  const m = value.match(/^shortlist:(flagler|trio):([a-z0-9,-]+)$/);
  if (!m) return;
  const key = m[1] as ComparisonKey;
  const ids = m[2].split(',') as ShortlistProjectId[];
  if (encodeShortlist(key, ids) !== value) return;
  const corridors = new Set(ids.map(id => shortlistProjects[id].corridor));
  return { key, ids, path: comparisonPaths[key], names: ids.map(id => shortlistProjects[id].name), corridor: corridors.size === 1 ? [...corridors][0] : 'north-flagler / south-flagler' };
}
