import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "validating" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("validating");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
          headers: { apikey: ANON_KEY },
        });
        const data = await res.json();
        if (!res.ok) { setState("invalid"); setError(data?.error ?? "Invalid token"); return; }
        if (data?.already_unsubscribed) { setEmail(data.email ?? ""); setState("already"); return; }
        setEmail(data?.email ?? "");
        setState("ready");
      } catch (e: any) {
        setState("invalid"); setError(e.message ?? "Network error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setState("submitting");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    if (error) { setState("error"); setError(error.message); return; }
    if ((data as any)?.success) setState("done"); else { setState("error"); setError((data as any)?.error ?? "Failed"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card/80 backdrop-blur border border-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-primary" />
        </div>

        {state === "validating" && (<><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Validating…</p></>)}

        {state === "ready" && (
          <>
            <h1 className="text-xl font-bold mb-2">Unsubscribe confirm করুন</h1>
            <p className="text-sm text-muted-foreground mb-5">{email || "এই ইমেইল"} ঠিকানা থেকে আপনি আর কোনো ইমেইল পাবেন না।</p>
            <Button onClick={confirm} className="w-full">Confirm Unsubscribe</Button>
          </>
        )}

        {state === "submitting" && (<><Loader2 className="w-6 h-6 animate-spin mx-auto" /><p className="mt-3 text-sm">Processing…</p></>)}

        {state === "done" && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <h1 className="text-xl font-bold mb-2">Unsubscribed</h1>
            <p className="text-sm text-muted-foreground">{email} আর কোনো ইমেইল পাবে না।</p>
          </>
        )}

        {state === "already" && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <h1 className="text-xl font-bold mb-2">আগেই unsubscribe হয়েছে</h1>
            <p className="text-sm text-muted-foreground">{email} ইতিমধ্যে suppressed list এ আছে।</p>
          </>
        )}

        {(state === "invalid" || state === "error") && (
          <>
            <XCircle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
            <h1 className="text-xl font-bold mb-2">Invalid link</h1>
            <p className="text-sm text-muted-foreground">{error || "এই unsubscribe link টি কাজ করছে না।"}</p>
          </>
        )}
      </div>
    </div>
  );
}
