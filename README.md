# Ronald & Amala

A one-page wedding invitation for **Ronald Varghese** and **Amala Wilson** —
Monday, 14 September 2026, St. Casimir's Church, Kadavoor, Kollam.

The page is meant to be watched rather than read. Scrolling is the timeline:
the sky is graded continuously from night to full morning, and each scene
dissolves in and out of the frame like a shot in a film.

## Running it

It is a static site with no build step and no dependencies.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Deploying is a matter of serving the folder — GitHub Pages, Netlify, or any
static host will do. Opening `index.html` straight from disk also works.

## Layout

```
index.html            the invitation, in eight scenes
assets/css/style.css  the look; everything hangs off --t and --k
assets/js/main.js     the projector: colour grading + scene scrubbing
assets/qr/*.svg       map QR codes (generated, see below)
assets/og.jpg         link preview image for WhatsApp and the like
```

## How the motion works

Two custom properties carry the whole design:

- `--t` — progress through the entire page, `0 → 1`. It drives the colour
  grade: sky, ink, gold, the halo behind the text, and how much daylight
  there is for the rays, clouds and vignette. The palettes are keyframe
  timelines in `main.js` (`SKY`, `INK`, `GOLD`, `HALO`, `GLOW`), interpolated
  each frame.
- `--k` — how present a single scene is, `0 → 1 → 0` as it passes through the
  viewport. Each scene is a tall block with a `position: sticky` inner frame,
  so the words hold still while you scroll and then dissolve. Children stagger
  off `--k` via their own `--d` delay, so nothing is timed to the clock — it is
  all scrubbed by the scroll, and runs backwards just as well as forwards.

The first scene never fades in (it is already on screen, and blooms in on
load instead) and the last never fades out, so the invitation opens and closes
on a held frame.

`prefers-reduced-motion` drops the sticky scenes, the canvas and the
animations, and lays the whole invitation out as a plain, still document.

## The QR codes

Each venue links to its location on Google Maps. The cards are tappable as
well as scannable.

| Scene      | Venue                            |
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

The `<a href>` in `index.html` has to be updated to match — the link and the QR
carry the same URL, and nothing checks that they agree.

One deployment note: `og:image` is a relative path, which some link-preview
scrapers resolve and some do not. If the invitation goes out on a domain of its
own, make it absolute.
