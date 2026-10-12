/* v1.0 tv100bb — ONE BUBBLE FAMILY (303-v100bubbles; spec tools/plans/mock100/NOTES-bubbles.md).
   1 the five variants: SPEECH (one bubble = colour dot, no name plate), THOUGHT (the same box, words in italics; with 2 up both wear their
     name plate), SHOUT (Flavius's line on the HTML layer, never painted on the canvas), WAGER, CHAT; CROWD keeps the emote glyph inside;
   2 cap: 3 speakers (thoughts dropped first) + Flavius + wagers; 3 Fast = no bubbles (chat stays); 4 keep-out: no bubble over a piece's
     head, Flavius's box or another bubble, and the measured rects match the page; 5 zoomed → the layer hides and the board layer paints them;
   6 Reduce motion = opacity only; 7 the kill switch brings #bubbles back; 8 seeded dice + log the same ON vs OFF;
   9 PERFORMANCE (his condition): draw + layout per frame with the full cap up, ON (new layer) vs OFF (the old paths) in one page, unzoomed
     and zoomed-panning; ON must not be slower than OFF by more than 5% or 1 ms (draw p50 unzoomed, frame p95 zoomed; 8 interleaved blocks of 20 frames). No new errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m);else console.log('ok',m.slice(0,200))};
const open=async(ls,vp)=>{const cx=await b.newContext({viewport:vp||{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto('file://'+page,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {pg,cx}};
const start=(pg,seed,spect)=>pg.evaluate(async([seed,spect])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  startEvent({ev:'democritus',loc:6,seed,seats:['venatore','soldier','royalty','hero'].map(c=>({cls:c,cpu:true})),opts:{spect}});
  for(let i=0;i<150;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}SPEED='pause';await W8(300);return !!S},[seed,spect]);

const A=await open();const pg=A.pg;const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
ok(await start(pg,4242,8),'0 event started');
/* ---------------- 1 the variants ---------------- */
const r1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const P=S.players;THOUGHTS=true;SETTINGS.flavius=true;S.bubbles=[];BB100.set(true);
  think(P[0],'Nothing personal, friend.','say');await W8(60);draw();
  const one=document.querySelector('#bb100 .b100.sp');o.one=!!one;o.solo=!!(one&&one.classList.contains('solo'));o.nmHidden=one?getComputedStyle(one.querySelector('.nm')).display==='none':null;
  think(P[1],'Patience. Let them bleed first.','gift');S.bubbles.find(x=>x.pid===P[1].id).mood='think';BB100.done.clear();for(const it of [...BB100.items.values()])if(it.pid===P[1].id)bbDrop(it);
  S.bubbles=S.bubbles.filter(x=>x.pid!==P[1].id);S.bubbles.push({id:9001,pid:P[1].id,text:'Patience. Let them bleed first.',mood:'think',at:Date.now()});renderBubbles();draw();await W8(60);
  const th=document.querySelector('#bb100 .b100.th');o.th=!!th;o.italic=th?getComputedStyle(th.querySelector('.bd')).fontStyle:null;
  o.plates=[...document.querySelectorAll('#bb100 .b100.sp')].map(e=>!e.classList.contains('solo')&&getComputedStyle(e.querySelector('.nm')).display!=='none');
  /* SHOUT: Flavius's line on the layer, not on the canvas */
  FLAV.until=0;flaviusMood('angry',4000,1);draw();await W8(60);const sh=document.querySelector('#bb100 .b100.sh');o.sh=!!sh;o.shText=sh&&sh.textContent;o.flavLine=FLAV.line;o.shFont=sh?getComputedStyle(sh.querySelector('.bd')).fontFamily:'';
  /* WAGER */
  wagerBubble(400,300,7,'cf','Gaius');wagerBubble(500,300,10,'coin','You');draw();o.wg=document.querySelectorAll('#bb100 .b100.wg').length;
  /* CHAT */
  onlBubble80(2,Object.keys(ONLC.QC_TEXT||{})[0]||'x');draw();const ch=document.querySelector('#bb100 .b100.ch');o.ch=!!ch;o.band=ch?getComputedStyle(ch.querySelector('.bd')).borderLeftWidth:'';
  /* CROWD: the glyph rides inside */
  const sp=(S.spect||[]).find(x=>x._x!=null);o.sp=!!sp;if(sp){const p0=BB100.stats.pics;emote(sp,'😄','Ave!');draw();o.g=(S.emotes.find(e=>e.sid===sp.id)||{}).g100;o.crowdPics=BB100.stats.pics-p0+BB100.stats.picHits}
  o.oldBub=document.querySelectorAll('#bubbles .bub').length;o.oldW=document.querySelectorAll('#wbubs .wbub,#wbubs .qbub80').length;o.aria=document.getElementById('bb100').getAttribute('aria-hidden');
  return o});
console.log('variants',JSON.stringify(r1));
ok(r1.one&&r1.solo&&r1.nmHidden,'1a one speech bubble: colour dot only, no name plate');
ok(r1.th&&r1.italic==='italic','1b a thought = the speech box in italics');
ok(r1.plates.length===2&&r1.plates.every(x=>x),'1c two bubbles up: both wear their name plate '+JSON.stringify(r1.plates));
ok(r1.sh&&r1.flavLine&&r1.shText.includes(r1.flavLine)&&/Marcellus/.test(r1.shFont),'1d Flavius shouts on the layer in the display face');
ok(r1.wg===2,'1e wagers on the layer');ok(r1.ch&&r1.band==='5px','1f chat with the colour band');
ok(!r1.sp||r1.g==='😄'&&r1.crowdPics>0,'1g the crowd keeps its glyph inside, painted from a cached picture');
ok(r1.oldBub===0&&r1.oldW===0&&r1.aria==='true','1h nothing on the old layers; the new one is aria-hidden');
/* the canvas no longer gets Flavius's line: a draw with the line set paints no text beside the box (fillText spy) */
{const t=await pg.evaluate(()=>{const ln=FLAV.line;const said=[];const f=ctx.fillText;ctx.fillText=function(s){said.push(String(s));return f.apply(this,arguments)};try{draw()}finally{ctx.fillText=f}return said.includes(ln)});
  ok(!t,'1i Flavius\'s line is no longer painted on the canvas')}

/* ---------------- 2 cap · 4 keep-out ---------------- */
const r2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=S.players;const o={};
  for(let i=0;i<4;i++){S.bubbles=S.bubbles.filter(x=>x.pid!==P[i].id);S.bubbles.push({id:9100+i,pid:P[i].id,text:i===0?'I think, therefore I wait.':'Line number '+i+' of the speech.',mood:i===0?'think':'say',at:Date.now()})}
  renderBubbles();draw();await W8(300);const L=[...BB100.items.values()];o.spk=L.filter(x=>x.v==='sp'||x.v==='th'||x.v==='ch').map(x=>x.v);o.flav=L.some(x=>x.v==='sh');o.wg=L.filter(x=>x.v==='wg').length;
  /* keep-out: the placed rects vs heads, Flavius's box, each other; and vs the page */
  bbPlace();const P2=BB100.lastP;const heads=bbHeads();const fb=bbFlavBox();const bad=[];const R=cv.getBoundingClientRect();
  for(let i=0;i<P2.length;i++){const a=P2[i];if(a.slot==='far'||a.forced)continue;for(const h of heads)if(bbOver(a.rect,[h])>0)bad.push(a.it.v+':head');if(fb&&bbOver(a.rect,[fb])>0)bad.push(a.it.v+':flav');
    for(let j=0;j<i;j++)if(bbOver(a.rect,[P2[j].rect])>0)bad.push(a.it.v+':bub')}
  o.bad=bad;o.n=P2.length;o.forced=P2.filter(a=>a.forced).length;o.dbg=P2.map(a=>[a.it.v,a.slot,a.rect.map(Math.round)]);o.heads=heads.map(h=>h.map(Math.round));o.fb=fb&&fb.map(Math.round);await Promise.all(document.getAnimations().filter(x=>{const t=x.effect&&x.effect.target;return t&&t.closest&&t.closest('#bb100')&&x.animationName==='in100'}).map(x=>x.finished.catch(()=>0)));
  let worst=0;for(const a of P2){if(!a.it.el||a.it.v==='wg')continue; /* wagers drift up by design */const q=a.it.el.querySelector('.bd').getBoundingClientRect();worst=Math.max(worst,Math.abs(q.left-R.left-a.rect[0]),Math.abs(q.top-R.top-a.rect[1]),Math.abs(q.width-a.rect[2]))}o.worst=+worst.toFixed(1);
  return o});
console.log('cap',JSON.stringify(r2));
ok(r2.spk.length===3&&!r2.spk.includes('th')&&r2.spk.includes('ch'),'2 cap 3 speakers: the thought dropped first, chat kept '+JSON.stringify(r2.spk));
ok(r2.flav&&r2.wg===2,'2b Flavius + wagers ride beside the cap');
ok(r2.bad.length===0&&r2.forced<=2,'4a keep-out: no bubble over a head, Flavius\'s box or another bubble '+JSON.stringify(r2.bad));
ok(r2.worst<=5,'4b measured once: the page rects match the layout '+r2.worst);

/* ---------------- 6 reduce motion ---------------- */
const r6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.calm=true;try{applySettings()}catch(e){}BB100.rmAt=0;const P=S.players;
  S.bubbles=S.bubbles.filter(x=>x.pid!==P[3].id);S.bubbles.push({id:9200,pid:P[3].id,text:'Calm now.',mood:'say',at:Date.now()});renderBubbles();draw();await W8(40);
  const el=[...document.querySelectorAll('#bb100 .b100.sp .bd')].pop();const an=el?getComputedStyle(el).animationName:'';const rm=document.getElementById('bb100').classList.contains('rm');
  SETTINGS.calm=false;try{applySettings()}catch(e){}BB100.rmAt=0;draw();return {an,rm}});
ok(r6.rm&&(r6.an==='in100o'||r6.an==='none'),'6 Reduce motion: opacity only '+JSON.stringify(r6));
{await pg.emulateMedia({reducedMotion:'reduce'});const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));BB100.rmAt=0;const P=S.players;
  S.bubbles=S.bubbles.filter(x=>x.pid!==P[0].id);S.bubbles.push({id:9250,pid:P[0].id,text:'Quiet now.',mood:'say',at:Date.now()});renderBubbles();draw();await W8(40);
  const el=[...BB100.items.values()].find(x=>x.bid===9250);const an=el&&el.el?getComputedStyle(el.el.querySelector('.bd')).animationName:'';return {an,rm:document.getElementById('bb100').classList.contains('rm')}});
  await pg.emulateMedia({reducedMotion:'no-preference'});await pg.evaluate(()=>{BB100.rmAt=0;draw()});ok(r.rm&&(r.an==='in100o'||r.an==='none'),'6b OS reduced motion: the fade-in only '+JSON.stringify(r))}

/* ---------------- 5 zoomed → the board layer ---------------- */
const r5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const c0=BB100.stats.canvas;S.zoomIn=true;CAM.z=null;for(let i=0;i<16;i++){draw();await W8(80)}
  const o={z:bbZoomed(),vis:document.getElementById('bb100').style.visibility,canvas:BB100.stats.canvas-c0,n:(BB100.lastP||[]).length};
  S.zoomIn=false;for(let i=0;i<16;i++){draw();await W8(80)}o.back=document.getElementById('bb100').style.visibility;return o});
ok(r5.z&&r5.vis==='hidden'&&r5.canvas>0&&r5.n>0,'5 zoomed: the layer hides, the board paints the bubbles '+JSON.stringify(r5));ok(r5.back==='','5b zoomed out: the layer is back');

/* ---------------- 9 PERFORMANCE ON vs OFF (same page, full cap up) ---------------- */
const fill=async on=>pg.evaluate(on=>{const P=S.players;BB100.set(on);S.bubbles=[];
  for(let i=0;i<3;i++)S.bubbles.push({id:9300+i+(on?0:50),pid:P[i].id,text:['Nothing personal, friend.','Patience. Let them bleed first.','The crowd wants a duel.'][i],mood:i===1?'think':'say',at:Date.now()});
  FLAV.until=0;flaviusMood('smug',60000,1);FLAV.lineUntil=performance.now()+60000;renderBubbles();
  wagerBubble(420,320,7,'cf','Gaius');wagerBubble(600,330,10,'coin','You');draw()},on);
/* ON and OFF blocks of 20 frames alternate 8 times per mode (a loaded box drifts: interleaving spreads it over both), all samples pooled */
const block=(zoomed,n)=>pg.evaluate(async([zoomed,n])=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));const D=[];
  for(let i=0;i<4;i++){draw();await raf()}
  for(let i=0;i<n;i++){if(zoomed){const t=(window.__bbT=(window.__bbT||0)+1)/60*Math.PI*2;CAM.fr=6+3*Math.sin(t);CAM.fc=6+3*Math.cos(t)}const t0=performance.now();draw();void document.body.offsetHeight;D.push(performance.now()-t0);await raf()}
  return D},[zoomed,n]);
const zoomTo=z=>pg.evaluate(async z=>{if(z){window.__bbCf=camFocus;S.zoomIn=true;CAM.z=null;camFocus=function(Wd,Hd){return {r:CAM.fr,c:CAM.fc,x:Wd/2,y:Hd*0.5}};CAM.fr=6;CAM.fc=6;for(let i=0;i<14;i++){draw();await new Promise(r=>setTimeout(r,90))}}
  else{if(window.__bbCf)camFocus=window.__bbCf;S.zoomIn=false;CAM.z=null;for(let i=0;i<14;i++){draw();await new Promise(r=>setTimeout(r,90))}}},z);
const pool={flat:{on:[],off:[]},zoom:{on:[],off:[]}};
for(const m of ['flat','zoom']){await zoomTo(m==='zoom');for(let k=0;k<8;k++)for(const on of (k%2?[false,true]:[true,false])){await fill(on);pool[m][on?'on':'off'].push(...await block(m==='zoom',20))}}
await zoomTo(false);await pg.evaluate(()=>{BB100.set(true);FLAV.lineUntil=0});
const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return +s[Math.floor(p*(s.length-1))].toFixed(2)};const perf={};
for(const m of ['flat','zoom'])for(const [k,p] of [['p50',.5],['p95',.95]])perf[m+'_'+k]={on:q(pool[m].on,p),off:q(pool[m].off,p)};
console.log('PERF bubbles ON vs OFF (ms per frame: draw + layout, 160 frames each, interleaved)',JSON.stringify(perf));
/* his gate: draw p50 (unzoomed) and the zoomed frame p95 within 5% or 1 ms; the other two only catch a disaster (p95 on a shared box is noise) */
for(const [k,v] of Object.entries(perf)){const gate=k==='flat_p50'||k==='zoom_p95';ok(v.on<=(gate?Math.max(v.off*1.05,v.off+1):v.off*1.5+3),'9 '+k+(gate?' (gate)':'')+' ON '+v.on+' ms vs OFF '+v.off+' ms')}

/* ---------------- 3 Fast = no bubbles (chat stays) ---------------- */
const r3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=S.players;onlBubble80(1,Object.keys(ONLC.QC_TEXT||{})[1]||'x');SPEED='fast';bbTick();await W8(60);
  S.bubbles.push({id:9400,pid:P[2].id,text:'Fast words.',mood:'say',at:Date.now()});renderBubbles();FLAV.until=0;flaviusMood('cheer',2000,1);draw();await W8(60);
  const o={left:[...BB100.items.values()].map(x=>x.v),dom:document.querySelectorAll('#bb100 .b100:not(.ch)').length};SPEED='pause';return o});
ok(r3.left.every(v=>v==='ch')&&r3.dom===0,'3 Fast: no bubbles at all (chat excepted) '+JSON.stringify(r3));
const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors in the error log '+JSON.stringify(newErr));
if(process.env.SHOT){const fs=require('fs');fs.mkdirSync(process.env.SHOT,{recursive:true});await pg.screenshot({path:path.join(process.env.SHOT,'tv100bb.png')})}
await A.cx.close();

/* ---------------- 7 kill switch ---------------- */
{const K=await open({flavius_bubbles100off:'1'});await start(K.pg,4242,0);
  const k=await K.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));THOUGHTS=true;think(S.players[0],'Old bubble.','say');draw();await W8(60);
    return {old:document.querySelectorAll('#bubbles .bub').length,layer:!!document.getElementById('bb100'),on:BB100.on}});
  ok(k.old===1&&!k.layer&&!k.on,'7 kill switch: the old #bubbles are back '+JSON.stringify(k));await K.cx.close()}

/* ---------------- 8 the same dice and log ON vs OFF ---------------- */
const run=async off=>{const C=await open(off?{flavius_bubbles100off:'1'}:{});const okS=await start(C.pg,515151,0);
  const res=await C.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[],R=[];
    const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=8)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=8)R.push(e.turnNo+':'+RNG.s)});
    SPEED='normal';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    for(let i=0;i<1200&&!(S.over||S.turnNo>8);i++)await W8(100);clearInterval(iv);SPEED='pause';log=lb;offT();
    return {L,R,turn:S.turnNo,said:typeof BB100!=='undefined'?BB100.seq:0}});await C.cx.close();res.ok=okS;return res};
const ON=await run(false),OFF=await run(true);const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(ON.ok&&OFF.ok&&ON.R.length>=3,'8a both seeded runs played '+JSON.stringify([ON.R.length,OFF.R.length,ON.turn,OFF.turn,ON.said]));
ok(JSON.stringify(ON.R)===JSON.stringify(OFF.R),'8b same dice ON vs OFF '+JSON.stringify([ON.R.slice(0,3),OFF.R.slice(0,3)]));
{const a=fl(ON),c=fl(OFF);let i=0;while(i<a.length&&a[i]===c[i])i++;ok(a.length===c.length&&i===a.length,'8c same log ON vs OFF (first difference at '+i+'/'+a.length+': '+JSON.stringify([a[i],c[i]])+')')}

console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
