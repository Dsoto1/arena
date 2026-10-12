# v1.0 Recruiting murals (299-v100recruit): the mock's plates (tools/plans/mock100/img3/m_*.jpg, painted by the game's own city/arena
# canvases — see tools/plans/mock100/NOTES-recruit.md "Round 3") → small WebP files assets/rec100_<k>.webp. Run from the repo root.
from PIL import Image
import os
S='tools/plans/mock100/img3/';O='assets/'
MAXW={'pano':900,'arena':520,'arenafar':520,'colos':380}
for k in ['stalls','yard','tavern','arena','yard2','arenafar','baths','colos','temple','pano','flavius']:
    im=Image.open(S+'m_'+k+'.jpg').convert('RGB');w=MAXW.get(k)
    if w and im.size[0]>w:im=im.resize((w,round(im.size[1]*w/im.size[0])),Image.LANCZOS)
    im.save(O+'rec100_'+k+'.webp','WEBP',quality=70,method=6)
    print(k,im.size,os.path.getsize(O+'rec100_'+k+'.webp'))
