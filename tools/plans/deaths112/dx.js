  /* ------------------------------------------------ deaths112 logging (sim-side wrappers; the game's functions still do the work) ------------------------------------------------
     row.dx per season: fr = every league Fate call [house P/C/F, tier (under/feature/main/spec/wc), OVR, CF, final verdict, alive on the sand 0/1, rookie 0/1, morale]
       (P verdicts settle later: p-thumb/p-blood are rewritten to spared/bought/killed) · dl = the player's deaths {wk,tier,ev,cf,path,ovr,fame,ev#,price,coin,res,why}
       · pend = the player's thumb/blood tallies · rivD = rival deaths by path · ent = entries {P, C (all rivals), cw (rival-weeks)} · join = new fighters
       {P:[[ovr,stars,req,houseFame,how]], C:{stars:n}} · byp = fame-gate bypass signings · rr = weekly roster rating (top-5 mean) {me, riv (mean of rivals)} */
  const DXmk=()=>({fr:[],dl:[],pend:{thumb:0,spared:0,down:0,blood:0,pay:0,let:0,payCoin:0},rivD:{},ent:{P:0,C:0,cw:0},join:{P:[],C:{}},byp:0,rr:{me:0,riv:0,n:0},rivFame:0});
  const DX=()=>{if(!cur.dx)cur.dx=DXmk();window.__DX=cur.dx;return cur.dx};
  const kindOf=mg=>mg?(mg.isPlayer?'P':(mg.sica?'S':'C')):'F';
  const PCTX=new Map();let FCTX=null;const KILLED=new Set();
  {const base=leagueFate;leagueFate=function(glad,row,mgr,bout,boutIdx,opt){const k=kindOf(mgr);const tier=bout?(bout.wc109?'wc':(TIERS[bout.tier]?bout.tier:'spec')):'spec';
    const c={k,tier,ev:bout?bout.ev:'',cf:(row&&row.f)||0,ovr:effOvr(glad),fame:glad.fame||0,n:(glad.rec&&glad.rec.ev)||0,mor:Math.round(glad.morale||0),wk:w.week};
    const prev=FCTX;FCTX=c;let r;try{r=base.apply(this,arguments)}finally{FCTX=prev}
    try{const d=DX();const i=d.fr.push([k,tier,c.ovr,c.cf,(r&&r.vd)||'',row&&row.alive===false?0:1,c.n<=3?1:0,c.mor])-1;if(k==='P'&&r&&/^p-(thumb|blood)$/.test(r.vd))PCTX.set(glad.id,{...c,fi:i,d,path:r.vd==='p-thumb'?'thumb':'cond'})}catch(e){err('dxFate',e)}
    return r};window.leagueFate=leagueFate}
  {const base=settlePending;settlePending=function(pi,choice,extra){const P=(w.pend||[])[pi];const g=P?gById(P.gid):null;const coin0=m.coin;const C=P&&g?PCTX.get(g.id):null;
    const r=base.apply(this,arguments);
    try{if(P&&g&&(P.t==='thumb'||P.t==='blood')){const d=C?C.d:DX();
      if(P.t==='thumb'){d.pend.thumb++;const nb=(w.pend||[]).find(x=>x.t==='blood'&&x.gid===g.id);if(nb){d.pend.down++;if(C)C.path='thumb'}else{d.pend.spared++;if(C){d.fr[C.fi][4]='spared';PCTX.delete(g.id)}}}
      else{d.pend.blood++;if(g.alive!==false){d.pend.pay++;d.pend.payCoin+=coin0-m.coin;if(C){d.fr[C.fi][4]='bought';PCTX.delete(g.id)}}
        else{d.pend.let++;if(C){d.fr[C.fi][4]='killed';const R=ros().slice().sort((a,b)=>effOvr(a)-effOvr(b));
          d.dl.push({wk:C.wk,tier:C.tier,ev:C.ev,cf:C.cf,path:C.path==='thumb'?'thumb':'cond',ovr:C.ovr,fame:C.fame,n:C.n,price:P.price,coin:coin0,res:Math.round(reserve()),why:choice==='pay'?'pay-refused':(coin0<P.price?'no-coin':effOvr(g)<58?'ovr<58':'reserve')});PCTX.delete(g.id)}}}}}catch(e){err('dxPend',e)}
    return r};window.settlePending=settlePending}
  {const base=killFighter;killFighter=function(glad,mgr){const k=kindOf(mgr);try{KILLED.add(glad.id);if(k==='C'||k==='S'){const d=DX();const t=FCTX?FCTX.tier:'other';d.rivD['bout:'+t]=(d.rivD['bout:'+t]||0)+1}}catch(e){}return base.apply(this,arguments)};window.killFighter=killFighter}
  /* the player's signings through 17 signGlad: rating, stars, the fame gate and the house's fame at the time */
  {const base=signGlad;signGlad=function(glad,wage){try{const d=DX();d.join.P.push([effOvr(glad),starsOf(effOvr(glad)),reqFame(glad),Math.round(m.fame||0),wage>=askWage(glad)*1.3&&m.fame<reqFame(glad)?'bypass':'sign'])}catch(e){}return base.apply(this,arguments)};window.signGlad=signGlad}
  /* the week's snapshot: every house's roster (deaths that skip killFighter: festering wounds, flight from the infirmary, the war) */
  let SNAP=new Map();
  const dxWeekStart=()=>{DX();SNAP=new Map();for(const x of w.mgrs){if(x.dead)continue;for(const g of rosterOf(x))SNAP.set(g.id,{g,k:kindOf(x)})}};
  const dxAfterBouts=()=>{try{const d=DX();const R=rivals();d.ent.cw+=R.length;for(const b of w.night.bouts){if(!b.done||b.wc109)continue;for(const id of b.ents){const g=gById(id);const c=g&&(g.contract||(g.fallen105?{mgr:g.fallen105.mgr}:null));if(!c)continue;const x=mgrById(c.mgr);if(!x)continue;const k=kindOf(x);if(k==='P')d.ent.P++;else if(k==='C')d.ent.C++}}}catch(e){err('dxEnt',e)}};
  const pathOf=g=>{const t=((g.hist||[])[0]||{}).txt||'';return /untreated/.test(t)?'untreated':/fled the infirmary/.test(t)?'fled':/war/.test(t)?'war':/died at|condemned|Fate|·/.test(t)?'bout':'other'};
  const dxWeekEnd=()=>{try{const d=DX();
      for(const [id,{g,k}] of SNAP){if(g.alive!==false||g.freed2||g.retired)continue;if(KILLED.has(id))continue;
        const p=pathOf(g);if(k==='P')d.dl.push({wk:w.week,tier:'-',path:p,ovr:effOvr(g),fame:g.fame||0,n:(g.rec&&g.rec.ev)||0});else if(k==='C')d.rivD[p]=(d.rivD[p]||0)+1}
      KILLED.clear();
      for(const x of w.mgrs){if(x.dead)continue;const k=kindOf(x);if(k!=='C')continue;for(const g of rosterOf(x))if(!SNAP.has(g.id)){const st=starsOf(effOvr(g));d.join.C[st]=(d.join.C[st]||0)+1}}
      const R=rivals();if(R.length){d.rr.me+=rosterRating(m);d.rr.riv+=R.reduce((a,x)=>a+rosterRating(x),0)/R.length;d.rr.n++;d.rivFame=Math.round(R.reduce((a,x)=>a+(x.fame||0),0)/R.length)}}catch(e){err('dxEnd',e)}};
