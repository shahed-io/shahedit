import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, KeyRound, CheckCircle2, TestTube2, Sparkles } from "lucide-react";

type Provider = "lovable" | "gemini" | "openai" | "anthropic" | "xai";

interface ProviderItem {
  provider: Provider;
  has_key: boolean;
  key_masked: string | null;
  model: string | null;
  updated_at: string | null;
}

const META: Record<Provider, { name: string; hint: string; keyUrl: string; defaultModel: string }> = {
  lovable:   { name: "Lovable AI Gateway", hint: "Built-in fallback (uses LOVABLE_API_KEY secret).", keyUrl: "https://docs.lovable.dev/ai",                              defaultModel: "google/gemini-2.5-flash-lite" },
  gemini:    { name: "Google Gemini",       hint: "Get key at Google AI Studio.",                     keyUrl: "https://aistudio.google.com/app/apikey",                   defaultModel: "gemini-2.0-flash" },
  openai:    { name: "OpenAI (ChatGPT)",    hint: "Get key at platform.openai.com.",                  keyUrl: "https://platform.openai.com/api-keys",                     defaultModel: "gpt-4o-mini" },
  anthropic: { name: "Anthropic Claude",    hint: "Get key at console.anthropic.com.",                keyUrl: "https://console.anthropic.com/settings/keys",              defaultModel: "claude-3-5-haiku-20241022" },
  xai:       { name: "xAI Grok",            hint: "Get key at console.x.ai.",                         keyUrl: "https://console.x.ai/",                                     defaultModel: "grok-2-latest" },
};

async function callManage(action: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("ai-provider-manage", {
    body: { action, ...extra },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

export default function AdminAIProviders() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProviderItem[]>([]);
  const [active, setActive] = useState<Provider>("lovable");
  const [keyInput, setKeyInput] = useState<Record<Provider, string>>({} as any);
  const [modelInput, setModelInput] = useState<Record<Provider, string>>({} as any);
  const [savingKey, setSavingKey] = useState<Provider | null>(null);
  const [testing, setTesting] = useState<Provider | null>(null);
  const [switching, setSwitching] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await callManage("list");
      setItems(data.items);
      setActive(data.active);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load AI providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveKey = async (p: Provider) => {
    setSavingKey(p);
    try {
      await callManage("set_key", {
        provider: p,
        api_key: keyInput[p] ?? "",
        model: modelInput[p] ?? "",
      });
      toast.success(`${META[p].name} saved`);
      setKeyInput((s) => ({ ...s, [p]: "" }));
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const clearKey = async (p: Provider) => {
    if (!confirm(`Remove ${META[p].name} API key?`)) return;
    setSavingKey(p);
    try {
      await callManage("set_key", { provider: p, api_key: null });
      toast.success("Key removed");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const setActiveProvider = async (p: Provider) => {
    setSwitching(true);
    try {
      await callManage("set_active", { provider: p });
      setActive(p);
      toast.success(`Active provider: ${META[p].name}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSwitching(false);
    }
  };

  const testProvider = async (p: Provider) => {
    setTesting(p);
    try {
      const res = await callManage("test", { provider: p });
      if (res.ok) toast.success(`${META[p].name} OK — ${String(res.sample ?? "").slice(0, 80)}`);
      else toast.error(`Test failed (${res.status}): ${String(res.sample ?? "").slice(0, 120)}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 text-white shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Providers</h1>
          <p className="text-sm text-muted-foreground">
            Gemini, ChatGPT, Claude, Grok — সব AI provider এখান থেকে configure ও switch করুন। সব admin AI feature (chat, content writer, offer generator, search) active provider ব্যবহার করবে।
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => {
            const meta = META[it.provider];
            const isActive = active === it.provider;
            return (
              <Card key={it.provider} className={isActive ? "border-primary shadow-md" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      {meta.name}
                    </span>
                    {isActive && (
                      <Badge className="gap-1 bg-emerald-500 hover:bg-emerald-500">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {meta.hint}{" "}
                    <a href={meta.keyUrl} target="_blank" rel="noreferrer" className="underline">
                      Get key
                    </a>
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Current key: </span>
                    {it.has_key ? (
                      <span className="font-mono">{it.key_masked}</span>
                    ) : (
                      <span className="text-muted-foreground italic">not set</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">API Key</Label>
                    <Input
                      type="password"
                      placeholder={it.has_key ? "Replace key…" : "Paste API key"}
                      value={keyInput[it.provider] ?? ""}
                      onChange={(e) => setKeyInput((s) => ({ ...s, [it.provider]: e.target.value }))}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Model (optional)</Label>
                    <Input
                      placeholder={it.model ?? meta.defaultModel}
                      value={modelInput[it.provider] ?? ""}
                      onChange={(e) => setModelInput((s) => ({ ...s, [it.provider]: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => saveKey(it.provider)}
                      disabled={savingKey === it.provider}
                    >
                      {savingKey === it.provider && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testProvider(it.provider)}
                      disabled={testing === it.provider}
                    >
                      {testing === it.provider ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <TestTube2 className="mr-1 h-3 w-3" />
                      )}
                      Test
                    </Button>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveProvider(it.provider)}
                        disabled={switching}
                      >
                        Set as Active
                      </Button>
                    )}
                    {it.has_key && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => clearKey(it.provider)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
