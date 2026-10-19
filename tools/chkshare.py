"""Checks a standalone build: python3 tools/chkshare.py share/flavius-rule-arena-vX.YY.html
Extracts every real <script> and runs `node --check` on it; the text/plain blocks (plain-text assets) must contain no raw '</script'
and each decoded block must pass `node --check` too. Prints CHK_OK or the failures. (python3 stdlib + node)"""
import re,subprocess,sys,tempfile,os
h=open(sys.argv[1],encoding='utf-8').read();bad=0;k=0
d=tempfile.mkdtemp()
for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>',h,flags=re.S|re.I):
    attrs,body=m.groups();k+=1
    pl='text/plain' in attrs
    if pl: body=body.replace('','')
    elif 'type=' in attrs and 'javascript' not in attrs: continue
    f=os.path.join(d,'s%d.js'%k);open(f,'w',encoding='utf-8').write(body)
    r=subprocess.run(['node','--check',f],capture_output=True,text=True)
    if r.returncode: bad+=1;print('FAIL script',k,attrs[:60],r.stderr[:400])
print('scripts checked',k,'failures',bad)
print('CHK_OK' if not bad else 'CHK_FAIL')
sys.exit(1 if bad else 0)
