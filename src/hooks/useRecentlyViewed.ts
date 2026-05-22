import { useCallback, useEffect, useState } from "react";

const KEY = "recently_viewed_packages";
const MAX = 8;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("recently-viewed-updated"));
  } catch {
    /* ignore */
  }
}

export function useRecentlyViewedIds() {
  const [ids, setIds] = useState<string[]>(() => read());

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener("recently-viewed-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recently-viewed-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  return { ids, clear };
}

export function trackRecentlyViewed(id: string | null | undefined) {
  if (!id) return;
  const current = read();
  const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX);
  write(next);
}
