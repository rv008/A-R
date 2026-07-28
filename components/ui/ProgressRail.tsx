'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const CHAPTERS = [
  { id: 'prologue', numeral: '✦', title: 'Prologue' },
  { id: 'invitation', numeral: 'I', title: 'The Invitation' },
  { id: 'couple', numeral: 'II', title: 'The Couple' },
  { id: 'the-day', numeral: 'III', title: 'The Day' },
  { id: 'celebrations', numeral: 'IV', title: 'The Celebrations' },
  { id: 'farewell', numeral: 'V', title: 'With Love' },
] as const;

/** A film-strip progress bar up top and a constellation of chapters at right. */
export function ProgressRail({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const [active, setActive] = useState('prologue');

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[80] h-[2px] w-full origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
        style={{ scaleX: width }}
        aria-hidden="true"
      />
      <nav
        aria-label="Chapters"
        className="fixed right-6 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex"
      >
        {CHAPTERS.map((c) => {
          const current = active === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onNavigate(c.id)}
              aria-label={`Go to ${c.title}`}
              aria-current={current ? 'true' : undefined}
              data-cursor="hover"
              className="group relative flex h-6 w-6 items-center justify-center"
              whileHover="hover"
              initial={false}
            >
              <motion.span
                className="font-royal text-[10px] leading-none text-gold"
                animate={{ opacity: current ? 1 : 0.38, scale: current ? 1.25 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {c.numeral}
              </motion.span>
              <motion.span
                className="pointer-events-none absolute right-8 whitespace-nowrap font-body text-[10px] uppercase tracking-grand text-champagne/90"
                variants={{ hover: { opacity: 1, x: 0 } }}
                initial={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.35 }}
              >
                {c.title}
              </motion.span>
              {current && (
                <motion.span
                  layoutId="chapter-halo"
                  className="absolute inset-0 rounded-full border border-gold/50"
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}
