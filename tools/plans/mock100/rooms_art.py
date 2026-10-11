# python3 tools/plans/mock100/rooms_art.py — the MARBLE statue (assets/avatar.png → white marble with veins) and the Doctore's BRONZE head (his face99 council face → cast bronze)
from PIL import Image, ImageFilter, ImageOps, ImageChops
import numpy as np, os
H=os.path.dirname(os.path.abspath(__file__));A=os.path.join(H,'../../../assets/avatar.png');D=os.path.join(H,'img3')
rng=np.random.default_rng(7)
def noise(w,h,sc,seed):
  r=np.random.default_rng(seed).random((h//sc+2,w//sc+2)).astype(np.float32)
  return np.array(Image.fromarray((r*255).astype(np.uint8)).resize((w,h),Image.BICUBIC)).astype(np.float32)/255
# --- marble
im=Image.open(A).convert('RGBA');w,h=im.size;a=np.array(im).astype(np.float32)/255
L=(0.3*a[...,0]+0.59*a[...,1]+0.11*a[...,2])
L=np.array(Image.fromarray((L*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)/255
form=0.55+0.5*np.clip((L-L[a[...,3]>.5].mean())*1.6+0.5,0,1)  # keep the sculpted form
v=noise(w,h,60,3)*0.7+noise(w,h,22,5)*0.3;vein=np.clip(1-np.abs(np.sin((v*9+np.linspace(0,3,w)[None,:])*3.1))*1.0,0,1)**10
base=np.stack([0.95,0.93,0.89]);col=form[...,None]*base[None,None,:]-vein[...,None]*np.array([.12,.12,.11])
edge=np.array(Image.fromarray((a[...,3]*255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES)).astype(np.float32)/255
col=col*(1-0.35*edge[...,None])
out=np.dstack([np.clip(col,0,1),a[...,3]]);Image.fromarray((out*255).astype(np.uint8)).save(os.path.join(D,'r4_marble.png'))
# --- bronze head from the Doctore's painted face
f=Image.open(os.path.join(D,'r3_c_doctore.png')).convert('RGBA');fw,fh=f.size;fa=np.array(f).astype(np.float32)/255
l=(0.3*fa[...,0]+0.59*fa[...,1]+0.11*fa[...,2]);em=np.array(f.convert('L').filter(ImageFilter.EMBOSS)).astype(np.float32)/255
t=np.clip(l*0.8+(em-0.5)*0.9+0.1,0,1)
stops=[(0,(40,22,10)),(0.35,(110,62,26)),(0.65,(176,112,48)),(0.85,(226,170,96)),(1,(255,226,160))]
def ramp(x):
  o=np.zeros(x.shape+(3,),np.float32)
  for (p0,c0),(p1,c1) in zip(stops,stops[1:]):
    m=(x>=p0)&(x<=p1);k=((x-p0)/(p1-p0))[m][:,None];o[m]=np.array(c0)*(1-k)+np.array(c1)*k
  return o/255
c=ramp(t);pat=(t<0.3)[...,None]*np.array([-.05,.12,.06])*(noise(fw,fh,6,11)[...,None]);c=np.clip(c+pat,0,1)
yy,xx=np.mgrid[0:fh,0:fw];r=np.hypot(xx-fw/2,yy-fh/2)/(fw/2);alpha=(r<0.98).astype(np.float32)
Image.fromarray((np.dstack([c,alpha])*255).astype(np.uint8)).save(os.path.join(D,'r4_doctore_bronze.png'))
print('ok')
# --- round 4b/4c: the LOST LEFT ARM from the statue's own pixels (body's left = image right), broken like an antique marble.
from PIL import ImageDraw
mk=np.array(Image.open(A))[...,3]>200;Hh,Ww=mk.shape;yy,xx=np.mgrid[0:Hh,0:Ww]
p1=np.array([243.4,248.6]);p2=np.array([253.7,145.2])        # SEV92 shoulder cut (x,y) ×2.4
def linex(y):return p1[0]+(p2[0]-p1[0])*(y-p1[1])/(p2[1]-p1[1])
rr=np.random.default_rng(11)
jag=np.zeros(Hh);y=0;v=0.0
while y<Hh:                                                     # chipped edge: uneven steps 2-7 px, offsets -6..7
  L=int(rr.integers(2,8));v=float(np.clip(v+rr.normal(0,3.2),-6,7));jag[y:y+L]=v+np.linspace(0,rr.normal(0,1.5),L)[:max(0,min(L,Hh-y))];y+=L
LX=np.array([linex(t) for t in range(Hh)]);side=xx-LX[yy]
arm=mk&(((yy<=262)&(side>jag[yy]))|((yy>262)&(xx>=259)))&(yy>=120)
ma=np.array(Image.open(os.path.join(D,'r4_marble.png'))).astype(np.float32)
near=np.array(Image.fromarray((arm*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))>0
body=mk&~arm
ma[near&~mk,3]*=0.6
# the fracture face: a band on the body side of the break — darker granular core, lit top facets, a bright lip at the very edge
d=jag[yy]-side                                                  # >0 inside the body, distance from the break
brk=body&(yy>=142)&(yy<=262)&(d>=0)&(d<9)
gr=noise(Ww,Hh,2,21)
core=np.array([148,141,132])+(gr[...,None]-.5)*60
w_=np.clip(1-d/9,0,1)[...,None]
ma[brk,:3]=(ma[...,:3]*(1-w_*0.75)+core*w_*0.75)[brk]
dj=np.gradient(jag)[yy]                                         # facets facing up-left (the light) catch it
lit=brk&(d<3.2)&(dj< -0.2)
ma[lit,:3]=np.array([252,249,240])
lip=brk&(d<1.4)&~lit;ma[lip,:3]=ma[lip,:3]*0.55+np.array([60,55,50])*0.45
im2=Image.fromarray(np.clip(ma,0,255).astype(np.uint8));dr=ImageDraw.Draw(im2)
for k in range(5):                                              # fine cracks running into the shoulder
  y0=float(rr.uniform(150,255));x0=linex(y0)+jag[int(y0)]-2;pts=[(x0,y0)]
  for _ in range(int(rr.integers(4,8))):x0-=float(rr.uniform(4,9));y0+=float(rr.normal(0,3.5));pts.append((x0,y0))
  dr.line(pts,fill=(96,90,84,255),width=1)
for k in range(3):                                              # small chips knocked off the edge
  y0=float(rr.uniform(150,250));x0=linex(y0)+jag[int(y0)];r=float(rr.uniform(2,4))
  dr.polygon([(x0+1,y0-r),(x0-r*1.4,y0),(x0+1,y0+r)],fill=(0,0,0,0))
ma=np.array(im2).astype(np.float32)
# the missing arm: a pale, faint "was here" — light marble-white at low alpha, no dark interior
ma[arm,:3]=np.array([244,240,228]);ma[arm,3]=22
er=arm.copy();acc=np.zeros(arm.shape,np.float32)                 # a soft pale inner rim, fading inward
for k in range(6):
  er=np.array(Image.fromarray((er*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)))>0;acc+=er
rimw=np.clip(1-acc/6,0,1);ma[arm,3]=84+60*rimw[arm]**2
Image.fromarray(np.clip(ma,0,255).astype(np.uint8)).save(os.path.join(D,'r4_marble_lost.png'))
am=Image.fromarray((arm*255).astype(np.uint8));ed=np.array(am.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3)))>0
dash=((xx+yy)//7)%2==0
g=np.zeros((Hh,Ww,4),np.uint8);g[ed&dash&~body]=(246,234,196,215)     # pale-gold dashed outline
Image.fromarray(g).save(os.path.join(D,'r4_ghost_larm.png'));print('lost arm ok',int(arm.sum()))
