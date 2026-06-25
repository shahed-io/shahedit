---
name: Welcome Popup System
description: DB-driven welcome popup modal with admin CRUD at /ceo/welcome-popups
type: feature
---
- Table: `welcome_popups` — title, subtitle, image_url, cta_label/link, bg/text/button colors, overlay_opacity, border_radius, is_active, starts_at/ends_at, targeting (all/home/specific), target_paths[], show_once, delay_seconds, priority.
- Admin page: `src/pages/admin/AdminWelcomePopups.tsx` (route `/ceo/welcome-popups`, section key `welcome-popups`).
- Public component: `src/components/WelcomePopup.tsx` mounted globally in `src/App.tsx`; skipped on `/ceo/*` routes.
- Image uploads go to `cms-media/welcome-popups/` bucket.
- Per-visitor "seen" state tracked in localStorage key `welcome_popup_seen` (id → timestamp). Admin has a "Reset Seen" button.
- Targeting paths support wildcard suffix `*` (e.g. `/product/*`).
