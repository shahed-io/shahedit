import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface KineticGlassCardProps {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  image?: string | null;
  fallbackEmoji?: string;
  badge?: string | null;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  index?: number;
  ctaIcon?: ReactNode;
  meta?: ReactNode;
}

/**
 * Premium "Kinetic Glass Case" card.
 * Locked design language: deep #1a0b2e → #0f0620 surface, magenta accent
 * hsl(320,90%,55%), glass badge with pulse dot, gradient title, animated CTA
 * disc and reveal edge. Reused across portfolio/services/category/quote.
 */
const KineticGlassCard = ({
  href,
  target,
  rel,
  onClick,
  image,
  fallbackEmoji = "✦",
  badge,
  eyebrow = "Featured",
  title,
  subtitle,
  index = 0,
  ctaIcon,
  meta,
}: KineticGlassCardProps) => {
  const Comp: any = href ? motion.a : motion.button;
  const compProps: any = href
    ? { href, target, rel }
    : { type: "button", onClick };

  return (
    <Comp
      {...compProps}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 120 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97, y: 0, transition: { duration: 0.12 } }}
      className="group relative block w-full text-left aspect-[16/11] overflow-hidden rounded-3xl cursor-pointer border border-white/[0.06] hover:border-[hsl(320,90%,60%)]/40 transition-all duration-700"
      style={{
        background: "linear-gradient(180deg, #1a0b2e 0%, #0f0620 100%)",
        boxShadow:
          "0 24px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {image ? (
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.1, rotate: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary/15 to-accent/15">
            {fallbackEmoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0212] via-[#0a0212]/45 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(320,90%,55%)]/12 via-transparent to-transparent mix-blend-overlay" />
      </div>

      {/* Top glass badge */}
      {badge && (
        <div className="absolute top-5 left-5 z-10">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg group-hover:bg-[hsl(320,90%,55%)]/20 group-hover:border-[hsl(320,90%,60%)]/40 transition-all duration-500">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: "hsl(320,90%,60%)",
                boxShadow: "0 0 8px hsl(320,90%,60%)",
              }}
            />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/90">
              {badge}
            </span>
          </div>
        </div>
      )}

      {/* Bottom kinetic content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
        <div className="flex flex-col gap-1.5 transform transition-transform duration-700 group-hover:-translate-y-1">
          <span
            className="text-[10px] font-medium tracking-[0.35em] uppercase opacity-80"
            style={{ color: "hsl(320,90%,68%)" }}
          >
            {eyebrow}
          </span>
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-[24px] font-extrabold leading-tight tracking-tight font-syne truncate">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/55">
                  {title}
                </span>
              </h3>
              {subtitle && (
                <p className="text-xs md:text-sm text-white/60 mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
              {meta && <div className="mt-2">{meta}</div>}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: -6 }}
              transition={{ type: "spring", stiffness: 280 }}
              className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0 text-white"
              style={{
                background: "hsl(320,90%,55%)",
                boxShadow: "0 10px 40px -10px hsla(320,90%,55%,0.55)",
              }}
            >
              {ctaIcon ?? (
                <ArrowRight
                  size={20}
                  className="transition-transform duration-500 group-hover:translate-x-0.5"
                />
              )}
              <div className="absolute inset-1 border border-white/20 rounded-xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom reveal edge */}
      <div
        className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 z-10"
        style={{
          background:
            "linear-gradient(90deg, hsl(320,90%,55%), hsl(270,92%,55%))",
        }}
      />
    </Comp>
  );
};

export default KineticGlassCard;
