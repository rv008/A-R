'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** True once the component is mounted on the client — gates anything non-deterministic. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * True when the guest asked for reduced motion — but only once mounted.
 *
 * Components branch on this to render a still document instead of an animated
 * one. The server has no media queries and always renders the animated tree,
 * so reporting the real preference on the first client render would hand React
 * a different tree than it hydrated against. Staying `false` for that one
 * render keeps the markup identical; the CSS `prefers-reduced-motion` rules in
 * globals.css have already frozen every animation by then, so nothing moves in
 * the meantime.
 */
export function useCalm() {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  return mounted && !!reduced;
}

/** True on coarse-pointer (touch) devices; the custom cursor stands down. */
export function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setTouch(mq.matches);
    const on = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return touch;
}
