/* v0.98 ONLINE DOMUS layout (253-v98domus) + OFFERINGS CAP 2, through the MOCK server: banner atrium + Trophies at its bottom-right corner · weapons 190 | avatar 270
   (svg ≈388 px, top = the first weapon card) | info · the 3D token chip (hover = picture, click = poser, Classic when posted) · the armor box with ALL pieces ·
   the offerings box bottom-left under the weapons · drag onto the avatar still wears · 390 px = one column, no horizontal scroll · a 3rd offering is refused,
   no ★ UI, a gladiator holding 4 is trimmed to 2 (+ shelf, + refund when the shelf is full). SHOT=<dir> saves built_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0,{timeout:90000});
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_(onl(mock|report|over|match|tester)|dm96)/.test(k))localStorage.removeItem(k)});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async(n,sel)=>{if(!SHOT)return;if(sel)await P.locator(sel).screenshot({path:path.join(SHOT,`built_${n}.png`)});else await P.screenshot({path:path.join(SHOT,`built_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const open=async t=>{await P.evaluate(async t=>{if(!document.getElementById('onl')){onlineOpen(t);for(let i=0;i<150&&!document.getElementById('onl');i++)await new Promise(r=>setTimeout(r,200))}ONL.tab=t;ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()},t);await idle()};
const ids=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettiib'})).domus;
  const a=await NET.req('char.create',{name:'Gamma',cls:'hero'});return {a:a.id,dom:ONL.domus.id}});
const ARM=['galea','lgreaves','lorica','ocrea','legwrapsU','balteus1','steelhelm','centurion','provmanica'];
await world((w,[a,dom,arm])=>{const ch=w.chars[a];ch.wallet=377;ch.gear=arm.slice();ch.equip=arm.slice();w.domus82[dom].treasury=2210;w.domus82[dom].trophies=[{k:'first:democritus',n:ONLC.trophyName('first:democritus'),at:Date.now(),glad:ch.name,x:1}]},[ids.a,ids.dom,ARM]);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);await open('char');
const R=sel=>P.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}},sel);
const n0=await P.evaluate(()=>ONLC.equipOf(ONL.char).filter(it=>{const I=ONL83.piece(ONL.char,it);return I&&I.kind==='a'}).length);
await shot('1440_full');
/* 1 · banner: atrium + Trophies at the bottom-right corner under the treasury */
ok(await P.evaluate(()=>!!document.querySelector('#onl .db89.a98 .bg98 svg')),'the banner has the atrium');
const ban=await R('#onl .db89'),tro=await R('#onl .db89 .tr89b'),tre=await R('#onl .db89-tre');
ok(ban&&tro&&tre&&tro.t>=tre.b-2&&Math.abs(ban.r-tro.r)<=16&&Math.abs(ban.b-tro.b)<=14,'Trophies at the banner bottom-right, under the treasury '+JSON.stringify({ban,tro,tre}));
await P.click('#onl .db89 .tr89b');await W(300);ok(await P.evaluate(()=>!!document.querySelector('.tr89pop,.pop83')),'Trophies still opens');await P.evaluate(()=>document.querySelectorAll('.pop83').forEach(e=>e.remove()));
/* 2 · showcase geometry */
const wp=await R('#onl .sc98 .wp89'),wpc=await R('#onl .sc98 .wp89 .wp89-c'),avc=await R('#onl .sc98 .sc89-av'),sv=await R('#onl .sc98 .av89 svg'),info=await R('#onl .sc98 .sc89-info');
ok(wp&&Math.abs(wp.w-190)<=6&&Math.abs(avc.w-270)<=3,'columns: weapons 190 | avatar 270 '+JSON.stringify([wp&&wp.w,avc&&avc.w]));
ok(sv&&Math.abs(sv.h-388)<=8&&Math.abs(sv.t-wpc.t)<=14,'avatar svg ≈388 px, top = the first weapon card '+JSON.stringify({sv,wpc}));
ok(sv&&Math.abs((sv.l+sv.r)/2-(avc.l+avc.r)/2)<=3,'avatar centred in its column');
ok(info&&info.l>=avc.r-2,'info is the third column');
const hit=await P.evaluate(()=>{const s=document.querySelector('#onl .sc98 .av89 svg').getBoundingClientRect();const e=document.elementFromPoint(s.left+s.width/2,s.top+s.height*0.35);return {inAv:!!(e&&e.closest('.av89')),dz:!!(e&&e.closest('[data-dz89="av"]'))}});
ok(hit.inAv&&hit.dz,'the avatar still takes the pointer (drop zone) '+JSON.stringify(hit));
/* 3 · chip */
const chip=await P.evaluate(()=>{const s=document.querySelector('#onl .sc98 .sc89-sub');const k=[...s.children].map(e=>e.className+'|'+(e.dataset.t94||''));return {k,card:!!document.querySelector('#onl .t94card'),classic:!!document.querySelector('#onl [data-t94="off"]')}});
const ci=chip.k.findIndex(x=>/tok98c/.test(x)),ri=chip.k.findIndex(x=>/rank|rk/i.test(x));
ok(ci>=0&&!chip.card&&!chip.classic&&(ri<0||ci>ri),'3D token chip after the rank chip, no card, no Classic yet '+JSON.stringify(chip));
await P.hover('#onl .sc98 .tok98c[data-t94="pose"]');await W(150);ok(await P.evaluate(()=>!!document.querySelector('#t94pop98 .f')),'hover shows the token picture popup');
await P.mouse.move(5,5);await W(150);ok(await P.evaluate(()=>!document.getElementById('t94pop98')),'popup leaves with the pointer');
await P.evaluate(()=>{window.__pose=null;window.t94Open=ch=>{window.__pose=ch.id}});await P.click('#onl .sc98 .tok98c[data-t94="pose"]');ok((await P.evaluate(()=>window.__pose))===ids.a,'the chip opens the poser for this gladiator');
await world((w,a)=>{w.chars[a].tok94={h:'zz98',at:Date.now()}},ids.a);await open('char');
ok(await P.evaluate(()=>!!document.querySelector('#onl .sc98 .sc89-sub [data-t94="off"]')),'Classic stays reachable while a picture is posted');
await world((w,a)=>{delete w.chars[a].tok94},ids.a);await open('char');
/* 4 · armor box: all pieces, no fold */
const box=await P.evaluate(()=>{const b=document.querySelector('#onl .sc98 .sc89-info .arm98');const l=b&&b.querySelector('.wr89-l');return b?{chips:l.querySelectorAll('.wr89').length,more:!!b.querySelector('[data-wr96]'),off:l.querySelectorAll('[data-d89off]').length,home:l.querySelectorAll('[data-d89homew]').length,h:b.querySelector('.h').textContent,inAv:!!document.querySelector('#onl .sc89-av .wr89-l'),dashed:getComputedStyle(b).borderTopStyle}:null});
ok(box&&box.chips===n0&&n0>5&&!box.more&&box.off===n0&&!box.inAv&&box.dashed==='dashed'&&box.h.indexOf(String(n0)+' piece')>=0,'armor box lists all '+n0+' pieces '+JSON.stringify(box));
/* 5 · offerings box bottom-left, no ★ */
const sat=await R('#onl .sc98>.sat89'),wp2=await R('#onl .sc98 .sc89-wp');
ok(sat&&wp2&&sat.t>=wp2.b-2&&Math.abs(sat.l-wp2.l)<=3&&sat.r<=avc.l+2,'offerings box under the weapons, bottom-left '+JSON.stringify({sat,wp2}));
ok(await P.evaluate(()=>/On him · 0\/2/.test(document.querySelector('#onl .sat89-h').textContent)&&!document.querySelector('#onl [data-d89br],#onl .so89-s,#onl [data-of83br]')),'offerings header "On him · n/2", no ★ toggle');
/* 6 · a drag from the shelf onto the avatar still wears the piece (the shelf holds spare pieces after taking one off) */
await P.evaluate(async()=>{const x=document.querySelector('#onl .arm98 [data-d89off]');if(x)x.click()});await idle();await W(300);
const before=await P.evaluate(()=>ONLC.equipOf(ONL.char).length);
const src=await R('#onl .eb89-row[data-eb89p="gear"] [data-p89]'),dst=await R('#onl .sc98 .av89 svg');
if(src&&dst){await P.mouse.move(src.l+src.w/2,src.t+src.h/2);await P.mouse.down();for(let i=1;i<=12;i++)await P.mouse.move(src.l+src.w/2+(dst.l+dst.w/2-src.l-src.w/2)*i/12,src.t+src.h/2+(dst.t+dst.h*0.4-src.t-src.h/2)*i/12);await P.mouse.up();await idle();await W(400)}
const after=await P.evaluate(()=>ONLC.equipOf(ONL.char).length);
ok(!!src&&after===before+1,'a piece dragged onto the avatar is worn '+JSON.stringify({before,after,src:!!src}));
await open('char');
/* 7 · offerings cap: a 3rd is refused (buy + move), mock trims a holder of 4 */
const buy=await P.evaluate(async id=>{const out=[];for(const k of ['elix2','ap2','cf1']){try{await NET.req('offer.buy',{char:id,key:k});out.push('ok')}catch(e){out.push(e.message)}}return out},ids.a);
ok(buy[0]==='ok'&&buy[1]==='ok'&&/He carries at most 2 offerings\./.test(buy[2]),'3rd offering refused '+JSON.stringify(buy));
await world((w,[a,dom])=>{w.domus82[dom].offers=['merc1']},[ids.a,ids.dom]);
const mv2=await P.evaluate(async id=>{try{await NET.req('offer.move',{key:'merc1',from:'house',to:id});return 'ok'}catch(e){return e.message}},ids.a);ok(/He carries at most 2 offerings\./.test(mv2),'moving a 3rd onto him is refused '+mv2);
await world((w,[a,dom])=>{w.domus82[dom].offers=[]},[ids.a,ids.dom]);
await open('char');ok(await P.evaluate(()=>document.querySelectorAll('#onl .sat89 .so89').length===2&&/2\/2/.test(document.querySelector('#onl .sat89-h').textContent)),'two offerings shown 2/2');
await P.mouse.move(700,880);await P.waitForFunction(()=>!document.querySelector('#mToast.show'),null,{timeout:10000}).catch(()=>{});await W(600);/* the 'wears …' toast of the drag step is not part of the Domus: wait it out before the picture */
await shot('1440_domus','#onl .dom89');
/* migration: 4 held → 2 + 2 to the shelf; shelf nearly full → refund */
await world((w,[a,dom])=>{const c=w.chars[a];c.offers=['elix2','ap2','cf1','merc1'];c.offerEq=['cf1'];delete c.off98;w.domus82[dom].offers=[];w.domus82[dom].treasury=100},[ids.a,ids.dom]);
await P.evaluate(async()=>{await NET.req('domus.get',{})});
const m1=await world((w,[a,dom])=>({o:w.chars[a].offers.slice(),eq:w.chars[a].offerEq,sh:w.domus82[dom].offers.slice(),tr:w.domus82[dom].treasury,f:w.chars[a].off98}),[ids.a,ids.dom]);
ok(JSON.stringify(m1.o)==='["elix2","ap2"]'&&JSON.stringify(m1.sh)==='["cf1","merc1"]'&&m1.tr===100&&m1.f===1,'mock migration: first 2 stay, 2 → shelf '+JSON.stringify(m1));
await P.evaluate(async()=>{await NET.req('domus.get',{})});
const m1b=await world((w,[a,dom])=>({o:w.chars[a].offers.length,sh:w.domus82[dom].offers.length}),[ids.a,ids.dom]);ok(m1b.o===2&&m1b.sh===2,'idempotent');
const cap=await P.evaluate(()=>ONLC.shelfMax(ONL.domus));
await world((w,[a,dom,cap])=>{const c=w.chars[a];c.offers=['elix2','ap2','elix4','ap3'];delete c.off98;w.domus82[dom].offers=Array(cap-1).fill('cf1');w.domus82[dom].treasury=100},[ids.a,ids.dom,cap]);
await P.evaluate(async()=>{await NET.req('domus.get',{})});
const m2=await world((w,[a,dom])=>({o:w.chars[a].offers.slice(),sh:w.domus82[dom].offers.length,tr:w.domus82[dom].treasury,led:(w.domus82[dom].led89||{}).in}),[ids.a,ids.dom]);
ok(JSON.stringify(m2.o)==='["elix2","ap2"]'&&m2.sh===cap&&m2.tr===100+120&&m2.led&&m2.led.refund===120,'full shelf: the 2nd extra is refunded to the treasury '+JSON.stringify(m2));
/* 8 · phones: one column, no horizontal scroll, order name/stats · avatar · weapons · armor · offerings */
await world((w,[a,dom])=>{w.chars[a].offers=['elix2'];w.domus82[dom].offers=[]},[ids.a,ids.dom]);
await P.setViewportSize({width:390,height:844});await W(300);await open('char');await W(400);
const ph=await P.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {t:b.top,l:b.left,r:b.right,w:b.width}};
  return {sw:document.documentElement.scrollWidth,iw:innerWidth,ow:(document.getElementById('onl')||{}).scrollWidth,cw:(document.getElementById('onl')||{}).clientWidth,n:r('.sc98 .sc89-n'),rec:r('.sc98 .sc89-rec'),av:r('.sc98 .av89'),wp:r('.sc98 .sc89-wp'),arm:r('.sc98 .arm98'),sat:r('.sc98>.sat89'),sv:r('.sc98 .av89 svg')}});
ok(ph.sw<=ph.iw+1&&(ph.ow||0)<=(ph.cw||0)+1,'no horizontal scroll at 390 '+JSON.stringify({sw:ph.sw,iw:ph.iw,ow:ph.ow,cw:ph.cw}));
ok(ph.n&&ph.av&&ph.wp&&ph.arm&&ph.sat&&ph.n.t<ph.av.t&&ph.rec.t<ph.av.t&&ph.av.t<ph.wp.t&&ph.wp.t<ph.arm.t&&ph.arm.t<ph.sat.t,'phone order: name/stats, avatar, weapons, armor, offerings '+JSON.stringify(ph));
ok(ph.av&&ph.wp&&ph.arm&&ph.sat&&[ph.av,ph.wp,ph.arm,ph.sat].every(x=>x.r<=ph.iw+1&&x.l>=-1),'one column inside the screen');
await P.setViewportSize({width:390,height:2400});await W(500);await shot('390_full');
await P.setViewportSize({width:1440,height:900});
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
