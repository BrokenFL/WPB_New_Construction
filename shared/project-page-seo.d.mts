export function projectPageHeading(name: string, corridorKey: string): string;
export function projectPageSeo(project: { id: string; name: string; corridorKey: string; summary?: string }, copy?: { seoTitle?: string; metaDescription?: string }): { title: string; description: string };
