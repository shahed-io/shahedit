import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

const BkashCallbackPage = () => {
  const [params] = useSearchParams();
  const [state, setState] = useState<"loading" | "success" | "failed" | "cancel">("loading");
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const paymentID = params.get("paymentID");
    const status = params.get("status");

    if (!paymentID || status === "cancel") { setState("cancel"); return; }
    if (status === "failure") { setState("failed"); return; }

    (async () => {
      const { data, error } = await supabase.functions.invoke("bkash-execute-payment", {
        body: { paymentID },
      });
      if (error || !data?.success || data?.status !== "completed") {
        setState("failed");
        setInfo(data);
      } else {
        setState("success");
        setInfo(data.data);
      }
    })();
  }, [params]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-32 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-4">
          {state === "loading" && (
            <>
              <Loader2 size={48} className="text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground">পেমেন্ট যাচাই হচ্ছে...</h2>
            </>
          )}
          {state === "success" && (
            <>
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">পেমেন্ট সফল! ✅</h2>
              <p className="text-muted-foreground mb-2">Transaction ID: <strong className="text-foreground font-mono">{info?.trxID}</strong></p>
              <p className="text-muted-foreground text-sm mb-6">পরিমাণ: ৳ {info?.amount}</p>
              <Link to="/dashboard"><Button className="glossy-btn">ড্যাশবোর্ডে যান</Button></Link>
            </>
          )}
          {(state === "failed" || state === "cancel") && (
            <>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">{state === "cancel" ? "পেমেন্ট বাতিল হয়েছে" : "পেমেন্ট ব্যর্থ"}</h2>
              <p className="text-muted-foreground mb-6">{state === "cancel" ? "আপনি পেমেন্ট বাতিল করেছেন।" : "পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন।"}</p>
              <Link to="/payment"><Button variant="outline">আবার চেষ্টা করুন</Button></Link>
            </>
          )}
        </motion.div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default BkashCallbackPage;
