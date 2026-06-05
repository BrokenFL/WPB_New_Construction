# auth.md

WPB New Construction is a public buyer-information website. Public pages, `llms.txt`, `sitemap.xml`, RSS, JSON feed, and project pages do not require agent registration or OAuth authentication.

The site does not currently expose a protected public API, remote MCP server, payment endpoint, or automated agent account-registration flow.

## Agent registration

Agent registration is not currently available because the site only publishes public buyer-information resources. There is no `register_uri`, client credential flow, token endpoint, claim endpoint, or revocation endpoint for automated agent accounts.

Supported agent identity type: anonymous public web access.

Supported credential types: none required for public resources.

Agents may access public discovery resources without credentials:

- `https://www.wpbnewconstruction.com/llms.txt`
- `https://www.wpbnewconstruction.com/sitemap.xml`
- `https://www.wpbnewconstruction.com/feed.json`
- `https://www.wpbnewconstruction.com/.well-known/api-catalog`
- `https://www.wpbnewconstruction.com/.well-known/agent-skills/index.json`

For current pricing, availability, incentives, fees, floor-plan release status, delivery timing, or contract questions, use the public inquiry route:

https://www.wpbnewconstruction.com/inquire/
