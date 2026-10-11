/* arena2_shots.js — round 2 shots: all 12 arenas (zoomed out + left tower corner zoomed in + panel sample with the
   proposed palette), corner close-ups (before vs after, 3 rail families), phones, draw costs → arena2_costs.json, arena2_pal.json.
   node arena2_shots.js [k…]  (default all) */
const L=require('./arena_lib');const fs=require('fs');const D=__dirname+'/';const SRC=fs.readFileSync(D+'arena2_proto.js','utf8');
const PAL=require('./arena2_pal_prop.js');
const KEYS=['','syracusae','verona','arles','capua','thysdrus','roma','nemausus','pompeii','leptis','uthina','pola','puteoli'];
const only=process.argv.slice(2).map(Number).filter(Boolean);const ARENAS=only.length?only:[1,2,3,4,5,6,7,8,9,10,11,12];
async function setup(pg,k){await pg.evaluate(()=>{if(S)S.over=true});await L.startAt(pg,k,4);await pg.evaluate(SRC);await pg.evaluate(()=>A2P.preload());
  /* the proposed palette: the full arena preset (ui + board) with the proposal's changes */
  const th=await pg.evaluate(([k,ch])=>{const p=THEMES99.P[k];applyTheme({...THEME,...p.ui,...p.board,...(ch.ui||{}),...(ch.board||{}),arena99:+k},false);A2P.set(true);
    const o={};for(const x of ['ink','panel','panel2','line2','bone','muted','gold','gold2','blood','blood2','tileA','tileB','rim','grid','standA','standB','pillar','pillarBase'])o[x]=THEME[x];return o},[k,PAL[k]||{}]);
  await pg.evaluate(()=>{const n=N-1;const al=S.players.filter(p=>p.alive!==false&&p.r!=null);[[n,5],[8,n],[n,n],[n,9]].forEach((s,i)=>{if(al[i]){al[i].r=s[0];al[i].c=s[1]}});S.cur=S.players.indexOf(al[2]);draw()});
  return th}
async function clr(pg){await pg.evaluate(()=>{for(const id of ['cardShow','bubbles','wbubs']){const e=document.getElementById(id);if(e)e.innerHTML=''}try{S.bubbles=[];S.emotes=[]}catch(e){}const t=document.getElementById('tip');if(t)t.style.display='none'})}
async function at(pg,r,c,z){await pg.evaluate(([r,c,z])=>{const p=cur();p.r=r;p.c=c;CAM.z=z>1?z:null;S.zoomIn=z>1;CAM.fr=null;try{S.bubbles=[]}catch(e){}draw();draw()},[r,c,z]);await pg.waitForTimeout(200);await pg.evaluate(()=>draw())}
/* the before look has no A2P geometry: compute it with the proto off by painting once with it on, then off */
async function closeBefore(pg,file,tag){await pg.evaluate(()=>{A2P.set(true)});await pg.evaluate(()=>{const keep=A2P.last;A2P.set(false);A2P.last=keep});await close(pg,file,tag)}
async function close(pg,file,tag){const r=await pg.evaluate(tag=>{draw();const G=A2P.last;const b=cv.getBoundingClientRect();if(!G)return null;let x,y;
    if(tag==='L'){x=G.towers[0].x+G.k;y=G.towers[0].yf}else if(tag==='R'){x=G.towers[1].x-G.k;y=G.towers[1].yf}
    else if(tag==='B'){const R=G.edges[0];x=R.corner.x;y=R.yAt(x)}else{const R=G.edges.find(e=>e.left)||G.edges[0];x=(R.runs[0][1]+R.runs[1][0])/2;y=R.yAt(x)}
    return {x:b.x+x,y:b.y+y,bx:b.x,by:b.y,bw:b.width,bh:b.height}},tag);if(!r)return;
  const w=300,h=190;let x=Math.round(r.x-w/2),y=Math.round(r.y-h*0.62);x=Math.max(r.bx,Math.min(x,r.bx+r.bw-w));y=Math.max(r.by,Math.min(y,r.by+r.bh-h));
  await clr(pg);await pg.screenshot({path:file,clip:{x,y,width:w,height:h}})}
(async()=>{const {b,pg,errs}=await L.open();const costs={},pals={};const n=12;
  for(const k of ARENAS){const th=await setup(pg,k);pals[k]=th;const nm=`arena2_${k}_${KEYS[k]}`;
    await L.zoom(pg,1);await clr(pg);await L.canvasShot(pg,D+nm+'_out.png');
    const box=await pg.evaluate(()=>{const e=document.querySelector('aside.side');const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:Math.min(r.height,430)}});
    await clr(pg);await pg.screenshot({path:D+nm+'_panel.png',clip:box});
    costs[k]=await pg.evaluate(()=>A2P.cost(6));
    await at(pg,n,0,2.3);await clr(pg);await L.canvasShot(pg,D+nm+'_corner.png');
    /* corner close-ups for the three rail families (+ the round-1 / today look for Roma) */
    if([6,5,9].includes(k)){for(const [tag,r,c] of [['L',n,0],['R',0,n],['B',n,n],['gap',n,6]]){await at(pg,r,c,2.4);await close(pg,D+`arena2_close_${KEYS[k]}_${tag}.png`,tag)}
      if(k===6){await pg.evaluate(()=>A2P.set(false));for(const [tag,r,c] of [['L',n,0],['R',0,n],['B',n,n]]){await at(pg,r,c,2.4);await closeBefore(pg,D+`arena2_close_before_${tag}.png`,tag)}
        await at(pg,n,n,1);costs.before=await pg.evaluate(()=>A2P.cost(6));await pg.evaluate(()=>A2P.set(true))}}
    await at(pg,n,n,1)}
  costs.decodeMs=await pg.evaluate(()=>A2P.ms);
  /* phones: one per rail family */
  if(!only.length){const ph=await L.open({browser:b,phone:true});for(const k of [6,5,9]){await setup(ph.pg,k);await clr(ph.pg);await ph.pg.screenshot({path:D+`arena2_phone_${KEYS[k]}.png`});costs['phone'+k]=await ph.pg.evaluate(()=>A2P.cost(4))}
    await ph.pg.evaluate(()=>A2P.set(false));costs.phoneBefore=await ph.pg.evaluate(()=>A2P.cost(4));errs.push(...ph.errs)}
  const old=fs.existsSync(D+'arena2_costs.json')?JSON.parse(fs.readFileSync(D+'arena2_costs.json')):{};const oldp=fs.existsSync(D+'arena2_pal.json')?JSON.parse(fs.readFileSync(D+'arena2_pal.json')):{};
  fs.writeFileSync(D+'arena2_costs.json',JSON.stringify({...old,...costs},null,1));fs.writeFileSync(D+'arena2_pal.json',JSON.stringify({...oldp,...pals},null,1));
  console.log(JSON.stringify(costs));console.log('ERRS',errs.slice(0,5));await b.close()})();
