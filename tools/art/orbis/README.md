# Orbis Terrarum — the online world map

`assets/orbis.webp` (1600×569, ~160 KB) is the world painted in the style of Virgilante's empire map (`assets/map.jpg`):
parchment land, an orange screen along the coasts whose holes grow inland until it fades, bright blue sea with a darker
blue screen in the shallows, a bold hand-inked coastline, a few major rivers in thin ink, two calligraphic ocean names
(*Oceanus*, *Mare Indicum*) and a black frame. It wraps east–west without a seam.

Projection: equirectangular, lat 76 … −52 (Antarctica cut). For a point: `x = (lon+180)/360`, `y = (76-lat)/128`
(fractions of the image). `src/online/117-onltz.js` maps a browser time zone to that point (`onlTzLL`, `onlTzXY`).

Data: Natural Earth (public domain) via the npm packages `world-atlas` (ISC; land 50m) and `sane-topojson` (MIT; lakes 50m,
rivers 110m). The packages stay in a scratch dir — never in the repo.

## Re-render

```sh
mkdir -p /tmp/orbis && cd /tmp/orbis
npm init -y >/dev/null && npm i world-atlas@2 topojson-client@3 sane-topojson
node <repo>/tools/art/orbis/proj.js 4800 96          # -> orbis_geo.json (paint size = 3 x final, 96 px wrap padding)
python3 <repo>/tools/art/orbis/render.py <repo>/assets/orbis.webp 1600 88   # needs numpy, opencv-python, pillow
```

`render.py` also writes a lossless `orbis_check.png` in the scratch dir — look at it (and at a 920 px-wide copy, the size
the landing oval shows) beside `assets/map.jpg` before shipping. Keep the webp ≤ 220 KB (quality 88 ≈ 160 KB).

Knobs (top of each block in `render.py`, all in final pixels): `hexdist(5.6)` screen pitch, `BL` orange band width,
`BS` shallows width, `wInk` coastline pen, the `label(...)` calls for the ocean names. The seeded RNG (`default_rng(7)`)
keeps the wobble identical between renders.

## The time-zone table

```sh
python3 tools/art/orbis/mktz.py            # from the repo root; rewrites src/online/117-onltz.js from /usr/share/zoneinfo
```

zone1970.tab + zone.tab coordinates, plus the old link names browsers still report (Asia/Calcutta, Europe/Kiev,
US/Eastern …) from tzdata.zi, rounded to 0.1°.
