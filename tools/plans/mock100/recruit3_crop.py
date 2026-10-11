# python3 tools/plans/mock100/recruit3_crop.py — cuts the city/arena canvases (img3/r3_*_full.png) into mural plates (img3/m_*.jpg)
from PIL import Image
import os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'img3')
R=Image.open(f'{D}/r3_city2_full.png').convert('RGB');C=Image.open(f'{D}/r3_city_full.png').convert('RGB');A=Image.open(f'{D}/r3_arena_full.png').convert('RGB')
cuts={'pano':(R,(0,60,1100,430)),'yard':(R,(600,540,990,735)),'yard2':(C,(610,555,980,750)),'temple':(R,(370,215,700,470)),
 'stalls':(R,(235,450,650,690)),'baths':(R,(110,370,360,570)),'tavern':(R,(270,330,520,500)),'colos':(R,(690,230,1100,560)),
 'arena':(A,(95,70,875,520)),'arenafar':(A,(150,60,820,330)),'flavius':(A,(425,0,545,105)),'capua':(C,(0,60,1100,430))}
for k,(im,box) in cuts.items():
  im.crop(box).save(f'{D}/m_{k}.jpg',quality=88)
print('ok',list(cuts))
