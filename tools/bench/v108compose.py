"""tools/bench/v108compose.py — side-by-side "today | proposal" JPEGs for the v1.08 mock-up (tools/plans/v108/MOCKUP.md).
   python3 tools/bench/v108compose.py SHOTDIR OUTDIR
   Reads SHOTDIR/<variant>_<view>_<mode>.png (tools/bench/v108shots.js) and writes OUTDIR/compare_<item>_<config>.jpg, ~1600 px wide,
   plus 2x close-up crops of the busy middle (compare_<item>_closeup_<config>.jpg) for the zoomed desk shots."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception:
    FONT = ImageFont.load_default()
ITEMS = {'torch': ['night-flat', 'night-zoom'], 'mat': ['day-flat', 'day-zoom', 'night-flat', 'night-zoom'],
         'depth': ['day-flat', 'day-zoom', 'night-flat', 'night-zoom'], 'all': ['day-flat', 'day-zoom', 'night-flat', 'night-zoom'],
         'safari': ['day-flat', 'night-flat']}
BASE = {'safari': 'safarioff'}

def label(im, txt):
    d = ImageDraw.Draw(im)
    w = d.textlength(txt, font=FONT)
    d.rectangle([8, 8, 8 + w + 16, 40], fill=(20, 16, 12))
    d.text((16, 11), txt, fill=(245, 232, 200), font=FONT)

def pair(a, b, la, lb, width=1600):
    A, Bm = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    gap = 8
    W = A.width + Bm.width + gap
    im = Image.new('RGB', (W, max(A.height, Bm.height)), (12, 10, 8))
    im.paste(A, (0, 0)); im.paste(Bm, (A.width + gap, 0))
    k = width / W
    if A.height > A.width:  # phone (portrait): keep it readable, ~1600 wide means ~2x
        pass
    im = im.resize((width, round(im.height * k)), Image.LANCZOS)
    half = (A.width) * k
    l1 = Image.new('RGB', (1, 1)); del l1
    label(im, la)
    d = ImageDraw.Draw(im)
    w = d.textlength(lb, font=FONT); x0 = int(half + gap * k + 8)
    d.rectangle([x0, 8, x0 + w + 16, 40], fill=(20, 16, 12)); d.text((x0 + 8, 11), lb, fill=(245, 232, 200), font=FONT)
    return im

def crop2(p, box):
    im = Image.open(p).convert('RGB')
    w, h = im.size
    x0, y0, x1, y1 = [int(v) for v in (box[0] * w, box[1] * h, box[2] * w, box[3] * h)]
    c = im.crop((x0, y0, x1, y1))
    return c.resize((c.width * 2, c.height * 2), Image.LANCZOS)

made = []
for item, modes in ITEMS.items():
    for view in ('desk', 'phone'):
        for m in modes:
            a = os.path.join(SRC, f"{BASE.get(item, 'off')}_{view}_{m}.png"); b = os.path.join(SRC, f"{item}_{view}_{m}.png")
            if not (os.path.exists(a) and os.path.exists(b)):
                continue
            nm = {'torch': 'night torches', 'mat': 'materials', 'depth': 'wall / stands depth', 'all': 'all three', 'safari': 'all three, Safari path'}[item]
            im = pair(a, b, f'today v1.07 · {view} {m}', f'proposal: {nm}')
            f = os.path.join(OUT, f'compare_{item}_{view}_{m}.jpg'); im.save(f, quality=88); made.append(f)
            if view == 'desk' and m.endswith('zoom'):
                ca, cb = crop2(a, (0.30, 0.30, 0.66, 0.75)), crop2(b, (0.30, 0.30, 0.66, 0.75))
                tmpa, tmpb = f + '.a.png', f + '.b.png'; ca.save(tmpa); cb.save(tmpb)
                im = pair(tmpa, tmpb, f'today · closeup {m}', f'proposal: {nm}')
                os.remove(tmpa); os.remove(tmpb)
                f2 = os.path.join(OUT, f'compare_{item}_closeup_desk_{m}.jpg'); im.save(f2, quality=88); made.append(f2)
            # the stands / walls close-up for materials + depth (the far left wall, its benches and the sand edge)
            if view == 'desk' and m.endswith('zoom') and item in ('mat', 'depth', 'all'):
                box = (0.0, 0.0, 0.42, 0.55)
                ca, cb = crop2(a, box), crop2(b, box)
                tmpa, tmpb = f + '.a.png', f + '.b.png'; ca.save(tmpa); cb.save(tmpb)
                im = pair(tmpa, tmpb, f'today · stands {m}', f'proposal: {nm}')
                os.remove(tmpa); os.remove(tmpb)
                f3 = os.path.join(OUT, f'compare_{item}_stands_desk_{m}.jpg'); im.save(f3, quality=88); made.append(f3)
print('\n'.join(made))
