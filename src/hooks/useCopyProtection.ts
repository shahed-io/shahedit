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

    const onContext = (e: MouseEvent) => {
      if (!s.disableRightClick) return;
      e.preventDefault();
      warn();
    };
    const onCopy = (e: ClipboardEvent) => {
      if (!s.disableCopy) return;
      e.preventDefault();
      warn();
    };
    const onDragStart = (e: DragEvent) => {
      if (!s.disableImageDrag) return;
      const t = e.target as HTMLElement;
      if (t?.tagName === "IMG") {
        e.preventDefault();
        warn();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (s.disableCopy && ctrl && (key === "c" || key === "x")) {
        e.preventDefault();
        warn();
        return;
      }
      if (s.disablePrint && ctrl && (key === "p" || key === "s")) {
        e.preventDefault();
        warn();
        return;
      }
      if (s.disableDevtoolsKeys) {
        if (key === "f12") {
          e.preventDefault();
          warn();
          return;
        }
        if (ctrl && e.shiftKey && ["i", "j", "c"].includes(key)) {
          e.preventDefault();
          warn();
          return;
        }
        if (ctrl && key === "u") {
          e.preventDefault();
          warn();
          return;
        }
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);

    const body = document.body;
    const prevSelect = body.style.userSelect;
    if (s.disableTextSelection) {
      body.style.userSelect = "none";
      (body.style as any).webkitUserSelect = "none";
    }

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

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
      body.style.userSelect = prevSelect;
      (body.style as any).webkitUserSelect = prevSelect;
      if (watermarkEl) watermarkEl.remove();
    };
  }, [settings, isAdmin]);
}
