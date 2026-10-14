/* 228-v95studio — v0.95 part B: CREATOR STUDIO + PLAY NOW (his notes 2026-10-07; numbering = his list)
   1  · Roster sets → "Find a creation": the box (#rs95q, max 340 px, 32 characters) filters IN PLACE — the Studio is no longer redrawn on
        every key (the old 250 ms full redraw + refocus is retired) and the query is cleared when the Studio opens. The system set
        "All my creations" gets the box too (characters on the rolls are listed there and found by it).
   2  · Character designer: the class card preview (name, portrait, colour) follows every field live.
   3  · Class designer: legs laid out like the arms (one card, Upper | Lower boxes); the Leather Tasset sits in Legs · Upper (pair);
        the "padded upper leg" tick is gone (an old one is turned into the Tasset); no red flash on the preview avatar (#studio .avhit off).
   4  · Armor fit tool: Both sides | Right | Left (each side independent, Both turns/moves both), Mirror the art per side (armBox reads
        the side's own flip), "Save" in fit mode saves the fit (no "choose an equip point" error), Both is the default for limb pieces.
   5  · Beast designer: the letter on the token round sits BEHIND the art (43-beasts rtokSVG; none over a printed token).
   6  · Cohorts: the card preview is HTML (header inside the card, the real token rounds / minis, not lettered circles).
   7  · Classes: custom "Hated by the crowd" = the stone only (no +10 CF — `pelt10_95`, the printed Damnatio's alone; 05-flow + 10-meta);
        the tamed-ally picker leaves out humanoids (Tholo, Commodus, custom humanoid beasts).
   8  · Weapon designer: ≤4 card icons; "A shield?" = Absorb + optional Attack power / Range + at most one other; ticking shield drops the
        disallowed abilities from the preview AND the saved weapon (cw95Clean on tick, on Save, and in cwBuild); no 3rd extra on a plain weapon.
   9  · Sculptors: 🔒 Lock proportions; a random default colour; width/height checked (not swapped: Width = rx/w, Height = ry/h);
        every slider gets snap points (a shared <datalist> + a pointer-only snap — the keyboard keeps its steps).
   10 · Character creator: the 375-point budget (meter) + the abilities gained live in their own panel on the RIGHT.
   11 · Play Now: The Stands personality fold closes (outside click, Esc, any window opening); each seat's class picker has a
        "⭐ Your characters" tab (the roster set's characters; click seats them as You or CPU) + "🎲 Fill CPU seats with my characters".
   UI randomness here is Math.random only. Test tv95b. */
function h95dom(h,fn){const T=document.createElement('template');T.innerHTML=h;fn(T.content);return T.innerHTML}
function shuffle95(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* ---------------- 1 · roster sets: Find a creation ---------------- */
{const base=rosterStudioHTML;rosterStudioHTML=function(){let h=base.apply(this,arguments);try{
  h=h.replace('id="rs77q"','id="rs95q" maxlength="32" autocomplete="off"');
  const sys=typeof ROSTER_SYS!=='undefined'&&ROSTER_SYS.some(r=>r.id===ST.rs77&&r.id!=='classic');
  if(sys&&!h.includes('id="rs95q"'))h=h.replace(/(<p class="rs77note">(?:(?!<\/p>)[\s\S])*<\/p>)/,`$1<input class="tin rs77q" id="rs95q" maxlength="32" autocomplete="off" placeholder="${_T`🔍 Find a creation…`}" value="${esc(ST.rs77q||'')}">`);
  if(ST.rs77q&&!/class="rs77t[ "]/.test(h))h=h.replace(/(<input class="tin rs77q" id="rs95q"[^>]*>)/,`$1<p class="rc-sub rs95none">${_T`No creation matches that.`}</p>`)}catch(e){console.error(e)}return h}}
function rs95Fill(){const inp=document.getElementById('rs95q');const live=inp&&inp.parentElement;if(!live)return;
  const T=document.createElement('template');T.innerHTML=rosterStudioHTML();const ni=T.content.querySelector('#rs95q');if(!ni)return;
  while(inp.nextSibling)inp.nextSibling.remove();let n=ni.nextSibling;while(n){live.appendChild(n.cloneNode(true));n=n.nextSibling}}
document.addEventListener('input',e=>{const t=e.target;if(!t||t.id!=='rs95q'||typeof ST==='undefined')return;ST.rs77q=t.value;clearTimeout(t._rs95);
  t._rs95=setTimeout(()=>{try{rs95Fill()}catch(err){console.error(err)}},120)});
if(typeof BUS!=='undefined')BUS.on('window.open',p=>{try{if(p&&p.main==='openStudio'&&typeof ST!=='undefined')ST.rs77q=''}catch(e){}});

/* ---------------- 2 · the character card follows the fields ---------------- */
const CH95={raf:0};
function ch95Card(){try{const c=typeof ST!=='undefined'&&ST.tab==='chars'&&ST.draft;if(!c)return;const ref=c.classRef||'cls:soldier';if(ref.startsWith('cls:'))return;
  const el=document.querySelector('#studio .clspick .clscard');if(!el)return;const T=document.createElement('template');T.innerHTML=String(classCardHTML(ref,'md',c)).trim();const n=T.content.firstElementChild;if(n)el.replaceWith(n)}catch(e){console.error(e)}}
for(const ev of ['input','change'])document.addEventListener(ev,e=>{const t=e.target;if(!t||!t.closest||!t.closest('#studio')||typeof ST==='undefined'||ST.tab!=='chars'||!ST.draft)return;
  if(!(t.dataset&&t.dataset.f))return;cancelAnimationFrame(CH95.raf);CH95.raf=requestAnimationFrame(ch95Card)});

/* ---------------- 10 · the ratings budget on the right ---------------- */
function st95Chips(st){const perks=typeof statPerks==='function'?statPerks(st):[];const mind=bandInt(st.int)==='hard'?_T('Hard'):bandInt(st.int)==='normal'?_T('Normal'):_T('Easy');
  return (perks.length?perks.map(p=>`<span class="st95chip">${esc(p)}</span>`).join(''):`<span class="rc-sub">${_T`no perks yet`}</span>`)+`<span class="st95chip mind">${_T`CPU plays ${mind}`}</span>`}
function st95Panel(c,blk){const st=draftStats(c);const sum=statSum(st);const bud=c.sandbox?0:STAT_BUDGET;const pct=bud?Math.min(100,sum/bud*100):100;const over=bud&&sum>bud;
  const body=blk.replace(/<h4>[\s\S]*?<\/h4>\s*<div class="statbudget[^"]*" id="stStatSum">[\s\S]*?<\/span><\/div>/,'');
  return `<aside class="st95stats" id="st95stats"><div class="st95hd">${_T`📊 Ratings`}</div>
    <div class="st95meter"><div class="st95num" id="st95num"><b>${sum}</b> / ${bud||'—'} ${_T`points used`}</div><div class="st95bar${over?' over':''}" id="st95bar"><i style="width:${pct}%"></i></div>${c.sandbox?`<div class="rc-sub">${_T`sandbox: no pool`}</div>`:`<div class="rc-sub">${_T`The five ratings share a pool of ${STAT_BUDGET}.`}</div>`}</div>
    ${body}<div class="st95gain"><div class="st95gh">${_T`✨ Abilities gained`}</div><div class="st95gl" id="st95gl">${st95Chips(st)}</div></div></aside>`}
{const base=charEditorHTML;charEditorHTML=function(){let h=base.apply(this,arguments);try{const c=ST.draft;if(!c||typeof h!=='string'||typeof statSlidersHTML!=='function')return h;
  const blk=statSlidersHTML(c);const i=h.indexOf(blk);if(i<0)return h;h=h.slice(0,i)+h.slice(i+blk.length);const panel=st95Panel(c,blk);
  h=h95dom(h,f=>{const g=f.querySelector('.setup-grid');if(!g)return;g.classList.add('st95c3');g.removeAttribute('style');const T=document.createElement('template');T.innerHTML=panel;g.appendChild(T.content)})}catch(e){console.error(e)}return h}}
function st95Live(){try{const c=typeof ST!=='undefined'&&ST.draft;if(!c||!document.getElementById('st95stats'))return;const st=draftStats(c);const sum=statSum(st);const bud=c.sandbox?0:STAT_BUDGET;
  const num=document.getElementById('st95num');if(num)num.innerHTML=`<b>${sum}</b> / ${bud||'—'} ${_T`points used`}`;
  const bar=document.getElementById('st95bar');if(bar){bar.classList.toggle('over',!!bud&&sum>bud);bar.firstElementChild.style.width=(bud?Math.min(100,sum/bud*100):100)+'%'}
  const gl=document.getElementById('st95gl');if(gl)gl.innerHTML=st95Chips(st)}catch(e){console.error(e)}}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.stat!=null)st95Live()});

/* ---------------- 3 · the class designer: legs like arms, the Leather Tasset, no padded upper leg ---------------- */
{const base=classStudioHTML;classStudioHTML=function(){const k0=ST.draft;try{if(k0&&k0.arm&&k0.arm.legUp&&!k0.arm.legU){k0.arm.legU='legwrapsU';k0.arm.legUp=false}}catch(e){}
  let h=base.apply(this,arguments);try{const k=ST.draft;const A=k&&k.arm;if(!A)return h;
    h=h95dom(h,f=>{const s=f.querySelector('select[data-f="arm.legU"]');const old=s&&s.closest('.formgrid');if(!old)return;
      const T=document.createElement('template');
      T.innerHTML=`<div class="formgrid" style="margin-top:8px"><div class="card2" style="grid-column:span 2"><div class="sect" style="margin-top:0">${_T`Legs`}</div><div class="formgrid" style="grid-template-columns:1fr 1fr">
        <label>${_T`Legs · Upper (pair)${fSel('arm.legU',armorOpts(a=>a.slot==='leg'&&a.pt==='upper'),A.legU)}`}</label><label>${_T`Legs · Lower (pair)${fSel('arm.legL',armorOpts(a=>a.slot==='leg'&&a.pt==='lower'&&!a.stack),A.legL)}`}</label></div>
        <div class="chkgrid" style="margin-top:6px">${fChk('arm.legLp',A.legLp,_T('Padded wraps'))}</div></div></div>`;
      old.replaceWith(T.content)})}catch(e){console.error(e)}return h}}
/* the preview avatars in the designers never flash red */
{const base=avatarFor73;avatarFor73=function(list,id){try{const p=(id||'rec')+'|';for(const k of Object.keys(AVHIT))if(k.startsWith(p))delete AVHIT[k]}catch(e){}return base.apply(this,arguments)}}

/* ---------------- 4 · the armor fit tool: Both | Right | Left, Mirror per side, Save ---------------- */
{const base=afitF;afitF=function(k,side){return base.call(this,k,side==='B'?'R':side)}}
{const base=afitSet;afitSet=function(k,side,patch){if(side==='B'){base.call(this,k,'R',patch);base.call(this,k,'L',patch);return}return base.apply(this,arguments)}}
afitAvatar=function(k){const A=ARM[k];const p={id:'afit',name:'fit',hp:{},ap:{},pieces:{}};for(const l of LOCS){p.hp[l]=5;p.ap[l]=0;p.pieces[l]=[]}
  const both=A.slot==='arm'||A.slot==='leg';const R=A.slot==='arm'?'rarm':'rleg',Lf=A.slot==='arm'?'larm':'lleg';
  const locs=!both?[A.slot]:(A.pair||AFIT.side==='B')?[R,Lf]:[AFIT.side==='L'?Lf:R];for(const l of locs){p.pieces[l].push({key:k,n:A.n,ap:A.ap});p.ap[l]=A.ap}
  return avatarSVG(p).replace(/<circle cx="[\d.]+" cy="[\d.]+" r="(?:9|7)"[^>]*\/><text[^>]*>[^<]*<\/text>/g,'').replace(/<text[^>]*>(?:R|L|fist|[^<]*)<\/text>/g,'').replace('viewBox="0 0 150 332"',`viewBox="${AV_VB.join(' ')}"`)}
/* each side reads its own flip (the left falls back to the right's until it has one) */
{const base=armBox;armBox=function(key,l){const b=base.apply(this,arguments);try{const A=ARM[key];if(b&&A&&!ARM_PAIR[A.img]){const f=armFit(key);const L=armSide(l)==='L';const F=L&&f&&f.L?{...f,...f.L}:f;b.mirror=L!==(!!ARM_LEFTART[key]!==!!F.flip)}}catch(e){}return b}}
function afit95Flip(k,side,on){const v=on?1:0;const o=ARM_FIT_OVR[k]=ARM_FIT_OVR[k]||{};
  if(side==='R'){if(o.L&&o.L.flip===undefined)o.L.flip=(armFit(k)||{}).flip?1:0;o.flip=v}
  else if(side==='L')afitSet(k,'L',{flip:v});
  else{o.flip=v;afitSet(k,'L',{flip:v})}}
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{if(AFIT.mode&&typeof afitOn==='function'&&afitOn()){
  h=h95dom(h,f=>{const box=f.querySelector('.afit');if(!box)return;const A=ARM[AFIT.key];const limb=A&&(A.slot==='arm'||A.slot==='leg');
    if(limb){const seg=box.querySelector('.seg');if(seg){seg.innerHTML=[['B',_T('Both sides')],['R',_T('Right side')],['L',_T('Left side')]].map(([s,l])=>`<button type="button" data-afside="${s}" class="${AFIT.side===s?'on':''}">${l}</button>`).join('');
      const p=seg.nextElementSibling;if(p&&p.tagName==='P')p.textContent=AFIT.side==='B'?_T('Moves, scales and turns both sides together.'):AFIT.side==='L'?_T('Only the left side moves — it keeps its own fit.'):_T('Only the right side moves — the left keeps its own fit.')}}
    if(!box.querySelector('[data-afflip]')){const fl=afitF(AFIT.key,AFIT.side).flip;const T=document.createElement('template');T.innerHTML=`<label class="rc-sub" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-afflip ${fl?'checked':''}> ${_T`Mirror the art`}</label>`;const acts=box.querySelector('.acts');if(acts)acts.before(T.content)}
    const sv=f.querySelector('[data-gs="asave"]');if(sv)sv.textContent=_T('💾 Save this fit')})}}catch(e){console.error(e)}return h}}
window.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||typeof AFIT==='undefined')return;
  if(AFIT.mode&&t.closest('[data-gs="asave"]')){e.preventDefault();e.stopImmediatePropagation();afitSave();if(typeof mToast==='function')mToast(_T('🎯 Fit saved — it applies for everyone.'));return}
  if(AFIT.side==='B'&&t.closest('[data-afact2="reset"]')){e.stopImmediatePropagation();delete ARM_FIT_OVR[AFIT.key];afitSave();afitRefresh(true)}},true);
window.addEventListener('change',e=>{const c=e.target.closest&&e.target.closest('[data-afflip]');if(!c||typeof AFIT==='undefined')return;e.stopImmediatePropagation();afit95Flip(AFIT.key,AFIT.side,c.checked);afitSave();afitRefresh()},true);
document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-afit3]')))return;setTimeout(afit95Default,0)});
document.addEventListener('change',e=>{if(e.target.closest&&e.target.closest('[data-afkey]'))setTimeout(afit95Default,30)});
function afit95Default(){try{const A=ARM[AFIT.key];if(AFIT.mode&&A&&(A.slot==='arm'||A.slot==='leg')&&AFIT.side==='R'){AFIT.side='B';afitRefresh(true)}}catch(e){console.error(e)}}

/* ---------------- 7 · custom "Hated by the crowd" = the stone only; no humanoid tamed allies ---------------- */
function pelt10_95(p){if(!p)return false;if(p.cls==='damnatio')return true;const C=typeof CLASSES!=='undefined'?CLASSES[p.cls]:null;return !!(C&&C.clsRef==='cls:damnatio')}
if(typeof WEAKNESSES!=='undefined'&&WEAKNESSES.pelted)WEAKNESSES.pelted[1]=_T('Pelted with a stone (1 damage) every Resolve phase.');
function hum95ally(k){if(k==='tholo'||k==='commodus')return true;if(!String(k).startsWith('cn_'))return false;const c=(CUSTOM.npcs||[]).find(x=>'cn_'+x.id===k);if(!c)return false;
  try{const t=tokenOfNpc(c);if(t&&(t.kind==='human'||t.body==='biped'))return true}catch(e){}return /\b(human|humanoid|man|woman|gladiator|soldier|centurion|barbarian|giant|titan|ogre|cyclops|brute)\b/i.test(String(c.kind||''))}
{const base=allyOpts;allyOpts=function(){return base.apply(this,arguments).filter(([k])=>!hum95ally(k))}}

/* ---------------- 8 · the weapon designer: ≤4 card icons, the shield rules ---------------- */
const CW95_X=['thrN','ammo','atkUses','soul','cfw','both'];
const cw95Extras=st=>CW95_X.filter(k=>st[k]);
const cw95Cap=st=>st.shield?1:2;
function cw95Off(st,k){st[k]=0;if(k==='thrN'){st.thrP=0;st.thrR=0}if(k==='ammo')st.stones=0}
function cw95Clean(st){if(!st)return st;const ex=cw95Extras(st);for(const k of ex.slice(cw95Cap(st)))cw95Off(st,k);
  if(st.shield){if(!st.shP)st.shR=0}else{delete st.shP;delete st.shR}return st}
{const base=cwScore;cwScore=function(st){let s=base.apply(this,arguments);if(st&&st.shield&&st.shP){s+=st.shP*0.8+(st.shR?0.3*st.shR:0)}return s}}
{const base=cwBuild;cwBuild=function(cw){let w=base.apply(this,arguments);try{const st=cw&&cw.stats;if(st&&st.shield){const c=cw95Clean({...st});w=base.call(this,{...cw,stats:c});w.p=c.shP||0;w.r=c.shP?(c.shR||1):0}}catch(e){console.error(e)}return w}}
{const base=gearStudioInput;gearStudioInput=function(input){
  try{const d=ST.cw;if(d&&d.stats&&input&&input.dataset){const st=d.stats;const t=input.dataset.cwt,f=input.dataset.cwf;const pv=()=>{const e=document.getElementById('cwPrev');if(e)e.innerHTML=cwCardSVG(d)};
    if(t==='shP'){st.shP=input.checked?(st.shP||1):0;if(!st.shP)st.shR=0;pv();return 'redraw'}
    if(t==='shR'){if(!st.shP){input.checked=false;return false}st.shR=input.checked?(st.shR||1):0;pv();return 'redraw'}
    const key=({thr:'thrN',ammo:'ammo',use:'atkUses'})[t]||({'s.soul':'soul','s.cfw':'cfw','s.both':'both'})[f];
    if(key&&input.checked&&cw95Extras(st).filter(k=>k!==key).length>=cw95Cap(st)){input.checked=false;if(typeof mToast==='function')mToast(st.shield?_T('A shield holds Absorb, optional Attack power and Range, and one other ability.'):_T('A weapon card holds 4 icons — untick one first.'));return false}}}catch(e){console.error(e)}
  const r=base.apply(this,arguments);
  try{const d=ST.cw;if(d&&d.stats&&input&&input.dataset&&input.dataset.cwf==='s.shield'){cw95Clean(d.stats);const e=document.getElementById('cwPrev');if(e)e.innerHTML=cwCardSVG(d)}}catch(e){console.error(e)}
  return r}}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-gs="wsave"]');if(b&&typeof ST!=='undefined'&&ST.cw&&ST.cw.stats)cw95Clean(ST.cw.stats)},true);
{const base=gearWHTML;gearWHTML=function(){let h=base.apply(this,arguments);try{const st=ST.cw&&ST.cw.stats;if(!st)return h;const ex=cw95Extras(st);const n=(st.shield?1+(st.shP?1:0)+(st.shP&&st.shR?1:0):2)+ex.length;
  const note=`<div class="cw95cap" style="grid-column:1/-1"><b>${n}</b> / 4 ${_T`card icons`} <span class="rc-sub">${st.shield?_T('a shield: Absorb, then Attack power and Range if you like, plus one other ability'):_T('Attack power and Range, plus up to two other abilities')}</span></div>`;
  h=h.replace('<div class="icogrid"',note+'<div class="icogrid"'); // i18n:skip
  if(ex.length>=cw95Cap(st))for(const a of ['data-cwt="thr"','data-cwt="ammo"','data-cwt="use"','data-cwf="s.soul"','data-cwf="s.cfw"','data-cwf="s.both"'])h=h.replace(a+' >',a+` disabled title="${_T`The card is full — untick another ability first.`}" >`)}catch(e){console.error(e)}return h}} // i18n:skip

/* ---------------- 9 · sculptors: random colours, lock proportions, slider snap points ---------------- */
const SCB_PAL95=['#e6b93a','#c0433a','#4f7fc4','#4f9a57','#e8e0cc','#8a5cc0','#dc7a34','#5fc7c0','#e07b9a'];
function scbPickColor95(Ls){const last=Ls&&Ls.length?Ls[Ls.length-1].c:null;const pool=SCB_PAL95.filter(c=>c!==last);return pool[Math.floor(Math.random()*pool.length)]}
{const base=scbBenchHTML;scbBenchHTML=function(kind){let h=base.apply(this,arguments);try{const D=SCB_KIND[kind];const o=D&&D.obj();const L=o&&(o.layers||[])[scbSelGet(kind)];if(!L)return h;
  const lock=`<label class="scblkp" style="grid-column:1/-1;display:flex;gap:6px;align-items:center"><input type="checkbox" data-scb95="lkp" data-k="${kind}" ${L.lkp?'checked':''}> ${_T`🔒 Lock proportions`} <span class="rc-sub">${_T`width and height change together`}</span></label>`;
  h=h.replace(/<label>(?:(?!<label>)[\s\S])*?data-scbl="r"/,m=>lock+m)}catch(e){console.error(e)}return h}}
window.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-scb95="lkp"]');if(!t)return;const k=t.dataset.k;const D=SCB_KIND[k];const o=D&&D.obj();const L=o&&(o.layers||[])[scbSelGet(k)];if(!L)return;
  if(t.checked){L.lkp=1;L.pr=(L.w||12)/(L.h||12)}else{delete L.lkp;delete L.pr}},true);
{const base=scbInput;scbInput=function(input){let lk=null;try{const k=input.dataset.k;const D=SCB_KIND[k];const o=D&&D.obj();const L=o&&(o.layers||[])[scbSelGet(k)];const f=input.dataset.scbl;
    if(L&&L.lkp&&(f==='w'||f==='h')){const pr=L.pr||((L.w||12)/(L.h||12));let v=+input.value;let w=f==='w'?v:Math.round(v*pr),h2=f==='h'?v:Math.round(v/pr);
      if(w>70||h2>70){const s=70/Math.max(w,h2);w=Math.round(w*s);h2=Math.round(h2*s)}if(w<2||h2<2){const s=2/Math.min(w,h2);w=Math.round(w*s);h2=Math.round(h2*s)}
      input.value=f==='w'?w:h2;lk={k,L,f,other:f==='w'?h2:w}}}catch(e){console.error(e)}
  const r=base.apply(this,arguments);
  try{if(lk){const of=lk.f==='w'?'h':'w';lk.L[of]=lk.other;const s=document.querySelector(`input[data-scbl="${of}"][data-k="${lk.k}"]`);if(s){s.value=lk.other;if(s.nextElementSibling&&s.nextElementSibling.tagName==='OUTPUT')s.nextElementSibling.textContent=lk.other}
    SCB_KIND[lk.k].refresh();if(lk.k==='w'||lk.k==='a'){try{bumpGearPreview(lk.k)}catch(e){}}}}catch(e){console.error(e)}
  return r}}
/* every range slider: a few ticks on the line (shared <datalist>s) and a snap to them while dragging with the pointer; arrow keys keep their steps */
const SNAP95={ptr:null,seq:0,lists:{}};
function snap95Ticks(t){const min=+t.min||0,max=t.max===''?100:+t.max;const step=+t.step>0?+t.step:Math.max(1e-9,(max-min)/100);const n=(max-min)/step;let T=[];
  if(n<=10){for(let i=0;i<=n;i++)T.push(min+i*step)}else{for(const q of [0,.25,.5,.75,1])T.push(Math.round((min+(max-min)*q)/step)*step);if(min<0&&max>0)T.push(0)}
  return [...new Set(T.map(x=>+x.toFixed(4)))].sort((a,b)=>a-b)}
function snap95Up(t){if(!t||t.getAttribute('list')||t.hasAttribute('data-nosnap'))return;try{const T=snap95Ticks(t);const key=T.join('_');let id=SNAP95.lists[key];
  if(!id){id='snp95_'+(++SNAP95.seq);SNAP95.lists[key]=id;let box=document.getElementById('snap95');if(!box){box=document.createElement('div');box.id='snap95';box.hidden=true;document.body.appendChild(box)}
    const dl=document.createElement('datalist');dl.id=id;dl.innerHTML=T.map(x=>`<option value="${x}"></option>`).join('');box.appendChild(dl)}
  t.setAttribute('list',id)}catch(e){}}
function snap95Sweep(root){try{(root||document).querySelectorAll('input[type=range]:not([list])').forEach(snap95Up)}catch(e){}}
document.addEventListener('pointerdown',e=>{const t=e.target;if(t&&t.matches&&t.matches('input[type=range]'))SNAP95.ptr=t},true);
for(const ev of ['pointerup','pointercancel'])window.addEventListener(ev,()=>{SNAP95.ptr=null},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||t!==SNAP95.ptr)return;try{const v=+t.value,min=+t.min||0,max=t.max===''?100:+t.max;const step=+t.step>0?+t.step:Math.max(1e-9,(max-min)/100);
  let best=null,bd=1e18;for(const x of snap95Ticks(t)){const d=Math.abs(x-v);if(d<bd){bd=d;best=x}}if(best!==null&&best!==v&&bd<=Math.max(step,(max-min)*0.025)+1e-9)t.value=best}catch(err){}},true);
if(typeof MutationObserver!=='undefined'&&!HEADLESS){const go=()=>{const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;
    if(n.matches&&n.matches('input[type=range]'))snap95Up(n);else if(n.querySelector&&n.querySelector('input[type=range]:not([list])'))snap95Sweep(n)}});mo.observe(document.body,{childList:true,subtree:true});snap95Sweep()};
  if(document.body)go();else document.addEventListener('DOMContentLoaded',go)}

/* ---------------- 6 · cohorts: an HTML card with the real tokens ---------------- */
function pc95CardHTML(P){const T=PAIR_TYPES[P.type]||PAIR_TYPES.duo;const M=(P.members||[]).filter(Boolean).map(r=>[r,pmParse(r)]).filter(x=>x[1]);const beast=M.some(x=>x[1].beast),chr=M.some(x=>x[1].char);
  return `<div class="pc95" role="img" aria-label="${esc(P.name||_T('Cohort'))}"><div class="pc95h">${_T`🤝 COHORT`} · ${esc(String(T[0]).toUpperCase())}</div><div class="pc95n">${esc(P.name||_T('A new cohort'))}</div>${P.type==='duo'&&P.rel?`<div class="pc95r">${esc(P.rel)}</div>`:''}
    <div class="pc95m">${M.length?M.map(([r,m])=>`<span class="pc95t">${pmTok(r,46)}<small>${esc(m.name)}</small></span>`).join(''):`<span class="rc-sub">${_T`Pick the members.`}</span>`}</div>
    <div class="pc95f">${beast?_T('When drawn, the beasts burst onto the sand.'):_T('When drawn, the crowd hears their story.')}<br>${chr&&beast?_T('Their keeper, if on the sand, commands them.'):_T('+2 CF to whoever draws it.')}</div></div>`}
{const base=cohortStudioHTML;cohortStudioHTML=function(){let h=base.apply(this,arguments);try{const P=ST.pxd;if(!P)return h;
  h=h95dom(h,f=>{const img=[...f.querySelectorAll('img')].find(x=>/width:170px/.test(x.getAttribute('style')||''));if(!img)return;const par=img.parentElement;const T=document.createElement('template');T.innerHTML=pc95CardHTML(P);img.replaceWith(T.content);const r=par&&par.querySelector('.pxrow');if(r)r.remove()})}catch(e){console.error(e)}return h}}

/* ---------------- 11 · Play Now: the Stands fold, Your characters ---------------- */
function pers95Close(){const d=document.querySelector('#mBody .stands92 details.st92pers[open]');if(d){d.open=false}if(typeof CFG!=='undefined')CFG.pers92=false}
document.addEventListener('click',e=>{const d=document.querySelector('#mBody .stands92 details.st92pers[open]');if(d&&!d.contains(e.target))pers95Close()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#mBody .stands92 details.st92pers[open]')){e.stopPropagation();pers95Close()}},true);
if(typeof BUS!=='undefined')BUS.on('window.open',()=>{try{if(typeof CFG!=='undefined')CFG.pers92=false}catch(e){}});
const PK95={tab:'cls',as:'0'};
const chars95=()=>(typeof CUSTOM!=='undefined'?CUSTOM.chars||[]:[]).filter(typeof onRollsR==='function'?onRollsR:onRolls).filter(c=>CLASSES['cc_'+c.id]);
{const base=pick76HTML;pick76HTML=function(i){let h=base.apply(this,arguments);try{const sel=document.getElementById('cls'+i);const cur=sel?sel.value:'';const s=CFG.seats[i]||{};
  PK95.as=s.cpu?'1':'0';PK95.tab=String(cur).startsWith('cc_')?'chars':'cls';const list=chars95();const have=new Set(sel?[...sel.options].map(o=>o.value):[]);
  h=h95dom(h,f=>{const hd=f.querySelector('.pk76hd');const grid=f.querySelector('.pk76grid');if(!hd||!grid)return;const x=hd.querySelector('[data-pk76x]');
    const T=document.createElement('template');
    T.innerHTML=`<span class="seg pk95tabs"><button type="button" data-pk95tab="cls" class="${PK95.tab==='cls'?'on':''}">${_T`Classes`}</button><button type="button" data-pk95tab="chars" class="${PK95.tab==='chars'?'on':''}">${_T`⭐ Your characters`} · ${list.length}</button></span>`;
    if(x)x.before(T.content);else hd.appendChild(T.content);
    grid.dataset.pk95pane='cls';grid.hidden=PK95.tab!=='cls';
    const pane=document.createElement('div');pane.className='pk95chars';pane.dataset.pk95pane='chars';pane.hidden=PK95.tab!=='chars';
    pane.innerHTML=`<div class="pk95as"><span class="rc-sub">${_T`Seat them as`}</span><span class="seg"><button type="button" data-pk95as="0" class="${PK95.as==='0'?'on':''}">${_T`You`}</button><button type="button" data-pk95as="1" class="${PK95.as==='1'?'on':''}">CPU</button></span></div>
      ${list.length?`<div class="pk76grid">${list.map(c=>{const k='cc_'+c.id;const ok=have.has(k);const C=CLASSES[k]||{};return `<button type="button" class="pk76c pk95c ${k===cur?'on':''}" ${ok?'':'disabled'} data-pk95="${i}:${esc(k)}" title="${ok?'':esc(_T('Not in this event.'))}" style="--pc:${esc(c.color||'#888')}">${portraitHTML(c,'sm')}<b>${esc(c.name)}</b><small>${esc((CLASSES[c.classRef&&c.classRef.startsWith('cls:')?c.classRef.slice(4):'']||{}).name||C.sub||'')}</small></button>`}).join('')}</div>`
        :`<p class="rc-sub">${_T`No characters of yours are on the rolls under this roster set. Make one in the Creator Studio and add it to the rolls.`}</p>`}`;
    grid.after(pane)})}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  const tb=t.closest('[data-pk95tab]');if(tb){const w=tb.closest('.pk76');if(!w)return;PK95.tab=tb.dataset.pk95tab;w.querySelectorAll('[data-pk95tab]').forEach(b=>b.classList.toggle('on',b===tb));w.querySelectorAll('[data-pk95pane]').forEach(p=>{p.hidden=p.dataset.pk95pane!==PK95.tab});return}
  const ab=t.closest('[data-pk95as]');if(ab){PK95.as=ab.dataset.pk95as;ab.parentElement.querySelectorAll('[data-pk95as]').forEach(b=>b.classList.toggle('on',b===ab));return}
  const ck=t.closest('[data-pk95]');if(ck&&!ck.disabled){const [i,k]=ck.dataset.pk95.split(':');const ov=ck.closest('.pk76wrap');if(ov)ov.hidden=true;
    const cp=document.getElementById('cpu'+i);if(cp&&cp.value!==PK95.as){cp.value=PK95.as;fire76(cp)}
    const s=document.getElementById('cls'+i);if(s&&s.value!==k){s.value=k;fire76(s)}return}
  const fb=t.closest('[data-fill95]');if(fb){e.preventDefault();pn95Fill()}},true);
function pn95Fill(){const seats=CFG.seats.slice(0,CFG.n);const cpu=seats.map((s,i)=>s.cpu?i:-1).filter(i=>i>=0);const list=chars95();
  if(!list.length){if(typeof mToast==='function')mToast(_T('No characters of yours are on the rolls under this roster set.'));return}
  if(!cpu.length){if(typeof mToast==='function')mToast(_T('There are no CPU seats to fill.'));return}
  const humans=new Set(seats.filter(s=>!s.cpu).map(s=>s.cls));const mine=new Set(list.map(c=>'cc_'+c.id));
  const pool=shuffle95(list.map(c=>'cc_'+c.id).filter(k=>!humans.has(k)));const taken=new Set(humans);let n=0;
  for(const i of shuffle95(cpu)){const sel=document.getElementById('cls'+i);const ok=sel?new Set([...sel.options].map(o=>o.value)):null;const k=pool.find(x=>!taken.has(x)&&(!ok||ok.has(x)));
    if(!k){if(mine.has(seats[i].cls)){/* a character already there from an earlier fill stays */taken.add(seats[i].cls)}continue}
    const st=CFG.seats[i];st.cls=k;st.saved=null;st.name=typeof clsSavedName==='function'?clsSavedName(k):'';taken.add(k);n++}
  if(typeof pnRedraw75==='function')pnRedraw75();
  if(typeof mToast==='function')mToast(n?_T`🎲 ${n} CPU seat${n===1?'':'s'} filled with your characters.`:_T('Your characters are all seated already.'))}
{const base=setupBody;setupBody=function(){let h=base.apply(this,arguments);try{if(typeof h!=='string'||!h.includes('class="rs76"')||!chars95().length)return h;
  h=h95dom(h,f=>{const chip=f.querySelector('.rs76');if(!chip||f.querySelector('[data-fill95]'))return;const T=document.createElement('template');
    T.innerHTML=`<button type="button" class="btn tksm fill95" data-fill95 title="${_T`Give every CPU seat one of your characters on the rolls, at random`}">${_T`🎲 Fill CPU seats with my characters`}</button>`;chip.appendChild(T.content)})}catch(e){console.error(e)}return h}}

/* ---------------- styles ---------------- */
(()=>{const st=document.createElement('style');st.textContent=`
#rs95q.rs77q{width:100%;max-width:340px}.rs95none{margin:0 0 8px}
#studio .avhit{display:none!important}
#studio .setup-grid.st95c3{grid-template-columns:minmax(0,260px) minmax(0,1fr) minmax(0,300px)}
@media (max-width:1180px){#studio .setup-grid.st95c3{grid-template-columns:minmax(0,260px) minmax(0,1fr)}.st95stats{grid-column:1/-1;position:static!important}}
.st95stats{position:sticky;top:8px;align-self:start;display:grid;gap:8px;padding:12px;border:2px solid var(--gold);border-radius:10px;background:linear-gradient(180deg,rgba(201,164,88,.16),rgba(0,0,0,.18));box-shadow:0 6px 18px rgba(0,0,0,.4)}
.st95hd{font:400 18px var(--display);color:var(--gold2);letter-spacing:.04em}.st95num{font:14px var(--mono);color:var(--bone)}.st95num b{font-size:22px;color:var(--gold2)}
.st95bar{height:12px;border-radius:7px;background:#2a1d12;border:1px solid var(--line2);overflow:hidden;margin:4px 0}.st95bar i{display:block;height:100%;background:linear-gradient(90deg,#6f9a4a,#e6b93a);transition:width .12s}.st95bar.over i{background:var(--blood2,#c0433a)}
.st95stats .sliderow{grid-template-columns:96px 1fr 34px}.st95stats .sliderow .rc-sub{grid-column:1/-1;margin-top:-4px}
.st95gain{padding:8px 10px;border:1px dashed var(--gold);border-radius:8px;background:rgba(0,0,0,.22)}.st95gh{font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--gold2);margin-bottom:4px}
.st95gl{display:flex;flex-wrap:wrap;gap:4px}.st95chip{font-size:12.5px;padding:2px 9px;border-radius:999px;border:1px solid var(--gold);background:var(--panel2);color:var(--bone)}.st95chip.mind{border-color:var(--line2);color:var(--muted)}
.cw95cap{font:13px var(--body);color:var(--bone)}.cw95cap b{color:var(--gold2)}
.pc95{width:170px;box-sizing:border-box;margin:0 auto;padding:10px 8px 12px;text-align:center;border:2px solid var(--gold);border-radius:12px;background:linear-gradient(180deg,#2a1d12,#120b06);box-shadow:0 6px 18px rgba(0,0,0,.5)}
.pc95h{font:10.5px var(--mono);letter-spacing:.04em;color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pc95n{font:400 17px var(--display);color:var(--gold2);margin:4px 0 0;overflow-wrap:anywhere}.pc95r{font:italic 12px Georgia,serif;color:var(--bone)}
.pc95m{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:10px 0}.pc95t{display:grid;justify-items:center;gap:2px;max-width:64px}.pc95t small{font-size:10.5px;color:var(--bone);overflow-wrap:anywhere}.pc95f{font:11px Georgia,serif;color:var(--bone);line-height:1.35}
.pk76 .pk76hd{flex-wrap:wrap}.pk95tabs{flex:1 0 100%;order:5;margin:6px 0 0;display:flex}.pk95tabs button{flex:1 1 0;min-width:0;white-space:normal}.pk76hd .btn{white-space:nowrap}.pk95chars[hidden],.pk76 .pk76grid[hidden]{display:none}.pk95as{display:flex;gap:8px;align-items:center;margin:0 0 8px}.pk95c .portrait,.pk95c .pk{max-width:96px}
.fill95{margin-left:6px}`;document.head.appendChild(st)})();
