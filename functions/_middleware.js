const discoveryLinks = [
  '</llms.txt>; rel="service-doc"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"',
  '</auth.md>; rel="service-doc"; type="text/markdown"',
];

function addDiscoveryHeaders(headers) {
  for (const link of discoveryLinks) {
    headers.append("Link", link);
  }
  return headers;
}

async function markdownHomepage(context) {
  const url = new URL(context.request.url);
  const llmsUrl = new URL("/llms.txt", url);
  const assetResponse = await context.env.ASSETS.fetch(new Request(llmsUrl, context.request));
  const markdown = await assetResponse.text();
  const headers = addDiscoveryHeaders(new Headers());
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("x-markdown-tokens", String(Math.ceil(markdown.length / 4)));
  return new Response(markdown, { status: 200, headers });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const accept = context.request.headers.get("Accept")?.toLowerCase() ?? "";

  if (url.pathname === "/" && accept.includes("text/markdown")) {
    return markdownHomepage(context);
  }

  const response = await context.next();
  const headers = addDiscoveryHeaders(new Headers(response.headers));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
