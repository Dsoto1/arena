#!/usr/bin/env python3
"""deaths112 before/after table: python3 tools/plans/deaths112/dcmp.py a.jsonl b.jsonl ... (one row per tag · profile)."""
import json, sys, statistics as st
from collections import defaultdict
rows = []
for f in sys.argv[1:]:
    for l in open(f):
        try: r = json.loads(l)
        except Exception: continue
        if r.get('err') or 'season' not in r or 'dx' not in r: continue
        rows.append(r)
G = defaultdict(list)
for r in rows: G[(r['tag'], r['profile'])].append(r)
med = lambda a: st.median(a) if a else float('nan')
mean = lambda a: sum(a) / len(a) if a else float('nan')
print("| batch | runs | bankrupt | deaths / season (S1–5) | deaths / entry | rank S3 med | rank S5 med | top-7 S3 | coin end S3 med | coin end S5 med | blood money paid / season | rival deaths / house-season | roster rating S3 me / rivals | fame S3 | wins / season |")
print("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
for (tag, prof), R in G.items():
    s0 = {}
    for r in R: s0[r['seed']] = min(s0.get(r['seed'], 99), r['season'])
    by = defaultdict(list)
    for r in R: by[r['season'] - s0[r['seed']] + 1].append(r)
    nriv = lambda r: max(1, (r.get('rivals') or {}).get('n') or 11)
    ent = sum(r['dx']['ent']['P'] for r in R)
    S3 = by.get(3, []); S5 = by.get(5, [])
    rr = lambda L: (mean([r['dx']['rr']['me'] / r['dx']['rr']['n'] for r in L if r['dx']['rr']['n']]), mean([r['dx']['rr']['riv'] / r['dx']['rr']['n'] for r in L if r['dx']['rr']['n']]))
    a, b = rr(S3)
    wins = []
    for sd in s0:
        L = sorted([r for r in R if r['seed'] == sd], key=lambda r: r['season'])
        prev = 0
        for r in L:
            if r.get('wins') is not None: wins.append(r['wins'] - prev); prev = r['wins']
    print(f"| {tag} · {prof} | {len(s0)} | {len(set(r['seed'] for r in R if r.get('bankrupt')))} | {mean([r['deaths'] for r in R]):.2f} | {sum(r['deaths'] for r in R)/max(1,ent):.2f} | {med([r['rank'] for r in S3 if r.get('rank')])} | {med([r['rank'] for r in S5 if r.get('rank')])} | {sum(1 for r in S3 if r.get('rank') and r['rank']<=7)}/{len(S3)} | {med([r['end'] for r in S3]):.0f} | {med([r['end'] for r in S5]):.0f} | {mean([r['dx']['pend']['payCoin'] for r in R]):.0f} | {mean([sum(r['dx']['rivD'].values())/nriv(r) for r in R]):.2f} | {a:.0f} / {b:.0f} | {mean([r.get('fame',0) for r in S3]):.0f} | {mean(wins):.1f} |")
