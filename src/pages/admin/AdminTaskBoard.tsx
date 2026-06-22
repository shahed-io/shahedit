import { useEffect, useState } from "react";
import { Kanban, Plus, Calendar, User, Flag, X, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_name: string | null;
  due_date: string | null;
  project_id: string | null;
  sort_order: number;
  created_at: string;
};

const COLUMNS = [
  { id: "todo", label: "📥 To Do", color: "from-slate-500/20 to-slate-700/10 border-slate-500/30" },
  { id: "in_progress", label: "⚡ In Progress", color: "from-amber-500/20 to-amber-700/10 border-amber-500/30" },
  { id: "review", label: "👀 Review", color: "from-violet-500/20 to-violet-700/10 border-violet-500/30" },
  { id: "done", label: "✅ Done", color: "from-emerald-500/20 to-emerald-700/10 border-emerald-500/30" },
] as const;

const priorityColor = (p: string) => {
  if (p === "urgent") return "bg-rose-500/20 text-rose-400 border-rose-500/40";
  if (p === "high") return "bg-orange-500/20 text-orange-400 border-orange-500/40";
  if (p === "medium") return "bg-amber-500/20 text-amber-400 border-amber-500/40";
  return "bg-slate-500/20 text-slate-400 border-slate-500/40";
};

const AdminTaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", status: "todo", priority: "medium",
    assignee_name: "", due_date: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mgmt_tasks")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load tasks");
    setTasks((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title দিন");
    const { error } = await supabase.from("mgmt_tasks").insert({
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      assignee_name: form.assignee_name || null,
      due_date: form.due_date || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Task তৈরি হলো");
    setOpen(false);
    setForm({ title: "", description: "", status: "todo", priority: "medium", assignee_name: "", due_date: "" });
    load();
  };

  const moveTo = async (taskId: string, newStatus: string) => {
    setTasks((s) => s.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    const payload: any = { status: newStatus };
    if (newStatus === "done") payload.completed_at = new Date().toISOString();
    const { error } = await supabase.from("mgmt_tasks").update(payload).eq("id", taskId);
    if (error) { toast.error(error.message); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("mgmt_tasks").delete().eq("id", id);
    setTasks((s) => s.filter((t) => t.id !== id));
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Task Board (Kanban)"
        subtitle="Drag-and-drop দিয়ে কর্মীদের কাজ ম্যানেজ করুন"
        icon={Kanban}
        actions={
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> নতুন Task
          </Button>
        }
      />

      {loading ? (
        <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (draggingId) { moveTo(draggingId, col.id); setDraggingId(null); } }}
                className={`rounded-2xl border bg-gradient-to-br ${col.color} p-3 min-h-[400px]`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm">{col.label}</h3>
                  <span className="text-xs bg-background/40 px-2 py-0.5 rounded-full font-bold">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((t) => (
                    <GlassCard
                      key={t.id}
                      className="p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div
                        draggable
                        onDragStart={() => setDraggingId(t.id)}
                        onDragEnd={() => setDraggingId(null)}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                          <p className="text-sm font-semibold leading-tight flex-1">{t.title}</p>
                          <button onClick={() => remove(t.id)} className="text-muted-foreground/50 hover:text-rose-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {t.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 pl-5">{t.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pl-5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${priorityColor(t.priority)}`}>
                            <Flag className="w-2.5 h-2.5 inline mr-0.5" /> {t.priority}
                          </span>
                          {t.assignee_name && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-semibold">
                              <User className="w-2.5 h-2.5 inline mr-0.5" /> {t.assignee_name}
                            </span>
                          )}
                          {t.due_date && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-card border border-border font-semibold">
                              <Calendar className="w-2.5 h-2.5 inline mr-0.5" /> {new Date(t.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground/50">Drop tasks here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>নতুন Task</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="বিবরণ (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COLUMNS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Assignee name" value={form.assignee_name} onChange={(e) => setForm({ ...form, assignee_name: e.target.value })} />
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <Button onClick={create} className="w-full">Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
};

export default AdminTaskBoard;
