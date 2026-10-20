/* tools/bench/v108shots.js — v1.08 MOCK-UP PICTURES (tools/plans/v108/MOCKUP.md). The v1.06 forged bench scene (tools/bench/board.js SCENE:
   8 gladiators, 6 beasts, 12 pillars + jugs, chest, rubble, blood, the soldier mid-slash, a floating "−2", 9 move + 1 attack tile) PLUS an aim
   hover on the bear (396's red ring / outline / tag) and one speech bubble, frozen clock + seeded Math.random, one PNG of the board per
   variant × view × mode, and the highlight-contrast numbers (board.js CONTRAST) per shot.
     node tools/bench/v108shots.js <page> --out DIR [--variants off,torch,mat,depth,all] [--only desk,phone] [--json FILE]
   variant off = flag unset (today's board); torch/mat/depth = flavius_v108proto=<item>; all = flavius_v108proto=1.
   Also: --still = the torch flicker check (two frames 0.4 s apart, normal vs Reduce motion: pixels changed / identical). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const B=require('./board.js');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const OUT=opt('out','/tmp/v108shots'),VAR=String(opt('variants','off,torch,mat,depth,all')).split(','),ONLY=opt('only',''),JSONF=opt('json',''),STILL=A.includes('--still');
const LSV={off:{},torch:{flavius_v108proto:'torch'},mat:{flavius_v108proto:'mat'},depth:{flavius_v108proto:'depth'},all:{flavius_v108proto:'1'},
  safari:{flavius_v108proto:'1',flavius_v107safariforce:'1'},safarioff:{flavius_v107safariforce:'1'}};
const MODES=[{name:'day-flat'},{name:'day-zoom',zoom:1},{name:'night-flat',night:1},{name:'night-zoom',night:1,zoom:1}];
/* the aim hover on the bear at F-6 (5,5) + a speech bubble over the hero */
const EXTRA=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const bear=S.npcs.find(n=>n.alive&&!n.out&&n.r===5&&n.c===5);
  const base=computeHL;computeHL=function(){base.apply(this,arguments);const h=HL.get(5*N+5);if(h&&bear){h.target={r:5,c:5,ref:bear,kind:'npc'}}};draw();
  try{if(bear&&typeof AIM106!=='undefined'){AIM106.hov={k:5*N+5,r:5,c:5,ref:bear,body:false};AIM106.t0=performance.now()-9000}}catch(e){}
  try{const hero=S.players.findIndex(p=>p.cls==='hero');S.bubbles=[{id:90001,pid:S.players[hero].id,text:'Ave! Come closer, beast.',mood:'say',at:Date.now()}];renderBubbles()}catch(e){}
  for(let i=0;i<6;i++){BENCH.tick();draw();await W8(80)}
  return {aim:!!(typeof AIM106!=='undefined'&&AIM106.hov),bubbles:typeof BB100!=='undefined'?BB100.items.size:null}};
const HOV=()=>{const bear=S.npcs.find(n=>n.alive&&!n.out&&n.r===5&&n.c===5);if(bear&&typeof AIM106!=='undefined'){AIM106.hov={k:5*N+5,r:5,c:5,ref:bear,body:false};AIM106.t0=performance.now()-9000}draw();return typeof aim106Shown==='function'&&!!aim106Shown()};
const SUM=()=>{const g=cv.getContext('2d');const d=g.getImageData(0,0,cv.width,cv.height).data;let h=0;for(let i=0;i<d.length;i+=97)h=(h*31+d[i])|0;return h};
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);const b=await chromium.launch();fs.mkdirSync(OUT,{recursive:true});
  const res={page:path.basename(PAGE),at:new Date().toISOString(),shots:[],still:[]};const errs=[];
  for(const vk of Object.keys(B.VIEWS)){if(ONLY&&!ONLY.split(',').includes(vk))continue;
    for(const v of VAR){const cx=await b.newContext(B.VIEWS[vk]);await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
      await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in ls)localStorage.setItem(k,ls[k])},LSV[v]||{});
      const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(vk+' '+v+': '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text()))errs.push(vk+' '+v+' console: '+m.text().slice(0,200))});
      await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
      await pg.evaluate(B.SCENE);const ex=await pg.evaluate(EXTRA);
      for(const m of MODES){await pg.evaluate(B.SET,m);await pg.evaluate(EXTRA);await pg.evaluate(B.FREEZE);const c=await pg.evaluate(B.CONTRAST);const aim=await pg.evaluate(HOV);
        const f=path.join(OUT,`${v}_${vk}_${m.name}.png`);const el=await pg.evaluateHandle(()=>cv);await el.screenshot({path:f});
        const st=await pg.evaluate(()=>typeof V108!=='undefined'?JSON.parse(JSON.stringify(V108.st)):null);await pg.evaluate(B.THAW);
        res.shots.push({variant:v,view:vk,mode:m.name,file:path.basename(f),contrast:{mean:c.meanCR,min:c.minCR,tiles:c.tiles.map(t=>[t.tile,t.cr])},v108:st,extra:ex,aim});
        console.log(v.padEnd(6),vk,m.name.padEnd(10),'contrast mean',c.meanCR,'min',c.minCR,st?JSON.stringify(st):'')}
      if(STILL&&(v==='torch'||v==='all')){await pg.evaluate(B.SET,MODES[2]);
        const two=async rm=>pg.evaluate(async rm=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r0=SETTINGS.calm;if(rm)SETTINGS.calm=true;
          draw();const f0=(V108.lastF||[]).join(',');await W8(400);draw();const f1=(V108.lastF||[]).join(',');
          if(rm)SETTINGS.calm=r0;return {same:f0===f1,f0:f0.slice(0,60),f1:f1.slice(0,60)}},rm);
        /* the flame factors of the rim lights (V108.lastF) in two frames 0.4 s apart: they must differ normally and be identical under Reduce motion */
        const r1=await two(false),r2=await two(true);res.still.push({variant:v,view:vk,normal:r1,reduceMotion:r2});console.log('still',v,vk,'flicker normal',JSON.stringify(r1),'reduce motion',JSON.stringify(r2))}
      await cx.close()}}
  console.log('ERRS',JSON.stringify(errs));if(JSONF)fs.writeFileSync(JSONF,JSON.stringify(res,null,1));await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
