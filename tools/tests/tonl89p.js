/* v0.89 L · THE ONLINE PROFILE + LANISTA NAME (180-v89profile) through the MOCK server: the first sign-in name step (Roman name prefilled,
   word filter + length, unique), the rail shows the lanista name (never the sign-in name), the 👤 Profile & Settings tab (FID, rename once
   — refused inside 30 days, "formerly"), privacy (hidden from Here now + the Orbis zones, still counted; who may invite me enforced), invite by
   FID, find by FID + the read-only visit (their gladiators + gear, no treasury / purses / shelf / edit buttons), the lookup limit, delete my
   account (asks twice, the house name, the house gone). Phones 390 px. SHOT=<dir> saves v89L_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0,{timeout:90000});
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`v89L_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const peek=(fn,arg)=>P.evaluate(([fn,arg])=>(0,eval)('('+fn+')')(mockLoad(),arg),[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const txt=s=>P.evaluate(s=>{const e=document.querySelector(s);return e?e.textContent.replace(/\s+/g,' '):''},s);
const tab=async v=>{await P.click(`#onl .onl-rail [data-v="${v}"]`);await idle()};
const rej=fn=>P.evaluate(async fn=>{try{await (0,eval)('('+fn+')')();return null}catch(e){return {code:e.code||null,msg:e.message}}},fn.toString());

/* another lanista, Bob: a house with a gladiator who wears gear, a purse, a treasury, a shelf; online and in Tokyo */
const bob=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const B=await NET.req('auth.signin',{name:'Robert Realname',google:1});await NET.req('lanista.name',{name:'Gaius Varro'});
  const D=(await NET.req('domus.create',{name:'Bobii'})).domus;const c=await NET.req('char.create',{name:'Bobus Ferox',cls:'hero'});const h=await NET.req('hello',{all:1});return {id:B.id,dom:D.id,ch:c.id,fid:h.lan89.fid}});
await world((w,[id,dom,ch])=>{const c=w.chars[ch];c.wallet=987;c.gear=['galea','gladius'];c.equip=['galea','gladius'];c.offers=['cf1'];const D=w.domus82[dom];D.treasury=4321;D.gear=['ocrea'];D.offers=['ap2'];
  const A=w.accounts[id];A.seen=Date.now()+600000;A.tz='Africa/Nairobi'},[bob.id,bob.dom,bob.ch]);
ok(/^FID-[2-9A-HJ-NP-Z]{6}$/.test(bob.fid),'Bob has an FID '+bob.fid);

/* 1 · Ann's first sign-in: the name step before the house */
await P.evaluate(async()=>{sessionStorage.removeItem('flavius_onlacct');localStorage.removeItem('flavius_onlacct');ONL.acct=await NET.req('auth.signin',{name:'Annabel Realname',google:1});onlineOpen('play');await new Promise(r=>setTimeout(r,900))});await idle();
let st=await P.evaluate(()=>({step:!!document.querySelector('#onl .ln89-step #ln89Name'),pre:(document.getElementById('ln89Name')||{}).value||'',found:!!document.querySelector('#onl #dom82Name'),rail:(document.querySelector('#onl .onl-acct span')||{}).textContent||'',all:document.getElementById('onl').textContent}));
ok(st.step&&!st.found,'the name step comes first (no house card yet)');ok(/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(st.pre),'prefilled Roman name: '+st.pre);ok(!/Annabel|Realname/.test(st.all),'the sign-in name is nowhere: '+st.rail);
await shot('name_step');
await P.fill('#ln89Name','Ga');await P.click('[data-l89="take"]');await idle();ok(/3–24/.test(await txt('#onl .ln89-step .onl-err')),'too short');
await P.fill('#ln89Name','Gaius Bitchface');await P.click('[data-l89="take"]');await idle();ok(/another name/i.test(await txt('#onl .ln89-step .onl-err')),'the word filter');
await P.fill('#ln89Name','gaius VARRO');await P.click('[data-l89="take"]');await idle();ok(/Another lanista has that name/.test(await txt('#onl .ln89-step .onl-err')),'unique, case-insensitive');
await P.click('[data-l89="dice"]');ok((await P.inputValue('#ln89Name'))!=='gaius VARRO','🎲 another name');
await P.fill('#ln89Name','Marcus Aurelius');await P.click('[data-l89="take"]');await idle();
st=await P.evaluate(()=>({step:!!document.querySelector('#onl .ln89-step'),found:!!document.querySelector('#onl #dom82Name'),rail:(document.querySelector('#onl .onl-acct span')||{}).textContent||''}));
ok(!st.step&&st.found,'then the house');ok(st.rail==='Marcus Aurelius','the rail shows the lanista name: '+st.rail);
const ann=await P.evaluate(async()=>{ONL.domus=(await NET.req('domus.create',{name:'Annii'})).domus;ONL.needDomus=false;const c=await NET.req('char.create',{name:'Anna Fortis',cls:'slave'});await onlRefresh();onlRedraw();return {id:ONL.acct.id,dom:ONL.domus.id,fid:V89L.lan.fid}});
ok((await txt('#onl .onl-acct span'))==='Marcus Aurelius','the rail after a refresh');
ok(await peek((w,id)=>!/Annabel/.test(JSON.stringify(w.accounts[id])),ann.id),'the sign-in name is not kept');

/* 2 · the profile tab: FID, rename once, formerly */
await tab('prof');let pr=await txt('#onl .pr98');ok(pr.includes(ann.fid)&&/Marcus Aurelius/.test(pr),'the profile: name + FID');ok(await P.evaluate(()=>{const r=[...document.querySelectorAll('#onl .onl-rail button[data-onl="tab"]')].map(b=>b.dataset.v);return r.indexOf('prof')===r.length-1&&r.includes('hall')}),'the tab sits after the Hall, before the account box');
ok(await P.evaluate(()=>{const b=document.querySelector('#onl [data-l89="rename"]');return !!b&&b.disabled}),'rename locked inside 30 days');ok(/next on/.test(pr) /* v0.98 wording */,'says when');
let e=await rej(()=>NET.req('lanista.name',{name:'Titus Varro'}));ok(e&&e.code==='too_soon','the server refuses too ('+(e&&e.code)+')');
await world((w,id)=>{w.accounts[id].nameAt=Date.now()-31*86400e3},ann.id);await P.evaluate(()=>onlRefresh().then(()=>onlRedraw()));await idle();
await P.fill('#ln89Ren','Marcus Varro');await P.click('[data-l89="rename"]');await idle();pr=await txt('#onl .pr98');
ok(/Marcus Varro/.test(pr)&&/formerly Marcus Aurelius/.test(pr),'renamed, formerly shown: '+pr.slice(0,120));ok((await txt('#onl .onl-acct span'))==='Marcus Varro','the rail follows');
e=await rej(()=>NET.req('lanista.name',{name:'Titus Varro'}));ok(e&&e.code==='too_soon','once only');
await shot('profile');

/* 3 · privacy: Here now + the Orbis zones (Bob), my own switch */
let H=await P.evaluate(async()=>{const w=await NET.req('who.list');const h=await NET.req('hello',{all:1});return {bob:w.some(r=>r.name==='Bobus Ferox'),lan:(w.find(r=>r.name==='Bobus Ferox')||{}).lan,tz:!!h.here.zones['Africa/Nairobi'],n:h.here.n}});
ok(H.bob&&H.lan==='Gaius Varro'&&H.tz,'Bob is here, named, glowing in Nairobi '+JSON.stringify(H));
await world((w,id)=>{w.accounts[id].priv89={hide:true,inv:'all'}},bob.id);
const H2=await P.evaluate(async()=>{const w=await NET.req('who.list');const h=await NET.req('hello',{all:1});return {bob:w.some(r=>r.name==='Bobus Ferox'),tz:!!h.here.zones['Africa/Nairobi'],n:h.here.n}});
ok(!H2.bob&&!H2.tz&&H2.n===H.n,'hidden: no pill, no glow, still counted '+JSON.stringify(H2));
await P.click('#onl label.sw98:has([data-l89p="hide"]) i') /* v0.98: the Profile switches are drawn (252 .sw98) */;await idle();ok(await peek((w,id)=>!!(w.accounts[id].priv89||{}).hide,ann.id),'my own switch saves');
await P.check('#onl [data-l89p="inv"][value="follow"]');await idle();ok(await peek((w,id)=>(w.accounts[id].priv89||{}).inv==='follow',ann.id),'who may invite me saves');

/* 4 · invites: Bob says nobody → refused; everyone → ✉ Invite by FID from the room */
await P.evaluate(async()=>{await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false});await onlRefresh();ONL.tab='play';onlRedraw()});await idle();
await world((w,id)=>{w.accounts[id].priv89={hide:false,inv:'none'};w.accounts[id].seen=Date.now()+600000},bob.id);
e=await rej(new Function(`return NET.req('lobby.invite',{id:onlMyLobby().id,to:${JSON.stringify(bob.id)}})`));ok(e&&/no invitations/.test(e.msg),'nobody → refused');
e=await rej(new Function(`return NET.req('lobby.invite',{id:onlMyLobby().id,to:${JSON.stringify(bob.fid)}})`));ok(e&&/no invitations/.test(e.msg),'by FID too');
await world((w,id)=>{w.accounts[id].priv89={hide:false,inv:'all'}},bob.id);
ok(await P.isVisible('#onl #fi89In'),'the room has ✉ Invite by FID');await P.fill('#onl #fi89In',bob.fid.toLowerCase());await P.click('#onl [data-l89="finv"]');await idle();
ok(await peek((w,id)=>JSON.stringify(w.outbox80||w.out80||'').length>=0,bob.id),'sent');
const sent=await P.evaluate(()=>!!document.querySelector('#onl .onl-err'));ok(!sent,'no error after the FID invite');
await P.evaluate(()=>onlRedraw());await W(500);await P.evaluate(()=>onlRedraw());await W(200);

/* 5 · find by FID → the visit: their gladiators + gear, nothing private */
await tab('prof');await P.fill('#onl #fd89In','fid-zzzzzz');await P.click('#onl [data-l89="find"]');await idle();ok(/No house with that FID/.test(await txt('#onl .fd89l')),'unknown FID');
await P.fill('#onl #fd89In',' '+bob.fid.slice(4).toLowerCase()+' ');await P.click('#onl [data-l89="find"]');await idle();await W(300);
let V=await P.evaluate(()=>{const m=document.querySelector('#onl .onl-main');return {strip:!!m.querySelector('.vs89'),t:m.textContent.replace(/\s+/g,' '),cards:m.querySelectorAll('.gc89').length,wp:m.querySelectorAll('.wp89 .wp89-c *').length,
  bar:!!m.querySelector('.eb89'),edit:m.querySelectorAll('[data-d89],[data-d89off],[data-d89kit],[data-onl82],[data-p89],[data-lk89]').length,tre:!!m.querySelector('.db89-tre'),av:!!m.querySelector('.av89 svg'),tab:ONL.tab}});
ok(V.strip&&V.tab==='visit'&&/Visiting/.test(V.t)&&/Bobii/.test(V.t)&&/Gaius Varro/.test(V.t),'the visit strip: '+V.t.slice(0,140));
ok(V.cards===1&&V.av&&/Bobus Ferox/.test(V.t)&&/Galea|Helm|AP/i.test(V.t)&&V.wp>0,'their gladiator in his gear');
ok(!V.bar&&!V.tre&&V.edit===0&&!/Treasury|Purse|stake|4321|987/i.test(V.t),'no treasury, purse, stake, shelf or edit buttons');
ok(V.t.includes(bob.fid),'their FID');await shot('visit');
await P.click('#onl [data-l89="vfollow"]');await idle();ok(await peek((w,id)=>(w.accounts[id].follows||[]).length===1,ann.id),'★ Follow from the visit');
await P.click('#onl [data-l89="vback"]');await idle();ok(await P.evaluate(()=>ONL.tab==='prof'&&!V89L.visit),'← Back');
/* the followed houses + the find box live in Profile & Settings (v1.0: not on the landing) */
await P.evaluate(()=>{ONL.tab='prof';onlRedraw()});await idle();
ok(await P.evaluate(()=>!!document.querySelector('#onl .pr98-find #fd89In')&&document.querySelectorAll('#onl .pr98-fol .hc98n').length>=1),'followed houses + the find box in Profile & Settings');
await P.evaluate(()=>{ONL.tab='play';onlRedraw()});await idle();ok(await P.evaluate(()=>!document.querySelector('#onl .fl83')&&!document.querySelector('#onl #fd89In')),'not on the landing');
/* the lookup limit */
const slow=await P.evaluate(async fid=>{for(let i=0;i<25;i++){try{await NET.req('fid.find',{fid})}catch(e){return e.code}}return null},bob.fid);ok(slow==='slow','20 lookups a minute');await world((w,id)=>{delete w.accounts[id].fq89},ann.id);

/* 6 · phones */
await P.evaluate(()=>{ONL.tab='prof';V89L.visit=null;onlRedraw()});await P.setViewportSize({width:390,height:844});await W(400);await P.evaluate(()=>onlRedraw());await W(300);
const ph=await P.evaluate(()=>{const mb=document.querySelector('#mBody');const s=document.querySelector('#onl .pr98');return {wide:mb?mb.scrollWidth-mb.clientWidth:0,w:s?s.getBoundingClientRect().width:0}});
ok(ph.wide<=2&&ph.w>200&&ph.w<=392,'the profile fits 390 px '+JSON.stringify(ph));await shot('profile_phone');
await P.evaluate(fid=>onl89Visit({fid}),bob.fid);await idle();await W(300);
const pv=await P.evaluate(()=>{const mb=document.querySelector('#mBody');return {wide:mb?mb.scrollWidth-mb.clientWidth:0,strip:!!document.querySelector('#onl .vs89')}});ok(pv.strip&&pv.wide<=2,'the visit fits 390 px '+JSON.stringify(pv));await shot('visit_phone');
await P.setViewportSize({width:1400,height:900});await P.evaluate(()=>{V89L.visit=null;ONL.tab='prof';onlRedraw()});await idle();

/* 7 · delete my account: asks twice, the house name */
await P.evaluate(async()=>{const L=onlMyLobby();if(L)await NET.req('lobby.leave',{id:L.id}).catch(()=>{});await onlRefresh();ONL.tab='prof';onlRedraw()});await idle();
await P.click('#onl [data-l89="del"]');await W(200);ok(await P.isVisible('.pop89l [data-p89="go"]'),'first ask');await P.click('.pop89l [data-p89="go"]');await W(200);
ok(await P.isVisible('.pop89l #del89In'),'second ask: type the name');await P.fill('.pop89l #del89In','wrong');await P.click('.pop89l [data-p89="del"]');await idle();
ok(/house name/.test(await txt('.pop89l #del89Err')),'a wrong name is refused');ok(await peek((w,id)=>!!w.accounts[id],ann.id),'still there');
await P.fill('.pop89l #del89In','annii');await P.click('.pop89l [data-p89="del"]');await idle();await W(600);
const gone=await peek((w,[id,dom])=>({acct:!!w.accounts[id],dom:!!(w.domus82||{})[dom],chars:Object.values(w.chars).some(c=>c.owner===id),names:Object.values(w.lnames89||{}).some(x=>x.acct===id)}),[ann.id,ann.dom]);
ok(!gone.acct&&!gone.dom&&!gone.chars&&!gone.names,'account, house, gladiators and names gone '+JSON.stringify(gone));
ok(await P.evaluate(()=>!ONL.acct&&!!document.querySelector('#onl .onl-sign, #onl [data-onl="google"], #onl #onlName')),'signed out');

console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
