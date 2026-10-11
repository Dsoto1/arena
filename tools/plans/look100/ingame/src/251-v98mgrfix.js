/* v0.98 MANAGER FIXES (251-v98mgrfix): 1 catch-up progress overlay (catchUpWeeks replaced: same steps and same Math.random calls, but it yields to the
   browser between bouts and weeks and shows "Week k of n" + the week's headline) · 2 Vulso's cart: two of three lots (50-v48 edits, greyed last lot) ·
   3 the League standings podium lives INSIDE the League banner (banner73 wrapper; the box below keeps only the table). Display only. */

/* ---------------- 1 · catch-up progress ---------------- */
const CU98={el:null,n:0};
function cu98Frame(){return new Promise(r=>{let d=false;const go=()=>{if(!d){d=true;r()}};try{requestAnimationFrame(go)}catch(e){}setTimeout(go,60)})}
function cu98Open(n){cu98Close();const el=document.createElement('div');el.id='cu98';el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-live','polite');
  el.innerHTML=`<div class="cu98c"><b class="cu98t">${_T('⏩ Your doctores run the ludus')}</b><div class="cu98bar"><i style="width:0%"></i></div><div class="cu98k"></div><div class="cu98h"></div></div>`;
  for(const ev of ['click','pointerdown','keydown','touchstart'])el.addEventListener(ev,e=>{e.stopPropagation();if(ev!=='touchstart')e.preventDefault()},true);
  document.body.appendChild(el);CU98.el=el;CU98.n=n;cu98Set(0,'')}
function cu98Set(k,head){const el=CU98.el;if(!el)return;const n=CU98.n||1;el.querySelector('.cu98bar i').style.width=Math.round(Math.min(100,100*k/n))+'%';
  el.querySelector('.cu98k').textContent=_T`Week ${Math.min(n,k+1)} of ${n}`;el.querySelector('.cu98h').textContent=head?String(head).replace(/<[^>]*>/g,''):''}
function cu98Close(){if(CU98.el){CU98.el.remove();CU98.el=null}for(const e of document.querySelectorAll('#cu98'))e.remove()}
async function catchUpWeeks(){const w=W_(),m=me();let n=Math.min(12,calLag());const log0=[];const coin0=m.coin,fame0=m.fame,wins0=m.wins;
  CU98.n=n;if(!HEADLESS)cu98Open(n);
  try{await cu98Frame();
    for(let k=0;k<n;k++){cu98Set(k,log0.length?log0[log0.length-1]:'');await cu98Frame();
      if(w.special&&!w.special.done&&typeof specAutoRun==='function')await specAutoRun();
      for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done){await runBoutSim(i);await cu98Frame()}
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];const g=gById(P.gid);
        if(P.t==='thumb')settlePending(0,null,{d6:1+Math.floor(Math.random()*6),d12:1+Math.floor(Math.random()*12)});
        else if(P.t==='blood')settlePending(0,g&&effOvr(g)>=58&&m.coin>=P.price+20?'pay':'let');else settlePending(0,'stay')}
      const ok=await endWeek();if(!ok)break;log0.push(w.lastPaper&&w.lastPaper.lead?w.lastPaper.lead.h:'');cu98Set(k+1,log0[log0.length-1]);await cu98Frame()}
    saveWorld(true);return {weeks:log0.length,coin:m.coin-coin0,fame:m.fame-fame0,wins:m.wins-wins0,heads:log0}}
  finally{cu98Close()}}

/* ---------------- 3 · the podium in the League banner ---------------- */
const LP98={off:false};
{const base=lp96Podium;lp96Podium=function(){return LP98.off?'':base.apply(this,arguments)}}
{const base=lp90StakesHTML;lp90StakesHTML=function(){LP98.off=true;try{return base.apply(this,arguments)}finally{LP98.off=false}}}
{const base=banner73;banner73=function(k){const h=base.apply(this,arguments);if(k!=='league'||!h)return h;
  try{const w=W_();const L=leagueSort(w.mgrs);const pod=lp96Podium(L,L.length,L.indexOf(me())+1);if(!pod)return h;
    return h.replace('<div class="roomttl">',`<div class="lp98wrap">${pod}</div><div class="roomttl">`)}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
#cu98{position:fixed;inset:0;z-index:3400;background:rgba(10,6,3,.82);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
.cu98c{width:min(460px,100%);box-sizing:border-box;padding:20px 22px;border:1px solid var(--gold,#c9a14a);border-radius:12px;background:radial-gradient(ellipse at 50% 0,#2c1d10,#150e08 80%);box-shadow:0 14px 50px rgba(0,0,0,.8);text-align:center}
.cu98t{display:block;font:400 22px var(--display);color:var(--gold2,#e0b95a);margin-bottom:14px}
.cu98bar{height:14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--line2,#4a3826);overflow:hidden}
.cu98bar i{display:block;height:100%;width:0;background:repeating-linear-gradient(45deg,#f0cf7d 0 10px,#c9a14a 10px 20px);background-size:28px 28px;animation:cu98s 1s linear infinite;transition:width .25s ease}
@keyframes cu98s{to{background-position:28px 0}}
body.calm .cu98bar i,body.idle92 .cu98bar i{animation:none}@media (prefers-reduced-motion:reduce){.cu98bar i{animation:none;transition:none}}
.cu98k{margin-top:10px;font-weight:700;color:#f1e6cf}.cu98h{margin-top:6px;min-height:2.6em;font-style:italic;color:#e8dcc0;font-size:13.5px}
.cartlot:has(.cart98left){opacity:.55;filter:grayscale(.8)}.cart98left{display:block;margin-top:4px;font-style:italic}
.b73-league{height:198px}.b73-league .roomttl{bottom:auto;top:10px}
.lp98wrap{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:center;pointer-events:none}
.lp98wrap .lp96pod{margin:0;padding:0;gap:6px;pointer-events:none;width:min(520px,46%)}
.lp98wrap .lp96p{pointer-events:auto;width:32%}
.lp98wrap .lp96cup{width:80px;height:80px;margin-bottom:-6px;line-height:0;flex:none;position:relative;z-index:1}.lp98wrap .lp96cup svg{display:block;width:80px;height:80px}
.lp98wrap .lp96ban{padding:5px 6px 12px;text-shadow:0 1px 3px #000}.lp98wrap .lp96ban b{font-size:14px}.lp98wrap .lp96ban small{font-size:11px;white-space:nowrap}
.lp98wrap .lp96step{margin-top:-6px;padding-top:0;align-items:center;font-size:15px;color:rgba(0,0,0,.62)}.lp98wrap .lp96p.p1 .lp96step{height:40px}.lp98wrap .lp96p.p2 .lp96step{height:30px}.lp98wrap .lp96p.p3 .lp96step{height:22px}
.b73-league .roomstat{top:10px;transform:none}
@media (max-width:760px){.b73-league{height:186px}.lp98wrap .lp96pod{width:94%;gap:3px}.lp98wrap .lp96ban b{font-size:11.5px}.lp98wrap .lp96ban small{font-size:9.5px}.lp98wrap .lp96fl{display:none}.lp98wrap .lp96cup{width:60px;height:60px}.lp98wrap .lp96cup svg{width:60px;height:60px}.b73-league .roomttl b{font-size:19px}.b73-league .roomttl span{font-size:11px}}
`;document.head.appendChild(st)}
