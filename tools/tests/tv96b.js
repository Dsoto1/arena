/* v0.96 part B (232-v96board): 1 every attack logged (misses, no aim window after a miss, Focus × falls back, saves on screen), 2 belt layer order,
   3 shield window renders HTML, 4 your turn → your panel, 5 no cards while snapping / none left over, 6 no pinned stands line + seat/wager lines
   only under Stands, 7 no idle upkeep + Switch section button, 8 stone cap, 9 Fast jumps, 10 weapon counters, 11 Leather Tasset not padding,
   12 Carmina window. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
const start=(ev,spect)=>pg.evaluate(async([ev,spect])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='normal';const seats=['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0}));
  startEvent({ev,loc:6,seats,opts:{spect}});
  for(let i=0;i<150;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('[data-act="coin"]');if(c)c.click()}else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break}
  SPEED='pause';return !!S&&cur()===S.players[0]},[ev,spect]);
ok(await start('democritus',0),'0 started');
/* ---- 1 every attack is logged ---- */
const one=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=S.players[0],q=S.players[1];
  const L=[];const bl=log;log=function(h){L.push(String(h).replace(/<[^>]+>/g,''));return bl.apply(this,arguments)};
  const attack=async(how,hit,act)=>{L.length=0;q.alive=true;q.r=p.r;q.c=p.c+1<13?p.c+1:p.c-1;for(const l of LOCS){q.hp[l]=3;q.ap[l]=0}q.hp.head=1;p.attacks=0;p.armUses={R:0,L:0};p.mv=4;p.hitTargets=new Set();
    if(how==='card')p.focusNext=true;const src=attackSources(p).filter(s=>!s.thr)[0];const tg={kind:'player',ref:q,key:'p'+q.id,r:q.r,c:q.c};
    const keep=RNG;RNG={next:()=>hit?0.1:0.9};let win=false;const pr=doAttack(p,src,tg,{focusRoll:how==='roll'});let done=false;pr.then(()=>done=true,()=>done=true);
    for(let i=0;i<40&&!done;i++){await W8(120);if(CUR_MODAL){const t=document.getElementById('mTitle').textContent;if(/Focus/.test(t)){win=true;if(act==='esc'){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));continue}
          const bt=[...document.querySelectorAll('#mBtns button')].find(b=>b.textContent.includes(LOCN.head));if(bt)bt.click();else CUR_MODAL.done('head')}else{const bt=[...document.querySelectorAll('#mBtns button')].find(b=>!b.disabled);if(bt)bt.click()}}}
    RNG=keep;await W8(50);return {win,L:L.slice(),alive:q.alive,keys:Object.keys(q.hp).join(',')}};
  o.missPlain=await attack('none',false);o.missCard=await attack('card',false);o.missRoll=await attack('roll',false);o.esc=await attack('roll',true,'esc');o.hit=await attack('card',true);
  /* a beast's missed bite */
  L.length=0;q.alive=true;for(const l of LOCS)q.hp[l]=3;await hurt(q,'chest',0,{type:'npc',n:{name:'Leo'}},'Leo attacks = 0');o.beast=L.slice();
  /* Fidelis shows on screen */
  const fxs=[];const bfx=fx;fx=function(r,c,t){fxs.push(String(t));return bfx.apply(this,arguments)};q.cpu=true;q.diff='hard';q.items.push(mkCard('fidelis'));
  await defend(q,4,'chest',2,0,2,p.name,p);fx=bfx;o.fid=fxs.join('|');
  log=bl;return o});
ok(one.missPlain.L.some(l=>/misses/.test(l)),'1a a plain miss is logged '+JSON.stringify(one.missPlain.L));
ok(!one.missCard.win&&one.missCard.L.some(l=>/misses/.test(l)),'1b Focus! after missed dice: no window, logged');
ok(!one.missRoll.win&&one.missRoll.L.some(l=>/focuses/.test(l))&&one.missRoll.L.some(l=>/misses/.test(l)),'1c Focus roll after missed dice: dice line + miss, no window');
ok(one.esc.win&&!one.esc.alive&&one.esc.keys==='head,chest,larm,rarm,rleg,lleg'&&!one.esc.L.some(l=>/undefined/.test(l)),'1d Focus roll closed with × strikes a real location '+JSON.stringify(one.esc));
ok(one.hit.win&&!one.hit.alive&&one.hit.L.some(l=>/eliminated/i.test(l)),'1e a focused head shot eliminates and logs');
ok(one.beast.some(l=>/Leo attacks = 0 → misses/.test(l)),'1f a beast miss is logged');ok(/Fidelis/.test(one.fid),'1g Fidelis shows on screen '+one.fid);
/* ---- 2 belt order, 3 shield window, 4 panel, 10 counters, 11 tasset ---- */
const two=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=S.players[0],q=S.players[1];
  const ids=svg=>[...svg.matchAll(/clipPath id="acp[^"]*?(balteus1?|musculata|thighplate|legwrapsU|pectorale)"/g)].map(m=>m[1]);
  o.ord1=ids(avatarSVG(avatarFor73([['balteus','chest'],['musculata','chest'],['thighplate','rleg'],['legwrapsU','lleg']],'b96a')));
  o.ord2=ids(avatarSVG(avatarFor73([['legwrapsU','lleg'],['thighplate','rleg'],['balteus1','chest'],['pectorale','chest']],'b96b')));
  /* 3 */
  p.cpu=false;p.wL=mkW('scutum');p.alive=true;for(const l of LOCS){p.hp[l]=5;p.ap[l]=0}
  const pr=hurt(p,'chest',3,{type:'player',p:q,w:q.wR||mkW('gladius')},`${nm(q)} attacks with Gladius ${diceHtml([true,true])} = 3`);
  for(let i=0;i<20&&!CUR_MODAL;i++)await W8(100);o.shTitle=document.getElementById('mTitle').textContent;const bh=document.getElementById('mBody').innerHTML;o.shRaw=/&lt;/.test(bh);o.shHtml=/<span|<i /.test(bh);
  const save=[...document.querySelectorAll('#mBtns button')].find(b=>b.dataset.mi==='1');if(save)save.click();else if(CUR_MODAL)CUR_MODAL.done(0);await pr;
  /* 4 */
  S.boardPid=2;BUS.emit('turn.begin',{turnNo:S.turnNo,seat:0,id:p.id,name:p.name,cpu:false,sim:false});o.pid=S.boardPid;
  S.boardPid=2;BUS.emit('turn.begin',{turnNo:S.turnNo,seat:1,id:q.id,name:q.name,cpu:true,sim:false});o.pidCpu=S.boardPid;S.boardPid=null;
  /* 10 */
  const sc=mkW('scutum');o.c0=weaponChips(sc);sc.usesLeft--;o.c1=weaponChips(sc);o.cDef=weaponChips(W.scutum);
  const sl=Object.keys(W).find(k=>W[k].ammo!=null&&!W[k].custom);if(sl){const w=mkW(sl);w.ammoLeft--;o.cAmmo=weaponChips(w);o.ammoWant=`${w.ammoLeft}/${w.ammo}`}
  p.wL=mkW('scutum');p.wL.usesLeft=2;render();await W8(300);const bd=document.getElementById('board');o.badge=[...bd.querySelectorAll('.wart .wctr96')].map(x=>x.textContent);
  /* 11 */
  const fake=()=>{const f={hp:{},ap:{},pieces:{}};for(const l of LOCS){f.hp[l]=5;f.ap[l]=0;f.pieces[l]=[]}return f};
  let f=fake();equipPiece(f,'thighplate','rleg');o.tassOnPlate=equipPiece(f,'legwrapsU','rleg');
  f=fake();equipPiece(f,'legwrapsU','rleg');o.plateOnTass=equipPiece(f,'femoralia','rleg');o.lowerPad=equipPiece(f,'legwraps','rleg')&&equipPiece(f,'ocrea','rleg');
  f=fake();o.beltChest=equipPiece(f,'pectorale','chest')&&equipPiece(f,'balteus','chest');
  f=fake();o.armPad=equipPiece(f,'wraps','rarm')&&equipPiece(f,'manica','rarm');
  o.armPadFn=[armPad(ARM.legwrapsU),armPad(ARM.legwraps),armPad(ARM.wraps),armPad(ARM.balteus),armPad(ARM.thighplate)].join(',');
  o.classClash=[];for(const k of Object.keys(CLASSES)){const C=CLASSES[k];if(!C||!Array.isArray(C.armor))continue;const g=fake();for(const [a,l] of C.armor)if(ARM[a]&&g.hp[l]!=null&&!equipPiece(g,a,l))o.classClash.push(k+':'+a+'@'+l)}
  try{const ic=onlCatalog();o.onlFit=JSON.stringify(ONLC.armFit({},['legwrapsU','femoralia'],ic))+JSON.stringify(ONLC.armFit({},['legwraps','ocrea'],ic))}catch(e){o.onlFit='err '+e.message}
  return o});
ok(two.ord1.indexOf('musculata')<two.ord1.indexOf('balteus')&&two.ord1.indexOf('balteus')<two.ord1.indexOf('thighplate')&&two.ord1.indexOf('balteus')<two.ord1.indexOf('legwrapsU'),'2a belt over the chest armor, under the thigh pieces '+two.ord1);
ok(two.ord2.indexOf('pectorale')<two.ord2.indexOf('balteus1')&&two.ord2.indexOf('balteus1')<two.ord2.indexOf('thighplate'),'2b order kept whatever the wearing order '+two.ord2);
ok(/Raise/.test(two.shTitle)&&!two.shRaw&&two.shHtml,'3 shield window shows the attack line as HTML ('+two.shTitle+')');
ok(two.pid===null&&two.pidCpu===2,'4 your turn brings your gladiator back ('+two.pid+','+two.pidCpu+')');
ok(/4\/4/.test(two.c0)&&/3\/4/.test(two.c1)&&!/\//.test(two.cDef.replace(/<[^>]*>/g,'')),'10a shield uses left/total ('+two.c1.replace(/<[^>]*>/g,'')+')');
ok(!two.ammoWant||two.cAmmo.includes(two.ammoWant),'10b ammo left/total');ok(two.badge.some(t=>/2\/4/.test(t)),'10c counter badge on the panel card '+JSON.stringify(two.badge));
ok(two.tassOnPlate===false&&two.plateOnTass===false,'11a the tasset and a thigh plate share the upper leg no more');ok(two.lowerPad&&two.beltChest&&two.armPad,'11b lower padding and the belt still stack');
ok(two.armPadFn==='false,true,true,true,false','11c armPad '+two.armPadFn);ok(!two.classClash.length,'11d no class loadout clashes '+two.classClash);
ok(/^\[true,false\]\[true,true\]$/.test(two.onlFit),'11e online armFit agrees '+two.onlFit);
/* ---- 6 7 8 spectators ---- */
ok(await start('democritus','auto'),'0b started with a crowd');
const sp=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=S.players[0],q=S.players[1];
  o.n=(S.spect||[]).length;if(!o.n)return o;
  /* 6 */
  await W8(500);o.pin=!document.getElementById('slogPin');const n0=(S.spectLog||[]).length;const top0=document.getElementById('log').firstChild;
  p.coin=10;placeSelfBet(p,2,2.5);o.betLog=document.getElementById('log').firstChild===top0;o.betSlog=(S.spectLog||[]).length===n0+1&&/slips/.test(S.spectLog[S.spectLog.length-1].html);
  /* 7 */
  const me={...S.spect[0],id:'me96',human:true,cf:0,fav:null,gone:false,name:'Tester'};S.spect.push(me);
  let opened=false;const pr=humanSpectatorTurn(me);for(let i=0;i<6;i++){await W8(100);if(CUR_MODAL){opened=true;CUR_MODAL.done('pass')}}await pr;o.noWin=!opened;
  render();await W8(200);const bt=document.getElementById('btnSec96');o.btn=!!bt&&!bt.hidden;o.btnOff=!!bt&&bt.disabled;
  me.cf=5;render();await W8(200);o.btnOn=!!bt&&!bt.disabled;const sec0=me.sec;
  if(bt){bt.click();for(let i=0;i<20&&!CUR_MODAL;i++)await W8(100);if(CUR_MODAL)CUR_MODAL.done('sec:'+((sec0+1)%SECTIONS.length));await W8(300)}
  o.moved=me.sec!==sec0&&me.cf===2;o.movedSlog=/You move to/.test(S.spectLog[S.spectLog.length-1].html);o.onceRot=!!bt&&bt.disabled;
  me.cf=20;q.alive=true;const qq=SECTIONS[me.sec].q;q.r=-9;/* nobody in reach unless the window can open */S.spect.splice(S.spect.indexOf(me),1);
  /* 8 */
  const v=S.players[2];v.alive=true;for(const l of LOCS){v.hp[l]=7;v.ap[l]=0}const spc=S.spect[0];const before=hpSumOf(v);S.stone96=null;
  const L=[];const bl=log;log=function(h){L.push(String(h).replace(/<[^>]+>/g,''));return bl.apply(this,arguments)};const keep=RNG;RNG={next:()=>0.1};
  for(let i=0;i<5;i++)await spectStone(spc,v);RNG=keep;log=bl;o.stoneDmg=before-hpSumOf(v);o.wide=L.filter(l=>/flies wide/.test(l)).length;
  S.turnNo++;RNG={next:()=>0.1};await spectStone(spc,v);RNG=keep;o.nextTurn=before-hpSumOf(v);
  return o});
ok(sp.n>0,'6-8 a crowd to test with');
if(sp.n){ok(sp.pin,'6a no pinned stands line');ok(sp.betLog&&sp.betSlog,'6b a wager goes to the Stands log only');
  ok(sp.noWin,'7a no upkeep window with nothing to do');ok(sp.btn&&sp.btnOff,'7b Switch section button shows, off without CF');ok(sp.btnOn,'7c on with 3 CF');
  ok(sp.moved&&sp.movedSlog,'7d the button moves seats for 3 CF');ok(sp.onceRot,'7e once a rotation');
  ok(sp.stoneDmg===3&&sp.wide===2,'8a three stones hit, the rest fly wide ('+sp.stoneDmg+'/'+sp.wide+')');ok(sp.nextTurn===4,'8b a new turn, a new count');}
/* ---- 9 Fast jumps ---- */
const f9=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=S.players[0];
  let n=0;const off=BUS.on('draw.after',()=>n++);
  const path=()=>{const out=[];let r=p.r,c=p.c;for(const [dr,dc] of [[0,1],[0,1],[0,1],[0,-1],[0,-1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr<0||nc<0||nr>=N||nc>=N||pillarAt(nr,nc)||unitAt(nr,nc)||spikeAt(nr,nc))continue;out.push(nr*N+nc);r=nr;c=nc}return out};
  const run=async sp=>{SPEED=sp;p.mv=6;const pa=path().slice(0,3);n=0;const t0=performance.now();await movePlayer(p,pa);return {steps:pa.length,draws:n,ms:performance.now()-t0}};
  o.normal=await run('normal');o.fast=await run('fast');o.mul=SPEEDMUL.fast;off();SPEED='pause';return o});
ok(f9.fast.steps>=2&&f9.fast.draws===1,'9a Fast: one board draw per move ('+JSON.stringify(f9.fast)+')');ok(f9.normal.draws>=f9.normal.steps,'9b Normal still draws every step ('+JSON.stringify(f9.normal)+')');
ok(f9.fast.ms<f9.normal.ms&&f9.mul===0.18,'9c Fast waits nothing between steps; speeds restored');
/* ---- 12 Carmina ---- */
const c12=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};SPEED='normal';
  const pr=runCarmina();for(let i=0;i<30&&!CUR_MODAL;i++)await W8(100);const box=document.getElementById('mBody');
  const gs=[...box.querySelectorAll('.cm96g')];o.groups=gs.length;o.verses=box.querySelectorAll('.cm96b').length;
  o.left=gs.every(g=>{const v=g.querySelector('.cm96v'),c=g.querySelector('.cm96c');if(!v||!c)return false;const a=v.getBoundingClientRect(),b2=c.getBoundingClientRect();return a.right<=b2.left+2&&a.width>60});
  o.optOut=[...document.querySelectorAll('#mBtns button')].filter(b=>getComputedStyle(b).display!=='none').length;
  const r1=box.getBoundingClientRect();const last=gs[gs.length-1].getBoundingClientRect();o.fill=gs.length?(last.right-gs[0].getBoundingClientRect().left)/r1.width:0;
  const v=box.querySelector('.cm96b[data-cm96="1"]');if(v)v.click();
  for(let i=0;i<30;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}await pr;
  o.got=S.players[0].items.some(x=>x.kind==='card'&&x.key==='minerva');o.cpus=[...document.querySelectorAll('#log li')].slice(0,12).filter(li=>/recites|declines/.test(li.textContent)).length;SPEED='pause';return o});
ok(c12.groups===3&&c12.verses===12,'12a three cards, twelve verses ('+c12.groups+'/'+c12.verses+')');ok(c12.left,'12b each card\'s verses sit to its left');ok(c12.optOut===1,'12c only Opt out in the button bar');
ok(c12.fill>0.9,'12d no empty space ('+c12.fill.toFixed(2)+')');ok(c12.got&&c12.cpus>=4,'12e the picked verse pays and everyone recites');
/* ---- 5 To the end: no cards, none left ---- */
const s5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=S.players[0];
  const c0=(S.cardsSeen||[]).length;const k0=document.querySelectorAll('#cardShow .cs').length;S.snap=true;cardShow('c:minerva',p,'test');o.noCard=document.querySelectorAll('#cardShow .cs').length===k0&&(S.cardsSeen||[]).length===c0+1;
  const n=S.npcs.find(x=>x.alive)||S.npcs[0];if(n){beastShow82(n);o.noBeast=!BS82.q.length&&!(document.getElementById('bs82')||{innerHTML:''}).innerHTML.trim()}else o.noBeast=true;S.snap=false;
  SPEED='normal';cardShow('c:minerva',p,'test');o.normalCard=!!document.querySelector('#cardShow .cs');if(n){beastShow82(n);await W8(100);o.normalBeast=!!document.querySelector('#bs82 .bs82card')}
  simToEnd(true);for(let i=0;i<300&&!S.over;i++)await W8(100);o.over=S.over;await W8(400);
  o.leftCards=document.querySelectorAll('#cardShow .cs').length;o.leftBeast=document.querySelectorAll('#bs82 .bs82card').length+(typeof BS82!=='undefined'?BS82.q.length:0);
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}return o});
ok(s5.noCard&&s5.noBeast,'5a no card pop-ups while snapping (still recorded)');ok(s5.normalCard&&s5.normalBeast!==false,'5b cards still show at Normal');
ok(s5.over&&s5.leftCards===0&&s5.leftBeast===0,'5c none linger after the end '+JSON.stringify(s5));
const fresh=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);ok(!fresh||!fresh.length,'no new 00c errors '+JSON.stringify(fresh));
delete two.c0;delete two.c1;delete two.cDef;delete two.cAmmo;console.log(JSON.stringify({one:{esc:one.esc,fid:one.fid},two,sp,f9,c12,s5}).slice(0,3000));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
