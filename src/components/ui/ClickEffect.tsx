import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    
    setRipples((prev) => [...prev.slice(-3), newRipple]); // Keep only last 3 for extreme minimalism
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
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
            {/* Apple Style Soft Expansion Ripple */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.15 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1] // Apple-like ease-out expo
              }}
              style={{
                position: 'absolute',
                left: ripple.x - 40,
                top: ripple.y - 40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Sharp Centered Pulse */}
            <motion.div
              initial={{ scale: 0, opacity: 0.4 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                position: 'absolute',
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                filter: 'blur(2px)',
                pointerEvents: 'none',
              }}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

