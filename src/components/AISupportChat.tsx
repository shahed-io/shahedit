import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Bot, User, Loader2, Minimize2, Maximize2,
  MessageSquare, Phone, ExternalLink, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SESSION_KEY = "shahed_support_session";
const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); }
  return id;
};

const SUPPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support`;

export default function AISupportChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("আস্সালামু আলাইকুম! 👋 কীভাবে সাহায্য করতে পারি?");
  const [botName, setBotName] = useState("Shahed AI");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("ai_support_settings").select("greeting_message, bot_name")
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

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
          messages: newMessages,
          session_id: sessionId,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        if (resp.status === 429) toast.error("Too many requests. Please wait a moment.");
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
      setMessages(p => [...p, { role: "assistant", content: "দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    "আপনাদের সার্ভিস কী কী?",
    "ওয়েবসাইট তৈরিতে কত খরচ?",
    "কত দিনে কাজ হয়?",
    "How can I contact you?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              height: "520px",
              background: "hsl(220,42%,4%)",
              border: "1px solid rgba(139,92,246,0.25)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(258,90%,50%), hsl(258,80%,38%))" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{botName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-white/70 text-xs">AI-powered · Always online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(true)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <Minimize2 size={13} className="text-white" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={13} className="text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "assistant"
                      ? "bg-purple-600/30 border border-purple-500/30"
                      : "bg-slate-700"
                  }`}>
                    {msg.role === "assistant"
                      ? <Bot size={13} className="text-purple-400" />
                      : <User size={13} className="text-slate-300" />
                    }
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm text-slate-200"
                  }`} style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg, hsl(258,90%,50%), hsl(258,70%,40%))" }
                      : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
                  }>
                    {msg.content || (
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies (only on first message) */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {quickReplies.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); setTimeout(() => send(), 0); }}
                    className="text-[11px] px-2.5 py-1 rounded-full text-purple-300 transition hover:bg-purple-600/20"
                    style={{ border: "1px solid rgba(139,92,246,0.3)" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, hsl(258,90%,60%), hsl(258,70%,45%))" }}
                >
                  {loading
                    ? <Loader2 size={14} className="text-white animate-spin" />
                    : <Send size={14} className="text-white" />
                  }
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <p className="text-[10px] text-slate-600">Powered by Shahed AI</p>
                <a href="https://wa.me/8801820060046" target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-green-500 hover:text-green-400 transition">
                  <Phone size={9} /> WhatsApp
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
              background: "linear-gradient(135deg, hsl(258,90%,50%), hsl(258,70%,38%))",
              boxShadow: "0 4px 20px rgba(139,92,246,0.3)"
            }}
          >
            <Sparkles size={14} className="text-white" />
            <span className="text-white text-sm font-medium">{botName}</span>
            <Maximize2 size={12} className="text-white/70" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => { setOpen(v => !v); setMinimized(false); }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="AI Support"
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: "linear-gradient(135deg, hsl(258,90%,58%), hsl(258,70%,42%))",
          boxShadow: "0 8px 32px rgba(139,92,246,0.4)"
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageSquare size={22} className="text-white" fill="white" />
            </motion.span>
          )}
        </AnimatePresence>

        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(139,92,246,0.3)" }} />
        )}

        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-black flex items-center justify-center">
            <span className="text-[9px] text-white font-bold">{unread}</span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
