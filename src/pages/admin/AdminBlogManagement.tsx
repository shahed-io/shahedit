import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  FileText, FolderTree, Tag, MessageSquare, Search, Plus, Save,
  Trash2, ExternalLink, CheckCircle2, XCircle, Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^\w\u0980-\u09FF]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ============================================================
   POSTS TAB
   ============================================================ */
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_id: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  published_at: string | null;
  created_at: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
};

function PostsTab() {
  const [rows, setRows] = useState<Post[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("blog_posts").select("id,title,slug,excerpt,category_id,is_published,is_featured,published_at,created_at,meta_title,meta_description,og_image").order("created_at", { ascending: false }),
      supabase.from("blog_categories").select("id,name").order("name"),
    ]);
    setRows((p as Post[]) || []);
    setCats(c || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (filter === "published" && !r.is_published) return false;
      if (filter === "draft" && r.is_published) return false;
      if (q && !`${r.title} ${r.slug}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, filter]);

  const togglePublish = async (p: Post) => {
    const next = !p.is_published;
    const { error } = await supabase.from("blog_posts").update({
      is_published: next,
      published_at: next ? (p.published_at || new Date().toISOString()) : p.published_at,
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(next ? "Published" : "Moved to draft");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Blog Posts</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-full sm:w-64" placeholder="Search title or slug…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild><Link to="/ceo/blog"><Plus className="h-4 w-4 mr-1" /> New Post</Link></Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No posts yet</TableCell></TableRow>
                )}
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground truncate">/{p.slug}</div>
                    </TableCell>
                    <TableCell>{cats.find(c => c.id === p.category_id)?.name || "—"}</TableCell>
                    <TableCell>
                      {p.is_published
                        ? <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Published</Badge>
                        : <Badge variant="outline">Draft</Badge>}
                      {p.is_featured && <Badge className="ml-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Featured</Badge>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(p.published_at || p.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => togglePublish(p)}>
                        {p.is_published ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" asChild><Link to={`/blog/${p.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   GENERIC TAXONOMY TAB (Categories / Tags)
   ============================================================ */
type Taxon = { id: string; name: string; slug: string; description: string | null };

function TaxonomyTab({ table, label, icon: Icon }: { table: "blog_categories" | "blog_tags"; label: string; icon: any }) {
  const [rows, setRows] = useState<Taxon[]>([]);
  const [editing, setEditing] = useState<Partial<Taxon> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select("id,name,slug,description").order("name");
    setRows((data as Taxon[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [table]);

  const save = async () => {
    if (!editing?.name) return toast.error("Name required");
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      description: editing.description || null,
    };
    const { error } = editing.id
      ? await supabase.from(table).update(payload).eq("id", editing.id)
      : await supabase.from(table).insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(`Delete this ${label.toLowerCase()}?`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" /> {label}</CardTitle>
          <Button size="sm" onClick={() => setEditing({})}><Plus className="h-4 w-4 mr-1" /> New</Button>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-muted-foreground text-sm py-6 text-center">Loading…</div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">None yet</TableCell></TableRow>}
                  {rows.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.slug}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>Edit</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{editing?.id ? "Edit" : "New"} {label.slice(0, -1) || label}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {editing === null ? (
            <p className="text-sm text-muted-foreground">Select an item or click New to start.</p>
          ) : (
            <>
              <div><Label>Name</Label><Input value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></div>
              <div><Label>Slug</Label><Input value={editing.slug || ""} onChange={e => setEditing({ ...editing, slug: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button onClick={save} className="flex-1"><Save className="h-4 w-4 mr-1" /> Save</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   COMMENTS TAB
   ============================================================ */
type Comment = {
  id: string; post_id: string; author_name: string; author_email: string | null;
  content: string; status: "pending" | "approved" | "spam" | "trash"; created_at: string;
};

function CommentsTab() {
  const [rows, setRows] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"pending" | "approved" | "spam" | "trash" | "all">("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("blog_comments").select("*").order("created_at", { ascending: false }).limit(500);
    if (status !== "all") q = q.eq("status", status);
    const { data } = await q;
    const list = (data as Comment[]) || [];
    setRows(list);
    const ids = [...new Set(list.map(c => c.post_id))];
    if (ids.length) {
      const { data: p } = await supabase.from("blog_posts").select("id,title").in("id", ids);
      const map: Record<string, string> = {};
      (p || []).forEach((x: any) => { map[x.id] = x.title; });
      setPosts(map);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [status]);

  const setStatusFor = async (id: string, s: Comment["status"]) => {
    const { error } = await supabase.from("blog_comments").update({ status: s }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${s}`);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete permanently?")) return;
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments</CardTitle>
        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="trash">Trash</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? <div className="text-muted-foreground text-sm py-6 text-center">Loading…</div> : rows.length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center">No comments</div>
        ) : (
          <div className="space-y-3">
            {rows.map(c => (
              <div key={c.id} className="rounded-lg border p-3 bg-card/50">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{c.author_name} <span className="text-muted-foreground text-xs">· {c.author_email || "—"}</span></div>
                    <div className="text-xs text-muted-foreground">on <Link to={`/blog/${c.post_id}`} className="underline">{posts[c.post_id] || c.post_id.slice(0, 8)}</Link> · {new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant={c.status === "approved" ? "default" : c.status === "spam" ? "destructive" : "outline"}>{c.status}</Badge>
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{c.content}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.status !== "approved" && <Button size="sm" variant="outline" onClick={() => setStatusFor(c.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve</Button>}
                  {c.status !== "pending" && <Button size="sm" variant="outline" onClick={() => setStatusFor(c.id, "pending")}>Pending</Button>}
                  {c.status !== "spam" && <Button size="sm" variant="outline" onClick={() => setStatusFor(c.id, "spam")}>Spam</Button>}
                  {c.status !== "trash" && <Button size="sm" variant="outline" onClick={() => setStatusFor(c.id, "trash")}>Trash</Button>}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SEO TAB — per-post meta editor
   ============================================================ */
function SeoTab() {
  const [rows, setRows] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("blog_posts")
      .select("id,title,slug,excerpt,category_id,is_published,is_featured,published_at,created_at,meta_title,meta_description,og_image")
      .order("created_at", { ascending: false });
    setRows((data as Post[]) || []);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => !q || `${r.title} ${r.slug}`.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("blog_posts").update({
      meta_title: editing.meta_title,
      meta_description: editing.meta_description,
      og_image: editing.og_image,
    }).eq("id", editing.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("SEO updated");
    load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Posts</CardTitle>
          <Input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        </CardHeader>
        <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} onClick={() => setEditing(p)}
              className={`w-full text-left p-2 rounded-md text-sm hover:bg-muted/60 ${editing?.id === p.id ? "bg-muted" : ""}`}>
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {p.meta_title ? "✓ meta" : "no meta"} · {p.meta_description ? "✓ desc" : "no desc"}
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No posts</div>}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">SEO Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!editing ? (
            <p className="text-sm text-muted-foreground">Pick a post from the list to edit its SEO metadata.</p>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">Editing: <span className="text-foreground font-medium">{editing.title}</span></div>
              <div>
                <Label>Meta Title <span className="text-xs text-muted-foreground">({(editing.meta_title || "").length}/60)</span></Label>
                <Input value={editing.meta_title || ""} maxLength={70} onChange={e => setEditing({ ...editing, meta_title: e.target.value })} />
              </div>
              <div>
                <Label>Meta Description <span className="text-xs text-muted-foreground">({(editing.meta_description || "").length}/160)</span></Label>
                <Textarea rows={3} value={editing.meta_description || ""} maxLength={180} onChange={e => setEditing({ ...editing, meta_description: e.target.value })} />
              </div>
              <div>
                <Label>OG Image URL</Label>
                <Input value={editing.og_image || ""} placeholder="https://…" onChange={e => setEditing({ ...editing, og_image: e.target.value })} />
              </div>
              <div className="rounded-md border p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Search preview</div>
                <div className="text-blue-700 dark:text-blue-400 text-base truncate">{editing.meta_title || editing.title}</div>
                <div className="text-emerald-700 text-xs truncate">/blog/{editing.slug}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{editing.meta_description || editing.excerpt || ""}</div>
              </div>
              <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save SEO"}</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function AdminBlogManagement() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <p className="text-sm text-muted-foreground">Posts, categories, tags, comments and SEO — all in one place.</p>
      </div>
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="posts"><FileText className="h-4 w-4 mr-1" /> Blog</TabsTrigger>
          <TabsTrigger value="categories"><FolderTree className="h-4 w-4 mr-1" /> Categories</TabsTrigger>
          <TabsTrigger value="tags"><Tag className="h-4 w-4 mr-1" /> Tags</TabsTrigger>
          <TabsTrigger value="comments"><MessageSquare className="h-4 w-4 mr-1" /> Comments</TabsTrigger>
          <TabsTrigger value="seo"><Search className="h-4 w-4 mr-1" /> SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="posts"><PostsTab /></TabsContent>
        <TabsContent value="categories"><TaxonomyTab table="blog_categories" label="Categories" icon={FolderTree} /></TabsContent>
        <TabsContent value="tags"><TaxonomyTab table="blog_tags" label="Tags" icon={Tag} /></TabsContent>
        <TabsContent value="comments"><CommentsTab /></TabsContent>
        <TabsContent value="seo"><SeoTab /></TabsContent>
      </Tabs>
    </div>
  );
}
