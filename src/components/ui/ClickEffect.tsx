import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/brand';
import { useClickEffectSettings } from '@/hooks/useClickEffectSettings';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const ClickEffect = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const { config } = useClickEffectSettings();

  const addRipple = useCallback((e: MouseEvent) => {
    if (!config.enabled) return;
    if (e.button !== 0) return;

    const newRipple: Ripple = {
      id: Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    
    setRipples((prev) => [...prev.slice(-2), newRipple]); 
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, [config.enabled]);

  useEffect(() => {
    window.addEventListener('mousedown', addRipple, true);
    return () => window.removeEventListener('mousedown', addRipple, true);
  }, [addRipple]);

  if (!config.enabled) return null;

  const renderEffect = (ripple: Ripple) => {
    switch (config.type) {
      case 'apple':
        return (
          <React.Fragment key={ripple.id}>
             <motion.div
              initial={{ scale: 0.2, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                left: ripple.x - 40,
                top: ripple.y - 40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
              }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: ripple.x - 4,
                top: ripple.y - 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'white',
              }}
            />
          </React.Fragment>
        );

      case 'custom_sticker':
      case 'logo':
        const imageUrl = config.type === 'custom_sticker' ? config.customStickerUrl : BRAND.logoUrl;
        if (!imageUrl) return null;

        return (
          <React.Fragment key={ripple.id}>
            <motion.div
              initial={{ scale: 0.1, opacity: 0, rotate: -20 }}
              animate={{ scale: config.scale, opacity: config.opacity, rotate: 0 }}
              exit={{ scale: config.scale * 1.2, opacity: 0, rotate: 10 }}
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
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
              }}
            />
            <motion.div
              initial={{ scale: 0.2, opacity: 0.1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: 'absolute',
                left: ripple.x - 50,
                top: ripple.y - 50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
              }}
            />
          </React.Fragment>
        );

      case 'ripple':
      default:
        return (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5, border: '2px solid rgba(255,255,255,0.5)' }}
            animate={{ scale: 4, opacity: 0, border: '0px solid rgba(255,255,255,0)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
            }}
          />
        );
    }
  };

  return (
    <div 
      id="click-effect-container"
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {ripples.map(renderEffect)}
      </AnimatePresence>
    </div>
  );
};
