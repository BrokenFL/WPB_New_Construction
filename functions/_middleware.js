const discoveryLinks = [
  '</llms.txt>; rel="service-doc"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
  '</auth.md>; rel="service-doc"; type="text/markdown"',
];

const siteOrigin = "https://www.wpbnewconstruction.com";

const mcpTools = [
  {
    name: "wpb_list_priority_routes",
    title: "List priority WPB New Construction routes",
    description: "Returns public buyer-research routes that are useful starting points for agents.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "wpb_find_project",
    title: "Find a WPB New Construction project route",
    description: "Returns the best matching public project page for a named West Palm Beach new-construction project.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Project name or buyer search phrase.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "wpb_open_inquiry_route",
    title: "Open the buyer inquiry route",
    description: "Returns the public inquiry route for agent-assisted buyer handoff.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

const priorityRoutes = [
  { title: "New construction homepage", url: `${siteOrigin}/`, description: "Primary buyer-facing entry point." },
  { title: "Project map", url: `${siteOrigin}/map/`, description: "Geographic view of West Palm Beach projects." },
  { title: "Building comparisons", url: `${siteOrigin}/compare/`, description: "Buyer-facing comparison workflow." },
  { title: "Floor plans", url: `${siteOrigin}/floorplans/`, description: "Inventory and floor-plan discovery route." },
  { title: "Market updates", url: `${siteOrigin}/updates/`, description: "Development and market update archive." },
  { title: "Inquiry", url: `${siteOrigin}/inquire/`, description: "Human follow-up route for current pricing and availability." },
];

const projectRoutes = [
  { name: "South Flagler House", url: `${siteOrigin}/projects/south-flagler-house/` },
  { name: "The Berkeley", url: `${siteOrigin}/projects/the-berkeley/` },
  { name: "Olara", url: `${siteOrigin}/projects/olara/` },
  { name: "Alba Palm Beach", url: `${siteOrigin}/projects/alba-palm-beach/` },
  { name: "Shorecrest", url: `${siteOrigin}/projects/shorecrest/` },
  { name: "Nora Hotel and Residences", url: `${siteOrigin}/projects/nora-hotel-and-residences/` },
  { name: "Ritz-Carlton Residences West Palm Beach", url: `${siteOrigin}/projects/ritz-carlton-residences-west-palm-beach/` },
];

function jsonResponse(body, init = {}) {
  const headers = addDiscoveryHeaders(new Headers(init.headers));
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers,
  });
}

function mcpText(text) {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}

function mcpResult(id, result) {
  return jsonResponse({ jsonrpc: "2.0", id, result });
}

function mcpError(id, code, message) {
  return jsonResponse({ jsonrpc: "2.0", id, error: { code, message } }, { status: 400 });
}

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

function mcpServerCard() {
  return jsonResponse({
    $schema: "https://modelcontextprotocol.io/schemas/server-card/v1.json",
    serverInfo: {
      name: "WPB New Construction Buyer Research",
      version: "1.0.0",
    },
    transport: {
      type: "streamable-http",
      endpoint: `${siteOrigin}/mcp`,
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: {},
      prompts: {},
    },
    tools: mcpTools.map(({ name, title, description, inputSchema }) => ({
      name,
      title,
      description,
      inputSchema,
    })),
  });
}

async function mcpEndpoint(context) {
  if (context.request.method === "OPTIONS") {
    return jsonResponse({}, {
      headers: {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, mcp-protocol-version",
      },
    });
  }

  if (context.request.method === "GET") {
    return jsonResponse({
      name: "WPB New Construction Buyer Research MCP",
      transport: "streamable-http",
      endpoint: `${siteOrigin}/mcp`,
      tools: mcpTools,
    });
  }

  if (context.request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return mcpError(null, -32700, "Invalid JSON");
  }

  const id = payload.id ?? null;
  switch (payload.method) {
    case "initialize":
      return mcpResult(id, {
        protocolVersion: "2025-06-18",
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        serverInfo: {
          name: "WPB New Construction Buyer Research",
          version: "1.0.0",
        },
      });
    case "tools/list":
      return mcpResult(id, { tools: mcpTools });
    case "tools/call": {
      const toolName = payload.params?.name;
      const args = payload.params?.arguments ?? {};

      if (toolName === "wpb_list_priority_routes") {
        return mcpResult(id, mcpText(JSON.stringify({ routes: priorityRoutes }, null, 2)));
      }

      if (toolName === "wpb_find_project") {
        const query = String(args.query ?? "").toLowerCase();
        const match = projectRoutes.find((project) => project.name.toLowerCase().includes(query))
          ?? projectRoutes.find((project) => query.includes(project.name.toLowerCase()))
          ?? null;
        return mcpResult(id, mcpText(JSON.stringify({
          query: args.query ?? "",
          match,
          fallback: match ? null : `${siteOrigin}/projects/`,
        }, null, 2)));
      }

      if (toolName === "wpb_open_inquiry_route") {
        return mcpResult(id, mcpText(JSON.stringify({
          url: `${siteOrigin}/inquire/`,
          note: "Use this route for current pricing, availability, incentives, and contract questions.",
        }, null, 2)));
      }

      return mcpError(id, -32601, `Unknown tool: ${toolName}`);
    }
    default:
      return mcpError(id, -32601, `Unsupported method: ${payload.method}`);
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const accept = context.request.headers.get("Accept")?.toLowerCase() ?? "";

  if (url.pathname === "/.well-known/mcp/server-card.json") {
    return mcpServerCard();
  }

  if (url.pathname === "/mcp") {
    return mcpEndpoint(context);
  }

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
