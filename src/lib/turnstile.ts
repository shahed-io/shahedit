// Cloudflare Turnstile configuration
// NOTE: The site key is a PUBLIC key — safe to keep in the codebase.
// Replace with your real key from Cloudflare Dashboard → Turnstile.
// "1x00000000000000000000AA" is Cloudflare's always-pass TEST key.
export const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ||
  "1x00000000000000000000AA";

export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
