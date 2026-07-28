'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ambient } from './engine';

type AudioApi = {
  on: boolean;
  toggle: () => void;
  sfx: (kind: Parameters<typeof ambient.sfx>[0]) => void;
};

const Ctx = createContext<AudioApi>({ on: false, toggle: () => {}, sfx: () => {} });

export const useAudio = () => useContext(Ctx);

const PREF_KEY = 'ra-music';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const wantsMusic = useRef(false);

  // If the guest turned music on during a previous visit, resume it at the
  // very first interaction — browsers count that gesture as consent to play.
  useEffect(() => {
    if (localStorage.getItem(PREF_KEY) !== 'on') return;
    wantsMusic.current = true;
    const wake = () => {
      if (!wantsMusic.current) return;
      wantsMusic.current = false;
      ambient.start();
      setOn(true);
    };
    window.addEventListener('pointerdown', wake, { once: true });
    window.addEventListener('keydown', wake, { once: true });
    return () => {
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  const toggle = useCallback(() => {
    wantsMusic.current = false;
    setOn((prev) => {
      const next = !prev;
      if (next) ambient.start();
      else ambient.stop();
      localStorage.setItem(PREF_KEY, next ? 'on' : 'off');
      return next;
    });
  }, []);

  const sfx = useCallback((kind: Parameters<typeof ambient.sfx>[0]) => ambient.sfx(kind), []);

  return <Ctx.Provider value={{ on, toggle, sfx }}>{children}</Ctx.Provider>;
}
