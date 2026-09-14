/**
 * WPB Fast Cycle wake-up — install only wakeIntelFastCycle as a 15-minute
 * time-driven trigger. GitHub Actions remains the sole processor.
 *
 * Required Script Property:
 *   GITHUB_DISPATCH_TOKEN — fine-grained token with Contents: write on only
 *                           BrokenFL/WPB_New_Construction.
 */

var FAST_WAKE_HANDLER = "wakeIntelFastCycle";
var FAST_WAKE_REPOSITORY = "BrokenFL/WPB_New_Construction";
var FAST_WAKE_EVENT_TYPE = "wpb-intel-scan";
var FAST_WAKE_HEALTH_PROPERTY = "p2wake:health";

function fastCycleWakeConfig(props) {
  var token = String(props.getProperty("GITHUB_DISPATCH_TOKEN") || "").trim();
  if (!token) throw new Error("GITHUB_DISPATCH_TOKEN is not configured");
  return {
    token: token,
    endpoint: "https://api.github.com/repos/" + FAST_WAKE_REPOSITORY + "/dispatches"
  };
}

function writeFastCycleWakeHealth(props, values) {
  var health = {
    status: values.status,
    last_attempt_at: values.last_attempt_at,
    last_success_at: values.last_success_at || null,
    response_code: values.response_code == null ? null : Number(values.response_code),
    error_code: values.error_code || null,
    repository: FAST_WAKE_REPOSITORY,
    event_type: FAST_WAKE_EVENT_TYPE
  };
  props.setProperty(FAST_WAKE_HEALTH_PROPERTY, JSON.stringify(health));
  return health;
}

function getFastCycleWakeHealth() {
  var raw = PropertiesService.getScriptProperties().getProperty(FAST_WAKE_HEALTH_PROPERTY);
  if (!raw) return { status: "never_run", repository: FAST_WAKE_REPOSITORY, event_type: FAST_WAKE_EVENT_TYPE };
  try { return JSON.parse(raw); } catch (e) { return { status: "health_corrupt", repository: FAST_WAKE_REPOSITORY, event_type: FAST_WAKE_EVENT_TYPE }; }
}

function wakeIntelFastCycle() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw new Error("Fast Cycle wake-up already in progress");
  var props = PropertiesService.getScriptProperties();
  var attemptedAt = new Date().toISOString();
  try {
    var config = fastCycleWakeConfig(props);
    var response = UrlFetchApp.fetch(config.endpoint, {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + config.token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      payload: JSON.stringify({
        event_type: FAST_WAKE_EVENT_TYPE,
        client_payload: {
          source: "apps-script-15-minute-wake",
          requested_at: attemptedAt
        }
      }),
      muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    if (code !== 204) {
      writeFastCycleWakeHealth(props, { status: "error", last_attempt_at: attemptedAt, response_code: code, error_code: "github_dispatch_rejected" });
      throw new Error("GitHub repository_dispatch failed with HTTP " + code);
    }
    writeFastCycleWakeHealth(props, { status: "ok", last_attempt_at: attemptedAt, last_success_at: attemptedAt, response_code: code, error_code: null });
    return { ok: true, response_code: code, repository: FAST_WAKE_REPOSITORY, event_type: FAST_WAKE_EVENT_TYPE };
  } catch (error) {
    if (getFastCycleWakeHealth().last_attempt_at !== attemptedAt) {
      writeFastCycleWakeHealth(props, { status: "error", last_attempt_at: attemptedAt, error_code: "configuration_or_runtime_error" });
    }
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function installFastCycleWakeupTrigger() {
  // Validate the secret exists before changing trigger state.
  fastCycleWakeConfig(PropertiesService.getScriptProperties());
  var existing = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === FAST_WAKE_HANDLER;
  });
  existing.forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });
  var trigger = ScriptApp.newTrigger(FAST_WAKE_HANDLER).timeBased().everyMinutes(15).create();
  return { installed: true, handler: FAST_WAKE_HANDLER, cadence_minutes: 15, replaced: existing.length, trigger_id: trigger.getUniqueId() };
}
