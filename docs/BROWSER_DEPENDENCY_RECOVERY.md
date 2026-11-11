# Browser dependency recovery candidate

The November 11 runner failures occur during Playwright's apt dependency
installation, before site build, Sheet processing or publication. GitHub's
runner-images issue records failures across the Azure and Canonical mirrors:
https://github.com/actions/runner-images/issues/15296#issuecomment-6801205189

## Alternatives and current choice

- A process-scoped official Ubuntu mirror fallback would preserve archive/key
  trust, but this incident also affected the proposed official fallback hosts.
  A healthy response after the incident would not prove outage resilience.
- Browser-binary caching does not supply Linux system dependencies. A warm
  cache therefore cannot establish clean-run recovery; no cache-only change is
  proposed. See https://playwright.dev/docs/ci#caching-browsers .
- Evaluate the official Microsoft Playwright image matching locked Playwright
  **1.60.0** and Ubuntu **24.04**, pinned by verified registry manifest digest:
  `mcr.microsoft.com/playwright:v1.60.0-noble@sha256:9bd26ad900bb5e0f4dee75839e957a89ae89c2b7ab1e76050e559790e946b948`.
  It bundles browsers and OS dependencies rather than downloading apt packages
  during every job. Version matching is required by
  https://playwright.dev/docs/docker .

## Nonproduction proof

The PR-only `Browser dependency recovery candidate` workflow checks the exact
PR head with read-only repository access and no persisted checkout credential.
It restores no npm, browser or apt cache, uses Node 22 and unprivileged UID 1001,
and invokes `node research/scripts/qa-browser-recovery.mjs` after `npm ci`.

The reproduction creates temporary process-local apt/sudo shims that return the
observed DNS failure and exit 100. The real old Playwright dependency command
must fail against them. The candidate must then launch the real bundled browser,
fail closed for an empty browser path, and pass Fast Cycle/P2 fixtures,
typecheck/build, the complete repository/launch/gatekeeper suite, mocked inquiry
contracts, asset audit and eight-route browser health on a loopback preview.
Unexpected apt/sudo use during those gates fails the run. It changes no resolver,
host package source, trust store, signature/TLS policy or sandbox setting.

`check-ci-browser.mjs` verifies the locked package, OS, Node version, UID, fonts,
git ownership and actual tool inventory, including whether `gh` exists. The
conditional Fast Cycle deployment-dispatch command must remain compatible
before any operational workflow is proposed for activation.

This diagnostic stage does not change the installed Fast Cycle/deploy workflows,
invoke a live cycle, read/write a live Sheet, use Cloudflare credentials, dispatch
a live deployment, alter schedules, merge or publish. Linux/container proof is
performed in branch CI; Docker is unavailable on this Mac. Production activation
requires separate approval after the complete candidate is tested.
