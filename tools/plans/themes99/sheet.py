"""themes99 sheet: python3 tools/plans/themes99/sheet.py <shots dir> <out.png>
One row per arena theme: TODAY (swatch · board · panels) | PROPOSED (swatch · board · panels).
Panels = the turn bar / action dock + the top of the fighter panel, cropped from the 1440x900 window shots."""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
D, OUT = sys.argv[1], sys.argv[2]
NAMES = {1:'Syracusae · Sea Cliff',2:'Verona · Rose Stone',3:'Arles · Gallic Gold',4:'Capua · Old Blood',5:'Thysdrus · Amber Sands',6:'Roma · Colosseum',
         7:'Nemausus · Laurel Green',8:'Pompeii · Ash & Cinnabar',9:'Leptis Magna · Desert Marble',10:'Uthina · Punic Dusk',11:'Pola · Adriatic',12:'Puteoli · Sulfur Fields'}
def font(sz, bold=False):
    for f in (['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
BW = 560                      # board width in the sheet
def side(mode, k):
    sw = Image.open(f'{D}/{mode}_sw{k}.png').convert('RGB')
    sw = sw.resize((220, int(sw.height * 220 / sw.width)))
    bd = Image.open(f'{D}/{mode}_board{k}.png').convert('RGB')
    bd = bd.resize((BW, int(bd.height * BW / bd.width)))
    full = Image.open(f'{D}/{mode}_full{k}.png').convert('RGB')
    dock = full.crop((16, 735, 988, 900)); dock = dock.resize((BW, int(dock.height * BW / dock.width)))
    fp = full.crop((1004, 107, 1424, 470)); fp = fp.resize((220, int(fp.height * 220 / fp.width)))
    h = max(sw.height + 8 + fp.height, bd.height + 6 + dock.height)
    im = Image.new('RGB', (220 + 10 + BW, h), (24, 20, 16))
    im.paste(sw, (0, 0)); im.paste(fp, (0, sw.height + 8)); im.paste(bd, (230, 0)); im.paste(dock, (230, bd.height + 6))
    return im
rows = []
for k in range(1, 13):
    if not all(os.path.exists(f'{D}/{m}_{p}{k}.png') for m in ('off', 'on') for p in ('sw', 'board', 'full')): continue
    a, b = side('off', k), side('on', k)
    h = max(a.height, b.height) + 46
    r = Image.new('RGB', (a.width + b.width + 60, h), (14, 11, 9))
    d = ImageDraw.Draw(r); d.text((14, 10), f'{k} · {NAMES[k]}', fill=(240, 207, 125), font=font(22, True))
    r.paste(a, (14, 42)); r.paste(b, (a.width + 46, 42))
    d.line([(a.width + 30, 42), (a.width + 30, h - 4)], fill=(90, 70, 50), width=2)
    rows.append(r)
W = max(r.width for r in rows)
head = Image.new('RGB', (W, 92), (14, 11, 9)); d = ImageDraw.Draw(head)
d.text((14, 12), 'Arena themes — TODAY (left) vs PROPOSED (right, localStorage flavius_themes99=1)', fill=(239, 227, 204), font=font(26, True))
d.text((14, 52), 'Each: Settings swatch · fighter panel (top) · mid-game all-CPU Democritus board in that arena · action dock. Highlights, ring, HP/AP/MV and class colours unchanged.', fill=(179, 157, 128), font=font(16))
d.text((14 + 14, 74), 'TODAY', fill=(214, 171, 76), font=font(14, True)); d.text((rows[0].width // 2 + 20, 74), 'PROPOSED', fill=(214, 171, 76), font=font(14, True))
sheet = Image.new('RGB', (W, head.height + sum(r.height for r in rows)), (14, 11, 9)); sheet.paste(head, (0, 0)); y = head.height
for r in rows: sheet.paste(r, (0, y)); y += r.height
sheet.save(OUT, optimize=True); print(OUT, sheet.size)
