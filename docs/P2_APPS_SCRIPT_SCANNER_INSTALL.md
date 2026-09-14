# Fast Cycle Apps Script wake-up installation

`tools/apps-script/fast-cycle-wakeup.gs` is the Apps Script source for the
private WPB intelligence spreadsheet. The recurring trigger calls
`wakeIntelFastCycle`, which does one thing: send GitHub repository dispatch
event `wpb-intel-scan` to `BrokenFL/WPB_New_Construction`.

GitHub Actions remains the only processor. Apps Script does not read rows for
the recurring wake, make policy decisions, write Story_Queue, publish, apply
facts, commit, push, or deploy. The GitHub `*/15` cron remains enabled as a
fallback because scheduled Actions can be delayed or skipped under load.

## Secure credential

Create a fine-grained GitHub personal access token limited to:

- repository: `BrokenFL/WPB_New_Construction` only;
- repository permission: **Contents — Read and write** (required by GitHub's
  Create a repository dispatch event endpoint);
- the shortest practical expiration, with a renewal reminder.

Store it only in Apps Script **Project Settings → Script properties**:

| Property | Value |
| --- | --- |
| `GITHUB_DISPATCH_TOKEN` | Fine-grained token described above |

Never paste the token into source code, a Sheet cell, a log, an issue, or this
repository. The wake health record stores only timestamp, HTTP code, repository,
and event type.

The older optional signed scanner still recognizes `SCANNER_MODE`, `SHEET_ID`,
`POLICY_VERSION`, `DISPATCH_ENDPOINT`, and `DISPATCH_SECRET`, but none of those
properties are needed by `wakeIntelFastCycle`. Do not install
`scanIncomingIntel`, `scanStoryQueue`, or `scanBothQueues` as recurring
triggers.

## Install and verify, click by click

1. Open the private WPB intelligence spreadsheet.
2. Choose **Extensions → Apps Script**.
3. Open the existing script file, replace it with the current contents of
   `tools/apps-script/fast-cycle-wakeup.gs`, and click **Save**.
4. Open **Project Settings** (gear icon).
5. Under **Script properties**, click **Add script property**.
6. Enter `GITHUB_DISPATCH_TOKEN` as the property and paste the fine-grained
   token as its value. Click **Save script properties**.
7. Return to **Editor**. Select `wakeIntelFastCycle` in the function menu and
   click **Run** once.
8. Complete Google's authorization prompt. The successful result is HTTP 204;
   GitHub should show a new **Intel Fast Cycle** run whose event is
   `repository_dispatch`.
9. Select `getFastCycleWakeHealth` and click **Run**. Confirm `status: "ok"`,
   `response_code: 204`, repository `BrokenFL/WPB_New_Construction`, and event
   type `wpb-intel-scan`.
10. Select `installFastCycleWakeupTrigger` and click **Run**. This replaces only
    prior triggers for the same wake handler and creates one 15-minute trigger.
11. Open **Triggers** (clock icon). Confirm exactly one enabled trigger with:
    function `wakeIntelFastCycle`, event source **Time-driven**, type
    **Minute timer**, interval **Every 15 minutes**.
12. Open **Executions** after the next interval and confirm a successful
    `wakeIntelFastCycle` execution. Then confirm the corresponding GitHub run.

If the programmatic installer is unavailable, use **Triggers → Add Trigger**
and choose the exact handler/source/type/interval in step 11.

## Minimum Google scopes

Let the Apps Script editor generate authorization. For an explicit manifest,
the recurring wake needs external request access; programmatic trigger
installation also needs script-app access:

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

The manual scanner/schema helpers additionally need
`https://www.googleapis.com/auth/spreadsheets.currentonly`.

## Failure and rollback

- Missing token, non-204 GitHub response, or overlap fails closed and records a
  coarse `p2wake:health` result without credentials or Sheet content.
- Workflow concurrency serializes overlapping cron/manual/Apps Script wakes.
- To pause the reliable wake, disable the `wakeIntelFastCycle` trigger. To
  uninstall it, delete that trigger and remove `GITHUB_DISPATCH_TOKEN` from
  Script Properties. The GitHub cron continues as fallback.
- A wake is not proof of processing. Confirm the GitHub run, Fast Cycle digest,
  Sheet decisions, Story_Queue, any commit/push, deployment, and live health as
  separate states.
