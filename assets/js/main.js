/* ============================================================
   Ronald & Amala — the projector.

   One rAF loop does three things:
     1. grades the sky from night to morning across the scroll
     2. scrubs each scene's presence (--k) so it dissolves in and out
     3. drifts stars, then light, across a canvas
   ============================================================ */

(() => {
  'use strict';

  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  /* ── small maths ─────────────────────────────────────────── */

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, m) => a + (b - a) * m;

  const smooth = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };

  const hex = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];

  /* Reads a value off a keyframe timeline: [[t, value], …] */
  const along = (stops, t, mix) => {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        const [t0, v0] = stops[i - 1];
        const [t1, v1] = stops[i];
        return mix(v0, v1, smooth(t0, t1, t));
      }
    }
    return stops[stops.length - 1][1];
  };

  const mixNum = (a, b, m) => lerp(a, b, m);

  const mixTriple = (a, b, m) => {
    const out = [];
    for (let i = 0; i < 3; i++) {
      const c0 = hex(a[i]);
      const c1 = hex(b[i]);
      out.push(
        `rgb(${Math.round(lerp(c0[0], c1[0], m))} ${Math.round(lerp(c0[1], c1[1], m))} ${Math.round(lerp(c0[2], c1[2], m))})`
      );
    }
    return out;
  };

  /* ── the colour script ───────────────────────────────────── */
  /* top of sky, middle, horizon — the hour of the day, in three notes */

  const SKY = [
    [0.00, ['#080c20', '#141a3a', '#2c2b55']], // before dawn
    [0.16, ['#1b1c40', '#43305c', '#a86c74']], // first colour
    [0.34, ['#5d4a72', '#c4838a', '#f3c49c']], // the sun arrives
    [0.50, ['#a695b8', '#efd3bc', '#fdf1e0']], // the light opens
    [0.70, ['#c9bcc9', '#f7e6d2', '#fffaf2']], // full morning
    [0.88, ['#d9c9b8', '#f6e5cb', '#fffbf2']],
    [1.00, ['#e0cdb5', '#f8ead2', '#fffdf7']], // and it stays
  ];

  /* Ink, gold and halo turn from light to dark together, and quickly —
     lingering halfway would leave mid-tone text on a mid-tone sky, which is
     where legibility dies. The two stops in the middle of each timeline are
     retimed in `retime()` to land on the seam between two scenes, so the
     turn happens while the screen is empty and is never seen. */
  const INK = [
    [0.00, ['#f6efe6', '#f6efe6', '#f6efe6']],
    [0.29, ['#f6efe6', '#f6efe6', '#f6efe6']],
    [0.37, ['#3a2e20', '#3a2e20', '#3a2e20']],
    [1.00, ['#2c2318', '#2c2318', '#2c2318']],
  ];

  const GOLD = [
    [0.00, ['#e6c78d', '#e6c78d', '#e6c78d']],
    [0.29, ['#eec894', '#eec894', '#eec894']],
    [0.37, ['#9c7430', '#9c7430', '#9c7430']],
    [1.00, ['#8a6528', '#8a6528', '#8a6528']],
  ];

  /* the glow behind the words: dark early, luminous later — it is what
     holds the contrast up while the sky moves underneath */
  const HALO = [
    [0.00, [6, 10, 30, 0.62]],
    [0.29, [16, 14, 40, 0.62]],
    [0.37, [255, 249, 238, 0.78]],
    [1.00, [255, 252, 245, 0.9]],
  ];

  const mixRGBA = (a, b, m) =>
    `rgba(${Math.round(lerp(a[0], b[0], m))}, ${Math.round(lerp(a[1], b[1], m))}, ${Math.round(lerp(a[2], b[2], m))}, ${lerp(a[3], b[3], m).toFixed(3)})`;

  /* how much daylight there is — drives rays, clouds, vignette */
  const GLOW = [[0.0, 0], [0.22, 0.15], [0.5, 0.75], [0.78, 1], [1, 0.85]];

  /* ── scenes ──────────────────────────────────────────────── */

  const scenes = [...document.querySelectorAll('[data-scene]')];
  const bar = document.getElementById('filmBar');
  const cue = document.getElementById('cue');

  let vh = innerHeight;
  let docSpan = 1;

  /* Which seam the day breaks on: the gap between the couple's names and the
     date. Everything is measured, so changing a scene's height in the CSS
     moves the sunrise with it. */
  const TURN_AFTER = 3;

  const retime = () => {
    const scene = scenes[TURN_AFTER];
    if (!scene) return;
    const seam = clamp(scene._top / docSpan, 0.12, 0.88);
    const a = seam - 0.014;
    const b = seam + 0.017;
    for (const timeline of [INK, GOLD, HALO]) {
      timeline[1][0] = a;
      timeline[2][0] = b;
    }
  };

  const measure = () => {
    vh = innerHeight;
    docSpan = Math.max(1, document.body.scrollHeight - vh);
    for (const s of scenes) {
      /* the pinned frame's real height, which on mobile is 100svh and so
         not the same thing as innerHeight */
      const frame = s.firstElementChild.getBoundingClientRect().height || vh;
      s._top = s.offsetTop;
      s._span = Math.max(1, s.offsetHeight - frame);
      s._open = s === scenes[0];
      s._close = s === scenes[scenes.length - 1];
    }
    retime();
  };

  /* ── the loop ────────────────────────────────────────────── */

  let queued = false;
  let lastY = -1;

  const draw = () => {
    queued = false;
    const y = scrollY;
    const t = clamp(y / docSpan);

    /* 1 — grade the sky */
    const sky = along(SKY, t, mixTriple);
    const ink = along(INK, t, mixTriple)[0];
    const gold = along(GOLD, t, mixTriple)[0];
    const halo = along(HALO, t, mixRGBA);
    const glow = along(GLOW, t, mixNum);

    root.style.setProperty('--t', t.toFixed(4));
    root.style.setProperty('--sky-1', sky[0]);
    root.style.setProperty('--sky-2', sky[1]);
    root.style.setProperty('--sky-3', sky[2]);
    root.style.setProperty('--ink', ink);
    root.style.setProperty('--gold', gold);
    root.style.setProperty('--halo', halo);
    root.style.setProperty('--glow', glow.toFixed(3));

    if (bar) bar.style.transform = `scaleX(${t.toFixed(4)})`;

    /* 2 — scrub each scene in and out of view.
       The first scene is already on screen, so it never fades in;
       the last one is the closing frame, so it never fades out. */
    for (const s of scenes) {
      const p = clamp((y - s._top) / s._span);
      /* the windows meet at the seam between scenes, so one frame is gone
         exactly as the next arrives — a dip through empty sky, not a pause */
      const kIn = s._open ? 1 : smooth(0, 0.1, p);
      const kOut = s._close ? 1 : 1 - smooth(0.9, 1, p);
      s.style.setProperty('--p', p.toFixed(4));
      s.style.setProperty('--k', (kIn * kOut).toFixed(4));
    }

    /* 3 — the scroll cue bows out once you've begun */
    if (cue) cue.classList.toggle('is-gone', y > vh * 0.25);

    starAlpha = 1 - smooth(0.02, 0.26, t);
    moteAlpha = smooth(0.22, 0.46, t);
    lastY = y;
  };

  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(draw);
    }
  };

  /* ── stars, and then the light ───────────────────────────── */

  const canvas = document.getElementById('motes');
  const ctx = canvas && canvas.getContext('2d');
  let stars = [];
  let motes = [];
  let starAlpha = 1;
  let moteAlpha = 0;
  let dpr = 1;

  const seed = () => {
    if (!ctx) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const area = innerWidth * innerHeight;
    const nStars = Math.round(clamp(area / 9000, 40, 150));
    const nMotes = Math.round(clamp(area / 26000, 18, 60));

    stars = Array.from({ length: nStars }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.6 + 0.25,
      s: Math.random() * 0.9 + 0.25,      // twinkle speed
      o: Math.random() * Math.PI * 2,     // twinkle offset
    }));

    motes = Array.from({ length: nMotes }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 2.6 + 0.8,
      a: Math.random() * 0.4 + 0.18,
      v: Math.random() * 0.16 + 0.05,     // rise
      w: Math.random() * 0.7 + 0.25,      // sway
      o: Math.random() * Math.PI * 2,
    }));
  };

  const paint = (now) => {
    requestAnimationFrame(paint);
    if (!ctx) return;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const ms = now * 0.001;

    if (starAlpha > 0.01) {
      for (const st of stars) {
        const tw = 0.65 + 0.35 * Math.sin(ms * st.s + st.o);
        ctx.globalAlpha = st.a * tw * starAlpha;
        ctx.fillStyle = '#fdf6e8';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (moteAlpha > 0.01) {
      for (const m of motes) {
        m.y -= m.v;
        if (m.y < -12) {
          m.y = innerHeight + 12;
          m.x = Math.random() * innerWidth;
        }
        const x = m.x + Math.sin(ms * m.w + m.o) * 14;
        const g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * 4.5);
        g.addColorStop(0, 'rgba(255, 246, 224, .95)');
        g.addColorStop(1, 'rgba(255, 236, 198, 0)');
        ctx.globalAlpha = m.a * moteAlpha;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, m.y, m.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  };

  /* ── go ──────────────────────────────────────────────────── */

  const start = () => {
    measure();
    draw();
    if (!calm.matches) {
      seed();
      requestAnimationFrame(paint);
    } else if (canvas) {
      canvas.style.display = 'none';
    }
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    measure();
    if (!calm.matches) seed();
    draw();
  }, { passive: true });

  addEventListener('load', () => { measure(); draw(); });
  document.fonts && document.fonts.ready.then(() => { measure(); draw(); });

  start();
})();
