import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminPageHeader, GlassCard } from "@/components/admin/ui";
import { Sparkles, Wand2, Copy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Mode = "blog" | "meta" | "social";

export default function AdminAIWriter() {
  const [mode, setMode] = useState<Mode>("blog");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState<"bn" | "en" | "mixed">("mixed");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return toast.error("Topic দিন");
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-content-writer", {
        body: { mode, topic, keywords, tone, language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutput(data?.text ?? "");
      toast.success("Generated!");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { navigator.clipboard.writeText(output); toast.success("Copied"); };

  const saveAsBlog = async () => {
    if (!output || mode !== "blog") return;
    const title = topic.slice(0, 100);
    const slug = title.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("blog_posts").insert({
      title, slug, content: output, excerpt: output.slice(0, 160).replace(/<[^>]+>/g, ""),
      tags: keywords.split(",").map(s => s.trim()).filter(Boolean),
      meta_title: title, meta_description: output.slice(0, 160).replace(/<[^>]+>/g, ""),
      is_published: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Draft saved to Blog Posts");
  };

  return (
    <AdminPage>
      <AdminPageHeader title="AI Content Writer" subtitle="Lovable AI দিয়ে blog, meta description ও social posts generate করুন" icon={Sparkles} />

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-amber-100 mb-4">Generate</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-amber-300/70 mb-1 block">Type</label>
              <div className="flex gap-2">
                {(["blog", "meta", "social"] as Mode[]).map((m) => (
                  <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="flex-1">
                    {m === "blog" ? "Blog Post" : m === "meta" ? "SEO Meta" : "Social Post"}
                  </Button>
                ))}
              </div>
            </div>
            <Input placeholder="Topic / page title" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <Input placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="persuasive">Persuasive</option>
                <option value="informative">Informative</option>
              </select>
              <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                <option value="mixed">English + বাংলা</option>
                <option value="bn">বাংলা</option>
                <option value="en">English</option>
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              <Wand2 className="w-4 h-4 mr-2" />{loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-amber-100">Output</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy} disabled={!output}><Copy className="w-3 h-3 mr-1" />Copy</Button>
              {mode === "blog" && <Button size="sm" onClick={saveAsBlog} disabled={!output}><Save className="w-3 h-3 mr-1" />Save as Draft</Button>}
            </div>
          </div>
          <Textarea rows={18} value={output} onChange={(e) => setOutput(e.target.value)} placeholder="AI generated content will appear here..." className="font-mono text-xs" />
        </GlassCard>
      </div>
    </AdminPage>
  );
}
