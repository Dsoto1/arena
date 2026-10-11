"""look100/beast3_split.py — LOOK TEST round 3 (his 1a): split a beast sheet into IDLE+WALK and ACTIONS when the action frames widen its cells.
   python3 -I beast3_split.py <sheet.png> '<meta json [w,h,AX,AY,n]>' '<rows json>' <out prefix (…/beast3_leo)> [--force]
   Each part is re-cropped round the same base anchor (minis8 format: rows = frames, 8 MINI_YAW cells). The split is kept when it cuts the
   idle+walk decoded memory by ≥15% (or --force); otherwise one sheet <prefix>_sheet.webp. Prints one JSON line with the numbers."""
import sys, json, math, os
from PIL import Image
png, meta, rows, pre = sys.argv[1], json.loads(sys.argv[2]), json.loads(sys.argv[3]), sys.argv[4]
force = '--force' in sys.argv
im = Image.open(png).convert('RGBA'); w, h, AX, AY = meta[0], meta[1], meta[2], meta[3]
A = im.getchannel('A')
def cell(r, c): return im.crop((c * w, r * h, c * w + w, r * h + h))
def box(r, c):
    b = A.crop((c * w, r * h, c * w + w, r * h + h)).point(lambda v: 255 if v > 8 else 0).getbbox()
    return b
def part(idx):
    L = R = T = Bm = 0
    for r in idx:
        for c in range(8):
            b = box(r, c)
            if not b: continue
            L = max(L, AX - b[0]); R = max(R, b[2] - AX); T = max(T, AY - b[1]); Bm = max(Bm, b[3] - AY)
    half = math.ceil(max(L, R)) + 1; top = math.ceil(T) + 1; W = half * 2; H = top + math.ceil(Bm) + 1
    out = Image.new('RGBA', (W * 8, H * len(idx)), (0, 0, 0, 0))
    ox, oy = round(AX - half), round(AY - top)
    for j, r in enumerate(idx):
        for c in range(8):
            src = cell(r, c); dst = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dst.paste(src, (-ox, -oy)); out.paste(dst, (c * W, j * H))
    return out, [W, H, round(AX - ox, 1), round(AY - oy, 1), len(idx)]
def save(img, f):
    img.save(f, 'WEBP', quality=80, method=6); return os.path.getsize(f)
MB = lambda m: m[0] * m[1] * 4 * 8 * m[4] / 1048576
iw = [i for i, n in enumerate(rows) if n.startswith(('idle', 'walk'))]; act = [i for i in range(len(rows)) if i not in iw]
one_iw = w * h * 4 * 8 * len(iw) / 1048576
P_iw, m_iw = part(iw); P_act, m_act = part(act)
split = force or MB(m_iw) <= 0.85 * one_iw
res = {'single': {'meta': meta, 'decodedMB': round(MB(meta), 2), 'idleWalkMB': round(one_iw, 2)}}
if split:
    for f in [pre + '_sheet.webp']:
        if os.path.exists(f): os.remove(f)
    k1 = save(P_iw, pre + '_idlewalk.webp'); k2 = save(P_act, pre + '_actions.webp')
    res.update(split=True, idlewalk={'meta': m_iw, 'rows': [rows[i] for i in iw], 'kb': round(k1 / 1024, 1), 'decodedMB': round(MB(m_iw), 2)},
               actions={'meta': m_act, 'rows': [rows[i] for i in act], 'kb': round(k2 / 1024, 1), 'decodedMB': round(MB(m_act), 2)},
               kb=round((k1 + k2) / 1024, 1), decodedMB=round(MB(m_iw) + MB(m_act), 2), idleWalkMB=round(MB(m_iw), 2))
else:
    for f in [pre + '_idlewalk.webp', pre + '_actions.webp']:
        if os.path.exists(f): os.remove(f)
    k = save(im, pre + '_sheet.webp')
    res.update(split=False, kb=round(k / 1024, 1), decodedMB=round(MB(meta), 2), idleWalkMB=round(one_iw, 2), would_split_iwMB=round(MB(m_iw), 2))
print(json.dumps(res))
