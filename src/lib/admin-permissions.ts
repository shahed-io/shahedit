import type { AppRole } from "./supabase-types";

/**
 * Admin panel section keys. Each route in /admin maps to one of these.
 */
export type AdminSection =
  | "dashboard"
  | "analytics"
  | "leads"
  | "payments"
  | "orders"
  | "client-docs"
  | "services"
  | "service-packages"
  | "portfolio"
  | "blog"
  | "testimonials"
  | "team"
  | "clients"
  | "pricing"
  | "faq"
  | "careers"
  | "popular-searches"
  | "footer"
  | "ai-support"
  | "ai-writer"
  | "coupons"
  | "campaigns"
  | "seo"
  | "sitemap"
  | "schema"
  | "redirects"
  | "settings"
  | "users"
  | "activity";

/**
 * Permission matrix: which roles can access each admin section.
 * super_admin always has full access (handled in `canAccess`).
 */
const PERMISSIONS: Record<AdminSection, AppRole[]> = {
  dashboard:          ["super_admin", "admin", "manager", "editor"],
  analytics:          ["super_admin", "admin", "manager"],
  leads:              ["super_admin", "admin", "manager"],
  payments:           ["super_admin", "admin", "manager"],
  orders:             ["super_admin", "admin", "manager"],
  "client-docs":      ["super_admin", "admin", "manager"],
  services:           ["super_admin", "admin", "editor"],
  "service-packages": ["super_admin", "admin", "editor"],
  portfolio:          ["super_admin", "admin", "editor"],
  blog:               ["super_admin", "admin", "editor"],
  testimonials:       ["super_admin", "admin", "editor"],
  team:               ["super_admin", "admin", "editor"],
  clients:            ["super_admin", "admin", "editor"],
  pricing:            ["super_admin", "admin", "editor"],
  faq:                ["super_admin", "admin", "editor"],
  careers:            ["super_admin", "admin", "editor"],
  "popular-searches": ["super_admin", "admin", "editor"],
  footer:             ["super_admin", "admin", "editor"],
  "ai-support":       ["super_admin", "admin", "manager"],
  "ai-writer":        ["super_admin", "admin", "editor"],
  coupons:            ["super_admin", "admin", "manager"],
  campaigns:          ["super_admin", "admin", "manager"],
  seo:                ["super_admin", "admin", "editor"],
  sitemap:            ["super_admin", "admin", "editor"],
  schema:             ["super_admin", "admin", "editor"],
  redirects:          ["super_admin", "admin"],
  settings:           ["super_admin", "admin"],
  users:              ["super_admin"],
  activity:           ["super_admin", "admin"],
};

export function canAccess(role: AppRole | null, section: AdminSection): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;
  return PERMISSIONS[section]?.includes(role) ?? false;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  editor: "Editor",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "সম্পূর্ণ অ্যাক্সেস — ইউজার ম্যানেজমেন্ট সহ সব কিছু",
  admin: "প্রায় সব ফিচার — শুধু User Management ছাড়া",
  manager: "অর্ডার, লিড, পেমেন্ট, ক্যাম্পেইন ও অ্যানালিটিক্স",
  editor: "কনটেন্ট ও SEO — ব্লগ, পোর্টফোলিও, সার্ভিস ইত্যাদি",
};
