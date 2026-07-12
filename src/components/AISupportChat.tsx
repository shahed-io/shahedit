import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Bot, User, Loader2, Minimize2, Maximize2,
  Phone, Sparkles, RefreshCw, ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "shahed_support_session";
const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); }
  return id;
};

const SUPPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support`;

interface AISupportChatProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (v: boolean) => void;
}

export default function AISupportChat({ externalOpen, onExternalOpenChange }: AISupportChatProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = (v: boolean) => { setInternalOpen(v); onExternalOpenChange?.(v); };
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("আস্সালামু আলাইকুম! 👋 কীভাবে সাহায্য করতে পারি?");
  const [botName, setBotName] = useState("Shahed AI");
  const [unread, setUnread] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (supabase as any).from("ai_support_settings_public").select("greeting_message, bot_name")
      .eq("id", 1).single().then(({ data }) => {
        if (data?.greeting_message) setGreeting(data.greeting_message);
        if (data?.bot_name) setBotName(data.bot_name);
      });
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }]);
    }
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [open, greeting]);

  useEffect(() => {
    if (!showScrollBtn) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollBtn]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBtn(false);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: greeting }]);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput("");

    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    setShowScrollBtn(false);

    const sessionId = getSessionId();
    let assistantText = "";

    try {
      const resp = await fetch(SUPPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.slice(-10), // send last 10 msgs for speed
          session_id: sessionId,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        if (resp.status === 429) toast.error("অনেক বেশি অনুরোধ হয়েছে। একটু পরে আবার চেষ্টা করুন।");
        else if (resp.status === 402) toast.error("AI সেবা সাময়িকভাবে অনুপলব্ধ।");
        throw new Error(err.error ?? "Failed");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages(p => [...p, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const chunk = JSON.parse(json);
            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              assistantText += delta;
              setMessages(p => {
                const copy = [...p];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

      if (!open) setUnread(u => u + 1);

    } catch (e: any) {
      setMessages(p => [...p, { role: "assistant", content: "দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা WhatsApp-এ যোগাযোগ করুন।" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickReplies = [
    "আপনাদের সার্ভিস কী কী?",
    "ওয়েবসাইট তৈরিতে কত খরচ?",
    "কত দিনে কাজ শেষ হয়?",
    "ডিজিটাল মার্কেটিং প্যাকেজ?",
    "যোগাযোগ করব কীভাবে?",
  ];

  return (
    <div className="fixed bottom-28 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="w-[22rem] sm:w-[26rem] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              height: "600px",
              background: "hsl(265,42%,6%)",
              border: "1px solid rgba(168,85,247,0.22)"
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(270,92%,48%), hsl(270,85%,36%))" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-purple-900" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{botName}</p>
                  <p className="text-white/60 text-[11px]">⚡ দ্রুত উত্তর · সব সময় অনলাইন</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <RefreshCw size={12} className="text-white/70" />
                </button>
                <button
                  onClick={() => setMinimized(true)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <Minimize2 size={12} className="text-white" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(168,85,247,0.2) transparent" }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === "assistant"
                      ? "bg-purple-600/30 border border-purple-500/30"
                      : "bg-slate-700"
                  }`}>
                    {msg.role === "assistant"
                      ? <Bot size={14} className="text-purple-300" />
                      : <User size={14} className="text-slate-200" />
                    }
                  </div>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-[1.75] tracking-[0.01em] ${
                      msg.role === "user"
                        ? "rounded-tr-sm text-white font-medium"
                        : "rounded-tl-sm text-slate-50"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, hsl(270,92%,52%), hsl(270,75%,40%))" }
                        : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }
                    }
                  >
                    {msg.content ? (
                      msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none
                          [&_p]:my-2 [&_p]:leading-[1.8] [&_p]:text-[15px] [&_p]:text-slate-50
                          [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul>li]:text-slate-50 [&_ul>li]:leading-[1.7] [&_ul>li]:marker:text-purple-400
                          [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol>li]:text-slate-50 [&_ol>li]:leading-[1.7] [&_ol>li]:marker:text-purple-400
                          [&_strong]:text-purple-200 [&_strong]:font-bold
                          [&_h3]:text-white [&_h3]:font-bold [&_h3]:text-[15px] [&_h3]:mt-3 [&_h3]:mb-1.5
                          [&_h4]:text-white [&_h4]:font-semibold [&_h4]:text-[14px] [&_h4]:mt-2.5 [&_h4]:mb-1
                          [&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-2
                          [&_code]:bg-purple-500/15 [&_code]:text-purple-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )
                    ) : (
                      <span className="flex gap-1 items-center py-0.5">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-24 right-5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "hsl(270,85%,50%)" }}
                >
                  <ChevronDown size={14} className="text-white" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Quick Replies (only at start) */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {quickReplies.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => send(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full text-purple-300 hover:text-white hover:bg-purple-600/40 transition-all"
                    style={{ border: "1px solid rgba(168,85,247,0.3)" }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(168,85,247,0.2)",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <motion.button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30"
                  style={{ background: "linear-gradient(135deg, hsl(270,92%,58%), hsl(270,75%,44%))" }}
                >
                  {loading
                    ? <Loader2 size={14} className="text-white animate-spin" />
                    : <Send size={14} className="text-white" />
                  }
                </motion.button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <p className="text-[10px] text-slate-600">⚡ Powered by Shahed AI</p>
                <a
                  href="https://wa.me/8801820060046"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-green-500 hover:text-green-400 transition"
                >
                  <Phone size={9} /> WhatsApp সাপোর্ট
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Minimized bar */}
        {open && minimized && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl cursor-pointer"
            style={{
              background: "linear-gradient(135deg, hsl(270,92%,48%), hsl(270,75%,36%))",
              boxShadow: "0 4px 20px rgba(168,85,247,0.3)"
            }}
          >
            <Sparkles size={14} className="text-white" />
            <span className="text-white text-sm font-medium">{botName}</span>
            {unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
            <Maximize2 size={12} className="text-white/70" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
