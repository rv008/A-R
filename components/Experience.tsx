'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useScroll } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { AudioProvider, useAudio } from './audio/AudioProvider';
import { Cursor } from './ui/Cursor';
import { MusicToggle } from './ui/MusicToggle';
import { ProgressRail } from './ui/ProgressRail';
import { Prologue } from './chapters/Prologue';
import { Invitation } from './chapters/Invitation';
import { Couple } from './chapters/Couple';
import { TheDay } from './chapters/TheDay';
import { Celebrations } from './chapters/Celebrations';
import { Finale } from './chapters/Finale';
import { couple } from '@/lib/content';
import { useCalm } from '@/lib/hooks';

/* three.js is the heaviest thing here and none of it is needed for the words,
   so the canvas is split into its own chunk and mounted only in the browser. */
const CelestialCanvas = dynamic(
  () => import('./fx/CelestialCanvas').then((m) => m.CelestialCanvas),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** The sealed cover of the manuscript, parting to let the story begin. */
function Overture() {
  const [open, setOpen] = useState(false);
  const { sfx } = useAudio();

  useEffect(() => {
    const id = setTimeout(() => {
      setOpen(true);
      sfx('paper');
    }, 2000);
    return () => clearTimeout(id);
  }, [sfx]);

  const leaf =
    'linear-gradient(160deg, #171106 0%, #241a0c 45%, #1a1208 100%)';
  const edge = 'inset 0 0 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(212,175,106,0.12)';

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          exit={{ opacity: 1, transition: { duration: 2.4 } }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 origin-left"
            style={{ background: leaf, boxShadow: edge }}
            exit={{ x: '-101%', rotateY: 24, transition: { duration: 2.2, ease: [0.7, 0, 0.2, 1] } }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 origin-right"
            style={{ background: leaf, boxShadow: edge }}
            exit={{ x: '101%', rotateY: -24, transition: { duration: 2.2, ease: [0.7, 0, 0.2, 1] } }}
          />
          <motion.div
            className="relative flex h-28 w-28 items-center justify-center rounded-full"
            style={{
              background: 'radial-gradient(circle at 36% 30%, #7c2c40, #571e2c 60%, #38121d)',
              boxShadow: '0 0 60px rgba(212, 175, 106, 0.25), 0 14px 40px rgba(0,0,0,0.7)',
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.9, ease: [0.7, 0, 0.3, 1] } }}
          >
            <span className="absolute inset-2 rounded-full border border-gold/50" />
            <span className="font-display text-3xl text-champagne">
              {couple.monogram.left}
              <span className="font-script text-xl text-gold">{couple.monogram.amp}</span>
              {couple.monogram.right}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Story() {
  const calm = useCalm();
  const lenisRef = useRef<Lenis | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (calm) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [calm]);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { duration: 2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const replay = useCallback(() => scrollToId('prologue'), [scrollToId]);

  return (
    <>
      <CelestialCanvas progress={scrollYProgress} />
      <Overture />
      <Cursor />
      <MusicToggle />
      <ProgressRail onNavigate={scrollToId} />

      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <main className="relative z-10">
        <h1 className="sr-only">
          Ronald Varghese and Amala Wilson — wedding invitation, Monday 14 September 2026
        </h1>
        <Prologue />
        <Invitation />
        <Couple />
        <TheDay />
        <Celebrations />
        <Finale onReplay={replay} />
      </main>
    </>
  );
}

export function Experience() {
  return (
    // reducedMotion="user" lets framer-motion drop transform and layout
    // animations for guests who ask for stillness, keeping only opacity.
    <MotionConfig reducedMotion="user">
      <AudioProvider>
        <Story />
      </AudioProvider>
    </MotionConfig>
  );
}
