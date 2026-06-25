import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Users, ShieldCheck, Shield, UserPlus, Trash2, Crown, Wrench, LifeBuoy,
  PenSquare, Sparkles, KeySquare, Save, X, Search,
} from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, canAccess, type AdminSection } from "@/lib/admin-permissions";
import type { AppRole } from "@/lib/supabase-types";

// ============================================================
// Permission catalog (mirror admin-permissions sections)
// ============================================================
const PERMISSION_CATALOG: { key: AdminSection; label: string; group: string }[] = [
  // Overview
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "analytics", label: "Analytics", group: "Overview" },
  { key: "reports", label: "Reports", group: "Overview" },
  { key: "kpi", label: "KPI & Goals", group: "Overview" },
  { key: "notifications", label: "Notifications", group: "Overview" },
  { key: "activity", label: "Activity Log", group: "Overview" },
  // People
  { key: "customers", label: "Customers", group: "People" },
  { key: "users", label: "Staff & Users", group: "People" },
  // Sales
  { key: "leads", label: "Leads", group: "Sales" },
  { key: "orders", label: "Orders", group: "Sales" },
  { key: "payments", label: "Payments", group: "Sales" },
  { key: "wallets", label: "Wallets", group: "Sales" },
  { key: "invoices", label: "Invoices", group: "Sales" },
  { key: "quotations", label: "Quotations", group: "Sales" },
  { key: "coupons", label: "Coupons", group: "Sales" },
  { key: "refunds", label: "Refund Requests", group: "Sales" },
  // Catalog
  { key: "products", label: "Products", group: "Catalog" },
  { key: "categories", label: "Categories", group: "Catalog" },
  { key: "brands", label: "Brands", group: "Catalog" },
  { key: "service-packages", label: "Service Packages", group: "Catalog" },
  { key: "digital-files", label: "Digital Files", group: "Catalog" },
  { key: "license-keys", label: "License Keys", group: "Catalog" },
  // Content
  { key: "blog-management", label: "Blog", group: "Content" },
  { key: "portfolio", label: "Portfolio", group: "Content" },
  { key: "testimonials", label: "Testimonials", group: "Content" },
  { key: "faq", label: "FAQ", group: "Content" },
  { key: "media", label: "Media", group: "Content" },
  { key: "website-cms", label: "Website CMS", group: "Content" },
  // Marketing
  { key: "campaigns", label: "Email Campaigns", group: "Marketing" },
  { key: "newsletter", label: "Newsletter", group: "Marketing" },
  { key: "email-system", label: "Email System", group: "Marketing" },
  { key: "seo-panel", label: "SEO Panel", group: "Marketing" },
  // System
  { key: "settings", label: "Settings", group: "System" },
  { key: "security-audit", label: "Security Audit", group: "System" },
  { key: "backup", label: "Backup", group: "System" },
  { key: "staff-management", label: "Staff Management", group: "System" },
];

// Role → typical default permissions (read-only display reference)
const ROLE_DEFAULTS: Record<AppRole, AdminSection[]> = {
  super_admin: PERMISSION_CATALOG.map((p) => p.key),
  admin: PERMISSION_CATALOG.filter((p) => p.key !== "users" && p.key !== "staff-management").map((p) => p.key),
  manager: ["dashboard", "analytics", "reports", "leads", "orders", "payments", "wallets", "invoices", "quotations", "coupons", "refunds", "customers", "campaigns", "newsletter", "notifications", "kpi"],
  editor: ["dashboard", "products", "service-packages", "blog-management", "portfolio", "testimonials", "faq", "media", "website-cms", "seo-panel"],
  support: ["dashboard", "leads", "refunds", "customers", "notifications", "activity"],
};

const ROLE_META: Record<Exclude<AppRole, "super_admin">, { icon: any; color: string; tone: string }> = {
  admin:   { icon: Crown,     color: "from-purple-500/20 to-fuchsia-500/20", tone: "text-purple-300 border-purple-500/40" },
  manager: { icon: Wrench,    color: "from-amber-500/20 to-orange-500/20",   tone: "text-amber-300 border-amber-500/40" },
  support: { icon: LifeBuoy,  color: "from-sky-500/20 to-cyan-500/20",       tone: "text-sky-300 border-sky-500/40" },
  editor:  { icon: PenSquare, color: "from-teal-500/20 to-emerald-500/20",   tone: "text-teal-300 border-teal-500/40" },
};

type StaffRow = {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: AppRole[];
  custom_role_slugs: string[];
  created_at: string;
  last_sign_in_at: string | null;
};

type CustomRole = {
  id: string; slug: string; name: string; description: string | null;
  color: string; permissions: AdminSection[]; is_active: boolean; created_at: string;
};

// ============================================================
const AdminStaffManagement = () => {
  const { role: currentRole } = useAuth();
  const isSuper = currentRole === "super_admin";

  const [tab, setTab] = useState<AppRole | "custom" | "permissions">("admin");
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.rpc("admin_list_staff" as any),
      supabase.from("custom_roles" as any).select("*").order("created_at", { ascending: false }),
    ]);
    setStaff((s as any) || []);
    setCustomRoles((c as any) || []);
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  // ---- Filtering by tab ----
  const filteredStaff = useMemo(() => {
    let rows = staff;
    if (tab !== "custom" && tab !== "permissions") {
      rows = rows.filter((r) => r.roles.includes(tab as AppRole));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.email?.toLowerCase().includes(q) || r.full_name?.toLowerCase().includes(q));
    }
    return rows;
  }, [staff, tab, search]);

  // ---- Add staff ----
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "admin" as AppRole });
  const [saving, setSaving] = useState(false);

  const addStaff = async () => {
    if (!form.email || form.password.length < 6) {
      toast.error("সঠিক email ও কমপক্ষে ৬-অক্ষরের password দিন");
      return;
    }
    setSaving(true);
    try {
      const { data: su, error } = await supabase.auth.signUp({
        email: form.email.trim(), password: form.password,
        options: { data: { full_name: form.email.split("@")[0] } },
      });
      if (error) throw error;
      if (!su.user) throw new Error("Signup failed");
      const { error: rErr } = await supabase.from("user_roles")
        .insert({ user_id: su.user.id, role: form.role });
      if (rErr) throw rErr;
      toast.success(`${ROLE_LABELS[form.role]} যোগ করা হয়েছে`);
      setForm({ email: "", password: "", role: "admin" });
      setAddOpen(false);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || "যোগ করা যায়নি");
    } finally { setSaving(false); }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    if (!confirm(`এই user-এর ${ROLE_LABELS[role]} role সরিয়ে দিতে চান?`)) return;
    const { error } = await supabase.from("user_roles")
      .delete().eq("user_id", userId).eq("role", role);
    if (error) toast.error(error.message);
    else { toast.success("Role সরানো হয়েছে"); loadAll(); }
  };

  // ---- Custom roles ----
  const [crOpen, setCrOpen] = useState(false);
  const [crForm, setCrForm] = useState<{ id?: string; slug: string; name: string; description: string; permissions: AdminSection[]; is_active: boolean }>({
    slug: "", name: "", description: "", permissions: [], is_active: true,
  });

  const openNewCustom = () => { setCrForm({ slug: "", name: "", description: "", permissions: [], is_active: true }); setCrOpen(true); };
  const editCustom = (r: CustomRole) => {
    setCrForm({ id: r.id, slug: r.slug, name: r.name, description: r.description || "", permissions: r.permissions || [], is_active: r.is_active });
    setCrOpen(true);
  };
  const saveCustom = async () => {
    if (!crForm.slug || !crForm.name) { toast.error("Slug ও Name দিন"); return; }
    const payload = { slug: crForm.slug, name: crForm.name, description: crForm.description, permissions: crForm.permissions, is_active: crForm.is_active };
    const q = crForm.id
      ? supabase.from("custom_roles" as any).update(payload as any).eq("id", crForm.id)
      : supabase.from("custom_roles" as any).insert(payload as any);
    const { error } = await q;
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setCrOpen(false); loadAll(); }
  };
  const deleteCustom = async (id: string) => {
    if (!confirm("এই custom role delete করবেন?")) return;
    const { error } = await supabase.from("custom_roles" as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadAll(); }
  };

  // ---- Stats per role ----
  const countByRole = (r: AppRole) => staff.filter((s) => s.roles.includes(r)).length;

  return (
    <AdminPage>
      <AdminPageHeader
        title="User & Staff Management"
        subtitle="Admin, Manager, Support, Editor, Custom Roles ও Permission System"
        icon={Users}
        actions={
          isSuper && (
            <Button onClick={() => setAddOpen(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-1.5" /> Add Staff
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Admins" value={countByRole("admin")} icon={Crown} accent="violet" />
        <KpiCard label="Managers" value={countByRole("manager")} icon={Wrench} accent="amber" />
        <KpiCard label="Support" value={countByRole("support")} icon={LifeBuoy} accent="sky" />
        <KpiCard label="Editors" value={countByRole("editor")} icon={PenSquare} accent="emerald" />
        <KpiCard label="Custom Roles" value={customRoles.length} icon={Sparkles} accent="rose" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 w-full">
          <TabsTrigger value="admin"><Crown className="w-4 h-4 mr-1.5" />Admin</TabsTrigger>
          <TabsTrigger value="manager"><Wrench className="w-4 h-4 mr-1.5" />Manager</TabsTrigger>
          <TabsTrigger value="support"><LifeBuoy className="w-4 h-4 mr-1.5" />Support</TabsTrigger>
          <TabsTrigger value="editor"><PenSquare className="w-4 h-4 mr-1.5" />Editor</TabsTrigger>
          <TabsTrigger value="custom"><Sparkles className="w-4 h-4 mr-1.5" />Custom</TabsTrigger>
          <TabsTrigger value="permissions"><KeySquare className="w-4 h-4 mr-1.5" />Permissions</TabsTrigger>
        </TabsList>

        {/* ===== Role tabs (admin, manager, support, editor) ===== */}
        {(["admin", "manager", "support", "editor"] as const).map((r) => (
          <TabsContent key={r} value={r}>
            <RoleHeader role={r} count={countByRole(r)} defaults={ROLE_DEFAULTS[r]} />

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            <StaffTable
              loading={loading}
              rows={filteredStaff}
              isSuper={isSuper}
              onRemove={(uid) => removeRole(uid, r)}
              currentRoleTab={r}
            />
          </TabsContent>
        ))}

        {/* ===== Custom Roles ===== */}
        <TabsContent value="custom">
          <GlassCard className="p-6 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-fuchsia-400" /> Custom Roles</h3>
                <p className="text-sm text-muted-foreground mt-1">নিজস্ব role তৈরি করুন এবং specific permission set assign করুন।</p>
              </div>
              {isSuper && (
                <Button onClick={openNewCustom} size="sm"><UserPlus className="w-4 h-4 mr-1.5" />New Custom Role</Button>
              )}
            </div>
          </GlassCard>

          {customRoles.length === 0 ? (
            <GlassCard className="p-12 text-center text-sm text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              কোনো custom role নেই
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {customRoles.map((r) => (
                <GlassCard key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-foreground">{r.name}</h4>
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{r.slug}</code>
                        {!r.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                      </div>
                      {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {(r.permissions || []).length} permissions
                      </p>
                    </div>
                    {isSuper && (
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => editCustom(r)}><PenSquare className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-rose-400" onClick={() => deleteCustom(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== Permission System ===== */}
        <TabsContent value="permissions">
          <GlassCard className="p-6 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><KeySquare className="w-5 h-5 text-primary" /> Permission Matrix</h3>
            <p className="text-sm text-muted-foreground mt-1">প্রতিটি built-in role-এর জন্য কোন section accessible তা দেখুন।</p>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-card/40">
                    <th className="text-left p-3 sticky left-0 bg-card/60">Section</th>
                    {(["super_admin", "admin", "manager", "support", "editor"] as AppRole[]).map((r) => (
                      <th key={r} className="text-center p-3 whitespace-nowrap">{ROLE_LABELS[r]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    PERMISSION_CATALOG.reduce((acc, p) => {
                      (acc[p.group] = acc[p.group] || []).push(p); return acc;
                    }, {} as Record<string, typeof PERMISSION_CATALOG>)
                  ).map(([group, items]) => (
                    <>
                      <tr key={group} className="bg-primary/[0.04]">
                        <td colSpan={6} className="p-2 px-3 text-xs font-bold text-primary uppercase tracking-wider">{group}</td>
                      </tr>
                      {items.map((p) => (
                        <tr key={p.key} className="border-b border-border/20 hover:bg-card/30">
                          <td className="p-2.5 px-3 sticky left-0 bg-background/40">{p.label}</td>
                          {(["super_admin", "admin", "manager", "support", "editor"] as AppRole[]).map((r) => {
                            const ok = canAccess(r, p.key);
                            return (
                              <td key={r} className="text-center p-2.5">
                                {ok ? (
                                  <span className="inline-flex w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center text-xs">✓</span>
                                ) : (
                                  <span className="inline-flex w-5 h-5 rounded-full bg-rose-500/10 text-rose-500/60 items-center justify-center text-xs">·</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* ===== Add Staff dialog ===== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="কমপক্ষে ৬ অক্ষর" />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full mt-1 h-10 px-3 rounded-md bg-background border border-input text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
                <option value="editor">Editor</option>
                {isSuper && <option value="super_admin">Super Admin</option>}
              </select>
              <p className="text-xs text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[form.role]}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addStaff} disabled={saving}>
              {saving ? "Adding..." : <><UserPlus className="w-4 h-4 mr-1.5" />Create</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Custom Role dialog ===== */}
      <Dialog open={crOpen} onOpenChange={setCrOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{crForm.id ? "Edit" : "New"} Custom Role</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Slug</Label>
                <Input value={crForm.slug} onChange={(e) => setCrForm({ ...crForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "_") })} placeholder="content_reviewer" />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={crForm.name} onChange={(e) => setCrForm({ ...crForm, name: e.target.value })} placeholder="Content Reviewer" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={crForm.description} onChange={(e) => setCrForm({ ...crForm, description: e.target.value })} />
            </div>

            <div>
              <Label className="mb-2 block">Permissions ({crForm.permissions.length})</Label>
              <div className="border border-border/40 rounded-lg max-h-72 overflow-y-auto p-2 space-y-3">
                {Object.entries(
                  PERMISSION_CATALOG.reduce((acc, p) => {
                    (acc[p.group] = acc[p.group] || []).push(p); return acc;
                  }, {} as Record<string, typeof PERMISSION_CATALOG>)
                ).map(([group, items]) => (
                  <div key={group}>
                    <p className="text-xs font-bold text-primary uppercase mb-1.5 px-1">{group}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {items.map((p) => {
                        const on = crForm.permissions.includes(p.key);
                        return (
                          <label key={p.key} className="flex items-center gap-2 p-1.5 rounded hover:bg-primary/5 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...crForm.permissions, p.key]
                                  : crForm.permissions.filter((k) => k !== p.key);
                                setCrForm({ ...crForm, permissions: next });
                              }}
                            />
                            <span>{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Switch checked={crForm.is_active} onCheckedChange={(v) => setCrForm({ ...crForm, is_active: v })} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrOpen(false)}>Cancel</Button>
            <Button onClick={saveCustom}><Save className="w-4 h-4 mr-1.5" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
};

// ============================================================
// Sub-components
// ============================================================
const RoleHeader = ({ role, count, defaults }: { role: Exclude<AppRole, "super_admin">; count: number; defaults: AdminSection[] }) => {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <GlassCard className={`p-5 mb-4 bg-gradient-to-r ${meta.color}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-background/40 border ${meta.tone} flex items-center justify-center`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{ROLE_LABELS[role]}</h3>
            <Badge variant="outline" className={meta.tone}>{count} members</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[role]}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">{defaults.length} default permissions</p>
        </div>
      </div>
    </GlassCard>
  );
};

const StaffTable = ({
  loading, rows, isSuper, onRemove, currentRoleTab,
}: {
  loading: boolean; rows: StaffRow[]; isSuper: boolean;
  onRemove: (uid: string) => void; currentRoleTab: AppRole;
}) => {
  if (loading) return <GlassCard className="p-8 text-center text-sm text-muted-foreground">Loading…</GlassCard>;
  if (!rows.length) return (
    <GlassCard className="p-12 text-center text-sm text-muted-foreground">
      <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
      এই role-এ কেউ নেই
    </GlassCard>
  );

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-card/40 text-xs uppercase text-muted-foreground">
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Roles</th>
              <th className="text-left p-3 hidden md:table-cell">Joined</th>
              <th className="text-left p-3 hidden md:table-cell">Last Sign-in</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.user_id} className="border-b border-border/20 hover:bg-card/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 flex items-center justify-center text-sm font-bold">
                      {(u.full_name || u.email || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.full_name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">{ROLE_LABELS[r]}</Badge>
                    ))}
                    {u.custom_role_slugs?.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] border-fuchsia-500/40 text-fuchsia-300">{s}</Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                  {new Date(u.created_at).toLocaleDateString("bn-BD")}
                </td>
                <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("bn-BD") : "—"}
                </td>
                <td className="p-3 text-right">
                  {isSuper && currentRoleTab !== "super_admin" && (
                    <Button size="sm" variant="ghost" className="text-rose-400" onClick={() => onRemove(u.user_id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default AdminStaffManagement;
