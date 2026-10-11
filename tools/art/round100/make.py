"""Builds assets/round.webp (the round marker plate) from Virgilante's left end tools/art/round100/in_242.png.
Left end + lettering kept; the middle border is tiled by its 73 px bead period, the field is flat;
the right end is the left cap mirrored. Run from the repo root: python3 tools/art/round100/make.py
Prints the digit's centre as a % of the plate width (src/93-v71.js .roundmk b left)."""
from PIL import Image
import numpy as np
L=Image.open('tools/art/round100/in_242.png').convert('RGBA'); a=np.array(L)
H,W0=a.shape[:2]; P=73; CAP=160; M=259; FT,FB=78,396
mid=np.zeros((H,M,4),np.uint8)
for x in range(M):
    sx=W0+x; sx=sx-P*((sx-(W0-P))//P)   # into [W0-P, W0)
    mid[:,x]=a[:,sx]
    mid[FT:FB,x]=a[FT:FB,W0-1]            # flat field, no stray lettering
src=a[:,:CAP].copy(); src[165:315,80:]=a[200,W0-1]   # his lettering starts at x 80: the mirrored end carries none
# the colon, chiselled like his letters: two small rough squares after ROUND
from PIL import ImageDraw
cl=Image.new('RGBA',(W0+M,H),(0,0,0,0));d=ImageDraw.Draw(cl)
for cx,cy in ((516,222),(516,282)):
    d.polygon([(cx-13,cy-12),(cx+3,cy-15),(cx+14,cy-8),(cx+12,cy+11),(cx-2,cy+14),(cx-14,cy+7)],fill=(240,240,240,255))
cl=np.array(cl)[:,W0:];m=cl[...,3]>0;mid[m]=cl[m]
cap=src[:,::-1]
full=np.concatenate([a,mid,cap],1); W=full.shape[1]
img=Image.fromarray(full)
OH=90; img=img.resize((round(W*OH/H),OH),Image.LANCZOS)
img.save('assets/round.webp',quality=90,method=6)
print(img.size,'digit centre %',round((540+(W-120))/2/W*100,1))
