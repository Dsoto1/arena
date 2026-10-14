#!/usr/bin/env python3
"""tools/art/anim100/sevshots.py — shots of the SEVERED sets: for every class × limb the idle cell (facing the camera) and a walk
cell (three-quarter), ×2, into tools/plans/anim100/severed/<cls>_<limb>.png + all.png (a contact sheet). Reads the shipped
assets/anim100_<cls>_<limb>_move.webp and the ANIM100_META block of src/board/311-v100anim.js."""
import json, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
OUT = os.path.join(ROOT, 'tools/plans/anim100/severed'); os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(ROOT, 'src/board/311-v100anim.js')).read()
a = src.index('const ANIM100_META='); b = src.index('/* ANIM100_META:END */')
M = json.loads(src[a + len('const ANIM100_META='):b].strip().rstrip(';'))
CLS = ['soldier', 'hero', 'slave', 'royalty', 'amazonia', 'veteranus', 'venatore', 'damnatio']; LIMBS = ['rarm', 'larm', 'rleg', 'lleg']
K = 2; tiles = []
for c in CLS:
    for l in LIMBS:
        m = M[c]['sev'][l]['move']['rows']; im = Image.open(os.path.join(ROOT, 'assets', 'anim100_%s_%s_move.webp' % (c, l))).convert('RGBA')
        cells = []
        for row, i, face in (('idle', 0, 0), ('walk', 1, 1), ('walk', 2, 6)):
            y, w, h, ax, ay = m[row][i]; cells.append(im.crop((face * w, y, face * w + w, y + h)))
        W = sum(x.width for x in cells) * K + 20; H = max(x.height for x in cells) * K + 30
        t = Image.new('RGBA', (W, H), (232, 220, 196, 255)); x0 = 10
        for x in cells:
            t.alpha_composite(x.resize((x.width * K, x.height * K), Image.NEAREST), (x0, 25)); x0 += x.width * K
        ImageDraw.Draw(t).text((10, 6), '%s · %s lost  (idle · walk · walk)' % (c, l), fill=(40, 25, 10, 255))
        t.convert('RGB').quantize(128).save(os.path.join(OUT, '%s_%s.png' % (c, l)), optimize=True); tiles.append(t)
cw = max(t.width for t in tiles); ch = max(t.height for t in tiles)
sheet = Image.new('RGBA', (cw * 4, ch * 8), (232, 220, 196, 255))
for i, t in enumerate(tiles): sheet.alpha_composite(t, ((i % 4) * cw, (i // 4) * ch))
sheet = sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS); sheet.save(os.path.join(OUT, 'all.png'))
print('shots:', len(tiles), '→', OUT)
