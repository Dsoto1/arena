/* =====================================================================
   378-v105rec — v1.05 Manager recruiting (his B49 B50 P1a B51 B52, tools/plans/v105/NOTES.md). Manager only.
   Kill switch localStorage flavius_v105recoff=1. Test tools/tests/tv105o.js
   B49  The Recruiter's letter for a recruit who SIGNED ELSEWHERE ("<name> chose <house>" / "<name> signed elsewhere", 351 of104Answer,
        written by 351's of104Letter with the 🎣 seal and the key 'of104_<gid>_<week>') becomes a plain NOTICE:
        "<name> signed with <house> — their terms beat yours." No "answer by" badge, no button, no advice (sendLetter wrapper: act:false =
        270's plain-letter row, until = this week). It files itself the week after (sweep below, like 353's l104Sweep). REPLACES the 351
        "chose <house>" text that carried 17's offerVerdict advice ("not interested enough yet … raise the wage"); that advice stays for a
        recruit who is still a free agent ("<name> says no", "wants time"). The 351 "signed elsewhere" letter (button, deadline) is the same notice.
   B50 / P1a  A newly signed fighter takes NO offer for 4 weeks from his signing (g.contract.since, w.week is absolute so a season rollover
        needs no care; SET105 = 4): no rival bid (17 cpuLeagueWeek poaching, buy-outs c104BuyOut), no trade ask / loan ask / market ask
        (47 offersWeek + loansWeek: asks made about him are dropped with their news line; 343 loan102Best: no Clerk market advice), no Sica
        poach (100 sicaPoach), and the PLAYER cannot make one on a rival's new signing (poachVerdict refuses with the reason, the Poach button
        is disabled with it, the trade card disables "Send" while he is picked). Rivals' own fighters are protected from other rivals
        and Sica the same way. The tag "🆕 settling in · N wk" shows beside the name (gTags: recruiting rows, team views, the card; 350's
        roster rows). Contracts with since < 2 (the starting rosters) are not new. REPLACES: no protection (Sica poached any unhappy
        fighter, trade asks any time).
   B51  A weekly task / letter that suggests a BARGAIN recruit ("A bargain: <name>" / "Pick of the week", 138 recruiter84): not made when
        the recruit is already on your Recruiting board (g.favd), and filed (read) the moment he is put there later (sweep on every Manager
        page and mail build, like 353 B17).
   B52  Your ludus: the 📬 Mail box (69 #mailBox) and the desk's Letters drawer button hide while there is nothing to show (no letter,
        nothing unread, nothing still listed, no past mail); they come back with the next letter.
   B54  Manager → Recruiting: picking a recruit brings his whole options panel into view (smooth, instant with Reduce motion; a panel taller than the
        screen aligns to its top), and a click on one of his actions (scout, watch, pitch, note, gift, feast, visit, offer …) keeps the panel at the same
        place on the screen when the page re-renders (#mBody is moved by however far the panel moved). Never to the top. One generic watcher.
   B57 + M1a  "Answer by week N" belongs to TASKS only. A letter whose only buttons are links (data-mg="tab", the bracket) is information: sendLetter
        gives it act:false (270's plain-letter row, no deadline, no task) and it files itself the week after (set105Sweep). Mail = information (reports,
        news, the Consilium race letter, signed-elsewhere notices, tips); tasks = what can be acted on (loan asks, trade offers, recruit terms, Yard plan, …)
        and clear themselves on every redraw (the checklist is re-evaluated; letters-as-tasks by B51 / 353). A decision shows once, as a task, never in mail.
   B59  "<name> asks for a fight" clears the moment he is on the card (task button, Match Week, ⋯ menu, drag): mgrHTML / mailLive / ludusTodo73 /
        deskItems99 hide a fighter who is already entered from the request while they run (319 only dropped it once every bout was fought).
   No save change (new fields only: letter .notice105).
   ===================================================================== */
const V105R={on:(()=>{try{return localStorage.getItem('flavius_v105recoff')!=='1'}catch(e){return true}})(),weeks:4};
const SET105=V105R.weeks;
if(V105R.on){
function set105Live(){try{const w=typeof W_==='function'?W_():null;return w&&!w.dead&&!w.tutorial?w:null}catch(e){return null}}
/* weeks of burn-in left for a fighter signed recently (0 = open to offers) */
function set105Left(g,w){w=w||set105Live();if(!w||!g||!g.contract)return 0;const s=g.contract.since;if(s==null||s<2)return 0;const d=w.week-s;return d>=0&&d<SET105?SET105-d:0}
function set105Prot(w){return (w.glads||[]).filter(g=>g&&g.alive!==false&&set105Left(g,w)>0)}
const set105Tag=g=>{const n=set105Left(g);return n?`<span class="set105" title="${esc(_T('Signed recently: no offers for him yet'))}">${_T`🆕 settling in · ${n} wk`}</span>`:''};
const set105Why=g=>_T`${g.name} signed only lately — he is settling in for ${set105Left(g)} more weeks; no offers yet.`;
try{const st=document.createElement('style');st.textContent='.set105{display:inline-block;margin-left:4px;padding:0 5px;border-radius:8px;font:600 10px/16px var(--ui,sans-serif);color:#2f6f3a;background:rgba(80,160,90,.16);white-space:nowrap;vertical-align:middle}small.set105{display:block;margin:0;padding:0;background:none}';document.head.appendChild(st)}catch(e){}

/* ---------- B49 · signed elsewhere = a notice ---------- */
{const base=sendLetter;sendLetter=function(w,o){try{if(o&&/^of104_/.test(o.key||'')&&o.seal==='🎣'){const mm=/^of104_(.+)_(\d+)$/.exec(o.key);const g=mm&&gById(mm[1]);const pm=me();
  const R=g&&g.contract&&pm&&g.contract.mgr!==pm.id?mgrById(g.contract.mgr):null;
  if(R)o={...o,title:_T`${g.name} signed with ${R.ludus}`,body:`<p>${_T`<b>${esc(g.name)}</b> signed with <b>${esc(R.ludus)}</b> — their terms beat yours.`}</p>`,until:w.week,act:false,notice105:1}}}catch(e){console.error(e)}
  /* B57: "Answer by week N" is only for a letter that asks for a decision. A letter whose only buttons are links (to a tab, to the bracket) is
     information: a plain letter (270's letter row, no deadline), filed the week after. act:{...} and act:false set by the sender are kept. */
  try{if(o&&o.act===undefined&&typeof o.body==='string'&&(o.kind||'letter')==='letter'){const bt=o.body.match(/<button\b[^>]*>/g)||[];
    if(bt.length&&bt.every(x=>/data-mg="tab"|data-po104="bracket"/.test(x)))o={...o,act:false,notice105:1}}}catch(e){console.error(e)}return base.call(this,w,o)}}

/* ---------- B50 · nobody makes an offer on a fighter who signed lately ---------- */
/* rivals' poaching (17): the protected fighters are "not for sale" while the week runs */
{const base=cpuLeagueWeek;cpuLeagueWeek=function(){const w=set105Live();if(!w)return base.apply(this,arguments);const P=set105Prot(w).filter(g=>!g.noPoach);for(const g of P)g.noPoach=true;
  try{return base.apply(this,arguments)}finally{for(const g of P)delete g.noPoach}}}
/* Sica's poaching (100): a settled mood hides them from his list */
if(typeof sicaPoach==='function'){const base=sicaPoach;sicaPoach=function(w){const L=set105Live()?set105Prot(w).map(g=>[g,g.morale]):[];for(const [g] of L)g.morale=100;
  try{return base.apply(this,arguments)}finally{for(const [g,m] of L)g.morale=m}}}
/* trade / loan / buy-out asks made this week about a protected fighter are dropped, with their news line */
function set105Guard(base,args,self){const w=set105Live();if(!w)return base.apply(self,args);const had=new Set(w.offers||[]);const top=(w.tlog||[])[0];const r=base.apply(self,args);
  try{const O=w.offers||[];const bad=O.filter(o=>!had.has(o)&&(()=>{const g=gById(o.gid);return g&&set105Left(g,w)>0})());
    if(bad.length){w.offers=O.filter(o=>!bad.includes(o));const names=bad.map(o=>esc(gById(o.gid).name));const T=w.tlog||[];let idx=top?T.indexOf(top):T.length;if(idx<0)idx=T.length;
      w.tlog=T.filter((x,i)=>i>=idx||!names.some(n=>String(x.text).includes(n)))}}catch(e){console.error(e)}return r}
{const base=offersWeek;offersWeek=function(){return set105Guard(base,arguments,this)}}
{const base=loansWeek;loansWeek=function(){return set105Guard(base,arguments,this)}}
if(typeof c104BuyOut==='function'){const base=c104BuyOut;c104BuyOut=function(w,g){try{if(g&&set105Left(g,w)>0)return}catch(e){}return base.apply(this,arguments)}}
if(typeof loan102Best==='function'){const base=loan102Best;loan102Best=function(w,g){try{if(g&&set105Left(g,w)>0)return null}catch(e){}return base.apply(this,arguments)}}
/* the player's own offers on a rival's new signing */
{const base=poachVerdict;poachVerdict=function(g){try{const m=me();if(g&&g.contract&&m&&g.contract.mgr!==m.id&&set105Left(g)>0)return {ok:false,why:set105Why(g),set105:1}}catch(e){}return base.apply(this,arguments)}}
function set105Mark(b,g){const why=set105Why(g);b.classList.add('off');b.setAttribute('aria-disabled','true');b.setAttribute('disabled','');b.dataset.dis=why;b.title=why;b.dataset.set105=g.id}
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{const m=me();if(typeof h==='string'&&g&&g.contract&&m&&g.contract.mgr!==m.id&&set105Left(g)>0&&h.includes('data-mg="poach"')){const t=document.createElement('template');t.innerHTML=h;
  for(const b of t.content.querySelectorAll('[data-mg="poach"]')){set105Mark(b,g);if(!b.parentNode.querySelector('.set105why'))b.insertAdjacentHTML('afterend',`<span class="rc-sub set105why"> ${esc(set105Why(g))}</span>`)}h=t.innerHTML}}catch(e){console.error(e)}return h}}
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-mg="poach"]');if(!b)return;const g=gById(String(b.dataset.id||MGR.sel||'').split('|')[0]);const m=me();
  if(!g||!g.contract||!m||g.contract.mgr===m.id||!set105Left(g))return;e.preventDefault();e.stopImmediatePropagation();mToast('⛔ '+set105Why(g))}catch(err){}},true);
/* the trade card: the tag on his row; "Send" is off while a new signing is picked */
function set105Trade(root){const sel=root.querySelector('#trTheirs');const go=root.querySelector('[data-mg="tradego"]');if(!sel)return;
  for(const o of sel.querySelectorAll('option')){const g=gById(o.value);if(g&&set105Left(g)>0&&!/settling in/.test(o.textContent))o.textContent+=' · '+_T`🆕 settling in · ${set105Left(g)} wk`}
  const g=gById(sel.value);let note=root.querySelector('.set105why');
  if(g&&set105Left(g)>0){if(go){go.setAttribute('disabled','');go.classList.add('off');go.dataset.dis=set105Why(g);go.title=set105Why(g)}
    if(!note&&go)go.parentNode.insertAdjacentHTML('beforebegin',`<div class="traderes no set105why">✉ ${esc(set105Why(g))}</div>`)}
  else{if(go){go.removeAttribute('disabled');go.classList.remove('off');delete go.dataset.dis;go.removeAttribute('title')}if(note)note.remove()}}
{const base=tradeHTML;tradeHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||!h.includes('id="trTheirs"'))return h;const t=document.createElement('template');t.innerHTML=h;set105Trade(t.content);const d=document.createElement('div');d.appendChild(t.content);return d.innerHTML}catch(e){console.error(e)}return h}}
document.addEventListener('change',e=>{const s=e.target;if(s&&s.id==='trTheirs'){const box=s.closest('.tradebox');if(box)try{set105Trade(box)}catch(err){}}});
{const base=ludusClick;ludusClick=async function(action,id,btn,ctx){try{if(action==='tradego'){const el=document.querySelector('#trTheirs');const g=el&&gById(el.value);if(g&&set105Left(g)>0){ctx&&ctx.say&&ctx.say(set105Why(g));return true}}}catch(e){}return base.apply(this,arguments)}}
/* the tag, wherever a fighter's status shows */
{const base=gTags;gTags=function(g){const h=base.apply(this,arguments);try{return h+set105Tag(g)}catch(e){return h}}}
{const base=r104Row;r104Row=function(g){const h=base.apply(this,arguments);try{const n=set105Left(g);if(!n||typeof h!=='string'||h.includes('set105'))return h;const tag=_T`🆕 settling in · ${n} wk`;
  if(/<span class="r104n">[\s\S]*?<small class="rm100one">/.test(h))return h.replace(/(<span class="r104n">[\s\S]*?<small class="rm100one">)/,`$1<span class="set105">${tag}</span> `);
  return h.replace(/(<span class="r104n"><b[\s\S]*?<\/b>)/,`$1<small class="rm100one set105">${tag}</small>`)}catch(e){console.error(e)}return h}}

/* ---------- B49 + B51 · letters that file themselves ---------- */
function set105Sweep(w){if(!w||!Array.isArray(w.letters)||w.dead)return 0;let n=0;
  for(const L of w.letters){if(!L||L.read)continue;let file=false;
    if(L.notice105&&w.week>L.wk)file=true;
    else{const m=/data-rec84="([^"]+)"/.exec(typeof L.body==='string'?L.body:'');if(m){const g=gById(m[1]);if(g&&g.favd&&!g.contract)file=true}}
    if(file){L.read=true;n++}}
  if(n){try{saveWorld(true)}catch(e){}}return n}
{const base=mailLive;mailLive=function(){try{const w=set105Live();if(w)set105Sweep(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=mgrHTML;mgrHTML=function(){try{const w=set105Live();if(w)set105Sweep(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* B51: a bargain / pick of the week is not made for a recruit already on the board (hidden from the Recruiter's list while it is built) */
if(typeof recruiter84==='function'){const base=recruiter84;recruiter84=function(w){const hid=[];try{for(const g of freeAgents())if(g.favd&&!g.inj){hid.push(g);g.inj=true}}catch(e){}
  try{return base.apply(this,arguments)}finally{for(const g of hid)delete g.inj}}}

/* ---------- B59 · "asks for a fight" clears the moment he is entered (task button, Match Week, ⋯ menu, drag): while the desk / mail is built,
   a fighter who asked this week and is already on the card is hidden from the request (319 only dropped it once every bout was fought);
   withdrawn → back on the next redraw. Nothing else "asks for" in a task (the purse's buy-freedom ask is a pend decision; no rest / raise asks exist). ---------- */
function set105Fight(fn,self,args){const w=set105Live();if(!w||!w.night||typeof onCard!=='function')return fn.apply(self,args);const st=[];
  try{for(const g of rosterOf(me()))if(g.wantFight&&g.wantFight.week===w.week&&onCard(g)){st.push([g,g.wantFight]);g.wantFight=null}}catch(e){}
  try{return fn.apply(self,args)}finally{for(const [g,x] of st)g.wantFight=x}}
for(const nm of ['mgrHTML','mailLive','ludusTodo73','deskItems99']){try{if(typeof window[nm]==='function'){const base=window[nm];window[nm]=function(){return set105Fight(base,this,arguments)}}}catch(e){}}

/* ---------- B54 · Recruiting keeps the picked recruit's options panel in view across redraws ---------- */
/* One generic watcher: a click on a recruit row (select) brings the whole options panel into view once the page has re-drawn; a click on one of the
   panel's actions (scout, watch, pitch, note, gift, feast, visit, offer …) keeps the panel at the SAME place on the screen when the page re-renders
   (the scroll box #mBody is moved by however far the panel moved). Smooth, instant with Reduce motion. Never to the top. */
const REC105_ACT='[data-rec98a],[data-rec98p],[data-rec74],[data-mg="offer"],[data-mg="poach"],[data-mg="scout"],[data-mg="pitch"],[data-mg="note"],[data-mg="gift2"],[data-mg="visit"],[data-mg="sign"],[data-of104x]';
const rec105Panel=()=>{const b=document.querySelector('#mgrBody '+REC105_ACT.split(',').join(',#mgrBody '));return b?b.closest('.card2'):null};
const rec105Box=()=>document.getElementById('mBody');
let rec105Obs=null;
function rec105Watch(fn,ms){try{if(rec105Obs)rec105Obs.disconnect()}catch(e){}const host=document.getElementById('mgrBody');if(!host||typeof MutationObserver==='undefined')return;let pend=false;
  const o=new MutationObserver(()=>{if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;try{fn()}catch(e){console.error(e)}})});o.observe(host,{childList:true,subtree:true});rec105Obs=o;setTimeout(()=>{if(rec105Obs===o){o.disconnect();rec105Obs=null}},ms||900)}
function rec105Show(){const p=rec105Panel(),box=rec105Box();if(!p||!box)return;const r=p.getBoundingClientRect(),b=box.getBoundingClientRect();
  const fits=r.height<=b.height;const off=fits?(r.top<b.top||r.bottom>b.bottom):(r.top<b.top||r.top>b.top+b.height*0.35);if(!off)return;
  const smooth=!(typeof reduceMotionOn==='function'&&reduceMotionOn());try{p.scrollIntoView({block:fits?'nearest':'start',behavior:smooth?'smooth':'auto'})}catch(e){p.scrollIntoView()}}
let rec105T=0;
const rec105Start=e=>{try{if(MGR.tab!=='recruit'||MGR.view)return;const t=e.target;if(!t||!t.closest||!t.closest('#mgrBody'))return;const box=rec105Box();if(!box)return;
  const act=t.closest(REC105_ACT);const row=t.closest('[data-mg="sel"]');
  if(act&&act.closest('.card2')&&!row){const p=act.closest('.card2');const T0=p.getBoundingClientRect().top;let n=0;
    rec105Watch(()=>{const q=rec105Panel();if(!q)return;const d=q.getBoundingClientRect().top-T0;if(Math.abs(d)>2){box.scrollTop+=d}rec105Show();n++},900)}
  else if(row){let done=false;rec105Watch(()=>{if(done)return;const q=rec105Panel();if(!q)return;done=true;setTimeout(rec105Show,30)},700);setTimeout(rec105Show,120);setTimeout(rec105Show,420)}}catch(err){console.error(err)}};
/* pointerdown first (the offer / poach handlers stop a later click), click for the keyboard */
window.addEventListener('pointerdown',e=>{rec105T=Date.now();rec105Start(e)},true);
window.addEventListener('click',e=>{if(Date.now()-rec105T<600)return;rec105Start(e)},true);

/* ---------- B52 · the mail panel hides itself when there is nothing to show ---------- */
/* Your ludus: 294's 📬 Letters button + drawer (and 270's Letters list, 69's #mailBox) go while no letter, review, past mail or Acta is listed */
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||MGR.view||MGR.tab!=='ludus'||!set105Live())return h;
  if(h.indexOf('desk99')<0&&h.indexOf('mailBox')<0)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;let ch=false;
  const D=R.querySelector('#desk99');
  if(D){const lt=D.querySelector('.dk99lt');const n=lt?lt.querySelectorAll(':scope>details').length:0;const past=D.querySelector('.dk99past');const acta=D.querySelector('.acta99,.acta91');
    if(!n&&!past&&!acta){for(const x of D.querySelectorAll('.lu100mb,.lu100mail')){x.remove();ch=true}
      if(lt){const sec=lt.previousElementSibling;if(sec&&sec.classList.contains('dk99sec')&&!D.classList.contains('lu100tasks'))sec.remove();lt.remove();ch=true}
      D.classList.add('set105nomail')}}
  const M=R.querySelector('#mailBox');if(M&&!M.querySelector('details.mail')&&!M.querySelector('.mpast')){M.remove();ch=true}
  if(!ch)return h;const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}
}
