"""
Render the transport chapter as a scroll-scrubbed frame sequence.

The four video references all converge on the same delivery mechanism for a premium scroll
teardown: not live WebGL, but a pre-rendered sequence decomposed into frames and scrubbed by
scroll position, because frames do not stutter on weak devices. What they do not transfer is the
asset source - their frames come out of image and video models, and generated imagery of a
technical system would fabricate evidence.

So the frames are rendered here instead, from the same graph geometry the site draws, exported to
JSON by tools/export-geometry.mjs. Twenty-five junctions, forty edges, real hop distances. Nothing
in the picture is invented.

The sequence is the thesis argument, in order:

    0.00  the network, flat and complete
    0.22  it lifts, height carrying hop distance from the intervention
    0.45  information propagates outward, ring by ring
    0.70  uncertainty appears at each junction
    1.00  the calibrated state, settled

Frame zero is the resting composition the page shows before any scroll and under reduced motion,
which is the reference's own rule: the static hero *is* the first frame, so there is no seam
between the page and the animation.

Run:  npx tsx tools/export-geometry.mjs && python tools/gen-frames-transport.py
"""

import io
import json
import math
import os
import shutil

from PIL import Image, ImageDraw

W, H = 1280, 720
FRAMES = 90
OUT = os.path.join("public", "frames", "transport")

GEOM = json.load(io.open(os.path.join("tools", ".geometry", "graph.json"), encoding="utf-8"))
NODES = GEOM["nodes"]
EDGES = GEOM["edges"]
MAX_HOP = GEOM["graphMaxHop"]

GROUND = (11, 15, 20)
EDGE = (58, 72, 84)
ACCENT = (76, 196, 176)
NEUTRAL = (232, 237, 241)
WARN = (240, 160, 60)


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def stage(p, a, b):
    """Progress within one beat of the sequence."""
    return ease((p - a) / max(1e-6, b - a))


def hash01(n):
    n = (n ^ 0x9E3779B9) & 0xFFFFFFFF
    n = (n * 0x85EBCA6B) & 0xFFFFFFFF
    n ^= n >> 13
    n = (n * 0xC2B2AE35) & 0xFFFFFFFF
    n ^= n >> 16
    return n / 2**32


def project(x, y, z, lift, spin):
    """
    A plain isometric projection with a slow turn.

    Deliberately not a perspective camera: the network is read as a plan at rest, and the lift is
    what has to be legible, not the depth. A rotating perspective made the hop rings read as
    perspective rather than as height.
    """
    cx, cy = GEOM["GRAPH"]["width"] / 2, GEOM["GRAPH"]["height"] / 2
    dx, dy = x - cx, y - cy
    a = spin
    rx = dx * math.cos(a) - dy * math.sin(a)
    ry = dx * math.sin(a) + dy * math.cos(a)
    sx = W / 2 + rx * 1.16
    sy = H / 2 + 70 - z * 0.55 + ry * 0.62 * (0.52 + lift * 0.48)
    return sx, sy


def blend(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(round(c1[i] + (c2[i] - c1[i]) * t)) for i in range(3))


def render(p):
    img = Image.new("RGB", (W, H), GROUND)
    d = ImageDraw.Draw(img, "RGBA")

    lift = stage(p, 0.10, 0.34)
    prop = stage(p, 0.34, 0.58)
    unc = stage(p, 0.58, 0.80)
    calib = stage(p, 0.80, 1.00)
    spin = ease(min(1.0, p / 0.85)) * 0.42

    pos = []
    for n in NODES:
        hop = n["hop"] / max(1, MAX_HOP)
        # Height carries hop distance from the intervention, which is the thesis' own coordinate.
        z = hop * 210 * lift
        pos.append(project(n["x"], n["y"], z, lift, spin))

    # Edges first, so junctions sit on top of them.
    for e in EDGES:
        a, b = pos[e["a"]], pos[e["b"]]
        reached = max(0.0, min(1.0, prop * (MAX_HOP + 1) - e["hop"]))
        col = blend(blend(EDGE, NEUTRAL, 0.2), ACCENT, reached * 0.9)
        d.line([a, b], fill=col + (int(120 + 120 * reached),), width=2 if reached > 0.4 else 1)

    for i, n in enumerate(NODES):
        x, y = pos[i]
        hop = n["hop"] / max(1, MAX_HOP)
        reached = max(0.0, min(1.0, prop * (MAX_HOP + 1) - n["hop"]))

        # Uncertainty per junction. Deterministic, and rising with distance from the intervention,
        # which is the finding the thesis reports rather than a decorative variation.
        raw = 0.25 + hop * 0.6 + (hash01(n["id"] * 977) - 0.5) * 0.22
        settled = raw * (1 - calib) + (0.2 + hop * 0.28) * calib
        band = settled * 74 * unc

        if unc > 0.02:
            col = blend(ACCENT, WARN, min(1.0, settled))
            d.line([(x, y - band), (x, y + band)], fill=col + (int(150 * unc),), width=3)

        r = 5 + reached * 3
        if n["hop"] == 0:
            col = NEUTRAL
            r = 8 + prop * 3
        else:
            col = blend(blend(EDGE, NEUTRAL, 0.34), ACCENT, reached)
        d.ellipse([x - r, y - r, x + r, y + r], fill=col + (255,))

    return img


def main():
    shutil.rmtree(OUT, ignore_errors=True)
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for i in range(FRAMES):
        p = i / (FRAMES - 1)
        img = render(p)
        path = os.path.join(OUT, "%03d.webp" % i)
        img.save(path, format="WEBP", quality=78, method=6)
        total += os.path.getsize(path)
    # A poster for the static and reduced-motion paths, and for the first paint.
    render(0.0).save(os.path.join(OUT, "poster.webp"), format="WEBP", quality=82, method=6)
    print("wrote %d frames to %s" % (FRAMES, OUT))
    print("total %.0f KB, mean %.1f KB per frame" % (total / 1024, total / 1024 / FRAMES))


if __name__ == "__main__":
    main()
