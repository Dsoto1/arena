/* v1.02 workstream C — UI fixes (334-v102fix + the E1 edit in 307 + the G6 edit in 321): O1 Season banner, O5 / S7 / G4 closers, G7 armor art aspect,
   E1 online Tituli adapter, P1 no Blessings-bag line, P3 / P4 Challenges, S1 / S2 Studio flicker, S3 / S5 / S6 designers, G1 / G2 saves look, G5 coin +
   trophy flight, G6 token bases off for beasts. SHOT=<dir> saves tv102c_*.png. Serves the page over http (sheets need readable pixels). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(ls,W,H)=>{const ctx=await b.newContext({viewport:{width:W||1440,height:H||900}});await ctx.route(/fonts\./,r=>r.abort());const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide();window.__e0=ERR92.n});return pg};
const until=async(pg,fn,ms=15000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const closeAll=pg=>pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}});
const shot=async(pg,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await pg.screenshot({path:path.join(SHOT,'tv102c_'+n+'.png')})}};
const newErr=pg=>pg.evaluate(()=>errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)));
const W=(pg,ms)=>pg.waitForTimeout(ms);
const pg=await open();

/* ---- E1 · the online Tituli adapter survives an object / missing glads ---- */
const e1=await pg.evaluate(()=>{const r={};const keep=typeof ONL82!=='undefined'?ONL82.dg:undefined;
  try{ONL82.dg={glads:{a:{name:'A',survived:3},b:{name:'B',survived:30}},trophies:{x:{k:'o:first:democritus'}}};const O=tit100OnlD();r.arr=Array.isArray(O.glads)&&O.glads.length===2;
    const T=tit100List('online',{onl:O});r.list=Array.isArray(T)&&T.length>0;
    ONL82.dg={};const O2=tit100OnlD();r.empty=Array.isArray(O2.glads)&&O2.glads.length===0;tit100List('online',{onl:O2});
    ONL82.dg={glads:null,trophies:null};tit100List('online',{onl:tit100OnlD()});r.nul=1}catch(e){r.err=String(e)}
  ONL82.dg=keep;return r});
ok(e1.arr&&e1.list&&e1.empty&&e1.nul&&!e1.err,'E1 object / empty / null glads do not throw '+JSON.stringify(e1));

/* ---- P1 + P3 + P4 · Play Now ---- */
await pg.evaluate(()=>{openSetup(true)});ok(await until(pg,()=>document.querySelector('#mBody .pn100ev,#mBody .pn-top')),'Play Now page up');await W(pg,1500);
const p1=await pg.evaluate(()=>({txt:/Blessings bag works/.test(document.getElementById('mBody').textContent),qi:!!document.querySelector('#mBody .optfold .qi'),opts:!!document.querySelector('#mBody .optfold')}));
ok(!p1.txt&&!p1.qi,'P1 no "How the Blessings bag works" '+JSON.stringify(p1));
await pg.click('[data-dc100pn]');ok(await until(pg,()=>document.getElementById('dc102'),4000),'P3 Challenges card opens (#dc102)');await W(pg,400);
const p3=await pg.evaluate(()=>{const o=document.getElementById('dc102'),bx=o.querySelector('.dc102box').getBoundingClientRect();return {setup:!!document.querySelector('#mBody .pn100ev,#mBody .pn-top'),modalUp:!document.getElementById('modal').hidden,h:bx.height,w:bx.width,vh:innerHeight,cards:o.querySelectorAll('.dc100parch,.dc100card,[data-dc100go]').length,menu:!document.getElementById('mainMenu').hidden,sb:o.querySelector('.dc102back')?getComputedStyle(o.querySelector('.dc102back')).backgroundImage.slice(0,30):''}});
ok(p3.setup&&p3.modalUp&&!p3.menu,'P3 the Play Now page stays under it '+JSON.stringify(p3));ok(p3.h<p3.vh-40&&p3.cards>=2,'P4 the card fits its content '+JSON.stringify(p3));
ok(/url|gradient/.test(p3.sb),'P3 Back is a sandstone slab '+p3.sb);await shot(pg,'challenges_over_playnow');
await pg.click('#dc102 .dc102back');ok(await until(pg,()=>!document.getElementById('dc102')),'P3 Back closes the card');
ok(await pg.evaluate(()=>!!document.querySelector('#mBody .pn100ev,#mBody .pn-top')&&document.getElementById('mainMenu').hidden),'P3 Back returns to the Play Now page, not the menu');
await pg.click('[data-dc100pn]');await until(pg,()=>document.getElementById('dc102'));await pg.keyboard.press('Escape');
ok(await until(pg,()=>!document.getElementById('dc102'),3000)&&await pg.evaluate(()=>!!document.querySelector('#mBody .pn100ev,#mBody .pn-top')),'P3 Esc closes the card, the page stays');
await pg.click('[data-dc100pn]');await until(pg,()=>document.getElementById('dc102'));await pg.click('#dc102 .dc102x');
ok(await until(pg,()=>!document.getElementById('dc102'),3000)&&await pg.evaluate(()=>!!document.querySelector('#mBody .pn100ev,#mBody .pn-top')),'P3 ✕ closes the card, the page stays');
/* Enter the arena from the card starts the daily */
await pg.click('[data-dc100pn]');await until(pg,()=>document.getElementById('dc102'));await pg.click('#dc102 [data-dc100go="d"]');
ok(await until(pg,()=>(window.S&&S.daily100)||(CUR_MODAL&&/Draft|briefing/i.test(document.getElementById('mTitle').textContent)),30000),'P3 Enter the arena starts the challenge from the card');
await pg.evaluate(async()=>{try{S.over=true}catch(e){}for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}});await W(pg,800);
/* the submenu path: the window is as large as its content */
await pg.evaluate(()=>{window.S=null;try{menuShow()}catch(e){}});await closeAll(pg);
await pg.evaluate(()=>{dc100Open()});ok(await until(pg,()=>document.getElementById('dc100w')),'P4 submenu window opens');await W(pg,500);
const p4=await pg.evaluate(()=>{const bx=document.getElementById('mboxEl').getBoundingClientRect(),cal=document.querySelector('#dc100w').getBoundingClientRect(),bt=document.getElementById('mBtns').getBoundingClientRect();return {h:bx.height,gap:bt.top-cal.bottom,vh:innerHeight}});
ok(p4.h<p4.vh-120&&p4.gap<60,'P4 the window is only as large as its content '+JSON.stringify(p4));await shot(pg,'challenges_window');await closeAll(pg);

/* ---- S1 / S2 / S3 / S5 / S6 · the Studio ---- */
const flick=async(P,tab,act)=>{await P.evaluate(async t=>{menuHide();try{await Store.put('customChars','tv102x',Object.assign(blankChar(),{id:'tv102x',name:'Tester'}));await Store.put('customClasses','tv102y',Object.assign(blankClass(),{id:'tv102y',name:'Testclass'}))}catch(e){console.error(e)}openStudio();await new Promise(r=>setTimeout(r,1500));ST.tab=t;if(t==='classes')ST.draft=blankClass();else if(t==='chars'){ST.draft=blankChar();ST.view='edit'}studioRedraw();await new Promise(r=>setTimeout(r,700))},tab);
  await P.evaluate(()=>{window.__f=[];window.__on=1;const loop=()=>{if(!window.__on)return;const st=document.getElementById('studio');const inner=document.querySelector('#mBody #studio');
    const bars=inner?Math.min(1,inner.querySelectorAll('.st98bar,.df99.d102').length):-1,counts=inner?inner.querySelectorAll('.st77c').length:-1,hidden=inner?inner.querySelectorAll('.st98off,.df99pane[hidden]').length:-1,form=inner?inner.querySelectorAll('select[data-f],input[data-f]').length:-1;
    window.__f.push([bars,counts,hidden,form]);requestAnimationFrame(loop)};requestAnimationFrame(loop)});
  await P.evaluate(act);await W(P,1000);return P.evaluate(()=>{window.__on=0;return window.__f})};
const chk=()=>{const e=document.querySelector('#studio input[type=checkbox][data-f="arm.belt"],#studio input[type=checkbox][data-f]');if(!e)return;e.checked=!e.checked;e.dispatchEvent(new Event('change',{bubbles:true}))};
const fc=await flick(pg,'classes',chk);const f0=fc[0];
const badC=fc.filter(f=>f[0]!==1||f[2]===0).length;ok(fc.length>20&&f0[0]===1,'S1 sampled the class designer '+fc.length+' '+JSON.stringify(f0));
ok(badC===0,'S1 changing an option never shows a frame without the tabs / hidden sections ('+badC+' of '+fc.length+' frames)');
await closeAll(pg);
const fh=await flick(pg,'chars',()=>{const e=document.querySelector('#studio input[type=checkbox][data-f],#studio select[data-f]');if(e){if(e.type==='checkbox')e.checked=!e.checked;else e.selectedIndex=Math.min(1,e.options.length-1);e.dispatchEvent(new Event('change',{bubbles:true}))}});
const cnt0=fh[0][1];const badH=fh.filter(f=>f[1]!==cnt0||f[1]<1).length;ok(cnt0>=1&&badH===0,'S2 the rail counts never blink on a change in the character designer ('+badH+' bad frames, '+cnt0+' counts)');
/* the repro: with the kill switch the old path blinks (frames without the tabs / counts) */
{const pg2=await open({flavius_v102coff:'1',flavius_v102doff:'1'});const fo=await flick(pg2,'classes',chk);const badO=fo.filter(f=>f[0]!==1||f[2]===0).length;ok(badO>0,'S1 repro: the old path shows frames without the tabs ('+badO+' of '+fo.length+')');
 await closeAll(pg2);const fo2=await flick(pg2,'chars',()=>{const e=document.querySelector('#studio input[type=checkbox][data-f],#studio select[data-f]');if(e){if(e.type==='checkbox')e.checked=!e.checked;else e.selectedIndex=Math.min(1,e.options.length-1);e.dispatchEvent(new Event('change',{bubbles:true}))}});
 const c2=fo2[0][1];ok(fo2.filter(f=>f[1]!==c2||f[1]<1).length>0,'S2 repro: the old path blinks the rail counts');await pg2.context().close()}
/* S6 + S3 */
const s6=await pg.evaluate(()=>({cancel:document.querySelectorAll('#studio [data-st="cancel"]').length,save:!!document.querySelector('#studio [data-st="save"]')}));
ok(s6.save&&s6.cancel===0,'S6 no "Start a fresh one" in the character designer '+JSON.stringify(s6));
await pg.evaluate(async()=>{ST.tab='classes';ST.draft=blankClass();studioRedraw();await new Promise(r=>setTimeout(r,500))});
const s3=await pg.evaluate(()=>{const s=document.querySelector('#studio select[data-f="abil"]'),l=s&&s.closest('label');return {txt:l?l.textContent.trim().slice(0,8):'',name:!!document.querySelector('#studio [data-f="abilText"]'),lbl:/Ability name/.test(document.getElementById('studio').textContent)}});
ok(/^Extra/.test(s3.txt)&&!s3.name&&!s3.lbl,'S3 the ability box says Extra, no ability-name box '+JSON.stringify(s3));await shot(pg,'class_designer');
/* S5 */
const s5=await pg.evaluate(async()=>{try{df99MemSet('chars','token')}catch(e){}ST.tab='names';studioRedraw();await new Promise(r=>setTimeout(r,700));const u=document.querySelector('#studio [data-nm77use]');if(!u)return {noBtn:1};u.click();await new Promise(r=>setTimeout(r,900));
  const on=document.querySelector('#studio .df99tabs [data-df99t].on');return {tab:ST.tab,on:on&&on.dataset.df99t,name:ST.draft&&ST.draft.name}});
ok(s5.tab==='chars'&&s5.on==='basics','S5 ✎ Use opens the character designer on Basics '+JSON.stringify(s5));
/* S7 + G4 (Studio closer) */
const cs=()=>pg.evaluate(()=>{const m=document.getElementById('mClose'),c=getComputedStyle(m),r=m.getBoundingClientRect();return {cls:m.className,txt:m.textContent.trim().slice(0,30),bg:c.backgroundImage.slice(0,60),col:c.color,w:Math.round(r.width),h:Math.round(r.height),br:c.borderRadius,bd:c.borderTopWidth}});
const sc=await cs();ok(/saveq/.test(sc.cls)&&/url|linear/.test(sc.bg)&&sc.col==='rgb(58, 36, 16)'&&sc.h>=32,'S7 Exit Creator Studio is a sandstone slab '+JSON.stringify(sc));await shot(pg,'studio_top');
await closeAll(pg);

/* ---- G4 · one stone ✕ ---- */
const stud={};
for(const [k,fn] of [['settings',"openSettings()"],['hub',"savesHub76('matches')"],['rules',"showRules()"],['gen',"modal('Hello','<p>x</p>',[{label:'OK',value:1}],{close:null})"]]){
  await pg.evaluate(f=>{(0,eval)(f)},fn);await W(pg,1800);stud[k]=await cs();await shot(pg,'closer_'+k);await closeAll(pg)}
for(const [k,v] of Object.entries(stud))ok(/radial-gradient/.test(v.bg)&&v.bd==='0px'&&v.col==='rgb(74, 46, 20)'&&v.br==='9px','G4 '+k+' ✕ is the stone stud (square since v1.03) '+JSON.stringify(v));
await pg.evaluate(()=>{openHall()});await W(pg,1500);const hl=await cs();ok(/saveq/.test(hl.cls)&&/url|linear/.test(hl.bg),'G4 Annals closer = sandstone slab '+JSON.stringify(hl));await closeAll(pg);

/* ---- G1 / G2 · saves ---- */
await pg.evaluate(async()=>{await Store.put('mgrCareers','c1',{id:'c1',ludus:'Ludus Test',name:'Marcus',season:1,week:3,fame:20,coin:300,wins:2,bouts:3,updated:'2026-10-10 12:00'});savesHub76('careers')});
ok(await until(pg,()=>document.querySelector('#hub76 .hub76card'),8000),'G2 Saves window with a career row');await W(pg,500);
const g2=await pg.evaluate(()=>{const card=document.querySelector('#hub76 .hub76card'),cs=getComputedStyle(card),pri=document.querySelector('#hub76 .hub76card .btn.primary'),sec=document.querySelector('#hub76 [data-hubmgr="manage"]');
  return {bl:cs.borderLeftWidth,priBg:pri?getComputedStyle(pri,'::before').backgroundImage.slice(0,30):'',secBg:sec?getComputedStyle(sec).backgroundImage.slice(0,30):'',secH:sec?sec.getBoundingClientRect().height:0}});
ok(g2.bl==='4px'&&/gradient/.test(g2.priBg)&&/url|gradient/.test(g2.secBg)&&g2.secH>=36,'G2 card row + porphyry Continue + sandstone buttons '+JSON.stringify(g2));await shot(pg,'saves_hub');
await pg.evaluate(()=>{hubRedraw76('backups')});await W(pg,600);ok(await pg.evaluate(()=>/gradient|url/.test(getComputedStyle(document.querySelector('#hub76 [data-hubbk="export"]')).backgroundImage)),'G2 backups tab buttons are slabs');
await closeAll(pg);
await pg.evaluate(()=>{MGR.view='manage';MGR.world=null;openManager()});ok(await until(pg,()=>document.querySelector('#mgrBody [data-mg="dlcareer"]'),10000),'G1 Manage saves view');await W(pg,500);
const g1=await pg.evaluate(()=>{const d=document.querySelector('#mgrBody [data-mg="dlcareer"]'),x=document.querySelector('#mgrBody [data-mg="delcareer"]'),bk=document.querySelector('#mgrBody [data-mg="back"]'),row=document.querySelector('#mgrBody .lrow'),u=document.querySelector('#mgrBody .upsave');
  const bg=e=>e?getComputedStyle(e).backgroundImage.slice(0,40):'';return {d:bg(d),x:bg(x),bk:bg(bk),u:bg(u),rowW:row.getBoundingClientRect().width,bl:getComputedStyle(row).borderLeftWidth,del:x&&getComputedStyle(x).color}});
ok(/url|gradient/.test(g1.d)&&/gradient/.test(g1.x)&&/url|gradient/.test(g1.bk)&&/url|gradient/.test(g1.u)&&g1.rowW>320&&g1.bl==='4px'&&g1.del==='rgb(240, 138, 112)','G1 Manage saves: slabs, carbon Delete, card rows '+JSON.stringify(g1));await shot(pg,'manage_saves');
await closeAll(pg);

/* ---- Online: O1 Season banner, O5 closer, G7 armor art ---- */
await pg.evaluate(async()=>{ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;await NET.req('char.create',{name:'Alpha',cls:'hero'});
  onlineOpen('char');await new Promise(r=>setTimeout(r,1200));ONL.tab='season';B100.sb=null;onlRedraw()});
ok(await until(pg,()=>document.querySelector('#onl .sb102 .sb100tb,#onl .sb102 .sb100tit'),10000),'O1 season banner shows');await W(pg,600);
const o1=await pg.evaluate(()=>{const R=document.querySelector('#onl .sb102'),h=R.querySelector('h3').getBoundingClientRect(),nv=R.querySelector('.sb100nav').getBoundingClientRect(),sub=R.querySelector(':scope>p.rc-sub'),
  lum=c=>{const m=c.match(/\d+(\.\d+)?/g).map(Number).slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*m[0]+.7152*m[1]+.0722*m[2]};
  const bgc=getComputedStyle(document.querySelector('#modal')).backgroundColor,panel=getComputedStyle(document.querySelector('#mboxEl')).backgroundColor;
  const cr=(a,c)=>{const x=lum(a),y=lum(c);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  return {slab:!!document.querySelector('#onl div.sb100'),sameRow:Math.abs((h.top+h.height/2)-(nv.top+nv.height/2))<24,wrapH:R.getBoundingClientRect().height,subCr:sub?cr(getComputedStyle(sub).color,panel):0,titCr:cr(getComputedStyle(R.querySelector('h3')).color,panel),
    prevBtn:getComputedStyle(R.querySelector('[data-b100s]')).backgroundImage.slice(0,20),over:document.documentElement.scrollWidth>innerWidth+1}});
ok(!o1.slab&&o1.sameRow&&o1.wrapH>80&&o1.subCr>=4.5&&o1.titCr>=4.5&&!o1.over,'O1 season banner laid out, readable '+JSON.stringify(o1));await shot(pg,'season');
const o5=await cs();ok(/saveq/.test(o5.cls)&&/Leave the Online arena/.test(o5.txt)&&/url|linear/.test(o5.bg)&&o5.col==='rgb(58, 36, 16)','O5 Leave the Online arena is a sandstone slab '+JSON.stringify(o5));
const bar=await pg.evaluate(()=>{const mk=(mode)=>{const x=document.createElement('button');x.id='btnOnlLeave';x.className='btn';x.dataset.mode=mode;x.textContent='🚪 Test';document.body.appendChild(x);const c=getComputedStyle(x),r={bg:c.backgroundImage.slice(0,30),col:c.color,h:x.getBoundingClientRect().height};x.remove();return r};return {leave:mk('leave'),ab:mk('abandon')}});
ok(/url|linear/.test(bar.leave.bg)&&bar.leave.col==='rgb(58, 36, 16)'&&bar.leave.h<=40&&/url|linear/.test(bar.ab.bg)&&bar.ab.col==='rgb(240, 138, 112)','O5 #btnOnlLeave sandstone (Abandon = carbon) '+JSON.stringify(bar));
/* G7: a square art in a skewed box shrinks to its short side; the real tiles are square */
const g7=await pg.evaluate(()=>{const d=document.createElement('div');d.style.cssText='display:block;width:220px;height:120px';d.innerHTML=cardHTML('a:legwraps','md');const e=d.firstElementChild;e.style.cssText+=';width:100%!important;height:100%!important';document.getElementById('onl').appendChild(d);
  const r0=e.getBoundingClientRect();g7Fit(document.getElementById('onl'));const r1=e.getBoundingClientRect();d.remove();return {before:[Math.round(r0.width),Math.round(r0.height)],after:[Math.round(r1.width),Math.round(r1.height)]}});
ok(g7.before[0]!==g7.before[1]&&g7.after[0]===g7.after[1]&&g7.after[0]===120,'G7 stretched art is fitted by its short side '+JSON.stringify(g7));
await pg.evaluate(async()=>{ONL.tab='auction';ONL84.aucAt=0;ONL84.auc=null;onlRedraw()});await W(pg,2500);
const sq=async name=>{const r=await pg.evaluate(()=>[...document.querySelectorAll('#onl .cimg[data-card^="a:"]')].map(e=>{const r=e.getBoundingClientRect();return r.width&&r.height?+(r.width/r.height).toFixed(2):1}));ok(r.every(k=>Math.abs(k-1)<=0.05),'G7 '+name+' armor art square '+JSON.stringify(r.filter(k=>Math.abs(k-1)>0.05)));return r.length};
const nAuc=await sq('auction');
for(const t of ['market','domus','char']){await pg.evaluate(async t=>{ONL.tab=t;onlRedraw()},t);await W(pg,1200);await sq(t)}
ok(true,'G7 checked '+nAuc);
ok((await newErr(pg)).length===0,'no new errors up to here '+JSON.stringify(await newErr(pg)));
await closeAll(pg);

/* ---- G5 · coin + trophy fly ---- */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  startEvent({ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}});
const g5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';S.boardPid=null;const me=S.players[0];render();draw();await W8(300);
  const seen={coin:0,cf:0,trophy:0};const t0=performance.now();const iv=setInterval(()=>{for(const e of document.querySelectorAll('.h100fly')){const k=e.classList.contains('coin')?'coin':e.classList.contains('cf')?'cf':e.classList.contains('trophy')?'trophy':'';if(k)seen[k]=1}},40);
  const shown=h100Shown()===me;addTrophy(me,'Wolf','beast',3,2,'npc');await W8(900);clearInterval(iv);
  return {seen,shown,live:h100Live(),fast:h100Fast(),anim:h100Anim(),tgt:!!document.querySelector('#board .econ [data-act="trophies"]'),n:me.trophies.length}});
ok(g5.seen.coin&&g5.seen.cf&&g5.seen.trophy,'G5 coin, CF and trophy fly in '+JSON.stringify(g5));

/* ---- G6 · token bases off for beasts ---- */
const g6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const k='leo';
  let im=null;for(let i=0;i<80;i++){im=bst100Img(k,0);if(im&&im.complete&&im.naturalWidth)break;await W8(100)}
  const M=BEAST100_META[k],me=M.iw,row=M.ir.indexOf('idle0');
  SETTINGS.bases101=true;applySettings();const a=bst100Cell(k,2,{name:'idle0'},100,100,{});
  SETTINGS.bases101=false;applySettings();o.mode=bs101Mode();const c=bst100Cell(k,2,{name:'idle0'},100,100,{});const s=bst100Scale(M);
  o.dy=+(c-a).toFixed(2);o.want=+(BST100_BASE_MM*M.px*s).toFixed(2);
  o.read=g6Readable(im);let tot=0,gone=0;
  for(const f of [0,1,2,3,4,5,6,7]){const pc=g6Proc(im,M,me,f,row);if(!pc){continue}tot++;const g=pc.getContext('2d');
    /* the wall of the base (below the top surface's centre) must be clear; the figure's body above stays */
    const cx=Math.round(me[2]),cy=Math.round(me[3]);const alpha=(x,y)=>g.getImageData(x,y,1,1).data[3];
    const rx=M.base[0]/2*M.px;const ys=[cy+Math.round(BST100_BASE_MM*M.px*0.5)];let a0=0;for(const yy of ys)for(const dx of [-0.8,0.8])if(alpha(Math.round(cx+dx*rx*Math.abs(Math.cos((90-([0,45,90,135,180,-135,-90,-45][f]))*Math.PI/180))),yy)===0)a0++;
    if(a0>=1)gone++}
  o.procd=tot;o.cleared=gone;o.stats=JSON.stringify(G6.stats);
  /* the figure itself is still there (many opaque pixels above the base centre) */
  const pc=g6Proc(im,M,me,2,row);if(pc){const d=pc.getContext('2d').getImageData(0,0,pc.width,Math.round(me[3])).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>200)n++;o.body=n}
  /* a full-size draw: nothing throws and a cell goes out */
  draw();SETTINGS.bases101=true;applySettings();return o});
ok(g6.mode===2&&g6.read===true,'G6 bases off, pixels readable over http '+JSON.stringify(g6));
ok(Math.abs(g6.dy-g6.want)<0.3,'G6 a base-less beast is drawn down by the base thickness (feet on the floor) '+JSON.stringify({dy:g6.dy,want:g6.want}));
ok(g6.procd>=6&&g6.cleared>=Math.min(6,g6.procd),'G6 the base wall is cleared in the 8 facings '+JSON.stringify(g6));
ok(g6.body>1500,'G6 the beast itself is kept '+g6.body);
/* a picture of beasts with and without their base (the processed cells from the real sheets) */
if(SHOT){await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const c=document.createElement('canvas');c.id='g6shot';c.width=1300;c.height=620;c.style.cssText='position:fixed;left:10px;top:10px;z-index:99999;background:#8a7a5c;border:2px solid #000';document.body.appendChild(c);const g=c.getContext('2d');
    let y0=0;for(const k of ['leo','ursa','tholo','valencia']){let im=null;for(let i=0;i<80;i++){im=bst100Img(k,0);if(im&&im.complete&&im.naturalWidth)break;await W8(100)}if(!im)continue;const M=BEAST100_META[k],me=M.iw,row=0;
      for(let f=0;f<8;f++){const sc=0.78;g.drawImage(im,f*me[0],row*me[1],me[0],me[1],f*me[0]*sc,y0,me[0]*sc,me[1]*sc);const pc=g6Proc(im,M,me,f,row);if(pc)g.drawImage(pc,0,0,me[0],me[1],f*me[0]*sc,y0+me[1]*sc+2,me[0]*sc,me[1]*sc)}
      y0+=(me[1]*0.78*2)+6;if(y0>520)break}});await shot(pg,'g6_beasts');await pg.evaluate(()=>document.getElementById('g6shot').remove())}
/* 390 px: the Challenges card + the sandstone closers fit */
{const ph=await open({},390,844);await ph.evaluate(()=>{openSetup(true)});await until(ph,()=>document.querySelector('#mBody .pn100ev,#mBody .pn-top'));await W(ph,1500);
 const hasBtn=await ph.evaluate(()=>!!document.querySelector('[data-dc100pn]'));
 if(hasBtn){await ph.evaluate(()=>document.querySelector('[data-dc100pn]').click());await until(ph,()=>document.getElementById('dc102'),4000);await W(ph,400);
  const r=await ph.evaluate(()=>{const b=document.querySelector('#dc102 .dc102box').getBoundingClientRect();return {l:b.left,r:b.right,w:innerWidth,over:document.documentElement.scrollWidth>innerWidth+1,go:[...document.querySelectorAll('#dc102 [data-dc100go]')].every(x=>{const q=x.getBoundingClientRect();return q.right<=innerWidth+1})}});
  ok(r.l>=0&&r.r<=r.w+1&&!r.over&&r.go,'390: the Challenges card fits '+JSON.stringify(r));await shot(ph,'challenges_390')}
 await closeAll(ph);await ph.evaluate(()=>{openStudio()});await W(ph,1800);const sx=await ph.evaluate(()=>{const m=document.getElementById('mClose').getBoundingClientRect();return {r:m.right,w:innerWidth,h:m.height,over:document.documentElement.scrollWidth>innerWidth+1}});
 ok(sx.r<=sx.w+1&&!sx.over,'390: the Studio exit slab fits '+JSON.stringify(sx));await shot(ph,'studio_390');await ph.context().close()}
ok((await newErr(pg)).length===0,'no new errors '+JSON.stringify(await newErr(pg)));
console.log(miss.length?'MISSING '+JSON.stringify(miss,null,1):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
