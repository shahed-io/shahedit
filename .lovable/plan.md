## Advanced Admin Tools Hub

A single new admin section `/ceo/advanced-tools` with tabbed access to all 20 features. Each tab is a focused panel — no separate routes — so the work ships fast and stays organized.

### What gets built

**AI Tools (1 edge function, 4 tabs)**
- New edge function `ai-admin-tools` using Lovable AI (`google/gemini-2.5-flash-lite`) with an `action` param:
  - `product_description` — generate Bengali/English product copy from title + features
  - `seo_meta` — generate meta title/description/keywords/OG for any page or product
  - `support_reply` — draft a polite Bengali support reply from a customer message
  - `email_writer` — draft marketing/transactional emails from a brief
- Each tab: input form → "Generate" → editable output → "Copy" / "Save to product" where applicable.

**Product Productivity (3 tabs)**
- **Bulk Price Update** — filter by category/brand, apply % or flat ৳ change (increase/decrease/set), preview affected rows, commit.
- **One-Click Duplicate** — pick a product, clone it (new slug `-copy`, `is_published=false`) including images/variants/tags.
- **Bulk License Import** — paste/upload CSV of license keys for a chosen package; reuses existing `license_keys` table.

**Operations & Monitoring (5 tabs)**
- **Activity Timeline** — unified feed merging `audit_logs`, `order_timeline`, `license_history` with filters.
- **Live Visitor Counter** — Realtime subscription on `analytics_events` from last 5 min; shows online sessions, current pages.
- **Real-time Sales Notification** — Realtime subscription on `orders` insert; toast + sound + persistent list in panel.
- **Error Log Viewer** — reads `audit_logs` filtered by error severity + an in-app `client_error_logs` table for frontend errors.
- **System Health Check** — runs checks: DB ping (count from `site_settings`), Auth (current user), Storage (bucket list), Edge function ping; green/red status cards.

**Admin UX (3 tabs)**
- **Dark Mode Admin** — toggle persisted to localStorage; applies `dark` class to admin layout. Already supported by Tailwind theme.
- **Keyboard Shortcuts** — global listener: `g d` dashboard, `g o` orders, `g p` products, `g c` customers, `/` focus search, `?` show cheatsheet modal. Active only on admin routes.
- **Drag & Drop Dashboard Widgets** — reorderable widget list saved to localStorage per user. Uses existing `@dnd-kit` if installed; otherwise simple up/down arrows fallback.

**Advanced Search (1 tab)**
- Single search box that queries orders (`order_number`, `customer_name`, `customer_email`), customers (`profiles.full_name`, email), invoices (`invoice_number`), licenses (`key_value`) in parallel. Results grouped by type with deep links.

**Developer Tools (4 tabs)**
- **QR Code Invoice** — already implemented in invoice PDF; this tab shows a live QR for any invoice number with download.
- **API Access** — new `api_tokens` table; admin generates a bearer token, lists/revokes; instructions for use against existing edge functions.
- **Webhook Support** — new `webhooks` table (url, event types, secret, is_active); admin CRUD. A small dispatcher edge function `webhook-dispatch` posts JSON with HMAC signature when called from triggers (initial wiring: order.created, order.status_changed, payment.verified).
- **Cron Job Manager** — lists existing `pg_cron` jobs (read-only from `cron.job` via RPC) plus toggle for app-side scheduled tasks.

**File Manager (1 tab)**
- Browse `cms-media`, `product-images`, `client-docs`, `digital-products` storage buckets. List/preview/upload/delete with confirmation. Folder navigation.

### Database changes (one migration)

- `client_error_logs` (message, stack, url, user_agent, user_id) — RLS: admin read, anyone insert.
- `api_tokens` (name, token_hash, prefix, last_used_at, revoked_at, created_by) — RLS: admin only.
- `webhooks` (name, url, secret, events text[], is_active, last_status, last_fired_at) — RLS: admin only.
- `webhook_deliveries` (webhook_id, event, payload, response_status, response_body, attempted_at) — RLS: admin only.
- `admin_dashboard_layout` (user_id, widgets jsonb) — RLS: user owns row.
- All tables include the standard GRANTs + `updated_at` triggers where applicable.

### Files to create

- `supabase/functions/ai-admin-tools/index.ts`
- `supabase/functions/webhook-dispatch/index.ts`
- `src/pages/admin/AdminAdvancedTools.tsx` (router/tabs shell)
- `src/components/admin/advanced/` — one component per tab (~20 small files)
- Route + nav entry in `App.tsx`, `AdminLayout.tsx`, `admin-permissions.ts`

### Scope notes

- Reuses existing tables wherever possible (orders, licenses, audit_logs, analytics_events, invoices, storage buckets).
- No third-party paid services; AI runs on Lovable AI Gateway (no extra key).
- Keyboard shortcuts, dark mode toggle and live counters are admin-scoped only — no impact on the public site.

Shall I proceed and build all 20 features as described?