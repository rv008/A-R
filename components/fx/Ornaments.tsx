'use client';

import { motion } from 'framer-motion';
import { useCalm } from '@/lib/hooks';

const draw = (delay = 0, duration = 2.2) => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration, delay, ease: [0.65, 0, 0.35, 1] as const },
      opacity: { duration: 0.4, delay },
    },
  },
});

/** A calligraphic divider that draws itself: two scrolls meeting a diamond. */
export function Flourish({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const calm = useCalm();
  return (
    <motion.svg
      viewBox="0 0 240 24"
      fill="none"
      className={className}
      initial={calm ? undefined : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.8 }}
      aria-hidden="true"
    >
      <motion.path
        d="M8 12 C 40 12, 62 4, 84 12 C 96 16.5, 104 16.5, 112 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay)}
      />
      <motion.path
        d="M232 12 C 200 12, 178 4, 156 12 C 144 16.5, 136 16.5, 128 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay)}
      />
      <motion.path
        d="M120 6 L 125 12 L 120 18 L 115 12 Z"
        stroke="currentColor"
        strokeWidth="1"
        variants={calm ? undefined : draw(delay + 0.9, 1.2)}
      />
    </motion.svg>
  );
}

/** An illuminated-manuscript corner: vine, curls, and a small blossom. */
export function CornerVine({
  className = '',
  flip = false,
  delay = 0,
}: {
  className?: string;
  flip?: boolean;
  delay?: number;
}) {
  const calm = useCalm();
  return (
    <motion.svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      initial={calm ? undefined : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      aria-hidden="true"
    >
      <motion.path
        d="M6 6 L 6 74 M6 6 L 74 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay, 1.6)}
      />
      <motion.path
        d="M6 40 C 26 40, 34 30, 34 16 M40 6 C 40 26, 30 34, 16 34"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay + 0.5)}
      />
      <motion.path
        d="M34 34 c 6 -2 12 2 12 8 c 0 6 -6 10 -12 8 c -4 -1.5 -6 -6 -4 -10 c 1.5 -3 6 -4 9 -2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay + 1.2, 1.6)}
      />
      <motion.circle
        cx="42"
        cy="42"
        r="2.2"
        fill="currentColor"
        variants={
          calm
            ? undefined
            : {
                hidden: { scale: 0, opacity: 0 },
                show: { scale: 1, opacity: 1, transition: { delay: delay + 2.4, duration: 0.6, type: 'spring' } },
              }
        }
      />
    </motion.svg>
  );
}

/** A single blooming rose drawn in one continuous line. */
export function Rose({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const calm = useCalm();
  return (
    <motion.svg
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      initial={calm ? undefined : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.7 }}
      aria-hidden="true"
    >
      <motion.path
        d="M40 44 c -3 -1 -4 -5 -1 -7 c 3 -2 7 0 7 4 c 0 5 -6 8 -11 6 c -6 -2.5 -7 -10 -3 -14 c 5 -5 14 -4 17 2 c 4 7 -1 16 -9 17 c -10 1.5 -18 -6 -17 -15"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay, 2.6)}
      />
      <motion.path
        d="M40 52 C 40 62, 40 68, 40 76 M40 62 C 34 58, 28 58, 24 62 M40 68 C 46 64, 52 64, 56 68"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        variants={calm ? undefined : draw(delay + 1.6, 1.8)}
      />
    </motion.svg>
  );
}
