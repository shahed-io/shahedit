import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Phone, Send } from "lucide-react";

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup Card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-72 rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: "1px solid rgba(37,211,102,0.25)", background: "hsl(220,42%,4%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle size={20} className="text-white" fill="white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Shahed IT Support</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
                    <p className="text-white/80 text-xs">Online now · Fast reply</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition">
                <X size={13} className="text-white" />
              </button>
            </div>

            {/* Chat bubble */}
            <div className="px-4 py-4">
              <div className="rounded-xl rounded-tl-sm px-4 py-3 text-sm text-white/85 leading-relaxed max-w-[90%]"
                style={{ background: "rgba(37,211,102,0.10)", border: "1px solid rgba(37,211,102,0.18)" }}>
                👋 হ্যালো! আমরা Shahed IT থেকে বলছি।<br />
                <span className="text-white/60 text-xs">কীভাবে সাহায্য করতে পারি?</span>
              </div>
              <p className="text-xs mt-2 ml-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                🔒 Secure & Private
              </p>
            </div>

            {/* Buttons */}
            <div className="px-4 pb-4 space-y-2">
              <motion.a
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                href="https://wa.me/8801820060046?text=Hello%2C%20I%20need%20your%20service."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}
              >
                <Send size={14} /> Start Chat on WhatsApp
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                href="tel:+8801820060046"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white/70 text-sm transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Phone size={14} /> 01820-060046
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Chat on WhatsApp"
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 32px rgba(37,211,102,0.35)" }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={26} fill="white" className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(37,211,102,0.3)" }} />
        )}

        {/* Notification dot */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-black flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">1</span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
