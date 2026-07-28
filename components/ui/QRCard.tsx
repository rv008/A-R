'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { asset } from '@/lib/base';
import { events } from '@/lib/content';
import { useAudio } from '../audio/AudioProvider';
import { useCalm } from '@/lib/hooks';

/**
 * A gilded keepsake card holding the venue's QR code — tap it to open the
 * map, tilt it to catch the light. The link and the code carry the same URL.
 */
export function QRCard({
  href,
  qr,
  alt,
  accent = 'rgba(212, 175, 106, 0.5)',
}: {
  href: string;
  qr: string;
  alt: string;
  accent?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const calm = useCalm();
  const { sfx } = useAudio();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  const sheenX = useMotionValue(50);
  const sheenY = useMotionValue(50);
  const sheen = useTransform(
    [sheenX, sheenY],
    ([x, y]) =>
      `radial-gradient(140px circle at ${x}% ${y}%, rgba(255, 250, 235, 0.28), transparent 70%)`
  );

  const onMove = (e: React.PointerEvent) => {
    if (calm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 16);
    rx.set((0.5 - py) * 16);
    sheenX.set(px * 100);
    sheenY.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener"
      data-cursor="hover"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerEnter={() => sfx('sparkle')}
      className="group inline-block [perspective:900px]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="relative block rounded-sm p-[1px]"
        style={{
          rotateX: calm ? 0 : srx,
          rotateY: calm ? 0 : sry,
          transformStyle: 'preserve-3d',
          background: `linear-gradient(150deg, ${accent}, rgba(212,175,106,0.14), ${accent})`,
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.7)',
        }}
      >
        <span className="relative block rounded-sm bg-ivory px-5 pb-4 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(qr)}
            alt={alt}
            width={190}
            height={190}
            loading="lazy"
            className="block h-[152px] w-[152px] md:h-[172px] md:w-[172px]"
          />
          <span className="mt-3 block text-center font-body text-[10px] uppercase tracking-grand text-[#6b5636]">
            {events.scanCaption}
          </span>
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: sheen }}
          />
        </span>
      </motion.span>
    </motion.a>
  );
}
