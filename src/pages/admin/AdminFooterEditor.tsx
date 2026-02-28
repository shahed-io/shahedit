import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus, Trash2, Pencil, Save, X, ChevronDown, ChevronRight,
  LayoutTemplate, Link as LinkIcon, GripVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FooterMenu {
  id: string;
  name: string;
  location: string;
}

interface MenuItem {
  id: string;
  menu_id: string;
  label: string;
  target: string | null;
  sort_order: number;
}

export default function AdminFooterEditor() {
  const qc = useQueryClient();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ label: "", target: "" });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingMenu, setEditingMenu] = useState<{ id: string; name: string } | null>(null);

  // Fetch footer menus
  const { data: menus = [] } = useQuery<FooterMenu[]>({
    queryKey: ["footer-menus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_menus")
        .select("*")
        .eq("location", "footer")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all menu items for footer menus
  const { data: allItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["footer-menu-items"],
    queryFn: async () => {
      if (menus.length === 0) return [];
      const menuIds = menus.map(m => m.id);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .in("menu_id", menuIds)
        .is("parent_id", null)
        .order("sort_order");
      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: menus.length > 0,
  });

  // Add new column (menu)
  const addColumn = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("cms_menus").insert({ name, location: "footer" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["footer-menus"] });
      setNewColumnName("");
      toast.success("কলাম যোগ হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Delete column
  const deleteColumn = useMutation({
    mutationFn: async (menuId: string) => {
      // Delete items first
      await supabase.from("menu_items").delete().eq("menu_id", menuId);
      const { error } = await supabase.from("cms_menus").delete().eq("id", menuId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["footer-menus"] });
      qc.invalidateQueries({ queryKey: ["footer-menu-items"] });
      toast.success("কলাম মুছে ফেলা হয়েছে");
    },
  });

  // Rename column
  const renameColumn = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("cms_menus").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["footer-menus"] });
      setEditingMenu(null);
      toast.success("কলামের নাম পরিবর্তন হয়েছে");
    },
  });

  // Add item
  const addItem = useMutation({
    mutationFn: async ({ menuId, label, target }: { menuId: string; label: string; target: string }) => {
      const existing = allItems.filter(i => i.menu_id === menuId);
      const { error } = await supabase.from("menu_items").insert({
        menu_id: menuId,
        label,
        target: target || null,
        sort_order: existing.length,
        item_type: "url",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["footer-menu-items"] });
      setAddingItemFor(null);
      setNewItem({ label: "", target: "" });
      toast.success("লিংক যোগ হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Update item
  const updateItem = useMutation({
    mutationFn: async ({ id, label, target }: { id: string; label: string; target: string }) => {
      const { error } = await supabase.from("menu_items").update({ label, target: target || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["footer-menu-items"] });
      setEditingItem(null);
      toast.success("লিংক আপডেট হয়েছে");
    },
  });

  // Delete item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["footer-menu-items"] });
      toast.success("লিংক মুছে ফেলা হয়েছে");
    },
  });

  const itemsForMenu = (menuId: string) => allItems.filter(i => i.menu_id === menuId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">ফুটার কাস্টমাইজার</h1>
          <p className="text-slate-400 text-sm mt-1">ফুটারের কলাম ও লিংক যোগ, এডিট বা মুছে ফেলুন</p>
        </div>
        <a href="/" target="_blank" className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
          ফুটার দেখুন →
        </a>
      </div>

      {/* Add new column */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <LayoutTemplate size={15} className="text-purple-400" /> নতুন কলাম যোগ করুন
        </h2>
        <div className="flex gap-2">
          <Input
            value={newColumnName}
            onChange={e => setNewColumnName(e.target.value)}
            placeholder="কলামের নাম যেমন: Services, Company..."
            className="bg-slate-800 border-slate-700 text-white"
            onKeyDown={e => e.key === "Enter" && newColumnName.trim() && addColumn.mutate(newColumnName.trim())}
          />
          <Button
            onClick={() => newColumnName.trim() && addColumn.mutate(newColumnName.trim())}
            disabled={!newColumnName.trim() || addColumn.isPending}
            className="bg-purple-600 hover:bg-purple-500 text-white shrink-0"
          >
            <Plus size={15} className="mr-1" /> যোগ করুন
          </Button>
        </div>
      </div>

      {/* Columns */}
      <div className="space-y-3">
        {menus.length === 0 && (
          <div className="text-center py-14 text-slate-500 text-sm">
            কোনো ফুটার কলাম নেই। উপরে "নতুন কলাম যোগ করুন" থেকে শুরু করুন।
          </div>
        )}
        {menus.map(menu => {
          const items = itemsForMenu(menu.id);
          const isExpanded = expandedMenu === menu.id;

          return (
            <div key={menu.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Column header */}
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={() => setExpandedMenu(isExpanded ? null : menu.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                    <LayoutTemplate size={15} className="text-purple-400" />
                  </div>
                  <div>
                    {editingMenu?.id === menu.id ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Input
                          value={editingMenu.name}
                          onChange={e => setEditingMenu({ ...editingMenu, name: e.target.value })}
                          className="h-7 text-sm bg-slate-800 border-slate-600 text-white w-40"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === "Enter") renameColumn.mutate({ id: menu.id, name: editingMenu.name });
                            if (e.key === "Escape") setEditingMenu(null);
                          }}
                        />
                        <button onClick={() => renameColumn.mutate({ id: menu.id, name: editingMenu.name })}
                          className="text-green-400 hover:text-green-300"><Save size={14} /></button>
                        <button onClick={() => setEditingMenu(null)}
                          className="text-slate-400 hover:text-white"><X size={14} /></button>
                      </div>
                    ) : (
                      <p className="text-white font-semibold">{menu.name}</p>
                    )}
                    <p className="text-slate-500 text-xs">{items.length} টি লিংক</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => setEditingMenu({ id: menu.id, name: menu.name })}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="নাম পরিবর্তন"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => { if (confirm("এই কলাম এবং সব লিংক মুছে ফেলতে চান?")) deleteColumn.mutate(menu.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                  {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-800"
                  >
                    <div className="p-4 space-y-2">
                      {/* Link list */}
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 group">
                          <GripVertical size={14} className="text-slate-600 shrink-0" />
                          {editingItem?.id === item.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingItem.label}
                                onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                placeholder="লেবেল"
                                className="h-8 text-xs bg-slate-800 border-slate-600 text-white flex-1"
                              />
                              <Input
                                value={editingItem.target ?? ""}
                                onChange={e => setEditingItem({ ...editingItem, target: e.target.value })}
                                placeholder="/link"
                                className="h-8 text-xs bg-slate-800 border-slate-600 text-white flex-1"
                              />
                              <button onClick={() => updateItem.mutate({ id: editingItem.id, label: editingItem.label, target: editingItem.target ?? "" })}
                                className="text-green-400 hover:text-green-300 shrink-0"><Save size={14} /></button>
                              <button onClick={() => setEditingItem(null)}
                                className="text-slate-400 hover:text-white shrink-0"><X size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1 py-2 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                              <LinkIcon size={12} className="text-slate-500 shrink-0" />
                              <span className="text-white text-sm flex-1">{item.label}</span>
                              <span className="text-slate-500 text-xs truncate max-w-[120px]">{item.target}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button onClick={() => setEditingItem(item)}
                                  className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors"><Pencil size={12} /></button>
                                <button onClick={() => { if (confirm("এই লিংকটি মুছে ফেলতে চান?")) deleteItem.mutate(item.id); }}
                                  className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add item form */}
                      {addingItemFor === menu.id ? (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              value={newItem.label}
                              onChange={e => setNewItem(n => ({ ...n, label: e.target.value }))}
                              placeholder="লেবেল (যেমন: About Us)"
                              className="h-8 text-xs bg-slate-900 border-slate-600 text-white"
                              autoFocus
                            />
                            <Input
                              value={newItem.target}
                              onChange={e => setNewItem(n => ({ ...n, target: e.target.value }))}
                              placeholder="লিংক (যেমন: /about)"
                              className="h-8 text-xs bg-slate-900 border-slate-600 text-white"
                              onKeyDown={e => e.key === "Enter" && newItem.label.trim() && addItem.mutate({ menuId: menu.id, ...newItem })}
                            />
                          </div>
                          <button
                            onClick={() => newItem.label.trim() && addItem.mutate({ menuId: menu.id, ...newItem })}
                            className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg shrink-0 transition-colors"
                          ><Save size={14} /></button>
                          <button
                            onClick={() => { setAddingItemFor(null); setNewItem({ label: "", target: "" }); }}
                            className="p-1.5 bg-slate-700 text-slate-400 hover:text-white rounded-lg shrink-0 transition-colors"
                          ><X size={14} /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingItemFor(menu.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-purple-400 hover:border-purple-500/50 transition-all text-sm mt-1"
                        >
                          <Plus size={14} /> লিংক যোগ করুন
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Preview note */}
      <div className="rounded-xl p-4 text-xs text-slate-500 text-center"
        style={{ background: "rgba(139,92,246,0.05)", border: "1px dashed rgba(139,92,246,0.2)" }}>
        💡 এখানে করা পরিবর্তন সাথে সাথে ওয়েবসাইটের ফুটারে দেখা যাবে
      </div>
    </div>
  );
}
