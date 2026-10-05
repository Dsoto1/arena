/* online v0.80 (mock, three windows): rooms (＋ Custom room, a playlist joins it — no twin, join, Familia 6 seats, teams, give host,
   remove + blocked), quick-chat phrases + the room's log (no lobby.list re-reads on pushes), the Forum (phrase, 📣 call banner on an
   idle window, map glows, who list), an invite popup, the horns with a standing member (greyed room + countdown), a little play,
   an in-match phrase bubble, the result in the Forum and ⚔ Again (a new room, the other fighter invited) */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');localStorage.removeItem('flavius_onlquiet80');localStorage.removeItem('flavius_onlmute80')});
const errs=[];const P={};for(const n of ['A','B','C']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
await P.A.goto(URL0);await P.A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));for(const n of ['B','C'])await P[n].goto(URL0);await P.A.waitForTimeout(2500);
const {A,B,C}=P;const wait=ms=>A.waitForTimeout(ms);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');await setup(C,'Gamma','slave');
/* the map table is filled by 117 (art step); give it the bots' zones if it is still empty */
for(const p of [A,B,C])await p.evaluate(()=>{if(!onlTzLL('Europe/Rome'))Object.assign(ONL_TZ,{'Europe/Rome':[41.9,12.5],'America/New_York':[40.71,-74],'Asia/Tokyo':[35.7,139.7],'Europe/London':[51.5,-0.12],'America/Sao_Paulo':[-23.55,-46.63],'Australia/Sydney':[-33.87,151.2]});
  /* a spy: how often this window re-reads the room list */
  window.__lists=0;const base=NET.req;NET.req=function(t){if(t==='lobby.list')window.__lists++;return base.apply(this,arguments)}});
for(const p of [A,B,C]){p.evaluate(()=>{onlineOpen('play')}).catch(()=>{})}await wait(1500);
const click=async(p,sel)=>{await p.waitForSelector(sel,{timeout:5000});await p.click(sel);await p.waitForTimeout(450)};
const room=p=>p.evaluate(()=>{const L=onlMyLobby();return L?{id:L.id,ev:L.ev,seats:L.seats,host:L.host.name,players:L.players.map(x=>[x.name,x.team||'',!!x.ready]),members:(L.members||[]).map(m=>m.name),status:L.status,teams:L.teams}:null});
const landing=await A.evaluate(()=>({row:!!document.querySelector('#onl #onlStageMap81 .omap-in'),dots:document.querySelectorAll('#onlStageMap81 .omap-dot').length,cap:(document.getElementById('omapCap')||{}).textContent||'',chips:[...document.querySelectorAll('#onlForum81 .ofor-chips button')].map(b=>b.textContent),acta:!!document.querySelector('#onl #acta87'),mapBtn:!!document.querySelector('#onl #onlStageMap81[data-onl]')}));
if(SHOT)await A.screenshot({path:SHOT+'/landing.png',fullPage:false});
/* the big map: a centred view, never a modal() */
await click(A,'#onl .scap81 [data-onl="omap"]');const big=await A.evaluate(()=>({on:!!document.querySelector('.omapbig .frame'),dots:document.querySelectorAll('.omapbig .omap-dot').length}));if(SHOT)await A.screenshot({path:SHOT+'/mapbig.png'});
await A.click('.omapbig');await wait(200);
/* A: ＋ Custom room (instant, defaults) */
await click(A,'#onl [data-onl="tab"][data-v="lobby"]');await click(A,'#onl [data-onl="mkroom"][data-v="0"]');await wait(300);const rA=await room(A);
/* B: the Classic Custom playlist joins A's room — no twin */
await click(B,'#onl [data-onl="quick"][data-v="democritus|0"]');await wait(400);const rB=await room(B);
const twins=await A.evaluate(()=>Object.values(mockLoad().lobbies).filter(L=>L.status==='waiting'&&!L.mock).length);
/* C joins from the Lobby Browser */
await click(C,'#onl [data-onl="tab"][data-v="lobby"]');await click(C,`#onl [data-onl="join"][data-v="${rA.id}"]`);await wait(300);const rC=await room(C);
/* A (host) → Familia, 6 seats, 3 teams; C moved to Team B */
await A.selectOption('#onl select[data-onlrs="ev"]','familia');await wait(500);await A.selectOption('#onl select[data-onlrs="seats"]','6');await wait(500);await A.selectOption('#onl select[data-onlrs="teams"]','3');await wait(500);
const cid=await C.evaluate(()=>ONL.acct.id),bid=await B.evaluate(()=>ONL.acct.id),aid=await A.evaluate(()=>ONL.acct.id);
await click(A,`#onl [data-onl="rteam"][data-v="${cid}|B"]`);await wait(400);const fam=await room(C);
if(SHOT)await A.screenshot({path:SHOT+'/room.png'});
/* A gives the room to B; B removes C; C cannot come back yet */
await click(A,`#onl [data-onl="rhost"][data-v="${bid}"]`);await wait(500);const hostB=await room(A);
await click(B,`#onl [data-onl="rkick"][data-v="${cid}"]`);await wait(600);const afterKick={c:await room(C),b:await room(B)};
const blocked=await C.evaluate(async id=>{try{await NET.req('lobby.join',{id});return 'joined'}catch(e){return e.message}},rA.id);
/* phrases + the room's log; no lobby.list re-reads on pushes */
const lists0=await B.evaluate(()=>window.__lists);
await click(A,'#onl [data-onl="rsay"][data-v="ave"]');await wait(3200);await click(B,'#onl [data-onl="rsay"][data-v="luck"]');await click(A,'#onl [data-onl="rready"]');await wait(600);
const logB=await B.evaluate(()=>[...document.querySelectorAll('#r80Log > div')].map(d=>d.textContent));const lists1=await B.evaluate(()=>window.__lists);
const readyA=(await room(B)).players.find(x=>/Alpha/.test(x[0]));
/* the Forum: C (free, Online open) says Ave; the 📣 call reaches C as a banner */
/* v0.87: the Forum box left the landing; its route stays — the phrase still reaches the others' feed */
await click(C,'#onl [data-onl="tab"][data-v="play"]');await C.evaluate(()=>NET.req('forum.say',{q:'ave'}));await wait(500);
const forumA=await A.evaluate(()=>ONLF.lines.filter(l=>l.k==='say').map(l=>l.name+':'+l.q));
await A.evaluate(id=>{const w=mockLoad();w.lobbies[id].cry=[Date.now()-130000];delete w.lobbies[id].kicked;mockSave(w)},rA.id);await C.evaluate(id=>{delete ONL.kicked80[id]},rA.id);
await click(B,'#onl [data-onl="rcall"]');await wait(600);const ban=await C.evaluate(()=>{const b=document.getElementById('onlCry80');return b&&!b.hidden?b.textContent:''});
const callLine=await C.evaluate(()=>ONLF.lines.some(l=>l.k==='call'));
/* the who list (here) and the invite popup: B invites C → popup → Not now; A invites C → ⚔ Join */
await click(B,'#onl [data-onl="rinvite"]');await wait(400);const who=await B.evaluate(()=>[...document.querySelectorAll('.w80bg .w80r b')].map(b=>b.textContent));
await click(B,`.w80bg [data-onl="winv"][data-v="${cid}"]`);await wait(300);await B.click('.w80bg [data-onl="wx"]');await wait(900);
const pop1=await C.evaluate(()=>{const p=document.querySelector('.inv80bg');return p?[...p.querySelectorAll('button')].map(b=>b.textContent):null});
await C.click('.inv80bg [data-onl="ino"]').catch(()=>{});await wait(400);
await A.evaluate(async([id,to])=>NET.req('lobby.invite',{id,to}),[rA.id,cid]);await wait(1000);
const pop2=await C.evaluate(()=>!!document.querySelector('.inv80bg'));await C.click('.inv80bg [data-onl="ijoin"]').catch(()=>{});await wait(800);const rC2=await room(C);
/* A stands up; B sounds the horns: A sees the greyed room counting down; B and C enter */
await click(A,'#onl [data-onl="rstand"]');await wait(400);
await click(B,'#onl [data-onl="start"]');await wait(1200);
const grey=await A.evaluate(()=>({grey:!!document.querySelector('#onl .onl-room80.grey'),cd:(document.getElementById('r80cd')||{}).textContent||'',watch:!!document.querySelector('#onl [data-onl="uwatch"]')}));
if(SHOT)await A.screenshot({path:SHOT+'/unseated.png'});
await C.waitForTimeout(2500);
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb,'modal']:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode'];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],'tile']}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle']});
  if(r[0]==='sel')await p.click(r[1],{timeout:2000}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const t0=Date.now();while(Date.now()-t0<14000){await drive(B);await drive(C);await wait(250)}
const inMatch=await C.evaluate(()=>({on:!!(S&&S.onl&&ONLM.on),seat:ONLM.me,ev:S&&S.ev,players:S&&S.players.length,say:!!document.getElementById('btnOnlSay80')}));
const backA=await A.evaluate(()=>({grey:!!document.querySelector('#onl .onl-room80.grey'),room:!!onlMyLobby()}));
/* an in-match phrase: B's 💬 → C sees a bubble over B's gladiator */
await B.evaluate(()=>{ONLM.uiAt=Date.now()});await B.click('#btnOnlSay80');await wait(250);
await C.evaluate(()=>{window.__bub=[];new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.classList&&n.classList.contains('qbub80'))window.__bub.push(n.textContent+'@'+n.dataset.seat)}).observe(document.body,{childList:true,subtree:true})});
await B.click('#onlSay80 [data-msay="struck"]');await wait(900);const bub=await C.evaluate(()=>window.__bub);
/* the match ends on both screens (the same winner, at the same input) → the result settles → a 'res' line in the Forum */
for(let i=0;i<40;i++){const s=await Promise.all([B,C].map(p=>p.evaluate(()=>({n:ONLM.next,ok:typeof onlmSettled==='function'&&onlmSettled()||!S.busy&&!CUR_MODAL}))));if(s[0].n===s[1].n&&s[0].ok&&s[1].ok)break;await drive(B);await drive(C);await wait(250)}
for(const p of [B,C])await p.evaluate(()=>{gameOver([S.players[0]],'test')}).catch(()=>{});
for(let i=0;i<30;i++){for(const p of [B,C])await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});await wait(300);if((await A.evaluate(()=>ONLF.lines.some(l=>l.k==='res'))))break}
const res=await A.evaluate(()=>ONLF.lines.filter(l=>l.k==='res').map(l=>(l.win||[]).join('&')+' '+l.ev));
/* ⚔ Again: B's new room; C is invited and sees it once back in Online */
await wait(800);const againBtn=await B.evaluate(()=>!!document.getElementById('btnOnlAgain80'));
await B.evaluate(()=>{ONLM.uiAt=Date.now();document.getElementById('btnOnlAgain80').click()});await wait(2500);const again=await room(B);
await C.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);onlExit()});await wait(3000);const pop3=await C.evaluate(()=>{const p=document.querySelector('.inv80bg');return p?p.textContent:''});
if(SHOT)await C.screenshot({path:SHOT+'/invite.png'});
/* 🔇 Mute from the popup: the server keeps the list; B's Forum phrase never reaches C */
await C.click('.inv80bg [data-onl="imute"]').catch(()=>{});await wait(600);await B.evaluate(async()=>{try{await NET.req('forum.say',{q:'well'})}catch(e){}});await wait(600);
const muted={list:await C.evaluate(id=>(mockLoad().accounts[ONL.acct.id].mutes||[]).includes(id),bid),heard:await C.evaluate(id=>ONLF.lines.some(l=>l.by===id&&l.k==='say'),bid),aHeard:await A.evaluate(id=>ONLF.lines.some(l=>l.by===id&&l.q==='well'),bid)};
const out={landing,big,rA,rB,twins,rC,fam,hostB:hostB&&hostB.host,afterKick,blocked,logB,lists:[lists0,lists1],readyA,forumA,ban,callLine,who,pop1,pop2,rC2,grey,inMatch,backA,bub,res,againBtn,again,pop3,muted};
console.log(JSON.stringify(out));
const miss=[];
if(!landing.row||!landing.dots||!/lanistas? · \d+ guests?/.test(landing.cap)||landing.chips.length!==0||!landing.acta||landing.mapBtn)miss.push('landing: stage map (only 🔍 opens it) + the Acta of the day in place of the Forum box (v0.87)');if(!big.on||!big.dots)miss.push('big map');
if(!rA||rA.ev!=='democritus'||rA.seats!==4)miss.push('＋ Custom room');if(!rB||rB.id!==rA.id||twins!==1)miss.push('playlist joins, no twin');if(!rC||rC.id!==rA.id||rC.players.length!==3)miss.push('join from the browser');
if(!fam||fam.ev!=='familia'||fam.seats!==6||fam.teams!==3||!(fam.players.find(x=>/Gamma/.test(x[0]))||[])[1]==='B')miss.push('Familia 6 seats + teams');
if(!/Beta/.test(hostB&&hostB.host||''))miss.push('give host');if(afterKick.c||afterKick.b.members.some(n=>/Gamma/.test(n)))miss.push('remove');if(!/removed you/.test(blocked))miss.push('removed lanista blocked');
if(!logB.some(t=>/Ave!/.test(t))||!logB.some(t=>/Good luck/.test(t)))miss.push('room phrases + log');if(lists1!==lists0)miss.push('no lobby.list on pushes');if(!readyA||!readyA[2])miss.push('ready');
if(!forumA.some(x=>/Gamma/.test(x)))miss.push('Forum phrase');if(!/calls for/.test(ban)||!callLine)miss.push('call banner');if(!who.some(n=>/Gamma/.test(n)))miss.push('who list');
if(!pop1||pop1.length!==3)miss.push('invite popup');if(!pop2||!rC2||rC2.id!==rA.id)miss.push('invite → join');
if(!grey.grey||!grey.cd||!grey.watch)miss.push('started without you');if(!inMatch.on||inMatch.seat<0||!inMatch.say)miss.push('the match runs');if(backA.grey)miss.push('countdown ends');
if(!bub.some(t=>/Well struck/.test(t)))miss.push('phrase bubble');if(!res.length)miss.push('result in the Forum');if(!againBtn||!again||again.status!=='waiting'||again.id===rA.id)miss.push('⚔ Again');if(!/invites you/.test(pop3))miss.push('Again invites the other fighter');if(!muted.list||muted.heard||!muted.aHeard)miss.push('mute');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
