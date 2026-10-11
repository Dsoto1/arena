# arena2_sheet.py — round 2 sheets:
#   arena2_contact.png  all 12 arenas: zoomed out | left-tower corner zoomed in | panel sample | palette strip (+ contrast)
#   arena2_grid.png     the 12 zoomed-out shots in a 4×3 overview
#   arena2_corners.png  corner close-ups: today vs round 2 (Roma bronze), sandstone balustrade (Thysdrus), marble parapet (Leptis)
import json,re,subprocess,os
from PIL import Image,ImageDraw,ImageFont
D=os.path.dirname(os.path.abspath(__file__))+'/'
B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';M='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
FT=ImageFont.truetype(B,24);FS=ImageFont.truetype(B,15);FL=ImageFont.truetype(R,14);FM=ImageFont.truetype(M,12)
KEYS=['','syracusae','verona','arles','capua','thysdrus','roma','nemausus','pompeii','leptis','uthina','pola','puteoli']
NAMES=['','Syracusae','Verona','Arles','Capua','Thysdrus','Roma','Nemausus','Pompeii','Leptis Magna','Uthina','Pola','Puteoli']
pal=json.load(open(D+'arena2_pal.json'))
prop=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('%sarena2_pal_prop.js')))"%D]))
fam=json.loads(subprocess.check_output(['node','-e',"""const s=require('fs').readFileSync('%sarena2_proto.js','utf8');const m=s.match(/const A2=P.A2=(\\{[\\s\\S]*?\\}\\});/);console.log(JSON.stringify(eval('('+m[1]+')')))"""%D]))
def lum(h):
    h=h.lstrip('#');r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)];f=lambda c:c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b);return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def fit(im,w=None,h=None):
    if w:return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    return im.resize((int(im.width*h/im.height),h),Image.LANCZOS)
RH=330
def strip(k):
    p=pal[str(k)];ch={**prop.get(str(k),{}).get('ui',{}),**prop.get(str(k),{}).get('board',{})}
    im=Image.new('RGB',(300,RH),(28,22,17));d=ImageDraw.Draw(im);y=4
    for grp in [['ink','panel','panel2','line2','bone','muted','gold','blood'],['tileA','tileB','rim','grid','standA','standB']]:
        for i,key in enumerate(grp):
            x=6+(i%4)*73;yy=y+(i//4)*44;d.rectangle([x,yy,x+20,yy+20],fill=p[key],outline=(90,80,70));d.text((x+24,yy),key,font=FM,fill=(220,210,190));d.text((x+24,yy+13),p[key],font=FM,fill=(150,140,125))
            if key in ch:d.rectangle([x-2,yy-2,x+22,yy+22],outline=(120,230,140),width=2)
        y+=92
    ok=lambda v:'AA ✓' if v>=4.5 else 'below AA'
    for a,b in [('bone','panel'),('muted','panel'),('gold','panel'),('bone','blood')]:
        v=cr(p[a],p[b]);d.text((6,y),f'{a} on {b}: {v:.1f}:1 {ok(v)}',font=FM,fill=(200,230,190) if v>=4.5 else (255,140,120));y+=16
    if ch:d.text((6,y+4),'green ring = proposed change',font=FM,fill=(120,230,140))
    return im
rows=[]
for k in range(1,13):
    nm=f'{D}arena2_{k}_{KEYS[k]}'
    if not os.path.exists(nm+'_out.png'):continue
    a=fit(Image.open(nm+'_out.png'),h=RH);c=Image.open(nm+'_corner.png');c=fit(c.crop((0,0,c.width,c.height)),h=RH)
    pn=fit(Image.open(nm+'_panel.png'),h=RH);rows.append((k,[a,c,pn,strip(k)]))
W=max(sum(i.width for i in r)+10*len(r) for _,r in rows)+20
H=len(rows)*(RH+58)+10;out=Image.new('RGB',(W,H),(20,15,11));d=ImageDraw.Draw(out);y=6
for k,ims in rows:
    f=fam[str(k)];band=(' · band '+f['band']['m']) if f.get('band') else ''
    d.text((12,y),f"{k} · {NAMES[k]}",font=FT,fill=(240,207,125));d.text((250,y+6),f"{f['n']} · rail: {f['rail']}{(' ('+f['metal']+')') if f.get('metal') else ''}{band}",font=FS,fill=(230,220,200))
    y+=34;x=10
    for im in ims:out.paste(im,(x,y));x+=im.width+10
    y+=RH+24
out.save(D+'arena2_contact.png');print('contact',out.size)
# overview grid
g=[fit(Image.open(f'{D}arena2_{k}_{KEYS[k]}_out.png'),w=480) for k in range(1,13)];gh=g[0].height
o=Image.new('RGB',(4*490+10,3*(gh+30)+10),(20,15,11));d=ImageDraw.Draw(o)
for i,im in enumerate(g):
    x=10+(i%4)*490;y=10+(i//4)*(gh+30);d.text((x,y),f"{i+1} · {NAMES[i+1]} — {fam[str(i+1)]['n']}",font=FS,fill=(240,207,125));o.paste(im,(x,y+22))
o.save(D+'arena2_grid.png');print('grid',o.size)
# corners
CR=[('Today (v0.99)','before'),('Roma · travertine + gilt bronze','roma'),('Thysdrus · sandstone + balustrade','thysdrus'),('Leptis · marble + parapet','leptis')]
TG=[('L','left tower'),('R','right tower'),('B','near corner'),('gap','stair opening')]
cw=420;ims={}
for _,key in CR:
    for t,_ in TG:
        f=f'{D}arena2_close_{key}_{t}.png'
        if os.path.exists(f):ims[(key,t)]=fit(Image.open(f),w=cw)
ch=max(i.height for i in ims.values())
o=Image.new('RGB',(170+4*(cw+10),len(CR)*(ch+16)+40),(20,15,11));d=ImageDraw.Draw(o)
for j,(t,lab) in enumerate(TG):d.text((170+j*(cw+10),8),lab,font=FS,fill=(240,207,125))
for i,(lab,key) in enumerate(CR):
    y=34+i*(ch+16);d.text((8,y+ch//2-20),'\n'.join(re.split(r' · ',lab)),font=FL,fill=(230,220,200))
    for j,(t,_) in enumerate(TG):
        if (key,t) in ims:o.paste(ims[(key,t)],(170+j*(cw+10),y))
o.save(D+'arena2_corners.png');print('corners',o.size)
