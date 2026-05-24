import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Search, ListChecks, Globe, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { callGsc } from "@/lib/gsc-client";

export default function GscSubmitPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState("https://shahedit.com/");
  const [output, setOutput] = useState<any>(null);

  const run = async (label: string, fn: () => Promise<any>) => {
    setLoading(label);
    setOutput(null);
    try {
      const r = await fn();
      setOutput(r);
      toast.success(`${label} ✓`);
    } catch (e: any) {
      toast.error(e?.message || "Failed");
      setOutput({ error: e?.message || String(e) });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" /> Google Search Console — Sitemap & URL Submission
        </CardTitle>
        <CardDescription>
          নতুন post/page publish হলে এখান থেকে sitemap resubmit বা নির্দিষ্ট URL inspect করতে পারেন।
          Sitemap dynamic — auto update হয়; এই বাটনগুলো Google-কে দ্রুত re-crawl করতে বলে।
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run("Submit sitemap", () => callGsc("submit_sitemap"))} disabled={!!loading}>
            {loading === "Submit sitemap" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit / Re-ping Sitemap
          </Button>
          <Button variant="outline" onClick={() => run("List sitemaps", () => callGsc("list_sitemaps"))} disabled={!!loading}>
            <ListChecks className="w-4 h-4 mr-2" /> List Sitemaps
          </Button>
          <Button variant="outline" onClick={() => run("List sites", () => callGsc("list_sites"))} disabled={!!loading}>
            <Globe className="w-4 h-4 mr-2" /> Verified Sites
          </Button>
          <Button variant="outline" asChild>
            <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Open Search Console
            </a>
          </Button>
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label>URL Inspect / Request Indexing</Label>
          <div className="flex gap-2">
            <Input value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} placeholder="https://shahedit.com/blog/my-post" />
            <Button onClick={() => run("Inspect URL", () => callGsc("inspect_url", { pageUrl }))} disabled={!!loading || !pageUrl}>
              <Search className="w-4 h-4 mr-2" /> Inspect
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            URL inspect Google-এ index status দেখায়। নতুন publish হলে Search Console-এর "Request Indexing" বাটন ক্লিক করতে হবে (Google API আর সরাসরি indexing request নেয় না — শুধু JobPosting/BroadcastEvent বাদে)।
          </p>
        </div>

        <div className="border-t pt-4">
          <Badge variant="secondary" className="mb-2">Auto-trigger</Badge>
          <p className="text-xs text-muted-foreground">
            Admin থেকে যখন blog/service/package/project/banner publish বা update করা হয়, frontend থেকে স্বয়ংক্রিয়ভাবে sitemap resubmit হবে (background, fire-and-forget)।
          </p>
        </div>

        {output && (
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
{JSON.stringify(output, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
