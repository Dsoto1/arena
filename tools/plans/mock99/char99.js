/* MOCK ONLY (v0.99 proposal, not game code): re-lays the Character designer out of its REAL nodes.
   Loaded into the running game by mock_char.js after the designer is open. char99Build() moves nodes, char99Tab(k) shows a tab. */
(function(){
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const lab=(t)=>$$('#studio label').find(l=>{const n=[...l.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());return n&&n.textContent.trim()===t});
function card(title,sub,cls){const d=document.createElement('section');d.className='c99card '+(cls||'');d.innerHTML=`<header><b>${title}</b>${sub?`<span>${sub}</span>`:''}</header><div class="c99in"></div>`;return d}
const put=(c,...els)=>{const i=c.querySelector('.c99in');els.forEach(e=>e&&i.appendChild(e));return c};
function grid(cols,...labels){const g=document.createElement('div');g.className='formgrid c99g';g.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;labels.forEach(l=>l&&g.appendChild(l));return g}
window.char99Build=function(){
  const st=$('#studio');if(!st)return 'no studio';
  try{ST98_ON.splice(0)}catch(e){}
  $$('.st98bar',st).forEach(b=>b.remove());$$('.st98off,.st98hd',st).forEach(e=>e.classList.remove('st98off','st98hd'));
  const sg=$('.setup-grid.st95c3',st);const list=$('.stlist',st);
  const d=ST.draft||{};const ck=(($('.clspick [data-card]',sg)||{}).dataset||{}).card||'';const ckey=ck.replace(/^k:/,'');const cls=Object.assign({},CLASSES[ckey]||{});const csel=$('.clspick select',sg);if(csel&&csel.selectedOptions[0])cls.name=csel.selectedOptions[0].textContent.replace(/^\W+/,'').replace(/ · .*$/,'');
  const nameIn=$('#stName'),nickIn=$('#stNick');
  /* the shell */
  const root=document.createElement('div');root.id='c99';
  root.innerHTML=`<div class="c99head"><div class="c99who"><span class="c99kick">✎ Character designer</span><span class="c99nm">${esc(d.name||'New character')}</span><span class="c99nk">${d.nickname?'“'+esc(d.nickname)+'”':''}</span><span class="c99cls" style="--cc:${cls.color||'#c0433a'}">${esc(cls.name||'')}</span></div><div class="c99acts"></div></div>
  <div class="c99tabs" role="tablist">
    <button data-c99="basics" class="on"><i>①</i> Basics<small>name · city · story</small></button>
    <button data-c99="look"><i>②</i> Appearance<small>portrait · tokens</small></button>
    <button data-c99="fight"><i>③</i> Class &amp; ratings<small>loadout · 375 pool</small></button>
    <button data-c99="mind"><i>④</i> CPU personality<small>how a CPU plays it</small></button>
    <span class="c99sp"></span><button class="c99list" data-c99list>📜 Your characters · ${(CUSTOM.chars||[]).length}</button></div>
  <div class="c99body"><div class="c99main"></div><aside class="c99pv"></aside></div>
  <div class="c99save"></div>`;
  const main=$('.c99main',root),pv=$('.c99pv',root),acts=$('.c99acts',root),save=$('.c99save',root);
  /* header buttons: New / Randomize */
  const top=$('.mbtns.chartop',sg);if(top){top.classList.add('c99top');acts.appendChild(top)}
  /* ---------- ① BASICS ---------- */
  const pB=document.createElement('div');pB.className='c99pane';pB.dataset.p='basics';
  const id=card('🪪 Identity','what the arena calls him');
  put(id,grid(2,lab('Name'),lab('Nickname'),lab('Home city'),lab('Faith'),lab('Banner')));
  const bk=card('📜 Backstory','where he comes from, what he fights for');const ta=$('#stBack');if(ta){ta.rows=9}
  const rb=$$('#studio .mbtns').find(m=>m.querySelector('[data-st="rback"]'));
  put(bk,ta,rb);
  const sheet=$$('.card2',sg).find(c=>/Character sheet/i.test(c.textContent));if(sheet){sheet.classList.add('c99sheet')}
  const colL=document.createElement('div');colL.className='c99col';colL.append(id);if(sheet){const sc=card('📋 Record','filled in by the arena');put(sc,...[...sheet.children].filter(x=>!x.classList.contains('sect')));colL.append(sc)}
  pB.append(colL,bk);pB.classList.add('c99two');
  /* ---------- ② APPEARANCE ---------- */
  const pL=document.createElement('div');pL.className='c99pane c99look';pL.dataset.p='look';
  const face=card('🙂 Face','skin, hair, features');
  put(face,grid(3,lab('Skin'),lab('Hair'),lab('Hairstyle'),lab('Beard'),lab('Eyes'),lab('Expression'),lab('Marks'),lab('Face'),lab('Build')));
  const garb=card('🧥 Garb &amp; jewellery','');
  put(garb,grid(2,lab('Headgear'),lab('Garb'),lab('Earring'),lab('Neck')));
  const back=card('🚩 Backdrop','behind the portrait');
  const flags=$$('#studio div').find(x=>x.firstElementChild&&x.firstElementChild.classList.contains('rc-sub')&&x.querySelector('.bgflags'));
  if(flags){const s=flags.querySelector('.rc-sub');if(s)s.textContent='or hang a city banner:'}
  put(back,grid(1,lab('Backdrop')),flags);
  const tok=card('🗿 Tokens','how he stands on the sand','c99tok');
  const fig=$('span.tkfig',sg);const figBox=fig&&fig.parentElement;const tsel=lab('Board token');
  const t93=$('[data-t93card]');
  const tokRow=document.createElement('div');tokRow.className='c99tokrow';
  const cA=document.createElement('div');cA.className='c99tk';cA.innerHTML='<div class="c99tkh">Classic token</div>';if(figBox){figBox.className='c99tkfig';cA.appendChild(figBox)}if(tsel)cA.appendChild(tsel);
  const cB=document.createElement('div');cB.className='c99tk';cB.innerHTML='<div class="c99tkh">3D token</div>';
  if(t93){const pvw=t93.querySelector('.t93pv'),ctl=t93.querySelector('.t93ctl');if(pvw)cB.appendChild(pvw);if(ctl)cB.appendChild(ctl);t93.remove()}
  tokRow.append(cA,cB);put(tok,tokRow);
  const rl=$$('#studio .mbtns').find(m=>m.querySelector('[data-st="rlook"]'));
  const lookHd=document.createElement('div');lookHd.className='c99panehd';lookHd.innerHTML='<span>Everything he looks like, in one place — the preview on the right follows every change.</span>';if(rl){rl.classList.add('c99rl');lookHd.appendChild(rl)}
  const lc1=document.createElement('div');lc1.className='c99col';lc1.append(face,back);const lc2=document.createElement('div');lc2.className='c99col';lc2.append(garb,tok);pL.append(lookHd,lc1,lc2);
  /* ---------- ③ CLASS & RATINGS ---------- */
  const pF=document.createElement('div');pF.className='c99pane c99two';pF.dataset.p='fight';
  const cp=$('.clspick',sg);const cc=card('🎭 Class · the loadout','weapons, armor, ability, coin, keys, starting CF and items');
  if(cp){[...cp.children].filter(x=>!x.classList.contains('sect')).forEach(x=>{x.classList.add('c99clsrow');cc.querySelector('.c99in').appendChild(x)});cp.remove()}
  {const C=CLASSES[ckey];if(C){const wn=k=>(W[k]&&W[k].n)||k;const an=k=>(ARM[k]&&ARM[k].n)||k;const box=document.createElement('div');box.className='c99facts';box.innerHTML=`<div><b>Weapons</b><span>${[C.R,C.L].filter(Boolean).map(wn).join(' · ')||'—'}</span></div><div><b>Armor</b><span>${[...new Set((C.armor||[]).map(a=>an(a[0])))].join(' · ')}</span></div><div><b>Ability</b><span>${esc(String(C.ab||'').replace(/^Ability:\s*/,''))}</span></div><div><b>Weakness</b><span>${(()=>{const k=(typeof CLASS_WEAK!=='undefined'&&CLASS_WEAK[ckey])||'none';const w=WEAKNESSES[k]||WEAKNESSES.none;return esc(w[0]+' — '+w[1])})()}</span></div><div><b>Start</b><span>${C.coin||0} coin · ${C.keys||0} keys${(C.items||[]).length?' · '+C.items.length+' item':''}</span></div>`;cc.querySelector('.c99in').appendChild(box)}}
  const stats=$('#st95stats');const rc=card('📊 Ratings &amp; abilities','375 points across five ratings','c99rat');
  if(stats){const hd=stats.querySelector('.st95hd');if(hd)hd.remove();rc.querySelector('.c99in').appendChild(stats)}
  pF.append(cc,rc);
  /* ---------- ④ CPU PERSONALITY ---------- */
  const pM=document.createElement('div');pM.className='c99pane c99two c99mind';pM.dataset.p='mind';
  const pre=$('.perspre',sg),pw=$('.perswrap',sg);const mc=card('🧠 Temper','when a CPU plays this character');
  if(pre){const s=pre.querySelector('.rc-sub');if(s)s.textContent='Start from:'}
  put(mc,pre,pw);
  const ex=card('🎲 At the table','what these sliders make him do','c99how');
  const P=(ST.draft&&ST.draft.pers)||{};const lv=v=>v>=67?2:v<=33?0:1;const L6=[['survival','Survival',['fights on when hurt','heals when a location is low','flees to heal at the first wound']],['hunt','NPC hunting',['leaves beasts alone','takes a beast when it is the closest prize','hunts beasts for coin and CF']],['coin','Coin',['rarely shops','buys when a level is affordable','saves and spends at every market']],['cf','Crowd Favor',['ignores the stands','plays to the crowd now and then','chases Crowd Favor first']],['aggression','PvP aggression',['avoids rivals','attacks rivals in reach','goes after rivals across the sand']],['loyalty','Loyalty',['breaks truces early','keeps a truce for a rotation or two','keeps truces to the end']]];const how=L6.map(([k,n,w])=>{const v=P[k]==null?50:P[k];return `<li><b>${n} ${v}</b> — ${w[lv(v)]}</li>`}).join('');const mind=$('.st95chip.mind');const mtxt=mind?mind.textContent:'CPU plays Normal';
  ex.querySelector('.c99in').innerHTML=`<div class="c99mindchip">🧠 ${esc(mtxt)}<small>from Intelligence (Class &amp; ratings tab)</small></div>
   <ul class="c99how">${how}</ul><p class="rc-sub">Mock wording — one line per slider, from its live value.</p>`;
  pM.append(mc,ex);
  main.append(pB,pL,pF,pM);
  /* ---------- live preview ---------- */
  const por=$('#stPortrait');
  pv.innerHTML=`<div class="c99pvh">Live preview</div>`;
  if(por){pv.appendChild(por)}
  const nm=document.createElement('div');nm.className='c99pvname';nm.innerHTML=`<b>${esc(d.name||'')}</b><span>${d.nickname?'“'+esc(d.nickname)+'”':''}</span><small>${esc(cls.name||'')} · ${esc(d.city||'')}</small>`;pv.appendChild(nm);
  const tk=document.createElement('div');tk.className='c99pvtok';
  const f2=figBox&&figBox.querySelector('.tkfig');const p3=cB.querySelector('.t93pv');
  tk.innerHTML=`<div><div class="c99pvt">${f2?f2.outerHTML:''}</div><small>Classic</small></div><div><div class="c99pvt">${p3?p3.innerHTML:''}</div><small>3D</small></div>`;
  const ccard=cc.querySelector('.cimg');if(ccard){const w=document.createElement('div');w.innerHTML=ccard.outerHTML;tk.appendChild(Object.assign(document.createElement('div'),{className:'c99pvcard'})).appendChild(w.firstElementChild);tk.lastElementChild.insertAdjacentHTML('beforeend','<small>Class card</small>')}
  pv.appendChild(tk);
  /* ---------- save bar ---------- */
  const sv=$$('.mbtns',sg).find(m=>m.querySelector('[data-st="save"]'));if(sv){sv.classList.add('c99svb');save.appendChild(sv)}
  save.insertAdjacentHTML('afterbegin','<span class="c99chk">✓ Name · ✓ Class · ✓ Look — ready to save</span>');
  /* swap */
  sg.replaceWith(root);if(list)list.style.display='none';
  $$('#studio h4').forEach(h=>{if(/CPU personality|^Backstory/.test(h.textContent))h.remove()});
  const lc=$$('#c99 .mbtns').find(m=>!m.children.length);if(lc)lc.remove();
  char99Tab('basics');return 'ok'};
window.char99Tab=function(k){$$('#c99 .c99tabs [data-c99]').forEach(b=>b.classList.toggle('on',b.dataset.c99===k));$$('#c99 .c99pane').forEach(p=>p.hidden=p.dataset.p!==k);document.getElementById('c99').dataset.tab=k};
const css=document.createElement('style');css.textContent=`
#c99{--c99g:#d6ab4c;display:grid;gap:12px;min-width:0}
#c99 .c99head{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:10px 14px;border:1px solid var(--line2);border-radius:10px;background:linear-gradient(90deg,rgba(214,171,76,.10),rgba(0,0,0,0) 60%),var(--panel)}
#c99 .c99who{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;flex:1;min-width:0}
#c99 .c99kick{font:600 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--dim);width:100%}
#c99 .c99nm{font:400 26px var(--serif,Georgia),serif;color:var(--gold2)}
#c99 .mbtns.c99top,#c99 .mbtns.c99svb{display:flex!important;flex-wrap:nowrap!important;grid-template-columns:none!important}#c99 .c99top>.btn,#c99 .c99svb>.btn{flex:none!important}
#c99 .c99nk{color:var(--muted);font-style:italic}
#c99 .c99cls{font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:99px;border:1px solid var(--cc);color:var(--bone);background:color-mix(in srgb,var(--cc) 30%,transparent)}
#c99 .c99top{margin:0!important;display:flex!important;flex-direction:row;gap:8px}#c99 .c99top .btn{width:auto!important;white-space:nowrap}
#c99 .c99tabs{display:flex;gap:6px;align-items:stretch;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--line2);padding-bottom:0}
#c99 .c99tabs [data-c99]{display:grid;grid-template-columns:auto 1fr;column-gap:8px;text-align:left;padding:8px 16px 8px 12px;border:1px solid var(--line2);border-bottom:none;border-radius:8px 8px 0 0;background:var(--panel);color:var(--muted);font:600 14px inherit;cursor:pointer;white-space:nowrap;position:relative;top:1px}
#c99 .c99tabs [data-c99] i{grid-row:span 2;font-style:normal;font-size:20px;color:var(--dim);align-self:center}
#c99 .c99tabs [data-c99] small{font:400 11px var(--mono);color:var(--dim)}
#c99 .c99tabs [data-c99].on{background:var(--panel2);color:var(--gold2);border-color:var(--gold);box-shadow:inset 0 2px 0 var(--gold)}
#c99 .c99tabs [data-c99].on i{color:var(--gold)}
#c99 .c99sp{flex:1}#c99 .c99list{align-self:center;background:none;border:1px dashed var(--line2);color:var(--muted);border-radius:99px;padding:5px 12px;white-space:nowrap}
#c99 .c99body{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:14px;align-items:start}
#c99 .c99main{min-width:0}
#c99 .c99pane{display:grid;gap:12px;align-content:start}
#c99 .c99two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
#c99 .c99col{display:grid;gap:12px;align-content:start}
#c99 .c99look{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}
#c99 .c99look .c99panehd{grid-column:1/-1;display:flex;align-items:center;gap:10px;justify-content:space-between;color:var(--muted);font-size:13px}
#c99 .c99look .c99panehd .mbtns{margin:0}
#c99 .c99look .c99tok{grid-column:1/-1}
#c99 .c99card{background:var(--panel2);border:1px solid var(--line2);border-radius:10px;overflow:hidden;min-width:0}
#c99 .c99card>header{display:flex;align-items:baseline;gap:10px;padding:8px 12px;border-bottom:1px solid var(--line2);background:rgba(0,0,0,.18)}
#c99 .c99card>header b{font:600 12px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
#c99 .c99card>header span{font-size:12px;color:var(--dim)}
#c99 .c99in{padding:10px 12px;display:grid;gap:10px}
#c99 .c99g{margin:0!important;gap:8px 10px!important}
#c99 .c99g label{min-width:0}#c99 .c99g select,#c99 .c99g input{width:100%;min-width:0}
#c99 textarea#stBack{min-height:210px;width:100%;resize:vertical}
#c99 .c99in>.mbtns{margin:0}
#c99 .bgflags{display:flex;flex-wrap:wrap;gap:4px}
#c99 .c99tokrow{display:grid;grid-template-columns:1fr 1fr;gap:10px}#c99 .c99tk{grid-template-columns:1fr!important;justify-items:center;align-content:start}#c99 .c99tk .tkfig svg{max-height:96px}#c99 .c99tk .t93pv{width:72px!important;height:96px!important}#c99 .c99tk .t93ctl small{display:none}#c99 .c99tk select{width:100%}#c99 .c99tk>label{margin:0}
#c99 .c99clsrow{display:grid!important;grid-template-columns:160px minmax(0,1fr);gap:14px;align-items:start}#c99 .c99clsrow>span{display:block}
#c99 .c99facts{display:grid;gap:6px;border-top:1px solid var(--line2);padding-top:10px}#c99 .c99facts>div{display:grid;grid-template-columns:90px 1fr;gap:8px;font-size:13px}#c99 .c99facts b{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--dim);padding-top:2px}#c99 .c99facts span{color:var(--bone)}
#c99 .st95chip{white-space:nowrap}#c99 .st95gl{display:flex;flex-wrap:wrap;gap:6px}
#c99 .c99tk{display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;padding:10px;border:1px solid var(--line2);border-radius:8px;background:rgba(0,0,0,.15)}
#c99 .c99tkh{grid-column:1/-1;font:600 10px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
#c99 .c99tk .t93pv{width:96px;height:120px}#c99 .c99tk .t93ctl{display:grid;gap:6px}
#c99 .c99tkfig{display:flex;justify-content:center}
#c99 .c99pv{position:sticky;top:8px;display:grid;gap:10px;justify-items:center;padding:12px;border:1px solid var(--gold);border-radius:12px;background:radial-gradient(120% 80% at 50% 0,rgba(214,171,76,.14),transparent 60%),var(--panel)}
#c99 .c99pvh{justify-self:stretch;font:600 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
#c99 #stPortrait{margin:0}#c99 #stPortrait .portrait{width:200px!important;height:280px!important;box-shadow:0 6px 18px rgba(0,0,0,.5);border-radius:8px}
#c99 .c99pvname{text-align:center;display:grid;gap:1px}#c99 .c99pvname b{font:400 20px var(--serif,Georgia),serif;color:var(--bone)}#c99 .c99pvname span{color:var(--muted);font-style:italic;font-size:13px}#c99 .c99pvname small{color:var(--dim);font:11px var(--mono)}
#c99 .c99pvtok{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;justify-self:stretch;border-top:1px solid var(--line2);padding-top:10px}
#c99 .c99pvtok>div{display:grid;justify-items:center;gap:3px}#c99 .c99pvtok small{font:10px var(--mono);color:var(--dim);text-transform:uppercase;letter-spacing:.08em}
#c99 .c99pvt{width:64px;height:84px;display:flex;align-items:flex-end;justify-content:center}
#c99 .c99pvt .tkfig svg{max-height:84px}#c99 .c99pvt .t93none{display:grid;place-items:center;width:56px;height:76px;border:1px dashed var(--line2);border-radius:6px;color:var(--dim)}
#c99 .c99pvcard .cimg{width:60px!important;height:84px!important}
#c99 .c99save{position:sticky;bottom:0;display:flex;gap:12px;align-items:center;justify-content:flex-end;padding:10px 14px;border:1px solid var(--line2);border-radius:10px;background:rgba(20,15,11,.94);backdrop-filter:blur(4px);z-index:2}
#c99 .c99chk{flex:1;color:var(--hp);font:12px var(--mono)}
#c99 .c99svb{margin:0!important;display:flex!important;flex-direction:row;gap:8px}#c99 .c99svb .btn{width:auto!important;min-width:170px}
#c99 .c99rat .st95stats{border:none!important;padding:0!important;background:none!important;box-shadow:none!important;position:static!important}
#c99 .clscard74{width:150px!important;height:210px!important}
#c99 .c99mind .perspre{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0}
#c99 .c99mind .perswrap{grid-template-columns:1fr!important;gap:10px!important}
#c99 .c99mindchip{display:grid;padding:10px 12px;border:1px solid var(--gold);border-radius:8px;color:var(--gold2);font-weight:600}
#c99 .c99mindchip small{font:400 11px var(--mono);color:var(--dim)}
#c99 ul.c99how{margin:0;padding-left:18px;display:grid;gap:6px;color:var(--muted);font-size:13px}#c99 ul.c99how b{color:var(--bone)}
@media (max-width:700px){
 #c99 .c99body{grid-template-columns:1fr}#c99 .c99pv{order:-1;position:static;grid-template-columns:auto 1fr;justify-items:start;align-items:center;padding:8px}
 #c99 .c99pvh{display:none}#c99 #stPortrait .portrait{width:86px!important;height:120px!important}
 #c99 .c99pvtok{grid-column:2;grid-row:2;border:none;padding:0;grid-template-columns:repeat(3,auto)}#c99 .c99pvname{grid-column:2;grid-row:1;text-align:left}
 #c99 #stPortrait{grid-row:span 2}#c99 .c99pvt{width:44px;height:58px}#c99 .c99pvt .tkfig svg{max-height:58px}#c99 .c99pvcard .cimg{width:42px!important;height:58px!important}
 #c99 .c99two,#c99 .c99look,#c99 .c99tokrow{grid-template-columns:1fr}#c99 .c99tabs [data-c99] small{display:none}#c99 .c99tabs [data-c99]{padding:6px 9px;font-size:13px;display:block}#c99 .c99tabs [data-c99] i{display:none}#c99 .c99tabs{gap:3px}
 #c99 .c99head{padding:8px 10px}#c99 .c99nm{font-size:20px}#c99 .c99list{display:none}
 #c99 .c99g{grid-template-columns:repeat(2,minmax(0,1fr))!important}#c99 .c99chk{display:none}#c99 .c99save{justify-content:stretch}#c99 .c99svb{flex:1}#c99 .c99svb .btn{min-width:0;flex:1}
 #c99 .c99top{display:none}
}`;document.head.appendChild(css);
})();
