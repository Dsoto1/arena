/* legendsim.js — Manager-mode study of ONE gladiator's career: how far can a cheap recruit go, how fast, and how often does he die?
   Usage: node tools/legendsim.js flavius-arena.html [careers=40] [seasons=10] [workers=3] [mode=mix|raw|gem] [seed=1000] [policy=patient|bold]
   Each career founds a new house (Normal start: 125 coin + the founding bonus, one raw recruit) on week 1 of a season and plays
   it headless with a scripted lanista who cares about that one fighter only:
     raw — keeps the founding recruit (rated 44-52, rookie potential).
     gem — week 1: releases him and signs the free agent rated <=55, asking <=16 a week, with the best potential (a lanista who
           scouted well — the sim reads the hidden pot/gem flag, which a player learns by scouting twice).
     mix — even careers raw, odd careers gem.
   Weekly policy (all through the game's own functions / [data-mg] actions where they exist):
     • contract: extend at <=2 weeks left (the game's rule: morale 35+, interest 25+); the Medicus lifts low morale.
     • care: a bed for serious wounds, then surgeon / Medicus / Asclepius (Infirmary actions); Hygeia regrows lost limbs.
     • fatigue above 55 (or hurt): rest week (no bout, no drills, rehab hours when hurt).
     • money: a blood fund (100 + 4 weeks' wage) is kept for blood prices and Hygeia; drills, trainer, exhibitions, kit and
       facilities only spend above it. Loans (Sica's syndicate) are not used.
     • yard: Standard drills (Light when tired or short of coin), a personal trainer while below potential and coin allows,
       4 training hours on the weakest of Speed / Strength / Intelligence, Gear care (+1 AP), Study the card, Morale talk.
     • facilities when rich (Armory, Training yard, alternately), city kit for the bout (weapon/armor/elixir by purse).
     • policy: bold = a league bout every week he can; patient = only bouts where he is rated no more than 3 below the
       field's average (6 after 4 idle weeks), otherwise an exhibition (no Fates) against the nearest-rated rival house.
     • bout: of the three billings he fits (rating lo-4..hi+2), the best of win chance x (purse + fame) from the game's
       own book (boutProbs); travel paid; invitations accepted when he is rated at least the field's floor.
     • verdicts: the Thumb rolled, the blood price PAID when the treasury can, the rudis refused (he may walk anyway),
       the levy bribed when affordable, freedom purchases refused.
   Stops after `seasons` seasons or when he dies, retires, walks free, leaves, or the house collapses.
   Writes tools/plans/legendsim-raw.json (every career, week by week) and tools/plans/legendsim-report.md. */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const PAGE=path.resolve(process.argv[2]||'flavius-arena.html');const N=+(process.argv[3]||40),SEASONS=+(process.argv[4]||10),WORKERS=+(process.argv[5]||3);
const MODE=process.argv[6]||'mix';const POL=process.argv[8]||'patient';const SEED0=+(process.argv[7]||1000);
const OUT=path.resolve(__dirname,'plans');const TAG=process.env.LEGEND_TAG?'-'+process.env.LEGEND_TAG:''; /* LEGEND_TAG=bold → legendsim-bold-raw.json / -report.md */
const RAW=path.join(OUT,`legendsim${TAG}-raw.json`),REP=path.join(OUT,`legendsim${TAG}-report.md`);

/* ---------------- in-page code ---------------- */
function inPage(){
  const W8=ms=>new Promise(r=>setTimeout(r,ms));
  const mb32=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const withTO=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r('timeout'),ms))]);
  /* a hidden [data-mg] button clicked inside the Manager window: the game's own handler (and every wrapper) runs */
  async function mg(a,id){const box=document.getElementById('mBody');if(!box)return false;const b=document.createElement('button');b.type='button';b.dataset.mg=a;if(id!=null)b.dataset.id=id;b.style.display='none';box.appendChild(b);
    try{b.click()}catch(e){}await W8(5);b.remove();return true}
  const KIT_PR={mw1:6,mw2:12,mw3:20,ma1:6,ma2:12,ma3:20,elix2:5,elix4:9};
  const FACS=['armory','yard','armory','yard','armory','yard','valet'];
  window.LEG={
    async start(cfg){
      Math.random=mb32(cfg.seed); /* the career's own stream: everything after this is reproducible per seed (modulo timers) */
      try{const C=calLoad();C.week=1;calSave()}catch(e){}
      MGR.view=null;newWorld({type:'custom',mgr:{name:'Lanista '+cfg.i,ludus:'Ludus Legendae '+cfg.i,city:LOCATIONS[1+cfg.i%12]?LOCATIONS[1+cfg.i%12].n:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},diff:'normal',portrait:{helm:'laurel'}}});
      const w=W_(),m=me();MGR.tab='ludus';let g=rosterOf(m)[0];const C={i:cfg.i,seed:cfg.seed,mode:cfg.mode,weeks:[],log:[],titles:[],end:null};
      if(cfg.mode==='gem'){const cands=freeAgents().filter(x=>effOvr(x)<=55&&askWage(x)<=16&&!x.inj&&!(x.severed||[]).length&&gAge(x)<=24&&(x.rec.ev||0)<=4).sort((a,b)=>((b.gem?20:0)+b.pot)-((a.gem?20:0)+a.pot));
        for(const x of cands){let ok=false;for(const k of [1,1.25,1.5,2]){const wage=Math.ceil(askWage(x)*k);if(offerVerdict(x,wage,12,0,false).ok){signGlad(x,wage,12,0,false);ok=true;break}}
          if(ok){if(g){g.contract=null}g=x;C.log.push(`signed gem ${x.name} ovr ${x.ovr} pot ${x.pot}${x.gem?' (gem)':''}`);break}}}
      g.scout=2;C.gid=g.id;C.name=g.name;C.start={ovr:g.ovr,eff:effOvr(g),pot:g.pot,gem:!!g.gem,age:gAge(g),cls:g.cls,stats:{...gStats(g)},wage:g.contract.wage,coin:m.coin};
      C.w0=w.week;C.s0=w.season;C.pol=cfg.pol;window.LC=C;return {name:g.name,start:C.start,week:w.week}},
    async week(){const C=window.LC;const w=W_(),m=me();const g=gById(C.gid);const k=w.week-C.w0;const S=Math.floor(k/12)+1;
      const gone=()=>{const g2=gById(C.gid);return !g2||!g2.alive||!g2.contract||g2.contract.mgr!==m.id};
      if(w.dead){C.end={why:'house collapsed',k,s:S};return C.end}
      if(gone()){return this.finish(k,S)}
      const note=t=>C.log.push(`S${S}W${(k%12)+1}: ${t}`);
      const rsv=()=>100+(g.contract.wage||0)*4; /* the blood fund a careful lanista keeps: a blood price (~25-60) + Hygeia for two limbs (40) */
      /* keep him wanting to stay: in the last 4 weeks of a contract, the recruiting hours court your own man (pitch his best motive,
         a gift every 2 weeks, a feast every 3) until his interest clears the renewal bar (25) */
      if(g.contract.weeks<=4&&interestOf(g,m)<32){
        if(w.hours>=4&&m.coin>=visitCost(g)+rsv()/2&&doVisit(g)!=null){w.hours-=4;C.court=(C.court||0)+1}
        if(w.hours>=2&&m.coin>=giftCost(g)+rsv()/2&&!(g.giftWk&&g.giftWk[m.id]&&w.week-g.giftWk[m.id]<2)){w.hours-=2;doGiftFighter(g);C.court=(C.court||0)+1}
        const mot=(g.motives||[]).map(([k2,wt])=>({k2,v:wt*mgrScore(m,k2,g),ok:mgrScore(m,k2,g)>=35})).filter(x=>x.ok).sort((a,b)=>b.v-a.v)[0];
        while(mot&&w.hours>=1&&interestOf(g,m)<32){w.hours--;pitch(g,mot.k2)}}
      /* contract */
      if(g.contract.weeks<=2){const ok=g.morale>=35&&interestOf(g,m)>=25;if(ok){g.contract.weeks=Math.max(0,g.contract.weeks)+8;g.contract.wage=Math.max(g.contract.wage,askWage(g));g.contract.expired=0}
        else note(`renewal refused (morale ${g.morale}, interest ${interestOf(g,m)})`)}
      /* care */
      let medUsed=false;
      if(g.inj&&!g.inj.war){try{if(typeof serious76==='function'&&serious76(g)&&!(w.beds76||[]).includes(g.id)){w.beds76=w.beds76||[];w.beds76.push(g.id)}}catch(e){}
        const req=injReq(g.inj);const was=g.inj.label;
        if(req==='surgeon'&&m.coin>=SURGEON)await mg('surgeon',g.id);
        else if(req!=='surgeon'&&m.coin>=MEDICUS){await mg('medic',g.id);medUsed=true}
        if(g.inj&&!g.inj.war&&m.coin>=ASCLEPIUS+rsv()/2)await mg('asclepius',g.id);
        C.care=(C.care||0)+1;if(g.inj)note(`still hurt: ${was}`)}
      if((g.severed||[]).length){try{if(!(w.beds76||[]).includes(g.id)){w.beds76=w.beds76||[];w.beds76.push(g.id)}}catch(e){}if(m.coin>=HYGEIA)await mg('heal',g.id)}
      if(!medUsed&&g.morale<45&&m.coin>=MEDICUS+20&&g.medWk!==w.week)await mg('medic',g.id);
      if(g.contract.weeks<=0&&!(g.morale>=35&&interestOf(g,m)>=25))note('contract ran out unsigned');
      /* fatigue / rest */
      const fat=gFat(g);const hurt=!!g.inj;const rest=!hurt&&fat>60;if(rest){g.restWk=w.week}
      /* facilities */
      {const nx=FACS.find((f,i)=>FACS.slice(0,i+1).filter(x=>x===f).length>facLvl(m,f));
        if(nx&&facLvl(m,nx)<3&&m.coin>=FAC_COST[facLvl(m,nx)]+rsv()+150){facBuild(m,nx);note(`built ${nx} ${facLvl(m,nx)}`)}}
      /* the yard */
      w.train=hurt||rest||m.coin<rsv()?'off':m.coin<rsv()+60||fat>35?'light':'std';
      g.ptrain=!hurt&&!rest&&g.ovr<g.pot&&m.coin>=PTRAIN_COST+rsv()+100;
      const P=thPlan(w);
      if(hurt){P.g[g.id]={rehab:2}}
      else if(!rest){const st=gStats(g);const want=['spd','str','int'];const hs={};const cur={...st};
        for(let h=0;h<TH_FIGHTER;h++){const kk=want.sort((a,b)=>(cur[a]+(a==='int'?4:0))-(cur[b]+(b==='int'?4:0)))[0];hs[kk]=(hs[kk]||0)+1;cur[kk]+=1.5}P.g[g.id]=hs}
      /* invitations: go when he is rated at least the field's floor and fit */
      for(const iv of (w.invites||[]).filter(x=>x.status==='open')){const D=specDef(iv.sid);if(!D)continue;
        if(!hurt&&effOvr(g)>=D.opp[0]){iv.ents=[g.id];iv.status='accepted';note(`accepted ${iv.n}`)}else if(effOvr(g)<D.opp[0]-10){iv.status='declined'}}
      /* the bout */
      let entered=null;const n=w.night;
      if(!hurt&&!rest&&!n.bye&&!n.selfBye&&g.morale>15){const o=effOvr(g);let best=null;
        n.bouts.forEach((bo,bi)=>{if(bo.done||(bo.wd||0)>=2)return;const T=TIERS[bo.tier];if(o<T.lo-4||o>T.hi+2)return;
          const out=bo.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0]||bo.ents.map(gById).filter(x=>x&&(!x.contract||x.contract.mgr!==m.id)).pop();if(!out)return;
          const ix=bo.ents.indexOf(out.id);const keep=bo.ents[ix];bo.ents[ix]=g.id;let p=.25;try{p=boutProbs(bo,'book')[ix]}catch(e){}bo.ents[ix]=keep;
          const opp=bo.ents.filter((id,j)=>j!==ix).map(gById).filter(Boolean);const gap=o-(opp.length?opp.reduce((a,x)=>a+effOvr(x),0)/opp.length:o);
          const sc=p*(bo.purse+15*T.fame)+bo.fee;if(C.pol==='patient'&&gap<-3&&!(C.idle>=4&&gap>=-6))return;if(!best||sc>best.sc)best={bi,ix,sc,p,out,gap}});
        if(best){const bo=n.bouts[best.bi];if(typeof travelState==='function'){const t=travelState(w);if(t&&!t.paid){m.coin-=t.cost;t.paid=true}}
          bo.ents[best.ix]=g.id;try{voidBets(bo,best.out.id)}catch(e){}entered={tier:bo.tier,p:+best.p.toFixed(3),purse:bo.purse,gap:+best.gap.toFixed(1)};C.idle=0;
          /* kit + yard one-hour jobs for the bout */
          const spare=m.coin-rsv();const kit=spare>=300?['mw3','ma3','elix4']:spare>=150?['mw2','ma2','elix2']:spare>=80?['ma1','elix2']:[];
          for(const it of kit){if(m.coin-KIT_PR[it]<rsv()/2)break;g.kit=g.kit||[];if(g.kit.length>=3)break;g.kit.push(it);g.kitWk=w.week;m.coin-=KIT_PR[it];C.kitSpent=(C.kitSpent||0)+KIT_PR[it]}
          try{const X=x74(w);if(thLeft(w)>=1&&!X.gear.includes(g.id)){X.gear.push(g.id);g.gear74=w.season+':'+w.week}
            if(thLeft(w)>=1&&!X.study){X.study=1;statGain(g,'int',0.4)}}catch(e){}}}
      if(!entered){C.idle=(C.idle||0)+1;
        /* patient: no bout he can stand in this week — an exhibition (no Fates) against the nearest-rated rival house instead */
        if(C.pol==='patient'&&!hurt&&!rest&&!n.bye&&thLeft(w)>=EXHIB_HOURS&&m.coin>=EXHIB_COST+rsv()){
          const opp=w.mgrs.filter(x=>!x.isPlayer&&!x.dead&&!x.sica&&rosterOf(x).some(y=>!y.inj)).sort((a,b)=>Math.min(...rosterOf(a).map(y=>Math.abs(effOvr(y)-effOvr(g))))-Math.min(...rosterOf(b).map(y=>Math.abs(effOvr(y)-effOvr(g)))))[0];
          if(opp){try{const X=exhibSetup(g.id,opp.id);thPlan(w).spent=(thPlan(w).spent||0)+EXHIB_HOURS;m.coin-=EXHIB_COST;X.g.exWk=w.week;const cfg=exhibCfg(X,false);const res=await withTO(simEvent(cfg),120000);
            if(res&&res!=='timeout'&&!res.error){exhibApply(res,cfg.exhibCtx);entered={tier:'exhib'};C.exhib=(C.exhib||0)+1}}catch(e){note('exhibition error '+e.message)}}}}
      try{const X=x74(w);if(g.morale<70&&thLeft(w)>=1&&!X.morale.includes(g.id)){X.morale.push(g.id);g.morale=clamp((g.morale||50)+5,0,100)}}catch(e){}
      /* the specials (invitationals, the Superbus) and the night */
      const sp0=(w.specialLog||[]).length;
      if(w.special&&!w.special.done){try{await withTO(specAutoRun(),180000)}catch(e){note('special error '+e.message)}}
      for(const x of (w.specialLog||[]).slice(sp0))if(x.mine)C.titles.push({k,s:S,t:x.n,won:x.champ===g.name});
      for(let i=0;i<n.bouts.length;i++)if(!n.bouts[i].done){try{const r=await withTO(runBoutSim(i),120000);if(r==='timeout'){n.bouts[i].done=true;note('bout timeout')}}catch(e){n.bouts[i].done=true;note('bout error '+e.message)}}
      let row=null;for(const bo of n.bouts)if(bo.res){const r=bo.res.rows.find(x=>x.gid===C.gid);if(r)row={tier:bo.tier,won:r.won,f:r.f,vd:r.vd,place:r.place}}
      /* verdicts */
      let guard=0,paid=0;while((w.pend||[]).length&&guard++<30){const Pd=w.pend[0];const mine=Pd.gid===C.gid;let r='';
        try{if(Pd.t==='thumb')r=settlePending(0,null,{d6:1+Math.floor(Math.random()*6),d12:1+Math.floor(Math.random()*12)});
          else if(Pd.t==='blood'){if(mine&&m.coin>=Pd.price){paid=Pd.price;r=settlePending(0,'pay')}else r=settlePending(0,'let')}
          else if(Pd.t==='levy')r=settlePending(0,m.coin>=Pd.price+rsv()/2?'bribe':'go');
          else if(Pd.t==='buyfree')r=settlePending(0,'keep');
          else r=settlePending(0,'stay')}catch(e){w.pend.shift()}
        if(mine&&Pd.t!=='levy')note(`${Pd.t}${Pd.t==='blood'?(paid?` — paid ${paid}`:` — could not pay ${Pd.price}`):''}: ${String(r).replace(/<[^>]+>/g,'').slice(0,90)}`)}
      /* after the bout, before the week ends: Hygeia for fresh lost limbs (a third lost limb retires him at the week's end) — not while on the road */
      {const g3=gById(C.gid);if(g3&&g3.alive&&(g3.severed||[]).length&&!(typeof roadLocked76==='function'&&roadLocked76(w))){try{if(!(w.beds76||[]).includes(g3.id)){w.beds76=w.beds76||[];w.beds76.push(g3.id)}}catch(e){}
        const n0=g3.severed.length;if(m.coin>=HYGEIA)await mg('heal',g3.id);if(g3.severed.length<n0)C.limbsHealed=(C.limbsHealed||0)+(n0-g3.severed.length);else if(n0>=3)note(`${n0} limbs lost and no Hygeia (coin ${m.coin}, repair spent ${w.repair||0})`)}
        else if(g3&&g3.alive&&(g3.severed||[]).length>=3)note('3 limbs lost on the road — the Infirmary is shut')}
      if(row&&row.vd)row.vd=(n.bouts.find(b=>b.res&&b.res.rows.some(x=>x.gid===C.gid))||{res:{rows:[]}}).res.rows.find(x=>x.gid===C.gid).vd;
      const c0=m.coin;let ok=true;try{ok=await withTO(endWeek(),60000)}catch(e){ok=false;note('endWeek error '+e.message)}
      if(ok===false||ok==='timeout'){note('endWeek blocked');C.end={why:'sim blocked',k,s:S};return C.end}
      const g2=gById(C.gid);const st=g2?gStats(g2):{};
      C.weeks.push({k,s:S,o:g2?clamp(Math.round(g2.ovr+statOvr(g2)),25,99):null,oe:g2?effOvr(g2):null,ov:g2?g2.ovr:null,pot:g2?g2.pot:null,st:{spd:Math.round(st.spd||0),str:Math.round(st.str||0),int:Math.round(st.int||0),lck:Math.round(st.lck||0),cha:Math.round(st.cha||0)},
        fa:g2?g2.fame||0:0,c:m.coin,fat:g2?gFat(g2):0,inj:hurt?1:0,rest:rest?1:0,b:entered?entered.tier:'',p:entered&&entered.p!=null?entered.p:null,gap:entered&&entered.gap!=null?entered.gap:null,won:row?(row.won?1:0):null,f:row?row.f:null,vd:row?row.vd:null,
        W:g2?g2.rec.w:0,E:g2?g2.rec.ev:0,age:g2?gAge(g2):null,paid:paid||0,mfame:m.fame,sev:g2?(g2.severed||[]).length:0});
      if(w.dead){C.end={why:'house collapsed',k,s:S};return C.end}
      if(gone())return this.finish(k,S);
      if(k+1>=12*C.seasons){return this.finish(k,S,'ran the distance')}
      return null},
    finish(k,S,why){const C=window.LC;const w=W_(),m=me();const g=gById(C.gid)||w.glads.find(x=>x.id===C.gid);
      let r=why;let fate='';
      if(!r){const gr=(w.grave||[]).find(x=>x.name===C.name);
        if(g&&g.freed2){r='walked free'}else if(gr){r='died';fate=gr.fate}else if(g&&g.retired){r='retired'}else if(g&&g.alive&&!g.contract){r='left the house'}
        else if(g&&g.alive&&g.contract&&g.contract.mgr!==m.id){r='poached'}else if(!g){const h=(w.news||[]).find(x=>x.text.includes(C.name)&&/dies|dead|fell|is gone|killed/i.test(x.text));r=h?'died':'vanished';fate=h?h.text.replace(/<[^>]+>/g,'').slice(0,120):''}else r='gone'}
      if(r==='gone'&&g&&!g.alive)r='died';
      if(!fate&&g){const h=(g.hist||[])[0];if(h)fate=h.txt}
      if(r==='retired'&&g&&(g.severed||[]).length>=2){r='retired (maimed)';fate=`${g.severed.length} limbs lost`}
      C.end={why:r,fate,k,s:S};
      /* silverware */
      const awards=[];for(const a of (w.awardHist||[]))for(const x of a.awards)if(x.who===C.name)awards.push({s:a.season-C.s0+1,n:x.name});
      C.awards=awards;C.final={rec:g?{...g.rec}:null,fame:g?g.fame:null,eff:g?effOvr(g):null,ovr:g?g.ovr:null,pot:g?g.pot:null,stats:g?{...gStats(g)}:null,age:g?gAge(g):null,coin:m.coin,houseFame:m.fame,fac:{...(m.fac||{})},
        superbus:(w.archives||[]).filter(a=>a.finale&&a.finale.champ===C.name).length};
      return C.end}};
}

/* ---------------- Node side: workers ---------------- */
async function worker(id,queue,results){
  const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_lfpool','0')});
  await pg.goto('file://'+PAGE);await pg.waitForTimeout(2000);
  await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await new Promise(r=>setTimeout(r,800));
    window.modal=async(t,b,btns)=>{const p=(btns||[]).find(x=>x.primary)||(btns||[])[0];return p?p.value:null};window.mToast=()=>{};window.say=()=>{};SPEED='snap';
    window.saveWorld=()=>Promise.resolve(); /* no career is ever stored: a sim world never touches the Store */
    const put=Store.put.bind(Store);Store.put=(col,...a)=>/^(mgrCareers|mgrArchives|hall|hallTrophies|annals)$/.test(col)?Promise.resolve():put(col,...a)});
  await pg.evaluate(`(${inPage.toString()})()`);
  while(queue.length){const job=queue.shift();const t0=Date.now();
    try{const s=await pg.evaluate(c=>LEG.start(c),job);await pg.evaluate(n=>{LC.seasons=n},SEASONS);
      let end=null,k=0;while(!end&&k++<SEASONS*12+30){end=await pg.evaluate(()=>LEG.week())}
      const C=await pg.evaluate(()=>{const C=window.LC;if(!C.final)LEG.finish(C.weeks.length?C.weeks[C.weeks.length-1].k:0,1,C.end&&C.end.why);return C});
      C.secs=Math.round((Date.now()-t0)/1000);results.push(C);
      process.stderr.write(`[w${id}] #${job.i} ${job.mode} ${C.name} start ${C.start.eff}/${C.start.pot} → ${C.end.why} at S${C.end.s} (wk ${C.end.k+1}) rec ${C.final&&C.final.rec?C.final.rec.w+'-'+(C.final.rec.ev-C.final.rec.w):'?'} best ${Math.max(...C.weeks.map(x=>x.o||0))} ${C.secs}s\n`);
      fs.writeFileSync(RAW+'.partial',JSON.stringify(results))}
    catch(e){process.stderr.write(`[w${id}] #${job.i} failed: ${e.message}\n`);try{await pg.reload();await pg.waitForTimeout(2000)}catch(e2){}}}
  if(errs.length)process.stderr.write(`[w${id}] page errors: ${[...new Set(errs)].slice(0,5).join(' | ')}\n`);
  await b.close()}

/* ---------------- analysis ---------------- */
const pct=(a,p)=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.max(0,Math.ceil(p/100*s.length)-1))]};
const med=a=>pct(a,50);const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;const f1=x=>x==null?'—':(+x).toFixed(1);const pc=(n,d)=>d?Math.round(100*n/d)+'%':'—';
function firstK(C,fn){const x=C.weeks.find(fn);return x?x.k+1:null}
function analyse(R){
  const L=[];const n=R.length;const wk=k=>k==null?'—':`${k} (S${Math.floor((k-1)/12)+1})`;
  const ends={};for(const C of R)ends[C.end.why]=(ends[C.end.why]||0)+1;
  const deaths=R.filter(C=>C.end.why==='died');
  L.push(`# Legend sim — one gladiator, many careers`,'',`Generated by \`node tools/legendsim.js\` on ${new Date().toISOString().slice(0,10)} · ${n} careers · up to ${SEASONS} seasons each · mode ${MODE} · policy ${POL} · seeds ${SEED0}…${SEED0+n-1}.`,
    `Raw data: \`tools/plans/legendsim-raw.json\` (every career, week by week). Policy: see the header of tools/legendsim.js.`,'');
  /* starts */
  L.push('## The recruits','',`| | median | min | max |`,`|---|---|---|---|`);
  for(const [lab,f] of [['rating (effOvr)',C=>C.start.eff],['potential',C=>C.start.pot],['age',C=>C.start.age],['wage / wk',C=>C.start.wage]])L.push(`| ${lab} | ${med(R.map(f))} | ${Math.min(...R.map(f))} | ${Math.max(...R.map(f))} |`);
  L.push('',`Gems (hidden 💎 flag): ${R.filter(C=>C.start.gem).length}/${n}.`,'');
  /* how careers end */
  L.push('## How the careers end','',`| outcome | careers | median season |`,`|---|---|---|`);
  for(const [k,v] of Object.entries(ends).sort((a,b)=>b[1]-a[1]))L.push(`| ${k} | ${v} (${pc(v,n)}) | ${med(R.filter(C=>C.end.why===k).map(C=>C.end.s))} |`);
  {const byS={};for(const C of deaths)byS[C.end.s]=(byS[C.end.s]||0)+1;L.push('',`Deaths by season: ${Object.entries(byS).map(([s,v])=>`S${s}: ${v}`).join(' · ')||'none'}.`);
   const fates={};for(const C of deaths){const f=(C.end.fate||'?').replace(/^died: /,'').slice(0,60);fates[f]=(fates[f]||0)+1}
   L.push(`Death causes: ${Object.entries(fates).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([f,v])=>`${f} ×${v}`).join('; ')||'—'}.`);
   const paid=R.reduce((a,C)=>a+C.weeks.filter(x=>x.paid).length,0);L.push(`Blood prices paid (a death bought back): ${paid} across all careers.`,'')}
  {const modes=[...new Set(R.map(C=>C.mode))];if(modes.length>1){L.push('',`| mode | careers | start rating/pot (median) | died | ran the distance | best rating (median / max) | career wins (median / max) | invitational or Superbus titles |`,`|---|---|---|---|---|---|---|---|`);
   for(const md of modes){const A=R.filter(C=>C.mode===md);const bo=A.map(C=>Math.max(...C.weeks.map(x=>x.o||0)));const wn=A.map(C=>C.final&&C.final.rec?C.final.rec.w:0);
     L.push(`| ${md} | ${A.length} | ${med(A.map(C=>C.start.eff))}/${med(A.map(C=>C.start.pot))} | ${A.filter(C=>C.end.why==='died').length} | ${A.filter(C=>C.end.why==='ran the distance').length} | ${med(bo)} / ${Math.max(...bo)} | ${med(wn)} / ${Math.max(...wn)} | ${A.reduce((a,C)=>a+C.titles.filter(t=>t.won).length,0)} |`)}}}
  L.push('','"rating" below = the fighter\'s overall without wound penalties (ovr + the five ratings\' bonus); fresh lost limbs (−6 each) and injuries dip it until healed.','');
  /* survival curve */
  {L.push('## Survival','',`| season | alive at its start | bouts/season (median) | win rate | avg CF/bout |`,`|---|---|---|---|---|`);
   for(let s=1;s<=SEASONS;s++){const alive=R.filter(C=>C.weeks.some(x=>x.s===s));if(!alive.length)break;const ws=alive.flatMap(C=>C.weeks.filter(x=>x.s===s&&x.won!=null));
     L.push(`| ${s} | ${alive.length} (${pc(alive.length,n)}) | ${med(alive.map(C=>C.weeks.filter(x=>x.s===s&&x.won!=null).length))} | ${pc(ws.filter(x=>x.won).length,ws.length)} | ${f1(avg(ws.map(x=>x.f||0)))} |`)}L.push('')}
  /* milestones */
  L.push('## Milestones — weeks (season) to reach them','',`Among careers that reached it; "reached" counts every career (dead ones included).`,'',`| milestone | reached | median | fastest 10% | slowest 10% |`,`|---|---|---|---|---|`);
  const MS=[['★★ rating 55',x=>x.o>=55],['★★★ rating 64',x=>x.o>=64],['★★★★ rating 73',x=>x.o>=73],['★★★★★ rating 82',x=>x.o>=82],['rating 88',x=>x.o>=88],['rating 92',x=>x.o>=92],
    ['Speed 76',x=>x.st.spd>=76],['Speed 96',x=>x.st.spd>=96],['Strength 76',x=>x.st.str>=76],['Strength 87',x=>x.st.str>=87],['Strength 96',x=>x.st.str>=96],['Int 76 (Fighter mind)',x=>x.st.int>=76],['Int 86 (Veteran)',x=>x.st.int>=86],['Int 96 (Master)',x=>x.st.int>=96],
    ['fame 6 (1 laurel)',x=>x.fa>=6],['fame 20 (2)',x=>x.fa>=20],['fame 40 (3)',x=>x.fa>=40],['fame 60 (4)',x=>x.fa>=60],['fame 80 (5)',x=>x.fa>=80],['fame 100',x=>x.fa>=100],
    ['10 wins',x=>x.W>=10],['25 wins',x=>x.W>=25],['50 wins',x=>x.W>=50],['first main event',x=>x.b==='main'],['first main-event win',x=>x.b==='main'&&x.won]];
  const msOut={};
  for(const [lab,fn] of MS){const ks=R.map(C=>firstK(C,fn)).filter(x=>x!=null);msOut[lab]={reached:ks.length,med:med(ks)};L.push(`| ${lab} | ${ks.length} (${pc(ks.length,n)}) | ${wk(med(ks))} | ${wk(pct(ks,10))} | ${wk(pct(ks,90))} |`)}
  L.push('');
  /* rating / money curves */
  L.push('## Curves by season (median of careers alive at season end; p90 in brackets)','',`| season | rating | potential | Spd | Str | Int | fame | wins (total) | treasury |`,`|---|---|---|---|---|---|---|---|---|`);
  for(let s=1;s<=SEASONS;s++){const E=R.map(C=>{const a=C.weeks.filter(x=>x.s===s);return a.length?a[a.length-1]:null}).filter(Boolean);if(!E.length)break;
    const c=f=>`${med(E.map(f))} (${pct(E.map(f),90)})`;L.push(`| ${s} | ${c(x=>x.o)} | ${c(x=>x.pot)} | ${c(x=>x.st.spd)} | ${c(x=>x.st.str)} | ${c(x=>x.st.int)} | ${c(x=>x.fa)} | ${c(x=>x.W)} | ${c(x=>x.c)} |`)}
  L.push('');
  /* billing mix */
  {const all=R.flatMap(C=>C.weeks.filter(x=>x.b));const by={};for(const x of all){by[x.b]=by[x.b]||{n:0,w:0,f:0};by[x.b].n++;by[x.b].w+=x.won?1:0;by[x.b].f+=x.f||0}
   L.push('## Bouts by billing','',`| billing | bouts | win rate | avg CF | avg book chance |`,`|---|---|---|---|---|`);
   for(const t of ['under','feature','main'])if(by[t])L.push(`| ${t} | ${by[t].n} | ${pc(by[t].w,by[t].n)} | ${f1(by[t].f/by[t].n)} | ${f1(100*avg(all.filter(x=>x.b===t).map(x=>x.p||0)))}% |`);
   const wkAll=R.flatMap(C=>C.weeks);L.push('',`Weeks: ${wkAll.length} played · fought ${pc(all.filter(x=>x.b!=='exhib').length,wkAll.length)} · exhibitions ${pc(all.filter(x=>x.b==='exhib').length,wkAll.length)} · rested ${pc(wkAll.filter(x=>x.rest).length,wkAll.length)} · hurt ${pc(wkAll.filter(x=>x.inj).length,wkAll.length)}.`,'')}
  /* stalls */
  {const st=[];for(const C of R){const ws=C.weeks;let best=-1,since=0,longest=0,at=null;for(const x of ws){if(x.o>best){best=x.o;since=0}else{since++;if(since>longest){longest=since;at=best}}}st.push({longest,at,capped:ws.length&&ws[ws.length-1].ov>=ws[ws.length-1].pot})}
   const capWk=R.map(C=>firstK(C,x=>x.ov>=x.pot)).filter(x=>x!=null);
   L.push('## Where progress stalls','',`- Base rating reaches the hidden potential (no more drill/win gains on ovr) in ${capWk.length}/${n} careers, median week ${wk(med(capWk))}; after that only the five ratings (statOvr, capped +15) still move the overall.`,
     `- Longest run without a new best rating: median ${med(st.map(x=>x.longest))} weeks (p90 ${pct(st.map(x=>x.longest),90)}), typically sitting at rating ${med(st.filter(x=>x.at!=null).map(x=>x.at))}.`,
     `- Final potential: median ${med(R.map(C=>C.final&&C.final.pot||0))}, max ${Math.max(...R.map(C=>C.final&&C.final.pot||0))} (start median ${med(R.map(C=>C.start.pot))}).`,'')}
  /* ceiling */
  {const best=R.map(C=>({C,o:Math.max(...C.weeks.map(x=>x.o||0)),W:C.final&&C.final.rec?C.final.rec.w:0,E:C.final&&C.final.rec?C.final.rec.ev:0,fa:Math.max(...C.weeks.map(x=>x.fa||0)),tw:C.titles.filter(t=>t.won).length,sb:C.final?C.final.superbus:0,aw:(C.awards||[]).length})).sort((a,b)=>(b.o*2+b.W+b.tw*10)-(a.o*2+a.W+a.tw*10));
   L.push('## The ceiling','',`| career | start (rating/pot) | best rating | final Spd/Str/Int | record | best fame | titles won | Superbus | season awards | end |`,`|---|---|---|---|---|---|---|---|---|---|`);
   for(const b of best.slice(0,8)){const C=b.C;const s=C.final&&C.final.stats||{};L.push(`| #${C.i} ${C.mode} | ${C.start.eff}/${C.start.pot} | ${b.o} | ${Math.round(s.spd||0)}/${Math.round(s.str||0)}/${Math.round(s.int||0)} | ${b.W}-${b.E-b.W} | ${b.fa} | ${C.titles.filter(t=>t.won).map(t=>t.t.replace(/^The /,'')).join(', ')||'—'} | ${b.sb} | ${(C.awards||[]).map(a=>a.n.replace(/^The /,'')).slice(0,4).join(', ')||'—'} | ${C.end.why} S${C.end.s} |`)}
   const inv=R.flatMap(C=>C.titles);L.push('',`Invitationals/Superbus entered: ${inv.length} · won ${inv.filter(t=>t.won).length}. Superbus crowns: ${R.reduce((a,C)=>a+(C.final?C.final.superbus:0),0)}. Season awards to him: ${R.reduce((a,C)=>a+(C.awards||[]).length,0)}.`,
     `Note: the Manager's "Grand Games" flag (purses ×1.6) is hard-wired off since v0.28 (17-manager makeNight \`grand=false\`); the season finale is the Flavius Superbus (top-4 houses, one fighter each) — used here as the Grand Games title.`,'');
   return {L,best,msOut}}
}
function propose(R,best){
  /* Legend tiers: candidate thresholds scored by how many careers EVER meet all of them, with the week they did */
  const n=R.length;const cands=[];
  for(const o of [82,85,88,90,92])for(const W of [15,20,25,30,40,50])for(const fa of [60,80,100])for(const T of [0,1]){
    const ks=R.map(C=>{let titles=0;let t=null;for(const x of C.weeks){titles=C.titles.filter(z=>z.won&&z.k<=x.k).length+(C.awards||[]).filter(a=>/Superbus/.test(a.n)&&a.s<=x.s).length;
      if(x.o>=o&&x.W>=W&&x.fa>=fa&&titles>=T){t=x.k+1;break}}return t}).filter(x=>x!=null);
    cands.push({o,W,fa,T,hit:ks.length,share:ks.length/n,med:med(ks)})}
  return cands}

/* ---------------- main ---------------- */
(async()=>{fs.mkdirSync(OUT,{recursive:true});
  const queue=Array.from({length:N},(_,i)=>({i,seed:SEED0+i,mode:MODE==='mix'?(i%2?'gem':'raw'):MODE,pol:POL}));const results=[];const t0=Date.now();
  await Promise.all(Array.from({length:Math.min(WORKERS,N)},(_,k)=>worker(k,queue,results)));
  results.sort((a,b)=>a.i-b.i);fs.writeFileSync(RAW,JSON.stringify({made:new Date().toISOString(),careers:N,seasons:SEASONS,mode:MODE,seed:SEED0,results}));try{fs.unlinkSync(RAW+'.partial')}catch(e){}
  const {L,best}=analyse(results);const cands=propose(results,best);
  const pick=cands.filter(c=>c.share>0&&c.share<=0.06).sort((a,b)=>b.share-a.share||b.o-a.o)[0];
  L.push('## Legend thresholds — candidates','',`Share of careers that EVER meet all four (rating, career wins, fame, titles = invitationals/Superbus won), and the median week they did. Candidates reached by 1–10% of careers:`,'',
    `| rating ≥ | wins ≥ | fame ≥ | titles ≥ | careers | median week |`,`|---|---|---|---|---|---|`);
  for(const c of cands.filter(c=>c.share>0&&c.share<=0.10).sort((a,b)=>a.share-b.share||b.o-a.o).slice(0,14))L.push(`| ${c.o} | ${c.W} | ${c.fa} | ${c.T} | ${c.hit} (${Math.round(c.share*100)}%) | ${c.med} (S${Math.floor((c.med-1)/12)+1}) |`);
  L.push('',pick?`Auto-pick (largest share ≤ 6%): rating ${pick.o}+, ${pick.W}+ wins, fame ${pick.fa}+, ${pick.T} title(s) → ${Math.round(pick.share*100)}% of careers, median week ${pick.med}.`:'No candidate lands at or under 6% with at least one career.','',
    `Run time: ${Math.round((Date.now()-t0)/60000)} min (${WORKERS} workers).`);
  fs.writeFileSync(REP,L.join('\n')+'\n');console.log(L.join('\n'))})();
