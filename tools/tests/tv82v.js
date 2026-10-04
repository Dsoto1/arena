/* v0.82 visual fixes (130-v82vis): pillar shadows the width of the base (3D minis and the classic pillar), floor spikes in
   iron and bronze (not blue), and pieces that turn to face what they attack (players via doAttack, beasts via defend),
   visual only (onlHash untouched). SHOTS=dir saves vis_*.png. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const r={};
  SETTINGS.tokenStyle='standee';SETTINGS.mini3d=true;applySettings();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});
  await W8(2600);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}S.over=true;await W8(1200);
  for(let i=0;i<20&&!(MINI_IMG.pillar&&MINI_IMG.pillar.complete);i++)await W8(150);
  /* 1. pillar shadows */
  PILLAR_SHADOW82=null;draw();r.mini=PILLAR_SHADOW82&&{...PILLAR_SHADOW82};
  SETTINGS.mini3d=false;SETTINGS.tokenStyle='figure';applySettings();PILLAR_SHADOW82=null;draw();r.classic=PILLAR_SHADOW82&&{...PILLAR_SHADOW82};
  for(const st of ['cylinder','panel']){SETTINGS.tokenStyle=st;applySettings();PILLAR_SHADOW82=null;draw();r[st]=PILLAR_SHADOW82&&{...PILLAR_SHADOW82}}
  /* the mini pillar's real base: 30 mm footprint at its scale */
  r.miniBase=MINI_A.pillar[2]*MINI_PXMM*miniScale('pillar');
  /* 2. spikes: the palette, and a pixel of the plate on the canvas */
  const blue=h=>{const m=/^#(..)(..)(..)$/.exec(h);if(!m)return false;const [R,G,B]=[1,2,3].map(i=>parseInt(m[i],16));return B>R+8&&B>G};
  r.plateCol=SPIKE82.plate;r.pal=Object.entries(SPIKE82).filter(([k,v])=>blue(v)).map(([k])=>k);
  SETTINGS.tokenStyle='figure';applySettings();S.spikes=SPIKE_SPOTS.map(([a,c])=>({r:a,c}));draw();
  /* the fills actually used on a raised and a sunk spike tile (the canvas is tainted on file://, so the fills are recorded) */
  const s=S.spikes[0];const fills=[];const of=ctx.fill;ctx.fill=function(){fills.push(typeof ctx.fillStyle==='string'?ctx.fillStyle:'grad');return of.apply(this,arguments)};
  try{drawSpikeTile(s,1);r.up=fills.splice(0);drawSpikeTile(s,0);r.down=fills.splice(0)}finally{delete ctx.fill}
  const rgb=v=>{let m=/^#(..)(..)(..)$/.exec(v);if(m)return [1,2,3].map(i=>parseInt(m[i],16));m=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);return m?[+m[1],+m[2],+m[3]]:null};
  r.blueFills=[...r.up,...r.down].filter(v=>{const c=rgb(v);return c&&c[2]>c[0]+8&&c[2]>c[1]});
  /* 3. facing */
  const p=S.players[0],n=S.npcs.find(x=>x.alive&&x.t==='bear')||S.npcs.find(x=>x.alive);S.over=false;
  p.r=6;p.c=3;p.alive=true;n.r=5;n.c=4;n.hp=99;p._fr=null;miniFace(p,'soldier');r.f0=p._face;
  const h0=onlHash();r.hashSame=(face82(p,{r:7,c:3}),onlHash())===h0;
  p._face=0;const src=attackSources(p)[0]||{w:p.wR,arm:'R'};
  await doAttack(p,src,{kind:'npc',ref:n,r:n.r,c:n.c,key:'n'+n.id});
  const want=(a,b)=>{const ang=Math.atan2((b.c-a.c)-(b.r-a.r),(b.c-a.c)+(b.r-a.r))*180/Math.PI;let best=0,bd=1e9;MINI_YAW.forEach((y,i)=>{const d=Math.abs(((ang-y)%360+540)%360-180);if(d<bd){bd=d;best=i}});return best};
  r.f1=p._face;r.w1=want(p,n);
  /* the step after keeps turning */
  p.r=6;p.c=4;miniFace(p,'soldier');r.stepTurn=p._face===want({r:6,c:3},{r:6,c:4});p.r=6;p.c=3;p._fr=6;p._fc=3;
  /* a beast's blow (npcAct → defend) turns the beast */
  n.r=7;n.c=3;n._face=0;n._fr=n.r;n._fc=n.c;p.warded=false;await npcAct(n,p,true);r.n1=n._face;r.wn=want(n,p);
  /* a tamed beast's attack */
  const z=S.npcs.find(x=>x.alive&&x!==n);if(z){z.r=6;z.c=5;z._face=0;z._fr=6;z._fc=5;await tamedAttack(z,p,{kind:'npc',ref:n,r:n.r,c:n.c});r.z1=z._face;r.wz=want(z,n)}
  S.over=true;return r});
const a=o.a;const rgbDark=h=>parseInt(h.slice(1,3),16)<120;
ok(a.mini&&a.mini.w<=a.mini.base*1.1&&Math.abs(a.mini.base-a.miniBase)<0.5,'mini pillar shadow ≤1.1× its base '+JSON.stringify(a.mini));
for(const k of ['classic','cylinder','panel'])ok(a[k]&&a[k].w<=a[k].base*1.1,k+' pillar shadow ≤1.1× its base');
ok(!a.pal.length,'spike palette not blue '+a.pal);
ok(!a.blueFills.length&&a.up.length>a.down.length&&a.down.length>=5,'spike fills not blue, raised has tips '+JSON.stringify([a.blueFills,a.up.length,a.down.length]));
ok(a.up.includes('grad')&&rgbDark(a.plateCol),'the plate is dark iron');
ok(a.hashSame,'facing is not in onlHash');
ok(a.f1===a.w1&&a.f1!==0,'attacker faces its target '+a.f1+'/'+a.w1);ok(a.stepTurn,'a step still turns the piece');
ok(a.n1===a.wn,'a beast faces the gladiator it attacks '+a.n1+'/'+a.wn);ok(a.z1==null||a.z1===a.wz,'a tamed beast faces its target');
if(shots){await pg.evaluate(()=>{SETTINGS.tokenStyle='standee';SETTINGS.mini3d=true;applySettings();draw()});await pg.waitForTimeout(800);await pg.screenshot({path:shots+'/vis_board.png'})}
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
