from PIL import Image
U='/root/.claude/uploads/9d68b8c5-61f3-5076-b7bf-0a1c8c60449b/'
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'assets')+'/'
def std(im,r,c): # standard 8000-wide sheets
    x,y=48+800*c,37+1092*r; return im.crop((x,y,x+706,y+1018))
def sheet(cells,cols,cw,ch,name,q=80):
    rows=(len(cells)+cols-1)//cols
    out=Image.new('RGB',(cols*cw,rows*ch),(20,18,16))
    for i,im in enumerate(cells):
        if im is None: continue
        out.paste(im.convert('RGB').resize((cw,ch),Image.LANCZOS),((i%cols)*cw,(i//cols)*ch))
    out.save(OUT+name,quality=q,optimize=True,progressive=True); print(name,out.size)
# arena deck + round 2
A=Image.open('/mnt/user-data/uploads/jpg_fr_arena_part1.png').convert('RGB')
AX=[70,892,1714,2540,3360,4182,5005,5827,6648,7472];AY=[61,1185,2297,3427,4549,5673,6785]
cells=[A.crop((AX[c]-2,AY[r]-2,AX[c]+683,AY[r]+1002)) for r in range(7) for c in range(10)]
B=Image.open(U+'1fb1f0a5-image.jpg').convert('RGB')
BX=[71+800*i for i in range(10)];BY=[59,1153]
for i in range(12):
    r,c=(0,i) if i<10 else (1,i-10)
    cells.append(B.crop((BX[c]-2,BY[r]-2,BX[c]+668,BY[r]+974)))
sheet(cells,10,240,352,'arena.jpg',78)
# weapons: rotate to landscape so the name reads upright
Wim=Image.open(U+'c8ac8f85-image.jpg').convert('RGB')
H=4367/4
def wcard(r,c):
    x,y=48+800*c,int(37+H*r); return Wim.crop((x,y,x+706,y+1018)).rotate(90,expand=True)
order=[(0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6),(0,7),(0,8),(1,6),(2,0),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(3,0),(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,8),(3,9)]
sheet([wcard(r,c) for r,c in order],9,300,208,'weapons.jpg',80)
def grid(file,n,cols=10):
    im=Image.open(U+file).convert('RGB'); return [std(im,i//cols,i%cols) for i in range(n)]
sheet(grid('152ba5bb-image.jpg',15),5,240,346,'mandati.jpg')
sheet(grid('8798f7e3-image.jpg',8),4,300,432,'classes.jpg',82)
sheet(grid('549217d0-image.jpg',13),5,240,346,'events.jpg')
sheet(grid('40aa6605-image.jpg',12),6,240,346,'fates.jpg')
# carmina + backs
carm=grid('36945314-image.jpg',3)
aback=Image.open(U+'175281b7-image.png').convert('RGB')
cback=Image.open(U+'d3bd12e5-image.jpg').convert('RGB')
clback=std(Image.open(U+'7d4ef7a6-image.jpg').convert('RGB'),0,0)
wback=std(Image.open(U+'1635928f-image.jpg').convert('RGB'),0,0)
sheet(carm+[aback,cback,clback,wback],7,240,346,'misc.jpg')
# dice faces
for f,n in [('3ce3b0ef-image.png','hit'),('0148876c-image.png','miss')]:
    Image.open(U+f).convert('RGB').resize((48,48),Image.LANCZOS).save(OUT+f'die-{n}.png',optimize=True)
loc=Image.open(U+'4d9a04e3-image.png').convert('RGBA')
print('loc bbox',loc.getbbox())
logo=Image.open(U+'5062df82-image.png').convert('RGBA');logo.thumbnail((420,240));logo.save(OUT+'logo.png',optimize=True);print('logo',logo.size)
tok=Image.open(U+'766b59ad-image.png').convert('RGBA').resize((128,128),Image.LANCZOS);tok.save(OUT+'blessing.png',optimize=True)
# hit-location die faces, sprite order: head, chest, larm, rarm, rleg, lleg
boxes={'head':(10,704,650,1340,0),'rleg':(700,704,1340,1340,0),'larm':(1394,704,2034,1340,0),'chest':(10,1390,650,2030,180),'lleg':(700,1390,1340,2030,0),'rarm':(1394,1390,2034,2030,180)}
out=Image.new('RGB',(6*72,72))
for i,k in enumerate(['head','chest','larm','rarm','rleg','lleg']):
    x0,y0,x1,y1,rot=boxes[k]; f=loc.crop((x0,y0,x1,y1)).rotate(rot).convert('RGB').resize((72,72),Image.LANCZOS); out.paste(f,(i*72,0))
out.save(OUT+'locdie.jpg',quality=85); print('locdie')
# class backs (hold dropped items)
cb=Image.open(U+'7d4ef7a6-image.jpg').convert('RGB')
sheet([std(cb,0,c) for c in range(8)],8,120,173,'classbacks.jpg',78)
