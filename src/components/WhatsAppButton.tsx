import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/8801840099853"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 glossy-btn"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" />
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" />
    </motion.a>
  );
};

export default WhatsAppButton;
