import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Target,
  Tag,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import {
  fetchTechBySlug,
  fetchPublishedTechs,
  fallbackRows,
  type TechRow,
} from "@/lib/tech-details-api";

const TechDetailPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [detail, setDetail] = useState<TechRow | null | undefined>(undefined);
  const [all, setAll] = useState<TechRow[]>(fallbackRows);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    fetchTechBySlug(slug).then(setDetail);
    fetchPublishedTechs().then(setAll);
  }, [slug]);

  if (detail === undefined) return null;
  if (!detail) return <Navigate to="/" replace />;
  const meta = { color: detail.color, symbol: detail.symbol };

  // Related technologies (same category)
  const related = all
    .filter((t) => t.category === detail.category && t.slug !== detail.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      <SEO
        title={`${detail.name} — কী, কেন ও কোথায় ব্যবহার করবেন | ShahedIT`}
        description={detail.tagline}
      />
      <SiteHeader />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${meta.color}22, transparent 70%)`,
            opacity: 0.4,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(320,90%,55%,0.18), transparent 70%)",
          }}
        />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-10 md:py-14">
        {/* Back */}
        <Link
          to="/#tech-stack"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> সব technology দেখুন
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-white/[0.08] overflow-hidden p-7 md:p-10 mb-8"
          style={{
            background:
              "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
            boxShadow:
              "0 30px 80px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${meta.color}40, transparent 70%)`,
            }}
          />

          <div className="flex flex-col md:flex-row md:items-center gap-6 relative">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-3xl md:text-4xl font-black shrink-0"
              style={{
                background: `${meta.color}20`,
                color: meta.color,
                boxShadow: `0 14px 40px -10px ${meta.color}70`,
                border: `1px solid ${meta.color}40`,
              }}
            >
              {meta.symbol}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-3"
                style={{
                  background: `${meta.color}18`,
                  color: meta.color,
                  border: `1px solid ${meta.color}35`,
                }}
              >
                <Tag size={10} /> {detail.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-black font-syne text-white leading-tight">
                {detail.name}
              </h1>
              <p className="text-base md:text-lg text-white/60 mt-3 max-w-2xl">
                {detail.tagline}
              </p>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{
              background: `linear-gradient(90deg, ${meta.color}, hsl(270,92%,55%))`,
            }}
          />
        </motion.div>

        {/* Body */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="এটা কী?" icon={<BookOpen size={14} />}>
              <p className="text-white/80 leading-relaxed text-[15px]">
                {detail.what_is_it}
              </p>
            </Card>

            <Card title="ইতিহাস ও উৎপত্তি" icon={<Sparkles size={14} />}>
              <p className="text-white/80 leading-relaxed text-[15px]">
                {detail.history}
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-5 border border-white/[0.06]"
                style={{ background: "rgba(34,197,94,0.05)" }}
              >
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-emerald-400 mb-3">
                  <CheckCircle2 size={14} /> সুবিধা
                </h4>
                <ul className="space-y-2.5">
                  {detail.pros.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-white/80 leading-relaxed"
                    >
                      <CheckCircle2
                        size={14}
                        className="shrink-0 mt-1 text-emerald-400"
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-2xl p-5 border border-white/[0.06]"
                style={{ background: "rgba(244,114,182,0.05)" }}
              >
                <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-pink-400 mb-3">
                  <AlertCircle size={14} /> অসুবিধা
                </h4>
                <ul className="space-y-2.5">
                  {detail.cons.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-white/80 leading-relaxed"
                    >
                      <AlertCircle
                        size={14}
                        className="shrink-0 mt-1 text-pink-400"
                      />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 border border-white/[0.06]"
              style={{
                background:
                  "linear-gradient(135deg, hsla(320,90%,55%,0.08), hsla(270,92%,55%,0.08))",
              }}
            >
              <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-[hsl(320,90%,75%)] mb-3">
                <Target size={14} /> কোন কোন কাজে আদর্শ
              </h4>
              <div className="flex flex-wrap gap-2">
                {detail.best_for.map((b, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/85"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div
              className="rounded-2xl p-6 border border-white/[0.08]"
              style={{
                background:
                  "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
              }}
            >
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/55 mb-3">
                {detail.name} দিয়ে শুরু করুন
              </h4>
              <p className="text-sm text-white/65 leading-relaxed mb-5">
                আপনার project এর জন্য {detail.name} সঠিক কিনা — আমাদের expert
                team free consultation দিচ্ছে।
              </p>
              <Link
                to="/get-quote"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] w-full justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(320,90%,55%), hsl(270,92%,55%))",
                  boxShadow:
                    "0 10px 30px -10px hsla(320,90%,55%,0.55)",
                }}
              >
                Free Quote নিন <ArrowRight size={15} />
              </Link>
            </div>

            {related.length > 0 && (
              <div
                className="rounded-2xl p-6 border border-white/[0.08]"
                style={{
                  background:
                    "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
                }}
              >
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/55 mb-4">
                  Related — {detail.category}
                </h4>
                <div className="space-y-2">
                  {related.map((t) => {
                    const tm = techMeta[t.name];
                    const tslug = techNameToSlug[t.name];
                    return (
                      <Link
                        key={t.name}
                        to={`/tech/${tslug}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                          style={{
                            background: `${tm?.color}18`,
                            color: tm?.color,
                            border: `1px solid ${tm?.color}30`,
                          }}
                        >
                          {tm?.symbol}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-white/45 truncate">
                            {t.tagline}
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="rounded-2xl p-6 border border-white/[0.08]"
              style={{
                background:
                  "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
              }}
            >
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/55 mb-4">
                All Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(techSlugMap).map(([s, name]) => {
                  const active = name === detail.name;
                  const tm = techMeta[name];
                  return (
                    <Link
                      key={s}
                      to={`/tech/${s}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
                      style={{
                        background: active
                          ? `${tm?.color}25`
                          : "rgba(255,255,255,0.04)",
                        color: active ? tm?.color : "rgba(255,255,255,0.7)",
                        borderColor: active
                          ? `${tm?.color}50`
                          : "rgba(255,255,255,0.08)",
                      }}
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

const Card = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section
    className="rounded-2xl p-6 border border-white/[0.08]"
    style={{
      background: "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
    }}
  >
    <h4 className="flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase text-[hsl(320,90%,68%)] mb-3">
      {icon} {title}
    </h4>
    {children}
  </section>
);

export default TechDetailPage;
