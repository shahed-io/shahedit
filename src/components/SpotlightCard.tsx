import { useRef, useState, useCallback, useEffect } from "react";
import { motion, MotionProps, useAnimationFrame } from "framer-motion";

interface SpotlightCardProps extends MotionProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

// Traveling border beam using CSS outline trick + rotating gradient
const BorderBeam = ({ color, active }: { color: string; active: boolean }) => {
  const [angle, setAngle] = useState(0);
  const startTime = useRef<number | null>(null);

  useAnimationFrame((t) => {
    if (!active) return;
    if (startTime.current === null) startTime.current = t;
    const elapsed = t - startTime.current;
    // Full rotation every 1.6 seconds
    setAngle((elapsed / 1600) * 360);
  });

  useEffect(() => {
    if (!active) {
      startTime.current = null;
      setAngle(0);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute -inset-[1.5px] rounded-[inherit]"
      style={{
        zIndex: 10,
        borderRadius: 'inherit',
        background: `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, ${color} 45deg, ${color} 90deg, transparent 120deg, transparent 360deg)`,
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: '1.5px',
      }}
    >
      {/* glow blur layer */}
      <div
        className="absolute -inset-[2px] rounded-[inherit] opacity-60"
        style={{
          background: `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, ${color} 45deg, ${color} 90deg, transparent 120deg, transparent 360deg)`,
          filter: 'blur(6px)',
          zIndex: -1,
        }}
      />
    </div>
  );
};

const SpotlightCard = ({
  children,
  color = "rgba(139,92,246,0.9)",
  className = "",
  style,
  onClick,
  ...motionProps
}: SpotlightCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsActive((prev) => !prev);
      onClick?.(e);
    },
    [onClick]
  );

  // Auto-stop after 3 seconds
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsActive(false), 3000);
    return () => clearTimeout(timer);
  }, [isActive]);

  // Solid color for beam (strip alpha)
  const solidColor = color
    .replace(/rgba?\((\d+),\s*(\d+),\s*(\d+).*\)/, "rgb($1,$2,$3)")
    .replace(/hsla?\(([^)]+)\)/, (_, g) => `hsl(${g.split(",").slice(0, 3).join(",")})`);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`relative ${className}`}
      style={style}
      {...motionProps}
    >
      {/* Mouse-follow border glow (hover) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovered && !isActive ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color} 0%, transparent 65%)`,
          zIndex: 0,
        }}
      />

      {/* Inner mask for border-only hover glow */}
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[inherit]"
        style={{ background: "inherit", zIndex: 1 }}
      />

      {/* Inner fill glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color.replace(/[\d.]+\)$/, "0.10)")} 0%, transparent 55%)`,
          zIndex: 2,
        }}
      />

      {/* Rotating border beam on click */}
      <BorderBeam color={solidColor} active={isActive} />

      {/* Content */}
      <div className="relative" style={{ zIndex: 3 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;
