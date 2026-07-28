'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalm, useMounted } from '@/lib/hooks';

/** A slow drift of petals falling through the frame. */
export function Petals({
  count = 10,
  tint = 'rgba(232, 196, 196, 0.5)',
  className = '',
}: {
  count?: number;
  tint?: string;
  className?: string;
}) {
  const mounted = useMounted();
  const calm = useCalm();

  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 10,
        duration: 14 + Math.random() * 12,
        delay: -Math.random() * 24,
        sway: 30 + Math.random() * 60,
        spin: Math.random() > 0.5 ? 360 : -360,
      })),
    [count]
  );

  if (!mounted || calm) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute -top-8"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: `radial-gradient(60% 60% at 40% 35%, ${tint}, transparent 85%)`,
            borderRadius: '80% 10% 80% 10%',
          }}
          animate={{
            y: ['-6vh', '112vh'],
            x: [0, p.sway, -p.sway * 0.6, p.sway * 0.4, 0],
            rotate: [0, p.spin],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.1, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
}
