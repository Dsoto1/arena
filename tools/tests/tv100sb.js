/* v1.0 THE SANDSTONE SLAB ON EVERY WINDOW'S MAIN BUTTON (306-v100sand): a confirm modal's primary = porphyry slab (m), the other =
   sandstone (s), both keep data-mi / text / order / disabled and still resolve the window; a delete confirm (ask76) = carbon; a modal
   "Abandon …" = carbon; pick windows (card art) + docked/full windows untouched; Manager ⏭ End the week + ⚡ Simulate Match Week, Settings
   ↺ Restore all defaults (carbon), the results window, the online room's ▶ Start (mock) styled; AA contrast of every slab kind; 390 px: no
   overflow, ≥40 px targets; Reduce motion = no lift; kill switch flavius_sand100off=1 = today's buttons; no new 00c errors.
   SHOT=<dir> saves sand100_*.png (1440 + 390). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,ls)=>{const ctx=await b.newContext({viewport:{width:W,height:H}});await ctx.route(/fonts\./,r=>r.abort());const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide();window.__e0=ERR92.n;
    /* WCAG contrast of two css colours */
    window.__cr=(a,c)=>{const p=s=>{const m=String(s).match(/\d+(\.\d+)?/g).map(Number);return m.slice(0,3)};const L=x=>{const [r,g,b]=p(x).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};const l1=L(a),l2=L(c);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
    window.__slab=b=>{if(!b)return null;const cs=getComputedStyle(b),bf=getComputedStyle(b,'::before');const r=b.getBoundingClientRect();return {cls:b.className,col:cs.color,bg:cs.backgroundImage.slice(0,60),bfbg:bf.backgroundImage.slice(0,40),h:r.height,w:r.width,l:r.left,r:r.right,sw:b.scrollWidth,cw:b.clientWidth,mi:b.dataset.mi,txt:b.textContent,dis:b.disabled}}});return pg};
const until=async(pg,fn,ms=15000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const newErr=async pg=>pg.evaluate(()=>errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)));
const shot=async(pg,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await pg.screenshot({path:path.join(SHOT,'sand100_'+n+'.png')})}};
/* the darkest stops each kind's text sits on (sandstone bottom, porphyry top, carbon top) */
const BG={sec:'rgb(180,143,92)',pri:'rgb(143,42,30)',dan:'rgb(38,38,42)'};
const pg=await open(1440,900);
/* ---- 1 · a confirm modal ---- */
await pg.evaluate(()=>{window.__v='pending';modal('Confirm the bout?','<p>The fighters wait.</p>',[{label:'⚔ Send them in',sub:'the crowd is ready',value:1,primary:1},{label:'Not yet',value:0}]).then(v=>window.__v=v)});
await until(pg,()=>document.querySelector('#mBtns .btn.sd100'));await pg.waitForTimeout(300);
const C=await pg.evaluate(()=>{const B=[...document.querySelectorAll('#mBtns > button')];return B.map(__slab)});
ok(C.length===2&&/sd100p/.test(C[0].cls)&&/sd100m/.test(C[0].cls)&&/primary/.test(C[0].cls)&&/linear-gradient/.test(C[0].bfbg),'confirm: primary = porphyry slab m '+JSON.stringify(C[0]));
ok(/sd100/.test(C[1].cls)&&!/sd100p|sd100d/.test(C[1].cls)&&/svg|linear-gradient/.test(C[1].bg),'confirm: the other = sandstone slab '+JSON.stringify(C[1]));
ok(C[0].mi==='0'&&C[1].mi==='1'&&/Send them in/.test(C[0].txt)&&/the crowd is ready/.test(C[0].txt)&&C[1].txt==='Not yet','text, sub-line, data-mi and order kept');
ok(C.every(c=>c.h>=40),'targets ≥ 40 px');
const cr={pri:await pg.evaluate(([c,b])=>__cr(c,b),[C[0].col,BG.pri]),sec:await pg.evaluate(([c,b])=>__cr(c,b),[C[1].col,BG.sec])};
await shot(pg,'confirm_1440');
await pg.hover('#mBtns [data-mi="0"]');await pg.waitForTimeout(250);
const hv=await pg.evaluate(()=>{const b=document.querySelector('#mBtns [data-mi="0"]');return {t:getComputedStyle(b).transform,c:getComputedStyle(b).color}});
ok(hv.t!=='none','hover lifts the slab '+hv.t);cr.prih=await pg.evaluate(([c,b])=>__cr(c,b),[hv.c,BG.pri]);
await pg.click('#mBtns [data-mi="0"]');ok(await until(pg,()=>window.__v===1,3000),'clicking the primary still resolves the window with its value '+await pg.evaluate(()=>String(window.__v)+'|'+document.getElementById('mTitle').textContent+'|'+document.getElementById('modal').hidden));
/* ---- 2 · a destructive modal + a delete confirm (ask76) ---- */
await pg.evaluate(()=>{window.__v='pending';modal('Leave?','<p>…</p>',[{label:'Abandon the event',value:'ab'},{label:'Keep playing',value:'k',primary:1}]).then(v=>window.__v=v)});
await until(pg,()=>document.querySelector('#mBtns .btn.sd100'));
const D=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns > button')].map(__slab));
ok(/sd100d/.test(D[0].cls)&&/repeating-linear-gradient/.test(D[0].bg),'"Abandon the event" = carbon '+D[0].cls);ok(/sd100p/.test(D[1].cls),'the primary stays porphyry');
cr.dan=await pg.evaluate(([c,b])=>__cr(c,b),[D[0].col,BG.dan]);
await pg.click('#mBtns [data-mi="1"]');ok(await until(pg,()=>window.__v==='k',3000),'resolves');
await pg.evaluate(()=>{window.__a='pending';ask76('🗑 Delete Gaius?','It is gone for good — this cannot be undone.',_T('Delete'),_T('Keep it')).then(v=>window.__a=v)});
await until(pg,()=>document.querySelector('.ask76bg [data-ask76="1"].sd100'));await pg.waitForTimeout(250);
const K=await pg.evaluate(()=>[...document.querySelectorAll('.ask76bg [data-ask76]')].map(__slab));
ok(/sd100d/.test(K[0].cls)&&/repeating-linear-gradient/.test(K[0].bg)&&K[0].txt==='Delete','delete confirm: Delete = carbon '+JSON.stringify(K[0]));ok(/sd100/.test(K[1].cls)&&!/sd100[pd]/.test(K[1].cls),'Keep it = sandstone');
await shot(pg,'delete_1440');
await pg.click('.ask76bg [data-ask76="1"]');ok(await until(pg,()=>window.__a===true,3000),'Delete still answers yes');
/* ---- 3 · left alone: a pick window with card art, a full-screen window ---- */
await pg.evaluate(()=>{modal('Pick one','<p>…</p>',[{label:'Gladius',card:'w:gladius',value:'a'},{label:'Spear',card:'w:spear',value:'b'}])});await pg.waitForTimeout(300);
const pk=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns > button')].map(b=>b.className+'|'+!!b.querySelector('.cimg,img,svg')));
ok(pk.length&&pk.every(s=>!/sd100/.test(s)||!/true$/.test(s)),'card-art pick windows keep their look '+JSON.stringify(pk));
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await pg.waitForTimeout(250);
/* ---- 4 · Settings: Restore all defaults = carbon ---- */
await pg.evaluate(()=>openSettings());await until(pg,()=>document.querySelector('[data-rst84]'));await pg.waitForTimeout(400);
const R=await pg.evaluate(()=>__slab(document.querySelector('[data-rst84]')));ok(/repeating-linear-gradient/.test(R.bg),'Settings ↺ Restore all defaults = carbon '+JSON.stringify(R));
await pg.evaluate(()=>{for(let i=0;i<3&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)});await pg.waitForTimeout(500);
/* ---- 5 · Manager: End the week + Simulate Match Week ---- */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;
  for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('night');await W8(1000);MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(600)});
await until(pg,()=>document.querySelector('#mgrBody [data-mg="endask"]'));
const M=await pg.evaluate(()=>({end:__slab(document.querySelector('#mgrBody .tabrow [data-mg="endask"]')),sim:__slab(document.querySelector('#mgrBody [data-mg="simall"]'))}));
ok(M.end&&/svg|gradient/.test(M.end.bg)&&M.end.h>=40,'Manager ⏭ End the week = slab '+JSON.stringify(M.end));
ok(M.sim&&/linear-gradient/.test(M.sim.bfbg)&&M.sim.h>=40,'⚡ Simulate Match Week = porphyry slab '+JSON.stringify(M.sim));
await shot(pg,'manager_1440');
await pg.evaluate(()=>{for(let i=0;i<3&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)});await pg.waitForTimeout(600);
/* ---- 6 · Online room (mock): ▶ Start = porphyry m, Close lobby = carbon ---- */
await pg.evaluate(async()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over)/.test(k))localStorage.removeItem(k);if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  ONL.acct=await NET.req('auth.signin',{name:'Alpha'});await NET.req('domus.create',{name:'Domus Alpha'});await NET.req('lanista.name',{name:'Lanista Alpha'});ONL.char=await NET.req('char.create',{name:'Alpha the Bold',cls:'hero'})});
pg.evaluate(()=>{onlineOpen('lobby')}).catch(()=>{});await pg.waitForSelector('#onl',{timeout:30000});await pg.waitForTimeout(600);await pg.evaluate(()=>{ONL.tab='lobby';onlRedraw()});
await pg.waitForSelector('#onl [data-onl="mkroom"][data-v="0"]',{timeout:20000});await pg.click('#onl [data-onl="mkroom"][data-v="0"]');
ok(await until(pg,()=>document.querySelector('#onlRoom80 [data-onl="start"]'),20000),'the room with ▶ Start');await pg.waitForTimeout(500);
const O=await pg.evaluate(()=>({st:__slab(document.querySelector('#onlRoom80 [data-onl="start"]')),lv:__slab(document.querySelector('#onlRoom80 [data-onl="leave"]'))}));
ok(O.st&&/linear-gradient/.test(O.st.bfbg)&&O.st.h>=44,'room ▶ Start = porphyry slab m '+JSON.stringify(O.st));ok(O.lv&&/repeating-linear-gradient/.test(O.lv.bg),'🚪 Close lobby = carbon '+JSON.stringify(O.lv));
await shot(pg,'room_1440');
await pg.evaluate(()=>{for(let i=0;i<3&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)});await pg.waitForTimeout(600);
/* ---- 7 · the results window ---- */
await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');
  const seats=[{cls:'slave',cpu:true,diff:'easy'},{cls:'soldier',cpu:true},{cls:'amazonia',cpu:true,diff:'easy'},{cls:'hero',cpu:true}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:0}})});
await pg.waitForTimeout(1500);await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);simToEnd()});
await until(pg,()=>[...document.querySelectorAll('#mBtns button')].some(b=>/Sim to end/.test(b.textContent)),8000);await pg.waitForTimeout(300);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Sim to end/.test(b.textContent));b&&b.click()});
const resOk=await until(pg,()=>S&&S.over&&!document.getElementById('modal').hidden&&!!document.querySelector('.rcard')&&document.querySelector('#mBtns .btn.sd100p'),90000);
const RS=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns > button')].map(b=>b.className.replace('btn ','')+':'+b.textContent.slice(0,18)));
ok(resOk,'results window: the main button is a porphyry slab '+JSON.stringify(RS));await pg.waitForTimeout(500);await shot(pg,'results_1440');
await pg.evaluate(()=>{for(let i=0;i<3&&CUR_MODAL;i++)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:'close')});
/* ---- contrast ---- */
ok(cr.pri>=4.5&&cr.prih>=4.5&&cr.sec>=4.5&&cr.dan>=4.5,'AA contrast on every slab kind '+JSON.stringify(cr));
/* ---- 8 · Reduce motion ---- */
await pg.evaluate(()=>{SETTINGS.calm=true;applySettings(false);window.__v='p';modal('Sure?','<p>…</p>',[{label:'Yes',value:1,primary:1},{label:'Cancel',value:0}]).then(v=>window.__v=v)});
await until(pg,()=>document.querySelector('#mBtns .btn.sd100'));await pg.hover('#mBtns [data-mi="0"]');await pg.waitForTimeout(250);
const rm=await pg.evaluate(()=>({h:document.documentElement.classList.contains('sd100rm'),t:getComputedStyle(document.querySelector('#mBtns [data-mi="0"]')).transform}));
ok(rm.h&&rm.t==='none','Reduce motion: no lift '+JSON.stringify(rm));
await pg.evaluate(()=>{CUR_MODAL&&CUR_MODAL.done(0);SETTINGS.calm=false;applySettings(false)});
const e1=await newErr(pg);ok(!e1.length,'no new errors '+JSON.stringify(e1));
/* ---- 9 · phones 390 ---- */
const ph=await open(390,844);
await ph.evaluate(()=>{modal('Seal the contract?','<p>…</p>',[{label:'✍ Sign him for three seasons at the asking wage',sub:'his agent smiles; the clerk does not',value:1,primary:1},{label:'Walk away from the table',value:0},{label:'🗑 Release him',value:2}])});
await until(ph,()=>document.querySelector('#mBtns .btn.sd100'));await ph.waitForTimeout(300);
const P=await ph.evaluate(()=>({b:[...document.querySelectorAll('#mBtns > button')].map(__slab),vw:document.documentElement.clientWidth,sx:document.documentElement.scrollWidth}));
ok(P.b.length===3&&P.b.every(x=>x.r<=P.vw+0.5&&x.l>=-0.5&&x.sw<=x.cw+2&&x.h>=40),'390 px: slabs wrap inside the screen, ≥40 px '+JSON.stringify(P.b.map(x=>[x.l|0,x.r|0,x.sw,x.cw,x.h|0])));
ok(/sd100d/.test(P.b[2].cls),'"Release him" = carbon');ok(P.sx<=P.vw+1,'no sideways scroll');
await shot(ph,'confirm_390');
await ph.evaluate(()=>{CUR_MODAL&&CUR_MODAL.done(0);ask76('🗑 Delete Maximus the Unbreakable of Capua?','It is gone for good — this cannot be undone.',_T('Delete'),_T('Keep it'))});await ph.waitForTimeout(400);
const PA=await ph.evaluate(()=>[...document.querySelectorAll('.ask76bg [data-ask76]')].map(__slab));ok(PA.length===2&&PA.every(x=>x.r<=390.5&&x.h>=40),'390 px delete confirm fits '+JSON.stringify(PA.map(x=>[x.l|0,x.r|0,x.h|0])));
await shot(ph,'delete_390');
await ph.evaluate(()=>{const bg=document.querySelector('.ask76bg');bg&&bg.querySelector('[data-ask76="0"]').click()});
/* ---- 10 · kill switch ---- */
const off=await open(1440,900,{flavius_sand100off:'1'});
await off.evaluate(()=>{modal('Confirm?','<p>…</p>',[{label:'Yes',value:1,primary:1},{label:'Cancel',value:0}])});await until(off,()=>document.querySelector('#mBtns .btn'));await off.waitForTimeout(250);
const KO=await off.evaluate(()=>{const b=document.querySelector('#mBtns [data-mi="0"]');return {cls:b.className,on:document.documentElement.classList.contains('sd100on'),bf:getComputedStyle(b,'::before').content,bg:getComputedStyle(b).backgroundImage}});
ok(!/sd100/.test(KO.cls)&&!KO.on&&KO.bg==='none','kill switch: today\'s button '+JSON.stringify(KO));
console.log(JSON.stringify({cr,res:RS}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,5)));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
