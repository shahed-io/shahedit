import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderOpen, Trash2, Eye, Download, Search, Plus, X, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClientDocument {
  id: string; client_email: string; title: string; description: string | null;
  file_url: string; file_type: string; file_size: number | null;
  lead_id: string | null; is_visible: boolean; created_at: string;
}

function formatBytes(b: number | null) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
function fileIcon(type: string) {
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("zip")) return "📦";
  if (type.includes("word") || type.includes("document")) return "📝";
  return "📁";
}

export default function AdminClientDocuments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_email: "", title: "", description: "", lead_id: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["admin-client-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ClientDocument[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-client-docs"] }); toast.success("Document deleted"); },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from("client_documents").update({ is_visible: val }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-client-docs"] }),
  });

  const handleUpload = async () => {
    if (!selectedFile || !form.client_email || !form.title || !user) {
      toast.error("Email, Title এবং File দিন");
      return;
    }
    setUploading(true);
    const ext = selectedFile.name.split(".").pop();
    const path = `client-files/${Date.now()}-${selectedFile.name}`;
    const { error: upErr } = await supabase.storage.from("client-docs").upload(path, selectedFile);
    if (upErr) { toast.error("File upload failed: " + upErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("client-docs").getPublicUrl(path);

    const { error: dbErr } = await supabase.from("client_documents").insert({
      client_email: form.client_email.toLowerCase().trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      file_url: urlData.publicUrl,
      file_type: selectedFile.type || ext || "document",
      file_size: selectedFile.size,
      uploaded_by: user.id,
      lead_id: form.lead_id || null,
      is_visible: true,
    });
    setUploading(false);
    if (dbErr) { toast.error("DB error: " + dbErr.message); return; }
    toast.success("Document শেয়ার করা হয়েছে ✅");
    qc.invalidateQueries({ queryKey: ["admin-client-docs"] });
    setShowModal(false);
    setForm({ client_email: "", title: "", description: "", lead_id: "" });
    setSelectedFile(null);
  };

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.client_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderOpen size={20} className="text-purple-400" /> Client Documents
            </h1>
            <p className="text-slate-500 text-sm mt-1">Clients-দের সাথে files ও documents শেয়ার করুন</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)' }}>
            <Plus size={16} /> Document শেয়ার করুন
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Email বা title দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "মোট Documents", value: docs.length, color: "#a78bfa" },
            { label: "Visible", value: docs.filter(d => d.is_visible).length, color: "#34d399" },
            { label: "Hidden", value: docs.filter(d => !d.is_visible).length, color: "#f97316" },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={36} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500 text-sm">কোনো document নেই</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Document", "Client Email", "Size", "Visible", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => (
                  <motion.tr key={doc.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{fileIcon(doc.file_type)}</span>
                        <div>
                          <p className="font-medium text-white">{doc.title}</p>
                          {doc.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{doc.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{doc.client_email}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatBytes(doc.file_size)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleVisibility.mutate({ id: doc.id, val: !doc.is_visible })}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={doc.is_visible
                          ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                        {doc.is_visible ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {new Date(doc.created_at).toLocaleDateString("en-BD")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <a href={doc.file_url} target="_blank" rel="noreferrer"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                          <Eye size={13} />
                        </a>
                        <a href={doc.file_url} download
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                          <Download size={13} />
                        </a>
                        <button
                          onClick={() => { if (confirm("Delete করবেন?")) deleteMutation.mutate(doc.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Document শেয়ার করুন</h3>
                <button onClick={() => setShowModal(false)}
                  className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Client Email *</label>
                  <input value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                    placeholder="client@email.com" type="email"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-purple-500/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Document এর নাম"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-purple-500/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="কিছু বিবরণ (optional)" rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none resize-none focus:border-purple-500/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">File *</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center gap-2 text-center"
                    style={selectedFile ? {
                      borderColor: 'rgba(124,58,237,0.5)', background: 'rgba(124,58,237,0.05)'
                    } : { borderColor: 'rgba(71,85,105,0.6)', background: 'rgba(255,255,255,0.02)' }}>
                    <Upload size={20} className="text-slate-500" />
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-medium text-purple-400">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Click করে file বেছে নিন</p>
                    )}
                  </div>
                  <input ref={fileRef} type="file" className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.zip"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all">
                  বাতিল
                </button>
                <button onClick={handleUpload} disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)' }}>
                  {uploading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={14} /> শেয়ার করুন</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
