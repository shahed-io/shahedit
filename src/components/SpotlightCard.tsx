import { useRef, useState, useCallback } from "react";
import { motion, MotionProps } from "framer-motion";

interface SpotlightCardProps extends MotionProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const SpotlightCard = ({ children, color = "rgba(139,92,246,0.6)", className = "", style, ...motionProps }: SpotlightCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className}`}
      style={style}
      {...motionProps}
    >
      {/* Border spotlight layer — sits outside as a glow ring */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color} 0%, transparent 65%)`,
          zIndex: 0,
        }}
      />

      {/* Inner mask to recreate border-only glow */}
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[inherit]"
        style={{
          background: "inherit",
          zIndex: 1,
        }}
      />

      {/* Subtle inner fill glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color.replace(/[\d.]+\)$/, "0.12)")} 0%, transparent 55%)`,
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 3 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;
