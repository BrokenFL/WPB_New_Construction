type TurnstileWidgetOptions = {
  sitekey: string;
  /** Only show the widget when interaction is required; stay invisible on clean passes. */
  appearance?: "always" | "execute" | "interaction-only";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (element: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId: string) => void;
  execute: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | undefined;

/** Pending token waiters per widget id, resolved by the render callback. */
const pendingTokenResolvers = new Map<string, Array<(token: string) => void>>();

function resolvePendingToken(widgetId: string, token: string) {
  const resolvers = pendingTokenResolvers.get(widgetId);
  if (!resolvers) return;
  pendingTokenResolvers.delete(widgetId);
  resolvers.forEach((resolve) => resolve(token));
}

function siteKey() {
  return String(import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "").trim();
}

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-wpb-turnstile]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.wpbTurnstile = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load")), { once: true });
    document.head.append(script);
  });
  return scriptPromise;
}

export async function prepareTurnstile(form: HTMLFormElement) {
  const key = siteKey();
  const slot = form.querySelector<HTMLElement>("[data-turnstile-slot]");
  if (!key || !slot || slot.dataset.turnstileWidgetId) return;
  await loadScript();
  if (!window.turnstile) throw new Error("Turnstile is unavailable");
  const hidden = form.querySelector<HTMLInputElement>('input[name="turnstile_token"]');
  let widgetId = "";
  widgetId = window.turnstile.render(slot, {
    sitekey: key,
    appearance: "interaction-only",
    callback: (token) => {
      if (hidden) hidden.value = token;
      resolvePendingToken(widgetId, token);
    },
    "expired-callback": () => {
      if (hidden) hidden.value = "";
    },
    "error-callback": () => {
      if (hidden) hidden.value = "";
      resolvePendingToken(widgetId, "");
    },
  });
  slot.dataset.turnstileWidgetId = widgetId;
}

export async function getTurnstileToken(form: HTMLFormElement) {
  if (!siteKey() && import.meta.env.DEV) return "";
  try {
    await prepareTurnstile(form);
  } catch {
    return null;
  }
  const slot = form.querySelector<HTMLElement>("[data-turnstile-slot]");
  const hidden = form.querySelector<HTMLInputElement>('input[name="turnstile_token"]');
  if (hidden?.value) return hidden.value;
  const widgetId = slot?.dataset.turnstileWidgetId;
  if (!window.turnstile || !widgetId) return null;
  // No token yet: run the challenge now instead of failing the submit.
  // Clean visitors pass invisibly; challenged visitors see the widget in the slot.
  const status = form.querySelector<HTMLElement>(".form-status");
  const priorStatus = status?.textContent ?? "";
  if (status) status.textContent = "Checking spam protection…";
  try {
    const token = await new Promise<string>((resolve) => {
      const resolvers = pendingTokenResolvers.get(widgetId) ?? [];
      resolvers.push(resolve);
      pendingTokenResolvers.set(widgetId, resolvers);
      try {
        window.turnstile!.execute(widgetId);
      } catch {
        resolve("");
      }
      window.setTimeout(() => resolve(""), 120000);
    });
    pendingTokenResolvers.delete(widgetId);
    if (hidden) hidden.value = token;
    return token || null;
  } finally {
    if (status && status.textContent === "Checking spam protection…") status.textContent = priorStatus;
  }
}

export function resetTurnstile(form: HTMLFormElement) {
  const slot = form.querySelector<HTMLElement>("[data-turnstile-slot]");
  const hidden = form.querySelector<HTMLInputElement>('input[name="turnstile_token"]');
  if (hidden) hidden.value = "";
  const widgetId = slot?.dataset.turnstileWidgetId;
  if (widgetId) pendingTokenResolvers.delete(widgetId);
  if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
}
