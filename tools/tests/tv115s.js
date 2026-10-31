/* v1.15 SETTINGS REORGANISATION (430-v115set; his 1a–8a 2026-10-31, tools/plans/v115/SETTINGS.md). Checks:
   (1) OLD SAVED SETTINGS (v1.14b keys, every one off its default, incl. fx=false and two city editor picks, Bronze spikes, CPU speed
       Slow) load identically with the new layout and with the kill switch: same SETTINGS, same stored flavius_settings after
       applySettings(), same applied state (Q110, lighting, ANIM88, XRAY, reduce motion, spike, hit mode, editors, speed);
   (2) every moved row shows that value on its NEW tab (Play · Hints · Graphics · Crowd & voices · Accessibility · Data & saves), each key
       once (Confirm before End turn only in Play), Hit feedback shows "Off" for fx=false, See-through buttons Auto / On / Off;
   (3) Hit feedback Off writes fx=false (hit100 kept), Full/Mine/Quiet write fx=true; survives a reload;
   (4) old tab keys land: sponsors → crowd, tokens → pieces, visuals → general, saves → data;
   (5) 422: a refused save → the read-only storage line on Data & saves (and the cookie keeps the choice); another tab's change adopted;
   (6) 390 px: 8 pills, short labels, no sideways scroll, CPU speed's ❚❚ Pause not clipped;
   (7) kill switch flavius_v115setoff=1: the v1.14b window (6 tabs, Restore in the header, Saves link in the footer, fx switch).
   node tools/tests/tv115s.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,700))};
/* a v1.14b player's saved choices (every one off its default) */
const OLD={fx:false,shake:false,gore:false,flavius:false,thoughts:false,famous:false,shoutsSpect:false,cityChatter:false,reveals:false,capFeed:true,
  confirmEnd:true,confirmAtk106:true,cam88:false,briefing:false,ctxMenu:false,hsTurn90:true,xray:'on',anim88:'quick',quality110:'medium',q110v:1,
  light106:'light',face99:'light',hit100:'mine',bases101:false,fps100:true,calm:true,tscale:115,pots90:'tokens',cvdMode:'rg',cvd:true,locFlavor:false};
const SEED={flavius_settings:JSON.stringify(OLD),flavius_sponsors:JSON.stringify({map:{1:'flavius',6:'flavius'}}),flavius_speed111:'slow',flavius_capfeed53:'1',flavius_light106:'light',
  flavius_theme:JSON.stringify({spike:'#9a6a32'})};
const ctx=async(o={})=>{const c=await b.newContext({viewport:o.phone?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:o.phone?2:1,isMobile:!!o.phone,hasTouch:!!o.phone});
  await c.route(/fonts\./,r=>r.abort());
  await c.addInitScript(([ls,q])=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});
    if(!localStorage.getItem('flavius_t115seed')){localStorage.setItem('flavius_t115seed','1');localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])}
    if(q){const f=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='flavius_settings')throw new DOMException('full','QuotaExceededError');return f.apply(this,arguments)}}},[{...SEED,...(o.ls||{})},!!o.quota]);return c};
const ready=async pg=>{await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}})};
const newPage=async c=>{const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await ready(pg);return pg};
const STATE=pg=>pg.evaluate(()=>{applySettings();return {set:JSON.stringify(Object.keys(SETTINGS).sort().map(k=>[k,SETTINGS[k]])),stored:JSON.stringify(Object.entries(JSON.parse(localStorage.getItem('flavius_settings'))).sort()),
  q:Q110.mode,pref:l106Pref(),anim:ANIM88(),xray:XRAY,calm:!!reduceMotion(),spike:String(THEME.spike).toLowerCase(),hit:typeof h100Mode==='function'?h100Mode():null,fx:SETTINGS.fx,
  thoughts:THOUGHTS,ed1:sponsorForLoc(1),ed6:sponsorForLoc(6),speed:SPEED,face:SETTINGS.face99,ts:document.body.classList.contains('ts115')}});
/* open Settings on a tab and read the page */
const READ=(pg,tab)=>pg.evaluate(async tab=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(!document.querySelector('#s98')){openSettings();await W8(300)}
  const t=document.querySelector(`#s98 [data-stab="${tab}"]`);if(t){t.click();await W8(200)}const s=document.querySelector('#s98');const q=x=>s.querySelector(x);
  const on=sel=>[...s.querySelectorAll(sel)].filter(e=>e.classList.contains('on')).map(e=>Object.values(e.dataset).find(v=>v&&!/[ -]/.test(v))||e.textContent.trim());
  const cb={};s.querySelectorAll('input[type=checkbox][data-set]').forEach(i=>cb[i.dataset.set]=i.checked);
  const rowD=k=>{const i=q(`input[data-set="${k}"]`);const r=i&&i.closest('.s98-row');const d=r&&r.querySelector('.d');return d&&getComputedStyle(d).display!=='none'?d.textContent:''};
  return {page:s.dataset.page,cb,keys:[...s.querySelectorAll('input[type=checkbox][data-set]')].map(i=>i.dataset.set),anim:on('[data-anim88]'),xray:on('[data-sxray]'),xrayTxt:[...s.querySelectorAll('[data-sxray]')].map(x=>x.textContent.trim()),
    speed:on('[data-sspeed]'),hit:on('[data-hit100]'),hitOff:!!q('[data-hit115="off"].on'),hasHitOff:!!q('[data-hit115]'),q110:on('[data-q110]'),light:on('[data-light106]'),face:on('[data-face99]'),
    pots:on('[data-pots90]'),spike:on('[data-spike98]'),ts:on('[data-ts98]'),cvd:(q('select[data-cvd84]')||{}).value,eds:s.querySelectorAll('select[data-spcity]').length,
    ed1:(q('select[data-spcity="1"]')||{}).value,ed6:(q('select[data-spcity="6"]')||{}).value,atkD:rowD('confirmAtk106'),atkRaw:!!q('label.setrow input[data-set="confirmAtk106"]'),
    qcard:(()=>{const a=q('#q110d'),n=q('#l111now'),l=q('[data-light106]'),f=q('[data-face99]'),m=q('input[data-set="fps100"]');const c=a&&a.closest('section');return !!c&&[n,l,f,m].every(x=>x&&x.closest('section')===c)})(),
    lightTxt:(()=>{const l=q('[data-light106]');const r=l&&l.closest('.s98-row');return r?r.querySelector('.d').textContent:''})(),
    sv:!!q('.s98-main [data-sv84]'),err:!!q('.s98-main [data-err92o]'),rst:!!q('.s98-main [data-rst84]'),hdRst:!!q('.s98-hd [data-rst84]'),store:!!q('.s115-store'),
    rail:[...s.querySelectorAll('.s98-rail [data-stab]')].map(x=>x.dataset.stab),grp:s.querySelectorAll('.s98-rail .grp').length,foot:!!q('.s98-foot [data-sv84]')}},tab);
const close=pg=>pg.evaluate(async()=>{for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,120))}});

/* ---------- 1 · the same old save, new layout vs kill switch ---------- */
const cOn=await ctx(),cOff=await ctx({ls:{flavius_v115setoff:'1'}});const pOn=await newPage(cOn),pOff=await newPage(cOff);
const sOn=await STATE(pOn),sOff=await STATE(pOff);
ok(sOn.set===sOff.set,'1a SETTINGS identical (new layout vs kill switch) '+(sOn.set===sOff.set?'':sOn.set+' ≠ '+sOff.set));
ok(sOn.stored===sOff.stored,'1b stored flavius_settings identical after applySettings');
for(const k of Object.keys(OLD))if(k!=='q110v')ok(JSON.stringify(JSON.parse(await pOn.evaluate(()=>localStorage.getItem('flavius_settings')))[k])===JSON.stringify(OLD[k]),'1c old choice kept: '+k+'='+JSON.stringify(OLD[k]));
const dOn={...sOn,set:0,stored:0},dOff={...sOff,set:0,stored:0};
ok(JSON.stringify(dOn)===JSON.stringify(dOff),'1d applied identically '+JSON.stringify(dOn)+(JSON.stringify(dOn)===JSON.stringify(dOff)?'':' ≠ '+JSON.stringify(dOff)));
ok(sOn.fx===false&&sOn.anim==='quick'&&sOn.xray==='on'&&sOn.calm&&sOn.spike==='#9a6a32'&&sOn.pref==='light'&&sOn.ed1==='flavius'&&sOn.speed==='slow'&&sOn.ts,'1e the old values are in effect '+JSON.stringify(dOn));

/* ---------- 2 · every row shows its value on its new tab ---------- */
const P={};for(const t of ['general','help','pieces','crowd','themes','audio','access','data'])P[t]=await READ(pOn,t);
ok(JSON.stringify(P.general.rail)===JSON.stringify(['general','help','pieces','crowd','themes','audio','access','data'])&&P.general.grp===4,'2a rail: Play · Look · Sound & access · Data, 8 tabs '+JSON.stringify(P.general.rail));
const K0=await READ(pOff,'general');await close(pOff);
const G=P.general,H=P.help,Gr=P.pieces,C=P.crowd,A=P.access,D=P.data;
ok(G.page==='general'&&G.cb.confirmEnd===true&&G.cb.confirmAtk106===true&&G.cb.cam88===false&&G.cb.briefing===false&&G.cb.ctxMenu===false&&G.cb.hsTurn90===true&&G.anim+''==='quick'&&G.xray+''==='on'&&G.speed+''===K0.speed+'',
  '2b Play: Turns, Camera, Pace show the old values '+JSON.stringify([G.cb,G.anim,G.xray,G.speed,K0.speed]));
ok(JSON.stringify(G.xrayTxt)===JSON.stringify(['Auto','On','Off']),'2c See-through buttons Auto / On / Off '+JSON.stringify(G.xrayTxt));
ok(!G.atkRaw&&/Strike/.test(G.atkD),'2d Confirm attacks = a normal row with its text visible '+JSON.stringify(G.atkD));
ok(H.hasHitOff&&H.hitOff&&!H.hit.length&&!('fx' in H.cb)&&H.cb.reveals===false&&H.cb.capFeed===true,'2e Hints: Hit feedback shows Off (fx=false), no separate fx switch '+JSON.stringify([H.hit,H.hitOff,H.cb]));
ok(Gr.qcard&&Gr.light+''==='light'&&Gr.face+''==='light'&&Gr.cb.fps100===true&&Gr.cb.bases101===false&&Gr.cb.gore===false&&Gr.pots+''==='tokens'&&Gr.spike+''==='bronze'&&Gr.q110.length===1,
  '2f Graphics: one Quality card (Quality, Lighting, Portrait detail, frame meter + #q110d / #l111now), Pieces, Blessings '+JSON.stringify([Gr.qcard,Gr.q110,Gr.light,Gr.face,Gr.cb,Gr.pots,Gr.spike]));
ok(/torch/.test(Gr.lightTxt),'2g Lighting names the torchlight '+JSON.stringify(Gr.lightTxt));
ok(C.cb.flavius===false&&C.cb.shoutsSpect===false&&C.cb.thoughts===false&&C.cb.cityChatter===false&&C.cb.famous===false&&C.eds>=12&&C.ed1==='flavius'&&C.ed6==='flavius',
  '2h Crowd & voices: Editor reacts + 12 city picks (picks kept) + voices '+JSON.stringify([C.cb,C.eds,C.ed1,C.ed6]));
ok(A.cb.shake===false&&A.cb.calm===true&&!('confirmEnd' in A.cb)&&A.ts+''==='115'&&A.cvd==='rg','2i Accessibility: Screen shake here, no copy of Confirm End turn '+JSON.stringify([A.cb,A.ts,A.cvd]));
ok(D.sv&&D.err&&D.rst&&!D.hdRst&&!D.store&&!D.foot,'2j Data & saves: Saves, Error log, Restore (not in the header), no storage line, no footer link '+JSON.stringify(D));
const all=Object.values(P).flatMap(p=>p.keys);const dup=all.filter((k,i)=>all.indexOf(k)!==i);
ok(!dup.length,'2k every switch on one tab only '+JSON.stringify(dup));
ok(['confirmEnd','confirmAtk106','cam88','briefing','ctxMenu','hsTurn90','reveals','capFeed','fps100','bases101','gore','flavius','shoutsSpect','thoughts','cityChatter','famous','shake','calm','hints','locFlavor'].every(k=>all.includes(k)),'2l every known switch is still somewhere '+JSON.stringify(all));
await close(pOn);

/* ---------- 3 · Hit feedback Off = fx ---------- */
const h3=await pOn.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openSettings('help');await W8(300);const o={};const q=s=>document.querySelector('#s98 '+s);
  q('[data-hit100="full"]').click();await W8(150);o.a={fx:SETTINGS.fx,hit:SETTINGS.hit100,off:q('[data-hit115]').classList.contains('on'),full:q('[data-hit100="full"]').classList.contains('on'),st:JSON.parse(localStorage.getItem('flavius_settings')).fx};
  q('[data-hit115="off"]').click();await W8(150);o.b={fx:SETTINGS.fx,hit:SETTINGS.hit100,off:q('[data-hit115]').classList.contains('on'),full:q('[data-hit100="full"]').classList.contains('on'),st:JSON.parse(localStorage.getItem('flavius_settings')).fx,anim:typeof animOn==='function'?animOn():null};
  for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}return o});
ok(h3.a.fx===true&&h3.a.hit==='full'&&!h3.a.off&&h3.a.full&&h3.a.st===true,'3a Full: fx=true, hit100=full '+JSON.stringify(h3.a));
ok(h3.b.fx===false&&h3.b.hit==='full'&&h3.b.off&&!h3.b.full&&h3.b.st===false,'3b Off: fx=false (hit100 kept) '+JSON.stringify(h3.b));
await pOn.reload();await ready(pOn);const h3c=await READ(pOn,'help');await close(pOn);
ok(h3c.hitOff&&!h3c.hit.length&&(await pOn.evaluate(()=>SETTINGS.fx))===false,'3c Off survives a reload '+JSON.stringify([h3c.hit,h3c.hitOff]));

/* ---------- 4 · old tab keys ---------- */
const k4=await pOn.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};for(const t of ['sponsors','tokens','visuals','saves','profiles']){openSettings(t);await W8(250);o[t]=(document.querySelector('#s98')||{dataset:{}}).dataset.page;for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}}return o});
ok(k4.sponsors==='crowd'&&k4.tokens==='pieces'&&k4.visuals==='general'&&k4.saves==='data'&&k4.profiles==='themes','4 old tab keys land '+JSON.stringify(k4));
/* a city pick made on the new tab writes the sponsor map */
const k4b=await pOn.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openSettings('crowd');await W8(300);const s=document.querySelector('#s98 select[data-spcity="6"]');s.value='';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(250);
  const o={map:JSON.parse(localStorage.getItem('flavius_sponsors')).map,page:document.querySelector('#s98').dataset.page};const s2=document.querySelector('#s98 select[data-spcity="6"]');s2.value='flavius';s2.dispatchEvent(new Event('change',{bubbles:true}));await W8(250);
  o.back=JSON.parse(localStorage.getItem('flavius_sponsors')).map[6];for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}return o});
ok(!('6' in k4b.map)&&k4b.map[1]==='flavius'&&k4b.back==='flavius'&&k4b.page==='crowd','4b a city pick on Crowd & voices writes flavius_sponsors and stays on the tab '+JSON.stringify(k4b));

/* ---------- 5 · 422: a refused save, another tab ---------- */
const cQ=await ctx({quota:true,ls:{flavius_settings:JSON.stringify({...OLD,shake:true})}}); /* shake on (the default) → off: the cookie carries keys off their default */const pQ=await newPage(cQ);
await pQ.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openSettings('access');await W8(300);document.querySelector('#s98 input[data-set="shake"]').click();await W8(200);for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}});
const q5=await READ(pQ,'data');await close(pQ);const ck=await pQ.evaluate(()=>typeof set111CkGet==='function'?set111CkGet():null);const st5=await pQ.evaluate(()=>V111SET.st);
ok(q5.store&&ck&&ck.shake===false,'5a refused save: storage line on Data & saves, cookie keeps the choice '+JSON.stringify([q5.store,ck&&ck.shake,st5]));
await pQ.reload();await ready(pQ);ok((await pQ.evaluate(()=>SETTINGS.shake))===false,'5b the reload takes the choice from the cookie');await cQ.close();
const pB=await newPage(cOn);await pOn.evaluate(async()=>{openSettings('access');await new Promise(r=>setTimeout(r,300))});
const was=await pOn.evaluate(()=>SETTINGS.shake);
await pB.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openSettings('access');await W8(300);document.querySelector('#s98 input[data-set="shake"]').click();await W8(200);for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}});
await pOn.waitForTimeout(500);const a5=await pOn.evaluate(()=>({v:SETTINGS.shake,cb:(document.querySelector('#s98 input[data-set="shake"]')||{}).checked}));
ok(a5.v===!was&&a5.cb===!was,'5c another tab\'s change is adopted and the open Accessibility tab shows it '+JSON.stringify([was,a5]));await close(pOn);await pB.close();

/* ---------- 6 · phones ---------- */
const cP=await ctx({phone:true});const pP=await newPage(cP);
const ph=await pP.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openSettings();await W8(400);const o={bad:[]};const rail=document.querySelector('#s98 .s98-rail');
  o.row=getComputedStyle(rail).flexDirection==='row';o.pills=rail.querySelectorAll('[data-stab]').length;
  o.short=[...rail.querySelectorAll('[data-s115]')].map(x=>getComputedStyle(x,'::after').content);
  for(const k of ['general','help','pieces','crowd','themes','audio','access','data']){document.querySelector(`#s98 [data-stab="${k}"]`).click();await W8(250);
    if(document.documentElement.scrollWidth>innerWidth+1)o.bad.push('scroll:'+k);
    for(const el of document.querySelectorAll('#s98 .s98-main .s98-row,#s98 .s98-main .s98-card'))if(el.getBoundingClientRect().right>innerWidth+1){o.bad.push('wide:'+k);break}
    if(k==='general'){const p=document.querySelector('#s98 [data-sspeed="pause"]'),r=p.closest('.s98-row').getBoundingClientRect(),pr=p.getBoundingClientRect(),sg=p.closest('.s98-seg');
      o.pause={l:pr.left,r:pr.right,row:[r.left,r.right],segScroll:sg.scrollWidth-sg.clientWidth};
      const all=[...sg.querySelectorAll('button')].map(x=>x.getBoundingClientRect());o.fit=all.every(x=>x.left>=r.left-1&&x.right<=r.right+1&&x.width>20)}}
  for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}return o});
ok(ph.row&&ph.pills===8&&!ph.bad.length,'6a 390 px: bottom pill row, 8 pills, nothing sideways '+JSON.stringify([ph.pills,ph.bad]));
ok(ph.short.length===3&&ph.short.every(s=>/Crowd|Access|Data/.test(s)),'6b short pill labels '+JSON.stringify(ph.short));
ok(ph.fit&&ph.pause.segScroll<=0,'6c CPU speed: every button (❚❚ Pause too) inside its row, no clipping '+JSON.stringify(ph.pause));
await cP.close();

/* ---------- 7 · kill switch ---------- */
const K=await READ(pOff,'general');const KH=await READ(pOff,'help');const KA=await READ(pOff,'access');await close(pOff);
ok(JSON.stringify(K.rail)===JSON.stringify(['general','help','pieces','themes','audio','access'])&&K.grp===3&&K.hdRst&&K.foot&&('fx' in KH.cb)&&!KH.hasHitOff&&('confirmEnd' in KA.cb)&&KH.cb.shake===false,
  '7 kill switch: the v1.14b window '+JSON.stringify([K.rail,K.hdRst,K.foot,Object.keys(KH.cb)]));
await cOn.close();await cOff.close();
await b.close();srv.close();
console.log('ERRS',JSON.stringify(errs.slice(0,5)));console.log('MISS',JSON.stringify(miss));process.exit(errs.length||miss.length?1:0)})();
