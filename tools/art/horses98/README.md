# horses98 — Virgilante's printed chariot horse token sheet (v0.98)

- `horse.pdf` — his sheet: 16 horse faces (Palmatus 3/10 ×2, 2/12 · Ocianus 2/8 ×3, 2/10 ×2 · Saxo 1/8 ×3, 1/10, 1/12 ·
  Vindex 3/8, 3/12 ×2) + the chariot discs (the chariot tokens' backs, coloured dots).
- `make.py` — rebuilds the 9 horse cells of `assets/chtok.webp` (cells 0–7 + 17 = saxoC, Saxo 1/10) from the PDF's
  375 px face images and their smask alpha (pdfimages into a temp folder; nothing extracted is kept here).
- The game's tokens (two different horses each) are `HORSE_SET98` in src/258-v98horses.js; tools/horsesim.js re-runs the balance sims.
