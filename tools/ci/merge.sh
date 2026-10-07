#!/bin/sh
# tools/ci/merge.sh <branch> — merge a builder agent's worktree branch and resolve the files every agent touches:
#   build.sh: the agent's new module(s) are added just before src/08-setup.js; tools/runreg.sh: DEFAULT test lists united;
#   CLAUDE.md: both sides kept; tools/regstate.json, tools/regmap.json, flavius-arena.html: ours (rebuilt / re-recorded).
# Any other conflict stops the script for a hand merge. Then rebuilds (SYNTAX_OK) and commits.
set -e; B="$1"; [ -n "$B" ] || { echo "usage: sh tools/ci/merge.sh <branch>"; exit 2; }
cd "$(dirname "$0")/../.."
git merge --no-edit "$B" >/dev/null 2>&1 || true
C=$(git diff --name-only --diff-filter=U)
[ -z "$C" ] && { sh build.sh | tail -1; git add -A flavius-arena.html 2>/dev/null; git commit -qm "Merge $B" --allow-empty >/dev/null 2>&1 || true; echo "merged $B (no conflicts)"; exit 0; }
python3 - "$B" <<'PY'
import re,subprocess,sys
B=sys.argv[1]
files=subprocess.run(['git','diff','--name-only','--diff-filter=U'],capture_output=True,text=True).stdout.split()
def side(f,s):return subprocess.run(['git','show',f':{s}:{f}'],capture_output=True,text=True).stdout
left=[]
for f in files:
  if f in('tools/regstate.json','tools/regmap.json','flavius-arena.html'):
    subprocess.run(['git','checkout','--ours',f]);continue
  t=open(f).read()
  if f=='build.sh':
    o,th=side(f,2),side(f,3)
    mods=lambda x:re.findall(r'src/[0-9a-z-]+\.js',x)
    new=[m for m in mods(th) if m not in mods(o)]
    for m in new: o=o.replace('src/08-setup.js',m+' src/08-setup.js')
    open(f,'w').write(o);continue
  if f=='tools/runreg.sh':
    def fix(m):
      a=re.search(r'DEFAULT="([^"]+)"',m.group(1));b=re.search(r'DEFAULT="([^"]+)"',m.group(2))
      if not(a and b):return m.group(1)+m.group(2)
      seen=[];[seen.append(x) for x in b.group(1).split()+a.group(1).split() if x not in seen]
      return m.group(1).replace(a.group(0),'DEFAULT="'+' '.join(seen)+'"')
    t=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',fix,t,flags=re.S);open(f,'w').write(t);continue
  if f=='CLAUDE.md':
    t=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',lambda m:m.group(1)+m.group(2),t,flags=re.S);open(f,'w').write(t);continue
  left.append(f)
if left:print('HAND MERGE NEEDED:',' '.join(left));sys.exit(3)
PY
OUT=$(sh build.sh | tail -1); echo "$OUT"; [ "$OUT" = "SYNTAX_OK" ] || { echo "build failed after merge"; exit 1; }
git add -A build.sh tools/runreg.sh CLAUDE.md tools/regstate.json tools/regmap.json flavius-arena.html
git commit -qm "Merge $B" && echo "merged $B"
