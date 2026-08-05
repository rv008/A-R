#!/usr/bin/env python3
"""Screenshot tools/og.html into the two link-preview cards.

Ronald's copy of the invitation gets his name first, Amala's gets hers, so
each link previews with the right name leading. Both come from the same
og.html — the second is produced by swapping the two names in the DOM before
the shot, so the cards cannot drift apart.

    python3 -m http.server 8000        # from the repository root
    python3 tools/og.py
"""

import glob
import os
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = "http://localhost:8000/tools/og.html"

# Re-append all three children in the new order. Moving only the spans would
# leave the heart behind them rather than between them.
SWAP = """() => {
    const row = document.querySelector('.og__names');
    const n = row.querySelectorAll('span');
    const heart = row.querySelector('svg');
    if (n.length !== 2 || !heart) throw new Error('expected two names and a heart');
    row.append(n[1], heart, n[0]);
}"""


def launch(p):
    """Playwright's own browser if it has one, otherwise whatever Chromium the
    machine already ships — CI images often pin a build Playwright disagrees
    with, and there is no reason to download a second copy for two screenshots."""
    if os.environ.get("CHROMIUM_PATH"):
        return p.chromium.launch(executable_path=os.environ["CHROMIUM_PATH"],
                                 args=["--no-sandbox"])
    try:
        return p.chromium.launch()
    except Exception:
        found = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
        if not found:
            raise
        return p.chromium.launch(executable_path=found[-1], args=["--no-sandbox"])


def main():
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.new_page(viewport={"width": 1200, "height": 630},
                                device_scale_factor=1)
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(800)

        for name, swap in (("og.jpg", False), ("og-amala.jpg", True)):
            if swap:
                page.evaluate(SWAP)
                page.wait_for_timeout(250)
            out = ROOT / "assets" / name
            page.screenshot(path=out, type="jpeg", quality=90)
            print(f"{name:14} {out.stat().st_size:>6} bytes")

        browser.close()


if __name__ == "__main__":
    sys.exit(main())
