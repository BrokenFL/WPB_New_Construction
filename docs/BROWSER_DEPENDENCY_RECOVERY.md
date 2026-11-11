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
- Use the official Microsoft Playwright image matching locked Playwright
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
reject invalid bundled-path configuration, and directly attempt Chromium launch
with a genuinely empty browser directory, asserting the executable-missing error.
It must pass Fast Cycle/P2 fixtures,
typecheck/build, the complete repository/launch/gatekeeper suite, mocked inquiry
contracts, asset audit and eight-route browser health on a loopback preview.
Unexpected apt/sudo use during those gates fails the run. It changes no resolver,
host package source, trust store, signature/TLS policy or sandbox setting.

`check-ci-browser.mjs` verifies the locked package, OS, Node version, UID, fonts,
git ownership and actual tool inventory, including whether `gh` exists. The
first Linux proof (run 43065193681, head 96a46fe) passed and established that
`gh` is absent. The candidate therefore replaces only the existing conditional
deployment dispatch command with `research/scripts/p2/dispatch-fast-cycle-deploy.mjs`.
It uses Node 22's fetch and the same job token, fixed workflow and main ref;
unchanged main makes no request. Mocked request tests cover changed/no-change,
invalid remote refs, missing credentials, HTTP rejection and uncertain network
outcomes with no automatic retries. The CLI no-change path also runs with a
fixture git executable and no gh. No live dispatch is used in this proof.

The installed Fast Cycle, matching source template, deployment workflow and
browser compatibility check use the same immutable image and bundled-browser
check. Their existing events, schedules, permissions, publication flags and
build/launch/gatekeeper gates remain intact. The PR proof additionally verifies
pinned Wrangler 4.93.0 and compiles the actual Pages Functions locally without
Cloudflare credentials or API calls. It never invokes the live cycle or ship script.

Static review of `deploy-cloudflare-pages-with-retry.mjs` confirms that ship uses
Node filesystem/path/fetch APIs, npm for its existing preflight, and npx for
pinned Wrangler diagnostics and Pages deployment. Git supplies revision metadata
to Wrangler and the surrounding workflow. There is no additional gh, apt, sudo
or host-only executable requirement. The image proof exercises Node/npm/git,
all build/QA prerequisites and Wrangler's local Functions build. Actual shipping
also requires the existing Cloudflare credentials/account authorization,
production Maps bundle preflight and public/Cloudflare network access. These
credentialed paths deliberately remain untested on this branch. Image pulling,
GitHub and npm registry access are still required; this removes runtime Ubuntu
package-mirror dependence, not every possible network failure.

These operational changes are proposed only on the draft branch. PR events run
credential-free fixture/build/browser checks; production workflows only respond
to their existing main/scheduled events. This proof does not read/write a live
Sheet, use Cloudflare credentials, dispatch a live deployment, alter schedules,
merge or publish. Linux/container proof is
performed in branch CI; Docker is unavailable on this Mac. Production activation
requires separate approval after the complete candidate is tested.

Reproduce with the PR-only workflow after pushing the reviewed branch. Its clean
job runs `npm ci` then `node research/scripts/qa-browser-recovery.mjs`; no browser,
npm or apt cache is restored. Inspect its exact head and final JSON receipt.
Locally, `npm run test:p2:fast` and
`node --test research/scripts/p2/dispatch-fast-cycle-deploy.test.mjs` cover contracts.
The full harness intentionally requires Linux, the pinned image and a PR event.
After approval, normal merge/deploy and a fresh scheduled Fast Cycle still need
separate remote/live verification. Roll back by reverting this scoped commit;
do not modify resolver settings or bypass a failing gate.
