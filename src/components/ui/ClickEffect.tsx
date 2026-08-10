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
            {/* Main Logo/Sticker with Float & Glow */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0, rotate: -20, y: 0 }}
              animate={{ 
                scale: config.scale, 
                opacity: config.opacity, 
                rotate: 0,
                y: -40 // Floating up
              }}
              exit={{ scale: config.scale * 1.5, opacity: 0, rotate: 15, y: -60 }}
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
                filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) brightness(1.2)',
              }}
            />

            {/* Radiant Bloom Expansion */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.4 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: 'absolute',
                left: ripple.x - 40,
                top: ripple.y - 40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />

            {/* Sparkle Particles */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{ 
                  scale: 0, 
                  opacity: 0,
                  x: Math.cos(angle * Math.PI / 180) * 50,
                  y: Math.sin(angle * Math.PI / 180) * 50
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                style={{
                  position: 'absolute',
                  left: ripple.x - 2,
                  top: ripple.y - 2,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#A855F7' : '#EC4899', // Purple/Pink sparkles
                  boxShadow: '0 0 10px white',
                }}
              />
            ))}

            {/* Core Pulse */}
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
                filter: 'blur(2px)',
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
