/* arena2_cost.js — round 2 draw costs: today vs the per-arena look (Roma bronze, Thysdrus balustrade, Leptis parapet),
   interleaved over 4 rounds (medians), desktop 1440×900 dpr 1 + phone 844×390 dpr 2; plus each WebP's load+decode time alone. */
const L=require('./arena_lib');const fs=require('fs');const D=__dirname+'/';const SRC=fs.readFileSync(D+'arena2_proto.js','utf8');
async function run(pg){const out={};for(const k of [6,5,9]){await pg.evaluate(()=>{if(S)S.over=true});await L.startAt(pg,k,3);await pg.evaluate(SRC);await pg.evaluate(()=>A2P.preload());
    const acc={off:[],on:[]};for(let r=0;r<4;r++)for(const on of [false,true]){const c=await pg.evaluate(on=>{A2P.set(on);return A2P.cost(6)},on);acc[on?'on':'off'].push(c)}
    const med=a=>{a=a.slice().sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1)};out[k]={};
    for(const t of ['off','on'])out[k][t]={cachedMs:med(acc[t].map(c=>c.cached)),rebuildMs:med(acc[t].map(c=>c.rebuild)),underBakeMs:med(acc[t].map(c=>c.under)),topBakeMs:med(acc[t].map(c=>c.top))}}
  return out}
(async()=>{const {b,pg}=await L.open();const desk=await run(pg);
  const dec=await pg.evaluate(async()=>{const o={};for(const [k,a] of Object.entries(A2P.A2)){const u=A2P.dir+k+'_'+a.key+'.webp'+'?n='+Math.random();const t0=performance.now();const im=new Image();im.src=u;await im.decode();o[a.key]=+(performance.now()-t0).toFixed(1)}return o});
  const ph=await L.open({browser:b,phone:true});const phone=await run(ph.pg);
  const sizes=JSON.parse(fs.readFileSync(D+'arena2_tex/sizes.json'));
  const res={note:'ms, headless Chromium (software canvas). off = today (v0.99), on = round-2 look. cached = one draw() with the layers baked; rebuild = one draw() after AR91.ver++ (re-bakes under/deco/top/light).',desktop1440:desk,phone844x390dpr2:phone,webpDecodeMs:dec,webpKB:sizes};
  fs.writeFileSync(D+'arena2_costs.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res));await b.close()})();
