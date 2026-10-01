import base64,json,os,sys,mimetypes
v=sys.argv[1]
src='/home/claude/flavius/flavius-arena.html';A='/home/claude/flavius/assets'
html=open(src,encoding='utf-8').read()
data={}
for f in sorted(os.listdir(A)):
    p=os.path.join(A,f);mt=mimetypes.guess_type(f)[0] or ('image/webp' if f.endswith('.webp') else 'application/octet-stream')
    data[f]='data:%s;base64,%s'%(mt,base64.b64encode(open(p,'rb').read()).decode())
for f,u in data.items(): html=html.replace('assets/'+f,u)
html=html.replace('<script>','<script>window.ASSET_DATA='+json.dumps(data)+';</script>\n<script>',1)
os.makedirs('share',exist_ok=True);out='share/flavius-rule-arena-v%s.html'%v
open(out,'w',encoding='utf-8').write(html);print(out,round(len(html)/1e6,1),'MB')
