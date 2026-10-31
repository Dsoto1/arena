p='/home/user/arena/.claude/worktrees/agent-a0ad80547fd7a3602/tools/mgrsim2.js'
s=open(p).read()
dx=open('/home/user/arena/.claude/worktrees/agent-a0ad80547fd7a3602/tools/plans/deaths112/dx.js').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a[:80],s.count(a))
    s=s.replace(a,b)
rep("  newSeason();for(const g of ros())known.set(g.id,g);\n","  newSeason();for(const g of ros())known.set(g.id,g);\n"+dx)
rep("    let used=new Set();\n","    let used=new Set();dxWeekStart();\n")
rep("D.bouts=(D.bouts||0)+w.night.bouts.length;settle()}}catch(e){err('week',e)}","D.bouts=(D.bouts||0)+w.night.bouts.length;settle();dxAfterBouts()}}catch(e){err('week',e)}")
rep("    roll();cur.curve.push([label,m.coin,ros().length]);","    roll();dxWeekEnd();cur.curve.push([label,m.coin,ros().length]);")
open(p,'w').write(s)
print('ok')
