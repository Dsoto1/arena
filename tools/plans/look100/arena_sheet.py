# arena_sheet.py — builds arena_compare.png (side-by-side sheet) from the arena_* shots
from PIL import Image,ImageDraw,ImageFont
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FT=ImageFont.truetype(B,26);FL=ImageFont.truetype(R,17)
PW=485;LH=26
def load(fn,crop=None):
    im=Image.open(fn).convert('RGB')
    if crop:im=im.crop(crop)
    return im.resize((PW,int(im.height*PW/im.width)),Image.LANCZOS)
EDGE=(380,140,970,430)
rows=[
 ('1 · RAILING on the faint line — zoomed in, pieces on the near edge (Roma)',[('Before','arena_before_edge_in.png',EDGE),('a · Bronze rail on short posts','arena_rail_bronze_in.png',EDGE),('b · Stone balustrade','arena_rail_balus_in.png',EDGE),('c · Marble parapet + bronze rail','arena_rail_parapet_in.png',EDGE)]),
 ('1 · RAILING — zoomed out (Roma)',[('Before','arena_before_roma.png',None),('a · Bronze','arena_rail_bronze.png',None),('b · Balustrade','arena_rail_balus.png',None),('c · Parapet','arena_rail_parapet.png',None)]),
]
for city,name in [('roma','Roma'),('capua','Capua'),('leptis','Leptis Magna')]:
    rows.append((f'2 · STONE — {name} (arena tint kept)',[('Before (stone_wall.webp + filter)',f'arena_before_{city}.png',None),('A · Warm travertine, mortar lines',f'arena_stone_trav_{city}.png',None),('B · Sandstone blocks, carved edge',f'arena_stone_sand_{city}.png',None),('C · Marble + Pompeian-red bands',f'arena_stone_marble_{city}.png',None)]))
rows.append(('2 · STONE — zoomed in (Roma)',[('Before','arena_before_edge_in.png',None),('A · Travertine','arena_stone_trav_roma_in.png',None),('B · Sandstone','arena_stone_sand_roma_in.png',None),('C · Marble','arena_stone_marble_roma_in.png',None)]))
rows.append(('3 · MATCHED SETS (stone + rail) — 1440 and phone 844×390',[('A + a · travertine + bronze','arena_combo_trav_bronze.png',None),('B + b · sandstone + balustrade','arena_combo_sand_balus.png',None),('C + c · marble + parapet','arena_combo_marble_parapet.png',None),('Phone: C + c','arena_phone_marble_parapet.png',None)]))
rows.append(('   phone 844×390 (dpr 2)',[('Phone before','arena_before_phone_edge.png',None),('Phone A + a','arena_phone_trav_bronze.png',None),('Phone B + b','arena_phone_sand_balus.png',None),('',None,None)]))
built=[]
for title,panels in rows:
    ims=[(lab,load(fn,cr) if fn else None) for lab,fn,cr in panels];h=max(i.height for _,i in ims if i)
    built.append((title,ims,h))
W=PW*4+50;H=sum(h+LH+46 for _,_,h in built)+20
out=Image.new('RGB',(W,H),(28,22,17));d=ImageDraw.Draw(out);y=10
for title,ims,h in built:
    d.text((12,y),title,font=FT,fill=(240,207,125));y+=40
    for i,(lab,im) in enumerate(ims):
        x=10+i*(PW+10)
        if im is None:continue
        d.text((x,y),lab,font=FL,fill=(236,226,206));out.paste(im,(x,y+LH))
    y+=h+LH+6
out.save('arena_compare.png');print(out.size)
