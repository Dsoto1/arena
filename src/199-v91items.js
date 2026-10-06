/* 199-v91items — v0.91 CARDS AND TOKENS YOU CAN TAKE BACK (his notes 2026-10-06):
   • Health Elixirs (cards elixir2/elixir4, offerings elix2/elix4): the distribute window has ✖ Cancel — the elixir stays in hand. Confirm
     only lights once every point is placed (or nothing more fits), so an elixir can never be "used" for nothing; at full health it says
     so and stays in hand (distributeHP returns false then). Other HP/AP gifts (modifiers, training, soul steal) keep their window, no Cancel.
   • Free market offerings (mw1-3 / ma1-3): closing the market without taking a piece keeps the token.
   • AP Upgrade window: each location button shows the armor piece being upgraded (its card art) and its AP before → after; ✖ Cancel kept. */
const DIST91={cancel:false};
distModal=function(player,n,why,kind){const plan={};LOCS.forEach(l=>plan[l]=0);
  const cap=l=>kind==='hp'?7-player.hp[l]:7-player.ap[l];const okLoc=l=>player.hp[l]>0&&cap(l)>0;
  const left=()=>n-LOCS.reduce((s,l)=>s+plan[l],0);const room=()=>LOCS.some(l=>okLoc(l)&&plan[l]<cap(l));
  const canCancel=DIST91.cancel;
  const body=()=>`<p>${_T`Distribute <b>${n} ${kind==='hp'?'HP':'AP'}</b> from ${why}. Put it all in one location or spread it. Nothing can exceed 7.`}</p>
   <div class="dist">${LOCS.map(l=>`<span>${sideBadge(l)} ${LOCN[l]} <span style="color:var(--dim);font:12px var(--mono)">${kind==='hp'?player.hp[l]:player.ap[l]} → ${(kind==='hp'?player.hp[l]:player.ap[l])+plan[l]}</span></span><button class="btn" type="button" data-d="-" data-l="${l}" ${plan[l]?'':'disabled'} aria-label="${_T`Remove from ${LOCN[l]}`}">−</button><span class="v">${plan[l]}</span><button class="btn" type="button" data-d="+" data-l="${l}" ${okLoc(l)&&plan[l]<cap(l)&&left()>0?'':'disabled'} aria-label="${_T`Add to ${LOCN[l]}`}">+</button>`).join('')}</div>
   <p style="margin-top:10px">${_T`Left to assign: <b id="distLeft">${left()}</b>`}</p>`;
  const sync=()=>{const ok=document.querySelector('#mBtns [data-mi="1"]');if(ok)ok.disabled=left()>0&&room()};
  const btns=[{label:_T('Auto: head, chest, arms, legs'),value:'auto'},{label:_T('Confirm'),value:'ok',primary:1}];if(canCancel)btns.push({label:_T('Cancel'),value:'cancel'});
  return modal(kind==='hp'?_T('Distribute health'):_T('Distribute armor'),body(),btns,{onOpen:()=>{const box=$('#mBody');sync();
      box.onclick=e=>{const b=e.target.closest('[data-d]');if(!b||b.disabled)return;const l=b.dataset.l;plan[l]+=b.dataset.d==='+'?1:-1;box.innerHTML=body();sync()}}})
   .then(v=>{const mb=$('#mBody');if(mb)mb.onclick=null;
    if(v==='cancel'||(canCancel&&v==null))return null;
    if(v==='auto'){if(kind==='hp')return cpuHealPlan(player,n);const pl={};LOCS.forEach(l=>pl[l]=0);let k=n;
      for(const l of HEAL_ORDER)while(k>0&&okLoc(l)&&pl[l]<cap(l)&&player.ap[l]>0){pl[l]++;k--}
      for(const l of HEAL_ORDER)while(k>0&&okLoc(l)&&pl[l]<cap(l)){pl[l]++;k--}return pl}
    return plan})};
/* distributeHP now says whether anything was healed (false: full health, or the player cancelled) */
distributeHP=async function(player,n,why=_T('Health Elixir')){const locs=LOCS.filter(l=>player.hp[l]>0&&player.hp[l]<7);
  if(!locs.length){if(DIST91.cancel){if(!player.cpu)await modal(_T('Nothing to heal'),`<p>${_T`Every location is already at full health — the elixir stays in your hand.`}</p>`,[{label:'OK',value:1}]);return false}
    log(_T`${nm(player)} is already at full health.`);return false}
  const plan=player.cpu?cpuHealPlan(player,n):await distModal(player,n,why,'hp');if(!plan)return false;
  const parts=[];for(const l of LOCS)if(plan[l]){player.hp[l]=Math.min(7,player.hp[l]+plan[l]);parts.push(`${LOCN[l]} +${plan[l]}`)}
  const tot=LOCS.reduce((s,l)=>s+(plan[l]||0),0);if(tot)fx(player.r,player.c,_T`+${tot} HP`,'#7fe07a');
  log(_T`${nm(player)} uses ${why}: ${parts.join(', ')||'nothing'}.`);return tot>0||!DIST91.cancel};
/* the AP Upgrade window shows the piece it reinforces */
apUp=async function(player,n){const locs=LOCS.filter(l=>player.hp[l]>0&&player.ap[l]>0&&player.ap[l]<7);
  if(!locs.length){if(!player.cpu)await modal(_T('No armored location'),`<p>${_T`AP upgrades only apply to a location that already has armor.`}</p>`,[{label:'OK',value:1}]);return false}
  const pc=l=>((player.pieces&&player.pieces[l])||[]).find(x=>x&&x.key&&ARM[x.key]);
  const loc=player.cpu?locs.sort((a,b)=>player.ap[a]-player.ap[b]||HEAL_ORDER.indexOf(a)-HEAL_ORDER.indexOf(b))[0]
   :await modal(_T`AP Upgrade (+${n})`,`<p>${_T`Choose one armored location. A location can never exceed 7 AP.`}</p>`,locs.map(l=>{const P=pc(l);
      return {label:`${P?`<span class="apu91">${armSideArt91(P.key,l,92)}</span>`:''}${LOCN[l]}`,sub:_T`${P?esc(P.n||ARM[P.key]&&ARM[P.key].n||'')+' · ':''}AP ${player.ap[l]} → ${Math.min(7,player.ap[l]+n)}`,value:l}}).concat([{label:_T('Cancel'),value:null}]));
  if(!loc)return false;player.ap[loc]=Math.min(7,player.ap[loc]+n);log(_T`${nm(player)} reinforces ${LOCN[loc]} to ${player.ap[loc]} AP.`);return true};
{const base=useItem;useItem=async function(player,it){
  const el=it&&((it.kind==='offer'&&(it.key==='elix2'||it.key==='elix4'))||(it.kind==='card'&&(it.key==='elixir2'||it.key==='elixir4')));
  if(el){const n=it.kind==='offer'?(it.key==='elix2'?2:4):(CARDS[it.key].hp|0);DIST91.cancel=true;let ok=false;try{ok=await distributeHP(player,n,_T('a Health Elixir'))}finally{DIST91.cancel=false}
    if(!ok)return false;player.items=player.items.filter(x=>x!==it);if(it.kind==='card'){cardShow('c:'+it.key,player,_T('📣 Declared'));stat(player,'cardsPlayed')}return true}
  const mk=it&&it.kind==='offer'&&/^m[wa][123]$/.test(it.key||'');
  if(mk){const kind=it.key[1],lv=+it.key[2];const key=await marketRoll(player,kind,lv,{free:1});if(!key)return false;
    if(kind==='w')await gainWeapon(player,key);else await gainArmorPiece(player,key);player.items=player.items.filter(x=>x!==it);return true}
  return base.apply(this,arguments)}}
{const st=document.createElement('style');st.textContent='#mBtns .apu91{float:left;margin:0 10px 0 0;width:64px;height:92px;overflow:hidden;border-radius:6px}#mBtns .apu91 svg.side91{width:64px!important;height:92px!important;max-width:none!important}';document.head.appendChild(st)}
/* armSideArt91 — ONE armor piece exactly as worn on location l (his note: a set is split into one piece per side, each faced to its side):
   the avatar's own drawing of it (art, crop, mirror) cropped to the piece, as a standalone svg. Falls back to the card art. */
function armSideArt91(key,l,h){try{const B=typeof armBox==='function'&&armBox(key,l);if(!B)throw 0;const pad=Math.max(B.w,B.h)*0.08;const W=B.w+pad*2,H=B.h+pad*2;
    const vb=`${(B.cx-W/2).toFixed(1)} ${(B.cy-H/2).toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}`;const w=Math.round(h*W/H);
    return `<svg class="side91" viewBox="${vb}" width="${w}" height="${h}" style="width:${w}px!important;height:${h}px!important;max-width:none!important" aria-hidden="true">${armPieceSVG(B,key,1,null,'s91'+l)}</svg>`}
  catch(e){return typeof armArtCell==='function'?armArtCell(key,h):''}}
/* the avatar hover card (98 avPopShow) shows each piece as worn on that side, not the pair's card */
{const base=avPopShow;avPopShow=function(el){const r=base.apply(this,arguments);try{const pop=document.getElementById('avPop');const t=(el&&el.dataset.avtip)||'';const nm0=(t.split(':')[0]||'').trim();
  const l=LOCS.find(x=>LOCN[x]===nm0);if(!pop||!l)return r;
  for(const row of pop.querySelectorAll('.avpc')){const n=(row.querySelector('b')||{}).textContent;const k=Object.keys(ARM).find(x=>ARM[x].n===n);if(!k||!ARM[k].pair&&!ARM[k].stack)continue;
    const art=row.firstElementChild&&row.firstElementChild.tagName!=='SPAN'?row.firstElementChild:null;const h=art&&art.getBoundingClientRect().height||30;const html=armSideArt91(k,l,Math.max(30,Math.round(h)));
    if(art)art.outerHTML=html;else row.insertAdjacentHTML('afterbegin',html)}}catch(e){}return r}}
