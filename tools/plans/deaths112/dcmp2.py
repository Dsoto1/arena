#!/usr/bin/env python3
"""deaths112 short table for the report: python3 tools/plans/deaths112/dcmp2.py a.jsonl b.jsonl ...
Means over every run-season (less noisy than dcmp.py's S3/S5 medians): deaths/season, rank mean (all seasons and S3-5), top-7 share,
coin at season end (median), red week-ends, walk-outs, blood money paid, fame, wins/season, roster rating me/rivals, and the side effects
on the rivals (rival deaths/house-season, seasons with a rival < 0 at a week's end, rivals' mean end coin)."""
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
for r in rows: G[r['tag']].append(r)
mean = lambda a: sum(a) / len(a) if a else float('nan')
print("| batch | runs | deaths / season | rank mean (S1–5) | rank mean S3–5 | top-7 seasons | coin end med | red week-ends / season | walk-outs / season | blood money / season | fame end | wins / season | roster me / rivals | rival deaths / house | seasons with a rival < 0 at a week's end | rivals' end coin |")
print("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
for tag, R in G.items():
    s0 = {}
    for r in R: s0[r['seed']] = min(s0.get(r['seed'], 99), r['season'])
    rel = lambda r: r['season'] - s0[r['seed']] + 1
    wins = []
    for sd in s0:
        prev = 0
        for r in sorted([r for r in R if r['seed'] == sd], key=lambda r: r['season']):
            if r.get('wins') is not None: wins.append(r['wins'] - prev); prev = r['wins']
    nriv = lambda r: max(1, (r.get('rivals') or {}).get('n') or 11)
    rr = [(r['dx']['rr']['me'] / r['dx']['rr']['n'], r['dx']['rr']['riv'] / r['dx']['rr']['n']) for r in R if r['dx']['rr']['n']]
    rk = [r['rank'] for r in R if r.get('rank')]
    rk35 = [r['rank'] for r in R if r.get('rank') and rel(r) >= 3]
    print(f"| {tag} | {len(s0)} | {mean([r['deaths'] for r in R]):.2f} | {mean(rk):.1f} | {mean(rk35):.1f} | {sum(1 for x in rk if x <= 7)}/{len(rk)} | {st.median([r['end'] for r in R]):.0f} | {mean([r.get('red') or 0 for r in R]):.1f} | {mean([r.get('walked') or 0 for r in R]):.1f} | {mean([r['dx']['pend']['payCoin'] for r in R]):.0f} | {mean([r.get('fame', 0) for r in R]):.0f} | {mean(wins):.1f} | {mean([a for a, b in rr]):.0f} / {mean([b for a, b in rr]):.0f} | {mean([sum(r['dx']['rivD'].values()) / nriv(r) for r in R]):.2f} | {sum(1 for r in R if (r.get('rivals') or {}).get('lt0wk'))}/{len(R)} | {mean([(r.get('rivals') or {}).get('avgEnd', 0) for r in R]):.0f} |")
