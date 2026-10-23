#!/usr/bin/env python3
"""page.py — the self-contained chart page for REPORT.md: treasury curves (chart.py's SVG), the proposals' before/after bars and the
targets table. Usage: python3 tools/plans/econ111/page.py <raw dir> out.html"""
import json,sys,os,subprocess,collections,statistics as st,html
D=sys.argv[1];OUT=sys.argv[2];HERE=os.path.dirname(os.path.abspath(__file__))
def load(f):
  p=os.path.join(D,f);return [json.loads(l) for l in open(p) if l.strip()] if os.path.exists(p) else []
main=load('main.jsonl');tmp=os.path.join(D,'_main_curve.svg')
subprocess.run([sys.executable,os.path.join(HERE,'chart.py'),os.path.join(D,'main.jsonl'),tmp],check=True)
curve=open(tmp).read()
files=[f for f in ['main.jsonl','v109aoff.jsonl','v109boff.jsonl','v109coff.jsonl','pre.jsonl','prop.jsonl','trade.jsonl'] if os.path.exists(os.path.join(D,f))]
tt=subprocess.run([sys.executable,os.path.join(HERE,'targets.py')]+[os.path.join(D,f) for f in files]+['--json'],capture_output=True,text=True).stdout.strip().split('\n')
J=json.loads(tt[-1]);
# proposals bars: careful runs, collapsed by S3 and alive after 5 seasons
LAB={'main':'Now (v1.11d)','v109aoff':'Winter Quarters a off','v109boff':'Classic off','v109coff':'Saturnalia off','P1':'P1 house patron','P2':'P2 fees +25%','P3':'P3 gate base 10','P4':'P4 wages −12%','P5':'P5 Renown cost 4','P6':'P6 rivals floor 40','P7':'P7 = P1 + P5 + P6'}
rows=[(k.split('|')[0],v) for k,v in J.items() if k.endswith('|careful') and k.split('|')[0] in LAB]
order=list(LAB);rows.sort(key=lambda x:order.index(x[0]))
W,H=760,30*len(rows)+50;L=190;R=130
X=lambda v:L+(W-L-R)*v/12
o=[f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="Careful house: runs in the black for seasons 1 to 3, of 12" font-size="12" font-family="system-ui,sans-serif">']
for t in range(0,13,3):o.append(f'<line x1="{X(t):.1f}" x2="{X(t):.1f}" y1="20" y2="{H-24}" class="grid"/><text x="{X(t):.1f}" y="{H-8}" text-anchor="middle" class="mut">{t}</text>')
for i,(tag,v) in enumerate(rows):
  y=26+i*30;n=v['n'];b=v['black']
  o.append(f'<text x="{L-8}" y="{y+14}" text-anchor="end" class="ink">{html.escape(LAB[tag])}</text>')
  o.append(f'<rect x="{L}" y="{y+2}" width="{max(2,X(b)-L):.1f}" height="18" rx="4" class="{"s1" if tag=="main" else "s2"}"><title>{LAB[tag]}: {b}/{n} runs in the black (S1–3) · {v["bk3"]}/{n} collapsed by S3 · S1 end coin {v["s1"]:.0f} · S3 rank {v["r3"]}</title></rect>')
  o.append(f'<text x="{X(b)+6:.1f}" y="{y+15}" class="ink">{b}/{n} · {v["bk3"]} collapsed</text>')
o.append('</svg>');bars='\n'.join(o)
tab=[l for l in tt[:-1]]
def md2html(lines):
  h=['<table>'];
  for i,l in enumerate(lines):
    if i==1:continue
    c=[x.strip() for x in l.strip('|').split('|')];tg='th' if i==0 else 'td'
    h.append('<tr>'+''.join(f'<{tg}>{html.escape(x)}</{tg}>' for x in c)+'</tr>')
  return '\n'.join(h+['</table>'])
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Manager Economy Measure</title>
<style>:root{{--bg:#f4f3ef;--card:#fcfcfb;--ink:#0b0b0b;--mut:#52514e;--grid:#e4e3df;--s1:#2a78d6;--s2:#eb6834}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#111110;--card:#1a1a19;--ink:#f0efec;--mut:#c3c2b7;--grid:#33332f;--s1:#3987e5;--s2:#d95926}}}}
:root[data-theme="dark"]{{--bg:#111110;--card:#1a1a19;--ink:#f0efec;--mut:#c3c2b7;--grid:#33332f;--s1:#3987e5;--s2:#d95926}}
body{{background:var(--bg);color:var(--ink);margin:0;padding:16px;font:14px/1.45 system-ui,sans-serif}}main{{max-width:980px;margin:0 auto}}
section{{background:var(--card);border-radius:8px;padding:14px;margin:0 0 16px;overflow-x:auto}}h1{{font-size:20px}}h2{{font-size:16px;margin:0 0 8px}}p{{color:var(--mut)}}
.grid{{stroke:var(--grid)}}.mut{{fill:var(--mut)}}.ink{{fill:var(--ink)}}.s1{{fill:var(--s1)}}.s2{{fill:var(--s2)}}
table{{border-collapse:collapse;font-size:12px}}td,th{{border-bottom:1px solid var(--grid);padding:4px 6px;text-align:left;white-space:nowrap}}
.curve{{background:#fcfcfb;border-radius:6px;padding:6px}}</style></head><body><main>
<h1>Manager economy re-measure (v1.11d, tools/mgrsim2.js)</h1>
<p>A founded house (Normal, 325 coin) played by three scripted lanistae, 12 seeds × up to 5 seasons each; a run stops when the house collapses. Numbers are medians unless stated. Full write-up: tools/plans/econ111/REPORT.md.</p>
<section><h2>Treasury by week</h2><div class="curve">{curve}</div><p>Median of the houses still running; the careful house's p25–p75 band shaded. Hover a point for the week.</p></section>
<section><h2>Careful house: runs in the black, seasons 1–3 (of 12)</h2>{bars}<p>Blue = the game now; orange = a Winter piece switched off, or a sim-only tuning proposal. Hover a bar for details.</p></section>
<section><h2>Targets (his E1a–E4a)</h2>{md2html(tab)}</section>
</main></body></html>'''
open(OUT,'w').write(page);os.remove(tmp)
print('wrote',OUT,len(page))
