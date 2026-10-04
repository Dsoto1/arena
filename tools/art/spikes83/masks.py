# masks for the Floor Spikes medallion: keep his frame, plaque and banner from spiders.png; repaint only the scene inside
import numpy as np, cv2
from PIL import Image
src=np.array(Image.open('../medallions/spiders.png').convert('RGBA'))
H,W=src.shape[:2];cx,cy=W/2,H/2
yy,xx=np.mgrid[0:H,0:W];rr=np.hypot(xx-cx,yy-cy)
rgb=src[:,:,:3].copy()
# the scroll: every medallion shares his frame + scroll template, so where five of them agree pixel for pixel is frame;
# the letter band is filled in by closing the holes the different words leave
stack=np.stack([np.array(Image.open('../medallions/'+f).convert('RGB').resize((W,H))).astype(float) for f in
    ['spiders.png','water.png','key1.png','boar.png','chest.png']])
sd=stack.std(axis=0).mean(axis=2)
same=(sd<14).astype(np.uint8)*255
band=np.zeros((H,W),np.uint8);band[255:H,:]=255
ban=cv2.morphologyEx(same&band,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
n,l,st,c=cv2.connectedComponentsWithStats(ban,8)
keep=np.zeros((H,W),bool)
for i in range(1,n):
    if st[i][4]>400: keep|=(l==i)
ban=cv2.morphologyEx(keep.astype(np.uint8)*255,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))>0
rb=np.hypot(xx-200,yy-93)
ban|=(rb>=218)&(rb<=252)&(xx>=108)&(xx<=292)
plq=np.zeros((H,W),bool);plq[28:112,145:256]=True
scene=(rr<149)&~ban&~plq
np.save('scene_mask.npy',scene)
dbg=src.copy();dbg[scene]=(dbg[scene]*0.4+np.array([255,0,0,255])*0.6).astype(np.uint8)
Image.fromarray(dbg).save('/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/mask_dbg.png')
print('scene px',scene.sum(),'banner px',ban.sum())
