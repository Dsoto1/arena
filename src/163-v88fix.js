/* 163-v88fix — v0.88 his notes (2026-10-05):
   • CROWD FAVOR window with pictures: each buy shows what you get — the arena deck's card back (x:3), the Arena Key / Health Elixir /
     AP Upgrade token rounds (40-rtok), the market board, his coin — and 🗡 SPEAR A SPECTATOR now lives here (it left the action bar:
     not a main feature). While Crowd Favor is locked the window still opens for the spear alone.
   • Floor spikes fit inside the tile they rise from (drawSpikeTile drawn a little smaller, centred on the tile). */
openCrowd=async function(player){
  for(;;){const cfOK=cfAllowed();const spear=typeof spearTargets==='function'&&spearTargets(player).length>0;if(!cfOK&&!spear)return;
    const lock=cfOK?'':_T('locked this round');
    const pic=h=>`<span class="cf88p">${h}</span>`;const tok=k=>typeof rtokHTML==='function'?rtokHTML(k,46):'';
    const it=(v,img,name,cost,dis,note)=>({value:v,disabled:dis,label:`${pic(img)}<span class="cf88t"><b>${name}</b><small>${note||cost}</small></span>`});
    const grid=[
      it('card',cardHTML('x:3','xs'),_T('Arena card'),cfAmt87(5),!cfOK||player.cf<5||!canDraw(),lock),
      it('key',tok('key'),_T('Arena Key'),cfAmt87(5),!cfOK||player.cf<5,lock),
      it('el',tok('elix4'),_T('Health Elixir token (+4 HP)'),cfAmt87(8),!cfOK||player.cf<8,lock),
      it('ap',tok('ap3'),_T('AP Upgrade token (+3 AP)'),cfAmt87(8),!cfOK||player.cf<8,lock),
      it('mk',`<img src="${assetURL('market_board.webp')}" alt="" class="cf88mb">`,_T('Unlock market for this turn'),cfAmt87(3),!cfOK||player.cf<3||player.market||!!EV().noMarket,lock||(player.market?_T('already open'):'')),
      it('dc',`<span class="cf88coin">${ICO.coin}</span>`,_T`Discard ${coinAmt87(10)} for ${cfAmt87(2)}`,coinAmt87(10),!cfOK||player.coin<10,lock),
      it('sp',tok('spectator'),_T('Spear a spectator'),_T`${cfAmt87(3)} · once per event`,!spear,spear?'':_T('nobody in reach'))];
    const v=await modal(_T('Crowd Favor'),`<p>${_T`Crowd Favor is spent in Phase 3. If it ever drops below zero, you are eliminated. You have <b>${cfAmt87(player.cf)}</b> and <b>${coinAmt87(player.coin)}</b>.`}</p><div class="pickgrid cf88g" id="pickgrid"></div>`,
      [{label:_T('Close'),value:'close'}],{grid,wide:1});
    if(v==='close'||!v)break;
    if(v==='sp'){await humanSpear(player);render();break}
    if(v==='mk'){player.cf-=3;player.market=true;log(_T`${nm(player)} spends ${cfAmt87(3)} to unlock the market.`)}
    if(v==='key'){player.cf-=5;player.keys++;log(_T`${nm(player)} buys an Arena Key.`)}
    if(v==='card'){player.cf-=5;await drawArena(player)}
    if(v==='el'){player.cf-=8;player.items.push(mkOffer('elix4'));log(_T`${nm(player)} buys a Health Elixir token.`)}
    if(v==='ap'){player.cf-=8;player.items.push(mkOffer('ap3'));log(_T`${nm(player)} buys an AP Upgrade token.`)}
    if(v==='dc'){player.coin-=10;coinLog(player,-10,_T('thrown to the crowd'));player.cf+=2;log(_T`${nm(player)} throws ${coinAmt87(10)} to the crowd (${cfAmt87('+2')}).`)}
    render();if(S.over||!player.alive)break}};
{const css=document.createElement('style');css.textContent=`
.pickgrid.cf88g{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));max-height:none;overflow:visible;gap:8px}
.pickgrid.cf88g .btn{display:flex;align-items:center;gap:12px;text-align:left;justify-content:flex-start;min-height:72px;padding:8px 12px}
.cf88p{flex:none;width:56px;height:60px;display:grid;place-items:center}.cf88p .cimg.xs{height:58px;width:auto}
.cf88p .rtok{width:48px!important;height:48px!important}.cf88mb{width:56px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.5)}
.cf88coin .ico,.cf88coin img{width:40px;height:40px}
.cf88t{display:flex;flex-direction:column;gap:2px;min-width:0}.cf88t b{font-weight:600}.cf88t small{opacity:.85}
.pickgrid.cf88g .btn:disabled .cf88p{filter:grayscale(.8);opacity:.55}`;document.head.appendChild(css)}
/* the spike caps sat a little wide of their tile: drawn at 82% around the tile centre (the 3D spikes still rise above it) */
const SPIKE88=0.82; /* TWEAK: spike cap size against the tile */
{const base=drawSpikeTile;drawSpikeTile=function(s){if(!s||typeof ctx==='undefined'||typeof center!=='function')return base.apply(this,arguments);
  const m=center(s.r,s.c);ctx.save();try{ctx.translate(m.x,m.y);ctx.scale(SPIKE88,SPIKE88);ctx.translate(-m.x,-m.y);return base.apply(this,arguments)}finally{ctx.restore()}}}
/* the arena changed size on CPU turns: the top bar sometimes grew a line (54 → 67 px: a longer status chip wrapping), the arena's top
   moved, and the fit (122 FIT81, keyed on that top) shrank the board. The bar now keeps the tallest height it has had in this window
   (reset on resize), so the board stays put; the fit's hover line also keeps its tallest height (122 edit). */
const BAR88={h:0,w:0};
function bar88Hold(){try{const bar=document.querySelector('.bar');if(!bar||!bar.offsetParent)return;if(innerWidth!==BAR88.w){BAR88.w=innerWidth;BAR88.h=0;bar.style.minHeight=''}
  const h=Math.round(bar.getBoundingClientRect().height);if(h>BAR88.h){BAR88.h=h;bar.style.minHeight=h+'px';if(typeof FIT81!=='undefined')FIT81.key=''}}catch(e){}}
{const base=fitReserve;fitReserve=function(){bar88Hold();return base.apply(this,arguments)}}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>bar88Hold()).observe(document.querySelector('.bar')||document.body);
/* the avatar flickered on CPU turns: every render rebuilt the whole fighter board (a tooltip's text changing is enough), so the avatar's
   images loaded again. When the new avatar is the same as the one on screen, the one on screen stays. */
{const base=render;render=function(){const old=document.querySelector('#board .avatar');const r=base.apply(this,arguments);
  try{const nu=document.querySelector('#board .avatar');if(nu&&nu!==old){const h=nu.outerHTML;if(old&&old._h88===h)nu.replaceWith(old);else nu._h88=h}}catch(e){}return r}}
/* TRADES you can see: an offer window shows what they give and what they want, side by side with the cards / tokens / weapons / coin;
   "You give…" / "…and ask for" list them with pictures too. (06-ai + 07-ui set TRADE88 just before asking.) */
let TRADE88=null;
function trade88Pic(x,owner){try{
  if(x.t==='coin')return `<span class="tr88coin">${ICO.coin}<b>${x.v}</b></span>`;
  if(x.t==='key')return typeof rtokHTML==='function'?rtokHTML('key',64):'🗝';
  if(x.t==='w'){const w=owner&&owner['w'+x.a];return w&&w.key&&cardRef('w:'+w.key)?cardHTML('w:'+w.key,'sm'):'⚔'}
  if(x.t==='item'&&x.it){const it=x.it;if(it.kind==='card'&&CARDS[it.key])return cardHTML('c:'+it.key,'sm');
    if(it.kind==='offer'&&typeof rtokHTML==='function'){const h=rtokHTML(it.key,64);if(h)return h}}}catch(e){}return ''}
function trade88Label(x,owner){const p=trade88Pic(x,owner);return p?`<span class="tr88l"><span class="tr88p">${p}</span><span>${x.label}</span></span>`:x.label}
function trade88Body(T){const side=(who,x,owner,cap)=>`<div class="tr88s"><div class="tr88h">${cap}</div><div class="tr88pic">${trade88Pic(x,owner)}</div><b>${x.label}</b></div>`;
  return `<div class="tr88">${side(T.from,T.give,T.from,_T`${esc(T.from.name)} gives you`)}<div class="tr88x">⇄</div>${side(T.to,T.get,T.to,_T`for your`)}</div>`}
{const base=modal;modal=function(title,body,buttons,opt){const T=TRADE88;
  if(T&&!HEADLESS){const t=String(title||'');if(t===_T`${T.from.name} proposes a trade`||t===_T`${T.to.name}: trade offer`){TRADE88=null;try{body=trade88Body(T)+body}catch(e){}return base.call(this,title,body,buttons,opt)}}
  return base.apply(this,arguments)}}
/* the closed market: the whole board dims under the lock (the weapon cards sat above the old veil), and the board fits the window */
{const css=document.createElement('style');css.textContent=`
.tr88{display:flex;align-items:stretch;justify-content:center;gap:14px;margin:4px 0 10px;flex-wrap:wrap}
.tr88s{flex:1;min-width:150px;max-width:240px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px;border:1px solid rgba(184,150,62,.45);border-radius:10px;background:rgba(0,0,0,.25);text-align:center}
.tr88h{font-size:12px;color:var(--muted)}.tr88pic{min-height:96px;display:grid;place-items:center}.tr88pic .cimg.sm{zoom:1.3}.tr88pic .rtok{width:84px!important;height:84px!important}
.tr88x{align-self:center;font-size:26px;color:var(--gold2)}
.tr88coin{display:inline-flex;align-items:center;gap:6px}.tr88coin .ico,.tr88coin img{width:48px;height:48px}.tr88coin b{font-size:26px;color:var(--gold2)}
.tr88l{display:inline-flex;align-items:center;gap:10px;text-align:left}.tr88p{flex:none;display:grid;place-items:center;width:52px}.tr88p .rtok{width:44px!important;height:44px!important}.tr88p .tr88coin .ico,.tr88p .tr88coin img{width:24px;height:24px}.tr88p .tr88coin b{font-size:14px}
.mkt75 .mboard75{width:min(100%,calc((100vh - 330px) * 1.5456));margin:0 auto}
.mkt75-lock{z-index:20;background:rgba(10,6,4,.68);backdrop-filter:grayscale(.7)}`;document.head.appendChild(css)}
/* zoomed in, the follow camera redraws every frame while it eases: those in-between frames skip the sand grain and edge shade
   (the frame where the camera settles draws them again), so zooming and panning stay smooth */
{const base=drawShipTile;drawShipTile=function(){const moving=typeof CAM!=='undefined'&&CAM&&CAM.raf;if(!moving||typeof SAND83==='undefined')return base.apply(this,arguments);
  const g=SAND83.grain,s=SAND83.shade;SAND83.grain=0;SAND83.shade=0;try{return base.apply(this,arguments)}finally{SAND83.grain=g;SAND83.shade=s}}}
/* RESULT CARDS (his layout, v0.88): the Fate card on the left, the Fate's name + the CF sums + Final Fate score on the right — same
   font sizes, the card as tall as the sums, both centred; a narrow card (phones, three-across tables) stacks them again. */
{const css=document.createElement('style');css.textContent=`
.rcard{container-type:inline-size}
.rcard .rc-fate:has(>.cimg){flex-direction:row;align-items:center;gap:22px}
.rcard .rc-fate>.cimg{flex:none;align-self:center;width:clamp(120px,32%,200px)!important;height:auto!important}
.rcard .rc-fate>.cimg+div{flex:1;min-width:0}
.rcard .rc-fate:has(>.cimg) .rc-fname{text-align:left}
@container (max-width:440px){.rcard .rc-fate:has(>.cimg){flex-direction:column;align-items:stretch}.rcard .rc-fate>.cimg{width:min(150px,50%)!important}.rcard .rc-fate:has(>.cimg) .rc-fname{text-align:center}}`;document.head.appendChild(css)}
