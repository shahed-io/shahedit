import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, BookOpen, Target, Tag } from "lucide-react";
import { techDetails } from "@/data/techDetails";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Visual metadata mirroring TechStack.tsx
const techMeta: Record<string, { color: string; symbol: string }> = {
  React: { color: "#61DAFB", symbol: "⚛" },
  "Next.js": { color: "#a0aec0", symbol: "N" },
  "Node.js": { color: "#68D391", symbol: "⬡" },
  TypeScript: { color: "#63B3ED", symbol: "TS" },
  WordPress: { color: "#63AEDE", symbol: "W" },
  PHP: { color: "#A78BFA", symbol: "<?>" },
  Laravel: { color: "#FC8181", symbol: "L" },
  MongoDB: { color: "#68D391", symbol: "M" },
  MySQL: { color: "#63B3ED", symbol: "⊏" },
  Figma: { color: "#F6AD55", symbol: "▣" },
  Flutter: { color: "#63B3ED", symbol: "◇" },
  Python: { color: "#F6E05E", symbol: "🐍" },
};

export const techSlug = (name: string) =>
  name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");

const TechDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const entry = Object.entries(techDetails).find(([name]) => techSlug(name) === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  if (!entry) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">Technology খুঁজে পাওয়া যায়নি</h1>
          <p className="text-foreground/60 mb-6">আপনি যে technology খুঁজছেন সেটা আমাদের list-এ নেই।</p>
          <Link to="/" className="text-primary hover:underline">← হোমে ফিরে যান</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const [name, detail] = entry;
  const meta = techMeta[name] ?? { color: "#a855f7", symbol: name.charAt(0) };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 cross-grid opacity-40" />
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${meta.color}30, transparent 70%)`, opacity: 0.45 }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(320,90%,55%,0.25), transparent 70%)" }}
        />

        <div className="container mx-auto px-4 relative">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition"
          >
            <ArrowLeft size={15} /> পিছনে যান
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center gap-6 max-w-4xl"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black shrink-0"
              style={{
                background: `${meta.color}1F`,
                color: meta.color,
                boxShadow: `0 20px 50px -15px ${meta.color}70`,
                border: `1px solid ${meta.color}45`,
              }}
            >
              {meta.symbol}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3"
                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}35` }}
              >
                <Tag size={10} /> {detail.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white font-syne leading-tight mb-2">
                {detail.name}
              </h1>
              <p className="text-white/60 text-lg">{detail.tagline}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="pb-24 relative">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          {/* What is it */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-7 border border-white/10 backdrop-blur-xl"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.18em] uppercase text-[hsl(320,90%,68%)] mb-4">
              <BookOpen size={14} /> এটা কী?
            </h2>
            <p className="text-white/80 leading-relaxed text-[16px]">{detail.whatIsIt}</p>
          </motion.div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-7 border border-white/10 backdrop-blur-xl"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.18em] uppercase text-[hsl(320,90%,68%)] mb-4">
              <Sparkles size={14} /> ইতিহাস ও উৎপত্তি
            </h2>
            <p className="text-white/80 leading-relaxed text-[16px]">{detail.history}</p>
          </motion.div>

          {/* Pros / Cons */}
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-6 border border-emerald-500/20"
              style={{ background: "rgba(34,197,94,0.06)" }}
            >
              <h3 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-emerald-400 mb-4">
                <CheckCircle2 size={14} /> সুবিধা
              </h3>
              <ul className="space-y-3">
                {detail.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/85 leading-relaxed">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-6 border border-pink-500/20"
              style={{ background: "rgba(244,114,182,0.06)" }}
            >
              <h3 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-pink-400 mb-4">
                <AlertCircle size={14} /> অসুবিধা
              </h3>
              <ul className="space-y-3">
                {detail.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/85 leading-relaxed">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-pink-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Best For */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-7 border border-white/10"
            style={{ background: "linear-gradient(135deg, hsla(320,90%,55%,0.10), hsla(270,92%,55%,0.10))" }}
          >
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-[hsl(320,90%,75%)] mb-4">
              <Target size={14} /> কোন কোন কাজে আদর্শ
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.bestFor.map((b, i) => (
                <span
                  key={i}
                  className="text-sm font-medium px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white/90"
                >
                  {b}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/get-quote"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                boxShadow: "0 10px 30px -10px hsla(320,90%,55%,0.55)",
              }}
            >
              {detail.name} দিয়ে project শুরু করুন <ArrowRight size={15} />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold border border-white/15 text-white/90 hover:bg-white/5 transition"
            >
              সব services দেখুন
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default TechDetailsPage;
