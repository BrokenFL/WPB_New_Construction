// Preserve the existing post-push dispatch without requiring gh in the CI image.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const repository = "BrokenFL/WPB_New_Construction";
const endpoint = `https://api.github.com/repos/${repository}/actions/workflows/deploy-cloudflare-pages.yml/dispatches`;

export async function dispatchAfterContentPush({ triggerSha, token, readRemote = () =>
  execFileSync("git", ["ls-remote", "origin", "refs/heads/main"], { encoding: "utf8" }), request = fetch }) {
  assert.match(triggerSha || "", /^[a-f0-9]{40}$/, "Missing or invalid triggering revision");
  const remote = readRemote().trim();
  assert.match(remote, /^[a-f0-9]{40}\s+refs\/heads\/main$/, "Could not resolve one remote main revision");
  const remoteSha = remote.split(/\s+/)[0];
  if (remoteSha === triggerSha) return { dispatched: false, remoteSha };
  assert.ok(token, "Missing job-scoped GitHub token");
  let response;
  try {
    response = await request(endpoint, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000),
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28" },
      body: JSON.stringify({ ref: "main" }),
    });
  } catch {
    // A request may have reached GitHub; do not retry an uncertain dispatch.
    throw new Error("Deployment dispatch outcome uncertain; inspect Actions before retrying");
  }
  assert.ok(response.status === 204 || response.status === 200,
    `Deployment dispatch rejected (HTTP ${response.status}); no retry attempted`);
  return { dispatched: true, remoteSha };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    assert.equal(process.env.GITHUB_REPOSITORY, repository, "Unexpected repository");
    assert.ok(["schedule", "repository_dispatch", "workflow_dispatch"].includes(process.env.GITHUB_EVENT_NAME),
      "Dispatch is restricted to the existing Fast Cycle events");
    const result = await dispatchAfterContentPush({ triggerSha: process.env.GITHUB_SHA, token: process.env.GH_TOKEN });
    console.log(result.dispatched ? `Dispatched Cloudflare deployment for ${result.remoteSha}.` :
      "Fast Cycle made no content push; no deployment dispatch needed.");
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
