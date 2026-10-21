/* tools/bench/dprdrop.js — v1.08c item 0a lead: does anything cached at the OLD device ratio draw at its old pixel size after 406 W1
   drops the board from 1.5× to 1× mid-visit (Safari: slow frames)? The WebKit path in Chromium (flavius_v107safariforce=1), DPR 2 screen
   (cap 1.5), a live match with every system beast's corpse beside a living one of its kind (like tv107g 5), zoom --z, Lighting --light;
   then W1's drop (W1.dropped = true, as 406 does after slow frames) and the same frames again. Prints, per beast kind, the corpse's and the
   living beast's drawn size (css px, from the native drawImage calls of one frame, outside every wrapper) before / after, 404's own
   measure (CV107.lastSz / stats), the device ratio and the board size; writes two screenshots (--shots DIR) to compare by eye.
     node tools/bench/dprdrop.js <page> [--z 1|1.4|2] [--light full|light|off] [--night 1|0] [--bases on|off] [--x2 1] [--early 1] [--shots DIR] [--json FILE] */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]);const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);const b=await chromium.launch();
  const cx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  const LS={flavius_firstrun:'shown',flavius_first100off:'1',flavius_light106auto:'0',flavius_light106:opt('light','full'),flavius_v107safariforce:'1'};if(opt('x2','')==='1')LS.flavius_x2force='1';
  await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});for(const k in ls)localStorage.setItem(k,ls[k])},LS);
  const pg=await cx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  await pg.evaluate(async o=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{menuHide()}catch(e){}
    W1.slowMs=1e9;   /* no automatic drop: this script drops it below */
    SETTINGS.briefing=false;if(!o.bases){SETTINGS.bases101=false;applySettings()}
    startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
    if(o.night)S.night=true;await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    SPEED='normal';XRAY='off';S.npcs=S.npcs.filter(n=>n.alive);S.npcs.forEach(n=>{n.r=0;n.c=12});S.players.forEach((q,i)=>{q.r=12;q.c=i});
    const kinds=[['bear','Ursa'],['wolf','Valencia'],['lion','Leo'],['tholo','Tholo'],['snake','Glykon'],['zora','Zora']];window.__pairs=[];
    kinds.forEach(([t,k],i)=>{const a=mkNPC(t,k,1+i*2,3),d=mkNPC(t,k,1+i*2,8);S.npcs.push(a,d);__pairs.push([a,d])});
    if(o.z>1.01){S.zoomIn=true;if(o.z>=1.9)CAM.z=o.z}for(let i=0;i<8;i++){draw();await W8(120)}
    for(const [a,d] of __pairs){d.alive=false;try{BUS.emit('hit',{target:{id:d.id,name:d.name,npc:true},amount:9,after:{hp:0}})}catch(e){}}
    if(o.early){await W8(250);W1.dropped=true;P107S.st.dprDrop++}   /* --early 1: the drop while 312's die rows play */
    for(let i=0;i<30;i++){draw();await W8(150)}},{early:opt('early','')==='1',z:+opt('z',1),bases:opt('bases','on')!=='off',night:opt('night','1')==='1'});
  /* one frame's native draws per beast (css px = device px / the canvas's device ratio) */
  const measure=()=>pg.evaluate(()=>{const real=CanvasRenderingContext2D.prototype.drawImage,bn=BS101.nat;let cur=null;const rec=new Map();
    const tap=function(img){if(cur&&this===ctx&&!img._l106){try{const A=arguments;let dw,dh;if(A.length>=9){dw=A[7];dh=A[8]}else if(A.length>=5){dw=A[3];dh=A[4]}else{dw=img.width;dh=img.height}
        const m=this.getTransform(),k=Math.hypot(m.a,m.b);(rec.get(cur)||rec.set(cur,[]).get(cur)).push({w:dw*k,h:dh*k,iw:img.width,ih:img.height,kind:img.constructor.name,ga:this.globalAlpha})}catch(e){}}return real.apply(this,arguments)};
    const dn=drawNPC,dc=drawCorpseFig;const dead=S.npcs.filter(n=>!n.alive&&!n.gone);BS101.nat=tap;CanvasRenderingContext2D.prototype.drawImage=tap;
    drawNPC=function(n){const k=cur;cur=n.alive?n:cur;try{return dn.apply(this,arguments)}finally{cur=k}};
    drawCorpseFig=function(m){const k=cur;cur=dead.find(n=>{const c=center(n.r,n.c);return Math.abs(c.x-m.x)<0.5&&Math.abs(c.y-m.y)<0.5})||null;try{return dc.apply(this,arguments)}finally{cur=k}};
    try{draw()}finally{BS101.nat=bn;CanvasRenderingContext2D.prototype.drawImage=real;drawNPC=dn;drawCorpseFig=dc}
    const dpr=devicePixelRatio,big=L=>{L=(L||[]).filter(q=>q.ga>0.5);if(!L.length)return null;const q=L.reduce((p,q)=>q.w*q.h>p.w*p.h?q:p);return {css:+(q.w/dpr).toFixed(1)+'x'+(q.h/dpr).toFixed(1),src:q.iw+'x'+q.ih,kind:q.kind}};
    return {dpr,cv:cv.width+'x'+cv.height,tw:+TW.toFixed(1),dropped:W1.dropped,stats:{...CV107.stats},bad:[...CV107.bad],
      beasts:__pairs.map(([a,d])=>({t:a.t,live:big(rec.get(a)),dead:big(rec.get(d))}))}});
  const before=await measure();const shots=opt('shots','');if(shots){fs.mkdirSync(shots,{recursive:true});await pg.screenshot({path:path.join(shots,'before.png')})}
  /* 406 W1's drop (as after 40 slow drawn frames) */
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));W1.dropped=true;P107S.st.dprDrop++;for(let i=0;i<20;i++){draw();await W8(120)}});
  const after=await measure();if(shots)await pg.screenshot({path:path.join(shots,'after.png')});
  const out={z:+opt('z',1),night:opt('night','1'),light:opt('light','full'),bases:opt('bases','on'),before,after};
  for(const s of ['before','after']){const r=out[s];console.log(`${s}: dpr ${r.dpr} board ${r.cv} TW ${r.tw} 404 ${JSON.stringify(r.stats)} bad ${JSON.stringify(r.bad)}`);
    for(const e of r.beasts)console.log(`   ${e.t.padEnd(6)} living ${JSON.stringify(e.live)}  corpse ${JSON.stringify(e.dead)}`)}
  if(opt('json',''))fs.writeFileSync(opt('json',''),JSON.stringify(out,null,1));console.log('ERRS',JSON.stringify(errs));await b.close()})().catch(e=>{console.error(e);process.exit(2)});
