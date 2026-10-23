#!/usr/bin/env python3
"""chart.py — the treasury-curve chart for REPORT.md: median treasury by week (5 seasons × 15 week-ends: weeks 1–11, Superbus P1–P3,
Winter W) per profile, the careful house's p25–p75 band, bankruptcies counted per season.
Usage: python3 tools/plans/econ111/chart.py rows.jsonl out.svg [out.html]"""
import json,sys,collections,statistics as st
rows=[json.loads(l) for l in open(sys.argv[1]) if l.strip()]
rows=[r for r in rows if 'err' not in r]
runs=collections.defaultdict(list)
for r in rows: runs[(r['profile'],r['seed'])].append(r)
series=collections.defaultdict(list)  # profile -> list of per-run arrays
bk=collections.defaultdict(lambda:collections.Counter())
for (p,s),R in runs.items():
  R.sort(key=lambda r:r['season']);arr=[]
  for r in R:
    c=[x[1] for x in r['curve']]
    arr+= c+[None]*(15-len(c)) if r is not R[-1] else c
    if r.get('bankrupt'): bk[p][r['season']]+=1
  series[p].append(arr)
N=75
def stat(p,k,f):
  v=[a[k] for a in series[p] if k<len(a) and a[k] is not None]
  return f(v) if len(v)>=3 else None
def q(v,x):
  v=sorted(v);i=(len(v)-1)*x;lo=int(i);hi=min(lo+1,len(v)-1);return v[lo]+(v[hi]-v[lo])*(i-lo)
COL={'careful':'#2a78d6','spendthrift':'#eb6834','mimic':'#1baf7a'}
W,H,L,R_,T,B=900,380,56,175,24,44
allv=[stat(p,k,st.median) for p in series for k in range(N)]+[stat('careful',k,lambda v:q(v,.75)) for k in range(N)]+[stat('careful',k,lambda v:q(v,.25)) for k in range(N)]
allv=[v for v in allv if v is not None]
ymin=min(-100,min(allv));ymax=max(allv)*1.05
ymin=(ymin//100)*100;ymax=((ymax//100)+1)*100
X=lambda k:L+(W-L-R_)*k/(N-1);Y=lambda v:T+(H-T-B)*(ymax-v)/(ymax-ymin)
o=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" role="img" aria-labelledby="t1 d1" font-family="system-ui,sans-serif" font-size="12">',
   '<title id="t1">Treasury by week, median of 12 seeds</title><desc id="d1">Five seasons of a founded house (325 coin start) played by three scripted lanistae.</desc>',
   f'<rect width="{W}" height="{H}" fill="#fcfcfb"/>']
step=100 if ymax-ymin<=1200 else 200
v=ymin
while v<=ymax:
  o.append(f'<line x1="{L}" x2="{W-R_}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{"#52514e" if v==0 else "#e4e3df"}" stroke-width="{1.2 if v==0 else 1}"/><text x="{L-6}" y="{Y(v)+4:.1f}" text-anchor="end" fill="#52514e">{int(v)}</text>');v+=step
for s in range(5):
  x0=X(s*15);o.append(f'<line x1="{x0:.1f}" x2="{x0:.1f}" y1="{T}" y2="{H-B}" stroke="#d6d5d0" stroke-dasharray="3 3"/>')
  o.append(f'<text x="{X(s*15+7):.1f}" y="{H-B+18}" text-anchor="middle" fill="#52514e">Season {s+1}</text>')
  xw=X(s*15+14);o.append(f'<text x="{xw:.1f}" y="{H-B+32}" text-anchor="middle" fill="#8a8984" font-size="10">W</text>')
# careful band
up=[(k,stat('careful',k,lambda v:q(v,.75))) for k in range(N)];lo=[(k,stat('careful',k,lambda v:q(v,.25))) for k in range(N)]
up=[(k,v) for k,v in up if v is not None];lo=[(k,v) for k,v in lo if v is not None]
if up:
  pts=' '.join(f'{X(k):.1f},{Y(v):.1f}' for k,v in up)+' '+' '.join(f'{X(k):.1f},{Y(v):.1f}' for k,v in reversed(lo))
  o.append(f'<polygon points="{pts}" fill="#2a78d6" opacity="0.14"/>')
lab=[]
for p in ['careful','spendthrift','mimic']:
  if p not in series: continue
  pts=[(k,stat(p,k,st.median)) for k in range(N)];pts=[(k,v) for k,v in pts if v is not None]
  if not pts: continue
  o.append(f'<polyline fill="none" stroke="{COL[p]}" stroke-width="2" stroke-linejoin="round" points="{" ".join(f"{X(k):.1f},{Y(v):.1f}" for k,v in pts)}"/>')
  for k,v in pts:
    n=sum(1 for a in series[p] if k<len(a) and a[k] is not None)
    o.append(f'<circle cx="{X(k):.1f}" cy="{Y(v):.1f}" r="6" fill="transparent"><title>{p} · season {k//15+1}, {"W" if k%15==14 else ("P"+str(k%15-10) if k%15>10 else "wk "+str(k%15+1))}: median {int(v)} coin ({n} houses still running)</title></circle>')
  k,v=pts[-1];bt=sum(bk[p].values());lab.append((Y(v),p,COL[p],f'{p} ({bt}/12 bankrupt)'))
lab.sort()
lastY=-99
for y,p,c,t in lab:
  y=max(y,lastY+16);lastY=y
  o.append(f'<line x1="{W-R_+4}" x2="{W-R_+14}" y1="{y:.1f}" y2="{y:.1f}" stroke="{c}" stroke-width="2"/><text x="{W-R_+18}" y="{y+4:.1f}" fill="#0b0b0b">{t}</text>')
o.append(f'<text x="{L}" y="{T-8}" fill="#52514e">coin · median of the houses still running (careful: p25–p75 band)</text></svg>')
svg='\n'.join(o);open(sys.argv[2],'w').write(svg)
if len(sys.argv)>3:
  open(sys.argv[3],'w').write(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Treasury Curves</title><style>:root{{--bg:#f4f3ef}}@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#1a1a19}}}}:root[data-theme="dark"]{{--bg:#1a1a19}}body{{background:var(--bg);margin:0;padding:16px;font-family:system-ui,sans-serif}}figure{{max-width:960px;margin:0 auto;background:#fcfcfb;border-radius:8px;padding:12px}}figcaption{{color:#52514e;font-size:13px;margin-top:6px}}</style></head><body><figure>{svg}<figcaption>Flavius Rule Arena · Manager economy re-measure (tools/mgrsim2.js). Hover a point for the week. Founded house, Normal start, 12 seeds × 5 seasons per profile.</figcaption></figure></body></html>')
