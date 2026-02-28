import { cn } from "@/lib/utils";

interface SkeletonProps { className?: string; }

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("skeleton", className)} aria-hidden="true" />
);

export const CardSkeleton = () => (
  <div className="tech-card space-y-4" aria-hidden="true">
    <Skeleton className="h-44 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const ListItemSkeleton = () => (
  <div className="flex gap-4 p-4 border border-border rounded-xl" aria-hidden="true">
    <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

export const GridSkeleton = ({ count = 6, variant = "card" }: { count?: number; variant?: "card" | "list" }) => (
  <div
    className={variant === "card" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}
    role="status"
    aria-label="Loading content"
  >
    {[...Array(count)].map((_, i) =>
      variant === "card" ? <CardSkeleton key={i} /> : <ListItemSkeleton key={i} />
    )}
  </div>
);
