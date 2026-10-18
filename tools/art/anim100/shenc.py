#!/usr/bin/env python3
"""tools/art/anim100/shenc.py — v1.06a: encode the GROUND-SHADOW sheets (make.js l106, tools/art/anim100b/make.js l106) as black + LOSSY alpha
WebP (Chrome's canvas encoder keeps alpha lossless: ~2.5x bigger; the shadows are blurred anyway).
  python3 tools/art/anim100/shenc.py [alpha_quality=55]
Reads tools/art/anim100/out/l106/<name>.png (and tools/art/anim100b/out/l106/<name>.png), writes
  assets/anim106_<name>_sh.webp   the desktop set (the bake's half resolution)
  assets/anim106p_<name>_sh.webp  the phone set: the same sheet at half size (every row / cell is even-sized, so 399 halves the meta)."""
import glob, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
aq = int(sys.argv[1]) if len(sys.argv) > 1 else 55
tot = {'d': 0, 'p': 0}; n = 0
for f in sorted(glob.glob(os.path.join(HERE, 'out/l106/*.png')) + glob.glob(os.path.join(ROOT, 'tools/art/anim100b/out/l106/*.png'))):
    name = os.path.basename(f)[:-4]
    a = Image.open(f).convert('RGBA').getchannel('A')
    for k, pre, im in (('d', 'anim106_', a), ('p', 'anim106p_', a.resize((max(1, a.width // 2), max(1, a.height // 2)), Image.LANCZOS))):
        rgba = Image.merge('RGBA', [Image.new('L', im.size, 0)] * 3 + [im])
        out = os.path.join(ROOT, 'assets', pre + name + '_sh.webp')
        rgba.save(out, 'WEBP', quality=80, alpha_quality=aq, method=6)
        tot[k] += os.path.getsize(out)
    n += 1
print('shadow sheets: %d, desktop %d KB, phone %d KB (alpha q%d)' % (n, tot['d'] // 1024, tot['p'] // 1024, aq))
