import base64,json,os,sys,mimetypes,re
# python3 stdlib only: CloudShell (tools/deploy/flavius.sh) runs this with nothing else installed
v=sys.argv[1]
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project root
src=os.path.join(R,'flavius-arena.html');A=os.path.join(R,'assets')
html=open(src,encoding='utf-8').read()

# ---------------------------------------------------------------------------------------------------------------
# v1.07 (his 2a, 2026-10-19): the standalone's own code is stripped of comments and indentation (the site keeps the readable
# page). It removes ONLY: JS // and /* */ comments, the indentation / trailing blanks of code lines, blank lines; <!-- --> outside
# scripts; CSS /* */ in <style>. It never touches a string, a regex literal or a template literal (they hold HTML/CSS) and never
# joins lines (ASI); a block comment that spanned lines leaves a newline. tools/chkshare.py checks the result.
_KW=('return','typeof','instanceof','in','of','new','delete','void','throw','case','do','else','yield','await')
_NEXT=re.compile(r"""[\n'"`/{}]""")
_STR={q:re.compile(q+r"(?:[^"+q+r"\\\n]|\\.|\\\n)*"+q) for q in ("'",'"')}
_RE=re.compile(r"/(?:[^/\\\[\n]|\\.|\[(?:[^\]\\\n]|\\.)*\])+/[A-Za-z]*")
_TPL=re.compile(r"[`\\$]")
_ID=re.compile(r"[A-Za-z_$][\w$]*$")
def strip_js(src):
    res=[];line=[];prev='';n=len(src);i=0
    stack=[]   # brace depth at which each open ${ } of a template literal was entered
    depth=0;bol=True
    def emit(t):
        nonlocal prev
        line.append(t)
        k=t.rstrip()
        if k: prev=(prev+k)[-30:]
    def flush():
        s=''.join(line).rstrip(' \t');line.clear()
        if s.strip(' \t'): res.append(s+'\n')
    def template(i,begin):
        # src[begin:i] is the opening ` (or the } that closes a ${ }); copy verbatim up to the closing ` or the next ${
        while True:
            m=_TPL.search(src,i)
            if not m: raise ValueError('unterminated template')
            c=m.group();j=m.start()
            if c=='\\': i=j+2;continue
            if c=='`': emit(src[begin:j+1]);return j+1,False
            if src.startswith('${',j): emit(src[begin:j+2]);return j+2,True
            i=j+1
    while i<n:
        if bol:
            while i<n and src[i] in ' \t': i+=1
            bol=False
            if i>=n: break
        m=_NEXT.search(src,i)
        if not m:
            emit(src[i:]);break
        j=m.start();c=m.group()
        if j>i: emit(src[i:j])
        if c=='\n':
            flush();bol=True;i=j+1;continue
        if c=='{':
            depth+=1;emit('{');i=j+1;continue
        if c=='}':
            if stack and stack[-1]==depth:
                stack.pop()
                i,ent=template(j+1,j)
                if ent: stack.append(depth)
                continue
            depth-=1;emit('}');i=j+1;continue
        if c in ("'",'"'):
            mm=_STR[c].match(src,j)
            if not mm: raise ValueError('bad string at %d: %r'%(j,src[j:j+60]))
            emit(mm.group());i=mm.end();continue
        if c=='`':
            i,ent=template(j+1,j)
            if ent: stack.append(depth)
            continue
        nx=src[j+1:j+2]   # c == '/'
        if nx=='/':
            e=src.find('\n',j);i=n if e<0 else e;continue
        if nx=='*':
            e=src.find('*/',j+2)
            if e<0: raise ValueError('unterminated comment')
            i=e+2
            if '\n' in src[j:i]: flush();bol=True
            else: emit(' ')
            continue
        last=prev[-1:];w=_ID.search(prev)
        isre=last=='' or (last in '(,=:[!&|?{;+-*%<>~^' and not prev.endswith(('++','--'))) or (w is not None and w.group() in _KW)
        if isre:
            mm=_RE.match(src,j)
            if not mm: raise ValueError('bad regex at %d: %r'%(j,src[j:j+60]))
            emit(mm.group());i=mm.end();continue
        emit('/');i=j+1
    flush()
    return ''.join(res)
def strip_css(t):
    return re.sub(r'''("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|url\([^)]*\))|/\*.*?\*/''',lambda m:m.group(1) or '',t,flags=re.S)
def strip_page(h):
    # split into <script>…</script> / <style>…</style> pieces and the rest (plain HTML: only <!-- --> comments go)
    parts=re.split(r'(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)',h,flags=re.S|re.I)
    for k,p in enumerate(parts):
        if k%2==0: parts[k]=re.sub(r'<!--.*?-->','',p,flags=re.S)
        else:
            m=re.match(r'(<(script|style)\b[^>]*>)(.*?)(</\2>)$',p,flags=re.S|re.I)
            tag,kind,body,close=m.groups()[0],m.group(2).lower(),m.group(3),m.group(4)
            if kind=='style': body=strip_css(body)
            elif not re.search(r'type\s*=\s*["\']?(?!text/javascript|module)',tag,flags=re.I): body=strip_js(body)
            parts[k]=tag+body+close
    return ''.join(parts)
if os.environ.get('MKSHARE_NOSTRIP')!='1':
    n0=len(html);html=strip_page(html);print('code stripped: %.1f -> %.1f MB'%(n0/1e6,len(html)/1e6))

data={}
# retired art kept on the site for old cached pages, but never used by this build (v0.90: the download zip hit 30 MiB)
RETIRED={'weapon_back1.webp','weapon_back2.webp','weapon_back3.webp','weapon_back4.webp'}
# online-only helpers: the standalone has no Online (v0.94: the Safari WebP encoder for online token pictures)
RETIRED|={'webpenc94.js'}
# v1.0: the animated stand-in sheets (311-v100anim, ~6 MB) stay on the site; the standalone draws the still tokens
# v1.0 animated 3D beasts (312-v100beasts): the standalone keeps today's minis (the download stays under 30 MiB)
RETIRED|={f for f in os.listdir(A) if f.startswith('beast100_')}
# v1.08b (410-v108x2, his 3a): the 2x sheets anim100x2_* / beast100x2_* are for big screens on the site only — the download keeps 1x (and none of the figure sheets)
RETIRED|={f for f in os.listdir(A) if f.startswith(('anim100x2_','beast100x2_'))}
# v1.07 (his a, 2026-10-19): the 3D crowd sheets crowd100_* (≈0.8 MB) ARE inlined now — townsfolk, lanista, doctore and the stands' crowd
# in 3D in the standalone too (one look everywhere; v1.0 kept them site-only)
# v1.07 (400-v107tok): the still sheets still107_* (≈0.35 MB) ARE inlined — the standalone draws one still frame of the 3D figures
# v1.07 (402-v107city): the City Square walker sheets city107_* (≈0.6 MB) ARE inlined too — the standalone's gladiators / guards walk in 3D
# v1.07 (his 1a, 2026-10-19): the plain scripts (language packs lang_*.js, three93/tok93/gear100/body100) go in as PLAIN TEXT, not
# base64 (−⅓ of their size, and zip packs text far better): a <script type="text/plain" id="ad-<file>"> block each, read back through
# a getter on window.ASSET_DATA[file] that makes a Blob URL on first use — so assetURL and the 01-head language loader are untouched.
TEXT={}
for f in sorted(os.listdir(A)):
    if f in RETIRED or (f.startswith(('anim100_','anim106')) and f.endswith('.webp')): continue  # v1.06a: the shadow sheets (anim106_*, phone anim106p_*) go with the figure sheets: the standalone keeps the pillar/chest/rubble casts + contact shadows
    p=os.path.join(A,f)
    if f.endswith('.js'):
        t=open(p,encoding='utf-8').read()
        if '' in t or '\r' in t: raise SystemExit('%s has U+E000 or CR — cannot inline as text'%f)
        TEXT[f]=t;continue
    mt=mimetypes.guess_type(f)[0] or ('image/webp' if f.endswith('.webp') else 'application/octet-stream')
    data[f]='data:%s;base64,%s'%(mt,base64.b64encode(open(p,'rb').read()).decode())
# inline only real references — url(assets/x), src="assets/x", 'assets/x' / "assets/x" — never the mentions in comments
# (a comment naming assets/arena.jpg used to carry a second 5 MB copy); everything else reads window.ASSET_DATA via assetURL
for f,u in data.items(): html=re.sub(r'''(url\(|src="|[\'"])assets/'''+re.escape(f)+r'''(?=[\)"\'])''',lambda m:m.group(1)+u,html)
# the data block must come before the first script that reads it (v0.87: the language loader in 01-head)
first='<script data-lang87>' if '<script data-lang87>' in html else '<script>'
# text blocks: "</script" and "<!--" would end / confuse the block, so the "<" before them carries an invisible U+E000 (removed again on read)
blocks=''.join('<script type="text/plain" id="ad-%s">%s</script>\n'%(f,re.sub(r'<(?=/script|!--)','<',t,flags=re.I)) for f,t in TEXT.items())
getters=('(function(){var D=window.ASSET_DATA,B={};%s.forEach(function(f){var u;Object.defineProperty(D,f,{enumerable:true,configurable:true,get:function(){'
  'if(!u){var t=document.getElementById("ad-"+f).textContent.split("\\uE000").join("");'
  'try{u=URL.createObjectURL(new Blob([t],{type:"text/javascript"}))}catch(e){u="data:text/javascript;charset=utf-8,"+encodeURIComponent(t)}}return u}})})})();')%json.dumps(sorted(TEXT))
html=html.replace(first,blocks+'<script>window.ASSET_DATA='+json.dumps(data)+';'+getters+'</script>\n'+first,1)
os.makedirs('share',exist_ok=True);out='share/flavius-rule-arena-v%s.html'%v
open(out,'w',encoding='utf-8').write(html);print(out,round(len(html)/1e6,1),'MB')
