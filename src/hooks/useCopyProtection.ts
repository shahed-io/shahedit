import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CopyProtectionSettings = {
  enabled: boolean;
  disableRightClick: boolean;
  disableTextSelection: boolean;
  disableCopy: boolean;
  disableDevtoolsKeys: boolean;
  disableImageDrag: boolean;
  disablePrint: boolean;
  showWarning: boolean;
  warningMessage: string;
  watermarkEnabled: boolean;
  watermarkText: string;
  excludeAdmin: boolean;
};

export const DEFAULT_COPY_PROTECTION: CopyProtectionSettings = {
  enabled: false,
  disableRightClick: true,
  disableTextSelection: true,
  disableCopy: true,
  disableDevtoolsKeys: true,
  disableImageDrag: true,
  disablePrint: false,
  showWarning: true,
  warningMessage: "এই কন্টেন্ট কপি করা যাবে না — © Shahed IT",
  watermarkEnabled: false,
  watermarkText: "© Shahed IT",
  excludeAdmin: true,
};

export function useCopyProtectionSettings() {
  const [settings, setSettings] = useState<CopyProtectionSettings>(DEFAULT_COPY_PROTECTION);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "copy_protection")
      .maybeSingle();
    if (data?.value) {
      try {
        setSettings({ ...DEFAULT_COPY_PROTECTION, ...JSON.parse(data.value) });
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { settings, setSettings, loading, reload: load };
}

let warnTimer: number | null = null;
function warnOnce(msg: string) {
  if (warnTimer) return;
  toast.warning(msg);
  warnTimer = window.setTimeout(() => {
    warnTimer = null;
  }, 1500);
}

/** Applies copy protection on the public site (not admin). */
export function useApplyCopyProtection() {
  const { settings } = useCopyProtectionSettings();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/ceo");

  useEffect(() => {
    if (settings.excludeAdmin && isAdmin) return;
    const anyOn =
      settings.disableRightClick ||
      settings.disableTextSelection ||
      settings.disableCopy ||
      settings.disableDevtoolsKeys ||
      settings.disableImageDrag ||
      settings.disablePrint ||
      settings.watermarkEnabled;
    if (!anyOn) return;

    const s = settings;
    const warn = () => s.showWarning && warnOnce(s.warningMessage);

    // --- Frame-busting: prevent embedding in iframe to copy content via wrapper ---
    try {
      if (window.top && window.top !== window.self) {
        // best-effort redirect out of foreign iframe
        (window.top as Window).location.href = window.location.href;
      }
    } catch {
      // cross-origin — cannot read top; still try to break out
      try { window.location.href = window.location.href; } catch { /* ignore */ }
    }

    // --- Inject hardened CSS (works even if JS handlers are removed) ---
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-copy-protect-style", "1");
    const rules: string[] = [];
    if (s.disableTextSelection) {
      rules.push(`
        html, body, body * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }
        input, textarea, [contenteditable="true"], [data-allow-select] {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        ::selection { background: transparent !important; color: inherit !important; }
        ::-moz-selection { background: transparent !important; color: inherit !important; }
      `);
    }
    if (s.disableImageDrag) {
      rules.push(`
        img, picture, video, svg { -webkit-user-drag: none !important; user-drag: none !important; pointer-events: auto; }
      `);
    }
    if (s.disablePrint) {
      // Blank the page on print
      rules.push(`
        @media print {
          html, body { display: none !important; visibility: hidden !important; background: #fff !important; }
        }
      `);
    }
    styleEl.textContent = rules.join("\n");
    document.head.appendChild(styleEl);

    // --- Event handlers (capture phase — harder to override / stopPropagation) ---
    const onContext = (e: MouseEvent) => {
      if (!s.disableRightClick) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      warn();
    };
    const onCopy = (e: ClipboardEvent) => {
      if (!s.disableCopy) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      // Overwrite clipboard with a notice so any bypass gets only the warning
      try {
        e.clipboardData?.setData("text/plain", s.warningMessage);
        e.clipboardData?.setData("text/html", `<p>${s.warningMessage}</p>`);
        navigator.clipboard?.writeText(s.warningMessage).catch(() => {});
      } catch { /* ignore */ }
      warn();
    };
    const onDragStart = (e: DragEvent) => {
      if (!s.disableImageDrag) return;
      const t = e.target as HTMLElement;
      if (t?.tagName === "IMG" || t?.tagName === "PICTURE" || t?.tagName === "VIDEO") {
        e.preventDefault();
        e.stopImmediatePropagation();
        warn();
      }
    };
    const onSelectStart = (e: Event) => {
      if (!s.disableTextSelection) return;
      const t = e.target as HTMLElement;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (t as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (s.disableCopy && ctrl && (key === "c" || key === "x" || key === "a")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        warn();
        return;
      }
      if (s.disablePrint && ctrl && (key === "p" || key === "s")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        warn();
        return;
      }
      if (s.disableDevtoolsKeys) {
        if (key === "f12" || key === "printscreen") {
          e.preventDefault();
          e.stopImmediatePropagation();
          warn();
          return;
        }
        if (ctrl && e.shiftKey && ["i", "j", "c", "k"].includes(key)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          warn();
          return;
        }
        if (ctrl && (key === "u" || key === "s")) {
          e.preventDefault();
          e.stopImmediatePropagation();
          warn();
          return;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      // PrintScreen fires on keyup — clear clipboard best-effort
      if (s.disableDevtoolsKeys && e.key === "PrintScreen") {
        try { navigator.clipboard?.writeText(s.warningMessage).catch(() => {}); } catch { /* ignore */ }
        warn();
      }
    };
    const onBeforePrint = () => {
      if (!s.disablePrint) return;
      warn();
    };

    // Use capture=true so page scripts can't easily suppress via stopPropagation
    document.addEventListener("contextmenu", onContext, true);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCopy, true);
    document.addEventListener("dragstart", onDragStart, true);
    document.addEventListener("selectstart", onSelectStart, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("beforeprint", onBeforePrint, true);

    // Watermark overlay
    let watermarkEl: HTMLDivElement | null = null;
    if (s.watermarkEnabled && s.watermarkText) {
      watermarkEl = document.createElement("div");
      watermarkEl.setAttribute("data-copy-protect-watermark", "1");
      watermarkEl.style.cssText = `
        position:fixed;inset:0;pointer-events:none;z-index:9999;
        background-image:repeating-linear-gradient(-30deg, transparent 0 180px, rgba(0,0,0,0.04) 180px 360px);
        display:flex;flex-wrap:wrap;align-content:flex-start;
        font-family:sans-serif;font-size:18px;color:rgba(0,0,0,0.07);
        text-shadow:0 0 1px rgba(255,255,255,0.5);
        overflow:hidden;
      `;
      for (let i = 0; i < 60; i++) {
        const span = document.createElement("span");
        span.textContent = s.watermarkText;
        span.style.cssText = "padding:40px 60px;transform:rotate(-22deg);white-space:nowrap;";
        watermarkEl.appendChild(span);
      }
      document.body.appendChild(watermarkEl);
    }

    // --- MutationObserver: re-apply if attacker removes style/watermark from DOM ---
    const observer = new MutationObserver(() => {
      if (!document.head.contains(styleEl)) {
        try { document.head.appendChild(styleEl); } catch { /* ignore */ }
      }
      if (watermarkEl && !document.body.contains(watermarkEl)) {
        try { document.body.appendChild(watermarkEl); } catch { /* ignore */ }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Periodic sweep: clear stray selections when text selection disabled
    let sweeper: number | null = null;
    if (s.disableTextSelection) {
      sweeper = window.setInterval(() => {
        const sel = window.getSelection();
        if (sel && sel.toString().length > 0) {
          const active = document.activeElement as HTMLElement | null;
          const tag = active?.tagName;
          if (tag !== "INPUT" && tag !== "TEXTAREA" && !active?.isContentEditable) {
            sel.removeAllRanges();
          }
        }
      }, 800);
    }

    return () => {
      document.removeEventListener("contextmenu", onContext, true);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCopy, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("selectstart", onSelectStart, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("beforeprint", onBeforePrint, true);
      observer.disconnect();
      if (sweeper) window.clearInterval(sweeper);
      if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      if (watermarkEl) watermarkEl.remove();
    };
  }, [settings, isAdmin]);
}

