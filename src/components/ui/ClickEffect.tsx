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
    // We use a small delay or check to ensure we don't spam if multiple events fire
    const newRipple: Ripple = {
      id: Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    
    setRipples((prev) => [...prev.slice(-10), newRipple]); // Keep only last 10 to prevent lag
    
    // Auto-remove after animation finishes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  }, []);

  useEffect(() => {
    const handleMousedown = (e: MouseEvent) => addRipple(e);
    window.addEventListener('mousedown', handleMousedown, true);
    return () => window.removeEventListener('mousedown', handleMousedown, true);
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
            {/* Main Ring Ripple */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: 'absolute',
                left: ripple.x - 25,
                top: ripple.y - 25,
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: '2px solid hsl(270,92%,65%)',
                boxShadow: '0 0 15px hsla(270,92%,65%, 0.5)',
              }}
            />
            
            {/* Center Flash */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                filter: 'blur(4px)',
              }}
            />

            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sparkle-${ripple.id}-${i}`}
                initial={{ 
                  x: ripple.x, 
                  y: ripple.y, 
                  scale: 1, 
                  opacity: 1 
                }}
                animate={{ 
                  x: ripple.x + (Math.cos(i * 45 * Math.PI / 180) * 80),
                  y: ripple.y + (Math.sin(i * 45 * Math.PI / 180) * 80),
                  scale: 0,
                  opacity: 0
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: i % 2 === 0 ? 6 : 4,
                  height: i % 2 === 0 ? 6 : 4,
                  borderRadius: '50%',
                  background: i % 2 === 0 ? 'linear-gradient(135deg, #A855F7, #EC4899)' : '#FFF',
                  boxShadow: '0 0 10px rgba(168,85,247,0.8)',
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

