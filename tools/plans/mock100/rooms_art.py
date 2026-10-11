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
