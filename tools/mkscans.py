"""mkscans.py — rebuild image sheets from Virgilante's original PDF scans (v0.57).

    pdfimages -png <scan>.pdf <dir>/i        # once per PDF (poppler-utils)
    python3 tools/mkscans.py <scans-root> [out-dir|-] [sections]   # needs Pillow; writes into assets/ unless out-dir is given
    sections: fates,chcards,chtok,rtok,armor,weapons,ship,proto,arena,events (default all). armor reads the old 220 px
    armor2.png from git (a8e3810) for the layout; rtok keeps the first four rows of the current rtok.webp.

<scans-root> holds one folder per PDF, named by the upload: *FROfferingTokens*, *chariot*, *fatecards*.
Each embedded image comes with a soft mask (the next image number) that becomes its alpha.
What it rebuilds (sheet layouts unchanged, so the game's SHEETS/CHTOK_IDX/RTOK_* still index them):
  fates.jpg   6x2 Fate cards at 480x692 (was 240x346) — cropped 48 px in from each side of the 822x1122 scan
  chcards.jpg 3x2 chariot cards at 780x528 (was 520x352) — the scan turned 90° to landscape, trimmed to the old frame
  chtok.webp  5x4 chariot tokens at 300 px (was 220, as chtok.png)
  armor2.webp 9x3 armor pieces at 330 px (was armor2.png at 220): scan cut-outs placed where the old pieces stood
  weapons.jpg 9x3 weapon cards at 600x416 (was 300x208)
  ship.webp   the Naumachia ship (3x5 tiles, 256 px a tile, bow on top) · proto1-5.jpg the prototype photos
  rtok.webp   round tokens: the 28 at 128 px are kept, a fifth row adds Health Elixir 2 / 4 HP, Spiders,
              Crowd Favor 1 / 2, Speed of Mercury +1 / +2 and the Curse Tablet (RTOK_NAMES in 40-rtok)
"""
import os, sys, glob
from PIL import Image

ROOT = sys.argv[1]
A = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
OUT = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '-' else A  # optional: write elsewhere (e.g. to compare first)
WANT = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else set()  # optional: only these sections, e.g. weapons,ship,proto
want = lambda k: not WANT or k in WANT

def folder(key):
    m = [d for d in glob.glob(os.path.join(ROOT, '*')) if key.lower() in d.lower() and os.path.isdir(d)]
    if not m: print('· skipped (no scan folder):', key); return None
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
if want('fates') and F:
    FATE_ORDER = [15, 13, 11, 9, 405, 407, 409, 411, 807, 805, 803, 801]
    def fate(n):
        im = flat(load(F, n)); W, H = im.size; m = 48; w = W - 2 * m; h = round(w * 346 / 240); y = (H - h) // 2
        return im.crop((m, y, m + w, y + h))
    sheet([fate(n) for n in FATE_ORDER], 6, 480, 692).save(os.path.join(OUT, 'fates.jpg'), quality=84, optimize=True, progressive=True)
# ---- chariot cards: Bellum Quadriga, Aureus Triumphus, Bellator Aequus, Invicta Gloria, Azureus Magnus, Fulgens Velox ----
C = folder('chariot')
if want('chcards') and C:
    CARD_ORDER = [15, 1, 13, 3, 11, 5]
    def card(n):
        im = flat(load(C, n)).rotate(-90, expand=True); W, H = im.size; m = 26; w = W - 2 * m; h = round(w * 352 / 520); y = (H - h) // 2 - 15
        return im.crop((m, y, m + w, y + h))
    sheet([card(n) for n in CARD_ORDER], 3, 780, 528).save(os.path.join(OUT, 'chcards.jpg'), quality=84, optimize=True, progressive=True)
# ---- chariot tokens, in CHTOK_IDX order ----
if want('chtok') and C:
    TOK_ORDER = [433, 439, 417, 419, 411, 415, 423, 425, 829, 831, 833, 409, 445, 403, 405, 407, 401]
    def tok(n, cell, inner):
        im = load(C, n).resize((inner, inner), Image.LANCZOS); c = Image.new('RGBA', (cell, cell), (0, 0, 0, 0))
        c.alpha_composite(im, ((cell - inner) // 2, (cell - inner) // 2)); return c
    sheet([tok(n, 300, 273) for n in TOK_ORDER], 5, 300, 300, 'RGBA').save(os.path.join(OUT, 'chtok.webp'), quality=88, method=6)
# ---- round tokens: keep the 28, add the offering tokens the sheets lacked ----
O = folder('offeringtokens')
if want('rtok') and O and C:
    old = Image.open(os.path.join(A, 'rtok.webp')).convert('RGBA')
    NEW = [(O, 15), (O, 425), (O, 11), (C, 1261), (C, 1259), (C, 1263), (C, 1291), (C, 1289)]  # elix2 elix4 spiders cf1 cf2 merc1 merc2 curse
    out = Image.new('RGBA', (8 * 128, 5 * 128), (0, 0, 0, 0)); out.alpha_composite(old.crop((0, 0, 1024, 512)), (0, 0))
    for i, (d, n) in enumerate(NEW):
        k = 28 + i; out.alpha_composite(load(d, n).resize((128, 128), Image.LANCZOS), ((k % 8) * 128, (k // 8) * 128))
    out.save(os.path.join(OUT, 'rtok.webp'), quality=90, method=6)
# ---- armor: the 9x3 sheet at 330 px (was 220); each piece in an old cell is replaced by its scan cut-out ----
R = folder('amrors')
if want('armor') and R:
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
    import io, subprocess
    old2 = Image.open(io.BytesIO(subprocess.run(['git', 'show', 'a8e3810:assets/armor2.png'], cwd=os.path.dirname(A), capture_output=True, check=True).stdout)).convert('RGBA'); K = 1.5; CW = 330
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
# ---- weapon cards: the 9x3 sheet at 600x416 (was 300x208), each scan turned 90° and trimmed 39 px ----
WP = folder('weapons')
if want('weapons') and WP:
    WEAPON_ORDER = [15, 13, 11, 9, 409, 411, 413, 415, 1227, 1627, 2027, 2429, 2427, 2425, 2423, 2829, 2827, 2825, 2823,
                    3229, 3227, 3225, 3223, 3625, 3623, 3621, 3619]
    def wcard(n):
        im = flat(load(WP, n)).rotate(-90, expand=True); W, H = im.size; m = 39; w = W - 2 * m; h = round(w * 208 / 300); y = (H - h) // 2
        return im.crop((m, y, m + w, y + h))
    sheet([wcard(n) for n in WEAPON_ORDER], 9, 600, 416).save(os.path.join(OUT, 'weapons.jpg'), quality=82, optimize=True, progressive=True)
# ---- the Naumachia ship: 3 x 5 deck tiles of 402 px under a 173 px bow; saved at 256 px a tile ----
SH = folder('ships')
if want('ship') and SH:
    ship = load(SH, 1); T = 256; k = T / 402
    ship.resize((round(ship.size[0] * k), round(ship.size[1] * k)), Image.LANCZOS).save(os.path.join(OUT, 'ship.webp'), quality=88, method=6)
# ---- the prototype photos (Rules · the D.Soto link) ----
PR = folder('protoimages')
if want('proto') and PR:
    for i, n in enumerate([379, 380, 382, 383, 384]):
        im = flat(load(PR, n))
        if i == 2: im = im.rotate(-90, expand=True)  # photographed sideways: turned 90° clockwise
        im.thumbnail((1600, 1600)); im.save(os.path.join(OUT, f'proto{i + 1}.jpg'), quality=84, optimize=True, progressive=True)
# ---- the arena deck (arena.jpg, 10x9) at 480x704 a card (was 240x352) and the event cards (events.jpg, 5x3) at 480x692 ----
# arenacards1-3 = the deck PDF in thirds. ARENA_CARDS: cell -> (third, image no.); each scan is fitted to its old cell
# (a few px of inset/shift) so the sheet keeps its layout. Cells left out keep the old art: Forge of Vulcan +3 AP (26, 70)
# and Floor Spikes (46) have no scan, 82-89 are empty.
from PIL import ImageChops, ImageStat
def fit(im, ref, ar, m0=68, dy0=0, span=4):
    best = None; g = im.convert('L'); r = ref.convert('L').resize((120, round(120 * ar)))
    for m in range(m0 - span, m0 + span + 1):
        for dy in range(dy0 - 10, dy0 + 11, 2):
            W, H = g.size; w = W - 2 * m; h = round(w * ar); y = (H - h) // 2 + dy
            d = sum(ImageStat.Stat(ImageChops.difference(g.crop((m, y, m + w, y + h)).resize(r.size), r)).mean)
            if best is None or d < best[0]: best = (d, m, y, w, h)
    _, m, y, w, h = best; return im.crop((m, y, m + w, y + h))
AC = [folder(f'arenacards{n}') if want('arena') or want('events') else None for n in (1, 2, 3)]
if want('arena') and all(AC):
    ARENA_CARDS = {0: (1, 9), 1: (1, 9), 2: (1, 13), 3: (1, 13), 4: (1, 414), 5: (1, 414), 6: (1, 410), 7: (1, 410), 8: (1, 812), 9: (1, 810),
        10: (1, 808), 11: (1, 806), 12: (1, 1202), 13: (1, 1204), 14: (1, 1206), 15: (1, 1208), 16: (1, 1608), 17: (1, 1604), 18: (1, 1604), 19: (1, 1602),
        20: (1, 1602), 21: (1, 2004), 22: (1, 2006), 23: (2, 15), 24: (1, 2408), 25: (1, 2406), 27: (1, 2402), 28: (2, 13), 29: (2, 11),
        30: (3, 1201), 31: (3, 1201), 32: (2, 415), 33: (2, 413), 34: (2, 411), 35: (2, 409), 36: (3, 801), 37: (3, 801), 38: (2, 809), 39: (2, 809),
        40: (3, 9), 41: (3, 9), 42: (3, 409), 43: (2, 1205), 44: (2, 1605), 45: (2, 1605), 47: (2, 1611), 48: (2, 2007), 49: (2, 2005),
        50: (2, 2003), 51: (2, 2403), 52: (2, 2001), 53: (2, 2401), 54: (2, 2405), 55: (2, 2405), 56: (3, 9), 57: (3, 9), 58: (3, 1205), 59: (3, 1205),
        60: (3, 1607), 61: (3, 1605), 62: (3, 1603), 63: (3, 1601), 64: (3, 1995), 65: (3, 1997), 66: (3, 1999), 67: (3, 1993), 68: (3, 2399), 69: (1, 15),
        71: (1, 2006), 72: (2, 1207), 73: (2, 1207), 74: (2, 1207), 75: (2, 1207), 76: (2, 1207), 77: (3, 9), 78: (3, 9), 79: (3, 409), 80: (3, 409), 81: (2, 1609)}
    old = Image.open(os.path.join(A, 'arena.jpg')).convert('RGB'); CW, CH = 480, 704
    out = old.resize((10 * CW, 9 * CH), Image.LANCZOS)
    for i, (t, n) in ARENA_CARDS.items():
        ref = old.crop((i % 10 * 240, i // 10 * 352, i % 10 * 240 + 240, i // 10 * 352 + 352))
        out.paste(fit(flat(load(AC[t - 1], n)), ref, 352 / 240, 69, -4, 3).resize((CW, CH), Image.LANCZOS), (i % 10 * CW, i // 10 * CH))
    out.save(os.path.join(OUT, 'arena.jpg'), quality=74, optimize=True, progressive=True)
if want('events') and AC[2]:
    EVENT_CARDS = [2789, 2397, 2395, 2797, 2405, 2407, 2793, 2403, None, 2393, 2791, 2795, 2801]  # 8 Orpheus: the scan is a different print — kept
    old = Image.open(os.path.join(A, 'events.jpg')).convert('RGB'); CW, CH = 480, 692
    out = old.resize((5 * CW, 3 * CH), Image.LANCZOS)
    for i, n in enumerate(EVENT_CARDS):
        if n is None: continue
        ref = old.crop((i % 5 * 240, i // 5 * 346, i % 5 * 240 + 240, i // 5 * 346 + 346))
        out.paste(fit(flat(load(AC[2], n)), ref, 346 / 240, 48, 0, 2).resize((CW, CH), Image.LANCZOS), (i % 5 * CW, i // 5 * CH))
    out.save(os.path.join(OUT, 'events.jpg'), quality=82, optimize=True, progressive=True)
print('done:', ','.join(WANT) or 'all')
