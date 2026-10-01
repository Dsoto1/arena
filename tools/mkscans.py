"""mkscans.py — rebuild image sheets from David's original PDF scans (v0.57).

    pdfimages -png <scan>.pdf <dir>/i        # once per PDF (poppler-utils)
    python3 tools/mkscans.py <scans-root> [out-dir]   # needs Pillow; writes into assets/ unless out-dir is given

<scans-root> holds one folder per PDF, named by the upload: *FROfferingTokens*, *chariot*, *fatecards*.
Each embedded image comes with a soft mask (the next image number) that becomes its alpha.
What it rebuilds (sheet layouts unchanged, so the game's SHEETS/CHTOK_IDX/RTOK_* still index them):
  fates.jpg   6x2 Fate cards at 480x692 (was 240x346) — cropped 48 px in from each side of the 822x1122 scan
  chcards.jpg 3x2 chariot cards at 780x528 (was 520x352) — the scan turned 90° to landscape, trimmed to the old frame
  chtok.webp  5x4 chariot tokens at 300 px (was 220, as chtok.png)
  armor2.webp 9x3 armor pieces at 330 px (was armor2.png at 220): scan cut-outs placed where the old pieces stood
  rtok.webp   round tokens: the 28 at 128 px are kept, a fifth row adds Health Elixir 2 / 4 HP, Spiders,
              Crowd Favor 1 / 2, Speed of Mercury +1 / +2 and the Curse Tablet (RTOK_NAMES in 40-rtok)
"""
import os, sys, glob
from PIL import Image

ROOT = sys.argv[1]
A = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
OUT = sys.argv[2] if len(sys.argv) > 2 else A  # optional: write elsewhere (e.g. to compare first)

def folder(key):
    m = [d for d in glob.glob(os.path.join(ROOT, '*')) if key.lower() in d.lower() and os.path.isdir(d)]
    if not m: sys.exit('no scan folder for ' + key)
    return m[0]

def load(d, n):
    def f(k):
        for p in (f'{d}/i-{k:03d}.png', f'{d}/i-{k:04d}.png'):
            if os.path.exists(p): return p
    im = Image.open(f(n)).convert('RGB')
    m = f(n + 1)
    if m:
        a = Image.open(m)
        if a.mode in ('L', '1') and a.size == im.size:
            r = im.convert('RGBA'); r.putalpha(a.convert('L')); return r
    return im.convert('RGBA')

def flat(im, bg=(20, 18, 16)):
    b = Image.new('RGBA', im.size, bg + (255,)); b.alpha_composite(im); return b.convert('RGB')

def sheet(imgs, cols, cw, ch, mode='RGB'):
    rows = (len(imgs) + cols - 1) // cols
    out = Image.new(mode, (cols * cw, rows * ch), (20, 18, 16) if mode == 'RGB' else (0, 0, 0, 0))
    for i, im in enumerate(imgs):
        if im is None: continue
        x, y = (i % cols) * cw, (i // cols) * ch
        if mode == 'RGB': out.paste(im.resize((cw, ch), Image.LANCZOS), (x, y))
        else: out.alpha_composite(im, (x, y))
    return out

# ---- Fate cards: the order of fates.jpg's cells, by the scan's image numbers ----
F = folder('fatecards')
FATE_ORDER = [15, 13, 11, 9, 405, 407, 409, 411, 807, 805, 803, 801]
def fate(n):
    im = flat(load(F, n)); W, H = im.size; m = 48; w = W - 2 * m; h = round(w * 346 / 240); y = (H - h) // 2
    return im.crop((m, y, m + w, y + h))
sheet([fate(n) for n in FATE_ORDER], 6, 480, 692).save(os.path.join(OUT, 'fates.jpg'), quality=84, optimize=True, progressive=True)

# ---- chariot cards: Bellum Quadriga, Aureus Triumphus, Bellator Aequus, Invicta Gloria, Azureus Magnus, Fulgens Velox ----
C = folder('chariot')
CARD_ORDER = [15, 1, 13, 3, 11, 5]
def card(n):
    im = flat(load(C, n)).rotate(-90, expand=True); W, H = im.size; m = 26; w = W - 2 * m; h = round(w * 352 / 520); y = (H - h) // 2 - 15
    return im.crop((m, y, m + w, y + h))
sheet([card(n) for n in CARD_ORDER], 3, 780, 528).save(os.path.join(OUT, 'chcards.jpg'), quality=84, optimize=True, progressive=True)

# ---- chariot tokens, in CHTOK_IDX order ----
TOK_ORDER = [433, 439, 417, 419, 411, 415, 423, 425, 829, 831, 833, 409, 445, 403, 405, 407, 401]
def tok(n, cell, inner):
    im = load(C, n).resize((inner, inner), Image.LANCZOS); c = Image.new('RGBA', (cell, cell), (0, 0, 0, 0))
    c.alpha_composite(im, ((cell - inner) // 2, (cell - inner) // 2)); return c
sheet([tok(n, 300, 273) for n in TOK_ORDER], 5, 300, 300, 'RGBA').save(os.path.join(OUT, 'chtok.webp'), quality=88, method=6)

# ---- round tokens: keep the 28, add the offering tokens the sheets lacked ----
O = folder('offeringtokens')
old = Image.open(os.path.join(A, 'rtok.webp')).convert('RGBA')
NEW = [(O, 15), (O, 425), (O, 11), (C, 1261), (C, 1259), (C, 1263), (C, 1291), (C, 1289)]  # elix2 elix4 spiders cf1 cf2 merc1 merc2 curse
out = Image.new('RGBA', (8 * 128, 5 * 128), (0, 0, 0, 0)); out.alpha_composite(old.crop((0, 0, 1024, 512)), (0, 0))
for i, (d, n) in enumerate(NEW):
    k = 28 + i; out.alpha_composite(load(d, n).resize((128, 128), Image.LANCZOS), ((k % 8) * 128, (k // 8) * 128))
out.save(os.path.join(OUT, 'rtok.webp'), quality=90, method=6)
# ---- armor: the 9x3 sheet at 330 px (was 220); each piece in an old cell is replaced by its scan cut-out ----
R = folder('amrors')
ARMOR = {0: [61], 1: [27], 2: [43], 3: [5], 4: [9], 5: [41], 6: [49, 1], 7: [3], 8: [19], 9: [65], 10: [15], 11: [63], 12: [81],
         14: [53], 15: [77], 16: [17], 17: [67], 18: [55], 19: [33], 20: [29], 22: [47, 45], 23: [23], 24: [11, 13], 25: [57], 26: [37]}  # 13, 21: no scan — kept
def parts(cell, vertical):
    a = cell.split()[3].point(lambda v: 255 if v > 40 else 0); W, H = a.size; px = a.load()
    L = H if vertical else W
    on = [any(px[x, k] if vertical else px[k, x] for x in range(W if vertical else H)) for k in range(L)] + [False]
    runs, s0 = [], None
    for k, c in enumerate(on):
        if c and s0 is None: s0 = k
        if not c and s0 is not None:
            if k - s0 > 8: runs.append((s0, k))
            s0 = None
    out = []
    for k0, k1 in runs:
        box = (0, k0, W, k1) if vertical else (k0, 0, k1, H)
        bb = a.crop(box).getbbox()
        if bb: out.append((box[0] + bb[0], box[1] + bb[1], box[0] + bb[2], box[1] + bb[3]))
    return out
old2 = Image.open(os.path.join(A, 'armor2.png')).convert('RGBA'); K = 1.5; CW = 330
arm = Image.new('RGBA', (9 * CW, 3 * CW), (0, 0, 0, 0))
for i in range(27):
    c, r = i % 9, i // 9; cell = old2.crop((c * 220, r * 220, c * 220 + 220, r * 220 + 220))
    big = cell.resize((CW, CW), Image.LANCZOS)
    if i in ARMOR:
        ps = ARMOR[i]; bbs = parts(cell, i == 6)
        if len(bbs) == len(ps):
            big = Image.new('RGBA', (CW, CW), (0, 0, 0, 0))
            for n, bb in zip(ps, bbs):
                pc = load(R, n); pc = pc.crop(pc.split()[3].getbbox())
                bw, bh = (bb[2] - bb[0]) * K, (bb[3] - bb[1]) * K; s = min(bw / pc.size[0], bh / pc.size[1])
                pc = pc.resize((max(1, round(pc.size[0] * s)), max(1, round(pc.size[1] * s))), Image.LANCZOS)
                big.alpha_composite(pc, (round(bb[0] * K + (bw - pc.size[0]) / 2), round(bb[1] * K + (bh - pc.size[1]) / 2)))
    arm.alpha_composite(big, (c * CW, r * CW))
arm.save(os.path.join(OUT, 'armor2.webp'), quality=90, method=6)
print('fates.jpg chcards.jpg chtok.webp rtok.webp armor2.webp rebuilt')
