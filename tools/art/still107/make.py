# still107 — v1.07 ONE STILL FRAME of the 3D figures (his 2a/3a): cut from the shipped move sheets, never re-rendered.
#   assets/still107_<cls>.webp      the idle row of assets/anim100_<cls>_move.webp (8 MINI_YAW facings, cells and anchors as ANIM100_META idle[0])
#   assets/still107_b_<key>.webp    the idle0 row of assets/beast100_<key>.webp (8 facings, cells as BEAST100_META iw)
#   assets/still107f_<k>.webp       one picture facing the viewer, trimmed (off the board: seats, cards, rooms; beasts on long bases three-quarter)
# Run: python3 tools/art/still107/make.py   (Pillow). Re-run after the anim100 / beast100 sheets change. Q=quality (default 82).
import json,os,re
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
A=os.path.join(R,'assets')
def meta(path,name):
    s=open(os.path.join(R,path),encoding='utf-8').read()
    m=re.search(r'/\* '+name+r':BEGIN[^\n]*\n\s*const '+name+r'=(\{.*?\});\s*/\* '+name+':END',s,re.S)
    return json.loads(m.group(1))
AM=meta('src/board/311-v100anim.js','ANIM100_META');BM=meta('src/board/312-v100beasts.js','BEAST100_META')
Q=int(os.environ.get('Q','82'))
def save(im,f):
    p=os.path.join(A,f);im.save(p,'WEBP',quality=Q,method=6);return os.path.getsize(p)
tot=0;out=[]
for cls,M in sorted(AM.items()):
    y,w,h,ax,ay=M['move']['rows']['idle'][0]
    sh=Image.open(os.path.join(A,'anim100_%s_move.webp'%cls)).convert('RGBA')
    row=sh.crop((0,y,w*8,y+h));n=save(row,'still107_%s.webp'%cls);tot+=n
    f=row.crop((0,0,w,h));f=f.crop(f.getbbox());n2=save(f,'still107f_%s.webp'%cls);tot+=n2;out.append((cls,n,n2,f.size))
LONG={'ursa','brutum','leo','leaena'}
for k,M in sorted(BM.items()):
    if k=='spider' or not M.get('iw'):continue
    w,h=M['iw'][0],M['iw'][1];i=M['ir'].index('idle0')
    sh=Image.open(os.path.join(A,'beast100_%s.webp'%k)).convert('RGBA')
    row=sh.crop((0,i*h,w*8,i*h+h));n=save(row,'still107_b_%s.webp'%k);tot+=n
    fc=1 if k in LONG else 0
    f=row.crop((fc*w,0,fc*w+w,h));f=f.crop(f.getbbox());n2=save(f,'still107f_%s.webp'%k);tot+=n2;out.append((k,n,n2,f.size))
for o in out:print('%-10s sheet %6d B  front %6d B  %s'%o)
print('total',tot,'B')
