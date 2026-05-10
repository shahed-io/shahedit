import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", project_description: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Invalid email address"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert([{ ...form, source: "contact_form" as const }]);
    setSubmitting(false);
    if (error) { toast.error("Failed to send. Please try again."); return; }
    toast.success("Message sent! We'll contact you soon.");
    setForm({ name: "", email: "", phone: "", company: "", project_description: "" });
  };

  const info = [
    { icon: MapPin, label: "ঠিকানা", value: "Sopura, Rajshahi, Bangladesh", href: "https://maps.google.com/?q=Sopura,Rajshahi,Bangladesh" },
    { icon: Phone, label: "মোবাইল", value: "01820-060046", href: "tel:01820060046" },
    { icon: Mail, label: "ইমেইল", value: "info@shahedit.com", href: "mailto:info@shahedit.com" },
    { icon: MessageCircle, label: "WhatsApp", value: "01820-060046", href: "https://wa.me/8801820060046" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">যোগাযোগ করুন</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">আমাদের সাথে <span className="gradient-text">যোগাযোগ</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto">ফোন, ইমেইল অথবা WhatsApp-এর মাধ্যমে আমাদের সাথে যোগাযোগ করুন। সাপোর্ট সময়: সকাল ১০:০০ – রাত ১০:০০</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
                {info.map((item, i) => (
                  <motion.a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative flex flex-col items-center justify-center text-center gap-3 p-6 min-h-[180px] glossy-card rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                      <item.icon size={24} className="text-white" />
                    </div>
                    <div className="relative">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-foreground font-semibold text-sm break-all">{item.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="glossy-card rounded-2xl border border-border p-6 h-full flex flex-col"
            >
              <h2 className="text-xl font-bold text-foreground mb-5">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  {[["name", "Your Name *"], ["email", "Email *"], ["phone", "Phone Number"], ["company", "Company"]].map(([key, label]) => (
                    <div key={key}>
                      <Label className="text-muted-foreground text-xs mb-1.5 block">{label}</Label>
                      <Input type={key === "email" ? "email" : "text"} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="h-10" required={key === "name" || key === "email"} />
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col">
                  <Label className="text-muted-foreground text-xs mb-1.5 block">How can we help?</Label>
                  <textarea value={form.project_description} onChange={e => setForm(p => ({ ...p, project_description: e.target.value }))} rows={4} className="w-full flex-1 min-h-[120px] bg-background border border-input rounded-md p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Tell us about your project..." />
                </div>
                <Button type="submit" disabled={submitting} className="w-full gap-2 glossy-btn">
                  <Send size={15} /> {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default ContactPage;
