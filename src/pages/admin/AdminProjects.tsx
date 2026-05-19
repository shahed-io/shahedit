import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard, KpiCard } from "@/components/admin/ui";
import { Briefcase, Plus, Trash2, Edit2, Save, ListChecks, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const db = supabase as any;

const STATUS = ["planning", "in_progress", "on_hold", "completed", "cancelled"];
const PRIORITY = ["low", "medium", "high", "urgent"];
const TASK_STATUS = ["todo", "in_progress", "review", "done"];

const STATUS_COLOR: Record<string, string> = {
  planning: "bg-sky-500/20 text-sky-300",
  in_progress: "bg-amber-500/20 text-amber-300",
  on_hold: "bg-slate-500/20 text-slate-300",
  completed: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-rose-500/20 text-rose-300",
};

const emptyForm = {
  name: "", client_name: "", client_email: "", client_phone: "", description: "",
  status: "planning", priority: "medium", budget: 0, progress: 0,
  start_date: "", deadline: "", notes: "",
};

export default function AdminProjects() {
  const [items, setItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [tasksFor, setTasksFor] = useState<any | null>(null);
  const [newTask, setNewTask] = useState({ title: "", assignee_name: "", due_date: "", priority: "medium", status: "todo" });

  const load = async () => {
    const { data } = await db.from("mgmt_projects").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  const loadTasks = async (project_id: string) => {
    const { data } = await db.from("mgmt_tasks").select("*").eq("project_id", project_id).order("created_at");
    setTasks(data ?? []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (tasksFor) loadTasks(tasksFor.id); }, [tasksFor]);

  const save = async () => {
    if (!form.name) return toast.error("Project name required");
    const payload = { ...form, start_date: form.start_date || null, deadline: form.deadline || null, budget: Number(form.budget) || 0, progress: Number(form.progress) || 0 };
    const { error } = editing
      ? await db.from("mgmt_projects").update(payload).eq("id", editing.id)
      : await db.from("mgmt_projects").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Project created");
    setEditing(null); setForm(emptyForm); setShowForm(false); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await db.from("mgmt_projects").delete().eq("id", id); load();
  };
  const addTask = async () => {
    if (!newTask.title || !tasksFor) return;
    await db.from("mgmt_tasks").insert({ ...newTask, project_id: tasksFor.id, due_date: newTask.due_date || null });
    setNewTask({ title: "", assignee_name: "", due_date: "", priority: "medium", status: "todo" });
    loadTasks(tasksFor.id);
  };
  const updateTask = async (id: string, patch: any) => {
    await db.from("mgmt_tasks").update(patch).eq("id", id);
    if (tasksFor) loadTasks(tasksFor.id);
  };
  const delTask = async (id: string) => {
    await db.from("mgmt_tasks").delete().eq("id", id);
    if (tasksFor) loadTasks(tasksFor.id);
  };

  const stats = {
    total: items.length,
    active: items.filter(i => i.status === "in_progress").length,
    done: items.filter(i => i.status === "completed").length,
    budget: items.reduce((s, i) => s + Number(i.budget || 0), 0),
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Projects & Tasks"
        subtitle="Client project tracking with kanban-style tasks"
        icon={Briefcase}
        actions={<Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />New Project</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total" value={stats.total} icon={Briefcase} accent="violet" />
        <KpiCard label="Active" value={stats.active} icon={ListChecks} accent="amber" />
        <KpiCard label="Completed" value={stats.done} icon={ListChecks} accent="emerald" />
        <KpiCard label="Total Budget" value={`৳${stats.budget.toLocaleString()}`} icon={Calendar} accent="magenta" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <GlassCard key={p.id} hover className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground font-syne">{p.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>{p.status}</span>
            </div>
            {p.client_name && <p className="text-xs text-muted-foreground mb-2">👤 {p.client_name}</p>}
            {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progress</span><span>{p.progress}%</span></div>
              <Progress value={p.progress} className="h-1.5" />
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mb-3">
              <span className="px-2 py-0.5 bg-primary/10 rounded">{p.priority}</span>
              {p.budget > 0 && <span>৳{Number(p.budget).toLocaleString()}</span>}
              {p.deadline && <span>⏰ {new Date(p.deadline).toLocaleDateString()}</span>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setTasksFor(p)}><ListChecks className="w-3 h-3 mr-1" />Tasks</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(p); setForm({ ...emptyForm, ...p, start_date: p.start_date ?? "", deadline: p.deadline ?? "" }); setShowForm(true); }}><Edit2 className="w-3 h-3" /></Button>
              <Button size="sm" variant="outline" onClick={() => del(p.id)} className="text-rose-400 border-rose-400/30"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </GlassCard>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-8">No projects yet</p>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <Input className="md:col-span-2" placeholder="Project name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Client name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            <Input placeholder="Client email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
            <Input placeholder="Client phone" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
            <Input type="number" placeholder="Budget (BDT)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITY.map(s => <option key={s}>{s}</option>)}
            </select>
            <Input type="date" placeholder="Start date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input type="date" placeholder="Deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <Input type="number" min={0} max={100} placeholder="Progress %" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
            <Textarea className="md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea className="md:col-span-2" placeholder="Internal notes" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Button className="md:col-span-2" onClick={save}><Save className="w-4 h-4 mr-2" />{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tasksFor} onOpenChange={(o) => !o && setTasksFor(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tasks — {tasksFor?.name}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-5 gap-2 mb-4">
            <Input className="md:col-span-2" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <Input placeholder="Assignee" value={newTask.assignee_name} onChange={(e) => setNewTask({ ...newTask, assignee_name: e.target.value })} />
            <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
            <Button onClick={addTask}><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            {TASK_STATUS.map(s => (
              <div key={s} className="bg-primary/5 rounded-lg p-2 min-h-[200px]">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-1">{s}</h4>
                {tasks.filter(t => t.status === s).map(t => (
                  <div key={t.id} className="bg-background/80 border border-primary/15 rounded-md p-2 mb-2 text-xs">
                    <div className="flex justify-between gap-1">
                      <p className="font-medium flex-1">{t.title}</p>
                      <button onClick={() => delTask(t.id)} className="text-rose-400"><X className="w-3 h-3" /></button>
                    </div>
                    {t.assignee_name && <p className="text-muted-foreground text-[10px] mt-1">👤 {t.assignee_name}</p>}
                    {t.due_date && <p className="text-muted-foreground text-[10px]">⏰ {new Date(t.due_date).toLocaleDateString()}</p>}
                    <select className="w-full mt-1 bg-background border border-input rounded text-[10px] px-1 py-0.5" value={t.status} onChange={(e) => updateTask(t.id, { status: e.target.value })}>
                      {TASK_STATUS.map(x => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
