"""look100/anim_webp.py — LOOK TEST: frame_clip_*.png (in a scratch dir) -> one looping animated WebP.
   python3 anim_webp.py <scratch dir> <out.webp> <ms per frame>"""
import sys, glob, os
from PIL import Image
d, out, ms = sys.argv[1], sys.argv[2], int(sys.argv[3])
pre = sys.argv[4] if len(sys.argv) > 4 else 'frame_clip_'
fs = sorted(glob.glob(os.path.join(d, pre + '*.png')))
ims = [Image.open(f).convert('RGB') for f in fs]
durs = [ms] * len(ims)
ims[0].save(out, save_all=True, append_images=ims[1:], duration=durs, loop=0, quality=80, method=6)
print('clip', len(ims), 'frames ->', out, os.path.getsize(out) // 1024, 'KB')
