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
            {/* Core Glow Point */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                filter: 'blur(8px)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
              }}
            />

            {/* Expansion Ring 1 */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: 'absolute',
                left: ripple.x - 25,
                top: ripple.y - 25,
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: '1px solid rgba(168, 85, 247, 0.6)',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
              }}
            />

            {/* Expansion Ring 2 (Delayed) */}
            <motion.div
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: "easeOut" }}
              style={{
                position: 'absolute',
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid rgba(236, 72, 153, 0.4)',
              }}
            />

            {/* Subtle Starburst Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`particle-${ripple.id}-${i}`}
                initial={{ 
                  x: ripple.x, 
                  y: ripple.y, 
                  scale: 0.8, 
                  opacity: 1 
                }}
                animate={{ 
                  x: ripple.x + (Math.cos(i * 60 * Math.PI / 180) * 60),
                  y: ripple.y + (Math.sin(i * 60 * Math.PI / 180) * 60),
                  scale: 0,
                  opacity: 0
                }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  position: 'absolute',
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

