#!/usr/bin/env python3
"""deaths112 summary: python3 tools/plans/deaths112/dsum.py rows.jsonl [more.jsonl ...] [--tags a,b] [--brief]
Reads tools/mgrsim2.js rows (with the deaths112 `dx` field) and prints, per (tag, profile): deaths a season, rank, coin, rival deaths,
exposure (entries), the Fate funnel per entry (player vs rival houses), death rate by OVR band, the player's death paths and blood-money
choices, signings by stars, roster rating vs rivals, fame."""
import json, sys, statistics as st
from collections import defaultdict, Counter
args = [a for a in sys.argv[1:] if not a.startswith('--')]
TAGS = None; BRIEF = '--brief' in sys.argv
for i, a in enumerate(sys.argv):
    if a == '--tags': TAGS = sys.argv[i + 1].split(',')
if TAGS: args = [a for a in args if a not in ','.join(TAGS).split(',') and a != ','.join(TAGS)]
rows = []
for f in args:
    for l in open(f):
        l = l.strip()
        if not l: continue
        try: r = json.loads(l)
        except Exception: continue
        if r.get('err') or 'season' not in r: continue
        if TAGS and r['tag'] not in TAGS: continue
        rows.append(r)
G = defaultdict(list)
for r in rows: G[(r['tag'], r['profile'])].append(r)
med = lambda a: st.median(a) if a else float('nan')
mean = lambda a: sum(a) / len(a) if a else float('nan')
def band(o):
    return '<45' if o < 45 else '45-54' if o < 55 else '55-63' if o < 64 else '64-72' if o < 73 else '73+'
BANDS = ['<45', '45-54', '55-63', '64-72', '73+']
COND = {'clemency', 'killed', 'bought'}
out = []
P = out.append
for (tag, prof), R in sorted(G.items()):
    seeds = sorted(set(r['seed'] for r in R))
    bys = defaultdict(list)
    for r in R:
        bys[r['season'] - min(x['season'] for x in R if x['seed'] == r['seed']) + 1].append(r)
    full = [r for r in R if not r.get('partial')]
    bank = len(set(r['seed'] for r in R if r.get('bankrupt')))
    P(f"\n### {tag} · {prof} — {len(seeds)} runs, {len(R)} run-seasons, bankrupt {bank}/{len(seeds)}")
    P("| season | runs | deaths (mean) | rank med | coin end med | entries P | entries / rival | deaths / entry P | rival deaths / house | roster rating me / rivals | fame me / rivals | signed | ★ of signings (1/2/3/4/5) |")
    P("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    for s in sorted(bys):
        L = bys[s]; dx = [r['dx'] for r in L if r.get('dx')]
        if not dx: continue
        nriv = lambda r: max(1, (r.get('rivals') or {}).get('n') or 11)
        rivD = [sum(d['rivD'].values()) / nriv(r) for d, r in zip(dx, L)]
        entP = [d['ent']['P'] for d in dx]
        entC = [d['ent']['C'] / nriv(r) for d, r in zip(dx, L)]
        dpe = sum(r['deaths'] for r in L) / max(1, sum(entP))
        rr = [(d['rr']['me'] / d['rr']['n'], d['rr']['riv'] / d['rr']['n']) for d in dx if d['rr']['n']]
        stars = Counter()
        for d in dx:
            for j in d['join']['P']: stars[j[1]] += 1
        P(f"| {s} | {len(L)} | {mean([r['deaths'] for r in L]):.1f} | {med([r['rank'] for r in L if r.get('rank')]) if any(r.get('rank') for r in L) else '—'} | {med([r['end'] for r in L]):.0f} | {mean(entP):.1f} | {mean(entC):.1f} | {dpe:.2f} | {mean(rivD):.2f} | {mean([a for a,b in rr]):.0f} / {mean([b for a,b in rr]):.0f} | {mean([r.get('fame',0) for r in L]):.0f} / {mean([d.get('rivFame',0) for d in dx]):.0f} | {mean([r.get('signed',0) or 0 for r in L]):.1f} | {'/'.join(str(stars[i]) for i in range(1,6))} |")
    if BRIEF: continue
    # Fate funnel
    fr = [x for r in R for x in (r.get('dx') or {}).get('fr', [])]
    P("\nFate funnel per league entry (bouts with Fates; Winter Classic excluded):")
    P("| house | tier | entries | OVR mean | CF mean | CF<17 or thumb down → condemned | of which clemency | bought | killed | killed / entry |")
    P("|---|---|---|---|---|---|---|---|---|---|")
    for k in ['P', 'C']:
        for t in ['under', 'feature', 'main', 'spc100', 'sb104', 'all']:
            X = [x for x in fr if x[0] == k and x[1] != 'wc' and (t == 'all' or x[1] == t)]
            if not X: continue
            c = Counter(x[4] for x in X); nc = sum(c[v] for v in COND)
            P(f"| {k} | {t} | {len(X)} | {mean([x[2] for x in X]):.0f} | {mean([x[3] for x in X]):.1f} | {nc/len(X):.0%} | {c['clemency']/max(1,nc):.0%} | {c['bought']/max(1,nc):.0%} | {c['killed']/max(1,nc):.0%} | {c['killed']/len(X):.1%} |")
    P("\nDeath rate per entry by OVR band (P = player, C = rival houses, F = free agents):")
    P("| band | " + " | ".join(f"{k} entries · condemned · killed" for k in ['P', 'C', 'F']) + " |")
    P("|---|---|---|---|")
    for b in BANDS:
        cells = []
        for k in ['P', 'C', 'F']:
            X = [x for x in fr if x[0] == k and x[1] != 'wc' and band(x[2]) == b]
            c = Counter(x[4] for x in X); nc = sum(c[v] for v in COND)
            cells.append(f"{len(X)} · {nc/max(1,len(X)):.0%} · {c['killed']/max(1,len(X)):.0%}" if X else '—')
        P(f"| {b} | " + " | ".join(cells) + " |")
    X = [x for x in fr if x[0] == 'P' and x[1] != 'wc']
    rk = [x for x in X if x[6]]
    P(f"\nplayer entries by rookies (≤3 bouts): {len(rk)}/{len(X)} ({len(rk)/max(1,len(X)):.0%}); low morale (<35) entries: {sum(1 for x in X if x[7]<35)}; eliminated on the sand: {sum(1 for x in X if not x[5])/max(1,len(X)):.0%} (rivals {sum(1 for x in fr if x[0]=='C' and x[1]!='wc' and not x[5])/max(1,sum(1 for x in fr if x[0]=='C' and x[1]!='wc')):.0%})")
    dl = [d for r in R for d in (r.get('dx') or {}).get('dl', [])]
    pc = Counter(d['path'] for d in dl); why = Counter(d.get('why', '-') for d in dl if d['path'] in ('cond', 'thumb'))
    P(f"player deaths by path: {dict(pc)} · not bought back because: {dict(why)} · price med {med([d['price'] for d in dl if 'price' in d]) if dl else '-'} · coin at the verdict med {med([d['coin'] for d in dl if 'coin' in d]) if dl else '-'} · dead OVR med {med([d['ovr'] for d in dl]) if dl else '-'} · tiers {dict(Counter(d['tier'] for d in dl))}")
    pend = Counter()
    for r in R:
        for k2, v in ((r.get('dx') or {}).get('pend') or {}).items(): pend[k2] += v
    P(f"player verdicts: thumbs {pend['thumb']} (spared {pend['spared']}, down {pend['down']}) · blood-money asks {pend['blood']}: paid {pend['pay']} ({pend['payCoin']} coin), let go {pend['let']}")
    rp = Counter()
    for r in R:
        for k2, v in ((r.get('dx') or {}).get('rivD') or {}).items(): rp[k2.split(':')[0]] += v
    P(f"rival deaths by path: {dict(rp)}")
    byp = sum((r.get('dx') or {}).get('byp', 0) for r in R)
    if byp: P(f"fame-gate bypass signings: {byp}")
print('\n'.join(out))
