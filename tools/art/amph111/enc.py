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
for L in ('stone', 'bench', 'cloth', 'fixed', 'fire', 'glow', 'front'):
    f = os.path.join(src, L + '.png')
    if not os.path.exists(f):
        continue
    im = Image.open(f)
    im = im.convert('RGB') if L == 'glow' else im.convert('RGBA')
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
out['total'] = sum(out['files'].values())
json.dump(out, open(os.path.join(dst, 'amph111.json'), 'w'), indent=1)
print('total', out['total'])
