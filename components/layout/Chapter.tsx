'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useCalm } from '@/lib/hooks';

/**
 * One chapter of the story: a tall scroll span with a pinned, full-height
 * frame inside. `p` runs 0 → 1 across the span and choreographs everything
 * within; the frame itself breathes in and out at the chapter's edges.
 */
export function Chapter({
  id,
  height = 240,
  first = false,
  last = false,
  backdrop,
  className = '',
  children,
}: {
  id: string;
  height?: number;
  first?: boolean;
  last?: boolean;
  backdrop?: (p: MotionValue<number>) => React.ReactNode;
  className?: string;
  children: (p: MotionValue<number>) => React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const presence = useTransform(p, (v) => {
    const kIn = first ? 1 : Math.min(1, Math.max(0, v / 0.12));
    const kOut = last ? 1 : Math.min(1, Math.max(0, (1 - v) / 0.12));
    const ease = (x: number) => x * x * (3 - 2 * x);
    return ease(kIn) * ease(kOut);
  });

  const frameScale = useTransform(presence, [0, 1], [0.985, 1]);

  return (
    <section ref={ref} id={id} data-chapter style={{ height: `${height}svh` }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {backdrop?.(p)}
        <motion.div
          /* The calm branch restores 1 rather than dropping the keys: the first
             render is always the animated one, so by the time `calm` turns true
             framer-motion has already written an opacity here, and an empty
             style object would leave that value frozen on the element. */
          style={calm ? { opacity: 1, scale: 1 } : { opacity: presence, scale: frameScale }}
          className={`relative flex h-full w-full items-center justify-center ${className}`}
        >
          {children(p)}
        </motion.div>
      </div>
    </section>
  );
}
