import type { AppRole } from "./supabase-types";

/**
 * Admin panel section keys. Each route in /admin maps to one of these.
 */
export type AdminSection =
  | "dashboard"
  | "analytics"
  | "leads"
  | "refunds"
  | "payments"
  | "orders"
  | "custom-order"
  | "products"
  | "client-docs"
  | "services"
  | "service-packages"
  | "portfolio"
  | "blog"
  | "blog-categories"
  | "media"
  | "testimonials"
  | "team"
  | "clients"
  | "pricing"
  | "faq"
  | "careers"
  | "popular-searches"
  | "banners"
  | "welcome-popups"
  | "footer"
  | "ai-support"
  | "ai-writer"
  | "coupons"
  | "campaigns"
  | "seo"
  | "seo-tools"
  | "ranking-setup"
  | "sitemap"
  | "schema"
  | "redirects"
  | "settings"

  | "users"
  | "activity"
  | "projects"
  | "invoices"
  | "expenses"
  | "quotations"
  | "newsletter"
  | "knowledge-base"
  | "tech-details"
  | "wallets"
  | "notifications"
  | "kpi"
  | "task-board"
  | "backup"
  | "categories"
  | "brands"
  | "product-tags"
  | "digital-files"
  | "license-keys"
  | "bulk-products"
  | "customers"
  | "reports"
  | "website-cms"
  | "blog-management"
  | "reviews"
  | "seo-panel"
  | "security-audit";


/**
 * Permission matrix: which roles can access each admin section.
 * super_admin always has full access (handled in `canAccess`).
 */
const PERMISSIONS: Record<AdminSection, AppRole[]> = {
  dashboard:          ["super_admin", "admin", "manager", "editor"],
  analytics:          ["super_admin", "admin", "manager"],
  leads:              ["super_admin", "admin", "manager"],
  refunds:            ["super_admin", "admin", "manager"],
  payments:           ["super_admin", "admin", "manager"],
  orders:             ["super_admin", "admin", "manager"],
  products:           ["super_admin", "admin", "editor", "manager"],
  "client-docs":      ["super_admin", "admin", "manager"],
  services:           ["super_admin", "admin", "editor"],
  "service-packages": ["super_admin", "admin", "editor"],
  portfolio:          ["super_admin", "admin", "editor"],
  blog:               ["super_admin", "admin", "editor"],
  "blog-categories":  ["super_admin", "admin", "editor"],
  media:              ["super_admin", "admin", "editor", "manager"],
  testimonials:       ["super_admin", "admin", "editor"],
  team:               ["super_admin", "admin", "editor"],
  clients:            ["super_admin", "admin", "editor"],
  pricing:            ["super_admin", "admin", "editor"],
  faq:                ["super_admin", "admin", "editor"],
  careers:            ["super_admin", "admin", "editor"],
  "popular-searches": ["super_admin", "admin", "editor"],
  footer:             ["super_admin", "admin", "editor"],
  banners:            ["super_admin", "admin", "editor"],
  "welcome-popups":   ["super_admin", "admin", "editor"],
  "ai-support":       ["super_admin", "admin", "manager"],
  "ai-writer":        ["super_admin", "admin", "editor"],
  coupons:            ["super_admin", "admin", "manager"],
  campaigns:          ["super_admin", "admin", "manager"],
  seo:                ["super_admin", "admin", "editor"],
  "seo-tools":        ["super_admin", "admin", "editor"],
  "ranking-setup":    ["super_admin", "admin"],
  sitemap:            ["super_admin", "admin", "editor"],


  schema:             ["super_admin", "admin", "editor"],
  redirects:          ["super_admin", "admin"],
  settings:           ["super_admin", "admin"],
  users:              ["super_admin"],
  activity:           ["super_admin", "admin"],
  "custom-order":     ["super_admin", "admin", "manager"],
  projects:           ["super_admin", "admin", "manager"],
  invoices:           ["super_admin", "admin", "manager"],
  expenses:           ["super_admin", "admin"],
  quotations:         ["super_admin", "admin", "manager"],
  newsletter:         ["super_admin", "admin", "manager"],
  "knowledge-base":   ["super_admin", "admin", "editor"],
  "tech-details":     ["super_admin", "admin", "editor"],
  wallets:            ["super_admin", "admin", "manager"],
  notifications:      ["super_admin", "admin", "manager", "editor"],
  kpi:                ["super_admin", "admin", "manager"],
  "task-board":       ["super_admin", "admin", "manager", "editor"],
  backup:             ["super_admin"],
  categories:         ["super_admin", "admin", "editor"],
  brands:             ["super_admin", "admin", "editor"],
  "product-tags":     ["super_admin", "admin", "editor"],
  "digital-files":    ["super_admin", "admin"],
  "license-keys":     ["super_admin", "admin"],
  "bulk-products":    ["super_admin", "admin"],
  "security-audit":   ["super_admin", "admin"],
  customers:          ["super_admin", "admin", "manager"],
  reports:            ["super_admin", "admin", "manager"],
  "website-cms":      ["super_admin", "admin", "editor"],
  "blog-management":  ["super_admin", "admin", "editor"],
  reviews:            ["super_admin", "admin", "editor", "manager"],
  "seo-panel":        ["super_admin", "admin", "editor"],

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
