/* v1.0 THE TITULI (307-v100tituli): ONE catalogue (TITULI100) for the Manager trophy case, Immortalis, the online Domus trophies + season tituli
   and the Annals feats; every titulus has in-house art (svg / img, never emoji) — checked in the catalogue and in all three views (Manager Trophies
   tab with its three filters, the Annals Hall of Flavius, the online Domus shelf + house card); a Manager trophy earned lights its plaque, a Play Now
   feat earned shows in the Annals, every online trophy key maps to a plaque; "Titulus earned" reveal on an earn (the old 🏆 toast swallowed); the
   kill switch localStorage flavius_tituli100off=1 brings back today's views; phones at 390 px never scroll sideways. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(vp,ls)=>{const ctx=await b.newContext({viewport:vp});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+page,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
const mgr=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
  openManager();await W8(400);newWorld({type:'pre',key:MGR_PRE[4].key});MGR.tab='trophy';WD100.tf='mgr';MGR_REDRAW();await W8(300);return W_().week});
/* the emoji test for an art node: no pictographic glyph in its text, and an svg/img inside */
const ARTCHK=`window.__art=root=>{const EMO=/\\p{Extended_Pictographic}/u;const A=[...root.querySelectorAll('.wd100tp .art, .tr83-ic')];return {n:A.length,bad:A.filter(a=>EMO.test(a.textContent)||!a.querySelector('svg,img')).length}}`;

/* ================= DESKTOP ================= */
const pg=await boot({width:1440,height:900});await pg.evaluate(ARTCHK);
/* 1 · the catalogue is complete and every art is in-house (svg/img, no emoji) */
out.cat=await pg.evaluate(()=>{const EMO=/\p{Extended_Pictographic}/u;const T=tit100Cat();const ids=new Set(T.map(e=>e.id));
  const onlKeys=['first:democritus','first:egidious','first:cassian','first:familia',...ONLC.RANKS.slice(1).map(r=>'rank:'+r.k),'slew:tholo','slew:commodus','vday','surv10','surv25','thumb',...ONLC.SEASON100.TITULI.map(t=>t.k)];
  const t=document.createElement('template');const bad=[];
  for(const e of T){t.innerHTML=e.art(80);const txt=t.content.textContent;if(!t.content.querySelector('svg,img')||EMO.test(txt)||EMO.test(e.n))bad.push(e.id);if(!e.n||!e.sub||!e.modes.length||!e.modes.every(m=>['manager','playnow','online'].includes(m)))bad.push('f:'+e.id)}
  return {n:T.length,bad,lib:TROPHY_LIB.every(d=>ids.has(d.id)),ach:ACHIEVEMENTS.every(a=>ids.has('pn:'+a.k)),imm:ids.has('immortalis'),onlMiss:onlKeys.filter(k=>!tit100ForOnl(k)),
    any:T.filter(e=>e.tags.includes('any')).map(e=>e.id).sort(),modes:['manager','playnow','online'].map(m=>T.filter(e=>e.modes.includes(m)).length)}});
ok(out.cat.n>=50&&!out.cat.bad.length&&out.cat.lib&&out.cat.ach&&out.cat.imm&&!out.cat.onlMiss.length,'1 catalogue complete, in-house art only '+JSON.stringify(out.cat));
ok(['immortalis','pn:commodus','pn:tholo','tiro','palm_roma'].every(k=>out.cat.any.includes(k))&&!out.cat.any.some(k=>/^o:/.test(k))&&out.cat.modes.every(n=>n>=10),'1 unified entries (Tholo, Commodus, Immortalis, the silverware: earned in two modes) '+JSON.stringify(out.cat));

/* 2 · Manager: the Trophies tab from the catalogue; an earned trophy lights, the reveal shows, Immortalis */
out.week=await mgr(pg);
out.mgr=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const q=s=>[...document.querySelectorAll('#mgrBody '+s)];const w=W_();
  o.n=q('.t100p').length;o.art=__art(document.getElementById('mgrBody'));o.imm=!!q('.t100p[data-t100="immortalis"].lock').length;
  earnTrophy(w,'tiro',{who:'Testus',why:'test'});await W8(80);const rv=document.getElementById('tit100rv');o.rv=!!rv&&/Tiro Laurel/.test(rv.textContent)&&!!rv.querySelector('.art svg,.art img');
  MGR_REDRAW();await W8(250);const t=document.querySelector('#mgrBody .t100p[data-t100="tiro"]');o.lit=!!t&&!t.classList.contains('lock')&&/Testus/.test(t.textContent);
  const g=rosterOf(me())[0];g.rec=g.rec||{w:0,l:0};g.rec.w=20;imm88Stamp(g);await W8(50);o.rvq=TIT100.q.some(x=>x.e.id==='immortalis')||(TIT100.cur&&TIT100.cur.e.id==='immortalis');
  MGR_REDRAW();await W8(250);const im=document.querySelector('#mgrBody .t100p[data-t100="immortalis"]');o.immLit=!!im&&!im.classList.contains('lock')&&im.textContent.includes(g.name);
  return o});
ok(out.mgr.n===TITN(out.cat,'manager')&&!out.mgr.art.bad&&out.mgr.art.n>=out.mgr.n&&out.mgr.imm,'2 Manager Tituli from the catalogue, art not emoji '+JSON.stringify(out.mgr));
ok(out.mgr.rv&&out.mgr.lit&&out.mgr.rvq&&out.mgr.immLit,'2 earned trophy lit + reveal, Immortalis earned '+JSON.stringify(out.mgr));
if(SHOT){await pg.evaluate(()=>{const r=document.getElementById('tit100rv');if(r)r.remove();TIT100.q=[];TIT100.cur=null});await pg.screenshot({path:path.join(SHOT,'ti_mgr_1440.png')})}

/* 3 · Play Now: a feat earned → the reveal, the old 🏆 toast swallowed, the Annals plaque lit; the Play Now filter */
out.pn=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};TIT100.q=[];TIT100.cur=null;const r0=document.getElementById('tit100rv');if(r0)r0.remove();
  const A=await achLoad();A.got={};const tt=document.getElementById('mToast');if(tt)tt.innerHTML='';await achGrant(A,'tholo');await Store.put('hall','ach',A);await W8(1100);
  const rv=document.getElementById('tit100rv');o.rv=!!rv&&/Gigantis Victor/.test(rv.textContent);const t2=document.getElementById('mToast');o.toast=!!t2&&/Giant-Killer/.test(t2.textContent);
  const h=await hallHTML('hall');const T=document.createElement('template');T.innerHTML=h;o.grid=!T.content.querySelector('.achgrid');o.n=T.content.querySelectorAll('.t100p').length;o.ach=ACHIEVEMENTS.length;
  const p=T.content.querySelector('.t100p[data-t100="pn:tholo"]');o.lit=!!p&&!p.classList.contains('lock');const box=document.createElement('div');box.appendChild(T.content.cloneNode(true));o.art=__art(box);
  const v=T.content.querySelector('.t100p[data-t100="pn:veteran"] .prog');o.prog=!!v;
  WD100.tf='pn';TIT100.pnD=null;MGR_REDRAW();for(let i=0;i<30&&!document.querySelector('#mgrBody .t100p[data-t100="pn:tholo"]');i++)await W8(100);
  const q=document.querySelector('#mgrBody .t100p[data-t100="pn:tholo"]');o.tab=!!q&&!q.classList.contains('lock');o.tabArt=__art(document.getElementById('mgrBody'));return o});
ok(out.pn.rv&&!out.pn.toast,'3 Play Now feat: reveal shown, the old 🏆 toast swallowed '+JSON.stringify(out.pn));
ok(out.pn.grid&&out.pn.n===out.pn.ach&&out.pn.lit&&!out.pn.art.bad&&out.pn.prog&&out.pn.tab&&!out.pn.tabArt.bad,'3 Annals Hall = Tituli plaques (feat lit, progress), Play Now filter '+JSON.stringify(out.pn));
if(SHOT){await pg.evaluate(()=>{const r=document.getElementById('tit100rv');if(r)r.remove()});await pg.screenshot({path:path.join(SHOT,'ti_pn_1440.png')})}

/* 4 · Online: every server key → a plaque on the Domus shelf (art, no emoji), the house card laurel, the Online filter, the reveal on a new key */
out.onl=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const now=Date.now();
  const keys=['first:democritus','first:familia','rank:veteranus','slew:tholo','slew:commodus','vday','surv10','surv25','thumb'];
  const list=keys.map((k,i)=>({k,n:ONLC.trophyName(k),at:now-i,glad:'Brutus',x:k==='vday'?3:1}));
  const box=document.createElement('div');box.innerHTML=onl83Trophies(list);document.body.appendChild(box);o.shelf=__art(box);o.keys=box.querySelectorAll('[data-t100k]').length;o.emo=/\p{Extended_Pictographic}/u.test([...box.querySelectorAll('.tr83-ic')].map(x=>x.textContent).join(''));box.remove();
  let hc='';try{hc=hc98HTML({domus:{id:'d1',n:'Domus Test',name:'Domus Test'},glads:[],tit100:[{k:'s100v',n:'Victor of the Season',s:'S3',glad:'Brutus'}]})}catch(e){hc='ERR '+e.message}
  const T=document.createElement('template');T.innerHTML=hc;const s=T.content.querySelector('.tit100');o.hc=!!s&&!!s.querySelector('svg')&&!/🏅/.test(s.textContent);
  ONL82.dg={trophies:list.slice(0,4),glads:[{id:'c1',name:'Brutus',alive:true,survived:12,glory:350}]};TIT100.onlSeen=null;tit100OnlCheck();TIT100.q=[];TIT100.cur=null;
  ONL82.dg.trophies=list;tit100OnlCheck();o.rv=(TIT100.cur&&TIT100.cur.e.id)||'';o.rvq=TIT100.q.map(x=>x.e.id);
  WD100.tf='onl';MGR_REDRAW();await W8(300);const q=s=>document.querySelector('#mgrBody .t100p[data-t100="'+s+'"]');o.tholo=!!q('pn:tholo')&&!q('pn:tholo').classList.contains('lock');
  o.rank=!!q('o:rank:veteranus')&&!q('o:rank:veteranus').classList.contains('lock');const pr=q('o:rank:primus');o.prog=!!pr&&!!pr.querySelector('.prog i');o.tabArt=__art(document.getElementById('mgrBody'));return o});
ok(!out.onl.shelf.bad&&out.onl.shelf.n===9&&out.onl.keys===9&&!out.onl.emo,'4 Domus shelf: every key → plaque art, no emoji '+JSON.stringify(out.onl));
ok(out.onl.hc,'4 house card season titulus: laurel art, no 🏅 '+JSON.stringify(out.onl.hc));
ok(out.onl.rv==='pn:commodus'||out.onl.rvq.includes('pn:commodus'),'4 a new online key → the reveal '+JSON.stringify([out.onl.rv,out.onl.rvq]));
ok(out.onl.tholo&&out.onl.rank&&out.onl.prog&&!out.onl.tabArt.bad,'4 Online filter: unified Tholo lit from the online kill, rank lit, progress '+JSON.stringify(out.onl));
if(SHOT){await pg.screenshot({path:path.join(SHOT,'ti_onl_1440.png')});
  await pg.evaluate(()=>{const r=document.getElementById('tit100rv');if(r)r.remove();TIT100.q=[];TIT100.cur=null;tit100Reveal(tit100ById('o:rank:invictus'),'Brutus')});await pg.waitForTimeout(700);await pg.screenshot({path:path.join(SHOT,'ti_reveal_1440.png')})}
/* 5 · Reduce motion: the reveal is static */
out.rm=await pg.evaluate(async()=>{SETTINGS.calm=true;const r=document.getElementById('tit100rv');if(r)r.remove();TIT100.q=[];TIT100.cur=null;tit100Reveal(tit100ById('o:vday'),'x');const el=document.getElementById('tit100rv');const o={rm:!!el&&el.classList.contains('rm'),anim:el?getComputedStyle(el).animationName:''};SETTINGS.calm=false;return o});
ok(out.rm.rm&&out.rm.anim==='none','5 Reduce motion: static reveal '+JSON.stringify(out.rm));
await pg.context().close();

/* ================= KILL SWITCH ================= */
const pk=await boot({width:1440,height:900},{flavius_tituli100off:'1'});
out.off=await pk.evaluate(async()=>{const h=await hallHTML('hall');const sh=onl83Trophies([{k:'slew:tholo',n:'Slew Tholo',at:1,glad:'x',x:1}]);return {grid:/class="achgrid"/.test(h),t100:/t100p/.test(h),emo:/🦁/.test(sh),shelf:/t100sh/.test(sh)}});
ok(out.off.grid&&!out.off.t100&&out.off.emo&&!out.off.shelf,'6 kill switch: today\'s views '+JSON.stringify(out.off));
await pk.context().close();

/* ================= PHONE 390 ================= */
const pp=await boot({width:390,height:844});await pp.evaluate(ARTCHK);await mgr(pp);
out.ph=await pp.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const sw=()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#mBody, #mgrBody')].every(e=>e.scrollWidth<=e.clientWidth+1);
  for(const f of ['mgr','pn','onl']){WD100.tf=f;MGR_REDRAW();await W8(400);o[f]=sw()&&[...document.querySelectorAll('#mgrBody .t100p')].every(p=>p.getBoundingClientRect().right<=innerWidth+1)}
  tit100Reveal(tit100ById('o:rank:invictus'),'Brutus');await W8(700);const r=document.getElementById('tit100rv').getBoundingClientRect();o.rv=r.left>=0&&r.right<=innerWidth;return o});
ok(out.ph.mgr&&out.ph.pn&&out.ph.onl&&out.ph.rv,'7 phone 390: no sideways scroll, plaques fit, reveal fits '+JSON.stringify(out.ph));
if(SHOT){await pp.evaluate(()=>{WD100.tf='mgr';MGR_REDRAW()});await pp.waitForTimeout(300);await pp.screenshot({path:path.join(SHOT,'ti_mgr_390.png')})}
out.ph2=await pp.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r=document.getElementById('tit100rv');if(r)r.remove();try{closeModal&&closeModal()}catch(e){}if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);
  openHall('hall');for(let i=0;i<40&&!document.querySelector('#mBody .t100p');i++)await W8(100);const o={n:document.querySelectorAll('#mBody .t100p').length};
  o.sw=document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#mBody .t100p')].every(p=>p.getBoundingClientRect().right<=innerWidth+1);return o});
ok(out.ph2.n>=13&&out.ph2.sw,'7 phone 390: the Annals Tituli fit '+JSON.stringify(out.ph2));
if(SHOT){await pp.evaluate(()=>{const p=document.querySelector('#mBody .t100p');if(p)p.scrollIntoView()});await pp.screenshot({path:path.join(SHOT,'ti_annals_390.png')})}
/* 8 · v1.0 follow-ups: the season titulus is EARNED on my own Domus (domus.get carries tit100, mock) · plaque names pass WCAG AA */
const pf=await boot({width:1440,height:900});await pf.evaluate(ARTCHK);
out.fu=await pf.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  const w={accounts:{me:{domus:'d1'}},domus82:{d1:{id:'d1',n:'Domus Test',name:'Domus Test',tit100:[{s:'S1',k:'s100v',n:'Victor of the Season',place:1,c:'c1',glad:'Brutus',at:Date.now()}]}},chars:{},lobbies:{}};
  let r=null;try{r=MOCK_ROUTES['domus.get'](w,{},'me')}catch(e){o.err=e.message}
  o.mock=!!r&&(r.tit100||[]).length===1&&r.tit100[0].k==='s100v';
  ONL82.dg=r||{};const box=document.createElement('div');box.innerHTML=onl83Trophies([]);document.body.appendChild(box);
  const t=box.querySelector('[data-t100k="s100v"]');o.shelf=!!t&&!!t.querySelector('svg')&&/Brutus/.test(t.textContent);box.remove();
  const e=tit100ForOnl('s100v');const st=e&&tit100State(e,'online',{onl:tit100OnlD()});o.state=!!st&&/Brutus/.test(st.won||'');
  const lin=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)},L=h=>{const n=parseInt(h.slice(1),16);return .2126*lin(n>>16)+.7152*lin((n>>8)&255)+.0722*lin(n&255)},cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const hex=c=>{const m=c.match(/\d+/g).map(Number);return '#'+m.slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('')};
  const host=document.createElement('div');host.innerHTML=tituli100Plaque({art:'<svg></svg>',name:'Prima Palma',sub:'Won it',won:'Brutus'})+tituli100Plaque({art:'<svg></svg>',name:'Prima Palma',sub:'Won it',won:''});document.body.appendChild(host);
  const [pe,pl]=host.querySelectorAll('.wd100tp');o.cr={};
  for(const [k,p] of [['earned',pe],['lock',pl]])for(const sel of ['b','.sb']){const el=p.querySelector(sel),cs=getComputedStyle(el);
    const bg=k==='lock'?['#5a4a3a','#3a3028','#2e261e']:[hex(cs.backgroundColor)];
    o.cr[k+sel]=Math.min(...bg.map(x=>cr(hex(cs.color),x)))}
  host.remove();return o});
ok(out.fu.mock&&out.fu.shelf&&out.fu.state,'8 season titulus earned on my own Domus (mock domus.get → shelf + online tab) '+JSON.stringify(out.fu));
ok(Object.values(out.fu.cr).every(v=>v>=4.5),'8 plaque name + subtitle >= 4.5:1 earned and locked '+JSON.stringify(out.fu.cr));
await b.close();
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISSING:\n'+miss.join('\n'));process.exit(1)}if(errs.length)process.exit(1);console.log('ALL OK')})();
function TITN(cat,m){return cat.modes[['manager','playnow','online'].indexOf(m)]}
