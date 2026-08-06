/* ============================================================
   Ronald ♥ Amala — the small amount of script an invite needs.

     1. the countdown to the ceremony
     2. "add to calendar" → a two-event .ics, built in the browser
     3. "share the invite" → the native sheet, or the clipboard
     4. reveal-on-scroll for page two

   No dependencies, no build step. If any of it fails the page is
   still a complete invitation.
   ============================================================ */

(() => {
  'use strict';

  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  /* Kerala is UTC+05:30 all year, so the two moments are unambiguous.
     Kept in UTC to sidestep the viewer's own timezone entirely. */
  const CEREMONY = Date.UTC(2026, 8, 14, 6, 0);   // 14 Sep 2026, 11:30 IST
  const ENGAGEMENT = Date.UTC(2026, 8, 6, 6, 0);  //  6 Sep 2026, 11:30 IST

  /* There are two copies of this invitation — Ronald's and Amala's, the second
     with her name first and no engagement. Rather than being told which one it
     is running on, this reads the page. The calendar then cannot offer an event
     the page does not show, and the names come out in the order shown. */
  const names = [...document.querySelectorAll('.names__n')].map((n) => n.textContent.trim());
  const pair = names.length === 2 ? `${names[0]} & ${names[1]}` : 'Ronald & Amala';
  const showsEngagement = !!document.querySelector('[data-event="engagement"]');

  /* ── 1 · the countdown ───────────────────────────────────── */

  const count = document.getElementById('count');

  const tick = () => {
    if (!count) return;
    const left = CEREMONY - Date.now();

    if (left <= 0) {
      count.className = 'count count--done';
      count.textContent = 'Married — 14 September 2026';
      count.hidden = false;
      return true;                                   // nothing left to run
    }

    const mins = Math.floor(left / 60000);
    const parts = {
      d: Math.floor(mins / 1440),
      h: Math.floor(mins / 60) % 24,
      m: mins % 60,
    };

    for (const key in parts) {
      const cell = count.querySelector(`[data-count="${key}"]`);
      if (!cell) continue;
      const next = String(parts[key]).padStart(2, '0');
      if (cell.textContent === next) continue;

      cell.textContent = next;
      if (calm.matches) continue;
      /* retrigger the kick: drop the class, force a reflow, put it back */
      cell.classList.remove('is-new');
      void cell.offsetWidth;
      cell.classList.add('is-new');
    }

    count.hidden = false;
    return false;
  };

  if (count && !tick()) {
    setInterval(() => tick(), 10000);
  }

  /* ── 2 · the calendar file ───────────────────────────────── */

  /* RFC 5545 reserves these inside a text value, and Google Calendar is
     unforgiving about it. */
  const esc = (s) => s.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');

  /* RFC 5545 caps a content line at 75 octets; the rest continues on a line
     beginning with a space. Everything here is ASCII, so chars are octets. */
  const fold = (line) => (line.length <= 74 ? line : line.match(/.{1,74}/g).join('\r\n '));

  const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const event = ({ uid, start, hours, summary, where, note }) => [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(start + hours * 3600000)}`,
    `SUMMARY:${esc(summary)}`,
    `LOCATION:${esc(where)}`,
    `DESCRIPTION:${esc(note)}`,
    'END:VEVENT',
  ];

  const ics = () => [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ronald and Amala//Wedding 2026//EN',
    'CALSCALE:GREGORIAN',
    ...(showsEngagement ? event({
      uid: 'ra-engagement-20260906@ronald-amala',
      start: ENGAGEMENT,
      hours: 3,
      summary: `Engagement - ${pair}`,
      where: 'Millennium Hall, Tangasseri, Kollam',
      note: 'Sunday, 6 September 2026 at 11:30 am.',
    }) : []),
    ...event({
      uid: 'ra-wedding-20260914@ronald-amala',
      start: CEREMONY,
      hours: 4,
      summary: `Wedding of ${pair}`,
      where: "St. Casimir's Church, Kadavoor, Kollam",
      note: "Ceremony at St. Casimir's Church, Kadavoor, at 11:30 am. Reception to follow at Bishop Jerome Convention Hall, Kadavoor.",
    }),
    'END:VCALENDAR',
  ].map(fold).join('\r\n');

  /* ── 3 · the buttons ─────────────────────────────────────── */

  const toast = document.getElementById('toast');
  let clearToast;

  const say = (words) => {
    if (!toast) return;
    toast.textContent = words;
    toast.classList.add('is-on');
    clearTimeout(clearToast);
    clearToast = setTimeout(() => toast.classList.remove('is-on'), 3200);
  };

  const HEART = '<svg viewBox="0 0 32 28"><path d="M16 26.5S2.5 18.4 2.5 9.6C2.5 5.4 5.9 2 10.1 2c2.5 0 4.8 1.2 5.9 3.1C17.1 3.2 19.4 2 21.9 2c4.2 0 7.6 3.4 7.6 7.6 0 8.8-13.5 16.9-13.5 16.9z"/></svg>';

  /* a dozen hearts thrown up and out from wherever the button is */
  const burst = (el) => {
    if (calm.matches) return;
    const box = el.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    for (let i = 0; i < 12; i++) {
      const heart = document.createElement('span');
      heart.className = 'burst';
      heart.innerHTML = HEART;
      const angle = (Math.PI / 6) * i + Math.random() * 0.4;
      const reach = 70 + Math.random() * 70;
      heart.style.left = `${x - 7}px`;
      heart.style.top = `${y - 6}px`;
      heart.style.setProperty('--dx', `${Math.cos(angle) * reach}px`);
      /* biased upwards, so they lift rather than merely scatter */
      heart.style.setProperty('--dy', `${Math.sin(angle) * reach - 40}px`);
      heart.style.setProperty('--dr', `${Math.random() * 220 - 110}deg`);
      heart.addEventListener('animationend', () => heart.remove());
      document.body.appendChild(heart);
    }
  };

  const cal = document.getElementById('cal');

  if (cal) {
    cal.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([ics()], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(names.join('-and-') || 'ronald-and-amala').toLowerCase()}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      /* revoked late, because Safari reads the blob after the click returns */
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      burst(cal);
      say(showsEngagement ? 'Both dates, saved' : 'Saved to your calendar');
    });
  }

  const share = document.getElementById('share');

  if (share) {
    share.addEventListener('click', async () => {
      const payload = {
        title: pair,
        text: "We're getting married — 14 September 2026, Kollam.",
        url: location.href,
      };

      try {
        if (navigator.share) {
          await navigator.share(payload);
          return;
        }
        await navigator.clipboard.writeText(location.href);
        say('Link copied');
      } catch (err) {
        /* the user backing out of the share sheet is not a failure */
        if (err && err.name === 'AbortError') return;
        say(location.host || 'Copy the address bar');
      }
    });
  }

  /* ── 4 · reveal on scroll ────────────────────────────────── */

  const waiting = [...document.querySelectorAll('.reveal')];

  if (calm.matches) {
    for (const el of waiting) el.classList.add('is-in');
    return;
  }

  /* Deliberately a scroll check rather than an IntersectionObserver: the
     observer only reports threshold crossings, so flinging the scrollbar or
     landing mid-page leaves whatever was skipped stuck at opacity 0. Walking
     a list of five elements once a frame costs nothing and cannot miss. */
  let queued = false;

  const settle = () => {
    queued = false;
    const line = innerHeight * 0.88;

    for (let i = waiting.length - 1; i >= 0; i--) {
      if (waiting[i].getBoundingClientRect().top < line) {
        waiting[i].classList.add('is-in');
        waiting.splice(i, 1);
      }
    }

    if (!waiting.length) removeEventListener('scroll', onScroll);
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(settle);
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  settle();
})();
