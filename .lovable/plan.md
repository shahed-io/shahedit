# Customer Management — Implementation Plan

একটি unified Admin → **Customer Management** module তৈরি করব যেখানে নিচের ৮টা feature থাকবে।

## ১. নতুন/পুনর্ব্যবহৃত Database Tables

বিদ্যমান টেবিল ব্যবহার করব যেখানে সম্ভব:
- `profiles` + `auth.users` → Customer List-এর base
- `orders` → Purchase History
- `wallets` + `wallet_transactions` → Wallet (already exists)

নতুন টেবিল (migration):
- **`customer_reward_points`** — user_id, points balance, lifetime_earned
- **`reward_points_log`** — user_id, points, type (earn/redeem/adjust), reason, order_id, admin_id
- **`customer_login_history`** — user_id, ip, user_agent, device, browser, os, country, logged_in_at, session_id
- **`customer_devices`** — user_id, device_fingerprint, device_name, browser, os, last_seen, is_active, is_trusted
- **`customer_status`** — user_id (PK), is_blocked, blocked_reason, blocked_by, blocked_at
- **`customer_notes`** — user_id, note, admin_id, is_pinned, created_at

সব টেবিলে RLS + GRANT (admin only via `is_admin()`)। User নিজের wallet/rewards/history দেখতে পারবে।

## ২. Auth & Tracking Hooks

- `AuthContext.tsx` — successful sign-in হলে `customer_login_history` ও `customer_devices` upsert করার hook (browser/IP/UA capture)।
- Block check: login-এর পর `customer_status.is_blocked = true` হলে auto sign-out + Bengali message।

## ৩. Admin UI — `/ceo/customers`

নতুন page `src/pages/admin/AdminCustomers.tsx` — multi-tab layout:

```text
[ All Customers ] [ Blocked ] [ Top Spenders ] [ New This Month ]
─────────────────────────────────────────────────────────────
Search • Filter (role / status / date) • Export CSV
─────────────────────────────────────────────────────────────
Customer Cards (avatar, name, email, lifetime spent, wallet,
points, last login, status badge, "Manage" button)
```

**Customer Detail Drawer/Dialog** (tabs):
1. **Overview** — profile, contact, joined date, totals
2. **Purchase History** — orders list with invoice download, status, amount
3. **Wallet** — balance, transactions, admin credit/debit form (uses existing `wallet_apply_transaction` RPC)
4. **Reward Points** — balance, log, manual adjust (add/deduct with reason)
5. **Login History** — last 50 logins (IP, device, time, location)
6. **Active Devices** — list with "Revoke / Mark untrusted" actions
7. **Block / Unblock** — toggle with reason field, audit logged
8. **Notes** — admin-only notes, pin/edit/delete

## ৪. Permissions & Routing

- `admin-permissions.ts` → add `customers` section (super_admin + admin)
- `App.tsx` → lazy route `/ceo/customers`
- `AdminLayout.tsx` sidebar → "Customer Management" entry under People group

## ৫. Reward Points Automation

Order verified হলে (`status = in_progress` trigger) automatic points award — 1 point per ৳100 (configurable via `site_settings.reward_rate`). Existing `notify_order_change` trigger-এর পাশে নতুন trigger।

## ৬. Files to Create

- `supabase/migrations/...` (single migration with all new tables, RLS, GRANTs, triggers)
- `src/pages/admin/AdminCustomers.tsx` (main page)
- `src/components/admin/customers/CustomerDetailDialog.tsx` (8-tab dialog)
- `src/hooks/useCustomerMgmt.ts` (data hooks)
- Edits: `App.tsx`, `AdminLayout.tsx`, `admin-permissions.ts`, `AuthContext.tsx`

## ৭. Notes

- Country/geo lookup IP থেকে optional (free `ipapi.co` or skip)
- Device fingerprint = hash(UA + screen + tz) — lightweight, no external lib
- Block enforcement client + server (RLS on orders/payments will reject blocked users)

কনফার্ম করলে migration দিয়ে শুরু করব।
