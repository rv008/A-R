# Ronald & Amala

A cinematic wedding invitation for **Ronald Varghese** and **Amala Wilson** —
Monday, 14 September 2026, St. Casimir's Church, Kadavoor, Kollam.

The invitation is meant to be watched rather than read. It opens on a sealed
manuscript in the dark, and unfolds chapter by chapter as you scroll: the hosts'
page, the couple joined by a growing vine, the day proclaimed on parchment under
a wax seal, three celebrations each in a world of its own, and a night sky
filling with lanterns.

## Running it

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # static export into out/
```

The build is a fully static export — no server, no database, no runtime.

## The chapters

| Chapter | Scene | Motion language |
| ------- | ----- | --------------- |
| Prologue | starfield, the monogram written in light | ink condensing out of blur |
| I · The Invitation | the hosts, on an illuminated page | vines drawing themselves into the corners |
| II · The Couple | the two names, joined | a GSAP vine braiding as you scroll |
| III · The Day | the date, proclaimed on parchment | a wax seal pressed into the page |
| IV · The Celebrations | engagement, ceremony, reception | rings meeting · light through an arch · a falling chandelier |
| V · With Love | the closing regards | lanterns rising into the dark |

## How it is built

- **Next.js** (app router, static export) with **TailwindCSS**.
- **Framer Motion** for scroll-linked presence, staggered text, springs and
  layout transitions; **GSAP** for the two scrubbed SVG timelines (the union
  vine and the wax seal).
- **Lenis** for smooth scrolling, driving `ScrollTrigger.update` so both
  animation engines share one clock.
- **React Three Fiber** for the starfield and golden dust, in a shader that
  twinkles and drifts on the GPU. It is the heaviest dependency, so it is code-
  split and mounted only in the browser — the words never wait on it.

Every wedding fact lives in `lib/content.ts` and nowhere else. Presentation may
change freely; those strings are the invitation and are reused verbatim.

### The two load-bearing pieces

`components/layout/Chapter.tsx` is the frame every chapter hangs off. A chapter
is a tall scroll span with a `position: sticky` inner frame, so the words hold
still while you scroll and then dissolve. Its `p` (0 → 1 across the span) is
handed to the children, which choreograph themselves against it — nothing is
timed to a clock, so the whole story scrubs backwards as well as forwards.

`components/audio/engine.ts` is the soundtrack: a generative ambient score
synthesized live in the Web Audio API. A slow triangle-wave pad drifts through
four chords, sparse pentatonic plucks answer each other santoor-fashion, and
high bells ring every twenty seconds or so, all through a feedback delay. No
audio is downloaded and the score never repeats. It starts only on a user
gesture, fades over 2.5 s, and remembers the guest's choice in `localStorage`.

## Motion and stillness

`prefers-reduced-motion` is honoured throughout: `MotionConfig
reducedMotion="user"` drops transform animations, the canvas and petals never
mount, and each chapter renders as a still, fully legible page.

Two rules matter when editing the animated components, and breaking either one
is silent:

- Call every hook before any `calm` early-return. `useCalm()` reports `false` on
  the first render and its real value after mount, so a `useTransform` sitting
  below a conditional return will vanish on the second render and take the page
  down with it.
- When a `calm` branch stops animating a property, set that property explicitly
  (`opacity: 1`, `pathLength: 1`) rather than passing `{}`. Framer-motion has
  already written a value to the element by then, and an empty style object
  leaves it frozen there — invisible.

## Deploying

`.github/workflows/deploy.yml` builds the export and publishes it to GitHub
Pages on every push. Set **Settings → Pages → Source** to **GitHub Actions**
once; the workflow derives the base path from the repository name, so a project
site at `/<repo>` and a `<user>.github.io` site both resolve their assets.

## The QR codes

Each venue links to its location on Google Maps. The cards are tappable as well
as scannable.

| Chapter    | Venue                            |
| ---------- | -------------------------------- |
| Ceremony   | St. Casimir's Church, Kadavoor   |
| Reception  | Bishop Jerome Convention Hall    |
| Engagement | Millennium Hall, Tangasseri      |

They were generated with [segno](https://github.com/heuer/segno) at error
correction level M, which keeps each symbol to 33–37 modules. That size matters:
at level Q the church code needed 41 modules, and rendered at phone size it
stopped decoding. The codes are drawn at a minimum of 152 px so a camera
resolves roughly four device pixels per module.

To change a venue, edit `VENUES` in `tools/qr.py` and re-run it. `--verify`
decodes each symbol back and checks it resolves to the URL it was built from:

```sh
pip install segno
python3 tools/qr.py --verify            # add opencv-python-headless + pillow
```

The map URL in `lib/content.ts` has to be updated to match — the link and the QR
carry the same URL, and nothing checks that they agree.
