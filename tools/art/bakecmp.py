#!/usr/bin/env python3
"""tools/art/bakecmp.py — v1.08c: pixel compare of re-baked sheets with the committed ones (tools/art/bakecheck.js calls it).
  python3 tools/art/bakecmp.py <new.webp> <committed.webp> [more pairs...]      → one JSON line per pair
Decodes both to RGBA. Same size → per-channel absolute difference over the pixels where either image has alpha > 0 (a fully transparent pixel's
RGB is noise): max, mean, p99.9, share of pixels over 16, the alpha-only max. Different size → {"size": [[w,h],[w,h]]} (a crop/anchor change)."""
import json, sys
import numpy as np
from PIL import Image

def load(p):
    return np.asarray(Image.open(p).convert('RGBA'), dtype=np.int16)

out = []
a = sys.argv[1:]
for i in range(0, len(a) - 1, 2):
    n, c = a[i], a[i + 1]
    try:
        A, B = load(n), load(c)
    except Exception as e:  # missing file
        out.append({'new': n, 'committed': c, 'error': str(e)[:160]}); continue
    if A.shape != B.shape:
        out.append({'new': n, 'committed': c, 'size': [[A.shape[1], A.shape[0]], [B.shape[1], B.shape[0]]]}); continue
    d = np.abs(A - B)
    live = (A[..., 3] > 0) | (B[..., 3] > 0)
    dl = d[live][:, :3] if live.any() else np.zeros((1, 3), dtype=np.int16)
    per = dl.max(axis=1)
    out.append({'new': n, 'committed': c, 'size': [A.shape[1], A.shape[0]], 'livePx': int(live.sum()),
                'max': int(per.max()), 'mean': round(float(per.mean()), 4), 'p999': int(np.percentile(per, 99.9)),
                'over16': round(float((per > 16).mean()), 5), 'alphaMax': int(d[..., 3].max())})
for o in out:
    print(json.dumps(o))
