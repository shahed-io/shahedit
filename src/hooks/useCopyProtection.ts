import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CopyProtectionSettings = {
  enabled: boolean;
  disableRightClick: boolean;
  disableTextSelection: boolean;
  disableCopy: boolean;
  disablePaste: boolean;
  disableDevtoolsKeys: boolean;
  detectDevtools: boolean;
  disableImageDrag: boolean;
  disablePrint: boolean;
  blockPrintScreen: boolean;
  disableTouchCallout: boolean;
  disableMiddleClick: boolean;
  blurOnWindowBlur: boolean;
  frameBuster: boolean;
  consoleWarning: boolean;
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
  disablePaste: false,
  disableDevtoolsKeys: true,
  detectDevtools: false,
  disableImageDrag: true,
  disablePrint: false,
  blockPrintScreen: false,
  disableTouchCallout: true,
  disableMiddleClick: false,
  blurOnWindowBlur: false,
  frameBuster: true,
  consoleWarning: true,
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
      settings.disablePaste ||
      settings.disableDevtoolsKeys ||
      settings.detectDevtools ||
      settings.disableImageDrag ||
      settings.disablePrint ||
      settings.blockPrintScreen ||
      settings.disableTouchCallout ||
      settings.disableMiddleClick ||
      settings.blurOnWindowBlur ||
      settings.frameBuster ||
      settings.consoleWarning ||
      settings.watermarkEnabled;
    if (!anyOn) return;

    const s = settings;
    const warn = () => s.showWarning && warnOnce(s.warningMessage);

    // Frame-buster — prevent embedding inside unknown external sites.
    // Never blank the app: Lovable preview/editor runs the site inside an iframe,
    // and clearing body here caused the mobile preview to show only a black screen.
    if (s.frameBuster && window.top !== window.self) {
      const host = window.location.hostname;
      const referrer = document.referrer;
      const isLovablePreview =
        host.includes("lovableproject.com") ||
        host.includes("lovable.app") ||
        referrer.includes("lovable.dev") ||
        referrer.includes("lovable.app") ||
        referrer.includes("lovableproject.com");

      if (!isLovablePreview) {
        try {
          window.top!.location.href = window.location.href;
        } catch {
          // If the browser blocks frame navigation, keep the website visible.
        }
      }
    }

    // Console branding/warning
    if (s.consoleWarning) {
      try {
        console.log(
          "%c⚠ STOP!",
          "color:#e11d48;font-size:48px;font-weight:bold;text-shadow:2px 2px 4px rgba(0,0,0,0.3);"
        );
        console.log("%c" + s.warningMessage, "color:#111;font-size:16px;font-weight:600;");
      } catch {
        /* ignore */
      }
    }

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
    const onPaste = (e: ClipboardEvent) => {
      if (!s.disablePaste) return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as any).isContentEditable)) {
        e.preventDefault();
        warn();
      }
    };
    const onDragStart = (e: DragEvent) => {
      if (!s.disableImageDrag) return;
      const t = e.target as HTMLElement;
      if (t?.tagName === "IMG") {
        e.preventDefault();
        warn();
      }
    };
    const onAuxClick = (e: MouseEvent) => {
      if (s.disableMiddleClick && e.button === 1) {
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
      if (s.disablePaste && ctrl && key === "v") {
        e.preventDefault();
        warn();
        return;
      }
      if (s.disablePrint && ctrl && (key === "p" || key === "s")) {
        e.preventDefault();
        warn();
        return;
      }
      if (s.blockPrintScreen && (key === "printscreen" || e.code === "PrintScreen")) {
        try {
          navigator.clipboard?.writeText("");
        } catch {
          /* ignore */
        }
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

    // DevTools detection via window-size delta
    let devtoolsBlur = false;
    const devtoolsCheck = () => {
      const threshold = 170;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const open = widthDiff > threshold || heightDiff > threshold;
      if (open && !devtoolsBlur) {
        devtoolsBlur = true;
        document.body.style.filter = "blur(14px)";
        warnOnce("DevTools detected — content hidden");
      } else if (!open && devtoolsBlur) {
        devtoolsBlur = false;
        document.body.style.filter = "";
      }
    };
    let devtoolsInterval: number | null = null;
    if (s.detectDevtools) {
      devtoolsInterval = window.setInterval(devtoolsCheck, 1000);
    }

    // Blur when window loses focus (anti screen-share peek)
    let windowBlurred = false;
    const onWinBlur = () => {
      if (!s.blurOnWindowBlur) return;
      windowBlurred = true;
      document.body.style.filter = "blur(10px)";
    };
    const onWinFocus = () => {
      if (windowBlurred) {
        windowBlurred = false;
        if (!devtoolsBlur) document.body.style.filter = "";
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("auxclick", onAuxClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onWinBlur);
    window.addEventListener("focus", onWinFocus);

    const body = document.body;
    const prevSelect = body.style.userSelect;
    const prevCallout = (body.style as any).webkitTouchCallout;
    if (s.disableTextSelection) {
      body.style.userSelect = "none";
      (body.style as any).webkitUserSelect = "none";
    }
    if (s.disableTouchCallout) {
      (body.style as any).webkitTouchCallout = "none";
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
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("auxclick", onAuxClick);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onWinBlur);
      window.removeEventListener("focus", onWinFocus);
      body.style.userSelect = prevSelect;
      (body.style as any).webkitUserSelect = prevSelect;
      (body.style as any).webkitTouchCallout = prevCallout;
      body.style.filter = "";
      if (devtoolsInterval) clearInterval(devtoolsInterval);
      if (watermarkEl) watermarkEl.remove();
    };
  }, [settings, isAdmin]);
}
