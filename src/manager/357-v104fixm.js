/* =====================================================================
   357-V104FIXM · v1.04 beta-2 fixes B26 B27 B28 B30 B33 (his Beta 2 notes 2026-10-16; answer h2a; tools/plans/v104/NOTES.md)
   Kill switch localStorage flavius_v104moff=1 (everything below back to 352 / 351 / 88 / 318 as they were). Test tools/tests/tv104j.js
   =====================================================================
   B26 · THE ROSTER LIST BOX SIZES TO ITS ROWS. REPLACES 352's `minmax(440px,min(540px,46%))` list column: from 981 px the page grid is
        `fit-content(560px) 1fr`; the list drops its inline-size container (that made its content width 0 for the grid), so the box is exactly
        as wide as the rows grid and the selected-gladiator side takes the rest — no empty strip right of the ⋯ column. The hint line, the
        "Your fighters" bar and the group headers contribute no width of their own (they span the rows). Narrow layouts keep 352's 440 px /
        container-query rules.
   B27 · THE WOOING ACTIONS DRAW ON THE RECRUITER'S HOURS (h2a; REPLACES the h1a note — the lanista's hours were removed in v0.87, 150's HRS87).
        Pitch (249 data-rec98p / the old data-mg="pitch"), private note (105 data-rec74="note:…"), gift (data-mg="gift2"), feast (data-mg="visit")
        cost WOO104 hours (1 / 1 / 2 / 4) from the Recruiter's weekly pool (w.rh98, 249's rec98Left), +W104.rec.step (351) for each further
        action on the same recruit that week — scouting actions AND wooing actions count together: the scouting buttons (rec98Can / rec98Act /
        rec98Btn / rc100ActCard) are wrapped once more here so they also rise after a woo (K.wo104 {wk, a:{pitch,note,gift,visit}} on the
        recruit's scouting record). Coin costs and the weekly limits stay. Each ACTION shows "⏳ N h" ONCE (B43, v1.05: pitch / gift / feast on their button, the private note once in the card title line, never on the tone rows); with too few hours it is
        disabled and says why (and a click that slips through is refused). Keeping him (own fighters) is untouched. The hours are paid when
        the action is really taken (recMark for pitch / feast / gift; the note when g.note74 is set).
   B28 · "NO DRILLS SET FOR THE WEEK" (88's weekChecklist, 108's before-you-leave list) is done once the Training Yard plan is LOCKED: Lock in
        all (354's P.reglk) or every fit fighter has a locked card. A plan locked with Intensity None counts as a choice. An unplanned yard
        keeps the task.
   B30 · INFIRMARY, a lost limb. Hygeia's regrowth is booked as ONE operation (g.rg102); while it is booked the patient has to stay in bed:
        "🛏 Take out" (every data-unbed76) is disabled with "Hygeia's regrowth needs him in bed until the week ends" (a click is refused
        too). Clicking the booked Hygeia plate again CANCELS the booking: hours + coin refunded, the bed free again.
   B33 · THE CONSILIUM'S LETTER ON THE PROJECTED BRACKET. The week 348's projected bracket first appears (V104A.proj, week 9): your projected seed,
        a rest week (1–4) or Round 1, the houses just above and below with the points gap, one line of advice, a button to open the bracket.
        Once a season (w.pj104 = the season), keyed letter pj104-<season>; none when the house cannot be seeded. 348's week-11 letter stays.
   No save change (new fields only: K.wo104 on a recruit's scouting record, w.pj104). Hours/coin are never created.
   ===================================================================== */
const V104M={on:(()=>{try{return localStorage.getItem('flavius_v104moff')!=='1'}catch(e){return true}})()};
function w104mLive(){try{const w=typeof W_==='function'?W_():null;return V104M.on&&w&&!w.dead&&!w.tutorial?w:null}catch(e){return null}}
if(V104M.on){

/* ---------- B26 · the roster list box ---------- */
{const st=document.createElement('style');st.id='m104css';st.textContent=`
@media (min-width:981px){
  .rm100.rm100-roster.r104{grid-template-columns:fit-content(560px) minmax(0,1fr)}
  .r104 .rm100list{container-type:normal}
  .r104 .rm100list>:not(.r104rows){width:0;min-width:100%;box-sizing:border-box}
  .r104 .r104gh,.r104 .r104e{width:0;min-width:100%;box-sizing:border-box}}
.m104h{display:inline-block;margin-left:6px;padding:0 6px;border-radius:8px;border:1px solid #6b5420;background:#2b1c0f;color:#f0cf7d;font-size:11px;line-height:16px;white-space:nowrap;vertical-align:middle}
button[disabled] .m104h,button.off .m104h{opacity:.6}
.m104h.no{border-color:#c0433a;color:#ffb0a0}
.m104h{text-transform:none;letter-spacing:0;font-family:var(--mono)}
.m104hd{white-space:normal!important;overflow:visible!important;line-height:18px!important}.m104hd .m104h{margin-left:8px}
.rc1notes .m104h{background:#3a2616;border-color:#6b4a22}.rc1notes .m104h.no{background:#5a2018;border-color:#c0433a}
.rc1wt .m104h{display:block;width:max-content;margin:1px 0 0;line-height:14px;font-size:10.5px}
.btn.rc1wo{height:56px!important}.btn.rc1wo .rc1fr{height:48px!important}
.rc1pit>.m104h{margin:0;justify-self:start;line-height:14px}`;document.head.appendChild(st)}

/* ---------- B27 · wooing = the Recruiter's hours ---------- */
const WOO104={pitch:1,note:1,gift:2,visit:4};
const WOO104_SEL='[data-rec98p],[data-mg="pitch"],[data-mg="visit"],[data-mg="gift2"],[data-rec74^="note:"]';
function woo104Of(b){if(!b||!b.dataset)return null;let a=null,id='';
  if(b.hasAttribute('data-rec98p')){a='pitch';id=String(b.dataset.rec98p||'').split('|')[1]}
  else if(b.dataset.mg==='pitch'){a='pitch';id=String(b.dataset.id||'').split('|')[0]}
  else if(b.dataset.mg==='visit'){a='visit';id=b.dataset.id}
  else if(b.dataset.mg==='gift2'){a='gift';id=b.dataset.id}
  else if(String(b.dataset.rec74||'').indexOf('note:')===0){a='note';id=b.dataset.id}
  if(!a)return null;const g=id&&gById(id);return g&&!g.contract&&g.alive!==false?{a,g}:null}
function woo104Rec(g,w){const K=rec98K(g);if(!K.wo104||K.wo104.wk!==w.week)K.wo104={wk:w.week,a:{}};return K.wo104}
/* the actions already taken on this recruit this week: scouting + wooing */
function woo104N(g,w){const K=rec98K(g);let n=0;for(const v of Object.values(K.a||{}))if(v===w.week)n++;if(K.wo104&&K.wo104.wk===w.week)n+=Object.keys(K.wo104.a).length;return n}
const woo104Step=()=>{try{return W104.rec.step}catch(e){return 1}};
function woo104H(g,a,w){return WOO104[a]+woo104N(g,w)*woo104Step()}
function woo104Why(g,a,w){const h=woo104H(g,a,w),l=rec98Left(w);return l<h?_T`Your recruiter has ${l} h left this week — this takes ${h} h.`:''}
function woo104Pay(g,a,w){const K=woo104Rec(g,w);if(K.a[a])return 0;const h=woo104H(g,a,w);K.a[a]=1;w.rh98={wk:w.week,n:rec98Used(w)+h};return h}
/* the scouting buttons also rise after a woo (the same trick as 351's rec104Bump) */
const WOO104B={n:0};
function woo104Bump(g,fn){const w=w104mLive();if(!w||!g||g.contract||WOO104B.n)return fn();const K=rec98K(g);const c=(K.wo104&&K.wo104.wk===w.week?Object.keys(K.wo104.a).length:0)*woo104Step();if(!c)return fn();
  const A=REC98.acts;const keep={};for(const k in A){keep[k]=A[k].h;A[k].h+=c}WOO104B.n++;try{return fn()}finally{WOO104B.n--;for(const k in keep)A[k].h=keep[k]}}
{const base=rec98Can;rec98Can=function(g){const a=arguments,s=this;return woo104Bump(g,()=>base.apply(s,a))}}
{const base=rec98Act;rec98Act=function(g){const a=arguments,s=this;return woo104Bump(g,()=>base.apply(s,a))}}
{const base=rec98Btn;rec98Btn=function(g){const a=arguments,s=this;return woo104Bump(g,()=>base.apply(s,a))}}
if(typeof rc100ActCard==='function'){const base=rc100ActCard;rc100ActCard=function(btn,g){const a=arguments,s=this;return woo104Bump(g,()=>base.apply(s,a))}}
/* a woo is paid when the action is taken */
{const base=recMark;recMark=function(g,action){const r=base.apply(this,arguments);try{const w=w104mLive();if(w&&g&&!g.contract&&WOO104[action]!=null&&action!=='note')woo104Pay(g,action,w)}catch(e){console.error(e)}return r}}
/* too few hours: refuse before anything else runs; the note is paid after its handler ran */
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest?e.target.closest(WOO104_SEL):null;if(!b||!b.closest('#mgrBody')||b.disabled)return;const w=w104mLive();if(!w)return;const o=woo104Of(b);if(!o)return;
  const why=woo104Why(o.g,o.a,w);if(why){e.preventDefault();e.stopImmediatePropagation();if(typeof mToast==='function')mToast(esc(why));return}
  if(o.a==='note'){const wk=typeof wkKey74==='function'?wkKey74():null;const before=o.g.note74;
    setTimeout(()=>{try{const w2=w104mLive();if(!w2||o.g.note74===before||o.g.note74!==wk)return;if(woo104Pay(o.g,'note',w2)){saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}catch(x){console.error(x)}},0)}}catch(err){console.error(err)}},true);
/* every wooing button shows its hours; with too few it is disabled and says why */
function woo104Chip(hh,why){const sp=document.createElement('span');sp.className='m104h'+(why?' no':'');sp.textContent='⏳ '+hh+' h';return sp}
function woo104Skin(h){if(typeof h!=='string'||!/data-rec98p|data-mg="(?:pitch|visit|gift2)"|data-rec74="note:/.test(h))return h;const w=w104mLive();if(!w)return h;
  const t=document.createElement('template');t.innerHTML=h;let ch=false;const notes=[];
  t.content.querySelectorAll('.m104h').forEach(x=>x.remove());
  for(const b of t.content.querySelectorAll(WOO104_SEL)){const o=woo104Of(b);if(!o)continue;const hh=woo104H(o.g,o.a,w);const why=woo104Why(o.g,o.a,w);ch=true;
    if(o.a==='note')notes.push({b,o,hh,why});
    else{/* ONE chip per action, on its own button: inside the gift / feast tile's text block, else at the end of the button; never over a text node */
      const sp=woo104Chip(hh,why);const host=b.querySelector('.rc1wt');(host||b).appendChild(sp)}
    if(why&&!b.hasAttribute('disabled')){b.setAttribute('disabled','');b.setAttribute('title',why)}}
  /* the private note: the three tone rows stay clean (name | effect | fit); the hours sit ONCE in the card's title line. Sent this week = no chip */
  if(notes.length){const n0=notes[0],sent=notes.every(x=>x.b.hasAttribute('disabled')&&!x.why);
    let hd=t.content.querySelector('.rc1notes .rc1phd');if(!hd){const f=[...t.content.querySelectorAll('.sect')].find(x=>x.querySelector('.rc-sub')&&/note/i.test(x.textContent));hd=f||null}
    if(hd&&!sent){hd.classList.add('m104hd');hd.appendChild(woo104Chip(n0.hh,n0.why))}}
  return ch?t.innerHTML:h}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{return woo104Skin(h)}catch(e){console.error(e)}return h}}
/* the Court / Scout step tabs re-draw the recruit's card on their own (299), not through mgrHTML */
if(typeof detailHTML==='function'){const base=detailHTML;detailHTML=function(){const h=base.apply(this,arguments);try{return woo104Skin(h)}catch(e){console.error(e)}return h}}

/* ---------- B28 · the yard plan is locked = drills are set ---------- */
function yard104Locked(w,m){try{const P=thPlan(w);if(P.reglk)return true;
  const fit=rosterOf(m).filter(g=>g.alive!==false&&!y92Lock(g));if(!fit.length)return false;
  return fit.every(g=>{const y=y92Peek(P,g.id);return y&&(y92Sum(y.L)>0||(y.pre&&y.pre.lock))&&!y92Sum(y.Q)&&!(y.pre&&!y.pre.lock)})}catch(e){return false}}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=w104mLive(),m=me();if(!w||!m)return I;const no=_T('No drills set for the week');
  const it=I.find(x=>x&&x.ic==='🏋'&&!x.done&&x.txt===no);if(it&&yard104Locked(w,m)){it.done=true;it.txt=_T('Training Yard plan locked in');it.btn=''}}catch(e){console.error(e)}return I}}
{const base=leaveList76;leaveList76=function(w){const L=base.apply(this,arguments);try{if(w104mLive()&&yard104Locked(W_(),me())){const no=_T('🏋 No drills set for the week');const i=L.indexOf(no);if(i>=0)L.splice(i,1)}}catch(e){console.error(e)}return L}}

/* ---------- B30 · a booked regrowth keeps him in bed; clicking the booked plate cancels ---------- */
const hyg104=(g,w)=>!!(g&&w&&g.rg102&&g.rg102.wk===w.week&&(g.severed||[]).length);
const HYG104T={t:0};
const HYG104_WHY=()=>_T("Hygeia's regrowth needs him in bed until the week ends");
window.addEventListener('click',e=>{try{const w=w104mLive();if(!w)return;const t=e.target&&e.target.closest?e.target.closest('[data-unbed76],[data-mg="heal"]'):null;if(!t||!t.closest('#mgrBody'))return;
  if(t.hasAttribute('data-unbed76')){const g=gById(t.dataset.unbed76);if(hyg104(g,w)){e.preventDefault();e.stopImmediatePropagation();if(typeof mToast==='function')mToast('🛏 '+esc(HYG104_WHY()))}return}
  const g=gById(t.dataset.id);if(!hyg104(g,w)){HYG104T.t=Date.now();return}
  e.preventDefault();e.stopImmediatePropagation();if(Date.now()-HYG104T.t<700)return; /* a double click books once and does not cancel itself */
  const m=me();const hh=CARE101.h.heal,c=care101Coin('heal');
  const r=mh101Rec(w,m);if(r)r.u=Math.max(0,r.u-hh);m.coin+=c;g.rg102=null;try{ghist(g,_T`cancelled the Blessings of Hygeia`)}catch(x){}
  const msg=_T`🌿 Hygeia's operation on ${esc(g.name)} is cancelled — ${hh} h and ${coinAmt87(c)} back. He may leave the bed.`;
  MGR.msg=msg;try{saveWorld()}catch(x){}if(typeof MGR_REDRAW==='function')MGR_REDRAW();if(typeof mToast==='function')mToast(msg)}catch(err){console.error(err)}},true);
function hyg104Skin(h){if(typeof h!=='string'||(h.indexOf('data-unbed76')<0&&h.indexOf('data-mg="heal"')<0))return h;const w=w104mLive();if(!w)return h;
  const t=document.createElement('template');t.innerHTML=h;let ch=false;
  for(const b of t.content.querySelectorAll('[data-unbed76]')){if(!hyg104(gById(b.dataset.unbed76),w))continue;b.setAttribute('disabled','');b.classList.add('off');b.setAttribute('title',HYG104_WHY());
    const ok=b.querySelector('.v101ok');if(ok)ok.textContent=_T('✓ in bed · Hygeia needs him here');ch=true}
  for(const b of t.content.querySelectorAll('[data-mg="heal"]')){if(!hyg104(gById(b.dataset.id),w))continue;
    const ok=b.querySelector('.v101ok');if(ok)ok.textContent=_T('✓ booked · tap to cancel');b.setAttribute('title',_T('Booked for this week — tap to cancel (hours and coin come back)'));ch=true}
  return ch?t.innerHTML:h}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{return hyg104Skin(h)}catch(e){console.error(e)}return h}}

/* ---------- B33 · the Consilium on the projected bracket ---------- */
function pj104Build(w){const pm=me();if(!pm||pm.sica||w.tutorial)return null;const P=po104New(w);const k='m:'+pm.id;const s=P.seeds.indexOf(k)+1;if(!s)return null;
  const pts=x=>{const m=po104M(x);return m?msp(m).pts:null};const mine=pts(k);if(mine==null)return null;
  const up=s>1?P.seeds[s-2]:null,dn=s<12?P.seeds[s]:null;const nm=x=>x?esc(po104Name(x)):'';
  const line=(x,sign)=>{if(!x||!po104M(x))return '';const d=Math.abs(pts(x)-mine);return sign>0?_T`${nm(x)} is just above you (#${s-1}), ${d} point${d===1?'':'s'} ahead.`:_T`${nm(x)} is just behind you (#${s+1}), ${d} point${d===1?'':'s'} back.`};
  const bye4=P.seeds[3],g4=po104M(bye4)?pts(bye4)-mine:0;
  const path=s<=4?_T`A rest week: seeds 1–4 sit out Round 1 and wait in the semifinals.`:_T`Round 1 in week 12: finish top 2 of your bout to reach the semifinals.`;
  const adv=s<=4?_T('Keep your best fighters fresh and avoid costly risks — hold the lead and the rest week is yours.')
    :g4>0&&g4<=6?_T`A rest week is ${g4} point${g4===1?'':'s'} away — fight for it in the weeks left.`:s>=11?_T('The cut is close: a loss now could drop you out of the twelve. Fight to hold your place.'):_T('Win your bouts, rest the worn — every league point moves your seed.');
  return {s,path,adv,above:line(up,1),below:line(dn,-1)}}
function pj104Send(w){try{if(!w104mLive()||typeof po104New!=='function'||!cal104New(w)||w.dead||w.pj104===w.season)return;if(!(wkOf(w.week)>=V104A.proj&&wkOf(w.week)<=V104A.proj+1)||po104P(w))return;
  const R=pj104Build(w);if(!R)return;w.pj104=w.season;
  sendLetter(w,{key:'pj104-'+w.season,kind:'letter',from:_T('the Consilium'),adv:'consilium',seal:'🏛',title:_T`The road to the Superbus: you stand #${R.s}`,until:w.week+2,
    body:`<p>${_T`The league table now points to the playoffs. If the season ended today your house would be <b>seed #${R.s}</b>.`}</p><p><b>${R.path}</b></p>${R.above||R.below?`<p>${[R.above,R.below].filter(Boolean).join(' ')}</p>`:''}<p class="rc-sub">${R.adv}</p><div class="acts"><button class="btn tksm" type="button" data-po104="bracket">${_T`🏛 The bracket`}</button></div>`})}catch(e){console.error(e)}}
{const base=endWeek;endWeek=async function(){const r=await base.apply(this,arguments);try{if(r!==false){const w=W_();if(w)pj104Send(w)}}catch(e){console.error(e)}return r}}
{const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&!w.dead)pj104Send(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
}
