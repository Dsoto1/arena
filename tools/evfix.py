"""evfix.py — repaint five event cards so they match the rulebook (v0.59), used by mkscans.py's `events` section.
Ticks and crosses are swapped with boxes from the same deck; words are erased by inpainting and re-set with ink
lifted from other cards (no new font): Triumviratus (Elimination Royale, CF+CA on, ends at the 1st elimination),
Familia (no CF/CA), Chariot Racing (no CF), Naumachia (no PvE), Ludus (10x turn rotations, CF on). Needs numpy + opencv."""
import numpy as np
from PIL import Image
D=None  # set by mkscans: the arenacards3 scan folder + '/'
def L(n):return Image.open(f'{D}i-{n}.png').convert('RGB')
def lum(a):return a[...,0]*.3+a[...,1]*.59+a[...,2]*.11
def boxes(im,y0=640,y1=1060):
    a=np.asarray(im).astype(float);H,W,_=a.shape;dark=(lum(a)<70)
    # interior of check boxes: dark squares ~40-60 px
    from collections import deque
    seen=np.zeros_like(dark);out=[]
    for y in range(y0,y1,3):
        for x in range(120,700,3):
            if dark[y,x] and not seen[y,x]:
                q=deque([(y,x)]);seen[y,x]=1;ys=[];xs=[]
                while q:
                    cy,cx=q.popleft();ys.append(cy);xs.append(cx)
                    for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
                        ny,nx=cy+dy,cx+dx
                        if y0<=ny<y1 and 100<=nx<720 and dark[ny,nx] and not seen[ny,nx]:seen[ny,nx]=1;q.append((ny,nx))
                bx=(min(xs),min(ys),max(xs)+1,max(ys)+1);w,h=bx[2]-bx[0],bx[3]-bx[1]
                if 30<=w<=75 and 30<=h<=75 and abs(w-h)<14:
                    reg=a[bx[1]:bx[3],bx[0]:bx[2]];red=((reg[...,0]>130)&(reg[...,1]<80)).sum();yel=((reg[...,0]>150)&(reg[...,1]>150)&(reg[...,2]<110)).sum()
                    out.append((bx,'tick' if yel>red else 'cross'))
    return out
def words(im,y0,y1,x0=150,x1=690,gap=9,thr=60):
    a=lum(np.asarray(im.crop((x0,y0,x1,y1))).astype(float));bg=np.median(a);ink=a<bg-thr
    cols=ink.any(0);rows=np.where(ink.any(1))[0];out=[];s=None;last=-99
    for x,c in enumerate(cols):
        if c:
            if s is None:s=x
            last=x
        elif s is not None and x-last>gap:out.append((x0+s,x0+last+1));s=None
    if s is not None:out.append((x0+s,x0+last+1))
    return out,(y0+rows.min(),y0+rows.max()+1) if len(rows) else None
import cv2
def erase(im,box,thr=50,dil=3):
    a=np.asarray(im).copy();x0,y0,x1,y1=box;r=a[y0:y1,x0:x1];l=lum(r.astype(float));bg=np.median(l)
    m=np.zeros(a.shape[:2],np.uint8);m[y0:y1,x0:x1]=((l<bg-thr)*255).astype(np.uint8)
    m=cv2.dilate(m,np.ones((dil,dil),np.uint8),iterations=2)
    out=cv2.inpaint(cv2.cvtColor(a,cv2.COLOR_RGB2BGR),m,7,cv2.INPAINT_TELEA);return Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB))
def ink(src,box):
    a=np.asarray(src.crop(box)).astype(float);l=lum(a);bg=np.median(l);txt=np.percentile(l,2)
    al=np.clip((bg-l)/max(1,bg-txt),0,1);return a,al
def stamp(im,src,box,at,scale=1.0):
    a,al=ink(src,box)
    if scale!=1.0:
        h,w=al.shape;nw,nh=round(w*scale),round(h*scale);a=cv2.resize(a,(nw,nh),interpolation=cv2.INTER_AREA);al=cv2.resize(al,(nw,nh),interpolation=cv2.INTER_AREA)
    t=np.asarray(im).astype(float).copy();x,y=at;h,w=al.shape
    col=np.minimum(a,np.percentile(a.reshape(-1,3),3,axis=0)+40)
    t[y:y+h,x:x+w]=t[y:y+h,x:x+w]*(1-al[...,None])+col*al[...,None]
    return Image.fromarray(np.clip(t,0,255).astype(np.uint8))
def swapbox(im,dst,src_im,src):
    s=src_im.crop(src).resize((dst[2]-dst[0],dst[3]-dst[1]),Image.LANCZOS);im=im.copy();im.paste(s,dst[:2]);return im
def glyphs(im,box,gap=1):
    w,_=words(im,box[1],box[3],box[0],box[2],gap=gap,thr=60);return w
def fixed():
    T,F,C,N,Lu,E=L(2393),L(2405),L(2791),L(2801),L(2795),L(2793)
    # Triumviratus: free-for-all royale, CF + CA on, ends at the first elimination
    T=swapbox(T,(351,766,407,822),T,(350,695,406,751));T=swapbox(T,(514,766,570,822),T,(350,695,406,751))
    T=erase(T,(200,562,640,662));T=stamp(T,F,(230,562,600,662),(230,562))
    T=erase(T,(250,898,580,950))
    y=899;parts=[(E,(300,880,339,922)),(E,(325,930,412,972)),(E,(433,930,586,972))];ws=[b[2]-b[0] for _,b in parts];tot=sum(ws)+2*11;x=409-tot//2
    for (src,b),w in zip(parts,ws):
        yy=937-(918-880) if b[1]==880 else 937-(961-930);T=stamp(T,src,b,(x,yy));x+=w+11
    # Familia: no CF, no CA
    F=swapbox(F,(351,773,405,826),E,(351,762,406,816));F=swapbox(F,(508,773,562,826),E,(351,762,406,816))
    # Chariot Racing: no CF
    C=swapbox(C,(355,768,407,819),C,(506,768,557,819))
    # Naumachia: no PvE
    N=swapbox(N,(353,705,405,757),N,(354,771,406,823))
    # Ludus: 10x turn rotations, CF on in round 1
    Lu=swapbox(Lu,(501,711,539,749),Lu,(269,710,307,749))
    Lu=erase(Lu,(352,610,370,650));Lu=stamp(Lu,Lu,(307,654,319,694),(357,610))
    return {2393:T,2405:F,2791:C,2801:N,2795:Lu}
