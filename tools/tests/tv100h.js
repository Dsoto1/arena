/* v1.0 HIT FEEDBACK (277-v100hit): avatar number on the struck location (+ the peek at your target), one readout per attack, the body
   pip zone, Full / Mine / Quiet, tick marks between turns (kept, cleared at the fighter's turn), coin / CF fly to the panel (not on the board),
   Fast = no pop-ups, the kill switch brings the old floats back, the seeded dice + log the same ON vs OFF. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async(off,store)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(([off,st])=>{if(sessionStorage.getItem('tv100h'))return;sessionStorage.setItem('tv100h','1');Object.defineProperty(navigator,'webdriver',{get:()=>false});
    if(st)for(const k in st)localStorage.setItem(k,st[k]);localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_hit100off','1');else localStorage.removeItem('flavius_hit100off')},[off,store||null]);
  await pg.goto('file://'+page,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {pg,cx}};
const start=(pg,allCpu,seed)=>pg.evaluate(async([allCpu,seed])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  const cfg={ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:allCpu||i!==0})),opts:{spect:0}};if(seed!=null)cfg.seed=seed;startEvent(cfg);
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}return !!S},[allCpu,seed]);

/* ---------------- ON ---------------- */
const A=await open(false);const pg=A.pg;const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
ok(await start(pg,false),'0 event started');
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const P=S.players,me=P[0],q=P[1],x=P[2],y=P[3];
  SPEED='pause';S.boardPid=null;S.over=false;SETTINGS.fx=true;SETTINGS.hit100='full';H100.list.length=0;H100.k=4; /* a time stretch: a loaded machine draws a frame in 150-300 ms */
  const until=async(f,ms)=>{const t0=performance.now();let v;while(!(v=f())&&performance.now()-t0<ms)await W8(60);return v};const fxTxt=()=>FX.filter(f=>!f.img).length;
  /* 1 + 3 + 2: you hit a CPU on the chest: 2 armor + 2 health */
  q.ap.chest=2;q.hp.chest=7;q.pieces.chest=q.pieces.chest||[];render();
  await hurt(q,'chest',4,{type:'player',p:me,w:me.wR},'test');
  const R=H100.list.filter(z=>z.key===q);o.one=R.length;o.text=R[0]&&R[0].text;o.pip=R[0]&&R[0].pip&&R[0].pip.loc;o.total=R[0]&&R[0].pip&&R[0].pip.total;o.fxTxt=fxTxt();o.full=R[0]&&!R[0].faded;
  /* the pip is painted on the overlay */
  const pix=()=>{const cv=document.getElementById('fx95');if(!cv)return 0;const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let k=0;for(let i=3;i<d.length;i+=4*5)if(d[i]>0)k++;return k};
  draw();o.pix=await until(()=>{const k=pix();return k>30?k:0},4000)||pix();o.dbg=[H100.list.length,B95.fxW,B95.fxH,H100.painted];
  /* the peek + the avatar number over the chest */
  const n=await until(()=>document.querySelector('.h100n[data-pid="'+q.id+'"]'),5000);
  o.peek=!!document.querySelector('#board svg[data-h100="'+q.id+'"]');
  if(n){const sv=document.querySelector('#board svg[data-h100="'+q.id+'"]');const z=sv&&sv.querySelector('[data-avloc="chest"]');const nr=n.getBoundingClientRect(),zr=z?z.getBoundingClientRect():null;
    const cx=nr.left+nr.width/2,cy=nr.top+nr.height/2;o.onChest=!!zr&&cx>=zr.left-6&&cx<=zr.right+6&&cy>=zr.top-14&&cy<=zr.bottom+14;o.grey=!!n.querySelector('.a')&&/−2/.test(n.querySelector('.a').textContent);o.red=!!n.querySelector('.h')&&/−2/.test(n.querySelector('.h').textContent)}
  o.num=!!n;
  o.back=!!await until(()=>document.querySelector('#board svg[data-h100="'+me.id+'"]'),15000);H100.k=1;
  /* 5 others: CPU vs CPU */
  H100.list.length=0;H100.tgt=null;x.ap.head=0;x.hp.head=7;await hurt(x,'head',2,{type:'player',p:y,w:y.wR},'t2');const F=H100.list.filter(z=>z.key===x);o.othersFull=F.length===1&&F[0].faded;
  SETTINGS.hit100='mine';H100.list.length=0;x.hp.head=7;await hurt(x,'head',2,{type:'player',p:y,w:y.wR},'t3');o.othersMine=H100.list.filter(z=>z.key===x).length;
  SETTINGS.hit100='quiet';H100.list.length=0;q.hp.chest=7;await hurt(q,'chest',1,{type:'player',p:me,w:me.wR},'t4');o.quietMine=H100.list.length;
  SETTINGS.hit100='full';
  /* 4 a miss = one word readout */
  H100.list.length=0;fx(q.r,q.c,'miss','#b8b0a4');await hurt(q,'chest',0,{type:'player',p:me,w:me.wR},'t5');const M=H100.list.filter(z=>z.key===q);o.miss=M.length===1&&/Missed/.test(M[0].text);
  /* 6 ticks: the CPU hits you outside your turn */
  S.cur=1;me.hp.rleg=7;me.ap.rleg=0;await hurt(me,'rleg',3,{type:'player',p:q,w:q.wR},'t6');o.ticks=(H100.ticks[me.id]||[]).length;
  S.boardPid=null;H100.peek=null;render();await W8(400);const tk=document.querySelector('#board svg[data-h100="'+me.id+'"] .h100tk');o.tkEl=!!tk;o.tkTip=tk?tk.getAttribute('data-avtip'):'';
  render();await W8(300);o.tkKept=!!document.querySelector('#board .h100tk');
  BUS.emit('turn.begin',{turnNo:S.turnNo+1,seat:0,id:me.id,name:me.name,cpu:false,round:S.ri,rotation:S.rotation,sim:false});S.cur=0;await W8(150);render();await W8(300);
  o.tkCleared=!H100.ticks[me.id]&&!document.querySelector('#board .h100tk');
  /* 7 coin / CF fly, never on the board */
  H100.list.length=0;const f0=fxTxt();fx(me.r,me.c,'+3 CF','#f0cf7d');o.fly=!!await until(()=>document.querySelector('.h100fly'),3000);o.moneyBoard=H100.list.length+fxTxt()-f0;
  /* 8 Fast */
  await W8(900);SPEED='fast';H100.list.length=0;document.querySelectorAll('.h100n,.h100fly').forEach(e=>e.remove());q.hp.chest=7;q.ap.chest=0;
  await hurt(q,'chest',2,{type:'player',p:me,w:me.wR},'t7');fx(me.r,me.c,'+2 CF','#f0cf7d');await W8(300);o.fast=H100.list.length+fxTxt()+document.querySelectorAll('.h100n,.h100fly').length;
  SPEED='pause';
  /* settings row */
  o.setRow=/data-hit100="quiet"/.test(set98Pieces(k=>typeof settingsHTML==='function'?settingsHTML(k):''));
  return o});
ok(r.one===1&&r.fxTxt===0,'3a one readout for the blow, no loose floats '+JSON.stringify([r.one,r.fxTxt]));
ok(/4 → Chest: 2 armor, 2 health/.test(r.text||''),'3b readout names cause, place and split ('+r.text+')');
ok(r.pip==='chest'&&r.total==='−4','2a body pip lights the chest with one total');ok(r.pix>30,'2b pip painted on the overlay ('+r.pix+' '+JSON.stringify(r.dbg)+')');
ok(r.num&&r.onChest&&r.grey&&r.red,'1a avatar number over the chest: grey armor, red health '+JSON.stringify([r.num,r.onChest,r.grey,r.red]));
ok(r.peek,'1b the panel peeks at your target');ok(r.back,'1c the panel snaps back to yours');
ok(r.othersFull,'5a others: a faded mark in Full');ok(r.othersMine===0,'5b others: nothing in Mine');ok(r.quietMine===0,'5c Quiet: nothing on the board');
ok(r.miss,'4 a miss is one word');
ok(r.ticks===1&&r.tkEl&&/−3/.test(r.tkTip),'6a tick on your avatar with its tip ('+r.tkTip+')');ok(r.tkKept,'6b tick survives redraws');ok(r.tkCleared,'6c tick cleared at your turn');
ok(r.fly&&r.moneyBoard===0,'7 CF flies to the panel, not on the board '+JSON.stringify([r.fly,r.moneyBoard]));
ok(r.fast===0,'8 Fast: no pop-ups ('+r.fast+')');ok(r.setRow,'9 Settings row');
const fresh=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);ok(!fresh||!fresh.length,'no new 00c errors '+JSON.stringify(fresh).slice(0,300));
const store=await pg.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
await A.cx.close();

/* ---------------- kill switch ---------------- */
const B=await open(true);ok(await start(B.pg,false),'0b event started (off)');
const k=await B.pg.evaluate(async()=>{const P=S.players;SPEED='normal';SETTINGS.fx=true;P[1].ap.chest=2;P[1].hp.chest=7;FX.length=0;await hurt(P[1],'chest',4,{type:'player',p:P[0],w:P[0].wR},'k');
  return {fx:FX.filter(f=>!f.img).length,list:H100.list.length,mark:!!document.querySelector('#board svg[data-h100]')}});
ok(k.fx>=2&&k.list===0&&!k.mark,'10 kill switch: the old floats '+JSON.stringify(k));await B.cx.close();

/* ---------------- the same dice and log ON vs OFF (Normal pace, all CPU, seeded) ---------------- */
const run=async off=>{const C=await open(off,store);const okS=await start(C.pg,true,515151);
  const res=await C.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[],R=[];
    const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=8)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=8)R.push(e.turnNo+':'+RNG.s)});
    SPEED='normal';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    let seen=0;for(let i=0;i<1200&&!(S.over||S.turnNo>8);i++){await W8(100);seen=Math.max(seen,typeof H100!=='undefined'?H100.n:0)}clearInterval(iv);SPEED='pause';log=lb;offT();
    return {L,R,turn:S.turnNo,seen}});await C.cx.close();res.ok=okS;return res};
const ON=await run(false),OFF=await run(true);const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(ON.ok&&OFF.ok&&ON.R.length>=3,'11a both seeded runs played '+JSON.stringify([ON.R.length,OFF.R.length,ON.turn,OFF.turn,ON.seen]));
ok(JSON.stringify(ON.R)===JSON.stringify(OFF.R),'11b same dice ON vs OFF '+JSON.stringify([ON.R.slice(0,3),OFF.R.slice(0,3)]));
{const a=fl(ON),c=fl(OFF);let i=0;while(i<a.length&&a[i]===c[i])i++;ok(a.length===c.length&&i===a.length,'11c same log ON vs OFF (first difference at '+i+'/'+a.length+': '+JSON.stringify([a[i],c[i]])+')')}
console.log(JSON.stringify({r,k,seen:ON.seen}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
