import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Bot, Save, Settings2, MessageSquare, Eye, EyeOff,
  RefreshCcw, Trash2, User, Clock, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AiSettings = {
  system_prompt: string;
  greeting_message: string;
  bot_name: string;
  is_enabled: boolean;
  collect_contact_info: boolean;
  human_handoff_message: string;
};

type Chat = {
  id: string;
  session_id: string;
  visitor_name?: string;
  visitor_email?: string;
  messages: { role: string; content: string }[];
  status: string;
  created_at: string;
};

const defaultSettings: AiSettings = {
  system_prompt: "You are a helpful customer support assistant for Shahed IT, a professional IT agency in Bangladesh. Answer questions about web development, app development, graphic design, digital marketing, cloud hosting, and IT support services. Be friendly, professional, and helpful. If you cannot answer something, suggest contacting the team via WhatsApp or email. Always respond in the same language the customer uses.",
  greeting_message: "আস্সালামু আলাইকুম! 👋 Shahed IT-তে স্বাগতম। আমি আপনার AI সাপোর্ট অ্যাসিস্ট্যান্ট। কীভাবে সাহায্য করতে পারি?",
  bot_name: "Shahed AI",
  is_enabled: true,
  collect_contact_info: true,
  human_handoff_message: "আরও সাহায্যের জন্য আমাদের WhatsApp-এ যোগাযোগ করুন: 01820-060046",
};

const AdminAISupport = () => {
  const [settings, setSettings] = useState<AiSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "chats">("settings");

  useEffect(() => {
    supabase.from("ai_support_settings").select("*").eq("id", 1).single()
      .then(({ data }) => { if (data) setSettings(data as AiSettings); });

    supabase.from("support_chats").select("*").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setChats((data ?? []) as unknown as Chat[]); setLoadingChats(false); });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from("ai_support_settings")
      .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
  };

  const deleteChat = async (id: string) => {
    if (!confirm("Delete this chat?")) return;
    await supabase.from("support_chats").delete().eq("id", id);
    setChats(p => p.filter(c => c.id !== id));
    toast.success("Chat deleted");
  };

  const toggle = (key: keyof AiSettings) =>
    setSettings(p => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(258,90%,58%), hsl(258,70%,42%))" }}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Support System</h1>
            <p className="text-slate-400 text-sm mt-0.5">Configure your AI customer support bot</p>
          </div>
        </div>
        {/* Enable/Disable toggle */}
        <button
          onClick={() => toggle("is_enabled")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
            settings.is_enabled
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
        >
          {settings.is_enabled ? <Eye size={15} /> : <EyeOff size={15} />}
          {settings.is_enabled ? "AI Enabled" : "AI Disabled"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {([["settings", "Settings", Settings2], ["chats", "Chat History", MessageSquare]] as const).map(([tab, label, Icon]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon size={14} /> {label}
            {tab === "chats" && chats.length > 0 && (
              <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-xs">{chats.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "settings" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Main Settings */}
          <div className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bot size={16} className="text-purple-400" /> Bot Identity
              </h3>
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Bot Name</Label>
                <Input
                  value={settings.bot_name}
                  onChange={e => setSettings(p => ({ ...p, bot_name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white h-10"
                  placeholder="e.g. Shahed AI"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Greeting Message</Label>
                <textarea
                  value={settings.greeting_message}
                  onChange={e => setSettings(p => ({ ...p, greeting_message: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="First message shown to visitors..."
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs mb-1.5 block">Human Handoff Message</Label>
                <textarea
                  value={settings.human_handoff_message}
                  onChange={e => setSettings(p => ({ ...p, human_handoff_message: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Message when AI can't help..."
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Settings2 size={16} className="text-purple-400" /> Options
              </h3>
              {([
                { key: "is_enabled", label: "AI Support Active", desc: "Show chat widget on website" },
                { key: "collect_contact_info", label: "Collect Contact Info", desc: "Ask for name/email in chat" },
              ] as { key: keyof AiSettings; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <button key={key} onClick={() => toggle(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    settings[key]
                      ? "bg-purple-600/15 border-purple-500/30 text-white"
                      : "bg-slate-800/50 border-slate-700 text-slate-400"
                  }`}
                >
                  <div className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${settings[key] ? "bg-purple-600" : "bg-slate-700"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[key] ? "left-4" : "left-0.5"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: System Prompt */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageSquare size={16} className="text-purple-400" /> System Prompt
              </h3>
              <button
                onClick={() => setSettings(p => ({ ...p, system_prompt: defaultSettings.system_prompt }))}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
              >
                <RefreshCcw size={11} /> Reset
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              এই prompt দিয়ে AI-কে বলুন কীভাবে আচরণ করতে হবে। সার্ভিস, দাম, নিয়ম যা চান লিখুন।
            </p>
            <textarea
              value={settings.system_prompt}
              onChange={e => setSettings(p => ({ ...p, system_prompt: e.target.value }))}
              rows={18}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none font-mono leading-relaxed"
              placeholder="You are a helpful assistant for..."
            />
            <p className="text-xs text-slate-600 mt-2">{settings.system_prompt.length} characters</p>
          </div>

          {/* Save Button */}
          <div className="lg:col-span-2 flex justify-end">
            <Button onClick={saveSettings} disabled={saving}
              className="bg-purple-600 hover:bg-purple-500 gap-2 px-8">
              <Save size={15} />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "chats" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loadingChats ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No chat sessions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {chats.map((chat, i) => (
                <motion.div key={chat.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/30 transition cursor-pointer"
                    onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                        {chat.visitor_name?.[0]?.toUpperCase() ?? <User size={14} />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{chat.visitor_name ?? "Anonymous Visitor"}</p>
                        <p className="text-slate-500 text-xs">{chat.visitor_email ?? chat.session_id.slice(0, 12) + "..."}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs hidden sm:flex items-center gap-1">
                        <MessageSquare size={11} /> {(chat.messages as any[]).length} msgs
                      </span>
                      <span className="text-slate-500 text-xs hidden md:flex items-center gap-1">
                        <Clock size={11} /> {new Date(chat.created_at).toLocaleDateString()}
                      </span>
                      <button onClick={e => { e.stopPropagation(); deleteChat(chat.id); }}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition">
                        <Trash2 size={13} />
                      </button>
                      {expandedChat === chat.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded messages */}
                  {expandedChat === chat.id && (
                    <div className="px-4 pb-4 space-y-2 bg-slate-950/40">
                      {(chat.messages as { role: string; content: string }[]).map((msg, j) => (
                        <div key={j} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${
                            msg.role === "user"
                              ? "bg-purple-600/30 text-purple-100 rounded-tr-sm"
                              : "bg-slate-800 text-slate-300 rounded-tl-sm"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAISupport;
