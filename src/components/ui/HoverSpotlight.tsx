import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const HoverSpotlight = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [accentColor, setAccentColor] = useState('hsl(270,92%,65%)');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable = target.closest('.group'); // Product cards use 'group'

      if (hoverable) {
        const rect = hoverable.getBoundingClientRect();
        setTargetRect(rect);
        setMousePos({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
        
        // Try to extract color from style if available (optional enhancement)
        const style = window.getComputedStyle(hoverable);
        const borderBottomColor = style.borderBottomColor;
        if (borderBottomColor && borderBottomColor !== 'rgba(0, 0, 0, 0)') {
           // Basic heuristic to keep the theme
        }
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isVisible || !targetRect) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed pointer-events-none z-[40]"
      style={{
        left: mousePos.x - 150,
        top: mousePos.y - 150,
        width: 300,
        height: 300,
        background: `radial-gradient(circle, hsla(270,92%,65%, 0.15) 0%, transparent 70%)`,
        filter: 'blur(20px)',
        mixBlendMode: 'screen',
      }}
    />
  );
};
