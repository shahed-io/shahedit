import { Phone, ArrowRight, ArrowUp, MapPin, Mail, Clock, Facebook, Instagram, Linkedin, Youtube, Send } from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem { id: string; label: string; target: string | null; }
interface FooterColumn { title: string; items: MenuItem[]; }

const defaultFooterLinks: FooterColumn[] = [
  { title: "Services", items: [
    { id: "1", label: "Web Development", target: "/services" },
    { id: "2", label: "Graphics Design", target: "/services" },
    { id: "3", label: "Digital Marketing", target: "/services" },
    { id: "4", label: "IT Support", target: "/services" },
    { id: "5", label: "Facebook Marketing", target: "/services" },
  ]},
  { title: "Company", items: [
    { id: "6", label: "About Us", target: "/about" },
    { id: "7", label: "Portfolio", target: "/portfolio" },
    { id: "8", label: "Blog", target: "/blog" },
    { id: "9", label: "Careers", target: "/careers" },
    { id: "10", label: "Contact", target: "/contact" },
  ]},
  { title: "Resources", items: [
    { id: "11", label: "FAQs", target: "/faq" },
    { id: "14", label: "Terms & Conditions", target: "/terms" },
    { id: "15", label: "Privacy Policy", target: "/privacy-policy" },
    { id: "16", label: "Refund Policy", target: "/refund-policy" },
    { id: "17", label: "Delivery Policy", target: "/delivery-policy" },
    { id: "18", label: "Complaint Policy", target: "/complaint-policy" },
  ]},
];

const socialLinks = [
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hsl(217,90%,60%)" },
  { Icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hsl(330,80%,60%)" },
  { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hsl(210,90%,55%)" },
  { Icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "hsl(0,80%,60%)" },
];

const SiteFooter = () => {
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(defaultFooterLinks);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase
      .from("cms_menus")
      .select("id, name, location")
      .eq("location", "footer")
      .then(async ({ data: menus }) => {
        if (!menus || menus.length === 0) return;
        const columns: FooterColumn[] = await Promise.all(
          menus.map(async (menu) => {
            const { data: items } = await supabase
              .from("menu_items")
              .select("id, label, target")
              .eq("menu_id", menu.id)
              .is("parent_id", null)
              .order("sort_order");
            return { title: menu.name, items: (items ?? []) as MenuItem[] };
          })
        );
        const nonEmpty = columns.filter(c => c.items.length > 0);
        if (nonEmpty.length > 0) setFooterColumns(nonEmpty);
      });
  }, []);

  return (
    <footer className="relative overflow-hidden mt-20">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
      <div className="h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent mt-px" />

      <div
        className="relative"
        style={{ background: 'linear-gradient(180deg, hsl(222,47%,6%) 0%, hsl(224,50%,4%) 50%, hsl(222,47%,3%) 100%)' }}
      >
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.10 }} />
        <div className="absolute bottom-0 left-0 w-[450px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(110px)', opacity: 0.08 }} />
        <div className="absolute inset-0 tech-grid-bg opacity-[0.18] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 pt-16 pb-8 relative">
          {/* Newsletter — top, prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-6 sm:p-8 mb-12 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(20,184,166,0.10) 60%, rgba(139,92,246,0.06))',
              border: '1px solid rgba(139,92,246,0.30)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-purple-500/30 to-teal-400/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}>
                  <Send size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg sm:text-xl mb-1">নিউজলেটার সাবস্ক্রাইব করুন</h4>
                  <p className="text-sm text-white/60">আমাদের নতুন অফার, টিপস ও আপডেট সরাসরি ইনবক্সে পেতে।</p>
                </div>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
                className="flex gap-2 w-full md:w-auto"
              >
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  required
                  className="text-sm h-12 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-purple-400 min-w-[260px]"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-12 px-5 rounded-xl flex items-center gap-2 shrink-0 text-white font-semibold text-sm shadow-lg"
                  style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}
                >
                  Subscribe <ArrowRight size={15} />
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
                <div className="relative w-12 h-12 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-teal-400/40 blur-xl rounded-full" />
                  <img src={logoImg} alt="Shahed IT" className="relative w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(20,184,166,0.5)]" />
                </div>
                <span className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span style={{ background: 'linear-gradient(135deg, hsl(258,90%,72%), hsl(185,100%,55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shahed</span>
                  <span className="text-white"> IT</span>
                </span>
              </Link>

              <p className="text-white/65 text-sm mb-6 leading-relaxed max-w-sm">
                Bangladesh-এর premium IT agency — Web Development, Graphic Design, Digital Marketing ও Cloud Hosting এর One-Stop Solution.
              </p>

              {/* Contact list */}
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:+8801820060046" className="flex items-center gap-3 text-white/75 hover:text-white transition-colors group">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-purple-500/25"
                      style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.30)' }}>
                      <Phone size={14} className="text-purple-300" />
                    </span>
                    <span className="font-medium">01820-060046</span>
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/75">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.30)' }}>
                    <Clock size={14} className="text-teal-300" />
                  </span>
                  <span>সকাল ১০টা — রাত ১০টা</span>
                </li>
                <li>
                  <a href="mailto:info.shahedit@gmail.com" className="flex items-center gap-3 text-white/75 hover:text-white transition-colors group break-all">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-500/25"
                      style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.30)' }}>
                      <Mail size={14} className="text-blue-300" />
                    </span>
                    info.shahedit@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/75">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.30)' }}>
                    <MapPin size={14} className="text-yellow-300" />
                  </span>
                  Sopura, Rajshahi, Bangladesh
                </li>
              </ul>

              {/* Social */}
              <div className="flex items-center gap-2.5 mt-6">
                {socialLinks.map(({ Icon, href, label, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ y: -3, scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color,
                    }}
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Link columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              {footerColumns.map((col, ci) => (
                <motion.div
                  key={col.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.08 }}
                >
                  <h4 className="font-bold text-white text-sm uppercase tracking-[0.18em] mb-5 flex items-center gap-2">
                    <span className="inline-block w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    {col.items.map((item) => (
                      <li key={item.id}>
                        <Link to={item.target ?? "#"} className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                          <span className="w-0 h-px group-hover:w-3 transition-all duration-300 rounded-full"
                            style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />
                          <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.08]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-xs">
              <span className="text-white/55">© {new Date().getFullYear()}</span>
              <span className="font-bold tracking-wide" style={{ background: 'linear-gradient(90deg, hsl(185,100%,55%), hsl(165,80%,50%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shahed IT</span>
              <span className="text-white/30 hidden sm:inline">·</span>
              <span className="text-white/55">All Rights Reserved.</span>
              <span className="text-white/30 hidden sm:inline">·</span>
              <span className="flex items-center gap-1 text-white/55">
                Designed &amp; Developed by
                <span className="font-semibold ml-1" style={{ background: 'linear-gradient(90deg, hsl(258,90%,72%), hsl(185,100%,55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Shahed IT
                </span>
              </span>
            </div>
            <motion.button
              whileHover={{ y: -3, scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}
            >
              <ArrowUp size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
