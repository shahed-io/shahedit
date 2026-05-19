import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Royal Purple + Magenta admin UI primitives — premium glassmorphism */

export const AdminPage = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("min-h-full text-foreground", className)}>{children}</div>
);

export const AdminPageHeader = ({
  title, subtitle, icon: Icon, actions,
}: {
  title: string; subtitle?: string; icon?: LucideIcon; actions?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-white/[0.02] to-accent/[0.06] backdrop-blur-xl shadow-[0_12px_40px_-16px_hsl(var(--primary)/0.45)]"
  >
    {/* ambient glow */}
    <div className="pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full bg-primary/25 blur-[110px]" />
    <div className="pointer-events-none absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-accent/20 blur-[110px]" />
    {/* hairline top sheen */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-6 md:p-7">
      <div className="flex items-start gap-4">
        {Icon && (
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 via-primary/15 to-accent/20 border border-primary/40 flex items-center justify-center shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.7),inset_0_1px_0_hsl(var(--primary)/0.4)]"
          >
            <Icon className="w-6 h-6 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
            <span className="absolute -inset-px rounded-2xl ring-1 ring-inset ring-white/10" />
          </motion.div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold font-syne tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1.5 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  </motion.div>
);

export const GlassCard = ({
  children, className, hover = false,
}: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <motion.div
    whileHover={hover ? { y: -3 } : undefined}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    className={cn(
      "group relative rounded-2xl border border-primary/15 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.25)] overflow-hidden",
      hover && "transition-shadow hover:border-primary/30 hover:shadow-[0_18px_48px_-16px_hsl(var(--primary)/0.5)]",
      className
    )}
  >
    {/* inner top highlight */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
    {children}
  </motion.div>
);

export const KpiCard = ({
  label, value, delta, icon: Icon, accent = "violet",
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  accent?: "violet" | "magenta" | "emerald" | "rose" | "sky" | "amber";
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
  return (
    <GlassCard hover className="p-5">
      {/* ambient corner glow */}
      <div className={cn("pointer-events-none absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-500", a.glow)} />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">{label}</p>
          <p className="text-3xl font-extrabold font-syne mt-2 tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
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
};

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold font-syne text-foreground/90 mb-4 flex items-center gap-2.5 tracking-tight">
    <span className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
    {children}
  </h2>
);
