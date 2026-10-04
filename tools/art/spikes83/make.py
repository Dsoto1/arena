# Floor Spikes medallion (v0.83, Virgilante): his Spiders medallion's frame, plaque and scroll; inside, no scene — a round iron
# sewer cap dusted with sand, seven slots, iron spikes coming up out of them (six angling out and up, one straight up in the
# middle), lit like the board's spikes (130-v82vis SPIKE82). Plaque "2 DMG" (his 2 from 2x ARENA KEYS), scroll "FLOOR SPIKE"
# set from his own lettering (O, L: CROCODILE · R: WATER TILE · S, P, I, E: SPIDERS · K: ARENA KEY · F = his L turned over + a bar).
# Run here: python3 masks.py && python3 make.py   (BAKE=1 also writes the 'spike' cell of assets/rtok.webp)
import math, os, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
M='../medallions/'
base=Image.open(M+'spiders.png').convert('RGBA')
W=H=400;S=4
scene_mask=np.load('scene_mask.npy')
P=lambda x,y:(x*S,y*S)
rng=np.random.default_rng(83)
# ---------- sand ----------
yy=np.arange(H*S)[:,None]/S;t=np.clip((yy-60)/300,0,1)
top=np.array([214,186,134]);bot=np.array([186,150,100])
sand=(top*(1-t)+bot*t)[:,None,:]*np.ones((1,W*S,1))+rng.normal(0,8,(H*S,W*S,1))
sand=np.dstack([np.clip(sand,0,255),np.full((H*S,W*S),255)]).astype(np.uint8)
sc=Image.fromarray(sand);d=ImageDraw.Draw(sc)
for _ in range(260):  # pebbles and darker grains
    x,y=rng.uniform(40,360),rng.uniform(50,360);r=rng.uniform(0.6,1.8)
    c=tuple(int(v) for v in rng.choice([[150,116,74],[124,94,58],[230,206,160]]))
    d.ellipse([P(x-r,y-r*0.7),P(x+r,y+r*0.7)],fill=c+(255,))
# ---------- the cap ----------
cx,cy=200,236;RX,RY=118,70
sh=Image.new('L',sc.size,0);ImageDraw.Draw(sh).ellipse([P(cx-RX-8,cy-RY+2),P(cx+RX+8,cy+RY+14)],fill=170)
sc.paste(Image.new('RGBA',sc.size,(52,34,18,255)),(0,0),sh.filter(ImageFilter.GaussianBlur(8*S)))
d=ImageDraw.Draw(sc)
E=lambda rx,ry,dy=0:[P(cx-rx,cy-ry+dy),P(cx+rx,cy+ry+dy)]
d.ellipse(E(RX,RY,6),fill=(30,24,19,255))                       # the rim's thickness
d.ellipse(E(RX,RY),fill=(92,80,68,255),outline=(10,8,6,255),width=int(2*S))
d.ellipse(E(RX-9,RY-6),fill=(58,50,43,255),outline=(14,11,8,255),width=int(1.4*S))
# bronze bevel on the far rim (the light)
d.arc(E(RX-3,RY-2),200,340,fill=(168,131,77,255),width=int(2*S))
# radial ribs and the inner ring
for k in range(16):
    a=math.radians(k*22.5);x0,y0=cx+math.cos(a)*(RX-12)*0.66,cy+math.sin(a)*(RY-8)*0.66;x1,y1=cx+math.cos(a)*(RX-12),cy+math.sin(a)*(RY-8)
    d.line([P(x0,y0),P(x1,y1)],fill=(30,25,20,255),width=int(2.2*S));d.line([P(x0,y0-0.8),P(x1,y1-0.8)],fill=(112,98,82,255),width=int(0.8*S))
d.ellipse(E(70,41),outline=(20,16,12,255),width=int(2.4*S));d.arc(E(70,41,-1),200,340,fill=(150,118,70,255),width=int(1.2*S))
d.ellipse(E(68,39),fill=(66,57,48,255))
for k in range(12):   # bolts round the rim
    a=math.radians(k*30+15);x,y=cx+math.cos(a)*(RX-5),cy+math.sin(a)*(RY-3.5)
    d.ellipse([P(x-2.4,y-1.7),P(x+2.4,y+1.7)],fill=(168,131,77,255),outline=(10,8,6,255),width=S)
# seven slots: the middle one and six round it
slots={'c':(cx,cy,0,104),'L':(cx-62,cy-2,-62,78),'R':(cx+62,cy-2,62,78),'BL':(cx-34,cy-26,-30,86),'BR':(cx+34,cy-26,30,86),
       'FL':(cx-36,cy+24,-44,80),'FR':(cx+36,cy+24,44,80)}
for k,(x,y,a,L) in slots.items():
    d.ellipse([P(x-9,y-4.6),P(x+9,y+4.6)],fill=(8,6,5,255),outline=(150,118,70,255),width=S)
# sand blown over the cap: drifts at the edges and dust in the grooves
dust=Image.new('L',sc.size,0);dd=ImageDraw.Draw(dust)
for _ in range(520):
    a=rng.uniform(0,2*math.pi);rr=math.sqrt(rng.uniform(0.15,1.0))
    if rng.random()<0.55: rr=rng.uniform(0.82,1.0)
    x,y=cx+math.cos(a)*RX*rr,cy+math.sin(a)*RY*rr;r=rng.uniform(0.4,1.5)
    dd.ellipse([P(x-r,y-r*0.6),P(x+r,y+r*0.6)],fill=int(rng.uniform(170,255)))
for (x,y,rx,ry) in [(cx-92,cy+30,20,6),(cx+86,cy+34,22,6),(cx+22,cy+56,26,5)]:
    dd.ellipse([P(x-rx,y-ry),P(x+rx,y+ry)],fill=210)
dust=dust.filter(ImageFilter.GaussianBlur(0.35*S))
capm=Image.new('L',sc.size,0);ImageDraw.Draw(capm).ellipse(E(RX+6,RY+5,2),fill=255)
dust=Image.fromarray((np.array(dust).astype(float)*np.array(capm)/255).astype(np.uint8))
sc.paste(Image.new('RGBA',sc.size,(222,194,140,255)),(0,0),dust)
d=ImageDraw.Draw(sc)
# ---------- the spikes ----------
def spike(x,y,ang,L):
    a=math.radians(ang);ux,uy=math.sin(a),-math.cos(a);px,py=-uy,ux
    tx,ty=x+ux*L,y+uy*L;bw=9.0
    lft=[P(x-px*bw,y-py*bw),P(tx,ty),P(x,y)];rgt=[P(x,y),P(tx,ty),P(x+px*bw,y+py*bw)]
    lit_left=ang>0   # the light comes from the upper left: spikes leaning right show their left flank lit
    d.polygon(lft,fill=(190,148,84,255) if lit_left else (40,33,27,255));d.polygon(rgt,fill=(40,33,27,255) if lit_left else (190,148,84,255))
    # a hot edge near the tip
    hx,hy=x+ux*L*0.62,y+uy*L*0.62;side=-1 if lit_left else 1
    d.polygon([P(hx+side*px*bw*0.38,hy+side*py*bw*0.38),P(tx,ty),P(hx,hy)],fill=(244,218,160,255))
    d.line([P(x,y),P(tx,ty)],fill=(18,14,10,255),width=int(0.9*S))
    d.polygon([P(x-px*bw,y-py*bw),P(tx,ty),P(x+px*bw,y+py*bw)],outline=(8,6,4,255),width=int(1.7*S))
    d.ellipse([P(x-bw-1,y-3.4),P(x+bw+1,y+3.4)],outline=(8,6,4,255),width=int(1.2*S))
order=['BL','BR','L','R','c','FL','FR']
for k in order: spike(*slots[k])
sc=sc.resize((W,H),Image.LANCZOS)
# ---------- under his frame ----------
out=np.array(base);s=np.array(sc);mm=cv2.GaussianBlur(scene_mask.astype(np.float32),(3,3),0)[:,:,None]
out=(out*(1-mm)+s*mm).astype(np.uint8);out[:,:,3]=np.array(base)[:,:,3]
img=np.ascontiguousarray(out[:,:,:3])
def comp(f,box,thr=90):
    a=np.array(Image.open(M+f).convert('RGB').resize((W,H)));x,y,w,h=box;g=cv2.cvtColor(a,cv2.COLOR_RGB2GRAY);mk=(g<thr).astype(np.uint8)
    n,l,st,c=cv2.connectedComponentsWithStats(mk,8);best=None
    for i in range(1,n):
        sx,sy,sw,sh2,ar=st[i]
        if abs(sx-x)<=2 and abs(sy-y)<=2 and abs(sw-w)<=2 and abs(sh2-h)<=2: best=i
    return ((l==best).astype(np.uint8)*255)[y-1:y+h+1,x-1:x+w+1]
def rot(m,deg,scale=1.0):
    pad=10;mp=cv2.copyMakeBorder(m,pad,pad,pad,pad,cv2.BORDER_CONSTANT,0);c=(mp.shape[1]/2,mp.shape[0]/2)
    R=cv2.getRotationMatrix2D(c,deg,scale);r=cv2.warpAffine(mp,R,(mp.shape[1],mp.shape[0]),flags=cv2.INTER_CUBIC)
    ys,xs=np.where(r>60);return r[ys.min():ys.max()+1,xs.min():xs.max()+1]
def stamp(gm,cxp,cyp,ink,halo,hw):
    big=cv2.copyMakeBorder(gm,hw,hw,hw,hw,cv2.BORDER_CONSTANT,0);H2,W2=big.shape;x0=int(round(cxp-W2/2));y0=int(round(cyp-H2/2));reg=img[y0:y0+H2,x0:x0+W2]
    if halo is not None:
        hm=cv2.GaussianBlur(cv2.dilate(big,np.ones((hw*2+1,hw*2+1),np.uint8)),(3,3),0).astype(np.float32)/255
        reg[:]=(reg*(1-hm[:,:,None])+np.array(halo)*hm[:,:,None]).astype(np.uint8)
    a=big.astype(np.float32)[:,:,None]/255;reg[:]=(reg*(1-a)+np.array(ink)*a).astype(np.uint8)
def wipe(x0,y0,x1,y1,thr=150,grow=3):
    g=cv2.cvtColor(img,cv2.COLOR_RGB2GRAY);mk=np.zeros(g.shape,np.uint8);mk[y0:y1,x0:x1]=(g[y0:y1,x0:x1]<thr).astype(np.uint8)*255
    return cv2.dilate(mk,np.ones((grow*2+1,grow*2+1),np.uint8))
# plaque: 1 -> 2
img=cv2.inpaint(img,wipe(165,62,184,94,175,2),5,cv2.INPAINT_TELEA)
stamp(rot(comp('key2.png',(108,302,22,26)),20.4,0.86),174,77.5,(14,10,8),(162,51,41),2)
# scroll: FLOOR SPIKE
phi=lambda x:math.degrees(math.asin((x-200)/237.5))
src={'S':('spiders.png',(157,318,13,19),163.5),'P':('spiders.png',(172,320,15,19),179.5),'I':('spiders.png',(189,322,4,19),191),
     'E':('spiders.png',(212,320,15,20),219.5),'K':('key1.png',(245,314,18,21),254),'O':('crocodile.png',(204,321,20,20),214),
     'L':('crocodile.png',(249,316,16,19),257),'R':('water.png',(205,322,15,19),212.5)}
up={k:rot(comp(f,b),-phi(x)) for k,(f,b,x) in src.items()}
Fm=np.ascontiguousarray(up['L'][::-1]).copy();h,w=Fm.shape   # his L turned over (stem + top bar) ...
yb=int(h*0.50);row=np.where(Fm[yb]>128)[0];sx=int(row.max()) if len(row) else int(w*0.3);th=max(2,int(round(h*0.17)))
cv2.rectangle(Fm,(sx-1,yb-th//2),(int(w*0.74),yb+th-th//2),255,-1);up['F']=Fm   # ... and a middle bar = F
img=cv2.inpaint(img,wipe(150,315,268,345,120,2),6,cv2.INPAINT_TELEA)
word=list('FLOOR')+[' ']+list('SPIKE');sc_=0.84;gap=2.2;spw=6
gl={k:(cv2.resize(v,(max(1,int(v.shape[1]*sc_)),max(1,int(v.shape[0]*sc_))),interpolation=cv2.INTER_AREA) if k!=' ' else None) for k,v in up.items()}
ws=[spw if k==' ' else gl[k].shape[1] for k in word];tot=sum(ws)+gap*(len(word)-1);x=200-tot/2
for k,w in zip(word,ws):
    if k!=' ':
        xc=x+w/2;a=phi(xc);R=236.5;stamp(rot(gl[k],a),200+R*math.sin(math.radians(a)),93+R*math.cos(math.radians(a)),(10,8,6),(230,212,184),2)
    x+=w+gap
res=np.dstack([img,out[:,:,3]])
Image.fromarray(res).save('spike_medallion.png')
if os.environ.get('BAKE')=='1':
    sheet=Image.open('../../../assets/rtok.webp').convert('RGBA');cell=Image.fromarray(res).resize((128,128),Image.LANCZOS)
    i=17;r,c=divmod(i,8);sheet.paste(Image.new('RGBA',(128,128),(0,0,0,0)),(c*128,r*128,c*128+128,r*128+128));sheet.alpha_composite(cell,(c*128,r*128))
    sheet.save('../../../assets/rtok.webp',quality=92,method=6);print('baked into rtok.webp cell',i)
