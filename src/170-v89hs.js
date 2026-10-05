/* 170-v89hs — v0.89 HOT-SEAT TABLE (his answers, 2026-10-05):
   • "Since your last turn" (158 beginTurn) opens ONLY when something happened to or around the player while they were away: their
     wounds/armor/CF/coin/hand/trophies changed, a log line names their gladiator, or someone (gladiator or beast) fell. Otherwise it
     is skipped — the whose-move pill still shows. When someone fell, the recap names them.
   • 🚪 Abandon and 💾 Save & leave (abandonAsk, 08-setup: the 🏛 menu and New event) ASK THE TABLE first, like ⏭ To the end (158 #7):
     every living human player confirms in turn; one "no" cancels and the match goes on. Outside hot seat nothing changes. */
const HS89={leave:null};
/* hs89Seen — who still stands (gladiators and beasts), kept beside 158's snapshots when a human's turn ends */
function hs89Seen(){return {p:(S.players||[]).filter(q=>q.alive&&!q.exited).map(q=>q.id),n:(S.npcs||[]).filter(n=>n.alive).map(n=>n.id)}}
{const base=beginTurn;beginTurn=async function(){try{if(S&&S.hotseat&&!S.over&&!HEADLESS&&!S.sim&&!S.snap){const p=cur();const prev=S.hsPrevId!=null?S.players[S.hsPrevId]:null;
    if(prev&&p&&prev!==p&&!prev.cpu){S.hs89=S.hs89||{};S.hs89[prev.id]=hs89Seen()}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* hs89Fallen — names of those who fell since the player's last turn */
function hs89Fallen(p){const a=S.hs89&&S.hs89[p.id];if(!a)return [];const out=[];
  for(const id of a.p){const q=S.players.find(x=>x.id===id);if(q&&q!==p&&!(q.alive&&!q.exited))out.push(nm(q))}
  for(const id of a.n){const n=S.npcs.find(x=>x.id===id);if(n&&!n.alive)out.push(nm(n))}
  return out}
/* hs89Eventful — did anything happen to or around the player since their last turn? */
function hs89Eventful(p,a){if(!a)return false;try{const b=hsSnap(p);
  if(['hp','ap','cf','coin','items','tro'].some(k=>(b[k]||0)!==(a[k]||0))||b.alive!==a.alive)return true;
  const name=String(p.name);if((S.logLines||[]).slice(a.log).some(l=>l.cls!=='hd'&&l.text&&l.text.includes(name)))return true;
  return hs89Fallen(p).length>0}catch(e){return true}}
/* hs89TableAsk — every living human player confirms; one "no" cancels */
async function hs89TableAsk(kind){const G=S;const pids=[...new Set(hsLiveHumans().map(q=>q.pid))];
  for(const pid of pids){const P=hsProf(pid);if(!P)continue;
    const v=await modal(kind==='save'?_T`🪑 ${esc(P.name)} — 💾 Save & leave?`:_T`🪑 ${esc(P.name)} — 🚪 Abandon the event?`,
      `<p>${kind==='save'?_T`The whole table must agree: the match is saved as it stands and everyone leaves the arena. It can be resumed later.`:_T`The whole table must agree: the event ends now, unresolved — no Fates, nothing reaches anyone’s book.`}</p>`,
      [{label:_T('Agree'),value:1,primary:1},{label:_T('Keep playing'),value:0}],{close:0});
    if(G!==S||S.over)return false;
    if(!v){log(_T`🪑 ${esc(P.name)} wants to play on — the table stays.`,'thought');return false}}
  return true}
{const base=abandonAsk;abandonAsk=async function(ctx){if(!hsTable()||!S||S.over)return base.apply(this,arguments);HS89.leave=ctx;try{return await base.apply(this,arguments)}finally{HS89.leave=null}}}
{const base=modal;modal=function(title,body,buttons,opt){
  if(HEADLESS||!S||!hsTable())return base.apply(this,arguments);
  try{const t=String(title||'');
    /* the abandon / save & leave window: ask the table before either goes through */
    if(HS89.leave&&(t===_T('Leave the arena?')||t===_T('Abandon this event?'))){const self=this,args=arguments;HS89.leave=null;
      return (async()=>{const v=await base.apply(self,args);if(v!==1&&v!==2)return v;return await hs89TableAsk(v===2?'save':'abandon')?v:0})()}
    /* the recap: only when something happened */
    if(!S.over&&/^🪑/.test(t)&&String(body||'').includes('<div class="away">')&&Array.isArray(buttons)&&buttons.length===1&&buttons[0].value===1){const p=cur();const a=p&&S.hsSnaps&&S.hsSnaps[p.id];
      if(p&&a&&!hs89Eventful(p,a))return Promise.resolve(1);
      const f=p?hs89Fallen(p):[];if(f.length)body=String(body).replace('<div class="away">',`<div class="away"><p class="hs89fell">${_T`✝ Fallen since: ${f.join(', ')}`}</p>`);
      return base.call(this,title,body,buttons,opt)}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
{const css=document.createElement('style');css.textContent=`.hs89fell{margin:0 0 6px;font-size:13px}`;document.head.appendChild(css)}
