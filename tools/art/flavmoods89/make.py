# Flavius's mood faces from his Mandata Flavi card back (tools/art/medallions/mandata_back.webp).
# Crop the bust at 4x, then per mood: warp brows/lids/mouth (gaussian displacement fields), paint open mouths,
# tears, a hand, a goblet in the card's cel style. Writes moods.png (contact sheet) and flavmood_<mood>.webp.
import cv2, numpy as np, sys, os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(os.path.join(HERE,'../../..'))
src=cv2.imread(os.path.join(ROOT,'tools/art/medallions/mandata_back.webp'))
PAD=30
X0,Y0,X1,Y1=330-PAD,296-PAD,510+PAD,436+PAD   # bust crop in card pixels (+PAD so turns never smear the edge)
K=4
base=cv2.resize(src[Y0:Y1,X0:X1],None,fx=K,fy=K,interpolation=cv2.INTER_LANCZOS4)
H,W=base.shape[:2]
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
P=lambda x,y:((x-X0+ (0))*1.0,(y-Y0)*1.0)
# landmarks in 4x crop coords of the (335,300) crop → shift to this crop
def C(x,y):return ((x-X0)*K,(y-Y0)*K)
L=lambda x,y:C(330+x/4,296+y/4)
EYE_R=C(412,366);EYE_N=C(391,360);BROW_R=C(414,355);BROW_RI=C(404,356);BROW_N=C(388,350);BROW_NI=C(396,353)
MOUTH=C(396,391);MC_L=C(388,390);MC_R=C(406,388);JAW=C(396,402);CHIN=C(394,404)
def warp(img,blobs):
  dx=np.zeros((H,W),np.float32);dy=np.zeros((H,W),np.float32)
  for (cx,cy),ddx,ddy,s in blobs:
    g=np.exp(-((xx-cx)**2+(yy-cy)**2)/(2*s*s));dx+=ddx*g;dy+=ddy*g
  return cv2.remap(img,xx-dx,yy-dy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT)
def rot(img,deg,c):
  M=cv2.getRotationMatrix2D(c,deg,1.0);return cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
INK=(14,10,12)
def mouth_open(img,w,h,teeth=True,tongue=True,dy=0):
  c=(int(MOUTH[0]),int(MOUTH[1]+dy))
  im=img.copy()
  cv2.ellipse(im,c,(w,h),0,0,360,(22,14,40),-1,cv2.LINE_AA)
  if tongue:cv2.ellipse(im,(c[0],c[1]+int(h*.55)),(int(w*.6),int(h*.45)),0,180,360,(60,50,150),-1,cv2.LINE_AA)
  if teeth:
    cv2.ellipse(im,(c[0],c[1]-int(h*.62)),(int(w*.82),int(h*.32)),0,0,180,(200,226,236),-1,cv2.LINE_AA)
  cv2.ellipse(im,c,(w,h),0,0,360,INK,5,cv2.LINE_AA)
  return im
def stroke(img,pts,col,th):
  im=img.copy();cv2.polylines(im,[np.array(pts,np.int32)],False,col,th,cv2.LINE_AA);return im
def tears(img):
  im=img.copy()
  for (ex,ey),s in ((EYE_R,1),(EYE_N,-1)):
    pts=np.array([(ex-4,ey+10),(ex-1,ey+34),(ex-6,ey+58),(ex-3,ey+80)],np.int32)
    ov=im.copy();cv2.polylines(ov,[pts],False,(210,190,160),7,cv2.LINE_AA);im=cv2.addWeighted(ov,.55,im,.45,0)
    cv2.polylines(im,[pts+[2,0]],False,(255,248,235),2,cv2.LINE_AA)
    cv2.ellipse(im,(int(ex-3),int(ey+86)),(5,7),0,0,360,(230,215,190),-1,cv2.LINE_AA);cv2.circle(im,(int(ex-1),int(ey+84)),2,(255,255,255),-1,cv2.LINE_AA)
  return im
def lids(img,frac=.55,near=False):
  im=img.copy()
  sx,sy=map(int,C(409,374));skin=tuple(int(v) for v in base[sy-6:sy+6,sx-6:sx+6].reshape(-1,3).mean(0))
  shade=tuple(int(v*.78) for v in skin)
  for (ex,ey),rw,rh in ((EYE_R,34,22),)[:]+(((EYE_N,16,12),) if near else ()):
    ov=np.zeros((H,W),np.uint8);cv2.ellipse(ov,(int(ex),int(ey-rh*.2)),(rw,int(rh*(.2+frac))),0,180,360,255,-1,cv2.LINE_AA)
    lid=np.full_like(im,skin);lid[int(ey-rh*.2-rh*(.2+frac)*.35):]=shade
    m=(cv2.GaussianBlur(ov,(0,0),1.5).astype(np.float32)/255)[...,None];im=(im*(1-m)+lid*m).astype(np.uint8)
    cv2.ellipse(im,(int(ex),int(ey-rh*.2)),(rw,int(rh*.35)),0,10,170,INK,4,cv2.LINE_AA)
  return im
def hand(img,rotd=None,at=None,flip=False):
  hs=src[492:590,196:296].copy();hs=cv2.resize(hs,None,fx=K,fy=K,interpolation=cv2.INTER_LANCZOS4)
  g=cv2.cvtColor(hs,cv2.COLOR_BGR2GRAY);m=(g>34).astype(np.uint8)*255
  m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8));n,lab,st,_=cv2.connectedComponentsWithStats(m)
  big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]);m=((lab==big)*255).astype(np.uint8)
  # keep the hand + forearm only (drop the robe at the right edge)
  m[:, int((286-196)*K):]=0
  hc=((225-196)*K,(562-492)*K)
  R=cv2.getRotationMatrix2D(hc,HAND_ROT if rotd is None else rotd,1.0);ex,ey=at or (EYE_R[0]-30,EYE_R[1]+4)
  R[0,2]+=ex-hc[0];R[1,2]+=ey-hc[1]
  hw=cv2.warpAffine(hs,R,(W,H),flags=cv2.INTER_CUBIC);mw=cv2.warpAffine(m,R,(W,H)).astype(np.float32)/255
  mw=cv2.GaussianBlur(mw,(0,0),1.2)[...,None]
  return (img*(1-mw)+hw*mw).astype(np.uint8)
def hand_old(img):
  # a weary hand over the eyes, palm in, fingers to the brow — cel-shaded like the card
  im=img.copy();ov=im.copy()
  base_pts=np.array([L(170,330),L(190,250),L(225,205),L(300,195),L(345,215),L(335,250),L(280,262),L(245,300),L(215,345)],np.int32)
  cv2.fillPoly(ov,[base_pts],(92,150,214),cv2.LINE_AA)
  sh=np.array([L(170,330),L(190,262),L(230,270),L(215,345)],np.int32);cv2.fillPoly(ov,[sh],(56,96,160),cv2.LINE_AA)
  cv2.polylines(ov,[base_pts],True,INK,7,cv2.LINE_AA)
  for a,b in ((L(235,212),L(268,250)),(L(262,203),L(290,245)),(L(292,198),L(312,240))):
    cv2.line(ov,(int(a[0]),int(a[1])),(int(b[0]),int(b[1])),INK,5,cv2.LINE_AA)
  return ov
def goblet(img):
  im=img.copy();x,y=int(W*.86),int(H*.30)
  cup=np.array([(x-46,y-60),(x+46,y-60),(x+30,y-6),(x+8,y+6),(x-8,y+6),(x-30,y-6)],np.int32)
  cv2.fillPoly(im,[cup],(60,160,210),cv2.LINE_AA);cv2.fillPoly(im,[np.array([(x-46,y-60),(x+46,y-60),(x+40,y-46),(x-40,y-46)],np.int32)],(40,30,140),cv2.LINE_AA)
  cv2.polylines(im,[cup],True,INK,6,cv2.LINE_AA)
  cv2.rectangle(im,(x-7,y+6),(x+7,y+60),(50,140,190),-1);cv2.rectangle(im,(x-7,y+6),(x+7,y+60),INK,5)
  cv2.ellipse(im,(x,y+64),(30,10),0,0,360,(50,140,190),-1,cv2.LINE_AA);cv2.ellipse(im,(x,y+64),(30,10),0,0,360,INK,5,cv2.LINE_AA)
  cv2.line(im,(x-26,y-50),(x-16,y-14),(170,230,250),5,cv2.LINE_AA)
  # fist holding the stem
  cv2.ellipse(im,(x,y+40),(26,30),0,0,360,(92,150,214),-1,cv2.LINE_AA);cv2.ellipse(im,(x,y+40),(26,30),0,0,360,INK,6,cv2.LINE_AA)
  for k in (-8,4,16):cv2.line(im,(x-22,y+40+k),(x+6,y+40+k),INK,3,cv2.LINE_AA)
  return im
def flush(img,col,amt):
  m=np.zeros((H,W),np.float32);cv2.ellipse(m,(int(MOUTH[0]+20),int(EYE_R[1]+40)),(140,170),0,0,360,1.0,-1);m=cv2.GaussianBlur(m,(0,0),30)[...,None]*amt
  lum=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY).astype(np.float32)/255;m=m*np.clip((lum[...,None]-.12)*3,0,1)
  return (img*(1-m)+np.array(col,np.float32)*m).astype(np.uint8)
B=lambda p,dx,dy,s:(p,dx,dy,s)
HAND_ROT=-111
def mood(m):
  im=base.copy()
  if m=='calm':return im
  if m=='angry':
    im=warp(im,[B(BROW_RI,-6,14,16),B(BROW_NI,8,14,16),B(BROW_R,0,6,24),B(MC_L,-2,8,12),B(MC_R,2,8,12),B(EYE_R,0,4,14)])
    return flush(im,(40,40,200),.28)
  if m=='shock':
    im=warp(im,[B(BROW_R,0,-18,28),B(BROW_N,0,-16,26),B(L(312,248),0,-8,10),B(L(222,238),0,-6,10),B(JAW,0,22,60)])
    return mouth_open(im,18,22,teeth=False,tongue=False,dy=8)
  if m=='laugh':
    im=warp(im,[B(L(312,268),0,-8,12),B(L(222,256),0,-6,10),B(MC_L,-6,-8,12),B(MC_R,6,-10,12),B(JAW,0,20,60)])
    im=mouth_open(im,32,22,dy=8);return rot(im,-7,(W/2,H*.9))
  if m=='cheer':
    im=warp(im,[B(BROW_R,0,-12,26),B(BROW_N,0,-12,24),B(MC_L,-4,-6,12),B(MC_R,4,-8,12),B(JAW,0,14,60)])
    im=mouth_open(im,26,18,dy=6);return hand(im,rotd=-96,at=(PAD*K+585,PAD*K+150))
  if m=='pleased':
    im=warp(im,[B(MC_L,-10,-22,16),B(MC_R,10,-24,16),B(C(410,375),0,-12,22),B(C(386,372),0,-10,18),B(C(412,368),0,-9,12),B(C(391,362),0,-6,10)])
    return flush(im,(80,110,200),.10)
  if m=='smug':
    im=warp(im,[B(MC_R,12,-24,16),B(C(408,380),0,-10,16),B(MC_L,0,4,10),B(BROW_R,0,-26,26),B(BROW_NI,6,10,16)])
    return rot(lids(im,.45),-5,(W/2,H*.75))
  if m=='bored':
    im=lids(warp(im,[B(MC_L,0,8,12),B(MC_R,0,10,12),B(BROW_R,0,8,22),B(BROW_N,0,6,18)]),.9,near=True);return rot(im,12,(W/2,H*.75))
  if m=='weep':
    im=warp(im,[B(BROW_RI,0,-12,14),B(BROW_NI,0,-12,14),B(BROW_R,0,4,16),B(MC_L,-2,8,12),B(MC_R,2,8,12)])
    return tears(flush(im,(90,90,200),.12))
  if m=='facepalm':
    im=lids(warp(im,[B(MC_L,0,6,10),B(MC_R,0,6,10)]),.95);return hand(rot(im,8,(W/2,H*.9)))
MOODS=['calm','pleased','smug','cheer','laugh','shock','angry','bored','weep','facepalm']
out=os.path.join(HERE,'out');os.makedirs(out,exist_ok=True)
tiles=[]
for m in MOODS:
  im=mood(m)[PAD*K:-PAD*K,PAD*K:-PAD*K];h0,w0=im.shape[:2];sm=cv2.resize(im,(312,int(312*h0/w0)),interpolation=cv2.INTER_AREA)
  cv2.imwrite(os.path.join(out,f'flavmood_{m}.png'),sm)
  t=cv2.resize(im,(340,int(340*h0/w0)),interpolation=cv2.INTER_AREA);t=cv2.copyMakeBorder(t,4,30,4,4,cv2.BORDER_CONSTANT,value=(40,30,25))
  cv2.putText(t,m,(10,t.shape[0]-9),cv2.FONT_HERSHEY_SIMPLEX,.7,(170,220,240),2,cv2.LINE_AA);tiles.append(t)
rows=[np.hstack(tiles[i:i+5]) for i in (0,5)]
cv2.imwrite(sys.argv[1] if len(sys.argv)>1 else os.path.join(out,'moods.png'),np.vstack(rows))
