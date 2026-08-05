#!/usr/bin/env python3
"""Write the second copy of the invitation, the one Amala sends.

There is one invitation, `index.html`, and it is Ronald's. Hers is the same
page with her name first and the engagement left off — her side of the family
is not invited to that one, so listing it would only raise the question.

Two copies maintained by hand would drift the first time either is edited, so
hers is derived instead. Every edit below is an exact, named substitution that
must match exactly once; anything that does not is a hard failure rather than a
quietly wrong page going out to a few hundred guests.

    python3 tools/variants.py _site

Reads index.html from the repository root and writes <out>/a/index.html.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# The heart is &#9825; in the source; keeping it as an entity here means the
# metadata swaps stay byte-comparable with what is actually in the file.
HEART = "&#9825;"

# (description, before, after) — order matters only in that each must be
# unambiguous at the point it runs.
EDITS = [
    (
        "page title",
        f"<title>Ronald {HEART} Amala · 14 September 2026</title>",
        f"<title>Amala {HEART} Ronald · 14 September 2026</title>",
    ),
    (
        "meta description",
        'content="Ronald and Amala are getting married',
        'content="Amala and Ronald are getting married',
    ),
    (
        "og:url",
        '<meta property="og:url" content="https://ronaldandamala.com/">',
        '<meta property="og:url" content="https://ronaldandamala.com/a/">',
    ),
    (
        "og:title",
        f'content="Ronald {HEART} Amala are getting married"',
        f'content="Amala {HEART} Ronald are getting married"',
    ),
    (
        # her link deserves a preview card with her name first
        "og:image",
        '<meta property="og:image" content="https://ronaldandamala.com/assets/og.jpg">',
        '<meta property="og:image" content="https://ronaldandamala.com/assets/og-amala.jpg">',
    ),
    (
        "the names",
        '<span class="names__n">Ronald</span>',
        '<span class="names__n">Amala</span>',
    ),
    (
        "the names (second)",
        '<span class="names__n">Amala</span>\n      </h1>',
        '<span class="names__n">Ronald</span>\n      </h1>',
    ),
    (
        "the seal",
        '<span class="seal__core">R<svg class="hrt"><use href="#hrt"/></svg>A</span>',
        '<span class="seal__core">A<svg class="hrt"><use href="#hrt"/></svg>R</span>',
    ),
    (
        "the monogram",
        '<p class="monogram">R<svg class="hrt hrt--beat"><use href="#hrt"/></svg>A</p>',
        '<p class="monogram">A<svg class="hrt hrt--beat"><use href="#hrt"/></svg>R</p>',
    ),
    (
        "the sign-off",
        'With love, Ronald <svg class="hrt"><use href="#hrt"/></svg> Amala',
        'With love, Amala <svg class="hrt"><use href="#hrt"/></svg> Ronald',
    ),
]

# The engagement item, start tag to close. The list is flat — no nested <li> —
# so a non-greedy match to the first </li> is exactly one entry.
ENGAGEMENT = re.compile(r'\n\s*<li class="rail__item[^"]*"[^>]*data-event="engagement".*?</li>\n', re.S)

# index.html uses relative asset paths, which is what lets it sit at a domain
# root or a /A-R/ subpath unchanged. Hers is a directory deeper, where the same
# paths would resolve to /a/assets/ and 404, so they are made root-absolute.
# (A <base href="/"> would be tidier but breaks the <use href="#hrt"> heart:
# a fragment-only URL resolves against the base, and #hrt stops being local.)
ASSETS = re.compile(r'(href|src)="assets/')


def build(out_dir):
    src = ROOT / "index.html"
    html = src.read_text(encoding="utf-8")
    problems = []

    for name, before, after in EDITS:
        hits = html.count(before)
        if hits != 1:
            problems.append(f"{name}: expected 1 match, found {hits}\n    looking for: {before[:78]}")
            continue
        html = html.replace(before, after, 1)

    html, removed = ENGAGEMENT.subn("\n", html)
    if removed != 1:
        problems.append(f"the engagement item: expected 1 match, found {removed}")

    html, repointed = ASSETS.subn(r'\1="/assets/', html)
    if repointed == 0:
        problems.append("asset paths: found none to make root-absolute")

    if problems:
        print("tools/variants.py could not build Amala's copy:\n", file=sys.stderr)
        for p in problems:
            print(f"  - {p}\n", file=sys.stderr)
        print(
            "index.html has changed underneath this script. Update the strings\n"
            "in EDITS to match and re-run — do not publish until it passes.",
            file=sys.stderr,
        )
        return None

    # a page that still says Ronald first has not been transformed
    body = html.split("</head>", 1)[1]
    if body.index("Amala") > body.index("Ronald"):
        print("tools/variants.py: Ronald still appears before Amala in the body", file=sys.stderr)
        return None
    if "engagement" in body.lower():
        print("tools/variants.py: the engagement survived the removal", file=sys.stderr)
        return None
    if '="assets/' in html:
        print("tools/variants.py: a relative asset path survived — it would 404 "
              "from /a/", file=sys.stderr)
        return None

    # Written twice, to /a/index.html and /a.html. A static host resolves
    # "/a" and "/a/" by different rules, and this link is going out to people
    # who will type it off a printed card — it should not matter which they
    # land on, or whether a trailing slash survived the retyping. Both files
    # come from the same string, so they cannot disagree.
    out = pathlib.Path(out_dir)
    dest = out / "a" / "index.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    (out / "a.html").write_text(html, encoding="utf-8")
    print(f"hers       {len(EDITS)} edits, engagement removed  -> {dest} and {out / 'a.html'}")
    return dest


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "_site"
    sys.exit(0 if build(out) else 1)
