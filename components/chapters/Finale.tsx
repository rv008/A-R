'use client';

import { useMemo } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Chapter } from '../layout/Chapter';
import { RevealWords, RevealLine } from '../text/Reveal';
import { Flourish } from '../fx/Ornaments';
import { Magnetic } from '../ui/Magnetic';
import { couple, day, farewell } from '@/lib/content';
import { useCalm, useMounted } from '@/lib/hooks';

/** Paper lanterns climbing into the night as the story closes. */
function Lanterns({ p }: { p: MotionValue<number> }) {
  const mounted = useMounted();
  const calm = useCalm();
  const lift = useTransform(p, [0, 1], ['30svh', '-115svh']);

  const lanterns = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        depth: 0.45 + Math.random() * 0.55,
        size: 14 + Math.random() * 16,
        swayDur: 4 + Math.random() * 3,
        flicker: 2 + Math.random() * 2,
      })),
    []
  );

  if (!mounted || calm) return null;

  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ y: lift }}>
      {lanterns.map((l) => (
        <motion.span
          key={l.id}
          className="absolute top-[100svh]"
          style={{ left: `${l.left}%`, scale: l.depth, opacity: 0.4 + l.depth * 0.6, y: `${(1 - l.depth) * 40}svh` }}
          animate={{ x: [0, 10 * l.depth, -8 * l.depth, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: l.swayDur, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className="block rounded-[42%_42%_46%_46%/58%_58%_40%_40%]"
            style={{
              width: l.size,
              height: l.size * 1.35,
              background:
                'radial-gradient(55% 60% at 50% 62%, #fff3d0 0%, #ffce8a 45%, #e08a3c 85%, rgba(160, 70, 20, 0.6) 100%)',
              boxShadow: `0 0 ${18 * l.depth}px ${6 * l.depth}px rgba(255, 200, 120, 0.4)`,
            }}
          />
          <motion.span
            className="absolute inset-0 rounded-[inherit]"
            animate={{ opacity: [0.5, 1, 0.6, 1, 0.5] }}
            transition={{ duration: l.flicker, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'radial-gradient(40% 35% at 50% 66%, rgba(255, 250, 230, 0.85), transparent 75%)' }}
          />
        </motion.span>
      ))}
    </motion.div>
  );
}

function Backdrop({ p }: { p: MotionValue<number> }) {
  const nightfall = useTransform(p, [0, 0.6], [0, 1]);
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          opacity: nightfall,
          background:
            'radial-gradient(75% 60% at 50% 100%, rgba(22, 34, 78, 0.5), transparent 75%), radial-gradient(50% 40% at 50% 30%, rgba(7, 11, 30, 0.8), transparent 90%)',
        }}
      />
      <Lanterns p={p} />
    </>
  );
}

/** Chapter V — farewell, and the sky keeps the lanterns. */
export function Finale({ onReplay }: { onReplay: () => void }) {
  return (
    <Chapter
      id="farewell"
      height={300}
      last
      backdrop={(p) => <Backdrop p={p} />}
    >
      {() => (
        <div className="flex flex-col items-center px-6 text-center">
          <RevealLine>
            <p className="font-script text-[clamp(1.7rem,5vw,2.6rem)] text-champagne">{farewell.lede}</p>
          </RevealLine>

          <RevealWords
            text={farewell.name}
            as="h2"
            delay={0.3}
            gilt
            className="mt-6 font-display text-[clamp(2.4rem,8vw,5rem)] leading-tight"
          />

          <Flourish className="mx-auto mt-10 w-52 text-gold/80" delay={0.4} />

          <RevealLine delay={0.6}>
            <p
              className="mt-12 flex items-baseline justify-center gap-3 font-display text-4xl md:text-5xl"
              aria-label={`${couple.monogram.left} and ${couple.monogram.right}`}
            >
              <span className="text-gilt">{couple.monogram.left}</span>
              <span className="font-script text-2xl text-champagne/80 md:text-3xl">{couple.monogram.amp}</span>
              <span className="text-gilt">{couple.monogram.right}</span>
            </p>
          </RevealLine>

          <RevealLine delay={0.75}>
            <p className="mt-4 font-body text-xs uppercase tracking-regal text-champagne/70">{day.compact}</p>
          </RevealLine>

          <RevealLine delay={1.0}>
            <Magnetic strength={0.3} className="mt-16">
              <button
                type="button"
                onClick={onReplay}
                data-cursor="hover"
                className="rounded-full border border-gold/30 px-7 py-3 font-body text-[10px] uppercase tracking-regal text-champagne/80 transition-colors duration-500 hover:border-gold/70 hover:text-champagne"
              >
                relive the story
              </button>
            </Magnetic>
          </RevealLine>
        </div>
      )}
    </Chapter>
  );
}
