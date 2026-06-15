// Canonical fallback for the site logo.
// IMPORTANT: This MUST match the user's currently uploaded logo in site_settings.logo_url.
// We do NOT use an old generic asset here — when the DB fetch fails or is slow, this
// is what the user sees, so it must be the real brand logo the owner uploaded.
// To change: upload via Admin → Site Logo, then update this URL to match.
export const SITE_LOGO_FALLBACK =
  "/__l5e/assets-v1/574660b3-29b8-44eb-b606-d649b33c7b5f/shahed-it-header-logo.png";
