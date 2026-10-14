/* 335-v102studio — v1.02 D · THE DESIGNERS IN ONE FRAME (his note: "the class designer and the other tabs should look like the character designer").
   The Classes, Beasts, Cohorts, Tokens, Tournament, Invitationals, Editors and Spectators designers move into 262's DF99 frame: header (kicker ·
   name · chip · New / Randomize), large numbered tabs, cards with a gold header line, the live preview pinned on the right, the sticky bottom bar
   with the readiness checks + Save, and "📜 Your … · N" as the tab at the right of the row (the lists, system sets and starters).
   HOW: like 262 — a studioHTML wrapper re-homes the designer's OWN finished HTML in an inert <template> (df99Xform) BEFORE it is painted: the real
   nodes move (ids, data-*, values, handlers' selectors stay; the delegated handlers keep working), the string is serialized back. A redraw builds the
   same frame on the same remembered tab (localStorage flavius_df99tab, keys 'd102<tab>'), so an option change paints once — never a second pass.
   ONE generic builder (d102Frame) driven by a small spec per designer (D102_SPEC): where the designer lives (sg), the kicker, the header name/chip
   readers, how the form column splits into cards (headings h4 / h3.sxh3 / div.sect / framed .card2 boxes become cards; `split` cuts a long
   formgrid at a control; `grab` gives a block its own card), which card goes in which tab (`tabs[].m` = a title pattern), what goes in the preview
   (`pv` = the left column, minus its button rows → header and its pickers → cards; `pvTake` = blocks pulled from the form), and the checks.
   110's post-paint tidies (sx77 steps, sp77 heads) are pre-empted (formgrids marked data-s77, cards titled here); 247's st98 tabs are switched off
   for these tabs. The Editors tab keeps its lock card while locked (no frame). Tests: tv102d. Kill switch localStorage flavius_v102doff=1. */
const D102={off:(()=>{try{return localStorage.getItem('flavius_v102doff')==='1'}catch(e){return false}})(),n:0};
const D102_ON=['classes','npcs','cohorts','tokens','tourneys','specials','sponsors','spect'];
if(!D102.off&&typeof ST98_ON!=='undefined')for(const k of D102_ON){const i=ST98_ON.indexOf(k);if(i>=0)ST98_ON.splice(i,1)}
const d102El=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
/* the title of a heading / box head: its own text + b/strong/em, never the sub line */
function d102Title(t){if(!t)return '';let s='';for(const n of t.childNodes){if(n.nodeType===3)s+=n.textContent;else if(n.nodeType===1&&/^(B|STRONG|EM)$/.test(n.tagName))s+=n.textContent}
  s=s.replace(/\s+/g,' ').trim();return s||t.textContent.replace(/\s+/g,' ').trim()}
const d102Sub=t=>{const s=t&&t.querySelector(':scope>.rc-sub');return s?s.textContent.replace(/\s+/g,' ').trim():''};
/* the intro paragraph → one short line + ⓘ with the rest (like 110's st77Intro, done before paint) */
function d102Intro(p){if(!p)return '';const badge=p.querySelector('.cbadge');const txt=p.textContent.replace(/\s+/g,' ').trim();if(!txt)return '';
  const m=txt.length>150&&txt.match(/^(.{30,170}?[.!?:—])\s/);const first=m?m[1].replace(/[—:]$/,'').trim()+(/[.!?]$/.test(m[1])?'':'.'):txt;const rest=m?txt.slice(m[0].length).trim():'';
  return `${esc(first)}${rest?` <span class="qi" data-tip="${esc(rest)}">ⓘ</span>`:''}${badge?' '+badge.outerHTML:''}`}
/* a save row (Save / Add to the crowd …) */
const d102Save=el=>el&&el.matches&&el.matches('.mbtns')&&[...el.querySelectorAll('button')].some(b=>/save|toklibnew/i.test(Object.values(b.dataset).join(' ')));
/* the box title of a framed block (.card2 with <b> or div.sect first) — never one that holds a live counter (ids / data-*) */
function d102BoxHead(el){if(!el.matches('div.card2,div.x92')||el.matches('.budgetcard,.lockcard'))return null;const f=el.firstElementChild;if(!f)return null;
  if(!((f.tagName==='B')||f.matches('div.sect')))return null;if(f.querySelector('[id],input,select,button'))return null;if(!el.querySelector('input,select,textarea,button'))return null;return f}
/* split a formgrid at the labels that hold the given controls ([[selector,title]]) and at its own div.sect / .sp91sect heads */
function d102Split(fg,spec){const kids=[...fg.children];const cuts=new Map();
  for(const [sel,t] of spec||[]){const x=fg.querySelector(sel);if(!x)continue;let l=x;while(l.parentElement&&l.parentElement!==fg)l=l.parentElement;if(l.parentElement===fg)cuts.set(l,t)}
  for(const k of kids)if(k.matches('div.sect,div.sp91sect'))cuts.set(k,{head:k});
  if(!cuts.size)return [{t:null,el:fg}];
  const out=[];let cur={t:null,el:fg,first:true};out.push(cur);const keep=[];
  for(const k of kids){const c=cuts.get(k);if(c){const cl=fg.cloneNode(false);cl.removeAttribute('id');
      if(c.head){cur={t:d102Title(c.head),sub:d102Sub(c.head),el:cl,btns:[...c.head.querySelectorAll('button')]};k.remove();out.push(cur);continue}
      cur={t:c,el:cl};out.push(cur)}
    if(!cur.first)cur.el.appendChild(k)}
  return out.filter(p=>p.el.children.length||p.btns&&p.btns.length)}
/* d102Secs — the form column's blocks → sections [{t,sub,btns,nodes,box}] ; save rows go to `save` */
function d102Secs(nodes,S,save){const secs=[];let cur=null,base=null;
  const start=(t,sub,btns,box)=>{cur={t,sub:sub||'',btns:btns||[],nodes:[],box:!!box};secs.push(cur);if(!box)base=cur;return cur};
  const add=n=>{if(!cur)start(S.first||_T('Basics'));cur.nodes.push(n)};
  for(const el of nodes){if(!el||el.nodeType!==1)continue;
    if(d102Save(el)){save.push(el);continue}
    const g=(S.grab||[]).find(([sel])=>el.matches(sel));if(g){start(g[1],g[2]||'',[],true);add(el);cur=base;continue}
    if(el.matches('h4,h3.sxh3')){start(d102Title(el),d102Sub(el));el.remove();continue}
    if(el.matches('div.sect,div.sp91sect')){start(d102Title(el),d102Sub(el),[...el.querySelectorAll('button')]);el.remove();continue}
    const bh=d102BoxHead(el);if(bh){let sub=d102Sub(bh);const s2=bh.nextElementSibling;if(!sub&&s2&&s2.matches('span.rc-sub')){sub=s2.textContent.replace(/\s+/g,' ').trim();s2.remove()}
      const t=(S.titles&&S.titles[d102Title(bh)])||d102Title(bh);const btns=[...bh.querySelectorAll('button')];bh.remove();el.classList.add('d102flat');start(t,sub,btns,true);add(el);cur=base;continue}
    if(el.matches('.formgrid')){if(S.s77)el.dataset.s77='1';const parts=d102Split(el,S.split);
      for(const p of parts){if(p.t)start(p.t,p.sub,p.btns);if(p.el.children.length)add(p.el)}continue}
    add(el)}
  return secs.filter(s=>s.nodes.length||s.btns.length)}
const d102W=c=>c.querySelectorAll('label,button,textarea,.slider,select,tr').length+2;
/* lay a tab's cards out: full-width cards break the flow, the rest is balanced into two columns (order kept inside each) */
function d102Lay(pane,cards,lay,big){if(lay==='one'){cards.forEach(c=>pane.appendChild(c));return}
  let seg=[];const flush=()=>{if(!seg.length)return;if(seg.length===1){const a=DF99.col([seg[0]]);a.classList.add('d102wide');pane.appendChild(a);seg=[];return}
    const A=[],B=[];let wa=0,wb=0;for(const c of seg){const w=d102W(c);if(wa<=wb){A.push(c);wa+=w}else{B.push(c);wb+=w}}pane.appendChild(DF99.col(A));pane.appendChild(DF99.col(B));seg=[]};
  for(const c of cards){if(big&&big.test(c.dataset.d102t||'')){flush();c.classList.add('d102wide');pane.appendChild(c)}else seg.push(c)}flush()}
const d102Txt=(R,sel)=>{const e=sel&&R.querySelector(sel);if(!e)return '';if(e.tagName==='SELECT'){const o=e.selectedOptions&&e.selectedOptions[0]||e.options&&e.options[e.selectedIndex];return o?o.textContent.trim():''}return String(e.value||'').trim()};
const d102Val=(R,sel)=>{const e=sel&&R.querySelector(sel);return e?String(e.value||'').trim():''};
/* ================= the specs ================= */
const D102_SPEC={
 classes:{kick:()=>_T`🎭 Class designer`,nameSel:'input[data-f="name"]',blank:()=>_T('New class'),
   chip:R=>({t:d102Txt(R,'select[data-f="city"]'),c:d102Val(R,'input[data-f="color"]')||'#c9a44a'}),
   pvTake:['.budgetcard'],leftCards:[['#clsTpl',()=>_T`📜 Start from a printed class`,()=>_T`copies its loadout`,'id']],
   tabs:()=>[{k:'id',t:_T`Basics`,s:_T`name · ability · weakness`,m:/^$/},{k:'kit',t:_T`Weapons & armor`,s:_T`hands · head to legs`,m:/^(Weapons|Armor)/i,big:/^Armor/i},
     {k:'purse',t:_T`Purse & hand`,s:_T`coin · keys · CF · items`,m:/purse|favor|hand/i},{k:'lore',t:_T`Lore`,s:_T`who fights this way`,m:/^Lore/i,lay:'one'}],
   first:()=>_T`🪪 Identity`,titles:{},list:()=>_T`📜 Your classes · ${(CUSTOM.classes||[]).length}`,
   checks:R=>{const d=(typeof ST!=='undefined'&&ST.draft)||{};const L=[[!!d102Val(R,'input[data-f="name"]'),_T('Name')]];
     try{if(typeof classCost==='function'&&typeof CLS_BUDGET!=='undefined'){const c=classCost(d);L.push([c<=CLS_BUDGET||!!d.sandbox,c<=CLS_BUDGET?_T`Budget ${c}/${CLS_BUDGET}`:d.sandbox?_T`Sandbox · ${c} points`:_T`Over budget (${c}/${CLS_BUDGET})`])}}catch(e){}return L}},
 npcs:{sgSel:'#stNpcName',kick:()=>_T`🐾 Beast designer`,nameSel:'#stNpcName',blank:()=>_T('New beast'),
   chip:R=>({t:d102Txt(R,'select[data-f="kindKey"]'),c:d102Val(R,'input[data-f="color"]')||'#6a8a3a'}),
   split:()=>[['[data-f="hp"]',_T`📊 Stats`]],grab:()=>[['.st82blk',_T`🎲 Behaviour states`,_T`how it fights as it bleeds`],['.nc82des',_T`🃏 Its card`,_T`front and back`]],
   leftCards:[['[data-f="tokenRef"]',()=>_T`🗿 Board token`,()=>_T`the figure on the sand`,'look']],
   tabs:()=>[{k:'basics',t:_T`Basics`,s:_T`kind · name · stats`,m:/^$|Stats/},{k:'fight',t:_T`Behaviour`,s:_T`zone · states`,m:/zone|Behaviour/i,big:/Behaviour/i},
     {k:'look',t:_T`Look`,s:_T`face · token · round`,m:/face|round token|Board token/i},{k:'card',t:_T`Arena card`,s:_T`front and back`,m:/card/i,lay:'one'}],
   first:()=>_T`🐾 The beast`,list:()=>_T`📜 Your beasts · ${(CUSTOM.npcs||[]).length}`,
   checks:R=>[[!!d102Val(R,'#stNpcName'),_T('Name')],[!!d102Val(R,'select[data-f="kindKey"]'),_T('Kind')]]},
 cohorts:{sgSel:'[data-pxf="name"]',kick:()=>_T`🤝 Cohort designer`,nameSel:'input[data-pxf="name"]',blank:()=>_T('New cohort'),
   chip:R=>({t:d102Txt(R,'select[data-pxf="type"]'),c:'#b08a3a'}),split:()=>[['[data-pxm="0"]',_T`👥 The pair`],['[data-pxf="blurb"]',_T`📜 Words`]],
   tabs:()=>[{k:'pair',t:_T`The cohort`,s:_T`name · bond · members`,m:/./}],first:()=>_T`🪪 Identity`,
   list:()=>_T`📜 Your cohorts · ${(CUSTOM.pairings||[]).length}`,
   checks:R=>{const m=[...R.querySelectorAll('select[data-pxm]')].filter(s=>s.value).length;return [[!!d102Val(R,'input[data-pxf="name"]'),_T('Name')],[m>=2,_T`Members ${m}/2`]]}},
 tokens:{sgSel:'#tokTarget',kick:()=>_T`🗿 Token designer`,name:R=>d102Txt(R,'#tokTarget'),blank:()=>_T('Token'),chip:()=>({t:_T('figure'),c:'#8a7a5a'}),
   split:()=>[['[data-tkf="face"]',_T`🙂 Face & hair`],['[data-tkf="skin"]',_T`🎨 Colours & size`]],grab:()=>[['.toklineup',_T`The lineup`]],
   leftCards:[['#tokTarget',()=>_T`🎯 The token you are editing`,()=>_T`pick a figure, a character, a beast or a library token`,'body']],
   tabs:()=>[{k:'body',t:_T`Figure`,s:_T`body · gear`,m:/^$|Figure|token you/i},{k:'face',t:_T`Face & colours`,s:_T`head · paint · size`,m:/Face|Colours/i},
     {k:'sculpt',t:_T`Sculpt`,s:_T`shapes on the preview`,m:/Sculpt/i,lay:'one'},{k:'line',t:_T`States & lineup`,s:_T`battle states · all figures`,m:/Battle|lineup/i,lay:'one'}],
   first:()=>_T`🧍 Body & gear`,checks:R=>[[!!d102Txt(R,'#tokTarget'),_T`Editing: ${d102Txt(R,'#tokTarget')}`]]},
 tourneys:{sgSel:'[data-tnf="name"]',kick:()=>_T`🏆 Tournament designer`,nameSel:'input[data-tnf="name"]',blank:()=>_T('New tournament'),
   chip:R=>{const b=R.querySelector('[data-tnsize].on');return {t:b?_T`${b.dataset.tnsize} seats`:'',c:'#c9a44a'}},
   split:()=>[['[data-tnf="evMode"]',_T`🏟 Events & prizes`],['[data-tnf="opp0"]',_T`⚔ Invited opponents`],['[data-tnf="blurb"]',_T`📜 Words`]],
   tabs:()=>[{k:'basics',t:_T`Basics`,s:_T`name · events · prizes`,m:/^$|Identity|Events|Words/i},{k:'field',t:_T`The bracket`,s:_T`opponents · first round`,m:/opponents|first round/i,big:/first round/i}],
   first:()=>_T`🪪 Identity`,list:()=>_T`📜 Your tournaments · ${(CUSTOM.tourneys||[]).length}`,
   checks:R=>{const s=[...R.querySelectorAll('select[data-tns]')];const f=s.filter(x=>x.value).length;return [[!!d102Val(R,'input[data-tnf="name"]'),_T('Name')],[true,_T`${f} of ${s.length} seats chosen`]]}},
 specials:{sgSel:'[data-sxf="name"]',kick:()=>_T`⭐ Invitational designer`,nameSel:'input[data-sxf="name"]',blank:()=>_T('New invitational'),s77:1,
   chip:R=>({t:d102Txt(R,'select[data-sxf="freq"]'),c:'#c9a44a'}),
   split:()=>[['[data-sxf="name"]',_T`✉ The invitation`],['[data-sxf="format"]',_T`👥 The field`],['[data-sxf="purse"]',_T`💰 Purse & fame`],['[data-sxf="blurb"]',_T`📜 Words`]],
   titles:{'The invitational':_T('🏟 Arena & trophy'),'① Arena & trophy':_T('🏟 Arena & trophy')},
   tabs:()=>[{k:'inv',t:_T`The invitation`,s:_T`arena · trophy · name`,m:/^$|Arena|invitation/i},{k:'field',t:_T`Field & purse`,s:_T`who comes · what it pays`,m:/field|Purse/i},
     {k:'words',t:_T`Words`,s:_T`the invitation's text`,m:/Words/i,lay:'one'}],
   first:()=>_T`🏟 Arena & trophy`,list:()=>_T`📜 Your invitationals · ${(CUSTOM.specials||[]).length}`,
   checks:R=>[[!!d102Val(R,'input[data-sxf="name"]'),_T('Name')],[!!d102Val(R,'select[data-sxf="ev"]'),_T('Arena')]]},
 sponsors:{sgSel:'[data-sonf="name"]',sg:'.trstudio',kick:()=>_T`🎭 Editor designer`,nameSel:'input[data-sonf="name"]',blank:()=>_T('New editor'),
   chip:R=>({t:d102Txt(R,'select[data-sonf="voice"]'),c:d102Val(R,'input[data-sonf="gem"]')||'#c9a44a'}),
   split:()=>[['[data-sonf="skin"]',_T`🙂 Face`],['[data-sonf="robe"]',_T`🧥 Robe & colours`],['[data-sonf="voice"]',_T`🗣 Voice`]],
   tabs:()=>[{k:'id',t:_T`Identity & voice`,s:_T`name · title · catchphrases`,m:/^$|Identity|Voice/i},{k:'face',t:_T`Face`,s:_T`skin · hair · jewelry`,m:/Face|Jewel/i},
     {k:'robe',t:_T`Robe & box`,s:_T`colours · the frame`,m:/Robe|box/i}],
   first:()=>_T`🪪 Identity`,list:()=>_T`📜 Your editors · ${(CUSTOM.sponsors||[]).length}`,
   checks:R=>[[!!d102Val(R,'input[data-sonf="name"]'),_T('Name')]]},
 spect:{sgSel:'#spName',kick:()=>_T`👥 Spectator designer`,nameSel:'#spName',blank:()=>_T('New regular'),s77:1,
   chip:R=>({t:(d102Txt(R,'select[data-f="@sptaste"]').split(' — ')[0]||''),c:'#7a8aa8'}),
   split:()=>[['[data-f="@sptaste"]',_T`🎭 Personality`],['[data-f="@spskin"]',_T`👤 Look`]],
   tabs:()=>[{k:'who',t:_T`Who`,s:_T`name · taste · temper`,m:/^$|Identity|Personality|Family/i},{k:'look',t:_T`Look`,s:_T`face · clothes`,m:/Look/i}],
   first:()=>_T`🪪 Identity`,list:()=>_T`📜 Your regulars`,checks:R=>[[!!d102Val(R,'#spName'),_T('Name')]]}};
/* ================= the builder ================= */
function d102Frame(R,key){const S=D102_SPEC[key];if(!S)return false;
  const kids=[...R.children];const at=S.sgSel?R.querySelector(S.sgSel):null;
  const sg=kids.find(c=>c.matches(S.sg||'.setup-grid')&&(!at||c.contains(at)));if(!sg||sg.closest('.df99'))return false;
  /* read the header + checks while every control is still in place */
  const nm=S.name?S.name(R):d102Val(R,S.nameSel);const ch=d102Chip(S,R);const chk=d102Checks(S,R);
  const i0=kids.indexOf(sg);const before=kids.slice(0,i0).filter(c=>!c.matches('.rail,.sttabs,script,style'));
  const after=kids.slice(i0+1);const formMore=[];const list=[];let inList=false;
  for(const c of after){if(!inList&&(c.matches('h4,h3,.stlist,.list2,.sponlist')))inList=true;(inList?list:formMore).push(c)}
  /* header line: the intro paragraph(s) + the sxh3 group's note */
  let sub='';for(const b of before){if(b.matches('p,.tokhelp')){const h=d102Intro(b);if(h&&!sub)sub=h}b.remove()}
  /* the two columns */
  const cols=[...sg.children];const left=cols.length>1?cols[0]:null;const right=cols.length>1?cols[cols.length-1]:cols[0];
  const acts=[],pv=[],pre=[];
  if(left&&S.sg)pv.push(left);
  else if(left){const L=[...left.children];
    for(const [sel,t,s,tab] of S.leftCards||[]){const x=left.querySelector(sel);let lab=x&&(x.closest('label')||x);if(!lab)continue;while(lab.parentElement&&lab.parentElement!==left)lab=lab.parentElement;
      const grp=[lab];let n=lab.nextElementSibling;while(n&&n.matches('div.rc-sub,p.rc-sub')&&!n.querySelector('input,select,button')){grp.push(n);n=n.nextElementSibling}
      grp.forEach(g=>{const k=L.indexOf(g);if(k>=0)L[k]=null});const c=DF99.card(t(),s?s():'','',grp);c.dataset.d102t=t();c.dataset.d102tab=tab;pre.push(c)}
    for(const el of L){if(!el)continue;if(el.matches('.mbtns')&&el.querySelector('button')){el.removeAttribute('style');el.classList.add('d102top');acts.push(el);continue}pv.push(el)}}
  const take=[];for(const sel of S.pvTake||[]){const x=sg.querySelector(sel);if(x)take.push(x)}take.forEach(x=>pv.push(x));
  const save=[];const secs=d102Secs([...(right?(right.matches('.formgrid')?[right]:right.children):[]),...formMore],{first:S.first&&S.first(),split:S.split&&S.split(),grab:S.grab&&S.grab(),titles:S.titles,s77:S.s77},save);
  const tabs=S.tabs();const by={};tabs.forEach(t=>by[t.k]=[]);
  const pick=t=>{for(const x of tabs)if(x.m&&x.m.test(t))return x.k;return tabs[0].k};
  for(const c of pre)(by[c.dataset.d102tab]||by[tabs[0].k]).push(c);
  for(const s of secs){const c=DF99.card(esc(s.t||''),esc(s.sub||''),'d102c'+(s.box?' d102box':''),s.nodes);c.dataset.d102t=s.t||'';
    if(s.btns.length){const h=c.querySelector('header');s.btns.forEach(b=>h.appendChild(b))}
    const k=(s.t===((S.first&&S.first())||''))?tabs[0].k:pick(s.t||'');by[k].push(c)}
  /* the side tab: the lists */
  const side=list.length&&S.list?{k:'list',t:S.list(),nodes:[d102El('div','stlist d102list')]}:null;
  if(side){const box=side.nodes[0];for(const n of list){if(n.matches('.stlist')){[...n.children].forEach(x=>box.appendChild(x));n.remove()}else box.appendChild(n)}
    if(key==='spect'){const L2=box.querySelector('.list2');if(L2)L2.classList.add('sp77list')}}
  const use=tabs.filter(t=>by[t.k].length);if(!use.length)return false;
  const root=DF99.build({id:'d102'+key,cls:'d102 d102-'+key,kicker:S.kick(),name:nm||S.blank(),nick:'',sub,chip:ch,acts,
    tabs:use.map(t=>({k:t.k,t:t.t,s:t.s,lay:t.lay==='one'?'one':'two',cols:[]})),side,preview:pv,checks:chk,save});
  for(const t of use){const p=root.querySelector(`:scope>.df99body>.df99main>.df99pane[data-df99p="${t.k}"]`);if(p)d102Lay(p,by[t.k],t.lay,t.big)}
  if(!side&&list.length){const L=d102El('div','d102rest');list.forEach(n=>L.appendChild(n));root.appendChild(L)}
  sg.replaceWith(root);D102.n++;return true}
function d102Chip(S,R){let c=null;try{c=S.chip?S.chip(R):null}catch(e){}if(c&&c.t){c.t=String(c.t).split(' — ')[0].trim();if(c.t.length>30)c.t=c.t.slice(0,28)+'…'}return c}
function d102Checks(S,R){let L=[];try{L=S.checks?S.checks(R):[]}catch(e){}const ok=L.every(x=>x[0]);L.push([ok,ok?_T('ready to save'):_T('fix the marked items')]);return L}
/* live: the header name/chip and the checks follow the controls (no redraw) */
function d102Live(){const root=document.querySelector('#studio .df99.d102');if(!root||typeof ST==='undefined')return;const S=D102_SPEC[ST.tab];if(!S)return;
  const nm=S.name?S.name(root):d102Val(root,S.nameSel);DF99.head(root,{name:nm||S.blank(),chip:d102Chip(S,root)});DF99.checks(root,d102Checks(S,root))}
if(!D102.off&&typeof studioHTML==='function'){const base=studioHTML;studioHTML=function(){const h=base.apply(this,arguments);try{
  if(typeof ST!=='undefined'&&D102_SPEC[ST.tab]&&typeof h==='string'&&!/class="df99/.test(h)){const k=ST.tab;return df99Xform(h,R=>d102Frame(R,k))}}catch(e){console.error(e)}return h}}
if(!D102.off){let raf=0;const kick=e=>{const t=e&&e.target;if(t&&t.closest&&!t.closest('.df99.d102'))return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{try{d102Live()}catch(err){console.error(err)}})};
  document.addEventListener('input',kick);document.addEventListener('change',kick);document.addEventListener('click',e=>{kick(e);setTimeout(()=>kick(),350)});
  /* New / Edit / Copy in these designers jump back to the first tab (262 knows the Character / Lanista ones) */
  document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;if(t.closest('#studio [data-clsa="fresh"],#studio [data-clsa="edit"],#studio [data-clsa="copy"],#studio [data-clsa="copybase"],#studio [data-px="new"],#studio [data-tnx="new"],#studio [data-sx="new"],#studio [data-sps="new"],#studio [data-sps="edit"],#studio [data-st="npcmyth"],#studio [data-st="cancel"]'))DF99.jump=Date.now()},true)}

if(!D102.off)(()=>{const st=document.createElement('style');st.textContent=`
.df99.d102 .d102flat{border:none!important;background:none!important;padding:0!important;margin:0!important;box-shadow:none!important}
.df99.d102 .df99in>.formgrid,.df99.d102 .df99in>.chkgrid,.df99.d102 .df99in>p,.df99.d102 .df99in>div{margin:0}
.df99.d102 .df99in .formgrid{gap:8px 10px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.df99.d102-sponsors .df99in .formgrid label{display:grid;gap:4px;align-content:start}
.df99.d102-sponsors .df99in .formgrid label>input,.df99.d102-sponsors .df99in .formgrid label>select{width:100%}
.df99.d102-sponsors .df99in .formgrid label>input[type=color]{height:34px}
.df99.d102 .df99pv .clscard,.df99.d102 .df99pv .cc98.big{max-width:220px}
.df99.d102 .df99pv .clscard svg{width:100%;height:auto}
.df99.d102 .df99in .formgrid label{min-width:0}
.df99.d102 .df99in select,.df99.d102 .df99in input.tin,.df99.d102 .df99in input[type=text]{max-width:100%;min-width:0}
.df99.d102 .df99pane>.d102wide{grid-column:1/-1}
.df99.d102 .df99head .df99acts .d102top{margin:0!important;display:flex!important;gap:8px;flex-wrap:nowrap}
.df99.d102 .df99head .df99sub .qi{cursor:help;color:var(--gold)}
.df99.d102 .df99pv{justify-items:center;text-align:center}
.df99.d102 .df99pv>*{max-width:100%;min-width:0}
.df99.d102 .df99pv svg{max-width:100%;height:auto}
.df99.d102 .df99pv .rc-sub{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.df99.d102 .df99pv .budgetcard{justify-self:stretch;text-align:left;margin:0!important;font-size:12px}
.df99.d102 .df99pv .budgetcard .rc-sub{font-family:inherit;font-size:11px;font-weight:400;text-transform:none;letter-spacing:0}
.df99.d102 .df99pv #clsCard{flex-wrap:nowrap!important;justify-content:center;align-items:flex-start!important;gap:6px!important;width:100%}
.df99.d102 .df99pv #clsCard .recav{width:78px;flex:none}.df99.d102 .df99pv #clsCard .recav svg{width:100%;height:auto}
.df99.d102 .df99pv #clsCard>.cc98,.df99.d102 .df99pv #clsCard>.clscard{flex:1;min-width:0;max-width:180px}
.df99.d102 .df99pv #clsCard .clscard,.df99.d102 .df99pv #clsCard .clscard svg{width:100%!important;height:auto!important;display:block}
.df99.d102 .df99pv #bfPrev,.df99.d102 .df99pv #rtPrev{margin:0 auto}
.df99.d102 .df99pv #bfPrev,.df99.d102 .df99pv #rtPrev{width:150px;max-width:100%}
.df99.d102 .df99pv #bfPrev svg,.df99.d102 .df99pv #rtPrev svg{width:100%;height:auto}
.df99.d102 .df99pv #tokPrev{margin:0 auto}
.df99.d102 .df99pv .sxinv,.df99.d102 .df99pv .pc95{margin:0;max-width:260px}
.df99.d102 .df99pv #spPrev{width:100%}
.df99.d102 .df99pv #spPrev .sp91row{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.df99.d102 .df99pv #spPrev .sp91row img{width:100%;height:auto}
.df99.d102 .df99pv #spPrev .sp91big img{max-width:100%}
.df99.d102 .df99pv>span:not([class]){display:block;margin:0 auto}
.df99.d102 .df99card>header .btn{margin-left:auto;padding:2px 8px;font-size:12px}
.df99.d102 .df99card>header .btn+.btn{margin-left:0}
.df99.d102 .d102list>h4{margin:14px 0 6px;font:600 12px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.df99.d102 .d102list>h4:first-child{margin-top:0}
.df99.d102 .theats{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.df99.d102 .toklineup{display:flex;flex-wrap:wrap;gap:6px}
.df99.d102 .st82tbl{width:100%}
.df99.d102 .nc82pair{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.df99.d102 .nc82des>.rc-sub:first-child{display:none}
.df99.d102 .tkshapes.scbench{border:none;background:none;padding:0;margin:0}
.df99.d102-npcs .df99pv .tkfig svg{max-height:90px}
@media (max-width:700px){
 .df99.d102 .df99pv{display:flex!important;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 10px;padding:8px}
 .df99.d102 .df99pv>*{grid-column:auto!important;grid-row:auto!important}
 .df99.d102 .df99pv>.df99pvh,.df99.d102 .df99pv>.rc-sub,.df99.d102 .df99pv>div:not([id]):not([class])>.rc-sub{display:none}
 .df99.d102 .df99pv svg,.df99.d102 .df99pv img{max-height:110px;width:auto}
 .df99.d102 .df99pv #bfPrev,.df99.d102 .df99pv #rtPrev{width:88px}
 .df99.d102 .df99pv #bfPrev svg,.df99.d102 .df99pv #rtPrev svg{width:100%}
 .df99.d102 .df99pv #clsCard{width:auto}
 .df99.d102 .df99pv #clsCard .recav{display:none}
 .df99.d102 .df99pv #clsCard>.cc98,.df99.d102 .df99pv #clsCard>.clscard{max-width:110px}
 .df99.d102 .df99pv .cc98w img,.df99.d102 .df99pv .cc98w svg{max-height:44px}
 .df99.d102 .df99pv .budgetcard{flex-basis:100%;font-size:11px}
 .df99.d102 .df99pv #spPrev .sp91big img{max-height:84px}
 .df99.d102 .df99pv #spPrev .sp91row{grid-template-columns:repeat(11,1fr);gap:2px}
 .df99.d102 .df99pv #spPrev .sp91row span,.df99.d102 .df99pv #spPrev .rc-sub{display:none}
 .df99.d102 .df99pv .sxinv,.df99.d102 .df99pv .pc95{max-width:100%;flex-basis:100%}
 .df99.d102 .df99pv #tokPrev{max-height:150px;overflow:hidden}
 .df99.d102 .df99in .formgrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 .df99.d102 .df99head .df99acts .d102top{flex-wrap:wrap}
}`;document.head.appendChild(st)})();
