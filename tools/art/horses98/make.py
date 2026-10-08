"""make.py — v0.98: Virgilante's printed horse token sheet (horse.pdf) -> the horse cells of assets/chtok.webp.
Run from the repo root: python3 tools/art/horses98/make.py
pdfimages extracts the 375 px face images + their smask (alpha) into a temp folder; each face is resized to the
sheet's 273 px token inside its 300 px cell (5 columns, the same layout as before, so CHTOK_IDX keeps working).
Cells 0-7 are replaced, cell 17 = saxoC (Saxo 1/10, a face the game did not have)."""
import os, subprocess, tempfile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
PDF = os.path.join(HERE, 'horse.pdf')
SHEET = os.path.join(ROOT, 'assets', 'chtok.webp')
# pdfimages index of the face image (its smask is index+1) -> chtok cell
FACES = {33: 0,   # palmatusA  Palmatus +3 / 10
         39: 1,   # palmatusB  Palmatus +2 / 12
         17: 2,   # ocianusA   Ocianus  +2 / 8
         19: 3,   # ocianusB   Ocianus  +2 / 10
         11: 4,   # saxoA      Saxo     +1 / 8
         15: 5,   # saxoB      Saxo     +1 / 12
         23: 6,   # vindexA    Vindex   +3 / 8
         25: 7,   # vindexB    Vindex   +3 / 12
         13: 17}  # saxoC      Saxo     +1 / 10
CELL, INNER = 300, 273
with tempfile.TemporaryDirectory() as td:
    subprocess.run(['pdfimages', '-png', PDF, os.path.join(td, 'img')], check=True)
    sheet = Image.open(SHEET).convert('RGBA')
    for n, cell in FACES.items():
        im = Image.open(os.path.join(td, 'img-%03d.png' % n)).convert('RGB')
        im.putalpha(Image.open(os.path.join(td, 'img-%03d.png' % (n + 1))).convert('L'))
        im = im.resize((INNER, INNER), Image.LANCZOS)
        x, y = (cell % 5) * CELL, (cell // 5) * CELL
        sheet.paste(Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0)), (x, y))
        sheet.alpha_composite(im, (x + (CELL - INNER) // 2, y + (CELL - INNER) // 2))
    sheet.save(SHEET, quality=88, method=6)
print('chtok.webp: 9 horse cells from horse.pdf')
