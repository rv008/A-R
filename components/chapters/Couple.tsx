'use client';

import { useEffect, useRef } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Chapter } from '../layout/Chapter';
import { RevealWords, RevealLine } from '../text/Reveal';
import { Rose } from '../fx/Ornaments';
import { Petals } from '../fx/Petals';
import { couple, bride } from '@/lib/content';
import { useCalm } from '@/lib/hooks';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Two golden vines grow toward each other and braid as the chapter scrolls —
 * drawn with a GSAP timeline scrubbed against the scroll.
 */
function UnionVine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const calm = useCalm();

  useEffect(() => {
    if (calm || !svgRef.current) return;
    const paths = svgRef.current.querySelectorAll<SVGPathElement>('[data-vine]');
    const buds = svgRef.current.querySelectorAll<SVGCircleElement>('[data-bud]');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#couple',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });
      paths.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      });
      gsap.set(buds, { scale: 0, transformOrigin: 'center' });
      tl.to(buds, { scale: 1, stagger: 0.06, ease: 'back.out(2.5)', duration: 0.25 }, 0.45);
    });

    return () => ctx.revert();
  }, [calm]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 640"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[92svh] -translate-x-1/2 -translate-y-1/2 text-gold/60"
    >
      <path
        data-vine
        d="M44 0 C 44 80, 76 110, 76 180 C 76 250, 44 280, 44 350 C 44 420, 76 450, 76 520 C 76 590, 60 610, 60 640"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        data-vine
        d="M76 0 C 76 80, 44 110, 44 180 C 44 250, 76 280, 76 350 C 76 420, 44 450, 44 520 C 44 590, 60 610, 60 640"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {[120, 215, 320, 415, 500, 570].map((y, i) => (
        <circle
          key={y}
          data-bud
          cx={i % 2 === 0 ? 52 : 68}
          cy={y}
          r="3.2"
          fill="currentColor"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

/** Chapter II — the couple, held apart by a breath and joined by a vine. */
export function Couple() {
  return (
    <Chapter id="couple" height={300} backdrop={(p) => <Backdrop p={p} />}>
      {(p) => <CoupleInner p={p} />}
    </Chapter>
  );
}

function CoupleInner({ p }: { p: MotionValue<number> }) {
  const calm = useCalm();
  const groomY = useTransform(p, [0, 1], ['6vh', '-6vh']);
  const brideY = useTransform(p, [0, 1], ['12vh', '-2vh']);

  return (
    <div className="relative flex w-full flex-col items-center px-6 text-center">
      <UnionVine />

      <RevealLine>
        <p className="font-royal text-[11px] uppercase tracking-regal text-gold/80">Chapter II</p>
      </RevealLine>

      <motion.div style={{ y: calm ? 0 : groomY }} className="relative z-10 mt-10">
        <RevealWords
          text={couple.groom}
          as="h2"
          gilt
          className="font-display text-[clamp(2.6rem,9vw,6rem)] leading-none"
        />
      </motion.div>

      <motion.p
        className="relative z-10 my-6 font-script text-[clamp(2rem,6vw,3.4rem)] text-champagne md:my-8"
        initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ type: 'spring', stiffness: 110, damping: 12, delay: 0.4 }}
      >
        and
      </motion.p>

      <motion.div style={{ y: calm ? 0 : brideY }} className="relative z-10">
        <RevealWords
          text={couple.bride}
          as="h2"
          delay={0.2}
          gilt
          className="font-display text-[clamp(2.6rem,9vw,6rem)] leading-none"
        />
      </motion.div>

      <Rose className="relative z-10 mt-10 w-14 text-rosegold/80 md:w-16" delay={0.3} />

      <div className="relative z-10 mt-8 space-y-1.5">
        <RevealLine delay={0.15}>
          <p className="font-display text-base italic text-pearl/90 md:text-xl">{bride.parents}</p>
        </RevealLine>
        <RevealLine delay={0.3}>
          <p className="font-body text-sm font-light tracking-grand text-pearl/60 md:text-base">{bride.house}</p>
        </RevealLine>
        <RevealLine delay={0.45}>
          <p className="font-body text-sm font-light tracking-grand text-pearl/60 md:text-base">{bride.post}</p>
        </RevealLine>
      </div>
    </div>
  );
}

function Backdrop({ p }: { p: MotionValue<number> }) {
  const drift = useTransform(p, [0, 1], ['-8%', '8%']);
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(75% 60% at 50% 30%, rgba(22, 34, 78, 0.6), transparent 75%), radial-gradient(50% 40% at 50% 85%, rgba(217, 160, 139, 0.12), transparent 70%)',
        }}
      />
      <motion.div
        aria-hidden="true"
        style={{ x: drift }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(30% 26% at 30% 40%, rgba(212, 175, 106, 0.08), transparent 70%), radial-gradient(26% 22% at 72% 62%, rgba(232, 196, 196, 0.08), transparent 70%)',
          }}
        />
      </motion.div>
      <Petals count={10} tint="rgba(217, 160, 139, 0.45)" />
    </>
  );
}
