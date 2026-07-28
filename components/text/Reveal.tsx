'use client';

import { motion, type Variants } from 'framer-motion';
import { useCalm } from '@/lib/hooks';

const lineVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const wordVariants: Variants = {
  hidden: { y: '110%', rotate: 4, opacity: 0 },
  show: {
    y: '0%',
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Words rise out of a clipping mask, one after another, when scrolled into view. */
export function RevealWords({
  text,
  className = '',
  as: Tag = 'p',
  delay = 0,
  once = true,
  gilt = false,
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  once?: boolean;
  /* The gold gradient must sit on the element that directly holds the
     glyphs — background-clip: text cannot see through animated children. */
  gilt?: boolean;
}) {
  const calm = useCalm();
  const MotionTag = motion.create(Tag);
  if (calm) return <Tag className={gilt ? `${className} text-gilt` : className}>{text}</Tag>;

  return (
    <MotionTag
      className={className}
      variants={lineVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.6 }}
      transition={{ delayChildren: delay }}
      aria-label={text}
    >
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom" aria-hidden="true">
          <motion.span
            className={`inline-block will-change-transform${gilt ? ' text-gilt' : ''}`}
            variants={wordVariants}
          >
            {word}
          </motion.span>
          {i < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </MotionTag>
  );
}

/** Letters condense out of haze — ink slowly becoming visible on the page. */
export function InkText({
  text,
  className = '',
  as: Tag = 'p',
  delay = 0,
  stagger = 0.045,
  gilt = false,
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  stagger?: number;
  gilt?: boolean;
}) {
  const calm = useCalm();
  const MotionTag = motion.create(Tag);
  if (calm) return <Tag className={gilt ? `${className} text-gilt` : className}>{text}</Tag>;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`inline-block will-change-transform${gilt ? ' text-gilt' : ''}`}
          variants={{
            hidden: { opacity: 0, filter: 'blur(10px)', y: 8, scale: 1.06 },
            show: {
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              scale: 1,
              transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </MotionTag>
  );
}

/** A quiet single-line fade-and-rise for supporting copy. */
export function RevealLine({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const calm = useCalm();
  if (calm) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
