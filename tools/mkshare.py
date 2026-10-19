import base64,json,os,sys,mimetypes
v=sys.argv[1]
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project root
src=os.path.join(R,'flavius-arena.html');A=os.path.join(R,'assets')
html=open(src,encoding='utf-8').read()
data={}
# retired art kept on the site for old cached pages, but never used by this build (v0.90: the download zip hit 30 MiB)
RETIRED={'weapon_back1.webp','weapon_back2.webp','weapon_back3.webp','weapon_back4.webp'}
# online-only helpers: the standalone has no Online (v0.94: the Safari WebP encoder for online token pictures)
RETIRED|={'webpenc94.js'}
# v1.0: the animated stand-in sheets (311-v100anim, ~6 MB) stay on the site; the standalone draws the still tokens
# v1.0 animated 3D beasts (312-v100beasts): the standalone keeps today's minis (the download stays under 30 MiB)
RETIRED|={f for f in os.listdir(A) if f.startswith('beast100_')}
# v1.07 (his a, 2026-10-19): the 3D crowd sheets crowd100_* (≈0.8 MB) ARE inlined now — townsfolk, lanista, doctore and the stands' crowd
# in 3D in the standalone too (one look everywhere; v1.0 kept them site-only)
# v1.07 (400-v107tok): the still sheets still107_* (≈0.35 MB) ARE inlined — the standalone draws one still frame of the 3D figures
# v1.07 (402-v107city): the City Square walker sheets city107_* (≈0.6 MB) ARE inlined too — the standalone's gladiators / guards walk in 3D
for f in sorted(os.listdir(A)):
    if f in RETIRED or (f.startswith(('anim100_','anim106')) and f.endswith('.webp')): continue  # v1.06a: the shadow sheets (anim106_*, phone anim106p_*) go with the figure sheets: the standalone keeps the pillar/chest/rubble casts + contact shadows
    p=os.path.join(A,f);mt=mimetypes.guess_type(f)[0] or ('image/webp' if f.endswith('.webp') else 'application/octet-stream')
    data[f]='data:%s;base64,%s'%(mt,base64.b64encode(open(p,'rb').read()).decode())
import re
# inline only real references — url(assets/x), src="assets/x", 'assets/x' / "assets/x" — never the mentions in comments
# (a comment naming assets/arena.jpg used to carry a second 5 MB copy); everything else reads window.ASSET_DATA via assetURL
for f,u in data.items(): html=re.sub(r'''(url\(|src="|[\'"])assets/'''+re.escape(f)+r'''(?=[\)"\'])''',lambda m:m.group(1)+u,html)
# the data block must come before the first script that reads it (v0.87: the language loader in 01-head)
first='<script data-lang87>' if '<script data-lang87>' in html else '<script>'
html=html.replace(first,'<script>window.ASSET_DATA='+json.dumps(data)+';</script>\n'+first,1)
os.makedirs('share',exist_ok=True);out='share/flavius-rule-arena-v%s.html'%v
open(out,'w',encoding='utf-8').write(html);print(out,round(len(html)/1e6,1),'MB')
