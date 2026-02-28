import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Bot, X, Sparkles, Phone } from "lucide-react";

interface FloatingContactProps {
  onOpenAI: () => void;
}

export default function FloatingContactButton({ onOpenAI }: FloatingContactProps) {
  const [open, setOpen] = useState(false);

  const options = [
    {
      id: "ai",
      label: "AI Support",
      sublabel: "তাৎক্ষণিক উত্তর পান",
      icon: Bot,
      gradient: "linear-gradient(135deg, hsl(258,90%,58%), hsl(258,70%,42%))",
      glow: "rgba(139,92,246,0.4)",
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
                  background: "hsl(222,45%,6%)",
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

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: open
            ? "linear-gradient(135deg, hsl(222,45%,12%), hsl(222,40%,16%))"
            : "linear-gradient(135deg, hsl(258,90%,58%), hsl(185,100%,42%))",
          border: open ? "1px solid rgba(255,255,255,0.12)" : "none",
          boxShadow: open
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(139,92,246,0.45)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="spark"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Phone size={20} className="text-white" fill="white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(139,92,246,0.25)" }} />
        )}
      </motion.button>
    </div>
  );
}
