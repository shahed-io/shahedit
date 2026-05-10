import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Royal Purple + Magenta admin UI primitives — matches the public site theme */

export const AdminPage = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("min-h-full text-foreground", className)}>{children}</div>
);

export const AdminPageHeader = ({
  title, subtitle, icon: Icon, actions,
}: {
  title: string; subtitle?: string; icon?: LucideIcon; actions?: React.ReactNode;
}) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/10 border border-primary/30 flex items-center justify-center shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.5)]">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-syne bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const GlassCard = ({
  children, className, hover = false,
}: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <motion.div
    whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
    className={cn(
      "rounded-2xl border border-primary/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.25)]",
      className
    )}
  >
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
    violet:  "from-primary/30 to-primary/10 border-primary/30 text-primary",
    magenta: "from-accent/30 to-accent/10 border-accent/30 text-accent",
    emerald: "from-emerald-400/30 to-emerald-600/10 border-emerald-400/30 text-emerald-400",
    rose:    "from-rose-400/30 to-rose-600/10 border-rose-400/30 text-rose-400",
    sky:     "from-sky-400/30 to-sky-600/10 border-sky-400/30 text-sky-400",
    amber:   "from-amber-400/30 to-amber-600/10 border-amber-400/30 text-amber-400",
  };
  return (
    <GlassCard hover className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold font-syne mt-2 text-foreground">{value}</p>
          {delta && (
            <p className={cn("text-xs mt-1 font-medium", delta.positive ? "text-emerald-400" : "text-rose-400")}>
              {delta.positive ? "▲" : "▼"} {delta.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center", accents[accent])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold font-syne text-foreground/90 mb-4 flex items-center gap-2">
    <span className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full" />
    {children}
  </h2>
);
