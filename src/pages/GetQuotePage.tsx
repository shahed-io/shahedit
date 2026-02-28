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
import WhatsAppButton from "@/components/WhatsAppButton";
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
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Free Consultation</span>
            <h1 className="text-4xl font-bold text-foreground mt-3 mb-4">Get a <span className="gradient-text">Free Quote</span></h1>
            <p className="text-muted-foreground">Tell us about your project and we'll provide a custom quote</p>
          </motion.div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step ? "bg-accent text-white" : i === step ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-secondary text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-8 h-0.5 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="glossy-card rounded-3xl border border-border p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                {step === 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">What service do you need?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {services.map(s => (
                        <button key={s} onClick={() => setForm(p => ({ ...p, service_interested: s }))}
                          className={`p-3.5 rounded-xl border text-sm font-medium text-left transition-all ${
                            form.service_interested === s ? "border-primary bg-primary/10 text-primary shadow-md" : "border-border bg-secondary/50 text-foreground hover:border-primary/50"
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-4">What's your budget?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {budgets.map(b => (
                          <button key={b} onClick={() => setForm(p => ({ ...p, budget_range: b }))}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.budget_range === b ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground"}`}
                          >{b}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-3">Timeline</h3>
                      <div className="flex flex-wrap gap-2">
                        {timelines.map(t => (
                          <button key={t} onClick={() => setForm(p => ({ ...p, timeline: t }))}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.timeline === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground"}`}
                          >{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs mb-1.5 block">Project Description</Label>
                      <textarea value={form.project_description} onChange={e => setForm(p => ({ ...p, project_description: e.target.value }))} rows={3}
                        placeholder="Briefly describe your project..."
                        className="w-full bg-background border border-input rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">Your contact details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[["name", "Full Name *"], ["email", "Email Address *"], ["phone", "Phone Number"], ["company", "Company Name"]].map(([key, label]) => (
                        <div key={key}>
                          <Label className="text-muted-foreground text-xs mb-1.5 block">{label}</Label>
                          <Input type={key === "email" ? "email" : "text"} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="h-11" placeholder={label.replace(" *", "")} required={label.includes("*")} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-6">Review your request</h3>
                    <div className="space-y-3">
                      {[
                        ["Service", form.service_interested],
                        ["Budget", form.budget_range],
                        ["Timeline", form.timeline],
                        ["Name", form.name],
                        ["Email", form.email],
                        ["Phone", form.phone],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex justify-between py-2.5 border-b border-border/50">
                          <span className="text-muted-foreground text-sm">{k}</span>
                          <span className="text-foreground text-sm font-medium">{v}</span>
                        </div>
                      ))}
                      {form.project_description && (
                        <div className="py-2.5">
                          <span className="text-muted-foreground text-sm">Description</span>
                          <p className="text-foreground text-sm mt-1">{form.project_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <Button variant="outline" onClick={prev} className="gap-2"><ArrowLeft size={15} /> Back</Button>
              ) : <div />}
              {step < steps.length - 1 ? (
                <Button onClick={next} className="glossy-btn gap-2">Continue <ArrowRight size={15} /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="glossy-btn gap-2">
                  <Send size={15} /> {submitting ? "Sending..." : "Submit Request"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
};

export default GetQuotePage;
