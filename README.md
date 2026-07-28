# Ronald & Amala

An e-invite for **Ronald Varghese** and **Amala Wilson** —
Monday, 14 September 2026, St. Casimir's Church, Kadavoor, Kollam.

It is an invitation, not a wedding website. One card, three places to be, and a
sign-off — the things a guest actually needs, in the order they need them. The
long version (addresses, travel, the full order of the day) deliberately isn't
here; an invitation that has to be scrolled twice to find the time has stopped
being an invitation.

## Running it

A static page with no build step and no dependencies.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from disk also works.

## Deploying

It is live at **<https://rv008.github.io/A-R/>**.

`main` is the only branch kept; pushing to it deploys.
`.github/workflows/deploy.yml` copies `index.html` and `assets/` into `_site`
and hands that to GitHub Pages — there is nothing to compile, so there is no
build step to go wrong. The README and the generators in `tools/` stay out of
the published site.

Every path in `index.html` is relative, so the invitation works unchanged at a
subpath like `/A-R/` or at the root of a domain. The two exceptions are
`og:url` and `og:image`, which have to be absolute for link previews to
resolve; both need editing if the invitation ever moves.

## Layout

```
index.html            the invitation
.github/workflows/    the Pages deploy
assets/css/style.css  the look
assets/js/main.js     countdown, .ics, share, reveal-on-scroll
assets/qr/*.svg       map QR codes (generated, see below)
assets/og.jpg         link preview image for WhatsApp and the like
tools/og.html         the source of that preview image
tools/qr.py           the source of the QR codes
```

## The design

Terracotta on warm ivory, a high-contrast serif for anything large and a
geometric sans for anything small. The arch on the card is the one shape doing
real work: it reads as stationery before a word has been parsed, and it costs a
`border-radius`.

Both faces are self-hosted variable fonts, latin subset, so the invitation looks
the same on any network and offline.

Everything is one column, sized in `clamp()`, and centred in a sheet that stops
at `68rem`. There is no phone layout and desktop layout — there is one layout
that has been checked for horizontal overflow from 320 px up to 1800 px. Two
breakpoints exist:

- **46rem** — the map QR codes appear. They are worthless on the phone you are
  already holding and genuinely useful on a laptop, so they only show up where
  they earn the space.
- **58rem** — the three event cards go from a stack to a row. Not sooner: below
  this, a third of the row is narrower than the longest venue name and the grid
  buckles past the viewport.

## The moving parts

Four small things, each of which the page survives without:

- **The countdown** to the ceremony, which flips to *Married* once the day has
  passed.
- **Add to calendar** builds a two-event `.ics` (engagement and wedding) in the
  browser and hands it over as a download. Times are written in UTC — Kerala is
  a flat UTC+05:30 — so the viewer's own timezone never enters into it. Lines
  are folded at 75 octets, which RFC 5545 requires and some calendar apps
  actually enforce.
- **Share the invite** uses the native share sheet where there is one and the
  clipboard everywhere else. This is a link that mostly travels by WhatsApp.
- **Reveal on scroll**, done with a scroll listener rather than an
  `IntersectionObserver`. The observer only reports threshold crossings, so
  flinging the scrollbar or landing mid-page leaves whatever got skipped stuck
  at `opacity: 0`. Walking a list of seven elements once a frame cannot miss.

`prefers-reduced-motion` stops the ticker, the seal and every entrance, and
lays the invitation out as a plain, still document.

## Adding an RSVP

There isn't one, because there is no number to send it to. `index.html` carries
a commented-out block just after the events section — drop it in, put a real
number in both places, and nothing else needs to change.

## The QR codes

Each venue links to its location on Google Maps. The cards are tappable as well
as scannable.

| Card       | Venue                            |
| ---------- | -------------------------------- |
| Engagement | Millennium Hall, Tangasseri      |
| Ceremony   | St. Casimir's Church, Kadavoor   |
| Reception  | Bishop Jerome Convention Hall    |

They were generated with [segno](https://github.com/heuer/segno) at error
correction level M, which keeps each symbol to 33–37 modules. To change a venue,
edit `VENUES` in `tools/qr.py` and re-run it. `--verify` decodes each symbol back
and checks it resolves to the URL it was built from:

```sh
pip install segno
python3 tools/qr.py --verify            # add opencv-python-headless + pillow
```

The `<a href>` in `index.html` has to be updated to match — the link and the QR
carry the same URL, and nothing checks that they agree.

## The preview image

`assets/og.jpg` is a screenshot of `tools/og.html`, which pulls in the real
stylesheet and the real fonts so it cannot drift from the invitation. Re-render
it after any change to the type or the palette:

```sh
python3 -m http.server 8000
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.goto("http://localhost:8000/tools/og.html", wait_until="networkidle")
    pg.wait_for_timeout(800)
    pg.screenshot(path="assets/og.jpg", type="jpeg", quality=90)
    b.close()
PY
```

One deployment note: `og:image` is a relative path, which some link-preview
scrapers resolve and some do not. If the invitation goes out on a domain of its
own, make it absolute.
