/* v0.83 sticking arrows + bolts (132-v83arrows): bow hits leave arrows in S.stuck83 at the struck location, the avatar draws ≤3
   per location + "+N", a severed limb takes its arrows, bolts are their own kind, beasts take them in the body or (Focus) the head,
   the Tholo house rule (a Focus-aimed bolt kills him with any damage), match snapshots keep them, the board draws them, and
   gameOver clears them. onlHash is untouched. SHOTS=dir saves arrows_avatar.png / arrows_board.png. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const r={};
  SETTINGS.tokenStyle='standee';SETTINGS.mini3d=true;applySettings();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'soldier',cpu:true}],opts:{}});
  await W8(2600);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}S.over=true;{let calm=0;for(let i=0;i<120&&calm<8;i++){await W8(200);if(CUR_MODAL)CUR_MODAL.done(null);calm=S.busy?0:calm+1}}
  const p=S.players[0],q=S.players[1];r.kinds=[shotKind83(mkW('bow')),shotKind83(mkW('arcu')),shotKind83(mkW('hasta')),shotKind83(mkW('sling')),shotKind83(mkW('knives'))];
  p.r=6;p.c=2;p.alive=true;q.r=6;q.c=6;q.alive=true;q.items=[];q.wL=null;q.wR=null;p.items=[];
  for(const l of LOCS){q.hp[l]=40;q.ap[l]=0;q.pieces[l]=[]}
  const shoot=async(k,tgt,opt)=>{if(tgt===q){q.alive=true;for(const l of ['head','chest','larm','lleg','rleg'])if(q.hp[l]<20)q.hp[l]=40}p.wR=mkW(k);p.wR.ammoLeft=99;p.mv=3;const t=tgt.cls?{kind:'player',ref:tgt,r:tgt.r,c:tgt.c,key:'p'+tgt.id}:{kind:'npc',ref:tgt,r:tgt.r,c:tgt.c,key:'n'+tgt.id};await doAttack(p,{w:p.wR,arm:'R'},t,opt||{})};
  const h0=onlHash();const L=()=>S.stuck83&&S.stuck83['p'+q.id]||[];
  /* 1. plain bow shots: arrows where they land */
  for(let i=0;i<40&&L().length<6;i++)await shoot('bow',q);
  r.n1=L().length;r.allArrows=L().every(x=>x.k==='arrow'&&LOCS.includes(x.l)&&Number.isInteger(x.s));r.angles=L().every(x=>x.a!=null);
  r.locsSeen=[...new Set(L().map(x=>x.l))];
  r.hashSame=onlHash()===(()=>{const keep=S.stuck83;S.stuck83={};const h=onlHash();S.stuck83=keep;return h})();
  /* 2. aimed shots (Focus! card) pile into the weakest spot: the right arm */
  q.hp.rarm=30;const before=L().filter(x=>x.l==='rarm').length;
  for(let i=0;i<60&&L().filter(x=>x.l==='rarm').length<before+5;i++){p.focusNext=true;await shoot('bow',q)}
  p.focusNext=false;r.rarmN=L().filter(x=>x.l==='rarm').length;
  const sv=avatarSVG(q);const per={};for(const l of LOCS)per[l]=0;
  r.avArrows=(sv.match(/class="stk83 /g)||[]).length;r.avPlus=(sv.match(/class="stk83n"/g)||[]).length;r.avPlusSum=[...sv.matchAll(/>\+(\d+)<\/text>/g)].reduce((a,m)=>a+ +m[1],0);r.expPlus=LOCS.reduce((a,l)=>a+Math.max(0,L().filter(x=>x.l===l).length-3),0);
  r.expDrawn=LOCS.reduce((a,l)=>a+Math.min(3,L().filter(x=>x.l===l).length),0);
  r.avatarHTML=sv;
  /* 3. sever the right arm: its arrows go with it */
  q.hp.rarm=1;q.ap.rarm=0;for(let i=0;i<40&&q.hp.rarm>0;i++){p.focusNext=true;await shoot('bow',q)}p.focusNext=false;
  r.severed=q.hp.rarm<=0;r.rarmAfter=L().filter(x=>x.l==='rarm').length;r.noRarmSvg=!/stk83/.test(avatarSVG(q).split('').length?'':'');
  /* 4. bolts */
  const nb=L().length;for(let i=0;i<40&&L().length===nb;i++)await shoot('arcu',q);r.bolt=L().slice(nb).some(x=>x.k==='bolt');
  r.boltSvg=/stk83b/.test(avatarSVG(q));
  /* 5. beasts: body vs head, Tholo house rule */
  const mk=(t,nm,rr,cc)=>{const n=mkNPC(t,nm,rr,cc);S.npcs.push(n);return n};
  const wolf=mk('wolf','Lupa',6,4);wolf.hp=99;
  for(let i=0;i<30&&!(S.stuck83['n'+wolf.id]||[]).length;i++)await shoot('bow',wolf);
  r.wolfBody=(S.stuck83['n'+wolf.id]||[]).every(x=>x.l==='body')&&(S.stuck83['n'+wolf.id]||[]).length>0;
  const nw=(S.stuck83['n'+wolf.id]||[]).length;for(let i=0;i<30&&(S.stuck83['n'+wolf.id]||[]).length===nw;i++){p.focusNext=false;await shoot('bow',wolf,{focusRoll:true})}
  r.wolfHead=(S.stuck83['n'+wolf.id]||[]).slice(nw).some(x=>x.l==='head');
  wolf.alive=false;
  const t1=mk('tholo','Tholo',6,4);const hp1=t1.hp;
  for(let i=0;i<30&&t1.alive&&t1.hp===hp1;i++)await shoot('arcu',t1);r.tholoBodyAlive=t1.alive&&t1.hp<hp1;
  r.tholoHpBefore=t1.hp;
  for(let i=0;i<30&&t1.alive;i++){p.focusNext=true;await shoot('arcu',t1)}
  r.tholoDead=!t1.alive;r.eyeLog=[...document.querySelectorAll('#log li')].slice(0,8).some(li=>/bolt through the eye/i.test(li.textContent));
  r.tholoHeadBolt=(S.stuck83['n'+t1.id]||[]).some(x=>x.l==='head'&&x.k==='bolt');
  const t2=mk('tholo','Tholo',6,4);t2.hp=200;const hb=t2.hp;
  for(let i=0;i<30&&t2.hp===hb;i++){p.focusNext=true;await shoot('bow',t2)}r.tholoArrowNoKill=t2.alive&&t2.hp<hb;t2.alive=false;
  /* 6. a match snapshot carries them */
  const snap=matchSnapshot('t');const S2=JSON.parse(snap.S);r.snapSame=JSON.stringify(S2.stuck83)===JSON.stringify(S.stuck83)&&S2.stuck83n===S.stuck83n;
  /* 7. the board draws them */
  let nd=0;const od=drawArrow83;drawArrow83=function(){nd++;return od.apply(this,arguments)};
  q.r=6;q.c=6;const w2=mk('wolf','Lupa',7,5);w2.hp=99;for(let i=0;i<20&&!(S.stuck83['n'+w2.id]||[]).length;i++)await shoot('arcu',w2);
  S.over=true;draw();r.boardDrawn=nd;drawArrow83=od;
  r.qPos=center(q.r,q.c);r.wPos=center(w2.r,w2.c);r.tw=TW;
  return r});
const a=o.a;
ok(JSON.stringify(a.kinds)===JSON.stringify(['arrow','bolt',null,null,null]),'bow=arrow, arcu=bolt, others none '+JSON.stringify(a.kinds));
ok(a.n1>=6&&a.allArrows&&a.angles,'bow hits stick as arrows with a location, seed and angle '+a.n1);
ok(a.hashSame,'stuck arrows are not in onlHash');
ok(a.rarmN>=5,'aimed shots pile in the right arm '+a.rarmN);
ok(a.avArrows===0,'v0.83 his call: the avatar draws no arrows (board only) '+a.avArrows);
ok(a.avPlus===0,'no +N on the avatar either');
ok(a.severed&&a.rarmAfter===0,'a severed arm takes its arrows '+a.rarmAfter);
ok(a.bolt&&!a.boltSvg,'arcuballista leaves bolts (in state; not on the avatar)');
ok(a.wolfBody,'beast: plain shots stick in the body');ok(a.wolfHead,'beast: a Focus shot sticks in the head');
ok(a.tholoBodyAlive,'Tholo survives an unaimed bolt');ok(a.tholoDead&&a.eyeLog&&a.tholoHeadBolt,'Tholo falls to an aimed bolt: '+JSON.stringify([a.tholoDead,a.eyeLog,a.tholoHeadBolt]));
ok(a.tholoArrowNoKill,'an aimed ARROW does not kill Tholo outright');
ok(a.snapSame,'match snapshot keeps S.stuck83');ok(a.boardDrawn>0,'board draws stuck arrows '+a.boardDrawn);
if(shots){
  await pg.evaluate(h=>{const d=document.createElement('div');d.id='av83shot';d.style.cssText='position:fixed;left:10px;top:10px;width:300px;height:664px;background:#1b130d;z-index:99999;padding:8px';d.innerHTML=h;d.querySelector('svg').style.cssText='width:100%;height:100%';document.body.appendChild(d)},a.avatarHTML);
  await pg.waitForTimeout(500);await pg.locator('#av83shot').screenshot({path:shots+'/arrows_avatar.png'});
  await pg.evaluate(()=>document.getElementById('av83shot').remove());
  const box=await pg.evaluate(()=>{const b=cv.getBoundingClientRect();const k=b.width/(cv.width/(window.devicePixelRatio||1));const q=S.players[1];const m=center(q.r,q.c);return {x:b.left+m.x*k,y:b.top+m.y*k,k}});
  await pg.screenshot({path:shots+'/arrows_board.png',clip:{x:Math.max(0,box.x-180*box.k*1.4),y:Math.max(0,box.y-220*box.k*1.4),width:360*box.k*1.4,height:300*box.k*1.4}});
  await pg.screenshot({path:shots+'/arrows_page.png'});
}
/* 8. the event's end clears them */
o.b=await pg.evaluate(async()=>{const had=Object.values(S.stuck83||{}).some(x=>x.length);S.over=false;gameOver([S.players[0]],'test').catch(()=>{});await new Promise(r=>setTimeout(r,300));const left=Object.values(S.stuck83||{}).some(x=>x.length);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}return {had,left}});
ok(o.b.had&&!o.b.left,'gameOver clears the stuck arrows '+JSON.stringify(o.b));
delete o.a.avatarHTML;console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
