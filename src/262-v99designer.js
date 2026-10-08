/* 262-v99designer — v0.99 THE DESIGNER FRAME (his approved mock-ups, tools/plans/mock99/).
   1) DF99 = ONE shared frame every Studio designer can use: header (kicker · item name · subtitle · chip, New / Randomize buttons),
      LARGE NUMBERED TABS (number · title · small subtitle), the tab body as a two-column card grid, a LIVE PREVIEW column pinned on
      the right, a sticky bottom bar (readiness checks + Save + Start fresh); phones (≤700 px) one column, the preview a compact strip
      on top, tabs scroll sideways (and a swipe on the body turns the tab). The tab per designer is remembered (localStorage
      flavius_df99tab); New / Edit / Copy jump back to the first tab.
      The frame is built from the designer's OWN finished HTML: df99Xform parses it (an inert <template>), the layout moves the real
      nodes (every data-attribute, id, value and handler stays — the designers' delegated handlers keep working), the result is
      serialized back. So every redraw of the designer re-builds the frame on the same tab, with no extra flicker.
      API: DF99.build(spec) · DF99.card(title,sub,cls,nodes) · DF99.grid(n,nodes) · DF99.col(nodes) · DF99.tab(root,k) ·
      DF99.head(root,{name,nick,chip,color}) · DF99.checks(root,[[ok,text]]) · df99Xform(html,fn) — see the comment above DF99.build.
   2) CHARACTER DESIGNER in the frame (Studio · Characters, edit view): ① Basics (identity, record, backstory) · ② Appearance (face,
      backdrop, garb, ONE Tokens card: Classic picker + the 3D token card) · ③ Class & ratings (class card + loadout facts beside the
      375-point ratings panel) · ④ CPU personality (presets + sliders beside "At the table": one plain line per slider from its live
      value) · 📜 Your characters (the list). Preview: portrait, name, nickname, class · city, Classic token, 3D token, class card.
      The character's own pronouns (Build = woman → she/her).
   3) LANISTA DESIGNER = ONE layout (ln99Frame) for the Studio's Lanistas designer AND Manager mode's new-career lanista: ① Identity ·
      ② Portrait & colours · ③ House · ④ Temperament · ⑤ Start (Manager: difficulty + house rules; Studio: "Use in a new career").
      Both keep their own data attributes (data-lnf/lnpt/lna · data-nm/nmx/nmpt/mg) so saves write customLanistas / choice.mgr as before.
   247's st98Apply tabs are switched off for 'chars' and 'lanistas' (the other designers keep them until converted).
   Kill switch: localStorage flavius_df99off=1 → the old layouts. */
const DF99={mem:null,jump:0,off:(()=>{try{return localStorage.getItem('flavius_df99off')==='1'}catch(e){return false}})()};
const DF99_ON=['chars','lanistas'];
if(!DF99.off&&typeof ST98_ON!=='undefined')for(const k of DF99_ON){const i=ST98_ON.indexOf(k);if(i>=0)ST98_ON.splice(i,1)}
function df99Mem(){if(DF99.mem)return DF99.mem;try{DF99.mem=JSON.parse(localStorage.getItem('flavius_df99tab')||'{}')||{}}catch(e){DF99.mem={}}return DF99.mem}
function df99MemSet(id,k){const m=df99Mem();m[id]=k;try{localStorage.setItem('flavius_df99tab',JSON.stringify(m))}catch(e){}}
/* df99Xform — parse an HTML string into an inert template, let fn(root) rearrange it, serialize it back. fn returns false = leave as is. */
function df99Xform(html,fn){if(typeof html!=='string')return html;const T=document.createElement('template');T.innerHTML=html;
  try{if(fn(T.content)===false)return html}catch(e){console.error(e);return html}return T.innerHTML}
const df99El=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
DF99.card=function(title,sub,cls,nodes){const d=df99El('section','df99card '+(cls||''),`<header><b>${title}</b>${sub?`<span>${sub}</span>`:''}</header><div class="df99in"></div>`);
  const i=d.querySelector('.df99in');(nodes||[]).forEach(e=>e&&i.appendChild(e));return d};
DF99.put=function(card,...els){const i=card.querySelector('.df99in');els.flat().forEach(e=>e&&i.appendChild(e));return card};
DF99.grid=function(n,nodes){const g=df99El('div','formgrid df99g');g.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;(nodes||[]).forEach(e=>e&&g.appendChild(e));return g};
DF99.col=function(nodes){const d=df99El('div','df99col');(nodes||[]).forEach(e=>e&&d.appendChild(e));return d};
/* DF99.build(spec) → the frame element (detached; put it where the old layout was).
   spec = { id:'char'                       memory key for the remembered tab
            cls:'ch99'                      extra class on the root
            kicker, name, nick, chip:{t,c}  header (chip = small coloured pill, e.g. the class or the home city); sub = a line under the name
            acts:[Node]                     header buttons (New / Randomize)
            tabs:[{k,t,s,lay,cols:[[Node]], head:Node}]   numbered tabs; lay 'two' (default) | 'look' (wider left) | 'one'; head spans the row
            side:{k,t}                      an extra tab at the right of the tab row (e.g. 📜 Your characters · N), its pane = side.nodes
            preview:[Node]                  the live preview column (pinned right; a compact top strip on phones)
            checks:[[ok,text]], save:[Node] the sticky bottom bar }
   Tabs are buttons [data-df99t="k"]; panes .df99pane[data-df99p="k"] (hidden when not chosen); root[data-tab] = the open tab. */
DF99.build=function(spec){const nums='①②③④⑤⑥⑦⑧⑨';const id=spec.id;
  const root=df99El('div','df99 '+(spec.cls||''));root.dataset.df99=id;
  const keys=spec.tabs.map(t=>t.k).concat(spec.side?[spec.side.k]:[]);
  let A=null;if(DF99.jump&&Date.now()-DF99.jump<3000){A=spec.tabs[0].k;DF99.jump=0;df99MemSet(id,A)}
  if(!A){const m=df99Mem()[id];A=keys.includes(m)?m:spec.tabs[0].k}
  root.dataset.tab=A;
  root.innerHTML=`<div class="df99head"><div class="df99who"><span class="df99kick">${spec.kicker||''}</span><span class="df99nm" data-df99h="name">${esc(spec.name||'')}</span><span class="df99nk" data-df99h="nick">${spec.nick||''}</span><span class="df99chip" data-df99h="chip" style="--cc:${esc((spec.chip&&spec.chip.c)||'#c0433a')}" ${spec.chip&&spec.chip.t?'':'hidden'}>${esc((spec.chip&&spec.chip.t)||'')}</span>${spec.sub?`<span class="df99sub">${spec.sub}</span>`:''}</div><div class="df99acts"></div></div>
   <div class="df99tabs" role="tablist" aria-label="${_T`Designer sections`}">${spec.tabs.map((t,i)=>`<button type="button" role="tab" data-df99t="${t.k}" class="${t.k===A?'on':''}" aria-selected="${t.k===A}"><i>${nums[i]||i+1}</i><span>${t.t}</span><small>${t.s||''}</small></button>`).join('')}${spec.side?`<span class="df99sp"></span><button type="button" role="tab" class="df99side ${spec.side.k===A?'on':''}" data-df99t="${spec.side.k}" aria-selected="${spec.side.k===A}">${spec.side.t}</button>`:''}</div>
   <div class="df99body"><div class="df99main"></div><aside class="df99pv" aria-label="${_T`Live preview`}"><div class="df99pvh">${_T`Live preview`}</div></aside></div><div class="df99save"><span class="df99chk" aria-live="polite"></span></div>`;
  const acts=root.querySelector('.df99acts');(spec.acts||[]).forEach(e=>e&&acts.appendChild(e));
  const main=root.querySelector('.df99main');
  for(const t of spec.tabs){const p=df99El('div','df99pane df99'+(t.lay||'two'));p.dataset.df99p=t.k;if(t.k!==A)p.hidden=true;
    if(t.head){t.head.classList.add('df99panehd');p.appendChild(t.head)}
    for(const c of t.cols||[])p.appendChild(Array.isArray(c)?DF99.col(c):c);main.appendChild(p)}
  if(spec.side){const p=df99El('div','df99pane df99one df99list');p.dataset.df99p=spec.side.k;if(spec.side.k!==A)p.hidden=true;(spec.side.nodes||[]).forEach(e=>e&&p.appendChild(e));main.appendChild(p)}
  const pv=root.querySelector('.df99pv');(spec.preview||[]).forEach(e=>e&&pv.appendChild(e));
  const sv=root.querySelector('.df99save');(spec.save||[]).forEach(e=>{if(e){e.classList.add('df99svb');sv.appendChild(e)}});
  DF99.checks(root,spec.checks||[]);return root};
DF99.tab=function(root,k){if(!root)return;root.dataset.tab=k;root.querySelectorAll(':scope>.df99tabs [data-df99t]').forEach(b=>{const on=b.dataset.df99t===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  root.querySelectorAll(':scope>.df99body>.df99main>.df99pane').forEach(p=>{p.hidden=p.dataset.df99p!==k});df99MemSet(root.dataset.df99,k);
  const b=root.querySelector(`:scope>.df99tabs [data-df99t="${k}"]`);if(b&&b.scrollIntoView&&root.offsetWidth<=700)try{b.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}
  if(typeof BUS!=='undefined'&&BUS.emit)try{BUS.emit('designer.tab',{id:root.dataset.df99,k})}catch(e){}};
DF99.head=function(root,o){if(!root)return;const q=k=>root.querySelector(`:scope>.df99head [data-df99h="${k}"]`);
  if(o.name!=null){const e=q('name');if(e&&e.textContent!==o.name)e.textContent=o.name}
  if(o.nick!=null){const e=q('nick');if(e&&e.innerHTML!==o.nick)e.innerHTML=o.nick}
  if(o.chip){const e=q('chip');if(e){if(e.textContent!==o.chip.t)e.textContent=o.chip.t||'';e.hidden=!o.chip.t;if(o.chip.c)e.style.setProperty('--cc',o.chip.c)}}};
DF99.checks=function(root,list){if(!root)return;const e=root.querySelector(':scope>.df99save>.df99chk');if(!e)return;
  const h=list.map(([ok,t])=>`<span class="${ok?'ok':'no'}">${ok?'✓':'✗'} ${t}</span>`).join('<i>·</i>');if(e.innerHTML!==h)e.innerHTML=h;
  root.classList.toggle('df99bad',list.some(x=>!x[0]))};
/* the tab clicks, the swipe on phones, and the jump back to the first tab on New / Edit / Copy */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const b=t.closest('.df99 [data-df99t]');
  if(b){e.preventDefault();e.stopPropagation();DF99.tab(b.closest('.df99'),b.dataset.df99t);return}
  const j=t.closest('#studio [data-st="new"],#studio [data-st="edit"],#studio [data-st="dup"],#studio [data-cr="edit"],#studio [data-cr="copy"],#studio [data-lna="new"],#studio [data-lna="copysys"],[data-df99j]');if(j)DF99.jump=Date.now()},true);
{let T0=null;document.addEventListener('touchstart',e=>{T0=null;const m=e.target.closest&&e.target.closest('.df99main');if(!m||e.touches.length!==1||e.target.closest('input,select,textarea,.perswrap,.sliderow,.flaggrid,.bgflags'))return;T0={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now(),m}},{passive:true});
 document.addEventListener('touchend',e=>{if(!T0)return;const t=e.changedTouches[0],dx=t.clientX-T0.x,dy=t.clientY-T0.y,m=T0.m,dt=Date.now()-T0.t;T0=null;if(Math.abs(dx)<70||Math.abs(dy)>45||dt>700)return;
  const root=m.closest('.df99');if(!root||root.offsetWidth>700)return;const L=[...root.querySelectorAll(':scope>.df99tabs [data-df99t]')].map(b=>b.dataset.df99t);const i=L.indexOf(root.dataset.tab);const k=L[i+(dx<0?1:-1)];if(k)DF99.tab(root,k)},{passive:true})}
/* df99Lab — the label (or the nearest block) that holds a control, so it moves with its caption */
const df99Lab=(R,sel)=>{const el=R.querySelector(sel);return el?(el.closest('label')||el):null};
/* df99Rest — controls left in the old layout (added by later modules) go into a "More" card, so nothing is ever lost */
function df99Rest(old,cols){const out=[];for(const c of cols){for(const el of [...c.children]){if(el.matches('h4,h3')||!el.querySelector('input,select,textarea,button')&&!el.matches('input,select,textarea,button'))continue;out.push(el)}}
  return out.length?DF99.card(_T`⋯ More`,'','df99more',out):null}

function df99More(root,sg,cols){const m=df99Rest(sg,cols.filter(c=>c.tagName==='DIV'));if(!m)return;const c=root.querySelector('.df99pane .df99col');if(c)c.appendChild(m)}
/* ================= 2) THE CHARACTER DESIGNER ================= */
const CH99_SLIDERS=()=>[['survival',_T('Survival'),[_T('fights on when hurt'),_T('heals when a location is low'),_T('flees to heal at the first wound')]],
  ['hunt',_T('NPC hunting'),[_T('leaves beasts alone'),_T('takes a beast when it is the closest prize'),_T('hunts beasts for coin and CF')]],
  ['coin',_T('Coin'),[_T('rarely shops'),_T('buys when a level is affordable'),_T('saves and spends at every market')]],
  ['cf',_T('Crowd Favor'),[_T('ignores the stands'),_T('plays to the crowd now and then'),_T('chases Crowd Favor first')]],
  ['aggression',_T('PvP aggression'),[_T('avoids rivals'),_T('attacks rivals in reach'),_T('goes after rivals across the sand')]],
  ['loyalty',_T('Loyalty'),[_T('breaks truces early'),_T('keeps a truce for a rotation or two'),_T('keeps truces to the end')]]];
const ch99Fem=d=>!!(d&&d.portrait&&d.portrait.fem&&d.portrait.fem!=='0');
function ch99Cls(d){const out={name:'',color:'#c0433a',C:null,weak:'none'};try{const ref=d.classRef||'cls:soldier';const sel=document.querySelector('#studio select[data-f="classRef"]');
  if(ref.startsWith('cls:')){const k=ref.slice(4);const C=CLASSES[k];if(C){out.C=C;out.color=C.color||out.color;out.name=C.name||k;out.weak=(typeof CLASS_WEAK!=='undefined'&&CLASS_WEAK[k])||'none'}}
  else{const x=JSON.parse(JSON.stringify(d));if(typeof applyClassToChar==='function')applyClassToChar(x);const C=charClass(x);out.C=C;out.weak=C.weak||'none';const k=(CUSTOM.classes||[]).find(z=>'ccl:'+z.id===ref);out.name=k?k.name:(typeof classNameOf==='function'?classNameOf(ref):'');out.color=(k&&k.color)||d.color||out.color}
  if(sel&&sel.selectedOptions&&sel.selectedOptions[0])out.name=sel.selectedOptions[0].textContent.replace(/^[^\p{L}]+/u,'').replace(/ · .*$/,'')||out.name}catch(e){}return out}
function ch99Facts(d){const I=ch99Cls(d);const C=I.C;if(!C)return '';const wn=k=>(W[k]&&W[k].n)||k;const an=k=>(ARM[k]&&ARM[k].n)||k;
  const arm=[...new Set((C.armor||[]).map(a=>an(Array.isArray(a)?a[0]:a)))].join(' · ')||'—';const w=WEAKNESSES[I.weak]||WEAKNESSES.none;
  const ab=String(C.ab||'').replace(/<[^>]+>/g,'').replace(/^[^:]{0,20}:\s*/,'');const it=(C.items||[]).filter(Boolean).length;
  return `<div><b>${_T`Weapons`}</b><span>${[C.R,C.L].filter(Boolean).map(k=>esc(wn(k))).join(' · ')||'—'}</span></div><div><b>${_T`Armor`}</b><span>${esc(arm)}</span></div><div><b>${_T`Ability`}</b><span>${esc(ab)||'—'}</span></div><div><b>${_T`Weakness`}</b><span>${esc(w[0])}${I.weak!=='none'?' — '+esc(w[1]):''}</span></div><div><b>${_T`Start`}</b><span>${_T`${C.coin||0} coin · ${C.keys||0} keys${it?` · ${it} item${it===1?'':'s'}`:''}`}</span></div>`}
function ch99How(d){const P=(d&&d.pers)||{};const lv=v=>v>=67?2:v<=33?0:1;
  return CH99_SLIDERS().map(([k,n,w])=>{const v=P[k]==null?50:+P[k];return `<li data-ch99how="${k}"><b>${n} ${v}</b> — ${w[lv(v)]}</li>`}).join('')}
function ch99Mind(){const m=document.querySelector('#studio .df99.ch99 #st95gl .st95chip.mind');return m?m.textContent:_T('CPU plays Normal')}
function ch99Checks(d){const L=[[!!String(d.name||'').trim(),_T('Name')],[true,_T('Class')],[!!d.portrait,_T('Look')]];
  try{if(!d.sandbox&&typeof draftStats==='function'&&typeof statSum==='function'){const s=statSum(draftStats(d));L.push([s<=STAT_BUDGET,s<=STAT_BUDGET?_T`Ratings ${s}/${STAT_BUDGET}`:_T`Ratings over ${STAT_BUDGET} (${s})`])}}catch(e){}
  const ok=L.every(x=>x[0]);L.push([ok,ok?_T('ready to save'):_T('fix the marked items')]);return L}
function ch99Frame(R){const sg=R.querySelector('.setup-grid.st95c3')||(R.querySelector('#stName')&&R.querySelector('#stName').closest('.setup-grid'));if(!sg)return false;
  const d=ST.draft||{};const fem=ch99Fem(d);const I=ch99Cls(d);const cols=[...sg.children];
  /* header */
  const top=sg.querySelector('.mbtns.chartop');
  /* ① BASICS */
  const id=DF99.card(_T`🪪 Identity`,fem?_T('what the arena calls her'):_T('what the arena calls him'),'',[DF99.grid(2,[df99Lab(sg,'[data-f="name"]'),df99Lab(sg,'[data-f="nickname"]'),df99Lab(sg,'[data-f="city"]'),df99Lab(sg,'[data-f="faith"]'),df99Lab(sg,'[data-f="banner91"]')])]);
  const sheet=[...sg.querySelectorAll('.card2')].find(c=>!c.matches('.clspick,.t93card')&&!c.querySelector('input,select,textarea,button'));
  let rec=null;if(sheet){rec=DF99.card(_T`📋 Record`,_T`filled in by the arena`,'df99rec',[...sheet.children].filter(x=>!x.matches('.sect')));sheet.remove()}
  const ta=sg.querySelector('#stBack');if(ta)ta.setAttribute('rows','9');const rb=sg.querySelector('[data-st="rback"]');
  const bk=DF99.card(_T`📜 Backstory`,fem?_T('where she comes from, what she fights for'):_T('where he comes from, what he fights for'),'',[ta,rb&&rb.closest('.mbtns')]);
  /* ② APPEARANCE */
  const P=f=>df99Lab(sg,`[data-f="portrait.${f}"]`);
  const face=DF99.card(_T`🙂 Face`,_T`skin, hair, features`,'',[DF99.grid(3,['skin','hair','hs','bs','eyes','smile','mark','face','fem'].map(P))]);
  const garb=DF99.card(_T`🧥 Garb & jewellery`,'','',[DF99.grid(2,['helm','garb','ear','neck'].map(P))]);
  const fl=sg.querySelector('.bgflags');const flBox=fl&&fl.parentElement;if(flBox){const s=flBox.querySelector('.rc-sub');if(s)s.textContent=_T('or hang a city banner:')}
  const back=DF99.card(_T`🚩 Backdrop`,_T`behind the portrait`,'',[DF99.grid(1,[P('bg')]),flBox]);
  const fig=sg.querySelector('span.tkfig');const figBox=fig&&fig.parentElement;const tsel=df99Lab(sg,'[data-f="tokenRef"]');const t93=sg.querySelector('[data-t93card]');
  const cA=df99El('div',_T('df99tk ch99tkA'),`<div class="df99tkh">${_T`Classic token`}</div>`);if(figBox){figBox.className='df99tkfig';cA.appendChild(figBox)}if(tsel)cA.appendChild(tsel);
  const cB=df99El('div',_T('df99tk ch99tkB'),`<div class="df99tkh">${_T`3D token`}</div>`);if(t93)cB.appendChild(t93);
  const tokRow=df99El('div','df99tokrow');tokRow.append(cA,cB);
  const tok=DF99.card(_T`🗿 Tokens`,fem?_T('how she stands on the sand'):_T('how he stands on the sand'),'df99tok',[tokRow]);
  const rl=sg.querySelector('[data-st="rlook"]');const lookHd=df99El('div','',`<span>${fem?_T('Everything she looks like, in one place — the preview on the right follows every change.'):_T('Everything he looks like, in one place — the preview on the right follows every change.')}</span>`);if(rl)lookHd.appendChild(rl.closest('.mbtns')||rl);
  /* ③ CLASS & RATINGS */
  const cp=sg.querySelector('.clspick');const cc=DF99.card(_T`🎭 Class · the loadout`,_T`weapons, armor, ability, coin, keys, starting CF and items`,'ch99cls',[]);
  cc.classList.add('clspick');if(cp){[...cp.children].filter(x=>!x.matches('.sect')).forEach(x=>{x.classList.add('df99clsrow');DF99.put(cc,x)});cp.remove()}
  DF99.put(cc,df99El('div','df99facts',ch99Facts(d)));
  const stats=sg.querySelector('#st95stats');if(stats){const hd=stats.querySelector('.st95hd');if(hd)hd.remove()}
  const rc=DF99.card(_T`📊 Ratings & abilities`,_T`${typeof STAT_BUDGET!=='undefined'?STAT_BUDGET:375} points across five ratings`,'df99rat',[stats]);
  /* ④ CPU PERSONALITY */
  const pre=sg.querySelector('.perspre'),pw=sg.querySelector('.perswrap');if(pre){const s=pre.querySelector('.rc-sub');if(s)s.textContent=_T('Start from:')}
  const mc=DF99.card(_T`🧠 Temper`,_T`when a CPU plays this character`,'ch99mind',[pre,pw]);
  const mindTxt=(()=>{const m=sg.querySelector('#st95gl .st95chip.mind');return m?m.textContent:_T('CPU plays Normal')})();
  const ex=DF99.card(_T`🎲 At the table`,fem?_T('what these sliders make her do'):_T('what these sliders make him do'),'df99how',[df99El('div','df99mindchip',`<span data-ch99mind>🧠 ${esc(mindTxt)}</span><small>${_T`from Intelligence (Class & ratings tab)`}</small>`),df99El('ul','df99howl',ch99How(d))]);
  /* save bar */
  const svBtn=sg.querySelector('[data-st="save"]');const sv=svBtn&&svBtn.closest('.mbtns');
  /* the list (Your characters) */
  const list=R.querySelector('.stlist');const n=(CUSTOM.chars||[]).length;
  /* leftovers */
  sg.querySelectorAll('h4').forEach(h=>h.remove());
  /* preview */
  const por=sg.querySelector('#stPortrait');
  const pvName=df99El('div','df99pvname',`<b data-df99v="name">${esc(d.name||'')}</b><span data-df99v="nick">${d.nickname?'“'+esc(d.nickname)+'”':''}</span><small data-df99v="sub">${esc(I.name)}${d.city?' · '+esc(d.city):''}</small>`);
  const pvTok=df99El('div','df99pvtok',`<div><div class="df99pvt" data-df99v="classic"></div><small>${_T`Classic`}</small></div><div><div class="df99pvt" data-df99v="t3d"></div><small>${_T`3D`}</small></div><div class="df99pvcard"><div data-df99v="card"></div><small>${_T`Class card`}</small></div>`);
  const nick=d.nickname?'“'+esc(d.nickname)+'”':'';
  const root=DF99.build({id:'char',cls:'ch99',kicker:_T`✎ Character designer`,name:d.name||_T('New character'),nick,chip:{t:I.name,c:I.color},acts:[top],
    tabs:[{k:'basics',t:_T`Basics`,s:_T`name · city · story`,cols:[[id,rec],[bk]]},
      {k:'look',t:_T`Appearance`,s:_T`portrait · tokens`,lay:'look',head:lookHd,cols:[[face,back],[garb,tok]]},
      {k:'fight',t:_T`Class & ratings`,s:_T`loadout · ${typeof STAT_BUDGET!=='undefined'?STAT_BUDGET:375} pool`,cols:[[cc],[rc]]},
      {k:'mind',t:_T`CPU personality`,s:_T`how a CPU plays it`,cols:[[mc],[ex]]}],
    side:{k:'list',t:_T`📜 Your characters · ${n}`,nodes:[list]},
    preview:[por,pvName,pvTok],checks:ch99Checks(d),save:[sv]});
  df99More(root,sg,cols);sg.replaceWith(root);ch99PvFill(root);return true}
/* ch99PvFill — copies the token / 3D / class-card pictures into the preview (from the real controls in the tabs) */
function ch99PvFill(root){if(!root)return;const q=s=>root.querySelector(s);const set=(k,h)=>{const e=q(`.df99pv [data-df99v="${k}"]`);if(e&&e.innerHTML!==h)e.innerHTML=h};
  const f=q('.ch99tkA .tkfig');set('classic',f?f.outerHTML:'');
  const p3=q('.ch99tkB .t93pv');set('t3d',p3?p3.innerHTML:'<span class="t93none">?</span>');
  const cd=q('.ch99cls .df99clsrow .clscard,.ch99cls .df99clsrow .cimg');set('card',cd?cd.outerHTML.replace(/\sid="[^"]*"/g,''):'')}
function ch99Live(){const root=document.querySelector('#studio .df99.ch99');if(!root||typeof ST==='undefined'||!ST.draft)return;const d=ST.draft;const I=ch99Cls(d);
  const nick=d.nickname?'“'+esc(d.nickname)+'”':'';DF99.head(root,{name:d.name||_T('New character'),nick,chip:{t:I.name,c:I.color}});
  const v=k=>root.querySelector(`.df99pv [data-df99v="${k}"]`);const n=v('name');if(n&&n.textContent!==(d.name||''))n.textContent=d.name||'';
  const k=v('nick');if(k&&k.innerHTML!==nick)k.innerHTML=nick;const s=v('sub');const st=I.name+(d.city?' · '+d.city:'');if(s&&s.textContent!==st)s.textContent=st;
  const how=root.querySelector('.df99howl');if(how){const h=ch99How(d);if(how.innerHTML!==h)how.innerHTML=h}
  const mi=root.querySelector('[data-ch99mind]');if(mi){const t='🧠 '+ch99Mind();if(mi.textContent!==t)mi.textContent=t}
  DF99.checks(root,ch99Checks(d));ch99PvFill(root)}

/* ================= 3) THE LANISTA DESIGNER (Studio + Manager) ================= */
const LN99_SEL={studio:{name:'[data-lnf="name"]',nick:'[data-lnf="nick"]',ludus:'[data-lnf="ludus"]',city:'[data-lnf="city"]',color:'[data-lnf="color"]',bio:'[data-lnf="bio"]',bioBtn:'[data-lna="bio"]',pt:'data-lnpt',rlook:'[data-lna="rlook"]',save:'[data-lna="save"]',por:'#lnPortrait'},
  mgr:{name:'[data-nm="name"]',nick:'[data-nmx="nick"]',ludus:'[data-nm="ludus"]',city:'[data-nm="city"]',color:'[data-nm="color"]',bio:'[data-nmx="bio"]',bioBtn:'[data-nmxa="bio"]',pt:'data-nmpt',rlook:'[data-mg="nmlook"]',save:'[data-mg="nmgo"]',por:'#nmPortrait'}};
function ln99Data(mode){return mode==='mgr'?(typeof NEWMGR!=='undefined'?NEWMGR:null):(typeof ST!=='undefined'?ST.lnd:null)}
function ln99Checks(mode,c){const L=[[!!String(c.name||'').trim(),_T('Name')],[!!String(c.ludus||'').trim(),_T('Ludus')],[!!c.city,_T('City')]];
  if(mode==='mgr'&&!c.takeKey&&!c.sale&&typeof START_DIFF!=='undefined'){const D=START_DIFF[c.diff||'normal'];if(D)L.push([true,_T`${D.n} start`])}
  return L}
function ln99Flag(c){try{if(c&&c.flag&&typeof houseFlagURI==='function')return houseFlagURI(c.flag)}catch(e){}return ''}
/* ln99Frame(R, mode) — ONE layout for both: the Studio's form (mode 'studio') and Manager's new-career form (mode 'mgr') */
function ln99Frame(R,mode){const S=LN99_SEL[mode];const sg=[...R.querySelectorAll('.setup-grid')].find(g=>g.querySelector(S.name)&&g.querySelector('.lookgrid'));if(!sg)return false;
  const c=ln99Data(mode)||{};const cols=[...sg.children];const L=s=>df99Lab(sg,s);
  /* ① IDENTITY */
  const who=DF99.card(_T`🪪 The lanista`,_T`how the league addresses you`,'',[DF99.grid(2,[L(S.name),L(S.nick)])]);
  const ta=sg.querySelector(S.bio);const taL=ta&&ta.closest('label');if(ta)ta.setAttribute('rows','14');const wb=sg.querySelector(S.bioBtn);
  const sty=DF99.card(_T`📜 Story`,_T`your letters and the Annals quote it`,'',[ta,wb&&wb.closest('.mbtns')]);if(taL)taL.remove();
  let stc=null;const stl=[...sg.querySelectorAll('.card2')].find(x=>x.querySelector('[data-nmxa="savelan"]'));
  if(stl){stl.classList.remove('card2');stl.classList.add('df99stl');stl.removeAttribute('style');const b=stl.querySelector(':scope>b');if(b)b.remove();stc=DF99.card(_T`🎩 Studio lanistas`,_T`start from one you designed, or keep this one`,'',[stl])}
  /* ② PORTRAIT & COLOURS */
  const lg=sg.querySelector('.lookgrid');const F=f=>lg&&(lg.querySelector(`[${S.pt}="${f}"]`)||{closest:()=>null}).closest('label');
  const face=DF99.card(_T`🙂 Face`,'','',[DF99.grid(3,['skin','hair','hs','bs','eyes','smile','mark','face','fem'].map(F))]);
  const imp=sg.querySelector('[data-nmimport]');if(imp)DF99.put(face,imp.closest('label')||imp);
  const garb=DF99.card(_T`🧥 Garb & jewellery`,'','',[DF99.grid(2,['helm','garb','ear','neck'].map(F))]);
  const bdc=DF99.card(_T`🎨 Colours`,_T`backdrop · house colour`,'',[DF99.grid(2,[F('bg'),L(S.color)])]);
  const rl=sg.querySelector(S.rlook);const lookHd=df99El('div','',`<span>${_T`The same face designer as a Studio character — one face, everywhere.`}</span>`);
  if(rl){const m=rl.closest('.mbtns');if(m&&m.children.length===1)lookHd.appendChild(m);else lookHd.appendChild(rl)}
  if(lg)lg.remove();
  /* ③ HOUSE */
  const homeNote=[...sg.querySelectorAll('p.rc-sub')].find(p=>p.querySelector('b')&&!p.closest('details'));
  const lud=DF99.card(_T`🏛 The ludus`,'','',[DF99.grid(1,[L(S.ludus),L(S.city)]),homeNote]);
  const rs=sg.querySelector('label.rspick');const rsc=rs?DF99.card(_T`📚 Roster set`,_T`which creations are in this league`,'',[rs]):null;
  let flc=null;const fg=sg.querySelector('.flaggrid');if(fg){const fs=fg.previousElementSibling&&fg.previousElementSibling.matches('div.sect')?fg.previousElementSibling:null;
    flc=DF99.card(_T`🚩 House banner`,_T`masthead · league table · stands`,'df99flag',[fg]);const sh=fs&&fs.querySelector('button');if(sh)flc.querySelector('header').appendChild(sh);if(fs)fs.remove()}
  /* ④ TEMPERAMENT */
  const presets=[...sg.querySelectorAll('.presets')].find(p=>!p.closest('details'));const pw=sg.querySelector('.perswrap');
  const hints=[...sg.querySelectorAll('p.hint')].filter(p=>!p.closest('details'));
  const take=mode==='mgr'&&c.takeKey;const keepHint=take?hints.find(p=>!p.hidden&&p.textContent.trim()):null;
  const pc=DF99.card(_T`🎭 Start from a type`,'','',[presets]);const sl=DF99.card(_T`🎚 Temperament`,_T`seven sliders · 0–100`,'',[pw]);
  if(take){pc.hidden=true;sl.hidden=true}
  /* ⑤ START */
  let start=[];
  if(mode==='mgr'){const sd=sg.querySelector('.sdiff');const sdh=sd&&sd.previousElementSibling&&sd.previousElementSibling.matches('h4')?sd.previousElementSibling:null;if(sdh)sdh.remove();
    const startHint=hints.find(p=>p!==keepHint&&!p.hidden&&p.textContent.trim());
    const df=sd?DF99.card(_T`⚖ Starting difficulty`,'','',[sd,startHint]):(startHint?DF99.card(_T`⚖ The start`,'','',[startHint]):null);
    const hr=sg.querySelector('details.card2');let hrc=null;if(hr){hr.setAttribute('open','');hr.classList.remove('card2');hrc=DF99.card(_T`🏜 House rules`,_T`optional — baked in for the whole career`,'df99rules',[hr])}
    const saleNote=[...sg.querySelectorAll('p.rc-sub')].find(p=>p!==homeNote&&!p.closest('details')&&!p.closest('.df99card'));
    const sn=saleNote?DF99.card(_T`🏜 House rules`,'','',[saleNote]):null;
    start=[[df],[hrc||sn]]}
  else{const car=DF99.card(_T`🏟 Use in a new career`,_T`Manager mode starts from this lanista`,'',[df99El('p','rc-sub',_T`Saves this lanista, then opens Manager mode’s <b>Create your lanista</b> with the face, house and temperament filled in — pick the difficulty and house rules there.`),df99El('div','mbtns',`<button class="btn primary" type="button" data-ln99="career">${_T`🏛 Start a career with this lanista`}</button>`)]);
    start=[[car],[]]}
  /* save bar + list */
  const svb=sg.querySelector(S.save);const sv=svb&&svb.closest('.mbtns');
  const acts=[];if(mode==='studio'){const nb=sg.querySelector('[data-lna="new"]');const m=nb&&nb.closest('.mbtns');if(m){m.removeAttribute('style');m.classList.add('df99top');acts.push(m)}}
  const list=mode==='studio'?R.querySelector('.stlist'):null;
  sg.querySelectorAll('h4').forEach(h=>h.remove());
  /* preview */
  const por=sg.querySelector(S.por);if(por){por.removeAttribute('style');por.classList.add('df99lpor');[...por.children].forEach(ch=>{if(!ch.matches('.portrait,svg'))ch.remove()})}
  const fl=mode==='mgr'?(ln99Flag(c)||(()=>{const i=fg&&(fg.querySelector('.flagcell.on img')||fg.querySelector('.flagcell img'));return i?i.getAttribute('src'):''})()):'';
  const pvN=df99El('div','df99pvname',`<b data-df99v="name">${esc(c.name||'')}</b><span data-df99v="nick">${esc(c.nick||'')}</span><small>${_T`lanista of`}</small>`);
  const pvL=df99El('div','df99ludus',`<img data-df99v="flag" src="${esc(fl)}" alt="" ${fl?'':'hidden'}><div><b data-df99v="ludus">${esc(c.ludus||'')}</b><small data-df99v="city">🏠 ${esc(c.city||'')}</small></div>`);pvL.style.setProperty('--hc',c.color||'#c0433a');
  /* header text */
  let kick=_T`🎩 Lanista designer`,sub='';
  if(mode==='mgr'){let h4=sg.previousElementSibling;if(!h4||h4.tagName!=='H4')h4=null;const rsub=h4&&h4.querySelector('.rc-sub');sub=rsub?rsub.innerHTML:'';
    kick=c.takeKey?_T`🎩 Take over a house · your lanista`:c.sale?_T`🎩 A new house · your lanista`:_T`🎩 New career · your lanista`;if(h4)h4.remove()}
  const tabs=[{k:'id',t:_T`Identity`,s:_T`name · epithet · story`,cols:[[who,stc],[sty]]},
    {k:'look',t:_T`Portrait & colours`,s:_T`face · house colour`,lay:'look',head:lookHd,cols:[[face],[garb,bdc]]},
    {k:'house',t:_T`House`,s:mode==='mgr'?_T`ludus · city · banner`:_T`ludus · city`,cols:[[lud,rsc],[flc]]},
    {k:'mind',t:_T`Temperament`,s:_T`how rivals read you`,cols:[[pc,keepHint?DF99.card(_T`🎭 Temperament`,'','',[keepHint]):null],[sl]]},
    {k:'start',t:_T`Start`,s:mode==='mgr'?_T`difficulty · house rules`:_T`use in a new career`,cols:start}];
  const root=DF99.build({id:mode==='mgr'?'lanM':'lanS',cls:'ln99 ln99'+mode,kicker:kick,name:c.name||'',nick:c.ludus?_T`of ${esc(c.ludus)}`:'',sub,chip:{t:c.city||'',c:c.color||'#c0433a'},acts,tabs,
    side:list?{k:'list',t:_T`📜 Your lanistas · ${(CUSTOM.lanistas||[]).length}`,nodes:[list]}:null,preview:[por,pvN,pvL],checks:ln99Checks(mode,c),save:[sv]});
  df99More(root,sg,cols);sg.replaceWith(root);return true}
function ln99Live(){for(const root of document.querySelectorAll('.df99.ln99')){const mode=root.classList.contains('ln99mgr')?'mgr':'studio';const c=ln99Data(mode);if(!c)continue;
  DF99.head(root,{name:c.name||'',nick:c.ludus?_T`of ${esc(c.ludus)}`:'',chip:{t:c.city||'',c:c.color||'#c0433a'}});
  const v=k=>root.querySelector(`.df99pv [data-df99v="${k}"]`);const tx=(k,t)=>{const e=v(k);if(e&&e.textContent!==t)e.textContent=t};
  tx('name',c.name||'');tx('nick',c.nick||'');tx('ludus',c.ludus||'');tx('city','🏠 '+(c.city||''));
  const lb=root.querySelector('.df99pv .df99ludus');if(lb)lb.style.setProperty('--hc',c.color||'#c0433a');
  if(mode==='mgr'){const f=v('flag'),u=ln99Flag(c);if(f&&u&&f.getAttribute('src')!==u){f.setAttribute('src',u);f.hidden=false}}
  DF99.checks(root,ln99Checks(mode,c))}}
/* the Studio's "Use in a new career": save, close the Studio, open Manager's Create your lanista from it */
const LN99={pend:null};
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-ln99="career"]');if(!b||typeof ST==='undefined'||!ST.lnd)return;e.stopPropagation();e.preventDefault();
  const sv=document.querySelector('#studio [data-lna="save"]');if(sv&&typeof lanistaStudioClick==='function')await lanistaStudioClick(sv,()=>{});
  if(!ST.lnd.id)return;LN99.pend=ST.lnd.id;if(typeof CUR_MODAL!=='undefined'&&CUR_MODAL&&CUR_MODAL.done)CUR_MODAL.done('ln99')},true);
if(!DF99.off&&typeof openStudio==='function'){const base=openStudio;openStudio=async function(){const r=await base.apply(this,arguments);try{const id=LN99.pend;LN99.pend=null;
  const x=id&&(CUSTOM.lanistas||[]).find(l=>l.id===id);if(x&&typeof openManager==='function'){if(MGR.world&&!MGR.world.tutorial){try{await saveWorld(true)}catch(err){}}MGR.world=null;MGR.sale=null;
    NEWMGR={name:x.name,ludus:x.ludus,city:LANISTA_CITIES().includes(x.city)?x.city:LANISTA_CITIES()[0],color:x.color,p:{...x.p},portrait:JSON.parse(JSON.stringify(x.portrait||{})),nick:x.nick||'',bio:x.bio||'',lanId:x.id};
    MGR.view='create';DF99.jump=Date.now();setTimeout(()=>{openManager()},60)}}catch(e){console.error(e)}return r}}

/* ================= wiring: the wrappers that put the frame in ================= */
if(!DF99.off&&typeof studioHTML==='function'){const base=studioHTML;studioHTML=function(){const h=base.apply(this,arguments);try{
  if(ST.tab==='chars'&&ST.view==='edit'&&ST.draft&&/id="stName"/.test(h))return df99Xform(h,ch99Frame);
  if(ST.tab==='lanistas'&&/data-lnf="name"/.test(h))return df99Xform(h,R=>ln99Frame(R,'studio'))}catch(e){console.error(e)}return h}}
if(!DF99.off&&typeof mgrHTML==='function'){const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  if(!MGR.world&&MGR.view==='create'&&typeof NEWMGR!=='undefined'&&NEWMGR&&/data-mg="nmgo"/.test(h))return df99Xform(h,R=>ln99Frame(R,'mgr'))}catch(e){console.error(e)}return h}}
{let raf=0;const kick=e=>{const t=e&&e.target;if(t&&t.closest&&!t.closest('.df99'))return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{try{ch99Live();ln99Live()}catch(err){console.error(err)}})};
 document.addEventListener('input',kick);document.addEventListener('change',kick);document.addEventListener('click',e=>{kick(e);setTimeout(()=>kick(),350)})}
/* the 3D token card is replaced in place after a render/save (222 t93Patch) — mirror it into the preview */
{let t=0;new MutationObserver(m=>{if(t||!document.getElementById('studio')||!document.querySelector('.df99.ch99'))return;if(!m.some(r=>r.target.closest&&r.target.closest('.df99.ch99 .ch99tkB,.df99.ch99 .ch99cls')))return;t=setTimeout(()=>{t=0;ch99PvFill(document.querySelector('.df99.ch99'))},60)}).observe(document.body,{childList:true,subtree:true})}

(()=>{const st=document.createElement('style');st.textContent=`
.df99{display:grid;gap:12px;min-width:0}
.df99 [hidden]{display:none!important}
.df99 .df99head{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:10px 14px;border:1px solid var(--line2);border-radius:10px;background:linear-gradient(90deg,rgba(214,171,76,.10),rgba(0,0,0,0) 60%),var(--panel)}
.df99 .df99who{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;flex:1;min-width:0}
.df99 .df99kick{font:600 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--dim);width:100%}
.df99 .df99nm{font:400 26px var(--serif,Georgia),serif;color:var(--gold2);min-width:0;overflow-wrap:anywhere}
.df99 .df99nk{color:var(--muted);font-style:italic}
.df99 .df99sub{width:100%;font-size:12.5px;color:var(--dim)}
.df99 .df99chip{font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:99px;border:1px solid var(--cc);color:var(--bone);background:color-mix(in srgb,var(--cc) 30%,transparent);white-space:nowrap}
.df99 .df99acts{display:flex;gap:8px;flex-wrap:wrap}
.df99 .df99acts .mbtns{margin:0!important;display:flex!important;flex-wrap:nowrap;gap:8px;grid-template-columns:none!important;justify-content:flex-end}
.df99 .df99acts .btn,.df99 .df99svb .btn{width:auto!important;flex:none!important;white-space:nowrap}
.df99 .df99tabs{display:flex;gap:6px;align-items:stretch;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--line2);scroll-snap-type:x proximity}
.df99 .df99tabs::-webkit-scrollbar{display:none}
.df99 .df99tabs [data-df99t]{flex:none}
.df99 .df99tabs [data-df99t]:not(.df99side){display:grid;grid-template-columns:auto 1fr;column-gap:8px;text-align:left;padding:8px 16px 8px 12px;border:1px solid var(--line2);border-bottom:none;border-radius:8px 8px 0 0;background:var(--panel);color:var(--muted);font:600 15px inherit;cursor:pointer;white-space:nowrap;position:relative;top:1px;scroll-snap-align:start}
.df99 .df99tabs [data-df99t] i{grid-row:span 2;font-style:normal;font-size:21px;color:var(--dim);align-self:center}
.df99 .df99tabs [data-df99t] small{font:400 11px var(--mono);color:var(--dim)}
.df99 .df99tabs [data-df99t].on:not(.df99side){background:var(--panel2);color:var(--gold2);border-color:var(--gold);box-shadow:inset 0 2px 0 var(--gold)}
.df99 .df99tabs [data-df99t].on i{color:var(--gold)}
.df99 .df99sp{flex:1}
.df99 .df99side{align-self:center;background:none;border:1px dashed var(--line2);color:var(--muted);border-radius:99px;padding:5px 12px;white-space:nowrap;cursor:pointer;font:inherit}
.df99 .df99side.on{border-style:solid;border-color:var(--gold);color:var(--gold2)}
.df99 .df99body{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:14px;align-items:start}
.df99[data-tab="list"] .df99body{grid-template-columns:minmax(0,1fr)}.df99[data-tab="list"] .df99pv{display:none}
.df99 .df99main{min-width:0}
.df99 .df99pane{display:grid;gap:12px;align-content:start;min-width:0}
.df99 .df99two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.df99 .df99look{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}
.df99 .df99one{grid-template-columns:minmax(0,1fr)}
.df99 .df99col{display:grid;gap:12px;align-content:start;min-width:0}
.df99 .df99panehd{grid-column:1/-1;display:flex;align-items:center;gap:10px;justify-content:space-between;color:var(--muted);font-size:13px;flex-wrap:wrap}
.df99 .df99panehd .mbtns{margin:0}
.df99 .df99card{background:var(--panel2);border:1px solid var(--line2);border-radius:10px;overflow:hidden;min-width:0}
.df99 .df99card>header{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid var(--line2);background:rgba(0,0,0,.18)}
.df99 .df99card>header b{font:600 12px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.df99 .df99card>header span{font-size:12px;color:var(--dim)}
.df99 .df99card>header .btn{margin-left:auto}
.df99 .df99in{padding:10px 12px;display:grid;gap:10px;min-width:0}
.df99 .df99g{margin:0!important;gap:8px 10px!important}
.df99 .df99g label{min-width:0}.df99 .df99g select,.df99 .df99g input:not([type=color]){width:100%;min-width:0}
.df99 .df99g input[type=color]{width:100%;height:36px}
.df99 .df99in>.mbtns{margin:0}
.df99 textarea{width:100%;resize:vertical;min-height:180px}
.df99 .bgflags{display:flex;flex-wrap:wrap;gap:4px}
.df99 .df99tokrow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.df99 .df99tk{display:grid;gap:8px;justify-items:center;align-content:start;padding:10px;border:1px solid var(--line2);border-radius:8px;background:rgba(0,0,0,.15);min-width:0}
.df99 .df99tkh{justify-self:stretch;text-align:center;font:600 10px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.df99 .df99tk>label{margin:0;justify-self:stretch}.df99 .df99tk select{width:100%}
.df99 .df99tk .tkfig svg{max-height:96px}
.df99 .df99tk .t93card{margin:0;border:none;background:none;padding:0;box-shadow:none}.df99 .df99tk .t93card>.sect{display:none}
.df99 .df99tk .t93row{flex-direction:column}.df99 .df99tk .t93ctl{display:grid;gap:6px;justify-items:center}.df99 .df99tk .t93ctl small{font-size:11px}
.df99 .df99clsrow{display:grid!important;grid-template-columns:160px minmax(0,1fr);gap:14px;align-items:start}.df99 .df99clsrow>span{display:block}
.df99 .clscard74{width:150px!important;height:210px!important}
.df99 .df99facts{display:grid;gap:6px;border-top:1px solid var(--line2);padding-top:10px}.df99 .df99facts>div{display:grid;grid-template-columns:90px 1fr;gap:8px;font-size:13px}
.df99 .df99facts b{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--dim);padding-top:2px}.df99 .df99facts span{color:var(--bone)}
.df99 .df99rat .st95gl{display:flex;flex-wrap:wrap;gap:6px}.df99 .df99rat .st95chip{white-space:nowrap}
.df99 .df99rat .st95stats{border:none!important;padding:0!important;background:none!important;box-shadow:none!important;position:static!important}
.df99 .ch99mind .perspre{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0}
.df99 .perswrap{grid-template-columns:1fr!important;gap:10px!important;margin:0!important}
.df99 .df99mindchip{display:grid;padding:10px 12px;border:1px solid var(--gold);border-radius:8px;color:var(--gold2);font-weight:600}
.df99 .df99mindchip small{font:400 11px var(--mono);color:var(--dim)}
.df99 ul.df99howl{margin:0;padding-left:18px;display:grid;gap:6px;color:var(--muted);font-size:13px}.df99 ul.df99howl b{color:var(--bone)}
.df99 .df99pv{position:sticky;top:8px;display:grid;gap:10px;justify-items:center;padding:12px;border:1px solid var(--gold);border-radius:12px;background:radial-gradient(120% 80% at 50% 0,rgba(214,171,76,.14),transparent 60%),var(--panel);min-width:0}
.df99 .df99pvh{justify-self:stretch;font:600 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.df99 .df99pv #stPortrait,.df99 .df99pv .df99lpor{margin:0;text-align:center}
.df99 .df99pv .portrait{width:200px!important;height:280px!important;box-shadow:0 6px 18px rgba(0,0,0,.5);border-radius:8px}
.df99 .df99pvname{text-align:center;display:grid;gap:1px;min-width:0}.df99 .df99pvname b{font:400 20px var(--serif,Georgia),serif;color:var(--bone);overflow-wrap:anywhere}
.df99 .df99pvname span{color:var(--muted);font-style:italic;font-size:13px}.df99 .df99pvname small{color:var(--dim);font:11px var(--mono)}
.df99 .df99pvtok{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;justify-self:stretch;border-top:1px solid var(--line2);padding-top:10px}
.df99 .df99pvtok>div{display:grid;justify-items:center;gap:3px}.df99 .df99pvtok small{font:10px var(--mono);color:var(--dim);text-transform:uppercase;letter-spacing:.08em}
.df99 .df99pvt{width:64px;height:84px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.df99 .df99pvt>*{max-height:100%}
.df99 .df99pvt .tkfig svg{max-height:84px}.df99 .df99pvt .t93none{display:grid;place-items:center;width:56px;height:76px;border:1px dashed var(--line2);border-radius:6px;color:var(--dim)}
.df99 .df99pvt img,.df99 .df99pvt canvas,.df99 .df99pvt svg{max-height:84px;max-width:64px}
.df99 .df99pvcard .cimg,.df99 .df99pvcard .clscard74{width:60px!important;height:84px!important}
.df99 .df99ludus{justify-self:stretch;display:flex;gap:10px;align-items:center;padding:8px;border-top:1px solid var(--line2);border-left:4px solid var(--hc)}
.df99 .df99ludus img{width:70px;height:46px;object-fit:cover;border-radius:3px}
.df99 .df99ludus b{display:block;color:var(--gold2);font:400 17px var(--serif,Georgia),serif}.df99 .df99ludus small{color:var(--dim);font:11px var(--mono)}
.df99 .df99save{position:sticky;bottom:0;display:flex;gap:12px;align-items:center;justify-content:flex-end;padding:10px 14px;border:1px solid var(--line2);border-radius:10px;background:rgba(20,15,11,.94);backdrop-filter:blur(4px);z-index:2}
.df99 .df99chk{flex:1;font:12px var(--mono);display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center}.df99 .df99chk .ok{color:var(--hp)}.df99 .df99chk .no{color:#e0796b}.df99 .df99chk i{color:var(--dim);font-style:normal}
.df99 .df99svb{margin:0!important;display:flex!important;flex-direction:row;gap:8px}.df99 .df99svb .btn{min-width:170px}
.df99 .df99list .stlist{margin:0}
.df99 .df99more .df99in>*{margin:0}
.df99.ln99 .flaggrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.df99.ln99 .flaggrid img{width:100%;height:auto}
.df99.ln99 .presets{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0!important}
.df99.ln99 .sdiff{display:grid;grid-template-columns:repeat(3,1fr)}
.df99.ln99 .df99rules details>summary{display:none}.df99.ln99 .df99rules details>div{display:grid;gap:6px}
.df99.ln99 .df99stl{display:grid!important;gap:8px;padding:0;margin:0}
.df99.ln99 .df99stl select{width:100%}
@media (max-width:1180px){.df99 .df99body{grid-template-columns:minmax(0,1fr) 240px}.df99 .df99pv .portrait{width:170px!important;height:238px!important}}
@media (max-width:700px){
 .df99 .df99body{grid-template-columns:1fr}
 .df99 .df99pv{order:-1;position:static;grid-template-columns:auto 1fr;justify-items:start;align-items:center;padding:8px;column-gap:12px}
 .df99 .df99pvh{display:none}.df99 .df99pv .portrait{width:86px!important;height:120px!important}
 .df99 .df99pv #stPortrait,.df99 .df99pv .df99lpor{grid-row:span 2}
 .df99 .df99pvname{grid-column:2;grid-row:1;text-align:left}
 .df99 .df99pvtok{grid-column:2;grid-row:2;border:none;padding:0;grid-template-columns:repeat(3,auto)}.df99 .df99ludus{grid-column:2;grid-row:2;border-top:none}
 .df99 .df99pvt{width:44px;height:58px}.df99 .df99pvt .tkfig svg{max-height:58px}.df99 .df99pvt .t93none{width:40px;height:54px}.df99 .df99pvcard .cimg,.df99 .df99pvcard .clscard74{width:42px!important;height:58px!important}
 .df99 .df99ludus img{width:50px;height:34px}
 .df99 .df99two,.df99 .df99look,.df99 .df99tokrow{grid-template-columns:1fr}
 .df99 .df99tabs [data-df99t]:not(.df99side){padding:6px 10px;font-size:13px;display:flex;gap:6px;align-items:center}.df99 .df99tabs [data-df99t] small{display:none}.df99 .df99tabs [data-df99t] i{font-size:15px}
 .df99 .df99tabs{gap:3px}.df99 .df99side{padding:4px 10px;font-size:12px}
 .df99 .df99head{padding:8px 10px}.df99 .df99nm{font-size:20px}
 .df99 .df99acts{width:100%}.df99 .df99acts .mbtns{flex-wrap:wrap!important;justify-content:flex-start}
 .df99 .df99g{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 .df99 .df99clsrow{grid-template-columns:1fr}
 .df99 .df99chk{display:none}.df99 .df99save{justify-content:stretch;padding:8px}.df99 .df99svb{flex:1}.df99 .df99svb .btn{min-width:0;flex:1!important}
 .df99.ln99 .flaggrid{grid-template-columns:repeat(4,1fr)}.df99.ln99 .presets{grid-template-columns:1fr}
}`;document.head.appendChild(st)})();
