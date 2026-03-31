import { Phone, ArrowRight, ArrowUp, MapPin } from "lucide-react";
import logoImg from "@/assets/logo-glossy.png";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  label: string;
  target: string | null;
}

interface FooterColumn {
  title: string;
  items: MenuItem[];
}

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

const SiteFooter = () => {
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(defaultFooterLinks);

  useEffect(() => {
    // Fetch footer menus from DB
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
            return {
              title: menu.name,
              items: (items ?? []) as MenuItem[],
            };
          })
        );

        const nonEmpty = columns.filter(c => c.items.length > 0);
        if (nonEmpty.length > 0) setFooterColumns(nonEmpty);
      });
  }, []);

  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient line */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(258,90%,66%), hsl(185,100%,48%), transparent)' }} />

      <div
        className="relative"
        style={{ background: 'linear-gradient(180deg, hsl(220,42%,4%) 0%, hsl(222,45%,3%) 100%)' }}>

        <div className="absolute inset-0 tech-grid-bg opacity-25" />
        <div className="absolute top-10 right-10 w-[400px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, hsl(258,90%,66%) 0%, transparent 65%)', filter: 'blur(120px)', opacity: 0.07 }} />
        <div className="absolute bottom-10 left-10 w-[350px] h-[250px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, hsl(185,100%,48%) 0%, transparent 65%)', filter: 'blur(100px)', opacity: 0.06 }} />

        <div className="container mx-auto px-4 pt-16 pb-8 relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2">

              <Link to="/">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                    style={{ filter: 'drop-shadow(0 6px 18px hsl(185,100%,48%,0.5))' }}>
                    <img src={logoImg} alt="Shahed IT" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-2xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                    <span style={{ background: 'linear-gradient(135deg, hsl(185,100%,48%), hsl(165,80%,45%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shahed</span>
                    <span className="text-foreground"> IT</span>
                  </span>
                </div>
              </Link>
              <p className="text-foreground/40 text-sm mb-6 leading-relaxed max-w-xs">
                Professional IT agency delivering premium web development, graphic design & digital marketing solutions from Bangladesh.
              </p>
              <div className="space-y-3 text-sm">
                <motion.a whileHover={{ x: 4 }} href="tel:+8801820060046"
                  className="flex items-center gap-3 text-foreground/45 hover:text-primary transition-all group">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.20)' }}>
                    <Phone size={13} style={{ color: 'hsl(258,90%,66%)' }} />
                  </span>
                  01820-060046
                </motion.a>
                <div className="flex items-center gap-3 text-foreground/35">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.20)' }}>
                    <MapPin size={13} style={{ color: 'hsl(45,93%,58%)' }} />
                  </span>
                  Sopura, Rajshahi, Bangladesh
                </div>
              </div>
            </motion.div>

            {/* Dynamic Link columns — Gradient Glassmorphism Cards */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {footerColumns.map((col, ci) =>
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.1 }}
                className="relative rounded-xl sm:rounded-2xl p-3 sm:p-5 overflow-hidden group/card"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05), rgba(139,92,246,0.03))',
                  border: '1px solid rgba(139,92,246,0.15)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12), transparent 70%)' }} />

                <h4 className="font-bold text-foreground/90 mb-4 text-sm uppercase tracking-[0.15em] relative z-10"
                  style={{ background: 'linear-gradient(90deg, hsl(258,90%,76%), hsl(185,100%,60%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-sm relative z-10">
                  {col.items.map((item) =>
                    <li key={item.id}>
                      <Link to={item.target ?? "#"}>
                        <motion.span
                          whileHover={{ x: 4 }}
                          className="text-foreground/45 hover:text-foreground/85 transition-all duration-300 flex items-center gap-1.5 group cursor-pointer">
                          <span className="w-0 h-px group-hover:w-3 transition-all duration-300 rounded-full"
                            style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />
                          {item.label}
                        </motion.span>
                      </Link>
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center gap-5 justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.10), rgba(6,182,212,0.06))', border: '1px solid rgba(139,92,246,0.18)' }}>
            <div>
              <h4 className="font-bold text-foreground/85 mb-1">Stay updated with Shahed IT</h4>
              <p className="text-xs text-foreground/40">Get news, tips and special offers in your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Your email address"
                type="email"
                className="text-sm h-11 rounded-xl border-white/10 bg-white/5 text-foreground placeholder:text-foreground/30 focus-visible:ring-primary/40 min-w-[220px]" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 glossy-btn"
                style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}>
                <ArrowRight size={16} className="text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1"
            >
              <span className="text-xs text-foreground/35">© 2026</span>
              <span className="text-xs font-bold gradient-text tracking-wide">Shahed IT</span>
              <span className="text-xs text-foreground/20 hidden sm:inline">·</span>
              <span className="text-xs text-foreground/30">All Rights Reserved.</span>
              <span className="text-xs text-foreground/20 hidden sm:inline">·</span>
              <span className="flex items-center gap-1 text-xs text-foreground/30">
                Designed &amp; Developed by
                <span className="relative ml-1 font-semibold text-xs"
                  style={{ background: 'linear-gradient(90deg, hsl(258,90%,70%), hsl(185,100%,55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Shahed IT
                  <span className="absolute -bottom-0.5 left-0 w-full h-px rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(258,90%,66%), hsl(185,100%,48%))' }} />
                </span>
              </span>
            </motion.div>
            <motion.button
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-xl flex items-center justify-center glossy-btn shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(258,90%,66%), hsl(185,100%,48%))' }}
            >
              <ArrowUp size={16} className="text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
