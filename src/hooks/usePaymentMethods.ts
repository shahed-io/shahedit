import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  method_id: string;
  label: string;
  sublabel: string | null;
  number: string;
  color: string;
  short_code: string;
  logo_url: string | null;
  instructions: string | null;
  sort_order: number;
  is_active: boolean;
}

// Fallback in case DB is empty / offline
const FALLBACK: PaymentMethod[] = [
  { id: "f1", method_id: "bkash_send", label: "বিকাশ", sublabel: "Send Money", number: "01820060046", color: "#E2136E", short_code: "bK", instructions: null, sort_order: 1, is_active: true },
  { id: "f2", method_id: "nagad_send", label: "নগদ", sublabel: "Send Money", number: "01820060046", color: "#F6821F", short_code: "NG", instructions: null, sort_order: 2, is_active: true },
  { id: "f3", method_id: "rocket_send", label: "রকেট", sublabel: "Send Money", number: "01820060046", color: "#8B1FA8", short_code: "RK", instructions: null, sort_order: 3, is_active: true },
  { id: "f4", method_id: "upay_send", label: "উপায়", sublabel: "Send Money", number: "01820060046", color: "#00A651", short_code: "UP", instructions: null, sort_order: 4, is_active: true },
  { id: "f5", method_id: "bkash_merchant", label: "বিকাশ মার্চেন্ট", sublabel: "Merchant", number: "01820060046", color: "#E2136E", short_code: "bM", instructions: null, sort_order: 5, is_active: true },
];

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      if (data && data.length) setMethods(data as PaymentMethod[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { methods, loading };
};
