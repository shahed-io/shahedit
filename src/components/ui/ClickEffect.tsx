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
    const newRipple: Ripple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setRipples((prev) => [...prev, newRipple]);
    
    // Auto-remove after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', addRipple);
    return () => window.removeEventListener('mousedown', addRipple);
  }, [addRipple]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsl(270,92%,65%) 0%, transparent 70%)',
              border: '1px solid hsla(270,92%,65%, 0.3)',
              boxShadow: '0 0 20px hsla(270,92%,65%, 0.2)',
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Secondary particles effect */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <React.Fragment key={`particles-${ripple.id}`}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`p-${ripple.id}-${i}`}
                initial={{ 
                  x: ripple.x, 
                  y: ripple.y, 
                  scale: 1, 
                  opacity: 1 
                }}
                animate={{ 
                  x: ripple.x + (Math.cos(i * 60 * Math.PI / 180) * 60),
                  y: ripple.y + (Math.sin(i * 60 * Math.PI / 180) * 60),
                  scale: 0,
                  opacity: 0
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: i % 2 === 0 ? 'hsl(270,92%,65%)' : 'hsl(320,90%,48%)',
                  boxShadow: '0 0 10px currentColor',
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};
