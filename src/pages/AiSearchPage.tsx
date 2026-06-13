import { useEffect, useRef, useState, FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Send, ArrowUpRight, Loader2, Wrench, FileText, MessageCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Suggestion = { title: string; href: string; type: "service" | "blog"; reason?: string };
type Turn = { q: string; answer: string; suggestions: Suggestion[]; error?: string };

const SAMPLES = [
  "একটা ই-কমার্স ওয়েবসাইট বানাতে কত খরচ?",
  "SEO প্যাকেজে কী কী থাকে?",
  "Logo design কত দিনে পাবো?",
  "Cloud hosting এর প্ল্যান দেখাও",
];

export default function AiSearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q")?.trim() ?? "";
  const [input, setInput] = useState(initialQ);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns, loading]);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    const turn: Turn = { q, answer: "", suggestions: [] };
    setTurns(t => [...t, turn]);
    try {
      const { data, error } = await supabase.functions.invoke("ai-search", { body: { query: q } });
      if (error) throw error;
      setTurns(t => t.map((x, i) => i === t.length - 1
        ? { ...x, answer: data?.answer ?? "", suggestions: data?.suggestions ?? [] }
        : x));
    } catch (e: any) {
      setTurns(t => t.map((x, i) => i === t.length - 1
        ? { ...x, error: e?.message ?? "Something went wrong" }
        : x));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (initialQ) ask(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    setParams(p => { const n = new URLSearchParams(p); n.set("q", q); return n; }, { replace: true });
    ask(q);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="AI Search — Shahed IT" description="Bangla/English AI search for services, packages, pricing, and articles." />
      <SiteHeader />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.14))", border: "1px solid rgba(168,85,247,0.35)", color: "#f0abfc" }}>
              <Sparkles size={13} /> AI Powered Search
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              যেকোনো প্রশ্ন করুন — AI উত্তর দেবে
            </h1>
            <p className="text-slate-400 text-sm">Bangla অথবা English — service, package, দাম, blog যেকোনো বিষয়ে।</p>
          </div>

          {/* Sample chips when empty */}
          {turns.length === 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {SAMPLES.map(s => (
                <button key={s} onClick={() => { setInput(s); ask(s); setParams(p => { const n = new URLSearchParams(p); n.set("q", s); return n; }, { replace: true }); }}
                  className="px-3 py-1.5 text-xs rounded-full border transition hover:scale-[1.02]"
                  style={{ background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.30)", color: "#e2dafs" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Turns */}
          <div className="space-y-6 mb-6">
            {turns.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* User question */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, hsl(270,75%,55%), hsl(280,70%,48%))", color: "white", boxShadow: "0 4px 16px rgba(168,85,247,0.30)" }}>
                    {t.q}
                  </div>
                </div>

                {/* AI answer */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(270,92%,58%), hsl(320,80%,55%))" }}>
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {!t.answer && !t.error && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm h-9">
                        <Loader2 size={14} className="animate-spin" /> ভাবছি...
                      </div>
                    )}
                    {t.error && (
                      <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                        {t.error}
                      </div>
                    )}
                    {t.answer && (
                      <div className="prose prose-sm prose-invert max-w-none text-slate-200 leading-relaxed">
                        <ReactMarkdown>{t.answer}</ReactMarkdown>
                      </div>
                    )}

                    {t.suggestions?.length > 0 && (
                      <div className="mt-3 grid sm:grid-cols-2 gap-2">
                        {t.suggestions.map((s, j) => {
                          const Icon = s.type === "blog" ? FileText : Wrench;
                          return (
                            <Link key={j} to={s.href}
                              className="group flex items-start gap-3 rounded-xl p-3 transition hover:scale-[1.01]"
                              style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)" }}>
                              <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                                style={{ background: "rgba(168,85,247,0.20)" }}>
                                <Icon size={14} className="text-purple-300" />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm font-semibold text-white truncate">{s.title}</span>
                                {s.reason && <span className="block text-[11px] text-slate-400 mt-0.5 line-clamp-2">{s.reason}</span>}
                              </span>
                              <ArrowUpRight size={14} className="text-purple-300 opacity-60 group-hover:opacity-100 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form onSubmit={submit} className="sticky bottom-4">
            <div className="flex items-center gap-2 rounded-2xl pl-4 pr-2 py-2"
              style={{ background: "rgba(20,12,40,0.92)", border: "1.5px solid rgba(168,85,247,0.35)", backdropFilter: "blur(12px)", boxShadow: "0 10px 32px rgba(0,0,0,0.45)" }}>
              <Sparkles size={16} className="text-purple-300 shrink-0" />
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="যেমন: ৫,০০০ টাকার মধ্যে কী প্যাকেজ পাবো?"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition"
                style={{ background: "linear-gradient(135deg, hsl(270,92%,58%), hsl(320,80%,55%))", boxShadow: "0 4px 12px rgba(168,85,247,0.40)" }}>
                {loading ? <Loader2 size={15} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
              <MessageCircle size={11} /> উত্তর সন্তোষজনক নয়? কল করুন <a href="tel:01820060046" className="text-purple-300 hover:underline">01820-060046</a>
            </p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
