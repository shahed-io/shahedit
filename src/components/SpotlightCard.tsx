import { useRef, useState, useCallback, useEffect } from "react";
import { motion, MotionProps, useAnimationFrame, useMotionValue } from "framer-motion";

interface SpotlightCardProps extends MotionProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

// Border Beam: animated light that travels around all 4 sides
const BorderBeam = ({ color, active }: { color: string; active: boolean }) => {
  const progress = useMotionValue(0);
  const [tick, setTick] = useState(0);

  useAnimationFrame((t) => {
    if (active) {
      // 0 → 1 loop every ~1800ms
      progress.set((t % 1800) / 1800);
      setTick(t); // force re-render
    }
  });

  if (!active) return null;

  const p = progress.get();
  // p goes 0→1 around the perimeter: top→right→bottom→left
  // Convert p to position on each edge
  const perimeter = 4; // normalized: each side = 1 unit
  const pos = p * perimeter;

  // Beam head position (x%, y%) on the border
  let x = 0, y = 0;
  const beamSize = 0.35; // size of tail in perimeter units

  // For the glow dot following the beam
  if (pos < 1) {
    x = pos * 100; y = 0;         // top: left→right
  } else if (pos < 2) {
    x = 100; y = (pos - 1) * 100; // right: top→bottom
  } else if (pos < 3) {
    x = (1 - (pos - 2)) * 100; y = 100; // bottom: right→left
  } else {
    x = 0; y = (1 - (pos - 3)) * 100;   // left: bottom→top
  }

  // Build the SVG path position as percentage of perimeter for the stroke
  const dashArray = `${beamSize * 25}% ${(4 - beamSize) * 25}%`;
  const dashOffset = `${-(p * 100 - beamSize * 25)}%`;

  return (
    <>
      {/* SVG border beam */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        style={{ zIndex: 10, overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`beam-grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Dim base border */}
        <rect
          x="1" y="1"
          width="calc(100% - 2px)" height="calc(100% - 2px)"
          rx="15" ry="15"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.25"
          style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
        />
        {/* Animated beam */}
        <rect
          x="1" y="1"
          rx="15" ry="15"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            width: 'calc(100% - 2px)',
            height: 'calc(100% - 2px)',
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})`,
          }}
        />
      </svg>

      {/* Glow dot at beam head */}
      <div
        className="pointer-events-none absolute"
        style={{
          zIndex: 11,
          left: `calc(${x}% - 6px)`,
          top: `calc(${y}% - 6px)`,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 10px 4px ${color}, 0 0 20px 8px ${color}55`,
          opacity: 0.95,
          transition: 'none',
        }}
      />
    </>
  );
};

const SpotlightCard = ({ children, color = "rgba(139,92,246,0.9)", className = "", style, onClick, ...motionProps }: SpotlightCardProps) => {
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

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsActive(prev => !prev);
    onClick?.(e);
  }, [onClick]);

  // Stop beam after 3 seconds
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsActive(false), 3000);
    return () => clearTimeout(timer);
  }, [isActive]);

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
      {/* Mouse spotlight border glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovered && !isActive ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color} 0%, transparent 65%)`,
          zIndex: 0,
        }}
      />

      {/* Inner mask for border effect */}
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[inherit]"
        style={{ background: "inherit", zIndex: 1 }}
      />

      {/* Inner fill glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color.replace(/[\d.]+\)$/, "0.10)")} 0%, transparent 55%)`,
          zIndex: 2,
        }}
      />

      {/* Border Beam — activated on click */}
      <BorderBeam color={color.replace(/rgba?\([^)]+\)/, color).replace(/[\d.]+\)$/, "1)")} active={isActive} />

      {/* Content */}
      <div className="relative" style={{ zIndex: 3 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;
