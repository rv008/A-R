'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Chapter } from '../layout/Chapter';
import { InkText } from '../text/Reveal';
import { couple, day } from '@/lib/content';
import { useCalm } from '@/lib/hooks';

function Cue({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0, 0.08], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 4.6, duration: 1.4 }}
      aria-hidden="true"
    >
      <span className="font-body text-[10px] uppercase tracking-regal text-champagne/70">scroll</span>
      <span className="relative block h-12 w-px overflow-hidden bg-gold/20">
        <motion.span
          className="absolute left-0 top-0 h-4 w-px bg-gold-bright"
          animate={{ y: [-16, 48] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    </motion.div>
  );
}

/** The story opens in darkness: stars, golden dust, and names written in light. */
export function Prologue() {
  return (
    <Chapter id="prologue" height={240} first>
      {(p) => {
        return <PrologueInner p={p} />;
      }}
    </Chapter>
  );
}

function PrologueInner({ p }: { p: MotionValue<number> }) {
  const calm = useCalm();
  const rise = useTransform(p, [0, 0.9], [0, -120]);
  const blur = useTransform(p, [0.4, 0.9], ['blur(0px)', 'blur(10px)']);
  const scale = useTransform(p, [0, 0.9], [1, 1.12]);

  return (
    <>
      {/* a faint midnight aurora behind the monogram */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 42%, rgba(22, 34, 78, 0.55), transparent 70%), radial-gradient(45% 30% at 50% 55%, rgba(13, 43, 37, 0.35), transparent 70%)',
        }}
      />
      <motion.div
        style={
          calm
            ? { y: 0, filter: 'blur(0px)', scale: 1 }
            : { y: rise, filter: blur, scale }
        }
        className="relative flex flex-col items-center px-6 text-center"
      >
        <motion.span
          className="font-script text-2xl text-champagne/80 md:text-3xl"
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 2.2, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {couple.short}
        </motion.span>

        <h1 className="mt-6 flex items-baseline gap-4 md:gap-7" aria-label={`${couple.monogram.left} and ${couple.monogram.right}`}>
          <InkText
            as="span"
            text={couple.monogram.left}
            delay={2.9}
            gilt
            className="font-display text-[clamp(6rem,22vw,13rem)] leading-none"
          />
          <motion.span
            aria-hidden="true"
            className="font-script text-[clamp(2.4rem,8vw,4.6rem)] text-champagne/90"
            initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 3.8, duration: 1.1, type: 'spring', stiffness: 120, damping: 14 }}
          >
            {couple.monogram.amp}
          </motion.span>
          <InkText
            as="span"
            text={couple.monogram.right}
            delay={3.3}
            gilt
            className="font-display text-[clamp(6rem,22vw,13rem)] leading-none"
          />
        </h1>

        <motion.span
          className="rule-gold mt-9 w-40 md:w-56"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 4.1, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.p
          className="mt-7 font-body text-sm uppercase tracking-regal text-champagne md:text-base"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ delay: 4.3, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {day.compact}
        </motion.p>
      </motion.div>
      <Cue p={p} />
    </>
  );
}
