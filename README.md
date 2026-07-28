# Ronald ♥ Amala

An e-invite for **Ronald Varghese** and **Amala Wilson** —
Monday, 14 September 2026, St. Casimir's Church, Kadavoor, Kollam.

It is an invitation, not a wedding website, and it is exactly two pages. The
first is the card: who, when, how long to wait, and the two buttons worth
having. The second is where to be, and a sign-off. Both are a viewport tall and
snap, so it is read the way a card is turned over rather than scrolled through.

Everything else is deliberately absent. An invitation that has to be scrolled
twice to find the time has stopped being an invitation.

## Running it

A static page with no build step and no dependencies.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from disk also works.

## Deploying

It is live at **<https://ronaldandamala.com>**, on GitHub Pages behind a
domain registered through Cloudflare. `rv008.github.io/A-R/` still redirects
there, so links shared before the move keep working.

`main` is the only branch kept; pushing to it deploys.
`.github/workflows/deploy.yml` copies `index.html`, `CNAME` and `assets/` into
`_site` and hands that to GitHub Pages — there is nothing to compile, so there
is no build step to go wrong. The README and the generators in `tools/` stay
out of the published site.

`CNAME` is copied into the artifact rather than left to the repository
settings alone: an Actions deploy that publishes without one can clear the
custom domain, which takes the site down until it is set again.

Every path in `index.html` is relative, so the invitation works unchanged at a
subpath or at the root of a domain. The three exceptions are `CNAME`, `og:url`
and `og:image` — the last two have to be absolute for link previews to resolve.
All three need editing if the invitation ever moves again.

### DNS

The apex is four A records and four AAAA records pointing at GitHub Pages, and
`www` is a CNAME to `rv008.github.io`. On Cloudflare every one of them must be
**DNS only** (grey cloud, not orange): proxying breaks the HTTP challenge
GitHub uses to issue the certificate, and with SSL mode on Flexible it also
puts the site in a redirect loop.

## Layout

```
index.html            the invitation
CNAME                 the custom domain, published with the site
.github/workflows/    the Pages deploy
assets/css/style.css  the look
assets/js/main.js     countdown, .ics, share, heart burst, reveal-on-scroll
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

A heart stands in for the ampersand — between the names, on the seal, in the
monogram and in the sign-off. It is one inline `<symbol>` referenced four times
rather than a `♥` character, because U+2665 falls outside the Cormorant subset's
`unicode-range` and would land on whatever the device substitutes. On some, that
is a colour emoji.

The soft touches are cheap: ten petals falling on a fixed layer across both
pages, a pair of eucalyptus sprigs growing out of the base of the card, a heart
that beats twice and rests, dots that pop as the rail comes up, and a dozen
hearts thrown from the calendar button. All of it is CSS except the burst, and
all of it stops under `prefers-reduced-motion`.

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

| Card       | Venue                          | Link                |
| ---------- | ------------------------------ | ------------------- |
| Engagement | Millennium Hall, Tangasseri    | `?q=` name search   |
| Ceremony   | St. Casimir's Church, Kadavoor | shared pin          |
| Reception  | Bishop Jerome Convention Hall  | shared pin          |

The church and reception are shared Google Maps pins, which land on the building
rather than on a search for its name, and are short enough to bring both symbols
down to 29 modules — a version smaller than the `?q=` search the engagement
still uses.

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
