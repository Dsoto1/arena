"""mandati91.webp — the Mandata Flavi sheet (5 cols x 3 rows, MANDATA[].img order) from his card scans tools/art/mandata91/mf<i>.jpg
(822x1122 with a grey margin; the card is x 50..773, y 39..1082). All 15 are his scans (v0.91); a missing file falls back to the old assets/mandati.jpg cell."""
from PIL import Image
import os,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..','..','..')
CW,CH=600,865
old=Image.open(os.path.join(root,'assets','mandati.jpg')).convert('RGB');ow,oh=old.width//5,old.height//3
sheet=Image.new('RGB',(CW*5,CH*3))
for i in range(15):
  p=os.path.join(here,f'mf{i}.jpg')
  if os.path.exists(p):
    im=Image.open(p).convert('RGB');im=im.crop((50,39,774,1083))
  else:
    c,r=i%5,i//5;im=old.crop((c*ow,r*oh,(c+1)*ow,(r+1)*oh))
  sheet.paste(im.resize((CW,CH),Image.LANCZOS),((i%5)*CW,(i//5)*CH))
out=os.path.join(root,'assets','mandati91.webp');sheet.save(out,'WEBP',quality=86,method=6);print(out,os.path.getsize(out))
