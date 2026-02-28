import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const createCrudPage = (tableName: string, displayName: string, fields: { key: string; label: string; type?: string }[]) => {
  return function CrudPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Record<string, any>>({});
    const [editing, setEditing] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchItems = async () => {
      setLoading(true);
      const { data } = await supabase.from(tableName as any).select("*").order("created_at", { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    };

    useEffect(() => { fetchItems(); }, []);

    const save = async () => {
      setSaving(true);
      if (editing) {
        const { error } = await supabase.from(tableName as any).update(form).eq("id", editing);
        if (error) toast.error(error.message); else toast.success("Updated!");
      } else {
        const { error } = await supabase.from(tableName as any).insert([form]);
        if (error) toast.error(error.message); else toast.success("Created!");
      }
      setSaving(false);
      setShowForm(false);
      setEditing(null);
      setForm({});
      fetchItems();
    };

    const remove = async (id: string) => {
      if (!confirm(`Delete this ${displayName}?`)) return;
      await supabase.from(tableName as any).delete().eq("id", id);
      toast.success("Deleted");
      fetchItems();
    };

    const primaryField = fields[0];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-slate-400 text-sm">{items.length} records</p>
          </div>
          <Button onClick={() => { setForm({}); setEditing(null); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-500 gap-2">
            <Plus size={15} /> Add {displayName}
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-white font-semibold mb-4">{editing ? `Edit ${displayName}` : `New ${displayName}`}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {fields.map(({ key, label, type }) => (
                <div key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
                  <Label className="text-slate-300 text-xs mb-1.5 block">{label}</Label>
                  {type === "textarea" ? (
                    <textarea value={form[key] ?? ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} rows={4}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
                  ) : type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                      <input type="checkbox" checked={form[key] ?? false} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} className="rounded" />
                      {label}
                    </label>
                  ) : (
                    <Input type={type || "text"} value={form[key] ?? ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white h-9" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-500">{saving ? "Saving..." : "Save"}</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="space-y-px">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-800/50 animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16"><p className="text-slate-500">No {displayName.toLowerCase()} yet.</p></div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-slate-800">{[primaryField.label, "Created", "Actions"].map(h => <th key={h} className="text-left text-slate-400 text-xs font-medium px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {items.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white text-sm font-medium">{item[primaryField.key]}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setForm(item); setEditing(item.id); setShowForm(true); }} className="h-7 w-7 text-slate-400 hover:text-blue-400"><Pencil size={13} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(item.id)} className="h-7 w-7 text-slate-400 hover:text-red-400"><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };
};

export const AdminPortfolio = createCrudPage("projects", "Project", [
  { key: "title", label: "Title *" },
  { key: "slug", label: "Slug" },
  { key: "client_name", label: "Client Name" },
  { key: "category", label: "Category" },
  { key: "image_url", label: "Image URL" },
  { key: "project_url", label: "Live URL" },
  { key: "short_description", label: "Short Description" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "is_published", label: "Published", type: "checkbox" },
  { key: "is_featured", label: "Featured", type: "checkbox" },
]);

export const AdminBlog = createCrudPage("blog_posts", "Blog Post", [
  { key: "title", label: "Title *" },
  { key: "slug", label: "Slug" },
  { key: "featured_image", label: "Featured Image URL" },
  { key: "excerpt", label: "Excerpt" },
  { key: "content", label: "Content", type: "textarea" },
  { key: "meta_title", label: "Meta Title" },
  { key: "meta_description", label: "Meta Description" },
  { key: "is_published", label: "Published", type: "checkbox" },
  { key: "is_featured", label: "Featured", type: "checkbox" },
]);

export const AdminTestimonials = createCrudPage("testimonials", "Testimonial", [
  { key: "client_name", label: "Client Name *" },
  { key: "client_title", label: "Title/Position" },
  { key: "client_company", label: "Company" },
  { key: "client_avatar", label: "Avatar URL" },
  { key: "content", label: "Testimonial Content", type: "textarea" },
  { key: "rating", label: "Rating (1-5)", type: "number" },
  { key: "is_published", label: "Published", type: "checkbox" },
]);

export const AdminTeam = createCrudPage("team_members", "Team Member", [
  { key: "name", label: "Name *" },
  { key: "role", label: "Role/Position *" },
  { key: "avatar_url", label: "Photo URL" },
  { key: "email", label: "Email" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "is_published", label: "Published", type: "checkbox" },
]);

export const AdminClients = createCrudPage("clients", "Client", [
  { key: "name", label: "Client Name *" },
  { key: "logo_url", label: "Logo URL" },
  { key: "website_url", label: "Website URL" },
  { key: "is_published", label: "Published", type: "checkbox" },
]);

export const AdminPricing = createCrudPage("pricing_plans", "Pricing Plan", [
  { key: "name", label: "Plan Name *" },
  { key: "description", label: "Description" },
  { key: "price_monthly", label: "Monthly Price (BDT)", type: "number" },
  { key: "price_yearly", label: "Yearly Price (BDT)", type: "number" },
  { key: "is_popular", label: "Mark as Popular", type: "checkbox" },
  { key: "is_published", label: "Published", type: "checkbox" },
]);

export const AdminFAQ = createCrudPage("faqs", "FAQ", [
  { key: "question", label: "Question *" },
  { key: "answer", label: "Answer", type: "textarea" },
  { key: "category", label: "Category" },
  { key: "sort_order", label: "Sort Order", type: "number" },
  { key: "is_published", label: "Published", type: "checkbox" },
]);

export const AdminCareers = createCrudPage("careers", "Career", [
  { key: "title", label: "Job Title *" },
  { key: "department", label: "Department" },
  { key: "location", label: "Location" },
  { key: "type", label: "Type (Full-time, Part-time)" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "deadline", label: "Application Deadline", type: "date" },
  { key: "is_published", label: "Published", type: "checkbox" },
]);
