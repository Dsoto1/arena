# Floor Spikes medallion (v0.83, Virgilante's description): his Spiders medallion's frame, plaque and banner; the scene inside repainted —
# his Water medallion's stands behind, sand, an iron plate with seven slots, six spears angling out and up and one straight up in the
# middle. Plaque "1 DMG" → "2 DMG" (his "2" from 2x ARENA KEYS), banner "SPIDERS" → "SPIKES" (his K from ARENA KEY). Run from this folder.
import math, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
M='../medallions/'
base=Image.open(M+'spiders.png').convert('RGBA');water=Image.open(M+'water.png').convert('RGBA')
W=H=400;S=4
scene_mask=np.load('scene_mask.npy')
# ---------- the scene, painted at 4x ----------
sc=Image.new('RGBA',(W*S,H*S),(0,0,0,0));d=ImageDraw.Draw(sc)
P=lambda x,y:(x*S,y*S)
# sand floor with a soft gradient and grain
sand=np.zeros((H*S,W*S,4),np.uint8);ys=np.linspace(0,1,H*S)[:,None]
top=np.array([212,182,128]);bot=np.array([170,132,84]);t=np.clip((np.arange(H*S)[:,None]/S-195)/110,0,1)
col=(top*(1-t)+bot*t);rng=np.random.default_rng(83);grain=rng.normal(0,7,(H*S,W*S))[:,:,None]
sand[:,:,:3]=np.clip(col[:,None,:]*np.ones((1,W*S,1))+grain,0,255);sand[:,:,3]=255
sc=Image.fromarray(sand);d=ImageDraw.Draw(sc)
# his stands on top (from the Water medallion), down to the ledge
wt=water.resize((W*S,H*S),Image.LANCZOS);cut=Image.new('L',(W*S,H*S),0);ImageDraw.Draw(cut).rectangle([0,0,W*S,201*S],fill=255)
sc.paste(wt,(0,0),cut)
d.rectangle([0,P(0,199)[1],W*S,P(0,203)[1]],fill=(96,72,46,255))
# the plate: an iron tile seen from above at the board's angle
cx,cy=200,258;rw,rh=112,52
plate=[P(cx-rw,cy),P(cx,cy-rh),P(cx+rw,cy),P(cx,cy+rh)]
sh=Image.new('L',(W*S,H*S),0);ImageDraw.Draw(sh).polygon([P(cx-rw-10,cy+8),P(cx,cy-rh+6),P(cx+rw+10,cy+8),P(cx,cy+rh+14)],fill=150)
sc.paste(Image.new('RGBA',sc.size,(40,26,14,255)),(0,0),sh.filter(ImageFilter.GaussianBlur(14*S/4)))
d.polygon(plate,fill=(52,46,40,255),outline=(10,8,6,255),width=3*S)
inner=[P(cx-rw+12,cy),P(cx,cy-rh+6),P(cx+rw-12,cy),P(cx,cy+rh-6)]
d.polygon(inner,fill=(64,57,49,255),outline=(168,131,77,255),width=2*S)
for (rx,ry) in [(cx-rw+20,cy),(cx+rw-20,cy),(cx,cy-rh+12),(cx,cy+rh-12)]:
    d.ellipse([P(rx-3,ry-2),P(rx+3,ry+2)],fill=(176,140,84,255),outline=(20,14,8,255),width=S)
# seven slots: one in the middle, six around it (back row first)
slots=[(-62,-6,-46,98),(-40,-18,-28,112),(-20,-26,-12,122),(20,-26,12,122),(40,-18,28,112),(62,-6,46,98)]
slots=[(cx+dx,cy+dy,a,L) for dx,dy,a,L in slots]
centre=(cx,cy+2,0,150)
def slot(x,y):
    d.ellipse([P(x-11,y-4.2),P(x+11,y+4.2)],fill=(14,10,8,255),outline=(150,116,66,255),width=S)
def spear(x,y,ang,L):
    a=math.radians(ang);ux,uy=math.sin(a),-math.cos(a);px,py=-uy,ux
    hx,hy=x+ux*L,y+uy*L;bx,by=x+ux*(L-32),y+uy*(L-32)
    w=3.4
    shaft=[P(x+px*w,y+py*w),P(bx+px*w,by+py*w),P(bx-px*w,by-py*w),P(x-px*w,y-py*w)]
    d.polygon(shaft,fill=(74,66,58,255),outline=(8,6,4,255),width=int(1.6*S))
    d.line([P(x+px*0.9,y+py*0.9),P(bx+px*0.9,by+py*0.9)],fill=(150,138,122,255),width=S)
    # bronze socket
    sx2,sy2=bx-ux*1,by-uy*1
    d.polygon([P(sx2+px*3.6,sy2+py*3.6),P(sx2+ux*6+px*3.2,sy2+uy*6+py*3.2),P(sx2+ux*6-px*3.2,sy2+uy*6-py*3.2),P(sx2-px*3.6,sy2-py*3.6)],fill=(168,131,77,255),outline=(8,6,4,255),width=S)
    # leaf blade
    b0x,b0y=bx+ux*6,by+uy*6;mx,my=bx+ux*17,by+uy*17
    blade=[P(b0x,b0y),P(mx+px*8.2,my+py*6.5),P(hx,hy),P(mx-px*8.2,my-py*6.5)]
    d.polygon(blade,fill=(178,184,190,255),outline=(8,6,4,255),width=int(1.8*S))
    d.polygon([P(b0x,b0y),P(mx+px*8.2,my+py*6.5),P(hx,hy)],fill=(208,214,220,255))
    d.line([P(b0x,b0y),P(hx,hy)],fill=(96,102,110,255),width=S)
    d.line([P(mx+px*3,my+py*3),P(hx-ux*3+px*0.6,hy-uy*3+py*0.6)],fill=(245,248,250,255),width=S)
    return hx,hy
for x,y,a,L in slots: slot(x,y)
slot(centre[0],centre[1])
tips=[]
for x,y,a,L in sorted(slots,key=lambda s:s[1]): tips.append(spear(x,y,a,L))
ctip=spear(*centre)
# a little blood on the middle spear and the plate
for (bx,by,r) in [(ctip[0]-1,ctip[1]+14,2.6),(ctip[0]+2,ctip[1]+20,1.8),(cx+8,cy+10,3),(cx-14,cy+16,2.2),(cx+22,cy+4,1.6)]:
    d.ellipse([P(bx-r,by-r),P(bx+r,by+r*1.4)],fill=(128,22,14,255))
sc=sc.resize((W,H),Image.LANCZOS)
# ---------- put the scene under his frame ----------
out=np.array(base);s=np.array(sc);m=scene_mask
mm=cv2.GaussianBlur(m.astype(np.float32),(3,3),0)[:,:,None]
out=(out*(1-mm)+s*mm).astype(np.uint8);out[:,:,3]=np.array(base)[:,:,3]
img=np.ascontiguousarray(out[:,:,:3])
def comp(f,box,thr=90):
    a=np.array(Image.open(M+f).convert('RGB'));x,y,w,h=box;g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY);mk=(g<thr).astype(np.uint8)
    n,l,st,c=cv2.connectedComponentsWithStats(mk,8);best=None
    for i in range(1,n):
        sx,sy,sw,sh,ar=st[i]
        if abs(sx-x)<=2 and abs(sy-y)<=2 and abs(sw-w)<=2 and abs(sh-h)<=2: best=i
    out=((l==best).astype(np.uint8)*255)[y-1:y+h+1,x-1:x+w+1];return out
def rot(m,deg,scale=1.0):
    pad=10;mp=cv2.copyMakeBorder(m,pad,pad,pad,pad,cv2.BORDER_CONSTANT,0);c=(mp.shape[1]/2,mp.shape[0]/2)
    R=cv2.getRotationMatrix2D(c,deg,scale);r=cv2.warpAffine(mp,R,(mp.shape[1],mp.shape[0]),flags=cv2.INTER_CUBIC)
    ys,xs=np.where(r>60);return r[ys.min():ys.max()+1,xs.min():xs.max()+1]
def stamp(gm,cxp,cyp,ink,halo,hw):
    h,w=gm.shape;x0=int(round(cxp-w/2));y0=int(round(cyp-h/2));reg=img[y0:y0+h+2*hw,x0:x0+w+2*hw] if False else None
    big=cv2.copyMakeBorder(gm,hw,hw,hw,hw,cv2.BORDER_CONSTANT,0);H2,W2=big.shape;x0=int(round(cxp-W2/2));y0=int(round(cyp-H2/2));reg=img[y0:y0+H2,x0:x0+W2]
    if halo is not None:
        hm=cv2.GaussianBlur(cv2.dilate(big,np.ones((hw*2+1,hw*2+1),np.uint8)),(3,3),0).astype(np.float32)/255
        reg[:]=(reg*(1-hm[:,:,None])+np.array(halo)*hm[:,:,None]).astype(np.uint8)
    a=big.astype(np.float32)[:,:,None]/255;reg[:]=(reg*(1-a)+np.array(ink)*a).astype(np.uint8)
def wipe(x0,y0,x1,y1,thr=150,grow=3):
    g=cv2.cvtColor(img,cv2.COLOR_RGB2GRAY);mk=np.zeros(g.shape,np.uint8);mk[y0:y1,x0:x1]=(g[y0:y1,x0:x1]<thr).astype(np.uint8)*255
    return cv2.dilate(mk,np.ones((grow*2+1,grow*2+1),np.uint8))
# plaque: 1 -> 2
red=(162,51,41)
img=cv2.inpaint(img,wipe(165,62,184,94,175,2),5,cv2.INPAINT_TELEA)
two=rot(comp('key2.png',(108,302,22,26)),20.4,0.86)
stamp(two,174,77.5,(14,10,8),red,2)
# banner: the whole word re-set as SPIKES along the scroll's arc (centre (200,93), radius 237.5)
L={'S':comp('spiders.png',(157,318,13,19)),'P':comp('spiders.png',(172,320,15,19)),'I':comp('spiders.png',(189,322,4,19)),
   'E':comp('spiders.png',(212,320,15,20)),'S2':comp('spiders.png',(243,315,16,21)),'K':comp('key1.png',(245,314,18,21))}
srcx={'S':163.5,'P':179.5,'I':191,'E':219.5,'S2':251,'K':254}
phi=lambda x:math.degrees(math.asin((x-200)/237.5))
up={k:rot(v,-phi(srcx[k])) for k,v in L.items()}
light=(230,212,184)
img=cv2.inpaint(img,wipe(150,315,268,345,120,2),6,cv2.INPAINT_TELEA)
word=['S','P','I','K','E','S2'];gap=2.6;ws=[up[k].shape[1] for k in word];tot=sum(ws)+gap*(len(word)-1)
x=200-tot/2
for k,w in zip(word,ws):
    xc=x+w/2;a=phi(xc);R=237.5;cxp=200+R*math.sin(math.radians(a));cyp=93+R*math.cos(math.radians(a))
    stamp(rot(up[k],a),cxp,cyp,(10,8,6),light,2);x+=w+gap
res=np.dstack([img,out[:,:,3]])
Image.fromarray(res).save('spike_medallion.png')
print('red',red,'light',light)
# bake into the medallion sheet's 'spike' cell (index 17: row 2, column 1; 128 px cells) — run with BAKE=1
import os
if os.environ.get('BAKE')=='1':
    sheet=Image.open('../../../assets/rtok.webp').convert('RGBA');cell=Image.fromarray(res).resize((128,128),Image.LANCZOS)
    i=17;r,c=divmod(i,8);box=(c*128,r*128,c*128+128,r*128+128)
    sheet.paste(Image.new('RGBA',(128,128),(0,0,0,0)),box);sheet.alpha_composite(cell,(c*128,r*128))
    sheet.save('../../../assets/rtok.webp',quality=92,method=6);print('baked into rtok.webp cell',i)
