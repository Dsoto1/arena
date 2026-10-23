#!/usr/bin/env python3
"""summarize.py — tables for tools/plans/econ111/REPORT.md from tools/mgrsim2.js rows (one JSON row per run per season).
Usage: python3 tools/plans/econ111/summarize.py rows.jsonl [more.jsonl ...]   (prints markdown; --json for the numbers)
Targets (his E1a–E5a, 2026-10-23): E1a careful house in the black, small reserve after season 1, mid-table by season 3 ·
E2a no rival < 0, ≤1 of 12 under 30 a season · E3a wages 50–65% of a careful house's spending · E4a ≈1 perk point a month, winter ≈20%."""
import json,sys,statistics as st,collections
rows=[];
for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
  for l in open(p):
    l=l.strip()
    if l: rows.append(json.loads(l))
ok=[r for r in rows if 'err' not in r]
def med(a): return st.median(a) if a else float('nan')
def q(a,p):
  if not a: return float('nan')
  a=sorted(a);k=(len(a)-1)*p;f=int(k);c=min(f+1,len(a)-1);return a[f]+(a[c]-a[f])*(k-f)
def f0(x): return '—' if x!=x else ('%d'%round(x))
def f1(x): return '—' if x!=x else ('%.1f'%x)
def pct(n,d): return '—' if not d else '%d%%'%round(100*n/d)
G=collections.defaultdict(list)
for r in ok: G[(r['tag'],r['profile'])].append(r)
runs=collections.defaultdict(lambda:collections.defaultdict(list))
for r in ok: runs[(r['tag'],r['profile'])][r['seed']].append(r)
OUTS=['wages','repairs','travel','recruiting','facilities','sales','bets','loans','senate']
def spend(r):
  L=r.get('led') or {};return sum((L.get(k) or {}).get('o',0) for k in L)
def income(r):
  L=r.get('led') or {};return sum((L.get(k) or {}).get('i',0) for k in L)
out=[]
P=out.append
for key in sorted(G):
  tag,prof=key;R=G[key];S=runs[key];n=len(S)
  bk=[s for s,rs in S.items() if any(x.get('bankrupt') for x in rs)]
  red=[s for s,rs in S.items() if any(x['red']>0 for x in rs)]
  P(f"### {tag} · {prof} — {n} runs, {len(R)} run-seasons")
  P(f"bankrupt: {len(bk)}/{n} runs (seasons: {', '.join(str(next(x['season'] for x in rs if x.get('bankrupt'))) for s,rs in S.items() if s in bk) or '—'}) · runs with a week in the red: {len(red)}/{n}")
  P("| season | runs | end coin p25 / med / p75 | lowest med | red weeks (sum) | rank med (of 13) | top-7 | wages | spend | wage share (contract / ledger) | perk pts | perk / 4 wk | winter Renown share | deaths · retired · walked | signed | roster |")
  P("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
  for s in range(1,6):
    X=[r for r in R if r['season']==s and not r.get('partial')]
    X2=[r for r in R if r['season']==s]
    if not X2: continue
    ends=[r['end'] for r in X2 if not r.get('bankrupt')]
    ranks=[r['rank'] for r in X if r.get('rank')]
    sp=[spend(r) for r in X2 if spend(r)>0]
    ws=[r['wages']/spend(r) for r in X2 if spend(r)>0]
    wl=[((r.get('led') or {}).get('wages') or {}).get('o',0)/spend(r) for r in X2 if spend(r)>0]
    pk=[r.get('perk',0) for r in X]
    pm=[4*r.get('perk',0)/max(1,len(r['curve'])) for r in X]
    def wsh(r):
      ren=r.get('ren') or {};t=sum(ren.values());return (ren.get('wc109',0)+ren.get('goal',0))/t if t else None
    wsv=[x for x in (wsh(r) for r in X) if x is not None]
    P(f"| {s} | {len(X2)} | {f0(q(ends,.25))} / {f0(med(ends))} / {f0(q(ends,.75))} | {f0(med([r['min'] for r in X2]))} | {sum(r['red'] for r in X2)} | {f1(med(ranks))} | {pct(sum(1 for x in ranks if x<=7),len(ranks))} | {f0(med([r['wages'] for r in X2]))} | {f0(med(sp))} | {pct(med(ws),1) if ws else '—'} / {pct(med(wl),1) if wl else '—'} | {f1(med(pk))} | {('%.2f'%med(pm)) if pm else '—'} | {pct(med(wsv),1) if wsv else '—'} | {f1(st.mean([r['deaths'] for r in X2]))} · {f1(st.mean([r['retired'] for r in X2]))} · {f1(st.mean([r['walked'] for r in X2]))} | {f1(st.mean([r.get('signed',0) for r in X2]))} | {f1(med([r.get('roster',0) for r in X2]))} |")
  # ledger by category (median over run-seasons, season 1 and seasons 2-5)
  for lab,sel in (('S1',lambda r:r['season']==1),('S2–5',lambda r:r['season']>1)):
    X=[r for r in R if sel(r) and r.get('led')]
    if not X: continue
    cats=sorted({k for r in X for k in (r['led'] or {})})
    P(f"ledger {lab} (mean a season, in / out): "+' · '.join(f"{c} +{f0(st.mean([((r['led'].get(c) or {}).get('i',0)) for r in X]))}/−{f0(st.mean([((r['led'].get(c) or {}).get('o',0)) for r in X]))}" for c in cats))
  # rivals
  rv=[r['rivals'] for r in R if r.get('rivals') and not r.get('partial')]
  if rv:
    P(f"rivals (12 houses, Sica out; per run-season): lowest coin at a week's end med {f0(med([x['minWk'] for x in rv]))} (min {f0(min(x['minWk'] for x in rv))}) · seasons with a rival < 0 at a week's end {pct(sum(1 for x in rv if x['lt0wk']>0),len(rv))} · seasons with > 1 rival < 30 at a week's end {pct(sum(1 for x in rv if x['lt30wk']>1),len(rv))} (mean {f1(st.mean([x['lt30wk'] for x in rv]))} houses) · ANY moment (mid-week): < 0 in {pct(sum(1 for x in rv if x['lt0']>0),len(rv))} of seasons, mean {f1(st.mean([x['lt0'] for x in rv]))} houses < 0 and {f1(st.mean([x['lt30'] for x in rv]))} < 30 · rival avg treasury at season end med {f0(med([x['avgEnd'] for x in rv]))}")
  wc=[r['winter'].get('wc') for r in R if r.get('winter') and r['winter'].get('wc')]
  if wc:
    P(f"Winter Classic: entered {sum(1 for x in wc if x['st']=='in')}/{len(wc)} winters (not seeded {sum(1 for x in wc if x['st']=='none')}, no eligible fighter {sum(1 for x in wc if x['st']=='out')}) · finals {sum(1 for x in wc if x['fin'])} · Cups {sum(1 for x in wc if x['champ'])}; frozen-roster misses {sum(1 for r in R if r.get('winter') and r['winter'].get('wcFits')==0 and (r['winter'].get('wcFrozen') or 0)>0)}")
  ren=collections.Counter()
  for r in R:
    for k,v in (r.get('ren') or {}).items(): ren[k]+=v
  if ren: P("Renown by source (sum over all run-seasons): "+', '.join(f"{k} {v}" for k,v in ren.most_common()))
  P("")
print('\n'.join(out))
if '--json' in sys.argv:
  print(json.dumps({f"{k[0]}|{k[1]}":len(v) for k,v in G.items()}))
