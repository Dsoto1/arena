import numpy as np
from PIL import Image
K=1.4
def grow(im,ax,ay,rx=41.0,ry=21.0,thick=9):
    a=np.array(im.convert('RGBA')).astype(float);H,W=a.shape[:2]
    yy,xx=np.mgrid[0:H,0:W]
    ell=((xx-ax)/rx)**2+((yy-ay)/ry)**2<=1
    rim=(np.abs(xx-ax)<=rx)&(yy>=ay)&(yy<=ay+ry+thick)&((((xx-ax)/rx)**2)<=1)
    R=(ell|rim)&(a[...,3]>0)
    d=np.sqrt(((xx-ax)/rx)**2+((yy-ay)/ry)**2)
    ring=R&(d>0.7)
    pal=a[ring][:,:3]
    # palette: quantize ring colours
    from PIL import Image as I2
    q=I2.fromarray(pal.reshape(-1,1,3).astype('uint8')).quantize(8)
    P=np.array(q.getpalette()[:24]).reshape(8,3).astype(float)
    dist=np.min(np.linalg.norm(a[...,None,:3]-P[None,None],axis=-1),axis=-1)
    import cv2
    cand=R&(dist>45)&(d<0.8)
    Fout=(a[...,3]>0)&~R
    n,lab=cv2.connectedComponents((cand|Fout).astype('uint8'),connectivity=8)
    keep=np.zeros(n,bool);keep[np.unique(lab[Fout])]=True;keep[0]=False
    fig_in=cand&keep[lab]
    F=Fout|fig_in
    import cv2
    Fd=cv2.dilate(F.astype('uint8'),np.ones((3,3),np.uint8))>0
    base=a.copy();base[Fd&~R]=0
    hole=(R&Fd).astype('uint8')*255
    rgb=cv2.inpaint(a[...,:3].astype('uint8'),hole,5,cv2.INPAINT_TELEA)
    base[...,:3]=np.where((R&Fd)[...,None],rgb,base[...,:3]);base[R&Fd,3]=255
    fig=a.copy();fig[~F]=0
    figI=Image.fromarray(fig.astype('uint8'),'RGBA')
    nw,nh=int(round(W*K)),int(round(H*K))
    big=figI.resize((nw,nh),Image.LANCZOS)
    # pivot: anchor (ax, ay) stays put
    newW=max(W,int(np.ceil(ax*K+ (W-ax)*K)));pad_l=int(np.ceil(ax*K-ax));pad_r=int(np.ceil((W-ax)*K-(W-ax)))
    pad_t=int(np.ceil(ay*K-ay))
    CW,CH=W+pad_l+pad_r,H+pad_t
    out=Image.new('RGBA',(CW,CH),(0,0,0,0))
    out.alpha_composite(Image.fromarray(base.astype('uint8'),'RGBA'),(pad_l,pad_t))
    ox=int(round(pad_l+ax-ax*K));oy=int(round(pad_t+ay-ay*K))
    # crop big to canvas
    tmp=Image.new('RGBA',(CW,CH),(0,0,0,0));tmp.paste(big,(ox,oy),big);out.alpha_composite(tmp)
    bb=out.getchannel('A').getbbox()
    return out,pad_l,pad_t
im=Image.open('assets/mini_hero.webp')
o,pl,pt=grow(im,40.2,70.9,41.5,21.5,12)
print('single',o.size,'anchor',40.2+pl,70.9+pt)
o.save('/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/hero/mini_hero.png')
sheet=Image.open('assets/minis8_hero.webp').convert('RGBA')
cw,ch,cax,cay=106,115,52.8,95.1
cells=[grow(sheet.crop((i*cw,0,(i+1)*cw,ch)),cax,cay,44.5,22.5,12) for i in range(8)]
c0=cells[0];NW,NH=c0[0].size
S=Image.new('RGBA',(NW*8,NH),(0,0,0,0))
for i,(c,pl2,pt2) in enumerate(cells):S.paste(c,(i*NW,0),c)
S.save('/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/hero/minis8_hero.png')
print('sheet cell',NW,NH,'anchor',cax+c0[1],cay+c0[2])
