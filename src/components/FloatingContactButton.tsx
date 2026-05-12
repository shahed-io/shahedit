import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Bot, X, Headphones } from "lucide-react";

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
      gradient: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
      glow: "hsl(var(--primary) / 0.35)",
      onClick: () => { setOpen(false); onOpenAI(); },
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      sublabel: "সরাসরি কথা বলুন",
      icon: MessageCircle,
      gradient: "linear-gradient(135deg, hsl(var(--success-green) / 0.78), hsl(var(--success-green)))",
      glow: "hsl(var(--success-green) / 0.28)",
      onClick: () => { window.open("https://wa.me/8801820060046?text=Hello%2C%20I%20need%20your%20service.", "_blank"); setOpen(false); },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Options */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-[calc(100vw-2rem)] max-w-[23rem] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            style={{ boxShadow: "0 20px 60px hsl(var(--background) / 0.65), 0 0 34px hsl(var(--primary) / 0.22)" }}
          >
            <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <Headphones size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">Support</p>
                  <p className="mt-0.5 truncate text-xs text-primary-foreground/75">কীভাবে সাহায্য করতে পারি?</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close support menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 transition hover:bg-primary-foreground/25"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 p-3">
            {options.map((opt, i) => (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 340, damping: 26 }}
                onClick={opt.onClick}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/70 p-2.5 text-left transition hover:bg-secondary"
                style={{
                  boxShadow: `0 10px 28px ${opt.glow}`,
                }}
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ background: opt.gradient }}>
                  <opt.icon size={18} />
                </div>
                {/* Text */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-foreground">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{opt.sublabel}</p>
                </div>
              </motion.button>
            ))}

            {/* Divider label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="px-1 text-right text-xs text-muted-foreground"
            >
              কোনটি পছন্দ করবেন?
            </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "Need help?" tooltip - hides when open */}
      <AnimatePresence>
        {!open && (
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
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          aria-label="Open support menu"
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary-foreground/30"
          style={{
            background: "radial-gradient(circle at 30% 25%, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary)) 45%, hsl(var(--accent)) 100%)",
            boxShadow: "0 14px 42px hsl(var(--primary) / 0.45), inset 0 2px 8px hsl(var(--primary-foreground) / 0.32), inset 0 -4px 10px hsl(var(--background) / 0.25)",
          }}
        >

        {/* Glossy top highlight */}
        <span
          aria-hidden
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 15%, hsl(var(--primary-foreground) / 0.55), transparent 55%)",
          }}
        />

        {/* Icon */}
        <motion.span
          initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 drop-shadow-[0_2px_4px_hsl(var(--background)/0.4)]"
        >
          <Headphones size={26} className="text-primary-foreground" strokeWidth={2.4} />
        </motion.span>

        {/* Online status dot */}
        <span
          className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center z-10"
          style={{
            background: "hsl(var(--card))",
            boxShadow: "0 2px 6px hsl(var(--background) / 0.4)",
          }}
        >
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
        </span>
        </motion.button>
      )}
    </div>
  );
}
