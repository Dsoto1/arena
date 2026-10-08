/* MOCK ONLY (v0.99 proposal, not game code): Manager → new career → "Create your lanista", re-laid out of its REAL nodes
   into the same tabbed designer shell as the Character designer mock (char99.js). lan99Build() / lan99Tab(k). */
(function(){
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const lab=t=>$$('#mgrBody label').find(l=>{const n=[...l.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());return n&&n.textContent.trim().startsWith(t)});
function card(title,sub,cls){const d=document.createElement('section');d.className='c99card '+(cls||'');d.innerHTML=`<header><b>${title}</b>${sub?`<span>${sub}</span>`:''}</header><div class="c99in"></div>`;return d}
const put=(c,...els)=>{const i=c.querySelector('.c99in');els.forEach(e=>e&&i.appendChild(e));return c};
const col=(...els)=>{const d=document.createElement('div');d.className='c99col';d.append(...els.filter(Boolean));return d};
function grid(cols,...labels){const g=document.createElement('div');g.className='formgrid c99g';g.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;labels.forEach(l=>l&&g.appendChild(l));return g}
window.lan99Build=function(){
  const mb=$('#mgrBody');const sg=$('.setup-grid',mb);if(!sg)return 'no form';const h4=$('h4',mb);
  const c=NEWMGR||{};
  const root=document.createElement('div');root.id='c99';root.className='lan99';
  root.innerHTML=`<div class="c99head"><div class="c99who"><span class="c99kick">🎩 New career · your lanista</span><span class="c99nm">${esc(c.name||'')}</span><span class="c99nk">of ${esc(c.ludus||'')}</span><span class="c99cls" style="--cc:${c.color||'#c0433a'}">${esc(c.city||'')}</span></div><div class="c99acts"></div></div>
  <div class="c99tabs" role="tablist">
    <button data-c99="id" class="on"><i>①</i> Identity<small>name · epithet · story</small></button>
    <button data-c99="look"><i>②</i> Portrait &amp; colours<small>face · house colour</small></button>
    <button data-c99="house"><i>③</i> House<small>ludus · city · banner</small></button>
    <button data-c99="mind"><i>④</i> Temperament<small>how rivals read you</small></button>
    <button data-c99="start"><i>⑤</i> Start<small>difficulty · house rules</small></button></div>
  <div class="c99body"><div class="c99main"></div><aside class="c99pv"></aside></div><div class="c99save"></div>`;
  const main=$('.c99main',root),pv=$('.c99pv',root),save=$('.c99save',root),acts=$('.c99acts',root);
  /* Studio lanistas row → header (import / save to the Studio) */
  const stl=$$('.card2',sg).find(x=>/Studio lanistas/.test(x.textContent));
  /* ① IDENTITY */
  const pI=document.createElement('div');pI.className='c99pane c99two';pI.dataset.p='id';
  const who=card('🪪 The lanista','how the league addresses you');put(who,grid(2,lab('Name'),lab('Epithet')));
  const sty=card('📜 Story','your letters and the Annals quote it');const ta=$('textarea[data-nmx="bio"]',sg);if(ta)ta.rows=14;
  const wb=$$('.mbtns',sg).find(m=>m.querySelector('[data-nmxa="bio"]'));put(sty,ta,wb);
  const stc=card('🎩 Studio lanistas','start from one you designed, or keep this one');if(stl){stl.classList.remove('card2');const b=stl.querySelector('b');b&&b.remove();put(stc,stl)}
  pI.append(col(who,stc),col(sty));
  /* ② PORTRAIT & COLOURS */
  const pL=document.createElement('div');pL.className='c99pane c99look';pL.dataset.p='look';
  const lg=$('.lookgrid',sg);const L=n=>lg&&[...lg.querySelectorAll('label')].find(l=>l.textContent.trim().startsWith(n));
  const face=card('🙂 Face','');put(face,grid(3,L('Skin'),L('Hair'),L('Hairstyle'),L('Beard'),L('Eyes'),L('Expression'),L('Marks'),L('Face'),L('Build')));
  const garb=card('🧥 Garb &amp; jewellery','');put(garb,grid(2,L('Headgear'),L('Garb'),L('Earring'),L('Neck')));
  const bdc=card('🎨 Colours','backdrop · house colour');put(bdc,grid(2,L('Backdrop'),lab('Color')));
  const rl=$$('.mbtns',sg).find(m=>m.querySelector('[data-mg="nmlook"]'));const hd=document.createElement('div');hd.className='c99panehd';hd.innerHTML='<span>The same face designer as a Studio character — one face, everywhere.</span>';if(rl)hd.appendChild(rl);
  pL.append(hd,col(face),col(garb,bdc));
  /* ③ HOUSE */
  const pH=document.createElement('div');pH.className='c99pane c99two';pH.dataset.p='house';
  const lud=card('🏛 The ludus','');const note=$$('p.rc-sub',sg).find(p=>/Your home city/.test(p.textContent));put(lud,grid(1,lab('Ludus name'),lab('🏠 Home city')),note);
  const rs=$('label.rspick',sg);const rsc=card('📚 Roster set','which creations are in this league');put(rsc,rs);
  const fl=card('🚩 House banner','masthead · league table · stands');const fs=$$('div.sect',sg).find(x=>/house banner/i.test(x.textContent));const sh=fs&&fs.querySelector('button');const fg=$('.flaggrid',sg);if(sh)fl.querySelector('header').appendChild(sh);put(fl,fg);fs&&fs.remove();
  pH.append(col(lud,rsc),col(fl));
  /* ④ TEMPERAMENT */
  const pM=document.createElement('div');pM.className='c99pane c99two c99mind';pM.dataset.p='mind';
  const hp=$$('h4',sg).find(h=>/Personality/.test(h.textContent));hp&&hp.remove();
  const pc=card('🎭 Start from a type','');put(pc,$('.presets',sg));
  const sl=card('🎚 Temperament','seven sliders · 0–100');put(sl,$('.perswrap',sg));
  pM.append(col(pc),col(sl));
  /* ⑤ START */
  const pS=document.createElement('div');pS.className='c99pane c99two';pS.dataset.p='start';
  const hd2=$$('h4',sg).find(h=>/Starting difficulty/.test(h.textContent));hd2&&hd2.remove();
  const df=card('⚖ Starting difficulty','');const hint=$$('p.hint',sg).find(p=>/You start with/.test(p.textContent));put(df,$('.sdiff',sg),hint);
  const hr=$('details.card2',sg);if(hr)hr.open=true;const hrc=card('🏜 House rules','optional — baked in for the whole career');if(hr){hr.classList.remove('card2');put(hrc,hr)}
  pS.append(col(df),col(hrc));
  main.append(pI,pL,pH,pM,pS);
  /* preview */
  const por=$('#nmPortrait .portrait',sg);
  pv.innerHTML='<div class="c99pvh">Live preview</div>';const pw=document.createElement('div');pw.id='nmPortrait';pw.className='c99lpor';if(por)pw.appendChild(por);pv.appendChild(pw);
  const fsel=fg&&fg.querySelector('.flagcell.on img,.flagcell img');
  pv.insertAdjacentHTML('beforeend',`<div class="c99pvname"><b>${esc(c.name||'')}</b><span>${esc(c.nick||'')}</span><small>lanista of</small></div><div class="c99ludus" style="--hc:${c.color||'#c0433a'}">${fsel?`<img src="${fsel.getAttribute('src')}" alt="">`:''}<div><b>${esc(c.ludus||'')}</b><small>🏠 ${esc(c.city||'')}</small></div></div>`);
  /* footer */
  const go=$$('.mbtns',sg).find(m=>m.querySelector('[data-mg="nmgo"]'));if(go){go.classList.add('c99svb');save.appendChild(go)}
  save.insertAdjacentHTML('afterbegin','<span class="c99chk">✓ Name · ✓ Ludus · ✓ City · Normal start</span>');
  sg.replaceWith(root);if(h4)h4.remove();
  lan99Tab('id');return 'ok'};
window.lan99Tab=function(k){$$('#c99 .c99tabs [data-c99]').forEach(b=>b.classList.toggle('on',b.dataset.c99===k));$$('#c99 .c99pane').forEach(p=>p.hidden=p.dataset.p!==k)};
const css=document.createElement('style');css.textContent=`
#c99.lan99 .c99stl{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 10px;margin:0}
#c99.lan99 .c99lpor .portrait{width:200px!important;height:280px!important;box-shadow:0 6px 18px rgba(0,0,0,.5);border-radius:8px}
#c99.lan99 .c99ludus{justify-self:stretch;display:flex;gap:10px;align-items:center;padding:8px;border-top:1px solid var(--line2);border-left:4px solid var(--hc)}
#c99.lan99 .c99ludus img{width:70px;height:46px;object-fit:cover;border-radius:3px}
#c99.lan99 .c99ludus b{display:block;color:var(--gold2);font:400 17px var(--serif,Georgia),serif}#c99.lan99 .c99ludus small{color:var(--dim);font:11px var(--mono)}
#c99.lan99 .flaggrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}#c99.lan99 .flaggrid img{width:100%;height:auto}
#c99.lan99 .presets{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0}
#c99.lan99 .perswrap{grid-template-columns:1fr!important}
#c99.lan99 .sdiff{display:grid;grid-template-columns:repeat(3,1fr)}
#c99.lan99 details>div{display:grid;gap:6px}#c99.lan99 details>summary{display:none}#c99.lan99 .c99stl{display:grid!important;gap:8px}#c99.lan99 .c99in>div:not([class]){display:grid;gap:8px}
#c99.lan99 textarea{width:100%;min-height:170px}
#c99.lan99 input[type=color],#c99.lan99 input[data-nm=color]{width:100%;height:38px}
@media (max-width:700px){#c99.lan99 .c99lpor .portrait{width:86px!important;height:120px!important}#c99.lan99 .c99ludus{grid-column:1/-1}#c99.lan99 .c99stl{display:none}#c99.lan99 .flaggrid{grid-template-columns:repeat(4,1fr)}}`;document.head.appendChild(css);
})();
