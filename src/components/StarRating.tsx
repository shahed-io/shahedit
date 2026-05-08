import { Star } from "lucide-react";

interface StarRatingProps {
  average: number;
  count?: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

/**
 * Renders 5 stars with a partial fill overlay reflecting `average`.
 * If average is 0, shows muted outline stars and "নতুন" label.
 */
export function StarRating({
  average,
  count,
  size = 16,
  showText = true,
  className = "",
}: StarRatingProps) {
  const safe = Math.max(0, Math.min(5, Number(average) || 0));
  const pct = (safe / 5) * 100;
  const gold = "hsl(45,93%,58%)";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative inline-flex">
        {/* Background outline stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={size} className="text-foreground/20" />
          ))}
        </div>
        {/* Filled overlay clipped by width */}
        <div
          className="absolute inset-0 overflow-hidden flex gap-0.5 pointer-events-none"
          style={{ width: `${pct}%` }}
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={size}
              style={{ color: gold, fill: gold, flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
      {showText && (
        <span className="text-xs text-foreground/55 font-medium">
          {safe > 0 ? (
            <>
              {toBn(safe.toFixed(1))}
              {typeof count === "number" && count > 0 && (
                <span className="text-foreground/40"> · {toBn(count)} রিভিউ</span>
              )}
            </>
          ) : (
            <span className="text-foreground/40">এখনো কোনো রিভিউ নেই</span>
          )}
        </span>
      )}
    </div>
  );
}
