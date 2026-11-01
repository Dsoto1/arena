#!/usr/bin/env python3
"""strength115 summary: python3 tools/plans/strength115/sx.py out/B0.jsonl [out/F1.jsonl ...] [--diag] [--led]
Table per batch (means over run-seasons; rank SE = SD of per-seed mean rank / sqrt(seeds)); --diag adds the cause measurements from
mgrsim2's `sx` field (growth, joins, exits, matchmaking, regimes); --led adds the rivals' coin by function (per house-season)."""
import json, sys, math, statistics as st
from collections import defaultdict, Counter
args = [a for a in sys.argv[1:] if not a.startswith('--')]
DIAG = '--diag' in sys.argv; LED = '--led' in sys.argv
rows = []
for f in args:
    for l in open(f):
        try: r = json.loads(l)
        except Exception: continue
        if r.get('err') or 'season' not in r or 'dx' not in r: continue
        rows.append(r)
G = defaultdict(list)
for r in rows: G[r['tag']].append(r)
mean = lambda a: sum(a) / len(a) if a else float('nan')
def sd(a): return st.stdev(a) if len(a) > 1 else float('nan')
nriv = lambda r: max(1, (r.get('rivals') or {}).get('n') or 11)
def rel(R):
    s0 = {}
    for r in R: s0[r['seed']] = min(s0.get(r['seed'], 99), r['season'])
    return lambda r: r['season'] - s0[r['seed']] + 1
print("| batch | seeds | rank (SE) | rank S5 | top-7 | roster me S1→S5 | rivals S1→S5 | deaths/season | coin end med | collapses | fame end | wins/season | signed/season | rival deaths/house | rival end coin | rival seasons < 0 |")
print("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
for tag, R in G.items():
    rl = rel(R); seeds = sorted(set(r['seed'] for r in R))
    rk = [r['rank'] for r in R if r.get('rank')]
    per = [mean([r['rank'] for r in R if r['seed'] == s and r.get('rank')]) for s in seeds]
    per = [x for x in per if x == x]
    se = sd(per) / math.sqrt(len(per)) if len(per) > 1 else float('nan')
    rr = lambda s, k: mean([r['dx']['rr'][k] / r['dx']['rr']['n'] for r in R if rl(r) == s and r['dx']['rr']['n']])
    wins = []
    for sd_ in seeds:
        prev = 0
        for r in sorted([r for r in R if r['seed'] == sd_], key=lambda r: r['season']):
            if r.get('wins') is not None: wins.append(r['wins'] - prev); prev = r['wins']
    coll = len(set(r['seed'] for r in R if r.get('bankrupt')))
    print(f"| {tag} | {len(seeds)} | {mean(rk):.2f} ({se:.2f}) | {mean([r['rank'] for r in R if rl(r)==5 and r.get('rank')]):.1f} | {sum(1 for x in rk if x <= 7)}/{len(rk)} | {rr(1,'me'):.0f}→{rr(5,'me'):.0f} | {rr(1,'riv'):.0f}→{rr(5,'riv'):.0f} | {mean([r['deaths'] for r in R]):.2f} | {st.median([r['end'] for r in R]):.0f} | {coll}/{len(seeds)} | {mean([r.get('fame',0) for r in R]):.0f} | {mean(wins):.1f} | {mean([r.get('signed',0) for r in R]):.1f} | {mean([sum(r['dx']['rivD'].values())/nriv(r) for r in R]):.2f} | {mean([(r.get('rivals') or {}).get('avgEnd',0) for r in R]):.0f} | {sum(1 for r in R if (r.get('rivals') or {}).get('lt0wk'))}/{len(R)} |")
if not DIAG and not LED: sys.exit()
for tag, R in G.items():
    S = [r['sx'] for r in R if r.get('sx')]
    if not S: continue
    ns = len(S); nr = mean([nriv(r) for r in R if r.get('sx')])
    print(f"\n## {tag} — diagnostics over {ns} run-seasons (rivals ≈ {nr:.1f} houses)")
    if DIAG:
        print("\nGrowth per fighter-week (fighters on the same house all week): g.ovr + statOvr")
        print("| house | fighter-weeks/season/house | d ovr | d stat | total | when fought (share of fw) | at potential |")
        print("|---|---|---|---|---|---|---|")
        for k in 'PC':
            a = [sum(s['g'][k][i] for s in S) for i in range(6)]
            fw = a[0] or 1; hn = ns * (1 if k == 'P' else nr)
            print(f"| {k} | {a[0]/hn:.0f} | {a[1]/fw:.3f} | {a[2]/fw:.3f} | {(a[1]+a[2])/fw:.3f} | {a[4]/(a[3] or 1):.3f} ({a[3]/fw:.0%}) | {a[5]/fw:.0%} |")
        print("\nGrowth per fighter-week by rating band at the week's start")
        bands = ['<45', '45-49', '50-54', '55-59', '60-64', '65-69', '70+']
        print("| house | " + " | ".join(bands) + " |"); print("|---|" + "---|" * len(bands))
        for k in 'PC':
            B = defaultdict(lambda: [0, 0])
            for s in S:
                for b, v in s['gb'][k].items(): B[b][0] += v[0]; B[b][1] += v[1]
            print(f"| {k} | " + " | ".join(f"{B[b][1]/B[b][0]:.2f} ({B[b][0]})" if B[b][0] else "—" for b in bands) + " |")
        print("\nJoins (new fighters on a roster)")
        print("| house | per house-season | OVR mean | OVR med | ★1/2/3/4/5 | source fa/new/house | pot headroom | age |")
        print("|---|---|---|---|---|---|---|---|")
        for k in 'PC':
            J = [j for s in S for j in s['jn'][k]]; hn = ns * (1 if k == 'P' else nr)
            if not J: continue
            stc = Counter(j[1] for j in J); src = Counter(j[2] for j in J)
            print(f"| {k} | {len(J)/hn:.1f} | {mean([j[0] for j in J]):.1f} | {st.median([j[0] for j in J]):.0f} | {'/'.join(str(stc[i]) for i in range(1,6))} | {src['fa']}/{src['new']}/{src['house']} | {mean([j[3] for j in J]):.1f} | {mean([j[4] for j in J]):.1f} |")
        print("\nExits (fighters leaving a roster): count per house-season by cause; tenure (weeks), growth while there, bouts while there")
        causes = ['dead', 'expired', 'released', 'walkout', 'poached', 'moved', 'retired', 'freed', 'gone']
        print("| house | " + " | ".join(causes) + " | all | tenure mean | growth/exit | bouts/exit | rating at exit |")
        print("|---|" + "---|" * (len(causes) + 5))
        for k in 'PC':
            E = [e for s in S for e in s['ex'][k]]; hn = ns * (1 if k == 'P' else nr)
            c = Counter(e[0] for e in E)
            print(f"| {k} | " + " | ".join(f"{c[x]/hn:.2f}" for x in causes) + f" | {len(E)/hn:.2f} | {mean([e[1] for e in E]):.1f} | {mean([e[3]-e[2] for e in E]):.1f} | {mean([e[4] for e in E]):.1f} | {mean([e[3] for e in E]):.0f} |")
        print("\nLeague entries (under/feature/main): own OVR, opponents' mean / strongest, win %, survived %, entries per house-season")
        print("| house | tier | entries/house-season | own OVR | opp mean | opp max | own − opp mean | win % | top-3 % | alive % | CF | rival opps / FA opps |")
        print("|---|---|---|---|---|---|---|---|---|---|---|---|")
        M = [m for s in S for m in s['mm']]
        for k in 'PC':
            hn = ns * (1 if k == 'P' else nr)
            for t in ['under', 'feature', 'main']:
                X = [m for m in M if m[0] == k and m[1] == t]
                if not X: continue
                print(f"| {k} | {t} | {len(X)/hn:.1f} | {mean([x[2] for x in X]):.1f} | {mean([x[3] for x in X]):.1f} | {mean([x[4] for x in X]):.1f} | {mean([x[2]-x[3] for x in X]):+.1f} | {mean([x[5] for x in X]):.0%} | {mean([1 if 0 < x[6] <= 3 or x[5] else 0 for x in X]):.0%} | {mean([x[8] for x in X]):.0%} | {mean([x[7] for x in X]):.1f} | {mean([x[9] for x in X]):.1f} / {mean([x[10] for x in X]):.1f} |")
        print("\nUndercard win % by own OVR band (both kinds), and by gap own − opp mean")
        U = [m for m in M if m[1] == 'under']
        for k in 'PC':
            row = []
            for lo, hi in [(0, 45), (45, 50), (50, 55), (55, 60), (60, 99)]:
                X = [x for x in U if x[0] == k and lo <= x[2] < hi]
                row.append(f"{lo}-{hi}: {mean([x[5] for x in X]):.0%} n{len(X)} opp {mean([x[3] for x in X]):.0f}" if X else f"{lo}-{hi}: —")
            print(f"- {k}: " + " · ".join(row))
        for k in 'PC':
            row = []
            for lo, hi in [(-99, -10), (-10, -5), (-5, 0), (0, 5), (5, 99)]:
                X = [x for x in U if x[0] == k and lo <= x[2] - x[3] < hi]
                row.append(f"{lo}..{hi}: {mean([x[5] for x in X]):.0%} n{len(X)}" if X else f"{lo}..{hi}: —")
            print(f"- gap {k}: " + " · ".join(row))
        print("\nRegimes (fighter-weeks share) and yard level")
        for k in 'PC':
            c = Counter()
            for s in S:
                for a, b in s['reg'][k].items(): c[a] += b
            tot = sum(c.values()) or 1
            print(f"- {k}: " + ", ".join(f"{a} {b/tot:.0%}" for a, b in c.most_common()) + f" · yard level {mean([s['yard'][k]/max(1,s['yard']['n']) for s in S]):.2f}")
        FA = [s['fa'] for s in S if s.get('fa')]
        if FA:
            n = sum(f['n'] for f in FA); tot = sum(sum(f['s']) for f in FA)
            print(f"- free agents per week: {tot/n:.0f} (★1-5: " + "/".join(f"{sum(f['s'][i] for f in FA)/n:.1f}" for i in range(1,6)) + f"); fight-night fillers {sum(f['gen'] for f in FA)/n:.1f}, of them 64+ {sum(f['g64'] for f in FA)/n:.1f}")
        print(f"- rival discipline mean {mean([s['disc'] for s in S]):.0f} (the player's sim lanista: 50)")
    if LED:
        print("\nRivals' coin per house-season by function (in / out), top 16 by volume")
        L = defaultdict(lambda: [0, 0])
        n = 0
        for r in R:
            led = (r.get('rivals') or {}).get('led') or {}
            if not led: continue
            n += nriv(r)
            for k, v in led.items(): L[k][0] += v['i']; L[k][1] += v['o']
        for k, (i, o) in sorted(L.items(), key=lambda kv: -(kv[1][0] + kv[1][1]))[:16]:
            print(f"- {k}: +{i/n:.0f} / −{o/n:.0f}")
        print("\nThe player's coin per season (413 ledger categories, in / out)")
        P = defaultdict(lambda: [0, 0]); n = 0
        for r in R:
            led = r.get('led') or {}
            if not led: continue
            n += 1
            for k, v in led.items():
                if isinstance(v, dict): P[k][0] += v.get('i', 0); P[k][1] += v.get('o', 0)
        for k, (i, o) in sorted(P.items(), key=lambda kv: -(kv[1][0] + kv[1][1]))[:14]:
            print(f"- {k}: +{i/max(1,n):.0f} / −{o/max(1,n):.0f}")
