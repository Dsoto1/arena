/* 90-armfit (v0.68) — the printed armor worn on the player-board avatar.
   Virgilante's armor art (assets/armor2.webp, 9x3 cells of 330 px, cut-outs drawn for avatar.png) is layered on the body
   at the avatar's own equip points instead of the old steel sheen over each location.
   • ARM_CROP[img] = the piece's visible box in the sheet (alpha bounds); pairs (Femoralia, Greaves) use one half per leg.
   • ARM_FIT[key] = {x,y,w,r} in the avatar's 150x332 viewBox for the RIGHT side (image-left); left pieces are mirrored
     about the body's centre line and nudged to the left equip points (EQ_L). Per-browser fine-tune: localStorage
     flavius_armfit (the Fit mode in the Armor forge, editors only) → Export → paste into ARM_FIT.
   • A location's AP is the pool of every piece on it (rulebook p.22): the pieces dim and crack together as the pool
     drops and are all destroyed (fall off) when it reaches 0.
   • Custom forge pieces keep their own fit (caOnBodySVG). TWEAK: ARM_FIT, ARM_DIM. */
const ARM_SHEET={f:'armor2.webp',w:2970,h:990};
const ARM_CROP=[[39,16,252,299],[366,15,256,300],[706,16,233,298],[1053,16,202,299],[1376,15,217,300],[1680,15,268,300],[2037,165,216,149],[2385,16,178,299],[2703,18,198,294],
  [72,345,186,300],[398,345,198,300],[740,346,171,299],[1005,366,300,257],[1393,348,178,296],[1723,355,142,278],[2055,348,177,294],[2326,351,299,286],[2717,345,176,292],
  [76,684,155,282],[434,675,123,300],[780,675,90,300],[1105,691,86,281],[1356,675,123,300],[1749,675,132,300],[2027,675,112,297],[2414,675,123,300],[2760,675,88,300]];
/* the avatar's equip points (the red rings in avatar.png), right side = image-left */
const EQ={head:[75,29],sho:[40,77],fore:[30,133],hand:[22,168],chest:[75,96],belt:[75,135],thigh:[60,190],shin:[61,258]};
const EQ_L={sho:[110,76],fore:[119,132],hand:[128,168],thigh:[91,190],shin:[88,258]};
/* x,y = where the piece's centre sits; w = its width on the body; r = turn in degrees */
const ARM_FIT={ /* Virgilante's fits: round 1 (v0.70) + round 2 (2026-10-02 16:04, v0.72). at = equip point; dx,dy = offset; w = width; r = turn; flip = mirror the art; L = the left side's own fit */
  galea:{at:'head',dy:-6,w:39},cassis:{at:'head',dy:-3,w:67},crista:{at:'head',dy:-7,w:67},murmillo:{at:'head',dy:4,w:42},helm5:{at:'head',dy:7,w:58},flavhelm:{at:'head',dy:-12,w:56,dx:-1},
  balteus:{at:'belt',dy:-3,w:57},pectorale:{at:'chest',dy:2,w:59,dx:-1},lorica:{at:'chest',dy:5,w:64},musculata:{at:'chest',dy:5,w:61},amazon:{at:'chest',dy:8,w:60,r:-1},flavchest:{at:'chest',dy:9,w:67},
  thorax:{at:'chest',dy:-2,w:108,dx:1},wraps:{at:'fore',dx:-1,dy:4,w:34},manica:{at:'sho',w:40},provmanica:{at:'fore',dy:-3,w:27,dx:1},spaulder:{at:'sho',dx:8,dy:-2,w:50,flip:1},cestus:{at:'hand',dy:-17,w:29,dx:3,L:{dx:4,dy:-18,r:3,w:29},r:1},
  galerus:{at:'sho',dx:3,dy:-2,w:37},bracers:{at:'fore',dx:-1,dy:-1,w:26},legwrapsU:{at:'thigh',dx:-7,dy:-34,w:25,flip:1},legwraps:{at:'shin',dy:4,w:24,L:{dx:-2,dy:4,w:24},dx:-1,r:1},femoralia:{at:'thigh',dx:-7,dy:-29,w:26},ocrea:{at:'shin',dy:-5,w:26,dx:1,flip:1},
  greaves:{at:'shin',dy:-7,w:23,flip:1},thighplate:{at:'thigh',dx:-6,dy:-32,w:26},cnemis:{at:'shin',dy:-7,w:24,L:{dx:-2,dy:-7,w:24},dx:-1}};
/* the sharper sheet (v0.57) put the orange-brown upper padding in cell 19: Padded Leg Armor (upper) wears it (rulebook p.23) */
if(ARM.legwrapsU)ARM.legwrapsU.img=19;
/* Flavius' Bracers: the gold engraved art is not on the sheet yet — the dark plates (cell 15, also the Provocator Manica) stand in */
if(ARM.bracers)ARM.bracers.img=15;
/* Flavius' Bracers: the dark plates colour-graded gold (Virgilante: the bracers are the same art graded per level) */
const BRACER_GOLD='sepia(1) saturate(2.4) hue-rotate(-8deg) brightness(1.2) contrast(1.05)';
const ARM_DIM=0.5; /* opacity lost when a piece's share of AP is gone (it falls off at 0) */
let ARM_FIT_OVR={};try{ARM_FIT_OVR=JSON.parse(localStorage.getItem('flavius_armfit')||'{}')||{}}catch(e){ARM_FIT_OVR={}}
/* the printed part decides the point: arm upper → shoulder, lower → forearm, hand → hand; leg upper → thigh, lower → shin */
const ARM_PT_AT={arm:{upper:'sho',lower:'fore',hand:'hand'},leg:{upper:'thigh',lower:'shin'}};
function armFit(key){const f={...(ARM_FIT[key]||{}),...(ARM_FIT_OVR[key]||{})};const A=ARM[key];const at=A&&ARM_PT_AT[A.slot]&&ARM_PT_AT[A.slot][A.pt];if(at)f.at=at;return f.at?f:null}
const armSide=l=>l==='larm'||l==='lleg'?'L':'R';
/* the piece's box on the body: centre (cx,cy), width w, height from the crop's aspect */
/* pairs drawn as both legs in one cell: each leg wears its own half (image-left half = the body's right leg), never a mirror */
/* v0.70: no more pair halves — each leg wears the same art, mirrored on the left (Virgilante: the halves faced the same way) */
const ARM_PAIR={};
/* pieces whose art is drawn for the LEFT limb (rulebook p.22: segmented thigh plates step outward) — flipped on the right side */
const ARM_LEFTART={thighplate:1,legwrapsU:1};
function armBox(key,l){const A=ARM[key];const f=armFit(key);if(!A||A.img==null||!f||!ARM_CROP[A.img])return null;const P=ARM_PAIR[A.img];const c=P?P[armSide(l)==='L'?1:0]:ARM_CROP[A.img];
  const L=armSide(l)==='L';const p=(L&&EQ_L[f.at])||EQ[f.at];const x=L&&!EQ_L[f.at]?150-p[0]:p[0];
  /* v0.70: the left side can carry its own adjustments (f.L = {dx,dy,w,r}); otherwise it mirrors the right */
  const F=L&&f.L?{...f,...f.L}:f;
  const cx=L?x-(F.dx||0):x+(F.dx||0),cy=p[1]+(F.dy||0);const h=F.w*c[3]/c[2];return {cx,cy,w:F.w,h,r:F.r||0,crop:c,side:L,mirror:P?!!f.flip:(L!==(!!ARM_LEFTART[key]!==!!f.flip)),gold:key==='bracers'}}
/* each piece's share of the location's AP pool (wear order, as eliminate() drops them) */
/* rulebook p.22: a location's armor is damaged as one pool; at 0 AP every piece on it is destroyed together */
function armShares(p,l){const P=p.pieces[l]||[];const tot=P.reduce((a,pc)=>a+(pc.ap||0),0);const cur=Math.max(0,p.ap[l]||0);const ratio=tot?Math.min(1,cur/tot):1;return P.map(pc=>({pc,cur,ratio}))}
const ARM_FALL=[];const ARM_SEEN={};
function armPieceSVG(B,key,ratio,extra,uid){const c=B.crop;const x=B.cx-B.w/2,y=B.cy-B.h/2;const k=B.w/c[2];const id=_T`acp${String(uid||'').replace(/[^\w-]/g,'')}${key}${extra?'f':''}`;
  const tr=`${B.mirror?`translate(${2*B.cx} 0) scale(-1 1) `:''}${B.r?`rotate(${B.r*(B.mirror?-1:1)*(B.side?-1:1)} ${B.cx} ${B.cy})`:''}`;
  let cracks='';const n=ratio<1?Math.ceil((1-ratio)*3):0;
  for(let i=0;i<n;i++){const sx=x+B.w*(0.25+0.25*i),sy=y+B.h*(0.15+0.2*i);cracks+=`<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}l${(B.w*.12).toFixed(1)} ${(B.h*.1).toFixed(1)}l${(-B.w*.07).toFixed(1)} ${(B.h*.08).toFixed(1)}l${(B.w*.1).toFixed(1)} ${(B.h*.12).toFixed(1)}" fill="none" stroke="#140f0b" stroke-width=".9" stroke-opacity=".8"/>`}
  const href=typeof assetURL==='function'?assetURL(ARM_SHEET.f):ASSET+ARM_SHEET.f;
  const inner=`<g class="armpc" opacity="${(1-ARM_DIM*(1-ratio)).toFixed(2)}" transform="${tr}"><clipPath id="${id}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${B.w.toFixed(1)}" height="${B.h.toFixed(1)}"/></clipPath><image href="${href}" x="${(x-c[0]*k).toFixed(2)}" y="${(y-c[1]*k).toFixed(2)}" width="${(ARM_SHEET.w*k).toFixed(1)}" height="${(ARM_SHEET.h*k).toFixed(1)}" clip-path="url(#${id})" preserveAspectRatio="none"${B.gold?_T` style="filter:${BRACER_GOLD}"`:''}/>${cracks}</g>`;
  return extra?`<g class="${extra.cls}" style="${extra.style}">${inner}</g>`:inner}
/* draw order: padded and wraps first, plate over them, the belt last */
const armZ=key=>ARM[key]&&ARM[key].slot==='chest'?-1:/* v0.91 (his call): chest armor sits under every other piece */key==='balteus'||key==='balteus1'?3:ARM[key]&&ARM[key].stack?0:key==='spaulder'||key==='galerus'?2:1;
function armWornSVG(p){let s='';const now=performance.now();const items=[];
  for(const l of LOCS){if(p.hp[l]<=0)continue;for(const sh of armShares(p,l)){const A=ARM[sh.pc.key];if(!A||A.caId)continue;const k=`${p.id}|${l}|${sh.pc.key}`;
    const was=ARM_SEEN[k];ARM_SEEN[k]=sh.cur;if(was>0&&sh.cur<=0&&!(typeof reduceMotion==='function'&&reduceMotion()))ARM_FALL.push({k,pid:p.id,l,key:sh.pc.key,t0:now});
    if(sh.cur<=0)continue;const B=armBox(sh.pc.key,l);if(B)items.push({z:armZ(sh.pc.key),svg:armPieceSVG(B,sh.pc.key,sh.ratio,null,p.id+l)})}}
  for(let i=ARM_FALL.length-1;i>=0;i--){const F=ARM_FALL[i];const age=now-F.t0;if(age>1000){ARM_FALL.splice(i,1);continue}if(F.pid!==p.id)continue;const B=armBox(F.key,F.l);
    if(B)items.push({z:9,svg:armPieceSVG(B,F.key,0.6,{uid:1,cls:'armfall',style:`animation-delay:-${Math.round(age)}ms;transform-origin:${B.cx}px ${B.cy}px;transform-box:view-box`},p.id+F.l)})}
  return items.sort((a,b)=>a.z-b.z).map(x=>x.svg).join('')}
{const base=avatarSVG;avatarSVG=function(p){let s=base.apply(this,arguments);try{if(!p||!p.pieces)return s;const worn=armWornSVG(p);
  /* the steel sheen per location goes; the printed pieces show the armor instead (wounds still tint the body underneath) */
  s=s.replace(/<path d="[^"]*" fill="url\(#met[^"]*\)"[^>]*\/>/g,'');
  const i=s.search(/<circle cx="[\d.]+" cy="[\d.]+" r="9"/);s=i>=0?s.slice(0,i)+worn+s.slice(i):s.replace('</svg>',worn+'</svg>')}catch(e){console.error(e)}return s}}
(()=>{const st=document.createElement('style');st.textContent=`
.afit label{display:block;margin:4px 0}.afprev svg{width:100%;height:auto}
.armfall{animation:armfall .9s ease-in forwards}
@keyframes armfall{0%{opacity:.9}100%{opacity:0;transform:translate(6px,46px) rotate(28deg)}}`;document.head.appendChild(st)})();
/* the Fit mode (Armor forge, editors only): one printed piece on a large avatar, both sides, with sliders; saved per browser,
   Export prints the JSON to paste into ARM_FIT */
const AFIT={key:'galea'};
function afitPlayer(key){const A=ARM[key];const p={id:'afit',name:'fit',hp:{},ap:{},pieces:{}};for(const l of LOCS){p.hp[l]=5;p.ap[l]=0;p.pieces[l]=[]}
  const locs=A.slot==='head'?['head']:A.slot==='chest'?['chest']:A.slot==='arm'?['rarm','larm']:['rleg','lleg'];for(const l of locs){p.pieces[l].push({key,n:A.n,ap:A.ap});p.ap[l]=A.ap}return p}
function afitHTML(){if(typeof DEV_KEY!=='function'||!DEV_KEY())return '';const keys=Object.keys(ARM).filter(k=>!ARM[k].custom&&ARM_FIT[k]);const f=armFit(AFIT.key)||{};
  const sl=(k,l,min,max)=>`<label class="rc-sub">${l} <b>${f[k]||0}</b><input type="range" min="${min}" max="${max}" step="1" value="${f[k]||0}" data-afit="${k}" style="width:100%"></label>`;
  return `<div class="card2 afit"><h4 style="margin:0 0 6px">${_T`🎯 Fit the printed set`} <span class="rc-sub">${_T`editors · saved in this browser · Export to keep`}</span></h4>
   <div style="display:grid;grid-template-columns:220px 1fr;gap:12px;align-items:start"><div id="afPrev" class="afprev">${avatarSVG(afitPlayer(AFIT.key))}</div>
   <div><label>${_T`Piece`}<select data-afkey>${keys.map(k=>`<option value="${k}" ${k===AFIT.key?'selected':''}>${esc(ARM[k].n)} · ${ARM[k].slot}${ARM_FIT_OVR[k]?' ✎':''}</option>`).join('')}</select></label>
    ${sl('dx',_T('Across'),-30,30)}${sl('dy','Up / down',-40,40)}${sl('w',_T('Width'),10,110)}${sl('r',_T('Turn'),-45,45)}
    <div class="acts"><button class="btn tksm" type="button" data-afact="prev">◀</button><button class="btn tksm" type="button" data-afact="next">▶</button><button class="btn tksm" type="button" data-afact="reset">${_T`↺ Default`}</button><button class="btn tksm" type="button" data-afact="export">${_T`⇪ Export all`}</button></div>
    <textarea id="afOut" class="tin" rows="3" style="width:100%;margin-top:6px;font:11px var(--mono)" hidden readonly></textarea></div></div></div>`}
function afitRefresh(full){const box=document.querySelector('.afit');if(!box)return;if(full){box.outerHTML=afitHTML();return}const pv=document.getElementById('afPrev');if(pv)pv.innerHTML=avatarSVG(afitPlayer(AFIT.key));
  box.querySelectorAll('[data-afit]').forEach(i=>{const b=i.parentElement.querySelector('b');if(b)b.textContent=i.value})}
function afitSave(){try{localStorage.setItem('flavius_armfit',JSON.stringify(ARM_FIT_OVR))}catch(e){}}
{const base=gearAHTML;gearAHTML=function(){return base.apply(this,arguments)+afitHTML()}}
document.addEventListener('input',e=>{const i=e.target.closest('[data-afit]');if(!i)return;const k=AFIT.key;ARM_FIT_OVR[k]={...(ARM_FIT_OVR[k]||{}),[i.dataset.afit]:+i.value};afitSave();afitRefresh()});
document.addEventListener('change',e=>{const s=e.target.closest('[data-afkey]');if(!s)return;AFIT.key=s.value;afitRefresh(true)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-afact]');if(!b)return;const keys=Object.keys(ARM).filter(k=>!ARM[k].custom&&ARM_FIT[k]);const i=keys.indexOf(AFIT.key);const a=b.dataset.afact;
  if(a==='prev'||a==='next'){AFIT.key=keys[(i+(a==='next'?1:keys.length-1))%keys.length];afitRefresh(true);return}
  if(a==='reset'){delete ARM_FIT_OVR[AFIT.key];afitSave();afitRefresh(true);return}
  if(a==='export'){const out={};for(const k of keys)out[k]=armFit(k);const t=document.getElementById('afOut');t.hidden=false;t.value=JSON.stringify(out);t.select();try{navigator.clipboard.writeText(t.value)}catch(err){}if(typeof mToast==='function')mToast(_T('Fit copied — send it to Claude'))}});
/* custom forge pieces: an equip point on the body (shoulder / forearm / hand for arms, thigh / shin for legs, head, chest, belt).
   Picking one snaps the piece's fit to that point (left side mirrors it, as before); the forge's drag still fine-tunes. */
const CA_EQ={head:[['head',_T('Head')]],chest:[['chest',_T('Chest')],['belt',_T('Belt')]],arm:[['sho',_T('Shoulder')],['fore',_T('Forearm')],['hand',_T('Hand')]],leg:[['thigh',_T('Thigh')],['shin',_T('Shin')]]};
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{const d=ST.ca||{};const L=CA_EQ[d.slot]||[];if(!L.length)return h;
  const cur=d.eq&&L.some(x=>x[0]===d.eq)?d.eq:L[0][0];
  h=h.replace(new RegExp('(<label>'+RXL('Body location')+'<select data-caf="slot">[\\s\\S]*?<\\/select><\\/label>)'),`$1<label>${_T`Equip point`}<select data-caeq>${L.map(([k,l])=>`<option value="${k}" ${k===cur?'selected':''}>${l}</option>`).join('')}</select></label>`)}catch(e){}return h}}
document.addEventListener('change',e=>{const s=e.target.closest('[data-caeq]');if(!s||!ST.ca)return;const d=ST.ca;d.eq=s.value;const p=EQ[d.eq];const F=caFit(d);
  d.fit={slot:d.slot,x:p[0],y:p[1],s:F.s};const t=document.querySelector(`[data-gs="caview"][data-id="${ST.caAvatar?'avatar':'piece'}"]`);if(t)setTimeout(()=>t.click(),0)},true);
