import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";


/** Royal Purple + Magenta admin UI primitives — premium glassmorphism */

export const AdminPage = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("min-h-full text-foreground", className)}>{children}</div>
);

export const AdminPageHeader = ({
  title, subtitle, icon: Icon, actions,
}: {
  title: string; subtitle?: string; icon?: LucideIcon; actions?: React.ReactNode;
}) => null;

export const GlassCard = ({
  children, className, hover = false,
}: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <motion.div
    whileHover={hover ? { y: -3 } : undefined}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    className={cn(
      "group relative rounded-2xl border border-primary/15 bg-card/80 backdrop-blur-xl shadow-[0_8px_24px_-14px_hsl(var(--primary)/0.45)] overflow-hidden text-foreground",
      hover && "transition-shadow hover:border-primary/40 hover:shadow-[0_18px_40px_-16px_hsl(var(--primary)/0.45)]",
      className
    )}
  >
    {/* inner top highlight */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent opacity-70" />
    {children}
  </motion.div>
);

export const KpiCard = ({
  label, value, delta, icon: Icon, accent = "violet", href, onClick,
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  accent?: "violet" | "magenta" | "emerald" | "rose" | "sky" | "amber";
  href?: string;
  onClick?: () => void;
}) => {
  const accents = {
    violet:  { tile: "from-primary/35 to-primary/10 border-primary/40 text-primary", glow: "bg-primary/30" },
    magenta: { tile: "from-accent/35 to-accent/10 border-accent/40 text-accent", glow: "bg-accent/30" },
    emerald: { tile: "from-emerald-400/35 to-emerald-600/10 border-emerald-400/40 text-emerald-400", glow: "bg-emerald-500/30" },
    rose:    { tile: "from-rose-400/35 to-rose-600/10 border-rose-400/40 text-rose-400", glow: "bg-rose-500/30" },
    sky:     { tile: "from-sky-400/35 to-sky-600/10 border-sky-400/40 text-sky-400", glow: "bg-sky-500/30" },
    amber:   { tile: "from-amber-400/35 to-amber-600/10 border-amber-400/40 text-amber-400", glow: "bg-amber-500/30" },
  } as const;
  const a = accents[accent];
  const inner = (
    <GlassCard hover className={cn("p-5 h-full", (href || onClick) && "cursor-pointer")}>
      {/* ambient corner glow */}
      <div className={cn("pointer-events-none absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-500", a.glow)} />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">{label}</p>
          <p className="text-3xl font-extrabold font-syne mt-2 tracking-tight text-foreground">
            {value}
          </p>
          {delta && (
            <p className={cn("text-[11px] mt-1.5 font-semibold inline-flex items-center gap-1",
              delta.positive ? "text-emerald-400" : "text-rose-400")}>
              <span>{delta.positive ? "▲" : "▼"}</span> {delta.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center shadow-[inset_0_1px_0_hsl(var(--primary)/0.25)] group-hover:scale-110 transition-transform duration-300",
            a.tile
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {/* subtle bottom accent bar */}
      <div className="relative mt-4 h-0.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div className={cn("h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-accent opacity-60 group-hover:w-2/3 transition-all duration-700")} />
      </div>
    </GlassCard>
  );
  if (href) return <Link to={href} className="block h-full">{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="block h-full w-full text-left">{inner}</button>;
  return inner;
};


export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold font-syne text-foreground/90 mb-4 flex items-center gap-2.5 tracking-tight">
    <span className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
    {children}
  </h2>
);
