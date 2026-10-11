/* 155-v88market — v0.88 ONE MARKET WINDOW (his idea + picks, 2026-10-05): his market board (106-v75 boardHTML75) serves every market moment.
   • ROLL: when you buy (or an item rolls a level), the board opens on that level's row: a d4 with Roman numerals spins while a lit slot hops
     across the row like a prize wheel and stops on the seeded result (the die is rolled BEFORE the show — the animation is cosmetic,
     Math.random only; a tap skips it). An empty slot slides to the closest filled one, left or right. Then only what you may take is lit,
     the rest dimmed; click a lit piece to take it, or Re-roll.
   • PICK: Market Choice (pick a slot), "choose a Level N weapon/armor" (chooseMarket) and the GEAR DRAFT use the board too — only the
     eligible pieces lit. Weapons still face down in the deck sit in a strip under the board. The draft lays every level's remaining gear
     across the slots (mk88SpreadHTML).
   • THE INFO PANEL under the board: hover (or the first tap on a touch screen) a piece → his art on the left, a clean panel beside it:
     location / AP / bonus for armor, damage / range / icons for weapons, and "fits you / replaces X" for the one buying.
   • CPU buys, rolls and draft picks show as a short PEEK over the arena (the board snapshot, the slot lit, the piece flying off) on Slow
     and Normal; Fast, sims and headless runs skip it. A tap skips it.
   Online: the windows' values still go through modal (113 records them); the board's pieces carry the hidden buttons' data-mi. */
const MK88={ctx:null,pick:null,draft:0,fly:null,ptr:''};
const ROMAN88=['I','II','III','IV'];
function mk88PeekOn(){return !HEADLESS&&!!S&&!S.sim&&!S.simmed&&SPEED!=='fast'&&!(typeof document!=='undefined'&&document.hidden)}
const mk88Ms=()=>SPEED==='normal'?1100:1800;
/* the level a weapon sits at in the market lists */
function mk88WLv(k){for(const lv of [1,2,3])if((MARKET_W[lv]||[]).includes(k))return lv;return (W[k]&&W[k].lv)||''}

/* ---------- the info panel ---------- */
function mk88Fit(player,kind,key){if(!player||!key)return '';
  try{if(kind==='w'){const arms=armsAttached(player);if(!arms.length)return `<span class="no">${_T('No arm left to hold it')}</span>`;
      const free=arms.filter(a=>!player['w'+a]);if(free.length)return `<span class="ok">${_T`✓ Fits your ${free[0]==='R'?_T('right'):_T('left')} hand`}</span>`;
      const worst=[...arms].sort((a,b)=>wScore(player['w'+a])-wScore(player['w'+b]))[0];return `<span class="sw">${_T`Both hands full — replaces ${esc(player['w'+worst].n)}`}</span>`}
    const d=ARM[key];if(!d)return '';const locs=sideLocs(d).filter(l=>player.hp[l]>0);if(!locs.length)return `<span class="no">${_T`Nowhere to wear it`}</span>`;
    const free=locs.filter(l=>!armorConflict(player,l,key));
    if(free.length)return `<span class="ok">${_T`✓ Fits your ${free.map(l=>LOCN[l]).join(' + ')}`}</span>`;
    const c=armorConflict(player,locs[0],key);return `<span class="sw">${_T`Replaces ${esc(c.n)} (${LOCN[locs[0]]})`}</span>`}catch(e){return ''}}
function mk88Info(player,ref){if(!ref)return `<div class="mk88inf empty">${_T('Point at a piece to see it.')}</div>`;
  if(ref.startsWith('back:'))return `<div class="mk88inf"><span class="mk88art"><span class="cimg md wide mb-back75" style="background-image:url('${WBACK75(+ref.slice(5))}');background-size:100% 100%"></span></span>
    <div class="mk88txt"><b>${_T`A face-down weapon`}</b><div class="lv">${_T`Level ${ref.slice(5)} · slot 4`}</div><p>${_T('Flip it and take it — nobody knows what it is.')}</p></div></div>`;
  const kind=ref[0],key=ref.slice(2);
  if(kind==='w'&&W[key]){const w=mkW(key);
    return `<div class="mk88inf"><span class="mk88art">${cardHTML('w:'+key,'md')}</span><div class="mk88txt"><b>${esc(W[key].n)}</b><div class="lv">${_T`Weapon · level ${mk88WLv(key)}`}</div>
      <div class="wc88">${typeof weaponChips==='function'?weaponChips(w):''}</div><p class="st">${wStats(w)}</p><p class="fit">${mk88Fit(player,'w',key)}</p></div></div>`}
  if(kind==='a'&&ARM[key]){const d=ARM[key];const where=sideLocs(d).map(l=>LOCN[l]).join(d.pair?' + ':_T(' or '));
    const rows=[[_T('Location'),`${esc(where)}${typeof PT_NAME!=='undefined'&&PT_NAME[d.pt]&&PT_NAME[d.pt]!==d.slot?` · ${esc(PT_NAME[d.pt])}`:''}${d.pair?_T(' (pair)'):''}`],[_T('Armor'),_T`<b>${d.ap} AP</b>${d.stack?_T(' · stackable'):''}`]];
    if(d.bonus)rows.push([_T('Bonus'),Object.entries(d.bonus).map(([l,v])=>_T`+${v} AP ${esc(LOCN[l])}`).join(', ')]);
    if(d.greaves)rows.push([_T('Extra'),_T('+1 movement')]);if(d.cestus)rows.push([_T('Extra'),_T('+1 damage')]);
    return `<div class="mk88inf"><span class="mk88art">${cardHTML('a:'+key,'md')}</span><div class="mk88txt"><b>${esc(d.n)}</b><div class="lv">${_T`Armor · level ${d.lv}`}</div>
      <table>${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</table><p class="fit">${mk88Fit(player,'a',key)}</p></div></div>`}
  return ''}

/* ---------- the board in a window ---------- */
/* mk88Tag — names every cell of a board (built by boardHTML75: for levels 3,2,1 four weapon cells then four armor cells) and every piece */
function mk88Tag(root){[...root.querySelectorAll('.mboard75 > .mb-cell')].forEach((c,i)=>{c.dataset.lv=[3,2,1][i>>3];c.dataset.side=(i&7)<4?'w':'a';c.dataset.s=(i&3)+1;
  c.querySelectorAll('.mb-w,.mb-a').forEach(p=>{if(p.dataset.card)p.dataset.k88=p.dataset.card});c.querySelectorAll('.mb-back').forEach(p=>p.dataset.k88='back:'+c.dataset.lv)})}
const mk88Cell=(root,lv,side,s)=>root.querySelector(`.mb-cell[data-lv="${lv}"][data-side="${side}"][data-s="${s}"]`);
function mk88Wrap(board,extra=''){return `<div class="mk88">${board}${extra}<div class="mk88info"></div></div>`}
/* mk88Wire — hover/first-tap shows a piece, lit pieces carry their button's data-mi; skip() ends a running show */
function mk88Wire(root,player,{skip}={}){const info=root.querySelector('.mk88info');let sel=null;
  const show=el=>{sel=el;root.querySelectorAll('.sel88').forEach(x=>x.classList.remove('sel88'));if(el){el.classList.add('sel88');info.innerHTML=mk88Info(player,el.dataset.k88)}};
  info.innerHTML=mk88Info(player,null);
  root.addEventListener('pointerover',e=>{const el=e.target.closest('[data-k88]');if(el&&root.contains(el))show(el)});
  root.addEventListener('pointerdown',e=>{MK88.ptr=e.pointerType||''});
  root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-mi]')){e.preventDefault();e.target.click()}});
  root.addEventListener('focusin',e=>{const el=e.target.closest('[data-k88]');if(el)show(el)});
  root.addEventListener('click',e=>{if(skip&&skip()){e.stopPropagation();return}
    const el=e.target.closest('[data-mi]');if(!el)return;const p=el.closest('[data-k88]')||el.querySelector('[data-k88]');
    if(MK88.ptr==='touch'&&p&&p!==sel){show(p);e.stopPropagation()}});
  return {show}}
/* mk88Lit — lights the elements and gives each its window button */
function mk88Lit(root,pairs){root.querySelector('.mboard75').classList.add('mk88sel');
  for(const [el,mi] of pairs){if(!el||mi<0)continue;el.classList.add('lit');el.dataset.mi=mi;el.tabIndex=0;el.setAttribute('role','button')}}

/* ---------- the roll show ---------- */
function mk88Die(root,lv){const y=MB75.rows[lv];const d=document.createElement('div');d.className='mk88die';d.style.top=(y[0]+(y[1]-y[0])*0.5)+'%';d.innerHTML='<b>I</b>';
  root.querySelector('.mboard75').appendChild(d);return d}
function mk88Roll(root,lv,slot,sides,onEnd){const die=mk88Die(root,lv);let stop=false,i=0,last=0;
  const n=8+Math.floor(Math.random()*4);const path=[];for(let k=0;k<n-1;k++){let s;do s=1+Math.floor(Math.random()*4);while(s===path[k-1]);path.push(s)}
  if(path[path.length-1]===slot)path.pop();path.push(slot);
  const hop=s=>{root.querySelectorAll('.mb-cell.hop').forEach(c=>c.classList.remove('hop'));for(const sd of sides){const c=mk88Cell(root,lv,sd,s);if(c)c.classList.add('hop')}die.querySelector('b').textContent=ROMAN88[s-1]};
  const end=()=>{if(stop)return;stop=true;hop(slot);die.classList.add('done');
    /* an empty slot: the light slides to the closest filled one */
    setTimeout(()=>{try{const m=S.market;for(const sd of sides){const has=sd==='w'?x=>wHas75(m.w[lv],x):x=>aHas75(m.a[lv],x);const near=nearest75(has,slot);
      if(near.length&&!near.includes(slot)){const c0=mk88Cell(root,lv,sd,slot);if(c0)c0.classList.remove('hop');for(const s of near){const c=mk88Cell(root,lv,sd,s);if(c)c.classList.add('hop','slid')}}}}catch(e){}onEnd()},reduceMotionOn()?0:260)};
  const step=()=>{if(stop)return;if(i>=path.length){end();return}hop(path[i]);const t=60+Math.pow(i/path.length,2)*260;i++;last=setTimeout(step,t)};
  if(reduceMotionOn())end();else step();
  return {skip:()=>{if(stop)return false;clearTimeout(last);end();return true},running:()=>!stop}}
function reduceMotionOn(){try{return typeof reduceMotion==='function'&&reduceMotion()}catch(e){return false}}

/* ---------- the windows ---------- */
/* mk88RollWin — the "Market die" / "Market · slot N" windows: the show, then the slot's pieces lit */
function mk88RollWin(base,c,title,body,buttons,opt,mode){c.seen=true;const lv=c.lv,slot=c.slot,sides=c.sides;const opts=slotOpts75(lv,slot,sides);
  const B=buttons.map(b=>/^t\d+$/.test(String(b.value))||(mode==='take'&&typeof b.value==='number')?{...b,style:'display:none'}:b);
  const html=mk88Wrap(boardHTML75(c.player))+body;
  return base(title,html,B,{...opt,wide:1,onOpen:done=>{try{const root=document.querySelector('#mBody .mk88');mk88Tag(root);root.querySelector('.mboard75').classList.add('row'+lv);let roll=null;
    const W_=mk88Wire(root,c.player,{skip:()=>roll&&roll.running()&&roll.skip()});
    roll=mk88Roll(root,lv,slot,sides,()=>{const used=new Set();const pairs=[];
      opts.forEach((o,i)=>{const val=mode==='take'?i:'t'+i;const mi=buttons.findIndex(b=>b.value===val);const cell=mk88Cell(root,lv,o.kind,o.s);if(!cell)return;
        const el=[...cell.querySelectorAll(o.kind==='w'?'.mb-w,.mb-back':'.mb-a')].find(x=>!used.has(x)&&(o.kind==='w'||x.dataset.card==='a:'+o.key));if(el){used.add(el);pairs.push([el,mi])}});
      mk88Lit(root,pairs);if(pairs[0])W_.show(pairs[0][0])})}catch(e){console.error(e)}if(opt&&opt.onOpen)opt.onOpen(done)}})}
/* Market Choice: pick a slot on the board */
function mk88ChoiceWin(base,c,title,body,buttons,opt){c.seen=true;const lv=c.lv;
  const B=buttons.map(b=>typeof b.value==='number'?{...b,style:'display:none'}:b);
  return base(title,mk88Wrap(boardHTML75(c.player))+`<p>${_T`Click a slot of the level ${lv} row — no die.`}</p>`,B,{...opt,wide:1,onOpen:done=>{try{const root=document.querySelector('#mBody .mk88');mk88Tag(root);mk88Wire(root,c.player);
    const pairs=[];for(const sd of c.sides)for(let s=1;s<=4;s++){const mi=buttons.findIndex(b=>b.value===s);pairs.push([mk88Cell(root,lv,sd,s),mi])}mk88Lit(root,pairs);root.querySelector('.mboard75').classList.add('cells88')}catch(e){console.error(e)}if(opt&&opt.onOpen)opt.onOpen(done)}})}
/* chooseMarket: any remaining piece of a kind at a level */
function mk88PickWin(base,P,title,body,buttons,opt){const {player,kind,lv}=P;const Wm=S.market.w[lv];
  const deck=kind==='w'?Wm.deck.filter(k=>!(wOpen75(Wm)&&k===Wm.up4)):[];
  const strip=deck.length?`<div class="mk88strip"><span>${_T`From the face-down pile`}</span>${deck.map(k=>`<span class="mb-w s88" data-card="w:${k}" data-k88="w:${k}" style="${cardStyle('w:'+k)}"></span>`).join('')}</div>`:'';
  const B=buttons.map(b=>({...b,style:'display:none'}));
  return base(title,mk88Wrap(boardHTML75(player),strip)+body,B,{...opt,wide:1,onOpen:done=>{try{const root=document.querySelector('#mBody .mk88');mk88Tag(root);const W_=mk88Wire(root,player);
    const pairs=[];root.querySelectorAll(`.mb-cell[data-lv="${lv}"][data-side="${kind}"] [data-k88^="${kind}:"], .mk88strip [data-k88]`).forEach(el=>{const k=el.dataset.k88.slice(2);pairs.push([el,buttons.findIndex(b=>b.value===k)])});
    mk88Lit(root,pairs);const f=pairs.find(p=>p[1]>=0);if(f)W_.show(f[0])}catch(e){console.error(e)}if(opt&&opt.onOpen)opt.onOpen(done)}})}
/* the draft: every level's remaining gear spread across the slots; the offered pieces lit */
function mk88SpreadHTML(){const m=S.market;const cell=(x,y,inner,cls)=>`<div class="mb-cell ${cls}" style="left:${x[0]}%;width:${x[1]-x[0]}%;top:${y[0]}%;height:${y[1]-y[0]}%;--ch:${(y[1]-y[0]).toFixed(1)}">${inner}</div>`;let h='';
  for(const lv of [3,2,1]){const y=MB75.rows[lv];const ws=[...m.w[lv].slots.filter(Boolean),...m.w[lv].deck];const cols=[[],[],[],[]];ws.forEach((k,i)=>cols[i%4].push(k));
    for(let s=0;s<4;s++){const n=cols[s].length;h+=cell(MB75.w[s],y,cols[s].map((k,i)=>`<span class="mb-w" data-card="w:${k}" data-k88="w:${k}" style="${cardStyle('w:'+k)};--i:${i};--n:${n}"></span>`).join(''),'w sp88')}
    for(let s=0;s<4;s++){const p=m.a[lv].piles[s]||[];h+=cell(MB75.a[s],y,`<div class="mb-pile n${Math.min(p.length,6)}">${p.map(k=>`<span class="mb-a" data-card="a:${k}" data-k88="a:${k}" style="${cardStyle('a:'+k)}"></span>`).join('')}</div>`,'a')}}
  return `<div class="mboard75"><img src="${assetURL('market_board.webp')}" alt="${_T`The market board`}">${h}</div>`}
function mk88DraftWin(base,player,title,body,buttons,opt){const grid=opt.grid;const all=[...buttons,...grid];
  /* the window's own paragraph stays; the old two-per-row grid stays in the page (hidden) for its data-mi buttons */
  const p0=(body.match(/^<p>[\s\S]*?<\/p>/)||[''])[0];
  return base(title,mk88Wrap(mk88SpreadHTML(),`<div class="mk88strip x88" hidden><span>${_T('Also offered')}</span></div>`)+p0+`<div id="pickgrid" hidden style="display:none"></div>`,buttons,{...opt,wide:1,onOpen:done=>{try{const root=document.querySelector('#mBody .mk88');const W_=mk88Wire(root,player);
    const used=new Set();const pairs=[];const extra=root.querySelector('.x88');
    grid.forEach((g,i)=>{const ref=g.card;if(!ref)return;const el=[...root.querySelectorAll(`.mboard75 [data-k88="${ref}"]`)].find(x=>!used.has(x));
      if(el){used.add(el);pairs.push([el,buttons.length+i])}else{extra.hidden=false;extra.insertAdjacentHTML('beforeend',`<span class="${ref[0]==='w'?'mb-w s88':'mb-a s88a'}" data-card="${ref}" data-k88="${ref}" style="${cardStyle(ref)}"></span>`);pairs.push([extra.lastElementChild,buttons.length+i])}});
    mk88Lit(root,pairs);if(pairs[0])W_.show(pairs[0][0])}catch(e){console.error(e)}if(opt&&opt.onOpen)opt.onOpen(done)}})}

{const base=modal;modal=function(title,body,buttons,opt={}){
  if(HEADLESS||typeof document==='undefined'||!S||!S.market)return base.apply(this,arguments);
  try{const t=String(title||''),c=MK88.ctx;opt=opt||{};
    if(c&&c.player&&!c.player.cpu){
      if(t===_T('Market Choice'))return mk88ChoiceWin(base,c,title,body,buttons,opt);
      if(c.slot&&t===_T`Market die · ${c.slot}`)return mk88RollWin(base,c,title,body,buttons,opt,'roll');
      if(c.slot&&t===_T`Market · slot ${c.slot}`)return mk88RollWin(base,c,title,body,buttons,opt,'take')}
    const P=MK88.pick;if(P&&!P.player.cpu&&t===_T`Level ${P.lv} ${P.kind==='w'?_T('weapon'):_T('armor')}`)return mk88PickWin(base,P,title,body,buttons,opt);
    if(MK88.draft&&opt.grid&&opt.grid.length&&opt.grid.every(g=>/^[wa]:/.test(g.card||''))){const p=MK88.draftP||(S.players||[]).find(x=>!x.cpu);return mk88DraftWin(base,p,title,body,buttons,opt)}
  }catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------- context: who is buying, which level, which slot ---------- */
{const base=slotOpts75;slotOpts75=function(lv,slot,sides){const c=MK88.ctx;if(c&&c.lv===lv){c.slot=slot;if(c.wantPeek)c.snap=boardHTML75(c.player)}return base.apply(this,arguments)}}
{const base=marketBuy75;marketBuy75=async function(player,lv,opt={}){if(HEADLESS)return base.apply(this,arguments);
  const prev=MK88.ctx;const c=MK88.ctx={player,lv,sides:opt&&opt.only?[opt.only]:['w','a'],seen:false,slot:null,snap:null,mchoice:!!(player.mchoice&&!(opt&&opt.free))};
  c.wantPeek=player.cpu?mk88PeekOn():!!S;
  try{const r=await base.apply(this,arguments);
    if(r&&r.key&&!c.seen&&c.snap&&(player.cpu?mk88PeekOn():true))await mk88Peek({html:c.snap,lv,slot:c.mchoice?null:c.slot,ref:(r.kind==='w'?'w:':'a:')+r.key,side:r.kind,
      who:nm(player),what:r.kind==='w'?W[r.key].n:ARM[r.key].n});
    return r}finally{MK88.ctx=prev}}}
{const base=chooseMarket;chooseMarket=async function(player,kind,lv){const prev=MK88.pick;MK88.pick={player,kind,lv};try{return await base.apply(this,arguments)}finally{MK88.pick=prev}}}
{const base=runDraft;runDraft=async function(){MK88.draft++;try{return await base.apply(this,arguments)}finally{MK88.draft--;MK88.fly=null}}}
/* a CPU's draft pick: snapshot the spread with the pick, then it flies off when the gladiator takes it */
{const base=draftPull81;draftPull81=function(x){try{const p=x&&x.by?S.players[x.by-1]:null;if(MK88.draft&&p&&p.cpu&&mk88PeekOn())MK88.fly={html:mk88SpreadHTML(),ref:(x.kind==='w'?'w:':'a:')+x.k,who:nm(p),what:x.kind==='w'?W[x.k].n:ARM[x.k].n,draft:1};}catch(e){}return base.apply(this,arguments)}}
{const base=draftFits81;draftFits81=function(p){if(MK88.draft)MK88.draftP=p;return base.apply(this,arguments)}}
{const g=async(key)=>{const f=MK88.fly;if(f&&f.ref.slice(2)===key){MK88.fly=null;await mk88Peek(f)}};
  const bw=gainWeapon;gainWeapon=async function(player,key){try{await g(key)}catch(e){}return bw.apply(this,arguments)};
  const ba=gainArmorPiece;gainArmorPiece=async function(player,key){try{await g(key)}catch(e){}return ba.apply(this,arguments)}}

/* ---------- the peek over the arena ---------- */
function mk88Peek(f){const S0=S;return new Promise(res=>{try{if(!S0||S0.over){res();return}let el=document.getElementById('mk88peek');if(el)el.remove();el=document.createElement('div');el.id='mk88peek';
  el.innerHTML=`<div class="pk88h">${f.draft?_T`${f.who} drafts <b>${esc(f.what)}</b>`:f.slot?_T`${f.who} rolls <b class="rn88">${ROMAN88[f.slot-1]}</b> at level ${f.lv} → <b>${esc(f.what)}</b>`:_T`${f.who} takes <b>${esc(f.what)}</b> at level ${f.lv}`}</div><div class="mk88">${f.html}</div>`;
  document.body.appendChild(el);const root=el.querySelector('.mk88');mk88Tag(root);const B=root.querySelector('.mboard75');B.classList.add('mk88sel');
  if(f.lv)B.classList.add('row'+f.lv);
  /* the taken piece: in the level row (the rolled slot's side first), else anywhere */
  const scope=f.lv?`.mb-cell[data-lv="${f.lv}"]`:'.mb-cell';
  let piece=null;if(f.slot&&f.side){const cs=[...root.querySelectorAll(`${scope}[data-side="${f.side}"]`)].sort((a,b)=>Math.abs(a.dataset.s-f.slot)-Math.abs(b.dataset.s-f.slot));
    for(const c of cs){piece=c.querySelector(`[data-k88="${f.ref}"]`)||(f.side==='w'&&+c.dataset.s===4?c.querySelector('[data-k88^="back:"]'):null);if(piece)break}}
  if(!piece)piece=root.querySelector(`${scope} [data-k88="${f.ref}"]`)||root.querySelector(`[data-k88="${f.ref}"]`);
  if(piece){piece.classList.add('lit');const cell=piece.closest('.mb-cell');if(cell)cell.classList.add('hop')}
  const ms=mk88Ms();let t1=0,t2=0;const fin=()=>{clearTimeout(t1);clearTimeout(t2);el.classList.add('out');setTimeout(()=>{el.remove();res()},reduceMotionOn()?0:220)};
  t1=setTimeout(()=>{if(piece)piece.classList.add('fly88')},Math.round(ms*0.55));t2=setTimeout(fin,ms);el.addEventListener('click',fin,{once:true})}catch(e){console.error(e);res()}})}

{const css=document.createElement('style');css.textContent=`
.mk88{position:relative}
.mk88 .mboard75{user-select:none;width:min(100%,calc((100vh - 400px) * 1.5456));margin:0 auto}
#mk88peek .mk88 .mboard75{width:100%}
.mk88 .mk88sel .mb-w,.mk88 .mk88sel .mb-a,.mk88 .mk88sel .mb-back{transition:opacity .2s,filter .2s,transform .2s}
.mk88 .mk88sel .mb-w:not(.lit),.mk88 .mk88sel .mb-a:not(.lit),.mk88 .mk88sel .mb-back:not(.lit){opacity:.5;filter:grayscale(.7) brightness(.75)}
.mk88 .lit{cursor:pointer;outline:none}
.mk88 .mb-a.lit{filter:drop-shadow(0 0 5px #ffd76a) drop-shadow(0 0 2px #ffd76a)!important}
.mk88 .mb-w.lit,.mk88 .mb-back.lit{box-shadow:0 0 0 2px #ffd76a,0 0 14px 3px rgba(255,215,106,.75)}
.mk88 .sel88.mb-a{transform:scale(1.12)}.mk88 .mb-cell.w .sel88.mb-w{z-index:4;box-shadow:0 0 0 3px #fff3c4,0 0 18px 5px rgba(255,215,106,.9)}
.mk88 .mb-cell.lit{cursor:pointer;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(255,215,106,.55)}
.mk88 .cells88 .mb-cell.lit:hover{box-shadow:inset 0 0 0 3px #ffd76a,0 0 16px rgba(255,215,106,.6);background:rgba(255,215,106,.12)}
.mk88 .cells88 .mb-w,.mk88 .cells88 .mb-a,.mk88 .cells88 .mb-back{opacity:1!important;filter:none!important}
.mk88 .mb-cell.hop{border-radius:6px;box-shadow:inset 0 0 0 3px #ffd76a,0 0 22px 6px rgba(255,200,80,.55);background:rgba(255,215,106,.16);transition:box-shadow .08s,background .08s}
.mk88 .mb-cell.slid{transition:box-shadow .25s,background .25s}
.mk88die{position:absolute;left:50%;width:6.2%;aspect-ratio:1/0.9;transform:translate(-50%,-50%);z-index:6;display:grid;place-items:end center;padding-bottom:8%;
  clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(160deg,#fff1c2,#d8a63e 55%,#8a5a1c);filter:drop-shadow(0 4px 6px rgba(0,0,0,.6));animation:die88 .18s linear infinite}
.mk88die b{font:700 clamp(12px,2.2cqw,26px)/1 "Marcellus SC",Georgia,serif;color:#3a2210}
.mk88die.done{animation:none;transform:translate(-50%,-50%) scale(1.15);transition:transform .2s}
@keyframes die88{0%{transform:translate(-50%,-50%) rotate(-14deg)}50%{transform:translate(-50%,-56%) rotate(14deg)}100%{transform:translate(-50%,-50%) rotate(-14deg)}}
.mk88 .sp88 .mb-w{left:calc(50% + (var(--i) - (var(--n) - 1) / 2) * 26%)!important;width:calc(var(--ch) * 0.78cqh)!important}
.mk88 .sp88 .mb-w:hover,.mk88 .sp88 .mb-w.sel88{z-index:5}
.mk88strip{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;padding:6px 8px;border:1px dashed rgba(255,215,106,.4);border-radius:8px}
.mk88strip>span:first-child{font-size:12px;color:var(--muted);margin-right:4px}
.mk88strip .s88{display:block;width:84px;aspect-ratio:600/416;background-repeat:no-repeat;border-radius:4px;position:relative}
.mk88strip .s88a{display:block;width:52px;aspect-ratio:1;background-repeat:no-repeat}
.mk88info{margin-top:8px;min-height:132px}
.mk88inf{display:flex;gap:14px;align-items:flex-start;background:rgba(0,0,0,.28);border:1px solid rgba(184,150,62,.45);border-radius:10px;padding:10px 12px}
.mk88inf.empty{color:var(--muted);font-size:13px;align-items:center;min-height:110px;justify-content:center}
.mk88art{flex:none;display:grid;place-items:center;width:150px}.mk88art .cimg{max-width:150px}.mk88art .cimg.wide{width:150px}
.mk88txt{min-width:0;flex:1;font-size:13.5px}.mk88txt>b{font:400 19px var(--display);color:var(--gold2)}.mk88txt .lv{color:var(--muted);font-size:12px;margin:1px 0 6px}
.mk88txt table{border-collapse:collapse}.mk88txt th{color:var(--muted);font-weight:500;text-align:left;padding:1px 10px 1px 0;vertical-align:top}.mk88txt td{padding:1px 0}
.mk88txt p{margin:5px 0 0}.mk88txt .fit .ok{color:#8fd18a}.mk88txt .fit .sw{color:#f0c060}.mk88txt .fit .no{color:#e07a6a}
.mk88txt .wc88{display:flex;flex-wrap:wrap;gap:4px}
#mk88peek{position:fixed;left:50%;top:70px;transform:translateX(-50%);width:min(560px,92vw);z-index:9000;background:linear-gradient(#2a1f17,#1c140f);border:1px solid var(--gold);border-radius:12px;
  padding:8px 10px 10px;box-shadow:0 14px 40px rgba(0,0,0,.6);animation:pk88in .2s ease-out;cursor:pointer}
#mk88peek.out{opacity:0;transform:translate(-50%,-8px);transition:opacity .2s,transform .2s}
#mk88peek .pk88h{font-size:14px;color:var(--bone);margin:0 2px 6px}#mk88peek .rn88{font-family:"Marcellus SC",Georgia,serif;color:#ffd76a}
@keyframes pk88in{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
.mk88 .fly88{transition:transform .55s cubic-bezier(.4,0,.8,.4),opacity .55s!important;opacity:0!important;transform:translate(-50%,-160%) rotate(-90deg) scale(1.2)!important}
.mk88 .mb-back.fly88{transform:translateY(-120%)!important}
.mk88 .mb-a.fly88{transform:translateY(-140%) scale(1.3)!important}
@media (max-width:600px){.mk88inf{flex-direction:column;align-items:center;text-align:center}.mk88txt table{margin:0 auto}.mk88art{width:120px}.mk88die b{font-size:14px}}
body.calm .mk88die{animation:none}`;document.head.appendChild(css)}
