import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
const budgets = ["Under ৳50,000", "৳50,000 - ৳1,00,000", "৳1,00,000 - ৳5,00,000", "৳5,00,000+", "Let's Discuss"];
const timelines = ["ASAP", "1-2 Months", "3-6 Months", "6+ Months", "Not Sure"];

const steps = ["Service", "Details", "Contact", "Confirm"];

const GetQuotePage = () => {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<string[]>([]);
  const [form, setForm] = useState({
    service_interested: "",
    budget_range: "",
    timeline: "",
    project_description: "",
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("services")
      .select("title")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setServices(data.map(s => s.title));
        } else {
          setServices(["Web Development", "Mobile App", "E-Commerce", "Digital Marketing", "UI/UX Design", "SEO Services", "ERP System", "Custom Software"]);
        }
      });
  }, []);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Invalid email"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert([{ ...form, source: "quote_form" as const }]);
    setSubmitting(false);
    if (error) { toast.error("Submission failed. Please try again."); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Quote Request Sent!</h2>
            <p className="text-muted-foreground">Thank you, <strong>{form.name}</strong>! We'll review your request and get back to you within 24 hours.</p>
          </motion.div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section
        className="relative py-24 overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, hsla(320,90%,55%,0.10), transparent 60%), radial-gradient(800px 500px at 90% 30%, hsla(270,92%,55%,0.08), transparent 60%)",
        }}
      >
        <div className="container mx-auto px-4 max-w-2xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-medium tracking-[0.3em] uppercase text-[hsl(320,90%,68%)]">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(320,90%,60%)", boxShadow: "0 0 8px hsl(320,90%,60%)" }} />
              Free Consultation
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mt-5 mb-3 font-syne tracking-tight">
              Get a{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(320,90%,60%)] to-[hsl(270,92%,60%)]">
                Free Quote
              </span>
            </h1>
            <p className="text-muted-foreground">Tell us about your project and we'll provide a custom quote</p>
          </motion.div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 text-white"
                    style={
                      done || active
                        ? {
                            background:
                              "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                            boxShadow: "0 10px 30px -10px hsla(320,90%,55%,0.55)",
                          }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }
                    }
                  >
                    {done ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-[hsl(320,90%,68%)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && (
                    <div
                      className="w-8 h-0.5 rounded-full transition-colors"
                      style={{ background: done ? "hsl(320,90%,55%)" : "rgba(255,255,255,0.08)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="relative rounded-3xl overflow-hidden border border-white/[0.06] p-8"
            style={{
              background: "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
              boxShadow:
                "0 24px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                {step === 0 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-6 font-syne">What service do you need?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {services.map(s => {
                        const sel = form.service_interested === s;
                        return (
                          <motion.button
                            key={s}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setForm(p => ({ ...p, service_interested: s }))}
                            className="p-3.5 rounded-2xl border text-sm font-medium text-left transition-all duration-300"
                            style={
                              sel
                                ? {
                                    borderColor: "hsl(320,90%,60%)",
                                    background: "hsla(320,90%,55%,0.15)",
                                    color: "hsl(320,90%,80%)",
                                    boxShadow: "0 10px 30px -10px hsla(320,90%,55%,0.45)",
                                  }
                                : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.85)" }
                            }
                          >{s}</motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-white mb-4 font-syne">What's your budget?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {budgets.map(b => {
                          const sel = form.budget_range === b;
                          return (
                            <motion.button
                              key={b}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setForm(p => ({ ...p, budget_range: b }))}
                              className="p-3 rounded-2xl border text-sm font-medium transition-all"
                              style={
                                sel
                                  ? { borderColor: "hsl(320,90%,60%)", background: "hsla(320,90%,55%,0.15)", color: "hsl(320,90%,80%)" }
                                  : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.85)" }
                              }
                            >{b}</motion.button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white mb-3 font-syne">Timeline</h3>
                      <div className="flex flex-wrap gap-2">
                        {timelines.map(t => {
                          const sel = form.timeline === t;
                          return (
                            <motion.button
                              key={t}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setForm(p => ({ ...p, timeline: t }))}
                              className="px-4 py-2 rounded-full border text-sm font-medium transition-all"
                              style={
                                sel
                                  ? { borderColor: "hsl(320,90%,60%)", background: "hsla(320,90%,55%,0.15)", color: "hsl(320,90%,80%)" }
                                  : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.85)" }
                              }
                            >{t}</motion.button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/55 text-xs mb-1.5 block">Project Description</Label>
                      <textarea value={form.project_description} onChange={e => setForm(p => ({ ...p, project_description: e.target.value }))} rows={3}
                        placeholder="Briefly describe your project..."
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[hsl(320,90%,60%)]/50 resize-none transition-colors"
                      />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-6 font-syne">Your contact details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[["name", "Full Name *"], ["email", "Email Address *"], ["phone", "Phone Number"], ["company", "Company Name"]].map(([key, label]) => (
                        <div key={key}>
                          <Label className="text-white/55 text-xs mb-1.5 block">{label}</Label>
                          <Input type={key === "email" ? "email" : "text"} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="h-11 bg-white/[0.04] border-white/10 text-white focus:border-[hsl(320,90%,60%)]/50" placeholder={label.replace(" *", "")} required={label.includes("*")} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-6 font-syne">Review your request</h3>
                    <div className="space-y-3">
                      {[
                        ["Service", form.service_interested],
                        ["Budget", form.budget_range],
                        ["Timeline", form.timeline],
                        ["Name", form.name],
                        ["Email", form.email],
                        ["Phone", form.phone],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex justify-between py-2.5 border-b border-white/[0.06]">
                          <span className="text-white/55 text-sm">{k}</span>
                          <span className="text-white text-sm font-medium">{v}</span>
                        </div>
                      ))}
                      {form.project_description && (
                        <div className="py-2.5">
                          <span className="text-white/55 text-sm">Description</span>
                          <p className="text-white text-sm mt-1">{form.project_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <Button variant="outline" onClick={prev} className="gap-2 border-white/15 text-white/80 hover:bg-white/5 hover:text-white"><ArrowLeft size={15} /> Back</Button>
              ) : <div />}
              {step < steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                    boxShadow: "0 10px 30px -10px hsla(320,90%,55%,0.55)",
                  }}
                >
                  Continue <ArrowRight size={15} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                    boxShadow: "0 10px 30px -10px hsla(320,90%,55%,0.55)",
                  }}
                >
                  <Send size={15} /> {submitting ? "Sending..." : "Submit Request"}
                </motion.button>
              )}
            </div>

            {/* Bottom reveal edge */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, hsl(320,90%,55%), hsl(270,92%,55%))",
              }}
            />
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default GetQuotePage;

