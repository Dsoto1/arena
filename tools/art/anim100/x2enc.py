#!/usr/bin/env python3
"""tools/art/anim100/x2enc.py — v1.08b: ONE bake → both sheet sizes (make.js x2 runs it at the end).
  python3 tools/art/anim100/x2enc.py [q1=80] [q2=72] [sq1=60] [sq2=55]
Reads tools/art/anim100/out/x2/<name>.png + <name>.json (the 2× render at pxmm 5.2 and its meta, rows [y,w,h,ax,ay] in 2× px) and writes
  assets/anim100x2_<name>.webp   the 2× sheet, repacked so every cell is EXACTLY twice a 1× cell (even heights, rows at 2·y1, 2 px gaps)
  assets/anim100_<name>.webp     the 1× sheet = the 2× one box-filtered 2×2 (premultiplied alpha: no fringe, never across a cell or row edge)
  out/x2/<name>.meta1.json       the 1× meta (pxmm 2.6, y/w/h/ax/ay halved) — make.js writes it into ANIM100_META with x2:1
Quality: libwebp method 6 (Chrome's canvas encoder is ~15% bigger); whole sheets q1/q2, severed sets (name has a limb) sq1/sq2."""
import glob, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..')); A = os.environ.get('BAKE_ASSETS') or os.path.join(ROOT, 'assets')   # v1.08c: make.js --check redirects both
OUTD = os.environ.get('BAKE_OUT') or os.path.join(HERE, 'out')
arg = lambda i, d: int(sys.argv[i]) if len(sys.argv) > i else d
Q1, Q2, SQ1, SQ2 = arg(1, 80), arg(2, 72), arg(3, 60), arg(4, 55)
LIMBS = ('_rarm_', '_larm_', '_rleg_', '_lleg_')
tot = {'1': 0, '2': 0}; n = 0
names = [a for a in sys.argv[5:]] or None
for f in sorted(glob.glob(os.path.join(OUTD, 'x2/*.png'))):
    name = os.path.basename(f)[:-4]
    if names and name not in names: continue
    m = json.load(open(f[:-4] + '.json'))
    src = Image.open(f).convert('RGBA')
    rows = sorted(((r[0], nm, i, r) for nm, L in m['rows'].items() for i, r in enumerate(L)))
    y1 = 0; place = []; W2 = 0
    for (_, nm, i, r) in rows:
        y, w, h, ax, ay = r; w2 = w + (w & 1); h2 = h + (h & 1)
        place.append((nm, i, y, w, h, y1, w2 // 2, h2 // 2, ax / 2, ay / 2)); y1 += h2 // 2 + 1; W2 = max(W2, w2 * 8)
    H1 = y1   # W2 = 16·k: every 2x cell width is even
    big = Image.new('RGBA', (W2, H1 * 2), (0, 0, 0, 0)); meta = {'v': m['v'], 'pxmm': round(m['pxmm'] / 2, 4), 'set': m['set'], 'rows': {}}
    if 'limb' in m: meta['limb'] = m['limb']
    rr = {}
    for (nm, i, y, w, h, yy, w1, h1, ax1, ay1) in place:
        if w & 1: raise SystemExit('%s: odd 2x cell width %d (sheetSteps makes even ones)' % (name, w))
        big.paste(src.crop((0, y, w * 8, y + h)), (0, yy * 2))
        rr.setdefault(nm, {})[i] = [yy, w1, h1, round(ax1, 2), round(ay1, 2)]
    for nm in m['rows']: meta['rows'][nm] = [rr[nm][i] for i in range(len(m['rows'][nm]))]
    a = np.asarray(big, dtype=np.float32) / 255.0; al = a[..., 3:4]; pm = np.concatenate([a[..., :3] * al, al], axis=2)
    h, w = pm.shape[0] // 2, pm.shape[1] // 2; s = pm.reshape(h, 2, w, 2, 4).mean(axis=(1, 3))
    alpha = s[..., 3:4]; rgb = np.where(alpha > 1e-6, s[..., :3] / np.maximum(alpha, 1e-6), 0)
    small = Image.fromarray(np.clip(np.concatenate([rgb, alpha], axis=2) * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA')
    sev = any(l in '_' + name + '_' for l in LIMBS)
    p2 = os.path.join(A, 'anim100x2_' + name + '.webp'); p1 = os.path.join(A, 'anim100_' + name + '.webp')
    big.save(p2, 'WEBP', quality=SQ2 if sev else Q2, method=6); small.save(p1, 'WEBP', quality=SQ1 if sev else Q1, method=6)
    json.dump(meta, open(f[:-4] + '.meta1.json', 'w'))
    tot['1'] += os.path.getsize(p1); tot['2'] += os.path.getsize(p2); n += 1
    print('%-24s 1x %4dx%-5d %7.1f KB   2x %4dx%-5d %7.1f KB' % (name, small.width, small.height, os.path.getsize(p1) / 1024, big.width, big.height, os.path.getsize(p2) / 1024))
print('x2enc: %d sheets, 1x %d KB, 2x %d KB (q %d/%d, severed %d/%d)' % (n, tot['1'] // 1024, tot['2'] // 1024, Q1, Q2, SQ1, SQ2))
