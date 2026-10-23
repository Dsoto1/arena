"""tools/art/amph111/enc.py — encode the bake's layers for the game (make.js --assets runs it).
  python3 -I enc.py <out dir with <layer>.png + meta.json> <assets dir>
Writes <assets>/amph111_<layer>.webp (libwebp method 6; alpha stays LOSSLESS so the coverage layers still add up exactly) and
<assets>/amph111.json (the frame: tw0, xl, yt, w, h + each file's bytes). Quality per layer: env AMPH_Q="stone=78,bench=80,..."."""
import json, os, sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
Q = {'stone': 78, 'bench': 80, 'cloth': 82, 'fixed': 80, 'fire': 85, 'glow': 72, 'front': 90}
for kv in filter(None, os.environ.get('AMPH_Q', '').split(',')):
    k, v = kv.split('='); Q[k] = int(v)
meta = json.load(open(os.path.join(src, 'meta.json')))
out = {k: meta[k] for k in ('tw0', 'xl', 'xr', 'yt', 'yb', 'w', 'h')}
out['files'] = {}
EDGE = float(os.environ.get('AMPH_EDGE', '0.7'))   # pass 10 (3a): the side band, in TW, that settles into a per-row profile (0 = off)


def edge_band(im, tw0):
    # pass 10 (his 3a): the outermost EDGE·TW columns on the left and right blend (premultiplied, so the layers still add up exactly)
    # into one colour per row — the outer columns' mean, blurred up/down — so 419 can stretch the frame's edge column out to the canvas
    # edge (zoomed or very wide windows) with no streaks: the tower + ground haze simply go on, no sky beside them.
    import numpy as np
    B = int(round(EDGE * tw0))
    if B < 2:
        return im
    a = np.asarray(im).astype('float32') / 255.0
    pm = a.copy(); pm[..., :3] *= pm[..., 3:4]
    H, W = pm.shape[:2]
    sig = 0.5 * tw0; k = np.exp(-0.5 * (np.arange(-3 * int(sig), 3 * int(sig) + 1) / sig) ** 2); k /= k.sum()
    def blur(col):   # col H×4, vertical gaussian, edges clamped
        pad = len(k) // 2; c = np.pad(col, ((pad, pad), (0, 0)), mode='edge')
        return np.stack([np.convolve(c[:, i], k, mode='valid') for i in range(4)], 1)
    for side in (0, 1):
        cols = pm[:, :12] if side == 0 else pm[:, W - 12:]
        prof = blur(cols.mean(1))
        for j in range(B):   # j = 0 at the outermost column
            x = j if side == 0 else W - 1 - j
            t = 1.0 - j / B; t = t * t * (3 - 2 * t)
            pm[:, x] = pm[:, x] * (1 - t) + prof * t
    out = pm.copy(); al = np.maximum(out[..., 3:4], 1e-6); out[..., :3] = np.where(out[..., 3:4] > 1e-6, out[..., :3] / al, 0)
    return Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype('uint8'), 'RGBA')


for L in ('stone', 'bench', 'cloth', 'fixed', 'fire', 'glow', 'front'):
    f = os.path.join(src, L + '.png')
    if not os.path.exists(f):
        continue
    im = Image.open(f)
    im = im.convert('RGB') if L == 'glow' else im.convert('RGBA')
    if L in ('stone', 'bench', 'cloth', 'fixed', 'fire') and EDGE > 0:
        im = edge_band(im, meta['tw0'])
    if L == 'front':
        # pass 7: only its alpha matters (the coverage of the stair's pillars + braziers, painted again over the game's stands corner)
        # cropped to its box (written to amph111.json as 'front': [x, y, w, h], copied into 419's meta)
        a = im.split()[3]
        bb = a.point(lambda v: 255 if v > 2 else 0).getbbox()
        x0, y0, x1, y1 = bb[0] - 2, bb[1] - 2, bb[2] + 2, bb[3] + 2
        out['front'] = [x0, y0, x1 - x0, y1 - y0]
        a = a.crop((x0, y0, x1, y1))
        im = Image.merge('RGBA', (a, a, a, a))
    if L in ('stone', 'bench', 'cloth'):
        # the tint layers become neutral luminance: the arena's own colour (multiplied in the game) carries the hue, so a cool white
        # stone (Syracusae) stays cool and the warm Roma travertine stays warm; the sun's warmth is in the fixed layer and the cap colours
        r, g, b, a = im.split()
        lum = Image.merge('RGB', (r, g, b)).convert('L')
        im = Image.merge('RGBA', (lum, lum, lum, a))
    p = os.path.join(dst, 'amph111_' + L + '.webp')
    im.save(p, 'WEBP', quality=Q[L], method=6)
    out['files'][L] = os.path.getsize(p)
    print(L, im.size, os.path.getsize(p))
out['edge'] = EDGE
out['total'] = sum(out['files'].values())
json.dump(out, open(os.path.join(dst, 'amph111.json'), 'w'), indent=1)
print('total', out['total'])
