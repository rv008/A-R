'use client';

import { useMemo } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Chapter } from '../layout/Chapter';
import { RevealWords, RevealLine } from '../text/Reveal';
import { Flourish } from '../fx/Ornaments';
import { Petals } from '../fx/Petals';
import { QRCard } from '../ui/QRCard';
import { events } from '@/lib/content';
import { useCalm, useMounted } from '@/lib/hooks';

/* ————————————————————————————————————————————————————————————
   The Engagement · a world of blush silk and two rings meeting
   ———————————————————————————————————————————————————————————— */

function Rings({ p }: { p: MotionValue<number> }) {
  const calm = useCalm();
  const draw = useTransform(p, [0.1, 0.45], [0, 1]);
  const leftX = useTransform(p, [0.25, 0.55], [-26, 0]);
  const rightX = useTransform(p, [0.25, 0.55], [26, 0]);
  const glow = useTransform(p, [0.5, 0.65], [0, 1]);
  /* Hooks must all run before the calm early-return, or the render that flips
     `calm` would call fewer of them than the one before it. */
  const halo = useTransform(glow, [0, 1], [0.8, 1]);

  if (calm) {
    return (
      <svg viewBox="0 0 220 120" className="w-56 text-gold md:w-72" aria-hidden="true">
        <circle cx="88" cy="60" r="42" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="132" cy="60" r="42" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 120" className="w-56 overflow-visible text-gold md:w-72" aria-hidden="true">
      <motion.g style={{ x: leftX }}>
        <motion.circle
          cx="88"
          cy="60"
          r="42"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          style={{ pathLength: draw }}
          transform="rotate(-90 88 60)"
        />
        <motion.circle cx="88" cy="18" r="3.4" fill="#f0d494" style={{ opacity: glow }} />
      </motion.g>
      <motion.g style={{ x: rightX }}>
        <motion.circle
          cx="132"
          cy="60"
          r="42"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          style={{ pathLength: draw }}
          transform="rotate(90 132 60)"
        />
        <motion.circle cx="132" cy="102" r="3.4" fill="#f0d494" style={{ opacity: glow }} />
      </motion.g>
      <motion.circle
        cx="110"
        cy="60"
        r="58"
        fill="none"
        stroke="rgba(240, 212, 148, 0.35)"
        strokeWidth="0.6"
        style={{ opacity: glow, scale: halo }}
      />
    </svg>
  );
}

function Engagement() {
  return (
    <Chapter
      id="engagement"
      height={230}
      backdrop={() => (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 55% at 50% 40%, rgba(232, 196, 196, 0.14), transparent 72%), radial-gradient(45% 40% at 50% 90%, rgba(217, 160, 139, 0.12), transparent 75%)',
            }}
          />
          <Petals count={12} tint="rgba(232, 196, 196, 0.55)" />
        </>
      )}
    >
      {(p) => (
        <div className="flex flex-col items-center px-6 text-center">
          <RevealLine>
            <p className="font-royal text-[11px] uppercase tracking-regal text-rosegold">
              {events.engagement.label}
            </p>
          </RevealLine>

          <div className="mt-8">
            <Rings p={p} />
          </div>

          <RevealWords
            text={events.engagement.venue}
            as="h2"
            className="mt-8 font-display text-[clamp(2rem,6.5vw,4rem)] leading-tight text-pearl"
          />

          <RevealLine delay={0.25}>
            <p className="mt-4 font-display text-lg italic text-champagne md:text-xl">
              {events.engagement.when}
            </p>
          </RevealLine>

          <div className="mt-10">
            <QRCard
              href={events.engagement.map}
              qr={events.engagement.qr}
              alt={events.engagement.qrAlt}
              accent="rgba(217, 160, 139, 0.65)"
            />
          </div>
        </div>
      )}
    </Chapter>
  );
}

/* ————————————————————————————————————————————————————————————
   The Ceremony · a sanctuary of arches, rays and candlelight
   ———————————————————————————————————————————————————————————— */

function Rays({ p }: { p: MotionValue<number> }) {
  const calm = useCalm();
  const strength = useTransform(p, [0.1, 0.5], [0, 1]);
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: calm ? 1 : strength }}
    >
      {[-16, -5, 7, 18].map((deg, i) => (
        <motion.span
          key={deg}
          className="absolute left-1/2 top-[-30%] h-[130%] w-[14vw] origin-top md:w-[9vw]"
          style={{
            rotate: deg,
            translateX: '-50%',
            background:
              'linear-gradient(180deg, rgba(253, 249, 240, 0.13), rgba(253, 249, 240, 0.03) 55%, transparent 85%)',
            filter: 'blur(6px)',
          }}
          animate={calm ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 7 + i * 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  );
}

function Arch({ p }: { p: MotionValue<number> }) {
  const calm = useCalm();
  const draw = useTransform(p, [0.08, 0.5], [0, 1]);
  /* Drawn fully rather than unset: an empty style would strand the path at
     whatever length the animated first render already committed. */
  const style = calm ? { pathLength: 1 } : { pathLength: draw };
  return (
    <svg
      viewBox="0 0 320 420"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[86svh] max-h-[780px] -translate-x-1/2 -translate-y-1/2 text-gold/45"
    >
      <motion.path
        d="M40 420 L40 190 C 40 90, 100 30, 160 30 C 220 30, 280 90, 280 190 L280 420"
        stroke="currentColor"
        strokeWidth="1.6"
        style={style}
      />
      <motion.path
        d="M64 420 L64 196 C 64 108, 112 56, 160 56 C 208 56, 256 108, 256 196 L256 420"
        stroke="currentColor"
        strokeWidth="0.9"
        style={style}
      />
      <motion.path
        d="M160 30 L160 8 M148 16 L172 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={style}
      />
    </svg>
  );
}

function Ceremony() {
  return (
    <Chapter
      id="ceremony"
      height={250}
      backdrop={(p) => (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(80% 70% at 50% 20%, rgba(22, 34, 78, 0.65), transparent 80%), radial-gradient(50% 30% at 50% 100%, rgba(255, 217, 160, 0.1), transparent 70%)',
            }}
          />
          <Rays p={p} />
        </>
      )}
    >
      {(p) => (
        <div className="relative flex flex-col items-center px-6 text-center">
          <Arch p={p} />

          <RevealLine>
            <p className="font-royal text-[11px] uppercase tracking-regal text-champagne">
              {events.ceremony.label}
            </p>
          </RevealLine>

          <RevealWords
            text={events.ceremony.venue}
            as="h2"
            className="mt-8 max-w-3xl font-display text-[clamp(2rem,6.5vw,4rem)] leading-tight text-engraved"
          />

          <RevealLine delay={0.3}>
            <p className="mt-5 font-body text-sm font-light tracking-grand text-pearl/75 md:text-base">
              <span className="whitespace-nowrap">{events.ceremony.detailA}</span>
              <span className="mx-3 text-gold">·</span>
              <span className="whitespace-nowrap">{events.ceremony.detailB}</span>
            </p>
          </RevealLine>

          <div className="mt-10 flex items-end gap-6">
            <span className="mb-2 hidden flex-col items-center md:flex" aria-hidden="true">
              <span className="flame" />
              <span className="block h-10 w-1.5 rounded-sm bg-gradient-to-b from-ivory/70 to-ivory/20" />
            </span>
            <QRCard
              href={events.ceremony.map}
              qr={events.ceremony.qr}
              alt={events.ceremony.qrAlt}
              accent="rgba(233, 213, 174, 0.7)"
            />
            <span className="mb-2 hidden flex-col items-center md:flex" aria-hidden="true">
              <span className="flame" style={{ animationDelay: '-1.3s' }} />
              <span className="block h-10 w-1.5 rounded-sm bg-gradient-to-b from-ivory/70 to-ivory/20" />
            </span>
          </div>
        </div>
      )}
    </Chapter>
  );
}

/* ————————————————————————————————————————————————————————————
   The Reception · an emerald ballroom under a falling chandelier
   ———————————————————————————————————————————————————————————— */

function Chandelier({ p }: { p: MotionValue<number> }) {
  const calm = useCalm();
  const y = useTransform(p, [0.05, 0.45], ['-46%', '0%']);
  const sway = useTransform(p, [0.45, 1], [0, 1]);
  const settle = useTransform(sway, [0, 1], [1, 0.95]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0"
      /* x lives in the motion style, not a Tailwind class: framer-motion
         writes the whole transform, and would drop -translate-x-1/2. */
      style={{ x: '-50%', y: calm ? 0 : y }}
    >
      <motion.svg
        viewBox="0 0 200 150"
        className="w-44 text-gold md:w-56"
        animate={calm ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: 0.5, originY: 0, opacity: settle }}
      >
        <path d="M100 0 L100 34" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M100 34 C 60 34, 34 56, 30 88 M100 34 C 140 34, 166 56, 170 88 M100 34 C 84 52, 76 68, 74 92 M100 34 C 116 52, 124 68, 126 92 M100 34 L 100 96"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
        />
        {[
          [30, 88],
          [74, 92],
          [100, 96],
          [126, 92],
          [170, 88],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy + 5} r="2.2" fill="#ffd9a0">
              <animate
                attributeName="opacity"
                values="0.55;1;0.7;1;0.55"
                dur={`${2.2 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={cx} cy={cy + 5} r="7" fill="rgba(255, 217, 160, 0.16)" />
          </g>
        ))}
      </motion.svg>
    </motion.div>
  );
}

function Bokeh() {
  const mounted = useMounted();
  const calm = useCalm();
  const dots = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 25 + Math.random() * 70,
        size: 40 + Math.random() * 90,
        duration: 9 + Math.random() * 8,
        delay: -Math.random() * 12,
      })),
    []
  );
  if (!mounted || calm) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: 'radial-gradient(closest-side, rgba(212, 175, 106, 0.13), transparent)',
            filter: 'blur(2px)',
          }}
          animate={{ y: [0, -50, 0], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function Reception() {
  return (
    <Chapter
      id="reception"
      height={240}
      backdrop={(p) => (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(80% 65% at 50% 30%, rgba(13, 43, 37, 0.72), transparent 80%), radial-gradient(55% 35% at 50% 100%, rgba(212, 175, 106, 0.1), transparent 75%)',
            }}
          />
          <Bokeh />
          <Chandelier p={p} />
        </>
      )}
    >
      {() => (
        <div className="relative flex w-full max-w-5xl flex-col items-center gap-10 px-6 pt-36 md:flex-row md:items-center md:justify-between md:gap-16 md:px-14 md:pt-24">
          <div className="text-center md:text-left">
            <RevealLine>
              <p className="font-royal text-[11px] uppercase tracking-regal text-gold">
                {events.reception.label}
              </p>
            </RevealLine>

            <RevealWords
              text={events.reception.venue}
              as="h2"
              gilt
              className="mt-7 max-w-xl font-display text-[clamp(2rem,6.5vw,4.2rem)] leading-tight"
            />

            <Flourish className="mx-auto mt-8 w-44 text-gold/70 md:mx-0" />
          </div>

          <div className="shrink-0">
            <QRCard
              href={events.reception.map}
              qr={events.reception.qr}
              alt={events.reception.qrAlt}
              accent="rgba(212, 175, 106, 0.75)"
            />
          </div>
        </div>
      )}
    </Chapter>
  );
}

/** Chapter IV — the celebrations, each in a world of its own. */
export function Celebrations() {
  return (
    <div id="celebrations">
      <Engagement />
      <Ceremony />
      <Reception />
    </div>
  );
}
