"""v0.92 severed-part outlines: traces assets/avatar.png's silhouette and cuts it at the neck, shoulders, waist and between the
legs into the six locations; prints SEV92 (SVG path per location + its cut segments, in avatarSVG's viewBox 0 0 150 332, the
image at x=7 y=6 w=136 h=301). Run: python3 tools/art/sev92.py > /tmp/sev92.js"""
import json,sys
import numpy as np,cv2
from PIL import Image
A=np.array(Image.open(sys.argv[1] if len(sys.argv)>1 else 'assets/avatar.png'))
H,W=A.shape[:2]
m=(A[:,:,3]>200).astype(np.uint8)*255
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
cnts,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);m=np.zeros_like(m);cv2.drawContours(m,cnts,-1,255,-1)
CX=W/2;NECK=125;WAIST=418
SH_L=((110,258),(98,138))           # image-left = the body's RIGHT arm: armpit -> shoulder top
SH_R=((W-110,258),(W-98,138))
def side(p,a,b):return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])
yy,xx=np.mgrid[0:H,0:W]
def outer(a,b):  # pixels on the far side (away from the centre) of the line a-b, extended
  s=(b[0]-a[0])*(yy-a[1])-(b[1]-a[1])*(xx-a[0]);sc=side((CX,300),a,b);return (s*sc<0)
armR=outer(*SH_L)&(yy<=278)&(xx<CX)&(yy>NECK)
armL=outer(*SH_R)&(yy<=278)&(xx>CX)&(yy>NECK)
# arms hang free below the armpit: everything left/right of the torso gap below y 258 belongs to the arm
lab,cc=cv2.connectedComponents(((m>0)&(yy>278)).astype(np.uint8))
for k in range(1,lab):
  r=(cc==k);ys,xs=np.where(r)
  if ys.min()<WAIST-40 and xs.max()<CX-40:armR|=r
  if ys.min()<WAIST-40 and xs.min()>CX+40:armL|=r
body=m>0
reg={'head':body&(yy<NECK),'rarm':body&armR,'larm':body&armL}
rest=body&~reg['rarm']&~reg['larm']&(yy>=NECK)
reg['chest']=rest&(yy<WAIST);reg['rleg']=rest&(yy>=WAIST)&(xx<CX);reg['lleg']=rest&(yy>=WAIST)&(xx>=CX)
sx,sy=136/W,301/H
P=lambda x,y:(round(7+x*sx,1),round(6+y*sy,1))
out={}
for k,r in reg.items():
  mk=cv2.morphologyEx(r.astype(np.uint8)*255,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
  cs,_=cv2.findContours(mk,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);cs=[c for c in cs if cv2.contourArea(c)>150]
  d=''
  for c in cs:
    c=cv2.approxPolyDP(c,1.6,True)[:,0,:];pts=[P(x,y) for x,y in c]
    d+='M'+' '.join(f'{x} {y}' for x,y in pts)+'Z'
  out[k]={'d':d}
def seg(a,b):  # the cut line clipped to the silhouette
  n=400;ok=[];
  for i in range(n+1):
    x=a[0]+(b[0]-a[0])*i/n;y=a[1]+(b[1]-a[1])*i/n
    if 0<=int(y)<H and 0<=int(x)<W and m[int(y),int(x)]:ok.append((x,y))
  return [P(*ok[0]),P(*ok[-1])] if ok else None
row=lambda y:seg((0,y),(W-1,y))
cuts={'head':[row(NECK)],'rarm':[seg(SH_L[0],(SH_L[1][0]-(SH_L[0][0]-SH_L[1][0])*0.15,SH_L[1][1]-(SH_L[0][1]-SH_L[1][1])*0.15))],
      'larm':[seg(SH_R[0],(SH_R[1][0]-(SH_R[0][0]-SH_R[1][0])*0.15,SH_R[1][1]-(SH_R[0][1]-SH_R[1][1])*0.15))],
      'rleg':[seg((0,WAIST),(CX,WAIST)),seg((CX,WAIST),(CX,WAIST+60))],'lleg':[seg((CX,WAIST),(W-1,WAIST)),seg((CX,WAIST),(CX,WAIST+60))]}
wst=seg((CX-95,WAIST),(CX+95,WAIST));cuts['rleg'][0]=seg((CX-95,WAIST),(CX,WAIST));cuts['lleg'][0]=seg((CX,WAIST),(CX+95,WAIST))
cuts['chest']=[row(NECK),cuts['rarm'][0],cuts['larm'][0],wst]
for k in out:out[k]['cut']=[c for c in cuts[k] if c]
print('const SEV92='+json.dumps(out,separators=(',',':'))+';')
