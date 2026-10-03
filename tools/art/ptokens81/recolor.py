"""Approved custom-class mosaic look (Virgilante, 2026-10-03): python3 recolor.py '#1e8a8a' out.png
His Hero mosaic: green patches -> the class colour (each cell keeps its light/shade); the cells between and the darker cells ->
muted, darker shades of the same colour; the dark lead lines stay; his border on top. The game should do the same at runtime
(split once into base / patch layers, tint with the class colour on a canvas)."""
import sys, colorsys
from PIL import Image
D = __file__.rsplit('/', 1)[0] + '/'
def recolor(target):
    src = Image.open(D + 'hero_color.webp').convert('RGBA'); ring = Image.open(D + 'border_ring.webp').convert('RGBA')
    W, H = src.size; px = src.load(); ra = ring.split()[3].load()
    tr, tg, tb = [int(target[i:i + 2], 16) / 255 for i in (1, 3, 5)]; th, tl, ts = colorsys.rgb_to_hls(tr, tg, tb)
    out = src.copy(); o = out.load()
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a == 0 or ra[x, y] > 200: continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if l < 0.13: continue
            if 60 / 360 <= h <= 170 / 360 and s > 0.25: nl = max(0, min(1, tl + (l - 0.55) * 0.9)); ns = max(0.35, ts)
            else: nl = max(0.08, min(0.85, l * 0.78)); ns = max(0.12, ts * 0.42)
            nr, ng, nb = colorsys.hls_to_rgb(th, nl, ns); o[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    out.alpha_composite(ring); return out
if __name__ == '__main__':
    recolor(sys.argv[1]).save(sys.argv[2] if len(sys.argv) > 2 else 'custom_round.png')
