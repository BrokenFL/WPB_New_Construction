import { generatedProjectSchemaFacts } from "../generated/projectSchemaRuntime";

type SchemaSafeProjectFacts = {
  identity: {
    slug: string;
    route: string;
    displayName: string;
    corridor: string;
    url: string;
  };
  safeFields: Partial<Record<"name" | "route" | "url" | "corridor" | "status" | "delivery" | "residenceCount" | "address", string>>;
};

const factsBySlug = new Map<string, SchemaSafeProjectFacts>(generatedProjectSchemaFacts.map((project) => [project.identity.slug, project]));

export function getSchemaSafeProjectFacts(identifier: string): SchemaSafeProjectFacts {
  const slug = identifier.trim();
  const match = factsBySlug.get(slug);
  if (match) return match;
  const route = `/projects/${slug}/`;
  return {
    identity: {
      slug,
      route,
      displayName: slug,
      corridor: "West Palm Beach",
      url: `https://www.wpbnewconstruction.com${route}`,
    },
    safeFields: {
      name: slug,
      route,
      url: `https://www.wpbnewconstruction.com${route}`,
      corridor: "West Palm Beach",
    },
  };
}
