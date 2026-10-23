#!/usr/bin/env python3
"""targets.py — his E1a–E4a targets as one pass/fail row per (tag, profile), from tools/mgrsim2.js rows.
Usage: python3 tools/plans/econ111/targets.py rows.jsonl [more.jsonl ...] [--json]
E1a in the black = no collapse and no week in the red in seasons 1–3 (share of runs); small reserve = season-1 end coin ≥ 100 (median);
    mid-table by season 3 = median season-3 rank ≤ 7 of 13 (a collapsed run counts as rank 13)
E2a = share of run-seasons with no rival < 0 at a week's end / with ≤ 1 rival < 30 at a week's end (target: every season)
E3a = median contract-wage share of spending, 50–65% · E4a = median perk points per 4 weeks 0.8–1.2, winter's Renown share 15–25%."""
import json,sys,collections,statistics as st
rows=[]
for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
  rows+=[json.loads(l) for l in open(p) if l.strip()]
rows=[r for r in rows if 'err' not in r]
def med(a): return st.median(a) if a else float('nan')
def spend(r): return sum(v.get('o',0) for v in (r.get('led') or {}).values())
runs=collections.defaultdict(lambda:collections.defaultdict(list))
for r in rows: runs[(r['tag'],r['profile'])][r['seed']].append(r)
out=[];J={}
out.append("| tag · profile | runs | collapsed by S3 | runs in the black S1–3 | S1 end coin (med) | S3 rank (med) | no rival < 0 | ≤1 rival < 30 | wage share | perk / 4 wk | winter Renown | E1a | E2a | E3a | E4a |")
out.append("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
for key in sorted(runs):
  S=runs[key];n=len(S);tag,prof=key
  bk3=sum(1 for rs in S.values() if any(x.get('bankrupt') and x['season']<=3 for x in rs))
  black=sum(1 for rs in S.values() if not any((x.get('bankrupt') and x['season']<=3) or (x['season']<=3 and x['red']>0) for x in rs))
  s1=[x['end'] for rs in S.values() for x in rs if x['season']==1 and not x.get('bankrupt') and not x.get('partial')]
  s1all=[(x['end'] if not x.get('bankrupt') else -1) for rs in S.values() for x in rs if x['season']==1]
  r3=[]
  for rs in S.values():
    x=[y for y in rs if y['season']==3 and y.get('rank')]
    if x: r3.append(x[0]['rank'])
    elif any(y.get('bankrupt') and y['season']<=3 for y in rs): r3.append(13)
  rv=[x['rivals'] for rs in S.values() for x in rs if x.get('rivals') and not x.get('partial')]
  no0=sum(1 for v in rv if v['lt0wk']==0)/len(rv) if rv else float('nan')
  le1=sum(1 for v in rv if v['lt30wk']<=1)/len(rv) if rv else float('nan')
  X=[x for rs in S.values() for x in rs if not x.get('partial')]
  ws=med([x['wages']/spend(x) for x in X if spend(x)>0])
  pk=med([4*x.get('perk',0)/max(1,len(x['curve'])) for x in X])
  def wsh(x):
    ren=x.get('ren') or {};t=sum(ren.values());return (ren.get('wc109',0)+ren.get('goal',0))/t if t else None
  wv=[v for v in (wsh(x) for x in X if x['season']>1) if v is not None];wsm=med(wv)
  s1m=med(s1all)
  e1=black==n and s1m>=100 and med(r3)<=7
  e2=no0>=0.999 and le1>=0.999
  e3=0.50<=ws<=0.65;e4=0.8<=pk<=1.2 and 0.15<=wsm<=0.25
  f=lambda b:'PASS' if b else 'fail'
  pc=lambda v:'—' if v!=v else '%d%%'%round(100*v)
  out.append(f"| {tag} · {prof} | {n} | {bk3}/{n} | {black}/{n} | {s1m:.0f} | {med(r3):.1f} | {pc(no0)} | {pc(le1)} | {pc(ws)} | {pk:.2f} | {pc(wsm)} | {f(e1)} | {f(e2)} | {f(e3)} | {f(e4)} |")
  J[f"{tag}|{prof}"]=dict(n=n,bk3=bk3,black=black,s1=s1m,r3=med(r3),no0=no0,le1=le1,ws=ws,pk=pk,wsh=wsm)
print('\n'.join(out))
if '--json' in sys.argv: print(json.dumps(J))
