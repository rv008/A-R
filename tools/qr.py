#!/usr/bin/env python3
"""Generate the venue QR codes in assets/qr/.

Each code carries a Google Maps link for one venue. Keep the URLs short —
a longer string needs a denser symbol, which is harder to scan from a phone
held at arm's length.

    pip install segno
    python3 tools/qr.py

Requires: segno. Pass --verify (and `pip install opencv-python-headless
pillow`) to decode each symbol back and confirm it resolves correctly.
"""

import argparse
import pathlib
import sys

import segno

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "qr"

# The church and reception are shared Google Maps pins, which drop straight
# onto the right building instead of onto a search for its name. They are also
# far shorter than a ?q= search, so both symbols come out a version smaller.
VENUES = {
    "church": "https://maps.app.goo.gl/SfrjL5RweDBHgZay5",
    "reception": "https://maps.app.goo.gl/VTc9bbeUsZ3HXoT86",
    "engagement": "https://maps.google.com/?q=Millennium+Hall+Tangasseri+Kollam",
}

INK = "#2a2018"

# Level M is the usual default and keeps the symbol one version smaller than Q,
# which matters: at phone size a denser symbol stops being readable. Border 3
# gives the code most of its quiet zone even before the card's own padding.
ECC = "m"
BORDER = 3


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    codes = {}
    for name, url in VENUES.items():
        qr = segno.make(url, error=ECC)
        path = OUT / f"{name}.svg"
        # No width/height and no light colour: the SVG scales to whatever the
        # CSS asks for, and sits on the card's own background.
        qr.save(
            path,
            kind="svg",
            xmldecl=False,
            svgns=True,
            border=BORDER,
            unit="",
            omitsize=True,
            dark=INK,
            light=None,
        )
        codes[name] = (url, qr)
        print(f"{name:11} version {qr.version:>2}  {qr.symbol_size(border=0)[0]} modules  -> {path.relative_to(OUT.parent.parent)}")
    return codes


def verify(codes):
    import io

    import cv2
    import numpy as np
    from PIL import Image

    detector = cv2.QRCodeDetector()
    ok = True
    for name, (url, qr) in codes.items():
        buf = io.BytesIO()
        qr.save(buf, kind="png", scale=8, border=BORDER)
        buf.seek(0)
        decoded, _, _ = detector.detectAndDecode(np.array(Image.open(buf).convert("L")))
        good = decoded == url
        ok &= good
        print(f"{name:11} {'ok' if good else 'MISMATCH'}  {decoded or '(no read)'}")
    return ok


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--verify", action="store_true", help="decode each symbol back and check it")
    args = ap.parse_args()

    codes = build()
    if args.verify:
        print()
        sys.exit(0 if verify(codes) else 1)
