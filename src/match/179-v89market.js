/* 179-v89market — v0.89 K: THE MARKET WITHOUT THE d4 (Virgilante, 2026-10-05).
   • PURCHASES: no die, no 2-coin re-roll. Pay for a level → that level's ROW lights up on his board (the rest dims) → take ANY face-up
     weapon OR any ONE armor piece from the row. marketBuy75 (106) is replaced: same signature, same {kind,key} result. CPUs take the
     best piece for them (aVal75 + fits-you + their leaning), shown as the 155 peek by Speed. Free picks (offerings, cards with opt.only)
     use the same window on their side of the row and log "X chooses outright at level N" (178's borrowed Market Choice path removed).
   • SLOT 4: the weapon deck's top card is ALWAYS face up (W.up4 = a non-enumerable getter on the deck top, so snapshots/hashes never
     carry it); taking it flips the next. The face-down backs show as the pile under it.
   • THE CHOOSE CARD (CARDS.mchoice, his answer): its legacy wording stays (+ a "Now:" line); it gives ONE FREE WEAPON chosen from ANY
     weapon left on the board, levels 1-3 (all three rows lit, armor dimmed; pick89). useItem wrapper; CPUs play it from cpuUseItems
     (the best weapon for them) when they have an arm. player.mchoice is no longer read.
   • DRAFTS (122 runDraft, direct edit): every pick offers ALL remaining level 1-3 gear that fits the drafter — the 155 spread lights it all.
   • Texts: market hint (HINT_TEXT), the Market action rule line (RULE_ACT), the window foot (106 direct edit), Settings → Animations (159).
   Direct edits elsewhere: 106 openMarket foot + the Market Choice note dropped; 06-ai cpuMarket no longer plays Choose; 122 runDraft
   offers every fitting piece; 178 free-pick wrapper removed; 159 animations line. (155's mk88Roll/RollWin/ChoiceWin are no longer reached.)
   Online / hot seat: the human window is a modal() whose lit pieces carry the hidden option buttons' data-mi — the value goes through modal. */

/* ---------- slot 4 always face up ---------- */
function wFlip89(Wm){if(!Wm||!Array.isArray(Wm.deck))return;const d=Object.getOwnPropertyDescriptor(Wm,'up4');if(d&&d.get)return;delete Wm.up4;
  Object.defineProperty(Wm,'up4',{configurable:true,enumerable:false,get(){return this.deck.length?this.deck[this.deck.length-1]:null},set(){}})}
function mktFlip89(m){try{if(m&&m.w)for(const lv of [1,2,3])wFlip89(m.w[lv])}catch(e){console.error(e)}}
{const base=buildMarket;buildMarket=function(){const m=base.apply(this,arguments);mktFlip89(m);return m}}
{const base=mktFix75;mktFix75=function(){const r=base.apply(this,arguments);if(S&&S.market)mktFlip89(S.market);return r}}
/* the board: the flipped card sits on the pile of face-down backs */
{const base=boardHTML75;boardHTML75=function(){if(S&&S.market)mktFlip89(S.market);let h=base.apply(this,arguments);try{
    const lvs=[3,2,1].filter(lv=>S.market.w[lv].deck.length);let n=0;
    h=h.replace(/(<span class="mb-w" data-card="w:[^"]*"[^>]*?) \(flipped\)("><\/span>)/g,(m,a,b)=>{const lv=lvs[n++];const D=lv?S.market.w[lv].deck.length:0;
      return (D>1&&typeof WBACK75==='function'?`<span class="under89 mb-back75" style="background-image:url('${WBACK75(lv)}')"></span>`:'')+a+b})}catch(e){console.error(e)}return h}}

/* ---------- the purchase / free pick ---------- */
/* every piece of the given rows on the allowed sides: weapons in slots 1-3 + the face-up top of slot 4, every armor piece in the 4 piles */
function rowOpts89(lvs,sides){const o=[];for(const lv of [].concat(lvs)){const W_=S.market.w[lv],A=S.market.a[lv];
  if(sides.includes('w')){for(let s=1;s<=3;s++)if(W_.slots[s-1])o.push({lv,kind:'w',s,key:W_.slots[s-1]});if(W_.deck.length)o.push({lv,kind:'w',s:4,key:W_.deck[W_.deck.length-1]})}
  if(sides.includes('a'))for(let s=1;s<=4;s++)for(const key of (A.piles[s-1]||[]))o.push({lv,kind:'a',s,key})}return o}
/* cpuVal89 — what a piece is worth to this gladiator: its value, +1.5 if it has somewhere free to go (−1.5 if not), +1 on the leaning side */
function cpuVal89(p,o,pref){let v=aVal75(o.kind,o.key);try{v+=draftFits81(p,{kind:o.kind,k:o.key})?1.5:-1.5}catch(e){}if(o.kind===pref)v+=1;return v}
/* pick89 — the chosen piece of the lit rows (the board window for humans, the best piece for CPUs), taken off the board. Returns {kind,key,lv} */
async function pick89(player,lvs,sides,opt={}){mktFix75();const opts=rowOpts89(lvs,sides);if(!opts.length)return {kind:null,key:null};
  let o,snap=null;const one=lvs.length===1?lvs[0]:0;
  if(player.cpu){o=opts.map((x,i)=>[x,cpuVal89(player,x,opt.pref),i]).sort((a,b)=>b[1]-a[1]||a[2]-b[2])[0][0];
    if(!HEADLESS&&typeof mk88PeekOn==='function'&&mk88PeekOn())snap=boardHTML75(player)}
  else{const what=sides.length>1?_T('any weapon or one armor piece'):sides[0]==='w'?_T('any weapon'):_T('any one armor piece');
    const v=await askW(player,'marketTake',opt.title||_T`Market · level ${one}`,`<p class="rc-sub" style="margin:6px 0 0">${one?_T`Take ${what} from the level ${one} row.`:_T`Take ${what} from the board.`}</p>`,
      opts.map((x,i)=>({label:x.kind==='w'?W[x.key].n:ARM[x.key].n,sub:x.kind==='w'?_T`weapon · level ${x.lv} · slot ${x.s}`:_T`armor · level ${x.lv} · slot ${x.s}`,value:'p'+i,card:(x.kind==='w'?'w:':'a:')+x.key})),
      {wide:1,mkt89:{player,lvs,sides,opts}});
    o=opts[typeof v==='string'&&v[0]==='p'?+v.slice(1):0]||opts[0]}
  const key=o.kind==='w'?wTake75(S.market.w[o.lv],o.s):aTake75(S.market.a[o.lv],o.s,o.key);
  log(_T`${nm(player)} takes <b>${esc(o.kind==='w'?W[key].n:ARM[key].n)}</b> from the level ${o.lv} row.`);
  if(snap)try{await mk88Peek({html:snap,lv:one||null,slot:null,ref:(o.kind==='w'?'w:':'a:')+key,side:o.kind,who:nm(player),what:o.kind==='w'?W[key].n:ARM[key].n})}catch(e){console.error(e)}
  return {kind:o.kind,key,lv:o.lv}}
marketBuy75=async function(player,lv,opt={}){mktFix75();opt=opt||{};const sides=opt.only?[opt.only]:['w','a'];
  if(!rowOpts89([lv],sides).length){log(_T`Nothing is left at level ${lv}${opt.only?(opt.only==='w'?_T(' (weapons)'):_T(' (armor)')):''}.`);return {kind:null,key:null}}
  if(opt.only)log(_T`${nm(player)} chooses outright at level ${lv}.`);
  const r=await pick89(player,[lv],sides,opt);return {kind:r.kind,key:r.key}};

/* the window: his board, the rows lit, everything else dimmed; each lit piece carries its hidden button's data-mi */
{const base=modal;modal=function(title,body,buttons,opt){const M=opt&&opt.mkt89;
  if(!M||HEADLESS||typeof document==='undefined')return base.apply(this,arguments);
  const {player,lvs,sides,opts}=M;const B=buttons.map(b=>({...b,style:'display:none'}));
  const xs=sides.length>1?[2,98]:sides[0]==='w'?[MB75.w[0][0]-1,MB75.w[3][1]+1]:[MB75.a[0][0]-1,MB75.a[3][1]+1];
  const band=lvs.map(lv=>{const y=MB75.rows[lv];return `<div class="band89" style="left:${xs[0]}%;width:${xs[1]-xs[0]}%;top:${y[0]-1}%;height:${y[1]-y[0]+2}%"></div>`}).join('');
  const html=mk88Wrap(boardHTML75(player).replace(/<\/div>$/,band+'</div>'))+body;
  return base.call(this,title,html,B,{...opt,wide:1,onOpen:done=>{try{const root=document.querySelector('#mBody .mk88');mk88Tag(root);
      root.querySelectorAll('.mboard75 > .mb-cell').forEach(c=>{if(!lvs.includes(+c.dataset.lv)||!sides.includes(c.dataset.side))c.classList.add('dim89')});
      const W_=mk88Wire(root,player);const used=new Set();const pairs=[];
      opts.forEach((o,i)=>{const cell=mk88Cell(root,o.lv,o.kind,o.s);if(!cell)return;
        const el=[...cell.querySelectorAll(o.kind==='w'?'.mb-w':'.mb-a')].find(x=>!used.has(x)&&x.dataset.card===(o.kind==='w'?'w:':'a:')+o.key);
        if(el){used.add(el);pairs.push([el,buttons.findIndex(b=>b.value==='p'+i)])}});
      mk88Lit(root,pairs);if(pairs[0])W_.show(pairs[0][0])}catch(e){console.error(e)}if(opt&&opt.onOpen)opt.onOpen(done)}})}}

/* ---------- the Choose card: a free weapon, any level ---------- */
CARDS.mchoice.d89=_T('Now: take any one weapon left in the market (level 1, 2 or 3), free.');
if(!/Now:/.test(CARDS.mchoice.d))CARDS.mchoice.d=CARDS.mchoice.d+' '+CARDS.mchoice.d89;
const mchoiceHas89=()=>{try{mktFix75();return rowOpts89([1,2,3],['w']).length>0}catch(e){return false}};
/* (v1.01: the Choose card's useItem wrapper moved into 328-v101fx's table — bespoke handler mchoice, same code) */
/* CPUs play it like a free-weapon offering: whenever they have an arm and the market still has a weapon */
{const base=cpuUseItems;cpuUseItems=async function(player){try{const it=(player.items||[]).find(x=>x.kind==='card'&&x.key==='mchoice');
    if(it&&player.cpu&&!S.over&&armsAttached(player).length&&mchoiceHas89()){await useItem(player,it);render()}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
{const base=itemPlayable;itemPlayable=function(player,item){if(item&&item.kind==='card'&&item.key==='mchoice')return armsAttached(player).length>0&&mchoiceHas89();return base.apply(this,arguments)}}

/* ---------- texts ---------- */
try{HINT_TEXT.market=_T`Unlocking costs ${cfAmt87(3)}. Level 1/2/3 cost 4/8/12 coin: pay for a level, then take any weapon or one armor piece from its row. The Choose card gives a free weapon of any level.`}catch(e){}
try{RULE_ACT.market=_T('The market: 3 CF opens it for the turn; then pay for a level and take any weapon or one armor piece from its row.')}catch(e){}

{const css=document.createElement('style');css.textContent=`
.mboard75 .under89{position:absolute;left:50%;top:50%;width:88%;height:94%;transform:translate(-44%,-46%);border-radius:5px;background-size:cover;background-position:center;box-shadow:0 3px 8px rgba(0,0,0,.55);z-index:0}
.mboard75 .mb-cell.w .under89+.mb-w{z-index:1}
.mk88 .mb-cell.dim89{opacity:.6;filter:grayscale(.6) brightness(.8);transition:opacity .2s}
.mk88 .mk88sel .mb-cell.dim89 .mb-w,.mk88 .mk88sel .mb-cell.dim89 .mb-a,.mk88 .mk88sel .mb-cell.dim89 .under89{opacity:1;filter:none}
.mk88 .band89{position:absolute;border-radius:10px;box-shadow:inset 0 0 0 2px rgba(255,215,106,.85),0 0 18px 4px rgba(255,200,80,.45);pointer-events:none;z-index:0}`;document.head.appendChild(css)}
