'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Chapter } from '../layout/Chapter';
import { RevealWords, RevealLine, InkText } from '../text/Reveal';
import { CornerVine, Flourish } from '../fx/Ornaments';
import { Petals } from '../fx/Petals';
import { hosts } from '@/lib/content';

/** Chapter I — the hosts extend the invitation, on an illuminated page. */
export function Invitation() {
  return (
    <Chapter
      id="invitation"
      height={230}
      backdrop={(p) => <Backdrop p={p} />}
    >
      {() => (
        <div className="relative mx-auto w-[min(92vw,46rem)] px-5 py-14 text-center">
          <CornerVine className="absolute left-0 top-0 w-16 text-gold/70 md:w-24" />
          <CornerVine flip className="absolute right-0 top-0 w-16 text-gold/70 md:w-24" delay={0.2} />
          <CornerVine
            className="absolute bottom-0 left-0 w-16 -scale-y-100 text-gold/70 md:w-24"
            delay={0.4}
          />
          <CornerVine
            flip
            className="absolute bottom-0 right-0 w-16 -scale-y-100 text-gold/70 md:w-24"
            delay={0.6}
          />

          <RevealLine>
            <p className="font-royal text-[11px] uppercase tracking-regal text-gold/80">Chapter I</p>
          </RevealLine>

          <RevealWords
            text={hosts.father}
            as="h2"
            className="mt-8 font-display text-[clamp(1.9rem,5.5vw,3.2rem)] leading-tight text-pearl"
          />
          <motion.p
            className="my-3 font-script text-3xl text-gold md:text-4xl"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.35 }}
          >
            &amp;
          </motion.p>
          <RevealWords
            text={hosts.mother}
            as="h2"
            delay={0.25}
            className="font-display text-[clamp(1.9rem,5.5vw,3.2rem)] leading-tight text-pearl"
          />
          <RevealLine delay={0.5}>
            <p className="mt-1 font-display italic text-lg text-champagne/70">{hosts.motherKnownAs}</p>
          </RevealLine>

          <RevealLine delay={0.6}>
            <p className="mt-6 font-body text-sm font-light tracking-grand text-pearl/70 md:text-base">
              {hosts.address}
            </p>
          </RevealLine>

          <Flourish className="mx-auto mt-9 w-52 text-gold/80" delay={0.4} />

          <div className="mt-9">
            {hosts.invite.split('\n').map((line, i) => (
              <InkText
                key={i}
                text={line}
                delay={0.7 + i * 0.8}
                stagger={0.022}
                className="font-script text-[clamp(1.6rem,4.6vw,2.6rem)] leading-relaxed text-champagne"
              />
            ))}
          </div>
        </div>
      )}
    </Chapter>
  );
}

function Backdrop({ p }: { p: MotionValue<number> }) {
  const glow = useTransform(p, [0, 0.5, 1], [0.4, 1, 0.4]);
  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ opacity: glow }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 38%, rgba(18, 56, 48, 0.62), transparent 72%), radial-gradient(40% 30% at 50% 80%, rgba(212, 175, 106, 0.09), transparent 70%)',
          }}
        />
      </motion.div>
      <Petals count={8} tint="rgba(233, 213, 174, 0.4)" />
    </>
  );
}
