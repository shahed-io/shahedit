import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number using Bangladesh/Indian numbering convention
 * (lakh/crore: 3 digits then groups of 2). Example: 1200000 → "12,00,000".
 */
export function formatBdNumber(n: number | string | null | undefined): string {
  const num = Number(n ?? 0);
  if (!isFinite(num)) return "0";
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Format BDT amount with ৳ symbol using Bangladesh numbering. */
export function formatBdt(n: number | string | null | undefined): string {
  return `৳${formatBdNumber(n)}`;
}
