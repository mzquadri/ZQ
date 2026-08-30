"""
Generate the synthetic chest radiograph used by the medico world.

Nothing here is a patient image. There is no scan, no corpus sample and no downscaled film: the
field is computed from a handful of anatomical primitives - a thoracic silhouette, two lung
fields, a mediastinal column, rib arcs, clavicles, scapular edges and a diaphragm - and it is
deterministic, so the same image appears on every machine and in every screenshot.

It is also deliberately free of pathology. There is no opacity, nodule, effusion or consolidation
anywhere in it, because the project makes no diagnostic claim and an invented finding on a
portfolio page would be exactly the wrong kind of realism.

Emits src/content/medico-radiograph.ts:
  - a 96x96 array of 0-255 bytes, base64-encoded, for the world's instanced cells
  - a PNG data URI at 256x256 for the static figure

Run:  python tools/gen-medico-radiograph.py
"""

import base64
import io
import math

CELLS = 96          # what the 3D scene reads
IMAGE = 256         # what the static figure shows


def hash01(n: int) -> float:
    n = (n ^ 0x9E3779B9) & 0xFFFFFFFF
    n = (n * 0x85EBCA6B) & 0xFFFFFFFF
    n ^= n >> 13
    n = (n * 0xC2B2AE35) & 0xFFFFFFFF
    n ^= n >> 16
    return n / 2**32


def smooth(row: float, col: float, scale: float) -> float:
    r, c = row / scale, col / scale
    r0, c0 = int(math.floor(r)), int(math.floor(c))
    fr, fc = r - r0, c - c0
    e = lambda t: t * t * (3 - 2 * t)
    a = hash01(r0 * 3163 + c0 * 71)
    b = hash01(r0 * 3163 + (c0 + 1) * 71)
    d = hash01((r0 + 1) * 3163 + c0 * 71)
    f = hash01((r0 + 1) * 3163 + (c0 + 1) * 71)
    top = a + (b - a) * e(fc)
    bot = d + (f - d) * e(fc)
    return top + (bot - top) * e(fr)


def value(x: float, y: float, row: float, col: float, scale: float) -> float:
    """
    x, y in [-1, 1]; y positive is up. Returns 0-1 attenuation, where bright means dense.

    A chest film is predominantly dark: air is black, soft tissue mid, bone and mediastinum
    bright. The floor is therefore low and every bright structure is added, rather than starting
    from a bright slab and cutting holes for the lungs - which is what an earlier pass did, and it
    read as a mask rather than a chest.
    """
    # Thoracic silhouette: sloping shoulders, a slight waist, then the abdomen.
    shoulder = math.exp(-((y - 0.66) ** 2) / 0.035) * 0.06
    half = 0.76 - max(0.0, y) * 0.22 - max(0.0, -y - 0.30) * 0.22 + shoulder
    edge = 1 - min(1.0, max(0.0, (abs(x) - half + 0.08) / 0.08))
    vert = min(1.0, max(0.0, (y + 0.96) / 0.07)) * min(1.0, max(0.0, (0.92 - y) / 0.10))
    body = edge * vert
    if body <= 0.001:
        return 0.010 + (hash01(int(row) * 131 + int(col) * 17) - 0.5) * 0.012

    # The diaphragm dome. Everything below it is abdomen, and abdomen is dense and bright;
    # everything above it and lateral to the mediastinum is aerated lung, and lung is dark.
    dome = -0.34 - 0.26 * (1 - min(1.0, (abs(x) / 0.72) ** 2))
    below = min(1.0, max(0.0, (dome - y) / 0.10))

    lung_shape = (
        math.exp(-((abs(x) - 0.40) ** 2) / 0.070)
        * math.exp(-((y - 0.14) ** 2) / 0.30)
        * (1 - below)
    )

    # Base: dark lung, mid soft tissue, bright abdomen.
    v = 0.28 - lung_shape * 0.245 + below * 0.20

    # Mediastinum and spine, widening slightly toward the diaphragm.
    spine = math.exp(-(x * x) / (0.026 + max(0.0, -y) * 0.03)) * 0.34
    v += spine
    v += math.exp(-(x * x) / 0.045) * abs(math.sin(y * 22)) * 0.028

    # Heart: a defined border bulging into the left lung field.
    heart = math.exp(-((x + 0.20) ** 2) / 0.048) * math.exp(-((y + 0.20) ** 2) / 0.055)
    v += heart * 0.20

    # The diaphragm line itself, brightest where it meets the chest wall.
    v += math.exp(-((y - dome) ** 2) / 0.0045) * 0.20

    # Rib arcs. `y + k*x^2` is constant along a downward-opening parabola, so bands in that
    # coordinate curve away from the spine the way ribs do. Two families at different curvature,
    # because a single one reads as corduroy. They brighten where they cross the dark lung, which
    # is where ribs are actually conspicuous on a film.
    # Ribs fade out at the midline. Over the spine they are obscured by the mediastinum on a real
    # film, and drawing them across it welded the two lung fields into one band of corduroy - the
    # single thing that stopped this reading as a chest.
    cage = (
        math.exp(-((y - 0.10) ** 2) / 0.34)
        * min(1.0, max(0.0, (0.86 - abs(x)) / 0.28))
        * min(1.0, max(0.0, (abs(x) - 0.12) / 0.16))
        * (1 - below * 0.85)
    )
    post = abs(math.sin((y + 0.42 * x * x) * 13.0)) ** 7.0
    ant = abs(math.sin((y - 0.30 * x * x) * 10.0 + 1.1)) ** 8.0
    v += post * 0.175 * cage
    v += ant * 0.075 * cage

    # Clavicles across the apices, and scapular edges outboard of the lungs.
    v += math.exp(-((y - 0.58 + abs(x) * 0.22) ** 2) / 0.0035) *          math.exp(-((abs(x) - 0.30) ** 2) / 0.075) * 0.16
    v += math.exp(-((abs(x) - 0.60) ** 2) / 0.005) *          math.exp(-((y - 0.26) ** 2) / 0.06) * 0.06

    # Correlated grain, so it reads as tissue and not as dither.
    v += (smooth(row, col, 3.4 * scale) - 0.5) * 0.04
    v += (hash01(int(row) * 131 + int(col) * 17) - 0.5) * 0.012

    return max(0.0, min(1.0, v)) * body


def field(n: int):
    out = []
    for row in range(n):
        for col in range(n):
            x = (col / (n - 1)) * 2 - 1
            y = 1 - (row / (n - 1)) * 2
            out.append(value(x, y, row, col, n / 96.0))
    return out


cells = field(CELLS)
pixels = field(IMAGE)

print("cell field  %d x %d   min %.3f  mean %.3f  max %.3f"
      % (CELLS, CELLS, min(cells), sum(cells) / len(cells), max(cells)))

# ---- PNG for the static figure -------------------------------------------------------------
from PIL import Image  # noqa: E402

img = Image.new("L", (IMAGE, IMAGE))
img.putdata([int(round(min(1.0, v ** 0.85) * 255)) for v in pixels])
buf = io.BytesIO()
img.save(buf, format="PNG", optimize=True)
png = buf.getvalue()
uri = "data:image/png;base64," + base64.b64encode(png).decode("ascii")
img.save("tools/.medico-preview.png")
print("png %d bytes, data uri %d chars" % (len(png), len(uri)))

# ---- The module ------------------------------------------------------------------------------
packed = base64.b64encode(bytes(int(round(v * 255)) for v in cells)).decode("ascii")

L = []
w = L.append
w("/*")
w(" * GENERATED by tools/gen-medico-radiograph.py - do not edit by hand.")
w(" *")
w(" * A synthetic chest radiograph. No patient data, no corpus sample, no downscaled scan: the")
w(" * field is computed from anatomical primitives and is deterministic. It contains no pathology")
w(" * of any kind, because this project makes no diagnostic claim and an invented finding would be")
w(" * exactly the wrong kind of realism.")
w(" */")
w("")
w("export const RADIOGRAPH_CELLS = " + str(CELLS) + " as const;")
w("")
w("/** " + str(CELLS) + "x" + str(CELLS) + " attenuation bytes, base64. Decoded once on first use. */")
w('const PACKED = "' + packed + '";')
w("")
w("let decoded: Float32Array | null = null;")
w("")
w("/** 0-1 attenuation per cell, row-major from the top-left. */")
w("export function radiographField(): Float32Array {")
w("  if (decoded) return decoded;")
w("  const bin = atob(PACKED);")
w("  const out = new Float32Array(bin.length);")
w("  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i) / 255;")
w("  decoded = out;")
w("  return out;")
w("}")
w("")
# The 256-square PNG data URI is no longer emitted: nothing imported it, and it was 36 KB
# of the generated module. The preview file below is still written for eyeballing the field.
w("")

NL = chr(10)
io.open("src/content/medico-radiograph.ts", "w", encoding="utf-8", newline=NL).write(NL.join(L))
print("wrote src/content/medico-radiograph.ts")
