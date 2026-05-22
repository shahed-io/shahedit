import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save, Plus, Trash2, GripVertical, Eye, EyeOff, Loader2,
  HelpCircle, ChevronDown, Pencil, Sparkles,
} from "lucide-react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
};

type SectionContent = {
  badge: string;
  title_prefix: string;
  title_highlight: string;
  description: string;
  cta_text: string;
  cta_link: string;
};

const DEFAULT_CONTENT: SectionContent = {
  badge: "সচরাচর জিজ্ঞাসা",
  title_prefix: "আপনার",
  title_highlight: "প্রশ্নের উত্তর",
  description: "আমাদের সার্ভিস সম্পর্কে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাবেন।",
  cta_text: "সব প্রশ্ন দেখুন →",
  cta_link: "/faq",
};

export default function AdminFaqManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionPublished, setSectionPublished] = useState(true);
  const [content, setContent] = useState<SectionContent>(DEFAULT_CONTENT);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [sec, fq] = await Promise.all([
      supabase.from("page_sections").select("*").eq("section_key", "faq_section").maybeSingle(),
      supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
    ]);
    if (sec.data) {
      setSectionId(sec.data.id);
      setSectionPublished(sec.data.is_published);
      setContent({ ...DEFAULT_CONTENT, ...(sec.data.content as Partial<SectionContent>) });
    }
    if (fq.data) setFaqs(fq.data as FaqItem[]);
    setLoading(false);
  };

  const saveSection = async () => {
    setSaving(true);
    const payload = {
      section_key: "faq_section",
      label: "FAQ Section (Homepage)",
      content: content as any,
      is_published: sectionPublished,
    };
    const { error } = sectionId
      ? await supabase.from("page_sections").update(payload).eq("id", sectionId)
      : await supabase.from("page_sections").insert(payload);
    setSaving(false);
    if (error) return toast.error("Save failed: " + error.message);
    toast.success("Section content published live ✓");
    loadAll();
  };

  const newFaq = () => setEditing({
    id: "", question: "", answer: "", category: "General",
    sort_order: faqs.length, is_published: true,
  });

  const saveFaq = async () => {
    if (!editing) return;
    if (!editing.question.trim() || !editing.answer.trim()) {
      return toast.error("Question and answer required");
    }
    setSaving(true);
    const payload = {
      question: editing.question,
      answer: editing.answer,
      category: editing.category,
      sort_order: editing.sort_order,
      is_published: editing.is_published,
    };
    const { error } = editing.id
      ? await supabase.from("faqs").update(payload).eq("id", editing.id)
      : await supabase.from("faqs").insert(payload);
    setSaving(false);
    if (error) return toast.error("Save failed: " + error.message);
    toast.success(editing.id ? "FAQ updated ✓" : "FAQ added ✓");
    setEditing(null);
    loadAll();
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    loadAll();
  };

  const togglePublish = async (faq: FaqItem) => {
    const { error } = await supabase
      .from("faqs")
      .update({ is_published: !faq.is_published })
      .eq("id", faq.id);
    if (error) return toast.error(error.message);
    toast.success(faq.is_published ? "Unpublished" : "Published");
    loadAll();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= faqs.length) return;
    const a = faqs[idx], b = faqs[target];
    await Promise.all([
      supabase.from("faqs").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("faqs").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    loadAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles size={12} /> Live CMS
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="text-primary" /> FAQ Section Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            সকল কিছু edit করুন এবং সাথে সাথে publish করুন। Section header text + প্রশ্ন উত্তর সব এক জায়গায়।
          </p>
        </div>
      </div>

      <Tabs defaultValue="section" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="section">Section Text</TabsTrigger>
          <TabsTrigger value="items">FAQ Items ({faqs.length})</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        {/* SECTION TEXT */}
        <TabsContent value="section">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Section Header Content</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="published" className="text-sm">Show on site</Label>
                  <Switch id="published" checked={sectionPublished} onCheckedChange={setSectionPublished} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Badge Text</Label>
                  <Input value={content.badge} onChange={(e) => setContent({ ...content, badge: e.target.value })} />
                </div>
                <div>
                  <Label>Title (regular part)</Label>
                  <Input value={content.title_prefix} onChange={(e) => setContent({ ...content, title_prefix: e.target.value })} />
                </div>
                <div>
                  <Label>Title (gradient highlight)</Label>
                  <Input value={content.title_highlight} onChange={(e) => setContent({ ...content, title_highlight: e.target.value })} />
                </div>
                <div>
                  <Label>CTA Button Text</Label>
                  <Input value={content.cta_text} onChange={(e) => setContent({ ...content, cta_text: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea rows={3} value={content.description} onChange={(e) => setContent({ ...content, description: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>CTA Link</Label>
                  <Input value={content.cta_link} onChange={(e) => setContent({ ...content, cta_link: e.target.value })} />
                </div>
              </div>
              <Button onClick={saveSection} disabled={saving} className="w-full md:w-auto">
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                Publish Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ ITEMS */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">প্রশ্নগুলো sort করতে up/down arrow ব্যবহার করুন।</p>
            <Button onClick={newFaq}><Plus size={16} className="mr-2" /> Add FAQ</Button>
          </div>

          {editing && (
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle>{editing.id ? "Edit FAQ" : "New FAQ"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Question (Bengali)</Label>
                  <Input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} placeholder="আপনার প্রশ্ন এখানে লিখুন" />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea rows={4} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} placeholder="বিস্তারিত উত্তর..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="General / Payment / Support" />
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
                  <Label>Published</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveFaq} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                    Save & Publish
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {faqs.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">এখনো কোনো FAQ নেই। "Add FAQ" বাটনে click করে শুরু করুন।</CardContent></Card>
            )}
            {faqs.map((f, i) => (
              <Card key={f.id} className="hover:border-primary/30 transition">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => move(i, -1)} className="text-muted-foreground hover:text-primary text-xs">▲</button>
                    <GripVertical size={14} className="text-muted-foreground" />
                    <button onClick={() => move(i, 1)} className="text-muted-foreground hover:text-primary text-xs">▼</button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold truncate">{f.question}</span>
                      {f.category && <Badge variant="secondary" className="text-xs">{f.category}</Badge>}
                      {!f.is_published && <Badge variant="outline" className="text-xs">Draft</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{f.answer}</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-1">
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(f)} title={f.is_published ? "Unpublish" : "Publish"}>
                      {f.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(f)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteFaq(f.id)} className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LIVE PREVIEW */}
        <TabsContent value="preview">
          <Card>
            <CardContent className="py-12 px-4 md:px-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
                    <HelpCircle size={13} />
                    {content.badge}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {content.title_prefix} <span className="gradient-text">{content.title_highlight}</span>
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-sm">{content.description}</p>
                </div>
                <div className="space-y-3">
                  {faqs.filter(f => f.is_published).slice(0, 6).map((faq) => (
                    <div key={faq.id} className={`glossy-card rounded-2xl border overflow-hidden ${previewOpen === faq.id ? "border-primary/40" : "border-border"}`}>
                      <button onClick={() => setPreviewOpen(previewOpen === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-5 text-left">
                        <span className="font-semibold pr-4 text-sm md:text-base">{faq.question}</span>
                        <motion.div animate={{ rotate: previewOpen === faq.id ? 180 : 0 }}>
                          <ChevronDown size={18} className="text-primary" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {previewOpen === faq.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <div className="px-5 pb-5 text-muted-foreground text-sm border-t border-border/50 pt-3">{faq.answer}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <span className="text-primary text-sm">{content.cta_text}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
