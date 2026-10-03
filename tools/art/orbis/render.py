"""Orbis Terrarum — step 2: paint the world in the style of the empire map (assets/map.jpg).
Usage (from the scratch dir that holds orbis_geo.json, see README.md):
    python3 <repo>/tools/art/orbis/render.py <out.webp> [final_width=1600] [webp_quality]
Reads orbis_geo.json (proj.js, rendered at SS x final width), paints at that size, downsamples (area) to the final width.
Look: parchment land, an orange screen along the coast whose holes grow inland until it fades, bright blue sea with a
darker blue screen in the shallows, a bold hand-inked coastline, thin ink rivers, two calligraphic ocean names, black frame.
All sizes below are in FINAL pixels (x SS while painting). The map wraps east-west with no seam."""
import json, sys, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else 'orbis.webp'
FW = int(sys.argv[2]) if len(sys.argv) > 2 else 1600
Q = int(sys.argv[3]) if len(sys.argv) > 3 else 88
d = json.load(open('orbis_geo.json'))
W, H, PAD = d['W'], d['H'], d['pad']
SS = W / FW
WP = W + 2 * PAD                     # padded canvas (wrapped copies on both sides)
F = lambda v: v * SS                 # final px -> paint px
rng = np.random.default_rng(7)

# ---------- periodic (east-west) value noise ----------
X = (np.arange(WP) - PAD) % W        # canvas column -> map column (wraps)
def noise(cell, amp=1.0):
    """smooth noise with features ~cell final px, periodic in x with period W"""
    c = F(cell)
    gw = max(2, int(round(W / c))); gh = max(2, int(round(H / c)) + 2)
    g = rng.standard_normal((gh, gw)).astype(np.float32)
    g3 = np.concatenate([g, g, g], 1)                      # 3 periods, keep the middle one
    big = cv2.resize(g3, (3 * W, gh * int(round(W / gw))), interpolation=cv2.INTER_CUBIC)
    big = cv2.resize(big, (3 * W, H), interpolation=cv2.INTER_LINEAR)
    n = big[:, W:2 * W]
    return n[:, X] * amp

# ---------- masks ----------
def fill(polys, val, m, holes=True):
    for rings in polys:
        cv2.fillPoly(m, [np.array(rings[0], np.float32).round().astype(np.int32)], val)
    if holes:
        for rings in polys:
            for h in rings[1:]:
                cv2.fillPoly(m, [np.array(h, np.float32).round().astype(np.int32)], 255 - val)
m = np.zeros((H, WP), np.uint8)
fill(d['land'], 255, m)
fill(d['lakes'], 0, m, holes=False)

# hand-drawn coast: blur, then wobble the threshold with fine noise (jagged like his coast)
mf = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), F(0.9))
near = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), F(4.0))
near = np.clip(4 * near * (1 - near) * 3, 0, 1)        # 1 near a coast, 0 deep inland / far at sea (no stray lakes)
mf += (noise(9, 0.12) + noise(3.5, 0.08) + noise(1.3, 0.05)) * near
land = (mf > 0.5).astype(np.uint8)
# drop specks smaller than ~1.5 final px (noise crumbs), keep real small islands
n, lab, st, _ = cv2.connectedComponentsWithStats(land, 8)
small = st[:, cv2.CC_STAT_AREA] < F(1.6) ** 2
small[0] = False
land[small[lab]] = 0
n, lab, st, _ = cv2.connectedComponentsWithStats(1 - land, 8)
small = st[:, cv2.CC_STAT_AREA] < F(2.2) ** 2   # sea crumbs (cut-off gulf ends) would ink into blots
small[0] = False
land[small[lab]] = 1
L = land.astype(bool)
dl = cv2.distanceTransform(land, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)       # inside land, to the coast
ds = cv2.distanceTransform(1 - land, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)   # at sea, to the coast

# ---------- hex screen (exact nearest-point distance; pitch divides W so it wraps) ----------
yy, xx = np.mgrid[0:H, 0:WP].astype(np.float32)
xx = (xx - PAD) % W
def hexdist(pitch):
    P = W / round(W / F(pitch)); V = P * np.sqrt(3) / 2
    r0 = np.floor(yy / V)
    best = np.full((H, WP), 1e9, np.float32)
    for dr in (-1, 0, 1, 2):
        r = r0 + dr
        off = (r % 2) * P / 2
        px = np.round((xx - off) / P) * P + off
        dx = np.minimum(np.abs(xx - px), W - np.abs(xx - px))
        dy = yy - r * V
        best = np.minimum(best, np.sqrt(dx * dx + dy * dy))
    return best, P
gd, P = hexdist(5.6)

def col(*c): return np.array(c, np.float32)
TAN, TAN2 = col(198, 173, 137), col(186, 160, 122)
ORANGE, CREAM = col(216, 132, 96), col(238, 202, 168)
SEA, DEEP, FOAM = col(84, 164, 219), col(50, 120, 172), col(132, 192, 232)
INK = col(13, 10, 9)
img = np.empty((H, WP, 3), np.float32)

def mix(mask_alpha, colour):
    a = mask_alpha[..., None]
    img[:] = img * (1 - a) + colour * a

# ---------- sea ----------
img[:] = SEA
tS = 1 + noise(70, 0.018) + noise(18, 0.012) + noise(0.8, 0.010)
img *= tS[..., None]
# shallows: dark blue screen whose holes grow out to sea; edge wobbles
BS = F(17.0)
dS = ds + noise(6, F(2.2)) + noise(2, F(0.8))
t = np.clip(dS / BS, 0, 1)
rh = (0.05 + 0.58 * np.clip((t - 0.18) / 0.82, 0, 1) ** 0.8) * P   # hole radius; > P/sqrt(3) (0.577P) = gone
a = np.clip(gd - rh + 0.5, 0, 1) * (~L)
a *= np.clip((BS * 1.05 - dS) / F(1.0), 0, 1)
mix(a, DEEP)
# a few lighter flecks in the darkest part (his shallows are never flat)
fleck = np.clip(F(0.55) - hexdist(2.3)[0] + 0.5, 0, 1) * (~L) * (dS < BS * 0.35) * (noise(1.2, 1) > 0.6)
mix(fleck * 0.55, FOAM)

# ---------- land ----------
tL = 1 + noise(55, 0.022) + noise(16, 0.018) + noise(4, 0.012) + noise(0.7, 0.024)
landcol = TAN * tL[..., None]
stain = np.clip(noise(30, 1.0) - 0.9, 0, 1)[..., None]           # a few darker parchment stains
landcol = landcol * (1 - 0.35 * stain) + TAN2 * 0.35 * stain
img[L] = landcol[L]
# orange coastal screen: solid at the coast, holes (parchment showing through) grow inland
BL = F(22.0)
dL = dl + noise(7, F(2.6)) + noise(2.2, F(1.0))
t = np.clip(dL / BL, 0, 1)
rh = (0.03 + 0.60 * np.clip((t - 0.30) / 0.70, 0, 1) ** 0.85) * P
a = np.clip(gd - rh + 0.5, 0, 1) * L
a *= np.clip((BL * 1.05 - dL) / F(1.0), 0, 1)
oc = ORANGE * (1 + noise(20, 0.03) + noise(0.8, 0.02))[..., None]
a3 = a[..., None]
img[:] = img * (1 - a3) + oc * a3
# cream speckle inside the solid orange near the shore
cr = np.clip(F(0.42) - hexdist(1.9)[0] + 0.5, 0, 1) * L * (dL < BL * 0.45) * (noise(1.0, 1) > 0.25)
mix(cr * 0.75 * a, CREAM)

# ---------- rivers (thin ink, wobbling, on land only, fading out near the source) ----------
riv = np.zeros((H, WP), np.uint8)
for line in d['rivers']:
    pts = np.array(line, np.float32)
    # subdivide and wobble
    seg = []
    for i in range(len(pts) - 1):
        p0, p1 = pts[i], pts[i + 1]
        nseg = max(1, int(np.hypot(*(p1 - p0)) / F(2.0)))
        for k in range(nseg):
            seg.append(p0 + (p1 - p0) * k / nseg)
    seg.append(pts[-1]); seg = np.array(seg)
    nrm = np.gradient(seg, axis=0)[:, ::-1] * np.array([1, -1]); nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-6
    wob = np.cumsum(rng.standard_normal(len(seg))) * 0.05; wob -= np.convolve(wob, np.ones(9) / 9, 'same')
    seg = seg + nrm * (wob[:, None] * F(1.2) + rng.standard_normal((len(seg), 1)) * F(0.25))
    for i in range(len(seg) - 1):
        f = i / max(1, len(seg) - 1)
        w = F(0.55 + 0.55 * min(f, 1 - f) * 2)
        cv2.line(riv, tuple(np.round(seg[i] * 4).astype(int)), tuple(np.round(seg[i + 1] * 4).astype(int)),
                 255, max(1, int(round(w))), cv2.LINE_AA, shift=2)
ra = riv.astype(np.float32) / 255 * L * np.clip((dl - F(0.5)) / F(1.0), 0, 1)
mix(ra * 0.85, INK)

# ---------- ink coastline (bold, uneven, a pen pressing harder in places) ----------
wInk = F(1.75) + noise(10, F(0.45)) + noise(3, F(0.25))
# small islands keep parchment inside the ink: the pen is at most ~half as wide as the island is thick
n, lab = cv2.connectedComponents(land, connectivity=8)
thick = np.zeros(n, np.float32); np.maximum.at(thick, lab.ravel(), dl.ravel())
wInk = np.minimum(wInk, np.maximum(F(0.7), 0.5 * thick[lab]))
a = np.clip(wInk - dl + 0.5, 0, 1) * L
mix(a, INK)

# ---------- crop the wrap padding ----------
out = img[:, PAD:PAD + W]

# ---------- calligraphic ocean names (subtle ink, like his "Mediter…") ----------
def label(text, lon, lat, size, ang=0.0, alpha=0.55):
    fnt = None
    for f in ('/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf',
              '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'):
        try: fnt = ImageFont.truetype(f, int(F(size))); break
        except OSError: pass
    if fnt is None: return
    bb = fnt.getbbox(text); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pad = int(F(size))
    lay = Image.new('L', (tw + 2 * pad, th + 2 * pad), 0)
    dr = ImageDraw.Draw(lay)
    dr.text((pad - bb[0], pad - bb[1]), text, font=fnt, fill=255)
    # a swash under the name: a thin pen stroke, curling at both ends
    sx = np.linspace(0, 1, 200)
    yb = pad + th + F(size) * 0.18
    xs = pad - F(size) * 0.2 + sx * (tw + F(size) * 0.4)
    ys = yb + np.sin(sx * np.pi) * F(size) * 0.10 - np.sin(sx * np.pi * 2) * F(size) * 0.05
    curlL = [(pad - F(size) * 0.2 + F(size) * 0.22 * np.cos(t) - F(size) * 0.22, yb - F(size) * 0.22 * np.sin(t)) for t in np.linspace(0, 1.6 * np.pi, 40)]
    curlR = [(xs[-1] + F(size) * 0.22 - F(size) * 0.22 * np.cos(t), yb - F(size) * 0.22 * np.sin(t)) for t in np.linspace(0, 1.6 * np.pi, 40)]
    pts = curlL[::-1] + list(zip(xs, ys)) + curlR
    dr.line([(float(x), float(y)) for x, y in pts], fill=200, width=max(1, int(F(0.9))), joint='curve')
    lay = lay.rotate(ang, resample=Image.BICUBIC, expand=True)
    A = np.asarray(lay, np.float32) / 255 * alpha
    cx = (lon + 180) / 360 * W; cy = (d['LAT0'] - lat) / (d['LAT0'] - d['LAT1']) * H
    x0 = int(cx - A.shape[1] / 2); y0 = int(cy - A.shape[0] / 2)
    ya, yb2 = max(0, y0), min(H, y0 + A.shape[0]); xa, xb = max(0, x0), min(W, x0 + A.shape[1])
    sub = A[ya - y0:yb2 - y0, xa - x0:xb - x0][..., None]
    out[ya:yb2, xa:xb] = out[ya:yb2, xa:xb] * (1 - sub) + INK * 0.85 * sub
label('Oceanus', -38, 24, 21, 4)
label('Mare Indicum', 78, -24, 18, -3)

# ---------- frame ----------
fr = int(round(F(3)))
out[:fr, :] = INK; out[-fr:, :] = INK; out[:, :fr] = INK; out[:, -fr:] = INK

o8 = np.clip(out, 0, 255).astype(np.uint8)[..., ::-1]
fh = int(round(H / SS))
small = cv2.resize(o8, (FW, fh), interpolation=cv2.INTER_AREA)
cv2.imwrite(OUT, small, [cv2.IMWRITE_WEBP_QUALITY, Q])
cv2.imwrite('orbis_check.png', small)               # lossless copy in the scratch dir, to look at
print(OUT, small.shape)
