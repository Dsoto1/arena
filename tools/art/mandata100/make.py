"""mandati91.webp rebuilt from his sharper fronts tools/art/mandata100/in_227..241.webp (822x1122, black margin; card x 50..773, y 39..1082).
in_(227+i) = MANDATA[i].img i (5 cols x 3 rows). Native 724x1044 cells (no resample) and ar 724/1044 as v0.91. Run: python3 tools/art/mandata100/make.py"""
from PIL import Image
import os
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..','..','..')
CW,CH=724,1044
Q=int(os.environ.get("Q","74"))
sheet=Image.new('RGB',(CW*5,CH*3))
for i in range(15):
  im=Image.open(os.path.join(here,f'in_{227+i}.webp')).convert('RGB').crop((50,39,774,1083))
  sheet.paste(im,((i%5)*CW,(i//5)*CH))
out=os.path.join(root,'assets','mandati91.webp');sheet.save(out,'WEBP',quality=Q,method=6);print(out,os.path.getsize(out))
