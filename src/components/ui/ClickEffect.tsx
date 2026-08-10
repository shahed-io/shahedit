import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/brand';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const ClickEffect = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((e: MouseEvent) => {
    // Check if it's a left click to avoid noise on right click
    if (e.button !== 0) return;

    const newRipple: Ripple = {
      id: Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    
    // Maintain a small history to ensure smoothness without clutter
    setRipples((prev) => [...prev.slice(-2), newRipple]); 
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', addRipple, true);
    return () => window.removeEventListener('mousedown', addRipple, true);
  }, [addRipple]);

  return (
    <div 
      id="click-effect-container"
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <React.Fragment key={ripple.id}>
            {/* Logo Mark Expansion Effect */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.2, opacity: 0.25, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 10 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              style={{
                position: 'absolute',
                left: ripple.x - 30,
                top: ripple.y - 30,
                width: 60,
                height: 60,
                backgroundImage: `url(${BRAND.logoUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
                pointerEvents: 'none',
              }}
            />

            {/* Ambient Soft Expansion Outer Ripple */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                left: ripple.x - 50,
                top: ripple.y - 50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Core Flash */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: ripple.x - 5,
                top: ripple.y - 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 0 10px white',
                pointerEvents: 'none',
              }}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

