/* 218-v93bus — v0.93 THE EVENT BUS EMITTERS (the bus itself is 00d-bus). One emitter per happening, each a wrapper installed here,
   outermost (only 08-setup loads after this). Every wrapper first asks BUS.has(name): with nobody listening it is the old call,
   untouched (same arguments, same return value, same promise object, no extra microtask) — so the game, the dice and headless
   sims are exactly as before. With listeners, async functions hand back THEIR OWN promise; the event fires from a side .then
   (rejections are not swallowed: the caller still sees them, the side branch ignores them).
   Payloads (a "who" is {id, name, npc:bool} or null; `sim` = a headless simulation is running):
     turn.begin   {turnNo, seat, id, name, cpu, round, rotation, sim}      — a real turn starts (resetTurn inside beginTurn, S.turnNo up)
     phase        {from, to, seat, turnNo}                                 — S.phase changed; seen at render / log / turn start /
                                                                              gameOver (a phase set and reset between two of those is not seen)
     hit          {target:who, by:who, type, loc, amount, before, after, sim} — hurt() (gladiators: before/after = {hp, ap} of loc)
                                                                              and hurtNPC() (beasts: loc null, {hp}); after the damage resolved
     elim         {victim:who, by:who, type, sim}                          — eliminate(), only when it took a living fighter off
     spear        {by:who, spect:{name, sec}, hit:bool}                    — doSpear() resolved (hit = the spectator was carried out)
     round.end    {ri, name, why}                                          — nextRound() called (before the rewards and the next round)
     event.start  {evKey, seed, loc, sim, players:[{id,name,cls,cpu}]}     — startEvent(): after newState (its synchronous part)
     event.over   {evKey, winners:[id], reason, sim}                       — gameOver(), the first call that ended the event
     market.buy   {player:who, lv, free, only, kind, key}                  — marketBuy75() resolved (kind/key null = nothing taken)
     chest.open   {player:who, key}                                        — openChest() resolved (key = the Level 4 weapon)
     save         {kind:'match', slot, ok} | {kind:'career', id}           — matchSlotPut() / saveWorld() (the debounced request)
     window.open  {title, main?}                                           — modal() called (title = its HTML title) or a
                                                                              SCREEN_OPENERS main window (main = the opener's name)
     window.close {title, value}                                           — a modal() window resolved
     log          {html, cls}                                              — log() (after the line went in)
     render       {}                                                       — render() returned
     draw.after   {ms}                                                     — draw() returned (all its wrappers included); ms = its time
   Not migrated: 204-v92perf's perf92Mark wrappers (render/log/modal/beginTurn/mToast/…) stay — they mark BEFORE the call at their
   own place in the chain (205–217 wrap in between and some return early), and they must run while nobody listens; the bus fires
   after. Same for the online lockstep's modal/onTile wrappers (they change the call, not just observe it). */
const BUS93={ph:null,phS:null};
const bus93Who=x=>x?{id:x.id!=null?x.id:null,name:x.name||null,npc:!x.cls&&!!(x.t||x.hp!=null&&typeof x.hp==='number')}:null;
const bus93Sim=()=>{try{return !!(HEADLESS||S&&S.sim)}catch(e){return false}};
const bus93Side=(p,f)=>{if(p&&typeof p.then==='function')p.then(f,()=>{});else f(p);return p};
function bus93Phase(){if(!BUS.has('phase'))return;try{if(!S)return;const to=S.phase;if(BUS93.phS===S&&BUS93.ph===to)return;
  const from=BUS93.phS===S?BUS93.ph:null;BUS93.phS=S;BUS93.ph=to;if(from===to)return;BUS.emit('phase',{from,to,seat:S.cur,turnNo:S.turnNo})}catch(e){}}
/* turn.begin fires from resetTurn — called once, only by beginTurn (05-flow), right after S.turnNo went up and the phase became
   'resolve': several beginTurn wrappers await before the base runs, so a beginTurn wrapper could not see the start synchronously */
{const base=resetTurn;resetTurn=function(player){const r=base.apply(this,arguments);if(BUS.has('turn.begin'))try{const G=S;BUS.emit('turn.begin',{turnNo:G.turnNo,seat:G.cur,id:player&&player.id,name:player&&player.name,cpu:!!(player&&player.cpu),round:G.ri,rotation:G.rotation,sim:bus93Sim()})}catch(e){}
  bus93Phase();return r}}
{const base=hurt;hurt=function(victim,location){if(!BUS.has('hit'))return base.apply(this,arguments);
  const src=arguments[3];let b0=null;try{b0=victim&&victim.hp&&typeof victim.hp==='object'?{hp:victim.hp[location],ap:victim.ap?victim.ap[location]:null}:null}catch(e){}
  const amount=arguments[2];const r=base.apply(this,arguments);
  return bus93Side(r,()=>{try{BUS.emit('hit',{target:bus93Who(victim),by:bus93Who(src&&(src.p||src.n)),type:src&&src.type||null,loc:location,amount,before:b0,
    after:victim&&victim.hp&&typeof victim.hp==='object'?{hp:victim.hp[location],ap:victim.ap?victim.ap[location]:null}:null,sim:bus93Sim()})}catch(e){}})}}
{const base=hurtNPC;hurtNPC=function(npc,damage,player,prefix,weapon,byNpc){if(!BUS.has('hit'))return base.apply(this,arguments);
  const b0=npc?{hp:npc.hp}:null;const r=base.apply(this,arguments);
  return bus93Side(r,()=>{try{BUS.emit('hit',{target:{id:npc&&npc.id,name:npc&&npc.name,npc:true},by:bus93Who(player||byNpc),type:byNpc?'npc':player?'player':null,loc:null,amount:damage,before:b0,after:npc?{hp:npc.hp}:null,sim:bus93Sim()})}catch(e){}})}}
{const base=eliminate;eliminate=function(victim,source){if(!BUS.has('elim'))return base.apply(this,arguments);
  const was=!!(victim&&victim.alive);const r=base.apply(this,arguments);
  try{if(was&&victim&&!victim.alive)BUS.emit('elim',{victim:bus93Who(victim),by:bus93Who(source&&(source.p||source.n)),type:source&&source.type||null,sim:bus93Sim()})}catch(e){}return r}}
if(typeof doSpear==='function'){const base=doSpear;doSpear=function(player,spect){if(!BUS.has('spear'))return base.apply(this,arguments);const r=base.apply(this,arguments);
  return bus93Side(r,()=>{try{BUS.emit('spear',{by:bus93Who(player),spect:spect?{name:spect.name,sec:spect.sec}:null,hit:!!(spect&&spect.gone)})}catch(e){}})}}
{const base=nextRound;nextRound=function(why){if(BUS.has('round.end'))try{BUS.emit('round.end',{ri:S.ri,name:RD().n,why})}catch(e){}return base.apply(this,arguments)}}
{const base=startEvent;startEvent=function(config){if(!BUS.has('event.start'))return base.apply(this,arguments);const S0=S;const r=base.apply(this,arguments);
  try{if(S&&S!==S0)BUS.emit('event.start',{evKey:S.evKey,seed:S.seed,loc:S.locIdx,sim:bus93Sim(),players:S.players.map(p=>({id:p.id,name:p.name,cls:p.cls,cpu:!!p.cpu}))})}catch(e){}return r}}
{const base=gameOver;gameOver=function(winners,reason){if(!BUS.has('event.over')&&!BUS.has('phase'))return base.apply(this,arguments);
  const G=S,was=!!(G&&G.over);const r=base.apply(this,arguments);
  try{if(G&&!was&&G.over&&BUS.has('event.over'))BUS.emit('event.over',{evKey:G.evKey,winners:(winners||[]).map(p=>p&&p.id),reason,sim:bus93Sim()})}catch(e){}
  bus93Phase();return r}}
if(typeof marketBuy75==='function'){const base=marketBuy75;marketBuy75=function(player,lv,opt){if(!BUS.has('market.buy'))return base.apply(this,arguments);const o=opt||{};const r=base.apply(this,arguments);
  return bus93Side(r,v=>{try{BUS.emit('market.buy',{player:bus93Who(player),lv,free:!!o.free,only:o.only||null,kind:v&&v.kind||null,key:v&&v.key||null})}catch(e){}})}}
{const base=openChest;openChest=function(player){if(!BUS.has('chest.open'))return base.apply(this,arguments);let key=null;try{const a=S.chest&&S.chest.weapons;key=a&&a.length?a[a.length-1]:null}catch(e){}
  const r=base.apply(this,arguments);return bus93Side(r,()=>{try{BUS.emit('chest.open',{player:bus93Who(player),key})}catch(e){}})}}
{const base=matchSlotPut;matchSlotPut=function(slot){const r=base.apply(this,arguments);if(BUS.has('save'))try{BUS.emit('save',{kind:'match',slot,ok:!!r})}catch(e){}return r}}
{const base=saveWorld;saveWorld=function(){const r=base.apply(this,arguments);if(BUS.has('save'))try{const w=W_();BUS.emit('save',{kind:'career',id:w&&w.id})}catch(e){}return r}}
{const base=modal;modal=function(title){if(!BUS.has('window.open')&&!BUS.has('window.close'))return base.apply(this,arguments);
  try{BUS.emit('window.open',{title})}catch(e){}const r=base.apply(this,arguments);
  return BUS.has('window.close')?bus93Side(r,v=>{try{BUS.emit('window.close',{title,value:v})}catch(e){}}):r}}
for(const name of (typeof SCREEN_OPENERS!=='undefined'?SCREEN_OPENERS:[])){try{const base=window[name]||eval(name);if(typeof base!=='function')continue;
  const wrapped=function(){if(BUS.has('window.open'))try{BUS.emit('window.open',{title:null,main:name})}catch(e){}return base.apply(this,arguments)};
  eval(`${name}=wrapped`)}catch(e){}}
{const base=log;log=function(html,cls){const r=base.apply(this,arguments);if(BUS.has('log'))try{BUS.emit('log',{html,cls:cls||''})}catch(e){}bus93Phase();return r}}
{const base=render;render=function(){const r=base.apply(this,arguments);if(BUS.has('render'))try{BUS.emit('render',{})}catch(e){}bus93Phase();return r}}
{const base=draw;draw=function(){if(!BUS.has('draw.after'))return base.apply(this,arguments);const t0=performance.now();const r=base.apply(this,arguments);
  try{BUS.emit('draw.after',{ms:performance.now()-t0})}catch(e){}return r}}
