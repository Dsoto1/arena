import sys
p='/home/user/arena/.claude/worktrees/agent-a0ad80547fd7a3602/tools/mgrsim2.js'
s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a[:80],s.count(a))
    s=s.replace(a,b)
rep("const LS=JSON.parse(opt('ls')||'{}'),PATCH=opt('patch')||'';","const LS=JSON.parse(opt('ls')||'{}'),PATCH=opt('patch')||'',SIMK=JSON.parse(opt('simk')||'{}');")
rep("const SIM=async({profile,seed,SEASONS,START,PATCH,BUY})=>{","const SIM=async({profile,seed,SEASONS,START,PATCH,BUY,SIMK})=>{window.__SIMK=Object.assign({},SIMK||{},window.__SIMK||{});")
rep("res=await pg.evaluate(SIM,{profile:J.p,seed:J.s,SEASONS,START,PATCH,BUY})","res=await pg.evaluate(SIM,{profile:J.p,seed:J.s,SEASONS,START,PATCH,BUY,SIMK})")
rep("    mimic:{cpu:true,camp:'mend',wcIn:true,classicPick:'best'}}[profile];",
"    mimic:{cpu:true,camp:'mend',wcIn:true,classicPick:'best'}}[profile];\n"
"  /* deaths112 lanista knobs (--simk JSON, or window.__SIMK set by --patch; all unset = the econ111 behaviour):\n"
"     blood 'value' (default: OVR >= 58 above the reserve; the CPU rule for mimic) | 'always' (whenever the coin is there) | 'smart' (any fighter\n"
"       but the roster's worst when > 4, if coin >= price + 2 weeks' wages) | 'never' . bypass: true = also court fame-gated recruits at 17's\n"
"       fameBypassX x ask . entFit: how far below a tier's floor a fighter may be entered (default 4 = T.lo - 4, as 17 makeNight) . entMax:\n"
"       entries a week (default 3) . entCpu: true = enter like a rival house (17 makeNight: main first, one a night, a second 50% of the time,\n"
"       each with p 0.62 + risk/250) . entFat: skip fighters above this fatigue . entMorale: skip at or below this morale (default 15) */\n"
"  const K=window.__SIMK||{};")
rep("else if(P.t==='blood'){const pay=PR.blood==='always'?m.coin>=P.price:PR.cpu?(g&&effOvr(g)>=58&&m.coin>=P.price+20):(g&&effOvr(g)>=58&&m.coin>=P.price+reserve());settlePending(0,pay?'pay':'let')}",
"else if(P.t==='blood'){let pay=PR.blood==='always'?m.coin>=P.price:PR.cpu?(g&&effOvr(g)>=58&&m.coin>=P.price+20):(g&&effOvr(g)>=58&&m.coin>=P.price+reserve());\n"
"        if(K.blood==='always')pay=m.coin>=P.price;else if(K.blood==='never')pay=false;\n"
"        else if(K.blood==='smart'){const R=ros().slice().sort((a,b)=>effOvr(a)-effOvr(b));const worst=R.length>4&&R[0]===g;pay=!!g&&!worst&&m.coin>=P.price+wagesOf(m)*2}\n"
"        settlePending(0,pay?'pay':'let')}")
rep("const enter=()=>{const used=new Set();for(const bo of w.night.bouts){if(bo.done||bo.po104||bo.wc109||(typeof any100Sp==='function'&&any100Sp(bo)))continue;const T=TIERS[bo.tier];if(!T)continue;",
"const enter=()=>{const used=new Set();let nEnt=0;const eMax=K.entCpu?(Math.random()<.5?2:1):(K.entMax??3);const eFit=K.entFit??4;const eMor=K.entMorale??15;const TO=['main','feature','under'];\n"
"    for(const bo of [...w.night.bouts].sort((a,b)=>K.entCpu?TO.indexOf(a.tier)-TO.indexOf(b.tier):0)){if(bo.done||bo.po104||bo.wc109||(typeof any100Sp==='function'&&any100Sp(bo)))continue;const T=TIERS[bo.tier];if(!T)continue;")
rep("      const g=ros().filter(g=>!g.inj&&g.morale>15&&!used.has(g.id)&&!g.loanFrom&&!bo.ents.includes(g.id)&&!(typeof r101Block==='function'&&r101Block(g))&&effOvr(g)>=T.lo-4&&effOvr(g)<=T.hi+2&&!(typeof inBed76==='function'&&inBed76(g))).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g)continue;",
"      if(nEnt>=eMax)continue;if(K.entCpu&&Math.random()>=0.62+50/250)continue;\n"
"      const g=ros().filter(g=>!g.inj&&g.morale>eMor&&!(K.entFat!=null&&typeof gFat==='function'&&gFat(g)>K.entFat)&&!used.has(g.id)&&!g.loanFrom&&!bo.ents.includes(g.id)&&!(typeof r101Block==='function'&&r101Block(g))&&effOvr(g)>=T.lo-eFit&&effOvr(g)<=T.hi+2&&!(typeof inBed76==='function'&&inBed76(g))).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g)continue;")
rep("if(!out)continue;bo.ents[bo.ents.indexOf(out.id)]=g.id;used.add(g.id)}",
"if(!out)continue;bo.ents[bo.ents.indexOf(out.id)]=g.id;used.add(g.id);nEnt++}")
rep("    const cand=L.filter(g=>m.fame>=reqFame(g)).sort((a,b)=>key(b)-key(a)).slice(0,want-ros().length+2);\n    for(const g of cand){if(ros().length>=want)break;scout(g);pitchOne(g);\n      const wage=Math.ceil(askWage(g)*PR.wageX[PR.wageX.length-1]);",
"    const gated=g=>m.fame<reqFame(g);const bx=g=>gated(g)?fameBypassX(g,m):1;\n"
"    const cand=L.filter(g=>m.fame>=reqFame(g)||(K.bypass&&askWage(g)*fameBypassX(g,m)<=Math.max(6,(m.coin-reserve())/6))).sort((a,b)=>key(b)-key(a)).slice(0,want-ros().length+2);\n"
"    for(const g of cand){if(ros().length>=want)break;scout(g);pitchOne(g);\n"
"      if(gated(g)){const xs=[1,1.1].map(x=>x*bx(g));const wage=Math.ceil(askWage(g)*xs[1]);if(m.coin<wage*(PR.reserveWk||1)+wagesOf(m)*(PR.reserveWk||0)&&ros().length>=4)continue;if(tryOffer(g,xs,0)&&window.__DX)window.__DX.byp++;continue}\n"
"      const wage=Math.ceil(askWage(g)*PR.wageX[PR.wageX.length-1]);")
open(p,'w').write(s)
print('ok')
