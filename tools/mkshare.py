import base64,json,os,sys,mimetypes
v=sys.argv[1]
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project root
src=os.path.join(R,'flavius-arena.html');A=os.path.join(R,'assets')
html=open(src,encoding='utf-8').read()
data={}
for f in sorted(os.listdir(A)):
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
