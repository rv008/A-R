/* ============================================================
   Ronald & Amala — the small amount of script an invite needs.

     1. the countdown to the ceremony
     2. "add to calendar" → a two-event .ics, built in the browser
     3. "share the invite" → the native sheet, or the clipboard
     4. reveal-on-scroll for everything below the card

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
      if (cell) cell.textContent = String(parts[key]).padStart(2, '0');
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
    ...event({
      uid: 'ra-engagement-20260906@ronald-amala',
      start: ENGAGEMENT,
      hours: 3,
      summary: 'Engagement - Ronald & Amala',
      where: 'Millennium Hall, Tangasseri, Kollam',
      note: 'Sunday, 6 September 2026 at 11:30 am.',
    }),
    ...event({
      uid: 'ra-wedding-20260914@ronald-amala',
      start: CEREMONY,
      hours: 4,
      summary: 'Wedding of Ronald & Amala',
      where: "St. Casimir's Church, Kadavoor, Kollam",
      note: "Ceremony at St. Casimir's Church, Kadavoor, at 11:30 am. Reception to follow at Bishop Jerome Convention Hall, Kollam.",
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

  const cal = document.getElementById('cal');

  if (cal) {
    cal.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([ics()], { type: 'text/calendar;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ronald-and-amala.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      /* revoked late, because Safari reads the blob after the click returns */
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      say('Both dates, saved');
    });
  }

  const share = document.getElementById('share');

  if (share) {
    share.addEventListener('click', async () => {
      const payload = {
        title: 'Ronald & Amala',
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
     a list of seven elements once a frame costs nothing and cannot miss. */
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
