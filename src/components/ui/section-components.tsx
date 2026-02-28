import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeader = ({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) => (
  <div className={cn("mb-12 md:mb-16", align === "center" ? "text-center" : "text-left", className)}>
    {label && (
      <span className="section-label" aria-label={label}>{label}</span>
    )}
    <h2 className={cn("section-title mt-2 mb-4", label && "mt-3")}>
      {title}
    </h2>
    {description && (
      <p className={cn("section-description text-muted-foreground", align === "center" && "mx-auto")}>
        {description}
      </p>
    )}
    <div className={cn("section-divider mt-5", align === "center" && "mx-auto")} aria-hidden="true" />
  </div>
);

interface CTASectionProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export const CTASection = ({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}: CTASectionProps) => (
  <section className={cn("section-py bg-primary", className)} aria-labelledby="cta-heading">
    <div className="container mx-auto px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-white/80 text-lg mb-8 leading-relaxed">{description}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold text-sm transition-all hover:bg-white/90 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {primaryLabel}
          </a>
          {secondaryLabel && secondaryHref && (
            <a
              href={secondaryHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/40 text-white rounded-lg font-semibold text-sm transition-all hover:bg-white/10 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  </section>
);
