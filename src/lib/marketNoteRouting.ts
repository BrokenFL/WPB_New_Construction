type ArticleRoute = { slug: string; category?: string; routeBase?: string; status?: string };

export function marketNoteRouteBase(note: Pick<ArticleRoute, 'category' | 'routeBase'>) {
  if (note.routeBase === '/answers/') return '/answers/';
  return note.category === 'Downtown Spotlight' ? '/downtown-spotlight/' : '/market-notes/';
}

export function marketNotePath(note: ArticleRoute) {
  return `${marketNoteRouteBase(note)}${note.slug}/`;
}

export function marketNoteForPath<T extends ArticleRoute>(notes: readonly T[], pathname: string) {
  const path = pathname.replace(/\/$/, '') + '/';
  return notes.find(note => note.status === 'published' && marketNotePath(note) === path);
}

export function validateBuyerRouteBase(value: unknown, destination: string) {
  if (value == null || value === '') return;
  if (destination !== 'buyer' || value !== '/answers/') {
    throw new Error('Only buyer articles may select the /answers/ route base.');
  }
}
