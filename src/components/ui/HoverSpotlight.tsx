import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const HoverSpotlight = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [accentColor, setAccentColor] = useState('hsl(270,92%,65%)');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if mouse is over a product card, product image, or anything with a 'group' class (our common wrapper)
      const hoverable = target.closest('.group, a[href^="/product/"], img[alt]');

      if (hoverable) {
        setMousePos({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
        
        // Default accent colors for the brand
        const colors = ['hsl(270,92%,65%)', 'hsl(320,90%,55%)', 'hsl(280,85%,60%)'];
        // Pick one based on mouse position or just rotate
        const colorIdx = Math.floor((e.clientX + e.clientY) / 100) % colors.length;
        setAccentColor(colors[colorIdx]);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed pointer-events-none z-[40]"
          style={{
            left: mousePos.x - 120,
            top: mousePos.y - 120,
            width: 240,
            height: 240,
            background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
            filter: 'blur(25px)',
            mixBlendMode: 'screen',
          }}
        >
          {/* Internal brighter core */}
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle, ${accentColor}15 0%, transparent 40%)`,
              filter: 'blur(10px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
