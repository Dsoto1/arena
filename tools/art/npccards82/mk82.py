#!/usr/bin/env python3
"""v0.82 beast cards: his printed NPC fronts + the info-side template → assets/.
   python3 tools/art/npccards82/mk82.py   (run from anywhere)
   • npccard82_<key>.webp   his printed fronts, cropped to the gold border (no bleed), 600 px wide
   • npcback82_3.webp       the 3-state info side (blank rows, filled live in HTML)
   • npcback82_1.webp       the 1-state info side: one row, no linked HP track (cut from the same template)
   • npcfront82.webp        a blank ACTIVE front (frame + plate + strip with icons, no numbers) for every other beast
"""
import os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', '..', 'assets')
BOX = (53, 41, 773, 1080)          # the gold border: the card itself (the scans carry a dark bleed)
WOUT = 600
def save(im, name):
    im = im.crop(BOX).resize((WOUT, round(WOUT * (BOX[3] - BOX[1]) / (BOX[2] - BOX[0]))), Image.LANCZOS)
    im.save(os.path.join(OUT, name), 'WEBP', quality=85, method=6)
    print(name, im.size)
for k in ['tholo', 'commodus', 'leo', 'leaena', 'zora']:
    save(Image.open(os.path.join(HERE, k + '.jpg')).convert('RGB'), f'npccard82_{k}.webp')
back = Image.open(os.path.join(HERE, 'back_template_3states.webp')).convert('RGB')
save(back, 'npcback82_3.webp')
# one state: keep the Initial row, lift the two lower rows and the link out, parchment from below fills the gap
one = back.copy()
patch = back.crop((60, 600, 760, 600 + 150))           # plain parchment band (left of the pillar)
one.paste(patch, (60, 413))
# the track's link under the first circle: lift it (the row's lower rule stays)
one.paste(back.crop((592, 399, 652, 413)), (652, 399))
save(one, 'npcback82_1.webp')
# a blank ACTIVE front: the back's frame + parchment + corner work, his ACTIVE plate on top, his stat strip at the foot
th = Image.open(os.path.join(HERE, 'tholo.jpg')).convert('RGB')
fr = back.copy()
fr.paste(back.crop((60, 600, 760, 820)), (60, 338))   # no rows on a front
fr.paste(th.crop((298, 62, 531, 133)), (298, 62))
strip = th.crop((60, 986, 766, 1080))
d = ImageDraw.Draw(strip)
bg = strip.getpixel((350 - 60 + 40, 1017 - 986 - 14))
for x0, x1 in [(150, 196), (284, 322), (534, 578), (662, 730)]:   # erase the printed numbers (the icons stay)
    d.rectangle((x0 - 60, 999 - 986, x1 - 60, 1045 - 986), fill=bg)
fr.paste(strip, (60, 986))
save(fr, 'npcfront82.webp')
