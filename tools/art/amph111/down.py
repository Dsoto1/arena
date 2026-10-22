"""tools/art/amph111/down.py — box-filter the 2x renders down (premultiplied: exact coverage alpha, no colour bleed).
python3 -I down.py <dir> <ss> <layer,layer,...>   reads <layer>_ss.png, writes <layer>.png"""
import sys, os
import numpy as np
from PIL import Image
d, ss, layers = sys.argv[1], int(sys.argv[2]), sys.argv[3].split(',')
for L in layers:
    f = os.path.join(d, L + '_ss.png')
    if not os.path.exists(f):
        continue
    a = np.asarray(Image.open(f).convert('RGBA')).astype(np.float32) / 255.0
    H, W = a.shape[0] // ss * ss, a.shape[1] // ss * ss
    a = a[:H, :W]
    al = a[..., 3:4]
    pm = np.concatenate([a[..., :3] * al, al], axis=2)
    pm = pm.reshape(H // ss, ss, W // ss, ss, 4).mean(axis=(1, 3))
    al = pm[..., 3:4]
    rgb = np.where(al > 1e-4, pm[..., :3] / np.maximum(al, 1e-4), 0)
    o = np.concatenate([rgb, al], axis=2)
    Image.fromarray((np.clip(o, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(os.path.join(d, L + '.png'))
    os.remove(f)
