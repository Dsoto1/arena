/* v0.92: beasts act only on their target's turn. v0.90 186-v90board: the hunters (Tholo / lions hunt the closest living thing, beasts included; ties → gladiator; act in any
   gladiator's Resolve; Tholo hoards a slain beast's coin), the Crowd Favor tile (disabled at 1 CF and under Commodus), Blessings
   as token rounds on the pillars (draw + the flip on a break, screenshots), and the hot-seat turning board (on → the view turns
   between two humans' turns and holds on a CPU turn; off → 0). */
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const SHOTS='/tmp/claude-0/v90shots';try{fs.mkdirSync(SHOTS,{recursive:true})}catch(e){}
const miss=[];const out={};
/* start an event with the given human seats and skip the opening windows */
const run=(ev,humans)=>pg.evaluate(async([ev,humans])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
  menuHide();SPEED='pause';const cls=['hero','soldier','royalty','venatore'];
  startEvent({ev,loc:6,seats:cls.map((c,i)=>({cls:c,cpu:!humans.includes(i)})),opts:{spect:0}});
  for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL){const t=(document.getElementById('mTitle')||{}).textContent||'';const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');
      const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit&&/raft/.test(t))lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}
    else if(S&&S.phase!=='setup'&&i>6)break}
  SPEED='fast';for(let i=0;i<300;i++){if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(null);await W8(150);continue}
    if(S&&cur()&&!cur().cpu&&(S.phase==='choice'||S.phase==='action')&&!S.busy)break;await W8(100)}
  return {ev:S.evKey,phase:S.phase,cur:S.cur}},[ev,humans]);
await run('democritus',[0]);
/* 1. the hunters */
const hunt=await pg.evaluate(async()=>{const o={};const far=[[0,0],[0,12],[12,0],[12,12]];
  const place=()=>{S.players.forEach((p,i)=>{p.r=far[i][0];p.c=far[i][1];p.underground=false;p.exited=false})};
  const keepN=S.npcs;const logTxt=()=>[...document.querySelectorAll('#log > li:not(#slogPin)')].slice(0,40).map(l=>l.textContent).join('\n');
  S.pillars=S.pillars.filter(pl=>Math.max(Math.abs(pl.r-6),Math.abs(pl.c-6))>3);
  /* a: a non-aggro Tholo next to a wolf (gladiators far away) attacks the wolf in a CPU's Resolve */
  place();S.npcs=[];const th=mkNPC('tholo','Tholo',6,6,{});const wf=mkNPC('wolf','Lupus',6,7,{});S.npcs.push(th,wf);th.aggro=null;wf.aggro=null;
  const cpu=S.players[0] /* v0.92: a beast prey is hunted in the Resolve of the gladiator closest to the hunter (corner tie → lowest seat) */;const hp0=wf.hp;await resolvePhase(cpu);let L=logTxt();
  o.a={hunts:/Tholo hunts the closest prey: Lupus/.test(L),attacks:/Tholo[^\n]*attacks/.test(L),wolfHp:[hp0,wf.hp],tholoAt:[th.r,th.c]};
  /* b: tie at distance 2 — a gladiator before a beast */
  place();S.players[1].r=6;S.players[1].c=4;S.npcs=[th,wf];th.r=6;th.c=6;wf.alive=true;wf.hp=6;wf.r=6;wf.c=8;
  const pr=closestThing90(th);o.b={kind:pr&&pr.kind,who:pr&&pr.ref.name,want:S.players[1].name};
  /* c: a lion acts in a non-closest gladiator's Resolve (old rule: it would not) */
  const lionAct=async on=>{place();HUNT90.on=on;const ln=mkNPC('lion','Leo',6,6,{});ln.aggro=null;S.npcs=[ln];S.players[1].r=6;S.players[1].c=8;
    const near=S.players[1],other=S.players[3];await resolvePhase(other);const r={adj:cheb(ln,near),r:ln.r,c:ln.c,last:ln.lastWhy||null};if(on){await resolvePhase(near);r.own=cheb(ln,near)}HUNT90.on=true;return r};
  o.c={on:await lionAct(true),off:await lionAct(false)};
  /* d: Tholo slays a beast → its coin joins his hoard */
  place();th.r=6;th.c=6;th.hoard=0;th.aggro=null;let tries=0,killed=false;
  while(tries<14&&!killed){tries++;const sn=mkNPC('snake','Anguis',6,7,{});sn.hp=1;sn.aggro=null;S.npcs=[th,sn];await huntBeast90(th,sn);killed=!sn.alive}
  o.d={killed,tries,hoard:th.hoard,want:NPCT.snake.coin,killedBy:S.npcs[1]&&S.npcs[1].killedBy};
  /* e (v0.91): a beast that survives the hunter's strike counter-attacks at once */
  {place();th.r=6;th.c=6;th.aggro=null;let seen=false;for(let i=0;i<8&&!seen;i++){const wf=mkNPC('wolf','Lupus',6,7,{});wf.hp=99;wf.aggro=null;th.hp=99;th.alive=true;S.npcs=[th,wf];const L0=document.querySelectorAll('#log > li').length;await huntBeast90(th,wf);
    seen=[...document.querySelectorAll('#log > li')].slice(0,6).some(li=>/counter-attacks/.test(li.textContent))}
  o.e={counter:seen}}
  S.npcs=keepN;return o});
out.hunt=hunt;
if(!hunt.e||!hunt.e.counter)miss.push('e: the hunted beast did not counter-attack at once '+JSON.stringify(hunt.e));
if(!hunt.a.hunts||!hunt.a.attacks)miss.push('Tholo did not attack the wolf: '+JSON.stringify(hunt.a));
if(hunt.b.kind!=='player'||hunt.b.who!==hunt.b.want)miss.push('tie did not go to the gladiator: '+JSON.stringify(hunt.b));
if(hunt.c.on.adj<=1)miss.push('v0.92: lion acted outside its prey\'s Resolve: '+JSON.stringify(hunt.c));if(!(hunt.c.on.own<=1))miss.push('v0.92: lion did not strike in its prey\'s own Resolve: '+JSON.stringify(hunt.c));
if(hunt.c.off.adj<=1)miss.push('old rule: lion acted outside the closest Resolve: '+JSON.stringify(hunt.c));
if(!hunt.d.killed||hunt.d.hoard!==hunt.d.want||hunt.d.killedBy!=='Tholo')miss.push('Tholo hoard: '+JSON.stringify(hunt.d));
/* 2. the Crowd Favor tile */
const crowd=await pg.evaluate(async()=>{const p=S.players[0];S.cur=0;S.phase='action';S.busy=false;S.npcs=S.npcs.filter(n=>n.t!=='commodus');
  const st=()=>{render();const b=document.querySelector('#actions [data-act="crowd"]');return b?{dis:b.disabled,sub:(b.querySelector('small')||{}).textContent}:null};
  p.coin=0;p.market=false;p.cf=1;const one=st();p.cf=6;const six=st();p.cf=1;p.coin=12;const coin=st();p.coin=0;p.cf=6;
  const cm=spawnNPC('commodus','Commodus',[6,6]);const com=st();if(cm){cm.alive=false;S.npcs=S.npcs.filter(n=>n!==cm)}
  return {cfOK:cfAllowed(),one,six,coin,com}});
out.crowd=crowd;
if(crowd.cfOK){if(!crowd.one||!crowd.one.dis)miss.push('CF tile enabled at 1 CF: '+JSON.stringify(crowd.one));if(!crowd.six||crowd.six.dis)miss.push('CF tile disabled at 6 CF: '+JSON.stringify(crowd.six));
  if(!crowd.coin||!crowd.coin.dis)miss.push('CF only: 1 CF + 12 coin keeps the tile off: '+JSON.stringify(crowd.coin))}else miss.push('round 1 has no CF?');
if(!crowd.com||!crowd.com.dis||!/Commodus/.test(crowd.com.sub||''))miss.push('CF tile under Commodus: '+JSON.stringify(crowd.com));
/* 3. Blessings as token rounds */
await pg.evaluate(async()=>{SETTINGS.pots90='tokens';const pl=S.pillars[0];if(pl&&pl.pots.length<3)pl.pots.push('ap2','mw1','elix2');draw();await new Promise(r=>setTimeout(r,500));draw()});
const box=await pg.evaluate(()=>{const pl=S.pillars.find(x=>x.pots.length>=2)||S.pillars[0];const m=center(pl.r,pl.c);const B=cv.getBoundingClientRect();return {x:B.left+m.x-TW*1.4,y:B.top+m.y-TW*2.6,w:TW*2.8,h:TW*3.2,n:pl.pots.length}});
await pg.screenshot({path:SHOTS+'/tokens_pillar.png',clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:box.w,height:box.h}});
await pg.screenshot({path:SHOTS+'/tokens_board.png'});
const tok=await pg.evaluate(async()=>{const pl=S.pillars.find(x=>x.pots.length>=2);const q=S.players[2];let flown=0;const push=TOK90.fly.push.bind(TOK90.fly);TOK90.fly.push=(...a)=>{flown++;return push(...a)};
  pl.pots.push('ap2');const n0=pl.pots.length;q.r=pl.r+1>12?pl.r-1:pl.r+1;q.c=pl.c;await breakPot(pl,q,[q.r,q.c]);const pop=Object.prototype.hasOwnProperty.call(pl.pots,'pop');delete TOK90.fly.push;
  SETTINGS.pots90='pots';draw();return {flown,n0,n1:pl.pots.length,popLeft:pop}});
out.tok=tok;if(tok.flown<1||tok.n1!==tok.n0-1||tok.popLeft)miss.push('token flip on a break: '+JSON.stringify(tok));
/* a frame mid-flight, for the eye */
await pg.evaluate(()=>{SETTINGS.pots90='tokens';const pl=S.pillars.find(x=>x.pots.length);const m=pl;TOK90.fly.push({r:m.r,c:m.c,k:'elix4',to:[m.r+1>12?m.r-1:m.r+1,m.c],t0:performance.now()-700,dur:1300});draw()});
await pg.screenshot({path:SHOTS+'/tokens_flip.png',clip:{x:Math.max(0,box.x-box.w/2),y:Math.max(0,box.y),width:box.w*2,height:box.h*1.3}});
await pg.evaluate(()=>{SETTINGS.pots90='pots';TOK90.fly.length=0;draw()});
/* settings rows */
const set=await pg.evaluate(async()=>{const h=settingsHTML('general');return {pots:/data-pots90="tokens"/.test(h),hs:/data-set="hsTurn90"/.test(h)}});
out.set=set;if(!set.pots||!set.hs)miss.push('settings rows: '+JSON.stringify(set));
/* 4. the hot-seat turning board */
await run('democritus',[0,2]);
const hs=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};SETTINGS.calm=false;
  SETTINGS.hsTurn90=false;S.cur=0;draw();o.off0=ROT89.k;S.cur=2;draw();o.off2=ROT89.k;
  SETTINGS.hsTurn90=true;S.cur=0;draw();o.k0=ROT89.k;S.cur=2;draw();o.k2=ROT89.k;o.spin=SPIN90.on;await W8(800);o.spinDone=!SPIN90.on;
  S.cur=1;draw();o.cpu=ROT89.k;
  SETTINGS.calm=true;S.cur=0;draw();o.calmK=ROT89.k;o.calmSpin=SPIN90.on;SETTINGS.calm=false;
  SETTINGS.hsTurn90=false;draw();o.offAgain=ROT89.k;return o});
out.hs=hs;
if(hs.off0!==0||hs.off2!==0||hs.offAgain!==0)miss.push('hot seat turned with the setting off: '+JSON.stringify(hs));
if(hs.k0===hs.k2)miss.push('hot seat did not turn between the humans: '+JSON.stringify(hs));
if(!hs.spin||!hs.spinDone)miss.push('no eased spin: '+JSON.stringify(hs));
if(hs.cpu!==hs.k2)miss.push('CPU turn changed the view: '+JSON.stringify(hs));
if(hs.calmK!==hs.k0||hs.calmSpin)miss.push('reduce motion should cut: '+JSON.stringify(hs));
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
