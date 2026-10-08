"""ONE FACE phase 1: python3 tools/plans/face99/compose.py → before_after.png (each kind: before row above its after row)."""
import os
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__))
KINDS = ['studio', 'lanista', 'manager', 'annals', 'online', 'spectator', 'spectator_big', 'council', 'patron']
rows = []
for k in KINDS:
    for tag in ('before', 'after'):
        p = os.path.join(D, f'{k}_{tag}.png')
        if os.path.exists(p):
            rows.append((f'{k} · {tag}', Image.open(p).convert('RGB')))
W = max(im.width for _, im in rows) + 130
H = sum(im.height + 4 for _, im in rows)
out = Image.new('RGB', (W, H), (20, 15, 11))
d = ImageDraw.Draw(out)
y = 0
for label, im in rows:
    d.text((6, y + im.height // 2 - 6), label, fill=(214, 171, 76) if label.endswith('after') else (163, 144, 122))
    out.paste(im, (130, y))
    y += im.height + 4
out.save(os.path.join(D, 'before_after.png'))
print('before_after.png', W, H)
