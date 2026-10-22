"""tools/art/arena110/prep.py — the v1.10a substructure mock-up textures (tools/plans/v110/ART.md). Sources: the Poly Haven 1k diffuse
JPGs named in SOURCES.md, downloaded to SP/assets-polyhaven/ (set SP). Run: python3 -I prep.py <outdir>.
Every step is wrap-aware (the image is tiled 3x3, filtered, the centre cropped) so the result stays seamless."""
import sys, os
from PIL import Image, ImageFilter, ImageOps, ImageChops
import numpy as np

SP = os.environ.get('SP', '/tmp/arena110-src')  # holds assets-polyhaven/<name>.jpg
PH = SP + '/assets-polyhaven/'
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


def wrap(im, fn):
    w, h = im.size
    big = Image.new(im.mode, (w * 3, h * 3))
    for i in range(3):
        for j in range(3):
            big.paste(im, (i * w, j * h))
    big = fn(big)
    return big.crop((w, h, 2 * w, 2 * h))


def tile(im, n):
    w, h = im.size
    big = Image.new(im.mode, (w * n, h * n))
    for i in range(n):
        for j in range(n):
            big.paste(im, (i * w, j * h))
    return big


def hexrgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def gmap(L, stops):
    """gradient map: luminance (0..1 array) -> RGB through palette stops [(pos, '#hex'), ...]"""
    xs = [s[0] for s in stops]
    out = np.zeros(L.shape + (3,), np.float32)
    for k in range(3):
        out[..., k] = np.interp(L, xs, [hexrgb(s[1])[k] for s in stops])
    return out


def posterise(L, levels, soft=0.35):
    q = np.round(L * (levels - 1)) / (levels - 1)
    return q * (1 - soft) + L * soft


def lum(im):
    return np.asarray(im.convert('L'), np.float32) / 255.0


def stretch(L, lo=2, hi=98):
    a, b = np.percentile(L, lo), np.percentile(L, hi)
    return np.clip((L - a) / max(1e-3, b - a), 0, 1)


def flatten(L, radius=40, keep=0.25):
    """take the big photo blotches (stains, light falloff) out: high-pass + a little of the low band back"""
    Lb = lum(wrap(Image.fromarray((L * 255).astype(np.uint8)), lambda b: b.filter(ImageFilter.GaussianBlur(radius))))
    return np.clip(L - Lb + Lb.mean() + (Lb - Lb.mean()) * keep, 0, 1)


def painted(im, size, median=5, smooth=1.0):
    """downscale + 'painted over': median (flattens photo noise into patches) + a light blur"""
    im = im.convert('RGB').resize((size, size), Image.LANCZOS)
    im = wrap(im, lambda b: b.filter(ImageFilter.MedianFilter(median)).filter(ImageFilter.GaussianBlur(smooth)))
    return im


def save(arr_or_im, name, q=82):
    im = arr_or_im if isinstance(arr_or_im, Image.Image) else Image.fromarray(np.clip(arr_or_im, 0, 255).astype(np.uint8))
    p = os.path.join(OUT, name)
    if name.endswith('.webp'):
        im.save(p, 'WEBP', quality=q, method=6)
    else:
        im.convert('RGB').save(p, 'JPEG', quality=q, optimize=True)
    print(name, im.size, im.mode, os.path.getsize(p))


TRAV = [(0, '#7d6a4c'), (.25, '#a8946e'), (.55, '#cdb994'), (.8, '#e2d3b2'), (1, '#f1e7cf')]
BRICK = [(0, '#3f1912'), (.3, '#7c2e22'), (.52, '#a54634'), (.7, '#c4684c'), (.86, '#dcb796'), (1, '#efe2c8')]
# stone_ashlar: travertine ashlar for the substructure / façade faces (192 wall scale: 170 texture px = 0.9 TW)
im = painted(tile(Image.open(PH + 'sandstone_blocks_08.jpg'), 2), 512, 5, 0.8)
L = posterise(stretch(flatten(lum(im), 30, 0.15), 1, 99), 6, 0.35)
save(gmap(L, TRAV), 'stone_ashlar.webp')
# vault_brick: Roman brick lining the vaults (drawn darkened)
im = painted(Image.open(PH + 'medieval_red_brick.jpg'), 512, 3, 0.6)
L = posterise(stretch(flatten(lum(im), 40, 0.3)), 7, 0.4)
save(gmap(L, BRICK), 'vault_brick.webp')
# ---------------- GROUND around the amphitheatre (v1.10a scope change: the substructure) ----------------
PAVE = [(0, '#5e5244'), (.3, '#8c7c64'), (.6, '#ab9a7c'), (.85, '#c4b494'), (1, '#d6c8a8')]
im = painted(Image.open(PH + 'stone_pavers.jpg'), 512, 5, 0.8)
L = posterise(stretch(flatten(lum(im), 40, 0.2)), 6, 0.35)
save(gmap(L, PAVE), 'ground_paving.webp')
SANDG = [(0, '#8a6c46'), (.35, '#b3956a'), (.65, '#c9ad80'), (1, '#dcc59a')]
im = painted(Image.open(PH + 'gravelly_sand.jpg'), 512, 3, 0.6)
L = posterise(stretch(flatten(lum(im), 40, 0.3)), 6, 0.4)
save(gmap(L, SANDG), 'ground_sand.webp')
