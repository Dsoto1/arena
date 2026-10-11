# python3 tools/plans/mock100/rooms_crop.py — extra wide plates for rooms.html banners (from the recruit3 city captures) + SEV92 outlines as a script
from PIL import Image
import os, json
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'img3')
R=Image.open(f'{D}/r3_city2_full.png').convert('RGB');C=Image.open(f'{D}/r3_city_full.png').convert('RGB')
C.crop((330,560,1100,720)).save(f'{D}/m4_yardban.jpg',quality=88)
R.crop((0,380,760,560)).save(f'{D}/m4_bathban.jpg',quality=88)
C.crop((600,520,1000,760)).save(f'{D}/m4_yardwide.jpg',quality=88)
s=json.load(open(f'{D}/r4_sev92.json'))
open(os.path.join(os.path.dirname(D),'rooms_sev.js'),'w').write('/* SEV92 location outlines copied from src/211-v92sev.js (avatar space 150 wide) */\nwindow.SEV92='+json.dumps(s)+';\n')
print('ok')
