type TurnstileWidgetOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (element: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | undefined;

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
  const widgetId = window.turnstile.render(slot, {
    sitekey: key,
    callback: (token) => {
      if (hidden) hidden.value = token;
    },
    "expired-callback": () => {
      if (hidden) hidden.value = "";
    },
    "error-callback": () => {
      if (hidden) hidden.value = "";
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
  return form.querySelector<HTMLInputElement>('input[name="turnstile_token"]')?.value || null;
}

export function resetTurnstile(form: HTMLFormElement) {
  const slot = form.querySelector<HTMLElement>("[data-turnstile-slot]");
  const hidden = form.querySelector<HTMLInputElement>('input[name="turnstile_token"]');
  if (hidden) hidden.value = "";
  const widgetId = slot?.dataset.turnstileWidgetId;
  if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
}
