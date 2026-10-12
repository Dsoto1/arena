/* v1.0 INSIGNIA (304-v100insig + 304a-v100insigui): one heraldry engine, six Roman kinds.
   1 the read-time adapter round-trips an old customFlags row and an old m.flag (nothing rewritten) · 2 every kind renders and decodes ·
   3 the chips are PARMAE under 44 px · 4 the 8 Domus-rank flammulae + 7 region vexilla exist (and the house parma rides a high rank) ·
   5 the Studio's 🛡 Insignia designer: system designs offer Copy & edit only, a saved design carries 📜 · 🔒 · Edit · Copy · Delete and
   Delete asks first (DEL76) · 6 the online Domus look round-trips through the MOCK server's cleanLook89 (new fields kept, sculpt dropped) ·
   7 the kill switch localStorage flavius_insig100off=1 = today's flags exactly · 8 phone 390: the designer never scrolls sideways.
   SHOT=<dir> saves in100_*.png (designer 1440 + 390, Manager league chips, arena velarium + Flavius's box, Domus card). */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[],miss=[],out={};const ok=(c,m)=>{if(!c)miss.push(m)};
async function open(o={}){const ctx=await b.newContext(o.phone?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},o.ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}});return {ctx,pg}}
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:path.join(SHOT,`in100_${n}.png`)})};
const OLD={id:'fold1',name:'Old Boar',bg:'#1d4a2a',fg:'#e0433a',txt:'APER',shape:'boar',layers:[],baked:[],v:3};

/* ======== 1–5 desktop ======== */
{const {ctx,pg}=await open();
  const r=await pg.evaluate(async OLD=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    /* 1 adapter */
    const n=ins100Norm(OLD);o.ad=n.c1===OLD.bg&&n.c2===OLD.bg&&n.fg===OLD.fg&&n.ins===OLD.txt&&n.emb===OLD.shape&&n.pat==='plain'&&n.wear===0&&n.trim.gilt===true;
    o.untouched=OLD.c1===undefined&&OLD.v===3;const row=ins100Row({...OLD});const n2=ins100Norm(row);o.rt=row.v===2&&row.bg===OLD.bg&&row.txt===OLD.txt&&row.shape===OLD.shape&&JSON.stringify(n2)===JSON.stringify(n);
    const m={id:'mx',name:'Quintus',ludus:'Ludus Batiatus',city:'Capua'};const der=mgrFlagOf(m);o.derived=!!der&&der.bg&&ins100Norm(der).c1===der.bg;
    o.mflag=ins100Norm({bg:'#6e1414',fg:'#e2b64a',txt:'LB',shape:'eagle'}).emb==='eagle';
    /* 2 every kind decodes */
    const dec=u=>new Promise(res=>{const im=new Image();im.onload=()=>res(im.naturalWidth>0);im.onerror=()=>res(false);im.src=u});
    o.kinds={};for(const k of INS100_KS)for(const px of [0,30])o.kinds[k+px]=await dec(insignia100({...row,pat:'meander',ins:'APER'},k,px));
    o.pannus=await dec(houseFlagURI(OLD));o.cache=insignia100(OLD,'parma',22)===insignia100(OLD,'parma',22);
    /* 3 parma chips */
    const host=document.createElement('div');host.innerHTML=flagChip(m,22)+famFlagChip('Gaius Cassius',15)+(typeof parma100==='function'?parma100(m,28):'');document.body.appendChild(host);await W8(300);
    const imgs=[...host.querySelectorAll('img')];o.chips=imgs.map(i=>{const R=i.getBoundingClientRect();return [Math.round(R.width),Math.round(R.height)]});o.chipOK=imgs.length>=3&&o.chips.every(([w,h])=>w>0&&h>0&&w<44&&h<44);
    o.parmaSrc=imgs.slice(0,2).every(i=>decodeURIComponent(i.src).includes('viewBox="0 0 160 160"'));host.remove();
    /* 4 ranks + regions */
    o.dr=ONLC.DRANKS98.map(R=>dr98URI(R.k));o.drOK=o.dr.length===8&&new Set(o.dr).size===8&&o.dr.every(u=>/^data:image\/svg\+xml/.test(u)&&decodeURIComponent(u).includes('viewBox="0 0 110 262"'));
    o.drChip=/class="dr98c"/.test(dr98Chip('ludus'));o.rg=ONLC.REGIONS98.map(R=>rg98Flag(R.k));o.rgOK=o.rg.length===7&&o.rg.every(h=>/class="rg98/.test(h));
    o.parmaBar=ins100Rank('ludusmagnus',{c1:'#7a2230',c2:'#d6ab4c',crest:'boar'})!==dr98URI('ludusmagnus')&&ins100Rank('ludus',{c1:'#7a2230',c2:'#d6ab4c',crest:'boar'})===dr98URI('ludus');
    o.sys=Object.keys(ins100Sys()).length;o.drUsed=decodeURIComponent(dr98URI('aurea')).includes('#c08a22');
    o.lang=typeof flag91==='function'?String(flag91('it',36)).indexOf('viewBox="0 0 160 160"')<0:true;
    /* 5 the designer */
    await Store.del('customFlags','fold1').catch(()=>{});await Store.put('customFlags','fold1',OLD);await loadFlags();
    openStudio('flags');await W8(1500);o.des=!!document.getElementById('in100');o.tabName=[...document.querySelectorAll('#studio button,#studio a')].some(x=>/Insignia/.test(x.textContent));
    o.kindBtns=document.querySelectorAll('#in100 [data-in100k]').length;
    const sysCards=[...document.querySelectorAll('#in100 [data-in100syscard]')];o.sysN=sysCards.length;
    o.sysLocked=sysCards.length>=30&&sysCards.every(c=>!c.querySelector('[data-cr]')&&c.querySelector('[data-in100sys]')&&[...c.querySelectorAll('button')].filter(x=>!x.disabled).length===1);
    const card=[...document.querySelectorAll('#in100 .in100rc')].find(c=>/Old Boar/.test(c.textContent));o.oldOpens=!!card;
    o.row=card?['rolls','lock','edit','copy','del'].every(a=>card.querySelector(`[data-cr="${a}"][data-id="fold1"]`)):false;
    o.stillOld=!((await Store.getDoc('customFlags','fold1'))||{}).c1;
    /* edit the old row → change the pattern + inscription → save = v2 */
    card.querySelector('[data-cr="edit"]').click();await W8(800);document.querySelector('#in100 [data-in100t="pat"]').click();document.querySelector('#in100 [data-in100pat="clavi"]').click();
    const ii=document.querySelector('#in100 [data-in100f="ins"]');ii.value='aper juli';ii.dispatchEvent(new Event('input',{bubbles:true}));o.caps=ii.value==='APER IVLI';
    document.querySelector('#in100 [data-in100a="save"]').click();await W8(900);const sv=await Store.getDoc('customFlags','fold1');o.saved=!!sv&&sv.v===2&&sv.pat==='clavi'&&sv.ins==='APER IVLI'&&sv.bg===sv.c1&&sv.txt==='APER IVLI'&&sv.shape==='boar';
    /* system: Copy & edit only puts it on the bench */
    const n0=(CUSTOM.flags||[]).length;document.querySelector('#in100 [data-in100sys="city:capua"]').click();await W8(900);o.copied=/Capua/.test(ST.fd.name||'')&&ST.fd.c1&&(CUSTOM.flags||[]).length===n0;
    /* delete asks first */
    let d=document.querySelector('#in100 [data-cr="del"][data-id="fold1"]');d.click();await W8(400);o.ask=/Old Boar/.test((document.querySelector('.ask76bg')||{}).textContent||'');
    document.querySelector('[data-ask76="0"]').click();await W8(400);o.kept=!!(await Store.getDoc('customFlags','fold1'));
    d=document.querySelector('#in100 [data-cr="del"][data-id="fold1"]');d.click();await W8(400);document.querySelector('[data-ask76="1"]').click();await W8(800);o.gone=!(await Store.getDoc('customFlags','fold1'));
    o.sw=document.documentElement.scrollWidth<=innerWidth+1;return o},OLD);
  out.desk=r;for(const k of ['ad','untouched','rt','derived','mflag','pannus','cache','chipOK','parmaSrc','drOK','drChip','rgOK','parmaBar','drUsed','lang','des','tabName','oldOpens','row','stillOld','caps','saved','copied','ask','kept','gone','sw'])ok(r[k],'1-5 '+k+' '+JSON.stringify(r[k]));
  ok(r.kindBtns===6,'six kinds');ok(r.sysN>=30,'system designs '+r.sysN);ok(r.sysLocked,'system designs: Copy & edit only');ok(Object.values(r.kinds).every(Boolean),'every kind decodes '+JSON.stringify(r.kinds));
  if(SHOT){await pg.evaluate(async()=>{ST.fd=blankFlag();ST.fd.name='Domus Valeria';ST.fd.emb='boar';ST.fd.ins='DOMVS·VALERIA';studioRedraw();await new Promise(r=>setTimeout(r,800))});await shot(pg,'designer_1440');
    await pg.evaluate(async()=>{document.querySelector('#in100 [data-in100t="emb"]').click();await new Promise(r=>setTimeout(r,300))});await shot(pg,'designer_emb_1440');
    await pg.evaluate(async()=>{const r=document.querySelector('#in100 .in100rack.sys');if(r)r.scrollIntoView();await new Promise(r=>setTimeout(r,300))});await shot(pg,'designer_sys_1440');
    /* the Manager league + ludus banner */
    await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{closeStudio&&closeStudio()}catch(e){}if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);openManager();await W8(500);newWorld({type:'pre',key:MGR_PRE[4].key});await W8(300);MGR.tab='league';MGR_REDRAW();await W8(800)});await shot(pg,'mgr_league_1440');
    await pg.evaluate(async()=>{MGR.tab='ludus';MGR_REDRAW();await new Promise(r=>setTimeout(r,800))});await shot(pg,'mgr_ludus_1440');
    /* the arena: velaria + Flavius's box */
    await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{if(typeof closeManager==='function')closeManager()}catch(e){}
      startEvent({ev:'democritus',loc:0,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});
      for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
      SPEED='pause';try{menuHide()}catch(e){}for(let i=0;i<30;i++){draw();await W8(100)}});await shot(pg,'arena_1440')}
  await ctx.close()}

/* ======== 6 the online Domus look through the mock ======== */
{const {ctx,pg}=await open({ls:{flavius_online77:'1',flavius_onlcd83:'0'}});
  const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match)/.test(k))localStorage.removeItem(k);const o={};
    ONL.acct=await NET.req('auth.signin',{name:'Valerius'});ONL.domus=(await NET.req('domus.create',{name:'Valeria'})).domus;await NET.req('char.create',{name:'Gamma',cls:'hero'});
    const look={c1:'#5b1a45',c2:'#e2b64a',crest:'bull',c3:'#b5832e',pat:'meander',ins:'domus vale!',trim:{gilt:true,tassels:true,fringe:false,bar:true,fc:'creta',evil:'<x>'},wear:0.355,top:'manus',layers:[{t:'circle'}],baked:[{t:'x'}]};
    const rr=await NET.req('domus.look',look);const L=(rr.domus||{}).look89||{};o.L=L;
    o.kept=L.crest==='bull'&&L.c3==='#b5832e'&&L.pat==='meander'&&L.ins==='DOMVS VALE'&&L.trim&&L.trim.tassels===true&&L.trim.fringe===false&&L.trim.fc==='creta'&&!('evil' in L.trim)&&L.wear===0.36&&L.top==='manus';
    o.noSculpt=!('layers' in L)&&!('baked' in L);
    o.old=JSON.stringify(ONLC.cleanLook89({c1:'#7a2230',c2:'#d6ab4c',crest:'boar'}))===JSON.stringify({c1:'#7a2230',c2:'#d6ab4c',crest:'boar'});
    let bad=0;try{ONLC.cleanLook89({c1:'#7a2230',c2:'#d6ab4c',crest:'dragon'})}catch(e){bad=1}o.refuse=!!bad;
    ONL.domus=rr.domus||ONL.domus;onlineOpen('char');for(let i=0;i<60&&!document.getElementById('onl');i++)await W8(150);ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw();await W8(800);
    const dl=d89Look();o.look=dl.pat==='meander'&&dl.ins==='DOMVS VALE';const cr=document.querySelector('#onl .db89-crest');o.scutum=!!cr&&decodeURIComponent(cr.src).includes('viewBox="0 0 180 270"');
    /* the look editor shows the full design and sends it back */
    if(typeof V89D!=='undefined'){V89D.open.look=true;onlRedraw();await W8(500)}const ed=document.querySelector('#onl .lk100');o.editor=!!ed&&!!ed.querySelector('[data-lk100p]')&&!!ed.querySelector('[data-lk100ins]');
    if(ed){ed.querySelector('[data-lk100p="clipeus"]').click();await W8(150);ed.querySelector('[data-d89="look"]').click();for(let i=0;i<30&&ONL.busy;i++)await W8(150);await W8(400);const D2=await NET.req('domus.get',{});o.sent=((D2.domus||{}).look89||{}).pat==='clipeus'&&((D2.domus||{}).look89||{}).ins==='DOMVS VALE'}
    return o});
  out.onl=r;for(const k of ['kept','noSculpt','old','refuse','look','scutum','editor','sent'])ok(r[k],'6 '+k+' '+JSON.stringify(k==='kept'?r.L:r[k]));
  if(SHOT){await pg.evaluate(()=>{const e=document.querySelector('#onl .db89');if(e)e.scrollIntoView()});await shot(pg,'domus_1440')}
  await ctx.close()}

/* ======== 7 kill switch ======== */
{const {ctx,pg}=await open({ls:{flavius_insig100off:'1'}});
  const r=await pg.evaluate(async OLD=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};o.off=INS100.off;o.shim=flagURI===flagURI0;
    o.house=houseFlagURI(OLD)===flagURI0(OLD.bg,OLD.fg,OLD.txt,OLD.shape,'');const m={id:'mx',name:'Q',ludus:'Ludus Batiatus',city:'Capua'};o.chip=decodeURIComponent(flagChip(m,20)).includes("viewBox='0 0 600 340'");
    o.dr=!decodeURIComponent(dr98URI('ludus')).includes('viewBox="0 0 110 262"');openStudio('flags');await W8(1200);o.press=!document.getElementById('in100')&&!!document.getElementById('fdPrev');return o},OLD);
  out.kill=r;for(const k in r)ok(r[k],'7 kill switch '+k);await ctx.close()}

/* ======== 8 phone 390 ======== */
{const {ctx,pg}=await open({phone:true});
  const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openStudio('flags');await W8(1500);const o={des:!!document.getElementById('in100'),sw:document.documentElement.scrollWidth,vw:innerWidth};
    for(const t of ['pat','emb','ins','sculpt','trim']){const b2=document.querySelector(`#in100 [data-in100t="${t}"]`);if(b2)b2.click();await W8(150);o['sw_'+t]=document.documentElement.scrollWidth}
    const el=document.getElementById('in100');o.wide=el?[...el.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.offsetParent).slice(0,3).map(e=>e.className||e.tagName):[];
    document.querySelector('#in100 [data-in100t="cloth"]').click();return o});
  out.phone=r;ok(r.des,'8 designer on the phone');ok(r.sw<=r.vw+1&&['pat','emb','ins','sculpt','trim'].every(t=>r['sw_'+t]<=r.vw+1),'8 no sideways scroll at 390 '+JSON.stringify(r));
  if(SHOT){await pg.evaluate(()=>{const e=document.getElementById('in100');if(e)e.scrollIntoView()});await shot(pg,'designer_390')}
  await ctx.close()}

console.log(JSON.stringify(out).slice(0,2500));console.log('MISS',miss);console.log('ERRS',errs.slice(0,6));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
