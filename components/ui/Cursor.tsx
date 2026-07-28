'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCalm, useIsTouch } from '@/lib/hooks';

/** A candlelit cursor: a gold mote leading a slow halo ring. */
export function Cursor() {
  const touch = useIsTouch();
  const calm = useCalm();
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (touch || calm) return;
    document.body.classList.add('cursor-none-global');

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = (e.target as HTMLElement)?.closest('a, button, [data-cursor="hover"]');
      setHovering(!!target);
    };
    const leave = () => setVisible(false);

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      document.body.classList.remove('cursor-none-global');
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [touch, calm, x, y]);

  if (touch || calm) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-[6px] w-[6px] rounded-full bg-gold-bright"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          boxShadow: '0 0 12px 2px rgba(240,212,148,0.8)',
          opacity: visible ? 1 : 0,
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[99] rounded-full border border-gold/40"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          opacity: visible ? (hovering ? 0.9 : 0.5) : 0,
          backgroundColor: hovering ? 'rgba(212,175,106,0.08)' : 'rgba(212,175,106,0)',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      />
    </>
  );
}
