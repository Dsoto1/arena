#!/usr/bin/env python3
"""tools/art/anim100/sevenc.py — re-encode the SEVERED sheets (v1.0 311) from make.js's lossless previews with libwebp's slowest,
best method (Chrome's canvas encoder uses a fast one: ~15% bigger at the same quality).
  python3 tools/art/anim100/sevenc.py [quality=65]
Reads tools/art/anim100/out/sev/<cls>_<limb>_<set>.png, writes assets/anim100_<cls>_<limb>_<set>.webp (same pixels → the meta in
src/board/311-v100anim.js stays valid). make.js sev runs it at the end."""
import glob, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
q = int(sys.argv[1]) if len(sys.argv) > 1 else 65
tot = 0
OUTD = os.environ.get('BAKE_OUT') or os.path.join(HERE, 'out'); AD = os.environ.get('BAKE_ASSETS') or os.path.join(ROOT, 'assets')   # v1.08c: --check redirects
for f in sorted(glob.glob(os.path.join(OUTD, 'sev/*.png'))):
    name = os.path.basename(f)[:-4]
    out = os.path.join(AD, 'anim100_' + name + '.webp')
    Image.open(f).convert('RGBA').save(out, 'WEBP', quality=q, method=6)
    tot += os.path.getsize(out)
print('severed sheets re-encoded at q%d: %d KB' % (q, tot // 1024))
