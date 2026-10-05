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
base[:max(0,(300-Y0)*K)]=0   # never the logo above his head
H,W=base.shape[:2]
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
P=lambda x,y:((x-X0+ (0))*1.0,(y-Y0)*1.0)
# landmarks in 4x crop coords of the (335,300) crop → shift to this crop
def C(x,y):return ((x-X0)*K,(y-Y0)*K)
L=lambda x,y:C(330+x/4,296+y/4)
# landmarks from his marks on the card (2026-10-05): eyes (391,360) + (410,359), mouth line (390,390)-(397,387)-(406,390)
EYE_R=C(410,359);EYE_N=C(391,360);BROW_R=C(411,354);BROW_RI=C(403,354);BROW_N=C(389,355);BROW_NI=C(396,355)
MOUTH=C(397,390);MC_L=C(390,390);MC_R=C(406,390);JAW=C(397,401);CHIN=C(395,404)
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
  for (ex,ey),s in ((EYE_R,1),):
    pts=np.array([(ex-4,ey+10),(ex-1,ey+34),(ex-6,ey+58),(ex-3,ey+80)],np.int32)
    ov=im.copy();cv2.polylines(ov,[pts],False,(210,190,160),7,cv2.LINE_AA);im=cv2.addWeighted(ov,.55,im,.45,0)
    cv2.polylines(im,[pts+[2,0]],False,(255,248,235),2,cv2.LINE_AA)
    cv2.ellipse(im,(int(ex-3),int(ey+86)),(5,7),0,0,360,(230,215,190),-1,cv2.LINE_AA);cv2.circle(im,(int(ex-1),int(ey+84)),2,(255,255,255),-1,cv2.LINE_AA)
  return im
def lids(img,frac=.55,near=False):
  # heavy lids by moving his own painted brow/upper lid down onto the eye (no painted patches)
  bl=[B(C(410,355),0,20*frac,10),B(C(404,355),0,15*frac,8),B(C(416,356),0,15*frac,8),B(C(410,363),0,-6*frac,8)]
  if near:bl+=[B(C(391,357),0,12*frac,8)]
  return warp(img,bl)
def hand(img,rotd=None,at=None,flip=False,nofist=False):
  hs=src[492:590,196:296].copy();hs=cv2.resize(hs,None,fx=K,fy=K,interpolation=cv2.INTER_LANCZOS4)
  g=cv2.cvtColor(hs,cv2.COLOR_BGR2GRAY);m=(g>34).astype(np.uint8)*255
  m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8));n,lab,st,_=cv2.connectedComponentsWithStats(m)
  big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]);m=((lab==big)*255).astype(np.uint8)
  # keep the hand + forearm only (drop the robe at the right edge)
  m[:, int((286-196)*K):]=0
  hc=((225-196)*K,(562-492)*K)
  if nofist:   # forearm only, pivot at the wrist
    m[int((540-492)*K):,:]=0;m[:,:int((236-196)*K)]=0;hc=((246-196)*K,(540-492)*K)
  R=cv2.getRotationMatrix2D(hc,HAND_ROT if rotd is None else rotd,1.0);ex,ey=at or (EYE_R[0]-30,EYE_R[1]+4)
  R[0,2]+=ex-hc[0];R[1,2]+=ey-hc[1]
  hw=cv2.warpAffine(hs,R,(W,H),flags=cv2.INTER_CUBIC);mw=cv2.warpAffine(m,R,(W,H)).astype(np.float32)/255
  mw=cv2.GaussianBlur(mw,(0,0),1.2)[...,None]
  return (img*(1-mw)+hw*mw).astype(np.uint8)
def palm_up(img,at=(70,300),sc=1.25,deg=-12):
  # his LEFT hand draped over the chair arm, turned upside down = an open, palm-up "what was THAT?" hand (after Picard's)
  c=cv2.resize(src[540:620,540:620],None,fx=5,fy=5,interpolation=cv2.INTER_CUBIC);hsv=cv2.cvtColor(c,cv2.COLOR_BGR2HSV)
  m=((hsv[...,0]>=12)&(hsv[...,0]<32)&(hsv[...,2]>60)).astype(np.uint8)*255;m[:,:95]=0
  m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8));n,l,st,_=cv2.connectedComponentsWithStats(m);bb=1+np.argmax(st[1:,4])
  m=((l==bb)*255).astype(np.uint8);m=cv2.dilate(m,np.ones((5,5),np.uint8))
  c=cv2.flip(c,0);m=cv2.flip(m,0);f=sc*K/5
  M=cv2.getRotationMatrix2D((0,0),deg,f);M[0,2]+=PAD*K+at[0];M[1,2]+=PAD*K+at[1]
  hw=cv2.warpAffine(c,M,(W,H),flags=cv2.INTER_CUBIC);mw=cv2.warpAffine(m,M,(W,H)).astype(np.float32)/255
  mw=cv2.GaussianBlur(mw,(0,0),1.3)[...,None];return (img*(1-mw)+hw*mw).astype(np.uint8)
def drape(img,at=(0,0),sc=1.0,deg=0,clip=True):
  # his LEFT hand draped over the chair arm, mirrored, laid over his brow: the weary emperor's face-in-hand
  c=cv2.resize(src[536:620,536:620],None,fx=5,fy=5,interpolation=cv2.INTER_CUBIC);hsv=cv2.cvtColor(c,cv2.COLOR_BGR2HSV)
  m=((hsv[...,0]>=12)&(hsv[...,0]<32)&(hsv[...,2]>60)).astype(np.uint8)*255;m[:,:115]=0
  m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8));n,l,st,_=cv2.connectedComponentsWithStats(m);bb=1+np.argmax(st[1:,4])
  m=((l==bb)*255).astype(np.uint8);m=cv2.dilate(m,np.ones((5,5),np.uint8))
  c=cv2.flip(c,1);m=cv2.flip(m,1);f=sc*K/5
  M=cv2.getRotationMatrix2D((c.shape[1]/2,c.shape[0]/2),deg,f);M[0,2]+=PAD*K+at[0]-c.shape[1]/2;M[1,2]+=PAD*K+at[1]-c.shape[0]/2
  hw=cv2.warpAffine(c,M,(W,H),flags=cv2.INTER_CUBIC);mw=cv2.warpAffine(m,M,(W,H)).astype(np.float32)/255
  if clip:   # the arm comes from his far side: the hand ends where his head ends (the wrist goes round behind it)
    hm=(cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)>22).astype(np.uint8);hm=cv2.morphologyEx(hm,cv2.MORPH_CLOSE,np.ones((25,25),np.uint8));hm=cv2.erode(hm,np.ones((9,9),np.uint8))
    mw=mw*cv2.GaussianBlur(hm.astype(np.float32),(0,0),3)
  mw=cv2.GaussianBlur(mw,(0,0),1.3)[...,None];return (img*(1-mw)+hw*mw).astype(np.uint8)
def place(img,c,m,piv,at,deg,f):
  piv=(float(piv[0]),float(piv[1]));M=cv2.getRotationMatrix2D(piv,deg,f);M[0,2]+=PAD*K+at[0]-piv[0];M[1,2]+=PAD*K+at[1]-piv[1]
  hw=cv2.warpAffine(c,M,(W,H),flags=cv2.INTER_CUBIC);mw=cv2.warpAffine(m,M,(W,H)).astype(np.float32)/255
  mw=cv2.GaussianBlur(mw,(0,0),1.3)[...,None];return (img*(1-mw)+hw*mw).astype(np.uint8)
def lefthand():
  """his draped left hand, upside down: back of the hand to us, fingers up; returns (img, mask, wrist point)"""
  c=cv2.resize(src[536:620,536:620],None,fx=5,fy=5,interpolation=cv2.INTER_CUBIC);hsv=cv2.cvtColor(c,cv2.COLOR_BGR2HSV)
  m=((hsv[...,0]>=12)&(hsv[...,0]<32)&(hsv[...,2]>60)).astype(np.uint8)*255;m[:,:115]=0
  m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8));n,l,st,_=cv2.connectedComponentsWithStats(m);bb=1+np.argmax(st[1:,4])
  m=((l==bb)*255).astype(np.uint8);m=cv2.dilate(m,np.ones((5,5),np.uint8))
  c=cv2.flip(c,0);m=cv2.flip(m,0);ys,xs=np.nonzero(m);wy=ys.max();wx=int(xs[ys>wy-25].mean())
  return c,m,(wx,wy)
def forearm():
  """his right forearm without the fist; returns (img, mask, wrist point)"""
  hs=src[440:590,196:330].copy();hs=cv2.resize(hs,None,fx=K,fy=K,interpolation=cv2.INTER_LANCZOS4)
  g=cv2.cvtColor(hs,cv2.COLOR_BGR2GRAY);m=(g>34).astype(np.uint8)*255
  m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8));n,lab,st,_=cv2.connectedComponentsWithStats(m)
  big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]);m=((lab==big)*255).astype(np.uint8)
  m[int((540-440)*K):,:]=0;m[:,:int((236-196)*K)]=0;m[:,int((286-196)*K):]=0
  hsv=cv2.cvtColor(hs,cv2.COLOR_BGR2HSV);sk=((hsv[...,0]>=12)&(hsv[...,0]<32)&(hsv[...,2]>70)).astype(np.uint8)*255
  sk=cv2.morphologyEx(sk,cv2.MORPH_CLOSE,np.ones((13,13),np.uint8));m=cv2.bitwise_and(m,cv2.dilate(sk,np.ones((7,7),np.uint8)))
  n,lab,st,_=cv2.connectedComponentsWithStats(m);m=((lab==1+np.argmax(st[1:,cv2.CC_STAT_AREA]))*255).astype(np.uint8)
  return hs,m,((246-196)*K,(540-440)*K)
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
    im=warp(im,[B(BROW_R,0,-18,28),B(BROW_N,0,-16,26),B(C(410,357),0,-8,8),B(C(391,358),0,-6,7),B(JAW,0,22,60)])
    return mouth_open(im,18,22,teeth=False,tongue=False,dy=8)
  if m=='laugh':
    im=warp(im,[B(C(410,362),0,-8,8),B(C(391,363),0,-6,7),B(MC_L,-6,-8,12),B(MC_R,6,-10,12),B(JAW,0,20,60)])
    im=mouth_open(im,32,22,dy=8);return rot(im,-7,(W/2,H*.9))
  if m=='cheer':
    im=warp(im,[B(BROW_R,0,-12,26),B(BROW_N,0,-12,24),B(MC_L,-4,-6,12),B(MC_R,4,-8,12),B(JAW,0,14,60)])
    im=mouth_open(im,26,18,dy=6);return hand(im,rotd=-96,at=(PAD*K+585,PAD*K+150))
  if m=='pleased':
    im=warp(im,[B(MC_L,-10,-22,16),B(MC_R,10,-24,16),B(C(410,375),0,-12,22),B(C(386,372),0,-10,18),B(C(412,368),0,-9,12),B(C(391,363),0,-5,7),B(C(410,362),0,-5,7)])
    return flush(im,(80,110,200),.10)
  if m=='smug':
    im=warp(im,[B(MC_R,12,-24,16),B(C(408,380),0,-10,16),B(MC_L,0,4,10),B(BROW_R,0,-26,26),B(BROW_NI,6,10,16)])
    return rot(lids(im,.45),-5,(W/2,H*.75))
  if m=='bored':
    im=lids(warp(im,[B(MC_L,0,8,12),B(MC_R,0,10,12),B(BROW_R,0,8,22),B(BROW_N,0,6,18)]),.9,near=True);return rot(im,12,(W/2,H*.75))
  if m=='weep':
    im=warp(im,[B(BROW_RI,0,-12,14),B(BROW_NI,0,-12,14),B(BROW_R,0,4,16),B(MC_L,-2,8,12),B(MC_R,2,8,12)])
    return tears(flush(im,(90,90,200),.12))
  if m=='really':
    im=warp(im,[B(BROW_R,0,-24,24),B(BROW_RI,0,-10,14),B(BROW_NI,4,8,14),B(MC_L,-4,4,12),B(MC_R,6,-2,12),B(JAW,0,12,50)])
    im=mouth_open(im,24,15,dy=4);im=rot(im,-5,(W/2,H*.75));return palm_up(im,at=(-60,700),sc=1.4,deg=90)
  if m=='facepalm':
    im=lids(warp(im,[B(MC_L,0,6,10),B(MC_R,0,6,10)]),.95);im=rot(im,8,(W/2,H*.9))
    # head in hand: his right forearm comes up from below, his left hand (back to us) over the eyes
    fc,fm,fw=forearm();hc,hm,hw=lefthand();im=place(im,fc,fm,fw,(300,360),-145,1.0);return place(im,hc,hm,hw,(300,360),10,.82*K/5)
MOODS=['calm','pleased','smug','cheer','laugh','shock','angry','bored','weep','facepalm','really']
out=os.path.join(HERE,'out');os.makedirs(out,exist_ok=True)
tiles=[]
for m in MOODS:
  im=mood(m)[PAD*K:-PAD*K,PAD*K:-PAD*K];h0,w0=im.shape[:2];sm=cv2.resize(im,(312,int(312*h0/w0)),interpolation=cv2.INTER_AREA)
  cv2.imwrite(os.path.join(out,f'flavmood_{m}.png'),sm)
  t=cv2.resize(im,(340,int(340*h0/w0)),interpolation=cv2.INTER_AREA);t=cv2.copyMakeBorder(t,4,30,4,4,cv2.BORDER_CONSTANT,value=(40,30,25))
  cv2.putText(t,m,(10,t.shape[0]-9),cv2.FONT_HERSHEY_SIMPLEX,.7,(170,220,240),2,cv2.LINE_AA);tiles.append(t)
tiles+=[np.zeros_like(tiles[0])]*(-len(tiles)%4)
rows=[np.hstack(tiles[i:i+4]) for i in range(0,len(tiles),4)]
cv2.imwrite(sys.argv[1] if len(sys.argv)>1 else os.path.join(out,'moods.png'),np.vstack(rows))
