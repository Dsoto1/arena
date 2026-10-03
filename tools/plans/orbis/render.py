import json, numpy as np, cv2, sys
d=json.load(open('land.json')); W,H=d['W'],d['H']
rng=np.random.default_rng(7)
def noise(scale,amp=1.0):
    n=rng.standard_normal((H//scale+2,W//scale+2)).astype(np.float32)
    n=cv2.resize(n,(W,H),interpolation=cv2.INTER_CUBIC); return n*amp
# land mask (outer rings filled, holes cleared)
m=np.zeros((H,W),np.uint8)
for rings in d['polys']:
    cv2.fillPoly(m,[np.array(rings[0],np.float32).round().astype(np.int32)],255,lineType=cv2.LINE_AA)
for rings in d['polys']:
    for h in rings[1:]: cv2.fillPoly(m,[np.array(h,np.float32).round().astype(np.int32)],0,lineType=cv2.LINE_AA)
# hand-drawn wobble on the coast
mf=cv2.GaussianBlur(m.astype(np.float32)/255,(0,0),1.6)+noise(6,0.10)+noise(2,0.05)
land=(mf>0.5).astype(np.uint8)
dl=cv2.distanceTransform(land,cv2.DIST_L2,5); ds=cv2.distanceTransform(1-land,cv2.DIST_L2,5)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
P=10.0  # halftone pitch (px at 2400 wide)
row=np.floor(yy/P); gx=((xx+(row%2)*P/2)%P)-P/2; gy=(yy%P)-P/2; gd=np.sqrt(gx*gx+gy*gy)
def col(c): return np.array(c,np.float32)
TAN,ORANGE,CREAM=col((199,179,146)),col((219,124,94)),col((236,196,160))
SEA,DEEP,INK=col((90,170,223)),col((48,118,186)),col((14,10,8))
img=np.empty((H,W,3),np.float32)
# sea: darker halftone dots near the coast, shrinking outward
BS=40.0; s=np.clip(ds/BS,0,1); rs=(1-s)**1.1*P*0.62
seaDot=(gd<rs)&(land==0)
img[:]=SEA
img[seaDot]=DEEP
# land: orange halftone band near the coast fading into parchment
BL=32.0; t=np.clip(dl/BL,0,1); rl=(1-t)**0.55*P*0.70
landDot=(gd<rl)&(land==1)
L=land==1
img[L]=TAN; img[landDot]=ORANGE
# light dots inside the solid orange near the shore (his cream speckle)
cream=L&(dl<BL*0.55)&(gd<P*0.16)
img[cream]=CREAM
# parchment / water mottling
texL=1+noise(40,0.04)+noise(9,0.02)+noise(1,0.03)
texS=1+noise(60,0.015)+noise(1,0.012)
img[L]*=texL[L][...,None]
img[~L]*=texS[~L][...,None]
# ink outline
ink=L&(dl<4.2+np.clip(noise(5,0.6),-0.6,0.9))
img[ink]=INK
# frame
img[:4,:]=INK; img[-4:,:]=INK; img[:,:4]=INK; img[:,-4:]=INK
out=np.clip(img,0,255).astype(np.uint8)[...,::-1]
cv2.imwrite('world_2400.png',out)
small=cv2.resize(out,(1200,int(H*1200/W)),interpolation=cv2.INTER_AREA)
cv2.imwrite('world_1200.webp',small,[cv2.IMWRITE_WEBP_QUALITY,82]); cv2.imwrite('world_1200.png',small)
print(out.shape)
