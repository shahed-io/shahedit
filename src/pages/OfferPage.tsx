import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Gift, Trophy, Sparkles, CheckCircle2 } from "lucide-react";

type Field = { key: string; label: string; type: "text" | "email" | "tel" | "textarea" | "select"; required?: boolean; options?: string[]; placeholder?: string };

export default function OfferPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("offer_campaigns" as any).select("*").eq("slug", slug).maybeSingle();
      setCampaign(data);
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", auth.user.id);
        setIsAdmin(!!roles?.some((r: any) => r.role === "admin" || r.role === "super_admin"));
      }
      if (data) {
        const { data: w } = await supabase
          .from("offer_winners" as any)
          .select("position,prize,reason, offer_submissions(name,email)")
          .eq("campaign_id", (data as any).id)
          .eq("is_published", true)
          .order("position");
        setWinners((w as any[]) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!campaign) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center text-center px-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">অফার পাওয়া যায়নি</h1>
          <p className="text-muted-foreground mb-4">এই লিংকটি ভুল অথবা অফারটি বন্ধ হয়ে গেছে।</p>
          <Link to="/" className="text-primary underline">হোমে ফিরে যান</Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );

  const now = new Date();
  const scheduleOk = (!campaign.starts_at || new Date(campaign.starts_at) <= now)
    && (!campaign.ends_at || new Date(campaign.ends_at) >= now);
  const isPublished = campaign.status === "published";
  const isOpen = (isPublished || isAdmin) && scheduleOk;
  const adminPreview = isAdmin && !isPublished;

  const fields: Field[] = Array.isArray(campaign.fields) && campaign.fields.length
    ? campaign.fields
    : [
        { key: "name", label: "নাম", type: "text", required: true },
        { key: "email", label: "ইমেইল", type: "email", required: true },
        { key: "phone", label: "মোবাইল", type: "tel", required: true },
      ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      for (const f of fields) {
        if (f.required && !values[f.key]?.trim()) {
          toast.error(`${f.label} আবশ্যক`);
          setSubmitting(false);
          return;
        }
      }
      // Enforce max_entries limit
      if (campaign.max_entries && Number(campaign.max_entries) > 0) {
        const { count } = await supabase
          .from("offer_submissions" as any)
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", campaign.id);
        if ((count ?? 0) >= Number(campaign.max_entries)) {
          toast.error("দুঃখিত, এন্ট্রি লিমিট পূর্ণ হয়ে গেছে।");
          setSubmitting(false);
          return;
        }
      }
      const payload: any = {
        campaign_id: campaign.id,
        name: values.name || null,
        email: values.email || null,
        phone: values.phone || null,
        answers: values,
        user_agent: navigator.userAgent,
      };
      const { error } = await supabase.from("offer_submissions" as any).insert(payload);
      if (error) throw error;
      setDone(true);
      toast.success("আপনার এন্ট্রি গৃহীত হয়েছে!");
      if (campaign.redirect_url) {
        setTimeout(() => { window.location.href = campaign.redirect_url; }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "জমা দিতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={campaign.meta_title || campaign.title} description={campaign.meta_description || campaign.description?.slice(0, 150)} />
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {adminPreview && (
          <div className="mb-5 rounded-xl border border-amber-400/50 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 px-4 py-3 text-sm">
            ⚠️ <strong>Admin Preview:</strong> এই অফারটি এখনো <strong>Draft</strong>। পাবলিকলি দেখাতে Admin → Offers → <strong>Publish</strong> বাটন চাপুন।
          </div>
        )}
        {campaign.banner_url && (
          <img src={campaign.banner_url} alt={campaign.title} className="w-full rounded-2xl mb-6 object-cover max-h-80 shadow-lg" />
        )}
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-purple-500" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-purple-500 font-bold">Special Offer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">{campaign.title}</h1>
        {campaign.description && (
          <p className="text-base sm:text-lg text-muted-foreground whitespace-pre-line mb-6 leading-relaxed">{campaign.description}</p>
        )}
        {campaign.prize_description && (
          <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/15 dark:to-orange-500/10 p-5 mb-7 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 text-base sm:text-lg">
              <Trophy className="w-5 h-5" /> পুরস্কার
            </div>
            <p className="mt-2 text-sm sm:text-base whitespace-pre-line text-foreground/90 leading-relaxed">{campaign.prize_description}</p>
          </div>
        )}

        {campaign.use_google_form && campaign.google_form_url ? (() => {
          const raw: string = campaign.google_form_url;
          const embedUrl = raw.includes("embedded=true")
            ? raw
            : raw + (raw.includes("?") ? "&" : "?") + "embedded=true";
          return (
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-3">নিচের ফর্মটি পূরণ করে অংশগ্রহণ করুন:</p>
              <div className="aspect-[4/5] w-full">
                <iframe src={embedUrl} className="w-full h-full rounded-xl border" loading="lazy" title="Offer form" />
              </div>
              <a href={raw} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-primary underline">ফর্ম দেখা যাচ্ছে না? নতুন ট্যাবে খুলুন →</a>
            </div>
          );
        })() : done ? (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-green-500 mb-3" />
            <h2 className="text-xl font-bold mb-2">ধন্যবাদ!</h2>
            <p className="text-muted-foreground whitespace-pre-line">{campaign.thank_you_message || "আপনার এন্ট্রি গৃহীত হয়েছে। বিজয়ী ঘোষণা হলে আমরা যোগাযোগ করব।"}</p>
          </div>
        ) : isOpen ? (
          <form onSubmit={submit} className="rounded-2xl border bg-card p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="w-4 h-4" /> অংশগ্রহণ করুন</div>
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">{f.label}{f.required && <span className="text-red-500"> *</span>}</Label>
                {f.type === "textarea" ? (
                  <Textarea rows={4} className="text-base" value={values[f.key] || ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} placeholder={f.placeholder} />
                ) : f.type === "select" ? (
                  <select className="w-full h-11 rounded-md border border-input bg-background px-3 text-base"
                    value={values[f.key] || ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}>
                    <option value="">— নির্বাচন করুন —</option>
                    {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <Input type={f.type} className="h-11 text-base" value={values[f.key] || ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} placeholder={f.placeholder} />
                )}
              </div>
            ))}
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700">
              {submitting ? "জমা হচ্ছে..." : "জমা দিন →"}
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border bg-card p-6 text-center">
            <p className="font-semibold">এই অফারটি এখন বন্ধ।</p>
            {campaign.ends_at && <p className="text-xs text-muted-foreground mt-1">শেষ: {new Date(campaign.ends_at).toLocaleString("bn-BD")}</p>}
          </div>
        )}

        {winners.length > 0 && (
          <div className="mt-10 rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-amber-500" /><h2 className="text-xl font-bold">বিজয়ীগণ</h2></div>
            <ol className="space-y-3">
              {winners.map((w) => (
                <li key={w.position} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center">{w.position}</span>
                  <div>
                    <div className="font-semibold">{w.offer_submissions?.name || "—"}</div>
                    {w.prize && <div className="text-sm text-amber-600 dark:text-amber-400">🎁 {w.prize}</div>}
                    {w.reason && <div className="text-xs text-muted-foreground mt-0.5">{w.reason}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
