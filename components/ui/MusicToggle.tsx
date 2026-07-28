'use client';

import { motion } from 'framer-motion';
import { useAudio } from '../audio/AudioProvider';
import { Magnetic } from './Magnetic';

const BARS = [0, 1, 2, 3];

export function MusicToggle() {
  const { on, toggle } = useAudio();

  return (
    <Magnetic strength={0.35}>
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={on ? 'Pause the music' : 'Play the music'}
        aria-pressed={on}
        data-cursor="hover"
        className="fixed bottom-5 right-5 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-abyss/40 backdrop-blur-md md:bottom-8 md:right-8"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.12, borderColor: 'rgba(212,175,106,0.7)' }}
        whileTap={{ scale: 0.92 }}
      >
        <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
          {BARS.map((i) => (
            <motion.span
              key={i}
              className="w-[2px] rounded-full bg-gold"
              animate={
                on
                  ? { height: ['30%', '95%', '45%', '80%', '30%'] }
                  : { height: '30%' }
              }
              transition={
                on
                  ? { duration: 1.1 + i * 0.22, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.5 }
              }
              style={{ height: '30%' }}
            />
          ))}
        </span>
      </motion.button>
    </Magnetic>
  );
}
