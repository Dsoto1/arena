/* =====================================================================
   98-AVATAR73 · v0.73 — the armored avatar, quieter and more useful (Virgilante)
   =====================================================================
   • No HP/AP numbers over the avatar: hover (or tap) a body part for its HP, AP and the pieces worn there (avPop).
   • The location rows under the avatar keep the bars and piece names; the small armor pictures go (the avatar wears them).
   • A struck body part flashes red on the avatar (AVHIT: HP or AP dropped since the last draw).
   • Try-on ghost: hovering an armor card in the market or in a loot choice shows your avatar wearing it, with its stats.
   • Records: Ludus Flavius records and the class designer show the avatar in the class's starting armor (avatarFor73).
   ===================================================================== */
const AVHIT={};const AVHIT_MS=1100;
const avLocOf=t=>{for(const l of LOCS)if(t.startsWith(LOCN[l]+':')||t.startsWith(LOCN[l]+' '))return l;return null};
{const base=avatarSVG;avatarSVG=function(p){let s=base.apply(this,arguments);try{if(!p||!p.hp||p.id==='afit')return s;
  /* the chips go */
  s=s.replace(/<circle cx="[\d.]+" cy="[\d.]+" r="9"[^>]*\/><text[^>]*>[^<]*<\/text>/g,'').replace(/<circle cx="[\d.]+" cy="[\d.]+" r="7" fill="#b9c1c9"\/><text[^>]*>[^<]*<\/text>/g,'');
  /* the zones answer a hover; a struck one flashes */
  const now=performance.now();const flash=[];
  for(const l of LOCS){const v=(p.hp[l]||0)*100+(p.ap[l]||0);const k=p.id+'|'+l;const was=AVHIT[k];if(!was)AVHIT[k]={v,t:0};else if(v<was.v)AVHIT[k]={v,t:now};else if(v!==was.v)AVHIT[k]={v,t:was.t}}
  s=s.replace(/<path d="([^"]*)" fill="([^"]*)" fill-opacity="([^"]*)" stroke="none"><title>([^<]*)<\/title><\/path>/g,(m0,d,f,fo,t)=>{const l=avLocOf(t);const H=l&&AVHIT[p.id+'|'+l];if(H&&now-H.t<AVHIT_MS)flash.push(d);
    return `<path d="${d}" fill="${f}" fill-opacity="${fo}" stroke="none" class="avzone" pointer-events="all" data-avtip="${esc(t)}"${l?` data-avloc="${l}"`:''}/>`});
  if(flash.length)s=s.replace('</svg>',flash.map(d=>`<path d="${d}" class="avhit" fill="#ff4a3a" pointer-events="none"/>`).join('')+'</svg>');
  /* the zones sit above the armor so the hover reaches them */
  const zs=[];s=s.replace(/<path [^>]*class="avzone"[^>]*\/>/g,m0=>{zs.push(m0.replace('fill="none"','fill="#000"').replace(/fill-opacity="[^"]*"/,'fill-opacity="0"'));return m0});if(zs.length)s=s.replace('</svg>',zs.join('')+'</svg>')}catch(e){console.error(e)}return s}}
/* keep redrawing the board panel while a flash is running */
setInterval(()=>{try{const now=performance.now();if(Object.values(AVHIT).some(h=>h.t&&now-h.t<AVHIT_MS+200)&&typeof render==='function'&&S&&!S.over&&document.querySelector('#board .avhit'))render()}catch(e){}},400);
/* the hover card */
function avPopShow(el,ev){const t=el.dataset.avtip||'';const m=t.match(/^([^:]+):\s*(\d+) HP, (\d+) AP(?: · (.*))?$/);let pop=document.getElementById('avPop');if(!pop){pop=document.createElement('div');pop.id='avPop';pop.className='avpop';document.body.appendChild(pop)}
  const pcs=m&&m[4]?m[4].split(', '):[];const card=n=>{const k=Object.keys(ARM).find(x=>ARM[x].n===n);const A=k&&ARM[k];return `<div class="avpc">${k&&typeof armArtCell==='function'?armArtCell(k,30):''}<span><b>${esc(n)}</b>${A?`<small>${A.ap} AP · L${A.lv||1}${A.bonus?` · +${Object.values(A.bonus)[0]} AP to ${LOCN[Object.keys(A.bonus)[0]]||Object.keys(A.bonus)[0]}`:''}</small>`:''}</span></div>`};
  pop.innerHTML=m?`<b class="avpl">${esc(m[1])}</b><div class="avnums"><span class="hp">HP <b>${m[2]}</b></span><span class="ap">AP <b>${m[3]}</b></span></div>${pcs.length?pcs.map(card).join(''):'<div class="rc-sub">no armor here</div>'}`:esc(t);
  pop.hidden=false;const r=el.getBoundingClientRect();const x=Math.min(window.innerWidth-230,(ev&&ev.clientX||r.right)+14),y=Math.max(8,Math.min(window.innerHeight-180,(ev&&ev.clientY||r.top)-20));pop.style.left=x+'px';pop.style.top=y+'px'}
document.addEventListener('mouseover',e=>{const z=e.target.closest&&e.target.closest('[data-avtip]');const pop=document.getElementById('avPop');if(z)avPopShow(z,e);else if(pop&&!pop.hidden&&!e.target.closest('#avPop'))pop.hidden=true});
document.addEventListener('click',e=>{const z=e.target.closest&&e.target.closest('[data-avtip]');if(z){avPopShow(z,e);return}const pop=document.getElementById('avPop');if(pop&&!e.target.closest('#avPop'))pop.hidden=true},true);
/* an avatar wearing a list of [armorKey, location] */
function avatarFor73(list,id){const p={id:id||'rec',name:'',hp:{},ap:{},pieces:{},w:{}};for(const l of LOCS){p.hp[l]=BASE_HP[l];p.ap[l]=0;p.pieces[l]=[]}
  for(const [k,l] of list||[]){const A=ARM[k];if(!A||!p.pieces[l])continue;p.pieces[l].push({key:k,n:A.n,ap:A.ap});p.ap[l]+=A.ap}return p}
const avatarCls73=cls=>{const C=CLASSES[cls];return C&&C.armor?avatarFor73(C.armor,'rec_'+cls):null};
/* try-on ghost: an armor card hovered in the market or a loot choice */
function tryOnShow(el){const ref=el.dataset.card||'';const k=ref.slice(2);const A=ARM[k];const me0=typeof cur==='function'&&S&&!S.over?cur():null;if(!A||!me0||!me0.pieces)return;
  const p={...me0,id:'tryon',hp:{...me0.hp},ap:{...me0.ap},pieces:Object.fromEntries(LOCS.map(l=>[l,[...(me0.pieces[l]||[])]]))};
  const locs=A.slot==='head'?['head']:A.slot==='chest'?['chest']:A.slot==='arm'?(A.pair?['rarm','larm']:['rarm']):(A.pair?['rleg','lleg']:['rleg']);
  for(const l of locs){p.pieces[l].push({key:k,n:A.n,ap:A.ap});p.ap[l]=(p.ap[l]||0)+A.ap}
  let box=document.getElementById('tryOn');if(!box){box=document.createElement('div');box.id='tryOn';box.className='tryon';document.body.appendChild(box)}
  box.innerHTML=`<div class="tohd">👤 Try it on</div><div class="toav">${avatarSVG(p).replace(/class="avzone"[^>]*data-avtip="[^"]*"/g,'')}</div><div class="tost"><b>${esc(A.n)}</b><small>${A.ap} AP · ${A.slot}${A.pt&&A.pt!=='helm'&&A.pt!=='chest'?' '+A.pt:''} · L${A.lv||1}${A.stack?' · stacks':''}${A.bonus?` · +${Object.values(A.bonus)[0]} AP to ${LOCN[Object.keys(A.bonus)[0]]||''}`:''}</small></div>`;
  const r=el.getBoundingClientRect();box.hidden=false;const x=r.right+250>window.innerWidth?r.left-190:r.right+10;box.style.left=Math.max(4,x)+'px';box.style.top=Math.max(8,Math.min(window.innerHeight-330,r.top-40))+'px'}
document.addEventListener('mouseover',e=>{const c=e.target.closest&&e.target.closest('#modal [data-card^="a:"]');const box=document.getElementById('tryOn');if(c)tryOnShow(c);else if(box&&!box.hidden)box.hidden=true});
/* records: the avatar in the class's starting armor */
{const base=ludusDetail;ludusDetail=function(g){let h=base.apply(this,arguments);try{const p=g&&avatarCls73(g.cls);if(p)h=h.replace('<div class="gdetail" id="gDetail">',`<div class="gdetail recwav" id="gDetail"><div class="recav" title="Starting armor of the ${esc(CLASSES[g.cls].name)}">${avatarSVG(p)}</div>`)}catch(e){console.error(e)}return h}}
{const base=classStudioHTML;classStudioHTML=function(){let h=base.apply(this,arguments);try{const k=ST.draft;if(k&&typeof charArmor==='function'){const p=avatarFor73(charArmor({arm:k.arm||{}}),'rec_draft');
  h=h.replace('id="clsCard" style="display:flex;justify-content:center">',`id="clsCard" style="display:flex;justify-content:center;gap:12px;align-items:flex-start"><div class="recav cls" title="The class's armor on the body">${avatarSVG(p)}</div>`)}}catch(e){console.error(e)}return h}}
(()=>{const st=document.createElement('style');st.textContent=`
#board .loc .pieces .cimg{display:none}
.avzone{cursor:help}.avzone:hover{fill:#f0cf7d;fill-opacity:.12}
.avhit{animation:avhit 1.1s ease-out forwards}@keyframes avhit{0%{fill-opacity:.7}100%{fill-opacity:0}}
@media (prefers-reduced-motion:reduce){.avhit{animation:none;fill-opacity:.35}}body.calm .avhit{animation:none;fill-opacity:.35}
.avpop{position:fixed;z-index:40;min-width:170px;max-width:240px;background:rgba(15,10,7,.96);border:1px solid var(--gold);border-radius:8px;padding:8px 10px;box-shadow:0 10px 30px rgba(0,0,0,.6);font-size:13px;pointer-events:none}
.avpl{font:400 16px var(--display);color:var(--gold2)}.avnums{display:flex;gap:10px;margin:3px 0 6px;font:12px var(--mono)}.avnums .hp b{color:var(--hp)}.avnums .ap b{color:var(--ap)}
.avpc{display:flex;gap:6px;align-items:center;margin:3px 0}.avpc small{display:block;color:var(--muted);font-size:11px}.avpc .setart,.avpc .cimg{width:30px!important;height:30px!important}
.tryon{position:fixed;z-index:40;width:180px;background:rgba(15,10,7,.96);border:1px solid var(--gold);border-radius:8px;padding:8px;box-shadow:0 10px 30px rgba(0,0,0,.6);pointer-events:none}
.tohd{font:11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--gold2);margin-bottom:4px}.toav svg{width:100%;height:auto;display:block}.tost small{display:block;color:var(--muted);font-size:11.5px}
.gdetail.recwav{position:relative;padding-right:96px}.recav{width:76px}.recav svg{width:100%;height:auto;display:block}.gdetail .recav{position:absolute;right:10px;top:10px}
.recav.cls{width:110px;flex:none}`;document.head.appendChild(st)})();
/* custom class cards: a snapshot of the class wearing its armor (61-studio53 calls it; printed class cards keep their art);
   a character who takes the class shows as a small token in the corner */
function classSnap73(k,ch){const A=typeof charArmor==='function'?charArmor({arm:k.arm||{}}):[];
  const av=avatarSVG(avatarFor73(A,'cc'+String(k.id||k.name||'x').replace(/\W/g,''))).replace(/<text[^>]*>[^<]*<\/text>/g,'').replace(/ data-avtip="[^"]*"/g,'').replace(/ data-avloc="[^"]*"/g,'').replace(/ class="avzone"/g,'');
  let s=nestSVG(av,176,72,112,236);
  if(ch&&typeof figureSVG==='function'&&typeof tokenOfChar==='function')s+=nestSVG(figureSVG(tokenOfChar(ch)),246,236,44,76);return s}
