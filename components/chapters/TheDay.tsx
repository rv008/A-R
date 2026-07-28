'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useTransform, type MotionValue } from 'framer-motion';
import gsap from 'gsap';
import { Chapter } from '../layout/Chapter';
import { RevealLine, RevealWords } from '../text/Reveal';
import { Flourish } from '../fx/Ornaments';
import { day, couple } from '@/lib/content';
import { useAudio } from '../audio/AudioProvider';
import { useCalm, useMounted } from '@/lib/hooks';

/** The wax seal presses itself onto the proclamation. */
function WaxSeal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.9 });
  const calm = useCalm();
  const { sfx } = useAudio();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (calm) {
      gsap.set(ref.current, { scale: 1, opacity: 1 });
      return;
    }
    const seal = ref.current;
    const tl = gsap.timeline();
    tl.fromTo(
      seal,
      { scale: 2.4, opacity: 0, rotate: -14, filter: 'blur(6px)' },
      { scale: 0.92, opacity: 1, rotate: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power4.in' }
    )
      .call(() => sfx('seal'))
      .to(seal, { scale: 1.08, duration: 0.12, ease: 'power2.out' })
      .to(seal, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
    return () => {
      tl.kill();
    };
  }, [inView, calm, sfx]);

  return (
    <div ref={ref} className="relative h-24 w-24 opacity-0 md:h-28 md:w-28" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]">
        <path
          d="M50 3 C 66 1, 82 8, 90 22 C 98 36, 99 52, 92 66 C 85 80, 72 92, 55 96 C 38 100, 20 92, 11 78 C 2 64, 1 44, 9 30 C 17 16, 34 5, 50 3 Z"
          fill="#571e2c"
        />
        <path
          d="M50 3 C 66 1, 82 8, 90 22 C 98 36, 99 52, 92 66 C 85 80, 72 92, 55 96 C 38 100, 20 92, 11 78 C 2 64, 1 44, 9 30 C 17 16, 34 5, 50 3 Z"
          fill="url(#sealShine)"
        />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#d4af6a" strokeWidth="1.2" opacity="0.85" />
        <circle cx="50" cy="50" r="29" fill="none" stroke="#d4af6a" strokeWidth="0.6" opacity="0.5" />
        <defs>
          <radialGradient id="sealShine" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0%" stopColor="#8a3247" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#571e2c" stopOpacity="0" />
            <stop offset="100%" stopColor="#2e0f18" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#e9d5ae"
          fontSize="26"
          fontFamily="var(--font-cormorant), serif"
        >
          {couple.monogram.left}
          <tspan fontSize="16" dy="-2" fill="#d4af6a">
            {couple.monogram.amp}
          </tspan>
          <tspan dy="2">{couple.monogram.right}</tspan>
        </text>
      </svg>
    </div>
  );
}

/** The hour, counted down in engraved marble — part of the proclamation itself. */
function Countdown() {
  const mounted = useMounted();
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const target = new Date(day.iso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mounted]);

  const cells = left
    ? ([
        [left.d, 'days'],
        [left.h, 'hours'],
        [left.m, 'minutes'],
        [left.s, 'seconds'],
      ] as const)
    : ([
        ['—', 'days'],
        ['—', 'hours'],
        ['—', 'minutes'],
        ['—', 'seconds'],
      ] as const);

  return (
    <div className="mt-10 flex items-center justify-center gap-4 md:gap-8" role="timer" aria-label="Time until the wedding">
      {cells.map(([value, unit], i) => (
        <RevealLine key={unit} delay={0.15 * i}>
          <div className="flex flex-col items-center">
            <span className="font-royal text-2xl text-engraved tabular-nums md:text-4xl">
              {typeof value === 'number' ? String(value).padStart(2, '0') : value}
            </span>
            <span className="mt-2 font-body text-[9px] uppercase tracking-regal text-champagne/60 md:text-[10px]">
              {unit}
            </span>
          </div>
        </RevealLine>
      ))}
    </div>
  );
}

/** Chapter III — the day itself, proclaimed on parchment under candlelight. */
export function TheDay() {
  return (
    <Chapter id="the-day" height={280} backdrop={(p) => <Backdrop p={p} />}>
      {() => (
        <div className="paper relative mx-4 w-[min(92vw,44rem)] overflow-hidden rounded-[2px] px-6 py-14 text-center md:px-14 md:py-16">
          {/* candlelight passing across the parchment */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-1/3 rotate-[8deg]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255, 236, 190, 0.07), transparent)',
            }}
            animate={{ x: ['-140%', '340%'] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <RevealLine>
            <p className="font-royal text-[11px] uppercase tracking-regal text-gold/80">Chapter III</p>
          </RevealLine>

          <RevealLine delay={0.15}>
            <p className="mt-8 font-body text-xs uppercase tracking-regal text-champagne/80 md:text-sm">
              {day.weekday}
            </p>
          </RevealLine>

          <RevealWords
            text={day.dayNumeral}
            as="p"
            gilt
            className="mt-2 font-display text-[clamp(6rem,20vw,11rem)] leading-none"
          />

          <RevealLine delay={0.2}>
            <p className="mt-2 font-body text-xs uppercase tracking-regal text-champagne/80 md:text-sm">
              {day.monthYear}
            </p>
          </RevealLine>

          <Flourish className="mx-auto mt-8 w-48 text-gold/80" />

          <RevealLine delay={0.25}>
            <p className="mt-8 font-display text-xl italic text-pearl md:text-2xl">{day.time}</p>
          </RevealLine>

          <div className="mt-10 flex items-end justify-center gap-8">
            <span className="mb-1 hidden md:block" aria-hidden="true">
              <span className="flame" style={{ animationDelay: '-0.9s' }} />
              <span className="mx-auto block h-8 w-1.5 rounded-sm bg-gradient-to-b from-ivory/70 to-ivory/25" />
            </span>
            <WaxSeal />
            <span className="mb-1 hidden md:block" aria-hidden="true">
              <span className="flame" style={{ animationDelay: '-1.7s' }} />
              <span className="mx-auto block h-8 w-1.5 rounded-sm bg-gradient-to-b from-ivory/70 to-ivory/25" />
            </span>
          </div>

          <Countdown />
        </div>
      )}
    </Chapter>
  );
}

function Backdrop({ p }: { p: MotionValue<number> }) {
  const warmth = useTransform(p, [0, 0.5, 1], [0.35, 1, 0.35]);
  return (
    <motion.div aria-hidden="true" style={{ opacity: warmth }} className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(65% 55% at 50% 45%, rgba(87, 30, 44, 0.5), transparent 72%), radial-gradient(45% 35% at 50% 90%, rgba(255, 217, 160, 0.12), transparent 70%)',
        }}
      />
    </motion.div>
  );
}
