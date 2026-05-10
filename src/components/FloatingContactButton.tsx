import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Bot, X, Headphones } from "lucide-react";

interface FloatingContactProps {
  onOpenAI: () => void;
}

export default function FloatingContactButton({ onOpenAI }: FloatingContactProps) {
  const [open, setOpen] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("help_tooltip_dismissed") === "1"
  );

  const dismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem("help_tooltip_dismissed", "1");
    setTooltipDismissed(true);
  };

  const options = [
    {
      id: "ai",
      label: "AI Support",
      sublabel: "তাৎক্ষণিক উত্তর পান",
      icon: Bot,
      gradient: "linear-gradient(135deg, hsl(270,92%,58%), hsl(270,75%,42%))",
      glow: "rgba(168,85,247,0.4)",
      onClick: () => { setOpen(false); onOpenAI(); },
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      sublabel: "সরাসরি কথা বলুন",
      icon: MessageCircle,
      gradient: "linear-gradient(135deg, #128C7E, #25D366)",
      glow: "rgba(37,211,102,0.4)",
      onClick: () => { window.open("https://wa.me/8801820060046?text=Hello%2C%20I%20need%20your%20service.", "_blank"); setOpen(false); },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Options */}
      <AnimatePresence>
        {open && (
          <>
            {options.map((opt, i) => (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: 20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.85 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 340, damping: 26 }}
                onClick={opt.onClick}
                className="flex items-center gap-3 pr-4 pl-2 py-2 rounded-2xl shadow-2xl"
                style={{
                  background: "hsl(265,45%,6%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: `0 8px 32px ${opt.glow}`,
                }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: opt.gradient }}>
                  <opt.icon size={18} className="text-white" fill="white" />
                </div>
                {/* Text */}
                <div className="text-left">
                  <p className="text-white text-sm font-semibold leading-tight">{opt.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{opt.sublabel}</p>
                </div>
              </motion.button>
            ))}

            {/* Divider label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-slate-500 pr-1"
            >
              কোনটি পছন্দ করবেন?
            </motion.p>
          </>
        )}
      </AnimatePresence>

      {/* Floating "Need help?" tooltip - hides when open */}
      <AnimatePresence>
        {!open && !tooltipDismissed && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ delay: 1.6, type: "spring", stiffness: 280 }}
            className="absolute right-[5.25rem] bottom-3 select-none"
          >
            <div
              className="relative pl-3.5 pr-7 py-2 rounded-xl shadow-2xl whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, hsl(265,45%,8%), hsl(265,45%,12%))",
                border: "1px solid rgba(168,85,247,0.35)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.25)",
              }}
            >
              {/* Close button */}
              <button
                onClick={dismissTooltip}
                aria-label="Dismiss"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{
                  background: "hsl(265,45%,12%)",
                  border: "1px solid rgba(168,85,247,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                <X size={11} className="text-white" strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-2">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white text-[12px] font-bold leading-none">সাহায্য চাই?</span>
              </div>
              <p className="text-slate-400 text-[10px] mt-1 leading-none">২৪/৭ লাইভ সাপোর্ট</p>
              {/* Arrow */}
              <span
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, hsl(265,45%,8%), hsl(265,45%,12%))",
                  borderRight: "1px solid rgba(168,85,247,0.35)",
                  borderTop: "1px solid rgba(168,85,247,0.35)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button - Round Support Orb */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        aria-label="Support"
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: open
            ? "linear-gradient(135deg, hsl(265,45%,12%), hsl(222,40%,16%))"
            : "radial-gradient(circle at 30% 25%, hsl(258,95%,72%) 0%, hsl(270,92%,58%) 35%, hsl(220,90%,45%) 75%, hsl(320,90%,38%) 100%)",
          border: open ? "1px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(255,255,255,0.35)",
          boxShadow: open
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 12px 40px rgba(168,85,247,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 8px rgba(255,255,255,0.35), inset 0 -4px 10px rgba(0,0,0,0.25)",
        }}
      >
        {/* Rotating conic glow ring (closed only) */}
        {!open && (
          <motion.span
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1.5 rounded-full pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, hsl(270,92%,58%) 0%, hsl(320,90%,42%) 25%, transparent 45%, hsl(270,92%,58%) 75%, hsl(320,90%,42%) 100%)",
              filter: "blur(8px)",
              opacity: 0.7,
              zIndex: -1,
            }}
          />
        )}

        {/* Soft pulse halo */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping pointer-events-none"
            style={{ background: "rgba(168,85,247,0.25)" }}
          />
        )}

        {/* Glossy top highlight */}
        {!open && (
          <span
            aria-hidden
            className="absolute inset-[3px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 15%, rgba(255,255,255,0.55), transparent 55%)",
            }}
          />
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <X size={24} className="text-white" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span key="hp"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            >
              <Headphones size={26} className="text-white" strokeWidth={2.4} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Online status dot */}
        {!open && (
          <span
            className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center z-10"
            style={{
              background: "hsl(265,45%,8%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
